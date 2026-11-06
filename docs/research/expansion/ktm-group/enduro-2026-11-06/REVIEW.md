# KTM, Husqvarna and GasGas enduro owner's manuals: text-layer review, 2026-11-06

Continues `../TEXT_LAYER_REVIEW_2026-10-10.md` and `../TEXT_LAYER_REVIEW_2026-10-13.md`. Same sources (the English owner's
manuals the brands list on their US manuals pages, served from `azwecdnepstoragewebsiteuploads.azureedge.net`), same extractor
(`scripts/manual-textlayer/`, unchanged), same rule: facts only, each with the document, SHA-256, PDF page and printed page.
No manual is stored or redistributed; the PDFs were read in a scratch directory and deleted afterwards.

Nothing in this folder has been loaded into the database.

## What is here

| Path | What |
|---|---|
| `load/0.json` … `load/68.json` | The load set: 69 payloads (one per bike-year), 18,547 rows, output of `finalize_payloads.py` |
| `load.summary.json` | One line per payload: rows, schedule rows, damper values, damper groups withheld, conflicts and flagged rows dropped |
| `stage/<document>/` | Payloads as `build_from_index.py` wrote them, before the damper check |
| `stage/<document>.report.json` | Per-document report: sections, dropped conflicts, flagged shapes, validity notes seen |
| `stage/<document>.dampers` | `check_dampers.py` result per bike-year |

Pipeline, run per document from the document's own download directory:
`build_from_index.py docs/research/manual-index/ktm-group-us.tsv todo stage/<document> <document>`, then
`check_dampers.py stage/<document>/*.json > stage/<document>.dampers`, then `finalize_payloads.py stage load`.
The 50 index rows added for this pass carry status `todo`.

## What was added

18,547 facts across 69 bike-years from 47 manuals: 4,061 service-schedule rows and 891 damper click/turn settings. Each cell is
facts / service-schedule rows / damper settings, as in the earlier reviews.

| Model | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 |
|---|---|---|---|---|---|---|---|---|
| KTM 150 XC-W | 255/58/15 | 264/58/15 | 280/59/12 (c) | 287/59/15 | 284/59/9 (d) | 260/57/15 | 274/59/15 | 271/59/15 |
| KTM 250 XC-W | 236/58/9 (a) | 245/59/9 (a) | 262/59/12 (c) | 277/59/15 | 278/59/9 (d) | 259/59/15 | 240/58/6 (b) | 241/59/6 (b) |
| KTM 300 XC-W | 236/58/9 (a) | 245/59/9 (a) | 262/59/12 (c) | 277/59/15 | 278/59/9 (d) | 259/59/15 | 240/58/6 (b) | 241/59/6 (b) |
| KTM 450 XCF-W |  |  |  | 256/55/15 | 275/57/9 (d) | 271/57/15 | 280/58/15 | 276/57/15 |
| Husqvarna TE 150 | 258/59/15 | 259/60/15 | 278/60/15 | 291/59/15 | 291/60/15 | 269/58/15 | 282/60/15 | 276/60/15 |
| Husqvarna TE 250 | 265/59/15 | 266/60/15 | 283/60/15 | 285/59/15 | 274/60/15 | 245/60/6 (b) | 268/60/12 (e) |  |
| Husqvarna TE 300 | 265/59/15 | 266/60/15 | 283/60/15 | 285/59/15 | 276/60/15 | 245/60/6 (b) | 253/60/6 (b) | 252/60/6 (b) |
| Husqvarna FE 450 | no US manual | no US manual | no US manual | 287/55/15 | 296/56/15 | 279/56/15 | 280/57/12 (e) |  |
| GasGas EC 250 |  | no US manual | 280/60/15 | 280/59/15 | 275/60/15 | 274/60/15 |  |  |
| GasGas EC 300 |  | 271/60/15 | 280/60/15 | 280/59/15 | 275/60/15 | 274/60/15 | 270/60/12 (e) | 269/60/12 (e) |
| GasGas EC 450F |  |  |  |  | 271/57/12 (e) | 282/58/15 |  |  |

