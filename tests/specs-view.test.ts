import test from 'node:test';
import assert from 'node:assert/strict';
import {splitFact,specRows,oilSummary,yourSettings,niceName,partArea} from '../shared/specs-view.ts';
import type {Claim} from '../shared/types.ts';
const c=(id:string,statement:string,domain='specification'):Claim=>({id,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain,statement,source_url:'https://example.invalid',source_locator:'p.1',status:'VERIFIED',has_conflict:false});
test('a manual line splits into a plain name and value',()=>{
 assert.deepEqual(splitFact('Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm. Loctite 243.'),{section:'Chassis tightening torques',name:'Screw, front brake caliper (M8)',value:'25 Nm',note:'Loctite 243.'});
});
test('rows use rider words and drop repeats',()=>{
 const rows=specRows([c('1','Service schedule / Check the fork bearing for play: every 45 operating hours','service'),c('2','Service schedule / Check the fork bearing for play.: every 45 operating hours','service')]);
 assert.equal(rows.length,1);assert.equal(rows[0].name,'Check the swingarm pivot bearing for play');assert.equal(rows[0].value,'Every 45 h');
});
test('engine oil shows amount and kind; settings sit next to stock',()=>{
 const rows=specRows([c('1','Capacities / Engine oil quantity: 1.0 l; SAE 10W/50'),c('2','Fork / Compression damping standard: 12 clicks')]);
 assert.deepEqual({a:oilSummary(rows)?.amount,g:oilSummary(rows)?.grade},{a:'1.0 l',g:'SAE 10W/50'});
 const y=yourSettings(rows,{fork_compression:'10 clicks'});assert.ok(y.any);assert.equal(y.list.find(x=>x.key==='fork_compression')?.stock,'12 clicks');
});
test('catalog names read normally and group by area',()=>{assert.equal(niceName('FRONT FORK, TRIPLE CLAMP'),'Front Fork, Triple Clamp');assert.equal(partArea('FRONT FORK, TRIPLE CLAMP'),'Suspension');});
