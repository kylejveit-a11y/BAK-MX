# 2010–2019 bikes (decided by Kyle, Nov 15 2026)

Scope: every family BAK already covers, back to 2010, US standard models. Skip for now: GasGas before 2021,
Husqvarna before 2014 (pre-KTM bikes), Triumph (no dirt bikes then). Order: motocross race bikes first
(YZ/YZ-F, CRF-R, KX-F, SX/SX-F, Husqvarna TC/FC 2014+, RM-Z, 85s), then off-road (XC, XC-W, FX, WR, RX).
Garage: offer each older model-year as soon as its identity is confirmed by an official document, with the
coverage card showing honestly how complete it is.

Same evidence standard as 2020+: official owner's manuals / competition handbooks / Owner's Service Manuals for
specs, torques, sag, clickers, jetting and service schedule; official parts catalogs for parts. Facts only,
page-located, hash-guarded, no source distribution. Name history: Kawasaki KX250F (to 2020) and KX450F (to 2018).

Sources checked so far:
- KTM 2015 two-stroke owner's manual (art. 3213173en, dealer-hosted official PDF) downloads from the cloud workspace.
  Its technical-data layout differs from 2020+: tech_data_2020_2025.py returns nothing, so a pre-2020 parser is needed.
- MotoSport parts pages refuse requests from these workspaces (HTTP 403). Not worked around. Parts for older years need
  another official source (Kawasaki official tables, KTM-group spare-parts manuals, Yamaha/Honda official fiche) or a
  capture from Kyle's own computer the way the 2020+ catalogs were made.
- Yamaha's manual library lists manuals per model and year through its own JSON endpoints (see manual-textlayer README).

Work plan per brand: (1) list every official document per model-year, (2) parser for the older layout,
(3) line-by-line check against printed conversions, (4) stage + approve, (5) picker years + coverage rebuild,
(6) parts catalogs, (7) retrieval check with real questions.
