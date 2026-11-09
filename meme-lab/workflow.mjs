export const STAGES = Object.freeze(['discover','verify','pitch','script','approve','render','review','publish']);
export const VERSION = '0.0.1';

export function createJob({ id, topic, timezone = 'America/Chicago', now = new Date() }) {
  if (!id || typeof id !== 'string') throw new TypeError('id is required');
  if (!topic || typeof topic !== 'string') throw new TypeError('topic is required');
  new Intl.DateTimeFormat('en-US', { timeZone: timezone });
  const timestamp = new Date(now).toISOString();
  if (Number.isNaN(Date.parse(timestamp))) throw new TypeError('Invalid date');
  return { id, version: VERSION, topic, timezone, createdAt: timestamp, stage: 'discover', approvedForRender: false, approvedForPublish: false, trends: [], artifacts: [], history: [] };
}

export function validateTrend(trend, now = new Date()) {
  if (!trend || typeof trend !== 'object') throw new TypeError('Trend must be an object');
  const { title, sourceUrl, publishedAt, retrievedAt } = trend;
  if (!title || typeof title !== 'string') throw new TypeError('Trend title required');
  const url = new URL(sourceUrl);
  if (!['https:', 'http:'].includes(url.protocol)) throw new TypeError('HTTP(S) source required');
  const published = Date.parse(publishedAt), retrieved = Date.parse(retrievedAt), current = +new Date(now);
  if (![published,retrieved,current].every(Number.isFinite)) throw new TypeError('Invalid trend timestamp');
  if (published > current || current - published > 86400000) throw new RangeError('Trend is outside the last 24 hours');
  if (retrieved > current) throw new RangeError('Retrieval timestamp is in the future');
  return { ...trend, sourceUrl: url.toString() };
}

export function advance(job, nextStage, { actor, approved = false } = {}) {
  const current = STAGES.indexOf(job.stage), next = STAGES.indexOf(nextStage);
  if (current < 0 || next !== current + 1) throw new Error('Stages must advance in order');
  if (!actor) throw new Error('Actor required');
  if (nextStage === 'render' && !job.approvedForRender && !approved) throw new Error('Render requires explicit approval');
  if (nextStage === 'publish' && !job.approvedForPublish && !approved) throw new Error('Publish requires separate approval');
  return { ...job, stage: nextStage, approvedForRender: job.approvedForRender || (nextStage === 'render' && approved), approvedForPublish: job.approvedForPublish || (nextStage === 'publish' && approved), history: [...job.history, { from: job.stage, to: nextStage, actor }] };
}

export async function runAdapter(adapter, method, payload) {
  if (!adapter || typeof adapter[method] !== 'function') throw new Error('Missing adapter: ' + method);
  return adapter[method](payload);
}
