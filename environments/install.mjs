import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { closeSync, fstatSync, lstatSync, mkdtempSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { physicalExecutable, probeEnvironment, projectPins, toolEnvironment, verifyVersion } from "../app/toolchain.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = "aube-workspace.yaml";
const lockfile = "aube-lock.yaml";
const template = "environments/aube-workspace.yaml.in";
const sections = ["dependencies","devDependencies","optionalDependencies"];
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const json = (bytes) => JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
const sameKeys = (a,b) => object(a) && object(b) && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((key) => Object.hasOwn(b,key));

function bytes(path,limit = 24 * 1024 * 1024) {
  const stat = lstatSync(path);
  assert(stat.isFile() && !stat.isSymbolicLink() && relative(path,realpathSync.native(path)) === "" && stat.size <= limit,"Invalid or oversized physical file: " + path);
  const data = readFileSync(path);
  assert(data.length === stat.size,"File changed while reading: " + path);
  return data;
}
function exists(path) {
  try { lstatSync(path); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; }
}
function create(directory,path,data) {
  const target = join(directory,path);
  mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,data,{flag:"wx",mode:0o600});
}
function run(exe,args,cwd,env,options = {}) {
  const result = spawnSync(exe,args,{cwd,env,windowsHide:true,timeout:15 * 60_000,stdio:"inherit",...options});
  if (result.error) throw result.error;
  assert(result.status === 0,"Command failed: " + (args[0] ?? exe) + " (exit " + result.status + ")");
  return result.stdout;
}
function pinnedTools() {
  const read = (file) => bytes(join(root,file),512 * 1024).toString("utf8");
  const pins = projectPins(Bun.TOML.parse(read("mise.toml")),JSON.parse(read("package.json")),read(".bun-version"));
  const selection = {};
  const lookup = probeEnvironment("mise",process.env);
  const probe = (exe,args,env) => run(exe,args,root,env,{stdio:["ignore","pipe","inherit"],encoding:"utf8",timeout:10000,maxBuffer:65536}).trim();
  for (const name of ["bun","aube"]) {
    selection[name] = physicalExecutable(name,probe("mise",["--no-config","which",name,"--tool",name + "@" + pins[name]],lookup));
  }
  assert(relative(physicalExecutable("bun",process.execPath),selection.bun) === "","Start with the project's pinned physical Bun");
  const env = toolEnvironment([selection.bun,selection.aube],process.env);
  for (const [name,executable] of Object.entries(selection)) {
    verifyVersion(name,pins[name],probe(executable,["--version"],probeEnvironment(name,env)));
  }
  return {...selection,env};
}

