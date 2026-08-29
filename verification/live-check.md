# Live Check / Verification

## Local artifact
- Path: `/Users/hakvision/osaka-kyoto-food-map/site`
- Local URL used for verification: `http://127.0.0.1:8127/`

## Published artifact
- Repo: `https://github.com/hakvision/osaka-kyoto-food-map`
- Live URL: `https://hakvision.github.io/osaka-kyoto-food-map/`
- Verified commit: `c6b2ae7ce210f36894a2e408b3294e56e2f10d9e`

## Verified with real tool output
- Public URL returned HTTP 200.
- Page title loads as `Osaka Kyoto Food Map`
- Header visible: `오사카 · 교토 맛집맵`
- Google Maps API loaded successfully on local/live checks: `googleReady=true`
- Live map region exposes `지도`
- Live site markers detected:
  - 맛집 마커: `35`
  - 주요 기준점 마커: `9`
- 주요 기준점 라벨 노출 확인:
  - `난바역`
  - `오사카역`
  - `교토역`
- 상세 시트 열림 확인
- 상세 액션 확인:
  - `Google Maps에서 열기`
  - `도보 경로`
  - `좌표 참고 출처`
- Filter test on live site:
  - Kyoto filter => `3` places
- Dataset status:
  - exact pins: `4`
  - area pins: `31`

## Mobile-readiness notes
- Layout is mobile-first and uses stacked controls below 920px.
- Buttons and inputs are touch-sized.
- Detail view opens as a bottom sheet.
- 주요 기준점 라벨을 지도 위에 직접 띄워 난바역/오사카역/교토역 같은 기준 시설이 더 잘 보이게 했다.
- Google basemap language is requested with `language=ko&region=KR`.
