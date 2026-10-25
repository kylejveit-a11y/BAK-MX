import test from 'node:test';
import assert from 'node:assert/strict';
import {factSystem,factKind,factLabel} from '../shared/fact-system.ts';

const sys=(statement:string,domain='service',property='specification')=>factSystem({statement,domain,property});
test('the part named in a torque table decides the system, not the table',()=>{
 assert.equal(sys('Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm.'),'Brakes');
 assert.equal(sys('Engine tightening torques / Screw, engine sprocket (M10): 60 Nm.'),'Chain & sprockets');
 assert.equal(sys('Engine tightening torques / Nut, inner clutch hub (M18x1.5): 100 Nm.'),'Clutch');
 assert.equal(sys('Engine tightening torques / Screw, shift lever (M6): 14 Nm.'),'Transmission');
 assert.equal(sys('Chassis tightening torques / Screw, throttle grip (M6): 5 Nm.'),'Controls');
 assert.equal(sys('Chassis tightening torques / Screw, fuel tank spoiler on radiator (M6): 6 Nm.'),'Chassis');
 assert.equal(sys('Chassis tightening torques / Engine bracket screw (M10): 60 Nm.'),'Chassis');
 assert.equal(sys('Chassis tightening torques / Nut, angle lever to link fork (M14x1.5): 80 Nm.'),'Suspension');
 assert.equal(sys('Chassis tightening torques / Nut, fork pivot (M16x1.5): 100 Nm.'),'Chassis');
 assert.equal(sys('Engine tightening torques / Nut, rotor (M12x1): 60 Nm.'),'Electrical & ignition');
});
test('specs, settings and schedules land in the right system',()=>{
 assert.equal(sys('Shock absorber / Spring rate / Weight of rider: 75-85 kg: 45 N/mm.'),'Suspension');
 assert.equal(sys('Fork / Oil capacity, right cartridge: 210 ml.'),'Suspension');
 assert.equal(sys('Capacities / Engine oil: 1.0 l.'),'Oils & fluids');
 assert.equal(sys('Capacities / Coolant: 1.2 l.'),'Cooling');
 assert.equal(sys('Engine / Spark plug: NGK LMAR9AI-10.'),'Electrical & ignition');
 assert.equal(sys('Engine / Primary transmission: 24:72.'),'Transmission');
 assert.equal(sys('Engine / Valve clearance / Exhaust at: 0.12-0.17 mm.'),'Engine');
 assert.equal(sys('Chassis / Maximum permissible front axle load: 145 kg.'),'Dimensions & weight');
 assert.equal(sys('Chassis / Offroad tire pressure / Front: 1.0 bar.'),'Wheels & tires');
 assert.equal(sys('Service schedule / Check the chain, rear sprocket, engine sprocket, and chain guide: every 10 h.','maintenance','service_interval'),'Chain & sprockets');
 assert.equal(sys('Service schedule / Check the link fork: every 45 h.','maintenance','service_interval'),'Chassis');
 assert.equal(sys('Service schedule / Change the glass fiber yarn filling of the main silencer: every 30 h.','maintenance','service_interval'),'Exhaust');
 assert.equal(sys('Front fork: 13 clicks. OEM stock US standard component'),'Suspension');
 assert.equal(sys('Air filter / Air filter element: Wet element.'),'Fuel & air');
 assert.equal(sys('Engine / Design: 1-cylinder 4-stroke engine.'),'Engine');
});
test('kind and label',()=>{
 assert.equal(factKind({statement:'Chassis tightening torques / Screw, top triple clamp (M8): 17 Nm.',property:'specification'}),'torque');
 assert.equal(factKind({statement:'Service schedule / Check the frame: every 10 h.',property:'service_interval',domain:'maintenance'}),'service');
 assert.equal(factKind({statement:'Fork / Compression damping / Standard: 12 clicks.',property:'specification'}),'setting');
 assert.equal(factLabel({statement:'Chassis / Wheelbase: 1485 mm.',property:'specification'}),'Chassis · Spec');
});
