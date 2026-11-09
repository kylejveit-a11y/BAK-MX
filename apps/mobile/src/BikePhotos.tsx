import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,Animated,Text,View,useWindowDimensions} from 'react-native';
import {MetalPanel} from './MetalPanel';
import {Pressable} from './Touch';
import {motion} from './theme';
import type {Bike} from '../../../shared/types';
import {api} from './api';
import {addPhotos,type Photo} from './photos';
import {PhotoGrid} from './PhotoUI';
import {Card,Eyebrow,Icon,Notice,colors} from './ui';
import {ProfileSharing} from './GarageSharing';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
export function useBikePhotos(bikeId?:string){
 const [photos,setPhotos]=useState<Photo[]|null>(null);
 const load=useCallback(async()=>{if(!bikeId){setPhotos([]);return;}try{setPhotos(await api<Photo[]>(`/api/photos?kind=bike&bike_id=${bikeId}`));}catch{setPhotos([]);}},[bikeId]);
 useEffect(()=>{setPhotos(null);void load();},[load]);
 return {photos,setPhotos,load};
}

/** Garage: the rider's own pictures of this bike. Private unless the rider shows the bike, and picks photos, on their profile. */
export function BikePhotos({bike,onSharingChanged}:{bike:Bike;onSharingChanged?:()=>void}){
 const {photos,setPhotos}=useBikePhotos(bike.id);
 const [adding,setAdding]=useState(false),[notice,setNotice]=useState('');
 async function add(){setNotice('');try{setAdding(true);const added=await addPhotos('bike',{limit:10,bikeId:bike.id,title:'Photos of your bike'});if(added.length)setPhotos(old=>[...added,...(old??[])]);}catch(e){setNotice(errorText(e));}finally{setAdding(false);}}
 function remove(p:Photo){Alert.alert('Delete this photo?','It’s removed from your Garage.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void api('/api/photos?id='+p.id,'DELETE').then(()=>setPhotos(old=>(old??[]).filter(x=>x.id!==p.id))).catch(e=>setNotice(errorText(e)))}]);}
 return <><Card>
  <View style={{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between'}}><Eyebrow>PHOTOS</Eyebrow>{!!photos?.length&&<Text style={{color:'#9aa2ae',fontSize:12.5}}>{photos.length}</Text>}</View>
  {photos!==null&&!photos.length&&<Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Keep pictures of the build: before and after, how parts are fitted, your clicker settings. They stay private unless you show them on your profile.</Text>}
  <PhotoGrid photos={photos??[]} adding={adding} onAdd={()=>void add()} onDelete={remove}/>
  <Notice text={notice}/>
 </Card>{photos!==null&&<ProfileSharing bike={bike} photos={photos} onChanged={onSharingChanged}/>}</>;
}

/** Wide cover photo for the bike at the top of the Garage overview. The space is always a BAK metal plate, never a blank
 *  grey block: while the photo list or the picture itself loads the plate is what shows (the picture fades in over it, same
 *  size, so nothing jumps); with no photo yet the plate carries a camera and "Add a photo", which opens the picker. */
export function BikeCover({bike,photos,onAdded}:{bike:Bike;photos:Photo[]|null;onAdded:(added:Photo[])=>void}){
 const {width}=useWindowDimensions(),w=width-40,h=Math.round(w*0.56);
 const [adding,setAdding]=useState(false),[shown,setShown]=useState(false),[failed,setFailed]=useState<string|null>(null),[attempt,setAttempt]=useState(0),[notice,setNotice]=useState('');
 const p=photos?.[0],loading=photos===null,broken=!!p&&failed===p.url;
 const fade=useRef(new Animated.Value(0)).current;
 // A picture that failed to load: tapping the plate asks for it again (a fresh Image, so the failed fetch is not reused).
 const retry=()=>{setFailed(null);setShown(false);fade.setValue(0);setAttempt(a=>a+1);};
 useEffect(()=>{if(!p){fade.setValue(0);setShown(false);}},[p?.url]);
 async function add(){if(adding)return;setNotice('');try{setAdding(true);const added=await addPhotos('bike',{limit:10,bikeId:bike.id,title:'Photos of your bike'});if(added.length)onAdded(added);}catch(e){setNotice(errorText(e));}finally{setAdding(false);}}
 const plate=<MetalPanel radius={14} style={{width:w,height:h}}>
  <View style={{height:h-44,alignItems:'center',justifyContent:'center',gap:8}}>
   {adding?<ActivityIndicator color={colors.accent}/>:<Icon name="camera" size={26} color={loading?'#6b7380':'#c9cfd9'} weight={1.7}/>}
   {!loading&&!p&&<Text style={{color:'#e7e9ee',fontSize:15,fontWeight:'700'}}>{adding?'Adding…':'Add a photo'}</Text>}
   {!loading&&!p&&<Text style={{color:'#9aa2ae',fontSize:12.5}}>Your {bike.model_year} {bike.manufacturer} {bike.model}, front and centre</Text>}
   {broken&&<Text style={{color:'#9aa2ae',fontSize:12.5}}>The photo didn’t load. Tap to retry.</Text>}
  </View>
 </MetalPanel>;
 return <View style={{gap:8}}>
  <View style={{width:w,height:h}}>
   {/* the plate is always underneath; a picture fades in over it once it has loaded */}
   {(!p||!shown||broken)&&(loading||!p||broken?<Pressable accessibilityRole="button" accessibilityLabel={broken?'Load the photo again':'Add a photo of your bike'} disabled={loading||adding||(!!p&&!broken)} onPress={()=>{if(broken)retry();else void add();}} style={({pressed})=>({opacity:pressed?0.75:1})}>{plate}</Pressable>:plate)}
   {p&&!broken&&<Animated.Image key={`${p.url}#${attempt}`} source={{uri:p.url}} accessibilityLabel="Your bike" resizeMode="cover" onLoad={()=>{setShown(true);Animated.timing(fade,{toValue:1,duration:motion.reduced?0:220,useNativeDriver:true}).start();}} onError={()=>setFailed(p.url)} style={{position:'absolute',left:0,top:0,width:w,height:h,borderRadius:14,opacity:fade}}/>}
  </View>
  <Notice text={notice}/>
 </View>;
}

/** The same cover on Home's Your bike card, with its own photo list. */
export function HomeBikeCover({bike}:{bike:Bike}){
 const {photos,setPhotos}=useBikePhotos(bike.id);
 return <BikeCover bike={bike} photos={photos} onAdded={added=>setPhotos(old=>[...added,...(old??[])])}/>;
}
