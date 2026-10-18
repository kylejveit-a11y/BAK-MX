# KTM OEM Viewer Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing stock 2025 KTM 450 SX-F browser viewer present the motorcycle at a credible inspection scale with deterministic camera fitting, premium studio rendering, and browser-verified interaction.

**Architecture:** Keep the current modular Three.js model and Garage mapping contracts. Extract projected-bounds camera fitting into pure math that can be tested without WebGL, then update the scene and viewer presentation around that API. Preserve the GLB/export boundary and the explicit unverified-geometry label.

**Tech Stack:** TypeScript, React 19, Three.js 0.186, Node test runner, Vite, Playwright-driven Chrome inspection

**Spec:** `docs/superpowers/specs/2026-10-18-ktm-oem-viewer-fidelity.md`

## Global Constraints

- Scope is only `KTM|450 SX-F|2025|standard|US`.
- Do not add graphics editing, custom decals, aftermarket scope, or additional bikes.
- Do not copy Rival Ink or Garage 360 assets, code, or UI.
- Preserve modular component names, Garage build mappings, exports, and `BLOCKOUT_NOT_OEM_VERIFIED`.
- Do not make production deployments, merge to main, disable project-wide protection, or expose credentials.
- Do not report desktop/browser evidence as iPhone validation.

## Review Focus

- Extreme portrait and landscape hosts must frame without clipping or shrinking the bike unnecessarily.
- Front/rear/top presets must fit projected geometry whose depth differs from the default view.
- Invalid or degenerate bounds must fail explicitly rather than creating a NaN camera position.
- Expanded mode and resize must not reset the selected view to the default angle.
- Context loss or failed initialization must retain the existing accessible fallback.

---

### Task 1: Projected-bounds camera fitting

**Files:**
- Create: `src/bike3d/camera-fit.ts`
- Modify: `src/bike3d/scene.ts`
- Test: `tests/bike-scene.test.ts`

**Interfaces:**
- Produces: `fitDistanceForPoints(points, target, direction, up, verticalFovDegrees, aspect, margin): number`
- Produces: `fitObjectToCamera(camera, object, target, direction, margin): number`
- Consumed by: Task 2 scene presets and resize behavior.

- [ ] **Step 1: Write failing camera-fit tests**

Add tests proving all box corners fit inside horizontal and vertical frusta for wide, square, and portrait aspects; a smaller margin produces a closer distance; invalid input throws.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --experimental-strip-types --test tests/bike-scene.test.ts`
Expected: FAIL because `camera-fit.ts` does not exist.

- [ ] **Step 3: Implement the pure fitting functions and integrate them into `scene.ts`**

Use the camera basis and every world-space bounding-box corner. Preserve the selected view direction across resize.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --experimental-strip-types --test tests/bike-scene.test.ts`
Expected: all tests pass.

### Task 2: Premium OEM studio presentation

**Files:**
- Modify: `src/bike3d/scene.ts`
- Modify: `src/bike3d/model.ts`
- Modify: `src/bike3d/BikeViewer.tsx`
- Modify: `src/bike3d/Studio.tsx`
- Modify: `src/bike3d/studio.css`
- Test: `tests/bike-model.test.ts`
- Test: `tests/build-materials.test.ts`

**Interfaces:**
- Consumes: Task 1 camera fitting.
- Produces: fixed camera presets and deterministic material/studio configuration used by the live viewer.

- [ ] **Step 1: Write failing presentation-contract tests**

Add assertions for the fixed camera preset registry, OEM-only viewer language, accuracy warning, and stock material response values.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --experimental-strip-types --test tests/bike-model.test.ts tests/build-materials.test.ts`
Expected: FAIL on missing presentation contracts.

- [ ] **Step 3: Implement studio rendering and UI changes**

Add the camera registry, projected fitting, seamless studio floor/backdrop, controlled lighting/tone mapping, darker saturated OEM materials, visible selected-view state, and concise OEM-only inspection copy.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node --experimental-strip-types --test tests/bike-model.test.ts tests/build-materials.test.ts`
Expected: all focused tests pass.

### Task 3: Browser and artifact verification

**Files:**
- Modify: `docs/superpowers/plans/ktm-review-build.md`
- Create: `artifacts/bike-builder/ktm-oem-viewer-browser.png` (verification artifact, ignored if configured)

**Interfaces:**
- Consumes: Tasks 1 and 2 live viewer.
- Produces: fresh build, GLB validation, and browser-interaction evidence.

- [ ] **Step 1: Run 3D-focused tests, typecheck, production build, and GLB validation**

Run the focused Node tests, `npm run typecheck`, `npm run build`, and the existing export/validator path. Record exact results and retain any unrelated baseline failure separately.

- [ ] **Step 2: Exercise the actual viewer in Chrome**

Load `/bike-builder.html`, capture the default view, invoke every camera preset, perform orbit and zoom input, expand/collapse, and verify a non-empty canvas with no page errors.

- [ ] **Step 3: Update the review handoff**

Record the new software/browser evidence, keep visual acceptance open, and state that physical-iPhone validation remains unverified.
