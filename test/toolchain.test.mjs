import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { delimiter, join } from "node:path";
import { test } from "node:test";
import { physicalExecutable, probeEnvironment, projectPins, toolEnvironment, verifyVersion } from "../app/toolchain.mjs";

test("rejects conflicting pins and automatic installations", () => {
  const config = { tools: { bun: "1.4.2", aube: "2.5.1" }, settings: { auto_install: false } };
  const manifest = { engines: { bun: "1.4.2" }, packageManager: "aube@2.5.1" };
  assert.deepEqual(projectPins(config, manifest, "1.4.2\n"), config.tools);
  assert.throws(() => projectPins(config, manifest, "1.4.0"), /Bun pins/);
  assert.throws(() => projectPins(config, { ...manifest, packageManager: "aube@latest" }, "1.4.2"), /Aube pins/);
  assert.throws(() => projectPins({ ...config, settings: {} }, manifest, "1.4.2"), /automatic Mise/);

});

test("rejects wrong or ambiguous executable versions", () => {
  verifyVersion("aube", "2.5.1", "2.5.1 windows-x64 (2026-10-01)");
  verifyVersion("aube", "2.5.1", "2.5.1 macos-arm64 (unknown)");
  for (const output of ["2.5.1", "2.5.1 windows-x64", "2.5.1 windows-x86_64 (2026-10-01)"]) {
    assert.throws(() => verifyVersion("aube", "2.5.1", output), /version check/);
  }
  verifyVersion("bun", "1.4.2", "1.4.2");
  assert.throws(() => verifyVersion("bun", "1.4.2", "1.4.3"), /version check/);
  assert.throws(() => verifyVersion("aube", "2.5.1", "2.5.1\n2.5.1"), /version check/);
});

test("validates physical executables and keeps the original PATH behind selected physical tools", async () => {
  const parent = fileURLToPath(new URL("../.cache/toolchain-tests/", import.meta.url));
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(join(parent, "case-"));
  try {
    const bin = join(root, "pinned tools");
    const shims = join(root, ".shims");
    await mkdir(bin);
    await mkdir(shims);
    const name = process.platform === "win32" ? "bun.exe" : "bun";
    const file = join(bin, name);
    await writeFile(file, "");
    assert.ok(physicalExecutable("bun", file).endsWith(name));
    assert.throws(() => physicalExecutable("bun", join(shims, name)), /physical/);
    assert.throws(() => physicalExecutable("aube", file), /invalid physical/);
    const aubeBin = join(root, "aube tools");
    await mkdir(aubeBin);
    const aube = join(aubeBin, process.platform === "win32" ? "aube.exe" : "aube");
    await writeFile(aube, "");
    const originalPath = [shims, root, bin, root].join(delimiter);
    const inherited = {
      Path: originalPath, TEST_VALUE: "kept", MISE_OFFLINE: "false", MISE_AUTO_INSTALL: "true",
      AUBE_MANAGE_PACKAGE_MANAGER_VERSIONS: "true", npm_config_manage_package_manager_versions: "true",
    };
    const env = toolEnvironment([file, aube], inherited);
    const lookup = probeEnvironment("mise", env);
    assert.equal(lookup.MISE_OFFLINE, "true");
    assert.equal(lookup.MISE_AUTO_INSTALL, "false");
    assert.equal(lookup.AUBE_MANAGE_PACKAGE_MANAGER_VERSIONS, "true");
    const versionProbe = probeEnvironment("aube", env);
    assert.equal(versionProbe.AUBE_MANAGE_PACKAGE_MANAGER_VERSIONS, "false");
    assert.equal(versionProbe.AUBE_NO_UPDATE_CHECK, "1");
    assert.equal(Object.hasOwn(versionProbe, "npm_config_manage_package_manager_versions"), false);
    assert.equal(versionProbe.MISE_OFFLINE, "false");
    assert.deepEqual(probeEnvironment("bun", env), env);
    assert.equal(env.AUBE_MANAGE_PACKAGE_MANAGER_VERSIONS, "true");
    assert.equal(env.npm_config_manage_package_manager_versions, "true");
    assert.equal(Object.hasOwn(env, "AUBE_NO_UPDATE_CHECK"), false);
    assert.equal(env.MISE_OFFLINE, "false");
    assert.equal(env.PATH, [bin, aubeBin, originalPath].join(delimiter));
    assert.equal(env.TEST_VALUE, "kept");
    assert.equal(env.MISE_AUTO_INSTALL, "true");
    assert.equal(Object.hasOwn(env, "Path"), false);
  } finally { await rm(root, { recursive: true }); }
});
