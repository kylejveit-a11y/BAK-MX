// Garage sharing: a bike can be shown on the rider's profile with the photos they pick, and its build sheet set public or
// private once. Everything is off until the rider turns it on.
import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Image,ScrollView,Switch,Text,View} from 'react-native';
import type {Bike} from '../../../shared/types';
import {api} from './api';
import type {Photo} from './photos';
import {PhotoViewer} from './PhotoUI';
import {Pressable} from './Touch';
import {Card,Eyebrow,Notice,colors} from './ui';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
type Sharing={show_on_profile:boolean;build_sheet_public:boolean;photo_ids:string[]};

export function useGarageSharing(bikeId?:string){
 const [sharing,setSharing]=useState<Sharing|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!bikeId)return;try{setError('');setSharing(await api<Sharing>(`/api/garage-sharing?bike_id=${bikeId}`));}catch(e){setError(errorText(e));}},[bikeId]);
 useEffect(()=>{setSharing(null);void load();},[load]);
 return {sharing,setSharing,error,reload:load};
}

/** Garage › Photos: show this bike on your profile, pick which photos, and make the build sheet public or keep it private. */
export function ProfileSharing({bike,photos,onChanged}:{bike:Bike;photos:Photo[];onChanged?:()=>void}){
 const {sharing,setSharing,error}=useGarageSharing(bike.id);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function save(next:Partial<Sharing>){
  if(!sharing)return;setBusy(true);setNotice('');
  try{const saved=await api<Sharing>('/api/garage-sharing','PUT',{bike_id:bike.id,show_on_profile:sharing.show_on_profile,build_sheet_public:sharing.build_sheet_public,photo_ids:sharing.photo_ids,...next});setSharing(saved);onChanged?.();}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!sharing)return <Card><Eyebrow>PROFILE</Eyebrow>{error?<Notice text={error}/>:<ActivityIndicator color={colors.accent}/>}</Card>;
 const on=sharing.show_on_profile,picked=new Set(sharing.photo_ids);
 const toggle=(id:string)=>{const ids=picked.has(id)?sharing.photo_ids.filter(x=>x!==id):[...sharing.photo_ids,id];if(ids.length>8){setNotice('Choose up to 8 photos.');return;}void save({photo_ids:ids});};
 const row=(title:string,detail:string,value:boolean,onChange:(v:boolean)=>void)=><View style={{flexDirection:'row',alignItems:'center',gap:12}}>
  <View style={{flex:1,gap:3}}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{title}</Text><Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{detail}</Text></View>
  <Switch value={value} disabled={busy} onValueChange={onChange} trackColor={{true:colors.primary,false:'#2a2f39'}} accessibilityLabel={title}/>
 </View>;
 return <Card>
  <Eyebrow>PROFILE</Eyebrow>
  {row('Show this bike on my profile',on?'Riders see the bike and the photos you tick below.':'Off: only you see this bike and its photos.',on,v=>void save({show_on_profile:v,build_sheet_public:v&&sharing.build_sheet_public,photo_ids:v?sharing.photo_ids:[]}))}
  {on&&<View style={{gap:8}}>
   <Text style={{color:'#9aa2ae',fontSize:12.5}}>{photos.length?`Tap photos to show them · ${picked.size} of up to 8 shown`:'Add photos above, then tick the ones to show.'}</Text>
   {!!photos.length&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
    {photos.map(p=>{const sel=picked.has(p.id);return <Pressable key={p.id} haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:sel}} accessibilityLabel={sel?'Shown on profile':'Not shown'} disabled={busy} onPress={()=>toggle(p.id)}>
     <Image source={{uri:p.url}} style={{width:76,height:76,borderRadius:10,opacity:sel?1:0.45,borderWidth:2,borderColor:sel?colors.accent:'transparent'}} accessibilityIgnoresInvertColors/>
     {sel&&<View style={{position:'absolute',top:5,right:5,width:20,height:20,borderRadius:10,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:12,fontWeight:'900'}}>✓</Text></View>}
    </Pressable>;})}
   </ScrollView>}
  </View>}
  {on&&row('Public build sheet',sharing.build_sheet_public?'Anyone who sees this bike can read its parts list. Never your settings, notes, hours or rider details.':'Private: only you see the parts list.',sharing.build_sheet_public,v=>void save({build_sheet_public:v}))}
  <Notice text={notice}/>
 </Card>;
}

