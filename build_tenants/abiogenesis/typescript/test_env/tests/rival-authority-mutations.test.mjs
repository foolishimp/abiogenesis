import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import {
  applyInstalledTranscriptPrefix,
  buildRootCliScenario,
  installedCliPackageRoot,
  runInstalledCli,
  setupInstalledCliHarness,
  writeCliTransportRequest,
} from "../support/root-cli-environment.mjs";
import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const mutationEvidence = [];
let installedAbsenceEvidence = null;

function eventsFromBytes(bytes) {
  const text = bytes.toString("utf8").trim();
  return text.length === 0
    ? []
    : text.split(/\r?\n/u).map((line) => JSON.parse(line));
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
  const scenario = await buildRootCliScenario(
    harness,
    "b8-ingress-compiled-plan",
    (payload) => ({
      ...payload,
      compiledPlan: {
        kind: "CompiledCProgramPlan",
        result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
      },
    }),
    { catalogApplications: [] },
  );
  const setupPrefixBytes = await readFile(scenario.eventLogPath);
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "refused");
  assert.equal(outcome.kind, "public_invocation_refusal");
  assert.equal(outcome.code, "invalid_request");
  assert.match(outcome.message, /operation, variant, and payload/u);
  const refusedPrefixBytes = await readFile(scenario.eventLogPath);
  assert.deepEqual(refusedPrefixBytes, setupPrefixBytes);
  const refusedPrefixEvents = eventsFromBytes(refusedPrefixBytes);
  assert.equal(
    refusedPrefixEvents.some(
      (event) =>
        event.kind === "public_operation_admitted" &&
        event.payload.operationId === "abg.operation.run.invoke",
    ),
    false,
  );
  assert.equal(
    refusedPrefixEvents.some((event) => event.kind === "c_call_opened"),
    false,
  );
  mutationEvidence.push({
    mutation: "undeclared_compiled_plan",
    boundary: "public_ingress",
    disposition: outcome.disposition,
    refusalCode: outcome.code,
    runtimeInvocationAbsent: !Object.hasOwn(outcome, "runtimeInvocationRef"),
    setupPrefixUnchanged: true,
    runtimeEventsAbsent: true,
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
    { catalogApplications: [] },
  );
  const missingTargetSetupBytes = await readFile(missingTarget.eventLogPath);
  const missingTargetRun = await runInstalledCli(harness, missingTarget);
  assert.equal(missingTargetRun.exitCode, 2, missingTargetRun.stdout);
  const missingTargetOutcome = missingTargetRun.outcomes.at(-1);
  assert.equal(missingTargetOutcome.disposition, "refused");
  assert.equal(missingTargetOutcome.kind, "public_invocation_refusal");
  assert.equal(missingTargetOutcome.code, "invalid_request");
  assert.match(
    missingTargetOutcome.message,
    /operation, variant, and payload/u,
  );
  assert.deepEqual(
    await readFile(missingTarget.eventLogPath),
    missingTargetSetupBytes,
  );
  mutationEvidence.push({
    mutation: "missing_explicit_target",
    boundary: "public_ingress",
    disposition: missingTargetOutcome.disposition,
    refusalCode: missingTargetOutcome.code,
    hiddenDefaultActivated: false,
    invocationAdmissionAbsent: true,
    runOpenAbsent: true,
  });
});

