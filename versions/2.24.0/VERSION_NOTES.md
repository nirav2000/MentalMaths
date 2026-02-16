# Mental Math Expansion v2.24.0

**Release Date:** 2026-02-15

## Improvements

### Core-App Expansion Integration
- Expansion module can now be launched inside the main app shell instead of navigating away.
- Added method-selection interstitial before launching expansion flows.
- Main app now carries player context (id/name + selected method) into the expansion session bridge.

### Navigation Reliability
- Added standardized global back handling for both core screens and embedded expansion navigation.
- Screen transitions now clear transient quiz UI elements (`hint`, `visual`, `step-display`) to avoid stale state.

### Quiz/Word Problem Handoff
- Core quiz detects expansion-style word problems and delegates input/rendering to expansion word-problem UI when applicable.

## Files Updated
1. `index.html`
2. `js/app-core.js`
3. `js/app-screens.js`
4. `js/app-quiz.js`
5. `style.css`
6. `expansion/expansion.html`
7. `expansion/js/data/expansion-storage.js`
8. `js/versions.js`
9. `versions/2.24.0/VERSION_NOTES.md`
