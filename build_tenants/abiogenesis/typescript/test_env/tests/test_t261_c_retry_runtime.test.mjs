// Validates: T-261; REQ-L-GTL3-C-ALGEBRA-008/-016;
// REQ-R-ABG3-CCALL-004/-008/-009; REQ-R-ABG3-RETRY-001..-009.

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  typedInterface,
  typedNode
} from "../../build/semantic/code/src/gtl/m01/algebra/index.js";
import {
  constructEnvRef,
  constructGraph,
  constructGraphFunction,
  constructGraphVector,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  graphFunctionDeclarations,
  graphVectorDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  hogProgramRefDeclarationEntry
} from "../../build/semantic/code/src/gtl/m01/contracts/execution_declaration_builders.js";
import {
  constructContractRef,
  constructGtlLibraryEntryDeclaration,
  constructJob,
  constructModule
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  compileCRetryPlan
} from "../../build/semantic/code/src/abg/m03/contracts/c_retry.js";
import {
  deriveCRetryPolicyProjection
} from "../../build/semantic/code/src/abg/m03/contracts/c_retry_policy.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  resolveCRetry
} from "../../build/semantic/code/src/abg/m03/runner/c_retry_runtime.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";

const ENTRY_REF = "catalog-entry://t261/system/repair";
const MODULE_REF = "gtl-module://t261/repair";

function node(name) {
  return constructNode({
    id: `node://t261/${name.toLowerCase()}`,
    name,
    schema: { kind: "symbolic", ref: `schema://t261/${name.toLowerCase()}` },
    markov: ["boundary://t261/retry"],
    assetSurface: {
      kind: `t261_${name.toLowerCase()}`,
      standardsRefs: ["REQ-L-GTL3-C-ALGEBRA-008"],
      proofObligationRefs: ["proof://t261/retry-runtime"]
    },
    tags: ["t261"]
  });
}

function typedBoundary(nodes) {
  return typedInterface(
    ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
  );
}

function fixture({ budget = 2 } = {}) {
  const input = node("RepairInput");
  const output = node("RepairOutput");
  const inputCarrier = cInterfaceCarrier(typedBoundary([input]));
  const outputCarrier = cInterfaceCarrier(typedBoundary([output]));
  const leaf = C.of({
    input: inputCarrier,
    output: outputCarrier,
    stageRole: "repair_projection",
    fibre: "F_P",
    armId: "arm://t261/repair-projection",
    resultBearing: true
  });
  const program = declareCProgram({
    programRef: `program://t261/repair/${String(budget)}`,
    term: C.retry(leaf, budget),
    proportionalityClass: "P1"
  });
  const vectorSeed = constructGraphVector({
    id: `graph-vector://t261/repair/${String(budget)}`,
    name: "t261.repair",
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: graphVectorDeclarations([]),
    tags: ["t261"]
  });
  const composition = constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${vectorSeed.id}`,
    hookRef: `hook://${vectorSeed.id}/composition`,
    hostGraphFunctionRef: "graph-function://t261/repair",
    hostGraphVectorRef: vectorSeed.id,
    hostSourceNodeRefs: [input.id],
    hostTargetNodeRef: output.id,
    hostTargetSchemaRef: output.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: vectorSeed.id
    }),
    regimes: [
      Object.freeze({
        bindingRef: `regime-binding://${vectorSeed.id}/fp`,
        stageRole: "transform",
        regime: "F_P",
        role: "repair",
        order: 0,
        authority: "evidence",
        inputCarrierRefs: [input.id],
        outputCarrierRefs: [output.id],
        evidenceRefs: ["evidence://t261/composition"]
      })
    ],
    standardsContextRefs: ["standard://t261/c-retry"],
    policyContextRefs: ["policy://t261/retry"],
    carrierContextRefs: [input.id, output.id],
    assuranceContextRefs: ["assurance://t261/retry"],
    closureContractRef: `closure://${vectorSeed.id}`
  });
  const vector = constructGraphVector({
    ...vectorSeed,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef),
      ...composition.entries
    ])
  });
  const graph = constructGraph({
    name: "t261.repair-graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t261"]
  });
  const graphFunction = constructGraphFunction({
    id: "graph-function://t261/repair",
    name: "t261.repair",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t261/repair",
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["t261", "public"]
  });
  const module = constructModule({
    name: "t261.generic-retry",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: "t261-repair-job",
        contracts: [
          constructContractRef({
            kind: "graph_function",
            targetId: graphFunction.id
          })
        ],
        roles: [],
        tags: ["t261"],
        policyHooks: emptySerializedAttrs()
      })
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const handoffOutcome = compileGraphVectorExecutionHandoff({
    graphFunction,
    graphVector: vector,
    graphFunctions: module.graphFunctions,
    module,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle(),
    admittedTenantConformanceManifest: null
  });
  assert.equal(
    handoffOutcome.status,
    "published_startup_blocked",
    JSON.stringify(handoffOutcome.diagnostics)
  );
  return {
    budget,
    input,
    output,
    vector,
    graphFunction,
    module,
    program,
    handoffOutcome
  };
}

