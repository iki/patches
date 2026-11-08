# Bun and Undici

Related packages: bun, undici, wrangler, miniflare. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## Undici compatibility

Installed-package resolution and dispatcher-aware global fetch are separate fixes.
[Wrangler and Miniflare](../workers-sdk/README.md#wrangler-and-miniflare) require
both before their verified-fetch route can be enabled.

### bun-undici-resolution

Bun resolves a bare Undici import to its built-in shim, which does not provide the installed package behavior required by the tooling. The adapter loads the exact installed Undici entry and exposes it through that shim.

- Kind: host-adapter. Packages: undici 8.12.4; wrangler 4.158.0. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/oven-sh/bun/pull/36102), matching-third-party-pr-open-in-source-record.
- Reusable fork: [codex/bun-undici-resolution](https://github.com/iki/workers-sdk/tree/codex/bun-undici-resolution), head [f2160e3f8dd97b388d98b247445f3951f7a91ab1](https://github.com/iki/workers-sdk/commit/f2160e3f8dd97b388d98b247445f3951f7a91ab1), comparison base ec6edddadd8395b4991b23c5300ea68b701ce720.
- Artifacts: [packages/workers-sdk/adapters/bun-undici-resolution.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.mjs), [packages/workers-sdk/adapters/bun-undici-resolution.test.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/bun-undici-resolution.test.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.test.mjs).

The portable adapter resides on the wrapped tooling fork. No Bun source fix or tested Bun source build is claimed. Explicit package resolution alone does not establish dispatcher-aware global fetch.

Removal: Pinned Bun resolves installed Undici and Worker startup, requests, reconfiguration and disposal pass without the shim assignment.

### bun-undici-fetch

Bun's native global fetch does not honor the Undici dispatchers required by local Worker requests. The adapter supplies dispatcher-aware Undici fetch inside the affected tooling subprocess.

- Kind: host-adapter. Packages: undici 8.12.4; wrangler 4.158.0. Runtime: Bun 1.4.2.
- Prerequisites: bun-undici-resolution.
- Upstream: [recorded disposition](https://github.com/oven-sh/bun/pull/39250), matching-third-party-pr-open-in-source-record.
- Reusable fork: [codex/bun-dispatcher-fetch](https://github.com/iki/workers-sdk/tree/codex/bun-dispatcher-fetch), head [943d97d3b5d148d2ab9f88a2cc3f0bea21df18a4](https://github.com/iki/workers-sdk/commit/943d97d3b5d148d2ab9f88a2cc3f0bea21df18a4), comparison base af29a6e53f361bde5d14e5ec0f36295b42bd52b5.
- Artifacts: [packages/workers-sdk/adapters/bun-dispatcher-fetch.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.mjs), [packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs).

Scope the global fetch replacement to the affected tooling subprocess. A fixed bare-module shim does not prove global fetch fixed. Preserve independent registration, rejection and cleanup tests.

Removal: Global native fetch honors dispatchers and actual Worker/D1 request and disposal checks pass without the override.