(a) No fork rows. The fork section and its rows carry the note "All standard EXC/XC-W models, All ERZBERGRODEO …", which `validity.py`
does not understand, so they were dropped (fail closed). Shock rows are complete.
(b) No fork rows. The new-layout manual splits the fork into sections headed "(All except HARDENDURO models)" / "(All HARDENDURO models)"
(KTM 2026-2027), "(all except PRO models)" / "(all PRO models)" (Husqvarna 2025) or "(All standard models except 250 US)" / "(TE 300 PRO)"
(Husqvarna TE 300 2026-2027). None of these headings is understood, so both fork sections were dropped. In addition the shock high-speed
compression group was withheld by the damper check (d/e).
(c) Fork rebound damping is printed with two different values for one bike and was dropped (see below).
(d) Shock low-speed compression and rebound (18 / 15 / 12 clicks) are not printed as a Comfort / Standard / Sport triple in the adjustment
section of the same manual; `check_dampers.py` withheld both groups.
(e) Shock high-speed compression (2.5 / 2 / 1.5 turns) could not be matched to the adjustment section; withheld, as in the 2026-10-13 pass.

Per bike this is the technical-data chapter (engine, gearing, capacities, chassis, electrical, fork, shock with Comfort / Standard / Sport
settings, sag, spring rates by rider weight), engine and chassis tightening torques, and the full service schedule. Schedule tables passed the
column check on every page (no schedule problems in any document).

## Documents

Each document was found through the brand's own US manuals lookup (the JSON endpoints behind ktm.com/en-us/service/manuals,
husqvarna-motorcycles.com/en-us/service/user-manuals and gasgas.com/en-us/service/manuals), which name each manual "US (en)". Each was
downloaded from the official host into its own empty directory, checked against the host's Content-Length, hashed, and its cover checked for
model and year. Page 3 of every manual lists the vehicle variants with their market; every bike loaded here has a printed US variant
(e.g. "250 XC-W US (F7375X4)", "TE 150i US (F2175T9)", "EC 450F US (F0375X9)").

