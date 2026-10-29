import React from 'react';
import {Animated,Text,View,Image,TextInput,ScrollView,StyleSheet,type ImageProps,type TextInputProps} from 'react-native';
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
import {colors,tint,metalHighlight,motion} from './theme';
import {useConnection} from './offline';
import {currentStore} from './api';
export {colors,tint};
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';
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
   <OfflineLine/>
   {title?<PageTitle>{title}</PageTitle>:null}{children}
  </ScrollView>
  {/* pages without a header: cover the status bar so text never scrolls up under the clock */}
  {safeTop?<TopScrim height={insets.top+22}/>:null}
  {(inTabs||footer)&&kb===0?<BottomScrim height={(footer?footH+footBottom:bottomChrome)+26}/>:null}
  {footer?<View onLayout={e=>setFootH(e.nativeEvent.layout.height)} pointerEvents="box-none" style={{position:'absolute',left:12,right:12,bottom:footBottom}}><Glass strong style={{borderRadius:26}}>{footer}</Glass></View>:null}
 </View>;
}
/** One quiet line when there's no signal or changes are waiting; nothing when all is well. */
function OfflineLine(){
 const {offline,waiting}=useConnection(currentStore());
 if(!offline&&!waiting)return null;
 const text=offline?(waiting?`No signal. Showing what’s saved on this phone; ${waiting} ${waiting===1?'change waits':'changes wait'} to send.`:'No signal. Showing what’s saved on this phone.'):`${waiting} ${waiting===1?'change waiting':'changes waiting'} to send.`;
 return <View accessibilityLiveRegion="polite" style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12,paddingVertical:8,borderRadius:10,backgroundColor:'rgba(226,189,114,0.10)',marginBottom:-6}}><View style={{width:7,height:7,borderRadius:4,backgroundColor:'#e2bd72'}}/><Text style={{color:'#f0d79a',fontSize:13,flex:1}}>{text}</Text></View>;
}
/** A raked accent mark finished like anodized metal: a bright edge on top, the colour through the middle, a deep base. */
export function MetalMark({width,height=3,dim=false,skew=-24}:{width:number;height?:number;dim?:boolean;skew?:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View style={{width,height,borderRadius:1,overflow:'hidden',opacity:dim?0.45:1,transform:[{skewX:`${skew}deg`}]}}><Svg width={width} height={height}><Defs>
  <LinearGradient id={'m'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={metalHighlight()}/><Stop offset="0.5" stopColor={colors.accent}/><Stop offset="1" stopColor={colors.primary}/></LinearGradient>
  <LinearGradient id={'h'+id} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#ffffff" stopOpacity="0"/><Stop offset="0.35" stopColor="#ffffff" stopOpacity="0.35"/><Stop offset="0.6" stopColor="#ffffff" stopOpacity="0"/></LinearGradient>
 </Defs><Rect x="0" y="0" width={width} height={height} fill={`url(#m${id})`}/><Rect x="0" y="0" width={width} height={height} fill={`url(#h${id})`}/></Svg></View>;
}
/** Your message in chat, finished like the bike's anodized colour: light on the top edge, the colour through the middle,
 *  a deep base, a brushed grain and a soft diagonal sheen. Stays dark enough that white text reads clearly. */
export function MetalBubble({children}:{children:React.ReactNode}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View style={{borderRadius:16,overflow:'hidden'}}>
  <View pointerEvents="none" style={StyleSheet.absoluteFill}><Svg width="100%" height="100%"><Defs>
   <LinearGradient id={'b'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={metalHighlight()} stopOpacity="0.30"/><Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.17"/><Stop offset="1" stopColor={colors.primary} stopOpacity="0.32"/></LinearGradient>
   <LinearGradient id={'s'+id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0.15" stopColor="#ffffff" stopOpacity="0"/><Stop offset="0.38" stopColor="#ffffff" stopOpacity="0.07"/><Stop offset="0.6" stopColor="#ffffff" stopOpacity="0"/></LinearGradient>
  </Defs><Rect x="0" y="0" width="100%" height="100%" fill={`url(#b${id})`}/><Rect x="0" y="0" width="100%" height="100%" fill={`url(#s${id})`}/></Svg>
   <Image source={require('../assets/brushed.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.07,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
   <View style={[StyleSheet.absoluteFill,{borderRadius:16,borderWidth:1,borderTopColor:'rgba(255,255,255,0.20)',borderLeftColor:tint(0.22),borderRightColor:tint(0.12),borderBottomColor:'rgba(0,0,0,0.45)'}]}/>
  </View>
  <View style={{paddingHorizontal:14,paddingVertical:10}}>{children}</View>
 </View>;
}
/** Fades the page into the background behind the floating tab bar and message box, so text never runs under them. */
/** Solid behind the status bar, fading out just below it, so text scrolls away cleanly instead of sitting under the clock. */
function TopScrim({height}:{height:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,height}}><Svg width="100%" height="100%"><Defs><LinearGradient id={'ts'+id} x1="0" y1="0" x2="0" y2="1">
  <Stop offset="0" stopColor={colors.bg} stopOpacity="1"/><Stop offset="0.7" stopColor={colors.bg} stopOpacity="0.97"/><Stop offset="1" stopColor={colors.bg} stopOpacity="0"/>
 </LinearGradient></Defs><Rect x="0" y="0" width="100%" height="100%" fill={`url(#ts${id})`}/></Svg></View>;
}
function BottomScrim({height}:{height:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={{position:'absolute',left:0,right:0,bottom:0,height}}><Svg width="100%" height="100%"><Defs><LinearGradient id={'sc'+id} x1="0" y1="0" x2="0" y2="1">
  <Stop offset="0" stopColor={colors.bg} stopOpacity="0"/><Stop offset="0.38" stopColor={colors.bg} stopOpacity="0.82"/><Stop offset="1" stopColor={colors.bg} stopOpacity="0.97"/>
 </LinearGradient></Defs><Rect x="0" y="0" width="100%" height="100%" fill={`url(#sc${id})`}/></Svg></View>;
}
/** Page title: heavy italic with a raked accent stripe, the BAK MX signature. */
export function PageTitle({children}:{children:React.ReactNode}){return <View style={{gap:9}}><Text style={s.title}>{children}</Text><View style={{flexDirection:'row',gap:4}}><MetalMark width={26}/><MetalMark width={8} dim/></View></View>}
/** A section: a hairline above, room around it. No boxes. */
export function Card({children}:{children:React.ReactNode}){return <View style={s.card}>{children}</View>}
export function Copy({children,strong=false}:{children:React.ReactNode;strong?:boolean}){return <Text selectable style={[s.copy,strong&&{color:colors.text,fontWeight:'700',fontSize:18}]}>{children}</Text>}
/** Primary: solid steel pill. Secondary: outline pill. Disabled reads as inactive, not broken. */
export function Button({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){return <Pressable haptic={secondary?'tap':'press'} accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.ghost,!secondary&&!disabled&&[blueLift,pressed&&{shadowOpacity:0.3,transform:[{translateY:1}]}],disabled&&(secondary?{borderColor:'#1f232b'}:{backgroundColor:'#16191f'}),secondary&&pressed&&{opacity:0.6}]}>{({pressed})=><>{!secondary&&!disabled&&<BlueFace radius={28} pressed={pressed}/>}<Text style={[{color:disabled?'#7d8593':secondary?colors.text:'#ffffff',fontSize:16,fontWeight:'700',textAlign:'center'},!secondary&&!disabled&&onBlueText]}>{title}</Text></>}</Pressable>}
/** Text field: label above, value on an underline. */
export function Field({label,...props}:TextInputProps&{label:string}){const [focus,setFocus]=React.useState(false);return <View style={{gap:4}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#7d8593" autoCapitalize="none" selectionColor={colors.accent} {...props} onFocus={e=>{setFocus(true);props.onFocus?.(e);}} onBlur={e=>{setFocus(false);props.onBlur?.(e);}} style={[s.input,focus&&{borderBottomColor:colors.accent},props.multiline&&{minHeight:72,textAlignVertical:'top'},props.style]}/></View>}
export function Select(props:{disabled?:boolean;label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void;placeholder?:string;inline?:boolean}){return <WheelSelect {...props}/>}
/** Status line: raked accent mark and text. No box. */
/** A message in the flow of the page. tone "warn" is for something the rider has to fix before going on. */
export function Notice({text,tone}:{text:string;tone?:'warn'}){const warn=tone==='warn';return text?<View accessibilityLiveRegion={warn?'assertive':'polite'} accessibilityRole={warn?'alert':undefined} style={[{flexDirection:'row',gap:10,alignItems:'flex-start'},warn&&{backgroundColor:'rgba(239,154,161,0.10)',borderRadius:10,paddingHorizontal:12,paddingVertical:10}]}>{warn?<Icon name="close" size={15} color="#ef9aa1" weight={2.4}/>:<View style={{width:3,height:16,marginTop:3,borderRadius:1,backgroundColor:colors.accent,transform:[{skewX:'-18deg'}]}}/>}<Text style={{color:warn?'#f6c9cd':colors.text,lineHeight:21,fontSize:14.5,flex:1,fontWeight:warn?'600':'400'}}>{text}</Text></View>:null}
export const s=StyleSheet.create({page:{padding:20,paddingBottom:40,gap:18},eyebrow:{color:'#9aa2ae',fontWeight:'600',letterSpacing:1,fontSize:11.5},title:{fontSize:32,color:colors.text,fontWeight:'900',fontStyle:'italic',letterSpacing:-1.1},card:{paddingTop:22,paddingBottom:6,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',gap:12},copy:{color:colors.muted,fontSize:15,lineHeight:23},button:{backgroundColor:'transparent',borderRadius:28,paddingVertical:15,paddingHorizontal:20,minHeight:50,justifyContent:'center'},ghost:{backgroundColor:'transparent',borderWidth:1,borderColor:'#343a45'},label:{color:'#adb5c1',fontSize:12.5,fontWeight:'600'},input:{borderBottomWidth:1,borderBottomColor:'#2a2f39',paddingVertical:10,color:colors.text,fontSize:17,minHeight:44}});

/** BAK MX in the brushed-metal lettering of the app icon. */
export function Brand({compact=false}:{compact?:boolean}){const h=compact?26:40;return <View accessible accessibilityRole="header" accessibilityLabel="BAK MX" style={{gap:9}}><Image source={require('../assets/bak-mx-wordmark.png')} accessibilityIgnoresInvertColors style={{height:h,width:h*900/139}} resizeMode="contain"/>{!compact&&<Text style={{color:'#8f97a4',fontWeight:'700',fontSize:10,letterSpacing:4}}>BAK STRONG</Text>}</View>}

/** Small label above a section heading. */
export function Eyebrow({children}:{children:React.ReactNode}){return <Text style={s.eyebrow}>{children}</Text>}
/** Status: done (tick) or still to do (dot). */
export function Chip({label,done}:{label:string;done:boolean}){return <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:2,marginRight:6}}>{done?<Icon name="check" size={14} color="#9fdcb3" weight={2.2}/>:<View style={{width:6,height:6,borderRadius:3,backgroundColor:'#58606e',marginHorizontal:4}}/>}<Text style={{color:done?'#d8f0df':'#a7afbd',fontSize:13}}>{label}</Text></View>}
/** Open list row: icon, title, one short line, and a chevron (or plus). Hairline below. */
export function Tile({icon,title,detail,onPress,trailing='chevron',right}:{icon?:IconName|React.ReactNode;title:string;detail?:string;onPress:()=>void;trailing?:'chevron'|'plus'|'none';right?:string}){return <Pressable accessibilityRole="button" accessibilityLabel={title+(detail?'. '+detail:'')} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:14,paddingVertical:15,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#2a2f39',opacity:pressed?0.6:1})}>{typeof icon==='string'?<Icon name={icon as IconName} size={22} color="#b2b9c4"/>:icon}<View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{title}</Text>{!!detail&&<Text style={{color:'#adb5c1',fontSize:13,lineHeight:18}}>{detail}</Text>}</View>{!!right&&<Text style={{color:'#b2b9c4',fontSize:13.5,fontWeight:'600'}}>{right}</Text>}{trailing!=='none'&&<Icon name={trailing==='plus'?'plus':'chevronRight'} size={trailing==='plus'?20:17} color="#7d8593"/>}</Pressable>}
export function TileGrid({children}:{children:React.ReactNode}){return <View style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',marginTop:4}}>{children}</View>}
/** The home prompt: an open line that opens chat. */
export function AskBar({onPress,onSnap}:{onPress:()=>void;onSnap?:()=>void}){return <Pressable accessibilityRole="button" accessibilityLabel="Ask BAK about your bike" onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,borderRadius:28,borderWidth:1,borderColor:'#343a45',paddingVertical:8,paddingLeft:20,paddingRight:8,opacity:pressed?0.7:1})}><Text style={{color:'#c9cfd9',fontSize:16,fontWeight:'500',flex:1}}>Ask BAK about your bike…</Text>{onSnap&&<Pressable accessibilityRole="button" accessibilityLabel="Snap a part and ask BAK" hitSlop={6} onPress={onSnap} style={({pressed})=>({width:40,height:40,borderRadius:20,borderWidth:1,borderColor:'#343a45',backgroundColor:'#14171d',alignItems:'center',justifyContent:'center',opacity:pressed?0.6:1})}><Icon name="camera" size={20} color="#e6e9ef"/></Pressable>}<View style={[{borderRadius:20,width:40,height:40,alignItems:'center',justifyContent:'center'},blueLift]}><BlueFace radius={20}/><Icon name="arrowUp" size={20} color="#ffffff" weight={2.4}/></View></Pressable>}
/** Quiet text action: accent label with an arrow. For secondary moves under a section. */
export function LinkAction({title,onPress,icon,disabled=false,muted=false,arrow=true}:{title:string;onPress:()=>void;icon?:IconName|React.ReactNode;disabled?:boolean;muted?:boolean;arrow?:boolean}){const c=muted?'#b2b9c4':colors.text;return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} hitSlop={6} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:8,paddingVertical:10,opacity:pressed||disabled?0.55:1})}>{typeof icon==='string'?<Icon name={icon as IconName} size={18} color={muted?c:colors.accent}/>:icon}<Text style={{color:c,fontSize:15,fontWeight:'700'}}>{title}</Text>{arrow&&<Icon name="arrowRight" size={16} color={muted?c:colors.accent} weight={2}/>}</Pressable>}
/** Round initial for a rider. */
export function Avatar({name,size=40,uri}:{name:string;size?:number;uri?:string|null}){if(uri)return <Image source={{uri}} accessibilityIgnoresInvertColors style={{width:size,height:size,borderRadius:size/2,backgroundColor:'#14171d'}}/>;return <View style={{width:size,height:size,borderRadius:size/2,borderWidth:1,borderColor:'#343a45',alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.text,fontWeight:'800',fontStyle:'italic',fontSize:size*0.4}}>{name.replace('@','').slice(0,1).toUpperCase()}</Text></View>}
/** Heading row for a form or section with a quiet action on the right. */
export function SectionHead({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Text style={{color:colors.text,fontSize:19,fontWeight:'800'}}>{title}</Text>{!!action&&<Pressable accessibilityRole="button" hitSlop={10} onPress={onAction}><Text style={{color:'#adb5c1',fontSize:15,fontWeight:'600'}}>{action}</Text></Pressable>}</View>}
/** Back to the previous list. */
export function BackLink({title,onPress}:{title:string;onPress:()=>void}){return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:4,alignSelf:'flex-start',paddingVertical:4,opacity:pressed?0.55:1})}><Icon name="chevronLeft" size={17} color={colors.accent} weight={2.1}/><Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>{title}</Text></Pressable>}
/** Small icon + label action, e.g. likes and comments. */
export function IconAction({icon,label,onPress,active=false,danger=false}:{icon:IconName;label:string;onPress:()=>void;active?:boolean;danger?:boolean}){const c=danger?'#efb5be':active?colors.accent:'#b2b9c4';return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:active}} accessibilityLabel={label} hitSlop={8} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingVertical:6,opacity:pressed?0.55:1})}><Icon name={icon} size={18} color={c} accent={c}/><Text style={{color:c,fontSize:14,fontWeight:'600'}}>{label}</Text></Pressable>}
/** Tick box with a label. */
export function CheckRow({label,checked,onPress}:{label:string;checked:boolean;onPress:()=>void}){return <Pressable haptic="select" accessibilityRole="checkbox" accessibilityState={{checked}} onPress={onPress} hitSlop={6} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:10,paddingVertical:6,opacity:pressed?0.6:1})}><Icon name={checked?'checkboxOn':'checkbox'} size={20} color={checked?'#ffffff':'#adb5c1'} accent={colors.primary}/><Text style={{color:colors.text,fontSize:15,flex:1}}>{label}</Text></Pressable>}

