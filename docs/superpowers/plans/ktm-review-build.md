# 2025 KTM 450 SX-F standard US — visual recovery

Updated 2026-10-17. **The convincing HD OEM visual milestone is not complete.** The rejected four-view image is preserved separately. This reconstruction is substantial, but it is still an estimated exterior study. It must not be represented as an accepted or verified OEM asset.

## 2026-10-18 OEM viewer presentation pass

The browser studio now treats the motorcycle as one fixed stock-OEM inspection target rather than a graphics or dimension configurator. Conservative bounding-sphere fitting was replaced with projected fitting against the transformed vertices of the visible motorcycle geometry, including instances. This avoids framing nonexistent corners from a world-aligned box. Deterministic tests cover wide, square, portrait, and extreme-portrait math; local Chrome exercised all six presets. The default is a front-right three-quarter inspection view, with right, left, front, rear and top presets retained.

Studio presentation now uses a seamless dark floor, controlled environment/key/fill/rim lighting, ACES filmic tone mapping, soft shadows and differentiated stock material response for KTM-orange plastic, seat vinyl, rubber, black alloy, cast engine surfaces and machined hardware. Camera near/far planes and orbit limits scale with the fitted distance, and the old fixed fog range was removed so extreme portrait layouts do not clip or erase the bike. The rider-facing wheelbase and seat sliders were removed because this preview represents the fixed Standard US bike. In-house component isolation, wireframe inspection and editable GLB export remain available.

An editable Blender handoff is checked in at `assets/bike3d/ktm-450-sxf-2025.blend`. Blender 5.2.2 opened the file with 123 meshes and preserved the exact identity plus `BLOCKOUT_NOT_OEM_VERIFIED`. This is a durable modeling starting point, not evidence that the imported geometry is visually accepted or now Blender-refined.

- [Verified browser page](../../../public/bike-builder/ktm-450-sxf-2025-browser-review.png)
- [Verified default WebGL canvas](../../../public/bike-builder/ktm-450-sxf-2025-browser-three-quarter.png)

Fresh verification on 2026-10-18: 21/21 focused 3D scene/material tests passed; TypeScript and the production Vite build passed; the regenerated GLB contains 123 meshes and 292,570 rendered triangles; glTF Validator reported 0 errors and 0 warnings; the native/offline payload was regenerated and its freshness check passed; mobile TypeScript and 12/12 mobile tests passed. Headless Chrome rendered six distinct preset views, orbit and zoom changed the canvas, expand/collapse worked, and the browser recorded no page errors or warnings. A forced WebGL context-loss event showed the recovery alert; retry cleared the alert and restored both the selected Rear control state and the identical rendered Rear view.

The repository-wide suite remains 242/243 because the pre-existing `2024 rear hose correction preserves other checks, original content identity and rejects changed review inputs` assertion expects `/does not match/`, while the implementation throws `Hose routing correction review changed`. It failed identically before this viewer pass and is outside the 3D scope.

These results close the browser-software presentation gate only. They do not close the OEM-likeness gate, physical-iPhone performance, physical gestures, or Kyle's visual acceptance.

## What changed

The original single-file primitive assembly has been replaced with editable, photo-contoured surface authoring in `src/bike3d/ktm-bodywork.ts`, `ktm-chassis.ts`, and `ktm-powertrain.ts`, with reusable mesh construction in `authoring.ts`. The runtime still creates the same Three.js component hierarchy, so web and the self-contained mobile viewer use the same geometry and visual-build application code. No runtime model download is required.

