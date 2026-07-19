// Validates: T-267; REQ-L-GTL3-C-ALGEBRA-016;
// REQ-R-ABG3-INTERPRET-010/-023/-027.

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
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
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
  admittedTenantManifestFixture
} from "../fixtures/admitted_tenant_manifest.mjs";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  admitProgramLocusTraversalStageResultAuthority,
  admitTraversalExecution,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_contract.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  assertCompiledTraversalExecutionFamily,
  compileTraversalExecutionFamily
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_family.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const defaults = loadGtlTargetCarrierDefaultsBundle();
const MODULE_REF = "gtl-module://t267/generic";
const ENTRY_REF = "catalog-entry://t267/generic-decision";

function node(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t267/${name}` },
    markov: ["boundary://t267/generic"],
    assetSurface: { kind: `t267_${name}` },
    tags: ["t267"]
  });
}

function carrier(nodes) {
  return cInterfaceCarrier(
    typedInterface(
      ...nodes.map((value) =>
        typedNode({ node: value, decode: (raw) => raw })
      )
    )
  );
}

function compositionDeclarations(input) {
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${input.vectorRef}`,
    hookRef: `hook://${input.vectorRef}/composition`,
    hostGraphFunctionRef: input.graphFunctionRef,
    hostGraphVectorRef: input.vectorRef,
    hostSourceNodeRefs: input.source.map((value) => value.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: input.vectorRef
    }),
    regimes: [
      { stageRole: "transform", regime: "F_D", role: "construct" },
      { stageRole: "evaluate", regime: "F_D", role: "validate" },
      { stageRole: "consequence", regime: "F_D", role: "close" }
    ].map((row, order) => Object.freeze({
      bindingRef:
        `regime-binding://${input.vectorRef}/${row.stageRole}/${String(order)}`,
      stageRole: row.stageRole,
      regime: row.regime,
      role: row.role,
      order,
      authority: "evidence",
      inputCarrierRefs: input.source.map((value) => value.id),
      outputCarrierRefs: [input.target.id],
      evidenceRefs: [`evidence://${input.vectorRef}/${row.stageRole}`]
    })),
    standardsContextRefs: ["standard://t267/c-algebra"],
    policyContextRefs: ["policy://t267/static-conservation"],
    carrierContextRefs: [
      ...input.source.map((value) => value.id),
      input.target.id
    ],
    assuranceContextRefs: ["assurance://t267/exact-unit"],
    closureContractRef: `closure://${input.vectorRef}`
  });
}

