// Sign in with Apple: Face ID instead of a password. Apple hands the phone an identity token; Supabase checks it
// and signs the rider in (or creates the account on the first tap). The same Apple ID always lands in the same BAK
// account. If the Apple ID's email matches an existing BAK account made with email and password, Supabase joins the
// two, so the rider keeps their Garage. iPhone only; on other platforms this draws nothing.
import React,{useEffect,useState} from 'react';
import {Image,Platform,StyleSheet,Text,View} from 'react-native';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';
import {Pressable} from './Touch';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {api,supabase} from './api';
import {writeProgress} from './localProgress';
const DEVICE='device';

/** A one-off random nonce, sent to Apple hashed and to Supabase raw, which ties the token to this very sign-in. */
async function makeNonce(){
 const bytes=await Crypto.getRandomBytesAsync(16);
 const raw=Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
 const hashed=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,raw);
 return {raw,hashed};
}

const cancelled=(e:unknown)=>typeof e==='object'&&e!==null&&'code' in e&&(e as {code:string}).code==='ERR_REQUEST_CANCELED';

/** Runs the Apple sheet and signs the rider into BAK. Resolves `cancelled` when the rider closed the sheet. */
export async function signInWithApple():Promise<'signed_in'|'cancelled'>{
 if(!supabase)throw new Error('Sign-in is not available in this build.');
 const nonce=await makeNonce();
 let credential:AppleAuthentication.AppleAuthenticationCredential;
 try{credential=await AppleAuthentication.signInAsync({requestedScopes:[AppleAuthentication.AppleAuthenticationScope.FULL_NAME,AppleAuthentication.AppleAuthenticationScope.EMAIL],nonce:nonce.hashed});}
 catch(e){if(cancelled(e))return 'cancelled';throw e;}
 if(!credential.identityToken)throw new Error('Apple did not finish the sign-in. Try again.');
 const r=await supabase.auth.signInWithIdToken({provider:'apple',token:credential.identityToken,nonce:nonce.raw});
 if(r.error)throw r.error;
 // Apple only gives the name on the very first sign-in; keep it on this phone so the rider profile can start from it.
 const name=[credential.fullName?.givenName,credential.fullName?.familyName].filter(Boolean).join(' ').trim();
 if(name){try{writeProgress(DEVICE,'apple-name',name);}catch{}}
 // The authorization code lets BAK revoke this Apple sign-in if the rider ever deletes their account (Apple requires it).
 // Best effort: the rider is signed in either way.
 if(credential.authorizationCode)void api('/api/auth/apple/exchange','POST',{authorization_code:credential.authorizationCode}).catch(()=>{});
 return 'signed_in';
}

/** Black brushed steel, the same shape and light as BAK's blue buttons, with Apple's logo and wording (Apple allows a
 *  custom black "Sign in with Apple" button). Draws nothing where Apple sign-in is unavailable. */
export function AppleSignInButton({busy,onStart,onDone,onError,mode}:{busy:boolean;onStart:()=>void;onDone:()=>void;onError:(e:unknown)=>void;mode:'login'|'signup'}){
 const [available,setAvailable]=useState(false);
 useEffect(()=>{if(Platform.OS!=='ios')return;let live=true;AppleAuthentication.isAvailableAsync().then(ok=>{if(live)setAvailable(ok);}).catch(()=>{});return()=>{live=false;};},[]);
 if(!available)return null;
 const label=mode==='signup'?'Sign up with Apple':'Sign in with Apple';
 return <View style={{gap:14}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{flex:1,height:StyleSheet.hairlineWidth,backgroundColor:'#2c323c'}}/><Text style={{color:'#7d8593',fontSize:12,fontWeight:'700',letterSpacing:1.6}}>OR</Text><View style={{flex:1,height:StyleSheet.hairlineWidth,backgroundColor:'#2c323c'}}/></View>
  <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} onPress={()=>{onStart();signInWithApple().then(()=>{}).catch(onError).finally(onDone);}}
   style={({pressed})=>[{minHeight:52,borderRadius:28,justifyContent:'center',alignItems:'center',shadowColor:'#000',shadowOpacity:0.55,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:5,opacity:busy?0.6:1},pressed&&{transform:[{translateY:1}],shadowOpacity:0.3}]}>
   {({pressed})=><>
    <SteelFace radius={28} pressed={pressed}/>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
     <Text style={{color:'#ffffff',fontSize:19,marginTop:-3}} accessible={false}>{'\uF8FF'}</Text>
     <Text style={{color:'#ffffff',fontSize:16.5,fontWeight:'600',letterSpacing:0.1,textShadowColor:'rgba(0,0,0,0.6)',textShadowOffset:{width:0,height:1},textShadowRadius:1.5}}>{label}</Text>
    </View>
   </>}
  </Pressable>
 </View>;
}

/** Dark brushed steel: graphite falling to near-black, fine grain, a lit top edge. Mirrors BlueFace. */
function SteelFace({radius,pressed}:{radius:number;pressed:boolean}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,overflow:'hidden'}]}>
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
   <Defs>
    <LinearGradient id={'a'+id} x1="0" y1="0" x2="0" y2="1">
     <Stop offset="0" stopColor={pressed?'#24272d':'#33373f'}/>
     <Stop offset="0.5" stopColor={pressed?'#121418':'#181a1f'}/>
     <Stop offset="1" stopColor="#050506"/>
    </LinearGradient>
    <LinearGradient id={'h'+id} x1="0" y1="0" x2="1" y2="0">
     <Stop offset="0" stopColor="#ffffff" stopOpacity="0"/>
     <Stop offset="0.32" stopColor="#ffffff" stopOpacity={pressed?0.03:0.07}/>
     <Stop offset="0.6" stopColor="#ffffff" stopOpacity="0"/>
    </LinearGradient>
   </Defs>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#a${id})`}/>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#h${id})`}/>
  </Svg>
  <Image source={require('../assets/brushed.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.16,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
  <View style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:1,borderTopColor:pressed?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.32)',borderLeftColor:'rgba(255,255,255,0.1)',borderRightColor:'rgba(0,0,0,0.5)',borderBottomColor:'rgba(0,0,0,0.85)'}]}/>
 </View>;
}
