import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OEM='https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf'
TOOL='https://www.motionpro.com/download/i08-0608_instructions'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):p.write_text(json.dumps(v,indent=2,ensure_ascii=False)+'\n',encoding='utf8',newline='\n')
base=ROOT/'docs/research/suspension-pass2/shock-remove-refit-v1.procedure.json'
d=json.loads(base.read_text(encoding='utf8'))
d.update(id='yamaha-yz450f-2026-shock-spring-preload-sag-v1',title='Change the stock shock spring and set measured preload and rider sag',integration_status='CANDIDATE_PENDING_ROOT_REVIEW')
d['completeness']='Complete stock sealed shock spring exchange, bike refit and measured preload/rider-sag closure. Optional springs restricted to Yamaha exact listed applications. No internal shock or eye bearing service.'
d['source']['review_status']='PENDING_INDEPENDENT_REVIEW'
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+[115,116,185,186,396,397]))
d['source']['review_note']='Yamaha115/116/185/186/396/397 rendered and visually reviewed; Motion Pro08-0608 both pages rendered. Tool technique is supplemental, not an assertion of model fit.'
d['applicability']['excluded']=['Other years/models','Aftermarket shock or spring not in exact Yamaha list','Internal shock service','Bearing/seal disassembly','Leaking or damaged shock']
d['applicability']['included']='Exact stockUS2026YZ450F shock with OEM standard or exact OEM-listed optional rear spring; eyes/gas/oil circuits remain assembled.'
d['renewal_policy']='Replacement spring identified by exact OEM part/rate and fit; retained serviceable spring guides. No new mounting seals unless separately serviced.'
d['preflight']=['Correct spring and actual compressor fit established before removing shock.','Qualified operator familiar with compressed-spring tools; inspect assembled tool against its maker instructions.','Independent swingarm support, safe fuel transfer and clean parts storage available.']
d['prerequisites']=['Record original spring identity, installed length and all damping adjusters before removal.','Stock56N/mm BR9-22212-A0; exact OEM optional52 BR9-22212-00,54 BR9-22212-10,58 BR9-22212-B0,60 BR9-22212-40 (N/mm), PDF397. Selection is based on measured setup, not inferred weight compatibility.']
d['critical_stop_conditions']=['Unsupported bike/swingarm or mismatched/incorrectly assembled compressor.','Damaged spring/retainer, shock leakage or bent rod.','Preload needed outside1.5–18.0mm or rider sag cannot reach90–100mm; select appropriate listed spring and repeat before closure.','Unlatched/leaking fuel joint or incomplete mounting closure.']
d['required_tools'] += [{'name':'Motion Pro08-0608 compressor, appropriate eye adapter and fitting pin; verify actual eye/spring fit and maker assembly before use','spec':None},{'name':'Correct preload-ring spanner, spring-length ruler, sag ruler and helper to stabilize rider/bike','spec':None}]
d['required_parts'] += [{'name':'Exact Yamaha-listed stock/optional spring, identified before installation','purpose':'Replacement based on measured setup'}]
d['affected_components']=['shock','suspension']
d['exclusions_detail']=['No shock gas/oil pressure circuit opening.','No force, rider-weight spring-rate mapping or unlisted spring fit inferred.','Physical-bike QA not performed.']
d['operation_dependencies']=[{'artifact':str(base.relative_to(ROOT)).replace('\\','/'),'sha256':sha(base),'kind':'approved_access_and_closure'}]
source={'id':'motionpro-spring-2020','url':TOOL,'local_pdf_path':'C:/Users/kylej/AppData/Local/Temp/chassis7/spring.pdf','sha256':sha(Path('C:/Users/kylej/AppData/Local/Temp/chassis7/spring.pdf')),'locators':['pages1-2 tool assembly and spring retention photographs']}
d['supplemental_sources']=[source]
d['entry_state']=['Assembled stock bike; correct replacement spring and suitable fitting compressor ready.']
d['exit_state']=['New spring seated and retained, shock refitted; actual free/installed lengths and1.5–18mm preload recorded; actual axle/fender rider sag90–100mm recorded; damping change and final fuel/mount closure recorded.']
def step(id,title,text,pages,checks,tool=False):
 return {'id':id,'title':title,'instruction':text,'source_pdf_pages':pages,'verification':checks,'record_required':True,'diagram_reference_required':True,'source_links':[{'title':'Yamaha exact spring/setup source','url':OEM+'#page='+str(pages[0])}]+([{'title':'Motion Pro compressor instructions; tool technique only','url':TOOL}] if tool else [])}
