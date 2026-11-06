import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonBikes,reportedBy,type Knowledge} from '../server/knowledge.ts';
import {makerPrecedence,scopeRecalls,riderVin,vinRanges,vinInRange,vinSplit,withChangeLines,proSupercross,supplementalLookups,gearPairs} from '../server/answer-guards.ts';
import {buildEngineeringInput,generateAnswer,responseViolations} from '../server/engineering.ts';
import type {Bike,Claim,Message} from '../shared/types.ts';

const tri=(model:string,model_year:number)=>({manufacturer:'Triumph',model,model_year});
const labels=(m:string,b:{manufacturer:string;model:string;model_year:number})=>comparisonBikes(m,b).map(t=>`${t.label} ${t.relation}`);

test('comparison questions load the other year or the other model, by full or short name',()=>{
 assert.deepEqual(labels('What changed on the 2027 TF 450-X compared to the 2026? Especially suspension settings.',tri('TF 450-X',2027)),['2026 Triumph TF 450-X other_year']);
 assert.deepEqual(labels('What changed for 2027 on the TF 250-X versus 2026?',tri('TF 250-X',2027)),['2026 Triumph TF 250-X other_year']);
 // "what changed" without a year: the previous model year of the same model
 assert.deepEqual(labels("what's changed from last year?",tri('TF 250-X',2026)),['2025 Triumph TF 250-X other_year']);
 assert.deepEqual(labels('What is different on the RC Edition versus a standard TF 450-X?',tri('TF 450-RC Edition',2025)),['2026 Triumph TF 450-X other_model']);
 assert.deepEqual(labels('Is it the same as the 450-X?',tri('TF 450-E',2026)),['2026 Triumph TF 450-X other_model']);
 assert.deepEqual(labels('how is the E different from the X?',tri('TF 450-X',2026)),['2026 Triumph TF 450-E other_model']);
 assert.deepEqual(labels('RC vs mine, what is different?',tri('TF 450-X',2026)),['2025 Triumph TF 450-RC Edition other_model']);
 // Other brands work the same way.
 assert.deepEqual(labels('is the RX different?',{manufacturer:'Honda',model:'CRF450R',model_year:2025}),['2025 Honda CRF450RX other_model']);
 assert.deepEqual(labels('XC-F vs my bike for GNCC?',{manufacturer:'KTM',model:'450 SX-F',model_year:2025}),['2025 KTM 450 XC-F other_model']);
 // No comparison: nothing extra is loaded.
 assert.deepEqual(labels('Front end pushes in flat corners. What do I change first?',tri('TF 450-X',2026)),[]);
 assert.deepEqual(labels('I bought my 2025 in 2024, stock clickers?',tri('TF 250-X',2025)),[]);
 assert.deepEqual(labels('I changed my oil at 10 hours',tri('TF 450-X',2026)),[]);
 // An alias that fits two models (YZ450F and WR450F are both "450F") is not used.
 assert.deepEqual(labels('vs the 450F?',{manufacturer:'Yamaha',model:'YZ450FX',model_year:2025}),[]);
});

const bike={id:'b',user_id:'u',manufacturer:'Triumph',model:'TF 450-X',model_year:2026,variant:'standard',region:'US',nickname:'',engine_hours:null,configuration:{},created_at:'',updated_at:''} satisfies Bike;
const claim=(id:string,statement:string,over:Partial<Claim>={}):Claim=>({id,manufacturer:'Triumph',model:'TF 450-X',model_year:2026,variant:'standard',region:'US',domain:'specification',statement,source_url:'https://example.test/hb.pdf',source_locator:'p. 214',status:'VERIFIED',has_conflict:false,...over});
const row=(id:string,statement:string,values:Record<string,unknown>={},over:Partial<Knowledge>={}):Knowledge=>({id,domain:'identity',topic:'t',statement,tier:'OEM',values,notes:'',confidence:'high',...over});

