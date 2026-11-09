import test from 'node:test';
import assert from 'node:assert/strict';
import { createJob, validateTrend, advance } from './workflow.mjs';
test('job starts at discover', () => assert.equal(createJob({id:'a',topic:'culture'}).stage,'discover'));
test('rejects uncited trends', () => assert.throws(() => validateTrend({title:'Example',publishedAt:new Date().toISOString(),retrievedAt:new Date().toISOString()})));
test('requires approval to render', () => {
 let job=createJob({id:'b',topic:'culture'});
 for (const stage of ['verify','pitch','script','approve']) job=advance(job,stage,{actor:'editor'});
 assert.throws(()=>advance(job,'render',{actor:'editor'}),/approval/);
 job=advance(job,'render',{actor:'editor',approved:true});
 job=advance(job,'review',{actor:'editor'});
 assert.throws(()=>advance(job,'publish',{actor:'editor'}),/approval/);
 assert.equal(advance(job,'publish',{actor:'editor',approved:true}).stage,'publish');
});
