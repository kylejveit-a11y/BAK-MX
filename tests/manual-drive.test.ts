import test from 'node:test';
import assert from 'node:assert/strict';
import {judge,groupWanted,rewardCode,type ManualVerdict} from '../server/manual-drive.ts';

const v=(o:Partial<ManualVerdict>):ManualVerdict=>({document_type:'service_or_repair_manual',manufacturer:'Honda',models:['CRF450R'],years:[2021,2022,2023,2024],language:'en',is_complete_workshop_manual:true,evidence:[],confidence:'high',...o});
const target={manufacturer:'Honda',model:'CRF450R',years:[2023,2024]};

test('the right service manual is accepted for the covered wanted years only',()=>{
 const r=judge(v({}),520,target);assert.equal(r.ok,true);assert.deepEqual(r.years,[2023,2024]);
 assert.deepEqual(judge(v({years:[2024]}),520,target).years,[2024]);
});
test('owner manuals, parts books, partial files, wrong bikes and wrong years are turned down',()=>{
 assert.match(judge(v({document_type:'owners_manual'}),180,target).reason!,/owner's manual/);
 assert.match(judge(v({document_type:'parts_catalog'}),300,target).reason!,/parts catalog/);
 assert.match(judge(v({is_complete_workshop_manual:false}),300,target).reason!,/full engine teardown/);
 assert.match(judge(v({}),60,target).reason!,/60 pages/);
 assert.match(judge(v({manufacturer:'Kawasaki'}),400,target).reason!,/Kawasaki/);
 assert.match(judge(v({models:['CRF250R']}),400,target).reason!,/CRF250R/);
 assert.match(judge(v({years:[2019,2020]}),400,target).reason!,/2019, 2020/);
 assert.equal(judge(v({confidence:'low'}),400,target).ok,false);
});
test('model names are matched loosely but not across sizes',()=>{
 assert.equal(judge(v({manufacturer:'KTM',models:['450 SX-F','450 XC-F'],years:[2025]}),430,{manufacturer:'KTM',model:'450 SX-F',years:[2025]}).ok,true);
 assert.equal(judge(v({manufacturer:'KTM',models:['450 SX-F'],years:[2025]}),430,{manufacturer:'KTM',model:'450 SX-F',years:[2025]}).ok,true);
 assert.equal(judge(v({manufacturer:'KTM',models:['250 SX-F'],years:[2025]}),430,{manufacturer:'KTM',model:'450 SX-F',years:[2025]}).ok,false);
});
test('wanted bike-years are grouped by manual and codes are unambiguous',()=>{
 const g=groupWanted([2024,2022,2023].map(y=>({id:`Honda|CRF450R|${y}`,manufacturer:'Honda',model:'CRF450R',model_year:y,manual_name:'2021-2024 CRF450R Service Manual',publication:'61MKE92',status:'WANTED',buy:[]})));
 assert.equal(g.length,1);assert.deepEqual(g[0].years,[2022,2023,2024]);assert.equal(g[0].ids.length,3);
 const c=rewardCode();assert.match(c,/^BAK-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
});
