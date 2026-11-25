import test from 'node:test';
import assert from 'node:assert/strict';
import {csvCell,logFileName,serviceLogCsv,setupLogCsv} from '../shared/log-export.ts';

const ev=(o:object)=>({id:'1',user_id:'u',bike_id:'b',category:'Engine oil',performed_at:'2026-11-01T12:00:00Z',engine_hours:12.5,notes:'',next_due_hours:null,interval_source:'',created_at:'',...o}) as never;
const log=(o:object)=>({id:'1',user_id:'u',bike_id:'b',recorded_at:'2026-11-02T12:00:00Z',track:'',conditions:'',engine_hours:null,settings:{},change_made:'',result:'better',notes:'',created_at:'',...o}) as never;

test('cells are quoted when they must be and can never run as a formula',()=>{
 assert.equal(csvCell('Engine oil'),'Engine oil');
 assert.equal(csvCell('10W-40, 1 qt'),'"10W-40, 1 qt"');
 assert.equal(csvCell('said "tight"'),'"said ""tight"""');
 assert.equal(csvCell('line one\nline two'),'"line one\nline two"');
 assert.equal(csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"');
 assert.equal(csvCell('-2 clicks'),"'-2 clicks");
 assert.equal(csvCell(-2),'-2');
 assert.equal(csvCell(null),'');
});
test('service history: named, dated, newest first, blanks stay blank',()=>{
 const out=serviceLogCsv('2024 KTM 450 SX-F',[ev({}),ev({category:'Air filter',performed_at:'2026-11-20T09:00:00Z',engine_hours:null,next_due_hours:20,notes:'Twin Air, oiled'})],'2026-11-25T10:00:00Z').split('\r\n');
 assert.equal(out[0],'BAK MX service history,2024 KTM 450 SX-F');
 assert.equal(out[1],'Exported,2026-11-25');
 assert.equal(out[3],'Date,Job,Engine hours,Next due at (hours),Notes');
 assert.equal(out[4],'2026-11-20,Air filter,,20,"Twin Air, oiled"');
 assert.equal(out[5],'2026-11-01,Engine oil,12.5,,');
});
test('setup log: only settings the rider used get a column',()=>{
 const out=setupLogCsv('Bike',[log({track:'Dade City',settings:{fork_compression:'12',shock_rebound:null},change_made:'Fork comp 2 softer',result:'worse'})],'2026-11-25T10:00:00Z').split('\r\n');
 const head=out[3].split(',');
 assert.deepEqual(head.slice(0,7),['Date','Track','Conditions','Engine hours','Change made','Result','Notes']);
 assert.equal(head.length,8);
 assert.match(head[7],/^Fork: /);
 assert.equal(out[4],'2026-11-02,Dade City,,,Fork comp 2 softer,Worse,,12');
 assert.equal(setupLogCsv('Bike',[],'2026-11-25T10:00:00Z').split('\r\n')[3],'Date,Track,Conditions,Engine hours,Change made,Result,Notes');
});
test('file names are safe and say what they are',()=>{
 assert.equal(logFileName('service','2024 KTM 450 SX-F “Race bike”','2026-11-25T10:00:00Z'),'bakmx-service-2024-ktm-450-sx-f-race-bike-2026-11-25.csv');
 assert.equal(logFileName('setup','','x'),'bakmx-setup-bike-log.csv');
});
