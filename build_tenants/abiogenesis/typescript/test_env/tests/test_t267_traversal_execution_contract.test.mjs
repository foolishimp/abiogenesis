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
  constructModule
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  admitTenantConformanceManifest,
  tenantConformanceManifestDigest
} from "../../build/semantic/code/src/app/m04/product_intake/tenant_conformance_manifest.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  admitDeterministicTraversalStageResultAuthority,
  admitTraversalExecution,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_contract.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const defaults = loadGtlTargetCarrierDefaultsBundle();

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

function fixture({ effects = true, resultBearingRole = "transform" } = {}) {
  const observation = node("Observation");
  const candidate = node("Candidate");
  const assessment = node("Assessment");
  const decision = node("Decision");
  const programRef = "program://t267/generic-decision";
  const program = declareCProgram({
    programRef,
    term: C.compose(
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
    ),
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
        hogProgramRefDeclarationEntry(programRef),
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
      hogProgramRefDeclarationEntry(programRef),
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
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  return Object.freeze({
    module,
    host: finalHost,
    vector: finalVector
  });
}

function publicContractRow({ contractId, contractKind, capabilityRefs }) {
  const digest = stableSha256Digest({ contractId, contractKind, capabilityRefs });
  return Object.freeze({
    contractId,
    contractKind,
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest,
    authorityRefs: Object.freeze(["REQ-P-PUBLIC-CONTRACTS"]),
    capabilityRefs: Object.freeze([...capabilityRefs]),
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: `contracts/t267/${contractId}.json`,
      schemaId: contractId,
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest
    }),
    operationContract: null
  });
}

function admittedManifest() {
  const rows = Object.freeze([
    publicContractRow({
      contractId: "abg.schema.tenant-conformance-manifest",
      contractKind: "schema_asset",
      capabilityRefs: []
    }),
    publicContractRow({
      contractId: "abg.contract.t267-decision",
      contractKind: "capability",
      capabilityRefs: ["capability://t267/decision"]
    })
  ]);
  const catalogBasis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contract-catalog.t267",
    catalogVersion: "1.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: stableSha256Digest("t267-catalog-schema"),
    profile: "abg-5-ds1",
    rows
  });
  const catalog = Object.freeze({
    ...catalogBasis,
    catalogDigest: stableSha256Digest(catalogBasis)
  });
  const schemaClaim = Object.freeze({
    claimRef: "claim://t267/tenant-manifest-schema",
    contractId: rows[0].contractId,
    contractVersion: rows[0].version,
    contractDigest: rows[0].digest
  });
  const capabilityClaim = Object.freeze({
    claimRef: "claim://t267/decision-capability-contract",
    contractId: rows[1].contractId,
    contractVersion: rows[1].version,
    contractDigest: rows[1].digest
  });
  const basis = Object.freeze({
    kind: "abg_tenant_conformance_manifest",
    schemaId: "abg.schema.tenant-conformance-manifest",
    schemaVersion: "1.0.0",
    manifestId: "abg.tenant-conformance.t267-generic",
    manifestVersion: "1.0.0",
    engineId: "abg.engine.t267-generic",
    engineVersion: "5.0.0",
    publicContractCatalog: Object.freeze({
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    }),
    publicContractClaims: Object.freeze([schemaClaim, capabilityClaim]),
    capabilityClaims: Object.freeze([
      Object.freeze({
        capabilityId: "capability://t267/decision",
        owningContractClaimRef: capabilityClaim.claimRef,
        supportedDisposition: "supported",
        dependentCapabilityIds: Object.freeze([])
      })
    ]),
    effectBindings: Object.freeze([
      Object.freeze({
        effectRef: "effect://t267/decision",
        capabilityId: "capability://t267/decision"
      })
    ]),
    enforcementClaims: Object.freeze([
      Object.freeze({
        contractClaimRef: schemaClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze(["REQ-M-GTL3-CAPABILITY-001"]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze(["proof://t267/manifest-schema"])
      }),
      Object.freeze({
        contractClaimRef: capabilityClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze(["REQ-M-GTL3-CAPABILITY-015"]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze(["proof://t267/capability-contract"])
      })
    ])
  });
  const manifest = Object.freeze({
    ...basis,
    manifestDigest: tenantConformanceManifestDigest({
      ...basis,
      manifestDigest: stableSha256Digest("placeholder")
    })
  });
  return admitTenantConformanceManifest(manifest, catalog);
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
  const authority = admitDeterministicTraversalStageResultAuthority({
    source,
    stageOrdinal: source.workStages[0].ordinal
  });
  const bundle = compileTraversalExecutionContracts({
    source,
    resultAuthorities: [authority]
  });
  return Object.freeze({ outcome, input, source, authority, bundle });
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
      resultAuthorities: [compiled.authority],
      bundle: compiled.bundle,
      conformanceInput: input,
      report
    })
  });
}

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
  assert.equal(outcome.status, "runtime_addressable_not_closed");
  assert.equal(outcome.runtimeAddressable, true);
  assert.equal(outcome.runtimeClosed, false);
  assert.equal(outcome.resultAdmitted, false);
  assert.equal(outcome.obligationsDischarged, false);
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
  assert.equal(blocked.authority.authorityDigest, compatible.authority.authorityDigest);
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
  assert.equal(compatibleGate.outcome.effectsPermitted, true);
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

test("T-267 incomplete rows preserve the original semantic gap and fail closed", () => {
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
    resultAuthorities: [compiled.authority],
    bundle: compiled.bundle,
    conformanceInput: incompleteInput,
    report
  });

  assert.equal(report.passed, false);
  assert.ok(report.issues.some((issue) =>
    issue.ruleRef ===
      "abg://gtl-program/traversal-unit/plugin-result-interface-required"
  ));
  assert.ok(report.issues.some((issue) =>
    issue.ruleRef === "abg://gtl-program/c-algebra/semantic-not-realized" &&
      issue.evidenceRefs.includes(
        "graph-vector-c-program-diagnostic:gtl-c-unrealized-vector-program-selection"
      )
  ));
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
  assert.ok(malformedReport.issues.some((issue) =>
    issue.ruleRef === "abg://gtl-program/c-algebra/semantic-not-realized" &&
      issue.evidenceRefs.includes(
        "graph-vector-c-program-diagnostic:gtl-c-unrealized-vector-program-selection"
      )
  ));
});

test("T-267 rejects source, bundle, report, and conservation drift", () => {
  const value = fixture({ effects: false });
  const compiled = compile(value, null);
  const input = conformanceInput(value, [compiled]);
  const report = typecheckGtlProgram(input);

  const mutatedAuthority = Object.freeze({
    ...compiled.authority,
    selectedResultContractRef: "schema://t267/forged-result"
  });
  assert.throws(
    () => compileTraversalExecutionContracts({
      source: compiled.source,
      resultAuthorities: [mutatedAuthority]
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
      resultAuthorities: [compiled.authority],
      bundle: candidate.bundle,
      conformanceInput: candidate.conformanceInput,
      report: candidate.report
    });
    assert.equal(outcome.status, "invalid");
    assert.equal(outcome.runtimeAddressable, false);
    assert.equal(outcome.effectsPermitted, false);
  }
});
