# jSquash AVIF

Related packages: @jsquash/avif. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## avif-encoder-types

The AVIF encoder factory declaration does not describe the direct byte-buffer initialization used by strict TypeScript callers. The declaration adapter and separate upstream proposal describe that factory without casts or skipped library checking.

- Kind: declaration-adapter. Packages: @jsquash/avif 2.1.1. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/jamsinclair/jSquash/pull/115), own-pr-open-in-source-record.
- Reusable fork: [codex/fix-avif-factory-types](https://github.com/iki/jSquash/tree/codex/fix-avif-factory-types), head [c343c9af6ff0377080b6d0bb09bc0ad6551d7dc2](https://github.com/iki/jSquash/commit/c343c9af6ff0377080b6d0bb09bc0ad6551d7dc2), comparison base da47a2be3b302beb5a5ae164a2ab7aa21a041d90.
- Artifacts: [packages/jsquash-avif/adapters/encoder.d.ts](../../packages/jsquash-avif/adapters/encoder.d.ts), [packages/jsquash-avif/proposals/encoder-types.patch](../../packages/jsquash-avif/proposals/encoder-types.patch).
- Regression evidence: [packages/jsquash-avif/tests/types/avif-factory.ts](../../packages/jsquash-avif/tests/types/avif-factory.ts), [packages/jsquash-avif/tests/types/tsconfig.json](../../packages/jsquash-avif/tests/types/tsconfig.json).

The source proposal targets the upstream source tree, not an installed-package Aube selector. The declaration adapter is a separate representation. The retained type fixture requires its original upstream layout and pinned TypeScript; no standalone catalog execution is claimed.

Removal: Unpatched strict direct-factory consumer accepts byte buffers, rejects string paths and passes real raster encoding without ambient shim, casts or skipLibCheck.
