import test from 'node:test';
import assert from 'node:assert/strict';
import {APP_GUIDE,appGuideFor,appGuideText,appGuideTextFor,isAppQuestion,isBikeOnly} from '../shared/app-guide.ts';
import {APP_ACTION_TYPES} from '../shared/app-actions.ts';
import {appHelpKnowledge,isAppHowTo} from '../shared/how-bak-works.ts';

// "expo" needs a boundary: "Export my data" is a real button.
const INTERNAL=/supabase|openai|vercel|\bexpo\b|claude|prompt|evidence|claim|\.tsx?\b|_knowledge/i;
const textOf=(e:(typeof APP_GUIDE)[number])=>[e.screen,e.path,e.purpose,...e.how,...(e.settings??[]).flatMap(s=>[s.name,s.what_it_does,...(s.options??[]).flatMap(o=>[o.label,o.effect])])].join(' ');

test('every guide entry is complete and written for riders',()=>{
 assert.ok(APP_GUIDE.length>=30);
 const names=new Set<string>();
 for(const e of APP_GUIDE){
  assert.ok(e.screen.trim()&&e.path.trim()&&e.purpose.trim(),`${e.screen} is missing a field`);
  assert.ok(e.how.length>=1&&e.how.every(l=>l.trim().length>10),`${e.screen} has no how lines`);
  assert.ok(!names.has(e.screen),`${e.screen} appears twice`);names.add(e.screen);
  assert.doesNotMatch(textOf(e),INTERNAL,`${e.screen} leaks an internal word`);
  for(const s of e.settings??[]){assert.ok(s.name.trim()&&s.what_it_does.trim(),`${e.screen} › ${s.name} is incomplete`);for(const o of s.options??[])assert.ok(o.label.trim()&&o.effect.trim(),`${e.screen} › ${s.name} has an empty option`);}
 }
 assert.doesNotMatch(appGuideText(),INTERNAL);
});

test('bak_can_change is true only where an app action really changes that thing',()=>{
 // What shared/app-actions.ts can change, by screen. Everything else stays with the rider.
 const changeable:Record<string,string[]>={Garage:['add_bike','switch_bike','set_engine_hours','set_nickname'],'App colour':['set_theme'],Preferences:['set_preferences'],'Rider profile':['update_profile'],Events:['rsvp_event','create_event'],Community:['draft_post'],'Setup log':['log_setup']};
 for(const types of Object.values(changeable))for(const t of types)assert.ok((APP_ACTION_TYPES as readonly string[]).includes(t),`${t} is not an app action`);
 for(const e of APP_GUIDE){
  assert.equal(!!e.bak_can_change,e.screen in changeable,`${e.screen} bak_can_change should be ${e.screen in changeable}`);
  for(const s of e.settings??[])if(s.bak_can_change)assert.ok(e.bak_can_change,`${e.screen} › ${s.name} is switchable but its screen is not`);
 }
 // Phone-only switches are never offered as something BAK can switch.
 const prefs=APP_GUIDE.find(e=>e.screen==='Preferences')!;
 for(const name of ['Vibration','Reduce motion'])assert.ok(!prefs.settings!.find(s=>s.name===name)!.bak_can_change);
 for(const name of ['Units in BAK’s answers','Answer length','How BAK talks'])assert.ok(prefs.settings!.find(s=>s.name===name)!.bak_can_change);
});

test('app questions find their section; bike questions get nothing',()=>{
 const r=appGuideFor('what does reduce motion do');
 assert.ok(r&&!r.index&&r.sections.length===1&&r.sections[0].screen==='Preferences');
 assert.equal(appGuideFor('how do I set my sag'),null);
 assert.equal(appGuideFor('How do I set my race sag?'),null);
 assert.equal(isAppHowTo('how do I set my sag'),false);
 assert.equal(appHelpKnowledge('How do I set my race sag?'),null);
 for(const [q,screen] of [
  ['what does X do in the app','index'],['what is the build sheet for','Build sheet'],['where is the service log','Service log'],['how do I turn off vibration','Preferences'],['how do I turn on notifications','Notifications'],
  ['what\'s the difference between quick and full answers','Preferences'],['how do I change units','Preferences'],['can you explain the build sheet','Build sheet'],['what are the widgets','Widgets'],['how do I use siri with bak','Siri and Shortcuts'],
  ['how do I delete my account','Delete account and Sign out'],['what does reduce motion do','Preferences'],['How do I add a second bike in the app?','Garage'],['how do I share my garage','Photos'],['how do I block a rider','Community'],
  ['how do I rsvp to an event','Events'],['what is race mode','Ask BAK'],['how do I start a practice day','Practice day'],['how do I set up the fuel plan','Fuel plan'],['what are tuning notes','Notes'],['how do I use hands-free in the workshop','Workshop'],['what does dark mode do','App colour']] as const){
  assert.ok(isAppHowTo(q),`${q} should be an app how-to`);
  const got=appGuideFor(q)!;
  if(screen==='index')assert.ok(got.index&&got.sections.length===0,`${q} should fall back to the index`);
  else assert.ok(!got.index&&got.sections.some(s=>s.screen===screen),`${q} → ${got.sections.map(s=>s.screen).join(', ')||'index'}, wanted ${screen}`);
 }
 for(const q of ['what does the rebound clicker do','how do I set sag','where is the air screw','what settings should I run in sand','what color should my spark plug be','what\'s causing the push in turns','how many clicks out should rebound be','front pushes in flat turns']){
  assert.equal(isAppHowTo(q),false,`${q} is a bike question`);
  assert.equal(appGuideFor(q),null);
 }
 assert.ok(isBikeOnly('how do I set my sag')&&!isBikeOnly('how do I change units'));
 assert.equal(isAppQuestion(''),false);
});

test('the index fallback lists every screen and the knowledge block carries the overview and rules',()=>{
 const index=appGuideTextFor('what does X do in the app')!;
 for(const e of APP_GUIDE)assert.ok(index.includes(e.screen),`index misses ${e.screen}`);
 const k=appHelpKnowledge('what does reduce motion do')!;
 assert.ok(k.overview.includes('Ask BAK')&&k.guide.includes('## Preferences')&&/Want me to switch it\?/.test(k.rules)&&/not a setting in the app/.test(k.rules));
 assert.doesNotMatch(k.guide+k.overview,INTERNAL);
});