| Document | Pages | Cover (models, year) | SHA-256 |
|---|---|---|---|
| 20_3214006_en_OM | 171 | 2020 150 EXC TPI, 150 XC-W TPI | `7fdbf68631039ed08300b24b07b889434b3c4ab14c721b68b4affdef1ae93820` |
| 20_3214131_en_OM | 180 | 2020 250/300 EXC TPI, 250/300 XC-W TPI, Six Days, Erzbergrodeo | `e439d61dc5cc7d6d72e8297093dca4ce287fc0345eaf84aa89100b447807aa4a` |
| 21_3214218_en_OM | 173 | 2021 150 EXC TPI, 150 XC-W TPI | `e4026c984525c26e6a3e2037fb8b24f0ad508639a3a6aeac048705e39f450807` |
| 21_3214220_en_OM | 182 | 2021 250/300 EXC TPI, 250/300 XC-W TPI, Six Days, Erzbergrodeo | `087ac25b38c431d5e80883b492049dc53dd3677c3c60c7b133b6e4dcc2f68b4a` |
| 22_3214420_en_OM | 177 | 2022 150 EXC TPI, 150 XC-W TPI | `8e8eedf7b16665fad3aa845ddd0489d5a9856c89ba717d2944344694f2543764` |
| 22_3214421_en_OM | 182 | 2022 250/300 EXC TPI, 250/300 XC-W TPI, Six Days, Erzbergrodeo | `82ea06aed862d977592ccf13abff8002131c2711e3cb504f725459a19b304df6` |
| 23_3214643_en_OM | 177 | 2023 150 EXC, 150 XC-W | `36e84d1a37640db53c9a30ce9472759c3d25600c835182ac4749230e9b3c48b1` |
| 23_3214644_en_OM | 182 | 2023 250/300 EXC, 250/300 XC-W, Six Days, Erzbergrodeo | `425fcb470ce84da94da8b64990a6f7d96f22b6fcfdfd582009323207b01e7055` |
| 23_3214649_en_OM | 178 | 2023 450/500 EXC-F, 450 XCF-W, Six Days | `ba2668fbe10fc3a7ce4564e7dd98df2a435219ddeee9721fc61aed31ecd3ee86` |
| 24_3214837_en_OM | 171 | 2024 150 EXC, 150 XC-W | `9cd850245d2b9810def5c27fe4b5613b6e59db165a9945dba7e9c8f0646b5de9` |
| 24_3214838_en_OM | 173 | 2024 250/300 EXC, 250/300 XC-W, Six Days, Hardenduro | `188871f03d403c05c6216ad13752f3f516101f6031400ef25fd80c03cbb39070` |
| 24_3214841_en_OM | 169 | 2024 450/500 EXC-F, 450 XCF-W, 500 XW-F, Six Days | `fab44bca9f96f18df566ef9f5c877557742eaf68d670844df738e911e8c94d62` |
| 25_3240046_en_BA | 181 | 2025 125 XC-W, 150 EXC, 150 XC-W | `de28df4aeefbe8271edb3080f93c1410c7d6092f69c5d36e3a06a2b4df74f9e8` |
| 25_3240047_en_BA | 180 | 2025 250/300 EXC, 250/300 XC-W, Champion, Factory, Hardenduro, Six Days | `8c80b7646ce78678b2ce22f0f8926918b9e64ecc3ead1998290354aa8660bfdd` |
| 25_3240051_en_BA | 174 | 2025 450/500 EXC-F, 450 XCF-W, 500 XW-F, Six Days, Champion | `0d907b2852ec609870a6729935db867aee9819603598f773b0bea38573535fcf` |
| 26_3240237_en_BA | 179 | 2026 125 XC-W, 150 XC-W | `376e710b4e1ebd2fc3634eeea737b7262afb2fd5c3aada12c95f731e285f1b6e` |
| 26_3240239_en_BA | 195 | 2026 250 XC-W, 300 EXC, 300 XC-W, Hardenduro, Six Days | `d7e3510f4af1135f7870cbda5cca46108fec5d2950f364ba6b4c64a57251f44a` |
| 26_3240243_en_BA | 183 | 2026 450/500 EXC-F, 450 XCF-W, Six Days | `5cd8b2acc2cc53b35c287a0ca9709f250060ff9e4292835cc0be54ecb4fe7022` |
| 27_3240386_en_BA | 185 | 2027 125 XC-W, 150 XC-W | `c783ff0cfb4a635558517d17a79a04a00f1e10c13adc7b45ef5f88bc220493d6` |
| 27_3240387_en_BA | 198 | 2027 250 XC-W, 300 EXC, 300 XC-W, Hardenduro, Six Days | `793bfa3cf6f232bfd06f841e186f7208460e2370a712ebc75f3ff9e52b5e1e51` |
| 27_3240391_en_BA | 185 | 2027 450/500 EXC-F, 450 XCF-W, Six Days | `385ecb96fcf3ecedc2e55ea3afb4b599de9a8c8095e80d8d4b15a29978292779` |
| 20_3402338_en_OM | 167 | 2020 TE 150i | `4215d3cd404cc5696d2ee8646f49682e1fff1fc325546dc75896be4ed24a745e` |
| 20_3402407_en_OM | 169 | 2020 TE 250i, TE 300i, TE 300i Jarvis Edition | `c23505c11899ec1c1e756e978c3a9f74a56e0dd3bc34ab36e0a3e0785f8026d3` |
| 21_3402446_en_OM | 169 | 2021 TE 150i | `9d14b1dc1db7d92120c2df72699ae3ed79a17a7324c76fcead09f3afcba06113` |
| 21_3402448_en_OM | 171 | 2021 TE 250i, TE 300i, TE 300i Rockstar Edition | `9d17d631d57ed9d872b2bb674a9bce840abb94233d5b6a4f7921857f0d244524` |
| 22_3402537_en_OM | 169 | 2022 TE 150i | `a152276d26353408b3c91b85031437603401475be30cf0c150d8eecc58259d27` |
| 22_3402538_en_OM | 184 | 2022 TE 250i, TE 300i, TE 300i Rockstar Edition | `dfc9f6537a8d209b1035f1f1e68c9e67fd0ec7979295d9bdb5f6ebc9e81fd9f0` |
| 23_3402634_en_OM | 168 | 2023 TE 150 | `5dcc1143ea34c28cdb35241b597c79eeb92ee6046e4f30de382596f9fab67b6f` |
| 23_3402635_en_OM | 169 | 2023 TE 250, TE 300 | `179918f950ec303465b9b5702942e1f2d098f9ad2c8026080aaf0d577ee33228` |
| 23_3402639_en_OM | 168 | 2023 FE 450, FE 501 | `16bbe264a9bc54b8af779367c1b99104232ec588bc1afe23b8f3a98ecdb26b70` |
| 24_3402716_en_OM | 170 | 2024 TE 150 | `952b52ea1c748af8a70175bad244acab90497d0ba134092771eebdfd9787f3bd` |
| 24_3402717_en_OM | 183 | 2024 TE 250, TE 300, TE 300 PRO | `d3787c6f4725e77dc9a331fde19d780e130505b9c89ac0cfcde1eb622d5c4788` |
| 24_3402721_en_OM | 170 | 2024 FE 450, FE 501, FE 501w | `4e5570b91ea11e61d479482d0984c6c110bc88b2de6d90a2410ade38f30763c0` |
| 25_3402806_en_BA | 184 | 2025 TE 125, TE 150 | `28f9ab45a685d22d595f06236d589c3f699f1051a9bb2d0ecb66d5c75f1ab8ad` |
| 25_3402807_en_BA | 180 | 2025 TE 250, TE 300, Heritage, TE 300 PRO | `9fce4564d5a16194b2a3d3a87d0c7cfebab372e5059ea7937c932f0233e2bdc7` |
| 25_3402811_en_BA | 171 | 2025 FE 450, FE 501, Heritage | `b29d66d5fc04e622a3e9fedf3470f6208cb4044e12f91f3778ec35fe240e4fd2` |
| 26_3402892_en_BA | 183 | 2026 TE 125, TE 150 | `59dcac0e395166bf38619f4d6b0c019e17b248878d4271e8645b1e9828b1cdb5` |
| 26_3402893_en_BA | 198 | 2026 TE 250, TE 300, TE 300 PRO | `237eb994da06387e4aa76e8e0220b4873cab24f3ff03311ac4cbf2e4d6d7a500` |
| 26_3402897_en_BA | 183 | 2026 FE 450, FE 501 | `1d11af4b1f5bea890e0c0903b33ba0cadcf462081d7e793739b1943cc93bb516` |
| 27_3402950_en_BA | 192 | 2027 TE 125, TE 150 | `966d2d4f3c17c5999797e2fc80debc04a681c1ae5c50c93699fd381db8059104` |
| 27_3402951_en_BA | 200 | 2027 TE 250, TE 300, TE 300 PRO (only TE 300 is loaded; TE 250 2027 is outside the app's range) | `9da6d02867192a0daf544385d9d975d226edd647ac5c72066fe5a831d44d7690` |
| 21_3215011_en_OM | 162 | 2021 EC 250, EC 300 (US variant: EC 300 only) | `1bdb4a8d4527b9f2d70f86245f6a8543bec493e9040caa1023fac6b0f62630eb` |
| 22_3215056_en_OM | 162 | 2022 EC 250, EC 300 | `c15e223c526305501fcb5c32e0fa31c8ef42c4072d6e4b0cd4dc057ec095d0b7` |
| 23_3215102_en_OM | 163 | 2023 EC 250, EC 300 | `6b62b228f6d138ad4ead44ee1eb57f65c1bba63fda516af3d11f3bafe293fc45` |
| 24_3215163_en_OM | 158 | 2024 EC 250, EC 300 | `ac3ade13ce287d26e3af5bbef299a0757279f15db2f7a08f3f9a7c1bf0df9ac0` |
| 24_3215169_en_OM | 155 | 2024 EC 450F, EC 500F, EW 500F | `d8c1b695e722066e7679c1fb15ef02b9da83415c0d5eca4a94ca072641ba8cdf` |
| 25_3215225_en_BA | 176 | 2025 EC 250, EC 300 | `402dca6b2b9b38d348115b5fc6b428d0111eb61b150101dfbf6618616b0e5abb` |
| 25_3215229_en_BA | 168 | 2025 EC 450F, EC 500F | `f3a90c82527b02fbfae41ed78da843f032e6769e2ad0d37053cd804b7bc3fddb` |
| 26_3215271_en_BA | 184 | 2026 EC 300 | `6bdbcb106a15d16a383fa6aad6d421db640b305adf88c9d4bc7b0cdd35f3e038` |
| 27_3215292_en_BA | 184 | 2027 EC 300 | `e0e5b1503aaf49211a28b45598a46a505463b74032eef3df187731b4a880365f` |

## Bike-years still without a manual

| Bike-years | Why |
|---|---|
| Husqvarna FE 450 2020, 2021, 2022 | The US lookup lists only an EU manual (20_3402343, 21_3402453, 22_3402542). Each prints "FE 450 EU", "FE 501 EU" and "FE 501 US" as its variants: there is no US FE 450 in these years. Not added to the index. SHA-256 for the record: `0f34d6f46a4af9c1ccefca3b50557c4b1450a6f82c4c847a3a59669f96ac5886`, `50cccbe2505e1077c5e3d49ba962d1630f4d3604cffc004c56e16111ad489e95`, `7872213ef4726cd6065045d799f71ecba4b79706d0f5e0dd7364aefe77ecb36d`. |
| GasGas EC 250 2021 | 21_3215011 (loaded for EC 300 2021) prints "EC 250 EU", "EC 300 EU" and "EC 300 US": no US EC 250 that year. The index row for that document names EC 300 only. |

The app's year list (`shared/garage-models.ts`) offers these four bike-years; the manufacturer's own manuals say no US model existed.

## What was dropped, and why

Rules as before: a row is kept only if every printed validity note on its section, group and label matches the US standard model; a note that
looks like a validity note but is not understood drops its rows; a path printed with two values for one bike is dropped; a damper group is kept
only complete and only when the same triple appears in the adjustment section of the same manual; Factory, Six Days, Erzbergrodeo, Hardenduro,
Champion, Heritage, PRO and other special-edition rows are excluded.

### Validity notes the extractor could not read (rows dropped, fail closed)

- KTM EXC manuals print the XC-W notes with a non-breaking hyphen and spaces ("All XC ‑ W models", "150 XC ‑ W TPI US", "150 XC ‑ W US",
  "EXC ‑ F EU, XCF ‑ W", "All EXC ‑ F models"). `validity.py` folds "‑ F" but not "‑ W", so these rows were dropped. In practice this removed
  tires (front/rear) for the 250/300 XC-W and 450 XCF-W, and a few XC-W-only torques (pull-switch nut, side-stand screw).
- "All standard EXC/XC-W models, All ERZBERGRODEO …" on the 2020-2021 KTM 250/300 XC-W fork section: all fork rows (a).
- Fork sections split by special edition in the new layout (b): "All except HARDENDURO models", "all except PRO models",
  "All standard models except 250 US", "TE 300 PRO".
- Others seen, each dropping only its own rows: "TE 250 US/CN", "TE 300 EU/AR", "125 EU/ 150 US", "EW 500F US", "FE 501w US",
  "All except XW-F", "All EXC F models", "All EXC-EU models", "All BR-models", "All special models", "All HARDENDURO models".

Fixing these needs a change to `validity.py` (fold "‑ W" like "‑ F"; understand "/" between regions after a model; understand
"except HARDENDURO / PRO"). That was out of scope here; re-running the pipeline after such a change would recover the fork data for
KTM 250/300 XC-W 2020-2021 and 2026-2027 and Husqvarna TE 250/300 2025-2027.

### Printed two ways for one bike (90 path-drops over 69 bike-years)

- Electrical system / Fuse, all 2020-2023 manuals: two fuse rows share one label.
- Tires / Front tire and Rear tire on the multi-model manuals (KTM 250/300 XC-W 2020-2027, 450 XCF-W 2023-2024; Husqvarna TE 250/300 2026-2027;
  GasGas EC 250/300 2025): the standard and special-edition tire rows both reached the US model.
- Fork / Rebound damping (Comfort, Standard, Sport) on KTM 150 / 250 / 300 XC-W 2022 (c).
- KTM 250/300 XC-W 2027: Chassis torque "Screw, bottom triple clamp (M8)" and "Spoke nipple, front wheel (M4,5)".

### Damper groups withheld by the cross-check (21 groups)

Shock high-speed compression on EC 450F 2024, TE 250 / TE 300 2025, EC 300 2026-2027, KTM 250/300 XC-W 2026-2027, TE 250 / TE 300 2026,
FE 450 2026, TE 300 2027; shock low-speed compression and rebound on KTM 150 / 250 / 300 XC-W and 450 XCF-W 2024.

### Shape checks (106 rows flagged and not loaded)

Mostly new-layout torque rows whose newton-metre value sits on a different line from the label (the row came out with only the
"(0.7 ft ⋅ lb)" part), multi-stage cylinder-head torques, two "Weight without fuel" rows whose validity note runs into the label, the
Husqvarna FE 450 2025 brake-disc diameters (US and EU values printed inside one cell), and one empty-label schedule row in the
KTM 150 XC-W 2025 and TE 150 2025 manuals. Torque rows printed per variant inside one row ("VARIANT …" in the reports) and three to four
TE 150 2025-2027 torque values with no label ("NOLABEL") were not stored.

## Checks that were run

- Cover names the model and year (builder check) and page 3 lists a US variant for every bike loaded; every file matched the host's
  Content-Length before hashing.
- Damper cross-check (`check_dampers.py`) per document, then `finalize_payloads.py`; every payload's `want` hash was recomputed from its
  rows (69 of 69 match) and every payload's `sha` matches the hash of the downloaded document.
- Sibling check (scratch script, not part of the pipeline): every document was re-parsed treating the unreadable notes as applying, and each
  kept row was compared with any variant that fail-closed had removed. 11 bike-years showed such a variant; in every case the kept value is the
  standard US model's and the other is a special edition (Six Days / Erzbergrodeo brake-disc wear limit 3.7 mm and top steering stem 17 Nm on
  KTM 250/300 XC-W 2022-2024; Hardenduro fork part number on KTM 250/300 XC-W 2025; special-model weight 107.9 kg on GasGas EC 250/300 2025;
  TE 300 PRO fork on Husqvarna TE 250 2026, whose kept fork rows come from the section headed "TE 250 US"). Nothing was removed.