function fixture({
  effects = true,
  noSelector = false,
  resultBearingRole = "transform",
  programShape = "triple"
} = {}) {
  const observation = node("Observation");
  const candidate = node("Candidate");
  const assessment = node("Assessment");
  const decision = node("Decision");
  const programRef = "program://t267/generic-decision";
  const triple = C.compose(
      C.compose(
        C.of({
          input: carrier([observation]),
          output: carrier([candidate]),
          stageRole: "transform",
          fibre: "F_D",
          armId: "arm://t267/transform",
          resultBearing: resultBearingRole === "transform"
        }),
        C.of({
          input: carrier([candidate]),
          output: carrier([assessment]),
          stageRole: "evaluate",
          fibre: "F_D",
          armId: "arm://t267/evaluate",
          resultBearing: resultBearingRole === "evaluate"
        })
      ),
      C.of({
        input: carrier([assessment]),
        output: carrier([decision]),
        stageRole: "consequence",
        fibre: "F_D",
        armId: "arm://t267/consequence",
        resultBearing: false
      })
    );
  const single = C.of({
    input: carrier([observation]),
    output: carrier([decision]),
    stageRole: "inspect",
    fibre: "F_D",
    armId: "arm://t267/inspect",
    resultBearing: true
  });
  const repeated = C.compose(
    C.of({
      input: carrier([observation]),
      output: carrier([candidate]),
      stageRole: "refine",
      fibre: "F_D",
      armId: "arm://t267/refine-first",
      resultBearing: false
    }),
    C.of({
      input: carrier([candidate]),
      output: carrier([decision]),
      stageRole: "refine",
      fibre: "F_D",
      armId: "arm://t267/refine-second",
      resultBearing: true
    })
  );
  const nested = C.compose(
    C.retry(single, 2),
    C.id(carrier([decision]))
  );
  const term = programShape === "single"
    ? single
    : programShape === "repeated"
      ? repeated
      : programShape === "nested"
        ? nested
        : triple;
  const program = declareCProgram({
    programRef,
    term,
    proportionalityClass: "P1"
  });
  const graphFunctionName = "t267.generic-decision";
  const vectorName = "t267.decide";

  const makeVector = ({ graphFunctionRef, vectorRef }) => {
    const declarations = compositionDeclarations({
      graphFunctionRef,
      vectorRef,
      source: [observation],
      target: decision
    });
    return constructGraphVector({
      name: vectorName,
      source: [observation],
      target: decision,
      operators: [],
      evaluators: [],
      contexts: [],
      rule: null,
      allowsSubwork: false,
      declarations: graphVectorDeclarations([
        ...(noSelector ? [] : [hogProgramRefDeclarationEntry(programRef)]),
        ...declarations.entries
      ]),
      tags: ["t267"]
    });
  };

  const initialVector = makeVector({
    graphFunctionRef: `graph-function://derived/${graphFunctionName}`,
    vectorRef: `graph-vector://derived/${vectorName}`
  });
  const correctedVector = makeVector({
    graphFunctionRef: `graph-function://derived/${graphFunctionName}`,
    vectorRef: initialVector.id
  });
  const graph = constructGraph({
    name: "t267.generic-decision-graph",
    inputs: [observation],
    outputs: [decision],
    nodes: [observation, decision],
    vectors: [correctedVector],
    contexts: [],
    rules: [],
    effects: effects ? ["effect://t267/decision"] : [],
    tags: ["t267"]
  });
  const host = constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: [observation],
      provides: [decision],
      carries: [observation, decision]
    }),
    inputs: [observation],
    outputs: [decision],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t267/generic-decision",
      graph,
      version: null
    }),
    effects: effects ? ["effect://t267/decision"] : [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(programRef),
      pluginSelectionDeclarationEntry({
        fdEvaluator: "plugin://abg/fd-evaluator"
      })
    ]),
    tags: ["t267"]
  });
  const finalDeclarations = compositionDeclarations({
    graphFunctionRef: host.id,
    vectorRef: correctedVector.id,
    source: [observation],
    target: decision
  });
  const finalVector = constructGraphVector({
    ...correctedVector,
    declarations: graphVectorDeclarations([
      ...(noSelector ? [] : [hogProgramRefDeclarationEntry(programRef)]),
      ...finalDeclarations.entries
    ])
  });
  const finalGraph = constructGraph({ ...graph, vectors: [finalVector] });
  const finalHost = constructGraphFunction({
    ...host,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t267/generic-decision",
      graph: finalGraph,
      version: null
    })
  });
  const module = constructModule({
    name: "t267.generic-module",
    graphs: [finalGraph],
    graphFunctions: [finalHost],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: "t267-generic-decision",
        contracts: [
          constructContractRef({
            kind: "graph_function",
            targetId: finalHost.id
          })
        ],
        roles: [],
        tags: ["t267"],
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
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t267/generic-decision",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "t267.generic",
    ownerRef: "owner://t267/generic",
    version: "1.0.0",
    graphFunctionRef: finalHost.id,
    interfaceRef: "interface://t267/generic-decision",
    sourceContractRef: observation.schema.ref,
    targetContractRef: decision.schema.ref,
    contextRefs: ["context://t267/workspace"],
    authorityRefs: ["authority://t267/runtime"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t267/generic"],
    readinessRefs: ["readiness://t267/ready"],
    proofRefs: ["proof://t267/catalog"],
    policyRefs: ["policy://t267/default"],
    declarationSourceRefs: [MODULE_REF]
  });
  const catalogResult = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t267",
      bindingId: "binding://t267",
      catalogId: "catalog://t267",
      resolvedLockRef: "lock://t267",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t267/binding-admitted"],
      correlationId: "correlation://t267/catalog-admission"
    },
    () => {}
  );
  assert.equal(catalogResult.accepted, true, JSON.stringify(catalogResult));
  assert.notEqual(catalogResult.basis, null);
  return Object.freeze({
    module,
    host: finalHost,
    vector: finalVector,
    catalogBasis: catalogResult.basis
  });
}

