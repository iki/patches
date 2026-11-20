# Patches

A package-owned catalog of independent dependency fixes, portable adapters,
release holds and retirement evidence. Select only the fixes needed by a
consumer; retain their prerequisites, exact versions, notices and local checks.

| Upstream group | Related packages | Records |
| --- | --- | --- |
| Portless | Bun | [Current](packages/portless/README.md) · [History](packages/portless/HISTORY.md) |
| Bun | Undici, Wrangler, Miniflare | [Current](packages/bun/README.md) · [History](packages/bun/HISTORY.md) |
| Workers SDK | Wrangler, Miniflare, Undici, Bun | [Current](packages/workers-sdk/README.md) · [History](packages/workers-sdk/HISTORY.md) |
| cf | Cloudflare Config, build-output-utils, Bun | [Current](packages/cf/README.md) · [History](packages/cf/HISTORY.md) |
| Tauri | CLI, Bun | [Current](packages/tauri/README.md) · [History](packages/tauri/HISTORY.md) |
| jSquash | AVIF | [Current](packages/jsquash-avif/README.md) · [History](packages/jsquash-avif/HISTORY.md) |
| Tinypool | Oxfmt | [Current](packages/tinypool/README.md) · [History](packages/tinypool/HISTORY.md) |
| Oxc | Oxlint, plugins | [Release hold](packages/oxlint/README.md) · [History](packages/oxlint/HISTORY.md) |
| zstddec | declaration exports | [Current](packages/zstddec/README.md) · [History](packages/zstddec/HISTORY.md) |

The [package policy](CATALOG.md) governs version selection and deprecation.
The [dependency inventory](inventory/dependencies.json) records package versions
and tools. Use the [standalone environments](environments/README.md) to prepare
a regression target. Use the [central setup procedure](environments/INSTALL.md), the [bundle applicability check](PACKAGE-BUNDLES.md) and the [regression matrix](docs/regressions.md) to install and exercise the selected package versions.

[registry.json](registry.json) is the machine-readable catalog.
[migration.json](migration.json) binds exact artifact bytes and source snapshots.
[The data contract](MIGRATION.md) explains curated provenance and consumer-owned
integrations. [Notices](NOTICE.md) preserve authorship and licensing boundaries.

The two atomic procedures are [consumption](skills/dependency-patches/SKILL.md)
and [maintenance](skills/patch-maintenance/SKILL.md). The complete
[patch lifecycle rules](skills/patch-maintenance/references/lifecycle.md) apply
to diffs, forks, preloads, declaration shims and bypasses of upstream defects.
Installing a skill grants no publication, communication or hook-trust authority.

Use the [project tool setup](TOOLCHAIN.md) for a frozen Aube installation and
the Bun step and review checks. Catalog verification is offline. Package
and platform regressions require separate execution.

The 2026-11-20 refresh checked upstream threads and release channels for all
nine groups. Each package history identifies the versions exercised on Windows
x64 and any outstanding removal criteria. [Verification boundaries](VERIFICATION.md)
