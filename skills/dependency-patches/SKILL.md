---
name: dependency-patches
description: Use skills from the central Patches catalog to select, verify and install published dependency fixes. By default, prepare a reproducible maintenance prompt for missing or incompatible coverage. A catalog pull request requires an explicit request.
---

# Consume shared dependency fixes

Install the selected procedure skills from a reviewed Patches commit. Keep the
catalog, package test environments and reusable fix development in Patches.
In the consuming repository, retain the exact selection, applicable licenses,
application-specific integrations, regression evidence and package-manager lock.
Use its own setup, verification and publication rules.

## Locate the selected catalog revision

Read the full published commit ID from the consuming project's committed
selection. A moving branch, version label or checkout path cannot supply that
identity. Resolve paths from the physical project root, even when invoked
from a subdirectory or linked task worktree. The canonical Git origin is
`https://github.com/iki/patches.git`.

1. Use `.cache/patch-catalog` beneath that root by default. Allow an explicit
   absolute or project-relative `PATCHES_CHECKOUT` to select an existing
   read-only checkout. For example, `PATCHES_CHECKOUT=../x-patches` can live in
   an ignored, untracked `.env.local`. Also accept an ignored, untracked
   `.env`. Inspect Git tracking and ignore status before opening either file.
   Read only that key as a literal path. Never execute, expand, print or copy
   dotenv contents. A process-level value takes precedence, followed by
   `.env.local` and then `.env`. Report malformed, duplicate or empty assignments
   in the selected source. An explicitly configured unavailable checkout is an
   error.
2. On initial online setup, clone the canonical origin into a new owned cache
   directory without checking out a default branch. Verify the advertised
   origin and the published commit using the project's trust policy before
   checking out that exact commit detached. Fetch explicitly when a selected
   commit is missing. Offline setup requires locally available verified objects
   or the consumer's validated immutable materialization. Report a missing
   commit without selecting another version or implicitly going online.
3. For an existing checkout, validate its physical directory, canonical origin
   identity and selected commit object. Never accept a similarly named folder
   or repository based only on its basename. Inspect the cache working tree and
   index before using files from it. Leave dirty or foreign contents intact.
   A shared external checkout can be on a different branch. Read the selected
   commit's Git objects directly or materialize a separate owned snapshot.
   Never change the external checkout's branch, index, working files or remotes.
4. Read the selected registry, artifact provenance and notices at that same
   commit. A locator does not authorize running the checkout's code. Run
   reviewed setup or verifier commands only in their intended trusted context.

For example, the following commands inspect a selected checkout using already
resolved values. Pass paths as individual arguments and compare the commit
result with the full selection. Keep raw remote URLs private if a local Git
configuration embeds credentials.

```powershell
git -C $catalog rev-parse --show-toplevel
git -C $catalog rev-parse --verify "$revision^{commit}"
git -C $catalog status --porcelain=v1 --untracked-files=normal
git -C $catalog ls-tree $revision -- registry.json migration.json
```

## Materialize a fix

Check the installed package name, exact version, runtime, platform and dependency
role. Select the matching fix IDs, their full prerequisites and ordered series.
Verify every artifact's relative path, bytes, size, SHA-256, source identity,
licenses and notices. Check the bundle against its ordered parts. Reject links,
escaping paths, a selector for another version and missing requirements.

Materialize only the selected inputs from the approved commit into the consumer's
owned install cache. Copy verified bytes before the frozen installation. Use a
stable project-relative materialization path in the Aube selector for
`<package>@<exact-version>`. The package lock must bind the same bundle digest.
The local external-checkout path is never committed. Preserve existing
installable copies and their lock mappings until an explicitly verified migration
can bootstrap a clean checkout and replay an older pinned install offline.
Publish neither a second catalog nor independently edited reusable patch bytes
from the consuming repository.

Keep full application wrappers in their owning project. Follow the
[integration binding contract](references/integrations.md) for exact hashes,
canonical fix IDs, provenance, local regressions and platform checks. Run the
real consumer regression after package installation. Report catalog integrity,
install verification and runtime behavior separately.

Use the latest published release on the declared channel as the update target. Preserve an exact
reproducible lock after selecting it. Honor a recorded version hold with its
technical reason and measurable switch conditions. Continue using the old
pinned catalog commit for reproducible old installs after a newer catalog
deprecates or cleans up that version's patch.

## Request central maintenance

If coverage is absent, incompatible, ambiguous or fails the original regression,
stop that affected update and check the package's active fixes, history, open
catalog work and relevant upstream threads. Use the existing fix or proposal
when it covers the same package, version and symptom. Preserve unrelated work.

By default, return a copy-ready prompt for the Patches maintainer. Keep it
package-focused and omit consumer names, repository paths, private logs,
configuration, accounts and credentials. Use the following fields.

```text
Target package and exact installed and requested versions:
Runtime, platform and dependency versions needed to reproduce:
Pinned catalog commit, matching fix IDs and prior upstream work:
Minimal independent reproduction and the observed failure:
Expected behavior and verification required on the published release:
Existing hold, reason and objective switch conditions, if applicable:
Requested central decision or change:
```

The maintainer owns the shared implementation and package evidence. Create or
update a pull request in Patches only when the user explicitly requests that
action. Confirm the canonical destination and current duplicate-work search,
prepare one package-scoped change in a registered central task, and follow its
verification and publication rules. Separate upstream communication from a
catalog PR. Neither routine dependency upgrades nor installing this skill
authorizes posting, opening issues or creating branches in upstream projects.
