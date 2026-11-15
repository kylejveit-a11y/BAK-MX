# Husqvarna 2014-2019 owner's manuals (53 bike-years)

Source: Husqvarna's US manual finder (`husqvarna-motorcycles.com/en-us/service/user-manuals`, the `bikemanuals.manuals.json`
endpoint its page calls; it moved from `/service/manuals` in 2026). Index: `docs/research/manual-index/husqvarna-us-older.tsv`
(`scripts/index-ktm-older-manuals.py Husqvarna`). PDFs from the KTM-group document host, hashed (SHA-256 on every row).

Scope notes
- For the motocross bikes (TC, FC) the finder lists only the EU or worldwide English manual for most years; those are used for the
  US bike. Rows the manual tags for another market are dropped by the market check, as for KTM.
- 2014-2018 manuals: pre-2020 reader (`tech_data_pre2020.py`, `build_older.py`); technical data only. 2014 TC covers print "125 TC";
  the cover check now accepts that order.
- 2019 manuals: 2020+ reader (`build_from_index.py`), technical data only; the service schedule was left out as for KTM 2019.
- 2018 Husqvarna manuals were **not loaded**: their torque tables sit under headings the pre-2020 reader does not see (rows landed under
  "Shock absorber" / "Engine"), the same problem as KTM 85 SX and XC-W 2018. They stay listed as todo.
- TE 250 / TE 300 2019 have no English manual in the finder; FC 2014 and TC 2015 manuals are thin (chassis and torques only for TC 2015).

Checks
- Every row's label and value searched on its own PDF page (`scripts/older/check_pages.py`): 8,941 rows, 28 not found. 13 were hyphen
  spacing in tire, jet-needle and spark-plug codes (correct on the page); 15 were removed with `scripts/older/filter_batch.py`:
  "Fork / Air chamber length" in seven 2017 manuals (a tolerance the reader joined wrongly) and three FE 350 2016 lamp rows.
- Section names set in lower case by a running head were capitalised so the same fact keeps one path.
- A path printed with two values for one bike was dropped by the builder; units checked against their printed conversions.
