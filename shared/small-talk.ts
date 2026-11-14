// Messages that are not a question for BAK: a thank-you, a hello, or an email address pasted into the box.
// They get a short reply straight from the server, cost the rider nothing from their allowance and never reach the AI.
// Deliberately narrow: anything that could be a real question (a "?", a number, a bike word, more than a few words) is not small talk.
import type {EngineeringResponse} from './types.ts';

const THANKS=/^(?:(?:ok(?:ay)?|cool|nice|great|awesome|perfect|sweet|sounds good|got it|will do|appreciate it|cheers|bet|word)[\s,!.]*)?(?:(?:thanks?|thank you|thx|ty|tysm)(?:\s+(?:so much|a lot|man|bro|dude|bak|again))*|appreciate it)?[\s!.,🙏👍🤘💪]*$/i;
const HELLO=/^(?:hi|hey|hello|yo|sup|what'?s up|howdy|hey bak|hi bak|hello bak)[\s!.,👋]*$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// A bare "ok" is not small talk: in a walk-through it means "next step".
export type SmallTalk='thanks'|'hello'|'email';

export function smallTalkKind(message:string,hasMedia=false):SmallTalk|null{
 if(hasMedia)return null;
 const m=message.trim();
 if(!m||m.length>40||/[?\d]/.test(m.replace(/@\S+/,'')))return null;
 if(EMAIL.test(m))return 'email';
 if(HELLO.test(m))return 'hello';
 if(/thank|thx|\bty\b|tysm|appreciate/i.test(m)&&THANKS.test(m))return 'thanks';
 return null;
}

const REPLIES:Record<SmallTalk,(bike:string|null)=>string>={
 thanks:()=>'Anytime. Let me know how it rides.',
 hello:bike=>bike?`Hey. What’s your ${bike} doing?`:'Hey. What’s the bike doing?',
 email:()=>'That looks like an email address. No need to give it to me. Ask me anything about your bike, setup or the app.',
};

/** A complete, schema-valid reply for small talk. Free: nothing is reserved against the rider's allowance. */
export function smallTalkReply(kind:SmallTalk,bikeLabel:string|null):EngineeringResponse&{kind:'answer';garage_updates:[];app_actions:[];claims:[];data_gaps:[]}{
 const text=REPLIES[kind](bikeLabel);
 return {kind:'answer',summary:text,answer:text,setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[],specifications:[],claims:[],data_gaps:[],confidence:'SUPPORTED',garage_updates:[],app_actions:[]};
}
