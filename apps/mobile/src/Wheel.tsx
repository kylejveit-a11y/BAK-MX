// Full-screen selector: search, a snapping wheel with a lit center row, and step-by-step drilling (make → model → year).
// Replaces the stock iOS picker everywhere so choosing things feels like one deliberate tool.
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Animated,FlatList,Modal,StyleSheet,Text,TextInput,View,useWindowDimensions,type NativeScrollEvent,type NativeSyntheticEvent} from 'react-native';
import {Pressable} from './Touch';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {Icon} from './Icon';

export type Option={value:string;label:string;detail?:string};
const ROW=54;
const C={bg:'#060609',text:'#f6f7f9',muted:'#adb5c1',dim:'#7d8593',line:'#232833',band:'#14171d',accent:'#6AA4FF',primary:'#2F74E8'};
const tick=()=>{void Haptics.selectionAsync().catch(()=>{});};

type SheetProps={visible:boolean;step?:string;title:string;options:Option[];value?:string;onPick:(value:string)=>void;onClose:()=>void;back?:{label:string;onPress:()=>void};footer?:{label:string;onPress:()=>void};searchPlaceholder?:string};

/** One step of the selector. Scroll to move the lit row; tap it (or any row) to choose. */
export function WheelSheet({visible,step,title,options,value,onPick,onClose,back,footer,searchPlaceholder}:SheetProps){
 const insets=useSafeAreaInsets(),{height}=useWindowDimensions();
 const [q,setQ]=useState('');
 useEffect(()=>{if(visible)setQ('');},[visible,title]);
 const list=useMemo(()=>{const t=q.trim().toLowerCase();return t?options.filter(o=>`${o.label} ${o.detail??''}`.toLowerCase().includes(t)):options;},[options,q]);
 const searchable=options.length>8;
 const wheelH=Math.max(ROW*5,Math.min(ROW*7,height-insets.top-insets.bottom-(searchable?300:250)));
 const pad=(wheelH-ROW)/2;
 const y=useRef(new Animated.Value(0)).current,ref=useRef<FlatList<Option>>(null);
 const [center,setCenter]=useState(0);
 const centerRef=useRef(0);
 // Start on the current value each time a step opens.
 useEffect(()=>{if(!visible)return;const i=Math.max(0,list.findIndex(o=>o.value===value));centerRef.current=i;setCenter(i);y.setValue(i*ROW);requestAnimationFrame(()=>ref.current?.scrollToOffset({offset:i*ROW,animated:false}));},[visible,title,list.length]);
 const onScroll=Animated.event([{nativeEvent:{contentOffset:{y}}}],{useNativeDriver:true,listener:(e:NativeSyntheticEvent<NativeScrollEvent>)=>{const i=Math.max(0,Math.min(list.length-1,Math.round(e.nativeEvent.contentOffset.y/ROW)));if(i!==centerRef.current){centerRef.current=i;setCenter(i);tick();}}});
 const choose=(i:number)=>{const o=list[i];if(!o)return;if(i!==centerRef.current){ref.current?.scrollToOffset({offset:i*ROW,animated:true});return;}void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});onPick(o.value);};
 return <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent onRequestClose={onClose} statusBarTranslucent>
  <View style={[st.sheet,{paddingTop:insets.top+10,paddingBottom:insets.bottom+12}]}>
   <View style={st.top}>
    <Text style={st.step}>{step??''}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={onClose} style={({pressed})=>[st.close,pressed&&{opacity:0.6}]}><Icon name="close" size={18} color={C.text} weight={2}/></Pressable>
   </View>
   <Text style={st.title} numberOfLines={2}>{title}</Text>
   {back?<Pressable accessibilityRole="button" onPress={back.onPress} hitSlop={8} style={{alignSelf:'flex-start',paddingVertical:6}}><View style={{flexDirection:'row',alignItems:'center',gap:4}}><Icon name="chevronLeft" size={16} color={C.accent} weight={2.1}/><Text style={{color:C.accent,fontWeight:'600',fontSize:14}}>{back.label}</Text></View></Pressable>:<View style={{height:6}}/>}
   {searchable&&<View style={st.search}><Icon name="search" size={17} color={C.muted}/><TextInput value={q} onChangeText={setQ} placeholder={searchPlaceholder??'Search'} placeholderTextColor={C.dim} style={st.searchInput} autoCorrect={false} autoCapitalize="none" clearButtonMode="while-editing" accessibilityLabel="Search"/></View>}
   <View style={{flex:1,justifyContent:'center'}}>
   <View style={{height:wheelH,justifyContent:'center'}}>
    <View pointerEvents="none" style={[st.band,{top:pad}]}/>
    <View pointerEvents="none" style={{position:'absolute',left:2,top:pad+ROW/2-1.5,width:14,height:3,borderRadius:1,backgroundColor:C.accent,transform:[{skewX:'-24deg'}]}}/>
    {list.length===0?<Text style={{color:C.muted,textAlign:'center',fontSize:15}}>Nothing matches “{q.trim()}”.</Text>:
    <Animated.FlatList ref={ref} data={list} keyExtractor={o=>o.value||'__none'} showsVerticalScrollIndicator={false} snapToInterval={ROW} decelerationRate="fast" onScroll={onScroll} scrollEventThrottle={16}
     contentContainerStyle={{paddingVertical:pad}} getItemLayout={(_,i)=>({length:ROW,offset:ROW*i,index:i})} keyboardShouldPersistTaps="handled" initialNumToRender={30}
     renderItem={({item,index})=>{const r=[(index-3)*ROW,(index-1)*ROW,index*ROW,(index+1)*ROW,(index+3)*ROW];
      const opacity=y.interpolate({inputRange:r,outputRange:[0.12,0.45,1,0.45,0.12],extrapolate:'clamp'});
      const scale=y.interpolate({inputRange:r,outputRange:[0.86,0.93,1,0.93,0.86],extrapolate:'clamp'});
      const on=index===center;
      return <Pressable accessibilityRole="button" accessibilityState={{selected:item.value===value}} accessibilityLabel={item.label} haptic={false} onPress={()=>choose(index)} style={{height:ROW,justifyContent:'center'}}>
       <Animated.View style={{opacity,transform:[{scale}],alignItems:'center',alignSelf:'stretch',paddingHorizontal:14}}>
        {item.label.length>26?<Text numberOfLines={2} style={{color:C.text,fontSize:on?16.5:15.5,lineHeight:on?19:18,fontWeight:on?'700':'500',textAlign:'center',letterSpacing:-0.2}}>{item.label}</Text>:<Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.62} style={{color:C.text,fontSize:on?22:20,fontWeight:on?'700':'500',letterSpacing:-0.3}}>{item.label}</Text>}
        {!!item.detail&&on&&item.label.length<=40&&<Text numberOfLines={1} style={{color:C.muted,fontSize:12,marginTop:1}}>{item.detail}</Text>}
       </Animated.View>
      </Pressable>;}}/>}
   </View>
   <Text style={st.hint}>{list.length?'TAP THE CENTER ROW TO CHOOSE':''}</Text>
   </View>
   <View style={st.bottom}>
    {footer?<Pressable accessibilityRole="button" onPress={footer.onPress} hitSlop={8}><Text style={{color:C.muted,fontWeight:'600',fontSize:14}}>{footer.label}</Text></Pressable>:<View/>}
    <Pressable haptic={false} accessibilityRole="button" disabled={!list.length} onPress={()=>choose(center)} style={({pressed})=>[st.choose,(pressed||!list.length)&&{opacity:0.6}]}><Text style={{color:'#ffffff',fontWeight:'800',fontSize:15}}>Choose</Text></Pressable>
   </View>
  </View>
 </Modal>;
}

