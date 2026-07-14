// Validates: T-259; REQ-L-GTL3-C-ALGEBRA-006/-014/-016;
// REQ-R-ABG3-CCALL-001/-004/-006/-008/-013.

import assert from "node:assert/strict";
import test from "node:test";

import {
  C,
  cGraphFunctionRef,
  cInterfaceCarrier,
  cProgramCatalogDeclarationEntry,
  declareCProgram,
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
  compileCAlgebraToHog
} from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  admitHogProgram
} from "../../build/semantic/code/src/abg/m03/contracts/hog_program.js";
import {
  compileWorkflowLiftBinding
} from "../../build/semantic/code/src/abg/m03/contracts/workflow_c.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  resolveWorkflowC
} from "../../build/semantic/code/src/abg/m03/runner/workflow_c_runtime.js";
import {
  assertHogProgramExecutable
} from "../../build/semantic/code/src/abg/m03/runner/hog_program_resolution.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const ENTRY_REF = "catalog-entry://t259/system/parent";
const MODULE_REF = "gtl-module://t259/system";

function node(name) {
  return constructNode({
    id: `node://t259/${name.toLowerCase()}`,
    name,
    schema: { kind: "symbolic", ref: `schema://t259/${name.toLowerCase()}` },
    markov: ["boundary://t259/workflow"],
    assetSurface: {
      kind: `t259_${name.toLowerCase()}`,
      standardsRefs: ["REQ-L-GTL3-C-ALGEBRA-006"],
      proofObligationRefs: ["proof://t259/workflow-runtime"]
    },
    tags: ["t259"]
  });
}

function typedBoundary(nodes) {
  return typedInterface(
    ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
  );
}

function compositionDeclarations({ parentRef, vector, input, output }) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${vector.id}`,
    hookRef: `hook://${vector.id}/composition`,
    hostGraphFunctionRef: parentRef,
    hostGraphVectorRef: vector.id,
    hostSourceNodeRefs: input.map((value) => value.id),
    hostTargetNodeRef: output.id,
    hostTargetSchemaRef: output.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: vector.id
    }),
    regimes: [
      Object.freeze({
        bindingRef: `regime-binding://${vector.id}/transform`,
        stageRole: "transform",
        regime: "F_D",
        role: "construct",
        order: 0,
        authority: "evidence",
        inputCarrierRefs: input.map((value) => value.id),
        outputCarrierRefs: [output.id],
        evidenceRefs: ["evidence://t259/declared-composition"]
      })
    ],
    standardsContextRefs: ["standard://t259/c-algebra"],
    policyContextRefs: ["policy://t259/workflow"],
    carrierContextRefs: [...input.map((value) => value.id), output.id],
    assuranceContextRefs: ["assurance://t259/workflow"],
    closureContractRef: `closure://${vector.id}`
  });
}

