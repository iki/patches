---
name: patch-maintenance
description: Develop and maintain canonical dependency fixes, reusable fork evidence and upstream disposition, including rebases and published-release removal. Use for authoring or updating the shared patch catalog; consumer selection and installation belong to dependency-patches.
---

# Maintain canonical dependency fixes

Read the canonical repository's local rules, registry contract, package-manager policy and relevant upstream contribution instructions. Keep exact commands, credential profiles, artifact ownership and communication authority local. This procedure does not authorize upstream messages, reactions, PRs, token changes or publication.

Read the [complete lifecycle rules](references/lifecycle.md) when creating,
rebasing, contributing, coordinating or retiring a fix. Keep catalog records
grouped by responsible upstream and related packages. Consumer project names,
application wrappers, deployment details and conversation archives stay with
their owners; upstream attribution and issue/PR/fork links remain explicit.

## Plan by package and version

Use the central project's own Mise tools, package environments, locks and
test fixtures. Start from the package record, including each package's direct
and transitive roles, platform and runtime. Reconcile requests from multiple
callers against that record and existing PRs before opening a new task. Keep
the review scoped to the target package and its required prerequisites.
The public record contains package names and upstream attribution. Keep
consumer identifiers, workspace paths, application integrations and private
operational evidence with their owners.

Use the latest published release on the declared channel as the default update
target. Record the observed release, source and observation date separately
from installed or verified versions. Keep exact resolved versions in setup
manifests and locks. When a stack requires a specific version, record the
affected roles, technical reason, exact range or pin, evidence and objective
conditions for moving to the latest release. Recheck those conditions when a
new release or relevant upstream fix appears. A failed lookup or test leaves
the prior observation and an explicit verification gap.

A consumer's usual handoff is a package-specific prompt. Assess its reported
failure, search the package history and concurrent work, and run a minimal
central reproduction before changing coverage. Work on one canonical fix per
independent defect. A request to install a package or update dependencies
does not authorize a catalog PR. Create or update one only on an explicit
request for a Patches PR. Check the target repository and prior publications.
Obtain separate authorization for messages or PRs in upstream projects.

## Establish an atomic fix

Reproduce the dependency failure with exact versions/runtime and the smallest safe fixture. Establish the failing regression before changing behavior; identify which upstream owns the defect. Ordinary supported extension points are not automatically patches, but bypasses of upstream defects, declaration shims, preloads and forks belong in the registry.

Search upstream's open/closed issues, PRs and relevant discussions, including linked predecessors and review objections. Record useful findings and the observation date. Reuse sound existing work with attribution instead of opening duplicates. Respect a maintainer's decision against a runtime or approach; record a downstream-only disposition when appropriate.

Give each independently removable fix a stable ID, exact affected/tested versions, artifact hashes/notices, prerequisites, regression evidence, limitations and removal condition. Distinguish our contribution, matching third-party work, downstream-only availability and blocked preparation. A failed submission is not an existing PR; failed remote inspection leaves status unknown with the previous observation retained.

Keep one semantic fix per atomic file or branch. Where the package manager supports one patch per package, maintain an explicit ordered series and an exact concatenated bundle; only the bundle is installed. Never use edits to installed dependencies as the durable fix. A release hold on an unmodified package is distinct from a source patch.

## Preserve reusable evidence

Follow the canonical owner's fork policy. Reusable fork evidence includes repository, branch, immutable published head, comparison base, tested package/runtime, regression and setup instructions. Portable adapters need runnable examples rather than imports that exist only in an application.

Independent fixes branch separately from upstream. A stacked branch may add one fix over its recorded prerequisite; state dependency order and comparison base. Preserve published history and prior review references; a new versioned branch can avoid rewriting a shared branch. Do not claim that local cache commits are published or that a differently expressed installed patch is byte-identical to an upstream source change.

Preserve licenses, attribution and original source hashes before normalization. Keep exact originals and documented transformations. Registry checks should remain offline and bounded, separate from actual consumer/platform regressions.

When a user explicitly requests removal of consumer context, preserve the original
evidence privately outside the public catalog and record the transformation
honestly. Bind the curated representation to its actual catalog source snapshot;
do not label it as an unchanged upstream copy or alter upstream licenses.

## Update, communicate and retire

Before changing a fix or package/runtime, inspect current upstream diffs and discussion when network review is authorized. Compare the implementation and tests, not just PR titles. Record only meaningful new evidence; an unchanged read-only poll need not create new history.

When communication is authorized, read prior messages and contribution rules first. State the concrete defect, approach, compatibility limits and tests. Follow maintainer-edit and coordination requirements for our PRs; do not alter another author's PR settings. For downstream-only fixes, an availability comment links the tested immutable fork and limitations without implying upstream endorsement. Reconcile uncertain remote actions before retrying, and preserve successful URLs.

A merged PR does not prove a released package contains the fix. Test an eligible unpatched published release against the original failing regression and the real consumer, then remove only that independent fix, regenerate the package bundle/lockfile and rerun affected checks. Retain useful supported adapters whose own removal criteria differ.

Move the full retired record into history with resolving version/commit and removal evidence. Preserve package/history links and any effective dependency-upgrade holds until their last active reason is gone. Record newly introduced defects independently.

## Keep deprecated versions reproducible

Use `patches/<package>/<exact-version>/` for the maintained parts of each
package series, including the scope for a scoped npm name. Keep the existing
versioned Aube bundle contract and verify its bytes against those parts in
order. Keep the old version's distinct bundle intact while publishing a
replacement. New version-specific adapter or declaration variants likewise
belong in a directory identified by package and exact version; keep any shared
implementation bound by explicit hashes from the applicable versions.

When a verified supported replacement is published, record the old version as
deprecated with the replacement version, its exact catalog revision or release
reference, and the UTC effective date. A verified unpatched release that meets
the removal criteria can be the replacement. Retain the old selectable bytes
and their metadata for two calendar months from that effective date. Add two
months at the same UTC day and time, clamping the day to the last day of the
target month when necessary. Preserve the effective date on later edits.
An old record without a verified replacement and effective date stays out of
date-based cleanup.

After the window ends, remove obsolete files and their active selectors in a
separate reviewed cleanup commit. Check outstanding holds, shared artifacts
and prerequisites before removing anything still needed by another supported
version. Keep a history entry with the version, dates, reason, replacement,
verification and last immutable revision that supplied the old files. Rebuild
affected bundles and run offline integrity and package regressions. Historical
installs can continue to resolve their own pinned catalog revision. Cleanup
must preserve Git history and all existing published refs.

When blocked, finish authorized preparation and state the missing action, responsible party, exact source/issue/settings links and next step. Keep credentials and private logs out of artifacts. A retained workaround with honest evidence is preferable to claiming an untested fix or completed contribution.
