import test from 'node:test';
import assert from 'node:assert/strict';
import {bikeWidgetProps,emptyBikeWidget,guideActivityProps} from '../src/widgetData.ts';

const bike={id:'b',model_year:2025,manufacturer:'KTM',model:'450 SX-F',engine_hours:42.5};
const svc=(category,next)=>({id:category,category,next_due_hours:next});
const log=(change_made,recorded_at)=>({change_made,recorded_at});

test('widget shows the soonest service and the last setup change',()=>{
  const now=new Date('2026-10-23T12:00:00Z');
  const p=bikeWidgetProps(bike,[svc('Air filter',50),svc('Engine oil',45),svc('Top end',null)],[log('Rebound 2 out',' 2026-10-20T12:00:00Z'.trim()),log('Sag 105',' 2026-10-01T12:00:00Z'.trim())],now);
  assert.equal(p.ready,true);assert.equal(p.bike,'2025 KTM 450 SX-F');assert.equal(p.hours,'42.5');assert.equal(p.hoursSet,true);
  assert.equal(p.next,'Engine oil in 2.5 h');assert.equal(p.nextUrgent,false);assert.equal(p.nextProgress,-1);
  assert.equal(p.change,'Rebound 2 out');assert.equal(p.changeWhen,'3 days ago');
});
test('overdue service is flagged; nothing logged reads plainly',()=>{
  const p=bikeWidgetProps({...bike,engine_hours:46},[svc('Engine oil',45)],[]);
  assert.equal(p.next,'Engine oil due now');assert.equal(p.nextUrgent,true);assert.equal(p.change,'No changes logged yet');assert.equal(p.changeSet,false);
  assert.equal(bikeWidgetProps({...bike,engine_hours:null},[],[]).next,'Add service reminder');
  assert.equal(bikeWidgetProps({...bike,engine_hours:null},[],[]).hoursSet,false);
  assert.deepEqual(bikeWidgetProps(undefined,[],[]),emptyBikeWidget);
});
test('guide activity counts steps from one and clips long text',()=>{
  const g=guideActivityProps({guide:'Fork oil change',bike:'2025 450 SX-F',stepIndex:3,total:12,stepTitle:'Drain the fork',verification:['x'.repeat(300)],needsNote:false,done:false});
  assert.equal(g.step,4);assert.equal(g.total,12);assert.equal(g.guide,'FORK OIL CHANGE');assert.ok(g.check.length<=110);
});
test('service bar shows how much of the interval is used',()=>{
  const p=bikeWidgetProps({...bike,engine_hours:40},[{id:'o',category:'Engine oil',engine_hours:30,next_due_hours:50}],[]);
  assert.equal(p.nextProgress,0.5);assert.equal(p.nextSet,true);
});

import {raceTimeline} from '../src/widgetData.ts';
test('race countdown ticks over at each local midnight and drops off after race day',()=>{
  const now=new Date(2026,9,29,15,30);
  const t=raceTimeline({ready:true},{track:'Glen Helen',day:'2026-11-01',done:12,total:40},now);
  assert.equal(t[0].date,now);assert.equal(t[0].props.raceWhen,'Race in 3 days');assert.equal(t[0].props.raceDone,'Prep 12 of 40');assert.equal(t[0].props.raceProgress,0.3);
  assert.equal(t[1].props.raceWhen,'Race in 2 days');assert.equal(t[1].date.getHours(),0);
  assert.equal(t[3].props.raceWhen,'Race day today');
  assert.equal(t[4].props.raceSet,false);assert.equal(t.length,5);
  assert.equal(raceTimeline({ready:true},null,now)[0].props.raceSet,false);
  assert.equal(raceTimeline({ready:true},{track:'x',day:'2026-10-01',done:0,total:0},now)[0].props.raceSet,false);
});

