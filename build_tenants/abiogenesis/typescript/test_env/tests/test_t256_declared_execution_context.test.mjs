// Validates: T-256; REQ-R-ABG3-INSTRUCTION-ASSEMBLY-001..017;
// REQ-L-GTL3-C-ALGEBRA-009/-011/-013/-016.

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
  compileGraphVectorExecutionHandoff
} from "../../build/semantic/code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import {
  compileCAlgebraToHog
} from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import {
  constructInstructionSectionDecision,
  constructRuntimeBindingSlot
} from "../../build/semantic/code/src/abg/m03/contracts/instruction_assembly.js";
import {
  admitBoundWorkspaceCatalog,
  deriveRegistrySessionView
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  ABG_CONSENSUS_GTL_MODULE
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  ABG_CONSENSUS_INSTRUCTION_DECLARATION,
  ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE,
  CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_instruction_protocol.js";
import {
  ABG_CONSENSUS_MODULE_DECLARATIONS
} from "../../build/semantic/code/src/abg/m03/contracts/review_consensus_modules.js";
import {
  assembleCatalogInvocation,
  invokeAdmittedCatalogGraphFunction
} from "../../build/semantic/code/src/abg/m03/runner/catalog_invocation.js";
import {
  admitExecutionContextProjectionRule,
  admitInstructionProtocolRule,
  catalogExecutionBindingDeclaresExecutionContext,
  constructAdmittedInstructionAssemblyRuntimeBasis,
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet,
  constructDeclaredCStageInvocationBasis,
  constructExecutionContextProjectionRule,
  constructInstructionProtocolRule,
  declaredExecutionStageRef,
  joinDeclaredExecutionContext
} from "../../build/semantic/code/src/abg/m03/contracts/declared_execution_context.js";
import {
  loadGtlTargetCarrierDefaultsBundle
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  sha256DigestForText,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();
const MODULE_REF = "gtl-module://t256/generic";
const ENTRY_REF = "catalog-entry://t256/generic/transform";
const PROTOCOL_REF = "instruction-protocol://t256/generic-transform";
const SECTION_REF = "instruction-section://t256/transform-context";
const RELEVANCE_REF = "relevance://t256/current-source";
const TARGET_CONTRACT_REF = "contract://t256/decision";
const SECTION_TEXT = "Use the admitted observation and return the declared decision contract.";
const SECTION_DIGEST = sha256DigestForText(SECTION_TEXT);
const CONFIGURATION_DIGEST = stableSha256Digest({ profile: "t256-generic" });

function assetSurface(kind, options = {}) {
  return {
    kind,
    requiredContexts: ["context://t256/workspace"],
    standardsRefs: ["REQ-R-ABG3-INSTRUCTION-ASSEMBLY"],
    outputContractRefs: [options.outputContractRef ?? `contract://t256/${kind}`],
    constructorRefs: [`constructor://t256/${kind}`],
    constructorInputAssetKinds: ["source"],
    rendererRefs: [`renderer://t256/${kind}`],
    renderedViewDigestPolicyRef: "policy://t256/rendered-view-digest",
    sectionKindRefs: ["section-kind://t256/body"],
    clauseKindRefs: ["clause-kind://t256/assertion"],
    authoritySlots: [
      {
        authorityKindRef: `authority://t256/${kind}`,
        disposition: "bounded_fallback",
        fallbackPreconditionRefs: ["precondition://t256/admitted"]
      }
    ],
    proofObligationRefs: [`proof://t256/${kind}`]
  };
}

function node(name, kind, options = {}) {
  return constructNode({
    name,
    schema: { kind: "symbolic", ref: `schema://t256/${kind}` },
    typeRef: `type://t256/${kind}`,
    markov: ["bounded"],
    assetSurface: assetSurface(kind, options),
    tags: ["t256", "generic"]
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
    hostSourceNodeRefs: input.sources.map((nodeValue) => nodeValue.id),
    hostTargetNodeRef: input.target.id,
    hostTargetSchemaRef: input.target.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef
    }),
    regimes: [
      {
        bindingRef: `regime-binding://${sourceRef}/${input.stageRole}/0`,
        stageRole: input.stageRole,
        regime: input.regime,
        role: input.regime === "F_H" ? "construct" : "validate",
        order: 0,
        authority: "judgment",
        inputCarrierRefs: input.sources.map((nodeValue) => nodeValue.id),
        outputCarrierRefs: [input.target.id],
        evidenceRefs: [`evidence://${sourceRef}/${input.stageRole}`]
      }
    ],
    standardsContextRefs: ["standard://t256/c-algebra"],
    policyContextRefs: ["policy://t256/proof"],
    carrierContextRefs: [
      ...input.sources.map((nodeValue) => nodeValue.id),
      input.target.id
    ],
    assuranceContextRefs: ["assurance://t256/edge"],
    closureContractRef: `closure://${sourceRef}`
  });
}

