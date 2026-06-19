// Validates: REQ-F-ODDSDLC-040
// Regression: TS installer must emit workspace_installation_admitted runtime event
// (Python-line genesis_installed parity).

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  installOddSdlcTypescript,
  resolveDefaultAbgPackageSourceRoot
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");

function makeTargetWorkspace(label) {
  const targetRoot = mkdtempSync(path.join(tmpdir(), `odd-sdlc-install-event-${label}-`));
  mkdirSync(path.join(targetRoot, "specification/requirements"), { recursive: true });
  writeFileSync(
    path.join(targetRoot, "README.md"),
    ["# Installed Workspace", "", "REQ-INSTALL-001: install must emit a runtime event."].join("\n"),
    "utf8"
  );
  return targetRoot;
}

function readEventLog(targetRoot) {
  const eventLogPath = path.join(targetRoot, ".ai-workspace/events/events.jsonl");
  assert.equal(existsSync(eventLogPath), true, `events.jsonl does not exist at ${eventLogPath}`);
  const text = readFileSync(eventLogPath, "utf8");
  const lines = text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.map((line) => JSON.parse(line));
}

test("install emits workspace_installation_admitted runtime event", async () => {
  const targetRoot = makeTargetWorkspace("admitted");
  const installedPackageName = "odd-sdlc-install-event-admitted";

  const outcome = await installOddSdlcTypescript({
    targetRoot,
    installedPackageName,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: resolveDefaultAbgPackageSourceRoot(PACKAGE_ROOT)
  });

  assert.equal(outcome.kind, "installed", `install rejected: ${JSON.stringify(outcome)}`);

  const events = readEventLog(targetRoot);
  const installEvents = events.filter(
    (event) => event.kind === "workspace_installation_admitted"
  );

  assert.equal(
    installEvents.length,
    1,
    `expected exactly one install event, got ${installEvents.length}`
  );

  const installEvent = installEvents[0];
  assert.equal(installEvent.installResult, "installed");
  assert.equal(installEvent.targetRoot, targetRoot);
  assert.equal(installEvent.installerEcosystem, "odd_sdlc_typescript");
  assert.equal(typeof installEvent.packageName, "string");
  assert(
    installEvent.packageName.length > 0,
    "packageName must be non-empty"
  );
  assert.equal(typeof installEvent.packageVersion, "string");
  assert(
    installEvent.packageVersion.length > 0,
    "packageVersion must be non-empty"
  );
  assert(
    installEvent.resolvedRuntimeRef.startsWith("package:"),
    `resolvedRuntimeRef should be a package ref, got ${installEvent.resolvedRuntimeRef}`
  );
  assert.equal(installEvent.installManifestPath, outcome.installManifestPath);
  assert.deepEqual(installEvent.causationEventRefs, []);
  assert(
    installEvent.correlationId.startsWith("odd-sdlc-install://"),
    `correlationId should be an install correlation ref, got ${installEvent.correlationId}`
  );
});

test("install event is admittable as a typed RuntimeEvent on replay", async () => {
  const { assertRuntimeEvent } = await import(
    "@abiogenesis/typescript-tenant"
  );

  const targetRoot = makeTargetWorkspace("replay");
  const installedPackageName = "odd-sdlc-install-event-replay";

  const outcome = await installOddSdlcTypescript({
    targetRoot,
    installedPackageName,
    packageSourceRoot: PACKAGE_ROOT,
    abgPackageSourceRoot: resolveDefaultAbgPackageSourceRoot(PACKAGE_ROOT)
  });

  assert.equal(outcome.kind, "installed");

  const events = readEventLog(targetRoot);
  const installEvent = events.find(
    (event) => event.kind === "workspace_installation_admitted"
  );

  assert(installEvent, "install event missing from events.jsonl");
  // assertRuntimeEvent throws if any field rule is violated;
  // pass-through proves the emitted event conforms to ABG's typed contract.
  assertRuntimeEvent(installEvent);
});
