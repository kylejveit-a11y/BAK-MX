# Research brief, November 2026: small bikes, complete suspension sets, big-bike re-run

Shared instructions for every research worker in this pass. Read all of it before searching.

## What BAK MX needs

Riders build their bike in the Garage by picking what is fitted. Today the pick lists are thin for the small bikes
(50/65/85/112/150 class) and almost nothing exists for complete aftermarket suspension: whole fork sets, shock sets,
cartridge kits, WP Cone Valve fork conversions, WP Trax shocks, A-kits. A rider who owns a KTM 85 SX with WP Cone Valve forks
and a Trax shock cannot record them. Fill those gaps with real, attributable products.

## Output format (strict)

Write ONE JSON file at the path your task names, shaped exactly like the existing files in
`docs/research/aftermarket/specialty/` (open `specialty/suspension2.json` and copy its shape):

```json
{"slice":"<short name>","retrieved":"2026-11-02","products":[ ... ],"gaps":["what you looked for and could not find"],"not_done":["blocked pages, unfinished areas"]}
```

Each product:

```json
{"id":"<file-prefix>-001","category":"suspension","subcategory":"fork cartridge kit","brand":"WP","product":"XACT PRO 7543 Cone Valve fork (85 cc)",
 "part_numbers":["..."],"variants":["text: variant = part number"],
 "fits":[{"make":"KTM","model":"85 SX 19/16","years":[2025,2026,2027],"notes":"source wording for the fitment, quoted briefly"}],
 "fitment_source_url":"https://...","what_it_changes":"what the maker says it does, attributed, in plain words",
 "supporting_parts":"other parts or services needed","price":{"amount":0,"currency":"USD","as_of":"2026-11-02","url":"..."},
 "confidence":"high|medium|unverified","feedback":[],"rider_feedback":["short attributed rider or tester comment, if found"],
 "caveats":"limits, doubts, what to verify","is_service":false}
```

- `category` must be one of: exhaust, suspension, engine, clutch, tuning, intake, gearing, brakes, controls, chassis, wheels,
  protection, body, oils.
- `make` and `model` must be EXACTLY one of the app's names in `scratchpad/models.txt`-style list below (case and spacing
  matter: "85 SX 19/16", "TC 85", "MC 85", "KX85", "YZ85", "CRF150R", "KX112", "50 SX", "TC 50", "MC 50", "65 SX", "TC 65",
  "MC 65", "KX65", "YZ65"). For KTM 85 SX list both "85 SX 17/14" and "85 SX 19/16" when a part fits both wheel sizes.
- `years` only within the app's years for that model (below). If the source says "2018+", list the app years it covers.
- A part that is sold as a service (revalve, porting, cylinder work, ECU flash) gets `"is_service":true`.

## Rules that matter

1. Never invent a part number, a fitment, a price or a spec. If you can't see it on a page, leave it out and say so in `gaps`.
2. `confidence`: "high" only when the fitment and part number are on the manufacturer's own page or catalog; "medium" when a
   major dealer or retailer lists them; "unverified" otherwise.
3. Prefer the manufacturer's site, then large dealers (Rocky Mountain ATV/MC, MotoSport, Cycle Gear, Partzilla, AOMC, KTM
   Twins, Lings), then magazines (MXA, Dirt Bike Magazine, Racer X, Keefer Tested, Vital MX) for rider feedback.
4. Keep quotes short (a few words). Summarise in your own words. No copying of long marketing text.
5. Work fast and broad: breadth across every bike in your scope matters more than perfect detail on one product.
   Aim for at least 60 products unless your scope genuinely has fewer.
6. Do not edit any other file. Do not touch app code. Write only your output JSON.
7. If a site blocks you, note it in `not_done` and move on.

## App models and years (motocross and cross-country only; enduro models are out of scope)

GasGas: MC 50 (2021-2027), MC 65 (2021-2027), MC 85 (2021-2027), MC 125 (2021-2026), MC 250 (2022-2026), MC 250F (2021-2027),
MC 350F (2022-2025), MC 450F (2021-2027)
Honda: CRF150R (2020-2027), CRF250R (2020-2027), CRF450R (2020-2027), CRF250RX (2020-2027), CRF450RX (2020-2027)
Husqvarna: TC 50 / TC 65 / TC 85 (2020-2027), TC 125 (2020-2026), TC 150 (2025), TC 250 (2020-2026), TC 300 (2025),
FC 250 / FC 350 / FC 450 (2020-2027), FX 350 / FX 450, TX 300
KTM: 50 SX / 65 SX / 85 SX 17/14 / 85 SX 19/16 (2020-2027), 125 SX (2020-2027), 150 SX (2020-2025), 250 SX (2020-2026),
300 SX (2023-2026), 250 SX-F / 350 SX-F / 450 SX-F (2020-2027), 125 XC, 250 XC, 300 XC, 250 XC-F, 350 XC-F, 450 XC-F
Kawasaki: KX65 (2020-2027), KX85 (2020-2027), KX112 (2022-2027), KX250 (2020-2026), KX450 (2020-2026), KX250X, KX450X
Suzuki: RM-Z250, RM-Z450 (2020-2027)
Triumph: TF 250-X (2024-2027), TF 450-X (2026-2027), TF 450-RC Edition (2025), TF 250-C, TF 450-C (2026)
Yamaha: YZ65 (2020-2027), YZ85 (2020-2027), YZ125, YZ250, YZ250F, YZ450F (2020-2027), YZ125X, YZ250X, YZ250FX, YZ450FX
