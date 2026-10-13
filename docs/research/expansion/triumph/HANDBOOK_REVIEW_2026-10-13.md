# Triumph off-road owner's handbooks: text-layer review, 2026-10-13

Source: the owner's handbooks Triumph publishes without sign-in on the Handbooks page of triumphtechnicalinformation.com
(US English editions). Service manuals on the same site are licensed content and were not opened. No account was used.
Facts only, each with the document URL, SHA-256, PDF page and printed page. No handbook is stored or redistributed.

## What was added

511 verified specification facts across 9 bike-years, plus 584 scheduled-maintenance rows added later the same day (see below).

| Bike | Handbook | Facts | Of which suspension |
|---|---|---|---|
| TF 250-X 2024 | 3850529-US | 58 | 6 |
| TF 250-X 2025 | 3850672-US and 3850529-US | 51 | 2 |
| TF 250-X 2026 | 3850672-US | 58 | 5 |
| TF 450-RC Edition 2025 | 3850672-US | 57 | 5 |
| TF 450-X 2026 | 3850672-US | 57 | 5 |
| TF 250-C 2026 | 3850699-US | 58 | 5 |
| TF 450-C 2026 | 3850699-US | 57 | 5 |
| TF 250-E 2026 | 3850136-US | 61 | 5 |
| TF 450-E 2026 | 3850136-US | 54 | 5 |

Per bike: the Specifications chapter (payload, engine, lubrication, cooling, fuel, ignition, transmission and gear ratios, tires,
electrical, frame, the torque figures the handbook prints, fluids) and, from the Chassis Setup chapter, the factory fork and shock
clicker settings and riding sag where printed.

## Points a rider should know

- TF 250-X 2025 is split by VIN: frames before CC7868 use handbook 3850529, frames from CF3825 use 3850672. The two handbooks
  print different shock settings, so for 2025 only values both handbooks agree on were stored. Seven rows were withheld,
  including the shock clickers.
- The current 3850529 handbook already carries the values of Handbook Addendum 01 for the 2024 TF 250-X
  (rear spindle nut 120 Nm, tire pressure 14 psi). The stored values are the current ones.

## Method

`scripts/manual-textlayer/triumph_handbook.py`. Each specification table is headed by a section name and a model name; rows are taken
only from tables headed with the bike being loaded. Suspension settings come from the tables titled "Front/Rear Suspension Settings - <model>"
and "Riding Sag - <model>"; a row is stored only if the whole "Standard" line parses (fractions such as 1 1/4 turn included).
Storage is hash-guarded through `private.stage_manual_rows`.

## Scheduled Maintenance Table (added later on 2026-10-13)

`scripts/manual-textlayer/triumph_schedule.py`, `build_triumph_schedule.py`. The table's grid rules give the row bands, the bullet
glyphs the marks, and the seven interval columns are named from the header words above each column (after the first operating
hour; every 2.5 hours of race riding conditions; every 15 / 30 / 45 / 90 operating hours; every 24 months). A shaded band with one
centred phrase is the category (Lubrication, Fuel System and Engine Management, Cooling System, Engine, Wheels and Tires,
Steering and Suspension, Brakes, Final Drive, ...). Rows are stored as `Service schedule / <category> / <operation>` with the
marked intervals as the value; the handbook's * (additional labour charge above the basic service) is kept as a note.

| Handbook | Rows per bike | Bikes |
|---|---|---|
| 3850529-US | 64 | TF 250-X 2024 |
| 3850672-US | 64 | TF 250-X 2025, TF 450-RC Edition 2025, TF 250-X 2026, TF 450-X 2026 |
| 3850699-US | 65 | TF 250-C 2026, TF 450-C 2026 |
| 3850136-US | 67 | TF 250-E 2026, TF 450-E 2026 |

Check: page 99 of 3850529-US (Wheels and Tires to Final Drive, 29 rows) rendered and compared mark for mark with the stored rows;
identical. Loaded hash-guarded through `private.stage_manual_rows` (9 of 9 matched); conditions from migration `20261013040000`.

## Left out on purpose

- "Rear tire size 19 x 1.85" (2024 TF 250-X): a rim size printed in the tire row.
- TF 450-E 2026 tire pressures: printed twice with different values.
- 2027 handbook 3850823 (TF 250-X, TF 450-X): downloaded and parsed, not stored because those model years are not in the Garage yet.
