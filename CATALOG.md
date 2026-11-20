# Managing package versions and dependency fixes

Patches is the place to reproduce a third-party dependency failure, adapt a fix to a new release, and decide when to retire it. Package owners can do this work in a standalone checkout. Downstream installations receive the procedure skills. Each application owns its client-specific integration code, selected catalog revision, dependency lockfiles and acceptance tests.

## Package inventory

Use the [standalone environments](environments/README.md) to prepare a target for regression testing. The [host prerequisites](docs/host-prerequisites.md) cover native SDKs, OCR resources, cryptographic tools and platform-specific checks.

Look up a dependency by ecosystem and upstream name in [the inventory](inventory/dependencies.json). Multiple locked versions may be correct because parent constraints, runtime versions and target platforms can differ. The direct role, platform and installation group determine which environment exercises each version. Keep transitive observations available for review without promoting them to direct package dependencies.

Organize records by the upstream responsible for the defect and the affected packages. Use upstream URLs, immutable source IDs, published versions, license notices, affected runtime and platform, fixture names and hashes. Public entries describe generic capabilities such as desktop packaging or document conversion. Keep application names, local repository paths, private environment values, application data and conversation logs outside the catalog. Record who authored upstream changes and retain upstream license text.

An exact pin can represent an observation, an installable test target, or an active hold. Record the distinction. An inventory observation says which version appeared in a source manifest or lock. An install requires a resolved environment and its own receipt. A release qualifies for support after the relevant package regression passes.

## Choosing a version

1. Check the latest published release on the supported channel for the package, its companion packages and the relevant runtime. A repository head alone does not establish a release. Use the existing prerelease channel when stable has no matching published feature. Record the release, source and observation date.
2. Run the existing regression against pristine published bytes, in the intended environment. If the failure remains, adapt the smallest central fix, run the same regression again, then test the real consuming operation. Independent fixes retain separate IDs and prerequisites. Record the tested upstream archive, package and runtime versions, platform, local artifact hashes, test commands, results and limitations.
3. If latest cannot be adopted, record the affected target and platform, exact supported and blocked versions, concrete reason, evidence, and a measurable condition for switching. The condition must state which release property or behavior to verify and which regression and acceptance checks must pass. Revisit the hold when a newer release meets its trigger. Record the result even if the hold must stay.
4. Publish supported versions in the package record and update its history in the same logical change. A release can be supported unpatched once its unmodified package passes the original regression and the affected application checks. A merged upstream change alone is insufficient.

For example, a native CLI hold can cover one OS and one runtime. Its switch condition can require 160 completed native callbacks, a genuine rejection, helper cleanup and one successful packaged build. An elapsed wait alone cannot satisfy that condition.

## Versioned patch files

Keep each package diff under `patches/<upstream-package>/<exact-version>/<fix>.patch`. Scoped package names retain their scope and name directories. Versions come from the validated package selector. Bundle atomic parts in the declared prerequisite order. The existing `patches/<selector>.patch` is the package manager's compatibility entry point and must be byte-identical to the ordered parts.

For a new version, add a version directory. Verify applicability against the new published bytes even if an old diff appears to apply. Keep the prior directory and selector during the deprecation period. Generic adapters with identical bytes can have a shared content identity if the record explicitly lists every supported version and its independent regression evidence. A version-specific adapter belongs with its version. Existing immutable snapshots keep their original paths and provenance.

## Deprecation and cleanup

Start the retention period when the catalog publishes the verified replacement, or publishes evidence that the upstream release works unpatched, and explicitly deprecates the older patch version. Record the UTC deprecation date, package, exact version, fix IDs, replacement version or resolving release, artifact hashes, and the change that introduced the deprecation. Preserve a reason and a switch condition for any version still under an active hold.

Keep deprecated patch files available for **two calendar months**. Add two to the UTC calendar month and clamp the day to the last day of the resulting month. A January 31 deprecation becomes eligible March 31. A December 31 deprecation becomes eligible February 28 or 29. Count from the recorded deprecation date, regardless of patch-file age. Missing dates, unresolved references, active holds or use by another retained selector keep the affected files out of cleanup.

