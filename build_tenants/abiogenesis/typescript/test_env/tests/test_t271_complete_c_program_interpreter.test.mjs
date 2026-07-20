// Validates: T-271; REQ-L-GTL3-C-ALGEBRA-001..-017;
// REQ-R-ABG3-CCALL-001..-017.

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  cGraphFunctionRef,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
  serializeCProgramCanonical,
  typedInterface,
  typedNode,
  workflow
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
  compileCompleteCProgram,
  compiledCInvokingLociInDeclaredOrder,
  compiledCPlanNodesInDeclaredOrder
} from "../../build/semantic/code/src/abg/m03/contracts/complete_c_program.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  constructRuntimeActivityProbeObservedEvent,
  mintCCallRef
} from "../../build/semantic/code/src/abg/m03/contracts/event_factories.js";
import {
  constructAdmittedInvocationCarrier
} from "../../build/semantic/code/src/abg/m03/contracts/declared_execution_context.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  interpretCompleteCProgram
} from "../../build/semantic/code/src/abg/m03/runner/complete_c_program_runtime.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const ENTRY_REF = "catalog-entry://t271/system/parent";
const MODULE_REF = "gtl-module://t271/system";

function node(name) {
  return constructNode({
    id: `node://t271/${name.toLowerCase()}`,
    name,
    schema: { kind: "symbolic", ref: `schema://t271/${name.toLowerCase()}` },
    markov: ["boundary://t271/complete-c-program"],
    assetSurface: {
      kind: `t271_${name.toLowerCase()}`,
      standardsRefs: ["REQ-L-GTL3-C-ALGEBRA-001"],
      proofObligationRefs: ["proof://t271/complete-c-program"]
    },
    tags: ["t271"]
  });
}

function boundary(value) {
  return typedInterface(typedNode({ node: value, decode: (raw) => raw }));
}

function compositionDeclarations({ parentRef, vector, input, output, rows }) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${vector.id}`,
    hookRef: `hook://${vector.id}/composition`,
    hostGraphFunctionRef: parentRef,
    hostGraphVectorRef: vector.id,
    hostSourceNodeRefs: [input.id],
    hostTargetNodeRef: output.id,
    hostTargetSchemaRef: output.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: vector.id
    }),
    regimes: rows.map((row, order) => Object.freeze({
      bindingRef: `regime-binding://${vector.id}/${String(order)}`,
      stageRole: row.stageRole,
      regime: row.regime,
      role: row.role ?? "construct",
      order: row.order ?? order,
      authority: "evidence",
      inputCarrierRefs: [input.id],
      outputCarrierRefs: [output.id],
      evidenceRefs: [`evidence://t271/composition/${String(order)}`]
    })),
    standardsContextRefs: ["standard://t271/c-algebra"],
    policyContextRefs: ["policy://t271/complete-c-program"],
    carrierContextRefs: [input.id, output.id],
    assuranceContextRefs: ["assurance://t271/compiler"],
    closureContractRef: `closure://${vector.id}`
  });
}

function stage(input, output, role, resultBearing = false) {
  return C.of({
    input,
    output,
    stageRole: role,
    fibre: "F_D",
    armId: `arm://t271/${role}`,
    resultBearing,
    instructionCategoryRefs: [`instruction://t271/${role}`]
  });
}

function fixture(kind = "mixed") {
  const observation = node("Observation");
  const prepared = node("Prepared");
  const projection = node("Projection");
  const observationBoundary = boundary(observation);
  const preparedBoundary = boundary(prepared);
  const projectionBoundary = boundary(projection);
  const observationCarrier = cInterfaceCarrier(observationBoundary);
  const preparedCarrier = cInterfaceCarrier(preparedBoundary);
  const projectionCarrier = cInterfaceCarrier(projectionBoundary);
  const parentStub = constructGraphFunction({
    id: "graph-function://t271/parent",
    name: "t271.parent.stub",
    environment: constructEnvRef({
      requires: [observation],
      provides: [projection],
      carries: [observation, projection]
    }),
    inputs: [observation],
    outputs: [projection],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: "template://t271/parent-stub",
      graph: null,
      version: "1.0.0"
    }),
    effects: [],
    declarations: graphFunctionDeclarations([]),
    tags: ["t271", "self-reference-stub"]
  });
  const child = constructGraphFunction({
    id: "graph-function://t271/child",
    name: "t271.child",
    environment: constructEnvRef({
      requires: [prepared],
      provides: [projection],
      carries: [prepared, projection]
    }),
    inputs: [prepared],
    outputs: [projection],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: "template://t271/child",
      graph: null,
      version: "1.0.0"
    }),
    effects: [],
    declarations: graphFunctionDeclarations([]),
    tags: ["t271", "module-contained"]
  });
  const childRef = cGraphFunctionRef({
    graphFunction: child,
    input: preparedBoundary,
    output: projectionBoundary
  });
  const mixed = (role) => C.compose(
    stage(observationCarrier, preparedCarrier, role),
    workflow.C(childRef)
  );
  let term;
  let rows;
  if (kind === "edge") {
    term = C.edge({
      transform: stage(
        observationCarrier,
        preparedCarrier,
        "transform"
      ),
      evaluate: stage(preparedCarrier, preparedCarrier, "evaluate"),
      consequence: stage(
        preparedCarrier,
        projectionCarrier,
        "consequence",
        true
      )
    });
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_D" },
      { stageRole: "consequence", regime: "F_D" }
    ];
  } else if (kind === "batch") {
    term = C.batch(
      [mixed("prepare_first"), mixed("prepare_second")],
      "batch://t271/mixed"
    );
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" },
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "consequence", regime: "F_P" }
    ];
  } else if (kind === "batch_results") {
    const task = (suffix) => C.compose(
      stage(
        observationCarrier,
        preparedCarrier,
        `result_${suffix}`,
        true
      ),
      stage(preparedCarrier, projectionCarrier, `finish_${suffix}`)
    );
    term = C.batch(
      [task("first"), task("second")],
      "batch://t271/result-continuity"
    );
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_D" },
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "consequence", regime: "F_D" }
    ];
  } else if (kind === "retry") {
    term = C.retry(mixed("prepare_retry"), 3);
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "nested_retry") {
    term = C.retry(C.retry(mixed("prepare_nested_retry"), 1), 2);
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "identity") {
    term = C.compose(C.id(observationCarrier), mixed("prepare_identity"));
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "identity_right") {
    term = C.compose(mixed("prepare_identity_right"), C.id(projectionCarrier));
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "multiple_results") {
    term = C.compose(
      stage(observationCarrier, preparedCarrier, "explicit_result", true),
      workflow.C(childRef)
    );
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "self") {
    term = workflow.C(cGraphFunctionRef({
      graphFunction: parentStub,
      input: observationBoundary,
      output: projectionBoundary
    }));
    rows = [{ stageRole: "transform", regime: "F_D" }];
  } else if (kind === "missing_fibre") {
    term = C.compose(
      C.of({
        input: observationCarrier,
        output: preparedCarrier,
        stageRole: "prepare_missing_fibre",
        fibre: "F_H",
        armId: "arm://t271/missing-fibre",
        resultBearing: false
      }),
      workflow.C(childRef)
    );
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  } else if (kind === "ambiguous_composition") {
    term = mixed("prepare_ambiguous");
    rows = [
      { stageRole: "transform", regime: "F_D", order: 0 },
      { stageRole: "evaluate", regime: "F_P", order: 2 }
    ];
  } else {
    term = mixed("prepare");
    rows = [
      { stageRole: "transform", regime: "F_D" },
      { stageRole: "evaluate", regime: "F_P" }
    ];
  }
  const program = declareCProgram({
    programRef: `program://t271/${kind}`,
    term,
    proportionalityClass: "P1"
  });
  const vectorSeed = constructGraphVector({
    id: `graph-vector://t271/${kind}`,
    name: `t271.${kind}`,
    source: [observation],
    target: projection,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: graphVectorDeclarations([]),
    tags: ["t271", kind]
  });
  const composition = compositionDeclarations({
    parentRef: "graph-function://t271/parent",
    vector: vectorSeed,
    input: observation,
    output: projection,
    rows
  });
  const vector = constructGraphVector({
    ...vectorSeed,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef),
      ...composition.entries
    ])
  });
  const graph = constructGraph({
    name: `t271.${kind}.graph`,
    inputs: [observation],
    outputs: [projection],
    nodes: [observation, prepared, projection],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: [],
    tags: ["t271", kind]
  });
  const parent = constructGraphFunction({
    id: "graph-function://t271/parent",
    name: "t271.parent",
    environment: constructEnvRef({
      requires: [observation],
      provides: [projection],
      carries: [observation, prepared, projection]
    }),
    inputs: [observation],
    outputs: [projection],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: `template://t271/${kind}`,
      graph,
      version: null
    }),
    effects: [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["t271", "public-parent"]
  });
  const module = constructModule({
    name: `t271.complete-c-${kind}`,
    graphs: [graph],
    graphFunctions: [parent, child],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: `t271-${kind}-job`,
        contracts: [
          constructContractRef({ kind: "graph_function", targetId: parent.id })
        ],
        roles: [],
        tags: ["t271"],
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
    graphFunction: parent,
    graphVector: vector,
    graphFunctions: module.graphFunctions,
    module,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle(),
    admittedTenantConformanceManifest: null
  });
  assert.equal(
    handoffOutcome.status,
    kind === "self"
      ? "blocked_successor_constructor"
      : kind === "missing_fibre" ||
          kind === "ambiguous_composition" ||
          kind === "multiple_results"
        ? "invalid"
        : "published_startup_blocked",
    JSON.stringify(handoffOutcome.diagnostics)
  );
  return {
    observation,
    prepared,
    projection,
    child,
    parent,
    vector,
    program,
    module,
    handoffOutcome
  };
}

