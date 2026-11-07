# Honda CRF250R/RX and CRF450R/RX competition handbooks: engine management, 2027 tires, remaining spec gaps (2026-11-07)

Result: **no payloads.** The handbooks do not print the facts that are missing, and every spec the handbooks do print for
these bike-years is already VERIFIED. Nothing was written to any database; the database was read with SELECT only
(Supabase project yzvrujffiktfserrgkcb, `public.claims`, manufacturer Honda, status VERIFIED).

## Sources read

Honda competition handbooks that Kyle downloaded in his own browser (Honda's CDN refuses automated downloads). Each was
downloaded once from his Dropbox copy into an empty scratch folder, hashed, read, and deleted after reading. The hashes are
identical to the ones recorded in `../pass2/REVIEW.md`, so these are the same documents the earlier passes used.

| Document (Honda CDN `https://cdn.powersports.honda.com/documentum/MWOM/<file>`) | SHA-256 | Pages |
|---|---|---|
| ml.remawmom.2021_crf250r-rx_61k95x01_ch_web.pdf (CRF250R/RX CH, MY2021) | 56cec4bfbad03cc8ad8779c1ca9391692012802d0befb8fc86298ca96d0480ef | 132 |
| ml.remawmom.2021_crf450r-rx-rwe_ch_61mkex00_web.pdf (CRF450R/RX/RWE CH, MY2021) | 1e97eb2010892b2b11a45d4f49fe5d85af4e8d9eac429c8121a0e836d41c805a | 124 |
| ml.remawmom.2022_crf250r_rx_competition_handbook.pdf | 6bb82e92779c1a6dab33314b6dcb8b02cf2baf14f43edd13bac088447a7b060d | 126 |
| ml.remawmom.2022_crf450r_rx_rwe_competition_handbook.pdf | 24cf776173f95eab9ea06826dd43562acc1c81680a14abcd292c467c68e79d8a | 124 |
| ml.remawmom.ak952424chen.pdf (2024 CRF250R/RX CH) | 3388e50048f0a99edffda9653f9457bcba8d51ba6529e2c9d4f8352ac19017e8 | 126 |
| ml.remawmom.amker2424chen.pdf (2024 CRF450R/RX/RWE CH) | 15551ba9b237cffff0c3b2052335f55ac959bde733daa9d237475f484e8030cd | 124 |
| ml.remawmom.ak952727chen.pdf (2027 CRF250R/RX/HRC-WE CH) | 72a3380a429a654881d201cf55e3be6461050ff193887e3c4772ba6a32231438 | 136 |
| ml.remawmom.amker2727chen.pdf (2027 CRF450R/RX/HRC-WE CH) | 03e24e426dc007cf84250b241e39a6ff498d226f487f3fd46b02066fd9759c7e | 128 |

## 1. Engine management and fuel (2021, 2022, 2024, 2027)

What is on file (VERIFIED): engine mode 1/2/3 and how to change it, HSTC levels / factory setting / on-off, HRC Launch
Control levels / activation / use / cancel, octane (PON 91) and ethanol (up to 10%, no methanol) for 2020 (owner's
manuals 31K95620, 31MKE630) and 2023, 2025, 2026 (owner's manuals ak952323omen, amker2323omen, ak952525omen,
amker2525omen, amker2626omen). Every one of these rows comes from an **owner's manual**, not a handbook.

The competition handbooks do not contain these sections. Checked in all eight handbooks:

- text layer (`pdftotext -layout`), every page, for engine mode, PGM-FI mode, mode select, HSTC, Selectable Torque, launch
  control, start button, octane, PON, unleaded, ethanol, gasoline: the only hits are the warning "Gasoline is highly
  flammable", the chain-cleaning note (no gasoline as solvent), and component labels in the wiring diagram
  (ENGINE MODE SELECT SWITCH, HSTC SWITCH, HSTC IND, MAP MODE SW);
- the 2027 CRF250 and CRF450 handbooks were also rasterised at 150 dpi and every page OCR'd with tesseract for the same
  terms plus tire terms, to catch text held in images (see section 2).

Wiring-diagram labels were not turned into "equipped with" rows: in the 2022 and 2024 CRF250 handbooks part of the diagram
is not in the text layer (no HSTC label appears there), so presence or absence cannot be read reliably, and a switch label
says nothing about modes, levels or operation.

**Gap stays open:** 2021, 2022, 2024 and 2027 CRF250R/RX and CRF450R/RX engine-mode, HSTC, launch-control, octane and
ethanol rows (and 2026 CRF250R/RX, which has only the fuel-pump torque on file) need the **owner's manuals** of those
years. Honda's file names follow the pattern of the ones already used (`ml.remawmom.ak95<yy><yy>omen.pdf` for CRF250,
`ml.remawmom.amker<yy><yy>omen.pdf` for CRF450 from 2023; the 2021/2022 owner's manuals have other names). Kyle would need
to download them in his browser as before.

## 2. Stock tires

- **2027 CRF250R/RX, CRF450R/RX:** the handbooks print only the cold tire pressure (100 kPa, 1.0 kgf/cm2, 15 psi, front
  and rear: CRF250 page 2-89, CRF450 page 2-83), which is already VERIFIED for all four bikes. They print **no tire size,
  brand or model**. The only other tire table is the blank "SETTING RECORD SHEET" (CRF250 page 3-23, CRF450 equivalent),
  whose Tire brand / Size / Cold tire pressure cells are empty boxes for the rider to fill in. The pages next to 2-89 /
  2-83 were rendered and looked at (the page after 2-89 is a blank MEMO page); the OCR pass over all 264 pages of the two
  2027 handbooks found no tire size or tire model. **Gap stays open:** needs the 2027 owner's manuals.
- **2023 CRF250RX:** already complete on file from the 2023 CRF250R/RX owner's manual (ak952323omen, printed page 69):
  front 90/90-21 54M DUNLOP AT81F, rear 110/100-18 64M DUNLOP AT81, bias-ply tube type, 100 kPa (15 psi) cold front and
  rear (also from the handbook, page 2-85). Nothing to add.

## 3. Other handbook spec rows for these bike-years

The handbooks were mined in earlier passes (R 2022-2026 in the September/October passes, `../pass2/` for 2021 R/RX, RX
2022-2026 and 2027, `../pass3/`). Compared category by category against the VERIFIED claims for 2021, 2022, 2024 and 2027
(both families, R and RX): torque tables, cylinder / piston / clutch tables, valve clearance, engine oil and coolant
capacities, idle, spark plug, throttle freeplay, chain (links, slack, replacement chain, wear limits, rollers, sliders),
sprockets, fork (adjuster standards and ranges, spring rates and identification, oil capacities standard / min / max per
spring, damper filling and after-bleeding volumes, remaining-oil tables), shock (adjusters, spring rates, race sag, spring
install length), rim runout, tire pressure, maintenance schedules and optional parts. No handbook value was found missing.

Apparent duplicates with two values on one path (e.g. CRF450R 2022 / 2024 fork compression 10 vs 13 / 9 clicks, fork oil
387 vs 388 cm3, replacement chain DID 520DM2-120RB vs DID 520DM2 G&B-114RB) were checked: the second value of each pair is
stored with `variant = 'RWE'`, matching the handbook's CRF450RWE lines. They are correct and not duplicates.

## Payloads

None. `docs/research/expansion/honda/handbooks-2026-11-07/` holds only this review. PDFs and page renders were deleted.
