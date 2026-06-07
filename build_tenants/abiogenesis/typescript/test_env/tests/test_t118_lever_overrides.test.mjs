// T-118 lever overrides: admit / fail-closed-at-load / load-from-file /
// resolve precedence (request > override > registry-default) with provenance.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitAbgLeverOverridesBundle,
  loadAbgLeverOverridesBundleFromFile,
  resolveM04RequestDefaults
} from "../../build/semantic/code/src/shared/lever_registry/overrides.js";

const validBundle = {
  kind: "abg_lever_overrides_bundle",
  abgDefaultsFamily: "abg_defaults",
  version: 1,
  bundleRef: "lever-overrides://test",
  overrides: { "abg.m04.until": "converged", "abg.m04.fh_mode": "direct" }
};

test("T-118 overrides: admit valid bundle normalizes + digests", () => {
  const admitted = admitAbgLeverOverridesBundle(validBundle);
  assert.equal(admitted.kind, "abg_lever_overrides_bundle");
  assert.equal(admitted.bundleRef, "lever-overrides://test");
  assert.equal(admitted.version, 1);
  assert.deepEqual(admitted.overrides, {
    "abg.m04.until": "converged",
    "abg.m04.fh_mode": "direct"
  });
  assert.equal(typeof admitted.bundleDigest, "string");
  assert.ok(admitted.bundleDigest.length > 0);
  assert.equal(admitted.bundlePath, null);
});

test("T-118 overrides: malformed bundle fails closed AT LOAD", () => {
  assert.throws(
    () => admitAbgLeverOverridesBundle({ ...validBundle, kind: "wrong" }),
    /kind/u
  );
  assert.throws(
    () =>
      admitAbgLeverOverridesBundle({ ...validBundle, abgDefaultsFamily: "x" }),
    /abgDefaultsFamily/u
  );
  assert.throws(
    () => admitAbgLeverOverridesBundle({ ...validBundle, version: 0 }),
    /version/u
  );
  // unknown lever key
  assert.throws(
    () =>
      admitAbgLeverOverridesBundle({
        ...validBundle,
        overrides: { "abg.nope.key": "x" }
      }),
    /not a live tunable lever/u
  );
  // fixed lever key (not tunable) -> rejected
  assert.throws(
    () =>
      admitAbgLeverOverridesBundle({
        ...validBundle,
        overrides: { "abg.graph.vector.index_seed": 5 }
      }),
    /not a live tunable lever/u
  );
  // value outside the governed enum -> rejected at load, not later
  assert.throws(
    () =>
      admitAbgLeverOverridesBundle({
        ...validBundle,
        overrides: { "abg.m04.until": "next" }
      }),
    /expected one of/u
  );
});

test("T-118 overrides: load from file sets bundlePath + digest", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "t118-ov-"));
  const file = path.join(dir, "abg.lever-overrides.json");
  await writeFile(file, JSON.stringify(validBundle), "utf8");
  const loaded = loadAbgLeverOverridesBundleFromFile(file);
  assert.equal(loaded.bundlePath, file);
  assert.equal(typeof loaded.bundleDigest, "string");
  assert.deepEqual(loaded.overrides, validBundle.overrides);
});

test("T-118 overrides: missing bundle resolves to registry defaults", () => {
  const r = resolveM04RequestDefaults({ bundle: null });
  assert.equal(r.until, "converged");
  assert.equal(r.fhMode, "direct");
  assert.equal(r.provenance.selections.until, "registry_default");
  assert.equal(r.provenance.selections.fhMode, "registry_default");
  assert.equal(r.provenance.bundleRef, null);
});

test("T-118 overrides: bundle override applies with provenance", () => {
  const bundle = admitAbgLeverOverridesBundle({
    ...validBundle,
    overrides: { "abg.m04.until": "blocked", "abg.m04.fh_mode": "human-proxy" }
  });
  const r = resolveM04RequestDefaults({ bundle });
  assert.equal(r.until, "blocked");
  assert.equal(r.fhMode, "human-proxy");
  assert.equal(r.provenance.selections.until, "override");
  assert.equal(r.provenance.selections.fhMode, "override");
  assert.equal(r.provenance.bundleRef, bundle.bundleRef);
  assert.equal(r.provenance.bundleDigest, bundle.bundleDigest);
});

test("T-118 overrides: explicit request value beats bundle", () => {
  const bundle = admitAbgLeverOverridesBundle({
    ...validBundle,
    overrides: { "abg.m04.until": "blocked" }
  });
  const r = resolveM04RequestDefaults({ requestUntil: "first_traversal", bundle });
  assert.equal(r.until, "first_traversal");
  assert.equal(r.provenance.selections.until, "request");
  // fh_mode not in request or this bundle -> registry default
  assert.equal(r.fhMode, "direct");
  assert.equal(r.provenance.selections.fhMode, "registry_default");
});
