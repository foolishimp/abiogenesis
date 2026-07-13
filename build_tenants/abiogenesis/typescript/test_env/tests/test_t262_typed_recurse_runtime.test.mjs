// Validates: T-262; REQ-L-GTL3-RECURSE-001..008;
// REQ-R-ABG3-FRAME-001..006; REQ-R-ABG3-LINEAGE-001..005.

import assert from "node:assert/strict";
import test from "node:test";

import {
  recurse
} from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import {
  constructEnvRef,
  constructGraphFunction,
  constructNode,
  constructTemplateRef,
  emptySerializedAttrs
} from "../../build/semantic/code/src/gtl/m01/contracts/constructors.js";
import {
  graphFunctionDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/declaration_law.js";
import {
  constructContractRef,
  constructGtlLibraryEntryDeclaration,
  constructJob,
  constructModule
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  compileGraphFunctionApplication
} from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  admitTypedRecursePolicy,
  compileTypedRecurseBinding,
  compileTypedRecursePlan
} from "../../build/semantic/code/src/abg/m03/contracts/typed_recurse.js";
import {
  resolveTypedRecurse
} from "../../build/semantic/code/src/abg/m03/runner/typed_recurse_runtime.js";

const ENTRY_REF = "catalog-entry://t262/system/normalize-until-stable";
const MODULE_REF = "gtl-module://t262/normalize-until-stable";
const INPUT_PAYLOAD_REF = "payload://t262/normalization/input/v1";

function node(name) {
  return constructNode({
    id: `node://t262/${name.toLowerCase()}`,
    name,
    schema: { kind: "symbolic", ref: `schema://t262/${name.toLowerCase()}` },
    markov: ["boundary://t262/normalization"],
    assetSurface: {
      kind: `t262_${name.toLowerCase()}`,
      standardsRefs: ["REQ-L-GTL3-RECURSE-001"],
      proofObligationRefs: ["proof://t262/typed-recurse"]
    },
    tags: ["t262"]
  });
}

