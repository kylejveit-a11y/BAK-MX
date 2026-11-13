import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,Animated,Image,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';
import {BlueFace,blueLift,onBlueText} from './BlueFace';
import {readProgress,writeProgress} from './localProgress';
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
   {(loading||broken||adding)&&(adding?<ActivityIndicator color={colors.accent}/>:<Icon name="camera" size={26} color={loading?'#6b7380':'#c9cfd9'} weight={1.7}/>)}
   {broken&&<Text style={{color:'#9aa2ae',fontSize:12.5}}>The photo didn’t load. Tap to retry.</Text>}
  </View>
 </MetalPanel>;
 if(!loading&&!p)return <View style={{gap:8}}>
  <Pressable accessibilityRole="button" accessibilityLabel={`Add a photo of your ${bike.model_year} ${bike.manufacturer} ${bike.model}`} disabled={adding} onPress={()=>void add()} style={({pressed})=>({opacity:pressed?0.85:1})}>
   <CoverPlaceholder width={w} height={h} bike={bike} adding={adding}/>
  </Pressable>
  <Notice text={notice}/>
 </View>;
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

// Real BAK riders, pre-blurred and hazed so they set the mood without competing with the call to add your own.
const COVERS=[require('../assets/cover-placeholders/cover-1.jpg'),require('../assets/cover-placeholders/cover-2.jpg'),require('../assets/cover-placeholders/cover-3.jpg'),require('../assets/cover-placeholders/cover-4.jpg'),require('../assets/cover-placeholders/cover-5.jpg')];
let coverTurn=-1;
/** Next placeholder each time a card shows (and so each sign-in), so the screen isn't the same every time. */
function nextCover(){coverTurn=(coverTurn+1)%COVERS.length;if(coverTurn===0){try{const saved=Number(readProgress('device','cover-turn',0))||0;coverTurn=saved%COVERS.length;}catch{}}try{writeProgress('device','cover-turn',coverTurn+1);}catch{}return COVERS[coverTurn];}

function CoverPlaceholder({width,height,bike,adding}:{width:number;height:number;bike:Bike;adding:boolean}){
 const [src]=useState(nextCover);
 return <View style={{width,height,borderRadius:14,overflow:'hidden',backgroundColor:'#0b0d11',justifyContent:'flex-end'}}>
  <Image source={src} resizeMode="cover" style={{position:'absolute',left:0,top:0,width,height}} accessibilityIgnoresInvertColors/>
  {/* deeper at the bottom so the words always read */}
  <Svg width={width} height={height} style={{position:'absolute',left:0,top:0}}>
   <Defs><LinearGradient id="coverFade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0.25" stopColor="#05070b" stopOpacity="0"/><Stop offset="1" stopColor="#05070b" stopOpacity="0.85"/></LinearGradient></Defs>
   <Rect x="0" y="0" width={width} height={height} fill="url(#coverFade)"/>
  </Svg>
  <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:14,borderWidth:StyleSheet.hairlineWidth,borderColor:'rgba(255,255,255,0.18)'}}/>
  <View style={{padding:18,gap:10,alignItems:'flex-start'}}>
   <View style={{gap:3}}>
    <Text style={{color:'#ffffff',fontSize:22,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.4,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:3}}>Add your bike’s photo</Text>
    <Text numberOfLines={1} style={{color:'#d9dee6',fontSize:13.5,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:2}}>Your {bike.model_year} {bike.manufacturer} {bike.model}, front and center</Text>
   </View>
   <View style={[{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,paddingHorizontal:16,borderRadius:22},blueLift]}>
    <BlueFace radius={22}/>
    {adding?<ActivityIndicator color="#fff"/>:<Icon name="camera" size={17} color="#ffffff" weight={2}/>}
    <Text style={[{fontSize:15,fontWeight:'700'},onBlueText]}>{adding?'Adding…':'Add your photo'}</Text>
   </View>
  </View>
 </View>;
}

/** Home before the first bike: the same hazy rider photo behind a clear first step. */
export function StartHereCover({onAdd}:{onAdd:()=>void}){
 const {width}=useWindowDimensions(),w=width-40,h=Math.round(w*0.7);
 const [src]=useState(nextCover);
 return <Pressable accessibilityRole="button" accessibilityLabel="Add your bike. Make, model and year. Two minutes." onPress={onAdd} style={({pressed})=>({opacity:pressed?0.85:1})}>
  <View style={{width:w,height:h,borderRadius:16,overflow:'hidden',backgroundColor:'#0b0d11',justifyContent:'flex-end'}}>
   <Image source={src} resizeMode="cover" style={{position:'absolute',left:0,top:0,width:w,height:h}} accessibilityIgnoresInvertColors/>
   <Svg width={w} height={h} style={{position:'absolute',left:0,top:0}}>
    <Defs><LinearGradient id="startFade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0.2" stopColor="#05070b" stopOpacity="0"/><Stop offset="1" stopColor="#05070b" stopOpacity="0.9"/></LinearGradient></Defs>
    <Rect x="0" y="0" width={w} height={h} fill="url(#startFade)"/>
   </Svg>
   <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:16,borderWidth:StyleSheet.hairlineWidth,borderColor:'rgba(255,255,255,0.18)'}}/>
   <View style={{padding:20,gap:12}}>
    <View style={{gap:4}}>
     <Text style={{color:'#c9d6ea',fontWeight:'800',letterSpacing:2.2,fontSize:11}}>START HERE</Text>
     <Text style={{color:'#ffffff',fontSize:26,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.6,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:3}}>Add your bike</Text>
     <Text style={{color:'#d9dee6',fontSize:14.5,lineHeight:20,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:2}}>Make, model and year. BAK knows its stock setup, specs and service schedule right away.</Text>
    </View>
    <View style={[{alignSelf:'stretch',alignItems:'center',justifyContent:'center',minHeight:50,borderRadius:28},blueLift]}><BlueFace radius={28}/><Text style={[{fontSize:16,fontWeight:'700'},onBlueText]}>Add your bike</Text></View>
   </View>
  </View>
 </Pressable>;
}