/** Compact field row that opens the wheel. Same props as the old Select, so every screen gets it. */
export function WheelSelect({label,value,options,onChange,disabled=false,placeholder,inline=false}:{label:string;value:string;options:Option[];onChange:(v:string)=>void;disabled?:boolean;placeholder?:string;inline?:boolean}){
 const [open,setOpen]=useState(false);
 const current=options.find(o=>o.value===value);
 const shown=current&&current.value!==''?current.label:(placeholder??current?.label??'Choose');
 const empty=!current||current.value==='';
 const row=inline?
  <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${shown}`} accessibilityState={{disabled}} disabled={disabled} onPress={()=>setOpen(true)} style={({pressed})=>[st.pill,(pressed||disabled)&&{opacity:0.55}]}>
   <Text numberOfLines={1} style={{color:C.text,fontSize:14,fontWeight:'600',flexShrink:1}}>{shown}</Text><Icon name="chevronDown" size={14} color={C.muted} weight={2}/>
  </Pressable>:
  <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${shown}`} accessibilityState={{disabled}} disabled={disabled} onPress={()=>setOpen(true)} style={({pressed})=>[st.row,(pressed||disabled)&&{opacity:0.55}]}>
   <View style={{flex:1,gap:3}}><Text style={st.rowLabel}>{label}</Text><Text numberOfLines={1} style={{color:empty?C.muted:C.text,fontSize:17,fontWeight:empty?'500':'600'}}>{shown}</Text></View>
   <Icon name="expand" size={18} color={C.muted}/>
  </Pressable>;
 return <>{row}<WheelSheet visible={open} title={label} options={options} value={value} onClose={()=>setOpen(false)} onPick={v=>{setOpen(false);onChange(v);}}/></>;
}

