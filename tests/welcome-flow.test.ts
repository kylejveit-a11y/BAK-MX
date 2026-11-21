import test from 'node:test';
import assert from 'node:assert/strict';
import {welcomeSteps,shouldShowWelcome,homeLayoutFromAnswers} from '../shared/welcome-flow.ts';
test('first-login setup: only new accounts with no bike, once',()=>{
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:false,bikeCount:0,started:false}),false,'waits for the Garage to load');
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:0,started:false}),true);
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:2,started:false}),false,'existing riders never see it');
 assert.equal(shouldShowWelcome({done:false,bikesLoaded:true,bikeCount:1,started:true}),true,'stays open after the bike is added inside it');
 assert.equal(shouldShowWelcome({done:true,bikesLoaded:true,bikeCount:0,started:true}),false);
});
test('first-login setup: the rider questions need a bike; still shopping skips them',()=>{
 assert.deepEqual(welcomeSteps({hasBike:true}),['hello','bike','you','answers','look','home','alerts','done']);
 assert.deepEqual(welcomeSteps({hasBike:false}),['hello','bike','answers','look','home','alerts','done']);
});
test('first-login setup: the Home questions switch on only the blocks they ask about',()=>{
 const l=[{id:'ask',on:true},{id:'bike',on:true},{id:'next',on:true},{id:'prep',on:false},{id:'coaching',on:false}];
 assert.deepEqual(homeLayoutFromAnswers(l,{races:true,coaching:null}).filter(b=>b.on).map(b=>b.id),['ask','bike','next','prep']);
 assert.deepEqual(homeLayoutFromAnswers(l,{races:false,coaching:true}).filter(b=>b.on).map(b=>b.id),['ask','bike','next','coaching']);
 assert.deepEqual(homeLayoutFromAnswers(l,{races:null,coaching:null}),l);
});
