# Tauri history

No lifetime fix has been retired. Unguarded CLI 2.12.1 failed 10/160 observed launches. Unguarded 2.12.3 and 2.12.4 each completed 160/160, and guarded acceptance included native launches plus rejection/cleanup. No resolving upstream change was identified; passing timing samples alone do not establish resolution. The JavaScript native callback mechanism was unchanged in the recorded 2.12.3 → 2.12.4 upgrade.

Unrelated reports [#14472](https://github.com/tauri-apps/tauri/issues/14472) and [#16366](https://github.com/tauri-apps/tauri/issues/16366) do not establish this callback-lifetime defect or its repair. Current reproduction and human contributor coordination remain necessary before proposing an upstream change.

## 2026-11-20

With the published Windows x64 CLI 2.12.6 and Bun 1.4.2, the guarded fixture completed 160/160 native `--version` launches, preserved the CLI's nonzero exit on an invalid option, and released the lifetime handle on delayed callback success and rejection. The CLI's argument parser exits directly on these two arguments. The version and usage-error probes exercise process output and exit status. [Guarded fixture](adapters/native-lifetime.test.mjs) · [Upstream parser](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.6/crates/tauri-cli/src/lib.rs)

An unguarded check called `require("@tauri-apps/cli").run(["completions", "--shell", "bash", "--output", file], "tauri")` in a fresh Bun process for each invocation. The native operation wrote a completion file, and the JavaScript fulfillment handler observed `true` in 160/160 launches on Bun 1.4.2 and 160/160 on Bun 1.4.5. Giving the output file a missing parent directory invoked the rejection handler and exited 1 on each runtime. Packaged-build acceptance remains outstanding. [Native binding](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.6/packages/cli/src/lib.rs) · [Completions command](https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.12.6/crates/tauri-cli/src/completions.rs)

The 2.12.4 and 2.12.6 source tags have identical `packages/cli/index.js`, `packages/cli/main.js` and `packages/cli/src/lib.rs` blobs. The two linked issues remain open and concern Android initialization on Windows and a Node 26 native abort on Linux. No resolving change has been identified. [Tag comparison](https://github.com/tauri-apps/tauri/compare/tauri-cli-v2.12.4...tauri-cli-v2.12.6) · [Issue #14472](https://github.com/tauri-apps/tauri/issues/14472) · [Issue #16366](https://github.com/tauri-apps/tauri/issues/16366)

The [unguarded native callback fixture](tests/2.12.6/native-callbacks.test.mjs) checks the observable promise handlers on success and failure. Run it from the frozen web profile with Bun's per-case timeout set to 120000 ms.

The refreshed Windows x64 profiles ran CLI 2.12.6 on both Bun 1.4.5 and 1.4.2. On each runtime the guard completed all 160 CLI version invocations, preserved the invalid-option failure and released its handle after delayed callback success and rejection. The unguarded completions test also settled all 160 promises, wrote the output, and observed a real write rejection on each runtime. Packaged-build acceptance and identification of a resolving upstream change remain open. [Guarded checks](adapters/native-lifetime.test.mjs) · [Unguarded checks](tests/2.12.6/native-callbacks.test.mjs)
