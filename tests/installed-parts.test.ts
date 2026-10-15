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
