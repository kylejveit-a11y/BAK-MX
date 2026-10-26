"""springs.json -> claims SQL (fork and shock spring rates from Yamaha owner's service manuals).
One statement per standard rate and one listing Yamaha's optional rates (front with part numbers). Ids are stable
(uuid5), inserts are ON CONFLICT DO NOTHING. Bike-years already holding a spring-rate claim are skipped by the loader."""
import json,os,uuid
HERE=os.path.dirname(os.path.abspath(__file__))
NS=uuid.UUID('9b1f6a42-3c55-4e0e-8f7a-55d0a4b2e1c7');AT='2026-10-26T00:00:00Z'
REV='BAK MX manufacturer source review (springs pass: column-cropped text layer; YZ450F 2025 rear table checked against the page image)'
REF='docs/research/expansion/yamaha/springs/build_claims.py'
q=lambda s:"'"+str(s).replace("'","''")+"'"
rows=[]
for r in json.load(open(os.path.join(HERE,'springs.json'))):
    url=f"https://library.ymcapps.net/library/om/contents/pdf/10/{r['code']}_02.pdf";m,y=r['model'],r['model_year']
    def add(joint,value,unit,conds,page):
        rid=str(uuid.uuid5(NS,f'Yamaha|{m}|{y}|{joint}'));app={'model':m,'region':'US','variant':'standard','model_year':y,'manufacturer':'Yamaha'}
        st=f"{joint}: {value}{(' '+unit) if unit else ''}. {' '.join(conds)}".strip();loc=f"PDF page {page}; {joint}"
        rc={'unit':unit,'joint':joint,'value':value,'property':'setting','conditions':conds}
        ev={'id':rid,'domain':'suspension','review':{'decision':'approved','reviewed_at':AT,'reviewer_id':REV,'scope_checked':True,'content_checked':True,'conflicts_checked':True,'approval_reference':f'{REF}; {r["code"]}; SHA-256 matches the document already approved for this bike-year','approved_applicability':app,'approved_document_sha256':r['sha256']},
            'rights':{'basis':'factual_extraction','reference':'Existing BAK MX US factual-extraction policy','usage_scope':'facts_only_no_source_distribution','commercial_use_approved':True},
            'source':{'url':url,'kind':'document','locator':loc,'retrieved_at':AT,'document_sha256':r['sha256'],'reviewed_content':json.dumps(rc),'document_revision':r['code']},
            'status':'STAGED','statement':st,'has_conflict':False,'applicability':app,'conflict_references':[]}
        rows.append((rid,m,y,st,url,loc,ev))
    if r.get('front'):
        f=r['front'];add('Front fork spring / Standard spring rate',f['std_rate_n_mm'],'N/mm',['Stock fork spring as delivered; optional rates are listed separately.'],f['pdf_page'])
        if f['options']:add('Front fork spring / Optional spring rates (Yamaha part numbers)',', '.join(f"{o['rate']} ({o['part_number']})" for o in sorted(f['options'],key=lambda o:o['rate'])),'N/mm',['Yamaha optional springs; after a change, reset rebound and compression as the manual describes.'],f['pdf_page'])
    if r.get('rear'):
        b=r['rear'];add('Rear shock spring / Standard spring rate',b['std_rate_n_mm'],'N/mm',['Stock shock spring as delivered; set race sag after any spring change.'],b['pdf_page'])
        if len(b['options'])>1:add('Rear shock spring / Optional spring rates',', '.join(str(o['rate']).rstrip('0').rstrip('.') for o in b['options']),'N/mm',['Yamaha optional springs; the spring colour mark identifies the rate.'],b['pdf_page'])
assert len({r[0] for r in rows})==len(rows)
with open(os.path.join(HERE,'claims.sql'),'w') as f:
    f.write('insert into public.claims (id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record) values\n')
    f.write(',\n'.join(f"({q(r[0])},'Yamaha',{q(r[1])},{r[2]},'standard','US','suspension',{q(r[3])},{q(r[4])},{q(r[5])},'VERIFIED',false,{q(json.dumps(r[6]))}::jsonb)" for r in rows))
    f.write('\non conflict (id) do nothing;\n')
print(len(rows),'rows')
