import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {springOptions,SPRING_ABOUT} from '../server/spring-options.ts';
import {decodeFamily,type CatalogPart,type FamilyFile} from '../shared/parts-picker.ts';

const part=(brand:string,name:string,opts:[string,string][],extra:Partial<CatalogPart>={}):CatalogPart=>({brand,name,system:'suspension',pn:'',verified:true,what:'',caution:'',testers:[],service:false,links:[],opts:opts.map(([label,pn])=>({label,pn})),...extra});

test('aftermarket springs: kg/mm labels become N/mm and the closest listed rate is named with its neighbours',()=>{
 const out=springOptions([part('Factory Connection','Shock Spring',[['4.6kg','ALN-0046'],['4.8kg','ALN-0048'],['5.0kg','ALN-0050'],['5.2kg','ALN-0052']]),part('Factory Connection','Fork Springs',[['.45kg','LSU-045'],['.47kg','LSU-047'],['.49kg','LSU-049']])],{shockNmm:48,forkNmm:4.6});
 assert.ok(out);
 assert.deepEqual(out.shock?.[0].rates_nmm,[45.1,47.1,49,51]);
 assert.deepEqual(out.shock?.[0].closest,{rate_nmm:47.1,listed_as:'4.8 kg/mm',part_number:'ALN-0048'});
 assert.equal(out.shock?.[0].next_softer,'4.6 kg/mm');assert.equal(out.shock?.[0].next_stiffer,'5 kg/mm');
 assert.equal(out.fork?.[0].closest?.listed_as,'0.47 kg/mm');
});
test('aftermarket springs: N/mm lists keep their unit, bare numbers follow it or their size',()=>{
 const out=springOptions([part('WP','XACT Pro fork springs',[['3.8 N/mm = 91410112','91410112'],['4.0 = 91410113','91410113'],['4.2 = 91410114','91410114']]),part('REP Suspension','REP Shock Springs - 881.00 series',[['881.0047.1 = 47','881.0047.1'],['881.0049.1 = 49','881.0049.1']])],{shockNmm:48});
 assert.deepEqual(out?.fork?.[0].rates_nmm,[3.8,4,4.2]);assert.equal(out?.fork?.[0].listed_in,'N/mm');assert.equal(out?.fork?.[0].closest,undefined);
 assert.deepEqual(out?.shock?.[0].rates_nmm,[47,49]);assert.equal(out?.shock?.[0].closest?.rate_nmm,47);
});
test('aftermarket springs: no closest rate when the wanted rate is outside what the company lists; other parts ignored',()=>{
 const out=springOptions([part('Factory Connection','Shock Spring',[['4.6kg','A'],['4.8kg','B']]),part('Helix','Exhaust Springs',[['52MM','x'],['57MM','y']],{system:'exhaust'}),part('REP Suspension','REP Showa Spring Perches',[['a','1'],['b','2']]),part('Cannon Racecraft','Fork springs / shock springs (Honda)',[['67240 = shock spring, 4.4-6.8','67240']])],{shockNmm:62});
 assert.equal(out?.shock?.length,1);assert.equal(out?.shock?.[0].closest,undefined);assert.equal(out?.fork,undefined);
 assert.equal(springOptions([part('Helix','Exhaust Springs',[['52MM','x']],{system:'exhaust'})]),null);
});
test('aftermarket springs: a company\'s own rider-weight guide is passed on, and only then',()=>{
 const out=springOptions([part('Ride JBI','Fork and shock spring rates',[],{caution:'Maker chart: 155-170 lb 4.9/56; 170-185 lb 5.0/58 (stock). Fork N/mm, shock N/mm.'}),part('Factory Connection','Shock Spring',[['4.6kg','A'],['4.8kg','B']],{what:'Aftermarket shock spring to match rider weight.'})]);
 assert.equal(out?.company_weight_guides?.length,1);assert.equal(out?.company_weight_guides?.[0].brand,'Ride JBI');assert.equal(out?.wanted,undefined);
});
test('aftermarket springs: only for spring, sag or rider-weight questions',()=>{
 assert.ok(SPRING_ABOUT.test('what spring rate for 210 lbs'));assert.ok(SPRING_ABOUT.test('my sag is 110'));assert.ok(!SPRING_ABOUT.test('which exhaust is loudest'));
});
test('aftermarket springs: real parts list gives sensible rates for a current 450',()=>{
 const f=JSON.parse(readFileSync(new URL('../public/parts-catalog/yamaha.json',import.meta.url),'utf8')) as FamilyFile;
 const out=springOptions(decodeFamily(f,'Yamaha','YZ450F',2024)??[],{shockNmm:58});
 assert.ok(out?.shock?.length);for(const l of [...(out.shock??[]),...(out.fork??[])])assert.ok(l.rates_nmm.every((r,i,a)=>i===0||r>a[i-1]));
 assert.ok(out.shock!.every(l=>l.rates_nmm.every(r=>r>=40&&r<=80)));
});
