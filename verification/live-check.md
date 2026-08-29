# Live Check / Verification

## Local artifact
- Path: `/Users/hakvision/osaka-kyoto-food-map/site`
- Local URL used for verification: `http://127.0.0.1:8127/`

## Verified with real tool output
- Page title loads as `Osaka Kyoto Food Map`
- Header visible: `오사카 · 교토 맛집맵`
- Leaflet map renders
- Zoom buttons render
- 35 places appear in the list
- Detail sheet opens for a card
- Detail links present:
  - Google Maps search
  - walking directions
  - source URL when available
- Filter test:
  - Kyoto filter => 3 places
- Dataset status:
  - exact pins: 4
  - area pins: 31

## Mobile-readiness notes
- Layout is mobile-first and uses stacked controls below 920px.
- Buttons and inputs are touch-sized.
- Detail view opens as a bottom sheet.

## Deployment blocker
- Durable hosting was planned via GitHub Pages or similar.
- This machine currently has:
  - `gh` CLI missing
  - no GitHub token env
  - browser session check to `https://github.com/new` redirected to GitHub sign-in
- Therefore durable public deployment is currently blocked on host authentication.

## Next unblock step
- Sign in to GitHub in Chrome/Safari, or provide another static host account/session.
- After that, create repo, push site, enable Pages, and verify public URL.
