import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const require = createRequire(resolve("package.json"));
const cli = require.resolve("@tauri-apps/cli");
const invoke = [
  "const { run } = require(process.argv[1]);",
  "run(['completions', '--shell', 'bash', '--output', process.argv[2]], 'tauri').then(",
  "  result => console.log('callback resolved', result),",
  "  error => { console.error('callback rejected', error.message); process.exitCode = 1; }",
  ");",
].join("\n");

await test("unguarded native completion settles the JavaScript promise before Bun exits", async () => {
  assert.ok(["1.4.2", "1.4.5"].includes(process.versions.bun));
  assert.equal(require("@tauri-apps/cli/package.json").version, "2.12.6");
  const directory = await mkdtemp(join(tmpdir(), "tauri-callback-"));
  function run(output) {
    const child = spawnSync(process.execPath, ["-e", invoke, cli, output], {
      encoding: "utf8", timeout: 10000, windowsHide: true,
    });
    if (child.error) throw child.error;
    return child;
  }
  try {
    const output = join(directory, "completion.bash");
    for (let attempt = 1; attempt <= 160; attempt++) {
      const child = run(output);
      assert.equal(child.status, 0, "Launch " + attempt + ": " + child.stderr);
      assert.match(child.stdout, /callback resolved true/);
    }
    assert.match(await readFile(output, "utf8"), /tauri/);
    const rejected = run(join(directory, "missing-parent", "completion.bash"));
    assert.equal(rejected.status, 1);
    assert.match(rejected.stderr, /callback rejected.*write/i);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
