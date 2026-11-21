// First-login setup: one short pass that gets a new rider's basics in, then hands over to the 30-second tour.
// name -> bike -> about you -> how BAK answers -> color -> what goes on Home -> reminders -> look around.
// Shown once, only to an account with no bike yet. The bike step asks for a real answer (pick the bike, or say you are
// still shopping); everything else has "Skip this", and "Skip setup" at the top leaves at any point. Nothing here is a new
// setting: each answer is saved through the same place the Garage and Account screens use, so it can be changed there.
import React,{useState} from 'react';
import {Keyboard,KeyboardAvoidingView,Modal,Platform,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike} from '../../../shared/types';
import type {ThemeMode} from '../../../shared/brand-theme';
import {themeFor,allThemes} from '../../../shared/brand-theme';
import {sortBikeNames} from '../../../shared/bike-identity';
import {garageModels as models,garageModelYears} from '../../../shared/garage-models';
import {RIDING_TYPES} from '../../../shared/garage-fields';
import {WELCOME_STEPS,welcomeSteps,type WelcomeStep} from '../../../shared/welcome-flow';
import type {NotificationSettings} from '../../../shared/notifications';
import {enablePushAfterReminder} from './push';
import {api} from './api';
import {Pressable} from './Touch';
import {Button,Copy,Notice,colors,PickChip,Switch} from './ui';
import {DISPLAY} from './theme';
import {BikeWheel} from './Wheel';
import {randomUUID} from 'expo-crypto';

const LEVELS=['Beginner','Novice','Intermediate','Expert','Pro','Vet'];
const DIRT=['Sand','Loam','Hard-pack','Clay','Mixed','Mud / wet'];
type Prefs={units:'us'|'metric';answer_length:'quick'|'full';tone:'straight'|'encouraging'};
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';

