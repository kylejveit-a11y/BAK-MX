// Sample data for the signed-in visual check. Nothing here reaches a real backend: Playwright answers every /api call
// and every Supabase call with these objects, so the screens render the way a rider with a bike and an answer sees them.
const USER='00000000-0000-4000-8000-000000000001';
const now=Date.now(),iso=(ms)=>new Date(ms).toISOString(),day=86400000;
const rider={user_id:USER,handle:'colem22',display_name:'Cole M.',location:'Tampa, FL',riding_class:'Vet B',race_number:'817',avatar_url:undefined};
const bike={id:'11111111-1111-4111-8111-111111111111',user_id:USER,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',nickname:'',engine_hours:64,
 configuration:{geared_weight_lb:'200',skill_level:'Intermediate',discipline:'Motocross',usual_dirt:'Sand',fork_compression:'14',fork_rebound:'15',shock_compression:'15',shock_rebound:'15',rider_sag_mm:'105',front_tire_psi:'12.5',rear_tire_psi:'12.5',exhaust_brand:'FMF',exhaust_name:'Factory 4.1',handlebar_brand:'ODI'},
 created_at:iso(now-40*day),updated_at:iso(now-2*day)};
const bike2={...bike,id:'22222222-2222-4222-8222-222222222222',manufacturer:'Kawasaki',model:'KX450',model_year:2026,engine_hours:3,configuration:{}};
// Phone simulator checks only (EXPO_PUBLIC_SAMPLE_LONG_BIKE=1): a third bike with a long model name, to test tight rows.
const bike3={...bike,id:'33333333-3333-4333-8333-333333333333',manufacturer:'Husqvarna',model:'FC 450 Rockstar Edition',model_year:2025,engine_hours:12,configuration:{}};
const LONG_BIKE=process.env.EXPO_PUBLIC_SAMPLE_LONG_BIKE==='1';
// First-run checks (EXPO_PUBLIC_SAMPLE_NEW=1): a brand-new rider with no bike and no rider profile.
const NEW_RIDER=process.env.EXPO_PUBLIC_SAMPLE_NEW==='1';
// App Store screenshots (EXPO_PUBLIC_SAMPLE_STORE=1, see docs/APP_STORE_SCREENSHOTS.md): the same rider, with a real rider
// complaint answered, a fuel-plan rider saved, a few more community posts and a plan. Published figures below are the KTM
// claims further down this file; nothing else is a number the app would show as a spec.
const STORE=process.env.EXPO_PUBLIC_SAMPLE_STORE==='1';
// The store rider has finished the build sheet: the two parts already named above are fitted, the rest confirmed stock.
if(STORE)bike.configuration={...bike.configuration,installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1'},{s:'controls',b:'ODI',n:'Handlebar'}],stock_systems:['suspension','chassis','engine','intake','tuning','clutch','gearing','brakes','wheels','protection','body']};
const baseConversation={id:'33333333-3333-4333-8333-333333333333',user_id:USER,bike_id:bike.id,title:'What does high-speed compression actually do?',mode:'ask',created_at:iso(now-3600000),updated_at:iso(now-3600000)};
const answer={kind:'answer',summary:'High-speed compression controls how the shock resists fast shaft movement, not bike speed.',
 answer:'**High-speed compression controls the shock’s resistance to fast shaft movement—not bike speed.** A square-edged bump at low riding speed can activate it; a smooth roller at high riding speed may be mostly low-speed compression.\n\nOn your 450 SX-F it mainly affects sharp bumps, hard landings and how much the rear gives way under a big hit:\n\n- **More damping, clockwise:** more support and bottoming resistance; too much makes the rear harsh or deflect sideways off edges.\n- **Less damping, counterclockwise:** lets the rear absorb sharp hits more easily; too little can let it blow through travel and bottom.\n\nIt’s the larger outer adjuster on the shock reservoir; the centre clicker controls low-speed compression.\n\n| Setting | Stock | Yours |\n|---|---|---|\n| High-speed compression | 1.5 turns | 1.5 turns |\n| Low-speed compression | 15 clicks | 15 clicks |',
 observations:[],systems:['rear suspension'],hypotheses:[{mechanism:'Rear harshness on square edges often comes from too much high-speed compression for the rider weight.',explains:'Deflection off braking bumps',confirm:'Go 1/4 turn out and ride the same section',reject:'No change after 1/2 turn'}],
 unknowns:['Your current spring rate'],next_step:{action:'Ride the same rough section once at the stock setting, then 1/4 turn softer.',purpose:'Feel the difference before changing anything else.',stop_conditions:['Stop if the rear bottoms hard on landings.']},
 evidence_ids:[],specifications:[{claim_id:'c1',value:'Shock absorber / High-speed compression damping / Standard: 1.5 turns'}],confidence:'SUPPORTED',references:[]};
const storeConversation={id:'33333333-3333-4333-8333-333333333333',user_id:USER,bike_id:bike.id,title:'Rear kicks on braking bumps',mode:'ask',created_at:iso(now-3600000),updated_at:iso(now-3600000)};
const conversation=STORE?storeConversation:baseConversation;
const storeAnswer={kind:'answer',summary:'The rear is rebounding too fast off the braking bumps, so it kicks instead of staying planted.',
 answer:'**That kick is the shock extending too quickly after each bump, so the rear end tops out and hops.** With your sag at 105 mm the spring and ride height are where KTM sets them, so start with rebound, not the spring.\n\nOn your 450 SX-F the rear rebound clicker is the small screw at the bottom of the shock. You are at the stock 15 clicks.',
 setup_changes:[{setting:'Shock rebound',change:'1 click slower (clockwise), 15 → 14 clicks out',expect:'The rear stays lower and follows the bumps instead of kicking up under braking.',go_back_if:'It feels dead or packs down in whoops and over back-to-back bumps.'}],
 observations:['Rear kicks on the braking bumps into turns','Sag set at 105 mm, stock clickers'],systems:['rear suspension'],
 hypotheses:[{mechanism:'Rebound damping too light for a 200 lb geared rider lets the shock extend too fast after each bump.',explains:'The kick is worst on repeated bumps under braking, where the rear unloads.',confirm:'One click slower calms it on the same section.',reject:'No change after two clicks: look at high-speed compression next.'}],
 unknowns:['Whether the forks are also riding low under braking'],
 next_step:{action:'Go one click slower on shock rebound and ride the same braking bumps twice.',purpose:'Change one thing so you know what fixed it.',stop_conditions:['Stop if the rear starts packing down and feels dead.']},
 garage_updates:[{type:'setting',system:'rear suspension',brand:'',name:'',field:'shock_rebound',value:'14',current:'15'}],
 evidence_ids:[],specifications:[{claim_id:'c8',value:'Shock absorber / Rebound damping / Standard: 15 clicks'},{claim_id:'c4',value:'Shock absorber / Riding sag: 105 mm'}],confidence:'SUPPORTED',references:[]};
const raceConversation={id:'55555555-5555-4555-8555-555555555555',user_id:USER,bike_id:bike.id,title:'Race day at Dade City MX, between motos: front pushes in turns',mode:'ask',created_at:iso(now-1800000),updated_at:iso(now-1800000)};
const raceAnswer={kind:'answer',summary:'Front push in the flat turns: give the front more bite, not more speed.',
 answer:'**Soften fork compression two clicks and ride moto 2.** The front is skating because it is not settling into the turn; a softer fork lets it load and bite on this hard-pack.',
 setup_changes:[{setting:'Fork compression',change:'2 clicks softer (counterclockwise), 14 → 16 clicks out',expect:'The front sits lower in the turn and holds the line instead of pushing wide.',go_back_if:'It dives hard on the braking bumps or bottoms off the big double.'}],
 observations:['Front pushes in flat turns','Between motos, hard-pack'],systems:['front suspension'],hypotheses:[],unknowns:[],
 next_step:{action:'Make only that change before moto 2, then log how it rode.',purpose:'One change per moto so you know what worked.',stop_conditions:[]},
 evidence_ids:[],specifications:[{claim_id:'c6',value:'Fork / Compression damping / Standard: 12 clicks'}],confidence:'SUPPORTED',references:[]};
const raceMessages=[
 {id:'r1',conversation_id:raceConversation.id,user_id:USER,role:'user',content:'Race day at Dade City MX, between motos: front pushes in turns. What\'s the one change to make?',response:null,created_at:iso(now-1800000)},
 {id:'r2',conversation_id:raceConversation.id,user_id:USER,role:'assistant',content:raceAnswer.answer,response:raceAnswer,created_at:iso(now-1790000)}];
const messages=STORE?[
 {id:'m1',conversation_id:storeConversation.id,user_id:USER,role:'user',content:'Rear kicks on the braking bumps going into the turns at Dade. Sag is at 105. What do I change?',response:null,created_at:iso(now-3600000)},
 {id:'m2',conversation_id:storeConversation.id,user_id:USER,role:'assistant',content:storeAnswer.answer,response:storeAnswer,created_at:iso(now-3590000)}]:[
 {id:'m1',conversation_id:conversation.id,user_id:USER,role:'user',content:'What does high-speed compression actually do?',response:null,created_at:iso(now-3600000)},
 {id:'m2',conversation_id:conversation.id,user_id:USER,role:'assistant',content:answer.answer,response:answer,created_at:iso(now-3590000)}];
// Sample chat: each starter gets an answer on its own topic, and the thread keeps the question the rider typed.
// Figures are only the KTM ones already in this file (fork compression 12, shock rebound 15, sag 105 mm, tires 1.0 bar).
const frontAnswer={...raceAnswer,summary:'Front pushes in corners: let the fork settle so the front bites.',
 answer:'**Soften fork compression two clicks and ride the same turns.** When the front pushes, it usually isn’t settling into the turn, so the tire skates instead of loading up. A softer fork lets it sit down and bite.\n\nYou are at 14 clicks out, already two softer than KTM’s standard 12; go two more.',
 setup_changes:[{setting:'Fork compression',change:'2 clicks softer (counterclockwise), 14 → 16 clicks out',expect:'The front sits lower through the turn and holds the line instead of pushing wide.',go_back_if:'It dives hard under braking or bottoms off the bigger jumps.'}],
 observations:['Front pushes in corners'],next_step:{action:'Make only that change, ride the same turns twice, then log how it rode.',purpose:'One change at a time so you know what worked.',stop_conditions:['Stop if the front dives hard on the brakes.']}};
const sagAnswer={kind:'answer',summary:'Set race sag to 105 mm first, then put the clickers at KTM’s standard and change one at a time.',
 answer:'**Start with race sag, then clickers.** Sag sets how high the rear rides, which changes how every clicker feels, so it comes first.\n\n- **Race sag:** 105 mm with you on the bike in your gear (KTM’s figure for your 450 SX-F).\n- **Clickers:** start from standard: fork compression 12 clicks out, shock rebound 15 clicks out.\n\nRide, then change one clicker at a time and log how it rode.',
 setup_changes:[],observations:['Setting up sag and clickers'],systems:['front suspension','rear suspension'],hypotheses:[],unknowns:['Your rider weight in gear, to check the spring'],
 next_step:{action:'Measure race sag in your gear and adjust the shock preload to 105 mm.',purpose:'Everything else builds on the rear sitting at the right height.',stop_conditions:[]},
 evidence_ids:[],specifications:[{claim_id:'c4',value:'Shock absorber / Riding sag: 105 mm'},{claim_id:'c6',value:'Fork / Compression damping / Standard: 12 clicks'},{claim_id:'c8',value:'Shock absorber / Rebound damping / Standard: 15 clicks'}],confidence:'SUPPORTED',references:[]};
const prepAnswer={kind:'answer',summary:'The night before: tires, chain, air filter, bolts and fuel; at the track, set tire pressure for the dirt.',
 answer:'**Night before:**\n\n- Clean, oiled air filter.\n- Chain slack and lube; spokes and the bolts that shake loose.\n- Brakes and levers feel right; fuel and your gear packed.\n\n**At the track:** set tire pressure cold for the dirt (KTM’s figure is 1.0 bar, about 15 psi), check sag, and ride the first lap easy to scout lines.',
 setup_changes:[],observations:['Race this weekend'],systems:[],hypotheses:[],unknowns:['What the track is like this weekend'],
 next_step:{action:'Start Race day on Home with the track, so BAK can plan for the dirt and the forecast.',purpose:'Your prep list and a starting setup for that track.',stop_conditions:[]},
 evidence_ids:[],specifications:[{claim_id:'c9',value:'Chassis / Offroad tire pressure / front: 1.0 bar (15 psi)'}],confidence:'SUPPORTED',references:[]};
// A worn-part answer, so the one quiet "See parts that fit your bike" line can be checked.
const padsAnswer={...answer,summary:'The grinding is the rear pads down to their backing plates.',answer:'That grinding under the rear brake is metal on metal: the pad material is gone and the backing plate is on the rotor. Replace the rear brake pads before the next ride, and check the rotor for scoring while the wheel is out. Bed the new pads in with a few firm stops before you race on them.',setup_changes:[],specifications:[]};
const pickAnswer=t=>/grind|pads?\b/i.test(t)?padsAnswer:/front|push|tuck|wash/i.test(t)?frontAnswer:/rear|kick|braking bump/i.test(t)?storeAnswer:/sag|clicker/i.test(t)?sagAnswer:/race|weekend|check/i.test(t)?prepAnswer:answer;
const chats={};
// The writing preview shows whole sentences only, so it never cuts a number in half ("sag at 10…").
const firstSentence=t=>{const m=t.replace(/\*\*/g,'').match(/^.*?[.!?](\s|$)/);return (m?m[0]:t).trim();};
const services=[{id:'s1',user_id:USER,bike_id:bike.id,category:'Engine oil',performed_at:iso(now-9*day),engine_hours:58,notes:'10W-50, new filter',next_due_hours:73,interval_source:'rider',created_at:iso(now-9*day)},
 {id:'s2',user_id:USER,bike_id:bike.id,category:'Air filter',performed_at:iso(now-2*day),engine_hours:63,notes:'',next_due_hours:null,interval_source:'rider',created_at:iso(now-2*day)}];
const plan=[{category:'Engine oil',every_hours:15,first_hours:1,task:'Change the engine oil and the oil filter',claim_id:'c2',note:null},{category:'Air filter',every_hours:5,first_hours:null,task:'Clean the air filter',claim_id:'c3',note:null},{category:'Valve check',every_hours:30,first_hours:null,task:'Check the valve clearance',claim_id:'c4',note:null}];
const setupLogs=[{id:'l1',user_id:USER,bike_id:bike.id,recorded_at:iso(now-5*day),track:'Dade City MX',conditions:'Loamy, watered, 85°F',engine_hours:62,settings:{fork_compression:'14',shock_rebound:'15'},change_made:'Fork compression 2 clicks softer',result:'better',notes:'Front stopped deflecting off braking bumps.',created_at:iso(now-5*day)}];
const at=(d,h,m)=>{const x=new Date(now+d*day);x.setHours(h,m,0,0);return x.toISOString();};
const events=[{id:'e1',user_id:'other',title:'Practice day',event_type:'practice',starts_at:at(2,9,0),ends_at:null,location_name:'Dade City MX',description:'Open practice, all classes.',created_at:iso(now-3*day),canceled_at:null,host:{...rider,user_id:'other',handle:'dademx',display_name:'Dade City MX'},mine:false,going_count:12,interested_count:4,my_rsvp:'going',skill_level:'any',bike_size:'any',discipline:'mx'},
 {id:'e3',user_id:'other',title:'Saturday trail ride',event_type:'ride_day',starts_at:at(4,8,30),ends_at:null,location_name:'Ocala National Forest OHV Trail System, Delancy trailhead',description:'Easy pace, 30 miles.',created_at:iso(now-2*day),canceled_at:null,host:{...rider,user_id:'other3',handle:'ocalatrails',display_name:'Ocala Trails'},mine:false,going_count:6,interested_count:3,my_rsvp:null},
 {id:'e2',user_id:'other',title:'Florida Winter Series Rd 1',event_type:'race',starts_at:at(9,7,30),ends_at:null,location_name:'Bostwick Creek',description:'Round one.',created_at:iso(now-3*day),canceled_at:null,host:{...rider,user_id:'other2',handle:'fws',display_name:'FWS'},mine:false,going_count:40,interested_count:9,my_rsvp:null}];
const posts=[{id:'p1',user_id:'other',category:'build',body:'Fresh top end, new FMF and a Rekluse. Ready for the winter series.',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-8*day),author:{...rider,user_id:'other',handle:'godfather817',display_name:'God Father 817'},mine:false,like_count:7,liked:false,comment_count:2,photos:[]},
 {id:'p2',user_id:USER,category:'setup_question',body:'Anyone running a 5.0 rear spring at 200 lb geared on the 450? Sag numbers?',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-1*day),author:rider,mine:true,like_count:2,liked:true,comment_count:0,photos:[]}];
