import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
OEM='https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf'
TOOL='https://www.motionpro.com/download/instructions-08-0294-deluxe-suspension-bearing-service-tool'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf8',newline='\n')
base=ROOT/'docs/research/frame-pass3/swingarm-linkage-remove-refit-v1.procedure.json'
d=json.loads(base.read_text(encoding='utf8'))
d['id']='yamaha-yz450f-2026-swingarm-linkage-bearings-renewal-v1'
d['title']='Renew swingarm and linkage bearings, then restore the rear assembly'
d['integration_status']='CANDIDATE_PENDING_ROOT_REVIEW'
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+[25,187,189,193,194,195]))
d['source']['review_note']='Exact Yamaha renewal cross-sections visually reviewed at PDF187,189,193,195; Motion Pro tool instruction photographs reviewed on all three pages. Tool examples are different-model technique, never installation-depth authority.'
d['applicability']['included']='Exact stock2026 US standard YZ450F; all four swingarm pivot bearings, matched bushes, thrust bearings and seals; six linkage bearings with matching collars and seals. Shock eye bearings and sealed shock internals remain unchanged.'
d['applicability']['excluded']=['Other years or aftermarket linkage/swingarm','Shock eye bearing or bushing renewal','Shock internal service','Damaged or oversized bearing seats','Frame or swingarm structural repair','Replacement chain or non-stock master-link joint']
d['prerequisites']+=['Confirm replacement parts match actual stock assemblies before removal. Verify bearing tool mandrels, receiver and puller fit each joint; no08-0294 model fit is asserted.', 'Engine separately supported while pivot removed; shock remains supported by unchanged upper mount.']
d['required_tools']+=[{'name':'Correct-fitting Motion Pro08-0294 suspension bearing tool and illustrated adapters; appropriate wrenches/vise support','spec':None},{'name':'Depth measuring tool and straight reference suitable for OEM cross-section dimensions','spec':None}]
d['required_parts']+=[{'name':'Four swingarm bearings, two matched bushes, two thrust bearings, four new seals; inspect/replace two collars as needed','purpose':'Renew complete stock pivot stack; bearing/bushing matched sets perOEM194'},{'name':'Four relay-arm bearings, two matched collars and four new seals; inspect both four-washer groups','purpose':'OEM187/189 relay arm stack'},{'name':'Two connecting-arm bearings, one matched collar and two new seals','purpose':'OEM187/189 connecting arm stack'}]
d['operation_dependencies']=[{'artifact':str(base.relative_to(ROOT)).replace('\\','/'),'sha256':sha(base),'kind':'approved_access_and_closure'}]
tool={'id':'motionpro-linkage-2017','url':TOOL,'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/chassis7/linkage.pdf','sha256':sha(Path('C:/Users/kylej/AppData/Local/Temp/chassis7/linkage.pdf')),'locators':['pages1-3;figures1-10;tool technique only,2006CRF450R example']}
d['supplemental_sources']=[tool]
d['entry_state']=['Assembled stock bike with verified replacement parts and fitting bearing tools; engine supported independently before pivot removal.']
d['exit_state']=['Swingarm pivot and connecting/relay arm bearing stacks renewed and depths recorded; wheel, chain, closed brake and linkage refitted; rear suspension movement and all closure checks recorded.']
def step(id,title,text,pages,checks,tool=False):
 return {'id':id,'title':title,'instruction':text,'source_pdf_pages':pages,'verification':checks,'record_required':True,'diagram_reference_required':True,'source_links':[{'title':'Yamaha exact bearing stack and depths','url':OEM+'#page='+str(pages[0])}]+([{'title':'Motion Pro tool technique; Yamaha depths control','url':TOOL}] if tool else [])}