function fixture(options = {}) {
  const regime = options.regime ?? "F_P";
  const stageRole = regime === "F_H" ? "human_callout" : "transform";
  const source = node("Observation", "observation");
  const contextSource = options.multiSource === true
    ? node("PolicyContext", "policy-context")
    : null;
  const sources = contextSource === null ? [source] : [source, contextSource];
  const target = node("Decision", "decision", {
    outputContractRef: TARGET_CONTRACT_REF
  });
  const instructionAsset = node("TransformInstruction", "instruction");
  const projectionRule = constructExecutionContextProjectionRule({
    projectionRef: "execution-context-projection://t256/generic",
    version: "1.0.0",
    sourceNodeRef: source.id,
    fieldRows: [
      ...(regime === "F_P"
        ? [
            {
              slot: "role_or_worker_selection_ref",
              fieldPath: "execution.selection_ref",
              valueKind: "ref",
              required: options.optionalActiveSlot !== true
            },
            {
              slot: "configuration_digest",
              fieldPath: "execution.configuration_digest",
              valueKind: "digest",
              required: true
            }
          ]
        : [
            {
              slot: "interaction_subject_ref",
              fieldPath: "execution.interaction_subject_ref",
              valueKind: "ref",
              required: true
            }
          ]),
      {
        slot: "instruction_protocol_ref",
        fieldPath: "execution.instruction_protocol_ref",
        valueKind: "ref",
        required: true
      },
      {
        slot: "result_contract_ref",
        fieldPath: "execution.result_contract_ref",
        valueKind: "ref",
        required: true
      },
      {
        slot: "capability_requirement_refs",
        fieldPath: "execution.capability_requirement_refs",
        valueKind: "ref_list",
        required: true
      }
    ],
    policyRefs: ["policy://t256/context-projection"]
  });
  const protocolRule = constructInstructionProtocolRule({
    instructionProtocolRef: PROTOCOL_REF,
    version: "1.0.0",
    instructionAssetNodeRef: instructionAsset.id,
    allowedStageRoles: [stageRole],
    sections: [
      {
        sectionRef: SECTION_REF,
        sectionKindRef: "section-kind://t256/body",
        content: SECTION_TEXT,
        contentDigest: SECTION_DIGEST,
        required: true,
        policyRefs: ["policy://t256/full-content"]
      }
    ],
    relevancePolicyRefs: [RELEVANCE_REF],
    compressionPolicyRef: "policy://t256/compression",
    proportionalityPolicyRef: "policy://t256/proportionality",
    runtimeBindingSlotClasses: ["source_node"],
    policyRefs: ["policy://t256/instruction"]
  });
  const programRef = "program://t256/generic-transform";
  const program = declareCProgram({
    programRef,
    term: C.of({
      input: typedCarrier(sources),
      output: typedCarrier([target]),
      stageRole,
      fibre: regime,
      armId: "arm://t256/transform",
      resultBearing: true,
      instructionCategoryRefs: [SECTION_REF]
    }),
    proportionalityClass: "P1"
  });
  const graphFunctionName = "t256.generic-transform";
  const vectorName = "t256.transform";
  const placeholderGraphFunctionRef = `graph-function://derived/${graphFunctionName}`;
  const firstComposition = compositionDeclarations({
    graphFunctionRef: placeholderGraphFunctionRef,
    vectorRef: `graph-vector://derived/${vectorName}`,
    sources,
    stageRole,
    regime,
    target
  });
  const firstVector = constructGraphVector({
    name: vectorName,
    source: sources,
    target,
    operators: [],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(programRef),
      ...firstComposition.entries
    ]),
    tags: ["t256", "generic"]
  });
  const secondComposition = compositionDeclarations({
    graphFunctionRef: placeholderGraphFunctionRef,
    vectorRef: firstVector.id,
    sources,
    stageRole,
    regime,
    target
  });
  const secondVector = constructGraphVector({
    ...firstVector,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(programRef),
      ...secondComposition.entries
    ])
  });
  const firstGraph = constructGraph({
    name: "t256.generic-transform-graph",
    inputs: sources,
    outputs: [target],
    nodes: [...sources, target, instructionAsset],
    vectors: [secondVector],
    contexts: [],
    rules: [projectionRule, protocolRule],
    effects: options.effects === true ? ["effect://t256/decision"] : [],
    tags: ["t256", "generic"]
  });
  const firstHost = constructGraphFunction({
    name: graphFunctionName,
    environment: constructEnvRef({
      requires: sources,
      provides: [target],
      carries: [...sources, target]
    }),
    inputs: sources,
    outputs: [target],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t256/generic-transform",
      graph: firstGraph,
      version: null
    }),
    effects: options.effects === true ? ["effect://t256/decision"] : [],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program])
    ]),
    tags: ["t256", "generic"]
  });
  const finalComposition = compositionDeclarations({
    graphFunctionRef: firstHost.id,
    vectorRef: secondVector.id,
    sources,
    stageRole,
    regime,
    target
  });
  const vector = constructGraphVector({
    ...secondVector,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(programRef),
      ...finalComposition.entries
    ])
  });
  const graph = constructGraph({
    ...firstGraph,
    vectors: [vector]
  });
  const host = constructGraphFunction({
    ...firstHost,
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t256/generic-transform",
      graph,
      version: null
    })
  });
  const module = constructModule({
    name: "t256.generic-module",
    graphs: [graph],
    graphFunctions: [host],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [
      constructJob({
        name: "t256-generic-transform",
        contracts: [
          constructContractRef({
            kind: "graph_function",
            targetId: host.id
          })
        ],
        roles: [],
        tags: ["t256", "generic"],
        policyHooks: emptySerializedAttrs()
      })
    ],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [projectionRule, protocolRule],
    imports: [],
    policyHooks: emptySerializedAttrs(),
    metadata: emptySerializedAttrs()
  });
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t256/generic/transform",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "t256.generic",
    ownerRef: "owner://t256/generic",
    version: "1.0.0",
    graphFunctionRef: host.id,
    interfaceRef: "interface://t256/generic-transform",
    sourceContractRef: source.schema.ref,
    targetContractRef: TARGET_CONTRACT_REF,
    contextRefs: ["context://t256/workspace"],
    authorityRefs: ["authority://t256/runtime"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t256/generic"],
    readinessRefs: ["readiness://t256/ready"],
    proofRefs: ["proof://t256/catalog"],
    policyRefs: ["policy://t256/default"],
    declarationSourceRefs: [MODULE_REF]
  });
  const catalogResult = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t256",
      bindingId: "binding://t256",
      catalogId: "catalog://t256",
      resolvedLockRef: "lock://t256",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration,
          moduleRef: MODULE_REF,
          module
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t256/binding-admitted"],
      correlationId: "correlation://t256/catalog-admission"
    },
    () => {}
  );
  assert.equal(catalogResult.accepted, true, JSON.stringify(catalogResult));
  assert.notEqual(catalogResult.basis, null);
  const sourceOutcome = compileGraphVectorExecutionHandoff({
    graphFunction: host,
    graphVector: vector,
    graphFunctions: module.graphFunctions,
    module,
    targetCarrierDefaults,
    admittedTenantConformanceManifest: null
  });
  assert.equal(
    sourceOutcome.status,
    options.effects === true ? "blocked_capability" : "published_startup_blocked",
    JSON.stringify(sourceOutcome)
  );
  const lowered = compileCAlgebraToHog(program);
  assert.equal(lowered.accepted, true, JSON.stringify(lowered));
  assert.notEqual(lowered.program, null);
  const stage = sourceOutcome.status === "published_startup_blocked"
    ? sourceOutcome.handoff.normalizedProgram.stages[0]
    : lowered.program.stages[0];
  const programBinding = sourceOutcome.status === "published_startup_blocked"
    ? sourceOutcome.handoff.programBinding
    : sourceOutcome.programBinding;
  const stageBasis = constructDeclaredCStageInvocationBasis({
    programBindingDigest: programBinding.bindingDigest,
    stageIndex: 0,
    stageRole: stage.stageRole,
    regime: stage.defaultRegime,
    termDigest: stableSha256Digest(stage),
    instructionCategoryRefs: stage.instructionCategoryRefs
  });
  const invocationCarriers = constructAdmittedInvocationCarrierSet([
    constructAdmittedInvocationCarrier({
      sourceNodeRef: source.id,
      schemaRef: source.schema.ref,
      carrierRef: "carrier://t256/observation/1",
      admissionRef: "admission://t256/observation/1",
      value: {
        execution: {
          ...(regime === "F_P"
            ? {
                selection_ref: "selection://t256/worker",
                configuration_digest: CONFIGURATION_DIGEST
              }
            : {
                interaction_subject_ref: "interaction-subject://t256/review"
              }),
          instruction_protocol_ref: PROTOCOL_REF,
          result_contract_ref: TARGET_CONTRACT_REF,
          capability_requirement_refs: []
        },
        observation: { value: 42 }
      }
    })
  ]);
  const stageRef = declaredExecutionStageRef({
    programBindingDigest: stageBasis.programBindingDigest,
    stageIndex: stageBasis.stageIndex
  });
  const instructionAssemblyBasis = regime === "F_H"
    ? null
    : constructAdmittedInstructionAssemblyRuntimeBasis({
    relevanceRules: [
      {
        ruleRef: RELEVANCE_REF,
        requiredInputRefs: [source.id],
        allowFutureStageRefs: []
      }
    ],
    sectionDecisions: [
      constructInstructionSectionDecision({
        sectionRef: SECTION_REF,
        disposition: "include",
        dependencyRefs: [source.id],
        carrierRefs: ["carrier://t256/observation/1"],
        compressionMode: "full",
        text: SECTION_TEXT,
        digestRef: SECTION_DIGEST,
        excerptDigest: null,
        fullContentAdmitted: true,
        stageRef,
        gapRefs: []
      })
    ],
    bindingSlots: [
      constructRuntimeBindingSlot({
        slotRef: "runtime-slot://t256/source-node",
        slotClass: "source_node",
        required: true,
        sourceTruthKind: "admitted_ref",
        evidenceRefs: ["admission://t256/observation/1"]
      })
    ],
    runtimeFacts: [
      {
        kind: "runtime_binding_fact",
        slotClass: "source_node",
        ref: source.id,
        digest: stableSha256Digest({ sourceNodeRef: source.id }),
        sourceEventRefs: ["event://t256/observation-admitted"],
        admitted: true
      }
    ],
    availableInputRefs: [source.id],
    proportionalityClass: "P1",
    expectedAnswerMarkers: [],
    instructionWorkKind: "dependency_disambiguation",
    dependencyInstructionTruth: null,
    proofDepthInstructionTruth: null,
    fpValidationEvidenceRefs: ["evidence://t256/fp-validation"],
    compilerEvidenceRefs: ["evidence://t256/compiler"]
      });
  return {
    source,
    contextSource,
    target,
    projectionRule,
    protocolRule,
    module,
    host,
    sourceOutcome,
    catalogBasis: catalogResult.basis,
    catalogEvents: catalogResult.admissionEvents,
    stageBasis,
    invocationCarriers,
    instructionAssemblyBasis
  };
}

