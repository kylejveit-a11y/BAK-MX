"""Build an auditable exterior reference manifest from the existing OEM inventory."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
target = dict(manufacturer='KTM', model='450 SX-F', model_year=2025, variant='standard', region='US')
data = json.loads((ROOT/'docs/research/parts/inventory.json').read_text())
groups = [a for a in data['assemblies'] if a['target'] == target]
parts = [p for p in data['parts'] if p['target'] == target]
mapping = {
 'frame':['FRAME'], 'engine':['ENGINE CASE','CLUTCH COVER','CYLINDER','CYLINDER HEAD','IGNITION SYSTEM'],
 'front-wheel':['FRONT WHEEL','FRONT BRAKE CALIPER'], 'rear-wheel':['REAR WHEEL','REAR BRAKE CALIPER'],
 'fork':['FRONT FORK, TRIPLE CLAMP'], 'shock':['SHOCK ABSORBER'], 'swingarm':['SWING ARM','PRO LEVER LINKING'],
 'exhaust':['EXHAUST SYSTEM'], 'plastics':['MASK, FENDERS','DECAL','AIR FILTER'], 'seat':['TANK, SEAT'],
 'controls':['HANDLEBAR, CONTROLS','FRONT BRAKE CONTROL','CLUTCH CONTROL'], 'cooling':['COOLING SYSTEM'],
 'drivetrain':['REAR WHEEL','TRANSMISSION II - COUNTERSHAFT']}
components=[]
for name, labels in mapping.items():
 assemblies=[a for a in groups if a['name'] in labels]
 assert len(assemblies)==len(labels), (name,labels)
 ids={a['id'] for a in assemblies}
 components.append(dict(id=name,geometry_status='ESTIMATED_NOT_VERIFIED',scope='VISIBLE_EXTERIOR_ONLY',
  assemblies=[dict(id=a['id'],name=a['name'],source=a['catalog_evidence']) for a in assemblies],
  reference_parts=[dict(occurrence_id=p['id'],part_number=p['part_number'],callout=p['callout'],description=p['description']) for p in parts if p['assembly_id'] in ids],
  note='Assembly membership is a modeling reference; not every catalog row is visible or installed.'))
spec=json.loads((ROOT/'docs/research/parts/ktm-owner-other-specs.json').read_text())
anchors=[dict(f,source=spec['source']) for f in spec['facts'] if f['id'] in ['ktm25-owner-wheelbase','ktm25-owner-seat-height','ktm25-owner-steering-angle','ktm25-owner-ground-clearance']]
manifest=dict(schema_version=1,target=target,status='BLOCKOUT_NOT_OEM_VERIFIED',retrieved_at='2026-10-16',
 source_inventory='docs/research/parts/inventory.json',catalog_groups=len(groups),catalog_occurrences=len(parts),
 dimensions=anchors,components=components,
 public_visual_references=[dict(view=view,url='https://azwecdnepstoragewebsiteuploads.azureedge.net/'+file,usage='REFERENCE_ONLY_NOT_REDISTRIBUTED') for view,file in [
 ('right','PHO_BIKE_90_RE_MY25-KTM-450-SX-F-90-right-Studio_%23SALL_%23AEPI_%23V1.png'),
 ('left','PHO_BIKE_90_LI_MY25-KTM-450-SX-F-90-left-Studio_%23SALL_%23AEPI_%23V1.png'),
 ('front-right','PHO_BIKE_90_REVO_MY25-KTM-450-SX-F-90-front-right-Studio_%23SALL_%23AEPI_%23V1.png')]],
 remaining=['Photographic contour comparison','Engine casting shape','OEM graphics authored with appropriate rights','Radiator and cable routing','Native integration and physical-device performance'])
out=ROOT/'public/bike-builder/ktm-450-sxf-2025.references.json';out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(components)} component groups mapped; {len(groups)} catalog assemblies; {len(parts)} occurrences')
