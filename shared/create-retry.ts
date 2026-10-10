export type CreateAttempt={id:string;payload:string};
export function canonicalJson(value:unknown):string{return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);}
export function createAttempt(previous:unknown,input:unknown,newId:()=>string):CreateAttempt{
 const payload=canonicalJson(input),saved=previous as CreateAttempt|null;
 return saved&&typeof saved.id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved.id)&&saved.payload===payload?saved:{id:newId(),payload};
}