function joinFixture(value, overrides = {}) {
  return joinDeclaredExecutionContext({
    sourceOutcome: value.sourceOutcome,
    stageBasis: value.stageBasis,
    catalogBasis: value.catalogBasis,
    invocationCarriers: value.invocationCarriers,
    instructionAssemblyBasis: value.instructionAssemblyBasis,
    ...overrides
  });
}

function carriersWithExecution(value, executionOverrides) {
  const carrier = value.invocationCarriers.carriers[0];
  const changedValue = structuredClone(carrier.value);
  changedValue.execution = {
    ...changedValue.execution,
    ...executionOverrides
  };
  return constructAdmittedInvocationCarrierSet([
    constructAdmittedInvocationCarrier({
      sourceNodeRef: carrier.sourceNodeRef,
      schemaRef: carrier.schemaRef,
      carrierRef: carrier.carrierRef,
      admissionRef: carrier.admissionRef,
      value: changedValue
    })
  ]);
}

function instructionBasisWith(value, overrides) {
  const { kind: _kind, basisDigest: _basisDigest, ...basis } =
    value.instructionAssemblyBasis;
  return constructAdmittedInstructionAssemblyRuntimeBasis({
    ...basis,
    ...overrides
  });
}

test("T-256 constructs one canonical F_P request through the T-183 carrier path", () => {
  const value = fixture();
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.equal(outcome.compiledContract.selectedRegime, "F_P");
  assert.equal(outcome.compiledContract.fieldRows[0].sourceSchemaRef, value.source.schema.ref);
  assert.equal(outcome.compiledContract.fieldRows[0].sourceTypeRef, value.source.typeRef);
  assert.notEqual(outcome.instructionAssembly, null);
  assert.equal(outcome.instructionAssembly.plan.kind, "compiled_prompt_plan");
  assert.equal(outcome.instructionAssembly.startupAdmission.admitted, true);
  assert.equal(outcome.instructionAssembly.envelope.kind, "instruction_envelope");
  assert.equal(outcome.request.regime, "F_P");
  assert.equal(outcome.request.planRef, outcome.instructionAssembly.plan.planRef);
  assert.equal(outcome.request.planDigest, outcome.instructionAssembly.plan.planDigest);
  assert.equal(outcome.request.envelopeRef, outcome.instructionAssembly.envelope.envelopeRef);
  assert.equal(outcome.request.envelopeDigest, outcome.instructionAssembly.envelope.envelopeDigest);
  assert.equal(outcome.request.startupBlock.status, "startup_blocked_awaiting_t267");
  assert.equal(outcome.request.startupBlock.effectsPermitted, false);
  assert.equal("prompt" in outcome.request, false);
  assert.equal("instructionProtocol" in outcome.request, false);
  assert.equal("resultContractRef" in outcome.request, false);
  assert.equal("capabilityRefs" in outcome.request, false);
});

