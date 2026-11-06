import React,{useEffect,useState} from 'react';
import {ActivityIndicator,Image,Modal,Platform,Pressable as RNPressable,ScrollView,Text,View,useWindowDimensions} from 'react-native';
import {useVideoPlayer,VideoView} from 'expo-video';
import Purchases,{PRODUCT_CATEGORY} from 'react-native-purchases';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Pressable} from './Touch';
import {Button,Icon,colors} from './ui';
import {api} from './api';
import {identifyPurchaser} from './billing';
import type {Photo} from './photos';
import type {VideoRef} from '../../../shared/rider-types';
import {EDIT_STYLES,EDIT_STYLE_LABELS,type EditStyle,type EditUsage} from '../../../shared/photo-edit';

const errorText=(e:unknown)=>e instanceof Error&&e.message?e.message:'Something went wrong. Try again.';
const uuid=()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==='x'?r:(r&0x3)|0x8).toString(16);});
export const clipLength=(n:number)=>`${Math.floor(n/60)}:${String(Math.round(n%60)).padStart(2,'0')}`;

/** A post's clip. It only loads when the rider taps play, so the feed stays fast on track-side signal. */
export function PostClip({video}:{video:VideoRef}){
 const {width}=useWindowDimensions(),[on,setOn]=useState(false);
 const ratio=video.width&&video.height?Math.min(1.6,Math.max(0.56,video.height/video.width)):0.5625,h=Math.round(width*ratio);
 if(!on)return <Pressable accessibilityRole="button" accessibilityLabel={`Play clip${video.duration_s?', '+clipLength(video.duration_s):''}`} onPress={()=>setOn(true)} style={{width,height:h,backgroundColor:'#000',alignItems:'center',justifyContent:'center'}}>
  {video.poster_url&&<Image source={{uri:video.poster_url}} style={{position:'absolute',width,height:h}} resizeMode="cover" accessibilityIgnoresInvertColors/>}
  <View style={{width:62,height:62,borderRadius:31,backgroundColor:'rgba(0,0,0,0.55)',alignItems:'center',justifyContent:'center'}}><Icon name="video" size={28}/></View>
  {!!video.duration_s&&<Text style={{position:'absolute',left:10,bottom:10,color:'#fff',fontSize:12.5,fontWeight:'700',backgroundColor:'rgba(0,0,0,0.6)',paddingHorizontal:8,paddingVertical:2,borderRadius:10,overflow:'hidden'}}>{clipLength(video.duration_s)}</Text>}
 </Pressable>;
 return <Player url={video.url} width={width} height={h}/>;
}
function Player({url,width,height}:{url:string;width:number;height:number}){
 const player=useVideoPlayer(url,p=>{p.muted=true;p.loop=false;p.play();});
 return <VideoView player={player} style={{width,height,backgroundColor:'#000'}} nativeControls contentFit="contain"/>;
}

/** What is left, in plain words. */
export function editsLeftText(u:EditUsage){
 const base=u.period==='lifetime'?`${u.left} of ${u.included} free edits left`:`${u.left} of ${u.included} edits left this month`;
 return u.credits>0?`${base} · ${u.credits} bought`:base;
}

/** Action-sports edit for one of the rider's own photos: light, colour and sharpness only. The rider keeps the original and
 *  chooses whether the post uses the edit. Out of edits: buy a pack in the app (App Store). */
