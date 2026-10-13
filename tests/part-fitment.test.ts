import {test} from 'node:test';
import assert from 'node:assert/strict';
import {yearRanges} from '../shared/rider-types.ts';

test('year ranges collapse consecutive years and keep gaps visible',()=>{
 assert.equal(yearRanges([2020,2021,2022,2025]),'2020–2022, 2025');
 assert.equal(yearRanges([2024]),'2024');
 assert.equal(yearRanges([2023,2021,2022,2022]),'2021–2023');
 assert.equal(yearRanges([]),'');
});