import {raceActivityProps,raceActivityStale,pickNextEvent,raceStatus,nextEventProps,nextEventTimeline,emptyNextEvent} from '../src/widgetData.ts';
test('race-day activity counts down to the next moto and shows the next checklist item',()=>{
  const now=new Date(2026,10,8,10,15);
  const p=raceActivityProps({kind:'race',track:'Dade City',day:'2026-11-08',next:{label:'Moto 1',at:'10:40'},item:'Set tire pressure for conditions',done:3,total:12,last:''},now);
  assert.equal(p.head,'RACE DAY');assert.equal(p.practice,false);assert.equal(p.nextLabel,'Moto 1');assert.equal(p.nextClock,'10:40 AM');
  assert.equal(p.live,true);assert.equal(p.nextAt,new Date(2026,10,8,10,40).getTime());assert.equal(p.since,now.getTime());assert.equal(p.nextText,'in 25 min');
  assert.equal(p.count,'3/12');assert.equal(p.progress,0.25);
  assert.equal(raceActivityStale(p,'2026-11-08').getTime(),p.nextAt+5*60000);
  const past=raceActivityProps({kind:'practice',track:'',day:'2026-11-08',next:{label:'Session 2',at:'09:00'},item:'',done:5,total:5,last:'Session 1 · 20 min'},now);
  assert.equal(past.head,'PRACTICE DAY');assert.equal(past.track,'Track day');assert.equal(past.live,false);assert.equal(past.item,'Checklist done');assert.equal(past.last,'Session 1 · 20 min');
  assert.equal(raceActivityStale(past,'2026-11-08').getHours(),23);
  const unset=raceActivityProps({kind:'race',track:'X',day:'2026-11-08',next:{label:'Moto 2',at:''},item:'',done:0,total:0,last:''},now);
  assert.equal(unset.nextAt,0);assert.equal(unset.nextText,'Set the time in BAK MX');assert.equal(unset.progress,-1);assert.equal(unset.item,'');
  assert.equal(raceActivityProps({kind:'race',track:'X',day:'2026-11-08',next:null,item:'',done:0,total:0,last:''},now).nextText,'');
});

const ev=(id,starts_at,my_rsvp,extra={})=>({id,title:'Event '+id,event_type:'race',starts_at,location_name:'Dade City MX',canceled_at:null,my_rsvp,...extra});
test('next event: the soonest going or interested event that is not over or canceled',()=>{
  const now=new Date(2026,10,8,9,0);
  const list=[ev('a',new Date(2026,10,20,9).toISOString(),'interested'),ev('b',new Date(2026,10,12,8).toISOString(),'going'),ev('c',new Date(2026,10,9).toISOString(),null),
   ev('d',new Date(2026,10,10).toISOString(),'going',{canceled_at:'2026-11-01T00:00:00Z'}),ev('e',new Date(2026,10,1).toISOString(),'going')];
  assert.equal(pickNextEvent(list,now).id,'b');
  assert.equal(pickNextEvent([ev('t',new Date(2026,10,8,7).toISOString(),'going')],now).id,'t');
  assert.equal(pickNextEvent([ev('m',new Date(2026,10,7,8).toISOString(),'going',{ends_at:new Date(2026,10,9,17).toISOString()})],now).id,'m');
  assert.equal(pickNextEvent([],now),null);
  const p=nextEventProps(list,null,now);
  assert.equal(p.ready,true);assert.equal(p.hasEvent,true);assert.equal(p.name,'Event b');assert.equal(p.type,'Race');assert.equal(p.days,4);assert.equal(p.daysText,'In 4 days');assert.equal(p.rsvp,'Going');
  assert.equal(p.when,'Thu, Nov 12');assert.equal(p.url,'bakmx://events?event=b');assert.equal(p.race,'');
  const none=nextEventProps([],null,now);assert.equal(none.ready,true);assert.equal(none.hasEvent,false);assert.equal(emptyNextEvent.ready,false);
});
test('race-day status on the next-event widget',()=>{
  const now=new Date(2026,10,8,9,0);
  assert.deepEqual(raceStatus({on:true,track:'Dade City',day:'2026-11-08'},now),{race:'Race day today · Dade City',raceLive:true});
  assert.deepEqual(raceStatus({on:true,track:'',day:'2026-11-08',kind:'practice'},now),{race:'Practice day today',raceLive:true});
  assert.deepEqual(raceStatus({on:true,track:'Gatorback',day:'2026-11-11'},now),{race:'Race in 3 days · Gatorback',raceLive:false});
  assert.equal(raceStatus({on:true,track:'',day:'2026-11-09'},now).race,'Race tomorrow');
  assert.equal(raceStatus({on:true,track:'',day:'2026-11-07'},now).race,'');assert.equal(raceStatus(null,now).race,'');assert.equal(raceStatus({on:false,track:'',day:'2026-11-08'},now).race,'');
  assert.equal(nextEventProps([],{on:true,track:'',day:'2026-11-08'},now).url,'bakmx://open');
});
test('next-event timeline ticks at local midnight and stops after the event',()=>{
  const now=new Date(2026,10,8,15,30);
  const t=nextEventTimeline([ev('b',new Date(2026,10,10,8).toISOString(),'going')],{on:true,track:'X',day:'2026-11-08'},now);
  assert.equal(t[0].date,now);assert.equal(t[0].props.daysText,'In 2 days');assert.equal(t[0].props.raceLive,true);
  assert.equal(t[1].date.getHours(),0);assert.equal(t[1].props.daysText,'Tomorrow');assert.equal(t[1].props.raceLive,false);
  assert.equal(t[2].props.daysText,'Today');assert.equal(t[3].props.hasEvent,false);assert.equal(t.length,4);
  assert.equal(nextEventTimeline([],null,now).length,2);
});
