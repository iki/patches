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

Package records retain the dated results. Use the [regression matrix](docs/regressions.md) to select the fixture and its compatible environment. Run portable fixtures in the central checkout's installed package member. Source-layout fixtures need the exact upstream revision and toolchain given in the package record. A downstream application's integration and acceptance tests run in its own checkout. Record fresh outcomes separately from prior runs. See the [package policy](CATALOG.md).

Claims about signature, subprocess
visibility, TLS, native completion and real Worker behavior require those actual
checks. Preserve failed attempts separately from successful results.
