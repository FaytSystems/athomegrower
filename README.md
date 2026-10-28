# AtHomeGrower.com Cloudflare Pages Site

This package expands AtHomeGrower into a must-have + should-have gardening knowledge base.

## Included must-have pages

- Home
- Plant Library
- Annotated Deficiencies
- Annotated Pests
- Plant Diseases
- Organic Additives
- Troubleshooting
- How-To Guides
- Editorial Policy
- Image Policy
- Sources
- Image Credits
- Contact
- Privacy
- Terms
- Affiliate Disclosure

## Included should-have pages

- Seasonal Checklists
- Tools and Planners
- Community / Q&A roadmap
- Product Guides roadmap
- Air-Purifying Plants page with careful wording

## Deploy

```powershell
cd "$env:USERPROFILE\Downloads\athomegrower_cloudflare_site_MUST_SHOULD\athomegrower_cloudflare_site"
npm install
npm run deploy
```

The deploy script uses `npx wrangler` because it works on Windows even when `wrangler` is not globally recognized.

## Search visibility

`https://athomegrower.com/` is the primary origin for this single website.
Pages middleware permanently redirects the connected plural and www aliases to
that origin while preserving paths and query strings. Alias hostnames must also
be attached to this Pages project and point to it in DNS; middleware cannot
redirect an address still served by another provider.

Run `npm run seo:build` after changing public content. It derives plant titles,
care summaries, canonical URLs, social previews, breadcrumbs, and the sitemap
from the existing plant records. The source-site generator invokes this step
after rebuilding, and existing ownership-verification tags are preserved.

Validate before publication:

```text
npm run check:seo
npm run check:pet-status
node tools/check-local-links.js
```

The pet-status checks cover negative labels before positive labels, the browser
filters, both generators, and all existing profile facts strips. They do not
independently establish the biological safety or accuracy of every source record.

The two new guides cite their horticultural sources directly. Plant profiles
remain general starting points; the SEO work does not represent an expert review
of every species, cultivar, or growing condition. No search-ranking percentile
or rich-result eligibility is claimed.
