import {applyHoseRouteCorrection} from './apply-hose-route-correction.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
const root='docs/research/expansion/yamaha/workshop-2026/';
const suspensionManifest='docs/research/suspension-pass2/source-review-manifest.json';
const yamahaPass2='docs/research/expansion/yamaha/workshop-pass2/';
const publicationHolds=JSON.parse(readFileSync('docs/research/suspension-pass3/publication-hold.json','utf8')).holds;
const hoseCorrectionBytes=readFileSync('docs/research/workshop-pass10/yamaha-2024-frame/hose-route-correction.json');
const toolCorrectionBytes=readFileSync('docs/research/workshop-pass9/engine-tool-preflight-correction.json');
if(createHash('sha256').update(toolCorrectionBytes).digest('hex')!=='81ecc9667721b4b1a2377e3bd49e325150d1a8396118e3862848127a528077dc')throw Error('Tool preflight review changed');
const toolCorrection=JSON.parse(toolCorrectionBytes.toString());
const lowerCorrectionBytes=readFileSync('docs/research/workshop-pass12/yamaha-2022-engine-journey/lower-filter-oring-correction-v1.json');
const lowerCorrectionHash='b43c248302b36f6273d198a1cfc39cfaa6848ee5542b8f2bb33cbcbe0750e946';
if(createHash('sha256').update(lowerCorrectionBytes).digest('hex')!==lowerCorrectionHash)throw Error('Lower filter correction review changed');
const lowerCorrection=JSON.parse(lowerCorrectionBytes.toString('utf8'));
const topendMetadataBytes=readFileSync('docs/research/workshop-pass12/yamaha-2022-engine-journey/top-end-metadata-correction-v1.json');
const topendMetadataHash='18a89b9a9283fba3f5dc27dde9ae93371dd1b6a00f56714e97dc7463ab0f21cd';
if(createHash('sha256').update(topendMetadataBytes).digest('hex')!==topendMetadataHash)throw Error('Topend metadata review changed');
const topendMetadata=JSON.parse(topendMetadataBytes.toString('utf8'));