function fixture(options = {}) {
  const input = node("Observation");
  const output = node("Projection");
  const inputInterface = typedBoundary([input]);
  const outputInterface = typedBoundary([output]);
  const child = constructGraphFunction({
    id: "graph-function://t259/child",
    name: "t259.child",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "symbolic",
      ref: "template://t259/child",
      graph: null,
      version: "1.0.0"
    }),
    effects: options.childEffects ?? [],
    declarations: graphFunctionDeclarations([]),
    tags: ["t259", "module-contained"]
  });
  const program = declareCProgram({
    programRef: "program://t259/parent-workflow",
    term: workflow.C(
      cGraphFunctionRef({
        graphFunction: child,
        input: inputInterface,
        output: outputInterface
      })
    ),
    proportionalityClass: "P1"
  });
  const vectorSeed = constructGraphVector({
    id: "graph-vector://t259/parent",
    name: "t259.parent-vector",
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: true,
    declarations: graphVectorDeclarations([]),
    tags: ["t259"]
  });
  const composition = compositionDeclarations({
    parentRef: "graph-function://t259/parent",
    vector: vectorSeed,
    input: [input],
    output
  });
  const vector = constructGraphVector({
    ...vectorSeed,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(program.programRef),
      ...composition.entries
    ])
  });
  const graph = constructGraph({
    name: "t259.parent-graph",
    inputs: [input],
    outputs: [output],
    nodes: [input, output],
    vectors: [vector],
    contexts: [],
    rules: [],
    effects: options.parentEffects ?? [],
    tags: ["t259"]
  });
  const parent = constructGraphFunction({
    id: "graph-function://t259/parent",
    name: "t259.parent",
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [input, output]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t259/parent",
      graph,
      version: null
    }),
    effects: options.parentEffects ?? [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["t259", "public-parent"]
  });
  const module = constructModule({
    name: "t259.generic-workflow",
    graphs: [graph],
    graphFunctions: [parent, child],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: "t259-parent-job",
        contracts: [
          constructContractRef({ kind: "graph_function", targetId: parent.id })
        ],
        roles: [],
        tags: ["t259"],
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
  if (options.expectInvalid !== true) {
    assert.equal(
      handoffOutcome.status,
      "published_startup_blocked",
      JSON.stringify(handoffOutcome.diagnostics)
    );
  }
  return { input, output, child, parent, vector, program, module, handoffOutcome };
}

function admittedCatalog(value) {
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t259/system/parent",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "abg.t259",
    ownerRef: "owner://abg",
    version: "5.0.0",
    graphFunctionRef: value.parent.id,
    interfaceRef: "interface://t259/parent",
    sourceContractRef: "contract://t259/observation",
    targetContractRef: "contract://t259/projection",
    contextRefs: ["context://t259/workflow"],
    authorityRefs: ["REQ-L-GTL3-C-ALGEBRA-006"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t259/fixture"],
    readinessRefs: ["readiness://t259/ready"],
    proofRefs: ["proof://t259/workflow-runtime"],
    policyRefs: ["policy://t259/default"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admission = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t259",
      bindingId: "binding://t259",
      catalogId: "catalog://t259",
      resolvedLockRef: "lock://t259",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module: value.module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t259/catalog-bound"],
      correlationId: "correlation://t259/catalog"
    },
    () => {}
  );
  assert.equal(admission.accepted, true, JSON.stringify(admission.rowDispositions));
  assert.notEqual(admission.basis, null);
  return admission.basis;
}

function childOutcome(request, disposition, overrides = {}) {
  const completed = disposition === "completed";
  return Object.freeze({
    kind: "workflow_child_traversal_outcome",
    workflowInvocationRef: request.workflowInvocationRef,
    workflowBindingRef: request.workflowBindingRef,
    parentCCallRef: request.parentCCallRef,
    childGraphFunctionRef: request.childGraphFunctionRef,
    childBasisId: "basis://t259/child",
    childRunRef: "run://t259/child",
    childGraphCallId: "graph-call://t259/child",
    childFrameId: "frame://t259/child",
    terminalRef: "terminal://t259/child",
    disposition,
    outputCarrierRef: request.outputCarrierRef,
    outputPayloadRef: completed ? "payload://t259/projection" : null,
    responseContractRef: completed ? "contract://t259/projection" : null,
    reasonRef: completed ? null : `reason://t259/${disposition}`,
    evidenceRefs: ["evidence://t259/child-admitted"],
    ...overrides
  });
}

function invocation(value, catalogBasis, options = {}) {
  const emitted = [];
  return {
    emitted,
    input: {
      kind: "workflow_c_invocation",
      binding: value.handoffOutcome.handoff.workflowLiftBinding,
      catalogBasis,
      selectedCatalogEntryRef: options.selectedCatalogEntryRef ?? ENTRY_REF,
      parentBasisId: "basis://t259/parent",
      parentGraphFunctionRef: value.parent.id,
      parentGraphCallId: "graph-call://t259/parent",
      parentFrameId: "frame://t259/parent",
      edge: value.vector.id,
      vectorIndex: 0,
      attempt: options.attempt ?? 1,
      inputPayloadRef: "payload://t259/observation",
      emit(events) {
        emitted.push(...events);
      },
      invokeChild: options.invokeChild
    }
  };
}

test("T-259 binds one generic direct workflow without publishing its child", () => {
  const value = fixture();
  const catalogBasis = admittedCatalog(value);
  const handoff = value.handoffOutcome.handoff;

  assert.equal(handoff.programDisposition, "workflow_sub_traversal");
  assert.equal(handoff.normalizedProgram.workflow.graphFunctionRef, value.child.id);
  assert.equal(handoff.workflowLiftBinding.parentGraphFunctionRef, value.parent.id);
  assert.equal(
    handoff.workflowLiftBinding.compositionOwnerGraphFunctionRef,
    value.parent.id
  );
  assert.equal(handoff.workflowLiftBinding.childGraphFunctionRef, value.child.id);
  assert.equal(handoff.workflowLiftBinding.childOuterContractRef, null);
  assert.equal(handoff.workflowLiftBinding.childWireContractCertified, false);
  assert.equal(handoff.startupBlock.effectsPermitted, false);
  assert.equal(catalogBasis.executionBindings.length, 1);
  assert.equal(catalogBasis.executionBindings[0].graphFunctionId, value.parent.id);
  assert.equal(
    catalogBasis.executionBindings.some(
      (binding) => binding.graphFunctionId === value.child.id
    ),
    false
  );
  assert.throws(
    () =>
      assertHogProgramExecutable(
        { program: handoff.normalizedProgram, source: "declared" },
        null
      ),
    /workflow_sub_traversal_required/u
  );
});

test("T-259 normalized workflow admission is closed and mutually exclusive with flat stages", () => {
  const value = fixture();
  const program = value.handoffOutcome.handoff.normalizedProgram;
  const widened = admitHogProgram({
    ...program,
    workflow: { ...program.workflow, alternateAuthority: "forbidden" }
  });
  assert.equal(widened.accepted, false);
  assert.match(widened.issues.join("; "), /unknown field/u);

  const dual = admitHogProgram({
    ...program,
    stages: [
      {
        stageRole: "transform",
        defaultRegime: "F_D",
        armId: "arm://t259/dual",
        resultBearing: true
      }
    ]
  });
  assert.equal(dual.accepted, false);
  assert.match(
    dual.issues.join("; "),
    /workflow and batch program stages must be empty/u
  );

  const absentChild = admitHogProgram({
    ...program,
    workflow: { ...program.workflow, graphFunctionRef: "" }
  });
  assert.equal(absentChild.accepted, false);
  assert.match(
    absentChild.issues.join("; "),
    /workflow\.graphFunctionRef must be a non-empty string/u
  );

  const absentWorkflow = { ...program };
  delete absentWorkflow.workflow;
  const emptyFlat = admitHogProgram(absentWorkflow);
  assert.equal(emptyFlat.accepted, false);
  assert.match(
    emptyFlat.issues.join("; "),
    /flat program stages must be a non-empty array/u
  );
});

test("T-259 refuses missing, ambiguous, and interface-drifted child declarations", () => {
  const value = fixture();
  const handoff = value.handoffOutcome.handoff;
  const compile = (module) =>
    compileWorkflowLiftBinding({
      module,
      parentGraphFunction: value.parent,
      compositionOwnerGraphFunction: value.parent,
      parentGraphVector: value.vector,
      programBinding: handoff.programBinding,
      program: handoff.normalizedProgram,
      composition: handoff.compositionSelection
    });

  assert.throws(
    () => compile({ ...value.module, graphFunctions: [value.parent] }),
    /must resolve exactly once/u
  );
  assert.throws(
    () =>
      compile({
        ...value.module,
        graphFunctions: [
          value.parent,
          value.child,
          { ...value.child, name: "t259.child.duplicate" }
        ]
      }),
    /must resolve exactly once/u
  );
  const driftedOutput = node("DriftedProjection");
  assert.throws(
    () =>
      compile({
        ...value.module,
        graphFunctions: [
          value.parent,
          { ...value.child, outputs: [driftedOutput] }
        ]
      }),
    /internal Node interfaces must preserve the authored carrier pair/u
  );
});

test("T-259 refuses a child effect absent from the public parent capability boundary", () => {
  const value = fixture({
    childEffects: ["effect://t259/undeclared-child"],
    expectInvalid: true
  });
  assert.equal(value.handoffOutcome.status, "invalid");
  assert.equal(
    value.handoffOutcome.diagnostics[0].diagnosticId,
    "gtl-execution-handoff-program-shape-invalid"
  );
  assert.match(
    value.handoffOutcome.diagnostics[0].actualRelation,
    /uncovered child effects/u
  );
});

test("T-259 refuses self-workflow before the separately owned recursion runtime", () => {
  const value = fixture();
  const handoff = value.handoffOutcome.handoff;
  assert.throws(
    () =>
      compileWorkflowLiftBinding({
        module: value.module,
        parentGraphFunction: value.parent,
        compositionOwnerGraphFunction: value.parent,
        parentGraphVector: value.vector,
        programBinding: handoff.programBinding,
        program: {
          ...handoff.normalizedProgram,
          workflow: {
            ...handoff.normalizedProgram.workflow,
            graphFunctionRef: value.parent.id
          }
        },
        composition: handoff.compositionSelection
      }),
    /recursion requires its own admitted runtime/u
  );
});

test("T-259 folds completed, blocked, and held child truth through one parent C spine", async () => {
  const value = fixture();
  const catalogBasis = admittedCatalog(value);
  const cases = [
    ["completed", "completed", "advance"],
    ["blocked", "blocked", "blocked"],
    ["held", "pending", "pending"]
  ];

  for (const [disposition, expectedStatus, expectedJudgment] of cases) {
    const call = invocation(value, catalogBasis, {
      invokeChild: async (request) => childOutcome(request, disposition)
    });
    const result = await resolveWorkflowC(call.input);
    assert.equal(result.status, expectedStatus);
    assert.equal(result.judgment, expectedJudgment);
    assert.deepEqual(
      call.emitted.map((event) => event.kind),
      [
        "c_call_opened",
        "c_call_fibre_selected",
        "c_call_evidenced",
        "c_call_result_admitted",
        "c_call_judged"
      ]
    );
    call.emitted.forEach(assertRuntimeEvent);
    const evidenced = call.emitted.find(
      (event) => event.kind === "c_call_evidenced"
    );
    assert.equal(evidenced.evidenceClass, "sub_traversal");
    assert.ok(evidenced.evidenceRefs.includes("child-basis:basis://t259/child"));
    assert.ok(evidenced.evidenceRefs.includes("child-run:run://t259/child"));
  }
});

test("T-259 closes malformed or throwing child traversal as typed parent failure", async () => {
  const value = fixture();
  const catalogBasis = admittedCatalog(value);
  const calls = [
    invocation(value, catalogBasis, {
      invokeChild: async () => {
        throw new Error("child transport failed");
      }
    }),
    invocation(value, catalogBasis, {
      attempt: 2,
      invokeChild: async (request) =>
        childOutcome(request, "completed", {
          childGraphCallId: request.parentGraphCallId,
          childFrameId: request.parentFrameId
        })
    }),
    invocation(value, catalogBasis, {
      attempt: 3,
      invokeChild: async (request) => ({
        ...childOutcome(request, "completed"),
        unownedTruth: "must-not-cross"
      })
    })
  ];

  for (const call of calls) {
    const result = await resolveWorkflowC(call.input);
    assert.equal(result.status, "runtime_failed");
    assert.equal(result.judgment, "blocked");
    assert.equal(result.childOutcome, null);
    assert.equal(call.emitted.at(2).evidenceClass, "fibre_failure");
    assert.equal(call.emitted.at(-1).kind, "c_call_judged");
    assert.equal(call.emitted.at(-1).judgment, "blocked");
  }
});

test("T-259 rejects foreign or stale catalog authority before opening a C call", async () => {
  const value = fixture();
  const catalogBasis = admittedCatalog(value);
  const foreign = invocation(value, catalogBasis, {
    selectedCatalogEntryRef: "catalog-entry://t259/foreign",
    invokeChild: async (request) => childOutcome(request, "completed")
  });
  await assert.rejects(
    () => resolveWorkflowC(foreign.input),
    /selected catalog entry must resolve one execution binding/u
  );
  assert.deepEqual(foreign.emitted, []);

  const staleBasis = {
    ...catalogBasis,
    executionBindings: catalogBasis.executionBindings.map((binding) => ({
      ...binding,
      moduleDigest: stableSha256Digest("stale-module")
    }))
  };
  const stale = invocation(value, staleBasis, {
    invokeChild: async (request) => childOutcome(request, "completed")
  });
  await assert.rejects(
    () => resolveWorkflowC(stale.input),
    /selected catalog binding is not exact within the admitted basis/u
  );
  assert.deepEqual(stale.emitted, []);

  const binding = value.handoffOutcome.handoff.workflowLiftBinding;
  const {
    bindingRef: _bindingRef,
    bindingDigest: _bindingDigest,
    ...bindingBasis
  } = binding;
  const forgedBasis = { ...bindingBasis, regime: "F_P" };
  const forgedDigest = stableSha256Digest(forgedBasis);
  const forged = invocation(value, catalogBasis, {
    invokeChild: async (request) => childOutcome(request, "completed")
  });
  forged.input.binding = {
    ...forgedBasis,
    bindingRef:
      `abg://workflow-c-binding/${forgedDigest.slice("sha256:".length)}`,
    bindingDigest: forgedDigest
  };
  await assert.rejects(
    () => resolveWorkflowC(forged.input),
    /differs from selected Module declaration truth/u
  );
  assert.deepEqual(forged.emitted, []);
});

test("T-259 leaves mixed workflow expressions as an explicit successor gap", () => {
  const value = fixture();
  const workflowTerm = value.program.term;
  const outputCarrier = cInterfaceCarrier(typedBoundary([value.output]));
  const mixed = declareCProgram({
    programRef: "program://t259/mixed-workflow",
    term: C.compose(
      workflowTerm,
      C.of({
        input: outputCarrier,
        output: outputCarrier,
        stageRole: "project",
        fibre: "F_D",
        armId: "arm://t259/project",
        resultBearing: true
      })
    ),
    proportionalityClass: "P1"
  });
  const compilation = compileCAlgebraToHog(mixed);
  assert.equal(compilation.accepted, false);
  assert.equal(compilation.program, null);
  assert.equal(
    compilation.diagnostics.some(
      (row) => row.diagnosticId === "gtl-c-unrealized-workflow-lift"
    ),
    true
  );
});
