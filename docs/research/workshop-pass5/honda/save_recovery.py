import hashlib,json
from pathlib import Path
p=Path(__file__).parent
arts=[]
for name in ['valve-inspection-candidate-v1.procedure.json','piston-cylinder-candidate-v1.procedure.json']:
    raw=(p/name).read_bytes(); d=json.loads(raw)
    seen=set()
    for s in d['steps']:
        assert s['id'] not in seen
        assert set(s['depends_on'])<=seen
        assert set(s['source_pdf_pages'])<=set(d['source']['pdf_pages'])
        seen.add(s['id'])
    arts.append(dict(path=name,procedure_id=d['id'],sha256=hashlib.sha256(raw).hexdigest(),step_count=len(d['steps']),status=d['status'],target=d['target']))
m=dict(schema_version=1,status='RESEARCH_CHECKPOINT_NO_RUNTIME_APPROVAL',source_hash_provenance='Prior frozen Honda capture only; current official browser view visually checked but byte hash unconfirmed.',artifacts=arts,validation='PASS unique steps, dependency order and page containment; not a mechanical or release approval.',pending=['Current-byte verification','Independent candidate source/composition review','Full top-end metrology technique','Post-rebuild first-start and break-in closure','Top-end repeat-adjustment branch runtime representation'])
(p/'recovery-manifest-v1.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
print(json.dumps(m,indent=2))
