# Oxlint history

No local source patch is retired. The current 1.91.0 immutability regression is an unmodified-release hold, not a fork or package patch. The recorded containing 1.92.0 release still requires the actual consumer's eligibility policy and unsuppressed lint/regressions before its hold is retired.

On 2026-11-20, three frozen Windows x64 installs ran the original TypeScript reproduction with matching plugins and `oxlint --type-aware -c .oxlintrc.json -f unix repro.ts`. On 1.90.0 and 1.94.0 only the intentionally invalid render-scope write generated diagnostics, both on line 36. On 1.91.0 the two callback-local writes on lines 12 and 25 also generated false positives. The 1.94.0 install used oxlint-tsgolint 7.0.2007. The earlier pins used 7.0.2005. Full consuming-project lint and review remain the switch condition. [Original reproduction](https://github.com/oxc-project/oxc/issues/28401)

camc314's fix merged in #28820. shiroyasha9 closed the overlapping #28402 after it landed. A separate 1.94.0 report concerns captured locals in `useMemo`, with Boshen's proposal open at the time of review. [Merged fix](https://github.com/oxc-project/oxc/pull/28820) · [Earlier proposal](https://github.com/oxc-project/oxc/pull/28402#issuecomment-6692431255) · [Separate report](https://github.com/oxc-project/oxc/issues/29696) · [Proposed fix](https://github.com/oxc-project/oxc/pull/29766)

The [release verification on #28401](https://github.com/oxc-project/oxc/issues/28401#issuecomment-7037430105) records all three runs.

The refreshed Windows x64 web profile paired the held Oxlint and plugins 1.90.0 with oxlint-tsgolint 7.0.2007. On Bun 1.4.5 the same unsuppressed type-aware reproduction reported both intended diagnostics at line 36. Neither callback-local write produced a diagnostic. The package check passed with the newer type checker. The hold still requires the affected application's full lint and review checks. [Issue reproduction](https://github.com/oxc-project/oxc/issues/28401)
