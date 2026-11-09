// MVP budget policy. No provider invocation is permitted by this module.
export const MVP_POLICY = Object.freeze({
  dailyScanLimit: 1,
  paidVideoEnabled: false,
  externalPublishingEnabled: false,
  paidAiEnabled: false,
  maxQueueMessagesPerBatch: 10,
  maxJobPayloadBytes: 16384,
  maxRequestBodyBytes: 8192,
});
export function assertCapability(capability) {
  if (capability === 'paid-video' && !MVP_POLICY.paidVideoEnabled) throw new Error('Paid video generation disabled for MVP');
  if (capability === 'paid-ai' && !MVP_POLICY.paidAiEnabled) throw new Error('Paid AI generation disabled for MVP');
  if (capability === 'external-publish' && !MVP_POLICY.externalPublishingEnabled) throw new Error('External publishing disabled for MVP');
  if (!['paid-video','paid-ai','external-publish'].includes(capability)) throw new Error('Unknown capability');
}
export function assertJobSize(job) {
  if (new TextEncoder().encode(JSON.stringify(job)).length > MVP_POLICY.maxJobPayloadBytes) throw new RangeError('Job exceeds storage budget');
}