test("T-256 derives schema, type, and regime instead of accepting profile-authored truth", () => {
  const value = fixture();
  assert.doesNotThrow(() => admitExecutionContextProjectionRule(value.projectionRule));
  assert.doesNotThrow(() => admitInstructionProtocolRule(value.protocolRule));

  const projectionWireKeys = value.projectionRule.config.entries.map((entry) => entry.key);
  assert.deepEqual(projectionWireKeys, [
    "version",
    "source_node_ref",
    "field_rows",
    "policy_refs"
  ]);
  assert.equal(projectionWireKeys.includes("source_schema_ref"), false);
  assert.equal(projectionWireKeys.includes("source_type_ref"), false);
  assert.equal(projectionWireKeys.includes("applies_to_regime"), false);

  const widenedProjection = structuredClone(value.projectionRule);
  widenedProjection.config.entries.push({
    key: "source_schema_ref",
    value: { kind: "scalar", value: value.source.schema.ref }
  });
  assert.throws(
    () => admitExecutionContextProjectionRule(widenedProjection),
    /source_schema_ref is unknown/u
  );

  const camelCaseProjection = structuredClone(value.projectionRule);
  camelCaseProjection.config.entries = camelCaseProjection.config.entries.map((entry) =>
    entry.key === "source_node_ref" ? { ...entry, key: "sourceNodeRef" } : entry
  );
  assert.throws(
    () => admitExecutionContextProjectionRule(camelCaseProjection),
    /sourceNodeRef is unknown/u
  );

  assert.throws(
    () =>
      constructExecutionContextProjectionRule({
        ...admitExecutionContextProjectionRule(value.projectionRule).declaration,
        version: "latest"
      }),
    /must be an exact profile version/u
  );

  const camelCaseRow = structuredClone(value.projectionRule);
  const fieldRowsEntry = camelCaseRow.config.entries.find(
    (entry) => entry.key === "field_rows"
  );
  const firstFieldRow = fieldRowsEntry.value.value.items[0];
  firstFieldRow.entries = firstFieldRow.entries.map((entry) =>
    entry.key === "field_path" ? { ...entry, key: "fieldPath" } : entry
  );
  assert.throws(
    () => admitExecutionContextProjectionRule(camelCaseRow),
    /fieldPath is unknown/u
  );
});

