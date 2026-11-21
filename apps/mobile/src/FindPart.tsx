// Find a part: the rider opens it on purpose. Parts on file for this exact bike (factory list and aftermarket list),
// where to buy each, and a saved parts list. Also the one quiet line under an Ask BAK answer that opens it.
// Rules (Kyle): never push sales, nothing shown that is not on file for the bike, no prices BAK cannot stand behind.
import {useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Linking,Text,View} from 'react-native';
import {api} from './api';
import {Button,Card,colors,Copy,Field,LinkAction,Notice,Switch} from './ui';
import {Pressable} from './Touch';
import type {Bike} from '../../../shared/types';
import type {FoundPart,StoreLink} from '../../../shared/parts-hunter';

type Found={query:string;factory:FoundPart[];aftermarket:FoundPart[];has_factory_list:boolean;has_aftermarket_list:boolean};
type Saved={id:string;kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;stores:StoreLink[]};
const QUICK=['Brake pads','Chain','Sprocket','Air filter','Fork seals','Clutch plates','Spark plug','Wheel bearings','Grips','Levers'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const keyOf=(p:{kind:string;brand:string;name:string;part_number:string})=>`${p.kind}|${p.brand}|${p.name}|${p.part_number}`.toLowerCase();

// The Ask BAK line hands its search to this screen.
let pending='';const waiting=new Set<(q:string)=>void>();
export function openFindPart(query:string,go:()=>void){pending=query;go();waiting.forEach(f=>f(query));}

function Stores({stores}:{stores:StoreLink[]}){
 if(!stores.length)return <Copy>No part number on file, so BAK can’t point you at a store for this one.</Copy>;
 return <View style={{gap:2}}>{stores.map(s=><LinkAction key={s.store} title={s.how==='listing'?`${s.store}: this part`:`Search ${s.store}`} onPress={()=>{void Linking.openURL(s.url).catch(()=>{});}}/>)}
  <Text style={{color:colors.muted,fontSize:12.5,lineHeight:17}}>Opens the store. Check the fit for your year there before you order. BAK shows no prices and earns nothing from these links.</Text></View>;
}
function Row({p,saved,onSave,busy}:{p:FoundPart;saved:boolean;onSave:()=>void;busy:boolean}){
 const [open,setOpen]=useState(false);
 return <View style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:10,gap:6}}>
  <Text selectable style={{color:colors.text,fontSize:15.5,fontWeight:'600'}}>{p.kind==='aftermarket'?`${p.brand} ${p.name}`:p.name}</Text>
  <Text selectable style={{color:colors.muted,fontSize:13.5}}>{[p.kind==='factory'?`${p.brand} factory part`:'Aftermarket',p.part_number&&`Part no. ${p.part_number}`,p.kind==='factory'&&p.where&&`From: ${p.where.toLowerCase()}`].filter(Boolean).join('  ·  ')}</Text>
  <View style={{flexDirection:'row',gap:18}}>
   <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700',fontSize:14.5}}>{open?'Hide stores':'Where to buy'}</Text></Pressable>
   <Pressable accessibilityRole="button" disabled={saved||busy} onPress={onSave} hitSlop={8}><Text style={{color:saved?colors.muted:colors.text,fontWeight:'700',fontSize:14.5}}>{saved?'On my parts list':'Save to my parts list'}</Text></Pressable>
  </View>
  {open&&<Stores stores={p.stores}/>}
 </View>;
}