function fixture({ maxApplications = 2 } = {}) {
  const input = node("NormalizationInput");
  const output = node("NormalizationResult");
  const operand = constructGraphFunction({
    id: "graph-function://t262/normalize-once",
    name: "t262.normalize-once",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: "template://t262/normalize-once",
      graph: null,
      version: null
    }),
    effects: ["effect://t262/normalize-once"],
    declarations: graphFunctionDeclarations([]),
    tags: ["t262", "module-local"]
  });
  const terminationEvaluator = Object.freeze({
    name: "normalization_stable",
    regime: "F_D",
    description: "tests whether another normalization application is required",
    binding: "binding://t262/normalization-stable",
    consumedFieldRefs: Object.freeze([
      "field://t262/normalization/disposition",
      "field://t262/normalization/gap-count"
    ]),
    tags: Object.freeze(["t262", "termination"])
  });
  const wrapper = recurse(operand, terminationEvaluator, {
    mode: "rebind",
    binding: "binding://t262/result-to-next-input",
    requiresParentEvaluation: true
  });
  const module = constructModule({
    name: "t262.typed-recurse",
    graphs: [],
    graphFunctions: [wrapper, operand],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: "t262-normalize-until-stable-job",
        contracts: [
          constructContractRef({
            kind: "graph_function",
            targetId: wrapper.id
          })
        ],
        roles: [],
        tags: ["t262"],
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
  const compilation = compileGraphFunctionApplication({
    graphFunction: wrapper,
    graphFunctions: module.graphFunctions
  });
  assert.equal(compilation.accepted, true, JSON.stringify(compilation.diagnostics));
  assert.notEqual(compilation.recurseRelation, null);
  const binding = compileTypedRecurseBinding({
    module,
    graphFunction: wrapper,
    relation: compilation.recurseRelation
  });
  const policy = admitTypedRecursePolicy({
    kind: "typed_recurse_policy",
    policyRef: `policy://t262/normalization/${String(maxApplications)}`,
    policyVersion: "1.0.0",
    sourceInputCarrierRef: binding.inputCarrierRef,
    sourceInputPayloadRef: INPUT_PAYLOAD_REF,
    budgetSourceFieldRef: "field://t262/normalization/max-applications",
    maxApplications,
    evidenceRefs: ["evidence://t262/policy-admitted"]
  });
  const plan = compileTypedRecursePlan({
    binding,
    policy,
    selectedCatalogEntryRef: ENTRY_REF
  });
  return {
    input,
    output,
    operand,
    wrapper,
    module,
    compilation,
    binding,
    policy,
    plan
  };
}

function admittedCatalog(value) {
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t262/system/normalize-until-stable",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t262",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: value.wrapper.id,
    interfaceRef: "interface://t262/normalization",
    sourceContractRef: value.binding.inputCarrierRef,
    targetContractRef: value.binding.outputCarrierRef,
    contextRefs: ["context://t262/normalization"],
    authorityRefs: ["REQ-L-GTL3-RECURSE-001"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t262/fixture"],
    readinessRefs: ["readiness://t262/isolated-proof"],
    proofRefs: ["proof://t262/typed-recurse"],
    policyRefs: [value.policy.policyRef],
    declarationSourceRefs: [MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t262",
      bindingId: "binding://t262",
      catalogId: "catalog://t262",
      resolvedLockRef: "lock://t262",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module: value.module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t262/catalog-bound"],
      correlationId: "correlation://t262/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  return admission.basis;
}

function childOutcome(request, disposition = "completed", overrides = {}) {
  const completed = disposition === "completed";
  return Object.freeze({
    kind: "typed_recurse_child_outcome",
    planRef: request.planRef,
    bindingRef: request.bindingRef,
    applicationOrdinal: request.applicationOrdinal,
    childInvocationRef: request.childInvocationRef,
    childGraphCallId: request.childGraphCallId,
    childFrameId: request.childFrameId,
    disposition,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: completed
      ? `payload://t262/normalization/result/${String(request.applicationOrdinal)}`
      : null,
    responseContractRef: completed ? request.outputCarrierRef : null,
    reasonRef: completed ? null : `reason://t262/child/${disposition}`,
    evidenceRefs: [
      `evidence://t262/child/${String(request.applicationOrdinal)}`
    ],
    ...overrides
  });
}

function terminationOutcome(request, decision, overrides = {}) {
  return Object.freeze({
    kind: "typed_recurse_termination_outcome",
    planRef: request.planRef,
    bindingRef: request.bindingRef,
    applicationOrdinal: request.applicationOrdinal,
    childInvocationRef: request.childInvocationRef,
    childGraphCallId: request.childGraphCallId,
    childFrameId: request.childFrameId,
    outputPayloadRef: request.outputPayloadRef,
    evaluatorBinding: request.evaluatorBinding,
    evaluatorDigest: request.evaluatorDigest,
    decision,
    reasonRef: `reason://t262/termination/${decision}`,
    evidenceRefs: [
      `evidence://t262/termination/${String(request.applicationOrdinal)}`
    ],
    ...overrides
  });
}

function foldbackOutcome(request, overrides = {}) {
  return Object.freeze({
    kind: "typed_recurse_foldback_outcome",
    planRef: request.planRef,
    bindingRef: request.bindingRef,
    applicationOrdinal: request.applicationOrdinal,
    childInvocationRef: request.childInvocationRef,
    childGraphCallId: request.childGraphCallId,
    childFrameId: request.childFrameId,
    frameLineageId: request.frameLineageId,
    foldbackBinding: request.foldbackBinding,
    sourceOutputCarrierRef: request.sourceOutputCarrierRef,
    sourceOutputPayloadRef: request.sourceOutputPayloadRef,
    targetInputCarrierRef: request.targetInputCarrierRef,
    targetInputPayloadRef:
      `payload://t262/normalization/input/${String(request.applicationOrdinal + 1)}`,
    policyRef: request.policyRef,
    policyDigest: request.policyDigest,
    budgetSourceFieldRef: request.budgetSourceFieldRef,
    preservedEvidenceRefs: [...request.requiredPreservedEvidenceRefs],
    foldbackEvidenceRefs: [
      `evidence://t262/foldback/${String(request.applicationOrdinal)}`
    ],
    ...overrides
  });
}

function invocation(value, catalogBasis, options = {}) {
  const emitted = [];
  const calls = { child: [], termination: [], foldback: [] };
  return {
    emitted,
    calls,
    input: {
      kind: "typed_recurse_invocation",
      binding: options.binding ?? value.binding,
      plan: options.plan ?? value.plan,
      policy: options.policy ?? value.policy,
      catalogBasis,
      selectedCatalogEntryRef: options.selectedCatalogEntryRef ?? ENTRY_REF,
      parentBasisId: options.parentBasisId ?? "basis://t262/parent",
      parentGraphCallId: options.parentGraphCallId ?? "graph-call://t262/parent",
      parentFrameId: options.parentFrameId ?? "frame://t262/parent",
      inputPayloadRef: options.inputPayloadRef ?? INPUT_PAYLOAD_REF,
      causationEventRefs: options.causationEventRefs ?? ["event://t262/parent-ready"],
      replayEvents: options.replayEvents ?? [],
      emit(events) {
        emitted.push(...events);
      },
      async invokeChild(request) {
        calls.child.push(request);
        return options.invokeChild === undefined
          ? childOutcome(request)
          : options.invokeChild(request);
      },
      async evaluateTermination(request) {
        calls.termination.push(request);
        return options.evaluateTermination === undefined
          ? terminationOutcome(request, "terminate")
          : options.evaluateTermination(request);
      },
      async applyFoldback(request) {
        calls.foldback.push(request);
        return options.applyFoldback === undefined
          ? foldbackOutcome(request)
          : options.applyFoldback(request);
      }
    }
  };
}

function stampReplay(events) {
  const eventTime = "2026-07-13T00:00:00.000Z";
  const eventTimeUnixMs = Date.parse(eventTime);
  return events.map((event, eventAdmissionOrdinal) => ({
    ...event,
    eventId: `runtime-event:t262:${String(eventAdmissionOrdinal)}`,
    eventTime,
    eventTimeUnixMs,
    eventAdmissionOrdinal
  }));
}

test("T-262 compiles one direct recurse relation and positive policy", () => {
  const value = fixture();
  const relation = value.compilation.recurseRelation;
  assert.equal(value.compilation.fanInRelation, null);
  assert.equal(relation.kind, "compiled_recurse_application_relation");
  assert.equal(relation.executionSubjectGraphFunctionRef, value.wrapper.id);
  assert.equal(relation.operandGraphFunctionRef, value.operand.id);
  assert.equal(relation.foldbackMode, "rebind");
  assert.equal(relation.foldbackRequiresParentEvaluation, true);
  assert.equal(value.binding.moduleName, value.module.name);
  assert.equal(value.plan.maxApplications, 2);
  assert.equal(value.plan.policyDigest, value.policy.policyDigest);
  assert.equal(value.plan.sourceInputPayloadRef, INPUT_PAYLOAD_REF);
});

test("T-262 rejects malformed policy and selected-Module drift before effects", async () => {
  const value = fixture();
  for (const raw of [
    {
      kind: "typed_recurse_policy",
      policyRef: "policy://t262/invalid",
      policyVersion: "1",
      sourceInputCarrierRef: value.binding.inputCarrierRef,
      sourceInputPayloadRef: INPUT_PAYLOAD_REF,
      budgetSourceFieldRef: "field://t262/budget",
      maxApplications: 0,
      evidenceRefs: ["evidence://t262/invalid"]
    },
    {
      kind: "typed_recurse_policy",
      policyRef: "policy://t262/invalid",
      policyVersion: "1",
      sourceInputCarrierRef: value.binding.inputCarrierRef,
      sourceInputPayloadRef: INPUT_PAYLOAD_REF,
      budgetSourceFieldRef: "field://t262/budget",
      maxApplications: 1,
      evidenceRefs: [],
      hiddenBudget: 9
    }
  ]) {
    assert.throws(() => admitTypedRecursePolicy(raw), /positive|canonical|evidence/i);
  }

  const catalog = admittedCatalog(value);
  let effects = 0;
  const selectedDrift = invocation(value, catalog, {
    selectedCatalogEntryRef: "catalog-entry://t262/foreign",
    async invokeChild(request) {
      effects += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveTypedRecurse(selectedDrift.input),
    /selected|entry|sealed plan/i
  );

  const widenedPolicy = invocation(value, catalog, {
    policy: { ...value.policy, hiddenBudget: 99 },
    async invokeChild(request) {
      effects += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveTypedRecurse(widenedPolicy.input),
    /canonical key set/i
  );

  const widenedBinding = invocation(value, catalog, {
    binding: { ...value.binding, hiddenRelation: "recurse" },
    async invokeChild(request) {
      effects += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveTypedRecurse(widenedBinding.input),
    /canonical key set/i
  );

  const widenedPlan = invocation(value, catalog, {
    plan: { ...value.plan, hiddenController: "loop" },
    async invokeChild(request) {
      effects += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveTypedRecurse(widenedPlan.input),
    /canonical key set/i
  );

  const foreignPolicy = admitTypedRecursePolicy({
    kind: "typed_recurse_policy",
    policyRef: "policy://t262/not-authorized-by-entry",
    policyVersion: "1.0.0",
    sourceInputCarrierRef: value.binding.inputCarrierRef,
    sourceInputPayloadRef: INPUT_PAYLOAD_REF,
    budgetSourceFieldRef: "field://t262/normalization/max-applications",
    maxApplications: 2,
    evidenceRefs: ["evidence://t262/foreign-policy"]
  });
  const foreignPlan = compileTypedRecursePlan({
    binding: value.binding,
    policy: foreignPolicy,
    selectedCatalogEntryRef: ENTRY_REF
  });
  const unauthorized = invocation(value, catalog, {
    policy: foreignPolicy,
    plan: foreignPlan,
    async invokeChild(request) {
      effects += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveTypedRecurse(unauthorized.input),
    /does not authorize the admitted policy/i
  );

  const duplicateModule = {
    ...value.module,
    graphFunctions: [...value.module.graphFunctions, value.operand]
  };
  assert.throws(
    () => compileTypedRecurseBinding({
      module: duplicateModule,
      graphFunction: value.wrapper,
      relation: value.compilation.recurseRelation
    }),
    /operand differs/i
  );
  assert.equal(effects, 0);
});

test("T-262 folds once, rebinds the parent, and terminates on application two", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const run = invocation(value, catalog, {
    evaluateTermination(request) {
      return terminationOutcome(
        request,
        request.applicationOrdinal === 1 ? "foldback" : "terminate"
      );
    }
  });
  const result = await resolveTypedRecurse(run.input);

  assert.equal(result.status, "completed");
  assert.equal(result.applicationsOpened, 2);
  assert.equal(result.outputPayloadRef, "payload://t262/normalization/result/2");
  assert.deepEqual(run.calls.child.map((row) => row.applicationOrdinal), [1, 2]);
  assert.equal(run.calls.child[1].inputPayloadRef, "payload://t262/normalization/input/2");
  assert.notEqual(run.calls.child[0].childGraphCallId, run.calls.child[1].childGraphCallId);
  assert.notEqual(run.calls.child[0].childFrameId, run.calls.child[1].childFrameId);
  assert.equal(run.calls.child[0].frameLineageId, run.calls.child[1].frameLineageId);
  assert.ok(
    run.calls.foldback[0].requiredPreservedEvidenceRefs.includes(
      "evidence://t262/policy-admitted"
    )
  );
  assert.deepEqual(
    run.emitted.map((event) => event.kind),
    [
      "typed_recurse_application_opened",
      "typed_recurse_child_result_admitted",
      "typed_recurse_termination_evaluated",
      "typed_recurse_foldback_admitted",
      "typed_recurse_parent_rebind_evaluated",
      "typed_recurse_application_opened",
      "typed_recurse_child_result_admitted",
      "typed_recurse_termination_evaluated"
    ]
  );
  for (const event of run.emitted) assertRuntimeEvent(event);
});

test("T-262 held, blocked, thrown, and malformed child outcomes stop once", async () => {
  for (const [label, raw, status, stopReason] of [
    ["held", (request) => childOutcome(request, "held"), "pending", "held"],
    ["blocked", (request) => childOutcome(request, "blocked"), "blocked", "child_blocked"],
    ["thrown", () => { throw new Error("child transport failed"); }, "blocked", "runtime_failure"],
    ["malformed", () => ({}), "blocked", "runtime_failure"]
  ]) {
    const value = fixture({ maxApplications: 3 });
    const catalog = admittedCatalog(value);
    const run = invocation(value, catalog, { invokeChild: raw });
    const result = await resolveTypedRecurse(run.input);
    assert.equal(result.status, status, label);
    assert.equal(result.stopReason, stopReason, label);
    assert.equal(run.calls.child.length, 1, label);
    assert.equal(run.calls.termination.length, 0, label);
    assert.equal(run.calls.foldback.length, 0, label);
  }
});

test("T-262 termination block, malformed output, and budget stop precede foldback", async () => {
  for (const [label, evaluate, expectedStop] of [
    [
      "blocked",
      (request) => terminationOutcome(request, "blocked"),
      "termination_blocked"
    ],
    ["malformed", () => ({}), "termination_blocked"]
  ]) {
    const value = fixture({ maxApplications: 3 });
    const catalog = admittedCatalog(value);
    const run = invocation(value, catalog, { evaluateTermination: evaluate });
    const result = await resolveTypedRecurse(run.input);
    assert.equal(result.status, "blocked", label);
    assert.equal(result.stopReason, expectedStop, label);
    assert.equal(run.calls.foldback.length, 0, label);
  }

  const budgetOne = fixture({ maxApplications: 1 });
  const budgetCatalog = admittedCatalog(budgetOne);
  const budgetRun = invocation(budgetOne, budgetCatalog, {
    evaluateTermination(request) {
      return terminationOutcome(request, "foldback");
    }
  });
  const budgetResult = await resolveTypedRecurse(budgetRun.input);
  assert.equal(budgetResult.status, "blocked");
  assert.equal(budgetResult.stopReason, "budget_exhausted");
  assert.equal(budgetRun.calls.foldback.length, 0);
  assert.equal(budgetRun.calls.child.length, 1);
});

test("T-262 malformed foldback is persisted and replay never repeats it", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const first = invocation(value, catalog, {
    evaluateTermination(request) {
      return terminationOutcome(request, "foldback");
    },
    applyFoldback(request) {
      return foldbackOutcome(request, {
        policyDigest: "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      });
    }
  });
  const firstResult = await resolveTypedRecurse(first.input);
  assert.equal(firstResult.status, "blocked");
  assert.equal(firstResult.stopReason, "foldback_invalid");
  assert.equal(first.calls.foldback.length, 1);
  assert.equal(first.emitted.at(-1).kind, "typed_recurse_foldback_rejected");
  assertRuntimeEvent(first.emitted.at(-1));

  const replay = invocation(value, catalog, {
    replayEvents: first.emitted,
    invokeChild() {
      throw new Error("terminal replay must not invoke child");
    },
    evaluateTermination() {
      throw new Error("terminal replay must not invoke evaluator");
    },
    applyFoldback() {
      throw new Error("terminal replay must not repeat foldback");
    }
  });
  const replayResult = await resolveTypedRecurse(replay.input);
  assert.equal(replayResult.stopReason, "foldback_invalid");
  assert.deepEqual(replay.emitted, []);
  assert.deepEqual(replay.calls, { child: [], termination: [], foldback: [] });
});

test("T-262 terminal and dangling replay resume only the exact missing stage", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const completed = invocation(value, catalog);
  const completedResult = await resolveTypedRecurse(completed.input);
  assert.equal(completedResult.status, "completed");

  const terminalReplay = invocation(value, catalog, {
    replayEvents: stampReplay(completed.emitted),
    invokeChild() { throw new Error("terminal replay child effect"); },
    evaluateTermination() { throw new Error("terminal replay evaluator effect"); },
    applyFoldback() { throw new Error("terminal replay foldback effect"); }
  });
  const terminalResult = await resolveTypedRecurse(terminalReplay.input);
  assert.equal(terminalResult.status, "completed");
  assert.deepEqual(terminalReplay.emitted, []);
  assert.deepEqual(terminalReplay.calls, { child: [], termination: [], foldback: [] });

  const childResume = invocation(value, catalog, {
    replayEvents: completed.emitted.slice(0, 1)
  });
  await resolveTypedRecurse(childResume.input);
  assert.equal(childResume.calls.child.length, 1);
  assert.equal(childResume.calls.termination.length, 1);
  assert.equal(childResume.emitted[0].kind, "typed_recurse_child_result_admitted");
  assert.equal(
    childResume.calls.child[0].childInvocationRef,
    completed.emitted[0].childInvocationRef
  );

  const terminationResume = invocation(value, catalog, {
    replayEvents: completed.emitted.slice(0, 2)
  });
  await resolveTypedRecurse(terminationResume.input);
  assert.equal(terminationResume.calls.child.length, 0);
  assert.equal(terminationResume.calls.termination.length, 1);
  assert.equal(terminationResume.emitted[0].kind, "typed_recurse_termination_evaluated");
});

test("T-262 replay rejects lineage, ordinal, causation, input, and evidence drift", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const run = invocation(value, catalog, {
    evaluateTermination(request) {
      return terminationOutcome(request, "foldback");
    }
  });
  await resolveTypedRecurse(run.input);

  const mutations = [
    [0, { frameLineageId: "lineage://t262/foreign" }, /frameLineageId differs/u],
    [0, { applicationOrdinal: 2 }, /applicationOrdinal differs/u],
    [1, { causationEventRefs: ["event://t262/foreign"] }, /causation differs/u],
    [0, { inputPayloadRef: "payload://t262/foreign" }, /application open/u],
    [3, { preservedEvidenceRefs: ["evidence://t262/foldback/1"] }, /foldback truth/u]
  ];
  for (const [index, override, pattern] of mutations) {
    const replayEvents = run.emitted.map((event, eventIndex) =>
      eventIndex === index ? { ...event, ...override } : event
    );
    let effects = 0;
    const replay = invocation(value, catalog, {
      replayEvents,
      invokeChild() { effects += 1; },
      evaluateTermination() { effects += 1; },
      applyFoldback() { effects += 1; }
    });
    await assert.rejects(() => resolveTypedRecurse(replay.input), pattern);
    assert.equal(effects, 0);
  }
});

test("T-262 blocked parent rebind is terminal replay truth", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const run = invocation(value, catalog, {
    evaluateTermination(request) {
      return terminationOutcome(request, "foldback");
    }
  });
  await resolveTypedRecurse(run.input);
  const parent = run.emitted[4];
  assert.equal(parent.kind, "typed_recurse_parent_rebind_evaluated");
  const blockedParent = {
    ...parent,
    decision: "blocked",
    reasonRef: "reason://t262/parent-rebind-blocked"
  };
  assertRuntimeEvent(blockedParent);
  const replay = invocation(value, catalog, {
    replayEvents: [...run.emitted.slice(0, 4), blockedParent],
    invokeChild() { throw new Error("blocked parent must not recurse"); },
    evaluateTermination() { throw new Error("blocked parent must not evaluate"); },
    applyFoldback() { throw new Error("blocked parent must not fold back"); }
  });
  const result = await resolveTypedRecurse(replay.input);
  assert.equal(result.status, "blocked");
  assert.equal(result.stopReason, "parent_rebind_blocked");
  assert.deepEqual(replay.emitted, []);
});

test("T-262 event admission rejects unknown fields and empty nullable values", async () => {
  const value = fixture();
  const catalog = admittedCatalog(value);
  const run = invocation(value, catalog);
  await resolveTypedRecurse(run.input);
  const opened = run.emitted[0];
  const child = run.emitted[1];
  const parentValue = fixture();
  const parentCatalog = admittedCatalog(parentValue);
  const parentRun = invocation(parentValue, parentCatalog, {
    evaluateTermination(request) {
      return terminationOutcome(request, "foldback");
    }
  });
  await resolveTypedRecurse(parentRun.input);
  const parent = parentRun.emitted[4];

  assert.throws(
    () => assertRuntimeEvent({ ...opened, hiddenControllerState: "retry" }),
    /unexpected field/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...child, responseContractRef: "" }),
    /non-empty/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...parent, reasonRef: "" }),
    /non-empty/u
  );
});
