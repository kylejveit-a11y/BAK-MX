"""2026 Kawasaki KX (US) published facts -> SQL insert for public.claims (same shape as the 2020-2025 Kawasaki rows).

usage: python3 build_claims.py > out.sql
Reads specs-2026.json beside this file (values reviewed in REVIEW.md). Spec-table rows come from the 99888 specifications
documents; damper settings, spring rates, preload nut position, fork oil level, fork height and tire pressure from the 2026
owner's manuals. Ids are stable (uuid5), so re-running produces the same rows."""
import json,os,re,uuid
here=os.path.dirname(os.path.abspath(__file__))
d=json.load(open(os.path.join(here,'specs-2026.json')))
SHA=d['document_sha256']
NS=uuid.UUID('0b9e1b9e-6c2a-4b8e-9a1e-2026c0ffee26')
REV={'99888-0041-01':"Specifications document 99888-0041-01 (served as revision 99888-0041-02; 2026 KX250 / KX250X, KX252E / KX252F)",
     '99888-0048-01':"Specifications document 99888-0048-01 (2026 KX450 / KX450X, KX450M / KX450N)",
     '99814-0119':"Owner's manual 99814-0119 (KX250 / KX250X 2026); eBook page text and page images from Kawasaki's online manual viewer",
     '99814-0121':"Owner's manual 99814-0121 (KX450 / KX450X 2026); eBook page text and page images from Kawasaki's online manual viewer"}
SPEC_COND="Applies to the US model named, stock OEM configuration; the specifications document says specifications are subject to change without notice."
STD_COND="Factory standard adjuster setting from the US owner's manual, counted counterclockwise from the adjuster fully seated (turned fully clockwise). Use the adjuster within the usable range the same manual prints; turning beyond it changes nothing and can damage the mechanism. Stock OEM suspension only."
def num(s):
    m=re.match(r'\s*(\d+(?:\s\d/\d)?(?:\.\d+)?|\d/\d)',s);return m.group(1) if m else None
rows=[]
def add(x,joint,value,unit,cond,src=None):
    src=src or x['source_code'];src='99888-0041-01' if src=='99888-0041-02' else src;model=x['model']
    statement=f"{joint}: {value}{(' '+unit) if unit else ''}. {cond}".replace('  ',' ')
    locator=f"{x['page_or_section']}; {joint}"
    rid=str(uuid.uuid5(NS,f"{model}|2026|{joint}"))
    app={'model':model,'region':'US','variant':'standard','model_year':2026,'manufacturer':'Kawasaki'}
    url=f"https://pws.ktivs.net/dispeBook?file={src}&lang_code=EN"
    ev={'id':rid,'domain':'service','review':{'decision':'approved','reviewed_at':'2026-10-16T00:00:00Z','reviewer_id':'BAK MX manufacturer source review (document text and page-image check)','scope_checked':True,'content_checked':True,'conflicts_checked':True,
        'approval_reference':f"docs/research/expansion/kawasaki/my2026/REVIEW.md; {src}; values read from Kawasaki's specifications document and owner's manual and checked against the page images as described there; no same-scope value on file to conflict.",
        'approved_applicability':app,'approved_document_sha256':SHA[src]},
        'rights':{'basis':'factual_extraction','reference':'Existing BAK MX US factual-extraction policy; docs/research/expansion/kawasaki/my2026/REVIEW.md','usage_scope':'facts_only_no_source_distribution','commercial_use_approved':True},
        'source':{'url':url,'kind':'document','locator':locator,'retrieved_at':'2026-10-16T00:00:00Z','document_sha256':SHA[src],
                  'reviewed_content':json.dumps({'unit':unit or None,'joint':joint,'value':value,'property':'specification','conditions':[cond]}),'document_revision':REV[src]},
        'status':'VERIFIED','statement':statement,'has_conflict':False,'applicability':app,'conflict_references':[]}
    rows.append((rid,model,joint,statement,url,locator,ev))
SPEC_MAP={'Overall Length':'Dimensions / Overall Length','Overall Width':'Dimensions / Overall Width','Overall Height':'Dimensions / Overall Height','Wheelbase':'Dimensions / Wheelbase',
 'Road Clearance':'Dimensions / Road Clearance','Curb Mass':'Dimensions / Curb Mass','Fuel Tank Capacity':'Dimensions / Fuel Tank Capacity','Type':'Engine / Type','Bore × Stroke':'Engine / Bore x Stroke',
 'Displacement':'Engine / Displacement','Compression Ratio':'Engine / Compression Ratio','Fuel System':'Engine / Fuel System','Starting System':'Engine / Starting System','Ignition System':'Engine / Ignition System',
 'Ignition Timing':'Engine / Ignition Timing','Lubrication System':'Engine / Lubrication System','Spark Plug':'Engine / Spark Plug','Spark Plug Terminal':'Engine / Spark Plug Terminal',
 'Transmission Type':'Transmission / Transmission Type','Clutch Type':'Transmission / Clutch Type','Driving System':'Transmission / Driving System','Primary Reduction Ratio':'Transmission / Primary Reduction Ratio',
 'Final Reduction Ratio':'Transmission / Final Reduction Ratio','Overall Drive Ratio':'Transmission / Overall Drive Ratio','Engine Oil Type':'Transmission / Engine Oil / Type','Engine Oil Viscosity':'Transmission / Engine Oil / Viscosity',
 'Engine Oil Capacity':'Transmission / Engine Oil / Capacity','Frame Type':'Frame / Type','Steering Angle':'Frame / Steering Angle','Caster':'Frame / Caster','Trail':'Frame / Trail',
 'Front tire size/type':'Frame / Tire Size/Type / Front','Rear tire size/type':'Frame / Tire Size/Type / Rear','Front suspension type':'Frame / Suspension / Front','Rear suspension type':'Frame / Suspension / Rear',
 'Front Suspension Travel':'Frame / Front Suspension Travel','Rear Wheel Travel':'Frame / Rear Wheel Travel','Front Fork Oil Type':'Frame / Front Fork Oil / Type',
 'Front Fork Oil Amount: Cylinder Unit':'Frame / Front Fork Oil / Amount / Cylinder Unit','Front Fork Oil Amount: Outer Tube':'Frame / Front Fork Oil / Amount / Outer Tube',
 'Front Fork Oil Amount: Outer Tube (KX252ET)':'Frame / Front Fork Oil / Amount / Outer Tube','Battery':'Electrical Equipment / Battery'}
