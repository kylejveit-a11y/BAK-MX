# Honda race sag and free sag, 2010–2019 — 18 November 2026

Honda's CDN refuses automated downloads (HTTP 403 from servers and from a plain request on Kyle's computer). With Kyle's
approval the 41 US owner's manuals in `docs/research/manual-index/honda-us-older.tsv` were fetched inside the browser pane on
his computer from Honda's own host, hashed there (SHA-256) and read with pdf.js. Nothing was saved to disk; no manual text is kept.

Read from each manual:
- the single line `Standard Race Sag: A in (B mm)` in the Rear Suspension Race Sag procedure (the worked "Race Sag = 3.9 in
  (100 mm)" example and the "decrease / increase" examples are never taken);
- where printed, step 6 of the same procedure: "the rear suspension should sag 0.4 to 1.0 in (10 to 25 mm)" (free sag with
  the race sag set).
Checks: exactly one standard line per document; millimetres against the printed inches; 33 of 33 loaded documents have the
same SHA-256 as when their specification tables were loaded. Rows and page numbers: `results.txt`
(file | sha256 | pdf page / printed page / in / mm | free sag pdf / printed / in / in / mm / mm).

Loaded through `private.stage_manual_rows` (hash-guarded) and verified, 35 bike-years, 53 rows:
- CRF250R 2010–2019: 105 mm. CRF250RX 2019: 105 mm (same manual as the CRF250R, one figure for both).
- CRF450R 2010–2012 and 2014–2019: 105 mm; 2013: 100 mm. CRF450RX 2017 and 2019: 105 mm.
- CRF250X 2012, 2013, 2015–2017: 100 mm. CRF450X 2012–2017: 100 mm; 2019: 105 mm.
- Free sag 10–25 mm: CRF250R 2010–2013, CRF450R 2010–2012, CRF250X and CRF450X 2012–2017.

Loaded 19 November 2026 (Kyle's decision: go with the best-supported figure):
- CRF150R 2012–2019 (8 bike-years, 8 rows): 85 mm. Each manual prints "Standard Race Sag: 3.3 in (85 mm)" and repeats it in
  the worked example on the same page ("Race Sag = 3.3 in (85 mm)", printed page 104). The 90 mm and 100 mm figures on that
  page are labelled examples of decreasing and increasing sag, carried over from the full-size manuals, and are not taken.
  Honda's 2020–2026 CRF150R manuals print the same 85 mm. Forum threads could not be read (the sites refuse automated
  requests), so this rests on Honda's own pages, not on rider reports. Document hashes equal the earlier specification load.

Not loaded:
- CRF450RX 2018: Honda lists no manual.
- Free sag for 2013 CRF450R and 2014+ R models: those manuals do not print the step.