test('compared bikes reach the model labelled with their own bike and can be cited',async()=>{
 const other=claim('22222222-2222-4222-8222-222222222222','Front fork / Compression damping: 14 clicks out.',{model_year:2026});
 const mine=claim('11111111-1111-4111-8111-111111111111','Front fork / Compression damping: 13 clicks out.',{model_year:2027});
 const b27={...bike,model_year:2027};
 const input=buildEngineeringInput(b27,[],[mine,other],'what changed vs 2026?',[],[],null,false,[],[],[{bike:'2026 Triumph TF 450-X',relation:'other_year',claims:[other]}]);
 assert.deepEqual(input.verified_claims.map(c=>c.id),[mine.id]);// another year's fact never counts as the rider's own
 assert.equal(input.compared_bikes?.[0].bike,'2026 Triumph TF 450-X');
 assert.equal(input.compared_bikes?.[0].verified_claims[0].id,other.id);
 const original=globalThis.fetch,key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;let sent:any;
 try{
  process.env.OPENAI_API_KEY='test-only';process.env.OPENAI_MODEL='test-only';
  const reply={kind:'answer',summary:'Fork compression went from 14 to 13 out.',answer:'Fork compression: **14** clicks out on the 2026, **13** on the 2027.',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:['c1','o1'],specifications:[{claim_id:'c1'},{claim_id:'o1'}],claims:[{claim:'2027 fork compression',tier:'PUBLISHED',evidence_ids:['c1']},{claim:'2026 fork compression',tier:'PUBLISHED',evidence_ids:['o1']}],data_gaps:[],confidence:'SUPPORTED'};
  globalThis.fetch=async(_u,o)=>{sent=JSON.parse(JSON.parse(String(o?.body)).input);return new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(reply)}]}]}));};
  const {response}=await generateAnswer(b27,[],[mine],'what changed vs 2026?',[],undefined,[],[],null,false,[],[],[],null,null,null,null,null,null,[{bike:'2026 Triumph TF 450-X',relation:'other_year',claims:[other]}]);
  assert.equal(sent.compared_bikes[0].verified_claims[0].id,'o1');
  assert.ok(!JSON.stringify(sent).includes(other.id));
  assert.deepEqual(response.evidence_ids,[mine.id,other.id]);
 }finally{globalThis.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key;if(model===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=model;}
});

test('maker documents beat press figures: conflicting gearing is marked and its value dropped',()=>{
 const handbook=[claim('h','Transmission / Final drive ratio: 3.69:1 (48/13). TF450-X')];
 const press=row('K-tf-005','It uses Pirelli MX32 tyres and 13/49 gearing.',{msrp_us:'$10,695',final_drive:'13/49'});
 const [out]=makerPrecedence([press],handbook);
 assert.match(out.maker_conflict??'',/13\/49.*13\/48/);
 assert.equal(out.values.final_drive,undefined);assert.equal(out.values.msrp_us,'$10,695');
 // Agreement, optional sprockets, tuner rows and bikes without verified gearing are left alone.
 assert.equal(makerPrecedence([row('K-a','Stock gearing is 13/48.')],handbook)[0].maker_conflict,undefined);
 assert.equal(makerPrecedence([row('K-b','Optional rear sprockets 49 and 50 are available.',{sprocket:'13/49 optional'})],handbook)[0].maker_conflict,undefined);
 assert.equal(makerPrecedence([row('K-c','A tuner went from 13/48 to 13/49.',{},{tier:'TUNER'})],handbook)[0].maker_conflict,undefined);
 assert.equal(makerPrecedence([press],[])[0].maker_conflict,undefined);
 assert.deepEqual([...gearPairs('3.69:1 (48/13); 13T front, 49T rear')].sort(),['13/48','13/49']);
});

