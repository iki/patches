# Workspace installation

## Frozen setup

From the root of a clean checkout, select the physical Bun described in
[TOOLCHAIN.md](../TOOLCHAIN.md). Prepare the three workspace members and install
the committed graph with lifecycle scripts disabled.

```powershell
& $bunExe environments/install.mjs setup
```

On POSIX use `"$bun_exe" environments/install.mjs setup`.

## Refresh an existing checkout

After changing dependency manifests, setup checks the generated member manifests against the new inputs. If it reports that a workbench manifest differs, finish any running workspace installation and inspect the three manifests under `.cache/dependency-labs`. Check whether they match the corresponding files under `environments` at the previous catalog revision. Preserve any local investigation separately. Once the previous workbench is idle and its `.workspace-install.lock` is absent, rename the entire `.cache/dependency-labs` directory to an unused sibling under `.cache`. Run frozen setup again from the checkout root. The earlier workbench remains available for comparison.

## First solve and activation

In a registered maintenance checkout, use the physical Bun selected by the offline, no-config lookup in [TOOLCHAIN.md](../TOOLCHAIN.md). Once the root pins are installed and that command has set `$bunExe`, run the following PowerShell command. It prepares the three JavaScript members, resolves their combined lock in a unique temporary directory and runs Aube's frozen install there. It prints the candidate directory for inspection. Network access to the configured registry is required for a cold solve.

```powershell
& $bunExe environments/install.mjs solve
```

On POSIX use `"$bun_exe" environments/install.mjs solve`. The command checks the physical Bun and Aube versions, retains the explicit build denials, disables lifecycle scripts and preserves the configured peer policy. It verifies all four workspace importers, their exact direct specifiers, package records, snapshots and selected patch digests. Source changes, unresolved direct edges and failed installs leave the active workspace and lock intact. Each solve has a separate candidate directory. The working checkout may gain prepared cache members.

Review the candidate's `activation.patch`, the resolved versions, platform variants and integrities in `aube-lock.yaml`, and the Aube output. Record unresolved peers reported by Aube and review each member’s peer-bound snapshots. From the same checkout, explicitly activate the candidate you produced locally. This command checks the original input hashes and re-derives the exact two-file diff from the candidate's lock and the reviewed workspace template. Git verifies the current index and working files before staging the workspace definition and the single root lock. Complete the repository's normal checks and publication afterward.

```powershell
& $bunExe environments/install.mjs activate C:\path\to\patches-aube-candidate
```

Setup and activation use an exclusive file under `.cache/dependency-labs`. After a terminated or timed-out operation, inspect the candidate, current owner and any running Aube processes before recovering the retained lock. Aube can use its normal package store. Ordinary catalog gates stay offline. Run the focused fixture with the physical Bun using `bun test environments/install.test.mjs`.

## Pristine and patched reproductions

The committed graph is the pristine baseline. Use a separate registered checkout
for a patched comparison. Add the selected exact registrations from
`registry.json` → `packageSeries` to the root `package.json` →
`aube.patchedDependencies`. In a checkout with the active workspace, prepare the
members and resolve the patched lock before frozen setup. Review the lock diff
and package digests in that checkout.

```powershell
& $bunExe environments/prepare.mjs
if ($LASTEXITCODE -ne 0) { throw 'Workspace preparation failed.' }
& $bunExe app/toolchain.mjs aube install --lockfile-only --ignore-scripts
if ($LASTEXITCODE -ne 0) { throw 'Patched lock resolution failed.' }
& $bunExe environments/install.mjs setup
```

Web selects pristine Portless 0.18.1 with Bun 1.4.5. Mobile retains the 0.15.12 selector for its Bun 1.4.2 baseline. Select the matching Wrangler bundle in each patched profile and the Tinypool 2.2.0 bundle for formatter tests. The retained Portless 0.16.0 and Wrangler 4.165.0 bundles require separate pristine installations at those versions. Register only selectors with a direct edge in the workspace under test.

| Exact selector | Registered bundle |
| --- | --- |
| `portless@0.15.12` | `patches/portless@0.15.12.patch` |
| `portless@0.16.0` | `patches/portless@0.16.0.patch` |
| `tinypool@2.2.0` | `patches/tinypool@2.2.0.patch` |
| `wrangler@4.158.0` | `patches/wrangler@4.158.0.patch` |
| `wrangler@4.165.0` | `patches/wrangler@4.165.0.patch` |
| `wrangler@4.169.0` | `patches/wrangler@4.169.0.patch` |

The solve copies each selected bundle after checking its canonical registration and migration SHA-256. Aube generates the root lock and patch hashes. The command verifies each selected direct edge, its snapshot and the fresh `node_modules/.aube-applied-patches.json` marker. Compare the same package regressions on the pristine and patched installations. Native, browser and upstream behavior require their respective tests.
