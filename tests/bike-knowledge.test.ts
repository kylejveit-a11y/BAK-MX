import test from 'node:test';
import assert from 'node:assert/strict';
import {rankKnowledge,withinBudget,focusRow,type Knowledge} from '../server/knowledge.ts';
import {responseViolations} from '../server/engineering.ts';
const k=(id:string,domain:string,topic:string,tier:Knowledge['tier'],statement='x'):Knowledge=>({id,domain,topic,statement,tier,values:{},notes:'',confidence:'high'});
const rows=[k('K-1','ecu_electronics','Power Tuner fuel grid','TUNER','Smoother arenacross map'),k('K-2','power_feel','peak horsepower','MEASURED','55 hp on a dyno'),k('K-3','chassis','rake','OEM','27 degrees'),k('K-4','engine_architecture','bore and stroke ratio','DERIVED','oversquare')];
test('knowledge is ranked by what the rider asked',()=>{
 assert.equal(rankKnowledge(rows,'What Power Tuner map for arenacross?')[0].id,'K-1');
 assert.equal(rankKnowledge(rows,'how much horsepower does it make on the dyno')[0].id,'K-2');
 assert.deepEqual(rankKnowledge(rows,'my grips are worn'),[]);
});
test('rider symptom words reach known issues and jetting',()=>{
 const r=[k('K-5','known_issues','rich low-speed jetting','COMMUNITY','owners report rich running'),k('K-6','chassis','rake','OEM','27 degrees')];
 assert.equal(rankKnowledge(r,'my plugs keep fouling on trails')[0]?.id,'K-5');
 assert.equal(rankKnowledge(r,'radiator keeps boiling over')[0]?.id,'K-5');
 const m=[k('K-7','engine_mods','US restrictions and uncorking','MEASURED','throttle stop and exhaust insert'),k('K-8','chassis','rake','OEM','27 degrees')];
 assert.equal(rankKnowledge(m,'my WR feels choked, what is holding it back?')[0]?.id,'K-7');
 const u=[k('K-9','setups','soft rutty track baseline','TUNER','fork flush, compression 8'),k('K-10','suspension','spring rate by rider weight','TUNER','170-185 lb stock'),k('K-11','engine_mods','exhaust','MEASURED','slip-on')];
 const top=rankKnowledge(u,'what springs and clickers for a sandy rutted track at 172 lb?').map(x=>x.id);
 assert.equal(rankKnowledge([k('K-12','engine_mods','flywheel weights','TUNER','8, 10 or 12 oz'),k('K-13','chassis','rake','OEM','26 degrees')],'would a flywheel weight help it stop stalling?')[0]?.id,'K-12');
 assert.ok(top.indexOf('K-9')<2&&top.indexOf('K-10')<2&&top.includes('K-9')&&top.includes('K-10'));
});
const base={kind:'answer',summary:'s',answer:'a',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,specifications:[],evidence_ids:[],references:[],confidence:'LIMITED',garage_updates:[]};
const v=(claims:object[])=>responseViolations({...base,claims} as never,[],[],rows);
test('deep knowledge supports a claim only at its own tier',()=>{
 assert.deepEqual(v([{claim:'tuner map',tier:'COMMUNITY',evidence_ids:['K-1']}]),[]);
 assert.ok(v([{claim:'tuner map',tier:'PUBLISHED',evidence_ids:['K-1']}]).length>0);
 assert.deepEqual(v([{claim:'rake',tier:'PUBLISHED',evidence_ids:['K-3']}]),[]);
 assert.deepEqual(v([{claim:'ratio',tier:'ENGINEERING',evidence_ids:['K-4']}]),[]);
 assert.ok(v([{claim:'made up',tier:'COMMUNITY',evidence_ids:['K-99']}]).length>0);
});
test('knowledge ids never break the answer shape',async()=>{
 const {fitToLimits,responseSchema}=await import('../server/engineering.ts');
 const {references:_r,...shape}=base as Record<string,unknown>;const raw={...shape,data_gaps:[],evidence_ids:['K-yz45-001|Yamaha|YZ450F|2025'],specifications:[{claim_id:'K-x',value:'55 hp'}],claims:Array.from({length:15},(_,i)=>({claim:'c'+i,tier:'COMMUNITY',evidence_ids:['K-1']}))};
 assert.equal(responseSchema.safeParse(raw).success,false);
 const fixed=responseSchema.safeParse(fitToLimits(raw));assert.ok(fixed.success);
 if(fixed.success){assert.equal(fixed.data.claims.length,12);assert.deepEqual(fixed.data.evidence_ids,[]);}
});
test('bikes the rider names to compare are found by model name or by make',async()=>{
 const {mentionedBikes}=await import('../server/knowledge.ts');
 assert.deepEqual(mentionedBikes('how does it compare to the Yamaha?',{manufacturer:'KTM',model:'450 SX-F',model_year:2025}).map(b=>b.model),['YZ450F']);
 assert.deepEqual(mentionedBikes('my buddy has a CRF450R',{manufacturer:'KTM',model:'450 SX-F',model_year:2025}).map(b=>b.model),['CRF450R']);
 assert.deepEqual(mentionedBikes('is my bike fast?',{manufacturer:'KTM',model:'450 SX-F',model_year:2025}),[]);
 assert.equal(mentionedBikes('vs the yz250',{manufacturer:'KTM',model:'250 SX',model_year:2024})[0]?.model,'YZ250');
});

test('torque and service questions reach the manual tables, within a size budget',()=>{
 const big=(id:string)=>({...k(id,'maintenance','chassis tightening torques','OEM','torques'),values:{t:'x'.repeat(15000)}});
 const r=[big('K-20'),k('K-21','power_feel','peak torque','MEASURED','36 lb-ft'),k('K-22','chassis','rake','OEM','27 degrees')];
 assert.equal(rankKnowledge(r,'what is the rear axle nut torque?')[0]?.id,'K-20');
 assert.equal(rankKnowledge(r,'how often should I change the oil?')[0]?.domain,'maintenance');
 const many=[big('K-30'),big('K-31'),big('K-32'),k('K-33','setups','x','OEM','y')];
 const kept=withinBudget(many);
 assert.ok(kept.length<many.length&&kept[0].id==='K-30');
});

test('big tables are cut to the rows the rider asked about',()=>{
 const rows:Record<string,string>={};for(let i=0;i<300;i++)rows['Bolt '+i+' (M8)']='10 N·m';rows['Rear axle nut (M22)']='135 N·m';
 const f=focusRow({...k('K-40','maintenance','chassis tightening torques','OEM','torques'),values:{torques:rows}},'rear axle nut torque');
 assert.deepEqual(Object.keys((f.values as {torques:Record<string,string>}).torques),['Rear axle nut (M22)']);
});