test('a press quote of a maker figure is never PUBLISHED; the maker row still is',()=>{
 assert.equal(reportedBy('OEM','magazine'),'press');assert.equal(reportedBy('OEM','dealer'),'dealer');
 assert.equal(reportedBy('OEM','manufacturer'),undefined);assert.equal(reportedBy('OEM','official recall notice'),undefined);assert.equal(reportedBy('TUNER','magazine'),undefined);
 const rows=[row('K-piston','Triumph quotes a 45-hour piston interval.',{},{reported_by:'press'}),row('K-oem','Valve check at 45 h.'),row('K-gear','13/49 gearing',{},{maker_conflict:'x'})];
 const base={kind:'answer',summary:'s',answer:'a',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,specifications:[],evidence_ids:[],confidence:'LIMITED',garage_updates:[],app_actions:[],data_gaps:[]};
 const v=(claims:object[],confidence='LIMITED')=>responseViolations({...base,confidence,claims} as never,[],[],rows);
 assert.ok(v([{claim:'45 h piston',tier:'PUBLISHED',evidence_ids:['K-piston']}]).some(x=>/press report/.test(x)));
 assert.deepEqual(v([{claim:'45 h piston (press)',tier:'COMMUNITY',evidence_ids:['K-piston']}]),[]);
 assert.ok(v([{claim:'13/49 gearing',tier:'PUBLISHED',evidence_ids:['K-gear']}]).length>0);
 assert.deepEqual(v([{claim:'valve check',tier:'PUBLISHED',evidence_ids:['K-oem']}],'SUPPORTED'),[]);
 assert.ok(v([{claim:'45 h piston',tier:'COMMUNITY',evidence_ids:['K-piston']}],'SUPPORTED').length>0);
});

const recall=row('K-tg-001','All 2025-2026 TF 450 models are recalled in the US because the exhaust rocker arm can seize. Owners are told to stop riding.',{recall_no:'CPSC 26-763',vin_range:'...CD4981 to ...CP1597 (last 6 characters)'},{domain:'known_issues'});
const msg=(role:'user'|'assistant',text:string):Message=>({id:role+text.length,conversation_id:'c',user_id:'u',role,content:role==='user'?text:'',response:role==='assistant'?{summary:'s',answer:text} as never:null,created_at:''});

test('a recall is raised once per conversation and scoped to the VIN',()=>{
 const other=row('K-x','Plush fork.');
 // First mention, VIN unknown: kept, marked as a VIN range the rider has to check.
 const first=scopeRecalls([recall,other],[],'What springs for 90 kg?',null);
 assert.equal(first.notice?.status,'first_mention');assert.deepEqual(first.rows.find(k=>k.id==='K-tg-001')?.recall,{vin_range:true,rider_vin:'vin_unknown'});
 // Already raised earlier in the conversation: dropped, unless the rider asks about it.
 const told=[msg('user','springs?'),msg('assistant','Use 60 N/mm. Separately, the cylinder-head recall covers a VIN range: check your VIN.')];
 const later=scopeRecalls([recall,other],told,'And the clickers?',null);
 assert.deepEqual(later.rows.map(k=>k.id),['K-x']);assert.equal(later.notice?.status,'already_mentioned');
 assert.equal(scopeRecalls([recall,other],told,'Is my bike in that recall?',null).notice?.status,'rider_asked');
 // With a VIN the rider gave, the row says where it falls, never the VIN itself.
 assert.equal(scopeRecalls([recall],[],'q','SMTTF450XCF4102').rows[0].recall?.rider_vin,'in_range');
 assert.equal(scopeRecalls([recall],[],'q','CA1000').rows[0].recall?.rider_vin,'outside_range');
 assert.equal(scopeRecalls([row('K-y','Bikes were recalled for a chain.',{recall_no:'X'},{domain:'known_issues'})],[],'q',null).rows[0].recall?.rider_vin,'no_vin_range');
 assert.deepEqual(scopeRecalls([other],[],'q',null),{rows:[other],notice:null});
});

test('the rider VIN comes from the Garage or what they typed; ranges compare only like with like',()=>{
 assert.equal(riderVin(bike,[],'My VIN ends in CF4102. Does that change any of the answers?'),'CF4102');
 assert.equal(riderVin(bike,[msg('user','my vin is cf4102')],'and the shock?'),'CF4102');
 assert.equal(riderVin(bike,[],"I don't know my VIN range."),null);
 assert.equal(riderVin({configuration:{vin:'SMT-TF250X-CF4102'}} as never,[],'q'),'SMTTF250XCF4102');
 assert.deepEqual(vinRanges('VINs BP6028-CC7868, built 20 July 2023 to 8 August 2024'),[{lo:'BP6028',hi:'CC7868'}]);
 assert.deepEqual(vinRanges('CF3825 onward: handbook 3850672'),[{lo:'CF3825',hi:null}]);
 assert.equal(vinInRange('CF4102',{lo:'CF3825',hi:null}),true);
 assert.equal(vinInRange('CF4102',{lo:'BS4847',hi:'CC7868'}),false);
 assert.equal(vinInRange('JKAKXGMCSA009000',{lo:'JKAKXGMCSA008598',hi:'JKAKXGMCSA011475'}),true);
 assert.equal(vinInRange('009000',{lo:'JKAKXGMCSA008598',hi:'JKAKXGMCSA011475'}),true);
 assert.equal(vinInRange('123456',{lo:'CD4981',hi:'CP1597'}),null);
});