function admittedManifest() {
  return admittedTenantManifestFixture({
    fixtureId: "t267-generic",
    capabilityContractId: "abg.contract.t267-decision",
    capabilityId: "capability://t267/decision",
    effectRef: "effect://t267/decision"
  });
}

function sourceInput(value, outcome, manifest) {
  return Object.freeze({
    kind: "selected_program_handoff",
    module: value.module,
    executionSubjectGraphFunction: value.host,
    declarationOwnerGraphFunction: value.host,
    graphVector: value.vector,
    targetCarrierDefaults: defaults,
    admittedTenantConformanceManifest: manifest,
    outcome
  });
}

function compile(value, manifest) {
  const outcome = compileGraphVectorExecutionHandoff({
    graphFunction: value.host,
    graphVector: value.vector,
    graphFunctions: value.module.graphFunctions,
    module: value.module,
    targetCarrierDefaults: defaults,
    admittedTenantConformanceManifest: manifest
  });
  assert.ok(
    outcome.status === "blocked_capability" ||
      outcome.status === "published_startup_blocked",
    JSON.stringify(outcome.diagnostics)
  );
  const input = sourceInput(value, outcome, manifest);
  const source = projectTraversalContractSourceBasis(input);
  const authorities = Object.freeze(source.workStages.map((stage) =>
    admitProgramLocusTraversalStageResultAuthority({
      source,
      programLocusRef: stage.programLocusRef
    })
  ));
  const bundle = compileTraversalExecutionContracts({
    source,
    resultAuthorities: authorities
  });
  return Object.freeze({ outcome, input, source, authorities, bundle });
}

function conformanceInput(value, bundles, staleSourceIdentity = false) {
  return Object.freeze({
    subjectRef: "workspace://abg/t267/generic",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [value.module],
    sourceIdentitySurfaces: staleSourceIdentity
      ? [Object.freeze({
          surfaceRef: "workspace://abg/t267/stale-source.ts",
          text: "const packageRef = 'package:@abiogenesis/typescript-tenant@4.6.0#stale';"
        })]
      : [],
    targetCarrierContracts: bundles.map(
      (bundle) => bundle.source.targetCarrierProjection
    ),
    edgeClosureContracts: bundles.map(
      (bundle) => bundle.source.edgeClosureBinding.conformanceRow
    ),
    computeCompositions: bundles.map(
      (bundle) => bundle.bundle.computeComposition
    ),
    computeStageBindings: bundles.flatMap(
      (bundle) => bundle.bundle.computeStageBindings
    ),
    pluginResultInterfaces: bundles.flatMap(
      (bundle) => bundle.bundle.pluginResultInterfaces
    ),
    traversalBindConservation: bundles.map(
      (bundle) => bundle.bundle.traversalBindConservation
    )
  });
}

function gate(value, compiled, inputOverride = null) {
  const input = inputOverride ?? conformanceInput(value, [compiled]);
  const report = typecheckGtlProgram(input);
  return Object.freeze({
    report,
    outcome: admitTraversalExecution({
      sourceInput: compiled.input,
      source: compiled.source,
      resultAuthorities: compiled.authorities,
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    })
  });
}