export function FirstLoginSetup({visible,name,onName,colorMode,setColorMode,onBike,onUnlisted,onShopping,onHome,onFinish}:{
 visible:boolean;name:string;onName:(n:string)=>void;colorMode:ThemeMode;setColorMode:(m:ThemeMode)=>void;
 /** The bike was created: reload the Garage and select it. */ onBike:(b:Bike)=>Promise<void>;
 /** "My bike isn't listed": leave setup and open the Garage's own form for a bike typed by hand. */ onUnlisted:()=>void;
 onShopping:()=>void;
 /** The Home step's answers (null = not answered): the caller switches the matching Home blocks. */ onHome:(a:{races:boolean|null;coaching:boolean|null})=>void;onFinish:(how:'tour'|'app'|'skipped')=>void}){
 const insets=useSafeAreaInsets();
 const [step,setStep]=useState<WelcomeStep>('hello'),[bike,setBike]=useState<Bike|null>(null),[shopping,setShopping]=useState(false);
 const [draftName,setDraftName]=useState(name),[friendCode,setFriendCode]=useState(''),[pick,setPick]=useState<{make:string;model:string;year:string}|null>(null),[wheel,setWheel]=useState(false);
 const [weight,setWeight]=useState(''),[level,setLevel]=useState(''),[discipline,setDiscipline]=useState(''),[dirt,setDirt]=useState('');
 const [prefs,setPrefs]=useState<Prefs>({units:'us',answer_length:'full',tone:'straight'});
 const [races,setRaces]=useState<boolean|null>(null),[coaching,setCoaching]=useState<boolean|null>(null);
 const [alerts,setAlerts]=useState<NotificationSettings>({messages:false,replies:false,events:false,service_due:false}),[pushOff,setPushOff]=useState(false);
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const steps=welcomeSteps({hasBike:!!bike}),at=steps.indexOf(step),go=(s:WelcomeStep)=>{setNotice('');Keyboard.dismiss();setStep(s);},next=()=>go(steps[Math.min(at+1,steps.length-1)]),back=()=>go(steps[Math.max(at-1,0)]);
 async function run(work:()=>Promise<void>){if(busy)return;setBusy(true);setNotice('');try{await work();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const saveBike=()=>run(async()=>{
  if(!pick)return;
  const made=await api<Bike>('/api/bikes','POST',{manufacturer:pick.make,model:pick.model,model_year:Number(pick.year),variant:'standard',region:'US',nickname:'',engine_hours:null,configuration:{},create_id:randomUUID()});
  setBike(made);setShopping(false);await onBike(made);go('you');
 });
 const w=Number(weight),youReady=w>=60&&w<=400&&!!level&&!!discipline;
 const saveYou=()=>run(async()=>{
  if(!bike||!youReady)return;const c=bike.configuration??{};
  const saved=await api<Bike>(`/api/bikes?id=${bike.id}`,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours??null,configuration:{...c,geared_weight_lb:weight.trim(),skill_level:level,discipline,...(dirt?{usual_dirt:dirt}:{})}});
  setBike(saved);await onBike(saved);next();
 });
 const savePrefs=()=>run(async()=>{await api('/api/preferences','PUT',prefs);next();});
 const zone=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||undefined;}catch{return undefined;}};
 // Reminders are off until the rider turns one on here; that tap is the moment the phone is asked for permission.
 const saveAlerts=()=>run(async()=>{
  const any=Object.values(alerts).some(Boolean);
  if(any){await api('/api/notification-settings','PUT',{...alerts,...(zone()?{time_zone:zone()}:{})});const ok=await enablePushAfterReminder();if(!ok&&!pushOff){setPushOff(true);return;}}
  next();
 });
 const yesNo=(value:boolean|null,set:(v:boolean)=>void)=><View style={{flexDirection:'row',gap:8}}><PickChip radio label="Yes" on={value===true} onPress={()=>set(true)}/><PickChip radio label="No" on={value===false} onPress={()=>set(false)}/></View>;
 const alertRow=(key:keyof NotificationSettings,t:string,d:string)=><View key={key} style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'600'}}>{t}</Text><Text style={{color:colors.muted,fontSize:13}}>{d}</Text></View><Switch value={alerts[key]} disabled={busy} onValueChange={v=>{setPushOff(false);setAlerts({...alerts,[key]:v});}} accessibilityLabel={t}/></View>;

 const title=(t:string,sub?:string)=><View style={{gap:8}}><Text accessibilityRole="header" style={{color:colors.text,...DISPLAY,fontSize:24,lineHeight:31}}>{t}</Text>{!!sub&&<Copy>{sub}</Copy>}</View>;
 const label=(t:string,sub?:string)=><View style={{gap:2}}><Text style={{color:colors.text,fontSize:16.5,fontWeight:'800'}}>{t}</Text>{!!sub&&<Text style={{color:'#8f97a4',fontSize:13}}>{sub}</Text>}</View>;
 const chips=(items:string[],value:string,set:(v:string)=>void,clearable=false)=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{items.map(i=>{const on=i===value;return <PickChip key={i} radio label={i} on={on} onPress={()=>set(on&&clearable?'':i)}/>;})}</View>;
 const choice=<K extends keyof Prefs>(key:K,opts:[Prefs[K],string,string][])=><View style={{gap:8}}>{opts.map(([v,t,d])=>{const on=prefs[key]===v;return <Pressable key={String(v)} haptic="select" accessibilityRole="radio" accessibilityState={{selected:on}} onPress={()=>setPrefs({...prefs,[key]:v})} style={({pressed})=>({borderWidth:1,borderColor:on?colors.accent:'#2a2f39',backgroundColor:on?'#111a2b':'#0e1015',borderRadius:14,paddingVertical:12,paddingHorizontal:14,gap:2,opacity:pressed?0.75:1})}><Text style={{color:colors.text,fontSize:15.5,fontWeight:on?'800':'600'}}>{t}</Text><Text style={{color:colors.muted,fontSize:13}}>{d}</Text></Pressable>;})}</View>;
 const own=themeFor(bike?.manufacturer,'bike'),bak=allThemes()[0];
 const swatch=(mode:ThemeMode,t:string,d:string,color:string)=>{const on=colorMode===mode;return <Pressable key={mode} haptic="select" accessibilityRole="radio" accessibilityState={{selected:on}} onPress={()=>setColorMode(mode)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:on?colors.accent:'#2a2f39',backgroundColor:on?'#111a2b':'#0e1015',borderRadius:14,paddingVertical:12,paddingHorizontal:14,opacity:pressed?0.75:1})}><View style={{width:26,height:26,borderRadius:13,backgroundColor:color,borderWidth:2,borderColor:on?'#ffffff':'transparent'}}/><View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15.5,fontWeight:on?'800':'600'}}>{t}</Text><Text style={{color:colors.muted,fontSize:13}}>{d}</Text></View></Pressable>;};

 const body:Record<WelcomeStep,React.ReactNode>={
  hello:<>{title('Welcome to BAK MX','A minute of setup so BAK knows you and your bike. Then a quick look around.')}
   <View style={{gap:8}}>{label('What should BAK call you?','First name is plenty. Optional.')}
    <TextInput value={draftName} onChangeText={v=>setDraftName(v.slice(0,40))} placeholder="Your name" placeholderTextColor="#7d8593" autoCapitalize="words" autoCorrect={false} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} accessibilityLabel="Your name" style={{color:colors.text,fontSize:20,fontWeight:'700',borderBottomWidth:1,borderBottomColor:colors.accent,paddingVertical:8}}/></View>
   <View style={{gap:8}}>{label('Did a friend invite you?','Enter their code and they get 10 free Ask BAK questions once you add your bike. Optional.')}
    <TextInput value={friendCode} onChangeText={v=>{setFriendCode(v.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,13));if(notice)setNotice('');}} placeholder="Friend's code" placeholderTextColor="#7d8593" autoCapitalize="characters" autoCorrect={false} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} accessibilityLabel="Friend's invite code" style={{color:colors.text,fontSize:17,fontWeight:'600',letterSpacing:1,borderBottomWidth:1,borderBottomColor:notice?'#c8553d':'#2a2f39',paddingVertical:8}}/>
    {!!notice&&<Text accessibilityRole="alert" style={{color:'#f0a090',fontSize:14,lineHeight:19}}>{notice} Or clear the box to carry on without a code.</Text>}</View></>,
  bike:<>{title('Which bike are you on?','Pick make, model and year. BAK loads its stock setup, specs and service schedule.')}
   <Pressable accessibilityRole="button" accessibilityLabel={pick?`Bike: ${pick.year} ${pick.make} ${pick.model}. Tap to change`:'Choose your bike'} disabled={busy} onPress={()=>setWheel(true)} style={({pressed})=>({borderWidth:1,borderColor:pick?colors.accent:'#2a2f39',backgroundColor:'#0e1015',borderRadius:16,paddingVertical:16,paddingHorizontal:16,gap:3,opacity:pressed||busy?0.7:1})}>
    <Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>Bike</Text><Text style={{color:pick?colors.text:colors.accent,fontSize:19,fontWeight:'800'}}>{pick?`${pick.year} ${pick.make} ${pick.model}`:'Choose your bike'}</Text></Pressable>
   <BikeWheel visible={wheel} makes={sortBikeNames(Object.keys(models))} modelsFor={m=>models[m]??[]} yearsFor={garageModelYears} initial={pick??undefined} onClose={()=>setWheel(false)} footer={{label:'My bike isn’t listed',onPress:()=>{setWheel(false);onUnlisted();}}} onDone={b=>{setWheel(false);setPick(b);}}/>
   <Pressable accessibilityRole="button" disabled={busy} onPress={()=>{setShopping(true);onShopping();go('answers');}} style={{borderWidth:1,borderColor:'#2a2f39',borderRadius:14,paddingVertical:14,paddingHorizontal:16,backgroundColor:'#12151b'}}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>I’m still shopping for one</Text><Text style={{color:colors.muted,fontSize:13,marginTop:2}}>Fine. Add your bike from the Garage when you have it.</Text></Pressable></>,
  you:<>{title('A little about you',bike?`BAK sets the ${bike.model_year} ${bike.manufacturer} ${bike.model} up for your weight, level and the riding you do.`:undefined)}
   <View style={{gap:10}}>{label('Weight in riding gear','Boots, helmet, the lot. Springs and sag come from this.')}
    <View style={{flexDirection:'row',alignItems:'flex-end',gap:8}}><TextInput value={weight} onChangeText={v=>setWeight(v.replace(/[^0-9]/g,'').slice(0,3))} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} placeholder="185" placeholderTextColor="#7d8593" accessibilityLabel="Weight in riding gear, pounds" style={{color:colors.text,fontSize:25.5,...DISPLAY,borderBottomWidth:1,borderBottomColor:colors.accent,paddingVertical:6,minWidth:110}}/><Text style={{color:colors.muted,fontSize:16,paddingBottom:12}}>lb</Text></View></View>
   <View style={{gap:10}}>{label('Riding level')}{chips(LEVELS,level,setLevel)}</View>
   <View style={{gap:10}}>{label('Main kind of riding')}{chips(RIDING_TYPES,discipline,setDiscipline)}</View>
   <View style={{gap:10}}>{label('Usual dirt','Optional. Tap again to clear.')}{chips(DIRT,dirt,setDirt,true)}</View></>,
  answers:<>{title('How should BAK talk to you?','You can change these any time in Account.')}
   <View style={{gap:10}}>{label('Measurements')}{choice('units',[['us','US','Pounds, inches, psi. Torque and springs keep the unit the maker prints.'],['metric','Metric','Kilograms, millimetres, bar.']])}</View>
   <View style={{gap:10}}>{label('Answers')}{choice('answer_length',[['quick','Quick','The fix and the number first, the why in a line.'],['full','Full','The fix, why it works, the trade-offs and what to try next.']])}</View>
   <View style={{gap:10}}>{label('Tone')}{choice('tone',[['straight','Straight','Just the facts.'],['encouraging','Encouraging','Same facts, a bit more coaching.']])}</View></>,
  look:<>{title('Pick your color','The app can wear your bike’s color or stay BAK blue.')}
   <View style={{gap:10}}>{swatch('bike','Match my bike',bike?(own.key==='bak'?'This bike uses BAK blue':`${own.label} for your ${bike.manufacturer}. Changes when you switch bikes.`):'Follows the bike you have selected',own.deep)}{swatch('bak','BAK blue','The same blue on every bike',bak.deep)}</View></>,
  home:<>{title('What do you want on Home?','Home stays short: the question bar, your bike and what’s up next. Two extras are yours to add.')}
   <View style={{gap:10}}>{label('Do you race?','Yes puts your race prep checklist on Home, from the week before to after the last moto.')}{yesNo(races,setRaces)}</View>
   <View style={{gap:10}}>{label('Want your last coaching fix on Home?','Your latest fix and drill from Ask BAK, where you’ll see it before you ride.')}{yesNo(coaching,setCoaching)}</View>
   <Text style={{color:'#7d8593',fontSize:12.5,lineHeight:18}}>Change it any time with Edit Home. BAK MX home-screen widgets are added from your phone’s own widget menu.</Text></>,
  alerts:<>{title('Want any reminders?','All off unless you turn one on. Change them any time in Account.')}
   <View style={{gap:16}}>{alertRow('service_due','Service due','When a job is close or overdue, by the hours on your bike.')}{alertRow('events','Event reminders','The evening before and the morning of events you’re going to.')}{alertRow('messages','New messages','When a rider sends you a message.')}{alertRow('replies','Comments on your posts','When someone comments on your post.')}</View>
   {pushOff&&<Text style={{color:colors.muted,fontSize:13,lineHeight:18}}>Notifications are off for BAK MX on this phone, so these are saved but won’t show until you turn them on in your phone’s Settings. Tap Continue to carry on.</Text>}</>,
  done:<>{title(draftName.trim()?`You’re set, ${draftName.trim()}`:'You’re set',bike?'Your bike is in the Garage and BAK knows the basics. Want a 30-second look around?':shopping?'Add your bike from the Garage when you have one. Want a 30-second look around first?':'Want a 30-second look around?')}</>,
 };
 const primary:Record<WelcomeStep,{title:string;onPress:()=>void;disabled?:boolean}>={
  hello:{title:'Continue',disabled:busy,onPress:()=>{onName(draftName.trim());if(!friendCode.trim()){next();return;}void run(async()=>{await api('/api/invite/redeem','POST',{code:friendCode.trim()});setFriendCode('');next();});}},
  bike:{title:busy?'Adding…':'Add this bike',onPress:()=>void saveBike(),disabled:!pick||busy},
  you:{title:busy?'Saving…':'Save and continue',onPress:()=>void saveYou(),disabled:!youReady||busy},
  answers:{title:busy?'Saving…':'Save and continue',onPress:()=>void savePrefs(),disabled:busy},
  look:{title:'Continue',onPress:next},
  home:{title:'Continue',onPress:()=>{onHome({races,coaching});next();}},
  alerts:{title:busy?'Saving…':'Continue',onPress:()=>void saveAlerts(),disabled:busy},
  done:{title:'Show me around',onPress:()=>onFinish('tour')},
 };
 // The bike step has no "Skip this": the rider picks a bike or says they are still shopping.
 const skippable=step==='you'||step==='answers'||step==='look'||step==='home'||step==='alerts';
 return <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={()=>{if(at>0)back();}}>
  <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:12}}>
    {at>0&&step!=='done'?<Pressable accessibilityRole="button" onPress={back} hitSlop={10}><Text style={{color:colors.muted,fontSize:16}}>Back</Text></Pressable>:<View/>}
    <View accessible accessibilityLabel={`Step ${at+1} of ${steps.length}`} style={{flexDirection:'row',gap:6}}>{steps.map((s,i)=><View key={s} style={{width:i===at?18:6,height:6,borderRadius:3,backgroundColor:i<=at?colors.accent:'#2a2f39'}}/>)}</View>
    {step!=='done'?<Pressable accessibilityRole="button" accessibilityHint="Leaves setup. You can fill everything in later from the Garage and Account." onPress={()=>onFinish('skipped')} hitSlop={10}><Text style={{color:colors.muted,fontSize:16}}>Skip setup</Text></Pressable>:<View/>}
   </View>
   <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" style={{flex:1}} contentContainerStyle={{padding:20,paddingTop:14,paddingBottom:24,gap:22}}>{body[step]}</ScrollView>
   <View style={{paddingHorizontal:20,paddingTop:12,paddingBottom:Math.max(insets.bottom,12)+8,gap:10,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',backgroundColor:colors.bg}}>
    {step!=='hello'&&<Notice text={notice} tone={notice?'warn':undefined}/>}
    <Button title={primary[step].title} disabled={primary[step].disabled} onPress={primary[step].onPress}/>
    {skippable&&<Pressable accessibilityRole="button" disabled={busy} onPress={next} hitSlop={6} style={{alignSelf:'center',paddingVertical:4}}><Text style={{color:colors.muted,fontSize:15}}>Skip this</Text></Pressable>}
    {step==='done'&&<Pressable accessibilityRole="button" onPress={()=>onFinish('app')} hitSlop={6} style={{alignSelf:'center',paddingVertical:4}}><Text style={{color:colors.muted,fontSize:15}}>No thanks, take me to the app</Text></Pressable>}
   </View>
  </KeyboardAvoidingView>
 </Modal>;
}
export {WELCOME_STEPS};