## What this review is not

Rows were machine-read from the document's text layer with the checks above. They were not each compared by eye against a rendered page.

## Second pass (validity fixes)

`validity.py` was changed after the first pass so that it understands "All standard EXC/XC-W models, All ERZBERGRODEO …",
"All except HARDENDURO models" / "All HARDENDURO models", "all except PRO models" / "all PRO models", "All standard models except 250 US" /
"TE 300 PRO", and KTM's "XC ‑ W" / "XCF ‑ W" spacing. The 27 affected manuals were downloaded again and re-read with the same pipeline:
every KTM 150 / 250 / 300 XC-W and 450 XCF-W manual of this pass (21) and the Husqvarna TE manuals for 2025-2027 (25_3402806, 25_3402807,
26_3402892, 26_3402893, 27_3402950, 27_3402951). Each file matched the host's Content-Length and the SHA-256 already recorded in `load/`
(27 of 27), and was deleted afterwards. Nothing else changed: `load/` and `stage/` are as they were.

| Path | What |
|---|---|
| `stage2/<document>/`, `stage2/<document>.report.json`, `stage2/<document>.dampers` | `build_from_index.py` and `check_dampers.py` output for the 27 manuals |
| `load2/<i>.json` | 24 replacement payloads, numbered like `load/<i>.json` for the same bike-year; full payload, same JSON shape, `want` recomputed as `finalize_payloads.py` does |
| `load2.summary.json` | index, bike, old n, new n, rows added by section |

