# Enduro sag gaps closed — 20 November 2026

Husqvarna FE 450 and FE 501, 2020-2022, and GasGas EC 250 2021 had no manual facts on file.

| Manual | Document | SHA-256 (first 12) | Bikes | Rows |
|---|---|---|---|---|
| Husqvarna Owner's Manual 2020 FE 450 FE 501, 3402343en | 20_3402343_en_OM | 0f34d6f46a4a | FE 450, FE 501 2020 | 250, 262 |
| Husqvarna Owner's Manual 2021 FE 450 FE 501, 3402453en | 21_3402453_en_OM | 50cccbe2505e | FE 450, FE 501 2021 | 264, 266 |
| Husqvarna Owner's Manual 2022 FE 450 FE 501, 3402542en | 22_3402542_en_OM | 7872213ef472 | FE 450, FE 501 2022 | 286, 288 |
| GasGas Owner's Manual 2021 EC 250 EC 300, 3215011en | 21_3215011_en_OM | 1bdb4a8d4527 | EC 250 2021 | 237 |

The three Husqvarna documents were not in the manual index (the US manual page does not list them); they are on the makers'
document host. The GasGas manual was indexed for the EC 300 only; its cover names both models.
Read with `scripts/manual-textlayer/build_from_index.py` (payloads `fe-0..5.json`, `ec-0.json`; no dropped-shape flags, damper
cross-check passed). The FE rows were staged through `private.kg` as differences against the FE 450 2023 rows already on file
(hash-guarded: all six matched) and promoted to VERIFIED after the sag, spring-rate and damper rows were re-read on the page
(browser read for 2020 and 2021, text re-read for 2022): 1,616 rows.
All three FE years print static sag 37 mm, riding sag 110 mm, and shock springs 39 / 42 / 45 N/mm by rider weight.
The PDFs were deleted after reading.
