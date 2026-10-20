// Guided jobs in the chat: the rider works through a reviewed procedure one step at a time, by tapping, typing or talking.
// Commands (next / back / repeat / where am I / record) are handled on the device so they work instantly and offline.
// Anything else is a question about the current step and goes to BAK with that step as context.
import type {ReviewedProcedure} from './procedures.ts';

export type GuidedCommand =
 | {kind:'next'} | {kind:'back'} | {kind:'repeat'} | {kind:'where'} | {kind:'end'}
 | {kind:'sleep'} | {kind:'wake'}
 | {kind:'record';text:string}
 | {kind:'question';text:string}
 | {kind:'ignore'};

const clean=(t:string)=>t.toLowerCase().replace(/[^a-z0-9°.,' -]/g,' ').replace(/\s+/g,' ').trim().replace(/[.,!?]+$/,'');
const NEXT=/^(ok(ay)? |all ?right |alright )?(next|next step|next one|next next|done|i'm done|im done|finished|got it|that's done|thats done|continue|go on|go ahead|move on|keep going|ready)( please)?$/;
const BACK=/^(go back|back|back up|back one|previous|previous step|last step|step back|one step back|go back one|go back a step|go back one step)( please)?$/;
const REPEAT=/^(can you |could you )?(repeat|repeat that|repeat the step|say (that|it) again|say again|again|what was that|come again|one more time|read (it|that|the step)( again)?)( please)?$/;
const WHERE=/^(where am i|what step( am i on)?|which step( am i on)?|what's next|whats next|what do i do now)$/;
const END=/^(end (the )?job|stop (the )?job|quit (the )?job|exit (the )?job)$/;
const SLEEP=/^(stop listening|pause listening|pause|sleep|go to sleep|mute)$/;
const NAME='(bak|back|buck|bach|bock|back mx|bak mx)';
const WAKE=new RegExp(`^(hey |ok |okay )?${NAME} (wake up|start listening|i'm back|im back)$`);
// "record" must be said: a stray number in shop talk never advances a measured step.
const RECORD=/^(record|log|measured|measurement|reading)\b[:\s-]*(.+)$/;
// Speech engines hear "BAK" as back, buck, bach or bock, and "back" is a shop word ("back it out a turn"). A spoken
// question must start with "hey" or "ok" plus the name; a command may be prefixed with the name alone. Typed text never needs it.
const WAKE_QUESTION=new RegExp(`^(hey|ok|okay|yo) ${NAME}[, ]+(.{3,})$`);
const NAME_PREFIX=new RegExp(`^((hey|ok|okay|yo) )?${NAME}[, ]+`);

function command(t:string):GuidedCommand|null{
 if(WAKE.test(t))return {kind:'wake'};
 if(SLEEP.test(t))return {kind:'sleep'};
 if(END.test(t))return {kind:'end'};
 if(NEXT.test(t))return {kind:'next'};
 if(BACK.test(t))return {kind:'back'};
 if(REPEAT.test(t))return {kind:'repeat'};
 if(WHERE.test(t))return {kind:'where'};
 return null;
}
/** Reads one utterance. Spoken input needs "hey BAK" for questions; commands are short and stand alone. */
export function parseGuidedInput(raw:string,spoken:boolean):GuidedCommand{
 const t=clean(raw);
 if(!t)return {kind:'ignore'};
 const direct=command(t);if(direct)return direct;
 const rest=t.replace(NAME_PREFIX,'');
 if(rest!==t){const prefixed=command(rest);if(prefixed)return prefixed;}
 const rec=RECORD.exec(rest);
 if(rec&&rec[2].trim().length>0)return {kind:'record',text:raw.trim().replace(NAME_PREFIX,'').replace(/^\s*(hey |ok |okay |yo )?(bak mx|back mx|bak|back|buck|bach|bock)[,\s]+/i,'').replace(/^\s*(record|log|measured|measurement|reading)\b[:\s-]*/i,'')};
 if(spoken){
  if(!WAKE_QUESTION.test(t))return {kind:'ignore'};
  return {kind:'question',text:raw.trim().replace(/^\s*(hey|ok|okay|yo)[,\s]+(bak mx|back mx|bak|back|buck|bach|bock)[,\s]+/i,'')};
 }
 return {kind:'question',text:raw.trim()};
}

/** Text for the step card and for reading aloud. No manual or page references. */
export function stepSpeech(p:ReviewedProcedure,index:number){
 const s=p.steps[index];
 if(!s)return '';
 const checks=s.verification.length?` Before you move on: ${s.verification.map(riderText).join(' ')}`:'';
 const record=s.record_required?' Say "record" and the number when you have it.':'';
 return `Step ${index+1} of ${p.steps.length}. ${riderText(s.title)}. ${riderText(s.instruction)}${checks}${record}`;
}

/** Makes an answer sound right when read aloud: no markdown, units spoken in full. */
export function toSpeech(text:string){
 return text
  .replace(/```[\s\S]*?```/g,' ')
  .replace(/^\s*\|?[-: |]+\|?\s*$/gm,'')
  .replace(/^\s*\|(.+)\|\s*$/gm,(_m,row:string)=>row.split('|').map(c=>c.trim()).filter(Boolean).join(': ')+'.')
  .replace(/\|/g,', ')
  .replace(/(\d)\s?[–-]\s?(\d)/g,'$1 to $2')
  .replace(/^#+\s*/gm,'')
  .replace(/\*\*|__|`/g,'')
  .replace(/^\s*[-*]\s+/gm,'')
  .replace(/\[(.*?)\]\((.*?)\)/g,'$1')
  .replace(/(\d)\s?N·?m\b/g,'$1 newton metres')
  .replace(/(\d)\s?(lbf[ -]?ft|lb[ -]?ft|ft[ -]?lbs?)\b/gi,'$1 foot pounds')
  .replace(/(\d)\s?mm\b/g,'$1 millimetres')
  .replace(/(\d)\s?cm³/g,'$1 cc')
  .replace(/(\d)\s?°\s?C\b/g,'$1 degrees C')
  .replace(/(\d)\s?°\s?F\b/g,'$1 degrees F')
  .replace(/(\d)\s?ml\b/g,'$1 millilitres')
  .replace(/(\d)\s?(l|L)\b/g,'$1 litres')
  .replace(/(\d)\s?bar\b/g,'$1 bar')
  .replace(/(\d)\s?psi\b/gi,'$1 P S I')
  .replace(/\s*\n+\s*/g,'. ')
  .replace(/\.(\s*\.)+/g,'.')
  .replace(/:\./g,':')
  .replace(/\.(?=[A-Za-z])/g,'. ')
  .replace(/\s{2,}/g,' ')
  .trim();
}

export const guidedHelp='Say "next", "back", "repeat" or "where am I". To ask something, start with "Hey BAK", for example "Hey BAK, what\'s the torque on this bolt?" Say "record" and the number to log a measurement. Say "stop listening" to pause.';

/** Rider-facing step text: drops document and page pointers that only make sense next to a manual. */
export function riderText(t:string){
 let s=t
  .replace(/\(\s*(?:see\s+)?PDF\s*\d+(?:\s*[–-]\s*\d+)?(?:\s*(?:,|and)\s*\d+)*\s*\)/gi,'')
  .replace(/\b(?:Use|Using|Per|See)\s+PDF\s*\d+(?:\s*[–-]\s*\d+)?(?:\s*(?:,|and)\s*\d+)*\s+(?:to\s+)?/g,'')
  .replace(/\b(?:use|using|per|see)\s+PDF\s*\d+(?:\s*[–-]\s*\d+)?(?:\s*(?:,|and)\s*\d+)*\s+(?:to\s+)?/g,'')
  .replace(/\s*\b(?:from|in|on|at|as|per)\s+PDF\s*\d+(?:\s*[–-]\s*\d+)?(?:\s*(?:,|and)\s*\d+)*/gi,'')
  .replace(/\s*\b(?:shown|shows|illustrated|marked)\s+(?:on\s+|in\s+)?PDF\s*\d+(?:\s*[–-]\s*\d+)?/gi,' shown in the picture')
  .replace(/\bas PDF\s*\d+(?:\s*[–-]\s*\d+)? shows\b/gi,'as the picture shows')
  .replace(/\bPDF\s*\d+(?:\s*[–-]\s*\d+)?\b/gi,'the picture')
  .replace(/\b(?:linked\s+)?source diagram\b/gi,'picture')
  .replace(/\b(?:following|using|against|per|from)\s+(?:the\s+)?page\s*[\d-]+(?:\s+(?:diagram|cross-section|illustration))?/gi,match=>/^(following|against)/i.test(match)?match.replace(/(?:the\s+)?page\s*[\d-]+(?:\s+(?:diagram|cross-section|illustration))?/i,'the picture'):'')
  .replace(/\b(?:shown|illustrated)\s+(?:on|in)\s+(?:the\s+)?page\s*[\d-]+(?:\s+(?:diagram|cross-section))?/gi,'shown in the picture')
  .replace(/\bthe removal diagram on this page\b/gi,'the removal picture')
  .replace(/\b(?:qualified\s+)?exact-source\b/gi,'specified')
  .replace(/\bsource-(specified|listed|labelled|labeled|permitted|directed|excluded|specific|backed)\b/gi,'$1')
  .replace(/\b(?:this|the)\s+(?:exact\s+)?(?:\d{4}\s+)?source\b/gi,'the spec')
  .replace(/\b(?:the\s+)?(?:OEM\s+)?source\s+(routing|orientation|numbered sequence|paint-mark|locations?|measurement location|calls for|requires|gives|permits|says|instructs)\b/gi,(m,w)=>/^(calls for|requires|gives|permits|says|instructs)$/i.test(w)?'the spec '+w:w)
  .replace(/\b(?:by\s+)?(?:the\s+)?available\s+(?:\d{4}\s+)?manual\b/gi,'the published spec')
  .replace(/\baccording to this manual\b/gi,'per the spec')
  .replace(/\bSource nominal\b/g,'Nominal').replace(/\bsource nominal\b/g,'nominal')
  .replace(/\bthe (?:linked |exact |cited )?(?:manual|source)\b/gi,'the spec')
  .replace(/\s{2,}/g,' ').replace(/\s+([.,;:])/g,'$1').trim();
 return s.charAt(0).toUpperCase()+s.slice(1);
}
