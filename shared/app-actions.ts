// Things Ask BAK can do in the app for the rider, each one shown on a confirm card first and run by the app with the
// rider's own session (so every server check still applies). BAK never runs them itself.
// Off-limits by design: privacy and sharing, blocks, reports, account, billing, sign-out, sending messages and anything
// that deletes. Those stay with the rider.
import {isRosterBike} from './garage-models.ts';
import {EVENT_TYPE_LABELS,POST_CATEGORY_LABELS,SETUP_RESULT_LABELS,type EventType,type PostCategory,type SetupResult} from './rider-types.ts';
import type {Bike} from './types.ts';

export const APP_SCREENS=['home','garage','build_sheet','ask','community','events','messages','workshop','setup_log','maintenance','specs','account'] as const;
export type AppScreen=typeof APP_SCREENS[number];
export const APP_ACTION_TYPES=['add_bike','switch_bike','set_engine_hours','set_nickname','set_theme','set_preferences','update_profile','rsvp_event','create_event','draft_post','log_setup','open'] as const;
export type AppActionType=typeof APP_ACTION_TYPES[number];

export type AppAction=
 |{type:'add_bike';manufacturer:string;model:string;model_year:number;nickname:string}
 |{type:'switch_bike';bike_id:string;label:string}
 |{type:'set_engine_hours';bike_id:string;hours:number}
 |{type:'set_nickname';bike_id:string;nickname:string}
 |{type:'set_theme';mode:'bike'|'bak'}
 |{type:'set_preferences';units?:'us'|'metric';answer_length?:'quick'|'full';tone?:'straight'|'encouraging'}
 |{type:'update_profile';display_name?:string;bio?:string;location?:string;riding_class?:string;race_number?:string}
 |{type:'rsvp_event';event_id:string;title:string;status:'going'|'interested'|'not_going';public:boolean}
 |{type:'create_event';title:string;event_type:EventType;starts_local:string;location_name:string;description:string}
 |{type:'draft_post';category:PostCategory;body:string}
 |{type:'log_setup';bike_id:string;track:string;conditions:string;change_made:string;result:SetupResult;notes:string}
 |{type:'open';screen:AppScreen};

/** What the model sees about the rider's app, so actions point at real bikes and events. */
export type AppContext={bikes:{id:string;label:string;active:boolean}[];events:{id:string;title:string;type:string;starts_at:string;location:string;my_rsvp:string|null}[];today:string;weekday?:string};

const clip=(v:unknown,n:number)=>typeof v==='string'?v.replace(/\s+/g,' ').trim().slice(0,n):'';
const long=(v:unknown,n:number)=>typeof v==='string'?v.replace(/\r/g,'').trim().slice(0,n):'';
const oneOf=<T extends string>(v:unknown,list:readonly T[]):T|undefined=>list.includes(v as T)?v as T:undefined;
const fieldsOf=(raw:unknown):Record<string,string>=>{
 const r=raw as {fields?:unknown};const out:Record<string,string>={};
 if(Array.isArray(r?.fields))for(const f of r.fields as {key?:unknown;value?:unknown}[])if(typeof f?.key==='string'&&typeof f.value==='string')out[f.key.trim().toLowerCase()]=f.value;
 return out;
};

/** Model output ({type, fields:[{key,value}]}) to checked actions. Anything that does not point at a real bike, event or
 *  supported model, or is not in the list, is dropped rather than guessed. */
