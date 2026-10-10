import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OEM='https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf'
TOOL='https://www.motionpro.com/download/instructions-08-0294-deluxe-suspension-bearing-service-tool'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf8',newline='\n')
base=ROOT/'docs/research/suspension-pass2/shock-remove-refit-v1.procedure.json'
d=json.loads(base.read_text(encoding='utf8'))
d.update(id='yamaha-yz450f-2026-shock-eye-bearings-renewal-v1',title='Renew sealed shock mounting-eye bearings and seals',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+[25,185,186,188,190]))
d['source']['review_note']='OEM185/186/190 shock-eye exploded and cross-section diagrams visually reviewed. Entire damper remains sealed and spring/preload unchanged. Motion Pro provides standard supported bearing-removal technique only; OEM expressly overrides generic grease-on-outer-race advice.'
d['applicability']['excluded'].remove('Bearing/seal disassembly')
d['applicability']['included']='Exact stock US2026 YZ450F sealed shock; upper mount bushing/stopper and lower bearing/bushing renewal, both eyes resealed. No damper body, gas valve or preload opening.'
d.setdefault('prerequisites',[])
d['prerequisites']+=['Verify new OEM-equivalent stock eye components and actual mandrel/receiver fit before removal. Do not transfer tool fit from another model.','Support the mounting eye locally; never transmit pressing load through the shock rod or pressure body.']
d['required_tools']+=[{'name':'Correct-fitting bearing removal/installation mandrels and receiver; Motion Pro08-0294 technique where adapters fit','spec':None},{'name':'Stopper-ring tools, protected local eye support, dimensional inspection tool for OEM a clearance','spec':None}]
d['required_parts']+=[{'name':'Upper bushing, new stopper ring, two new O-rings and two new dust seals','purpose':'OEM upper eye stack; general OEM25 new circlip rule'},{'name':'Lower bearing and bushing, two new dust seals; correct serviceable or replacement collars','purpose':'Lower eye renewal without damper opening'}]
d['operation_dependencies']=[{'artifact':str(base.relative_to(ROOT)).replace('\\','/'),'sha256':sha(base),'kind':'approved_access_and_closure'}]
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'))
d['supplemental_sources']=[s for s in m['sources'] if s['id']=='motionpro-linkage-2017']
d['entry_state']=['Assembled exact stock bike; sealed undamaged shock; matching new eye components and fitting tools prepared.']
d['exit_state']=['Both shock mounting-eye bearing stacks renewed and resealed; unchanged spring/preload and sealed damper refitted; fuel, body, mount torque and rear movement checks recorded.']
def step(id,title,text,pages,checks,tool=False):
 return {'id':id,'title':title,'instruction':text,'source_pdf_pages':pages,'verification':checks,'record_required':True,'diagram_reference_required':True,'source_links':[{'title':'Yamaha shock mounting-eye diagram','url':OEM+'#page='+str(pages[0])}]+([{'title':'Motion Pro supported bearing tool technique only','url':TOOL}] if tool else [])}
new=[]
for s in d['steps']:
 if s['id']=='shock-out':s['instruction']=s['instruction'].replace('Leave the spring, preload nuts, guides, seals and bearings assembled.','Leave the spring, preload nuts and guides assembled; mounting eyes are renewed in the next steps.')
 if s['id']=='lubricate':s['instruction']='Clean the upper/lower shock bolts and apply molybdenum-disulfide grease to their circumferences and threads. Confirm completed eye stacks remain seated and sealed. Do not grease the bearing outer race or its press-fit bore.'
 if s['id']=='closeout':s['instruction']+=' Compress/release the rear suspension and record smooth motion, secure eyes without free play, and clearance throughout travel.'
 new.append(s)
 if s['id']=='inspect':
  new += [step('eye-stack','Record and expose the two mount stacks','Photograph Yamaha PDF186 upper and lower stack orientations. Remove each pair of collars and dust seals; remove the upper O-rings. Identify the upper stopper ring and remove it before pressing the upper bushing. Lower eye has its separate bushing and bearing. Keep each eye supported locally and all spring/pressure components untouched.',[186,190,25],['Upper/lower stacks identified separately','Upper stopper removed before bushing extraction','Spring, rod and pressure body not loaded']),
   step('eye-extract','Remove worn eye bearing components','Use fitting mandrels and a centered receiver as in Motion Pro08-0294 figures1-2/5 to remove the upper bushing and lower bearing/bushing without stressing the shock rod or body. Verify the extraction path is unobstructed. Clean the empty seats and inspect for damage. A damaged mounting eye needs assembly repair/replacement beyond this operation; do not enlarge or stake the seat.',[186,188,190],['Fitting local support recorded','No bore damage, retained fragments or obstructions'],True),
   step('upper-eye-in','Install and retain upper bushing','Press the upper bushing squarely by its outer race until its stopper-ring groove is exposed, as Yamaha PDF190 specifies. Install a new correct stopper ring fully in the groove. Push the bushing back until it contacts the ring. Lubricate the two new O-rings with lithium-soap grease, and restore the upper seals and collars in PDF186 order and orientation.',[186,190,25],['Stopper seated fully','Bushing returned into contact with stopper','Two new O-rings and two new seals correctly installed']),
   step('lower-eye-in','Renew lower bearing and seal stack','Install the new lower bearing/bushing and correct collars to the exact PDF186/190 section. Apply molybdenum-disulfide grease to the lower bearing and dust seals, but keep the bearing outer race dry: Yamaha warns greasing this press fit wears the shock seating surface. Fit two new dust seals with lips inward. Measure each source-labelled a dimension at the collar/seal cross-section: at least0.3mm. This is not an invented bearing insertion depth. Record both sides and smooth collar movement.',[186,190],['Outer race and press-fit seat kept dry','Both seal lips inward','Both a measurements at least0.3mm at source locations','Correct bearing/bushing/collars complete'])]
for i,s in enumerate(new):s['depends_on']=[new[i-1]['id']] if i else []
d['steps']=new
write(HERE/'shock-eye-bearings-renewal-v1.procedure.json',d)
m['artifacts']=[]
for p in HERE.glob('*.procedure.json'):
 v=json.loads(p.read_text(encoding='utf8'));m['artifacts'].append({'path':p.name,'kind':'procedure','sha256':sha(p),'source_id':'yamaha-yz450f-2026-oem','target':v['target'],'step_count':len(v['steps'])})
write(HERE/'source-review-manifest.json',m)
