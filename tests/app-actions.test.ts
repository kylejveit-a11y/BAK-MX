import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanAppActions,describeAppAction,runAppAction,type AppContext} from '../shared/app-actions.ts';

const ctx:AppContext={bikes:[{id:'b1',label:'2025 KTM 450 SX-F',active:true},{id:'b2',label:'2022 Yamaha YZ125',active:false}],events:[{id:'e1',title:'Thunder Ridge practice',type:'practice',starts_at:'2026-11-12T22:00:00Z',location:'Thunder Ridge',my_rsvp:null}],today:'2026-11-06'};
const a=(type:string,fields:Record<string,string>)=>({type,fields:Object.entries(fields).map(([key,value])=>({key,value}))});

test('actions that point at real bikes, events and supported models are kept; the rest are dropped',()=>{
 const out=cleanAppActions([
  a('add_bike',{manufacturer:'Yamaha',model:'YZ250F',model_year:'2025'}),
  a('add_bike',{manufacturer:'Yamaha',model:'YZ9000',model_year:'2025'}),
  a('switch_bike',{bike_id:'b2'}),a('switch_bike',{bike_id:'nope'}),
  a('rsvp_event',{event_id:'e1',status:'going',public:'false'}),a('rsvp_event',{event_id:'made-up',status:'going'}),
  a('set_theme',{mode:'bak'}),a('delete_account',{}),
  a('create_event',{title:'Old',event_type:'race',starts_local:'2020-01-01T09:00',location_name:'X'}),
 ],ctx,'b1');
 assert.deepEqual(out.map(x=>x.type),['add_bike','switch_bike','rsvp_event','set_theme']);
 const rsvp=out.find(x=>x.type==='rsvp_event');assert.ok(rsvp&&rsvp.type==='rsvp_event'&&rsvp.public===false&&rsvp.title==='Thunder Ridge practice');
});

test('bike changes default to the active bike, and the card says exactly what will happen',()=>{
 const [hours]=cleanAppActions([a('set_engine_hours',{hours:'42.5'})],ctx,'b1');
 assert.deepEqual(hours,{type:'set_engine_hours',bike_id:'b1',hours:42.5});
 assert.match(describeAppAction(hours,[{id:'b1',model_year:2025,manufacturer:'KTM',model:'450 SX-F',nickname:''}]).title,/2025 KTM 450 SX-F to 42.5 engine hours/);
 const [rsvp]=cleanAppActions([a('rsvp_event',{event_id:'e1',status:'going',public:'false'})],ctx,'b1');
 assert.match(describeAppAction(rsvp).detail,/stays private/);
});

test('running an action uses the rider\'s own API calls',async()=>{
 const calls:unknown[][]=[];let selected='';
 const host={api:async<T>(path:string,method='GET',body?:unknown)=>{calls.push([path,method,body]);return (path==='/bikes'?{id:'new'}:{}) as T;},bikes:[],refreshBikes:async()=>{},selectBike:(id:string)=>{selected=id;},setTheme:()=>{},open:()=>{},draftPost:()=>{},newId:()=>'00000000-0000-4000-8000-000000000000'};
 const [add]=cleanAppActions([a('add_bike',{manufacturer:'KTM',model:'450 SX-F',model_year:'2025',nickname:'Race bike'})],ctx,'b1');
 await runAppAction(add,host);
 assert.equal(calls[0][0],'/bikes');assert.equal(calls[0][1],'POST');assert.equal((calls[0][2] as {nickname:string}).nickname,'Race bike');assert.equal(selected,'new');
});

test('a drafted post carries the photos the rider attached to that message, and posts may use them',()=>{
 const [post]=cleanAppActions([a('draft_post',{category:'build',body:'Fresh top end. Runs mint. #ktm #motocross'})],{...ctx,photos:['p1','p2']},'b1');
 assert.ok(post.type==='draft_post'&&post.photo_ids.join()==='p1,p2');
 assert.match(describeAppAction(post).title,/with your 2 photos/);
});
