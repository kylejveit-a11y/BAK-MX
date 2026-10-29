import test from 'node:test';
import assert from 'node:assert/strict';
import {chatSchema} from '../server/validation.ts';
import {raceLookups,RACE_LOOKUPS,instructions} from '../server/engineering.ts';

const base={conversation_id:'7f1c0c56-5d5e-4b7e-9d36-1d3a2b1f4c11',request_id:'0b6f1d4e-2c7a-4f0e-8d55-3c2e9a7b6f20',message:'front pushes in turns'};

test('chat accepts race mode with or without a track, and nothing else inside it',()=>{
 assert.equal(chatSchema.safeParse({...base,race:{}}).success,true);
 assert.equal(chatSchema.safeParse({...base,race:{track:'Glen Helen'}}).success,true);
 assert.equal(chatSchema.safeParse({...base,race:{track:'x',fast:true}}).success,false);
 assert.equal(chatSchema.safeParse(base).success,true);
});

test('race lookups lead with the rider\'s words and stay within the search budget',()=>{
 const q=raceLookups('  front pushes in turns ');
 assert.equal(q[0],'front pushes in turns');
 assert.ok(q.length<=6);
 for(const r of RACE_LOOKUPS)assert.ok(q.includes(r));
 assert.deepEqual(raceLookups(''),[...RACE_LOOKUPS]);
});

test('race mode never trades away safety or honesty in the prompt',()=>{
 assert.match(instructions,/RACE MODE/);
 assert.match(instructions,/Never trade safety or honesty for speed/);
});

import {forecastFromPeriods,daysUntil,raceTrackAt,raceForecast} from '../server/weather.ts';
const P=(name:string,start:string,day:boolean,t:number,short:string,pop:number|null)=>({name,startTime:start,isDaytime:day,temperature:t,temperatureUnit:'F',windSpeed:'5 to 10 mph',windDirection:'W',shortForecast:short,probabilityOfPrecipitation:{value:pop}});
test('race forecast picks the race day, its night, and rain in the two days before',()=>{
 const periods=[P('Thursday','2026-10-29T06:00:00-07:00',true,80,'Showers Likely',60),P('Friday','2026-10-30T06:00:00-07:00',true,78,'Sunny',5),P('Saturday','2026-10-31T06:00:00-07:00',true,84,'Mostly Sunny',10),P('Saturday Night','2026-10-31T18:00:00-07:00',false,58,'Clear',0)];
 const f=forecastFromPeriods(periods,'2026-10-31','2026-10-29T05:00:00Z');
 assert.equal(f.available,true);
 if(!f.available)return;
 assert.equal(f.high_f,84);assert.equal(f.low_f,58);assert.equal(f.rain_chance_pct,10);assert.equal(f.wind,'W 5 to 10 mph');
 assert.deepEqual(f.rain_days_before,['Thursday: Showers Likely (60%)']);
 assert.equal(forecastFromPeriods(periods,'2026-11-09','x').available,false);
});
test('race forecast says why when there is none, without calling the weather service',async()=>{
 assert.equal(daysUntil('2026-11-01','2026-10-29'),3);
 const none=await raceForecast(null,null,'2026-10-30','2026-10-29');assert.equal(none.available,false);
 const far=await raceForecast(28,-82,'2026-11-20','2026-10-29');assert.equal(far.available,false);if(!far.available)assert.match(far.reason,/week before/);
 assert.deepEqual(raceTrackAt([{name:'Other',lat:1,lng:2},{name:'Glen Helen',lat:3,lng:4}],'glen helen'),[3,4]);
 assert.deepEqual(raceTrackAt([],'x'),[null,null]);
});
test('race setup prompt never invents weather or changes',()=>{
 assert.match(instructions,/RACE SETUP/);assert.match(instructions,/Never invent weather/);assert.match(instructions,/never invent changes to look useful/);
});