### Rule for load2

Each new payload was compared row by row with `load/<i>.json` for the same bike-year (same document, same `sha`). A payload was written only
if every old row is still present with the same path and value, so a load2 payload only adds rows. Bike-years with no new rows were not
written (KTM 150 XC-W 2025-2027, 450 XCF-W 2025-2027, Husqvarna TE 150 2025-2027).

### What was recovered (194 rows over 24 bike-years)

| i | Bike-year | old n → new n | Added |
|---|---|---|---|
| 0, 6, 13, 21, 31 | KTM 150 XC-W 2020, 2021, 2022, 2023, 2024 | +2 each | Secondary ratio 13:50 ("150 XC‑W (TPI) US"), nut pull switch (0.4 Nm 2020-2021, 0.8 Nm 2022-2024) |
| 1, 2 | KTM 250 / 300 XC-W 2020 | 236 → 256 | Fork 14 (WP XPLOR 5348, 14.18.8T.63, compression and rebound 18/15/12 clicks, spring rates, length, oil); brake-disc wear limit 2.5 / 3.5 mm; top steering stem, top and bottom triple clamp; pull switch |
| 7, 8 | KTM 250 / 300 XC-W 2021 | 245 → 252 | Brake-disc wear limits, top steering stem, top and bottom triple clamp, pull switch 0.8 Nm, side-stand screw M8x26. No fork (see below) |
| 14, 15, 22, 23 | KTM 250 / 300 XC-W 2022, 2023 | +2 each | Pull switch 0.8 Nm, side-stand screw M8x26 33 Nm |
| 32, 33 | KTM 250 / 300 XC-W 2024 | 278 → 279 | Pull switch 0.8 Nm |
| 46, 47 | KTM 250 / 300 XC-W 2025 | 259 → 261 | Tires (front 80/100 - 21 M/C 51M M+S TT, rear 140/80 - 18 M/C 64M M+S TT, "All XC-W standard models and XC-W HARDENDURO") |
| 50, 51 | Husqvarna TE 250 / TE 300 2025 | 245 → 267 | Fork 15 (XACT, A390C163X402000, compression 17/15/7, rebound 19/17/9 clicks, spring rates, length, oil 175 / 390 ml, "all except PRO models"); transmission and gear ratios 7 |
| 55, 56 | KTM 250 / 300 XC-W 2026 | 240 → 256 | Fork 15 (WP XPLOR CC, A490C163Z402000, 17/15/7 and 19/17/9 clicks, oil 175 / 350 ml, "All except HARDENDURO models"); schedule "Carry out fork service" |
| 59 | Husqvarna TE 250 2026 | 268 → 271 | Tires ("All US models": 80/100 - 21 Dunlop GEOMAX AT82F, 110/100 - 18 AT82); weight without fuel 106.8 kg ("All AR and US models except TE PRO 300") |
| 60 | Husqvarna TE 300 2026 | 253 → 272 | Fork 15 (WP XACT CC, A390C163Z402000, "All standard models except 250 US"); tires and weight as TE 250; schedule "Carry out fork service" |
| 68 | Husqvarna TE 300 2027 | 252 → 270 | Fork 15 (as 2026); tires; weight 106.8 kg |

