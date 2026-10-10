import test from 'node:test';
import assert from 'node:assert/strict';
import {createProgressStorage} from '../src/progressStorage.ts';
function fixture(){const values=new Map();let interrupt=false;return {values,interrupt:(value)=>{interrupt=value;},files:{read:key=>values.get(key)??null,write:(key,value)=>{if(interrupt){values.set(key,value.slice(0,Math.floor(value.length/2)));throw Error('interrupted write');}values.set(key,value);}}};}
test('interrupted progress writes retain the last complete snapshot across restart',()=>{
 const f=fixture(),store=createProgressStorage(f.files);
 store.write('job',{step:1,notes:'original'});f.interrupt(true);
 assert.throws(()=>store.write('job',{step:2,notes:'changed'}),/interrupted/);
 assert.deepEqual(createProgressStorage(f.files).read('job'),{step:1,notes:'original'});
 f.interrupt(false);store.write('job',{step:2,notes:'changed'});
 assert.deepEqual(createProgressStorage(f.files).read('job'),{step:2,notes:'changed'});
});
test('invalid latest snapshot falls back to previous and checks payload integrity',()=>{
 const f=fixture(),store=createProgressStorage(f.files);store.write('job',{step:1});store.write('job',{step:2});
 const newest=JSON.parse(f.values.get('job--snapshot1'));newest.json='{"step":999}';f.values.set('job--snapshot1',JSON.stringify(newest));
 assert.deepEqual(store.read('job'),{step:1});
});
test('legacy progress migrates without overwriting the legacy recovery copy',()=>{
 const f=fixture(),store=createProgressStorage(f.files);f.values.set('job',JSON.stringify({notes:'legacy'}));
 assert.deepEqual(store.read('job'),{notes:'legacy'});
 f.interrupt(true);assert.throws(()=>store.write('job',{notes:'new'}));assert.deepEqual(store.read('job'),{notes:'legacy'});
 f.interrupt(false);store.write('job',{notes:'new'});assert.deepEqual(store.read('job'),{notes:'new'});assert.deepEqual(JSON.parse(f.values.get('job')),{notes:'legacy'});
});
