// Find a part: the rider opens it on purpose. Parts on file for this exact bike (factory list and aftermarket list),
// where to buy each, and a saved parts list. Also the one quiet line under an Ask BAK answer that opens it.
// Rules (Kyle): never push sales, nothing shown that is not on file for the bike, no prices BAK cannot stand behind.
import {useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Linking,ScrollView,Text,View} from 'react-native';
import {api} from './api';
import {Button,Card,colors,Copy,Field,LinkAction,Notice,Switch} from './ui';
import {tint} from './theme';
import {Pressable} from './Touch';
import {copyText} from './copy';
import type {Bike} from '../../../shared/types';
import type {FoundPart,StoreLink} from '../../../shared/parts-hunter';

type Found={query:string;factory:FoundPart[];aftermarket:FoundPart[];has_factory_list:boolean;has_aftermarket_list:boolean};
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
 const [show,setShow]=useState<Show>('all'),[end,setEnd]=useState<'both'|'front'|'rear'>('both'),[more,setMore]=useState(false);
 const all=[...found.factory,...found.aftermarket];
 const hasEnds=all.some(p=>p.position==='front')&&all.some(p=>p.position==='rear');
 const pass=(p:FoundPart)=>(show==='all'||p.kind===show)&&(end==='both'||!hasEnds||p.position===end||!p.position);
 const factory=found.factory.filter(pass),after=found.aftermarket.filter(pass);
 const LIMIT=6,afterShown=more?after:after.slice(0,LIMIT);
 const brands:[string,FoundPart[]][]=[];for(const p of afterShown){const g=brands.find(b=>b[0]===p.brand);if(g)g[1].push(p);else brands.push([p.brand,[p]]);}
 const seg=(v:Show,label:string,n:number)=><Pressable key={v} accessibilityRole="button" accessibilityState={{selected:show===v}} onPress={()=>setShow(v)} style={{flex:1,alignItems:'center',paddingVertical:9,borderRadius:10,backgroundColor:show===v?'#232934':'transparent'}}><Text style={{color:show===v?colors.text:SOFT,fontSize:13.5,fontWeight:'700'}}>{label} {n}</Text></Pressable>;
 return <View style={{gap:14}}>
  {found.factory.length>0&&found.aftermarket.length>0&&<View style={{flexDirection:'row',padding:3,borderRadius:13,borderWidth:1,borderColor:EDGE}}>{seg('all','All',all.length)}{seg('factory','Factory',found.factory.length)}{seg('aftermarket','Aftermarket',found.aftermarket.length)}</View>}
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

