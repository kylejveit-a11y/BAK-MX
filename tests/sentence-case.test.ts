import test from 'node:test';
import assert from 'node:assert/strict';
import {sentenceCase} from '../apps/mobile/src/sentenceCase.ts';

test('all-caps section labels read as sentence case; names and acronyms keep their capitals',()=>{
 assert.equal(sentenceCase('UP NEXT',true),'Up next');
 assert.equal(sentenceCase('BAK’S SETUP FOR ',true),'BAK’s setup for ');
 assert.equal(sentenceCase('RACE DAY · ',true),'Race day · ');
 assert.equal(sentenceCase(' · SESSION ',false),' · Session ');
 assert.equal(sentenceCase('FUEL PLAN · PARENT VIEW',true),'Fuel plan · Parent view');
 assert.equal(sentenceCase('Croom Motorcycle Area',false),'Croom Motorcycle Area');
 assert.equal(sentenceCase('NEW IN BAK MX',true),'New in BAK MX');
 assert.equal(sentenceCase('PART NUMBERS (BY SIZE OR COLOR)',true),'Part numbers (by size or color)');
});
