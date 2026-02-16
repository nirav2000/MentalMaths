# Mental Math Expansion v2.27.0

**Release Date:** 2026-02-16

## Improvements

### Main-App Context Scoped Expansion Storage
- Expansion storage now keys per selected player when launched from the main app context.
- Prevents different learners from sharing one expansion local-storage bucket on shared devices.

### Cloud Sync Foundation + Offline Safety
- Added optional Firebase sync integration plumbing in the main app data layer.
- Local-first behavior remains intact when Firebase is unavailable.

### Embedded Expansion + PWA Coverage
- Added explicit standalone expansion quick link from Home while preserving embedded launch flow.
- Expanded service worker coverage for expansion assets and expansion route offline fallback.

## Files Updated
1. `expansion/expansion.html`
2. `expansion/js/data/expansion-storage.js`
3. `index.html`
4. `js/app-core.js`
5. `js/config.js`
6. `js/firebase-sync.js`
7. `js/storage.js`
8. `js/versions.js`
9. `style.css`
10. `sw.js`
11. `versions/2.27.0/VERSION_NOTES.md`

## Snapshot Contents
- Full `expansion/` source tree at v2.27.0 release time.
- Root application files listed above required for the embedded expansion + sync + PWA behavior shipped with this release.
