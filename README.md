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