function admittedCatalog(value) {
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t271/system/parent",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t271",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: value.parent.id,
    interfaceRef: "interface://t271/parent",
    sourceContractRef: "contract://t271/observation",
    targetContractRef: "contract://t271/projection",
    contextRefs: ["context://t271/complete-c-program"],
    authorityRefs: ["REQ-L-GTL3-C-ALGEBRA-001"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t271/fixture"],
    readinessRefs: ["readiness://t271/ready"],
    proofRefs: ["proof://t271/complete-c-program"],
    policyRefs: ["policy://t271/default"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t271",
      bindingId: "binding://t271",
      catalogId: "catalog://t271",
      resolvedLockRef: "lock://t271",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module: value.module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t271/catalog-bound"],
      correlationId: "correlation://t271/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  return admission.basis;
}

function fixtureGraphEdge(request) {
  const prefix = "graph-vector://t271/";
  assert.equal(
    request.graphVectorRef.startsWith(prefix),
    true,
    "the T-271 fixture request keeps its declared GraphVector identity"
  );
  return `t271.${request.graphVectorRef.slice(prefix.length)}`;
}

function completedAtom(request, suffix = "completed") {
  const result = Object.freeze({
    kind: "c_program_atom_result",
    planRef: request.planRef,
    nodeRef: request.nodeRef,
    cursorRef: request.cursorRef,
    status: "completed",
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: `payload://t271/${suffix}/${request.sourcePath}`,
    responseContractRef: request.outputCarrierRef,
    outputLineageRef: `lineage://t271/${suffix}/${request.sourcePath}`,
    reasonRef: null,
    failureClass: null,
    evidenceRefs: [`evidence://t271/${suffix}/${request.sourcePath}`],
    cCallRef: request.cCallRef,
    sourceEventRefs: [`event://t271/${suffix}/${request.sourcePath}`]
  });
  const admittedTargetCarrier = constructAdmittedInvocationCarrier({
    sourceNodeRef: request.nodeRef,
    schemaRef: request.outputCarrierRef,
    carrierRef: result.outputPayloadRef,
    admissionRef: result.outputLineageRef,
    value: Object.freeze({
      kind: "t271_admitted_target",
      sourcePath: request.sourcePath,
      suffix
    })
  });
  const authoritySnapshotRef =
    `authority-snapshot://t271/${suffix}/${request.sourcePath}`;
  const authorityDigest = stableSha256Digest({
    nodeRef: request.nodeRef,
    planRef: request.planRef
  });
  const inputDigest = stableSha256Digest({
    payloadRef: request.inputPayloadRef,
    lineageRef: request.inputLineageRef
  });
  const validationRef = `validation://t271/${suffix}/${request.sourcePath}`;
  const evidenceRef = `evidence://t271/admitted/${suffix}/${request.sourcePath}`;
  const targetPayloadIdentityDigest =
    `digest:target-identity:${stableSha256Digest({
      cCallRef: request.cCallRef,
      carrierRef: admittedTargetCarrier.carrierRef,
      contractRef: result.responseContractRef
    })}`;
  const eventScope = Object.freeze({
    basisId: request.parentBasisId,
    graphCallId: request.parentGraphCallId,
    frameId: request.parentFrameId,
    vectorIndex: request.vectorIndex,
    edge: fixtureGraphEdge(request)
  });
  const evidenceEvents = Object.freeze([
    Object.freeze({
      kind: "authority_snapshot_admitted",
      ...eventScope,
      authoritySnapshotRef,
      authorityRefs: Object.freeze([request.nodeRef]),
      inputRefs: Object.freeze([request.inputPayloadRef]),
      authorityDigest,
      inputDigest,
      closureCapable: true,
      contradictoryAuthority: false,
      deferredAuthorityRefs: Object.freeze([]),
      providerRefs: Object.freeze([request.executionGraphFunctionRef]),
      policyRefs: Object.freeze([])
    }),
    Object.freeze({
      kind: "payload_observed",
      ...eventScope,
      payloadRef: admittedTargetCarrier.carrierRef,
      payloadClass: "t271_test_target",
      schemaRef: admittedTargetCarrier.schemaRef,
      contractRef: result.responseContractRef,
      digest: targetPayloadIdentityDigest,
      producerRef: request.nodeRef,
      sourceEventRef: request.cCallRef,
      actorInvocationId: null,
      authorityRef: authoritySnapshotRef,
      inputDigest,
      policyRefs: Object.freeze([])
    }),
    Object.freeze({
      kind: "payload_validated",
      ...eventScope,
      payloadRef: admittedTargetCarrier.carrierRef,
      schemaRef: admittedTargetCarrier.schemaRef,
      contractRef: result.responseContractRef,
      contractDigest: stableSha256Digest(result.responseContractRef),
      digest: targetPayloadIdentityDigest,
      validationRef,
      evidenceRef,
      policyRefs: Object.freeze([])
    }),
    Object.freeze({
      kind: "evidence_admitted",
      ...eventScope,
      evidenceRef,
      payloadRef: admittedTargetCarrier.carrierRef,
      authorityRef: authoritySnapshotRef,
      authorityDigest,
      inputDigest,
      providerRefs: Object.freeze([request.executionGraphFunctionRef]),
      policyRefs: Object.freeze([]),
      complete: true,
      shallow: false,
      contradictsAuthority: false,
      deferred: false
    })
  ]);
  return Object.freeze({
    kind: "c_program_atom_invocation_submission",
    result,
    admittedTargetCarrier,
    interiorEvents: Object.freeze([]),
    evidenceEvents,
    closeBasis: Object.freeze({
      kind: "c_program_atom_close_basis",
      evidenceClass: request.kind === "c_program_workflow_atom_request"
        ? request.evidenceClass
        : "t271_test_target",
      evidenceRefs: Object.freeze([
        authoritySnapshotRef,
        validationRef,
        evidenceRef
      ]),
      resultContractRef: result.responseContractRef
    })
  });
}

function runtimeFailure(request, attempt) {
  return Object.freeze({
    kind: "c_program_atom_invocation_submission",
    result: Object.freeze({
    kind: "c_program_atom_result",
    planRef: request.planRef,
    nodeRef: request.nodeRef,
    cursorRef: request.cursorRef,
    status: "runtime_failed",
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: null,
    responseContractRef: null,
    outputLineageRef: null,
    reasonRef: `reason://t271/transport/${String(attempt)}`,
    failureClass: "transport_failure",
    evidenceRefs: [`evidence://t271/failure/${String(attempt)}`],
    cCallRef: request.cCallRef,
    sourceEventRefs: [`event://t271/failure/${String(attempt)}`]
    }),
    admittedTargetCarrier: null,
    interiorEvents: Object.freeze([]),
    evidenceEvents: Object.freeze([]),
    closeBasis: null
  });
}

function withRuntimeProbe(request, submission) {
  return Object.freeze({
    ...submission,
    interiorEvents: Object.freeze([
      constructRuntimeActivityProbeObservedEvent({
        basisId: request.parentBasisId,
        graphFunctionId: request.executionGraphFunctionRef,
        runId: null,
        workKey: null,
        graphCallId: request.parentGraphCallId,
        frameId: request.parentFrameId,
        vectorIndex: request.vectorIndex,
        edge: fixtureGraphEdge(request),
        actorInvocationId: null,
        workerId: null,
        backendId: null,
        systemRef: "system://t271/interpreter",
        probeRef: `probe://t271/${request.cursorRef}`,
        probeSource: "graph_call_frame",
        activityRef: request.cCallRef,
        elapsedMs: 0,
        observedAtMs: 0,
        evidenceRefs: [request.cCallRef],
        detail: null,
        causationEventRefs: [request.cCallRef],
        correlationId: `correlation://t271/${request.cursorRef}`
      })
    ])
  });
}

function withEvidenceAuthority(submission, authorityRef) {
  return Object.freeze({
    ...submission,
    evidenceEvents: Object.freeze(submission.evidenceEvents.map((event) =>
      event.kind === "payload_observed" || event.kind === "evidence_admitted"
        ? Object.freeze({ ...event, authorityRef })
        : event
    ))
  });
}

function resealReceipt(receipt, changes) {
  const { receiptRef: _receiptRef, receiptDigest: _receiptDigest, ...basis } = {
    ...receipt,
    ...changes
  };
  const receiptDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    receiptRef: `abg://c-program-receipt/${receiptDigest.slice("sha256:".length)}`,
    receiptDigest
  });
}

