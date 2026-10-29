// Tracks have no signal. Reads keep a copy of the last good answer on the phone and serve it when the network is gone;
// writes that can't go out wait in a queue and are sent, in order, as soon as a request succeeds again. Pure where it can be,
// so the rules are testable in Node; the storage and network pieces are passed in.
import {useEffect,useState} from 'react';

export type PendingWrite={id:string;path:string;body:unknown;created_at:string;label:string};
type Listener=()=>void;

/** Whether the last request could reach BAK MX. Shown to the rider as a plain line; never blocks a screen. */
export const connection={offline:false};
const listeners=new Set<Listener>();
const notify=()=>{for(const l of listeners)l();};
export function setOffline(v:boolean){if(connection.offline===v)return;connection.offline=v;notify();}
/** Errors that mean "no signal" rather than "the server said no". */
export const isNetworkError=(e:unknown)=>e instanceof Error&&!('status' in e)&&/could not reach|timed out|network request failed|connection dropped/i.test(e.message);

const CACHE_LIMIT=200_000;
export type Store={read:<T>(key:string,fallback:T)=>T;write:(key:string,value:unknown)=>void};
export const cacheKey=(path:string)=>'cache:'+path;
/** Keeps a GET's answer for offline use. Big answers are skipped so the phone's store stays small. */
export function remember(store:Store,path:string,data:unknown){
 try{const text=JSON.stringify(data);if(text.length>CACHE_LIMIT)return;store.write(cacheKey(path),{at:new Date().toISOString(),data});}catch{/* best effort */}
}
export function recall<T>(store:Store,path:string):{at:string;data:T}|null{
 const v=store.read<{at:string;data:T}|null>(cacheKey(path),null);return v&&typeof v.at==='string'?v:null;
}

const QUEUE='pending-writes';
export function pending(store:Store):PendingWrite[]{const q=store.read<PendingWrite[]>(QUEUE,[]);return Array.isArray(q)?q:[];}
export function enqueue(store:Store,w:PendingWrite){store.write(QUEUE,[...pending(store),w]);notify();}
function dequeue(store:Store,id:string){store.write(QUEUE,pending(store).filter(w=>w.id!==id));notify();}

/** A row the rider sees right away while the real one waits to be sent. */
export const LOCAL_PREFIX='local-';
export const isLocal=(id:string)=>id.startsWith(LOCAL_PREFIX);

/** Merges rows waiting to be sent into a list from the cache or server, newest first by recorded time. */
export function withPending<T extends {id:string}>(rows:T[],queued:PendingWrite[],path:string,toRow:(w:PendingWrite)=>T|null,time:(r:T)=>string):T[]{
 const extra=queued.filter(w=>w.path===path).map(toRow).filter((r):r is T=>!!r&&!rows.some(x=>x.id===r.id));
 return [...rows,...extra].sort((a,b)=>Date.parse(time(b))-Date.parse(time(a)));
}

let flushing=false;
/** Sends what's waiting, oldest first, stopping at the first failure so order is kept. */
export async function flush(store:Store,send:(path:string,body:unknown)=>Promise<unknown>):Promise<number>{
 if(flushing)return 0;flushing=true;let sent=0;
 try{
  for(const w of pending(store)){
   try{await send(w.path,w.body);dequeue(store,w.id);sent++;}
   catch(e){if(isNetworkError(e))break;/* the server refused it: drop it rather than retry forever, the rider can log it again */dequeue(store,w.id);}
  }
 }finally{flushing=false;}
 return sent;
}

/** Offline state and the number of changes waiting, for a banner. */
export function useConnection(store:Store|null){
 const [,tick]=useState(0);
 useEffect(()=>{const l=()=>tick(x=>x+1);listeners.add(l);return()=>{listeners.delete(l);};},[]);
 return {offline:connection.offline,waiting:store?pending(store).length:0};
}
