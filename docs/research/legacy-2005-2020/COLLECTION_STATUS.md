# BAK MX historical OEM collection — status

Updated 2026-10-16. Requested range: 2005–2020. **Incomplete; no model has a complete service-data record.**

90 exact model-year targets; 892 PENDING candidate facts; 76 acquired source documents. No production import, promotion or deployment.

| Make | Candidate model-years | Candidate facts |
|---|---:|---:|
| Honda | 60 | 644 |
| KTM | 4 | 66 |
| Yamaha | 26 | 182 |

## Coverage by year

| Year | Honda | Yamaha | KTM | Complete models |
|---|---:|---:|---:|---:|
| 2005 | 6 | 0 | 4 | 0 |
| 2006 | 6 | 0 | 0 | 0 |
| 2007 | 6 | 0 | 0 | 0 |
| 2008 | 0 | 0 | 0 | 0 |
| 2009 | 2 | 0 | 0 | 0 |
| 2010 | 2 | 0 | 0 | 0 |
| 2011 | 2 | 0 | 0 | 0 |
| 2012 | 4 | 0 | 0 | 0 |
| 2013 | 4 | 0 | 0 | 0 |
| 2014 | 4 | 0 | 0 | 0 |
| 2015 | 4 | 0 | 0 | 0 |
| 2016 | 4 | 4 | 0 | 0 |
| 2017 | 4 | 5 | 0 | 0 |
| 2018 | 4 | 6 | 0 | 0 |
| 2019 | 4 | 5 | 0 | 0 |
| 2020 | 4 | 6 | 0 | 0 |

## What was actually extracted

- Honda 2005: six models, 266 facts; broad specification rows and selected damping/sag for the original four. CR125R/CR250R add specification rows only.
- Honda 2006–2020: seven dimension rows per target; 2008 remains a source gap. CR85R/CR85RB and CRF150R/CRF150RB are separate targets. No RX or RWE target inferred from a shared manual.
- Yamaha 2016–2020: seven dimension/curb-weight rows per target. Only model-years explicitly listed in the existing Yamaha US manual index were used; this is not a full production roster.
- KTM 2005: selected engine, gearing, chassis dimensions, wheel travel and fork spring rates for 125 SX, 250 SX, 450 SX Racing and 525 SX Racing. The KTM-authored English manuals are dealer-hosted; source authenticity and exact market applicability still require independent review.

## Remaining work — required to finish the request

1. Finish the historical model roster and source acquisition for all requested makes and variants, oldest first. Missing sources are not proof that a model did not exist.
2. Finish Honda 2008 and missing mini/special-edition coverage; complete the service categories beyond the bounded rows above.
3. Acquire Yamaha 2005–2015 and remaining later models. The 2005 library model-list endpoint attempts hit 403/redirect failures; known later PDF links worked.
4. Complete KTM minis and other 2005 SX models, then 2006–2020. The official older-document route is https://print.ktm.com/ (linked by https://www.ktm.com/en-us/service/manuals.html). No purchase was made.
5. Acquire and review Husqvarna and historical GasGas manuals. Do not equate earlier GasGas MC bikes with the later KTM-platform range. No candidates for these makes have been added in this pass.
6. Acquire Kawasaki 2005–2019 and missing minis. Existing repository review reports already document 2020 KX250/KX450 loads; reconcile their live identifiers before importing anything overlapping. See ../expansion/kawasaki/OWNERS_MANUAL_REVIEW_2026-10-13.md. Live state has not been checked.
7. Triumph TF motocross models are outside this historical interval: official TF 250-X launch was November 28, 2023 (https://www.triumphmotorcycles.com/for-the-ride/news/brand/triumph-reveals-new-tf-250-x-2023-11-28). Do not generate 2005–2020 TF records.
8. Reconcile 2020 against existing source bundles and live facts. All new 2020 files are research candidates only.
9. Complete torque/procedure conditions, fluids, valve/wear clearances, suspension, service schedules and parts coverage; resolve source conflicts and obtain independent review before promotion.

## Provenance and extraction limits

Every candidate carries its exact target, source URL, SHA-256, page locator and PENDING status. No value was carried forward from another model-year. Only selected rows were visually reviewed; source acquisition is not full-document verification.

The 2019 CRF450R PDF page 178 has missing glyphs in the printed footer. Its locator records the PDF page and explicitly marks the printed page unreadable. Honda 2014 CRF250R uses a distinct ruled-table layout; its seven dimensions use a bounded text-layer fallback checked against the page image. Shared Honda R/RX and Yamaha MX/X rows are selected explicitly.

The earlier issues in issues.json remain unresolved; see REVIEW.md for the original 185-fact checkpoint. Extractors deliberately omit unreviewed maintenance values. The current generic application schema still needs separate legacy-year integration assessment.

## Files and reproduction

- model-coverage.json: exact candidate targets and filenames.
- acquired-source-catalog.json: source links and hashes, without redistributed manuals.
- source-discovery.json: initial URL probes and Yamaha jobs; failed guessed Honda URLs do not mean the official manual is unavailable. Later successful Honda CDN sources are in the acquired catalog.
- honda-dimension-jobs.json: exact dimension extraction inputs.
- extract_*.py: bounded repeatable extractors; validate_all.py checks the complete candidate set.

To reproduce, download each acquired-source-catalog.json URL to its local_filename in a temporary directory and verify SHA-256 before parsing. Copy source-discovery.json and honda-dimension-jobs.json there. Run the extractors with that directory as their argument, using PyMuPDF/pdfplumber. Do not feed PENDING files into runtime loaders.

No background collection is scheduled by these files. Remaining work above is still outstanding.
