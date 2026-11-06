# KTM, Husqvarna and GasGas routine maintenance guides: check log

Guides: `ktm-group-maintenance-4t.json` (four-strokes) and `ktm-group-maintenance-2t.json` (two-strokes), written 2026-11-06.

Source documents are the English owner's manuals listed in `docs/research/manual-index/ktm-group-us.tsv`; the document id in each row below is the file name at `https://azwecdnepstoragewebsiteuploads.azureedge.net/<document>.pdf`. Page numbers are the **printed** page numbers of that document (not the PDF page index).

## How the values were taken

- Each manual was read with pdftotext (layout mode). Every value was taken from the section that gives the procedure (or from the technical-data chapter for capacities and suspension settings) of that exact manual.
- Validity notes were applied the way `scripts/manual-textlayer/validity.py` does: a block marked for another model, the EU model or a special/Factory/Heritage/Rockstar/Prado/Troy Lee edition was dropped; fork and shock data were taken from the sub-section that names the US standard model (or the model itself when the manual covers one model). Inline notes on a value (for example a rider sag printed per model) were applied the same way.
- A bike-year is only covered when its manual cover lists that model as US or with no region.
- Service intervals come from the service schedule table of the same manual; each mark was matched to its column header.
- Bike-years were grouped into one guide only when every value and every step rendered identically; otherwise they are separate guides. Imperial figures are shown only where the manual prints them (trailing zeros normalised, e.g. 2.40 in = 2.4 in).
- No value was invented. Where a manual does not give a value, the step says what to check without a number, or the step is left out (listed below).

## Not written or not confirmed

- **Spark plug:** none of the owner's manuals (four-stroke or two-stroke) gives a spark plug procedure or gap; the four-stroke schedules only list spark plug replacement as an interval. No spark plug guide was written.
- **Bike-years with no US manual:** the manual cover lists the model only for another region (EU, or Factory Edition only), so no guide was written:
  - GasGas MC 250F 2021 (`21_3215009_en_OM`)
  - GasGas MC 250F 2022 (`22_3215053_en_OM`)
  - GasGas MC 350F 2022 (`22_3215054_en_OM`)
  - Husqvarna FC 250 2026 (`26_3402884_en_BA`)
  - Husqvarna FC 450 2026 (`26_3402886_en_BA`)
  - KTM 125 SX 2023 (`23_3214638_en_OM`)
  - KTM 125 SX 2024 (`24_3214832_en_OM`)
  - KTM 125 SX 2025 (`25_3240041_en_OM`)
  - KTM 150 SX 2025 (`25_3240041_en_OM`)
- **Clutch fluid level:** KTM 85 SX 17/14 and 19/16 (all years): the manual has no clutch fluid level procedure, so there is no clutch guide for them.
- **Chain wear length:** the BA-format manuals (KTM four-strokes 2026-2027, Husqvarna and GasGas four-strokes 2025-2027, and the BA-format two-stroke manuals) print the maximum length but not the number of rollers to measure over, so the stretch measurement step is left out for those bike-years; the visual wear, slider and guide checks remain.
- **Front brake lever free travel:** not given for Husqvarna FX 350 / FX 450 2020-2021 and Husqvarna TX 300 2020-2022; that step is left out.
- **Fork air pressure:** KTM 125 XC 2024-2025 print an air pressure in the fork data but have no air-pressure procedure for the XC, so no air step was written for them. For Husqvarna FC 250 / FC 350 / TC 125 / TC 150 / TC 250 / TC 300 2025, GasGas MC 125 / MC 250 2025 and KTM 85 SX 2020, 2021 and 2025 the fork data table has no air pressure; the value was taken from the air-pressure procedure of the same manual (marked in the tables).
- **Conflicting printed values:** KTM 125 SX / 150 SX 2020: fork air pressure 8.4 bar in the fork data, 8.3 bar in the adjustment procedure; the guide gives both as a range. GasGas MC 450F / EX 450F 2021 print 1.0 l (1.1 qt) of engine oil in both the procedure and the capacities table, while the KTM and Husqvarna 450s of the same years and the 2022+ GasGas 450s print 1.2 l; the printed 1.0 l was used and should be confirmed before release.
- **Magnetic oil drain plug torque missing from the oil-change text:** Husqvarna FC 250 2025 and 2027, FC 350 / FX 350 2025, GasGas MC 250F / EX 250F 2025. The 20 N·m was taken from the engine tightening-torque table of the same manual (marked in the tables).
- **Text layer:** values were read from the PDF text layer, not compared by eye with each rendered page. Two-column layout sometimes interleaves lines; every value was located with its label, but a visual spot check of the BA-format manuals is still advisable.

## Values per job and group: four-strokes

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex250f-2021-2023-and-more-36a5787b`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 350F 2023, GasGas EX 350F 2023, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3214129_en_OM p. 34; 21_3214213_en_OM p. 34; 22_3214414_en_OM p. 34; 20_3214004_en_OM p. 34; 21_3214215_en_OM p. 35; 22_3214417_en_OM p. 35; 23_3215097_en_OM p. 30; 23_3215099_en_OM p. 30; 20_3402335_en_OM p. 33; 21_3402442_en_OM p. 33; 22_3402532_en_OM p. 34; 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 22_3402534_en_OM p. 35; 21_3215009_en_OM p. 30; 22_3215053_en_OM p. 30; 22_3215054_en_OM p. 30; 21_3215019_en_OM p. 29 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 20_3214129_en_OM p. 136; 21_3214213_en_OM p. 139; 22_3214414_en_OM p. 131; 20_3214004_en_OM p. 130; 21_3214215_en_OM p. 139; 22_3214417_en_OM p. 140; 23_3215097_en_OM p. 123; 23_3215099_en_OM p. 124; 20_3402335_en_OM p. 128; 21_3402442_en_OM p. 130; 22_3402532_en_OM p. 132; 20_3402336_en_OM p. 140; 21_3402443_en_OM p. 142; 22_3402534_en_OM p. 137; 21_3215009_en_OM p. 124; 22_3215053_en_OM p. 124; 22_3215054_en_OM p. 124; 21_3215019_en_OM p. 119 |
| Engine oil viscosity | SAE 10W/50 | 20_3214129_en_OM p. 123; 21_3214213_en_OM p. 126; 22_3214414_en_OM p. 118; 20_3214004_en_OM p. 117; 21_3214215_en_OM p. 126; 22_3214417_en_OM p. 127; 23_3215097_en_OM p. 111; 23_3215099_en_OM p. 112; 20_3402335_en_OM p. 115; 21_3402442_en_OM p. 117; 22_3402532_en_OM p. 119; 20_3402336_en_OM p. 127; 21_3402443_en_OM p. 129; 22_3402534_en_OM p. 124; 21_3215009_en_OM p. 111; 22_3215053_en_OM p. 111; 22_3215054_en_OM p. 111; 21_3215019_en_OM p. 106 |
| Engine oil standard | JASO T903 MA2 | 20_3214129_en_OM p. 143; 21_3214213_en_OM p. 148; 22_3214414_en_OM p. 139; 20_3214004_en_OM p. 137; 21_3214215_en_OM p. 147; 22_3214417_en_OM p. 148; 23_3215097_en_OM p. 129; 23_3215099_en_OM p. 130; 20_3402335_en_OM p. 133; 21_3402442_en_OM p. 136; 22_3402532_en_OM p. 138; 20_3402336_en_OM p. 146; 21_3402443_en_OM p. 149; 22_3402534_en_OM p. 144; 21_3215009_en_OM p. 130; 22_3215053_en_OM p. 130; 22_3215054_en_OM p. 130; 21_3215019_en_OM p. 124 |
| Engine oil type | fully synthetic | 20_3214129_en_OM p. 143; 21_3214213_en_OM p. 148; 22_3214414_en_OM p. 139; 20_3214004_en_OM p. 137; 21_3214215_en_OM p. 147; 22_3214417_en_OM p. 148; 23_3215097_en_OM p. 129; 23_3215099_en_OM p. 130; 20_3402335_en_OM p. 133; 21_3402442_en_OM p. 136; 22_3402532_en_OM p. 138; 20_3402336_en_OM p. 146; 21_3402443_en_OM p. 149; 22_3402534_en_OM p. 144; 21_3215009_en_OM p. 130; 22_3215053_en_OM p. 130; 22_3215054_en_OM p. 130; 21_3215019_en_OM p. 124 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 20_3214129_en_OM p. 122; 21_3214213_en_OM p. 125; 22_3214414_en_OM p. 117; 20_3214004_en_OM p. 116; 21_3214215_en_OM p. 125; 22_3214417_en_OM p. 126; 23_3215097_en_OM p. 110; 23_3215099_en_OM p. 111; 20_3402335_en_OM p. 114; 21_3402442_en_OM p. 116; 22_3402532_en_OM p. 119; 20_3402336_en_OM p. 126; 21_3402443_en_OM p. 128; 22_3402534_en_OM p. 123; 21_3215009_en_OM p. 110; 22_3215053_en_OM p. 110; 22_3215054_en_OM p. 110; 21_3215019_en_OM p. 105 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 20_3214129_en_OM p. 122; 21_3214213_en_OM p. 125; 22_3214414_en_OM p. 117; 20_3214004_en_OM p. 116; 21_3214215_en_OM p. 125; 22_3214417_en_OM p. 126; 23_3215097_en_OM p. 110; 23_3215099_en_OM p. 111; 20_3402335_en_OM p. 114; 21_3402442_en_OM p. 116; 22_3402532_en_OM p. 119; 20_3402336_en_OM p. 126; 21_3402443_en_OM p. 128; 22_3402534_en_OM p. 123; 21_3215009_en_OM p. 110; 22_3215053_en_OM p. 110; 22_3215054_en_OM p. 110; 21_3215019_en_OM p. 105 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 20_3214129_en_OM p. 123; 21_3214213_en_OM p. 126; 22_3214414_en_OM p. 118; 20_3214004_en_OM p. 117; 21_3214215_en_OM p. 126; 22_3214417_en_OM p. 127; 23_3215097_en_OM p. 110; 23_3215099_en_OM p. 111; 20_3402335_en_OM p. 115; 21_3402442_en_OM p. 117; 22_3402532_en_OM p. 119; 20_3402336_en_OM p. 127; 21_3402443_en_OM p. 129; 22_3402534_en_OM p. 124; 21_3215009_en_OM p. 111; 22_3215053_en_OM p. 111; 22_3215054_en_OM p. 111; 21_3215019_en_OM p. 106 |
| Wait before reading the level (warm engine) | 1 minute | 20_3214129_en_OM p. 121; 21_3214213_en_OM p. 124; 22_3214414_en_OM p. 116; 20_3214004_en_OM p. 115; 21_3214215_en_OM p. 124; 22_3214417_en_OM p. 125; 23_3215097_en_OM p. 108; 23_3215099_en_OM p. 109; 20_3402335_en_OM p. 113; 21_3402442_en_OM p. 115; 22_3402532_en_OM p. 117; 20_3402336_en_OM p. 125; 21_3402443_en_OM p. 127; 22_3402534_en_OM p. 122; 21_3215009_en_OM p. 109; 22_3215053_en_OM p. 109; 22_3215054_en_OM p. 109; 21_3215019_en_OM p. 104 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex350f-2024-mc350f-2024-fc250-2023-fc350-2023-2024-250sxf-2023-250xcf-2023-350sxf-2023`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 350 SX-F 2023, Husqvarna FC 250 2023, Husqvarna FC 350 2023, Husqvarna FC 350 2024, GasGas MC 350F 2024, GasGas EX 350F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214640_en_OM p. 34; 23_3214641_en_OM p. 36; 23_3402631_en_OM p. 34; 23_3402632_en_OM p. 35; 24_3402714_en_OM p. 35; 24_3215161_en_OM p. 30 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 23_3214640_en_OM p. 132; 23_3214641_en_OM p. 142; 23_3402631_en_OM p. 134; 23_3402632_en_OM p. 137; 24_3402714_en_OM p. 137; 24_3215161_en_OM p. 128 |
| Engine oil viscosity | SAE 10W/50 | 23_3214640_en_OM p. 119; 23_3214641_en_OM p. 129; 23_3402631_en_OM p. 121; 23_3402632_en_OM p. 124; 24_3402714_en_OM p. 124; 24_3215161_en_OM p. 115 |
| Engine oil standard | JASO T903 MA2 | 23_3214640_en_OM p. 140; 23_3214641_en_OM p. 150; 23_3402631_en_OM p. 141; 23_3402632_en_OM p. 145; 24_3402714_en_OM p. 146; 24_3215161_en_OM p. 135 |
| Engine oil type | fully synthetic | 23_3214640_en_OM p. 140; 23_3214641_en_OM p. 150; 23_3402631_en_OM p. 141; 23_3402632_en_OM p. 145; 24_3402714_en_OM p. 146; 24_3215161_en_OM p. 135 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 23_3214640_en_OM p. 118, 119; 23_3214641_en_OM p. 128, 129; 23_3402631_en_OM p. 120, 121; 23_3402632_en_OM p. 123, 124; 24_3402714_en_OM p. 123, 124; 24_3215161_en_OM p. 114 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3214640_en_OM p. 118; 23_3214641_en_OM p. 129; 23_3402631_en_OM p. 121; 23_3402632_en_OM p. 124; 24_3402714_en_OM p. 124; 24_3215161_en_OM p. 114 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 23_3214640_en_OM p. 119; 23_3214641_en_OM p. 129; 23_3402631_en_OM p. 121; 23_3402632_en_OM p. 124; 24_3402714_en_OM p. 124; 24_3215161_en_OM p. 115 |
| Wait before reading the level (warm engine) | 1 minute | 23_3214640_en_OM p. 117; 23_3214641_en_OM p. 127; 23_3402631_en_OM p. 119; 23_3402632_en_OM p. 122; 24_3402714_en_OM p. 122; 24_3215161_en_OM p. 113 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex250f-2024-mc250f-2024-fc250-2024-250sxf-2024-2025-250xcf-2025-350sxf-2024-2025`

Bikes: KTM 250 SX-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2024, KTM 350 SX-F 2025, Husqvarna FC 250 2024, GasGas MC 250F 2024, GasGas EX 250F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3214834_en_OM p. 39; 25_3240043_en_OM p. 38; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37; 24_3402713_en_OM p. 35; 24_3215160_en_OM p. 35 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 24_3214834_en_OM p. 150; 25_3240043_en_OM p. 146; 24_3214835_en_OM p. 146; 25_3240044_en_OM p. 146; 24_3402713_en_OM p. 143; 24_3215160_en_OM p. 144 |
| Engine oil viscosity | SAE 10W/50 | 24_3214834_en_OM p. 136; 25_3240043_en_OM p. 132; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133; 24_3402713_en_OM p. 129; 24_3215160_en_OM p. 130 |
| Engine oil standard | JASO T903 MA2 | 24_3214834_en_OM p. 161; 25_3240043_en_OM p. 156; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154; 24_3402713_en_OM p. 153; 24_3215160_en_OM p. 154 |
| Engine oil type | fully synthetic | 24_3214834_en_OM p. 161; 25_3240043_en_OM p. 156; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154; 24_3402713_en_OM p. 153; 24_3215160_en_OM p. 154 |
| Torque, screw plug (M14) | 15 N·m (11.1 lbf·ft) | 24_3214834_en_OM p. 135; 25_3240043_en_OM p. 131; 24_3214835_en_OM p. 132; 25_3240044_en_OM p. 132; 24_3402713_en_OM p. 128; 24_3215160_en_OM p. 129 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 24_3214834_en_OM p. 135; 25_3240043_en_OM p. 131; 24_3214835_en_OM p. 132; 25_3240044_en_OM p. 132; 24_3402713_en_OM p. 129; 24_3215160_en_OM p. 129 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 24_3214834_en_OM p. 136; 25_3240043_en_OM p. 132; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133; 24_3402713_en_OM p. 129; 24_3215160_en_OM p. 129 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 24_3214834_en_OM p. 136; 25_3240043_en_OM p. 132; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133; 24_3402713_en_OM p. 129; 24_3215160_en_OM p. 130 |
| Wait before reading the level (warm engine) | 1 minute | 24_3214834_en_OM p. 134; 25_3240043_en_OM p. 130; 24_3214835_en_OM p. 131; 25_3240044_en_OM p. 131; 24_3402713_en_OM p. 127; 24_3215160_en_OM p. 128 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-250xcf-2024-350xcf-2024-2025`

Bikes: KTM 250 XC-F 2024, KTM 350 XC-F 2024, KTM 350 XC-F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3214834_en_OM p. 39; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 24_3214834_en_OM p. 150; 24_3214835_en_OM p. 146; 25_3240044_en_OM p. 146 |
| Engine oil viscosity | SAE 10W/50 | 24_3214834_en_OM p. 136; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133 |
| Engine oil standard | JASO T903 MA2 | 24_3214834_en_OM p. 161; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154 |
| Engine oil type | fully synthetic | 24_3214834_en_OM p. 161; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154 |
| Guard to remove first | engine guard | 24_3214834_en_OM p. 135; 24_3214835_en_OM p. 132; 25_3240044_en_OM p. 132 |
| Torque, screw plug (M14) | 15 N·m (11.1 lbf·ft) | 24_3214834_en_OM p. 135; 24_3214835_en_OM p. 132; 25_3240044_en_OM p. 132 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 24_3214834_en_OM p. 135; 24_3214835_en_OM p. 132; 25_3240044_en_OM p. 132 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 24_3214834_en_OM p. 136; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 24_3214834_en_OM p. 136; 24_3214835_en_OM p. 133; 25_3240044_en_OM p. 133 |
| Wait before reading the level (warm engine) | 1 minute | 24_3214834_en_OM p. 134; 24_3214835_en_OM p. 131; 25_3240044_en_OM p. 131 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex350f-2025-and-more-9691f064`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, Husqvarna FC 350 2027, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240234_en_BA p. 43; 27_3240381_en_BA p. 42; 26_3240235_en_BA p. 42; 27_3240383_en_BA p. 41; 27_3402947_en_BA p. 41; 26_3215268_en_BA p. 31; 27_3215290_en_BA p. 31; 25_3215222_en_BA p. 34 |
| Engine oil quantity | 1.0 l (0.26 US gal) | 26_3240234_en_BA p. 167; 27_3240381_en_BA p. 152; 26_3240235_en_BA p. 157; 27_3240383_en_BA p. 150; 27_3402947_en_BA p. 152; 26_3215268_en_BA p. 134; 27_3215290_en_BA p. 136; 25_3215222_en_BA p. 134 |
| Engine oil viscosity | SAE 10W/50 | 26_3240234_en_BA p. 155; 27_3240381_en_BA p. 140; 26_3240235_en_BA p. 145; 27_3240383_en_BA p. 138; 27_3402947_en_BA p. 140; 26_3215268_en_BA p. 122; 27_3215290_en_BA p. 124; 25_3215222_en_BA p. 125 |
| Engine oil type | fully synthetic | 26_3240234_en_BA p. 155; 27_3240381_en_BA p. 140; 26_3240235_en_BA p. 145; 27_3240383_en_BA p. 138; 27_3402947_en_BA p. 140; 26_3215268_en_BA p. 122; 27_3215290_en_BA p. 124; 25_3215222_en_BA p. 125 |
| Torque, screw plug (M14) | 15 N·m (11.1 lbf·ft) | 26_3240234_en_BA p. 154; 27_3240381_en_BA p. 139; 26_3240235_en_BA p. 144; 27_3240383_en_BA p. 137; 27_3402947_en_BA p. 139; 26_3215268_en_BA p. 121; 27_3215290_en_BA p. 123; 25_3215222_en_BA p. 124 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 26_3240234_en_BA p. 154; 27_3240381_en_BA p. 139; 26_3240235_en_BA p. 144; 27_3240383_en_BA p. 137; 27_3402947_en_BA p. 139; 26_3215268_en_BA p. 121; 27_3215290_en_BA p. 123; 25_3215222_en_BA p. 124 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 26_3240234_en_BA p. 154; 27_3240381_en_BA p. 139; 26_3240235_en_BA p. 144; 27_3240383_en_BA p. 137; 27_3402947_en_BA p. 139; 26_3215268_en_BA p. 121; 27_3215290_en_BA p. 123; 25_3215222_en_BA p. 124 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 26_3240234_en_BA p. 155; 27_3240381_en_BA p. 140; 26_3240235_en_BA p. 145; 27_3240383_en_BA p. 138; 27_3402947_en_BA p. 140; 26_3215268_en_BA p. 122; 27_3215290_en_BA p. 124; 25_3215222_en_BA p. 125 |
| Wait before reading the level (warm engine) | 1 minute | 26_3240234_en_BA p. 153; 27_3240381_en_BA p. 138; 26_3240235_en_BA p. 143; 27_3240383_en_BA p. 136; 27_3402947_en_BA p. 138; 26_3215268_en_BA p. 120; 27_3215290_en_BA p. 122; 25_3215222_en_BA p. 123 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fx350-2026-2027-250xcf-2027-350xcf-2027`

Bikes: KTM 250 XC-F 2027, KTM 350 XC-F 2027, Husqvarna FX 350 2026, Husqvarna FX 350 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240381_en_BA p. 42; 27_3240383_en_BA p. 41; 26_3402885_en_BA p. 39; 27_3402947_en_BA p. 41 |
| Engine oil quantity | 1.0 l (0.26 US gal) | 27_3240381_en_BA p. 152; 27_3240383_en_BA p. 150; 26_3402885_en_BA p. 141; 27_3402947_en_BA p. 152 |
| Engine oil viscosity | SAE 10W/50 | 27_3240381_en_BA p. 140; 27_3240383_en_BA p. 138; 26_3402885_en_BA p. 131; 27_3402947_en_BA p. 140 |
| Engine oil type | fully synthetic | 27_3240381_en_BA p. 140; 27_3240383_en_BA p. 138; 26_3402885_en_BA p. 131; 27_3402947_en_BA p. 140 |
| Guard to remove first | skid plate | 27_3240381_en_BA p. 138; 27_3240383_en_BA p. 136; 26_3402885_en_BA p. 130; 27_3402947_en_BA p. 138 |
| Torque, screw plug (M14) | 15 N·m (11.1 lbf·ft) | 27_3240381_en_BA p. 139; 27_3240383_en_BA p. 137; 26_3402885_en_BA p. 130; 27_3402947_en_BA p. 139 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 27_3240381_en_BA p. 139; 27_3240383_en_BA p. 137; 26_3402885_en_BA p. 131; 27_3402947_en_BA p. 139 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 27_3240381_en_BA p. 139; 27_3240383_en_BA p. 137; 26_3402885_en_BA p. 131; 27_3402947_en_BA p. 139 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 27_3240381_en_BA p. 140; 27_3240383_en_BA p. 138; 26_3402885_en_BA p. 131; 27_3402947_en_BA p. 140 |
| Wait before reading the level (warm engine) | 1 minute | 27_3240381_en_BA p. 138; 27_3240383_en_BA p. 136; 26_3402885_en_BA p. 129; 27_3402947_en_BA p. 138 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fx350-2024-350xcf-2023`

Bikes: KTM 350 XC-F 2023, Husqvarna FX 350 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214641_en_OM p. 36; 24_3402714_en_OM p. 35 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 23_3214641_en_OM p. 142; 24_3402714_en_OM p. 137 |
| Engine oil viscosity | SAE 10W/50 | 23_3214641_en_OM p. 129; 24_3402714_en_OM p. 124 |
| Engine oil standard | JASO T903 MA2 | 23_3214641_en_OM p. 150; 24_3402714_en_OM p. 146 |
| Engine oil type | fully synthetic | 23_3214641_en_OM p. 150; 24_3402714_en_OM p. 146 |
| Guard to remove first | engine guard | 23_3214641_en_OM p. 128; 24_3402714_en_OM p. 123 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 23_3214641_en_OM p. 128, 129; 24_3402714_en_OM p. 123, 124 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3214641_en_OM p. 129; 24_3402714_en_OM p. 124 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 23_3214641_en_OM p. 129; 24_3402714_en_OM p. 124 |
| Wait before reading the level (warm engine) | 1 minute | 23_3214641_en_OM p. 127; 24_3402714_en_OM p. 122 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fc450-2020-2022-fx450-2020-2022-450sxf-2020-2022-450xcf-2020-2022`

Bikes: KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3214032_en_OM p. 35; 21_3214217_en_OM p. 35; 22_3214418_en_OM p. 34; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37; 22_3402535_en_OM p. 35 |
| Engine oil quantity | 1.20 l (1.27 US qt) | 20_3214032_en_OM p. 139; 21_3214217_en_OM p. 139; 22_3214418_en_OM p. 131; 20_3402354_en_OM p. 147; 21_3402445_en_OM p. 149; 22_3402535_en_OM p. 135 |
| Engine oil viscosity | SAE 10W/50 | 20_3214032_en_OM p. 127; 21_3214217_en_OM p. 127; 22_3214418_en_OM p. 119; 20_3402354_en_OM p. 135; 21_3402445_en_OM p. 137; 22_3402535_en_OM p. 123 |
| Engine oil standard | JASO T903 MA2 | 20_3214032_en_OM p. 148; 21_3214217_en_OM p. 150; 22_3214418_en_OM p. 139; 20_3402354_en_OM p. 155; 21_3402445_en_OM p. 160; 22_3402535_en_OM p. 143 |
| Engine oil type | fully synthetic | 20_3214032_en_OM p. 148; 21_3214217_en_OM p. 150; 22_3214418_en_OM p. 139; 20_3402354_en_OM p. 155; 21_3402445_en_OM p. 160; 22_3402535_en_OM p. 143 |
| Torque, screw plug with short oil screen (M20) | 15 N·m (11.1 lbf·ft) | 20_3214032_en_OM p. 126; 21_3214217_en_OM p. 126; 22_3214418_en_OM p. 118; 20_3402354_en_OM p. 134; 21_3402445_en_OM p. 136; 22_3402535_en_OM p. 122 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 20_3214032_en_OM p. 126; 21_3214217_en_OM p. 127; 22_3214418_en_OM p. 119; 20_3402354_en_OM p. 135; 21_3402445_en_OM p. 137; 22_3402535_en_OM p. 123 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 20_3214032_en_OM p. 126; 21_3214217_en_OM p. 127; 22_3214418_en_OM p. 119; 20_3402354_en_OM p. 135; 21_3402445_en_OM p. 137; 22_3402535_en_OM p. 123 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 20_3214032_en_OM p. 127; 21_3214217_en_OM p. 127; 22_3214418_en_OM p. 119; 20_3402354_en_OM p. 135; 21_3402445_en_OM p. 137; 22_3402535_en_OM p. 123 |
| Wait before reading the level (warm engine) | 1 minute | 20_3214032_en_OM p. 125; 21_3214217_en_OM p. 125; 22_3214418_en_OM p. 117; 20_3402354_en_OM p. 133; 21_3402445_en_OM p. 135; 22_3402535_en_OM p. 121 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fc450-2023-2024-450sxf-2023-2025-450xcf-2023`

Bikes: KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 SX-F 2025, Husqvarna FC 450 2023, Husqvarna FC 450 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214642_en_OM p. 35; 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37 |
| Engine oil quantity | 1.20 l (1.27 US qt) | 23_3214642_en_OM p. 148; 24_3214836_en_OM p. 155; 25_3240045_en_OM p. 152; 23_3402633_en_OM p. 150; 24_3402715_en_OM p. 157 |
| Engine oil viscosity | SAE 10W/50 | 23_3214642_en_OM p. 135; 24_3214836_en_OM p. 141; 25_3240045_en_OM p. 138; 23_3402633_en_OM p. 137; 24_3402715_en_OM p. 143 |
| Engine oil standard | JASO T903 MA2 | 23_3214642_en_OM p. 157; 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168 |
| Engine oil type | fully synthetic | 23_3214642_en_OM p. 157; 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168 |
| Torque, screw plug (M16) | 15 N·m (11.1 lbf·ft) | 23_3214642_en_OM p. 133; 24_3214836_en_OM p. 139; 25_3240045_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3214642_en_OM p. 134; 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 23_3214642_en_OM p. 134; 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 23_3214642_en_OM p. 134; 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 137; 24_3402715_en_OM p. 143 |
| Wait before reading the level (warm engine) | 1 minute | 23_3214642_en_OM p. 132; 24_3214836_en_OM p. 138; 25_3240045_en_OM p. 135; 23_3402633_en_OM p. 134; 24_3402715_en_OM p. 140 |
| Torque, screw plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3402633_en_OM p. 136 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fx450-2023-2024-450xcf-2024-2025`

Bikes: KTM 450 XC-F 2024, KTM 450 XC-F 2025, Husqvarna FX 450 2023, Husqvarna FX 450 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37 |
| Engine oil quantity | 1.20 l (1.27 US qt) | 24_3214836_en_OM p. 155; 25_3240045_en_OM p. 152; 23_3402633_en_OM p. 150; 24_3402715_en_OM p. 157 |
| Engine oil viscosity | SAE 10W/50 | 24_3214836_en_OM p. 141; 25_3240045_en_OM p. 138; 23_3402633_en_OM p. 137; 24_3402715_en_OM p. 143 |
| Engine oil standard | JASO T903 MA2 | 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168 |
| Engine oil type | fully synthetic | 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168 |
| Guard to remove first | engine guard | 24_3214836_en_OM p. 139; 25_3240045_en_OM p. 136; 23_3402633_en_OM p. 135; 24_3402715_en_OM p. 141 |
| Torque, screw plug (M16) | 15 N·m (11.1 lbf·ft) | 24_3214836_en_OM p. 139; 25_3240045_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 136; 24_3402715_en_OM p. 142 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 24_3214836_en_OM p. 140; 25_3240045_en_OM p. 137; 23_3402633_en_OM p. 137; 24_3402715_en_OM p. 143 |
| Wait before reading the level (warm engine) | 1 minute | 24_3214836_en_OM p. 138; 25_3240045_en_OM p. 135; 23_3402633_en_OM p. 134; 24_3402715_en_OM p. 140 |
| Torque, screw plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3402633_en_OM p. 136 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-mc450f-2026-2027-fc450-2025-2027-450sxf-2026-2027-450xcf-2026`

Bikes: KTM 450 SX-F 2026, KTM 450 XC-F 2026, KTM 450 SX-F 2027, Husqvarna FC 450 2025, Husqvarna FC 450 2027, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240236_en_BA p. 41; 27_3240384_en_BA p. 42; 25_3402805_en_BA p. 41; 27_3402948_en_BA p. 41; 26_3215269_en_BA p. 31; 27_3215291_en_BA p. 31 |
| Engine oil quantity | 1.20 l (0.317 US gal) | 26_3240236_en_BA p. 155; 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 145; 27_3402948_en_BA p. 152; 26_3215269_en_BA p. 133; 27_3215291_en_BA p. 135 |
| Engine oil viscosity | SAE 10W/50 | 26_3240236_en_BA p. 155; 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139; 26_3215269_en_BA p. 121; 27_3215291_en_BA p. 123 |
| Engine oil type | fully synthetic | 26_3240236_en_BA p. 155; 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139; 26_3215269_en_BA p. 121; 27_3215291_en_BA p. 123 |
| Torque, screw plug (M16) | 15 N·m (11.1 lbf·ft) | 26_3240236_en_BA p. 154; 27_3240384_en_BA p. 139; 27_3402948_en_BA p. 138; 26_3215269_en_BA p. 120; 27_3215291_en_BA p. 122 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 26_3240236_en_BA p. 154; 27_3240384_en_BA p. 139; 25_3402805_en_BA p. 135; 27_3402948_en_BA p. 139; 26_3215269_en_BA p. 120; 27_3215291_en_BA p. 122 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 26_3240236_en_BA p. 154; 27_3240384_en_BA p. 139; 25_3402805_en_BA p. 135; 27_3402948_en_BA p. 139; 26_3215269_en_BA p. 120; 27_3215291_en_BA p. 122 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 26_3240236_en_BA p. 155; 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139; 26_3215269_en_BA p. 121; 27_3215291_en_BA p. 123 |
| Wait before reading the level (warm engine) | 1 minute | 26_3240236_en_BA p. 153; 27_3240384_en_BA p. 138; 25_3402805_en_BA p. 133; 27_3402948_en_BA p. 137; 26_3215269_en_BA p. 119; 27_3215291_en_BA p. 121 |
| Torque, screw plug (M20) | 15 N·m (11.1 lbf·ft) | 25_3402805_en_BA p. 135 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fx450-2025-2027-450xcf-2027`

Bikes: KTM 450 XC-F 2027, Husqvarna FX 450 2025, Husqvarna FX 450 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240384_en_BA p. 42; 25_3402805_en_BA p. 41; 27_3402948_en_BA p. 41 |
| Engine oil quantity | 1.20 l (0.317 US gal) | 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 145; 27_3402948_en_BA p. 152 |
| Engine oil viscosity | SAE 10W/50 | 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139 |
| Engine oil type | fully synthetic | 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139 |
| Guard to remove first | skid plate | 27_3240384_en_BA p. 138; 25_3402805_en_BA p. 134; 27_3402948_en_BA p. 137 |
| Torque, screw plug (M16) | 15 N·m (11.1 lbf·ft) | 27_3240384_en_BA p. 139; 27_3402948_en_BA p. 138 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 27_3240384_en_BA p. 139; 25_3402805_en_BA p. 135; 27_3402948_en_BA p. 139 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 27_3240384_en_BA p. 139; 25_3402805_en_BA p. 135; 27_3402948_en_BA p. 139 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 27_3240384_en_BA p. 140; 25_3402805_en_BA p. 136; 27_3402948_en_BA p. 139 |
| Wait before reading the level (warm engine) | 1 minute | 27_3240384_en_BA p. 138; 25_3402805_en_BA p. 133; 27_3402948_en_BA p. 137 |
| Torque, screw plug (M20) | 15 N·m (11.1 lbf·ft) | 25_3402805_en_BA p. 135 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fc250-2025`

Bikes: Husqvarna FC 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402803_en_BA p. 37 |
| Engine oil quantity | 1.0 l | 25_3402803_en_BA p. 134 |
| Engine oil viscosity | SAE 10W/50 | 25_3402803_en_BA p. 126 |
| Engine oil type | fully synthetic | 25_3402803_en_BA p. 126 |
| Torque, magnetic oil drain plug (M12) | 20 N·m | 25_3402803_en_BA p. 125 |
| Torque, oil screen plug (M20) | 15 N·m | 25_3402803_en_BA p. 125 |
| Torque, magnetic oil drain plug (M12), from the engine torque table | 20 N·m | 25_3402803_en_BA p. 142 |
| Torque, oil filter cover screws (M6) | 10 N·m | 25_3402803_en_BA p. 126 |
| Wait before reading the level (warm engine) | 1 minute | 25_3402803_en_BA p. 124 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fc250-2027`

Bikes: Husqvarna FC 250 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3402945_en_BA p. 39 |
| Engine oil quantity | 1.0 l (0.26 US gal) | 27_3402945_en_BA p. 146 |
| Engine oil viscosity | SAE 10W/50 | 27_3402945_en_BA p. 134 |
| Engine oil type | fully synthetic | 27_3402945_en_BA p. 134 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 27_3402945_en_BA p. 133 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 27_3402945_en_BA p. 133 |
| Torque, magnetic oil drain plug (M12), from the engine torque table | 20 N·m | 27_3402945_en_BA p. 154 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 27_3402945_en_BA p. 134 |
| Wait before reading the level (warm engine) | 1 minute | 27_3402945_en_BA p. 132 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex250f-2025-mc250f-2025-fc350-2025`

Bikes: Husqvarna FC 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402804_en_BA p. 39; 25_3215221_en_BA p. 39 |
| Engine oil quantity | 1.0 l | 25_3402804_en_BA p. 138; 25_3215221_en_BA p. 148 |
| Engine oil viscosity | SAE 10W/50 | 25_3402804_en_BA p. 129; 25_3215221_en_BA p. 138 |
| Engine oil type | fully synthetic | 25_3402804_en_BA p. 129; 25_3215221_en_BA p. 138 |
| Torque, screw plug (M14) | 15 N·m | 25_3402804_en_BA p. 128; 25_3215221_en_BA p. 137 |
| Torque, oil screen plug (M20) | 15 N·m | 25_3402804_en_BA p. 128; 25_3215221_en_BA p. 137 |
| Torque, magnetic oil drain plug (M12), from the engine torque table | 20 N·m | 25_3402804_en_BA p. 149 |
| Torque, oil filter cover screws (M6) | 10 N·m | 25_3402804_en_BA p. 129; 25_3215221_en_BA p. 138 |
| Wait before reading the level (warm engine) | 1 minute | 25_3402804_en_BA p. 127; 25_3215221_en_BA p. 136 |
| Torque, magnetic oil drain plug (M12) | 20 N·m | 25_3215221_en_BA p. 137 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-fx350-2025`

Bikes: Husqvarna FX 350 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402804_en_BA p. 39 |
| Engine oil quantity | 1.0 l | 25_3402804_en_BA p. 138 |
| Engine oil viscosity | SAE 10W/50 | 25_3402804_en_BA p. 129 |
| Engine oil type | fully synthetic | 25_3402804_en_BA p. 129 |
| Guard to remove first | skid plate | 25_3402804_en_BA p. 128 |
| Torque, screw plug (M14) | 15 N·m | 25_3402804_en_BA p. 128 |
| Torque, oil screen plug (M20) | 15 N·m | 25_3402804_en_BA p. 128 |
| Torque, magnetic oil drain plug (M12), from the engine torque table | 20 N·m | 25_3402804_en_BA p. 149 |
| Torque, oil filter cover screws (M6) | 10 N·m | 25_3402804_en_BA p. 129 |
| Wait before reading the level (warm engine) | 1 minute | 25_3402804_en_BA p. 127 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex450f-2022-2023-mc450f-2022-2023`

Bikes: GasGas MC 450F 2023, GasGas EX 450F 2023, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 10 operating hours and after every race | 23_3215100_en_OM p. 30; 22_3215055_en_OM p. 34 |
| Engine oil quantity | 1.2 l (1.3 US qt) | 23_3215100_en_OM p. 123; 22_3215055_en_OM p. 136 |
| Engine oil viscosity | SAE 10W/50 | 23_3215100_en_OM p. 111; 22_3215055_en_OM p. 124 |
| Engine oil standard | JASO T903 MA2 | 23_3215100_en_OM p. 130; 22_3215055_en_OM p. 144 |
| Engine oil type | fully synthetic | 23_3215100_en_OM p. 130; 22_3215055_en_OM p. 144 |
| Torque, screw plug with short oil screen (M20) | 15 N·m (11.1 lbf·ft) | 23_3215100_en_OM p. 110; 22_3215055_en_OM p. 123 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 23_3215100_en_OM p. 110; 22_3215055_en_OM p. 123 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 23_3215100_en_OM p. 110; 22_3215055_en_OM p. 123 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 23_3215100_en_OM p. 111; 22_3215055_en_OM p. 124 |
| Wait before reading the level (warm engine) | 1 minute | 23_3215100_en_OM p. 108; 22_3215055_en_OM p. 122 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex450f-2024-mc450f-2024`

Bikes: GasGas MC 450F 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3215162_en_OM p. 34 |
| Engine oil quantity | 1.2 l (1.3 US qt) | 24_3215162_en_OM p. 140 |
| Engine oil viscosity | SAE 10W/50 | 24_3215162_en_OM p. 127 |
| Engine oil standard | JASO T903 MA2 | 24_3215162_en_OM p. 150 |
| Engine oil type | fully synthetic | 24_3215162_en_OM p. 150 |
| Torque, screw plug (M16) | 15 N·m (11.1 lbf·ft) | 24_3215162_en_OM p. 126 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 24_3215162_en_OM p. 127 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 24_3215162_en_OM p. 127 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 24_3215162_en_OM p. 127 |
| Wait before reading the level (warm engine) | 1 minute | 24_3215162_en_OM p. 125 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex450f-2025-mc450f-2025`

Bikes: GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3215223_en_BA p. 39 |
| Engine oil quantity | 1.20 l | 25_3215223_en_BA p. 150 |
| Engine oil viscosity | SAE 10W/50 | 25_3215223_en_BA p. 140 |
| Engine oil type | fully synthetic | 25_3215223_en_BA p. 140 |
| Torque, screw plug (M20) | 15 N·m | 25_3215223_en_BA p. 139 |
| Torque, oil screen plug (M20) | 15 N·m | 25_3215223_en_BA p. 139 |
| Torque, magnetic oil drain plug (M12) | 20 N·m | 25_3215223_en_BA p. 139 |
| Torque, oil filter cover screws (M6) | 10 N·m | 25_3215223_en_BA p. 140 |
| Wait before reading the level (warm engine) | 1 minute | 25_3215223_en_BA p. 137 |

### Change the engine oil and filter

`bak-ktmg4t-oil-filter-v1-ex450f-2021-mc450f-2021`

Bikes: GasGas MC 450F 2021, GasGas EX 450F 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil and filter change interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3215010_en_OM p. 30 |
| Engine oil quantity | 1.0 l (1.1 US qt) | 21_3215010_en_OM p. 122 |
| Engine oil viscosity | SAE 10W/50 | 21_3215010_en_OM p. 110 |
| Engine oil standard | JASO T903 MA2 | 21_3215010_en_OM p. 129 |
| Engine oil type | fully synthetic | 21_3215010_en_OM p. 129 |
| Torque, screw plug with short oil screen (M20) | 15 N·m (11.1 lbf·ft) | 21_3215010_en_OM p. 109 |
| Torque, oil screen plug (M20) | 15 N·m (11.1 lbf·ft) | 21_3215010_en_OM p. 109 |
| Torque, magnetic oil drain plug (M12) | 20 N·m (14.8 lbf·ft) | 21_3215010_en_OM p. 109 |
| Torque, oil filter cover screws (M6) | 10 N·m (7.4 lbf·ft) | 21_3215010_en_OM p. 110 |
| Wait before reading the level (warm engine) | 1 minute | 21_3215010_en_OM p. 108 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-ex250f-2021-2023-and-more-7f8f2c6e`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 450F 2023, GasGas EX 450F 2023, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours and after every race | 20_3214129_en_OM p. 35; 21_3214213_en_OM p. 35; 22_3214414_en_OM p. 35; 20_3214004_en_OM p. 35; 21_3214215_en_OM p. 36; 22_3214417_en_OM p. 36; 20_3214032_en_OM p. 36; 21_3214217_en_OM p. 36; 22_3214418_en_OM p. 35; 23_3215097_en_OM p. 31; 23_3215099_en_OM p. 31; 23_3215100_en_OM p. 31; 21_3215009_en_OM p. 31; 22_3215053_en_OM p. 31; 22_3215054_en_OM p. 31; 21_3215019_en_OM p. 30; 21_3215010_en_OM p. 31; 22_3215055_en_OM p. 35 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 20_3214129_en_OM p. 67; 21_3214213_en_OM p. 68; 22_3214414_en_OM p. 64; 20_3214004_en_OM p. 64; 21_3214215_en_OM p. 69; 22_3214417_en_OM p. 69; 20_3214032_en_OM p. 69; 21_3214217_en_OM p. 69; 22_3214418_en_OM p. 64; 23_3215097_en_OM p. 58; 23_3215099_en_OM p. 58; 23_3215100_en_OM p. 58; 21_3215009_en_OM p. 58; 22_3215053_en_OM p. 58; 22_3215054_en_OM p. 58; 21_3215019_en_OM p. 56; 21_3215010_en_OM p. 58; 22_3215055_en_OM p. 67 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-ex250f-2024-and-more-a8516eb1`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, Husqvarna FC 450 2023, Husqvarna FX 450 2023, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 450F 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 23_3214640_en_OM p. 35; 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 23_3214641_en_OM p. 37; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402633_en_OM p. 37; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 23_3214640_en_OM p. 64; 24_3214834_en_OM p. 75; 25_3240043_en_OM p. 71; 23_3214641_en_OM p. 73; 24_3214835_en_OM p. 74; 25_3240044_en_OM p. 74; 23_3214642_en_OM p. 73; 24_3214836_en_OM p. 78; 25_3240045_en_OM p. 75; 23_3402633_en_OM p. 76; 24_3215160_en_OM p. 70; 24_3215161_en_OM p. 61; 24_3215162_en_OM p. 69 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-ex350f-2025-and-more-162c2d07`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 250 2027, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2024, Husqvarna FX 450 2024, Husqvarna FC 450 2025, Husqvarna FX 450 2025, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 26_3240234_en_BA p. 44; 27_3240381_en_BA p. 43; 26_3240235_en_BA p. 43; 27_3240383_en_BA p. 42; 27_3240384_en_BA p. 43; 23_3402631_en_OM p. 35; 24_3402713_en_OM p. 36; 27_3402945_en_BA p. 40; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36; 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42; 24_3402715_en_OM p. 38; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Torque, air filter box cover screw | 5 N·m (3.7 lbf·ft) | 26_3240234_en_BA p. 92; 27_3240381_en_BA p. 80; 26_3240235_en_BA p. 82; 27_3240383_en_BA p. 78; 27_3240384_en_BA p. 80; 23_3402631_en_OM p. 64; 24_3402713_en_OM p. 69; 27_3402945_en_BA p. 74; 23_3402632_en_OM p. 67; 24_3402714_en_OM p. 67; 26_3402885_en_BA p. 71; 27_3402947_en_BA p. 79; 24_3402715_en_OM p. 79; 25_3402805_en_BA p. 78; 27_3402948_en_BA p. 79; 26_3215268_en_BA p. 64; 27_3215290_en_BA p. 64; 25_3215222_en_BA p. 69; 26_3215269_en_BA p. 63; 27_3215291_en_BA p. 63 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-450sxf-2026-450xcf-2026`

Bikes: KTM 450 SX-F 2026, KTM 450 XC-F 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 26_3240236_en_BA p. 42 |
| Air filter box cover screw | hand-tight | 26_3240236_en_BA p. 91 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40; 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Torque, air filter box cover screw | 5 N·m | 25_3402803_en_BA p. 70; 25_3402804_en_BA p. 72; 25_3215221_en_BA p. 78; 25_3215223_en_BA p. 80 |

### Clean and oil the air filter

`bak-ktmg4t-air-filter-v1-fc250-2020-2022-fc350-2020-2022-fc450-2020-2022-fx350-2020-2022-fx450-2020-2022`

Bikes: Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours and after every race | 20_3402335_en_OM p. 34; 21_3402442_en_OM p. 34; 22_3402532_en_OM p. 35; 20_3402336_en_OM p. 36; 21_3402443_en_OM p. 36; 22_3402534_en_OM p. 36; 20_3402354_en_OM p. 37; 21_3402445_en_OM p. 38; 22_3402535_en_OM p. 36 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc250-2020-fc350-2020-fx350-2020-250sxf-2020-250xcf-2020-350sxf-2020-350xcf-2020`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 350 SX-F 2020, KTM 350 XC-F 2020, Husqvarna FC 250 2020, Husqvarna FC 350 2020, Husqvarna FX 350 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3214129_en_OM p. 35; 20_3214004_en_OM p. 35; 20_3402335_en_OM p. 34; 20_3402336_en_OM p. 36 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3214129_en_OM p. 108; 20_3214004_en_OM p. 103; 20_3402335_en_OM p. 102; 20_3402336_en_OM p. 113 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3214129_en_OM p. 108; 20_3214004_en_OM p. 103; 20_3402335_en_OM p. 102; 20_3402336_en_OM p. 113 |
| Coolant quantity for a change | 0.95 l (1 US qt) | 20_3214129_en_OM p. 110; 20_3214004_en_OM p. 105; 20_3402335_en_OM p. 105; 20_3402336_en_OM p. 115 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3214129_en_OM p. 110; 20_3214004_en_OM p. 105; 20_3402335_en_OM p. 103; 20_3402336_en_OM p. 114 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3214129_en_OM p. 143; 20_3214004_en_OM p. 137; 20_3402335_en_OM p. 133; 20_3402336_en_OM p. 146 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-ex250f-2021-2023-and-more-23a1d969`

Bikes: KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2021, KTM 350 XC-F 2021, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 450F 2023, GasGas EX 450F 2023, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3214213_en_OM p. 35; 22_3214414_en_OM p. 35; 21_3214215_en_OM p. 36; 23_3215097_en_OM p. 31; 23_3215099_en_OM p. 31; 23_3215100_en_OM p. 31; 21_3402442_en_OM p. 34; 22_3402532_en_OM p. 35; 21_3402443_en_OM p. 36; 22_3402534_en_OM p. 36; 21_3215009_en_OM p. 31; 22_3215053_en_OM p. 31; 22_3215054_en_OM p. 31; 21_3215019_en_OM p. 30; 21_3215010_en_OM p. 31; 22_3215055_en_OM p. 35 |
| Coolant change interval | at least every 48 months | 21_3214213_en_OM p. 35; 22_3214414_en_OM p. 35; 21_3214215_en_OM p. 36; 23_3215097_en_OM p. 31; 23_3215099_en_OM p. 31; 23_3215100_en_OM p. 31; 21_3402442_en_OM p. 34; 22_3402532_en_OM p. 35; 21_3402443_en_OM p. 36; 22_3402534_en_OM p. 36; 21_3215009_en_OM p. 31; 22_3215053_en_OM p. 31; 22_3215054_en_OM p. 31; 21_3215019_en_OM p. 30; 21_3215010_en_OM p. 31; 22_3215055_en_OM p. 35 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3214213_en_OM p. 111; 22_3214414_en_OM p. 104; 21_3214215_en_OM p. 112; 23_3215097_en_OM p. 98; 23_3215099_en_OM p. 99; 23_3215100_en_OM p. 97; 21_3402442_en_OM p. 104; 22_3402532_en_OM p. 106; 21_3402443_en_OM p. 115; 22_3402534_en_OM p. 110; 21_3215009_en_OM p. 98; 22_3215053_en_OM p. 98; 22_3215054_en_OM p. 98; 21_3215019_en_OM p. 94; 21_3215010_en_OM p. 97; 22_3215055_en_OM p. 109 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 21_3214213_en_OM p. 111; 22_3214414_en_OM p. 104; 21_3214215_en_OM p. 112; 23_3215097_en_OM p. 98; 23_3215099_en_OM p. 99; 23_3215100_en_OM p. 97; 21_3402442_en_OM p. 104; 22_3402532_en_OM p. 106; 21_3402443_en_OM p. 115; 22_3402534_en_OM p. 110; 21_3215009_en_OM p. 98; 22_3215053_en_OM p. 98; 22_3215054_en_OM p. 98; 21_3215019_en_OM p. 94; 21_3215010_en_OM p. 97; 22_3215055_en_OM p. 109 |
| Coolant quantity for a change | 0.95 l (1 US qt) | 21_3214213_en_OM p. 113; 22_3214414_en_OM p. 106; 21_3214215_en_OM p. 114; 23_3215097_en_OM p. 100; 23_3215099_en_OM p. 101; 23_3215100_en_OM p. 99; 21_3402442_en_OM p. 107; 22_3402532_en_OM p. 109; 21_3402443_en_OM p. 117; 22_3402534_en_OM p. 112; 21_3215009_en_OM p. 100; 22_3215053_en_OM p. 100; 22_3215054_en_OM p. 100; 21_3215019_en_OM p. 96; 21_3215010_en_OM p. 99; 22_3215055_en_OM p. 111 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3214213_en_OM p. 113; 22_3214414_en_OM p. 106; 21_3214215_en_OM p. 114; 23_3215097_en_OM p. 100; 23_3215099_en_OM p. 101; 23_3215100_en_OM p. 99; 21_3402442_en_OM p. 105; 22_3402532_en_OM p. 107; 21_3402443_en_OM p. 116; 22_3402534_en_OM p. 111; 21_3215009_en_OM p. 100; 22_3215053_en_OM p. 100; 22_3215054_en_OM p. 100; 21_3215019_en_OM p. 96; 21_3215010_en_OM p. 99; 22_3215055_en_OM p. 111 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3214213_en_OM p. 148; 22_3214414_en_OM p. 139; 21_3214215_en_OM p. 147; 23_3215097_en_OM p. 129; 23_3215099_en_OM p. 130; 23_3215100_en_OM p. 130; 21_3402442_en_OM p. 136; 22_3402532_en_OM p. 138; 21_3402443_en_OM p. 149; 22_3402534_en_OM p. 144; 21_3215009_en_OM p. 130; 22_3215053_en_OM p. 130; 22_3215054_en_OM p. 130; 21_3215019_en_OM p. 124; 21_3215010_en_OM p. 129; 22_3215055_en_OM p. 144 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-250sxf-2023-250xcf-2023-350sxf-2023`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 350 SX-F 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3214640_en_OM p. 35; 23_3214641_en_OM p. 37 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3214640_en_OM p. 35; 23_3214641_en_OM p. 37 |
| Coolant change interval | at least every 24 months | 23_3214640_en_OM p. 35; 23_3214641_en_OM p. 37 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3214640_en_OM p. 106; 23_3214641_en_OM p. 115 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 23_3214640_en_OM p. 106; 23_3214641_en_OM p. 115 |
| Coolant quantity for a change | 0.9 l (1 US qt) | 23_3214640_en_OM p. 108; 23_3214641_en_OM p. 117 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 23_3214640_en_OM p. 108; 23_3214641_en_OM p. 117 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3214640_en_OM p. 140; 23_3214641_en_OM p. 150 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-ex250f-2024-and-more-72c7d130`

Bikes: KTM 250 SX-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2024, KTM 350 SX-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 SX-F 2025, Husqvarna FC 250 2024, Husqvarna FC 450 2023, Husqvarna FC 450 2024, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 450F 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 24_3402713_en_OM p. 36; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Antifreeze and coolant level check interval | every 45 operating hours | 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 24_3402713_en_OM p. 36; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Coolant change interval | at least every 24 months | 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 24_3402713_en_OM p. 36; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 24_3214834_en_OM p. 122; 25_3240043_en_OM p. 118; 24_3214835_en_OM p. 119; 25_3240044_en_OM p. 119; 23_3214642_en_OM p. 120; 24_3214836_en_OM p. 126; 25_3240045_en_OM p. 123; 24_3402713_en_OM p. 116; 23_3402633_en_OM p. 122; 24_3402715_en_OM p. 128; 24_3215160_en_OM p. 116; 24_3215161_en_OM p. 102; 24_3215162_en_OM p. 113 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 24_3214834_en_OM p. 122; 25_3240043_en_OM p. 118; 24_3214835_en_OM p. 119; 25_3240044_en_OM p. 119; 23_3214642_en_OM p. 120; 24_3214836_en_OM p. 126; 25_3240045_en_OM p. 123; 24_3402713_en_OM p. 116; 23_3402633_en_OM p. 122; 24_3402715_en_OM p. 128; 24_3215160_en_OM p. 116; 24_3215161_en_OM p. 102; 24_3215162_en_OM p. 113 |
| Coolant quantity for a change | 0.95 l (1 US qt) | 24_3214834_en_OM p. 124; 25_3240043_en_OM p. 120; 24_3214835_en_OM p. 121; 25_3240044_en_OM p. 121; 23_3214642_en_OM p. 122; 24_3214836_en_OM p. 128; 25_3240045_en_OM p. 125; 24_3402713_en_OM p. 119; 23_3402633_en_OM p. 124; 24_3402715_en_OM p. 130; 24_3215160_en_OM p. 118; 24_3215161_en_OM p. 104; 24_3215162_en_OM p. 115 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 24_3214834_en_OM p. 124; 25_3240043_en_OM p. 120; 24_3214835_en_OM p. 121; 25_3240044_en_OM p. 121; 23_3214642_en_OM p. 122; 24_3214836_en_OM p. 128; 25_3240045_en_OM p. 125; 24_3402713_en_OM p. 118; 23_3402633_en_OM p. 124; 24_3402715_en_OM p. 130; 24_3215160_en_OM p. 118; 24_3215161_en_OM p. 104; 24_3215162_en_OM p. 115 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 24_3214834_en_OM p. 161; 25_3240043_en_OM p. 156; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154; 23_3214642_en_OM p. 157; 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 24_3402713_en_OM p. 153; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168; 24_3215160_en_OM p. 154; 24_3215161_en_OM p. 135; 24_3215162_en_OM p. 150 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fx450-2023-2024-250xcf-2024-350xcf-2024-2025-450xcf-2024-2025`

Bikes: KTM 250 XC-F 2024, KTM 350 XC-F 2024, KTM 350 XC-F 2025, KTM 450 XC-F 2024, KTM 450 XC-F 2025, Husqvarna FX 450 2023, Husqvarna FX 450 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 24_3214834_en_OM p. 40; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38 |
| Antifreeze and coolant level check interval | every 45 operating hours | 24_3214834_en_OM p. 40; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38 |
| Coolant change interval | at least every 24 months | 24_3214834_en_OM p. 40; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402633_en_OM p. 37; 24_3402715_en_OM p. 38 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 24_3214834_en_OM p. 122; 24_3214835_en_OM p. 119; 25_3240044_en_OM p. 119; 24_3214836_en_OM p. 126; 25_3240045_en_OM p. 123; 23_3402633_en_OM p. 122; 24_3402715_en_OM p. 128 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 24_3214834_en_OM p. 122; 24_3214835_en_OM p. 119; 25_3240044_en_OM p. 119; 24_3214836_en_OM p. 126; 25_3240045_en_OM p. 123; 23_3402633_en_OM p. 122; 24_3402715_en_OM p. 128 |
| Coolant quantity for a change | 0.95 l (1 US qt) | 24_3214834_en_OM p. 124; 24_3214835_en_OM p. 121; 25_3240044_en_OM p. 121; 24_3214836_en_OM p. 128; 25_3240045_en_OM p. 125; 23_3402633_en_OM p. 124; 24_3402715_en_OM p. 130 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 24_3214834_en_OM p. 124; 24_3214835_en_OM p. 121; 25_3240044_en_OM p. 121; 24_3214836_en_OM p. 128; 25_3240045_en_OM p. 125; 23_3402633_en_OM p. 124; 24_3402715_en_OM p. 130 |
| Guard to remove before draining | engine guard | 24_3214834_en_OM p. 124; 24_3214835_en_OM p. 121; 25_3240044_en_OM p. 121; 24_3214836_en_OM p. 128; 25_3240045_en_OM p. 125; 23_3402633_en_OM p. 124; 24_3402715_en_OM p. 130 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 24_3214834_en_OM p. 161; 24_3214835_en_OM p. 154; 25_3240044_en_OM p. 154; 24_3214836_en_OM p. 166; 25_3240045_en_OM p. 162; 23_3402633_en_OM p. 159; 24_3402715_en_OM p. 168 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-ex350f-2025-and-more-8c5d70a8`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 450 SX-F 2026, KTM 450 XC-F 2026, KTM 450 SX-F 2027, Husqvarna FC 450 2025, Husqvarna FC 450 2027, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3240234_en_BA p. 44; 27_3240381_en_BA p. 43; 26_3240235_en_BA p. 43; 27_3240383_en_BA p. 42; 26_3240236_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3240234_en_BA p. 44; 27_3240381_en_BA p. 43; 26_3240235_en_BA p. 43; 27_3240383_en_BA p. 42; 26_3240236_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Coolant change interval | at least every 24 months | 26_3240234_en_BA p. 44; 27_3240381_en_BA p. 43; 26_3240235_en_BA p. 43; 27_3240383_en_BA p. 42; 26_3240236_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3240234_en_BA p. 139; 27_3240381_en_BA p. 124; 26_3240235_en_BA p. 129; 27_3240383_en_BA p. 122; 26_3240236_en_BA p. 139; 27_3240384_en_BA p. 124; 25_3402805_en_BA p. 121; 27_3402948_en_BA p. 124; 26_3215268_en_BA p. 107; 27_3215290_en_BA p. 109; 25_3215222_en_BA p. 111; 26_3215269_en_BA p. 106; 27_3215291_en_BA p. 108 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3240234_en_BA p. 139; 27_3240381_en_BA p. 124; 26_3240235_en_BA p. 129; 27_3240383_en_BA p. 122; 26_3240236_en_BA p. 139; 27_3240384_en_BA p. 124; 25_3402805_en_BA p. 121; 27_3402948_en_BA p. 124; 26_3215268_en_BA p. 107; 27_3215290_en_BA p. 109; 25_3215222_en_BA p. 111; 26_3215269_en_BA p. 106; 27_3215291_en_BA p. 108 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 26_3240234_en_BA p. 142; 27_3240381_en_BA p. 127; 26_3240235_en_BA p. 132; 27_3240383_en_BA p. 125; 26_3240236_en_BA p. 142; 27_3240384_en_BA p. 127; 25_3402805_en_BA p. 124; 27_3402948_en_BA p. 127; 26_3215268_en_BA p. 110; 27_3215290_en_BA p. 112; 25_3215222_en_BA p. 114; 26_3215269_en_BA p. 109; 27_3215291_en_BA p. 111 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 26_3240234_en_BA p. 141; 27_3240381_en_BA p. 126; 26_3240235_en_BA p. 131; 27_3240383_en_BA p. 124; 26_3240236_en_BA p. 141; 27_3240384_en_BA p. 126; 25_3402805_en_BA p. 125; 27_3402948_en_BA p. 126; 26_3215268_en_BA p. 109; 27_3215290_en_BA p. 111; 25_3215222_en_BA p. 113; 26_3215269_en_BA p. 108; 27_3215291_en_BA p. 110 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3240234_en_BA p. 167; 27_3240381_en_BA p. 152; 26_3240235_en_BA p. 157; 27_3240383_en_BA p. 150; 26_3240236_en_BA p. 168; 27_3240384_en_BA p. 152; 25_3402805_en_BA p. 145; 27_3402948_en_BA p. 152; 26_3215268_en_BA p. 134; 27_3215290_en_BA p. 136; 25_3215222_en_BA p. 134; 26_3215269_en_BA p. 133; 27_3215291_en_BA p. 135 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fx450-2025-2027-250xcf-2027-350xcf-2027-450xcf-2027`

Bikes: KTM 250 XC-F 2027, KTM 350 XC-F 2027, KTM 450 XC-F 2027, Husqvarna FX 450 2025, Husqvarna FX 450 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 27_3240381_en_BA p. 43; 27_3240383_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42 |
| Antifreeze and coolant level check interval | every 45 operating hours | 27_3240381_en_BA p. 43; 27_3240383_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42 |
| Coolant change interval | at least every 24 months | 27_3240381_en_BA p. 43; 27_3240383_en_BA p. 42; 27_3240384_en_BA p. 43; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 27_3240381_en_BA p. 124; 27_3240383_en_BA p. 122; 27_3240384_en_BA p. 124; 25_3402805_en_BA p. 121; 27_3402948_en_BA p. 124 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 27_3240381_en_BA p. 124; 27_3240383_en_BA p. 122; 27_3240384_en_BA p. 124; 25_3402805_en_BA p. 121; 27_3402948_en_BA p. 124 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 27_3240381_en_BA p. 127; 27_3240383_en_BA p. 125; 27_3240384_en_BA p. 127; 25_3402805_en_BA p. 124; 27_3402948_en_BA p. 127 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 27_3240381_en_BA p. 126; 27_3240383_en_BA p. 124; 27_3240384_en_BA p. 126; 25_3402805_en_BA p. 123; 27_3402948_en_BA p. 126 |
| Guard to remove before draining | skid plate | 27_3240381_en_BA p. 126; 27_3240383_en_BA p. 124; 27_3240384_en_BA p. 126; 25_3402805_en_BA p. 123; 27_3402948_en_BA p. 126 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 27_3240381_en_BA p. 152; 27_3240383_en_BA p. 150; 27_3240384_en_BA p. 152; 25_3402805_en_BA p. 145; 27_3402948_en_BA p. 152 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-350sxf-2022-350xcf-2022`

Bikes: KTM 350 SX-F 2022, KTM 350 XC-F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 22_3214417_en_OM p. 36 |
| Coolant change interval | at least every 12 months | 22_3214417_en_OM p. 37 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 22_3214417_en_OM p. 112 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 22_3214417_en_OM p. 112 |
| Coolant quantity for a change | 0.95 l (1 US qt) | 22_3214417_en_OM p. 114 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 22_3214417_en_OM p. 114 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 22_3214417_en_OM p. 148 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-350xcf-2023`

Bikes: KTM 350 XC-F 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3214641_en_OM p. 37 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3214641_en_OM p. 37 |
| Coolant change interval | at least every 24 months | 23_3214641_en_OM p. 37 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3214641_en_OM p. 115 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 23_3214641_en_OM p. 115 |
| Coolant quantity for a change | 0.9 l (1 US qt) | 23_3214641_en_OM p. 117 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 23_3214641_en_OM p. 117 |
| Guard to remove before draining | engine guard | 23_3214641_en_OM p. 117 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3214641_en_OM p. 150 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc450-2020-fx450-2020-450sxf-2020-450xcf-2020`

Bikes: KTM 450 SX-F 2020, KTM 450 XC-F 2020, Husqvarna FC 450 2020, Husqvarna FX 450 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3214032_en_OM p. 36; 20_3402354_en_OM p. 37 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3214032_en_OM p. 112; 20_3402354_en_OM p. 121 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3214032_en_OM p. 112; 20_3402354_en_OM p. 121 |
| Coolant quantity for a change | 1.20 l (1.27 US qt) | 20_3214032_en_OM p. 114; 20_3402354_en_OM p. 123 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3214032_en_OM p. 114; 20_3402354_en_OM p. 122 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3214032_en_OM p. 148; 20_3402354_en_OM p. 155 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc450-2021-2022-fx450-2021-2022-450sxf-2021-2022-450xcf-2021-2022`

Bikes: KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3214217_en_OM p. 36; 22_3214418_en_OM p. 35; 21_3402445_en_OM p. 38; 22_3402535_en_OM p. 36 |
| Coolant change interval | at least every 48 months | 21_3214217_en_OM p. 36; 22_3214418_en_OM p. 35; 21_3402445_en_OM p. 38; 22_3402535_en_OM p. 36 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3214217_en_OM p. 112; 22_3214418_en_OM p. 105; 21_3402445_en_OM p. 123; 22_3402535_en_OM p. 109 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 21_3214217_en_OM p. 112; 22_3214418_en_OM p. 105; 21_3402445_en_OM p. 123; 22_3402535_en_OM p. 109 |
| Coolant quantity for a change | 1.20 l (1.27 US qt) | 21_3214217_en_OM p. 114; 22_3214418_en_OM p. 107; 21_3402445_en_OM p. 125; 22_3402535_en_OM p. 111 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3214217_en_OM p. 114; 22_3214418_en_OM p. 107; 21_3402445_en_OM p. 124; 22_3402535_en_OM p. 110 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3214217_en_OM p. 150; 22_3214418_en_OM p. 139; 21_3402445_en_OM p. 160; 22_3402535_en_OM p. 143 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc250-2023-fc350-2023-2024`

Bikes: Husqvarna FC 250 2023, Husqvarna FC 350 2023, Husqvarna FC 350 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3402631_en_OM p. 35; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3402631_en_OM p. 35; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36 |
| Coolant change interval | at least every 24 months | 23_3402631_en_OM p. 35; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3402631_en_OM p. 108; 23_3402632_en_OM p. 111; 24_3402714_en_OM p. 111 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 23_3402631_en_OM p. 108; 23_3402632_en_OM p. 111; 24_3402714_en_OM p. 111 |
| Coolant quantity for a change | 0.90 l (0.95 US qt) | 23_3402631_en_OM p. 111; 23_3402632_en_OM p. 114; 24_3402714_en_OM p. 114 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 23_3402631_en_OM p. 110; 23_3402632_en_OM p. 113; 24_3402714_en_OM p. 113 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3402631_en_OM p. 141; 23_3402632_en_OM p. 145; 24_3402714_en_OM p. 146 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc250-2025-fc350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40 |
| Coolant change interval | at least every 24 months | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40 |
| Coolant level above the radiator fins | 10 mm | 25_3402803_en_BA p. 113; 25_3402804_en_BA p. 115 |
| Antifreeze check range | -25 to -45 °C | 25_3402803_en_BA p. 113; 25_3402804_en_BA p. 115 |
| Coolant quantity for a change | 0.90 l | 25_3402803_en_BA p. 115; 25_3402804_en_BA p. 117 |
| Torque, water pump cover drain screw (M6) | 10 N·m | 25_3402803_en_BA p. 115; 25_3402804_en_BA p. 118 |
| Coolant antifreeze protection, at least | -25 °C | 25_3402803_en_BA p. 113; 25_3402804_en_BA p. 115 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fc250-2027-fc350-2027`

Bikes: Husqvarna FC 250 2027, Husqvarna FC 350 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 27_3402945_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Antifreeze and coolant level check interval | every 45 operating hours | 27_3402945_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Coolant change interval | at least every 24 months | 27_3402945_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 27_3402945_en_BA p. 119; 27_3402947_en_BA p. 125 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 27_3402945_en_BA p. 119; 27_3402947_en_BA p. 125 |
| Coolant quantity for a change | 0.90 l (0.238 US gal) | 27_3402945_en_BA p. 122; 27_3402947_en_BA p. 128 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 27_3402945_en_BA p. 121; 27_3402947_en_BA p. 127 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 27_3402945_en_BA p. 146; 27_3402947_en_BA p. 152 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fx350-2024`

Bikes: Husqvarna FX 350 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 24_3402714_en_OM p. 36 |
| Antifreeze and coolant level check interval | every 45 operating hours | 24_3402714_en_OM p. 36 |
| Coolant change interval | at least every 24 months | 24_3402714_en_OM p. 36 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 24_3402714_en_OM p. 111 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 24_3402714_en_OM p. 111 |
| Coolant quantity for a change | 0.90 l (0.95 US qt) | 24_3402714_en_OM p. 114 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 24_3402714_en_OM p. 113 |
| Guard to remove before draining | engine guard | 24_3402714_en_OM p. 113 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 24_3402714_en_OM p. 146 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fx350-2025`

Bikes: Husqvarna FX 350 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3402804_en_BA p. 40 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3402804_en_BA p. 40 |
| Coolant change interval | at least every 24 months | 25_3402804_en_BA p. 40 |
| Coolant level above the radiator fins | 10 mm | 25_3402804_en_BA p. 115 |
| Antifreeze check range | -25 to -45 °C | 25_3402804_en_BA p. 115 |
| Coolant quantity for a change | 0.90 l | 25_3402804_en_BA p. 117 |
| Torque, water pump cover drain screw (M6) | 10 N·m | 25_3402804_en_BA p. 117 |
| Guard to remove before draining | skid plate | 25_3402804_en_BA p. 117 |
| Coolant antifreeze protection, at least | -25 °C | 25_3402804_en_BA p. 115 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-fx350-2026-2027`

Bikes: Husqvarna FX 350 2026, Husqvarna FX 350 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Coolant change interval | at least every 24 months | 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3402885_en_BA p. 117; 27_3402947_en_BA p. 125 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3402885_en_BA p. 117; 27_3402947_en_BA p. 125 |
| Coolant quantity for a change | 0.90 l (0.238 US gal) | 26_3402885_en_BA p. 120; 27_3402947_en_BA p. 128 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 26_3402885_en_BA p. 119; 27_3402947_en_BA p. 127 |
| Guard to remove before draining | skid plate | 26_3402885_en_BA p. 119; 27_3402947_en_BA p. 127 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3402885_en_BA p. 141; 27_3402947_en_BA p. 152 |

### Check, top up or change the coolant

`bak-ktmg4t-coolant-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025`

Bikes: GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Coolant change interval | at least every 24 months | 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Coolant level above the radiator fins | 10 mm | 25_3215221_en_BA p. 124; 25_3215223_en_BA p. 125 |
| Antifreeze check range | -25 to -45 °C | 25_3215221_en_BA p. 124; 25_3215223_en_BA p. 125 |
| Coolant quantity for a change | 0.95 l | 25_3215221_en_BA p. 127; 25_3215223_en_BA p. 128 |
| Torque, water pump cover drain screw (M6) | 10 N·m | 25_3215221_en_BA p. 126; 25_3215223_en_BA p. 129 |
| Coolant antifreeze protection, at least | -25 °C | 25_3215221_en_BA p. 125; 25_3215223_en_BA p. 126 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg4t-clutch-fluid-v1-ex250f-2021-2023-and-more-d4e3ddb0`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 450F 2023, GasGas EX 450F 2023, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 10 operating hours and after every race | 20_3214129_en_OM p. 34; 21_3214213_en_OM p. 34; 22_3214414_en_OM p. 34; 20_3214004_en_OM p. 34; 21_3214215_en_OM p. 35; 22_3214417_en_OM p. 35; 20_3214032_en_OM p. 35; 21_3214217_en_OM p. 35; 22_3214418_en_OM p. 34; 23_3215097_en_OM p. 30; 23_3215099_en_OM p. 30; 23_3215100_en_OM p. 30; 20_3402335_en_OM p. 33; 21_3402442_en_OM p. 33; 22_3402532_en_OM p. 34; 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 22_3402534_en_OM p. 35; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37; 22_3402535_en_OM p. 35; 21_3215009_en_OM p. 30; 22_3215053_en_OM p. 30; 22_3215054_en_OM p. 30; 21_3215019_en_OM p. 29; 21_3215010_en_OM p. 30; 22_3215055_en_OM p. 34 |
| Clutch fluid change interval | at least every 12 months | 20_3214129_en_OM p. 35; 21_3214213_en_OM p. 35; 22_3214414_en_OM p. 35; 20_3214004_en_OM p. 35; 21_3214215_en_OM p. 36; 22_3214417_en_OM p. 36; 20_3214032_en_OM p. 36; 21_3214217_en_OM p. 36; 22_3214418_en_OM p. 35; 23_3215097_en_OM p. 31; 23_3215099_en_OM p. 31; 23_3215100_en_OM p. 31; 20_3402335_en_OM p. 34; 21_3402442_en_OM p. 34; 22_3402532_en_OM p. 35; 20_3402336_en_OM p. 36; 21_3402443_en_OM p. 36; 22_3402534_en_OM p. 36; 20_3402354_en_OM p. 37; 21_3402445_en_OM p. 38; 22_3402535_en_OM p. 36; 21_3215009_en_OM p. 31; 22_3215053_en_OM p. 31; 22_3215054_en_OM p. 31; 21_3215019_en_OM p. 30; 21_3215010_en_OM p. 31; 22_3215055_en_OM p. 35 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 20_3214129_en_OM p. 82; 21_3214213_en_OM p. 85; 22_3214414_en_OM p. 79; 20_3214004_en_OM p. 79; 21_3214215_en_OM p. 86; 22_3214417_en_OM p. 86; 20_3214032_en_OM p. 86; 21_3214217_en_OM p. 86; 22_3214418_en_OM p. 80; 23_3215097_en_OM p. 74; 23_3215099_en_OM p. 74; 23_3215100_en_OM p. 73; 20_3402335_en_OM p. 76; 21_3402442_en_OM p. 77; 22_3402532_en_OM p. 79; 20_3402336_en_OM p. 81; 21_3402443_en_OM p. 83; 22_3402534_en_OM p. 83; 20_3402354_en_OM p. 88; 21_3402445_en_OM p. 90; 22_3402535_en_OM p. 82; 21_3215009_en_OM p. 74; 22_3215053_en_OM p. 74; 22_3215054_en_OM p. 74; 21_3215019_en_OM p. 70; 21_3215010_en_OM p. 73; 22_3215055_en_OM p. 83 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 20_3214129_en_OM p. 82; 21_3214213_en_OM p. 85; 22_3214414_en_OM p. 79; 20_3214004_en_OM p. 79; 21_3214215_en_OM p. 86; 22_3214417_en_OM p. 86; 20_3214032_en_OM p. 86; 21_3214217_en_OM p. 86; 22_3214418_en_OM p. 80; 23_3215097_en_OM p. 74; 23_3215099_en_OM p. 74; 23_3215100_en_OM p. 73; 20_3402335_en_OM p. 76; 21_3402442_en_OM p. 77; 22_3402532_en_OM p. 79; 20_3402336_en_OM p. 81; 21_3402443_en_OM p. 83; 22_3402534_en_OM p. 83; 20_3402354_en_OM p. 88; 21_3402445_en_OM p. 90; 22_3402535_en_OM p. 82; 21_3215009_en_OM p. 74; 22_3215053_en_OM p. 74; 22_3215054_en_OM p. 74; 21_3215019_en_OM p. 70; 21_3215010_en_OM p. 73; 22_3215055_en_OM p. 83 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg4t-clutch-fluid-v1-ex250f-2024-and-more-80204c18`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, KTM 450 SX-F 2026, KTM 450 XC-F 2026, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FC 450 2023, Husqvarna FX 450 2023, Husqvarna FC 450 2024, Husqvarna FX 450 2024, Husqvarna FC 450 2025, Husqvarna FX 450 2025, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 250F 2026, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2024, GasGas EX 450F 2024, GasGas MC 450F 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 23_3214640_en_OM p. 34; 24_3214834_en_OM p. 39; 25_3240043_en_OM p. 38; 26_3240234_en_BA p. 43; 23_3214641_en_OM p. 36; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37; 23_3214642_en_OM p. 35; 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 26_3240236_en_BA p. 41; 23_3402631_en_OM p. 34; 24_3402713_en_OM p. 35; 23_3402632_en_OM p. 35; 24_3402714_en_OM p. 35; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37; 25_3402805_en_BA p. 41; 24_3215160_en_OM p. 35; 26_3215268_en_BA p. 31; 24_3215161_en_OM p. 30; 25_3215222_en_BA p. 34; 24_3215162_en_OM p. 34; 26_3215269_en_BA p. 31 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 23_3214640_en_OM p. 34; 24_3214834_en_OM p. 39; 25_3240043_en_OM p. 38; 26_3240234_en_BA p. 43; 23_3214641_en_OM p. 36; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37; 23_3214642_en_OM p. 35; 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 26_3240236_en_BA p. 41; 23_3402631_en_OM p. 34; 24_3402713_en_OM p. 35; 23_3402632_en_OM p. 35; 24_3402714_en_OM p. 35; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37; 25_3402805_en_BA p. 41; 24_3215160_en_OM p. 35; 26_3215268_en_BA p. 31; 24_3215161_en_OM p. 30; 25_3215222_en_BA p. 34; 24_3215162_en_OM p. 34; 26_3215269_en_BA p. 31 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 23_3214640_en_OM p. 79; 24_3214834_en_OM p. 92; 25_3240043_en_OM p. 88; 26_3240234_en_BA p. 109; 23_3214641_en_OM p. 89; 24_3214835_en_OM p. 91; 25_3240044_en_OM p. 91; 23_3214642_en_OM p. 90; 24_3214836_en_OM p. 95; 25_3240045_en_OM p. 92; 26_3240236_en_BA p. 108; 23_3402631_en_OM p. 81; 24_3402713_en_OM p. 87; 23_3402632_en_OM p. 84; 24_3402714_en_OM p. 84; 23_3402633_en_OM p. 93; 24_3402715_en_OM p. 96; 25_3402805_en_BA p. 94; 24_3215160_en_OM p. 87; 26_3215268_en_BA p. 80; 24_3215161_en_OM p. 76; 25_3215222_en_BA p. 85; 24_3215162_en_OM p. 85; 26_3215269_en_BA p. 78 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 23_3214640_en_OM p. 79; 24_3214834_en_OM p. 92; 25_3240043_en_OM p. 88; 26_3240234_en_BA p. 109; 23_3214641_en_OM p. 89; 24_3214835_en_OM p. 91; 25_3240044_en_OM p. 91; 23_3214642_en_OM p. 90; 24_3214836_en_OM p. 95; 25_3240045_en_OM p. 92; 26_3240236_en_BA p. 108; 23_3402631_en_OM p. 81; 24_3402713_en_OM p. 87; 23_3402632_en_OM p. 84; 24_3402714_en_OM p. 84; 23_3402633_en_OM p. 93; 24_3402715_en_OM p. 96; 25_3402805_en_BA p. 94; 24_3215160_en_OM p. 87; 26_3215268_en_BA p. 80; 24_3215161_en_OM p. 76; 25_3215222_en_BA p. 85; 24_3215162_en_OM p. 85; 26_3215269_en_BA p. 79 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg4t-clutch-fluid-v1-mc250f-2027-and-more-597467ef`

Bikes: KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2027, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2027, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 27_3240381_en_BA p. 42; 26_3240235_en_BA p. 42; 27_3240383_en_BA p. 41; 27_3240384_en_BA p. 42; 27_3402945_en_BA p. 39; 26_3402885_en_BA p. 39; 27_3402947_en_BA p. 41; 27_3402948_en_BA p. 41; 27_3215290_en_BA p. 31; 27_3215291_en_BA p. 31 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 27_3240381_en_BA p. 42; 26_3240235_en_BA p. 42; 27_3240383_en_BA p. 41; 27_3240384_en_BA p. 42; 27_3402945_en_BA p. 39; 26_3402885_en_BA p. 39; 27_3402947_en_BA p. 41; 27_3402948_en_BA p. 41; 27_3215290_en_BA p. 31; 27_3215291_en_BA p. 31 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 27_3240381_en_BA p. 96; 26_3240235_en_BA p. 99; 27_3240383_en_BA p. 94; 27_3240384_en_BA p. 96; 27_3402945_en_BA p. 92; 26_3402885_en_BA p. 89; 27_3402947_en_BA p. 97; 27_3402948_en_BA p. 97; 27_3215290_en_BA p. 81; 27_3215291_en_BA p. 79 |
| Clutch fluid type | DOT 5.1 | 27_3240381_en_BA p. 96; 26_3240235_en_BA p. 99; 27_3240383_en_BA p. 94; 27_3240384_en_BA p. 96; 27_3402945_en_BA p. 92; 26_3402885_en_BA p. 89; 27_3402947_en_BA p. 97; 27_3402948_en_BA p. 97; 27_3215290_en_BA p. 81; 27_3215291_en_BA p. 80 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg4t-clutch-fluid-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 25_3402803_en_BA p. 37; 25_3402804_en_BA p. 39; 25_3215221_en_BA p. 39; 25_3215223_en_BA p. 39 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 25_3402803_en_BA p. 37; 25_3402804_en_BA p. 39; 25_3215221_en_BA p. 39; 25_3215223_en_BA p. 39 |
| Clutch fluid level below the reservoir rim | 4 mm | 25_3402803_en_BA p. 86; 25_3402804_en_BA p. 88; 25_3215221_en_BA p. 95; 25_3215223_en_BA p. 96 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 25_3402803_en_BA p. 86; 25_3402804_en_BA p. 88; 25_3215221_en_BA p. 95; 25_3215223_en_BA p. 96 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex250f-2021-2023-and-more-42d6aa04`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 450 SX-F 2020, KTM 450 XC-F 2020, GasGas MC 250F 2023, GasGas EX 250F 2023, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3214129_en_OM p. 34; 20_3214004_en_OM p. 34; 20_3214032_en_OM p. 35; 23_3215097_en_OM p. 30; 20_3402335_en_OM p. 33; 21_3402442_en_OM p. 33; 22_3402532_en_OM p. 34; 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37; 21_3215009_en_OM p. 30; 22_3215053_en_OM p. 30; 21_3215019_en_OM p. 29; 21_3215010_en_OM p. 30; 22_3215055_en_OM p. 34 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 20_3214129_en_OM p. 34; 20_3214004_en_OM p. 34; 20_3214032_en_OM p. 35; 23_3215097_en_OM p. 30; 20_3402335_en_OM p. 33; 21_3402442_en_OM p. 33; 22_3402532_en_OM p. 34; 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37; 21_3215009_en_OM p. 30; 22_3215053_en_OM p. 30; 21_3215019_en_OM p. 29; 21_3215010_en_OM p. 30; 22_3215055_en_OM p. 34 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3214129_en_OM p. 76; 20_3214004_en_OM p. 73; 20_3214032_en_OM p. 80; 23_3215097_en_OM p. 68; 20_3402335_en_OM p. 71; 21_3402442_en_OM p. 71; 22_3402532_en_OM p. 73; 20_3402336_en_OM p. 75; 21_3402443_en_OM p. 77; 20_3402354_en_OM p. 82; 21_3402445_en_OM p. 84; 21_3215009_en_OM p. 68; 22_3215053_en_OM p. 68; 21_3215019_en_OM p. 64; 21_3215010_en_OM p. 67; 22_3215055_en_OM p. 77 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3214129_en_OM p. 77; 20_3214004_en_OM p. 74; 20_3214032_en_OM p. 81; 23_3215097_en_OM p. 69; 20_3402335_en_OM p. 72; 21_3402442_en_OM p. 72; 22_3402532_en_OM p. 74; 20_3402336_en_OM p. 76; 21_3402443_en_OM p. 78; 20_3402354_en_OM p. 83; 21_3402445_en_OM p. 85; 21_3215009_en_OM p. 69; 22_3215053_en_OM p. 69; 21_3215019_en_OM p. 65; 21_3215010_en_OM p. 68; 22_3215055_en_OM p. 78 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3214129_en_OM p. 78; 20_3214004_en_OM p. 75; 20_3214032_en_OM p. 82; 23_3215097_en_OM p. 70; 20_3402335_en_OM p. 72; 21_3402442_en_OM p. 73; 22_3402532_en_OM p. 75; 20_3402336_en_OM p. 77; 21_3402443_en_OM p. 79; 20_3402354_en_OM p. 84; 21_3402445_en_OM p. 86; 21_3215009_en_OM p. 70; 22_3215053_en_OM p. 70; 21_3215019_en_OM p. 66; 21_3215010_en_OM p. 69; 22_3215055_en_OM p. 79 |
| Number of chain rollers measured | 18 | 20_3214129_en_OM p. 78; 20_3214004_en_OM p. 75; 20_3214032_en_OM p. 82; 23_3215097_en_OM p. 70; 20_3402335_en_OM p. 72; 21_3402442_en_OM p. 73; 22_3402532_en_OM p. 75; 20_3402336_en_OM p. 77; 21_3402443_en_OM p. 79; 20_3402354_en_OM p. 84; 21_3402445_en_OM p. 86; 21_3215009_en_OM p. 70; 22_3215053_en_OM p. 70; 21_3215019_en_OM p. 66; 21_3215010_en_OM p. 69; 22_3215055_en_OM p. 79 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3214129_en_OM p. 78; 20_3214004_en_OM p. 75; 20_3214032_en_OM p. 82; 23_3215097_en_OM p. 70; 20_3402335_en_OM p. 72; 21_3402442_en_OM p. 73; 22_3402532_en_OM p. 75; 20_3402336_en_OM p. 77; 21_3402443_en_OM p. 79; 20_3402354_en_OM p. 84; 21_3402445_en_OM p. 86; 21_3215009_en_OM p. 70; 22_3215053_en_OM p. 70; 21_3215019_en_OM p. 66; 21_3215010_en_OM p. 69; 22_3215055_en_OM p. 79 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 20_3214129_en_OM p. 79; 20_3214004_en_OM p. 76; 20_3214032_en_OM p. 83; 23_3215097_en_OM p. 71; 20_3402335_en_OM p. 73; 21_3402442_en_OM p. 74; 22_3402532_en_OM p. 76; 20_3402336_en_OM p. 78; 21_3402443_en_OM p. 80; 20_3402354_en_OM p. 85; 21_3402445_en_OM p. 87; 21_3215009_en_OM p. 71; 22_3215053_en_OM p. 71; 21_3215019_en_OM p. 67; 21_3215010_en_OM p. 70; 22_3215055_en_OM p. 80 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 20_3214129_en_OM p. 79; 20_3214004_en_OM p. 76; 20_3214032_en_OM p. 82; 23_3215097_en_OM p. 71; 20_3402335_en_OM p. 73; 21_3402442_en_OM p. 73; 22_3402532_en_OM p. 75; 20_3402336_en_OM p. 77; 21_3402443_en_OM p. 79; 20_3402354_en_OM p. 85; 21_3402445_en_OM p. 86; 21_3215009_en_OM p. 71; 22_3215053_en_OM p. 71; 21_3215019_en_OM p. 67; 21_3215010_en_OM p. 70; 22_3215055_en_OM p. 79 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 20_3214129_en_OM p. 79; 20_3214004_en_OM p. 76; 20_3214032_en_OM p. 83; 23_3215097_en_OM p. 71; 20_3402335_en_OM p. 73; 21_3402442_en_OM p. 74; 22_3402532_en_OM p. 76; 20_3402336_en_OM p. 78; 21_3402443_en_OM p. 80; 20_3402354_en_OM p. 85; 21_3402445_en_OM p. 87; 21_3215009_en_OM p. 71; 22_3215053_en_OM p. 71; 21_3215019_en_OM p. 67; 21_3215010_en_OM p. 70; 22_3215055_en_OM p. 80 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 20_3214129_en_OM p. 80; 20_3214004_en_OM p. 77; 20_3214032_en_OM p. 83; 23_3215097_en_OM p. 72; 20_3402335_en_OM p. 74; 21_3402442_en_OM p. 74; 22_3402532_en_OM p. 76; 20_3402336_en_OM p. 78; 21_3402443_en_OM p. 80; 20_3402354_en_OM p. 86; 21_3402445_en_OM p. 87; 21_3215009_en_OM p. 72; 22_3215053_en_OM p. 72; 21_3215019_en_OM p. 68; 21_3215010_en_OM p. 71; 22_3215055_en_OM p. 80 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-fc350-2022-and-more-3b1ecb88`

Bikes: KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 450 SX-F 2021, KTM 450 XC-F 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2022, Husqvarna FX 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3214213_en_OM p. 34; 22_3214414_en_OM p. 34; 21_3214215_en_OM p. 35; 21_3214217_en_OM p. 35; 22_3402534_en_OM p. 35; 22_3402535_en_OM p. 35 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 21_3214213_en_OM p. 34; 22_3214414_en_OM p. 34; 21_3214215_en_OM p. 35; 21_3214217_en_OM p. 35; 22_3402534_en_OM p. 35; 22_3402535_en_OM p. 35 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 21_3214213_en_OM p. 79; 22_3214414_en_OM p. 73; 21_3214215_en_OM p. 80; 21_3214217_en_OM p. 80; 22_3402534_en_OM p. 77; 22_3402535_en_OM p. 76 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 21_3214213_en_OM p. 80; 22_3214414_en_OM p. 74; 21_3214215_en_OM p. 81; 21_3214217_en_OM p. 81; 22_3402534_en_OM p. 78; 22_3402535_en_OM p. 77 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 21_3214213_en_OM p. 81; 22_3214414_en_OM p. 75; 21_3214215_en_OM p. 82; 21_3214217_en_OM p. 82; 22_3402534_en_OM p. 79; 22_3402535_en_OM p. 78 |
| Number of chain rollers measured | 18 | 21_3214213_en_OM p. 81; 22_3214414_en_OM p. 75; 21_3214215_en_OM p. 82; 21_3214217_en_OM p. 82; 22_3402534_en_OM p. 79; 22_3402535_en_OM p. 78 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 21_3214213_en_OM p. 81; 22_3214414_en_OM p. 75; 21_3214215_en_OM p. 82; 21_3214217_en_OM p. 82; 22_3402534_en_OM p. 79; 22_3402535_en_OM p. 78 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 21_3214213_en_OM p. 82; 22_3214414_en_OM p. 76; 21_3214215_en_OM p. 83; 21_3214217_en_OM p. 83; 22_3402534_en_OM p. 80; 22_3402535_en_OM p. 79 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 21_3214213_en_OM p. 81; 22_3214414_en_OM p. 76; 21_3214215_en_OM p. 82; 21_3214217_en_OM p. 82; 22_3402534_en_OM p. 79; 22_3402535_en_OM p. 79 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 21_3214213_en_OM p. 82; 22_3214414_en_OM p. 76; 21_3214215_en_OM p. 83; 21_3214217_en_OM p. 83; 22_3402534_en_OM p. 80; 22_3402535_en_OM p. 79 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 21_3214213_en_OM p. 82; 22_3214414_en_OM p. 77; 21_3214215_en_OM p. 83; 21_3214217_en_OM p. 83; 22_3402534_en_OM p. 80; 22_3402535_en_OM p. 80 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex250f-2024-and-more-92720ea3`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FC 450 2024, Husqvarna FX 450 2024, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 450F 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214640_en_OM p. 35; 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 23_3214641_en_OM p. 37; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402631_en_OM p. 35; 24_3402713_en_OM p. 36; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36; 24_3402715_en_OM p. 38; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 23_3214640_en_OM p. 35; 24_3214834_en_OM p. 40; 25_3240043_en_OM p. 39; 23_3214641_en_OM p. 37; 24_3214835_en_OM p. 38; 25_3240044_en_OM p. 38; 23_3214642_en_OM p. 36; 24_3214836_en_OM p. 39; 25_3240045_en_OM p. 38; 23_3402631_en_OM p. 35; 24_3402713_en_OM p. 36; 23_3402632_en_OM p. 36; 24_3402714_en_OM p. 36; 24_3402715_en_OM p. 38; 24_3215160_en_OM p. 36; 24_3215161_en_OM p. 31; 24_3215162_en_OM p. 35 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 23_3214640_en_OM p. 72; 24_3214834_en_OM p. 85; 25_3240043_en_OM p. 81; 23_3214641_en_OM p. 82; 24_3214835_en_OM p. 84; 25_3240044_en_OM p. 84; 23_3214642_en_OM p. 83; 24_3214836_en_OM p. 88; 25_3240045_en_OM p. 85; 23_3402631_en_OM p. 74; 24_3402713_en_OM p. 80; 23_3402632_en_OM p. 77; 24_3402714_en_OM p. 77; 24_3402715_en_OM p. 89; 24_3215160_en_OM p. 80; 24_3215161_en_OM p. 70; 24_3215162_en_OM p. 78 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 23_3214640_en_OM p. 73; 24_3214834_en_OM p. 86; 25_3240043_en_OM p. 82; 23_3214641_en_OM p. 83; 24_3214835_en_OM p. 85; 25_3240044_en_OM p. 85; 23_3214642_en_OM p. 84; 24_3214836_en_OM p. 89; 25_3240045_en_OM p. 86; 23_3402631_en_OM p. 75; 24_3402713_en_OM p. 81; 23_3402632_en_OM p. 78; 24_3402714_en_OM p. 78; 24_3402715_en_OM p. 90; 24_3215160_en_OM p. 81; 24_3215161_en_OM p. 71; 24_3215162_en_OM p. 79 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3214640_en_OM p. 74; 24_3214834_en_OM p. 87; 25_3240043_en_OM p. 83; 23_3214641_en_OM p. 84; 24_3214835_en_OM p. 86; 25_3240044_en_OM p. 86; 23_3214642_en_OM p. 85; 24_3214836_en_OM p. 90; 25_3240045_en_OM p. 87; 23_3402631_en_OM p. 76; 24_3402713_en_OM p. 82; 23_3402632_en_OM p. 79; 24_3402714_en_OM p. 79; 24_3402715_en_OM p. 91; 24_3215160_en_OM p. 82; 24_3215161_en_OM p. 72; 24_3215162_en_OM p. 80 |
| Number of chain rollers measured | 18 | 23_3214640_en_OM p. 74; 24_3214834_en_OM p. 87; 25_3240043_en_OM p. 83; 23_3214641_en_OM p. 84; 24_3214835_en_OM p. 86; 25_3240044_en_OM p. 86; 23_3214642_en_OM p. 85; 24_3214836_en_OM p. 90; 25_3240045_en_OM p. 87; 23_3402631_en_OM p. 76; 24_3402713_en_OM p. 82; 23_3402632_en_OM p. 79; 24_3402714_en_OM p. 79; 24_3402715_en_OM p. 91; 24_3215160_en_OM p. 82; 24_3215161_en_OM p. 72; 24_3215162_en_OM p. 80 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3214640_en_OM p. 74; 24_3214834_en_OM p. 87; 25_3240043_en_OM p. 83; 23_3214641_en_OM p. 84; 24_3214835_en_OM p. 86; 25_3240044_en_OM p. 86; 23_3214642_en_OM p. 85; 24_3214836_en_OM p. 90; 25_3240045_en_OM p. 87; 23_3402631_en_OM p. 76; 24_3402713_en_OM p. 82; 23_3402632_en_OM p. 79; 24_3402714_en_OM p. 79; 24_3402715_en_OM p. 91; 24_3215160_en_OM p. 82; 24_3215161_en_OM p. 72; 24_3215162_en_OM p. 80 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 23_3214640_en_OM p. 75; 24_3214834_en_OM p. 88; 25_3240043_en_OM p. 84; 23_3214641_en_OM p. 85; 24_3214835_en_OM p. 87; 25_3240044_en_OM p. 87; 23_3214642_en_OM p. 86; 24_3214836_en_OM p. 91; 25_3240045_en_OM p. 88; 23_3402631_en_OM p. 77; 24_3402713_en_OM p. 83; 23_3402632_en_OM p. 80; 24_3402714_en_OM p. 80; 24_3402715_en_OM p. 92; 24_3215160_en_OM p. 83; 24_3215161_en_OM p. 73; 24_3215162_en_OM p. 81 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 23_3214640_en_OM p. 76; 24_3214834_en_OM p. 88; 25_3240043_en_OM p. 84; 23_3214641_en_OM p. 85; 24_3214835_en_OM p. 87; 25_3240044_en_OM p. 87; 23_3214642_en_OM p. 86; 24_3214836_en_OM p. 92; 25_3240045_en_OM p. 89; 23_3402631_en_OM p. 78; 24_3402713_en_OM p. 83; 23_3402632_en_OM p. 81; 24_3402714_en_OM p. 81; 24_3402715_en_OM p. 92; 24_3215160_en_OM p. 83; 24_3215161_en_OM p. 74; 24_3215162_en_OM p. 81 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-250sxf-2026-250xcf-2026-350sxf-2026-450sxf-2026-450xcf-2026`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 350 SX-F 2026, KTM 450 SX-F 2026, KTM 450 XC-F 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240234_en_BA p. 44; 26_3240235_en_BA p. 43; 26_3240236_en_BA p. 42 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 26_3240234_en_BA p. 44; 26_3240235_en_BA p. 43; 26_3240236_en_BA p. 42 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 26_3240234_en_BA p. 102; 26_3240235_en_BA p. 92; 26_3240236_en_BA p. 101 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 26_3240234_en_BA p. 103; 26_3240235_en_BA p. 93; 26_3240236_en_BA p. 102 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 26_3240234_en_BA p. 104; 26_3240235_en_BA p. 94; 26_3240236_en_BA p. 103 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 26_3240234_en_BA p. 104; 26_3240235_en_BA p. 94; 26_3240236_en_BA p. 103 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 26_3240234_en_BA p. 105; 26_3240235_en_BA p. 95; 26_3240236_en_BA p. 104 |
| Torque, screws of the chain slider | 6 N·m (4.4 lbf·ft) | 26_3240234_en_BA p. 104; 26_3240235_en_BA p. 94; 26_3240236_en_BA p. 104 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 26_3240234_en_BA p. 105; 26_3240235_en_BA p. 95; 26_3240236_en_BA p. 104 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 26_3240234_en_BA p. 105; 26_3240235_en_BA p. 95; 26_3240236_en_BA p. 105 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex350f-2025-and-more-373fe72d`

Bikes: KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2027, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2025, Husqvarna FX 450 2025, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240381_en_BA p. 43; 27_3240384_en_BA p. 43; 27_3402945_en_BA p. 40; 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 27_3240381_en_BA p. 43; 27_3240384_en_BA p. 43; 27_3402945_en_BA p. 40; 26_3402885_en_BA p. 40; 27_3402947_en_BA p. 42; 25_3402805_en_BA p. 42; 27_3402948_en_BA p. 42; 26_3215268_en_BA p. 32; 27_3215290_en_BA p. 32; 25_3215222_en_BA p. 35; 26_3215269_en_BA p. 32; 27_3215291_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 27_3240381_en_BA p. 89; 27_3240384_en_BA p. 89; 27_3402945_en_BA p. 85; 26_3402885_en_BA p. 82; 27_3402947_en_BA p. 90; 25_3402805_en_BA p. 87; 27_3402948_en_BA p. 90; 26_3215268_en_BA p. 73; 27_3215290_en_BA p. 74; 25_3215222_en_BA p. 78; 26_3215269_en_BA p. 72; 27_3215291_en_BA p. 73 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 27_3240381_en_BA p. 90; 27_3240384_en_BA p. 90; 27_3402945_en_BA p. 86; 26_3402885_en_BA p. 83; 27_3402947_en_BA p. 91; 25_3402805_en_BA p. 88; 27_3402948_en_BA p. 91; 26_3215268_en_BA p. 74; 27_3215290_en_BA p. 75; 25_3215222_en_BA p. 79; 26_3215269_en_BA p. 73; 27_3215291_en_BA p. 74 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 27_3240381_en_BA p. 91; 27_3240384_en_BA p. 91; 27_3402945_en_BA p. 87; 26_3402885_en_BA p. 84; 27_3402947_en_BA p. 92; 25_3402805_en_BA p. 89; 27_3402948_en_BA p. 92; 26_3215268_en_BA p. 75; 27_3215290_en_BA p. 76; 25_3215222_en_BA p. 80; 26_3215269_en_BA p. 74; 27_3215291_en_BA p. 75 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 27_3240381_en_BA p. 91; 27_3240384_en_BA p. 91; 27_3402945_en_BA p. 87; 26_3402885_en_BA p. 84; 27_3402947_en_BA p. 92; 25_3402805_en_BA p. 89; 27_3402948_en_BA p. 92; 26_3215268_en_BA p. 75; 27_3215290_en_BA p. 76; 25_3215222_en_BA p. 80; 26_3215269_en_BA p. 74; 27_3215291_en_BA p. 75 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 27_3240381_en_BA p. 92; 27_3240384_en_BA p. 92; 27_3402945_en_BA p. 88; 26_3402885_en_BA p. 85; 27_3402947_en_BA p. 93; 25_3402805_en_BA p. 90; 27_3402948_en_BA p. 93; 26_3215268_en_BA p. 76; 27_3215290_en_BA p. 77; 25_3215222_en_BA p. 81; 26_3215269_en_BA p. 75; 27_3215291_en_BA p. 76 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 27_3240381_en_BA p. 91; 27_3240384_en_BA p. 91; 27_3402945_en_BA p. 87; 26_3402885_en_BA p. 84; 27_3402947_en_BA p. 92; 25_3402805_en_BA p. 89; 27_3402948_en_BA p. 92; 26_3215268_en_BA p. 75; 27_3215290_en_BA p. 76; 25_3215222_en_BA p. 80; 26_3215269_en_BA p. 75; 27_3215291_en_BA p. 75 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 27_3240381_en_BA p. 92; 27_3240384_en_BA p. 92; 27_3402945_en_BA p. 88; 26_3402885_en_BA p. 85; 27_3402947_en_BA p. 93; 25_3402805_en_BA p. 90; 27_3402948_en_BA p. 93; 26_3215268_en_BA p. 76; 27_3215290_en_BA p. 77; 25_3215222_en_BA p. 81; 26_3215269_en_BA p. 75; 27_3215291_en_BA p. 76 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 27_3240381_en_BA p. 92; 27_3240384_en_BA p. 92; 27_3402945_en_BA p. 88; 26_3402885_en_BA p. 85; 27_3402947_en_BA p. 93; 25_3402805_en_BA p. 90; 27_3402948_en_BA p. 93; 26_3215268_en_BA p. 76; 27_3215290_en_BA p. 77; 25_3215222_en_BA p. 81; 26_3215269_en_BA p. 76; 27_3215291_en_BA p. 76 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex350f-2022-2023-mc350f-2023-350sxf-2022-350xcf-2022-450sxf-2022-450xcf-2022`

Bikes: KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 450 SX-F 2022, KTM 450 XC-F 2022, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas EX 350F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 22_3214417_en_OM p. 35; 22_3214418_en_OM p. 34; 23_3215099_en_OM p. 30; 22_3215054_en_OM p. 30 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 22_3214417_en_OM p. 35; 22_3214418_en_OM p. 34; 23_3215099_en_OM p. 30; 22_3215054_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 22_3214417_en_OM p. 80; 22_3214418_en_OM p. 74; 23_3215099_en_OM p. 68; 22_3215054_en_OM p. 68 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 22_3214417_en_OM p. 81; 22_3214418_en_OM p. 75; 23_3215099_en_OM p. 69; 22_3215054_en_OM p. 69 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 22_3214417_en_OM p. 82; 22_3214418_en_OM p. 76; 23_3215099_en_OM p. 70; 22_3215054_en_OM p. 70 |
| Number of chain rollers measured | 18 | 22_3214417_en_OM p. 82; 22_3214418_en_OM p. 76; 23_3215099_en_OM p. 70; 22_3215054_en_OM p. 70 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 22_3214417_en_OM p. 82; 22_3214418_en_OM p. 76; 23_3215099_en_OM p. 70; 22_3215054_en_OM p. 70 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 22_3214417_en_OM p. 83; 22_3214418_en_OM p. 77; 23_3215099_en_OM p. 71; 22_3215054_en_OM p. 71 |
| Torque, screws of the chain guide (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 22_3214417_en_OM p. 83; 22_3214418_en_OM p. 77; 23_3215099_en_OM p. 72; 22_3215054_en_OM p. 72 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-350sxf-2027-350xcf-2027`

Bikes: KTM 350 SX-F 2027, KTM 350 XC-F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240383_en_BA p. 42 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 27_3240383_en_BA p. 42 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 27_3240383_en_BA p. 87 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 27_3240383_en_BA p. 88 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 27_3240383_en_BA p. 89 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 27_3240383_en_BA p. 89 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 27_3240383_en_BA p. 90 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 27_3240383_en_BA p. 89 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 27_3240383_en_BA p. 90 |
| Torque, screws of the chain guide (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 27_3240383_en_BA p. 90 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40; 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 25_3402803_en_BA p. 38; 25_3402804_en_BA p. 40; 25_3215221_en_BA p. 40; 25_3215223_en_BA p. 40 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm | 25_3402803_en_BA p. 79; 25_3402804_en_BA p. 81; 25_3215221_en_BA p. 88; 25_3215223_en_BA p. 89 |
| Torque, rear wheel spindle nut | 80 N·m | 25_3402803_en_BA p. 80; 25_3402804_en_BA p. 82; 25_3215221_en_BA p. 89; 25_3215223_en_BA p. 90 |
| Pull weight for the chain wear measurement | 10-15 kg | 25_3402803_en_BA p. 81; 25_3402804_en_BA p. 83; 25_3215221_en_BA p. 90; 25_3215223_en_BA p. 91 |
| Maximum length over the measured rollers | 272 mm | 25_3402803_en_BA p. 81; 25_3402804_en_BA p. 83; 25_3215221_en_BA p. 90; 25_3215223_en_BA p. 91 |
| Chain guide minimum thickness | 6 mm | 25_3402803_en_BA p. 82; 25_3402804_en_BA p. 84; 25_3215221_en_BA p. 91; 25_3215223_en_BA p. 92 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m | 25_3402803_en_BA p. 81; 25_3402804_en_BA p. 83; 25_3215221_en_BA p. 90; 25_3215223_en_BA p. 91 |
| Torque, screws of the chain slider | 15 N·m | 25_3402803_en_BA p. 82; 25_3402804_en_BA p. 84; 25_3215221_en_BA p. 91; 25_3215223_en_BA p. 92 |
| Torque, screws of the chain guide | 10 N·m | 25_3402803_en_BA p. 82; 25_3402804_en_BA p. 84; 25_3215221_en_BA p. 91; 25_3215223_en_BA p. 92 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-fc450-2023-fx450-2023`

Bikes: Husqvarna FC 450 2023, Husqvarna FX 450 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3402633_en_OM p. 37 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 23_3402633_en_OM p. 37 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 23_3402633_en_OM p. 86 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 23_3402633_en_OM p. 87 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3402633_en_OM p. 88 |
| Number of chain rollers measured | 18 | 23_3402633_en_OM p. 88 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3402633_en_OM p. 88 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 23_3402633_en_OM p. 89 |
| Torque, screws of the chain sliding guard | 6 N·m (4.4 lbf·ft) | 23_3402633_en_OM p. 88 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 23_3402633_en_OM p. 89 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 23_3402633_en_OM p. 89 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg4t-chain-v1-ex450f-2023-mc450f-2023`

Bikes: GasGas MC 450F 2023, GasGas EX 450F 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 23_3215100_en_OM p. 30 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 23_3215100_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 23_3215100_en_OM p. 67 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 23_3215100_en_OM p. 68 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3215100_en_OM p. 69 |
| Number of chain rollers measured | 18 | 23_3215100_en_OM p. 69 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3215100_en_OM p. 69 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 23_3215100_en_OM p. 70 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 23_3215100_en_OM p. 71 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-ex250f-2021-2023-and-more-bba55962`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 450F 2023, GasGas EX 450F 2023, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FC 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FC 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours and after every race | 20_3214129_en_OM p. 34; 21_3214213_en_OM p. 34; 22_3214414_en_OM p. 34; 20_3214004_en_OM p. 34; 21_3214215_en_OM p. 35; 22_3214417_en_OM p. 35; 20_3214032_en_OM p. 35; 21_3214217_en_OM p. 35; 22_3214418_en_OM p. 34; 23_3215097_en_OM p. 30; 23_3215099_en_OM p. 30; 23_3215100_en_OM p. 30; 20_3402335_en_OM p. 33; 21_3402442_en_OM p. 33; 22_3402532_en_OM p. 34; 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 22_3402534_en_OM p. 35; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37; 22_3402535_en_OM p. 35; 21_3215009_en_OM p. 30; 22_3215053_en_OM p. 30; 22_3215054_en_OM p. 30; 21_3215019_en_OM p. 29; 21_3215010_en_OM p. 30; 22_3215055_en_OM p. 34 |
| Brake fluid change interval | at least every 12 months | 20_3214129_en_OM p. 35; 21_3214213_en_OM p. 35; 22_3214414_en_OM p. 35; 20_3214004_en_OM p. 35; 21_3214215_en_OM p. 36; 22_3214417_en_OM p. 36; 20_3214032_en_OM p. 36; 21_3214217_en_OM p. 36; 22_3214418_en_OM p. 35; 23_3215097_en_OM p. 31; 23_3215099_en_OM p. 31; 23_3215100_en_OM p. 31; 20_3402335_en_OM p. 34; 21_3402442_en_OM p. 34; 22_3402532_en_OM p. 35; 20_3402336_en_OM p. 36; 21_3402443_en_OM p. 36; 22_3402534_en_OM p. 36; 20_3402354_en_OM p. 37; 21_3402445_en_OM p. 38; 22_3402535_en_OM p. 36; 21_3215009_en_OM p. 31; 22_3215053_en_OM p. 31; 22_3215054_en_OM p. 31; 21_3215019_en_OM p. 30; 21_3215010_en_OM p. 31; 22_3215055_en_OM p. 35 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 20_3214129_en_OM p. 85; 21_3214213_en_OM p. 88; 22_3214414_en_OM p. 82; 20_3214004_en_OM p. 82; 21_3214215_en_OM p. 89; 22_3214417_en_OM p. 89; 20_3214032_en_OM p. 89; 21_3214217_en_OM p. 89; 22_3214418_en_OM p. 83; 23_3215097_en_OM p. 77; 23_3215099_en_OM p. 77; 23_3215100_en_OM p. 76; 20_3402335_en_OM p. 79; 21_3402442_en_OM p. 80; 22_3402532_en_OM p. 82; 20_3402336_en_OM p. 84; 21_3402443_en_OM p. 86; 22_3402534_en_OM p. 86; 20_3402354_en_OM p. 91; 21_3402445_en_OM p. 93; 22_3402535_en_OM p. 85; 21_3215009_en_OM p. 77; 22_3215053_en_OM p. 77; 22_3215054_en_OM p. 77; 21_3215019_en_OM p. 73; 21_3215010_en_OM p. 76; 22_3215055_en_OM p. 85 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3214129_en_OM p. 86; 21_3214213_en_OM p. 89; 22_3214414_en_OM p. 83; 20_3214004_en_OM p. 83; 21_3214215_en_OM p. 90; 22_3214417_en_OM p. 90; 20_3214032_en_OM p. 90; 21_3214217_en_OM p. 90; 22_3214418_en_OM p. 84; 23_3215097_en_OM p. 77; 23_3215099_en_OM p. 77; 23_3215100_en_OM p. 76; 20_3402335_en_OM p. 80; 21_3402442_en_OM p. 81; 22_3402532_en_OM p. 83; 20_3402336_en_OM p. 85; 21_3402443_en_OM p. 87; 22_3402534_en_OM p. 87; 20_3402354_en_OM p. 92; 21_3402445_en_OM p. 94; 22_3402535_en_OM p. 86; 21_3215009_en_OM p. 77; 22_3215053_en_OM p. 77; 22_3215054_en_OM p. 77; 21_3215019_en_OM p. 73; 21_3215010_en_OM p. 76; 22_3215055_en_OM p. 85 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3214129_en_OM p. 86; 21_3214213_en_OM p. 89; 22_3214414_en_OM p. 83; 20_3214004_en_OM p. 83; 21_3214215_en_OM p. 90; 22_3214417_en_OM p. 90; 20_3214032_en_OM p. 90; 21_3214217_en_OM p. 90; 22_3214418_en_OM p. 84; 23_3215097_en_OM p. 77; 23_3215099_en_OM p. 77; 23_3215100_en_OM p. 76; 20_3402335_en_OM p. 80; 21_3402442_en_OM p. 81; 22_3402532_en_OM p. 83; 20_3402336_en_OM p. 85; 21_3402443_en_OM p. 87; 22_3402534_en_OM p. 87; 20_3402354_en_OM p. 92; 21_3402445_en_OM p. 94; 22_3402535_en_OM p. 86; 21_3215009_en_OM p. 78; 22_3215053_en_OM p. 78; 22_3215054_en_OM p. 78; 21_3215019_en_OM p. 74; 21_3215010_en_OM p. 77; 22_3215055_en_OM p. 86 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3214129_en_OM p. 88; 21_3214213_en_OM p. 91; 22_3214414_en_OM p. 85; 20_3214004_en_OM p. 85; 21_3214215_en_OM p. 92; 22_3214417_en_OM p. 92; 20_3214032_en_OM p. 92; 21_3214217_en_OM p. 92; 22_3214418_en_OM p. 86; 23_3215097_en_OM p. 79; 23_3215099_en_OM p. 79; 23_3215100_en_OM p. 78; 20_3402335_en_OM p. 82; 21_3402442_en_OM p. 83; 22_3402532_en_OM p. 85; 20_3402336_en_OM p. 87; 21_3402443_en_OM p. 89; 22_3402534_en_OM p. 89; 20_3402354_en_OM p. 94; 21_3402445_en_OM p. 96; 22_3402535_en_OM p. 88; 21_3215009_en_OM p. 79; 22_3215053_en_OM p. 79; 22_3215054_en_OM p. 79; 21_3215019_en_OM p. 75; 21_3215010_en_OM p. 78; 22_3215055_en_OM p. 87 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3214129_en_OM p. 88; 21_3214213_en_OM p. 91; 22_3214414_en_OM p. 85; 20_3214004_en_OM p. 85; 21_3214215_en_OM p. 92; 22_3214417_en_OM p. 92; 20_3214032_en_OM p. 92; 21_3214217_en_OM p. 92; 22_3214418_en_OM p. 86; 23_3215097_en_OM p. 79; 23_3215099_en_OM p. 79; 23_3215100_en_OM p. 78; 20_3402335_en_OM p. 82; 21_3402442_en_OM p. 83; 22_3402532_en_OM p. 85; 20_3402336_en_OM p. 87; 21_3402443_en_OM p. 89; 22_3402534_en_OM p. 89; 20_3402354_en_OM p. 94; 21_3402445_en_OM p. 96; 22_3402535_en_OM p. 88; 21_3215009_en_OM p. 79; 22_3215053_en_OM p. 79; 22_3215054_en_OM p. 79; 21_3215019_en_OM p. 75; 21_3215010_en_OM p. 78; 22_3215055_en_OM p. 87 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214129_en_OM p. 88; 21_3214213_en_OM p. 91; 22_3214414_en_OM p. 85; 20_3214004_en_OM p. 85; 21_3214215_en_OM p. 92; 22_3214417_en_OM p. 92; 20_3214032_en_OM p. 92; 21_3214217_en_OM p. 92; 22_3214418_en_OM p. 86; 23_3215097_en_OM p. 80; 23_3215099_en_OM p. 80; 23_3215100_en_OM p. 79; 20_3402335_en_OM p. 82; 21_3402442_en_OM p. 83; 22_3402532_en_OM p. 85; 20_3402336_en_OM p. 88; 21_3402443_en_OM p. 90; 22_3402534_en_OM p. 89; 20_3402354_en_OM p. 95; 21_3402445_en_OM p. 97; 22_3402535_en_OM p. 88; 21_3215009_en_OM p. 80; 22_3215053_en_OM p. 80; 22_3215054_en_OM p. 80; 21_3215019_en_OM p. 76; 21_3215010_en_OM p. 79; 22_3215055_en_OM p. 88 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214129_en_OM p. 94; 21_3214213_en_OM p. 97; 22_3214414_en_OM p. 91; 20_3214004_en_OM p. 90; 21_3214215_en_OM p. 98; 22_3214417_en_OM p. 98; 20_3214032_en_OM p. 98; 21_3214217_en_OM p. 98; 22_3214418_en_OM p. 92; 23_3215097_en_OM p. 85; 23_3215099_en_OM p. 86; 23_3215100_en_OM p. 84; 20_3402335_en_OM p. 87; 21_3402442_en_OM p. 89; 22_3402532_en_OM p. 91; 20_3402336_en_OM p. 96; 21_3402443_en_OM p. 98; 22_3402534_en_OM p. 95; 20_3402354_en_OM p. 103; 21_3402445_en_OM p. 105; 22_3402535_en_OM p. 94; 21_3215009_en_OM p. 85; 22_3215053_en_OM p. 85; 22_3215054_en_OM p. 85; 21_3215019_en_OM p. 81; 21_3215010_en_OM p. 84; 22_3215055_en_OM p. 95 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3214129_en_OM p. 91; 21_3214213_en_OM p. 94; 22_3214414_en_OM p. 88; 20_3214004_en_OM p. 88; 21_3214215_en_OM p. 95; 22_3214417_en_OM p. 95; 20_3214032_en_OM p. 95; 21_3214217_en_OM p. 95; 22_3214418_en_OM p. 89; 23_3215097_en_OM p. 83; 23_3215099_en_OM p. 83; 23_3215100_en_OM p. 82; 20_3402335_en_OM p. 85; 21_3402442_en_OM p. 86; 22_3402532_en_OM p. 88; 20_3402336_en_OM p. 92; 21_3402443_en_OM p. 94; 22_3402534_en_OM p. 92; 20_3402354_en_OM p. 99; 21_3402445_en_OM p. 101; 22_3402535_en_OM p. 91; 21_3215009_en_OM p. 82; 22_3215053_en_OM p. 82; 22_3215054_en_OM p. 82; 21_3215019_en_OM p. 78; 21_3215010_en_OM p. 81; 22_3215055_en_OM p. 92 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3214129_en_OM p. 91; 21_3214213_en_OM p. 94; 22_3214414_en_OM p. 88; 20_3214004_en_OM p. 88; 21_3214215_en_OM p. 95; 22_3214417_en_OM p. 95; 20_3214032_en_OM p. 95; 21_3214217_en_OM p. 95; 22_3214418_en_OM p. 89; 23_3215097_en_OM p. 83; 23_3215099_en_OM p. 84; 23_3215100_en_OM p. 82; 20_3402335_en_OM p. 85; 21_3402442_en_OM p. 86; 22_3402532_en_OM p. 88; 20_3402336_en_OM p. 93; 21_3402443_en_OM p. 95; 22_3402534_en_OM p. 92; 20_3402354_en_OM p. 100; 21_3402445_en_OM p. 102; 22_3402535_en_OM p. 91; 21_3215009_en_OM p. 83; 22_3215053_en_OM p. 83; 22_3215054_en_OM p. 83; 21_3215019_en_OM p. 79; 21_3215010_en_OM p. 82; 22_3215055_en_OM p. 93 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3214129_en_OM p. 91; 21_3214213_en_OM p. 94; 22_3214414_en_OM p. 88; 20_3214004_en_OM p. 88; 21_3214215_en_OM p. 95; 22_3214417_en_OM p. 95; 20_3214032_en_OM p. 95; 21_3214217_en_OM p. 95; 22_3214418_en_OM p. 89; 23_3215097_en_OM p. 83; 23_3215099_en_OM p. 84; 23_3215100_en_OM p. 82; 20_3402335_en_OM p. 85; 21_3402442_en_OM p. 87; 22_3402532_en_OM p. 89; 20_3402336_en_OM p. 93; 21_3402443_en_OM p. 95; 22_3402534_en_OM p. 93; 20_3402354_en_OM p. 100; 21_3402445_en_OM p. 102; 22_3402535_en_OM p. 92; 21_3215009_en_OM p. 83; 22_3215053_en_OM p. 83; 22_3215054_en_OM p. 83; 21_3215019_en_OM p. 79; 21_3215010_en_OM p. 82; 22_3215055_en_OM p. 93 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-fc250-2023-2024-and-more-afdf88a8`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FC 450 2023, Husqvarna FX 450 2023, Husqvarna FC 450 2024, Husqvarna FX 450 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214640_en_OM p. 34; 24_3214834_en_OM p. 39; 25_3240043_en_OM p. 38; 23_3214641_en_OM p. 36; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37; 23_3214642_en_OM p. 35; 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 23_3402631_en_OM p. 34; 24_3402713_en_OM p. 35; 23_3402632_en_OM p. 35; 24_3402714_en_OM p. 35; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 23_3214640_en_OM p. 34; 24_3214834_en_OM p. 39; 25_3240043_en_OM p. 38; 23_3214641_en_OM p. 36; 24_3214835_en_OM p. 37; 25_3240044_en_OM p. 37; 23_3214642_en_OM p. 35; 24_3214836_en_OM p. 38; 25_3240045_en_OM p. 37; 23_3402631_en_OM p. 34; 24_3402713_en_OM p. 35; 23_3402632_en_OM p. 35; 24_3402714_en_OM p. 35; 23_3402633_en_OM p. 36; 24_3402715_en_OM p. 37 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 23_3214640_en_OM p. 81; 24_3214834_en_OM p. 94; 25_3240043_en_OM p. 90; 23_3214641_en_OM p. 91; 24_3214835_en_OM p. 93; 25_3240044_en_OM p. 93; 23_3214642_en_OM p. 92; 24_3214836_en_OM p. 97; 25_3240045_en_OM p. 94; 23_3402631_en_OM p. 83; 24_3402713_en_OM p. 89; 23_3402632_en_OM p. 86; 24_3402714_en_OM p. 86; 23_3402633_en_OM p. 95; 24_3402715_en_OM p. 98 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 23_3214640_en_OM p. 82; 24_3214834_en_OM p. 95; 25_3240043_en_OM p. 91; 23_3214641_en_OM p. 92; 24_3214835_en_OM p. 94; 25_3240044_en_OM p. 94; 23_3214642_en_OM p. 93; 24_3214836_en_OM p. 98; 25_3240045_en_OM p. 95; 23_3402631_en_OM p. 84; 24_3402713_en_OM p. 90; 23_3402632_en_OM p. 87; 24_3402714_en_OM p. 87; 23_3402633_en_OM p. 95; 24_3402715_en_OM p. 98 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 23_3214640_en_OM p. 82; 24_3214834_en_OM p. 95; 25_3240043_en_OM p. 91; 23_3214641_en_OM p. 92; 24_3214835_en_OM p. 94; 25_3240044_en_OM p. 94; 23_3214642_en_OM p. 93; 24_3214836_en_OM p. 98; 25_3240045_en_OM p. 95; 23_3402631_en_OM p. 84; 24_3402713_en_OM p. 90; 23_3402632_en_OM p. 87; 24_3402714_en_OM p. 87; 23_3402633_en_OM p. 96; 24_3402715_en_OM p. 99 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 23_3214640_en_OM p. 84; 24_3214834_en_OM p. 97; 25_3240043_en_OM p. 93; 23_3214641_en_OM p. 94; 24_3214835_en_OM p. 96; 25_3240044_en_OM p. 96; 23_3214642_en_OM p. 95; 24_3214836_en_OM p. 100; 25_3240045_en_OM p. 97; 23_3402631_en_OM p. 86; 24_3402713_en_OM p. 92; 23_3402632_en_OM p. 89; 24_3402714_en_OM p. 89; 23_3402633_en_OM p. 97; 24_3402715_en_OM p. 101 |
| Brake fluid type | DOT 4 / DOT 5.1 | 23_3214640_en_OM p. 84; 24_3214834_en_OM p. 97; 25_3240043_en_OM p. 93; 23_3214641_en_OM p. 94; 24_3214835_en_OM p. 96; 25_3240044_en_OM p. 96; 23_3214642_en_OM p. 95; 24_3214836_en_OM p. 100; 25_3240045_en_OM p. 97; 23_3402631_en_OM p. 86; 24_3402713_en_OM p. 92; 23_3402632_en_OM p. 89; 24_3402714_en_OM p. 89; 23_3402633_en_OM p. 97; 24_3402715_en_OM p. 101 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3214640_en_OM p. 84; 24_3214834_en_OM p. 97; 25_3240043_en_OM p. 93; 23_3214641_en_OM p. 94; 24_3214835_en_OM p. 96; 25_3240044_en_OM p. 96; 23_3214642_en_OM p. 95; 24_3214836_en_OM p. 100; 25_3240045_en_OM p. 97; 23_3402631_en_OM p. 86; 24_3402713_en_OM p. 92; 23_3402632_en_OM p. 89; 24_3402714_en_OM p. 89; 23_3402633_en_OM p. 98; 24_3402715_en_OM p. 101 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3214640_en_OM p. 91; 24_3214834_en_OM p. 103; 25_3240043_en_OM p. 99; 23_3214641_en_OM p. 100; 24_3214835_en_OM p. 102; 25_3240044_en_OM p. 102; 23_3214642_en_OM p. 102; 24_3214836_en_OM p. 107; 25_3240045_en_OM p. 104; 23_3402631_en_OM p. 93; 24_3402713_en_OM p. 98; 23_3402632_en_OM p. 96; 24_3402714_en_OM p. 96; 23_3402633_en_OM p. 105; 24_3402715_en_OM p. 108 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 23_3214640_en_OM p. 87; 24_3214834_en_OM p. 100; 25_3240043_en_OM p. 96; 23_3214641_en_OM p. 97; 24_3214835_en_OM p. 99; 25_3240044_en_OM p. 99; 23_3214642_en_OM p. 99; 24_3214836_en_OM p. 104; 25_3240045_en_OM p. 101; 23_3402631_en_OM p. 89; 24_3402713_en_OM p. 95; 23_3402632_en_OM p. 93; 24_3402714_en_OM p. 93; 23_3402633_en_OM p. 101; 24_3402715_en_OM p. 105 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 23_3214640_en_OM p. 88; 24_3214834_en_OM p. 101; 25_3240043_en_OM p. 97; 23_3214641_en_OM p. 98; 24_3214835_en_OM p. 100; 25_3240044_en_OM p. 100; 23_3214642_en_OM p. 100; 24_3214836_en_OM p. 105; 25_3240045_en_OM p. 102; 23_3402631_en_OM p. 90; 24_3402713_en_OM p. 96; 23_3402632_en_OM p. 93; 24_3402714_en_OM p. 93; 23_3402633_en_OM p. 102; 24_3402715_en_OM p. 106 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 23_3214640_en_OM p. 88; 24_3214834_en_OM p. 101; 25_3240043_en_OM p. 97; 23_3214641_en_OM p. 98; 24_3214835_en_OM p. 100; 25_3240044_en_OM p. 100; 23_3214642_en_OM p. 100; 24_3214836_en_OM p. 105; 25_3240045_en_OM p. 102; 23_3402631_en_OM p. 90; 24_3402713_en_OM p. 96; 23_3402632_en_OM p. 93; 24_3402714_en_OM p. 93; 23_3402633_en_OM p. 102; 24_3402715_en_OM p. 106 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-ex350f-2025-and-more-5fcc2a53`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 450 SX-F 2026, KTM 450 XC-F 2026, Husqvarna FC 450 2025, Husqvarna FX 450 2025, GasGas MC 250F 2026, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240234_en_BA p. 43; 26_3240236_en_BA p. 41; 25_3402805_en_BA p. 41; 26_3215268_en_BA p. 31; 25_3215222_en_BA p. 34; 26_3215269_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3240234_en_BA p. 43; 26_3240236_en_BA p. 41; 25_3402805_en_BA p. 41; 26_3215268_en_BA p. 31; 25_3215222_en_BA p. 34; 26_3215269_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3240234_en_BA p. 111; 26_3240236_en_BA p. 110; 25_3402805_en_BA p. 96; 26_3215268_en_BA p. 82; 25_3215222_en_BA p. 87; 26_3215269_en_BA p. 81 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3240234_en_BA p. 112; 26_3240236_en_BA p. 111; 25_3402805_en_BA p. 96; 26_3215268_en_BA p. 82; 25_3215222_en_BA p. 87; 26_3215269_en_BA p. 81 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3240234_en_BA p. 112; 26_3240236_en_BA p. 111; 25_3402805_en_BA p. 96; 26_3215268_en_BA p. 82; 25_3215222_en_BA p. 87; 26_3215269_en_BA p. 81 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3240234_en_BA p. 114; 26_3240236_en_BA p. 113; 25_3402805_en_BA p. 99; 26_3215268_en_BA p. 85; 25_3215222_en_BA p. 90; 26_3215269_en_BA p. 84 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3240234_en_BA p. 114; 26_3240236_en_BA p. 113; 25_3402805_en_BA p. 99; 26_3215268_en_BA p. 85; 25_3215222_en_BA p. 90; 26_3215269_en_BA p. 84 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240234_en_BA p. 114; 26_3240236_en_BA p. 113; 25_3402805_en_BA p. 99; 26_3215268_en_BA p. 85; 25_3215222_en_BA p. 90; 26_3215269_en_BA p. 84 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240234_en_BA p. 120; 26_3240236_en_BA p. 120; 25_3402805_en_BA p. 105; 26_3215268_en_BA p. 91; 25_3215222_en_BA p. 96; 26_3215269_en_BA p. 90 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3240234_en_BA p. 117; 26_3240236_en_BA p. 117; 25_3402805_en_BA p. 102; 26_3215268_en_BA p. 88; 25_3215222_en_BA p. 93; 26_3215269_en_BA p. 87 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 26_3240234_en_BA p. 118; 26_3240236_en_BA p. 117; 25_3402805_en_BA p. 103; 26_3215268_en_BA p. 89; 25_3215222_en_BA p. 94; 26_3215269_en_BA p. 88 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 26_3240234_en_BA p. 118; 26_3240236_en_BA p. 117; 25_3402805_en_BA p. 103; 26_3215268_en_BA p. 89; 25_3215222_en_BA p. 94; 26_3215269_en_BA p. 88 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-mc250f-2027-and-more-ada14954`

Bikes: KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2027, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2027, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240381_en_BA p. 42; 26_3240235_en_BA p. 42; 27_3240383_en_BA p. 41; 27_3240384_en_BA p. 42; 27_3402945_en_BA p. 39; 27_3402947_en_BA p. 41; 27_3402948_en_BA p. 41; 27_3215290_en_BA p. 31; 27_3215291_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 27_3240381_en_BA p. 42; 26_3240235_en_BA p. 42; 27_3240383_en_BA p. 41; 27_3240384_en_BA p. 42; 27_3402945_en_BA p. 39; 27_3402947_en_BA p. 41; 27_3402948_en_BA p. 41; 27_3215290_en_BA p. 31; 27_3215291_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 27_3240381_en_BA p. 98; 26_3240235_en_BA p. 101; 27_3240383_en_BA p. 96; 27_3240384_en_BA p. 98; 27_3402945_en_BA p. 94; 27_3402947_en_BA p. 99; 27_3402948_en_BA p. 99; 27_3215290_en_BA p. 83; 27_3215291_en_BA p. 82 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 27_3240381_en_BA p. 99; 26_3240235_en_BA p. 102; 27_3240383_en_BA p. 97; 27_3240384_en_BA p. 99; 27_3402945_en_BA p. 95; 27_3402947_en_BA p. 100; 27_3402948_en_BA p. 100; 27_3215290_en_BA p. 83; 27_3215291_en_BA p. 82 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 27_3240381_en_BA p. 99; 26_3240235_en_BA p. 102; 27_3240383_en_BA p. 97; 27_3240384_en_BA p. 99; 27_3402945_en_BA p. 95; 27_3402947_en_BA p. 100; 27_3402948_en_BA p. 100; 27_3215290_en_BA p. 83; 27_3215291_en_BA p. 82 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 27_3240381_en_BA p. 101; 26_3240235_en_BA p. 104; 27_3240383_en_BA p. 99; 27_3240384_en_BA p. 101; 27_3402945_en_BA p. 97; 27_3402947_en_BA p. 102; 27_3402948_en_BA p. 102; 27_3215290_en_BA p. 86; 27_3215291_en_BA p. 85 |
| Brake fluid type | DOT 5.1 | 27_3240381_en_BA p. 101; 26_3240235_en_BA p. 104; 27_3240383_en_BA p. 99; 27_3240384_en_BA p. 101; 27_3402945_en_BA p. 97; 27_3402947_en_BA p. 102; 27_3402948_en_BA p. 102; 27_3215290_en_BA p. 86; 27_3215291_en_BA p. 85 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240381_en_BA p. 101; 26_3240235_en_BA p. 104; 27_3240383_en_BA p. 99; 27_3240384_en_BA p. 101; 27_3402945_en_BA p. 97; 27_3402947_en_BA p. 102; 27_3402948_en_BA p. 102; 27_3215290_en_BA p. 86; 27_3215291_en_BA p. 85 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240381_en_BA p. 107; 26_3240235_en_BA p. 110; 27_3240383_en_BA p. 105; 27_3240384_en_BA p. 107; 27_3402945_en_BA p. 103; 27_3402947_en_BA p. 108; 27_3402948_en_BA p. 108; 27_3215290_en_BA p. 92; 27_3215291_en_BA p. 91 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 27_3240381_en_BA p. 104; 26_3240235_en_BA p. 107; 27_3240383_en_BA p. 102; 27_3240384_en_BA p. 104; 27_3402945_en_BA p. 100; 27_3402947_en_BA p. 105; 27_3402948_en_BA p. 105; 27_3215290_en_BA p. 89; 27_3215291_en_BA p. 88 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 27_3240381_en_BA p. 105; 26_3240235_en_BA p. 108; 27_3240383_en_BA p. 103; 27_3240384_en_BA p. 105; 27_3402945_en_BA p. 101; 27_3402947_en_BA p. 106; 27_3402948_en_BA p. 106; 27_3215290_en_BA p. 90; 27_3215291_en_BA p. 89 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 27_3240381_en_BA p. 105; 26_3240235_en_BA p. 108; 27_3240383_en_BA p. 103; 27_3240384_en_BA p. 105; 27_3402945_en_BA p. 101; 27_3402947_en_BA p. 106; 27_3402948_en_BA p. 106; 27_3215290_en_BA p. 90; 27_3215291_en_BA p. 89 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402803_en_BA p. 37; 25_3402804_en_BA p. 39; 25_3215221_en_BA p. 39; 25_3215223_en_BA p. 39 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3402803_en_BA p. 37; 25_3402804_en_BA p. 39; 25_3215221_en_BA p. 39; 25_3215223_en_BA p. 39 |
| Hand brake lever free travel | at least 3 mm | 25_3402803_en_BA p. 88; 25_3402804_en_BA p. 90; 25_3215221_en_BA p. 97; 25_3215223_en_BA p. 98 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm | 25_3402803_en_BA p. 89; 25_3402804_en_BA p. 91; 25_3215221_en_BA p. 98; 25_3215223_en_BA p. 98 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3402803_en_BA p. 89; 25_3402804_en_BA p. 91; 25_3215221_en_BA p. 98; 25_3215223_en_BA p. 98 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3402803_en_BA p. 91; 25_3402804_en_BA p. 93; 25_3215221_en_BA p. 100; 25_3215223_en_BA p. 100 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3402803_en_BA p. 91; 25_3402804_en_BA p. 93; 25_3215221_en_BA p. 100; 25_3215223_en_BA p. 100 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3402803_en_BA p. 91; 25_3402804_en_BA p. 93; 25_3215221_en_BA p. 100; 25_3215223_en_BA p. 101 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3402803_en_BA p. 97; 25_3402804_en_BA p. 99; 25_3215221_en_BA p. 107; 25_3215223_en_BA p. 107 |
| Foot brake lever free travel | 3-5 mm | 25_3402803_en_BA p. 94; 25_3402804_en_BA p. 96; 25_3215221_en_BA p. 104; 25_3215223_en_BA p. 104 |
| Torque, push rod lock nut (foot brake) | 10 N·m | 25_3402803_en_BA p. 95; 25_3402804_en_BA p. 97; 25_3215221_en_BA p. 105; 25_3215223_en_BA p. 105 |
| Torque, foot brake lever stop nut | 20 N·m | 25_3402803_en_BA p. 95; 25_3402804_en_BA p. 97; 25_3215221_en_BA p. 105; 25_3215223_en_BA p. 105 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-fx350-2026`

Bikes: Husqvarna FX 350 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3402885_en_BA p. 39 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3402885_en_BA p. 39 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3402885_en_BA p. 91 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3402885_en_BA p. 92 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3402885_en_BA p. 92 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3402885_en_BA p. 94 |
| Brake fluid type | DOT 5.1 | 26_3402885_en_BA p. 94 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402885_en_BA p. 94 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402885_en_BA p. 100 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3402885_en_BA p. 97 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 26_3402885_en_BA p. 98 |
| Torque, foot brake lever stop nut | 25 N·m (18.4 lbf·ft) | 26_3402885_en_BA p. 98 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-ex250f-2024-ex350f-2024-mc250f-2024-mc350f-2024`

Bikes: GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2024, GasGas EX 350F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3215160_en_OM p. 35; 24_3215161_en_OM p. 30 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 24_3215160_en_OM p. 35; 24_3215161_en_OM p. 30 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 24_3215160_en_OM p. 89; 24_3215161_en_OM p. 79 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 24_3215160_en_OM p. 89; 24_3215161_en_OM p. 79 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 24_3215160_en_OM p. 89; 24_3215161_en_OM p. 79 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 24_3215160_en_OM p. 91; 24_3215161_en_OM p. 81 |
| Brake fluid type | DOT 4 / DOT 5.1 | 24_3215160_en_OM p. 91; 24_3215161_en_OM p. 81 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3215160_en_OM p. 92; 24_3215161_en_OM p. 82 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3215160_en_OM p. 97; 24_3215161_en_OM p. 87 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 24_3215160_en_OM p. 95; 24_3215161_en_OM p. 85 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 24_3215160_en_OM p. 95; 24_3215161_en_OM p. 85 |
| Torque, foot brake lever stop nut | 45 N·m (33.2 lbf·ft) | 24_3215160_en_OM p. 95; 24_3215161_en_OM p. 85 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-ex450f-2024-mc450f-2024`

Bikes: GasGas MC 450F 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3215162_en_OM p. 34 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 24_3215162_en_OM p. 34 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 24_3215162_en_OM p. 87 |
| Front brake disc wear limit (minimum thickness) | 3.0 mm (0.118 in) | 24_3215162_en_OM p. 87 |
| Rear brake disc wear limit (minimum thickness) | 4.3 mm (0.169 in) | 24_3215162_en_OM p. 87 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 24_3215162_en_OM p. 89 |
| Brake fluid type | DOT 4 / DOT 5.1 | 24_3215162_en_OM p. 89 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3215162_en_OM p. 90 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3215162_en_OM p. 95 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 24_3215162_en_OM p. 93 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 24_3215162_en_OM p. 93 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 24_3215162_en_OM p. 93 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg4t-brakes-v1-fx350-2020-2021-fx450-2020-2021`

Bikes: Husqvarna FX 350 2020, Husqvarna FX 350 2021, Husqvarna FX 450 2020, Husqvarna FX 450 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours and after every race | 20_3402336_en_OM p. 35; 21_3402443_en_OM p. 35; 20_3402354_en_OM p. 36; 21_3402445_en_OM p. 37 |
| Brake fluid change interval | at least every 12 months | 20_3402336_en_OM p. 36; 21_3402443_en_OM p. 36; 20_3402354_en_OM p. 37; 21_3402445_en_OM p. 38 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3402336_en_OM p. 85; 21_3402443_en_OM p. 87; 20_3402354_en_OM p. 92; 21_3402445_en_OM p. 94 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3402336_en_OM p. 85; 21_3402443_en_OM p. 87; 20_3402354_en_OM p. 92; 21_3402445_en_OM p. 94 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3402336_en_OM p. 87; 21_3402443_en_OM p. 89; 20_3402354_en_OM p. 94; 21_3402445_en_OM p. 96 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3402336_en_OM p. 87; 21_3402443_en_OM p. 89; 20_3402354_en_OM p. 94; 21_3402445_en_OM p. 96 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402336_en_OM p. 88; 21_3402443_en_OM p. 90; 20_3402354_en_OM p. 95; 21_3402445_en_OM p. 97 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402336_en_OM p. 96; 21_3402443_en_OM p. 98; 20_3402354_en_OM p. 103; 21_3402445_en_OM p. 105 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3402336_en_OM p. 92; 21_3402443_en_OM p. 94; 20_3402354_en_OM p. 99; 21_3402445_en_OM p. 101 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3402336_en_OM p. 93; 21_3402443_en_OM p. 95; 20_3402354_en_OM p. 100; 21_3402445_en_OM p. 102 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3402336_en_OM p. 93; 21_3402443_en_OM p. 95; 20_3402354_en_OM p. 100; 21_3402445_en_OM p. 102 |

### Release built-up air from the fork and clean the dust boots

`bak-ktmg4t-fork-bleed-v1-ex250f-2021-2024-and-more-1da1ec85`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FC 450 2023, Husqvarna FX 450 2023, Husqvarna FC 450 2024, Husqvarna FX 450 2024, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 450F 2023, GasGas EX 450F 2023, GasGas MC 450F 2024, GasGas EX 450F 2024, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fork bleeder screw(s): released, then tightened | both fork legs | 20_3214129_en_OM p. 50; 21_3214213_en_OM p. 51; 22_3214414_en_OM p. 50; 23_3214640_en_OM p. 50; 24_3214834_en_OM p. 58; 25_3240043_en_OM p. 55; 20_3214004_en_OM p. 50; 21_3214215_en_OM p. 52; 22_3214417_en_OM p. 52; 23_3214641_en_OM p. 54; 24_3214835_en_OM p. 55; 25_3240044_en_OM p. 55; 20_3214032_en_OM p. 52; 21_3214217_en_OM p. 52; 22_3214418_en_OM p. 50; 23_3214642_en_OM p. 54; 24_3214836_en_OM p. 58; 25_3240045_en_OM p. 55; 23_3402631_en_OM p. 50; 24_3402713_en_OM p. 53; 23_3402632_en_OM p. 52; 24_3402714_en_OM p. 52; 23_3402633_en_OM p. 56; 24_3402715_en_OM p. 58; 23_3215097_en_OM p. 45; 24_3215160_en_OM p. 52; 23_3215099_en_OM p. 45; 24_3215161_en_OM p. 46; 23_3215100_en_OM p. 45; 24_3215162_en_OM p. 51; 20_3402335_en_OM p. 47; 21_3402442_en_OM p. 48; 22_3402532_en_OM p. 50; 20_3402336_en_OM p. 50; 21_3402443_en_OM p. 52; 22_3402534_en_OM p. 52; 20_3402354_en_OM p. 53; 21_3402445_en_OM p. 54; 22_3402535_en_OM p. 52; 21_3215009_en_OM p. 45; 22_3215053_en_OM p. 45; 22_3215054_en_OM p. 45; 21_3215019_en_OM p. 43; 21_3215010_en_OM p. 45; 22_3215055_en_OM p. 50 |
| Dust boot cleaning: boots pushed down, cleaned and oiled, pressed back | yes | 20_3214129_en_OM p. 50; 21_3214213_en_OM p. 51; 22_3214414_en_OM p. 50; 23_3214640_en_OM p. 50; 24_3214834_en_OM p. 59; 25_3240043_en_OM p. 56; 20_3214004_en_OM p. 50; 21_3214215_en_OM p. 52; 22_3214417_en_OM p. 52; 23_3214641_en_OM p. 54; 24_3214835_en_OM p. 56; 25_3240044_en_OM p. 56; 20_3214032_en_OM p. 52; 21_3214217_en_OM p. 52; 22_3214418_en_OM p. 50; 23_3214642_en_OM p. 54; 24_3214836_en_OM p. 59; 25_3240045_en_OM p. 56; 23_3402631_en_OM p. 50; 24_3402713_en_OM p. 53; 23_3402632_en_OM p. 52; 24_3402714_en_OM p. 52; 23_3402633_en_OM p. 56; 24_3402715_en_OM p. 59; 23_3215097_en_OM p. 45; 24_3215160_en_OM p. 53; 23_3215099_en_OM p. 45; 24_3215161_en_OM p. 46; 23_3215100_en_OM p. 45; 24_3215162_en_OM p. 52; 20_3402335_en_OM p. 48; 21_3402442_en_OM p. 48; 22_3402532_en_OM p. 50; 20_3402336_en_OM p. 50; 21_3402443_en_OM p. 52; 22_3402534_en_OM p. 52; 20_3402354_en_OM p. 53; 21_3402445_en_OM p. 54; 22_3402535_en_OM p. 52; 21_3215009_en_OM p. 45; 22_3215053_en_OM p. 45; 22_3215054_en_OM p. 45; 21_3215019_en_OM p. 43; 21_3215010_en_OM p. 45; 22_3215055_en_OM p. 50 |

### Release built-up air from the fork and clean the dust boots

`bak-ktmg4t-fork-bleed-v1-ex250f-2025-and-more-f45ad96a`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2026, KTM 450 XC-F 2026, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2025, Husqvarna FC 250 2027, Husqvarna FC 350 2025, Husqvarna FX 350 2025, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2025, Husqvarna FX 450 2025, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fork bleeder screw(s): released, then tightened | one bleeder screw | 26_3240234_en_BA p. 69, 70; 27_3240381_en_BA p. 62; 26_3240235_en_BA p. 63; 27_3240383_en_BA p. 60; 26_3240236_en_BA p. 67, 68; 27_3240384_en_BA p. 62; 25_3402803_en_BA p. 54; 27_3402945_en_BA p. 58; 25_3402804_en_BA p. 55; 26_3402885_en_BA p. 54; 27_3402947_en_BA p. 61; 25_3402805_en_BA p. 61; 27_3402948_en_BA p. 61; 25_3215221_en_BA p. 58; 26_3215268_en_BA p. 48; 27_3215290_en_BA p. 47; 25_3215222_en_BA p. 52; 25_3215223_en_BA p. 59; 26_3215269_en_BA p. 47; 27_3215291_en_BA p. 47 |
| Dust boot cleaning: boots pushed down, cleaned and oiled, pressed back | yes | 26_3240234_en_BA p. 70; 27_3240381_en_BA p. 63; 26_3240235_en_BA p. 64; 27_3240383_en_BA p. 61; 26_3240236_en_BA p. 68; 27_3240384_en_BA p. 63; 25_3402803_en_BA p. 54; 27_3402945_en_BA p. 58; 25_3402804_en_BA p. 56; 26_3402885_en_BA p. 54; 27_3402947_en_BA p. 62; 25_3402805_en_BA p. 62; 27_3402948_en_BA p. 62; 25_3215221_en_BA p. 59; 26_3215268_en_BA p. 48; 27_3215290_en_BA p. 47; 25_3215222_en_BA p. 53; 25_3215223_en_BA p. 60; 26_3215269_en_BA p. 47; 27_3215291_en_BA p. 47 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250sxf-2020`

Bikes: KTM 250 SX-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214129_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214129_en_OM p. 139 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 20_3214129_en_OM p. 140 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214129_en_OM p. 140 |
| Shock spring preload [22.8.2 SX-F US] | 9 mm (0.35 in) | 20_3214129_en_OM p. 140 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 20_3214129_en_OM p. 140 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 20_3214129_en_OM p. 140 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 20_3214129_en_OM p. 138 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 20_3214129_en_OM p. 138 |
| Fork air pressure [22.7.2 SX-F US] | 10.3 bar (149 psi) | 20_3214129_en_OM p. 138 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214129_en_OM p. 140 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214129_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214129_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3214129_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214129_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250xcf-2020`

Bikes: KTM 250 XC-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214129_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214129_en_OM p. 140 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 2 | 20_3214129_en_OM p. 140 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214129_en_OM p. 140 |
| Shock spring preload [22.8.3 XC-F US] | 6 mm (0.24 in) | 20_3214129_en_OM p. 140 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 20_3214129_en_OM p. 141 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 20_3214129_en_OM p. 141 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214129_en_OM p. 138 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214129_en_OM p. 138 |
| Fork air pressure [22.7.3 XC-F US] | 9.8 bar (142 psi) | 20_3214129_en_OM p. 139 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214129_en_OM p. 140 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214129_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214129_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3214129_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214129_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250sxf-2021-2022`

Bikes: KTM 250 SX-F 2021, KTM 250 SX-F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214213_en_OM p. 37; 22_3214414_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214213_en_OM p. 142; 22_3214414_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 21_3214213_en_OM p. 142; 22_3214414_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Shock spring preload [22.8.2 SX-F US] | 9 mm (0.35 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Fork air pressure [22.7.2 SX-F US] | 10.5 bar (152 psi) | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214213_en_OM p. 45; 22_3214414_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex250f-2021-2023-ex350f-2021-2023-fx350-2021-2022-250xcf-2021-2022-350xcf-2021-2022`

Bikes: KTM 250 XC-F 2021, KTM 250 XC-F 2022, KTM 350 XC-F 2021, KTM 350 XC-F 2022, GasGas EX 250F 2023, GasGas EX 350F 2023, Husqvarna FX 350 2021, Husqvarna FX 350 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214213_en_OM p. 37; 22_3214414_en_OM p. 37; 21_3214215_en_OM p. 38; 22_3214417_en_OM p. 38; 23_3215097_en_OM p. 33; 23_3215099_en_OM p. 33; 21_3402443_en_OM p. 38; 22_3402534_en_OM p. 38; 21_3215009_en_OM p. 33; 22_3215053_en_OM p. 33; 22_3215054_en_OM p. 33; 21_3215019_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 2 | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Shock spring preload [22.8.3 XC-F US] | 7 mm (0.28 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 18 | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Fork air pressure [22.7.3 XC-F US] | 9.8 bar (142 psi) | 21_3214213_en_OM p. 141; 22_3214414_en_OM p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3214213_en_OM p. 143; 22_3214414_en_OM p. 135; 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 145; 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127; 21_3215019_en_OM p. 121 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45; 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47; 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47; 21_3215009_en_OM p. 40; 22_3215053_en_OM p. 40; 22_3215054_en_OM p. 40; 21_3215019_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45; 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47; 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47; 21_3215009_en_OM p. 40; 22_3215053_en_OM p. 40; 22_3215054_en_OM p. 40; 21_3215019_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214213_en_OM p. 46; 22_3214414_en_OM p. 45; 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47; 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47; 21_3215009_en_OM p. 40; 22_3215053_en_OM p. 40; 22_3215054_en_OM p. 40; 21_3215019_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214213_en_OM p. 45; 22_3214414_en_OM p. 45; 21_3214215_en_OM p. 46; 22_3214417_en_OM p. 46; 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 21_3402443_en_OM p. 46; 22_3402534_en_OM p. 46; 21_3215009_en_OM p. 40; 22_3215053_en_OM p. 40; 22_3215054_en_OM p. 40; 21_3215019_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 All XC-F models] | 15 | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 All XC-F models] | 2 | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 All XC-F models] | 15 | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 145 |
| Shock spring preload [22.8.3 All XC-F models] | 7 mm (0.28 in) | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 145 |
| Static sag [22.8.3 All XC-F models] | 35 mm (1.38 in) | 21_3214215_en_OM p. 144; 22_3214417_en_OM p. 145 |
| Rider sag [22.8.3 All XC-F models] | 105 mm (4.13 in) | 21_3214215_en_OM p. 144; 22_3214417_en_OM p. 145 |
| Fork compression, standard (clicks out from fully in) [22.7.3 All XC-F models] | 12 | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 143 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 All XC-F models] | 18 | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 143 |
| Fork air pressure [22.7.3 All XC-F models] | 9.8 bar (142 psi) | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 143 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 EX] | 15 | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 EX] | 2 | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 EX] | 15 | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Shock spring preload [22.8.2 EX] | 7 mm (0.28 in) | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Static sag [22.8.2 EX] | 35 mm (1.38 in) | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Rider sag [22.8.2 EX] | 105 mm (4.13 in) | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127; 21_3215009_en_OM p. 127; 22_3215053_en_OM p. 127; 22_3215054_en_OM p. 127 |
| Fork compression, standard (clicks out from fully in) [22.7.2 EX] | 12 | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126; 21_3215009_en_OM p. 126; 22_3215053_en_OM p. 126; 22_3215054_en_OM p. 126 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 EX] | 18 | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126; 21_3215009_en_OM p. 126; 22_3215053_en_OM p. 126; 22_3215054_en_OM p. 126 |
| Fork air pressure [22.7.2 EX] | 9.8 bar (142 psi) | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126; 21_3215009_en_OM p. 126; 22_3215053_en_OM p. 126; 22_3215054_en_OM p. 126 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 FX 350] | 15 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 FX 350] | 2 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 FX 350] | 15 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock spring preload [22.8.3 FX 350] | 7 mm (0.28 in) | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Static sag [22.8.3 FX 350] | 35 mm (1.38 in) | 21_3402443_en_OM p. 147; 22_3402534_en_OM p. 142 |
| Rider sag [22.8.3 FX 350] | 105 mm (4.13 in) | 21_3402443_en_OM p. 147; 22_3402534_en_OM p. 142 |
| Fork compression, standard (clicks out from fully in) [22.7.3 FX 350] | 12 | 21_3402443_en_OM p. 144; 22_3402534_en_OM p. 139 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 FX 350] | 18 | 21_3402443_en_OM p. 144; 22_3402534_en_OM p. 139 |
| Fork air pressure [22.7.3 FX 350] | 9.8 bar (142 psi) | 21_3402443_en_OM p. 145; 22_3402534_en_OM p. 140 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 21_3215019_en_OM p. 121 |
| Shock high-speed compression, standard (turns out from fully in) [22.8 Shock absorber] | 2 | 21_3215019_en_OM p. 121 |
| Shock rebound, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 21_3215019_en_OM p. 121 |
| Shock spring preload [22.8 Shock absorber] | 7 mm (0.28 in) | 21_3215019_en_OM p. 121 |
| Static sag [22.8 Shock absorber] | 35 mm (1.38 in) | 21_3215019_en_OM p. 121 |
| Rider sag [22.8 Shock absorber] | 105 mm (4.13 in) | 21_3215019_en_OM p. 121 |
| Fork compression, standard (clicks out from fully in) [22.7 Fork] | 12 | 21_3215019_en_OM p. 120 |
| Fork rebound, standard (clicks out from fully in) [22.7 Fork] | 18 | 21_3215019_en_OM p. 120 |
| Fork air pressure [22.7 Fork] | 9.8 bar (142 psi) | 21_3215019_en_OM p. 120 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc250-2023-2024-250sxf-2023-2024`

Bikes: KTM 250 SX-F 2023, KTM 250 SX-F 2024, Husqvarna FC 250 2023, Husqvarna FC 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214640_en_OM p. 36; 24_3214834_en_OM p. 41; 23_3402631_en_OM p. 36; 24_3402713_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214640_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 1.5 | 23_3214640_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214640_en_OM p. 136 |
| Shock spring preload [22.8.2 SX-F US] | 8 mm (0.31 in) | 23_3214640_en_OM p. 136 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 23_3214640_en_OM p. 136 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 23_3214640_en_OM p. 136 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 23_3214640_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 23_3214640_en_OM p. 134 |
| Fork air pressure [22.7.2 SX-F US] | 10.5 bar (152 psi) | 23_3214640_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3214640_en_OM p. 136; 24_3214834_en_OM p. 155; 23_3402631_en_OM p. 137; 24_3402713_en_OM p. 147 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214640_en_OM p. 44; 24_3214834_en_OM p. 50; 23_3402631_en_OM p. 44; 24_3402713_en_OM p. 46 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214640_en_OM p. 44; 24_3214834_en_OM p. 50; 23_3402631_en_OM p. 44; 24_3402713_en_OM p. 46 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214640_en_OM p. 44; 24_3214834_en_OM p. 50; 23_3402631_en_OM p. 44; 24_3402713_en_OM p. 46 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214640_en_OM p. 43; 24_3214834_en_OM p. 49; 23_3402631_en_OM p. 43; 24_3402713_en_OM p. 45 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 SX-F US] | 15 | 24_3214834_en_OM p. 155 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 SX-F US] | 1.5 | 24_3214834_en_OM p. 155 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 SX-F US] | 15 | 24_3214834_en_OM p. 155 |
| Shock spring preload [23.8.2 SX-F US] | 8 mm (0.31 in) | 24_3214834_en_OM p. 155 |
| Static sag [23.8.2 SX-F US] | 35 mm (1.38 in) | 24_3214834_en_OM p. 155 |
| Rider sag [23.8.2 SX-F US] | 105 mm (4.13 in) | 24_3214834_en_OM p. 155 |
| Fork compression, standard (clicks out from fully in) [23.7.2 SX-F US] | 12 | 24_3214834_en_OM p. 152 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 SX-F US] | 18 | 24_3214834_en_OM p. 153 |
| Fork air pressure [23.7.2 SX-F US] | 10.5 bar (152 psi) | 24_3214834_en_OM p. 153 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 All US models] | 15 | 23_3402631_en_OM p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 All US models] | 1.5 | 23_3402631_en_OM p. 137 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 All US models] | 15 | 23_3402631_en_OM p. 137 |
| Shock spring preload [22.8.2 All US models] | 8 mm (0.31 in) | 23_3402631_en_OM p. 137 |
| Static sag [22.8.2 All US models] | 35 mm (1.38 in) | 23_3402631_en_OM p. 137 |
| Rider sag [22.8.2 All US models] | 105 mm (4.13 in) | 23_3402631_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [22.7.2 All US models] | 12 | 23_3402631_en_OM p. 136 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 All US models] | 18 | 23_3402631_en_OM p. 136 |
| Fork air pressure [22.7.2 All US models] | 10.5 bar (152 psi) | 23_3402631_en_OM p. 136 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 FC US] | 15 | 24_3402713_en_OM p. 147 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 FC US] | 1.5 | 24_3402713_en_OM p. 147 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 FC US] | 15 | 24_3402713_en_OM p. 147 |
| Shock spring preload [23.8.2 FC US] | 8 mm (0.31 in) | 24_3402713_en_OM p. 147 |
| Static sag [23.8.2 FC US] | 35 mm (1.38 in) | 24_3402713_en_OM p. 147 |
| Rider sag [23.8.2 FC US] | 105 mm (4.13 in) | 24_3402713_en_OM p. 147 |
| Fork compression, standard (clicks out from fully in) [23.7.2 FC US] | 12 | 24_3402713_en_OM p. 145 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 FC US] | 18 | 24_3402713_en_OM p. 145 |
| Fork air pressure [23.7.2 FC US] | 10.5 bar (152 psi) | 24_3402713_en_OM p. 146 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250xcf-2023`

Bikes: KTM 250 XC-F 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214640_en_OM p. 36 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 23_3214640_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 1.5 | 23_3214640_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 23_3214640_en_OM p. 137 |
| Shock spring preload [22.8.3 XC-F US] | 8 mm (0.31 in) | 23_3214640_en_OM p. 137 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 23_3214640_en_OM p. 137 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 23_3214640_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 23_3214640_en_OM p. 135 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 18 | 23_3214640_en_OM p. 135 |
| Fork air pressure [22.7.3 XC-F US] | 9.8 bar (142 psi) | 23_3214640_en_OM p. 135 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3214640_en_OM p. 137 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214640_en_OM p. 44 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214640_en_OM p. 44 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214640_en_OM p. 44 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214640_en_OM p. 43 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex250f-2024-250xcf-2024-2025`

Bikes: KTM 250 XC-F 2024, KTM 250 XC-F 2025, GasGas EX 250F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214834_en_OM p. 41; 25_3240043_en_OM p. 40; 24_3215160_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.3 XC-F US] | 15 | 24_3214834_en_OM p. 155; 25_3240043_en_OM p. 151 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.3 XC-F US] | 1.5 | 24_3214834_en_OM p. 155; 25_3240043_en_OM p. 151 |
| Shock rebound, standard (clicks out from fully in) [23.8.3 XC-F US] | 15 | 24_3214834_en_OM p. 155; 25_3240043_en_OM p. 151 |
| Shock spring preload [23.8.3 XC-F US] | 8 mm (0.31 in) | 24_3214834_en_OM p. 155; 25_3240043_en_OM p. 151 |
| Static sag [23.8.3 XC-F US] | 35 mm (1.38 in) | 24_3214834_en_OM p. 156; 25_3240043_en_OM p. 151 |
| Rider sag [23.8.3 XC-F US] | 105 mm (4.13 in) | 24_3214834_en_OM p. 156; 25_3240043_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [23.7.3 XC-F US] | 12 | 24_3214834_en_OM p. 153; 25_3240043_en_OM p. 149 |
| Fork rebound, standard (clicks out from fully in) [23.7.3 XC-F US] | 18 | 24_3214834_en_OM p. 153; 25_3240043_en_OM p. 149 |
| Fork spring rate by rider weight | 65-75 kg: 4.2 N/mm, 75-85 kg: 4.4 N/mm, 85-95 kg: 4.6 N/mm | 24_3214834_en_OM p. 153; 25_3240043_en_OM p. 149; 24_3215160_en_OM p. 146 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 24_3214834_en_OM p. 155; 25_3240043_en_OM p. 151; 24_3215160_en_OM p. 148 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 EX-F] | 15 | 24_3215160_en_OM p. 148 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 EX-F] | 1.5 | 24_3215160_en_OM p. 148 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 EX-F] | 15 | 24_3215160_en_OM p. 148 |
| Shock spring preload [23.8.2 EX-F] | 8 mm (0.31 in) | 24_3215160_en_OM p. 148 |
| Static sag [23.8.2 EX-F] | 35 mm (1.38 in) | 24_3215160_en_OM p. 148 |
| Rider sag [23.8.2 EX-F] | 105 mm (4.13 in) | 24_3215160_en_OM p. 148 |
| Fork compression, standard (clicks out from fully in) [23.7.2 EX-F] | 12 | 24_3215160_en_OM p. 146 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 EX-F] | 18 | 24_3215160_en_OM p. 146 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250sxf-2025`

Bikes: KTM 250 SX-F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 25_3240043_en_OM p. 40 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 SX-F US, all special models] | 15 | 25_3240043_en_OM p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 SX-F US, all special models] | 1.5 | 25_3240043_en_OM p. 150 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 SX-F US, all special models] | 15 | 25_3240043_en_OM p. 150 |
| Shock spring preload [23.8.2 SX-F US, all special models] | 8 mm (0.31 in) | 25_3240043_en_OM p. 151 |
| Static sag [23.8.2 SX-F US, all special models] | 35 mm (1.38 in) | 25_3240043_en_OM p. 151 |
| Rider sag [23.8.2 SX-F US, all special models] | 105 mm (4.13 in) | 25_3240043_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [23.7.2 SX-F US, all special models] | 12 | 25_3240043_en_OM p. 148 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 SX-F US, all special models] | 18 | 25_3240043_en_OM p. 149 |
| Fork air pressure [23.7.2 SX-F US, all special models] | 10.3 bar (149 psi) | 25_3240043_en_OM p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 25_3240043_en_OM p. 151 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3240043_en_OM p. 48 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3240043_en_OM p. 48 |
| Fork air pressure change step | 0.2 bar (3 psi) | 25_3240043_en_OM p. 48 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3240043_en_OM p. 47 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc250-2027-250sxf-2026-2027`

Bikes: KTM 250 SX-F 2026, KTM 250 SX-F 2027, Husqvarna FC 250 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240234_en_BA p. 46; 27_3240381_en_BA p. 45; 27_3402945_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data (SX-F US standard model)] | 15 | 26_3240234_en_BA p. 174 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data (SX-F US standard model)] | 1.5 | 26_3240234_en_BA p. 174 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data (SX-F US standard model)] | 15 | 26_3240234_en_BA p. 174 |
| Shock spring preload [22.5.3 Technical data (SX-F US standard model)] | 8 mm (0.31 in) | 26_3240234_en_BA p. 174 |
| Static sag [22.5.3 Technical data (SX-F US standard model)] | 35 mm (1.38 in) | 26_3240234_en_BA p. 174 |
| Rider sag [22.5.3 Technical data (SX-F US standard model)] | 105 mm (4.13 in) | 26_3240234_en_BA p. 174 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data (SX-F US standard model)] | 12 | 26_3240234_en_BA p. 170 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data (SX-F US standard model)] | 18 | 26_3240234_en_BA p. 171 |
| Fork air pressure by rider weight | 65-75 kg: 10.1 bar (146.5 psi), 75-85 kg: 10.3 bar (149.4 psi), 85-95 kg: 10.5 bar (152.3 psi) | 26_3240234_en_BA p. 171; 27_3240381_en_BA p. 156; 27_3402945_en_BA p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 26_3240234_en_BA p. 174; 27_3240381_en_BA p. 158; 27_3402945_en_BA p. 151 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3240234_en_BA p. 59; 27_3240381_en_BA p. 55; 27_3402945_en_BA p. 52 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3240234_en_BA p. 59; 27_3240381_en_BA p. 55; 27_3402945_en_BA p. 52 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240234_en_BA p. 59; 27_3240381_en_BA p. 55; 27_3402945_en_BA p. 52 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240234_en_BA p. 58; 27_3240381_en_BA p. 54; 27_3402945_en_BA p. 51 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data (SX-F US)] | 15 | 27_3240381_en_BA p. 158 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data (SX-F US)] | 1.5 | 27_3240381_en_BA p. 158 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data (SX-F US)] | 15 | 27_3240381_en_BA p. 158 |
| Shock spring preload [22.5.3 Technical data (SX-F US)] | 8 mm (0.31 in) | 27_3240381_en_BA p. 158 |
| Static sag [22.5.3 Technical data (SX-F US)] | 35 mm (1.38 in) | 27_3240381_en_BA p. 159 |
| Rider sag [22.5.3 Technical data (SX-F US)] | 105 mm (4.13 in) | 27_3240381_en_BA p. 159 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data (SX-F US)] | 12 | 27_3240381_en_BA p. 155 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data (SX-F US)] | 18 | 27_3240381_en_BA p. 156 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 250 US)] | 15 | 27_3402945_en_BA p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (FC 250 US)] | 1.5 | 27_3402945_en_BA p. 150 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 250 US)] | 15 | 27_3402945_en_BA p. 151 |
| Shock spring preload [22.5.3 Technical data - shock absorber (FC 250 US)] | 8 mm (0.31 in) | 27_3402945_en_BA p. 151 |
| Static sag [22.5.3 Technical data - shock absorber (FC 250 US)] | 35 mm (1.38 in) | 27_3402945_en_BA p. 151 |
| Rider sag [22.5.3 Technical data - shock absorber (FC 250 US)] | 105 mm (4.13 in) | 27_3402945_en_BA p. 151 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 250 US)] | 12 | 27_3402945_en_BA p. 149 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 250 US)] | 18 | 27_3402945_en_BA p. 149 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-250xcf-2026-2027`

Bikes: KTM 250 XC-F 2026, KTM 250 XC-F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240234_en_BA p. 46; 27_3240381_en_BA p. 45 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.5 Technical data (XC-F)] | 15 | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 159 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.5 Technical data (XC-F)] | 1.5 | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 159 |
| Shock rebound, standard (clicks out from fully in) [22.5.5 Technical data (XC-F)] | 15 | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 159 |
| Shock spring preload [22.5.5 Technical data (XC-F)] | 8 mm (0.31 in) | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 159 |
| Static sag [22.5.5 Technical data (XC-F)] | 35 mm (1.38 in) | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 160 |
| Rider sag [22.5.5 Technical data (XC-F)] | 105 mm (4.13 in) | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 160 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data (XC-F)] | 12 | 26_3240234_en_BA p. 171; 27_3240381_en_BA p. 156 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data (XC-F)] | 18 | 26_3240234_en_BA p. 171; 27_3240381_en_BA p. 156 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 26_3240234_en_BA p. 175; 27_3240381_en_BA p. 159 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-350sxf-2020`

Bikes: KTM 350 SX-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214004_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214004_en_OM p. 133 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 20_3214004_en_OM p. 133 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214004_en_OM p. 134 |
| Shock spring preload [22.8.2 SX-F US] | 10 mm (0.39 in) | 20_3214004_en_OM p. 134 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 20_3214004_en_OM p. 134 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 20_3214004_en_OM p. 134 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 20_3214004_en_OM p. 132 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 20_3214004_en_OM p. 132 |
| Fork air pressure [22.7.2 SX-F US] | 10.4 bar (151 psi) | 20_3214004_en_OM p. 132 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214004_en_OM p. 134 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214004_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214004_en_OM p. 45 |
| Fork air pressure change step | 7 bar (102 psi) | 20_3214004_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214004_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-350xcf-2020`

Bikes: KTM 350 XC-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214004_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214004_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 2 | 20_3214004_en_OM p. 134 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214004_en_OM p. 134 |
| Shock spring preload [22.8.3 XC-F US] | 7 mm (0.28 in) | 20_3214004_en_OM p. 134 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 20_3214004_en_OM p. 134 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 20_3214004_en_OM p. 134 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214004_en_OM p. 132 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214004_en_OM p. 132 |
| Fork air pressure [22.7.3 XC-F US] | 9.8 bar (142 psi) | 20_3214004_en_OM p. 132 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214004_en_OM p. 134 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214004_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214004_en_OM p. 45 |
| Fork air pressure change step | 7 bar (102 psi) | 20_3214004_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214004_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-350sxf-2021-2022`

Bikes: KTM 350 SX-F 2021, KTM 350 SX-F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214215_en_OM p. 38; 22_3214417_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214215_en_OM p. 142; 22_3214417_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Shock spring preload [22.8.2 SX-F US] | 10 mm (0.39 in) | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 142 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 142 |
| Fork air pressure [22.7.2 SX-F US] | 10.6 bar (154 psi) | 21_3214215_en_OM p. 141; 22_3214417_en_OM p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3214215_en_OM p. 143; 22_3214417_en_OM p. 144 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214215_en_OM p. 47; 22_3214417_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214215_en_OM p. 46; 22_3214417_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc350-2023-2024-350sxf-2023-2024`

Bikes: KTM 350 SX-F 2023, KTM 350 SX-F 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214641_en_OM p. 38; 24_3214835_en_OM p. 39; 23_3402632_en_OM p. 37; 24_3402714_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 1.5 | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Shock spring preload [22.8.2 SX-F US] | 8 mm (0.31 in) | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 23_3214641_en_OM p. 144; 24_3214835_en_OM p. 148 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 23_3214641_en_OM p. 144; 24_3214835_en_OM p. 148 |
| Fork air pressure [22.7.2 SX-F US] | 10.6 bar (154 psi) | 23_3214641_en_OM p. 144; 24_3214835_en_OM p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3214641_en_OM p. 146; 24_3214835_en_OM p. 150; 23_3402632_en_OM p. 141; 24_3402714_en_OM p. 142 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214641_en_OM p. 46; 24_3214835_en_OM p. 47; 23_3402632_en_OM p. 46; 24_3402714_en_OM p. 46 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214641_en_OM p. 46; 24_3214835_en_OM p. 47; 23_3402632_en_OM p. 46; 24_3402714_en_OM p. 46 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214641_en_OM p. 46; 24_3214835_en_OM p. 47; 23_3402632_en_OM p. 46; 24_3402714_en_OM p. 46 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214641_en_OM p. 46; 24_3214835_en_OM p. 46; 23_3402632_en_OM p. 45; 24_3402714_en_OM p. 45 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 All US models] | 15 | 23_3402632_en_OM p. 141 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 All US models] | 1.5 | 23_3402632_en_OM p. 141 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 All US models] | 15 | 23_3402632_en_OM p. 141 |
| Shock spring preload [22.8.2 All US models] | 8 mm (0.31 in) | 23_3402632_en_OM p. 141 |
| Static sag [22.8.2 All US models] | 35 mm (1.38 in) | 23_3402632_en_OM p. 141 |
| Rider sag [22.8.2 All US models] | 105 mm (4.13 in) | 23_3402632_en_OM p. 141 |
| Fork compression, standard (clicks out from fully in) [22.7.2 All US models] | 12 | 23_3402632_en_OM p. 139 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 All US models] | 18 | 23_3402632_en_OM p. 139 |
| Fork air pressure [22.7.2 All US models] | 10.6 bar (154 psi) | 23_3402632_en_OM p. 140 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FC 350 US] | 15 | 24_3402714_en_OM p. 141 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FC 350 US] | 1.5 | 24_3402714_en_OM p. 141 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FC 350 US] | 15 | 24_3402714_en_OM p. 141 |
| Shock spring preload [22.8.2 FC 350 US] | 8 mm (0.31 in) | 24_3402714_en_OM p. 142 |
| Static sag [22.8.2 FC 350 US] | 35 mm (1.38 in) | 24_3402714_en_OM p. 142 |
| Rider sag [22.8.2 FC 350 US] | 105 mm (4.13 in) | 24_3402714_en_OM p. 142 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FC 350 US] | 12 | 24_3402714_en_OM p. 140 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FC 350 US] | 18 | 24_3402714_en_OM p. 140 |
| Fork air pressure [22.7.2 FC 350 US] | 10.6 bar (154 psi) | 24_3402714_en_OM p. 140 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-350xcf-2023`

Bikes: KTM 350 XC-F 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214641_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 All XC-F models] | 15 | 23_3214641_en_OM p. 146 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 All XC-F models] | 1.5 | 23_3214641_en_OM p. 146 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 All XC-F models] | 15 | 23_3214641_en_OM p. 147 |
| Shock spring preload [22.8.3 All XC-F models] | 8 mm (0.31 in) | 23_3214641_en_OM p. 147 |
| Static sag [22.8.3 All XC-F models] | 35 mm (1.38 in) | 23_3214641_en_OM p. 147 |
| Rider sag [22.8.3 All XC-F models] | 105 mm (4.13 in) | 23_3214641_en_OM p. 147 |
| Fork compression, standard (clicks out from fully in) [22.7.3 All XC-F models] | 12 | 23_3214641_en_OM p. 145 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 All XC-F models] | 18 | 23_3214641_en_OM p. 145 |
| Fork air pressure [22.7.3 All XC-F models] | 9.9 bar (144 psi) | 23_3214641_en_OM p. 145 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3214641_en_OM p. 147 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214641_en_OM p. 46 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214641_en_OM p. 46 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214641_en_OM p. 46 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214641_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex350f-2024-fx350-2024-350xcf-2024`

Bikes: KTM 350 XC-F 2024, Husqvarna FX 350 2024, GasGas EX 350F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214835_en_OM p. 39; 24_3402714_en_OM p. 37; 24_3215161_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US, FACTORY EDITION] | 15 | 24_3214835_en_OM p. 151 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US, FACTORY EDITION] | 1.5 | 24_3214835_en_OM p. 151 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US, FACTORY EDITION] | 15 | 24_3214835_en_OM p. 151 |
| Shock spring preload [22.8.3 XC-F US, FACTORY EDITION] | 8 mm (0.31 in) | 24_3214835_en_OM p. 151 |
| Static sag [22.8.3 XC-F US, FACTORY EDITION] | 35 mm (1.38 in) | 24_3214835_en_OM p. 151 |
| Rider sag [22.8.3 XC-F US, FACTORY EDITION] | 102 mm (4.02 in) | 24_3214835_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US, FACTORY EDITION] | 12 | 24_3214835_en_OM p. 149 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US, FACTORY EDITION] | 18 | 24_3214835_en_OM p. 149 |
| Fork spring rate by rider weight | 65-75 kg: 4.4 N/mm, 75-85 kg: 4.6 N/mm, 85-95 kg: 4.8 N/mm | 24_3214835_en_OM p. 149; 24_3402714_en_OM p. 140; 24_3215161_en_OM p. 130 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3214835_en_OM p. 151; 24_3402714_en_OM p. 142; 24_3215161_en_OM p. 132 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 FX] | 15 | 24_3402714_en_OM p. 142 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 FX] | 1.5 | 24_3402714_en_OM p. 142 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 FX] | 15 | 24_3402714_en_OM p. 142 |
| Shock spring preload [22.8.3 FX] | 8 mm (0.31 in) | 24_3402714_en_OM p. 142 |
| Static sag [22.8.3 FX] | 35 mm (1.38 in) | 24_3402714_en_OM p. 142 |
| Rider sag [22.8.3 FX] | 102 mm (4.02 in) | 24_3402714_en_OM p. 142 |
| Fork compression, standard (clicks out from fully in) [22.7.3 FX] | 12 | 24_3402714_en_OM p. 140 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 FX] | 18 | 24_3402714_en_OM p. 140 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 EX 350 F US] | 15 | 24_3215161_en_OM p. 131 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 EX 350 F US] | 1.5 | 24_3215161_en_OM p. 131 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 EX 350 F US] | 15 | 24_3215161_en_OM p. 131 |
| Shock spring preload [22.8.2 EX 350 F US] | 8 mm (0.31 in) | 24_3215161_en_OM p. 131 |
| Static sag [22.8.2 EX 350 F US] | 35 mm (1.38 in) | 24_3215161_en_OM p. 132 |
| Rider sag [22.8.2 EX 350 F US] | 102 mm (4.02 in) | 24_3215161_en_OM p. 132 |
| Fork compression, standard (clicks out from fully in) [22.7.2 EX 350 F US] | 12 | 24_3215161_en_OM p. 130 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 EX 350 F US] | 18 | 24_3215161_en_OM p. 130 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-350sxf-2025`

Bikes: KTM 350 SX-F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 25_3240044_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 25_3240044_en_OM p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 1.5 | 25_3240044_en_OM p. 150 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 25_3240044_en_OM p. 150 |
| Shock spring preload [22.8.2 SX-F US] | 8 mm (0.31 in) | 25_3240044_en_OM p. 150 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 25_3240044_en_OM p. 150 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 25_3240044_en_OM p. 150 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 25_3240044_en_OM p. 148 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 25_3240044_en_OM p. 148 |
| Fork air pressure [22.7.2 SX-F US] | 10.4 bar (151 psi) | 25_3240044_en_OM p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3240044_en_OM p. 150 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3240044_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3240044_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 25_3240044_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3240044_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex450f-2024-fx450-2024-350xcf-2025-450xcf-2024-2025`

Bikes: KTM 350 XC-F 2025, KTM 450 XC-F 2024, KTM 450 XC-F 2025, Husqvarna FX 450 2024, GasGas EX 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 25_3240044_en_OM p. 39; 24_3214836_en_OM p. 40; 25_3240045_en_OM p. 39; 24_3402715_en_OM p. 39; 24_3215162_en_OM p. 36 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 25_3240044_en_OM p. 151 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 1.5 | 25_3240044_en_OM p. 151 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 25_3240044_en_OM p. 151 |
| Shock spring preload [22.8.3 XC-F US] | 8 mm (0.31 in) | 25_3240044_en_OM p. 151 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 25_3240044_en_OM p. 151 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 25_3240044_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 25_3240044_en_OM p. 149 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 18 | 25_3240044_en_OM p. 149 |
| Fork spring rate by rider weight | 65-75 kg: 4.6 N/mm, 75-85 kg: 4.8 N/mm, 85-95 kg: 5.0 N/mm | 25_3240044_en_OM p. 149; 24_3214836_en_OM p. 158; 25_3240045_en_OM p. 155; 24_3402715_en_OM p. 160; 24_3215162_en_OM p. 143 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3240044_en_OM p. 151; 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 156; 24_3402715_en_OM p. 162; 24_3215162_en_OM p. 145 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.3 XC-F US] | 15 | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 156 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.3 XC-F US] | 1.5 | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 156 |
| Shock rebound, standard (clicks out from fully in) [23.8.3 XC-F US] | 15 | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 156 |
| Shock spring preload [23.8.3 XC-F US] | 8 mm (0.31 in) | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 156 |
| Static sag [23.8.3 XC-F US] | 35 mm (1.38 in) | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 157 |
| Rider sag [23.8.3 XC-F US] | 105 mm (4.13 in) | 24_3214836_en_OM p. 160; 25_3240045_en_OM p. 157 |
| Fork compression, standard (clicks out from fully in) [23.7.3 XC-F US] | 12 | 24_3214836_en_OM p. 157; 25_3240045_en_OM p. 154 |
| Fork rebound, standard (clicks out from fully in) [23.7.3 XC-F US] | 18 | 24_3214836_en_OM p. 157; 25_3240045_en_OM p. 154 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.3 FX] | 15 | 24_3402715_en_OM p. 162 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.3 FX] | 1.5 | 24_3402715_en_OM p. 162 |
| Shock rebound, standard (clicks out from fully in) [23.8.3 FX] | 15 | 24_3402715_en_OM p. 162 |
| Shock spring preload [23.8.3 FX] | 8 mm (0.31 in) | 24_3402715_en_OM p. 162 |
| Static sag [23.8.3 FX] | 35 mm (1.38 in) | 24_3402715_en_OM p. 162 |
| Rider sag [23.8.3 FX] | 105 mm (4.13 in) | 24_3402715_en_OM p. 162 |
| Fork compression, standard (clicks out from fully in) [23.7.3 FX] | 12 | 24_3402715_en_OM p. 159 |
| Fork rebound, standard (clicks out from fully in) [23.7.3 FX] | 18 | 24_3402715_en_OM p. 159 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 EX-F] | 15 | 24_3215162_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 EX-F] | 1.5 | 24_3215162_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 EX-F] | 15 | 24_3215162_en_OM p. 144 |
| Shock spring preload [23.8.2 EX-F] | 8 mm (0.31 in) | 24_3215162_en_OM p. 144 |
| Static sag [23.8.2 EX-F] | 35 mm (1.38 in) | 24_3215162_en_OM p. 145 |
| Rider sag [23.8.2 EX-F] | 105 mm (4.13 in) | 24_3215162_en_OM p. 145 |
| Fork compression, standard (clicks out from fully in) [23.7.2 EX-F] | 12 | 24_3215162_en_OM p. 142 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 EX-F] | 18 | 24_3215162_en_OM p. 143 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc350-2027-350sxf-2026-2027`

Bikes: KTM 350 SX-F 2026, KTM 350 SX-F 2027, Husqvarna FC 350 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240235_en_BA p. 45; 27_3240383_en_BA p. 44; 27_3402947_en_BA p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (350 SX-F US)] | 15 | 26_3240235_en_BA p. 163 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (350 SX-F US)] | 1.5 | 26_3240235_en_BA p. 163 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (350 SX-F US)] | 15 | 26_3240235_en_BA p. 163 |
| Shock spring preload [22.5.3 Technical data - shock absorber (350 SX-F US)] | 8 mm (0.31 in) | 26_3240235_en_BA p. 163 |
| Static sag [22.5.3 Technical data - shock absorber (350 SX-F US)] | 35 mm (1.38 in) | 26_3240235_en_BA p. 163 |
| Rider sag [22.5.3 Technical data - shock absorber (350 SX-F US)] | 105 mm (4.13 in) | 26_3240235_en_BA p. 163 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (350 SX-F US)] | 12 | 26_3240235_en_BA p. 160 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (350 SX-F US)] | 18 | 26_3240235_en_BA p. 160 |
| Fork air pressure by rider weight | 65-75 kg: 10.2 bar (147.9 psi), 75-85 kg: 10.4 bar (150.8 psi), 85-95 kg: 10.6 bar (153.7 psi) | 26_3240235_en_BA p. 160; 27_3240383_en_BA p. 153; 27_3402947_en_BA p. 156 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 26_3240235_en_BA p. 163; 27_3240383_en_BA p. 156; 27_3402947_en_BA p. 158 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3240235_en_BA p. 54; 27_3240383_en_BA p. 53; 27_3402947_en_BA p. 54 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3240235_en_BA p. 54; 27_3240383_en_BA p. 53; 27_3402947_en_BA p. 54 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240235_en_BA p. 54; 27_3240383_en_BA p. 53; 27_3402947_en_BA p. 54 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240235_en_BA p. 53; 27_3240383_en_BA p. 52; 27_3402947_en_BA p. 53 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (SX-F US model)] | 15 | 27_3240383_en_BA p. 156 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (SX-F US model)] | 1.5 | 27_3240383_en_BA p. 156 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (SX-F US model)] | 15 | 27_3240383_en_BA p. 156 |
| Shock spring preload [22.5.3 Technical data - shock absorber (SX-F US model)] | 8 mm (0.31 in) | 27_3240383_en_BA p. 156 |
| Static sag [22.5.3 Technical data - shock absorber (SX-F US model)] | 35 mm (1.38 in) | 27_3240383_en_BA p. 156 |
| Rider sag [22.5.3 Technical data - shock absorber (SX-F US model)] | 105 mm (4.13 in) | 27_3240383_en_BA p. 156 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (SX-F US model)] | 12 | 27_3240383_en_BA p. 153 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (SX-F US model)] | 18 | 27_3240383_en_BA p. 153 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 350 US)] | 15 | 27_3402947_en_BA p. 158 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (FC 350 US)] | 1.5 | 27_3402947_en_BA p. 158 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 350 US)] | 15 | 27_3402947_en_BA p. 158 |
| Shock spring preload [22.5.3 Technical data - shock absorber (FC 350 US)] | 8 mm (0.31 in) | 27_3402947_en_BA p. 158 |
| Static sag [22.5.3 Technical data - shock absorber (FC 350 US)] | 35 mm (1.38 in) | 27_3402947_en_BA p. 159 |
| Rider sag [22.5.3 Technical data - shock absorber (FC 350 US)] | 105 mm (4.13 in) | 27_3402947_en_BA p. 159 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 350 US)] | 12 | 27_3402947_en_BA p. 155 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 350 US)] | 18 | 27_3402947_en_BA p. 156 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex350f-2025-fx350-2026-2027-fx450-2025-2027-350xcf-2027-450xcf-2026-2027`

Bikes: KTM 350 XC-F 2027, KTM 450 XC-F 2026, KTM 450 XC-F 2027, Husqvarna FX 350 2026, Husqvarna FX 350 2027, Husqvarna FX 450 2025, Husqvarna FX 450 2027, GasGas EX 350F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 27_3240383_en_BA p. 44; 26_3240236_en_BA p. 44; 27_3240384_en_BA p. 45; 26_3402885_en_BA p. 42; 27_3402947_en_BA p. 44; 25_3402805_en_BA p. 44; 27_3402948_en_BA p. 44; 25_3215222_en_BA p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (XC-F US model)] | 15 | 27_3240383_en_BA p. 157 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.5 Technical data - shock absorber (XC-F US model)] | 1.5 | 27_3240383_en_BA p. 157 |
| Shock rebound, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (XC-F US model)] | 15 | 27_3240383_en_BA p. 157 |
| Shock spring preload [22.5.5 Technical data - shock absorber (XC-F US model)] | 8 mm (0.31 in) | 27_3240383_en_BA p. 157 |
| Static sag [22.5.5 Technical data - shock absorber (XC-F US model)] | 35 mm (1.38 in) | 27_3240383_en_BA p. 157 |
| Rider sag [22.5.5 Technical data - shock absorber (XC-F US model)] | 105 mm (4.13 in) | 27_3240383_en_BA p. 157 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data - fork (XC-F US model)] | 12 | 27_3240383_en_BA p. 154 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data - fork (XC-F US model)] | 18 | 27_3240383_en_BA p. 154 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 27_3240383_en_BA p. 157; 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159; 26_3402885_en_BA p. 144; 27_3402947_en_BA p. 159; 25_3402805_en_BA p. 154; 27_3402948_en_BA p. 159; 25_3215222_en_BA p. 139 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (XC-F)] | 15 | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (XC-F)] | 1.5 | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (XC-F)] | 15 | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Shock spring preload [22.5.3 Technical data - shock absorber (XC-F)] | 8 mm (0.31 in) | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Static sag [22.5.3 Technical data - shock absorber (XC-F)] | 35 mm (1.38 in) | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Rider sag [22.5.3 Technical data - shock absorber (XC-F)] | 105 mm (4.13 in) | 26_3240236_en_BA p. 176; 27_3240384_en_BA p. 159 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data - fork (XC-F)] | 12 | 26_3240236_en_BA p. 172; 27_3240384_en_BA p. 156 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data - fork (XC-F)] | 18 | 26_3240236_en_BA p. 172; 27_3240384_en_BA p. 156 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.1 Technical data - shock absorber] | 15 | 26_3402885_en_BA p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.1 Technical data - shock absorber] | 1.5 | 26_3402885_en_BA p. 144 |
| Shock rebound, standard (clicks out from fully in) [21.5.1 Technical data - shock absorber] | 15 | 26_3402885_en_BA p. 144 |
| Shock spring preload [21.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 26_3402885_en_BA p. 144 |
| Static sag [21.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 26_3402885_en_BA p. 144 |
| Rider sag [21.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 26_3402885_en_BA p. 144 |
| Fork compression, standard (clicks out from fully in) [21.4.1 Technical data - fork] | 12 | 26_3402885_en_BA p. 143 |
| Fork rebound, standard (clicks out from fully in) [21.4.1 Technical data - fork] | 18 | 26_3402885_en_BA p. 143 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (FX)] | 15 | 27_3402947_en_BA p. 159; 27_3402948_en_BA p. 159 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.5 Technical data - shock absorber (FX)] | 1.5 | 27_3402947_en_BA p. 159; 27_3402948_en_BA p. 159 |
| Shock rebound, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (FX)] | 15 | 27_3402947_en_BA p. 159; 27_3402948_en_BA p. 159 |
| Shock spring preload [22.5.5 Technical data - shock absorber (FX)] | 8 mm (0.31 in) | 27_3402947_en_BA p. 159; 27_3402948_en_BA p. 159 |
| Static sag [22.5.5 Technical data - shock absorber (FX)] | 35 mm (1.38 in) | 27_3402947_en_BA p. 160; 27_3402948_en_BA p. 159 |
| Rider sag [22.5.5 Technical data - shock absorber (FX)] | 105 mm (4.13 in) | 27_3402947_en_BA p. 160; 27_3402948_en_BA p. 159 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data - fork (FX)] | 12 | 27_3402947_en_BA p. 156; 27_3402948_en_BA p. 156 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data - fork (FX)] | 18 | 27_3402947_en_BA p. 156; 27_3402948_en_BA p. 156 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.7 Technical data - shock absorber (FX 450)] | 15 | 25_3402805_en_BA p. 154 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.7 Technical data - shock absorber (FX 450)] | 1.5 | 25_3402805_en_BA p. 154 |
| Shock rebound, standard (clicks out from fully in) [21.5.7 Technical data - shock absorber (FX 450)] | 15 | 25_3402805_en_BA p. 154 |
| Shock spring preload [21.5.7 Technical data - shock absorber (FX 450)] | 8 mm (0.31 in) | 25_3402805_en_BA p. 154 |
| Static sag [21.5.7 Technical data - shock absorber (FX 450)] | 35 mm (1.38 in) | 25_3402805_en_BA p. 154 |
| Rider sag [21.5.7 Technical data - shock absorber (FX 450)] | 105 mm (4.13 in) | 25_3402805_en_BA p. 154 |
| Fork compression, standard (clicks out from fully in) [21.4.7 Technical data - fork (FX 450)] | 12 | 25_3402805_en_BA p. 150 |
| Fork rebound, standard (clicks out from fully in) [21.4.7 Technical data - fork (FX 450)] | 18 | 25_3402805_en_BA p. 150 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (EX)] | 15 | 25_3215222_en_BA p. 139 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.3 Technical data - shock absorber (EX)] | 1.5 | 25_3215222_en_BA p. 139 |
| Shock rebound, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (EX)] | 15 | 25_3215222_en_BA p. 139 |
| Shock spring preload [21.5.3 Technical data - shock absorber (EX)] | 8 mm (0.31 in) | 25_3215222_en_BA p. 139 |
| Static sag [21.5.3 Technical data - shock absorber (EX)] | 35 mm (1.38 in) | 25_3215222_en_BA p. 140 |
| Rider sag [21.5.3 Technical data - shock absorber (EX)] | 105 mm (4.13 in) | 25_3215222_en_BA p. 140 |
| Fork compression, standard (clicks out from fully in) [21.4.3 Technical data - fork (EX)] | 12 | 25_3215222_en_BA p. 137 |
| Fork rebound, standard (clicks out from fully in) [21.4.3 Technical data - fork (EX)] | 18 | 25_3215222_en_BA p. 137 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-450sxf-2020`

Bikes: KTM 450 SX-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214032_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214032_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 20_3214032_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 20_3214032_en_OM p. 144 |
| Shock spring preload [22.8.2 SX-F US] | 7 mm (0.28 in) | 20_3214032_en_OM p. 144 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 20_3214032_en_OM p. 144 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 20_3214032_en_OM p. 144 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 20_3214032_en_OM p. 141 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 20_3214032_en_OM p. 141 |
| Fork air pressure [22.7.2 SX-F US] | 10.5 bar (152 psi) | 20_3214032_en_OM p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 20_3214032_en_OM p. 144 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214032_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214032_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3214032_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214032_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-450xcf-2020`

Bikes: KTM 450 XC-F 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214032_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214032_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 2 | 20_3214032_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 20_3214032_en_OM p. 144 |
| Shock spring preload [22.8.3 XC-F US] | 8 mm (0.31 in) | 20_3214032_en_OM p. 144 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 20_3214032_en_OM p. 145 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 20_3214032_en_OM p. 145 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214032_en_OM p. 142 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 20_3214032_en_OM p. 142 |
| Fork air pressure [22.7.3 XC-F US] | 10.1 bar (146 psi) | 20_3214032_en_OM p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 20_3214032_en_OM p. 144 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214032_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214032_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3214032_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214032_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2022-450sxf-2021-2022`

Bikes: KTM 450 SX-F 2021, KTM 450 SX-F 2022, Husqvarna FC 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214217_en_OM p. 38; 22_3214418_en_OM p. 37; 22_3402535_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 2 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Shock spring preload [22.8.2 SX-F US] | 7 mm (0.28 in) | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 21_3214217_en_OM p. 141; 22_3214418_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 21_3214217_en_OM p. 141; 22_3214418_en_OM p. 133 |
| Fork air pressure [22.7.2 SX-F US] | 10.7 bar (155 psi) | 21_3214217_en_OM p. 142; 22_3214418_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 135; 22_3402535_en_OM p. 139 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214217_en_OM p. 46; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 46 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FC 450 US] | 15 | 22_3402535_en_OM p. 139 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FC 450 US] | 2 | 22_3402535_en_OM p. 139 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FC 450 US] | 15 | 22_3402535_en_OM p. 139 |
| Shock spring preload [22.8.2 FC 450 US] | 7 mm (0.28 in) | 22_3402535_en_OM p. 139 |
| Static sag [22.8.2 FC 450 US] | 35 mm (1.38 in) | 22_3402535_en_OM p. 139 |
| Rider sag [22.8.2 FC 450 US] | 105 mm (4.13 in) | 22_3402535_en_OM p. 139 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FC 450 US] | 12 | 22_3402535_en_OM p. 137 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FC 450 US] | 18 | 22_3402535_en_OM p. 137 |
| Fork air pressure [22.7.2 FC 450 US] | 10.7 bar (155 psi) | 22_3402535_en_OM p. 138 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fx450-2022-450xcf-2021-2022`

Bikes: KTM 450 XC-F 2021, KTM 450 XC-F 2022, Husqvarna FX 450 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214217_en_OM p. 38; 22_3214418_en_OM p. 37; 22_3402535_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 2 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 136 |
| Shock spring preload [22.8.3 XC-F US] | 7 mm (0.28 in) | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 136 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 21_3214217_en_OM p. 145; 22_3214418_en_OM p. 136 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 21_3214217_en_OM p. 145; 22_3214418_en_OM p. 136 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 21_3214217_en_OM p. 142; 22_3214418_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 18 | 21_3214217_en_OM p. 142; 22_3214418_en_OM p. 134 |
| Fork air pressure [22.7.3 XC-F US] | 10 bar (145 psi) | 21_3214217_en_OM p. 142; 22_3214418_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 21_3214217_en_OM p. 144; 22_3214418_en_OM p. 136; 22_3402535_en_OM p. 140 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214217_en_OM p. 47; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214217_en_OM p. 46; 22_3214418_en_OM p. 45; 22_3402535_en_OM p. 46 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 22_3402535_en_OM p. 140 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 FX 450] | 2 | 22_3402535_en_OM p. 140 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 22_3402535_en_OM p. 140 |
| Shock spring preload [22.8.3 FX 450] | 7 mm (0.28 in) | 22_3402535_en_OM p. 140 |
| Static sag [22.8.3 FX 450] | 35 mm (1.38 in) | 22_3402535_en_OM p. 140 |
| Rider sag [22.8.3 FX 450] | 105 mm (4.13 in) | 22_3402535_en_OM p. 140 |
| Fork compression, standard (clicks out from fully in) [22.7.3 FX 450] | 12 | 22_3402535_en_OM p. 138 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 FX 450] | 18 | 22_3402535_en_OM p. 138 |
| Fork air pressure [22.7.3 FX 450] | 10 bar (145 psi) | 22_3402535_en_OM p. 138 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2023-2024-450sxf-2023-2024`

Bikes: KTM 450 SX-F 2023, KTM 450 SX-F 2024, Husqvarna FC 450 2023, Husqvarna FC 450 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214642_en_OM p. 37; 24_3214836_en_OM p. 40; 23_3402633_en_OM p. 38; 24_3402715_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214642_en_OM p. 152 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 SX-F US] | 1.5 | 23_3214642_en_OM p. 152 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 SX-F US] | 15 | 23_3214642_en_OM p. 152 |
| Shock spring preload [22.8.2 SX-F US] | 8 mm (0.31 in) | 23_3214642_en_OM p. 152 |
| Static sag [22.8.2 SX-F US] | 35 mm (1.38 in) | 23_3214642_en_OM p. 152 |
| Rider sag [22.8.2 SX-F US] | 105 mm (4.13 in) | 23_3214642_en_OM p. 152 |
| Fork compression, standard (clicks out from fully in) [22.7.2 SX-F US] | 12 | 23_3214642_en_OM p. 150 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 SX-F US] | 18 | 23_3214642_en_OM p. 150 |
| Fork air pressure [22.7.2 SX-F US] | 10.7 bar (155 psi) | 23_3214642_en_OM p. 150 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3214642_en_OM p. 152; 24_3214836_en_OM p. 159; 23_3402633_en_OM p. 154; 24_3402715_en_OM p. 161 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214642_en_OM p. 46; 24_3214836_en_OM p. 49; 23_3402633_en_OM p. 48; 24_3402715_en_OM p. 49 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214642_en_OM p. 46; 24_3214836_en_OM p. 49; 23_3402633_en_OM p. 48; 24_3402715_en_OM p. 49 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214642_en_OM p. 46; 24_3214836_en_OM p. 49; 23_3402633_en_OM p. 48; 24_3402715_en_OM p. 49 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214642_en_OM p. 45; 24_3214836_en_OM p. 48; 23_3402633_en_OM p. 47; 24_3402715_en_OM p. 48 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 SX-F US] | 15 | 24_3214836_en_OM p. 159 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 SX-F US] | 1.5 | 24_3214836_en_OM p. 159 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 SX-F US] | 15 | 24_3214836_en_OM p. 159 |
| Shock spring preload [23.8.2 SX-F US] | 8 mm (0.31 in) | 24_3214836_en_OM p. 159 |
| Static sag [23.8.2 SX-F US] | 35 mm (1.38 in) | 24_3214836_en_OM p. 159 |
| Rider sag [23.8.2 SX-F US] | 105 mm (4.13 in) | 24_3214836_en_OM p. 159 |
| Fork compression, standard (clicks out from fully in) [23.7.2 SX-F US] | 12 | 24_3214836_en_OM p. 157 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 SX-F US] | 18 | 24_3214836_en_OM p. 157 |
| Fork air pressure [23.7.2 SX-F US] | 10.7 bar (155 psi) | 24_3214836_en_OM p. 157 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 All US models apart from Rockstar Edition] | 15 | 23_3402633_en_OM p. 154 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 All US models apart from Rockstar Edition] | 1.5 | 23_3402633_en_OM p. 154 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 All US models apart from Rockstar Edition] | 15 | 23_3402633_en_OM p. 154 |
| Shock spring preload [22.8.2 All US models apart from Rockstar Edition] | 8 mm (0.31 in) | 23_3402633_en_OM p. 154 |
| Static sag [22.8.2 All US models apart from Rockstar Edition] | 35 mm (1.38 in) | 23_3402633_en_OM p. 154 |
| Rider sag [22.8.2 All US models apart from Rockstar Edition] | 105 mm (4.13 in) | 23_3402633_en_OM p. 154 |
| Fork compression, standard (clicks out from fully in) [22.7.2 All US models apart from Rockstar Edition] | 12 | 23_3402633_en_OM p. 152 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 All US models apart from Rockstar Edition] | 18 | 23_3402633_en_OM p. 152 |
| Fork air pressure [22.7.2 All US models apart from Rockstar Edition] | 10.7 bar (155 psi) | 23_3402633_en_OM p. 152 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 FC US] | 15 | 24_3402715_en_OM p. 161 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 FC US] | 1.5 | 24_3402715_en_OM p. 161 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 FC US] | 15 | 24_3402715_en_OM p. 161 |
| Shock spring preload [23.8.2 FC US] | 8 mm (0.31 in) | 24_3402715_en_OM p. 161 |
| Static sag [23.8.2 FC US] | 35 mm (1.38 in) | 24_3402715_en_OM p. 161 |
| Rider sag [23.8.2 FC US] | 105 mm (4.13 in) | 24_3402715_en_OM p. 161 |
| Fork compression, standard (clicks out from fully in) [23.7.2 FC US] | 12 | 24_3402715_en_OM p. 159 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 FC US] | 18 | 24_3402715_en_OM p. 159 |
| Fork air pressure [23.7.2 FC US] | 10.7 bar (155 psi) | 24_3402715_en_OM p. 159 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fx450-2023-450xcf-2023`

Bikes: KTM 450 XC-F 2023, Husqvarna FX 450 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214642_en_OM p. 37; 23_3402633_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 23_3214642_en_OM p. 152 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 XC-F US] | 1.5 | 23_3214642_en_OM p. 153 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 XC-F US] | 15 | 23_3214642_en_OM p. 153 |
| Shock spring preload [22.8.3 XC-F US] | 8 mm (0.31 in) | 23_3214642_en_OM p. 153 |
| Static sag [22.8.3 XC-F US] | 35 mm (1.38 in) | 23_3214642_en_OM p. 153 |
| Rider sag [22.8.3 XC-F US] | 105 mm (4.13 in) | 23_3214642_en_OM p. 153 |
| Fork compression, standard (clicks out from fully in) [22.7.3 XC-F US] | 12 | 23_3214642_en_OM p. 150 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 XC-F US] | 18 | 23_3214642_en_OM p. 150 |
| Fork air pressure [22.7.3 XC-F US] | 10.1 bar (146 psi) | 23_3214642_en_OM p. 150 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3214642_en_OM p. 153; 23_3402633_en_OM p. 155 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214642_en_OM p. 46; 23_3402633_en_OM p. 48 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214642_en_OM p. 46; 23_3402633_en_OM p. 48 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214642_en_OM p. 46; 23_3402633_en_OM p. 48 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214642_en_OM p. 45; 23_3402633_en_OM p. 47 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 23_3402633_en_OM p. 155 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 FX 450] | 1.5 | 23_3402633_en_OM p. 155 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 23_3402633_en_OM p. 155 |
| Shock spring preload [22.8.3 FX 450] | 8 mm (0.31 in) | 23_3402633_en_OM p. 155 |
| Static sag [22.8.3 FX 450] | 35 mm (1.38 in) | 23_3402633_en_OM p. 155 |
| Rider sag [22.8.3 FX 450] | 105 mm (4.13 in) | 23_3402633_en_OM p. 155 |
| Fork compression, standard (clicks out from fully in) [22.7.3 FX 450] | 12 | 23_3402633_en_OM p. 152 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 FX 450] | 18 | 23_3402633_en_OM p. 152 |
| Fork air pressure [22.7.3 FX 450] | 10.1 bar (146 psi) | 23_3402633_en_OM p. 152 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-450sxf-2025`

Bikes: KTM 450 SX-F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 25_3240045_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All SX-F USA models] | 15 | 25_3240045_en_OM p. 155 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All SX-F USA models] | 1.5 | 25_3240045_en_OM p. 156 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All SX-F USA models] | 15 | 25_3240045_en_OM p. 156 |
| Shock spring preload [23.8.2 All SX-F USA models] | 8 mm (0.31 in) | 25_3240045_en_OM p. 156 |
| Static sag [23.8.2 All SX-F USA models] | 35 mm (1.38 in) | 25_3240045_en_OM p. 156 |
| Rider sag [23.8.2 All SX-F USA models] | 105 mm (4.13 in) | 25_3240045_en_OM p. 156 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All SX-F USA models] | 12 | 25_3240045_en_OM p. 154 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All SX-F USA models] | 18 | 25_3240045_en_OM p. 154 |
| Fork air pressure [23.7.2 All SX-F USA models] | 10.5 bar (152 psi) | 25_3240045_en_OM p. 154 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3240045_en_OM p. 156 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3240045_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3240045_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 25_3240045_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3240045_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2027-450sxf-2026-2027`

Bikes: KTM 450 SX-F 2026, KTM 450 SX-F 2027, Husqvarna FC 450 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240236_en_BA p. 44; 27_3240384_en_BA p. 45; 27_3402948_en_BA p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.2 Technical data - shock absorber (SX-F US)] | 15 | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.2 Technical data - shock absorber (SX-F US)] | 1.5 | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Shock rebound, standard (clicks out from fully in) [22.5.2 Technical data - shock absorber (SX-F US)] | 15 | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Shock spring preload [22.5.2 Technical data - shock absorber (SX-F US)] | 8 mm (0.31 in) | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Static sag [22.5.2 Technical data - shock absorber (SX-F US)] | 35 mm (1.38 in) | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Rider sag [22.5.2 Technical data - shock absorber (SX-F US)] | 105 mm (4.13 in) | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (SX-F US)] | 12 | 26_3240236_en_BA p. 171; 27_3240384_en_BA p. 155 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (SX-F US)] | 18 | 26_3240236_en_BA p. 172; 27_3240384_en_BA p. 156 |
| Fork air pressure by rider weight | 65-75 kg: 10.3 bar (149.4 psi), 75-85 kg: 10.5 bar (152.3 psi), 85-95 kg: 10.7 bar (155.2 psi) | 26_3240236_en_BA p. 172; 27_3240384_en_BA p. 156; 27_3402948_en_BA p. 155 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 26_3240236_en_BA p. 175; 27_3240384_en_BA p. 158; 27_3402948_en_BA p. 158 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3240236_en_BA p. 57; 27_3240384_en_BA p. 55; 27_3402948_en_BA p. 54 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3240236_en_BA p. 57; 27_3240384_en_BA p. 55; 27_3402948_en_BA p. 54 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240236_en_BA p. 57; 27_3240384_en_BA p. 55; 27_3402948_en_BA p. 54 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240236_en_BA p. 56; 27_3240384_en_BA p. 54; 27_3402948_en_BA p. 53 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 450 US)] | 15 | 27_3402948_en_BA p. 158 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (FC 450 US)] | 1.5 | 27_3402948_en_BA p. 158 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (FC 450 US)] | 15 | 27_3402948_en_BA p. 158 |
| Shock spring preload [22.5.3 Technical data - shock absorber (FC 450 US)] | 8 mm (0.31 in) | 27_3402948_en_BA p. 158 |
| Static sag [22.5.3 Technical data - shock absorber (FC 450 US)] | 35 mm (1.38 in) | 27_3402948_en_BA p. 158 |
| Rider sag [22.5.3 Technical data - shock absorber (FC 450 US)] | 105 mm (4.13 in) | 27_3402948_en_BA p. 158 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 450 US)] | 12 | 27_3402948_en_BA p. 155 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (FC 450 US)] | 18 | 27_3402948_en_BA p. 155 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc250-2025`

Bikes: Husqvarna FC 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402803_en_BA p. 40 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC 250 US)] | 15 | 25_3402803_en_BA p. 139 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.3 Technical data - shock absorber (FC 250 US)] | 1.5 | 25_3402803_en_BA p. 139 |
| Shock rebound, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC 250 US)] | 15 | 25_3402803_en_BA p. 139 |
| Shock spring preload [21.5.3 Technical data - shock absorber (FC 250 US)] | 8 mm | 25_3402803_en_BA p. 139 |
| Static sag [21.5.3 Technical data - shock absorber (FC 250 US)] | 35 mm | 25_3402803_en_BA p. 139 |
| Rider sag [21.5.3 Technical data - shock absorber (FC 250 US)] | 105 mm | 25_3402803_en_BA p. 139 |
| Fork compression, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC 250 US)] | 12 | 25_3402803_en_BA p. 137 |
| Fork rebound, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC 250 US)] | 18 | 25_3402803_en_BA p. 137 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 25_3402803_en_BA p. 139 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 10.3 bar | 25_3402803_en_BA p. 48 |
| Fork air pressure, minimum | 7 bar | 25_3402803_en_BA p. 48 |
| Fork air pressure, maximum | 12 bar | 25_3402803_en_BA p. 48 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3402803_en_BA p. 47 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc350-2025`

Bikes: Husqvarna FC 350 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402804_en_BA p. 41 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC US)] | 15 | 25_3402804_en_BA p. 142 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.3 Technical data - shock absorber (FC US)] | 1.5 | 25_3402804_en_BA p. 142 |
| Shock rebound, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC US)] | 15 | 25_3402804_en_BA p. 142 |
| Shock spring preload [21.5.3 Technical data - shock absorber (FC US)] | 8 mm | 25_3402804_en_BA p. 142 |
| Static sag [21.5.3 Technical data - shock absorber (FC US)] | 35 mm | 25_3402804_en_BA p. 142 |
| Rider sag [21.5.3 Technical data - shock absorber (FC US)] | 105 mm | 25_3402804_en_BA p. 142 |
| Fork compression, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC US)] | 12 | 25_3402804_en_BA p. 140 |
| Fork rebound, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC US)] | 12 | 25_3402804_en_BA p. 140 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 25_3402804_en_BA p. 142 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 8.6 bar | 25_3402804_en_BA p. 49 |
| Fork air pressure, minimum | 7 bar | 25_3402804_en_BA p. 49 |
| Fork air pressure, maximum | 12 bar | 25_3402804_en_BA p. 49 |
| Fork air pressure change step | 0.2 bar | 25_3402804_en_BA p. 49 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3402804_en_BA p. 48 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex450f-2025-fx350-2025`

Bikes: Husqvarna FX 350 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402804_en_BA p. 41; 25_3215223_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.5 Technical data - shock absorber (All FX models)] | 15 | 25_3402804_en_BA p. 143 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.5 Technical data - shock absorber (All FX models)] | 1.5 | 25_3402804_en_BA p. 143 |
| Shock rebound, standard (clicks out from fully in) [21.5.5 Technical data - shock absorber (All FX models)] | 15 | 25_3402804_en_BA p. 143 |
| Shock spring preload [21.5.5 Technical data - shock absorber (All FX models)] | 8 mm | 25_3402804_en_BA p. 143 |
| Static sag [21.5.5 Technical data - shock absorber (All FX models)] | 35 mm | 25_3402804_en_BA p. 143 |
| Rider sag [21.5.5 Technical data - shock absorber (All FX models)] | 105 mm | 25_3402804_en_BA p. 143 |
| Fork compression, standard (clicks out from fully in) [21.4.5 Technical data - fork (All FX models)] | 12 | 25_3402804_en_BA p. 141 |
| Fork rebound, standard (clicks out from fully in) [21.4.5 Technical data - fork (All FX models)] | 18 | 25_3402804_en_BA p. 141 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3402804_en_BA p. 143; 25_3215223_en_BA p. 155 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (EX-F)] | 15 | 25_3215223_en_BA p. 155 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.5 Technical data - shock absorber (EX-F)] | 1.5 | 25_3215223_en_BA p. 155 |
| Shock rebound, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (EX-F)] | 15 | 25_3215223_en_BA p. 155 |
| Shock spring preload [22.5.5 Technical data - shock absorber (EX-F)] | 8 mm | 25_3215223_en_BA p. 155 |
| Static sag [22.5.5 Technical data - shock absorber (EX-F)] | 35 mm | 25_3215223_en_BA p. 156 |
| Rider sag [22.5.5 Technical data - shock absorber (EX-F)] | 105 mm | 25_3215223_en_BA p. 156 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data - fork (EX-F)] | 12 | 25_3215223_en_BA p. 153 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data - fork (EX-F)] | 18 | 25_3215223_en_BA p. 153 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2025`

Bikes: Husqvarna FC 450 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 25_3402805_en_BA p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC 450 US)] | 15 | 25_3402805_en_BA p. 152 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.3 Technical data - shock absorber (FC 450 US)] | 1.5 | 25_3402805_en_BA p. 152 |
| Shock rebound, standard (clicks out from fully in) [21.5.3 Technical data - shock absorber (FC 450 US)] | 15 | 25_3402805_en_BA p. 152 |
| Shock spring preload [21.5.3 Technical data - shock absorber (FC 450 US)] | 8 mm (0.31 in) | 25_3402805_en_BA p. 152 |
| Static sag [21.5.3 Technical data - shock absorber (FC 450 US)] | 35 mm (1.38 in) | 25_3402805_en_BA p. 152 |
| Rider sag [21.5.3 Technical data - shock absorber (FC 450 US)] | 105 mm (4.13 in) | 25_3402805_en_BA p. 152 |
| Fork compression, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC 450 US)] | 12 | 25_3402805_en_BA p. 148 |
| Fork rebound, standard (clicks out from fully in) [21.4.3 Technical data - fork (FC 450 US)] | 18 | 25_3402805_en_BA p. 148 |
| Fork air pressure [21.4.3 Technical data - fork (FC 450 US)] | 10.5 bar (152.3 psi) | 25_3402805_en_BA p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3402805_en_BA p. 152 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3402805_en_BA p. 54 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3402805_en_BA p. 54 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 25_3402805_en_BA p. 54 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3402805_en_BA p. 53 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc250f-2023-mc350f-2023-fc250-2020-fc350-2020`

Bikes: GasGas MC 250F 2023, GasGas MC 350F 2023, Husqvarna FC 250 2020, Husqvarna FC 350 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3215097_en_OM p. 33; 23_3215099_en_OM p. 33; 20_3402335_en_OM p. 36; 20_3402336_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 MC] | 15 | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 MC] | 1.5 | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 MC] | 15 | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126 |
| Shock spring preload [22.8.1 MC] | 8 mm (0.31 in) | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126 |
| Static sag [22.8.1 MC] | 35 mm (1.38 in) | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127 |
| Rider sag [22.8.1 MC] | 105 mm (4.13 in) | 23_3215097_en_OM p. 126; 23_3215099_en_OM p. 127 |
| Fork compression, standard (clicks out from fully in) [22.7.1 MC] | 12 | 23_3215097_en_OM p. 124; 23_3215099_en_OM p. 125 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 MC] | 12 | 23_3215097_en_OM p. 124; 23_3215099_en_OM p. 125 |
| Fork air pressure [22.7.1 MC] | 10.4 bar (151 psi) | 23_3215097_en_OM p. 124; 23_3215099_en_OM p. 125 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3215097_en_OM p. 125; 23_3215099_en_OM p. 126; 20_3402335_en_OM p. 130; 20_3402336_en_OM p. 143 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 20_3402335_en_OM p. 43; 20_3402336_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 20_3402335_en_OM p. 43; 20_3402336_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 20_3402335_en_OM p. 43; 20_3402336_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3215097_en_OM p. 40; 23_3215099_en_OM p. 40; 20_3402335_en_OM p. 43; 20_3402336_en_OM p. 45 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 20_3402335_en_OM p. 130 |
| Shock high-speed compression, standard (turns out from fully in) [22.8 Shock absorber] | 1.5 | 20_3402335_en_OM p. 130 |
| Shock rebound, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 20_3402335_en_OM p. 130 |
| Shock spring preload [22.8 Shock absorber] | 8 mm (0.31 in) | 20_3402335_en_OM p. 130 |
| Static sag [22.8 Shock absorber] | 35 mm (1.38 in) | 20_3402335_en_OM p. 130 |
| Rider sag [22.8 Shock absorber] | 105 mm (4.13 in) | 20_3402335_en_OM p. 130 |
| Fork compression, standard (clicks out from fully in) [22.7 Fork] | 12 | 20_3402335_en_OM p. 129 |
| Fork rebound, standard (clicks out from fully in) [22.7 Fork] | 12 | 20_3402335_en_OM p. 129 |
| Fork air pressure [22.7 Fork] | 10.4 bar (151 psi) | 20_3402335_en_OM p. 129 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 FC 350] | 15 | 20_3402336_en_OM p. 142 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 FC 350] | 1.5 | 20_3402336_en_OM p. 142 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 FC 350] | 15 | 20_3402336_en_OM p. 143 |
| Shock spring preload [22.8.1 FC 350] | 8 mm (0.31 in) | 20_3402336_en_OM p. 143 |
| Static sag [22.8.1 FC 350] | 35 mm (1.38 in) | 20_3402336_en_OM p. 143 |
| Rider sag [22.8.1 FC 350] | 105 mm (4.13 in) | 20_3402336_en_OM p. 143 |
| Fork compression, standard (clicks out from fully in) [22.7.1 FC 350] | 12 | 20_3402336_en_OM p. 141 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 FC 350] | 12 | 20_3402336_en_OM p. 141 |
| Fork air pressure [22.7.1 FC 350] | 10.4 bar (151 psi) | 20_3402336_en_OM p. 142 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc250f-2024`

Bikes: GasGas MC 250F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3215160_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 All MC-F standard models] | 15 | 24_3215160_en_OM p. 147 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 All MC-F standard models] | 1.5 | 24_3215160_en_OM p. 147 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 All MC-F standard models] | 15 | 24_3215160_en_OM p. 147 |
| Shock spring preload [23.8.1 All MC-F standard models] | 8 mm (0.31 in) | 24_3215160_en_OM p. 147 |
| Static sag [23.8.1 All MC-F standard models] | 35 mm (1.38 in) | 24_3215160_en_OM p. 147 |
| Rider sag [23.8.1 All MC-F standard models] | 105 mm (4.13 in) | 24_3215160_en_OM p. 148 |
| Fork compression, standard (clicks out from fully in) [23.7.1 All MC-F standard models] | 12 | 24_3215160_en_OM p. 146 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 All MC-F standard models] | 12 | 24_3215160_en_OM p. 146 |
| Fork air pressure [23.7.1 All MC-F standard models] | 10.3 bar (149 psi) | 24_3215160_en_OM p. 146 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 24_3215160_en_OM p. 147 |
| Fork air pressure, minimum | 7 bar (102 psi) | 24_3215160_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 24_3215160_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 24_3215160_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 24_3215160_en_OM p. 44 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc250f-2025`

Bikes: GasGas MC 250F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3215221_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 15 | 25_3215221_en_BA p. 152 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 1.5 | 25_3215221_en_BA p. 152 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 15 | 25_3215221_en_BA p. 152 |
| Shock spring preload [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 8 mm | 25_3215221_en_BA p. 152 |
| Static sag [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 35 mm | 25_3215221_en_BA p. 152 |
| Rider sag [22.5.1 Technical data - shock absorber (All MC-F standard models)] | 105 mm | 25_3215221_en_BA p. 152 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (All MC-F standard models)] | 12 | 25_3215221_en_BA p. 150 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (All MC-F standard models)] | 12 | 25_3215221_en_BA p. 150 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 25_3215221_en_BA p. 152 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex250f-2025`

Bikes: GasGas EX 250F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3215221_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (EX 250F)] | 15 | 25_3215221_en_BA p. 153 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.5 Technical data - shock absorber (EX 250F)] | 1.5 | 25_3215221_en_BA p. 153 |
| Shock rebound, standard (clicks out from fully in) [22.5.5 Technical data - shock absorber (EX 250F)] | 15 | 25_3215221_en_BA p. 153 |
| Shock spring preload [22.5.5 Technical data - shock absorber (EX 250F)] | 8 mm | 25_3215221_en_BA p. 153 |
| Static sag [22.5.5 Technical data - shock absorber (EX 250F)] | 35 mm | 25_3215221_en_BA p. 154 |
| Rider sag [22.5.5 Technical data - shock absorber (EX 250F)] | 105 mm | 25_3215221_en_BA p. 154 |
| Fork compression, standard (clicks out from fully in) [22.4.5 Technical data - fork (EX 250F)] | 12 | 25_3215221_en_BA p. 151 |
| Fork rebound, standard (clicks out from fully in) [22.4.5 Technical data - fork (EX 250F)] | 18 | 25_3215221_en_BA p. 151 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 25_3215221_en_BA p. 153 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc250f-2026`

Bikes: GasGas MC 250F 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3215268_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 26_3215268_en_BA p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber] | 1.5 | 26_3215268_en_BA p. 137 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 26_3215268_en_BA p. 137 |
| Shock spring preload [22.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 26_3215268_en_BA p. 137 |
| Static sag [22.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 26_3215268_en_BA p. 137 |
| Rider sag [22.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 26_3215268_en_BA p. 137 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 26_3215268_en_BA p. 136 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 26_3215268_en_BA p. 136 |
| Fork air pressure [22.4.1 Technical data - fork] | 10.3 bar (149.4 psi) | 26_3215268_en_BA p. 136 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 26_3215268_en_BA p. 137 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3215268_en_BA p. 41 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3215268_en_BA p. 41 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3215268_en_BA p. 41 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3215268_en_BA p. 41 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc250f-2027`

Bikes: GasGas MC 250F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 27_3215290_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 27_3215290_en_BA p. 138 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber] | 1.5 | 27_3215290_en_BA p. 139 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 27_3215290_en_BA p. 139 |
| Shock spring preload [22.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 27_3215290_en_BA p. 139 |
| Static sag [22.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 27_3215290_en_BA p. 139 |
| Rider sag [22.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 27_3215290_en_BA p. 139 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 27_3215290_en_BA p. 138 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 27_3215290_en_BA p. 138 |
| Fork air pressure by rider weight | 65-75 kg: 10.1 bar (146.5 psi), 75-85 kg: 10.3 bar (149.4 psi), 85-95 kg: 10.5 bar (152.3 psi) | 27_3215290_en_BA p. 138 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 27_3215290_en_BA p. 139 |
| Fork air pressure, minimum | 7 bar (102 psi) | 27_3215290_en_BA p. 41 |
| Fork air pressure, maximum | 12 bar (174 psi) | 27_3215290_en_BA p. 41 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 27_3215290_en_BA p. 41 |
| Wait after switching off before checking fork air (minutes) | 5 | 27_3215290_en_BA p. 41 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc350f-2024`

Bikes: GasGas MC 350F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3215161_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 MC 350F] | 15 | 24_3215161_en_OM p. 131 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 MC 350F] | 1.5 | 24_3215161_en_OM p. 131 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 MC 350F] | 15 | 24_3215161_en_OM p. 131 |
| Shock spring preload [22.8.1 MC 350F] | 8 mm (0.31 in) | 24_3215161_en_OM p. 131 |
| Static sag [22.8.1 MC 350F] | 35 mm (1.38 in) | 24_3215161_en_OM p. 131 |
| Rider sag [22.8.1 MC 350F] | 105 mm (4.13 in) | 24_3215161_en_OM p. 131 |
| Fork compression, standard (clicks out from fully in) [22.7.1 MC 350F] | 12 | 24_3215161_en_OM p. 130 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 MC 350F] | 12 | 24_3215161_en_OM p. 130 |
| Fork air pressure [22.7.1 MC 350F] | 10.3 bar (149 psi) | 24_3215161_en_OM p. 130 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3215161_en_OM p. 131 |
| Fork air pressure, minimum | 7 bar (102 psi) | 24_3215161_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 24_3215161_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 24_3215161_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 24_3215161_en_OM p. 39 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc350f-2025`

Bikes: GasGas MC 350F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 25_3215222_en_BA p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [21.5.1 Technical data - shock absorber (MC)] | 15 | 25_3215222_en_BA p. 138 |
| Shock high-speed compression, standard (turns out from fully in) [21.5.1 Technical data - shock absorber (MC)] | 1.5 | 25_3215222_en_BA p. 138 |
| Shock rebound, standard (clicks out from fully in) [21.5.1 Technical data - shock absorber (MC)] | 15 | 25_3215222_en_BA p. 138 |
| Shock spring preload [21.5.1 Technical data - shock absorber (MC)] | 8 mm (0.31 in) | 25_3215222_en_BA p. 138 |
| Static sag [21.5.1 Technical data - shock absorber (MC)] | 35 mm (1.38 in) | 25_3215222_en_BA p. 139 |
| Rider sag [21.5.1 Technical data - shock absorber (MC)] | 105 mm (4.13 in) | 25_3215222_en_BA p. 139 |
| Fork compression, standard (clicks out from fully in) [21.4.1 Technical data - fork (MC)] | 12 | 25_3215222_en_BA p. 137 |
| Fork rebound, standard (clicks out from fully in) [21.4.1 Technical data - fork (MC)] | 12 | 25_3215222_en_BA p. 137 |
| Fork air pressure [21.4.1 Technical data - fork (MC)] | 10.4 bar (150.8 psi) | 25_3215222_en_BA p. 137 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3215222_en_BA p. 138 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3215222_en_BA p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3215222_en_BA p. 45 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 25_3215222_en_BA p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3215222_en_BA p. 44 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc450f-2021-2023`

Bikes: GasGas MC 450F 2023, GasGas MC 450F 2021, GasGas MC 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3215100_en_OM p. 33; 21_3215010_en_OM p. 33; 22_3215055_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 MC] | 15 | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 MC] | 1.5 | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 MC] | 15 | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Shock spring preload [22.8.1 MC] | 8 mm (0.31 in) | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Static sag [22.8.1 MC] | 35 mm (1.38 in) | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Rider sag [22.8.1 MC] | 105 mm (4.13 in) | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Fork compression, standard (clicks out from fully in) [22.7.1 MC] | 12 | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 MC] | 12 | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Fork air pressure [22.7.1 MC] | 10.7 bar (155 psi) | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125; 22_3215055_en_OM p. 140 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 MC 450F] | 15 | 22_3215055_en_OM p. 139 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 MC 450F] | 1.5 | 22_3215055_en_OM p. 139 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 MC 450F] | 15 | 22_3215055_en_OM p. 139 |
| Shock spring preload [22.8.1 MC 450F] | 8 mm (0.31 in) | 22_3215055_en_OM p. 139 |
| Static sag [22.8.1 MC 450F] | 35 mm (1.38 in) | 22_3215055_en_OM p. 140 |
| Rider sag [22.8.1 MC 450F] | 105 mm (4.13 in) | 22_3215055_en_OM p. 140 |
| Fork compression, standard (clicks out from fully in) [22.7.1 MC 450F] | 12 | 22_3215055_en_OM p. 138 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 MC 450F] | 12 | 22_3215055_en_OM p. 138 |
| Fork air pressure [22.7.1 MC 450F] | 10.7 bar (155 psi) | 22_3215055_en_OM p. 138 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-ex450f-2021-2023`

Bikes: GasGas EX 450F 2023, GasGas EX 450F 2021, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3215100_en_OM p. 33; 21_3215010_en_OM p. 33; 22_3215055_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 EX] | 15 | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 EX] | 2 | 23_3215100_en_OM p. 126; 21_3215010_en_OM p. 125 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 EX] | 15 | 23_3215100_en_OM p. 127; 21_3215010_en_OM p. 125 |
| Shock spring preload [22.8.2 EX] | 7 mm (0.28 in) | 23_3215100_en_OM p. 127; 21_3215010_en_OM p. 125 |
| Static sag [22.8.2 EX] | 35 mm (1.38 in) | 23_3215100_en_OM p. 127; 21_3215010_en_OM p. 126 |
| Rider sag [22.8.2 EX] | 105 mm (4.13 in) | 23_3215100_en_OM p. 127; 21_3215010_en_OM p. 126 |
| Fork compression, standard (clicks out from fully in) [22.7.2 EX] | 12 | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 EX] | 18 | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Fork air pressure [22.7.2 EX] | 10.0 bar (145 psi) | 23_3215100_en_OM p. 125; 21_3215010_en_OM p. 124 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3215100_en_OM p. 127; 21_3215010_en_OM p. 126; 22_3215055_en_OM p. 141 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3215100_en_OM p. 40; 21_3215010_en_OM p. 40; 22_3215055_en_OM p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 EX] | 15 | 22_3215055_en_OM p. 140 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 EX] | 2 | 22_3215055_en_OM p. 141 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 EX] | 15 | 22_3215055_en_OM p. 141 |
| Shock spring preload [22.8.3 EX] | 7 mm (0.28 in) | 22_3215055_en_OM p. 141 |
| Static sag [22.8.3 EX] | 35 mm (1.38 in) | 22_3215055_en_OM p. 141 |
| Rider sag [22.8.3 EX] | 105 mm (4.13 in) | 22_3215055_en_OM p. 141 |
| Fork compression, standard (clicks out from fully in) [22.7.3 EX] | 12 | 22_3215055_en_OM p. 139 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 EX] | 18 | 22_3215055_en_OM p. 139 |
| Fork air pressure [22.7.3 EX] | 10.0 bar (145 psi) | 22_3215055_en_OM p. 139 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc450f-2024`

Bikes: GasGas MC 450F 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3215162_en_OM p. 36 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 MC-F] | 15 | 24_3215162_en_OM p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 MC-F] | 1.5 | 24_3215162_en_OM p. 144 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 MC-F] | 15 | 24_3215162_en_OM p. 144 |
| Shock spring preload [23.8.1 MC-F] | 8 mm (0.31 in) | 24_3215162_en_OM p. 144 |
| Static sag [23.8.1 MC-F] | 35 mm (1.38 in) | 24_3215162_en_OM p. 144 |
| Rider sag [23.8.1 MC-F] | 105 mm (4.13 in) | 24_3215162_en_OM p. 144 |
| Fork compression, standard (clicks out from fully in) [23.7.1 MC-F] | 12 | 24_3215162_en_OM p. 142 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 MC-F] | 12 | 24_3215162_en_OM p. 142 |
| Fork air pressure [23.7.1 MC-F] | 10.4 bar (151 psi) | 24_3215162_en_OM p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3215162_en_OM p. 144 |
| Fork air pressure, minimum | 7 bar (102 psi) | 24_3215162_en_OM p. 44 |
| Fork air pressure, maximum | 12 bar (174 psi) | 24_3215162_en_OM p. 44 |
| Fork air pressure change step | 0.2 bar (3 psi) | 24_3215162_en_OM p. 44 |
| Wait after switching off before checking fork air (minutes) | 5 | 24_3215162_en_OM p. 43 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc450f-2025`

Bikes: GasGas MC 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3215223_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (MC-F standard model)] | 15 | 25_3215223_en_BA p. 154 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (MC-F standard model)] | 1.5 | 25_3215223_en_BA p. 154 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (MC-F standard model)] | 15 | 25_3215223_en_BA p. 154 |
| Shock spring preload [22.5.1 Technical data - shock absorber (MC-F standard model)] | 8 mm | 25_3215223_en_BA p. 154 |
| Static sag [22.5.1 Technical data - shock absorber (MC-F standard model)] | 35 mm | 25_3215223_en_BA p. 154 |
| Rider sag [22.5.1 Technical data - shock absorber (MC-F standard model)] | 105 mm | 25_3215223_en_BA p. 154 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (MC-F standard model)] | 12 | 25_3215223_en_BA p. 152 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (MC-F standard model)] | 12 | 25_3215223_en_BA p. 152 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3215223_en_BA p. 154 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-mc450f-2026-2027`

Bikes: GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3215269_en_BA p. 34; 27_3215291_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber] | 1.5 | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Shock spring preload [22.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Static sag [22.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Rider sag [22.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 26_3215269_en_BA p. 135; 27_3215291_en_BA p. 137 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 26_3215269_en_BA p. 135; 27_3215291_en_BA p. 137 |
| Fork air pressure by rider weight | 65-75 kg: 10.2 bar (147.9 psi), 75-85 kg: 10.4 bar (150.8 psi), 85-95 kg: 10.6 bar (153.7 psi) | 26_3215269_en_BA p. 135; 27_3215291_en_BA p. 137 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 26_3215269_en_BA p. 136; 27_3215291_en_BA p. 138 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3215269_en_BA p. 42; 27_3215291_en_BA p. 42 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3215269_en_BA p. 42; 27_3215291_en_BA p. 42 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3215269_en_BA p. 42; 27_3215291_en_BA p. 42 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3215269_en_BA p. 41; 27_3215291_en_BA p. 41 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc250-2021-2022`

Bikes: Husqvarna FC 250 2021, Husqvarna FC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3402442_en_OM p. 36; 22_3402532_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FC 250 US] | 15 | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FC 250 US] | 2 | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FC 250 US] | 15 | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Shock spring preload [22.8.2 FC 250 US] | 7 mm (0.28 in) | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Static sag [22.8.2 FC 250 US] | 35 mm (1.38 in) | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Rider sag [22.8.2 FC 250 US] | 105 mm (4.13 in) | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FC 250 US] | 12 | 21_3402442_en_OM p. 132; 22_3402532_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FC 250 US] | 18 | 21_3402442_en_OM p. 132; 22_3402532_en_OM p. 134 |
| Fork air pressure [22.7.2 FC 250 US] | 10.5 bar (152 psi) | 21_3402442_en_OM p. 132; 22_3402532_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3402442_en_OM p. 133; 22_3402532_en_OM p. 135 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3402442_en_OM p. 43; 22_3402532_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3402442_en_OM p. 43; 22_3402532_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3402442_en_OM p. 43; 22_3402532_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3402442_en_OM p. 43; 22_3402532_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fx350-2020`

Bikes: Husqvarna FX 350 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3402336_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FX 350] | 15 | 20_3402336_en_OM p. 143 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FX 350] | 2 | 20_3402336_en_OM p. 143 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FX 350] | 15 | 20_3402336_en_OM p. 143 |
| Shock spring preload [22.8.2 FX 350] | 7 mm (0.28 in) | 20_3402336_en_OM p. 143 |
| Static sag [22.8.2 FX 350] | 35 mm (1.38 in) | 20_3402336_en_OM p. 143 |
| Rider sag [22.8.2 FX 350] | 105 mm (4.13 in) | 20_3402336_en_OM p. 143 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FX 350] | 12 | 20_3402336_en_OM p. 142 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FX 350] | 12 | 20_3402336_en_OM p. 142 |
| Fork air pressure [22.7.2 FX 350] | 9.8 bar (142 psi) | 20_3402336_en_OM p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3402336_en_OM p. 143 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3402336_en_OM p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3402336_en_OM p. 45 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3402336_en_OM p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3402336_en_OM p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc350-2021-2022`

Bikes: Husqvarna FC 350 2021, Husqvarna FC 350 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3402443_en_OM p. 38; 22_3402534_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FC 350 US] | 15 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FC 350 US] | 2 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FC 350 US] | 15 | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Shock spring preload [22.8.2 FC 350 US] | 7 mm (0.28 in) | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Static sag [22.8.2 FC 350 US] | 35 mm (1.38 in) | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Rider sag [22.8.2 FC 350 US] | 105 mm (4.13 in) | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FC 350 US] | 12 | 21_3402443_en_OM p. 144; 22_3402534_en_OM p. 139 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FC 350 US] | 18 | 21_3402443_en_OM p. 144; 22_3402534_en_OM p. 139 |
| Fork air pressure [22.7.2 FC 350 US] | 10.6 bar (154 psi) | 21_3402443_en_OM p. 144; 22_3402534_en_OM p. 139 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3402443_en_OM p. 146; 22_3402534_en_OM p. 141 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3402443_en_OM p. 47; 22_3402534_en_OM p. 47 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3402443_en_OM p. 46; 22_3402534_en_OM p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2020`

Bikes: Husqvarna FC 450 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3402354_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.1 FC 450] | 15 | 20_3402354_en_OM p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.1 FC 450] | 1.5 | 20_3402354_en_OM p. 150 |
| Shock rebound, standard (clicks out from fully in) [22.8.1 FC 450] | 15 | 20_3402354_en_OM p. 151 |
| Shock spring preload [22.8.1 FC 450] | 8 mm (0.31 in) | 20_3402354_en_OM p. 151 |
| Static sag [22.8.1 FC 450] | 35 mm (1.38 in) | 20_3402354_en_OM p. 151 |
| Rider sag [22.8.1 FC 450] | 105 mm (4.13 in) | 20_3402354_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [22.7.1 FC 450] | 12 | 20_3402354_en_OM p. 149 |
| Fork rebound, standard (clicks out from fully in) [22.7.1 FC 450] | 12 | 20_3402354_en_OM p. 149 |
| Fork air pressure [22.7.1 FC 450] | 10.7 bar (155 psi) | 20_3402354_en_OM p. 149 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3402354_en_OM p. 151 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3402354_en_OM p. 47 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fx450-2020`

Bikes: Husqvarna FX 450 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3402354_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FX 450] | 15 | 20_3402354_en_OM p. 151 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FX 450] | 2 | 20_3402354_en_OM p. 151 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FX 450] | 15 | 20_3402354_en_OM p. 151 |
| Shock spring preload [22.8.2 FX 450] | 8 mm (0.31 in) | 20_3402354_en_OM p. 151 |
| Static sag [22.8.2 FX 450] | 35 mm (1.38 in) | 20_3402354_en_OM p. 151 |
| Rider sag [22.8.2 FX 450] | 105 mm (4.13 in) | 20_3402354_en_OM p. 151 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FX 450] | 12 | 20_3402354_en_OM p. 149 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FX 450] | 12 | 20_3402354_en_OM p. 149 |
| Fork air pressure [22.7.2 FX 450] | 10.1 bar (146 psi) | 20_3402354_en_OM p. 150 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 20_3402354_en_OM p. 151 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3402354_en_OM p. 47 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fc450-2021`

Bikes: Husqvarna FC 450 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3402445_en_OM p. 40 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.2 FC 450 US] | 15 | 21_3402445_en_OM p. 154 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.2 FC 450 US] | 2 | 21_3402445_en_OM p. 154 |
| Shock rebound, standard (clicks out from fully in) [22.8.2 FC 450 US] | 15 | 21_3402445_en_OM p. 154 |
| Shock spring preload [22.8.2 FC 450 US] | 7 mm (0.28 in) | 21_3402445_en_OM p. 154 |
| Static sag [22.8.2 FC 450 US] | 35 mm (1.38 in) | 21_3402445_en_OM p. 154 |
| Rider sag [22.8.2 FC 450 US] | 105 mm (4.13 in) | 21_3402445_en_OM p. 154 |
| Fork compression, standard (clicks out from fully in) [22.7.2 FC 450 US] | 12 | 21_3402445_en_OM p. 152 |
| Fork rebound, standard (clicks out from fully in) [22.7.2 FC 450 US] | 18 | 21_3402445_en_OM p. 152 |
| Fork air pressure [22.7.2 FC 450 US] | 10.7 bar (155 psi) | 21_3402445_en_OM p. 152 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 21_3402445_en_OM p. 154 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3402445_en_OM p. 48 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg4t-suspension-baseline-v1-fx450-2021`

Bikes: Husqvarna FX 450 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3402445_en_OM p. 40 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 21_3402445_en_OM p. 154 |
| Shock high-speed compression, standard (turns out from fully in) [22.8.3 FX 450] | 2 | 21_3402445_en_OM p. 154 |
| Shock rebound, standard (clicks out from fully in) [22.8.3 FX 450] | 15 | 21_3402445_en_OM p. 155 |
| Shock spring preload [22.8.3 FX 450] | 7 mm (0.28 in) | 21_3402445_en_OM p. 155 |
| Static sag [22.8.3 FX 450] | 35 mm (1.38 in) | 21_3402445_en_OM p. 155 |
| Rider sag [22.8.3 FX 450] | 105 mm (4.13 in) | 21_3402445_en_OM p. 155 |
| Fork compression, standard (clicks out from fully in) [22.7.3 FX 450] | 12 | 21_3402445_en_OM p. 152 |
| Fork rebound, standard (clicks out from fully in) [22.7.3 FX 450] | 18 | 21_3402445_en_OM p. 152 |
| Fork air pressure [22.7.3 FX 450] | 10 bar (145 psi) | 21_3402445_en_OM p. 152 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 21_3402445_en_OM p. 155 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3402445_en_OM p. 48 |

### Pre-ride check

`bak-ktmg4t-pre-ride-v1-ex250f-2021-2022-and-more-f1f37b99`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Pre-ride item: Engine oil level | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Front brake fluid | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Rear brake fluid | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Front brake pads | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Rear brake pads | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Brakes work | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Coolant level | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Chain dirt | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Chain and sprockets | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Chain tension | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Tyres | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Tyre pressure | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 20_3214129_en_OM p. 102; 21_3214213_en_OM p. 105; 22_3214414_en_OM p. 99; 20_3214004_en_OM p. 98; 21_3214215_en_OM p. 106; 22_3214417_en_OM p. 106; 20_3214032_en_OM p. 106; 21_3214217_en_OM p. 106; 22_3214418_en_OM p. 100; 20_3402335_en_OM p. 94; 21_3402442_en_OM p. 96; 22_3402532_en_OM p. 98; 20_3402336_en_OM p. 105; 21_3402443_en_OM p. 107; 22_3402534_en_OM p. 102; 20_3402354_en_OM p. 113; 21_3402445_en_OM p. 115; 22_3402535_en_OM p. 101; 21_3215009_en_OM p. 92; 22_3215053_en_OM p. 92; 22_3215054_en_OM p. 92; 21_3215019_en_OM p. 88; 21_3215010_en_OM p. 91 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 20_3214129_en_OM p. 102; 21_3214213_en_OM p. 105; 22_3214414_en_OM p. 99; 20_3214004_en_OM p. 98; 21_3214215_en_OM p. 106; 22_3214417_en_OM p. 106; 20_3214032_en_OM p. 106; 21_3214217_en_OM p. 106; 22_3214418_en_OM p. 100; 20_3402335_en_OM p. 94; 21_3402442_en_OM p. 96; 22_3402532_en_OM p. 98; 20_3402336_en_OM p. 105; 21_3402443_en_OM p. 107; 22_3402534_en_OM p. 102; 20_3402354_en_OM p. 113; 21_3402445_en_OM p. 115; 22_3402535_en_OM p. 101; 21_3215009_en_OM p. 92; 22_3215053_en_OM p. 92; 22_3215054_en_OM p. 92; 21_3215019_en_OM p. 88; 21_3215010_en_OM p. 91 |
| Pre-ride item: Spokes | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Fork dust boots | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Bleed the fork | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Air filter | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Controls | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Nuts and bolts | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |
| Pre-ride item: Fuel | listed | 20_3214129_en_OM p. 27; 21_3214213_en_OM p. 27; 22_3214414_en_OM p. 27; 20_3214004_en_OM p. 27; 21_3214215_en_OM p. 28; 22_3214417_en_OM p. 28; 20_3214032_en_OM p. 28; 21_3214217_en_OM p. 28; 22_3214418_en_OM p. 27; 20_3402335_en_OM p. 26; 21_3402442_en_OM p. 26; 22_3402532_en_OM p. 27; 20_3402336_en_OM p. 28; 21_3402443_en_OM p. 28; 22_3402534_en_OM p. 28; 20_3402354_en_OM p. 29; 21_3402445_en_OM p. 30; 22_3402535_en_OM p. 28; 21_3215009_en_OM p. 25; 22_3215053_en_OM p. 25; 22_3215054_en_OM p. 25; 21_3215019_en_OM p. 24; 21_3215010_en_OM p. 25 |

### Pre-ride check

`bak-ktmg4t-pre-ride-v1-ex250f-2023-2024-and-more-b250153f`

Bikes: KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FC 450 2023, Husqvarna FX 450 2023, Husqvarna FC 450 2024, Husqvarna FX 450 2024, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 450F 2023, GasGas EX 450F 2023, GasGas MC 450F 2024, GasGas EX 450F 2024, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Pre-ride item: Electrics work | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Engine oil level | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Front brake fluid | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Rear brake fluid | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Front brake pads | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Rear brake pads | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Brakes work | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Coolant level | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Chain dirt | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Chain and sprockets | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Chain tension | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Tyres | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Tyre pressure | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 23_3214640_en_OM p. 99; 24_3214834_en_OM p. 112; 25_3240043_en_OM p. 108; 23_3214641_en_OM p. 108; 24_3214835_en_OM p. 111; 25_3240044_en_OM p. 111; 23_3214642_en_OM p. 112; 24_3214836_en_OM p. 116; 25_3240045_en_OM p. 113; 23_3402631_en_OM p. 101; 24_3402713_en_OM p. 107; 23_3402632_en_OM p. 104; 24_3402714_en_OM p. 104; 23_3402633_en_OM p. 114; 24_3402715_en_OM p. 118; 23_3215097_en_OM p. 92; 24_3215160_en_OM p. 106; 23_3215099_en_OM p. 93; 24_3215161_en_OM p. 94; 23_3215100_en_OM p. 91; 24_3215162_en_OM p. 104; 22_3215055_en_OM p. 103 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 23_3214640_en_OM p. 99; 24_3214834_en_OM p. 112; 25_3240043_en_OM p. 108; 23_3214641_en_OM p. 108; 24_3214835_en_OM p. 111; 25_3240044_en_OM p. 111; 23_3214642_en_OM p. 112; 24_3214836_en_OM p. 116; 25_3240045_en_OM p. 113; 23_3402631_en_OM p. 101; 24_3402713_en_OM p. 107; 23_3402632_en_OM p. 104; 24_3402714_en_OM p. 104; 23_3402633_en_OM p. 114; 24_3402715_en_OM p. 118; 23_3215097_en_OM p. 92; 24_3215160_en_OM p. 106; 23_3215099_en_OM p. 93; 24_3215161_en_OM p. 94; 23_3215100_en_OM p. 91; 24_3215162_en_OM p. 104; 22_3215055_en_OM p. 103 |
| Pre-ride item: Spokes | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Fork dust boots | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Bleed the fork | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Air filter | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Controls | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Nuts and bolts | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |
| Pre-ride item: Fuel | listed | 23_3214640_en_OM p. 26; 24_3214834_en_OM p. 30; 25_3240043_en_OM p. 29; 23_3214641_en_OM p. 28; 24_3214835_en_OM p. 29; 25_3240044_en_OM p. 29; 23_3214642_en_OM p. 27; 24_3214836_en_OM p. 29; 25_3240045_en_OM p. 28; 23_3402631_en_OM p. 26; 24_3402713_en_OM p. 27; 23_3402632_en_OM p. 27; 24_3402714_en_OM p. 27; 23_3402633_en_OM p. 28; 24_3402715_en_OM p. 29; 23_3215097_en_OM p. 25; 24_3215160_en_OM p. 27; 23_3215099_en_OM p. 25; 24_3215161_en_OM p. 25; 23_3215100_en_OM p. 25; 24_3215162_en_OM p. 26; 22_3215055_en_OM p. 27 |

### Pre-ride check

`bak-ktmg4t-pre-ride-v1-ex350f-2025-and-more-34934320`

Bikes: KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2026, KTM 450 XC-F 2026, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2027, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2025, Husqvarna FX 450 2025, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2026, GasGas MC 450F 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Pre-ride item: Electrics work | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Engine oil level | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Front brake fluid | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Rear brake fluid | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Front brake pads | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Rear brake pads | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Brakes work | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Coolant level | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Chain dirt | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Chain and sprockets | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Chain tension | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Tyres | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Tyre pressure | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Off-road tyre pressure, front | 1.0 bar (14.5 psi) | 26_3240234_en_BA p. 129; 27_3240381_en_BA p. 114; 26_3240235_en_BA p. 119; 27_3240383_en_BA p. 112; 26_3240236_en_BA p. 129; 27_3240384_en_BA p. 114; 27_3402945_en_BA p. 110; 26_3402885_en_BA p. 109; 27_3402947_en_BA p. 116; 25_3402805_en_BA p. 113; 27_3402948_en_BA p. 115; 26_3215268_en_BA p. 98; 27_3215290_en_BA p. 99; 25_3215222_en_BA p. 103; 26_3215269_en_BA p. 97; 27_3215291_en_BA p. 98 |
| Off-road tyre pressure, rear | 1.0 bar (14.5 psi) | 26_3240234_en_BA p. 129; 27_3240381_en_BA p. 114; 26_3240235_en_BA p. 119; 27_3240383_en_BA p. 112; 26_3240236_en_BA p. 129; 27_3240384_en_BA p. 114; 27_3402945_en_BA p. 110; 26_3402885_en_BA p. 109; 27_3402947_en_BA p. 116; 25_3402805_en_BA p. 113; 27_3402948_en_BA p. 115; 26_3215268_en_BA p. 98; 27_3215290_en_BA p. 99; 25_3215222_en_BA p. 103; 26_3215269_en_BA p. 97; 27_3215291_en_BA p. 98 |
| Pre-ride item: Spokes | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Fork dust boots | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Bleed the fork | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Air filter | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Controls | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Nuts and bolts | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |
| Pre-ride item: Fuel | listed | 26_3240234_en_BA p. 35; 27_3240381_en_BA p. 33; 26_3240235_en_BA p. 34; 27_3240383_en_BA p. 33; 26_3240236_en_BA p. 33; 27_3240384_en_BA p. 33; 27_3402945_en_BA p. 31; 26_3402885_en_BA p. 31; 27_3402947_en_BA p. 33; 25_3402805_en_BA p. 32; 27_3402948_en_BA p. 33; 26_3215268_en_BA p. 26; 27_3215290_en_BA p. 26; 25_3215222_en_BA p. 28; 26_3215269_en_BA p. 26; 27_3215291_en_BA p. 26 |

### Pre-ride check

`bak-ktmg4t-pre-ride-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Pre-ride item: Electrics work | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Engine oil level | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Front brake fluid | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Rear brake fluid | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Front brake pads | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Rear brake pads | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Brakes work | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Coolant level | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Chain dirt | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Chain and sprockets | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Chain tension | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Tyres | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Tyre pressure | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Off-road tyre pressure, front | 1.0 bar | 25_3402803_en_BA p. 106; 25_3402804_en_BA p. 108; 25_3215221_en_BA p. 116; 25_3215223_en_BA p. 116 |
| Off-road tyre pressure, rear | 1.0 bar | 25_3402803_en_BA p. 106; 25_3402804_en_BA p. 108; 25_3215221_en_BA p. 116; 25_3215223_en_BA p. 116 |
| Pre-ride item: Spokes | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Fork dust boots | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Bleed the fork | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Air filter | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Controls | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Nuts and bolts | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |
| Pre-ride item: Fuel | listed | 25_3402803_en_BA p. 29; 25_3402804_en_BA p. 31; 25_3215221_en_BA p. 32; 25_3215223_en_BA p. 31 |

### Wash the bike and do the after-wash check

`bak-ktmg4t-after-wash-v1-ex250f-2021-2024-and-more-63e500c0`

Bikes: KTM 250 SX-F 2020, KTM 250 XC-F 2020, KTM 250 SX-F 2021, KTM 250 XC-F 2021, KTM 250 SX-F 2022, KTM 250 XC-F 2022, KTM 250 SX-F 2023, KTM 250 XC-F 2023, KTM 250 SX-F 2024, KTM 250 XC-F 2024, KTM 250 SX-F 2025, KTM 250 XC-F 2025, KTM 250 SX-F 2026, KTM 250 XC-F 2026, KTM 250 SX-F 2027, KTM 250 XC-F 2027, KTM 350 SX-F 2020, KTM 350 XC-F 2020, KTM 350 SX-F 2021, KTM 350 XC-F 2021, KTM 350 SX-F 2022, KTM 350 XC-F 2022, KTM 350 SX-F 2023, KTM 350 XC-F 2023, KTM 350 SX-F 2024, KTM 350 XC-F 2024, KTM 350 SX-F 2025, KTM 350 XC-F 2025, KTM 350 SX-F 2026, KTM 350 SX-F 2027, KTM 350 XC-F 2027, KTM 450 SX-F 2020, KTM 450 XC-F 2020, KTM 450 SX-F 2021, KTM 450 XC-F 2021, KTM 450 SX-F 2022, KTM 450 XC-F 2022, KTM 450 SX-F 2023, KTM 450 XC-F 2023, KTM 450 SX-F 2024, KTM 450 XC-F 2024, KTM 450 SX-F 2025, KTM 450 XC-F 2025, KTM 450 SX-F 2026, KTM 450 XC-F 2026, KTM 450 SX-F 2027, KTM 450 XC-F 2027, Husqvarna FC 250 2023, Husqvarna FC 250 2024, Husqvarna FC 250 2027, Husqvarna FC 350 2023, Husqvarna FC 350 2024, Husqvarna FX 350 2024, Husqvarna FX 350 2026, Husqvarna FC 350 2027, Husqvarna FX 350 2027, Husqvarna FC 450 2023, Husqvarna FX 450 2023, Husqvarna FC 450 2024, Husqvarna FX 450 2024, Husqvarna FC 450 2025, Husqvarna FX 450 2025, Husqvarna FC 450 2027, Husqvarna FX 450 2027, GasGas MC 250F 2023, GasGas EX 250F 2023, GasGas MC 250F 2024, GasGas EX 250F 2024, GasGas MC 250F 2026, GasGas MC 250F 2027, GasGas MC 350F 2023, GasGas EX 350F 2023, GasGas MC 350F 2024, GasGas EX 350F 2024, GasGas MC 350F 2025, GasGas EX 350F 2025, GasGas MC 450F 2023, GasGas EX 450F 2023, GasGas MC 450F 2024, GasGas EX 450F 2024, GasGas MC 450F 2026, GasGas MC 450F 2027, Husqvarna FC 250 2020, Husqvarna FC 250 2021, Husqvarna FC 250 2022, Husqvarna FC 350 2020, Husqvarna FX 350 2020, Husqvarna FC 350 2021, Husqvarna FX 350 2021, Husqvarna FC 350 2022, Husqvarna FX 350 2022, Husqvarna FC 450 2020, Husqvarna FX 450 2020, Husqvarna FC 450 2021, Husqvarna FX 450 2021, Husqvarna FC 450 2022, Husqvarna FX 450 2022, GasGas EX 250F 2021, GasGas EX 250F 2022, GasGas EX 350F 2022, GasGas EX 350F 2021, GasGas MC 450F 2021, GasGas EX 450F 2021, GasGas MC 450F 2022, GasGas EX 450F 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm (23.6 in) | 20_3214129_en_OM p. 125; 21_3214213_en_OM p. 128; 22_3214414_en_OM p. 120; 23_3214640_en_OM p. 121; 24_3214834_en_OM p. 138; 25_3240043_en_OM p. 134; 26_3240234_en_BA p. 157; 27_3240381_en_BA p. 142; 20_3214004_en_OM p. 119; 21_3214215_en_OM p. 128; 22_3214417_en_OM p. 129; 23_3214641_en_OM p. 131; 24_3214835_en_OM p. 135; 25_3240044_en_OM p. 135; 26_3240235_en_BA p. 147; 27_3240383_en_BA p. 140; 20_3214032_en_OM p. 129; 21_3214217_en_OM p. 129; 22_3214418_en_OM p. 121; 23_3214642_en_OM p. 137; 24_3214836_en_OM p. 143; 25_3240045_en_OM p. 140; 26_3240236_en_BA p. 157; 27_3240384_en_BA p. 142; 23_3402631_en_OM p. 123; 24_3402713_en_OM p. 131; 27_3402945_en_BA p. 136; 23_3402632_en_OM p. 126; 24_3402714_en_OM p. 126; 26_3402885_en_BA p. 134; 27_3402947_en_BA p. 142; 23_3402633_en_OM p. 139; 24_3402715_en_OM p. 145; 25_3402805_en_BA p. 138; 27_3402948_en_BA p. 142; 23_3215097_en_OM p. 112; 24_3215160_en_OM p. 132; 26_3215268_en_BA p. 124; 27_3215290_en_BA p. 126; 23_3215099_en_OM p. 113; 24_3215161_en_OM p. 117; 25_3215222_en_BA p. 127; 23_3215100_en_OM p. 113; 24_3215162_en_OM p. 129; 26_3215269_en_BA p. 123; 27_3215291_en_BA p. 125; 20_3402335_en_OM p. 117; 21_3402442_en_OM p. 119; 22_3402532_en_OM p. 121; 20_3402336_en_OM p. 129; 21_3402443_en_OM p. 131; 22_3402534_en_OM p. 126; 20_3402354_en_OM p. 137; 21_3402445_en_OM p. 139; 22_3402535_en_OM p. 125; 21_3215009_en_OM p. 113; 22_3215053_en_OM p. 113; 22_3215054_en_OM p. 113; 21_3215019_en_OM p. 108; 21_3215010_en_OM p. 112; 22_3215055_en_OM p. 126 |
| Handlebar control caps pushed back to let water out | yes | 20_3214129_en_OM p. 125; 21_3214213_en_OM p. 128; 22_3214414_en_OM p. 120; 23_3214640_en_OM p. 121; 24_3214834_en_OM p. 138; 25_3240043_en_OM p. 134; 26_3240234_en_BA p. 158; 27_3240381_en_BA p. 143; 20_3214004_en_OM p. 119; 21_3214215_en_OM p. 128; 22_3214417_en_OM p. 129; 23_3214641_en_OM p. 131; 24_3214835_en_OM p. 135; 25_3240044_en_OM p. 135; 26_3240235_en_BA p. 148; 27_3240383_en_BA p. 141; 20_3214032_en_OM p. 129; 21_3214217_en_OM p. 129; 22_3214418_en_OM p. 121; 23_3214642_en_OM p. 137; 24_3214836_en_OM p. 143; 25_3240045_en_OM p. 140; 26_3240236_en_BA p. 158; 27_3240384_en_BA p. 143; 23_3402631_en_OM p. 123; 24_3402713_en_OM p. 131; 27_3402945_en_BA p. 137; 23_3402632_en_OM p. 126; 24_3402714_en_OM p. 126; 26_3402885_en_BA p. 135; 27_3402947_en_BA p. 143; 23_3402633_en_OM p. 139; 24_3402715_en_OM p. 145; 25_3402805_en_BA p. 139; 27_3402948_en_BA p. 143; 23_3215097_en_OM p. 112; 24_3215160_en_OM p. 132; 26_3215268_en_BA p. 124; 27_3215290_en_BA p. 126; 23_3215099_en_OM p. 113; 24_3215161_en_OM p. 117; 25_3215222_en_BA p. 127; 23_3215100_en_OM p. 113; 24_3215162_en_OM p. 129; 26_3215269_en_BA p. 123; 27_3215291_en_BA p. 125; 20_3402335_en_OM p. 118; 21_3402442_en_OM p. 120; 22_3402532_en_OM p. 122; 20_3402336_en_OM p. 130; 21_3402443_en_OM p. 132; 22_3402534_en_OM p. 127; 20_3402354_en_OM p. 138; 21_3402445_en_OM p. 140; 22_3402535_en_OM p. 126; 21_3215009_en_OM p. 113; 22_3215053_en_OM p. 113; 22_3215054_en_OM p. 113; 21_3215019_en_OM p. 108; 21_3215010_en_OM p. 112; 22_3215055_en_OM p. 126 |

### Wash the bike and do the after-wash check

`bak-ktmg4t-after-wash-v1-ex250f-2025-ex450f-2025-mc250f-2025-mc450f-2025-fc250-2025-fc350-2025-fx350-2025`

Bikes: Husqvarna FC 250 2025, Husqvarna FC 350 2025, Husqvarna FX 350 2025, GasGas MC 250F 2025, GasGas EX 250F 2025, GasGas MC 450F 2025, GasGas EX 450F 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm | 25_3402803_en_BA p. 128; 25_3402804_en_BA p. 131; 25_3215221_en_BA p. 140; 25_3215223_en_BA p. 142 |
| Handlebar control caps pushed back to let water out | yes | 25_3402803_en_BA p. 129; 25_3402804_en_BA p. 132; 25_3215221_en_BA p. 140; 25_3215223_en_BA p. 142 |


## Values per job and group: two-strokes

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-mc125-2021-2023-125sx-2020-2022-125xc-2021-2022-150sx-2020-2022`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, GasGas MC 125 2023, GasGas MC 125 2021, GasGas MC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | every 10 operating hours | 20_3214000_en_OM p. 31; 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 23_3215094_en_OM p. 30; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 20_3214000_en_OM p. 108; 21_3214209_en_OM p. 118; 22_3214411_en_OM p. 117; 23_3215094_en_OM p. 105; 21_3215008_en_OM p. 104; 22_3215051_en_OM p. 104 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3214000_en_OM p. 109; 21_3214209_en_OM p. 119; 22_3214411_en_OM p. 118; 23_3215094_en_OM p. 105; 21_3215008_en_OM p. 104; 22_3215051_en_OM p. 104 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 20_3214000_en_OM p. 108; 21_3214209_en_OM p. 118; 22_3214411_en_OM p. 117; 23_3215094_en_OM p. 105; 21_3215008_en_OM p. 104; 22_3215051_en_OM p. 104 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 20_3214000_en_OM p. 107; 21_3214209_en_OM p. 117; 22_3214411_en_OM p. 116; 23_3215094_en_OM p. 104; 21_3215008_en_OM p. 103; 22_3215051_en_OM p. 103 |
| Gear oil standard | JASO T903 MA2 | 20_3214000_en_OM p. 128; 21_3214209_en_OM p. 141; 22_3214411_en_OM p. 140; 23_3215094_en_OM p. 121; 21_3215008_en_OM p. 120; 22_3215051_en_OM p. 120 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-ex250-2024-ex300-2024-mc125-2024-mc250-2024-125xc-2023-2025`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, GasGas MC 125 2024, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214638_en_OM p. 34; 24_3214832_en_OM p. 34; 25_3240041_en_OM p. 34; 24_3215157_en_OM p. 29; 24_3215158_en_OM p. 30 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 23_3214638_en_OM p. 119; 24_3214832_en_OM p. 121; 25_3240041_en_OM p. 121; 24_3215157_en_OM p. 111; 24_3215158_en_OM p. 112 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 23_3214638_en_OM p. 120; 24_3214832_en_OM p. 122; 25_3240041_en_OM p. 122; 24_3215157_en_OM p. 111; 24_3215158_en_OM p. 112 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 23_3214638_en_OM p. 119; 24_3214832_en_OM p. 121; 25_3240041_en_OM p. 121; 24_3215157_en_OM p. 111; 24_3215158_en_OM p. 111 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 23_3214638_en_OM p. 118; 24_3214832_en_OM p. 120; 25_3240041_en_OM p. 120; 24_3215157_en_OM p. 110; 24_3215158_en_OM p. 111 |
| Gear oil standard | JASO T903 MA2 | 23_3214638_en_OM p. 138; 24_3214832_en_OM p. 140; 25_3240041_en_OM p. 141; 24_3215157_en_OM p. 128; 24_3215158_en_OM p. 130 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-125sx-2026`

Bikes: KTM 125 SX 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240232_en_BA p. 39 |
| Gear oil quantity | 0.80 l (0.211 US gal) | 26_3240232_en_BA p. 133 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 26_3240232_en_BA p. 133 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 26_3240232_en_BA p. 133 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 26_3240232_en_BA p. 132 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-125sx-2027-125xc-2027`

Bikes: KTM 125 SX 2027, KTM 125 XC 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240379_en_BA p. 38 |
| Gear oil quantity | 0.80 l (0.211 US gal) | 27_3240379_en_BA p. 133 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 27_3240379_en_BA p. 133 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 27_3240379_en_BA p. 133 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 27_3240379_en_BA p. 132 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-250sx-2020`

Bikes: KTM 250 SX 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | every 20 operating hours | 20_3214001_en_OM p. 31 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 20_3214001_en_OM p. 107 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3214001_en_OM p. 107 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 20_3214001_en_OM p. 107 |
| Torque, gear oil level check screw | 10 N·m (7.4 lbf·ft) | 20_3214001_en_OM p. 106 |
| Gear oil standard | JASO T903 MA2 | 20_3214001_en_OM p. 124 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-250sx-2023-2025-250xc-2023-2025-300sx-2023-2025-300xc-2023-2025`

Bikes: KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214639_en_OM p. 33; 24_3214833_en_OM p. 33; 25_3240042_en_OM p. 33 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 23_3214639_en_OM p. 119; 24_3214833_en_OM p. 120; 25_3240042_en_OM p. 120 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 23_3214639_en_OM p. 120; 24_3214833_en_OM p. 121; 25_3240042_en_OM p. 121 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 23_3214639_en_OM p. 119; 24_3214833_en_OM p. 120; 25_3240042_en_OM p. 120 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 23_3214639_en_OM p. 118; 24_3214833_en_OM p. 119; 25_3240042_en_OM p. 119 |
| Gear oil standard | JASO T903 MA2 | 23_3214639_en_OM p. 138; 24_3214833_en_OM p. 138; 25_3240042_en_OM p. 139 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-250sx-2026-250xc-2026-2027-300sx-2026-300xc-2026-2027`

Bikes: KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240233_en_BA p. 39; 27_3240380_en_BA p. 39 |
| Gear oil quantity | 0.80 l (0.211 US gal) | 26_3240233_en_BA p. 133; 27_3240380_en_BA p. 133 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 26_3240233_en_BA p. 133; 27_3240380_en_BA p. 133 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 26_3240233_en_BA p. 133; 27_3240380_en_BA p. 133 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 26_3240233_en_BA p. 132; 27_3240380_en_BA p. 132 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc125-2023`

Bikes: Husqvarna TC 125 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 23_3402629_en_OM p. 31 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 23_3402629_en_OM p. 117 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 23_3402629_en_OM p. 117 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 23_3402629_en_OM p. 117 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 23_3402629_en_OM p. 116 |
| Gear oil standard | JASO T903 MA2 | 23_3402629_en_OM p. 134 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc125-2024-tc250-2023-2024-tx300-2023-2024`

Bikes: Husqvarna TC 125 2024, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3402711_en_OM p. 31; 23_3402630_en_OM p. 33; 24_3402712_en_OM p. 33 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 24_3402711_en_OM p. 117; 23_3402630_en_OM p. 121; 24_3402712_en_OM p. 122 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 24_3402711_en_OM p. 117; 23_3402630_en_OM p. 121; 24_3402712_en_OM p. 122 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 24_3402711_en_OM p. 117; 23_3402630_en_OM p. 121; 24_3402712_en_OM p. 122 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 24_3402711_en_OM p. 116; 23_3402630_en_OM p. 120; 24_3402712_en_OM p. 121 |
| Gear oil standard | JASO T903 MA2 | 24_3402711_en_OM p. 134; 23_3402630_en_OM p. 140; 24_3402712_en_OM p. 141 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc125-2025-tc150-2025-tc250-2025-tc300-2025-tx300-2025`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 25_3402801_en_BA p. 31; 25_3402802_en_BA p. 38 |
| Gear oil quantity | 0.8 l | 25_3402801_en_BA p. 120; 25_3402802_en_BA p. 131 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 25_3402801_en_BA p. 120; 25_3402802_en_BA p. 131 |
| Torque, gear oil drain plug with magnet | 20 N·m | 25_3402801_en_BA p. 120; 25_3402802_en_BA p. 131 |
| Torque, gear oil level check screw | 8 N·m | 25_3402801_en_BA p. 119; 25_3402802_en_BA p. 130 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc125-2026-tc250-2026-tx300-2026`

Bikes: Husqvarna TC 125 2026, Husqvarna TC 250 2026, Husqvarna TX 300 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 26_3402882_en_BA p. 34; 26_3402883_en_BA p. 37 |
| Gear oil quantity | 0.8 l (0.21 US gal) | 26_3402882_en_BA p. 127; 26_3402883_en_BA p. 132 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 26_3402882_en_BA p. 127; 26_3402883_en_BA p. 132 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 26_3402882_en_BA p. 127; 26_3402883_en_BA p. 132 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 26_3402882_en_BA p. 127; 26_3402883_en_BA p. 131 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-ex300-2027-tx300-2027`

Bikes: Husqvarna TX 300 2027, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3402944_en_BA p. 40; 27_3215289_en_BA p. 31 |
| Gear oil quantity | 0.8 l (0.21 US gal) | 27_3402944_en_BA p. 141; 27_3215289_en_BA p. 119 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 27_3402944_en_BA p. 141; 27_3215289_en_BA p. 119 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 27_3402944_en_BA p. 141; 27_3215289_en_BA p. 119 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 27_3402944_en_BA p. 140; 27_3215289_en_BA p. 118 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-ex250-2025-ex300-2025-mc125-2025-mc250-2025`

Bikes: GasGas MC 125 2025, GasGas MC 250 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3215219_en_BA p. 31; 25_3215220_en_BA p. 34 |
| Gear oil quantity | 0.8 l | 25_3215219_en_BA p. 118; 25_3215220_en_BA p. 124 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 25_3215219_en_BA p. 118; 25_3215220_en_BA p. 124 |
| Torque, gear oil drain plug with magnet | 20 N·m | 25_3215219_en_BA p. 118; 25_3215220_en_BA p. 124 |
| Torque, gear oil level check screw | 8 N·m | 25_3215219_en_BA p. 117; 25_3215220_en_BA p. 123 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-ex300-2026-mc125-2026-mc250-2026`

Bikes: GasGas MC 125 2026, GasGas MC 250 2026, GasGas EX 300 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3215266_en_BA p. 31; 26_3215267_en_BA p. 35 |
| Gear oil quantity | 0.8 l (0.21 US gal) | 26_3215266_en_BA p. 119; 26_3215267_en_BA p. 129 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 26_3215266_en_BA p. 119; 26_3215267_en_BA p. 129 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 26_3215266_en_BA p. 119; 26_3215267_en_BA p. 129 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 26_3215266_en_BA p. 119; 26_3215267_en_BA p. 128 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-mc250-2022-2023-250sx-2021-2022`

Bikes: GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 20 operating hours | 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 22_3215074_en_OM p. 30 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 23_3215095_en_OM p. 105; 21_3214210_en_OM p. 109; 22_3214412_en_OM p. 109; 22_3215074_en_OM p. 104 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 23_3215095_en_OM p. 105; 21_3214210_en_OM p. 109; 22_3214412_en_OM p. 109; 22_3215074_en_OM p. 104 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 23_3215095_en_OM p. 104; 21_3214210_en_OM p. 109; 22_3214412_en_OM p. 109; 22_3215074_en_OM p. 104 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 23_3215095_en_OM p. 104; 21_3214210_en_OM p. 108; 22_3214412_en_OM p. 108; 22_3215074_en_OM p. 103 |
| Gear oil standard | JASO T903 MA2 | 23_3215095_en_OM p. 121; 21_3214210_en_OM p. 124; 22_3214412_en_OM p. 126; 22_3215074_en_OM p. 120 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | every 20 operating hours | 20_3213998_en_OM p. 31 |
| Gear oil quantity | 0.50 l (0.53 US qt) | 20_3213998_en_OM p. 105 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3213998_en_OM p. 105 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 20_3213998_en_OM p. 104 |
| Gear oil standard | JASO T903 MA2 | 20_3213998_en_OM p. 121 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-85sx1714-2021-2023-85sx1916-2021-2023`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 10 operating hours, then every 20 operating hours | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |
| Gear oil quantity | 0.50 l (0.53 US qt) | 21_3214206_en_OM p. 106; 22_3214408_en_OM p. 106; 23_3214636_en_OM p. 106 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 21_3214206_en_OM p. 106; 22_3214408_en_OM p. 106; 23_3214636_en_OM p. 106 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 21_3214206_en_OM p. 105; 22_3214408_en_OM p. 105; 23_3214636_en_OM p. 105 |
| Gear oil standard | JASO T903 MA2 | 21_3214206_en_OM p. 122; 22_3214408_en_OM p. 122; 23_3214636_en_OM p. 122 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-85sx1714-2024-85sx1916-2024`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours | 24_3214830_en_OM p. 31 |
| Gear oil quantity | 0.50 l (0.53 US qt) | 24_3214830_en_OM p. 106 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 24_3214830_en_OM p. 106 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 24_3214830_en_OM p. 105 |
| Gear oil standard | JASO T903 MA2 | 24_3214830_en_OM p. 122 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3240038_en_BA p. 31 |
| Gear oil quantity | 0.50 l | 25_3240038_en_BA p. 112 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 25_3240038_en_BA p. 112 |
| Torque, gear oil level check screw | 8 N·m | 25_3240038_en_BA p. 111 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-85sx1714-2026-2027-85sx1916-2026-2027`

Bikes: KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240229_en_BA p. 30; 27_3240375_en_BA p. 32 |
| Gear oil quantity | 0.50 l (0.132 US gal) | 26_3240229_en_BA p. 111; 27_3240375_en_BA p. 113 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 26_3240229_en_BA p. 111; 27_3240375_en_BA p. 113 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 26_3240229_en_BA p. 110; 27_3240375_en_BA p. 112 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-250xc-2020-300xc-2020`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 40 operating hours | 20_3214002_en_OM p. 33 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 20_3214002_en_OM p. 119 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3214002_en_OM p. 119 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 20_3214002_en_OM p. 118 |
| Torque, gear oil level check screw | 10 N·m (7.4 lbf·ft) | 20_3214002_en_OM p. 118 |
| Gear oil standard | JASO T903 MA2 | 20_3214002_en_OM p. 134 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-ex250-2022-2023-ex300-2021-2023-250xc-2021-2022-300xc-2021-2022`

Bikes: KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 40 operating hours | 21_3214211_en_OM p. 33; 22_3214413_en_OM p. 33; 21_3215018_en_OM p. 30; 22_3215052_en_OM p. 30; 23_3215096_en_OM p. 30 |
| Gear oil quantity | 0.80 l (0.85 US qt) | 21_3214211_en_OM p. 121; 22_3214413_en_OM p. 122; 21_3215018_en_OM p. 113; 22_3215052_en_OM p. 113; 23_3215096_en_OM p. 113 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 21_3214211_en_OM p. 121; 22_3214413_en_OM p. 123; 21_3215018_en_OM p. 113; 22_3215052_en_OM p. 113; 23_3215096_en_OM p. 113 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 21_3214211_en_OM p. 120; 22_3214413_en_OM p. 122; 21_3215018_en_OM p. 113; 22_3215052_en_OM p. 113; 23_3215096_en_OM p. 113 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 21_3214211_en_OM p. 120; 22_3214413_en_OM p. 121; 21_3215018_en_OM p. 113; 22_3215052_en_OM p. 113; 23_3215096_en_OM p. 113 |
| Gear oil standard | JASO T903 MA2 | 21_3214211_en_OM p. 138; 22_3214413_en_OM p. 140; 21_3215018_en_OM p. 131; 22_3215052_en_OM p. 131; 23_3215096_en_OM p. 131 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc125-2020-2022`

Bikes: Husqvarna TC 125 2020, Husqvarna TC 125 2021, Husqvarna TC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | every 10 operating hours | 20_3402332_en_OM p. 32; 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 20_3402332_en_OM p. 109; 21_3402439_en_OM p. 110; 22_3402529_en_OM p. 111 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3402332_en_OM p. 109; 21_3402439_en_OM p. 110; 22_3402529_en_OM p. 111 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 20_3402332_en_OM p. 109; 21_3402439_en_OM p. 110; 22_3402529_en_OM p. 111 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 20_3402332_en_OM p. 108; 21_3402439_en_OM p. 109; 22_3402529_en_OM p. 110 |
| Gear oil standard | JASO T903 MA2 | 20_3402332_en_OM p. 124; 21_3402439_en_OM p. 126; 22_3402529_en_OM p. 127 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc250-2020-tx300-2020`

Bikes: Husqvarna TC 250 2020, Husqvarna TX 300 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 20 operating hours | 20_3402333_en_OM p. 32; 20_3402334_en_OM p. 34 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 20_3402333_en_OM p. 109; 20_3402334_en_OM p. 119 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 20_3402333_en_OM p. 109; 20_3402334_en_OM p. 119 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 20_3402333_en_OM p. 109; 20_3402334_en_OM p. 119 |
| Torque, gear oil level check screw | 10 N·m (7.4 lbf·ft) | 20_3402333_en_OM p. 108; 20_3402334_en_OM p. 118 |
| Gear oil standard | JASO T903 MA2 | 20_3402333_en_OM p. 125; 20_3402334_en_OM p. 134 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tc250-2021-2022`

Bikes: Husqvarna TC 250 2021, Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 20 operating hours | 21_3402440_en_OM p. 32; 22_3402530_en_OM p. 33 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 21_3402440_en_OM p. 111; 22_3402530_en_OM p. 112 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 21_3402440_en_OM p. 111; 22_3402530_en_OM p. 112 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 21_3402440_en_OM p. 111; 22_3402530_en_OM p. 112 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 21_3402440_en_OM p. 110; 22_3402530_en_OM p. 111 |
| Gear oil standard | JASO T903 MA2 | 21_3402440_en_OM p. 127; 22_3402530_en_OM p. 129 |

### Change the gearbox oil

`bak-ktmg2t-gear-oil-v1-tx300-2021-2022`

Bikes: Husqvarna TX 300 2021, Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Gear oil change interval | once after the first 5 operating hours, then every 40 operating hours | 21_3402441_en_OM p. 34; 22_3402531_en_OM p. 35 |
| Gear oil quantity | 0.8 l (0.8 US qt) | 21_3402441_en_OM p. 120; 22_3402531_en_OM p. 121 |
| Gear oil (engine oil) viscosity | SAE 15W/50 | 21_3402441_en_OM p. 120; 22_3402531_en_OM p. 121 |
| Torque, gear oil drain plug with magnet | 20 N·m (14.8 lbf·ft) | 21_3402441_en_OM p. 120; 22_3402531_en_OM p. 121 |
| Torque, gear oil level check screw | 8 N·m (5.9 lbf·ft) | 21_3402441_en_OM p. 120; 22_3402531_en_OM p. 121 |
| Gear oil standard | JASO T903 MA2 | 21_3402441_en_OM p. 138; 22_3402531_en_OM p. 139 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-mc125-2021-2023-mc250-2022-2023-125sx-2020-2022-125xc-2021-2022-150sx-2020-2022-250sx-2020-2022`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 250 SX 2020, GasGas MC 125 2023, GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 32; 21_3214209_en_OM p. 37; 22_3214411_en_OM p. 36; 20_3214001_en_OM p. 32; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 31; 21_3214210_en_OM p. 32; 22_3214412_en_OM p. 32; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 31 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 20_3214000_en_OM p. 59; 21_3214209_en_OM p. 63; 22_3214411_en_OM p. 62; 20_3214001_en_OM p. 58; 23_3215094_en_OM p. 56; 23_3215095_en_OM p. 56; 21_3214210_en_OM p. 58; 22_3214412_en_OM p. 58; 21_3215008_en_OM p. 55; 22_3215051_en_OM p. 55; 22_3215074_en_OM p. 55 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-mc125-2026-and-more-9dcb3507`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 125 2023, Husqvarna TC 125 2024, Husqvarna TC 125 2026, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027, GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39; 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32; 26_3402882_en_BA p. 35; 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41; 26_3215266_en_BA p. 32 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 23_3214638_en_OM p. 63; 24_3214832_en_OM p. 65; 25_3240041_en_OM p. 65; 26_3240232_en_BA p. 73; 27_3240379_en_BA p. 73; 23_3214639_en_OM p. 62; 24_3214833_en_OM p. 64; 25_3240042_en_OM p. 64; 26_3240233_en_BA p. 74; 27_3240380_en_BA p. 74; 23_3402629_en_OM p. 61; 24_3402711_en_OM p. 61; 26_3402882_en_BA p. 66; 23_3402630_en_OM p. 65; 24_3402712_en_OM p. 65; 26_3402883_en_BA p. 70; 27_3402944_en_BA p. 77; 26_3215266_en_BA p. 62 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-ex250-2025-and-more-a7c6f2ff`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 125 2025, GasGas MC 250 2025, GasGas EX 300 2025, Husqvarna TC 150 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 25_3402801_en_BA p. 32; 25_3402802_en_BA p. 39; 25_3215219_en_BA p. 32; 25_3215220_en_BA p. 35 |
| Torque, air filter box cover screw | 3 N·m | 25_3402801_en_BA p. 61; 25_3402802_en_BA p. 70; 25_3215219_en_BA p. 61; 25_3215220_en_BA p. 66 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-ex250-2024-ex300-2024-mc125-2024-mc250-2024`

Bikes: GasGas MC 125 2024, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 24_3215157_en_OM p. 30; 24_3215158_en_OM p. 31 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 24_3215157_en_OM p. 57; 24_3215158_en_OM p. 59 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-ex300-2026-2027-mc250-2026`

Bikes: GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 26_3215267_en_BA p. 69; 27_3215289_en_BA p. 60 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 20 operating hours and after every race | 20_3213998_en_OM p. 31 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-85sx1714-2021-2023-85sx1916-2021-2023`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | once after the first 10 operating hours, then every 20 operating hours and after every race | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-85sx1714-2024-2027-85sx1916-2024-2027`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024, KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025, KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 15 operating hours, at least every 24 months | 24_3214830_en_OM p. 32; 25_3240038_en_BA p. 32; 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 33 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-ex250-2022-2023-ex300-2021-2023-250xc-2020-2022-300xc-2020-2022`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours | 20_3214002_en_OM p. 34; 21_3214211_en_OM p. 34; 22_3214413_en_OM p. 34; 21_3215018_en_OM p. 31; 22_3215052_en_OM p. 31; 23_3215096_en_OM p. 31 |
| Torque, air filter box cover screw | 3 N·m (2.2 lbf·ft) | 20_3214002_en_OM p. 61; 21_3214211_en_OM p. 61; 22_3214413_en_OM p. 61; 21_3215018_en_OM p. 56; 22_3215052_en_OM p. 56; 23_3215096_en_OM p. 56 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-tc125-2020-2022-tc250-2020-2022`

Bikes: Husqvarna TC 125 2020, Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 33; 21_3402439_en_OM p. 33; 22_3402529_en_OM p. 34; 20_3402333_en_OM p. 33; 21_3402440_en_OM p. 33; 22_3402530_en_OM p. 34 |

### Clean and oil the air filter

`bak-ktmg2t-air-filter-v1-tx300-2020-2022`

Bikes: Husqvarna TX 300 2020, Husqvarna TX 300 2021, Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Air filter cleaning interval | every 10 operating hours | 20_3402334_en_OM p. 35; 21_3402441_en_OM p. 35; 22_3402531_en_OM p. 36 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-125sx-2020-150sx-2020-250sx-2020`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 250 SX 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 31; 20_3214001_en_OM p. 31 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3214000_en_OM p. 96; 20_3214001_en_OM p. 93 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3214000_en_OM p. 97; 20_3214001_en_OM p. 95 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3214000_en_OM p. 128; 20_3214001_en_OM p. 124 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-mc125-2021-2023-mc250-2022-2023-125sx-2021-2022-125xc-2021-2022-150sx-2021-2022-250sx-2021-2022`

Bikes: KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, GasGas MC 125 2023, GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 30 |
| Coolant change interval | at least every 48 months | 21_3214209_en_OM p. 37; 22_3214411_en_OM p. 36; 23_3215094_en_OM p. 31; 23_3215095_en_OM p. 31; 21_3214210_en_OM p. 32; 22_3214412_en_OM p. 32; 21_3215008_en_OM p. 31; 22_3215051_en_OM p. 31; 22_3215074_en_OM p. 31 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3214209_en_OM p. 104; 22_3214411_en_OM p. 103; 23_3215094_en_OM p. 91; 23_3215095_en_OM p. 89; 21_3214210_en_OM p. 93; 22_3214412_en_OM p. 93; 21_3215008_en_OM p. 90; 22_3215051_en_OM p. 90; 22_3215074_en_OM p. 88 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3214209_en_OM p. 105; 22_3214411_en_OM p. 104; 23_3215094_en_OM p. 92; 23_3215095_en_OM p. 91; 21_3214210_en_OM p. 95; 22_3214412_en_OM p. 95; 21_3215008_en_OM p. 91; 22_3215051_en_OM p. 91; 22_3215074_en_OM p. 90 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3214209_en_OM p. 141; 22_3214411_en_OM p. 140; 23_3215094_en_OM p. 121; 23_3215095_en_OM p. 121; 21_3214210_en_OM p. 124; 22_3214412_en_OM p. 126; 21_3215008_en_OM p. 120; 22_3215051_en_OM p. 120; 22_3215074_en_OM p. 120 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-mc125-2024-125xc-2023-2025`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, GasGas MC 125 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 24_3215157_en_OM p. 30 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 24_3215157_en_OM p. 30 |
| Coolant change interval | at least every 24 months | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 24_3215157_en_OM p. 30 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3214638_en_OM p. 99; 24_3214832_en_OM p. 101; 25_3240041_en_OM p. 101; 24_3215157_en_OM p. 92 |
| Torque, water pump cover drain screw (M6) | 8 N·m (5.9 lbf·ft) | 23_3214638_en_OM p. 103; 24_3214832_en_OM p. 105; 25_3240041_en_OM p. 105; 24_3215157_en_OM p. 96 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3214638_en_OM p. 138; 24_3214832_en_OM p. 140; 25_3240041_en_OM p. 141; 24_3215157_en_OM p. 128 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-125sx-2026-2027-125xc-2027`

Bikes: KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39 |
| Coolant change interval | at least every 24 months | 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3240232_en_BA p. 110; 27_3240379_en_BA p. 110 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3240232_en_BA p. 110; 27_3240379_en_BA p. 110 |
| Coolant quantity for a change | 1.2 l (0.32 US gal) | 26_3240232_en_BA p. 113; 27_3240379_en_BA p. 113 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3240232_en_BA p. 145; 27_3240379_en_BA p. 145 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-ex250-2024-ex300-2024-mc250-2024-250sx-2023-2025-250xc-2023-2025-300sx-2023-2025-300xc-2023-2025`

Bikes: KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 24_3215158_en_OM p. 31 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 24_3215158_en_OM p. 31 |
| Coolant change interval | at least every 24 months | 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 24_3215158_en_OM p. 31 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3214639_en_OM p. 105; 24_3214833_en_OM p. 106; 25_3240042_en_OM p. 106; 24_3215158_en_OM p. 101 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 23_3214639_en_OM p. 107; 24_3214833_en_OM p. 108; 25_3240042_en_OM p. 108; 24_3215158_en_OM p. 103 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3214639_en_OM p. 138; 24_3214833_en_OM p. 138; 25_3240042_en_OM p. 139; 24_3215158_en_OM p. 130 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc250-2026-tx300-2026-2027-250sx-2026-250xc-2026-2027-300sx-2026-300xc-2026-2027`

Bikes: KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41 |
| Coolant change interval | at least every 24 months | 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3240233_en_BA p. 117; 27_3240380_en_BA p. 117; 26_3402883_en_BA p. 110; 27_3402944_en_BA p. 115 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3240233_en_BA p. 117; 27_3240380_en_BA p. 117; 26_3402883_en_BA p. 110; 27_3402944_en_BA p. 115 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 26_3240233_en_BA p. 120; 27_3240380_en_BA p. 120; 26_3402883_en_BA p. 112; 27_3402944_en_BA p. 118 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 26_3240233_en_BA p. 119; 27_3240380_en_BA p. 119; 26_3402883_en_BA p. 111; 27_3402944_en_BA p. 117 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3240233_en_BA p. 145; 27_3240380_en_BA p. 145; 26_3402883_en_BA p. 141; 27_3402944_en_BA p. 150 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc125-2023-2024`

Bikes: Husqvarna TC 125 2023, Husqvarna TC 125 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32 |
| Coolant change interval | at least every 24 months | 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3402629_en_OM p. 97; 24_3402711_en_OM p. 97 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 23_3402629_en_OM p. 97; 24_3402711_en_OM p. 97 |
| Torque, water pump cover drain screw (M6) | 8 N·m (5.9 lbf·ft) | 23_3402629_en_OM p. 101; 24_3402711_en_OM p. 101 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3402629_en_OM p. 134; 24_3402711_en_OM p. 134 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-mc125-2025-tc125-2025-tc150-2025`

Bikes: Husqvarna TC 125 2025, GasGas MC 125 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3402801_en_BA p. 32; 25_3215219_en_BA p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3402801_en_BA p. 32; 25_3215219_en_BA p. 32 |
| Coolant change interval | at least every 24 months | 25_3402801_en_BA p. 32; 25_3215219_en_BA p. 32 |
| Coolant level above the radiator fins | 10 mm | 25_3402801_en_BA p. 99; 25_3215219_en_BA p. 97 |
| Antifreeze check range | -25 to -45 °C | 25_3402801_en_BA p. 99; 25_3215219_en_BA p. 97 |
| Coolant quantity for a change | 0.95 l | 25_3402801_en_BA p. 102; 25_3215219_en_BA p. 99 |
| Torque, water pump cover drain screw (M6) | 8 N·m | 25_3402801_en_BA p. 103; 25_3215219_en_BA p. 101 |
| Coolant antifreeze protection, at least | -25 °C | 25_3402801_en_BA p. 99; 25_3215219_en_BA p. 97 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc125-2026`

Bikes: Husqvarna TC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3402882_en_BA p. 35 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3402882_en_BA p. 35 |
| Coolant change interval | at least every 24 months | 26_3402882_en_BA p. 35 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3402882_en_BA p. 112 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3402882_en_BA p. 112 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 26_3402882_en_BA p. 115 |
| Torque, water pump cover drain screw (M6) | 8 N·m (5.9 lbf·ft) | 26_3402882_en_BA p. 117 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3402882_en_BA p. 140 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc250-2023-2024-tx300-2023-2024`

Bikes: Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34 |
| Antifreeze and coolant level check interval | every 45 operating hours | 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34 |
| Coolant change interval | at least every 24 months | 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 23_3402630_en_OM p. 108; 24_3402712_en_OM p. 109 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 23_3402630_en_OM p. 108; 24_3402712_en_OM p. 109 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 23_3402630_en_OM p. 109; 24_3402712_en_OM p. 110 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 23_3402630_en_OM p. 140; 24_3402712_en_OM p. 141 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-ex250-2025-ex300-2025-mc250-2025-tc250-2025-tc300-2025-tx300-2025`

Bikes: Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 250 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3402802_en_BA p. 39; 25_3215220_en_BA p. 35 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3402802_en_BA p. 39; 25_3215220_en_BA p. 35 |
| Coolant change interval | at least every 24 months | 25_3402802_en_BA p. 39; 25_3215220_en_BA p. 35 |
| Coolant level above the radiator fins | 10 mm | 25_3402802_en_BA p. 110; 25_3215220_en_BA p. 113 |
| Antifreeze check range | -25 to -45 °C | 25_3402802_en_BA p. 110; 25_3215220_en_BA p. 113 |
| Coolant quantity for a change | 0.95 l | 25_3402802_en_BA p. 112; 25_3215220_en_BA p. 115 |
| Torque, water pump cover drain screw (M6) | 10 N·m | 25_3402802_en_BA p. 111; 25_3215220_en_BA p. 114 |
| Coolant antifreeze protection, at least | -25 °C | 25_3402802_en_BA p. 110; 25_3215220_en_BA p. 113 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-mc125-2026`

Bikes: GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3215266_en_BA p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3215266_en_BA p. 32 |
| Coolant change interval | at least every 24 months | 26_3215266_en_BA p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3215266_en_BA p. 98 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3215266_en_BA p. 98 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 26_3215266_en_BA p. 101 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3215266_en_BA p. 131 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-ex300-2026-2027-mc250-2026`

Bikes: GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Coolant change interval | at least every 24 months | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3215267_en_BA p. 116; 27_3215289_en_BA p. 106 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3215267_en_BA p. 116; 27_3215289_en_BA p. 106 |
| Coolant quantity for a change | 0.95 l (0.251 US gal) | 26_3215267_en_BA p. 118; 27_3215289_en_BA p. 109 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 26_3215267_en_BA p. 117; 27_3215289_en_BA p. 108 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3215267_en_BA p. 138; 27_3215289_en_BA p. 130 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | every 20 operating hours and after every race | 20_3213998_en_OM p. 31 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3213998_en_OM p. 93 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3213998_en_OM p. 93 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3213998_en_OM p. 121 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-85sx1714-2021-2023-85sx1916-2021-2023`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first 10 operating hours, then every 20 operating hours and after every race | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |
| Coolant change interval | at least every 48 months | 21_3214206_en_OM p. 32; 22_3214408_en_OM p. 32; 23_3214636_en_OM p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3214206_en_OM p. 93; 22_3214408_en_OM p. 92; 23_3214636_en_OM p. 92 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 21_3214206_en_OM p. 93; 22_3214408_en_OM p. 92; 23_3214636_en_OM p. 92 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3214206_en_OM p. 122; 22_3214408_en_OM p. 122; 23_3214636_en_OM p. 122 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-85sx1714-2024-85sx1916-2024`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 24_3214830_en_OM p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 24_3214830_en_OM p. 32 |
| Coolant change interval | at least every 24 months | 24_3214830_en_OM p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 24_3214830_en_OM p. 92 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 24_3214830_en_OM p. 92 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 24_3214830_en_OM p. 122 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 25_3240038_en_BA p. 32 |
| Antifreeze and coolant level check interval | every 45 operating hours | 25_3240038_en_BA p. 32 |
| Coolant change interval | at least every 24 months | 25_3240038_en_BA p. 32 |
| Coolant level above the radiator fins | 10 mm | 25_3240038_en_BA p. 97 |
| Antifreeze check range | -25 to -45 °C | 25_3240038_en_BA p. 97 |
| Coolant quantity for a change | 0.8 l | 25_3240038_en_BA p. 99 |
| Coolant antifreeze protection, at least | -25 °C | 25_3240038_en_BA p. 25 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-85sx1714-2026-2027-85sx1916-2026-2027`

Bikes: KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Coolant level check interval | once after the first operating hour, then every 15 operating hours | 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 33 |
| Antifreeze and coolant level check interval | every 45 operating hours | 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 33 |
| Coolant change interval | at least every 24 months | 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 33 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 26_3240229_en_BA p. 96; 27_3240375_en_BA p. 98 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 26_3240229_en_BA p. 96; 27_3240375_en_BA p. 98 |
| Coolant quantity for a change | 0.8 l (0.21 US gal) | 26_3240229_en_BA p. 98; 27_3240375_en_BA p. 100 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 26_3240229_en_BA p. 120; 27_3240375_en_BA p. 122 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-250xc-2020-300xc-2020`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours | 20_3214002_en_OM p. 34 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3214002_en_OM p. 101 |
| Coolant quantity for a change | 1.2 l (1.3 US qt) | 20_3214002_en_OM p. 104 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3214002_en_OM p. 103 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3214002_en_OM p. 134 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-ex250-2022-2023-ex300-2021-2023-250xc-2021-2022-300xc-2021-2022`

Bikes: KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours | 21_3214211_en_OM p. 34; 22_3214413_en_OM p. 34; 21_3215018_en_OM p. 31; 22_3215052_en_OM p. 31; 23_3215096_en_OM p. 31 |
| Coolant change interval | at least every 48 months | 21_3214211_en_OM p. 34; 22_3214413_en_OM p. 34; 21_3215018_en_OM p. 31; 22_3215052_en_OM p. 31; 23_3215096_en_OM p. 31 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3214211_en_OM p. 102; 22_3214413_en_OM p. 103; 21_3215018_en_OM p. 95; 22_3215052_en_OM p. 95; 23_3215096_en_OM p. 95 |
| Coolant quantity for a change | 1.2 l (1.3 US qt) | 21_3214211_en_OM p. 105; 22_3214413_en_OM p. 106; 21_3215018_en_OM p. 98; 22_3215052_en_OM p. 98; 23_3215096_en_OM p. 98 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3214211_en_OM p. 104; 22_3214413_en_OM p. 105; 21_3215018_en_OM p. 97; 22_3215052_en_OM p. 97; 23_3215096_en_OM p. 97 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3214211_en_OM p. 138; 22_3214413_en_OM p. 140; 21_3215018_en_OM p. 131; 22_3215052_en_OM p. 131; 23_3215096_en_OM p. 131 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc125-2020`

Bikes: Husqvarna TC 125 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3402332_en_OM p. 97 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3402332_en_OM p. 97 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3402332_en_OM p. 98 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3402332_en_OM p. 124 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc125-2021-2022-tc250-2021-2022`

Bikes: Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2021, Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33; 21_3402440_en_OM p. 32; 22_3402530_en_OM p. 33 |
| Coolant change interval | at least every 48 months | 21_3402439_en_OM p. 33; 22_3402529_en_OM p. 34; 21_3402440_en_OM p. 33; 22_3402530_en_OM p. 34 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3402439_en_OM p. 97; 22_3402529_en_OM p. 98; 21_3402440_en_OM p. 95; 22_3402530_en_OM p. 96 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 21_3402439_en_OM p. 97; 22_3402529_en_OM p. 98; 21_3402440_en_OM p. 95; 22_3402530_en_OM p. 96 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3402439_en_OM p. 98; 22_3402529_en_OM p. 99; 21_3402440_en_OM p. 97; 22_3402530_en_OM p. 98 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3402439_en_OM p. 126; 22_3402529_en_OM p. 127; 21_3402440_en_OM p. 127; 22_3402530_en_OM p. 129 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tc250-2020`

Bikes: Husqvarna TC 250 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3402333_en_OM p. 32 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3402333_en_OM p. 95 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3402333_en_OM p. 95 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3402333_en_OM p. 97 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3402333_en_OM p. 125 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tx300-2020`

Bikes: Husqvarna TX 300 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours | 20_3402334_en_OM p. 34 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 20_3402334_en_OM p. 103 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 20_3402334_en_OM p. 103 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 20_3402334_en_OM p. 105 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 20_3402334_en_OM p. 134 |

### Check, top up or change the coolant

`bak-ktmg2t-coolant-v1-tx300-2021-2022`

Bikes: Husqvarna TX 300 2021, Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Antifreeze and coolant level check interval | once after the first operating hour, then every 10 operating hours | 21_3402441_en_OM p. 34; 22_3402531_en_OM p. 35 |
| Coolant change interval | at least every 48 months | 21_3402441_en_OM p. 35; 22_3402531_en_OM p. 36 |
| Coolant level above the radiator fins | 10 mm (0.39 in) | 21_3402441_en_OM p. 103; 22_3402531_en_OM p. 104 |
| Antifreeze check range | -25 to -45 °C (-13 to -49 °F) | 21_3402441_en_OM p. 103; 22_3402531_en_OM p. 104 |
| Torque, water pump cover drain screw (M6) | 10 N·m (7.4 lbf·ft) | 21_3402441_en_OM p. 105; 22_3402531_en_OM p. 106 |
| Coolant antifreeze protection, at least | -25 °C (-13 °F) | 21_3402441_en_OM p. 138; 22_3402531_en_OM p. 139 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-mc125-2021-2023-and-more-cc808665`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 250 SX 2020, GasGas MC 125 2023, GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 31; 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 20_3214001_en_OM p. 31; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33; 20_3402333_en_OM p. 32; 21_3402440_en_OM p. 32; 22_3402530_en_OM p. 33; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 30 |
| Clutch fluid change interval | at least every 12 months | 20_3214000_en_OM p. 32; 21_3214209_en_OM p. 37; 22_3214411_en_OM p. 36; 20_3214001_en_OM p. 32; 23_3215094_en_OM p. 31; 23_3215095_en_OM p. 31; 21_3214210_en_OM p. 32; 22_3214412_en_OM p. 32; 21_3402439_en_OM p. 33; 22_3402529_en_OM p. 34; 20_3402333_en_OM p. 33; 21_3402440_en_OM p. 33; 22_3402530_en_OM p. 34; 21_3215008_en_OM p. 31; 22_3215051_en_OM p. 31; 22_3215074_en_OM p. 31 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 20_3214000_en_OM p. 73; 21_3214209_en_OM p. 77; 22_3214411_en_OM p. 76; 20_3214001_en_OM p. 72; 23_3215094_en_OM p. 69; 23_3215095_en_OM p. 69; 21_3214210_en_OM p. 72; 22_3214412_en_OM p. 72; 21_3402439_en_OM p. 74; 22_3402529_en_OM p. 75; 20_3402333_en_OM p. 74; 21_3402440_en_OM p. 74; 22_3402530_en_OM p. 75; 21_3215008_en_OM p. 68; 22_3215051_en_OM p. 68; 22_3215074_en_OM p. 68 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 20_3214000_en_OM p. 73; 21_3214209_en_OM p. 77; 22_3214411_en_OM p. 76; 20_3214001_en_OM p. 72; 23_3215094_en_OM p. 69; 23_3215095_en_OM p. 69; 21_3214210_en_OM p. 72; 22_3214412_en_OM p. 72; 21_3402439_en_OM p. 74; 22_3402529_en_OM p. 75; 20_3402333_en_OM p. 74; 21_3402440_en_OM p. 74; 22_3402530_en_OM p. 75; 21_3215008_en_OM p. 68; 22_3215051_en_OM p. 68; 22_3215074_en_OM p. 68 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-ex250-2024-and-more-c79ea9e3`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 125 SX 2026, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, Husqvarna TC 125 2023, Husqvarna TC 125 2024, Husqvarna TC 125 2026, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, Husqvarna TC 250 2026, Husqvarna TX 300 2026, GasGas MC 125 2024, GasGas MC 125 2026, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 23_3214638_en_OM p. 34; 24_3214832_en_OM p. 34; 25_3240041_en_OM p. 34; 26_3240232_en_BA p. 39; 23_3214639_en_OM p. 33; 24_3214833_en_OM p. 33; 25_3240042_en_OM p. 33; 23_3402629_en_OM p. 31; 24_3402711_en_OM p. 31; 26_3402882_en_BA p. 34; 23_3402630_en_OM p. 33; 24_3402712_en_OM p. 33; 26_3402883_en_BA p. 37; 24_3215157_en_OM p. 29; 26_3215266_en_BA p. 31; 24_3215158_en_OM p. 30 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 23_3214638_en_OM p. 34; 24_3214832_en_OM p. 34; 25_3240041_en_OM p. 34; 26_3240232_en_BA p. 39; 23_3214639_en_OM p. 33; 24_3214833_en_OM p. 33; 25_3240042_en_OM p. 33; 23_3402629_en_OM p. 31; 24_3402711_en_OM p. 31; 26_3402882_en_BA p. 34; 23_3402630_en_OM p. 33; 24_3402712_en_OM p. 33; 26_3402883_en_BA p. 37; 24_3215157_en_OM p. 29; 26_3215266_en_BA p. 31; 24_3215158_en_OM p. 30 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 23_3214638_en_OM p. 78; 24_3214832_en_OM p. 80; 25_3240041_en_OM p. 80; 26_3240232_en_BA p. 89; 23_3214639_en_OM p. 78; 24_3214833_en_OM p. 79; 25_3240042_en_OM p. 79; 23_3402629_en_OM p. 75; 24_3402711_en_OM p. 75; 26_3402882_en_BA p. 84; 23_3402630_en_OM p. 79; 24_3402712_en_OM p. 80; 26_3402883_en_BA p. 88; 24_3215157_en_OM p. 71; 26_3215266_en_BA p. 77; 24_3215158_en_OM p. 73 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 23_3214638_en_OM p. 78; 24_3214832_en_OM p. 80; 25_3240041_en_OM p. 80; 26_3240232_en_BA p. 89; 23_3214639_en_OM p. 78; 24_3214833_en_OM p. 79; 25_3240042_en_OM p. 79; 23_3402629_en_OM p. 75; 24_3402711_en_OM p. 75; 26_3402882_en_BA p. 84; 23_3402630_en_OM p. 79; 24_3402712_en_OM p. 80; 26_3402883_en_BA p. 88; 24_3215157_en_OM p. 71; 26_3215266_en_BA p. 77; 24_3215158_en_OM p. 73 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-ex300-2026-2027-and-more-3e820124`

Bikes: KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TX 300 2027, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 27_3240379_en_BA p. 38; 26_3240233_en_BA p. 39; 27_3240380_en_BA p. 39; 27_3402944_en_BA p. 40; 26_3215267_en_BA p. 35; 27_3215289_en_BA p. 31 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 27_3240379_en_BA p. 38; 26_3240233_en_BA p. 39; 27_3240380_en_BA p. 39; 27_3402944_en_BA p. 40; 26_3215267_en_BA p. 35; 27_3215289_en_BA p. 31 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 27_3240379_en_BA p. 89; 26_3240233_en_BA p. 89; 27_3240380_en_BA p. 89; 27_3402944_en_BA p. 94; 26_3215267_en_BA p. 85; 27_3215289_en_BA p. 76 |
| Clutch fluid type | DOT 5.1 | 27_3240379_en_BA p. 89; 26_3240233_en_BA p. 89; 27_3240380_en_BA p. 89; 27_3402944_en_BA p. 94; 26_3215267_en_BA p. 85; 27_3215289_en_BA p. 76 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-ex250-2025-and-more-b2b22334`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 125 2025, GasGas MC 250 2025, GasGas EX 300 2025, Husqvarna TC 150 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 45 operating hours | 25_3402801_en_BA p. 31; 25_3402802_en_BA p. 38; 25_3215219_en_BA p. 31; 25_3215220_en_BA p. 34 |
| Clutch fluid change interval | every 90 operating hours, at least every 24 months | 25_3402801_en_BA p. 31; 25_3402802_en_BA p. 38; 25_3215219_en_BA p. 31; 25_3215220_en_BA p. 34 |
| Clutch fluid level below the reservoir rim | 4 mm | 25_3402801_en_BA p. 78; 25_3402802_en_BA p. 88; 25_3215219_en_BA p. 77; 25_3215220_en_BA p. 82 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 25_3402801_en_BA p. 78; 25_3402802_en_BA p. 88; 25_3215219_en_BA p. 77; 25_3215220_en_BA p. 82 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-ex250-2022-2023-ex300-2021-2023-tx300-2020-2022-250xc-2020-2022-300xc-2020-2022`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, Husqvarna TX 300 2020, Husqvarna TX 300 2021, Husqvarna TX 300 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 10 operating hours | 20_3214002_en_OM p. 33; 21_3214211_en_OM p. 33; 22_3214413_en_OM p. 33; 20_3402334_en_OM p. 34; 21_3402441_en_OM p. 34; 22_3402531_en_OM p. 35; 21_3215018_en_OM p. 30; 22_3215052_en_OM p. 30; 23_3215096_en_OM p. 30 |
| Clutch fluid change interval | at least every 12 months | 20_3214002_en_OM p. 34; 21_3214211_en_OM p. 34; 22_3214413_en_OM p. 34; 20_3402334_en_OM p. 35; 21_3402441_en_OM p. 35; 22_3402531_en_OM p. 36; 21_3215018_en_OM p. 31; 22_3215052_en_OM p. 31; 23_3215096_en_OM p. 31 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 20_3214002_en_OM p. 75; 21_3214211_en_OM p. 76; 22_3214413_en_OM p. 76; 20_3402334_en_OM p. 77; 21_3402441_en_OM p. 77; 22_3402531_en_OM p. 78; 21_3215018_en_OM p. 70; 22_3215052_en_OM p. 70; 23_3215096_en_OM p. 70 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 20_3214002_en_OM p. 75; 21_3214211_en_OM p. 76; 22_3214413_en_OM p. 76; 20_3402334_en_OM p. 77; 21_3402441_en_OM p. 78; 22_3402531_en_OM p. 79; 21_3215018_en_OM p. 70; 22_3215052_en_OM p. 70; 23_3215096_en_OM p. 70 |

### Check and correct the hydraulic clutch fluid level

`bak-ktmg2t-clutch-fluid-v1-tc125-2020`

Bikes: Husqvarna TC 125 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Clutch fluid level check interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 32 |
| Clutch fluid change interval | every 10 operating hours | 20_3402332_en_OM p. 33 |
| Clutch fluid level below the reservoir rim | 4 mm (0.16 in) | 20_3402332_en_OM p. 74 |
| Clutch fluid type | DOT 4 / DOT 5.1 | 20_3402332_en_OM p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-125sx-2020-150sx-2020-250sx-2020`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 250 SX 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 31; 20_3214001_en_OM p. 31 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 31; 20_3214001_en_OM p. 31 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3214000_en_OM p. 67; 20_3214001_en_OM p. 66 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3214000_en_OM p. 68; 20_3214001_en_OM p. 67 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3214000_en_OM p. 69; 20_3214001_en_OM p. 68 |
| Number of chain rollers measured | 18 | 20_3214000_en_OM p. 69; 20_3214001_en_OM p. 68 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3214000_en_OM p. 69; 20_3214001_en_OM p. 68 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 20_3214000_en_OM p. 70; 20_3214001_en_OM p. 69 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 20_3214000_en_OM p. 69; 20_3214001_en_OM p. 68 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 20_3214000_en_OM p. 70; 20_3214001_en_OM p. 69 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 20_3214000_en_OM p. 70; 20_3214001_en_OM p. 69 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-mc125-2021-2023-mc250-2022-2023-125sx-2021-2022-125xc-2021-2022-150sx-2021-2022-250sx-2021-2022`

Bikes: KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, GasGas MC 125 2023, GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 30 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 21_3214209_en_OM p. 71; 22_3214411_en_OM p. 70; 23_3215094_en_OM p. 64; 23_3215095_en_OM p. 64; 21_3214210_en_OM p. 66; 22_3214412_en_OM p. 66; 21_3215008_en_OM p. 63; 22_3215051_en_OM p. 63; 22_3215074_en_OM p. 63 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 21_3214209_en_OM p. 72; 22_3214411_en_OM p. 71; 23_3215094_en_OM p. 64; 23_3215095_en_OM p. 64; 21_3214210_en_OM p. 67; 22_3214412_en_OM p. 67; 21_3215008_en_OM p. 63; 22_3215051_en_OM p. 63; 22_3215074_en_OM p. 63 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 21_3214209_en_OM p. 73; 22_3214411_en_OM p. 72; 23_3215094_en_OM p. 65; 23_3215095_en_OM p. 65; 21_3214210_en_OM p. 68; 22_3214412_en_OM p. 68; 21_3215008_en_OM p. 64; 22_3215051_en_OM p. 64; 22_3215074_en_OM p. 64 |
| Number of chain rollers measured | 18 | 21_3214209_en_OM p. 73; 22_3214411_en_OM p. 72; 23_3215094_en_OM p. 65; 23_3215095_en_OM p. 65; 21_3214210_en_OM p. 68; 22_3214412_en_OM p. 68; 21_3215008_en_OM p. 64; 22_3215051_en_OM p. 64; 22_3215074_en_OM p. 64 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 21_3214209_en_OM p. 73; 22_3214411_en_OM p. 72; 23_3215094_en_OM p. 65; 23_3215095_en_OM p. 65; 21_3214210_en_OM p. 68; 22_3214412_en_OM p. 68; 21_3215008_en_OM p. 64; 22_3215051_en_OM p. 64; 22_3215074_en_OM p. 64 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 21_3214209_en_OM p. 74; 22_3214411_en_OM p. 73; 23_3215094_en_OM p. 66; 23_3215095_en_OM p. 66; 21_3214210_en_OM p. 69; 22_3214412_en_OM p. 69; 21_3215008_en_OM p. 65; 22_3215051_en_OM p. 65; 22_3215074_en_OM p. 65 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 21_3214209_en_OM p. 74; 22_3214411_en_OM p. 73; 23_3215094_en_OM p. 67; 23_3215095_en_OM p. 67; 21_3214210_en_OM p. 69; 22_3214412_en_OM p. 69; 21_3215008_en_OM p. 66; 22_3215051_en_OM p. 66; 22_3215074_en_OM p. 66 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-mc125-2024-125xc-2023-2025-250sx-2023-2025-250xc-2023-2025-300sx-2023-2025-300xc-2023-2025`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, GasGas MC 125 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 24_3215157_en_OM p. 30 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 23_3214638_en_OM p. 35; 24_3214832_en_OM p. 35; 25_3240041_en_OM p. 35; 23_3214639_en_OM p. 34; 24_3214833_en_OM p. 34; 25_3240042_en_OM p. 34; 24_3215157_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 23_3214638_en_OM p. 72; 24_3214832_en_OM p. 74; 25_3240041_en_OM p. 74; 23_3214639_en_OM p. 72; 24_3214833_en_OM p. 73; 25_3240042_en_OM p. 73; 24_3215157_en_OM p. 65 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 23_3214638_en_OM p. 73; 24_3214832_en_OM p. 75; 25_3240041_en_OM p. 75; 23_3214639_en_OM p. 73; 24_3214833_en_OM p. 74; 25_3240042_en_OM p. 74; 24_3215157_en_OM p. 66 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3214638_en_OM p. 74; 24_3214832_en_OM p. 76; 25_3240041_en_OM p. 76; 23_3214639_en_OM p. 74; 24_3214833_en_OM p. 75; 25_3240042_en_OM p. 75; 24_3215157_en_OM p. 67 |
| Number of chain rollers measured | 18 | 23_3214638_en_OM p. 74; 24_3214832_en_OM p. 76; 25_3240041_en_OM p. 76; 23_3214639_en_OM p. 74; 24_3214833_en_OM p. 75; 25_3240042_en_OM p. 75; 24_3215157_en_OM p. 67 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3214638_en_OM p. 74; 24_3214832_en_OM p. 76; 25_3240041_en_OM p. 76; 23_3214639_en_OM p. 74; 24_3214833_en_OM p. 75; 25_3240042_en_OM p. 75; 24_3215157_en_OM p. 67 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 23_3214638_en_OM p. 75; 24_3214832_en_OM p. 77; 25_3240041_en_OM p. 77; 23_3214639_en_OM p. 75; 24_3214833_en_OM p. 76; 25_3240042_en_OM p. 76; 24_3215157_en_OM p. 68 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 23_3214638_en_OM p. 76; 24_3214832_en_OM p. 78; 25_3240041_en_OM p. 78; 23_3214639_en_OM p. 76; 24_3214833_en_OM p. 77; 25_3240042_en_OM p. 77; 24_3215157_en_OM p. 68 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-mc125-2026-125sx-2026-2027-125xc-2027-250sx-2026-250xc-2026-2027-300sx-2026-300xc-2026-2027`

Bikes: KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39; 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 26_3215266_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 26_3240232_en_BA p. 40; 27_3240379_en_BA p. 39; 26_3240233_en_BA p. 40; 27_3240380_en_BA p. 40; 26_3215266_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm (2.28-2.4 in) | 26_3240232_en_BA p. 83; 27_3240379_en_BA p. 83; 26_3240233_en_BA p. 83; 27_3240380_en_BA p. 83; 26_3215266_en_BA p. 71 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 26_3240232_en_BA p. 84; 27_3240379_en_BA p. 84; 26_3240233_en_BA p. 84; 27_3240380_en_BA p. 84; 26_3215266_en_BA p. 72 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 26_3240232_en_BA p. 85; 27_3240379_en_BA p. 85; 26_3240233_en_BA p. 85; 27_3240380_en_BA p. 85; 26_3215266_en_BA p. 73 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 26_3240232_en_BA p. 85; 27_3240379_en_BA p. 85; 26_3240233_en_BA p. 85; 27_3240380_en_BA p. 85; 26_3215266_en_BA p. 73 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 26_3240232_en_BA p. 86; 27_3240379_en_BA p. 86; 26_3240233_en_BA p. 86; 27_3240380_en_BA p. 86; 26_3215266_en_BA p. 74 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 26_3240232_en_BA p. 85; 27_3240379_en_BA p. 85; 26_3240233_en_BA p. 85; 27_3240380_en_BA p. 85; 26_3215266_en_BA p. 73 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 26_3240232_en_BA p. 86; 27_3240379_en_BA p. 86; 26_3240233_en_BA p. 86; 27_3240380_en_BA p. 86; 26_3215266_en_BA p. 74 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 26_3240232_en_BA p. 86; 27_3240379_en_BA p. 86; 26_3240233_en_BA p. 86; 27_3240380_en_BA p. 86; 26_3215266_en_BA p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-ex250-2024-ex300-2024-mc250-2024-tc125-2023-2024`

Bikes: Husqvarna TC 125 2023, Husqvarna TC 125 2024, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32; 24_3215158_en_OM p. 31 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 23_3402629_en_OM p. 32; 24_3402711_en_OM p. 32; 24_3215158_en_OM p. 31 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 23_3402629_en_OM p. 70; 24_3402711_en_OM p. 70; 24_3215158_en_OM p. 67 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3402629_en_OM p. 71; 24_3402711_en_OM p. 71; 24_3215158_en_OM p. 69 |
| Number of chain rollers measured | 18 | 23_3402629_en_OM p. 71; 24_3402711_en_OM p. 71; 24_3215158_en_OM p. 69 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3402629_en_OM p. 71; 24_3402711_en_OM p. 71; 24_3215158_en_OM p. 69 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 23_3402629_en_OM p. 72; 24_3402711_en_OM p. 72; 24_3215158_en_OM p. 70 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 23_3402629_en_OM p. 73; 24_3402711_en_OM p. 73; 24_3215158_en_OM p. 70 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc125-2025-tc150-2025`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402801_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 25_3402801_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm | 25_3402801_en_BA p. 71 |
| Pull weight for the chain wear measurement | 10-15 kg | 25_3402801_en_BA p. 73 |
| Maximum length over the measured rollers | 272 mm | 25_3402801_en_BA p. 73 |
| Chain guide minimum thickness | 6 mm | 25_3402801_en_BA p. 74 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m | 25_3402801_en_BA p. 74 |
| Torque, screws of the chain slider | 15 N·m | 25_3402801_en_BA p. 74 |
| Torque, screws of the chain guide | 10 N·m | 25_3402801_en_BA p. 75 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc125-2026-tc250-2026-tx300-2026-2027`

Bikes: Husqvarna TC 125 2026, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3402882_en_BA p. 35; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 26_3402882_en_BA p. 35; 26_3402883_en_BA p. 38; 27_3402944_en_BA p. 41 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 26_3402882_en_BA p. 77; 26_3402883_en_BA p. 81; 27_3402944_en_BA p. 87 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 26_3402882_en_BA p. 78; 26_3402883_en_BA p. 82; 27_3402944_en_BA p. 88 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 26_3402882_en_BA p. 79; 26_3402883_en_BA p. 83; 27_3402944_en_BA p. 89 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 26_3402882_en_BA p. 79; 26_3402883_en_BA p. 83; 27_3402944_en_BA p. 89 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 26_3402882_en_BA p. 80; 26_3402883_en_BA p. 84; 27_3402944_en_BA p. 90 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 26_3402882_en_BA p. 80; 26_3402883_en_BA p. 84; 27_3402944_en_BA p. 90 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 26_3402882_en_BA p. 80; 26_3402883_en_BA p. 84; 27_3402944_en_BA p. 90 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 26_3402882_en_BA p. 81; 26_3402883_en_BA p. 85; 27_3402944_en_BA p. 91 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc250-2023-2024-tx300-2023-2024`

Bikes: Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 23_3402630_en_OM p. 34; 24_3402712_en_OM p. 34 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 23_3402630_en_OM p. 74; 24_3402712_en_OM p. 74 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 23_3402630_en_OM p. 75; 24_3402712_en_OM p. 76 |
| Number of chain rollers measured | 18 | 23_3402630_en_OM p. 75; 24_3402712_en_OM p. 76 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 23_3402630_en_OM p. 75; 24_3402712_en_OM p. 76 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 23_3402630_en_OM p. 76; 24_3402712_en_OM p. 77 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 23_3402630_en_OM p. 76; 24_3402712_en_OM p. 77 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-ex250-2025-ex300-2025-mc250-2025-tc250-2025-tc300-2025-tx300-2025`

Bikes: Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 250 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3402802_en_BA p. 39; 25_3215220_en_BA p. 35 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 25_3402802_en_BA p. 39; 25_3215220_en_BA p. 35 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm | 25_3402802_en_BA p. 82; 25_3215220_en_BA p. 76 |
| Torque, rear wheel spindle nut | 80 N·m | 25_3402802_en_BA p. 83; 25_3215220_en_BA p. 77 |
| Pull weight for the chain wear measurement | 10-15 kg | 25_3402802_en_BA p. 84; 25_3215220_en_BA p. 78 |
| Maximum length over the measured rollers | 272 mm | 25_3402802_en_BA p. 84; 25_3215220_en_BA p. 78 |
| Chain guide minimum thickness | 6 mm | 25_3402802_en_BA p. 85; 25_3215220_en_BA p. 79 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m | 25_3402802_en_BA p. 84; 25_3215220_en_BA p. 78 |
| Torque, screws of the chain slider | 15 N·m | 25_3402802_en_BA p. 85; 25_3215220_en_BA p. 79 |
| Torque, screws of the chain guide | 10 N·m | 25_3402802_en_BA p. 85; 25_3215220_en_BA p. 79 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-mc125-2025`

Bikes: GasGas MC 125 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3215219_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 25_3215219_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 58-61 mm | 25_3215219_en_BA p. 70 |
| Pull weight for the chain wear measurement | 10-15 kg | 25_3215219_en_BA p. 72 |
| Maximum length over the measured rollers | 272 mm | 25_3215219_en_BA p. 72 |
| Chain guide minimum thickness | 6 mm | 25_3215219_en_BA p. 73 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m | 25_3215219_en_BA p. 73 |
| Torque, screws of the chain slider | 15 N·m | 25_3215219_en_BA p. 73 |
| Torque, screws of the chain guide | 10 N·m | 25_3215219_en_BA p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-ex300-2026-2027-mc250-2026`

Bikes: GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 45 operating hours | 26_3215267_en_BA p. 36; 27_3215289_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 26_3215267_en_BA p. 78; 27_3215289_en_BA p. 69 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 26_3215267_en_BA p. 79; 27_3215289_en_BA p. 70 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 26_3215267_en_BA p. 80; 27_3215289_en_BA p. 71 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 26_3215267_en_BA p. 80; 27_3215289_en_BA p. 71 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 26_3215267_en_BA p. 81; 27_3215289_en_BA p. 72 |
| Torque, screws of the chain slider (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 26_3215267_en_BA p. 80; 27_3215289_en_BA p. 71 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 26_3215267_en_BA p. 81; 27_3215289_en_BA p. 72 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 26_3215267_en_BA p. 81; 27_3215289_en_BA p. 72 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | every 20 operating hours and after every race | 20_3213998_en_OM p. 31 |
| Chain, sprockets and guide check interval | every 20 operating hours and after every race | 20_3213998_en_OM p. 31 |
| Chain tension (slack) at the end of the chain slider | 46-49 mm (1.81-1.93 in) | 20_3213998_en_OM p. 63 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3213998_en_OM p. 64 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3213998_en_OM p. 65 |
| Number of chain rollers measured | 18 | 20_3213998_en_OM p. 65 |
| Maximum length over the measured rollers | 219 mm (8.62 in) | 20_3213998_en_OM p. 65 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 20_3213998_en_OM p. 67 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-85sx1714-2021-2023-85sx1916-2021-2023`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first 10 operating hours, then every 20 operating hours and after every race | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |
| Chain, sprockets and guide check interval | once after the first 10 operating hours, then every 20 operating hours and after every race | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |
| Chain tension (slack) at the end of the chain slider | 46-49 mm (1.81-1.93 in) | 21_3214206_en_OM p. 63; 22_3214408_en_OM p. 63; 23_3214636_en_OM p. 63 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 21_3214206_en_OM p. 64; 22_3214408_en_OM p. 64; 23_3214636_en_OM p. 64 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 21_3214206_en_OM p. 65; 22_3214408_en_OM p. 65; 23_3214636_en_OM p. 65 |
| Number of chain rollers measured | 18 | 21_3214206_en_OM p. 65; 22_3214408_en_OM p. 65; 23_3214636_en_OM p. 65 |
| Maximum length over the measured rollers | 219 mm (8.62 in) | 21_3214206_en_OM p. 65; 22_3214408_en_OM p. 65; 23_3214636_en_OM p. 65 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 21_3214206_en_OM p. 67; 22_3214408_en_OM p. 67; 23_3214636_en_OM p. 67 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-85sx1714-2024-85sx1916-2024`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours | 24_3214830_en_OM p. 31 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 24_3214830_en_OM p. 31 |
| Chain tension (slack) at the end of the chain slider | 46-49 mm (1.81-1.93 in) | 24_3214830_en_OM p. 63 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 24_3214830_en_OM p. 64 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 24_3214830_en_OM p. 65 |
| Number of chain rollers measured | 18 | 24_3214830_en_OM p. 65 |
| Maximum length over the measured rollers | 219 mm (8.62 in) | 24_3214830_en_OM p. 65 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 24_3214830_en_OM p. 67 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours | 25_3240038_en_BA p. 32 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 25_3240038_en_BA p. 31 |
| Chain tension (slack) at the end of the chain slider | 43-46 mm | 25_3240038_en_BA p. 68 |
| Torque, rear wheel spindle nut | 80 N·m | 25_3240038_en_BA p. 69 |
| Pull weight for the chain wear measurement | 10-15 kg | 25_3240038_en_BA p. 70 |
| Maximum length over the measured rollers | 219 mm | 25_3240038_en_BA p. 70 |
| Torque, screws of the chain slider | 10 N·m | 25_3240038_en_BA p. 70 |
| Torque, screws of the chain slider | 15 N·m | 25_3240038_en_BA p. 71 |
| Torque, screws of the chain guide | 10 N·m | 25_3240038_en_BA p. 71 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-85sx1714-2026-2027-85sx1916-2026-2027`

Bikes: KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 15 operating hours | 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 33 |
| Chain, sprockets and guide check interval | once after the first operating hour, then every 15 operating hours | 26_3240229_en_BA p. 31; 27_3240375_en_BA p. 32 |
| Chain tension (slack) at the end of the chain slider | 43-46 mm (1.69-1.81 in) | 26_3240229_en_BA p. 67; 27_3240375_en_BA p. 69 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 26_3240229_en_BA p. 68; 27_3240375_en_BA p. 70 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33.1 lb) | 26_3240229_en_BA p. 69; 27_3240375_en_BA p. 71 |
| Maximum length over the measured rollers | 219 mm (8.62 in) | 26_3240229_en_BA p. 69; 27_3240375_en_BA p. 71 |
| Torque, screws of the chain slider | 10 N·m (7.4 lbf·ft) | 26_3240229_en_BA p. 69; 27_3240375_en_BA p. 71 |
| Torque, screws of the chain slider | 15 N·m (11.1 lbf·ft) | 26_3240229_en_BA p. 70; 27_3240375_en_BA p. 72 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 26_3240229_en_BA p. 70; 27_3240375_en_BA p. 72 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-ex300-2021-250xc-2020-2022-300xc-2020-2022`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, GasGas EX 300 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours | 20_3214002_en_OM p. 33; 21_3214211_en_OM p. 33; 22_3214413_en_OM p. 33; 21_3215018_en_OM p. 30 |
| Chain, sprockets and guide check interval | every 10 operating hours | 20_3214002_en_OM p. 33; 21_3214211_en_OM p. 33; 22_3214413_en_OM p. 33; 21_3215018_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3214002_en_OM p. 69; 21_3214211_en_OM p. 70; 22_3214413_en_OM p. 70; 21_3215018_en_OM p. 64 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3214002_en_OM p. 70; 21_3214211_en_OM p. 71; 22_3214413_en_OM p. 71; 21_3215018_en_OM p. 65 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3214002_en_OM p. 71; 21_3214211_en_OM p. 72; 22_3214413_en_OM p. 72; 21_3215018_en_OM p. 66 |
| Number of chain rollers measured | 18 | 20_3214002_en_OM p. 71; 21_3214211_en_OM p. 72; 22_3214413_en_OM p. 72; 21_3215018_en_OM p. 66 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3214002_en_OM p. 71; 21_3214211_en_OM p. 72; 22_3214413_en_OM p. 72; 21_3215018_en_OM p. 66 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 20_3214002_en_OM p. 72; 21_3214211_en_OM p. 73; 22_3214413_en_OM p. 73; 21_3215018_en_OM p. 67 |
| Torque, screws of the chain guide | 10 N·m (7.4 lbf·ft) | 20_3214002_en_OM p. 73; 21_3214211_en_OM p. 73; 22_3214413_en_OM p. 73; 21_3215018_en_OM p. 68 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc125-2020`

Bikes: Husqvarna TC 125 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 32 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 32 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3402332_en_OM p. 68 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3402332_en_OM p. 69 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3402332_en_OM p. 70 |
| Number of chain rollers measured | 18 | 20_3402332_en_OM p. 70 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3402332_en_OM p. 70 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc125-2021-2022`

Bikes: Husqvarna TC 125 2021, Husqvarna TC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 21_3402439_en_OM p. 68; 22_3402529_en_OM p. 69 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 21_3402439_en_OM p. 69; 22_3402529_en_OM p. 70 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 21_3402439_en_OM p. 70; 22_3402529_en_OM p. 71 |
| Number of chain rollers measured | 18 | 21_3402439_en_OM p. 70; 22_3402529_en_OM p. 71 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 21_3402439_en_OM p. 70; 22_3402529_en_OM p. 71 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc250-2020-2021`

Bikes: Husqvarna TC 250 2020, Husqvarna TC 250 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 20_3402333_en_OM p. 32; 21_3402440_en_OM p. 32 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 20_3402333_en_OM p. 32; 21_3402440_en_OM p. 32 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3402333_en_OM p. 68; 21_3402440_en_OM p. 68 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3402333_en_OM p. 69; 21_3402440_en_OM p. 69 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3402333_en_OM p. 70; 21_3402440_en_OM p. 70 |
| Number of chain rollers measured | 18 | 20_3402333_en_OM p. 70; 21_3402440_en_OM p. 70 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3402333_en_OM p. 70; 21_3402440_en_OM p. 70 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 20_3402333_en_OM p. 70; 21_3402440_en_OM p. 70 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 20_3402333_en_OM p. 71; 21_3402440_en_OM p. 71 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tc250-2022`

Bikes: Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours and after every race | 22_3402530_en_OM p. 33 |
| Chain, sprockets and guide check interval | every 10 operating hours and after every race | 22_3402530_en_OM p. 33 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 22_3402530_en_OM p. 69 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 22_3402530_en_OM p. 70 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 22_3402530_en_OM p. 71 |
| Number of chain rollers measured | 18 | 22_3402530_en_OM p. 71 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 22_3402530_en_OM p. 71 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 22_3402530_en_OM p. 71 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 22_3402530_en_OM p. 72 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tx300-2020`

Bikes: Husqvarna TX 300 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours | 20_3402334_en_OM p. 34 |
| Chain, sprockets and guide check interval | every 10 operating hours | 20_3402334_en_OM p. 34 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 20_3402334_en_OM p. 71 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 20_3402334_en_OM p. 72 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 20_3402334_en_OM p. 73 |
| Number of chain rollers measured | 18 | 20_3402334_en_OM p. 73 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 20_3402334_en_OM p. 73 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 6 N·m (4.4 lbf·ft) | 20_3402334_en_OM p. 74 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 20_3402334_en_OM p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tx300-2021`

Bikes: Husqvarna TX 300 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours | 21_3402441_en_OM p. 34 |
| Chain, sprockets and guide check interval | every 10 operating hours | 21_3402441_en_OM p. 34 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 21_3402441_en_OM p. 71 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 21_3402441_en_OM p. 72 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 21_3402441_en_OM p. 73 |
| Number of chain rollers measured | 18 | 21_3402441_en_OM p. 73 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 21_3402441_en_OM p. 73 |
| Torque, screws of the chain sliding guard (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 21_3402441_en_OM p. 74 |
| Torque, screws of the chain sliding piece | 15 N·m (11.1 lbf·ft) | 21_3402441_en_OM p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-tx300-2022`

Bikes: Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours | 22_3402531_en_OM p. 35 |
| Chain, sprockets and guide check interval | every 10 operating hours | 22_3402531_en_OM p. 35 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 22_3402531_en_OM p. 72 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 22_3402531_en_OM p. 73 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 22_3402531_en_OM p. 74 |
| Number of chain rollers measured | 18 | 22_3402531_en_OM p. 74 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 22_3402531_en_OM p. 74 |

### Check, clean and adjust the chain and sprockets

`bak-ktmg2t-chain-v1-ex250-2022-2023-ex300-2022-2023`

Bikes: GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Chain tension check interval | once after the first operating hour, then every 10 operating hours | 22_3215052_en_OM p. 30; 23_3215096_en_OM p. 30 |
| Chain, sprockets and guide check interval | every 10 operating hours | 22_3215052_en_OM p. 30; 23_3215096_en_OM p. 30 |
| Chain tension (slack) at the end of the chain slider | 55-58 mm (2.17-2.28 in) | 22_3215052_en_OM p. 64; 23_3215096_en_OM p. 64 |
| Torque, rear wheel spindle nut | 80 N·m (59 lbf·ft) | 22_3215052_en_OM p. 65; 23_3215096_en_OM p. 65 |
| Pull weight for the chain wear measurement | 10-15 kg (22-33 lb) | 22_3215052_en_OM p. 66; 23_3215096_en_OM p. 66 |
| Number of chain rollers measured | 18 | 22_3215052_en_OM p. 66; 23_3215096_en_OM p. 66 |
| Maximum length over the measured rollers | 272 mm (10.71 in) | 22_3215052_en_OM p. 66; 23_3215096_en_OM p. 66 |
| Chain guide minimum thickness | 6 mm (0.24 in) | 22_3215052_en_OM p. 67; 23_3215096_en_OM p. 67 |
| Torque, screws of the chain guide (threadlocker Loctite 243) | 10 N·m (7.4 lbf·ft) | 22_3215052_en_OM p. 68; 23_3215096_en_OM p. 68 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-mc125-2021-2023-and-more-de2a7647`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 250 SX 2020, GasGas MC 125 2023, GasGas MC 250 2023, KTM 250 SX 2021, KTM 250 SX 2022, Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours and after every race | 20_3214000_en_OM p. 31; 21_3214209_en_OM p. 36; 22_3214411_en_OM p. 35; 20_3214001_en_OM p. 31; 23_3215094_en_OM p. 30; 23_3215095_en_OM p. 30; 21_3214210_en_OM p. 31; 22_3214412_en_OM p. 31; 21_3402439_en_OM p. 32; 22_3402529_en_OM p. 33; 20_3402333_en_OM p. 32; 21_3402440_en_OM p. 32; 22_3402530_en_OM p. 33; 21_3215008_en_OM p. 30; 22_3215051_en_OM p. 30; 22_3215074_en_OM p. 30 |
| Brake fluid change interval | at least every 12 months | 20_3214000_en_OM p. 32; 21_3214209_en_OM p. 37; 22_3214411_en_OM p. 36; 20_3214001_en_OM p. 32; 23_3215094_en_OM p. 31; 23_3215095_en_OM p. 31; 21_3214210_en_OM p. 32; 22_3214412_en_OM p. 32; 21_3402439_en_OM p. 33; 22_3402529_en_OM p. 34; 20_3402333_en_OM p. 33; 21_3402440_en_OM p. 33; 22_3402530_en_OM p. 34; 21_3215008_en_OM p. 31; 22_3215051_en_OM p. 31; 22_3215074_en_OM p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 20_3214000_en_OM p. 76; 21_3214209_en_OM p. 80; 22_3214411_en_OM p. 79; 20_3214001_en_OM p. 75; 23_3215094_en_OM p. 72; 23_3215095_en_OM p. 72; 21_3214210_en_OM p. 75; 22_3214412_en_OM p. 75; 21_3402439_en_OM p. 77; 22_3402529_en_OM p. 78; 20_3402333_en_OM p. 77; 21_3402440_en_OM p. 77; 22_3402530_en_OM p. 78; 21_3215008_en_OM p. 71; 22_3215051_en_OM p. 71; 22_3215074_en_OM p. 71 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3214000_en_OM p. 77; 21_3214209_en_OM p. 81; 22_3214411_en_OM p. 80; 20_3214001_en_OM p. 76; 23_3215094_en_OM p. 72; 23_3215095_en_OM p. 72; 21_3214210_en_OM p. 76; 22_3214412_en_OM p. 76; 21_3402439_en_OM p. 78; 22_3402529_en_OM p. 79; 20_3402333_en_OM p. 78; 21_3402440_en_OM p. 78; 22_3402530_en_OM p. 79; 21_3215008_en_OM p. 71; 22_3215051_en_OM p. 71; 22_3215074_en_OM p. 71 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3214000_en_OM p. 77; 21_3214209_en_OM p. 81; 22_3214411_en_OM p. 80; 20_3214001_en_OM p. 76; 23_3215094_en_OM p. 72; 23_3215095_en_OM p. 72; 21_3214210_en_OM p. 76; 22_3214412_en_OM p. 76; 21_3402439_en_OM p. 78; 22_3402529_en_OM p. 79; 20_3402333_en_OM p. 78; 21_3402440_en_OM p. 78; 22_3402530_en_OM p. 79; 21_3215008_en_OM p. 71; 22_3215051_en_OM p. 71; 22_3215074_en_OM p. 71 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3214000_en_OM p. 79; 21_3214209_en_OM p. 83; 22_3214411_en_OM p. 82; 20_3214001_en_OM p. 78; 23_3215094_en_OM p. 74; 23_3215095_en_OM p. 74; 21_3214210_en_OM p. 78; 22_3214412_en_OM p. 78; 21_3402439_en_OM p. 80; 22_3402529_en_OM p. 81; 20_3402333_en_OM p. 80; 21_3402440_en_OM p. 80; 22_3402530_en_OM p. 81; 21_3215008_en_OM p. 73; 22_3215051_en_OM p. 73; 22_3215074_en_OM p. 73 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3214000_en_OM p. 79; 21_3214209_en_OM p. 83; 22_3214411_en_OM p. 82; 20_3214001_en_OM p. 78; 23_3215094_en_OM p. 74; 23_3215095_en_OM p. 74; 21_3214210_en_OM p. 78; 22_3214412_en_OM p. 78; 21_3402439_en_OM p. 80; 22_3402529_en_OM p. 81; 20_3402333_en_OM p. 80; 21_3402440_en_OM p. 80; 22_3402530_en_OM p. 81; 21_3215008_en_OM p. 73; 22_3215051_en_OM p. 73; 22_3215074_en_OM p. 73 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214000_en_OM p. 79; 21_3214209_en_OM p. 83; 22_3214411_en_OM p. 82; 20_3214001_en_OM p. 78; 23_3215094_en_OM p. 75; 23_3215095_en_OM p. 75; 21_3214210_en_OM p. 78; 22_3214412_en_OM p. 78; 21_3402439_en_OM p. 80; 22_3402529_en_OM p. 81; 20_3402333_en_OM p. 80; 21_3402440_en_OM p. 80; 22_3402530_en_OM p. 81; 21_3215008_en_OM p. 74; 22_3215051_en_OM p. 74; 22_3215074_en_OM p. 74 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214000_en_OM p. 85; 21_3214209_en_OM p. 89; 22_3214411_en_OM p. 88; 20_3214001_en_OM p. 84; 23_3215094_en_OM p. 80; 23_3215095_en_OM p. 80; 21_3214210_en_OM p. 84; 22_3214412_en_OM p. 84; 21_3402439_en_OM p. 85; 22_3402529_en_OM p. 86; 20_3402333_en_OM p. 86; 21_3402440_en_OM p. 86; 22_3402530_en_OM p. 87; 21_3215008_en_OM p. 79; 22_3215051_en_OM p. 79; 22_3215074_en_OM p. 79 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3214000_en_OM p. 82; 21_3214209_en_OM p. 86; 22_3214411_en_OM p. 85; 20_3214001_en_OM p. 81; 23_3215094_en_OM p. 78; 23_3215095_en_OM p. 78; 21_3214210_en_OM p. 81; 22_3214412_en_OM p. 81; 21_3402439_en_OM p. 83; 22_3402529_en_OM p. 84; 20_3402333_en_OM p. 83; 21_3402440_en_OM p. 83; 22_3402530_en_OM p. 84; 21_3215008_en_OM p. 76; 22_3215051_en_OM p. 76; 22_3215074_en_OM p. 76 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3214000_en_OM p. 82; 21_3214209_en_OM p. 86; 22_3214411_en_OM p. 85; 20_3214001_en_OM p. 81; 23_3215094_en_OM p. 78; 23_3215095_en_OM p. 78; 21_3214210_en_OM p. 81; 22_3214412_en_OM p. 81; 21_3402439_en_OM p. 83; 22_3402529_en_OM p. 84; 20_3402333_en_OM p. 83; 21_3402440_en_OM p. 83; 22_3402530_en_OM p. 84; 21_3215008_en_OM p. 77; 22_3215051_en_OM p. 77; 22_3215074_en_OM p. 77 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3214000_en_OM p. 82; 21_3214209_en_OM p. 86; 22_3214411_en_OM p. 85; 20_3214001_en_OM p. 81; 23_3215094_en_OM p. 78; 23_3215095_en_OM p. 78; 21_3214210_en_OM p. 81; 22_3214412_en_OM p. 81; 21_3402439_en_OM p. 83; 22_3402529_en_OM p. 84; 20_3402333_en_OM p. 84; 21_3402440_en_OM p. 84; 22_3402530_en_OM p. 85; 21_3215008_en_OM p. 77; 22_3215051_en_OM p. 77; 22_3215074_en_OM p. 77 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-ex250-2024-and-more-37139603`

Bikes: KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, GasGas MC 125 2024, GasGas MC 250 2024, GasGas EX 300 2024, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 23_3214638_en_OM p. 34; 24_3214832_en_OM p. 34; 25_3240041_en_OM p. 34; 23_3214639_en_OM p. 33; 24_3214833_en_OM p. 33; 25_3240042_en_OM p. 33; 23_3402630_en_OM p. 33; 24_3402712_en_OM p. 33; 24_3215157_en_OM p. 29; 24_3215158_en_OM p. 30 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 23_3214638_en_OM p. 34; 24_3214832_en_OM p. 34; 25_3240041_en_OM p. 34; 23_3214639_en_OM p. 33; 24_3214833_en_OM p. 33; 25_3240042_en_OM p. 33; 23_3402630_en_OM p. 33; 24_3402712_en_OM p. 33; 24_3215157_en_OM p. 29; 24_3215158_en_OM p. 30 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 23_3214638_en_OM p. 81; 24_3214832_en_OM p. 83; 25_3240041_en_OM p. 83; 23_3214639_en_OM p. 81; 24_3214833_en_OM p. 82; 25_3240042_en_OM p. 82; 23_3402630_en_OM p. 82; 24_3402712_en_OM p. 83; 24_3215157_en_OM p. 74; 24_3215158_en_OM p. 76 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 23_3214638_en_OM p. 82; 24_3214832_en_OM p. 84; 25_3240041_en_OM p. 84; 23_3214639_en_OM p. 82; 24_3214833_en_OM p. 83; 25_3240042_en_OM p. 83; 23_3402630_en_OM p. 82; 24_3402712_en_OM p. 83; 24_3215157_en_OM p. 74; 24_3215158_en_OM p. 76 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 23_3214638_en_OM p. 82; 24_3214832_en_OM p. 84; 25_3240041_en_OM p. 84; 23_3214639_en_OM p. 82; 24_3214833_en_OM p. 83; 25_3240042_en_OM p. 83; 23_3402630_en_OM p. 83; 24_3402712_en_OM p. 84; 24_3215157_en_OM p. 74; 24_3215158_en_OM p. 76 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 23_3214638_en_OM p. 84; 24_3214832_en_OM p. 86; 25_3240041_en_OM p. 86; 23_3214639_en_OM p. 84; 24_3214833_en_OM p. 85; 25_3240042_en_OM p. 85; 23_3402630_en_OM p. 85; 24_3402712_en_OM p. 86; 24_3215157_en_OM p. 76; 24_3215158_en_OM p. 78 |
| Brake fluid type | DOT 4 / DOT 5.1 | 23_3214638_en_OM p. 84; 24_3214832_en_OM p. 86; 25_3240041_en_OM p. 86; 23_3214639_en_OM p. 84; 24_3214833_en_OM p. 85; 25_3240042_en_OM p. 85; 23_3402630_en_OM p. 85; 24_3402712_en_OM p. 86; 24_3215157_en_OM p. 76; 24_3215158_en_OM p. 78 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3214638_en_OM p. 84; 24_3214832_en_OM p. 86; 25_3240041_en_OM p. 86; 23_3214639_en_OM p. 84; 24_3214833_en_OM p. 85; 25_3240042_en_OM p. 85; 23_3402630_en_OM p. 85; 24_3402712_en_OM p. 86; 24_3215157_en_OM p. 77; 24_3215158_en_OM p. 79 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3214638_en_OM p. 90; 24_3214832_en_OM p. 92; 25_3240041_en_OM p. 92; 23_3214639_en_OM p. 90; 24_3214833_en_OM p. 91; 25_3240042_en_OM p. 91; 23_3402630_en_OM p. 92; 24_3402712_en_OM p. 93; 24_3215157_en_OM p. 83; 24_3215158_en_OM p. 84 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 23_3214638_en_OM p. 87; 24_3214832_en_OM p. 89; 25_3240041_en_OM p. 89; 23_3214639_en_OM p. 87; 24_3214833_en_OM p. 88; 25_3240042_en_OM p. 88; 23_3402630_en_OM p. 89; 24_3402712_en_OM p. 90; 24_3215157_en_OM p. 80; 24_3215158_en_OM p. 82 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 23_3214638_en_OM p. 88; 24_3214832_en_OM p. 90; 25_3240041_en_OM p. 90; 23_3214639_en_OM p. 88; 24_3214833_en_OM p. 89; 25_3240042_en_OM p. 89; 23_3402630_en_OM p. 89; 24_3402712_en_OM p. 90; 24_3215157_en_OM p. 80; 24_3215158_en_OM p. 82 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 23_3214638_en_OM p. 88; 24_3214832_en_OM p. 90; 25_3240041_en_OM p. 90; 23_3214639_en_OM p. 88; 24_3214833_en_OM p. 89; 25_3240042_en_OM p. 89; 23_3402630_en_OM p. 89; 24_3402712_en_OM p. 90; 24_3215157_en_OM p. 80; 24_3215158_en_OM p. 82 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-125sx-2026`

Bikes: KTM 125 SX 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240232_en_BA p. 39 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3240232_en_BA p. 39 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3240232_en_BA p. 92 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3240232_en_BA p. 93 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3240232_en_BA p. 93 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3240232_en_BA p. 95 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3240232_en_BA p. 95 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240232_en_BA p. 95 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240232_en_BA p. 101 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3240232_en_BA p. 98 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 26_3240232_en_BA p. 99 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 26_3240232_en_BA p. 99 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-ex300-2026-2027-and-more-9756edbf`

Bikes: KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TX 300 2027, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240379_en_BA p. 38; 26_3240233_en_BA p. 39; 27_3240380_en_BA p. 39; 27_3402944_en_BA p. 40; 26_3215267_en_BA p. 35; 27_3215289_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 27_3240379_en_BA p. 38; 26_3240233_en_BA p. 39; 27_3240380_en_BA p. 39; 27_3402944_en_BA p. 40; 26_3215267_en_BA p. 35; 27_3215289_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 27_3240379_en_BA p. 92; 26_3240233_en_BA p. 92; 27_3240380_en_BA p. 92; 27_3402944_en_BA p. 96; 26_3215267_en_BA p. 87; 27_3215289_en_BA p. 78 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 27_3240379_en_BA p. 93; 26_3240233_en_BA p. 93; 27_3240380_en_BA p. 93; 27_3402944_en_BA p. 96; 26_3215267_en_BA p. 87; 27_3215289_en_BA p. 78 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 27_3240379_en_BA p. 93; 26_3240233_en_BA p. 93; 27_3240380_en_BA p. 93; 27_3402944_en_BA p. 96; 26_3215267_en_BA p. 87; 27_3215289_en_BA p. 78 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 27_3240379_en_BA p. 95; 26_3240233_en_BA p. 95; 27_3240380_en_BA p. 95; 27_3402944_en_BA p. 99; 26_3215267_en_BA p. 90; 27_3215289_en_BA p. 81 |
| Brake fluid type | DOT 5.1 | 27_3240379_en_BA p. 95; 26_3240233_en_BA p. 95; 27_3240380_en_BA p. 95; 27_3402944_en_BA p. 99; 26_3215267_en_BA p. 90; 27_3215289_en_BA p. 81 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240379_en_BA p. 95; 26_3240233_en_BA p. 95; 27_3240380_en_BA p. 95; 27_3402944_en_BA p. 99; 26_3215267_en_BA p. 90; 27_3215289_en_BA p. 81 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240379_en_BA p. 101; 26_3240233_en_BA p. 101; 27_3240380_en_BA p. 101; 27_3402944_en_BA p. 105; 26_3215267_en_BA p. 95; 27_3215289_en_BA p. 86 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 27_3240379_en_BA p. 98; 26_3240233_en_BA p. 98; 27_3240380_en_BA p. 98; 27_3402944_en_BA p. 102; 26_3215267_en_BA p. 93; 27_3215289_en_BA p. 84 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 27_3240379_en_BA p. 99; 26_3240233_en_BA p. 99; 27_3240380_en_BA p. 99; 27_3402944_en_BA p. 103; 26_3215267_en_BA p. 93; 27_3215289_en_BA p. 84 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 27_3240379_en_BA p. 99; 26_3240233_en_BA p. 99; 27_3240380_en_BA p. 99; 27_3402944_en_BA p. 103; 26_3215267_en_BA p. 93; 27_3215289_en_BA p. 84 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc125-2023`

Bikes: Husqvarna TC 125 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 23_3402629_en_OM p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 23_3402629_en_OM p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 23_3402629_en_OM p. 78 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 23_3402629_en_OM p. 79 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 23_3402629_en_OM p. 79 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 23_3402629_en_OM p. 81 |
| Brake fluid type | DOT 4 / DOT 5.1 | 23_3402629_en_OM p. 81 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3402629_en_OM p. 81 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 23_3402629_en_OM p. 88 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 23_3402629_en_OM p. 85 |
| Torque, push rod lock nut (foot brake) | 20 N·m (14.8 lbf·ft) | 23_3402629_en_OM p. 85 |
| Torque, foot brake lever stop nut | 10 N·m (7.4 lbf·ft) | 23_3402629_en_OM p. 85 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc125-2024`

Bikes: Husqvarna TC 125 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3402711_en_OM p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 24_3402711_en_OM p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 24_3402711_en_OM p. 78 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 24_3402711_en_OM p. 79 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 24_3402711_en_OM p. 79 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 24_3402711_en_OM p. 81 |
| Brake fluid type | DOT 4 / DOT 5.1 | 24_3402711_en_OM p. 81 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3402711_en_OM p. 81 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 24_3402711_en_OM p. 88 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 24_3402711_en_OM p. 85 |
| Torque, push rod lock nut (foot brake) | 20 N·m (14.8 lbf·ft) | 24_3402711_en_OM p. 85 |
| Torque, foot brake lever stop nut | 10 N·m (7.4 lbf·ft) | 24_3402711_en_OM p. 85 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc125-2025-tc150-2025`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 25_3402801_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3402801_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm | 25_3402801_en_BA p. 80 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm | 25_3402801_en_BA p. 81 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3402801_en_BA p. 81 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3402801_en_BA p. 83 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3402801_en_BA p. 83 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3402801_en_BA p. 83 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3402801_en_BA p. 89 |
| Foot brake lever free travel | 3-5 mm | 25_3402801_en_BA p. 86 |
| Torque, push rod lock nut (foot brake) | 20 N·m | 25_3402801_en_BA p. 87 |
| Torque, foot brake lever stop nut | 10 N·m | 25_3402801_en_BA p. 87 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc125-2026`

Bikes: Husqvarna TC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 26_3402882_en_BA p. 34 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3402882_en_BA p. 34 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3402882_en_BA p. 86 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3402882_en_BA p. 87 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3402882_en_BA p. 87 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3402882_en_BA p. 89 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3402882_en_BA p. 89 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402882_en_BA p. 89 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402882_en_BA p. 95 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3402882_en_BA p. 92 |
| Torque, push rod lock nut (foot brake) | 20 N·m (14.8 lbf·ft) | 26_3402882_en_BA p. 93 |
| Torque, foot brake lever stop nut | 10 N·m (7.4 lbf·ft) | 26_3402882_en_BA p. 93 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc250-2025-tc300-2025-tx300-2025`

Bikes: Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 25_3402802_en_BA p. 38 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3402802_en_BA p. 38 |
| Hand brake lever free travel | at least 3 mm | 25_3402802_en_BA p. 91 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm | 25_3402802_en_BA p. 91 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3402802_en_BA p. 91 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3402802_en_BA p. 93 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3402802_en_BA p. 93 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3402802_en_BA p. 94 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3402802_en_BA p. 100 |
| Foot brake lever free travel | 3-5 mm | 25_3402802_en_BA p. 97 |
| Torque, push rod lock nut (foot brake) | 10 N·m | 25_3402802_en_BA p. 97 |
| Torque, foot brake lever stop nut | 20 N·m | 25_3402802_en_BA p. 97 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc250-2026-tx300-2026`

Bikes: Husqvarna TC 250 2026, Husqvarna TX 300 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 45 operating hours, at least every 24 months | 26_3402883_en_BA p. 37 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3402883_en_BA p. 37 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3402883_en_BA p. 90 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3402883_en_BA p. 90 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3402883_en_BA p. 90 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3402883_en_BA p. 93 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3402883_en_BA p. 93 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402883_en_BA p. 93 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3402883_en_BA p. 99 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3402883_en_BA p. 96 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 26_3402883_en_BA p. 97 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 26_3402883_en_BA p. 97 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-mc125-2025`

Bikes: GasGas MC 125 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3215219_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3215219_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm | 25_3215219_en_BA p. 79 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm | 25_3215219_en_BA p. 79 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3215219_en_BA p. 79 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3215219_en_BA p. 81 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3215219_en_BA p. 81 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3215219_en_BA p. 82 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3215219_en_BA p. 87 |
| Foot brake lever free travel | 3-5 mm | 25_3215219_en_BA p. 85 |
| Torque, push rod lock nut (foot brake) | 20 N·m | 25_3215219_en_BA p. 85 |
| Torque, foot brake lever stop nut | 10 N·m | 25_3215219_en_BA p. 85 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-mc125-2026`

Bikes: GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3215266_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3215266_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3215266_en_BA p. 80 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 26_3215266_en_BA p. 81 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3215266_en_BA p. 81 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3215266_en_BA p. 83 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3215266_en_BA p. 83 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3215266_en_BA p. 83 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3215266_en_BA p. 88 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3215266_en_BA p. 86 |
| Torque, push rod lock nut (foot brake) | 20 N·m (14.8 lbf·ft) | 26_3215266_en_BA p. 86 |
| Torque, foot brake lever stop nut | 10 N·m (7.4 lbf·ft) | 26_3215266_en_BA p. 86 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-ex250-2025-ex300-2025-mc250-2025`

Bikes: GasGas MC 250 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3215220_en_BA p. 34 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3215220_en_BA p. 34 |
| Hand brake lever free travel | at least 3 mm | 25_3215220_en_BA p. 85 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm | 25_3215220_en_BA p. 85 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3215220_en_BA p. 85 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3215220_en_BA p. 87 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3215220_en_BA p. 87 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3215220_en_BA p. 88 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3215220_en_BA p. 93 |
| Foot brake lever free travel | 3-5 mm | 25_3215220_en_BA p. 91 |
| Torque, push rod lock nut (foot brake) | 10 N·m | 25_3215220_en_BA p. 91 |
| Torque, foot brake lever stop nut | 20 N·m | 25_3215220_en_BA p. 91 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 20 operating hours and after every race | 20_3213998_en_OM p. 31 |
| Brake fluid change interval | at least every 12 months | 20_3213998_en_OM p. 32 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 20_3213998_en_OM p. 72 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3213998_en_OM p. 73 |
| Rear brake disc wear limit (minimum thickness) | 3.7 mm (0.146 in) | 20_3213998_en_OM p. 73 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3213998_en_OM p. 80 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3213998_en_OM p. 75 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3213998_en_OM p. 78 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3213998_en_OM p. 78 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3213998_en_OM p. 78 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2021-2023-85sx1916-2021-2023`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first 10 operating hours, then every 20 operating hours and after every race | 21_3214206_en_OM p. 31; 22_3214408_en_OM p. 31; 23_3214636_en_OM p. 31 |
| Brake fluid change interval | at least every 12 months | 21_3214206_en_OM p. 32; 22_3214408_en_OM p. 32; 23_3214636_en_OM p. 32 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 21_3214206_en_OM p. 72; 22_3214408_en_OM p. 72; 23_3214636_en_OM p. 72 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 21_3214206_en_OM p. 73; 22_3214408_en_OM p. 73; 23_3214636_en_OM p. 73 |
| Rear brake disc wear limit (minimum thickness) | 3.7 mm (0.146 in) | 21_3214206_en_OM p. 73; 22_3214408_en_OM p. 73; 23_3214636_en_OM p. 73 |
| Brake fluid type | DOT 4 / DOT 5.1 | 21_3214206_en_OM p. 80; 22_3214408_en_OM p. 80; 23_3214636_en_OM p. 80 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 21_3214206_en_OM p. 75; 22_3214408_en_OM p. 75; 23_3214636_en_OM p. 75 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 21_3214206_en_OM p. 78; 22_3214408_en_OM p. 78; 23_3214636_en_OM p. 78 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 21_3214206_en_OM p. 78; 22_3214408_en_OM p. 78; 23_3214636_en_OM p. 78 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 21_3214206_en_OM p. 78; 22_3214408_en_OM p. 78; 23_3214636_en_OM p. 78 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2024-85sx1916-2024`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 24_3214830_en_OM p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 24_3214830_en_OM p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 24_3214830_en_OM p. 72 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 24_3214830_en_OM p. 73 |
| Rear brake disc wear limit (minimum thickness) | 3.7 mm (0.146 in) | 24_3214830_en_OM p. 73 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 24_3214830_en_OM p. 74 |
| Brake fluid type | DOT 4 / DOT 5.1 | 24_3214830_en_OM p. 74 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 24_3214830_en_OM p. 78 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 24_3214830_en_OM p. 78 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 24_3214830_en_OM p. 78 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 25_3240038_en_BA p. 31 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 25_3240038_en_BA p. 31 |
| Hand brake lever free travel | at least 3 mm | 25_3240038_en_BA p. 77 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm | 25_3240038_en_BA p. 78 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm | 25_3240038_en_BA p. 78 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 25_3240038_en_BA p. 79 |
| Brake fluid type | DOT 4 / DOT 5.1 | 25_3240038_en_BA p. 79 |
| Front brake pad minimum lining thickness | at least 1 mm | 25_3240038_en_BA p. 80 |
| Rear brake pad minimum lining thickness | at least 1 mm | 25_3240038_en_BA p. 85 |
| Foot brake lever free travel | 3-5 mm | 25_3240038_en_BA p. 82 |
| Torque, push rod lock nut (foot brake) | 10 N·m | 25_3240038_en_BA p. 83 |
| Torque, foot brake lever stop nut | 20 N·m | 25_3240038_en_BA p. 83 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2026-85sx1916-2026`

Bikes: KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 26_3240229_en_BA p. 30 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 26_3240229_en_BA p. 30 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 26_3240229_en_BA p. 76 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3240229_en_BA p. 76 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 26_3240229_en_BA p. 76 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 26_3240229_en_BA p. 78 |
| Brake fluid type | DOT 4 / DOT 5.1 | 26_3240229_en_BA p. 78 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240229_en_BA p. 79 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 26_3240229_en_BA p. 84 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 26_3240229_en_BA p. 81 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 26_3240229_en_BA p. 82 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 26_3240229_en_BA p. 82 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-85sx1714-2027-85sx1916-2027`

Bikes: KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | once after the first operating hour, then every 15 operating hours, at least every 24 months | 27_3240375_en_BA p. 32 |
| Brake fluid change interval | every 90 operating hours, at least every 24 months | 27_3240375_en_BA p. 32 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 27_3240375_en_BA p. 78 |
| Front brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 27_3240375_en_BA p. 78 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 27_3240375_en_BA p. 78 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm | 27_3240375_en_BA p. 80 |
| Brake fluid type | DOT 5.1 | 27_3240375_en_BA p. 80 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240375_en_BA p. 81 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 27_3240375_en_BA p. 86 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 27_3240375_en_BA p. 83 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 27_3240375_en_BA p. 84 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 27_3240375_en_BA p. 84 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-ex250-2022-2023-ex300-2021-2023-250xc-2020-2022-300xc-2020-2022`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours | 20_3214002_en_OM p. 33; 21_3214211_en_OM p. 33; 22_3214413_en_OM p. 33; 21_3215018_en_OM p. 30; 22_3215052_en_OM p. 30; 23_3215096_en_OM p. 30 |
| Brake fluid change interval | at least every 12 months | 20_3214002_en_OM p. 34; 21_3214211_en_OM p. 34; 22_3214413_en_OM p. 34; 21_3215018_en_OM p. 31; 22_3215052_en_OM p. 31; 23_3215096_en_OM p. 31 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 20_3214002_en_OM p. 78; 21_3214211_en_OM p. 79; 22_3214413_en_OM p. 79; 21_3215018_en_OM p. 73; 22_3215052_en_OM p. 73; 23_3215096_en_OM p. 73 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3214002_en_OM p. 79; 21_3214211_en_OM p. 80; 22_3214413_en_OM p. 80; 21_3215018_en_OM p. 73; 22_3215052_en_OM p. 73; 23_3215096_en_OM p. 73 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3214002_en_OM p. 79; 21_3214211_en_OM p. 80; 22_3214413_en_OM p. 80; 21_3215018_en_OM p. 73; 22_3215052_en_OM p. 73; 23_3215096_en_OM p. 73 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3214002_en_OM p. 81; 21_3214211_en_OM p. 82; 22_3214413_en_OM p. 82; 21_3215018_en_OM p. 75; 22_3215052_en_OM p. 75; 23_3215096_en_OM p. 75 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3214002_en_OM p. 81; 21_3214211_en_OM p. 82; 22_3214413_en_OM p. 82; 21_3215018_en_OM p. 75; 22_3215052_en_OM p. 75; 23_3215096_en_OM p. 75 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214002_en_OM p. 81; 21_3214211_en_OM p. 82; 22_3214413_en_OM p. 82; 21_3215018_en_OM p. 76; 22_3215052_en_OM p. 76; 23_3215096_en_OM p. 76 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3214002_en_OM p. 87; 21_3214211_en_OM p. 88; 22_3214413_en_OM p. 88; 21_3215018_en_OM p. 81; 22_3215052_en_OM p. 81; 23_3215096_en_OM p. 81 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3214002_en_OM p. 84; 21_3214211_en_OM p. 85; 22_3214413_en_OM p. 85; 21_3215018_en_OM p. 78; 22_3215052_en_OM p. 78; 23_3215096_en_OM p. 79 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3214002_en_OM p. 85; 21_3214211_en_OM p. 86; 22_3214413_en_OM p. 86; 21_3215018_en_OM p. 79; 22_3215052_en_OM p. 79; 23_3215096_en_OM p. 79 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3214002_en_OM p. 85; 21_3214211_en_OM p. 86; 22_3214413_en_OM p. 86; 21_3215018_en_OM p. 79; 22_3215052_en_OM p. 79; 23_3215096_en_OM p. 79 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tc125-2020`

Bikes: Husqvarna TC 125 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours and after every race | 20_3402332_en_OM p. 32 |
| Brake fluid change interval | every 10 operating hours | 20_3402332_en_OM p. 33 |
| Hand brake lever free travel | at least 3 mm (0.12 in) | 20_3402332_en_OM p. 77 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3402332_en_OM p. 78 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3402332_en_OM p. 78 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3402332_en_OM p. 80 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3402332_en_OM p. 80 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402332_en_OM p. 80 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402332_en_OM p. 85 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3402332_en_OM p. 83 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3402332_en_OM p. 83 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3402332_en_OM p. 83 |

### Check the brakes: lever travel, discs, pads and fluid

`bak-ktmg2t-brakes-v1-tx300-2020-2022`

Bikes: Husqvarna TX 300 2020, Husqvarna TX 300 2021, Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Front brake pad check interval | every 10 operating hours | 20_3402334_en_OM p. 34; 21_3402441_en_OM p. 34; 22_3402531_en_OM p. 35 |
| Brake fluid change interval | at least every 12 months | 20_3402334_en_OM p. 35; 21_3402441_en_OM p. 35; 22_3402531_en_OM p. 36 |
| Front brake disc wear limit (minimum thickness) | 2.5 mm (0.098 in) | 20_3402334_en_OM p. 80; 21_3402441_en_OM p. 80; 22_3402531_en_OM p. 81 |
| Rear brake disc wear limit (minimum thickness) | 3.5 mm (0.138 in) | 20_3402334_en_OM p. 80; 21_3402441_en_OM p. 80; 22_3402531_en_OM p. 81 |
| Front brake fluid level below the reservoir rim when topping up | 5 mm (0.2 in) | 20_3402334_en_OM p. 82; 21_3402441_en_OM p. 82; 22_3402531_en_OM p. 83 |
| Brake fluid type | DOT 4 / DOT 5.1 | 20_3402334_en_OM p. 82; 21_3402441_en_OM p. 82; 22_3402531_en_OM p. 83 |
| Front brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402334_en_OM p. 83; 21_3402441_en_OM p. 83; 22_3402531_en_OM p. 84 |
| Rear brake pad minimum lining thickness | at least 1 mm (0.04 in) | 20_3402334_en_OM p. 88; 21_3402441_en_OM p. 88; 22_3402531_en_OM p. 89 |
| Foot brake lever free travel | 3-5 mm (0.12-0.2 in) | 20_3402334_en_OM p. 85; 21_3402441_en_OM p. 85; 22_3402531_en_OM p. 86 |
| Torque, push rod lock nut (foot brake) | 10 N·m (7.4 lbf·ft) | 20_3402334_en_OM p. 86; 21_3402441_en_OM p. 86; 22_3402531_en_OM p. 87 |
| Torque, foot brake lever stop nut | 20 N·m (14.8 lbf·ft) | 20_3402334_en_OM p. 86; 21_3402441_en_OM p. 86; 22_3402531_en_OM p. 87 |

### Release built-up air from the fork and clean the dust boots

`bak-ktmg2t-fork-bleed-v1-ex250-2022-2024-and-more-bbfb1b3e`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 250 SX 2020, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, Husqvarna TC 125 2023, Husqvarna TC 125 2024, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, GasGas MC 125 2023, GasGas MC 125 2024, GasGas MC 250 2023, GasGas MC 250 2024, GasGas EX 300 2024, KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020, KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023, KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024, KTM 250 SX 2021, KTM 250 SX 2022, KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, Husqvarna TC 125 2020, Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022, Husqvarna TX 300 2020, Husqvarna TX 300 2021, Husqvarna TX 300 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fork bleeder screw(s): released, then tightened | both fork legs | 20_3214000_en_OM p. 46; 21_3214209_en_OM p. 50; 22_3214411_en_OM p. 49; 23_3214638_en_OM p. 49; 24_3214832_en_OM p. 50; 25_3240041_en_OM p. 50; 20_3214001_en_OM p. 45; 23_3214639_en_OM p. 48; 24_3214833_en_OM p. 49; 25_3240042_en_OM p. 49; 23_3402629_en_OM p. 46; 24_3402711_en_OM p. 46; 23_3402630_en_OM p. 49; 24_3402712_en_OM p. 49; 23_3215094_en_OM p. 43; 24_3215157_en_OM p. 44; 23_3215095_en_OM p. 43; 24_3215158_en_OM p. 46; 20_3213998_en_OM p. 44; 21_3214206_en_OM p. 44; 22_3214408_en_OM p. 44; 23_3214636_en_OM p. 44; 24_3214830_en_OM p. 44; 21_3214210_en_OM p. 45; 22_3214412_en_OM p. 45; 20_3214002_en_OM p. 48; 21_3214211_en_OM p. 48; 22_3214413_en_OM p. 48; 20_3402332_en_OM p. 46; 21_3402439_en_OM p. 46; 22_3402529_en_OM p. 47; 20_3402333_en_OM p. 46; 21_3402440_en_OM p. 46; 22_3402530_en_OM p. 47; 20_3402334_en_OM p. 49; 21_3402441_en_OM p. 49; 22_3402531_en_OM p. 50; 21_3215008_en_OM p. 42; 22_3215051_en_OM p. 42; 22_3215074_en_OM p. 42; 21_3215018_en_OM p. 44; 22_3215052_en_OM p. 44; 23_3215096_en_OM p. 44 |
| Dust boot cleaning: boots pushed down, cleaned and oiled, pressed back | yes | 20_3214000_en_OM p. 46; 21_3214209_en_OM p. 50; 22_3214411_en_OM p. 49; 23_3214638_en_OM p. 49; 24_3214832_en_OM p. 50; 25_3240041_en_OM p. 50; 20_3214001_en_OM p. 45; 23_3214639_en_OM p. 48; 24_3214833_en_OM p. 49; 25_3240042_en_OM p. 49; 23_3402629_en_OM p. 46; 24_3402711_en_OM p. 46; 23_3402630_en_OM p. 49; 24_3402712_en_OM p. 49; 23_3215094_en_OM p. 43; 24_3215157_en_OM p. 44; 23_3215095_en_OM p. 43; 24_3215158_en_OM p. 46; 20_3213998_en_OM p. 45; 21_3214206_en_OM p. 45; 22_3214408_en_OM p. 45; 23_3214636_en_OM p. 45; 24_3214830_en_OM p. 45; 21_3214210_en_OM p. 45; 22_3214412_en_OM p. 45; 20_3214002_en_OM p. 48; 21_3214211_en_OM p. 48; 22_3214413_en_OM p. 48; 20_3402332_en_OM p. 46; 21_3402439_en_OM p. 46; 22_3402529_en_OM p. 47; 20_3402333_en_OM p. 46; 21_3402440_en_OM p. 46; 22_3402530_en_OM p. 47; 20_3402334_en_OM p. 49; 21_3402441_en_OM p. 49; 22_3402531_en_OM p. 50; 21_3215008_en_OM p. 43; 22_3215051_en_OM p. 43; 22_3215074_en_OM p. 43; 21_3215018_en_OM p. 44; 22_3215052_en_OM p. 44; 23_3215096_en_OM p. 44 |

### Release built-up air from the fork and clean the dust boots

`bak-ktmg2t-fork-bleed-v1-ex250-2025-and-more-3eeda695`

Bikes: KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 125 2025, Husqvarna TC 125 2026, Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027, GasGas MC 125 2025, GasGas MC 125 2026, GasGas MC 250 2025, GasGas EX 300 2025, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027, KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025, KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027, Husqvarna TC 150 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fork bleeder screw(s): released, then tightened | one bleeder screw | 26_3240232_en_BA p. 57; 27_3240379_en_BA p. 56; 26_3240233_en_BA p. 57; 27_3240380_en_BA p. 57; 25_3402801_en_BA p. 46; 26_3402882_en_BA p. 51; 25_3402802_en_BA p. 55; 26_3402883_en_BA p. 55; 27_3402944_en_BA p. 59; 25_3215219_en_BA p. 46; 26_3215266_en_BA p. 47; 25_3215220_en_BA p. 51; 26_3215267_en_BA p. 53; 27_3215289_en_BA p. 45; 25_3240038_en_BA p. 45; 26_3240229_en_BA p. 44; 27_3240375_en_BA p. 46 |
| Dust boot cleaning: boots pushed down, cleaned and oiled, pressed back | yes | 26_3240232_en_BA p. 57; 27_3240379_en_BA p. 56; 26_3240233_en_BA p. 57; 27_3240380_en_BA p. 57; 25_3402801_en_BA p. 46; 26_3402882_en_BA p. 51; 25_3402802_en_BA p. 55; 26_3402883_en_BA p. 55; 27_3402944_en_BA p. 59; 25_3215219_en_BA p. 46; 26_3215266_en_BA p. 47; 25_3215220_en_BA p. 51; 26_3215267_en_BA p. 53; 27_3215289_en_BA p. 45; 25_3240038_en_BA p. 45; 26_3240229_en_BA p. 44; 27_3240375_en_BA p. 46 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-125sx-2020-150sx-2020`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214000_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8.2 125/150 SX US] | 15 | 20_3214000_en_OM p. 125 |
| Shock high-speed compression, standard (turns out from fully in) [20.8.2 125/150 SX US] | 2 | 20_3214000_en_OM p. 125 |
| Shock rebound, standard (clicks out from fully in) [20.8.2 125/150 SX US] | 15 | 20_3214000_en_OM p. 125 |
| Shock spring preload [20.8.2 125/150 SX US] | 6 mm (0.24 in) | 20_3214000_en_OM p. 125 |
| Static sag [20.8.2 125/150 SX US] | 35 mm (1.38 in) | 20_3214000_en_OM p. 125 |
| Rider sag [20.8.2 125/150 SX US] | 105 mm (4.13 in) | 20_3214000_en_OM p. 125 |
| Fork compression, standard (clicks out from fully in) [20.7.2 125/150 SX US] | 12 | 20_3214000_en_OM p. 124 |
| Fork rebound, standard (clicks out from fully in) [20.7.2 125/150 SX US] | 12 | 20_3214000_en_OM p. 124 |
| Fork air pressure [20.7.2 125/150 SX US] | 8.4 bar (122 psi) | 20_3214000_en_OM p. 124 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 20_3214000_en_OM p. 125 |
| Fork air pressure as printed in the adjustment instructions (differs from the fork data table) | 8.3 bar (120 psi) | 20_3214000_en_OM p. 40 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214000_en_OM p. 40 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214000_en_OM p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214000_en_OM p. 40 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc125-2021-2023-tc125-2020-125sx-2021-2022-150sx-2021-2022`

Bikes: KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 SX 2022, KTM 150 SX 2022, GasGas MC 125 2023, Husqvarna TC 125 2020, GasGas MC 125 2021, GasGas MC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214209_en_OM p. 38; 22_3214411_en_OM p. 37; 23_3215094_en_OM p. 32; 20_3402332_en_OM p. 34; 21_3215008_en_OM p. 32; 22_3215051_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [21.9.1 All SX models] | 15 | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [21.9.1 All SX models] | 1.5 | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [21.9.1 All SX models] | 15 | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Shock spring preload [21.9.1 All SX models] | 7 mm (0.28 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Static sag [21.9.1 All SX models] | 35 mm (1.38 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Rider sag [21.9.1 All SX models] | 105 mm (4.13 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [21.8.1 All SX models] | 12 | 21_3214209_en_OM p. 136; 22_3214411_en_OM p. 135 |
| Fork rebound, standard (clicks out from fully in) [21.8.1 All SX models] | 12 | 21_3214209_en_OM p. 136; 22_3214411_en_OM p. 135 |
| Fork air pressure [21.8.1 All SX models] | 8.3 bar (120 psi) | 21_3214209_en_OM p. 136; 22_3214411_en_OM p. 135 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137; 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44; 23_3215094_en_OM p. 39; 20_3402332_en_OM p. 41; 21_3215008_en_OM p. 39; 22_3215051_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44; 23_3215094_en_OM p. 39; 20_3402332_en_OM p. 41; 21_3215008_en_OM p. 39; 22_3215051_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44; 23_3215094_en_OM p. 39; 20_3402332_en_OM p. 41; 21_3215008_en_OM p. 39; 22_3215051_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44; 23_3215094_en_OM p. 38; 20_3402332_en_OM p. 41; 21_3215008_en_OM p. 38; 22_3215051_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 1.5 | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 23_3215094_en_OM p. 118; 20_3402332_en_OM p. 122; 21_3215008_en_OM p. 117; 22_3215051_en_OM p. 117 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 23_3215094_en_OM p. 117; 20_3402332_en_OM p. 121; 21_3215008_en_OM p. 116; 22_3215051_en_OM p. 116 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 23_3215094_en_OM p. 117; 20_3402332_en_OM p. 121; 21_3215008_en_OM p. 116; 22_3215051_en_OM p. 116 |
| Fork air pressure [20.7 Fork] | 8.3 bar (120 psi) | 23_3215094_en_OM p. 117; 20_3402332_en_OM p. 121; 21_3215008_en_OM p. 116; 22_3215051_en_OM p. 116 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-125xc-2021-2022`

Bikes: KTM 125 XC 2021, KTM 125 XC 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214209_en_OM p. 38; 22_3214411_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [21.9.2 125 XC US] | 15 | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [21.9.2 125 XC US] | 2 | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Shock rebound, standard (clicks out from fully in) [21.9.2 125 XC US] | 15 | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Shock spring preload [21.9.2 125 XC US] | 7 mm (0.28 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Static sag [21.9.2 125 XC US] | 35 mm (1.38 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Rider sag [21.9.2 125 XC US] | 105 mm (4.13 in) | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [21.8.2 125 XC US] | 12 | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Fork rebound, standard (clicks out from fully in) [21.8.2 125 XC US] | 25 | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Fork air pressure [21.8.2 125 XC US] | 8 bar (116 psi) | 21_3214209_en_OM p. 137; 22_3214411_en_OM p. 136 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 21_3214209_en_OM p. 138; 22_3214411_en_OM p. 137 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214209_en_OM p. 45; 22_3214411_en_OM p. 44 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-125xc-2023`

Bikes: KTM 125 XC 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214638_en_OM p. 36 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 125 XC US] | 15 | 23_3214638_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 125 XC US] | 1.5 | 23_3214638_en_OM p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 125 XC US] | 15 | 23_3214638_en_OM p. 134 |
| Shock spring preload [23.8.2 125 XC US] | 8 mm (0.31 in) | 23_3214638_en_OM p. 134 |
| Static sag [23.8.2 125 XC US] | 35 mm (1.38 in) | 23_3214638_en_OM p. 134 |
| Rider sag [23.8.2 125 XC US] | 105 mm (4.13 in) | 23_3214638_en_OM p. 134 |
| Fork compression, standard (clicks out from fully in) [23.7.2 125 XC US] | 12 | 23_3214638_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 125 XC US] | 18 | 23_3214638_en_OM p. 133 |
| Fork air pressure [23.7.2 125 XC US] | 8.4 bar (122 psi) | 23_3214638_en_OM p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3214638_en_OM p. 134 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214638_en_OM p. 43 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214638_en_OM p. 43 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214638_en_OM p. 43 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214638_en_OM p. 43 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-125xc-2024-2025`

Bikes: KTM 125 XC 2024, KTM 125 XC 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214832_en_OM p. 36; 25_3240041_en_OM p. 36 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 XC] | 15 | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 XC] | 1.5 | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 XC] | 15 | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Shock spring preload [23.8.2 XC] | 8 mm (0.31 in) | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Static sag [23.8.2 XC] | 35 mm (1.38 in) | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Rider sag [23.8.2 XC] | 105 mm (4.13 in) | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [23.7.2 XC] | 12 | 24_3214832_en_OM p. 135; 25_3240041_en_OM p. 136 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 XC] | 18 | 24_3214832_en_OM p. 135; 25_3240041_en_OM p. 136 |
| Fork air pressure [23.7.2 XC] | 5 bar (73 psi) | 24_3214832_en_OM p. 135; 25_3240041_en_OM p. 136 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 24_3214832_en_OM p. 136; 25_3240041_en_OM p. 137 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc125-2026-125sx-2026-2027`

Bikes: KTM 125 SX 2026, KTM 125 SX 2027, GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240232_en_BA p. 42; 27_3240379_en_BA p. 41; 26_3215266_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 15 | 26_3240232_en_BA p. 149 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 1.5 | 26_3240232_en_BA p. 149 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 15 | 26_3240232_en_BA p. 149 |
| Shock spring preload [23.5.1 Technical data - shock absorber (All SX models)] | 8 mm (0.31 in) | 26_3240232_en_BA p. 149 |
| Static sag [23.5.1 Technical data - shock absorber (All SX models)] | 35 mm (1.38 in) | 26_3240232_en_BA p. 149 |
| Rider sag [23.5.1 Technical data - shock absorber (All SX models)] | 105 mm (4.13 in) | 26_3240232_en_BA p. 149 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork (All SX models)] | 12 | 26_3240232_en_BA p. 147 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork (All SX models)] | 12 | 26_3240232_en_BA p. 147 |
| Fork air pressure by rider weight | 65-75 kg: 8.4 bar (121.8 psi), 75-85 kg: 8.6 bar (124.7 psi), 85-95 kg: 8.8 bar (127.6 psi) | 26_3240232_en_BA p. 147; 27_3240379_en_BA p. 147; 26_3215266_en_BA p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 26_3240232_en_BA p. 149; 27_3240379_en_BA p. 149; 26_3215266_en_BA p. 134 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3240232_en_BA p. 50; 27_3240379_en_BA p. 49; 26_3215266_en_BA p. 41 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3240232_en_BA p. 51; 27_3240379_en_BA p. 50; 26_3215266_en_BA p. 41 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240232_en_BA p. 50; 27_3240379_en_BA p. 49; 26_3215266_en_BA p. 41 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240232_en_BA p. 50; 27_3240379_en_BA p. 49; 26_3215266_en_BA p. 41 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (SX)] | 15 | 27_3240379_en_BA p. 149 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber (SX)] | 1.5 | 27_3240379_en_BA p. 149 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (SX)] | 15 | 27_3240379_en_BA p. 149 |
| Shock spring preload [23.5.1 Technical data - shock absorber (SX)] | 8 mm (0.31 in) | 27_3240379_en_BA p. 149 |
| Static sag [23.5.1 Technical data - shock absorber (SX)] | 35 mm (1.38 in) | 27_3240379_en_BA p. 149 |
| Rider sag [23.5.1 Technical data - shock absorber (SX)] | 105 mm (4.13 in) | 27_3240379_en_BA p. 149 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork (SX)] | 12 | 27_3240379_en_BA p. 147 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork (SX)] | 12 | 27_3240379_en_BA p. 147 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 26_3215266_en_BA p. 133 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber] | 1.5 | 26_3215266_en_BA p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 26_3215266_en_BA p. 134 |
| Shock spring preload [23.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 26_3215266_en_BA p. 134 |
| Static sag [23.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 26_3215266_en_BA p. 134 |
| Rider sag [23.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 26_3215266_en_BA p. 134 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 26_3215266_en_BA p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 26_3215266_en_BA p. 133 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-125xc-2027`

Bikes: KTM 125 XC 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 27_3240379_en_BA p. 41 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.2 Technical data - shock absorber (XC)] | 15 | 27_3240379_en_BA p. 149 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.2 Technical data - shock absorber (XC)] | 1.5 | 27_3240379_en_BA p. 150 |
| Shock rebound, standard (clicks out from fully in) [23.5.2 Technical data - shock absorber (XC)] | 15 | 27_3240379_en_BA p. 150 |
| Shock spring preload [23.5.2 Technical data - shock absorber (XC)] | 8 mm (0.31 in) | 27_3240379_en_BA p. 150 |
| Static sag [23.5.2 Technical data - shock absorber (XC)] | 35 mm (1.38 in) | 27_3240379_en_BA p. 150 |
| Rider sag [23.5.2 Technical data - shock absorber (XC)] | 105 mm (4.13 in) | 27_3240379_en_BA p. 150 |
| Fork compression, standard (clicks out from fully in) [23.4.3 Technical data - fork (XC)] | 12 | 27_3240379_en_BA p. 148 |
| Fork rebound, standard (clicks out from fully in) [23.4.3 Technical data - fork (XC)] | 18 | 27_3240379_en_BA p. 148 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 27_3240379_en_BA p. 150 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-250sx-2020`

Bikes: KTM 250 SX 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214001_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [20.9.2 250 SX US] | 15 | 20_3214001_en_OM p. 121 |
| Shock high-speed compression, standard (turns out from fully in) [20.9.2 250 SX US] | 2 | 20_3214001_en_OM p. 121 |
| Shock rebound, standard (clicks out from fully in) [20.9.2 250 SX US] | 15 | 20_3214001_en_OM p. 121 |
| Shock spring preload [20.9.2 250 SX US] | 7 mm (0.28 in) | 20_3214001_en_OM p. 121 |
| Static sag [20.9.2 250 SX US] | 35 mm (1.38 in) | 20_3214001_en_OM p. 121 |
| Rider sag [20.9.2 250 SX US] | 105 mm (4.13 in) | 20_3214001_en_OM p. 121 |
| Fork compression, standard (clicks out from fully in) [20.8.2 250 SX US] | 12 | 20_3214001_en_OM p. 120 |
| Fork rebound, standard (clicks out from fully in) [20.8.2 250 SX US] | 12 | 20_3214001_en_OM p. 120 |
| Fork air pressure [20.8.2 250 SX US] | 10.2 bar (148 psi) | 20_3214001_en_OM p. 120 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214001_en_OM p. 121 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214001_en_OM p. 40 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214001_en_OM p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214001_en_OM p. 40 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc250-2023-250sx-2023-300sx-2023`

Bikes: KTM 250 SX 2023, KTM 300 SX 2023, Husqvarna TC 250 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214639_en_OM p. 35; 23_3402630_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 23_3214639_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 All SX models] | 1.5 | 23_3214639_en_OM p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 23_3214639_en_OM p. 134 |
| Shock spring preload [23.8.1 All SX models] | 7 mm (0.28 in) | 23_3214639_en_OM p. 134 |
| Static sag [23.8.1 All SX models] | 35 mm (1.38 in) | 23_3214639_en_OM p. 134 |
| Rider sag [23.8.1 All SX models] | 105 mm (4.13 in) | 23_3214639_en_OM p. 134 |
| Fork compression, standard (clicks out from fully in) [23.7.1 All SX models] | 12 | 23_3214639_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 All SX models] | 18 | 23_3214639_en_OM p. 133 |
| Fork air pressure [23.7.1 All SX models] | 10.5 bar (152 psi) | 23_3214639_en_OM p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 23_3214639_en_OM p. 134; 23_3402630_en_OM p. 136 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214639_en_OM p. 42; 23_3402630_en_OM p. 43 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214639_en_OM p. 42; 23_3402630_en_OM p. 43 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214639_en_OM p. 42; 23_3402630_en_OM p. 43 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214639_en_OM p. 42; 23_3402630_en_OM p. 43 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 All TC models] | 15 | 23_3402630_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 All TC models] | 1.5 | 23_3402630_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 All TC models] | 15 | 23_3402630_en_OM p. 136 |
| Shock spring preload [23.8.1 All TC models] | 7 mm (0.28 in) | 23_3402630_en_OM p. 136 |
| Static sag [23.8.1 All TC models] | 35 mm (1.38 in) | 23_3402630_en_OM p. 136 |
| Rider sag [23.8.1 All TC models] | 105 mm (4.13 in) | 23_3402630_en_OM p. 136 |
| Fork compression, standard (clicks out from fully in) [23.7.1 All TC models] | 12 | 23_3402630_en_OM p. 135 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 All TC models] | 18 | 23_3402630_en_OM p. 135 |
| Fork air pressure [23.7.1 All TC models] | 10.5 bar (152 psi) | 23_3402630_en_OM p. 135 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tx300-2023-250xc-2023-300xc-2023`

Bikes: KTM 250 XC 2023, KTM 300 XC 2023, Husqvarna TX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3214639_en_OM p. 35; 23_3402630_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 23_3214639_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All XC models] | 1.5 | 23_3214639_en_OM p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 23_3214639_en_OM p. 134 |
| Shock spring preload [23.8.2 All XC models] | 8 mm (0.31 in) | 23_3214639_en_OM p. 134 |
| Static sag [23.8.2 All XC models] | 35 mm (1.38 in) | 23_3214639_en_OM p. 135 |
| Rider sag [23.8.2 All XC models] | 105 mm (4.13 in) | 23_3214639_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All XC models] | 12 | 23_3214639_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All XC models] | 18 | 23_3214639_en_OM p. 133 |
| Fork air pressure [23.7.2 All XC models] | 9.7 bar (141 psi) | 23_3214639_en_OM p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3214639_en_OM p. 135; 23_3402630_en_OM p. 137 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3214639_en_OM p. 43; 23_3402630_en_OM p. 43 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3214639_en_OM p. 43; 23_3402630_en_OM p. 43 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3214639_en_OM p. 43; 23_3402630_en_OM p. 43 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3214639_en_OM p. 42; 23_3402630_en_OM p. 43 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All TX models] | 15 | 23_3402630_en_OM p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All TX models] | 1.5 | 23_3402630_en_OM p. 136 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All TX models] | 15 | 23_3402630_en_OM p. 136 |
| Shock spring preload [23.8.2 All TX models] | 8 mm (0.31 in) | 23_3402630_en_OM p. 136 |
| Static sag [23.8.2 All TX models] | 35 mm (1.38 in) | 23_3402630_en_OM p. 137 |
| Rider sag [23.8.2 All TX models] | 105 mm (4.13 in) | 23_3402630_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All TX models] | 12 | 23_3402630_en_OM p. 135 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All TX models] | 18 | 23_3402630_en_OM p. 135 |
| Fork air pressure [23.7.2 All TX models] | 9.7 bar (141 psi) | 23_3402630_en_OM p. 135 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc250-2024-tc250-2024-250sx-2024-300sx-2024`

Bikes: KTM 250 SX 2024, KTM 300 SX 2024, Husqvarna TC 250 2024, GasGas MC 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214833_en_OM p. 35; 24_3402712_en_OM p. 35; 24_3215158_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 24_3214833_en_OM p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 All SX models] | 1.5 | 24_3214833_en_OM p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 24_3214833_en_OM p. 135 |
| Shock spring preload [23.8.1 All SX models] | 8 mm (0.31 in) | 24_3214833_en_OM p. 135 |
| Static sag [23.8.1 All SX models] | 35 mm (1.38 in) | 24_3214833_en_OM p. 135 |
| Rider sag [23.8.1 All SX models] | 105 mm (4.13 in) | 24_3214833_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [23.7.1 All SX models] | 12 | 24_3214833_en_OM p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 All SX models] | 18 | 24_3214833_en_OM p. 134 |
| Fork air pressure [23.7.1 All SX models] | 10.5 bar (152 psi) | 24_3214833_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3214833_en_OM p. 135; 24_3402712_en_OM p. 137; 24_3215158_en_OM p. 127 |
| Fork air pressure, minimum | 7 bar (102 psi) | 24_3214833_en_OM p. 42; 24_3402712_en_OM p. 43; 24_3215158_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 24_3214833_en_OM p. 42; 24_3402712_en_OM p. 43; 24_3215158_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 24_3214833_en_OM p. 42; 24_3402712_en_OM p. 43; 24_3215158_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 24_3214833_en_OM p. 42; 24_3402712_en_OM p. 43; 24_3215158_en_OM p. 39 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 TC 250] | 15 | 24_3402712_en_OM p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 TC 250] | 1.5 | 24_3402712_en_OM p. 137 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 TC 250] | 15 | 24_3402712_en_OM p. 137 |
| Shock spring preload [23.8.1 TC 250] | 8 mm (0.31 in) | 24_3402712_en_OM p. 137 |
| Static sag [23.8.1 TC 250] | 35 mm (1.38 in) | 24_3402712_en_OM p. 137 |
| Rider sag [23.8.1 TC 250] | 105 mm (4.13 in) | 24_3402712_en_OM p. 137 |
| Fork compression, standard (clicks out from fully in) [23.7.1 TC 250] | 12 | 24_3402712_en_OM p. 136 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 TC 250] | 18 | 24_3402712_en_OM p. 136 |
| Fork air pressure [23.7.1 TC 250] | 10.5 bar (152 psi) | 24_3402712_en_OM p. 136 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 MC 250] | 15 | 24_3215158_en_OM p. 126 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 MC 250] | 1.5 | 24_3215158_en_OM p. 126 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 MC 250] | 15 | 24_3215158_en_OM p. 127 |
| Shock spring preload [23.8.1 MC 250] | 8 mm (0.31 in) | 24_3215158_en_OM p. 127 |
| Static sag [23.8.1 MC 250] | 35 mm (1.38 in) | 24_3215158_en_OM p. 127 |
| Rider sag [23.8.1 MC 250] | 105 mm (4.13 in) | 24_3215158_en_OM p. 127 |
| Fork compression, standard (clicks out from fully in) [23.7.1 MC 250] | 12 | 24_3215158_en_OM p. 125 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 MC 250] | 18 | 24_3215158_en_OM p. 125 |
| Fork air pressure [23.7.1 MC 250] | 10.5 bar (152 psi) | 24_3215158_en_OM p. 126 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-250xc-2024-2025-300xc-2025`

Bikes: KTM 250 XC 2024, KTM 250 XC 2025, KTM 300 XC 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214833_en_OM p. 35; 25_3240042_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All XC models] | 1.5 | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 135 |
| Shock spring preload [23.8.2 All XC models] | 8 mm (0.31 in) | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 135 |
| Static sag [23.8.2 All XC models] | 35 mm (1.38 in) | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 136 |
| Rider sag [23.8.2 All XC models] | 105 mm (4.13 in) | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 136 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All XC models] | 12 | 24_3214833_en_OM p. 134; 25_3240042_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All XC models] | 18 | 24_3214833_en_OM p. 134; 25_3240042_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3214833_en_OM p. 135; 25_3240042_en_OM p. 136 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tx300-2024-300xc-2024`

Bikes: KTM 300 XC 2024, Husqvarna TX 300 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3214833_en_OM p. 35; 24_3402712_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 24_3214833_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All XC models] | 1.5 | 24_3214833_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All XC models] | 15 | 24_3214833_en_OM p. 135 |
| Shock spring preload [23.8.2 All XC models] | 8 mm (0.31 in) | 24_3214833_en_OM p. 135 |
| Static sag [23.8.2 All XC models] | 35 mm (1.38 in) | 24_3214833_en_OM p. 135 |
| Rider sag [23.8.2 All XC models] | 100 mm (3.94 in) | 24_3214833_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All XC models] | 12 | 24_3214833_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All XC models] | 18 | 24_3214833_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3214833_en_OM p. 135; 24_3402712_en_OM p. 138 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 TX 300] | 15 | 24_3402712_en_OM p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 TX 300] | 1.5 | 24_3402712_en_OM p. 137 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 TX 300] | 15 | 24_3402712_en_OM p. 137 |
| Shock spring preload [23.8.2 TX 300] | 8 mm (0.31 in) | 24_3402712_en_OM p. 137 |
| Static sag [23.8.2 TX 300] | 35 mm (1.38 in) | 24_3402712_en_OM p. 138 |
| Rider sag [23.8.2 TX 300] | 100 mm (3.94 in) | 24_3402712_en_OM p. 138 |
| Fork compression, standard (clicks out from fully in) [23.7.2 TX 300] | 12 | 24_3402712_en_OM p. 136 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 TX 300] | 18 | 24_3402712_en_OM p. 136 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-250sx-2025-300sx-2025`

Bikes: KTM 250 SX 2025, KTM 300 SX 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 25_3240042_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 25_3240042_en_OM p. 135 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.1 All SX models] | 1.5 | 25_3240042_en_OM p. 135 |
| Shock rebound, standard (clicks out from fully in) [23.8.1 All SX models] | 15 | 25_3240042_en_OM p. 135 |
| Shock spring preload [23.8.1 All SX models] | 8 mm (0.31 in) | 25_3240042_en_OM p. 135 |
| Static sag [23.8.1 All SX models] | 35 mm (1.38 in) | 25_3240042_en_OM p. 135 |
| Rider sag [23.8.1 All SX models] | 105 mm (4.13 in) | 25_3240042_en_OM p. 135 |
| Fork compression, standard (clicks out from fully in) [23.7.1 All SX models] | 12 | 25_3240042_en_OM p. 134 |
| Fork rebound, standard (clicks out from fully in) [23.7.1 All SX models] | 18 | 25_3240042_en_OM p. 134 |
| Fork air pressure [23.7.1 All SX models] | 10.2 bar (148 psi) | 25_3240042_en_OM p. 134 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3240042_en_OM p. 135 |
| Fork air pressure, minimum | 7 bar (102 psi) | 25_3240042_en_OM p. 42 |
| Fork air pressure, maximum | 12 bar (174 psi) | 25_3240042_en_OM p. 42 |
| Fork air pressure change step | 0.2 bar (3 psi) | 25_3240042_en_OM p. 42 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3240042_en_OM p. 42 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-250sx-2026-300sx-2026`

Bikes: KTM 250 SX 2026, KTM 300 SX 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240233_en_BA p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 15 | 26_3240233_en_BA p. 149 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 1.5 | 26_3240233_en_BA p. 149 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber (All SX models)] | 15 | 26_3240233_en_BA p. 149 |
| Shock spring preload [23.5.1 Technical data - shock absorber (All SX models)] | 8 mm (0.31 in) | 26_3240233_en_BA p. 149 |
| Static sag [23.5.1 Technical data - shock absorber (All SX models)] | 35 mm (1.38 in) | 26_3240233_en_BA p. 150 |
| Rider sag [23.5.1 Technical data - shock absorber (All SX models)] | 105 mm (4.13 in) | 26_3240233_en_BA p. 150 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork (All SX models)] | 12 | 26_3240233_en_BA p. 147 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork (All SX models)] | 18 | 26_3240233_en_BA p. 147 |
| Fork air pressure by rider weight | 65-75 kg: 10 bar (145 psi), 75-85 kg: 10.2 bar (147.9 psi), 85-95 kg: 10.4 bar (150.8 psi) | 26_3240233_en_BA p. 148 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 26_3240233_en_BA p. 149 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3240233_en_BA p. 50 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3240233_en_BA p. 51 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240233_en_BA p. 50 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240233_en_BA p. 50 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-ex300-2026-2027-mc250-2026-tc250-2026-tx300-2026-2027-250xc-2026-2027-300xc-2026-2027`

Bikes: KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3240233_en_BA p. 42; 27_3240380_en_BA p. 42; 26_3402883_en_BA p. 40; 27_3402944_en_BA p. 43; 26_3215267_en_BA p. 38; 27_3215289_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.2 Technical data - shock absorber (All XC models)] | 15 | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.2 Technical data - shock absorber (All XC models)] | 1.5 | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Shock rebound, standard (clicks out from fully in) [23.5.2 Technical data - shock absorber (All XC models)] | 15 | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Shock spring preload [23.5.2 Technical data - shock absorber (All XC models)] | 8 mm (0.31 in) | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Static sag [23.5.2 Technical data - shock absorber (All XC models)] | 35 mm (1.38 in) | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Rider sag [23.5.2 Technical data - shock absorber (All XC models)] | 105 mm (4.13 in) | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150 |
| Fork compression, standard (clicks out from fully in) [23.4.3 Technical data - fork (All XC models)] | 12 | 26_3240233_en_BA p. 148; 27_3240380_en_BA p. 148 |
| Fork rebound, standard (clicks out from fully in) [23.4.3 Technical data - fork (All XC models)] | 18 | 26_3240233_en_BA p. 148; 27_3240380_en_BA p. 148 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 26_3240233_en_BA p. 150; 27_3240380_en_BA p. 150; 26_3402883_en_BA p. 145, 146; 27_3402944_en_BA p. 155; 26_3215267_en_BA p. 143; 27_3215289_en_BA p. 133 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (TC 250)] | 15 | 26_3402883_en_BA p. 145 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (TC 250)] | 1.5 | 26_3402883_en_BA p. 145 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (TC 250)] | 15 | 26_3402883_en_BA p. 145 |
| Shock spring preload [22.5.1 Technical data - shock absorber (TC 250)] | 8 mm (0.31 in) | 26_3402883_en_BA p. 145 |
| Static sag [22.5.1 Technical data - shock absorber (TC 250)] | 35 mm (1.38 in) | 26_3402883_en_BA p. 146 |
| Rider sag [22.5.1 Technical data - shock absorber (TC 250)] | 105 mm (4.13 in) | 26_3402883_en_BA p. 146 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (TC 250)] | 12 | 26_3402883_en_BA p. 143 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (TC 250)] | 18 | 26_3402883_en_BA p. 144 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (TX 300)] | 15 | 26_3402883_en_BA p. 146 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (TX 300)] | 1.5 | 26_3402883_en_BA p. 146 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (TX 300)] | 15 | 26_3402883_en_BA p. 146 |
| Shock spring preload [22.5.3 Technical data - shock absorber (TX 300)] | 8 mm (0.31 in) | 26_3402883_en_BA p. 146 |
| Static sag [22.5.3 Technical data - shock absorber (TX 300)] | 35 mm (1.38 in) | 26_3402883_en_BA p. 147 |
| Rider sag [22.5.3 Technical data - shock absorber (TX 300)] | 105 mm (4.13 in) | 26_3402883_en_BA p. 147 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (TX 300)] | 12 | 26_3402883_en_BA p. 144 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (TX 300)] | 18 | 26_3402883_en_BA p. 144 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (TX model)] | 15 | 27_3402944_en_BA p. 155 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (TX model)] | 1.5 | 27_3402944_en_BA p. 155 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (TX model)] | 15 | 27_3402944_en_BA p. 155 |
| Shock spring preload [22.5.3 Technical data - shock absorber (TX model)] | 8 mm (0.31 in) | 27_3402944_en_BA p. 155 |
| Static sag [22.5.3 Technical data - shock absorber (TX model)] | 35 mm (1.38 in) | 27_3402944_en_BA p. 156 |
| Rider sag [22.5.3 Technical data - shock absorber (TX model)] | 105 mm (4.13 in) | 27_3402944_en_BA p. 156 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (TX model)] | 12 | 27_3402944_en_BA p. 153 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (TX model)] | 18 | 27_3402944_en_BA p. 153 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (MC 250)] | 15 | 26_3215267_en_BA p. 142 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (MC 250)] | 1.5 | 26_3215267_en_BA p. 142 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (MC 250)] | 15 | 26_3215267_en_BA p. 142 |
| Shock spring preload [22.5.1 Technical data - shock absorber (MC 250)] | 8 mm (0.31 in) | 26_3215267_en_BA p. 142 |
| Static sag [22.5.1 Technical data - shock absorber (MC 250)] | 35 mm (1.38 in) | 26_3215267_en_BA p. 143 |
| Rider sag [22.5.1 Technical data - shock absorber (MC 250)] | 105 mm (4.13 in) | 26_3215267_en_BA p. 143 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (MC 250)] | 12 | 26_3215267_en_BA p. 141 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (MC 250)] | 18 | 26_3215267_en_BA p. 141 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (EX 300)] | 15 | 26_3215267_en_BA p. 143 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (EX 300)] | 1.5 | 26_3215267_en_BA p. 143 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (EX 300)] | 15 | 26_3215267_en_BA p. 143 |
| Shock spring preload [22.5.3 Technical data - shock absorber (EX 300)] | 8 mm (0.31 in) | 26_3215267_en_BA p. 143 |
| Static sag [22.5.3 Technical data - shock absorber (EX 300)] | 35 mm (1.38 in) | 26_3215267_en_BA p. 144 |
| Rider sag [22.5.3 Technical data - shock absorber (EX 300)] | 105 mm (4.13 in) | 26_3215267_en_BA p. 144 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (EX 300)] | 12 | 26_3215267_en_BA p. 141 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (EX 300)] | 18 | 26_3215267_en_BA p. 142 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 27_3215289_en_BA p. 133 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber] | 1.5 | 27_3215289_en_BA p. 133 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 27_3215289_en_BA p. 133 |
| Shock spring preload [23.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 27_3215289_en_BA p. 133 |
| Static sag [23.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 27_3215289_en_BA p. 134 |
| Rider sag [23.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 27_3215289_en_BA p. 134 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 27_3215289_en_BA p. 132 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 18 | 27_3215289_en_BA p. 132 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc125-2023`

Bikes: Husqvarna TC 125 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3402629_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8 Shock absorber] | 15 | 23_3402629_en_OM p. 131 |
| Shock high-speed compression, standard (turns out from fully in) [23.8 Shock absorber] | 1.5 | 23_3402629_en_OM p. 131 |
| Shock rebound, standard (clicks out from fully in) [23.8 Shock absorber] | 15 | 23_3402629_en_OM p. 131 |
| Shock spring preload [23.8 Shock absorber] | 7 mm (0.28 in) | 23_3402629_en_OM p. 131 |
| Static sag [23.8 Shock absorber] | 35 mm (1.38 in) | 23_3402629_en_OM p. 131 |
| Rider sag [23.8 Shock absorber] | 105 mm (4.13 in) | 23_3402629_en_OM p. 131 |
| Fork compression, standard (clicks out from fully in) [23.7 Fork] | 12 | 23_3402629_en_OM p. 130 |
| Fork rebound, standard (clicks out from fully in) [23.7 Fork] | 12 | 23_3402629_en_OM p. 130 |
| Fork air pressure [23.7 Fork] | 8.5 bar (123 psi) | 23_3402629_en_OM p. 130 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 23_3402629_en_OM p. 131 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3402629_en_OM p. 41 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3402629_en_OM p. 41 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3402629_en_OM p. 41 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3402629_en_OM p. 40 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc125-2024-tc125-2024`

Bikes: Husqvarna TC 125 2024, GasGas MC 125 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3402711_en_OM p. 33; 24_3215157_en_OM p. 31 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8 Shock absorber] | 15 | 24_3402711_en_OM p. 131 |
| Shock high-speed compression, standard (turns out from fully in) [23.8 Shock absorber] | 1.5 | 24_3402711_en_OM p. 131 |
| Shock rebound, standard (clicks out from fully in) [23.8 Shock absorber] | 15 | 24_3402711_en_OM p. 131 |
| Shock spring preload [23.8 Shock absorber] | 8 mm (0.31 in) | 24_3402711_en_OM p. 131 |
| Static sag [23.8 Shock absorber] | 35 mm (1.38 in) | 24_3402711_en_OM p. 131 |
| Rider sag [23.8 Shock absorber] | 105 mm (4.13 in) | 24_3402711_en_OM p. 131 |
| Fork compression, standard (clicks out from fully in) [23.7 Fork] | 12 | 24_3402711_en_OM p. 130 |
| Fork rebound, standard (clicks out from fully in) [23.7 Fork] | 12 | 24_3402711_en_OM p. 130 |
| Fork air pressure [23.7 Fork] | 8.3 bar (120 psi) | 24_3402711_en_OM p. 130 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 24_3402711_en_OM p. 131; 24_3215157_en_OM p. 125 |
| Fork air pressure, minimum | 7 bar (102 psi) | 24_3402711_en_OM p. 41; 24_3215157_en_OM p. 38 |
| Fork air pressure, maximum | 12 bar (174 psi) | 24_3402711_en_OM p. 41; 24_3215157_en_OM p. 38 |
| Fork air pressure change step | 0.2 bar (3 psi) | 24_3402711_en_OM p. 41; 24_3215157_en_OM p. 38 |
| Wait after switching off before checking fork air (minutes) | 5 | 24_3402711_en_OM p. 40; 24_3215157_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [23.7 Shock absorber] | 15 | 24_3215157_en_OM p. 124 |
| Shock high-speed compression, standard (turns out from fully in) [23.7 Shock absorber] | 1.5 | 24_3215157_en_OM p. 124 |
| Shock rebound, standard (clicks out from fully in) [23.7 Shock absorber] | 15 | 24_3215157_en_OM p. 124 |
| Shock spring preload [23.7 Shock absorber] | 8 mm (0.31 in) | 24_3215157_en_OM p. 125 |
| Static sag [23.7 Shock absorber] | 35 mm (1.38 in) | 24_3215157_en_OM p. 125 |
| Rider sag [23.7 Shock absorber] | 105 mm (4.13 in) | 24_3215157_en_OM p. 125 |
| Fork compression, standard (clicks out from fully in) [23.6 Fork] | 12 | 24_3215157_en_OM p. 124 |
| Fork rebound, standard (clicks out from fully in) [23.6 Fork] | 12 | 24_3215157_en_OM p. 124 |
| Fork air pressure [23.6 Fork] | 8.3 bar (120 psi) | 24_3215157_en_OM p. 124 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc125-2025-tc125-2025-tc150-2025`

Bikes: Husqvarna TC 125 2025, GasGas MC 125 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402801_en_BA p. 33; 25_3215219_en_BA p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 25_3402801_en_BA p. 134 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber] | 1.5 | 25_3402801_en_BA p. 134 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 25_3402801_en_BA p. 134 |
| Shock spring preload [23.5.1 Technical data - shock absorber] | 8 mm | 25_3402801_en_BA p. 134 |
| Static sag [23.5.1 Technical data - shock absorber] | 35 mm | 25_3402801_en_BA p. 134 |
| Rider sag [23.5.1 Technical data - shock absorber] | 105 mm | 25_3402801_en_BA p. 134 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 25_3402801_en_BA p. 133 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 25_3402801_en_BA p. 133 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 25_3402801_en_BA p. 134; 25_3215219_en_BA p. 129 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 8.6 bar | 25_3402801_en_BA p. 40; 25_3215219_en_BA p. 40 |
| Fork air pressure, minimum | 7 bar | 25_3402801_en_BA p. 40; 25_3215219_en_BA p. 40 |
| Fork air pressure, maximum | 12 bar | 25_3402801_en_BA p. 40; 25_3215219_en_BA p. 40 |
| Fork air pressure change step | 0.2 bar | 25_3402801_en_BA p. 40; 25_3215219_en_BA p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3402801_en_BA p. 40; 25_3215219_en_BA p. 40 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 25_3215219_en_BA p. 129 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber] | 1.5 | 25_3215219_en_BA p. 129 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber] | 15 | 25_3215219_en_BA p. 129 |
| Shock spring preload [22.5.1 Technical data - shock absorber] | 8 mm | 25_3215219_en_BA p. 129 |
| Static sag [22.5.1 Technical data - shock absorber] | 35 mm | 25_3215219_en_BA p. 129 |
| Rider sag [22.5.1 Technical data - shock absorber] | 105 mm | 25_3215219_en_BA p. 129 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 25_3215219_en_BA p. 128 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork] | 12 | 25_3215219_en_BA p. 128 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc125-2026`

Bikes: Husqvarna TC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165.3-187.4 lb) | 26_3402882_en_BA p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 26_3402882_en_BA p. 142 |
| Shock high-speed compression, standard (turns out from fully in) [23.5.1 Technical data - shock absorber] | 1.5 | 26_3402882_en_BA p. 142 |
| Shock rebound, standard (clicks out from fully in) [23.5.1 Technical data - shock absorber] | 15 | 26_3402882_en_BA p. 143 |
| Shock spring preload [23.5.1 Technical data - shock absorber] | 8 mm (0.31 in) | 26_3402882_en_BA p. 143 |
| Static sag [23.5.1 Technical data - shock absorber] | 35 mm (1.38 in) | 26_3402882_en_BA p. 143 |
| Rider sag [23.5.1 Technical data - shock absorber] | 105 mm (4.13 in) | 26_3402882_en_BA p. 143 |
| Fork compression, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 26_3402882_en_BA p. 142 |
| Fork rebound, standard (clicks out from fully in) [23.4.1 Technical data - fork] | 12 | 26_3402882_en_BA p. 142 |
| Fork air pressure [23.4.1 Technical data - fork] | 8.6 bar (124.7 psi) | 26_3402882_en_BA p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 26_3402882_en_BA p. 143 |
| Fork air pressure, minimum | 7 bar (102 psi) | 26_3402882_en_BA p. 45 |
| Fork air pressure, maximum | 12 bar (174 psi) | 26_3402882_en_BA p. 45 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3402882_en_BA p. 45 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3402882_en_BA p. 45 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc250-2025-tc250-2025-tc300-2025`

Bikes: Husqvarna TC 250 2025, Husqvarna TC 300 2025, GasGas MC 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402802_en_BA p. 41; 25_3215220_en_BA p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All TC models)] | 15 | 25_3402802_en_BA p. 143 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (All TC models)] | 1.5 | 25_3402802_en_BA p. 143 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All TC models)] | 15 | 25_3402802_en_BA p. 143 |
| Shock spring preload [22.5.1 Technical data - shock absorber (All TC models)] | 8 mm | 25_3402802_en_BA p. 143 |
| Static sag [22.5.1 Technical data - shock absorber (All TC models)] | 35 mm | 25_3402802_en_BA p. 143 |
| Rider sag [22.5.1 Technical data - shock absorber (All TC models)] | 105 mm | 25_3402802_en_BA p. 143 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (All TC models)] | 12 | 25_3402802_en_BA p. 142 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (All TC models)] | 18 | 25_3402802_en_BA p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3402802_en_BA p. 143; 25_3215220_en_BA p. 136 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 10.2 bar | 25_3402802_en_BA p. 48; 25_3215220_en_BA p. 44 |
| Fork air pressure, minimum | 7 bar | 25_3402802_en_BA p. 48; 25_3215220_en_BA p. 44 |
| Fork air pressure, maximum | 12 bar | 25_3402802_en_BA p. 48; 25_3215220_en_BA p. 44 |
| Fork air pressure change step | 0.2 bar | 25_3402802_en_BA p. 48; 25_3215220_en_BA p. 44 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3402802_en_BA p. 48; 25_3215220_en_BA p. 44 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All MC models)] | 15 | 25_3215220_en_BA p. 136 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.1 Technical data - shock absorber (All MC models)] | 1.5 | 25_3215220_en_BA p. 136 |
| Shock rebound, standard (clicks out from fully in) [22.5.1 Technical data - shock absorber (All MC models)] | 15 | 25_3215220_en_BA p. 136 |
| Shock spring preload [22.5.1 Technical data - shock absorber (All MC models)] | 8 mm | 25_3215220_en_BA p. 136 |
| Static sag [22.5.1 Technical data - shock absorber (All MC models)] | 35 mm | 25_3215220_en_BA p. 137 |
| Rider sag [22.5.1 Technical data - shock absorber (All MC models)] | 105 mm | 25_3215220_en_BA p. 137 |
| Fork compression, standard (clicks out from fully in) [22.4.1 Technical data - fork (All MC models)] | 12 | 25_3215220_en_BA p. 135 |
| Fork rebound, standard (clicks out from fully in) [22.4.1 Technical data - fork (All MC models)] | 18 | 25_3215220_en_BA p. 135 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-ex250-2025-ex300-2025-tx300-2025`

Bikes: Husqvarna TX 300 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg | 25_3402802_en_BA p. 41; 25_3215220_en_BA p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (All TX models)] | 15 | 25_3402802_en_BA p. 144 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (All TX models)] | 1.5 | 25_3402802_en_BA p. 144 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (All TX models)] | 15 | 25_3402802_en_BA p. 144 |
| Shock spring preload [22.5.3 Technical data - shock absorber (All TX models)] | 8 mm | 25_3402802_en_BA p. 144 |
| Static sag [22.5.3 Technical data - shock absorber (All TX models)] | 35 mm | 25_3402802_en_BA p. 144 |
| Rider sag [22.5.3 Technical data - shock absorber (All TX models)] | 100 mm | 25_3402802_en_BA p. 144 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (All TX models)] | 12 | 25_3402802_en_BA p. 142 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (All TX models)] | 18 | 25_3402802_en_BA p. 142 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 25_3402802_en_BA p. 144; 25_3215220_en_BA p. 137 |
| Shock low-speed compression, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (All EX models)] | 15 | 25_3215220_en_BA p. 137 |
| Shock high-speed compression, standard (turns out from fully in) [22.5.3 Technical data - shock absorber (All EX models)] | 1.5 | 25_3215220_en_BA p. 137 |
| Shock rebound, standard (clicks out from fully in) [22.5.3 Technical data - shock absorber (All EX models)] | 15 | 25_3215220_en_BA p. 137 |
| Shock spring preload [22.5.3 Technical data - shock absorber (All EX models)] | 8 mm | 25_3215220_en_BA p. 137 |
| Static sag [22.5.3 Technical data - shock absorber (All EX models)] | 35 mm | 25_3215220_en_BA p. 137 |
| Rider sag [22.5.3 Technical data - shock absorber (All EX models)] | 100 mm | 25_3215220_en_BA p. 137 |
| Fork compression, standard (clicks out from fully in) [22.4.3 Technical data - fork (All EX models)] | 12 | 25_3215220_en_BA p. 136 |
| Fork rebound, standard (clicks out from fully in) [22.4.3 Technical data - fork (All EX models)] | 18 | 25_3215220_en_BA p. 136 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc250-2023`

Bikes: GasGas MC 250 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 23_3215095_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 23_3215095_en_OM p. 118 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 1.5 | 23_3215095_en_OM p. 118 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 23_3215095_en_OM p. 118 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 23_3215095_en_OM p. 118 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 23_3215095_en_OM p. 118 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 23_3215095_en_OM p. 118 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 23_3215095_en_OM p. 117 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 18 | 23_3215095_en_OM p. 117 |
| Fork air pressure [20.7 Fork] | 10.4 bar (151 psi) | 23_3215095_en_OM p. 117 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 23_3215095_en_OM p. 118 |
| Fork air pressure, minimum | 7 bar (102 psi) | 23_3215095_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 23_3215095_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 23_3215095_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 23_3215095_en_OM p. 38 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-ex300-2024`

Bikes: GasGas EX 300 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3215158_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All EX models] | 15 | 24_3215158_en_OM p. 127 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All EX models] | 1.5 | 24_3215158_en_OM p. 127 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All EX models] | 15 | 24_3215158_en_OM p. 127 |
| Shock spring preload [23.8.2 All EX models] | 8 mm (0.31 in) | 24_3215158_en_OM p. 127 |
| Static sag [23.8.2 All EX models] | 35 mm (1.38 in) | 24_3215158_en_OM p. 127 |
| Rider sag [23.8.2 All EX models] | 100 mm (3.94 in) | 24_3215158_en_OM p. 127 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All EX models] | 12 | 24_3215158_en_OM p. 126 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All EX models] | 18 | 24_3215158_en_OM p. 126 |
| Fork spring rate by rider weight | 65-75 kg: 4.4 N/mm, 75-85 kg: 4.6 N/mm, 85-95 kg: 4.8 N/mm | 24_3215158_en_OM p. 126 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3215158_en_OM p. 127 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-85sx1714-2020-85sx1916-2020`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 45-55 kg (99-121 lb) | 20_3213998_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 20_3213998_en_OM p. 118 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 2 | 20_3213998_en_OM p. 118 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 20_3213998_en_OM p. 118 |
| Shock spring preload [20.8 Shock absorber] | 11 mm (0.43 in) | 20_3213998_en_OM p. 119 |
| Static sag [20.8 Shock absorber] | 30 mm (1.18 in) | 20_3213998_en_OM p. 119 |
| Rider sag [20.8 Shock absorber] | 120 mm (4.72 in) | 20_3213998_en_OM p. 119 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 20_3213998_en_OM p. 118 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 20_3213998_en_OM p. 118 |
| Shock spring rate by rider weight | 45-55 kg: 40 N/mm | 20_3213998_en_OM p. 119 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 5 bar (73 psi) | 20_3213998_en_OM p. 40 |
| Fork air pressure, minimum | 4 bar (58 psi) | 20_3213998_en_OM p. 40 |
| Fork air pressure, maximum | 8 bar (116 psi) | 20_3213998_en_OM p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3213998_en_OM p. 39 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-85sx1714-2021-2024-85sx1916-2021-2024`

Bikes: KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023, KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 45-55 kg (99-121 lb) | 21_3214206_en_OM p. 33; 22_3214408_en_OM p. 33; 23_3214636_en_OM p. 33; 24_3214830_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3214206_en_OM p. 119; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 2 | 21_3214206_en_OM p. 119; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3214206_en_OM p. 119; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Shock spring preload [20.8 Shock absorber] | 11 mm (0.43 in) | 21_3214206_en_OM p. 120; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Static sag [20.8 Shock absorber] | 30 mm (1.18 in) | 21_3214206_en_OM p. 120; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Rider sag [20.8 Shock absorber] | 120 mm (4.72 in) | 21_3214206_en_OM p. 120; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 21_3214206_en_OM p. 119; 22_3214408_en_OM p. 118; 23_3214636_en_OM p. 118; 24_3214830_en_OM p. 118 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 21_3214206_en_OM p. 119; 22_3214408_en_OM p. 118; 23_3214636_en_OM p. 118; 24_3214830_en_OM p. 118 |
| Shock spring rate by rider weight | 45-55 kg: 40 N/mm | 21_3214206_en_OM p. 120; 22_3214408_en_OM p. 119; 23_3214636_en_OM p. 119; 24_3214830_en_OM p. 119 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 5 bar (73 psi) | 21_3214206_en_OM p. 40 |
| Fork air pressure, minimum | 4 bar (58 psi) | 21_3214206_en_OM p. 40; 22_3214408_en_OM p. 40; 23_3214636_en_OM p. 40; 24_3214830_en_OM p. 40 |
| Fork air pressure, maximum | 8 bar (116 psi) | 21_3214206_en_OM p. 40; 22_3214408_en_OM p. 40; 23_3214636_en_OM p. 40; 24_3214830_en_OM p. 40 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214206_en_OM p. 40; 22_3214408_en_OM p. 40; 23_3214636_en_OM p. 40; 24_3214830_en_OM p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214206_en_OM p. 40; 22_3214408_en_OM p. 40; 23_3214636_en_OM p. 40; 24_3214830_en_OM p. 40 |
| Fork air pressure [20.7 Fork] | 5 bar (73 psi) | 22_3214408_en_OM p. 118; 23_3214636_en_OM p. 118; 24_3214830_en_OM p. 118 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 40-50 kg | 25_3240038_en_BA p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [20.5.1 Technical data - shock absorber] | 15 | 25_3240038_en_BA p. 125 |
| Shock high-speed compression, standard (turns out from fully in) [20.5.1 Technical data - shock absorber] | 1.5 | 25_3240038_en_BA p. 125 |
| Shock rebound, standard (clicks out from fully in) [20.5.1 Technical data - shock absorber] | 15 | 25_3240038_en_BA p. 125 |
| Shock spring preload [20.5.1 Technical data - shock absorber] | 10 mm | 25_3240038_en_BA p. 125 |
| Static sag [20.5.1 Technical data - shock absorber] | 30 mm | 25_3240038_en_BA p. 126 |
| Rider sag [20.5.1 Technical data - shock absorber] | 100 mm | 25_3240038_en_BA p. 126 |
| Fork compression, standard (clicks out from fully in) [20.4.1 Fork - technical data] | 12 | 25_3240038_en_BA p. 125 |
| Fork rebound, standard (clicks out from fully in) [20.4.1 Fork - technical data] | 12 | 25_3240038_en_BA p. 125 |
| Shock spring rate by rider weight | 40-50 kg: 45 N/mm | 25_3240038_en_BA p. 125 |
| Fork air pressure (adjustment instructions; not printed in the fork data table) | 4.8 bar | 25_3240038_en_BA p. 40 |
| Fork air pressure, minimum | 4 bar | 25_3240038_en_BA p. 40 |
| Fork air pressure, maximum | 8 bar | 25_3240038_en_BA p. 40 |
| Fork air pressure change step | 0.2 bar | 25_3240038_en_BA p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 25_3240038_en_BA p. 40 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-85sx1714-2026-2027-85sx1916-2026-2027`

Bikes: KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 40-50 kg (88.2-110.2 lb) | 26_3240229_en_BA p. 32; 27_3240375_en_BA p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [20.5.1 Technical data - shock absorber] | 15 | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Shock high-speed compression, standard (turns out from fully in) [20.5.1 Technical data - shock absorber] | 1.5 | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Shock rebound, standard (clicks out from fully in) [20.5.1 Technical data - shock absorber] | 15 | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Shock spring preload [20.5.1 Technical data - shock absorber] | 10 mm (0.39 in) | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Static sag [20.5.1 Technical data - shock absorber] | 30 mm (1.18 in) | 26_3240229_en_BA p. 126; 27_3240375_en_BA p. 128 |
| Rider sag [20.5.1 Technical data - shock absorber] | 100 mm (3.94 in) | 26_3240229_en_BA p. 126; 27_3240375_en_BA p. 128 |
| Fork compression, standard (clicks out from fully in) [20.4.1 Fork - technical data] | 12 | 26_3240229_en_BA p. 124; 27_3240375_en_BA p. 126 |
| Fork rebound, standard (clicks out from fully in) [20.4.1 Fork - technical data] | 12 | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Fork air pressure [20.4.1 Fork - technical data] | 4.8 bar (69.6 psi) | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Shock spring rate by rider weight | 40-50 kg: 45 N/mm | 26_3240229_en_BA p. 125; 27_3240375_en_BA p. 127 |
| Fork air pressure, minimum | 4 bar (58 psi) | 26_3240229_en_BA p. 39; 27_3240375_en_BA p. 42 |
| Fork air pressure, maximum | 8 bar (116 psi) | 26_3240229_en_BA p. 39; 27_3240375_en_BA p. 42 |
| Fork air pressure change step | 0.2 bar (2.9 psi) | 26_3240229_en_BA p. 39; 27_3240375_en_BA p. 42 |
| Wait after switching off before checking fork air (minutes) | 5 | 26_3240229_en_BA p. 39; 27_3240375_en_BA p. 41 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-mc250-2022-tc250-2021-250sx-2021`

Bikes: KTM 250 SX 2021, Husqvarna TC 250 2021, GasGas MC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214210_en_OM p. 33; 21_3402440_en_OM p. 34; 22_3215074_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [20.9 Shock absorber] | 15 | 21_3214210_en_OM p. 122 |
| Shock high-speed compression, standard (turns out from fully in) [20.9 Shock absorber] | 2 | 21_3214210_en_OM p. 122 |
| Shock rebound, standard (clicks out from fully in) [20.9 Shock absorber] | 15 | 21_3214210_en_OM p. 122 |
| Shock spring preload [20.9 Shock absorber] | 7 mm (0.28 in) | 21_3214210_en_OM p. 122 |
| Static sag [20.9 Shock absorber] | 35 mm (1.38 in) | 21_3214210_en_OM p. 122 |
| Rider sag [20.9 Shock absorber] | 105 mm (4.13 in) | 21_3214210_en_OM p. 122 |
| Fork compression, standard (clicks out from fully in) [20.8 Fork] | 12 | 21_3214210_en_OM p. 121 |
| Fork rebound, standard (clicks out from fully in) [20.8 Fork] | 18 | 21_3214210_en_OM p. 121 |
| Fork air pressure [20.8 Fork] | 10.4 bar (151 psi) | 21_3214210_en_OM p. 121 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3214210_en_OM p. 122; 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214210_en_OM p. 40; 21_3402440_en_OM p. 41; 22_3215074_en_OM p. 39 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214210_en_OM p. 40; 21_3402440_en_OM p. 41; 22_3215074_en_OM p. 39 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214210_en_OM p. 40; 21_3402440_en_OM p. 41; 22_3215074_en_OM p. 39 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214210_en_OM p. 40; 21_3402440_en_OM p. 41; 22_3215074_en_OM p. 38 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 2 | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 21_3402440_en_OM p. 124; 22_3215074_en_OM p. 117 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 21_3402440_en_OM p. 123; 22_3215074_en_OM p. 116 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 18 | 21_3402440_en_OM p. 123; 22_3215074_en_OM p. 116 |
| Fork air pressure [20.7 Fork] | 10.4 bar (151 psi) | 21_3402440_en_OM p. 123; 22_3215074_en_OM p. 116 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc250-2022-250sx-2022`

Bikes: KTM 250 SX 2022, Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 22_3214412_en_OM p. 33; 22_3402530_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [20.9 Shock absorber] | 15 | 22_3214412_en_OM p. 123 |
| Shock high-speed compression, standard (turns out from fully in) [20.9 Shock absorber] | 1.5 | 22_3214412_en_OM p. 123 |
| Shock rebound, standard (clicks out from fully in) [20.9 Shock absorber] | 15 | 22_3214412_en_OM p. 123 |
| Shock spring preload [20.9 Shock absorber] | 7 mm (0.28 in) | 22_3214412_en_OM p. 123 |
| Static sag [20.9 Shock absorber] | 35 mm (1.38 in) | 22_3214412_en_OM p. 123 |
| Rider sag [20.9 Shock absorber] | 105 mm (4.13 in) | 22_3214412_en_OM p. 123 |
| Fork compression, standard (clicks out from fully in) [20.8 Fork] | 12 | 22_3214412_en_OM p. 122 |
| Fork rebound, standard (clicks out from fully in) [20.8 Fork] | 12 | 22_3214412_en_OM p. 122 |
| Fork air pressure [20.8 Fork] | 10.1 bar (146 psi) | 22_3214412_en_OM p. 122 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 22_3214412_en_OM p. 123; 22_3402530_en_OM p. 126 |
| Fork air pressure, minimum | 7 bar (102 psi) | 22_3214412_en_OM p. 40; 22_3402530_en_OM p. 42 |
| Fork air pressure, maximum | 12 bar (174 psi) | 22_3214412_en_OM p. 40; 22_3402530_en_OM p. 42 |
| Fork air pressure change step | 0.2 bar (3 psi) | 22_3214412_en_OM p. 40; 22_3402530_en_OM p. 42 |
| Wait after switching off before checking fork air (minutes) | 5 | 22_3214412_en_OM p. 40; 22_3402530_en_OM p. 42 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 22_3402530_en_OM p. 126 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 1.5 | 22_3402530_en_OM p. 126 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 22_3402530_en_OM p. 126 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 22_3402530_en_OM p. 126 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 22_3402530_en_OM p. 126 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 22_3402530_en_OM p. 126 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 22_3402530_en_OM p. 125 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 22_3402530_en_OM p. 125 |
| Fork air pressure [20.7 Fork] | 10.1 bar (146 psi) | 22_3402530_en_OM p. 125 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tx300-2020-250xc-2020-300xc-2020`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, Husqvarna TX 300 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3214002_en_OM p. 36; 20_3402334_en_OM p. 37 |
| Shock low-speed compression, standard (clicks out from fully in) [21.8 Shock absorber] | 15 | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Shock high-speed compression, standard (turns out from fully in) [21.8 Shock absorber] | 2 | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Shock rebound, standard (clicks out from fully in) [21.8 Shock absorber] | 15 | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Shock spring preload [21.8 Shock absorber] | 6 mm (0.24 in) | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Static sag [21.8 Shock absorber] | 35 mm (1.38 in) | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Rider sag [21.8 Shock absorber] | 105 mm (4.13 in) | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Fork compression, standard (clicks out from fully in) [21.7 Fork] | 12 | 20_3214002_en_OM p. 130; 20_3402334_en_OM p. 130 |
| Fork rebound, standard (clicks out from fully in) [21.7 Fork] | 12 | 20_3214002_en_OM p. 130; 20_3402334_en_OM p. 130 |
| Fork air pressure [21.7 Fork] | 9.6 bar (139 psi) | 20_3214002_en_OM p. 130; 20_3402334_en_OM p. 130 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3214002_en_OM p. 131; 20_3402334_en_OM p. 131 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3214002_en_OM p. 43; 20_3402334_en_OM p. 44 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3214002_en_OM p. 43; 20_3402334_en_OM p. 44 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3214002_en_OM p. 43; 20_3402334_en_OM p. 44 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3214002_en_OM p. 43; 20_3402334_en_OM p. 44 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-ex250-2022-2023-ex300-2021-2023-tx300-2021-2022-250xc-2021-2022-300xc-2021-2022`

Bikes: KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, Husqvarna TX 300 2021, Husqvarna TX 300 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3214211_en_OM p. 36; 22_3214413_en_OM p. 36; 21_3402441_en_OM p. 37; 22_3402531_en_OM p. 38; 21_3215018_en_OM p. 33; 22_3215052_en_OM p. 33; 23_3215096_en_OM p. 33 |
| Shock low-speed compression, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Shock high-speed compression, standard (turns out from fully in) [22.8 Shock absorber] | 2 | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Shock rebound, standard (clicks out from fully in) [22.8 Shock absorber] | 15 | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Shock spring preload [22.8 Shock absorber] | 7 mm (0.28 in) | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Static sag [22.8 Shock absorber] | 35 mm (1.38 in) | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Rider sag [22.8 Shock absorber] | 105 mm (4.13 in) | 21_3214211_en_OM p. 136; 22_3214413_en_OM p. 137; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Fork compression, standard (clicks out from fully in) [22.7 Fork] | 12 | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 134; 22_3402531_en_OM p. 135; 21_3215018_en_OM p. 127; 22_3215052_en_OM p. 127; 23_3215096_en_OM p. 127 |
| Fork rebound, standard (clicks out from fully in) [22.7 Fork] | 18 | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 134; 22_3402531_en_OM p. 135; 21_3215018_en_OM p. 127; 22_3215052_en_OM p. 127; 23_3215096_en_OM p. 127 |
| Fork air pressure [22.7 Fork] | 9.6 bar (139 psi) | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 134; 22_3402531_en_OM p. 135; 21_3215018_en_OM p. 127; 22_3215052_en_OM p. 127; 23_3215096_en_OM p. 127 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 21_3214211_en_OM p. 135; 22_3214413_en_OM p. 136; 21_3402441_en_OM p. 135; 22_3402531_en_OM p. 136; 21_3215018_en_OM p. 128; 22_3215052_en_OM p. 128; 23_3215096_en_OM p. 128 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3214211_en_OM p. 43; 22_3214413_en_OM p. 43; 21_3402441_en_OM p. 44; 22_3402531_en_OM p. 45; 21_3215018_en_OM p. 40; 22_3215052_en_OM p. 40; 23_3215096_en_OM p. 40 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3214211_en_OM p. 43; 22_3214413_en_OM p. 43; 21_3402441_en_OM p. 44; 22_3402531_en_OM p. 45; 21_3215018_en_OM p. 40; 22_3215052_en_OM p. 40; 23_3215096_en_OM p. 40 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3214211_en_OM p. 43; 22_3214413_en_OM p. 43; 21_3402441_en_OM p. 44; 22_3402531_en_OM p. 45; 21_3215018_en_OM p. 40; 22_3215052_en_OM p. 40; 23_3215096_en_OM p. 40 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3214211_en_OM p. 43; 22_3214413_en_OM p. 43; 21_3402441_en_OM p. 44; 22_3402531_en_OM p. 45; 21_3215018_en_OM p. 39; 22_3215052_en_OM p. 39; 23_3215096_en_OM p. 39 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc125-2021-2022`

Bikes: Husqvarna TC 125 2021, Husqvarna TC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 21_3402439_en_OM p. 34; 22_3402529_en_OM p. 35 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 1.5 | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 21_3402439_en_OM p. 122; 22_3402529_en_OM p. 123 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 21_3402439_en_OM p. 122; 22_3402529_en_OM p. 123 |
| Fork air pressure [20.7 Fork] | 8.1 bar (117 psi) | 21_3402439_en_OM p. 122; 22_3402529_en_OM p. 123 |
| Shock spring rate by rider weight | 65-75 kg: 36 N/mm, 75-85 kg: 39 N/mm, 85-95 kg: 42 N/mm | 21_3402439_en_OM p. 123; 22_3402529_en_OM p. 124 |
| Fork air pressure, minimum | 7 bar (102 psi) | 21_3402439_en_OM p. 41; 22_3402529_en_OM p. 42 |
| Fork air pressure, maximum | 12 bar (174 psi) | 21_3402439_en_OM p. 41; 22_3402529_en_OM p. 42 |
| Fork air pressure change step | 0.2 bar (3 psi) | 21_3402439_en_OM p. 41; 22_3402529_en_OM p. 42 |
| Wait after switching off before checking fork air (minutes) | 5 | 21_3402439_en_OM p. 41; 22_3402529_en_OM p. 42 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-tc250-2020`

Bikes: Husqvarna TC 250 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 20_3402333_en_OM p. 34 |
| Shock low-speed compression, standard (clicks out from fully in) [20.8 Shock absorber] | 15 | 20_3402333_en_OM p. 122 |
| Shock high-speed compression, standard (turns out from fully in) [20.8 Shock absorber] | 1.5 | 20_3402333_en_OM p. 122 |
| Shock rebound, standard (clicks out from fully in) [20.8 Shock absorber] | 20 | 20_3402333_en_OM p. 122 |
| Shock spring preload [20.8 Shock absorber] | 7 mm (0.28 in) | 20_3402333_en_OM p. 122 |
| Static sag [20.8 Shock absorber] | 35 mm (1.38 in) | 20_3402333_en_OM p. 122 |
| Rider sag [20.8 Shock absorber] | 105 mm (4.13 in) | 20_3402333_en_OM p. 122 |
| Fork compression, standard (clicks out from fully in) [20.7 Fork] | 12 | 20_3402333_en_OM p. 121 |
| Fork rebound, standard (clicks out from fully in) [20.7 Fork] | 12 | 20_3402333_en_OM p. 121 |
| Fork air pressure [20.7 Fork] | 10.1 bar (146 psi) | 20_3402333_en_OM p. 121 |
| Shock spring rate by rider weight | 65-75 kg: 39 N/mm, 75-85 kg: 42 N/mm, 85-95 kg: 45 N/mm | 20_3402333_en_OM p. 122 |
| Fork air pressure, minimum | 7 bar (102 psi) | 20_3402333_en_OM p. 41 |
| Fork air pressure, maximum | 12 bar (174 psi) | 20_3402333_en_OM p. 41 |
| Fork air pressure change step | 0.2 bar (3 psi) | 20_3402333_en_OM p. 41 |
| Wait after switching off before checking fork air (minutes) | 5 | 20_3402333_en_OM p. 41 |

### Set the suspension back to the standard baseline and check the sag

`bak-ktmg2t-suspension-baseline-v1-ex250-2024`

Bikes: GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Standard rider weight (with riding gear) | 75-85 kg (165-187 lb) | 24_3215158_en_OM p. 32 |
| Shock low-speed compression, standard (clicks out from fully in) [23.8.2 All EX models] | 15 | 24_3215158_en_OM p. 127 |
| Shock high-speed compression, standard (turns out from fully in) [23.8.2 All EX models] | 1.5 | 24_3215158_en_OM p. 127 |
| Shock rebound, standard (clicks out from fully in) [23.8.2 All EX models] | 15 | 24_3215158_en_OM p. 127 |
| Shock spring preload [23.8.2 All EX models] | 8 mm (0.31 in) | 24_3215158_en_OM p. 127 |
| Static sag [23.8.2 All EX models] | 35 mm (1.38 in) | 24_3215158_en_OM p. 127 |
| Rider sag [23.8.2 All EX models] | 105 mm (4.13 in) | 24_3215158_en_OM p. 127 |
| Fork compression, standard (clicks out from fully in) [23.7.2 All EX models] | 12 | 24_3215158_en_OM p. 126 |
| Fork rebound, standard (clicks out from fully in) [23.7.2 All EX models] | 18 | 24_3215158_en_OM p. 126 |
| Fork spring rate by rider weight | 65-75 kg: 4.4 N/mm, 75-85 kg: 4.6 N/mm, 85-95 kg: 4.8 N/mm | 24_3215158_en_OM p. 126 |
| Shock spring rate by rider weight | 65-75 kg: 42 N/mm, 75-85 kg: 45 N/mm, 85-95 kg: 48 N/mm | 24_3215158_en_OM p. 127 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tc125-2020-2024-and-more-cdfd1acf`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, Husqvarna TC 125 2023, Husqvarna TC 125 2024, KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020, KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023, Husqvarna TC 125 2020, Husqvarna TC 125 2021, Husqvarna TC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 20_3214000_en_OM p. 30; 21_3214209_en_OM p. 35; 22_3214411_en_OM p. 34; 23_3214638_en_OM p. 33; 24_3214832_en_OM p. 33; 25_3240041_en_OM p. 33; 23_3402629_en_OM p. 30; 24_3402711_en_OM p. 30; 20_3213998_en_OM p. 30; 21_3214206_en_OM p. 30; 22_3214408_en_OM p. 30; 23_3214636_en_OM p. 30; 20_3402332_en_OM p. 31; 21_3402439_en_OM p. 31; 22_3402529_en_OM p. 32 |
| Fuel | Super unleaded (98 octane) | 20_3214000_en_OM p. 30; 21_3214209_en_OM p. 35; 22_3214411_en_OM p. 34; 23_3214638_en_OM p. 33; 24_3214832_en_OM p. 33; 25_3240041_en_OM p. 33; 23_3402629_en_OM p. 30; 24_3402711_en_OM p. 30; 20_3213998_en_OM p. 30; 21_3214206_en_OM p. 30; 22_3214408_en_OM p. 30; 23_3214636_en_OM p. 30; 20_3402332_en_OM p. 31; 21_3402439_en_OM p. 31; 22_3402529_en_OM p. 32 |
| Two-stroke oil standard | JASO FD | 20_3214000_en_OM p. 128; 21_3214209_en_OM p. 141; 22_3214411_en_OM p. 140; 23_3214638_en_OM p. 138; 24_3214832_en_OM p. 140; 25_3240041_en_OM p. 141; 23_3402629_en_OM p. 134; 24_3402711_en_OM p. 134; 20_3213998_en_OM p. 121; 21_3214206_en_OM p. 122; 22_3214408_en_OM p. 122; 23_3214636_en_OM p. 122; 20_3402332_en_OM p. 124; 21_3402439_en_OM p. 126; 22_3402529_en_OM p. 127 |
| Pre-ride item: Gearbox oil level | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Front brake fluid | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Rear brake fluid | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Front brake pads | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Rear brake pads | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Brakes work | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Coolant level | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Chain dirt | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Chain and sprockets | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Chain tension | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Tyres | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Tyre pressure | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 20_3214000_en_OM p. 92; 21_3214209_en_OM p. 96; 22_3214411_en_OM p. 95; 23_3214638_en_OM p. 97; 24_3214832_en_OM p. 99; 25_3240041_en_OM p. 99; 23_3402629_en_OM p. 95; 24_3402711_en_OM p. 95; 20_3213998_en_OM p. 88; 21_3214206_en_OM p. 88; 22_3214408_en_OM p. 88; 23_3214636_en_OM p. 88; 20_3402332_en_OM p. 92; 21_3402439_en_OM p. 92; 22_3402529_en_OM p. 93 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 20_3214000_en_OM p. 92; 21_3214209_en_OM p. 96; 22_3214411_en_OM p. 95; 23_3214638_en_OM p. 97; 24_3214832_en_OM p. 99; 25_3240041_en_OM p. 99; 23_3402629_en_OM p. 95; 24_3402711_en_OM p. 95; 20_3213998_en_OM p. 88; 21_3214206_en_OM p. 88; 22_3214408_en_OM p. 88; 23_3214636_en_OM p. 88; 20_3402332_en_OM p. 92; 21_3402439_en_OM p. 92; 22_3402529_en_OM p. 93 |
| Pre-ride item: Spokes | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Fork dust boots | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Bleed the fork | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Air filter | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Controls | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Nuts and bolts | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |
| Pre-ride item: Fuel | listed | 20_3214000_en_OM p. 26; 21_3214209_en_OM p. 30; 22_3214411_en_OM p. 29; 23_3214638_en_OM p. 28; 24_3214832_en_OM p. 28; 25_3240041_en_OM p. 28; 23_3402629_en_OM p. 25; 24_3402711_en_OM p. 25; 20_3213998_en_OM p. 26; 21_3214206_en_OM p. 26; 22_3214408_en_OM p. 26; 23_3214636_en_OM p. 26; 20_3402332_en_OM p. 27; 21_3402439_en_OM p. 27; 22_3402529_en_OM p. 28 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-125sx-2026-2027-125xc-2027-85sx1714-2026-2027-85sx1916-2026-2027`

Bikes: KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027, KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 26_3240232_en_BA p. 38; 27_3240379_en_BA p. 37; 26_3240229_en_BA p. 29; 27_3240375_en_BA p. 31 |
| Fuel | Super unleaded (98 octane) | 26_3240232_en_BA p. 38; 27_3240379_en_BA p. 37; 26_3240229_en_BA p. 29; 27_3240375_en_BA p. 31 |
| Pre-ride item: Gearbox oil level | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Front brake fluid | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Rear brake fluid | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Front brake pads | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Rear brake pads | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Brakes work | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Coolant level | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Chain dirt | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Chain and sprockets | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Chain tension | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Tyres | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Tyre pressure | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Off-road tyre pressure, front | 1.0 bar (14.5 psi) | 26_3240232_en_BA p. 108; 27_3240379_en_BA p. 108; 26_3240229_en_BA p. 91; 27_3240375_en_BA p. 93 |
| Off-road tyre pressure, rear | 1.0 bar (14.5 psi) | 26_3240232_en_BA p. 108; 27_3240379_en_BA p. 108; 26_3240229_en_BA p. 91; 27_3240375_en_BA p. 93 |
| Pre-ride item: Spokes | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Fork dust boots | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Bleed the fork | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Air filter | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Controls | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Nuts and bolts | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |
| Pre-ride item: Fuel | listed | 26_3240232_en_BA p. 33; 27_3240379_en_BA p. 32; 26_3240229_en_BA p. 25; 27_3240375_en_BA p. 27 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tc250-2020-2024-tx300-2023-2024-250sx-2020-2025-250xc-2023-2025-300sx-2023-2025-300xc-2023-2025`

Bikes: KTM 250 SX 2020, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, KTM 250 SX 2021, KTM 250 SX 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:60 | 20_3214001_en_OM p. 30; 23_3214639_en_OM p. 32; 24_3214833_en_OM p. 32; 25_3240042_en_OM p. 32; 23_3402630_en_OM p. 32; 24_3402712_en_OM p. 32; 21_3214210_en_OM p. 30; 22_3214412_en_OM p. 30; 20_3402333_en_OM p. 31; 21_3402440_en_OM p. 31; 22_3402530_en_OM p. 32 |
| Fuel | Super unleaded (95 octane) | 20_3214001_en_OM p. 30; 23_3214639_en_OM p. 32; 24_3214833_en_OM p. 32; 25_3240042_en_OM p. 32; 23_3402630_en_OM p. 32; 24_3402712_en_OM p. 32; 21_3214210_en_OM p. 30; 22_3214412_en_OM p. 30; 20_3402333_en_OM p. 31; 21_3402440_en_OM p. 31; 22_3402530_en_OM p. 32 |
| Two-stroke oil standard | JASO FD | 20_3214001_en_OM p. 124; 23_3214639_en_OM p. 138; 24_3214833_en_OM p. 138; 25_3240042_en_OM p. 139; 23_3402630_en_OM p. 140; 24_3402712_en_OM p. 141; 21_3214210_en_OM p. 124; 22_3214412_en_OM p. 126; 20_3402333_en_OM p. 125; 21_3402440_en_OM p. 127; 22_3402530_en_OM p. 129 |
| Pre-ride item: Gearbox oil level | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Front brake fluid | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Rear brake fluid | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Front brake pads | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Rear brake pads | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Brakes work | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Coolant level | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Chain dirt | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Chain and sprockets | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Chain tension | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Tyres | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Tyre pressure | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 20_3214001_en_OM p. 91; 23_3214639_en_OM p. 97; 24_3214833_en_OM p. 98; 25_3240042_en_OM p. 98; 23_3402630_en_OM p. 99; 24_3402712_en_OM p. 100; 21_3214210_en_OM p. 91; 22_3214412_en_OM p. 91; 20_3402333_en_OM p. 93; 21_3402440_en_OM p. 93; 22_3402530_en_OM p. 94 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 20_3214001_en_OM p. 91; 23_3214639_en_OM p. 97; 24_3214833_en_OM p. 98; 25_3240042_en_OM p. 98; 23_3402630_en_OM p. 99; 24_3402712_en_OM p. 100; 21_3214210_en_OM p. 91; 22_3214412_en_OM p. 91; 20_3402333_en_OM p. 93; 21_3402440_en_OM p. 93; 22_3402530_en_OM p. 94 |
| Pre-ride item: Spokes | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Fork dust boots | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Bleed the fork | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Air filter | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Controls | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Nuts and bolts | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |
| Pre-ride item: Fuel | listed | 20_3214001_en_OM p. 26; 23_3214639_en_OM p. 27; 24_3214833_en_OM p. 27; 25_3240042_en_OM p. 27; 23_3402630_en_OM p. 27; 24_3402712_en_OM p. 27; 21_3214210_en_OM p. 26; 22_3214412_en_OM p. 26; 20_3402333_en_OM p. 27; 21_3402440_en_OM p. 27; 22_3402530_en_OM p. 28 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-ex300-2026-2027-and-more-5be4b13a`

Bikes: KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 250 2026, Husqvarna TX 300 2026, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:60 | 26_3240233_en_BA p. 38; 27_3240380_en_BA p. 38; 26_3402883_en_BA p. 36; 26_3215267_en_BA p. 34; 27_3215289_en_BA p. 30 |
| Fuel | Super unleaded (95 octane) | 26_3240233_en_BA p. 38; 27_3240380_en_BA p. 38; 26_3402883_en_BA p. 36; 26_3215267_en_BA p. 34; 27_3215289_en_BA p. 30 |
| Pre-ride item: Gearbox oil level | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Front brake fluid | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Rear brake fluid | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Front brake pads | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Rear brake pads | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Brakes work | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Coolant level | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Chain dirt | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Chain and sprockets | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Chain tension | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Tyres | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Tyre pressure | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Off-road tyre pressure, front | 1.0 bar (14.5 psi) | 26_3240233_en_BA p. 108; 27_3240380_en_BA p. 108; 26_3402883_en_BA p. 107; 26_3215267_en_BA p. 103; 27_3215289_en_BA p. 94 |
| Off-road tyre pressure, rear | 1.0 bar (14.5 psi) | 26_3240233_en_BA p. 108; 27_3240380_en_BA p. 108; 26_3402883_en_BA p. 107; 26_3215267_en_BA p. 103; 27_3215289_en_BA p. 94 |
| Pre-ride item: Spokes | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Fork dust boots | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Bleed the fork | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Air filter | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Controls | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Nuts and bolts | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |
| Pre-ride item: Fuel | listed | 26_3240233_en_BA p. 33; 27_3240380_en_BA p. 33; 26_3402883_en_BA p. 31; 26_3215267_en_BA p. 29; 27_3215289_en_BA p. 26 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-mc125-2025-tc125-2025-tc150-2025-85sx1714-2025-85sx1916-2025`

Bikes: Husqvarna TC 125 2025, GasGas MC 125 2025, KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025, Husqvarna TC 150 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 25_3402801_en_BA p. 30; 25_3215219_en_BA p. 30; 25_3240038_en_BA p. 30 |
| Fuel | Super unleaded (98 octane) | 25_3402801_en_BA p. 30; 25_3215219_en_BA p. 30; 25_3240038_en_BA p. 30 |
| Pre-ride item: Gearbox oil level | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Front brake fluid | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Rear brake fluid | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Front brake pads | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Rear brake pads | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Brakes work | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Coolant level | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Chain dirt | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Chain and sprockets | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Chain tension | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Tyres | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Tyre pressure | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Off-road tyre pressure, front | 1.0 bar | 25_3402801_en_BA p. 98; 25_3215219_en_BA p. 95; 25_3240038_en_BA p. 92 |
| Off-road tyre pressure, rear | 1.0 bar | 25_3402801_en_BA p. 98; 25_3215219_en_BA p. 95; 25_3240038_en_BA p. 92 |
| Pre-ride item: Spokes | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Fork dust boots | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Bleed the fork | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Air filter | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Controls | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Nuts and bolts | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |
| Pre-ride item: Fuel | listed | 25_3402801_en_BA p. 26; 25_3215219_en_BA p. 26; 25_3240038_en_BA p. 26 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-mc125-2026-tc125-2026`

Bikes: Husqvarna TC 125 2026, GasGas MC 125 2026

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 26_3402882_en_BA p. 33; 26_3215266_en_BA p. 30 |
| Fuel | Super unleaded (98 octane) | 26_3402882_en_BA p. 33; 26_3215266_en_BA p. 30 |
| Pre-ride item: Electrics work | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Gearbox oil level | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Front brake fluid | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Rear brake fluid | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Front brake pads | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Rear brake pads | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Brakes work | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Coolant level | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Chain dirt | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Chain and sprockets | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Chain tension | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Tyres | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Tyre pressure | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Off-road tyre pressure, front | 1.0 bar (14.5 psi) | 26_3402882_en_BA p. 103; 26_3215266_en_BA p. 96 |
| Off-road tyre pressure, rear | 1.0 bar (14.5 psi) | 26_3402882_en_BA p. 103; 26_3215266_en_BA p. 96 |
| Pre-ride item: Spokes | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Fork dust boots | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Bleed the fork | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Air filter | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Controls | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Nuts and bolts | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |
| Pre-ride item: Fuel | listed | 26_3402882_en_BA p. 29; 26_3215266_en_BA p. 26 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-ex250-2025-ex300-2025-mc250-2025-tc250-2025-tc300-2025-tx300-2025`

Bikes: Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 250 2025, GasGas EX 300 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:60 | 25_3402802_en_BA p. 37; 25_3215220_en_BA p. 33 |
| Fuel | Super unleaded (95 octane) | 25_3402802_en_BA p. 37; 25_3215220_en_BA p. 33 |
| Pre-ride item: Gearbox oil level | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Front brake fluid | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Rear brake fluid | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Front brake pads | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Rear brake pads | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Brakes work | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Coolant level | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Chain dirt | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Chain and sprockets | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Chain tension | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Tyres | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Tyre pressure | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Off-road tyre pressure, front | 1.0 bar | 25_3402802_en_BA p. 108; 25_3215220_en_BA p. 101 |
| Off-road tyre pressure, rear | 1.0 bar | 25_3402802_en_BA p. 108; 25_3215220_en_BA p. 101 |
| Pre-ride item: Spokes | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Fork dust boots | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Bleed the fork | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Air filter | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Controls | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Nuts and bolts | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |
| Pre-ride item: Fuel | listed | 25_3402802_en_BA p. 32; 25_3215220_en_BA p. 28 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tx300-2027`

Bikes: Husqvarna TX 300 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:60 | 27_3402944_en_BA p. 39 |
| Fuel | Super unleaded (95 octane) | 27_3402944_en_BA p. 39 |
| Pre-ride item: Gearbox oil level | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Front brake fluid | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Rear brake fluid | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Front brake pads | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Rear brake pads | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Brakes work | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Coolant level | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Chain dirt | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Chain and sprockets | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Chain tension | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Tyres | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Tyre pressure | listed | 27_3402944_en_BA p. 33 |
| Off-road tyre pressure, front | 1.0 bar (14.5 psi) | 27_3402944_en_BA p. 113 |
| Off-road tyre pressure, rear | 1.0 bar (14.5 psi) | 27_3402944_en_BA p. 113 |
| Pre-ride item: Rim locks | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Spokes | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Fork dust boots | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Bleed the fork | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Air filter | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Controls | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Nuts and bolts | listed | 27_3402944_en_BA p. 33 |
| Pre-ride item: Fuel | listed | 27_3402944_en_BA p. 33 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-mc125-2021-2024`

Bikes: GasGas MC 125 2023, GasGas MC 125 2024, GasGas MC 125 2021, GasGas MC 125 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 23_3215094_en_OM p. 29; 24_3215157_en_OM p. 28; 21_3215008_en_OM p. 29; 22_3215051_en_OM p. 29 |
| Two-stroke oil standard | JASO FD | 23_3215094_en_OM p. 121; 24_3215157_en_OM p. 128; 21_3215008_en_OM p. 120; 22_3215051_en_OM p. 120 |
| Pre-ride item: Gearbox oil level | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Front brake fluid | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Rear brake fluid | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Front brake pads | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Rear brake pads | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Brakes work | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Coolant level | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Chain dirt | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Chain and sprockets | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Chain tension | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Tyres | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Tyre pressure | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 23_3215094_en_OM p. 87; 24_3215157_en_OM p. 90; 21_3215008_en_OM p. 86; 22_3215051_en_OM p. 86 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 23_3215094_en_OM p. 87; 24_3215157_en_OM p. 90; 21_3215008_en_OM p. 86; 22_3215051_en_OM p. 86 |
| Pre-ride item: Spokes | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Fork dust boots | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Bleed the fork | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Air filter | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Controls | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Nuts and bolts | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |
| Pre-ride item: Fuel | listed | 23_3215094_en_OM p. 25; 24_3215157_en_OM p. 24; 21_3215008_en_OM p. 25; 22_3215051_en_OM p. 25 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-ex250-2024-ex300-2024-mc250-2022-2024`

Bikes: GasGas MC 250 2023, GasGas MC 250 2024, GasGas EX 300 2024, GasGas MC 250 2022, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:60 | 23_3215095_en_OM p. 29; 24_3215158_en_OM p. 29; 22_3215074_en_OM p. 29 |
| Two-stroke oil standard | JASO FD | 23_3215095_en_OM p. 121; 24_3215158_en_OM p. 130; 22_3215074_en_OM p. 120 |
| Pre-ride item: Gearbox oil level | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Front brake fluid | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Rear brake fluid | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Front brake pads | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Rear brake pads | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Brakes work | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Coolant level | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Chain dirt | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Chain and sprockets | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Chain tension | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Tyres | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Tyre pressure | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 23_3215095_en_OM p. 87; 24_3215158_en_OM p. 91; 22_3215074_en_OM p. 86 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 23_3215095_en_OM p. 87; 24_3215158_en_OM p. 91; 22_3215074_en_OM p. 86 |
| Pre-ride item: Spokes | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Fork dust boots | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Bleed the fork | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Air filter | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Controls | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Nuts and bolts | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |
| Pre-ride item: Fuel | listed | 23_3215095_en_OM p. 25; 24_3215158_en_OM p. 25; 22_3215074_en_OM p. 25 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-85sx1714-2024-85sx1916-2024`

Bikes: KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel/oil mixing ratio | 1:40 | 24_3214830_en_OM p. 30 |
| Fuel | Super unleaded (98 octane) | 24_3214830_en_OM p. 30 |
| Two-stroke oil standard | JASO FD | 24_3214830_en_OM p. 122 |
| Pre-ride item: Gearbox oil level | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Front brake fluid | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Rear brake fluid | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Front brake pads | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Brakes work | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Coolant level | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Chain dirt | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Chain and sprockets | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Chain tension | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Tyres | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Tyre pressure | listed | 24_3214830_en_OM p. 26 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 24_3214830_en_OM p. 88 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 24_3214830_en_OM p. 88 |
| Pre-ride item: Spokes | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Fork dust boots | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Bleed the fork | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Air filter | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Controls | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Nuts and bolts | listed | 24_3214830_en_OM p. 26 |
| Pre-ride item: Fuel | listed | 24_3214830_en_OM p. 26 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tx300-2021-250xc-2020-2021-300xc-2020-2021`

Bikes: KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, Husqvarna TX 300 2021

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel | Super unleaded (ROZ 95/RON 95/PON 91) | 20_3214002_en_OM p. 31; 21_3214211_en_OM p. 31; 21_3402441_en_OM p. 32 |
| Oil injection: tank filled with plain fuel, not premix | yes | 20_3214002_en_OM p. 31; 21_3214211_en_OM p. 31; 21_3402441_en_OM p. 32 |
| Two-stroke oil standard | JASO FD | 20_3214002_en_OM p. 134; 21_3214211_en_OM p. 138; 21_3402441_en_OM p. 138 |
| Pre-ride item: Gearbox oil level | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Front brake fluid | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Rear brake fluid | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Front brake pads | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Rear brake pads | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Brakes work | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Coolant level | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Chain dirt | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Chain and sprockets | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Chain tension | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Tyres | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Tyre pressure | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 20_3214002_en_OM p. 94; 21_3214211_en_OM p. 95; 21_3402441_en_OM p. 95 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 20_3214002_en_OM p. 94; 21_3214211_en_OM p. 95; 21_3402441_en_OM p. 95 |
| Pre-ride item: Spokes | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Fork dust boots | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Bleed the fork | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Air filter | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Controls | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Nuts and bolts | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |
| Pre-ride item: Fuel | listed | 20_3214002_en_OM p. 27; 21_3214211_en_OM p. 27; 21_3402441_en_OM p. 28 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tx300-2022-250xc-2022-300xc-2022`

Bikes: KTM 250 XC 2022, KTM 300 XC 2022, Husqvarna TX 300 2022

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel | Super unleaded (ROZ 95) | 22_3214413_en_OM p. 31; 22_3402531_en_OM p. 33 |
| Oil injection: tank filled with plain fuel, not premix | yes | 22_3214413_en_OM p. 31; 22_3402531_en_OM p. 33 |
| Two-stroke oil standard | JASO FD | 22_3214413_en_OM p. 140; 22_3402531_en_OM p. 139 |
| Pre-ride item: Gearbox oil level | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Front brake fluid | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Rear brake fluid | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Front brake pads | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Rear brake pads | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Brakes work | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Coolant level | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Chain dirt | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Chain and sprockets | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Chain tension | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Tyres | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Tyre pressure | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 22_3214413_en_OM p. 95; 22_3402531_en_OM p. 96 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 22_3214413_en_OM p. 95; 22_3402531_en_OM p. 96 |
| Pre-ride item: Spokes | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Fork dust boots | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Bleed the fork | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Air filter | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Controls | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Nuts and bolts | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |
| Pre-ride item: Fuel | listed | 22_3214413_en_OM p. 27; 22_3402531_en_OM p. 29 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-tx300-2020`

Bikes: Husqvarna TX 300 2020

| Value | Used | Source (document, printed page) |
|---|---|---|
| Fuel | Super unleaded (ROZ 95/RON 95/PON 91) | 20_3402334_en_OM p. 32 |
| Pre-ride item: Gearbox oil level | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Front brake fluid | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Rear brake fluid | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Front brake pads | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Rear brake pads | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Brakes work | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Coolant level | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Chain dirt | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Chain and sprockets | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Chain tension | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Tyres | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Tyre pressure | listed | 20_3402334_en_OM p. 28 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 20_3402334_en_OM p. 95 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 20_3402334_en_OM p. 95 |
| Pre-ride item: Spokes | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Fork dust boots | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Bleed the fork | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Air filter | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Controls | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Nuts and bolts | listed | 20_3402334_en_OM p. 28 |
| Pre-ride item: Fuel | listed | 20_3402334_en_OM p. 28 |

### Pre-ride check

`bak-ktmg2t-pre-ride-v1-ex250-2022-2023-ex300-2021-2023`

Bikes: GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023

| Value | Used | Source (document, printed page) |
|---|---|---|
| Oil injection: tank filled with plain fuel, not premix | yes | 21_3215018_en_OM p. 29; 22_3215052_en_OM p. 29; 23_3215096_en_OM p. 29 |
| Two-stroke oil standard | JASO FD | 21_3215018_en_OM p. 131; 22_3215052_en_OM p. 131; 23_3215096_en_OM p. 131 |
| Pre-ride item: Gearbox oil level | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Front brake fluid | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Rear brake fluid | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Front brake pads | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Rear brake pads | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Brakes work | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Coolant level | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Chain dirt | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Chain and sprockets | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Chain tension | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Tyres | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Tyre pressure | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Off-road tyre pressure, front | 1.0 bar (15 psi) | 21_3215018_en_OM p. 88; 22_3215052_en_OM p. 88; 23_3215096_en_OM p. 88 |
| Off-road tyre pressure, rear | 1.0 bar (15 psi) | 21_3215018_en_OM p. 88; 22_3215052_en_OM p. 88; 23_3215096_en_OM p. 88 |
| Pre-ride item: Spokes | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Fork dust boots | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Bleed the fork | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Air filter | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Controls | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Nuts and bolts | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |
| Pre-ride item: Fuel | listed | 21_3215018_en_OM p. 25; 22_3215052_en_OM p. 25; 23_3215096_en_OM p. 25 |

### Wash the bike and do the after-wash check

`bak-ktmg2t-after-wash-v1-ex250-2022-2024-and-more-638bba7b`

Bikes: KTM 125 SX 2020, KTM 150 SX 2020, KTM 125 SX 2021, KTM 150 SX 2021, KTM 125 XC 2021, KTM 125 SX 2022, KTM 150 SX 2022, KTM 125 XC 2022, KTM 125 XC 2023, KTM 125 XC 2024, KTM 125 XC 2025, KTM 125 SX 2026, KTM 125 SX 2027, KTM 125 XC 2027, KTM 250 SX 2020, KTM 250 SX 2023, KTM 300 SX 2023, KTM 250 XC 2023, KTM 300 XC 2023, KTM 250 SX 2024, KTM 300 SX 2024, KTM 250 XC 2024, KTM 300 XC 2024, KTM 250 SX 2025, KTM 300 SX 2025, KTM 250 XC 2025, KTM 300 XC 2025, KTM 250 SX 2026, KTM 300 SX 2026, KTM 250 XC 2026, KTM 300 XC 2026, KTM 250 XC 2027, KTM 300 XC 2027, Husqvarna TC 125 2023, Husqvarna TC 125 2024, Husqvarna TC 125 2026, Husqvarna TC 250 2023, Husqvarna TX 300 2023, Husqvarna TC 250 2024, Husqvarna TX 300 2024, Husqvarna TC 250 2026, Husqvarna TX 300 2026, Husqvarna TX 300 2027, GasGas MC 125 2023, GasGas MC 125 2024, GasGas MC 125 2026, GasGas MC 250 2023, GasGas MC 250 2024, GasGas EX 300 2024, GasGas MC 250 2026, GasGas EX 300 2026, GasGas EX 300 2027, KTM 250 SX 2021, KTM 250 SX 2022, KTM 250 XC 2020, KTM 300 XC 2020, KTM 250 XC 2021, KTM 300 XC 2021, KTM 250 XC 2022, KTM 300 XC 2022, Husqvarna TC 125 2020, Husqvarna TC 125 2021, Husqvarna TC 125 2022, Husqvarna TC 250 2020, Husqvarna TC 250 2021, Husqvarna TC 250 2022, Husqvarna TX 300 2020, Husqvarna TX 300 2021, Husqvarna TX 300 2022, GasGas MC 125 2021, GasGas MC 125 2022, GasGas MC 250 2022, GasGas EX 300 2021, GasGas EX 250 2022, GasGas EX 300 2022, GasGas EX 250 2023, GasGas EX 300 2023, GasGas EX 250 2024

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm (23.6 in) | 20_3214000_en_OM p. 110; 21_3214209_en_OM p. 120; 22_3214411_en_OM p. 119; 23_3214638_en_OM p. 121; 24_3214832_en_OM p. 123; 25_3240041_en_OM p. 123; 26_3240232_en_BA p. 135; 27_3240379_en_BA p. 135; 20_3214001_en_OM p. 109; 23_3214639_en_OM p. 121; 24_3214833_en_OM p. 122; 25_3240042_en_OM p. 122; 26_3240233_en_BA p. 135; 27_3240380_en_BA p. 135; 23_3402629_en_OM p. 119; 24_3402711_en_OM p. 119; 26_3402882_en_BA p. 130; 23_3402630_en_OM p. 123; 24_3402712_en_OM p. 124; 26_3402883_en_BA p. 134; 27_3402944_en_BA p. 143; 23_3215094_en_OM p. 107; 24_3215157_en_OM p. 113; 26_3215266_en_BA p. 121; 23_3215095_en_OM p. 107; 24_3215158_en_OM p. 114; 26_3215267_en_BA p. 131; 27_3215289_en_BA p. 121; 21_3214210_en_OM p. 111; 22_3214412_en_OM p. 111; 20_3214002_en_OM p. 121; 21_3214211_en_OM p. 123; 22_3214413_en_OM p. 124; 20_3402332_en_OM p. 111; 21_3402439_en_OM p. 112; 22_3402529_en_OM p. 113; 20_3402333_en_OM p. 111; 21_3402440_en_OM p. 113; 22_3402530_en_OM p. 114; 20_3402334_en_OM p. 121; 21_3402441_en_OM p. 123; 22_3402531_en_OM p. 124; 21_3215008_en_OM p. 106; 22_3215051_en_OM p. 106; 22_3215074_en_OM p. 106; 21_3215018_en_OM p. 116; 22_3215052_en_OM p. 116; 23_3215096_en_OM p. 116 |

### Wash the bike and do the after-wash check

`bak-ktmg2t-after-wash-v1-ex250-2025-and-more-f6d8987c`

Bikes: Husqvarna TC 125 2025, Husqvarna TC 250 2025, Husqvarna TC 300 2025, Husqvarna TX 300 2025, GasGas MC 125 2025, GasGas MC 250 2025, GasGas EX 300 2025, Husqvarna TC 150 2025, GasGas EX 250 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm | 25_3402801_en_BA p. 122; 25_3402802_en_BA p. 133; 25_3215219_en_BA p. 120; 25_3215220_en_BA p. 126 |

### Wash the bike and do the after-wash check

`bak-ktmg2t-after-wash-v1-85sx1714-2020-2024-2026-2027-85sx1916-2020-2024-2026-2027`

Bikes: KTM 85 SX 17/14 2020, KTM 85 SX 19/16 2020, KTM 85 SX 17/14 2021, KTM 85 SX 19/16 2021, KTM 85 SX 17/14 2022, KTM 85 SX 19/16 2022, KTM 85 SX 17/14 2023, KTM 85 SX 19/16 2023, KTM 85 SX 17/14 2024, KTM 85 SX 19/16 2024, KTM 85 SX 17/14 2026, KTM 85 SX 19/16 2026, KTM 85 SX 17/14 2027, KTM 85 SX 19/16 2027

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm (23.6 in) | 20_3213998_en_OM p. 107; 21_3214206_en_OM p. 108; 22_3214408_en_OM p. 108; 23_3214636_en_OM p. 108; 24_3214830_en_OM p. 108; 26_3240229_en_BA p. 113; 27_3240375_en_BA p. 115 |
| Handlebar control caps pushed back to let water out | yes | 20_3213998_en_OM p. 108; 21_3214206_en_OM p. 109; 22_3214408_en_OM p. 109; 23_3214636_en_OM p. 109; 24_3214830_en_OM p. 109; 26_3240229_en_BA p. 114; 27_3240375_en_BA p. 116 |

### Wash the bike and do the after-wash check

`bak-ktmg2t-after-wash-v1-85sx1714-2025-85sx1916-2025`

Bikes: KTM 85 SX 17/14 2025, KTM 85 SX 19/16 2025

| Value | Used | Source (document, printed page) |
|---|---|---|
| Minimum distance between pressure-washer nozzle and parts | 60 cm | 25_3240038_en_BA p. 114 |
| Handlebar control caps pushed back to let water out | yes | 25_3240038_en_BA p. 115 |
