// Action-sports photo edits: the rider's own photo, graded like a motocross magazine shot. Allowance (Kyle, 2026-11-06):
// 3 free edits to try it, 15 a month on Pro, then edits bought in packs at about 25 cents each, so the rider covers the
// generation cost. Premium gets a smaller monthly set. All three numbers can be changed from the server settings.
import type {Tier} from './plans.ts';

export const EDIT_STYLES=['magazine','golden_hour','stadium','clean'] as const;
export type EditStyle=typeof EDIT_STYLES[number];
export const EDIT_STYLE_LABELS:Record<EditStyle,{title:string;blurb:string}>={
 magazine:{title:'Magazine',blurb:'Punchy contrast, crisp detail, rich colour: the cover-shot look.'},
 golden_hour:{title:'Golden hour',blurb:'Warm late-sun light, glowing dust and roost.'},
 stadium:{title:'Stadium night',blurb:'Supercross lights: deep shadows, bright highlights.'},
 clean:{title:'Clean fix',blurb:'Natural colour, exposure and sharpness, nothing dramatic.'},
};

/** What the image model is told. The rider, bike, gear, numbers, logos and the scene stay exactly as shot: only light,
 *  colour, contrast, sharpness and atmosphere change, so the photo still shows what really happened. */
export function editPrompt(style:EditStyle):string{
 const keep='Keep everything in the photo exactly as it is: the same rider, face, body position, bike, gear, number plates, logos, text, track and background, in the same place and the same framing. Do not add, remove or change any person, vehicle, object, number, logo or text, and do not change the rider\'s appearance. Only change lighting, colour grading, contrast, clarity, sharpness and atmosphere. Photorealistic, no illustration, no cartoon, no added effects that were not there.';
 const look:Record<EditStyle,string>={
  magazine:'Grade it like a professional motocross magazine cover: bold but natural contrast, rich saturated colour, crisp detail on the bike and gear, clean bright highlights, deep blacks, subtle vignette.',
  golden_hour:'Grade it as warm late-afternoon golden-hour light: warm sun on the rider and bike, glowing backlit dust and roost if present, soft long-light contrast.',
  stadium:'Grade it as a night supercross stadium shot: bright stadium lighting on the rider and bike, deep dark surroundings, crisp specular highlights, cool shadows.',
  clean:'Correct it naturally: balanced exposure, accurate colour and white balance, lifted shadows, gentle sharpening and noise reduction. Subtle and true to life.',
 };
 return `${look[style]} ${keep}`;
}

export type EditAllowance={period:'lifetime'|'month';included:number};
export function editAllowance(tier:Tier,env:Record<string,string|undefined>={}):EditAllowance{
 const n=(v:string|undefined,d:number)=>{const x=Number(v);return Number.isInteger(x)&&x>=0&&x<=1000?x:d;};
 if(tier==='pro')return {period:'month',included:n(env.PHOTO_EDITS_PRO_MONTHLY,15)};
 if(tier==='premium')return {period:'month',included:n(env.PHOTO_EDITS_PREMIUM_MONTHLY,5)};
 return {period:'lifetime',included:n(env.PHOTO_EDITS_FREE_TOTAL,3)};
}
/** Where this allowance starts counting: the start of this UTC month, or the beginning for the free trial. */
export function allowanceSince(a:EditAllowance,now=new Date()):string{
 return a.period==='month'?new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)).toISOString():'1970-01-01T00:00:00.000Z';
}
export type EditUsage={tier:Tier;period:'lifetime'|'month';included:number;used:number;left:number;credits:number;packs:{id:string;edits:number}[]};
