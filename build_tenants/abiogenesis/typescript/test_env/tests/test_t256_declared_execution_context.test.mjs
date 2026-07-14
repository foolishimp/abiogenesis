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
  compileCAlgebraToHog
} from "../../build/semantic/code/src/abg/m03/contracts/c_algebra_hog_compiler.js";
import {
  admitBoundWorkspaceCatalog,
  deriveRegistrySessionView
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  ABG_CONSENSUS_GTL_BODY,
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
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/gtl_program_conformance.js";
import {
  admitDeclaredTraversalStageResultAuthority,
  admitTraversalExecution,
  assertTraversalExecutionRuntimeStart,
  compileTraversalExecutionContracts,
  projectTraversalContractSourceBasis
} from "../../build/semantic/code/src/abg/m03/contracts/traversal_execution_contract.js";
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
    outputContractRefs: options.outputContractRefs ?? [
      options.outputContractRef ?? `contract://t256/${kind}`
    ],
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
  const regimeRows = input.completeProgram === true
    ? [
        {
          stageRole: "transform",
          regime: "F_P",
          role: "validate",
          inputCarrierRefs: input.sources.map((nodeValue) => nodeValue.id)
        },
        {
          stageRole: "evaluate",
          regime: "F_D",
          role: "validate",
          inputCarrierRefs: [input.target.id]
        },
        {
          stageRole: "consequence",
          regime: "F_D",
          role: "close",
          inputCarrierRefs: [input.target.id]
        }
      ]
    : [
        {
          stageRole: input.stageRole,
          regime: input.regime,
          role:
            input.compositionRole ??
            (input.regime === "F_H" ? "construct" : "validate"),
          inputCarrierRefs: input.sources.map((nodeValue) => nodeValue.id)
        }
      ];
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
    regimes: regimeRows.map((row, order) => ({
      bindingRef:
        `regime-binding://${sourceRef}/${row.stageRole}/${String(order)}`,
      stageRole: row.stageRole,
      regime: row.regime,
      role: row.role,
      order,
      authority: "judgment",
      inputCarrierRefs: row.inputCarrierRefs,
      outputCarrierRefs: [input.target.id],
      evidenceRefs: [`evidence://${sourceRef}/${row.stageRole}`]
    })),
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
  const completeProgram = options.completeProgram === true;
  const stageRole = regime === "F_H" ? "human_callout" : "transform";
  const source = node("Observation", "observation");
  const contextSource = options.multiSource === true
    ? node("PolicyContext", "policy-context")
    : null;
  const sources = contextSource === null ? [source] : [source, contextSource];
  const target = node("Decision", "decision", {
    outputContractRef: TARGET_CONTRACT_REF,
    outputContractRefs: options.targetOutputContractRefs
  });
  const instructionAsset = completeProgram
    ? source
    : node("TransformInstruction", "instruction");
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
            },
            {
              slot: "interaction_operation_ids",
              fieldPath: "execution.interaction_operation_ids",
              valueKind: "ref_list",
              required: true
            },
            {
              slot: "interaction_resume_operation_ids",
              fieldPath: "execution.interaction_resume_operation_ids",
              valueKind: "ref_list",
              required: true
            },
            {
              slot: "interaction_choice_refs",
              fieldPath: "execution.interaction_choice_refs",
              valueKind: "ref_list",
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
        required: options.optionalProtocolSection !== true,
        policyRefs: ["policy://t256/full-content"]
      }
    ],
    relevancePolicies: [
      {
        policyRef: RELEVANCE_REF,
        mode: "selected_vector_source_closure"
      }
    ],
    compressionPolicy: {
      policyRef: "policy://t256/compression",
      mode: "full_admitted_content"
    },
    proportionalityPolicyRef: "policy://t256/proportionality",
    runtimeBindingSlotClasses: ["source_node"],
    policyRefs: ["policy://t256/instruction"]
  });
  const programRef = "program://t256/generic-transform";
  const program = declareCProgram({
    programRef,
    term: completeProgram
      ? C.compose(
          C.compose(
            C.of({
              input: typedCarrier(sources),
              output: typedCarrier([target]),
              stageRole: "transform",
              fibre: "F_P",
              armId: "arm://t256/transform",
              resultBearing: true,
              instructionCategoryRefs: [SECTION_REF]
            }),
            C.of({
              input: typedCarrier([target]),
              output: typedCarrier([target]),
              stageRole: "evaluate",
              fibre: "F_D",
              armId: "arm://t256/evaluate",
              resultBearing: false
            })
          ),
          C.of({
            input: typedCarrier([target]),
            output: typedCarrier([target]),
            stageRole: "consequence",
            fibre: "F_D",
            armId: "arm://t256/consequence",
            resultBearing: false
          })
        )
      : C.of({
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
    compositionRole: options.compositionRole,
    completeProgram,
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
    compositionRole: options.compositionRole,
    completeProgram,
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
    nodes: completeProgram
      ? [...sources, target]
      : [...sources, target, instructionAsset],
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
      cProgramCatalogDeclarationEntry([program]),
      ...(completeProgram
        ? [
            hogProgramRefDeclarationEntry(programRef),
            pluginSelectionDeclarationEntry({
              fdEvaluator: "plugin://abg/fd-evaluator",
              fpDispatch: "plugin://abg/fp-dispatch"
            })
          ]
        : [])
    ]),
    tags: ["t256", "generic"]
  });
  const finalComposition = compositionDeclarations({
    graphFunctionRef: firstHost.id,
    vectorRef: secondVector.id,
    sources,
    stageRole,
    regime,
    compositionRole: options.compositionRole,
    completeProgram,
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
                interaction_subject_ref: "interaction-subject://t256/review",
                interaction_operation_ids: [
                  "abg.operation.fh.approve",
                  "abg.operation.fh.reject",
                  "abg.operation.fh.assess"
                ],
                interaction_resume_operation_ids: [
                  "abg.operation.fh.approve",
                  "abg.operation.fh.reject"
                ],
                interaction_choice_refs: []
              }),
          instruction_protocol_ref: PROTOCOL_REF,
          result_contract_ref: TARGET_CONTRACT_REF,
          capability_requirement_refs: []
        },
        observation: { value: 42 }
      }
    }),
    ...(contextSource === null
      ? []
      : [
          constructAdmittedInvocationCarrier({
            sourceNodeRef: contextSource.id,
            schemaRef: contextSource.schema.ref,
            carrierRef: "carrier://t256/policy-context/1",
            admissionRef: "admission://t256/policy-context/1",
            value: { policy: { mode: "bounded" } }
          })
        ])
  ]);
  return {
    source,
    contextSource,
    target,
    projectionRule,
    protocolRule,
    module,
    host,
    vector,
    sourceOutcome,
    catalogBasis: catalogResult.basis,
    catalogEvents: catalogResult.admissionEvents,
    stageBasis,
    invocationCarriers
  };
}

