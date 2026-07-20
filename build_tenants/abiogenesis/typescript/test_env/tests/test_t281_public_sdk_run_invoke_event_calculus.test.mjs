import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import test from "node:test";
import { TextEncoder } from "node:util";

import {
  admitBoundWorkspaceCatalog,
  deriveRegistrySessionView
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  constructRuntimeFluent,
  deriveConstructionEventCalculusProjection,
  deriveRuntimeEventCalculusProjection,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  constructConstructionPriorityScheme
} from "../../build/semantic/code/src/abg/m03/contracts/construction_priority.js";
import {
  constructOneSurfaceProgramMemberProjection
} from "../../build/semantic/code/src/abg/m03/contracts/one_surface_authority.js";
import {
  compileSelectedCatalogDirectProgram,
  executeSelectedCatalogDirectProgram
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_execution.js";
import {
  createOneSurfaceRuntimeEmitter
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_program_runtime.js";
import {
  projectRunStatusForPublicRead,
  projectRunResultForPublicRead
} from "../../build/semantic/code/src/abg/m03/runner/public_runtime_projections.js";
import {
  createRuntimeEventEmitterContext,
  emitWithContext
} from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  admitPrivatePublicOperationEvent
} from "../../build/semantic/code/src/abg/m03/runner/public_operation_admission.js";
import {
  constructToolchainWorkspaceBindingV3
} from "../../build/semantic/code/src/app/m04/toolchain_binding/bind.js";
import {
  defaultToolchainMutableStateRoots
} from "../../build/semantic/code/src/app/m04/toolchain_binding/resolve.js";
import {
  abiogenesisPublicSdk
} from "../../build/semantic/code/src/app/m04/public_sdk/index.js";
import {
  ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
  ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_sunny_graph_function.js";
import {
  executeInstalledAbgSystemOneSurfaceSelection,
  projectInstalledAbgSystemOneSurfaceAuthority
} from "../../build/semantic/code/src/app/m04/public_contracts/abg_system_one_surface_program.js";
import {
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicInvocation,
  definitionKeySchemaFor
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "../../build/semantic/code/src/app/m04/public_contracts/operation_publication.js";
import {
  deriveProjectReadProjectionBasis
} from "../../build/semantic/code/src/app/m04/public_contracts/project_read_operation_contracts.js";
import {
  admitPrivateP1PublicOperationPacket,
  exactInstalledGraphFunctionInputContract,
  finalizePrivateRunInvokeExecutionIngress,
  preparePrivateRunInvokeExecutionFromPacket
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  prepareBoundRuntimeCatalogAdmission,
  reconstructBoundRuntimeExecutionBasis,
  rehydrateBoundRuntimeCatalogBasis
} from "../../build/semantic/code/src/app/m04/public_contracts/private_runtime_catalog_authority.js";
import {
  bindM04RuntimeSchemaNativeDefinition
} from "../../build/semantic/code/src/app/m04/public_contracts/runtime_schema_admission.js";
import {
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/workspace/operation_contracts.js";
import {
  admitTenantConformanceManifest
} from "../../build/semantic/code/src/app/m04/product_intake/tenant_conformance_manifest.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  prepareAbgDetachedCatalogPublication,
  prepareAbgProductPublication
} from "../tools/publish_abg_product_contracts.mjs";
import {
  constructT281PrivateP1Invocation
} from "./support/t281-private-ingress-fixture.mjs";

const encoder = new TextEncoder();
const CONSTRUCTION_EVENT_KINDS = Object.freeze([
  "construction_episode_started",
  "construction_observation_snapshot_materialized",
  "construction_action_catalog_projected",
  "construction_evaluator_invoked",
  "construction_intent_candidate_returned",
  "construction_intent_candidate_admitted",
  "construction_intent_selected",
  "construction_graph_action_invoked",
  "construction_delta_observed",
  "construction_terminal_disposition_projected"
]);

function catalogCoordinate(catalog) {
  return Object.freeze({
    kind: "public_contract_catalog_coordinate",
    catalogId: catalog.catalogId,
    catalogVersion: catalog.catalogVersion,
    catalogDigest: catalog.catalogDigest
  });
}

function productBinding(input) {
  return Object.freeze({
    installedProductId: input.installedProductId,
    publisher: input.descriptor.publisher,
    productId: input.descriptor.productId,
    packageName: input.descriptor.packageName,
    version: input.descriptor.version,
    productContentDigest: input.descriptor.productContentDigest,
    descriptorId: input.descriptor.descriptorId,
    descriptorDigest: input.descriptor.descriptorDigest,
    contributionId: input.contribution.contributionId,
    contributionDigest: input.contribution.contributionDigest,
    artifactDigest: input.descriptor.distributionArtifactDigest,
    installedRoot: input.productRoot,
    productRoot: input.productRoot,
    packageRoot: input.productRoot,
    manifestPath: input.manifestPath,
    manifestDigest: stableSha256Digest(input.manifest),
    compatibilityRange: input.descriptor.abgCompatibility,
    compatibility: Object.freeze({
      productId: input.descriptor.productId,
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze(["command://abiogenesis/abg.cli"]),
    publicContractCatalogId: input.manifest.publicContractCatalog.catalogId,
    publicContractCatalogVersion:
      input.manifest.publicContractCatalog.catalogVersion,
    publicContractCatalogDigest:
      input.manifest.publicContractCatalog.catalogDigest
  });
}

function eventBytes(events) {
  if (events.length === 0) return new Uint8Array();
  return encoder.encode(
    `${events.map((event) => JSON.stringify(event)).join("\n")}\n`
  );
}

function exactProjectReadInvocation(input) {
  return constructT281PrivateP1Invocation({
    definition:
      input.family["abg.operation.project.read"][input.request.caseKey],
    request: input.request,
    contractCatalogCoordinate: catalogCoordinate(input.fixture.catalog),
    workspaceBinding: {
      ref: input.fixture.context.binding.bindingId,
      digest: input.fixture.context.binding.bindingDigest
    },
    productSet: {
      ref: `product-set:${input.fixture.context.binding.productSetDigest}`,
      digest: input.fixture.context.binding.productSetDigest
    },
    dependencyLock: {
      ref: input.fixture.context.binding.resolvedLockId,
      digest: input.fixture.context.binding.resolvedLockDigest
    }
  });
}

async function installedRunInvokeFixture() {
  const publication = await prepareAbgProductPublication();
  const artifactDigest = stableSha256Digest({
    fixture: "t281-public-sdk-run-invoke-event-calculus",
    version: publication.packageManifest.version
  });
  const detached = prepareAbgDetachedCatalogPublication({
    distributionArtifactDigest: artifactDigest,
    publication
  });
  const manifest = publication.publication.manifest;
  const catalog = publication.publication.catalog;
  const workspaceRoot = resolve(
    "/tmp/abg-t281-public-sdk-run-invoke-event-calculus/workspace"
  );
  const toolchainRoot = resolve(
    "/tmp/abg-t281-public-sdk-run-invoke-event-calculus/toolchain"
  );
  const productRoot = join(
    toolchainRoot,
    "products",
    detached.descriptor.productId,
    detached.descriptor.version
  );
  const manifestPath = join(productRoot, "product-toolchain-manifest.json");
  const installedProductId =
    `installed://abiogenesis/${detached.descriptor.version}/t281-event-calculus`;
  const product = productBinding({
    installedProductId,
    descriptor: detached.descriptor,
    contribution: detached.contribution,
    productRoot,
    manifestPath,
    manifest
  });
  const workspaceManifest = Object.freeze({
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: "workspace://t281/public-sdk-run-invoke-event-calculus",
    root: workspaceRoot,
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: null,
    configurationRefs: Object.freeze([]),
    createdAt: "2026-07-19T00:00:00.000Z",
    actorRef: "actor://t281/public-sdk-run-invoke-event-calculus",
    provenanceRefs: Object.freeze([
      "proof://t281/public-sdk-run-invoke-event-calculus"
    ])
  });
  const resolvedLockId =
    "lock://t281/public-sdk-run-invoke-event-calculus";
  const resolvedLockDigest = stableSha256Digest({
    resolvedLockId,
    product: detached.descriptor.descriptorId
  });
  const binding = constructToolchainWorkspaceBindingV3({
    workspaceId: workspaceManifest.workspaceId,
    workspaceManifestDigest: stableSha256Digest(workspaceManifest),
    targetRoot: workspaceRoot,
    toolchainRoot,
    resolvedLockId,
    resolvedLockDigest,
    products: Object.freeze([product]),
    mutableStateRoots: defaultToolchainMutableStateRoots({
      targetRoot: workspaceRoot
    }),
    provenanceRefs: Object.freeze([
      "proof://t281/public-sdk-run-invoke-event-calculus"
    ])
  });
  const recordRoot = join(
    toolchainRoot,
    "records",
    product.publisher,
    product.productId,
    product.version,
    product.artifactDigest.slice("sha256:".length)
  );
  const records = new Map([
    [manifestPath, manifest],
    [join(recordRoot, "contribution-manifest.json"), detached.contribution]
  ]);
  for (const asset of [...publication.schemaAssets, ...publication.outputs]) {
    records.set(
      join(productRoot, asset.relativePath),
      JSON.parse(Buffer.from(asset.bytes).toString("utf8"))
    );
  }
  const events = [];
  const context = Object.freeze({
    kind: "bound_workspace",
    workspaceManifest,
    binding,
    publicContractCatalog: catalog,
    effects: Object.freeze({
      async readRecord(absolutePath) {
        return records.get(absolutePath) ?? null;
      },
      async readInputAsset() {
        return null;
      },
      async readRuntimeEventBytes() {
        return eventBytes(events);
      },
      createRuntimeEventSink() {
        return (event) => events.push(event);
      },
      operatorCapabilityFactories: Object.freeze({})
    })
  });
  return Object.freeze({
    catalog,
    context,
    events,
    manifest,
    tenantConformanceManifest:
      publication.publication.tenantConformanceManifest,
    descriptor: detached.descriptor,
    contribution: detached.contribution
  });
}

async function exactFamily() {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted", JSON.stringify(admitted));
  return admitted.family;
}

function exactRunInvokeInvocation(input) {
  const definition = input.definition;
  const publishedDefinition =
    projectPublishedPublicOperationDefinitionFromPrivate(definition);
  const definitionKeySchema = definitionKeySchemaFor(definition.definitionKey);
  const actorRef = "actor://t281/public-sdk-run-invoke-event-calculus";
  const authorityBasisRef =
    "authority-basis://t281/public-sdk-run-invoke-event-calculus";
  const authorityBasisDigest = stableSha256Digest({
    authorityBasisRef,
    request: input.request
  });
  const capabilityGrants = definition.capabilityRefs.map(
    (capabilityId, index) => constructCapabilityGrant({
      capabilityId,
      capabilityDefinitionRef:
        `capability-definition://t281/run-invoke/${index}`,
      capabilityDefinitionDigest: stableSha256Digest({ capabilityId }),
      actorRef,
      approvalRef: `approval://t281/run-invoke/${index}`,
      policyRef: `policy://t281/run-invoke/${index}`,
      scopeRef: input.binding.bindingId,
      scopeDigest: input.binding.bindingDigest,
      authorityBasisRef,
      authorityBasisDigest
    })
  );
  const slots = Object.freeze({
    actor: Object.freeze({
      state: "admitted_actor",
      actorRef,
      attributionRef: "attribution://t281/public-sdk-run-invoke-event-calculus",
      attributionDigest: stableSha256Digest({ actorRef })
    }),
    workspace: Object.freeze({
      state: "admitted_workspace",
      bindingRef: input.binding.bindingId,
      bindingDigest: input.binding.bindingDigest
    }),
    productSet: Object.freeze({
      state: "admitted_product_set",
      productSetRef: `product-set:${input.binding.productSetDigest}`,
      productSetDigest: input.binding.productSetDigest
    }),
    dependencyLock: Object.freeze({
      state: "admitted_dependency_lock",
      lockRef: input.binding.resolvedLockId,
      lockDigest: input.binding.resolvedLockDigest
    }),
    catalogScope: Object.freeze({
      state: "admitted_catalog_scope",
      viewRef: input.catalogView.sessionViewRef,
      viewDigest: stableSha256Digest(input.catalogView),
      allowlistRef: `allowlist:${stableSha256Digest(input.allowlist)}`,
      allowlistDigest: stableSha256Digest(input.allowlist)
    }),
    executionProgram: Object.freeze({
      state: "admitted_execution_program",
      selectionState: "selected_graph_function",
      admittedGtlProgramRef: input.program.admittedProgramRef,
      admittedGtlProgramDigest: input.program.admittedProgramDigest,
      canonicalHandle: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
      inputContract: input.inputContract,
      inputPayloadRef: `input-payload:${stableSha256Digest(input.request.input)}`,
      inputPayloadDigest: stableSha256Digest(input.request.input)
    }),
    invocationPolicy: Object.freeze({
      state: "admitted_invocation_policy",
      policyRef: "policy://t281/run-invoke/fd-sunny",
      policyDigest: stableSha256Digest({ policy: "fd-sunny" }),
      sessionPolicyRef: "policy://t281/run-invoke/session",
      sessionPolicyDigest: stableSha256Digest({ session: "fd-sunny" })
    }),
    transportSteering: Object.freeze({
      state: "declared_transport_steering",
      steeringRef: "steering://t281/run-invoke/no-transport",
      steeringDigest: stableSha256Digest({ steering: "no-transport" }),
      provenanceRefs: Object.freeze([
        "proof://t281/public-sdk-run-invoke-event-calculus"
      ])
    })
  });
  const expectedAuthority = Object.freeze({
    definitionKey: definition.definitionKey,
    definitionDigest: publishedDefinition.definitionDigest,
    contractCatalog: catalogCoordinate(input.catalog),
    requiredGrantCapabilityIds: definition.capabilityRefs,
    slotStates: Object.freeze(Object.fromEntries(
      Object.entries(slots).map(([slot, value]) => [slot, value.state])
    ))
  });
  const authority = constructInvocationAuthority({
    definitionKeySchema,
    expected: expectedAuthority,
    basis: {
      authorityBasisRef,
      authorityBasisDigest,
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog: expectedAuthority.contractCatalog,
      capabilityGrants,
      ...slots
    }
  });
  const requestDigest = stableSha256Digest(input.request);
  const nonterminal = definition.nonTerminalContract?.contract.schemaCoordinate ??
    null;
  return constructPublicInvocation({
    definitionKeySchema,
    requestSchema: definition.requestContract.contract.schema,
    expected: {
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog: expectedAuthority.contractCatalog,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      resultContract: definition.resultContract.contract.schemaCoordinate,
      refusalContract: definition.refusalContract.contract.schemaCoordinate,
      nonTerminalContract: nonterminal,
      authority: expectedAuthority
    },
    basis: {
      kind: "public_invocation",
      invocationRef: `public-invocation://t281/run-invoke/${requestDigest}`,
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog: expectedAuthority.contractCatalog,
      authority,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      requestRef: `request:${requestDigest}`,
      requestDigest,
      request: input.request,
      expectedResultContract: definition.resultContract.contract.schemaCoordinate,
      expectedRefusalContract: definition.refusalContract.contract.schemaCoordinate,
      expectedNonTerminalContract: nonterminal,
      correlationRef: "correlation://t281/public-sdk-run-invoke-event-calculus",
      provenanceRefs: Object.freeze([
        "proof://t281/public-sdk-run-invoke-event-calculus"
      ])
    }
  });
}

function constructionFluent(event, input) {
  return constructRuntimeFluent({
    name: input.name,
    scope: "construction",
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: input.graphCallId ?? null,
    frameId: input.frameId ?? null,
    runId: event.runId,
    workKey: event.workKey,
    continuationId: input.continuationId ?? null,
    constraintRef: input.constraintRef ?? null,
    ref: input.ref
  });
}

function runInvokeSelection(input) {
  const prepared = input.prepared;
  const constraint = prepared.af13Constraint;
  assert.equal(constraint.kind, "invoke_exact_member_constraint");
  const candidates = prepared.catalogBasis.executionBindings.filter(
    (binding) => binding.entryRef === constraint.candidateEntryRef
  );
  assert.equal(candidates.length, 1);
  const candidate = candidates[0];
  assert.notEqual(candidate, undefined);
  const outputContractRefs = Object.freeze([...new Set(
    candidate.graphFunction.outputs.flatMap(
      (node) => node.assetSurface.outputContractRefs
    )
  )]);
  const proofObligationRefs = Object.freeze([...new Set(
    candidate.graphFunction.outputs.flatMap(
      (node) => node.assetSurface.proofObligationRefs
    )
  )]);
  const authority = prepared.packet.invocation.authority;
  assert.equal(authority.invocationPolicy.state, "admitted_invocation_policy");
  const coordinate = stableSha256Digest({
    invocationRef: prepared.packet.invocation.invocationRef,
    workspaceBindingDigest: prepared.workspaceBinding.bindingDigest,
    catalogBasisRef: prepared.catalogBasis.basisRef,
    candidateEntryRef: candidate.entryRef
  }).slice("sha256:".length);
  return Object.freeze({
    episodeId: `episode://abg/run.invoke/${coordinate}`,
    intentLineageRef: prepared.packet.invocation.requestRef,
    admittedProductTruthRefs: Object.freeze([...new Set([
      ...prepared.workspaceBinding.productBindingRefs,
      ...prepared.catalogBasis.admissionEventRefs
    ])]),
    workspaceBinding: Object.freeze({
      ref: prepared.workspaceBinding.bindingId,
      digest: prepared.workspaceBinding.bindingDigest
    }),
    invocationAuthority: Object.freeze({
      ref: authority.authoritySetRef,
      digest: authority.authoritySetDigest
    }),
    programMembers: constructOneSurfaceProgramMemberProjection({
      admittedProgramRef: prepared.authorityProgram.admittedProgramRef,
      admittedProgramDigest: prepared.authorityProgram.admittedProgramDigest,
      graphFunctions: Object.freeze([Object.freeze({
        graphFunctionRef: candidate.graphFunctionId,
        graphFunctionDigest: candidate.graphFunctionDigest
      })])
    }),
    replayCursorRef: input.publicAdmissionEvent.eventId,
    runtimeProjectionRef: prepared.catalogBasis.runtimeCatalogProjectionRef,
    allowedEntryRefs: constraint.allowedEntryRefs,
    priorityScheme: constructConstructionPriorityScheme({
      schemeRef: `priority-scheme://abg/run.invoke/${coordinate}`,
      sourcePolicyRef: authority.invocationPolicy.policyRef,
      rules: []
    }),
    targetObligationRefs: outputContractRefs,
    targetEvidenceAuthorityRefs: proofObligationRefs,
    gapEvidenceRefs: Object.freeze([
      prepared.packet.invocation.requestRef,
      ...prepared.catalogBasis.admissionEventRefs
    ]),
    gapAuthorityRefs: Object.freeze([
      authority.authoritySetRef,
      prepared.catalogBasis.basisRef,
      prepared.authorityProgram.bindingRef
    ]),
    causationRef: input.publicAdmissionEvent.eventId,
    correlationId: prepared.packet.invocation.correlationRef,
    inputPayloadRef: constraint.inputPayloadRef,
    inputLineageRef: prepared.packet.invocation.requestRef,
    runtimeScope: Object.freeze({
      basisId: `basis://abg/run.invoke/one-surface/${coordinate}`,
      graphCallId: `graph-call://abg/run.invoke/one-surface/${coordinate}`,
      frameId: `frame://abg/run.invoke/one-surface/${coordinate}`
    })
  });
}

function forgeSelectedVectorRef(intentAdmission, selectedVectorRef) {
  const constructionIntentAdmission = Object.freeze({
    ...intentAdmission.constructionIntentAdmission,
    admittedIntent: Object.freeze({
      ...intentAdmission.constructionIntentAdmission.admittedIntent,
      selectedVectorRef
    })
  });
  const basis = Object.freeze({
    program: intentAdmission.program,
    nextAction: intentAdmission.nextAction,
    catalogView: intentAdmission.catalogView,
    workspaceBinding: intentAdmission.workspaceBinding,
    invocationAuthority: intentAdmission.invocationAuthority,
    targetBindingRefs: intentAdmission.targetBindingRefs,
    constructionIntentAdmission
  });
  const admissionDigest = stableSha256Digest(basis);
  return Object.freeze({
    kind: "one_surface_construction_intent_admission",
    status: "admitted",
    admissionRef:
      `abg://one-surface/intent-admission/${admissionDigest.slice("sha256:".length)}`,
    admissionDigest,
    ...basis
  });
}

async function assertForgedInternalVectorTargetRefused(input) {
  const definition = input.family["abg.operation.run.invoke"].invoke;
  const packet = admitPrivateP1PublicOperationPacket({
    family: input.family,
    definition,
    rawInvocation: input.invocation,
    causationEventRefs: Object.freeze([]),
    priorEvents: input.priorEvents
  });
  const prepared = await preparePrivateRunInvokeExecutionFromPacket({
    definition,
    packet,
    context: input.fixture.context,
    runtimeCatalogBasis: input.catalogBasis,
    authorityProgram: input.installedOneSurface.authorityProgram
  });
  const internalEvents = [];
  const publicAdmission = admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents: input.priorEvents,
    eventSink: (event) => internalEvents.push(event)
  });
  const selectionPriorEvents = Object.freeze([
    ...input.priorEvents,
    publicAdmission.event
  ]);
  const selected = await executeInstalledAbgSystemOneSurfaceSelection({
    authority: input.installedOneSurface,
    selection: runInvokeSelection({
      prepared,
      publicAdmissionEvent: publicAdmission.event
    }),
    catalogBasis: input.catalogBasis,
    emitterContext: createOneSurfaceRuntimeEmitter(selectionPriorEvents),
    eventSink: (event) => internalEvents.push(event)
  });
  const selectedBinding = input.catalogBasis.executionBindings.find(
    (binding) => binding.entryRef === prepared.af13Constraint.candidateEntryRef
  );
  assert.notEqual(selectedBinding, undefined);
  const selectedVectorRef =
    selectedBinding.graphFunction.template.graph.vectors[0]?.id;
  assert.equal(typeof selectedVectorRef, "string");
  assert.equal(
    selected.intentAdmission.constructionIntentAdmission.admittedIntent
      .selectedVectorRef,
    null
  );
  const forgedIntentAdmission = forgeSelectedVectorRef(
    selected.intentAdmission,
    selectedVectorRef
  );
  const finalized = finalizePrivateRunInvokeExecutionIngress({
    prepared,
    nextAction: selected.nextAction,
    intentAdmission: forgedIntentAdmission,
    nativeDefinitionRelations: Object.freeze([
      bindM04RuntimeSchemaNativeDefinition({
        source: WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request,
        symbolicSchemaRef: ABG_SYSTEM_SUNNY_INPUT_SCHEMA_REF,
        definition:
          input.family["abg.operation.workspace.create"].clean.requestContract
            .contract
      })
    ])
  });
  const directPriorEvents = Object.freeze([
    ...selectionPriorEvents,
    ...selected.runtimeEvents
  ]);
  const tenantManifest = admitTenantConformanceManifest(
    input.fixture.tenantConformanceManifest,
    input.fixture.catalog
  );
  const compiledExecution = compileSelectedCatalogDirectProgram({
    invocationAuthority: finalized.ingress.invocationAuthority,
    runtimeProfile: finalized.ingress.runtimeProfile,
    catalogBasis: input.catalogBasis,
    selectedExecutionBinding: finalized.selectedExecutionBinding,
    admittedTenantConformanceManifest: tenantManifest
  });
  await assert.rejects(
    () => executeSelectedCatalogDirectProgram({
      ingress: finalized.ingress,
      intentAdmission: forgedIntentAdmission,
      targetBinding: selected.targetBinding,
      selectedIntentEvent: selected.selectedIntentEvent,
      publicOperationAdmission: publicAdmission,
      catalogBasis: input.catalogBasis,
      selectedExecutionBinding: finalized.selectedExecutionBinding,
      schemaAdmissionEngineInput: finalized.schemaAdmissionEngineInput,
      compiledExecution,
      implementations: Object.freeze([]),
      priorEvents: directPriorEvents,
      eventSink: () => {
        assert.fail("forged vector target reached runtime event emission");
      }
    }),
    (error) =>
      error?.code === "authority_mismatch" &&
      /exact admitted intent target binding/u.test(error.message)
  );
}

test("T-281 public SDK run.invoke emits the exact replay-stable Event Calculus construction chain", async () => {
  const fixture = await installedRunInvokeFixture();
  const family = await exactFamily();
  const eventSink = fixture.context.effects.createRuntimeEventSink();
  const preparedCatalog = await prepareBoundRuntimeCatalogAdmission({
    context: fixture.context,
    correlationId: "correlation://t281/catalog-admission",
    causationEventRefs: Object.freeze([])
  });
  const catalogAdmission = admitBoundWorkspaceCatalog(
    preparedCatalog.batch,
    eventSink,
    Object.freeze([])
  );
  assert.equal(catalogAdmission.accepted, true, JSON.stringify(catalogAdmission));
  assert.notEqual(catalogAdmission.basis, null);

  const catalogBasis = await rehydrateBoundRuntimeCatalogBasis({
    context: fixture.context,
    correlationId: "correlation://t281/catalog-read",
    priorEvents: Object.freeze([...fixture.events])
  });
  const installedOneSurface =
    await projectInstalledAbgSystemOneSurfaceAuthority({ catalogBasis });
  const allowlist = Object.freeze([ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE]);
  const narrowed = deriveRegistrySessionView({
    basis: catalogBasis,
    allowedEntryRefs: allowlist
  });
  assert.equal(narrowed.accepted, true, JSON.stringify(narrowed));
  assert.notEqual(narrowed.view, null);
  const targetEntry = narrowed.view.entries.find(
    (entry) => entry.entryRef === ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE
  );
  assert.notEqual(targetEntry, undefined);
  const inputContract = exactInstalledGraphFunctionInputContract({
    manifest: fixture.manifest,
    entry: targetEntry
  }).coordinate;
  const input = Object.freeze({
    targetRoot: fixture.context.binding.targetRoot,
    createPolicy: "clean",
    scaffoldPolicy: "no_scaffold"
  });
  const request = Object.freeze({
    kind: "run_invoke_request",
    variant: "invoke",
    programRef:
      installedOneSurface.authorityProgram.admittedProgramRef,
    programDigest:
      installedOneSurface.authorityProgram.admittedProgramDigest,
    canonicalHandle: ABG_SYSTEM_SUNNY_GRAPH_FUNCTION_HANDLE,
    inputContractRef: inputContract.contractId,
    inputContractDigest: inputContract.schemaDigest,
    input,
    catalogViewRef: narrowed.view.sessionViewRef,
    catalogViewDigest: stableSha256Digest(narrowed.view),
    allowlist
  });
  const invocation = exactRunInvokeInvocation({
    definition: family["abg.operation.run.invoke"].invoke,
    catalog: fixture.catalog,
    binding: fixture.context.binding,
    catalogView: narrowed.view,
    program: installedOneSurface.authorityProgram,
    inputContract,
    allowlist,
    request
  });
  const priorEvents = Object.freeze([...fixture.events]);
  await assertForgedInternalVectorTargetRefused({
    fixture,
    family,
    invocation,
    priorEvents,
    catalogBasis,
    installedOneSurface
  });
  const outcome = await abiogenesisPublicSdk.invoke({
    rawInvocation: invocation,
    execution: {
      kind: "bound_workspace_write",
      context: fixture.context,
      priorEvents,
      eventSink
    }
  });
  assert.equal(outcome.outcomeKind, "result", JSON.stringify(outcome));
  assert.equal(outcome.value.disposition, "completed", JSON.stringify(outcome));
  assert.equal(outcome.value.runRef, invocation.invocationRef);
  assert.equal(outcome.value.runDigest, invocation.invocationDigest);
  assert.equal(typeof outcome.value.resultRef, "string");
  assert.match(outcome.value.resultDigest, /^sha256:[0-9a-f]{64}$/u);

  const invocationEvents = fixture.events.slice(priorEvents.length);
  const runResultSource = Object.freeze({
    kind: "Run",
    sourceRef: outcome.value.runRef,
    sourceDigest: outcome.value.runDigest
  });
  const runResultSelector = Object.freeze({});
  const projectionBasis = deriveProjectReadProjectionBasis({
    kind: "project_read_projection_basis",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "run_result"
    },
    source: runResultSource,
    selector: runResultSelector
  });
  const readExecution = Object.freeze({
    kind: "bound_workspace",
    context: fixture.context,
    priorEvents: Object.freeze([...fixture.events])
  });
  const beforeReadEventCount = fixture.events.length;
  const runResult = await abiogenesisPublicSdk.invoke({
    rawInvocation: exactProjectReadInvocation({
      family,
      fixture,
      request: Object.freeze({
        kind: "project_read_request",
        caseKey: "run_result",
        source: runResultSource,
        projectionBasis,
        selector: runResultSelector
      })
    }),
    execution: readExecution
  });
  assert.equal(
    runResult.outcomeKind,
    "result",
    JSON.stringify(runResult)
  );
  assert.equal(runResult.value.caseKey, "run_result");
  assert.equal(runResult.value.projection.results.length, 1);
  assert.deepEqual(
    runResult.value.projection.results[0].result,
    {
      ref: outcome.value.resultRef,
      digest: outcome.value.resultDigest
    }
  );
  const runResultRow = runResult.value.projection.results[0];
  const closingDelta = fixture.events.find(
    (event) =>
      event.kind === "construction_delta_observed" &&
      event.graphCallId === outcome.value.graphCallRef
  );
  const closingTerminal = fixture.events.find(
    (event) =>
      event.kind === "construction_terminal_disposition_projected" &&
      event.episodeId === closingDelta?.episodeId
  );
  assert.notEqual(closingDelta, undefined);
  assert.notEqual(closingTerminal, undefined);
  assert.equal(closingDelta.closed, true);
  assert.equal(closingTerminal.publicState, "construction_closed");
  assert.equal(runResultRow.closureEligible, true);
  assert.deepEqual(runResultRow.residualRefs, []);
  assert.equal(runResultRow.provenanceRefs.includes(closingDelta.eventId), true);
  assert.equal(
    runResultRow.provenanceRefs.includes(closingTerminal.eventId),
    true
  );

  const beforeActionDisposition = Object.freeze(
    fixture.events.filter(
      (event) =>
        event.eventAdmissionOrdinal < closingDelta.eventAdmissionOrdinal
    )
  );
  assert.throws(
    () => projectRunResultForPublicRead({
      replay: Object.freeze({
        kind: "admitted_workspace_replay",
        orderedEvents: beforeActionDisposition
      }),
      source: Object.freeze({
        kind: "Run",
        sourceRef: outcome.value.runRef,
        sourceDigest: outcome.value.runDigest
      })
    }),
    (error) =>
      error?.code === "not_ready" &&
      /AF-16 action disposition/u.test(error.message)
  );
  assert.throws(
    () => projectRunResultForPublicRead({
      replay: Object.freeze({
        kind: "admitted_workspace_replay",
        orderedEvents: Object.freeze(
          fixture.events.filter((event) => event !== closingTerminal)
        )
      }),
      source: runResultSource
    }),
    (error) =>
      error?.code === "not_ready" &&
      /no causal terminal construction projection/u.test(error.message)
  );

  const {
    eventId: ignoredEventId,
    eventTime: ignoredEventTime,
    eventTimeUnixMs: ignoredEventTimeUnixMs,
    eventAdmissionOrdinal: ignoredEventAdmissionOrdinal,
    ...closingDeltaBody
  } = closingDelta;
  void ignoredEventId;
  void ignoredEventTime;
  void ignoredEventTimeUnixMs;
  void ignoredEventAdmissionOrdinal;
  const [blockedDelta] = emitWithContext(
    createRuntimeEventEmitterContext({
      source: "live",
      startOrdinal: closingDelta.eventAdmissionOrdinal
    }),
    Object.freeze({
      ...closingDeltaBody,
      fulfilledObligationRefs: Object.freeze([]),
      remainingObligationRefs: Object.freeze([
        ...closingDelta.fulfilledObligationRefs
      ]),
      closed: false
    }),
    () => {}
  );
  assert.notEqual(blockedDelta, undefined);
  const blockedProjection = projectRunResultForPublicRead({
    replay: Object.freeze({
      kind: "admitted_workspace_replay",
      orderedEvents: Object.freeze([
        ...beforeActionDisposition,
        blockedDelta
      ])
    }),
    source: Object.freeze({
      kind: "Run",
      sourceRef: outcome.value.runRef,
      sourceDigest: outcome.value.runDigest
    })
  });
  assert.equal(blockedProjection.results.length, 1);
  assert.equal(blockedProjection.results[0].closureEligible, false);
  assert.equal(
    blockedProjection.results[0].residualRefs.includes(
      blockedDelta.afterProjectionRef
    ),
    true
  );
  assert.equal(
    blockedProjection.results[0].provenanceRefs.includes(blockedDelta.eventId),
    true
  );

  const runStatusSelector = Object.freeze({});
  const runStatusProjectionBasis = deriveProjectReadProjectionBasis({
    kind: "project_read_projection_basis",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "run_status"
    },
    source: runResultSource,
    selector: runStatusSelector
  });
  const directRunStatusAuthority = await reconstructBoundRuntimeExecutionBasis({
    context: fixture.context,
    priorEvents: Object.freeze([...fixture.events]),
    runRef: outcome.value.runRef
  });
  projectRunStatusForPublicRead({
    replay: Object.freeze({
      kind: "admitted_workspace_replay",
      orderedEvents: Object.freeze([...fixture.events])
    }),
    source: runResultSource,
    authority: directRunStatusAuthority
  });
  const runStatus = await abiogenesisPublicSdk.invoke({
    rawInvocation: exactProjectReadInvocation({
      family,
      fixture,
      request: Object.freeze({
        kind: "project_read_request",
        caseKey: "run_status",
        source: runResultSource,
        projectionBasis: runStatusProjectionBasis,
        selector: runStatusSelector
      })
    }),
    execution: readExecution
  });
  assert.equal(runStatus.outcomeKind, "result", JSON.stringify(runStatus));
  assert.equal(runStatus.value.caseKey, "run_status");
  assert.deepEqual(runStatus.value.projection.subject, {
    kind: "Run",
    ref: runResultSource.sourceRef,
    digest: runResultSource.sourceDigest
  });
  assert.deepEqual(runStatus.value.projection.lifecycle, {
    kind: "terminal",
    disposition: "completed",
    stop: null,
    terminal: {
      ref: closingTerminal.eventId,
      digest: stableSha256Digest(closingTerminal)
    },
    pendingInteraction: null
  }, JSON.stringify(runStatus.value.projection));

  const runStatusAuthority = directRunStatusAuthority;
  assert.deepEqual(runStatus.value.projection.substrate, {
    program: runStatusAuthority.program,
    workspaceBinding: runStatusAuthority.workspaceBinding,
    executionBasis: {
      ref: runStatusAuthority.executionBasis.id,
      digest: stableSha256Digest(runStatusAuthority.executionBasis)
    }
  });
  const basisEvents = fixture.events.filter(
    (event) =>
      "basisId" in event &&
      event.basisId === runStatusAuthority.executionBasis.id
  );
  const runStatusCalculus = deriveRuntimeEventCalculusProjection({
    basis: runStatusAuthority.executionBasis,
    events: basisEvents,
    undeclaredEventBehavior: "ignore"
  });
  for (const expected of [
    "basis_admitted",
    "graph_call_open",
    "frame_open",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed"
  ]) {
    assert.equal(
      runStatusCalculus.holds.some((fluent) => fluent.name === expected),
      true,
      `${expected} is not HoldsAt after the admitted run`
    );
  }

  const replayWithoutRunAdmission = Object.freeze({
    kind: "admitted_workspace_replay",
    orderedEvents: Object.freeze(fixture.events.filter(
      (event) => !(
        event.kind === "public_operation_admitted" &&
        event.invocationRef === outcome.value.runRef
      )
    ))
  });
  assert.throws(
    () => projectRunStatusForPublicRead({
      replay: replayWithoutRunAdmission,
      source: runResultSource,
      authority: runStatusAuthority
    }),
    (error) =>
      error?.code === "not_found" &&
      /run.invoke identity/u.test(error.message)
  );
  await assert.rejects(
    () => reconstructBoundRuntimeExecutionBasis({
      context: fixture.context,
      priorEvents: Object.freeze(fixture.events.filter(
        (event) => !(
          event.kind === "basis_admitted" &&
          event.runId === outcome.value.runRef
        )
      )),
      runRef: outcome.value.runRef
    }),
    /one exact replay-admitted ExecutionBasis/u
  );
  const staleCatalogContext = Object.freeze({
    ...fixture.context,
    publicContractCatalog: Object.freeze({
      ...fixture.context.publicContractCatalog,
      catalogDigest: stableSha256Digest({ stale: "catalog" })
    })
  });
  await assert.rejects(
    () => reconstructBoundRuntimeExecutionBasis({
      context: staleCatalogContext,
      priorEvents: Object.freeze([...fixture.events]),
      runRef: outcome.value.runRef
    }),
    /catalog|binding/u
  );
  const forgedBasisAuthority = Object.freeze({
    ...runStatusAuthority,
    executionBasis: Object.freeze({
      ...runStatusAuthority.executionBasis,
      runtimeIdentity: Object.freeze({
        ...runStatusAuthority.executionBasis.runtimeIdentity,
        resolvedRuntimeRef: "runtime://forged"
      })
    })
  });
  assert.throws(
    () => projectRunStatusForPublicRead({
      replay: Object.freeze({
        kind: "admitted_workspace_replay",
        orderedEvents: Object.freeze([...fixture.events])
      }),
      source: runResultSource,
      authority: forgedBasisAuthority
    }),
    (error) =>
      error?.code === "projection_unsupported" &&
      /reconstructed ExecutionBasis differs/u.test(error.message)
  );

  const runReplaySelector = Object.freeze({ fromOrdinal: 0, limit: 1000 });
  const runReplayProjectionBasis = deriveProjectReadProjectionBasis({
    kind: "project_read_projection_basis",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "run_replay"
    },
    source: runResultSource,
    selector: runReplaySelector
  });
  const runReplay = await abiogenesisPublicSdk.invoke({
    rawInvocation: exactProjectReadInvocation({
      family,
      fixture,
      request: Object.freeze({
        kind: "project_read_request",
        caseKey: "run_replay",
        source: runResultSource,
        projectionBasis: runReplayProjectionBasis,
        selector: runReplaySelector
      })
    }),
    execution: readExecution
  });
  assert.equal(runReplay.outcomeKind, "result", JSON.stringify(runReplay));
  assert.equal(runReplay.value.caseKey, "run_replay");
  assert.ok(runReplay.value.projection.rows.length > 0);
  assert.ok(
    runReplay.value.projection.rows.every((row) =>
      row.sourceRefs.includes(outcome.value.runRef)
    )
  );

  const resultEvidenceSource = Object.freeze({
    kind: "RuntimeResult",
    sourceRef: outcome.value.resultRef,
    sourceDigest: outcome.value.resultDigest
  });
  const resultEvidenceSelector = Object.freeze({});
  const resultEvidenceProjectionBasis = deriveProjectReadProjectionBasis({
    kind: "project_read_projection_basis",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "result_evidence"
    },
    source: resultEvidenceSource,
    selector: resultEvidenceSelector
  });
  const resultEvidence = await abiogenesisPublicSdk.invoke({
    rawInvocation: exactProjectReadInvocation({
      family,
      fixture,
      request: Object.freeze({
        kind: "project_read_request",
        caseKey: "result_evidence",
        source: resultEvidenceSource,
        projectionBasis: resultEvidenceProjectionBasis,
        selector: resultEvidenceSelector
      })
    }),
    execution: readExecution
  });
  assert.equal(resultEvidence.outcomeKind, "refusal");
  assert.equal(resultEvidence.value.code, "projection_unsupported");
  assert.match(
    resultEvidence.value.residualRefs[0],
    /^projection-refusal:result_evidence:/u
  );
  assert.equal(fixture.events.length, beforeReadEventCount);

  const constructionEvents = invocationEvents.filter(
    (event) => event.kind.startsWith("construction_")
  );
  assert.deepEqual(
    constructionEvents.map((event) => event.kind),
    CONSTRUCTION_EVENT_KINDS
  );
  const first = constructionEvents[0];
  assert.notEqual(first, undefined);
  for (let index = 0; index < constructionEvents.length; index += 1) {
    const event = constructionEvents[index];
    assert.equal(event.eventSequence, index);
    for (const key of [
      "episodeId",
      "iterationOrdinal",
      "correlationId",
      "basisId",
      "graphFunctionId",
      "runId",
      "workKey"
    ]) {
      assert.equal(event[key], first[key], `${key} differs at event ${index}`);
    }
    if (index > 0) {
      assert.ok(
        event.causationEventRefs.includes(
          constructionEvents[index - 1].constructionEventRef
        ),
        `construction event ${index} does not cite event ${index - 1}`
      );
    }
  }

  const orderedProjection = deriveConstructionEventCalculusProjection({
    episodeId: first.episodeId,
    events: constructionEvents
  });
  const reversedProjection = deriveConstructionEventCalculusProjection({
    episodeId: first.episodeId,
    events: Object.freeze([...constructionEvents].reverse())
  });
  assert.deepEqual(reversedProjection, orderedProjection);

  const invoked = constructionEvents[7];
  const delta = constructionEvents[8];
  const terminal = constructionEvents[9];
  const targetGraphCalls = invocationEvents.filter(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.graphCallId === invoked.graphCallId
  );
  const targetFrames = invocationEvents.filter(
    (event) =>
      event.kind === "frame_opened" &&
      event.frameId === invoked.frameId
  );
  assert.equal(targetGraphCalls.length, 1);
  assert.equal(targetFrames.length, 1);
  assert.equal(targetGraphCalls[0].basisId, targetFrames[0].basisId);
  assert.notEqual(invoked.basisId, targetGraphCalls[0].basisId);
  assert.equal(delta.closed, true);
  assert.equal(terminal.publicState, "construction_closed");
  assert.equal(
    holdsAt(
      orderedProjection,
      constructionFluent(invoked, {
        name: "construction_graph_action_in_flight",
        graphCallId: invoked.graphCallId,
        frameId: invoked.frameId,
        continuationId: invoked.continuationId,
        ref: invoked.intentId
      })
    ),
    false
  );
  const deltaFluent = {
    graphCallId: delta.graphCallId,
    frameId: delta.frameId,
    continuationId: delta.continuationId,
    constraintRef: delta.deltaRef,
    ref: delta.intentId
  };
  assert.equal(
    holdsAt(
      orderedProjection,
      constructionFluent(delta, {
        name: "construction_delta_available",
        ...deltaFluent
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      orderedProjection,
      constructionFluent(delta, {
        name: "construction_progress_observed",
        ...deltaFluent
      })
    ),
    true
  );
  const terminalConstraintRef =
    terminal.terminalRouteRefs[0] ??
    terminal.selectedActionRef ??
    terminal.terminalProjectionRef;
  assert.equal(
    holdsAt(
      orderedProjection,
      constructionFluent(terminal, {
        name: "construction_closed",
        constraintRef: terminalConstraintRef,
        ref: terminal.terminalProjectionRef
      })
    ),
    true
  );
  assert.equal(
    holdsAt(
      orderedProjection,
      constructionFluent(first, {
        name: "construction_episode_open",
        ref: first.episodeId
      })
    ),
    false
  );
});
