import {createAttempt} from '../shared/create-retry';
const key=(owner:string,kind:string)=>`bakmx:create:v1:${owner}:${kind}`;
export function createSubmission(owner:string,kind:string,input:Record<string,unknown>){
 const storageKey=key(owner,kind);let previous:unknown;
 try{const raw=localStorage.getItem(storageKey);previous=raw?JSON.parse(raw):null;}catch{throw Error('This browser could not restore the pending save. Recover its local data before retrying.');}
 const attempt=createAttempt(previous,input,()=>crypto.randomUUID());
 try{localStorage.setItem(storageKey,JSON.stringify(attempt));}catch{throw Error('This browser could not save the retry record. Free browser storage and try again.');}
 return {...input,create_id:attempt.id};
}
export function finishCreate(owner:string,kind:string){try{localStorage.removeItem(key(owner,kind));}catch{/* The server already acknowledged this ID; retaining it remains safe to retry. */}}
