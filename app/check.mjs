import { createHash } from "node:crypto";
import { lstat, open, opendir, realpath } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const owner = "https://github.com/iki/patches";
const importedRoots = ["packages", "licenses", "patches"];
const bounds = { files: 4096, fileBytes: 4 * 1024 * 1024, totalBytes: 64 * 1024 * 1024, depth: 20 };
export function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
function object(value, required, optional = []) {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value), "Expected object");
  ensure(required.every((key) => Object.hasOwn(value, key)), "Missing required field");
  ensure(Object.keys(value).every((key) => [...required, ...optional].includes(key)), "Unknown field");
  return value;
}
function text(value, pattern) {
  ensure(typeof value === "string" && value.length > 0 && value.length <= 8192 && !value.includes("\0"), "Invalid text");
  if (pattern) ensure(pattern.test(value), "Invalid text format");
  return value;
}
function array(value, nonempty = false) {
  ensure(Array.isArray(value) && value.length <= 512 && (!nonempty || value.length > 0), "Invalid array");
  return value;
}
function unique(values, label) {
  ensure(new Set(values).size === values.length, "Duplicate " + label);
}
function path(value) {
  text(value, /^[a-zA-Z0-9@._/-]+$/u);
  ensure(!value.startsWith("/") && value.split("/").every((part) => part && part !== "." && part !== ".."), "Unsafe relative path");
  return value;
}
function hash(value, length = 64) {
  text(value);
  ensure(new RegExp("^[a-f0-9]{" + length + "}$", "u").test(value), "Invalid hash");
  return value;
}
function repository(value) {
  return text(value, /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/u);
}
function url(value) {
  text(value);
  const parsed = new URL(value);
  ensure(parsed.protocol === "https:" && parsed.hostname === "github.com" && !parsed.username && !parsed.password && !parsed.search && !parsed.port, "Invalid evidence URL");
}
function version(value) {
  return text(value, /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/u);
}
function packages(value) {
  const items = array(value, true);
  unique(items.map((item) => {
    object(item, ["name", "versions"]);
    text(item.name, /^(?:@[a-zA-Z0-9._-]+\/)?[a-zA-Z0-9._-]+$/u);
    unique(array(item.versions, true).map(version), "package version");
    return item.name;
  }), "package");
}
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const blob = (bytes) => createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
const physical = (value) => process.platform === "win32" ? value.toLowerCase() : value;

