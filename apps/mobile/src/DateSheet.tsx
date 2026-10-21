// Date and time selector: month / day / year wheels (plus hour / minute / AM-PM for events), quick picks for the days
// riders actually use, and a plain-English readout. Values stay "YYYY-MM-DD" or "YYYY-MM-DD HH:MM" for the API.
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {FlatList,Modal,Pressable,StyleSheet,Text,View,type NativeScrollEvent,type NativeSyntheticEvent} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {Icon} from './Icon';

const ROW=46,VISIBLE=5;
const C={bg:'#060609',text:'#f6f7f9',muted:'#9aa2af',dim:'#6b7380',accent:'#6AA4FF',primary:'#2F74E8',line:'#2a2f39'};
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pad2=(n:number)=>String(n).padStart(2,'0');
const daysIn=(y:number,m:number)=>new Date(y,m+1,0).getDate();

type Parts={y:number;m:number;d:number;h:number;min:number};
export function parseValue(v:string):Parts|null{const x=/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(v.trim());if(!x)return null;return {y:+x[1],m:+x[2]-1,d:+x[3],h:x[4]?+x[4]:9,min:x[5]?+x[5]:0};}
const toValue=(p:Parts,time:boolean)=>`${p.y}-${pad2(p.m+1)}-${pad2(p.d)}`+(time?` ${pad2(p.h)}:${pad2(p.min)}`:'');
const fromDate=(d:Date,h=9,min=0):Parts=>({y:d.getFullYear(),m:d.getMonth(),d:d.getDate(),h,min});
/** "Sat, Oct 24 · 9:00 AM" (year only when it isn't this year). */
export function formatValue(v:string,time:boolean){const p=parseValue(v);if(!p)return '';const d=new Date(p.y,p.m,p.d);const day=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',...(p.y!==new Date().getFullYear()?{year:'numeric'}:{})});if(!time)return day;const h12=p.h%12||12;return `${day} · ${h12}:${pad2(p.min)} ${p.h<12?'AM':'PM'}`;}

/** One snapping column. */
function Column({items,index,onIndex,width}:{items:string[];index:number;onIndex:(i:number)=>void;width:number|`${number}%`}){
 const ref=useRef<FlatList<string>>(null),cur=useRef(index),settled=useRef(false);
 useEffect(()=>{if(cur.current!==index||!settled.current){cur.current=index;settled.current=true;requestAnimationFrame(()=>ref.current?.scrollToOffset({offset:index*ROW,animated:false}));}},[index,items.length]);
 const onScroll=(e:NativeSyntheticEvent<NativeScrollEvent>)=>{const i=Math.max(0,Math.min(items.length-1,Math.round(e.nativeEvent.contentOffset.y/ROW)));if(i!==cur.current){cur.current=i;void Haptics.selectionAsync().catch(()=>{});onIndex(i);}};
 return <FlatList ref={ref} data={items} style={{width,height:ROW*VISIBLE,flexGrow:0}} keyExtractor={(x,i)=>x+i} showsVerticalScrollIndicator={false} snapToInterval={ROW} decelerationRate="fast" onScroll={onScroll} scrollEventThrottle={16}
  contentContainerStyle={{paddingVertical:ROW*(VISIBLE-1)/2}} getItemLayout={(_,i)=>({length:ROW,offset:ROW*i,index:i})} initialNumToRender={40}
  renderItem={({item,index:i})=>{const dist=Math.abs(i-index);return <Pressable onPress={()=>ref.current?.scrollToOffset({offset:i*ROW,animated:true})} style={{height:ROW,alignItems:'center',justifyContent:'center'}}><Text style={{color:C.text,opacity:dist===0?1:dist===1?0.42:0.16,fontSize:dist===0?21:19,fontWeight:dist===0?'700':'500'}}>{item}</Text></Pressable>;}}/>;
}

export function DateSheet({visible,title,value,time=false,years,quick,onDone,onClose,onClear}:{visible:boolean;title:string;value:string;time?:boolean;years:[number,number];quick?:{label:string;date:Date}[];onDone:(v:string)=>void;onClose:()=>void;onClear?:()=>void}){
 const insets=useSafeAreaInsets();
 const start=()=>parseValue(value)??fromDate(new Date());
 const [p,setP]=useState<Parts>(start);
 useEffect(()=>{if(visible)setP(start());},[visible]);
 const yearList=useMemo(()=>{const out:number[]=[];for(let y=years[0];y<=years[1];y++)out.push(y);return out;},[years[0],years[1]]);
 const set=(patch:Partial<Parts>)=>setP(old=>{const n={...old,...patch};n.d=Math.min(n.d,daysIn(n.y,n.m));return n;});
 const days=Array.from({length:daysIn(p.y,p.m)},(_,i)=>String(i+1));
 const hours=Array.from({length:12},(_,i)=>String(i+1)),mins=Array.from({length:12},(_,i)=>pad2(i*5));
 const h12=(p.h%12||12),pm=p.h>=12;
 const setHour=(i:number)=>{const v=i+1;set({h:(v%12)+(pm?12:0)});};
 const setPm=(i:number)=>set({h:(p.h%12)+(i===1?12:0)});
 const readout=formatValue(toValue(p,time),time);
 return <Modal visible={visible} animationType="fade" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
  <View style={[st.sheet,{paddingTop:insets.top+10,paddingBottom:insets.bottom+12}]}>
   <View style={st.top}><Text style={st.step}>{time?'DATE AND TIME':'DATE'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={onClose} style={({pressed})=>[st.close,pressed&&{opacity:0.6}]}><Icon name="close" size={18} color={C.text} weight={2}/></Pressable></View>
   <Text style={st.title}>{title}</Text>
   <Text style={st.readout} accessibilityLiveRegion="polite">{readout}</Text>
   {!!quick?.length&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:14}}>{quick.map(q=>{const on=q.date.getFullYear()===p.y&&q.date.getMonth()===p.m&&q.date.getDate()===p.d;return <Pressable key={q.label} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>{void Haptics.selectionAsync().catch(()=>{});set({y:q.date.getFullYear(),m:q.date.getMonth(),d:q.date.getDate()});}} style={({pressed})=>({paddingHorizontal:14,paddingVertical:8,borderRadius:18,borderWidth:1,borderColor:on?C.primary:'#343a45',backgroundColor:on?C.primary:'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':C.text,fontWeight:on?'700':'500',fontSize:14}}>{q.label}</Text></Pressable>;})}</View>}
   <View style={{flex:1,justifyContent:'center',gap:26}}>
    <Wheels>
     <Column width="34%" items={MONTHS} index={p.m} onIndex={i=>set({m:i})}/>
     <Column width="26%" items={days} index={p.d-1} onIndex={i=>set({d:i+1})}/>
     <Column width="34%" items={yearList.map(String)} index={Math.max(0,yearList.indexOf(p.y))} onIndex={i=>set({y:yearList[i]})}/>
    </Wheels>
    {time&&<Wheels>
     <Column width="30%" items={hours} index={h12-1} onIndex={setHour}/>
     <Column width="30%" items={mins} index={Math.min(11,Math.round(p.min/5))} onIndex={i=>set({min:i*5})}/>
     <Column width="30%" items={['AM','PM']} index={pm?1:0} onIndex={setPm}/>
    </Wheels>}
   </View>
   <View style={st.bottom}>
    {onClear?<Pressable accessibilityRole="button" hitSlop={8} onPress={onClear}><Text style={{color:C.muted,fontWeight:'600',fontSize:14}}>Clear</Text></Pressable>:<View/>}
    <Pressable accessibilityRole="button" onPress={()=>{void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});onDone(toValue(p,time));}} style={({pressed})=>[st.choose,pressed&&{opacity:0.7}]}><Text style={{color:'#ffffff',fontWeight:'800',fontSize:15}}>Set</Text></Pressable>
   </View>
  </View>
 </Modal>;
}
function Wheels({children}:{children:React.ReactNode}){return <View style={{height:ROW*VISIBLE,justifyContent:'center'}}>
 <View pointerEvents="none" style={[st.band,{top:ROW*(VISIBLE-1)/2}]}/>
 <View pointerEvents="none" style={{position:'absolute',left:2,top:ROW*(VISIBLE-1)/2+ROW/2-1.5,width:14,height:3,borderRadius:1,backgroundColor:C.accent,transform:[{skewX:'-24deg'}]}}/>
 <View style={{flexDirection:'row',justifyContent:'space-between'}}>{children}</View></View>;}

