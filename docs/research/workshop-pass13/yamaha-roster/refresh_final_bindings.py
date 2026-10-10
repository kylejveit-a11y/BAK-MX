import json,hashlib,re
from pathlib import Path
import fitz
B=Path(__file__).resolve().parent;R=B.parents[3]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=B/'yamaha-model-year-matrix.json';d=json.loads(p.read_text(encoding='utf8'));lookup={(x['model'],x['model_year']):x for x in d['rows']}
libp=R/'shared/procedure-library.ts';text=libp.read_text(encoding='utf8');lib=json.loads(text[text.index('['):text.rindex(']')+1]);live={x['id']:x for x in lib}
sources={};reviewed={};candidates={}
for mp in (R/'docs/research').rglob('*runtime*manifest*.json'):
 try:m=json.loads(mp.read_text(encoding='utf8'))
 except Exception:continue
 if m.get('status')!='APPROVED':continue
 for s in m.get('sources',[]):
  if s.get('sha256'):sources[s['sha256']]=s
 for a in m.get('artifacts',[]):
  if a.get('kind')!='procedure':continue
  ap=R/a['path'] if (R/a['path']).exists() else mp.parent/a['path']
  if not ap.exists() or sha(ap)!=a.get('sha256'):continue
  x=json.loads(ap.read_text(encoding='utf8'));t=x.get('target',{});key=(t.get('model'),t.get('model_year'))
  if key not in lookup or t.get('region')!='US' or t.get('variant')!='standard':continue
  # Include current library-bound procedures and this pass's newly reviewed manifests; exclude old superseded copies.
  if x['id'] not in live and 'workshop-pass13' not in ap.as_posix():continue
  if x['id'] in live and live[x['id']].get('source',{}).get('document_sha256')!=x['source'].get('document_sha256'):continue
  reviewed.setdefault(key,{})[x['id']]={'path':ap.relative_to(R).as_posix(),'sha256':a['sha256'],'id':x['id'],'title':x.get('title'),'component':x.get('component'),'step_count':len(x['steps']),'runtime_manifest':mp.relative_to(R).as_posix(),'runtime_manifest_sha256':sha(mp),'runtime_snapshot_included':x['id'] in live,'source':x['source']}
for ap in (R/'docs/research/workshop-pass13').rglob('*.procedure.json'):
 x=json.loads(ap.read_text(encoding='utf8'));t=x.get('target',{});key=(t.get('model'),t.get('model_year'))
 if key not in lookup or x.get('publication_status')=='APPROVED':continue
 candidates.setdefault(key,[]).append({'path':ap.relative_to(R).as_posix(),'sha256':sha(ap),'id':x.get('id'),'status':x.get('publication_status',x.get('status')),'scope':x.get('title')})
for key,row in lookup.items():
 row['source_approved_artifacts']=list(reviewed.get(key,{}).values());row['unpublished_candidates']=candidates.get(key,[])
 for a in row['source_approved_artifacts']:
  source=a.pop('source');s=sources.get(source.get('document_sha256'),{});local=s.get('local_pdf_path',s.get('local_path'))
  if not local or not Path(local).exists():continue
  assert sha(Path(local))==source['document_sha256'];book=fitz.open(local)
  cp=next((n+1 for n in range(min(6,len(book))) if 'U.S.A.' in book[n].get_text()),None)
  assert cp is not None
  evidence={'url':source['source_url'],'document_sha256':source['document_sha256'],'pdf_pages':[1,cp],'scope':'Exact US manual bound by independently source-reviewed target procedure; cover and US copyright checked. No service equivalence inferred.'}
  if evidence not in row['identity_evidence']:row['identity_evidence'].append(evidence)
  row['identity_status']='CONFIRMED_EXACT_US_MANUAL_IDENTITY'
 row['runtime_source_bindings']=[{'procedure_id':x['id'],'content_sha256':x['content_sha256'],'source_url':x['source']['source_url'],'document_sha256':x['source']['document_sha256'],'declared_scope':x.get('completeness'),'step_count':len(x['steps'])} for x in lib if (x.get('target',{}).get('model'),x.get('target',{}).get('model_year'))==key]
 row['runtime_integration']={'snapshot_path':'shared/procedure-library.ts','snapshot_sha256':sha(libp),'procedure_ids':[x['id'] for x in lib if (x.get('target',{}).get('model'),x.get('target',{}).get('model_year'))==key]}
 n=len(row['source_approved_artifacts']);row['gaps']=['No full-bike qualification: engine, chassis, fork and shock completeness remain separate; setup or prepared-bench procedures do not close access, renewal, refit and commissioning unless their declared scope includes it.','Physical workshop validation and product release readiness are not established by this source inventory.']
 if n==0:row['gaps'].insert(0,'Exact current-year service manual and executable procedures remain unrecovered or unapproved; no adjacent-year inheritance.')
 if key[0] in ['YZ250FX','YZ450FX','WR250F','WR450F'] and n:
  row['gaps'].insert(0,'Published scope here is stock setup only. Internal suspension rebuild, engine overhaul and complete chassis access/reassembly still require exact-source authoring and review.')
  if key[1]==2020:row['gaps'].insert(1,'Sag measurement only: preload adjustment needs separate source-required rear-frame removal/refit and locknut service.')
 if key[0]=='YZ450F' and key[1] in range(2022,2027):row['gaps'].insert(0,'Existing broader workshop routes retain documented exact-year source holds and external-service dependencies; this inventory does not supersede those operational gap records.')
 if row['unpublished_candidates']:row['gaps'].append('Unpublished candidates listed separately are not released procedures and do not satisfy completion.')
 if not row['identity_evidence']:row['gaps'].insert(0,'Exact US model-year identity remains unverified.')
d['summary']={'rows':len(lookup),'confirmed':sum(x['identity_status'].startswith('CONFIRMED') for x in lookup.values()),'unknown':sum(x['identity_status'].startswith('UNKNOWN') for x in lookup.values()),'targets_with_runtime_guides':sum(bool(x['runtime_integration']['procedure_ids']) for x in lookup.values()),'full_rebuild_qualified':0}
d['runtime_snapshot']={'path':'shared/procedure-library.ts','sha256':sha(libp),'guide_count':len(lib),'note':'Point-in-time integration snapshot; not a future claim. Unpublished candidates remain separate.'}
wr(p,d);print(d['summary']);print('approved artifact bindings',sum(len(x['source_approved_artifacts']) for x in lookup.values()))
