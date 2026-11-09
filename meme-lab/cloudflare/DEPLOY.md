# Cloudflare-only deployment (not yet deployed)

No n8n, Docker, OrbStack or always-on local computer is required.

## Provision and deploy
1. From `meme-lab/cloudflare`: `npx wrangler d1 create oneseco-meme-lab`.
2. Copy the D1 database ID into `wrangler.jsonc`.
3. `npx wrangler d1 execute oneseco-meme-lab --remote --file=schema.sql`
4. `npx wrangler queues create oneseco-meme-intake`
5. `npx wrangler secret put NEWSROOM_API_TOKEN`
6. Run `node --test ../workflow.test.mjs *.test.mjs` and `npx wrangler deploy --dry-run`.
7. After validation, `npx wrangler deploy`. Cron is configured for 12:00 UTC daily. Confirm schedule in the Cloudflare dashboard.

## Behavior
Cron -> Queue -> D1 job in `discover` state. No fabricated trends, external generation or public publishing. A separate trend provider and editorial dashboard are still required.

## API
Authenticated `POST /v1/meme-jobs`, `GET /v1/meme-jobs/:id`, and `POST /v1/meme-jobs/:id/advance` are retained. Rendering and publishing each require explicit approval, and the publish stage is state only, not a public post.

## Production hardening
The shared bearer token and caller-provided actor are insufficient for a public editorial interface. Add Cloudflare Access identity verification and per-role authorization before exposing approval endpoints. Add request size limits, rate limits, audit trails and a distinct, independently verified publishing authorization before attaching any posting adapter. Protect source fetches against SSRF and enforce rights checks. Deploying this configuration activates the daily Cron schedule, so review the schedule first.