- Tires now have rounded carcasses, shaped tread blocks, detailed rim sections, crossed spokes and nipples. The swingarm has recessed pockets and an axle assembly; brake rotors have real openings. Chain drive remains rider-left, rear brake rider-right, with the catalog-supported 51-tooth rear sprocket.
- Frame, shock/linkage, controls, cables and cooling assemblies were reconstructed around the photo-derived stance.
- Bodywork uses traced outlines, closed thickness, bowed surfaces, a crowned seat/tank, channeled fenders, a faceted number plate with lower wings, and open-backed fork guards. The left number panel is separately traced rather than mirroring the smaller right panel.
- Engine cases and head have asymmetric cast contours, assembly seams and exterior fittings. The stock header has a formed chamber; the stock muffler has a black tapered shell and silver outlet cap. These remain authored estimates.
- OEM shroud marks are fixed geometry. No graphics designer or free color selector was introduced. The supported plastics presets and existing parts/finish mappings are unchanged.
- Full-exhaust and slip-on representatives now use the updated asset hardpoints. The slip-on inlet meets the retained stock header. The black stock muffler shell supplies its unknown-finish fallback.

## Visual references and inspection

`public/bike-builder/ktm-450-sxf-2025.visual-references.json` records exact-year KTM studio sources plus US dealer front, rear, elevated and component-detail photos. Documented specifications are distinguished from traced contours and estimated widths. The existing component/measurement evidence manifest remains intact.

There is no orthographic top reference. Top widths are estimated from elevated rear and three-quarter photos. Dealer cameras are tilted and perspective; they are not dimensioned drawings. The side images support stronger silhouette comparisons. Source photography is not packaged into the model or redistributed in the repository.

- [Six-view mesh/reference comparison](../../../public/bike-builder/ktm-450-sxf-2025-comparison.html)
- [Current actual mesh contact sheet](../../../public/bike-builder/ktm-450-sxf-2025-review.png)
- [Rejected baseline](../../../public/bike-builder/ktm-450-sxf-2025-rejected-baseline.png)
- Individual right, left, front, rear, top and three-quarter images: `public/bike-builder/ktm-450-sxf-2025-views/`.

The CPU renderer now uses per-vertex normals, depth testing, actual back-face culling and antialiasing. These images show the actual exported geometry. They do not show Three.js PBR environment reflections, shadows, browser behavior or physical-device performance.

## Preserved contracts and reviewed corrections

Meters; +X forward, +Y up, +Z rider-right. Existing component groups, stock-header/stock-muffler boundaries, seven separate plastics pieces, independent finish targets, generic accessory labels and unknown-product fallback are retained. Removing a part restores stock. Saved configuration schemas and the catalog were not changed.

Independent review found and verified fixes for three newly introduced defects:

1. Master cylinders shared the selectable clamps material, causing clamp replacement to hide them. They now have a fixed black finish. A ray-based regression checks the actual master-body surfaces remain visible and unchanged.
2. Hub materials leaked onto nipples, rim marks, axle and brake hardware. Selectable hub geometry now stays within the actual central hub envelope; other hardware uses fixed finishes. A geometry-based regression covers the scope.
3. Fan-triangulated concave loft caps produced overlapping and reversed faces. Caps now use projected polygon triangulation with recovered 3D winding. Regression coverage checks open channels, area and outward normals in multiple orientations and both ring orders.

Review also checked full → slip-on → stock transitions and connector alignment, panel winding at all supported seat-reference limits, and the number plate/wing exterior faces. These establish software and geometry correctness, not OEM likeness.

## Reproduce

```sh
npm run check
npm run check:mobile
npm run build:bike-native
npm run check:bike-native
EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_BIKE_BUILDER_PREVIEW=true npm --prefix apps/mobile run export -- --max-workers 2
node --experimental-strip-types scripts/export-bike-blockout.mjs public/bike-builder/ktm-450-sxf-2025.glb
node --experimental-strip-types scripts/render-bike-review.mjs > /tmp/ktm-mesh.json
python scripts/render-bike-review.py public/bike-builder/ktm-450-sxf-2025-review.png --views-dir public/bike-builder/ktm-450-sxf-2025-views --width 1000 --height 680 --supersample 2 < /tmp/ktm-mesh.json
node --experimental-strip-types scripts/profile-bike-model.mjs
```

