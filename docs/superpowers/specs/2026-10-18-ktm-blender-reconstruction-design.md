# 2025 KTM 450 SX-F Blender Reconstruction Design

## Goal

Replace the visibly synthetic, assembled-primitives motorcycle with a coherent Blender-authored exterior reconstruction that reads as a real 2025 KTM 450 SX-F at viewer distance.

## Scope and truth boundary

- The only motorcycle is `KTM|450 SX-F|2025|standard|US`.
- Exact-year official KTM studio images and the already-recorded exact-year dealer images are reference material; they are not redistributed.
- Documented dimensions remain documented facts. Photo-derived contours, depths, hidden junctions, and casting details remain estimates.
- `BLOCKOUT_NOT_OEM_VERIFIED` remains in the Blender file, GLB metadata, mobile payload, and browser UI until Kyle explicitly accepts the visual milestone.
- No production deployment, main-branch merge, protection change, credential exposure, or neighboring-year geometry inheritance is permitted.

## Chosen approach

The Blender project becomes the authoritative visible-geometry master. A deterministic Blender Python build script constructs a unified, subdivision-ready motorcycle from section profiles rather than independent flat extrusions. It preserves semantic object names and replaceable component groups required by the existing viewer.

The reconstruction is silhouette-first:

1. Lock the ground plane, wheel centers, wheel radii, steering axis, fork, swingarm, seat line, and major documented heights.
2. Rebuild the front fender, number plate, shrouds, tank/seat transition, side panels, airbox covers, and rear fender as curved shells with controlled edge returns and continuous highlights.
3. Replace the engine's stacked primitive look with coherent crankcase, cylinder, head, covers, guards, header, chamber, and muffler masses.
4. Retain detailed wheels, frame, suspension, brakes, drivetrain, controls, and semantic replacement boundaries, correcting only what visibly conflicts with the new surfaces.
5. Use restrained PBR materials that distinguish molded plastic, rubber, seat vinyl, cast alloy, machined alloy, steel, anodized fork surfaces, and exhaust finishes.

The browser loads the exported GLB as the primary bike asset. The existing TypeScript model remains only as an explicit fallback and compatibility source during this bounded conversion; it is not presented as the visually accepted master.

## Acceptance gates

Automated gates are intentionally visual-structure oriented rather than mesh-count oriented:

- The GLB contains the fixed identity, `BLOCKOUT_NOT_OEM_VERIFIED`, semantic component groups, finite geometry, and required PBR material classes.
- Body shells have nontrivial curvature, watertight/closed intended surfaces, outward normals, bevel/subdivision continuity, and no gross interpenetration at named junctions.
- Right, left, front, rear, top, and front-right three-quarter renders are generated from the actual GLB.
- Image regressions measure nonempty silhouette coverage, wheel/ground alignment, motorcycle occupancy, side-view proportions, front/rear symmetry bounds, and distinct camera outputs.
- The browser loads the GLB, renders without page errors, and responds visibly to all six presets, orbit, and zoom.
- The mobile/offline payload and editable `.blend` handoff are regenerated from the same master.

Automated gates prove construction and presentation consistency, not OEM likeness. Visual acceptance remains a human gate.

## Deliverables

- Deterministic Blender reconstruction script and authoritative `.blend` master.
- Rebuilt GLB, mobile/offline payload, six-view review images, contact sheet/comparison, and browser review screenshots.
- Focused geometry, material, export, and browser regression evidence.
- A protected Vercel preview share link with deployment ID and real-browser verification.

## Known limitations

Without KTM CAD, a licensed scan, or dimensioned orthographic drawings, exact sectional curvature, hidden attachment geometry, engine casting contours, decal placement, and small fastener detail cannot be claimed as OEM verified. The target is a convincing exact-year exterior study at viewer distance, not a service-grade digital twin.
