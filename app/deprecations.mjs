const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

function utcInstant(value) {
  if (typeof value !== "string" || !timestamp.test(value))
    throw new Error("Expected a UTC timestamp with milliseconds");
  const instant = new Date(value);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString() !== value)
    throw new Error("Invalid UTC calendar timestamp");
  return instant;
}

function twoCalendarMonthsAfter(start) {
  const end = new Date(start.getTime());
  end.setUTCMonth(start.getUTCMonth() + 3, 0);
  end.setUTCDate(Math.min(start.getUTCDate(), end.getUTCDate()));
  if (end.getUTCFullYear() > 9999) throw new Error("Deprecation date exceeds supported calendar");
  return end;
}

function exactFields(value, fields) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).length === fields.length && fields.every((key) => Object.hasOwn(value, key));
}

/** The catalog verifier supplies verified package series and a hash-checked artifact lookup. */
export function reviewDeprecations(ledger, series, reference, asOf) {
  const observed = utcInstant(asOf);
  if (!exactFields(ledger, ["format", "entries"]) || ledger.format !== "shared-patch-deprecations-v1" ||
      !Array.isArray(ledger.entries) || ledger.entries.length > 512)
    throw new Error("Invalid package patch deprecation ledger");

  const bundles = new Map(series.map((item) => [item.selector, item.bundle]));
  const seen = new Set();
  return ledger.entries.map((entry) => {
    if (!exactFields(entry, ["selector", "bundle", "sha256", "deprecatedAt"]) ||
        typeof entry.selector !== "string" || !bundles.has(entry.selector) ||
        bundles.get(entry.selector) !== entry.bundle)
      throw new Error("Unknown or mismatched deprecated package bundle");
    if (seen.has(entry.selector)) throw new Error("Duplicate deprecated package selector");
    seen.add(entry.selector);
    if (typeof entry.sha256 !== "string" || !/^[a-f0-9]{64}$/u.test(entry.sha256) ||
        reference(entry.bundle).sha256 !== entry.sha256)
      throw new Error("Deprecated bundle hash differs from its verified artifact");

    const start = utcInstant(entry.deprecatedAt);
    if (start > observed) throw new Error("Deprecation starts after the observation time");
    const earliestReview = twoCalendarMonthsAfter(start);
    return {
      selector: entry.selector,
      bundle: entry.bundle,
      sha256: entry.sha256,
      deprecatedAt: entry.deprecatedAt,
      earliestReview: earliestReview.toISOString(),
      status: observed < earliestReview ? "retained" : "eligible-for-review",
    };
  });
}
