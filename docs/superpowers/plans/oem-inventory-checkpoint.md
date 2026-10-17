# OEM geometry and inventory checkpoint — 2026-10-17

## Outcome
Partial progress, NOT completion of accurate HD OEM models or broad inventory research.
One estimated model remains: 2025 KTM 450 SX-F, standard US. No other bike has been given a copied or mislabeled model.

## This pass
- Corrected drivetrain to rider-left and rear brake to rider-right. Front brake remains left. Contract uses +Z rider-right.
- Replaced solid rear sprocket disk with 51-tooth, cut-out geometry. Catalog item 7771015105130 supports 51 teeth; 50310165118 supports 5/8-inch chain pitch. Pitch-circle radius is calculated from pitch and tooth count. Profile, cut-outs, width and mount positions remain ESTIMATED, not exact engineering CAD.
- Added nine ODI grip families, 28 researched choices. Total shared mappings: 19; color-backed mappings: 18; part-color choices: 52. Three separate plastics presets are unchanged.
- All new colors retain maker source URLs in shared/build-visual.ts. Names are supported by the maker's pages checked 2026-10-17; hex swatches are APPROXIMATE. Palettes are partial when only some names were published in the retrieved page. No color is inferred from a SKU.
- New grips remain tier 1 (stock shape), not exact product geometry. Cam/tube/bar compatibility remains unverified.
- Coverage reporter now supports --all, exposing per-part-type counts across five family files without claiming those bikes have models.

## Evidence
The existing public/bike-builder/ktm-450-sxf-2025.references.json records catalog sources and KTM photo URLs. The available right-side OEM studio image supports the rear brake/drive-side correction. Neither that image nor the catalog supplies accurate full exterior surfaces. Reference photos are not bundled as textures.

## Validation ledger
The new side-layout and sprocket tests failed before implementation and passed afterward. The nine-family color regression failed at zero choices before implementation, then passed for all 28 new choices. The all-family coverage test failed before the report mode existed, then passed.
Initial full verification: 228 root tests, web typecheck/build, 12 mobile tests/typecheck, regenerated native viewer and freshness check. An additional coverage test was added afterward; final rerun recorded below.
Export: 1,165,236 bytes; 54 mesh objects; 38,302 rendered triangles. GLB validator: zero errors, zero warnings. GPU instancing remains outside validator coverage.
Automated validation does not establish visual fidelity, real-device interaction, performance or restart acceptance.
Final verification: 229/229 root tests, web typecheck and production build; 12/12 mobile tests and typecheck; native viewer freshness; successful iOS and Android Expo exports. Fresh reviewer independently passed 26 focused tests and found no critical or important introduced defects.
Final: minor (deferred): the sprocket regression checks tooth metadata, mesh density and diameter, but not actual hole/contour topology. A stronger cut-out raycast test remains follow-up test hardening.

## Ruling
Retain BLOCKOUT_NOT_OEM_VERIFIED and do not populate other bike identities with this mesh. Available evidence does not justify accurate-HD claims. Cost: HD delivery remains unfinished and requires further platform-specific modeling, multi-view validation and Kyle's approval.

## Remaining acceptance
- Accurate model surfaces and proportions, including front/top/three-quarter review.
- Additional bike platforms, each with its own evidence and asset.
- Broader brands/categories: most grips, bars, wheels, exhausts, sprockets, seats, guards and plastics catalog variants have no finish mapping.
- Physical iPhone gestures, persistence/restart and frame-time/memory checks.
- Kyle's visual approval. Tier-3 exact aftermarket models remain out of scope.

## Reproduce coverage
`node --experimental-strip-types scripts/bike-color-coverage.ts` reports the pilot.
`node --experimental-strip-types scripts/bike-color-coverage.ts --all` reports all family inventory rows, grouped into unique picker names per system/family. Services are excluded; both fuel-system types are included. Counts across families overlap; do not sum them as global unique products. A mapping is not a fitment certification.

