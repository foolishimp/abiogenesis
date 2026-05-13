// Validates: B-032
// Asserts ABG admittance contract for workspace_installation_admitted runtime event:
// happy-path admission and required-field rejection.

import test from "node:test";
import assert from "node:assert/strict";

import {
  RUNTIME_EVENT_KIND_VALUES,
  WORKSPACE_INSTALLATION_RESULT_VALUES,
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/index.js";

function validInstallEvent(overrides = {}) {
  return {
    kind: "workspace_installation_admitted",
    installResult: "installed",
    targetRoot: "/tmp/abg-b032/workspace",
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "3.7.1-rc.2",
    resolvedRuntimeRef: "package:@abiogenesis/typescript-tenant@3.7.1-rc.2",
    installManifestPath: "/tmp/abg-b032/workspace/.abiogenesis/install-manifest.json",
    installerEcosystem: "abg_typescript",
    causationEventRefs: [],
    correlationId: "abg-install://b032-test",
    ...overrides
  };
}

test("B-032 workspace_installation_admitted is a published runtime event kind", () => {
  assert.equal(
    RUNTIME_EVENT_KIND_VALUES.includes("workspace_installation_admitted"),
    true,
    "RUNTIME_EVENT_KIND_VALUES must include workspace_installation_admitted"
  );
});

test("B-032 WORKSPACE_INSTALLATION_RESULT_VALUES ships only producer-backed dispositions", () => {
  assert.deepEqual(
    [...WORKSPACE_INSTALLATION_RESULT_VALUES],
    ["installed"],
    "Only 'installed' has a producer today; other dispositions must wait for their producer"
  );
});

test("B-032 assertRuntimeEvent admits a fully-formed install event", () => {
  assert.doesNotThrow(() => assertRuntimeEvent(validInstallEvent()));
});

test("B-032 assertRuntimeEvent rejects unsupported installResult", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ installResult: "rejected" })),
    /installResult/
  );
});

test("B-032 assertRuntimeEvent rejects empty targetRoot", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ targetRoot: "" })),
    /targetRoot/
  );
});

test("B-032 assertRuntimeEvent rejects empty packageName", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ packageName: "" })),
    /packageName/
  );
});

test("B-032 assertRuntimeEvent rejects empty packageVersion", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ packageVersion: "" })),
    /packageVersion/
  );
});

test("B-032 assertRuntimeEvent rejects empty resolvedRuntimeRef", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ resolvedRuntimeRef: "" })),
    /resolvedRuntimeRef/
  );
});

test("B-032 assertRuntimeEvent rejects empty installManifestPath", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ installManifestPath: "" })),
    /installManifestPath/
  );
});

test("B-032 assertRuntimeEvent rejects empty installerEcosystem", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ installerEcosystem: "" })),
    /installerEcosystem/
  );
});

test("B-032 assertRuntimeEvent rejects non-array causationEventRefs", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ causationEventRefs: "not-an-array" })),
    /causationEventRefs/
  );
});

test("B-032 assertRuntimeEvent rejects empty correlationId", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ correlationId: "" })),
    /correlationId/
  );
});

test("B-032 assertRuntimeEvent rejects non-string causationEventRefs entries", () => {
  assert.throws(
    () => assertRuntimeEvent(validInstallEvent({ causationEventRefs: [42] })),
    /causationEventRefs/
  );
});
