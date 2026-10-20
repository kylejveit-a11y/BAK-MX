import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,TextInput} from 'react-native';
import {level,supportAreas,type SupportData,type SupportRow} from '../../../shared/bike-support';
import {Card,Eyebrow,Page,Select,colors,s} from './ui';
const data=require('../../../shared/bike-support.json') as SupportData;

const tone:Record<string,{bg:string;line:string;text:string}>={full:{bg:'#10251a',line:'#2f7a4c',text:'#bff0cf'},strong:{bg:'#0f1d2e',line:'#3d6ea8',text:'#cfe2fb'},good:{bg:'#1d1a10',line:'#7a6a2f',text:'#f0e2b5'},basic:{bg:'#16181c',line:'#3a3f48',text:'#a7afbd'}};
function Badge({id,label}:{id:string;label:string}){const t=tone[id];return <View style={{flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-start'}}><View style={{width:8,height:8,borderRadius:4,backgroundColor:t.text}}/><Text style={{color:t.text,fontSize:12.5,fontWeight:'700'}}>{label}</Text></View>;}

export function SupportDetail({row}:{row:SupportRow}){
 const l=level(row);
 return <View style={{gap:8,paddingTop:4}}>
  <Badge id={l.id} label={l.label}/>
  <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{row.year} {row.make} {row.model}</Text>
  <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>{l.line}</Text>
  {supportAreas(row,data.guide_total).map(([name,val,ok])=><View key={name} style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{color:ok?'#7fd09a':'#58606e',width:16}}>{ok?'✓':'•'}</Text><Text style={{color:ok?colors.text:colors.muted,flex:1,fontSize:14}}>{name}</Text><Text style={{color:'#cfd6e2',fontSize:14,fontWeight:'600'}}>{val}</Text></View>)}
 </View>;
}

/** Shown before sign-in: pick make, model and year to see what BAK covers before paying. */
export function SupportPicker({onSeeAll}:{onSeeAll?:()=>void}){
 const makes=useMemo(()=>[...new Set(data.bikes.map(b=>b.make))].sort(),[]);
 const [make,setMake]=useState(''),[model,setModel]=useState(''),[year,setYear]=useState('');
 const models=[...new Set(data.bikes.filter(b=>b.make===make).map(b=>b.model))];
 const years=data.bikes.filter(b=>b.make===make&&b.model===model).map(b=>b.year).sort((a,b)=>b-a);
 const row=data.bikes.find(b=>b.make===make&&b.model===model&&String(b.year)===year);
 return <Card><Eyebrow>BEFORE YOU SIGN UP</Eyebrow><Text style={{color:colors.text,fontSize:20,fontWeight:'800'}}>Is your bike supported?</Text>
  <Select label="Make" value={make} options={[{value:'',label:'Choose a make'},...makes.map(m=>({value:m,label:m}))]} onChange={v=>{setMake(v);setModel('');setYear('');}}/>
  {!!make&&<Select label="Model" value={model} options={[{value:'',label:'Choose a model'},...models.map(m=>({value:m,label:m}))]} onChange={v=>{setModel(v);const ys=data.bikes.filter(b=>b.make===make&&b.model===v).map(b=>b.year);setYear(ys.length?String(Math.max(...ys)):'');}}/>}
  {!!model&&<Select label="Year" value={year} options={years.map(y=>({value:String(y),label:String(y)}))} onChange={setYear}/>}
  {row?<SupportDetail row={row}/>:<Text style={{color:colors.muted,fontSize:14}}>{data.bikes.length} bike-years from {makes.length} makes so far. If yours isn’t listed, it isn’t supported yet.</Text>}
  {onSeeAll&&<Pressable accessibilityRole="button" onPress={onSeeAll}><Text style={{color:colors.accent,fontWeight:'700'}}>See all supported bikes →</Text></Pressable>}
 </Card>;
}

export function SupportedBikesScreen(){
 const [q,setQ]=useState(''),[open,setOpen]=useState<SupportRow|null>(null);
 const groups=new Map<string,SupportRow[]>();
 for(const b of data.bikes)if(!q.trim()||`${b.make} ${b.model} ${b.year}`.toLowerCase().includes(q.trim().toLowerCase())){const k=`${b.make}|${b.model}`;if(!groups.has(k))groups.set(k,[]);groups.get(k)!.push(b);}
 const makes=[...new Set([...groups.keys()].map(k=>k.split('|')[0]))].sort();
 return <Page title="Supported bikes">
  <Card><Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Tap a year to see what BAK covers for it. If your bike isn’t here, it isn’t supported yet.</Text>
   <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{(['full','strong','good','basic'] as const).map(id=><Badge key={id} id={id} label={level({full_rebuild:id==='full',knowledge:id==='strong'?90:id==='good'?70:10}).short}/>)}</View>
   <TextInput value={q} onChangeText={setQ} placeholder="Search: KX450, 2024, Husqvarna…" placeholderTextColor="#7c858e" style={s.input} accessibilityLabel="Search bikes"/></Card>
  {open&&<Card><SupportDetail row={open}/><Pressable onPress={()=>setOpen(null)}><Text style={{color:colors.accent,fontWeight:'700'}}>Close</Text></Pressable></Card>}
  {makes.map(make=><Card key={make}><Text style={{color:colors.text,fontSize:19,fontWeight:'800'}}>{make}</Text>{[...groups.entries()].filter(([k])=>k.startsWith(make+'|')).map(([k,rows])=><View key={k} style={{gap:8,borderTopWidth:1,borderTopColor:'#232833',paddingTop:10}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{k.split('|')[1]}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{rows.sort((a,b)=>b.year-a.year).map(r=>{const t=tone[level(r).id];return <Pressable key={r.year} accessibilityRole="button" accessibilityLabel={`${r.year} ${level(r).label}`} onPress={()=>setOpen(r)} style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:6,paddingVertical:6}}><View style={{width:6,height:6,borderRadius:3,backgroundColor:t.text}}/><Text style={{color:t.text,fontSize:14,fontWeight:'600'}}>{r.year}</Text></Pressable>;})}</View></View>)}</Card>)}
 </Page>;
}
