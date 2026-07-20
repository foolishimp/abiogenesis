import assert from "node:assert/strict";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import {
  applyInstalledTranscriptPrefix,
  buildRootCliScenario,
  installedCliPackageRoot,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";
import { evaluateAbi5Root } from "../support/root-governor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mutationEvidence = [];
let installedAbsenceEvidence = null;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

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

async function rootVerdict(harness, scenario, outcomes) {
  return evaluateAbi5Root({
    candidateBasis: harness.candidateBasis,
    artifactPath: harness.artifactPath,
    transcript: scenario.transcript,
    outcomes,
    eventLogPath: scenario.eventLogPath,
  });
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

test("B8 explicit invocation schema refuses an injected compiled-plan carrier", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(harness, "b8-ingress-compiled-plan", (payload) => ({
    ...payload,
    compiledPlan: {
      kind: "CompiledCProgramPlan",
      result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
    },
  }));
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "refused");
  assert.equal(outcome.result.code, "invalid_request");
  assert.match(outcome.result.message, /compiledPlan/u);
  assert.equal(await exists(scenario.eventLogPath), false);
  mutationEvidence.push({
    mutation: "undeclared_compiled_plan",
    boundary: "public_ingress",
    disposition: outcome.disposition,
    refusalCode: outcome.result.code,
    runtimeInvocationAbsent: outcome.runtimeInvocationRef === null,
    durableEventLogAbsent: !(await exists(scenario.eventLogPath)),
  });

  const operationsPath = join(
    installedCliPackageRoot(harness),
    "build/code/src/public/operations.js",
  );
  const operationsSource = await readFile(operationsPath, "utf8");
  const runMarker = "async function applyRunInvoke(context, invocation, rawRequest) {";
  assert.equal(operationsSource.includes(runMarker), true);
  await writeFile(
    operationsPath,
    operationsSource.replace(
      runMarker,
      `${runMarker}\n    if (!("programRef" in invocation.payload)) invocation = { ...invocation, payload: { ...invocation.payload, programRef: "program://abiogenesis/conformance/hello-world@5" } };`,
    ),
    "utf8",
  );
  const missingTarget = await buildRootCliScenario(
    harness,
    "b8-missing-explicit-target",
    ({ programRef: _programRef, ...payload }) => payload,
  );
  const missingTargetRun = await runInstalledCli(harness, missingTarget);
  assert.equal(missingTargetRun.exitCode, 2, missingTargetRun.stdout);
  const missingTargetOutcome = missingTargetRun.outcomes.at(-1);
  assert.equal(missingTargetOutcome.disposition, "refused");
  assert.equal(missingTargetOutcome.result.code, "owner_refusal");
  assert.match(missingTargetOutcome.result.message, /raw caller-request admission/u);
  const missingTargetEvents = (await readFile(missingTarget.eventLogPath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.equal(missingTargetEvents.some((event) => event.kind === "invocation_admitted"), false);
  assert.equal(missingTargetEvents.some((event) => event.kind === "run_segment_opened"), false);
  mutationEvidence.push({
    mutation: "missing_explicit_target",
    boundary: "abg_invocation_admission",
    disposition: missingTargetOutcome.disposition,
    refusalCode: missingTargetOutcome.result.code,
    hiddenDefaultActivated: true,
    invocationAdmissionAbsent: true,
    runOpenAbsent: true,
  });
});

test("B8 disabled HoG cannot fall through to a callable compiled-plan rival", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const packageRoot = installedCliPackageRoot(harness);
  const traversalPath = join(packageRoot, "build/code/src/hog/traversal.js");
  const traversalSource = await readFile(traversalPath, "utf8");
  const marker = "export function traverse(input) {";
  assert.equal(traversalSource.includes(marker), true);
  await writeFile(
    traversalPath,
    traversalSource.replace(marker, `${marker}\n    throw new Error("disabled direct HoG mutation");`),
    "utf8",
  );
  const rivalPath = join(packageRoot, "build/code/src/hog/compiled-plan-rival.js");
  await writeFile(
    rivalPath,
    "export function executeCompiledPlan() { return { kind: 'hello_world_output', schemaVersion: '5.0.0', message: 'Hello World' }; }\n",
    "utf8",
  );
  const rival = await import(`${pathToFileURL(rivalPath).href}?mutation=callable`);
  assert.equal(rival.executeCompiledPlan().message, "Hello World");

  const scenario = await buildRootCliScenario(harness, "b8-disabled-hog");
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "failed");
  assert.equal(outcome.result, null);
  const governor = await rootVerdict(harness, scenario, run.outcomes);
  assert.equal(governor.disposition, "root_red");
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.equal(events.some((event) => event.kind === "runtime_failure_observed"), true);
  assert.equal(events.some((event) => event.kind === "c_call_opened"), false);
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  assert.equal(JSON.stringify(events).includes("executeCompiledPlan"), false);
  mutationEvidence.push({
    mutation: "disabled_hog_with_callable_rival",
    boundary: "executor",
    disposition: outcome.disposition,
    runtimeFailureAdmitted: events.some((event) => event.kind === "runtime_failure_observed"),
    cCallAbsent: !events.some((event) => event.kind === "c_call_opened"),
    rivalResultAbsent: outcome.result === null,
    falseClosureAbsent: !events.some((event) => event.kind === "run_closed"),
    rootGovernorDisposition: governor.disposition,
  });
});