test("B8 setup operations reject undeclared payload fields", async (context) => {
  const cases = [
    { label: "resolve", index: 1, mutate: (payload) => { payload.undeclaredResolve = true; } },
    { label: "install", index: 2, mutate: (payload) => { payload.undeclaredInstall = true; } },
    { label: "workspace", index: 3, mutate: (payload) => { payload.undeclaredWorkspace = true; } },
    { label: "workspace-roots", index: 3, mutate: (payload) => { payload.roots.undeclaredRoot = true; } },
    { label: "catalog", index: 4, mutate: (payload) => { payload.undeclaredCatalog = true; } },
    { label: "view", index: 5, mutate: (payload) => { payload.undeclaredView = true; } },
  ];
  for (const row of cases) {
    const harness = await setupInstalledCliHarness(context, root);
    const scenario = row.index < 4
      ? await buildRootCliScenario(
          harness,
          `b8-undeclared-${row.label}`,
          (payload) => payload,
          {
            catalogApplications: [],
            expectedSetupRefusalIndex: row.index,
            setupRequestTransform(request, index) {
              if (index === row.index) row.mutate(request.payload);
              return request;
            },
          },
        )
      : await buildRootCliScenario(
          harness,
          `b8-undeclared-${row.label}`,
          (payload) => payload,
          { catalogApplications: [] },
        );
    let outcome;
    if (row.index < 4) {
      assert.equal(scenario.setupRefusal.index, row.index);
      outcome = scenario.setupRefusal.outcome;
      assert.deepEqual(
        scenario.setupRefusal.prefixAfter,
        scenario.setupRefusal.prefixBefore,
        row.label,
      );
      assert.equal(scenario.setupOutcomes.length, row.index + 1, row.label);
    } else {
      const setupPrefixBytes = await readFile(scenario.eventLogPath);
      const mutatedRequest = structuredClone(
        scenario.executionTranscript[row.index - 4],
      );
      row.mutate(mutatedRequest.payload);
      await writeCliTransportRequest(scenario.transcriptPath, {
        acquisition: {
          kind: "reopen",
          closeHandoff:
            scenario.transportRuns[row.index - 1].transportResult.closeHandoff,
        },
        invocation: mutatedRequest,
      });
      const run = await runInstalledCli(harness, {
        ...scenario,
        transportRuns: scenario.transportRuns.slice(0, row.index),
      });
      assert.equal(run.exitCode, 2, run.stdout);
      outcome = run.transportResults.at(-1).outcome;
      const refusedPrefixBytes = await readFile(scenario.eventLogPath);
      assert.deepEqual(refusedPrefixBytes, setupPrefixBytes, row.label);
      const refusedPrefixEvents = eventsFromBytes(refusedPrefixBytes);
      assert.equal(
        refusedPrefixEvents.some(
          (event) =>
            event.kind === "public_operation_admitted" &&
            [
              "abg.operation.catalog.admit",
              "abg.operation.catalog.view",
              "abg.operation.run.invoke",
            ].includes(event.payload.operationId),
        ),
        false,
        row.label,
      );
      assert.equal(
        refusedPrefixEvents.some((event) => event.kind === "c_call_opened"),
        false,
        row.label,
      );
    }
    assert.equal(outcome.disposition, "refused");
    const refusal = outcome.kind === "public_invocation_refusal"
      ? outcome
      : outcome.result;
    assert.equal(refusal.code, "invalid_request");
    assert.match(
      refusal.message,
      row.label === "workspace-roots"
        ? /undeclared fields/u
        : /operation, variant, and payload/u,
    );
  }
  mutationEvidence.push({
    mutation: "setup_undeclared_payload_fields",
    boundary: "public_ingress",
    cases: cases.map((row) => row.label),
    allRefused: true,
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

  const scenario = await buildRootCliScenario(
    harness,
    "b8-disabled-hog",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "failed");
  assert.equal(outcome.result, null);
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
  });
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

  const scenario = await buildRootCliScenario(
    harness,
    "b8-post-admission-exception",
    (payload) => payload,
    { catalogApplications: [] },
  );
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
  mutationEvidence.push({
    mutation: "post_admission_validator_exception",
    boundary: "graph_validation",
    disposition: outcome.disposition,
    invocationAdmitted: true,
    refusalAdmitted: true,
    runOpenAbsent: true,
  });
});

test("B8 post-open judgment exceptions complete the admitted CCall spine", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "b8-post-open-judgment-exception",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const { operationContext, outcomes, publicApi } = await applyInstalledTranscriptPrefix(
    harness,
    scenario,
  );
  const judgmentPath = join(
    scenario.installedRoot,
    "build/code/src/product/builtin_semantics.js",
  );
  const judgmentSource = await readFile(judgmentPath, "utf8");
  const marker =
    "resolveJudgmentRelation: resolveConformanceJudgmentRelation,";
  assert.equal(judgmentSource.includes(marker), true);
  await writeFile(
    judgmentPath,
    judgmentSource.replace(
      marker,
      `resolveJudgmentRelation(predicateRef) {
        const relation = resolveConformanceJudgmentRelation(predicateRef);
        return relation === null ? null : {
          ...relation,
          evaluate() { throw new Error("post-open judgment mutation"); },
        };
      },`,
    ),
    "utf8",
  );
  await import(pathToFileURL(judgmentPath).href);
  await writeFile(judgmentPath, judgmentSource, "utf8");
  const outcome = await publicApi.applyRootPublicInvocation(
    operationContext,
    scenario.transcript.at(-1),
  );
  assert.equal(outcome.disposition, "blocked", JSON.stringify(outcome));
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    message: "Hello World",
    schemaVersion: "5.0.0",
  });
  assert.equal(outcome.cCallRef?.startsWith("c-call:sha256:"), true);
  assert.equal(outcome.resultRef?.startsWith("result://abiogenesis/"), true);
  assert.equal(outcome.judgmentRef?.startsWith("judgment://abiogenesis/"), true);
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
  assert.equal(
    cCallEvents.at(-1).payload.reasonRef,
    "diagnostic://abiogenesis/hog/judgment-evaluation-exception@5",
  );
  assert.equal(events.some((event) => event.kind === "runtime_failure_observed"), false);
  mutationEvidence.push({
    mutation: "post_open_judgment_exception",
    boundary: "judgment_relation",
    disposition: outcome.disposition,
    cCallSpineComplete: cCallEvents.length === 5,
    directRuntimeFailureAbsent: true,
  });
});

