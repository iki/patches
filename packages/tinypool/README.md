# Tinypool and Oxfmt

Related packages: tinypool, oxfmt. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

On 2026-11-20 npm still listed Tinypool 2.2.0 as latest. Oxfmt 0.79.0 installs that exact version. The Windows regression passed with the existing bundle. [Tinypool release](https://registry.npmjs.org/tinypool/2.2.0) · [Oxfmt dependency declaration](https://registry.npmjs.org/oxfmt/0.79.0) · [Test results](HISTORY.md)

## Process workers

The fix belongs to Tinypool's process-worker launch path. Its
[regression contract](REGRESSION.md) covers both intercepted fork options and
real worker task completion and destruction.

### tinypool-windows-hide-process-workers

Tinypool process workers can open console windows on Windows. The patch forces windowsHide after the supplied option spread while preserving real worker execution and cleanup.

- Kind: package-patch. Packages: tinypool 2.2.0. Runtime: Bun 1.4.2.
- Prerequisites: none.
- [PR #146](https://github.com/tinylibs/tinypool/pull/146) is open and mergeable at the fork head below. Both upstream workflows require maintainer approval.
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