function admittedCatalog(value) {
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t261/system/repair",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t261",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: value.graphFunction.id,
    interfaceRef: "interface://t261/repair",
    sourceContractRef: "contract://t261/repair-input",
    targetContractRef: "contract://t261/repair-output",
    contextRefs: ["context://t261/retry"],
    authorityRefs: ["REQ-L-GTL3-C-ALGEBRA-008"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t261/fixture"],
    readinessRefs: ["readiness://t261/ready"],
    proofRefs: ["proof://t261/retry-runtime"],
    policyRefs: ["policy://t261/default"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t261",
      bindingId: "binding://t261",
      catalogId: "catalog://t261",
      resolvedLockRef: "lock://t261",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module: value.module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t261/catalog-bound"],
      correlationId: "correlation://t261/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  return admission.basis;
}

function attemptOutcome(request, disposition, overrides = {}) {
  const completed = disposition === "completed";
  const runtimeFailed = disposition === "runtime_failed";
  return Object.freeze({
    kind: "c_retry_attempt_outcome",
    planRef: request.planRef,
    attempt: request.attempt,
    attemptRunRef: request.attemptRunRef,
    cCallRef: request.cCallRef,
    attemptManifestRef: request.attemptManifestRef,
    attemptStateRef: request.attemptStateRef,
    disposition,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: completed
      ? `payload://t261/output/${String(request.attempt)}`
      : null,
    responseContractRef: completed ? request.outputCarrierRef : null,
    failureClass: runtimeFailed ? "transport_failure" : null,
    failureSignalRef: runtimeFailed ? "signal://t261/transport" : null,
    reasonRef: completed
      ? null
      : runtimeFailed
        ? "reason://t261/transport"
        : `reason://t261/${disposition}`,
    evidenceRefs: [`evidence://t261/attempt/${String(request.attempt)}`],
    ...overrides
  });
}

function invocation(value, catalogBasis, options = {}) {
  const binding = value.handoffOutcome.handoff.retryBinding;
  assert.notEqual(binding, null);
  const plan = options.plan ?? compileCRetryPlan({
    binding,
    selectedCatalogEntryRef: ENTRY_REF
  });
  const emitted = [];
  return {
    emitted,
    input: {
      kind: "c_retry_invocation",
      binding,
      plan,
      catalogBasis,
      selectedCatalogEntryRef: options.selectedCatalogEntryRef ?? ENTRY_REF,
      parentBasisId: "basis://t261/parent",
      parentGraphFunctionRef: value.graphFunction.id,
      parentGraphCallId: "graph-call://t261/parent",
      parentFrameId: "frame://t261/parent",
      edge: value.vector.id,
      vectorIndex: 0,
      taskOrdinal: null,
      inputPayloadRef: "payload://t261/repair-input",
      inputStateRef: "state://t261/repair-input/v1",
      replayEvents: options.replayEvents ?? [],
      emit(events) {
        emitted.push(...events);
      },
      invokeAttempt: options.invokeAttempt
    }
  };
}

test("T-261 compiles one direct retry binding and exact shared policy", () => {
  const value = fixture();
  const handoff = value.handoffOutcome.handoff;
  const policy = deriveCRetryPolicyProjection();

  assert.equal(handoff.programDisposition, "retry_attempt_family");
  assert.equal(handoff.workflowLiftBinding, null);
  assert.equal(handoff.normalizedProgram.retry.maxAttempts, 2);
  assert.equal(handoff.normalizedProgram.retry.stage.stageRole, "repair_projection");
  assert.equal(handoff.retryBinding.maxAttempts, 2);
  assert.equal(handoff.retryBinding.retryPolicyRef, policy.policyRef);
  assert.equal(handoff.retryBinding.retryPolicyDigest, policy.policyDigest);
  assert.deepEqual(policy.retryableFailureClasses, [
    "transport_failure",
    "no_output",
    "contract_failure"
  ]);
  assert.equal(handoff.startupBlock.effectsPermitted, false);
});

test("T-261 retries one admitted runtime failure then completes", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const requests = [];
  const run = invocation(value, catalog, {
    async invokeAttempt(request) {
      requests.push(request);
      return request.attempt === 1
        ? attemptOutcome(request, "runtime_failed")
        : attemptOutcome(request, "completed");
    }
  });
  const resolution = await resolveCRetry(run.input);

  assert.equal(resolution.status, "completed");
  assert.equal(resolution.stopReason, null);
  assert.equal(resolution.attempts.length, 2);
  assert.deepEqual(
    resolution.attempts.map((row) => row.judgment),
    ["retry", "advance"]
  );
  assert.deepEqual(requests.map((request) => request.attempt), [1, 2]);
  assert.equal(requests[1].priorFailureClass, "transport_failure");
  assert.equal(requests[1].priorFailureSignalRef, "signal://t261/transport");
  assert.equal(requests[0].inputPayloadRef, requests[1].inputPayloadRef);
  assert.notEqual(requests[0].cCallRef, requests[1].cCallRef);
  assert.notEqual(requests[0].attemptRunRef, requests[1].attemptRunRef);
  assert.notEqual(requests[0].attemptManifestRef, requests[1].attemptManifestRef);
  assert.equal(run.emitted.length, 10);
  for (const event of run.emitted) assertRuntimeEvent(event);
});

test("T-261 semantic disagreement and held work never retry", async () => {
  for (const [disposition, expectedStatus, expectedStop] of [
    ["semantic_blocked", "blocked", "semantic_blocked"],
    ["held", "pending", null]
  ]) {
    const value = fixture({ budget: 3 });
    const catalog = admittedCatalog(value);
    let calls = 0;
    const run = invocation(value, catalog, {
      async invokeAttempt(request) {
        calls += 1;
        return attemptOutcome(request, disposition);
      }
    });
    const resolution = await resolveCRetry(run.input);
    assert.equal(resolution.status, expectedStatus);
    assert.equal(resolution.stopReason, expectedStop);
    assert.equal(calls, 1);
    assert.equal(resolution.attempts[0].judgment, disposition === "held" ? "pending" : "blocked");
  }
});

test("T-261 budget and stationarity stop before another attempt", async () => {
  const budgetOne = fixture({ budget: 1 });
  const budgetOneCatalog = admittedCatalog(budgetOne);
  let budgetCalls = 0;
  const budgetRun = invocation(budgetOne, budgetOneCatalog, {
    async invokeAttempt(request) {
      budgetCalls += 1;
      return attemptOutcome(request, "runtime_failed", {
        failureClass: "no_output",
        failureSignalRef: "signal://t261/no-output",
        reasonRef: "reason://t261/no-output"
      });
    }
  });
  const budgetResolution = await resolveCRetry(budgetRun.input);
  assert.equal(budgetResolution.stopReason, "retry_budget_exhausted");
  assert.equal(budgetCalls, 1);
  assert.equal(budgetResolution.attempts[0].judgment, "blocked");

  const stationary = fixture({ budget: 3 });
  const stationaryCatalog = admittedCatalog(stationary);
  let stationaryCalls = 0;
  const stationaryRun = invocation(stationary, stationaryCatalog, {
    async invokeAttempt(request) {
      stationaryCalls += 1;
      return attemptOutcome(request, "runtime_failed", {
        failureClass: "contract_failure",
        failureSignalRef: "signal://t261/same-contract-gap",
        reasonRef: "reason://t261/same-contract-gap"
      });
    }
  });
  const stationaryResolution = await resolveCRetry(stationaryRun.input);
  assert.equal(stationaryResolution.stopReason, "stationary_failure");
  assert.equal(stationaryCalls, 2);
  assert.deepEqual(
    stationaryResolution.attempts.map((row) => row.judgment),
    ["retry", "blocked"]
  );
});

test("T-261 malformed output retries while thrown and nonallowlisted failures stop", async () => {
  const malformed = fixture();
  const malformedCatalog = admittedCatalog(malformed);
  let malformedCalls = 0;
  const malformedRun = invocation(malformed, malformedCatalog, {
    async invokeAttempt(request) {
      malformedCalls += 1;
      return request.attempt === 1
        ? Object.freeze({})
        : attemptOutcome(request, "completed");
    }
  });
  const malformedResolution = await resolveCRetry(malformedRun.input);
  assert.equal(malformedResolution.status, "completed");
  assert.equal(malformedCalls, 2);
  assert.equal(malformedResolution.attempts[0].failureClass, "contract_failure");

  const thrown = fixture({ budget: 3 });
  const thrownCatalog = admittedCatalog(thrown);
  let thrownCalls = 0;
  const thrownRun = invocation(thrown, thrownCatalog, {
    async invokeAttempt() {
      thrownCalls += 1;
      throw new Error("executor unavailable");
    }
  });
  const thrownResolution = await resolveCRetry(thrownRun.input);
  assert.equal(thrownResolution.stopReason, "runtime_failure");
  assert.equal(thrownCalls, 1);

  const nonallowlisted = fixture({ budget: 3 });
  const nonallowlistedCatalog = admittedCatalog(nonallowlisted);
  let nonallowlistedCalls = 0;
  const nonallowlistedRun = invocation(nonallowlisted, nonallowlistedCatalog, {
    async invokeAttempt(request) {
      nonallowlistedCalls += 1;
      return attemptOutcome(request, "runtime_failed", {
        failureClass: "capability_missing",
        failureSignalRef: "signal://t261/capability",
        reasonRef: "reason://t261/capability"
      });
    }
  });
  const nonallowlistedResolution = await resolveCRetry(nonallowlistedRun.input);
  assert.equal(nonallowlistedResolution.stopReason, "non_retryable_failure");
  assert.equal(nonallowlistedCalls, 1);
});

test("T-261 replay returns terminal truth without repeating effects", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const first = invocation(value, catalog, {
    async invokeAttempt(request) {
      return attemptOutcome(request, "completed");
    }
  });
  const firstResolution = await resolveCRetry(first.input);
  assert.equal(firstResolution.status, "completed");

  let replayCalls = 0;
  const replay = invocation(value, catalog, {
    replayEvents: first.emitted,
    async invokeAttempt() {
      replayCalls += 1;
      throw new Error("replay must not invoke the adapter");
    }
  });
  const replayResolution = await resolveCRetry(replay.input);
  assert.equal(replayResolution.status, "completed");
  assert.equal(replayResolution.outputPayloadRef, firstResolution.outputPayloadRef);
  assert.equal(replayCalls, 0);
  assert.deepEqual(replay.emitted, []);
});