function resealBatchReceipt(receipt, changes) {
  const { receiptRef: _receiptRef, receiptDigest: _receiptDigest, ...basis } = {
    ...receipt,
    ...changes
  };
  const receiptDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    receiptRef:
      `abg://c-program-batch-projection-receipt/${receiptDigest.slice("sha256:".length)}`,
    receiptDigest
  });
}

function resealPlan(plan, changes) {
  const { planRef: _planRef, planDigest: _planDigest, ...basis } = {
    ...plan,
    ...changes
  };
  const planDigest = stableSha256Digest(basis);
  return Object.freeze({
    ...basis,
    planRef: `abg://compiled-c-program/${planDigest.slice("sha256:".length)}`,
    planDigest
  });
}

function invocation(value, options = {}) {
  return {
    kind: "c_program_interpreter_invocation",
    plan: value.handoffOutcome.handoff.completeProgramPlan,
    catalogBasis: admittedCatalog(value),
    selectedCatalogEntryRef: ENTRY_REF,
    parentBasisId: "basis://t271/parent",
    parentGraphCallId: "graph-call://t271/parent",
    parentFrameId: "frame://t271/parent",
    vectorIndex: 0,
    inputPayloadRef: "payload://t271/observation",
    inputLineageRef: "lineage://t271/observation",
    replayReceipts: options.replayReceipts ?? [],
    invokeAdmittedAtom: options.invokeAdmittedAtom ?? (async (request) =>
      completedAtom(request))
  };
}

