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
import {settingName} from '../shared/specs-view.ts';
test('setting names read like a rider says them',()=>{
 assert.equal(settingName('Fork · Compression damping · Standard'),'Fork compression (stock)');
 assert.equal(settingName('Shock · Riding sag'),'Riding sag');
 assert.equal(settingName('Front brake caliper screw (M8)'),'Front brake caliper screw (M8)');
 assert.equal(settingName('Shock · High-speed compression damping · Standard'),'Shock high-speed compression (stock)');
});
import {isCatalogClaim,liftPartNumbers,bareValue} from '../shared/specs-view.ts';
test('labels lose the doubled heading and read the same for every mode',()=>{
 assert.equal(settingName('Fork · Fork length'),'Fork length');
 assert.equal(settingName('Fork · Fork'),'Fork');
 assert.equal(settingName('Fork · Rebound damping · Comfort'),'Fork rebound (comfort)');
 assert.equal(settingName('Fork · Compression damping · Sport'),'Fork compression (sport)');
 assert.equal(settingName('Fork rebound standard'),'Fork rebound (stock)');
 assert.equal(settingName('Fork compression comfort'),'Fork compression (comfort)');
 assert.equal(settingName('Total fuel tank capacity, approx. · Total fuel tank capacity, approx.'),'Total fuel tank capacity, approx');
 assert.equal(settingName('Shock · Lowspeed compression damping · Standard'),'Shock lowspeed compression (stock)');
});
test('the same value printed twice under one name shows once, with both units; different values both stay',()=>{
 const rows=specRows([
  c('1','Fork / Fork length: 950 mm.'),c('2','Fork length: 950 mm.'),
  c('3','Fork / Fork offset: 22 mm.'),c('4','Fork offset: 22 mm (0.87 in).'),
  c('5','Fork / Rebound damping / Standard: 18 clicks.'),c('6','Fork rebound standard: 18 clicks. US fork settings.'),
  c('7','Fork / Rebound damping / Comfort: 23 clicks.'),c('8','Fork rebound comfort: 23 clicks.'),
  c('9','Chassis tightening torques / Screw, engine sprocket (M10): 60 Nm (44.3 lbf ft); Loctite 2701™.'),c('10','Engine sprocket screw (M10): 60 Nm.'),
  c('11','Engine tightening torques / Spark plug (M10x1): 10 … 12 Nm (7.4 … 8.9 lbf ft).'),c('12','Spark plug (M10x1): 10-12 Nm.'),
  c('13','Shock absorber / Highspeed compression damping / Sport: 1 turn.'),c('14','Shock high-speed compression sport: 1 turns.'),
  c('15','Suspension travel front: 310 mm (12.2 in).'),c('16','Front suspension travel: 310 mm.'),
  c('17','Dimensions / Wheelbase: 1,493 ± 10 mm (58.78 ± 0.39 in).'),c('18','Wheelbase: 1493 +/- 10 mm.'),
  c('19','Shock absorber / Spring preload: 8 mm.'),c('20','Shock absorber / Spring preload: 10 mm.'),
 ]);
 const by=(n:string)=>rows.filter(r=>r.name===n).map(r=>r.value);
 assert.deepEqual(by('Fork length'),['950 mm']);
 assert.deepEqual(by('Fork offset'),['22 mm (0.87 in)']);
 assert.deepEqual(by('Fork rebound (stock)'),['18 clicks']);
 assert.deepEqual(by('Fork rebound (comfort)'),['23 clicks']);
 assert.deepEqual(by('Engine sprocket screw (M10)'),['60 Nm (44.3 lbf ft); Loctite 2701™']);
 assert.deepEqual(by('Spark plug (M10x1)'),['10 … 12 Nm (7.4 … 8.9 lbf ft)']);
 assert.deepEqual(by('Shock high-speed compression (sport)'),['1 turn']);
 assert.equal(rows.filter(r=>/suspension travel/i.test(r.name)).length,1);
 assert.deepEqual(by('Wheelbase'),['1,493 ± 10 mm (58.78 ± 0.39 in)']);
 assert.deepEqual(by('Shock spring preload'),['8 mm','10 mm']);
 assert.equal(bareValue('10-12 Nm'),bareValue('10 … 12 Nm (7.4 … 8.9 lbf ft)'));
});
test('parts-catalog bookkeeping stays out of the specs list; part numbers in a value move to the detail',()=>{
 const catalog=[
  c('1','OEM catalog dimensional designation for 48602096 (fork outer tube 49.13x577 dt54), official-1 callout 21: 49.13x577 dt54. This does not establish tolerances.','component_identification'),
  c('2','Engineering applicability review of OEM catalog part 40540774 (shim 6x18x0,10 delta): no tightening torque acts on the individual non-threaded component.','component_identification'),
  c('3','Fork / Fork article number: A460C159Y406000.','suspension'),
  c('4','Shock absorber / Shock absorber article number: A460C459Y408000.','suspension'),
  c('5','US fork assembly: A460C159Y406000; WP XACT AER. US SX-F; EU fork part number differs.','suspension'),
 ];
 for(const k of catalog)assert.ok(isCatalogClaim(k),k.statement);
 assert.ok(!isCatalogClaim(c('6','Fork / Fork: WP XACT AER.','suspension')));
 assert.ok(!isCatalogClaim(c('7','Fork / Grease capacity, left cartridge: 5 g; Special grease (00062010053).','suspension')));
 assert.equal(specRows(catalog).length,0);
 const rows=specRows([c('8','Fork / Grease capacity, left cartridge: 5 g; Special grease (00062010053).'),c('9','Shock absorber / Shock absorber oil: Shock absorber fluid (SAE 2.5) (50180751S1).'),c('10','Fork / Offset: 22 mm (0.87 in).')]);
 assert.equal(rows[0].value,'5 g; Special grease');assert.match(rows[0].note,/Maker part number 00062010053\./);
 assert.equal(rows[1].value,'Shock absorber fluid (SAE 2.5)');assert.match(rows[1].note,/50180751S1/);
 assert.equal(rows[2].value,'22 mm (0.87 in)');
 assert.deepEqual(liftPartNumbers('SAE 2.5; 50180751S1'),{value:'SAE 2.5',parts:['50180751S1']});
});
test('a condition the manual printed inside the value moves into the name',()=>{
 const rows=specRows([c('1','Engine / Valve clearance / Intake at: 20 °C (68 °F): 0.10 … 0.15 mm (0.0039 … 0.0059 in).','service'),c('2','Shock absorber / Spring rate / Weight of rider: 65 … 75 kg (143 … 165 lb.): 42 N/mm.','suspension')]);
 assert.equal(rows[0].name,'Valve clearance intake at 20 °C (68 °F)');assert.equal(rows[0].value,'0.10 … 0.15 mm (0.0039 … 0.0059 in)');
 assert.equal(rows[1].name,'Shock spring rate, rider 65 … 75 kg (143 … 165 lb.)');assert.equal(rows[1].value,'42 N/mm');
});