test("T-261 dangling replay resumes the same attempt and C-call spine", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const complete = invocation(value, catalog, {
    async invokeAttempt(request) {
      return attemptOutcome(request, "completed");
    }
  });
  await resolveCRetry(complete.input);
  const openPrefix = complete.emitted.slice(0, 2);
  assert.deepEqual(
    openPrefix.map((event) => event.kind),
    ["c_call_opened", "c_call_fibre_selected"]
  );

  let resumedRequest = null;
  const resumed = invocation(value, catalog, {
    replayEvents: openPrefix,
    async invokeAttempt(request) {
      resumedRequest = request;
      return attemptOutcome(request, "completed");
    }
  });
  const resolution = await resolveCRetry(resumed.input);
  assert.equal(resolution.status, "completed");
  assert.equal(resumedRequest.attempt, 1);
  assert.equal(resumedRequest.cCallRef, openPrefix[0].cCallRef);
  assert.deepEqual(
    resumed.emitted.map((event) => event.kind),
    ["c_call_evidenced", "c_call_result_admitted", "c_call_judged"]
  );
});

test("T-261 replay rejects fibre drift and an ineligible historical retry", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const completed = invocation(value, catalog, {
    async invokeAttempt(request) {
      return attemptOutcome(request, "completed");
    }
  });
  await resolveCRetry(completed.input);

  let replayCalls = 0;
  const foreignFibreEvents = completed.emitted.map((event) =>
    event.kind === "c_call_fibre_selected"
      ? { ...event, armId: "arm://t261/foreign" }
      : event
  );
  const foreignFibre = invocation(value, catalog, {
    replayEvents: foreignFibreEvents,
    async invokeAttempt() {
      replayCalls += 1;
      throw new Error("foreign replay must fail before effects");
    }
  });
  await assert.rejects(
    () => resolveCRetry(foreignFibre.input),
    /selected fibre differs/u
  );

  const retryThenComplete = invocation(value, catalog, {
    async invokeAttempt(request) {
      return request.attempt === 1
        ? attemptOutcome(request, "runtime_failed")
        : attemptOutcome(request, "completed");
    }
  });
  await resolveCRetry(retryThenComplete.input);
  const ineligibleRetryEvents = retryThenComplete.emitted.map((event) =>
    event.kind === "c_call_result_admitted" &&
      event.outcomeStatus === "transport_failure"
      ? { ...event, outcomeStatus: "runtime_failure" }
      : event
  );
  const ineligibleRetry = invocation(value, catalog, {
    replayEvents: ineligibleRetryEvents,
    async invokeAttempt() {
      replayCalls += 1;
      throw new Error("ineligible replay must fail before effects");
    }
  });
  await assert.rejects(
    () => resolveCRetry(ineligibleRetry.input),
    /ineligible retry judgment/u
  );
  assert.equal(replayCalls, 0);
});

test("T-261 rejects forged policy and selected-catalog drift before effects", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const binding = value.handoffOutcome.handoff.retryBinding;
  const plan = compileCRetryPlan({
    binding,
    selectedCatalogEntryRef: ENTRY_REF
  });
  const forgedPlan = {
    ...plan,
    retryableFailureClasses: [...plan.retryableFailureClasses, "runtime_failure"]
  };
  let calls = 0;
  const forged = invocation(value, catalog, {
    plan: forgedPlan,
    async invokeAttempt(request) {
      calls += 1;
      return attemptOutcome(request, "completed");
    }
  });
  await assert.rejects(() => resolveCRetry(forged.input), /plan identity|policy/i);
  assert.equal(calls, 0);

  const foreign = invocation(value, catalog, {
    selectedCatalogEntryRef: "catalog-entry://t261/foreign",
    async invokeAttempt(request) {
      calls += 1;
      return attemptOutcome(request, "completed");
    }
  });
  await assert.rejects(() => resolveCRetry(foreign.input), /selected|entry/i);
  assert.equal(calls, 0);
});
