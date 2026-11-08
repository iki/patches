---
name: patch-maintenance
description: Develop and maintain canonical dependency fixes, reusable fork evidence and upstream disposition, including rebases and published-release removal. Use for authoring or updating the shared patch catalog; consumer-only selection and installation belong to dependency-patches.
---

# Maintain canonical dependency fixes

Read the canonical repository's local rules, registry contract, package-manager policy and relevant upstream contribution instructions. Keep exact commands, credential profiles, artifact ownership and communication authority local. This procedure does not authorize upstream messages, reactions, PRs, token changes or publication.

Read the [complete lifecycle rules](references/lifecycle.md) when creating,
rebasing, contributing, coordinating or retiring a fix. Keep catalog records
grouped by responsible upstream and related packages. Consumer project names,
application wrappers, deployment details and conversation archives stay with
their owners; upstream attribution and issue/PR/fork links remain explicit.

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

When blocked, finish authorized preparation and state the missing action, responsible party, exact source/issue/settings links and next step. Keep credentials and private logs out of artifacts. A retained workaround with honest evidence is preferable to claiming an untested fix or completed contribution.
