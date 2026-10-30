# Source hunt 2026-10-30 — every official URL checked

Legend: FOUND = fetched and used; FOUND/NOT USED = official, fetched, but not turned into facts (reason given); NOT FOUND = no page/document; BLOCKED = official page exists but scripted fetch refused (HTTP 403) and no permitted fetch path returned raw text; PURCHASE/DEALER = official channel sells it or sends you to a dealer.

## Suzuki (Suzuki Motor USA, LLC — suzukicycles.com; Suzuki Motor Corporation — globalsuzuki.com)

| URL | Status | Note |
|---|---|---|
| https://suzukicycles.com/motocross/2020/rm-z250 | NOT FOUND | redirects to /motocross (landing page only links 2027 models) |
| https://suzukicycles.com/motocross/2020/rm-z450 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2021/rm-z250 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2021/rm-z450 | NOT FOUND | site 404 page |
| https://suzukicycles.com/motocross/2022/rm-z250 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2022/rm-z450 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2023/rm-z250 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2023/rm-z450 | NOT FOUND | redirects to /motocross |
| https://suzukicycles.com/motocross/2024/rm-z250 | FOUND | 27 spec rows (re-fetch; values identical to gaps/suzuki/suzuki-rm-z250-2024.json, HTML hash differs because the page is dynamic) |
| https://suzukicycles.com/motocross/2024/rm-z450 | NOT FOUND | redirects to /motocross (page withdrawn; 2024 RM-Z450 facts remain press-release only in gaps/suzuki/) |
| https://suzukicycles.com/motocross/2025/rm-z250 | FOUND | 27 spec rows |
| https://suzukicycles.com/motocross/2025/rm-z450 | FOUND | 27 spec rows |
| https://suzukicycles.com/motocross/2026/rm-z250 | FOUND | 27 spec rows |
| https://suzukicycles.com/motocross/2026/rm-z450 | FOUND | 27 spec rows |
| https://suzukicycles.com/motocross/2027/rm-z250 | FOUND | 27 spec rows |
| https://suzukicycles.com/motocross/2027/rm-z450 | FOUND | 26 spec rows (Final Drive dropped, conflicts with brochure) |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2025/motocross/2025_motocross_rm-z250_os_f.pdf | FOUND | official brochure, spec column p.5, 25 rows |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2025/motocross/2025_motocross_rm-z450_os_f.pdf | FOUND | 25 rows |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2026/motocross/2026motocrossrmz250pbr20.pdf | FOUND | 25 rows |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2026/motocross/2026motocrossrmz450pbr20.pdf | FOUND | 25 rows |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2027/q3/2027_motocross_rm-z250_pb.pdf | FOUND | 25 rows |
| https://suzukicycles.com/-/media/project/cycles/files/product-brochures/2027/q3/2027_motocross_rm-z450_pb.pdf | FOUND | 24 rows (Final Drive dropped, conflicts with web page) |
| https://suzukicycles.com/owners | FOUND/NOT USED | only links to genuinesuzukimanuals.com; no manual downloads |
| https://suzukicycles.com/racing | FOUND/NOT USED | contingency pages, no technical documents |
| https://suzukicycles.com/mx-tuner, /mxtuner, /racing/mx-tuner | NOT FOUND | 404; MX-Tuner is only described in the 2020 press release already on file in gaps/suzuki/ |
| https://genuinesuzukimanuals.com/ (Suzuki Motor USA, LLC and System Simulations, Inc.) | FOUND/NOT USED | official manuals store. Site text: "Please see your Authorized Suzuki Dealer if you wish to purchase a Factory Suzuki Owner's Manual ... We welcome orders for printed Factory Suzuki Service Manuals here". Owner's manuals for motorcycles have no price and no add-to-cart; the site's free-download list (118 part numbers) contains only marine (outboard) owner's manuals — no RM-Z owner's manual is downloadable. Listing (SearchReqs.asp, no login) for RM-Z, see REPORT.md for part numbers and prices. |
| https://www.globalsuzuki.com/motorcycle/smgs/products/{2021..2027}rm-z250/ and .../rm-z450/ | FOUND/NOT USED in build | Suzuki Motor Corporation "Suzuki Motorcycle Global Salon" pages 2022–2027 exist for both models (2021 page is a different layout without a spec table; 2020 404). Global-market spec tables (27 rows each, incl. primary/final reduction ratios, rake/trail, oil capacity) extracted into global-spec-not-built/ with region "global" — not US spec, so kept out of the claims build. |

