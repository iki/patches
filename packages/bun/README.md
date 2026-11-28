# Bun and Undici

Related packages: bun, undici, wrangler, miniflare. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

The frozen web profile passed both adapters with Undici 8.14.0 and Bun 1.4.5 on Windows x64. The mobile profile passed with Undici 8.12.4 and Bun 1.4.2. [Bun release](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.5) · [Wrangler package checks](../workers-sdk/HISTORY.md#2026-11-28)

## Undici compatibility

Installed-package resolution and dispatcher-aware global fetch are separate fixes.
[Wrangler and Miniflare](../workers-sdk/README.md#wrangler-and-miniflare) require
both before their verified-fetch route can be enabled.

### bun-undici-resolution

Bun resolves a bare Undici import to its built-in shim, which does not provide the installed package behavior required by the tooling. The adapter loads the exact installed Undici entry and exposes it through that shim.

- Tested with Undici 8.14.0 and Wrangler 4.169.0 on Bun 1.4.5. The mobile profile passed with Undici 8.12.4 and Wrangler 4.158.0 on Bun 1.4.2.
- Prerequisites: none.
- robobun closed the installed-package proposal unmerged on November 17 after conflicts with main. The resolution request remains open. [Closure on PR #36102](https://github.com/oven-sh/bun/pull/36102#issuecomment-6943950827) · [Issue #17799](https://github.com/oven-sh/bun/issues/17799)
- Reusable fork: [codex/bun-undici-resolution](https://github.com/iki/workers-sdk/tree/codex/bun-undici-resolution), head [f2160e3f8dd97b388d98b247445f3951f7a91ab1](https://github.com/iki/workers-sdk/commit/f2160e3f8dd97b388d98b247445f3951f7a91ab1), comparison base ec6edddadd8395b4991b23c5300ea68b701ce720.
- Artifacts: [packages/workers-sdk/adapters/bun-undici-resolution.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.mjs), [packages/workers-sdk/adapters/bun-undici-resolution.test.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/bun-undici-resolution.test.mjs](../../packages/workers-sdk/adapters/bun-undici-resolution.test.mjs).

On native Bun 1.4.5, the bare Pool lacked dispatch, close and destroy. The explicitly loaded Undici 8.13.0 Pool provided all three and returned HTTP 200 on loopback. The bare shim also lacked Pool dispatch on Bun 1.4.2. The adapter restored a working Pool, served a loopback request and preserved the identity of global fetch. rchasman also reported installed-package shadowing on Bun 1.4.4. The open export proposal adds Dispatcher1Wrapper to the shim and leaves bare-package resolution in place. [Issue #48972](https://github.com/oven-sh/bun/issues/48972) · [robobun’s PR #48985](https://github.com/oven-sh/bun/pull/48985)

Removal: Pinned Bun resolves installed Undici and Worker startup, requests, reconfiguration and disposal pass without the shim assignment.

### bun-undici-fetch

Bun's native global fetch does not honor the Undici dispatchers required by local Worker requests. The adapter supplies dispatcher-aware Undici fetch inside the affected tooling subprocess.

- Tested with Undici 8.14.0 and Wrangler 4.169.0 on Bun 1.4.5. The mobile profile passed with Undici 8.12.4 and Wrangler 4.158.0 on Bun 1.4.2.
- Prerequisites: bun-undici-resolution.
- robobun’s open proposal implements the built-in Undici dispatchers and dispatcher-aware Undici fetch. Native global fetch has its own acceptance test. [PR #39250](https://github.com/oven-sh/bun/pull/39250) · [Issue #39247](https://github.com/oven-sh/bun/issues/39247)
- Reusable fork: [codex/bun-dispatcher-fetch](https://github.com/iki/workers-sdk/tree/codex/bun-dispatcher-fetch), head [943d97d3b5d148d2ab9f88a2cc3f0bea21df18a4](https://github.com/iki/workers-sdk/commit/943d97d3b5d148d2ab9f88a2cc3f0bea21df18a4), comparison base af29a6e53f361bde5d14e5ec0f36295b42bd52b5.
- Artifacts: [packages/workers-sdk/adapters/bun-dispatcher-fetch.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.mjs), [packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs).
- Regression evidence: [packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs](../../packages/workers-sdk/adapters/bun-dispatcher-fetch.test.mjs).

On Bun 1.4.5, native fetch reached the loopback origin despite the supplied MockAgent. The installed Undici fetch consumed the mock response. Bun 1.4.2 showed the same native behavior. The scoped override reached the mock and consumed its expectation. The fixture closed the dispatcher and server in both installations.

Removal: Global native fetch honors dispatchers and actual Worker/D1 request and disposal checks pass without the override.
