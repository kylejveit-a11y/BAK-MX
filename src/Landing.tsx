// The page a visitor sees before signing in: what BAK MX is, shown with real app screens and real figures.
// Deliberately light on sign-up prompts (Kyle, 2026-11-28): one App Store link at the top, one at the bottom.
import {useMemo} from 'react';
import {ArrowDown,ArrowRight,Check} from 'lucide-react';
import {SupportPicker,useSupport} from './BikeSupport';
import {planComparison} from '../shared/pro-flow';
import './landing.css';

const APP_STORE='https://apps.apple.com/app/id6825128988';
type Props={onSignIn:()=>void;onSignUp:()=>void;onBikes:()=>void};

function Phone({shot,alt,className=''}:{shot:string;alt:string;className?:string}){
 return <div className={'lp-phone '+className}><img src={`/landing/${shot}.webp`} alt={alt} width={660} height={1434} loading="lazy" decoding="async"/></div>;
}
function Chapter({id,title,children,shot,alt,flip}:{id?:string;title:string;children:React.ReactNode;shot:string;alt:string;flip?:boolean}){
 return <section id={id} className={'lp-chapter'+(flip?' flip':'')}><div className="lp-chapter-text"><h2>{title}</h2>{children}</div><Phone shot={shot} alt={alt}/></section>;
}
const REST:[string,string,string,string][]=[
 ['garage','Garage','What’s on the bike, what you changed and how it felt, kept per bike.','The Garage build sheet for a 2025 KTM 450 SX-F'],
 ['service','Service log','What’s due next by engine hours, from the maker’s own schedule.','The service log showing air filter and engine oil coming up'],
 ['specs','Parts and specs','Torques, capacities, stock settings and part numbers for your exact bike.','The Specs tab showing engine oil, race sag and tire pressure'],
 ['voice','Talk to BAK','Hands full or gloves on? Ask out loud and it answers out loud.','The Talk to BAK screen'],
 ['workshop','Workshop','Guided jobs, one step at a time, with room for your own measurements.','The Workshop screen with guided jobs and job notes'],
 ['events','Events and riders','Ride days, races and practice nights, posted by the people going.','An event page for a practice day'],
];

