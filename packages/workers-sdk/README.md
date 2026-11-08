# Workers SDK and Wrangler

Related packages: wrangler, miniflare, undici, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## Wrangler and Miniflare

Wrangler and Miniflare share the local request path. Install both independent Bun
prerequisites: [Undici resolution](../bun/README.md#bun-undici-resolution) and
[dispatcher-aware global fetch](../bun/README.md#bun-undici-fetch). The capability
guard below checks that exact registered fetch implementation remains in place.

### wrangler-verified-bun-fetch

Wrangler rejects the Bun fetch route even after the installed Undici and dispatcher adapters are present. The patch admits only the registered, verified fetch implementation and continues to reject an unregistered or replaced fetch.

- Kind: package-patch. Packages: wrangler 4.158.0; undici 8.12.4; miniflare 5.20261104.0-beta. Runtime: Bun 1.4.2.
- Prerequisites: bun-undici-resolution, bun-undici-fetch.
- Upstream: [recorded disposition](https://github.com/cloudflare/workers-sdk/pull/15846#pullrequestreview-5573853511), downstream-only.
- Reusable fork: [codex/bun-local-fetch-capability](https://github.com/iki/workers-sdk/tree/codex/bun-local-fetch-capability), head [31806d8588cfe225f499474c90c42736733488ce](https://github.com/iki/workers-sdk/commit/31806d8588cfe225f499474c90c42736733488ce), comparison base 2c623aa91d1dac5d43b8c66830d3e4b38c4ae32b.
- Artifacts: [patches/wrangler/4.158.0/verified-bun-fetch.patch](../../patches/wrangler/4.158.0/verified-bun-fetch.patch), [patches/wrangler@4.158.0.patch](../../patches/wrangler@4.158.0.patch), [packages/workers-sdk/adapters/verified-bun-fetch.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.mjs), [packages/workers-sdk/adapters/verified-bun-fetch.test.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.test.mjs), [packages/workers-sdk/adapters/wrangler-local.test.mjs](../../packages/workers-sdk/adapters/wrangler-local.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/verified-bun-fetch.test.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.test.mjs), [packages/workers-sdk/adapters/wrangler-local.test.mjs](../../packages/workers-sdk/adapters/wrangler-local.test.mjs).

Requires both independent Undici adapters. Scope changes to the tooling subprocess. Upstream declined Bun compatibility; no new PR is implied. The source-level predicate fixture requires the recorded Workers SDK checkout layout; the local-harness fixture uses exact installed packages. Full application wrappers remain consumer-owned.

Removal: The unpatched pinned Wrangler/Miniflare route works under Bun with dispatchers and retains safe rejection after fetch replacement; assess the independent Undici adapters separately.
