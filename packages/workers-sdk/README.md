# Workers SDK and Wrangler

Related packages: wrangler, miniflare, undici, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

On November 28, 2026, the local Worker harness passed on Windows x64 with the 4.169.0 distribution patch. [Published Wrangler release](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%404.169.0) · [Regression results](HISTORY.md#2026-11-28)

## Wrangler and Miniflare

Wrangler and Miniflare share the local request path. Install both independent Bun
prerequisites: [Undici resolution](../bun/README.md#bun-undici-resolution) and
[dispatcher-aware global fetch](../bun/README.md#bun-undici-fetch). The capability
guard below checks that exact registered fetch implementation remains in place.

### wrangler-verified-bun-fetch

Wrangler rejects the Bun fetch route even after the installed Undici and dispatcher adapters are present. The patch admits only the registered, verified fetch implementation and continues to reject an unregistered or replaced fetch.

- The web profile uses Wrangler 4.169.0, Undici 8.14.0 and Miniflare 5.20261127.0-beta on Bun 1.4.5. The 4.158.0 patch passed with Undici 8.12.4 and Miniflare 5.20261104.0-beta on Bun 1.4.2.
- Prerequisites: bun-undici-resolution, bun-undici-fetch.
- Upstream: [recorded disposition](https://github.com/cloudflare/workers-sdk/pull/15846#pullrequestreview-5573853511), downstream-only.
- The signed 4.169.0 fork commit `e7478dea71b0a0240aa6888099fec83d8b418198` is based directly on the published release commit `370ea36c3b25414b7ee521238db8cbd54e19e522`. [Versioned fork](https://github.com/iki/workers-sdk/tree/codex/bun-local-fetch-capability-4.169.0) · [Setup and regression commands](https://github.com/iki/workers-sdk/blob/e7478dea71b0a0240aa6888099fec83d8b418198/downstream/VERIFIED-BUN-FETCH.md)
- The 4.165.0 fork branch [codex/bun-local-fetch-capability-4.165.0](https://github.com/iki/workers-sdk/tree/codex/bun-local-fetch-capability-4.165.0) points to [8a26b5b15b17a2e4fd05722994ebe9269b855588](https://github.com/iki/workers-sdk/commit/8a26b5b15b17a2e4fd05722994ebe9269b855588), based on upstream release commit [5b44e5e2f9df23b38b17903d6f4194919042828e](https://github.com/cloudflare/workers-sdk/commit/5b44e5e2f9df23b38b17903d6f4194919042828e). [Setup and test commands](https://github.com/iki/workers-sdk/blob/8a26b5b15b17a2e4fd05722994ebe9269b855588/downstream/VERIFIED-BUN-FETCH.md)
- Earlier 4.158.0 fork: [codex/bun-local-fetch-capability](https://github.com/iki/workers-sdk/tree/codex/bun-local-fetch-capability), head [31806d8588cfe225f499474c90c42736733488ce](https://github.com/iki/workers-sdk/commit/31806d8588cfe225f499474c90c42736733488ce), comparison base 2c623aa91d1dac5d43b8c66830d3e4b38c4ae32b.
- Select the 4.169.0 bundle for the web profile. The 4.165.0 bundle remains selectable during its deprecation period. Mobile still uses the 4.158.0 bundle. [Current atomic patch](../../patches/wrangler/4.169.0/verified-bun-fetch.patch) · [4.169.0 bundle](../../patches/wrangler@4.169.0.patch) · [4.165.0 bundle](../../patches/wrangler@4.165.0.patch) · [4.158.0 bundle](../../patches/wrangler@4.158.0.patch)
- Companion files include [packages/workers-sdk/adapters/verified-bun-fetch.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.mjs), [packages/workers-sdk/adapters/verified-bun-fetch.test.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.test.mjs), [packages/workers-sdk/adapters/wrangler-local.test.mjs](../../packages/workers-sdk/adapters/wrangler-local.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/verified-bun-fetch.test.mjs](../../packages/workers-sdk/adapters/verified-bun-fetch.test.mjs), [packages/workers-sdk/adapters/wrangler-local.test.mjs](../../packages/workers-sdk/adapters/wrangler-local.test.mjs).

Run the preloads in the affected tooling subprocess. Run the predicate test in the fork checkout and the local harness from the exact installed package group. The harness covers HTTP requests, both direct dispatch routes, rejection after replacing the registered fetch, rejection of an unregistered wrapper, and shutdown. D1 and full application acceptance remain separate.

Removal: The unpatched pinned Wrangler/Miniflare route works under Bun with dispatchers and retains safe rejection after fetch replacement; assess the independent Undici adapters separately.
