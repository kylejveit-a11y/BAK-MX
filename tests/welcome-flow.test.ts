import test from 'node:test';
import assert from 'node:assert/strict';
import {welcomeSteps,shouldShowWelcome} from '../shared/welcome-flow.ts';
test('first-login setup: only new accounts with no bike, once',()=>{
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:false,bikeCount:0,started:false}),false,'waits for the Garage to load');
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:0,started:false}),true);
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:2,started:false}),false,'existing riders never see it');
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:1,started:true}),true,'stays open after the bike is added inside it');
 assert.equal(shouldShowWelcome({done:true,bikesLoaded:true,bikeCount:0,started:true}),false);
});
test('first-login setup: the rider questions need a bike; still shopping skips them',()=>{
 assert.deepEqual(welcomeSteps({hasBike:true}),['hello','bike','you','answers','look','done']);
 assert.deepEqual(welcomeSteps({hasBike:false}),['hello','bike','answers','look','done']);
});
