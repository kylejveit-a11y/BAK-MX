// Fuel plan on the phone, inside race mode: what to eat and drink and when, for the rider (or a rider on this account,
// like a parent's child) on race day and practice day, anchored to the next gate drop. The profile (weight, height, age)
// is saved to the account and cached on the phone for weak signal at the track; today's gate times and toggles are kept
// on the phone. The rules are in shared/fuel-plan.ts; src/FuelPlan.tsx is the website's version.
import {PageSheet} from './PageSheet';
import React,{useEffect,useMemo,useState} from 'react';
import {Alert,Modal,ScrollView,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {randomUUID} from 'expo-crypto';
import {buildFuelPlan,clockLabel,draftBody,draftFrom,EVIDENCE_TEXT,gatesOf,isYouth,MOTO_LENGTHS,nextGate,nextUpLine,offsetText,profileName,readFuelDay,riderOf,SAFETY_TITLE,SCREEN_ITEMS,shiftGate,sourceText,splitByNow,sweatRateText,sweatTest,untilText,withSweatRate,type DayInput,type FuelDay,type FuelPlan,type FuelProfileRow,type Gate,type PlanItem,type ProfileDraft} from '../../../shared/fuel-plan';
import {parseClock} from '../../../shared/practice-day';
import {today,type RaceDay} from '../../../shared/race-day';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,DONE_BAR,Eyebrow,Icon,KeyboardDoneBar,MetalMark,Notice,Switch,colors,tint} from './ui';
import {Glass,useKeyboardHeight} from './Glass';
import {success} from './haptics';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const nowClock=()=>{const d=new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
const listeners=new Set<()=>void>();
const changed=()=>{for(const l of listeners)l();};
const input={color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10} as const;
const Label=({children}:{children:React.ReactNode})=><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{children}</Text>;
const Small=({children,tone}:{children:React.ReactNode;tone?:string})=><Text style={{color:tone??'#7d8593',fontSize:12.5,lineHeight:18}}>{children}</Text>;
const Wrap=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{children}</View>;
function Chip({label,on,onPress,disabled=false}:{label:string;on:boolean;onPress:()=>void;disabled?:boolean}){
 return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:on,disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:disabled?0.4:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{label}</Text></Pressable>;
}
function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){
 return <View style={{flexDirection:'row',alignItems:'center',gap:12}}><Text style={{flex:1,color:colors.text,fontSize:15}}>{label}</Text><Switch value={value} onValueChange={onChange} accessibilityLabel={label}/></View>;
}

/** The account's fuel profiles, cached on the phone so the card shows with no signal. */
export function useFuelProfiles(account:string){
 const read=()=>readProgress<FuelProfileRow[]>(account,'fuel-profiles',[])??[];
 const [rows,setRows]=useState<FuelProfileRow[]>(read);
 const [error,setError]=useState('');
 const keep=(next:FuelProfileRow[])=>{setRows(next);try{writeProgress(account,'fuel-profiles',next);}catch{}changed();};
 useEffect(()=>{api<FuelProfileRow[]>('/api/fuel-profiles').then(r=>{keep(r);setError('');}).catch(e=>setError(errorText(e)));const l=()=>setRows(read());listeners.add(l);return()=>{listeners.delete(l);};},[account]);
 const put=async(body:Record<string,unknown>)=>{const saved=await api<FuelProfileRow>('/api/fuel-profiles','PUT',body);keep([...read().filter(r=>r.id!==saved.id),saved]);return saved;};
 const remove=async(id:string)=>{await api('/api/fuel-profiles?id='+id,'DELETE');keep(read().filter(r=>r.id!==id));};
 return {rows,error,put,remove};
}
function useNow(){const [now,setNow]=useState(nowClock);useEffect(()=>{const t=setInterval(()=>setNow(nowClock()),30000);return()=>clearInterval(t);},[]);return now;}

