// Validates the bounded T-270 post-ingress sunny path with a non-Consensus
// Scenario-09 GraphFunction and the real complete-C interpreter.

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  graphFunctionDeclarations,
  graphVectorDeclarations,
  hogProgramRefDeclarationEntry,
  pluginSelectionDeclarationEntry
} from "../../build/semantic/code/src/gtl/m01/contracts/index.js";
import {
  constructExecutionContextProjectionRule,
  constructInstructionProtocolRule,
  constructAdmittedInvocationCarrier,
  constructAdmittedInvocationCarrierSet
} from "../../build/semantic/code/src/abg/m03/contracts/declared_execution_context.js";
import {
  abgFnCompositionDeclarationRef,
  constructAbgFnCompositionDeclarations
} from "../../build/semantic/code/src/abg/m03/contracts/fn_composition.js";
import {
  admitRunInvokeExecutionIngress,
  T270_RUNTIME_COMPATIBILITY_GAP
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_execution_ingress.js";
import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  constructOneSurfaceProgramMemberProjection
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_authority.js";
import {
  constructConstructionPriorityScheme
} from "../../build/semantic/code/src/abg/m03/contracts/construction_priority.js";
import {
  canonicalizeRuntimeSchemaAdmissionMetadataRows,
  RUNTIME_SCHEMA_ADMISSION_METADATA_KEY
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_schema_admission.js";
import {
  admitT270ExecutionBasis,
  compileSelectedCatalogDirectProgram,
  deriveT270StartAdmissionWitness,
  executeSelectedCatalogDirectProgram
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_execution.js";
import {
  constructCCallValueHandler
} from "../../build/semantic/code/src/abg/m03/runner/c_call_handlers.js";
import {
  admitPrivatePublicOperationEvent,
  admitPrivatePublicOperationIngressWitness
} from "../../build/semantic/code/src/abg/m03/runner/public_operation_admission.js";
import {
  RESULT_ASSESSMENT_DERIVED_FLUENT_RULE,
  constructRuntimeFluent,
  constructVectorClosedRuntimeFluent,
  constructVectorRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/contracts/event_calculus.js";
import {
  deriveAdmittedOutputAuthorityProjection,
  derivePayloadLedgerProjection
} from "../../build/semantic/code/src/abg/m03/contracts/payload_ledger.js";
import {
  deriveReplayAdmittedRuntimeResultRelation
} from "../../build/semantic/code/src/abg/m03/contracts/replay_admitted_runtime_result.js";
import {
  deriveResultAssessmentRuntimeSubjectRelation
} from "../../build/semantic/code/src/abg/m03/contracts/result_assessment_relation.js";
import {
  deriveRuntimeAggregateProjection
} from "../../build/semantic/code/src/abg/m03/contracts/projection.js";
import {
  CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/catalog_operation_contracts.js";
import {
  constructNonProjectReadOwnerContractFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/non_project_read_owner_contract_family.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  bindPrivateResultAssessHandler
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_handler_bindings.js";
import {
  ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
  ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
  ABG_SYSTEM_ONE_SURFACE_MODULE_PATH,
  buildAbgSystemOneSurfaceProgram,
  executeInstalledAbgSystemOneSurfaceSelection,
  projectInstalledAbgSystemOneSurfaceAuthority
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_one_surface_program.js";
import {
  ABG_SYSTEM_SUNNY_ARM_ID,
  ABG_SYSTEM_SUNNY_HANDLER_REF,
  ABG_SYSTEM_SUNNY_PROGRAM_REF,
  ABG_SYSTEM_SUNNY_STAGE_ROLE,
  buildAbgSystemSunnyFdImplementation,
  buildAbgSystemSunnyGraphFunctionModule
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_sunny_graph_function.js";
import {
  bindM04RuntimeSchemaNativeDefinition,
  projectM04RuntimeSchemaAdmission
} from "../../build/semantic/code/src/app/m04/public_contracts/runtime_schema_admission.js";
import {
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import {
  constructContractRef,
  constructGtlLibraryEntryDeclaration,
  constructJob,
  constructModule
} from "../../build/semantic/code/src/gtl/m02/index.js";
import {
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding
} from "../../build/semantic/code/src/gtl/m01/contracts/target_carrier_contract.js";
import {
  sha256DigestForText,
  stableJsonEquals,
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  admittedTenantManifestFixture
} from "../fixtures/admitted_tenant_manifest.mjs";
import {
  createOneSurfaceRuntimeEmitter
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_program_runtime.js";
import {
  admitT281PrivateP1Packet
} from "./support/t281-private-ingress-fixture.mjs";

const ENTRY_REF = "catalog-entry://t270/scenario09-direct";
const MODULE_REF = "gtl-module://t270/scenario09-direct";
const ONE_SURFACE_MODULE_REF =
  `contribution://abiogenesis/5.0.0#${ABG_SYSTEM_ONE_SURFACE_MODULE_PATH}`;
const WORKSPACE_ID = "workspace://t270/scenario09-direct";
const BINDING_ID = "binding://t270/scenario09-direct";
const CATALOG_ID = "catalog://t270/scenario09-direct";
const LOCK_REF = "lock://t270/scenario09-direct";
const FP_PROGRAM_REF = "program://t270/scenario09-fp-transform";
const FP_PROTOCOL_REF = "instruction-protocol://t270/scenario09-fp-transform";
const FP_SECTION_REF = "instruction-section://t270/scenario09-fp-transform";
const FP_SECTION_TEXT =
  "Return the selected catalog admission request contract as target_value.";
const FP_CAPABILITY_ID = "capability://t270/scenario09-direct";
const LIVE_STEERING_REF = "steering://t270/scenario09";
const LIVE_STEERING_DIGEST = digest("live-steering");

function digest(subject) {
  return stableSha256Digest({ subject });
}

function publicAdmissionFor(ingress, priorEvents, eventSink) {
  const witness = admitPrivatePublicOperationIngressWitness({
    definitionKey: Object.freeze({
      operationId: "abg.operation.run.invoke",
      memberKind: "variant",
      variant: ingress.variant
    }),
    definitionDigest: ingress.definitionDigest,
    eventAdmission: "owning_semantic_authority",
    invocationRef: ingress.invocation.ref,
    invocationDigest: ingress.invocation.digest,
    invocationAuthorityRef: ingress.invocation.authorityRef,
    invocationAuthorityDigest: ingress.invocation.authorityDigest,
    authorityBasisRef: ingress.invocationAuthority.authorityBasisRef,
    authorityBasisDigest: ingress.invocationAuthority.authorityBasisDigest,
    actorAttribution: Object.freeze({
      state: "admitted_actor",
      ...ingress.invocationAuthority.actor
    }),
    workspaceBindingRequirement: "exactly_one",
    workspaceBindingWitness: Object.freeze({
      state: "admitted_workspace",
      bindingRef: ingress.workspace.bindingRef,
      bindingDigest: ingress.workspace.bindingDigest
    }),
    causationEventRefs: Object.freeze([]),
    correlationId: `correlation://t270/${ingress.invocation.ref}`,
    priorEvents
  });
  const receipt = admitPrivatePublicOperationEvent({
    witness,
    priorEvents,
    eventSink
  });
  return Object.freeze({
    receipt,
    replay: Object.freeze([...priorEvents, receipt.event])
  });
}

function oneSurfaceRuntimeEntry(program) {
  return Object.freeze({
    kind: "runtime_library_entry",
    declaration: constructGtlLibraryEntryDeclaration({
      declarationRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
      entryRef: ABG_SYSTEM_ONE_SURFACE_CATALOG_HANDLE,
      libraryScope: "system",
      entryKind: "graph_function",
      namespace: "abiogenesis",
      ownerRef: "abiogenesis",
      version: "5.0.0",
      graphFunctionRef: ABG_SYSTEM_ONE_SURFACE_GRAPH_FUNCTION_HANDLE,
      interfaceRef: "abg.schema.one-surface.observation-input",
      sourceContractRef: "abg.schema.one-surface.observation-input",
      targetContractRef: "abg.schema.one-surface.action-decision",
      authorityRefs: ["authority://abiogenesis/system/one-surface"],
      overlayRefs: [],
      provenanceRefs: ["provenance://abiogenesis/system/one-surface"],
      readinessRefs: ["readiness://abiogenesis/system/one-surface"],
      proofRefs: ["proof://abiogenesis/system/one-surface"],
      policyRefs: ["policy://abiogenesis/system/one-surface"],
      declarationSourceRefs: [ONE_SURFACE_MODULE_REF]
    }),
    moduleRef: ONE_SURFACE_MODULE_REF,
    module: program.module
  });
}

function taggedObject(value) {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze(Object.entries(value).map(([key, item]) =>
      Object.freeze({ key, value: item })
    ))
  });
}

function taggedRows(rows) {
  return Object.freeze({
    kind: "array",
    items: Object.freeze(rows.map(taggedObject))
  });
}

async function catalogFixture() {
  const sourceFamily = WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean;
  const ownerFamily = await constructNonProjectReadOwnerContractFamily();
  const definitionFamily =
    ownerFamily["abg.operation.workspace.create"].clean;
  const module = buildAbgSystemSunnyGraphFunctionModule();
  const graphFunction = module.graphFunctions[0];
  assert.notEqual(graphFunction, undefined);
  assert.equal(graphFunction.template.kind, "inline_graph");
  const vector = graphFunction.template.graph.vectors[0];
  assert.notEqual(vector, undefined);
  const operator = vector.operators[0];
  assert.notEqual(operator, undefined);
  const nativeDefinitions = Object.freeze([
    Object.freeze({
      source: sourceFamily.request,
      definition: definitionFamily.request.contract,
      relation: bindM04RuntimeSchemaNativeDefinition({
        source: sourceFamily.request,
        symbolicSchemaRef: graphFunction.inputs[0].schema.ref,
        definition: definitionFamily.request.contract
      })
    })
  ]);
  const rows = canonicalizeRuntimeSchemaAdmissionMetadataRows(
    [graphFunction.inputs[0]].map((node) =>
      Object.freeze({
        graphFunctionId: graphFunction.id,
        nodeRef: node.id,
        symbolicSchemaRef: node.schema.ref,
        contractId:
          nativeDefinitions[0].definition.schemaCoordinate.contractId,
        contractVersion:
          nativeDefinitions[0].definition.schemaCoordinate.contractVersion
      })
    )
  );
  assert.deepEqual(
    module.metadata.entries,
    Object.freeze([Object.freeze({
      key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
      value: Object.freeze({
        kind: "json_blob",
        value: taggedRows(rows)
      })
    })])
  );
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t270/scenario09-direct",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "t270.scenario09",
    ownerRef: "owner://t270/scenario09",
    version: "5.0.0",
    graphFunctionRef: graphFunction.id,
    interfaceRef: "interface://t270/scenario09-direct",
    sourceContractRef:
      definitionFamily.request.contract.schemaCoordinate.contractId,
    targetContractRef:
      definitionFamily.request.contract.schemaCoordinate.contractId,
    contextRefs: ["context://t270/scenario09"],
    authorityRefs: ["authority://t270/runtime"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t270/scenario09"],
    readinessRefs: ["readiness://t270/scenario09"],
    proofRefs: ["proof://t270/scenario09"],
    policyRefs: ["policy://t270/scenario09"],
    declarationSourceRefs: [MODULE_REF]
  });
  const result = admitBoundWorkspaceCatalog({
    kind: "bound_catalog_admission_batch",
    workspaceId: WORKSPACE_ID,
    bindingId: BINDING_ID,
    catalogId: CATALOG_ID,
    resolvedLockRef: LOCK_REF,
    systemDeclarations: [
      oneSurfaceRuntimeEntry(ONE_SURFACE_PROGRAM),
      Object.freeze({
        kind: "runtime_library_entry",
        declaration,
        moduleRef: MODULE_REF,
        module
      })
    ],
    orderedProductBatches: [],
    causationEventRefs: ["event://t270/scenario09/catalog-admitted"],
    correlationId: "correlation://t270/scenario09/catalog-admission"
  }, () => {});
  assert.equal(result.accepted, true, JSON.stringify(result));
  assert.notEqual(result.basis, null);
  const binding = result.basis.executionBindings.find(
    (row) => row.entryRef === ENTRY_REF
  );
  assert.notEqual(binding, undefined);
  const schemaProjection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: nativeDefinitions.map((row) => row.relation)
  });
  return Object.freeze({
    basis: result.basis,
    binding,
    graphFunction,
    operator,
    schemaProjection,
    inputDefinition: definitionFamily.request.contract,
    sourceNode: graphFunction.inputs[0],
    targetNode: graphFunction.outputs[0]
  });
}

async function fpCatalogFixture() {
  const sourceFamily = CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES.catalog_admit.admit;
  const ownerFamily = await constructNonProjectReadOwnerContractFamily();
  const definitionFamily = ownerFamily["abg.operation.catalog.admit"].admit;
  const contract = definitionFamily.request.contract;
  const node = constructNode({
    id: "node://t270/scenario09-fp/catalog-admit-request",
    name: "T270Scenario09FpCatalogAdmitRequest",
    schema: { kind: "symbolic", ref: contract.schemaCoordinate.schemaId },
    typeRef: null,
    markov: ["catalog:admitted", "runtime:admitted"],
    assetSurface: {
      kind: "public_operation_request",
      requiredContexts: ["context://t270/scenario09-fp"],
      standardsRefs: ["REQ-R-ABG3-INSTRUCTION-ASSEMBLY"],
      outputContractRefs: [contract.schemaCoordinate.contractId],
      constructorRefs: ["constructor://t270/scenario09-fp/catalog-admit"],
      constructorInputAssetKinds: ["source"],
      rendererRefs: ["renderer://t270/scenario09-fp"],
      renderedViewDigestPolicyRef: "policy://t270/scenario09-fp/rendered-view",
      sectionKindRefs: ["section-kind://t270/scenario09-fp/body"],
      clauseKindRefs: ["clause-kind://t270/scenario09-fp/assertion"],
      authoritySlots: [{
        authorityKindRef: "authority://t270/scenario09-fp",
        disposition: "bounded_fallback",
        fallbackPreconditionRefs: ["precondition://t270/scenario09-fp/admitted"]
      }],
      proofObligationRefs: ["proof://t270/scenario09-fp"]
    },
    tags: ["t270", "scenario09", "fp-transform"]
  });
  const carrier = cInterfaceCarrier(
    typedInterface(typedNode({ node, decode: (raw) => raw }))
  );
  const program = declareCProgram({
    programRef: FP_PROGRAM_REF,
    term: C.of({
      input: carrier,
      output: carrier,
      stageRole: "transform",
      fibre: "F_P",
      armId: "arm://t270/scenario09-fp/transform",
      resultBearing: true,
      instructionCategoryRefs: [FP_SECTION_REF]
    }),
    proportionalityClass: "P1"
  });
  const projectionRule = constructExecutionContextProjectionRule({
    projectionRef: "execution-context-projection://t270/scenario09-fp",
    version: "1.0.0",
    sourceNodeRef: node.id,
    fieldRows: [
      {
        slot: "role_or_worker_selection_ref",
        fieldPath: "workspaceBindingRef",
        valueKind: "ref",
        required: true
      },
      {
        slot: "configuration_digest",
        fieldPath: "workspaceBindingDigest",
        valueKind: "digest",
        required: true
      },
      {
        slot: "instruction_protocol_ref",
        fieldPath: "resolvedLockRef",
        valueKind: "ref",
        required: true
      },
      {
        slot: "result_contract_ref",
        fieldPath: "workspaceBindingRef",
        valueKind: "ref",
        required: true
      },
      {
        slot: "capability_requirement_refs",
        fieldPath: "descriptorRefs",
        valueKind: "ref_list",
        required: true
      }
    ],
    policyRefs: ["policy://t270/scenario09-fp/context-projection"]
  });
  const protocolRule = constructInstructionProtocolRule({
    instructionProtocolRef: FP_PROTOCOL_REF,
    version: "1.0.0",
    instructionAssetNodeRef: node.id,
    allowedStageRoles: ["transform"],
    sections: [{
      sectionRef: FP_SECTION_REF,
      sectionKindRef: "section-kind://t270/scenario09-fp/body",
      content: FP_SECTION_TEXT,
      contentDigest: sha256DigestForText(FP_SECTION_TEXT),
      required: true,
      policyRefs: ["policy://t270/scenario09-fp/full-content"]
    }],
    relevancePolicies: [{
      policyRef: "relevance://t270/scenario09-fp/source",
      mode: "selected_vector_source_closure"
    }],
    compressionPolicy: {
      policyRef: "policy://t270/scenario09-fp/compression",
      mode: "full_admitted_content"
    },
    proportionalityPolicyRef: "policy://t270/scenario09-fp/proportionality",
    runtimeBindingSlotClasses: ["source_node"],
    policyRefs: ["policy://t270/scenario09-fp/instruction"]
  });
  const vectorId = "graph-vector://t270/scenario09-fp/transform";
  const graphFunctionId = "graph-function-id://t270/scenario09-fp/transform";
  const composition = constructAbgFnCompositionDeclarations({
    contractRef: `abg.fn_composition://${vectorId}`,
    hookRef: `hook://${vectorId}/composition`,
    hostGraphFunctionRef: graphFunctionId,
    hostGraphVectorRef: vectorId,
    hostSourceNodeRefs: [node.id],
    hostTargetNodeRef: node.id,
    hostTargetSchemaRef: node.schema.ref,
    owningDeclarationRef: abgFnCompositionDeclarationRef({
      source: "graph_vector_declarations",
      sourceRef: vectorId
    }),
    regimes: [{
      bindingRef: `regime-binding://${vectorId}/transform/0`,
      stageRole: "transform",
      regime: "F_P",
      role: "observe",
      order: 0,
      authority: "evidence",
      inputCarrierRefs: [node.id],
      outputCarrierRefs: [node.id],
      evidenceRefs: ["evidence://t270/scenario09-fp"]
    }],
    standardsContextRefs: ["standard://t270/scenario09-fp"],
    policyContextRefs: ["policy://t270/scenario09-fp"],
    carrierContextRefs: [node.id],
    assuranceContextRefs: ["assurance://t270/scenario09-fp"],
    closureContractRef: "closure://t270/scenario09-fp"
  });
  const operator = Object.freeze({
    name: "t270-scenario09-fp-transform",
    regime: "F_P",
    binding: "binding://t270/scenario09-fp/transform",
    tags: Object.freeze(["t270", "scenario09", "fp-transform"])
  });
  const vector = constructGraphVector({
    id: vectorId,
    name: "t270.scenario09.fp-transform.vector",
    source: [node],
    target: node,
    operators: [operator],
    evaluators: [],
    contexts: [],
    rule: null,
    allowsSubwork: false,
    declarations: graphVectorDeclarations([
      hogProgramRefDeclarationEntry(FP_PROGRAM_REF),
      ...composition.entries
    ]),
    tags: ["t270", "scenario09", "fp-transform"]
  });
  const graph = constructGraph({
    id: "graph://t270/scenario09-fp/transform",
    name: "t270.scenario09.fp-transform.graph",
    inputs: [node],
    outputs: [node],
    nodes: [node],
    vectors: [vector],
    contexts: [],
    rules: [projectionRule, protocolRule],
    effects: ["effect://t270/scenario09-direct"],
    tags: ["t270", "scenario09", "fp-transform"]
  });
  const graphFunction = constructGraphFunction({
    id: graphFunctionId,
    name: "graph-function://t270/scenario09-fp/transform",
    environment: constructEnvRef({
      requires: [node],
      provides: [node],
      carries: [node]
    }),
    inputs: [node],
    outputs: [node],
    template: constructTemplateRef({
      kind: "inline_graph",
      ref: "template://t270/scenario09-fp/transform",
      graph,
      version: null
    }),
    effects: ["effect://t270/scenario09-direct"],
    declarations: graphFunctionDeclarations([
      cProgramCatalogDeclarationEntry([program]),
      hogProgramRefDeclarationEntry(FP_PROGRAM_REF),
      pluginSelectionDeclarationEntry({
        fpDispatch: "plugin://abg/fp-dispatch-live"
      })
    ]),
    tags: ["t270", "scenario09", "fp-transform"]
  });
  const rows = canonicalizeRuntimeSchemaAdmissionMetadataRows([{
    graphFunctionId: graphFunction.id,
    nodeRef: node.id,
    symbolicSchemaRef: node.schema.ref,
    contractId: contract.schemaCoordinate.contractId,
    contractVersion: contract.schemaCoordinate.contractVersion
  }]);
  const module = constructModule({
    name: "t270-scenario09-fp-transform-module",
    graphs: [graph],
    graphFunctions: [graphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [constructJob({
      name: "t270-scenario09-fp-transform",
      contracts: [constructContractRef({
        kind: "graph_function",
        targetId: graphFunction.id
      })],
      roles: [],
      tags: ["t270", "scenario09", "fp-transform"],
      policyHooks: { entries: [] }
    })],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [projectionRule, protocolRule],
    imports: [],
    policyHooks: { entries: [] },
    metadata: {
      entries: [{
        key: RUNTIME_SCHEMA_ADMISSION_METADATA_KEY,
        value: { kind: "json_blob", value: taggedRows(rows) }
      }]
    }
  });
  const declaration = constructGtlLibraryEntryDeclaration({
    declarationRef: "declaration://t270/scenario09-fp/transform",
    entryRef: ENTRY_REF,
    libraryScope: "system",
    entryKind: "graph_function",
    namespace: "t270.scenario09.fp",
    ownerRef: "owner://t270/scenario09-fp",
    version: "5.0.0",
    graphFunctionRef: graphFunction.id,
    interfaceRef: "interface://t270/scenario09-fp",
    sourceContractRef: contract.schemaCoordinate.contractId,
    targetContractRef: contract.schemaCoordinate.contractId,
    contextRefs: ["context://t270/scenario09-fp"],
    authorityRefs: ["authority://t270/scenario09-fp"],
    overlayRefs: [],
    provenanceRefs: ["provenance://t270/scenario09-fp"],
    readinessRefs: ["readiness://t270/scenario09-fp"],
    proofRefs: ["proof://t270/scenario09-fp"],
    policyRefs: ["policy://t270/scenario09-fp"],
    declarationSourceRefs: [MODULE_REF]
  });
  const admitted = admitBoundWorkspaceCatalog({
    kind: "bound_catalog_admission_batch",
    workspaceId: WORKSPACE_ID,
    bindingId: BINDING_ID,
    catalogId: CATALOG_ID,
    resolvedLockRef: LOCK_REF,
    systemDeclarations: [
      oneSurfaceRuntimeEntry(ONE_SURFACE_PROGRAM),
      {
        kind: "runtime_library_entry",
        declaration,
        moduleRef: MODULE_REF,
        module
      }
    ],
    orderedProductBatches: [],
    causationEventRefs: ["event://t270/scenario09-fp/catalog-admitted"],
    correlationId: "correlation://t270/scenario09-fp/catalog-admission"
  }, () => {});
  assert.equal(admitted.accepted, true, JSON.stringify(admitted));
  const binding = admitted.basis.executionBindings.find(
    (row) => row.entryRef === ENTRY_REF
  );
  assert.notEqual(binding, undefined);
  const nativeDefinition = {
    source: sourceFamily.request,
    definition: contract,
    relation: bindM04RuntimeSchemaNativeDefinition({
      source: sourceFamily.request,
      symbolicSchemaRef: node.schema.ref,
      definition: contract
    })
  };
  const schemaProjection = projectM04RuntimeSchemaAdmission({
    selectedExecutionBinding: binding,
    nativeDefinitionRelations: [nativeDefinition.relation]
  });
  return Object.freeze({
    basis: admitted.basis,
    binding,
    graphFunction,
    operator,
    schemaProjection,
    inputDefinition: contract,
    sourceNode: node,
    targetNode: node
  });
}

function invocationAuthority(options = {}) {
  const authorityBasisRef = "authority://t270/scenario09/invocation";
  const authorityBasisDigest = digest("invocation-authority");
  const actorRef = "actor://t270/scenario09";
  const capabilityIds = options.capabilityIds ?? [
    "abg.capability.run.invoke"
  ];
  const capabilityGrants = capabilityIds.map((capabilityId) => {
    const grantBasis = Object.freeze({
      capabilityId,
      capabilityDefinitionRef: `capability://abg/${capabilityId}`,
      capabilityDefinitionDigest: digest(`capability:${capabilityId}`),
      actorRef,
      approvalRef: "approval://t270/scenario09",
      policyRef: "policy://t270/scenario09/invocation",
      scopeRef: BINDING_ID,
      scopeDigest: digest("workspace-binding"),
      authorityBasisRef,
      authorityBasisDigest
    });
    const grantDigest = stableSha256Digest(grantBasis);
    return Object.freeze({
      kind: "capability_grant",
      grantRef: `capability-grant:${grantDigest}`,
      grantDigest,
      ...grantBasis
    });
  });
  return Object.freeze({
    authorityBasisRef,
    authorityBasisDigest,
    actor: Object.freeze({
      actorRef,
      attributionRef: "attribution://t270/scenario09",
      attributionDigest: digest("attribution")
    }),
    capabilityGrants: Object.freeze(capabilityGrants),
    invocationPolicy: Object.freeze({
      policyRef: "policy://t270/scenario09/invocation",
      policyDigest: digest("invocation-policy"),
      sessionPolicyRef: "policy://t270/scenario09/session",
      sessionPolicyDigest: digest("session-policy")
    }),
    transportSteering: Object.freeze({
      steeringRef:
        options.steeringRef ?? "steering://t270/scenario09",
      steeringDigest:
        options.steeringDigest ?? digest("steering"),
      provenanceRefs: Object.freeze(
        options.steeringProvenanceRefs ?? ["provenance://t270/scenario09"]
      )
    }),
    compatibilityState: "pending_af15_rejoin",
    compatibilityGapRef: T270_RUNTIME_COMPATIBILITY_GAP
  });
}

function runtimeProfile(options = {}) {
  const runtimeIdentity = Object.freeze({
    workerId: "worker://t270/scenario09",
    backendId: "backend://t270/scenario09",
    buildId: "build://t270/scenario09",
    resolvedRuntimeRef: "runtime://t270/scenario09"
  });
  const resolvedPolicy = Object.freeze({
    resolvedPolicyBundleRef: "policy-bundle://t270/scenario09",
    defaultRegime: options.defaultRegime ?? "F_D",
    dispatchRef: null,
    approvalSubjectRef: null
  });
  const standardPluginRefs = Object.freeze(
    options.standardPluginRefs ?? []
  );
  return Object.freeze({
    profileDigest: stableSha256Digest({
      kind: "abg_runtime_system_profile",
      runtimeIdentity,
      resolvedPolicy,
      standardPluginRefs
    }),
    runtimeIdentity,
    resolvedPolicy,
    standardPluginRefs
  });
}

function ingress(value, schemaFamily, options = {}) {
  const sourceCapabilities = schemaFamily.engineInput.capabilities.filter(
    (capability) => capability.basis.nodeRef === value.sourceNode.id
  );
  assert.equal(sourceCapabilities.length, 1);
  const rootValue = sourceCapabilities[0].admit(Object.freeze(
    options.inputCandidate ?? {
      targetRoot: "/tmp/abg-t270-scenario09",
      createPolicy: "clean",
      scaffoldPolicy: "no_scaffold"
    }
  ));
  const rootCarrier = constructAdmittedInvocationCarrier({
    sourceNodeRef: value.sourceNode.id,
    schemaRef: value.sourceNode.schema.ref,
    carrierRef: "payload://t270/scenario09/root",
    admissionRef: "admission://t270/scenario09/root",
    value: rootValue
  });
  const rootCarriers = constructAdmittedInvocationCarrierSet([rootCarrier]);
  const publicSchema = value.inputDefinition.projectedSchema;
  const coordinate = value.inputDefinition.schemaCoordinate;
  const installedSchema = Object.freeze({
    kind: "installed_public_schema_authority",
    owningProductId: "fixture.t270.scenario09",
    owningProductVersion: "5.0.0",
    publicContractCatalogId: "abg.public-contracts.t270.scenario09",
    contractId: coordinate.contractId,
    contractDigest: coordinate.contractDigest,
    publicSchemaId: coordinate.schemaId,
    publicSchemaVersion: coordinate.schemaVersion,
    assetRelativePath:
      "contracts/schemas/operations/workspace.create/clean/request.schema.json",
    assetDigest: coordinate.schemaDigest,
    schema: publicSchema
  });
  const schemas = Object.freeze([installedSchema]);
  const selected = options.selection ?? null;
  const nextActionRef =
    selected?.nextAction.projectionRef ?? "next-action://t270/scenario09";
  const nextActionDigest =
    selected?.nextAction.projectionDigest ?? digest("next-action");
  const intentAdmissionRef =
    selected?.intentAdmission.admissionRef ??
      "intent-admission://t270/scenario09";
  const intentAdmissionDigest =
    selected?.intentAdmission.admissionDigest ?? digest("intent-admission");
  const bindingDigest = stableSha256Digest(value.binding);
  return admitRunInvokeExecutionIngress({
    authorityClass: "subordinate_rejoin_only",
    variant: "invoke",
    definitionDigest: digest("run-invoke-definition"),
    invocation: Object.freeze({
      ref: "invocation://t270/scenario09",
      digest: digest("invocation"),
      authorityRef: "authority://t270/scenario09/invocation",
      authorityDigest: digest("invocation-authority"),
      witnessDigest: digest("invocation-witness")
    }),
    workspace: Object.freeze({
      bindingRef: BINDING_ID,
      bindingDigest: digest("workspace-binding"),
      workspaceId: WORKSPACE_ID,
      workspaceRoot: "/tmp/abg-t270-scenario09"
    }),
    catalog: Object.freeze({
      basisRef: value.basis.basisRef,
      catalogId: CATALOG_ID,
      resolvedLockRef: LOCK_REF,
      viewRef: "catalog-view://t270/scenario09",
      viewDigest: digest("catalog-view"),
      allowedEntryRefs: Object.freeze([ENTRY_REF])
    }),
    program: selected?.intentAdmission.program ?? Object.freeze({
      ref: "program://t270/scenario09/one-surface",
      digest: digest("one-surface-program")
    }),
    constraint: Object.freeze({
      kind: "exact_graph_function_constraint",
      inputContract: Object.freeze({
        owningProductId: installedSchema.owningProductId,
        owningProductVersion: installedSchema.owningProductVersion,
        productManifestDigest: digest("product-manifest"),
        publicContractCatalogId: installedSchema.publicContractCatalogId,
        publicContractCatalogVersion: "5.0.0",
        publicContractCatalogDigest: digest("public-contract-catalog"),
        contractId: installedSchema.contractId,
        contractVersion: "5.0.0",
        contractDigest: installedSchema.contractDigest,
        sourceInterface: Object.freeze([Object.freeze({
          nodeRef: value.sourceNode.id,
          schemaRef: value.sourceNode.schema.ref
        })]),
        asset: Object.freeze({
          relativePath: installedSchema.assetRelativePath,
          mediaType: "application/schema+json",
          schemaId: installedSchema.publicSchemaId,
          schemaVersion: installedSchema.publicSchemaVersion,
          digest: installedSchema.assetDigest
        })
      }),
      inputPayloadRef: rootCarrier.carrierRef,
      inputPayloadDigest: rootCarrier.carrierDigest
    }),
    selectedExecution: Object.freeze({
      selectedEntryRef: value.binding.entryRef,
      graphFunctionRef: value.binding.graphFunctionId,
      graphFunctionDigest: value.binding.graphFunctionDigest,
      selectedExecutionBindingDigest: bindingDigest,
      nextActionRef,
      nextActionDigest,
      intentAdmissionRef,
      intentAdmissionDigest
    }),
    admittedInputCarriers: rootCarriers,
    installedPublicInputSchemas: Object.freeze({
      kind: "installed_public_schema_authority_set",
      schemas,
      schemaSetDigest: stableSha256Digest(schemas)
    }),
    invocationAuthority: invocationAuthority(options),
    runtimeProfile: runtimeProfile(options),
    schemaAdmissionCapabilityBases: schemaFamily.bases,
    sourceWitnessRefs: Object.freeze(["witness://t270/scenario09"])
  });
}

async function selectExecutionAuthority(value, suffix) {
  const installed = await projectInstalledAbgSystemOneSurfaceAuthority({
    catalogBasis: value.basis
  });
  const events = [];
  const invocation = invocationAuthority();
  const selected = await executeInstalledAbgSystemOneSurfaceSelection({
    authority: installed,
    catalogBasis: value.basis,
    selection: Object.freeze({
      episodeId: `episode://t270/scenario09/${suffix}`,
      intentLineageRef: `lineage://t270/scenario09/${suffix}`,
      admittedProductTruthRefs: Object.freeze([
        `product-truth://t270/scenario09/${suffix}`
      ]),
      workspaceBinding: Object.freeze({
        ref: BINDING_ID,
        digest: digest("workspace-binding")
      }),
      invocationAuthority: Object.freeze({
        ref: invocation.authorityBasisRef,
        digest: invocation.authorityBasisDigest
      }),
      programMembers: constructOneSurfaceProgramMemberProjection({
        admittedProgramRef: installed.authorityProgram.admittedProgramRef,
        admittedProgramDigest:
          installed.authorityProgram.admittedProgramDigest,
        graphFunctions: Object.freeze([Object.freeze({
          graphFunctionRef: value.binding.graphFunctionId,
          graphFunctionDigest: value.binding.graphFunctionDigest
        })])
      }),
      replayCursorRef: `replay://t270/scenario09/${suffix}/0`,
      runtimeProjectionRef:
        value.basis.runtimeCatalogProjectionRef,
      allowedEntryRefs: Object.freeze([value.binding.entryRef]),
      priorityScheme: constructConstructionPriorityScheme({
        schemeRef: `priority-scheme://t270/scenario09/${suffix}`,
        sourcePolicyRef: `policy://t270/scenario09/${suffix}`,
        rules: []
      }),
      targetObligationRefs: Object.freeze([
        `obligation://t270/scenario09/${suffix}`
      ]),
      targetEvidenceAuthorityRefs: Object.freeze([
        `proof://t270/scenario09/${suffix}`
      ]),
      gapEvidenceRefs: Object.freeze([
        `evidence://t270/scenario09/${suffix}/gap`
      ]),
      gapAuthorityRefs: Object.freeze([
        `authority://t270/scenario09/${suffix}/gap`
      ]),
      causationRef: `event://t270/scenario09/${suffix}/request`,
      correlationId: `correlation://t270/scenario09/${suffix}`,
      inputPayloadRef: `payload://t270/scenario09/${suffix}/request`,
      inputLineageRef: `lineage://t270/scenario09/${suffix}/request`,
      runtimeScope: Object.freeze({
        basisId: `basis://t270/scenario09/${suffix}`,
        graphCallId: `graph-call://t270/scenario09/${suffix}`,
        frameId: `frame://t270/scenario09/${suffix}`
      })
    }),
    emitterContext: createOneSurfaceRuntimeEmitter([]),
    eventSink: (event) => events.push(event)
  });
  assert.deepEqual(events, selected.runtimeEvents);
  return selected;
}

function selectedExecutionAuthority(selection) {
  return Object.freeze({
    intentAdmission: selection.intentAdmission,
    targetBinding: selection.targetBinding,
    selectedIntentEvent: selection.selectedIntentEvent
  });
}

function selectionPriorEvents(selection, extra = []) {
  return Object.freeze([...selection.runtimeEvents, ...extra]);
}

function implementation(value, effects, options = {}) {
  const canonical = buildAbgSystemSunnyFdImplementation();
  return Object.freeze({
    ...canonical,
    handler: constructCCallValueHandler({
      driverRequirement: "sync_compatible",
      execute: (input) => {
        effects.push("fd-effect");
        if (options.malformed === true) {
          return Object.freeze({
            kind: "c_call_value_handler_interior",
            outcomeStatus: "executed",
            evidenceRefs: Object.freeze([
              `handler-executed:${canonical.handlerRef}`
            ]),
            payloadRef: null,
            responseContractRef: null,
            failureReason: null,
            targetValueCandidate: Object.freeze({
              workspaceRef: "workspace://t270/malformed"
            })
          });
        }
        return canonical.handler(input);
      }
    })
  });
}

const ONE_SURFACE_PROGRAM = await buildAbgSystemOneSurfaceProgram();
const CATALOG = await catalogFixture();
const SCHEMAS = CATALOG.schemaProjection;
const FD_SELECTION = await selectExecutionAuthority(CATALOG, "fd");
const INGRESS = ingress(CATALOG, SCHEMAS, { selection: FD_SELECTION });
const MANIFEST = admittedTenantManifestFixture({
  fixtureId: "t270-scenario09-direct",
  capabilityContractId: "abg.contract.t270-scenario09-direct",
  capabilityId: "capability://t270/scenario09-direct",
  effectRef: "effect://t270/scenario09-direct"
});
const FP_CATALOG = await fpCatalogFixture();
const FP_SCHEMAS = FP_CATALOG.schemaProjection;
const FP_SELECTION = await selectExecutionAuthority(FP_CATALOG, "fp");
const FP_TARGET_CONTRACT_REF = resolveTargetCarrierContractBinding({
  vector: FP_CATALOG.graphFunction.template.graph.vectors[0],
  defaults: loadGtlTargetCarrierDefaultsBundle()
}).contractRef;
const FP_GRAPH_EDGE =
  FP_CATALOG.graphFunction.template.graph.vectors[0].name;
const FP_INPUT = Object.freeze({
  workspaceBindingRef: FP_TARGET_CONTRACT_REF,
  workspaceBindingDigest: digest("fp-workspace-binding"),
  descriptorRefs: Object.freeze([FP_CAPABILITY_ID]),
  contributionManifestRefs: Object.freeze([
    "manifest://t270/scenario09-fp"
  ]),
  resolvedLockRef: FP_PROTOCOL_REF,
  resolvedLockDigest: digest("fp-resolved-lock")
});
const FP_FULFILLMENT_ASSESSMENT = Object.freeze({
  id: "proof://t270/scenario09-fp",
  evaluator: "evaluator://t270/scenario09-fp/worker-contract",
  fulfillment_status: "fulfilled",
  fulfillment_detail: "Scenario-09 F_P worker returned the declared target value",
  blocking_reasons: Object.freeze([]),
  evidence_refs: Object.freeze([
    "evidence://t270/scenario09-fp/worker"
  ])
});
const FP_INGRESS = ingress(FP_CATALOG, FP_SCHEMAS, {
  selection: FP_SELECTION,
  inputCandidate: FP_INPUT,
  defaultRegime: "F_P",
  standardPluginRefs: [
    "plugin://abg/fp-dispatch-live",
    "plugin://abg/fp-evaluator-live"
  ],
  capabilityIds: [
    "abg.capability.catalog.invoke-graph-function@5",
    "abg.capability.runtime.execute-seven-term-c@5"
  ],
  steeringRef: LIVE_STEERING_REF,
  steeringDigest: LIVE_STEERING_DIGEST,
  steeringProvenanceRefs: [
    LIVE_STEERING_REF,
    LIVE_STEERING_DIGEST
  ]
});

async function processLiveCapabilityJoin(workerScript) {
  const root = await mkdtemp(join(tmpdir(), "abg-t270-fp-"));
  const capability = Object.freeze({
    agentContract: Object.freeze({
      agentKey: "generic",
      command: process.execPath,
      argsTemplate: Object.freeze(["-e", workerScript]),
      sanitizedEnvironmentPolicy: Object.freeze({
        prefixes: Object.freeze([])
      })
    }),
    archiveRoot: join(root, "archive"),
    cwd: root,
    timeoutMs: 10_000,
    executorProfile: "local-spawn"
  });
  return Object.freeze({
    root,
    join: Object.freeze({
      kind: "t270_live_capability_join",
      steeringRef: LIVE_STEERING_REF,
      steeringDigest: LIVE_STEERING_DIGEST,
      availableLivePluginRefs: Object.freeze([
        "plugin://abg/fp-dispatch-live",
        "plugin://abg/fp-evaluator-live"
      ]),
      pluginCapabilities: Object.freeze({
        liveFpDispatch: capability,
        liveFpEvaluator: capability
      })
    })
  });
}

function fpWorkerScript(output) {
  return `process.stdout.write(${JSON.stringify(JSON.stringify(output))})`;
}

function compileDirectExecution({
  ingress,
  catalog,
  binding,
  manifest = MANIFEST,
  liveCapabilityJoin
}) {
  return compileSelectedCatalogDirectProgram({
    invocationAuthority: ingress.invocationAuthority,
    runtimeProfile: ingress.runtimeProfile,
    catalogBasis: catalog,
    selectedExecutionBinding: binding,
    admittedTenantConformanceManifest: manifest,
    ...(liveCapabilityJoin === undefined ? {} : { liveCapabilityJoin })
  });
}

test("T-270 admits ExecutionBasis before one real Scenario-09 F_D effect", async () => {
  const compiledExecution = compileDirectExecution({
    ingress: INGRESS,
    catalog: CATALOG.basis,
    binding: CATALOG.binding
  });
  const mismatchEvents = [];
  const mismatchAdmission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION),
    (event) => mismatchEvents.push(event)
  );
  await assert.rejects(
    () => executeSelectedCatalogDirectProgram({
      ingress: INGRESS,
      ...selectedExecutionAuthority(FD_SELECTION),
      publicOperationAdmission: mismatchAdmission.receipt,
      catalogBasis: CATALOG.basis,
      selectedExecutionBinding: CATALOG.binding,
      schemaAdmissionEngineInput: SCHEMAS.engineInput,
      compiledExecution: Object.freeze({
        ...compiledExecution,
        selectedExecutionBindingDigest: digest(
          "t270-forged-pre-af13-compiler-binding"
        )
      }),
      implementations: Object.freeze([implementation(CATALOG, [])]),
      priorEvents: mismatchAdmission.replay,
      eventSink: (event) => mismatchEvents.push(event)
    }),
    /requires the exact pre-AF-13 compiler result/u
  );
  assert.deepEqual(
    mismatchEvents.map((event) => event.kind),
    ["public_operation_admitted"]
  );
  const blockedEvents = [];
  const blockedAdmission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION),
    (event) => blockedEvents.push(event)
  );
  await assert.rejects(
    () => executeSelectedCatalogDirectProgram({
      ingress: INGRESS,
      ...selectedExecutionAuthority(FD_SELECTION),
      publicOperationAdmission: blockedAdmission.receipt,
      catalogBasis: CATALOG.basis,
      selectedExecutionBinding: CATALOG.binding,
      schemaAdmissionEngineInput: SCHEMAS.engineInput,
      compiledExecution,
      implementations: Object.freeze([]),
      priorEvents: blockedAdmission.replay,
      eventSink: (event) => blockedEvents.push(event)
    }),
    /handler registry is incomplete/u
  );
  assert.deepEqual(
    blockedEvents.map((event) => event.kind),
    ["public_operation_admitted"]
  );

  const wrongRefEffects = [];
  const wrongRefAdmission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION),
    () => {}
  );
  await assert.rejects(
    () => executeSelectedCatalogDirectProgram({
      ingress: INGRESS,
      ...selectedExecutionAuthority(FD_SELECTION),
      publicOperationAdmission: wrongRefAdmission.receipt,
      catalogBasis: CATALOG.basis,
      selectedExecutionBinding: CATALOG.binding,
      schemaAdmissionEngineInput: SCHEMAS.engineInput,
      compiledExecution,
      implementations: Object.freeze([Object.freeze({
        ...implementation(CATALOG, wrongRefEffects),
        handlerRef: "handler://t270/not-declared"
      })]),
      priorEvents: wrongRefAdmission.replay,
      eventSink: () => {}
    }),
    /handler registry is incomplete/u
  );
  assert.deepEqual(wrongRefEffects, []);

  const sinklessEffects = [];
  const sinklessAdmission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION),
    () => {}
  );
  await assert.rejects(
    () => executeSelectedCatalogDirectProgram({
      ingress: INGRESS,
      ...selectedExecutionAuthority(FD_SELECTION),
      publicOperationAdmission: sinklessAdmission.receipt,
      catalogBasis: CATALOG.basis,
      selectedExecutionBinding: CATALOG.binding,
      schemaAdmissionEngineInput: SCHEMAS.engineInput,
      compiledExecution,
      implementations: Object.freeze([
        implementation(CATALOG, sinklessEffects)
      ]),
      priorEvents: sinklessAdmission.replay,
      eventSink: undefined
    }),
    /requires one canonical runtime event sink/u
  );
  assert.deepEqual(sinklessEffects, []);

  const malformedOrder = [];
  const malformedAdmission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION),
    (event) => malformedOrder.push(event.kind)
  );
  const malformed = await executeSelectedCatalogDirectProgram({
    ingress: INGRESS,
    ...selectedExecutionAuthority(FD_SELECTION),
    publicOperationAdmission: malformedAdmission.receipt,
    catalogBasis: CATALOG.basis,
    selectedExecutionBinding: CATALOG.binding,
    schemaAdmissionEngineInput: SCHEMAS.engineInput,
    compiledExecution,
    implementations: Object.freeze([
      implementation(CATALOG, malformedOrder, { malformed: true })
    ]),
    priorEvents: malformedAdmission.replay,
    eventSink: (event) => malformedOrder.push(event.kind)
  });
  assert.equal(malformed.outcome.status, "runtime_failed");
  assert.deepEqual(malformedOrder.slice(0, 6), [
    "public_operation_admitted",
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fd-effect"
  ]);
  assert.equal(
    malformed.runtimeEvents.some((event) => event.kind === "vector_closed"),
    false
  );
  const admittedFailure = malformed.runtimeEvents.find(
    (event) => event.kind === "c_call_result_admitted"
  );
  assert.notEqual(admittedFailure, undefined);
  assert.equal(admittedFailure.outcomeStatus, "contract_failure");
  assert.equal(admittedFailure.payloadRef, null);
  assert.equal(admittedFailure.responseContractRef, null);
  assert.equal(
    malformed.runtimeEvents.some(
      (event) =>
        event.kind === "c_call_judged" && event.judgment === "blocked"
    ),
    true
  );
  assert.equal(
    malformed.runtimeEvents.some(
      (event) => event.kind === "vector_evaluated" && event.status === "blocked"
    ),
    true
  );
  assert.equal(malformed.values.entries.length, 1);

  const order = [];
  const canonicalEvents = [];
  const priorEvent = Object.freeze({
    ...malformed.runtimeEvents[0],
    eventId: "event://t270/prior-process-admission",
    eventAdmissionOrdinal: 10_000
  });
  const admission = publicAdmissionFor(
    INGRESS,
    selectionPriorEvents(FD_SELECTION, [priorEvent]),
    (event) => {
      canonicalEvents.push(event);
      order.push(event.kind);
    }
  );
  const result = await executeSelectedCatalogDirectProgram({
    ingress: INGRESS,
    ...selectedExecutionAuthority(FD_SELECTION),
    publicOperationAdmission: admission.receipt,
    catalogBasis: CATALOG.basis,
    selectedExecutionBinding: CATALOG.binding,
    schemaAdmissionEngineInput: SCHEMAS.engineInput,
    compiledExecution,
    implementations: Object.freeze([implementation(CATALOG, order)]),
    priorEvents: admission.replay,
    eventSink: (event) => {
      canonicalEvents.push(event);
      order.push(event.kind);
    }
  });
  assert.deepEqual(order.slice(0, 6), [
    "public_operation_admitted",
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "fd-effect"
  ]);
  assert.equal(result.witness.effectsPermitted, false);
  assert.equal(result.basisAdmittedEvent.basisId, result.executionBasis.id);
  assert.equal(result.runtimeProjection.effectsPermitted, false);
  assert.equal(result.runtimeProjection.vectors[0].loci[0].operator.binding,
    CATALOG.operator.binding);
  assert.deepEqual(
    result.executionBasis.compiledExecutionDeclarations.handlerBindingRows,
    [Object.freeze({
      programRef: ABG_SYSTEM_SUNNY_PROGRAM_REF,
      stageRole: ABG_SYSTEM_SUNNY_STAGE_ROLE,
      armId: ABG_SYSTEM_SUNNY_ARM_ID,
      regime: "F_D",
      handlerRef: ABG_SYSTEM_SUNNY_HANDLER_REF,
      handlerClass: "capability",
      handlerConfigRef: null
    })]
  );
  assert.equal(result.outcome.status, "completed");
  const eventKinds = result.runtimeEvents.map((event) => event.kind);
  assert.deepEqual(eventKinds, [
    "basis_admitted",
    "graph_call_opened",
    "frame_opened",
    "vector_traversal_planned",
    "c_call_opened",
    "c_call_fibre_selected",
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "vector_evaluated",
    "vector_closed"
  ]);
  assert.deepEqual(result.runtimeEvents, canonicalEvents.slice(1));
  assert.equal(admission.receipt.event.eventAdmissionOrdinal, 10_001);
  assert.equal(result.runtimeEvents[0].eventAdmissionOrdinal, 10_002);
  assert.equal(
    result.runtimeEvents.every((event) =>
      typeof event.eventId === "string" &&
      Number.isSafeInteger(event.eventAdmissionOrdinal)
    ),
    true
  );
  assert.equal(
    result.executionBasis.startAdmissionWitnessDigest,
    result.witness.joinDigest
  );
  assert.equal(
    result.basisAdmittedEvent.startAdmissionWitnessDigest,
    result.witness.joinDigest
  );
  assert.equal(result.executionBasis.id.includes(result.witness.joinDigest), true);
  assert.equal(result.values.entries.at(-1).carrier.schemaRef,
    CATALOG.targetNode.schema.ref);
  assert.equal(
    stableSha256Digest(result.values.entries.at(-1).carrier.value),
    stableSha256Digest(Object.freeze({
      targetRoot: "/tmp/abg-t270-scenario09",
      createPolicy: "clean",
      scaffoldPolicy: "no_scaffold"
    }))
  );

  const forgedWitness = JSON.parse(JSON.stringify(result.witness));
  assert.throws(
    () => admitT270ExecutionBasis({
      ingress: INGRESS,
      executionBinding: CATALOG.binding,
      runtimeProjection: result.runtimeProjection,
      startAdmissionWitness: forgedWitness
    }),
    /requires the exact derived T-270 start witness/u
  );
  assert.throws(
    () => admitT270ExecutionBasis({
      ingress: INGRESS,
      executionBinding: CATALOG.binding,
      runtimeProjection: result.runtimeProjection,
      startAdmissionWitness: undefined
    }),
    /requires the exact derived T-270 start witness/u
  );
  const mismatchedProjection = Object.freeze({
    ...result.runtimeProjection,
    projectionDigest: digest("mismatched-runtime-projection")
  });
  const mismatchedWitness = deriveT270StartAdmissionWitness({
    ingress: INGRESS,
    executionBinding: CATALOG.binding,
    runtimeProjection: mismatchedProjection
  });
  assert.throws(
    () => admitT270ExecutionBasis({
      ingress: INGRESS,
      executionBinding: CATALOG.binding,
      runtimeProjection: result.runtimeProjection,
      startAdmissionWitness: mismatchedWitness
    }),
    /differs from current AF-15 authority/u
  );
  assert.equal(order.filter((value) => value === "fd-effect").length, 1);

  const cCallOpened = result.runtimeEvents.find(
    (event) => event.kind === "c_call_opened"
  );
  const authoritySnapshot = result.runtimeEvents.find(
    (event) => event.kind === "authority_snapshot_admitted"
  );
  const observed = result.runtimeEvents.find(
    (event) => event.kind === "payload_observed"
  );
  const validated = result.runtimeEvents.find(
    (event) => event.kind === "payload_validated"
  );
  const evidence = result.runtimeEvents.find(
    (event) => event.kind === "evidence_admitted"
  );
  const evidencedClose = result.runtimeEvents.find(
    (event) => event.kind === "c_call_evidenced"
  );
  const admittedClose = result.runtimeEvents.find(
    (event) => event.kind === "c_call_result_admitted"
  );
  assert.notEqual(cCallOpened, undefined);
  assert.notEqual(authoritySnapshot, undefined);
  assert.notEqual(observed, undefined);
  assert.notEqual(validated, undefined);
  assert.notEqual(evidence, undefined);
  assert.notEqual(evidencedClose, undefined);
  assert.notEqual(admittedClose, undefined);
  const inputCarrier = INGRESS.admittedInputCarriers.carriers[0];
  const targetCapability = SCHEMAS.engineInput.capabilities.find(
    (capability) => capability.basis.nodeRef === CATALOG.targetNode.id
  );
  assert.notEqual(inputCarrier, undefined);
  assert.notEqual(targetCapability, undefined);
  const expectedInputDigest = stableSha256Digest({
    cCallRef: cCallOpened.cCallRef,
    carrierRef: inputCarrier.carrierRef,
    carrierDigest: inputCarrier.carrierDigest,
    admissionRef: inputCarrier.admissionRef
  });
  const expectedAuthorityDigest = stableSha256Digest({
    executionBindingDigest: stableSha256Digest(CATALOG.binding),
    schemaCapabilityBasisDigest: targetCapability.basis.basisDigest,
    inputDigest: expectedInputDigest,
    cCallRef: cCallOpened.cCallRef,
    evidenceAuthorityRef: "proof://t270/abg-system-fd-sunny"
  });
  assert.equal(authoritySnapshot.authorityDigest, expectedAuthorityDigest);
  assert.deepEqual(authoritySnapshot.inputRefs, [
    inputCarrier.carrierRef,
    inputCarrier.admissionRef
  ]);
  assert.equal(observed.sourceEventRef, cCallOpened.cCallRef);
  assert.equal(observed.authorityRef, authoritySnapshot.authoritySnapshotRef);
  assert.ok(
    authoritySnapshot.authorityRefs.includes(
      "proof://t270/abg-system-fd-sunny"
    )
  );
  assert.equal(observed.inputDigest, expectedInputDigest);
  assert.equal(validated.payloadRef, observed.payloadRef);
  assert.equal(validated.digest, observed.digest);
  assert.equal(evidence.payloadRef, observed.payloadRef);
  assert.equal(evidence.authorityDigest, expectedAuthorityDigest);
  assert.deepEqual(evidencedClose.evidenceRefs, [
    authoritySnapshot.authoritySnapshotRef,
    validated.validationRef,
    evidence.evidenceRef
  ]);
  assert.equal(admittedClose.responseContractRef, observed.contractRef);

  const runtimeAggregate = deriveRuntimeAggregateProjection(
    result.executionBasis,
    result.runtimeEvents
  );
  const ledger = derivePayloadLedgerProjection({
    basis: result.executionBasis,
    runtimeProjection: runtimeAggregate,
    events: result.runtimeEvents,
    vectorIndex: 0,
    targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle()
  });
  assert.equal(observed.edge, cCallOpened.edge);
  assert.equal(observed.edge, ledger.scope.edge);
  assert.notEqual(cCallOpened.programLocusRef, cCallOpened.edge);
  const admittedOutput = deriveAdmittedOutputAuthorityProjection({
    ledger,
    payloadRef: observed.payloadRef
  });
  assert.equal(
    admittedOutput.status,
    "admitted",
    JSON.stringify({ admittedOutput, ledger })
  );
  assert.equal(admittedOutput.payloadRef, observed.payloadRef);
  assert.equal(admittedOutput.payloadDigest, observed.digest);
  assert.deepEqual(admittedOutput.validationRefs, [validated.validationRef]);
  assert.deepEqual(admittedOutput.evidenceRefs, [
    evidence.evidenceRef,
    validated.validationRef
  ].sort());

  const evidenceKinds = new Set([
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted"
  ]);
  const projectMutatedEvidence = (patch) => {
    const events = result.runtimeEvents.map((event) =>
      evidenceKinds.has(event.kind)
        ? Object.freeze({ ...event, ...patch })
        : event
    );
    const mutatedLedger = derivePayloadLedgerProjection({
      basis: result.executionBasis,
      runtimeProjection: runtimeAggregate,
      events,
      vectorIndex: 0,
      targetCarrierDefaults: loadGtlTargetCarrierDefaultsBundle()
    });
    return Object.freeze({
      ledger: mutatedLedger,
      output: deriveAdmittedOutputAuthorityProjection({
        ledger: mutatedLedger,
        payloadRef: observed.payloadRef
      })
    });
  };
  for (const patch of [
    Object.freeze({ basisId: "basis://t270/wrong" }),
    Object.freeze({ frameId: "frame://t270/wrong" }),
    Object.freeze({ vectorIndex: 1 }),
    Object.freeze({ edge: "$.unopened-program-locus" })
  ]) {
    const negative = projectMutatedEvidence(patch);
    assert.equal(negative.ledger.observedPayloads.length, 0);
    assert.equal(negative.ledger.validatedPayloads.length, 0);
    assert.equal(negative.ledger.authoritySnapshots.length, 0);
    assert.equal(negative.ledger.evidenceRows.length, 0);
    assert.equal(negative.output.status, "missing");
  }

  const graphCallOpened = result.runtimeEvents.find(
    (event) => event.kind === "graph_call_opened"
  );
  const frameOpened = result.runtimeEvents.find(
    (event) => event.kind === "frame_opened"
  );
  assert.notEqual(graphCallOpened, undefined);
  assert.notEqual(frameOpened, undefined);
  const eventCalculus = deriveRuntimeEventCalculusProjection({
    basis: result.executionBasis,
    events: result.runtimeEvents
  });
  assert.deepEqual(
    deriveRuntimeEventCalculusProjection({
      basis: result.executionBasis,
      events: result.runtimeEvents
    }),
    eventCalculus
  );
  assert.deepEqual(
    deriveRuntimeAggregateProjection(
      result.executionBasis,
      result.runtimeEvents
    ),
    runtimeAggregate
  );
  assert.equal(holdsAt(eventCalculus, constructRuntimeFluent({
    name: "basis_admitted",
    scope: "basis",
    basisId: result.executionBasis.id,
    graphFunctionId: result.executionBasis.graphFunction.id,
    runId: result.executionBasis.runId,
    workKey: result.executionBasis.workKey,
    ref: result.executionBasis.runtimeIdentity.resolvedRuntimeRef
  })), true);
  assert.equal(holdsAt(eventCalculus, constructRuntimeFluent({
    name: "graph_call_open",
    scope: "graph_call",
    basisId: result.executionBasis.id,
    graphFunctionId: result.executionBasis.graphFunction.id,
    graphCallId: graphCallOpened.graphCallId,
    runId: result.executionBasis.runId,
    workKey: result.executionBasis.workKey
  })), true);
  assert.equal(holdsAt(eventCalculus, constructRuntimeFluent({
    name: "frame_open",
    scope: "frame",
    basisId: result.executionBasis.id,
    graphFunctionId: result.executionBasis.graphFunction.id,
    graphCallId: graphCallOpened.graphCallId,
    frameId: frameOpened.frameId,
    runId: result.executionBasis.runId,
    workKey: result.executionBasis.workKey
  })), true);
  assert.equal(holdsAt(eventCalculus, constructVectorRuntimeFluent({
    basis: result.executionBasis,
    name: "vector_traversal_planned",
    vectorIndex: 0,
    graphCallId: graphCallOpened.graphCallId,
    frameId: frameOpened.frameId
  })), true);
  assert.equal(holdsAt(eventCalculus, constructVectorClosedRuntimeFluent({
    basis: result.executionBasis,
    vectorIndex: 0,
    graphCallId: graphCallOpened.graphCallId,
    frameId: frameOpened.frameId
  })), true);
});