export type PublicBike={id:string;label:string;photos:Photo[];sheet:'mine'|'public'|'private'};
type Sheet={bike:{label:string};parts:{system:string;system_label:string;name:string;detail:string;off_bike:boolean}[];stock_systems:string[]};

/** A rider's profile: the bikes they show, their photos, and the build sheet when it's public. */
export function PublicGarage({bikes}:{bikes:PublicBike[]}){
 if(!bikes.length)return null;
 return <View style={{gap:12}}><Eyebrow>GARAGE</Eyebrow>{bikes.map(b=><PublicBikeCard key={b.id} bike={b}/>)}</View>;
}
function PublicBikeCard({bike}:{bike:PublicBike}){
 const state=bike.sheet,[sheet,setSheet]=useState<Sheet|null>(null),[open,setOpen]=useState(false),[viewer,setViewer]=useState<number|null>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 async function view(){if(open){setOpen(false);return;}setBusy(true);setNotice('');try{setSheet(await api<Sheet>(`/api/build-sheet?bike_id=${bike.id}`));setOpen(true);}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const groups=sheet?Object.entries(sheet.parts.reduce<Record<string,Sheet['parts']>>((m,p)=>{(m[p.system_label]??=[]).push(p);return m;},{})):[];
 return <Card>
  <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{bike.label}</Text>
  {!!bike.photos.length&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
   {bike.photos.map((p,i)=><Pressable key={p.id} accessibilityRole="imagebutton" accessibilityLabel={`Photo ${i+1} of ${bike.label}`} onPress={()=>setViewer(i)}><Image source={{uri:p.url}} style={{width:150,height:112,borderRadius:12,backgroundColor:'#101217'}} accessibilityIgnoresInvertColors/></Pressable>)}
  </ScrollView>}
  {state==='mine'&&<Text style={{color:colors.muted,fontSize:13.5}}>This is how riders see your bike. Set the build sheet public or private in Garage › Photos.</Text>}
  {state==='private'&&<Text style={{color:colors.muted,fontSize:13.5}}>Build sheet is private.</Text>}
  {(state==='public'||state==='mine')&&<Pressable accessibilityRole="button" onPress={()=>void view()} hitSlop={6}><Text style={{color:colors.accent,fontSize:15,fontWeight:'700'}}>{open?'Hide build sheet':busy?'Loading…':'View build sheet'}</Text></Pressable>}
  {open&&sheet&&<View style={{gap:10}}>
   {!groups.length&&<Text style={{color:colors.muted,fontSize:14}}>No parts recorded yet.</Text>}
   {groups.map(([label,parts])=><View key={label} style={{gap:3}}>
    <Text style={{color:'#9aa2ae',fontSize:12,fontWeight:'700',letterSpacing:0.6}}>{label.toUpperCase()}</Text>
    {parts.map((p,i)=><Text key={i} selectable style={{color:colors.text,fontSize:14.5,lineHeight:20}}>{p.name}{p.detail?<Text style={{color:colors.muted}}> · {p.detail}</Text>:null}{p.off_bike?<Text style={{color:colors.muted}}> (spare, off the bike)</Text>:null}</Text>)}
   </View>)}
   {!!sheet.stock_systems.length&&<Text style={{color:colors.muted,fontSize:13.5}}>Stock: {sheet.stock_systems.join(', ')}</Text>}
  </View>}
  <Notice text={notice}/>
  <PhotoViewer photos={bike.photos} start={viewer} onClose={()=>setViewer(null)}/>
 </Card>;
}