function Item({item,plan,gates,past}:{item:PlanItem;plan:FuelPlan;gates:Gate[];past?:boolean}){
 const [open,setOpen]=useState(false);
 const off=offsetText(item,gates),d=item.eat?.detail;
 return <View style={{flexDirection:'row',gap:12,paddingVertical:11,borderTopWidth:1,borderTopColor:'#1a1e25',opacity:past?0.45:1}}>
  <View style={{width:74,gap:2}}><Text style={{color:colors.accent,fontSize:15,fontWeight:'800'}}>{item.at?clockLabel(item.at):''}</Text>{!!off&&<Text style={{color:'#7d8593',fontSize:11.5,lineHeight:15}}>{off}</Text>}</View>
  <View style={{flex:1,gap:4}}>
   <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{item.title}{item.optional?<Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:0.6}}>  OPTIONAL</Text>:null}</Text>
   {item.eat&&<Text style={{color:'#e4e8ef',fontSize:14.5,lineHeight:20}}>{item.eat.foods.join(' · ')}</Text>}
   {item.drink&&<Text style={{color:'#e4e8ef',fontSize:14.5,lineHeight:20}}>{item.drink.what}: <Text style={{color:'#ffffff',fontWeight:'700'}}>{item.drink.text}</Text>{item.drink.only_if?` · ${item.drink.only_if}`:''}</Text>}
   {!!item.drink?.ceiling&&<Small tone="#f1d38a">{item.drink.ceiling}</Small>}
   <Text style={{color:colors.muted,fontSize:13,lineHeight:18}}>{item.why}</Text>
   {!plan.portionsOnly&&!!d&&<Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} hitSlop={6}><Text style={{color:colors.text,fontSize:13,fontWeight:'700'}}>{open?'Hide grams':'Grams behind this'}</Text></Pressable>}
   {open&&!!d&&<Small>{d.basis}. Target {d.carb_g[0]}–{d.carb_g[1]} g carbohydrate{d.foods_carb_g?`; these foods ≈ ${d.foods_carb_g} g`:''}{d.protein_g?`; protein ${d.protein_g[0]}–${d.protein_g[1]} g`:''}.{d.per_food.length?` ${d.per_food.map(f=>`${f.food} ≈ ${f.carb_g} g`).join(' · ')} (approximate)`:''}</Small>}
   <View style={{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:6}}>
    <Text style={{fontSize:10.5,fontWeight:'800',letterSpacing:0.5,paddingHorizontal:6,paddingVertical:2,borderRadius:6,overflow:'hidden',color:item.evidence==='evidence-based'?'#9fdcb3':'#c3cad6',backgroundColor:item.evidence==='evidence-based'?'#12261a':'#1b1f28'}}>{EVIDENCE_TEXT[item.evidence].toUpperCase()}</Text>
    <Text style={{color:'#6f7784',fontSize:11.5,flexShrink:1}}>{sourceText(item.sources)}</Text>
   </View>
  </View>
 </View>;
}

/** Always shown on race day and practice day, even when the plan is blocked. */
export function HeatRedFlags({plan}:{plan:FuelPlan}){
 const s=plan.safety;
 return <View accessibilityRole="summary" style={{borderWidth:1,borderColor:'#7a3038',backgroundColor:'#1d0e0f',borderRadius:12,padding:12,gap:6}}>
  <Text style={{color:'#ffb4b9',fontSize:14,fontWeight:'800'}}>{SAFETY_TITLE}</Text>
  <Text style={{color:'#f3d5d7',fontSize:13.5,lineHeight:19}}>{s.stop.join(' · ')}</Text>
  <Text style={{color:'#ffd9dc',fontSize:13,lineHeight:18}}><Text style={{fontWeight:'800'}}>Call 911: </Text>{s.call911.join(' · ')}. Cool first, transport second.</Text>
  <Text style={{color:'#ffd9dc',fontSize:13,lineHeight:18}}>{s.lowSodium}</Text>
  <Small>{s.note} ({sourceText(s.sources)})</Small>
 </View>;
}

