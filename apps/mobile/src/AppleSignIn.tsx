// Sign in with Apple: Face ID instead of a password. Apple hands the phone an identity token; Supabase checks it
// and signs the rider in (or creates the account on the first tap). The same Apple ID always lands in the same BAK
// account. If the Apple ID's email matches an existing BAK account made with email and password, Supabase joins the
// two, so the rider keeps their Garage. iPhone only; on other platforms this draws nothing.
import React,{useEffect,useState} from 'react';
import {Platform,Text,View} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {api,supabase} from './api';
import {writeProgress} from './localProgress';
const DEVICE='device';
import {colors} from './ui';

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

/** The Apple button with BAK's words under it. Draws nothing where Apple sign-in is unavailable. */
export function AppleSignInButton({busy,onStart,onDone,onError,mode}:{busy:boolean;onStart:()=>void;onDone:()=>void;onError:(e:unknown)=>void;mode:'login'|'signup'}){
 const [available,setAvailable]=useState(false);
 useEffect(()=>{if(Platform.OS!=='ios')return;let live=true;AppleAuthentication.isAvailableAsync().then(ok=>{if(live)setAvailable(ok);}).catch(()=>{});return()=>{live=false;};},[]);
 if(!available)return null;
 return <View style={{gap:10}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}><View style={{flex:1,height:1,backgroundColor:colors.line}}/><Text style={{color:colors.muted,fontSize:12.5,fontWeight:'600',letterSpacing:0.4}}>OR</Text><View style={{flex:1,height:1,backgroundColor:colors.line}}/></View>
  <View pointerEvents={busy?'none':'auto'} style={{opacity:busy?0.6:1}}>
   <AppleAuthentication.AppleAuthenticationButton
    buttonType={mode==='signup'?AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP:AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
    cornerRadius={14} style={{width:'100%',height:52}}
    onPress={()=>{onStart();signInWithApple().then(()=>{}).catch(onError).finally(onDone);}}/>
  </View>
  <Text style={{color:colors.muted,fontSize:12.5,lineHeight:18}}>Face ID, no password. Uses the email on your Apple ID; if you already have a BAK account under that email, it signs you into it. Choosing Hide My Email makes a new BAK account.</Text>
 </View>;
}
