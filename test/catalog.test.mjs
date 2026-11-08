import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import { verifyCatalog } from "../app/check.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratchRoot = join(root, ".cache", "catalog-tests");
const json = async (directory, name) => JSON.parse(await readFile(join(directory, name), "utf8"));
const save = async (directory, name, value) => writeFile(join(directory, name), JSON.stringify(value, null, 2) + "\n", "utf8");
async function fixture(action) {
  await mkdir(scratchRoot, { recursive: true });
  const directory = await mkdtemp(join(scratchRoot, "case-"));
  try {
    for (const name of ["registry.json","migration.json","packages","licenses","patches","skills"]) {
      await cp(join(root,name), join(directory,name), { recursive:true, errorOnExist:true, force:false });
    }
    return await action(directory);
  } finally {
    const target = resolve(directory);
    assert.ok(target.startsWith(resolve(scratchRoot) + (process.platform === "win32" ? "\\" : "/")));
    await rm(target, { recursive:true });
  }
}
test("published catalog validates local provenance, exact artifacts, series and skill frontmatter", async () => {
  const result = await verifyCatalog(root);
  assert.equal(result.ok,true);
  assert.equal(result.fixes,8);
  assert.equal(result.packageSeries,4);
  assert.equal(result.artifacts,66);
});
test("rejects corrupt imported bytes", () => fixture(async (directory) => {
  await writeFile(join(directory,"patches/tinypool@2.2.0.patch"),"corrupt\n");
  await assert.rejects(verifyCatalog(directory), /byte identity/);
}));
test("rejects missing retained notices", () => fixture(async (directory) => {
  await rm(join(directory,"licenses/tinypool/LICENSE"));
  await assert.rejects(verifyCatalog(directory), /Missing or case-mismatched/);
}));
test("rejects traversal before reading an artifact", () => fixture(async (directory) => {
  const value = await json(directory,"migration.json");
  value.artifacts[0].path = "../outside";
  await save(directory,"migration.json",value);
  await assert.rejects(verifyCatalog(directory), /Unsafe relative path/);
}));
test("rejects unknown fields and unsupported versions", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.skipIntegrity = true;
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Unknown field/);
  delete value.skipIntegrity;
  value.format = "shared-patch-registry-v2";
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Unsupported catalog schema/);
}));
test("rejects malformed external JSON and UTF8", () => fixture(async (directory) => {
  await writeFile(join(directory,"registry.json"),'{"format":');
  await assert.rejects(verifyCatalog(directory), SyntaxError);
  await writeFile(join(directory,"registry.json"),Buffer.from([0xc3,0x28]));
  await assert.rejects(verifyCatalog(directory), /encoded|encoding|UTF|valid/i);
}));
test("rejects duplicate fix identities", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.fixes.push(value.fixes[0]);
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Duplicate fix/);
}));
test("rejects missing prerequisites and dependency cycles", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.fixes[0].requires = ["unknown-fix"];
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Unknown prerequisite/);
  value.fixes[0].requires = [value.fixes[0].id];
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Cyclic prerequisites/);
}));
test("rejects a stale bundle even when its per-file manifest is internally consistent", () => fixture(async (directory) => {
  const value = await json(directory,"migration.json");
  const file = value.artifacts.find((item) => item.path === "patches/tinypool@2.2.0.patch");
  assert.ok(file);
  const content = Buffer.concat([await readFile(join(directory,file.path)),Buffer.from("\n")]);
  await writeFile(join(directory,file.path),content);
  const hash = createHash("sha256").update(content).digest("hex");
  Object.assign(file,{bytes:content.length,sha256:hash,originalSha256:hash,lfSha256:hash});
  file.origin.gitBlob = createHash("sha1").update("blob " + content.length + "\0").update(content).digest("hex");
  await save(directory,"migration.json",value);
  await assert.rejects(verifyCatalog(directory), /Stale concatenated package bundle/);
}));
test("rejects wrong package series coverage", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.packageSeries[0].selector = "portless@99.0.0";
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /package\/version mismatch/);
}));
test("rejects orphan imported files and CRLF maintained files", () => fixture(async (directory) => {
  await writeFile(join(directory,"patches/orphan.patch"),"unregistered\n");
  await assert.rejects(verifyCatalog(directory), /Unregistered imported file/);
  await rm(join(directory,"patches/orphan.patch"));
  await writeFile(join(directory,"README.md"),"invalid\r\n");
  await assert.rejects(verifyCatalog(directory), /UTF8 LF/);
}));
test("rejects junctions or symlinks before following imported trees", () => fixture(async (directory) => {
  const source = join(directory,"packages");
  const target = join(directory,"retained-packages");
  await rename(source,target);
  await symlink(target,source,process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(verifyCatalog(directory), /Linked catalog entry/);
}));
test("rejects excessive nesting with bounded traversal", () => fixture(async (directory) => {
  await mkdir(join(directory,...Array.from({length:22},(_,index) => "level-" + index)),{recursive:true});
  await assert.rejects(verifyCatalog(directory), /Directory depth exceeded/);
}));

test("rejects an active package fix without an installable series", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.packageSeries.pop();
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Uncovered package-patch fix/);
}));
test("rejects artifact provenance outside the observed source set", () => fixture(async (directory) => {
  const value = await json(directory,"migration.json");
  value.artifacts[0].origin.revision = "0".repeat(40);
  await save(directory,"migration.json",value);
  await assert.rejects(verifyCatalog(directory), /Unobserved artifact origin/);
}));

