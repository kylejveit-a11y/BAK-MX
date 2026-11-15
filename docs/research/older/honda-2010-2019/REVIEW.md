# Honda CRF 2010-2019 Owner's Manuals & Competition Handbooks

Source: Honda Powersports US owner's-manual downloads (`powersports.honda.com/downloads/owners-manuals`), PDFs at
`https://cdn.powersports.honda.com/documentum/MWOM/<file>`. Honda's CDN refuses automated downloads, so Kyle saved each PDF in the
browser; SHA-256 of every PDF is on every row. Index: `docs/research/manual-index/honda-us-older.tsv` (41 PDFs).

Families: CRF250R and CRF450R 2010-2019, CRF450RX 2017-2019, CRF250RX 2019, CRF250X 2012-2017 (no 2014 manual listed),
CRF450X 2012-2017 and 2019, CRF150R 2012-2019 (manuals shared with the CRF150RB).
Shared manuals: the 2018 CRF450R manual also covers the CRF450RX, and the 2019 manuals cover CRF250R/RX and CRF450R/RX/RWE. Each
shared manual is loaded once per model; a value printed under the other model's tag ("(CRF450RX)") is never used.
Not on Honda's site: CRF150R 2010-2011, CRF250X/CRF450X 2010-2011, CRF250X 2014, a separate 2018 CRF450RX manual.

Reader: `scripts/older/honda_older.py`; assembly and checks: `scripts/older/assemble_honda_older.py`.
- Specification table (2010-2018 single-table manuals only). A row is kept only when label and value are on one line of one column;
  English and metric must agree (in/mm, US qt/L, US oz/cm3, US gal/L, psi/kPa). Wrapped labels, labels that swallowed a number, and
  any row naming a model are left out. Not read: the 2019 layout, the separate R/RB tables of the CRF150R manuals and the CRF250X /
  CRF450X tables (both read with too many wrapped rows to trust).
- Dampers, from the adjustment procedures in the competition chapter. Two printed styles:
  "Turn the adjuster counterclockwise 11 clicks" from full hard -> "Standard setting (out from full hard)";
  "Turn ... counterclockwise (softer) until it clicks. This click is position 1. The standard position is position 7 (7th click)"
  -> "Standard position (click number from full hard; the first click out is position 1)".
  "has 20 positions or more" -> "Adjuster positions (at least)". Front/rear, compression/rebound and high/low speed come from the
  headings above the step; a step under no damper heading (the steering damper) is not used; two different values for one adjuster
  drop both.
- Torque tables (Item | lbf-ft | N-m | kgf-m): N-m checked against lbf-ft (+-1) and kgf-m (+-0.1); an item that ran into the next
  item's number is left out, and so is an item whose label kept a figure call-out number ("Fork cap 27"), a cut-off label, or a row
  whose section (engine / frame) could not be read; NOTES are written out in the label. A wrapped "Fuel octane" value is left out.

Page check: every number in every value is printed on its own PDF page (no failures).
Spot checks against the PDFs: 2014 CRF250R (fork 6/11 clicks, shock high speed 2 1/2-3 turns, low speed 8, rebound 11), 2015 CRF450R
(KYB four-way fork 11/12/8/9 clicks, shock 18/15/4), 2016 CRF250R (air fork position 7 / 29, shock 2 3/4-3 1/4 turns, positions 10 / 7),
2019 CRF450R vs CRF450RX (fork 8/12 vs 7/15) and CRF250R vs CRF250RX (7/11 vs 11/14).
Known gaps: some shock adjusters printed as "7 to 10 clicks (CRF250R)/10 to 13 clicks (CRF250RX)" in one sentence are not read.
