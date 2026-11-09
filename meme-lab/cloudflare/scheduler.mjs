import { createJob } from '../workflow.mjs';

// Cron produces an intake message only; it cannot approve or publish.
export async function scheduledIntake(controller, env) {
  if (!env.INTAKE_QUEUE) throw new Error('INTAKE_QUEUE binding required');
  const when = new Date(controller.scheduledTime);
  if (Number.isNaN(when.getTime())) throw new Error('Invalid schedule time');
  const id = 'scan-' + when.toISOString().replace(/[^0-9]/g, '').slice(0,12);
  await env.INTAKE_QUEUE.send({ kind:'trend-scan', id, topic:'Daily cultural trend review', requestedAt:when.toISOString() });
}

// Queue consumer stores a reviewable job, not fabricated trend results.
// A real discovery adapter can later attach cited candidate sources.
export async function consumeIntake(batch, env) {
  if (!env.DB) throw new Error('DB binding required');
  for (const message of batch.messages) {
    const data=message.body;
    if (data?.kind !== 'trend-scan' || !/^scan-[0-9]{12}$/.test(data.id)) {
      message.ack();
      continue;
    }
    try {
      const job=createJob({id:data.id,topic:data.topic || 'Daily cultural trend review',now:data.requestedAt});
      await env.DB.prepare('INSERT OR IGNORE INTO meme_jobs (id, version, payload) VALUES (?, 1, ?)').bind(job.id,JSON.stringify(job)).run();
      message.ack();
    } catch(e) {
      message.retry();
    }
  }
}
