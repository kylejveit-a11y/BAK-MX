/** Authored hypothesis graph, not OEM evidence or a diagnosis. Never supplies specifications. */
export type EngineeringSystem = 'fuel'|'ignition'|'electrical'|'engine'|'intake'|'cooling'|'lubrication'|'clutch'|'transmission'|'suspension'|'chassis'|'brakes';
export type Verification = {
  purpose:string; measurement:string; prerequisites:string[]; safe_first_step:string;
  supports:string; weakens:string; inconclusive_when:string; stop_conditions:string[];
  technician_required:boolean;
};
export type Mechanism = {
  id:string; status:'LIMITED'; authorship:'BAK_AUTHORED_HYPOTHESIS'; systems:EngineeringSystem[];
  component:string; physical_state:string; causal_chain:string[]; possible_observations:string[];
  unknowns:string[]; verification:Verification; corrective_action_gate:string;
};
const professional = ['Exact component identity and applicable OEM procedure verified','Qualified technician and prescribed equipment available'];
function mechanism(id:string, systems:EngineeringSystem[], component:string, state:string, chain:string[], observations:string[], unknowns:string[], measurement:string, supports:string, weakens:string, first:string, stops:string[], technician=true):Mechanism {
  return {id,status:'LIMITED',authorship:'BAK_AUTHORED_HYPOTHESIS',systems,component,physical_state:state,
    causal_chain:chain,possible_observations:observations,unknowns,
    verification:{purpose:`Distinguish ${id} from competing mechanisms`,measurement,
      prerequisites:technician?[...professional]:['Bike secured with engine off and components cool','Use applicable owner manual; do not dismantle safety-critical components'],
      safe_first_step:first,supports,weakens,
      inconclusive_when:'Test conditions, instrument accuracy, component identity or OEM acceptance criteria are unknown; a normal result outside the failure condition does not exclude an intermittent fault.',
      stop_conditions:stops,technician_required:technician},
    corrective_action_gate:'Do not change maps/settings or replace parts on this hypothesis alone. Verify the fault and exact repair applicability first.'};
}
const library:Mechanism[] = [
  mechanism('fuel-delivery-limited',['fuel','electrical'],'Pump, filter, regulator or pump supply','Insufficient fuel delivery under demand',
    ['Delivery cannot meet requested fuel flow','Delivered mixture may deviate from command','Combustion torque becomes inconsistent'],
    ['Hesitation under load','Cutting out after sustained operation','Recovery after cooling or reduced demand'],
    ['Pressure during the complaint','Supply voltage during the complaint','Fuel age and contamination','Filter and pump identity'],
    'Technician correlation of fuel pressure and electrical supply with the complaint under an approved controlled procedure',
    'Delivery falls outside exact OEM criteria while the complaint occurs; further tests distinguish pump, restriction and supply',
    'Delivery and supply remain within applicable criteria during the same complaint; investigate ignition or control faults',
    'With the bike off and cool, record when the fault occurs and check for visible fuel leaks without disconnecting fuel lines.',
    ['Fuel leak or strong fuel odor','Hot surfaces or ignition sources','No safe controlled test facility']),
  mechanism('tank-vent-restriction',['fuel'],'Tank vent path','Restricted replacement-air flow',
    ['Fuel leaving the tank is not adequately replaced by air','Tank pressure can oppose fuel delivery','Fuel flow may decline over time'],
    ['Time-dependent fuel starvation','Recovery after waiting'],['Vent routing and valve identity','Whether venting is obstructed','Fuel-delivery results'],
    'Inspection of vent routing and technician verification of vent operation against the exact manual',
    'A vent restriction is independently demonstrated and consistent with the complaint',
    'Vent path meets applicable inspection criteria; pressure and fuel delivery still require evaluation',
    'With the engine off and cool, visually inspect accessible vent routing for pinching; do not open a hot tank or ride with its cap loose.',
    ['Fuel leak or vapor accumulation','Hot tank','Unknown vent-valve direction or pressure procedure'] ),
  mechanism('ignition-intermittent',['ignition','electrical'],'Coil, plug, connections or ignition supply','Intermittent loss of effective ignition',
    ['Ignition energy or timing becomes inconsistent','Mixture does not burn consistently','Engine torque drops or misfires'],
    ['Misfire','Heat-dependent cutting out','Intermittent loss of power'],['Fault codes','Supply stability','Ignition signal during fault','Plug identity and condition'],
    'Technician comparison of ignition command, supply and effective spark using the applicable protected test method',
    'Ignition failure is observed in the complaint condition with stable upstream supply',
    'Ignition remains correct during the complaint; evaluate fuel, mechanical and sensor alternatives',
    'Record any displayed fault code and inspect accessible wiring visually with power off; do not make an exposed spark near fuel.',
    ['Fuel fumes','Exposed high voltage','Damaged wiring or electrical heating']),
  mechanism('electrical-supply-intermittent',['electrical','fuel','ignition'],'Power, grounds or harness','Intermittent high resistance or connection loss',
    ['Supply or reference signal becomes unstable','Pump, ignition or ECU operation is disrupted','Engine may stop or lose torque'],
    ['Fault associated with heat or vibration','Multiple electrical symptoms','Intermittent no-start'],['Connection condition','Voltage drop during fault','Ground topology'],
    'Technician voltage-drop and circuit-integrity assessment using the exact wiring diagram',
    'Supply disturbance coincides with the complaint and its location is isolated',
    'Relevant supplies and references remain stable during the complaint',
    'With power off, document visible damaged, loose or overheated connections without bridging terminals.',
    ['Hot battery or wiring','Smoke','Short-circuit risk']),
  mechanism('cylinder-sealing-or-decompression',['engine'],'Valves, rings, timing or decompressor','Reduced effective trapped charge or test-method interference',
    ['Charge retention or valve events differ from expectation','Starting combustion may be inadequate','A compression reading may also be influenced by decompression hardware'],
    ['Difficult starting','Abnormal cranking behavior','Low measured compression'],['Exact decompressor design','Cranking method and speed','Valve clearance and timing evidence','Leakdown test conditions'],
    'Technician OEM-specified compression/leakdown and valve-event evaluation accounting for decompression',
    'An applicable test isolates leakage or valve-event error beyond model-specific limits',
    'Validated sealing and valve events are correct; investigate starting fuel and ignition',
    'Record cranking behavior and the method used for any prior compression reading; do not interpret a number without the exact procedure.',
    ['Mechanical knock','Suspected timing failure','Uncontrolled crank movement during pressure testing']),
  mechanism('intake-leak-or-restriction',['intake','fuel'],'Filter, boot or intake tract','Unintended airflow restriction or leakage',
    ['Air reaching the cylinder differs from intended flow','Charge formation or contamination exposure changes','Idle or load response may deteriorate'],
    ['Poor idle','Hesitation','Power loss'],['Filter condition and correct installation','Boot integrity','Sensor strategy'],
    'Engine-off intake inspection and approved technician integrity test',
    'A physical intake defect is demonstrated and compatible with the symptom',
    'Intake integrity and filter condition are verified; evaluate fueling and ignition',
    'With the engine off and cool, inspect accessible filter seating and intake damage using the owner manual; do not spray flammable cleaners into a running engine.',
    ['Loose material could enter engine','Fuel vapor','Unknown disassembly procedure'] ),
  mechanism('cooling-capacity-or-loss',['cooling','engine'],'Radiator, coolant circuit or combustion sealing','Heat rejection or coolant retention inadequate',
    ['Heat input exceeds available heat rejection or coolant is lost','Local temperatures rise','Boiling, power reduction or damage may follow'],
    ['Coolant loss','Boil-over','Overheating indication'],['Cold coolant condition','External leaks','Airflow restriction','Combustion leakage evidence'],
    'Cold visual inspection followed by technician OEM cooling and sealing tests if needed',
    'A leak, obstruction or verified circulation/sealing fault is found',
    'Cooling integrity and operating conditions are verified; reassess heat generation and instrumentation',
    'Stop riding, shut the engine off safely and let it cool fully; inspect for external leakage without removing a hot cooling-system cap.',
    ['Steam or hot coolant','Repeated coolant loss','Overheating indication','Mechanical noise']),
  mechanism('lubrication-compromised',['lubrication','engine'],'Oil supply, filter or lubricated surfaces','Inadequate lubricant supply or unsuitable condition',
    ['Oil film protection may be reduced','Friction and wear increase','Continued operation can cause serious damage'],
    ['Oil-pressure warning if equipped','Abnormal engine noise','Contaminated oil or significant oil loss'],['Exact level-check method','Oil identity','Leak source','Pressure and contamination evidence'],
    'Engine-off OEM level/condition assessment and technician lubrication-system evaluation',
    'Oil supply, contamination or pressure fault is demonstrated by applicable checks',
    'Lubrication checks are normal; unexplained mechanical noise still requires investigation',
    'Stop the engine and do not restart it to reproduce noise or an oil-pressure warning; arrange inspection.',
    ['Oil-pressure warning','Metal contamination','Mechanical knocking','Significant oil loss']),
  mechanism('clutch-slip',['clutch'],'Clutch pack or actuation','Insufficient frictional torque capacity',
    ['Clutch cannot transmit demanded torque','Engine speed can increase without matching drive','Slip generates additional heat'],
    ['RPM flare without corresponding acceleration'],['Wheelspin excluded','Actuation adjustment','Oil compatibility','Plate condition'],
    'OEM engine-off actuation checks and technician clutch inspection if indicated',
    'Actuation or friction components fail applicable criteria and wheelspin is excluded',
    'Clutch behavior meets criteria; assess traction and drivetrain alternatives',
    'Document whether the rear tire was spinning when RPM rose; check accessible controls with engine off before considering adjustment.',
    ['Loss of dependable drive','Burning odor','Unexpected engagement']),
  mechanism('clutch-drag-or-shift-fault',['clutch','transmission'],'Clutch release or gear engagement','Incomplete release or unreliable gear engagement',
    ['Residual drive torque or engagement fault persists','Selecting or retaining a gear becomes unreliable','Unexpected motion or loss of drive can occur'],
    ['Creeping with clutch disengaged','Difficult shifts','Jumping out of gear'],['Drag versus gear-retention symptom','Control function','Oil condition','Internal wear evidence'],
    'Engine-off actuation inspection; gear-retention faults require technician assessment',
    'Release travel or internal engagement fault is demonstrated',
    'No fault found in inspected components; intermittent symptoms remain unresolved',
    'Stop riding if the bike jumps out of gear or moves unexpectedly; record which behavior occurred without repeating a hazardous riding test.',
    ['Unexpected movement','Jumping out of gear','Loss of control']),
  mechanism('suspension-friction-or-damping-fault',['suspension','chassis'],'Fork, shock, linkage or bearings','Binding, leakage or inconsistent damping',
    ['Wheel motion is resisted or controlled inconsistently','Contact and chassis attitude vary','Harshness, deflection or instability may result'],
    ['New harshness','Inconsistent rebound','Fluid leakage','Handling changed after service'],['Component and tune identity','Leakage or bearing play','Service history','Baseline measurements'],
    'Engine-off visual inspection and technician friction, bearing and damper assessment',
    'Binding, looseness, leakage or damper fault is independently identified',
    'Mechanical health is verified before assessing spring, sag, geometry and settings',
    'With the bike secured and engine off, inspect for visible suspension leaks or damage; do not compensate with clickers until faults are excluded.',
    ['Oil near tire or brake','Loose or damaged components','Severe instability','Unsafe lifting/support']),
  mechanism('brake-drag-or-loss',['brakes','chassis'],'Brake friction or hydraulic system','Residual braking or reduced braking capacity',
    ['Brake force no longer follows intended control input','Heat or stopping performance changes','Control margin is reduced'],
    ['Brake drag','Fade','Fluid leak','Changed lever feel'],['Leak or contamination','Cold versus hot behavior','Recent service','Wheel/brake condition'],
    'Engine-off visual inspection and qualified brake-system assessment',
    'Leak, contamination or mechanical/hydraulic fault is found',
    'Inspected system meets applicable criteria; unexplained braking change remains a stop-riding condition',
    'Stop riding and arrange inspection for changed braking performance; do not road-test a suspect brake.',
    ['Reduced braking','Fluid leak','Overheated components','Contaminated friction surfaces']),
];

