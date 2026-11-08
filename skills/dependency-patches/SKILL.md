---
name: dependency-patches
description: Select, install, update or retire centrally owned dependency fixes in a consuming project, preserving exact provenance and offline verification. Use for patched-package updates and supplied adapters; canonical fix development belongs to patch-maintenance.
---

# Consume shared dependency fixes

Read the project's dependency policy, canonical owner, selected registry revision, package-manager configuration and supported pins. Those local rules determine authority and commands; installing this skill changes none of them.

Separate an application defect from a third-party dependency defect. Reproduce the latter with bounded inputs and exact versions/runtime, then select an applicable canonical fix. Do not import unrelated fixes or assume that an old workaround still reproduces.

Verify source revision, hashes, retained licenses/notices, affected versions, prerequisite fixes, regression evidence and removal condition. Resolve aliases explicitly. Keep selected immutable artifacts and provenance locally when offline installation or checks need them; a sibling checkout must not become an undeclared runtime dependency. Register transitive selectors exactly.

If a fix is absent, incompatible or unverifiable, follow the project's escalation rule with the reproduction. Do not let CI repair, a fallback, a declaration shim, a fork or a monkeypatch bypass centralized ownership. Canonical authorship is a separate task; this skill grants no authority to relax dependency trust.

Keep planning and application separate. Record current/proposed versions, dependency roles, baseline and artifact hashes. Recheck them before applying through the owning package manager. Review manifest and lockfile changes together; preserve lifecycle-script trust. Reconcile uncertain installation/publication outcomes before retrying.

Keep ordinary integrity checks offline. Run regressions through the actual consumer and affected platform in addition to registry checks. A passed catalog check does not prove native, browser or installed-package behavior.

Keep full application wrappers local. When separating an application integration
from a generic canonical fix, follow the [integration binding contract](references/integrations.md):
retain its exact hash, original provenance, canonical references and regression
coverage. A classification change must never silently remove integrity checks.

Remove a selected fix only after the unpatched published version includes the change and passes the original regression and consumer checks. A merged PR, an upstream source build or a patched old package is insufficient. Retain selection/removal history and independently needed adapters.

For an explicitly authorized ownership migration, transfer exact artifacts, notices, supported pins, upstream references, regressions and removal criteria first. Pin the new catalog commit, preserve original origins and offline copies, then change consumer policy. Procedure skills and artifact releases may have different release cadences.
