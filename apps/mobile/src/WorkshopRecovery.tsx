import React,{useState} from 'react';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type {Bike} from '../../../shared/types';
import {archivedWorkText} from '../../../shared/workshop-backup';
import {nativeWorkshopBackup,restoreNativeWorkshop} from './workshopRecoveryStorage';
import {View} from 'react-native';
import {Copy,LinkAction,Notice} from './ui';
export default function WorkshopRecovery({bike,onRestored}:{bike:Bike;onRestored:(message:string)=>void}){
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[history,setHistory]=useState<string[]>([]);
 async function exportBackup(){setBusy(true);try{const backup=nativeWorkshopBackup(bike),file=new File(Paths.cache,`bakmx-workshop-${bike.id}.json`);file.create({overwrite:true});file.write(JSON.stringify(backup,null,2));if(!await Sharing.isAvailableAsync())throw Error('File sharing is unavailable on this device.');await Sharing.shareAsync(file.uri,{mimeType:'application/json',UTI:'public.json'});setNotice('Backup saved. Keep a copy somewhere outside the app.');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
 async function importBackup(){setBusy(true);try{const selected=await File.pickFileAsync({mimeTypes:['application/json','text/plain']});if(selected.canceled)return;if(selected.result.size>5_000_000)throw Error('Choose a workshop backup smaller than 5 MB.');const restored=restoreNativeWorkshop(await selected.result.text(),bike);onRestored(`Restored: ${restored.journals.length} ${restored.journals.length===1?'job':'jobs'} of notes, ${restored.procedures.length} guided ${restored.procedures.length===1?'job':'jobs'} and ${restored.archived.length} older ${restored.archived.length===1?'record':'records'}. What was already here is kept.`);}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}}
 // A quiet row at the bottom of the Workshop: job notes live on this phone, so this is how they move to a new one.
 return <View style={{gap:8,paddingTop:8}}><Copy>Job notes and guide progress are saved on this phone. Back them up to a file to move them to a new phone; restore adds to what is here, and notes from an older build stay readable.</Copy><View style={{flexDirection:'row',gap:18,flexWrap:'wrap'}}><LinkAction muted arrow={false} disabled={busy} title="Back up job notes" onPress={()=>void exportBackup()}/><LinkAction muted arrow={false} disabled={busy} title="Restore" onPress={()=>void importBackup()}/><LinkAction muted arrow={false} disabled={busy} title="Older notes" onPress={()=>{try{const records=nativeWorkshopBackup(bike).archived;setHistory(records.map(archivedWorkText));setNotice(records.length?'Notes from an older build or guide. Read-only.':'No older notes for this bike.');}catch(e){setNotice((e as Error).message);}}}/></View><Notice text={notice}/>{history.map((text,i)=><Copy key={i}>{text}</Copy>)}</View>;
}
