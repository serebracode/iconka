# AGENTS.md — Iconka

## Project status

Iconka is in a **stabilization / content-filling stage**.

The current application behavior on `main` is considered the working baseline.
The priority is now to add more icons **without changing or "improving" the runtime**.

For normal catalog-filling tasks, treat the application code and visual behavior as frozen.

---

## Prime directive

**Do not break working behavior. Prefer no code change over a clever code change.**

When a task can be completed by changing data or assets, do not modify application code.

Do not refactor, reorganize, clean up, modernize, optimize, rename, or simplify working code unless the user explicitly asks for that exact change.

A smaller diff is better.

---

## Source of truth

When sources disagree, use this priority:

1. Current `main/index.html`
2. Current `main/data/icons.json`
3. Existing assets under `icons/`
4. `docs/icon-screen-layers.md`
5. Other documentation

`README.md` and `instructions.md` have been updated for the current 1.0 baseline and content-filling stage. They are useful documentation, but current runtime code and data remain higher-priority sources of truth.

**Do not restore old behavior from historical commits or older documentation.**

In particular, the current runtime loads `data/icons.json` directly and does not use the old embedded 10-icon fallback from early versions of the project.

---

## Default operating mode: CONTENT ONLY

Unless the user explicitly asks to change application behavior, layout, animation, navigation, loading, candle mode, gestures, or UI:

### Allowed files for adding an icon

- `data/icons.json`
- `icons/<slug>.jpg`
- `icons/preview/<slug>_preview.jpg`
- `icons/loading/<slug>_loading.jpg`
- optional icon-specific files explicitly required and supplied/prepared for candle mode:
  - `icons/candle/<slug>.webp`
  - `icons/png/<slug>.png`

### Frozen by default

Do **not** edit these during ordinary catalog filling:

- `index.html`
- files in `id/`
- files in `video/`
- `docs/icon-screen-layers.md`
- existing icon assets
- existing icon records in `data/icons.json`

Do not touch unrelated files.

If adding an icon appears to require a change to `index.html`, stop treating it as a content-only task. Explain the reason before making a runtime change.

---

## Adding a new icon

Use an existing current record in `data/icons.json` as the schema reference.

Typical record:

```json
{
  "id": 21,
  "title": "Full title",
  "title_short": "Short display title",
  "image": "./icons/example.jpg",
  "loading_image": "./icons/loading/example_loading.jpg?v=<cache-key>",
  "image_source": "https://...",
  "image_source_label": "Изображение: ...",
  "image_credit": "...",
  "author_full": "...",
  "date": "...",
  "material": "...",
  "size": "...",
  "location": "...",
  "description_full": "...",
  "rights": "..."
}
```

Fields such as `image_source_label`, `preview_image`, `candle_image`, and `cutout_master` are optional and should only be added when actually needed.

### IDs

- Every icon must have a unique numeric `id`.
- Never renumber existing icons.
- Existing gaps in IDs are valid.
- Use a new unused ID.
- Do not change existing IDs to make the sequence pretty.

The UI sorts icons alphabetically by title, so JSON order is not the catalog display order.

---

## Asset conventions

For a normal new icon, create all three standard visual assets:

### 1. Main image

`icons/<slug>.jpg`

- Preserve the intended full-icon composition.
- Do not crop merely to make all icons identical.
- Do not change existing display geometry or CSS to accommodate one image.
- Use a lowercase ASCII filename, preferably snake_case.
- Keep the filename stable after publishing.

### 2. Catalog preview

`icons/preview/<slug>_preview.jpg`

The catalog automatically derives this path from `image` when `preview_image` is not specified.

- This is the small catalog thumbnail.
- Match the established preview treatment used by neighboring icons.
- Do not modify list CSS for a new thumbnail.

### 3. Loading image

`icons/loading/<slug>_loading.jpg`

- This is a full-composition microcopy used by the progressive loader and swipe transition.
- Preserve the **same aspect ratio/composition as the main image**.
- Long side should follow the established 48 px loading-image convention.
- It is not the square catalog thumbnail.
- Do not use another icon's loading image.
- Keep the `?v=...` cache key in `loading_image` when using the established convention.

If a loading asset is wrong, fix the asset. Do not change the progressive-loading code.

---

## Candle-mode assets

Most icons currently work without a dedicated `candle_image`; the runtime falls back to `image`.

Do not create or reference special candle assets unless they actually exist and are intentional.

If supplied:

- `candle_image` is the display asset for candle mode.
- `cutout_master` is an alpha source for masks/projection when a separate alpha master is required.
- Never reuse another icon's alpha/cutout asset.
- Never fake a `cutout_master` path.
- Never change candle geometry globally to fix one icon.

The enhanced candle setup of one icon must not be generalized to every icon unless explicitly requested.

