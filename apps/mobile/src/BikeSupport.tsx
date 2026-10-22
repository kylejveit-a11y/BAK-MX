import React,{useMemo,useState} from 'react';
import {View,Text,TextInput,StyleSheet} from 'react-native';
import {Pressable} from './Touch';
import {Icon} from './Icon';
import {BikeWheel} from './Wheel';
import {level,supportAreas,type SupportData,type SupportRow} from '../../../shared/bike-support';
import {Card,Eyebrow,Page,colors,s} from './ui';
import {MetalPanel,MetalWell} from './MetalPanel';
const data=require('../../../shared/bike-support.json') as SupportData;

const tone:Record<string,{bg:string;line:string;text:string}>={full:{bg:'#10251a',line:'#2f7a4c',text:'#bff0cf'},strong:{bg:'#0f1d2e',line:'#3d6ea8',text:'#cfe2fb'},good:{bg:'#1d1a10',line:'#7a6a2f',text:'#f0e2b5'},basic:{bg:'#16181c',line:'#3a3f48',text:'#a7afbd'}};
function Badge({id,label}:{id:string;label:string}){const t=tone[id];return <View style={{flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-start'}}><View style={{width:8,height:8,borderRadius:4,backgroundColor:t.text}}/><Text style={{color:t.text,fontSize:12.5,fontWeight:'700'}}>{label}</Text></View>;}

export function SupportDetail({row}:{row:SupportRow}){
 const l=level(row);
 return <View style={{gap:8,paddingTop:4}}>
  <Badge id={l.id} label={l.label}/>
  <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{row.year} {row.make} {row.model}</Text>
  <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>{l.line}</Text>
  {supportAreas(row,data.guide_total).map(([name,val,ok])=><View key={name} style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:18,alignItems:'center'}}>{ok?<Icon name="check" size={15} color="#7fd09a" weight={2.2}/>:<View style={{width:5,height:5,borderRadius:3,backgroundColor:'#58606e'}}/>}</View><Text style={{color:ok?colors.text:colors.muted,flex:1,fontSize:14}}>{name}</Text><Text style={{color:'#cfd6e2',fontSize:14,fontWeight:'600'}}>{val}</Text></View>)}
 </View>;
}

/** Shown before sign-in: pick make, model and year to see what BAK covers before paying. */
export function SupportPicker({onSeeAll}:{onSeeAll?:()=>void}){
 const makes=useMemo(()=>[...new Set(data.bikes.map(b=>b.make))].sort(),[]);
 const [open,setOpen]=useState(false),[pick,setPick]=useState<{make:string;model:string;year:string}|null>(null);
 const modelsFor=(m:string)=>[...new Set(data.bikes.filter(b=>b.make===m).map(b=>b.model))];
 const yearsFor=(m:string,mo:string)=>data.bikes.filter(b=>b.make===m&&b.model===mo).map(b=>b.year);
 const row=pick&&data.bikes.find(b=>b.make===pick.make&&b.model===pick.model&&String(b.year)===pick.year);
 const engraved={textShadowColor:'rgba(0,0,0,0.75)',textShadowOffset:{width:0,height:1},textShadowRadius:1};
 return <MetalPanel style={{marginTop:10,marginBottom:8}}><View style={{gap:6,paddingTop:4}}><Text style={[{color:'#b9c0ca',fontWeight:'800',letterSpacing:2.2,fontSize:11},engraved]}>BEFORE YOU SIGN UP</Text><Text style={[{color:'#f3f5f8',fontSize:23,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.5},engraved]}>Is your bike supported?</Text></View>
  <MetalWell><Pressable accessibilityRole="button" accessibilityLabel={row?`Change bike, ${row.year} ${row.make} ${row.model}`:'Choose your bike'} onPress={()=>setOpen(true)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,paddingVertical:14,paddingHorizontal:14,opacity:pressed?0.6:1})}>
   <Icon name="moto" size={26} color="#a1a8b4"/>
   <View style={{flex:1,gap:2}}><Text style={{color:row?colors.text:colors.muted,fontSize:17,fontWeight:'600'}}>{row?`${row.year} ${row.make} ${row.model}`:'Choose your bike'}</Text><Text style={{color:'#868e9b',fontSize:12.5}}>{row?'Tap to change':`${data.bikes.length} bike-years from ${makes.length} makes`}</Text></View>
   <Icon name="chevronRight" size={17} color="#9aa2af"/>
  </Pressable></MetalWell>
  {row?<SupportDetail row={row}/>:<Text style={[{color:'#aab1bc',fontSize:13.5,lineHeight:20},engraved]}>If yours isn’t listed, it isn’t supported yet.</Text>}
  {onSeeAll&&<Pressable accessibilityRole="button" onPress={onSeeAll}><Text style={{color:colors.accent,fontWeight:'700'}}>See all supported bikes →</Text></Pressable>}
  <BikeWheel visible={open} makes={makes} modelsFor={modelsFor} yearsFor={yearsFor} initial={pick??undefined} onClose={()=>setOpen(false)} onDone={b=>{setPick(b);setOpen(false);}}/>
 </MetalPanel>;
}

