import test from 'node:test';
import assert from 'node:assert/strict';
import {localNoteUploads,shareText,riderNote} from '../../../shared/tuning-notes.ts';
const bike={id:'00000000-0000-4000-8000-0000000000d4',model_year:2025,manufacturer:'KTM',model:'450 SX-F',nickname:''};
test('notes saved on this phone (tuning-notes-<bike>) become account uploads with their own ids',()=>{
 // The exact shape App.tsx saved before notes moved to the account: {id,at,text,conversation}, conversation '' for a new chat.
 const phone=[{id:'00000000-0000-4000-8000-0000000000f1',at:'2026-10-01T12:00:00.000Z',text:'Rebound 2 slower',conversation:''}];
 const [u]=localNoteUploads(phone,bike);
 assert.deepEqual(u.body,{id:phone[0].id,bike_id:bike.id,rider_note:'Rebound 2 slower',noted_at:'2026-10-01T12:00:00.000Z',conversation_id:null});
 assert.deepEqual(localNoteUploads(phone,bike,[phone[0].id]),[]);
});
test('the text shared from the phone names the bike and day, never an id',()=>{
 const t=shareText(riderNote({bike,text:'Bars forward one position',at:'2026-11-07T15:00:00.000Z'}));
 assert.match(t,/2025 KTM 450 SX-F · Nov 7, 2026/);assert.match(t,/MY NOTE\nBars forward one position/);
 assert.doesNotMatch(t,/0000-4000/);
});
