# cf and Cloudflare Config

Related packages: cf, @cloudflare/config, @cloudflare/build-output-utils, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

On November 28, 2026, the web profile used cf 1.0.0-rc.6 with the existing v1 prebuilt helper on Windows x64. The CLI’s native config loader still rejected object and function configs under Bun 1.4.5. [Release](https://github.com/cloudflare/cf/releases/tag/cf%401.0.0-rc.6) · [Verification](HISTORY.md#2026-11-28)

## Cloudflare Config and Build Output

The adapter uses `@cloudflare/config` to validate configuration and
`@cloudflare/build-output-utils` to write and validate the prebuilt directory.
Compilation, asset/module selection and actual deployment remain the caller's
responsibility; see the [portable helper](adapters/bun-prebuilt.mjs).

### cf-bun-config

The cf configuration-loading path depends on module hooks that Bun does not support. This portable helper imports a supported config directly, validates it, and produces validated prebuilt Build Output for cf.

- The v1 adapter passed with directly installed Config and Build Output Utils 1.0.0-rc.5. The cf 1.0.0-rc.6 CLI resolves version 1.0.0-rc.4 of both libraries and accepted the resulting output. The same helper originally supported the rc.2 writer and rc.1 reader. [V1 helper](adapters/1.0.0-rc.2/bun-prebuilt.mjs) · [V1 regression](adapters/1.0.0-rc.2/bun-prebuilt.test.mjs)
- The v0 adapter targets cf 1.0.0-beta.27, Config 0.30.2 and Build Output Utils 0.9.10 on Bun 1.4.2. This version remains selected by the mobile profile.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/cloudflare/cf/issues/252#issuecomment-6290468148), downstream-only.
- Historical v0 fork: [codex/bun-prebuilt-config](https://github.com/iki/cf/tree/codex/bun-prebuilt-config), head [b6c20a32e18f618adbbb05e3a3d300896bfd2a83](https://github.com/iki/cf/commit/b6c20a32e18f618adbbb05e3a3d300896bfd2a83), comparison base 6808c0f8449e0dfe9d2c41ef0143485265432ed1.
- V1 fork at [c8da7f8](https://github.com/iki/cf/commit/c8da7f85f82ba18dbd02e7037eb7e5dc6b2bcc95), based on [cf 1.0.0-rc.2](https://github.com/cloudflare/cf/commit/87e509e317dcd36dbe7e4b7e095dda628b91285c).
- V0 artifacts: [packages/cf/adapters/bun-prebuilt.mjs](../../packages/cf/adapters/bun-prebuilt.mjs), [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).
- Regression evidence: [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).

This portable example preserves config and Build Output validation but covers a narrower matrix than full application integrations. Callers retain compilation, exact WASM/module inventory, channels, authentication, output evidence and recovery. Upstream loader support remains declined. The source-record focused test passed; full upstream frozen installation was blocked by trust-downgrade checks.

Removal: Pinned upstream supports validated object/function configs, modes, Windows file URLs/spaces and upward search under Bun. Retain the supported prebuilt interface independently if useful.
