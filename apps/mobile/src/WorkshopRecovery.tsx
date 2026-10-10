import React,{useState} from 'react';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type {Bike} from '../../../shared/types';
import {archivedWorkText} from '../../../shared/workshop-backup';
import {nativeWorkshopBackup,restoreNativeWorkshop} from './workshopRecoveryStorage';
import {Button,Card,Copy,Notice} from './ui';
export default function WorkshopRecovery({bike,onRestored}:{bike:Bike;onRestored:(message:string)=>void}){
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[history,setHistory]=useState<string[]>([]);
 async function exportBackup(){setBusy(true);try{const backup=nativeWorkshopBackup(bike),file=new File(Paths.cache,`bakmx-workshop-${bike.id}.json`);file.create({overwrite:true});file.write(JSON.stringify(backup,null,2));if(!await Sharing.isAvailableAsync())throw Error('File sharing is unavailable on this device.');await Sharing.shareAsync(file.uri,{mimeType:'application/json',UTI:'public.json'});setNotice('Workshop backup ready. Keep a copy outside the app.');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
 async function importBackup(){setBusy(true);try{const selected=await File.pickFileAsync({mimeTypes:['application/json','text/plain']});if(selected.canceled)return;if(selected.result.size>5_000_000)throw Error('Choose a workshop backup smaller than 5 MB.');const restored=restoreNativeWorkshop(await selected.result.text(),bike);onRestored(`Workshop restored: ${restored.journals.length} journals, ${restored.procedures.length} guide runs and ${restored.archived.length} historical records. Existing work was preserved.`);}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
 return <Card><Copy strong>Back up and recover your workshop</Copy><Copy>Move your records between devices using the same account and original Garage bike. Recovery adds records; older builds and conflicting versions stay readable as history.</Copy><Notice text={notice}/><Button secondary disabled={busy} title="Export workshop backup" onPress={()=>void exportBackup()}/><Button secondary disabled={busy} title="Import workshop backup" onPress={()=>void importBackup()}/><Button secondary disabled={busy} title="Read imported history" onPress={()=>{try{const records=nativeWorkshopBackup(bike).archived;setHistory(records.map(archivedWorkText));setNotice(records.length?'Historical records are read-only.':'No imported historical records for this bike.');}catch(e){setNotice((e as Error).message);}}}/>{history.map((text,i)=><Copy key={i}>{text}</Copy>)}</Card>;
}
