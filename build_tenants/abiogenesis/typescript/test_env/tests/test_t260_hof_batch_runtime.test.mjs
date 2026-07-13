// Validates: T-260; REQ-L-GTL3-C-ALGEBRA-007;
// REQ-L-GTL3-HOF-009/-010/-011/-012.

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  fan_in,
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector,
  typedInterface,
  typedNode,
  typedVectorNode
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
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  compileHofRelation
} from "../../build/semantic/code/src/abg/m03/contracts/hof_relation_compiler.js";
import {
  compileGraphFunctionApplication
} from "../../build/semantic/code/src/abg/m03/contracts/graph_function_application_compiler.js";
import {
  compileFanInReductionBinding,
  compileHofFanOutBinding
} from "../../build/semantic/code/src/abg/m03/contracts/hof_batch.js";
import {
  admitHofVector,
  compileDeclaredCBatchPlan,
  compileHofCBatchPlan
} from "../../build/semantic/code/src/abg/m03/contracts/c_batch.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  resolveCBatch
} from "../../build/semantic/code/src/abg/m03/runner/c_batch_runtime.js";
import {
  resolveHofFanIn
} from "../../build/semantic/code/src/abg/m03/runner/hof_fan_in_runtime.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";

const MODULE_REF = "gtl-module://scenario-09/t260";
const ENTRY_HOF = "catalog-entry://scenario-09/t260/fan-out";
const ENTRY_FAN_IN = "catalog-entry://scenario-09/t260/fan-in";
const ENTRY_BATCH = "catalog-entry://scenario-09/t260/direct-batch";

function node(name, schemaRef = `schema://scenario-09/${name}`) {
  return constructNode({
    id: `node://scenario-09/${name.toLowerCase()}`,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: ["boundary://scenario-09/t260"],
    assetSurface: {
      kind: `scenario_09_${name.toLowerCase()}`,
      standardsRefs: ["REQ-L-GTL3-HOF-009"],
      proofObligationRefs: ["proof://scenario-09/t260"]
    },
    tags: ["scenario-09", "t260"]
  });
}

function typedBoundary(nodes) {
  return typedInterface(
    ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
  );
}

function compositionDeclarations({ graphFunctionRef, vector, input, output, roles }) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${vector.id}`,
    hookRef: `hook://${vector.id}/composition`,
    hostGraphFunctionRef: graphFunctionRef,
    hostGraphVectorRef: vector.id,
    hostSourceNodeRefs: input.map((value) => value.id),
    hostTargetNodeRef: output.id,
    hostTargetSchemaRef: output.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: vector.id
    }),
    regimes: roles.map((stageRole, order) =>
      Object.freeze({
        bindingRef: `regime-binding://${vector.id}/${stageRole}`,
        stageRole,
        regime: "F_D",
        role: "construct",
        order,
        authority: "evidence",
        inputCarrierRefs: input.map((value) => value.id),
        outputCarrierRefs: [output.id],
        evidenceRefs: ["evidence://scenario-09/t260/composition"]
      })
    ),
    standardsContextRefs: ["standard://scenario-09/t260"],
    policyContextRefs: ["policy://scenario-09/t260"],
    carrierContextRefs: [...input.map((value) => value.id), output.id],
    assuranceContextRefs: ["assurance://scenario-09/t260"],
    closureContractRef: `closure://${vector.id}`
  });
}

function directFunction({ name, id, input, output, roles, term }) {
  const program = declareCProgram({
    programRef: `program://scenario-09/t260/${name}`,
    term,
    proportionalityClass: "P1"
  });
  const vectorSeed = constructGraphVector({
    id: `graph-vector://scenario-09/t260/${name}`,
    name: `${name}.vector`,
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: graphVectorDeclarations([]),
    tags: ["scenario-09", "t260"]
  });
  const composition = compositionDeclarations({
    graphFunctionRef: id,
    vector: vectorSeed,
    input: [input],
    output,
    roles
  });
  const vector = constructGraphVector({
    ...vectorSeed,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef),
      ...composition.entries
    ])
  });
  const graph = constructGraph({
    name: `${name}.graph`,
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["scenario-09", "t260"]
  });
  const graphFunction = constructGraphFunction({
    id,
    name,
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://scenario-09/t260/${name}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["scenario-09", "t260"]
  });
  return { graphFunction, graph, vector, program };
}

