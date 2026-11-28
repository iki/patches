# Project tools

Mise selects the exact Bun and Aube releases in `mise.toml`. Bun also appears in
`.bun-version` and `package.json` for direct consumers of those formats. The
launcher verifies all three declarations and checks both executable versions
when Aube needs Bun. Git and a trusted installation of
[Mise](https://mise.jdx.dev/getting-started.html) 2026.10.7 or newer are the
bootstrap prerequisites.

From this checkout's root, review `mise.toml` and the selected pins. Then trust
the reviewed file and explicitly install its two project tools.

```sh
mise trust mise.toml
mise install bun@1.4.5 aube@2.11.0
```

For PowerShell, resolve the installed Bun once and use it to start commands.

```powershell
$bunExe = & (Get-Process -Id $PID).Path -NoProfile -NonInteractive -Command {
  $env:MISE_OFFLINE = 'true'
  $env:MISE_AUTO_INSTALL = 'false'
  mise --no-config which bun --tool bun@1.4.5
  exit $LASTEXITCODE
}
if ($LASTEXITCODE -ne 0 -or -not $bunExe) { throw 'Mise could not resolve the project Bun.' }
& $bunExe environments/install.mjs setup
if ($LASTEXITCODE -ne 0) { throw 'Frozen installation failed.' }
& $bunExe app/toolchain.mjs aube run --no-install step:check
if ($LASTEXITCODE -ne 0) { throw 'Step verification failed.' }
& $bunExe app/toolchain.mjs aube run --no-install review:check
```

The same commands work in a POSIX shell.

```sh
(
  set -e
  bun_exe=$(MISE_OFFLINE=true MISE_AUTO_INSTALL=false mise --no-config which bun --tool bun@1.4.5)
  "$bun_exe" environments/install.mjs setup
  "$bun_exe" app/toolchain.mjs aube run --no-install step:check
  "$bun_exe" app/toolchain.mjs aube run --no-install review:check
)
```

The launcher runs from the project root even when invoked by absolute path
from another directory. It reads the pinned project manifest as data. Each
executable lookup runs Mise offline with configuration evaluation and automatic
installation disabled. Each Aube version probe also disables package-manager
switching and update checks. Those settings apply only to their respective
probes. The launcher resolves filesystem links, checks names and versions, and puts the selected
physical binary directories first on the child PATH. The original PATH follows
in its existing order so other tools, including shim-managed tools, remain
available. Aube can then invoke the same Bun from a package script. The launcher passes arguments directly and propagates the
child's exit status. Missing tools require an explicit `mise install bun@1.4.5 aube@2.11.0`.

Use `app/toolchain.mjs bun <arguments>` for standalone Bun work. To inspect
the actual child runtime, pass `bun -e 'console.log(process.execPath)'`
to the launcher. Ordinary catalog verification stays offline.