Expo packaging runs in the installed CLI’s offline mode with telemetry disabled. Automatic approval review blocked an earlier export because of possible project telemetry to `cdp.expo.dev`; the offline/telemetry flags remove that external contact. The installed CLI explicitly returns no telemetry client when either flag is set.

The renderer requires NumPy and Pillow. The authored TypeScript is the editable source; the GLB is a reproducible interchange export, not the source of truth. `scripts/blender-import-bike.py` remains available for a Blender-capable environment.

Web development page: `/bike-builder.html`. Garage integration remains behind `VITE_BIKE_BUILDER_PREVIEW=true`, and mobile behind `EXPO_PUBLIC_BIKE_BUILDER_PREVIEW=true`. Native generation writes both the checked-in `apps/mobile/src/generated/bike-preview.json` and a self-contained `artifacts/bike-builder/offline-preview.html` for local inspection.

## Historical validation snapshot (2026-10-17)

This table records the pre-presentation baseline and is retained for provenance. Where it differs, the fresh 2026-10-18 results above supersede it.

| Gate | Result and scope |
| --- | --- |
| Root checks | 235/235 tests; TypeScript and production web build passed |
| Mobile checks | 12/12 tests and TypeScript passed |
| Offline viewer | Regenerated and freshness check passed; HTML 771,020 bytes |
| Expo packaging | iOS and Android exports passed with networking and telemetry disabled |
| Stock GLB | 7,761,880 bytes; validator 0 errors / 0 warnings |
| Validator limitation | GPU instancing is unsupported by the validator; remaining informational messages concern that extension and unused attributes |
| Mesh | 123 mesh objects; 292,570 rendered triangles; 7,598,108 geometry bytes |
| CPU construction | 1239.5 ms, 1110.1 ms, 1015.3 ms in three fresh assemblies on the available Linux/Node CPU; not a device/GPU benchmark |
| Visual target | **Not met** |
| WebGL / iPhone | WebGL was not verified in this historical snapshot; local headless Chrome is now verified. Physical iPhone remains **not verified**. |

Saved fitted finish and plastics selections pass serialization coverage. Mobile persistence/continuity tests use mocked storage and cover restoration and interrupted writes. They are not an end-to-end Garage save/reload or an iPhone process-kill/restart test.

The available machine is an x64 Linux container with Node 24 and an AMD EPYC CPU. CPU construction measurements are reported by `profile-bike-model.mjs`; they are not FPS, GPU timings or an iPhone performance result. Tread geometry was simplified after the first reconstruction while preserving visible block shape. A higher triangle count than the rejected asset is a performance cost, not evidence of visual quality.

## Exact remaining issues / unfulfilled gates

1. **Visual fidelity remains below the requested convincing HD OEM standard.** Molded plastics still need more accurate sectional curvature, returns and junctions against multi-angle references. Top widths and hidden connections remain estimated. The latest front/rear fender and plate surfaces improve the silhouettes but do not establish an exact molded OEM surface.
2. **Powertrain likeness remains approximate.** Cast-case depth transitions, head/valve-cover contours, port necks and stepped recesses are simplified. The revised header and muffler still need closer multi-angle contour and clearance verification.
3. **Fine OEM surface appearance is incomplete.** Seat grain, cast-metal texture, fine fastener recesses, small fixed branding and other close-up surface marks are not finished. Fixed shroud polygons are photo-derived artwork estimates, not an OEM CAD/texture asset.
4. **Physical iPhone gestures, restart behavior and performance are unverified.** No physical iPhone or accessible target WebView was available. Successful Expo exports do not resolve this gate.
5. **End-to-end saved-build reload/restart was not exercised in an actual Garage session.** Data serialization, stock restoration and mocked continuity tests passed within the stated scope only.
6. **Kyle's visual acceptance has not occurred.** The current result is not submitted as a finished visual milestone. `BLOCKOUT_NOT_OEM_VERIFIED` remains in the model and export.

No paid asset/service was acquired. No catalog expansion, database change, production deployment or merge was performed. The authorized feature-branch upload preserves the work, without treating the visual milestone as passed.
