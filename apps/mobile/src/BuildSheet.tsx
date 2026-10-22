import React,{useEffect,useMemo,useState} from 'react';
import {Modal,View,Text,ScrollView,TextInput,ActivityIndicator,KeyboardAvoidingView,Platform} from 'react-native';
import {Pressable} from './Touch';
import type {Bike} from '../../../shared/types';
import {partSystems,readInstalled,writeInstalled,MAX_PARTS,type InstalledPart,type PartSystem} from '../../../shared/installed-parts';
import {decodeFamily,familyOf,NOTE_HINT,WORK,providersFor,cleanName,canonBrand,pickerChoices,typesWithCounts,choicesOfType,sizesFor,chosenPartNumber,colorsFor,type CatalogPart,type FamilyFile,type Work,type Choice} from '../../../shared/parts-picker';
import {checkBuild,typeOfPart,slotOf,type BuildCheck} from '../../../shared/build-check';
import {fuelSystem,fuelSystemLabel} from '../../../shared/fuel-system';
import {api,apiOrigin} from './api';
import {Button,Card,Copy,Notice,colors,LinkAction,Icon} from './ui';
import {select as hSelect} from './haptics';

type Value=ReturnType<typeof readInstalled>;
type Screen={id:'home'}|{id:'types'}|{id:'options';type:string|null}|{id:'work';work:Work}|{id:'detail';work:Work;who:string;r?:string}|{id:'custom';type:string|null};
const families=new Map<string,Promise<FamilyFile|null>>();
/** The public parts list for a bike family, from the same files the website uses. */
function loadFamily(name:string){
 if(!families.has(name))families.set(name,fetch(`${apiOrigin}/parts-catalog/${name}.json`).then(r=>r.ok?r.json() as Promise<FamilyFile>:null).catch(()=>{families.delete(name);return null;}));
 return families.get(name)!;
}
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const AMBER='#e2bd72';
const keyOf=(p:{b:string;n:string;p?:string;v?:string})=>(p.b+'|'+p.n+'|'+(p.v??'')).toLowerCase();
/** What the part is, in rider words: its type, else its own short name. */
const whatItIs=(p:InstalledPart)=>(typeOfPart(p)??cleanName(p.b,p.n)).replace(/\s*\(.*\)$/,'');
const shortLine=(p:InstalledPart)=>[canonBrand(p.b),cleanName(p.b,p.n)].filter(Boolean).join(' · ');

/** Garage build sheet: what is on this bike, section by section, what the rider keeps off the bike for other conditions, and
 *  anything on the sheet that doesn't add up. */
