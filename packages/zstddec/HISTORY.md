# zstddec history

## zstddec-types-export

Retired after published [0.3.4](https://npmx.dev/package/zstddec/v/0.3.4) passed the removal regression. [PR #77](https://github.com/donmccurdy/zstddec-wasm/pull/77) merged on 2026-10-18 as 6b5211082c81fdf553148ecb954980d863a1e754, from bcd3ada244140916e4fd95d91119a29e89d78029. Tag v0.3.4 resolves to ff24d680cc36af645d1e06d027f861e16ff79bf0. The 0.3.1→0.3.4 comparison changes the export target and version, not runtime/WASM behavior.

The one-line source correction changes the missing dist/zstddec.d.ts target to published dist/zstddec.d.mts. A strict consumer alone also passed on 0.3.1, so the meaningful regression explicitly checked that the exported declaration file exists; it rejected 0.3.1 with ENOENT and passed 0.3.4, alongside positive/negative decoder types and the compiled-WASM _init signature. [Release-test follow-up](https://github.com/donmccurdy/zstddec-wasm/pull/77#issuecomment-6278259293).

The earlier proposal [ece4515](https://github.com/iki/zstddec-wasm/commit/ece451503f1da5ba5cca020cbb63eb817d630aac) included a built-file test. The [maintainer requested removal](https://github.com/donmccurdy/zstddec-wasm/pull/77#issuecomment-6219911279) and suggested a separate attw check; [the response](https://github.com/donmccurdy/zstddec-wasm/pull/77#issuecomment-6222109027) records compliance. This retired the proposal's test, not the fix. Upstream CI runs 38879077443 and 38947638755 subsequently passed; no outstanding approval blocker was recorded.

The [retained source patch](history/types-export.patch) is historical, not an installable active series. Full consumer validation remains with the original consumer. No fresh regression is claimed here.
