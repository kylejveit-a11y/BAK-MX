# Honda public handbook torque expansion — 2026-09-13

599 distinct, named torque facts were extracted and reviewed from ten independently identified Honda US competition handbooks: CRF250R and CRF450R, each model year 2022 through 2026. This is the source-table fact count, not an incremental database count and not a count of catalog fasteners mapped. Existing database claims may overlap.

Each JSON retains exact target, OEM CDN URL, document SHA-256, publication title, PDF/printed-page locator, thread diameter, table quantity, installation remarks, and reviewer binding. All 25 torque-table pages were rendered and visually reviewed. Rows exclusive to RX or Works Edition were excluded. Multi-line model labels and remarks were corrected before approval. Generic standard torque rules were intentionally not mapped from nominal thread diameter alone.

| Target | Reviewed PDF pages | Named torque facts |
|---|---|---:|
| CRF250R 2022 | 21–23 | 61 |
| CRF250R 2023 | 21–23 | 61 |
| CRF250R 2024 | 21–23 | 61 |
| CRF250R 2025 | 23–25 | 63 |
| CRF250R 2026 | 23–25 | 63 |
| CRF450R 2022 | 23–24 | 58 |
| CRF450R 2023 | 23–24 | 58 |
| CRF450R 2024 | 23–24 | 58 |
| CRF450R 2025 | 21–22 | 58 |
| CRF450R 2026 | 21–22 | 58 |

Approvals mean the named N·m fact and its printed remarks match that exact OEM document. They do not mean catalog completeness, every-bolt coverage, complete service procedures, or every individual occurrence mapping. Catalog arrays remain empty in these expansion files to avoid duplicating the existing 61 Honda catalog records. Existing parts inventory remains the catalog source of truth.

Important distinctions retained:

- The 2022–2024 front axle uses an 88 N·m nut; the 2025–2026 tables use a 78 N·m bolt. No year inheritance.
- CRF250R head bolts are 48 N·m, camshaft-holder bolts 13 N·m, and oil drain 23 N·m; CRF450R values are respectively 50, 15, and 18 N·m, each with its own exact-year citation and lubrication remarks.
- The 2025–2026 frame-side cushion rod nut is 52 N·m. CRF250R specifies engine oil; CRF450R specifies molybdenum oil solution. These are not interchangeable conditions.
- Standard CRF250R has no hydraulic clutch reservoir torque rows; Works-only hydraulic clutch rows were excluded.
- Manufacturer table quantities are retained as manual_quantity, not installed-bike totals or catalog quantities. Repeated table descriptions sometimes have different quantities; no quantity claim was promoted.

The parser only extracts pending records. The separate review script binds approval to the ten inspected document hashes. A changed document requires another review. PDFs and rendered pages stay temporary; this folder contains bounded factual extracts, not redistributed manuals.

## Secondary-source check

The indexed [MotoSport 2025 CRF250R torque article](https://www.motosport.com/blog/2025-honda-crf250r-dirt-bike-torque-specs) supplies ranges that disagree with the exact Honda handbook—for example its spark plug 12–15 N·m versus OEM 22 N·m, and drain 24–30 versus OEM 23. Those secondary values were rejected for production use. Logical plausibility alone does not establish a fastener torque. This discrepancy is recorded as a rejected secondary source, not an unresolved disagreement between equally authoritative OEM publications.

RevZilla displayed an interactive Cloudflare human-verification challenge in this browser, so no attempt was made to solve or bypass it. Honda Parts House returned a bare 403 through web lookup. OEM PDF acquisition and review continued successfully.

## Remaining gaps

- Complete parts catalogs for all ten targets; the existing 2025 CRF250R three-assembly/61-row inventory is unchanged.
- Joint-to-catalog mappings beyond exact reviewed matches.
- Full engine/transmission disassembly specifications outside the competition handbook.
- Manufacturer-specific tightening sequences, replacement rules and preparation from associated procedures where not already extracted.
- Dimensions, material/grade, wear limits and model-specific service facts beyond the previously approved coverage.

No paid manual was purchased. No database or deployment was changed by this workstream.