test("T-267 compiles one non-product execution family through one checked report", () => {
  const value = fixture({ effects: false, programShape: "nested" });
  const manifest = admittedManifest();
  const executionBinding = value.catalogBasis.executionBindings[0];
  const family = compileTraversalExecutionFamily({
    catalogBasis: value.catalogBasis,
    executionBinding,
    admittedTenantConformanceManifest: manifest
  });

  assertCompiledTraversalExecutionFamily(family);
  assert.equal(family.conformanceEvidence.passed, true);
  assert.equal(family.conformanceEvidence.issueCount, 0);
  assert.equal(Object.hasOwn(family, "conformanceInput"), false);
  assert.equal(Object.hasOwn(family, "conformanceReport"), false);
  assert.equal(family.subjects.length, 1);
  assert.equal(family.subjects[0].graphFunctionRef, value.host.id);
  assert.equal(family.subjects[0].vectors.length, 1);
  assert.equal(
    family.subjects[0].vectors[0].reportRef,
    family.conformanceEvidence.reportRef
  );
  assert.equal(family.effectsPermitted, false);
  assert.equal(
    family.subjects[0].vectors[0].normalizedProgram,
    null
  );

  assert.throws(
    () => compileTraversalExecutionFamily({
      catalogBasis: value.catalogBasis,
      executionBinding: Object.freeze({
        ...executionBinding,
        version: "9.9.9"
      }),
      admittedTenantConformanceManifest: manifest
    }),
    /byte-equivalent inside the admitted catalog basis/u
  );
  assert.throws(
    () => assertCompiledTraversalExecutionFamily(Object.freeze({
      ...family,
      effectsPermitted: true
    })),
    /statically effect-free/u
  );
});

test("T-267 refuses selector-free ordinary work without reclassifying it as structural HOF", () => {
  const value = fixture({ effects: false, noSelector: true });
  const executionBinding = value.catalogBasis.executionBindings[0];

  assert.throws(
    () => compileTraversalExecutionFamily({
      catalogBasis: value.catalogBasis,
      executionBinding,
      admittedTenantConformanceManifest: admittedManifest()
    }),
    (error) => {
      assert.equal(error.code, "program_invalid");
      assert.match(error.message, /selector-free ordinary GraphFunction/u);
      assert.match(error.message, /declare one exact vector C-program selector/u);
      assert.doesNotMatch(error.message, /does not preserve one admitted HOF relation/u);
      assert.deepEqual(error.diagnosticRefs, [
        value.host.id,
        value.vector.id,
        "abg.hog_program_ref"
      ]);
      return true;
    }
  );
});

test("T-267 compiles one exact non-Consensus TraversalUnit", () => {
  const value = fixture({ effects: false });
  const compiled = compile(value, null);
  const { report, outcome } = gate(value, compiled);

  assert.equal(report.passed, true, JSON.stringify(report.issues, null, 2));
  assert.equal(report.issueCount, 0);
  assert.equal(report.traversalUnitProjection.units.length, 1);
  assert.deepEqual(
    compiled.bundle.computeStageBindings.map((row) => row.stageRole),
    ["transform", "evaluate", "consequence"]
  );
  assert.deepEqual(
    compiled.bundle.traversalBindConservation.allowedObligationDeltaFamilies,
    [
      "realized",
      "refined",
      "downstream_deferred",
      "blocked",
      "reentered",
      "repriced",
      "no_close_preserved",
      "terminal_projected"
    ]
  );
  assert.equal(compiled.source.applicationKind, "direct");
  assert.equal(compiled.source.applicationConservationRefs.length, 2);
  assert.match(
    compiled.source.applicationConservationRefs[0],
    /^abg:\/\/graph-function-application\/direct\//u
  );
  assert.equal(
    compiled.source.applicationConservationRefs.includes(
      compiled.source.completeProgramPlan.planRef
    ),
    false
  );
  assert.equal(
    compiled.source.applicationConservationRefs.includes(
      compiled.source.completeProgramPlan.planDigest
    ),
    false
  );
  assert.equal(outcome.status, "runtime_addressable_not_closed");
  assert.equal(outcome.runtimeAddressable, true);
  assert.equal(outcome.runtimeClosed, false);
  assert.equal(outcome.resultAdmitted, false);
  assert.equal(outcome.obligationsDischarged, false);
});

