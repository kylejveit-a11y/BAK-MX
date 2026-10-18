# 2025 KTM 450 SX-F Blender Reconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the synthetic procedural motorcycle with a coherent Blender-authored 2025 KTM 450 SX-F exterior study and ship all verified review artifacts.

**Architecture:** A deterministic `bpy` build owns the visible master and exports the checked-in Blender and GLB assets. The Three.js viewer loads that GLB while retaining the current generated bike only as a guarded fallback. Structural and image tests enforce semantic compatibility, curved-surface quality, framing, six-view differentiation, and interaction.

**Tech Stack:** Blender 5.2.2 Python API, glTF 2.0/GLB, Three.js, TypeScript, Node test runner, Pillow/NumPy review renderer, Playwright/Chromium-compatible browser automation, Vercel CLI.

**Spec:** `docs/superpowers/specs/2026-10-18-ktm-blender-reconstruction-design.md`

## Global Constraints

- Work only on `feat/in-house-bike-builder`.
- Scope is only `KTM|450 SX-F|2025|standard|US`.
- Preserve `BLOCKOUT_NOT_OEM_VERIFIED` everywhere.
- Do not merge main, deploy production, weaken preview protection, expose credentials, or claim OEM verification.
- Exact-year source photography is reference-only and is not committed.
- The Blender master and all shipped derivatives must be reproducible.

## Review Focus

- Missing/corrupt GLB must show the existing guarded fallback instead of a blank viewer.
- Mobile/offline packaging must not introduce a runtime network dependency.
- Semantic names used by part isolation and material replacement must survive Blender export.
- Front/rear views must not reveal gross shell asymmetry, flipped normals, or floating junctions.
- Orbit/zoom and all six presets must produce visible canvas changes on the protected deployment.

---

### Task 1: Freeze Visual Regressions

**Files:**
- Create: `tests/ktm-blender-asset.test.mjs`
- Create: `scripts/check-bike-renders.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test:bike-rebuild`, which validates master/export metadata, semantic groups, materials, curvature proxies, and six rendered silhouettes.

- [ ] Write asset and image tests that fail against the current imported procedural asset.
- [ ] Run the focused command and record the expected failures.
- [ ] Keep the tests focused on visible structure and compatibility, not arbitrary triangle inflation.
- [ ] Commit the red tests with the approved design documents.

### Task 2: Build the Blender Master

**Files:**
- Create: `scripts/build-ktm-blender-master.py`
- Replace: `assets/bike3d/ktm-450-sxf-2025.blend`
- Replace: `public/bike-builder/ktm-450-sxf-2025.glb`

**Interfaces:**
- Consumes: the fixed identity and semantic object names asserted by Task 1.
- Produces: deterministic `.blend` and GLB assets with scene metadata, component collections, and PBR materials.

- [ ] Implement profile/section mesh helpers and unified body shells in Blender.
- [ ] Reconstruct coherent powertrain/exhaust masses and integrate retained chassis hardpoints.
- [ ] Add named semantic groups and fixed metadata without copying reference photography.
- [ ] Export the Blender master and GLB, then run Task 1 until green.

### Task 3: Load the Authored GLB in the Viewer

**Files:**
- Modify: `src/bike3d/model.ts`
- Modify: `src/bike3d/BikeViewer.tsx`
- Modify: `src/bike3d/apply-build.ts`
- Modify: `tests/bike-model.test.ts`
- Modify: `tests/bike-visual.test.ts`

**Interfaces:**
- Consumes: `/bike-builder/ktm-450-sxf-2025.glb` and its semantic names.
- Produces: asynchronous primary asset loading with an explicit procedural fallback and preserved replacement/material behavior.

- [ ] Write failing loader/fallback and semantic-compatibility tests.
- [ ] Implement GLB-first loading without a third-party runtime request.
- [ ] Verify focused tests, typecheck, and the complete root suite.

### Task 4: Rebuild Review and Mobile Artifacts

**Files:**
- Replace: `public/bike-builder/ktm-450-sxf-2025-views/*.png`
- Replace: `public/bike-builder/ktm-450-sxf-2025-review.png`
- Replace: `public/bike-builder/ktm-450-sxf-2025-comparison.html`
- Replace: `apps/mobile/src/generated/bike-preview.json`
- Replace: `artifacts/bike-builder/offline-preview.html`

**Interfaces:**
- Consumes: the authoritative GLB from Task 2.
- Produces: six camera images, contact sheet/comparison, and self-contained mobile/offline payload.

- [ ] Render all six views and run silhouette/image regressions.
- [ ] Rebuild and freshness-check the native/offline payload.
- [ ] Run mobile typecheck/tests and the production Vite build.

### Task 5: Browser and Deployment Verification

**Files:**
- Replace: `public/bike-builder/ktm-450-sxf-2025-browser-three-quarter.png`
- Replace: `public/bike-builder/ktm-450-sxf-2025-browser-review.png`
- Modify: `docs/superpowers/specs/2026-10-18-ktm-oem-viewer-fidelity.md`

**Interfaces:**
- Produces: browser screenshots, deployment ID, protected share URL, and recorded verification evidence.

- [ ] Test local browser load, six presets, orbit, zoom, expand/collapse, console errors, and failed resources.
- [ ] Run GLB validator, focused tests, root checks, mobile checks, and artifact freshness checks.
- [ ] Commit and push `feat/in-house-bike-builder`.
- [ ] Create a fresh protected Vercel preview share link and verify the deployed page in a real browser without disabling protection.
- [ ] Record exact commit, deployment, verification results, visible improvements, and honest remaining gaps.
