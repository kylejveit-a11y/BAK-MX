# Source hunt 2026-10-30 — report

Build: `python3 docs/research/expansion/gaps/build_claims.py source-hunt-2026-10-30` → **491 rows, 0 skipped, 101 duplicate joints dropped, 14 documents** (claims_0.sql, doc_hashes.json).
The 101 drops are brochure rows whose joint and value are identical to the same bike-year's web-page row (same stable id); the brochure file sorts first, so the surviving row cites the brochure. Both documents remain in doc_hashes.json. Nothing was marked uncertain.

Rules applied: values copied as printed; HTML pages hashed raw (kind `maker_product_page`, page = "Specifications tab"); brochures hashed (kind `maker_brochure`, page = PDF page); a figure printed differently in two official documents for the same bike-year was dropped from both and is listed below; no press-release claim was entered as a spec value.

## Counts per bike-year (files in this folder, built)

| File | Rows | Kind | Source |
|---|---|---|---|
| suzuki-rm-z250-2024.json | 27 | maker_product_page | suzukicycles.com/motocross/2024/rm-z250 (re-fetch; duplicates gaps/suzuki/suzuki-rm-z250-2024.json value for value — drop one of the two before loading if double rows are unwanted) |
| suzuki-rm-z250-2025.json | 27 | maker_product_page | suzukicycles.com/motocross/2025/rm-z250 |
| suzuki-rm-z250-2025-brochure.json | 25 | maker_brochure | 2025_motocross_rm-z250_os_f.pdf p.5 |
| suzuki-rm-z450-2025.json | 27 | maker_product_page | suzukicycles.com/motocross/2025/rm-z450 |
| suzuki-rm-z450-2025-brochure.json | 25 | maker_brochure | 2025_motocross_rm-z450_os_f.pdf p.5 |
| suzuki-rm-z250-2026.json | 27 | maker_product_page | suzukicycles.com/motocross/2026/rm-z250 |
| suzuki-rm-z250-2026-brochure.json | 25 | maker_brochure | 2026motocrossrmz250pbr20.pdf p.5 |
| suzuki-rm-z450-2026.json | 27 | maker_product_page | suzukicycles.com/motocross/2026/rm-z450 |
| suzuki-rm-z450-2026-brochure.json | 25 | maker_brochure | 2026motocrossrmz450pbr20.pdf p.5 |
| suzuki-rm-z250-2027.json | 27 | maker_product_page | suzukicycles.com/motocross/2027/rm-z250 |
| suzuki-rm-z250-2027-brochure.json | 25 | maker_brochure | 2027_motocross_rm-z250_pb.pdf p.5 |
| suzuki-rm-z450-2027.json | 26 | maker_product_page | suzukicycles.com/motocross/2027/rm-z450 (Final Drive dropped) |
| suzuki-rm-z450-2027-brochure.json | 24 | maker_brochure | 2027_motocross_rm-z450_pb.pdf p.5 (Final Drive dropped) |
| triumph-tf-250-x-2027.json | 128 (61 specification, 42 torque, 17 setting, 8 capacity) | owners_handbook | OHB_TF250-X and TF450-X_3850823-US |
| triumph-tf-450-x-2027.json | 127 (60 specification, 42 torque, 17 setting, 8 capacity) | owners_handbook | OHB_TF250-X and TF450-X_3850823-US |

Not built (sub-folders, kept out of the glob on purpose):
- `global-spec-not-built/` — 12 files, 27 rows each: Suzuki Motor Corporation global-market spec tables for RM-Z250/RM-Z450 2022–2027 (globalsuzuki.com SMGS). Region "global", not US; adds primary/final reduction ratios, rake/trail and oil capacity (overhaul) that the US pages do not print. 2022 and 2023 pages carry identical specs.
- `reference-not-built/triumph-mx-tune-pro-user-guide-9901790.json` — 10 rows of ECU-setting facts from the official MX Tune Pro User Guide (GPA 1–10, LC 0–20, 110 °C warning, 9050 rpm shift light, FI = % change, IG = degree change); the document names no model year.

