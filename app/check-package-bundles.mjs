import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, open, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyCatalog } from "./check.mjs";

const project = fileURLToPath(new URL("../", import.meta.url));
const labNames = ["host-runtime-npm", "web-native-npm", "mobile-studio-npm"];
const maxFile = 64 * 1024 * 1024;
const maxInput = 128 * 1024 * 1024;
const maxManifest = 1024 * 1024;
const maxBundle = 4 * 1024 * 1024;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

class CheckFailure extends Error {}
function requireCheck(ok, message) {
  if (!ok) throw new CheckFailure(message);
}
function displayFailure(error) {
  if (error instanceof CheckFailure) return error.message;
  if (error?.code === "ENOENT") return "Source directory or required package file missing";
  if (error?.code === "EPERM" || error?.code === "EACCES") return "Access to package source denied";
  if (error instanceof SyntaxError) return "Package manifest is malformed";
  return "Input or filesystem operation failed";
}
function within(root, target) {
  const part = relative(root, target);
  return part.length > 0 && !isAbsolute(part) && part !== ".." && !part.startsWith(".." + sep);
}
async function physicalFile(root, name, limit) {
  const file = resolve(root, name);
  requireCheck(within(root, file), "File outside selected source");
  const actual = await realpath(file);
  requireCheck(relative(file, actual) === "", "Linked source file or ancestor");
  const handle = await open(file, "r");
  try {
    const stat = await handle.stat();
    requireCheck(stat.isFile() && stat.size <= limit, "File size or type outside supported bounds");
    const buffer = Buffer.alloc(stat.size);
    let used = 0;
    while (used < buffer.length) {
      const part = await handle.read(buffer, used, buffer.length - used, used);
      requireCheck(part.bytesRead > 0, "Source file truncated");
      used += part.bytesRead;
    }
    const after = await handle.stat();
    const atPath = await lstat(file);
    requireCheck(after.size === stat.size && after.mtimeMs === stat.mtimeMs &&
      after.ctimeMs === stat.ctimeMs && atPath.ino === stat.ino && atPath.dev === stat.dev &&
      relative(actual, await realpath(file)) === "", "Source file changed during read");
    return buffer;
  } finally { await handle.close(); }
}
async function identity(root) {
  const raw = await physicalFile(root, "package.json", maxManifest);
  const pkg = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw));
  requireCheck(typeof pkg?.name === "string" && typeof pkg?.version === "string", "Invalid package identity");
  return pkg.name + "@" + pkg.version;
}
function patchFiles(bytes) {
  const lines = new TextDecoder("utf-8", { fatal: true }).decode(bytes).split("\n");
  const paths = [];
  for (const [i, line] of lines.entries()) {
    if (!line.startsWith("diff --git ")) continue;
    const match = /^diff --git a\/([A-Za-z0-9._@/+\-]+) b\/\1$/.exec(line);
    requireCheck(match, "Unsupported path, rename or binary diff");
    const path = match[1];
    requireCheck(path.split("/").every((part) => part && !part.startsWith(".") &&
      !part.endsWith(".") && !/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(part)),
      "Unsafe package diff path");
    let header = i + 1;
    if (lines[header]?.startsWith("index ")) header++;
    requireCheck(lines[header] === "--- a/" + path && lines[header + 1] === "+++ b/" + path,
      "Only in-place text patch files are supported");
    requireCheck(!paths.some((old) => old.toLowerCase() === path.toLowerCase()), "Duplicate patch path");
    paths.push(path);
  }
  requireCheck(paths.length > 0 && paths.length <= 64, "Unexpected number of patch targets");
  return paths;
}
function apply(cwd, patch, options) {
  const env = {
    PATH: process.env.PATH ?? "",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
    GIT_CEILING_DIRECTORIES: dirname(cwd),
    GIT_TERMINAL_PROMPT: "0",
    LC_ALL: "C",
  };
  if (process.env.SystemRoot) env.SystemRoot = process.env.SystemRoot;
  const result = spawnSync("git", ["apply", "--whitespace=nowarn", ...options, "-"], {
    cwd, env, input: patch, maxBuffer: 64 * 1024, timeout: 15000, windowsHide: true,
  });
  requireCheck(!result.error && result.status !== null, "Git unavailable, interrupted or exceeded bounds");
  return result.status === 0;
}