function flattenPlan(node) {
  if (node.kind === "compiled_c_sequence") {
    return [node, ...node.children.flatMap(flattenPlan)];
  }
  if (node.kind === "compiled_c_complete_batch") {
    return [node, ...node.tasks.flatMap((task) => flattenPlan(task.child))];
  }
  if (node.kind === "compiled_c_complete_retry") {
    return [node, ...flattenPlan(node.child)];
  }
  return [node];
}

test("T-271 native and canonical raw programs compile to one sealed plan", () => {
  const value = fixture("mixed");
  const handoff = value.handoffOutcome.handoff;
  assert.equal(handoff.programDisposition, "complete_c_program");
  assert.equal(handoff.normalizedProgram, null);
  assert.equal(handoff.completeProgramPlan.resultCardinality, "one");

  const raw = JSON.parse(serializeCProgramCanonical(value.program));
  const compiled = compileCompleteCProgram({
    module: value.module,
    executionGraphFunction: value.parent,
    compositionOwnerGraphFunction: value.parent,
    graphVector: value.vector,
    programBinding: handoff.programBinding,
    program: raw,
    composition: handoff.compositionSelection
  });
  assert.equal(compiled.status, "compiled", JSON.stringify(compiled.diagnostics));
  assert.equal(compiled.plan.planDigest, handoff.completeProgramPlan.planDigest);
  assert.deepEqual(
    flattenPlan(compiled.plan.root).map((node) => node.sourcePath),
    ["$.term", "$.term.left", "$.term.right"]
  );
  assert.equal(compiled.plan.root.children[1].resultCardinality, "one");
});

test("T-271 projects one canonical node order and retry-coordinate authority", () => {
  const value = fixture("nested_retry");
  const plan = value.handoffOutcome.handoff.completeProgramPlan;
  const nodes = compiledCPlanNodesInDeclaredOrder(plan);
  const loci = compiledCInvokingLociInDeclaredOrder(plan);

  assert.equal(nodes.length, plan.authoredNodeCount);
  assert.equal(loci.length, plan.invokingLocusCount);
  assert.deepEqual(loci.map((row) => row.node.nodeRef), [
    plan.root.child.child.children[0].nodeRef,
    plan.root.child.child.children[1].nodeRef
  ]);
  assert.deepEqual(loci.map((row) => row.retryBudgets), [
    [2, 1],
    [2, 1]
  ]);
});

test("T-271 mixed composition threads exact carriers and replays without effects", async () => {
  const value = fixture("mixed");
  const observed = [];
  const first = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      observed.push(request);
      return completedAtom(request, String(observed.length));
    }
  }));
  assert.equal(first.status, "completed");
  assert.equal(observed.length, 2);
  assert.equal(observed[0].kind, "c_program_stage_atom_request");
  assert.equal(observed[1].kind, "c_program_workflow_atom_request");
  assert.equal(observed[0].outputCarrierRef, observed[1].inputCarrierRef);
  assert.equal(first.replayReceipts.length, 2);

  let repeated = 0;
  const replayed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: first.replayReceipts,
    invokeAdmittedAtom: async () => {
      repeated += 1;
      throw new Error("replay repeated an effect");
    }
  }));
  assert.equal(replayed.status, "completed");
  assert.equal(repeated, 0);
  assert.equal(replayed.resultPayloadRef, first.resultPayloadRef);
});

test("T-271 conserves the exact current cursor digest through request, receipt, and replay", async () => {
  const value = fixture("mixed");
  const requests = [];
  const first = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      requests.push(request);
      return completedAtom(request, `cursor-${String(requests.length)}`);
    }
  }));
  assert.equal(first.status, "completed");
  assert.equal(requests.length, 2);

  const receipts = first.replayReceipts.filter(
    (receipt) => receipt.kind === "c_program_atom_receipt"
  );
  assert.equal(receipts.length, requests.length);
  for (const request of requests) {
    assert.match(request.cursorDigest, /^sha256:[0-9a-f]{64}$/u);
    const receipt = receipts.find((row) => row.cCallRef === request.cCallRef);
    assert.notEqual(receipt, undefined);
    assert.equal(receipt.cursorRef, request.cursorRef);
    assert.equal(receipt.cursorDigest, request.cursorDigest);
  }

  const resumedRequests = [];
  const resumed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: [receipts[0]],
    invokeAdmittedAtom: async (request) => {
      resumedRequests.push(request);
      return completedAtom(request, "cursor-resumed");
    }
  }));
  assert.equal(resumed.status, "completed");
  assert.equal(resumedRequests.length, 1);
  assert.equal(resumedRequests[0].cursorRef, requests[1].cursorRef);
  assert.equal(resumedRequests[0].cursorDigest, requests[1].cursorDigest);

  const forgedCursorDigest = `sha256:${"f".repeat(64)}`;
  assert.notEqual(forgedCursorDigest, receipts[0].cursorDigest);
  const forgedReceipt = resealReceipt(receipts[0], {
    cursorDigest: forgedCursorDigest
  });
  let effects = 0;
  await assert.rejects(
    () => interpretCompleteCProgram(invocation(value, {
      replayReceipts: [forgedReceipt, receipts[1]],
      invokeAdmittedAtom: async (request) => {
        effects += 1;
        return completedAtom(request);
      }
    })),
    /replay receipt differs from current cursor/u
  );
  assert.equal(effects, 0);
});

test("T-271 cursor basis excludes batch siblings across timing and partial replay", async () => {
  const value = fixture("batch_results");
  const run = async ({
    firstTaskVariant,
    delayedTaskOrdinal,
    replayReceipts = []
  }) => {
    const requests = [];
    const outcome = await interpretCompleteCProgram(invocation(value, {
      replayReceipts,
      invokeAdmittedAtom: async (request) => {
        requests.push(request);
        if (request.taskOrdinal === delayedTaskOrdinal) {
          await new Promise((resolve) => setTimeout(resolve, 2));
        }
        const suffix = request.taskOrdinal === 0
          ? `sibling-${firstTaskVariant}-${request.sourcePath}`
          : `stable-target-${request.sourcePath}`;
        return completedAtom(request, suffix);
      }
    }));
    assert.equal(outcome.status, "completed");
    return { outcome, requests };
  };

  const slowFirst = await run({
    firstTaskVariant: "slow-first",
    delayedTaskOrdinal: 0
  });
  const slowSecond = await run({
    firstTaskVariant: "slow-second",
    delayedTaskOrdinal: 1
  });
  const targetRequests = (rows) => rows.filter(
    (request) => request.taskOrdinal === 1
  );
  const baselineTarget = targetRequests(slowFirst.requests);
  const changedSiblingTarget = targetRequests(slowSecond.requests);
  assert.equal(baselineTarget.length, 2);
  assert.equal(changedSiblingTarget.length, 2);
  assert.deepEqual(
    changedSiblingTarget.map((request) => request.cursorDigest),
    baselineTarget.map((request) => request.cursorDigest)
  );

  const firstTaskReplay = slowSecond.outcome.replayReceipts.filter(
    (receipt) =>
      receipt.kind === "c_program_atom_receipt" &&
      receipt.taskOrdinal === 0
  ).reverse();
  assert.equal(firstTaskReplay.length, 2);
  const partial = await run({
    firstTaskVariant: "not-invoked",
    delayedTaskOrdinal: 1,
    replayReceipts: firstTaskReplay
  });
  assert.equal(
    partial.requests.every((request) => request.taskOrdinal === 1),
    true
  );
  assert.deepEqual(
    targetRequests(partial.requests).map((request) => request.cursorDigest),
    baselineTarget.map((request) => request.cursorDigest)
  );

  const edge = fixture("edge");
  const originalEdge = await interpretCompleteCProgram(invocation(edge, {
    invokeAdmittedAtom: async (request) => completedAtom(request, request.sourcePath)
  }));
  let replayEffects = 0;
  const reversedEdge = await interpretCompleteCProgram(invocation(edge, {
    replayReceipts: [...originalEdge.replayReceipts].reverse(),
    invokeAdmittedAtom: async (request) => {
      replayEffects += 1;
      return completedAtom(request);
    }
  }));
  assert.equal(reversedEdge.status, "completed");
  assert.equal(replayEffects, 0);
  assert.equal(reversedEdge.resultPayloadRef, originalEdge.resultPayloadRef);
});

