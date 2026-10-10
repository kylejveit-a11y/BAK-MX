from build_engine3 import *
import copy
updates={}
d=json.loads((ROOT/'camshaft-inspection-bench-v1.procedure.json').read_text())
d['id']='yamaha-2026-yz450f-camshaft-inspection-bench-v2'
s=next(s for s in d['steps'] if s['id']=='plastigauge')
s['instruction']=s['instruction'].replace('Install dowels/caps, tightening','Apply engine oil to cam-cap bolt threads/contact faces as specified for this joint; keep the Plastigauge measurement surfaces prepared according to its supplied instructions. Install dowels/caps, tightening')
s['source_pdf_pages'].append(58);s['source_links'].append(URL+'#page=58')
d['required_parts'].append(dict(name='Engine oil for cam-cap bolt threads/contact faces'))
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+[58]));d['source']['printed_pages']=[printed(p) for p in d['source']['pdf_pages']]
d['revision_note']='v2 adds the exact torque-table lubrication condition to the Plastigauge fixture bolts; v1 retained unchanged.'
save('camshaft-inspection-bench-v2.procedure.json',d)
updates['camshaft-inspection-bench-v1.procedure.json']='camshaft-inspection-bench-v2.procedure.json'
d=json.loads((ROOT/'crankcase-bench-v1.procedure.json').read_text())
d['id']='yamaha-2026-yz450f-crankcase-bench-v2'
s=next(s for s in d['steps'] if s['id']=='oil-parts')
s['instruction']+=' Tighten both oil-strainer bolts10Nm with LOCTITE; this is separate from the nozzle1 bolt.'
s['source_pdf_pages']+= [57,276];s['source_links'] +=[URL+'#page=57',URL+'#page=276']
s['verification'].append('Both oil-strainer bolts10Nm with locking agent recorded.')
s=step('lower-chain','Restore the lower timing-chain components','Fit the timing chain onto the crank sprocket, restore the exhaust-side guide and its stopper plate in the illustrated arrangement, and tighten the stopper-plate bolt10Nm with LOCTITE. Secure the chain above the case for later cylinder/head installation. Do not leave this closure implicit after case assembly.',[57,276],'Chain engaged/secured; guide and stopper installed;10Nm recorded.',True,True)
s['depends_on']=['case-torque'];d['steps'].append(s)
d['source']['pdf_pages']=sorted(set(d['source']['pdf_pages']+[57,276]));d['source']['printed_pages']=[printed(p) for p in d['source']['pdf_pages']]
d['exit_state']=['Cases closed around inspected crank/transmission; lower chain/guide restored and secured; external assemblies/top end remain off.']
d['revision_note']='v2 explicitly closes oil-strainer fastener torque and lower-chain/stopper restoration; v1 retained unchanged.'
save('crankcase-bench-v2.procedure.json',d)
updates['crankcase-bench-v1.procedure.json']='crankcase-bench-v2.procedure.json'
save('supersessions-v1.json',dict(schema_version=1,reason='Final dependency-condition audit',replacements=updates))
manifest()
m=json.loads((ROOT/'source-review-manifest.json').read_text())
m['artifacts']=[a for a in m['artifacts'] if a['path'] not in updates]
m['superseded_artifacts']=[dict(path=p,replaced_by=q,sha256=hashlib.sha256((ROOT/p).read_bytes()).hexdigest()) for p,q in updates.items()]
(ROOT/'source-review-manifest.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
