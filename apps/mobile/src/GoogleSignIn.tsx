// Continue with Google. On iPhone builds that carry BAK's iOS Google client ID, Google's own sign-in sheet runs
// natively: Google shows "Sign in to BAK MX" and hands the phone an ID token, which Supabase checks and signs the
// rider in with. Everywhere else (and on older builds) the phone opens Google's page in a secure in-app browser, Google
// sends the rider back to bakmx://auth/callback with a one-time code, and Supabase swaps that code for a BAK session.
// The rider never types a Google password into BAK either way. The first time, Supabase creates the account; if the
// Google email matches an existing BAK account, Supabase joins the two, so the rider keeps their Garage. On the website
// the page itself goes to Google and comes back to bakmx.com, where the code is swapped the same way.
import React from 'react';
import {Platform,StyleSheet,Text,View} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import {GoogleSignin,isErrorWithCode,statusCodes} from '@react-native-google-signin/google-signin';
import {Pressable} from './Touch';
import {supabase} from './api';
import {claimCode} from './authCodes';

const APP_RETURN='bakmx://auth/callback';
// Both IDs are public (they ship inside every copy of the app); they are set in eas.json for store builds.
const IOS_CLIENT=process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID||'';
const WEB_CLIENT=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID||'';
const nativeGoogle=Platform.OS==='ios'&&!!IOS_CLIENT&&!!WEB_CLIENT;
let configured=false;

/** Google's own iPhone sign-in sheet. The token is issued for BAK's web client ID, which Supabase already trusts. */
async function signInNative():Promise<'signed_in'|'cancelled'>{
 if(!configured){GoogleSignin.configure({iosClientId:IOS_CLIENT,webClientId:WEB_CLIENT});configured=true;}
 // Forget the last Google account on this phone so the rider always gets to choose (a shared family phone).
 await GoogleSignin.signOut().catch(()=>null);
 let res;
 try{res=await GoogleSignin.signIn();}
 catch(e){if(isErrorWithCode(e)&&(e.code===statusCodes.SIGN_IN_CANCELLED||e.code===statusCodes.IN_PROGRESS))return 'cancelled';throw e;}
 if(res.type!=='success')return 'cancelled';
 const token=res.data.idToken;
 if(!token)throw new Error('Google did not finish the sign-in. Try again.');
 const s=await supabase!.auth.signInWithIdToken({provider:'google',token});
 if(s.error)throw s.error;
 return 'signed_in';
}

/** Opens Google and signs the rider into BAK. Resolves `cancelled` when the rider closed Google's page. */
export async function signInWithGoogle():Promise<'signed_in'|'cancelled'|'redirecting'>{
 if(!supabase)throw new Error('Sign-in is not available in this build.');
 if(nativeGoogle)return signInNative();
 if(Platform.OS==='web'){
  const r=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
  if(r.error)throw r.error;
  return 'redirecting';
 }
 const r=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:APP_RETURN,skipBrowserRedirect:true}});
 if(r.error)throw r.error;
 if(!r.data.url)throw new Error('Google sign-in did not start. Try again.');
 const result=await WebBrowser.openAuthSessionAsync(r.data.url,APP_RETURN,{preferEphemeralSession:false});
 if(result.type!=='success')return 'cancelled';
 const back=new URL(result.url);
 const params=new URLSearchParams([...back.searchParams,...new URLSearchParams(back.hash.replace(/^#/,''))]);
 const failed=params.get('error_description')??params.get('error');
 if(failed)throw new Error(failed.replace(/\+/g,' '));
 const code=params.get('code');
 if(!code)throw new Error('Google did not finish the sign-in. Try again.');
 // On Android the same link can also reach the app's link handler; whichever comes first uses the code.
 if(!claimCode(code))return 'signed_in';
 const s=await supabase.auth.exchangeCodeForSession(code);
 if(s.error)throw s.error;
 return 'signed_in';
}

/** Google's "G" in its four colours (Google's sign-in branding asks for the logo as given). */
function GoogleG({size=18}:{size?:number}){
 return <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false}>
  <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
 </Svg>;
}

/** White pill with Google's G, per Google's sign-in button rules, sized like BAK's other sign-in buttons. */
export function GoogleSignInButton({busy,onStart,onDone,onError,mode}:{busy:boolean;onStart:()=>void;onDone:()=>void;onError:(e:unknown)=>void;mode:'login'|'signup'}){
 const label=mode==='signup'?'Sign up with Google':'Continue with Google';
 return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy}
  onPress={()=>{onStart();signInWithGoogle().then(r=>{if(r==='redirecting')return new Promise(()=>{});}).catch(onError).finally(onDone);}}
  style={({pressed})=>[st.button,{opacity:busy?0.6:1},pressed&&{backgroundColor:'#e9ebee',transform:[{translateY:1}]}]}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
   <GoogleG/>
   <Text style={st.label}>{label}</Text>
  </View>
 </Pressable>;
}

/** Google's round logo-only button (Google's branding rules allow the "G" alone on white), the same size as Apple's. */
export function GoogleIconButton({busy,onStart,onDone,onError,mode,size=60}:{busy:boolean;onStart:()=>void;onDone:()=>void;onError:(e:unknown)=>void;mode:'login'|'signup';size?:number}){
 const label=mode==='signup'?'Sign up with Google':'Continue with Google';
 return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={busy} hitSlop={6}
  onPress={()=>{onStart();signInWithGoogle().then(r=>{if(r==='redirecting')return new Promise(()=>{});}).catch(onError).finally(onDone);}}
  style={({pressed})=>[st.icon,{width:size,height:size,borderRadius:size/2,opacity:busy?0.6:1},pressed&&{backgroundColor:'#e9ebee',transform:[{translateY:1}]}]}>
  <GoogleG size={Math.round(size*0.4)}/>
 </Pressable>;
}

/** The line with the other ways in under it: "or continue with" (sign in) or "or sign up with". */
export function OrDivider({label='or'}:{label?:string}){
 return <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={st.rule}/><Text style={{color:'#8b93a0',fontSize:13,fontWeight:'600'}}>{label}</Text><View style={st.rule}/></View>;
}

const st=StyleSheet.create({
 button:{minHeight:52,borderRadius:28,justifyContent:'center',alignItems:'center',backgroundColor:'#ffffff',borderWidth:1,borderColor:'#dadce0'},
 label:{color:'#1f1f1f',fontSize:16.5,fontWeight:'600'},
 rule:{flex:1,height:StyleSheet.hairlineWidth,backgroundColor:'#2c323c'},
 icon:{justifyContent:'center',alignItems:'center',backgroundColor:'#ffffff',borderWidth:1,borderColor:'#dadce0',shadowColor:'#000',shadowOpacity:0.45,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:5},
});
