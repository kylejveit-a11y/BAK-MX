import React from 'react';
import {Text,View,Image,TextInput,ScrollView,StyleSheet,type TextInputProps} from 'react-native';
import {Pressable} from './Touch';
import {HeaderHeightContext} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WheelSelect} from './Wheel';
import {BottomTabBarHeightContext} from '@react-navigation/bottom-tabs';
import {Glass,useKeyboardHeight,useTabSpace} from './Glass';
import {Icon,type IconName} from './Icon';
import {BlueFace,blueLift,onBlueText} from './BlueFace';
export {BlueFace,blueLift,onBlueText};
export {Icon,type IconName};
export const colors={bg:'#060609',panel:'#121418',text:'#f6f7f9',muted:'#adb4bf',primary:'#2F74E8',accent:'#6AA4FF',line:'#292e37'};
/** Screen body. Content runs edge to edge under the floating glass header and tab bar.
 safeTop pads under the status bar on screens with no header; footer floats as a glass bar above the tab bar or keyboard. */
export function Page({title,children,safeTop=false,footer,scrollRef}:{title:string;children:React.ReactNode;safeTop?:boolean;footer?:React.ReactNode;scrollRef?:React.Ref<ScrollView>}){
 const insets=useSafeAreaInsets(),header=React.useContext(HeaderHeightContext)??0,inTabs=React.useContext(BottomTabBarHeightContext)!==undefined;
 const tabSpace=useTabSpace(),kb=useKeyboardHeight(),[footH,setFootH]=React.useState(0);
 const bottomChrome=inTabs?tabSpace:insets.bottom;
 const footBottom=kb>0?kb+8:bottomChrome+10;
 return <View style={{flex:1,backgroundColor:colors.bg}}>
  <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets={!footer} scrollIndicatorInsets={{top:header,bottom:bottomChrome}}
   contentContainerStyle={[s.page,{paddingTop:(safeTop?insets.top:header)+16,paddingBottom:(footer?footH+footBottom:bottomChrome)+28}]}>
   {title?<PageTitle>{title}</PageTitle>:null}{children}
  </ScrollView>
  {footer?<View onLayout={e=>setFootH(e.nativeEvent.layout.height)} pointerEvents="box-none" style={{position:'absolute',left:12,right:12,bottom:footBottom}}><Glass strong style={{borderRadius:26}}>{footer}</Glass></View>:null}
 </View>;
}
/** Page title: heavy italic with a raked accent stripe, the BAK MX signature. */
export function PageTitle({children}:{children:React.ReactNode}){return <View style={{gap:9}}><Text style={s.title}>{children}</Text><View style={{flexDirection:'row',gap:4}}><View style={{width:26,height:3,borderRadius:1,backgroundColor:colors.accent,transform:[{skewX:'-24deg'}]}}/><View style={{width:8,height:3,borderRadius:1,backgroundColor:colors.accent,opacity:0.45,transform:[{skewX:'-24deg'}]}}/></View></View>}
/** A section: a hairline above, room around it. No boxes. */
export function Card({children}:{children:React.ReactNode}){return <View style={s.card}>{children}</View>}
export function Copy({children,strong=false}:{children:React.ReactNode;strong?:boolean}){return <Text selectable style={[s.copy,strong&&{color:colors.text,fontWeight:'700',fontSize:18}]}>{children}</Text>}
/** Primary: solid steel pill. Secondary: outline pill. Disabled reads as inactive, not broken. */
export function Button({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){return <Pressable haptic={secondary?'tap':'press'} accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.ghost,!secondary&&!disabled&&[blueLift,pressed&&{shadowOpacity:0.3,transform:[{translateY:1}]}],disabled&&(secondary?{borderColor:'#1f232b'}:{backgroundColor:'#16191f'}),secondary&&pressed&&{opacity:0.6}]}>{({pressed})=><>{!secondary&&!disabled&&<BlueFace radius={28} pressed={pressed}/>}<Text style={[{color:disabled?'#6b7380':secondary?colors.text:'#ffffff',fontSize:16,fontWeight:'700',textAlign:'center'},!secondary&&!disabled&&onBlueText]}>{title}</Text></>}</Pressable>}
/** Text field: label above, value on an underline. */
export function Field({label,...props}:TextInputProps&{label:string}){const [focus,setFocus]=React.useState(false);return <View style={{gap:4}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#6b7380" autoCapitalize="none" selectionColor={colors.accent} {...props} onFocus={e=>{setFocus(true);props.onFocus?.(e);}} onBlur={e=>{setFocus(false);props.onBlur?.(e);}} style={[s.input,focus&&{borderBottomColor:colors.accent},props.multiline&&{minHeight:72,textAlignVertical:'top'},props.style]}/></View>}
export function Select(props:{disabled?:boolean;label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void;placeholder?:string;inline?:boolean}){return <WheelSelect {...props}/>}
/** Status line: raked accent mark and text. No box. */
export function Notice({text}:{text:string}){return text?<View accessibilityLiveRegion="polite" style={{flexDirection:'row',gap:10,alignItems:'flex-start'}}><View style={{width:3,height:16,marginTop:3,borderRadius:1,backgroundColor:colors.accent,transform:[{skewX:'-18deg'}]}}/><Text style={{color:colors.text,lineHeight:21,fontSize:14.5,flex:1}}>{text}</Text></View>:null}
export const s=StyleSheet.create({page:{padding:20,paddingBottom:40,gap:18},eyebrow:{color:'#868e9b',fontWeight:'600',letterSpacing:1,fontSize:11.5},title:{fontSize:32,color:colors.text,fontWeight:'900',fontStyle:'italic',letterSpacing:-1.1},card:{paddingTop:22,paddingBottom:6,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',gap:12},copy:{color:colors.muted,fontSize:15,lineHeight:23},button:{backgroundColor:'transparent',borderRadius:28,paddingVertical:15,paddingHorizontal:20,minHeight:50,justifyContent:'center'},ghost:{backgroundColor:'transparent',borderWidth:1,borderColor:'#343a45'},label:{color:'#9aa2af',fontSize:12.5,fontWeight:'600'},input:{borderBottomWidth:1,borderBottomColor:'#2a2f39',paddingVertical:10,color:colors.text,fontSize:17,minHeight:44}});

/** BAK MX in the brushed-metal lettering of the app icon. */
export function Brand({compact=false}:{compact?:boolean}){const h=compact?26:40;return <View accessible accessibilityRole="header" accessibilityLabel="BAK MX" style={{gap:9}}><Image source={require('../assets/bak-mx-wordmark.png')} accessibilityIgnoresInvertColors style={{height:h,width:h*720/121}} resizeMode="contain"/>{!compact&&<Text style={{color:'#8f97a4',fontWeight:'700',fontSize:10,letterSpacing:4}}>BAK STRONG</Text>}</View>}

/** Small label above a section heading. */
export function Eyebrow({children}:{children:React.ReactNode}){return <Text style={s.eyebrow}>{children}</Text>}
/** Status: done (tick) or still to do (dot). */
export function Chip({label,done}:{label:string;done:boolean}){return <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:2,marginRight:6}}>{done?<Icon name="check" size={14} color="#9fdcb3" weight={2.2}/>:<View style={{width:6,height:6,borderRadius:3,backgroundColor:'#58606e',marginHorizontal:4}}/>}<Text style={{color:done?'#d8f0df':'#a7afbd',fontSize:13}}>{label}</Text></View>}
/** Open list row: icon, title, one short line, and a chevron (or plus). Hairline below. */
export function Tile({icon,title,detail,onPress,trailing='chevron',right}:{icon?:IconName|React.ReactNode;title:string;detail?:string;onPress:()=>void;trailing?:'chevron'|'plus'|'none';right?:string}){return <Pressable accessibilityRole="button" accessibilityLabel={title+(detail?'. '+detail:'')} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:14,paddingVertical:15,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#2a2f39',opacity:pressed?0.6:1})}>{typeof icon==='string'?<Icon name={icon as IconName} size={22} color="#a1a8b4"/>:icon}<View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{title}</Text>{!!detail&&<Text style={{color:'#9aa2af',fontSize:13,lineHeight:18}}>{detail}</Text>}</View>{!!right&&<Text style={{color:'#a1a8b4',fontSize:13.5,fontWeight:'600'}}>{right}</Text>}{trailing!=='none'&&<Icon name={trailing==='plus'?'plus':'chevronRight'} size={trailing==='plus'?20:17} color="#6b7280"/>}</Pressable>}
export function TileGrid({children}:{children:React.ReactNode}){return <View style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',marginTop:4}}>{children}</View>}
/** The home prompt: an open line that opens chat. */
export function AskBar({onPress}:{onPress:()=>void}){return <Pressable accessibilityRole="button" accessibilityLabel="Ask BAK about your bike" onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,borderRadius:28,borderWidth:1,borderColor:'#343a45',paddingVertical:8,paddingLeft:20,paddingRight:8,opacity:pressed?0.7:1})}><Text style={{color:'#c9cfd9',fontSize:16,fontWeight:'500',flex:1}}>Ask BAK about your bike…</Text><View style={[{borderRadius:20,width:40,height:40,alignItems:'center',justifyContent:'center'},blueLift]}><BlueFace radius={20}/><Icon name="arrowUp" size={20} color="#ffffff" weight={2.4}/></View></Pressable>}
/** Quiet text action: accent label with an arrow. For secondary moves under a section. */
export function LinkAction({title,onPress,icon,disabled=false,muted=false,arrow=true}:{title:string;onPress:()=>void;icon?:IconName|React.ReactNode;disabled?:boolean;muted?:boolean;arrow?:boolean}){const c=muted?'#a1a8b4':colors.accent;return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} hitSlop={6} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,opacity:pressed||disabled?0.55:1})}>{typeof icon==='string'?<Icon name={icon as IconName} size={18} color={c}/>:icon}<Text style={{color:c,fontSize:15,fontWeight:'700'}}>{title}</Text>{arrow&&<Icon name="arrowRight" size={16} color={c} weight={2}/>}</Pressable>}
/** Round initial for a rider. */
export function Avatar({name,size=40,uri}:{name:string;size?:number;uri?:string|null}){if(uri)return <Image source={{uri}} accessibilityIgnoresInvertColors style={{width:size,height:size,borderRadius:size/2,backgroundColor:'#14171d'}}/>;return <View style={{width:size,height:size,borderRadius:size/2,borderWidth:1,borderColor:'#343a45',alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.text,fontWeight:'800',fontStyle:'italic',fontSize:size*0.4}}>{name.replace('@','').slice(0,1).toUpperCase()}</Text></View>}
/** Heading row for a form or section with a quiet action on the right. */
export function SectionHead({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Text style={{color:colors.text,fontSize:19,fontWeight:'800'}}>{title}</Text>{!!action&&<Pressable accessibilityRole="button" hitSlop={10} onPress={onAction}><Text style={{color:'#9aa2af',fontSize:15,fontWeight:'600'}}>{action}</Text></Pressable>}</View>}
/** Back to the previous list. */
export function BackLink({title,onPress}:{title:string;onPress:()=>void}){return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:4,alignSelf:'flex-start',paddingVertical:4,opacity:pressed?0.55:1})}><Icon name="chevronLeft" size={17} color={colors.accent} weight={2.1}/><Text style={{color:colors.accent,fontSize:15,fontWeight:'600'}}>{title}</Text></Pressable>}
/** Small icon + label action, e.g. likes and comments. */
export function IconAction({icon,label,onPress,active=false,danger=false}:{icon:IconName;label:string;onPress:()=>void;active?:boolean;danger?:boolean}){const c=danger?'#efb5be':active?colors.accent:'#a1a8b4';return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:active}} accessibilityLabel={label} hitSlop={8} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingVertical:6,opacity:pressed?0.55:1})}><Icon name={icon} size={18} color={c} accent={c}/><Text style={{color:c,fontSize:14,fontWeight:'600'}}>{label}</Text></Pressable>}
/** Tick box with a label. */
export function CheckRow({label,checked,onPress}:{label:string;checked:boolean;onPress:()=>void}){return <Pressable haptic="select" accessibilityRole="checkbox" accessibilityState={{checked}} onPress={onPress} hitSlop={6} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:10,paddingVertical:6,opacity:pressed?0.6:1})}><Icon name={checked?'checkboxOn':'checkbox'} size={20} color={checked?'#ffffff':'#9aa2af'} accent={colors.primary}/><Text style={{color:colors.text,fontSize:15,flex:1}}>{label}</Text></Pressable>}
