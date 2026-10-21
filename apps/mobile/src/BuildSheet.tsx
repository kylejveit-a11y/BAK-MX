import React,{useEffect,useMemo,useState} from 'react';
import {Modal,View,Text,ScrollView,TextInput,ActivityIndicator,KeyboardAvoidingView,Platform} from 'react-native';
import {Pressable} from './Touch';
import type {Bike} from '../../../shared/types';
import {partSystems,readInstalled,writeInstalled,partLabel,MAX_PARTS,type InstalledPart,type PartSystem} from '../../../shared/installed-parts';
import {decodeFamily,familyOf,NOTE_HINT,WORK,providersFor,cleanName,pickerChoices,typesWithCounts,choicesOfType,brandsIn,productsOf,type CatalogPart,type FamilyFile,type Work,type Choice,type PartColor} from '../../../shared/parts-picker';
import {fuelSystem,fuelSystemLabel} from '../../../shared/fuel-system';
import {api,apiOrigin} from './api';
import {Button,Card,Copy,Notice,colors,LinkAction,Icon} from './ui';

type Value=ReturnType<typeof readInstalled>;
type Screen={id:'home'}|{id:'type'}|{id:'work';work:Work}|{id:'detail';work:Work;who:string;r?:string}|{id:'brand';type:string|null}|{id:'product';type:string|null;brand:string}|{id:'custom';brand:string;type:string|null}|{id:'color';ip:InstalledPart;colors:PartColor[]};
const families=new Map<string,Promise<FamilyFile|null>>();
/** The public parts list for a bike family, from the same files the website uses. */
function loadFamily(name:string){
 if(!families.has(name))families.set(name,fetch(`${apiOrigin}/parts-catalog/${name}.json`).then(r=>r.ok?r.json() as Promise<FamilyFile>:null).catch(()=>{families.delete(name);return null;}));
 return families.get(name)!;
}
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';

