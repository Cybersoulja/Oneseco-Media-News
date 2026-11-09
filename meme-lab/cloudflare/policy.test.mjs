import test from 'node:test';
import assert from 'node:assert/strict';
import { MVP_POLICY, assertCapability, assertJobSize } from './policy.mjs';
import { scheduledIntake } from './scheduler.mjs';
test('MVP disables all billable generation and external publishing',()=>{
 assert.equal(MVP_POLICY.dailyScanLimit,1);
 for(const capability of ['paid-video','paid-ai','external-publish']) assert.throws(()=>assertCapability(capability),/disabled/);
});
test('same-day cron triggers use identical idempotency keys',async()=>{
 const messages=[];const env={INTAKE_QUEUE:{send:async value=>messages.push(value)}};
 await scheduledIntake({scheduledTime:Date.parse('2026-11-09T00:00:00Z')},env);
 await scheduledIntake({scheduledTime:Date.parse('2026-11-09T12:00:00Z')},env);
 assert.equal(messages[0].id,messages[1].id);
});
test('oversized job rejected',()=>assert.throws(()=>assertJobSize({text:'x'.repeat(20000)}),/storage budget/));
