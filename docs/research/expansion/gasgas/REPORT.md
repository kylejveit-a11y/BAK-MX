# GasGas expansion coverage

Captured official OEM catalog rows and owner-manual engineering facts for MC250F/MC450F, standard variants, 2022–2026. Complete catalog enumeration is independent of US applicability and engineering-data completeness.

| Target | Assemblies captured / index | Part occurrences | Catalog enumerated | US catalog scope |
|---|---:|---:|---|---|
| MC 250F 2022 | 41 / 41 | 1177 | Yes | Pending |
| MC 250F 2023 | 42 / 42 | 1184 | Yes | Pending |
| MC 250F 2024 | 42 / 42 | 1168 | Yes | Confirmed |
| MC 250F 2025 | 42 / 42 | 1171 | Yes | Confirmed |
| MC 250F 2026 | 42 / 42 | 1171 | Yes | Pending |
| MC 450F 2022 | 41 / 41 | 1169 | Yes | Pending |
| MC 450F 2023 | 42 / 42 | 1172 | Yes | Pending |
| MC 450F 2024 | 22 / 42 | 411 | In progress | Pending |
| MC 450F 2025 | 42 / 42 | 1164 | Yes | Confirmed |
| MC 450F 2026 | 21 / 42 | 391 | In progress | Pending |

Manual/spec facts: 769 approved; 613 pending, 2 duplicates excluded, 14 other-variant rows excluded. Thirty-six reviewed MC450F 2025 part-occurrence torque mappings are separate from the fact count.

## Source review

All ten public English owner manuals were acquired from the official GASGAS manual selector, hashed, and parsed. Five worldwide/manual-confirmed targets received visual torque-table review: MC250F 2024–2026 and MC450F 2025–2026. Additional 2025 engine, chassis, fork and shock specification tables were visually reviewed. Two same-model German manuals resolve four English fork direction inconsistencies; exact original fork identity and original conflict history remain in the records.

Catalog manifests preserve both engine/chassis index links and expected assembly IDs. Quantities come from the authentic OEM Quantity field; zero remains null usable quantity. Raw duplicate rows are retained separately. Literal JavaScript template placeholders and case-only part-number aliases are reconciled without fabricating inventory rows.

## Remaining gaps

- Earlier EU-classified catalog/manual scope has not been established as US-equivalent. Their extracted values remain pending.
- MC250F 2026 catalog labels code F0201Z5 as AR, while the worldwide manual distinguishes standard F0201Z5 from AR F0242Z5. Manual facts and catalog scope are governed separately.
- The 2025 MC450F pressure-pump cover thread conflicts with exact catalog hardware; no torque mapping is approved. The shift-lever catalog thread length also differs from the manual, so mapping is excluded.
- The 2025 MC450F first-gear ratio cell literally contains “2:28 PM”; no inferred correction is approved.
- Torque facts have not been mapped to every bolt occurrence. Generic thread-size torque defaults are not propagated into exact joint claims.
- Complete repair procedures, tightening sequences, replacement requirements, wear limits, internal suspension service data, maintenance-condition schedules, and aftermarket-specific requirements remain incomplete.

This work does not establish every-bolt engineering completeness or paid-release readiness. See REVIEW.md and validation.json for review scope and checks.