test('VIN-split specs name the ranges and only a maker fact says where the VIN is',()=>{
 const split='TF250-X 2025 TF250-X is split by VIN (BS4847 to CC7868: handbook 3850529; CF3825 onward: handbook 3850672); only rows printed identically in both handbooks are listed';
 const cs=[claim('a','Rear shock / Rebound: 12 clicks out. '+split),claim('b','Tyre pressure: 14 psi. '+split)];
 const none=vinSplit(cs,[],null);
 assert.deepEqual(none?.ranges,['BS4847 to CC7868: handbook 3850529','CF3825 onward: handbook 3850672']);
 assert.equal(none?.rider_vin,'not given');assert.match(String(none?.vin_location),/ask for the VIN without saying where/);
 assert.equal(vinSplit(cs,[],'CF4102')?.matching_range,'CF3825 onward: handbook 3850672');
 assert.equal(vinSplit(cs,[],'AA0001')?.rider_vin,'given but outside every listed range');
 assert.equal(vinSplit(cs,[row('K-v','Handbook covers the TF 250-X.',{vin:'steering head; label on left frame'})],null)?.vin_location,'steering head; label on left frame');
 assert.match(String(vinSplit(cs,[row('K-p','VIN is stamped on the frame.',{},{reported_by:'press'})],null)?.vin_location),/ask for the VIN/);
 assert.equal(vinSplit([claim('c','Rebound: 12 clicks out.')],[],null),null);
});

test('engineering input carries the recall, VIN and pro supercross guards',()=>{
 const input=buildEngineeringInput(bike,[],[],'I am a pro. Supercross whoops setup please',[],[recall]);
 assert.equal(input.recall_notice?.status,'first_mention');assert.ok(input.pro_supercross_request);
 assert.equal((input.bike_knowledge as Knowledge[])[0].recall?.rider_vin,'vin_unknown');
 assert.ok(proSupercross('pro-level SX setup, clicker by clicker',null));assert.ok(!proSupercross('supercross for my kid',null));
 assert.ok(proSupercross('whoops setup',{configuration:{skill_level:'Pro'}}));
 assert.ok(supplementalLookups('pro supercross',null).some(q=>/fork oil level/.test(q)));assert.deepEqual(supplementalLookups('sag?',null),[]);
});

test('every setup change is stated in the prose, so a screenshot without the card is complete',()=>{
 const changes=[{setting:'Fork compression',change:'From 14 to 12 clicks out.'},{setting:'Shock high-speed compression',change:'From 1¼ to 1⅛ turns out.'}];
 const covered='Fork compression: 14 → 12 clicks out.\nShock high-speed compression: 1¼ → 1⅛ turns out.';
 assert.equal(withChangeLines(covered,changes),covered);
 const thin=withChangeLines('Start with compression. Stock fork compression is **14 clicks out**.',changes);
 assert.match(thin,/\*\*Fork compression:\*\* From 14 to 12 clicks out\./);
 assert.match(thin,/\*\*Shock high-speed compression:\*\* From 1¼ to 1⅛ turns out\./);
 assert.equal(withChangeLines('No changes.',[]),'No changes.');
 const rel=[{setting:'Fork compression',change:'Open 2 clicks from your current position.'}];
 assert.match(withChangeLines('Fork compression is 14 clicks out stock.',rel),/Open 2 clicks/);
 assert.equal(withChangeLines('Open fork compression 2 clicks.',rel),'Open fork compression 2 clicks.');
});
