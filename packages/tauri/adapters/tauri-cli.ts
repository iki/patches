/** Pinned Tauri API adapter: the native CLI finishes on a separate Rust thread. */
import { run } from "@tauri-apps/cli";
import { consola } from "consola";
import { withNativeLifetime } from "./native-lifetime.ts";

try {
  await withNativeLifetime(() => run(process.argv.slice(2), "tauri"));
} catch (error) {
  consola.error(error instanceof Error ? error.message : "Tauri CLI failed");
  process.exitCode = 1;
}