export async function verifyCatalog(directory) {
  const root = resolve(directory);
  ensure(physical(await realpath(root)) === physical(root), "Linked catalog root");
  const inventory = new Map();
  let total = 0;
  let entriesSeen = 0;
  async function walk(relative = "", depth = 0) {
    ensure(depth <= bounds.depth, "Directory depth exceeded");
    const entries = await opendir(join(root, relative));
    for await (const entry of entries) {
      ensure(++entriesSeen <= bounds.files * 2, "Directory inventory bound exceeded");
      if (!relative && [".git", ".cache", "node_modules"].includes(entry.name)) continue;
      const name = relative ? relative + "/" + entry.name : entry.name;
      path(name);
      ensure(!entry.isSymbolicLink(), "Linked catalog entry");
      if (entry.isDirectory()) await walk(name, depth + 1);
      else {
        ensure(entry.isFile(), "Special catalog entry");
        ensure(inventory.size < bounds.files && !inventory.has(name.toLowerCase()), "Inventory bound or path collision");
        inventory.set(name.toLowerCase(), name);
      }
    }
  }
  await walk();
  async function read(relative) {
    path(relative);
    ensure(inventory.get(relative.toLowerCase()) === relative, "Missing or case-mismatched file: " + relative);
    const target = join(root, relative);
    ensure(physical(await realpath(target)) === physical(target), "Linked artifact ancestry");
    const before = await lstat(target);
    ensure(before.isFile() && !before.isSymbolicLink() && before.size <= bounds.fileBytes, "Invalid artifact file");
    const handle = await open(target, "r");
    try {
      const opened = await handle.stat();
      ensure(opened.dev === before.dev && opened.ino === before.ino && opened.size === before.size, "File replaced before read");
      const chunks = [];
      let size = 0;
      while (true) {
        const buffer = Buffer.alloc(64 * 1024);
        const result = await handle.read(buffer, 0, buffer.length, null);
        if (result.bytesRead === 0) break;
        size += result.bytesRead;
        ensure(size <= bounds.fileBytes, "Growing file exceeds bound");
        chunks.push(buffer.subarray(0, result.bytesRead));
      }
      const after = await handle.stat();
      const current = await lstat(target);
      ensure(physical(await realpath(target)) === physical(target), "Changed artifact ancestry");
      ensure(after.size === before.size && size === before.size && after.mtimeMs === before.mtimeMs && after.ctimeMs === before.ctimeMs && current.dev === before.dev && current.ino === before.ino && !current.isSymbolicLink(), "File changed during read");
      total += size;
      ensure(total <= bounds.totalBytes, "Catalog byte bound exceeded");
      const bytes = Buffer.concat(chunks);
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      ensure(!bytes.includes(13) && !bytes.includes(0) && !bytes.subarray(0, 3).equals(Buffer.from([239,187,191])), "Maintained text must be UTF8 LF without BOM/NUL");
      return { bytes, decoded };
    } finally { await handle.close(); }
  }
  const registryText = await read("registry.json");
  const migrationText = await read("migration.json");
  ensure(registryText.bytes.length <= 1024 * 1024 && migrationText.bytes.length <= 1024 * 1024, "Manifest bound exceeded");
  const registry = JSON.parse(registryText.decoded);
  const migration = JSON.parse(migrationText.decoded);
  object(registry, ["format","repository","migration","observation","fixes","aliases","packageSeries","releaseHolds","history","consumerSelection","groups"]);
  object(migration, ["format","repository","recordedDate","authorization","sourceTransferSha256","verification","normalization","maintainedPaths","artifacts"]);
  ensure(registry.format === "shared-patch-registry-v1" && migration.format === "patch-migration-v1", "Unsupported catalog schema");
  ensure(registry.repository === owner && migration.repository === owner && registry.migration === "migration.json", "Canonical owner mismatch");
  text(migration.recordedDate, /^\d{4}-\d{2}-\d{2}$/u);
  for (const field of ["authorization","verification","normalization"]) text(migration[field]);
  hash(migration.sourceTransferSha256);
  const maintained = array(migration.maintainedPaths).map(path);
  ensure(JSON.stringify([...maintained].sort()) === JSON.stringify(["skills/dependency-patches/SKILL.md","skills/patch-maintenance/SKILL.md"]), "Unexpected maintained skill paths");
  object(registry.observation, ["recordedDate","basis","sources"]);
  text(registry.observation.recordedDate, /^\d{4}-\d{2}-\d{2}$/u);
  text(registry.observation.basis);
  const observedSources = new Set();
  for (const source of array(registry.observation.sources, true)) {
    object(source, ["repository","revision"]); repository(source.repository); hash(source.revision,40);
    const identity = source.repository + "#" + source.revision;
    ensure(!observedSources.has(identity), "Duplicate observed source");
    observedSources.add(identity);
  }
  const groups = array(registry.groups, true);
  const allowedSources = new Set([owner]);
  const groupedFixes = new Set();
  unique(groups.map((group) => {
    object(group, ["id","title","relatedPackages","upstreamRepositories","fixes","record","history"]);
    text(group.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u); text(group.title);
    unique(array(group.relatedPackages,true).map((name) => text(name)), "related package");
    unique(array(group.upstreamRepositories,true).map(repository), "upstream repository");
    for (const upstream of group.upstreamRepositories) allowedSources.add(upstream);
    for (const id of array(group.fixes)) {
      text(id); ensure(!groupedFixes.has(id), "Fix belongs to multiple package groups");
      groupedFixes.add(id);
    }
    ensure(group.record === `packages/${group.id}/README.md` && group.history === `packages/${group.id}/HISTORY.md`, "Package record path differs from owner");
    return group.id;
  }), "package group");
  for (const fix of array(registry.fixes,true)) {
    object(fix.fork, ["repository","branch","base","head"]);
    allowedSources.add(repository(fix.fork.repository));
  }
  for (const source of registry.observation.sources)
    ensure(allowedSources.has(source.repository), "Source is not a declared upstream, fork or catalog owner");
  object(registry.consumerSelection, ["sourceRepository","sourceRevision","selectedFixes"]);
  ensure(registry.consumerSelection.sourceRepository === owner, "Consumer owner mismatch");
  text(registry.consumerSelection.sourceRevision); text(registry.consumerSelection.selectedFixes);
  const artifacts = new Map();
  for (const item of array(migration.artifacts, true)) {
    object(item, ["path","bytes","sha256","originalSha256","lfSha256","gitMode","lineEndings","origin","notices","licenseStatus"]);
    path(item.path);
    ensure(importedRoots.includes(item.path.split("/")[0]) && !artifacts.has(item.path.toLowerCase()), "Duplicate or non-imported artifact");
    ensure(Number.isSafeInteger(item.bytes) && item.bytes >= 0 && item.bytes <= bounds.fileBytes, "Invalid artifact length");
    hash(item.sha256); hash(item.originalSha256); hash(item.lfSha256);
    ensure(item.sha256 === item.originalSha256 && item.sha256 === item.lfSha256 && item.gitMode === "100644" && item.lineEndings === "lf", "Original representation mismatch");
    object(item.origin, ["repository","revision","path","gitBlob"]);
    repository(item.origin.repository); hash(item.origin.revision,40); path(item.origin.path); hash(item.origin.gitBlob,40);
    ensure(observedSources.has(item.origin.repository + "#" + item.origin.revision), "Unobserved artifact origin");
    unique(array(item.notices).map(path), "notice");
    ensure(["retained-notices","no-source-project-license-found"].includes(item.licenseStatus), "Unknown license status");
    ensure((item.licenseStatus === "retained-notices") === (item.notices.length > 0), "Notice status mismatch");
    const actual = await read(item.path);
    ensure(actual.bytes.length === item.bytes && sha256(actual.bytes) === item.sha256 && blob(actual.bytes) === item.origin.gitBlob, "Artifact byte identity mismatch: " + item.path);
    artifacts.set(item.path.toLowerCase(), { ...item, content: actual.bytes });
  }
  const reference = (value, anchor = false) => {
    text(value);
    const parts = anchor ? value.split("#") : [value];
    ensure(parts.length <= 2 && (parts.length === 1 || /^[a-z0-9-]+$/u.test(parts[1])), "Invalid source anchor");
    path(parts[0]);
    const item = artifacts.get(parts[0].toLowerCase());
    ensure(item?.path === parts[0], "Unregistered artifact reference: " + parts[0]);
    return item;
  };
  for (const item of artifacts.values()) for (const notice of item.notices) reference(notice);
  const fixes = new Map();
  for (const fix of array(registry.fixes, true)) {
    object(fix, ["id","kind","packages","runtime","requires","files","upstream","fork","record","regressions","removal","limitations"]);
    text(fix.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    ensure(!fixes.has(fix.id), "Duplicate fix ID");
    ensure(["package-patch","host-adapter","declaration-adapter"].includes(fix.kind), "Invalid fix kind");
    packages(fix.packages);
    object(fix.runtime, ["bun"]); unique(array(fix.runtime.bun,true).map(version), "runtime version");
    unique(array(fix.requires).map((id) => text(id)), "prerequisite");
    unique(array(fix.files,true).map((name) => reference(name).path), "fix artifact");
    for (const item of array(fix.regressions,true)) reference(item);
    reference(fix.record,true); text(fix.removal); text(fix.limitations);
    object(fix.upstream, ["repository","disposition","url"], ["reviewedHead"]);
    repository(fix.upstream.repository); text(fix.upstream.disposition); url(fix.upstream.url);
    if (fix.upstream.reviewedHead !== undefined) hash(fix.upstream.reviewedHead,40);
    object(fix.fork, ["repository","branch","base","head"]);
    repository(fix.fork.repository); text(fix.fork.branch); hash(fix.fork.base,40); hash(fix.fork.head,40);
    fixes.set(fix.id,fix);
  }
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    ensure(fixes.has(id), "Unknown prerequisite");
    ensure(!visiting.has(id), "Cyclic prerequisites");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of fixes.get(id).requires) visit(next);
    visiting.delete(id); visited.add(id);
  }
  for (const id of fixes.keys()) visit(id);
  ensure(groupedFixes.size === fixes.size && [...groupedFixes].every((id) => fixes.has(id)), "Package groups do not cover exact active fixes");
  for (const group of groups) {
    reference(group.record); reference(group.history);
    for (const id of group.fixes)
      ensure(fixes.get(id).record === group.record + "#" + id && group.upstreamRepositories.includes(fixes.get(id).upstream.repository), "Fix record or upstream differs from package owner");
  }
  const groupIds = new Set(groups.map((group) => group.id));
  for (const artifact of artifacts.values())
    if (artifact.path.startsWith("packages/"))
      ensure(groupIds.has(artifact.path.split("/")[1]), "Artifact has no declared package owner");
  const aliases = array(registry.aliases);
  ensure(aliases.length === 0, "Consumer aliases belong in consuming repositories");
  const series = array(registry.packageSeries);
  const coveredFixes = new Set();
  unique(series.map((item) => {
    object(item, ["selector","bundle","parts"]); text(item.selector);
    const bundle = reference(item.bundle).content;
    const parts = array(item.parts,true);
    unique(parts.map((part) => {
      object(part, ["id","path"]);
      const fix = fixes.get(text(part.id));
      ensure(fix?.kind === "package-patch" && fix.files.includes(part.path) && fix.files.includes(item.bundle), "Series artifact/fix mismatch");
      ensure(fix.packages.some((entry) => entry.versions.some((pin) => entry.name + "@" + pin === item.selector)), "Series package/version mismatch");
      reference(part.path);
      coveredFixes.add(part.id);
      return part.path;
    }), "series part");
    const separator = item.selector.lastIndexOf("@");
    const packageName = item.selector.slice(0, separator);
    const pin = item.selector.slice(separator + 1);
    ensure(
      item.bundle === `patches/${item.selector}.patch` &&
      parts.every((part) => part.path.startsWith(`patches/${packageName}/${pin}/`)),
      "Package series artifact path differs from selector",
    );
    ensure(bundle.equals(Buffer.concat(parts.map((part) => reference(part.path).content))), "Stale concatenated package bundle");
    return item.selector;
  }), "package selector");
  for (const fix of fixes.values()) ensure(fix.kind !== "package-patch" || coveredFixes.has(fix.id), "Uncovered package-patch fix");
  for (const hold of array(registry.releaseHolds)) {
    object(hold, ["id","kind","packages","affectedRelease","fixedReleaseRecorded","record","removal","upstream"]);
    text(hold.id); ensure(hold.kind === "unmodified-release-hold" && !fixes.has(hold.id), "Invalid release hold");
    packages(hold.packages); version(hold.affectedRelease); version(hold.fixedReleaseRecorded);
    reference(hold.record,true); text(hold.removal); url(hold.upstream);
  }
  unique(registry.releaseHolds.map((hold) => hold.id),"release hold");
  for (const record of array(registry.history)) {
    object(record, ["record"], ["summary","id","artifacts","resolvedIn"]);
    reference(record.record,true);
    if (record.summary !== undefined) text(record.summary);
    if (record.id !== undefined) { text(record.id); ensure(!fixes.has(record.id), "History is still active"); }
    if (record.resolvedIn !== undefined) version(record.resolvedIn);
    if (record.artifacts !== undefined) for (const item of array(record.artifacts,true)) reference(item);
  }
  for (const name of inventory.values()) {
    ensure(name.split("/").at(-1)?.toLowerCase() !== "skill.md" || maintained.includes(name), "Unexpected discoverable skill");
    if (importedRoots.includes(name.split("/")[0])) {
      ensure(artifacts.get(name.toLowerCase())?.path === name, "Unregistered imported file: " + name);
      ensure(!name.endsWith("/SKILL.md"), "Historical skill must not be discoverable");
    } else if (!["registry.json","migration.json"].includes(name)) await read(name);
  }
  for (const name of maintained) {
    const skill = (await read(name)).decoded;
    ensure(skill.startsWith("---\nname: " + name.split("/")[1] + "\ndescription: ") && skill.includes("\n---\n"), "Invalid maintained skill frontmatter");
  }
  return { ok:true, artifacts:artifacts.size, fixes:fixes.size, packageSeries:series.length, importedBytes:[...artifacts.values()].reduce((sum,item) => sum + item.bytes,0), runtime:Bun.version };
}
if (import.meta.main) {
  ensure(process.argv.length === 2, "No arguments supported");
  try { process.stdout.write(JSON.stringify(await verifyCatalog(fileURLToPath(new URL("../",import.meta.url)))) + "\n"); }
  catch (error) { process.stderr.write((error instanceof Error ? error.message : "Catalog check failed") + "\n"); process.exitCode=1; }
}