test("T-267 preserves open programs and repeated domain roles without synthetic stages", () => {
  const singleValue = fixture({ effects: false, programShape: "single" });
  const single = compile(singleValue, null);
  const singleGate = gate(singleValue, single);

  assert.equal(singleGate.report.passed, true);
  assert.deepEqual(
    single.bundle.computeStageBindings.map((row) => row.domainStageRole),
    ["inspect"]
  );
  assert.deepEqual(
    single.bundle.computeStageBindings.map((row) => row.stageRole),
    ["transform"]
  );
  assert.equal(
    single.bundle.pluginResultInterfaces[0].resultBearing,
    true
  );

  const repeatedValue = fixture({
    effects: false,
    programShape: "repeated"
  });
  const repeated = compile(repeatedValue, null);
  const repeatedGate = gate(repeatedValue, repeated);
  const stages = repeated.bundle.computeStageBindings;

  assert.equal(repeatedGate.report.passed, true);
  assert.deepEqual(stages.map((row) => row.domainStageRole), ["refine", "refine"]);
  assert.equal(new Set(stages.map((row) => row.programLocusRef)).size, 2);
  assert.equal(new Set(stages.map((row) => row.stageBindingRef)).size, 2);
  assert.deepEqual(stages[1].predecessorStageBindingRefs, [
    stages[0].stageBindingRef
  ]);
  assert.deepEqual(
    repeated.bundle.computeComposition.resultBearingProgramLocusRefs,
    [stages[1].programLocusRef]
  );
});

test("T-267 deterministic boundary preserves carrier continuity for evaluate-owned work", () => {
  const value = fixture({
    effects: false,
    resultBearingRole: "evaluate"
  });
  const compiled = compile(value, null);
  const { report, outcome } = gate(value, compiled);
  const [transform, evaluate, consequence] =
    compiled.bundle.computeStageBindings;

  assert.equal(report.passed, true, JSON.stringify(report.issues, null, 2));
  assert.equal(outcome.status, "runtime_addressable_not_closed");
  assert.equal(transform.stageRole, "transform");
  assert.equal(evaluate.stageRole, "evaluate");
  assert.equal(consequence.stageRole, "consequence");
  assert.deepEqual(transform.outputCarrierRefs, evaluate.inputCarrierRefs);
  assert.deepEqual(evaluate.outputCarrierRefs, consequence.inputCarrierRefs);
});

test("T-267 preserves capability as an orthogonal gate", () => {
  const value = fixture();
  const blocked = compile(value, null);
  const compatible = compile(value, admittedManifest());
  const blockedGate = gate(value, blocked);
  const compatibleGate = gate(value, compatible);

  assert.equal(blocked.source.sourceDigest, compatible.source.sourceDigest);
  assert.deepEqual(
    blocked.authorities.map((authority) => authority.authorityDigest),
    compatible.authorities.map((authority) => authority.authorityDigest)
  );
  assert.equal(blocked.bundle.bundleDigest, compatible.bundle.bundleDigest);
  assert.equal(
    blockedGate.outcome.status,
    "static_contracts_admitted_capability_blocked"
  );
  assert.equal(
    compatibleGate.outcome.status,
    "runtime_addressable_not_closed"
  );
  assert.equal(blockedGate.outcome.effectsPermitted, false);
  assert.equal(compatibleGate.outcome.effectsPermitted, false);
});

test("T-267 preserves unrelated program failure without erasing static closure", () => {
  const value = fixture({ effects: false });
  const compiled = compile(value, null);
  const input = conformanceInput(value, [compiled], true);
  const { report, outcome } = gate(value, compiled, input);

  assert.equal(report.passed, false);
  assert.ok(report.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/source-identity/current-abi-package-version"
  ));
  assert.equal(
    outcome.status,
    "static_contracts_admitted_program_blocked"
  );
  assert.equal(outcome.runtimeAddressable, false);
  assert.equal(outcome.effectsPermitted, false);
});

