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


---

# Pass 2 (2026-11-07): deeper part groups, US check, new platforms

Records are in `fitment2_honda.json`, `fitment2_yamaha.json`, `fitment2_kawasaki.json`, `fitment2_ktm_group.json`,
`fitment2_triumph.json`, `fitment2_suzuki.json` and `fitment2_aftermarket.json` (research ids `fit2-*`).

Output: **520 records, 10,922 bike-year rows** (`build_rows.py`, no validation problems, no fit2 record skipped):
KTM group 203 / 6,005, Yamaha 85 / 1,884, Kawasaki 44 / 980, Honda 44 / 728, Triumph 26 / 210, Suzuki 36 / 162,
aftermarket (Twin Air, TUNER tier) 82 / 953. OEM tier 9,969 rows, TUNER 953. Not loaded to the database.

## Method (pass 2)

1. **US OEM catalogues.** The repo already held complete US parts catalogues captured in September-October 2026
   (`docs/research/parts-pass14/`): Honda CRF250R/450R/RX 2020-2026 and Yamaha YZ/YZ-F/FX/X/WR 2020-2027 from the MotoSport
   public fiche, Kawasaki KX250/450/X 2020-2026 from the Kawasaki USA owner-center catalogue, KTM/Husqvarna/GasGas 2020-2027
   from the official spare-parts finders, Triumph TF 2024-2026 from Triumph Waukesha. These were re-read offline.
   New this pass (live, public pages, 1.5-5 s between requests): Kawasaki USA catalogue for KX65/KX85/KX112 2020-2027 and the
   2027 KX250F/KX250FX; KTM-group spare-parts finders for 50/65 minis (KTM 2020/2023/2025/2027, Husqvarna 2020/2025, GasGas
   2021/2025); Sun City Motorcycles (Australian) fiche for Suzuki RM-Z250/450 and Honda CRF150R; City West Yamaha (Australian)
   fiche for YZ65/YZ85.
2. **Part groups** are matched by catalogue description and assembly (per brand), giving, per bike-year, the part numbers for
   frame, subframe, swingarm, linkage, triple clamps and bar mounts, footpegs, wheels/hubs/axles/rims, wheel, linkage and
   steering bearings and seals (sizes from the descriptions), brake discs, pads, calipers, master cylinders, bodywork, seat,
   tank, radiators, exhaust, ECU, chain (size and link count), sprockets (tooth counts), clutch plates and springs, air
   filter, oil filter, spark plug, fork units/springs (rates)/seals and shock units/springs (rates; KTM also free length).
   Same number = same part (swaps); different number = different part. Records only attach to bike-years whose catalogue
   was read; a part the matcher did not find is written as "not found (unknown)", never as "does not exist".
3. **US check of pass 1** (`fit2-usck-*`, 36 records): every part number in the Australian-sourced Honda, Kawasaki and
   Yamaha records (and the Triumph records) was looked up in the US catalogue for the same models. Result: chassis numbers
   (frames, swingarms, wheels, hubs, axles, clamps, linkage, plastics, filters, footpegs, brakes) match; Kawasaki US numbers
   add a colour/finish suffix (-290, -21, -49F) to the same base number. **Mismatches are market-specific parts:** Honda
   silencers (AU 18300-MKE-DF0 / -DD0 / K95-DA0 / -DG0 vs US -AF0 / -BD0 / K95-AA0 ...), Honda ECUs (AU 38770-MKE-DA1 vs US
   -AA1, AU K95-D61 vs US K95-A61), Yamaha silencers (AU B2W/BHR-14750-10, B7B-14750-30 vs US -00 / -20), Yamaha two-stroke
   CDIs (AU 1SR-85540-03 vs US 1C3-85540-13; AU 1P8-85540-02 vs US -03), Kawasaki silencers (AU 18100-0602/0610 vs US
   0601/0611/0625/0627) and one Kawasaki front master (AU 43015-0863 not in the US list). Honda rear fender 80101-MKE-AF0ZB is
   not listed in the US catalogue (US lists fender set 80010-MKE-307ZB). Triumph numbers were already US and all match.
4. **Aftermarket (TUNER tier).** Twin Air's public applications database (per make and year) gives air filters, pre-oiled
   filters, reusable oil filters and Powerflow kits with the OEM filter reference. All Balls/Pivot Works (403 bot challenge),
   No-Toil (no answer) and Uni were not read.

## Coverage, pass 2

C = part numbers found for every bike-year read, P = found for some bike-years or some sub-parts, U = not found in the
catalogue read (unknown). Two-stroke oil filter U is expected (no oil filter). KTM-group four-stroke and two-stroke fork
springs are absent because WP XACT forks are air forks.