## Honda (American Honda — powersports.honda.com, hondanews.com, hondamotopub.com)

| URL | Status | Note |
|---|---|---|
| https://www.hondamotopub.com/AHM (Honda Motopub, US publications portal) | FOUND/NOT USED | public JSON selector: CRF150R-RB has publications for model years 2018 (KSE181) and 2020 (KSE201) only; download requires accepting a licence agreement. 2020 is already on file. |
| https://powersports.honda.com/off-road/competition/crf150r | BLOCKED | HTTP 403 to scripted fetch; WebFetch permission not granted |
| https://powersports.honda.com/off-road/competition/crf150r/specifications | BLOCKED | HTTP 403 |
| https://powersports.honda.com/support/owners-manuals , /owners-manuals | BLOCKED | HTTP 403 |
| https://powersports.honda.com/motorcycle/motocross/crf150r/2025/crf150r | BLOCKED (found via search) | official 2025 CRF150R tech-specs page |
| https://powersports.honda.com/api/custom/downloads/specs?segment=motorcycle&category=motocross&year=2025&trim=CRF150RS | BLOCKED | Honda's own spec-sheet download endpoint, HTTP 403 |
| https://hondanews.com/en-US/powersports/releases/release-86f699ac4f5da2ce03fe6a17a2003854-2021-honda-crf150r-specifications | FOUND/NOT USED | official press-room spec sheet (release date June 9, 2020); curl 403; readable only through the summarising fetch tool, which paraphrases and gives no raw HTML/hash — not loaded as facts |
| https://hondanews.com/en-US/releases/2022-honda-crf150r-specifications | FOUND/NOT USED | same (July 30, 2021) |
| https://hondanews.com/en-US/powersports/releases/release-0d5860f808ceb9825e662cfd5a22ef7b-2023-honda-crf150r-specifications | FOUND/NOT USED | same (May 28, 2022) |
| https://hondanews.com/en-US/powersports/releases/release-13f25e90cfe47cd58453f1f710154f19-2024-honda-crf150r-specifications | FOUND/NOT USED | same (June 20, 2023) |
| https://hondanews.com/en-US/powersports/releases/release-70527d767f112a34ec2e42bfb513f590-2025-honda-crf150r-specifications | FOUND/NOT USED | same (May 24, 2024) |
| https://hondanews.com/en-US/powersports/releases/release-0d29cf91ab5515b985a1c286910307f9-2026-honda-crf150r-specifications | FOUND/NOT USED | same (May 20, 2025); second column labelled "CRF150R Expert" |
| hondanews.com 2027 CRF150R specifications | NOT FOUND | no 2027 CRF150R release surfaced as of 2026-10-30 |

## Triumph (Triumph Motorcycles — triumphtechnicalinformation.com, triumphmotorcycles.com, triumphinstructions.com)

