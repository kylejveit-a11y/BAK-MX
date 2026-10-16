# In-house bike builder: first working milestone

Approved direction: build in house using free tooling, exterior surfaces only, OEM first, modular aftermarket-ready components. Pilot identity is standard US 2025 KTM 450 SX-F. Do not claim a geometry approximation is verified OEM.

Use a deterministic Three.js component generator shared by an internal browser studio and a gated web Garage card. Generate original editable geometry; no purchased/extracted meshes or copied graphics. The studio supports orbit/elevation/zoom, fixed camera views, component visibility, wireframe, parameter edits, source links, and GLB export. A Blender import helper preserves the editable component groups. Reference metadata retains OEM inventory mappings and separates measured anchors from estimated coordinates.

The first milestone is a usable authoring tool and exterior blockout, not a completed photorealistic asset. Native Expo integration follows after geometry and browser memory/performance pass review. Unsupported years/trims never receive this model. Garage preview is opt-in via VITE_BIKE_BUILDER_PREVIEW=true and visibly labeled prototype. No database changes, production deployment, or paid services.

Validation: identity exclusions; finite geometry; documented wheelbase; separable components and inventory mapping; parameter bounds; clean TypeScript/build; actual browser rendering, export/reimport, controls, fallback and lifecycle tests. Retain a progress ledger and references so another session can continue without guessing.
