# Parts fitment (interchange) research review

Pass 1, 2026-11-07. Answers the question riders ask Ask BAK most: "will a part from year X fit my year Y?". Records are in
`fitment_ktm_group.json`, `fitment_honda.json`, `fitment_yamaha.json`, `fitment_kawasaki.json` and `fitment_triumph.json`
(standard record format, see `../BIKE_KNOWLEDGE_STANDARD.md`). Every record says what fits, what does not and the catch
(spacers, axle, rim width, special editions, different brakes), with the source URL and date.

Output: **65 records, 1,810 bike-year rows** (KTM group 28 records / 1,300 rows, Yamaha 11 / 224, Honda 12 / 144, Kawasaki 8 / 112, Triumph 6 / 30) (`scripts/knowledge/build_rows.py`, no validation problems, no fitment
record skipped). Not loaded to the database.

## Method

1. **Same OEM part number across years = fits.** Part numbers were read from public OEM parts fiche pages (no login, no
   bot protection), one request every 2-3 seconds:
   - Honda, Kawasaki, KTM: Sun City Motorcycles partFinder fiche (Australian distributor catalogues; KTM US and EU models).
   - Yamaha: City West Yamaha partFinder fiche (Yamaha Australia catalogue).
   - Triumph: triumphpartstore.com (Triumph Waukesha) assembly pages.
   Parts were compared by function code (Honda 5-digit prefix, Yamaha middle block, Kawasaki 5-digit prefix, KTM/Triumph by
   description). A complete assembly number changing (wheel, fork, shock) is not taken as "does not fit": the record then
   compares the hub, axle, clamp, mount or frame parts underneath and says so.
2. **Maker accessory fitment.** KTM PowerParts, Husqvarna and GASGAS Technical Accessories browsers list each accessory
   (factory wheels, triple clamps, plastics kits, seats, sprockets, chains, discs, exhausts, airbox parts) against model
   years. The same accessory number across years or brands means the mounting interface is the same. Harvested 2026-10-22
   into `docs/research/aftermarket/ktm-family/`; reused here and cross-checked against the KTM spare-parts fiche.
3. **Maker model-change announcements** set the generation boundaries (KTM 2022 Factory Edition, Husqvarna 2022 Rockstar,
   KTM/Husqvarna 2025 changes, Honda 2021/2025, Kawasaki 2024/2025, Yamaha 2023/2024/2027, Triumph 2026).
4. Tier OEM for all part-number and maker-statement records. Confidence is `medium` where fit is inferred from identical
   mounting parts rather than one shared part number (whole forks and shocks, Honda 2023 top clamp, Yamaha two-stroke
   sprockets) or where the source is a maker spec reprint. No TUNER or COMMUNITY fitment claims were needed for this pass;
   one tuner linkage note sits in `notes` only.
5. Rider text names no magazines or testers; dealer fiche names appear only in `source`.

## Coverage

C = confirmed by identical part numbers or maker listing, P = partial (some years or inferred from mounting parts), U = unknown
(not researched or not published). Years in brackets are the years covered by part-number data.

| Platform | Wheels / hubs / axles | Brakes (discs, calipers) | Fork / shock (whole units) | Triple clamps / bar mounts | Plastics | Seat | Subframe | Swingarm / linkage | Sprockets / chain | Footpegs | Radiators | Airbox / filter | Exhaust | Levers / master cyl | ECU |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Honda CRF250R / CRF450R (2020-2025) | C | C | P | C (2023 top clamp P) | C | C | C | C | C | C | C | C | C | C | C (different, do not swap) |
| Yamaha YZ250F / YZ450F (2020-2027) | C | C | P | C | C | C | C | C | C (2022-on) | C | C | C | C | P | P |
| Yamaha YZ125 / YZ250 (2020-2027) | C | C | P | C | C | C | C | C | P | C | C | C | P | P | C (different, do not swap) |
| KTM 250/350/450 SX-F (2020-2027) | C | C | P | C | C | C | P | C | C | P (2020-2022 only) | P | C | C | C | U |
| KTM 125/250/300 SX (2020-2027) | C | C | P | C | C | C | P | C | C | P (2020-2022 only) | P | C | C | C | U |
| Husqvarna FC 250/350/450, TC 125/250/300 | C | P | P | C | C | C | P | P | C | P | U | C | C | P | U |
| GasGas MC 250F/350F/450F, MC 125/250 | C | P | U | C | C | C | P | P | C | P | P | P | P (4T C, 2T U) | P | U |
| Kawasaki KX250 / KX450 (2020-2025) | C | C | P | C | C | C | C | C | C | C | C | C | C | C | U |
| Triumph TF 250-X / TF 450 (2024-2026) | C | U | C | C | C | C | C | C | C | C | C | C | C | U | U |