---

## Credits and factual metadata

Every new image must have its source and rights status handled deliberately.

When a source is known, prefer:

- `image_source`
- `image_source_label` when the default Wikimedia label is inaccurate
- `image_credit`
- accurate `rights`

Do not invent:
- authorship,
- date,
- museum/location,
- dimensions,
- license,
- public-domain status,
- source URLs.

If a fact is unknown, use a neutral unknown value rather than guessing.

Do not silently remove existing credits.

---

## Runtime invariants — DO NOT TOUCH during content filling

The following systems are fragile and already working:

### Launch / navigation
- The launch screen appears only on initial load/reload.
- The logo on subsequent screens returns to the catalog.
- Catalog, detail, Info, About, and Telegram navigation behavior must remain unchanged.

### Progressive loading
- The detail image uses the current pixel-loading sequence.
- `loading_image` and `image` must represent the same icon with matching proportions.
- Async loading uses cancellation/current-icon checks.
- Candle entry cancels progressive loading before swapping image source.

### Swipe
- Horizontal icon swipe behavior must remain unchanged.
- Neighbor previews are warmed before transitions.
- The temporary cloned card behavior is intentional.
- Do not "clean up" duplicate child IDs in the swipe clone; current sizing depends on them.

### Zoom / gestures
- Existing double-tap zoom, pan, swipe conflict handling, and touch behavior are frozen.
- Do not alter touch-action, gesture thresholds, event handling, or transition timing for content additions.

### Candle scene
- Candle lighting, shadow, projection, darkening, vignette, flame synchronization, and geometry are frozen.
- Do not change opacity, blur, scale, transforms, masks, animation amplitudes, z-indexes, or timing while adding icons.
- Do not move candle logic between layers.
- Do not replace real alpha projection with a rectangular CSS mask.
- Do not shrink projection containers to alpha bounds; blur needs overflow room.

### Responsive behavior
- Existing mobile/tablet orientation behavior is frozen.
- Existing shared content width and safe-area behavior are frozen.
- Do not modify responsive breakpoints to accommodate content.

---

## Existing visual baseline

Before making any runtime change explicitly requested by the user, read:

`docs/icon-screen-layers.md`

It documents:
- progressive image loading,
- screen layers,
- candle-mode layers,
- projection/shadow behavior,
- Info fades and credits,
- swipe mechanics,
- navigation invariants.

Do not rely on old README diagrams for the current candle implementation.

---

## Git safety

For anything beyond a pure documentation-only change:

- Work in a separate branch by default.
- Do not merge into `main` unless the user explicitly asks to merge/push it to `main`.
- Do not force-push `main`.
- Do not reset `main` to another commit unless explicitly instructed.
- Do not bundle unrelated changes into the same commit.
- Keep content additions separate from runtime changes.

For batches of new icons, prefer one clearly scoped branch/commit or a small number of logical commits.

Before merging a content batch, review the diff and confirm that no frozen runtime file changed.

---

## Validation for every new icon

At minimum verify:

1. `data/icons.json` parses as valid JSON.
2. New `id` is unique.
3. Main image path exists.
4. Preview path exists.
5. Loading image path exists.
6. All paths use the existing relative `./icons/...` convention.
7. Main and loading images have matching composition/aspect ratio.
8. Search can find the title.
9. Catalog preview resolves without fallback.
10. Opening the icon shows the correct image.
11. Swiping into and out of the icon does not flash another icon.
12. Info displays the intended title, metadata, description, source and credit.
13. Candle mode opens and closes without errors.
14. Existing icons still work.
15. No unrelated file changed.

For a batch, validate all new records programmatically where possible before merging.

---

## What NOT to do

Do not use an icon-addition task as an excuse to:

- refactor the monolithic `index.html`;
- split JS/CSS into modules;
- introduce a framework;
- change dependencies;
- rename folders;
- normalize all existing JSON records;
- renumber IDs;
- rewrite descriptions that were not requested;
- recompress or replace existing images;
- regenerate existing previews;
- alter cache keys globally;
- change sorting;
- change typography;
- change spacing;
- change the loading animation;
- change candle visuals;
- "fix" code style;
- remove apparently redundant code;
- update old documentation unless explicitly asked.

Working code that looks strange is still working code.

---

## If something appears inconsistent

Do not automatically repair it.

First determine whether it is:
- a real runtime bug,
- intentional legacy behavior,
- icon-specific data,
- stale documentation.

For content work, choose the solution that changes the fewest existing things.

If the only way to add content seems to require architecture work, report that fact instead of silently broadening the task.

---

## Current goal

The near-term goal is simple:

**Grow the catalog by roughly another dozen icons while preserving the current application exactly as it behaves now.**

Content can grow.
The runtime should stay boring.
That is a feature.
