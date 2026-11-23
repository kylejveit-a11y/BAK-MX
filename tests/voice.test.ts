import test from 'node:test';
import assert from 'node:assert/strict';
import {VOICE,VOICES,monthStart,sessionSeconds,voiceInstructions,voiceStatus} from '../shared/voice.ts';

test('voice is Pro only, testers only, and stops at the allowance',()=>{
 assert.equal(voiceStatus('pro',true,0).allowed,true);
 assert.equal(voiceStatus('premium',true,0).why,'not_pro');
 assert.equal(voiceStatus('free',true,0).why,'not_pro');
 assert.equal(voiceStatus('pro',false,0).why,'not_in_test');
 assert.equal(voiceStatus('pro',true,VOICE.minutesPerMonth*60).why,'used_up');
 assert.equal(voiceStatus('pro',true,59*60).seconds_left,60);
 assert.equal(voiceStatus('free',true,99999,true).allowed,true);
});
test('a session never counts for more than the cap, and an unreported end is capped too',()=>{
 const start='2026-11-22T10:00:00.000Z';
 assert.equal(sessionSeconds({started_at:start,ended_at:null,seconds:90}),90);
 assert.equal(sessionSeconds({started_at:start,ended_at:null,seconds:999999}),VOICE.maxSessionSeconds);
 assert.equal(sessionSeconds({started_at:start,ended_at:'2026-11-22T10:02:00.000Z',seconds:null}),120);
 assert.equal(sessionSeconds({started_at:start,ended_at:null,seconds:null},new Date('2026-11-23T10:00:00.000Z')),VOICE.maxSessionSeconds);
});
test('the allowance month starts on the 1st (UTC)',()=>{assert.equal(monthStart(new Date('2026-11-22T23:59:00Z')),'2026-11-01T00:00:00.000Z');});
test('the voice instructions hand bike questions off and never name the provider',()=>{
 const text=voiceInstructions('2025 KTM 450 SX-F');
 assert.match(text,/2025 KTM 450 SX-F/);assert.match(text,/delegate/);assert.match(text,/not on file/);
 assert.doesNotMatch(text,/openai|gpt/i);
});
test('the shipped voice is one of the provider voices',()=>{assert.ok((VOICES as readonly string[]).includes(VOICE.voice));});
