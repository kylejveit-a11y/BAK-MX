import test from 'node:test';
import assert from 'node:assert/strict';
import {crewTags,fitsFilter,filterCount,NO_FILTER} from '../shared/crew.ts';
import {eventSchema} from '../server/rider-surfaces.ts';
test('any matches every filter; narrowed events match only their own',()=>{
 const f={skill:'beginner',bike:'mini',discipline:'mx'} as const;
 assert.ok(fitsFilter({skill_level:'any',bike_size:'any',discipline:'any'},f));
 assert.ok(fitsFilter({skill_level:'beginner',bike_size:'mini',discipline:'any'},f));
 assert.ok(!fitsFilter({skill_level:'expert'},f));
 assert.ok(fitsFilter({skill_level:'expert'},NO_FILTER));
 assert.equal(filterCount(f),3);
});
test('cards show only what the host narrowed',()=>{
 assert.deepEqual(crewTags({skill_level:'any',bike_size:'peewee',discipline:'any'}),['Pee-wee (50–65)']);
 assert.deepEqual(crewTags({}),[]);
});
test('event schema defaults crew fields to any and rejects unknown values',()=>{
 const base={title:'Sat practice',event_type:'practice',starts_at:'2026-12-01T14:00:00Z',location_name:'Dade City'};
 const p=eventSchema.parse(base);assert.equal(p.skill_level,'any');assert.equal(p.bike_size,'any');assert.equal(p.discipline,'any');
 assert.ok(!eventSchema.safeParse({...base,skill_level:'godlike'}).success);
});