function singleStage(input, output, stageRole) {
  return C.of({
    input: cInterfaceCarrier(typedBoundary([input])),
    output: cInterfaceCarrier(typedBoundary([output])),
    stageRole,
    fibre: "F_D",
    armId: `arm://scenario-09/t260/${stageRole}`,
    resultBearing: true
  });
}

function catalogDeclaration(entryRef, graphFunction) {
  return constructGtlLibraryEntryDeclaration({
    declarationRef: `declaration://${entryRef}`,
    entryRef,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.scenario_09.t260",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: graphFunction.id,
    interfaceRef: `interface://${entryRef}`,
    sourceContractRef: `contract://${entryRef}/source`,
    targetContractRef: `contract://${entryRef}/target`,
    contextRefs: ["context://scenario-09/t260"],
    authorityRefs: ["REQ-L-GTL3-HOF-012"],
    overlayRefs: [],
    provenanceRefs: ["provenance://scenario-09/t260"],
    readinessRefs: ["readiness://scenario-09/t260"],
    proofRefs: ["proof://scenario-09/t260"],
    policyRefs: ["policy://scenario-09/t260"],
    declarationSourceRefs: [MODULE_REF]
  });
}

function publishedHandoff(graphFunction, vector, module) {
  const outcome = compileGraphVectorExecutionHandoff({
    graphFunction,
    graphVector: vector,
    graphFunctions: module.graphFunctions,
    module,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle(),
    admittedTenantConformanceManifest: null
  });
  assert.equal(outcome.status, "published_startup_blocked", JSON.stringify(outcome.diagnostics));
  return outcome.handoff;
}

function fixture() {
  const inputMember = node("LabObservation");
  const outputMember = node("NormalizedObservation");
  const inputVector = node(
    "LabObservationVector",
    "Vector[schema://scenario-09/LabObservation]"
  );
  const outputVector = node(
    "NormalizedObservationVector",
    "Vector[schema://scenario-09/NormalizedObservation]"
  );
  const synthesis = node("LabSynthesis");
  const directInput = node("DirectBatchInput");
  const directOutput = node("DirectBatchOutput");

  const child = directFunction({
    name: "normalize_lab_observation",
    id: "graph-function://scenario-09/t260/normalize",
    input: inputMember,
    output: outputMember,
    roles: ["transform"],
    term: singleStage(inputMember, outputMember, "transform")
  });
  const reducer = directFunction({
    name: "reduce_normalized_observations",
    id: "graph-function://scenario-09/t260/reduce",
    input: outputVector,
    output: synthesis,
    roles: ["transform"],
    term: singleStage(outputVector, synthesis, "transform")
  });
  const directBatch = directFunction({
    name: "direct_batch",
    id: "graph-function://scenario-09/t260/direct-batch",
    input: directInput,
    output: directOutput,
    roles: ["transform"],
    term: C.batch(
      [
        singleStage(directInput, directOutput, "transform"),
        singleStage(directInput, directOutput, "transform")
      ],
      "batch://scenario-09/t260/direct"
    )
  });

  const inputMemberWitness = typedNode({ node: inputMember, decode: (raw) => raw });
  const outputMemberWitness = typedNode({ node: outputMember, decode: (raw) => raw });
  const inputVectorBoundary = hofVector(
    typedVectorNode({
      node: inputVector,
      member: inputMemberWitness,
      decode: (raw) => raw
    })
  );
  const outputVectorBoundary = hofVector(
    typedVectorNode({
      node: outputVector,
      member: outputMemberWitness,
      decode: (raw) => raw
    })
  );
  const hofHost = fan_out(
    hofUnaryRef({
      graphFunction: child.graphFunction,
      input: hofContract(inputMemberWitness),
      output: hofContract(outputMemberWitness)
    }),
    { over: inputVectorBoundary, into: outputVectorBoundary }
  ).graphFunction;
  const fanInSubject = fan_in(
    hofUnaryRef({
      graphFunction: reducer.graphFunction,
      input: outputVectorBoundary,
      output: hofContract(
        typedNode({ node: synthesis, decode: (raw) => raw })
      )
    }),
    outputVectorBoundary
  );

  const jobs = [hofHost, fanInSubject, directBatch.graphFunction].map(
    (graphFunction) =>
      constructJob({
        name: `job-${graphFunction.name}`,
        contracts: [
          constructContractRef({ kind: "graph_function", targetId: graphFunction.id })
        ],
        roles: [],
        tags: ["scenario-09", "t260"],
        policyHooks: emptySerializedAttrs()
      })
  );
  const module = constructModule({
    name: "scenario-09.t260.hof-batch",
    graphs: [
      hofHost.template.graph,
      child.graph,
      reducer.graph,
      directBatch.graph
    ],
    graphFunctions: [
      hofHost,
      child.graphFunction,
      fanInSubject,
      reducer.graphFunction,
      directBatch.graphFunction
    ],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs,
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });

  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://scenario-09/t260",
      bindingId: "binding://scenario-09/t260",
      catalogId: "catalog://scenario-09/t260",
      resolvedLockRef: "lock://scenario-09/t260",
      systemDeclarations: [
        [ENTRY_HOF, hofHost],
        [ENTRY_FAN_IN, fanInSubject],
        [ENTRY_BATCH, directBatch.graphFunction]
      ].map(([entryRef, graphFunction]) => ({
        kind: "runtime_library_entry",
        declaration: catalogDeclaration(entryRef, graphFunction),
        moduleRef: MODULE_REF,
        module
      })),
      orderedProductBatches: [],
      causationEventRefs: ["event://scenario-09/t260/catalog-bound"],
      correlationId: "correlation://scenario-09/t260"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  const catalogBasis = admission.basis;
  const selected = (entryRef) => {
    const rows = catalogBasis.executionBindings.filter((row) => row.entryRef === entryRef);
    assert.equal(rows.length, 1);
    return rows[0];
  };

  const childHandoff = publishedHandoff(child.graphFunction, child.vector, module);
  const reducerHandoff = publishedHandoff(fanInSubject, reducer.vector, module);
  const directBatchHandoff = publishedHandoff(
    directBatch.graphFunction,
    directBatch.vector,
    module
  );
  const hofCompilation = compileHofRelation({
    graphFunction: hofHost,
    graphFunctions: module.graphFunctions
  });
  assert.equal(hofCompilation.accepted, true);
  const fanInCompilation = compileGraphFunctionApplication({
    graphFunction: fanInSubject,
    graphFunctions: module.graphFunctions
  });
  assert.equal(fanInCompilation.accepted, true);
  const hofBinding = compileHofFanOutBinding({
    module,
    relation: hofCompilation.relation,
    childExecutionHandoff: childHandoff
  });
  const fanInBinding = compileFanInReductionBinding({
    module,
    relation: fanInCompilation.fanInRelation,
    executionHandoff: reducerHandoff
  });
  return {
    nodes: { inputMember, outputMember, inputVector, outputVector, synthesis },
    module,
    catalogBasis,
    selected,
    hofHost,
    fanInSubject,
    directBatch,
    childHandoff,
    reducerHandoff,
    directBatchHandoff,
    hofRelation: hofCompilation.relation,
    fanInRelation: fanInCompilation.fanInRelation,
    hofBinding,
    fanInBinding
  };
}

