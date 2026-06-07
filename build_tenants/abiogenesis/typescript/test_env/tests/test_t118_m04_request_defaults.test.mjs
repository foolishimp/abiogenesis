// T-118 steel thread: M04 request-defaults configurable_default family.
// Deterministic proof of admit / malformed-fail-closed / load / missing-absence-law
// / bundle-override / request-precedence / provenance. No live worker required.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitAbgM04RequestDefaultsBundle,
  loadAbgM04RequestDefaultsBundleFromFile,
  resolveAbgM04RequestDefaults,
  ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW
} from "../../build/semantic/code/src/app/m04/max_autonomy/request_defaults_bundle.js";

const validBundle = {
  kind: "abg_m04_request_defaults_bundle",
  abgDefaultsFamily: "abg_defaults",
  version: 1,
  bundleRef: "fallback-bundle://abg/m04-request-defaults/test",
  m04RequestDefaults: { until: "converged", fhMode: "direct" }
};

test("T-118 M04 defaults: admit valid bundle normalizes shape + digest", () => {
  const admitted = admitAbgM04RequestDefaultsBundle(validBundle);
  assert.equal(admitted.kind, "abg_m04_request_defaults_bundle");
  assert.equal(admitted.abgDefaultsFamily, "abg_defaults");
  assert.equal(admitted.bundleRef, validBundle.bundleRef);
  assert.equal(admitted.version, 1);
  assert.deepEqual(admitted.m04RequestDefaults, {
    until: "converged",
    fhMode: "direct"
  });
  assert.equal(typeof admitted.bundleDigest, "string");
  assert.ok(admitted.bundleDigest.length > 0);
  assert.equal(admitted.bundlePath, null);
});

test("T-118 M04 defaults: malformed bundle fails closed", () => {
  assert.throws(
    () => admitAbgM04RequestDefaultsBundle({ ...validBundle, kind: "wrong" }),
    /kind/u
  );
  assert.throws(
    () =>
      admitAbgM04RequestDefaultsBundle({
        ...validBundle,
        abgDefaultsFamily: "other"
      }),
    /abgDefaultsFamily/u
  );
  assert.throws(
    () => admitAbgM04RequestDefaultsBundle({ ...validBundle, version: 0 }),
    /version/u
  );
  assert.throws(
    () =>
      admitAbgM04RequestDefaultsBundle({
        ...validBundle,
        m04RequestDefaults: { until: "converged" }
      }),
    /fhMode/u
  );
});

test("T-118 M04 defaults: load from file sets bundlePath + digest", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "t118-m04-"));
  const file = path.join(dir, "abg.m04-request-defaults.json");
  await writeFile(file, JSON.stringify(validBundle), "utf8");
  const loaded = loadAbgM04RequestDefaultsBundleFromFile(file);
  assert.equal(loaded.bundlePath, file);
  assert.equal(typeof loaded.bundleDigest, "string");
  assert.ok(loaded.bundleDigest.length > 0);
  assert.deepEqual(loaded.m04RequestDefaults, {
    until: "converged",
    fhMode: "direct"
  });
});

test("T-118 M04 defaults: missing bundle follows absence law", () => {
  const r = resolveAbgM04RequestDefaults({ bundle: null });
  assert.equal(r.until, ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW.until);
  assert.equal(r.fhMode, ABG_M04_REQUEST_DEFAULTS_ABSENCE_LAW.fhMode);
  assert.equal(r.provenance.selections.until, "absence_law");
  assert.equal(r.provenance.selections.fhMode, "absence_law");
  assert.equal(r.provenance.bundleRef, null);
  assert.equal(r.provenance.bundleDigest, null);
});

test("T-118 M04 defaults: bundle overrides absence law with provenance", () => {
  const bundle = admitAbgM04RequestDefaultsBundle({
    ...validBundle,
    m04RequestDefaults: { until: "next", fhMode: "human-proxy" }
  });
  const r = resolveAbgM04RequestDefaults({ bundle });
  assert.equal(r.until, "next");
  assert.equal(r.fhMode, "human-proxy");
  assert.equal(r.provenance.selections.until, "bundle");
  assert.equal(r.provenance.selections.fhMode, "bundle");
  assert.equal(r.provenance.bundleRef, bundle.bundleRef);
  assert.equal(r.provenance.bundleDigest, bundle.bundleDigest);
});

test("T-118 M04 defaults: explicit request value takes precedence over bundle", () => {
  const bundle = admitAbgM04RequestDefaultsBundle({
    ...validBundle,
    m04RequestDefaults: { until: "next", fhMode: "human-proxy" }
  });
  const r = resolveAbgM04RequestDefaults({ requestUntil: "converged", bundle });
  assert.equal(r.until, "converged");
  assert.equal(r.provenance.selections.until, "request");
  // fh_mode absent in request -> falls to bundle value
  assert.equal(r.fhMode, "human-proxy");
  assert.equal(r.provenance.selections.fhMode, "bundle");
});