export function FindPartCard({bike,offerOn,setOfferOn}:{bike?:Bike;offerOn:boolean;setOfferOn:(on:boolean)=>void}){
 const [q,setQ]=useState(pending),[found,setFound]=useState<Found|null>(null),[saved,setSaved]=useState<Saved[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[openSaved,setOpenSaved]=useState('');
 const id=bike?.id;
 const search=useCallback(async(text:string)=>{
  if(!id||!text.trim())return;setBusy(true);setNotice('');
  try{setFound(await api<Found>(`/api/parts/find?bike_id=${id}&q=${encodeURIComponent(text.trim())}`));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 },[id]);
 useEffect(()=>{setFound(null);setSaved([]);if(!id)return;let live=true;api<Saved[]>('/api/saved-parts?bike_id='+id).then(r=>{if(live)setSaved(r);}).catch(()=>{});
  if(pending){const p=pending;pending='';setQ(p);void search(p);}
  const hear=(text:string)=>{pending='';setQ(text);void search(text);};waiting.add(hear);return()=>{live=false;waiting.delete(hear);};},[id,search]);
 async function save(p:FoundPart){
  if(!id)return;setBusy(true);setNotice('');
  try{await api('/api/saved-parts','POST',{bike_id:id,kind:p.kind,brand:p.brand,name:p.name,part_number:p.part_number});setSaved(await api<Saved[]>('/api/saved-parts?bike_id='+id));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 async function remove(s:Saved){
  if(!id)return;setBusy(true);setNotice('');
  try{await api(`/api/saved-parts?id=${s.id}`,'DELETE');setSaved(saved.filter(x=>x.id!==s.id));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 const savedKeys=new Set(saved.map(keyOf));const none=found&&!found.factory.length&&!found.aftermarket.length;
 return <Card><Copy strong>Find a part</Copy>
  <Copy>Parts on file for your {bike.model_year} {bike.model}. Type what you need.</Copy>
  <Field label="What do you need?" placeholder="Rear brake pads" value={q} onChangeText={setQ} returnKeyType="search" autoCorrect={false} onSubmitEditing={()=>void search(q)}/>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{QUICK.map(w=><Pressable key={w} accessibilityRole="button" onPress={()=>{setQ(w);void search(w);}} style={{paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:'#2a2f39'}}><Text style={{color:colors.text,fontSize:13.5}}>{w}</Text></Pressable>)}</View>
  <Button title="Find it" disabled={busy||!q.trim()} onPress={()=>void search(q)}/>
  {busy&&<ActivityIndicator color={colors.accent}/>}
  <Notice text={notice} tone={notice?'warn':undefined}/>
  {none&&<Copy>{!found.has_factory_list&&!found.has_aftermarket_list?'BAK has no parts list for this exact bike yet, so there is nothing to show.':`Nothing on file for “${found.query}” on this bike. Try fewer words, like “brake pads” or “chain”.`}</Copy>}
  {!!found?.factory.length&&<View style={{gap:10}}><Text style={{color:'#9aa2ae',fontSize:13.5,fontWeight:'700',marginTop:6}}>Factory parts</Text>{found.factory.map(p=><Row key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</View>}
  {!!found?.aftermarket.length&&<View style={{gap:10}}><Text style={{color:'#9aa2ae',fontSize:13.5,fontWeight:'700',marginTop:6}}>Aftermarket</Text>{found.aftermarket.map(p=><Row key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</View>}
  {!!found&&!none&&<Copy>The factory list is the maker’s own for your year. One search can list a few versions of a part; match the part number to the one on your bike.</Copy>}
  {!!saved.length&&<View style={{gap:10,marginTop:8}}><Text style={{color:'#9aa2ae',fontSize:13.5,fontWeight:'700'}}>My parts list ({saved.length})</Text>
   {saved.map(s=><View key={s.id} style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:10,gap:6}}>
    <Text selectable style={{color:colors.text,fontSize:15.5,fontWeight:'600'}}>{s.kind==='aftermarket'?`${s.brand} ${s.name}`:s.name}</Text>
    {!!s.part_number&&<Text selectable style={{color:colors.muted,fontSize:13.5}}>Part no. {s.part_number}</Text>}
    <View style={{flexDirection:'row',gap:18}}>
     <Pressable accessibilityRole="button" onPress={()=>setOpenSaved(openSaved===s.id?'':s.id)} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700',fontSize:14.5}}>{openSaved===s.id?'Hide stores':'Where to buy'}</Text></Pressable>
     <Pressable accessibilityRole="button" disabled={busy} onPress={()=>void remove(s)} hitSlop={8}><Text style={{color:colors.muted,fontWeight:'700',fontSize:14.5}}>Remove</Text></Pressable>
    </View>
    {openSaved===s.id&&<Stores stores={s.stores}/>}
   </View>)}</View>}
  <View style={{flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,borderTopColor:colors.line,paddingTop:12,marginTop:6}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>Suggest parts in Ask BAK</Text><Text style={{color:colors.muted,fontSize:13}}>One small line, at most once a chat, when an answer says a part needs replacing.</Text></View>
   <Switch value={offerOn} onValueChange={setOfferOn} accessibilityLabel="Suggest parts in Ask BAK"/>
  </View>
 </Card>;
}

/** Under an Ask BAK answer: shown only if this bike really has a matching part on file. Otherwise nothing. */
export function PartOfferLine({bikeId,query,onOpen}:{bikeId:string;query:string;onOpen:()=>void}){
 const [has,setHas]=useState(false);
 useEffect(()=>{let live=true;setHas(false);api<Found>(`/api/parts/find?bike_id=${bikeId}&q=${encodeURIComponent(query)}`).then(r=>{if(live)setHas(r.factory.length+r.aftermarket.length>0);}).catch(()=>{});return()=>{live=false;};},[bikeId,query]);
 if(!has)return null;
 return <LinkAction muted title="See parts that fit your bike" onPress={onOpen}/>;
}