| URL | Status | Note |
|---|---|---|
| https://api.triumphtechnicalinformation.com/handbooks/products/model-names | FOUND | TF models listed: TF250-C, TF250-E, TF250-X, TF450-C, TF450-E, TF450-X, TF450RC Edition |
| https://api.triumphtechnicalinformation.com/handbooks/products/model-years?modelName=… | FOUND | TF250-X: 2023–2027; TF450-X: 2026; TF250-E/TF450-E/TF250-C/TF450-C: 2026; TF450RC Edition: 2025 |
| https://api.triumphtechnicalinformation.com/handbooks/single-product-details?modelName=…&modelYear=2027 | FOUND | 2027 products exist for TF250-X (ZB3), TF450-X (ZD3), TF250-E (ZG3), TF450-E (ZJ3); none for TF250-C/TF450-C 2027 |
| https://api.triumphtechnicalinformation.com/handbooks/documents?modelCode=ZB3&modelYear=2027&state=published&onlyValid=true&handbook=true | FOUND | 15 language editions of OHB_TF250-X and TF450-X_3850823 |
| https://api.triumphtechnicalinformation.com/handbooks/documents/6ab239eb1685389dfa339f9a/pdf | FOUND | OHB_TF250-X and TF450-X_3850823-US, 226 pp, sha256 e1cf3fb2…b77cc, PDF created 2026-01-21 — extracted (TF 250-X 2027: 128 rows; TF 450-X 2027: 127 rows) |
| same listing for ZD3/ZG3/ZJ3 2027 | NOT FOUND | 0 documents attached to TF450-X, TF250-E, TF450-E 2027 as of 2026-10-30 |
| same listing for ZB2 2025/2026, ZD1 2026, ZY2 2025, ZR2/ZT2 2026, ZG1/ZJ1 2026 | FOUND/already on file | only the 3850672 / 3850699 / 3850136 handbooks already in gaps/triumph/; no new addenda |
| same listing for ZB1 2023/2024/2025 | FOUND/already on file | OHB 3850529-US and "TF250-X Handbook Addendum_US" (6622cbf5ceb1ab226aad5abf), both already in gaps/triumph/ |
| https://www.triumphmotorcycles.com/owners/off-road/app | BLOCKED to curl (403); read via fetch tool | MX Tune Pro page: 10 factory maps (OE Factory, Novice, Intermediate, Expert, Hard Pack Dry/Wet, Loam Dry/Wet, Sand Dry/Wet), Akrapovič map files (.trh), links the user guide PDF below |
| https://www.triumphinstructions.com/ProdDocs/9901790-EN.pdf | FOUND | MX Tune Pro User Guide 9901790 Issue 2 (2025), 30 pp, sha256 a38dc0b5…7461 — 10 factual rows in reference-not-built/ (no model year) |
| https://www.triumphmotorcycles.com/motorcycles/off-road/tf-250-x (+/specifications) | BLOCKED | HTTP 403 to scripted fetch |

## Bonus (discovery only)

| URL | Status | What it contains |
|---|---|---|
| https://yamahamotorsports.com/power-tuner-app | FOUND/NOT USED | Yamaha Motorsports USA Power Tuner App page; marketing copy, no parameter tables or PDF |
| https://global.yamaha-motor.com/business/mc/mc-tech/standard-technology/powertuner.html | FOUND/NOT USED | Yamaha Motor Co. technology page; descriptive (engine and suspension setting assistance since 2023 YZ450F), no tables |
| https://www.ktm.com/en-us/tech-guide/connectivity-unit-offroad.html | FOUND/NOT USED | KTM Connectivity Unit Offroad (CUO) tech guide: KTMConnect app, PRIME (traction control levels) and ADVANCED (engine braking, throttle response, traction control, launch control, quickshifter), presets SAND/GRAVEL/HARD PACK/DRY/WET; standard on 2024–2025 SX-F Factory Editions and 2025 350 XC-F Factory Edition; no numeric tables |
| https://www.husqvarna-motorcycles.com/en-us/service/husqvarna-motorcycles-app/offroad.html | FOUND/NOT USED | Ride Husqvarna Motorcycles app / Connectivity Unit kits: recommended suspension settings from rider weight and level, engine maps, traction control, launch control, throttle response, engine braking; descriptive only |
| https://www.kawasaki.com/en-us/motorcycle/kx/full-size-mx/kx-250 | NOT FETCHED | redirect loop (>50 redirects) for scripted fetch; Rideology documentation not located on kawasaki.com |

Third-party results that surfaced in searches (manualslib, manuals.online, scribd, bike-parts-*, manualsfile, motorcycledb, totalmotorcycle, dealers) were ignored per the rules.
