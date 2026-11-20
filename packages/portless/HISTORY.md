# Portless history

- 0.15.7 → 0.15.8: generated chunk/declaration rebase; TLS behavior remained active. The optional refreshTlsContexts type was restored. This was not upstream resolution.
- 0.15.8 → 0.15.12: TLS part rebased without semantic changes. The independent Windows OpenSSL fix shipped in [0.15.11](https://github.com/vercel-labs/portless/releases/tag/v0.15.11) through [PR #502](https://github.com/vercel-labs/portless/pull/502), commit 71a02600d2afa28f07ee6aa18a75bab1a748904d. Matching [PR #428](https://github.com/vercel-labs/portless/pull/428) closed in favor of #502 with author attribution; [issue #222](https://github.com/vercel-labs/portless/issues/222) closed. Published synchronous/asynchronous helpers were observed passing windowsHide:true to real OpenSSL; this was not a repeat process-window trace. [Release follow-up](https://github.com/vercel-labs/portless/pull/502#issuecomment-6451316490).
- 0.16.0: adaptation adds pooled-connection cleanup and fails early for the unsupported Bun loopbackOnly HTTPS route. The retained 0.15.12 fork is [5ffe9ea](https://github.com/iki/portless/commit/5ffe9ead3435e672c7ca815ed1cc7d0c64ed25c5), comparison base 0c0ff893a5a481d3d1b53d0b4766e32cd35dd5e3. Both installed-package versions remain selectable; never substitute one version's bundle for the other.

The entries above record observations through 2026-11-06. The two existing package series remain selectable.

## 2026-11-20 · Portless 0.18.1

The published [0.18.1 release](https://github.com/vercel-labs/portless/releases/tag/v0.18.1) identifies source commit `6c8b988f98abfc60095d08041ffef789ef89cc83`. The npm archive SHA-512 is `3gfeicAvS5kwFUbZrsZpt1oU1MUBvfiy2S0MT/n8mwWEp/ZjQsWI0mC353GEi/q8JUVgdx7lBGDzCcMI9O1MXg==` (base64).

Run the [native TLS regression](tests/0.18.1/verify-native.mjs) with the unmodified extracted npm package, a clean checkout of that source commit, Git and OpenSSL. Run once with Bun 1.4.2 and once with Bun 1.4.5 on Windows x64.

```sh
bun packages/portless/tests/0.18.1/verify-native.mjs <extracted-portless-package> <portless-release-source>
```

The fixture runs the published proxy and calls the same certificate generator as the CLI using a fresh temporary CA. It verifies a nested name, a newly registered name, failure isolation and retry, loopback-only requests, and pooled connection cleanup. Certificate setup uses temporary files. System CA trust is outside this test.

On Bun 1.4.2 the first nested request failed with `ERR_TLS_CERT_ALTNAME_INVALID`. On Bun 1.4.5 the same fixture passed using native SNI. An experimental 1.4.2 adaptation passed registered-name checks, but support for the generated-certificate handshake policy in [PR #497](https://github.com/vercel-labs/portless/pull/497) remains unverified for that fallback. Portless 0.18.1 has no catalog patch selector. The earlier series continue to cover their exact Bun 1.4.2 pins. A real application run and the originally reported macOS arm64 environment remain outstanding.

The [upstream follow-up on PR #470](https://github.com/vercel-labs/portless/pull/470#issuecomment-7037428274) records both runtime results and requests confirmation on macOS arm64.

The refreshed web profile now selects unpatched Portless 0.18.1 with Bun 1.4.5. Its frozen Windows x64 install passed the release-signer regression for both hostnames, failure isolation and retry, loopback-only requests, and backend pool reuse and cleanup. The mobile profile still selects 0.15.12 on Bun 1.4.2. Its published proxy lacked `refreshTlsContexts`. With the 0.15.12 bundle, concurrent refreshes selected a hostname once, a failure on a newly registered hostname preserved the preceding context, and the next refresh retried it. This mobile check covered context refresh in the installed proxy. The full verified HTTP and TLS exchange ran on 0.18.1. [Native TLS fixture](tests/0.18.1/verify-native.mjs) · [0.15.12 bundle](../../patches/portless@0.15.12.patch)