export function cleanAppActions(raw:unknown,ctx:AppContext,activeBikeId:string|null):AppAction[]{
 if(!Array.isArray(raw))return [];
 const bikeIds=new Set(ctx.bikes.map(b=>b.id)),out:AppAction[]=[];
 const bikeFor=(f:Record<string,string>)=>{const id=f.bike_id?.trim();return id&&bikeIds.has(id)?id:activeBikeId&&bikeIds.has(activeBikeId)?activeBikeId:null;};
 for(const item of raw.slice(0,8)){
  const type=oneOf((item as {type?:unknown})?.type,APP_ACTION_TYPES),f=fieldsOf(item);if(!type)continue;
  if(type==='add_bike'){const year=Number(f.model_year),make=clip(f.manufacturer,100),model=clip(f.model,100);if(Number.isInteger(year)&&isRosterBike(make,model,year))out.push({type,manufacturer:make,model,model_year:year,nickname:clip(f.nickname,80)});}
  else if(type==='switch_bike'){const b=ctx.bikes.find(x=>x.id===f.bike_id?.trim());if(b&&!b.active)out.push({type,bike_id:b.id,label:b.label});}
  else if(type==='set_engine_hours'){const id=bikeFor(f),h=Number(f.hours);if(id&&Number.isFinite(h)&&h>=0&&h<100000)out.push({type,bike_id:id,hours:Math.round(h*10)/10});}
  else if(type==='set_nickname'){const id=bikeFor(f);if(id)out.push({type,bike_id:id,nickname:clip(f.nickname,80)});}
  else if(type==='set_theme'){const mode=oneOf(f.mode,['bike','bak'] as const);if(mode)out.push({type,mode});}
  else if(type==='set_preferences'){const a={type,units:oneOf(f.units,['us','metric'] as const),answer_length:oneOf(f.answer_length,['quick','full'] as const),tone:oneOf(f.tone,['straight','encouraging'] as const)};if(a.units||a.answer_length||a.tone)out.push(a);}
  else if(type==='update_profile'){const a:AppAction={type};for(const [k,n] of [['display_name',60],['bio',500],['location',80],['riding_class',60],['race_number',3]] as const)if(f[k]!==undefined)(a as Record<string,unknown>)[k]=k==='bio'?long(f[k],n):clip(f[k],n);if(a.type==='update_profile'&&a.race_number!==undefined&&!/^\d{0,3}$/.test(a.race_number))delete a.race_number;if(Object.keys(a).length>1)out.push(a);}
  else if(type==='rsvp_event'){const e=ctx.events.find(x=>x.id===f.event_id?.trim()),status=oneOf(f.status,['going','interested','not_going'] as const);if(e&&status)out.push({type,event_id:e.id,title:e.title,status,public:f.public==='true'});}
  else if(type==='create_event'){const et=oneOf(f.event_type,Object.keys(EVENT_TYPE_LABELS) as EventType[]),starts=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(f.starts_local??'')?f.starts_local:'';const title=clip(f.title,120),where=clip(f.location_name,160);if(et&&starts&&title&&where&&starts.slice(0,10)>=ctx.today)out.push({type,title,event_type:et,starts_local:starts,location_name:where,description:long(f.description,4000)});}
  else if(type==='draft_post'){const c=oneOf(f.category,Object.keys(POST_CATEGORY_LABELS) as PostCategory[])??'general',body=long(f.body,4000);if(body)out.push({type,category:c,body});}
  else if(type==='log_setup'){const id=bikeFor(f),change=clip(f.change_made,1000);if(id&&change)out.push({type,bike_id:id,track:clip(f.track,120),conditions:clip(f.conditions,200),change_made:change,result:oneOf(f.result,Object.keys(SETUP_RESULT_LABELS) as SetupResult[])??'not_tested',notes:long(f.notes,4000)});}
  else if(type==='open'){const screen=oneOf(f.screen,APP_SCREENS);if(screen)out.push({type,screen});}
 }
 // one of each kind of change per reply: two theme changes or two RSVPs to the same event would only confuse the card
 const seen=new Set<string>();return out.filter(a=>{const k=a.type+':'+('event_id' in a?a.event_id:'bike_id' in a?a.bike_id:'');if(seen.has(k))return false;seen.add(k);return true;});
}

