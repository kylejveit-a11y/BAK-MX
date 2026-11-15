# KTM 2013–2018 owner's manuals: technical data (74 bike-years)

Source: KTM's own US manual finder (bikemanuals.manuals.json on ktm.com/en-us/service/manuals) lists the official English
owner's manual for each bike-year; documents are on KTM's document host (azwecdnepstoragewebsiteuploads.azureedge.net).
Index: docs/research/manual-index/ktm-group-us-older.tsv. Facts only; the PDFs are not stored or redistributed.

Bikes: 85 SX 17/14 and 19/16 (2013–2016), 125/150/250 SX, 250/300 XC, 250/350/450 SX-F, 250/350/450 XC-F (2013–2018).

Reader: scripts/manual-textlayer/tech_data_pre2020.py (pdftotext layout text of the TECHNICAL DATA chapter) and build_older.py.
- Section, model-group and printed validity notes decide which rows belong to the US standard model; "USA" is read as "US";
  a model list the validity rules cannot read is dropped (fail closed), never applied.
- Every value printing a unit and its bracketed conversion (Nm/lbf ft, mm/in, kg/lb, bar/psi, ml/fl oz, l/qt, N/mm/lb/in, cm³/cu in)
  must agree within 6%; disagreeing rows are left out. Step-wise torques, wrapped labels and tables (tires, electrical, jetting charts)
  are left out. A path printed with two different values for one bike is dropped.
- Cover must name the model and year. Off-road groups printed as "EU/AUS" sub-lists are excluded from this batch.

Checks run: every kept row (≈13,500) was searched for on its own PDF page: label and value present on that page for all rows except
renamed gear labels and long wrapped text values; the two 2018 XC-W documents, whose torque headings this reader does not see, were
excluded after this check (they mis-filed torque rows), as were all XC-W / XCF-W / 500 XC-W documents for now.

Not in this batch: 2011–2012 manuals ("TECHNICAL DATA - ENGINE" layout, needs its own reader), 2019 manuals (2020+ layout; next
batch through build_from_index.py), 85 SX 2017–2019 (cover reads "85 SX"), service schedules, XC-W family, Husqvarna 2014–2019
(its manual finder uses a different address).
