import assert from "node:assert/strict";
import { test } from "bun:test";
import { checkLock } from "./install.mjs";

function example() {
  const members = {".":{}, ".cache/dependency-labs/demo-npm":{dependencies:{example:"1.2.3"}}};
  const item = {specifier:"1.2.3",version:"1.2.3"};
  const importer = {dependencies:{example:item}};
  const lock = {lockfileVersion:"9.0",importers:{".":{},".cache/dependency-labs/demo-npm":importer},
    packages:{"example@1.2.3":{}},snapshots:{"example@1.2.3":{}}};
  return {members,item,lock,importer};
}
test("every declared direct dependency references its locked package and snapshot", () => {
  const {members,lock,item} = example();
  checkLock(lock,members,{});
  item.version = "1.2.3(other@2.0.0)";
  assert.throws(() => checkLock(lock,members,{}),/Unresolved direct/);
  lock.snapshots["example@" + item.version] = {};
  checkLock(lock,members,{});
  delete lock.packages["example@1.2.3"];
  assert.throws(() => checkLock(lock,members,{}),/Unresolved direct/);
});
test("rejects missing workspace member, wrong role, or changed specifier", () => {
  const {members,lock,item,importer} = example();
  item.specifier = "^1.2.3";
  assert.throws(() => checkLock(lock,members,{}),/Unresolved direct/);
  item.specifier = "1.2.3";
  importer.devDependencies = importer.dependencies;
  assert.throws(() => checkLock(lock,members,{}),/roles or names/);
  delete lock.importers[".cache/dependency-labs/demo-npm"];
  assert.throws(() => checkLock(lock,members,{}),/exact workspace/);
});
test("patching requires matching manager digest, direct edge and snapshot", () => {
  const {members,lock,item} = example();
  const hash = "b".repeat(64);
  const patches = {"example@1.2.3":hash};
  lock.patchedDependencies = patches;
  assert.throws(() => checkLock(lock,members,patches),/Unpatched importer/);
  item.version += "(patch_hash=" + hash + ")";
  lock.snapshots["example@" + item.version] = {};
  checkLock(lock,members,patches);
  assert.throws(() => checkLock(lock,members,{}),/patch selection/);
  assert.throws(() => checkLock(lock,members,{"example@1.2.3":"c".repeat(64)}),/digest/);
});