export function checkLock(lock,manifests,patches) {
  assert(object(lock) && String(lock.lockfileVersion) === "9.0" && sameKeys(lock.importers,manifests),"Expected exact workspace importers in Aube lock v9");
  assert(sameKeys(lock.patchedDependencies ?? {},patches),"Lock patch selection changed");
  for (const [selector,digest] of Object.entries(patches)) assert(lock.patchedDependencies[selector] === digest,"Lock patch digest changed: " + selector);
  const covered = new Set();
  for (const [member,manifest] of Object.entries(manifests)) {
    const importer = lock.importers[member];
    assert(object(importer),"Invalid workspace importer: " + member);
    for (const section of sections) {
      const expected = manifest[section] ?? {};
      const actual = importer[section] ?? {};
      assert(sameKeys(expected,actual),"Dependency roles or names differ: " + member);
      for (const [name,pin] of Object.entries(expected)) {
        const selector = name + "@" + pin;
        const resolution = actual[name]?.version;
        assert(actual[name]?.specifier === pin && typeof resolution === "string" &&
          (resolution === pin || resolution.startsWith(pin + "(")) && Object.hasOwn(lock.packages ?? {},selector) &&
          Object.hasOwn(lock.snapshots ?? {},name + "@" + resolution),"Unresolved direct dependency: " + selector);
        if (Object.hasOwn(patches,selector)) {
          assert(resolution.includes("(patch_hash=" + patches[selector] + ")"),"Unpatched importer edge: " + selector);
          covered.add(selector);
        }
      }
    }
  }
  assert(covered.size === Object.keys(patches).length,"A selected patch has no matching direct workspace edge");
}
function inputs() {
  const files = new Map();
  const add = (path) => { const data = bytes(join(root,path)); files.set(path,data); return data; };
  const manifest = json(add("package.json"));
  add(".bun-version"); add("mise.toml"); add("bunfig.toml"); add("environments/prepare.mjs"); add("app/toolchain.mjs");
  const definition = Bun.YAML.parse(add(template).toString("utf8"));
  assert(object(definition?.allowBuilds) && definition.allowBuilds["@google/genai"] === false &&
    definition.allowBuilds.protobufjs === false && Object.values(definition.allowBuilds).every((value) => value === false),
    "Workspace build-denial settings changed");
  const members = definition?.packages;
  assert(Array.isArray(members) && members.length === 3 && ["host-runtime-npm","web-native-npm","mobile-studio-npm"].every((name) => members.includes(".cache/dependency-labs/" + name)) && new Set(members).size === members.length &&
    members.every((p) => typeof p === "string" && /^\.cache\/dependency-labs\/[a-z0-9]+(?:-[a-z0-9]+)*-npm$/u.test(p)),"Unexpected workspace definition");
  const manifests = {".":manifest};
  for (const member of members) {
    const path = "environments/" + member.split("/").at(-1) + "/package.json";
    const source = add(path);
    assert(source.equals(bytes(join(root,member,"package.json"))),"Prepared member differs from tracked source");
    manifests[member] = json(source);
  }
  const registry = json(add("registry.json"));
  const migration = json(add("migration.json"));
  const patches = {};
  const selected = manifest.aube?.patchedDependencies ?? {};
  assert(object(selected),"Invalid patch selector map");
  for (const [selector,path] of Object.entries(selected)) {
    const series = registry.packageSeries.find((item) => item.selector === selector);
    const artifact = migration.artifacts.find((item) => item.path === path);
    assert(series && typeof path === "string" && path === series.bundle && path.startsWith("patches/") &&
      path.endsWith(".patch") && path.split("/").every((part) => /^[a-z0-9@._-]+$/iu.test(part) && part !== "." && part !== "..") && artifact,"Unknown patch registration: " + selector);
    const digest = sha(add(path));
    assert(digest === artifact.sha256,"Patch artifact hash differs: " + selector);
    patches[selector] = digest;
  }
  return {files,manifests,patches,definition:files.get(template)};
}
function marker(directory,patches) {
  const path = join(directory,"node_modules",".aube-applied-patches.json");
  if (!Object.keys(patches).length && !exists(path)) return;
  const applied = json(bytes(path,1024 * 1024));
  assert(sameKeys(applied,patches) && Object.entries(patches).every(([key,value]) => applied[key] === value),"Installed Aube patch marker differs");
}
function guards(snapshot,baseline) {
  for (const [path,original] of snapshot.files) assert(original.equals(bytes(join(root,path))),"Source changed: " + path);
  assert(baseline.equals(bytes(join(root,lockfile))),"The active lock changed");
}
function activationDiff(trial,baseline,candidate,definition,env) {
  create(trial,"before/" + lockfile,baseline);
  create(trial,"after/" + lockfile,candidate);
  create(trial,"after/" + workspace,definition);
  const diff = spawnSync("git",["-c","core.autocrlf=false","diff","--no-index","--no-renames","--no-ext-diff","--no-textconv","--binary","--","before","after"],
    {cwd:trial,env:{...env,GIT_CEILING_DIRECTORIES:dirname(trial)},windowsHide:true,timeout:30000,maxBuffer:32 * 1024 * 1024,stdio:["ignore","pipe","inherit"]});
  if (diff.error) throw diff.error;
  assert(diff.status === 1 && diff.stdout?.length,"Cannot prepare the activation diff");
  return diff.stdout;
}
function solve(tools,snapshot) {
  assert(!exists(join(root,workspace)),"A workspace is already active. Use setup for frozen installation");
  const configs = readdirSync(root).filter((name) => /^(?:\.npmrc|\.pnpmfile\.(?:c?js|mjs)|pnpm-workspace\.yaml|\.?aube(?:\.config)?\.toml)$/iu.test(name));
  assert(!configs.length,"Review additional project package-manager configuration before reproducing it: " + configs.join(", "));
  const trial = mkdtempSync(join(realpathSync.native(tmpdir()),"patches-aube-"));
  console.log("Candidate",trial);
  const baseline = bytes(join(root,lockfile));
  const {files,manifests,patches,definition} = snapshot;
  const staged = new Map([["package.json",files.get("package.json")],["bunfig.toml",files.get("bunfig.toml")],[workspace,definition]]);
  for (const member of Object.keys(manifests).filter((name) => name !== ".")) {
    staged.set(member + "/package.json",files.get("environments/" + member.split("/").at(-1) + "/package.json"));
  }
  for (const [path,data] of files) if (path.startsWith("patches/")) staged.set(path,data);
  for (const [path,data] of staged) create(trial,path,data);
  create(trial,lockfile,baseline);
  run(tools.aube,["install","--lockfile-only","--ignore-scripts"],trial,tools.env);
  const candidate = bytes(join(trial,lockfile));
  assert(!candidate.includes(13) && !candidate.includes(0),"Candidate lock must use UTF-8 LF");
  checkLock(Bun.YAML.parse(new TextDecoder("utf-8",{fatal:true}).decode(candidate)),manifests,patches);
  assert(!exists(join(trial,"node_modules",".aube-applied-patches.json")),"Solver unexpectedly produced an installed patch marker");
  run(tools.aube,["install","--frozen-lockfile","--ignore-scripts"],trial,tools.env);
  marker(trial,patches);
  assert(candidate.equals(bytes(join(trial,lockfile))),"Frozen installation changed the candidate lock");
  for (const [path,data] of staged) assert(data.equals(bytes(join(trial,path))),"Candidate manifest, policy or patch changed: " + path);
  guards(snapshot,baseline);
  assert(!exists(join(root,workspace)),"Workspace activated by another task");
  const diff = activationDiff(trial,baseline,candidate,definition,tools.env);
  create(trial,"activation.patch",diff);
  const sourceHashes = Object.fromEntries([...files].map(([path,data]) => [path,sha(data)]));
  create(trial,"verified.json",JSON.stringify({sourceHashes,baseline:sha(baseline),activation:sha(diff)},null,2) + "\n");
  console.log("Verified frozen candidate. Review activation.patch before running activate with this candidate directory.");
}
function activate(trial,snapshot,tools) {
  const receipt = json(bytes(join(trial,"verified.json"),1024 * 1024));
  const hashes = Object.fromEntries([...snapshot.files].map(([path,data]) => [path,sha(data)]));
  assert(sameKeys(hashes,receipt.sourceHashes) && Object.entries(hashes).every(([path,digest]) => receipt.sourceHashes[path] === digest),"Candidate source baseline changed");
  const baseline = bytes(join(root,lockfile));
  assert(!exists(join(root,workspace)) && sha(baseline) === receipt.baseline,"Active workspace or lock changed");
  const candidate = bytes(join(trial,lockfile));
  checkLock(Bun.YAML.parse(new TextDecoder("utf-8",{fatal:true}).decode(candidate)),snapshot.manifests,snapshot.patches);
  assert(bytes(join(trial,workspace)).equals(snapshot.definition),"Candidate workspace differs");
  marker(trial,snapshot.patches);
  const review = mkdtempSync(join(realpathSync.native(tmpdir()),"patches-aube-review-"));
  const expected = activationDiff(review,baseline,candidate,snapshot.definition,tools.env);
  const patch = bytes(join(trial,"activation.patch"),32 * 1024 * 1024);
  assert(patch.equals(expected),"Reviewed diff differs from verified activation files");
  assert(sha(patch) === receipt.activation,"Activation diff changed");
  const args = ["apply","--index","--whitespace=error-all","-p2","--include=" + lockfile,"--include=" + workspace];
  run("git",[...args,"--check","-"],root,tools.env,{input:patch,stdio:["pipe","inherit","inherit"]});
  guards(snapshot,baseline);
  run("git",[...args,"-"],root,tools.env,{input:patch,stdio:["pipe","inherit","inherit"]});
  assert(bytes(join(root,lockfile)).equals(candidate) && bytes(join(root,workspace)).equals(snapshot.definition),"Check the staged activation before continuing");
}
function withWorkspaceLock(action) {
  const path = join(root,".cache","dependency-labs",".workspace-install.lock");
  const handle = openSync(path,"wx",0o600);
  const own = fstatSync(handle);
  let uncertain = false;
  try {
    writeFileSync(handle,JSON.stringify({pid:process.pid}) + "\n","utf8");
    action();
  } catch (error) {
    uncertain = error?.code === "ETIMEDOUT";
    throw error;
  } finally {
    closeSync(handle);
    if (!uncertain) {
      const current = lstatSync(path);
      assert(current.dev === own.dev && current.ino === own.ino && !current.isSymbolicLink(),"Workspace lock ownership changed");
      unlinkSync(path);
    }
  }
}
function main([command,folder,...extra]) {
  assert(["solve","setup","activate"].includes(command) && !extra.length && (command === "activate") === Boolean(folder),
    "Usage: install.mjs solve | setup | activate <reviewed-candidate-directory>");
  const tools = pinnedTools();
  run(tools.bun,["environments/prepare.mjs"],root,tools.env);
  const snapshot = inputs();
  if (command === "solve") return solve(tools,snapshot);
  return withWorkspaceLock(() => {
    if (command === "activate") return activate(resolve(folder),snapshot,tools);
    assert(bytes(join(root,workspace)).equals(snapshot.definition),"Active workspace differs from the reviewed definition");
    const baseline = bytes(join(root,lockfile));
    checkLock(Bun.YAML.parse(baseline.toString("utf8")),snapshot.manifests,snapshot.patches);
    run(tools.aube,["install","--frozen-lockfile","--ignore-scripts"],root,tools.env);
    marker(root,snapshot.patches);
    guards(snapshot,baseline);
    assert(bytes(join(root,workspace)).equals(snapshot.definition),"Workspace changed during installation");
  });
}
if (import.meta.main) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error instanceof Error ? error.message : "Installation failed"); process.exitCode = 1; }
}
