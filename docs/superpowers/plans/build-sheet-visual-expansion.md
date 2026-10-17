# Visual expansion checkpoint — 2026-10-17

## Definition of done for this pass
Expand source-backed pilot selections and modular rendering; preserve the existing app and database architecture; prove material isolation, removal, conflict fallback and GLB round trips; regenerate web/native builds; upload only the authorized feature branch.

## Implemented
- Independent stock material channels: bars, grips, clamps, front/rear rims, hubs and spokes, chain, rear sprocket, exhaust and seat. These channels do not mean every catalog product now has researched finishes.
- Shared versioned representative asset contract: fat bar, crossbar, billet clamps, skid plate, frame guards, radiator braces, hand guards, full exhaust and slip-on. All geometry and hardpoint coordinates remain estimated, unbranded blockout shapes.
- Live catalog bindings: existing Renthal Fatbar now representative fat bar; ODI Rogue grips; RK 520MXU chain; Xtrig ROCS Pro clamps; AXP Skid Plate; Acerbis X Ultimate open hand guards; FMF titanium slip-on; existing Excel rims and FMF full exhaust.
- Crossbar, frame guards and radiator braces have tested asset factories but no catalog bindings yet. They are not advertised as selectable products.
- Three plastics presets: White, Black and Nardo Grey, plus OEM reset. Only exact pilot platform exposes these options.
- Slip-on preserves stock header; full system replaces header and muffler. Conflicting exhaust selections display stock.
- Explicitly typed lookalikes and wrong-system entries are not treated as catalog-mapped products.
- Legacy writeInstalled callers that omit plastics preserve saved selection; explicit undefined resets it.
- Picker no longer hides a complete slip-on merely because its name mentions an included carbon cap.
- GLB binary export/reimport tests confirm replaced stock geometry is absent.

## Evidence and limitations
Manufacturer URLs are attached to each color and fitment record in shared/build-visual.ts. Named colors are supported by manufacturer listings; all display hex values remain APPROXIMATE. No manufacturer hex specification was found. AXP, ODI, RK and Xtrig mappings are family-level: exact mount/offset/link-count/product variant compatibility is not certified.

Sources checked 2026-10-17:
- ODI Rogue MX: https://www.odigrips.com/collections/moto-grips/products/rogue-mx-single-ply-grips
- RK MXU: https://global.rk-japan.co.jp/products/motorcycle-chains/mxu/
- Xtrig family listings: https://www.xtrig-shop.com/en_US
- AXP AX1651: https://www.axp-racing.com/en/skid-plates-6mm/250-skid-plate-ktm-450-500-husqvarna-450-501-gasgas-450-500-black-ax1651.html
- AXP color variants: https://www.axp-racing.com/en/skid-plates-6mm/252-skid-plate-husqvarna-fc450-fe450-fx450-fe501-blue-ax1653.html
- FMF 045669: https://www.fmfracing.com/collections/emissions-controlled-exempt/products/factory-4-1-rct-titanium-anodized-sl-slip-on-w-carbon-cap-045669
- Polisport Black 91615: https://www.polisport.com/en/off-road/replica-plastics/ktm-plastics/full-plastic-kit-ktm-sxsx-fxcxc-f-2025-26_p16117.html
- Polisport Nardo Grey 91616: https://www.polisport.com/en/off-road/replica-plastics/ktm-plastics/full-plastic-kit-ktm-sxsx-fxcxc-f-2025-26_p16118.html
- Acerbis open-guard type: https://www.acerbisusa.com/p11999-x-ultimate (indexed maker listing; direct detail fetch failed; no colors entered).

## Still not complete
Accurate HD OEM surfaces, exact-bike models beyond the 2025 KTM 450 SX-F US standard, broad inventory finish research, product-specific tier-3 models (not authorized), physical iPhone/restart tests, gestures and measured frame rate/memory, Kyle's side/front/top/three-quarter visual approval. No verified front/top envelope dimensions were discovered; existing estimated OEM contours were not relabeled as accurate.

Ruling: leave unknown colors empty and unverified OEM surfaces unchanged rather than imply evidence that is not available. Cost: limited visual/catalog coverage and the HD milestone remains open.

## Validation ledger
Focused RED→GREEN tests exercised missing independent targets, accessory construction/removal, manufacturer-choice expansion, legacy save preservation, exhaust conflicts, lookalike rejection, picker slip-on classification and fat-bar mapping. Actual GLB round-trip regression also passes.
Verified after review fixes: 225 root tests, root type check and production build; 12 mobile tests and mobile type check; native viewer regeneration and freshness check. Stock GLB is 1,009,024 bytes with 54 mesh objects and 36,758 rendered triangles. Validator reports zero errors/warnings; instancing remains outside its validation coverage. Native export is rerun after the final bundle update. No database mutation, merge, deployment or paid service.

Final fresh review: reproduced and fixed unknown slip-on stock-finish inheritance and conflicting unmapped full-system selections. Both regression tests failed before the fixes. Inserts do not trigger exhaust conflicts.
Deferred minor: the accessory factory's public type still accepts the separately handled full-exhaust ID; the runtime caller excludes that ID and constructs it in apply-build. Narrowing the factory signature remains a type-safety cleanup.

## Coverage
Counts are unique pilot picker choices. A color mapping is not exact geometry or verified fitment. Acerbis has a generic shape binding but zero researched color choices. Plastics presets are separate from catalog-product coverage. Complete cap-equipped slip-ons now appear in the picker, increasing that denominator.

Pilot: KTM 450 SX-F 2025; unique picker choices, not global inventory coverage.
| Part type | Choices with color data | Total choices |
|---|---:|---:|
| Insert or spark arrester | 0 | 14 |
| Slip-on muffler | 1 | 11 |
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
| Chain | 1 | 74 |
| Rear sprocket | 0 | 39 |
| Front sprocket | 0 | 17 |
| Chain and sprocket kit | 0 | 2 |
| Pads | 0 | 48 |
| Rotor | 0 | 25 |
| Caliper or master cylinder | 0 | 9 |
| Brake lines | 0 | 3 |
| Grips | 1 | 126 |
| Handlebar | 1 | 81 |
| Levers and perches | 0 | 51 |
| Bar mounts or clamps | 0 | 28 |
| Hand guards | 0 | 52 |
| Footpegs | 0 | 15 |
| Triple clamps | 1 | 9 |
| Chain guide or slider | 0 | 16 |
| Steering damper | 0 | 4 |
| Wheels | 2 | 42 |
| Tires | 0 | 1 |
| Skid plate | 1 | 20 |
| Plastics | 0 | 29 |
| Gas tank | 0 | 7 |
| Seat | 0 | 18 |