Pilot grips: 10/126 color-backed choices (previously 1/126). Other pilot numerators are unchanged: handlebars 1/81, rims/wheels 2/42, chain 1/74, triple clamps 1/9, skid plates 1/20, slip-ons 1/11 and full exhausts 1/8. Plastics preset counts are not catalog coverage.

## All-family coverage snapshot

All-family color research, not OEM model coverage or fitment certification. Unique picker names per system/family; services excluded. Repeated families are not global unique products.

Inventory: honda.json
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Insert or spark arrester | 0 | 25 |
| Slip-on muffler | 0 | 26 |
| Full exhaust system | 0 | 41 |
| Head pipe | 0 | 5 |
| Fork (cartridge, conversion, kit) | 0 | 39 |
| Shock spring | 0 | 2 |
| Valving, bladder or perch kit | 0 | 4 |
| Holeshot device | 0 | 5 |
| Linkage | 0 | 13 |
| Fork springs | 0 | 3 |
| Shock | 0 | 14 |
| Preload adjuster | 0 | 3 |
| Engine covers | 0 | 5 |
| Piston or top end | 0 | 26 |
| Radiators and cooling | 0 | 44 |
| Big bore or cylinder | 0 | 18 |
| Head work | 0 | 6 |
| Cams | 0 | 4 |
| Clutch cover | 0 | 16 |
| Plates | 0 | 23 |
| Basket or hub | 0 | 12 |
| Auto clutch | 0 | 9 |
| Hydraulic clutch | 0 | 2 |
| Carburetor and jetting | 0 | 34 |
| Fuel injection | 0 | 7 |
| ECU, tuner or map switch | 0 | 5 |
| Air filter | 0 | 49 |
| Airbox or cover | 0 | 7 |
| Chain | 1 | 108 |
| Rear sprocket | 0 | 41 |
| Chain and sprocket kit | 0 | 3 |
| Front sprocket | 0 | 27 |
| Pads | 0 | 60 |
| Rotor | 0 | 55 |
| Brake lines | 0 | 22 |
| Caliper or master cylinder | 0 | 7 |
| Grips | 10 | 191 |
| Footpegs | 0 | 63 |
| Hand guards | 0 | 88 |
| Levers and perches | 0 | 114 |
| Bar mounts or clamps | 0 | 86 |
| Handlebar | 1 | 123 |
| Chain guide or slider | 0 | 27 |
| Triple clamps | 0 | 12 |
| Steering damper | 0 | 4 |
| Engine mounts | 0 | 1 |
| Wheels | 2 | 58 |
| Tires | 0 | 239 |
| Mousse or tube | 0 | 1 |
| Skid plate | 1 | 34 |
| Disc or link guards | 0 | 1 |
| Plastics | 0 | 74 |
| Seat | 0 | 28 |
| Gas tank | 0 | 13 |

Inventory: kawasaki.json
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Insert or spark arrester | 0 | 28 |
| Slip-on muffler | 0 | 19 |
| Head pipe | 0 | 7 |
| Full exhaust system | 0 | 34 |
| Fork (cartridge, conversion, kit) | 0 | 37 |
| Shock | 0 | 16 |
| Holeshot device | 0 | 9 |
| Valving, bladder or perch kit | 0 | 4 |
| Linkage | 0 | 11 |
| Fork springs | 0 | 5 |
| Preload adjuster | 0 | 4 |
| Shock spring | 0 | 2 |
| Radiators and cooling | 0 | 42 |
| Head work | 0 | 6 |
| Engine covers | 0 | 8 |
| Big bore or cylinder | 0 | 11 |
| Piston or top end | 0 | 33 |
| Cams | 0 | 2 |
| Plates | 0 | 21 |
| Basket or hub | 0 | 11 |
| Clutch cover | 0 | 13 |
| Auto clutch | 0 | 7 |
| Carburetor and jetting | 0 | 34 |
| ECU, tuner or map switch | 0 | 4 |
| Fuel injection | 0 | 5 |
| Air filter | 0 | 41 |
| Airbox or cover | 0 | 8 |
| Chain | 1 | 110 |
| Rear sprocket | 0 | 42 |
| Front sprocket | 0 | 26 |
| Chain and sprocket kit | 0 | 5 |
| Brake lines | 0 | 20 |
| Caliper or master cylinder | 0 | 6 |
| Rotor | 0 | 46 |
| Pads | 0 | 81 |
| Bar mounts or clamps | 0 | 85 |
| Handlebar | 1 | 124 |
| Grips | 7 | 188 |
| Footpegs | 0 | 66 |
| Hand guards | 0 | 88 |
| Levers and perches | 0 | 110 |
| Chain guide or slider | 0 | 30 |
| Triple clamps | 0 | 14 |
| Steering damper | 0 | 2 |
| Engine mounts | 0 | 2 |
| Tires | 0 | 239 |
| Wheels | 2 | 55 |
| Mousse or tube | 0 | 1 |
| Skid plate | 1 | 37 |
| Disc or link guards | 0 | 1 |
| Plastics | 0 | 68 |
| Seat | 0 | 23 |
| Gas tank | 0 | 11 |

