import {createHash} from 'node:crypto';
/** Server-side screen for rider-written text. A first filter, not moderation: reports and blocks do the rest.
 * Blocked terms are stored only as salted hashes so the source never spells them out. Engine terms that
 * collide with insults in other contexts (for example ignition "retard") are deliberately not listed. */
const SALT='bakmx-content-v1:';
const blocked=new Set(["06b40a884eeb3df3", "171babefb4ea89c1", "2101937a61d7ff49", "35f718834f1b6ee6", "44f6c16c506b56cc", "57c08aa2899fd581", "5c305c78d3f37787", "5e4392c56f397a9f", "887711411d6a97d6", "88bbd06689fb10e1", "8a55fe0e771d9872", "8dcd5b384105560e", "93d6d0c52f6095e6", "b2b3873c98639620", "bfcc38c492bc532d", "cceadbbf408240f3", "d704112b47b871a1", "e0cba9a8f5b87d2b", "e27029c24c78b5da", "eedeaa0ba64d9a05", "f192de703f76a6d2", "fe43f8f94254a50d"]);
const fold=(text:string)=>text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[@4]/g,'a').replace(/[1!|]/g,'i').replace(/0/g,'o').replace(/3/g,'e').replace(/\$/g,'s');
/** True when the text contains a blocked term as a whole word. */
export function objectionable(text:string):boolean{
 for(const word of fold(text).split(/[^a-z]+/)){
  if(word.length<4||word.length>12)continue;
  if(blocked.has(createHash('sha256').update(SALT+word).digest('hex').slice(0,16)))return true;
 }
 return false;
}