new=[]
for s in d['steps']:
 if s['id']=='prepare':s['instruction']+=' Record old spring identity, installed length and rebound/high/low compression settings before alteration.';s['record_required']=True
 if s['id']=='shock-out':s['instruction']=s['instruction'].replace('Leave the spring, preload nuts, guides, seals and bearings assembled.','Keep the mounting seals/bearings assembled; the spring is changed next.')
 if s['id']=='closeout':s['instruction']=s['instruction'].replace('this job has not serviced the shock internals or changed spring preload.','the shock internals remain unserviced. Perform the following measured sag/preload checks before declaring setup complete.')
 new.append(s)
 if s['id']=='inspect':
  new += [step('spring-unload','Measure the unloaded spring','Clean ring threads. Loosen the locknut and back off the adjusting ring until spring clearance exists, as Yamaha115 specifies. Measure and record free length. Keep the damper, gas valve and shaft untouched. Identify the lower and upper spring guides against PDF185/186 before disturbing retention.',[115,185,186],['No remaining ring preload','Free length and guide orientation recorded']),
   step('spring-remove','Release the spring with controlled support','Follow Motion Pro08-0608 photos: adjustable plates must be beneath the lower tool plate; secure its pull-rod assembly as specified. Verify actual adapter/pin fit, then lock spring plates with their6mm screws. Compress with the30mm nut only until the Yamaha lower guide can clear. Remove the unloaded guide, then release tool load gradually and remove spring/upper guide. Never open the damper to remove the spring.',[185,186],['Correct tool assembly and fitted retention','Guide unloaded before removal','Tool released before spring handled'],True),
   step('spring-install','Seat the replacement spring and guides','Record replacement part/rate and measure its free length. Inspect and restore Yamaha upper/lower guides in their original illustrated orientation. Using the compressor in reverse, fit the spring and lower retainer; verify the guide is fully located before gradually releasing tool load. Remove the tool only after the spring is securely supported by its guides.',[185,186,397],['Correct replacement and actual free length recorded','Both guides fully seated without damage'],True),
   step('initial-preload','Set a measured starting preload','Turn the clean adjusting ring to obtain installed length equal to measured free length minus7.0mm as the OEM standard starting point. One ring turn changes length1.5mm, but confirm with a ruler. Yamaha permits1.5–18.0mm preload; do not exceed this range. Tighten the locknut against the adjuster; this source does not state a locknut torque. Record free length, installed length and their difference.',[115,116,397],['Actual7.0mm starting preload recorded','Locknut secure and guides seated'])]
new += [step('sag-measure','Measure rider sag at the actual reference points','Raise the rear wheel on the stand and measure a from axle center to the triangle mark on the rear fender, using Yamaha396 picture. Lower the bike; with a helper stabilizing it and the rider astride, measure b between the same points. Record a, b and a minus b. The target is90–100mm; do not substitute a weight estimate or a different fender point.',[396],['Two actual lengths and calculated sag recorded']),
 step('sag-adjust','Adjust preload and remeasure until the setup qualifies','If sag is outside90–100mm, raise the rear wheel, loosen the locknut and alter the ring setting. Retighten the locknut, measure actual installed spring length and verify free minus installed remains1.5–18.0mm. Repeat the same a/b rider measurement after lowering. Record each change and final measurements. If the target cannot be reached within this preload range, a different listed spring and repeat of this spring-change route are required; do not record this step complete with an out-of-range result.',[115,116,396,397],['Final measured preload within1.5–18.0mm','Final actual rider sag90–100mm','Locknut secure after adjustment']),
 step('spring-damping-close','Record spring-related damping and final checks','For a softer spring Yamaha397 suggests one or two rebound clicks out; for a stiffer spring one or two clicks in, then reassess on a controlled run. Record an explicit chosen change from the original setting, or unchanged for the same rate. Never force beyond the actual adjuster range. Compression may also need later refinement; do not invent an automatic setting. Confirm smooth rear travel, secure guides/rings/mounts, no leaks and recheck sag after initial spring use.',[116,397,115],['Actual rebound setting/change recorded','Spring, guides and locknut secure','Smooth travel and all mount/fuel closures confirmed'])]
for i,s in enumerate(new):s['depends_on']=[new[i-1]['id']] if i else []
d['steps']=new
write(HERE/'shock-spring-preload-sag-v1.procedure.json',d)
m=json.loads((HERE/'source-review-manifest.json').read_text(encoding='utf8'));m['sources']=[s for s in m['sources'] if s['id']!=source['id']]+[source];write(HERE/'source-review-manifest.json',m)
