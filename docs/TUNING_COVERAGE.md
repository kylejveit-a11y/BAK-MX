# Tuning data coverage — 8 October 2026

Read from the live MX database by pattern over verified claims (statement and reviewed property). It shows which rider-facing setup facts exist for each exact bike. Pattern detection is approximate; treat a "yes" as "something is published", not as a completeness review.

## Where a rider gets a published suspension baseline today

| Bikes | Fork clickers | Shock clickers | Sag | Shock spring by rider weight | Fork spring | Tire pressure |
|---|---|---|---|---|---|---|
| KTM 450 SX-F 2025 | yes | yes | yes | yes | no (air fork: pressure published) | yes |
| Husqvarna FC 250 and FC 450, 2022–2025 (8 bike-years) | yes | yes | yes | yes | no | no |
| GasGas MC 250F and MC 450F 2025 | yes | compression yes, rebound not found | yes | yes | no | no |
| GasGas MC 250F 2024 and 2026, MC 450F 2026 | no | no | no | no | no | no |
| Honda CRF250R and CRF450R, 2022–2026 (10) | no | no | no | yes (standard and optional rates) | yes | yes |
| Yamaha YZ250F and YZ450F, 2022–2026 (10) | no (2026 YZ450F partial) | no | no (2026 YZ450F yes) | no | 2023 YZ450F, 2024 YZ250F, 2026 YZ450F only | same three only |
| Kawasaki KX450 2025 | no | no | no | no | catalog spring labels only | no |

11 of 35 bike-years have published clicker settings. For the other 24, Ask BAK can explain direction and method but cannot state where the clickers start.

## Engine and service basics

| Bikes | Valve clearance | Idle | Oil capacity | Coolant | Stock gearing | Service intervals |
|---|---|---|---|---|---|---|
| KTM 450 SX-F 2025 | yes | yes | yes | not found | not found | yes |
| Husqvarna FC, 2022–2025 | yes | yes (not 2024 FC 450) | yes | yes | yes | no |
| GasGas MC 2025 | yes | yes | yes | yes | yes | no |
| Honda CRF, 2022–2026 | CRF250R 2022 and 2024 only | same two only | CRF250R 2025 only | no | yes | no |
| Yamaha YZ, 2022–2026 | 2023 YZ450F, 2024 YZ250F, 2026 YZ450F only | same three | same three | same three | yes | no |
| Kawasaki KX450 2025 | no | no | no | no | no | no |

Service intervals in hours exist for one bike. That is the largest gap after suspension baselines, because the maintenance log cannot suggest what is due.

## What to pull next, in order

1. **Yamaha owner's service manuals already cited in the database** (nine of the ten bike-years): the "Specifications" and "Tuning" chapters carry standard fork and shock settings, sag, spring rates, valve clearance, capacities and the maintenance chart. Seven of those manuals have only their torque tables extracted.
2. **Honda competition handbooks already cited** (all ten): suspension standard settings and adjustment ranges, valve clearance, capacities and the maintenance schedule. Only torque, wear limits, spring rates and tire pressure are extracted.
3. **Service schedules** for Husqvarna and GasGas from the owner's manuals already cited.
4. **Kawasaki**: no manual body has been obtained for any year.
5. **GasGas 2024 and 2026**: owner's manuals for the confirmed US catalogs.

This session could not download source documents (no outbound access to the manufacturer hosts), so no new values were extracted. The existing evidence gate needs the document bytes for a hash, and that rule was left in place.

## A defect found and handled

120 Husqvarna settings are stored with statements such as "Front fork: 12 clicks" that do not say whether the value is compression or rebound. The reviewed record does say. The database now exposes that as a `property` on each claim, includes it in search, and passes it to Ask BAK and the Specs screens. No statement or evidence record was altered.

## Update 2026-10-09 (evening): manual text-layer pass

Added 9,573 verified facts from publicly published OEM manuals.

- **Yamaha** — full specification tables, clicker positions (Soft / STD / Hard), preload, sag and two-stroke jetting for
  YZ125 2021–2027, YZ250 2022–2027, YZ250F 2019–2027, YZ450F 2018–2027, YZ125X 2021–2027, YZ250X 2022–2027,
  YZ250FX 2021–2027, YZ450FX 2021–2027. Details and limits: `docs/research/expansion/yamaha/TEXT_LAYER_REVIEW_2026-10-09.md`.
- **Honda** — clicker standard positions, race sag, spring install length, valve clearance, oil and idle for
  CRF250R and CRF450R 2022–2026. Details: `docs/research/expansion/honda/TEXT_LAYER_REVIEW_2026-10-09.md`.

Still without clicker settings on file: Kawasaki (all), GasGas 2024 and 2026, and every KTM, Husqvarna and GasGas year not listed above.
Still without service intervals: every bike except the one loaded earlier.
Index of every Yamaha manual Yamaha publishes, with what is loaded: `docs/research/manual-index/yamaha-us.tsv`.

## Update 2026-10-10: KTM, Husqvarna and GasGas manuals, service intervals

Added 7,288 verified facts across 52 bike-years from owner's manuals the three brands publish on their own sites.

- **Service intervals**: 2,955 schedule rows, each task with its interval (for example "once after one operating hour; every 15 operating hours").
  53 bike-years now have a schedule, up from one.
- **Clickers with the adjuster named**: Comfort / Standard / Sport for fork compression and rebound, shock low-speed, high-speed and rebound,
  plus sag, spring rates by rider weight and fork air pressure.
- KTM 250 / 350 / 450 SX-F and XC-F 2023–2027; Husqvarna FC and FX 2025–2027; GasGas MC 2025–2027 and EX 2025.

Detail, checks and what was left out: `docs/research/expansion/ktm-group/TEXT_LAYER_REVIEW_2026-10-10.md`.
Index of manuals found: `docs/research/manual-index/ktm-group-us.tsv`.

Still open:

- KTM 2020–2022, Husqvarna and GasGas 2023–2024, and every two-stroke from the three brands: published, not loaded.
- Yamaha and Honda service-interval charts; Yamaha YZ85, YZ65 and the 2016–2020 layouts.
- Suzuki: no manufacturer-published RM-Z manual was found online. Third-party hosts are not used.
- Kawasaki: manuals sit behind a bot check on Kawasaki's site.