test("T-256 fails closed for absent assembly truth, stale module identity, and non-own carrier paths", () => {
  const value = fixture();

  const missingBasis = joinFixture(value, { instructionAssemblyBasis: null });
  assert.equal(missingBasis.status, "invalid");
  assert.equal(
    missingBasis.diagnostics[0].diagnosticId,
    "execution-context-instruction-rule-invalid"
  );

  const staleCatalog = {
    ...value.catalogBasis,
    declarationModuleBindings: value.catalogBasis.declarationModuleBindings.map((binding) => ({
      ...binding,
      moduleDigest: stableSha256Digest("stale-module")
    }))
  };
  const staleModule = joinFixture(value, { catalogBasis: staleCatalog });
  assert.equal(staleModule.status, "invalid");
  assert.equal(
    staleModule.diagnostics[0].diagnosticId,
    "execution-context-declaration-module-digest-mismatch"
  );

  const carrier = value.invocationCarriers.carriers[0];
  const inheritedExecution = Object.create({
    execution: carrier.value.execution
  });
  inheritedExecution.observation = { value: 42 };
  assert.throws(
    () =>
      constructAdmittedInvocationCarrier({
        sourceNodeRef: carrier.sourceNodeRef,
        schemaRef: carrier.schemaRef,
        carrierRef: "carrier://t256/observation/inherited",
        admissionRef: carrier.admissionRef,
        value: inheritedExecution
      }),
    /expected an I-JSON value/u
  );
  const inheritedCarriers = constructAdmittedInvocationCarrierSet([
    constructAdmittedInvocationCarrier({
      sourceNodeRef: carrier.sourceNodeRef,
      schemaRef: carrier.schemaRef,
      carrierRef: "carrier://t256/observation/missing-own-path",
      admissionRef: carrier.admissionRef,
      value: { observation: { value: 42 } }
    })
  ]);
  const inheritedPath = joinFixture(value, { invocationCarriers: inheritedCarriers });
  assert.equal(inheritedPath.status, "invalid");
  assert.equal(
    inheritedPath.diagnostics[0].diagnosticId,
    "execution-context-field-path-invalid"
  );
});

test("T-256 rejects an optional declaration for an active execution-context slot", () => {
  const value = fixture({ optionalActiveSlot: true });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "invalid");
  assert.equal(
    outcome.diagnostics[0].diagnosticId,
    "execution-context-profile-shape-invalid"
  );
  assert.match(outcome.diagnostics[0].actualRelation, /is optional/u);
});

test("T-256 binds generic declarations without a Consensus-specific or fallback path", async () => {
  const value = fixture();
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.equal(value.module.name.includes("consensus"), false);
  assert.equal(outcome.request.handoffRef, value.sourceOutcome.handoff.handoffRef);

  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(
      new URL(
        "../../code/src/abg/m03/contracts/declared_execution_context.ts",
        import.meta.url
      ),
      "utf8"
    )
  );
  assert.equal(source.includes("defaultInstructionSectionText"), false);
  assert.equal(source.includes("FpTransportConfig"), false);
  assert.equal(/consensus/iu.test(source), false);

  const binding = value.catalogBasis.executionBindings[0];
  assert.notEqual(binding, undefined);
  assert.equal(
    catalogExecutionBindingDeclaresExecutionContext({
      executionBinding: { ...binding, declarationSourceRefs: [] },
      catalogBasis: value.catalogBasis
    }),
    false
  );
});

