// Camera and photo library: pick or snap, shrink to a sensible size, upload straight to private storage.
// The server only ever hands out short-lived links, so a photo is never public.
import {ActionSheetIOS,Alert,Linking,Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