test("B8 a renamed controller can forge output but cannot satisfy the installed root", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const operationsPath = join(
    installedCliPackageRoot(harness),
    "build/code/src/public/operations.js",
  );
  const operationsSource = await readFile(operationsPath, "utf8");
  const marker = "export async function applyRootPublicInvocation(context, invocation) {";
  assert.equal(operationsSource.includes(marker), true);
  const forgedOutcome = `
    if (invocation.operationId === "abg.operation.run.invoke") {
        return {
            kind: "public_outcome", schemaVersion: "5.0.0",
            operationId: invocation.operationId, variant: invocation.variant,
            invocationRef: invocation.invocationRef, runtimeInvocationRef: "invocation://fixture/controller",
            disposition: "succeeded", outcomeDigest: "sha256:${"0".repeat(64)}",
            result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
            diagnosticRef: null, runId: "run://fixture/controller", graphCallId: "graph-call://fixture/controller",
            frameId: "frame://fixture/controller", cCallRef: "c-call:sha256:${"1".repeat(64)}",
            resultRef: "result://fixture/controller", judgmentRef: "judgment://fixture/controller",
            outputContractRef: "contract://abiogenesis/conformance/hello-output@5",
            admittedResultContractRef: "contract://abiogenesis/conformance/hello-output@5",
            replayRef: "replay://fixture/controller", replayDigest: "sha256:${"2".repeat(64)}",
            replayAgreement: true, eventLogPath: invocation.payload.eventLogPath,
            eventLogDigest: "sha256:${"3".repeat(64)}", eventLogByteLength: 16,
            durableEventCount: 1
        };
    }`;
  await writeFile(
    operationsPath,
    operationsSource.replace(marker, `${marker}${forgedOutcome}`),
    "utf8",
  );

  const scenario = await buildRootCliScenario(harness, "b8-renamed-controller");
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "succeeded");
  assert.equal(outcome.result.message, "Hello World");
  assert.equal(await exists(scenario.eventLogPath), false);
  await mkdir(dirname(scenario.eventLogPath), { recursive: true });
  await writeFile(scenario.eventLogPath, "not-an-abg-event\n", "utf8");
  const governor = await rootVerdict(harness, scenario, run.outcomes);
  assert.equal(governor.disposition, "root_red");
  mutationEvidence.push({
    mutation: "renamed_controller_forged_output",
    boundary: "public_projection",
    projectedDisposition: outcome.disposition,
    matchingOutputForged: outcome.result.message === "Hello World",
    arbitraryFileCannotSubstituteForAbgTruth: governor.disposition === "root_red",
    installedRootSatisfied: governor.disposition === "root_satisfied",
  });
});

