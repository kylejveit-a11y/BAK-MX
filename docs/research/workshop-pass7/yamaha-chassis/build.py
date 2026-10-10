import copy, hashlib, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
TEMP = Path('C:/Users/kylej/AppData/Local/Temp/chassis7')
OEM = 'https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf'
STEM = 'https://www.motionpro.com/download/i08-0544-instructions-v001-2025'
RACE = 'https://www.motionpro.com/download/instruction-08-0669-steering-bearing-installer'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v): p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf8',newline='\n')
base = ROOT/'docs/research/frame-pass3/steering-bearing-inspection-v1.procedure.json'
d = json.loads(base.read_text(encoding='utf8'))
d['id'] = 'yamaha-yz450f-2026-steering-bearings-races-renewal-v1'
d['title'] = 'Renew steering bearings and races, then restore steering and front end'
d['integration_status'] = 'CANDIDATE_PENDING_ROOT_REVIEW'
d['source']['review_status'] = 'PENDING_INDEPENDENT_REVIEW'
d['source']['review_note'] = 'OEM pages181-184 visually checked; OEM bike-level access/closure inherited by exact artifact hash. Motion Pro tool instruction photographs independently reviewed. No dimensional tool compatibility inferred.'
d['applicability']['excluded'].remove('Pressed steering bearing/race replacement')
d['applicability']['included'] = 'Exact stock US2026 standard YZ450F; renewal of both steering bearings with their matched races and dust sealing. Tool fit is checked against actual parts before removal.'
d['prerequisites'] += ['Both correct stock replacement bearing/race sets and dust seal available; verify against actual assemblies before destructive removal.', 'Motion Pro08-0544 driver must clear cage and load only fitted inner ring;08-0669 must fit each head race and pass through this frame. Inspect actual fit; model-specific tool compatibility is not asserted.']
d['required_tools'] += [{'name':'Motion Pro08-0544 stem tool with correct driver/adapter, soft mallet, block support; follow linked tool instructions','spec':None},{'name':'Motion Pro08-0669 head race installer,14mm/24mm wrenches; confirm adapter fits actual race','spec':None},{'name':'Long rod and hammer for OEM head-race removal; chisel for OEM lower-race removal; eye protection','spec':None}]
d['required_parts'] += [{'name':'Both steering bearings and matching races, stock exact application','purpose':'OEM requires bearing and race renewal as a set'},{'name':'Correct lower dust seal','purpose':'Renew during lower bearing replacement; establish correct stack before fitting bearing'}]
d['operation_dependencies'] = [{'artifact':str(base.relative_to(ROOT)).replace('\\','/'),'sha256':sha(base),'kind':'approved_access_and_closure'}]
d['supplemental_sources'] = [{'id':'motionpro-stem-2025','url':STEM,'sha256':sha(TEMP/'stem.pdf'),'local_pdf_path':str(TEMP/'stem.pdf'),'locators':['page1, installation steps6-10 and photographs6,8,9,10']},{'id':'motionpro-race-2022','url':RACE,'sha256':sha(TEMP/'race.pdf'),'local_pdf_path':str(TEMP/'race.pdf'),'locators':['page1, steps1-9 and photographs']}]
d['entry_state'] = ['Assembled stock bike; engine/rear wheel unchanged; both new matched steering sets and verified fitting tools available.']
d['exit_state'] = ['Both steering bearing/race sets renewed; original intact controls, forks, brake and wheel refitted; steering preload, alignment, brake and fasteners recorded.']
def step(id,title,instruction,pages,checks,link=None,record=False):
    return {'id':id,'title':title,'instruction':instruction,'source_pdf_pages':pages,'verification':checks,'record_required':record,'diagram_reference_required':True,'source_links':[{'title':'Yamaha exact assembly diagram','url':OEM+'#page='+str(pages[0])}]+([{'title':'Motion Pro tool instructions (technique only)','url':link}] if link else [])}
steps=[]
for s in d['steps']:
    if s['id']=='stem-out':
        s['instruction']='Support the lower bracket. Remove the ring nut using the steering-nut wrench, then lower the stem and retain the upper bearing and race cover. Photograph the lower seal and bearing stack and both head race orientations before disturbing them.'
        s['record_required']=True
    if s['id']=='steering-inspect':
        s['instruction']='Clean and inspect the exposed steering seats, stem and upper/lower brackets. Record damage, pitting, cracks or bending. Replace structurally damaged parts before continuing; do not repair a damaged seat by forcing a new race into it.'
    steps.append(s)
    if s['id']=='steering-inspect':
        steps += [
          step('old-races-out','Remove the old matched bearing sets','Following Yamaha PDF182 illustrations, remove each head-pipe race with the long rod and hammer, and remove the lower bracket bearing race with the chisel and hammer. Keep the stem and frame protected. Discard the removed bearing/race sets. Clean the exposed seats and inspect for damage before installing replacements.',[181,182],['Both old head races and lower bearing removed without seat/stem damage','New bearings and races retained as matched sets'],record=True),
          step('head-races-in','Install both new head races','Use Motion Pro08-0669 page1 photographs for assembly. Clean the seats; test each new race on its driver. Fit tapered plate, washer and greased threaded rod with all nut threads engaged. Position the correctly oriented race/driver, pass the rod through, engage the locking plate and hand-snug. Draw in with24mm wrench, holding rod with14mm if needed. Watch alignment throughout; stop at the fully seated shoulder when resistance increases. Release and remove the tool; repeat for the other race. Unexpected resistance before seating requires inspection, not extra force.',[181,182,183],['Both race orientations match Yamaha diagram','Both races aligned and fully seated; tool fit and observed seat condition recorded'],RACE,True),
          step('lower-bearing-in','Install the lower seal and bearing','Follow Motion Pro08-0544 page1 installation photographs. Clean stem and bracket seat. Restore the correct new dust seal before the bearing. Apply Yamaha lithium-soap grease to seal lip and bearing inner circumference. Select driver contacting only the inner race, clear of cage; use the HF adapter if required. Support the bracket underside on a protective block. Remove the tool puller bolt and use a soft mallet to seat the new bearing. Inspect full seating and intact seal/cage; grease the bearing.',[182,183],['Correct seal stack installed before bearing','Driver loaded inner race only','Full bearing seating and undamaged seal/cage recorded'],STEM,True)
        ]
for i,s in enumerate(steps): s['depends_on']=[steps[i-1]['id']] if i else []
d['steps']=steps
write(HERE/'steering-bearings-races-renewal-v1.procedure.json',d)
sources=[{'id':'yamaha-yz450f-2026-oem','url':OEM,'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/D03-2819U-10_02.pdf','sha256':d['source']['document_sha256']}]+d['supplemental_sources']
manifest={'schema_version':1,'id':'yamaha-chassis-pass7','reviewed_at':'2026-09-13','database_writes':False,'sources':sources,'artifacts':[]}
for p in HERE.glob('*.procedure.json'):
    v=json.loads(p.read_text(encoding='utf8'));manifest['artifacts'].append({'path':p.name,'kind':'procedure','sha256':sha(p),'source_id':'yamaha-yz450f-2026-oem','target':v['target'],'step_count':len(v['steps'])})
write(HERE/'source-review-manifest.json',manifest)
