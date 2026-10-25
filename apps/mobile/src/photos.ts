// Camera and photo library: pick or snap, shrink to a sensible size, upload straight to private storage.
// The server only ever hands out short-lived links, so a photo is never public.
import {ActionSheetIOS,Alert,Linking,Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {ImageManipulator,SaveFormat} from 'expo-image-manipulator';
import {File} from 'expo-file-system';
import {api,supabase} from './api';

export type PhotoKind='post'|'chat'|'bike'|'avatar';
export type Photo={id:string;url:string;width:number|null;height:number|null};
const MAX_EDGE=1600;

async function shrink(asset:ImagePicker.ImagePickerAsset){
 const w=asset.width||MAX_EDGE,h=asset.height||MAX_EDGE,scale=Math.min(1,MAX_EDGE/Math.max(w,h));
 const ctx=ImageManipulator.manipulate(asset.uri);
 if(scale<1)ctx.resize(w>=h?{width:Math.round(w*scale)}:{height:Math.round(h*scale)});
 const img=await ctx.renderAsync();
 const out=await img.saveAsync({compress:0.8,format:SaveFormat.JPEG});
 return out;
}
async function bytes(uri:string):Promise<ArrayBuffer>{
 if(Platform.OS==='web'||!uri.startsWith('file'))return (await fetch(uri)).arrayBuffer();
 const b=await new File(uri).bytes();return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;
}
/** Uploads one picked image and returns it with a local link for instant display. */
export async function uploadPhoto(asset:ImagePicker.ImagePickerAsset,kind:PhotoKind,bikeId?:string|null):Promise<Photo>{
 if(!supabase)throw new Error('Photos are not available in this build.');
 const small=await shrink(asset);
 const start=await api<{id:string;path:string;token:string}>('/api/photos/upload','POST',{kind,bike_id:bikeId??null,content_type:'image/jpeg',width:small.width,height:small.height});
 const up=await supabase.storage.from('rider-photos').uploadToSignedUrl(start.path,start.token,await bytes(small.uri),{contentType:'image/jpeg'});
 if(up.error){void api('/api/photos?id='+start.id,'DELETE').catch(()=>{});throw new Error('The photo could not upload. Check your connection and try again.');}
 return {id:start.id,url:small.uri,width:small.width,height:small.height};
}

async function allowed(source:'camera'|'library'){
 const r=source==='camera'?await ImagePicker.requestCameraPermissionsAsync():await ImagePicker.requestMediaLibraryPermissionsAsync();
 if(r.granted)return true;
 Alert.alert(source==='camera'?'Camera is off for BAK MX':'Photos are off for BAK MX',`Turn on ${source==='camera'?'Camera':'Photos'} access for BAK MX in Settings to add pictures.`,[{text:'Not now',style:'cancel'},{text:'Open Settings',onPress:()=>void Linking.openSettings()}]);
 return false;
}
/** Opens the camera or library and returns the picked images (not yet uploaded). */
export async function pickImages(source:'camera'|'library',limit=1,square=false):Promise<ImagePicker.ImagePickerAsset[]>{
 if(!await allowed(source))return [];
 const options:ImagePicker.ImagePickerOptions={mediaTypes:['images'],quality:1,exif:false,...(limit>1&&source==='library'?{allowsMultipleSelection:true,selectionLimit:limit,orderedSelection:true}:square?{allowsEditing:true,aspect:[1,1]}:{})};
 const r=source==='camera'?await ImagePicker.launchCameraAsync(options):await ImagePicker.launchImageLibraryAsync(options);
 return r.canceled?[]:r.assets.slice(0,limit);
}
/** "Take photo / Choose from library" sheet. */
export function chooseSource(title:string):Promise<'camera'|'library'|null>{
 return new Promise(resolve=>{
  if(Platform.OS==='ios')ActionSheetIOS.showActionSheetWithOptions({title,options:['Take photo','Choose from library','Cancel'],cancelButtonIndex:2},i=>resolve(i===0?'camera':i===1?'library':null));
  else if(Platform.OS==='web')resolve('library');
  else Alert.alert(title,undefined,[{text:'Take photo',onPress:()=>resolve('camera')},{text:'Choose from library',onPress:()=>resolve('library')},{text:'Cancel',style:'cancel',onPress:()=>resolve(null)}],{cancelable:true,onDismiss:()=>resolve(null)});
 });
}
/** Ask where from, pick, upload. Returns the uploaded photos (empty if cancelled). */
export async function addPhotos(kind:PhotoKind,{limit=1,bikeId,title='Add a photo',square=false,onProgress}:{limit?:number;bikeId?:string|null;title?:string;square?:boolean;onProgress?:(done:number,total:number)=>void}={}):Promise<Photo[]>{
 const source=await chooseSource(title);if(!source)return [];
 const assets=await pickImages(source,limit,square);
 const out:Photo[]=[];
 for(const a of assets){onProgress?.(out.length,assets.length);out.push(await uploadPhoto(a,kind,bikeId));}
 onProgress?.(out.length,assets.length);
 return out;
}

/** Clip coaching: the rider picks a short video from their library (iOS lets them trim it to CLIP_MAX seconds), and the
 *  phone pulls evenly spaced still frames from it. Only the frames are uploaded, never the video. */
export const CLIP_MAX=20,CLIP_FRAMES=8;
export type ClipFrames={duration:number;frames:{time:number;asset:ImagePicker.ImagePickerAsset}[]};
export async function pickClipFrames():Promise<ClipFrames|null>{
 if(Platform.OS==='web'){Alert.alert('Clips are on the phone app','Open BAK MX on your phone to send a video clip.');return null;}
 if(!await allowed('library'))return null;
 const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:['videos'],allowsEditing:true,videoMaxDuration:CLIP_MAX,quality:1});
 if(r.canceled||!r.assets[0])return null;
 const v=r.assets[0],ms=Math.max(0,v.duration??0);
 if(!ms){Alert.alert('That video could not be read','Try a different clip, or trim it in Photos first.');return null;}
 if(ms>CLIP_MAX*1000+500){Alert.alert('Clip too long',`Trim it to ${CLIP_MAX} seconds or less around the corner, jump or section you want coached.`);return null;}
 const n=ms<3000?4:CLIP_FRAMES,times=Array.from({length:n},(_,i)=>Math.round(ms*(0.04+0.92*i/(n-1))));
 const frames:ClipFrames['frames']=[];
 for(const t of times){
  const f=await VideoThumbnails.getThumbnailAsync(v.uri,{time:t,quality:0.85});
  frames.push({time:t/1000,asset:{uri:f.uri,width:f.width,height:f.height,type:'image'} as ImagePicker.ImagePickerAsset});
 }
 return {duration:ms/1000,frames};
}
/** "Show BAK" sheet in Ask BAK: a photo, photos from the library, or a video clip for coaching. */
export function chooseChatSource():Promise<'camera'|'library'|'video'|null>{
 return new Promise(resolve=>{
  const opts=['Take photo','Choose photos','Coach me from a video','Cancel'],pick=(i:number)=>resolve(i===0?'camera':i===1?'library':i===2?'video':null);
  if(Platform.OS==='ios')ActionSheetIOS.showActionSheetWithOptions({title:'Show BAK',message:'Photos of the bike, a part or the track, or a short clip of you riding (up to 20 s).',options:opts,cancelButtonIndex:3},pick);
  else if(Platform.OS==='web')resolve('library');
  else Alert.alert('Show BAK','Photos of the bike, a part or the track, or a short clip of you riding (up to 20 s).',[{text:opts[0],onPress:()=>pick(0)},{text:opts[1],onPress:()=>pick(1)},{text:opts[2],onPress:()=>pick(2)},{text:'Cancel',style:'cancel',onPress:()=>pick(3)}],{cancelable:true,onDismiss:()=>resolve(null)});
 });
}
