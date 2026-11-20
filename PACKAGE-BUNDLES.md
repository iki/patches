# Check package bundles locally

From the Patches root, run `bun app/check-package-bundles.mjs` after installing the
dependency labs. The command verifies the catalog, discovers each registered
Aube selector, and checks its ordered installable bundle against matching local
package installations in `.cache/dependency-labs`. Automatic discovery resolves
symlinks within the generated labs or the project's physical `node_modules` tree.
Use an explicit source for an external store. Verification reads package files
as data and runs entirely offline.

To use another unpacked release or physical Aube installation, pass its
package directory and exact selector. Repeat an option to check multiple
copies of that exact package/version. Explicit sources replace lab discovery
for that selector only. All other registered selectors are still checked.

```text
bun app/check-package-bundles.mjs --source tinypool@2.2.0 <unpacked-package-directory>
bun test/check-package-bundles.mjs
```

Verify a release tarball's integrity against its registry record before
supplying the unpacked package when testing published bytes. The command
checks package name/version, not registry origin. Source checkouts and rebuilt
distributions can differ from a published package of the same version.

The verifier uses Git to check both application directions in private scratch.
A clean match must apply forward, change every declared file, reverse, and
restore every original SHA-256. It never writes to the input package. It
recognizes the existing in-place text diffs. A new unsupported patch layout
requires an explicit verifier change. Ambiguous, already-applied, incompatible,
missing, inaccessible or wrong-version sources produce an incomplete result
and nonzero exit. Git is the only external executable used.

The report lists the corresponding package regressions. Independently run
those tests on the relevant published package, runtime and platform. In
particular, a reversible package diff does not test TLS, actual worker process
creation/teardown, native callbacks, or TypeScript declaration compatibility.
The five installable selectors currently cover three independently removable
package fixes. Host and declaration adapters have their own regression files.