test("T-270 executes the compiler-selected F_P transform through the admitted live capability join", async (t) => {
  const worker = await processLiveCapabilityJoin(fpWorkerScript({
    result_contract_ref: FP_TARGET_CONTRACT_REF,
    edge: FP_GRAPH_EDGE,
    actor: "worker://t270/scenario09-fp",
    fulfillment_assessments: [FP_FULFILLMENT_ASSESSMENT],
    target_value: FP_INPUT
  }));
  t.after(() => rm(worker.root, { recursive: true, force: true }));
  const emitted = [];
  assert.deepEqual(FP_INGRESS.runtimeProfile.standardPluginRefs, [
    "plugin://abg/fp-dispatch-live",
    "plugin://abg/fp-evaluator-live"
  ]);
  assert.deepEqual(
    FP_INGRESS.invocationAuthority.capabilityGrants.map(
      (grant) => grant.capabilityId
    ),
    [
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.runtime.execute-seven-term-c@5"
    ]
  );
  assert.deepEqual(FP_INGRESS.invocationAuthority.transportSteering, {
    steeringRef: LIVE_STEERING_REF,
    steeringDigest: LIVE_STEERING_DIGEST,
    provenanceRefs: [
      LIVE_STEERING_REF,
      LIVE_STEERING_DIGEST
    ]
  });
  const compiledExecution = compileDirectExecution({
    ingress: FP_INGRESS,
    catalog: FP_CATALOG.basis,
    binding: FP_CATALOG.binding,
    liveCapabilityJoin: worker.join
  });
  const admission = publicAdmissionFor(
    FP_INGRESS,
    selectionPriorEvents(FP_SELECTION),
    (event) => emitted.push(event)
  );
  const result = await executeSelectedCatalogDirectProgram({
    ingress: FP_INGRESS,
    ...selectedExecutionAuthority(FP_SELECTION),
    publicOperationAdmission: admission.receipt,
    catalogBasis: FP_CATALOG.basis,
    selectedExecutionBinding: FP_CATALOG.binding,
    schemaAdmissionEngineInput: FP_SCHEMAS.engineInput,
    compiledExecution,
    implementations: Object.freeze([]),
    priorEvents: admission.replay,
    eventSink: (event) => emitted.push(event)
  });
  assert.equal(result.outcome.status, "completed", JSON.stringify(result.outcome));
  assert.equal(
    stableJsonEquals(result.values.entries.at(-1).carrier.value, FP_INPUT),
    true
  );
  const kinds = result.runtimeEvents.map((event) => event.kind);
  for (const kind of [
    "c_call_opened",
    "c_call_fibre_selected",
    "instruction_prompt_manifest_projected",
    "fp_dispatch_requested",
    "actor_invocation_started",
    "actor_result_artifact_observed",
    "instruction_response_contract_admitted",
    "actor_invocation_closed",
    "authority_snapshot_admitted",
    "payload_observed",
    "payload_validated",
    "evidence_admitted",
    "c_call_result_admitted",
    "c_call_judged",
    "vector_closed"
  ]) {
    assert.ok(kinds.includes(kind), `missing runtime event ${kind}`);
  }
  assert.equal(kinds.filter((kind) => kind === "c_call_opened").length, 1);
  assert.equal(kinds.filter((kind) => kind === "actor_invocation_started").length, 1);
  assert.equal(kinds.filter((kind) => kind === "actor_invocation_closed").length, 1);
  const actorStarted = result.runtimeEvents.find(
    (event) => event.kind === "actor_invocation_started"
  );
  const artifact = result.runtimeEvents.find(
    (event) => event.kind === "actor_result_artifact_observed"
  );
  assert.notEqual(actorStarted, undefined);
  assert.notEqual(artifact, undefined);
  assert.equal(artifact.artifactRef, actorStarted.resultRef);
  assert.match(artifact.artifactContentDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(
    stableJsonEquals(
      artifact.artifactPayload,
      {
        result_contract_ref: FP_TARGET_CONTRACT_REF,
        edge: FP_GRAPH_EDGE,
        actor: "worker://t270/scenario09-fp",
        fulfillment_assessments: [FP_FULFILLMENT_ASSESSMENT]
      }
    ),
    true,
    "the replay event must carry the exact T-257 admitted artifact candidate"
  );

  const runtimeResult = result.values.entries.at(-1);
  assert.notEqual(runtimeResult, undefined);
  const relationBeforeAssessment = deriveReplayAdmittedRuntimeResultRelation({
    events: result.runtimeEvents,
    runtimeResultRef: runtimeResult.carrier.carrierRef,
    runtimeResultDigest: runtimeResult.carrier.carrierDigest
  });
  const familyAdmission = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(familyAdmission.kind, "exact_family_admitted");
  const family = familyAdmission.family;
  const definition = family["abg.operation.result.assess"].assess;
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request: {
      runtimeResultRef: runtimeResult.carrier.carrierRef,
      runtimeResultDigest: runtimeResult.carrier.carrierDigest,
      assessmentContractRef: relationBeforeAssessment.targetContract.ref,
      assessmentContractDigest: relationBeforeAssessment.targetContract.digest,
      assessment: artifact.artifactPayload,
      evidenceRefs: FP_FULFILLMENT_ASSESSMENT.evidence_refs
    },
    actorRef: "actor://t270/result-assessor",
    priorEvents: result.runtimeEvents
  });
  const assessmentEvents = [];
  const assessmentAdmission = admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents: result.runtimeEvents,
    eventSink: (event) => assessmentEvents.push(event)
  });
  const assessment = bindPrivateResultAssessHandler(family).execute({
    packet,
    priorEvents: result.runtimeEvents,
    admission: assessmentAdmission
  });
  assert.equal(assessment.kind, "owner_handler_result", JSON.stringify(assessment));
  assert.deepEqual(
    assessment.emittedEvents.map((event) => event.kind),
    ["assessed"]
  );
  const relationAfterAssessment = deriveReplayAdmittedRuntimeResultRelation({
    events: Object.freeze([...result.runtimeEvents, ...assessmentEvents]),
    runtimeResultRef: runtimeResult.carrier.carrierRef,
    runtimeResultDigest: runtimeResult.carrier.carrierDigest
  });
  assert.deepEqual(
    relationAfterAssessment,
    relationBeforeAssessment,
    "append-only assessment truth must not change the selected runtime-result relation"
  );
  const assessmentReplay = Object.freeze([
    ...result.runtimeEvents,
    ...assessmentEvents
  ]);
  const admittedAssessment = deriveResultAssessmentRuntimeSubjectRelation({
    events: assessmentReplay,
    assessmentRef: assessment.value.assessmentRef,
    runtimeSubject: {
      basisId: relationBeforeAssessment.subject.basisId,
      graphCallId: relationBeforeAssessment.subject.graphCallId,
      frameId: relationBeforeAssessment.subject.frameId,
      vectorIndex: relationBeforeAssessment.subject.vectorIndex,
      runtimeResult: relationBeforeAssessment.subject.runtimeResult
    }
  });
  assert.deepEqual(admittedAssessment.obligationIds, [
    FP_FULFILLMENT_ASSESSMENT.id
  ]);

  const repeatPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request: packet.invocation.request,
    actorRef: "actor://t270/result-assessor",
    priorEvents: assessmentReplay
  });
  const repeatEvents = [];
  const repeatAdmission = admitPrivatePublicOperationEvent({
    witness: repeatPacket.witness,
    priorEvents: assessmentReplay,
    eventSink: (event) => repeatEvents.push(event)
  });
  const repeatedAssessment = bindPrivateResultAssessHandler(family).execute({
    packet: repeatPacket,
    priorEvents: assessmentReplay,
    admission: repeatAdmission
  });
  assert.equal(
    repeatedAssessment.kind,
    "owner_handler_result",
    JSON.stringify(repeatedAssessment)
  );
  assert.equal(
    repeatedAssessment.value.assessmentRef,
    assessment.value.assessmentRef
  );
  assert.deepEqual(
    repeatedAssessment.emittedEvents,
    [],
    "an exact repeated assessment must reuse replay truth without duplicate assessed events"
  );
  assert.deepEqual(
    repeatEvents.map((event) => event.kind),
    ["public_operation_admitted"]
  );
  const repeatedAssessmentReplay = Object.freeze([
    ...assessmentReplay,
    ...repeatEvents
  ]);
  assert.doesNotThrow(() => deriveResultAssessmentRuntimeSubjectRelation({
    events: repeatedAssessmentReplay,
    assessmentRef: assessment.value.assessmentRef,
    runtimeSubject: admittedAssessment.runtimeSubject
  }));
  const assessedEvent = assessment.emittedEvents[0];
  assert.equal(assessedEvent?.kind, "assessed");
  const assessmentFluent = constructRuntimeFluent({
    name: "result_assessment_admitted",
    scope: "vector",
    basisId: admittedAssessment.runtimeSubject.basisId,
    graphCallId: admittedAssessment.runtimeSubject.graphCallId,
    frameId: admittedAssessment.runtimeSubject.frameId,
    runId: assessedEvent.runId,
    workKey: assessedEvent.workKey,
    vectorIndex: admittedAssessment.runtimeSubject.vectorIndex,
    edge: assessedEvent.edge,
    constraintRef: admittedAssessment.runtimeSubject.runtimeResult.ref,
    ref: assessment.value.assessmentRef
  });
  const assessmentEffectRows = (events) => events.map((event) => Object.freeze({
    kind: "event_calculus_effect_row",
    eventKind: event.kind,
    sourceEvent: event,
    initiates: Object.freeze([]),
    terminates: Object.freeze([]),
    clips: Object.freeze([]),
    declips: Object.freeze([])
  }));
  assert.deepEqual(
    RESULT_ASSESSMENT_DERIVED_FLUENT_RULE.derive({
      holds: Object.freeze([]),
      effectRows: assessmentEffectRows(repeatedAssessmentReplay)
    }),
    [assessmentFluent]
  );

  const targetObserved = result.runtimeEvents.find(
    (event) =>
      event.eventId === relationBeforeAssessment.targetAdmission.observedEventRef
  );
  assert.equal(targetObserved?.kind, "payload_observed");
  const incompleteAssessmentReplay = Object.freeze(
    assessmentReplay.map((event) =>
      event.kind === "authority_snapshot_admitted" &&
      event.authoritySnapshotRef === targetObserved.authorityRef
        ? Object.freeze({
            ...event,
            authorityRefs: Object.freeze([
              ...event.authorityRefs,
              "proof://t270/unassessed-obligation"
            ])
          })
        : event
    )
  );
  assert.throws(
    () => deriveResultAssessmentRuntimeSubjectRelation({
      events: incompleteAssessmentReplay,
      assessmentRef: assessment.value.assessmentRef,
      runtimeSubject: admittedAssessment.runtimeSubject
    }),
    /complete replay-authority obligation set/u
  );
  assert.deepEqual(
    RESULT_ASSESSMENT_DERIVED_FLUENT_RULE.derive({
      holds: Object.freeze([]),
      effectRows: assessmentEffectRows(incompleteAssessmentReplay)
    }),
    []
  );

  const callerAssessmentPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request: {
      runtimeResultRef: runtimeResult.carrier.carrierRef,
      runtimeResultDigest: runtimeResult.carrier.carrierDigest,
      assessmentContractRef: relationBeforeAssessment.targetContract.ref,
      assessmentContractDigest: relationBeforeAssessment.targetContract.digest,
      assessment: { ...artifact.artifactPayload, actor: "caller-authored" },
      evidenceRefs: FP_FULFILLMENT_ASSESSMENT.evidence_refs
    },
    actorRef: "actor://t270/result-assessor",
    priorEvents: result.runtimeEvents
  });
  const callerAssessmentEvents = [];
  const callerAssessmentAdmission = admitPrivatePublicOperationEvent({
    witness: callerAssessmentPacket.witness,
    priorEvents: result.runtimeEvents,
    eventSink: (event) => callerAssessmentEvents.push(event)
  });
  const callerAssessment = bindPrivateResultAssessHandler(family).execute({
    packet: callerAssessmentPacket,
    priorEvents: result.runtimeEvents,
    admission: callerAssessmentAdmission
  });
  assert.equal(callerAssessment.kind, "owner_handler_refusal");
  assert.equal(callerAssessment.value.code, "assessment_invalid");
  assert.match(callerAssessment.value.message, /replay-carried T-257 artifact/u);
  assert.deepEqual(callerAssessment.emittedEvents, []);
  assert.deepEqual(callerAssessmentEvents, [callerAssessmentAdmission.event]);
});

