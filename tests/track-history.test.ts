import test from 'node:test';
import assert from 'node:assert/strict';
import {logAtTrack,settingsLine,visitsFrom,weatherLine} from '../shared/track-history.ts';
import {observationOf} from '../server/weather.ts';
const W={temp_f:72,conditions:'Partly Cloudy',wind_mph:8,humidity_pct:60,observed_at:'2026-11-01T15:00:00Z'};
test('logs match a track by name or alias, normalized',()=>{
 const t={name:'Dade City MX',aliases:['Dade City Motocross']};
 assert.ok(logAtTrack('dade city mx',t));assert.ok(logAtTrack('Dade City Motocross ',t));assert.ok(!logAtTrack('Dade',t));assert.ok(!logAtTrack('',t));
});
test('visits group by day, newest first, weather from the report first',()=>{
 const log=(id:string,at:string,w=null as typeof W|null)=>({id,recorded_at:at,bike_id:'b',settings:{fork_compression:12,rider_sag_mm:105},change_made:id==='2'?'Fork compression: 2 clicks softer':'',result:'better',notes:'',conditions:'',weather:w});
 const v=visitsFrom([log('1','2026-11-01T14:00:00Z',W),log('2','2026-11-01T16:00:00Z'),log('3','2026-10-20T15:00:00Z')],
  [{ridden_on:'2026-10-20',tags:['sand'],tire:'MX33',front_psi:13,rear_psi:12,setup_text:'',note:'',weather:null}],iso=>iso.slice(0,10));
 assert.deepEqual(v.map(x=>[x.day,x.logs.length,!!x.report]),[['2026-11-01',2,false],['2026-10-20',1,true]]);
 assert.equal(v[0].weather?.temp_f,72);assert.equal(v[1].weather,null);
 assert.equal(settingsLine({fork_compression:12,rider_sag_mm:105}),'Fork comp 12 · Sag 105 mm');
 assert.equal(weatherLine(W),'72°F, Partly Cloudy, wind 8 mph');
});
test('NWS observation converts to US units and stale ones are dropped',()=>{
 const now=Date.parse('2026-11-15T18:00:00Z');
 const o=observationOf({timestamp:'2026-11-15T17:30:00Z',textDescription:'Clear',temperature:{value:20},windSpeed:{value:16.09},relativeHumidity:{value:55.4}},'KTPA',now)!;
 assert.deepEqual([o.temp_f,o.wind_mph,o.humidity_pct,o.conditions],[68,10,55,'Clear']);
 assert.equal(observationOf({timestamp:'2026-11-15T12:00:00Z',temperature:{value:20}},'KTPA',now),null);
});
