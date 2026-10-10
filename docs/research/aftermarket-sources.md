# BAK MX aftermarket evidence acquisition — 2026-09-12

Research checkpoint, not production engineering truth. Eight bounded manufacturer-page candidates, one index-only ECU lead and one explicitly excluded clutch result are recorded in aftermarket-candidates.json. These are not eight unique products: the same Öhlins shock has three separately checked model pages. No claim has been promoted and no manual has been captured in this pass.

## Bounded candidates

| Component | Exact bike scope checked | Source and locator | Important boundary |
|---|---|---|---|
| Yoshimura 225860S520 | Honda CRF450R, 2025, 2026 | [Manufacturer page](https://www.yoshimura-rd.com/products/crf450r-rs-12-stainless-full-exhaust-w-stainless-muffler-225860s520) — SKU; Sound Insert/Spark Arrester Options; Vehicle Fitment | Designed around factory-standard equipment; other accessories may interfere. |
| Yoshimura 225861S720 | Honda CRF450R, 2025, 2026 | [Manufacturer page](https://www.yoshimura-rd.com/products/crf450r-rx-rs-12-titanium-full-exhaust-w-titanium-muffler-225861s720) — SKU; Sound Insert/Spark Arrester Options; Vehicle Fitment | Factory-standard vehicle basis; accessories and other markets need separate confirmation. |
| Yoshimura 244730S521 | Kawasaki KX450, 2024, 2025, 2026 | [Manufacturer page](https://www.yoshimura-rd.com/products/kx450-x-rs-12-stainless-full-exhaust-w-stainless-muffler-244730s521) — SKU; compatibility disclaimer; Vehicle Fitment | KX450F-to-KX450 catalog alias must be reviewed before importing. |
| Öhlins DMX 1222 | Yamaha YZ450F, 2025 | [Manufacturer page](https://www.ohlins.com/motorcycle-suspension/mx-enduro/yamaha-yz-450f_?v=yamaha-yz-450f-2025) — Product heading; Part no; Manuals | MEX '26 is component revision branding, not permission to add 2026 bike applicability. |
| Öhlins DMX 0214 | KTM 250 SX-F, 2025 | [Manufacturer page](https://www.ohlins.com/en-us/motorcycle-suspension/mx-enduro/ktm-250-350-sx-f-husqvarna-fc-250-350?v=ktm-250-sx-f-2025) — Selected vehicle heading; spring note; Description | Spring sold separately; preload adjuster 15000-02 sold separately. |
| Öhlins DMX 0214 | Husqvarna FC 250, 2025 | [Manufacturer page](https://www.ohlins.com/en-us/motorcycle-suspension/mx-enduro/ktm-250-350-sx-f-husqvarna-fc-250-350?v=husqvarna-fc-250-2025) — Selected vehicle heading; spring note | Spring and optional preload adjuster sold separately. |
| Öhlins DMX 0214 | GasGas MC 250F, 2025 | [Manufacturer page](https://www.ohlins.com/en-us/motorcycle-suspension/mx-enduro/ktm-250-350-sx-f-husqvarna-fc-250-350?v=gasgas-mc-250f-2025) — Selected vehicle heading; spring note | Spring sold separately. |
| Öhlins FCX 2205 | Husqvarna FC 250, 2025 | [Manufacturer page](https://www.ohlins.com/en-us/motorcycle-suspension/mx-enduro/husqvarna-tc-fc_?v=husqvarna-fc-250-2025) — Product heading; replacement note; Manuals | Do not conflate 2026 component revision with 2026 motorcycle fitment. |

Read the JSON limitations before normalizing. The Kawasaki source calls its model KX450F while BAK uses KX450: review that alias explicitly. Öhlins MEX '26 names a component revision; it does not expand the bike-year scope. Open-ended fitment wording was deliberately not translated into a full five-year range.

## High-value fitment traps found

- The two Honda Yoshimura systems have different optional sound insert identifiers. Do not merge product-specific accessories simply because both systems are RS-12. [Stainless system](https://www.yoshimura-rd.com/products/crf450r-rs-12-stainless-full-exhaust-w-stainless-muffler-225860s520), [titanium system](https://www.yoshimura-rd.com/products/crf450r-rx-rs-12-titanium-full-exhaust-w-titanium-muffler-225861s720).
- Rekluse's search-visible RMS-8301010 is for CRF450R 2013–2016. It is excluded, not applied to modern CRF450R bikes. [Official fitment](https://www.rekluse.com/product/auto-clutches/radiusx/radiusx-clutches/radiusx-4-0-hon-crf450r/).
- The other search-visible Rekluse pack RMS-2801010 also lists 2013–2016 and explicitly is not a replacement pack for RadiusX, RadiusCX or Core Manual TorqDrive. This is a useful future component-family guard, not an initial-roster recommendation. [Official pack page](https://www.rekluse.com/product/manual-clutches/torq-drive-clutch-pack/torqdrive-clutch-pack-hon-crf-450r/).

## ECU and remaining acquisition gaps

GET SKU GK-SX1PRO4T-0010 is visible in the official search index, but Athena's direct product/category and instruction-directory retrieval returned an error; Athena USA returned a loading shell. Its fitment is therefore unassigned in the machine-readable record. Next access path is the manufacturer's normal interactive fitment/catalogue and [GET instruction-manual directory](https://www.athena.eu/en-us/corporate/get-instruction-manuals), not retailer-to-production inference. No ECU map values or procedures were approved.

Modern Rekluse kit numbers RMS-8301102 and RMS-2801102 appeared in retailer results, but official exact-year confirmation remains missing. Follow the manufacturer's fitment selector/product guide; do not silently substitute the old similarly titled kits.

FMF, Vortex and WP exact-part evidence remains uncollected in this bounded pass. No purchased manual, paid tuning license or manufacturer account was used. Other initial bike/year combinations remain uncovered; this is not a complete aftermarket catalog.

## Promotion prerequisites

1. Capture legally accessible original source and revision/hash; inspect linked installation manuals.
2. Bind each claim to exact part revision, bike year, variant, region and changed OEM/aftermarket interfaces.
3. Review redistribution/commercial-use rights before retaining source content in the paid product. Public access alone is not proof of a reuse license.
4. Conflict-check instructions and supersession; have a qualified review for safety-critical procedures.
5. Only then construct the separate governed ingestion format. This candidate JSON intentionally lacks source hashes, approval and runtime eligibility.

Performance marketing was not collected as diagnostic truth. Installation torque, spring rates, fluid volumes, map changes and service intervals remain unknown until separately evidenced. The accessible pages establish candidate fitment, not that buying a part will fix a rider's symptom.