export function PhotoEditSheet({photo,onUse,onClose}:{photo:Photo|null;onUse:(p:Photo)=>void;onClose:()=>void}){
 const insets=useSafeAreaInsets();
 const [usage,setUsage]=useState<EditUsage|null>(null),[style,setStyle]=useState<EditStyle>('magazine'),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[result,setResult]=useState<Photo|null>(null),[request,setRequest]=useState(uuid),[buying,setBuying]=useState('');
 const load=()=>api<EditUsage>('/api/photo-edits/usage?store=1').then(setUsage).catch(e=>setNotice(errorText(e)));
 useEffect(()=>{if(photo){setResult(null);setNotice('');void load();}},[photo?.id]);
 if(!photo)return null;
 const out=!!usage&&usage.left+usage.credits<1;
 async function run(){
  setBusy(true);setNotice('');
  try{const r=await api<{photo:Photo;usage:EditUsage}>('/api/photo-edits','POST',{photo_id:photo!.id,style,request_id:request});setResult(r.photo);setUsage(r.usage);setRequest(uuid());}
  // A dropped connection keeps the same request, so asking again returns that edit instead of paying for a second one.
  catch(e){setNotice(errorText(e));const st=(e as {status?:number}).status;if(st&&st!==504)setRequest(uuid());void load();}finally{setBusy(false);}
 }
 async function buy(product:string){
  setBuying(product);setNotice('');
  try{await identifyPurchaser();const [p]=await Purchases.getProducts([product],PRODUCT_CATEGORY.NON_SUBSCRIPTION);if(!p)throw new Error('That pack is not available right now.');
   await Purchases.purchaseStoreProduct(p);await api('/api/mobile/sync-entitlement','POST',{});await load();}
  catch(e){const cancelled=(e as {userCancelled?:boolean})?.userCancelled;if(!cancelled)setNotice(errorText(e));}finally{setBuying('');}
 }
 return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>{if(!busy)onClose();}}>
  <View style={{flex:1,backgroundColor:colors.bg,paddingTop:Platform.OS==='ios'?14:insets.top+10}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:12}}>
    <RNPressable accessibilityRole="button" disabled={busy} hitSlop={10} onPress={onClose} style={{flex:1}}><Text style={{color:'#b2b9c4',fontSize:16}}>Close</Text></RNPressable>
    <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>Action edit</Text><View style={{flex:1}}/>
   </View>
   <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:Math.max(insets.bottom,20)+10,gap:14}}>
    <View style={{gap:8}}>
     <Image source={{uri:(result??photo).url}} style={{width:'100%',aspectRatio:photo.width&&photo.height?photo.width/photo.height:1.5,borderRadius:12,backgroundColor:'#000'}} resizeMode="contain" accessibilityLabel={result?`${EDIT_STYLE_LABELS[style].title} edit`:'Your photo'}/>
     {busy&&<View style={{flexDirection:'row',gap:10,alignItems:'center'}}><ActivityIndicator color={colors.accent}/><Text style={{color:'#cfd5de'}}>Editing… about 20 to 40 seconds</Text></View>}
     {result&&<Text style={{color:'#9aa2ae',fontSize:13}}>Showing the {EDIT_STYLE_LABELS[style].title} edit. Your original is kept.</Text>}
    </View>
    {!result&&<View style={{gap:8}}>{EDIT_STYLES.map(s=>{const on=style===s;return <Pressable key={s} haptic="select" accessibilityRole="radio" accessibilityState={{checked:on,disabled:busy}} disabled={busy} onPress={()=>setStyle(s)} style={{borderWidth:1,borderColor:on?colors.accent:'#2a2f38',backgroundColor:on?'rgba(255,255,255,0.06)':'transparent',borderRadius:12,padding:12,gap:3}}>
     <Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{EDIT_STYLE_LABELS[s].title}</Text><Text style={{color:'#9aa2ae',fontSize:13.5,lineHeight:19}}>{EDIT_STYLE_LABELS[s].blurb}</Text></Pressable>;})}</View>}
    <Text style={{color:'#9aa2ae',fontSize:13,lineHeight:19}}>Only the light, colour and sharpness change. You, your bike, your numbers and the track stay exactly as shot.{usage?' '+editsLeftText(usage)+'.':''}</Text>
    {!!notice&&<Text style={{color:'#f0a39b',fontSize:14}} accessibilityRole="alert">{notice}</Text>}
    {out&&!result&&<View style={{gap:8}}>
     <Text style={{color:colors.text,fontSize:14.5}}>{usage!.period==='lifetime'?'Your free edits are used. Pro includes 15 a month, or buy a pack:':'This month’s edits are used. Buy a pack to keep going:'}</Text>
     {usage!.packs.length?usage!.packs.map(p=><Button key={p.id} secondary disabled={!!buying} title={buying===p.id?'Buying…':`Buy ${p.edits} edits`} onPress={()=>void buy(p.id)}/>):<Text style={{color:'#9aa2ae'}}>Edit packs are coming soon.</Text>}
    </View>}
    {result?<View style={{gap:10}}><Button title="Use the edit" onPress={()=>onUse(result)}/><Button secondary title="Try another look" onPress={()=>setResult(null)}/><Button secondary title="Keep the original" onPress={onClose}/></View>
     :<Button disabled={busy||!usage||out} title={busy?'Editing…':`Make it ${EDIT_STYLE_LABELS[style].title}`} onPress={()=>void run()}/>}
   </ScrollView>
  </View>
 </Modal>;
}