/** Field row that opens the date sheet. */
export function DateField({label,value,onChange,time=false,optional=false,years,quick,disabled=false}:{label:string;value:string;onChange:(v:string)=>void;time?:boolean;optional?:boolean;years:[number,number];quick?:{label:string;date:Date}[];disabled?:boolean}){
 const [open,setOpen]=useState(false);
 const shown=value?formatValue(value,time):'';
 return <>
  <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${shown||'not set'}`} disabled={disabled} onPress={()=>setOpen(true)} style={({pressed})=>[st.row,(pressed||disabled)&&{opacity:0.55}]}>
   <View style={{flex:1,gap:3}}><Text style={st.rowLabel}>{label}</Text><Text style={{color:shown?C.text:C.dim,fontSize:17,fontWeight:shown?'600':'500'}}>{shown||(optional?'Optional':'Choose')}</Text></View>
   <Icon name={time?'clock':'calendar'} size={20} color={C.muted}/>
  </Pressable>
  <DateSheet visible={open} title={label} value={value} time={time} years={years} quick={quick} onClose={()=>setOpen(false)} onDone={v=>{setOpen(false);onChange(v);}} onClear={optional&&value?()=>{setOpen(false);onChange('');}:undefined}/>
 </>;
}
/** Ride-day shortcuts: today, tomorrow and the coming weekend. */
export function rideDays(){const t=new Date();t.setHours(0,0,0,0);const add=(n:number)=>{const d=new Date(t);d.setDate(d.getDate()+n);return d;};const sat=add((6-t.getDay()+7)%7||7),sun=add((7-t.getDay())%7||7);return [{label:'Today',date:t},{label:'Tomorrow',date:add(1)},{label:'Sat',date:t.getDay()===6?t:sat},{label:'Sun',date:t.getDay()===0?t:sun}];}
export function recentDays(){const t=new Date();t.setHours(0,0,0,0);const y=new Date(t);y.setDate(y.getDate()-1);return [{label:'Today',date:t},{label:'Yesterday',date:y}];}

const st=StyleSheet.create({
 sheet:{flex:1,backgroundColor:C.bg,paddingHorizontal:22},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:36},
 step:{color:C.muted,fontSize:11.5,fontWeight:'700',letterSpacing:1.6},
 close:{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},
 title:{color:C.text,fontSize:30,fontWeight:'900',fontStyle:'italic',letterSpacing:-1,marginTop:8},
 readout:{color:C.accent,fontSize:17,fontWeight:'700',marginTop:6},
 band:{position:'absolute',left:0,right:0,height:ROW,borderTopWidth:1,borderBottomWidth:1,borderColor:'#343a45'},
 bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 choose:{backgroundColor:C.primary,borderRadius:24,paddingHorizontal:30,paddingVertical:13},
 row:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#232833'},
 rowLabel:{color:C.muted,fontSize:12.5,fontWeight:'600'},
});
