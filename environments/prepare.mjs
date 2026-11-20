import { randomUUID } from "node:crypto";
import { link, lstat, mkdir, open, readdir, realpath, unlink } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const members = ["host-runtime-npm", "web-native-npm", "mobile-studio-npm"];
const maxManifestBytes = 256 * 1024;

async function physicalDirectory(path, create = false) {
  if (create) {
    try {
      await mkdir(path);
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
  }
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || relative(path, await realpath(path)) !== "") {
    throw new Error("Expected a physical directory at " + path);
  }
}

async function manifest(path) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxManifestBytes ||
      relative(path, await realpath(path)) !== "") {
    throw new Error("Invalid manifest at " + path);
  }
  const file = await open(path, "r");
  try {
    const opened = await file.stat();
    if (opened.dev !== stat.dev || opened.ino !== stat.ino || opened.size !== stat.size) {
      throw new Error("Manifest changed before it could be read at " + path);
    }
    const bytes = Buffer.alloc(stat.size + 1);
    let used = 0;
    while (used < bytes.length) {
      const result = await file.read(bytes, used, bytes.length - used, used);
      if (!result.bytesRead) break;
      used += result.bytesRead;
    }
    if (used !== stat.size) throw new Error("Manifest size changed at " + path);
    return bytes.subarray(0, used);
  } finally {
    await file.close();
  }
}

async function prepareMember(cache, name) {
  const source = join(root, "environments", name);
  await physicalDirectory(source);
  const bytes = await manifest(join(source, "package.json"));
  const target = join(cache, name);
  await physicalDirectory(target, true);
  const targetManifest = join(target, "package.json");
  try {
    if (!(await manifest(targetManifest)).equals(bytes)) {
      throw new Error("The existing workbench manifest differs at " + targetManifest);
    }
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if ((await readdir(target)).length) {
    throw new Error("A nonempty workbench has no matching manifest at " + target);
  }
  const temp = join(target, ".prepare-" + randomUUID());
  const file = await open(temp, "wx", 0o600);
  try {
    try {
      await file.writeFile(bytes);
      await file.sync();
    } finally {
      await file.close();
    }
    await physicalDirectory(target);
    try {
      await link(temp, targetManifest);
    } catch (error) {
      if (error.code !== "EEXIST" || !(await manifest(targetManifest)).equals(bytes)) throw error;
    }
  } finally {
    await unlink(temp);
  }
}

if (process.argv.length !== 2) throw new Error("This command accepts no arguments");
await physicalDirectory(root);
await physicalDirectory(join(root, "environments"));
await physicalDirectory(join(root, ".cache"), true);
const cache = join(root, ".cache", "dependency-labs");
await physicalDirectory(cache, true);
for (const name of members) await prepareMember(cache, name);
process.stdout.write("Prepared " + members.length + " workspace manifests.\n");