## Dropped as "printed twice with different figures"
- 2027 RM-Z450 Final Drive chain: web page prints "Chain, DID 520DMA2K, 114 links", brochure prints "Chain, DID 520DM2, 114 links". Removed from both 2027 RM-Z450 files.
- Noted, not dropped (same metric figure, different rounding of the imperial figure): RM-Z250 fuel tank 6.3 L printed as "1.66 US gal." on the web pages and "1.7 US gal." in the brochures (2025–2027). Each kept under its own document.
- Wording-only differences between brochure and page (e.g. "Wet, multi-plate type" vs "Wet multi-plate" in 2025; "adjustable damping" vs "adjustable damping force"; tire load index in parentheses or not; "114 L" vs "114 links" on the 2027 RM-Z250 page) were kept as printed in each document.

## Triumph 2027 method note
The 2027 handbook 3850823-US is a revision of 3850672-US. Every 2026-edition row (gaps/triumph/triumph-tf-250-x-2026.json, -tf-450-x-2026.json) was re-located in the 2027 text layer by its printed value plus joint keywords; only exact hits were carried, with the new page number, and spec-section rows were pinned to each model's own spec pages (TF250-X 214–217, TF450-X 218–222). Composite rows that were hand-written in 2026 (service schedule intervals, rider-aid descriptions, break-in, disc run-out, pad thickness) could not be string-matched and are **not** in the 2027 files (hence 128/127 vs 203/202 rows); they need a hand pass if wanted. The chassis-setup chapter (pp. 61–80) was read directly and entered by hand because the factory settings changed:

| Standard setting | 2026 edition (3850672-US) | 2027 edition (3850823-US) |
|---|---|---|
| TF250-X rear rebound / low-speed comp / high-speed comp | 11 clicks / 11 clicks / 7/8 turn | 13 clicks / 13 clicks / 1 1/2 turns |
| TF250-X fork compression / rebound | 10 clicks / see 2026 file | 12 clicks / 12 clicks |
| TF450-X rear rebound / low-speed comp / high-speed comp | see 2026 file | 12 clicks / 12 clicks / 1 1/4 turn |
| TF450-X fork compression / rebound | see 2026 file | 13 clicks / 11 clicks |
| Static sag (both) | 1.4 in (36 mm) | 1.42 in (36 mm) |
| Riding sag | 4.02 in (102 mm) | not printed in the 2027 edition's text layer |

TF 450-X 2027 caveat: the portal attaches 3850823 to ZB3 (TF250-X 2027) only; the TF450-X 2027 product (ZD3) has no document attached yet. The TF450-X rows come from the TF450-X columns and tables of that handbook; this is stated in the file's document_revision.

## Plain answers per maker

### Suzuki
- **Publishes for free:** the current model pages on suzukicycles.com (2024 RM-Z250; 2025, 2026, 2027 RM-Z250 and RM-Z450) with a 27-row spec table, and a product brochure PDF per model from 2025 on (same spec set minus Color/Warranty). Older model years are not kept online: the 2020–2023 pages are gone, and so is the 2024 RM-Z450 page. Suzuki Motor Corporation's global site keeps 2021–2027 pages with a fuller global spec table. Press releases (already on file) remain the only US source for 2020–2023.
- **Sells:** through genuinesuzukimanuals.com (Suzuki Motor USA, LLC and System Simulations, Inc.) — factory **Service Manuals** only: RM-Z250 2019–2026 part 99500-46K00-01E, $55.00, 468 pages; RM-Z450 2018–2026 part 99500-37K00-01E, $80.00, 460 pages. **Owner's manuals** are listed but not sold online and not downloadable; the site says to see an authorized Suzuki dealer to purchase a factory owner's manual. Listed owner's-manual part numbers (117 pages each unless noted): RM-Z250 — 2020 99011-46K51-03A, 2021 99011-46K52-03A, 2022 99011-46K53-03A, 2022–2023 99011-46K54-03A, 2024 99011-46K55-03A, 2025 99011-46K56-03A, 2026 99011-46K70-03A (no 2027 RM-Z250 entry yet); RM-Z450 — 2020 99011-37K52-03A, 2021 99011-37K53-03A, 2021–2022 99011-37K54-03A, 2023 99011-37K55-03A, 2024 99011-37K56-03A, 2025 99011-37K57-03A, 2026 99011-37K80-03A, 2027 (RM-Z450M7) 99011-37K90-03A (121 pages). Prices stored against some owner's-manual rows ($24.00/$17.00) are not shown by the site's code and the rows have no add-to-cart.
- **Does not exist publicly:** no public owner's manual, setup/race guide, suspension-setting sheet, torque table or maintenance schedule from Suzuki for the RM-Z. MX-Tuner app documentation is not on suzukicycles.com (only the 2020 press release). Suspension settings, torques, capacities (beyond fuel tank; oil capacity only on the global pages) and service schedules therefore stay unavailable without buying the service manual or obtaining a dealer-supplied owner's manual.
- **2023:** Suzuki's global site has 2023 RM-Z250 and RM-Z450 pages (specs identical to 2022), and the US manuals store lists a 2022–2023 RM-Z250 owner's manual and a 2023 RM-Z450 owner's manual, so 2023 model years existed; suzukicycles.com no longer has 2023 pages.

