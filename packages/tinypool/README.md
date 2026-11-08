# Tinypool and Oxfmt

Related packages: tinypool, oxfmt. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## Process workers

The fix belongs to Tinypool's process-worker launch path. Its
[regression contract](REGRESSION.md) covers both intercepted fork options and
real worker task completion and destruction.

### tinypool-windows-hide-process-workers

Tinypool process workers can open console windows on Windows. The patch forces windowsHide after the supplied option spread while preserving real worker execution and cleanup.

- Kind: package-patch. Packages: tinypool 2.2.0. Runtime: Bun 1.4.2.
- Prerequisites: none.
- Upstream: [recorded disposition](https://github.com/tinylibs/tinypool/pull/146), own-pr-open-in-source-record.
- Reusable fork: [codex/windows-hide-process-workers-2.2.0](https://github.com/iki/tinypool/tree/codex/windows-hide-process-workers-2.2.0), head [c8bdd12c549d988dafd523d66396ab70f91d6c51](https://github.com/iki/tinypool/commit/c8bdd12c549d988dafd523d66396ab70f91d6c51), comparison base 2ed306417986823e7a7989fd392e9cbfeee1b0c1.
- Artifacts: [patches/tinypool/2.2.0/windows-hide-process-workers.patch](../../patches/tinypool/2.2.0/windows-hide-process-workers.patch), [patches/tinypool@2.2.0.patch](../../patches/tinypool@2.2.0.patch).
- Regression evidence: [packages/tinypool/REGRESSION.md](../../packages/tinypool/REGRESSION.md).

The source fork uses a typed options object while the installed 2.2.0 diff adds the same hiding flag after the option spread. They are not byte-identical source expressions. Recorded consumers used Oxfmt 0.74.0 and 0.76.0; each must verify its actual transitive resolution and real process worker cleanup.

Removal: Unpatched published Tinypool contains windowsHide; exact transitive Oxfmt resolution, fork interception, real worker task/teardown and formatting checks pass.

## Oxfmt integration

Oxfmt can use Tinypool transitively. Resolve the formatter's exact installed
Tinypool instance, then run the [process-worker regression](REGRESSION.md) and
the real formatter; patch presence in a different dependency instance proves
nothing about that launch path. Keep the [recorded version history](HISTORY.md).
