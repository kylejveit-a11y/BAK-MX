// Find a part: the rider opens it on purpose. Parts on file for this exact bike (factory list and aftermarket list),
// where to buy each, and a saved parts list. Also the one quiet line under an Ask BAK answer that opens it.
// Rules (Kyle): never push sales, nothing shown that is not on file for the bike, no prices BAK cannot stand behind.
import {useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Linking,Text,TextInput,View} from 'react-native';
import {api} from './api';
import {Button,Card,colors,Copy,Field,LinkAction,Notice,Switch} from './ui';
import {tint,DISPLAY} from './theme';
import {Icon} from './Icon';
import {partSystems} from '../../../shared/installed-parts';
import {Pressable} from './Touch';
import {copyText} from './copy';
import type {Bike} from '../../../shared/types';
import type {FoundPart,StoreLink} from '../../../shared/parts-hunter';

type Found={query:string;system?:string;types?:{label:string;count:number}[];factory:FoundPart[];aftermarket:FoundPart[];has_factory_list:boolean;has_aftermarket_list:boolean};
type Saved={id:string;kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;stores:StoreLink[]};
const QUICK=['Brake pads','Chain','Sprocket','Air filter','Fork seals','Clutch plates','Spark plug','Wheel bearings','Grips','Levers'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const keyOf=(p:{kind:string;brand:string;name:string;part_number:string})=>`${p.kind}|${p.brand}|${p.name}|${p.part_number}`.toLowerCase();

// The Ask BAK line hands its search to this screen.
let pending='';const waiting=new Set<(q:string)=>void>();
export function openFindPart(query:string,go:()=>void){pending=query;go();waiting.forEach(f=>f(query));}

const SOFT='#9aa2ae',EDGE='#2a2f39',TILE='#12151b';
/** Two or three letters that stand for the brand, so a list can be scanned by eye before any photos exist. */
const monogram=(brand:string)=>{const words=brand.replace(/[^A-Za-z0-9 ]/g,' ').trim().split(/\s+/).filter(Boolean);if(!words.length)return '?';return (words.length===1?words[0].slice(0,3):words.slice(0,3).map(w=>w[0]).join('')).toUpperCase();};
const tidy=(name:string)=>name===name.toUpperCase()&&/[A-Z]/.test(name)?name.toLowerCase().replace(/(^|[\s,(])([a-z])/g,(_,a,b)=>a+b.toUpperCase()).replace(/\bRr\b\.?/g,'Rear').replace(/\bFr\b\.?/g,'Front'):name;
function Pill({title,onPress,strong=false,disabled=false,label}:{title:string;onPress:()=>void;strong?:boolean;disabled?:boolean;label?:string}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label??title} disabled={disabled} onPress={onPress} style={({pressed})=>({paddingHorizontal:14,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:strong?colors.accent:EDGE,backgroundColor:strong?tint(0.14):'transparent',opacity:disabled?0.55:pressed?0.6:1})}>
  <Text style={{color:colors.text,fontSize:14,fontWeight:'700'}}>{title}</Text></Pressable>;
}
function Tag({text,accent=false}:{text:string;accent?:boolean}){return <View style={{paddingHorizontal:8,paddingVertical:3,borderRadius:8,backgroundColor:accent?tint(0.18):'#1b2029'}}><Text style={{color:accent?colors.text:'#c9cfd9',fontSize:12,fontWeight:'700'}}>{text}</Text></View>;}
function Stores({stores}:{stores:StoreLink[]}){
 if(!stores.length)return <Text style={{color:SOFT,fontSize:13.5,lineHeight:19}}>BAK hasn’t found a store that can look this one up by its number. Copy the part number and give it to your dealer.</Text>;
 return <View style={{gap:8}}>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{stores.map(s=><Pill key={s.store} strong title={s.how==='listing'?`${s.store} ›`:`Search ${s.store} ›`} label={`Open this part at ${s.store}`} onPress={()=>{void Linking.openURL(s.url).catch(()=>{});}}/>)}</View>
  <Text style={{color:SOFT,fontSize:12.5,lineHeight:17}}>Opens that part’s page at the store. Check the fit for your year before you order. BAK earns nothing from these links.</Text></View>;
}
function PartCard({p,saved,onSave,busy}:{p:FoundPart;saved:boolean;onSave:()=>void;busy:boolean}){
 const [open,setOpen]=useState(false),[allNumbers,setAllNumbers]=useState(false);
 const numbers=p.numbers?.length?p.numbers:p.part_number?[p.part_number]:[];const shown=allNumbers?numbers:numbers.slice(0,1);
 return <View style={{borderWidth:1,borderColor:EDGE,borderRadius:16,backgroundColor:TILE,padding:14,gap:12}}>
  <View style={{flexDirection:'row',gap:12}}>
   <View accessibilityElementsHidden importantForAccessibility="no" style={{width:46,height:46,borderRadius:12,borderWidth:1,borderColor:p.kind==='factory'?colors.accent:EDGE,backgroundColor:'#0b0d11',alignItems:'center',justifyContent:'center'}}>
    <Text style={{color:p.kind==='factory'?colors.text:'#c9cfd9',fontSize:monogram(p.brand).length>2?12.5:15,fontWeight:'800',letterSpacing:0.5}}>{monogram(p.brand)}</Text></View>
   <View style={{flex:1,gap:6}}>
    <Text style={{color:colors.text,fontSize:16,lineHeight:21,fontWeight:'700'}}>{tidy(p.name)}</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,alignItems:'center'}}>
     {p.kind==='factory'&&<Tag accent text="Factory part"/>}
     {!!p.position&&<Tag text={p.position==='front'?'Front':'Rear'}/>}
     {numbers.length>1&&<Tag text={`${numbers.length} versions`}/>}
     {p.kind==='factory'&&!!p.where&&<Text style={{color:SOFT,fontSize:12.5}}>{tidy(p.where)}</Text>}
    </View>
   </View>
  </View>
  {!!p.note&&<Text numberOfLines={3} style={{color:'#c9cfd9',fontSize:14,lineHeight:20}}>{p.note}</Text>}
  {!!numbers.length&&<View style={{gap:6}}>
   {shown.map(n=><Pressable key={n} accessibilityRole="button" accessibilityLabel={`Part number ${n}. Tap to copy`} onPress={()=>copyText(n,'Part number copied')} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:8,paddingHorizontal:12,borderRadius:10,backgroundColor:'#0b0d11'}}>
    <Text style={{color:colors.text,fontSize:14.5,fontWeight:'600',letterSpacing:0.3}}>No. {n}</Text><Text style={{color:SOFT,fontSize:12.5,fontWeight:'700'}}>Copy</Text></Pressable>)}
   {numbers.length>1&&<Pressable accessibilityRole="button" onPress={()=>setAllNumbers(!allNumbers)} hitSlop={8}><Text style={{color:SOFT,fontSize:13,fontWeight:'700'}}>{allNumbers?'Show fewer numbers':`Show all ${numbers.length} part numbers`}</Text></Pressable>}
  </View>}
  <View style={{flexDirection:'row',gap:8}}>
   <Pill strong title={open?'Hide stores':'Where to buy'} onPress={()=>setOpen(!open)}/>
   <Pill title={saved?'Saved ✓':'Save'} label={saved?'On my parts list':'Save to my parts list'} disabled={saved||busy} onPress={onSave}/>
  </View>
  {open&&<Stores stores={p.stores}/>}
 </View>;
}
type Show='all'|'factory'|'aftermarket';
function Results({found,savedKeys,busy,onSave}:{found:Found;savedKeys:Set<string>;busy:boolean;onSave:(p:FoundPart)=>void}){
 const [show,setShow]=useState<Show>('all'),[end,setEnd]=useState<'both'|'front'|'rear'>('both'),[more,setMore]=useState(false),[type,setType]=useState('');
 const types=found.types??[];
 const all=[...found.factory,...found.aftermarket];
 const hasEnds=all.some(p=>p.position==='front')&&all.some(p=>p.position==='rear');
 const pass=(p:FoundPart)=>(show==='all'||p.kind===show)&&(end==='both'||!hasEnds||p.position===end||!p.position)&&(!type||(p.kind==='aftermarket'&&p.type===type));
 const factory=found.factory.filter(pass),after=found.aftermarket.filter(pass);
 const LIMIT=6,afterShown=more?after:after.slice(0,LIMIT);
 const brands:[string,FoundPart[]][]=[];for(const p of afterShown){const g=brands.find(b=>b[0]===p.brand);if(g)g[1].push(p);else brands.push([p.brand,[p]]);}
 const seg=(v:Show,label:string,n:number)=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:show===v}} onPress={()=>setShow(v)} style={{flex:1,alignItems:'center',paddingVertical:9,borderRadius:10,backgroundColor:show===v?'#232934':'transparent'}}><Text style={{color:show===v?colors.text:SOFT,fontSize:13.5,fontWeight:'700'}}>{label} {n}</Text></Pressable>;
 return <View style={{gap:14}}>
  {found.factory.length>0&&found.aftermarket.length>0&&<View style={{flexDirection:'row',padding:3,borderRadius:13,borderWidth:1,borderColor:EDGE}}>{seg('all','All',all.length)}{seg('factory','Factory',found.factory.length)}{seg('aftermarket','Aftermarket',found.aftermarket.length)}</View>}
  {types.length>1&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
   {[{label:'',count:found.aftermarket.length},...types].map(t=>{const on=type===t.label;return <Pressable key={t.label||'all'} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>{setType(t.label);setMore(false);}} style={{paddingHorizontal:13,paddingVertical:8,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:EDGE,backgroundColor:on?tint(0.14):'transparent'}}><Text style={{color:colors.text,fontSize:13.5,fontWeight:'600'}}>{t.label||'All'} <Text style={{color:SOFT}}>{t.count}</Text></Text></Pressable>;})}
  </View>}
  {hasEnds&&<View style={{flexDirection:'row',gap:8}}>{(['both','front','rear'] as const).map(v=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:end===v}} onPress={()=>setEnd(v)} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:end===v?colors.accent:EDGE,backgroundColor:end===v?tint(0.14):'transparent'}}><Text style={{color:colors.text,fontSize:13.5,fontWeight:'600'}}>{v==='both'?'Front and rear':v==='front'?'Front':'Rear'}</Text></Pressable>)}</View>}
  {!!factory.length&&<View style={{gap:10}}><Text accessibilityRole="header" style={{color:colors.text,fontSize:15,fontWeight:'800'}}>From the factory parts list</Text>{factory.map(p=><PartCard key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>onSave(p)}/>)}</View>}
  {brands.map(([brand,parts])=><View key={brand} style={{gap:10}}>
   <View style={{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between'}}><Text accessibilityRole="header" style={{color:colors.text,fontSize:15,fontWeight:'800'}}>{brand}</Text><Text style={{color:SOFT,fontSize:12.5}}>{parts.length===1?'1 part':`${parts.length} parts`}</Text></View>
   {parts.map(p=><PartCard key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>onSave(p)}/>)}</View>)}
  {after.length>LIMIT&&<Pill title={more?'Show fewer':`Show all ${after.length} aftermarket parts`} onPress={()=>setMore(!more)}/>}
  {!factory.length&&!after.length&&<Text style={{color:SOFT,fontSize:14}}>Nothing matches those filters.</Text>}
  <Text style={{color:SOFT,fontSize:12.5,lineHeight:18}}>The factory list is the maker’s own for your year. Where a product has several part numbers, match the number to the one on your bike.</Text>
 </View>;
}

