# jSquash AVIF history

No fix retired in the 2026-11-06 source observation. Preserve the declaration adapter and atomic upstream proposal as distinct representations; a merged PR alone will not justify removing the adapter.

## 2026-11-20

On Windows x64, an isolated direct import of the single-threaded encoder from the integrity-verified npm 2.1.1 tarball failed under Node 24.22.3 and TypeScript 5.8.3. With `strict: true`, `skipLibCheck: false` and `types: []`, `tsc -p tsconfig.json` produced two TS2503 errors for `EmscriptenWasm` and TS2578 for the unused negative assertion. Replacing the two declarations with the exact blobs from iki's PR head made the same fixture pass for both `Uint8Array` and `ArrayBuffer`. Removing the negative assertion produced TS2322 for a filename string. The tarball's original declarations matched the PR's base blobs. [Published package](https://www.npmjs.com/package/@jsquash/avif/v/2.1.1) · [PR head](https://github.com/iki/jSquash/commit/c343c9af6ff0377080b6d0bb09bc0ad6551d7dc2)

Each buffer type initialized the published WASM encoder and produced the same 311-byte AVIF from an 8 × 8 RGBA raster. The published decoder recovered the dimensions and expected channel order. The registry release still needs the declaration fix. [Results posted to PR #115](https://github.com/jamsinclair/jSquash/pull/115#issuecomment-7037248018)

The earlier top-level typing issue remains closed. The separate AVIF/PNG bit-depth PR was merged. [Issue #11](https://github.com/jamsinclair/jSquash/issues/11) · [PR #89](https://github.com/jamsinclair/jSquash/pull/89)