export function SupportedBikesScreen(){
 const [q,setQ]=useState(''),[open,setOpen]=useState<SupportRow|null>(null);
 const groups=new Map<string,SupportRow[]>();
 for(const b of data.bikes)if(!q.trim()||`${b.make} ${b.model} ${b.year}`.toLowerCase().includes(q.trim().toLowerCase())){const k=`${b.make}|${b.model}`;if(!groups.has(k))groups.set(k,[]);groups.get(k)!.push(b);}
 const makes=[...new Set([...groups.keys()].map(k=>k.split('|')[0]))].sort();
 return <Page title="Supported bikes">
  <View style={{gap:14}}>
   <Text style={{color:colors.muted,fontSize:15,lineHeight:22}}>Tap a year to see what BAK covers for it. If your bike isn’t here, it isn’t supported yet.</Text>
   <View style={{flexDirection:'row',gap:14,flexWrap:'wrap'}}>{(['full','strong','good','basic'] as const).map(id=><Badge key={id} id={id} label={level({full_rebuild:id==='full',knowledge:id==='strong'?90:id==='good'?70:10}).short}/>)}</View>
   <View style={{flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#2a2f39'}}><Icon name="search" size={18} color="#9aa2af"/><TextInput value={q} onChangeText={setQ} placeholder="KX450, 2024, Husqvarna…" placeholderTextColor="#6b7380" style={{flex:1,color:colors.text,fontSize:17,paddingVertical:11}} accessibilityLabel="Search bikes" autoCorrect={false} clearButtonMode="while-editing"/></View>
  </View>
  {makes.map(make=><Card key={make}><Text style={{color:colors.text,fontSize:22,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.5}}>{make}</Text>{[...groups.entries()].filter(([k])=>k.startsWith(make+'|')).map(([k,rows])=><View key={k} style={{gap:6,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#232833',paddingTop:12}}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{k.split('|')[1]}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:4}}>{rows.sort((a,b)=>b.year-a.year).map(r=>{const t=tone[level(r).id],on=open===r;return <Pressable key={r.year} accessibilityRole="button" accessibilityState={{selected:on}} accessibilityLabel={`${r.year} ${level(r).label}`} onPress={()=>setOpen(on?null:r)} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:8,paddingVertical:6,borderRadius:14,borderWidth:1,borderColor:on?t.text:'transparent'}}><View style={{width:6,height:6,borderRadius:3,backgroundColor:t.text}}/><Text style={{color:t.text,fontSize:14,fontWeight:'600'}}>{r.year}</Text></Pressable>;})}</View>{open&&rows.includes(open)&&<View style={{paddingVertical:6}}><SupportDetail row={open}/></View>}</View>)}</Card>)}
 </Page>;
}