test("T-271 nested batch preserves distinct task paths and all-or-block", async () => {
  const value = fixture("batch");
  const requests = [];
  const result = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      requests.push(request);
      return completedAtom(request, `task-${String(request.taskOrdinal)}`);
    }
  }));
  assert.equal(result.status, "completed");
  assert.deepEqual(
    requests.map((request) => request.taskOrdinal),
    [0, 0, 1, 1]
  );
  assert.equal(new Set(requests.map((request) => request.cursorRef)).size, 4);

  let calls = 0;
  const blocked = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      calls += 1;
      if (request.taskOrdinal === 0 && request.kind === "c_program_stage_atom_request") {
        const failed = runtimeFailure(request, 1);
        return {
          ...failed,
          result: {
            ...failed.result,
            failureClass: "capability_missing"
          }
        };
      }
      return completedAtom(request);
    }
  }));
  assert.equal(blocked.status, "runtime_failed");
  assert.equal(calls, 1);
});

test("T-271 nested retry re-enters the child plan under the shared retry law", async () => {
  const value = fixture("retry");
  const requests = [];
  const result = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      requests.push(request);
      if (request.retryAttempt === 1) return runtimeFailure(request, 1);
      return completedAtom(request, `attempt-${String(request.retryAttempt)}`);
    }
  }));
  assert.equal(result.status, "completed");
  assert.deepEqual(
    requests.map((request) => [request.kind, request.retryAttempt]),
    [
      ["c_program_stage_atom_request", 1],
      ["c_program_stage_atom_request", 2],
      ["c_program_workflow_atom_request", 2]
    ]
  );
  const retryReceipt = result.replayReceipts.find(
    (receipt) =>
      receipt.kind === "c_program_atom_receipt" &&
      receipt.judgment === "retry"
  );
  assert.notEqual(retryReceipt, undefined);
  assert.equal(retryReceipt.retryPolicyRef, value.handoffOutcome.handoff
    .completeProgramPlan.root.retryPolicyRef);
  assert.equal(
    retryReceipt.runtimeEvents.some(
      (event) => event.kind === "c_call_judged" && event.judgment === "retry"
    ),
    true
  );
});

test("T-271 malformed retry output records canonical retry truth and replays without effects", async () => {
  const value = fixture("retry");
  let calls = 0;
  const first = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      calls += 1;
      if (calls === 1) return {};
      return completedAtom(request, `malformed-repair-${String(calls)}`);
    }
  }));
  assert.equal(first.status, "completed");
  const failed = first.replayReceipts.find(
    (receipt) =>
      receipt.kind === "c_program_atom_receipt" &&
      receipt.status === "runtime_failed"
  );
  assert.notEqual(failed, undefined);
  assert.equal(failed.judgment, "retry");
  assert.equal(failed.failureClass, "contract_failure");
  assert.equal(
    failed.runtimeEvents.some(
      (event) => event.kind === "c_call_judged" && event.judgment === "retry"
    ),
    true
  );

  let repeated = 0;
  const replayed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: first.replayReceipts,
    invokeAdmittedAtom: async () => {
      repeated += 1;
      throw new Error("malformed retry replay repeated an effect");
    }
  }));
  assert.equal(replayed.status, "completed");
  assert.equal(repeated, 0);

  const forgedPolicyRef = "policy://t271/forged-retry";
  const forgedPolicyDigest = `sha256:${"0".repeat(64)}`;
  const forgedPolicyReceipt = resealReceipt(failed, {
    retryPolicyRef: forgedPolicyRef,
    retryPolicyDigest: forgedPolicyDigest,
    runtimeEvents: failed.runtimeEvents.map((event) =>
      event.kind === "c_call_evidenced"
        ? {
            ...event,
            evidenceRefs: [
              `retry-policy:${forgedPolicyRef}`,
              `retry-policy-digest:${forgedPolicyDigest}`
            ]
          }
        : event)
  });
  let forgedEffects = 0;
  await assert.rejects(
    interpretCompleteCProgram(invocation(value, {
      replayReceipts: first.replayReceipts.map((receipt) =>
        receipt === failed ? forgedPolicyReceipt : receipt),
      invokeAdmittedAtom: async () => {
        forgedEffects += 1;
        throw new Error("forged retry policy repeated an effect");
      }
    })),
    /retry receipt differs from shared policy/u
  );
  assert.equal(forgedEffects, 0);
});

test("T-271 nested retry coordinates remain distinct and replay exact", async () => {
  const value = fixture("nested_retry");
  const requests = [];
  const first = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      requests.push(request);
      if (
        request.kind === "c_program_stage_atom_request" &&
        request.retryPath[0] === 1
      ) {
        return runtimeFailure(request, 1);
      }
      return completedAtom(request, request.retryPath.join("-"));
    }
  }));
  assert.equal(first.status, "completed");
  assert.deepEqual(
    requests.map((request) => request.retryPath),
    [[1, 1], [2, 1], [2, 1]]
  );
  assert.equal(new Set(requests.map((request) => request.cursorRef)).size, 3);
  assert.equal(new Set(requests.map((request) => request.cCallRef)).size, 3);

  let repeated = 0;
  const replayed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: first.replayReceipts,
    invokeAdmittedAtom: async () => {
      repeated += 1;
      throw new Error("nested retry replay repeated an effect");
    }
  }));
  assert.equal(replayed.status, "completed");
  assert.equal(repeated, 0);
});

