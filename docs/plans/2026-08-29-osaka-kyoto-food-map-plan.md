# Osaka/Kyoto Food Map Web App Implementation Plan

> **For Hermes:** Execute this plan directly and verify a real deployed URL before declaring success.

**Goal:** Build a mobile-first web map for Osaka and Kyoto food spots from the user's notes, save the source list as Markdown, deploy it to a durable public URL, and verify that the live site opens correctly with map, zoom, marker detail, and distance features.

**Architecture:** Use a static web app so the user can open it on any phone without running a home server. Store curated places in structured JSON and a companion Markdown note. Build the UI with Leaflet + OpenStreetMap, browser geolocation, region/category filters, detail cards, and Google Maps handoff links. Deploy to a Git-backed static host if possible; if GitHub auth is blocked, use another durable static host available from the environment.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Leaflet, OpenStreetMap tiles, browser Geolocation API, static JSON dataset, Git, durable static hosting.

---

### Task 1: Normalize source material into structured content
**Objective:** Convert the user's freeform notes into clean place records and a Markdown source document.

**Files:**
- Create: `data/raw-notes.md`
- Create: `data/places.todo.json`
- Create: `content/osaka-kyoto-food-guide.md`

**Steps:**
1. Preserve the original user notes in Markdown with minimal cleanup.
2. Split entries into individual venues.
3. Mark city/area, probable cuisine, and user sentiment.
4. Mark uncertain names for lookup.
5. Save a structured JSON worklist for research and geocoding.

**Verification:**
- Raw note file exists.
- Each venue appears once in the worklist.

### Task 2: Research missing details and geocode places
**Objective:** Fill in missing cuisine types, romanization, addresses, and coordinates.

**Files:**
- Modify: `data/places.todo.json`
- Create: `data/places.json`
- Create: `research/sources.md`

**Steps:**
1. Use map/geocoding tools to resolve each venue.
2. Use live web lookups for uncertain cuisine/menu details.
3. Preserve ambiguity explicitly when a match is not exact.
4. Save coordinates, region, cuisine type, and notes.
5. Record source URLs for non-obvious resolutions.

**Verification:**
- Each place in `places.json` has a status field.
- Most places have coordinates or an explicit unresolved note.

### Task 3: Build the mobile-first map app
**Objective:** Create a usable phone-friendly map and list experience.

**Files:**
- Create: `site/index.html`
- Create: `site/styles.css`
- Create: `site/app.js`
- Create: `site/data/places.json`

**Steps:**
1. Build a sticky mobile header with city/category filters.
2. Add Leaflet map with zoom controls.
3. Add markers, clustering-lite behavior via category styling, and tappable cards.
4. Add a bottom-sheet/detail panel with cuisine type, notes, and Google Maps links.
5. Add distance from current location and quick route handoff.
6. Ensure responsive layout works for narrow phone widths.

**Verification:**
- Local page opens.
- Map renders.
- Tapping a place opens details.
- Geolocation-based distance text appears when permitted.

### Task 4: Add data-driven content and polish
**Objective:** Turn the app into a real guide rather than a blank map.

**Files:**
- Modify: `site/index.html`
- Modify: `site/styles.css`
- Modify: `site/app.js`
- Modify: `site/data/places.json`
- Modify: `content/osaka-kyoto-food-guide.md`

**Steps:**
1. Add ranking/sentiment badges from the user's notes.
2. Group Osaka vs Kyoto and neighborhood tags.
3. Surface dish descriptions when user notes were sparse.
4. Add legend/help text for how to use the map on phone.
5. Add fallback list mode for unresolved or approximate pins.

**Verification:**
- Cards show cuisine and venue note summary.
- Uncertain places are labeled honestly.
- Mobile viewport remains readable.

### Task 5: Publish to durable hosting
**Objective:** Make the app reachable away from home.

**Files:**
- Create or modify: deployment files as needed
- Create: `README.md`

**Steps:**
1. Initialize git repo if needed.
2. Choose durable host with preference for GitHub Pages.
3. Push/deploy the static site.
4. Note the public URL in README.

**Verification:**
- Public URL returns HTTP 200.
- Live content matches the local build.

### Task 6: End-to-end verification
**Objective:** Prove the user can really use it.

**Files:**
- Create: `verification/live-check.md`

**Steps:**
1. Open the live URL in a browser.
2. Confirm map tiles render.
3. Confirm filters work.
4. Confirm marker tap opens detail card.
5. Confirm Google Maps handoff links are present.
6. Confirm page is usable at phone width.

**Verification:**
- Real browser checks pass.
- Final response includes the live URL and local file paths.