function joinFixture(value, overrides = {}) {
  return joinDeclaredExecutionContext({
    sourceOutcome: value.sourceOutcome,
    stageBasis: value.stageBasis,
    selectedCatalogEntryRef: ENTRY_REF,
    catalogBasis: value.catalogBasis,
    invocationCarriers: value.invocationCarriers,
    ...overrides
  });
}

function traversalSourceInput(value) {
  return Object.freeze({
    kind: "selected_program_handoff",
    module: value.module,
    executionSubjectGraphFunction: value.host,
    declarationOwnerGraphFunction: value.host,
    graphVector: value.vector,
    targetCarrierDefaults,
    admittedTenantConformanceManifest: null,
    outcome: value.sourceOutcome
  });
}

function compileFpTraversal(value) {
  const joined = joinFixture(value);
  assert.equal(joined.status, "request_constructed", JSON.stringify(joined));
  const sourceInput = traversalSourceInput(value);
  const source = projectTraversalContractSourceBasis(sourceInput);
  const authority = admitDeclaredTraversalStageResultAuthority({
    source,
    stageOrdinal: 0,
    contract: joined.compiledContract,
    selectedResultContractRef:
      source.targetCarrierProjection.targetCarrierContractRef,
    fpWireProfile: "standard_live_review"
  });
  const bundle = compileTraversalExecutionContracts({
    source,
    resultAuthorities: [authority]
  });
  return Object.freeze({ joined, sourceInput, source, authority, bundle });
}

