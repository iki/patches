# Verification

The offline gate validates bounded physical-file inventory, UTF8 LF, hashes,
Git blob identities, real source revisions, notices, unique fix/group identities,
acyclic prerequisites, exact package/version series and bundle concatenation.
It rejects source repositories outside the declared upstream/fork/catalog owners.
All original catalog corruption, path, symlink, unknown-field, version-crosswire
and missing-evidence regressions remain required.

`step:check` and `review:check` run the catalog tests with their existing 30-second
case limit. They do not execute imported adapters, install packages, contact
upstream services or require a sibling checkout. A successful catalog check is
cooperative integrity evidence, not attestation of correctness or publication
authority.

No fresh execution is claimed by this prepared tree. Original package results are
dated in package records. Source-harness fixtures explicitly retain their required
upstream layout; portable regressions must run from a consumer with exact declared
dependencies and relevant platform tools. Claims about signature, subprocess
visibility, TLS, native completion and real Worker behavior require those actual
checks. Preserve failed attempts separately from successful results.
