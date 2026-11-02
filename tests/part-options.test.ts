import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {partOptionsFor} from '../server/part-options.ts';
const bike=(manufacturer:string,model:string,model_year:number)=>({id:'b',user_id:'u',manufacturer,model,model_year,variant:'standard',region:'US',configuration:{}} as never);
test('Ask BAK gets the fitting parts a rider is choosing between, from the bike\'s own list',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=(async(url:string)=>{const fam=String(url).match(/parts-catalog\/([a-z-]+)\.json/)?.[1];return new Response(readFileSync(`public/parts-catalog/${fam}.json`,'utf8'),{status:200});}) as typeof fetch;
 try{
  const clamps=await partOptionsFor(bike('KTM','450 SX-F',2024),'I want new triple clamps but I\'m torn between Xtrig and Luxon, which is better for me?');
  assert.ok(clamps&&clamps.options.length>0,'finds clamp options');
  assert.ok(clamps!.options.every(o=>o.fits_this_bike));
  assert.ok(clamps!.options.some(o=>/xtrig|luxon/i.test(o.brand)),'names the brands asked about');
  const fork=await partOptionsFor(bike('KTM','85 SX 19/16',2025),'should I get the WP cone valve fork or keep the stock one?');
  assert.ok(fork!.options.some(o=>/cone valve/i.test(o.part)),'small-bike Cone Valve fork is offered');
  assert.equal(await partOptionsFor(bike('KTM','450 SX-F',2024),'what is race sag?'),null,'no shopping, no parts');
 }finally{globalThis.fetch=original;}
});
