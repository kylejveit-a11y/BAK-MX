// Specs on the phone, in rider words: the values riders look up most, their own settings next to stock, then every
// published value grouped by part of the bike, one plain row each. Same wording rules as the website (shared/specs-view).
import React,{useEffect,useMemo,useState} from 'react';
import {Linking,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {api} from './api';
import {Card,Copy,Eyebrow,Field,Icon,LinkAction,Notice,colors} from './ui';
import type {Bike,Claim} from '../../../shared/types';
import {specRows,groupSpecRows,quickSpecs,oilSummary,yourSettings,SPEC_KINDS,type SpecRow} from '../../../shared/specs-view';
import type {FactKind} from '../../../shared/fact-system';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const label={color:'#9aa2ae',fontSize:11,fontWeight:'800' as const,letterSpacing:1.5};

function Row({r,open,onToggle}:{r:SpecRow;open:boolean;onToggle:()=>void}){
 const long=r.value.length>28;
 return <View style={{borderTopWidth:1,borderTopColor:colors.line}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} accessibilityLabel={`${r.name}, ${r.value||'no value'}`} onPress={onToggle} style={{paddingVertical:11,flexDirection:long?'column':'row',justifyContent:'space-between',alignItems:long?'flex-start':'center',gap:long?3:12}}>
   <Text style={{color:colors.text,fontSize:15,lineHeight:21,flex:long?undefined:1}}>{r.name}</Text>
   <Text selectable style={{color:colors.text,fontSize:15,lineHeight:21,fontWeight:'700',textAlign:long?'left':'right',maxWidth:long?undefined:'48%'}}>{r.value||'—'}</Text>
  </Pressable>
  {open&&<View style={{paddingBottom:12,gap:6}}>
   {!!r.note&&<Copy>{r.note}</Copy>}
   <Text style={{color:colors.muted,fontSize:12.5,lineHeight:18}}>{r.c.model_year} · {r.c.variant} · {r.c.region} · from the maker’s published manual{r.c.source_locator?` · ${r.c.source_locator}`:''}</Text>
   {r.c.source_url?.startsWith('https://')&&<LinkAction title="Open source" onPress={()=>{void Linking.openURL(r.c.source_url).catch(()=>{});}}/>}
  </View>}
 </View>;
}

export function SpecsView({bike,onGarage}:{bike?:Bike;onGarage:()=>void}){
 const [claims,setClaims]=useState<Claim[]|null>(null),[notice,setNotice]=useState(''),[kind,setKind]=useState<FactKind|'all'>('all'),[find,setFind]=useState(''),[open,setOpen]=useState(''),[shut,setShut]=useState<Record<string,boolean>>({});
 useEffect(()=>{let live=true;setClaims(null);setNotice('');setFind('');setOpen('');if(bike)api<Claim[]>(`/api/claims?bike_id=${bike.id}`).then(r=>{if(!live)return;setClaims(r);if(!r.length)setNotice(`Specs for the ${bike.model_year} ${bike.model} aren’t loaded yet. Ask BAK can still help, and it tells you when a number isn’t published.`);}).catch(e=>{if(live){setClaims([]);setNotice(errorText(e));}});return()=>{live=false;};},[bike?.id]);
 const rows=useMemo(()=>specRows(claims??[]),[claims]);
 const quick=useMemo(()=>quickSpecs(rows),[rows]),oil=useMemo(()=>oilSummary(rows),[rows]),mine=useMemo(()=>yourSettings(rows,bike?.configuration as Record<string,unknown>|undefined),[rows,bike?.configuration]);
 const q=find.trim().toLowerCase();
 const shown=rows.filter(r=>(kind==='all'||r.kind===kind)&&(!q||(r.name+' '+r.value+' '+r.section+' '+r.c.statement).toLowerCase().includes(q)));
 const groups=groupSpecRows(shown);
 if(!bike)return null;
 if(claims===null)return <Card><Copy>Loading specs…</Copy></Card>;
 return <>
  <Notice text={notice}/>
  {!!rows.length&&<>
   {(oil||quick.length>0)&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
    {oil&&<View style={{width:'100%',padding:16,borderRadius:18,backgroundColor:'#12141a',borderWidth:1,borderColor:'rgba(255,255,255,.08)',gap:4}}><Text style={label}>ENGINE OIL</Text>{!!oil.amount&&<Text selectable style={{color:colors.text,fontSize:22,fontWeight:'800'}}>{oil.amount}</Text>}{!!oil.grade&&<Text selectable style={{color:colors.text,fontSize:15,lineHeight:21}}>{oil.grade}</Text>}</View>}
    {quick.map(t=><View key={t.label} style={{flexBasis:'47%',flexGrow:1,padding:14,borderRadius:18,backgroundColor:'#12141a',borderWidth:1,borderColor:'rgba(255,255,255,.08)',gap:4}}><Text style={label}>{t.label.toUpperCase()}</Text><Text selectable numberOfLines={3} style={{color:colors.text,fontSize:16,fontWeight:'700',lineHeight:22}}>{t.value}</Text></View>)}
   </View>}
   <Card>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Eyebrow>YOUR SETTINGS NOW</Eyebrow><Pressable accessibilityRole="button" hitSlop={8} onPress={onGarage}><Text style={{color:colors.accent,fontSize:14,fontWeight:'700'}}>{mine.any?'Update':'Add yours'}</Text></Pressable></View>
    {!mine.any&&<Copy>Add your clickers, sag and tire pressure in your Garage and they show here next to stock.</Copy>}
    {mine.list.map(y=><View key={y.key} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,borderTopWidth:1,borderTopColor:colors.line,paddingVertical:10}}><Text style={{color:colors.text,fontSize:15,flex:1}}>{y.label}</Text><View style={{alignItems:'flex-end',maxWidth:'55%'}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{y.mine||'—'}</Text>{!!y.stock&&<Text style={{color:colors.muted,fontSize:12.5}}>stock {y.stock}</Text>}</View></View>)}
   </Card>
   <Card>
    <Copy strong>Everything published for this bike</Copy>
    <Copy>{rows.length} values. Tap one for its conditions and source. A value that isn’t here is unknown, not zero.</Copy>
    <Field label="Search" value={find} onChangeText={setFind} returnKeyType="search" placeholder="Rear axle nut, fork oil, chain slack…"/>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{SPEC_KINDS.map(k=>{const on=kind===k.k;return <Pressable key={k.k} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setKind(k.k)} style={{paddingHorizontal:14,height:34,borderRadius:17,justifyContent:'center',borderWidth:1,borderColor:on?colors.accent:'rgba(255,255,255,.12)',backgroundColor:on?'rgba(255,255,255,.06)':'transparent'}}><Text style={{color:colors.text,fontSize:14,fontWeight:on?'700':'500'}}>{k.label}</Text></Pressable>;})}</View>
    {!groups.length&&<Copy>Nothing published matches that for this exact bike.</Copy>}
   </Card>
   {groups.map(g=>{const closed=q?false:(shut[g.s]??groups.length>3);return <Card key={g.s}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:!closed}} onPress={()=>setShut(o=>({...o,[g.s]:!closed}))} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:36}}><Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{g.s} <Text style={{color:colors.muted,fontWeight:'500',fontSize:14}}>{g.items.length}</Text></Text><Icon name={closed?'chevronRight':'chevronDown'} size={17} color={colors.accent}/></Pressable>
    {!closed&&g.items.map(r=><Row key={r.c.id} r={r} open={open===r.c.id} onToggle={()=>setOpen(open===r.c.id?'':r.c.id)}/>)}
   </Card>;})}
  </>}
 </>;
}