| Platform (catalogue, years read) | Frame/sub/swingarm | Linkage | Clamps/bars | Pegs | Wheels/axles/rims | Bearings & seals | Discs | Pads | Calipers/masters | Bodywork/seat/tank | Radiators | Exhaust | ECU | Chain/sprockets | Clutch | Air filter | Oil filter | Spark plug | Fork/springs/seals | Shock/springs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Honda CRF250R / CRF450R / CRF250RX / CRF450RX 2020-2026 (US, 2020-2026) | C | C | C | C | C | C | C | C | C | C | C | C | P | C | P | C | C | C | C | C |
| Honda CRF150R (AU, 2020) | P | U | P | U | P | P | U | P | P | P | U | U | U | P | P | P | U | U | P | P |
| Yamaha YZ250F / YZ450F / YZ250FX / YZ450FX / WR250F / WR450F 2020-2027 (US, 2020-2027) | C | C | C | C | C | C | P | C | P | C | P | C | P | P | P | C | C | C | P | P |
| Yamaha YZ125 / YZ250 / YZ125X / YZ250X 2020-2027 (US, 2020-2027) | C | C | C | C | C | C | P | C | C | P | C | C | C | C | C | C | U | P | C | P |
| Yamaha YZ65 / YZ85 / YZ85 big wheel (AU, 2020, 2022, 2024, 2026) | C | P | C | U | C | C | P | C | C | P | C | C | C | P | C | U | U | P | C | U |
| Kawasaki KX250 / KX450 / KX250X / KX450X 2020-2027 (US, 2020-2027) | C | C | C | C | C | C | C | C | P | P | C | C | U | P | C | C | P | C | C | C |
| Kawasaki KX65 / KX85 / KX112 (US, 2020-2027) | P | P | P | P | P | P | P | P | P | P | P | U | U | P | P | P | U | P | P | P |
| KTM SX-F / Husqvarna FC / GasGas MC-F four-strokes 2020-2027 (US, 2020-2027) | P | C | P | C | C | C | C | C | P | P | C | C | C | C | C | C | C | P | P | P |
| KTM XC-F / XCF-W, Husqvarna FX / FE, GasGas EX-F / EC-F four-strokes 2020-2027 (US, 2020-2027) | P | P | P | C | P | C | C | C | P | P | C | C | C | C | C | C | C | P | P | P |
| KTM SX / Husqvarna TC / GasGas MC two-strokes 2020-2027 (US, 2020-2027) | P | C | P | P | C | C | C | C | P | P | C | C | P | P | P | C | U | C | P | P |
| KTM XC / XC-W, Husqvarna TX / TE, GasGas EX / EC two-strokes 2020-2027 (US, 2020-2027) | P | P | P | C | P | C | C | P | P | P | C | C | P | P | P | C | U | C | P | P |
| KTM 50 / 65 / 85 SX, Husqvarna TC 50 / 65 / 85, GasGas MC 50 / 65 / 85 (US, 2020-2027) | P | U | P | C | P | P | P | P | P | P | P | P | U | P | P | C | U | C | P | P |
| Triumph TF 250 / TF 450 (X, RC Edition, E, C) 2024-2026 (US, 2024-2026) | P | C | C | C | C | C | C | C | C | P | C | C | C | C | P | C | C | C | C | C |
| Suzuki RM-Z250 / RM-Z450 2020-2025 (AU, 2020-2025) | P | P | P | P | P | P | P | P | P | P | P | P | U | P | P | P | P | U | P | P |

## Gaps after pass 2

- **Still no catalogue:** Honda CRF-R 2027 (no source lists it; Twin Air already shows a new 2027 CRF450R/RX filter, OEM ref
  17213-MKE-B50, so the 2027 airbox changed), Kawasaki KX450/KX450X 2027 (not in the US model list yet; KX250 2027 is listed as
  "KX250F"), Triumph TF 2027 (index page exists, no categories), Suzuki RM-Z 2026-2027 and RM-Z450 2023, GasGas MC 250F/450F
  2027, EX 450F 2025, Yamaha YZ250FX 2024 (missing from the source index).
- **Sampled years only:** Husqvarna/GasGas 50/65/85 (2020/2021 and 2025), KTM 50/65 (2020, 2023, 2025, 2027), YZ65/YZ85
  (2020, 2022, 2024, 2026), Suzuki RM-Z250 (2020, 2022, 2025), CRF150R (2020 only). Years in between are not claimed.
- **Market:** Suzuki RM-Z, CRF150R and YZ65/YZ85 numbers are Australian; pass 2 shows chassis parts are world parts but
  silencers and ECUs are not, so buy those by a US number. KTM-group minis are world/EU catalogues (no US-labelled catalogue).
- **Matcher gaps (P cells):** some descriptions did not match the group patterns (e.g. Yamaha clutch springs on some FX/WR
  years, KTM bottom clamps on Husqvarna, Suzuki master cylinders, spark plugs and ECUs). These are search gaps, not
  "does not exist"; the full catalogues are in the sources.
- **Aftermarket bearing kits and pad shape codes:** OEM bearing sizes, seal sizes and OEM pad numbers are in the records;
  All Balls/Pivot Works kit numbers and EBC/Galfer pad codes were not added (All Balls blocked; pad charts not read).
- **Footpeg mount type and handlebar clamp size** are given by part number and description (e.g. KTM "HANDLEBAR CLAMP 28MM",
  Honda/Kawasaki Fatbar holders); a 22/28.6 mm statement per bike is only explicit where the catalogue says so.
- Cross-brand Japanese swaps are still not claimed.