By section: Fork 118 (48 of them damper clicks), chassis torques 33, chassis 16, engine 14, tires 10, service schedule 3.

Checks: every new fork value was compared with the rendered text of its page; each comes from the section headed for the standard model
("22.7.1 All standard EXC/XC-W models, All ERZBERGRODEO"; "Technical data - fork (all except PRO models)"; "(All except HARDENDURO models)";
"(All standard models except 250 US)"), never from the Six Days, Hardenduro, PRO or "TE 250 US" sections printed next to it. `check_dampers.py`
confirmed every new fork compression and rebound triple in the adjustment section of the same manual; the groups it withholds are the same as in
the first pass (shock high-speed compression on TE 250 / TE 300 2025, KTM 250 / 300 XC-W 2026-2027, TE 250 / TE 300 2026, TE 300 2027), so those
stay out. The non-fork additions were also read against their pages (each carries an XC-W, US or standard-model note). Every load2 payload's
`want` was recomputed from its rows and its `sha` equals the one in `load/`.

### Not written to load2 (an old row would change)

- **KTM 450 XCF-W 2023 (i 24)** and **2024 (i 34)**: the first pass kept rows whose label still carried the unread note, e.g.
  "Chassis / Final drive (XCF ‑ W)". With the note now understood the same values come out without it ("Chassis / Final drive"), so the old
  path disappears. Values are unchanged. 2023: total fuel tank capacity 8.5 l, street tire pressure front 2.0 bar, intake air temperature
  sensor screw 2.7 Nm, final drive 14:48, weight without fuel 109.5 kg, schedule "Check the inlet membrane." and "Clean the spark arrestor."
  (7 paths renamed, nothing new). 2024: final drive 13:52, weight without fuel 107.4 kg, fuel vapor retention system lock screw 5 Nm
  (3 renamed) plus one new row (combination switch screw 2 Nm). Loading these would need the old paths removed or the loader told to
  replace them.
