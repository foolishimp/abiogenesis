import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import { installedCliPackageRoot, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mutationEvidence = [];
let installedAbsenceEvidence = null;

async function jsText(rootPath) {
  const values = [];
  const visit = async (path) => {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const absolute = join(path, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      if (entry.isFile() && entry.name.endsWith(".js")) {
        values.push(await readFile(absolute, "utf8"));
      }
    }
  };
  await visit(rootPath);
  return values.join("\n");
}

test("B8 installed package exposes no retired runtime authority", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const packageRoot = installedCliPackageRoot(harness);
  const installedSource = await jsText(join(packageRoot, "build/code/src"));
  for (const prohibited of [
    "CompiledCProgramPlan",
    "CompiledExecutionDeclaration",
    "publicControlLoop",
    "runtime-program-catalog",
  ]) {
    assert.equal(installedSource.includes(prohibited), false, prohibited);
  }
  const installedAbg = await import(
    `${pathToFileURL(join(packageRoot, "build/code/src/abg/index.js")).href}?b8=exports`
  );
  assert.equal("admitRuntimeEvent" in installedAbg, false);
  installedAbsenceEvidence = {
    compiledPlan: !installedSource.includes("CompiledCProgramPlan"),
    compiledExecutionDeclaration: !installedSource.includes("CompiledExecutionDeclaration"),
    publicControlLoop: !installedSource.includes("publicControlLoop"),
    runtimeProgramCatalog: !installedSource.includes("runtime-program-catalog"),
    rawEventWriterExported: "admitRuntimeEvent" in installedAbg,
  };
});

test("B8 an exact rehydrated ExecutionBasis enters the installed ABG path", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const copiedBasis = structuredClone(environment.executionBasis);
  const eventCount = environment.store.readAll().length;
  const open = environment.abg.openCall(
    environment.store,
    copiedBasis,
    {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/b8/copied-basis",
      causationEventRefs: [],
    },
  );
  assert.equal(open.kind, "open_call_admission", JSON.stringify(open));
  assert.equal(environment.store.readAll().length, eventCount + 3);
  mutationEvidence.push({
    mutation: "exact_rehydrated_execution_basis",
    boundary: "abg_open_call",
    disposition: open.disposition,
    runId: open.run.runId,
    runtimeEventsAdded: environment.store.readAll().length - eventCount,
  });
});

test("B8 HoG hides low-level completion and rejects a forged leaf port", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    store,
    program,
    graphFunction,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationSet,
    implementationRow,
    leafPort,
    executionBasis,
    executionBasisAdmission,
    closureContract,
    workspaceBinding,
    artifactTruth,
  } = environment;
  assert.equal("completeExecutableTraversal" in hog, false);
  assert.equal("constructChildTraversalPreparationPort" in hog, false);
  assert.equal("isChildTraversalPreparationPort" in hog, false);
  const runtimeBasis = (stage) => ({
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: `correlation://t286/b8/forged-leaf-port/${stage}`,
    causationEventRefs: [],
  });
  const opened = abg.openCall(store, executionBasis, runtimeBasis("open"));
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const completion = await hog.executeGraphTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionBasisAdmission.interactionSet,
    leafPort: { ...leafPort },
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t286/b8/forged-leaf-port/hog",
  });
  assert.equal(completion.disposition, "failed", JSON.stringify(completion));
  assert.equal(
    completion.diagnosticRef,
    "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
  );
  assert.equal(store.readAll().some((event) => event.kind === "c_call_opened"), false);
  mutationEvidence.push({
    mutation: "forged_leaf_execution_port",
    boundary: "leaf_execution_port",
    disposition: completion.disposition,
    packageExportAbsent: true,
    cCallAbsent: true,
  });
});
