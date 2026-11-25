// Hands the rider a spreadsheet copy of a log through the system share sheet: save to Files, email it, or AirDrop it.
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function shareCsv(name:string,text:string,title:string):Promise<void>{
 const file=new File(Paths.cache,name);file.create({overwrite:true});
 file.write('﻿'+text); // the mark at the front makes Excel read accents and curly quotes correctly
 if(!await Sharing.isAvailableAsync())throw new Error('Sharing is not available on this device.');
 await Sharing.shareAsync(file.uri,{mimeType:'text/csv',UTI:'public.comma-separated-values-text',dialogTitle:title});
}