test("T-267 incomplete rows fail on actual missing authority without a stale selection gap", () => {
  const value = fixture({ effects: false });
  const compiled = compile(value, null);
  const completeInput = conformanceInput(value, [compiled]);
  const incompleteInput = Object.freeze({
    ...completeInput,
    pluginResultInterfaces: Object.freeze([])
  });
  const report = typecheckGtlProgram(incompleteInput);
  const outcome = admitTraversalExecution({
    sourceInput: compiled.input,
    source: compiled.source,
    resultAuthorities: compiled.authorities,
    bundle: compiled.bundle,
    conformanceInput: incompleteInput,
    report
  });

  assert.equal(report.passed, false);
  assert.ok(report.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/traversal-unit/plugin-result-interface-required"
  ));
  assert.equal(
    report.issues.some((issue) =>
      issue.evidenceRefs.includes(
        "graph-vector-c-program-diagnostic:gtl-c-unrealized-vector-program-selection"
      )
    ),
    false
  );
  assert.equal(outcome.status, "invalid");
  assert.equal(outcome.runtimeAddressable, false);
  assert.equal(outcome.effectsPermitted, false);

  const malformedInput = Object.freeze({
    ...completeInput,
    traversalBindConservation: Object.freeze([
      Object.freeze({
        ...compiled.bundle.traversalBindConservation,
        allowedObligationDeltaFamilies: Object.freeze(["realized"])
      })
    ])
  });
  const malformedReport = typecheckGtlProgram(malformedInput);
  assert.ok(malformedReport.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/traversal-unit/obligation-delta-disposition-coverage"
  ));
  assert.equal(
    malformedReport.issues.some((issue) =>
      issue.evidenceRefs.includes(
        "graph-vector-c-program-diagnostic:gtl-c-unrealized-vector-program-selection"
      )
    ),
    false
  );

  const duplicateLocusInput = Object.freeze({
    ...completeInput,
    computeCompositions: [Object.freeze({
      ...compiled.bundle.computeComposition,
      invokingProgramLocusRefs: Object.freeze([
        ...compiled.bundle.computeComposition.invokingProgramLocusRefs,
        compiled.bundle.computeComposition.invokingProgramLocusRefs[0]
      ])
    })]
  });
  const duplicateLocusReport = typecheckGtlProgram(duplicateLocusInput);
  assert.ok(duplicateLocusReport.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/compute-composition/invokingProgramLocusRefs-unique"
  ));

  const mismatchedInterfaceInput = Object.freeze({
    ...completeInput,
    pluginResultInterfaces: [
      Object.freeze({
        ...compiled.bundle.pluginResultInterfaces[0],
        programLocusRef: "abg://compiled-c-node/foreign"
      }),
      ...compiled.bundle.pluginResultInterfaces.slice(1)
    ]
  });
  const mismatchedInterfaceReport = typecheckGtlProgram(
    mismatchedInterfaceInput
  );
  assert.ok(mismatchedInterfaceReport.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/plugin-result-interface/program-locus"
  ));

  const {
    programPlanRef: omittedCompositionPlanRef,
    ...partialComposition
  } = compiled.bundle.computeComposition;
  const {
    programPlanRef: omittedStagePlanRef,
    ...partialStage
  } = compiled.bundle.computeStageBindings[0];
  const {
    programLocusRef: omittedInterfaceLocusRef,
    ...partialInterface
  } = compiled.bundle.pluginResultInterfaces[0];
  const {
    programPlanRef: omittedConservationPlanRef,
    ...partialConservation
  } = compiled.bundle.traversalBindConservation;
  assert.notEqual(omittedCompositionPlanRef, undefined);
  assert.notEqual(omittedStagePlanRef, undefined);
  assert.notEqual(omittedInterfaceLocusRef, undefined);
  assert.notEqual(omittedConservationPlanRef, undefined);
  const partialRawReport = typecheckGtlProgram(Object.freeze({
    ...completeInput,
    computeCompositions: Object.freeze([Object.freeze(partialComposition)]),
    computeStageBindings: Object.freeze([
      Object.freeze(partialStage),
      ...compiled.bundle.computeStageBindings.slice(1)
    ]),
    pluginResultInterfaces: Object.freeze([
      Object.freeze(partialInterface),
      ...compiled.bundle.pluginResultInterfaces.slice(1)
    ]),
    traversalBindConservation: Object.freeze([
      Object.freeze(partialConservation)
    ])
  }));
  const partialRawMessages = partialRawReport.issues.map(
    (issue) => issue.message
  );
  for (const expected of [
    "computeCompositions[0].programPlanRef",
    "computeStageBindings[0].programPlanRef",
    "pluginResultInterfaces[0].programLocusRef",
    "traversalBindConservation[0].programPlanRef"
  ]) {
    assert.ok(
      partialRawMessages.some((message) => message.includes(expected)),
      expected
    );
  }
});

