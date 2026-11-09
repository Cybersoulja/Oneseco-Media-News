import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

function mockDB() {
  const rows=new Map();
  return { prepare(sql) { let args=[]; return { bind(...values) { args=values; return this; }, async first() { const row=rows.get(args[0]); return row ? { ...row } : null; }, async run() {
    if(sql.startsWith('INSERT')) { if(rows.has(args[0])) throw Error('UNIQUE constraint failed'); rows.set(args[0],{version:1,payload:args[1]}); return {meta:{changes:1}}; }
    if(sql.startsWith('UPDATE')) { const row=rows.get(args[1]); if(!row || row.version!==args[2]) return {meta:{changes:0}}; rows.set(args[1],{version:row.version+1,payload:args[0]}); return {meta:{changes:1}}; }
    throw Error('Unexpected SQL');
  } }; } }; }
}
const env={DB:mockDB(),NEWSROOM_API_TOKEN:'test-secret'};
function req(path,method='GET',body,auth=true) { return new Request('https://example.com'+path,{method,headers:{...(auth?{authorization:'Bearer test-secret'}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}); }
test('rejects unauthenticated calls',async()=>assert.equal((await worker.fetch(req('/v1/meme-jobs', 'POST',{id:'x',topic:'test'},false),env)).status,401));
test('creates, reads, and gates publishing',async()=>{
 const path='/v1/meme-jobs/test1';
 assert.equal((await worker.fetch(req('/v1/meme-jobs','POST',{id:'test1',topic:'satire'}),env)).status,201);
 assert.equal((await worker.fetch(req(path),env)).status,200);
 let stage='discover';
 for(const nextStage of ['verify','pitch','script','approve']) {const response=await worker.fetch(req(path+'/advance','POST',{nextStage,actor:'editor',approved:false}),env);assert.equal(response.status,200);stage=nextStage;}
 assert.equal((await worker.fetch(req(path+'/advance','POST',{nextStage:'render',actor:'editor',approved:false}),env)).status,400);
 assert.equal((await worker.fetch(req(path+'/advance','POST',{nextStage:'render',actor:'editor',approved:true}),env)).status,200);
 assert.equal((await worker.fetch(req(path+'/advance','POST',{nextStage:'review',actor:'editor',approved:false}),env)).status,200);
 assert.equal((await worker.fetch(req(path+'/advance','POST',{nextStage:'publish',actor:'editor',approved:false}),env)).status,400);
 assert.equal((await worker.fetch(req(path+'/advance','POST',{nextStage:'publish',actor:'editor',approved:true}),env)).status,200);
});
