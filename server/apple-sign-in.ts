// Sign in with Apple, server side. The phone signs in through Supabase with Apple's identity token; this module keeps
// the one thing Apple additionally requires of apps that offer it: when a rider deletes their BAK account, their Apple
// sign-in is revoked too (App Review Guideline 5.1.1(v)). Apple's revoke endpoint needs a refresh token, which only the
// one-time authorization code from the sign-in can be exchanged for, so the phone hands that code over right after
// signing in and the refresh token is kept until the account is deleted. Nothing here grants access to BAK.
import {createSign} from 'node:crypto';
import {z} from 'zod';
import {adminDb} from './database.ts';
import {HttpError} from './validation.ts';

/** The app's Apple client id for a native sign-in is its bundle id. */
export const APPLE_CLIENT_ID='com.bakmx.app';
const APPLE_TEAM_ID='PT6ZAQV9GY';
const TOKEN_URL='https://appleid.apple.com/auth/token',REVOKE_URL='https://appleid.apple.com/auth/revoke';

export type AppleKey={keyId:string;teamId:string;privateKey:string;clientId:string};
/** The Sign in with Apple key from the environment, or null when it is not set up (sign-in still works; revocation is skipped). */
export function appleKey(env:NodeJS.ProcessEnv=process.env):AppleKey|null{
 const keyId=env.APPLE_SIGN_IN_KEY_ID?.trim(),raw=env.APPLE_SIGN_IN_PRIVATE_KEY;
 if(!keyId||!raw)return null;
 // Vercel keeps the key on one line with literal "\n"; a pasted multi-line key works as well.
 const privateKey=raw.includes('\\n')?raw.replace(/\\n/g,'\n'):raw;
 return {keyId,teamId:env.APPLE_SIGN_IN_TEAM_ID?.trim()||APPLE_TEAM_ID,privateKey,clientId:env.APPLE_SIGN_IN_CLIENT_ID?.trim()||APPLE_CLIENT_ID};
}
export const appleRevocationConfigured=(env:NodeJS.ProcessEnv=process.env)=>appleKey(env)!==null;

const b64url=(v:Buffer|string)=>Buffer.from(v).toString('base64url');
/** Apple's client secret: an ES256 JWT signed with the Sign in with Apple key, valid for `ttlSeconds` (Apple allows up to six months). */
export function appleClientSecret(key:AppleKey,now=Math.floor(Date.now()/1000),ttlSeconds=600):string{
 const header=b64url(JSON.stringify({alg:'ES256',kid:key.keyId,typ:'JWT'}));
 const claims=b64url(JSON.stringify({iss:key.teamId,iat:now,exp:now+ttlSeconds,aud:'https://appleid.apple.com',sub:key.clientId}));
 const signer=createSign('SHA256');signer.update(`${header}.${claims}`);
 const signature=signer.sign({key:key.privateKey,dsaEncoding:'ieee-p1363'});
 return `${header}.${claims}.${b64url(signature)}`;
}

const tokenResponse=z.object({refresh_token:z.string().min(1)});
const exchangeBody=z.object({authorization_code:z.string().min(10).max(4096)});

/** Exchanges the sign-in's authorization code for a refresh token and keeps it for this rider (one row per rider; a new
 *  sign-in replaces it). Without the Apple key configured it answers `kept:false` and nothing is stored. */
export async function exchangeAppleCode(userId:string,body:unknown,fetchImpl:typeof fetch=fetch):Promise<{kept:boolean}>{
 z.string().uuid().parse(userId);
 const parsed=exchangeBody.safeParse(body);if(!parsed.success)throw new HttpError(400,'That Apple sign-in could not be recorded.');
 const key=appleKey();if(!key)return {kept:false};
 const form=new URLSearchParams({client_id:key.clientId,client_secret:appleClientSecret(key),code:parsed.data.authorization_code,grant_type:'authorization_code'});
 const res=await fetchImpl(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form,signal:AbortSignal.timeout(15000)});
 if(!res.ok)throw new HttpError(502,'Apple did not accept that sign-in. You are signed in; try again later from Account.');
 const data=tokenResponse.safeParse(await res.json().catch(()=>null));if(!data.success)throw new HttpError(502,'Apple did not accept that sign-in. You are signed in; try again later from Account.');
 const saved=await adminDb().from('apple_sign_in_tokens').upsert({user_id:userId,refresh_token:data.data.refresh_token,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(saved.error)throw new HttpError(503,'Could not record the Apple sign-in.');
 return {kept:true};
}

/** Revokes the rider's Apple sign-in before their account is deleted. Best effort: a rider who never used Apple, or a
 *  build without the key, has nothing to revoke; an Apple outage must not keep a rider from deleting their account. */
export async function revokeAppleSignIn(userId:string,fetchImpl:typeof fetch=fetch):Promise<'revoked'|'none'|'failed'>{
 z.string().uuid().parse(userId);
 const row=await adminDb().from('apple_sign_in_tokens').select('refresh_token').eq('user_id',userId).maybeSingle();
 const token=(row.data as {refresh_token?:string}|null)?.refresh_token;const key=appleKey();
 if(!token||!key)return 'none';
 try{
  const form=new URLSearchParams({client_id:key.clientId,client_secret:appleClientSecret(key),token,token_type_hint:'refresh_token'});
  const res=await fetchImpl(REVOKE_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:form,signal:AbortSignal.timeout(15000)});
  // The row goes with the account (ON DELETE CASCADE), so nothing else to clean up.
  return res.ok?'revoked':'failed';
 }catch{return 'failed';}
}