new=[]
for s in d['steps']:
 if s['id']=='shock-lower':s['instruction']=s['instruction'].replace('Keep the linkage bearings and seals assembled in this inspection-only operation.','Identify each linkage assembly for the following renewal steps.')
 if s['id']=='arm-inspect':s['instruction']='Inspect swingarm and linkage arms for cracks, bending and damaged bearing bores. Roll the pivot on a flat surface to check straightness; never straighten a bent pivot. Record condition of bushes, collars, thrust bearings and washers. Replace damaged structural parts before installing new bearings. Bearing/bushing and linkage bearing/collar pairs are renewed as sets.'
 if s['id']=='grease-arm':s['instruction']=s['instruction'].replace('Return the original intact bearing stacks and arm.','Confirm the renewed bearing stacks and collars are correctly installed, then return the arm.')
 if s['id']=='link-refit':s['instruction']=s['instruction'].replace('Restore every retained collar and washer in its original joint.','Restore each correct new matched collar and inspected washer in its identified joint.')
 new.append(s)
 if s['id']=='arm-inspect':
  new += [
   step('stack-record','Identify every bearing and seal stack','Photograph both swingarm ends and each linkage joint against Yamaha PDF187/193. Remove collars, seals, thrust bearings, bushes and washers in illustrated order, retaining identified serviceable washers separately. The swingarm has four pivot bearings; the relay arm has four and connecting arm two. Do not mix washer groups or press against a retained seal, collar or bush.',[187,193],['All stacks mapped to source diagram','Four swingarm and six linkage bearings identified']),
   step('bearings-out','Remove bearings with supported fitting tools','Use Motion Pro08-0294 figures1-2/5 for accessible bearings: select a fitting driver, center the receiver and draw each bearing into the cup. Where opposite-side access is unavailable, figures7-8 show the fully engaged blind remover with greased puller threads/washer. First remove obstructions and check for hidden retainers. Stop if the receiver cannot support the housing squarely. Clean and inspect every empty bore.',[187,193,194],['Tool fit/support and unobstructed removal path checked','Bores undamaged; no retained debris'],True),
   step('swingarm-bearings-in','Install the four pivot bearings to Yamaha depths','Pack bearings and lubricate the pivot bearing stack with molybdenum-disulfide grease. Motion Pro figures3-4 show a matching mandrel supporting needles during installation. Yamaha PDF194 requires outer bearings first, then inner bearings to the illustrated depths measured from inside. Use PDF193/195 cross-sections: inner bearing position dimension b is6.5mm. Record both sides. Yamaha depths control; do not substitute the CRF example tool-bottoming endpoint.',[193,194,195],['Four bearings installed outer then inner','Both6.5mm reference dimensions measured at exact OEM section','No needle loss, cocking or damage'],True),
   step('swingarm-seals','Complete pivot bushes, thrust bearings and seals','Restore the two correct new matched bushes, two thrust bearings, four new oil seals and inspected collars in Yamaha PDF193/195 order. Lubricate with molybdenum-disulfide grease. Measure the four illustrated seal recesses a:0–0.5mm from their respective bore faces. Use the cross-section for lip orientation and the general seal markings guidance; do not use the6.5mm bearing depth for a seal. Record each seal depth and stack.',[193,194,195,25],['Two bushes/two thrust bearings/four seals accounted for','Four a depths0–0.5mm recorded','Seals undamaged and correctly oriented']),
   step('relay-renew','Renew both relay-arm bearing pairs','Install the four relay bearings using fitting mandrels and supported housing. Yamaha PDF187/189 specifies0mm bearing depth at the illustrated end faces. Lubricate bearings, washers, seals and collars with molybdenum-disulfide grease. Restore inner washers, four new seals, matched collars and outer washers in the exact exploded/cross-section order. Record bearing flushness and both four-washer groups; the bearing0mm dimension is not a generic seal-depth instruction.',[187,189],['Four relay bearings at source0mm faces','Four inner and four outer washers correctly grouped','Four new seals and two matched collars installed']),
   step('connecting-renew','Renew connecting-arm bearings','Install the two connecting-arm bearings at the0mm bearing locations illustrated on Yamaha PDF187/189. Use molybdenum-disulfide grease at the exploded-diagram marked bearing/seal/collar surfaces. Restore two new seals and the matched collar with source orientation. Record both bearing positions and smooth collar movement; do not infer a seal depth from the bearing dimension.',[187,189],['Two connecting bearings flush at specified faces','Two new seals and matched collar installed','No binding or displaced seal'])
  ]
for i,s in enumerate(new):s['depends_on']=[new[i-1]['id']] if i else []
d['steps']=new
write(HERE/'swingarm-linkage-bearings-renewal-v1.procedure.json',d)
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'));m['sources']=[s for s in m['sources'] if s['id']!=tool['id']]+[tool]
m['artifacts']=[]
for p in HERE.glob('*.procedure.json'):
 v=json.loads(p.read_text(encoding='utf8'));m['artifacts'].append({'path':p.name,'kind':'procedure','sha256':sha(p),'source_id':'yamaha-yz450f-2026-oem','target':v['target'],'step_count':len(v['steps'])})
write(HERE/'source-review-manifest.json',m)