test("rejects an additional discoverable skill outside the maintained allowlist", () => fixture(async (directory) => {
  await mkdir(join(directory,"skills/extra"),{recursive:true});
  await writeFile(join(directory,"skills/extra/SKILL.md"),"---\nname: extra\ndescription: Unexpected source.\n---\n");
  await assert.rejects(verifyCatalog(directory), /Unexpected discoverable skill/);
}));

test("retained Portless versions cannot cross-wire their immutable atomic parts", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  const retained = value.packageSeries.find((item) => item.selector === "portless@0.15.12");
  const current = value.packageSeries.find((item) => item.selector === "portless@0.16.0");
  assert.ok(retained && current);
  assert.equal(retained.parts[0].id,current.parts[0].id);
  retained.parts[0].path = current.parts[0].path;
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /artifact path differs from selector/);
}));

test("retained Portless selection rejects a complete newer-version bundle substitution", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  const retained = value.packageSeries.find((item) => item.selector === "portless@0.15.12");
  const current = value.packageSeries.find((item) => item.selector === "portless@0.16.0");
  assert.ok(retained && current);
  retained.bundle = current.bundle;
  retained.parts = current.parts.map((part) => ({ ...part }));
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /artifact path differs from selector/);
}));

test("rejects pending source snapshots rather than accepting prepared evidence", () => fixture(async (directory) => {
  const value = await json(directory,"migration.json");
  value.artifacts[0].origin.revision = "PENDING_PATCHES_ARTIFACT_SNAPSHOT_SHA";
  await save(directory,"migration.json",value);
  await assert.rejects(verifyCatalog(directory), /Invalid hash/);
}));

test("rejects a declared artifact source outside upstream, fork and catalog owners", () => fixture(async (directory) => {
  const catalog = await json(directory,"registry.json");
  const value = await json(directory,"migration.json");
  const foreign = "https://github.com/example/application";
  catalog.observation.sources.push({repository:foreign,revision:"1".repeat(40)});
  value.artifacts[0].origin.repository = foreign;
  value.artifacts[0].origin.revision = "1".repeat(40);
  await save(directory,"registry.json",catalog);
  await save(directory,"migration.json",value);
  await assert.rejects(verifyCatalog(directory), /not a declared upstream/);
}));

test("rejects duplicate and missing package ownership of a fix", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.groups[1].fixes.push(value.groups[0].fixes[0]);
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /multiple package groups/);
  value.groups[1].fixes.pop();
  value.groups[0].fixes.pop();
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /cover exact active fixes/);
}));

test("rejects a package record borrowed from another owner", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.groups[0].history = value.groups[1].history;
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /path differs from owner/);
}));

test("rejects consumer aliases in the upstream-owned catalog", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  value.aliases.push({repository:"https://github.com/example/sample-app",previousId:"legacy-fix",id:value.fixes[0].id});
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Consumer aliases belong in consuming repositories/);
}));