function admittedInputVector(value, cardinality = 3) {
  return admitHofVector({
    vectorRef: `vector://scenario-09/t260/input/${cardinality}`,
    basisRef: "basis://scenario-09/t260/lab-cut",
    vectorNodeRef: value.hofBinding.inputVectorNodeRef,
    vectorContractKey: value.hofBinding.inputVectorContractKey,
    memberNodeRef: value.hofBinding.inputMemberNodeRef,
    memberContractKey: value.hofBinding.inputMemberContractKey,
    producerRef: "producer://scenario-09/t260/lab-ingest",
    members: Array.from({ length: cardinality }, (_, ordinal) => ({
      ordinal,
      memberNodeRef: value.hofBinding.inputMemberNodeRef,
      memberContractKey: value.hofBinding.inputMemberContractKey,
      payloadRef: `payload://scenario-09/t260/lab/${ordinal}`,
      lineageRef: `lineage://scenario-09/t260/lab/${ordinal}`
    }))
  });
}

function childOutcome(request, disposition = "completed", overrides = {}) {
  const completed = disposition === "completed";
  return {
    kind: "c_batch_child_traversal_outcome",
    planRef: request.planRef,
    taskRef: request.taskRef,
    cCallRef: request.cCallRef,
    ordinal: request.ordinal,
    disposition,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: completed
      ? `payload://scenario-09/t260/normalized/${request.ordinal}`
      : null,
    responseContractRef: completed ? request.outputCarrierRef : null,
    terminalRef: `terminal://scenario-09/t260/child/${request.ordinal}`,
    reasonRef: completed ? null : `reason://scenario-09/t260/${disposition}`,
    evidenceRefs: [`evidence://scenario-09/t260/child/${request.ordinal}`],
    childGraphFunctionRef: request.childGraphFunctionRef,
    childBasisId: `basis://scenario-09/t260/child/${request.ordinal}`,
    childRunRef: `run://scenario-09/t260/child/${request.ordinal}`,
    childGraphCallId: `graph-call://scenario-09/t260/child/${request.ordinal}`,
    childFrameId: `frame://scenario-09/t260/child/${request.ordinal}`,
    ...overrides
  };
}

