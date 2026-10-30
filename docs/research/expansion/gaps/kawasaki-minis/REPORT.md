# Kawasaki KX65 / KX85 / KX112 Front Fork and Rear Shock facts: text-layer pass, 2026-10-30

Folder: `docs/research/expansion/gaps/kawasaki-minis/`. Source: the US English owner's-manual e-books on Kawasaki's manual
server (`pws.ktivs.net`), text layer `search.xml` per e-book (the page images return 403). Official Kawasaki documents only.
Facts only; nothing beyond the extracted rows is stored. Downloaded files and working notes stayed in the session scratchpad.

## What was already on file

The brief expected 4-7 suspension facts per mini bike-year. The existing JSON in `docs/research/expansion/gaps/kawasaki/`
already carries 17-23 fork/shock rows per mini bike-year: the standard clicker positions and their usable ranges, standard
fork oil level and range (KX65: one level and range per spring), spring preload adjusting nut position and range, standard
fork height (KX85/KX112), standard fork air pressure (KX85/KX112 to 2025), spring rate standard and options, the
Specifications-chapter fork oil type and amount, and the fork oil part number (KX85 2020-2022, KX85 2026). This pass
therefore compared every joint against the existing file for the same bike-year and added only what was missing.
Bike-years whose e-book abbreviates the Specifications chapter (KX65 2026-2027, KX85 2026, KX112 2026) do not print
suspension travel or dimensions in the e-book; those live in the companion PDF already indexed separately.

## Method

1. One `search.xml` per e-book was downloaded with curl on 2026-10-30 (36 files: 17 mini e-books, 19 full-size e-books).
   SHA-256 of each file as downloaded is listed below; every hash equals the `source_document.sha256` recorded in the
   existing JSON for that e-book (47 bike-year files checked, 0 changed), so the text layers are unchanged since the earlier passes.
2. The text layer prints each page as one run of characters with the spaces removed and the table cells in layout order,
   so the Front Fork, Rear Shock, Specifications and Optional Parts pages were read page by page per manual, and for the
   manuals shared by two models (KX85C/KX100F 2020-2021, KX85C/KX112A 2023-2025, KX85E/KX85F 2026) the per-model column
   was followed as in `scripts/manual-textlayer/kawasaki_suspension.py` and `kawasaki/TEXTLAYER_RECHECK_2026-10-30.md`.
   No new row in this pass is model-column dependent: the added figures are printed once for the manual.
3. Each candidate row was checked by `tools/build_minis.py` (scratchpad): the whitespace-stripped value must be on the page
   named in its locator (verbatim), or every figure and unit token of the value must be on that page (figures; needed where
   the text layer drops a range dash, e.g. `295325mL(9.9711.0USoz.)`), plus an anchor phrase for short values
   (`has4positions`, `Belowthetopoftheoutertube`, `K=48(standard)N/mm`, `*K=0.27kgf/mm`, `...isatmospheric`).
   Every mm/in. and mL/US oz. pair was recomputed. A joint already on file for that bike-year is skipped.
4. `python3 docs/research/expansion/gaps/build_claims.py kawasaki-minis` from the repo root: `70 rows 0 skipped 0 duplicate
   joints dropped`, `16 documents` -> `claims_0.sql`, `doc_hashes.json`.

Row property: `setting` for every Front fork / Rear shock row (build_claims.py maps it to the `suspension` domain);
the two Specifications-chapter rows keep the existing convention (`specification` for the oil type, `capacity` for the amount).

## Rows per bike-year

