# Consumer-owned integration bindings

A generic dependency fix and its application integration are different artifacts.
Keep application channels, account/resource names, deployment state, local module
imports, application logging and recovery behavior in the consumer repository.
Classifying that file as consumer-owned does not remove its integrity obligation.

An explicit consumer selection revision must bind each such integration to:

- its exact repository-relative local path and SHA256;
- the selected canonical fix IDs and every prerequisite;
- exact selected canonical artifact paths/hashes and catalog revision;
- its existing original provenance, retained in the consumer;
- local regression file paths/hashes, relevant platform commands and separately
  recorded actual outcomes;
- a statement of which behavior is generic and which remains application-owned.

The consumer verifier must reject unknown/duplicate paths and fix IDs, missing
prerequisites, absent canonical references, missing provenance/regressions, hash
drift, directory escapes/links, and uncovered runtime integration paths. An
integration cannot satisfy a package-patch bundle requirement. Its existing
application checks remain live; a catalog receipt does not replace them.

Keep verified canonical selections and consumer integrations in separate
manifest collections. The consumer's committed selection identifies the
publisher, exact catalog commit, package/version, ordered prerequisites, artifact
paths and hashes. Verify the selected bytes from the cached catalog or the
read-only external checkout described in the [consumer skill](../SKILL.md).
Materialize the registered bundle in the consumer's owned cache before invoking
Aube. Keep the stable cache-relative selector and matching digest in the local
install contract. A local checkout override belongs only in untracked, ignored
configuration. Never tie portable install paths to the override. Never call an integration byte-identical to a portable example.
The migration must compare complete before/after coverage, proving that each old
canonical mapping is either still exact or represented by an explicit checked
integration binding. Require fresh consumer verification after changing either
collection. Preserve local installed package paths, ordering and version pins
unless the user separately requested an upgrade.

Migrate existing committed artifacts only after both a clean bootstrap and an
older frozen install can reproduce their selected bytes. A later cleanup of
deprecated versions on the catalog's main branch leaves historical catalog
revisions available. The skills are the downstream distribution. The catalog
and its test environments stay independently managed in Patches. Report
missing or conflicting coverage using the default maintenance prompt. Opening a
catalog PR requires an explicit request for that action. Do not copy another checkout's success receipts,
private environment, trust configuration or signing keys.