/** Race day and practice day: the fuel plan card. */
export function FuelPlanCard({account,race,kind}:{account:string;race:RaceDay;kind:'race'|'practice'}){
 const {rows,error}=useFuelProfiles(account);
 const now=useNow(),day=today(),key=`fuel-day:${kind}`;
 const read=()=>readFuelDay(readProgress(account,key,null),day,kind,race.next?.at||null);
 const [saved,setSaved]=useState<FuelDay>(read);
 const [setup,setSetup]=useState(false),[sweat,setSweat]=useState(false),[shift,setShift]=useState<number|null>(null),[showPast,setShowPast]=useState(false),[notice,setNotice]=useState(''),[open,setOpen]=useState(true);
 const [drafts,setDrafts]=useState<Record<number,string>>({});
 useEffect(()=>{setSaved(read());},[account,key,day]);
 const save=(next:FuelDay)=>{setSaved(next);try{writeProgress(account,key,next);}catch{setNotice('This phone could not save today’s times. Free some storage.');}};
 const setInput=(p:Partial<DayInput>)=>save({...saved,input:{...saved.input,...p}});
 const row=rows.find(r=>r.id===saved.profileId)??rows.find(r=>r.kind==='self')??rows[0]??null;
 const plan=useMemo(()=>row?buildFuelPlan(riderOf(row),{...saved.input,motoMinutes:saved.input.motoMinutes??row.moto_minutes??20}):null,[row,saved]);
 const gates=gatesOf(saved.input),next=nextGate(saved.input,now),youth=row?isYouth(row.age):false;
 const word=kind==='practice'?'Session':'Moto';
 const setTime=(i:number,text:string)=>{setDrafts(d=>({...d,[i]:text}));const at=parseClock(text);if(at||!text.trim()){const gs=[...saved.input.gates];gs[i]={...gs[i],at:at??''};setInput({gates:gs});}};

 if(!row)return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={14}/><Eyebrow>FUEL PLAN</Eyebrow></View>
  <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>What to eat and drink, and when</Text>
  <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Worried food will make you feel bad on the bike? Enter weight, height and age once and BAK lays out the day before, race morning, between motos and after, timed to your gate drops. Parents can set one up for a child rider.</Text>
  <Notice text={error}/>
  <Button title="Set up the fuel plan" onPress={()=>setSetup(true)}/>
  <FuelProfileSheet visible={setup} account={account} onClose={()=>setSetup(false)} onSaved={id=>save({...saved,profileId:id})}/>
 </Card>;

 const {ahead,past}=plan?splitByNow(plan.items,now):{ahead:[],past:[]};
 return <Card>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8,flex:1}}><MetalMark width={14}/><Eyebrow>FUEL PLAN · {profileName(row).toUpperCase()}{youth?' · PARENT VIEW':''}</Eyebrow></View>
   <Pressable accessibilityRole="button" onPress={()=>setSetup(true)} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700'}}>Rider</Text></Pressable>
  </View>
  {rows.length>1&&<Wrap>{rows.map(r=><Chip key={r.id} label={profileName(r)} on={r.id===row.id} onPress={()=>save({...saved,profileId:r.id})}/>)}</Wrap>}
  {plan&&<Text accessibilityLiveRegion="polite" style={{color:colors.text,fontSize:16,fontWeight:'700',lineHeight:22}}>{next?`Next gate: ${next.label} ${untilText(next.minutes)}`:gates.length?'All gates done today':'Add your gate times'}<Text style={{color:'#c9d1dd',fontWeight:'500'}}> · {nextUpLine(plan,now)}</Text></Text>}
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} hitSlop={6}><Text style={{color:colors.muted,fontSize:13.5}}>{open?'Hide gate times':'Gate times and today’s settings'}</Text></Pressable>
  {open&&<View style={{gap:10}}>
   {saved.input.gates.map((g,i)=><View key={i} style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <TextInput value={g.label} onChangeText={v=>{const gs=[...saved.input.gates];gs[i]={...g,label:v};setInput({gates:gs});}} maxLength={30} accessibilityLabel={`${word} ${i+1} name`} style={[input,{flex:1}]}/>
    <TextInput value={drafts[i]??g.at} onChangeText={v=>setTime(i,v)} onBlur={()=>setDrafts(d=>{const n={...d};delete n[i];return n;})} placeholder="10:40" placeholderTextColor="#7d8593" keyboardType="numbers-and-punctuation" maxLength={8} accessibilityLabel={`${g.label||word} gate time`} returnKeyType="done" style={[input,{width:78}]}/>
    {!!g.at&&<Pressable accessibilityRole="button" onPress={()=>{const one=gatesOf({kind,gates:[g]})[0];setShift(gates.findIndex(x=>x.at===one?.at&&x.label===one?.label));}} hitSlop={6}><Text style={{color:colors.text,fontWeight:'700',fontSize:13.5}}>Moved?</Text></Pressable>}
    <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${g.label}`} onPress={()=>setInput({gates:saved.input.gates.filter((_,j)=>j!==i)})} hitSlop={6}><Icon name="close" size={16} color={colors.muted}/></Pressable>
   </View>)}
   <Pressable accessibilityRole="button" onPress={()=>setInput({gates:[...saved.input.gates,{label:`${word} ${saved.input.gates.length+1}`,at:''}]})} hitSlop={6} style={{flexDirection:'row',alignItems:'center',gap:6}}><Icon name="plus" size={15} color={colors.accent}/><Text style={{color:colors.text,fontWeight:'700'}}>Add {word.toLowerCase()} time</Text></Pressable>
   <Label>{word} length</Label>
   <Wrap>{MOTO_LENGTHS.map(m=><Chip key={m} label={`${m} min`} on={(saved.input.motoMinutes??20)===m} onPress={()=>setInput({motoMinutes:m})}/>)}</Wrap>
   <Toggle label="Hot or humid today" value={!!saved.input.hot} onChange={v=>setInput({hot:v})}/>
   <Toggle label="Nervous stomach" value={saved.input.nervous??!!row.nervous_stomach} onChange={v=>setInput({nervous:v})}/>
   {!youth&&row.caffeine&&<Toggle label="Caffeine today" value={saved.input.caffeine??true} onChange={v=>setInput({caffeine:v})}/>}
  </View>}
  <Notice text={notice}/>
  {plan&&<>
   {!!plan.blocked&&<Notice tone="warn" text={plan.blocked.reason}/>}
   {plan.problems.map(p=><Small key={p}>{p}</Small>)}
   {!plan.blocked&&<>
    {past.length>0&&<Pressable accessibilityRole="button" onPress={()=>setShowPast(!showPast)} hitSlop={6}><Text style={{color:colors.muted,fontSize:13.5}}>{showPast?'Hide':'Show'} {past.length} earlier</Text></Pressable>}
    <View>{showPast&&past.map(i=><Item key={i.id} item={i} plan={plan} gates={gates} past/>)}{ahead.map(i=><Item key={i.id} item={i} plan={plan} gates={gates}/>)}</View>
    <View style={{borderWidth:1,borderColor:'#4a4026',backgroundColor:'#17140c',borderRadius:10,padding:10}}><Text style={{color:'#f1d38a',fontSize:13,lineHeight:18}}>{plan.ceiling.text}</Text></View>
    {plan.sweat.rate_lph?<Small tone="#9fdcb3">Sweat test: {sweatRateText(plan.sweat.rate_lph,row.moto_minutes??20,plan.youth)}</Small>:<Small>{plan.sweat.prompt}</Small>}
    <Pressable accessibilityRole="button" onPress={()=>setSweat(true)} hitSlop={6}><Text style={{color:colors.text,fontWeight:'700'}}>{plan.sweat.rate_lph?'Redo the sweat test':'Do the sweat test'}</Text></Pressable>
    {plan.notes.map(n=><Text key={n} style={{color:colors.muted,fontSize:13,lineHeight:18}}>{n}</Text>)}
    {plan.dayBefore.length>0&&<DayBefore plan={plan} gates={gates}/>}
   </>}
   <HeatRedFlags plan={plan}/>
   <Small>{plan.disclaimer}</Small>
  </>}
  <FuelProfileSheet visible={setup} account={account} current={row} onClose={()=>setSetup(false)} onSaved={id=>save({...saved,profileId:id})}/>
  <SweatTestSheet visible={sweat} account={account} row={row} onClose={()=>setSweat(false)}/>
  <GateShiftSheet visible={shift!=null&&shift>=0} input={saved.input} index={shift??0} now={now} youth={youth} mealAt={plan?.items.find(i=>i.id==='meal')?.at??null} onClose={()=>setShift(null)} onApply={(inp,notes)=>{setInput(inp);setNotice(notes.join(' '));setShift(null);success();}}/>
 </Card>;
}

function DayBefore({plan,gates}:{plan:FuelPlan;gates:Gate[]}){
 const [open,setOpen]=useState(false);
 return <View style={{gap:4}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} hitSlop={6} style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={{color:colors.text,fontWeight:'700'}}>The day before</Text><Icon name={open?'chevronUp':'chevronDown'} size={15} color={colors.accent}/></Pressable>
  {open&&plan.dayBefore.map(i=><Item key={i.id} item={i} plan={plan} gates={gates}/>)}
 </View>;
}

/** The sheet: fields scroll and keep their keyboard insets; `footer` (the primary button) rides above the keyboard and the
 *  home indicator, the way Page's footerForAction does, so Save is never under the number pad. A Done bar closes that pad. */
function SheetFrame({visible,title,onClose,footer,children}:{visible:boolean;title:string;onClose:()=>void;footer?:React.ReactNode;children:React.ReactNode}){
 const insets=useSafeAreaInsets(),kb=useKeyboardHeight(),[footH,setFootH]=useState(0);
 const footBottom=kb>0?kb+8:insets.bottom+10;
 return <PageSheet visible={visible} animationType="slide" onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:colors.bg,paddingTop:18}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingBottom:6}}>
    <View style={{gap:6}}><Text style={{color:colors.text,fontSize:28,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.8}}>{title}</Text><View style={{flexDirection:'row',gap:4}}><MetalMark width={26}/><MetalMark width={8} dim/></View></View>
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>Close</Text></Pressable>
   </View>
   <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets contentContainerStyle={{paddingHorizontal:20,paddingTop:12,paddingBottom:insets.bottom+30+(footer?footH+16:0),gap:14}}>{children}</ScrollView>
   {footer&&<View onLayout={e=>setFootH(e.nativeEvent.layout.height)} pointerEvents="box-none" style={{position:'absolute',left:12,right:12,bottom:footBottom}}><Glass strong style={{borderRadius:26}}><View style={{padding:12}}>{footer}</View></Glass></View>}
   <KeyboardDoneBar/>
  </View>
 </PageSheet>;
}
const Num=({label,value,onChange,width}:{label:string;value:string;onChange:(v:string)=>void;width?:number})=><View style={{flex:width?undefined:1,width,gap:2}}><Label>{label}</Label><TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" maxLength={6} accessibilityLabel={label} inputAccessoryViewID={DONE_BAR} style={input}/></View>;

// ------------------------------------------------------------------ the rider profile
export function FuelProfileSheet({visible,account,current,onClose,onSaved}:{visible:boolean;account:string;current?:FuelProfileRow|null;onClose:()=>void;onSaved:(id:string)=>void}){
 const {rows,put,remove}=useFuelProfiles(account);
 const hasSelf=rows.some(r=>r.kind==='self');
 const start=(row:FuelProfileRow|null)=>draftFrom(row,{id:row?.id??randomUUID(),kind:row?.kind??(hasSelf?'rider':'self')});
 const [d,setD]=useState<ProfileDraft>(()=>start(current??null));
 const [busy,setBusy]=useState(false),[problem,setProblem]=useState('');
 useEffect(()=>{if(visible){setD(start(current??null));setProblem('');}},[visible]);
 const set=(p:Partial<ProfileDraft>)=>setD(x=>({...x,...p}));
 const row=rows.find(r=>r.id===d.id)??null;
 const age=Number(d.age),adult=Number.isFinite(age)&&age>=18,screened=d.screen.filter(s=>s!=='ill_now').length>0;
 async function submit(){const b=draftBody(d,row);if('problem' in b){setProblem(b.problem);return;}setBusy(true);setProblem('');
  try{const saved=await put(b.body);success();onSaved(saved.id);onClose();}catch(e){setProblem(errorText(e));}finally{setBusy(false);}}
 const del=()=>{if(!row)return;Alert.alert(`Remove ${profileName(row)}?`,'Their fuel profile and sweat test are deleted from your account.',[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:()=>{setBusy(true);remove(row.id).then(onClose).catch(e=>setProblem(errorText(e))).finally(()=>setBusy(false));}}]);};
 return <SheetFrame visible={visible} title="Fuel plan rider" onClose={onClose} footer={<Button disabled={busy} title={busy?'Saving…':'Save to my account'} onPress={()=>void submit()}/>}>
  {rows.length>0&&<Wrap>{rows.map(r=><Chip key={r.id} label={profileName(r)} on={r.id===d.id} onPress={()=>setD(start(r))}/>)}<Chip label="+ New rider" on={!row} onPress={()=>setD(start(null))}/></Wrap>}
  {!row&&<Wrap><Chip label="Me" on={d.kind==='self'} disabled={hasSelf} onPress={()=>set({kind:'self'})}/><Chip label="Another rider (like my kid)" on={d.kind==='rider'} onPress={()=>set({kind:'rider'})}/></Wrap>}
  {d.kind==='rider'&&<View style={{gap:2}}><Label>Name</Label><TextInput value={d.name} onChangeText={v=>set({name:v})} maxLength={40} placeholder="First name or number" placeholderTextColor="#7d8593" style={input}/></View>}
  <Wrap><Chip label="lb · ft/in" on={d.unit==='lb'} onPress={()=>set({unit:'lb'})}/><Chip label="kg · cm" on={d.unit==='kg'} onPress={()=>set({unit:'kg'})}/></Wrap>
  <View style={{flexDirection:'row',gap:14}}><Num label={`Weight (${d.unit})`} value={d.weight} onChange={v=>set({weight:v})}/><Num label="Age" value={d.age} onChange={v=>set({age:v})}/></View>
  {d.unit==='lb'?<View style={{flexDirection:'row',gap:14}}><Num label="Height (ft)" value={d.ft} onChange={v=>set({ft:v})}/><Num label="(in)" value={d.inch} onChange={v=>set({inch:v})}/></View>
   :<Num label="Height (cm)" value={d.cm} onChange={v=>set({cm:v})}/>}
  <Small>Weight only scales portions and the sweat test. It never shows on the plan, and BAK never sets a weight goal. Height is just stored.</Small>
  <Label>Sex (optional)</Label>
  <Wrap><Chip label="Skip" on={d.sex===''} onPress={()=>set({sex:''})}/><Chip label="Female" on={d.sex==='female'} onPress={()=>set({sex:'female'})}/><Chip label="Male" on={d.sex==='male'} onPress={()=>set({sex:'male'})}/></Wrap>
  <Toggle label="Nervous stomach on race day" value={d.nervous} onChange={v=>set({nervous:v})}/>
  {adult&&<Toggle label="I already use caffeine and want it in the plan" value={d.caffeine} onChange={v=>set({caffeine:v})}/>}
  {!adult&&d.age.trim()!==''&&<Small>Under 18: the plan is a parent view in portions and cups, water first, no caffeine or energy drinks.</Small>}
  <Label>Before using the plan, does any of this apply?</Label>
  {SCREEN_ITEMS.map(s=>{const on=d.screen.includes(s.id);return <Pressable key={s.id} haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:on}} onPress={()=>set({screen:on?d.screen.filter(x=>x!==s.id):[...d.screen,s.id]})} style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
   <View style={{width:22,height:22,borderRadius:6,marginTop:1,borderWidth:1.5,borderColor:on?colors.accent:'#4a515d',backgroundColor:on?tint(0.24):'transparent',alignItems:'center',justifyContent:'center'}}>{on&&<Icon name="check" size={14} color="#ffffff"/>}</View>
   <Text style={{flex:1,color:colors.text,fontSize:14.5,lineHeight:20}}>{s.label}</Text>
  </Pressable>;})}
  {screened&&<><Small>Talk to your doctor or a registered dietitian first: your needs can differ from this general plan.</Small><Toggle label="My doctor or dietitian cleared me" value={d.cleared} onChange={v=>set({cleared:v})}/></>}
  <Notice text={problem}/>
  {!!row&&<Pressable accessibilityRole="button" onPress={del} disabled={busy} style={{alignSelf:'center',paddingVertical:8}}><Text style={{color:colors.muted,fontSize:15}}>Remove this rider</Text></Pressable>}
 </SheetFrame>;
}

// ------------------------------------------------------------------ sweat test
export function SweatTestSheet({visible,account,row,onClose}:{visible:boolean;account:string;row:FuelProfileRow;onClose:()=>void}){
 const {put}=useFuelProfiles(account);
 const youth=isYouth(row.age);
 const [unit,setUnit]=useState<'kg'|'lb'>(row.weight_unit),[pre,setPre]=useState(''),[post,setPost]=useState(''),[minutes,setMinutes]=useState('30'),[drank,setDrank]=useState(''),[urine,setUrine]=useState(''),[hot,setHot]=useState(false);
 const [busy,setBusy]=useState(false),[problem,setProblem]=useState(''),[done,setDone]=useState(false);
 useEffect(()=>{if(visible){setPre('');setPost('');setDrank('');setUrine('');setDone(false);setProblem('');}},[visible]);
 const fl=unit==='lb'?'oz':'mL',toMl=(v:string)=>(Number(v.replace(',','.'))||0)*(unit==='lb'?29.5735:1);
 const result=pre&&post&&minutes?sweatTest({pre:Number(pre.replace(',','.')),post:Number(post.replace(',','.')),unit,minutes:Number(minutes),drankMl:toMl(drank),urineMl:toMl(urine)},{youth}):null;
 async function keep(){if(!result?.ok)return;setBusy(true);setProblem('');try{await put(withSweatRate(row,result.rate_lph,hot,new Date().toISOString()));success();setDone(true);}catch(e){setProblem(errorText(e));}finally{setBusy(false);}}
 return <SheetFrame visible={visible} title="Sweat test" onClose={onClose}>
  <Text style={{color:colors.muted,fontSize:14.5,lineHeight:21}}>On a practice day: weigh {youth?'the rider':'yourself'} in minimal clothing right before riding, ride, dry off, and weigh again on the same scale before drinking or peeing. Note what was drunk while riding.</Text>
  <Wrap><Chip label="lb · oz" on={unit==='lb'} onPress={()=>setUnit('lb')}/><Chip label="kg · mL" on={unit==='kg'} onPress={()=>setUnit('kg')}/></Wrap>
  <View style={{flexDirection:'row',gap:14}}><Num label={`Before (${unit})`} value={pre} onChange={setPre}/><Num label={`After (${unit})`} value={post} onChange={setPost}/></View>
  <View style={{flexDirection:'row',gap:14}}><Num label="Minutes riding" value={minutes} onChange={setMinutes}/><Num label={`Drank (${fl})`} value={drank} onChange={setDrank}/><Num label={`Peed (${fl})`} value={urine} onChange={setUrine}/></View>
  <Toggle label="It was hot or humid" value={hot} onChange={setHot}/>
  <Small>Weights stay on this screen; only the sweat rate is saved.</Small>
  {result&&!result.ok&&<Notice tone="warn" text={result.problem}/>}
  {result?.ok&&<View style={{borderWidth:1,borderColor:'#2f3540',borderRadius:12,padding:12,gap:6}}>
   <Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>{sweatRateText(result.rate_lph,row.moto_minutes??20,youth)}</Text>
   <Text style={{color:colors.muted,fontSize:14}}>{result.replaceText}</Text>
   {result.flags.map(f=><Small key={f}>{f}</Small>)}
  </View>}
  <Notice text={problem}/>
  {done?<Small tone="#9fdcb3">Saved. The plan now uses this sweat rate.</Small>:<Button disabled={busy||!result?.ok} title={busy?'Saving…':'Save sweat rate'} onPress={()=>void keep()}/>}
 </SheetFrame>;
}

// ------------------------------------------------------------------ the gate moved
function GateShiftSheet({visible,input:day,index,now,youth,mealAt,onClose,onApply}:{visible:boolean;input:DayInput;index:number;now:string;youth:boolean;mealAt:string|null;onClose:()=>void;onApply:(input:DayInput,notes:string[])=>void}){
 const g=gatesOf(day)[index];
 const [at,setAt]=useState(''),[ate,setAte]=useState(''),[cascade,setCascade]=useState(true),[problem,setProblem]=useState('');
 useEffect(()=>{if(visible){setAt(g?.at??'');setAte(mealAt&&mealAt<=now?mealAt:'');setProblem('');}},[visible,index]);
 const apply=()=>{const to=parseClock(at),last=ate.trim()?parseClock(ate):null;if(!to){setProblem('Type the new time, like 11:40 or 2:15pm.');return;}if(ate.trim()&&!last){setProblem('Type when you last ate, like 9:30, or leave it empty.');return;}
  const r=shiftGate({...day,gates:gatesOf(day)},index,to,{now,lastAteAt:last,cascade,youth});onApply(r.day,[...r.notes,...r.added.map(a=>a.title)]);};
 return <SheetFrame visible={visible&&!!g} title={`${g?.label??'Gate'} moved`} onClose={onClose}>
  <View style={{gap:2}}><Label>New gate time</Label><TextInput value={at} onChangeText={setAt} placeholder="11:40" placeholderTextColor="#7d8593" keyboardType="numbers-and-punctuation" maxLength={8} returnKeyType="done" style={input}/></View>
  <View style={{gap:2}}><Label>Last ate at (optional)</Label><TextInput value={ate} onChangeText={setAte} placeholder="9:30" placeholderTextColor="#7d8593" keyboardType="numbers-and-punctuation" maxLength={8} returnKeyType="done" style={input}/></View>
  <Toggle label="Move the later gates by the same amount" value={cascade} onChange={setCascade}/>
  <Small>Delayed an hour or more adds a small top-up; moved up soon after eating means sips only; four hours or more away adds a full meal.</Small>
  <Notice text={problem}/>
  <Button title="Update the plan" onPress={apply}/>
 </SheetFrame>;
}