test("B8 copied ExecutionBasis cannot enter the installed HoG or ABG path", async (context) => {
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
  assert.equal(open.kind, "open_call_refusal");
  assert.equal(open.code, "execution_basis_not_admitted");
  assert.equal(environment.store.readAll().length, eventCount);
  mutationEvidence.push({
    mutation: "copied_private_execution_basis",
    boundary: "abg_open_call",
    disposition: open.disposition,
    refusalCode: open.code,
    runtimeEventsAdded: environment.store.readAll().length - eventCount,
  });
});

test("B8 post-admission exceptions become replayable ABG refusal truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const graphValidatorPath = join(
    installedCliPackageRoot(harness),
    "build/code/src/validator/graph.js",
  );
  const graphValidatorSource = await readFile(graphValidatorPath, "utf8");
  const marker = "export function validateGraph(graph, programValidation, graphFunction, basis) {";
  assert.equal(graphValidatorSource.includes(marker), true);
  await writeFile(
    graphValidatorPath,
    graphValidatorSource.replace(
      marker,
      `${marker}\n    throw new Error("post-admission graph validation mutation");`,
    ),
    "utf8",
  );

  const scenario = await buildRootCliScenario(harness, "b8-post-admission-exception");
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "refused");
  assert.equal(outcome.result, null);
  assert.equal(
    outcome.diagnosticRef,
    "diagnostic://abiogenesis/operation-application/graph_validation-exception@5",
  );
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.equal(events.some((event) => event.kind === "invocation_admitted"), true);
  assert.equal(events.some((event) => event.kind === "invocation_refused"), true);
  assert.equal(events.some((event) => event.kind === "run_segment_opened"), false);
  const governor = await rootVerdict(harness, scenario, run.outcomes);
  assert.equal(governor.disposition, "root_red");
  mutationEvidence.push({
    mutation: "post_admission_validator_exception",
    boundary: "graph_validation",
    disposition: outcome.disposition,
    invocationAdmitted: true,
    refusalAdmitted: true,
    runOpenAbsent: true,
    rootGovernorDisposition: governor.disposition,
  });
});