const SCREEN_LABELS:Record<AppScreen,string>={home:'Home',garage:'Garage',build_sheet:'Build sheet',ask:'Ask BAK',community:'Community',events:'Events',messages:'Messages',workshop:'Workshop',setup_log:'Setup log',maintenance:'Maintenance',specs:'Specs',account:'Account'};
const when=(local:string)=>{const d=new Date(local);return Number.isNaN(d.getTime())?local:d.toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});};

/** The line on the confirm card: exactly what will change, in plain words. */
export function describeAppAction(a:AppAction,bikes:Pick<Bike,'id'|'model_year'|'manufacturer'|'model'|'nickname'>[]=[]):{title:string;detail:string}{
 const bikeName=(id:string)=>{const b=bikes.find(x=>x.id===id);return b?(b.nickname?.trim()||`${b.model_year} ${b.manufacturer} ${b.model}`):'this bike';};
 switch(a.type){
  case 'add_bike':return {title:`Add a ${a.model_year} ${a.manufacturer} ${a.model} to your Garage`,detail:a.nickname?`Named “${a.nickname}”. It becomes your active bike.`:'It becomes your active bike.'};
  case 'switch_bike':return {title:`Switch to your ${a.label}`,detail:'Ask BAK and the Garage follow the active bike.'};
  case 'set_engine_hours':return {title:`Set ${bikeName(a.bike_id)} to ${a.hours} engine hours`,detail:'Service reminders count from this.'};
  case 'set_nickname':return {title:a.nickname?`Name ${bikeName(a.bike_id)} “${a.nickname}”`:`Remove the name from ${bikeName(a.bike_id)}`,detail:''};
  case 'set_theme':return {title:a.mode==='bak'?'Use BAK blue everywhere':'Let the app colour follow your bike',detail:'Only changes how the app looks on this device.'};
  case 'set_preferences':return {title:'Change how BAK answers',detail:[a.units&&(a.units==='us'?'US units':'Metric units'),a.answer_length&&(a.answer_length==='quick'?'quick answers':'full answers'),a.tone&&(a.tone==='straight'?'straight talk':'encouraging tone')].filter(Boolean).join(', ')};
  case 'update_profile':return {title:'Update your rider profile',detail:[a.display_name!==undefined&&`Name: ${a.display_name||'(blank)'}`,a.location!==undefined&&`Location: ${a.location||'(blank)'}`,a.riding_class!==undefined&&`Class: ${a.riding_class||'(blank)'}`,a.race_number!==undefined&&`Number: ${a.race_number||'(blank)'}`,a.bio!==undefined&&`Bio: ${a.bio.length>90?a.bio.slice(0,90)+'…':a.bio||'(blank)'}`].filter(Boolean).join(' · ')};
  case 'rsvp_event':return {title:a.status==='not_going'?`Take back your RSVP for ${a.title}`:`Mark ${a.status==='going'?'Going':'Interested'} for ${a.title}`,detail:a.status==='going'?(a.public?'Your profile shows in the going list.':'Counted in the total; your profile stays private.'):''};
  case 'create_event':return {title:`Create ${EVENT_TYPE_LABELS[a.event_type].toLowerCase()}: ${a.title}`,detail:`${when(a.starts_local)} · ${a.location_name}. Other riders can see it.`};
  case 'draft_post':return {title:`Draft a ${POST_CATEGORY_LABELS[a.category].toLowerCase()} post`,detail:'Opens the post with this text so you can check it, add photos and post it yourself.'};
  case 'log_setup':return {title:`Add to ${bikeName(a.bike_id)}'s setup log`,detail:[a.change_made,a.track&&`at ${a.track}`,a.result!=='not_tested'&&SETUP_RESULT_LABELS[a.result].toLowerCase()].filter(Boolean).join(' · ')};
  case 'open':return {title:`Open ${SCREEN_LABELS[a.screen]}`,detail:''};
 }
}

