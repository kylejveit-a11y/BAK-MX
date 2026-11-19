# KTM-group bikes with no sag on file: why, and what Ask BAK now says (19 November 2026)

Three roster bike-years had manual facts on file but no sag: Husqvarna FC 250 2026, Husqvarna FC 450 2026, KTM 125 SX 2023.
The manuals were fetched again; each file matches the SHA-256 recorded when its other tables were loaded.

| Manual | SHA-256 (first 12) | Suspension tables printed | Static sag | Rider / riding sag |
|---|---|---|---|---|
| Husqvarna FC 250 2026, 3402884en | cd1a4d22fb50 | "(EU)" p.164; "(Factory edition)" p.165 | 35 mm; 38 mm | 105 mm; 105 mm |
| Husqvarna FC 450 2026, 3402886en | 0e8fd342e216 | "(EU)" p.166; "(FACTORY EDITION)" p.167 | 35 mm; 38 mm | 105 mm; 105 mm |
| KTM 125 SX / 125 XC 2023, 3214638en | 6b4ed2e8a25e | "125 SX EU" and "125 XC US", PDF p.136 (printed 134) | 35 mm (1.38 in) both | 105 mm (4.13 in) both |

The procedure pages (p.47 Husqvarna, p.41 KTM) repeat the same figures with the same labels.

None of these manuals has a table labelled for the US standard model (the 2025 FC 250 manual did: EU, US and Factory
Edition tables, all 35 / 105 mm). The loader selects US rows by printed validity, so it rightly loaded nothing, and
these figures are still not loaded as verified US facts. Instead `shared/maker-publishing.ts` carries a note for the three
bike-years quoting the printed figures with the table each comes from (prompt mx-engineering-90).

Still without any sag source: GasGas EC 250 2021 and Husqvarna FE 450 2020-2022 (no manual facts on file at all).