export function BuildSheet({bike,onSaved,onAsk}:{bike:Bike;onSaved:(b:Bike)=>void;onAsk?:(text:string)=>void}){
 const value=useMemo(()=>readInstalled(bike.configuration),[bike.configuration]);
 const checks=useMemo(()=>checkBuild(bike),[bike]);
 const [catalog,setCatalog]=useState<CatalogPart[]|null|undefined>(undefined),[open,setOpen]=useState<PartSystem|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setCatalog(undefined);const fam=familyOf(bike.manufacturer);
  if(!fam){setCatalog(null);return;}
  loadFamily(fam).then(f=>{if(live)setCatalog(decodeFamily(f,bike.manufacturer,bike.model,bike.model_year));}).catch(()=>{if(live)setCatalog(null);});
  return()=>{live=false;};},[bike.manufacturer,bike.model,bike.model_year]);
 const recorded=new Set([...value.parts.filter(p=>!p.o).map(p=>p.s),...value.stock]).size;
 async function save(next:Value){
  setBusy(true);setNotice('');
  try{const configuration=writeInstalled(bike.configuration??{},next);
   const saved=await api<Bike>(`/api/bikes?id=${bike.id}`,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours,configuration});
   onSaved(saved);setOpen(null);}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 return <Card>
  <Text style={st.eyebrow}>BUILD SHEET</Text>
  <Text style={st.h2}>What’s on your {bike.model}?</Text>
  <Copy>Tap a section and pick what’s fitted. Keep spare parts too (a second suspension set, sand tires) and mark them on or off the bike.</Copy>
  <View style={{gap:6}}>
   <View style={st.meter}><View style={[st.meterFill,{width:`${Math.round(100*recorded/partSystems.length)}%`}]}/></View>
   <Text style={st.small}><Text style={{color:colors.text,fontWeight:'700'}}>{recorded} of {partSystems.length}</Text> sections set</Text>
  </View>
  {checks.length>0&&<View style={{gap:10,paddingVertical:4}}>
   <Text style={[st.section,{color:AMBER,marginBottom:0}]}>{checks.length===1?'1 THING TO CHECK':`${checks.length} THINGS TO CHECK`}</Text>
   {checks.map((c,i)=><Pressable key={i} accessibilityRole="button" onPress={()=>setOpen(c.parts[0]?.s??null)}><Warn text={c.text}/></Pressable>)}
  </View>}
  {catalog===null&&<Notice text="There’s no parts list for this exact bike yet. You can still add what’s on it and BAK will use it."/>}
  <Notice text={notice}/>
  <View>{partSystems.map(s=>{const parts=value.parts.filter(p=>p.s===s.key),on=parts.filter(p=>!p.o),off=parts.length-on.length,stock=value.stock.includes(s.key),flagged=checks.some(c=>c.parts.some(p=>p.s===s.key));
   const line=on.length?on.map(p=>`${whatItIs(p)}${p.b?` (${canonBrand(p.b)})`:''}`).join(' · '):stock?'Stock':s.hint;
   return <Pressable key={s.key} accessibilityRole="button" accessibilityLabel={`${s.label}. ${on.length?`${on.length} on the bike`:stock?'Stock':'Not set'}${off?`, ${off} off the bike`:''}`} onPress={()=>setOpen(s.key)} style={({pressed})=>[st.row,pressed&&{opacity:0.6}]}>
    <View style={{flex:1,gap:3}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={st.rowTitle}>{s.label}</Text>{flagged&&<View style={st.dot}/>}</View>
     <Text style={st.small} numberOfLines={2}>{line}</Text>
     {off>0&&<Text style={[st.small,{color:'#8891a0'}]}>{off} off the bike</Text>}
    </View>
    {stock&&!on.length&&<Icon name="check" size={14} color={colors.accent} weight={2.2}/>}
    <Text style={[st.state,on.length?{color:colors.text}:stock?{color:colors.accent}:{color:colors.muted}]}>{on.length?String(on.length):stock?'Stock':'Set'}</Text>
    <Icon name="chevronRight" size={16} color="#6b7280"/>
   </Pressable>;})}</View>
  {value.parts.length>0&&onAsk&&<LinkAction title="Ask BAK about this build" onPress={()=>onAsk('I\'ve recorded my aftermarket parts in the Garage. Anything I should check or set up differently because of what\'s fitted?')}/>}
  {open&&<SystemSheet key={open} system={open} bike={bike} value={value} catalog={catalog??null} busy={busy} close={()=>setOpen(null)} save={next=>void save(next)}/>}
 </Card>;
}