### Honda (CRF150R / CRF150RB)
- **Publishes for free:** per-year "Honda CRF150R Specifications" sheets in its press room (hondanews.com) for 2021, 2022, 2023, 2024, 2025 and 2026 (two columns: CRF150R and CRF150R Big Wheel; labelled "CRF150R Expert" in 2026), the current model/spec pages on powersports.honda.com, and a spec-sheet download endpoint. All refuse scripted fetches (HTTP 403); the only permitted reader returned paraphrased summaries without raw text or a hash, and its figures drifted between fetches (displacement 147.7 vs 149.7 cc; rake 27.03°, 27°02', 27.2°, 27.0°), so nothing was loaded. Honda produced the CRF150R for every model year 2021–2026; no 2027 sheet has surfaced.
- **Owner's manuals:** Honda Motopub (hondamotopub.com/AHM, official) offers CRF150R-RB manuals for 2018 and 2020 only, behind a licence click-through (2020 already on file). Honda's owner's-manual lookup on powersports.honda.com is 403 to scripts; the CRF250R/450R manuals on file came from cdn.powersports.honda.com/documentum/MWOM/…, but no CRF150R file name for 2021–2027 could be discovered this pass.
- **Net:** nothing new captured for 2021–2027. A browser session (or an approved fetch) against powersports.honda.com or hondanews.com is the remaining route.

### Triumph
- **Publishes for free:** full owner's handbooks on triumphtechnicalinformation.com without sign-in, including the new TF250-X/TF450-X 2027 edition 3850823-US (extracted here), the 2023–2025 TF250-X addendum (on file), plus the MX Tune Pro user guide PDF and factory map files linked from triumphmotorcycles.com/owners/off-road/app.
- **Sells:** nothing relevant found for this scope.
- **Does not exist yet:** handbooks for TF450-X 2027 (ZD3), TF250-E 2027 (ZG3) and TF450-E 2027 (ZJ3) — the products are on the portal with zero documents; TF250-C/TF450-C 2027 are not on the portal at all. No separate "setup guide" beyond the handbook chassis-setup chapter and the MX Tune Pro guide.

### Bonus (Yamaha, Kawasaki, KTM group)
Discovery only; every official page found is descriptive text with no numeric tables (see SOURCES.md): Yamaha Power Tuner (US and global pages), KTM Connectivity Unit Offroad tech guide (parameters: traction control, launch control, engine braking, throttle response, quickshifter; presets SAND/GRAVEL/HARD PACK/DRY/WET), Husqvarna Ride app page (adds rider-weight-based suspension recommendations). Kawasaki's US KX page redirect-loops for scripts; no Rideology document located.

## Blocked actions
powersports.honda.com, hondanews.com and triumphmotorcycles.com return 403 to curl. A browser-user-agent retry and a direct probe of an undocumented Suzuki PDF path were refused by the session's policy and were not attempted further.