const savedUrl=(id:string)=>'/api/saved-parts?bike_id='+id;
/** Parts › Find. A search box, then the bike's systems to browse. No wall of text: one decision at a time. */
export function FindPartCard({bike,offerOn,setOfferOn}:{bike?:Bike;offerOn:boolean;setOfferOn:(on:boolean)=>void}){
 const [q,setQ]=useState(pending),[found,setFound]=useState<Found|null>(null),[system,setSystem]=useState(''),[saved,setSaved]=useState<Saved[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const id=bike?.id;
 const load=useCallback(async(url:string)=>{
  if(!id)return;setBusy(true);setNotice('');
  try{setFound(await api<Found>(`/api/parts/find?bike_id=${id}&${url}`));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 },[id]);
 const search=useCallback((text:string)=>{if(!text.trim())return;setSystem('');void load('q='+encodeURIComponent(text.trim()));},[load]);
 const browse=(key:string)=>{setQ('');setFound(null);setSystem(key);void load('system='+key);};
 const reset=()=>{setQ('');setFound(null);setSystem('');setNotice('');};
 useEffect(()=>{setFound(null);setSaved([]);setSystem('');if(!id)return;let live=true;api<Saved[]>(savedUrl(id)).then(r=>{if(live)setSaved(r);}).catch(()=>{});
  if(pending){const p=pending;pending='';setQ(p);search(p);}
  const hear=(text:string)=>{pending='';setQ(text);search(text);};waiting.add(hear);return()=>{live=false;waiting.delete(hear);};},[id,search]);
 async function save(p:FoundPart){
  if(!id)return;setBusy(true);setNotice('');
  try{await api('/api/saved-parts','POST',{bike_id:id,kind:p.kind,brand:p.brand,name:p.name,part_number:p.part_number});setSaved(await api<Saved[]>(savedUrl(id)));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 const savedKeys=new Set(saved.map(keyOf));const none=found&&!found.factory.length&&!found.aftermarket.length;
 const sys=partSystems.find(x=>x.key===system);
 return <View style={{gap:16}}>
  {!sys&&<View style={{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:EDGE,borderRadius:14,backgroundColor:'#0d0f14',paddingHorizontal:14}}>
   <Icon name="search" size={18} color={SOFT}/>
   <TextInput value={q} onChangeText={setQ} placeholder={`Search parts for your ${bike.model}`} placeholderTextColor="#7d8593" returnKeyType="search" autoCorrect={false} onSubmitEditing={()=>search(q)} accessibilityLabel="Search parts" style={{flex:1,color:colors.text,fontSize:16,paddingVertical:13}}/>
   {(!!q||!!found)&&<Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={reset} hitSlop={10}><Text style={{color:SOFT,fontSize:14,fontWeight:'700'}}>Clear</Text></Pressable>}
  </View>}
  {!!sys&&<View style={{gap:6}}>
   <Pressable accessibilityRole="button" onPress={reset} hitSlop={10}><Text style={{color:SOFT,fontSize:14.5,fontWeight:'700'}}>‹ All systems</Text></Pressable>
   <Text accessibilityRole="header" style={{color:colors.text,fontSize:22,...DISPLAY,letterSpacing:0}}>{sys.label}</Text>
  </View>}
  {busy&&<ActivityIndicator color={colors.accent}/>}
  <Notice text={notice} tone={notice?'warn':undefined}/>
  {!sys&&!found&&!busy&&<View style={{gap:10}}>
   <SectionLabel text="Browse by system"/>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{partSystems.map(x=><Pressable key={x.key} haptic="tap" accessibilityRole="button" accessibilityLabel={`${x.label}. ${x.hint}`} onPress={()=>browse(x.key)} style={({pressed})=>({width:'48.4%',borderWidth:1,borderColor:EDGE,borderRadius:16,backgroundColor:pressed?'#171b23':'#0d0f14',paddingVertical:13,paddingHorizontal:14,gap:3})}>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{x.label}</Text><Text numberOfLines={1} style={{color:SOFT,fontSize:12.5}}>{x.hint}</Text></Pressable>)}</View>
  </View>}
  {none&&<Copy>{!found.has_factory_list&&!found.has_aftermarket_list?'BAK has no parts list for this exact bike yet, so there is nothing to show.':sys?`Nothing on file under ${sys.label} for this bike yet.`:`Nothing on file for “${found.query}” on this bike. Try fewer words, like “brake pads” or “chain”, or browse by system.`}</Copy>}
  {!!found&&!none&&<Results key={found.query+'|'+system} found={found} savedKeys={savedKeys} busy={busy} onSave={p=>void save(p)}/>}
  {!!found&&<View style={{flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,borderTopColor:colors.line,paddingTop:12}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>Suggest parts in Ask BAK</Text><Text style={{color:colors.muted,fontSize:13}}>One small line, at most once a chat, when an answer says a part needs replacing.</Text></View>
   <Switch value={offerOn} onValueChange={setOfferOn} accessibilityLabel="Suggest parts in Ask BAK"/>
  </View>}
 </View>;
}
function SectionLabel({text}:{text:string}){return <View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:18,height:3,borderRadius:2,backgroundColor:colors.accent,transform:[{skewX:'-20deg'}]}}/><Text accessibilityRole="header" style={{color:'#aab1bc',fontSize:13,fontWeight:'700'}}>{text}</Text></View>;}

/** Parts › My list: what the rider saved, with where to buy each. */
export function MyPartsList({bike}:{bike?:Bike}){
 const [saved,setSaved]=useState<Saved[]|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[open,setOpen]=useState('');
 const id=bike?.id;
 useEffect(()=>{setSaved(null);if(!id)return;let live=true;api<Saved[]>(savedUrl(id)).then(r=>{if(live)setSaved(r);}).catch(e=>{if(live){setSaved([]);setNotice(errorText(e));}});return()=>{live=false;};},[id]);
 async function remove(s:Saved){
  setBusy(true);setNotice('');
  try{await api(`/api/saved-parts?id=${s.id}`,'DELETE');setSaved(x=>(x??[]).filter(y=>y.id!==s.id));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 if(!saved)return <ActivityIndicator color={colors.accent}/>;
 return <View style={{gap:12}}>
  <Notice text={notice} tone={notice?'warn':undefined}/>
  {!saved.length&&<View style={{gap:6,paddingVertical:18}}><Text style={{color:colors.text,fontSize:16.5,fontWeight:'700'}}>Nothing saved yet</Text><Text style={{color:SOFT,fontSize:14.5,lineHeight:20}}>Tap Save on any part under Find and it lands here, with where to buy it.</Text></View>}
  {saved.map(s=><View key={s.id} style={{borderWidth:1,borderColor:EDGE,borderRadius:16,backgroundColor:TILE,padding:14,gap:12}}>
   <View style={{flexDirection:'row',gap:12,alignItems:'center'}}>
    <View accessibilityElementsHidden importantForAccessibility="no" style={{width:46,height:46,borderRadius:12,borderWidth:1,borderColor:s.kind==='factory'?colors.accent:EDGE,backgroundColor:'#0b0d11',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#c9cfd9',fontSize:monogram(s.brand).length>2?12.5:15,fontWeight:'800'}}>{monogram(s.brand)}</Text></View>
    <View style={{flex:1,gap:4}}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{tidy(s.name)}</Text><Text style={{color:SOFT,fontSize:13}}>{s.kind==='factory'?`${s.brand} factory part`:s.brand}</Text></View>
   </View>
   {!!s.part_number&&<Pressable accessibilityRole="button" accessibilityLabel={`Part number ${s.part_number}. Tap to copy`} onPress={()=>copyText(s.part_number,'Part number copied')} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:8,paddingHorizontal:12,borderRadius:10,backgroundColor:'#0b0d11'}}><Text style={{color:colors.text,fontSize:14.5,fontWeight:'600',letterSpacing:0.3}}>No. {s.part_number}</Text><Text style={{color:SOFT,fontSize:12.5,fontWeight:'700'}}>Copy</Text></Pressable>}
   <View style={{flexDirection:'row',gap:8}}><Pill strong title={open===s.id?'Hide stores':'Where to buy'} onPress={()=>setOpen(open===s.id?'':s.id)}/><Pill title="Remove" disabled={busy} onPress={()=>void remove(s)}/></View>
   {open===s.id&&<Stores stores={s.stores}/>}
  </View>)}
 </View>;
}

/** Under an Ask BAK answer: shown only if this bike really has a matching part on file. Otherwise nothing. */
export function PartOfferLine({bikeId,query,onOpen}:{bikeId:string;query:string;onOpen:()=>void}){
 const [has,setHas]=useState(false);
 useEffect(()=>{let live=true;setHas(false);api<Found>(`/api/parts/find?bike_id=${bikeId}&q=${encodeURIComponent(query)}`).then(r=>{if(live)setHas(r.factory.length+r.aftermarket.length>0);}).catch(()=>{});return()=>{live=false;};},[bikeId,query]);
 if(!has)return null;
 return <LinkAction muted title="See parts that fit your bike" onPress={onOpen}/>;
}
