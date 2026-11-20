# jSquash AVIF

Related packages: @jsquash/avif. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

The npm `latest` tag still selected 2.1.1 on 2026-11-20. Its direct encoder import reproduced the declaration failure on Windows x64 with Node 24.22.3 and TypeScript 5.8.3. [Published package](https://www.npmjs.com/package/@jsquash/avif/v/2.1.1) · [Verification](HISTORY.md#2026-11-20)

## avif-encoder-types

The AVIF encoder factory declaration does not describe the direct byte-buffer initialization used by strict TypeScript callers. The declaration adapter and separate upstream proposal describe that factory without casts or skipped library checking.

- Declaration adapter for @jsquash/avif 2.1.1. The frozen web profile type-checked the adapter and ran the published WASM encoder and decoder on Bun 1.4.5. The earlier runtime was Bun 1.4.2.
- Prerequisites: none.
- Upstream: iki's [PR #115](https://github.com/jamsinclair/jSquash/pull/115) was open and mergeable at the recorded fork head on 2026-11-20. GitHub reported a failed [CI run](https://github.com/jamsinclair/jSquash/actions/runs/38879100744) with no jobs available for diagnosis.
- Reusable fork: [codex/fix-avif-factory-types](https://github.com/iki/jSquash/tree/codex/fix-avif-factory-types), head [c343c9af6ff0377080b6d0bb09bc0ad6551d7dc2](https://github.com/iki/jSquash/commit/c343c9af6ff0377080b6d0bb09bc0ad6551d7dc2), comparison base da47a2be3b302beb5a5ae164a2ab7aa21a041d90.
- Artifacts: [packages/jsquash-avif/adapters/encoder.d.ts](../../packages/jsquash-avif/adapters/encoder.d.ts), [packages/jsquash-avif/proposals/encoder-types.patch](../../packages/jsquash-avif/proposals/encoder-types.patch).
- Regression evidence: [packages/jsquash-avif/tests/types/avif-factory.ts](../../packages/jsquash-avif/tests/types/avif-factory.ts), [packages/jsquash-avif/tests/types/tsconfig.json](../../packages/jsquash-avif/tests/types/tsconfig.json).

The source proposal targets the upstream source tree, not an installed-package Aube selector. The declaration adapter is a separate representation. The retained source fixture uses the upstream layout. A separate direct-import check compared the published declarations with the PR-head blobs under TypeScript 5.8.3. [Results and WASM round trip](HISTORY.md)

Removal: Unpatched strict direct-factory consumer accepts byte buffers, rejects string paths and passes real raster encoding without ambient shim, casts or skipLibCheck.
