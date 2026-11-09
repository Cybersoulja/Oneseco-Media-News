# MVP budget policy: existing $5/month Workers subscription

**Policy, not a billing guarantee.** Existing account-wide usage and pricing must be verified in the Cloudflare dashboard before any deployment.

- One Cron trigger per day at 12:00 UTC (07:00 CST / 08:00 CDT). Daily stable scan ID + D1 INSERT OR IGNORE prevent duplicate persisted scans from schedule retries. No real discovery provider is connected.
- Paid video: **disabled**. Paid AI calls: **disabled**. External publishing: **disabled**, even when workflow state reaches `publish`.
- `policy.mjs` rejects forbidden capabilities. Future adapters MUST call `assertCapability` before invoking providers; provider credentials should not be configured for the MVP.
- Queue batch maximum 10, request JSON maximum 8 KiB, persisted job JSON maximum 16 KiB. Queue retries limited to 3.
- No deployment, no resource provisioning and no scheduled activation until tests, Cloudflare plan/usage review, identity-based approval security and explicit deployment authorization.
- D1, Queues, Workers and R2 are shared across the account. Cloudflare can bill overages on a paid plan. These code limits do not constitute an account-level spend cap; set billing alerts and review Cloudflare usage.
- D1 and Queue provisioning are still required. R2 is not connected. Public publishing adapter is intentionally absent.
- The shared bearer token API is not a trustworthy human identity gate. Do not expose it to public users; implement Cloudflare Access role checks before live approval workflows.
