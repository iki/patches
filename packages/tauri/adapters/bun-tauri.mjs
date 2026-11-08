import { createRequire } from "node:module";
import { resolve } from "node:path";
import { withNativeLifetime } from "./native-lifetime.mjs";

const require = createRequire(resolve("package.json"));
const { run } = require("@tauri-apps/cli");
try {
  await withNativeLifetime(() => run(process.argv.slice(2), "tauri"));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Tauri CLI failed");
  process.exitCode = 1;
}