test("T-271 canonical C-call identity separates serial same-role loci", () => {
  const locus = {
    basisId: "basis://t271/same-role",
    graphCallId: "graph-call://t271/same-role",
    frameId: "frame://t271/same-role",
    vectorIndex: 0,
    stageRole: "repeat",
    taskOrdinal: null,
    attempt: 1,
    retryPath: []
  };
  const first = mintCCallRef({
    ...locus,
    programLocusRef: "abg://compiled-c-node/first"
  });
  const second = mintCCallRef({
    ...locus,
    programLocusRef: "abg://compiled-c-node/second"
  });
  assert.notEqual(first, second);

});

test("T-271 C.id is effect-free and canonical path identity remains exact", async () => {
  for (const kind of ["identity", "identity_right"]) {
    const value = fixture(kind);
    const requests = [];
    const result = await interpretCompleteCProgram(invocation(value, {
      invokeAdmittedAtom: async (request) => {
        requests.push(request);
        return completedAtom(request);
      }
    }));
    assert.equal(result.status, "completed");
    assert.equal(requests.length, 2);
    assert.equal(
      flattenPlan(value.handoffOutcome.handoff.completeProgramPlan.root)
        .filter((node) => node.kind === "compiled_c_identity").length,
      1
    );
  }
});

test("T-271 C.edge retains named field paths and direct-form parity", async () => {
  const value = fixture("edge");
  const handoff = value.handoffOutcome.handoff;
  assert.equal(handoff.programDisposition, "flat_executable");
  assert.notEqual(handoff.normalizedProgram, null);
  assert.equal(handoff.completeProgramPlan.root.kind, "compiled_c_sequence");
  assert.equal(handoff.completeProgramPlan.root.sourceConstructor, "c_edge");
  assert.deepEqual(
    handoff.completeProgramPlan.root.children.map((child) => child.sourcePath),
    ["$.term.transform", "$.term.evaluate", "$.term.consequence"]
  );
  const requests = [];
  const result = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      requests.push(request);
      return completedAtom(request);
    }
  }));
  assert.equal(result.status, "completed");
  assert.deepEqual(
    requests.map((request) => request.domainStageRole),
    handoff.normalizedProgram.stages.map((stage) => stage.stageRole)
  );
});

test("T-271 carrier and composition failures stop in compilation", () => {
  const value = fixture("mixed");
  const raw = JSON.parse(serializeCProgramCanonical(value.program));
  raw.term.right.inputCarrierRef = "gtl.c.interface-contract:stale";
  const carrierFailure = compileCompleteCProgram({
    module: value.module,
    executionGraphFunction: value.parent,
    compositionOwnerGraphFunction: value.parent,
    graphVector: value.vector,
    programBinding: value.handoffOutcome.handoff.programBinding,
    program: raw,
    composition: value.handoffOutcome.handoff.compositionSelection
  });
  assert.equal(carrierFailure.status, "invalid");
  assert.equal(
    carrierFailure.diagnostics[0].diagnosticId,
    "gtl-c-program-admission-invalid"
  );

  const missing = fixture("missing_fibre");
  assert.equal(
    missing.handoffOutcome.sourceDiagnostics[0].diagnosticId,
    "gtl-c-program-composition-binding-missing"
  );
  const ambiguous = fixture("ambiguous_composition");
  assert.equal(
    ambiguous.handoffOutcome.sourceDiagnostics[0].diagnosticId,
    "gtl-c-program-composition-binding-ambiguous"
  );
});

test("T-271 preserves explicit and terminal-workflow result cardinality", () => {
  const value = fixture("multiple_results");
  assert.equal(value.handoffOutcome.status, "invalid");
  assert.equal(
    value.handoffOutcome.sourceDiagnostics.some(
      (diagnostic) =>
        diagnostic.diagnosticId === "gtl-c-program-result-cardinality-invalid" &&
        diagnostic.actualRelation === "many"
    ),
    true
  );
});

test("T-271 batch projection preserves task results and replays one sealed projection", async () => {
  const value = fixture("batch");
  const first = await interpretCompleteCProgram(invocation(value));
  assert.equal(first.status, "completed");
  assert.notEqual(first.resultPayloadRef, first.outputPayloadRef);
  const projectionReceipt = first.replayReceipts.find(
    (receipt) => receipt.kind === "c_program_batch_projection_receipt"
  );
  assert.notEqual(projectionReceipt, undefined);
  assert.equal(
    projectionReceipt.evidenceRefs.some((ref) =>
      ref.startsWith("batch-projection-basis:sha256:")),
    true
  );
  let replayEffects = 0;
  const replayed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: first.replayReceipts,
    invokeAdmittedAtom: async () => {
      replayEffects += 1;
      throw new Error("batch task replayed");
    }
  }));
  assert.equal(replayed.status, "completed");
  assert.equal(replayed.outputPayloadRef, first.outputPayloadRef);
  assert.equal(replayed.resultPayloadRef, first.resultPayloadRef);
  assert.equal(replayEffects, 0);
});

test("T-271 batch result projection changes independently from stable terminal output", async () => {
  const value = fixture("batch_results");
  const execute = async (resultSuffix) => interpretCompleteCProgram(
    invocation(value, {
      invokeAdmittedAtom: async (request) => completedAtom(
        request,
        request.resultBearing ? resultSuffix : "stable-terminal"
      )
    })
  );
  const first = await execute("result-one");
  const second = await execute("result-two");
  assert.equal(first.status, "completed");
  assert.equal(second.status, "completed");
  assert.equal(first.outputPayloadRef, second.outputPayloadRef);
  assert.notEqual(first.resultPayloadRef, second.resultPayloadRef);
});

test("T-271 replay rederives batch projection instead of trusting a resealed receipt", async () => {
  const value = fixture("batch");
  const first = await interpretCompleteCProgram(invocation(value));
  const projection = first.replayReceipts.find(
    (receipt) => receipt.kind === "c_program_batch_projection_receipt"
  );
  assert.notEqual(projection, undefined);
  const forged = resealBatchReceipt(projection, {
    resultPayloadRef: "result://t271/forged-batch-projection"
  });
  let effects = 0;
  await assert.rejects(
    interpretCompleteCProgram(invocation(value, {
      replayReceipts: first.replayReceipts.map((receipt) =>
        receipt === projection ? forged : receipt),
      invokeAdmittedAtom: async () => {
        effects += 1;
        throw new Error("forged projection repeated an effect");
      }
    })),
    /batch projection receipt differs from deterministic task truth/u
  );
  assert.equal(effects, 0);
});

