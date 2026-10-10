# Secondary evidence review — 2026-09-13

Created `secondary-evidence.json`: 29 reviewed records from 10 public sources. These are bounded factual extracts and original review, with document hashes, attribution, scope, conditions and explicit use decisions. No source manual or copyrighted page is redistributed. No database or runtime code changed.

## What is usable

Seven 2025 non-KTM bike setup bundles are eligible as **attributed historical Keefer starting points**, not OEM defaults: Yamaha YZ250F/YZ450F, Kawasaki KX250, Husqvarna FC 250/FC 450 and GasGas MC 250F/MC 450F. The bundles retain actual clickers, height, sag and relevant pressure. They require original component and rider context checks before application; a preference does not establish correct setup for every rider.

Three original MX-Tech instructions establish its WP Triple Adjuster baseline, its Showa/KYB Compression Adjuster baseline, and the Raven/Blackjack spring-perch adjustment increment. The two one-page manufacturer PDFs were rendered and visually inspected. Four additional Raven records retain exact aftermarket part numbers and maker-listed dimensions/application wording. They do not establish OEM fork dimensions or exact motorcycle fitment.

Factory Connection supplies two useful first-hand records: a fork-binding mechanism involving excessive clamping, and its fork-setting decal ID as the key for recovering a prior revalve's setup. The latter is a practical route for personalized aftermarket data: store the installed tuner's identifier, not just “revalved.” Race Tech independently supports the need for correct installation and exact OEM clamp torques.

`approved_for_runtime=true` is narrowly defined as eligibility for the stated attributed-reference use. **None of these records has been promoted to the production database.** Component gating and claim-kind-aware retrieval are prerequisites. Importing these records as undifferentiated VERIFIED OEM specifications would be incorrect.

## Resolved exclusions and remaining issues

- Keefer's Honda torque article explicitly proposes reduced fastening torques for handling. Nine joint-specific comparisons are retained as research-only setup experiments. They do not close any OEM torque gap, and its broad blue-threadlocker suggestion cannot be applied indiscriminately to factory torques.
- The 2025 250 roundup has a Honda section labeled 2025 but a sentence naming 2024. That Honda bundle is held for year clarification.
- Honda/Kawasaki 450 fork baselines use changed spring combinations; the spring units are inconsistent. These bundles remain research-only until that configuration is independently resolved. Spring values were not silently corrected from N/m to N/mm.
- Some shock high-speed entries omit units. Those values were omitted rather than guessed.
- Race Tech's standard FSCS conversion page contains real preload and motocross oil quantities, but it is not a specification for a stock WP air fork or its damping leg. The exact installed kit/version is unresolved; the record remains research-only. Its worked-example subtraction also contains inconsistent text, which was excluded.
- MX-Tech spring charts discovered on its current site mostly address pre-2022 motorcycles. Their availability is not grounds to inherit values into the current roster.
- Factory Connection's fork-alignment page currently says it is coming soon. It was not counted as an acquired procedure.
- No forum torque was promoted on plausibility alone. No purchase, private tuner file, access-code-protected valving database, or paywall bypass was used.

## Verification

JSON parse, unique record IDs, source hashes, URL matching and mandatory approval/source fields validated. Review is source capture and applicability assessment, not a live app or mechanical test. This lane does not claim to complete a bike inventory.

## Primary source links

- [Keefer 2025 450 baseline](https://www.keeferinctesting.com/2025-450-mx-baseline-suspension-settings/)
- [Keefer 2025 250 baseline](https://www.keeferinctesting.com/2025-250-mx-baseline-suspension-settings/)
- [Keefer Honda torque experiments](https://www.keeferinctesting.com/2025-honda-crf450rwe-baseline-suspension-settings-and-torque-values/)
- [Race Tech FSCS instructions](https://racetech.com/ip-fscs-fk-spr-conv-wp-16-aer48/)
- [MX-Tech cartridge instructions](https://mx-tech.com/cartridge-installation/)
- [MX-Tech WP adjuster guide](https://mx-tech.com/content/WP%20Compression%20Adjuster%20Guide.pdf)
- [MX-Tech Showa/KYB adjuster guide](https://mx-tech.com/content/Tuning%20Guides/MXT%20Showa%20KYB%20Adjuster%20Tuning%20Guide.pdf)
- [MX-Tech Raven part listing](https://mx-tech.com/mxt-raven-cartridge-system/)
- [Factory Connection technical guidance](https://www.factoryconnection.com/Setup-gethelp)
- [Race Tech fork installation](https://racetech.com/fork-installation/)
