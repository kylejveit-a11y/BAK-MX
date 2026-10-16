# In-house Bike Builder Implementation Plan

**Goal:** Deliver an original, modular exterior prototype and working authoring/viewing tools.
**Architecture:** A dimensioned Three.js generator produces separate component groups. A studio wraps the viewer for reference-driven iteration and export; an opt-in Garage wrapper uses strict bike identity.
**Tech Stack:** TypeScript, Three.js, React, Vite, Blender Python import.
**Spec:** ../specs/2026-10-16-bike-builder-design.md

## Constraints
No spending, no database changes, no unverified OEM claims. Source coordinates beyond documented dimensions are estimates. Preserve current garage flow.

## Review focus
Wrong year/trim must not resolve. Invalid dimensions must fail. Hidden/background viewer must stop rendering. Resources must dispose on unmount. Export must exclude studio environment and retain component identities.

## Tasks
- [x] Reference manifest and generator: shared/bike-visual.ts, src/bike3d/model.ts, scripts/build-bike-reference-manifest.py. Test exact identity, bounds, finite geometry and component separation in tests/bike-visual.test.ts and tests/bike-model.test.ts.
- [ ] Viewer and internal studio: src/bike3d/scene.ts, BikeViewer.tsx, Studio.tsx, studio.css, bike-builder.html. Verify fixed views, orbit, wireframe, hide/show and GLB round trip in browser.
- [x] Garage preview: src/bike3d/GarageBikePreview.tsx and small src/App.tsx insertion, disabled by default and exact-scope only.
- [ ] Blender import helper and authoring docs; run complete project checks and fresh branch review; preserve branch and progress.

## Progress
2026-10-16: User explicitly approved execution of the in-house plan; proceed without a second planning approval. Separate clone/feature branch isolates implementation. Original free procedural mesh is a blockout pending photographic refinement. Physical-device/native rollout remains a later phase, not implied by web success.

Implementation checkpoint: see [bike-builder-status.md](bike-builder-status.md) for phase status, run commands, validation and outstanding visual/device work. Viewer and helper code are implemented; unchecked items retain their pending interactive/Blender verification.