test("T-271 compiler rederives the complete T-254 selected binding", () => {
  const value = fixture("mixed");
  const alternate = declareCProgram({
    programRef: "program://t271/alternate-unselected",
    term: value.program.term,
    proportionalityClass: "P1"
  });
  const parent = constructGraphFunction({
    ...value.parent,
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([value.program, alternate])
    ])
  });
  const module = constructModule({
    ...value.module,
    graphFunctions: [parent, value.child]
  });
  const selected = value.handoffOutcome.handoff.programBinding;
  const { bindingDigest: _bindingDigest, ...bindingBasis } = selected;
  const forgedBasis = {
    ...bindingBasis,
    selectedProgramRef: alternate.programRef
  };
  const forgedBinding = {
    ...forgedBasis,
    bindingDigest: stableSha256Digest(forgedBasis)
  };
  const compiled = compileCompleteCProgram({
    module,
    executionGraphFunction: parent,
    compositionOwnerGraphFunction: parent,
    graphVector: value.vector,
    programBinding: forgedBinding,
    program: alternate,
    composition: value.handoffOutcome.handoff.compositionSelection
  });
  assert.equal(compiled.status, "invalid");
  assert.equal(
    compiled.diagnostics[0].diagnosticId,
    "gtl-c-program-authority-mismatch"
  );
});

test("T-271 rejects stale replay and caller-substituted program bytes", async () => {
  const value = fixture("mixed");
  const first = await interpretCompleteCProgram(invocation(value));
  const stale = {
    ...first.replayReceipts[0],
    planRef: "abg://compiled-c-program/stale"
  };
  await assert.rejects(
    () => interpretCompleteCProgram(invocation(value, {
      replayReceipts: [stale, first.replayReceipts[1]]
    })),
    /replay receipt seal differs/u
  );

  const raw = JSON.parse(serializeCProgramCanonical(value.program));
  raw.term.left.stageRole = "substituted_role";
  const compiled = compileCompleteCProgram({
    module: value.module,
    executionGraphFunction: value.parent,
    compositionOwnerGraphFunction: value.parent,
    graphVector: value.vector,
    programBinding: value.handoffOutcome.handoff.programBinding,
    program: raw,
    composition: value.handoffOutcome.handoff.compositionSelection
  });
  assert.equal(compiled.status, "invalid");
  assert.equal(
    compiled.diagnostics[0].diagnosticId,
    "gtl-c-program-authority-mismatch"
  );

  let effects = 0;
  await assert.rejects(
    () => interpretCompleteCProgram({
      ...invocation(value, {
        invokeAdmittedAtom: async (request) => {
          effects += 1;
          return completedAtom(request);
        }
      }),
      selectedCatalogEntryRef: "catalog-entry://t271/foreign"
    }),
    /selected catalog entry must resolve one execution binding/u
  );
  assert.equal(effects, 0);
});

test("T-271 rejects resealed stale replay coordinates and plan authority before effects", async () => {
  const value = fixture("mixed");
  const first = await interpretCompleteCProgram(invocation(value));
  let futureReceiptEffects = 0;
  await assert.rejects(
    () => interpretCompleteCProgram(invocation(value, {
      replayReceipts: [first.replayReceipts[1]],
      invokeAdmittedAtom: async (request) => {
        futureReceiptEffects += 1;
        return completedAtom(request);
      }
    })),
    /replay is not a contiguous execution prefix/u
  );
  assert.equal(futureReceiptEffects, 0);

  for (const stale of [
    resealReceipt(first.replayReceipts[0], {
      cursorRef: "abg://c-program-cursor/stale"
    }),
    resealReceipt(first.replayReceipts[0], {
      inputPayloadRef: "payload://t271/stale-predecessor"
    })
  ]) {
    let effects = 0;
    await assert.rejects(
      () => interpretCompleteCProgram(invocation(value, {
        replayReceipts: [stale],
        invokeAdmittedAtom: async (request) => {
          effects += 1;
          return completedAtom(request);
        }
      })),
      /replay receipt differs/u
    );
    assert.equal(effects, 0);
  }

  const retry = fixture("nested_retry");
  const retryResult = await interpretCompleteCProgram(invocation(retry, {
    invokeAdmittedAtom: async (request) => completedAtom(request)
  }));
  const invalidRetryPath = resealReceipt(retryResult.replayReceipts[0], {
    retryAttempt: 1,
    retryPath: [3, 1]
  });
  await assert.rejects(
    () => interpretCompleteCProgram(invocation(retry, {
      replayReceipts: [invalidRetryPath]
    })),
    /stale plan, node, task, or retry path|C-call spine differs/u
  );

  const batch = fixture("batch");
  const batchResult = await interpretCompleteCProgram(invocation(batch));
  const invalidTask = resealReceipt(batchResult.replayReceipts[0], {
    taskOrdinal: 99
  });
  await assert.rejects(
    () => interpretCompleteCProgram(invocation(batch, {
      replayReceipts: [invalidTask]
    })),
    /stale plan, node, task, or retry path/u
  );

  const plan = value.handoffOutcome.handoff.completeProgramPlan;
  const foreignPlan = resealPlan(plan, {
    graphVectorRef: "graph-vector://t271/foreign"
  });
  let planEffects = 0;
  await assert.rejects(
    () => interpretCompleteCProgram({
      ...invocation(value, {
        invokeAdmittedAtom: async (request) => {
          planEffects += 1;
          return completedAtom(request);
        }
      }),
      plan: foreignPlan
    }),
    /selected GraphVector authority/u
  );
  assert.equal(planEffects, 0);
});

test("T-271 owns atom target admission and fails closed on a detached completed result", async () => {
  const value = fixture("mixed");
  let calls = 0;
  const outcome = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      calls += 1;
      const submission = completedAtom(request);
      return {
        ...submission,
        admittedTargetCarrier: null
      };
    }
  }));
  assert.equal(calls, 1);
  assert.equal(outcome.status, "runtime_failed");
  assert.equal(outcome.failureClass, "contract_failure");
  assert.equal(outcome.outputPayloadRef, null);
  assert.equal(
    outcome.runtimeEvents.some((event) =>
      event.kind === "c_call_judged" && event.judgment === "blocked"),
    true
  );
});

