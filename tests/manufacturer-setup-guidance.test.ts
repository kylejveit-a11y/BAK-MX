import test from 'node:test';
import assert from 'node:assert/strict';
import {yamahaGuidance,manufacturerSetupGuidance} from '../shared/manufacturer-setup-guidance.ts';
import {buildEngineeringInput} from '../server/engineering.ts';
const bike=(manufacturer:string,model:string,model_year:number):any=>({id:'b',user_id:'u',manufacturer,model,model_year,variant:'standard',region:'US',configuration:{}});
test('manufacturer guidance carries no numbers that could pass as specifications',()=>{
 const text=JSON.stringify({rows:yamahaGuidance.rows,how:yamahaGuidance.how_the_manual_says_to_use_it});
 assert.equal(/\d/.test(text),false);
 assert.equal(new Set(yamahaGuidance.rows.map(r=>r.id)).size,yamahaGuidance.rows.length);
 for(const r of yamahaGuidance.rows){assert.ok(r.checks.length>=1,r.id);assert.ok(r.rider_says.length>=2,r.id);assert.ok(r.where.length>=1,r.id);}
});
test('every source names a manual document and its pages, one per bike-year',()=>{
 const keys=yamahaGuidance.sources.map(s=>s.model+'|'+s.model_year);
 assert.equal(new Set(keys).size,keys.length);
 for(const s of yamahaGuidance.sources){assert.match(s.document,/^[A-Z0-9]{3}-\d{4}[0-9U]-\d{2}$/);assert.ok(s.pdf_pages.length>=2);}
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
