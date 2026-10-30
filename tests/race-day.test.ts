import test from 'node:test';
import assert from 'node:assert/strict';
import {activeRace,raceToday,daysToGo,whenText,today,dayOf,raceSetupField,raceSetupKey,raceSetupStale,quickAskText,tryNextText,knownTrack,trackSuggestions,trackPicks,plain} from '../shared/race-day.ts';

const shift=(days:number)=>{const d=new Date();d.setDate(d.getDate()+days);return dayOf(d);};

test('a race counts while it is today or ahead; a past one reads as nothing',()=>{
 assert.equal(activeRace(null),null);
 assert.equal(activeRace({on:false,track:'',day:today()}),null);
 assert.equal(activeRace({on:true,track:'Dade City',day:shift(-1)}),null);
 assert.deepEqual(activeRace({on:true,track:'Dade City',day:shift(2)}),{on:true,track:'Dade City',day:shift(2)});
 assert.equal(raceToday({on:true,track:'x',day:shift(2)}),null);
 assert.ok(raceToday({on:true,track:'x',day:today()}));
});
test('days to go and its words',()=>{
 assert.equal(daysToGo(today()),0);assert.equal(whenText(today()),'Today');
 assert.equal(daysToGo(shift(1)),1);assert.equal(whenText(shift(1)),'Tomorrow');
 assert.equal(whenText(shift(5)),'In 5 days');
});
test('the setup request names the track only when there is one, and one setup is kept per bike, track and day',()=>{
 assert.deepEqual(raceSetupField('',shift(3)),{date:shift(3),setup:true});
 assert.deepEqual(raceSetupField('Dade City MX',shift(3)),{track:'Dade City MX',date:shift(3),setup:true});
 assert.equal(raceSetupKey('b1',' Dade City ',shift(3)),raceSetupKey('b1','dade city',shift(3)));
 // a setup worked out just now is never stale (same rule as the phone app)
 assert.equal(raceSetupStale(shift(5),new Date().toISOString()),false);
 assert.equal(raceSetupStale(shift(10),new Date().toISOString()),false);
});
test('quick-ask and try-next questions carry the track and today’s entries',()=>{
 assert.match(quickAskText('Dade City','Front pushes in turns'),/at Dade City, between motos: front pushes in turns/);
 assert.match(quickAskText('','Bottoms on jumps'),/^Race day, between motos/);
 const q=tryNextText('Dade City',[{conditions:'Race day · Moto 2',change_made:'Sag: 2 mm more',result:'better',notes:''},{conditions:'Race day · Moto 1',change_made:'Fork compression: 2 softer',result:'worse',notes:'kicked'}] as never);
 assert.match(q,/- Moto 1: Fork compression: 2 softer → Worse \(kicked\)\n- Moto 2: Sag: 2 mm more → Better/);
});
test('track picker: aliases, partial matches and one-tap picks without repeats',()=>{
 const dir=[{name:'Dade City Motocross',city:'Dade City',state:'FL',aliases:['Dade City MX'],weather:true},{name:'Bostwick Creek',city:'Bostwick',state:'FL',weather:false}];
 assert.equal(knownTrack(dir,'dade city mx')?.name,'Dade City Motocross');
 assert.equal(trackSuggestions(dir,'Dade City Motocross').length,0);
 assert.deepEqual(trackSuggestions(dir,'bost').map(t=>t.name),['Bostwick Creek']);
 assert.deepEqual(trackPicks(['Dade City'],[' dade city ','Bostwick','','Bostwick']),['Dade City','Bostwick']);
 assert.equal(plain('**Soften** the rear, *then ride'),'Soften the rear, then ride');
});