export function Landing({onSignIn,onSignUp,onBikes}:Props){
 const support=useSupport();
 const bikeYears=support?.bikes.length,makes=useMemo(()=>support?new Set(support.bikes.map(b=>b.make)).size:0,[support]);
 const plans=planComparison();
 return <div className="lp">
  <header className="lp-top"><div className="lp-top-in">
   <a className="lp-logo" href="/" aria-label="BAK MX home"><img src="/bak-mx-logo.png" alt="BAK MX" width={1200} height={186}/></a>
   <nav aria-label="On this page"><a href="#what">What it does</a><a href="#bikes">Your bike</a><a href="#answers">How it answers</a><a href="#cost">What it costs</a></nav>
   <button type="button" className="lp-signin" onClick={onSignIn}>Sign in</button>
  </div></header>

  <section className="lp-hero">
   <h1>You just ride.<br/>Let BAK handle the rest.</h1>
   <p>Setup help for your exact bike, places to ride, lap times and a service log. Made for motocross riders who do their own wrenching.</p>
   <div className="lp-hero-actions"><a className="lp-btn solid" href={APP_STORE} target="_blank" rel="noopener">Download on the App Store</a><a className="lp-btn" href="#what">See what it does <ArrowDown size={15} aria-hidden/></a></div>
   <small>Free to start. Android is in testing.</small>
   <div className="lp-hero-phones" aria-hidden="true"><Phone shot="ride" alt="" className="side left"/><Phone shot="garage" alt="" className="mid"/><Phone shot="raceday" alt="" className="side right"/></div>
  </section>

  <section className="lp-facts" aria-label="BAK MX in numbers">
   <div><strong>{bikeYears??'…'}</strong><span>bike-years on file{makes?`, ${makes} makes`:''}</span></div>
   <div><strong>2010–2027</strong><span>model years covered</span></div>
   <div><strong>250+</strong><span>tracks and riding areas</span></div>
   <div><strong>20</strong><span>states so far</span></div>
  </section>

  <div id="what">
  <Chapter title="Tell it what the bike is doing." shot="chat" alt="An Ask BAK answer: soften fork compression two clicks, with the reason and when to go back">
   <p>Say it the way you’d tell a buddy. It pushes in flat corners. The rear kicks on braking bumps. BAK answers for your bike and the settings you’re running now.</p>
   <ul><li><Check size={16} aria-hidden/>Answers in clicks, one change at a time</li><li><Check size={16} aria-hidden/>Tells you why, and when to go back</li><li><Check size={16} aria-hidden/>Remembers what you tried last time</li></ul>
  </Chapter>
  <Chapter flip title="Find somewhere to ride this weekend." shot="ride" alt="Where to Ride: a list of riding areas with trail miles and what you can ride there">
   <p>Tracks and riding areas with what you can ride there, plus open days and gate details where we’ve confirmed them. Places that have closed are marked closed, so you don’t haul out to a locked gate.</p>
   <p>Know one we’re missing? Suggest it from the app and we’ll check it and add it.</p>
  </Chapter>
  <Chapter title="A day at the track, handled." shot="raceday" alt="Track day: set the next moto time and see a starting setup for the race">
   <p>Set your moto times and BAK counts down to each one, with a prep list and a starting setup for that track and the day’s weather. Start a recording and your laps count themselves.</p>
   <p>Riding alone? Ride safety lets you set a back-by time. The people you pick get a link to where you were last seen if you’re not back.</p>
   <p className="lp-note">Ride recording, lap times and Ride safety are free on every plan.</p>
  </Chapter>
  </div>

  <section className="lp-rest"><h2>And the rest of the garage.</h2><p>Everything you’d otherwise keep in a notebook, a manual and three group chats.</p>
   <div className="lp-cards">{REST.map(([shot,name,line,alt])=><article key={shot}><div className="lp-card-shot"><img src={`/landing/${shot}.webp`} alt={alt} width={660} height={1434} loading="lazy" decoding="async"/></div><h3>{name}</h3><p>{line}</p></article>)}</div>
  </section>

  <section id="bikes" className="lp-bikes"><div className="lp-bikes-text"><h2>Check your bike before you sign up.</h2><p>Pick your make, model and year. You’ll see how complete BAK is for that bike today: specs, parts diagrams, service schedule and guided jobs. If it’s thin, we say so.</p><button type="button" className="lp-link" onClick={onBikes}>See every supported bike <ArrowRight size={15} aria-hidden/></button></div><SupportPicker onSeeAll={onBikes}/></section>

  <section id="answers" className="lp-answers"><h2>Where the answers come from.</h2>
   <div className="lp-cols">
    <div><h3>The maker’s own figures</h3><p>Clicker settings, torques, capacities and service intervals come from each manufacturer’s published documents for your model year.</p></div>
    <div><h3>Honest about gaps</h3><p>When a manufacturer doesn’t publish a number, BAK tells you it isn’t confirmed instead of guessing one.</p></div>
    <div><h3>Written by AI, checked against the file</h3><p>BAK uses AI to put answers in plain words. It works from what’s on file for your bike. Check torque values against your manual before you tighten anything.</p></div>
    <div><h3>Your data stays yours</h3><p>Your bikes, chats and logs live in your account. You can delete the account and everything in it whenever you want.</p></div>
   </div>
  </section>

  <section id="cost" className="lp-cost"><h2>What it costs.</h2><p>Most of the app is free. Paying raises how much you can ask BAK.</p>
   <div className="lp-table"><table>
    <thead><tr><th scope="col"><span className="sr-only">Feature</span></th><th scope="col">Free<small>$0</small></th><th scope="col">Premium<small>$7.99 a month<br/>$59.99 a year</small></th><th scope="col">Pro<small>$14.99 a month<br/>$119.99 a year</small></th></tr></thead>
    <tbody>{plans.map(r=><tr key={r.feature}><th scope="row">{r.feature}</th>{(['free','premium','pro'] as const).map(t=>{const v=r[t];return <td key={t}>{v==='Included'?<Check size={16} aria-label="Included"/>:v==='—'?<span aria-label="Not included">—</span>:v}</td>;})}</tr>)}</tbody>
   </table></div>
   <p className="lp-note">Plans are bought in the app and billed by Apple. Cancel any time in your App Store settings.</p>
  </section>

  <section className="lp-who"><h2>Who’s behind it.</h2><p>BAK MX is made by BAK Motorsports LLC, a small Florida company run by riders. Write to <a href="mailto:support@bakmx.com">support@bakmx.com</a> and a person answers.</p></section>

  <section className="lp-end"><img src="/bak-mx-logo.png" alt="" width={1200} height={186}/><h2>See you at the track.</h2>
   <div className="lp-hero-actions"><a className="lp-btn solid" href={APP_STORE} target="_blank" rel="noopener">Download on the App Store</a><button type="button" className="lp-btn" onClick={onSignUp}>Use it in your browser</button></div>
  </section>

  <footer className="lp-foot"><nav aria-label="Footer"><button type="button" onClick={onBikes}>Supported bikes</button><a href="/support">Support</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button type="button" onClick={onSignIn}>Sign in</button></nav><small>© 2026 BAK Motorsports LLC</small></footer>
 </div>;
}
