// Photo pieces used across the app: attached thumbnails, a post carousel, a Garage grid and a full-screen viewer.
import React,{useState} from 'react';
import {ActivityIndicator,Image,Modal,Pressable,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from './Icon';
import type {Photo} from './photos';

const C={bg:'#060609',text:'#f6f7f9',muted:'#8f97a5',accent:'#8cb6ee',line:'#2a2f39'};
const ratio=(p?:Photo)=>p?.width&&p?.height?Math.min(1.25,Math.max(0.5625,p.height/p.width)):1;

/** Thumbnails of photos attached to something being written, each with a remove button. */
export function AttachedPhotos({photos,uploading=0,onRemove,size=72}:{photos:Photo[];uploading?:number;onRemove:(id:string)=>void;size?:number}){
 if(!photos.length&&!uploading)return null;
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:4}} style={{flexGrow:0}}>
  {photos.map(p=><View key={p.id} style={{width:size,height:size}}>
   <Image source={{uri:p.url}} style={{width:size,height:size,borderRadius:10,backgroundColor:'#14171d'}} accessibilityIgnoresInvertColors/>
   <Pressable accessibilityRole="button" accessibilityLabel="Remove photo" hitSlop={8} onPress={()=>onRemove(p.id)} style={st.remove}><Icon name="close" size={12} color={C.text} weight={2.6}/></Pressable>
  </View>)}
  {Array.from({length:uploading}).map((_,i)=><View key={'u'+i} style={{width:size,height:size,borderRadius:10,backgroundColor:'#14171d',alignItems:'center',justifyContent:'center'}}><ActivityIndicator color={C.accent}/></View>)}
 </ScrollView>;
}

/** Full-width swipeable photos for a post, with page dots. */
export function PostPhotos({photos}:{photos:Photo[]}){
 const {width}=useWindowDimensions(),[page,setPage]=useState(0),[viewer,setViewer]=useState<number|null>(null);
 if(!photos.length)return null;
 const h=Math.round(width*ratio(photos[0]));
 return <View>
  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e=>setPage(Math.round(e.nativeEvent.contentOffset.x/width))} scrollEventThrottle={16}>
   {photos.map((p,i)=><Pressable key={p.id} accessibilityRole="imagebutton" accessibilityLabel={`Photo ${i+1} of ${photos.length}`} onPress={()=>setViewer(i)}><Image source={{uri:p.url}} style={{width,height:h,backgroundColor:'#101217'}} resizeMode="cover" accessibilityIgnoresInvertColors/></Pressable>)}
  </ScrollView>
  {photos.length>1&&<><View style={st.counter}><Text style={{color:C.text,fontSize:12,fontWeight:'700'}}>{page+1}/{photos.length}</Text></View>
   <View style={{flexDirection:'row',justifyContent:'center',gap:5,paddingTop:8}}>{photos.map((p,i)=><View key={p.id} style={{width:i===page?14:5,height:5,borderRadius:3,backgroundColor:i===page?C.accent:'#3a404b'}}/>)}</View></>}
  <PhotoViewer photos={photos} start={viewer} onClose={()=>setViewer(null)}/>
 </View>;
}

/** Three-across grid with an add tile first. Tap to view; long-press to delete. */
export function PhotoGrid({photos,onAdd,onDelete,adding=false}:{photos:Photo[];onAdd?:()=>void;onDelete?:(p:Photo)=>void;adding?:boolean}){
 const {width}=useWindowDimensions(),gap=4,size=Math.floor((width-40-gap*2)/3),[viewer,setViewer]=useState<number|null>(null);
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap}}>
  {onAdd&&<Pressable accessibilityRole="button" accessibilityLabel="Add bike photos" onPress={onAdd} disabled={adding} style={({pressed})=>({width:size,height:size,borderRadius:10,borderWidth:1,borderColor:'#343a45',borderStyle:'dashed',alignItems:'center',justifyContent:'center',gap:6,opacity:pressed?0.6:1})}>{adding?<ActivityIndicator color={C.accent}/>:<><Icon name="camera" size={24} color={C.text}/><Text style={{color:C.muted,fontSize:12,fontWeight:'600'}}>Add</Text></>}</Pressable>}
  {photos.map((p,i)=><Pressable key={p.id} accessibilityRole="imagebutton" accessibilityLabel="Bike photo" accessibilityHint={onDelete?'Long press to delete':undefined} onPress={()=>setViewer(i)} onLongPress={onDelete?()=>onDelete(p):undefined}><Image source={{uri:p.url}} style={{width:size,height:size,borderRadius:10,backgroundColor:'#101217'}} accessibilityIgnoresInvertColors/></Pressable>)}
  <PhotoViewer photos={photos} start={viewer} onClose={()=>setViewer(null)}/>
 </View>;
}

/** Photos sent in chat: a small row under the message. */
export function MessagePhotos({photos}:{photos:Photo[]}){
 const [viewer,setViewer]=useState<number|null>(null);
 if(!photos.length)return null;
 const size=photos.length===1?200:110;
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'flex-end'}}>
  {photos.map((p,i)=><Pressable key={p.id} accessibilityRole="imagebutton" accessibilityLabel="Photo you sent" onPress={()=>setViewer(i)}><Image source={{uri:p.url}} style={{width:size,height:size*(photos.length===1?ratio(p):1),borderRadius:14,backgroundColor:'#101217'}} accessibilityIgnoresInvertColors/></Pressable>)}
  <PhotoViewer photos={photos} start={viewer} onClose={()=>setViewer(null)}/>
 </View>;
}

export function PhotoViewer({photos,start,onClose}:{photos:Photo[];start:number|null;onClose:()=>void}){
 const {width,height}=useWindowDimensions(),insets=useSafeAreaInsets();
 return <Modal visible={start!==null} transparent animationType="fade" onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:'#000'}}>
   <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentOffset={{x:(start??0)*width,y:0}}>
    {photos.map(p=><View key={p.id} style={{width,height,justifyContent:'center'}}><Image source={{uri:p.url}} style={{width,height:height*0.8}} resizeMode="contain" accessibilityIgnoresInvertColors/></View>)}
   </ScrollView>
   <Pressable accessibilityRole="button" accessibilityLabel="Close photo" onPress={onClose} hitSlop={12} style={[st.closeBig,{top:insets.top+10}]}><Icon name="close" size={20} color={C.text} weight={2.2}/></Pressable>
  </View>
 </Modal>;
}

const st=StyleSheet.create({
 remove:{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:11,backgroundColor:'rgba(0,0,0,0.7)',alignItems:'center',justifyContent:'center'},
 counter:{position:'absolute',top:12,right:12,backgroundColor:'rgba(0,0,0,0.6)',borderRadius:12,paddingHorizontal:9,paddingVertical:4},
 closeBig:{position:'absolute',right:16,width:40,height:40,borderRadius:20,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center'},
});