test("B8 HoG hides low-level completion and rejects a forged leaf port", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    hogExecute,
    store,
    program,
    graph,
    graphValidation,
    input,
    rawInput,
    implementationSet,
    implementationRow,
    leafPort,
    executionBasis,
    closureContract,
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
  const traversalStop = hog.traverse({
    program,
    graph,
    graphValidation,
    executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversalStop.kind, "traversal_stop_ref", JSON.stringify(traversalStop));
  const cursor = abg.admitInitialTraversalCursor(
    store,
    executionBasis,
    opened.scope,
    graph,
    graphValidation,
    traversalStop.cursor,
    runtimeBasis("cursor"),
  );
  assert.equal(cursor.kind, "traversal_cursor_admission", JSON.stringify(cursor));
  const completion = await hogExecute.completeExecutableTraversal({
    store,
    executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graph,
    traversalStop,
    implementationSet,
    implementationResolution: implementationRow,
    leafPort: { ...leafPort },
    input,
    inputDigest: rawInput.subjectDigest,
    closureContract,
    clock: {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/b8/forged-leaf-port/hog",
    },
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

test("B8 post-install implementation substitution is refused before execution", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const scenario = await buildRootCliScenario(
    harness,
    "b8-post-install-substitution",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const { operationContext, outcomes, publicApi } = await applyInstalledTranscriptPrefix(
    harness,
    scenario,
  );
  assert.deepEqual(outcomes.map((outcome) => outcome.disposition), [
    "succeeded", "succeeded", "succeeded", "succeeded", "succeeded",
    "succeeded",
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
    `${originalImplementation.slice(0, functionStart)}export function realizeHelloWorld() { throw new Error('substituted leaf'); }\n`,
    "utf8",
  );
  const prefixBytesBeforeRun = await readFile(scenario.eventLogPath);
  const outcome = await publicApi.applyRootPublicInvocation(
    operationContext,
    scenario.transcript.at(-1),
  );
  assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  assert.equal(outcome.result.kind, "public_operation_refusal");
  assert.equal(outcome.result.code, "target_mismatch");
  assert.equal(
    outcome.diagnosticRef,
    "diagnostic://abiogenesis/public/target_mismatch@5",
  );
  assert.equal(outcome.runId, null);
  assert.equal(outcome.cCallRef, null);
  assert.equal(outcome.resultRef, null);
  assert.equal(outcome.judgmentRef, null);
  assert.equal(outcome.replayAgreement, null);
  const prefixBytesAfterRun = await readFile(scenario.eventLogPath);
  assert.deepEqual(prefixBytesAfterRun, prefixBytesBeforeRun);
  const prefixEventsAfterRun = eventsFromBytes(prefixBytesAfterRun);
  assert.equal(
    prefixEventsAfterRun.some((event) => event.kind === "invocation_admitted"),
    false,
  );
  assert.equal(
    prefixEventsAfterRun.some((event) => event.kind === "c_call_opened"),
    false,
  );
  mutationEvidence.push({
    mutation: "post_install_implementation_substitution",
    boundary: "installed_product_content",
    disposition: outcome.disposition,
    diagnosticRef: outcome.diagnosticRef,
    runtimeExecutionAbsent: true,
  });
});

test("B8 mutation evidence ledger is complete", async () => {
  assert.notEqual(installedAbsenceEvidence, null);
  assert.deepEqual(mutationEvidence.map((row) => row.mutation), [
    "undeclared_compiled_plan",
    "missing_explicit_target",
    "setup_undeclared_payload_fields",
    "disabled_hog_with_callable_rival",
    "copied_private_execution_basis",
    "post_admission_validator_exception",
    "post_open_judgment_exception",
    "forged_leaf_execution_port",
    "post_install_implementation_substitution",
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