function SystemSheet({system,bike,value,catalog,busy,close,save}:{system:PartSystem;bike:Bike;value:Value;catalog:CatalogPart[]|null;busy:boolean;close:()=>void;save:(v:Value)=>void}){
 const meta=partSystems.find(s=>s.key===system)!,fuel=fuelSystem(bike.manufacturer,bike.model,bike.model_year);
 const others=value.parts.filter(p=>p.s!==system);
 const [mode,setMode]=useState<'stock'|'changed'|'unknown'>(value.parts.some(p=>p.s===system)?'changed':value.stock.includes(system)?'stock':'unknown');
 const [picked,setPicked]=useState<InstalledPart[]>(value.parts.filter(p=>p.s===system));
 const [note,setNote]=useState(value.notes[system]??''),[stack,setStack]=useState<Screen[]>([{id:'home'}]),[flash,setFlash]=useState('');
 const screen=stack[stack.length-1],push=(s:Screen)=>setStack([...stack,s]),back=()=>setStack(stack.slice(0,-1)),home=()=>setStack([{id:'home'}]);
 const choices=useMemo(()=>pickerChoices(catalog,system,fuel,bike.model),[catalog,system,fuel,bike.model]);
 const types=typesWithCounts(choices,system,!!catalog);
 const draft=useMemo(()=>writeInstalled(bike.configuration??{},{parts:[...others,...picked],stock:value.stock,notes:value.notes}),[bike.configuration,others,picked,value]);
 const checks=useMemo(()=>checkBuild({...bike,configuration:draft}).filter(c=>c.parts.some(p=>p.s===system)),[bike,draft,system]);
 /** Put parts on the bike: one per slot, so a new shock moves the old one off the bike. */
 function addParts(add:InstalledPart[]){
  let next=[...picked];const moved:string[]=[];
  const same=(x:InstalledPart,p:InstalledPart)=>canonBrand(x.b).toLowerCase()===canonBrand(p.b).toLowerCase()&&cleanName(x.b,x.n).toLowerCase()===cleanName(p.b,p.n).toLowerCase();
  for(const p of add){if(next.length+others.length>=MAX_PARTS)break;if(next.some(x=>keyOf(x)===keyOf(p)))continue;
   // the same product picked again with its size is a correction, not a second part
   if(p.v)next=next.filter(x=>!(same(x,p)&&!x.v));
   const slot=slotOf(p);
   if(slot&&!p.o){const clash=next.filter(x=>!x.o&&slotOf(x)===slot);if(clash.length){
    // picked together: the first one goes on, the rest are spares; a later pick replaces what was on
    if(add.indexOf(p)>0&&add.slice(0,add.indexOf(p)).some(x=>slotOf(x)===slot))p.o=true;
    else{next=next.map(x=>clash.includes(x)?{...x,o:true}:x);moved.push(...clash.map(whatItIs));}}}
   next.push(p);}
  setPicked(next);setMode('changed');home();
  setFlash(moved.length?`Moved the old ${[...new Set(moved)].join(', ').toLowerCase()} off the bike. Switch it back any time.`:'');
 }
 function toggle(p:InstalledPart){hSelect();const k=keyOf(p),slot=slotOf(p),goingOn=!!p.o;
  setPicked(picked.map(x=>keyOf(x)===k?{...x,o:goingOn?undefined:true}:goingOn&&slot&&!x.o&&slotOf(x)===slot?{...x,o:true}:x));setFlash('');}
 function done(){
  const parts=[...others,...(mode==='changed'?picked:[])];
  const stock=value.stock.filter(s=>s!==system).concat(mode==='stock'?[system]:[]);
  const notes={...value.notes};if(note.trim()&&mode!=='unknown')notes[system]=note.trim();else delete notes[system];
  save({parts,stock,notes});
 }
 const on=picked.filter(p=>!p.o),off=picked.filter(p=>p.o);
 const isWork=(p:InstalledPart)=>!!WORK[system]?.some(w=>p.n.startsWith(w.label));
 const partRow=(p:InstalledPart,inRail=true)=><PartRow inRail={inRail} key={keyOf(p)} part={p} choice={p.r?choices.find(c=>c.r===p.r):undefined} flagged={!p.o&&checks.some(c=>c.parts.some(x=>keyOf(x)===keyOf(p)))} onToggle={()=>toggle(p)} onRemove={()=>setPicked(picked.filter(x=>keyOf(x)!==keyOf(p)))} onColor={k=>setPicked(picked.map(x=>keyOf(x)===keyOf(p)?{...x,k}:x))}/>;
 const title=screen.id==='home'?meta.label:screen.id==='types'?'What kind of part?':screen.id==='options'?(screen.type??'Other parts'):screen.id==='work'?'Who did it?':screen.id==='detail'?screen.work.label:'Add it yourself';
 const sub=screen.id==='home'?meta.hint:screen.id==='types'||screen.id==='options'?`Listed for the ${bike.model_year} ${bike.manufacturer} ${bike.model}`:screen.id==='work'?screen.work.label:screen.id==='detail'?(screen.who||'Who did it not recorded'):'';
 return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
  <KeyboardAvoidingView style={{flex:1,backgroundColor:colors.bg}} behavior={Platform.OS==='ios'?'padding':undefined}>
   <View style={st.bar}>
    {stack.length>1?<Pressable accessibilityRole="button" onPress={back} hitSlop={12}><View style={{flexDirection:'row',alignItems:'center',gap:4}}><Icon name="chevronLeft" size={18} color={colors.accent} weight={2.1}/><Text style={st.back}>Back</Text></View></Pressable>:<View/>}
    <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={12} style={st.close}><Icon name="close" size={17} color={colors.text} weight={2}/></Pressable>
   </View>
   {screen.id==='options'
    ?<Options key={String(screen.type)} type={screen.type} system={system} choices={choicesOfType(choices,screen.type)} have={picked} onAdd={addParts} onCustom={()=>push({id:'custom',type:screen.type})}/>
    :<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:40,gap:14}}>
    <Text style={st.title}>{title}</Text>{!!sub&&<Text style={st.sub}>{sub}</Text>}
    {screen.id==='home'&&<>
     <View style={st.segment}>{(['stock','changed','unknown'] as const).map(m=><Pressable key={m} haptic="select" accessibilityRole="button" accessibilityState={{selected:mode===m}} onPress={()=>setMode(m)} style={[st.segBtn,mode===m&&st.segOn]}><Text style={[st.segText,mode===m&&{color:colors.text,fontWeight:'800'}]}>{m==='stock'?'Stock':m==='changed'?'Changed':'Not sure'}</Text></Pressable>)}</View>
     <Text style={st.small}>{mode==='stock'?'Factory parts and setup. BAK uses the stock specs here.':mode==='unknown'?'BAK won’t assume anything about this section.':'Tap a part to pick what’s fitted. What’s set shows under it.'}</Text>
     {!!flash&&<Notice text={flash}/>}
     {mode==='changed'&&checks.map((c,i)=><Warn key={i} text={c.text}/>)}
     {mode!=='stock'&&mode!=='unknown'||picked.length?<>
      {system==='tuning'&&fuel&&<Text style={st.small}>Your {bike.model} is {fuelSystemLabel(fuel)}, so {fuel==='injected'?'carburetor and jetting':'fuel-injection'} parts are hidden.</Text>}
      <Group>
       {types.map(t=><TypeRow key={t.label} label={t.label} small={t.count?`${t.count} listed for your bike`:'Add your own'} onPress={()=>t.count?push({id:'options',type:t.label}):push({id:'custom',type:t.label})}>
        {on.filter(p=>!isWork(p)&&typeOfPart(p)===t.label).map(p=>partRow(p))}</TypeRow>)}
       <TypeRow label="Something else" small={catalog?'Everything else listed for your bike':'Add your own'} onPress={()=>catalog?push({id:'options',type:null}):push({id:'custom',type:null})}>
        {on.filter(p=>!isWork(p)&&!types.some(t=>t.label===typeOfPart(p))).map(p=>partRow(p))}</TypeRow>
      </Group>
      {WORK[system]&&<><Section title="WORK DONE"/><Group>{WORK[system]!.map(w=><TypeRow key={w.label} label={w.label} small={w.detail} onPress={()=>push({id:'work',work:w})}>{on.filter(p=>p.n.startsWith(w.label)).map(p=>partRow(p))}</TypeRow>)}</Group></>}
      {catalog===undefined&&<ActivityIndicator color={colors.accent}/>}
      {off.length>0&&<><Section title={`OFF THE BIKE · ${off.length}`}/><Text style={[st.small,{marginTop:-6}]}>Parts you own and swap on for other conditions. BAK answers for what’s on the bike.</Text>
       <Group>{off.map(p=>partRow(p,false))}</Group></>}
     </>:null}
     {mode!=='unknown'&&<View style={{gap:6}}><Text style={st.small}>Anything else BAK should know? (optional)</Text><TextInput value={note} onChangeText={setNote} multiline maxLength={280} placeholder={NOTE_HINT[system]??'Condition, settings or work done'} placeholderTextColor="#6b7380" style={[st.input,{minHeight:80,textAlignVertical:'top'}]}/></View>}
     <Button disabled={busy||(mode==='changed'&&!picked.length)} title={busy?'Saving…':mode==='changed'&&!picked.length?'Pick a part first':'Save'} onPress={done}/>
    </>}
    {screen.id==='work'&&(()=>{const w=screen.work,shops=w.kind?providersFor(w.kind,bike.manufacturer,bike.model):[],go=(who:string,r?:string)=>push({id:'detail',work:w,who,...(r?{r}:{})});return <>
     {shops.length>0&&<><Section title={w.kind==='ecu'?'TUNERS':'SUSPENSION SHOPS'}/><Group>{shops.map(p=><Row key={p.id} label={p.brand} small={p.label} onPress={()=>go(p.brand,p.exact?p.id:undefined)}/>)}</Group></>}
     <Group>
      <Row label={w.kind==='ecu'?'My dealer':'My dealer or local shop'} onPress={()=>go(w.kind==='ecu'?'Dealer':'Local shop')}/>
      <Row label="I did it myself" onPress={()=>go('Myself')}/>
      <Row label="Not sure who" onPress={()=>go('')}/>
     </Group></>;})()}
    {screen.id==='detail'&&<WorkDetail work={screen.work} onAdd={d=>addParts([{s:system,b:screen.who==='Myself'?'':screen.who,n:screen.work.label+(screen.who==='Myself'?' (myself)':''),...(d?{d}:{}),...(screen.r?{r:screen.r}:{x:true})}])}/>}
    {screen.id==='custom'&&<Custom system={system} type={screen.type} onAdd={p=>addParts([p])}/>}
   </ScrollView>}
  </KeyboardAvoidingView>
 </Modal>;
}

