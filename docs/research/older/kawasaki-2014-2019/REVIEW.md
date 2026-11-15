# Kawasaki KX250F / KX450F 2014-2019: suspension baselines from the owner's manual text layer (12 bike-years, 81 rows)

Source: Kawasaki's US Owner Center lookup gives each model-year's owner's manual (index: `docs/research/manual-index/kawasaki-us-older.tsv`).
The manuals are view-only in Kawasaki's viewer; its search text layer (`search.xml`) is served for 2014-2019. The page images used by the
2020+ OCR pass are no longer served, and 2010-2013 have no text layer, so those years are not loaded.

Model names: the bikes were sold as KX250F / KX450F until 2018 (KX250 / KX450 from 2019). The rows are filed under the app's family
names KX250 / KX450 so the Garage shows one family; the source and revision on every row name the manual as printed.

Reader: `scripts/older/kawasaki_textlayer_older.py`. The text layer runs words together, so only two unambiguous patterns are taken,
each from a single e-book page:
- standard damper / preload settings: the page must hold exactly one "Standard ... Adjuster Setting" box and exactly one
  "n clicks/turns ** : (counter)clockwise from the fully seated position" value; the usable range is kept when printed once on the page
  and the standard must lie inside it. Turns printed "13/4" (the space lost) are read as 1 3/4 only for turns, where 13/4 is impossible.
- the starred standard rear spring rate "K=n N/mm* (K=m kgf/mm)" with "*: Standard", N/mm checked against kgf/mm.
Pages naming both front fork and rear shock are skipped, as are values run into a page number (caught by the range check).
Front settings of the KX450F 2014-2019 (air fork / page layout) did not pass these rules and are not loaded.
Locator: e-book page and the printed page number found in the page footer. Document hash: SHA-256 of the text layer as downloaded 2026-11-15.
