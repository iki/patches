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

[registry.json](registry.json) is the machine-readable catalog.
[migration.json](migration.json) binds exact artifact bytes and source snapshots.
[The data contract](MIGRATION.md) explains curated provenance and consumer-owned
integrations. [Notices](NOTICE.md) preserve authorship and licensing boundaries.

The two atomic procedures are [consumption](skills/dependency-patches/SKILL.md)
and [maintenance](skills/patch-maintenance/SKILL.md). The complete
[patch lifecycle rules](skills/patch-maintenance/references/lifecycle.md) apply
to diffs, forks, preloads, declaration shims and bypasses of upstream defects.
Installing a skill grants no publication, communication or hook-trust authority.

Run `aube install --frozen-lockfile`, then `aube run --no-install step:check`
and `aube run --no-install review:check`. Bun 1.4.2 and Aube 2.5.1 are pinned.
The ordinary catalog gate is offline and does not execute imported adapters.
Package and consumer/platform regressions are separately required evidence.

Upstream status in this snapshot was observed on 2026-11-06. Curating the catalog
does not refresh remote status, prove a release contains a fix, or rerun earlier
regressions. See [verification boundaries](VERIFICATION.md).