function stageOutcome(request, disposition = "completed", overrides = {}) {
  const completed = disposition === "completed";
  const carriesResult = completed && request.resultBearing;
  return {
    kind: "c_batch_stage_execution_outcome",
    planRef: request.planRef,
    taskRef: request.taskRef,
    cCallRef: request.cCallRef,
    ordinal: request.ordinal,
    disposition,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: carriesResult
      ? `payload://scenario-09/t260/direct/${request.ordinal}`
      : null,
    responseContractRef: carriesResult ? request.outputCarrierRef : null,
    terminalRef: `terminal://scenario-09/t260/stage/${request.ordinal}`,
    reasonRef: completed ? null : `reason://scenario-09/t260/${disposition}`,
    evidenceRefs: [`evidence://scenario-09/t260/stage/${request.ordinal}`],
    ...overrides
  };
}

function fanInOutcome(request, disposition = "completed", overrides = {}) {
  const completed = disposition === "completed";
  return {
    kind: "hof_fan_in_traversal_outcome",
    invocationRef: request.invocationRef,
    bindingRef: request.bindingRef,
    cCallRef: request.cCallRef,
    reducerGraphFunctionRef: request.reducerGraphFunctionRef,
    reducerBasisId: "basis://scenario-09/t260/reducer",
    reducerRunRef: "run://scenario-09/t260/reducer",
    reducerGraphCallId: "graph-call://scenario-09/t260/reducer",
    reducerFrameId: "frame://scenario-09/t260/reducer",
    terminalRef: "terminal://scenario-09/t260/reducer",
    disposition,
    outputContractKey: request.outputContractKey,
    outputPayloadRef: completed ? "payload://scenario-09/t260/synthesis" : null,
    responseContractRef: completed ? request.outputContractKey : null,
    reasonRef: completed ? null : `reason://scenario-09/t260/fan-in/${disposition}`,
    evidenceRefs: ["evidence://scenario-09/t260/reducer"],
    ...overrides
  };
}

function hofInvocation(value, vector, options = {}) {
  const selected = value.selected(ENTRY_HOF);
  const plan = options.plan ?? compileHofCBatchPlan({
    binding: value.hofBinding,
    selectedCatalogBinding: selected,
    inputVector: vector
  });
  const emitted = [];
  return {
    plan,
    emitted,
    input: {
      kind: "c_batch_invocation",
      plan,
      sourceAuthority: {
        kind: "hof_projection_source_authority",
        relation: value.hofRelation,
        binding: value.hofBinding,
        childExecutionHandoff: value.childHandoff,
        inputVector: vector
      },
      catalogBasis: value.catalogBasis,
      selectedCatalogEntryRef: options.selectedCatalogEntryRef ?? ENTRY_HOF,
      parentBasisId: "basis://scenario-09/t260/host",
      parentGraphFunctionRef: value.hofHost.id,
      parentGraphCallId: "graph-call://scenario-09/t260/host",
      parentFrameId: "frame://scenario-09/t260/host",
      edge: value.hofRelation.wrapperGraphVectorRef,
      vectorIndex: 0,
      attempt: 1,
      emit(events) {
        emitted.push(...events);
      },
      executeTask: options.executeTask ?? ((request) =>
        Promise.resolve(childOutcome(request)))
    }
  };
}