test("T-270 maps malformed F_P output to retry-eligible contract_failure and rejects unbound capability bodies", async (t) => {
  const malformedWorker = await processLiveCapabilityJoin(
    fpWorkerScript({
      result_contract_ref: FP_TARGET_CONTRACT_REF,
      edge: FP_GRAPH_EDGE,
      actor: "worker://t270/scenario09-fp",
      fulfillment_assessments: []
    })
  );
  t.after(() => rm(malformedWorker.root, { recursive: true, force: true }));
  const compiledExecution = compileDirectExecution({
    ingress: FP_INGRESS,
    catalog: FP_CATALOG.basis,
    binding: FP_CATALOG.binding,
    liveCapabilityJoin: malformedWorker.join
  });
  const malformedAdmission = publicAdmissionFor(
    FP_INGRESS,
    selectionPriorEvents(FP_SELECTION),
    () => {}
  );
  const malformed = await executeSelectedCatalogDirectProgram({
    ingress: FP_INGRESS,
    ...selectedExecutionAuthority(FP_SELECTION),
    publicOperationAdmission: malformedAdmission.receipt,
    catalogBasis: FP_CATALOG.basis,
    selectedExecutionBinding: FP_CATALOG.binding,
    schemaAdmissionEngineInput: FP_SCHEMAS.engineInput,
    compiledExecution,
    implementations: [],
    priorEvents: malformedAdmission.replay,
    eventSink: () => {}
  });
  assert.equal(malformed.outcome.status, "runtime_failed");
  const failed = malformed.runtimeEvents.find(
    (event) => event.kind === "c_call_result_admitted"
  );
  assert.notEqual(failed, undefined);
  assert.equal(malformed.outcome.failureClass, "contract_failure");
  assert.equal(failed.outcomeStatus, "contract_failure");
  assert.equal(
    malformed.runtimeEvents.some((event) => event.kind === "vector_closed"),
    false
  );

  for (const patch of [
    { steeringRef: "capability:live:wrong" },
    { steeringDigest: digest("wrong-live-projection") },
    {
      availableLivePluginRefs: [
        "plugin://abg/fp-dispatch-live",
        "plugin://foreign/fp-evaluator"
      ]
    }
  ]) {
    assert.throws(
      () => compileDirectExecution({
        ingress: FP_INGRESS,
        catalog: FP_CATALOG.basis,
        binding: FP_CATALOG.binding,
        liveCapabilityJoin: Object.freeze({ ...malformedWorker.join, ...patch })
      }),
      /live capability body differs/u
    );
  }

  const incompleteSteeringAuthority = Object.freeze({
    ...FP_INGRESS,
    invocationAuthority: Object.freeze({
      ...FP_INGRESS.invocationAuthority,
      transportSteering: Object.freeze({
        ...FP_INGRESS.invocationAuthority.transportSteering,
        provenanceRefs: Object.freeze([LIVE_STEERING_REF])
      })
    })
  });
  assert.throws(
    () => compileDirectExecution({
      ingress: incompleteSteeringAuthority,
      catalog: FP_CATALOG.basis,
      binding: FP_CATALOG.binding,
      liveCapabilityJoin: malformedWorker.join
    }),
    /live capability body differs/u
  );

  assert.throws(
    () => compileDirectExecution({
      ingress: FP_INGRESS,
      catalog: FP_CATALOG.basis,
      binding: FP_CATALOG.binding
    }),
    /unresolvable|did not resolve/u
  );
});