const storePosts=[
 {id:'p3',user_id:'other3',category:'track',body:'Dade was tacky all morning and blew out by moto 2. Ran 12 psi front and it still pushed in the flat turns.',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-3*3600000),author:{...rider,user_id:'other3',handle:'masont41',display_name:'Mason T.',location:'Brooksville, FL',riding_class:'Vet C',race_number:'41'},mine:false,like_count:4,liked:false,comment_count:3,photos:[]},
 {id:'p4',user_id:'other4',category:'setup_question',body:'Who has the oil interval on the 450 figured out for sand? Doing every 10 hours and the filter looks fine.',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-26*3600000),author:{...rider,user_id:'other4',handle:'luisr7',display_name:'Luis R.',location:'Ocala, FL',riding_class:'Vet B',race_number:'7'},mine:false,like_count:5,liked:true,comment_count:6,photos:[]}];
// Comments on the God Father 817 build post (its card says 2), so "View all 2 comments" shows them.
const gf={...rider,user_id:'other',handle:'godfather817',display_name:'God Father 817',bio:'Fresh top end and a Rekluse. Winter series.',location:'Dade City, FL',riding_class:'Vet A',race_number:'817'};
let comments={p1:[{id:'k1',post_id:'p1',user_id:'r2',body:'Clean build. How do you like the Rekluse in the tight stuff?',created_at:iso(now-7*day),author:{...rider,user_id:'r2',handle:'jt_moto',display_name:'Jake T.',race_number:''},mine:false},
 {id:'k2',post_id:'p1',user_id:'other',body:'Never stalls in the ruts now. Worth it.',created_at:iso(now-7*day+3600000),author:gf,mine:false}]};
