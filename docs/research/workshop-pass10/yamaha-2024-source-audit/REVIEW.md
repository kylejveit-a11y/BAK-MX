# Exact 2024 US YZ450F source audit

Source acquired from the checkpoint Yamaha source map, not rediscovered from a different model. BHR-2819U-11 / LIT-11626-37-11, first February2023, explicitly 2024 YZ450FR and Yamaha Motor Corporation U.S.A. The386-page capture matches saved SHA2566e784b3b15fe1e131f0e385676ca2873e74d783ee2499ce561e595bcea9ca9be. Original PDF remains in Temp, outside repository. No procedure cloned or published, no DB write.

## Useful differences for next authoring

2024 versus2025: fork rebound11 versus10, compression10 versus12; shock rebound13 versus12, low-speed compression10 versus9; standard preload7 versus8 mm. Stock rear spring58 versus56 N/mm. High-speed baseline remains1turn. Outer fork oil270 versus275cm3 and fork projection7 versus5mm are distinct settings; never reuse2025 values. Cartridge charge216cm3 remains separately stated.

Exhaust clamp12 versus16 N m and primary drive nut120/E versus130/M are genuine service changes. The2024 pressure-plate table blank versus2025 E is only a table difference:2024 servicePDF249 explicitly oils the bolt/plate contacts and uses4 then10 N m crisscross. A blank table row is not dry preparation.

Brake sections align at2024PDF132–153 versus2025PDF136–157. Checked master cup diagrams/retainers and rear two-pad-spring callout remain consistent in the inspected subset. There is no full brake-equivalence approval or common-part-number claim. The2024 handlebar section adds a page; fork begins2024PDF162 versus2025PDF165. Use explicit section routing and read actual drawings before writing steps.

## Artifacts and limits

- reviewed-differences.json contains exact numeric/preparation findings, locators and remaining work.
- section-routing-map.json gives component section boundaries and useful cutpoints. Locations are not step equivalence.
- source-page-index.json binds every source-page text hash and section anchors.
- approved-2025-page-map-candidates.json compares225 referenced2025 pages. Similarity is a retrieval aid only; low-score false matches exist and are explicitly unreviewed. Never bulk-replace pages with it.
- saved-torque-table-differences.json compares full joint/thread/quantity keys, normalizing only the pre-race check glyph. It identifies3 differences, one subsequently resolved as table-only.

Original source text checked for suspension108–111/165–173/376–377 and rear brakes143/150–153. Rendered exact2024 pages1,56,99,134,141,152,258 inspected, alongside previously reviewed2025 comparator pages. Further independent mechanical review must verify every assembly drawing and applicable hardware before approval. All engine-only follow-up is now owned by the sibling yamaha-2024-engine-audit agent. Internal shock and damper rod-seal coverage are not established here.

The audit is intentionally partial and useful for sequencing. It does not claim to identify every possible drawing, material, catalog or year change. Numeric equality never implies unchanged hardware or procedure applicability.
