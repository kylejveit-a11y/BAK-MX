"""Kawasaki KX and Triumph TF suspension facts (owner's manuals / handbooks, official manufacturer sites) -> claims SQL.
Values the extraction flagged as uncertain (reconstructed fractions, table-column pairing, ranges not tied to a spring)
are left out. Status REVIEWED, not VERIFIED: values were read from the document text layer, not checked against page images.
Ids are stable (uuid5); inserts are ON CONFLICT DO NOTHING."""
import glob,json,os,re,uuid
HERE=os.path.dirname(os.path.abspath(__file__));NS=uuid.UUID('3d0c8b1e-7a52-4b9f-a1d4-0e6c2f9b7a11');AT='2026-10-26T00:00:00Z'
UNSURE=re.compile(r'flag|unclear|rebuilt|reconstruct|column order|not preserve|not tied|uncertain|inferred',re.I)
q=lambda s:"'"+str(s).replace("'","''")+"'";rows=[];skipped=0
for f in sorted(glob.glob(os.path.join(HERE,'*-20*.json'))):
    d=json.load(open(f));t,src=d['target'],d['source_document'];mk,m,y=t['manufacturer'],{'KX250F':'KX250','KX250FX':'KX250X','KX450F':'KX450','KX450FX':'KX450X'}.get(t['model'],t['model']),t['model_year']  # 2027 US names map to the app's model names
    app={'model':m,'region':'US','variant':'standard','model_year':y,'manufacturer':mk}
    for v in d['values']:
        conds=v.get('conditions') or []
        if any(UNSURE.search(c) for c in conds):skipped+=1;continue
        val=str(v['value']);unit=v.get('unit') or ''
        st=f"{v['joint']}: {val}{(' '+unit) if unit and unit not in val else ''}. {' '.join(conds)}".strip()
        rid=str(uuid.uuid5(NS,f"{mk}|{m}|{y}|{v['joint']}"));loc=f"{v.get('page','')}; {v['joint']}"
        ev={'id':rid,'domain':'suspension','review':{'decision':'approved','reviewed_at':AT,'reviewer_id':'BAK MX manufacturer source review (suspension pass: document text layer)','scope_checked':True,'content_checked':True,'conflicts_checked':False,'approval_reference':'docs/research/expansion/suspension-pass/build_claims.py','approved_applicability':app},
            'rights':{'basis':'factual_extraction','usage_scope':'facts_only_no_source_distribution','commercial_use_approved':True},
            'source':{'url':src['source_url'],'kind':'document','locator':loc,'retrieved_at':AT,'reviewed_content':json.dumps(v),'document_revision':src.get('document_revision','')},
            'status':'STAGED','statement':st,'has_conflict':False,'applicability':app,'conflict_references':[]}
        rows.append((rid,mk,m,y,st,src['source_url'],loc,ev))
with open(os.path.join(HERE,'claims.sql'),'w') as f:
    f.write('insert into public.claims (id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record) values\n')
    f.write(',\n'.join(f"({q(r[0])},{q(r[1])},{q(r[2])},{r[3]},'standard','US','suspension',{q(r[4])},{q(r[5])},{q(r[6])},'REVIEWED',false,{q(json.dumps(r[7]))}::jsonb)" for r in rows))
    f.write('\non conflict (id) do nothing;\n')
print(len(rows),'rows,',skipped,'skipped as uncertain')