function fanInInvocation(value, vector, options = {}) {
  const emitted = [];
  return {
    emitted,
    input: {
      kind: "hof_fan_in_invocation",
      binding: value.fanInBinding,
      relation: value.fanInRelation,
      executionHandoff: value.reducerHandoff,
      inputVector: vector,
      selectedInputVectorBasisRef:
        options.selectedInputVectorBasisRef ?? vector.basisRef,
      applicationLineageRef:
        options.applicationLineageRef ?? value.fanInBinding.applicationLineageRef,
      catalogBasis: value.catalogBasis,
      selectedCatalogEntryRef: options.selectedCatalogEntryRef ?? ENTRY_FAN_IN,
      parentBasisId: "basis://scenario-09/t260/fan-in-parent",
      parentGraphFunctionRef: value.fanInSubject.id,
      parentGraphCallId: "graph-call://scenario-09/t260/fan-in-parent",
      parentFrameId: "frame://scenario-09/t260/fan-in-parent",
      edge: value.fanInBinding.reducerGraphVectorRef,
      vectorIndex: 0,
      attempt: 1,
      emit(events) {
        emitted.push(...events);
      },
      invokeReducer: options.invokeReducer ?? ((request) =>
        Promise.resolve(fanInOutcome(request)))
    }
  };
}

test("T-260 Scenario 09 executes runtime-cardinality fan-out and exact fan-in", async () => {
  const value = fixture();
  const inputVector = admittedInputVector(value, 3);
  const call = hofInvocation(value, inputVector);
  const ordinals = [];
  call.input.executeTask = async (request) => {
    ordinals.push(request.ordinal);
    assert.equal(request.kind, "c_batch_child_traversal_request");
    assert.equal(request.selectedCatalogEntryRef, ENTRY_HOF);
    return childOutcome(request);
  };
  const fanOut = await resolveCBatch(call.input);

  assert.equal(fanOut.status, "completed");
  assert.equal(fanOut.kind, "hof_c_batch_completed_resolution");
  assert.deepEqual(ordinals, [0, 1, 2]);
  assert.equal(fanOut.outputVector.members.length, 3);
  assert.deepEqual(
    fanOut.outputVector.members.map((member) => member.ordinal),
    [0, 1, 2]
  );
  assert.deepEqual(
    fanOut.outputVector.members.map((member) => member.lineageRef),
    inputVector.members.map((member) => member.lineageRef)
  );
  assert.equal(fanOut.emittedEvents.length, 15);
  for (const event of fanOut.emittedEvents) assertRuntimeEvent(event);

  let reducerCalls = 0;
  const fanInCall = fanInInvocation(value, fanOut.outputVector, {
    async invokeReducer(request) {
      reducerCalls += 1;
      assert.equal(request.inputVector.members.length, 3);
      assert.equal(request.applicationLineageRef, value.fanInBinding.applicationLineageRef);
      return fanInOutcome(request);
    }
  });
  const fanIn = await resolveHofFanIn(fanInCall.input);
  assert.equal(reducerCalls, 1);
  assert.equal(fanIn.status, "completed");
  assert.equal(fanIn.outputPayloadRef, "payload://scenario-09/t260/synthesis");
  assert.equal(fanIn.inputVectorBasisRef, inputVector.basisRef);
  assert.equal(fanIn.emittedEvents.length, 5);
  for (const event of fanInCall.emitted) assertRuntimeEvent(event);
});

test("T-260 HOF partial failure is all-or-block and leaves later ordinals unstarted", async () => {
  const value = fixture();
  const vector = admittedInputVector(value, 4);
  const called = [];
  const call = hofInvocation(value, vector, {
    async executeTask(request) {
      called.push(request.ordinal);
      return request.ordinal === 1
        ? childOutcome(request, "blocked")
        : childOutcome(request);
    }
  });
  const resolution = await resolveCBatch(call.input);
  assert.equal(resolution.kind, "c_batch_blocked_resolution");
  assert.equal(resolution.status, "blocked");
  assert.deepEqual(called, [0, 1]);
  assert.equal(resolution.completedTasks.length, 1);
  assert.equal(resolution.stoppingOrdinal, 1);
  assert.deepEqual(
    resolution.unstartedTaskRefs,
    call.plan.tasks.slice(2).map((task) => task.taskRef)
  );
  assert.equal(Object.hasOwn(resolution, "outputVector"), false);
  assert.equal(resolution.emittedEvents.length, 10);
});

test("T-260 held HOF work remains pending without output-vector truth", async () => {
  const value = fixture();
  const vector = admittedInputVector(value, 3);
  const called = [];
  const call = hofInvocation(value, vector, {
    async executeTask(request) {
      called.push(request.ordinal);
      return request.ordinal === 1
        ? childOutcome(request, "held")
        : childOutcome(request);
    }
  });
  const resolution = await resolveCBatch(call.input);
  assert.equal(resolution.status, "pending");
  assert.deepEqual(called, [0, 1]);
  assert.equal(resolution.stoppingOutcome.disposition, "held");
  assert.equal(Object.hasOwn(resolution, "outputVector"), false);
});

