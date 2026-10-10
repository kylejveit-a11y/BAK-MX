# KTM suspension catalog enrichment — 2025 US 450 SX-F

Scope: standard F8475Y5, official model identifier 1003417574. Reviewed 2026-09-13.

`ktm-suspension-full-labels.json` holds 453 unique catalog occurrences: 40 fork, 33 shock and 380 WP assortment rows. It preserves 416 dimensional strings, five material-grade labels, and 376 individually reviewed cases in which tightening torque does not apply to the non-threaded part itself. A separate clamping bolt or nut still needs its own torque.

Fork and shock labels were recaptured directly from the live OEM rendered catalog. WP assortment rows reuse the complete previously audited official capture; its content hash is retained. All occurrence keys were checked against the canonical complete catalog, including the single duplicated WP row already reconciled there.

The strings retain OEM notation. Do not convert unexplained spring codes to spring rates, assume an ID/OD ordering, interpret fluid package size as fill quantity, or use catalog dimensions as service tolerances. The source itself truncates some descriptions. Incomplete `M4x` was deliberately excluded from dimensions. None of the 380 assortment rows establish a factory shim stack or the installed quantity.

Primary-source searches for suspension service information reached the [WP downloads interface](https://www.wp-group.com/downloads/). Exact searches for the OEM fork A460C159Y406000 and shock A460C459Y408000 returned no downloads. This is an access/evidence gap, not proof that service instructions do not exist. WP PRO 7548/8950 manuals are different component configurations and were not substituted for stock XACT specifications.

Still unresolved: stock suspension internal tightening torques and conditions; the factory shim-stack ordering; component tolerances and wear limits; complete procedures for internal reassembly. Owner-manual external mounting torques remain a separate evidence set.

Validation: 453 unique assembly/callout/part keys; every key present in the complete official catalog; all URLs retain the exact US model identifier. No canonical inventory or live database changes were made in this acquisition lane.
