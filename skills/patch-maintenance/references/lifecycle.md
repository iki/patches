# Patch lifecycle

This procedure covers package diffs, forks, preloads, declaration shims and
application-side bypasses of upstream defects. Ordinary supported extension
points are not automatically patches; record that distinction. Local repository
rules supply exact commands, supported pins, credentials and action authority.

## Records and atomic fixes

Give every independently removable fix a stable ID, exact affected/tested versions
and runtime, responsible upstream, immutable source and fork references,
prerequisites, regressions, limits and removal condition. Group by upstream and
then related packages. Record our PR, matching third-party work with attribution,
downstream-only availability, or a concrete blocker. A failed submission is not
a PR; failed inspection leaves status unknown with the last observation retained.

Record the reusable fork repository, atomic branch, comparison base, published
head, setup and regression instructions for every active workaround. A third-party
branch or local cache commit is not our published reusable fork. Adapters need
portable implementations/examples, not full consumer application code.

Keep each independent fix in a separate patch or branch. A stacked branch may add
one fix over its recorded prerequisite; record order and comparison base. For a
package manager accepting one patch per package, concatenate an explicitly ordered
atomic series and install only that exact bundle. Never use modified dependency
stores as the durable fix. Retain explicit release holds separately from patches.

Put each maintained atomic package diff in a folder containing its exact
package version. Bind each version's ordered parts to its own installable bundle
and digest. Keep both versions selectable while a prior version is deprecated.
The default target is the latest published release on the declared channel.
For any hold, record the affected package and versions, the technical reason
with evidence, and observable conditions for removing the hold and adopting
the latest release. Recheck the conditions during subsequent updates.

Every tracked package keeps a current summary and history link even after all
fixes retire. History retains superseded pins, resolved versions/commits, tested
removals and related active fixes. Consumer upgrade-deferral markers cover every
affected direct/transitive package until its last active reason is removed.

## Establish and contribute

1. Reproduce the failure with exact versions and the smallest safe fixture. Show
   the regression fails before the fix. Identify the upstream responsible for an
   interaction rather than assigning every symptom to the wrapped package.
2. Search open and closed issues, PRs, discussions and linked predecessors using
   the symptom, API/error and platform/runtime. Read review objections; record
   useful findings and the observation date. Prefer a sound matching approach and
   preserve contributor attribution. Do not create duplicate proposals.
3. A consuming project normally returns a reproducible maintenance prompt
   for Patches and records any matching fix or proposal. The catalog maintainer
   resolves the shared defect once, using a package-scoped fixture. Create or
   update a catalog PR only when the user explicitly requests a PR in Patches.
   Upstream comments and PRs require their own authorization. When such
   communication is authorized, read previous messages first. A reaction or
   comment should add useful missing evidence, correction or references. Submit
   an atomic PR only when it fits upstream goals and contribution rules. Explain
   the defect, resulting behavior, approach, compatibility/tradeoffs, reproduction
   and validation. Distinguish local workaround tests from upstream-build tests.
4. Enable and read back maintainer-edit permission on our PRs. Do not disable it
   or alter somebody else's PR settings. Record a concrete coordination step when
   the platform cannot enable it. Contributor registration, CLA and human-response
   requirements remain effective.
5. Pin versions, retain exact artifact/license provenance, update current records
   and history, then run focused regressions and the consumer's normal gates.
   Publication follows that repository's authorized task lifecycle.

## Downstream-only work

Respect an upstream decision against a runtime, platform or approach. Retain a
tested workaround with that decision linked and dated. Do not open a duplicate
PR against it. When communication is authorized, one useful availability comment
links the published atomic fork/head, versions, setup, tests and limitations;
offer a PR if maintainers express interest without implying endorsement.
Follow-ups contain new information only. This disposition does not waive local
validation, reusable fork evidence, update audits or removal criteria.

## Updates and retirement

Before changing a fix or package/runtime, refresh relevant upstream discussions
when the task authorizes network review and compare actual diffs/tests. Rebase
atomic work independently, preserve published history, and use a new versioned
branch when an ordinary rebase would rewrite a shared branch. Explicit user
authorization is required for any exceptional rewrite; it is not contagious to
other repositories. An unchanged audit need not create a new history entry.

A merged PR, source build, closed discussion or passing patched old version does
not prove that a published package contains the fix. Test the eligible unpatched
release against the original regression and real consumer/platform.
Publish the new supported package series or verified unpatched release and
record its reference and UTC effective deprecation date for the old version.
Rebuild the new selector and bundle as needed, reinstall, and rerun affected
checks. Maintain independently needed adapters and active holds. Record newly
introduced defects under separate IDs.

Retain the prior selectable patch files for two calendar months from that
recorded effective time. Use the same UTC day and time two months later,
clamping to the final day when the target month is shorter. For example, a
December 31 deprecation at 12:00 UTC becomes eligible on February 28 at 12:00
UTC in a non-leap year. Later catalog edits do not restart the clock.

Remove eligible old patch files and selectors only in a dedicated cleanup
commit. Check for active references and holds and preserve any shared file
still needed. The history record identifies the former package version, fix ID,
effective and cleanup dates, replacement, last immutable revision that supplied
the files, upstream reference, and verification evidence. Preserve published
history so a pinned old checkout can still reproduce a frozen install. Records
without a dated, verified replacement are ineligible for age-based cleanup.

After an authorized, nonduplicate follow-up on a fully fixed published release,
use the tested version's verified GitHub Release link and concise observed results:

```markdown
✅ Tested OK on <package> [<version>](verified-release-URL) 🔥 Thank you!

<Runtime/platform, regressions and actual local workaround removal.>
```

If no GitHub Release exists, use the exact version on npmx.dev for npm packages,
or the ecosystem's default registry otherwise. Do not use a latest-version page
or substitute a tag/commit for a verified registry fallback. For remaining issues,
identify tested successes separately from concrete linked defects; use matching
PRs or documented downstream-only availability instead of inventing a new PR.
Use the corresponding concise format:

```markdown
Tested on <package> [<version>](verified-release-URL):

✅ Tested OK:

- <Observed behavior linked to the applicable merged PR.>

❌ Remaining issues:

- <Concrete remaining defect linked to its matching PR or tested downstream fork.>
```

Retain the successful follow-up URL with the tested release and current/history
record. Never claim an untested behavior passed.

## Coordination and local work

Use or create an owned upstream checkout beneath the local configured cache root;
inspect remote, branch, dirty state and upstream instructions first. Preserve
unrelated work and record base/head. Ignored preparation is not published evidence.
Keep durable reproductions when submission is blocked. State an action-needed
item with blocker, responsible party, exact next step and direct source/settings
links; prepare all independently authorized work before requesting missing input.

Use existing scoped connectors/credentials and the project's secret boundary.
Never expose credentials, broaden scopes or retry an uncertain mutation before
reconciliation. If a connector lacks a capability, inspect an already authorized
CLI route before assigning manual work; do not infer authority from an installed
skill or cached login. Preserve successful URLs and honest failures.
