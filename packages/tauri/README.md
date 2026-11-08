# Tauri CLI

Related packages: @tauri-apps/cli, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## tauri-native-lifetime

Bun can exit before the Tauri native callback settles, leaving a CLI operation incomplete. The adapter keeps the tooling process alive until success or rejection and always releases that lifetime handle.

- Kind: host-adapter. Packages: @tauri-apps/cli 2.12.1, 2.12.4. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/tauri-apps/tauri/blob/dev/.github/CONTRIBUTING.md), current-reproduction-and-coordination-needed.
- Reusable fork: [codex/bun-native-lifetime](https://github.com/iki/tauri/tree/codex/bun-native-lifetime), head [4cfdc3bbcfc4c32d5998f22281db0a628e0261c3](https://github.com/iki/tauri/commit/4cfdc3bbcfc4c32d5998f22281db0a628e0261c3), comparison base 136a28eaa879e8aa706f9b2e05a050c46dcc1f4f.
- Artifacts: [packages/tauri/adapters/native-lifetime.ts](../../packages/tauri/adapters/native-lifetime.ts), [packages/tauri/adapters/tauri-cli.ts](../../packages/tauri/adapters/tauri-cli.ts), [packages/tauri/adapters/native-lifetime.mjs](../../packages/tauri/adapters/native-lifetime.mjs), [packages/tauri/adapters/bun-tauri.mjs](../../packages/tauri/adapters/bun-tauri.mjs), [packages/tauri/adapters/native-lifetime.test.mjs](../../packages/tauri/adapters/native-lifetime.test.mjs).
- Regression evidence: [packages/tauri/adapters/native-lifetime.test.mjs](../../packages/tauri/adapters/native-lifetime.test.mjs).

Historical unguarded CLI 2.12.1 failed 10/160 launches; unguarded 2.12.3 and 2.12.4 completed 160/160 without an identified resolving change. Retention is conservative. The portable regression covers 160 native launches, rejection and callback cleanup. Upstream requires current reproduction and personal human coordination before proposing a contribution.

Removal: Identify the resolving upstream change and verify deterministic success/rejection/cleanup and actual native CLI completion without the guard.