- **KTM 250 / 300 XC-W 2027 (i 64, 65)**: 15 fork rows recovered, but the old row "Chassis tightening torques / Screw-in nozzle, cooling system
  (M24x1.5)" = "7.5 Nm; (All except HARDENDURO models)" is no longer produced. The page (PDF 182) shows that the note belongs to the next row
  (Spoke nipple, front wheel), not to the nozzle; with the note now recognised the reader treats the block as per-variant and stores neither.
  The value already in `load/64.json` and `load/65.json` carries that stray note in its text; the nozzle torque itself is 7.5 Nm.

### Still missing

- **KTM 250 / 300 XC-W 2021 fork**: the 2021 manual (21_3214220, PDF 166) labels each fork row "(All Standard and Six Days models)", with a
  separate ERZBERGRODEO block. `validity.py` rejects the note because it names Six Days (and "Standard" is capitalised), so the standard fork
  (WP XPLOR 5548, 14.18.8T.64, 18/15/12 clicks) is still not loaded.
- **Tires** for KTM 250 / 300 XC-W 2020-2024 and 2026-2027 and 450 XCF-W 2023-2024 are still dropped as printed two ways for one bike.
  The tables carry readable notes ("All XC‑W models", "XCF‑W"), so this is the tire-table reader putting two rows on the bike, not a validity note.
