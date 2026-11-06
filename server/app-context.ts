// What Ask BAK needs to propose app actions that point at real things: the rider's bikes and, when the message is about
// events, the upcoming ones. Read with the rider's own client, so it sees only what the rider can see.
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike,Message} from '../shared/types.ts';
import type {AppContext} from '../shared/app-actions.ts';

const EVENT_WORDS=/\b(events?|ride ?days?|races?|racing|practice|clinic|meet ?ups?|rsvp|going to|sign me up|count me in|interested in)\b/i;

export async function appContext(db:SupabaseClient,owner:string,active:Bike|null,message:string,history:Message[]):Promise<AppContext>{
 // Riders say "Saturday" and "next week": the weekday comes with the date. US Eastern until the app sends the rider's zone.
 const now=new Date(),today=now.toLocaleDateString('en-CA',{timeZone:'America/New_York'}),weekday=now.toLocaleDateString('en-US',{timeZone:'America/New_York',weekday:'long'});
 // A rider who cannot be read back still gets an answer; actions just cannot point at bikes or events then.
 const bikes=((await db.from('bikes').select('id,manufacturer,model,model_year,nickname').eq('user_id',owner).order('created_at',{ascending:false}).limit(30)).data??[]) as Pick<Bike,'id'|'manufacturer'|'model'|'model_year'|'nickname'>[];
 const recent=[message,...history.filter(m=>m.role==='user').slice(-2).map(m=>m.content??'')].join(' ');
 let events:AppContext['events']=[];
 if(EVENT_WORDS.test(recent)){
  const now=new Date(Date.now()-6*3600_000).toISOString();
  const rows=((await db.from('events').select('id,title,event_type,starts_at,location_name').is('removed_at',null).is('canceled_at',null).gte('starts_at',now).order('starts_at',{ascending:true}).limit(25)).data??[]) as {id:string;title:string;event_type:string;starts_at:string;location_name:string}[];
  const mine=rows.length?((await db.from('event_rsvps').select('event_id,status').eq('user_id',owner).in('event_id',rows.map(r=>r.id))).data??[]) as {event_id:string;status:string}[]:[];
  events=rows.map(r=>({id:r.id,title:r.title,type:r.event_type,starts_at:r.starts_at,location:r.location_name,my_rsvp:mine.find(m=>m.event_id===r.id)?.status??null}));
 }
 return {bikes:bikes.map(b=>({id:b.id,label:(b.nickname?.trim()?b.nickname.trim()+' — ':'')+`${b.model_year} ${b.manufacturer} ${b.model}`,active:b.id===active?.id})),events,today,weekday};
}
