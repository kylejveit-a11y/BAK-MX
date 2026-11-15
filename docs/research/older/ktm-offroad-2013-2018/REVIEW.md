# KTM off-road (XC-W, XCF-W) 2013-2018 and 85 SX 2018 owner's manuals (24 bike-years)

Source and index as docs/research/older/ktm-2013-2018/REVIEW.md (KTM's US manual finder, KTM document host, SHA-256 on every row).
Pre-2020 reader (`tech_data_pre2020.py`, `build_older.py`), technical data only.

- 2018 manuals set even pages with a left margin, so section and group headings were not recognised and rows landed under the
  previous section (the reason 85 SX 2018 and the 2018 XC-W were held back before). The reader now measures indents from each page's
  own margin. The eleven 2018 race-bike bike-years already loaded were rebuilt with the fixed reader: identical rows.
- 250/300 XC-W 2013-2017: the fork section is printed under model-list groups that name EXC EU/AUS and XC-W US together; the reader
  cannot tell which values are the US bike's, so those groups are left out (fail-closed). Engine, chassis, shock, torque rows are kept.
- 500 XC-W 2015 prints its engine torque heading as "Motor tightening torques"; kept as printed.
Checks: every row's label and value searched on its own PDF page: 4,059 rows, 0 not found.