- Fork rebound damping on KTM 150 / 250 / 300 XC-W 2022 (two values), fuse rows 2020-2023, the 2027 bottom triple clamp screw, and the shock
  damper groups listed above are unchanged from the first pass.
- Notes still not understood in these manuals, each dropping only its own rows: "All special models", "EXC ‑ F EU, XCF ‑ W" and other
  EXC-F / XW-F combinations (450 XCF-W 2023-2024), "All except XW-F", "All EXC F models", "All BR-models", "All EXC-EU models", "125 EU/ 150 US".

## Loaded (2026-11-06)

`load/` (69 payloads) and `load2/` (24 additive payloads) were loaded with `private.kg(make, model, yr, doc, sha, null, null, want, '', delta)`;
every payload matched its hash. 18,741 rows staged, all passing `public.evidence_approved`; 18,739 promoted to VERIFIED for the 69 bike-years.
Left STAGED on purpose: "Screw-in nozzle, cooling system (M24x1.5)" on KTM 250/300 XC-W 2027 (first-pass value carries the next row's
"All except HARDENDURO models" note; the torque itself is 7.5 Nm). Spot check through Ask BAK (KTM 300 XC-W 2026 suspension, Husqvarna
TE 150 2023 oil, GasGas EC 450F 2025 oil) answered from these rows.
