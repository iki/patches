import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { delimiter, dirname, resolve } from "node:path";

const cli = fileURLToPath(new URL("./bun-tauri.mjs", import.meta.url));
await test("Tauri completes every native callback before Bun exits, without retrying a failed invocation", () => {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (key.toLowerCase() === "path") delete env[key];
  env.PATH = [
    dirname(process.execPath),
    ...(process.env.SystemRoot ? [resolve(process.env.SystemRoot, "System32")] : []),
  ].join(delimiter);
  for (let attempt = 0; attempt < 160; attempt++) {
    const child = spawnSync(process.execPath, [cli, "--version"], {
      env,
      encoding: "utf8",
      timeout: 10000,
      windowsHide: true,
    });
    assert.equal(
      child.status,
      0,
      `Invocation ${attempt + 1}: ${child.error?.message ?? child.stderr}\n${child.stdout}`,
    );
    assert.match(child.stdout, /^tauri-cli \d+\.\d+\.\d+/);
  }
  const failed = spawnSync(process.execPath, [cli, "--not-a-tauri-option"], {
    env,
    encoding: "utf8",
    timeout: 10000,
    windowsHide: true,
  });
  assert.notEqual(failed.status, 0, "Actual CLI failures must remain failures");
  assert.match(failed.stderr, /unexpected argument/);
});

await test("native lifetime awaits an unreferenced callback and releases its handle on success or failure", async () => {
  await mkdir(".cache/native-lifetime", { recursive: true });
  const directory = await mkdtemp(resolve(".cache/native-lifetime/callback-"));
  const entry = resolve(directory, "fixture.ts");
  await writeFile(
    entry,
    `import { withNativeLifetime } from ${JSON.stringify(new URL("./native-lifetime.mjs", import.meta.url).href)};
    try {
      await withNativeLifetime(() => new Promise((resolve, reject) => {
        setTimeout(() => process.argv[2] === "fail" ? reject(new Error("native rejection")) : resolve(), 40).unref();
      }));
      console.log("callback completed");
    } catch { console.error("native rejection"); process.exitCode = 1; }
  `,
  );
  for (const outcome of ["pass", "fail"]) {
    const child = spawnSync(process.execPath, [entry, outcome], {
      encoding: "utf8",
      timeout: 5000,
      windowsHide: true,
    });
    assert.equal(child.error, undefined, "No leaked keep-alive timer");
    assert.equal(child.status, outcome === "pass" ? 0 : 1);
    assert.match(
      outcome === "pass" ? child.stdout : child.stderr,
      /callback completed|native rejection/,
    );
  }
});
