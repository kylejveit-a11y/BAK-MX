import test from 'node:test';
import assert from 'node:assert/strict';
import {chatTopic} from '../shared/chat-topic.ts';
test('saved chats get a topic a rider recognises',()=>{
 assert.equal(chatTopic('Walk me through setting sag'),'Suspension');
 assert.equal(chatTopic('Should I run a 18in rear or a 19in rear wheel for motocross'),'Wheels & tires');
 assert.equal(chatTopic('My bike backfires lately when riding it hard. Not all the time but every once in a while. Is that no'),'Engine & fuel');
 assert.equal(chatTopic('What’s the rear axle nut torque?'),'Torque spec');
 assert.equal(chatTopic('When should I change the oil?'),'Maintenance');
 assert.equal(chatTopic('Hello',null),'General');
 assert.equal(chatTopic('Something odd','diagnose'),'Problem');
});