const threads=[{rider:{...rider,user_id:'other',handle:'godfather817',display_name:'God Father 817'},last_message:{body:'See you at Dade Saturday?',created_at:iso(now-2*3600000),mine:false},unread:1}];
const coaching=[];
const checklist={items:null};
const tracks=[{id:'t-dade',name:'Dade City MX',state:'FL',lat:28.4,lng:-82.2},{id:'t-bostwick',name:'Bostwick Creek',state:'FL',lat:29.8,lng:-81.6},{id:'t-ww',name:'WW Ranch',state:'FL',lat:30.2,lng:-81.9}];
// Where to Ride: the real Southeast riding-area research and Forest Service trail lines, plus the sample tracks.
const AREAS=[...require('../../docs/research/riding-areas/southeast.json'),...require('../../docs/research/riding-areas/southeast-2.json'),...require('../../docs/research/riding-areas/parks.json')],NEW_PLACES=require('../../docs/research/riding-areas/new-places.json'),LINES=require('../../docs/research/riding-areas/trail-lines.json');
const AREA_PLACES={'ocala-nf-ohv-trail-system':['Ocala National Forest OHV Trail System','FL',29.43,-81.82],'big-scrub-ohv':['Big Scrub (Ocala Centennial OHV)','FL',29.06,-81.75],'croom-motorcycle-area':['Croom Motorcycle Area','FL',28.6,-82.22],'houston-valley-orv':['Houston Valley OHV Trails','GA',34.78,-85.13],'oakey-mountain-ohv':['Oakey Mountain OHV Trails','GA',34.75,-83.55],'town-creek-ohv':['Town Creek OHV Trails','GA',33.65,-83.16],'windy-gap-ohv':['Windy Gap OHV','GA',34.84,-84.67],'kentuck-orv-area':['Kentuck ORV Area','AL',null,null],'windrock-park':['Windrock Park','TN',36.05,-84.37],'minooka-ohv-park':['Minooka OHV Park','AL',null,null],
 ...Object.fromEntries(NEW_PLACES.map(n=>[n.id,[n.name,n.state,n.lat??null,n.lng??null]]))};
