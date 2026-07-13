// Validates: T-255; REQ-L-GTL3-C-ALGEBRA-011/-014/-016;
// REQ-R-ABG3-FN-COMP-003/-006/-007; REQ-R-ABG3-INTERPRET-023.

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
  constructModule
} from "../../build/semantic/code/src/gtl/m02/contracts/constructors.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  compileGraphVectorExecutionHandoff,
  projectTenantCapabilityCoverage
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  admitTenantConformanceManifest,
  tenantConformanceManifestDigest
} from "../../build/semantic/code/src/app/m04/product_intake/tenant_conformance_manifest.js";
import {
  ABG_CONSENSUS_GTL_MODULE
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  serializeModule
} from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const defaults = loadGtlTargetCarrierDefaultsBundle();
const ABI_PACKAGE_VERSION = "5.0.0-dev.0";

function publicContractRow({ contractId, contractKind, capabilityRefs }) {
  const rowDigest = stableSha256Digest({ contractId, contractKind, capabilityRefs });
  return Object.freeze({
    contractId,
    contractKind,
    owningProductId: "abiogenesis",
    version: "1.0.0",
    digest: rowDigest,
    authorityRefs: Object.freeze(["REQ-P-PUBLIC-CONTRACTS"]),
    capabilityRefs: Object.freeze([...capabilityRefs]),
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: `contracts/t255/${contractId.replaceAll(".", "-")}.json`,
      schemaId: contractId,
      schemaVersion: "1.0.0",
      mediaType: "application/json",
      digest: rowDigest
    }),
    operationContract: null
  });
}

function publicContractCatalog(options = {}) {
  const capabilityRefs = [
    "capability://t255/decision",
    ...(options.includeDependency === true
      ? ["capability://t255/dependency"]
      : [])
  ];
  const rows = Object.freeze([
    publicContractRow({
      contractId: "abg.schema.tenant-conformance-manifest",
      contractKind: options.schemaContractKind ?? "schema_asset",
      capabilityRefs: []
    }),
    publicContractRow({
      contractId: "abg.contract.t255-decision",
      contractKind: "capability",
      capabilityRefs
    })
  ]);
  const basis = Object.freeze({
    kind: "abg_public_contract_catalog",
    schemaVersion: 1,
    catalogId: "abg.public-contract-catalog.t255",
    catalogVersion: "1.0.0",
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: stableSha256Digest("t255-catalog-schema"),
    profile: "abg-5-ds1",
    rows
  });
  return Object.freeze({
    ...basis,
    catalogDigest: stableSha256Digest(basis)
  });
}

