import React,{useCallback,useEffect,useState} from 'react';
import {Alert,Image,Text,View,useWindowDimensions} from 'react-native';
import type {Bike} from '../../../shared/types';
import {api} from './api';
import {addPhotos,type Photo} from './photos';
import {PhotoGrid} from './PhotoUI';
import {Card,Eyebrow,Notice,colors} from './ui';
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

/** Wide cover photo for the bike, if the rider has added one. */
export function BikeCover({bikeId}:{bikeId:string}){
 const {photos}=useBikePhotos(bikeId),{width}=useWindowDimensions();
 const p=photos?.[0];if(!p)return null;
 return <Image source={{uri:p.url}} accessibilityLabel="Your bike" style={{width:width-40,height:Math.round((width-40)*0.56),borderRadius:14,backgroundColor:'#101217'}} resizeMode="cover"/>;
}
