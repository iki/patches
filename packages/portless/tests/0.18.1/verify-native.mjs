import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import { pathToFileURL } from "node:url";

const runtime = process.versions.bun;
assert.ok(["1.4.2", "1.4.5"].includes(runtime), "Run with Bun 1.4.2 or 1.4.5");
assert.equal(process.argv.length, 4, "Pass the unpatched npm package and Portless release source directories");
const packageRoot = resolve(process.argv[2]);
const releaseRoot = resolve(process.argv[3]);
const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
assert.equal(manifest.name, "portless");
assert.equal(manifest.version, "0.18.1");
const git = (...args) => execFileSync("git", ["-C", releaseRoot, ...args], {
  encoding: "utf8",
  timeout: 10000,
  windowsHide: true,
}).trim();
assert.equal(git("rev-parse", "HEAD"), "6c8b988f98abfc60095d08041ffef789ef89cc83");
assert.equal(git("status", "--porcelain", "--untracked-files=normal", "--", "packages/portless/src"), "");
const { createProxyServer } = await import(pathToFileURL(join(packageRoot, "dist/index.js")).href);
const { ensureCerts, createSNICallback } = await import(pathToFileURL(join(releaseRoot, "packages/portless/src/certs.ts")).href);
const state = mkdtempSync(join(tmpdir(), "portless-0-18-1-"));
const backend = http.createServer((_req, res) => res.end("portless TLS test"));
const sockets = new Set();
let connectionCount = 0;
backend.on("connection", (socket) => {
  connectionCount++;
  sockets.add(socket);
  socket.on("close", () => sockets.delete(socket));
});
let proxy;
try {
  const bundle = ensureCerts(state);
  const cert = readFileSync(bundle.certPath);
  const key = readFileSync(bundle.keyPath);
  const ca = readFileSync(bundle.caPath);
  const select = createSNICallback(state, cert, key, ["localhost", "preview"], ca);
  await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
  const port = backend.address().port;
  const first = "nested.app.localhost";
  const second = "updated.app.preview";
  const routes = [{ hostname: first, port }];
  const attempts = new Map();
  let failNext;
  proxy = createProxyServer({
    getRoutes: () => routes,
    proxyPort: 443,
    tlds: ["localhost", "preview"],
    loopbackOnly: true,
    tls: {
      cert, key, ca,
      SNICallback(name, callback) {
        attempts.set(name, (attempts.get(name) ?? 0) + 1);
        if (name === failNext) {
          failNext = undefined;
          callback(new Error("Fixture certificate selection failure"));
        } else {
          select(name, callback);
        }
      },
    },
  });
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  const request = (name) => new Promise((resolve, reject) => {
    const req = https.get({
      hostname: "127.0.0.1", port: proxy.address().port, servername: name, ca, agent: false,
      headers: { Host: name },
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve(body));
      response.on("error", reject);
    });
    const timer = setTimeout(() => req.destroy(new Error("TLS request timed out")), 15000);
    req.once("close", () => clearTimeout(timer));
    req.on("error", reject);
  });
  assert.equal(await request(first), "portless TLS test");
  assert.equal(await request(first), "portless TLS test");
  assert.ok(attempts.has(first), "Portless selected a certificate for the nested hostname");
  assert.equal(connectionCount, 1, "both front-end connections reused the backend socket");
  routes.push({ hostname: second, port });
  failNext = second;
  await assert.rejects(request(second));
  assert.ok(attempts.has(second), "the registered name reached certificate selection");
  assert.equal(await request(first), "portless TLS test");
  assert.equal(await request(second), "portless TLS test");
  assert.ok(attempts.get(second) >= 2, "the failed name retried on its next handshake");
  await new Promise((resolve) => proxy.close(resolve));
  const deadline = Date.now() + 2000;
  while (sockets.size > 0 && Date.now() < deadline) await wait(10);
  assert.equal(sockets.size, 0, "closing the proxy closed the pooled backend socket");
  console.log("Portless 0.18.1 / Bun " + runtime + " passed generated-certificate SNI, dynamic routes, failure isolation, retry, loopback-only requests and pool cleanup");
} finally {
  if (proxy?.listening) await new Promise((resolve) => proxy.close(resolve));
  backend.closeAllConnections();
  if (backend.listening) await new Promise((resolve) => backend.close(resolve));
  assert.equal(dirname(resolve(state)), resolve(tmpdir()));
  assert.match(basename(state), /^portless-0-18-1-[A-Za-z0-9]+$/);
  rmSync(state, { recursive: true, force: true });
}