// Git may apply at an offset. Confirm each registered file changes and a reverse
// application restores its exact bytes. All writes are to a fresh scratch copy.
export async function inspectBundle(source, selector, patch) {
  requireCheck(Buffer.isBuffer(patch) && patch.length > 0 && patch.length <= maxBundle, "Invalid bundle size");
  const root = await realpath(source);
  requireCheck(await identity(root) === selector, "Package name or version differs from selector");
  const paths = patchFiles(patch);
  const parent = await realpath(tmpdir());
  const scratch = await mkdtemp(join(parent, "patch-bundle-"));
  const original = new Map();
  try {
    let size = 0;
    for (const name of paths) {
      const bytes = await physicalFile(root, name, Math.min(maxFile, maxInput - size));
      size += bytes.length;
      original.set(name, digest(bytes));
      await mkdir(dirname(join(scratch, name)), { recursive: true });
      await writeFile(join(scratch, name), bytes, { flag: "wx" });
    }
    const forward = apply(scratch, patch, ["--check"]);
    const reverse = apply(scratch, patch, ["--reverse", "--check"]);
    if (forward === reverse) return forward ? "ambiguous" : "incompatible";
    if (!forward) return "already-applied";
    requireCheck(apply(scratch, patch, []), "Forward application failed");
    for (const name of paths) {
      requireCheck(digest(await physicalFile(scratch, name, maxFile + maxBundle)) !== original.get(name),
        "A registered target did not change");
    }
    requireCheck(apply(scratch, patch, ["--reverse"]), "Reverse application failed");
    for (const name of paths) {
      requireCheck(digest(await physicalFile(scratch, name, maxFile)) === original.get(name),
        "Reverse application did not restore original bytes");
    }
    return "applies-and-restores";
  } finally {
    requireCheck(dirname(scratch) === parent && relative(scratch, await realpath(scratch)) === "",
      "Scratch ownership lost");
    await rm(scratch, { recursive: true });
  }
}
function parseSources(args, selectors) {
  requireCheck(args.length <= 96 && args.length % 3 === 0, "Use --source SELECTOR DIRECTORY");
  const sources = new Map();
  for (let i = 0; i < args.length; i += 3) {
    const [option, selector, path] = args.slice(i, i + 3);
    requireCheck(option === "--source" && selectors.has(selector) && path.length > 0 && path.length <= 4096,
      "Unknown option or selector, or invalid source directory");
    const current = sources.get(selector) ?? [];
    current.push(resolve(path));
    sources.set(selector, current);
  }
  return sources;
}
export async function findLabSources(catalog, name, selector) {
  const physical = await realpath(catalog);
  const labs = join(physical, ".cache", "dependency-labs");
  const packages = join(physical, "node_modules");
  const matches = new Set();
  for (const lab of labNames) {
    const candidate = join(labs, lab, "node_modules", name);
    try {
      await lstat(candidate);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const root = await realpath(candidate);
    requireCheck(within(labs, root) || within(packages, root),
      "Lab package resolves outside the project install; provide an explicit source");
    if (await identity(root) === selector) matches.add(root);
  }
  return [...matches];
}
async function main(args) {
  // The checked catalog owns all selectors, paths, package identities and hashes.
  await verifyCatalog(project);
  const registry = JSON.parse(await readFile(join(project, "registry.json"), "utf8"));
  const migration = JSON.parse(await readFile(join(project, "migration.json"), "utf8"));
  const sources = parseSources(args, new Set(registry.packageSeries.map((s) => s.selector)));
  const failures = [];
  const reports = [];
  for (const series of registry.packageSeries) {
    const { selector, bundle } = series;
    const report = { selector, results: [], regressions: series.parts.flatMap(({ id }) =>
      registry.fixes.find((fix) => fix.id === id).regressions) };
    reports.push(report);
    try {
      const bytes = await physicalFile(await realpath(project), bundle, maxBundle);
      const record = migration.artifacts.find((f) => f.path === bundle);
      requireCheck(record && digest(bytes) === record.sha256, "Bundle digest mismatch");
      const inputs = sources.get(selector) ?? await findLabSources(project, selector.slice(0, selector.lastIndexOf("@")), selector);
      if (!inputs.length) report.results.push({ state: "missing-source" });
      for (const [index, path] of inputs.entries()) {
        try {
          report.results.push({ source: index + 1, state: await inspectBundle(path, selector, bytes) });
        } catch (error) {
          report.results.push({ source: index + 1, state: "failed", reason: displayFailure(error) });
        }
      }
    } catch (error) {
      report.results.push({ state: "failed", reason: displayFailure(error) });
    }
    if (report.results.some((r) => r.state !== "applies-and-restores")) failures.push(selector);
  }
  process.stdout.write(JSON.stringify({ complete: !failures.length, packageSeries: reports, failures }, null, 2) + "\n");
  process.exitCode = failures.length ? 1 : 0;
}
if (import.meta.main) {
  if (process.argv.length === 3 && process.argv[2] === "--help")
    process.stdout.write("Check every canonical package bundle against local published package files. Repeat --source SELECTOR DIRECTORY for explicit inputs. Default: installed dependency labs. No network.\n");
  else await main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(displayFailure(error) + "\n");
    process.exitCode = 1;
  });
}
