# KTM engine torque source access — 2026-09-13

## Full-label completion and correction pass

All 19 engine catalog groups (official-23 through official-41) were re-read in the live OEM catalog, recovering 375 full descriptions. `ktm-engine-full-labels.json` retains exact occurrence keys, source URLs, literal dimension notation where present, and review notes. These are catalog dimensions only; omitted units and material properties were not inferred.

The review found and corrected a real mapping error: ignition callout 12, part 79539090000, is **Spark plug connector**, not an alternative spark plug. Its prior 10–12 Nm assignment was removed. Actual spark plug callout 13, part 77839093000, retains the valid torque mapping. Abbreviated names must never be sufficient evidence for future mappings.

All retained existing engine mappings were rechecked against full labels; `reviewed_catalog_description` now binds each review to that actual label. Thirteen additional exact occurrences were mapped after full-label and diagram review: stator, sensor/cable retainer, ignition cover, starter mounting, torque limiter retainer, both rocker-arm bolt occurrences, camshaft bracket, timing-chain tensioner, oil-filter cover, idler-gear lock washer, oil-pressure-control valve plug and crankcase plug. There are now **34 engine occurrence mappings** (22 previous minus 1 incorrect plus 13 new), covering **32 distinct table facts**.

The lubrication cover screws are a confirmed source discrepancy: full OEM labels at callouts 8 and 26 are **M5x14**, while owner-table pressure and suction pump cover rows specify **M5x16**. Those rows remain unmapped. Other unresolved items remain: clutch adjusting-ring versus spring-retainer procedure, main/transmission bearing retaining-screw thread treatment, primary nut left-hand/thread-coating detail, shift-lever M6x15 versus table M6x16, oil-jet functional placement, and mixed-function catalog occurrences. The paid repair manual remains the identified legitimate source for procedures and these discrepancies; no purchase or inaccessible-body-page bypass occurred.

Scope: standard US 2025 KTM 450 SX-F, model F8475Y5. Research only; no canonical or runtime changes made in this pass.

## Owner-manual torque table now verified

The initial repair-preview access limitation below is **not an engine-torque-data blocker**. The [KTM-authored owner manual hosted by Poway Powersports](https://powaypowersports.com/cdn/shop/files/2025-ktm-450sx-f-factory-owners-manual.pdf?v=679135179847397228), **3240045en / 2025-01-22**, contains all **59 rows** of section **23.2 Engine tightening torques**, printed pages **150–151** (PDF pages **152–153**). Both complete tables were rendered and visually inspected, including the page numbers, thread treatments and staged cylinder-head torque.

The byte SHA-256 is `a24efdc2f908cc4c3764ee133bcdf6957b6caaebfee4587e847f3b2fe2456a33`. Structured facts, 22 narrow catalog-occurrence mappings, and explicit mapping ambiguities are in `ktm-450-2025-engine-torque-facts.json`. The owner table is a valid engine-torque source; it is not a complete repair procedure or proof that every physical fastener is covered.

## Exact engine mapping follow-up

Live official US F8475Y5 catalog full labels and diagrams resolved 11 additional mappings: four cylinder-head-group joints (primary staged head bolt, small head screw, exhaust flange and valve cover); three water-pump cover screws; two engine-case screw lengths; the bent oil-nozzle screw; and the M6x55 clutch-cover screw. Exact catalog links, callouts, full labels and review reasoning are preserved on each mapping.

The full official shifting-mechanism label confirms a real unresolved discrepancy: shift-lever screw `0024060156S` is **M6x15** in the catalog while the owner table states **M6x16**. No exact mapping was added for that joint. The primary nut label remains M18x1.5 Precote without LH, while the torque table states M18LHx1.5. The clutch-cover diagram also exposes a mixed-function occurrence: callout20 uses seven M6x25 screws across clutch-cover and water-pump locations, whose table thread treatments differ. Do not attach one condition to all seven via a part-number join. Other unresolved abbreviated/function-specific joints remain recorded as gaps; no generic thread-size inference was used.

## Official source

[KTM Print on Demand](https://print.ktm.com/skyco13/XIII-KTM-1/bridge), verified in the live browser. The URL does not retain the product filters: select KTM → 2025 → 450 → MX → 450 SX-F → EN - English → Display → Repair Manual details.

The selected product states model year 2025, 450 SX-F, execution EU/BR/US. Its permitted cover preview identifies repair manual **3206600en**. Revision **6 June 2025**, applicability **F8475Y5**, and the 431-page preview index were previously verified in `docs/research/europe-service-pass.md`; those revision/applicability details were not re-read during this pass.

## Newly verified locator and access limit

The public preview page-number field accepts opening pages. Viewer pages 8–9 display the contents page and introductory material. Enlarging the contents through the normal viewer control confirms **Engine tightening torques — printed page 371**, within Technical Specifications. This is a contents-only locator, not a read of the torque table.

Entering viewer page 373 (printed page 371, given the observed two-page offset) returned the field to Page 8–Page 9 and kept the opening contents displayed. No torque body was displayed. No alternate asset routes, undocumented APIs, paywall circumvention, or repeated body-page probes were attempted. The 431 entries in the DOM must not be treated as 431 readable pages.

## US digital option

Selected **United States of America** in Place of Delivery and then **Digital**. The shop displayed **€27.45, including 10% VAT**, and enabled BUY; selecting Digital removed the physical-shipping line. This is a displayed catalog price in euros, not a verified checkout total or USD charge. Basket remained at zero. No BUY click, account creation, checkout, payment, or acquisition occurred.

The paid repair source remains relevant for procedural details and unresolved mapping/coverage gaps, not for acquiring the 59 owner-manual engine torque facts now verified. Once acquired, inspect printed page 371 onward together with the related procedures for tightening sequence, staged/angle torque, thread treatment, replacement requirements, and model exceptions. Do not infer a fastener's torque from dimensions or substitute another model year.
