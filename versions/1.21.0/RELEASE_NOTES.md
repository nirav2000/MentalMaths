# Mental Maths v1.21.0

## Highlights
- Added Firebase email/password authentication in Settings so cloud sync can be explicitly enabled per user account.
- Firestore mirroring now tags records with authenticated `userId` and defers writes until sign-in is available.
- Added an always-visible Expansion shortcut button in the Home header for reliable navigation discovery.

## Files touched
- `js/firebase-sync.js`
- `js/settings.js`
- `js/app-core.js`
- `index.html`
- `style.css`
- `css/features.css`
- `js/config.js`
- `js/versions.js`
- `sw.js`
