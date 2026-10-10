# Continuous stock top-end guide

`top-end-stock-reuse-v1.procedure.json` contains132 steps across9 phases. It begins at the assembled bike, removes the engine, opens and inspects the top end, renews stem seals and performs the measured cylinder/piston work, times the cams, refits the engine and performs the reviewed commissioning checks. It binds9 immutable dependencies, including the existing phase index and supported valve-adjustment source.

The route retains the original serviceable head, caps, cams, valves, guides and seats. A failed inspection does not become a completed rebuild by recording a note. Machining, guide replacement, unsupported pad-chart inputs and full bottom-end work remain outside this operation. Exact stock cylinder/piston/ring replacement is supported only with the recorded actual fit.

After the first post-assembly timing and cold-clearance check, a forward branch skips13 additional adjustment steps when all four readings are within their cited ranges. Skipped adjustment steps are NOT_PERFORMED; earlier top-end work remains performed. Otherwise the source-reviewed cam removal, supported chart selection, pad installation, retiming and remeasurement path runs before shared closure. A failed second measurement stops at the open-head measurement state; it cannot proceed to closure/startup.

`operation_dependencies` uses repo-relative paths and exact SHA256 hashes for generator verification. `composition-review-v1.json` records context-only wording changes and the source branch adaptation. No frozen source artifact was edited. The full bottom-end clutch-nut conflict remains held and its joint is untouched here.

Validation: `validate_topend.py` PASS132 steps/9 phases/9 source dependencies; branch span, source text/adaptations, ordered cutpoints, metadata and observation fields. Root must independently review and integrate the new artifact before rider use; passing these structural checks is not mechanical field testing or launch readiness.
