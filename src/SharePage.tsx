// The safety share link's public page (bakmx.com/s/<link>): where the rider was last seen and when, refreshed every 30
// seconds. No sign-in, no app. Shows only the first name the rider chose and the last point; nothing once the share ends.
import React,{useEffect,useState} from 'react';
import {lastSeen,type PublicShare} from '../shared/ride-share';

const box:React.CSSProperties={maxWidth:560,margin:'0 auto',padding:'24px 16px',color:'#f6f7f9',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'};
const card:React.CSSProperties={background:'#121418',border:'1px solid #2a2f38',borderRadius:16,padding:16,display:'grid',gap:10};
const btn:React.CSSProperties={display:'inline-block',padding:'12px 16px',borderRadius:12,background:'#1e6fff',color:'#fff',textDecoration:'none',fontWeight:700,textAlign:'center'};

export function SharePage({secret}:{secret:string}){
 const [share,setShare]=useState<PublicShare|null>(null),[error,setError]=useState(''),[now,setNow]=useState(Date.now());
 useEffect(()=>{let live=true;
  const load=()=>fetch('/api/share?t='+encodeURIComponent(secret),{cache:'no-store'}).then(async r=>{const b=await r.json();if(!live)return;if(!r.ok){setError(b.error||'This link is not valid.');return;}setShare(b);setError('');}).catch(()=>{if(live)setError('No connection. Retrying…');});
  load();const i=setInterval(()=>{load();setNow(Date.now());},30000),t=setInterval(()=>setNow(Date.now()),15000);
  return()=>{live=false;clearInterval(i);clearInterval(t);};},[secret]);
 const who=share?.rider_name||'The rider';const p=share?.last;
 const d=0.01,bbox=p?`${p.lng-d},${p.lat-d*0.7},${p.lng+d},${p.lat+d*0.7}`:'';
 return <div style={{background:'#060609',minHeight:'100vh'}}><div style={box}>
  <div style={{fontSize:12,letterSpacing:2,color:'#9aa2ae',fontWeight:700}}>BAK MX · SAFETY SHARE</div>
  <h1 style={{fontSize:26,margin:'8px 0 16px'}}>{share?`${who}’s location`:'Location share'}</h1>
  {error&&<div style={card}><div>{error}</div></div>}
  {share&&share.state!=='active'&&<div style={card}><div style={{fontSize:18,fontWeight:700}}>{share.state==='ended'?`${who} checked in. All good.`:'This share has ended.'}</div><div style={{color:'#bcc3cd'}}>Their location is no longer shown here.</div></div>}
  {share&&share.state==='active'&&<div style={card}>
   <div style={{fontSize:20,fontWeight:800}}>{lastSeen(p?.at??null,now)}</div>
   {share.back_by&&<div style={{color:share.overdue?'#f0c674':'#bcc3cd'}}>{share.overdue?`${who} hasn’t checked in yet. They planned to be back by ${new Date(share.back_by).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}. They may just be running late or out of signal: try calling them first.`:`Plans to be back by ${new Date(share.back_by).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.`}</div>}
   {p&&Date.now()-Date.parse(p.at)>20*60e3&&<div style={{color:'#f0c674'}}>No update for a while. Riding areas often have no signal; this updates when the phone gets a bar again.</div>}
   {p?<>
    <iframe title="Map" style={{border:0,width:'100%',height:320,borderRadius:12}} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${p.lat},${p.lng}`}/>
    <div style={{color:'#bcc3cd',fontSize:14}}>{p.lat.toFixed(5)}, {p.lng.toFixed(5)}{p.accuracy_m!=null?` · within about ${Math.round(p.accuracy_m*3.281)} ft`:''}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
     <a style={btn} href={`https://maps.apple.com/?ll=${p.lat},${p.lng}&q=${encodeURIComponent(who)}`}>Apple Maps</a>
     <a style={btn} href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}>Google Maps</a>
    </div>
   </>:<div style={{color:'#bcc3cd'}}>Waiting for the first location from the phone.</div>}
   <div style={{color:'#8b93a0',fontSize:13}}>Only the last spot is shown, never a trail. In an emergency, call 911.</div>
  </div>}
  <div style={{color:'#6f7682',fontSize:12,marginTop:20}}>Map © OpenStreetMap contributors</div>
 </div></div>;
}