/** A fitted part: what it is in plain words, who makes it, on or off the bike, and its details on tap. */
function PartRow({part,choice,flagged,onToggle,onRemove,onColor,inRail=false}:{part:InstalledPart;choice?:Choice;flagged:boolean;onToggle:()=>void;onRemove:()=>void;onColor:(k:string)=>void;inRail?:boolean}){
 const palette=colorsFor(choice??{},typeOfPart(part));
 const [open,setOpen]=useState(false);
 const extra=[part.v,part.k,part.d].filter(Boolean).join(' · ');
 return <View style={[st.fitted,part.o&&{opacity:0.72}]}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
   <Pressable accessibilityRole="button" accessibilityLabel={`${whatItIs(part)}, ${shortLine(part)}. Details`} onPress={()=>setOpen(!open)} style={{flex:1,gap:2}}>
    {inRail?<><Text style={st.brand}>{canonBrand(part.b).toUpperCase()||'BRAND NOT SET'}</Text><View style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={st.rowTitle} numberOfLines={2}>{cleanName(part.b,part.n)}</Text>{flagged&&<View style={st.dot}/>}</View></>
    :<><View style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={st.rowTitle}>{whatItIs(part)}</Text>{flagged&&<View style={st.dot}/>}</View>
    <Text style={st.small} numberOfLines={2}>{shortLine(part)}</Text></>}
    {!!extra&&<Text style={[st.small,{color:'#c3c9d3'}]}>{extra}</Text>}
   </Pressable>
   <OnOff on={!part.o} onPress={onToggle}/>
  </View>
  <Pressable accessibilityRole="button" onPress={()=>setOpen(!open)} style={{flexDirection:'row',alignItems:'center',gap:4}} hitSlop={6}><Text style={{color:colors.accent,fontSize:13.5,fontWeight:'600'}}>Details</Text><Icon name={open?'chevronUp':'chevronDown'} size={13} color={colors.accent} weight={2.2}/></Pressable>
  {open&&<View style={{gap:8}}>
   <Note label="PART" text={[canonBrand(part.b),part.n].filter(Boolean).join(' ')}/>
   {palette.length>0&&<Chips label="Color" options={palette.map(x=>x.name)} value={part.k} onPick={onColor} indent={0}/>}
   <Note label="PART NUMBER" text={part.p||(part.x?'Not entered':'Not saved. The listing covers several sizes or colors.')}/>
   {!!choice?.what&&<Note label="WHAT IT CHANGES" text={choice.what}/>}
   {!!choice?.caution&&<Note label="HEADS UP" text={choice.caution} warn/>}
   {choice?.testers.slice(0,1).map(t=><Note key={t} label="RIDERS FOUND" text={t}/>)}
   {part.x&&<Note label="SOURCE" text="Added by you, not from the parts list"/>}
   <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}><Text style={{color:'#f0a8b0',fontSize:14.5,fontWeight:'600'}}>Remove from my bike</Text></Pressable>
  </View>}
 </View>;
}
function OnOff({on,onPress}:{on:boolean;onPress:()=>void}){
 return <Pressable accessibilityRole="switch" accessibilityState={{checked:on}} accessibilityLabel={on?'On the bike':'Off the bike'} onPress={onPress} hitSlop={6} style={st.onoff}>
  <View style={[st.onoffSeg,on&&{backgroundColor:colors.primary}]}><Text style={[st.onoffText,on&&{color:'#fff'}]}>On</Text></View>
  <View style={[st.onoffSeg,!on&&{backgroundColor:'#3a404b'}]}><Text style={[st.onoffText,!on&&{color:'#fff'}]}>Off</Text></View>
 </Pressable>;
}

