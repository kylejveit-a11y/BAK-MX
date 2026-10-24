import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchTracks} from '../shared/track-match.ts';

const tracks=JSON.parse(readFileSync(new URL('../docs/research/tracks/load/tracks-FL.json',import.meta.url),'utf8'));
const ids=(q:string)=>matchTracks(q,tracks).map(t=>t.id);

test('riders name tracks the way they say them',()=>{
 assert.deepEqual(ids('I have a race at Dade City this weekend, what should I change?'),['dade-city-mx']);
 assert.deepEqual(ids('riding gatorback saturday'),['gatorback-cycle-park']);
 assert.deepEqual(ids('heading to WW Ranch'),['ww-ranch-motocross-park']);
 assert.deepEqual(ids('Orlando MX this weekend'),['orlando-mx-park']);
});
test('towns, everyday words and names alone are not tracks',()=>{
 for(const q of ['I live in Orlando','quick question about my forks','im in miami','harold said my sag is off','the glen was nice','sunshine all weekend'])assert.deepEqual(ids(q),[],q);
});
