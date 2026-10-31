// Sample data for the signed-in visual check. Nothing here reaches a real backend: Playwright answers every /api call
// and every Supabase call with these objects, so the screens render the way a rider with a bike and an answer sees them.
const USER='00000000-0000-4000-8000-000000000001';
const now=Date.now(),iso=(ms)=>new Date(ms).toISOString(),day=86400000;
const rider={user_id:USER,handle:'bakrider',display_name:'Visual Check',location:'Tampa, FL',riding_class:'Vet B',race_number:'817',avatar_url:undefined};
const bike={id:'11111111-1111-4111-8111-111111111111',user_id:USER,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',nickname:'',engine_hours:64,
 configuration:{geared_weight_lb:'200',skill_level:'Intermediate',discipline:'Motocross',usual_dirt:'Sand',fork_compression:'14',fork_rebound:'15',shock_compression:'15',shock_rebound:'15',rider_sag_mm:'105',front_tire_psi:'12.5',rear_tire_psi:'12.5',exhaust_brand:'FMF',exhaust_name:'Factory 4.1',handlebar_brand:'ODI'},
 created_at:iso(now-40*day),updated_at:iso(now-2*day)};
const bike2={...bike,id:'22222222-2222-4222-8222-222222222222',manufacturer:'Kawasaki',model:'KX450',model_year:2026,engine_hours:3,configuration:{}};
const conversation={id:'33333333-3333-4333-8333-333333333333',user_id:USER,bike_id:bike.id,title:'What does high-speed compression actually do?',mode:'ask',created_at:iso(now-3600000),updated_at:iso(now-3600000)};
const answer={kind:'answer',summary:'High-speed compression controls how the shock resists fast shaft movement, not bike speed.',
 answer:'**High-speed compression controls the shock’s resistance to fast shaft movement—not bike speed.** A square-edged bump at low riding speed can activate it; a smooth roller at high riding speed may be mostly low-speed compression.\n\nOn your 450 SX-F it mainly affects sharp bumps, hard landings and how much the rear gives way under a big hit:\n\n- **More damping, clockwise:** more support and bottoming resistance; too much makes the rear harsh or deflect sideways off edges.\n- **Less damping, counterclockwise:** lets the rear absorb sharp hits more easily; too little can let it blow through travel and bottom.\n\nIt’s the larger outer adjuster on the shock reservoir; the centre clicker controls low-speed compression.\n\n| Setting | Stock | Yours |\n|---|---|---|\n| High-speed compression | 1.5 turns | 1.5 turns |\n| Low-speed compression | 15 clicks | 15 clicks |',
 observations:[],systems:['rear suspension'],hypotheses:[{mechanism:'Rear harshness on square edges often comes from too much high-speed compression for the rider weight.',explains:'Deflection off braking bumps',confirm:'Go 1/4 turn out and ride the same section',reject:'No change after 1/2 turn'}],
 unknowns:['Your current spring rate'],next_step:{action:'Ride the same rough section once at the stock setting, then 1/4 turn softer.',purpose:'Feel the difference before changing anything else.',stop_conditions:['Stop if the rear bottoms hard on landings.']},
 evidence_ids:[],specifications:[{claim_id:'c1',value:'Shock absorber / High-speed compression damping / Standard: 1.5 turns'}],confidence:'SUPPORTED',references:[]};
const messages=[
 {id:'m1',conversation_id:conversation.id,user_id:USER,role:'user',content:'What does high-speed compression actually do?',response:null,created_at:iso(now-3600000)},
 {id:'m2',conversation_id:conversation.id,user_id:USER,role:'assistant',content:answer.answer,response:answer,created_at:iso(now-3590000)}];
const services=[{id:'s1',user_id:USER,bike_id:bike.id,category:'Engine oil',performed_at:iso(now-9*day),engine_hours:58,notes:'Motorex 10W-60, new filter',next_due_hours:73,interval_source:'rider',created_at:iso(now-9*day)},
 {id:'s2',user_id:USER,bike_id:bike.id,category:'Air filter',performed_at:iso(now-2*day),engine_hours:63,notes:'',next_due_hours:null,interval_source:'rider',created_at:iso(now-2*day)}];