/** Parts listed for this bike for one kind of part: pick several, choose size or color on the row, details on demand. */
function Options({type,system,choices,have,onAdd,onCustom}:{type:string|null;system:PartSystem;choices:Choice[];have:InstalledPart[];onAdd:(p:InstalledPart[])=>void;onCustom:()=>void}){
 const [query,setQuery]=useState(''),[all,setAll]=useState(false),[sel,setSel]=useState<Record<string,{size?:string;color?:string}>>({}),[info,setInfo]=useState<string|null>(null);
 const sizes=sizesFor(type);
 const id=(c:Choice)=>(c.brand+'|'+c.name).toLowerCase();
 const sorted=useMemo(()=>{const pop=new Map<string,number>();for(const c of choices)pop.set(c.brand,(pop.get(c.brand)??0)+1);
  return [...choices].sort((a,b)=>Number(!!b.r)-Number(!!a.r)||Number(b.verified)-Number(a.verified)||(pop.get(b.brand)??0)-(pop.get(a.brand)??0)||a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));},[choices]);
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const list=sorted.filter(c=>words.every(w=>(c.brand+' '+c.name+' '+c.pns.join(' ')).toLowerCase().includes(w)));
 const shown=all||words.length?list:list.slice(0,15);
 const haveKeys=new Set(have.map(p=>(canonBrand(p.b)+'|'+cleanName(p.b,p.n)).toLowerCase()));
 const chosen=sorted.filter(c=>sel[id(c)]);
 const missing=chosen.filter(c=>sizes&&!sel[id(c)].size);
 function add(){onAdd(chosen.map(c=>{const s=sel[id(c)],pn=chosenPartNumber(c,s.size);return {s:system,b:c.brand,n:c.name,...(pn?{p:pn}:{}),...(c.r?{r:c.r}:{}),...(s.size?{v:s.size}:{}),...(s.color?{k:s.color}:{})};}));}
 return <View style={{flex:1}}>
  <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:120,gap:14}}>
   <Text style={st.title}>{type??'Other parts'}</Text>
   <Text style={st.sub}>{choices.length} listed for your bike · pick one or more</Text>
   {choices.length>8&&<View style={st.searchBox}><Icon name="search" size={16} color="#8b93a1"/><TextInput value={query} onChangeText={setQuery} placeholder="Search brand or name" placeholderTextColor="#6b7380" autoCorrect={false} accessibilityLabel="Search parts" style={{flex:1,color:colors.text,fontSize:16,paddingVertical:10}}/></View>}
   <Group>{shown.map(c=>{const k=id(c),s=sel[k],on=!!s,fitted=haveKeys.has(k),cols=colorsFor(c,type??c.type);
    return <View key={k} style={st.option}>
     <Pressable accessibilityRole="checkbox" accessibilityState={{checked:on}} accessibilityLabel={`${c.brand} ${c.name}`} onPress={()=>{hSelect();const n={...sel};if(on)delete n[k];else n[k]={...(cols.length===1?{color:cols[0].name}:{})};setSel(n);}} style={({pressed})=>[{flexDirection:'row',alignItems:'center',gap:12},pressed&&{opacity:0.6}]}>
      <Icon name={on?'checkboxOn':'checkbox'} size={22} color={on?colors.accent:'#6b7280'}/>
      <View style={{flex:1,gap:2}}>
       <Text style={st.brand}>{c.brand.toUpperCase()}</Text>
       <Text style={st.rowTitle} numberOfLines={2}>{c.name}</Text>
       <Text style={[st.small,{fontSize:12}]}>{[c.verified?'Maker lists your bike':'Listed for your bike',c.testers.length?'Rider tested':'',fitted?'On your sheet':'',(c.colors?.length??0)>1?`${c.colors!.length} colors`:''].filter(Boolean).join(' · ')}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Details" hitSlop={10} onPress={()=>setInfo(info===k?null:k)}><Icon name={info===k?'chevronUp':'chevronDown'} size={16} color="#8b93a1"/></Pressable>
     </Pressable>
     {on&&sizes&&<Chips label={`${sizes.label}${s.size?'':' (pick one)'}`} options={sizes.options} value={s.size} onPick={v=>setSel({...sel,[k]:{...s,size:v}})}/>}
     {on&&cols.length>1&&<Chips label="Color" options={cols.map(x=>x.name)} value={s.color} onPick={v=>setSel({...sel,[k]:{...s,color:v}})}/>}
     {info===k&&<View style={{gap:8,paddingLeft:34}}>
      {!!c.what&&<Note label="WHAT IT CHANGES" text={c.what}/>}
      {!!c.caution&&<Note label="HEADS UP" text={c.caution} warn/>}
      {c.testers.slice(0,1).map(t=><Note key={t} label="RIDERS FOUND" text={t}/>)}
      <Note label={c.pns.length>1?'PART NUMBERS (BY SIZE OR COLOR)':'PART NUMBER'} text={c.pns.length?c.pns.slice(0,8).join(', ')+(c.pns.length>8?` +${c.pns.length-8} more`:''):'Not listed'}/>
     </View>}
    </View>;})}
    {!list.length&&<Text style={[st.small,{paddingVertical:16}]}>Nothing listed matches.</Text>}
    {!all&&!words.length&&list.length>shown.length&&<Row label={`Show all ${list.length}`} onPress={()=>setAll(true)}/>}
   </Group>
   <Group><Row label="Not listed?" small="Add it yourself" onPress={onCustom}/></Group>
  </ScrollView>
  {chosen.length>0&&<View style={st.footer}>
   {missing.length>0&&<Text style={[st.small,{color:AMBER,textAlign:'center'}]}>Pick the {sizes?.label.toLowerCase()} for {missing.length===1?missing[0].name:`${missing.length} parts`}</Text>}
   <Button disabled={missing.length>0} title={chosen.length===1?'Add to my bike':`Add ${chosen.length} parts`} onPress={add}/>
  </View>}
 </View>;
}
function Chips({label,options,value,onPick,indent=34}:{label:string;options:string[];value?:string;onPick:(v:string)=>void;indent?:number}){
 return <View style={{gap:6,paddingLeft:indent}}><Text style={st.noteLabel}>{label.toUpperCase()}</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6}}>{options.map(o=><Pressable key={o} haptic="select" accessibilityRole="button" accessibilityState={{selected:value===o}} onPress={()=>onPick(o)} style={[st.chip,value===o&&{backgroundColor:colors.primary,borderColor:colors.primary}]}><Text style={{color:value===o?'#fff':colors.text,fontSize:14,fontWeight:value===o?'700':'500'}}>{o}</Text></Pressable>)}</ScrollView>
 </View>;
}
function WorkDetail({work,onAdd}:{work:Work;onAdd:(detail:string)=>void}){const [d,setD]=useState('');
 return <View style={{gap:10}}><Text style={st.small}>{work.detail} (optional)</Text>
  <TextInput autoFocus multiline value={d} onChangeText={setD} maxLength={120} placeholder={work.example} placeholderTextColor="#6b7380" style={[st.input,{minHeight:80,textAlignVertical:'top'}]}/>
  <Button title="Add to my bike" onPress={()=>onAdd(d.trim())}/></View>;}
