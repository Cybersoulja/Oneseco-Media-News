import { createJob, advance } from '../workflow.mjs';
import { scheduledIntake, consumeIntake } from './scheduler.mjs';
import { MVP_POLICY, assertJobSize } from './policy.mjs';

async function readLimitedJson(request) {
  if (Number(request.headers.get('content-length') || 0) > MVP_POLICY.maxRequestBodyBytes) throw new RangeError('Request body too large');
  const reader=request.body?.getReader();
  if (!reader) throw new SyntaxError('Missing JSON body');
  const chunks=[]; let size=0;
  try { while(true) { const {done,value}=await reader.read(); if(done) break; size+=value.byteLength; if(size>MVP_POLICY.maxRequestBodyBytes) throw new RangeError('Request body too large'); chunks.push(value); } }
  finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size); let offset=0;
  for(const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
const safeEqual = (a,b) => { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; let x=0; for(let i=0;i<a.length;i++) x |= a.charCodeAt(i)^b.charCodeAt(i); return x===0; };
async function load(db,id) { const row=await db.prepare('SELECT payload FROM meme_jobs WHERE id = ?').bind(id).first(); return row ? JSON.parse(row.payload) : null; }
async function save(db,job,previousVersion) {
  assertJobSize(job);
  const payload=JSON.stringify(job);
  if(previousVersion === null) {
    await db.prepare('INSERT INTO meme_jobs (id, version, payload) VALUES (?, 1, ?)').bind(job.id,payload).run();
    return;
  }
  const result=await db.prepare('UPDATE meme_jobs SET payload = ?, version = version + 1 WHERE id = ? AND version = ?').bind(payload,job.id,previousVersion).run();
  if(result.meta?.changes !== 1) throw new Error('Concurrent update; retry');
}
export default {
  async scheduled(controller, env) { return scheduledIntake(controller, env); },
  async queue(batch, env) { return consumeIntake(batch, env); },
  async fetch(request,env) {
    if (!env.DB || !env.NEWSROOM_API_TOKEN) return json({error:'Missing DB or API token configuration'},503);
    const token=request.headers.get('authorization')?.replace(/^Bearer /i,'');
    if(!safeEqual(token,env.NEWSROOM_API_TOKEN)) return json({error:'Unauthorized'},401);
    const url=new URL(request.url);
    const parts=url.pathname.split('/').filter(Boolean);
    if(parts[0]!=='v1' || parts[1]!=='meme-jobs') return json({error:'Not found'},404);
    try {
      if(request.method==='POST' && parts.length===2) {
        const input=await readLimitedJson(request);
        if(!validId(input.id)) return json({error:'Invalid job id'},400);
        const job=createJob({id:input.id,topic:input.topic,timezone:input.timezone});
        try { await save(env.DB,job,null); } catch(e) { if(/UNIQUE|constraint/i.test(String(e))) return json({error:'Job already exists'},409); throw e; }
        return json(job,201);
      }
      if(!validId(parts[2])) return json({error:'Invalid job id'},400);
      if(request.method==='GET' && parts.length===3) {
        const job=await load(env.DB,parts[2]); return job ? json(job) : json({error:'Not found'},404);
      }
      if(request.method==='POST' && parts.length===4 && parts[3]==='advance') {
        const input=await request.json();
        if(typeof input.actor!=='string' || !input.actor.trim()) return json({error:'Actor required'},400);
        if(typeof input.approved!=='boolean') return json({error:'approved must be boolean'},400);
        const row=await env.DB.prepare('SELECT version, payload FROM meme_jobs WHERE id = ?').bind(parts[2]).first();
        if(!row) return json({error:'Not found'},404);
        const old=JSON.parse(row.payload);
        // Approval is accepted only from this authenticated editorial endpoint.
        const job=advance(old,input.nextStage,{actor:input.actor,approved:input.approved});
        try { await save(env.DB,job,row.version); } catch(e) { if(/Concurrent update/.test(String(e))) return json({error:'Conflict; retry'},409); throw e; }
        return json(job);
      }
      return json({error:'Not found'},404);
    } catch(e) {
      if(e instanceof SyntaxError) return json({error:'Invalid JSON'},400);
      if(e instanceof RangeError && /too large|exceeds storage/.test(e.message)) return json({error:e.message},413);
      if(e instanceof TypeError || e instanceof RangeError || /Stages must|requires|Actor required/.test(String(e))) return json({error:String(e.message)},400);
      return json({error:'Internal error'},500);
    }
  }
};
