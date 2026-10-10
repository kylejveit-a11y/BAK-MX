import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const path='docs/research/expansion/secondary/secondary-evidence.json';
const bytes=readFileSync(path),data=JSON.parse(bytes.toString('utf8'));
const rows=data.records.filter((r:any)=>r.approved_for_runtime===true&&r.runtime_use==='ATTRIBUTED_REFERENCE_ONLY').map((r:any)=>{
 const source=data.sources[r.source_id];if(!source||source.url!==r.source_url||!/^https:\/\//.test(r.source_url))throw Error('Unbound secondary source');
 return {id:r.id,scope:r.scope,title:r.scope.manufacturer?`${r.scope.model_year} ${r.scope.manufacturer} ${r.scope.model} — ${r.author_attribution} setup reference`:`${r.author_attribution} — ${r.scope.component}`,url:r.source_url,attribution:r.author_attribution,kind:r.claim_kind,limitations:r.conditions};
});
writeFileSync('shared/reference-library.ts',`// Generated metadata only; original numerical values deliberately stay in reviewed research.\n// Source SHA256 ${createHash('sha256').update(bytes).digest('hex')}\nexport const referenceLibrary = ${JSON.stringify(rows,null,2)};\n`);
console.log(JSON.stringify({metadataReferences:rows.length}));
