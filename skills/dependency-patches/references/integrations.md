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

Keep canonical byte copies and consumer integrations in separate manifest
collections. Never call an integration byte-identical to a portable example.
The migration must compare complete before/after coverage, proving that each old
canonical mapping is either still exact or represented by an explicit checked
integration binding. Require fresh consumer verification after changing either
collection. Preserve local installed package paths, ordering and version pins
unless the user separately requested an upgrade.

Consumers pin the new published catalog and install these procedure skills through
their existing reviewed workflow. Do not copy another checkout's success receipts,
private environment, trust configuration or signing keys.