The read-only review in the catalog verifier reads `inventory/deprecations.json`.
For a registered package bundle its entry carries the exact `selector`, `bundle`,
`sha256` and `deprecatedAt` as a UTC instant with milliseconds. The package
history supplies the published replacement or unpatched release, evidence and
reason. The verifier derives the earliest review instant and retains the time of
day across the two-month interval. Only a reviewed history entry establishes
the deprecation. Empty or missing historical evidence cannot start a clock.
Other artifact kinds require the same retention and shared-reference checks in
their package history before a cleanup review.

Use a separate, reviewed cleanup commit after eligibility. Inspect references in selectors, ordered bundles, prerequisite chains, notices and regression fixtures. Remove only eligible working-tree copies and obsolete selector entries. Keep a small package-history entry with versions, dates, reason, hashes, source commit, license references and the published catalog revision that still contains the bytes. A client locked to an older catalog revision can continue using it. Cleanup never rewrites those commits, deletes published refs, or removes shared licenses still in use.

## Independent setup and verification

Use [the project toolchain](TOOLCHAIN.md) for standalone development. Install exact tool versions through Mise explicitly. Launch package managers and tests with resolved physical executables and propagate their directories to children. Tool selection and install steps must run in the target directory. A successful version probe verifies tool identity only.

Use the [central setup procedure](environments/INSTALL.md), the [bundle applicability check](PACKAGE-BUNDLES.md) and the [regression matrix](docs/regressions.md) to install and exercise the selected package versions.

Keep incompatible dependency groups in isolated work environments. Aube owns the JavaScript lock and install. Use locked Cargo builds for native fixtures and a separate Python environment for each mutually incompatible package set. Provision browser binaries and native SDKs explicitly on the applicable platforms. Preserve lifecycle-script denials and upstream licenses. Keep credentials, model weights, OS-specific state and local paths out of public manifests.

Record separately which tools were found, which packages were installed, whether the frozen install succeeded, which pristine regression failed or passed, whether the central patch passed, and which host acceptance checks completed. Verification of catalog metadata cannot establish the last three outcomes. Keep ordinary integrity checks bounded and offline. Record missing platforms or packages as pending.

## Consuming the catalog

Install the two procedure skills at a reviewed catalog commit. Use a project-owned cache such as `.cache/patch-catalog` to hold the canonical checkout. A developer can instead set `PATCHES_CHECKOUT=../patches` in a local, ignored and untracked dotenv file. Resolve relative paths from the consuming project root. If that project's `.env` is committed, use its ignored `.env.local`. Read only the named setting as literal data. The locator grants no new authority and never overrides the pinned catalog commit.

Verify the expected Git origin and immutable revision, selected fix IDs, exact version and hashes before materializing package-manager inputs. Do not fetch, switch branches, stash or reset a shared external checkout as a side effect of discovery. Use the pinned Git objects or a separate owned snapshot when the external checkout's active branch differs. Cache provisioning is an explicit setup action. Fresh offline verification uses the already-provisioned snapshot. A missing snapshot must produce the exact bootstrap or recovery request.

If a fix needs work, search the catalog, history and existing issues or PRs for the package and symptom. Return a ready-to-use maintainer prompt by default. Include package/version, platform/runtime, public upstream source, bounded reproduction, expected/observed result, existing fix ID, and acceptance conditions. Create a PR against the central catalog only when the user explicitly requests that PR. Checking for duplicates, drafting a prompt, or installing a skill does not authorize filing an issue, posting a comment or contacting upstream maintainers.

## Migrating an existing selection

First publish and verify the central inventory, standalone setup and procedures. Then migrate each consumer's selected commit, physical checkout lookup and materialization path in a separate checked task. Preserve every existing package-manager selector, dependency lock, local integration and hash check until a fresh checkout passes frozen installation and the actual consumer tests with the new route. This lets standalone catalog work proceed before application dependency upgrades.
