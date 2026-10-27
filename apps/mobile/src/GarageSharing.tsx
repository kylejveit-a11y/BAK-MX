// Garage sharing: a bike can be shown on the rider's profile with the photos they pick. The build sheet stays private;
// other riders ask for it, and the owner approves, declines or stops sharing later. Off until the rider turns it on.
import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Alert,Image,ScrollView,Switch,Text,View} from 'react-native';
import type {Bike} from '../../../shared/types';
import {api} from './api';
import type {Photo} from './photos';
import {PhotoViewer} from './PhotoUI';
import {Pressable} from './Touch';
import {Avatar,Button,Card,Eyebrow,Notice,colors} from './ui';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
type Rider={user_id:string;handle:string;display_name:string;avatar_url?:string};
type Request={id:string;rider:Rider;status:'pending'|'approved'|'declined'|'revoked';created_at:string};
type Sharing={show_on_profile:boolean;photo_ids:string[];requests:Request[]};
const name=(r:Rider)=>r.display_name||'@'+r.handle;

export function useGarageSharing(bikeId?:string){
 const [sharing,setSharing]=useState<Sharing|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!bikeId)return;try{setError('');setSharing(await api<Sharing>(`/api/garage-sharing?bike_id=${bikeId}`));}catch(e){setError(errorText(e));}},[bikeId]);
 useEffect(()=>{setSharing(null);void load();},[load]);
 return {sharing,setSharing,error,reload:load};
}

/** Garage › Photos: show this bike on your profile, pick which photos, and answer build-sheet requests. */
export function ProfileSharing({bike,photos,onChanged}:{bike:Bike;photos:Photo[];onChanged?:()=>void}){
 const {sharing,setSharing,error,reload}=useGarageSharing(bike.id);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function save(next:{show_on_profile:boolean;photo_ids:string[]}){
  setBusy(true);setNotice('');
  try{const saved=await api<{show_on_profile:boolean;photo_ids:string[]}>('/api/garage-sharing','PUT',{bike_id:bike.id,...next});setSharing(old=>old?{...old,...saved}:old);onChanged?.();}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 async function answer(r:Request,decision:'approve'|'decline'|'revoke'){
  setNotice('');try{await api('/api/build-sheet-requests/answer','POST',{id:r.id,decision});await reload();}catch(e){setNotice(errorText(e));}
 }
 if(!sharing)return <Card><Eyebrow>PROFILE</Eyebrow>{error?<Notice text={error}/>:<ActivityIndicator color={colors.accent}/>}</Card>;
 const on=sharing.show_on_profile,picked=new Set(sharing.photo_ids);
 const toggle=(id:string)=>{const ids=picked.has(id)?sharing.photo_ids.filter(x=>x!==id):[...sharing.photo_ids,id];if(ids.length>8){setNotice('Choose up to 8 photos.');return;}void save({show_on_profile:true,photo_ids:ids});};
 const pending=sharing.requests.filter(r=>r.status==='pending'),approved=sharing.requests.filter(r=>r.status==='approved');
 return <Card>
  <Eyebrow>PROFILE</Eyebrow>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
   <View style={{flex:1,gap:3}}>
    <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Show this bike on my profile</Text>
    <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{on?'Riders see the bike and the photos you tick below. Your parts list stays private until you approve a request.':'Off: only you see this bike and its photos.'}</Text>
   </View>
   <Switch value={on} disabled={busy} onValueChange={v=>void save({show_on_profile:v,photo_ids:v?sharing.photo_ids:[]})} trackColor={{true:colors.primary,false:'#2a2f39'}} accessibilityLabel="Show this bike on my profile"/>
  </View>
  {on&&<View style={{gap:8}}>
   <Text style={{color:'#9aa2ae',fontSize:12.5}}>{photos.length?`Tap photos to show them · ${picked.size} of up to 8 shown`:'Add photos above, then tick the ones to show.'}</Text>
   {!!photos.length&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
    {photos.map(p=>{const sel=picked.has(p.id);return <Pressable key={p.id} haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:sel}} accessibilityLabel={sel?'Shown on profile':'Not shown'} disabled={busy} onPress={()=>toggle(p.id)}>
     <Image source={{uri:p.url}} style={{width:76,height:76,borderRadius:10,opacity:sel?1:0.45,borderWidth:2,borderColor:sel?colors.accent:'transparent'}} accessibilityIgnoresInvertColors/>
     {sel&&<View style={{position:'absolute',top:5,right:5,width:20,height:20,borderRadius:10,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:12,fontWeight:'900'}}>✓</Text></View>}
    </Pressable>;})}
   </ScrollView>}
  </View>}
  <Notice text={notice}/>
  {(pending.length>0||approved.length>0)&&<View style={{gap:10,paddingTop:4}}>
   {pending.length>0&&<Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>Build sheet requests</Text>}
   {pending.map(r=><View key={r.id} style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Avatar name={name(r.rider)} uri={r.rider.avatar_url} size={34}/>
    <Text style={{flex:1,color:colors.text,fontSize:14.5}}>{name(r.rider)} <Text style={{color:colors.muted}}>wants to see your parts list</Text></Text>
    <Pressable accessibilityRole="button" onPress={()=>void answer(r,'approve')} hitSlop={6}><Text style={{color:colors.accent,fontSize:14.5,fontWeight:'700'}}>Share</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={()=>void answer(r,'decline')} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>No</Text></Pressable>
   </View>)}
   {approved.length>0&&<Text style={{color:colors.text,fontSize:15,fontWeight:'700',paddingTop:pending.length?6:0}}>Sharing your build sheet with</Text>}
   {approved.map(r=><View key={r.id} style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Avatar name={name(r.rider)} uri={r.rider.avatar_url} size={34}/>
    <Text style={{flex:1,color:colors.text,fontSize:14.5}}>{name(r.rider)}</Text>
    <Pressable accessibilityRole="button" onPress={()=>Alert.alert(`Stop sharing with ${name(r.rider)}?`,'They won’t see your parts list any more.',[{text:'Cancel',style:'cancel'},{text:'Stop sharing',style:'destructive',onPress:()=>void answer(r,'revoke')}])} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>Stop</Text></Pressable>
   </View>)}
  </View>}
 </Card>;
}

