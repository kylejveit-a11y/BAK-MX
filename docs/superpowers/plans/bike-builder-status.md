# In-house bike builder — checkpoint 1

Pilot: 2025 KTM 450 SX-F standard US. Original exterior geometry. No paid assets or services used.

| Phase | Deliverable | Status |
|---|---|---|
| 1 Reference foundation | Exact inventory identity, OEM source links, dimensional anchors, component map | Initial manifest complete; photographic measurements still needed |
| 2 In-house authoring tools | Original generator, 13 component groups, orbit studio, visibility, wireframe, GLB export | Implemented; automated checks pass; browser interaction verification pending |
| 3 OEM visual accuracy | Match orthographic silhouettes, engine cases, plastics, exhaust, materials and graphics | Next; present mesh is a rough blockout |
| 4 Garage rollout | Exact-bike preview, mobile performance and device QA | Web integration behind default-off flag; native integration pending |
| 5 Expand catalog | Repeat verified reference/asset workflow for other bikes | Pending successful pilot |
| 6 Aftermarket | Map selected build-sheet parts to verified replacement assets | Boundaries prepared; actual part assets and swap logic pending |

## Run locally

Requires Node 24. Run `npm ci`, then `npm run dev`. Open `/bike-builder.html` on the development server for the internal studio. To expose the pilot in the web Garage, set `VITE_BIKE_BUILDER_PREVIEW=true` before starting/building; only the exact standard US pilot resolves. The studio is an internal prototype, not a finished customer feature.

Regenerate references: `python3 scripts/build-bike-reference-manifest.py`.

Export original geometry: `node --experimental-strip-types scripts/export-bike-blockout.mjs /tmp/ktm-blockout.glb`.

Blender import: see `scripts/blender-import-bike.py` usage. Blender is not installed in the build environment, so that helper has not been executed.

## Verification and limits

Type checks, existing app tests, new identity/geometry/framing/state-preservation tests, and production build pass. GLB validator reported zero errors and warnings; it cannot validate the instancing extension. Three.js loader round-trip preserved all 13 component names. Original export is approximately 1.67 MB, 35,904 rendered triangles, 277 mesh objects; draw-call reduction and real-device measurements remain necessary.

Independent code review found portrait clipping, dimension changes resetting inspection state, and partial initialization cleanup. These were fixed, with regression coverage for framing, preserved inspection state, and validation before GPU allocation.

The remote browser could not reach the local dev server. No claim of browser screenshot, gesture testing or physical-device verification is made. A CPU-rendered mesh study confirmed a recognizable but crude bike form; it is not an app screenshot or OEM-accuracy approval.

Source links identify public OEM reference material, not reusable licensed texture files. No downloaded OEM images or branding textures are bundled. Public images help shape inspection but cannot supply obscured geometry or certify dimensional accuracy by themselves. The inventory provides identification and assembly structure, not 3D surfaces.

## Next implementation checkpoint

1. Measure the official side references against wheelbase and wheel diameter; record uncertainty and verify the exact trim.
2. Refine silhouette, fenders, shrouds, seat, fork angles and engine exterior; review side/front/top comparisons.
3. Add owned or permission-cleared material/graphics assets, reduce mesh draws, and measure mobile performance.
4. Verify gestures, full screen, hidden/background behavior and context recovery in a reachable browser/device build before enabling Garage preview.

Do not mark the bike HD or OEM-verified until reference comparisons and device QA pass. Budget, native support, whole-inventory coverage, automatic photo-to-mesh generation and aftermarket visualization are not completed by this checkpoint.
