# Oxlint release hold

Related packages: oxlint, @oxlint/plugins. [History](HISTORY.md) · [Upstream references](UPSTREAM.md).

Status and measurements below are retained source observations through 2026-11-06, not fresh remote or package verification.

## Oxlint and matching plugins

Keep `oxlint` and `@oxlint/plugins` on matching eligible versions. The
[recorded hold history](HISTORY.md) explains why a containing release still needs
unsuppressed type-aware lint and the actual consumer's normal checks.

### oxlint-immutability-1-91

Unmodified-release hold on Oxlint and matching plugins at 1.90.0, avoiding the 1.91.0 React compiler/immutability regression. [Issue #28401](https://github.com/oxc-project/oxc/issues/28401) closed through [PR #28820](https://github.com/oxc-project/oxc/pull/28820), commit 3d3a6f468068a3794a44c0e83e9177bd61ea2c00. The recorded 1.92.0 release contains the change. Eligibility, matching plugins and unsuppressed type-aware lint/normal checks must pass in the actual consumer before removing its hold. The original 24-hour threshold was 2026-11-07 12:30 UTC; elapsed time alone is not removal evidence. No source fork is needed for this hold.