## Headline answers the records support

- **KTM / Husqvarna:** front wheels swap across every SX/SX-F/TC/FC 2020-2027; rear wheels, triple clamps, plastics, seats,
  airbox and exhausts split at 2023 (2022 KTM Factory Edition and Husqvarna Rockstar Edition are already 2023-type);
  2025 changed linkage hardware, engine mounts, shrouds and (Husqvarna) seat and brakes. Sprockets and 520x118 chain fit
  every year and every brand. GasGas changes a year later (2024; the 2023 MC-F Factory Edition is 2024-type) and keeps
  its own seats, plastics and Braktec brakes.
- **Honda:** front and rear wheels swap 2020-2025 (catch: 2025 front axle, discs and caliper; 250 rear rim 1.85 vs 450
  2.15); CRF250R 2022-2024 shares the 2021-2024 CRF450R chassis, bodywork, swingarm and filter; 2025 is a new chassis for
  both.
- **Yamaha:** the YZ250F uses the previous year's YZ450F chassis family (B2W, BHR, D03); front wheels swap across all
  four-strokes 2021-2027; YZ125/YZ250 frames, clamps, swingarm and wheels are unchanged 2020-2027 (bodywork changed 2022).
- **Kawasaki:** the KX250 2021-2024 shares the 2020-2023 KX450 swingarm, linkage, rear frame, wheels, bodywork and
  filter; the 2024 KX450 changed fork, shock, linkage, frame, rear hub, discs and bodywork but kept its triple clamps and
  swingarm.
- **Triumph:** wheels, frame, swingarm, footpegs, front mudguard and filter are shared by every TF; subframe, shock, forks
  and yokes are 250- or 450-specific; the 2026 TF 250-X changed silencer, airbox and side panels.

## Gaps

- **Not in the fiche at time of check:** Honda 2026-2027, Kawasaki KX250 2025-2026 and KX450 2026, Yamaha 2027 YZ450F,
  Triumph 2027 TF 250-X, KTM 2027 in the spare-parts fiche (KTM 2020-2026 compared; PowerParts fitment covers 2027). These years
  carry maker change statements only.
- **Market:** Honda, Kawasaki and Yamaha numbers are from Australian catalogues. CRF-R, KX and YZ chassis parts are
  normally world parts, but a US-fiche spot check per brand should be done before promotion.
- **Husqvarna and GasGas OEM fiche** were not available on the sources used; their records rely on maker accessory listings
  and the KTM sibling relationship. Whole-unit fork and shock fit, radiators and ECUs are unknown for them.
- **ECUs:** documented as different (do not swap) for Honda and Yamaha two-strokes only; KTM group, Kawasaki and Triumph
  ECU part numbers were not compared.
- **Brakes on Triumph** and lever/master-cylinder parts on Triumph were not compared.
- **Honda CRF250RX/450RX, Yamaha FX/X, KTM XC, Kawasaki X models** are out of this pass (they share most chassis parts
  but differ in tank, wheels and suspension settings).
- **Cross-brand Japanese swaps** (e.g. Honda wheel on a Kawasaki) are not claimed: hubs and axles differ and no source
  lists them.
- **Aftermarket (TUNER-tier) fitment charts** were not needed for this pass; the aftermarket catalogs in
  `docs/research/aftermarket/` hold retailer fitment that can back-fill years the OEM fiche lacks.
- Retailer source yamahaonlineparts.com was tried but most product pages carry no fitment table; Partzilla, RevZilla,
  Rocky Mountain and other large US fiche sites were blocked by bot protection and not used.