/** A remote photo that shows a soft pulse while it downloads, instead of a flat grey box. Same props as Image. */
export function LoadingImage({style,onLoad,...rest}:ImageProps){
 const [loaded,setLoaded]=React.useState(false),pulse=React.useRef(new Animated.Value(0.5)).current;
 React.useEffect(()=>{if(loaded||motion.reduced)return;const a=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1,duration:700,useNativeDriver:true}),Animated.timing(pulse,{toValue:0.5,duration:700,useNativeDriver:true})]));a.start();return()=>a.stop();},[loaded]);
 const flat=StyleSheet.flatten(style)??{};
 return <View style={{width:flat.width,height:flat.height,aspectRatio:flat.aspectRatio,borderRadius:flat.borderRadius,overflow:'hidden'}}>
  {!loaded&&<Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:'#1a1e25',opacity:pulse}]}/>}
  <Image {...rest} style={[style,{backgroundColor:'transparent'}]} onLoad={e=>{setLoaded(true);onLoad?.(e);}}/>
 </View>;
}

/** One choice from a few, as a single control: a dark rail with the chosen option lifted out of it. Calm, no colour wash. */
export function Segmented<T extends string>({value,items,onChange,disabled=false,label}:{value:T|undefined;items:{value:T;label:string}[];onChange:(v:T)=>void;disabled?:boolean;label?:string}){
 return <View style={{gap:7}}>
  {!!label&&<Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{label}</Text>}
  <View accessibilityRole="radiogroup" style={{flexDirection:'row',padding:3,borderRadius:14,backgroundColor:'#0c0e12',borderWidth:1,borderColor:'#22262e'}}>
   {items.map(i=>{const on=i.value===value;return <Pressable key={i.value} haptic="select" accessibilityRole="radio" accessibilityState={{selected:on,disabled}} disabled={disabled} onPress={()=>onChange(i.value)}
    style={({pressed})=>[{flex:1,alignItems:'center',justifyContent:'center',minHeight:40,borderRadius:11,paddingHorizontal:8},on&&{backgroundColor:'#1e232c',borderWidth:1,borderColor:'#3a414d',shadowColor:'#000',shadowOpacity:0.35,shadowRadius:4,shadowOffset:{width:0,height:2}},pressed&&!on&&{opacity:0.6}]}>
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{color:on?'#ffffff':'#8f97a4',fontSize:14.5,fontWeight:on?'700':'500'}}>{i.label}</Text>
   </Pressable>;})}
  </View>
 </View>;
}
/** A collapsed group of settings: a row with what's inside and its current state; tap to open. */
export function Section({icon,title,summary,children,startOpen=false}:{icon:IconName;title:string;summary?:string;children:React.ReactNode;startOpen?:boolean}){
 const [open,setOpen]=React.useState(startOpen);
 return <View style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39'}}>
  <Pressable haptic="select" accessibilityRole="button" accessibilityState={{expanded:open}} accessibilityLabel={`${title}${summary?`, ${summary}`:''}`} onPress={()=>setOpen(!open)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:14,paddingVertical:16,opacity:pressed?0.6:1})}>
   <View style={{width:36,height:36,borderRadius:11,borderWidth:1,borderColor:'#262b34',backgroundColor:'#0e1015',alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={18} color={open?colors.accent:'#b2b9c4'}/></View>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16.5,fontWeight:'700'}}>{title}</Text>{!!summary&&<Text numberOfLines={1} style={{color:'#8f97a4',fontSize:13.5}}>{summary}</Text>}</View>
   <Icon name={open?'chevronUp':'chevronDown'} size={17} color="#8f97a4"/>
  </Pressable>
  {open&&<View style={{gap:14,paddingBottom:20}}>{children}</View>}
 </View>;
}
