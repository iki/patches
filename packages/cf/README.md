# cf and Cloudflare Config

Related packages: cf, @cloudflare/config, @cloudflare/build-output-utils, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

On 2026-11-20 npm listed cf 1.0.0-rc.2 as latest. Its native config loader rejected local object and function configs on Windows x64 under Bun 1.4.2 and 1.4.5. The v1 prebuilt helper passed on both runtimes with the CLI’s own output reader. [Release](https://github.com/cloudflare/cf/releases/tag/cf%401.0.0-rc.2) · [Verification](HISTORY.md)

## Cloudflare Config and Build Output

The adapter uses `@cloudflare/config` to validate configuration and
`@cloudflare/build-output-utils` to write and validate the prebuilt directory.
Compilation, asset/module selection and actual deployment remain the caller's
responsibility; see the [portable helper](adapters/bun-prebuilt.mjs).

### cf-bun-config

The cf configuration-loading path depends on module hooks that Bun does not support. This portable helper imports a supported config directly, validates it, and produces validated prebuilt Build Output for cf.

- The [v1 adapter](adapters/1.0.0-rc.2/bun-prebuilt.mjs) uses `@cloudflare/config` and `@cloudflare/build-output-utils` at 1.0.0-rc.2. The cf 1.0.0-rc.2 CLI itself depends on 1.0.0-rc.1 of both libraries. The [v1 regression](adapters/1.0.0-rc.2/bun-prebuilt.test.mjs) exercises both the producer and the CLI's reader on Bun 1.4.2.
- The v0 adapter targets cf 1.0.0-beta.27, Config 0.30.2 and Build Output Utils 0.9.10 on Bun 1.4.2. This version remains selected by the mobile profile.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/cloudflare/cf/issues/252#issuecomment-6290468148), downstream-only.
- Historical v0 fork: [codex/bun-prebuilt-config](https://github.com/iki/cf/tree/codex/bun-prebuilt-config), head [b6c20a32e18f618adbbb05e3a3d300896bfd2a83](https://github.com/iki/cf/commit/b6c20a32e18f618adbbb05e3a3d300896bfd2a83), comparison base 6808c0f8449e0dfe9d2c41ef0143485265432ed1.
- V1 fork at [c8da7f8](https://github.com/iki/cf/commit/c8da7f85f82ba18dbd02e7037eb7e5dc6b2bcc95), based on [cf 1.0.0-rc.2](https://github.com/cloudflare/cf/commit/87e509e317dcd36dbe7e4b7e095dda628b91285c).
- V0 artifacts: [packages/cf/adapters/bun-prebuilt.mjs](../../packages/cf/adapters/bun-prebuilt.mjs), [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).
- Regression evidence: [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).

This portable example preserves config and Build Output validation but covers a narrower matrix than full application integrations. Callers retain compilation, exact WASM/module inventory, channels, authentication, output evidence and recovery. Upstream loader support remains declined. The source-record focused test passed; full upstream frozen installation was blocked by trust-downgrade checks.

Removal: Pinned upstream supports validated object/function configs, modes, Windows file URLs/spaces and upward search under Bun. Retain the supported prebuilt interface independently if useful.
