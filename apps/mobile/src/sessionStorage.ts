export type SecureStorage={getItemAsync:(key:string)=>Promise<string|null>;setItemAsync:(key:string,value:string)=>Promise<void>;deleteItemAsync:(key:string)=>Promise<void>};
export function createSessionStorage(secure:SecureStorage){
async function chunkCount(key:string){const count=Number(await secure.getItemAsync(key+'.count'));return Number.isInteger(count)&&count>0&&count<10000?count:0;}
async function removeChunks(key:string){const count=await chunkCount(key);for(let i=0;i<count;i++)await secure.deleteItemAsync(key+'.'+i);await secure.deleteItemAsync(key+'.count');}
return {
 async getItem(key:string){const slot=await secure.getItemAsync(key+'.slot');const base=slot==='0'||slot==='1'?key+'.slot'+slot:key;const count=await chunkCount(base);if(!count)return null;const chunks=await Promise.all(Array.from({length:count},(_,i)=>secure.getItemAsync(base+'.'+i)));return chunks.some(v=>v===null)?null:chunks.join('');},
 async setItem(key:string,value:string){
  // Keep the last complete session until every chunk of the next one is written.
  const current=await secure.getItemAsync(key+'.slot'),next=current==='0'?'1':'0',base=key+'.slot'+next;
  await removeChunks(base);const chars=Array.from(value),chunks=Array.from({length:Math.ceil(chars.length/400)},(_,i)=>chars.slice(i*400,(i+1)*400).join(''));
  for(let i=0;i<chunks.length;i++)await secure.setItemAsync(base+'.'+i,chunks[i]);
  await secure.setItemAsync(base+'.count',String(chunks.length));await secure.setItemAsync(key+'.slot',next);
 },
 async removeItem(key:string){await secure.deleteItemAsync(key+'.slot');await removeChunks(key);await removeChunks(key+'.slot0');await removeChunks(key+'.slot1');}
};
}
