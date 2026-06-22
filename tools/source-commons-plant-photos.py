import argparse
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DATA_FILE = PUBLIC / "data" / "plant-library-expanded.json"
CREDITS_FILE = PUBLIC / "data" / "plant-image-credits.json"
REPORT_FILE = PUBLIC / "data" / "plant-image-sourcing-report.json"
OUTPUT_DIR = PUBLIC / "assets" / "images" / "commons-plants"

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AtHomeGrower legal plant photo sourcing/1.0 (https://athomegrower.com; Wikimedia Commons API)"
TARGET_SIZE = (800, 600)
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
DISQUALIFY_PATTERNS = [
    r"\bherbarium\b",
    r"\bspecimen\b",
    r"\bpressed\b",
    r"\billustration\b",
    r"\bdrawing\b",
    r"\bdiagram\b",
    r"\bmap\b",
    r"\bpainting\b",
    r"\bicon\b",
    r"\bstamp\b",
    r"\bpostage\b",
    r"\bcolnect\b",
    r"\blabel\b",
    r"\bpackage\b",
    r"\bpackaging\b",
    r"\bposter\b",
    r"\blogo\b",
    r"\bprodromus\b",
    r"\bflorae\b",
    r"\bmonograph\b",
    r"\bseed packet\b",
    r"\bseeds? only\b",
    r"\bbook scan\b",
    r"\bscanned page\b",
    r"\btext page\b",
    r"\btexture pack\b",
    r"\bwikibooks\b",
]


def strip_tags(value):
    value = html.unescape(str(value or ""))
    value = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\s+", " ", value).strip()


def slug_words(value):
    return [part for part in re.split(r"[^a-z0-9]+", str(value or "").lower()) if part and len(part) > 1]


def clean_botanical(value):
    value = strip_tags(value)
    value = re.sub(r"\b(spp?|var|cv)\.?\b", "", value, flags=re.I)
    value = re.sub(r"\s+", " ", value).strip(" .")
    return value


def commons_request(params, timeout, retries=3):
    encoded = urllib.parse.urlencode(params)
    request = urllib.request.Request(f"{COMMONS_API}?{encoded}", headers={"User-Agent": USER_AGENT})
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt >= retries:
                raise
            time.sleep(8 * (attempt + 1))


def download_bytes(url, timeout):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def meta_value(extmetadata, key):
    item = extmetadata.get(key) or {}
    return strip_tags(item.get("value", ""))


def license_allowed(extmetadata):
    license_short = meta_value(extmetadata, "LicenseShortName")
    license_name = meta_value(extmetadata, "License")
    usage_terms = meta_value(extmetadata, "UsageTerms")
    license_url = meta_value(extmetadata, "LicenseUrl")
    combined = " ".join([license_short, license_name, usage_terms, license_url]).lower()

    blocked_terms = ["noncommercial", "non-commercial", "no derivatives", "nonderivative", "fair use", "copyrighted"]
    if any(term in combined for term in blocked_terms):
        return None
    if re.search(r"\bcc\s*by\s*-\s*nc\b|\bcc-by-nc\b|\bby-nc\b|\bcc\s*by\s*-\s*nd\b|\bcc-by-nd\b|\bby-nd\b", combined):
        return None
    if "cc0" in combined:
        return {"kind": "cc0", "short": license_short or "CC0", "url": license_url or "https://creativecommons.org/publicdomain/zero/1.0/"}
    if "public domain" in combined or "pd-" in combined or "pd " in combined:
        return {"kind": "public-domain", "short": license_short or usage_terms or "Public domain", "url": license_url}
    if re.search(r"\bcc\s*by\s*-\s*sa\b|\bcc-by-sa\b|/licenses/by-sa/", combined):
        return {"kind": "cc-by-sa", "short": license_short or "CC BY-SA", "url": license_url}
    if re.search(r"\bcc\s*by\b|\bcc-by\b|/licenses/by/", combined):
        return {"kind": "cc-by", "short": license_short or "CC BY", "url": license_url}
    return None


def search_queries(plant):
    name = strip_tags(plant.get("name", ""))
    botanical = clean_botanical(plant.get("botanicalName", ""))
    category = strip_tags(plant.get("plantTypeCategory", ""))
    plant_type = strip_tags(plant.get("plantType", ""))
    queries = []
    if botanical:
        queries.append(f'"{botanical}" plant')
        queries.append(f'{botanical} {name} plant')
    if name:
        queries.append(f'"{name}" plant')
        queries.append(f'{name} {plant_type} plant')
    if category in {"vegetables", "fruits", "herbs", "cover-crops"} and name:
        queries.append(f'{name} plant leaves')
    seen = set()
    unique = []
    for query in queries:
        query = re.sub(r"\s+", " ", query).strip()
        if query and query.lower() not in seen:
            seen.add(query.lower())
            unique.append(query)
    return unique


def candidate_score(plant, candidate):
    title = candidate["title"].lower()
    description = candidate["description"].lower()
    searchable = f"{title} {description}"
    name = strip_tags(plant.get("name", "")).lower()
    botanical = clean_botanical(plant.get("botanicalName", "")).lower()
    plant_words = set(slug_words(f"{name} {botanical} {plant.get('plantType', '')} {plant.get('foliageType', '')}"))
    score = 0

    if botanical and botanical in searchable:
        score += 90
    botanical_parts = [word for word in slug_words(botanical) if word not in {"spp", "sp"}]
    score += len(set(botanical_parts) & set(slug_words(searchable))) * 15
    score += len(plant_words & set(slug_words(searchable))) * 7

    if any(term in searchable for term in ["potted", "pot plant", "houseplant", "container plant", "in pot"]):
        score += 22
    if " plant" in searchable or "plant " in searchable:
        score += 8
    if candidate["licenseKind"] in {"cc0", "public-domain"}:
        score += 4

    if any(re.search(pattern, searchable) for pattern in DISQUALIFY_PATTERNS):
        return -1000

    penalties = [
        (["fruit market", "cut fruit", "peeled"], 35),
    ]
    for terms, points in penalties:
        if any(term in searchable for term in terms):
            score -= points

    if candidate["title"].lower().endswith((".svg", ".gif", ".tif", ".tiff", ".pdf")):
        score -= 100
    return score


def commons_file_page(title):
    return f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'), safe=':/_')}"


def search_commons(plant, timeout, search_limit, max_queries):
    candidates = []
    for query in search_queries(plant)[:max_queries]:
        params = {
            "action": "query",
            "format": "json",
            "origin": "*",
            "generator": "search",
            "gsrnamespace": 6,
            "gsrlimit": search_limit,
            "gsrsearch": query,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1200,
            "iilimit": 1,
        }
        try:
            data = commons_request(params, timeout)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            return [], f"api-error: {error}"
        pages = (data.get("query") or {}).get("pages") or {}
        for page in pages.values():
            info = (page.get("imageinfo") or [{}])[0]
            extmetadata = info.get("extmetadata") or {}
            title = page.get("title", "")
            mime = info.get("mime", "")
            if mime not in ALLOWED_MIME:
                continue
            if title.lower().endswith((".svg", ".gif", ".tif", ".tiff", ".pdf")):
                continue
            license_info = license_allowed(extmetadata)
            if not license_info:
                continue
            description = " ".join([
                meta_value(extmetadata, "ObjectName"),
                meta_value(extmetadata, "ImageDescription"),
                meta_value(extmetadata, "Categories"),
            ])
            candidate = {
                "query": query,
                "title": title,
                "mime": mime,
                "url": info.get("url", ""),
                "thumbUrl": info.get("thumburl") or info.get("url", ""),
                "filePageUrl": commons_file_page(title),
                "author": meta_value(extmetadata, "Artist") or meta_value(extmetadata, "Author"),
                "credit": meta_value(extmetadata, "Credit"),
                "description": description,
                "licenseShortName": license_info["short"],
                "licenseKind": license_info["kind"],
                "licenseUrl": license_info["url"],
            }
            candidate["score"] = candidate_score(plant, candidate)
            candidates.append(candidate)
    deduped = {}
    for candidate in candidates:
        existing = deduped.get(candidate["title"])
        if not existing or candidate["score"] > existing["score"]:
            deduped[candidate["title"]] = candidate
    return sorted(deduped.values(), key=lambda item: item["score"], reverse=True), ""


def save_image(candidate, out_path, timeout):
    raw = download_bytes(candidate["thumbUrl"] or candidate["url"], timeout)
    tmp_path = out_path.with_suffix(".download")
    tmp_path.write_bytes(raw)
    try:
        with Image.open(tmp_path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image = ImageOps.fit(image, TARGET_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.48))
            image.save(out_path, "WEBP", quality=84, method=6)
    except (UnidentifiedImageError, OSError) as error:
        raise RuntimeError(f"image-error: {error}") from error
    finally:
        tmp_path.unlink(missing_ok=True)


def update_html_references(replacements):
    if not replacements:
        return 0
    changed = 0
    for path in PUBLIC.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        next_text = text
        for old, new in replacements.items():
            next_text = next_text.replace(old, new)
        if next_text != text:
            path.write_text(next_text, encoding="utf-8")
            changed += 1
    return changed


def load_existing_credits():
    if not CREDITS_FILE.exists():
        return {}
    data = json.loads(CREDITS_FILE.read_text(encoding="utf-8"))
    return {photo.get("plantId") or photo.get("plantSlug"): photo for photo in data.get("photos", [])}


def build_credit(plant, plant_key, out_url, best, checked_at):
    return {
        "plantId": plant_key,
        "plantSlug": plant.get("slug"),
        "plantName": plant.get("name"),
        "botanicalName": plant.get("botanicalName"),
        "category": plant.get("plantTypeCategory"),
        "factsUrl": plant.get("factsUrl"),
        "localImage": out_url,
        "title": best["title"].replace("File:", "", 1),
        "commonsTitle": best["title"],
        "author": best["author"] or best["credit"] or "Wikimedia Commons contributor",
        "credit": best["credit"],
        "source": "Wikimedia Commons",
        "filePageUrl": best["filePageUrl"],
        "originalUrl": best["url"],
        "licenseShortName": best["licenseShortName"],
        "licenseKind": best["licenseKind"],
        "licenseUrl": best["licenseUrl"],
        "modification": "Cropped/resized to 800x600 WebP for plant cards; no plant-content edits.",
        "matchScore": best["score"],
        "searchQuery": best["query"],
        "checkedAt": checked_at,
    }


def process_plant(plant, args, checked_at):
    plant_key = plant.get("id") or plant.get("slug")
    out_url = f"/assets/images/commons-plants/{plant['plantTypeCategory']}-{plant['slug']}.webp"
    out_path = PUBLIC / out_url.lstrip("/")

    candidates, error = search_commons(plant, args.timeout, args.search_limit, args.max_queries)
    best = candidates[0] if candidates else None
    if error or not best or best["score"] < args.min_score:
        if args.sleep:
            time.sleep(args.sleep)
        return {
            "status": "miss",
            "plant": plant,
            "miss": {
                "name": plant.get("name"),
                "botanicalName": plant.get("botanicalName"),
                "category": plant.get("plantTypeCategory"),
                "reason": error or "no-safe-confident-match",
                "bestCandidate": best and {
                    "title": best["title"],
                    "score": best["score"],
                    "license": best["licenseShortName"],
                    "filePageUrl": best["filePageUrl"],
                },
            },
        }

    if not args.dry_run:
        try:
            save_image(best, out_path, args.timeout)
        except RuntimeError as error:
            if args.sleep:
                time.sleep(args.sleep)
            return {
                "status": "miss",
                "plant": plant,
                "miss": {
                    "name": plant.get("name"),
                    "botanicalName": plant.get("botanicalName"),
                    "category": plant.get("plantTypeCategory"),
                    "reason": str(error),
                    "bestCandidate": {"title": best["title"], "score": best["score"], "filePageUrl": best["filePageUrl"]},
                },
            }

    if args.sleep:
        time.sleep(args.sleep)
    return {
        "status": "accepted",
        "plant": plant,
        "plantKey": plant_key,
        "oldUrl": plant.get("image", ""),
        "newUrl": out_url,
        "credit": build_credit(plant, plant_key, out_url, best, checked_at),
        "accepted": {
            "name": plant.get("name"),
            "botanicalName": plant.get("botanicalName"),
            "title": best["title"],
            "score": best["score"],
            "license": best["licenseShortName"],
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Source legally reusable plant photos from Wikimedia Commons.")
    parser.add_argument("--limit", type=int, default=0, help="Maximum plants to process. 0 means all.")
    parser.add_argument("--start", type=int, default=0, help="Start index in the plant list.")
    parser.add_argument("--category", default="", help="Only process one plantTypeCategory.")
    parser.add_argument("--slugs", default="", help="Comma-separated plant slugs to process.")
    parser.add_argument("--overwrite", action="store_true", help="Re-source plants that already have a Commons credit.")
    parser.add_argument("--min-score", type=int, default=28, help="Minimum candidate confidence score.")
    parser.add_argument("--search-limit", type=int, default=10, help="Commons search results per query.")
    parser.add_argument("--max-queries", type=int, default=2, help="Maximum search query variants per plant.")
    parser.add_argument("--sleep", type=float, default=0.25, help="Delay between plants.")
    parser.add_argument("--timeout", type=float, default=20.0, help="Network timeout seconds.")
    parser.add_argument("--dry-run", action="store_true", help="Search and report without downloading or editing files.")
    parser.add_argument("--progress-every", type=int, default=25, help="Print progress every N processed plants.")
    parser.add_argument("--workers", type=int, default=6, help="Concurrent Commons workers.")
    args = parser.parse_args()

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    plants = data["plants"]
    existing_credits = load_existing_credits()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    slug_filter = {slug.strip() for slug in args.slugs.split(",") if slug.strip()}
    selected = [
        plant for plant in plants[args.start:]
        if not args.category or plant.get("plantTypeCategory") == args.category
    ]
    if slug_filter:
        selected = [plant for plant in selected if plant.get("slug") in slug_filter]
    if args.limit:
        selected = selected[:args.limit]

    replacements = {}
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "Wikimedia Commons API",
        "acceptedLicenses": ["Public domain", "CC0", "CC BY", "CC BY-SA"],
        "processed": 0,
        "downloaded": 0,
        "skippedExisting": 0,
        "misses": [],
        "accepted": [],
    }

    work_items = []
    selected_position = 0
    for plant in selected:
        selected_position += 1
        plant_key = plant.get("id") or plant.get("slug")
        out_url = f"/assets/images/commons-plants/{plant['plantTypeCategory']}-{plant['slug']}.webp"
        out_path = PUBLIC / out_url.lstrip("/")
        if not args.overwrite and plant_key in existing_credits and out_path.exists():
            report["skippedExisting"] += 1
            if args.progress_every and selected_position % args.progress_every == 0:
                print(f"progress selected={selected_position}/{len(selected)} processed={report['processed']} downloaded={report['downloaded']} misses={len(report['misses'])} skipped={report['skippedExisting']}", flush=True)
            continue
        work_items.append(plant)

    workers = max(1, args.workers)
    completed = 0
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(process_plant, plant, args, report["generatedAt"]) for plant in work_items]
        for future in as_completed(futures):
            result = future.result()
            completed += 1
            report["processed"] += 1
            if result["status"] == "miss":
                report["misses"].append(result["miss"])
            else:
                plant = result["plant"]
                if not args.dry_run:
                    old_url = result["oldUrl"]
                    new_url = result["newUrl"]
                    if old_url and old_url != new_url:
                        replacements[old_url] = new_url
                    plant["image"] = new_url
                    plant["alt"] = f"Real photo of {plant.get('name', 'plant')}"
                    report["downloaded"] += 1
                existing_credits[result["plantKey"]] = result["credit"]
                report["accepted"].append(result["accepted"])
            selected_done = completed + report["skippedExisting"]
            if args.progress_every and selected_done % args.progress_every == 0:
                print(f"progress selected={selected_done}/{len(selected)} processed={report['processed']} downloaded={report['downloaded']} misses={len(report['misses'])} skipped={report['skippedExisting']}", flush=True)

    if not args.dry_run:
        DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
        credits = {
            "generatedAt": report["generatedAt"],
            "sourcePolicy": "Only Commons files with public-domain, CC0, CC BY, or CC BY-SA metadata are accepted. NonCommercial, NoDerivatives, fair-use, unsupported, and unclear licenses are rejected.",
            "photos": sorted(existing_credits.values(), key=lambda item: (item.get("category", ""), item.get("plantName", ""))),
        }
        CREDITS_FILE.write_text(json.dumps(credits, indent=2), encoding="utf-8")
        report["htmlFilesChanged"] = update_html_references(replacements)

    REPORT_FILE.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({
        "processed": report["processed"],
        "downloaded": report["downloaded"],
        "skippedExisting": report["skippedExisting"],
        "misses": len(report["misses"]),
        "acceptedLicenses": report["acceptedLicenses"],
        "report": str(REPORT_FILE.relative_to(ROOT)),
        "credits": str(CREDITS_FILE.relative_to(ROOT)),
        "dryRun": args.dry_run,
    }, indent=2))


if __name__ == "__main__":
    main()
