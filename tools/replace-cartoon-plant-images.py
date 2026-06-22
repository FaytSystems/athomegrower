import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
IMAGES = PUBLIC / "assets" / "images"
GENERATED_REAL = IMAGES / "generated-real"
DATA_FILE = PUBLIC / "data" / "plant-library-expanded.json"

TARGET_SIZE = (800, 520)
RASTER_EXTENSIONS = {".jpg", ".jpeg", ".webp", ".png"}


def slug_words(value):
    return [part for part in re.split(r"[^a-z0-9]+", value.lower()) if part and not part.isdigit()]


def normalized_source_name(path):
    name = path.stem.lower()
    name = re.sub(r"^(plant|toxic|herb)-\d+-", "", name)
    name = re.sub(r"^(ig|image)_[a-f0-9]+", "generic potted plant", name)
    name = name.replace("-card", "")
    return name


def stable_number(value, minimum, maximum):
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    number = int(digest[:8], 16) / 0xFFFFFFFF
    return minimum + (maximum - minimum) * number


def source_pool():
    files = []
    for path in IMAGES.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in RASTER_EXTENSIONS:
            continue
        if "generated-real" in path.parts and not path.name.startswith("source-"):
            continue
        rel = path.relative_to(IMAGES).as_posix()
        files.append({
            "path": path,
            "rel": rel,
            "folder": path.parent.name.lower(),
            "name": normalized_source_name(path),
            "words": set(slug_words(normalized_source_name(path))),
        })
    return files


def image_score(plant, source):
    plant_words = set(slug_words(f"{plant['name']} {plant['slug']} {plant.get('plantType', '')} {plant.get('foliageType', '')}"))
    score = len(plant_words & source["words"]) * 12
    category = plant.get("plantTypeCategory", "")
    folder = source["folder"]

    if category == "pet-friendly" and folder == "pet-safe":
        score += 12
    if category == "toxic" and folder == "toxic":
        score += 16
    if category == "herbs" and folder == "herbs":
        score += 16
    if category in {"vegetables", "fruits", "cover-crops"} and folder == "herbs":
        score += 4

    haystack = " ".join(plant_words | source["words"])
    preferences = [
        (("fern", "frond"), ("fern",), 20),
        (("palm",), ("palm",), 20),
        (("orchid",), ("orchid",), 20),
        (("succulent", "cactus", "sedum", "haworthia", "echeveria", "jade", "aloe"), ("haworthia", "jade", "aloe", "cactus"), 18),
        (("ivy", "vine", "pothos", "hoya", "trailing"), ("ivy", "pothos", "hoya"), 16),
        (("basil", "mint", "parsley", "cilantro", "sage", "thyme", "oregano"), ("basil", "mint", "parsley", "sage", "thyme", "oregano"), 18),
        (("grass", "rye", "oat", "wheat", "barley", "clover", "cover"), ("chives", "dill", "fennel", "parsley"), 10),
        (("flower", "violet", "begonia", "lily", "zinnia"), ("violet", "orchid", "christmas", "kalanchoe"), 16),
    ]
    for plant_terms, source_terms, points in preferences:
        if any(term in haystack for term in plant_terms) and any(term in source["words"] for term in source_terms):
            score += points

    if source["path"].name == "source-generic-potted-plant.png":
        score += 2
    score += stable_number(f"{plant['slug']}:{source['rel']}", 0, 1)
    return score


def choose_source(plant, pool):
    return max(pool, key=lambda source: image_score(plant, source))["path"]


def fit_on_canvas(image, plant):
    image = ImageOps.exif_transpose(image).convert("RGB")
    bg_color = (
        round(stable_number(f"{plant['slug']}:r", 244, 250)),
        round(stable_number(f"{plant['slug']}:g", 244, 250)),
        round(stable_number(f"{plant['slug']}:b", 239, 247)),
    )
    canvas = Image.new("RGB", TARGET_SIZE, bg_color)

    max_w = round(TARGET_SIZE[0] * stable_number(f"{plant['slug']}:w", 0.72, 0.92))
    max_h = round(TARGET_SIZE[1] * stable_number(f"{plant['slug']}:h", 0.88, 0.98))
    scale = min(max_w / image.width, max_h / image.height)
    new_size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(new_size, Image.Resampling.LANCZOS)

    image = ImageEnhance.Brightness(image).enhance(stable_number(f"{plant['slug']}:brightness", 0.96, 1.07))
    image = ImageEnhance.Contrast(image).enhance(stable_number(f"{plant['slug']}:contrast", 0.96, 1.08))
    image = ImageEnhance.Color(image).enhance(stable_number(f"{plant['slug']}:color", 0.94, 1.12))

    x_range = max(0, TARGET_SIZE[0] - image.width)
    y_range = max(0, TARGET_SIZE[1] - image.height)
    x = round(x_range * stable_number(f"{plant['slug']}:x", 0.36, 0.64))
    y = round(y_range * stable_number(f"{plant['slug']}:y", 0.20, 0.78))
    canvas.paste(image, (x, y))

    return canvas


def generate_replacements(plants, pool):
    GENERATED_REAL.mkdir(parents=True, exist_ok=True)
    replacements = {}
    generated_count = 0
    for plant in plants:
        old = plant.get("image", "")
        if not old.endswith(".svg"):
            continue
        new_url = f"/assets/images/generated-real/{plant['plantTypeCategory']}-{plant['slug']}.webp"
        out = PUBLIC / new_url.lstrip("/")
        source = choose_source(plant, pool)
        with Image.open(source) as image:
            final = fit_on_canvas(image, plant)
            final.save(out, "WEBP", quality=86, method=6)
        replacements[old] = new_url
        plant["image"] = new_url
        generated_count += 1
    return replacements, generated_count


def replace_in_files(replacements):
    if not replacements:
        return 0
    changed = 0
    for path in PUBLIC.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        new_text = text
        for old, new in replacements.items():
            new_text = new_text.replace(old, new)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            changed += 1
    return changed


def main():
    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    plants = data["plants"]
    pool = source_pool()
    replacements, generated_count = generate_replacements(plants, pool)
    DATA_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    html_changed = replace_in_files(replacements)
    print(json.dumps({
        "sourceImages": len(pool),
        "generatedWebp": generated_count,
        "htmlFilesChanged": html_changed,
        "replacementDirectory": str(GENERATED_REAL.relative_to(ROOT)),
    }, indent=2))


if __name__ == "__main__":
    main()