const centerOf=id=>{const pts=LINES.filter(l=>l.track_id===id).flatMap(l=>decodeLine(l.line));return pts.length?{lat:pts.reduce((n,p)=>n+p[1],0)/pts.length,lng:pts.reduce((n,p)=>n+p[0],0)/pts.length}:null;};
const widthsOf=v=>['single_track','atv','full_width'].filter(k=>v&&v[k]===true);
const lineCount=id=>LINES.filter(l=>l.track_id===id).length;
const placeRows=[...tracks.map(t=>({id:t.id,name:t.name,kind:'track',city:null,state:t.state,lat:t.lat,lng:t.lng,status:'open',access:'public',has_trails:t.id==='t-dade',trail_miles:null,widths:[],trail_map:false})),
 ...AREAS.filter(a=>AREA_PLACES[a.id]).map(a=>{const [name,state,lat,lng]=AREA_PLACES[a.id];const c=lat==null?centerOf(a.id):null;return {id:a.id,name,kind:'riding_area',city:null,state,lat:lat??c?.lat??null,lng:lng??c?.lng??null,...(c?{approx:true}:{}),status:'open',access:'public',has_trails:true,trail_miles:a.trail_miles,widths:widthsOf(a.vehicles),trail_map:lineCount(a.id)>0};})].sort((x,y)=>x.name.localeCompare(y.name));
tracks.push(...placeRows.filter(r=>r.kind==='riding_area').map(r=>({id:r.id,name:r.name,state:r.state,lat:r.lat,lng:r.lng,aliases:[],kind:'riding_area'})));
function decodeLine(s){const out=[];let i=0,lat=0,lng=0;const next=()=>{let shift=0,r=0,b;do{b=s.charCodeAt(i++)-63;r|=(b&0x1f)<<shift;shift+=5;}while(b>=0x20&&i<=s.length);return r&1?~(r>>1):r>>1;};while(i<s.length){lat+=next();lng+=next();out.push([lng/1e5,lat/1e5]);}return out;}
// Ride-day features (Right now, riding here today, What I ran here, share link): sample answers for the phone checks.
let presenceMe=false,share=null,contacts=[],myName='';
const live={window_hours:6,checkins:4,latest_minutes_ago:12,statuses:[{id:'watering',label:'Watering now',riders:1,minutes_ago:12},{id:'muddy',label:'Muddy',riders:2,minutes_ago:25},{id:'busy',label:'Busy',riders:3,minutes_ago:40}],as_of:iso(now)};
const others=[{user_id:'r2',handle:'jt_moto',display_name:'Jake T.',me:false},{user_id:'r3',handle:'sarah_mx',display_name:'Sarah K.',me:false}];
const W=(t,c,w)=>({temp_f:t,conditions:c,wind_mph:w,humidity_pct:62,observed_at:iso(now-12*day)});
const visits=[{day:new Date(now-12*day).toISOString().slice(0,10),weather:W(78,'Partly Cloudy',9),report:{ridden_on:'',tags:['sand','ruts_deep','watered'],tire:'Dunlop MX33',front_psi:12.5,rear_psi:12,setup_text:'',note:'Rear was kicking in the whoops by the end.',weather:W(78,'Partly Cloudy',9)},logs:[{id:'v1',recorded_at:iso(now-12*day),bike_id:bike.id,settings:{fork_compression:14,fork_rebound:15,shock_compression:15,shock_rebound:15,rider_sag_mm:105},change_made:'Shock rebound: 2 clicks slower',result:'better',notes:'',conditions:'',weather:W(78,'Partly Cloudy',9)}]},
 {day:new Date(now-40*day).toISOString().slice(0,10),weather:W(84,'Sunny',5),report:null,logs:[{id:'v2',recorded_at:iso(now-40*day),bike_id:bike.id,settings:{fork_compression:12,shock_compression:14,rider_sag_mm:104},change_made:'Fork compression: 2 clicks stiffer',result:'no_change',notes:'',conditions:'',weather:W(84,'Sunny',5)}]}];
