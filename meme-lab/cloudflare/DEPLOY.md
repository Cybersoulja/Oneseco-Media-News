# Deployment checklist (not yet deployed)

The Cloudflare Worker is the persistent job state API. n8n is the intake orchestrator.

1. From `meme-lab/cloudflare`, create a D1 database: `npx wrangler d1 create oneseco-meme-lab`.
2. Copy the returned database ID into `wrangler.jsonc`.
3. Run `npx wrangler d1 execute oneseco-meme-lab --remote --file=schema.sql`.
4. Set a long random bearer secret with `npx wrangler secret put NEWSROOM_API_TOKEN`.
5. Deploy from this folder with `npx wrangler deploy`. Verify the worker URL before use.
6. Import `../n8n/intake.workflow.json` into n8n. Set `MEME_LAB_WORKER_URL` and `MEME_LAB_API_TOKEN` in the n8n environment, or replace the expressions with an n8n credential-backed HTTP Request authentication configuration. Some managed n8n deployments restrict access to environment variables in expressions.
7. Configure n8n webhook authentication (Header Auth or another authenticated upstream) before activating. Do not expose an unauthenticated intake endpoint.
8. Activate only after a test submission and a GET verification. No rendering or publishing service is connected.

## API
- `POST /v1/meme-jobs` body: `{"id":"test-001","topic":"example","timezone":"America/Chicago"}`
- `GET /v1/meme-jobs/test-001`
- `POST /v1/meme-jobs/test-001/advance` body: `{"nextStage":"verify","actor":"editor","approved":false}`
- To advance from `approve` to `render`, set `approved:true` after explicit editor approval.
- To advance from `review` to `publish`, set `approved:true` only after separate explicit editor approval. **This marks workflow state; it does not publish externally.**

## Security limits before production
- This is a single shared API bearer token, not per-editor identity. The actor string is not independently verified. Do not expose the advance endpoint directly to untrusted users. Put it behind a trusted editor-only n8n workflow or Cloudflare Access and enforce identity there.
- Limit intake rates and body sizes upstream; add audit/event logging, stronger role-based authorization, request validation, and an idempotency strategy before public production use.
- Approval flags are workflow gates, not authorization for a publishing adapter. Future publishing must independently verify an authenticated approval record.
- Never use raw untrusted source URLs as server-side fetch targets without SSRF protection.
