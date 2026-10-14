# Suspension knowledge push, 2026-10-14

Two requests: (1) find references such as Race Tech's Motorcycle Suspension Bible and other documentation that can improve
what Ask BAK bases its suggestions on; (2) list the KYB, Showa and WP components on the in-scope bikes, their manuals, service
parts (springs, seals, bushings, oils) and the upgraded components offered.

| File | What it is |
|---|---|
| `OEM_SETUP_GUIDANCE_2026-10-14.md` | Yamaha's suspension symptom tables, now given to Ask BAK for 56 Yamaha bike-years, and the cross-check against BAK's own rules |
| `REFERENCES.md`, `references.json` | 33 reference sources with access, licence status and how the app may use each |
| `COMPONENT_CATALOG.md`, `kyb.json`, `showa.json`, `wp.json` | 285 sourced component, manual, part and upgrade records, with gaps |

## The Suspension Bible

Race Tech's Motorcycle Suspension Bible (Paul Thede and Lee Parks, Motorbooks/Quarto, 2010, ISBN 9780760331408) is a
commercial copyrighted book with no open licence seen. Use: a human reviewer reference (buy a copy; use it to write and check
BAK's own rules in BAK's words). Its text must not be scanned or given to the model. Putting its content or Race Tech's name in
the app needs permission from Race Tech (info@racetech.com, 951-279-6655) and Quarto/Motorbooks for text rights, asking
specifically about AI use. It predates current air forks (WP XACT, Showa and KYB air forks). The free sources ranked in
REFERENCES.md cover most of its practical content (sag method, clicker direction, symptom tables, test method).

## Component catalog: what it says and how far to trust it

- Fitment by brand: WP on every KTM, Husqvarna and GasGas (XACT air fork on MX models; 2024 off-road switch to the XACT
  closed-cartridge coil fork; GasGas EC keeps the Xplor fork); Showa on every Honda CRF-R/RX and the KX450/KX450X, and on the
  KX250 from 2025; KYB on every Yamaha, every Triumph TF and the KX250 2020-2024 (KX250X 2021 confirmed KYB, 2025 on treated as
  Showa with medium confidence).
- Weak areas: OEM seal, bushing and spring part numbers; spring-by-rider-weight tables; several fitment years inferred from
  carry-over. The research hit its search limit before finishing parts and upgrades.
- Spring rates: the OEM standard and optional rates printed in owner's manuals are already verified in the database for most
  KTM, Husqvarna and GasGas bike-years and for Honda; read those rather than the web rows.
- Records are candidates, not evidence. None is loaded into the database or shown to riders. The aftermarket build plan
  (docs/AFTERMARKET_BUILD_PLAN.md) is where reviewed rows would go next.