for x in d['values']:
    it,val,unit=x['item'],str(x['value']).strip(),(x.get('unit') or '').strip()
    if x['source_code'].startswith('99888'):
        if it in SPEC_MAP: add(x,SPEC_MAP[it],val,unit,SPEC_COND)
        elif it.startswith('Gear Ratio '): add(x,'Transmission / Gear Ratio / '+it.split()[-1],val,unit,SPEC_COND)
        elif it=='Rim size front / rear':
            f,r=[s.strip() for s in val.split('/')];add(x,'Frame / Rim Size / Front',f,'',SPEC_COND);add(x,'Frame / Rim Size / Rear',r,'',SPEC_COND)
        elif it=='Brake Type front / rear':
            f,r=[s.strip() for s in val.split('/')];add(x,'Brakes / Type / Front',f,'',SPEC_COND);add(x,'Brakes / Type / Rear',r,'',SPEC_COND)
        continue
    full=val+' '+unit
    if it=='Fork compression damping standard setting': add(x,'Front suspension / Compression damping / Standard setting',num(full),'click',STD_COND)
    elif it=='Fork rebound damping standard setting': add(x,'Front suspension / Rebound damping / Standard setting',num(full),'click',STD_COND)
    elif it=='Shock rebound damping standard setting': add(x,'Rear suspension / Rebound damping / Standard setting',num(full),'click',STD_COND)
    elif it=='Shock low-speed compression standard setting': add(x,'Rear suspension / Low speed compression damping / Standard setting',num(full),'click',STD_COND)
    elif it=='Shock high-speed compression standard setting': add(x,'Rear suspension / High speed compression damping / Standard setting',num(full),'turn',STD_COND.replace('counterclockwise from','counterclockwise (turns out) from'))
    elif it=='Fork spring rate (standard)': add(x,'Front suspension / Fork spring / Standard spring rate',val,unit,"Standard fork spring from the US owner's manual's standard fork oil amount and fork spring table. Stock OEM suspension only; optional softer and harder springs change the oil amount.")
    elif it=='Rear shock spring rate (standard)': add(x,'Rear suspension / Shock spring / Standard spring rate',val,unit,"Standard rear shock spring from the US owner's manual's spring preload table. Stock OEM suspension only.")
    elif it.startswith('Standard spring preload adjusting nut position'): add(x,'Rear suspension / Spring preload / Standard adjusting nut position',val,unit,"Measured from the center of the upper rear shock absorber pivot point, per the US owner's manual; the manual gives the adjustable range for each spring. Kawasaki states the preload as this nut position, not as a sag figure. Stock OEM suspension only.")
    elif it.startswith('Cylinder unit oil level'): add(x,'Front suspension / Cylinder unit oil level',val,unit,"With the piston rod fully stretched, measured from the top surface of the cylinder unit, per the US owner's manual fork oil change procedure. Stock OEM suspension only.")
    elif it=='Standard fork height': add(x,'Front suspension / Fork height / Standard',val,unit,"Standard fork height in the clamps from the US owner's manual fork height adjustment section. Stock OEM configuration only.")
    elif it.startswith('Tire air pressure adjustable range'):
        q=re.search(r'\(([^)]*psi)\)',x.get('quote',''));psi=f" ({q.group(1)})" if q else ''
        add(x,'Wheels / Tire air pressure / Adjustable range',val,(unit or 'kPa')+psi,"One range for front and rear, checked cold before riding, per the US owner's manual; lower within it for wet, muddy, sandy or slippery tracks, higher for pebbly or hard tracks.")
if os.environ.get('JSON_OUT'):
    json.dump([{'id':r[0],'model':r[1],'statement':r[3],'source_url':r[4],'source_locator':r[5],'evidence_record':r[6]} for r in rows],open(os.environ['JSON_OUT'],'w'),ensure_ascii=False)
def q(s):return "'"+str(s).replace("'","''")+"'"
print('insert into public.claims (id,manufacturer,model,model_year,variant,region,domain,statement,source_url,source_locator,status,has_conflict,evidence_record,property) values')
print(',\n'.join(f"({q(r[0])},'Kawasaki',{q(r[1])},2026,'standard','US','service',{q(r[3])},{q(r[4])},{q(r[5])},'VERIFIED',false,{q(json.dumps(r[6],ensure_ascii=False))}::jsonb,'specification')" for r in rows))
print('on conflict (id) do nothing;')
import sys;from collections import Counter;print('-- rows',len(rows),dict(Counter(r[1] for r in rows)),file=sys.stderr)
