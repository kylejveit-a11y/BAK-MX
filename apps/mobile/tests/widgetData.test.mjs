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
