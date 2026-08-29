# Live Check / Verification

## Local artifact
- Path: `/Users/hakvision/osaka-kyoto-food-map/site`
- Local URL used for verification: `http://127.0.0.1:8127/`

## Published artifact
- Repo: `https://github.com/hakvision/osaka-kyoto-food-map`
- Live URL: `https://hakvision.github.io/osaka-kyoto-food-map/`
- Verified commit: `411f636ce1e5f687a82a5384712b715503008738`

## Verified with real tool output
- Public URL returned HTTP 200 after Pages propagation.
- Page title loads as `Osaka Kyoto Food Map`
- Header visible: `오사카 · 교토 맛집맵`
- Leaflet map renders on the live site
- Zoom buttons render: `2`
- Map tiles detected on the live site: `12`
- 35 places appear in the list
- Detail sheet opens for a card on the live site
- Detail links present:
  - Google Maps search
  - walking directions
  - source URL when available
- Filter test on live site:
  - Kyoto filter => `3` places
- Dataset status:
  - exact pins: `4`
  - area pins: `31`

## Mobile-readiness notes
- Layout is mobile-first and uses stacked controls below 920px.
- Buttons and inputs are touch-sized.
- Detail view opens as a bottom sheet.
- The live browser render showed readable controls and no visible overlap in the main view.