export function FindPartCard({bike,offerOn,setOfferOn}:{bike?:Bike;offerOn:boolean;setOfferOn:(on:boolean)=>void}){
 const [q,setQ]=useState(pending),[found,setFound]=useState<Found|null>(null),[saved,setSaved]=useState<Saved[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[openSaved,setOpenSaved]=useState('');
 const id=bike?.id;
 const search=useCallback(async(text:string)=>{
  if(!id||!text.trim())return;setBusy(true);setNotice('');
  try{setFound(await api<Found>(`/api/parts/find?bike_id=${id}&q=${encodeURIComponent(text.trim())}`));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 },[id]);
 useEffect(()=>{setFound(null);setSaved([]);if(!id)return;let live=true;api<Saved[]>('/api/saved-parts?bike_id='+id).then(r=>{if(live)setSaved(r);}).catch(()=>{});
  if(pending){const p=pending;pending='';setQ(p);void search(p);}
  const hear=(text:string)=>{pending='';setQ(text);void search(text);};waiting.add(hear);return()=>{live=false;waiting.delete(hear);};},[id,search]);
 async function save(p:FoundPart){
  if(!id)return;setBusy(true);setNotice('');
  try{await api('/api/saved-parts','POST',{bike_id:id,kind:p.kind,brand:p.brand,name:p.name,part_number:p.part_number});setSaved(await api<Saved[]>('/api/saved-parts?bike_id='+id));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 async function remove(s:Saved){
  if(!id)return;setBusy(true);setNotice('');
  try{await api(`/api/saved-parts?id=${s.id}`,'DELETE');setSaved(saved.filter(x=>x.id!==s.id));}catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 const savedKeys=new Set(saved.map(keyOf));const none=found&&!found.factory.length&&!found.aftermarket.length;
 return <Card><Copy strong>Find a part</Copy>
  <Copy>Parts on file for your {bike.model_year} {bike.model}, and where to buy them.</Copy>
  <Field label="What do you need?" placeholder="Rear brake pads" value={q} onChangeText={setQ} returnKeyType="search" autoCorrect={false} onSubmitEditing={()=>void search(q)}/>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{gap:8,paddingRight:8}}>{QUICK.map(w=><Pressable key={w} accessibilityRole="button" onPress={()=>{setQ(w);void search(w);}} style={{paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:'#2a2f39'}}><Text style={{color:colors.text,fontSize:13.5}}>{w}</Text></Pressable>)}</ScrollView>
  {!!q.trim()&&<Button title="Find it" disabled={busy} onPress={()=>void search(q)}/>}
  {busy&&<ActivityIndicator color={colors.accent}/>}
  <Notice text={notice} tone={notice?'warn':undefined}/>
  {none&&<Copy>{!found.has_factory_list&&!found.has_aftermarket_list?'BAK has no parts list for this exact bike yet, so there is nothing to show.':`Nothing on file for “${found.query}” on this bike. Try fewer words, like “brake pads” or “chain”.`}</Copy>}
  {!!found&&!none&&<Results key={found.query} found={found} savedKeys={savedKeys} busy={busy} onSave={p=>void save(p)}/>}
  {!!saved.length&&<View style={{gap:10,marginTop:8}}><Text style={{color:'#9aa2ae',fontSize:13.5,fontWeight:'700'}}>My parts list ({saved.length})</Text>
   {saved.map(s=><View key={s.id} style={{borderWidth:1,borderColor:EDGE,borderRadius:14,backgroundColor:TILE,padding:12,gap:10}}>
    <View style={{flexDirection:'row',gap:12,alignItems:'center'}}>
     <View accessibilityElementsHidden importantForAccessibility="no" style={{width:40,height:40,borderRadius:11,borderWidth:1,borderColor:EDGE,backgroundColor:'#0b0d11',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#c9cfd9',fontSize:monogram(s.brand).length>2?11.5:14,fontWeight:'800'}}>{monogram(s.brand)}</Text></View>
     <View style={{flex:1,gap:3}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{s.kind==='aftermarket'?`${s.brand} ${s.name}`:tidy(s.name)}</Text>
      {!!s.part_number&&<Text onPress={()=>copyText(s.part_number,'Part number copied')} style={{color:SOFT,fontSize:13}}>No. {s.part_number}  ·  Copy</Text>}</View>
    </View>
    <View style={{flexDirection:'row',gap:8}}><Pill strong title={openSaved===s.id?'Hide stores':'Where to buy'} onPress={()=>setOpenSaved(openSaved===s.id?'':s.id)}/><Pill title="Remove" disabled={busy} onPress={()=>void remove(s)}/></View>
    {openSaved===s.id&&<Stores stores={s.stores}/>}
   </View>)}</View>}
  {(!!found||!!saved.length||!offerOn)&&<View style={{flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,borderTopColor:colors.line,paddingTop:12,marginTop:6}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>Suggest parts in Ask BAK</Text><Text style={{color:colors.muted,fontSize:13}}>One small line, at most once a chat, when an answer says a part needs replacing.</Text></View>
   <Switch value={offerOn} onValueChange={setOfferOn} accessibilityLabel="Suggest parts in Ask BAK"/>
  </View>}
 </Card>;
}

/** Under an Ask BAK answer: shown only if this bike really has a matching part on file. Otherwise nothing. */
export function PartOfferLine({bikeId,query,onOpen}:{bikeId:string;query:string;onOpen:()=>void}){
 const [has,setHas]=useState(false);
 useEffect(()=>{let live=true;setHas(false);api<Found>(`/api/parts/find?bike_id=${bikeId}&q=${encodeURIComponent(query)}`).then(r=>{if(live)setHas(r.factory.length+r.aftermarket.length>0);}).catch(()=>{});return()=>{live=false;};},[bikeId,query]);
 if(!has)return null;
 return <LinkAction muted title="See parts that fit your bike" onPress={onOpen}/>;
}
