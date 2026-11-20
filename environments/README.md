# Reproduction environments

These inputs reproduce exact baselines for package investigations. The inventory
records the release policy and the versions observed in each environment.
An exact historical fixture and a newly solved release have distinct
evidence. The root catalog verifier keeps its dependency-free runtime.

## Tool setup

In this directory run `mise install` explicitly. The local configuration records
all declared tool versions, backend aliases and operating-system filters. It
also installs CPython 3.12.16 for document extraction and 3.12.15 for retrieval
measurements, and 3.12.14 for the optional extractor environments. The package manager and JS runtime retain the root project pins.

Direct launches select the physical executable for the named package and version.
Use the catalog's pinned tool launcher for Aube and Bun. For other tools resolve
the selected installation, verify the binary identity and version, and supply the
physical executable to child processes. Platform-only SDKs such as Xcode,
Android SDK components and browser binaries have separate setup and acceptance
requirements in the inventory.

## JavaScript

The three package manifests preserve different versions and dependency roles in isolated workspace members. The [workspace installation procedure](../environments/INSTALL.md) provides the first solve, guarded activation and frozen setup for a clean checkout. Use the physical project Bun. Keep one Aube-generated active lock and preserve the declared lifecycle-script denials.

These inputs select published, unpatched packages for baseline comparisons.
For a patched test, select the canonical bundle for the exact version, bind its
digest and use Aube to generate the corresponding patched dependency edge.
Run the original regression in both environments. Fixture preparation does not
promote patches or modify upstream issues or PRs.

## Browser test tools

After the frozen JavaScript installation, install the browser the regression actually requires. From the repository root in PowerShell, select the physical Bun as described in `../TOOLCHAIN.md`, then run the installed CLI from the chosen member. Keep its browser cache in this checkout and use the same path for the test process.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.cache/playwright-browsers'
$env:PLAYWRIGHT_SKIP_BROWSER_GC = '1'
& $bunExe .cache/dependency-labs/web-native-npm/node_modules/@playwright/test/cli.js install chromium
```

Run the matching browser regression after installation. Native WebView2, WebKit and other OS dependencies are listed in [host prerequisites](../docs/host-prerequisites.md).

## Native crates

The native fixture combines the eight direct Cargo dependencies and preserves
the mobile-only condition on the geolocation plugin. The checked-in Cargo.lock
was generated for this fixture. Use Cargo 1.99.0 and set `CARGO_TARGET_DIR` to
a directory under the root `.cache` for builds. From `native-rust` run:

```sh
cargo metadata --locked --format-version 1 --filter-platform x86_64-pc-windows-msvc
cargo check --locked
```

The Windows dependency-graph check, compilation, cross-target builds, and actual
desktop/mobile launches are distinct results. Native SDKs, linkers and targets
must be available for the platforms being exercised.

## Python

Use a distinct venv under the root cache for each compatible Windows x86-64
environment. The document and retrieval locks intentionally select different
NumPy, ONNX Runtime, and markdown-it-py versions. Each directory's
`.python-version` gives the exact interpreter baseline. From the project root,
use each physical interpreter with `-m venv .cache/<environment>`. Invoke that
venv's Python with:

```sh
python -I -m pip --isolated install --only-binary=:all: --no-deps -r environments/<environment>/requirements.lock
python -I -m pip --isolated check
```

Replace the placeholder with `document-extraction-pypi` or
`retrieval-benchmark-pypi`. Package rows pin versions. Wheel availability,
downloaded artifact digests and complete package compatibility need to be recorded
for a specific platform before claiming a fresh verified install.

## Optional extractors and speech workers

Each optional Python tool has its own direct requirements.in file and interpreter
baseline. These are separate solver inputs. Obtain a package-resolution report and
a compatible lock for the selected OS, architecture and accelerator before installing.
Use that environment's Python with the reviewed lock, then verify the exact package
metadata or executable version. The inventory includes dated installed-package
observations for comparison. Models and native assets have independent version,
license and hash requirements. Select and provision those resources explicitly for
a specific runtime test.

| Distribution | Install and verify |
|---|---|
| Xberg 1.3.3 | Use the official native release for the target platform. Check its release digest and the physical executable with `xberg --version`. The recorded Windows x64 executable SHA-256 is `8206bb3117633639c23bc949cf45340233b469db3bafd0420807cd15503c0d0d`. [Release](https://github.com/xberg-io/xberg/releases/tag/v1.3.3) |
| Marker 2.0.0 | Resolve the separate Marker inputs. The Windows path requires Surya 0.22.1 and the Vulkan llama.cpp helper b11146. The selected Windows archive has SHA-256 `55a378aa095b466979d85075234f66d7655c7a7483222af0c006c0e55b4d7bd6`. Probe package metadata, helper lifetime and actual conversion. [Marker](https://pypi.org/project/marker-pdf/2.0.0/) and [Native helper](https://github.com/ggml-org/llama.cpp/releases/tag/b11146) |
| MinerU 4.0.10 | Resolve the MinerU inputs for the selected tier and accelerator. Verify `mineru-kit --version` and a `mineru-kit parse` fixture using preprovisioned assets. [Release](https://pypi.org/project/mineru/4.0.10/) |
| Docling Slim 2.132.0 | Resolve the PDF, CLI and local-model components. The direct input selects the published standard extra. Test the physical `docling convert --version` and an offline conversion for the chosen OCR backend. [Release](https://pypi.org/project/docling-slim/2.132.0/) |
| OpenDataLoader PDF 2.5.12 | Resolve the dedicated Python input and select a physical Java runtime. Java 11 or later is required. The baseline uses Temurin 21.0.12+8.0.LTS. Check the Python distribution version, Java version and a real conversion. [Release](https://pypi.org/project/opendataloader-pdf/2.5.12/) |
| OmniVoice 0.2.1 | Check out source commit `08be0b4ccbac3e13e374e86fbfead4b4cac343e2` and install it in a dedicated Python 3.10+ environment following its pinned instructions. Select a compatible device-specific PyTorch/Torchaudio build (2.4 or newer) and Transformers (5.3 or newer). Record physical FFmpeg and FFprobe paths. The optional model snapshot is `c5fdb5ccb189668d56333f77ba2629f4cd7535f4`. Verify code and models independently before a local smoke test. [Pinned source](https://github.com/k2-fsa/OmniVoice/tree/08be0b4ccbac3e13e374e86fbfead4b4cac343e2) |
