import type {Bike} from '../../../shared/types';

// Include the saved identity/configuration revision, not just the database ID.
export function bikeScope(bike:Bike|undefined):string {
  return bike ? JSON.stringify([bike.id,bike.updated_at,bike.manufacturer,bike.model,bike.model_year,bike.variant,bike.region,bike.configuration]) : 'none';
}

export function createRequestGate(){
  let generation=0;
  return {
    begin:()=>++generation,
    invalidate:()=>{generation++;},
    accepts:(ticket:number)=>ticket===generation,
  };
}

export function selectedBikeId(bikes:Pick<Bike,'id'>[],preferred:string){return bikes.some(b=>b.id===preferred)?preferred:bikes[0]?.id??'';}
export function validServiceDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(`${value}T12:00:00Z`);
 return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export type ChatRequest={id:string;text:string;conversation:string};
export function retryRequest(previous:ChatRequest|null,text:string,conversation:string,newId:()=>string):ChatRequest{
 return previous?.text===text&&previous.conversation===conversation?previous:{id:newId(),text,conversation};
}
export function appendWorkshopContext(draft:string,context:string){return draft.includes(context)?draft:draft.trim()?`${draft}\n\n${context}`:context;}
