# Mental Math Expansion v2.27.0

## What's New
- Added integration support for main-app context so expansion data is now scoped per selected player when launched from `index.html`.
- Added cloud-sync foundation in the main app using optional Firebase Firestore mirroring with graceful local fallback.
- Improved PWA readiness by extending service-worker precache coverage to expansion module assets and adding offline fallback for expansion routes.
- Added a quick standalone expansion link from home while preserving the embedded expansion launch flow.

## Notes
- Expansion still works fully offline with local storage if Firebase is unavailable.
- When launched from the main app, expansion now uses a player-specific local key.
