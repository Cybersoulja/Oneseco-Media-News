import test from 'node:test';
import assert from 'node:assert/strict';
import { scheduledIntake, consumeIntake } from './scheduler.mjs';
test('scheduled scan queues intake without approval',async()=>{
 const messages=[];
 await scheduledIntake({scheduledTime:Date.parse('2026-11-09T12:00:00Z')},{INTAKE_QUEUE:{send:async m=>messages.push(m)}});
 assert.equal(messages.length,1);
 assert.equal(messages[0].kind,'trend-scan');
 assert.equal('approved' in messages[0],false);
});
test('queue consumer stores unapproved job',async()=>{
 let saved;
 const message={body:{kind:'trend-scan',id:'scan-202611090000',requestedAt:'2026-11-09T12:00:00Z'},ack(){this.acked=true},retry(){throw Error('Unexpected retry')}};
 const env={DB:{prepare(){return {bind(...args){saved=JSON.parse(args[2]);return this},async run(){return {}}}}}};
 await consumeIntake({messages:[message]},env);
 assert.equal(message.acked,true);
 assert.equal(saved.stage,'discover');
 assert.equal(saved.approvedForPublish,false);
});