export type PublicBike={id:string;label:string;photos:Photo[];sheet:'mine'|'none'|'pending'|'approved'|'declined'|'revoked'};
type Sheet={bike:{label:string};parts:{system:string;system_label:string;name:string;detail:string;off_bike:boolean}[];stock_systems:string[]};

/** A rider's profile: the bikes they show, their photos, and asking for (or reading) the build sheet. */
export function PublicGarage({bikes}:{bikes:PublicBike[]}){
 if(!bikes.length)return null;
 return <View style={{gap:12}}><Eyebrow>GARAGE</Eyebrow>{bikes.map(b=><PublicBikeCard key={b.id} bike={b}/>)}</View>;
}
function PublicBikeCard({bike}:{bike:PublicBike}){
 const [state,setState]=useState(bike.sheet),[sheet,setSheet]=useState<Sheet|null>(null),[open,setOpen]=useState(false),[viewer,setViewer]=useState<number|null>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 async function ask(){setBusy(true);setNotice('');try{const r=await api<{status:PublicBike['sheet']}>('/api/build-sheet-requests','POST',{bike_id:bike.id});setState(r.status);}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 async function view(){if(open){setOpen(false);return;}setBusy(true);setNotice('');try{setSheet(await api<Sheet>(`/api/build-sheet?bike_id=${bike.id}`));setOpen(true);}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const groups=sheet?Object.entries(sheet.parts.reduce<Record<string,Sheet['parts']>>((m,p)=>{(m[p.system_label]??=[]).push(p);return m;},{})):[];
 return <Card>
  <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{bike.label}</Text>
  {!!bike.photos.length&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>
   {bike.photos.map((p,i)=><Pressable key={p.id} accessibilityRole="imagebutton" accessibilityLabel={`Photo ${i+1} of ${bike.label}`} onPress={()=>setViewer(i)}><Image source={{uri:p.url}} style={{width:150,height:112,borderRadius:12,backgroundColor:'#101217'}} accessibilityIgnoresInvertColors/></Pressable>)}
  </ScrollView>}
  {state==='mine'&&<Text style={{color:colors.muted,fontSize:13.5}}>This is how riders see your bike. Your parts list shows only to riders you approve.</Text>}
  {(state==='none'||state==='declined'||state==='revoked')&&<Button secondary disabled={busy} title={busy?'Asking…':'Ask to see the build sheet'} onPress={()=>void ask()}/>}
  {state==='pending'&&<Text style={{color:colors.muted,fontSize:14}}>Build sheet requested. You’ll get a message when they answer.</Text>}
  {(state==='approved'||state==='mine')&&<Pressable accessibilityRole="button" onPress={()=>void view()} hitSlop={6}><Text style={{color:colors.accent,fontSize:15,fontWeight:'700'}}>{open?'Hide build sheet':busy?'Loading…':'View build sheet'}</Text></Pressable>}
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
