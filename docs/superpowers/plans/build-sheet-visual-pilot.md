# Build-sheet visual pilot — 2026-10-16

## Scope and phases
The binding scope is an OEM bike viewer driven by fitted build-sheet parts, with preset plastics colors. No graphics/decal designer.
1. Shared saved finish IDs and mapping overlay: implemented for the pilot.
2. Separate plastics meshes and isolated material targets: implemented for bars, front/rear rims and plastics.
3. Generic full-exhaust replacement at a named hardpoint: implemented, labeled representative.
4. Web and offline iPhone WebView wiring: implemented; automated checks below, physical-device acceptance pending.
5. Broader manufacturer research, remaining tier-1 targets and tier-2 asset types: pending.
6. Accurate platform OEM mesh and Kyle's side/front/top/three-quarter approval: pending. Current geometry is a blockout, not an exact/HD OEM asset.
7. Tier-3 exact product models: out of scope until Kyle approves products.

Only the existing exact 2025 KTM 450 SX-F standard US preview is supported. Both preview feature flags remain required. Other bikes must not receive this platform mesh. Plastics controls are gated to the supported platform.

## Data and evidence
shared/build-visual.ts holds four mappings and maker-page URLs. Decoded catalog items receive a colors array through a shared overlay; unknown arrays are empty. Saved installed_parts entries carry color IDs; plastics_color belongs to the bike configuration. Both clients save through their existing bike update API. Server configuration schema accepts these fields. Serialization tests are not proof of physical-app restart behavior.

Names/options are sourced from manufacturer pages. All authored hex swatches are APPROXIMATE, not manufacturer color standards. Renthal colors are family-level; actual bend/color and clamp compatibility require checking. Excel drilling/hub fit remains unverified. FMF 045673 maker application supports the pilot, but geometry is generic. White Polisport 91614 is the sole added plastics preset; OEM restores original per-piece colors. No unsupported colors are guessed.

## Verification and review ledger
- Initial shared resolver and independent-material tests were run failing then passing.
- Picker-cleaned-name regression reproduced and fixed by normalizing inch quotes.
- Fresh reviewer found hidden stock exhaust included in GLB; exporter now honors descendant visibility while restoring top-level inspection toggles. Regression guard checks the export option; this is not a binary GLB round-trip test.
- Native bridge passes sanitized fitted-part and plastics data only, restores it after restart, and displays mapping labels with textContent.
- Web/mobile full checks and generated-native freshness checks are run before upload.
- Browser/physical iPhone interaction and account-backed restart persistence are NOT validated here.
- Ruling: restrict this checkpoint to source-backed pilot mappings rather than invent broad color data. Cost: most selected parts still show stock and broader acceptance remains incomplete.
- No merge or production deployment is included.

## Reproducible color coverage
Run node --experimental-strip-types scripts/bike-color-coverage.ts. Denominators are unique selectable pilot catalog choices, not global inventory or individual color SKUs. Plastics preset is separate from catalog mapping coverage. Zero means not researched/mapped, not proof that products lack options.

Pilot: KTM 450 SX-F 2025; unique picker choices, not global inventory coverage.
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Insert or spark arrester | 0 | 14 |
| Slip-on muffler | 0 | 9 |
| Full exhaust system | 1 | 8 |
| Head pipe | 0 | 3 |
| Valving, bladder or perch kit | 0 | 1 |
| Holeshot device | 0 | 3 |
| Fork (cartridge, conversion, kit) | 0 | 15 |
| Shock | 0 | 4 |
| Linkage | 0 | 4 |
| Fork springs | 0 | 1 |
| Preload adjuster | 0 | 2 |
| Radiators and cooling | 0 | 10 |
| Head work | 0 | 1 |
| Engine covers | 0 | 5 |
| Piston or top end | 0 | 3 |
| Auto clutch | 0 | 3 |
| Plates | 0 | 3 |
| Clutch cover | 0 | 8 |
| Hydraulic clutch | 0 | 5 |
| Fuel injection | 0 | 2 |
| ECU, tuner or map switch | 0 | 1 |
| Air filter | 0 | 36 |
| Airbox or cover | 0 | 3 |
| Chain | 0 | 74 |
| Rear sprocket | 0 | 39 |
| Front sprocket | 0 | 17 |
| Chain and sprocket kit | 0 | 2 |
| Pads | 0 | 48 |
| Rotor | 0 | 25 |
| Caliper or master cylinder | 0 | 9 |
| Brake lines | 0 | 3 |
| Grips | 0 | 126 |
| Handlebar | 1 | 81 |
| Levers and perches | 0 | 51 |
| Bar mounts or clamps | 0 | 28 |
| Hand guards | 0 | 52 |
| Footpegs | 0 | 15 |
| Triple clamps | 0 | 9 |
| Chain guide or slider | 0 | 16 |
| Steering damper | 0 | 4 |
| Wheels | 2 | 42 |
| Tires | 0 | 1 |
| Skid plate | 0 | 20 |
| Plastics | 0 | 29 |
| Gas tank | 0 | 7 |
| Seat | 0 | 18 |
