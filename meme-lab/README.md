# Trend-Setter Meme Lab (v0.0.1)

A human-approved cultural satire production desk for Oneseco Media News / Trend Tribunal.

## Pipeline
1. `discover`: fetch candidate posts from configured providers for the previous 24 hours; record URL, published timestamp, retrieval timestamp, and source.
2. `verify`: editorially confirm context, attribution, reuse rights and whether a topic is appropriate for satire. Do not equate trending with verified.
3. `pitch`: offer 2-3 candidate remixes or accept user-supplied media.
4. `script`: generate original satire, captions and a timed storyboard.
5. `approve`: human approval required before expensive generation or publication.
6. `render`: use pluggable image, video (8-second Veo clips if configured), and voice providers. Voice must be original or licensed, not a clone of Robert Beck.
7. `review`: preview and revise.
8. `publish`: export to a queue only after separate publishing approval.

## Integration
Use `workflow.mjs` as the framework-independent state machine. Cloudflare Cron Triggers and Queues create daily intake jobs directly in D1; no n8n is required. Connect real providers to the adapter interface in `adapters.example.mjs`. No API keys in source control. Store credentials in Cloudflare Worker secrets. Store output in Cloudflare R2 when configured. The original Google workflow is a reference, not an executable dependency.

## Safety and editorial rules
- Record the trend timestamp with an IANA time zone and link to original sources. Never invent social trends or engagement figures.
- Black Twitter is a community descriptor, not a single API feed. Do not claim comprehensive coverage.
- Label synthetic satire and avoid presenting fabricated quotes or media as real news.
- Use an original narrator inspired by literary noir commentary, not an impersonation or voice clone of Iceberg Slim.
- Keep rights, privacy, platform terms, and approval checks in the workflow.

## Status
Cloudflare-only starter committed: job API, D1 persistence, scheduled Queue intake and tests. Not deployed. Real trend search, image/video/audio generation, R2 artifact storage, editorial identity verification and publishing remain unconnected.
