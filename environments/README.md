# Reproduction environments

These inputs reproduce exact baselines for package investigations. The inventory
records the release policy and the versions observed in each environment.
An exact historical fixture and a newly solved release have distinct
evidence. The root catalog verifier keeps its dependency-free runtime.

## Tool setup

In this directory run `mise install` explicitly. The local configuration records
the tool versions, backend aliases and operating-system filters. Each Python
environment selects its interpreter with `.python-version`. Bun 1.4.5 and Aube 2.11.0 are the project defaults. Select Bun 1.4.2 explicitly for historical mobile regressions.

Direct launches select the physical executable for the named package and version.
Use the catalog's pinned tool launcher for Aube and Bun. For other tools resolve
the selected installation, verify the binary identity and version, and supply the
physical executable to child processes. Platform-only SDKs such as Xcode,
Android SDK components and browser binaries have separate setup and acceptance
requirements in the inventory.

The web profile selects cf 1.0.0-rc.6 for v1 build output. Mobile retains cf 1.0.0-beta.27 until its reader accepts v1. The Windows OpenDataLoader conversion used Temurin 27. Android keeps the current Temurin 21 LTS build until its Gradle toolchain supports the newer JDK and a clean build passes for the selected ABI. Mise keys for the two JDKs are recorded in `mise.toml`. XcodeGen 2.49.0 is selected for macOS. The published release was checked from Windows. [XcodeGen release](https://github.com/yonaskolb/XcodeGen/releases/tag/2.49.0)

On Windows x64 the configured Zstandard release ZIP contains a 64-bit executable. Check that the selected physical `zstd --version` reports both 64-bit and 1.6.0. [Release assets](https://github.com/facebook/zstd/releases/tag/v1.6.0)

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
was generated for this fixture. Use Cargo 1.100.1 and set `CARGO_TARGET_DIR` to
a directory under the root `.cache` for builds. From `native-rust` run:

```sh
cargo metadata --locked --format-version 1 --filter-platform x86_64-pc-windows-msvc
cargo check --locked
```

The Windows dependency-graph check, compilation, cross-target builds, and actual
desktop/mobile launches are distinct results. Native SDKs, linkers and targets
must be available for the platforms being exercised.

## Python

Use a distinct Windows x86-64 venv for each lock. The document environment
exercises MarkItDown's DOCX, PDF, PPTX and XLSX extras, markdown-it-py and
pypdf. Retrieval uses ChromaDB with explicit vectors for model-free testing.
From the project root, run the interpreter selected by the environment's
`.python-version` with `-m venv .cache/<environment>`. Use its venv Python
to install and verify the frozen wheel set.

```sh
python -I -m pip --isolated install --only-binary=:all: --no-deps -r environments/<environment>/requirements.lock
python -I -m pip --isolated check
```

Replace the placeholder with `document-extraction-pypi` or
`retrieval-benchmark-pypi`. On 2026-11-28 both locks passed a clean wheel
install and `pip check` on Windows x86-64 with CPython 3.14.10. The 38-wheel
document environment converted DOCX, PDF, PPTX and XLSX fixtures to Markdown,
read back a generated PDF and rendered Markdown. The 84-wheel retrieval environment stored two vectors
in a local Chroma collection and returned the expected nearest neighbor.
The document environment holds lxml at 6.1.3 because 6.2.0 strips the
WordprocessingML namespace before DOCX conversion. [Hold and switch criteria](../packages/lxml/README.md)

Both environments resolve ONNX Runtime 1.32.0. Retry CPython 3.15 after a
Windows x86-64 ONNX Runtime wheel for its ABI becomes available, then rerun the
frozen installs and these probes. [ONNX Runtime release files](https://pypi.org/project/onnxruntime/1.32.0/#files)

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
| Xberg 1.5.4 on Windows | The published Windows x64 ZIP matched SHA-256 `916d7178eaad177da6da8895331763beababff986b86eaf66ff1312aba5c5131`. Its executable (SHA-256 `a74db7e32c9872f3679986254a2de56490738ceff07fa16c3482538b77e0ea8b`) reported 1.5.4 and extracted the expected text from a one-page PDF. [Release](https://github.com/xberg-io/xberg/releases/tag/v1.5.4) |
| Marker 2.2.1 | Marker now requires Indra OCR 1.2.0 or newer. The 68 Windows wheels installed on CPython 3.14.10, including the separately selected Surya OCR 0.24.0 and Pillow 13.0.0. `pip check` and the `--help` commands for `marker`, `marker_single` and `surya_ocr` passed. Indra requires ONNX Runtime, which lacks a CPython 3.15 Windows wheel. Retry on publication of a compatible wheel, then verify the CLI, helper lifetime and an offline conversion. [Marker](https://pypi.org/project/marker-pdf/2.2.1/) · [Surya](https://pypi.org/project/surya-ocr/0.24.0/) |
| MinerU 4.2.3 | The Windows graph resolved for CPython 3.14.10 using the published Jieba 0.42.1 source archive and wheels for the other packages. Retry 3.15 when DocVortex can select a compatible ONNX Runtime DirectML wheel. Retire the Jieba source exception once a compatible wheel is published and a Windows wheel-only solve, `pip check` and parse pass. [MinerU](https://pypi.org/project/mineru/4.2.3/) · [Jieba](https://pypi.org/project/jieba/0.42.1/#files) |
| Docling Slim 2.154.0 | The standard extra resolved as Windows x86-64 wheels for CPython 3.14.10. For CPython 3.15.2, Docling Core 2.108.0 requires tree-sitter >=0.25 and <0.27, which lacks a compatible Windows wheel. Retry when that range supplies a wheel or Docling accepts a release that does, then verify the CLI and an offline OCR conversion. [Release](https://pypi.org/project/docling-slim/2.154.0/) |
| OpenDataLoader PDF 2.5.24 | The universal wheel installed on Windows x86-64 with CPython 3.15.2 and passed `pip check`. A generated PDF converted to Markdown with the expected text using Temurin 27.0.1.0.2+1. [Release](https://pypi.org/project/opendataloader-pdf/2.5.24/) |
| OmniVoice 0.2.1 | Check out source commit `08be0b4ccbac3e13e374e86fbfead4b4cac343e2` and install it in a dedicated Python 3.10+ environment following its pinned instructions. Select a compatible device-specific PyTorch/Torchaudio build (2.4 or newer) and Transformers (5.3 or newer). Record physical FFmpeg and FFprobe paths. The optional model snapshot is `3fc979d1cd72492cd679c5ac2611e0d7ac047ba1`. Verify code and models independently before a local smoke test. [Pinned source](https://github.com/k2-fsa/OmniVoice/tree/08be0b4ccbac3e13e374e86fbfead4b4cac343e2) · [Model snapshot](https://huggingface.co/k2-fsa/OmniVoice/tree/3fc979d1cd72492cd679c5ac2611e0d7ac047ba1) |

Windows Xberg 1.4.0 previously supplied a verified CLI when releases 1.4.1
and 1.4.2 omitted it. Its ZIP SHA-256 was
`83fa70ac76a11d666b585481776697576529bc1545857a910223aead927436f1` and
its executable SHA-256 was `a043c529a0c5a3f27b402748e0c491636e8dee20d4d2c12e7dd93c26add97cb2`. [1.4.0 release](https://github.com/xberg-io/xberg/releases/tag/v1.4.0)

The previous Windows Xberg 1.3.3 executable had SHA-256 `8206bb3117633639c23bc949cf45340233b469db3bafd0420807cd15503c0d0d`. [Earlier release](https://github.com/xberg-io/xberg/releases/tag/v1.3.3)

Marker 2.2.0 previously selected Surya 0.23.0 and Pillow 10.4.0, limiting its
Windows wheel set to CPython 3.13.18. Marker 2.2.1 removed the Surya version
constraint, and the 3.14.10 install passed the CLI checks above.
[Earlier Marker release](https://pypi.org/project/marker-pdf/2.2.0/)

The historical Windows Marker 2.0.0 and Surya 0.22.1 baseline selected Vulkan
llama.cpp helper b11146, archive SHA-256
`55a378aa095b466979d85075234f66d7655c7a7483222af0c006c0e55b4d7bd6`.
[Historical helper](https://github.com/ggml-org/llama.cpp/releases/tag/b11146)

The current Windows Vulkan helper is llama.cpp b12830. Its release ZIP matched
SHA-256 `933d0c91c7882bb5e3c407b486c1ec974ae893d4e6b67fd4e51d441ccd97d526`.
The `llama-server.exe` SHA-256 was
`2d019b636885727b9142c52b5e901e7b724f194ba0f539e589cd2a8cba65a62c`.
It reported build 12830, served a healthy loopback response using an empty
model directory, and terminated. Model-backed conversion and helper lifetime
under Surya remain unverified. MinerU and Docling likewise await their model
and accelerator checks. [Windows helper release](https://github.com/ggml-org/llama.cpp/releases/tag/b12830)