Inventory: ktm-family.json
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Slip-on muffler | 1 | 91 |
| Insert or spark arrester | 0 | 27 |
| Two-stroke pipe | 0 | 46 |
| Full exhaust system | 1 | 29 |
| Head pipe | 0 | 8 |
| Valving, bladder or perch kit | 0 | 6 |
| Holeshot device | 0 | 13 |
| Shock | 0 | 25 |
| Fork (cartridge, conversion, kit) | 0 | 68 |
| Linkage | 0 | 18 |
| Preload adjuster | 0 | 8 |
| Fork springs | 0 | 3 |
| Shock spring | 0 | 2 |
| Radiators and cooling | 0 | 74 |
| Head work | 0 | 7 |
| Piston or top end | 0 | 49 |
| Engine covers | 0 | 20 |
| Big bore or cylinder | 0 | 14 |
| Auto clutch | 0 | 10 |
| Hydraulic clutch | 0 | 17 |
| Clutch cover | 0 | 30 |
| Basket or hub | 0 | 6 |
| Plates | 0 | 19 |
| Carburetor and jetting | 0 | 35 |
| Fuel injection | 0 | 16 |
| ECU, tuner or map switch | 0 | 21 |
| Air filter | 0 | 92 |
| Airbox or cover | 0 | 17 |
| Reed valve | 0 | 6 |
| Chain | 1 | 127 |
| Rear sprocket | 0 | 66 |
| Front sprocket | 0 | 29 |
| Chain and sprocket kit | 0 | 3 |
| Rotor | 0 | 86 |
| Pads | 0 | 97 |
| Caliper or master cylinder | 0 | 23 |
| Brake lines | 0 | 19 |
| Footpegs | 0 | 59 |
| Grips | 10 | 225 |
| Handlebar | 1 | 148 |
| Levers and perches | 0 | 145 |
| Bar mounts or clamps | 0 | 97 |
| Hand guards | 0 | 104 |
| Triple clamps | 1 | 31 |
| Chain guide or slider | 0 | 40 |
| Steering damper | 0 | 13 |
| Engine mounts | 0 | 1 |
| Wheels | 2 | 95 |
| Tires | 0 | 260 |
| Mousse or tube | 0 | 1 |
| Skid plate | 1 | 71 |
| Disc or link guards | 0 | 2 |
| Plastics | 0 | 94 |
| Gas tank | 0 | 27 |
| Seat | 0 | 71 |

