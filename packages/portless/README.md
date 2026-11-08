# Portless

Related packages: portless, bun. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## portless-bun-tls

Registered local HTTPS names fail when Bun cannot use the Node TLS-context path. The patch supplies Bun certificate contexts and refresh handling while retaining certificate verification and connection cleanup.

- Kind: package-patch. Packages: portless 0.16.0, 0.15.12. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/vercel-labs/portless/pull/470), own-pr-open-in-source-record.
- Reusable fork: [codex/bun-tls-0.16.0](https://github.com/iki/portless/tree/codex/bun-tls-0.16.0), head [8addb4a2bca1488a35f44338938f84bd410bff99](https://github.com/iki/portless/commit/8addb4a2bca1488a35f44338938f84bd410bff99), comparison base d6326eff87e3f377050cfb8b8aaeba07e5378564.
- Artifacts: [patches/portless/0.16.0/bun-tls-contexts.patch](../../patches/portless/0.16.0/bun-tls-contexts.patch), [patches/portless@0.16.0.patch](../../patches/portless@0.16.0.patch), [patches/portless/0.15.12/bun-tls-contexts.patch](../../patches/portless/0.15.12/bun-tls-contexts.patch), [patches/portless@0.15.12.patch](../../patches/portless@0.15.12.patch), [packages/portless/tests/verify-package.mjs](../../packages/portless/tests/verify-package.mjs).
- Regression evidence: [packages/portless/tests/verify-package.mjs](../../packages/portless/tests/verify-package.mjs), [packages/portless/README.md](../../packages/portless/README.md).

Two distinct package series are retained. The portable package verifier targets 0.16.0 and requires Bun 1.4.2 and OpenSSL. HTTP/1.1 only; unregistered TLS names and plain HTTP on the TLS port are unsupported. Bun HTTPS rejects loopbackOnly before allocation. The source-record Node run had 15 matching baseline CLI failures and frozen upstream installation had trust-downgrade blockers. No new full upstream or consumer acceptance is claimed.

Removal: An unpatched published Portless or Bun release passes verified certificates, registered names, refresh/retry, pooling/cleanup and loopback-only rejection.