/** What each client gives the runner: its signed-in API call and its own screen and theme handling. */
export type AppActionHost={
 /** path without the /api prefix, e.g. '/bikes' */
 api:<T>(path:string,method?:string,body?:unknown)=>Promise<T>;
 bikes:Bike[];
 refreshBikes:()=>Promise<void>;
 selectBike:(id:string)=>void;
 setTheme:(mode:'bike'|'bak')=>void;
 open:(screen:AppScreen)=>void;
 draftPost:(category:PostCategory,body:string)=>void;
 newId:()=>string;
};

const bikeBody=(b:Bike,change:Partial<Bike>)=>({manufacturer:b.manufacturer,model:b.model,model_year:b.model_year,variant:b.variant,region:b.region,nickname:b.nickname??'',engine_hours:b.engine_hours??null,configuration:b.configuration??{},...change});

/** Runs one confirmed action. Returns a short line for the card ("Done: …"). Throws with the server's message on failure. */
export async function runAppAction(a:AppAction,host:AppActionHost):Promise<string>{
 const bike=(id:string)=>{const b=host.bikes.find(x=>x.id===id);if(!b)throw new Error('That bike is no longer in your Garage.');return b;};
 switch(a.type){
  case 'add_bike':{const saved=await host.api<Bike>('/bikes','POST',{create_id:host.newId(),manufacturer:a.manufacturer,model:a.model,model_year:a.model_year,variant:'standard',region:'US',nickname:a.nickname,configuration:{}});await host.refreshBikes();host.selectBike(saved.id);return 'Added to your Garage';}
  case 'switch_bike':host.selectBike(a.bike_id);return 'Switched';
  case 'set_engine_hours':{const b=bike(a.bike_id);await host.api('/bikes?id='+b.id,'PATCH',bikeBody(b,{engine_hours:a.hours}));await host.refreshBikes();return 'Hours saved';}
  case 'set_nickname':{const b=bike(a.bike_id);await host.api('/bikes?id='+b.id,'PATCH',bikeBody(b,{nickname:a.nickname}));await host.refreshBikes();return 'Name saved';}
  case 'set_theme':host.setTheme(a.mode);return 'Colour changed';
  case 'set_preferences':{const now=await host.api<Record<string,string>>('/preferences');const {type:_t,...next}=a;await host.api('/preferences','PUT',{units:now.units,answer_length:now.answer_length,tone:now.tone,...Object.fromEntries(Object.entries(next).filter(([,v])=>v!==undefined))});return 'Saved';}
  case 'update_profile':{const now=await host.api<Record<string,unknown>|null>('/profile');if(!now)throw new Error('Set up your rider profile first (Account), then BAK can edit it.');const {type:_t,...change}=a;
   const keep=['handle','display_name','bio','avatar_photo_id','location','riding_class','race_number'];await host.api('/profile','PUT',{...Object.fromEntries(keep.filter(k=>now[k]!==undefined&&now[k]!==null).map(k=>[k,now[k]])),...change});return 'Profile saved';}
  case 'rsvp_event':if(a.status==='not_going'){await host.api('/rsvps?event_id='+a.event_id,'DELETE');return 'RSVP removed';}await host.api('/rsvps','PUT',{event_id:a.event_id,status:a.status,public:a.public});return a.status==='going'?'You’re going':'Marked interested';
  case 'create_event':{const start=new Date(a.starts_local);if(Number.isNaN(start.getTime()))throw new Error('That date did not make sense.');await host.api('/events','POST',{title:a.title,event_type:a.event_type,starts_at:start.toISOString(),ends_at:null,location_name:a.location_name,description:a.description});host.open('events');return 'Event created';}
  case 'draft_post':host.draftPost(a.category,a.body);return 'Draft opened';
  case 'log_setup':{const b=bike(a.bike_id);await host.api('/setup-logs','POST',{bike_id:b.id,recorded_at:new Date().toISOString(),track:a.track,conditions:a.conditions,engine_hours:b.engine_hours??null,settings:{},change_made:a.change_made,result:a.result,notes:a.notes});return 'Logged';}
  case 'open':host.open(a.screen);return 'Opened';
 }
}
