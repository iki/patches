import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { basename, delimiter, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const exactVersion = /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/u;
const shimDirectory = /(?:^|[\\/])\.?shims?(?:[\\/]|$)/iu;

export function projectPins(config, manifest, bunVersion) {
  const { bun, aube } = config.tools ?? {};
  if (typeof bun !== "string" || !exactVersion.test(bun) ||
      bun !== bunVersion.trim() || bun !== manifest.engines?.bun) {
    throw new Error("The exact Bun pins in mise.toml, .bun-version and package.json must agree.");
  }
  if (typeof aube !== "string" || !exactVersion.test(aube) ||
      manifest.packageManager !== "aube@" + aube) {
    throw new Error("The exact Aube pins in mise.toml and package.json must agree.");
  }
  if (config.settings?.auto_install !== false) throw new Error("Disable automatic Mise installation.");
  return { bun, aube };
}

export function physicalExecutable(name, path) {
  if (!isAbsolute(path) || /[\r\n\0]/u.test(path) || shimDirectory.test(path)) {
    throw new Error("Mise must select an absolute physical " + name + " executable.");
  }
  const physical = realpathSync.native(path);
  const expected = process.platform === "win32" ? name + ".exe" : name;
  const actual = process.platform === "win32" ? basename(physical).toLowerCase() : basename(physical);
  if (actual !== expected || shimDirectory.test(physical) || !statSync(physical).isFile()) {
    throw new Error("Mise selected an invalid physical " + name + " executable.");
  }
  return physical;
}

export function toolEnvironment(executables, inherited) {
  const env = { ...inherited };
  const selectedDirectories = [...new Set(executables.map(dirname))];
  const originalPaths = [];
  for (const key of Object.keys(env)) {
    if (key.toLowerCase() !== "path") continue;
    originalPaths.push(env[key]);
    delete env[key];
  }
  env.PATH = [...selectedDirectories, ...originalPaths].join(delimiter);
  return env;
}

export function probeEnvironment(name, inherited) {
  const overrides = name === "mise"
    ? { MISE_OFFLINE: "true", MISE_AUTO_INSTALL: "false" }
    : name === "aube"
    ? { AUBE_MANAGE_PACKAGE_MANAGER_VERSIONS: "false", AUBE_NO_UPDATE_CHECK: "1" }
    : {};
  const replaced = new Set(Object.keys(overrides).map((key) => key.toLowerCase()));
  // Aube checks the npm-compatible alias before its AUBE_ setting.
  if (name === "aube") replaced.add("npm_config_manage_package_manager_versions");
  const env = Object.fromEntries(Object.entries(inherited).filter(([key]) => !replaced.has(key.toLowerCase())));
  return { ...env, ...overrides };
}

function probe(executable, args, options) {
  const result = spawnSync(executable, args, {
    ...options, encoding: "utf8", windowsHide: true, timeout: 10_000, maxBuffer: 65_536,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) {
    throw new Error("Could not run " + basename(executable) + " " + args[0] +
      ". Check the project Mise trust and the explicitly installed pins.");
  }
  return result.stdout.trim();
}

export function verifyVersion(name, expected, output) {
  const observed = name === "aube"
    ? /^(\d+\.\d+\.\d+(?:-[\w.-]+)?) [a-z0-9_]+-(?!x86_64 |aarch64 )[a-z0-9_]+ \((?:\d{4}-\d{2}-\d{2}|unknown)\)$/u.exec(output)?.[1]
    : output;
  if (observed !== expected) throw new Error(name + " failed its version check for " + expected + ".");
}

function main([tool, ...args]) {
  if (tool !== "aube" && tool !== "bun") throw new Error("Usage: toolchain.mjs <bun|aube> [arguments...]");
  const read = (file) => readFileSync(join(projectRoot, file), "utf8");
  const pins = projectPins(Bun.TOML.parse(read("mise.toml")), JSON.parse(read("package.json")), read(".bun-version"));
  const lookup = { cwd: projectRoot, env: probeEnvironment("mise", process.env) };
  const selected = new Map();
  for (const name of tool === "aube" ? ["bun", "aube"] : ["bun"]) {
    const path = probe("mise", ["--no-config", "which", name, "--tool", name + "@" + pins[name]], lookup);
    selected.set(name, physicalExecutable(name, path));
  }
  const identity = (path) => process.platform === "win32" ? path.toLowerCase() : path;
  if (identity(physicalExecutable("bun", process.execPath)) !== identity(selected.get("bun"))) {
    throw new Error("Start the launcher with this project's pinned physical Bun using the lookup in TOOLCHAIN.md.");
  }
  const env = toolEnvironment([...selected.values()], process.env);
  for (const [name, executable] of selected) {
    verifyVersion(name, pins[name], probe(executable, ["--version"], { cwd: projectRoot, env: probeEnvironment(name, env) }));
  }
  const result = spawnSync(selected.get(tool), args, { cwd: projectRoot, env, stdio: "inherit", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status === null) throw new Error("The tool terminated without an exit code.");
  return result.status;
}

if (import.meta.main) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof Error ? error.message : "Tool launch failed."); process.exitCode = 1; }
}
