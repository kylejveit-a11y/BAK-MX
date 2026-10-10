import json,pathlib
P=pathlib.Path(__file__).parent
# Each tuple transcribed from the separately rendered exact-target US section.
rows={
'250-2022':('135–136',137,'34.15.8U.55','18.15.7U.55',10.5,230,7,2,39,260,477),
'250-2023':('138',139,'A360C155W406000','A360C455W408000',10.5,230,8,1.5,39,240,456.3),
'250-2024':('147–148',149,'A360C155X406000','A360C455X408000',10.5,240,8,1.5,39,240,456.3),
'250-2025':('137',139,'A360C155Y406000','A360C455Y408000',10.3,240,8,1.5,39,240,456.3),
'450-2022':('139–140',141,'34.15.8U.59','18.15.7U.59',10.7,230,7,2,42,260,477),
'450-2023':('154',156,'A360C159W406000','A360C459W408000',10.7,230,8,1.5,42,240,456.3),
'450-2024':('161',163,'A360C159X406000','A360C459X408000',10.7,240,8,1.5,42,240,456.3),
'450-2025':('148–149',152,'A360C159Y406000','A360C459Y408000',10.5,240,8,1.5,42,240,456.3)}
for key,(fp,sp,fid,sid,air,oil,pre,hsc,spring,slen,installed) in rows.items():
 meta=json.loads((P/f'manual-fc-{key}.json').read_text());facts=[];yr=int(key[-4:])
 def add(prop,joint,value,unit,page,component,conditions=[]):
  facts.append(dict(id=f'fc-{key}-suspension-{len(facts)+1}',property=prop,joint=joint,value=value,unit=unit,conditions=['OEM stock US standard component '+component]+conditions,source_url=meta['selected']['link'],locator=f'PDF page(s) {page}, US standard suspension table: {joint}',document_sha256=meta['document_sha256'],document_revision=meta['document_article']+' / '+meta['document_revision'],review_status='APPROVED',review_note='Exact US table visually reviewed, including component article number and adjacent section boundaries. EU, FX and Factory/Rockstar settings not inherited. Damping values are baseline table positions; use the linked adjustment procedure for direction/reference.'))
 add('component_identity','Front fork',fid,'part number',fp,fid)
 add('component_family','Front fork','WP XACT 5448' if yr<2024 else 'WP XACT AER','model',fp,fid)
 for prop,vs in [('compression_damping',[17,12,7]),('rebound_damping',[23,18,13])]:
  for setting,v in zip(['Comfort','Standard','Sport'],vs):add(prop,'Front fork',v,'clicks',fp,fid,[setting+' baseline'])
 add('air_pressure','Front fork',air,'bar',fp,fid)
 add('component_length','Front fork',940,'mm',fp,fid)
 for side in ['Right','Left']:add('oil_capacity',side+' fork outer assembly',oil,'ml',fp,fid,['Tolerance +10 / -50 ml','Fork oil SAE 4, 48601166S1'])
 add('oil_capacity','Right fork cartridge',370,'ml',fp,fid,['Fork oil SAE 4, 48601166S1'])
 add('grease_capacity','Left fork cartridge',5,'g',fp,fid,['Special grease 00062010053'])
 add('component_identity','Rear shock',sid,'part number',sp,sid)
 add('component_family','Rear shock','WP XACT 5750' if yr<2024 else 'WP XACT LDS','model',sp,sid)
 for prop,vs,unit in [('low_speed_compression',[17,15,13],'clicks'),('high_speed_compression',[hsc+.5,hsc,hsc-.5],'turns'),('rebound_damping',[17,15,13],'clicks')]:
  for setting,v in zip(['Comfort','Standard','Sport'],vs):add(prop,'Rear shock',v,unit,sp,sid,[setting+' baseline'])
 add('spring_preload','Rear shock spring',pre,'mm',sp,sid)
 for i,weight in enumerate(['65–75 kg','75–85 kg','85–95 kg']):add('spring_rate','Rear shock spring',spring+3*i,'N/mm',sp,sid,['Rider weight '+weight])
 for prop,joint,v,unit in [('spring_length','Rear shock spring',slen,'mm'),('gas_pressure','Rear shock',10,'bar'),('static_sag','Rear suspension',35,'mm'),('rider_sag','Rear suspension',105,'mm'),('installed_length','Rear shock',installed,'mm')]:add(prop,joint,v,unit,sp,sid)
 obj=dict(target=meta['target'],source_metadata=meta,assemblies=[],parts=[],facts=facts,mappings=[],gaps=['Internal suspension service torque and complete procedure verification remain separate.'],catalog_complete=False,scope_confirmed=True)
 (P/f'fc-{key}-suspension.json').write_text(json.dumps(obj,indent=2)+'\n')
print(sum(len(json.loads(f.read_text())['facts']) for f in P.glob('*-suspension.json')))