test("T-260 malformed and duplicate task outputs fail closed before aggregate truth", async () => {
  const value = fixture();
  const vector = admittedInputVector(value, 3);
  const cases = [
    {
      expectedCalls: 1,
      executeTask: async (request) => ({
        ...childOutcome(request),
        extraAuthority: true
      })
    },
    {
      expectedCalls: 2,
      executeTask: async (request) => childOutcome(request, "completed", {
        outputPayloadRef: "payload://scenario-09/t260/duplicate"
      })
    }
  ];
  for (const { executeTask, expectedCalls } of cases) {
    let calls = 0;
    const call = hofInvocation(value, vector);
    call.input.executeTask = async (request) => {
      calls += 1;
      return executeTask(request);
    };
    const resolution = await resolveCBatch(call.input);
    assert.equal(resolution.status, "runtime_failed");
    assert.equal(Object.hasOwn(resolution, "outputVector"), false);
    assert.equal(calls, expectedCalls);
  }
});

test("T-260 selected-entry and vector-basis drift stop before effects", async () => {
  const value = fixture();
  const vector = admittedInputVector(value, 3);
  let batchCalls = 0;
  const wrongEntry = hofInvocation(value, vector, {
    selectedCatalogEntryRef: ENTRY_BATCH,
    async executeTask(request) {
      batchCalls += 1;
      return childOutcome(request);
    }
  });
  await assert.rejects(() => resolveCBatch(wrongEntry.input), /catalog authority|selected catalog/u);
  assert.equal(batchCalls, 0);
  assert.equal(wrongEntry.emitted.length, 0);

  const fanOut = await resolveCBatch(hofInvocation(value, vector).input);
  let reducerCalls = 0;
  const foreignBasis = fanInInvocation(value, fanOut.outputVector, {
    selectedInputVectorBasisRef: "basis://scenario-09/t260/foreign",
    async invokeReducer(request) {
      reducerCalls += 1;
      return fanInOutcome(request);
    }
  });
  await assert.rejects(
    () => resolveHofFanIn(foreignBasis.input),
    /basis is invalid/u
  );
  assert.equal(reducerCalls, 0);
});

test("T-260 binding compilation rederives handoff truth from the selected Module", () => {
  const value = fixture();
  const forgedHandoff = {
    ...value.childHandoff,
    programBinding: {
      ...value.childHandoff.programBinding,
      bindingDigest: `sha256:${"0".repeat(64)}`
    }
  };
  assert.throws(
    () =>
      compileHofFanOutBinding({
        module: value.module,
        relation: value.hofRelation,
        childExecutionHandoff: forgedHandoff
      }),
    /program binding must rederive exactly/u
  );
});

test("T-260 fan-in preserves blocked, held, and malformed reducer truth", async () => {
  const value = fixture();
  const vector = admittedInputVector(value, 3);
  const fanOut = await resolveCBatch(hofInvocation(value, vector).input);
  const cases = [
    {
      expected: "blocked",
      invokeReducer: async (request) => fanInOutcome(request, "blocked")
    },
    {
      expected: "pending",
      invokeReducer: async (request) => fanInOutcome(request, "held")
    },
    {
      expected: "runtime_failed",
      invokeReducer: async (request) => ({
        ...fanInOutcome(request),
        alternateResultAuthority: true
      })
    }
  ];
  for (const { expected, invokeReducer } of cases) {
    let calls = 0;
    const call = fanInInvocation(value, fanOut.outputVector, {
      async invokeReducer(request) {
        calls += 1;
        return invokeReducer(request);
      }
    });
    const resolution = await resolveHofFanIn(call.input);
    assert.equal(resolution.status, expected);
    assert.equal(resolution.outputPayloadRef, null);
    assert.equal(calls, 1);
    assert.equal(resolution.emittedEvents.length, 5);
  }
});