test("T-256 keeps F_H interaction construction distinct from F_P assembly", () => {
  const value = fixture({ regime: "F_H" });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.equal(outcome.compiledContract.selectedRegime, "F_H");
  assert.equal(outcome.instructionAssembly, null);
  assert.equal(outcome.request.regime, "F_H");
  assert.equal(
    outcome.request.interactionSubjectRef,
    "interaction-subject://t256/review"
  );
  assert.equal("planRef" in outcome.request, false);
  assert.equal("envelopeRef" in outcome.request, false);
  assert.equal(outcome.request.startupBlock.effectsPermitted, false);

  const fpBasisOnFh = joinFixture(value, {
    instructionAssemblyBasis: fixture().instructionAssemblyBasis
  });
  assert.equal(fpBasisOnFh.status, "invalid");
  assert.equal(
    fpBasisOnFh.diagnostics[0].diagnosticId,
    "execution-context-instruction-rule-invalid"
  );
});

test("T-256 compiles a multi-source interface without product-specific branches", () => {
  const value = fixture({ multiSource: true });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.notEqual(value.contextSource, null);
  assert.deepEqual(
    outcome.instructionAssembly.plan.sourceNodeRefs,
    [value.source.id, value.contextSource.id].sort()
  );
  assert.equal(outcome.compiledContract.fieldRows.length, 5);
});

test("T-256 preserves the exact T-268 capability block and constructs no request", () => {
  const value = fixture({ effects: true });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "blocked_capability", JSON.stringify(outcome));
  assert.equal(outcome.sourceCapabilityOutcome, value.sourceOutcome);
  assert.equal(
    outcome.diagnostics[0].diagnosticId,
    "execution-context-capability-incompatible"
  );
  assert.equal("request" in outcome, false);
  assert.equal("instructionAssembly" in outcome, false);
});

test("T-256 request identity changes with admitted field and source-carrier truth", () => {
  const value = fixture();
  const original = joinFixture(value);
  assert.equal(original.status, "request_constructed", JSON.stringify(original));
  const carrier = value.invocationCarriers.carriers[0];
  const changedValue = structuredClone(carrier.value);
  changedValue.execution.configuration_digest = stableSha256Digest({
    profile: "t256-generic-changed"
  });
  const changedCarriers = constructAdmittedInvocationCarrierSet([
    constructAdmittedInvocationCarrier({
      sourceNodeRef: carrier.sourceNodeRef,
      schemaRef: carrier.schemaRef,
      carrierRef: carrier.carrierRef,
      admissionRef: carrier.admissionRef,
      value: changedValue
    })
  ]);
  const changed = joinFixture(value, { invocationCarriers: changedCarriers });
  assert.equal(changed.status, "request_constructed", JSON.stringify(changed));
  assert.notEqual(changed.values.valuesDigest, original.values.valuesDigest);
  assert.notEqual(changed.request.planDigest, original.request.planDigest);
  assert.notEqual(changed.request.requestDigest, original.request.requestDigest);
});

test("T-256 maps canonical compiler, startup, and envelope refusal to typed diagnostics", () => {
  const value = fixture();
  const { kind: _kind, basisDigest: _basisDigest, ...runtimeBasis } =
    value.instructionAssemblyBasis;

  const missingRequiredInput = constructAdmittedInstructionAssemblyRuntimeBasis({
    ...runtimeBasis,
    availableInputRefs: []
  });
  const compilerRejected = joinFixture(value, {
    instructionAssemblyBasis: missingRequiredInput
  });
  assert.equal(compilerRejected.status, "invalid");
  assert.equal(
    compilerRejected.diagnostics[0].diagnosticId,
    "execution-context-prompt-plan-rejected"
  );

  const startupCatalog = structuredClone(value.catalogBasis);
  startupCatalog.projection.runtimeRegistryProjection.entries = [];
  const startupRejected = joinFixture(value, { catalogBasis: startupCatalog });
  assert.equal(startupRejected.status, "invalid");
  assert.equal(
    startupRejected.diagnostics[0].diagnosticId,
    "execution-context-prompt-plan-startup-rejected"
  );

  const unadmittedRuntimeFact = constructAdmittedInstructionAssemblyRuntimeBasis({
    ...runtimeBasis,
    runtimeFacts: runtimeBasis.runtimeFacts.map((fact) => ({
      ...fact,
      admitted: false
    }))
  });
  const envelopeRejected = joinFixture(value, {
    instructionAssemblyBasis: unadmittedRuntimeFact
  });
  assert.equal(envelopeRejected.status, "invalid");
  assert.equal(
    envelopeRejected.diagnostics[0].diagnosticId,
    "execution-context-instruction-envelope-rejected"
  );
});

