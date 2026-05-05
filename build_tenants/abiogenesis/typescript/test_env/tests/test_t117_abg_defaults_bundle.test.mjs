// Validates: T-117
// Validates: REQ-R-ABG3-POLICY
// Validates: REQ-R-ABG3-PROVENANCE
// Validates: REQ-R-ABG3-TRANSPORT

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  admitAbgFallbackBundle,
  loadAbgFallbackBundleFromFile,
  resolvePluginTraversalObserverBinding
} from "../../build/semantic/code/src/abg/m03/index.js";
import { buildFpBasis } from "./support/m03-fixtures.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TYPESCRIPT_ROOT = path.resolve(TEST_DIR, "..", "..");
const REFERENCE_FALLBACK_PATH = path.join(
  TYPESCRIPT_ROOT,
  "config",
  "abg.reference-fallbacks.json"
);

async function tempRoot(label) {
  return await mkdtemp(path.join(tmpdir(), `abg-t117-${label}-`));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("T-117 shipped fallback bundle is visible abg_defaults configuration with digest provenance", async () => {
  const raw = JSON.parse(await readFile(REFERENCE_FALLBACK_PATH, "utf8"));
  const bundle = loadAbgFallbackBundleFromFile(REFERENCE_FALLBACK_PATH);

  assert.equal(bundle.kind, "abg_fallback_bundle");
  assert.equal(bundle.abgDefaultsFamily, "abg_defaults");
  assert.equal(bundle.bundlePath, REFERENCE_FALLBACK_PATH);
  assert.match(bundle.bundleDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(
    bundle.pluginTraversalObserverBindings.transform.observerPromptRef,
    "prompt://abg/reference/generic-transform-observer"
  );
  assert.equal(
    bundle.pluginTraversalObserverBindings.eval.observerPromptRef,
    "prompt://abg/reference/generic-eval-observer"
  );

  const admitted = admitAbgFallbackBundle(raw);
  assert.equal(admitted.bundleRef, bundle.bundleRef);
  assert.equal(admitted.bundlePath, null);
  assert.match(admitted.bundleDigest, /^sha256:[a-f0-9]{64}$/u);
});

test("T-117 installed editable fallback copy can override prompt refs without code changes", async () => {
  const source = JSON.parse(await readFile(REFERENCE_FALLBACK_PATH, "utf8"));
  const root = await tempRoot("editable-copy");
  const installedPath = path.join(
    root,
    ".abiogenesis",
    "config",
    "abg.fallbacks.json"
  );
  const override = clone(source);
  override.bundleRef = "fallback-bundle://abg/test-installed-override";
  override.pluginTraversalObserverBindings.transform.observerPromptRef =
    "prompt://tenant/custom-transform-observer";
  await writeJson(installedPath, override);

  const bundle = loadAbgFallbackBundleFromFile(installedPath);
  const { basis } = buildFpBasis();
  const selection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: basis.graph.vectors[0],
    graphFunction: basis.graphFunction,
    roles: basis.job.roles,
    defaultsBundle: bundle,
    fallbackEnabled: true
  });

  assert.equal(selection.source, "abg_defaults");
  assert.equal(selection.fallbackBundleRef.bundlePath, installedPath);
  assert.equal(
    selection.binding.observerPromptRef,
    "prompt://tenant/custom-transform-observer"
  );
  assert.equal(selection.fallbackBundleRef.bundleDigest, bundle.bundleDigest);
});

test("T-117 malformed, missing, and partial defaults fail closed", async () => {
  const source = JSON.parse(await readFile(REFERENCE_FALLBACK_PATH, "utf8"));
  const root = await tempRoot("malformed");
  const malformedPath = path.join(root, ".abiogenesis", "config", "bad.json");
  const partialPath = path.join(root, ".abiogenesis", "config", "partial.json");
  const malformed = clone(source);
  malformed.pluginTraversalObserverBindings.transform.observerPromptRef = "";
  const partial = clone(source);
  delete partial.pluginTraversalObserverBindings.eval;
  await writeJson(malformedPath, malformed);
  await writeJson(partialPath, partial);

  assert.throws(
    () => loadAbgFallbackBundleFromFile(path.join(root, "missing.json")),
    /ENOENT/u
  );
  assert.throws(
    () => loadAbgFallbackBundleFromFile(malformedPath),
    /observerPromptRef/u
  );
  assert.throws(
    () => loadAbgFallbackBundleFromFile(partialPath),
    /pluginTraversalObserverBindings.eval/u
  );
});

test("T-117 defaults bundle is data/config, not implicit runtime activation", () => {
  const bundle = loadAbgFallbackBundleFromFile(REFERENCE_FALLBACK_PATH);
  const { basis } = buildFpBasis();

  const selection = resolvePluginTraversalObserverBinding({
    traversalKind: "transform",
    vector: basis.graph.vectors[0],
    graphFunction: basis.graphFunction,
    roles: basis.job.roles,
    defaultsBundle: bundle,
    fallbackEnabled: true
  });
  assert.equal(selection.source, "abg_defaults");
  assert.throws(
    () =>
      resolvePluginTraversalObserverBinding({
        traversalKind: "transform",
        vector: basis.graph.vectors[0],
        graphFunction: basis.graphFunction,
        roles: basis.job.roles,
        defaultsBundle: bundle
      }),
    /requires a GTL qualifier or visible abg_defaults fallback bundle/u
  );
});
