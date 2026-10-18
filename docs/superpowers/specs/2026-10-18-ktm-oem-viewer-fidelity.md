# KTM OEM Viewer Fidelity Specification

## Goal

Deliver a premium browser inspection experience for the stock 2025 KTM 450 SX-F Standard US while preserving an honest boundary between presentation quality and unverified OEM geometry.

## Product boundary

- The viewer represents one stock OEM motorcycle only: `KTM|450 SX-F|2025|standard|US`.
- Graphics-kit editing, custom decals, number personalization, aftermarket catalogs, and additional motorcycles are out of scope.
- Rival Ink and Garage 360 are visual-quality references only. Their assets, code, and configurator UI must not be copied.
- The existing modular component hierarchy and Garage material/part mappings must remain compatible.
- `BLOCKOUT_NOT_OEM_VERIFIED` remains until Kyle accepts the bike against exact-year reference views.

## Visual direction

The motorcycle must be the dominant subject. The default view is a front-right three-quarter inspection angle, framed tightly enough to reveal the engine, wheels, suspension, exhaust, controls, and bodywork without clipping. The scene uses a restrained dark studio background, seamless floor, soft contact shadow, controlled highlights, and physically plausible surface response.

KTM orange must stay saturated under the studio lighting. Rubber remains matte, the seat is slightly softer than plastics, machined and anodized parts carry controlled metallic highlights, and cast engine surfaces remain rougher than polished hardware. Presentation must not wash the bike toward cream or flatten the distinction between plastic, rubber, cast metal, and polished metal.

## Camera and interaction

- Default front-right three-quarter view plus right, left, front, rear, and top presets.
- Each preset fits the actual projected bounds of the motorcycle, not a conservative bounding sphere.
- A configurable framing margin prevents clipping while keeping the bike visually dominant.
- Drag orbits, wheel/pinch zooms, and preset changes invalidate rendering without a continuous idle render loop.
- Resizing and expanded mode preserve a useful fit.
- Camera framing math must be deterministic and unit-tested independently of WebGL.

## Rendering and resilience

- Three.js remains the browser runtime.
- ACES or AgX tone mapping, an environment map, soft key/fill/rim lighting, soft shadows, and a seamless floor establish the studio look.
- The viewer must retain the existing WebGL failure fallback and context-loss message.
- No runtime credential, third-party model request, or cross-origin dependency may be introduced.
- The checked-in GLB remains a reproducible interchange artifact; the original TypeScript authoring remains authoritative until a reviewed Blender master replaces it.

## Accuracy and acceptance

Software completion and visual acceptance are separate gates.

Software gate:

- TypeScript passes.
- 3D model and material regression tests pass.
- Production Vite build passes.
- GLB validation reports no errors or warnings.
- A real browser loads the viewer, renders a non-empty canvas, changes camera presets, orbits, and zooms without page errors.

Visual gate:

- Exact-year right, left, front-right, front, rear, and elevated references have been reviewed.
- Silhouette, stance, bodywork junctions, engine/exhaust masses, wheels, controls, and suspension are convincing at inspection distance.
- Kyle explicitly accepts the model.

Until every visual gate is met, the UI and exported metadata must describe the asset as an authored exterior study and not an OEM-verified model.

## Performance boundary

Desktop browser measurements are evidence for that browser only. iPhone frame rate, thermals, memory pressure, gesture behavior, and process-restart persistence remain unverified until tested on a physical iPhone. No desktop build or export may be reported as iPhone validation.

