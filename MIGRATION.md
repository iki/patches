# Catalog data and provenance

The catalog retains `shared-patch-registry-v1` and `patch-migration-v1` projections
used by consumers. Stable fix IDs, package series, artifact hashes and prerequisite
closure remain explicit. The required package-group index adds package summaries,
history and allowed upstream/fork ownership; it does not select consumer packages.

An artifact's `origin` identifies the exact repository commit, path and Git blob
from which its current bytes were collected. Unchanged upstream/fork files keep
their genuine source origin. Curated documents, generated package diffs and neutral
adapters use the separate signed catalog artifact snapshot as their immediate
origin. That is a collection/maintenance origin, not a claim that the catalog
authored upstream code. Original and LF hashes describe those exact snapshot
bytes. Earlier private transfer evidence and transformation mappings are retained
outside this repository; consumer context is intentionally not republished.

The artifact snapshot precedes the completed catalog commit, avoiding a circular
self-commit identity. Every `PENDING_PATCHES_ARTIFACT_SNAPSHOT_SHA` must be replaced
with that inspected snapshot's actual 40-character commit ID before verification.
The normal gate rejects placeholders; there is no preparation bypass. Package
source hashes, Git blobs, byte bounds, notices and LF validation remain mandatory.

`patches/<package>@<version>.patch` remains the installable bundle. Its bytes must
equal the exact ordered concatenation of the registered parts beneath
`patches/<package>/<version>/`. A consumer selects only the series for its exact
installed version, preserving its local mapping and package-manager lockfile.
Source proposals and retired patches are not installed package bundles.

Whole application build/configuration wrappers are consumer-owned integrations,
not canonical patch artifacts. Keep their original provenance and exact local
hashes in the consumer. Bind each integration to selected generic fix IDs and
the actual canonical artifacts it implements or calls, plus the existing local
regression and platform checks. This classification must be explicit and verified;
removing a catalog mapping alone is not a migration. See the
[consumer integration contract](skills/dependency-patches/references/integrations.md).

Catalog relocation does not authorize package upgrades, consumer source changes,
history rewriting elsewhere, weaker verification, or a change to a shared service.