Inventory: triumph.json
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Insert or spark arrester | 0 | 24 |
| Slip-on muffler | 0 | 23 |
| Full exhaust system | 0 | 21 |
| Head pipe | 0 | 7 |
| Two-stroke pipe | 0 | 1 |
| Fork (cartridge, conversion, kit) | 0 | 24 |
| Valving, bladder or perch kit | 0 | 3 |
| Holeshot device | 0 | 4 |
| Shock | 0 | 5 |
| Linkage | 0 | 6 |
| Fork springs | 0 | 3 |
| Shock spring | 0 | 2 |
| Radiators and cooling | 0 | 13 |
| Head work | 0 | 6 |
| Piston or top end | 0 | 2 |
| Basket or hub | 0 | 3 |
| Plates | 0 | 4 |
| Clutch cover | 0 | 4 |
| Hydraulic clutch | 0 | 3 |
| Auto clutch | 0 | 2 |
| Carburetor and jetting | 0 | 34 |
| Fuel injection | 0 | 3 |
| ECU, tuner or map switch | 0 | 3 |
| Air filter | 0 | 36 |
| Airbox or cover | 0 | 4 |
| Chain | 1 | 100 |
| Rear sprocket | 0 | 32 |
| Front sprocket | 0 | 9 |
| Brake lines | 0 | 4 |
| Pads | 0 | 29 |
| Rotor | 0 | 22 |
| Caliper or master cylinder | 0 | 4 |
| Levers and perches | 0 | 59 |
| Grips | 10 | 188 |
| Handlebar | 1 | 117 |
| Hand guards | 0 | 87 |
| Bar mounts or clamps | 0 | 71 |
| Footpegs | 0 | 16 |
| Triple clamps | 0 | 7 |
| Chain guide or slider | 0 | 10 |
| Steering damper | 0 | 1 |
| Tires | 0 | 239 |
| Wheels | 0 | 20 |
| Mousse or tube | 0 | 1 |
| Skid plate | 1 | 15 |
| Disc or link guards | 0 | 1 |
| Plastics | 0 | 37 |
| Gas tank | 0 | 8 |
| Seat | 0 | 9 |

Inventory: yamaha.json
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Slip-on muffler | 0 | 66 |
| Insert or spark arrester | 0 | 26 |
| Two-stroke pipe | 0 | 27 |
| Full exhaust system | 1 | 38 |
| Head pipe | 0 | 10 |
| Fork (cartridge, conversion, kit) | 0 | 45 |
| Shock | 0 | 16 |
| Holeshot device | 0 | 7 |
| Preload adjuster | 0 | 3 |
| Valving, bladder or perch kit | 0 | 5 |
| Fork springs | 0 | 3 |
| Linkage | 0 | 13 |
| Shock spring | 0 | 3 |
| Big bore or cylinder | 0 | 28 |
| Piston or top end | 0 | 46 |
| Radiators and cooling | 0 | 46 |
| Engine covers | 0 | 17 |
| Head work | 0 | 6 |
| Cams | 0 | 2 |
| Clutch cover | 0 | 25 |
| Basket or hub | 0 | 26 |
| Auto clutch | 0 | 10 |
| Plates | 0 | 32 |
| Hydraulic clutch | 0 | 3 |
| Carburetor and jetting | 0 | 37 |
| Fuel injection | 0 | 7 |
| ECU, tuner or map switch | 0 | 6 |
| Air filter | 0 | 50 |
| Airbox or cover | 0 | 10 |
| Reed valve | 0 | 9 |
| Chain | 1 | 113 |
| Rear sprocket | 0 | 46 |
| Front sprocket | 0 | 29 |
| Chain and sprocket kit | 0 | 6 |
| Pads | 0 | 57 |
| Caliper or master cylinder | 0 | 9 |
| Rotor | 0 | 59 |
| Brake lines | 0 | 26 |
| Hand guards | 0 | 88 |
| Grips | 9 | 191 |
| Levers and perches | 0 | 108 |
| Bar mounts or clamps | 0 | 82 |
| Handlebar | 1 | 116 |
| Footpegs | 0 | 69 |
| Triple clamps | 0 | 16 |
| Chain guide or slider | 0 | 36 |
| Steering damper | 0 | 2 |
| Tires | 0 | 239 |
| Wheels | 2 | 60 |
| Mousse or tube | 0 | 1 |
| Skid plate | 1 | 46 |
| Disc or link guards | 0 | 1 |
| Gas tank | 0 | 14 |
| Plastics | 0 | 75 |
| Seat | 0 | 37 |


