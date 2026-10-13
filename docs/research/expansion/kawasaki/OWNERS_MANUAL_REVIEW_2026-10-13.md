# Kawasaki KX owner's manuals: OCR review, 2026-10-13 (in progress)

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
  against the usable range printed on the same page.
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

## Not yet loaded

- KX250 / KX250X 2022 and 2023 (99803-0214, 99803-0306): payloads built, the database hash did not match on load (to be diffed).
- KX450 / KX450X 2021-2023 (99803-0181, -0216, -0308): three of four damper boxes read; the fourth fails the range check.
- 2025-2026 (99814-0061, -0062, -0003, -0119, -0121): specification and chart rows read (the 2026 manuals print a shorter
  specification table, 22 rows); the suspension chapters have sub-headings in the viewer's index, so their pages were not all
  fetched. Page ranges fixed in `build_kawasaki.py`; pages still to fetch and the build to re-run.
- KX250 2021: no owner's manual listed in the Owner Center.