function Custom({system,type,onAdd}:{system:PartSystem;type:string|null;onAdd:(p:InstalledPart)=>void}){
 const [b,setB]=useState(''),[n,setN]=useState(type??''),[p,setP]=useState('');const sizes=sizesFor(type),[v,setV]=useState<string|undefined>(),[k,setK]=useState<string|undefined>();
 return <View style={{gap:12}}>
  <Text style={st.small}>What is it?</Text><TextInput autoFocus value={n} onChangeText={setN} maxLength={90} placeholder="e.g. Rear shock, slip-on muffler, bar mounts" placeholderTextColor="#6b7380" style={st.input}/>
  <Text style={st.small}>Brand</Text><TextInput value={b} onChangeText={setB} maxLength={60} placeholder="e.g. Öhlins" placeholderTextColor="#6b7380" style={st.input}/>
  {sizes&&<Chips label={sizes.label} options={sizes.options} value={v} onPick={setV}/>}
  {colorsFor({},type).length>0&&<Chips label="Color (optional)" options={colorsFor({},type).map(x=>x.name)} value={k} onPick={setK}/>}
  <Text style={st.small}>Part number (optional)</Text><TextInput value={p} onChangeText={setP} maxLength={48} autoCapitalize="characters" style={st.input}/>
  <Button disabled={!n.trim()&&!b.trim()} title="Add to my bike" onPress={()=>onAdd({s:system,b:b.trim(),n:n.trim()||type||'',...(p.trim()?{p:p.trim()}:{}),...(v?{v}:{}),...(k?{k}:{}),x:true})}/>
 </View>;
}

