# Mental Math Expansion v2.25.0

**Release Date:** 2026-02-15

## Improvements

### Focus Mode Fit-to-Viewport Pass
- Reduced remaining padding and margins in practice focus mode for root container, cards, problem display, answer sections, and feedback blocks.
- Tightened keypad spacing and helper text spacing for denser solve layouts.
- Added adaptive equation sizing using `clamp()` so equations stay readable while using less vertical space.
- Added short-viewport behavior (`max-height: 760px`) to hide mini session stats and reduce header/button footprint.

### Goal
- Keep core solve controls (problem, answer input, keypad, and continue flow) visible on one screen as consistently as possible across device sizes.

## Files Updated
1. `expansion/css/expansion-main.css`
2. `expansion/expansion.html`
3. `expansion/js/data/expansion-storage.js`
4. `js/versions.js`
5. `versions/2.25.0/VERSION_NOTES.md`
