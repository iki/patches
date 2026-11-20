# Portless

Related packages: portless, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

The 2026-11-20 review checked the published [Portless 0.18.1 package](https://registry.npmjs.org/portless/0.18.1) against Bun 1.4.2 and 1.4.5 on Windows x64. The installable catalog bundles target Portless 0.15.12 and 0.16.0 on Bun 1.4.2.

## portless-bun-tls

Registered local HTTPS names fail when Bun cannot use the Node TLS-context path. The patch supplies Bun certificate contexts and refresh handling while retaining certificate verification and connection cleanup.

- Kind: package-patch. Packages: portless 0.16.0, 0.15.12. Runtime: Bun 1.4.2.
- Prerequisites: none.
- [Issue #469](https://github.com/vercel-labs/portless/issues/469) and [PR #470](https://github.com/vercel-labs/portless/pull/470) are open. The PR head is [0c0ff89](https://github.com/iki/portless/commit/0c0ff893a5a481d3d1b53d0b4766e32cd35dd5e3). Merging upstream [6784e58](https://github.com/vercel-labs/portless/commit/6784e585a786a23b557d1291dfc86647587c4ea6) conflicts in `packages/portless/src/cli.ts`. The [head CI run](https://github.com/vercel-labs/portless/actions/runs/38118969619) failed.
- Reusable fork: [codex/bun-tls-0.16.0](https://github.com/iki/portless/tree/codex/bun-tls-0.16.0), head [8addb4a2bca1488a35f44338938f84bd410bff99](https://github.com/iki/portless/commit/8addb4a2bca1488a35f44338938f84bd410bff99), comparison base d6326eff87e3f377050cfb8b8aaeba07e5378564.
- Artifacts: [patches/portless/0.16.0/bun-tls-contexts.patch](../../patches/portless/0.16.0/bun-tls-contexts.patch), [patches/portless@0.16.0.patch](../../patches/portless@0.16.0.patch), [patches/portless/0.15.12/bun-tls-contexts.patch](../../patches/portless/0.15.12/bun-tls-contexts.patch), [patches/portless@0.15.12.patch](../../patches/portless@0.15.12.patch), [packages/portless/tests/verify-package.mjs](../../packages/portless/tests/verify-package.mjs).
- Regression evidence: [packages/portless/tests/verify-package.mjs](../../packages/portless/tests/verify-package.mjs), [packages/portless/README.md](../../packages/portless/README.md).

Two distinct package series are retained. The portable package verifier targets 0.16.0 and requires Bun 1.4.2 and OpenSSL. HTTP/1.1 only; unregistered TLS names and plain HTTP on the TLS port are unsupported. Bun HTTPS rejects loopbackOnly before allocation. The source-record Node run had 15 matching baseline CLI failures and frozen upstream installation had trust-downgrade blockers. No new full upstream or consumer acceptance is claimed.

Removal: An unpatched published Portless or Bun release passes verified certificates, registered names, refresh/retry, pooling/cleanup and loopback-only rejection.

## Portless 0.18.1 on Windows x64

On Bun 1.4.2 the first nested hostname failed certificate verification with `ERR_TLS_CERT_ALTNAME_INVALID`. On Bun 1.4.5 the unpatched npm package served verified certificates for a nested name and a newly registered name using the release's own SNI callback. A certificate-selection failure left the existing route available, the next request retried successfully, and closing the loopback-only proxy released its pooled backend connection. The [fixture and run instructions](HISTORY.md) cover this runtime comparison.

For Bun 1.4.5, validate the unpatched package in the actual application. For Bun 1.4.2, keep the exact historical selector until the new pairing passes the original regression, including its access restrictions. The candidate fallback still requires evidence for the [generated-certificate handshake policy](https://github.com/vercel-labs/portless/pull/497). Application acceptance and confirmation on macOS arm64 remain open.