const plan=[{category:'Engine oil',every_hours:15,first_hours:1,task:'Change the engine oil and the oil filter',claim_id:'c2',note:null},{category:'Air filter',every_hours:5,first_hours:null,task:'Clean the air filter',claim_id:'c3',note:null},{category:'Valve check',every_hours:30,first_hours:null,task:'Check the valve clearance',claim_id:'c4',note:null}];
const setupLogs=[{id:'l1',user_id:USER,bike_id:bike.id,recorded_at:iso(now-5*day),track:'Dade City MX',conditions:'Loamy, watered, 85°F',engine_hours:62,settings:{fork_compression:'14',shock_rebound:'15'},change_made:'Fork compression 2 clicks softer',result:'better',notes:'Front stopped deflecting off braking bumps.',created_at:iso(now-5*day)}];
const events=[{id:'e1',user_id:'other',title:'Practice day',event_type:'practice',starts_at:iso(now+2*day),ends_at:null,location_name:'Dade City MX',description:'Open practice, all classes.',created_at:iso(now-3*day),canceled_at:null,host:{...rider,user_id:'other',handle:'dademx',display_name:'Dade City MX'},mine:false,going_count:12,interested_count:4,my_rsvp:'going'},
 {id:'e2',user_id:'other',title:'Florida Winter Series Rd 1',event_type:'race',starts_at:iso(now+9*day),ends_at:null,location_name:'Bostwick Creek',description:'Round one.',created_at:iso(now-3*day),canceled_at:null,host:{...rider,user_id:'other2',handle:'fws',display_name:'FWS'},mine:false,going_count:40,interested_count:9,my_rsvp:null}];
const posts=[{id:'p1',user_id:'other',category:'build',body:'Fresh top end, new FMF and a Rekluse. Ready for the winter series.',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-8*day),author:{...rider,user_id:'other',handle:'godfather817',display_name:'God Father 817'},mine:false,like_count:7,liked:false,comment_count:2,photos:[]},
 {id:'p2',user_id:USER,category:'setup_question',body:'Anyone running a 5.0 rear spring at 200 lb geared on the 450? Sag numbers?',bike_label:'2025 KTM 450 SX-F',created_at:iso(now-1*day),author:rider,mine:true,like_count:2,liked:true,comment_count:0,photos:[]}];
