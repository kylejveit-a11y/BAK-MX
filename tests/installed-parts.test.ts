import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {readInstalled,writeInstalled,systemsRecorded,MAX_PARTS,partSystemKeys} from '../shared/installed-parts.ts';
import {installedPartsContext,withoutBuildSheet} from '../server/installed-parts-context.ts';
import {researchedParts} from '../shared/aftermarket-research.ts';
import {buildChecks} from '../shared/garage-fields.ts';
import {isRosterBike} from '../shared/garage-models.ts';

test('build sheet cleans stored values and never marks a system both fitted and stock',()=>{
 const v=readInstalled({installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT',p:'045695'},{s:'nope',b:'x',n:'y'},{s:'clutch',b:'',n:''},null,{s:'tuning',b:'X',n:'Map',r:'bad id!'}],stock_systems:['exhaust','brakes','brakes','bogus'],parts_notes:{suspension:'  revalved  ',bogus:'x'}});
 assert.deepEqual(v.parts.map(p=>p.s),['exhaust','tuning']);
 assert.equal(v.parts[1].r,undefined);
 assert.deepEqual(v.stock,['brakes']);
 assert.deepEqual(v.notes,{suspension:'revalved'});
 assert.equal(systemsRecorded({installed_parts:v.parts,stock_systems:v.stock}),3);
});
test('a full build sheet fits the stored configuration limit',()=>{
 const long='x'.repeat(200),parts=Array.from({length:MAX_PARTS+10},(_,i)=>({s:partSystemKeys[i%partSystemKeys.length],b:long,n:long,p:long,r:'abc-'+i}));
 const notes=Object.fromEntries(partSystemKeys.map(k=>[k,long+long]));
 const c=writeInstalled({geared_weight_lb:180},{parts,stock:[],notes});
 assert.equal((c.installed_parts as unknown[]).length,MAX_PARTS);
 assert.ok(JSON.stringify(c).length<24000,'configuration stays under the database limit');
 assert.equal(c.geared_weight_lb,180);
});
test('Ask BAK gets fitted parts with research notes, confirmed stock and unknown systems',()=>{
 const [id,r]=Object.entries(researchedParts).find(([,p])=>p.what_it_changes)!;
 const ctx=installedPartsContext({installed_parts:[{s:'exhaust',b:r.brand,n:r.product,r:id},{s:'controls',b:'Renthal',n:'Fatbar',x:true}],stock_systems:['brakes']})!;
 assert.equal(ctx.fitted[0].research?.what_it_changes,r.what_it_changes);
 assert.equal(ctx.fitted[1].source,'typed by the rider');
 assert.deepEqual(ctx.confirmed_stock,['Brakes']);
 assert.ok(ctx.not_recorded.includes('Suspension')&&!ctx.not_recorded.includes('Exhaust'));
 assert.equal(installedPartsContext({}),null);
 assert.deepEqual(withoutBuildSheet({installed_parts:[],stock_systems:[],parts_notes:{},exhaust:'FMF'}),{exhaust:'FMF'});
});
test('the build sheet counts toward the build profile',()=>{
 const checks=buildChecks({engine_hours:null,configuration:{installed_parts:[{s:'exhaust',b:'FMF',n:'4.1'}],stock_systems:['gearing']}});
 assert.equal(checks.find(c=>c.id==='engine')!.done,true);
 assert.equal(checks.find(c=>c.id==='drivetrain')!.done,true);
 assert.equal(checks.find(c=>c.id==='parts')!.done,false);
});
test('published parts lists decode to roster bikes and carry no internal paths',()=>{
 const dir=new URL('../public/parts-catalog/',import.meta.url);
 for(const f of readdirSync(dir)){
  const text=readFileSync(new URL(f,dir),'utf8'),c=JSON.parse(text);
  assert.equal(c.v,2);assert.deepEqual(c.systems,partSystemKeys,f);
  assert.doesNotMatch(text,/docs\/research|\.json"|scripts\//,f);
  for(const [key,deltas] of Object.entries(c.bikes as Record<string,number[]>)){
   const [make,model,year]=key.split('|');assert.ok(isRosterBike(make,model,Number(year)),key);
   let i=0;for(const d of deltas){i+=d;assert.ok(c.items[i],key);}
  }
  for(const it of c.items){assert.ok(it.n&&typeof it.b==='number');if(it.r)assert.ok(researchedParts[it.r],it.r);}
 }
});
test('rider-facing parts notes name no tester or magazine and show no internal references',()=>{
 for(const f of readdirSync(new URL('../public/parts-catalog/',import.meta.url))){
  const c=JSON.parse(readFileSync(new URL('../public/parts-catalog/'+f,import.meta.url),'utf8'));
  const text=JSON.stringify(c.items.map((i:any)=>[i.n,i.w,i.c,i.t,i.u]));
  assert.doesNotMatch(text,/Keefer|Motocross Action|\bMXA\b|Vital MX|Dirt Bike Test|Bones Bacon/,f);
  assert.doesNotMatch(text,/pass-?\d item|\.json|docs\//,f);
 }
});

import {fuelSystem} from '../shared/fuel-system.ts';
import {workProviders} from '../shared/work-providers.ts';
import {typeOf} from '../shared/part-types.ts';
import {buildEngineeringInput} from '../server/engineering.ts';

test('fuel system: four-strokes and newer two-strokes are injected, older two-strokes and YZ two-strokes are carbureted',()=>{
 assert.equal(fuelSystem('KTM','450 SX-F',2024),'injected');
 assert.equal(fuelSystem('Honda','CRF450R',2020),'injected');
 assert.equal(fuelSystem('Kawasaki','KX250X',2023),'injected');
 assert.equal(fuelSystem('Triumph','TF 250-X',2025),'injected');
 assert.equal(fuelSystem('KTM','300 SX',2024),'injected');
 assert.equal(fuelSystem('KTM','250 SX',2022),'carburetor');
 assert.equal(fuelSystem('Husqvarna','TC 250',2023),'injected');
 assert.equal(fuelSystem('GasGas','MC 250',2023),'carburetor');
 assert.equal(fuelSystem('GasGas','MC 125',2024),'injected');
 assert.equal(fuelSystem('Yamaha','YZ250',2026),'carburetor');
 assert.equal(fuelSystem('Yamaha','YZ250',2027),null);
 assert.equal(fuelSystem('KTM','85 SX 17/14',2025),'carburetor');
});

test('parts catalogs: Vortex sprockets sort as gearing, carb parts are flagged, specialty research is present',()=>{
 const c=JSON.parse(readFileSync('public/parts-catalog/ktm-family.json','utf8'));
 const named=(re:RegExp)=>c.items.filter((i:{b:number;n:string})=>re.test(c.brands[i.b]+' '+i.n));
 for(const i of named(/vortex.*sprocket|sprocket.*vortex/i))assert.equal(c.systems[i.s],'gearing',i.n);
 for(const i of named(/\b(main|pilot) jet\b/i))assert.equal(i.k,'c',i.n);
 assert.ok(named(/XACT PRO 6500/).some((i:{r?:string})=>i.r),'WP 6500 kit');
 assert.ok(named(/^REP Suspension/).length>=3,'REP');
 assert.ok(named(/^Luxon MX/).length>=3,'Luxon');
 assert.ok(named(/^Twisted Development/).length>=1,'Twisted Development');
 assert.equal(typeOf('gearing','Vortex Rear Sprocket'),'Rear sprocket');
 assert.equal(typeOf('tuning','Vortex Rear Sprocket'),null);
});

test('work providers: revalve shops and ECU tuners, never named after a tester, with research notes the server can read',()=>{
 assert.ok(workProviders.some(p=>p.work==='ecu'&&p.brand==='Twisted Development'));
 assert.ok(workProviders.some(p=>p.work==='suspension'&&p.brand==='REP Suspension'));
 for(const p of workProviders){assert.ok(researchedParts[p.id],p.id);assert.doesNotMatch(JSON.stringify([p,researchedParts[p.id]]),/\b(Keefer|MXA|Motocross Action|PulpMX|Vital MX)\b/);}
});

test('work detail is kept and reaches Ask BAK with the bike’s fuel system',()=>{
 const v=readInstalled({installed_parts:[{s:'tuning',b:'Twisted Development',n:'ECU flashed or remapped',d:'green map, pump gas',r:workProviders.find(p=>p.work==='ecu')!.id}]});
 assert.equal(v.parts[0].d,'green map, pump gas');
 const bike={id:'b1',user_id:'u1',manufacturer:'KTM',model:'300 SX',model_year:2024,variant:'',region:'US',nickname:'',engine_hours:0,configuration:{installed_parts:v.parts}} as never;
 const input=buildEngineeringInput(bike,[],[],'it bogs off the bottom') as Record<string,unknown>;
 assert.equal(input.fuel_system,'fuel injected');
 assert.match(JSON.stringify(input.installed_parts),/green map, pump gas/);
});

test('part types: a complete cone-valve fork is a fork, a gold valve kit is a valving kit',()=>{
 assert.equal(typeOf('suspension','XACT PRO 7548 Cone Valve Fork'),'Fork (cartridge, conversion, kit)');
 assert.equal(typeOf('suspension','Fork Compression Gold Valve Kit'),'Valving, bladder or perch kit');
 assert.equal(typeOf('suspension','XACT PRO 6500 Fork Cartridge Kit'),'Fork (cartridge, conversion, kit)');
});

test('parts catalogs carry no research bookkeeping in rider-facing notes',()=>{
 for(const f of readdirSync('public/parts-catalog')){const t=readFileSync('public/parts-catalog/'+f,'utf8');
  assert.doesNotMatch(t,/catalogue search example|see the [^".]{0,40} entry|search-result title|Part number format/i,f);}
 assert.ok(JSON.parse(readFileSync('public/parts-catalog/ktm-family.json','utf8')).brands.some((b:string)=>b==='JT Sprockets'));
});

test('a shop’s service notes reach BAK only for the bikes that shop lists',()=>{
 const td=workProviders.find(p=>p.id==='tn-001')!;
 assert.ok(td.models.length&&!td.models.includes('KTM|450 SX-F'));
 const cfg={installed_parts:[{s:'tuning',b:'Twisted Development',n:'ECU flashed or remapped',r:'tn-001'}]};
 assert.equal(installedPartsContext(cfg,{manufacturer:'KTM',model:'450 SX-F'})!.fitted[0].research,undefined);
 assert.ok(installedPartsContext(cfg,{manufacturer:td.models[0].split('|')[0],model:td.models[0].split('|')[1]})!.fitted[0].research);
});
test('part colours: catalog colours reach the picker and the rider\'s choice is stored with the part',async()=>{
 const {decodeFamily,pickerChoices}=await import('../shared/parts-picker.ts');const {readInstalled,partLabel}=await import('../shared/installed-parts.ts');
 const fam={v:2,systems:['controls'],sellers:{},brands:['Renthal'],items:[{b:0,n:'Fatbar',s:0,p:'605-01',cl:[['Black','anodized'],['Red','anodized']]}],bikes:{'KTM|450 SX-F|2025':[0]}} as never;
 const parts=decodeFamily(fam,'KTM','450 SX-F',2025)!;assert.deepEqual(parts[0].colors,[{name:'Black',finish:'anodized'},{name:'Red',finish:'anodized'}]);
 assert.equal(pickerChoices(parts,'controls' as never,'injected')[0].colors?.length,2);
 const {parts:stored}=readInstalled({installed_parts:[{s:'controls',b:'Renthal',n:'Fatbar',k:'  Black  '},{s:'controls',b:'ODI',n:'Grips',k:''}]});
 assert.equal(stored[0].k,'Black');assert.equal(stored[1].k,undefined);assert.equal(partLabel(stored[0]),'Renthal Fatbar (Black)');
});
