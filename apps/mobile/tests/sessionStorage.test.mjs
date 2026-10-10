import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionStorage} from '../src/sessionStorage.ts';
function fixture(){const values=new Map();let failOn='';return {values,fail:(key)=>{failOn=key;},storage:{getItemAsync:async key=>values.get(key)??null,setItemAsync:async(key,value)=>{if(key===failOn)throw Error('disk full');values.set(key,value);},deleteItemAsync:async key=>{values.delete(key);}}};}
test('interrupted session refresh preserves the last complete encrypted session',async()=>{
 const f=fixture(),session=createSessionStorage(f.storage);
 await session.setItem('account','first-session');
 f.fail('account.slot1.1');
 await assert.rejects(session.setItem('account','x'.repeat(900)),/disk full/);
 assert.equal(await session.getItem('account'),'first-session');
 f.fail('');await session.setItem('account','new-session');
 assert.equal(await session.getItem('account'),'new-session');
});
test('legacy sessions migrate and sign-out removes legacy and both rotating slots',async()=>{
 const f=fixture(),session=createSessionStorage(f.storage);
 f.values.set('account.count','1');f.values.set('account.0','legacy');
 assert.equal(await session.getItem('account'),'legacy');
 await session.setItem('account','🏁'.repeat(500));
 assert.equal(await session.getItem('account'),'🏁'.repeat(500));
 await session.setItem('account','latest');await session.removeItem('account');
 assert.equal(await session.getItem('account'),null);assert.equal(f.values.size,0);
});