/** Garage build sheet: what is fitted to this bike, section by section. Stock, changed, or not recorded yet. */
export function BuildSheet({bike,onSaved,onAsk}:{bike:Bike;onSaved:(b:Bike)=>void;onAsk?:(text:string)=>void}){
 const value=useMemo(()=>readInstalled(bike.configuration),[bike.configuration]);
 const [catalog,setCatalog]=useState<CatalogPart[]|null|undefined>(undefined),[open,setOpen]=useState<PartSystem|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setCatalog(undefined);const fam=familyOf(bike.manufacturer);
  if(!fam){setCatalog(null);return;}
  loadFamily(fam).then(f=>{if(live)setCatalog(decodeFamily(f,bike.manufacturer,bike.model,bike.model_year));}).catch(()=>{if(live)setCatalog(null);});
  return()=>{live=false;};},[bike.manufacturer,bike.model,bike.model_year]);
 const recorded=new Set([...value.parts.map(p=>p.s),...value.stock]).size;
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
  <Copy>Tap each part of the bike and tell BAK if it’s stock or changed. BAK uses this in every answer.</Copy>
  <View style={{gap:6}}>
   <View style={st.meter}><View style={[st.meterFill,{width:`${Math.round(100*recorded/partSystems.length)}%`}]}/></View>
   <Text style={st.small}><Text style={{color:colors.text,fontWeight:'700'}}>{recorded} of {partSystems.length}</Text> set</Text>
  </View>
  {catalog===null&&<Notice text="We don’t have a parts list for this exact bike yet. You can still add what’s on it and BAK will use it."/>}
  <Notice text={notice}/>
  <View>{partSystems.map(s=>{const parts=value.parts.filter(p=>p.s===s.key),stock=value.stock.includes(s.key);
   return <Pressable key={s.key} accessibilityRole="button" accessibilityLabel={`${s.label}. ${parts.length?`Changed, ${parts.length}`:stock?'Stock':'Not set'}`} onPress={()=>setOpen(s.key)} style={({pressed})=>[st.row,pressed&&{opacity:0.6}]}>
    <View style={{flex:1,gap:3}}><Text style={st.rowTitle}>{s.label}</Text><Text style={st.small} numberOfLines={2}>{parts.length?parts.map(partLabel).join(' · '):s.hint}</Text></View>
    {stock&&!parts.length&&<Icon name="check" size={14} color={colors.accent} weight={2.2}/>}<Text style={[st.state,parts.length?{color:colors.text}:stock?{color:colors.accent}:{color:colors.muted}]}>{parts.length?`Changed · ${parts.length}`:stock?'Stock':'Tap to set'}</Text>
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
 const [note,setNote]=useState(value.notes[system]??''),[query,setQuery]=useState(''),[stack,setStack]=useState<Screen[]>([{id:'home'}]),[custom,setCustom]=useState({b:'',n:'',p:''}),[detail,setDetail]=useState(''),[openNotes,setOpenNotes]=useState<string|null>(null);
 const screen=stack[stack.length-1],push=(s:Screen)=>{setQuery('');setStack([...stack,s]);},back=()=>{setQuery('');setStack(stack.slice(0,-1));};
 const choices=useMemo(()=>pickerChoices(catalog,system,fuel),[catalog,system,fuel]);
 const types=typesWithCounts(choices,system,!!catalog);
 const firstStep=():Screen=>types.length||WORK[system]?{id:'type'}:{id:'brand',type:null};
 const key=(p:{b:string;n:string;p?:string})=>(p.b+'|'+(p.p||p.n)).toLowerCase();
 const pickedKeys=new Set(picked.map(key));
 const add=(p:InstalledPart)=>{if(picked.length+others.length>=MAX_PARTS||pickedKeys.has(key(p))){setStack([{id:'home'}]);return;}setPicked([...picked,p]);setMode('changed');setQuery('');setStack([{id:'home'}]);};
 const notesFor=(p:InstalledPart)=>p.r?choices.find(c=>c.r===p.r):undefined;
 const match=(text:string)=>query.trim().toLowerCase().split(/\s+/).every(w=>text.toLowerCase().includes(w));
 const isWork=(n:string)=>!!WORK[system]?.some(w=>w.label===n);
 function done(){
  const parts=[...others,...(mode==='changed'?picked:[])];
  const stock=value.stock.filter(s=>s!==system).concat(mode==='stock'?[system]:[]);
  const notes={...value.notes};if(note.trim()&&mode!=='unknown')notes[system]=note.trim();else delete notes[system];
  save({parts,stock,notes});
 }
 const title=screen.id==='home'?meta.label:screen.id==='type'?'What did you change?':screen.id==='work'?'Who did it?':screen.id==='detail'?screen.work.label:screen.id==='brand'?'Which brand?':screen.id==='product'?screen.brand:screen.id==='color'?'Which color?':'Add it yourself';
 const sub=screen.id==='home'?meta.hint:screen.id==='brand'?(screen.type??`Any ${meta.label.toLowerCase()} part`):screen.id==='product'?(screen.type??meta.label):screen.id==='color'?cleanName(screen.ip.b,screen.ip.n):screen.id==='type'?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:screen.id==='work'?screen.work.label:screen.id==='detail'?(screen.who||'Who did it not recorded'):'';
 const workList=WORK[system]?<><Section title="WORK DONE"/><Group>{WORK[system]!.map(w=><Row key={w.label} label={w.label} detail={w.kind?'Who did it?':undefined} onPress={()=>push({id:'work',work:w})}/>)}</Group></>:null;
 const search=(placeholder:string)=><TextInput value={query} onChangeText={setQuery} placeholder={placeholder} placeholderTextColor="#6b7380" accessibilityLabel={placeholder} autoCorrect={false} style={st.search}/>;
 return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
  <KeyboardAvoidingView style={{flex:1,backgroundColor:colors.bg}} behavior={Platform.OS==='ios'?'padding':undefined}>
   <View style={st.bar}>
    {stack.length>1?<Pressable accessibilityRole="button" onPress={back} hitSlop={12}><View style={{flexDirection:'row',alignItems:'center',gap:4}}><Icon name="chevronLeft" size={18} color={colors.accent} weight={2.1}/><Text style={st.back}>Back</Text></View></Pressable>:<View/>}
    <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={12} style={st.close}><Icon name="close" size={17} color={colors.text} weight={2}/></Pressable>
   </View>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:40,gap:14}}>
    <Text style={st.title}>{title}</Text>{!!sub&&<Text style={st.sub}>{sub}</Text>}
    {screen.id==='home'&&<>
     <Group>
      <Row label="Stock" small="Factory parts and setup" selected={mode==='stock'} onPress={()=>setMode('stock')}/>
      <Row label="Changed" small="Aftermarket parts or work" selected={mode==='changed'} chev={!picked.length&&mode!=='changed'} onPress={()=>{setMode('changed');if(!picked.length)push(firstStep());}}/>
      <Row label="Not sure" small="BAK won’t assume anything here" selected={mode==='unknown'} onPress={()=>setMode('unknown')}/>
     </Group>
     {mode==='changed'&&<>
      <Section title="ON YOUR BIKE"/>
      <Group>
       {picked.map(p=>{const r=notesFor(p),k=key(p),has=!!(r&&(r.what||r.caution||r.testers.length))||!!p.p;return <View key={k} style={st.fitted}>
        <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
         <View style={{flex:1,gap:2}}><Text style={st.brand}>{p.b||'BRAND NOT SET'}</Text><Text style={st.rowTitle}>{cleanName(p.b,p.n)}</Text>{!!(p.k||p.d)&&<Text style={st.small}>{[p.k,p.d].filter(Boolean).join(' · ')}</Text>}</View>
         <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${partLabel(p)}`} onPress={()=>setPicked(picked.filter(x=>key(x)!==k))} hitSlop={8}><Text style={{color:'#f0a8b0',fontSize:15}}>Remove</Text></Pressable>
        </View>
        {has&&<Pressable accessibilityRole="button" onPress={()=>setOpenNotes(openNotes===k?null:k)} style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={{color:colors.accent,fontSize:14,fontWeight:'600'}}>{r&&(r.what||r.caution)?'What this part changes':'Details'}</Text><Icon name={openNotes===k?'chevronUp':'chevronDown'} size={14} color={colors.accent} weight={2.2}/></Pressable>}
        {openNotes===k&&<View style={{gap:8}}>
         {!!r?.what&&<Note label="WHAT IT CHANGES" text={r.what}/>}{!!r?.caution&&<Note label="HEADS UP" text={r.caution} warn/>}
         {r?.testers.slice(0,1).map(x=><Note key={x} label="TESTERS FOUND" text={x}/>)}{!!p.p&&<Note label="PART NUMBER" text={p.p}/>}
        </View>}
       </View>;})}
       <Row label="Add a part" accent plus onPress={()=>push(firstStep())}/>
      </Group></>}
     {mode!=='unknown'&&<View style={{gap:6}}><Text style={st.small}>Anything else BAK should know? (optional)</Text><TextInput value={note} onChangeText={setNote} multiline maxLength={280} placeholder={NOTE_HINT[system]??'Condition, settings or work done'} placeholderTextColor="#6b7380" style={[st.search,{minHeight:80,textAlignVertical:'top'}]}/></View>}
     <Button disabled={busy||(mode==='changed'&&!picked.length)} title={busy?'Saving…':mode==='changed'&&!picked.length?'Add a part first':'Save'} onPress={done}/>
    </>}
    {screen.id==='type'&&<>
     {system==='tuning'&&workList}
     {system==='tuning'&&fuel&&<Text style={st.small}>Your {bike.model} is {fuelSystemLabel(fuel)}, so {fuel==='injected'?'carburetor and jetting':'fuel-injection'} parts are hidden.</Text>}
     {(types.length>0||system!=='tuning')&&<>{system==='tuning'&&<Section title="PARTS"/>}<Group>
      {types.map(t=><Row key={t.label} label={t.label} detail={t.count?String(t.count):undefined} onPress={()=>push({id:'brand',type:t.label})}/>)}
      <Row label="Something else" onPress={()=>push({id:'brand',type:null})}/>
     </Group></>}
     {system!=='tuning'&&workList}
    </>}
    {screen.id==='work'&&(()=>{const w=screen.work,shops=w.kind?providersFor(w.kind,bike.manufacturer,bike.model):[],go=(who:string,r?:string)=>{setDetail('');push({id:'detail',work:w,who,...(r?{r}:{})});};return <>
     {shops.length>0&&<><Section title={w.kind==='ecu'?'TUNERS':'SUSPENSION SHOPS'}/><Group>{shops.map(p=><Row key={p.id} label={p.brand} small={p.label} onPress={()=>go(p.brand,p.exact?p.id:undefined)}/>)}</Group></>}
     <Group>
      <Row label="Someone else" detail="Type it" onPress={()=>{setCustom({b:'',n:w.label,p:''});push({id:'custom',brand:'',type:w.label});}}/>
      <Row label={w.kind==='ecu'?'My dealer':'My dealer or local shop'} onPress={()=>go(w.kind==='ecu'?'Dealer':'Local shop')}/>
      <Row label="I did it myself" onPress={()=>go('Myself')}/>
      <Row label="Not sure who" onPress={()=>go('')}/>
     </Group></>;})()}
    {screen.id==='detail'&&<View style={{gap:10}}>
     <Text style={st.small}>{screen.work.detail} (optional)</Text>
     <TextInput autoFocus multiline value={detail} onChangeText={setDetail} maxLength={120} placeholder={screen.work.example} placeholderTextColor="#6b7380" style={[st.search,{minHeight:80,textAlignVertical:'top'}]}/>
     <Button title="Add to my bike" onPress={()=>add({s:system,b:screen.who==='Myself'?'':screen.who,n:screen.work.label+(screen.who==='Myself'?' (myself)':''),...(detail.trim()?{d:detail.trim()}:{}),...(screen.r?{r:screen.r}:{x:true})})}/>
    </View>}
    {screen.id==='brand'&&(()=>{const all=brandsIn(choicesOfType(choices,screen.type)),list=all.filter(([b])=>match(b));return <>
     {all.length>8&&search('Search brands')}
     <Group>{list.map(([b,v])=><Row key={b} label={b} detail={String(v.n)} onPress={()=>push({id:'product',type:screen.type,brand:b})}/>)}{!list.length&&<Text style={[st.small,{padding:16}]}>No listed brand matches.</Text>}</Group>
     <Group>
      <Row label="Another brand" detail="Type it" onPress={()=>{setCustom({b:query,n:screen.type??'',p:''});push({id:'custom',brand:query,type:screen.type});}}/>
      {screen.type&&<Row label="I don’t know the brand" detail={`Add as “${screen.type}”`} chev={false} onPress={()=>add({s:system,b:'',n:screen.type!,x:true})}/>}
     </Group></>;})()}
    {screen.id==='color'&&<Group>{screen.colors.map(c=><Row key={c.name} label={c.name} detail={c.finish&&c.finish!=='stock'?c.finish:undefined} chev={false} onPress={()=>add({...screen.ip,k:c.name})}/>)}<Row label="Not sure" detail="Add without a color" chev={false} onPress={()=>add(screen.ip)}/></Group>}
    {screen.id==='product'&&(()=>{const all=productsOf(choicesOfType(choices,screen.type),screen.brand),list=all.filter(c=>match(c.name+' '+c.pn));return <>
     {all.length>8&&search(`Search ${screen.brand}`)}
     <Group>{list.map((c:Choice)=>{const ip:InstalledPart={s:system,b:c.brand,n:c.name,...(c.pn?{p:c.pn}:{}),...(c.r?{r:c.r}:{})},on=pickedKeys.has(key(ip)),cols=c.colors??[];return <Row key={c.name+c.pn} label={c.name} detail={cols.length>1?`${cols.length} colors`:undefined} selected={on} chev={cols.length>1} onPress={()=>cols.length>1&&!on?push({id:'color',ip,colors:cols}):add(cols.length===1?{...ip,k:cols[0].name}:ip)}/>;})}{!list.length&&<Text style={[st.small,{padding:16}]}>Nothing listed matches.</Text>}</Group>
     <Group><Row label="Not listed?" detail="Type it" onPress={()=>{setCustom({b:screen.brand,n:query,p:''});push({id:'custom',brand:screen.brand,type:screen.type});}}/></Group></>;})()}
    {screen.id==='custom'&&<View style={{gap:12}}>
     <Text style={st.small}>{isWork(custom.n)?'Who did the work? (shop or tuner)':'Brand'}</Text>
     <TextInput autoFocus={isWork(custom.n)} value={custom.b} onChangeText={b=>setCustom({...custom,b})} maxLength={60} placeholder={isWork(custom.n)?'e.g. the shop’s name':'e.g. FMF'} placeholderTextColor="#6b7380" style={st.search}/>
     <Text style={st.small}>{isWork(custom.n)?'Work done':'Part'}</Text>
     <TextInput autoFocus={!isWork(custom.n)} value={custom.n} onChangeText={n=>setCustom({...custom,n})} maxLength={90} placeholder="e.g. Factory 4.1 RCT titanium slip-on" placeholderTextColor="#6b7380" style={st.search}/>
     <Text style={st.small}>Part number (optional)</Text>
     <TextInput value={custom.p} onChangeText={p=>setCustom({...custom,p})} maxLength={48} autoCapitalize="characters" style={st.search}/>
     <Button disabled={!custom.n.trim()&&!custom.b.trim()} title="Add to my bike" onPress={()=>add({s:system,b:custom.b.trim(),n:custom.n.trim(),...(custom.p.trim()?{p:custom.p.trim()}:{}),x:true})}/>
    </View>}
    {catalog===undefined&&screen.id!=='home'&&<ActivityIndicator color={colors.accent}/>}
   </ScrollView>
  </KeyboardAvoidingView>
 </Modal>;
}

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
 chev:{color:colors.muted,fontSize:22},
 bar:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'center' as const,paddingHorizontal:20,paddingTop:16,paddingBottom:4},
 back:{color:colors.accent,fontSize:17},
 close:{width:36,height:36,borderRadius:18,borderWidth:1,borderColor:'#2a2f39',alignItems:'center' as const,justifyContent:'center' as const},
 group:{borderTopWidth:1,borderTopColor:colors.line},
 navRow:{flexDirection:'row' as const,alignItems:'center' as const,gap:10,paddingVertical:15,borderBottomWidth:1,borderBottomColor:colors.line,minHeight:54},
 detail:{color:colors.muted,fontSize:15},
 section:{color:colors.muted,fontSize:12,fontWeight:'700' as const,letterSpacing:1.5,marginBottom:-6,marginTop:4},
 fitted:{paddingVertical:16,gap:10,borderBottomWidth:1,borderBottomColor:colors.line},
 brand:{color:colors.muted,fontSize:11,letterSpacing:1,fontWeight:'600' as const},
 note:{borderLeftWidth:2,borderLeftColor:colors.line,paddingLeft:10,gap:2},
 noteLabel:{color:'#8d95a3',fontSize:10,letterSpacing:1.2,fontWeight:'700' as const},
 search:{borderBottomColor:'#2a2f39',borderBottomWidth:1,paddingVertical:11,color:colors.text,fontSize:17},
};
