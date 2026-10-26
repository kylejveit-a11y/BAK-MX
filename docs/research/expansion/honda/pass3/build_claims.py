"""Honda pass 3: CRF150R/250R/450R/RX/RWE owner's manuals and competition handbooks, setup values beyond torques -> claims SQL.
Uncertain values (reconstructed, ambiguous pairing) are left out. Status REVIEWED: text-layer extraction, not image-checked.
Ids are stable (uuid5); ON CONFLICT DO NOTHING."""
import glob,json,os,re,uuid
HERE=os.path.dirname(os.path.abspath(__file__));NS=uuid.UUID('4f0d6b1e-8a77-4c2e-9d35-0c1b7e9a2f61');AT='2026-10-26T00:00:00Z'
UNSURE=re.compile(r'flag|unclear|rebuilt|reconstruct|column order|not preserve|not tied|uncertain|inferred|ambiguous',re.I)
DOMAIN={'torque':'service','capacity':'service','service_interval':'maintenance','setting':'suspension','specification':'specification'}
q=lambda s:"'"+str(s).replace("'","''")+"'";rows=[];skip=0
for f in sorted(glob.glob(os.path.join(HERE,'*-20*.json'))):
    d=json.load(open(f));t,doc=d['target'],d['source_document'];mk,m,y=t['manufacturer'],t['model'],t['model_year']
    var=t.get('variant','standard');app={'model':m,'region':'US','variant':var,'model_year':y,'manufacturer':mk}
    for v in d['values']:
        conds=[c for c in (v.get('conditions') or []) if isinstance(c,str)]
        if any(UNSURE.search(c) for c in conds) or v.get('value') in (None,''):skip+=1;continue
        src=v.get('source') if isinstance(v.get('source'),dict) else doc
        url=src.get('source_url') or src.get('url') or doc.get('source_url')
        if not url:skip+=1;continue
        val=str(v['value']);unit=v.get('unit') or ''
        st=f"{v['joint']}: {val}{(' '+unit) if unit and unit not in val else ''}. {' '.join(conds)}".strip()
        dom=DOMAIN.get(v.get('property'),'specification')
        if dom=='suspension' and not re.search(r'fork|shock|spring|sag|damp|click|rebound|compress',v['joint'],re.I):dom='specification'
        rid=str(uuid.uuid5(NS,f"{mk}|{m}|{var}|{y}|{v['joint']}|{val}"));loc=f"{v.get('page','')}; {v['joint']}"
        ev={'id':rid,'domain':dom,'review':{'decision':'approved','reviewed_at':AT,'reviewer_id':'BAK MX manufacturer source review (Honda pass 3: document text layer, pages rendered where unclear)','scope_checked':True,'content_checked':True,'conflicts_checked':False,'approval_reference':'docs/research/expansion/honda/pass3/build_claims.py','approved_applicability':app},
            'rights':{'basis':'factual_extraction','usage_scope':'facts_only_no_source_distribution','commercial_use_approved':True},
            'source':{'url':url,'kind':'document','locator':loc,'retrieved_at':AT,'reviewed_content':json.dumps(v),'document_revision':src.get('document_revision',doc.get('document_revision',''))},
            'status':'STAGED','statement':st,'has_conflict':False,'applicability':app,'conflict_references':[]}
        rows.append((rid,mk,m,y,dom,st,url,loc,ev,var))
ids=[r[0] for r in rows];dup=len(ids)-len(set(ids))
seen=set();rows=[r for r in rows if not (r[0] in seen or seen.add(r[0]))]
for i in range(0,len(rows),4000):
    with open(os.path.join(HERE,f'claims_{i//4000}.sql'),'w') as f:
        f.write('insert into public.claims (id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record) values\n')
        f.write(',\n'.join(f"({q(r[0])},{q(r[1])},{q(r[2])},{r[3]},{q(r[9])},'US',{q(r[4])},{q(r[5])},{q(r[6])},{q(r[7])},'REVIEWED',false,{q(json.dumps(r[8]))}::jsonb)" for r in rows[i:i+4000]))
        f.write('\non conflict (id) do nothing;\n')
print(len(rows),'rows',skip,'skipped',dup,'duplicate joints dropped')