// Keep tool identifiers and measurement ranges available before a rider dismantles the bike.
const toolDetails=(t:any)=>[t.size,t.spec,t.range_required,t.purpose,...(t.part_numbers??[])].filter((v:any)=>typeof v==='string'&&v.trim()).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i).join(' Â· ')||null;
const files:{file:string;component:string;sourceManifest?:string}[]=[
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2021-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2021-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2022-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2022-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2023-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2023-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2024-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2024-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2020-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2020-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr250f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr250f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr250f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2027-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2027-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2027-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2027-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2027-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2027-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2020-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2020-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2020-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2020-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2021-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2021-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2021-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2021-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2022-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2022-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2022-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2022-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2023-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2023-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2023-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2023-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2024-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2024-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2024-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2024-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2025-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2025-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2025-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2025-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2020-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-2020-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2021-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-2021-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2022-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-2022-2023-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2023-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-2022-2023-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2024-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-2024-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2025-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-years-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2026-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-years-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2027/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/2027/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2027/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/2027/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2027/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/2027/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2026-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2025-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2026-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2021-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2021-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2020-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2020-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2025-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2025-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2026-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2025-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2026-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2022-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2023-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2024-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2022-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2023-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2024-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2021-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2023-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2024-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2023-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2024-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2021-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2022-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2022-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2020-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2020-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2027-yz125-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2027-yz250-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2027-yz125x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2027-yz250x-damping-baseline-v1.procedure.json',component:'suspension',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2026-engine/top-end-teardown-inspection-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2026-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2026-engine/original-head-valve-reassembly-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yz250f/2026-engine/head-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz450fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz450fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2026-yz450fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2026-yz450fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz250fx/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz250fx/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-yz250fx/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-yz250fx/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr450f/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr450f/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-fx-wr/2025-wr450f/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yamaha-fx-wr/2025-wr450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yamaha-two-stroke/2027-yz250-top-end-power-valve-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass13/yamaha-two-stroke/engine-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2020/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2020/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2020/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2021/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2021/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2021/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2022/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2022/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2022/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2023/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2023/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2023/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2024/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2024/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2024/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2025/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2025/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2025/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2026/fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2026/shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz250f/2026/rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz250f/runtime-source-review-manifest.json'},

 {file:'../../../workshop-pass13/yz450f/2021-fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2021-shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2021-rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2027-fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2027-shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2027-rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2020-fork-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2020-shock-baseline-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass13/yz450f/2020-rider-sag-preload-v1.procedure.json',component:'shock',sourceManifest:'docs/research/workshop-pass13/yz450f/runtime-source-review-manifest.json'},
{file:'fork-clicker-baseline.procedure.json',component:'fork'},{file:'shock-damping-baseline.procedure.json',component:'shock'},{file:'valve-inspection-v1.procedure.json',component:'engine'},{file:'fork-remove-refit-v1.procedure.json',component:'fork'},
 ...['fork-baseline-v1','rider-sag-preload-v1','shock-baseline-v1'].map(name=>({file:`../../../workshop-pass12/yamaha-2022-suspension/${name}.procedure.json`,component:name.startsWith('fork')?'fork':'shock',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-suspension/runtime-source-review-manifest.json'})),
 {file:'../../../workshop-pass12/yamaha-2022-suspension/fork-oil-seals-bushings-v1.procedure.json',component:'fork',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-suspension/fork-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-engine/lower-engine-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-engine/lower-runtime-source-review-manifest.json'},
 ...['front-caliper-rebuild-v1','rear-caliper-rebuild-v1','front-master-rebuild-v1','rear-master-rebuild-v1'].map(name=>({file:`../../../workshop-pass12/yamaha-2022-brakes/${name}.procedure.json`,component:'frame',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-brakes/runtime-source-review-manifest.json'})),
 {file:'../../../workshop-pass12/yamaha-2022-frame/engine-removal-refit-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-frame/source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-commissioning/post-rebuild-commissioning-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-commissioning/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-engine-journey/top-end-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-engine-journey/source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-frame/frame-bearing-renewal-reassembly-v1.procedure.json',component:'frame',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-frame/frame-source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-engine-journey/major-engine-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-engine-journey/major-source-review-manifest.json'},
 {file:'../../../workshop-pass12/yamaha-2022-engine/top-end-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass12/yamaha-2022-engine/runtime-source-review-manifest.json'},
 ...['fork-baseline-v1','fork-oil-seals-bushings-v1','rider-sag-preload-v1','shock-baseline-v1'].map(name=>({file:`../../../workshop-pass10/yamaha-2024-suspension/${name}.procedure.json`,component:name.startsWith('fork')?'fork':'shock',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-suspension/runtime-source-review-manifest.json'})),
 ...['front-caliper-rebuild-v1','rear-caliper-rebuild-v1','front-master-rebuild-v1','rear-master-rebuild-v1'].map(name=>({file:`../../../workshop-pass10/yamaha-2024-brakes/${name}.procedure.json`,component:'frame',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-brakes/runtime-source-review-manifest.json'})),
 ...['fork-baseline-v1','fork-oil-seals-bushings-v1','rider-sag-preload-v1','shock-baseline-v1'].map(name=>({file:`../../../workshop-pass11/yamaha-2023-suspension/${name}.procedure.json`,component:name.startsWith('fork')?'fork':'shock',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-suspension/runtime-source-review-manifest.json'})),
 ...['front-caliper-rebuild-v1','rear-caliper-rebuild-v1','front-master-rebuild-v1','rear-master-rebuild-v1'].map(name=>({file:`../../../workshop-pass11/yamaha-2023-brakes/${name}.procedure.json`,component:'frame',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-brakes/runtime-source-review-manifest.json'})),
 {file:'../../../workshop-pass11/yamaha-2023-commissioning/post-rebuild-commissioning-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-commissioning/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass11/yamaha-2023-engine/lower-engine-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-engine/lower-runtime-source-review-manifest.json'},
 ...['engine-removal-refit-v1','frame-bearing-renewal-reassembly-v1'].map(name=>({file:`../../../workshop-pass11/yamaha-2023-frame/${name}.procedure.json`,component:name.startsWith('engine')?'engine':'frame',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-frame/source-review-manifest.json'})),
 {file:'../../../workshop-pass11/yamaha-2023-engine-journey/top-end-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-engine-journey/source-review-manifest.json'},
 {file:'../../../workshop-pass11/yamaha-2023-engine-journey/major-engine-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-engine-journey/major-source-review-manifest.json'},
 {file:'../../../workshop-pass11/yamaha-2023-engine/top-end-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass11/yamaha-2023-engine/runtime-source-review-manifest.json'},
 ...['engine-removal-refit-v1','frame-bearing-renewal-reassembly-v1'].map(name=>({file:`../../../workshop-pass10/yamaha-2024-frame/${name}.procedure.json`,component:name.startsWith('engine')?'engine':'frame',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-frame/source-review-manifest.json'})),
 {file:'../../../workshop-pass10/yamaha-2024-commissioning/post-rebuild-commissioning-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-commissioning/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass10/yamaha-2024-engine-journey/top-end-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-engine-journey/source-review-manifest.json'},
 {file:'../../../workshop-pass10/yamaha-2024-engine-journey/major-engine-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-engine-journey/major-source-review-manifest.json'},
 {file:'../../../workshop-pass10/yamaha-2024-engine/top-end-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass10/yamaha-2024-engine/lower-engine-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass10/yamaha-2024-engine/lower-runtime-source-review-manifest.json'},
 ...['fork-baseline-v1','fork-oil-seals-bushings-v2','rider-sag-preload-v1','shock-baseline-v1'].map(name=>({file:`../../../workshop-pass9/yamaha-2025-suspension/${name}.procedure.json`,component:name.startsWith('fork')?'fork':'shock',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-suspension/source-review-manifest.json'})),
 ...['front-caliper-rebuild-v1','rear-caliper-rebuild-v1','front-master-rebuild-v1','rear-master-rebuild-v1'].map(name=>({file:`../../../workshop-pass9/yamaha-2025-brakes/${name}.procedure.json`,component:'frame',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-brakes/source-review-manifest.json'})),
 ...['engine-removal-refit-v1','frame-bearing-renewal-reassembly-v1'].map(name=>({file:`../../../workshop-pass9/yamaha-2025-frame/${name}.procedure.json`,component:name.startsWith('engine')?'engine':'frame',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-frame/source-review-manifest.json'})),
 {file:'../../../workshop-pass9/yamaha-2025-engine/top-end-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-engine/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass9/yamaha-2025-engine/lower-engine-bench-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-engine/lower-runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass9/yamaha-2025-commissioning/post-rebuild-commissioning-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-commissioning/runtime-source-review-manifest.json'},
 {file:'../../../workshop-pass9/yamaha-2025-engine-journey/top-end-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-engine-journey/source-review-manifest.json'},
 {file:'../../../workshop-pass9/yamaha-2025-major-engine-journey/major-engine-bike-journey-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass9/yamaha-2025-major-engine-journey/source-review-manifest.json'},
 {file:'../../../workshop-pass7/yamaha-engine/top-end-guide-valve-renew-v1.procedure.json',component:'engine',sourceManifest:'docs/research/workshop-pass7/yamaha-engine/top-end-source-review-manifest-v1.json'},
 {file:'../../../workshop-pass7/yamaha-frame-renewal/frame-bearing-renewal-reassembly-v1.procedure.json',component:'frame',sourceManifest:'docs/research/workshop-pass7/yamaha-frame-renewal/source-review-manifest.json'},
 {file:'../../../workshop-pass8/yamaha-drive-renewal/stock-chain-sprocket-pair-renewal-v1.procedure.json',component:'frame',sourceManifest:'docs/research/workshop-pass8/yamaha-drive-renewal/source-review-manifest.json'},
 ...[
  ['yamaha-hydraulics','front-caliper-rebuild-v1','frame'],
  ['yamaha-hydraulics','rear-caliper-rebuild-v1','frame'],
  ['yamaha-hydraulics','front-master-rebuild-v1','frame'],
  ['yamaha-hydraulics','rear-master-rebuild-v1','frame'],
  ['yamaha-hydraulics','clutch-hydraulic-service-v1','engine'],
  ['yamaha-engine','guides-valves-renew-bench-v1','engine'],
  ['yamaha-engine','throttle-grip-cable-access-v1','frame'],
  ['yamaha-chassis','steering-bearings-races-renewal-v1','frame'],
  ['yamaha-chassis','swingarm-linkage-bearings-renewal-v1','frame'],
  ['yamaha-chassis','shock-eye-bearings-renewal-v1','shock'],
  ['yamaha-chassis','shock-spring-preload-sag-v1','shock'],
  ['yamaha-tuning','fork-harshness-trial-v1','fork'],
  ['yamaha-tuning','fork-bottoming-trial-v1','fork'],
  ['yamaha-tuning','shock-packing-trial-v1','shock'],
  ['yamaha-tuning','shock-bouncing-trial-v1','shock'],
  ['yamaha-drive','stock-chain-renewal-v1','frame'],
 ].map(([folder,name,component])=>({file:`../../../workshop-pass7/${folder}/${name}.procedure.json`,component,sourceManifest:`docs/research/workshop-pass7/${folder}/source-review-manifest.json`})),
 {file:'../workshop-pass2/valve-adjustment-v3.procedure.json',component:'engine'},
 {file:'../workshop-pass2/stock-tensioner-service-v1.procedure.json',component:'engine'},
 {file:'../workshop-pass2/exhaust-remove-refit-v1.procedure.json',component:'exhaust'},
 {file:'../workshop-pass2/coolant-change-v1.procedure.json',component:'cooling'},
 {file:'../workshop-pass2/airbox-remove-refit-v1.procedure.json',component:'intake'},
 {file:'../../../suspension-pass2/shock-remove-refit-v1.procedure.json',component:'shock',sourceManifest:suspensionManifest},
 {file:'../../../suspension-pass2/husqvarna-fc450-2025-shock-baseline.procedure.json',component:'shock',sourceManifest:suspensionManifest},
 {file:'../../../suspension-pass2/husqvarna-fc450-2025-sag-inspection.procedure.json',component:'shock',sourceManifest:suspensionManifest},
 {file:'../../../suspension-pass3/fork-oil-seals-bushings-v1.procedure.json',component:'fork',sourceManifest:'docs/research/suspension-pass3/source-review-manifest.json'},
 {file:'../../../frame-pass3/continuation/frame-strip-reassemble-v1.procedure.json',component:'frame',sourceManifest:'docs/research/frame-pass3/continuation/source-review-manifest.json'},
 {file:'../../../engine-pass3/continuation/top-end-stock-reuse-v1.procedure.json',component:'engine',sourceManifest:'docs/research/engine-pass3/continuation/source-review-manifest.json'},
 {file:'../../../engine-pass4/husqvarna/engine-oil-filter-v1.procedure.json',component:'engine',sourceManifest:'docs/research/engine-pass4/husqvarna/source-review-manifest.json'},
 {file:'../../../suspension-pass4/husqvarna/fork-air-baseline-v1.procedure.json',component:'fork',sourceManifest:'docs/research/suspension-pass4/husqvarna/source-review-manifest.json'},
 {file:'../../../workshop-pass6/yamaha-completion-audit/front-wheel-bearing-renewal-v1.procedure.json',component:'frame',sourceManifest:'docs/research/workshop-pass6/yamaha-completion-audit/source-review-manifest.json'},
 {file:'../../../workshop-pass6/yamaha-rear-wheel/rear-wheel-bearings-seals-v1.procedure.json',component:'frame',sourceManifest:'docs/research/workshop-pass6/yamaha-rear-wheel/source-review-manifest.json'},
 ...['front-wheel-remove-refit-v1','rear-wheel-remove-refit-v1','steering-bearing-inspection-v1','swingarm-linkage-remove-refit-v1','clutch-release-remove-refit-v1','engine-remove-refit-v1'].map(name=>({file:`../../../frame-pass3/${name}.procedure.json`,component:name.startsWith('engine')||name.startsWith('clutch')?'engine':'frame',sourceManifest:'docs/research/frame-pass3/source-review-manifest.json'})),
 ...['transmission-bench-v1','oil-pump-bench-v1','primary-balancer-bench-v1','generator-bench-v1','crankcase-bench-v2','crankshaft-assembly-bench-v1','head-remove-refit-bench-v1','cylinder-piston-bench-v1','head-valve-inspect-reseal-bench-v1','cams-remove-bench-v1','camshaft-inspection-bench-v2','cams-install-bench-v1','shift-mechanism-bench-v1','clutch-pack-bench-v1','right-cover-bench-v1','water-pump-bench-v1'].map(name=>({file:`../../../engine-pass3/${name}.procedure.json`,component:'engine',sourceManifest:'docs/research/engine-pass3/source-review-manifest.json'}))];
const rows=files.map(({file,component,sourceManifest})=>{
 const p=JSON.parse(readFileSync(root+file,'utf8'));
 if(publicationHolds.some((hold:any)=>hold.procedure_id===p.id&&hold.status==='HELD'))throw Error(`Later source review holds this guide: ${p.id}`);
 // Mechanical progress stays bound to the original reviewed artifact; an index-only correction has its own source hash.
 const contentHash=createHash('sha256').update(JSON.stringify(p)).digest('hex');
 applyHoseRouteCorrection(p,readFileSync(root+file),hoseCorrectionBytes);
 if(p.id==='yamaha-yz450f-2022-top-end-bike-journey-v1'){
  if(topendMetadata.status!=='APPROVED'||createHash('sha256').update(readFileSync(root+file)).digest('hex')!==topendMetadata.original_sha256||p.source.document_sha256!==topendMetadata.source_sha256||topendMetadata.patches.length!==2)throw Error('Topend metadata correction original mismatch');
  const [preflight,note]=topendMetadata.patches;
  if(p.prerequisites[4]!==preflight.before||p.source.review_note!==note.before)throw Error('Topend metadata field mismatch');
  p.prerequisites[4]=preflight.after;
  p.source.review_note=note.after;
  p.source.metadata_correction_sha256=topendMetadataHash;
 }

 if(p.id==='yamaha-2022-yz450f-lower-engine-bench-v1'){
  if(lowerCorrection.status!=='APPROVED'||createHash('sha256').update(readFileSync(root+file)).digest('hex')!==lowerCorrection.original_sha256||p.source.document_sha256!==lowerCorrection.source_sha256||lowerCorrection.patches.length!==2)throw Error('Lower filter correction does not match reviewed original');
  for(const patch of lowerCorrection.patches){
   const step=p.steps.find((s:any)=>s.id===patch.step_id);
   if(patch.field!=='instruction'||!step||step.instruction!==patch.before)throw Error('Lower filter correction step mismatch');
   step.instruction=patch.after;
  }
  p.source.filter_oring_correction_sha256=lowerCorrectionHash;
 }

 const toolEntry=toolCorrection.procedures.find((entry:any)=>entry.procedure_id===p.id);
 if(toolEntry){
  if(toolCorrection.status!=='APPROVED'||toolCorrection.correction_kind!=='TOOL_PREFLIGHT_ONLY'||toolCorrection.mechanical_step_changes.length||toolCorrection.document_sha256!==p.source.document_sha256||toolEntry.artifact_sha256!==createHash('sha256').update(readFileSync(root+file)).digest('hex')||p.required_tools.filter((t:any)=>t.name===toolCorrection.old_tool_name).length!==1)throw Error('Tool preflight correction does not match reviewed source');
  p.required_tools=p.required_tools.map((t:any)=>t.name===toolCorrection.old_tool_name?{...t,name:toolCorrection.new_tool_name}:t);
  p.source.tool_preflight_correction_sha256=createHash('sha256').update(toolCorrectionBytes).digest('hex');
 }
 if(p.status!=='SOURCE_REVIEWED_BOUNDED_PROCEDURE'||p.source.review_status!=='APPROVED'||p.scope_confirmed!==true)throw Error('Unreviewed procedure');
 if(!Array.isArray(p.source.printed_pages)||!p.source.printed_pages.length)throw Error(`Missing printed source locators: ${file}`);
 for(const key of ['entry_state','exit_state','affected_components'])if(p[key]!==undefined&&(!Array.isArray(p[key])||p[key].some((v:any)=>typeof v!=='string')))throw Error(`Invalid ${key}: ${file}`);
 for(const dependency of p.operation_dependencies??[]){
  if(createHash('sha256').update(readFileSync(dependency.artifact.replace(/\\/g,'/'))).digest('hex')!==dependency.sha256)throw Error(`Inlined operation source changed: ${file}`);
 }
 if(file.startsWith('../workshop-pass2/')){const manifest=JSON.parse(readFileSync(yamahaPass2+(file.endsWith('valve-adjustment-v3.procedure.json')?'branch-review-manifest.json':'checkpoint-manifest-final.json'),'utf8'));const artifact=manifest.artifacts.find((a:any)=>a.path===basename(file));if(!artifact||createHash('sha256').update(readFileSync(root+file)).digest('hex')!==artifact.sha256)throw Error('Yamaha procedure review hash mismatch');}
 if(p.id==='yamaha-2026-yz450f-valve-clearance-inspection-v1'){
  const bytes=readFileSync(yamahaPass2+'page-index-correction.json'),correction=JSON.parse(bytes.toString());
  if(correction.correction_kind!=='SOURCE_PAGE_INDEX_ONLY'||correction.mechanical_step_changes.length||correction.document_sha256!==p.source.document_sha256||correction.original_artifact_sha256!==createHash('sha256').update(readFileSync(root+file)).digest('hex'))throw Error('Source-page correction does not match frozen original');
  p.source={...p.source,pdf_pages:[...new Set([...p.source.pdf_pages,...correction.add_source_pdf_pages])].sort((a:any,b:any)=>a-b),printed_pages:[...new Set([...p.source.printed_pages,...correction.add_source_printed_pages])],page_index_correction_sha256:createHash('sha256').update(bytes).digest('hex')};
 }
 if(p.id==='yamaha-2026-yz450f-stock-chain-renewal-v1'){
  const bytes=readFileSync('docs/research/workshop-pass7/yamaha-drive/printed-page-correction.json'),correction=JSON.parse(bytes.toString());
  if(correction.correction_kind!=='PRINTED_PAGE_LABEL_ONLY'||correction.review_status!=='APPROVED'||correction.mechanical_step_changes.length||correction.document_sha256!==p.source.document_sha256||correction.original_artifact_sha256!==createHash('sha256').update(readFileSync(root+file)).digest('hex'))throw Error('Printed-page correction does not match frozen original');
  p.source={...p.source,printed_pages:p.source.printed_pages.map((label:string)=>label===correction.incorrect_printed_label?correction.correct_printed_label:label),printed_page_correction_sha256:createHash('sha256').update(bytes).digest('hex')};
 }
 const discovery=JSON.parse(readFileSync(root+'../2026-yz450f-discovery-20260913.json','utf8'));
 let doc=discovery.documents.find((d:any)=>d.document_sha256===p.source.document_sha256);
 if(sourceManifest){const manifest=JSON.parse(readFileSync(sourceManifest,'utf8'));if(manifest.author_review_manifest&&createHash('sha256').update(readFileSync(manifest.author_review_manifest.path)).digest('hex')!==manifest.author_review_manifest.sha256)throw Error('Author review manifest changed');const matching=manifest.artifacts.filter((a:any)=>basename(a.path)===basename(file)&&a.kind==='procedure'&&['manufacturer','model','model_year','variant','region'].every(k=>a.target?.[k]===p.target[k]));if(matching.length!==1)throw Error(`Ambiguous or missing exact procedure review: ${file}`);const artifact=matching[0];const source=manifest.sources.find((s:any)=>s.id===artifact?.source_id);if(!artifact||createHash('sha256').update(readFileSync(root+file)).digest('hex')!==artifact.sha256||!source||source.sha256!==p.source.document_sha256||source.url!==p.source.source_url||!['manufacturer','model','model_year','variant','region'].every(k=>artifact.target[k]===p.target[k]))throw Error(`Procedure review manifest mismatch: ${file}`);doc=source;}
 if(!doc||createHash('sha256').update(readFileSync(doc.local_pdf_path)).digest('hex')!==p.source.document_sha256)throw Error('Procedure source changed');
 const supplemental=(p.supplemental_sources??[]).map((s:any)=>{
  if(!s.attribution||!s.scope||!/^https:\/\//.test(s.url)||createHash('sha256').update(readFileSync(s.local_path)).digest('hex')!==s.sha256)throw Error(`Supplemental procedure source changed: ${file}`);
  return {url:s.url,sha256:s.sha256,attribution:s.attribution,scope:s.scope};
 });
 // Research may retain titled citations; both clients consume the same verified URL list.
 for(const step of p.steps)step.source_links=(step.source_links??[]).map((link:any)=>{
  const url=typeof link==='string'?link:link.url;
  if(typeof url!=='string'||!url.startsWith('https://'))throw Error('Invalid procedure source link');
  return url;
 });
 const seen=new Set();for(const s of p.steps){if(!s.source_pdf_pages?.length||!s.verification?.length||s.source_pdf_pages.some((page:number)=>!p.source.pdf_pages.includes(page))||s.depends_on.some((id:string)=>!seen.has(id))||seen.has(s.id)||s.diagram_reference_required&&!s.source_links?.length)throw Error('Incomplete procedure dependencies or source pages');seen.add(s.id);}
 return {id:p.id,component,affected_components:p.affected_components??[],entry_state:p.entry_state??[],exit_state:p.exit_state??[],supplemental_sources:supplemental,content_sha256:contentHash,target:p.target,title:p.title,completeness:p.completeness.startsWith('Complete bounded bench operation')?'Bench service. Begin with the engine or component prepared as described below. Separate access and reassembly work is needed to finish the bike.':p.completeness,source:p.source,excluded:p.applicability.excluded,required_tools:p.required_tools.map((t:any)=>({name:t.name,size:toolDetails(t)})),required_parts:(p.required_parts??[]).map((x:any)=>{const name=typeof x==='string'?x:x.name;if(typeof name!=='string'||!name.trim())throw Error('Missing required-part name: '+p.id);return {name,purpose:typeof x==='string'?'':x.purpose??''};}),prerequisites:p.prerequisites??p.preflight,critical_stop_conditions:p.critical_stop_conditions,steps:p.steps.map((s:any)=>({...s,verification:Array.isArray(s.verification)?s.verification:[s.verification],record_required:s.record_required??['record','measure','assess','height-clamps','plate-settings'].includes(s.id),diagram_reference_required:s.diagram_reference_required??false,source_links:s.source_links??[]}))};
});
if(new Set(rows.map(p=>p.id)).size!==rows.length)throw Error('Duplicate reviewed procedure IDs');
// Repair only known legacy encoding damage for display; frozen artifacts and run hashes stay unchanged.
const display=JSON.stringify(rows,null,2).replaceAll('\u00c2\u00b7','\u00b7').replaceAll('\u00e2\u20ac\u201c','\u2013').replaceAll('\u00e2\u20ac\u201d','\u2014');
// One JSON string, not a literal: type checkers see a string instead of megabytes of nested arrays (hosted builds timed out).
writeFileSync('shared/procedure-library.ts',`// Generated only from explicitly reviewed, hash-verified procedure artifacts.\n// Stored as one JSON string so type checkers see a string, not megabytes of nested literals (hosted builds timed out).\nimport type {ReviewedProcedure} from './procedures.ts';\nexport const procedureLibrary:ReviewedProcedure[]=JSON.parse(${JSON.stringify(JSON.stringify(JSON.parse(display)))});\n`);
console.log(JSON.stringify({reviewedProcedures:rows.length}));
