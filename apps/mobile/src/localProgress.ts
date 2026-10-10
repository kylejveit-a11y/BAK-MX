import {File,Paths,Directory} from 'expo-file-system';
import {useState} from 'react';
import {createProgressStorage,decodeSnapshot} from './progressStorage';

// Rider drafts and notes are device-local, partitioned by account and bike.
// Synchronous writes prevent an older autosave overwriting a newer draft.
export function localFile(account:string,key:string){return new File(Paths.document,`bakmx-${encodeURIComponent(account)}-${encodeURIComponent(key)}.json`);}
function progressStorage(account:string){return createProgressStorage({read:key=>{const file=localFile(account,key);return file.exists?file.textSync():null;},write:(key,text)=>{const file=localFile(account,key);file.create({overwrite:true});file.write(text);}});}
export function readProgress<T>(account:string,key:string,fallback:T):T{
 try{const value=progressStorage(account).read(key);if(value===undefined||(value===null&&fallback!==null))return fallback;if(Array.isArray(fallback)&&!Array.isArray(value))return fallback;if(fallback!==null&&typeof value!==typeof fallback)return fallback;return value as T;}catch{return fallback;}
}
export function writeProgress<T>(account:string,key:string,value:T){progressStorage(account).write(key,value);}
export function exportProgress(account:string){
 const prefix=`bakmx-${encodeURIComponent(account)}-`;
 return Object.fromEntries(new Directory(Paths.document).list().filter((file):file is File=>file instanceof File&&file.name.startsWith(prefix)).map(file=>{
  const key=file.name.slice(prefix.length,-5);try{const raw=file.textSync(),snapshot=decodeSnapshot(raw);if(snapshot)return [key,snapshot];try{return [key,JSON.parse(raw)];}catch{return [key,{recovery_required:true,raw_text:raw}];}}catch{return [key,{recovery_required:true,error:'This saved file could not be read.'}];}
 }));
}
export function clearProgress(account:string){
 const prefix=`bakmx-${encodeURIComponent(account)}-`;
 for(const file of new Directory(Paths.document).list())if(file instanceof File&&file.name.startsWith(prefix))file.delete();
}
export function useProgress<T>(account:string,key:string,fallback:T,options:{durable?:boolean}={}){
 const [value,setValue]=useState<T>(()=>readProgress(account,key,fallback));
 const [error,setError]=useState('');
 function save(next:T){if(!options.durable)setValue(next);try{writeProgress(account,key,next);if(options.durable)setValue(next);setError('');return true;}catch{setError('This device could not save your latest progress. Keep this screen open and try again.');return false;}}
 return [value,save,error] as const;
}