function gateFpTraversal(value, compiled) {
  const conformanceInput = Object.freeze({
    subjectRef: "workspace://abg/t267/non-consensus-fp",
    abiPackageVersion: "5.0.0-dev.0",
    scopeKind: "submitted_structure",
    modules: [value.module],
    targetCarrierContracts: [compiled.source.targetCarrierProjection],
    edgeClosureContracts: [compiled.source.edgeClosureBinding.conformanceRow],
    computeCompositions: [compiled.bundle.computeComposition],
    computeStageBindings: compiled.bundle.computeStageBindings,
    pluginResultInterfaces: compiled.bundle.pluginResultInterfaces,
    traversalBindConservation: [compiled.bundle.traversalBindConservation]
  });
  const report = typecheckGtlProgram(conformanceInput);
  const admission = admitTraversalExecution({
    sourceInput: compiled.sourceInput,
    source: compiled.source,
    resultAuthorities: [compiled.authority],
    bundle: compiled.bundle,
    conformanceInput,
    report
  });
  return Object.freeze({ conformanceInput, report, admission });
}

function catalogInvocationInput(value, sessionView, runtimeEvents, overrides = {}) {
  const binding = value.catalogBasis.executionBindings[0];
  return {
    basis: value.catalogBasis,
    sessionView,
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
    correlationId: "correlation://t256/profile-aware",
    ...overrides
  };
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

test("T-256 constructs one canonical F_P request through the T-183 carrier path", () => {
  const value = fixture();
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.equal(outcome.compiledContract.selectedRegime, "F_P");
  assert.equal(outcome.compiledContract.selectedCompositionRole, "validate");
  assert.equal(outcome.compiledContract.fieldRows[0].sourceSchemaRef, value.source.schema.ref);
  assert.equal(outcome.compiledContract.fieldRows[0].sourceTypeRef, value.source.typeRef);
  assert.notEqual(outcome.instructionAssembly, null);
  assert.equal(outcome.instructionAssembly.plan.kind, "compiled_prompt_plan");
  assert.equal(outcome.instructionAssembly.plan.instructionWorkKind, "semantic_work");
  assert.deepEqual(outcome.instructionAssembly.plan.requiredInputRefs, [value.source.id]);
  assert.equal(
    outcome.instructionAssembly.plan.sectionDecisions[0].compressionMode,
    "full"
  );
  assert.equal(
    outcome.instructionAssembly.plan.derivedTruth.selectedOutputContractRef,
    TARGET_CONTRACT_REF
  );
  assert.equal(outcome.instructionAssembly.startupAdmission.admitted, true);
  assert.equal(outcome.instructionAssembly.envelope.kind, "instruction_envelope");
  assert.equal(
    outcome.instructionAssembly.envelope.selectedOutputContractRef,
    TARGET_CONTRACT_REF
  );
  assert.deepEqual(
    outcome.instructionAssembly.envelope.outputContractRefs,
    [TARGET_CONTRACT_REF]
  );
  assert.equal(
    outcome.instructionAssembly.envelope.outputContractRefs.includes(
      "contract://t256/instruction"
    ),
    false
  );
  assert.equal(outcome.request.regime, "F_P");
  assert.equal(outcome.request.planRef, outcome.instructionAssembly.plan.planRef);
  assert.equal(outcome.request.planDigest, outcome.instructionAssembly.plan.planDigest);
  assert.equal(outcome.request.envelopeRef, outcome.instructionAssembly.envelope.envelopeRef);
  assert.equal(outcome.request.envelopeDigest, outcome.instructionAssembly.envelope.envelopeDigest);
  assert.equal(outcome.request.startupBlock.status, "startup_blocked_awaiting_t267");
  assert.equal(outcome.request.startupBlock.effectsPermitted, false);
  assert.equal("prompt" in outcome.request, false);
  assert.equal("instructionProtocol" in outcome.request, false);
  assert.equal(outcome.request.resultContractRef, TARGET_CONTRACT_REF);
  assert.equal("capabilityRefs" in outcome.request, false);
});

test("T-256 preserves one selected result contract within a larger target contract set", () => {
  const alternateContractRef = "contract://t256/decision-alternate";
  const value = fixture({
    targetOutputContractRefs: [TARGET_CONTRACT_REF, alternateContractRef]
  });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.deepEqual(
    outcome.instructionAssembly.plan.derivedTruth.outputContractRefs,
    [TARGET_CONTRACT_REF, alternateContractRef].sort()
  );
  assert.equal(
    outcome.instructionAssembly.plan.derivedTruth.selectedOutputContractRef,
    TARGET_CONTRACT_REF
  );
  assert.equal(
    outcome.instructionAssembly.envelope.selectedOutputContractRef,
    TARGET_CONTRACT_REF
  );
  assert.equal(outcome.request.resultContractRef, TARGET_CONTRACT_REF);
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

  const protocolWireKeys = value.protocolRule.config.entries.map(
    (entry) => entry.key
  );
  assert.deepEqual(protocolWireKeys, [
    "version",
    "instruction_asset_node_ref",
    "allowed_stage_roles",
    "sections",
    "relevance_policies",
    "compression_policy",
    "proportionality_policy_ref",
    "runtime_binding_slot_classes",
    "policy_refs"
  ]);
  const camelCaseCompressionPolicy = structuredClone(value.protocolRule);
  camelCaseCompressionPolicy.config.entries = camelCaseCompressionPolicy.config.entries.map(
    (entry) =>
      entry.key === "compression_policy"
        ? { ...entry, key: "compressionPolicy" }
        : entry
  );
  assert.throws(
    () => admitInstructionProtocolRule(camelCaseCompressionPolicy),
    /compressionPolicy is unknown/u
  );

  const legacyWorkKind = structuredClone(value.protocolRule);
  legacyWorkKind.config.entries.push({
    key: "instruction_work_kind",
    value: { kind: "scalar", value: "dependency_disambiguation" }
  });
  assert.throws(
    () => admitInstructionProtocolRule(legacyWorkKind),
    /instruction_work_kind is unknown/u
  );

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

test("T-256 rejects unsupported policy modes instead of applying engine defaults", () => {
  const value = fixture();
  const declaration = admitInstructionProtocolRule(value.protocolRule).declaration;
  assert.throws(
    () =>
      constructInstructionProtocolRule({
        ...declaration,
        relevancePolicies: [
          {
            policyRef: RELEVANCE_REF,
            mode: "ambient_context_guess"
          }
        ]
      }),
    /unsupported value "ambient_context_guess"/u
  );
  assert.throws(
    () =>
      constructInstructionProtocolRule({
        ...declaration,
        compressionPolicy: {
          policyRef: declaration.compressionPolicy.policyRef,
          mode: "implicit_excerpt"
        }
      }),
    /unsupported value "implicit_excerpt"/u
  );

  const optional = joinFixture(fixture({ optionalProtocolSection: true }));
  assert.equal(optional.status, "invalid");
  assert.equal(
    optional.diagnostics[0].diagnosticId,
    "execution-context-instruction-rule-invalid"
  );
});

test("T-256 derives work class and blocks dependency disambiguation without typed truth", () => {
  const value = fixture({ compositionRole: "diagnose" });
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "invalid");
  assert.equal(
    outcome.diagnostics[0].diagnosticId,
    "execution-context-prompt-plan-rejected"
  );
  assert.match(outcome.diagnostics[0].actualRelation, /requires derived dependency/u);
});

test("T-256 rejects caller-authored assembly truth, stale module identity, and non-own carrier paths", () => {
  const value = fixture();

  const callerAuthoredBasis = joinFixture(value, {
    instructionAssemblyBasis: { forged: true }
  });
  assert.equal(callerAuthoredBasis.status, "invalid");
  assert.equal(
    callerAuthoredBasis.diagnostics[0].diagnosticId,
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
  assert.deepEqual(outcome.request.eligibleOperationIds, [
    "abg.operation.fh.approve",
    "abg.operation.fh.reject",
    "abg.operation.fh.assess"
  ]);
  assert.deepEqual(outcome.request.resumeEligibleOperationIds, [
    "abg.operation.fh.approve",
    "abg.operation.fh.reject"
  ]);
  assert.deepEqual(outcome.request.declaredChoiceRefs, []);
  assert.equal("planRef" in outcome.request, false);
  assert.equal("envelopeRef" in outcome.request, false);
  assert.equal(outcome.request.startupBlock.effectsPermitted, false);

  const fpBasisOnFh = joinFixture(value, {
    instructionAssemblyBasis: { forged: true }
  });
  assert.equal(fpBasisOnFh.status, "invalid");
  assert.equal(
    fpBasisOnFh.diagnostics[0].diagnosticId,
    "execution-context-instruction-rule-invalid"
  );
});

test("T-256 rejects empty F_H operation authority and a widened resume subset", () => {
  const value = fixture({ regime: "F_H" });
  const emptyOperations = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      interaction_operation_ids: [],
      interaction_resume_operation_ids: []
    })
  });
  assert.equal(emptyOperations.status, "invalid");
  assert.equal(
    emptyOperations.diagnostics[0].diagnosticId,
    "execution-context-field-value-invalid"
  );

  const widenedResume = joinFixture(value, {
    invocationCarriers: carriersWithExecution(value, {
      interaction_operation_ids: ["abg.operation.fh.approve"],
      interaction_resume_operation_ids: ["abg.operation.fh.reject"]
    })
  });
  assert.equal(widenedResume.status, "invalid");
  assert.equal(
    widenedResume.diagnostics[0].diagnosticId,
    "execution-context-field-value-invalid"
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

test("T-256 derives canonical compiler inputs and maps startup refusal to a typed diagnostic", () => {
  const value = fixture();
  const outcome = joinFixture(value);
  assert.equal(outcome.status, "request_constructed", JSON.stringify(outcome));
  assert.deepEqual(outcome.instructionAssembly.plan.requiredInputRefs, [value.source.id]);
  assert.deepEqual(outcome.instructionAssembly.plan.sourceNodeRefs, [value.source.id]);
  assert.equal(outcome.instructionAssembly.plan.proportionalityClass, "P1");
  assert.deepEqual(outcome.instructionAssembly.plan.fpValidationEvidenceRefs, []);
  assert.ok(outcome.instructionAssembly.plan.compilerEvidenceRefs.length > 0);
  assert.deepEqual(
    outcome.instructionAssembly.plan.bindingSlots.map((slot) => slot.slotClass),
    ["source_node"]
  );
  assert.deepEqual(
    outcome.instructionAssembly.plan.sectionDecisions.map((section) => section.text),
    [SECTION_TEXT]
  );
  assert.deepEqual(
    outcome.instructionAssembly.envelope.boundRuntimeRefs.map((fact) => [
      fact.slotClass,
      fact.ref,
      fact.admitted
    ]),
    [["source_node", value.source.id, true]]
  );

  const startupCatalog = structuredClone(value.catalogBasis);
  startupCatalog.projection.runtimeRegistryProjection.entries = [];
  const startupRejected = joinFixture(value, { catalogBasis: startupCatalog });
  assert.equal(startupRejected.status, "invalid");
  assert.equal(
    startupRejected.diagnostics[0].diagnosticId,
    "execution-context-prompt-plan-startup-rejected"
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

test("T-256 preserves selected catalog authority instead of selecting by helper containment", () => {
  const value = fixture();
  const selected = value.catalogBasis.executionBindings[0];
  assert.notEqual(selected, undefined);
  const sibling = {
    ...selected,
    entryRef: "catalog-entry://t256/unrelated-sibling",
    declarationRef: "gtl-declaration://t256/unrelated-sibling"
  };

  const substituted = joinFixture(value, {
    catalogBasis: {
      ...value.catalogBasis,
      executionBindings: [sibling]
    }
  });
  assert.equal(substituted.status, "invalid");
  assert.equal(
    substituted.diagnostics[0].diagnosticId,
    "execution-context-program-binding-mismatch"
  );

  const twoEntriesOneModule = joinFixture(value, {
    catalogBasis: {
      ...value.catalogBasis,
      executionBindings: [selected, sibling]
    }
  });
  assert.equal(
    twoEntriesOneModule.status,
    "request_constructed",
    JSON.stringify(twoEntriesOneModule)
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

test("T-256 refuses mutated protocol profile content identity", () => {
  const value = fixture();
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

test("T-256 joins the unchanged T-252 reduce-round body through its non-invoking companion", () => {
  assert.equal(
    stableSha256Digest(ABG_CONSENSUS_GTL_MODULE),
    "sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695"
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

  const round = ABG_CONSENSUS_GTL_BODY.graphFunctions.round;
  assert.equal(round.template.kind, "inline_graph");
  const reduceRound = round.template.graph.vectors.find(
    (vector) => vector.id === "graph-vector://abg/consensus/reduce-round"
  );
  assert.notEqual(reduceRound, undefined);
  const sourceOutcome = compileGraphVectorExecutionHandoff({
    graphFunction: round,
    graphVector: reduceRound,
    graphFunctions: ABG_CONSENSUS_GTL_MODULE.graphFunctions,
    module: ABG_CONSENSUS_GTL_MODULE,
    targetCarrierDefaults,
    admittedTenantConformanceManifest: null
  });
  assert.equal(sourceOutcome.status, "blocked_capability", JSON.stringify(sourceOutcome));
  const program = ABG_CONSENSUS_GTL_BODY.programs.find(
    (candidate) => candidate.programRef === sourceOutcome.programBinding.selectedProgramRef
  );
  assert.notEqual(program, undefined);
  const lowered = compileCAlgebraToHog(program);
  assert.equal(lowered.accepted, true, JSON.stringify(lowered));
  assert.notEqual(lowered.program, null);
  const stage = lowered.program.stages[0];
  assert.notEqual(stage, undefined);
  const outcome = joinDeclaredExecutionContext({
    sourceOutcome,
    stageBasis: constructDeclaredCStageInvocationBasis({
      programBindingDigest: sourceOutcome.programBinding.bindingDigest,
      stageIndex: 0,
      stageRole: stage.stageRole,
      regime: stage.defaultRegime,
      termDigest: stableSha256Digest(stage),
      instructionCategoryRefs: stage.instructionCategoryRefs
    }),
    selectedCatalogEntryRef: ABG_CONSENSUS_MODULE_DECLARATIONS[0].entryRef,
    catalogBasis: catalogResult.basis,
    invocationCarriers: constructAdmittedInvocationCarrierSet(
      reduceRound.source.map((sourceNode, index) =>
        constructAdmittedInvocationCarrier({
          sourceNodeRef: sourceNode.id,
          schemaRef: sourceNode.schema.ref,
          carrierRef: `carrier://t256/consensus/reduce-round/${String(index)}`,
          admissionRef: `admission://t256/consensus/reduce-round/${String(index)}`,
          value: { kind: "t256_consensus_join_probe", fields: {} }
        })
      )
    )
  });
  assert.equal(outcome.status, "blocked_capability", JSON.stringify(outcome));
  assert.equal(
    outcome.compiledContract.selectedProgramBinding.hostGraphFunctionRef,
    round.id
  );
  assert.equal(outcome.compiledContract.selectedStageRole, "reduce_round");
  assert.equal(outcome.compiledContract.selectedComputeStageRole, "transform");
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
  const assembled = assembleCatalogInvocation(
    catalogInvocationInput(value, session.view, runtimeEvents)
  );
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

test("T-267 admits a real non-Consensus F_P join without hashing current evidence into static identity", () => {
  const firstValue = fixture({ completeProgram: true });
  const secondValue = fixture({ completeProgram: true });
  const first = compileFpTraversal(firstValue);
  const second = compileFpTraversal(secondValue);

  assert.equal(first.source.sourceDigest, second.source.sourceDigest);
  assert.notEqual(
    first.joined.compiledContract.declarationClosureDigest,
    second.joined.compiledContract.declarationClosureDigest
  );
  assert.notEqual(
    first.authority.currentSourceAuthorityDigest,
    second.authority.currentSourceAuthorityDigest
  );
  assert.deepEqual(first.authority.currentEvidenceRefs, [
    first.joined.compiledContract.declarationClosureDigest
  ]);
  assert.deepEqual(second.authority.currentEvidenceRefs, [
    second.joined.compiledContract.declarationClosureDigest
  ]);
  assert.equal(first.authority.authorityDigest, second.authority.authorityDigest);
  assert.equal(first.bundle.bundleDigest, second.bundle.bundleDigest);

  const { report, admission: outcome } = gateFpTraversal(firstValue, first);

  assert.equal(
    report.issues.some((issue) =>
      issue.ruleRef.startsWith("abg://gtl-program/traversal-unit/")
    ),
    false,
    JSON.stringify(report.issues, null, 2)
  );
  assert.equal(
    outcome.status,
    "runtime_addressable_not_closed",
    JSON.stringify(report.issues, null, 2)
  );
  assert.equal(outcome.effectsPermitted, true);
});

test("T-267 runtime start requires the exact addressable admission and declared request", () => {
  const value = fixture({ completeProgram: true });
  const compiled = compileFpTraversal(value);
  const { admission } = gateFpTraversal(value, compiled);
  assert.equal(admission.status, "runtime_addressable_not_closed");
  assert.equal(admission.sourceKind, "selected_program_handoff");
  assert.equal(
    admission.currentAuthorityRef,
    compiled.joined.request.handoffRef
  );
  assert.equal(
    admission.startupBlockDigest,
    compiled.joined.request.startupBlockDigest
  );
  assert.deepEqual(
    admission.currentResultAuthorities,
    [
      {
        sourceKind: "declared_fp_contract",
        stageOrdinal: 0,
        domainStageRole: compiled.joined.request.stageRole,
        currentSourceAuthorityRef:
          compiled.joined.request.contextContractRef,
        currentSourceAuthorityDigest:
          compiled.joined.request.contextContractDigest
      }
    ]
  );

  assert.doesNotThrow(() => assertTraversalExecutionRuntimeStart({
    request: compiled.joined.request,
    admission
  }));
  assert.throws(
    () => assertTraversalExecutionRuntimeStart({
      request: Object.freeze({
        ...compiled.joined.request,
        contextContractDigest: stableSha256Digest("stale-context-contract")
      }),
      admission
    }),
    (error) =>
      error?.diagnostic?.diagnosticId === "traversal-runtime-start-invalid"
  );
  assert.throws(
    () => assertTraversalExecutionRuntimeStart({
      request: compiled.joined.request,
      admission: Object.freeze({
        ...admission,
        admissionDigest: stableSha256Digest("stale-admission")
      })
    }),
    (error) =>
      error?.diagnostic?.diagnosticId === "traversal-runtime-start-invalid"
  );
  assert.throws(
    () => assertTraversalExecutionRuntimeStart({
      request: compiled.joined.request,
      admission: Object.freeze({
        ...admission,
        capabilityDisposition:
          admission.capabilityDisposition === "compatible_exact_manifest"
            ? "not_applicable_no_effect_requirements"
            : "compatible_exact_manifest"
      })
    }),
    (error) =>
      error?.diagnostic?.diagnosticId === "traversal-runtime-start-invalid"
  );
});

test("T-267 catalog runtime consumes the exact request, plan, and admission", async () => {
  const value = fixture({ completeProgram: true });
  const compiled = compileFpTraversal(value);
  const { admission } = gateFpTraversal(value, compiled);
  assert.equal(admission.status, "runtime_addressable_not_closed");
  assert.notEqual(compiled.joined.instructionAssembly, null);

  const binding = value.catalogBasis.executionBindings[0];
  assert.equal(admission.graphFunctionId, binding.graphFunctionId);
  assert.equal(admission.graphFunctionId, binding.graphFunctionHandle);
  assert.equal(admission.graphFunctionDigest, binding.graphFunctionDigest);
  const session = deriveRegistrySessionView({
    basis: value.catalogBasis,
    allowedEntryRefs: [binding.entryRef]
  });
  assert.equal(session.accepted, true, JSON.stringify(session));
  assert.notEqual(session.view, null);
  const runtimeEvents = [...value.catalogEvents];
  const assembled = assembleCatalogInvocation(
    catalogInvocationInput(value, session.view, runtimeEvents, {
      declaredExecutionRequest: compiled.joined.request,
      traversalExecutionAdmission: admission,
      instructionAssemblyStartup: {
        compiledPromptPlans: [compiled.joined.instructionAssembly.plan],
        rendererRef: value.source.assetSurface.rendererRefs[0]
      }
    })
  );
  assert.equal(assembled.accepted, true, JSON.stringify(assembled));
  const invocation = await invokeAdmittedCatalogGraphFunction(
    assembled.assembly
  );

  assert.equal(invocation.accepted, true, JSON.stringify(invocation));
  assert.equal(
    invocation.engineResult.transition.reason.includes(
      "declared_execution_context_startup_blocked_awaiting_t267"
    ),
    false
  );
});
