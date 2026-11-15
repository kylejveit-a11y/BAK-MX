# KTM 2011-2012 owner's manuals (22 bike-years)

Source and index as docs/research/older/ktm-2013-2018/REVIEW.md (KTM's US manual finder, KTM document host, SHA-256 on every row).
The 2011-2012 manuals head each page "TECHNICAL DATA - FORK  84" and print sub-section titles with their number on the next line
("450 SX-F USA" / "24.2"). `tech_data_pre2020.py` now rewrites those pages into the 2013-2018 shape before reading them; model titles
("450 SX-F USA", "All 125/150 models") become validity groups, so only the US model's rows are kept and unreadable model lists are
left out. A 2016 bike-year rebuilt with the changed reader gave identical rows.

Loaded: 125/150/250 SX, 250/300 XC, 250/350/450 SX-F, 250/350 XC-F (2011 and 2012), 500 XC-W and 350 XCF-W 2012.
Not loaded: 250/300 XC-W 2011-2012 (EXC/XC-W combined manuals whose model titles the reader cannot separate).
Removed after review (`filter_batch.py`): the carburetor-chart legend ("Carburetor configuration", a stray "x" section), "Fork / Air
chamber length" (a tolerance joined wrongly) and lamp rows. Page check: every remaining row's label and value found on its own page.
