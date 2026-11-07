# Legacy motocross collection checkpoint

Date: 2026-10-16. Requested scope: model years 2005 through 2020, oldest first.
Repository base: faa1beb. Branch: research/legacy-2005-2020.

## Actual result

185 candidate facts for four exact 2005 US Honda models, from three manufacturer-hosted manuals:
- CRF250R: 49
- CRF450R: 52
- CR85R: 42
- CR85RB: 42 (separate model; not inherited from CR85R)

All records are PENDING. Zero database writes, promotions, roster changes or deployments.
Source URLs, full PDF SHA-256, retrieval timestamps, manual identity and PDF/printed page locators are in each file and source-manifest.json. Source PDFs and page images are temporary inspection material and are not redistributed.
The facts follow the existing expansion research shape (target, assemblies, parts, facts, mappings). This is a research checkpoint, not a runtime ingestion bundle.

## Content inspected

The covers identify 2005 and the model(s). Honda-hosted English competition handbooks have US units and US consumer/manual-order information. Visual inspection covered:
- CRF250R PDF 143 (printed 139), 98 (94), 112 (108), 113 (109).
- CRF450R PDF 147 (143), 102 (98), 116 (112), 117 (113).
- CR85R/RB PDF 111 (107), 112 (108), 85 (81), 86 (82).

Captured: engine architecture/displacement/bore and stroke, dimensions, dry weight, fuel and oil capacities with service condition, carburetor identifiers/stock jets/needle settings, transmission ratios, ignition/spark plugs, stock damping and race sag. Four-stroke fork and shock settings differ; small-wheel and big-wheel mini shock settings differ. Ranges and gently-seated references are retained. Rear mini settings are turns, not clicks.

## Deliberate exclusions and issues

31 issue entries are in issues.json. Most are unprocessed compound table rows, not conflicting facts.
- CRF250R transmission draining row prints 0.63 Imp qt next to 600 cm3. These do not convert; the complete row is withheld until compared to its service procedure.
- CR85 manual gives standard sag 85 mm and then calls 90 mm a decrease. The defective tuning example is excluded. The 85 mm standard is also supported by its arithmetic example.
- Fork oil table values await procedure reconciliation, including mini per-model level values 101/102 mm; they are not generalized across models.
- Tire size/pressure, suspension travel and brake area composite rows require separate atomic extraction and conditions.
- No torque, clearance/wear limits, valve-clearance, service schedules, front mini damping or full parts catalogs are complete in this batch.
- No weight-specific recommendation, power figure or cross-year compatibility has been inferred.

## Other discovery and blocked routes

Yamaha library UI and public JavaScript confirmed the existing documented POST model-list endpoints. The product-list response returned USA context. Subsequent 2005 requests for YZ85, YZ125, YZ250, YZ250F and YZ450F encountered HTTP 403 or redirect failures. No access-control bypass was attempted. This does NOT establish that a model or manual is absent.
Search results for 2005 YZ125 mixed publications 1C3-28199-30 (T/T1, 2004 publication) and 1C3-28199-31 (V, 2005 publication). Publication calendar year is not sufficient model-year proof. No Yamaha technical values added.
Kawasaki OEM 2005 KX250-R1 diagram lead: https://www.kawasaki.com/en-us/owner-center/parts/24896/2005/KX250-R1 . Only a lead; no catalog captured. Preserve diagram heading as assembly name and absolute diagram URLs when acquiring.

## Runtime compatibility finding

The older generic applicabilitySchema in shared/evidence.ts still allows only 2022–2026 and a limited family list. Existing newer manual loaders use a separate path. Do not weaken source review or change runtime support merely to load this batch. Assess actual current database and picker constraints in a separate integration pass. No live database state was inspected here.

## Resume in order

1. Finish 2005 source discovery across the established motocross manufacturers and exact mini/full-size variants; confirm actual historical models and market scope. Do not fabricate year/model combinations for newer brands.
2. Complete the four Honda manuals' missing categories and reconcile issues.json; acquire 2005 CR125R/CR250R manuals with exact scope.
3. Continue 2006, 2007, ... 2019. The year queue is not a model production roster or a completion claim.
4. Reconcile 2020 against existing manual-index files, source bundles and live IDs; do not overwrite newer work or reimport duplicates.
5. Independent/conflict review and governed integration are required before serving these candidates as verified facts.

## Reproduce

Download the three URLs in source-manifest.json into a temporary directory, using the final URL basename. Verify SHA-256 against the manifest BEFORE re-running. Run extract_honda_2005.py TEMP_DIRECTORY with pdfplumber installed. It regenerates candidate files only and never contacts a database. Run validate_checkpoint.py to check structure, uniqueness, exact scope, provenance and known per-model distinctions.
