# Yamaha 2010-2019 Owner's Service Manuals (67 bike-years, 25,742 rows)

Source: Yamaha's owner's-manual library. The publication for each model and year comes from the library's own `model_list`
endpoint (baseCode 6150, langId 02, destination USA, English); index: `docs/research/manual-index/yamaha-us-older.tsv`.
PDFs from `library.ymcapps.net/library/om/contents/pdf/10/<publication>_02.pdf`, SHA-256 on every row.
Families: YZ125, YZ250, YZ250X (2016+), YZ250F, YZ450F, YZ250FX (2015+), YZ450FX (2016+), WR250F, WR450F.
Already on file and not reloaded: YZ250F 2019, YZ450F 2018-2019.

Builder: `scripts/older/build_yamaha_older.py`, then `scripts/older/assemble_yamaha_older.py`. Every reader is the one used for the
2020+ manuals, with fixes for the older layouts:
- Specification table. 2010-2013 four-strokes and all two-strokes use the ruled "MAINTENANCE SPECIFICATIONS" layout; the 2020
  two-stroke reader (`yamaha_specs_2020.py`) reads it, taking the USA column only and checking every mm value against its inch
  conversion. 2014+ four-strokes use the newer reader (`yamaha_specs.py`).
- Dampers. From the adjustment procedures (`scripts/older/yamaha_dampers_older.py`): the standard position must be the US value
  (a value tagged "(USA)", or the unstarred value when the star's footnote names other markets only); "About 14 clicks out" keeps
  "About". Where the procedures could not be read, the chapter-2 "adjusting positions" table is used with the same US rule. Where a
  manual prints both and they disagree, the bike-year's table dampers are not loaded (YZ250FX 2018: torques only).
  2018+ tables are cross-checked against the procedures; a table "Fully tuned in." (sic) is the 0 position.
- Tightening torques (`yamaha_torques.py`, and `scripts/older/yamaha_torques_2010.py` for the 2010-2013 four-stroke tables with
  separate Nm / m•kg / ft•lb columns): every N·m checked against its m·kg and ft·lb on the same row; a mismatch drops the row.
- Removed in assembly: labels that swallowed a value cell, figure call-out letters at the end of a label, unreadable wrapped
  damper headings, market-mixed table values, duplicate paths.

Not loaded: YZ450F 2012 (the table reader could not read this manual), YZ85 and YZ65 (owner's manuals without the service tables).
Some 2012-2015 four-strokes carry only 9-12 damper rows (rear fast / slow compression headings wrap and are left out).

Checks: every number in every row found on its own PDF page, except damper extremes read from the extent box on the facing page and
step-wise "See TIP" torques whose text runs onto the next page. Labels the readers build ("... limit", "... quantity") are not printed
word for word.
