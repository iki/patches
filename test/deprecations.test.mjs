import assert from "node:assert/strict";
import { test } from "bun:test";
import { reviewDeprecations } from "../app/deprecations.mjs";

// A verified catalog has already checked these series and file hashes before calling the helper.
const bundle = {
  selector: "demo@1.2.3",
  bundle: "patches/demo@1.2.3.patch",
  sha256: "1".repeat(64),
};
const series = [{ selector: bundle.selector, bundle: bundle.bundle }];
const reference = (path) => {
  assert.equal(path, bundle.bundle);
  return { sha256: bundle.sha256 };
};
const ledger = (entries) => ({ format: "shared-patch-deprecations-v1", entries });

test("deprecation review clamps two UTC calendar months and preserves the exact time", () => {
  const cases = [
    ["2022-12-31", "2023-02-28"],
    ["2023-12-31", "2024-02-29"],
    ["2024-02-29", "2024-04-29"],
    ["2024-01-31", "2024-03-31"],
    ["2024-07-31", "2024-09-30"],
    ["2099-12-31", "2100-02-28"],
  ];
  for (const [marked, eligible] of cases) {
    const deprecatedAt = marked + "T23:59:58.321Z";
    const earliestReview = eligible + "T23:59:58.321Z";
    const entry = { ...bundle, deprecatedAt };
    const before = new Date(Date.parse(earliestReview) - 1).toISOString();
    assert.equal(reviewDeprecations(ledger([entry]), series, reference, before)[0].status, "retained");
    assert.deepEqual(reviewDeprecations(ledger([entry]), series, reference, earliestReview), [
      { ...entry, earliestReview, status: "eligible-for-review" },
    ]);
  }
});

test("deprecation review requires explicit dates, unique selectors and verified artifact identity", () => {
  const deprecatedAt = "2024-01-31T12:00:00.000Z";
  const entry = { ...bundle, deprecatedAt };
  const review = (records) => reviewDeprecations(ledger(records), series, reference, deprecatedAt);
  assert.deepEqual(review([]), []);
  for (const incompatible of [
    { ...entry, selector: "tinypool@3.0.0" },
    { ...entry, bundle: "patches/portless@0.16.0.patch" },
    { ...entry, sha256: "0".repeat(64) },
    { ...entry, deprecatedAt: "2023-02-29T12:00:00.000Z" },
    { ...entry, deprecatedAt: "2024-01-31T12:00:00.000+01:00" },
    { ...entry, deprecatedAt: "2024-02-01T12:00:00.000Z" },
    { ...entry, delete: true },
  ]) assert.throws(() => review([incompatible]));
  assert.throws(() => review([entry, entry]), /Duplicate/);
  assert.throws(() => review(Array(513).fill(entry)), /ledger/);
  assert.throws(() => reviewDeprecations(ledger([]), series, reference, "bad time"), /timestamp/);
});
