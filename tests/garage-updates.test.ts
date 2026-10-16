import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanGarageUpdates,pendingGarageUpdates,applyGarageUpdates} from '../shared/garage-updates.ts';
import {readInstalled} from '../shared/installed-parts.ts';
import {responseSchema,instructions} from '../server/engineering.ts';

const cfg={fork_compression:'12',shock_rebound:'18',installed_parts:[{s:'clutch',b:'Rekluse',n:'Radius CX 4.0 Clutch Kit'}],stock_systems:['suspension']};
test('only known Garage fields and build-sheet sections survive, and never without a bike',()=>{
 const raw=[{type:'setting',field:'fork_compression',value:'14',current:'12'},{type:'setting',field:'favourite_colour',value:'orange'},
  {type:'setting',field:'rider_sag_mm',value:'about a hundred'},{type:'part',system:'suspension',brand:'Pro Circuit',name:'Linkage'},
  {type:'part',system:'spaceship',brand:'X',name:'Y'},{type:'setting',field:'fork_compression',value:'15'}];
 const clean=cleanGarageUpdates(raw,true);
 assert.deepEqual(clean.map(u=>u.field||u.name),['fork_compression','Linkage']);
 assert.deepEqual(cleanGarageUpdates(raw,false),[]);
});
test('a proposal already matching the Garage is not offered again',()=>{
 const u=cleanGarageUpdates([{type:'setting',field:'fork_compression',value:'12'},{type:'setting',field:'shock_rebound',value:'16'},
  {type:'part',system:'clutch',brand:'Rekluse',name:'Radius CX 4.0'},{type:'part',system:'suspension',brand:'Pro Circuit',name:'Linkage'}],true);
 assert.deepEqual(pendingGarageUpdates(cfg,u).map(x=>x.field||x.name),['shock_rebound','Linkage']);
});
test('saving applies settings and parts, clears stock for that section, and keeps everything else',()=>{
 const u=cleanGarageUpdates([{type:'setting',field:'shock_rebound',value:'16'},{type:'setting',field:'geared_weight_lb',value:'220'},{type:'part',system:'suspension',brand:'Pro Circuit',name:'Linkage',value:'2025 small bolt'}],true);
 const next=applyGarageUpdates(cfg,u);
 assert.equal(next.shock_rebound,'16');assert.equal(next.geared_weight_lb,220);assert.equal(next.fork_compression,'12');
 const v=readInstalled(next);
 assert.ok(v.parts.some(p=>p.b==='Pro Circuit'&&p.d==='2025 small bolt'&&p.x));
 assert.ok(v.parts.some(p=>p.b==='Rekluse'));
 assert.ok(!v.stock.includes('suspension'));
 assert.equal(pendingGarageUpdates(next,u).length,0);
});
test('older saved replies without garage_updates still parse, and BAK is told it only proposes',()=>{
 const base={kind:'answer',summary:'s',answer:'a',observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,setup_changes:[],specifications:[],evidence_ids:[],confidence:'LIMITED',claims:[],data_gaps:[]};
 assert.deepEqual(responseSchema.parse(base).garage_updates,[]);
 assert.match(instructions,/GARAGE UPDATES/);assert.match(instructions,/never a value you suggested/);
});
import {mergeGarageDraft} from '../shared/garage-updates.ts';
test('an open Garage edit keeps what the rider typed and picks up changes saved from chat',()=>{
 const base={fork_compression:'12',geared_weight_lb:220,nickname_note:'x'};
 const draft={...base,geared_weight_lb:205};                    // rider is editing weight on the phone
 const server={...base,fork_compression:'14 out',installed_parts:[{s:'suspension',b:'Pro Circuit',n:'Linkage'}]}; // saved from chat meanwhile
 const merged=mergeGarageDraft(draft,base,server);
 assert.equal(merged.geared_weight_lb,205);assert.equal(merged.fork_compression,'14 out');assert.ok(Array.isArray(merged.installed_parts));
});