/** Fixed-size context, independent of rider wording and evaluation fixtures. No rankings imply diagnosis. */
export function getMechanismLibrary(systems?:readonly EngineeringSystem[]):Mechanism[] {
  if (systems?.some(s=>!ENGINEERING_SYSTEMS.includes(s))) throw new RangeError('Unknown engineering system');
  return structuredClone(systems ? library.filter(m=>m.systems.some(s=>systems.includes(s))) : library);
}
export const ENGINEERING_SYSTEMS:readonly EngineeringSystem[] = ['fuel','ignition','electrical','engine','intake','cooling','lubrication','clutch','transmission','suspension','chassis','brakes'];

export type VerificationEvidence = {mechanism_id:string; result:'supports'|'weakens'|'inconclusive'; origin:'observed'|'hypothetical'; applicable_procedure_verified:boolean; complaint_condition_matched:boolean};
/** An assertion or hypothetical cannot eliminate a mechanism. Even a valid test weakens, never proves absence. */
export function summarizeMechanismEvidence(evidence:readonly VerificationEvidence[]) {
  if(evidence.length>200)throw new RangeError('Evidence batch too large');
  const known=new Set(library.map(m=>m.id));
  return evidence.map(e=>{
    if(!known.has(e.mechanism_id))throw new RangeError('Unknown mechanism');
    if(!['supports','weakens','inconclusive'].includes(e.result)||!['observed','hypothetical'].includes(e.origin))throw new RangeError('Invalid evidence classification');
    return {mechanism_id:e.mechanism_id, effect:e.origin==='observed'&&e.applicable_procedure_verified===true&&e.complaint_condition_matched===true?e.result:'inconclusive' as const, diagnostic_status:'UNRESOLVED' as const};
  });
}