const threads=[{rider:{...rider,user_id:'other',handle:'godfather817',display_name:'God Father 817'},last_message:{body:'See you at Dade Saturday?',created_at:iso(now-2*3600000),mine:false},unread:1}];
const coaching=[];
const checklist={items:null};
const tracks=[{name:'Dade City MX',state:'FL',lat:28.4,lng:-82.2},{name:'Bostwick Creek',state:'FL',lat:29.8,lng:-81.6},{name:'WW Ranch',state:'FL',lat:30.2,lng:-81.9}];
const profile={...rider,bio:'Vet B. Sand tracks mostly.',created_at:iso(now-200*day),avatar_photo_id:null};
const entitlement={status:'trialing',current_period_end:iso(now+20*day),cancel_at_period_end:false};
const coverage={specs:1581,suspension_settings:41,torque_values:631,parts_catalog:{complete:true,part_count:912},workshop_guides:18};
const J=(body,status=200)=>({status,body});const ndjsonR=events=>({status:200,events});
const CL=(i,st,prop)=>({id:'cl'+i,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:prop==='service_interval'?'maintenance':'specification',property:prop||'specification',statement:st,source_url:'https://example.invalid/manual.pdf',source_locator:'PDF page '+(100+i)+'; printed '+(98+i),status:'VERIFIED',has_conflict:false});
const CLAIMS=[CL(1,'Capacities / Engine oil: 1.10 l (1.16 qt.); Engine oil (SAE 10W/50). Applies to the US standard model named.'),CL(2,'Engine / Valve clearance / Intake at: 0.10 … 0.15 mm (0.0039 … 0.0059 in). Applies to the US standard model named.'),CL(3,'Engine / Valve clearance / Exhaust at: 0.20 … 0.25 mm (0.0079 … 0.0098 in). Applies to the US standard model named.'),CL(4,'Shock absorber / Riding sag: 105 mm. Applies to the US standard model named.'),CL(5,'Shock absorber / Static sag: 35 mm. Applies to the US standard model named.'),CL(6,'Fork / Compression damping / Standard: 12 clicks. Counted counterclockwise.'),CL(7,'Fork / Rebound damping / Standard: 18 clicks. Counted counterclockwise.'),CL(8,'Shock absorber / Rebound damping / Standard: 15 clicks. Counted counterclockwise.'),CL(9,'Chassis / Offroad tire pressure / front: 1.0 bar (15 psi). Applies to the US standard model named.'),CL(10,'Chassis tightening torques / Nut, rear wheel spindle (M20x1.5): 80 Nm (59 lbf ft). Applies to the US standard model named.','torque'),CL(11,'Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm (18.4 lbf ft); Loctite® 243. Applies to the US standard model named.','torque'),CL(12,'Engine tightening torques / Spark plug (M10x1): 10 … 12 Nm (7.4 … 8.9 lbf ft). Applies to the US standard model named.','torque'),CL(13,'Service schedule / Change the engine oil and the oil filter: every 10 operating hours. From the manufacturer service schedule.','service_interval'),CL(14,'Engine / Spark plug: NGK LMAR8DI-10. Applies to the US standard model named.'),CL(18,'Service schedule / Check the fork bearing for play: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(19,'Service schedule / Check that the brake linings of the front brake are secured: once after 1 operating hour; every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months. From the manufacturer service schedule.','service_interval'),CL(20,'Service schedule / Service the fork: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(21,'Service schedule / Service the fork.: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(16,'Engine oil requirements: Fully synthetic SAE10W/50; JASO T903 MA2.'),CL(17,'Service schedule / Change the engine oil and the oil filter, clean the oil screens: once after 1 operating hour; every 15 operating hours. From the manufacturer service schedule.','service_interval'),CL(15,'Capacities / Coolant: 1.20 l (1.27 qt.); Coolant. Applies to the US standard model named.')];
let sent=false;
/** Answers one /api call: {status,body} for JSON or {status,events} for the streamed chat. q has get(name). */
function respond(p,q,method,post){
 if(p==='/api/bikes')return J(method==='GET'?[bike,bike2]:{...bike});
 if(p==='/api/coverage')return J(coverage);
 if(p==='/api/entitlement')return J(entitlement);
 if(p==='/api/profile')return J(profile);
 if(p==='/api/profiles')return J({profile:profile,bikes:[{id:bike.id,label:'2025 KTM 450 SX-F',photos:[],sheet:'mine'}],posts:[],mine:true});
 if(p==='/api/conversations')return J(method==='GET'?(q.get('bike_id')===bike.id?[conversation]:[]):{...conversation,id:'44444444-4444-4444-8444-444444444444',title:(post&&post.title)||'New chat',mode:(post&&post.mode)||'ask'});
 if(p==='/api/messages'){const cid=q.get('conversation_id');return J((sent||cid===conversation.id)?messages.map(m=>({...m,conversation_id:cid})):[]);}
 if(p==='/api/chat'){sent=true;const m={...messages[1],id:'m-new',conversation_id:(post&&post.conversation_id)||conversation.id,created_at:new Date().toISOString()};return ndjsonR([{type:'status',stage:'reading'},{type:'draft',summary:answer.summary,answer:answer.answer.slice(0,120)},{type:'status',stage:'writing'},{type:'done',message:m}]);}
 if(p==='/api/services')return method==='GET'?J(services):J(method==='DELETE'?{ok:true}:{...services[0],id:'s-new'});
 if(p==='/api/service-plan')return J({items:plan,source:'manufacturer schedule'});
 if(p==='/api/setup-logs')return J(method==='GET'?setupLogs:{...setupLogs[0],id:'l-new'});
 if(p==='/api/events')return J(method==='GET'?events:{...events[0],id:'e-new'});
 if(p==='/api/posts')return J(method==='GET'?posts:{...posts[0],id:'p-new'});
 if(p.startsWith('/api/posts/'))return J([]);
 if(p==='/api/threads')return J(threads);
 if(p==='/api/thread')return J({rider:threads[0].rider,messages:[{id:'t1',body:'See you at Dade Saturday?',created_at:new Date(Date.now()-7200000).toISOString(),mine:false}]});
 if(p==='/api/comments')return J([]);
 if(p==='/api/parts/catalog')return J({catalog:{id:'pc',source:'KTM',source_url:'',scope_label:'',complete:true,assembly_count:8,part_count:300},assemblies:['FRONT FORK, TRIPLE CLAMP','SHOCK ABSORBER','SWING ARM','CYLINDER HEAD','CLUTCH','FRONT WHEEL','REAR BRAKE CALIPER','TANK, SEAT','HANDLEBAR, CONTROLS','EXHAUST SYSTEM','WP SHIMS FOR SETTING','TRANSMISSION II - COUNTERSHAFT'].map((n,i)=>({id:'a'+i,name:n,diagram_url:'',source_url:'',position:i}))});
 if(p==='/api/coaching')return J(coaching);
 if(p==='/api/race-checklist')return J(checklist);
 if(p==='/api/tracks')return J(tracks);
 if(p==='/api/photos')return J([]);
 if(p==='/api/garage-sharing')return J({show_on_profile:false,photo_ids:[],build_sheet_public:false});
 if(p==='/api/build-sheet')return J(null,404);
 if(p==='/api/claims')return J(CLAIMS);
 if(p==='/api/claims/search')return J(CLAIMS.filter(c=>c.statement.toLowerCase().includes((q.get('q')||'').toLowerCase().split(' ')[0])));
 if(p==='/api/parts-catalog'||p.startsWith('/api/parts'))return J(null,404);
 if(p==='/api/blocks')return J([]);
 if(p==='/api/reports')return J([]);
 if(p==='/api/preferences')return J({});
 return J([]);
}
module.exports={respond,CLAIMS,USER,bike,bike2,conversation,messages,answer,services,plan,setupLogs,events,posts,threads,coaching,checklist,tracks,rider,
profile,entitlement,coverage};
