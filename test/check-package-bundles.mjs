import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { findLabSources, inspectBundle } from "../app/check-package-bundles.mjs";

const patch = Buffer.from([
  "diff --git a/dist/sample.js b/dist/sample.js",
  "--- a/dist/sample.js",
  "+++ b/dist/sample.js",
  "@@ -1,3 +1,3 @@",
  " before",
  "-old",
  "+new",
  " after",
].join("\n") + "\n");
const parent = await realpath(tmpdir());
const root = await mkdtemp(join(parent, "patch-bundle-test-"));
try {
  const selector = "sample@1.2.3";
  const target = join(root, "dist", "sample.js");
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "sample", version: "1.2.3" }));
  await mkdir(join(root, "dist"));
  for (const [middle, expected] of [["old", "applies-and-restores"], ["new", "already-applied"], ["other", "incompatible"]]) {
    const original = "before\n" + middle + "\nafter\n";
    await writeFile(target, original);
    assert.equal(await inspectBundle(root, selector, patch), expected);
    assert.equal(await readFile(target, "utf8"), original);
  }
  await assert.rejects(inspectBundle(root, "sample@1.2.4", patch), /name or version/);
  const escape = Buffer.from(patch.toString().replaceAll("dist/sample.js", "../sample.js"));
  await assert.rejects(inspectBundle(root, selector, escape), /Unsafe package diff path/);
  await rm(target);
  await assert.rejects(inspectBundle(root, selector, patch), { code: "ENOENT" });
  const project = join(root, "catalog");
  const member = join(project, ".cache", "dependency-labs", "mobile-studio-npm", "node_modules");
  await mkdir(member, { recursive: true });
  assert.deepEqual(await findLabSources(project, "sample", selector), []);
  const store = join(project, "node_modules", ".aube", "sample@1.2.3", "node_modules", "sample");
  await mkdir(store, { recursive: true });
  await writeFile(join(store, "package.json"), JSON.stringify({ name: "sample", version: "1.2.3" }));
  const link = join(member, "sample");
  const linkType = process.platform === "win32" ? "junction" : "dir";
  await symlink(store, link, linkType);
  assert.deepEqual(await findLabSources(project, "sample", selector), [await realpath(store)]);
  assert.deepEqual(await findLabSources(project, "sample", "sample@1.2.4"), []);
  await rm(link);
  await symlink(root, link, linkType);
  await assert.rejects(findLabSources(project, "sample", selector), /outside the project/);
  process.stdout.write("Package bundle fixture passed\n");
} finally {
  assert.equal(dirname(root), parent);
  assert.equal(relative(root, await realpath(root)), "");
  await rm(root, { recursive: true });
}
