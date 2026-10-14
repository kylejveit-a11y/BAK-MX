import test from 'node:test';
import assert from 'node:assert/strict';
import {yamahaGuidance,kawasakiGuidance,manufacturerSetupGuidance} from '../shared/manufacturer-setup-guidance.ts';
import {buildEngineeringInput} from '../server/engineering.ts';
const bike=(manufacturer:string,model:string,model_year:number):any=>({id:'b',user_id:'u',manufacturer,model,model_year,variant:'standard',region:'US',configuration:{}});
for(const g of [yamahaGuidance,kawasakiGuidance]){
test(`${g.manufacturer} guidance carries no numbers that could pass as specifications`,()=>{
 const text=JSON.stringify({rows:g.rows,how:g.how_the_manual_says_to_use_it},(k,v)=>k==='models'?undefined:v);
 assert.equal(/\d/.test(text),false);
 assert.equal(new Set(g.rows.map(r=>r.id)).size,g.rows.length);
 for(const r of g.rows){assert.ok(r.checks.length>=1,r.id);assert.ok(r.rider_says.length>=2,r.id);assert.ok(r.where.length>=1,r.id);}
});
test(`${g.manufacturer}: every source names a manual document and its pages, one per bike-year`,()=>{
 const keys=g.sources.map(s=>s.model+'|'+s.model_year);
 assert.equal(new Set(keys).size,keys.length);
 for(const s of g.sources){assert.match(s.document,/^([A-Z0-9]{3}-\d{4}[0-9U]-\d{2}|998\d\d-\d{4})$/);assert.ok(s.pdf_pages.length>=2);}
});
}
test('a check printed for some models only reaches those models',()=>{
 const preload=(m:string)=>JSON.stringify(manufacturerSetupGuidance(bike('Kawasaki',m,2024))).includes('Fork spring preload');
 assert.equal(preload('KX450'),true);assert.equal(preload('KX250'),false);
 assert.equal(JSON.stringify(manufacturerSetupGuidance(bike('Kawasaki','KX450X',2025))).includes('models'),false);
 assert.equal(manufacturerSetupGuidance(bike('Kawasaki','KX250',2021)),null);
});
test('guidance is sent only for a bike whose manual was checked',()=>{
 assert.ok(manufacturerSetupGuidance(bike('Yamaha','YZ450F',2025)));
 assert.equal(manufacturerSetupGuidance(bike('Yamaha','YZ450F',2019)),null);
 assert.equal(manufacturerSetupGuidance(bike('Yamaha','WR450F',2025)),null);
 assert.equal(manufacturerSetupGuidance(bike('KTM','450 SX-F',2025)),null);
 assert.equal(manufacturerSetupGuidance(null),null);
 const yz:any=buildEngineeringInput(bike('Yamaha','YZ250F',2024),[],[],'rear won’t hook up');
 assert.match(yz.manufacturer_setup_guidance.boundary,/never as a verified claim id/);
 assert.match(yz.manufacturer_setup_guidance.boundary,/BMF-2819U-10/);
 const ktm:any=buildEngineeringInput(bike('KTM','450 SX-F',2025),[],[],'front pushes');
 assert.equal('manufacturer_setup_guidance' in ktm,false);
});