| Bike-year | Rows | setting | specification | capacity | matched verbatim / by figures | File |
|---|---|---|---|---|---|---|
| KX65 2020 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2020.json |
| KX65 2021 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2021.json |
| KX65 2022 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2022.json |
| KX65 2023 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2023.json |
| KX65 2024 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2024.json |
| KX65 2025 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2025.json |
| KX65 2026 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2026.json |
| KX65 2027 | 6 | 6 | 0 | 0 | 3 / 3 | kawasaki-minis-kx65-2027.json |
| KX85 2020 | 2 | 0 | 1 | 1 | 1 / 1 | kawasaki-minis-kx85-2020.json |
| KX85 2021 | 2 | 0 | 1 | 1 | 1 / 1 | kawasaki-minis-kx85-2021.json |
| KX85 2022 | 0 | 0 | 0 | 0 | 0 / 0 | - |
| KX112 2022 | 2 | 2 | 0 | 0 | 1 / 1 | kawasaki-minis-kx112-2022.json |
| KX85 2023 | 2 | 2 | 0 | 0 | 1 / 1 | kawasaki-minis-kx85-2023.json |
| KX112 2023 | 2 | 2 | 0 | 0 | 1 / 1 | kawasaki-minis-kx112-2023.json |
| KX85 2024 | 2 | 2 | 0 | 0 | 2 / 0 | kawasaki-minis-kx85-2024.json |
| KX112 2024 | 2 | 2 | 0 | 0 | 2 / 0 | kawasaki-minis-kx112-2024.json |
| KX85 2025 | 2 | 2 | 0 | 0 | 2 / 0 | kawasaki-minis-kx85-2025.json |
| KX112 2025 | 2 | 2 | 0 | 0 | 2 / 0 | kawasaki-minis-kx112-2025.json |
| KX85 2026 | 1 | 1 | 0 | 0 | 1 / 0 | kawasaki-minis-kx85-2026.json |
| KX112 2026 | 3 | 3 | 0 | 0 | 3 / 0 | kawasaki-minis-kx112-2026.json |

Total: 70 rows, 19 files (KX85 2022 has nothing new: its manual prints no cylinder-unit oil amount and its oil part number is already on file).

Rows added:

- KX65 2020-2027 (6 each): Front fork / Standard fork height 20 mm (0.79 in.) below the top of the outer tube;
  Front fork / Rebound damping adjuster positions 4 (3 clicks out standard, 4 or more softest);
  Rear shock / Spring rate (standard) K = 48 N/mm; Rear shock / Spring rate options (N/mm) K = 44, 46, 48 (standard), 50;
  Front fork / Spring rate options (N/mm) K = 2.45, 2.55, 2.65, 2.75, 2.84; Front fork / Spring rate (standard) K = 0.27 kgf/mm.
- KX85 2020, 2021 (2 each): Specifications / Front fork oil / Type Kawasaki Fork Oil KHL15-10; Amount 295 ~ 325 mL (9.97 ~ 11.0 US oz.).
- KX112 2022, KX85/KX112 2023-2025 (2 each): Front fork / Fork oil amount, cylinder unit (standard) 310 mL (10.5 US oz.);
  Front fork / Suspension oil KHL15-10 (1 L): P/No. 44091-0004.
- KX85 2026 (1): Front fork / Standard air pressure: atmospheric (the 2026 e-book prints no kPa/psi figure).
- KX112 2026 (3): Standard air pressure atmospheric; Suspension oil 00M01 (1 L): P/No. 44091-0024;
  Fork oil amount, cylinder unit (standard) 494 mL (16.7 US oz.).

## Dropped or qualified values

- No value failed the page check or the unit-pair check; no figure is printed twice with different values for one bike.
- KX112 2022, KX85 2023, KX112 2023: the fork oil name in front of the part number reads `A15-10(1L):P/No.44091-0004` in the
  text layer of the oil-change page (manuals 99803-0213 p.120 and 99803-0304 p.122), while every other year prints
  `KHL15-10(1L):P/No.44091-0004`. The row for those three bike-years stores only what the page prints,
  `P/No. 44091-0004 (1 L)`, and its conditions say the name is garbled on that page and that the Specifications chapter
  of the same manual names Kawasaki Fork Oil KHL15-10 (already on file).