test("T-260 direct root C.batch uses the same resolver without claiming vector truth", async () => {
  const value = fixture();
  const selected = value.selected(ENTRY_BATCH);
  const plan = compileDeclaredCBatchPlan({
    executionHandoff: value.directBatchHandoff,
    selectedCatalogBinding: selected,
    inputPayloadRef: "payload://scenario-09/t260/direct/input",
    inputLineageRef: "lineage://scenario-09/t260/direct/input"
  });
  const called = [];
  const emitted = [];
  const resolution = await resolveCBatch({
    kind: "c_batch_invocation",
    plan,
    sourceAuthority: {
      kind: "declared_batch_source_authority",
      executionHandoff: value.directBatchHandoff,
      inputPayloadRef: "payload://scenario-09/t260/direct/input",
      inputLineageRef: "lineage://scenario-09/t260/direct/input"
    },
    catalogBasis: value.catalogBasis,
    selectedCatalogEntryRef: ENTRY_BATCH,
    parentBasisId: "basis://scenario-09/t260/direct",
    parentGraphFunctionRef: value.directBatch.graphFunction.id,
    parentGraphCallId: "graph-call://scenario-09/t260/direct",
    parentFrameId: "frame://scenario-09/t260/direct",
    edge: value.directBatch.vector.id,
    vectorIndex: 0,
    attempt: 1,
    emit(events) {
      emitted.push(...events);
    },
    async executeTask(request) {
      called.push(request.ordinal);
      assert.equal(request.kind, "c_batch_stage_execution_request");
      return stageOutcome(request, "completed", {
        outputPayloadRef: "payload://scenario-09/t260/direct/shared"
      });
    }
  });
  assert.equal(resolution.kind, "c_batch_completed_resolution");
  assert.deepEqual(called, [0, 1]);
  assert.equal(Object.hasOwn(resolution, "outputVector"), false);
  assert.equal(emitted.length, 10);
});

test("T-260 admitted vectors reject empty, reordered, and duplicate member truth", () => {
  const value = fixture();
  const basis = {
    vectorRef: "vector://scenario-09/t260/negative",
    basisRef: "basis://scenario-09/t260/negative",
    vectorNodeRef: value.hofBinding.inputVectorNodeRef,
    vectorContractKey: value.hofBinding.inputVectorContractKey,
    memberNodeRef: value.hofBinding.inputMemberNodeRef,
    memberContractKey: value.hofBinding.inputMemberContractKey,
    producerRef: "producer://scenario-09/t260/negative"
  };
  assert.throws(() => admitHofVector({ ...basis, members: [] }), /non-empty/u);
  assert.throws(
    () => admitHofVector({ ...basis, members: [], alternateAuthority: true }),
    /non-canonical key set/u
  );
  assert.throws(
    () =>
      admitHofVector({
        ...basis,
        members: [
          {
            ordinal: 1,
            memberNodeRef: basis.memberNodeRef,
            memberContractKey: basis.memberContractKey,
            payloadRef: "payload://scenario-09/t260/a",
            lineageRef: "lineage://scenario-09/t260/a"
          }
        ]
      }),
    /contiguous/u
  );
  assert.throws(
    () =>
      admitHofVector({
        ...basis,
        members: [0, 1].map((ordinal) => ({
          ordinal,
          memberNodeRef: basis.memberNodeRef,
          memberContractKey: basis.memberContractKey,
          payloadRef: "payload://scenario-09/t260/duplicate",
          lineageRef: `lineage://scenario-09/t260/${ordinal}`
        }))
      }),
    /unique/u
  );

  const validMember = {
    ordinal: 0,
    memberNodeRef: basis.memberNodeRef,
    memberContractKey: basis.memberContractKey,
    payloadRef: "payload://scenario-09/t260/read-once",
    lineageRef: "lineage://scenario-09/t260/read-once"
  };
  assert.throws(
    () =>
      admitHofVector({
        ...basis,
        members: [{ ...validMember, alternateMemberAuthority: true }]
      }),
    /non-canonical key set/u
  );

  let vectorRefReads = 0;
  const readOnce = { ...basis, members: [validMember] };
  Object.defineProperty(readOnce, "vectorRef", {
    enumerable: true,
    get() {
      vectorRefReads += 1;
      return "vector://scenario-09/t260/read-once";
    }
  });
  const admitted = admitHofVector(readOnce);
  assert.equal(vectorRefReads, 1);
  assert.equal(admitted.vectorRef, "vector://scenario-09/t260/read-once");

  const valueVector = admittedInputVector(value, 1);
  assert.throws(
    () =>
      compileHofCBatchPlan({
        binding: value.hofBinding,
        selectedCatalogBinding: value.selected(ENTRY_HOF),
        inputVector: { ...valueVector, alternateAuthority: true }
      }),
    /non-canonical key set/u
  );
});
