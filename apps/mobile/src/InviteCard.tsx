// Account › Invite a friend: the rider's code, a share button, what they have earned, and a place to enter a friend's code.
import {useEffect,useState} from 'react';
import {ActivityIndicator,Share,Text,View} from 'react-native';
import {api} from './api';
import {Button,colors,Copy,Field,Notice} from './ui';
import {INVITE,type InviteSummary} from '../../../shared/invites';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const day=(iso:string|null)=>iso?new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';
const plan=(t:'premium'|'pro')=>t==='pro'?'Pro':'Premium';

export function InviteCard({name=''}:{name?:string}){
 const [s,setS]=useState<InviteSummary|null>(null),[notice,setNotice]=useState(''),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState('');
 useEffect(()=>{(name?api<InviteSummary>('/api/invite','POST',{name}):api<InviteSummary>('/api/invite')).then(setS).catch(e=>setNotice(errorText(e)));},[name]);
 async function enter(){
  if(busy||!code.trim())return;setBusy(true);setNotice('');
  try{setS(await api<InviteSummary>('/api/invite/redeem','POST',{code:code.trim()}));setCode('');setDone('Code saved. Your friend gets their questions once your bike is in the Garage.');}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(!s)return <View style={{gap:12}}>{!notice&&<ActivityIndicator color={colors.accent}/>}<Notice text={notice}/></View>;
 const toNext=INVITE.friendsPerMonth-(s.paying%INVITE.friendsPerMonth);
 return <View style={{gap:16}}>
  <View style={{gap:4,alignItems:'center',paddingVertical:14,borderRadius:14,borderWidth:1,borderColor:'#2a2f39',backgroundColor:'#12151b'}}>
   <Text style={{color:colors.muted,fontSize:13}}>Your invite code</Text>
   <Text selectable accessibilityLabel={`Your invite code is ${s.code.split('').join(' ')}`} style={{color:colors.text,fontSize:28,fontWeight:'800',letterSpacing:2}}>{s.code}</Text>
  </View>
  <Button title="Share my code" onPress={()=>{void Share.share({message:s.message}).catch(()=>{});}}/>
  <View style={{gap:6}}>
   <Copy strong>What you get</Copy>
   <Copy>{INVITE.joinQuestions} free Ask BAK questions each time a friend signs up with your code and adds their bike.</Copy>
   <Copy>A free month of your plan for every {INVITE.friendsPerMonth} friends who go on a paid plan and stay {INVITE.paidDaysBeforeCounting} days.</Copy>
  </View>
  <View style={{flexDirection:'row',gap:10}}>
   {([[String(s.joined),'joined'],[String(s.questions_earned),'questions earned'],[String(s.paying),'on a paid plan']] as const).map(([n,l])=><View key={l} accessible accessibilityLabel={`${n} ${l}`} style={{flex:1,paddingVertical:12,borderRadius:12,backgroundColor:'#12151b',borderWidth:1,borderColor:'#2a2f39',alignItems:'center',gap:2}}>
    <Text style={{color:colors.text,fontSize:20,fontWeight:'800'}}>{n}</Text><Text style={{color:colors.muted,fontSize:12,textAlign:'center'}}>{l}</Text></View>)}
  </View>
  {s.waiting>0&&<Copy>{s.waiting} {s.waiting===1?'friend has':'friends have'} entered your code and still {s.waiting===1?'needs':'need'} to confirm their email or add a bike.</Copy>}
  {s.joined>0&&<Copy>{toNext} more paying {toNext===1?'friend':'friends'} until your next free month.</Copy>}
  {s.months.map(m=><View key={m.seq} style={{gap:2,padding:12,borderRadius:12,borderWidth:1,borderColor:'#2a2f39'}}>
   <Copy strong>Free month of {plan(m.tier)}</Copy>
   {m.how==='unlock'?<Copy>{m.ends_at&&Date.parse(m.ends_at)>Date.now()?`${plan(m.tier)} is open on your account until ${day(m.ends_at)}.`:`Used. It ended ${day(m.ends_at)}.`}</Copy>
    :m.offer_code?<><Text selectable style={{color:colors.text,fontSize:18,fontWeight:'800',letterSpacing:1}}>{m.offer_code}</Text><Copy>Redeem this code in your phone’s store to get the month free.</Copy></>
    :<Copy>Earned. Your store code is on its way and will show here.</Copy>}
  </View>)}
  {s.can_enter&&<View style={{gap:10,paddingTop:4}}>
   <Field label="Have a friend’s code?" placeholder="Their code" autoCapitalize="characters" autoCorrect={false} value={code} onChangeText={v=>setCode(v.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,13))}/>
   <Button secondary disabled={busy||!code.trim()} title="Save their code" onPress={()=>void enter()}/>
  </View>}
  <Notice text={done}/>
  <Notice text={notice} tone={notice?'warn':undefined}/>
 </View>;
}