test("T-271 completed atom requires exact evidence and conserves close refs", async () => {
  const value = fixture("mixed");
  for (const mutate of [
    (submission) => ({
      ...submission,
      evidenceEvents: []
    }),
    (submission) => ({
      ...submission,
      admittedTargetCarrier: {
        ...submission.admittedTargetCarrier,
        carrierDigest: `sha256:${"0".repeat(64)}`
      }
    }),
    (submission) => ({
      ...submission,
      closeBasis: {
        ...submission.closeBasis,
        evidenceRefs: [
          ...submission.closeBasis.evidenceRefs,
          "evidence://t271/substituted"
        ]
      }
    })
  ]) {
    let calls = 0;
    const outcome = await interpretCompleteCProgram(invocation(value, {
      invokeAdmittedAtom: async (request) => {
        calls += 1;
        return mutate(completedAtom(request));
      }
    }));
    assert.equal(calls, 1);
    assert.equal(outcome.status, "runtime_failed");
    assert.equal(outcome.failureClass, "contract_failure");
    assert.equal(outcome.outputPayloadRef, null);
  }
});

test("T-271 seals target content and payload identity as distinct digest subjects", async () => {
  const value = fixture("mixed");
  const submittedCarrierDigests = [];
  const outcome = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      const submission = completedAtom(request);
      submittedCarrierDigests.push(
        submission.admittedTargetCarrier.carrierDigest
      );
      return submission;
    }
  }));
  assert.equal(outcome.status, "completed");
  const atomReceipts = outcome.replayReceipts.filter(
    (receipt) => receipt.kind === "c_program_atom_receipt"
  );
  assert.deepEqual(
    atomReceipts.map((receipt) => receipt.targetCarrierContentDigest),
    submittedCarrierDigests
  );
  for (const receipt of atomReceipts) {
    assert.notEqual(
      receipt.targetCarrierContentDigest,
      receipt.targetPayloadIdentityDigest
    );
  }
});

test("T-271 accepts one snapshot-admitted semantic authority and rejects a foreign ref", async () => {
  const value = fixture("mixed");
  const admitted = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => withEvidenceAuthority(
      completedAtom(request),
      request.nodeRef
    )
  }));
  assert.equal(admitted.status, "completed");

  let calls = 0;
  const rejected = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => {
      calls += 1;
      return withEvidenceAuthority(
        completedAtom(request),
        "authority://t271/foreign"
      );
    }
  }));
  assert.equal(calls, 1);
  assert.equal(rejected.status, "runtime_failed");
  assert.equal(rejected.failureClass, "contract_failure");
});

test("T-271 encloses admitted atom interior before target evidence and close", async () => {
  const value = fixture("mixed");
  const first = await interpretCompleteCProgram(invocation(value, {
    invokeAdmittedAtom: async (request) => withRuntimeProbe(
      request,
      completedAtom(request)
    )
  }));
  assert.equal(first.status, "completed");
  for (const receipt of first.replayReceipts.filter(
    (candidate) => candidate.kind === "c_program_atom_receipt"
  )) {
    const kinds = receipt.runtimeEvents.map((event) => event.kind);
    assert.ok(
      kinds.indexOf("c_call_fibre_selected") <
        kinds.indexOf("runtime_activity_probe_observed")
    );
    assert.ok(
      kinds.indexOf("runtime_activity_probe_observed") <
        kinds.indexOf("authority_snapshot_admitted")
    );
    assert.ok(
      kinds.indexOf("evidence_admitted") < kinds.indexOf("c_call_evidenced")
    );
  }
  let repeated = 0;
  const replayed = await interpretCompleteCProgram(invocation(value, {
    replayReceipts: first.replayReceipts,
    invokeAdmittedAtom: async () => {
      repeated += 1;
      throw new Error("enclosed replay repeated an effect");
    }
  }));
  assert.equal(replayed.status, "completed");
  assert.equal(repeated, 0);
});

test("T-271 replay seal rejects injected interior and reordered close events before effects", async () => {
  const value = fixture("mixed");
  const first = await interpretCompleteCProgram(invocation(value));
  const receipt = first.replayReceipts.find(
    (candidate) => candidate.kind === "c_program_atom_receipt"
  );
  assert.notEqual(receipt, undefined);
  const opened = receipt.runtimeEvents.find(
    (event) => event.kind === "c_call_opened"
  );
  assert.notEqual(opened, undefined);
  const injected = resealReceipt(receipt, {
    runtimeEvents: [
      ...receipt.runtimeEvents.slice(0, 2),
      {
        kind: "fd_advance_ready",
        basisId: opened.basisId,
        graphFunctionId: opened.graphFunctionId,
        status: "ready"
      },
      ...receipt.runtimeEvents.slice(2)
    ]
  });
  const reordered = resealReceipt(receipt, {
    runtimeEvents: [
      ...receipt.runtimeEvents.slice(0, -3),
      receipt.runtimeEvents.at(-2),
      receipt.runtimeEvents.at(-3),
      receipt.runtimeEvents.at(-1)
    ]
  });
  const evidenceKinds = new Set([
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted"
  ]);
  const strippedEvidence = resealReceipt(receipt, {
    runtimeEvents: receipt.runtimeEvents.filter(
      (event) => !evidenceKinds.has(event.kind)
    )
  });
  const substitutedCloseRef = resealReceipt(receipt, {
    runtimeEvents: receipt.runtimeEvents.map((event) =>
      event.kind === "c_call_evidenced"
        ? {
            ...event,
            evidenceRefs: [
              ...event.evidenceRefs,
              "evidence://t271/replay-substituted"
            ]
          }
        : event)
  });
  const substitutedIdentityDigest = resealReceipt(receipt, {
    runtimeEvents: receipt.runtimeEvents.map((event) =>
      event.kind === "payload_observed" || event.kind === "payload_validated"
        ? { ...event, digest: "digest:target-identity:substituted" }
        : event)
  });
  const substitutedCarrierContentDigest = {
    ...receipt,
    targetCarrierContentDigest: `sha256:${"f".repeat(64)}`
  };
  for (const [forged, reason] of [
    [injected, /non-enclosed runtime event/u],
    [reordered, /enclosure order differs/u],
    [strippedEvidence, /lacks its exact admitted evidence chain/u],
    [substitutedCloseRef, /close evidence differs/u],
    [substitutedIdentityDigest, /lacks its exact admitted evidence chain/u],
    [substitutedCarrierContentDigest, /receipt seal differs/u]
  ]) {
    let effects = 0;
    await assert.rejects(
      () => interpretCompleteCProgram(invocation(value, {
        replayReceipts: [forged],
        invokeAdmittedAtom: async (request) => {
          effects += 1;
          return completedAtom(request);
        }
      })),
      reason
    );
    assert.equal(effects, 0);
  }
});

test("T-271 rejects self workflow as a typed semantic gap before effects", () => {
  const value = fixture("self");
  assert.equal(
    value.handoffOutcome.sourceDiagnostics[0].diagnosticId,
    "gtl-c-program-recursive-shape-unrealized"
  );
});
