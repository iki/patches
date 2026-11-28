import "./deprecations.test.mjs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";
import { verifyCatalog, verifyDependencyInventory } from "../app/check.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratchRoot = join(root, ".cache", "catalog-tests");
const json = async (directory, name) => JSON.parse(await readFile(join(directory, name), "utf8"));
const save = async (directory, name, value) => writeFile(join(directory, name), JSON.stringify(value, null, 2) + "\n", "utf8");
async function fixture(action) {
  await mkdir(scratchRoot, { recursive: true });
  const directory = await mkdtemp(join(scratchRoot, "case-"));
  try {
    for (const name of ["registry.json","migration.json","inventory","packages","licenses","patches","skills","environments/document-extraction-pypi/requirements.lock"]) {
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
  assert.ok(result.dependencyEntries > 0);
  assert.equal(result.fixes,8);
  assert.equal(result.packageSeries,6);
  assert.equal(result.artifacts,78);
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
test("release holds require the evidence for their own kind", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  const hold = value.releaseHolds.find((entry) => entry.kind === "publication-provenance-hold");
  hold.fixedReleaseRecorded = hold.attestedRelease;
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Unknown field/);
  delete hold.fixedReleaseRecorded;
  delete hold.attestedRelease;
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Missing required field/);
}));
test("environment holds require their exact ecosystem and an installable pin in the named profile", () => fixture(async (directory) => {
  const value = await json(directory,"registry.json");
  const hold = value.releaseHolds.find((entry) => entry.kind === "environment-release-hold");
  hold.ecosystem = "npm";
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Unsupported environment hold ecosystem/);
  hold.ecosystem = "pypi";
  hold.profile = "catalog-verifier";
  await save(directory,"registry.json",value);
  await assert.rejects(verifyCatalog(directory), /Environment hold lacks/);
}));
test("a historical observation cannot satisfy a Python hold when the current lock selects the affected release", () => fixture(async (directory) => {
  const registry = await json(directory,"registry.json");
  const hold = registry.releaseHolds.find((entry) => entry.id === "lxml-docx-namespace");
  const file = join(directory,"environments",hold.profile + "-pypi","requirements.lock");
  const original = await readFile(file,"utf8");
  const current = original.replace(/^lxml==[^\n]+$/mu,"lxml==" + hold.affectedRelease);
  assert.notEqual(current,original);
  await writeFile(file,current);
  await assert.rejects(verifyCatalog(directory), /Environment hold lxml-docx-namespace requires its supported lxml pin/);
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


function inventoryFixture() {
  return {
    format:"dependency-tool-inventory-v1", observedOn:"2026-11-20", defaultTarget:"latest",
    profiles:[{id:"sample",evidence:[{kind:"js-lock",sha256:"f".repeat(64)}]}],
    entries:[
      {ecosystem:"npm",name:"oxlint",uses:[{profile:"sample",role:"development",version:"1.90.0",platforms:["all"]},{profile:"sample",role:"patch-evidence",version:"1.90.0",platforms:["all"]}],fixIds:[],holdIds:["oxlint-immutability-1-91"]},
      {ecosystem:"npm",name:"tinypool",uses:[{profile:"sample",role:"locked",version:"2.2.0",platforms:["all"]},{profile:"sample",role:"patch-evidence",version:"2.2.0",platforms:["all"]}],fixIds:["tinypool-windows-hide-process-workers"],holdIds:[]},
    ],
    installGroups:[{id:"sample-npm",profile:"sample",ecosystem:"npm",manager:"aube",roles:["development"],platforms:["all"]}],
  };
}
const inventoryRegistry = {
  fixes:[{id:"tinypool-windows-hide-process-workers",packages:[{name:"tinypool",versions:["2.2.0"]}]}],
  releaseHolds:[{id:"oxlint-immutability-1-91",packages:[{name:"oxlint",versions:["1.90.0"]}]}],
};
test("dependency inventory validates observed resolutions and scoped installation groups", () => {
  const data = inventoryFixture();
  assert.equal(verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),2);
  data.entries[0].uses.push({...data.entries[0].uses[0],version:"1.89.0",role:"locked"});
  assert.equal(verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),2);
});
test("dependency inventory rejects duplicate JSON members, including escaped names", () => {
  const json = JSON.stringify(inventoryFixture()).replace('"format":','"fo\\u0072mat":"old","format":');
  assert.throws(() => verifyDependencyInventory(json,inventoryRegistry), /Duplicate inventory JSON field/);
});
test("dependency inventory rejects mistaken policy, evidence, versions and ownership", () => {
  const failures = [
    [(d) => {d.defaultTarget="pinned";}, /update policy/],
    [(d) => {d.profiles[0].evidence[0].sha256="abc";}, /Invalid hash/],
    [(d) => {d.observedOn="2026-02-31";}, /observation date/],
    [(d) => {d.entries[0].uses[0].version="^1.90.0";}, /version/],
    [(d) => {d.entries[0].name="../oxlint";}, /text format/],
    [(d) => {d.entries[0].uses[0].profile="missing";}, /profile or role/],
    [(d) => {d.entries[0].fixIds.push("tinypool-windows-hide-process-workers");}, /fixIds package mismatch/],
    [(d) => {d.entries[0].holdIds=[];}, /holdIds package mismatch/],
    [(d) => {d.entries[1].uses.pop();}, /canonical package version evidence/],
    [(d) => {d.entries[1].holdIds=["oxlint-immutability-1-91"];}, /holdIds package mismatch/],
    [(d) => {d.profiles[0].evidence[0].unverified=true;}, /Unknown field/],
  ];
  for (const [change,expected] of failures) {
    const data = inventoryFixture();
    change(data);
    assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),expected);
  }
});
test("dependency inventory rejects overlapping platform uses and ambiguous package identities", () => {
  const data = inventoryFixture();
  data.entries[0].uses.push({...data.entries[0].uses[0],platforms:["windows"]});
  assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),/Duplicate inventory use/);
  data.entries[0].uses.pop();
  const extra = {...data.entries[1],ecosystem:"pypi",name:"sample_tools",fixIds:[]};
  data.entries.push(extra,{...extra,name:"Sample.Tools"});
  assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),/Duplicate inventory package/);
});
test("dependency inventory ties every installation selector to observed installable roles and platforms", () => {
  const failures = [
    [(d) => {d.installGroups[0].roles=["locked"];}, /install role/],
    [(d) => {d.installGroups[0].manager="pip";}, /ownership mismatch/],
    [(d) => {d.installGroups[0].id="other-npm";}, /ownership mismatch/],
    [(d) => {d.installGroups[0].platforms=["windows"];}, /platform coverage/],
    [(d) => {d.installGroups.push(d.installGroups[0]);}, /Duplicate inventory install group/],
    [(d) => {d.installGroups=[];}, /Invalid array|Missing inventory install group/],
  ];
  for (const [change,expected] of failures) {
    const data = inventoryFixture();
    change(data);
    assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),expected);
  }
});
test("pinned upstream tools are installable while historical observations stay separate", () => {
  const data = inventoryFixture();
  const base = {profile:"sample",platforms:["linux"]};
  data.entries.push(
    {ecosystem:"github-release",name:"upstream/tool",fixIds:[],holdIds:[],uses:[{...base,role:"tool",version:"b11146"}]},
    {ecosystem:"github-source",name:"upstream/source",fixIds:[],holdIds:[],uses:[{...base,role:"reference",version:"a".repeat(40)}]},
    {ecosystem:"pypi",name:"observed-wheel",fixIds:[],holdIds:[],uses:[{...base,role:"observed",version:"1.2.0"}]},
  );
  data.installGroups.push({id:"sample-github-release",profile:"sample",ecosystem:"github-release",manager:"upstream-release",roles:["tool"],platforms:["linux"]});
  assert.equal(verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),5);
  data.entries[3].uses.push({...base,role:"runtime",version:"0.2.1"});
  data.installGroups.push({id:"sample-github-source",profile:"sample",ecosystem:"github-source",manager:"git",roles:["runtime"],platforms:["linux"]});
  assert.equal(verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),5);
  data.entries[3].uses[0].version="main";
  assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),/Invalid hash/);
  data.entries[3].uses[0].version="a".repeat(40);
  data.entries[2].name="upstream/tool/../../outside";
  assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),/text format/);
  data.entries[2].name="upstream/tool";
  data.entries[2].uses[0].version="latest";
  assert.throws(() => verifyDependencyInventory(JSON.stringify(data),inventoryRegistry),/release tag/);
});
test("catalog gate requires the dependency inventory at its canonical path", () => fixture(async (directory) => {
  await rm(join(directory,"inventory/dependencies.json"));
  await assert.rejects(verifyCatalog(directory),/Missing or case-mismatched file: inventory\/dependencies\.json/);
}));

test("checks local patch bundles on isolated package fixtures", async () => {
  await import("./check-package-bundles.mjs");
});
