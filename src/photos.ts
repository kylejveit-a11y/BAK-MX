// Photos on the web: pick from the camera or files, shrink in the browser, upload straight to private storage.
// Same flow as the phone app (apps/mobile/src/photos.ts): the server only hands out short-lived links, so a photo is never public.
import {api,supabase} from './client';

export type PhotoKind='post'|'chat'|'bike'|'avatar';
export type Photo={id:string;url:string;width:number|null;height:number|null};
const MAX_EDGE=1600;

async function decode(file:File):Promise<ImageBitmap|HTMLImageElement>{
 if('createImageBitmap' in window){try{return await createImageBitmap(file);}catch{/* fall through */}}
 return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('That image could not be read.'));img.src=URL.createObjectURL(file);});
}
/** Shrinks to MAX_EDGE on the long side and re-encodes as JPEG; square crops the middle. */
export async function shrink(file:File,square=false):Promise<{blob:Blob;width:number;height:number;url:string}>{
 const src=await decode(file);
 const w=src.width,h=src.height,side=Math.min(w,h),sx=square?(w-side)/2:0,sy=square?(h-side)/2:0,cw=square?side:w,ch=square?side:h;
 const scale=Math.min(1,MAX_EDGE/Math.max(cw,ch)),ow=Math.max(1,Math.round(cw*scale)),oh=Math.max(1,Math.round(ch*scale));
 const canvas=document.createElement('canvas');canvas.width=ow;canvas.height=oh;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('This browser cannot resize photos.');
 ctx.drawImage(src as CanvasImageSource,sx,sy,cw,ch,0,0,ow,oh);
 if('close' in src)src.close();
 const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/jpeg',0.8));
 if(!blob)throw new Error('That image could not be prepared.');
 return {blob,width:ow,height:oh,url:URL.createObjectURL(blob)};
}
/** Uploads one picked file and returns it with a local link for instant display. */
export async function uploadPhoto(file:File,kind:PhotoKind,bikeId?:string|null,square=false):Promise<Photo>{
 if(!supabase)throw new Error('Photos are not available in this preview.');
 const small=await shrink(file,square);
 const start=await api<{id:string;path:string;token:string}>('/photos/upload','POST',{kind,bike_id:bikeId??null,content_type:'image/jpeg',width:small.width,height:small.height});
 const up=await supabase.storage.from('rider-photos').uploadToSignedUrl(start.path,start.token,small.blob,{contentType:'image/jpeg'});
 if(up.error){void api('/photos?id='+start.id,'DELETE').catch(()=>{});throw new Error('The photo could not upload. Check your connection and try again.');}
 return {id:start.id,url:small.url,width:small.width,height:small.height};
}
/** Opens the browser's file picker (the camera on a phone when `capture` is set). Resolves to [] when cancelled. */
export function pickFiles({limit=1,capture=false}:{limit?:number;capture?:boolean}={}):Promise<File[]>{
 return new Promise(resolve=>{
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=limit>1;if(capture)input.setAttribute('capture','environment');
  input.style.display='none';document.body.appendChild(input);
  const done=(files:File[])=>{input.remove();resolve(files);};
  input.onchange=()=>done(Array.from(input.files||[]).slice(0,limit));
  input.oncancel=()=>done([]);
  input.click();
 });
}
/** Pick, shrink, upload. Returns the uploaded photos (empty if cancelled). */
export async function addPhotos(kind:PhotoKind,{limit=1,bikeId,square=false,capture=false,onProgress}:{limit?:number;bikeId?:string|null;square?:boolean;capture?:boolean;onProgress?:(done:number,total:number)=>void}={}):Promise<Photo[]>{
 const files=await pickFiles({limit,capture});
 const out:Photo[]=[];
 for(const f of files){onProgress?.(out.length,files.length);out.push(await uploadPhoto(f,kind,bikeId,square));}
 onProgress?.(out.length,files.length);
 return out;
}
