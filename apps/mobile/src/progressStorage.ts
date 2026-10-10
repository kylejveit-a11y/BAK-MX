export type ProgressFiles={read:(key:string)=>string|null;write:(key:string,text:string)=>void};
type Snapshot={slot:number;revision:number;value:unknown};
function checksum(text:string){let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);}
export function decodeSnapshot(raw:string):{revision:number;value:unknown}|null{
 try{const value=JSON.parse(raw);if(value.version!==1||!Number.isSafeInteger(value.revision)||value.revision<1||typeof value.json!=='string'||value.checksum!==checksum(`${value.revision}:${value.json}`))return null;return {revision:value.revision,value:JSON.parse(value.json)};}catch{return null;}
}
export function createProgressStorage(files:ProgressFiles){
 function snapshots(key:string):Snapshot[]{return [0,1].flatMap(slot=>{try{const raw=files.read(`${key}--snapshot${slot}`),decoded=raw===null?null:decodeSnapshot(raw);return decoded?[{slot,...decoded}]:[];}catch{return [];}}).sort((a,b)=>b.revision-a.revision);}
 return {
  read(key:string):unknown{const saved=snapshots(key)[0];if(saved)return saved.value;const legacy=files.read(key);if(legacy===null)return undefined;return JSON.parse(legacy);},
  write(key:string,value:unknown){
   const latest=snapshots(key)[0],slot=latest?.slot===0?1:0,revision=(latest?.revision??0)+1;
   if(!Number.isSafeInteger(revision))throw Error('Saved progress revision is invalid.');
   const json=JSON.stringify(value);if(json===undefined)throw Error('Progress must be serializable.');
   // Only replace the older slot. A partial write cannot destroy the last good snapshot.
   files.write(`${key}--snapshot${slot}`,JSON.stringify({version:1,revision,json,checksum:checksum(`${revision}:${json}`)}));
  }
 };
}
