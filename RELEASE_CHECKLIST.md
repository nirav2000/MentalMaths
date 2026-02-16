# Release Checklist

## Mandatory versioning & push rule

- **Use semantic versioning (`MAJOR.MINOR.PATCH`) for every release-facing update.**
- **Every push that changes release behavior must include a version bump, a matching archive in `versions/<semver>/`, and an updated version-history entry in `js/versions.js`.**
- **Do not push release changes unless all three are updated together: live app version markers, `versions/<semver>/` snapshot, and changelog/version history metadata.**

## Archive policy (source of truth)

- **Every release entry in `js/versions.js` must have a matching full snapshot under `versions/<semver>/`.**
- **Notes-only archives are not sufficient** for new releases.
- A release snapshot should include:
  - full `expansion/` folder for expansion-impacting releases;
  - any root-level files changed in that release (for example `index.html`, `style.css`, `sw.js`, `js/...`);
  - a `VERSION_NOTES.md` file listing release date, what changed, and the exact files included.

## Steps for each new release

1. Finalize code changes in the root app and/or expansion module.
2. Bump version markers:
   - `expansion/expansion.html` footer semantic version (if expansion changed)
   - `expansion/js/data/expansion-storage.js` default data `version` field (if expansion changed)
   - `js/versions.js` changelog entry
3. Create archive folder: `versions/<new-version>/`.
4. Copy release-time source into that folder:
   - `expansion/` (when expansion changed)
   - root files touched by the release
5. Add `versions/<new-version>/VERSION_NOTES.md` with:
   - release date
   - change summary
   - numbered "Files Updated" list
6. Run smoke tests (`./testing/run-smoke.sh`) and verify archive files are present.
7. Commit release + archive together in one commit.

## Quick verification commands

```bash
# Ensure version directory exists
[ -d versions/<new-version> ]

# Ensure expansion semantic markers align for expansion releases
rg -n "v<new-expansion-version>" versions/<new-version>/expansion/expansion.html
rg -n "version:\s*'<new-expansion-version>'" versions/<new-version>/expansion/js/data/expansion-storage.js

# Confirm notes file exists
[ -f versions/<new-version>/VERSION_NOTES.md ]
```