/** A kind of part in a section: tap to pick from what's listed; what's already set sits under it, marked with the accent rail. */
function TypeRow({label,small,onPress,children}:{label:string;small?:string;onPress:()=>void;children?:React.ReactNode}){
 const set=React.Children.toArray(children).length>0,name=label.replace(/\s*\((.*)\)$/,''),paren=label.match(/\((.*)\)$/)?.[1];
 return <View style={st.typeBlock}>
  <Pressable accessibilityRole="button" accessibilityLabel={`${name}. ${set?'Set':small??''}`} onPress={onPress} style={({pressed})=>[{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:14},pressed&&{opacity:0.55}]}>
   <View style={{flex:1,gap:2}}><Text style={[st.rowTitle,set&&{color:colors.text,fontWeight:'800'}]}>{name}</Text>{!set&&<Text style={st.small}>{paren?paren.charAt(0).toUpperCase()+paren.slice(1)+' · ':''}{small}</Text>}</View>
   {set?<Text style={{color:colors.accent,fontSize:14,fontWeight:'700'}}>Change</Text>:<Icon name="plus" size={18} color={colors.accent} weight={2}/>}
  </Pressable>
  {set&&<View style={st.setRail}>{children}</View>}
 </View>;
}
function Warn({text}:{text:string}){return <View style={{flexDirection:'row',gap:10,alignItems:'flex-start'}}><View style={{width:3,height:16,marginTop:3,borderRadius:1,backgroundColor:AMBER,transform:[{skewX:'-18deg'}]}}/><Text style={{color:'#efe1c2',fontSize:14,lineHeight:20,flex:1}}>{text}</Text></View>;}
function Group({children}:{children:React.ReactNode}){return <View style={st.group}>{children}</View>;}
function Section({title}:{title:string}){return <Text style={st.section}>{title}</Text>;}
function Note({label,text,warn=false}:{label:string;text:string;warn?:boolean}){return <View style={[st.note,warn&&{borderLeftColor:'#d8b46a'}]}><Text style={st.noteLabel}>{label}</Text><Text style={[st.small,warn&&{color:'#e3d2ad'}]}>{text}</Text></View>;}
function Row({label,small,detail,onPress,selected=false,chev=true,accent=false,plus=false}:{label:string;small?:string;detail?:string;onPress:()=>void;selected?:boolean;chev?:boolean;accent?:boolean;plus?:boolean}){
 return <Pressable accessibilityRole="button" accessibilityState={{selected}} accessibilityLabel={[label,small,detail].filter(Boolean).join('. ')} onPress={onPress} style={({pressed})=>[st.navRow,pressed&&{opacity:0.55}]}>{plus&&<Icon name="plus" size={18} color={colors.accent} weight={2}/>}
  <View style={{flex:1,gap:2}}><Text style={[st.rowTitle,accent&&{color:colors.accent}]}>{label}</Text>{!!small&&<Text style={st.small}>{small}</Text>}</View>
  {!!detail&&<Text style={st.detail}>{detail}</Text>}
  {selected?<Icon name="check" size={18} color={colors.accent} weight={2.2}/>:chev&&!plus?<Icon name="chevronRight" size={16} color="#6b7280"/>:null}
 </Pressable>;
}
const st={
 eyebrow:{color:'#868e9b',fontWeight:'600' as const,letterSpacing:1,fontSize:11.5},
 h2:{color:colors.text,fontSize:22,fontWeight:'800' as const,letterSpacing:-0.5},
 title:{color:colors.text,fontSize:30,fontWeight:'900' as const,fontStyle:'italic' as const,letterSpacing:-1},
 sub:{color:colors.muted,fontSize:15,marginTop:-6},
 small:{color:colors.muted,fontSize:13,lineHeight:19},
 meter:{height:4,borderRadius:2,backgroundColor:colors.line,overflow:'hidden' as const},
 meterFill:{height:6,backgroundColor:colors.primary},
 row:{flexDirection:'row' as const,alignItems:'center' as const,gap:12,paddingVertical:14,borderBottomWidth:1,borderBottomColor:colors.line},
 rowTitle:{color:colors.text,fontSize:16,fontWeight:'600' as const},
 state:{fontSize:13,fontWeight:'600' as const},
 dot:{width:7,height:7,borderRadius:4,backgroundColor:AMBER},
 bar:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'center' as const,paddingHorizontal:20,paddingTop:16,paddingBottom:4},
 back:{color:colors.accent,fontSize:17},
 close:{width:36,height:36,borderRadius:18,borderWidth:1,borderColor:'#2a2f39',alignItems:'center' as const,justifyContent:'center' as const},
 group:{borderTopWidth:1,borderTopColor:colors.line},
 navRow:{flexDirection:'row' as const,alignItems:'center' as const,gap:10,paddingVertical:15,borderBottomWidth:1,borderBottomColor:colors.line,minHeight:54},
 detail:{color:colors.muted,fontSize:15},
 section:{color:colors.muted,fontSize:12,fontWeight:'700' as const,letterSpacing:1.5,marginBottom:-6,marginTop:4},
 fitted:{paddingVertical:14,gap:8,borderBottomWidth:1,borderBottomColor:colors.line},
 typeBlock:{borderBottomWidth:1,borderBottomColor:colors.line},
 setRail:{borderLeftWidth:2,borderBottomWidth:0,borderLeftColor:colors.accent,paddingLeft:14,marginBottom:10,backgroundColor:'rgba(106,164,255,0.05)',borderRadius:4},
 option:{paddingVertical:14,gap:10,borderBottomWidth:1,borderBottomColor:colors.line},
 brand:{color:colors.muted,fontSize:11,letterSpacing:1,fontWeight:'700' as const},
 note:{borderLeftWidth:2,borderLeftColor:colors.line,paddingLeft:10,gap:2},
 noteLabel:{color:'#8d95a3',fontSize:10,letterSpacing:1.2,fontWeight:'700' as const},
 input:{borderBottomColor:'#2a2f39',borderBottomWidth:1,paddingVertical:11,color:colors.text,fontSize:17},
 searchBox:{flexDirection:'row' as const,alignItems:'center' as const,gap:8,borderWidth:1,borderColor:'#2f3540',borderRadius:22,paddingHorizontal:14},
 segment:{flexDirection:'row' as const,borderWidth:1,borderColor:'#2f3540',borderRadius:22,padding:3},
 segBtn:{flex:1,alignItems:'center' as const,paddingVertical:9,borderRadius:18},
 segOn:{backgroundColor:'#1f242d'},
 segText:{color:'#a1a8b4',fontSize:14.5,fontWeight:'600' as const},
 onoff:{flexDirection:'row' as const,borderWidth:1,borderColor:'#343a45',borderRadius:16,padding:2,gap:2},
 onoffSeg:{paddingHorizontal:11,paddingVertical:5,borderRadius:13},
 onoffText:{color:'#8b93a1',fontSize:13,fontWeight:'700' as const},
 chip:{paddingHorizontal:13,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:'#343a45'},
 footer:{position:'absolute' as const,left:0,right:0,bottom:0,padding:16,paddingBottom:30,gap:8,backgroundColor:'rgba(6,6,9,0.96)',borderTopWidth:1,borderTopColor:colors.line},
};
