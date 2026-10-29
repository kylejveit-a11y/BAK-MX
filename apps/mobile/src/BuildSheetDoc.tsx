// The build sheet as a finished document: a header plate for the bike, a short summary, then each area of the bike with what's
// fitted, set out like a team's spec sheet. Used in Garage (your bike) and on profiles (a public build sheet).
import React from 'react';
import {Text,View} from 'react-native';
import {partSystems,type PartSystem} from '../../../shared/installed-parts';
import {RacePlate} from './RacePlate';
import {Eyebrow,MetalMark,colors,tint} from './ui';

export type SheetPart={brand:string;name:string;size?:string;color?:string;detail?:string;off?:boolean};
export type SheetData={title:string;subtitle?:string;raceNumber?:string;hours?:number|null;updated?:string;parts:(SheetPart&{system:PartSystem})[];stock:PartSystem[];checks?:string[]};

/** The bike's areas, grouped the way a mechanic walks it. */
const GROUPS:{label:string;systems:PartSystem[]}[]=[
 {label:'Suspension & chassis',systems:['suspension','chassis']},
 {label:'Engine',systems:['engine','intake','exhaust','tuning','clutch']},
 {label:'Drive, brakes & wheels',systems:['gearing','brakes','wheels']},
 {label:'Cockpit & protection',systems:['controls','protection','body']},
];
const AMBER='#e2bd72';

export function BuildSheetDoc({data,mine=false}:{data:SheetData;mine?:boolean}){
 const on=data.parts.filter(p=>!p.off),spares=data.parts.filter(p=>p.off);
 const modified=new Set(on.map(p=>p.system)),stock=data.stock.filter(s=>!modified.has(s));
 const missing=partSystems.map(s=>s.key).filter(k=>!modified.has(k)&&!stock.includes(k));
 const label=(k:PartSystem)=>partSystems.find(s=>s.key===k)?.label??k;
 return <View style={{gap:18}}>
  {/* header plate */}
  <View style={{borderRadius:16,borderWidth:1,borderColor:'#262b34',backgroundColor:'#0d0f13',padding:16,gap:10,overflow:'hidden'}}>
   <View style={{position:'absolute',left:0,top:0,bottom:0,width:4,backgroundColor:colors.accent}}/>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={18}/><Eyebrow>BUILD SHEET</Eyebrow></View>
    <Text style={{color:'#6f7784',fontSize:11,fontWeight:'800',fontStyle:'italic',letterSpacing:1.5}}>BAK MX</Text>
   </View>
   <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
    {!!data.raceNumber&&<RacePlate number={data.raceNumber} size={1.1}/>}
    <View style={{flex:1}}>
     <Text style={{color:colors.text,fontSize:24,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.6}}>{data.title}</Text>
     {!!data.subtitle&&<Text style={{color:colors.muted,fontSize:14}}>{data.subtitle}</Text>}
    </View>
   </View>
   <View style={{flexDirection:'row',borderTopWidth:1,borderTopColor:'#1f242c',paddingTop:10}}>
    <Stat value={String(on.length)} label={on.length===1?'part':'parts'}/>
    <Stat value={String(modified.size)} label="changed"/>
    <Stat value={String(stock.length)} label="stock"/>
    {data.hours!=null&&<Stat value={String(data.hours)} label="hours"/>}
   </View>
  </View>

  {!!data.checks?.length&&<View style={{gap:6,borderLeftWidth:3,borderLeftColor:AMBER,paddingLeft:12}}>
   <Text style={{color:AMBER,fontSize:12,fontWeight:'800',letterSpacing:1}}>{data.checks.length===1?'1 THING TO CHECK':`${data.checks.length} THINGS TO CHECK`}</Text>
   {data.checks.map((c,i)=><Text key={i} style={{color:colors.text,fontSize:14,lineHeight:20}}>{c}</Text>)}
  </View>}

  {!on.length&&!stock.length&&<Text style={{color:colors.muted,fontSize:14.5,lineHeight:21}}>{mine?'Nothing recorded yet. Tap Edit build sheet and pick what’s on the bike, or mark an area stock.':'Nothing recorded yet.'}</Text>}

  {GROUPS.map(g=>{const rows=g.systems.filter(k=>modified.has(k)||stock.includes(k));if(!rows.length)return null;
   return <View key={g.label} style={{gap:10}}>
    <Text style={{color:'#8b93a1',fontSize:11.5,fontWeight:'800',letterSpacing:1.4}}>{g.label.toUpperCase()}</Text>
    <View style={{borderRadius:14,borderWidth:1,borderColor:'#20242c',backgroundColor:'#0c0e12',overflow:'hidden'}}>
     {rows.map((k,i)=>{const parts=on.filter(p=>p.system===k);
      return <View key={k} style={{flexDirection:'row',gap:12,padding:14,borderTopWidth:i?1:0,borderTopColor:'#1a1e25'}}>
       <View style={{width:96,gap:4}}>
        <Text style={{color:colors.text,fontSize:13.5,fontWeight:'800'}}>{label(k)}</Text>
        {parts.length?<Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:0.8}}>MODIFIED</Text>:<View style={{alignSelf:'flex-start',paddingHorizontal:7,paddingVertical:2,borderRadius:6,backgroundColor:tint(0.12)}}><Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:0.8}}>STOCK</Text></View>}
       </View>
       <View style={{flex:1,gap:10}}>
        {parts.length?parts.map((p,j)=><PartLine key={j} p={p}/>):<Text style={{color:colors.muted,fontSize:14}}>As it came from the factory</Text>}
       </View>
      </View>;})}
    </View>
   </View>;})}

  {spares.length>0&&<View style={{gap:10}}>
   <Text style={{color:'#8b93a1',fontSize:11.5,fontWeight:'800',letterSpacing:1.4}}>OFF THE BIKE · SPARES AND SWAPS</Text>
   <View style={{borderRadius:14,borderWidth:1,borderColor:'#20242c',borderStyle:'dashed',padding:14,gap:10}}>
    {spares.map((p,j)=><View key={j} style={{gap:2}}><Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:0.8}}>{label(p.system).toUpperCase()}</Text><PartLine p={p}/></View>)}
   </View>
  </View>}

  {mine&&missing.length>0&&(on.length>0||stock.length>0)&&<Text style={{color:'#7d8593',fontSize:13,lineHeight:19}}>Not recorded yet: {missing.map(label).join(', ')}. BAK treats these as unknown, not stock.</Text>}
  {!!data.updated&&<Text style={{color:'#5f6672',fontSize:11.5}}>Updated {new Date(data.updated).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}</Text>}
 </View>;
}

function Stat({value,label}:{value:string;label:string}){
 return <View style={{flex:1,gap:1}} accessible accessibilityLabel={`${value} ${label}`}><Text style={{color:colors.text,fontSize:19,fontWeight:'900',fontStyle:'italic'}}>{value}</Text><Text style={{color:'#8b93a1',fontSize:11.5}}>{label}</Text></View>;
}
function PartLine({p}:{p:SheetPart}){
 const tags=[p.size,p.color].filter(Boolean) as string[];
 return <View style={{gap:2}}>
  {!!p.brand&&<Text style={{color:colors.accent,fontSize:11.5,fontWeight:'800',letterSpacing:0.9}}>{p.brand.toUpperCase()}</Text>}
  <Text style={{color:colors.text,fontSize:15,fontWeight:'600',lineHeight:20}}>{p.name}{tags.length?<Text style={{color:colors.muted,fontWeight:'500'}}>  ·  {tags.join(' · ')}</Text>:null}</Text>
  {!!p.detail&&<Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{p.detail}</Text>}
 </View>;
}