test("T-256 validates exact stage identity without selecting or advancing a stage", () => {
  const value = fixture();
  const wrongRole = constructDeclaredCStageInvocationBasis({
    programBindingDigest: value.stageBasis.programBindingDigest,
    stageIndex: value.stageBasis.stageIndex,
    stageRole: "evaluate",
    regime: value.stageBasis.regime,
    termDigest: value.stageBasis.termDigest,
    instructionCategoryRefs: value.stageBasis.instructionCategoryRefs
  });
  const roleRejected = joinFixture(value, { stageBasis: wrongRole });
  assert.equal(roleRejected.status, "invalid");
  assert.equal(
    roleRejected.diagnostics[0].diagnosticId,
    "execution-context-stage-basis-invalid"
  );

  const wrongCategories = constructDeclaredCStageInvocationBasis({
    programBindingDigest: value.stageBasis.programBindingDigest,
    stageIndex: value.stageBasis.stageIndex,
    stageRole: value.stageBasis.stageRole,
    regime: value.stageBasis.regime,
    termDigest: value.stageBasis.termDigest,
    instructionCategoryRefs: []
  });
  const categoryRejected = joinFixture(value, { stageBasis: wrongCategories });
  assert.equal(categoryRejected.status, "invalid");
  assert.equal(
    categoryRejected.diagnostics[0].diagnosticId,
    "execution-context-stage-basis-invalid"
  );
});

test("T-256 derives declaration closure only from replay-projected module identity", () => {
  const value = fixture();
  const withoutProjection = {
    ...value.catalogBasis,
    executionBindings: value.catalogBasis.executionBindings.map((binding) => ({
      ...binding,
      declarationSourceRefs: []
    }))
  };
  const projectionMissing = joinFixture(value, {
    catalogBasis: withoutProjection
  });
  assert.equal(projectionMissing.status, "invalid");
  assert.equal(
    projectionMissing.diagnostics[0].diagnosticId,
    "execution-context-declaration-source-projection-missing"
  );

  const unresolved = joinFixture(value, {
    catalogBasis: { ...value.catalogBasis, declarationModuleBindings: [] }
  });
  assert.equal(unresolved.status, "invalid");
  assert.equal(
    unresolved.diagnostics[0].diagnosticId,
    "execution-context-declaration-module-unresolved"
  );

  const ambiguous = joinFixture(value, {
    catalogBasis: {
      ...value.catalogBasis,
      declarationModuleBindings: [
        ...value.catalogBasis.declarationModuleBindings,
        ...value.catalogBasis.declarationModuleBindings
      ]
    }
  });
  assert.equal(ambiguous.status, "invalid");
  assert.equal(
    ambiguous.diagnostics[0].diagnosticId,
    "execution-context-declaration-module-ambiguous"
  );
  assert.equal(
    value.catalogBasis.declarationModuleBindings[0].invocationAuthority,
    false
  );
});

test("T-256 refuses protocol, target, capability, and field-value drift before request construction", () => {
  const value = fixture();

  const missingProtocol = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      instruction_protocol_ref: "instruction-protocol://t256/missing"
    })
  });
  assert.equal(missingProtocol.status, "invalid");
  assert.equal(
    missingProtocol.diagnostics[0].diagnosticId,
    "execution-context-protocol-ref-invalid"
  );

  const wrongTarget = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      result_contract_ref: "contract://t256/wrong-target"
    })
  });
  assert.equal(wrongTarget.status, "invalid");
  assert.equal(
    wrongTarget.diagnostics[0].diagnosticId,
    "execution-context-result-contract-incompatible"
  );

  const unsupportedCapability = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      capability_requirement_refs: ["capability://t256/uncovered"]
    })
  });
  assert.equal(unsupportedCapability.status, "invalid");
  assert.equal(
    unsupportedCapability.diagnostics[0].diagnosticId,
    "execution-context-capability-incompatible"
  );

  const uppercaseDigest = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      configuration_digest: CONFIGURATION_DIGEST.toUpperCase()
    })
  });
  assert.equal(uppercaseDigest.status, "invalid");
  assert.equal(
    uppercaseDigest.diagnostics[0].diagnosticId,
    "execution-context-field-value-invalid"
  );
  assert.equal(
    uppercaseDigest.diagnostics[0].classification,
    "invalid_runtime_binding"
  );
});

test("T-256 refuses mutated protocol decisions and profile content identity", () => {
  const value = fixture();
  const changedDecision = {
    ...value.instructionAssemblyBasis.sectionDecisions[0],
    text: `${SECTION_TEXT} changed`
  };
  const decisionRejected = joinFixture(value, {
    instructionAssemblyBasis: instructionBasisWith(value, {
      sectionDecisions: [changedDecision]
    })
  });
  assert.equal(decisionRejected.status, "invalid");
  assert.equal(
    decisionRejected.diagnostics[0].diagnosticId,
    "execution-context-instruction-rule-invalid"
  );

  assert.throws(
    () =>
      constructInstructionProtocolRule({
        ...admitInstructionProtocolRule(value.protocolRule).declaration,
        sections: [
          {
            ...admitInstructionProtocolRule(value.protocolRule).declaration.sections[0],
            contentDigest: stableSha256Digest("wrong-content")
          }
        ]
      }),
    /received sha256:/u
  );

  const camelCaseProtocol = structuredClone(value.protocolRule);
  const sectionsEntry = camelCaseProtocol.config.entries.find(
    (entry) => entry.key === "sections"
  );
  const firstSection = sectionsEntry.value.value.items[0];
  firstSection.entries = firstSection.entries.map((entry) =>
    entry.key === "section_ref" ? { ...entry, key: "sectionRef" } : entry
  );
  assert.throws(
    () => admitInstructionProtocolRule(camelCaseProtocol),
    /sectionRef is unknown/u
  );
});