/** Make → model → year in one flow, with a step back at each stage. */
export function BikeWheel({visible,makes,modelsFor,yearsFor,initial,onDone,onClose,footer}:{visible:boolean;makes:string[];modelsFor:(make:string)=>string[];yearsFor:(make:string,model:string)=>number[];initial?:{make?:string;model?:string;year?:string};onDone:(b:{make:string;model:string;year:string})=>void;onClose:()=>void;footer?:{label:string;onPress:()=>void}}){
 const [stage,setStage]=useState<0|1|2>(0),[make,setMake]=useState(initial?.make??''),[model,setModel]=useState(initial?.model??'');
 useEffect(()=>{if(visible){setStage(0);setMake(initial?.make??'');setModel(initial?.model??'');}},[visible]);
 const close=()=>onClose();
 if(stage===0)return <WheelSheet visible={visible} step="01 / MAKE" title="Your bike." options={makes.map(m=>({value:m,label:m}))} value={make} onClose={close} footer={footer} searchPlaceholder="Search makes" onPick={m=>{setMake(m);if(m!==make)setModel('');setStage(1);}}/>;
 if(stage===1){const list=modelsFor(make);return <WheelSheet visible={visible} step="02 / MODEL" title={make} options={list.map(m=>({value:m,label:m,detail:(()=>{const y=yearsFor(make,m);return y.length?`${Math.min(...y)}–${Math.max(...y)}`:'';})()}))} value={model} onClose={close} back={{label:'Change make',onPress:()=>setStage(0)}} footer={footer} searchPlaceholder={`Search ${make} models`} onPick={m=>{setModel(m);setStage(2);}}/>;}
 const years=[...yearsFor(make,model)].sort((a,b)=>b-a);
 return <WheelSheet visible={visible} step="03 / YEAR" title={`${make} ${model}`} options={years.map(y=>({value:String(y),label:String(y)}))} value={initial?.make===make&&initial?.model===model?initial?.year:String(years[0]??'')} onClose={close} back={{label:'Change model',onPress:()=>setStage(1)}} footer={footer} onPick={y=>onDone({make,model,year:y})}/>;
}

const st=StyleSheet.create({
 sheet:{flex:1,backgroundColor:C.bg,paddingHorizontal:22},
 top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:36},
 step:{color:C.muted,fontSize:11.5,fontWeight:'700',letterSpacing:1.6},
 close:{width:34,height:34,borderRadius:17,borderWidth:1,borderColor:'#2a2f39',alignItems:'center',justifyContent:'center'},
 title:{color:C.text,fontSize:32,fontWeight:'900',fontStyle:'italic',letterSpacing:-1.1,marginTop:8},
 search:{flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#2a2f39',marginTop:8},
 searchInput:{flex:1,color:C.text,fontSize:16,paddingVertical:11},
 band:{position:'absolute',left:0,right:0,height:ROW,borderTopWidth:1,borderBottomWidth:1,borderColor:'#343a45'},
 hint:{color:C.dim,fontSize:10.5,letterSpacing:1.6,fontWeight:'700',textAlign:'center',marginTop:12},
 bottom:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 choose:{backgroundColor:C.primary,borderRadius:24,paddingHorizontal:26,paddingVertical:13},
 row:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.line},
 rowLabel:{color:C.muted,fontSize:12.5,fontWeight:'600'},
 pill:{flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:'#2f3540',borderRadius:18,paddingHorizontal:13,paddingVertical:7,maxWidth:'100%'},
});
