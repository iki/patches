# cf and Cloudflare Config

Related packages: cf, @cloudflare/config, @cloudflare/build-output-utils, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## Cloudflare Config and Build Output

The adapter uses `@cloudflare/config` to validate configuration and
`@cloudflare/build-output-utils` to write and validate the prebuilt directory.
Compilation, asset/module selection and actual deployment remain the caller's
responsibility; see the [portable helper](adapters/bun-prebuilt.mjs).

### cf-bun-config

The cf configuration-loading path depends on module hooks that Bun does not support. This portable helper imports a supported config directly, validates it, and produces validated prebuilt Build Output for cf.

- Kind: host-adapter. Packages: cf 1.0.0-beta.27; @cloudflare/config 0.30.2; @cloudflare/build-output-utils 0.9.10. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/cloudflare/cf/issues/252#issuecomment-6290468148), downstream-only.
- Reusable fork: [codex/bun-prebuilt-config](https://github.com/iki/cf/tree/codex/bun-prebuilt-config), head [b6c20a32e18f618adbbb05e3a3d300896bfd2a83](https://github.com/iki/cf/commit/b6c20a32e18f618adbbb05e3a3d300896bfd2a83), comparison base 6808c0f8449e0dfe9d2c41ef0143485265432ed1.
- Artifacts: [packages/cf/adapters/bun-prebuilt.mjs](../../packages/cf/adapters/bun-prebuilt.mjs), [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).
- Regression evidence: [packages/cf/adapters/bun-prebuilt.test.mjs](../../packages/cf/adapters/bun-prebuilt.test.mjs).

This portable example preserves config and Build Output validation but covers a narrower matrix than full application integrations. Callers retain compilation, exact WASM/module inventory, channels, authentication, output evidence and recovery. Upstream loader support remains declined. The source-record focused test passed; full upstream frozen installation was blocked by trust-downgrade checks.

Removal: Pinned upstream supports validated object/function configs, modes, Windows file URLs/spaces and upward search under Bun. Retain the supported prebuilt interface independently if useful.
