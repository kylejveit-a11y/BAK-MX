// Continue with Google. The phone opens Google's own sign-in page in a secure in-app browser (the rider never types a
// Google password into BAK), Google sends the rider back to bakmx://auth/callback with a one-time code, and Supabase
// swaps that code for a BAK session. The first time, Supabase creates the account; if the Google email matches an
// existing BAK account, Supabase joins the two, so the rider keeps their Garage. On the website the page itself goes to
// Google and comes back to bakmx.com, where the code is swapped the same way.
import React from 'react';
import {Platform,StyleSheet,Text,View} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import {Pressable} from './Touch';
import {supabase} from './api';
import {claimCode} from './authCodes';

const APP_RETURN='bakmx://auth/callback';

/** Opens Google and signs the rider into BAK. Resolves `cancelled` when the rider closed Google's page. */
export async function signInWithGoogle():Promise<'signed_in'|'cancelled'|'redirecting'>{
 if(!supabase)throw new Error('Sign-in is not available in this build.');
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

/** The "or" line with the other ways in: Apple (iPhone only, drawn by its own button) and Google. */
export function OrDivider(){
 return <View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={st.rule}/><Text style={{color:'#8b93a0',fontSize:13,fontWeight:'600'}}>or</Text><View style={st.rule}/></View>;
}

const st=StyleSheet.create({
 button:{minHeight:52,borderRadius:28,justifyContent:'center',alignItems:'center',backgroundColor:'#ffffff',borderWidth:1,borderColor:'#dadce0'},
 label:{color:'#1f1f1f',fontSize:16.5,fontWeight:'600'},
 rule:{flex:1,height:StyleSheet.hairlineWidth,backgroundColor:'#2c323c'},
});
