# Kawasaki KX 2026 (US): specification documents and owner's-manual settings — review

Status: APPROVED for loading as published facts (2026-10-16).

## Sources (all from Kawasaki's own manual server, `pws.ktivs.net/dispeBook?file=<code>&lang_code=EN`)

| Code | What it is | Models | Used for |
|---|---|---|---|
| 99888-0041-01 (served as revision -02) | 2026 KX250 / KX250X specifications, 4-page PDF | KX252E, KX252F | Spec table rows (dimensions, engine, transmission, frame, tires, fork oil amounts, travel, brakes, battery) |
| 99888-0048-01 | 2026 KX450 / KX450X specifications, 4-page PDF | KX450M, KX450N (KX450P not loaded) | Same |
| 99814-0119 | 2026 KX250 / KX250X owner's manual (HTML eBook) | KX252E, KX252F | Standard damper settings, spring rates, preload nut position, fork oil level, fork height, tire pressure |
| 99814-0121 | 2026 KX450 / KX450X owner's manual (HTML eBook) | KX450M, KX450N, KX450P | Same |

Document hashes are in `specs-2026.json` (`document_sha256`); for the eBooks the hash covers the page text and the page images
that were checked.

## Model mapping

The 2026 manuals print their own links with `mark=KX252ETF` / `mark=KX450MTF` and `model_year=2026`, so KX252E is the 2026
KX250 and KX450M the 2026 KX450. The documents never print "KX250X" or "KX450X": KX252F and KX450N were matched to those names
because their dimensions agree with Kawasaki's 2026 US spec sheets for the KX250X and KX450X. The KX450P column (a third
variant, not sold as a separate US model) is not loaded.

## Checks

- Every suspension and tire value was read from the eBook text and checked against the page image. Spot checks by the loader
  on 2026-10-16: KX450N fork rebound 11 clicks (p.131), KX450M high-speed compression 2 turns out and KX450N 1 3/4 (p.164),
  KX450M preload nut 120.1 mm with 54 N/mm standard spring and KX450N 119.5 mm with 52 N/mm (p.168), KX450 tire air pressure
  adjustable range 100 – 125 kPa (14 – 18 psi) (p.171); KX250 / KX250X values against the eBook text rows.
- The 2026 KX450 spec table matches the 2025 KX450 table (99814-0003) row for row where nothing changed.
- Not stated anywhere: rider/race sag (Kawasaki gives the preload nut position instead), separate front and rear tire
  pressures (one range for both), fork oil air-gap level (oil is given by volume), torque table.
- 99888-0041-02 lists outer-tube oil for KX252ET (334 mL) and KX252EV (336 mL); the KX252ET value matches the 2026 manual and is
  the one loaded for the KX250. 99888-0048-01 gives the KX450N rear tire as 120/90-18 (Kawasaki's marketing sheet says
  120/80-18); the specifications document value is the one loaded.

Facts only; the documents are not redistributed.
