# Kawasaki KX owner's manuals: OCR review, 2026-10-13 / 2026-10-14

Kawasaki publishes KX owner's manuals only in its online viewer (pws.ktivs.net, page images at 900 px, no PDF and no text
layer). The manual for each model year was found through the Owner Center lookup (kawasaki.com/en-us/owner-center/service-manuals,
year and model code); the page images of the SPECIFICATIONS chapter, the Periodic Maintenance Chart and the Front / Rear
Suspension chapters were fetched and read by OCR (tesseract at 3x) with these checks:

- Specifications (`scripts/manual-textlayer/kawasaki_specs.py`): every metric value is checked against the imperial conversion
  printed beside it (mm/in, kg/lb, L/US gal, cm³/cu in, mL/US oz, kPa/psi); gear ratios are checked against their tooth counts.
  A row that fails either check is dropped. In a manual shared by two models ("KX252C" / "KX252D" rows and blocks) only the
  requested model's rows are taken.
- Periodic Maintenance Chart (`kawasaki_chart.py`): the grid is found from the rules in the image, a mark is a compact ink blob
  in a cell, text printed across the frequency columns ("Every 2 years") is read, the operation is OCR'd from the first cell.
  The chart's legend († and K) is kept as a note on the row.
- Standard suspension settings (`kawasaki_suspension.py`): the boxed "Standard ... Damping Adjuster Setting" values, each checked
  against the usable range printed on the same page. A manual shared by two models prints either one row per model code in the
  box ("KX252C 11 clicks" / "KX252D 13 clicks") or each model's settings in its own column under a model heading ("KX450M" /
  "KX450N"); the requested model's row or column is used, and a code row that cannot be read stops that setting.
- `build_kawasaki.py` writes one hash-guarded payload per bike-year; the document hash is the SHA-256 of the page images used.

## Loaded (2026-10-13, 8 bike-years)

| Bike | Manual | Rows (specs / schedule / suspension) |
|---|---|---|
| KX250 2020 | 99803-0080 | 107 (47 / 55 / 5) |
| KX450 2020 | 99803-0044 | 113 (50 / 59 / 4) |
| KX250X 2021 | 99803-0184 | 114 (50 / 60 / 4) |
| KX450X 2021 | 99803-0182 | 113 (50 / 59 / 4) |
| KX250 2024, KX250X 2024 | 99803-0400 | 114 each (50 / 60 / 4) |
| KX450 2024 | 99803-0401 | 114 (50 / 59 / 5) |
| KX450X 2024 | 99803-0402 | 113 (50 / 59 / 4) |

Checks run: 2024 KX450 specification pages 10-12, chart pages 40-45 and the fork / shock setting boxes compared by eye with the
extracted rows (identical); the OCR slips the checks caught were a road clearance (333 vs 13.71 in) and a 2nd-gear ratio
(1.793 vs 26/15), both dropped.

## 2026-10-14: shared-manual correction and the remaining 2021-2025 bike-years

The first suspension reader took the first value in a setting box. In a manual shared by two models that is the first model's
value, so the KX250X 2024 rows on file carried the KX250's front settings. Found by comparing the new 2022-2023 payloads with
the 2024 rows and confirmed on the page images (99803-0400 pages 126-127 as printed). The reader now selects the model's row or
column (above), all 25 bike-years were re-read, and the rows on file were compared value by value with the re-read:

| Corrected in place (still verified, statement and evidence rebuilt the way the loader builds them) | Bike-years |
|---|---|
| Front compression 11 → 10 clicks, front rebound 12 → 13 clicks (KX252D row) | KX250X 2024 |
| "Fl (Fuel Injection)" → "FI (Fuel Injection)" (OCR) | KX250 2020 / 2024, KX250X 2021 / 2024, KX450 2020 / 2024, KX450X 2021 / 2024 |
| "1.1 US gt" → "1.1 US qt"; displacement "249 cm³* (15.2 cu in.)" → 249 cm³ (now conversion-checked) | KX250 / KX250X 2024 |
| "MA‘" → "MA1" in the engine oil type (page image checked) | KX250 2020, KX450 2020 |
| "(3.07 * 2.06 in.)" → "(3.07 x 2.06 in.)" in bore x stroke | KX250 2020, KX250X 2021, KX450 2020, KX450X 2021 |
| Air cleaner element: "lf damaged" → "if damaged" | KX250 2020 |

Other reader changes from the same pass: a cell rule read as "|" or "[" before a chart operation and a stray mark letter
("c Clutch slave cylinder ...") are stripped; grid titles are snapped to the four printed titles ("Enaine" → "Engine"); a damper
name is snapped to the four printed names ("Re sound" → "Rebound"); an unchecked specification value with stray OCR characters,
or a caster angle without its decimal ("274°" for 27.4°), is dropped. The first load attempt of the 2021-2023 payloads failed the
database hash because of the "|" read from the chart rule; the hash guard stopped it before anything was stored.

Loaded 2026-10-14 (13 bike-years, 1,467 rows, 21 of 21 hashes matched including the 8 on file, which gained no rows):

| Bike | Manual | Rows |
|---|---|---|
| KX450 2021 | 99803-0181 | 111 |
| KX250 / KX250X 2022 | 99803-0214 (shared) | 114 / 114 |
| KX450 / KX450X 2022 | 99803-0216 (shared) | 112 / 112 |
| KX250 / KX250X 2023 | 99803-0306 (shared) | 113 / 114 |
| KX450 / KX450X 2023 | 99803-0308 (shared) | 111 / 111 |
| KX250 2025 | 99814-0061 | 112 |
| KX250X 2025 | 99814-0062 | 113 |
| KX450 / KX450X 2025 | 99814-0003 (shared, per-model columns) | 113 / 112 |

Suspension values checked by eye on the page images: 99803-0214 front rebound (KX252C 11 / KX252D 13), 99803-0400 front rebound
and compression, 99814-0003 rear rebound (KX450M 13 / KX450N 10). A setting whose box could not be read is simply absent (for
example rear low-speed compression on several KX450 years); nothing is filled in.

## Not yet loaded

- 2026 (99814-0119, -0121): the 2026 owner's manuals no longer carry the specification table; their SPECIFICATIONS page links
  to a separate online specifications document (99888-0041-01 for KX250 / KX250X, 99888-0048-01 for KX450 / KX450X), which has
  not been fetched. The 2026 suspension pages also read badly (two settings for the KX250; duplicate rows for the KX450). Needs
  the separate document and a look at the new setting layout.
- KX250 2021: no owner's manual listed in the Owner Center.
