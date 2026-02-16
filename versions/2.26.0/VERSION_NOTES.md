# Mental Math Expansion v2.26.0

**Release Date:** 2026-02-15

## Improvements

### Keypad Order Alignment
- Reordered expansion keypads to match the phone/index-style numeric layout:
  - Top row: `1 2 3`
  - Middle row: `4 5 6`
  - Third row: `7 8 9`
  - Bottom row: `⌫ 0 ✓`

### Mobile Keypad Cutoff Prevention
- Updated core quiz layout with dynamic viewport-aware sizing (`100dvh`) and tighter spacing on short screens.
- Adjusted numpad spacing, button heights, and safe-area bottom padding so keys remain fully visible.
- Added short-height media rules to compress header/question/answer UI and keep keypad on screen.

## Files Updated
1. `expansion/js/expansion-app.js`
2. `expansion/js/problems/word-problem-ui.js`
3. `style.css`
4. `expansion/expansion.html`
5. `expansion/js/data/expansion-storage.js`
6. `js/versions.js`
7. `versions/2.26.0/VERSION_NOTES.md`


## Snapshot Contents
- Full `expansion/` source tree at v2.26.0 release time.
- Root files `style.css` and `js/versions.js` included to preserve release-accurate app behavior/changelog context.