test("T-267 rejects source, bundle, report, and conservation drift", () => {
  const value = fixture({ effects: false });
  const compiled = compile(value, null);
  const input = conformanceInput(value, [compiled]);
  const report = typecheckGtlProgram(input);

  const mutatedAuthority = Object.freeze({
    ...compiled.authorities[0],
    selectedResultContractRef: "schema://t267/forged-result"
  });
  assert.throws(
    () => compileTraversalExecutionContracts({
      source: compiled.source,
      resultAuthorities: [mutatedAuthority, ...compiled.authorities.slice(1)]
    }),
    (error) =>
      error?.diagnostic?.diagnosticId ===
        "traversal-result-authority-invalid"
  );
  const mutatedCurrentAuthority = Object.freeze({
    ...compiled.authorities[0],
    currentSourceAuthorityDigest: stableSha256Digest(
      "mutated-current-authority"
    )
  });
  assert.throws(
    () => compileTraversalExecutionContracts({
      source: compiled.source,
      resultAuthorities: [
        mutatedCurrentAuthority,
        ...compiled.authorities.slice(1)
      ]
    }),
    (error) =>
      error?.diagnostic?.diagnosticId ===
        "traversal-result-authority-invalid"
  );

  const cases = [
    {
      source: Object.freeze({
        ...compiled.source,
        currentAuthorityDigest: stableSha256Digest("mutated-source")
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: Object.freeze({
        ...compiled.source,
        authoredProgramNodeRefs: Object.freeze([
          ...compiled.source.authoredProgramNodeRefs.slice(1)
        ])
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: Object.freeze({
        ...compiled.source,
        authoredProgramNodeRefs: Object.freeze([
          ...compiled.source.authoredProgramNodeRefs,
          compiled.source.authoredProgramNodeRefs[0]
        ])
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: Object.freeze({
        ...compiled.source,
        resultBearingProgramLocusRefs: Object.freeze([
          "abg://compiled-c-node/forged-frontier"
        ])
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: Object.freeze({
        ...compiled.source,
        resultBearingProgramLocusRefs: Object.freeze([])
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: Object.freeze({
        ...compiled.source,
        applicationConservationRefs: Object.freeze([
          ...compiled.source.applicationConservationRefs.slice(0, 1),
          stableSha256Digest("forged-direct-application")
        ])
      }),
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    },
    {
      source: compiled.source,
      bundle: Object.freeze({
        ...compiled.bundle,
        bundleDigest: stableSha256Digest("mutated-bundle")
      }),
      conformanceInput: input,
      report
    },
    {
      source: compiled.source,
      bundle: compiled.bundle,
      conformanceInput: input,
      report: Object.freeze({
        ...report,
        reportRef: "abg://gtl-program-conformance-report/stale"
      })
    },
    {
      source: compiled.source,
      bundle: compiled.bundle,
      conformanceInput: Object.freeze({
        ...input,
        traversalBindConservation: [
          Object.freeze({
            ...compiled.bundle.traversalBindConservation,
            carriedObligationRefs: []
          })
        ]
      }),
      report
    }
  ];

  for (const candidate of cases) {
    const outcome = admitTraversalExecution({
      sourceInput: compiled.input,
      source: candidate.source,
      resultAuthorities: compiled.authorities,
      bundle: candidate.bundle,
      conformanceInput: candidate.conformanceInput,
      report: candidate.report
    });
    assert.equal(outcome.status, "invalid");
    assert.equal(outcome.runtimeAddressable, false);
    assert.equal(outcome.effectsPermitted, false);
  }
});