- KX65 Front fork / Spring rate (standard) K = 0.27 kgf/mm comes from the Optional Parts table, where the text layer puts the
  "standard equipment" asterisk in front of the standard cell (`K=0.26kgf/mm*K=0.27kgf/mm`). The prefix reading is
  confirmed on the same page by the main jet (`180*190`, and the carburetor chapter prints #190 as standard) and by the rear
  spring (`*K=4.9kgf/mm`, and the preload page prints K = 48 (standard) N/mm = 4.9 kgf/mm); 0.27 kgf/mm = 2.65 N/mm, the
  spring whose standard oil level in the fork oil level table (132 mm) is the level the Specifications chapter gives.
- KX65 fork rebound adjuster "4 positions": the manual hedges with "depending on the model" in both sentences; the row
  quotes the wording in its conditions.
- Not recorded (procedure text, not a setting): "make the fork height adjustment in 10 mm steps", "fork oil level affects
  the final 100 mm of travel", "the compression damping adjuster has at least 20 positions" (same fact as the usable range on file).
- Not printed for the minis, so not recorded: spring free length / set length, preload expressed as spring length, sag or
  ride height, fork oil amount per leg in the fork chapter of KX85 2020-2022 (that manual fills to the top of the inner tube
  and sets the level; the amount is in Specifications only), and a usable range for the KX65 rear rebound adjuster.

## Sag / ride height on the full-size bikes

The text layers of all 19 KX250 / KX250X / KX450 / KX450X e-books 2020-2027 (and all 17 mini e-books) were searched for
"sag", "static sag", "race sag", "free sag", "ride height", "rear suspension setting", "spring set length", "spring free
length", "installed length" and "preload length": 0 hits (the only "sag" strings are inside "passage" and "gasoline").
Kawasaki does not print a sag or ride-height figure in these owner's manuals; rear spring preload is specified only as
the adjusting nut position measured from the center of the upper rear shock absorber pivot (standard and adjustable range
per spring), and those rows are already on file for every bike-year. Nothing to add.

## Spot-checks (text-layer fragment as printed, spaces removed by the layer)

KX65
- 2025 e-book page 95: `StandardForkHeight ... 20mm(0.79in.)* *Belowthetopoftheoutertube.` -> Front fork / Standard fork height 20 mm (0.79 in.).
- 2025 e-book page 98: `RearShockAbsorberSpring K=48(standard)N/mm K=44N/mm ... K=46N/mm K=50N/mm` -> Rear shock / Spring rate (standard) K = 48 N/mm and the N/mm options row.
- 2020 e-book page 91: `Dependingonthemodel,theforkrebounddampingadjusterhas4positions ... 3clickscounter-clockwise ... isthestandardsetting, turningitout4ormoreclicks` -> Front fork / Rebound damping adjuster positions 4.
- 2027 e-book page 132: `*:Standardequipment K=0.25kgf/mm K=0.26kgf/mm *K=0.27kgf/mm K=0.28kgf/mm K=0.29kgf/mm` -> Front fork / Spring rate (standard) K = 0.27 kgf/mm.

KX85
- 2020 e-book page 17: `FrontForkOil:TypeAmount ... KawasakiForkOilKHL15-10 295325mL(9.9711.0USoz.)` -> Specifications / Front fork oil / Type and Amount (range dash dropped by the layer; 9.97 US oz = 294.8 mL, 11.0 US oz = 325.3 mL).
- 2025 e-book page 126: `SuspensionOil ... StandardForkOilAmount(CylinderUnit) ... KHL15-10(1L):P/No.44091-0004 310mL(10.5USoz.)` (page 125: `pour310mL(10.5USoz.)offorkoil`) -> Fork oil amount, cylinder unit (standard) 310 mL (10.5 US oz.); Suspension oil KHL15-10 (1 L): P/No. 44091-0004.
- 2026 e-book page 107: `Thestandardairpressureinthefrontforklegsisatmospheric.` -> Front fork / Standard air pressure: atmospheric.

KX112
- 2022 e-book page 120: `pour310mL(10.5USoz.)offorkoil ... StandardForkOilAmount(CylinderUnit) ... A15-10(1L):P/No.44091-0004 310mL(10.5USoz.)` -> cylinder-unit amount 310 mL; Suspension oil stored as P/No. 44091-0004 (1 L) with the garbled-name note.
- 2024 e-book page 121: `SuspensionOil StandardForkOilAmount(CylinderUnit) ... KHL15-10(1L):P/No.44091-0004 310mL(10.5USoz.)` -> both rows.
- 2026 e-book page 115: `SuspensionOil 00M01(1L):P/No.44091-0024 StandardForkOilAmount(CylinderUnit) 494mL(16.7USoz.)` (also `pour494mL(16.7USoz.)`) -> Suspension oil 00M01 (1 L): P/No. 44091-0024; cylinder-unit amount 494 mL (16.7 US oz.) (494 mL = 16.70 US oz).

## Files

- `kawasaki-minis-<model>-<year>.json` (19 files, listed above), `claims_0.sql` (70 inserts), `doc_hashes.json` (16 e-books), this `REPORT.md`.
- Scratchpad only (not in the repo): the 36 `search.xml` downloads, `tools/pages.py`, `tools/scan.py`, `tools/build_minis.py`, `work/report.json`.

## SHA-256 of each text layer as downloaded on 2026-10-30

| E-book key | SHA-256 |
|---|---|
| 99803-0029-o5kx85clf-us-en-222d7e05d96b94e6505a578540228c64 | b8e12be9f523cd15840af5b926ff31e218d35a01aad89ad07ba38bdaec5fe70b |
| 99803-0030-o5kx65alf-us-en-960aa4d53e2693a7630518c0ac310e89 | 2dd965f3039d243b61b4c23c2328f7cbd2a92d2abc49503ee56ec4ae04100ceb |
| 99803-0044-o5kx450jlf-us-en-764600b8626ae5f824b103b6c7273a8a | b8db1d96f4a002419f75a9209cbdd68092fa72c0fd4019a5b50a583238cff505 |
| 99803-0080-o5kx252blf-us-en-fa9242e822da87d12cf802e076f3ac17 | 1679fe2921c9f692057e3316a83d4cf41a1693062d3f586986cd108f3f0e21c5 |
| 99803-0128-o5kx85cmf-us-en-c60f8057b858c4f976f737b319d94bf7 | 6c04ee5abcbd5f7016c8cce48a5ed8974b5c2cfb1b3b72307389e98a15553f25 |
| 99803-0129-o5kx65cmf-us-en-513871a8cb8b04fa0e68b05b1f90d939 | 7df269f2b9476856d64db5abd32c4caabce5410572f1e493682150bca3031f43 |
| 99803-0181-o5kx450jmf-us-en-7847af2cc9988937002c7d5d436f18c6 | 95f94839cc269feda3d0e1a4e3d844b7754a3984c5b16d1b60f2879a4ad7eedf |
| 99803-0182-o5kx450kmf-us-en-e98b8b5fdd3679694533728ebef10750 | 7fc3ba313a612189affbc5ebe6910511ed5d7858e094073ddf35bfb91836ef31 |
| 99803-0183-o5kx252cmf-us-en-9f3956e8048e6b4fb570e871cb92760a | 813efd46796a0b869ccc6d5d9b6f7c45c3548be9e7c58f3b028ca1ca4bf522af |
| 99803-0184-o5kx252dmf-us-en-a8e3e9ea015c40df3686836822f81fe5 | d55cc2ebb3cb2d4fd8892cf0b27488f35a55d8b8c7f98b7465311eff900c68ed |
| 99803-0213-o5kx112anf-us-en-44e2150fc06874304a16d8cfa1d65a56 | 30b024b0830e17f8bab762ed782033a87ce0314f96e0abf4abd56522c7b6971e |
| 99803-0214-o5kx252cnf-us-en-1f842dd3f7b9d9d58f17b1e64543da8e | 87e083300d9d421ff20ae8b05d15aa9b6bddc6f5293d467d72fc6ddd16a9d3ec |
| 99803-0216-o5kx450jnf-us-en-6ca0e63b67a4ea3460f89e65b1319bf5 | fa741cc208d88f6ab0a5d43fea7a1cd77cb8f333ccb44974df28b723ddeb4be7 |
| 99803-0217-o5kx85cnf-us-en-ef42670916fcf39c6b767ee7b4f9952b | fd0c0610a8643082394e16b8595e72bb915debed272b50b9c77f128a1127a5ad |
| 99803-0218-o5kx65cnf-us-en-0b5517d9572dc5021b1abfaf5c59c08c | 01c3868888305ba77d7e0187c8862705084676bf691f5e3cf523b6388ad62384 |
| 99803-0303-o5kx65cpf-us-en-a375a122299c7de54b88dd2cd6579284 | 4794ea38dc355b7e61aafd9a3bf461da7f8b589b280452e515f8810f27dd7864 |
| 99803-0304-o5kx85cpf-us-en-321638c3053159040e760ab5da539c86 | 1ba467a5d2ae6d7dc4b626a25d1f5607927ef81a1af2f829bbe1dd1b8a89326f |
| 99803-0306-o5kx252cpf-us-en-f4f3c05d8cb1cd1f14326ae7a3dc9206 | e1a99ffc9760f58e69856f78b8ffec82b0791549954114b58e8d170047a01839 |
| 99803-0308-o5kx450jpf-us-en-18a2b04b9abfef8f89a978d68ebbb307 | 4690a8ed6a1ba2d641fc29c40e736c24a4d00d5b9f3da88458b0ae78b4734db8 |
| 99803-0398-o5kx65crf-us-en-2a6600856678443bc703ceed3b2a50ee | 740509a4ca24afda613bd957843a8ec3a5d37103b220fbc36511779e00cf7fc4 |
| 99803-0399-o5kx85crf-us-en-500aa56a345979ea5fcb69d6095420d5 | 2754c865821a7a84c2a2f5f25ee129fc8d37efae6fd73fdb81fedff43b6a837e |
| 99803-0400-o5kx252crf-us-en-6b10c4b8178fa8aadd9de6768a329cd0 | e9e4ac7ea9c0a27685eb1a6e72244cd6c9f3823c2c1b08caf03f6d0262d29c4b |
| 99803-0401-01-o5kx450mrf-us-en_ebook-90735d052ae7d6b4d2c139d437d61f74 | 2b87ee93eee425de8fbd3cd348cbfbbcf9cd8594df7d4a56f7c9694f7a3790cd |
| 99803-0402-01-o5kx450nrf-us-en_ebook-6a426975919dd9f878c373b2b69de7d0 | 67781e2044e4d4dafa51067a72d4b18f092a7c71c3ead7b9c6f5313159106db7 |
| 99814-0003-o5kx450msf-us-en_ebook-e1cdd78aa5d28e4144984271960ae3b9 | 5e387d214ca53e30761b2627f547e0ecb96b1b576fafd31fe67fa2fb0dcd98a0 |
| 99814-0012-o5kx65csf-us-en_ebook-1e99c082fa3f56e5749648ce67cfa8c5 | 269cbdd04683d15334b5d0ba7d1d34c90a1a2d03e1c8baee9b5cbb9150ef3618 |
| 99814-0013-o5kx85csf-us-en_ebook-a353d7c171c64e496761520e2bcbb207 | 15acc84d40000f78b3801270494acc4ae818c63d578c2ef94516fa32b74da946 |
| 99814-0061-o5kx252esf-us-en_ebook-1caab68fb1b6f0bd0aca70be564f27dd | 319698290d6d96ccd6bb773c1c87f6e616f0852a7ca9d46194ace5cda03ea25a |
| 99814-0062-o5kx252fsf-us-en_ebook-8e66f350de0103dd0475cddc0919b277 | bb6a1f14e5ee1e78f67f4ccc9f5cf99fc7565029907ba0f85e7bcd7c825fa3f4 |
| 99814-0119-o5kx252etf-us-en_ebook-a3ebacd81de28a08cad622f50579814b | 1e25c0d1278b348f3960360a12bc8533beeb04c35e149de432e773ec05df552b |
| 99814-0120-o5kx65ctf-us-en_ebook-ee323f770cc3ac85467d16a1d30995d2 | 7cffeb3ad2f718aa75b844d80b29ecb8cbc1c76eb73a76753d8ee509431b7153 |
| 99814-0121-o5kx450mtf-us-en_ebook-cc6574ed9226ee3c6838ff7eaa4cf343 | a95b0fb31643056fa65ed28d6867a8fe09b2d6e540ab2852839238667e041949 |
| 99814-0181-o5kx112btf-us-en_ebook-2dc4140bc3e7c4a0813614aec6ad0a17 | ae4b7addf1700dc01a7f629b124299ae86d02371cbea0bb5cffcc3efb0530dc0 |
| 99814-0182-o5kx85etf-us-en_ebook-890ee7783884019f4355edd47cccbd6f | be7f93abc3bc885f0c3da2c3d8267d3be5d0e3971be503a697f80433f5f940cb |
| 99814-0231-o5kx65cv-us-en_ebook-6b968ac1054914bb04f3d9462ae0a092 | 433c3323c902f1d3ded6eee496c66d7f55dcdcb7833e4877e4ef658401acc8fd |
| 99814-0239-o5kx252ev-us-en_ebook-cff9f6602a496d838d485829a9158b6b | 2b81e8b7da646e527ef3bf74e086bc2e1f96c5ccf3a8c6ef687889e9bbbec97e |