const profile={...rider,bio:'Vet B. Sand tracks mostly.',created_at:iso(now-200*day),avatar_photo_id:null};
const entitlement={status:'trialing',current_period_end:iso(now+20*day),cancel_at_period_end:false};
const coverage={specs:1581,suspension_settings:41,torque_values:631,parts_catalog:{complete:true,part_count:912},workshop_guides:18};
const J=(body,status=200)=>({status,body});const ndjsonR=events=>({status:200,events});
const CL=(i,st,prop)=>({id:'cl'+i,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:prop==='service_interval'?'maintenance':'specification',property:prop||'specification',statement:st,source_url:'https://example.invalid/manual.pdf',source_locator:'PDF page '+(100+i)+'; printed '+(98+i),status:'VERIFIED',has_conflict:false});
const CLAIMS=[CL(1,'Capacities / Engine oil: 1.10 l (1.16 qt.); Engine oil (SAE 10W/50). Applies to the US standard model named.'),CL(2,'Engine / Valve clearance / Intake at: 0.10 … 0.15 mm (0.0039 … 0.0059 in). Applies to the US standard model named.'),CL(3,'Engine / Valve clearance / Exhaust at: 0.20 … 0.25 mm (0.0079 … 0.0098 in). Applies to the US standard model named.'),CL(4,'Shock absorber / Riding sag: 105 mm. Applies to the US standard model named.'),CL(5,'Shock absorber / Static sag: 35 mm. Applies to the US standard model named.'),CL(6,'Fork / Compression damping / Standard: 12 clicks. Counted counterclockwise.'),CL(7,'Fork / Rebound damping / Standard: 18 clicks. Counted counterclockwise.'),CL(8,'Shock absorber / Rebound damping / Standard: 15 clicks. Counted counterclockwise.'),CL(9,'Chassis / Offroad tire pressure / front: 1.0 bar (15 psi). Applies to the US standard model named.'),CL(10,'Chassis tightening torques / Nut, rear wheel spindle (M20x1.5): 80 Nm (59 lbf ft). Applies to the US standard model named.','torque'),CL(11,'Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm (18.4 lbf ft); Loctite® 243. Applies to the US standard model named.','torque'),CL(12,'Engine tightening torques / Spark plug (M10x1): 10 … 12 Nm (7.4 … 8.9 lbf ft). Applies to the US standard model named.','torque'),CL(13,'Service schedule / Change the engine oil and the oil filter: every 10 operating hours. From the manufacturer service schedule.','service_interval'),CL(14,'Engine / Spark plug: NGK LMAR8DI-10. Applies to the US standard model named.'),CL(18,'Service schedule / Check the fork bearing for play: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(19,'Service schedule / Check that the brake linings of the front brake are secured: once after 1 operating hour; every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months. From the manufacturer service schedule.','service_interval'),CL(20,'Service schedule / Service the fork: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(21,'Service schedule / Service the fork.: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(16,'Engine oil requirements: Fully synthetic SAE10W/50; JASO T903 MA2.'),CL(17,'Service schedule / Change the engine oil and the oil filter, clean the oil screens: once after 1 operating hour; every 15 operating hours. From the manufacturer service schedule.','service_interval'),CL(15,'Capacities / Coolant: 1.20 l (1.27 qt.); Coolant. Applies to the US standard model named.')];
// EXPO_PUBLIC_SAMPLE_USAGE picks the plan state the sample rider is in, for checking the Pro flow on a simulator:
// 'free_out' (all free sets used; /api/chat refuses with 429), 'free_set_done' (this set used, sets waiting),
// 'free_last' (riding the last set), 'premium_out' (today's Premium questions used). Default: Pro.
const USAGE_STATE=process.env.EXPO_PUBLIC_SAMPLE_USAGE||'';
const usage={
 free_out:{tier:'free',daily_limit:0,unlimited:false,used_today:0,remaining_today:0,credits:0,trial:{blocks:7,size:20,started:7,remaining_sets:0},access_mode:'subscription'},
 free_set_done:{tier:'free',daily_limit:0,unlimited:false,used_today:0,remaining_today:0,credits:0,trial:{blocks:7,size:20,started:2,remaining_sets:5},access_mode:'subscription'},
 free_last:{tier:'free',daily_limit:0,unlimited:false,used_today:0,remaining_today:0,credits:12,trial:{blocks:7,size:20,started:7,remaining_sets:0},access_mode:'subscription'},
 premium_out:{tier:'premium',daily_limit:100,unlimited:false,used_today:100,remaining_today:0,credits:0,trial:null,access_mode:'subscription'},
}[USAGE_STATE]||{tier:'pro',daily_limit:0,unlimited:true,used_today:3,remaining_today:0,credits:0,trial:null,access_mode:'subscription'};
const USED_UP=['free_out','free_set_done','premium_out'].includes(USAGE_STATE);
// Fuel plan rider: an adult profile (weight only scales portions; it never shows on the plan). Saved by PUT and kept for this run.
let fuelProfiles=STORE?[{id:'f1',kind:'self',name:'',weight_kg:86.2,weight_unit:'lb',height_cm:180,age:34,sex:'male',nervous_stomach:false,caffeine:true,moto_minutes:20,sweat_rate_lph:null,sweat_test_at:null,sweat_test_hot:null,screen:[],cleared:false,created_at:iso(now-30*day),updated_at:iso(now-30*day)}]:[];
let sent=false;
/** Answers one /api call: {status,body} for JSON or {status,events} for the streamed chat. q has get(name). */
let addedBike=null,savedParts=[];
let invite={code:'KYLE-7Q2',link:'https://bakmx.com/invite/KYLE-7Q2',message:'Come ride with me on BAK MX: specs, setup and answers for your exact bike. Use my code KYLE-7Q2 when you sign up: https://bakmx.com/invite/KYLE-7Q2',joined:4,waiting:1,questions_earned:40,paying:3,months_earned:1,months:[{seq:1,tier:'premium',how:'unlock',ends_at:new Date(Date.now()+18*864e5).toISOString(),offer_code:null}],invited_by:false,can_enter:true};
const stores=(pn,factory)=>factory?[{store:'MotoSport',url:'https://www.motosport.com/oem-parts/part-number/'+pn,how:'listing'}]:[{store:'MotoSport',url:'https://www.motosport.com/search?textsearch='+pn,how:'listing'}];
function respond(p,q,method,post){
 if(p==='/api/bikes'){if(method==='POST')addedBike={...bike,...(post||{}),id:bike.id};return J(method==='GET'?(NEW_RIDER?(addedBike?[addedBike]:[]):LONG_BIKE?[bike,bike2,bike3]:[bike,bike2]):{...(addedBike||bike)});}
 if(p==='/api/invite')return J(invite);
 if(p==='/api/invite/redeem'){const c=String((post&&post.code)||'').toUpperCase();if(!/^[A-Z0-9]{2,8}-[A-Z0-9]{3,4}$/.test(c))return J({error:'That code is not right. Check it with your friend.'},400);invite={...invite,invited_by:true,can_enter:false};return J(invite);}
 if(p==='/api/parts/find'&&q.get('system')){const sysKey=q.get('system');const am=(brand,name,type,pn,note)=>({kind:'aftermarket',brand,name,part_number:pn,numbers:[pn],where:sysKey,type,note,stores:stores(pn,false)});
  const list=sysKey==='clutch'?[am('Rekluse','RadiusCX auto clutch','Auto clutch','RMS-7913191','Auto clutch: pull away and stop without the lever.'),am('Rekluse','Core EXP 3.0','Auto clutch','RMS-7713191'),am('Rekluse','TorqDrive clutch pack','Plates','RMS-2813072','More plates in the stock basket for more grip.'),am('Hinson','FSC clutch plate and spring kit','Plates','FSC154-8-001'),am('Hinson','Billetproof clutch basket','Basket or hub','H654'),am('Hinson','Billetproof clutch cover','Clutch cover','C654'),am('Rekluse','Clutch cover','Clutch cover','RMS-401')]:[];
  const types=[];for(const x of list){const t=types.find(y=>y.label===x.type);if(t)t.count++;else types.push({label:x.type,count:1});}
  return J({query:'',system:sysKey,types,has_factory_list:true,has_aftermarket_list:true,aftermarket:list,factory:sysKey==='clutch'?[{kind:'factory',brand:'KTM',name:'Clutch plate pack',part_number:'79332010033',numbers:['79332010033'],where:'CLUTCH',stores:stores('79332010033',true)},{kind:'factory',brand:'KTM',name:'Pressure plate',part_number:'79332003000',numbers:['79332003000'],where:'CLUTCH',stores:stores('79332003000',true)}]:[]});}
 if(p==='/api/parts/find'){const w=(q.get('q')||'').toLowerCase();const hit=/pad|brake/.test(w);return J({query:q.get('q')||'',has_factory_list:true,has_aftermarket_list:true,
  factory:hit?[{kind:'factory',brand:'KTM',name:'BRAKE PAD SET REAR TOYO',part_number:'54813090300',numbers:['54813090300'],position:'rear',where:'REAR BRAKE CALIPER',stores:stores('54813090300',true)},{kind:'factory',brand:'KTM',name:'Brake pad front',part_number:'77713030100',numbers:['77713030100'],position:'front',where:'FRONT BRAKE CALIPER',stores:stores('77713030100',true)}]:[],
  aftermarket:hit?[
   {kind:'aftermarket',brand:'KTM PowerParts',name:'Brake pad',part_number:'54813990100',numbers:['54813990100','54813990200','59013930200'],where:'brakes',stores:stores('54813990100',false)},
   {kind:'aftermarket',brand:'All Balls',name:'Sintered Brake Pads',part_number:'18-8001',numbers:['18-8001','18-8002','18-8003','18-8004','18-8005'],where:'brakes',note:'Sintered metal compound for wet and muddy use.',stores:stores('18-8001',false)},
   {kind:'aftermarket',brand:'All Balls',name:'Brake Pad Retaining Pin Kit',part_number:'18-7000',numbers:['18-7000','18-7002'],where:'brakes',stores:stores('18-7000',false)},
   {kind:'aftermarket',brand:'BILT',name:'FACTORY FA181R Sintered Front Brake Pads',part_number:'YL-F073',numbers:['YL-F073'],position:'front',where:'brakes',stores:stores('YL-F073',false)},
   {kind:'aftermarket',brand:'BILT',name:'FACTORY FA368R Sintered Rear Brake Pads',part_number:'YL-F152',numbers:['YL-F152'],position:'rear',where:'brakes',stores:stores('YL-F152',false)},
   {kind:'aftermarket',brand:'Braking',name:'CM44 Sintered Sport Brake Pads',part_number:'703CM44',numbers:['703CM44','772CM44','705CM44'],where:'brakes',stores:[]},
   {kind:'aftermarket',brand:'Galfer',name:'Sintered rear brake pads',part_number:'FD326G1396',numbers:['FD326G1396'],position:'rear',where:'brakes',stores:stores('FD326G1396',false)},
   {kind:'aftermarket',brand:'Renthal',name:'RC-1 Works rear brake pads',part_number:'BP-105',numbers:['BP-105'],position:'rear',where:'brakes',stores:stores('BP-105',false)}]:[]});}
 if(p==='/api/saved-parts'){if(method==='POST'){savedParts=[{id:'sp-'+(savedParts.length+1),...post,stores:stores(post.part_number,post.kind==='factory')},...savedParts];return J({saved:true},201);}if(method==='DELETE'){savedParts=savedParts.filter(x=>x.id!==q.get('id'));return J({deleted:true});}return J(savedParts);}
 // Talk to BAK: the sample rider is on Pro with most of the month left, so the voice screen can be opened and photographed. A talk itself needs a real build.
 if(p==='/api/voice')return J({allowed:true,seconds_included:3600,seconds_used:420,seconds_left:3180});
 if(p==='/api/coverage')return J(coverage);
 if(p==='/api/entitlement')return J(entitlement);
 if(p==='/api/profile')return J(NEW_RIDER&&method==='GET'?null:profile);
 if(p==='/api/profiles'){const id=q.get('id');if(id&&id!==USER){const who=id==='other'?gf:{...rider,user_id:id,handle:'rider',display_name:'Rider',bio:'',created_at:iso(now-90*day)};return J({profile:{...who,created_at:who.created_at||iso(now-300*day)},bikes:[],posts:posts.filter(x=>x.user_id===id).map(({author,mine,...x})=>x),mine:false});}return J({profile:profile,bikes:[{id:bike.id,label:'2025 KTM 450 SX-F',photos:[],sheet:'mine'}],posts:[],mine:true});}
 if(p==='/api/conversations')return J(method==='GET'?(q.get('bike_id')===bike.id?(STORE?[raceConversation,conversation]:[conversation]):[]):{...conversation,id:'44444444-4444-4444-8444-444444444444',title:(post&&post.title)||'New chat',mode:(post&&post.mode)||'ask'});
 if(p==='/api/messages'){const cid=q.get('conversation_id');if(chats[cid])return J(chats[cid]);if(STORE&&cid===raceConversation.id)return J(raceMessages);return J((sent||cid===conversation.id)?messages.map(m=>({...m,conversation_id:cid})):[]);}
 if(p==='/api/chat'&&USED_UP)return J({error:"You've used your free questions. Add a credit pack or choose Premium or Pro to keep asking BAK."},429);
 if(p==='/api/chat'){sent=true;const cid=(post&&post.conversation_id)||conversation.id,text=(post&&post.message)||'',a=pickAnswer(text),t=new Date().toISOString();const m={id:'m-'+Date.now(),conversation_id:cid,user_id:USER,role:'assistant',content:a.answer,response:a,created_at:t};chats[cid]=[...(chats[cid]||[]),{id:'u-'+Date.now(),conversation_id:cid,user_id:USER,role:'user',content:text,response:null,created_at:t},m];return ndjsonR([{type:'status',stage:'reading'},{type:'draft',summary:a.summary,answer:firstSentence(a.answer)},{type:'status',stage:'writing'},{type:'done',message:m}]);}
 if(p==='/api/services')return method==='GET'?J(services):J(method==='DELETE'?{ok:true}:{...services[0],id:'s-new'});
 if(p==='/api/service-plan')return J({items:plan,source:'manufacturer schedule'});
 if(p==='/api/setup-logs')return J(method==='GET'?setupLogs:{...setupLogs[0],id:'l-new'});
 if(p==='/api/events')return J(method==='GET'?events:{...events[0],id:'e-new'});
 if(p==='/api/posts')return J(method==='GET'?(STORE?[storePosts[0],posts[1],storePosts[1],posts[0]]:posts):{...posts[0],id:'p-new'});
 if(p.startsWith('/api/posts/'))return J([]);
 if(p==='/api/threads')return J(threads);
 if(p==='/api/thread')return J({rider:threads[0].rider,messages:[{id:'t1',body:'See you at Dade Saturday?',created_at:new Date(Date.now()-7200000).toISOString(),mine:false}]});
 if(p==='/api/comments'){const pid=(post&&post.post_id)||q.get('post_id');if(method==='POST'){comments[pid]=[...(comments[pid]||[]),{id:'k'+Date.now(),post_id:pid,user_id:USER,body:post.body,created_at:new Date().toISOString(),author:rider,mine:true}];return J({ok:true},201);}return J(comments[pid]||[]);}
 if(p==='/api/parts/catalog')return J({catalog:{id:'pc',source:'KTM',source_url:'',scope_label:'',complete:true,assembly_count:8,part_count:300},assemblies:['FRONT FORK, TRIPLE CLAMP','SHOCK ABSORBER','SWING ARM','CYLINDER HEAD','CLUTCH','FRONT WHEEL','REAR BRAKE CALIPER','TANK, SEAT','HANDLEBAR, CONTROLS','EXHAUST SYSTEM','WP SHIMS FOR SETTING','TRANSMISSION II - COUNTERSHAFT'].map((n,i)=>({id:'a'+i,name:n,diagram_url:'',source_url:'',position:i}))});
 if(p==='/api/coaching')return J(coaching);
 if(p==='/api/race-checklist')return J(checklist);
 if(p==='/api/tracks')return J(tracks);
 if(p==='/api/where-to-ride')return J(placeRows);
 if(p==='/api/riding-area'){const r=placeRows.find(x=>x.id===q.get('id'));if(!r)return J({error:'Place not found'},404);const a=AREAS.find(x=>x.id===r.id)||null;
  return J({...r,area:a,tracks_on_site:r.id==='t-dade'?['Main MX track','Vet track','Pee-wee track','Woods loop']:[],website:null,phone:null,trail_lines:lineCount(r.id),map_date:lineCount(r.id)?'2026-11-15':null,layout_notes:null});}
 if(p==='/api/place-weather')return J({today:{available:true,date:q.get('day'),day:'Mostly sunny',night:'Clear',high_f:68,low_f:44,rain_chance_pct:10,wind:'NW 5 mph',rain_days_before:[]},tomorrow:{available:true,date:'',day:'Chance of showers',night:'Showers likely',high_f:63,low_f:47,rain_chance_pct:40,wind:'S 10 mph',rain_days_before:[]}});
 if(p==='/api/trail-lines'){const id=q.get('id');return J({map_date:'2026-11-15',lines:LINES.filter(l=>l.track_id===id).map(l=>({id:l.id,name:l.name,number:l.number,width:l.width,vehicles:{},dates_open:l.dates_open,miles:l.miles,line:decodeLine(l.line)}))});}
 if(p==='/api/photos')return J(method==='DELETE'?{ok:true}:[]);
 // Phone sample mode: a picked photo "uploads" (the app skips the storage call), so the attachment strip can be checked.
 if(p==='/api/photos/upload')return J({id:'photo-'+Math.random().toString(36).slice(2,10),path:'sample/'+Date.now()+'.jpg',token:'sample'});
 if(p==='/api/garage-sharing')return J({show_on_profile:false,photo_ids:[],build_sheet_public:false});
 if(p==='/api/build-sheet')return J(null,404);
 if(p==='/api/claims')return J(CLAIMS);
 if(p==='/api/claims/search')return J(CLAIMS.filter(c=>c.statement.toLowerCase().includes((q.get('q')||'').toLowerCase().split(' ')[0])));
 if(p==='/api/parts-catalog'||p.startsWith('/api/parts'))return J(null,404);
 if(p==='/api/blocks')return J([]);
 if(p==='/api/usage')return J(usage);
 if(p==='/api/usage/next-set')return J(usage);
 if(p==='/api/fuel-profiles'){if(method==='GET')return J(fuelProfiles);if(method==='DELETE'){fuelProfiles=fuelProfiles.filter(r=>r.id!==q.get('id'));return J({ok:true});}const b=post&&typeof post==='object'?post:{};const saved={...(fuelProfiles.find(r=>r.id===b.id)||{}),...b,weight_kg:b.weight_unit==='lb'?Math.round(Number(b.weight)*0.45359237*10)/10:Number(b.weight),created_at:iso(now),updated_at:iso(now)};fuelProfiles=[...fuelProfiles.filter(r=>r.id!==saved.id),saved];return J(saved);}
 if(p==='/api/tuning-notes')return J(method==='GET'?[]:{...(post||{}),id:'n-new',created_at:iso(now),updated_at:iso(now)});
 if(p==='/api/notifications')return J([]);
 if(p==='/api/notification-settings')return J({});
 if(p==='/api/track-reports/summary')return J(null);
 if(p==='/api/track-reports')return J([]);
 if(p==='/api/track-checkins')return J(method==='GET'?{...live,as_of:iso(Date.now())}:{id:'c-new',track_id:'t-dade',statuses:(post&&post.statuses)||[],created_at:iso(Date.now())},method==='GET'?200:201);
 if(p==='/api/track-presence'){if(method==='POST')presenceMe=true;if(method==='DELETE')presenceMe=false;const riders=[...(presenceMe?[{user_id:USER,handle:rider.handle,display_name:rider.display_name,me:true}]:[]),...others];return J({count:riders.length,me:presenceMe,riders});}
 if(p==='/api/track-history')return J({track:{id:'t-dade',name:'Dade City MX'},visits});
 if(p==='/api/safety-contacts/name'){myName=post.name||'';return J({my_name:myName});}
 if(p==='/api/safety-contacts'){if(method==='POST'){contacts.push({id:'sc'+contacts.length,name:post.name,phone:post.phone||'',email:post.email||''});if(post.my_name)myName=post.my_name;}if(method==='DELETE')contacts=contacts.filter(c=>c.id!==q.get('id'));return J({contacts:contacts.map(c=>({...c})),email_ready:true,my_name:myName},method==='POST'?201:200);}
 if(p==='/api/ride-share'){if(method==='POST'){const n=Date.now(),bb=n+((post&&post.back_by_min)||120)*60e3;share={id:'44444444-4444-4444-8444-444444444444',rider_name:(post&&post.rider_name)||'',created_at:iso(n),back_by:iso(bb),alert_at:iso(bb+30*60e3),expires_at:iso(bb+270*60e3),ended_at:null,url:'https://bakmx.com/s/SAMPLEsampleSAMPLEsampleSAMPLEsa',contacts:contacts.map(c=>({name:c.name,phone:c.phone,has_email:!!c.email})),emailed:contacts.some(c=>c.email),email_ready:true};return J(share,201);}return J(share);}
 if(p==='/api/ride-share/extend'){const add=((post&&post.minutes)||30)*60e3;share={...share,back_by:iso(Date.parse(share.back_by)+add),alert_at:iso(Date.parse(share.alert_at)+add),all_clear_sent:false};return J(share);}
 if(p==='/api/ride-share/end'){share=null;return J({ended:true,all_clear_sent:false});}
 if(p==='/api/ride-share/position')return J({updated:true});
 if(p==='/api/bike-hours'){bike.engine_hours=Math.round((bike.engine_hours+((post&&post.add_hours)||0))*10)/10;return J(bike);}
 if(p==='/api/rsvps')return J([]);
 if(p==='/api/receipts')return J([]);
 if(p==='/api/reports')return J([]);
 if(p==='/api/preferences')return J({units:'us',answer_length:'full',tone:'straight',...(post||{})});
 return J([]);
}
module.exports={respond,CLAIMS,USER,bike,bike2,conversation,messages,answer,services,plan,setupLogs,events,posts,threads,coaching,checklist,tracks,rider,
profile,entitlement,coverage};
