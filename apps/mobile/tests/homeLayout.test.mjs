import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateLayout,DEFAULT_LAYOUT,HOME_BLOCKS} from '../src/homeLayout.ts';
test('a layout saved by an older Home drops retired blocks and gains the new ones in their standard place',()=>{
 const old=[{id:'ask',on:true},{id:'tools',on:true},{id:'service',on:false},{id:'bike',on:true},{id:'events',on:true}];
 const out=migrateLayout(old);
 assert.deepEqual(out.map(b=>b.id),['ask','bike','next','prep','coaching']);
 assert.ok(out.every(b=>HOME_BLOCKS.some(h=>h.id===b.id)));
 assert.equal(out.find(b=>b.id==='prep').on,false);
});
test('nothing saved, or junk, gives the standard layout',()=>{
 assert.deepEqual(migrateLayout(null),DEFAULT_LAYOUT);
 assert.deepEqual(migrateLayout([{id:42,on:true},null]),DEFAULT_LAYOUT);
});
test('a rider’s own order is kept; a new block lands after the one it follows in the standard layout',()=>{
 assert.deepEqual(migrateLayout([{id:'bike',on:true},{id:'ask',on:false}]).map(b=>b.id),['bike','next','prep','coaching','ask']);
});
