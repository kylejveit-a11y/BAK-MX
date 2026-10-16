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

## Checkpoint 2 — side-reference refinement and part measurements

The first checkpoint was uploaded using the GitHub connector (shell Git had no credentials). Its remote commit is `25273ddbb3c53db925b95309bcc9936a6d0e9ce7`; tree `42531ba70f93fa98eca07a8396350a20d155fd90` exactly matches local checkpoint `a205171`.

Replaced round swingarm beams with tapered sections, replaced the engine's main box with a contoured case, refined side panel outlines from the recorded official right-side photograph, and aligned the exhaust outlet with the silencer. These are still artistic estimates, not measured OEM surfaces.

Combined same-material geometry within each component: 277 mesh objects reduced to 33 before the nominal bar-clamp addition. All 13 component groups survive GLB export/reimport. This reduces potential draw overhead but does not constitute a measured frame-rate improvement. Export increased from about 1.67 MB to about 2.04 MB because batching expands indexed geometry; compression/index optimization remains open.

Kyle requested vendor dimensions. Added `public/bike-builder/vendor-dimensions.json` and shared geometry anchors. Exact pilot inventory confirms 260/220 mm brake discs, 21/19-inch nominal rim diameters and 28 mm nominal handlebar clamp diameter. Model now consumes named anchors rather than unexplained numeric literals. Rim bead-seat dimensions do not establish tire envelopes or rim flange profile.

Neken manufacturer table provides bend dimensions for R00182BK/SR, but an exact match to OEM 7900200100030 remains unconfirmed. Candidate dimensions are retained separately and not applied. Radiator and swingarm envelope dimensions were not verified in this pass. Do not derive them from bearing dimensions or product shipping fields. The ledger is downloadable from the studio.

Next: verify OEM bar bend, find dimensioned radiator/exhaust/bodywork references, then refine front/top widths and compare all views. Browser/device QA and native implementation remain pending.

## Checkpoint 3 — native viewer, rendering and geometry pass

Implemented native Garage preview as an offline WebView using the same Three.js generator, exact-bike resolver and camera controls. Uses Expo 57's installed compatibility recommendation (`react-native-webview` 13.16.1), not the latest documentation's different version. Native preview is default-off: enable `EXPO_PUBLIC_BIKE_BUILDER_PREVIEW=true` in a development build. Adding WebView requires rebuilding the native client/binary. Model is bundled; no CDN, account data, build-sheet data or external navigation is required. Backgrounding closes the modal and releases the view.

`npm run build:bike-native` regenerates the native HTML JSON and standalone `artifacts/bike-builder/offline-preview.html`. `npm run check:bike-native` verifies the checked-in bundle matches renderer sources. Regenerate before native exports whenever scene/model changes. Third-party license notices accompany the bundled runtime.

Added retry/restart controls, web expanded-view fallback with Escape and scroll restoration, original studio reflection lighting, shaped seat/fender cross-sections, seat ribs, brake calipers and valve stems. Re-indexed batched geometry: GLB 940,856 bytes, 36 meshes, 36,758 rendered triangles, all 13 components retained. GLB validation: zero errors/warnings (instancing extension remains outside validator coverage).

Validation: 207 root tests; root type check and production build; 12 native tests and native type check; iOS/Android Metro export. These are build-time checks, not simulator/physical-device certification. CPU side/top silhouette inspection confirms the model is still visibly simplified. It does not meet the HD OEM visual acceptance criterion. No approved graphics textures or verified detailed surface data have been added. Do not enable customer release or describe the complete build as finished.

Remaining release gates: detailed OEM surfaces and graphics, interactive browser/real-device QA, measured frame rate and memory use, visual approval from all views. Additional-bike models and aftermarket mapping/assets are still pending. Source-code completion cannot substitute for those gates.