function admittedManifest(options = {}) {
  const catalog = publicContractCatalog(options);
  const schemaClaim = Object.freeze({
    claimRef: "claim://t255/tenant-manifest-schema",
    contractId: "abg.schema.tenant-conformance-manifest",
    contractVersion: "1.0.0",
    contractDigest: catalog.rows[0].digest
  });
  const capabilityContractClaim = Object.freeze({
    claimRef: "claim://t255/decision-capability-contract",
    contractId: "abg.contract.t255-decision",
    contractVersion: "1.0.0",
    contractDigest: catalog.rows[1].digest
  });
  const basis = Object.freeze({
    kind: "abg_tenant_conformance_manifest",
    schemaId: "abg.schema.tenant-conformance-manifest",
    schemaVersion: "1.0.0",
    manifestId: "abg.tenant-conformance.t255-generic",
    manifestVersion: "1.0.0",
    engineId: "abg.engine.t255-generic",
    engineVersion: "5.0.0",
    publicContractCatalog: Object.freeze({
      catalogId: catalog.catalogId,
      catalogVersion: catalog.catalogVersion,
      catalogDigest: catalog.catalogDigest
    }),
    publicContractClaims: Object.freeze([
      schemaClaim,
      capabilityContractClaim
    ]),
    capabilityClaims: Object.freeze([
      Object.freeze({
        capabilityId: "capability://t255/decision",
        owningContractClaimRef: capabilityContractClaim.claimRef,
        supportedDisposition:
          options.supported === false ? "unsupported" : "supported",
        dependentCapabilityIds: Object.freeze(
          options.includeDependency === true
            ? ["capability://t255/dependency"]
            : []
        )
      }),
      ...(options.includeDependency === true
        ? [
            Object.freeze({
              capabilityId: "capability://t255/dependency",
              owningContractClaimRef: capabilityContractClaim.claimRef,
              supportedDisposition:
                options.dependencySupported === false
                  ? "unsupported"
                  : "supported",
              dependentCapabilityIds: Object.freeze([])
            })
          ]
        : [])
    ]),
    effectBindings: Object.freeze([
      Object.freeze({
        effectRef: "effect://t255/decision",
        capabilityId: "capability://t255/decision"
      })
    ]),
    enforcementClaims: Object.freeze([
      Object.freeze({
        contractClaimRef: schemaClaim.claimRef,
        carrierClassification:
          options.schemaCarrierClassification ?? "declaration",
        applicableRuleIds: Object.freeze(
          options.emptyRules === true
            ? []
            : ["REQ-M-GTL3-CAPABILITY-001"]
        ),
        causalPredecessorClaimRefs: Object.freeze(
          options.schemaPredecessorRefs ?? []
        ),
        boundedProofRefs: Object.freeze(
          options.emptyProofs === true
            ? []
            : ["proof://t255/manifest-schema"]
        )
      }),
      Object.freeze({
        contractClaimRef: capabilityContractClaim.claimRef,
        carrierClassification: "declaration",
        applicableRuleIds: Object.freeze(["REQ-M-GTL3-CAPABILITY-015"]),
        causalPredecessorClaimRefs: Object.freeze([]),
        boundedProofRefs: Object.freeze(["proof://t255/capability-contract"])
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

function node(name) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t255/${name}` },
    markov: ["bounded"],
    assetSurface: { kind: `t255_${name}` },
    tags: ["t255"]
  });
}

function typedCarrier(nodes) {
  return cInterfaceCarrier(
    typedInterface(
      ...nodes.map((value) => typedNode({ node: value, decode: (raw) => raw }))
    )
  );
}

function compositionDeclarations(input) {
  const sourceRef = input.vectorRef;
  return constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${sourceRef}`,
    hookRef: `hook://${sourceRef}/composition`,
    hostGraphFunctionRef: input.graphFunctionRef,
    hostGraphVectorRef: sourceRef,
    hostSourceNodeRefs: input.source.map((value) => value.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef:
      input.owningDeclarationRef ??
      abgFnCompositionDeclarationRef({
        source: "graph_vector_declarations",
        sourceRef
      }),
    regimes: input.regimes.map((row, order) =>
      Object.freeze({
        bindingRef: `regime-binding://${sourceRef}/${row.stageRole}/${String(order)}`,
        stageRole: row.stageRole,
        regime: row.regime,
        role: row.regime === "F_P" ? "validate" : "construct",
        order,
        authority: row.regime === "F_D" ? "evidence" : "judgment",
        inputCarrierRefs: input.source.map((value) => value.id),
        outputCarrierRefs: [input.target.id],
        evidenceRefs: [`evidence://${sourceRef}/${row.stageRole}`]
      })
    ),
    standardsContextRefs: ["standard://t255/c-algebra"],
    policyContextRefs: ["policy://t255/proof"],
    carrierContextRefs: [
      ...input.source.map((value) => value.id),
      input.target.id
    ],
    assuranceContextRefs: ["assurance://t255/edge"],
    closureContractRef: `closure://${sourceRef}`
  });
}

function fixture(options = {}) {
  const input = node("Observation");
  const output = node("Decision");
  const middle = node("Candidate");
  const programRef = "program://t255/generic-decision";
  let term;
  let regimes;
  if (options.multiStage === true) {
    term = C.compose(
      C.of({
        input: typedCarrier([input]),
        output: typedCarrier([middle]),
        stageRole: "transform",
        fibre: "F_P",
        armId: "arm://t255/transform",
        resultBearing: false
      }),
      C.of({
        input: typedCarrier([middle]),
        output: typedCarrier([output]),
        stageRole: "evaluate",
        fibre: "F_D",
        armId: "arm://t255/evaluate",
        resultBearing: true
      })
    );
    regimes = [
      { stageRole: "transform", regime: "F_P" },
      { stageRole: "evaluate", regime: "F_D" }
    ];
  } else {
    term = C.of({
      input: typedCarrier([input]),
      output: typedCarrier([output]),
      stageRole: "transform",
      fibre: "F_D",
      armId: "arm://t255/derive",
      resultBearing: true
    });
    regimes = [{ stageRole: "transform", regime: "F_D" }];
  }
  const program = declareCProgram({
    programRef,
    term,
    proportionalityClass: "P1"
  });
  const graphFunctionName = "t255.generic-decision";
  const vectorName = "t255.decide";
  const placeholderGraphFunctionRef =
    `graph-function://derived/${graphFunctionName}`;
  const composition = compositionDeclarations({
    graphFunctionRef: placeholderGraphFunctionRef,
    vectorRef: `graph-vector://derived/${vectorName}`,
    source: [input],
    target: output,
    regimes,
    owningDeclarationRef: options.owningDeclarationRef
  });
  const declarations = graphVectorDeclarations([
    ...(options.noSelector === true
      ? []
      : [hogProgramRefDeclarationEntry(programRef)]),
    ...composition.entries
  ]);
  const vector = constructGraphVector({
    name: vectorName,
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations,
    tags: ["t255"]
  });
  const correctedComposition = compositionDeclarations({
    graphFunctionRef: placeholderGraphFunctionRef,
    vectorRef: vector.id,
    source: [input],
    target: output,
    regimes,
    owningDeclarationRef: options.owningDeclarationRef
  });
  const correctedVector = constructGraphVector({
    name: vectorName,
    source: [input],
    target: output,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([
      ...(options.noSelector === true
        ? []
        : [hogProgramRefDeclarationEntry(programRef)]),
      ...correctedComposition.entries
    ]),
    tags: ["t255"]
  });
  const graph = constructGraph({
    name: "t255.decision-graph",
    inputs: [input],
    outputs: [output],
    nodes: [...new Set([input, output])],
    vectors: [correctedVector],
    contexts: [],
    rules: [],
    effects:
      options.noEffects === true ? [] : ["effect://t255/decision"],
    tags: ["t255"]
  });
  const host = constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: [input],
      provides: [output],
      carries: [...new Set([input, output])]
    }),
    inputs: [input],
    outputs: [output],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t255/generic-decision",
      graph,
      version: null
    }),
    effects:
      options.noEffects === true ? [] : ["effect://t255/decision"],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["t255"]
  });
  const finalComposition = compositionDeclarations({
    graphFunctionRef: host.id,
    vectorRef: correctedVector.id,
    source: [input],
    target: output,
    regimes,
    owningDeclarationRef: options.owningDeclarationRef
  });
  const finalVector = constructGraphVector({
    ...correctedVector,
    declarations: graphVectorDeclarations([
      ...(options.noSelector === true
        ? []
        : [hogProgramRefDeclarationEntry(programRef)]),
      ...finalComposition.entries
    ])
  });
  const finalGraph = constructGraph({
    ...graph,
    vectors: [finalVector]
  });
  const finalHost = constructGraphFunction({
    ...host,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t255/generic-decision",
      graph: finalGraph,
      version: null
    })
  });
  const module = constructModule({
    name: "t255.generic-module",
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
  return { module, host: finalHost, vector: finalVector, program };
}

function compileFixture(options = {}) {
  const value = fixture(options);
  const manifest = Object.hasOwn(options, "manifest")
    ? options.manifest
    : admittedManifest();
  return {
    ...value,
    outcome: compileGraphVectorExecutionHandoff({
      graphFunction: value.host,
      graphVector: value.vector,
      graphFunctions: value.module.graphFunctions,
      module: value.module,
      targetCarrierDefaults: options.targetCarrierDefaults ?? defaults,
      admittedTenantConformanceManifest: manifest
    })
  };
}

function allConsensusOutcomes() {
  return ABG_CONSENSUS_GTL_MODULE.graphFunctions.flatMap((graphFunction) =>
    graphFunction.template.kind !== "inline_graph"
      ? []
      : graphFunction.template.graph.vectors.map((graphVector) =>
          compileGraphVectorExecutionHandoff({
            graphFunction,
            graphVector,
            graphFunctions: ABG_CONSENSUS_GTL_MODULE.graphFunctions,
            module: ABG_CONSENSUS_GTL_MODULE,
            targetCarrierDefaults: defaults,
            admittedTenantConformanceManifest: null
          })
        )
  );
}

test("T-255 publishes generic flat handoffs behind the T-267 startup fence", () => {
  for (const options of [{}, { multiStage: true }]) {
    const { outcome } = compileFixture(options);
    assert.equal(
      outcome.status,
      "published_startup_blocked",
      JSON.stringify(outcome.diagnostics)
    );
    assert.equal(outcome.handoff.programDisposition, "flat_executable");
    assert.equal(
      outcome.handoff.programBinding.graphVectorRef,
      outcome.handoff.graphVectorRef
    );
    assert.equal(
      outcome.handoff.edgeClosureBinding.targetCarrierContractRef,
      outcome.handoff.targetCarrierBinding.contractRef
    );
    assert.equal(
      outcome.handoff.capabilityCompatibility.disposition,
      "compatible_exact_manifest"
    );
    assert.equal(
      outcome.handoff.capabilityCompatibility.coverageProjection
        .manifestAdmissionRef,
      admittedManifest().admissionRef
    );
    assert.equal(outcome.handoff.startupBlock.runtimeAddressable, false);
    assert.equal(outcome.handoff.startupBlock.effectsPermitted, false);
    assert.equal(
      outcome.handoff.startupBlock.status,
      "startup_blocked_awaiting_t267"
    );
    assert.deepEqual(
      outcome.diagnostics.map((row) => row.diagnosticId),
      ["gtl-execution-handoff-traversal-conservation-blocked"]
    );
  }
});

test("T-255 M04 admission preserves one canonical manifest and catalog basis", () => {
  const admitted = admittedManifest();
  const coverage = projectTenantCapabilityCoverage({
    admittedManifest: admitted,
    requiredEffectRefs: ["effect://t255/decision"]
  });
  assert.equal(coverage.manifestDigest, admitted.manifest.manifestDigest);
  assert.equal(coverage.manifestAdmissionRef, admitted.admissionRef);
  assert.equal(coverage.catalogId, admitted.catalogBasis.catalogId);
  assert.equal(coverage.catalogDigest, admitted.catalogBasis.catalogDigest);
  assert.deepEqual(
    coverage.coverageRows.map((row) => [row.effectRef, row.capabilityId]),
    [["effect://t255/decision", "capability://t255/decision"]]
  );

  assert.throws(
    () =>
      admitTenantConformanceManifest(
        { ...admitted.manifest, engineId: "abg.engine.drifted" },
        publicContractCatalog()
      ),
    /manifestDigest does not match/u
  );
  assert.throws(
    () =>
      admitTenantConformanceManifest(
        { ...admitted.manifest, inventedAuthority: true },
        publicContractCatalog()
      ),
    /unknown field/u
  );

  const dependencyDrift = structuredClone(admitted.manifest);
  dependencyDrift.capabilityClaims[0].dependentCapabilityIds = [
    "capability://t255/missing"
  ];
  dependencyDrift.manifestDigest = tenantConformanceManifestDigest(
    dependencyDrift
  );
  assert.throws(
    () =>
      admitTenantConformanceManifest(
        dependencyDrift,
        publicContractCatalog()
      ),
    /unresolved dependency/u
  );

  assert.throws(
    () => admittedManifest({ schemaContractKind: "capability" }),
    /schema_asset catalog row/u
  );
  assert.throws(
    () => admittedManifest({ emptyRules: true }),
    /expected a non-empty array/u
  );
  assert.throws(
    () => admittedManifest({ emptyProofs: true }),
    /expected a non-empty array/u
  );
  assert.throws(
    () =>
      admittedManifest({
        schemaCarrierClassification: "derived",
        schemaPredecessorRefs: []
      }),
    /requires a causal predecessor/u
  );
});

test("T-255 blocks missing, raw, and unsupported manifest coverage before publication", () => {
  const missing = compileFixture({ manifest: null }).outcome;
  assert.equal(missing.status, "blocked_capability");
  assert.deepEqual(
    missing.diagnostics.map((row) => row.diagnosticId),
    ["gtl-execution-handoff-capability-manifest-missing"]
  );

  const rawManifest = admittedManifest().manifest;
  const raw = compileFixture({ manifest: rawManifest }).outcome;
  assert.equal(raw.status, "blocked_capability");
  assert.deepEqual(
    raw.diagnostics.map((row) => row.diagnosticId),
    ["gtl-execution-handoff-capability-manifest-incompatible"]
  );

  const unsupported = compileFixture({
    manifest: admittedManifest({ supported: false })
  }).outcome;
  assert.equal(unsupported.status, "blocked_capability");
  assert.deepEqual(
    unsupported.diagnostics.map((row) => row.diagnosticId),
    ["gtl-execution-handoff-capability-manifest-incompatible"]
  );

  const unsupportedDependency = compileFixture({
    manifest: admittedManifest({
      includeDependency: true,
      dependencySupported: false
    })
  }).outcome;
  assert.equal(unsupportedDependency.status, "blocked_capability");
  assert.match(
    unsupportedDependency.diagnostics[0].actualRelation,
    /capability:\/\/t255\/dependency is unsupported/u
  );
});

test("T-255 publishes no-effect handoffs without manifest truth but still blocks startup", () => {
  const { outcome } = compileFixture({ noEffects: true, manifest: null });
  assert.equal(outcome.status, "published_startup_blocked");
  assert.equal(
    outcome.handoff.capabilityCompatibility.disposition,
    "not_applicable_no_effect_requirements"
  );
  assert.equal(
    outcome.handoff.capabilityCompatibility.coverageProjection,
    null
  );
  assert.equal(outcome.handoff.startupBlock.runtimeAddressable, false);
});

test("T-255 keeps selector-free vectors structural-only", () => {
  const { outcome } = compileFixture({ noSelector: true });
  assert.equal(outcome.status, "structural_only");
  assert.equal(outcome.edgeClosureBinding.compositionClosureContractRef, null);
});

test("T-255 rejects an authored composition owner not derived from its exact host", () => {
  const { outcome } = compileFixture({
    owningDeclarationRef: "declaration://wrong-host/composition"
  });
  assert.equal(outcome.status, "invalid");
  assert.deepEqual(
    outcome.diagnostics.map((row) => row.diagnosticId),
    ["gtl-execution-handoff-composition-owner-mismatch"]
  );
});

test("T-255 refuses malformed defaults and standalone identity before handoff", () => {
  const malformedDefaults = structuredClone(defaults);
  malformedDefaults.genericOutputTemplate.requiredFieldRefs = [
    "kind",
    "payload"
  ];
  const { outcome } = compileFixture({
    targetCarrierDefaults: malformedDefaults
  });
  assert.equal(outcome.status, "invalid");
  assert.deepEqual(
    outcome.diagnostics.map((row) => row.diagnosticId),
    ["gtl-execution-handoff-target-carrier-invalid"]
  );

  const identityNode = node("IdentityOnly");
  assert.throws(
    () =>
      declareCProgram({
        programRef: "program://t255/identity-only",
        term: C.id(typedCarrier([identityNode])),
        proportionalityClass: "P1"
      }),
    /executable|result cardinality/u
  );
});

test("T-255 partitions the unchanged T-252 body without erasing successor gaps", () => {
  const outcomes = allConsensusOutcomes();
  const counts = Object.fromEntries(
    [...new Set(outcomes.map((row) => row.status))].map((status) => [
      status,
      outcomes.filter((row) => row.status === status).length
    ])
  );
  assert.deepEqual(counts, {
    blocked_successor_constructor: 1,
    structural_only: 1,
    blocked_capability: 33
  });
  const blocked = outcomes.filter(
    (row) => row.status === "blocked_successor_constructor"
  );
  assert.equal(
    blocked.flatMap((row) => row.sourceDiagnostics).filter(
      (row) => row.diagnosticId === "gtl-c-unrealized-retry"
    ).length,
    1
  );
  const workflows = outcomes.filter(
    (row) =>
      row.status === "blocked_capability" &&
      row.programDisposition === "workflow_sub_traversal"
  );
  assert.equal(workflows.length, 5);
  assert.equal(
    workflows.every((row) => row.workflowLiftBinding !== null),
    true
  );
  assert.equal(
    outcomes.filter(
      (row) =>
        row.status === "blocked_capability" &&
        row.applicationLineage !== null
    ).length,
    15
  );
  assert.equal(
    stableSha256Digest(serializeModule(ABG_CONSENSUS_GTL_MODULE)),
    "sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0"
  );
});

test("T-255 target and edge projections satisfy the existing vector-row law", () => {
  const outcomes = allConsensusOutcomes();
  const targetCarrierContracts = outcomes.map((row) => {
    assert.notEqual(row.status, "invalid");
    const projection =
      row.status === "published_startup_blocked"
        ? row.handoff.targetCarrierProjection
        : row.targetCarrierProjection;
    return projection;
  });
  const edgeClosureContracts = outcomes.map((row) => {
    assert.notEqual(row.status, "invalid");
    const edge =
      row.status === "published_startup_blocked"
        ? row.handoff.edgeClosureBinding
        : row.edgeClosureBinding;
    return edge.conformanceRow;
  });
  const report = typecheckGtlProgram({
    subjectRef: "workspace://t255/consensus-projection",
    abiPackageVersion: ABI_PACKAGE_VERSION,
    scopeKind: "submitted_structure",
    modules: [ABG_CONSENSUS_GTL_MODULE],
    targetCarrierContracts,
    edgeClosureContracts
  });
  assert.equal(
    report.issues.some(
      (row) =>
        row.ruleRef.includes("graph-vector/target-carrier") ||
        row.ruleRef.includes("graph-vector/edge-closure") ||
        row.ruleRef.includes("target-carrier/") ||
        row.ruleRef.includes("edge-closure/")
    ),
    false,
    JSON.stringify(report.issues, null, 2)
  );
});