test("T-256 publishes Consensus profiles as a non-invoking companion without changing T-252 bytes", () => {
  assert.equal(
    stableSha256Digest(ABG_CONSENSUS_GTL_MODULE),
    "sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0"
  );
  assert.equal(
    ABG_CONSENSUS_INSTRUCTION_DECLARATION.entryKind,
    "node_type"
  );
  assert.deepEqual(
    ABG_CONSENSUS_INSTRUCTION_DECLARATION.declarationSourceRefs,
    [CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF]
  );
  assert.equal(
    ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE.rules.filter(
      (rule) => rule.kind === "gtl.execution_context_projection"
    ).length,
    4
  );
  assert.equal(
    ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE.rules.filter(
      (rule) => rule.kind === "gtl.instruction_protocol"
    ).length,
    4
  );
  assert.deepEqual(
    ABG_CONSENSUS_MODULE_DECLARATIONS[0].declarationSourceRefs,
    [
      "gtl://module/abg/consensus",
      CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF
    ]
  );

  const catalogResult = admitBoundWorkspaceCatalog(
    {
      kind: "bound_catalog_admission_batch",
      workspaceId: "workspace://t256/consensus",
      bindingId: "binding://t256/consensus",
      catalogId: "catalog://t256/consensus",
      resolvedLockRef: "lock://t256/consensus",
      systemDeclarations: [
        {
          kind: "runtime_library_entry",
          declaration: ABG_CONSENSUS_MODULE_DECLARATIONS[0],
          moduleRef: "gtl://module/abg/consensus",
          module: ABG_CONSENSUS_GTL_MODULE
        },
        {
          kind: "runtime_library_entry",
          declaration: ABG_CONSENSUS_INSTRUCTION_DECLARATION,
          moduleRef: CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF,
          module: ABG_CONSENSUS_INSTRUCTION_DECLARATION_MODULE
        }
      ],
      orderedProductBatches: [],
      causationEventRefs: ["event://t256/consensus-catalog"],
      correlationId: "correlation://t256/consensus-catalog"
    },
    () => {}
  );
  assert.equal(catalogResult.accepted, true, JSON.stringify(catalogResult));
  assert.notEqual(catalogResult.basis, null);
  assert.equal(catalogResult.basis.executionBindings.length, 1);
  assert.deepEqual(
    catalogResult.basis.executionBindings[0].declarationSourceRefs,
    ABG_CONSENSUS_MODULE_DECLARATIONS[0].declarationSourceRefs
  );
  assert.deepEqual(
    catalogResult.basis.declarationModuleBindings.map((binding) => [
      binding.moduleRef,
      binding.invocationAuthority
    ]),
    [
      ["gtl://module/abg/consensus", false],
      [CONSENSUS_INSTRUCTION_DECLARATION_MODULE_REF, false]
    ]
  );
});

test("T-256 profile-aware catalog work cannot reach legacy instruction synthesis", async () => {
  const value = fixture();
  const binding = value.catalogBasis.executionBindings[0];
  const session = deriveRegistrySessionView({
    basis: value.catalogBasis,
    allowedEntryRefs: [binding.entryRef]
  });
  assert.equal(session.accepted, true, JSON.stringify(session));
  assert.notEqual(session.view, null);
  const runtimeEvents = [...value.catalogEvents];
  const assembled = assembleCatalogInvocation({
    basis: value.catalogBasis,
    sessionView: session.view,
    entryRef: binding.entryRef,
    interfaceRef: "interface://t256/generic-transform",
    workspaceRoot: "/tmp/t256-profile-aware-start",
    inputBinding: {
      assetRef: "input://t256/profile-aware",
      assetType: value.source.schema.ref,
      uri: "data:application/json,%7B%7D"
    },
    inputSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      additionalProperties: true
    },
    inputValue: {},
    until: "converged",
    runtimeIdentity: {
      workerId: "worker://t256",
      backendId: "backend://t256",
      buildId: "build://t256",
      resolvedRuntimeRef: "runtime://t256"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://t256/default",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://t256/fp",
      approvalSubjectRef: null
    },
    runtimeEvents,
    eventSink: (event) => runtimeEvents.push(event),
    standardPluginRefs: [],
    capabilityProvenanceRefs: [],
    actorRef: "actor://t256/operator",
    invocationId: "invocation://t256/profile-aware",
    requestId: "request://t256/profile-aware",
    correlationId: "correlation://t256/profile-aware"
  });
  assert.equal(assembled.accepted, true, JSON.stringify(assembled));
  const invocation = await invokeAdmittedCatalogGraphFunction(
    assembled.assembly
  );
  assert.equal(invocation.accepted, false, JSON.stringify(invocation));
  assert.match(
    invocation.message,
    /declared_execution_context_startup_blocked_awaiting_t267/u
  );
});