test("B8 installed leaf exceptions and malformed returns complete the failure spine", async (context) => {
  const cases = [
    {
      label: "exception",
      failureClass: "implementation_exception",
      source: "export function realizeHelloWorld() { throw new Error('leaf mutation'); }\n",
    },
    {
      label: "malformed",
      failureClass: "malformed_return",
      source: "export function realizeHelloWorld() { return { kind: 'malformed_leaf_candidate' }; }\n",
    },
    {
      label: "sparse-evidence",
      failureClass: "malformed_return",
      source: "export function realizeHelloWorld() { return { kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success', evidenceCandidates: Array(1), resultCandidate: { kind: 'hello_world_output', schemaVersion: '5.0.0', message: 'Hello World' } }; }\n",
    },
    {
      label: "missing-message",
      failureClass: "malformed_return",
      source: `export function realizeHelloWorld() { return { kind: 'leaf_realization_candidate', schemaVersion: '5.0.0', disposition: 'success', evidenceCandidates: [{ kind: 'deterministic_evidence_candidate', schemaVersion: '5.0.0', implementationRef: 'implementation://abiogenesis/conformance/hello-world-fd@5', inputDigest: 'sha256:${"0".repeat(64)}', outputDigest: 'sha256:${"1".repeat(64)}' }], resultCandidate: { kind: 'hello_world_output', schemaVersion: '5.0.0' } }; }\n`,
    },
  ];
  for (const row of cases) {
    const harness = await setupInstalledCliHarness(context, root);
    const scenario = await buildRootCliScenario(harness, `b8-leaf-${row.label}`);
    const { operationContext, outcomes, publicApi } = await applyInstalledTranscriptPrefix(
      harness,
      scenario,
    );
    assert.deepEqual(outcomes.map((outcome) => outcome.disposition), [
      "succeeded", "succeeded", "succeeded", "succeeded", "succeeded",
    ]);
    const implementationPath = join(
      scenario.installedRoot,
      "build/code/src/implementation/hello_world.js",
    );
    const originalImplementation = await readFile(implementationPath, "utf8");
    const functionStart = originalImplementation.indexOf("export function realizeHelloWorld");
    assert.notEqual(functionStart, -1);
    await writeFile(
      implementationPath,
      `${originalImplementation.slice(0, functionStart)}${row.source}`,
      "utf8",
    );
    const outcome = await publicApi.applyRootPublicInvocation(
      operationContext,
      scenario.transcript.at(-1),
    );
    assert.equal(outcome.disposition, "blocked", JSON.stringify(outcome));
    assert.equal(outcome.result.kind, "hello_world_failure");
    assert.equal(outcome.result.failureClass, row.failureClass);
    assert.equal(
      outcome.admittedResultContractRef,
      "contract://abiogenesis/conformance/hello-failure@5",
    );
    assert.equal(outcome.cCallRef?.startsWith("c-call:sha256:"), true);
    assert.equal(outcome.resultRef?.startsWith("result://abiogenesis/"), true);
    assert.equal(outcome.judgmentRef?.startsWith("judgment://abiogenesis/"), true);
    assert.equal(outcome.replayAgreement, true);
    const governor = await rootVerdict(harness, scenario, [...outcomes, outcome]);
    assert.equal(governor.disposition, "root_red");

    const events = (await readFile(scenario.eventLogPath, "utf8"))
      .trim().split(/\r?\n/u).map((line) => JSON.parse(line));
    const cCallEvents = events.filter((event) => event.aggregateId === outcome.cCallRef);
    assert.deepEqual(cCallEvents.map((event) => event.kind), [
      "c_call_opened",
      "c_call_fibre_selected",
      "c_call_evidenced",
      "c_call_result_admitted",
      "c_call_judged",
    ]);
    assert.equal(cCallEvents.at(-2).payload.resultClass, "failure");
    assert.equal(cCallEvents.at(-1).payload.judgment, "blocked");
    assert.equal(events.some((event) => event.kind === "runtime_failure_observed"), false);
    assert.equal(events.some((event) => event.kind === "run_closed"), false);
    const evidence = {
      mutation: `leaf_${row.label}`,
      boundary: "leaf_realization",
      disposition: outcome.disposition,
      failureClass: outcome.result.failureClass,
      admittedFailureContract: outcome.admittedResultContractRef,
      cCallSpineComplete: cCallEvents.length === 5,
      directRuntimeFailureAbsent: true,
      falseRootClosureAbsent: true,
      rootGovernorDisposition: governor.disposition,
    };
    mutationEvidence.push(evidence);
  }

  assert.notEqual(installedAbsenceEvidence, null);
  assert.deepEqual(mutationEvidence.map((row) => row.mutation), [
    "undeclared_compiled_plan",
    "missing_explicit_target",
    "disabled_hog_with_callable_rival",
    "renamed_controller_forged_output",
    "copied_private_execution_basis",
    "post_admission_validator_exception",
    "leaf_exception",
    "leaf_malformed",
    "leaf_sparse-evidence",
    "leaf_missing-message",
  ]);
  const proofDirectory = join(root, "test_env/proof");
  await mkdir(proofDirectory, { recursive: true });
  await writeFile(
    join(proofDirectory, "abi5-root-rival-authority-mutations.json"),
    `${JSON.stringify({
      kind: "abi5_root_rival_authority_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      result: "real_owner_boundary_mutations_refused_or_non_closing",
      sourceImportUsed: false,
      mutations: mutationEvidence,
      installedAbsence: installedAbsenceEvidence,
    }, null, 2)}\n`,
    "utf8",
  );
});
