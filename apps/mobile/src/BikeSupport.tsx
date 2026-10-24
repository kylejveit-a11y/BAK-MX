import React,{useMemo,useState} from 'react';
import {View,Text,TextInput,StyleSheet} from 'react-native';
import {Pressable} from './Touch';
import {Icon} from './Icon';
import {BikeWheel} from './Wheel';
import {level,supportAreas,groupSupport,yearRange,type SupportData,type SupportRow} from '../../../shared/bike-support';
import {Card,Eyebrow,Page,colors,s} from './ui';
import {MetalPanel,MetalWell} from './MetalPanel';
const data=require('../../../shared/bike-support.json') as SupportData;

// Coverage colors: distinct at a glance (green, blue, amber, gray) so a list of years never reads as all gray.
const tone:Record<string,{bg:string;line:string;text:string;dot:string}>={full:{bg:'#0f2a1b',line:'#2e9c5c',text:'#7ee2a6',dot:'#3fd17f'},strong:{bg:'#0f2036',line:'#3f7fd6',text:'#9cc4ff',dot:'#4c94ff'},good:{bg:'#2a2210',line:'#b08a2c',text:'#f5cf72',dot:'#f2b23e'},basic:{bg:'#1a1d22',line:'#4a505b',text:'#b7bec9',dot:'#8d95a2'}};
function Badge({id,label}:{id:string;label:string}){const t=tone[id];return <View style={{flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-start'}}><View style={{width:9,height:9,borderRadius:5,backgroundColor:t.dot}}/><Text style={{color:t.text,fontSize:12.5,fontWeight:'700'}}>{label}</Text></View>;}

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
   <Icon name="moto" size={26} color="#b2b9c4"/>
   <View style={{flex:1,gap:2}}><Text style={{color:row?colors.text:colors.muted,fontSize:17,fontWeight:'600'}}>{row?`${row.year} ${row.make} ${row.model}`:'Choose your bike'}</Text><Text style={{color:'#9aa2ae',fontSize:12.5}}>{row?'Tap to change':`${data.bikes.length} bike-years from ${makes.length} makes`}</Text></View>
   <Icon name="chevronRight" size={17} color="#adb5c1"/>
  </Pressable></MetalWell>
  {row?<SupportDetail row={row}/>:<Text style={[{color:'#aab1bc',fontSize:13.5,lineHeight:20},engraved]}>If yours isn’t listed, it isn’t supported yet.</Text>}
  {onSeeAll&&<Pressable accessibilityRole="button" onPress={onSeeAll}><Text style={{color:colors.accent,fontWeight:'700'}}>See all supported bikes →</Text></Pressable>}
  <BikeWheel visible={open} makes={makes} modelsFor={modelsFor} yearsFor={yearsFor} initial={pick??undefined} onClose={()=>setOpen(false)} onDone={b=>{setPick(b);setOpen(false);}}/>
 </MetalPanel>;
}

export function SupportedBikesScreen(){
 const [q,setQ]=useState(''),[openMake,setOpenMake]=useState(''),[openModel,setOpenModel]=useState(''),[open,setOpen]=useState<SupportRow|null>(null);
 const searching=!!q.trim(),makes=useMemo(()=>groupSupport(data.bikes,q),[q]);
 // One brand open at a time; while searching, every matching brand is open.
 const toggleMake=(m:string)=>{setOpenMake(openMake===m?'':m);setOpenModel('');setOpen(null);};
 return <Page title="Supported bikes">
  <View style={{gap:14}}>
   <Text style={{color:colors.muted,fontSize:15,lineHeight:22}}>Open a brand, then a model, to see what BAK covers for each year. If your bike isn’t here, it isn’t supported yet.</Text>
   <View style={{flexDirection:'row',gap:16,flexWrap:'wrap'}}>{(['full','strong','good','basic'] as const).map(id=><Badge key={id} id={id} label={level({full_rebuild:id==='full',knowledge:id==='strong'?90:id==='good'?70:10}).short}/>)}</View>
   <View style={{flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#2a2f39'}}><Icon name="search" size={18} color="#adb5c1"/><TextInput value={q} onChangeText={setQ} placeholder="KX450, 2024, Husqvarna…" placeholderTextColor="#7d8593" style={{flex:1,color:colors.text,fontSize:17,paddingVertical:11}} accessibilityLabel="Search bikes" autoCorrect={false} clearButtonMode="while-editing"/></View>
  </View>
  {!makes.length&&<Text style={{color:colors.muted,fontSize:15}}>No supported bike matches “{q.trim()}”.</Text>}
  <View>{makes.map(mk=>{const expanded=searching||openMake===mk.make;
   return <View key={mk.make} style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39'}}>
    <Pressable haptic="select" accessibilityRole="button" accessibilityState={{expanded}} accessibilityLabel={`${mk.make}, ${mk.models.length} models`} onPress={()=>!searching&&toggleMake(mk.make)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,paddingVertical:16,opacity:pressed?0.6:1})}>
     <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:22,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.5}}>{mk.make}</Text><Text style={{color:'#a1a9b6',fontSize:13.5}}>{mk.models.length} {mk.models.length===1?'model':'models'} · {yearRange(mk.from,mk.to)}</Text></View>
     {!searching&&<Icon name={expanded?'chevronUp':'chevronDown'} size={18} color={expanded?colors.accent:'#adb5c1'}/>}
    </Pressable>
    {expanded&&<View style={{paddingBottom:10}}>{mk.models.map(md=>{const key=mk.make+'|'+md.model,mOpen=openModel===key;
     return <View key={key} style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#1f232b'}}>
      <Pressable accessibilityRole="button" accessibilityState={{expanded:mOpen}} accessibilityLabel={`${md.model}, ${yearRange(md.from,md.to)}`} onPress={()=>{setOpenModel(mOpen?'':key);setOpen(null);}} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,paddingLeft:4,opacity:pressed?0.6:1})}>
       <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16.5,fontWeight:'700'}}>{md.model}</Text><Text style={{color:'#a1a9b6',fontSize:13.5}}>{yearRange(md.from,md.to)}</Text></View>
       <View style={{flexDirection:'row',gap:3}}>{[...md.rows].reverse().map(r=><View key={r.year} style={{width:7,height:7,borderRadius:4,backgroundColor:tone[level(r).id].dot}}/>)}</View>
       <Icon name={mOpen?'chevronUp':'chevronRight'} size={15} color="#939ba8"/>
      </Pressable>
      {mOpen&&<View style={{gap:8,paddingBottom:12,paddingLeft:4}}>
       <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{md.rows.map(r=>{const t=tone[level(r).id],on=open===r;return <Pressable key={r.year} accessibilityRole="button" accessibilityState={{selected:on}} accessibilityLabel={`${r.year} ${level(r).label}`} onPress={()=>setOpen(on?null:r)} style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?t.text:t.line,backgroundColor:t.bg}}><View style={{width:7,height:7,borderRadius:4,backgroundColor:t.dot}}/><Text style={{color:t.text,fontSize:14,fontWeight:'700'}}>{r.year}</Text></Pressable>;})}</View>
       {open&&md.rows.includes(open)?<SupportDetail row={open}/>:<Text style={{color:'#8d95a2',fontSize:13}}>Tap a year for details.</Text>}
      </View>}
     </View>;})}</View>}
   </View>;})}</View>
 </Page>;
}
