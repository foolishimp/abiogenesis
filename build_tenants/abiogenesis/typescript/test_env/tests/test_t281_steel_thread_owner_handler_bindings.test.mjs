import assert from "node:assert/strict";
import test from "node:test";
import { join } from "node:path";
import { TextEncoder } from "node:util";

import {
  admitBoundWorkspaceCatalog
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_catalog.js";
import {
  RESULT_ASSESSMENT_DERIVED_FLUENT_RULE,
  constructPublicOperationArtifactAdmittedEvent,
  constructRuntimeFluent,
  createSeededLiveEmitterContext,
  derivePublicOperationArtifactReplayProjection,
  deriveRuntimeEventCalculusProjection,
  emitWithContext,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitPrivatePublicOperationEvent
} from "../../build/semantic/code/src/abg/m03/runner/public_operation_admission.js";
import {
  mintTargetCarrierPayloadIdentity
} from "../../build/semantic/code/src/abg/m03/contracts/payload_ledger.js";
import {
  admitWorkspaceRuntimeEventBytes
} from "../../build/semantic/code/src/abg/m03/runner/public_runtime_projections.js";
import {
  admitCatalogBindRequest,
  resolvedProductLockId
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  admitPublicResultAssessmentRequest
} from "../../build/semantic/code/src/app/m04/result_assessment/admission.js";
import {
  assertPrivateOwnerEventAdmission,
  bindPrivateCatalogViewHandler,
  bindPrivateResultAssessHandler,
  bindPrivateTicketConsensusProjectReadGap,
  bindPrivateWorkspaceStatusProjectReadHandler,
  bindPrivateWorkspaceBindHandler
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_handler_bindings.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  deriveProjectReadProjectionBasis
} from "../../build/semantic/code/src/app/m04/public_contracts/project_read_operation_contracts.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  WORKSPACE_MANIFEST_RELATIVE_PATH
} from "../../build/semantic/code/src/app/m04/workspace/operations.js";
import {
  fpDispatchRequest,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";
import {
  publicContractCatalogFixture
} from "./support/t223-schema-parity-fixtures.mjs";
import {
  admitT281PrivateP1Packet
} from "./support/t281-private-ingress-fixture.mjs";

const ROOT = "/tmp/abg-t281-steel-thread";

function digest(label) {
  return stableSha256Digest({ label });
}

function installedProductRecord(toolchainRoot) {
  const productRoot = join(
    toolchainRoot,
    "products",
    "abiogenesis",
    "5.0.0"
  );
  return Object.freeze({
    kind: "installed_product_record",
    schemaVersion: 1,
    installedProductId: "installed://abiogenesis/abiogenesis/5.0.0",
    publisher: "abiogenesis",
    productId: "abiogenesis",
    packageName: "@abiogenesis/typescript-tenant",
    version: "5.0.0",
    artifactDigest: digest("artifact"),
    productContentDigest: digest("content"),
    installedRoot: productRoot,
    productRoot,
    packageRoot: join(productRoot, "package"),
    manifestPath: join(productRoot, "product-toolchain-manifest.json"),
    manifestDigest: digest("manifest"),
    descriptorId: "descriptor://abiogenesis/abiogenesis/5.0.0",
    descriptorDigest: digest("descriptor"),
    contributionId: "contribution://abiogenesis/abiogenesis/5.0.0",
    contributionDigest: digest("contribution"),
    compatibilityRange: "5.0.0",
    compatibility: Object.freeze({
      productId: "abiogenesis",
      compatible: true,
      reason: null
    }),
    commandRefs: Object.freeze(["command://abiogenesis/abg.cli"]),
    publicContractCatalogId: "contract-catalog://abiogenesis",
    publicContractCatalogVersion: "5.0.0",
    publicContractCatalogDigest: digest("contracts"),
    descriptorRecordPath: join(productRoot, "product-descriptor.json"),
    contributionRecordPath: join(productRoot, "contribution-manifest.json"),
    lockRecordPath: join(productRoot, "resolved-product-lock.json"),
    provenanceRefs: Object.freeze(["proof://t281/installed-product"])
  });
}

function resolvedLock(record) {
  const identityBasis = Object.freeze({
    requirements: Object.freeze([Object.freeze({
      productId: record.productId,
      versionConstraint: record.version,
      requiredContractRefs: Object.freeze([]),
      requiredCapabilityRefs: Object.freeze([])
    })]),
    products: Object.freeze([Object.freeze({
      publisher: record.publisher,
      productId: record.productId,
      version: record.version,
      descriptorId: record.descriptorId,
      descriptorDigest: record.descriptorDigest,
      contributionId: record.contributionId,
      contributionDigest: record.contributionDigest,
      artifactDigest: record.artifactDigest,
      productContentDigest: record.productContentDigest
    })]),
    dependencyEdges: Object.freeze([]),
    compatibility: Object.freeze([record.compatibility])
  });
  const basis = Object.freeze({
    kind: "resolved_product_lock",
    schemaVersion: 1,
    lockId: resolvedProductLockId(identityBasis),
    ...identityBasis
  });
  return Object.freeze({ ...basis, lockDigest: stableSha256Digest(basis) });
}

function workspaceFixture() {
  const toolchainRoot = join(ROOT, "toolchain");
  const record = installedProductRecord(toolchainRoot);
  const lock = resolvedLock(record);
  const manifest = Object.freeze({
    kind: "abg_workspace_manifest",
    schemaVersion: 1,
    workspaceId: "workspace://t281/steel-thread",
    root: ROOT,
    authorityMode: "clean_no_project_authority",
    scaffoldState: "none",
    bindingRef: null,
    configurationRefs: Object.freeze([]),
    createdAt: "2026-07-18T00:00:00.000Z",
    actorRef: "actor://t281/fixture",
    provenanceRefs: Object.freeze(["proof://t281/workspace"])
  });
  const mutableStateRoots = Object.freeze({
    observedWorkspaceRoot: ROOT,
    observerStateRoot: join(ROOT, ".ai-workspace"),
    executorStateRoot: join(ROOT, ".ai-workspace"),
    eventRoot: join(ROOT, ".ai-workspace", "events"),
    eventLogPath: join(ROOT, ".ai-workspace", "events", "events.jsonl"),
    runtimeRoot: join(ROOT, ".ai-workspace", "runtime"),
    projectionRoot: join(ROOT, ".ai-workspace", "projections"),
    archiveRoot: join(ROOT, ".ai-workspace", "archives")
  });
  const ownerRequest = admitCatalogBindRequest({
    workspaceId: manifest.workspaceId,
    workspaceManifestDigest: stableSha256Digest(manifest),
    resolvedLock: lock,
    installedProductRecords: [record],
    mutableStateRoots
  });
  const rawRequest = {
    workspaceAuthorityRef: manifest.workspaceId,
    workspaceAuthorityDigest: stableSha256Digest(manifest),
    installedSet: [{
      ref: record.installedProductId,
      digest: stableSha256Digest(record)
    }],
    resolvedLockRef: lock.lockId,
    resolvedLockDigest: lock.lockDigest,
    declaredRoots: [...new Set([
      mutableStateRoots.observedWorkspaceRoot,
      mutableStateRoots.observerStateRoot,
      mutableStateRoots.executorStateRoot,
      mutableStateRoots.eventRoot,
      mutableStateRoots.runtimeRoot,
      mutableStateRoots.projectionRoot,
      mutableStateRoots.archiveRoot
    ])]
  };
  return { manifest, ownerRequest, rawRequest, record };
}

function prerequisiteArtifactReplay(fixture) {
  const events = [];
  const emitter = createSeededLiveEmitterContext([]);
  const emit = (event) => emitWithContext(emitter, event, (value) => {
    events.push(value);
  })[0];
  const admit = ({ operationId, variant, invocationRef, scopeRef, scopeDigest }) =>
    emit(Object.freeze({
      kind: "public_operation_admitted",
      definitionKey: Object.freeze({
        operationId,
        memberKind: "variant",
        variant
      }),
      definitionDigest: digest(`${operationId}:${variant}:definition`),
      invocationRef,
      invocationDigest: digest(`${invocationRef}:invocation`),
      invocationAuthorityRef: `${invocationRef}:authority`,
      invocationAuthorityDigest: digest(`${invocationRef}:authority`),
      authorityBasisRef: `${invocationRef}:basis`,
      authorityBasisDigest: digest(`${invocationRef}:basis`),
      actorRef: "actor://t281/prerequisite",
      actorAttributionRef: "attribution://t281/prerequisite",
      actorAttributionDigest: digest("prerequisite-attribution"),
      workspaceBindingRequirement: "forbidden",
      scopeRef,
      scopeDigest,
      causationEventRefs: Object.freeze([]),
      correlationId: `${invocationRef}:correlation`
    }));
  const manifestDigest = stableSha256Digest(fixture.manifest);
  const createAdmission = admit({
    operationId: "abg.operation.workspace.create",
    variant: "clean",
    invocationRef: "public-invocation://t281/prerequisite/workspace-create",
    scopeRef: null,
    scopeDigest: null
  });
  emit(constructPublicOperationArtifactAdmittedEvent({
    operationId: "abg.operation.workspace.create",
    definitionKey: createAdmission.definitionKey,
    definitionDigest: createAdmission.definitionDigest,
    scopeRef: fixture.manifest.workspaceId,
    scopeDigest: manifestDigest,
    invocationRef: createAdmission.invocationRef,
    invocationDigest: createAdmission.invocationDigest,
    disposition: "created",
    artifactRef: join(ROOT, WORKSPACE_MANIFEST_RELATIVE_PATH),
    artifactDigest: manifestDigest,
    causationEventRefs: [createAdmission.eventId],
    correlationId: createAdmission.correlationId
  }));
  const recordDigest = stableSha256Digest(fixture.record);
  const installAdmission = admit({
    operationId: "abg.operation.product.install",
    variant: "install",
    invocationRef: "public-invocation://t281/prerequisite/product-install",
    scopeRef: null,
    scopeDigest: null
  });
  emit(constructPublicOperationArtifactAdmittedEvent({
    operationId: "abg.operation.product.install",
    definitionKey: installAdmission.definitionKey,
    definitionDigest: installAdmission.definitionDigest,
    scopeRef: fixture.record.installedProductId,
    scopeDigest: recordDigest,
    invocationRef: installAdmission.invocationRef,
    invocationDigest: installAdmission.invocationDigest,
    disposition: "installed",
    artifactRef: fixture.record.installedProductId,
    artifactDigest: recordDigest,
    causationEventRefs: [installAdmission.eventId],
    correlationId: installAdmission.correlationId
  }));
  return Object.freeze(events);
}

async function exactFamily() {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted", JSON.stringify(admitted));
  return admitted.family;
}

async function bindWorkspaceFixture(family, options = {}) {
  const fixture = workspaceFixture();
  let binding = null;
  const priorEvents = options.priorEvents ?? prerequisiteArtifactReplay(fixture);
  const runtimeEvents = [...priorEvents];
  const definition = family["abg.operation.workspace.bind"].bind;
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request: fixture.rawRequest,
    actorRef: "actor://t281/binder",
    dependencyLock: {
      ref: fixture.rawRequest.resolvedLockRef,
      digest: fixture.rawRequest.resolvedLockDigest
    }
  });
  const admission = admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents,
    eventSink(event) {
      runtimeEvents.push(event);
    }
  });
  const outcome = await bindPrivateWorkspaceBindHandler(family).execute({
    packet,
    ownerRequest: fixture.ownerRequest,
    context: {
      kind: "workspace_binding",
      workspaceManifest: fixture.manifest,
      publicContractCatalog: publicContractCatalogFixture(),
      effects: {
        async readBinding() {
          return binding;
        },
        async readInstalledProductRecord(installedProductId) {
          return installedProductId === fixture.record.installedProductId
            ? fixture.record
            : null;
        },
        async writeBinding(value) {
          binding = value;
        },
        async createMutableRoot() {}
      }
    },
    priorEvents,
    attribution: {
      actorRef: "actor://t281/binder",
      provenanceRefs: ["proof://t281/bind"]
    },
    artifactBoundary: {
      admission
    }
  });
  assert.equal(outcome.kind, "owner_handler_result", JSON.stringify(outcome));
  assert.notEqual(binding, null);
  return {
    fixture,
    binding,
    admission,
    runtimeEvents,
    boundaryEvents: outcome.emittedEvents,
    outcome
  };
}

function resultContractAuthorityReplay(input) {
  const events = [...input.priorEvents];
  const emitter = createSeededLiveEmitterContext(events);
  const emit = (event) => emitWithContext(emitter, event, (value) => {
    events.push(value);
  })[0];
  const request = input.request;
  const payload = request.artifact.artifactPayload;
  assert.notEqual(payload, null);
  const scope = {
    basisId: request.dispatchRequest.basisId,
    graphCallId: request.dispatchRequest.graphCallId,
    frameId: request.dispatchRequest.frameId,
    vectorIndex: request.dispatchRequest.vectorIndex,
    edge: payload.edge
  };
  const authoritySnapshotRef =
    `authority-snapshot://t281/${request.dispatchRequest.resultRef}`;
  const authorityDigest = digest("result-contract-authority");
  const inputDigest = digest("result-contract-input");
  const identity = mintTargetCarrierPayloadIdentity({
    resultRef: request.dispatchRequest.resultRef,
    artifactPayload: payload,
    targetCarrierContractRef: input.contract.ref,
    targetCarrierContractDigest: input.contract.digest
  });
  emit(Object.freeze({
    kind: "authority_snapshot_admitted",
    ...scope,
    authoritySnapshotRef,
    authorityRefs: Object.freeze([input.contract.ref]),
    inputRefs: Object.freeze([request.dispatchRequest.resultRef]),
    authorityDigest,
    inputDigest,
    closureCapable: true,
    contradictoryAuthority: false,
    deferredAuthorityRefs: Object.freeze([]),
    providerRefs: Object.freeze(["worker://t281/result"]),
    policyRefs: Object.freeze(["policy://t281/result"])
  }));
  emit(Object.freeze({
    kind: "payload_observed",
    ...scope,
    payloadRef: identity.payloadRef,
    payloadClass: "target_carrier",
    schemaRef: "schema://t281/result",
    contractRef: input.contract.ref,
    digest: identity.digest,
    producerRef: "worker://t281/result",
    sourceEventRef: request.dispatchRequest.resultRef,
    actorInvocationId: "actor-invocation://t281/result",
    authorityRef: authoritySnapshotRef,
    inputDigest,
    policyRefs: Object.freeze(["policy://t281/result"])
  }));
  emit(Object.freeze({
    kind: "payload_validated",
    ...scope,
    payloadRef: identity.payloadRef,
    schemaRef: "schema://t281/result",
    contractRef: input.contract.ref,
    contractDigest: input.contract.digest,
    digest: identity.digest,
    validationRef: "validation://t281/result",
    evidenceRef: "evidence://t281/result",
    policyRefs: Object.freeze(["policy://t281/result"])
  }));
  emit(Object.freeze({
    kind: "evidence_admitted",
    ...scope,
    evidenceRef: "evidence://t281/result",
    payloadRef: identity.payloadRef,
    authorityRef: authoritySnapshotRef,
    authorityDigest,
    inputDigest,
    providerRefs: Object.freeze(["worker://t281/result"]),
    policyRefs: Object.freeze(["policy://t281/result"]),
    complete: true,
    shallow: false,
    contradictsAuthority: false,
    deferred: false
  }));
  for (const assessment of payload.fulfillmentAssessments) {
    for (const evidenceRef of assessment.evidenceRefs) {
      const evidenceAuthorityDigest = digest(
        `result-evidence-authority:${assessment.id}:${evidenceRef}`
      );
      const evidenceInputDigest = digest(
        `result-evidence-input:${request.dispatchRequest.resultRef}:${assessment.id}`
      );
      const evidencePayloadRef =
        `payload://t281/run-invoke/${stableSha256Digest({ evidenceRef }).slice("sha256:".length)}`;
      const evidencePayloadDigest = stableSha256Digest({
        resultRef: request.dispatchRequest.resultRef,
        obligationId: assessment.id,
        evidenceRef
      });
      emit(Object.freeze({
        kind: "authority_snapshot_admitted",
        ...scope,
        authoritySnapshotRef:
          `authority-snapshot://t281/run-invoke/${assessment.id}`,
        authorityRefs: Object.freeze([assessment.id]),
        inputRefs: Object.freeze([request.dispatchRequest.resultRef]),
        authorityDigest: evidenceAuthorityDigest,
        inputDigest: evidenceInputDigest,
        closureCapable: true,
        contradictoryAuthority: false,
        deferredAuthorityRefs: Object.freeze([]),
        providerRefs: Object.freeze(["worker://t281/result"]),
        policyRefs: Object.freeze(["policy://t281/result-evidence"])
      }));
      emit(Object.freeze({
        kind: "payload_observed",
        ...scope,
        payloadRef: evidencePayloadRef,
        payloadClass: "fp_evaluation_finding",
        schemaRef: null,
        contractRef: "contract://abg/fp-evaluation-finding",
        digest: evidencePayloadDigest,
        producerRef: "worker://t281/result",
        sourceEventRef: request.dispatchRequest.resultRef,
        actorInvocationId: "actor-invocation://t281/result-evidence",
        authorityRef: assessment.id,
        inputDigest: evidenceInputDigest,
        policyRefs: Object.freeze(["policy://t281/result-evidence"])
      }));
      emit(Object.freeze({
        kind: "payload_validated",
        ...scope,
        payloadRef: evidencePayloadRef,
        schemaRef: null,
        contractRef: "contract://abg/fp-evaluation-finding",
        contractDigest: null,
        digest: evidencePayloadDigest,
        validationRef: `validation://t281/run-invoke/${assessment.id}`,
        evidenceRef,
        policyRefs: Object.freeze(["policy://t281/result-evidence"])
      }));
      emit(Object.freeze({
        kind: "evidence_admitted",
        ...scope,
        evidenceRef,
        payloadRef: evidencePayloadRef,
        authorityRef: assessment.id,
        authorityDigest: evidenceAuthorityDigest,
        inputDigest: evidenceInputDigest,
        providerRefs: Object.freeze(["worker://t281/result"]),
        policyRefs: Object.freeze(["policy://t281/result-evidence"]),
        complete: true,
        shallow: false,
        contradictsAuthority: false,
        deferred: false
      }));
    }
  }
  return Object.freeze(events);
}

test("T-281 workspace.bind refuses missing or mismatched prerequisite artifact truth", async () => {
  const family = await exactFamily();
  await assert.rejects(
    bindWorkspaceFixture(family, { priorEvents: Object.freeze([]) }),
    /workspace\.create artifact is not available in admitted replay truth/u
  );
  const fixture = workspaceFixture();
  const mismatched = prerequisiteArtifactReplay(fixture).map((event) =>
    event.kind === "public_operation_artifact_admitted" &&
      event.operationId === "abg.operation.product.install"
      ? Object.freeze({ ...event, artifactDigest: digest("other-record") })
      : event
  );
  await assert.rejects(
    bindWorkspaceFixture(family, { priorEvents: Object.freeze(mismatched) }),
    /product\.install artifact is not available in admitted replay truth/u
  );
});

test("T-281 owner event admission binds the exact public invocation receipt", async () => {
  const family = await exactFamily();
  const fixture = workspaceFixture();
  const definition = family["abg.operation.workspace.bind"].bind;
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request: fixture.rawRequest,
    actorRef: "actor://t281/exact-admission",
    dependencyLock: {
      ref: fixture.rawRequest.resolvedLockRef,
      digest: fixture.rawRequest.resolvedLockDigest
    }
  });
  const otherPacket = admitT281PrivateP1Packet({
    family,
    definition,
    request: {
      ...fixture.rawRequest,
      declaredRoots: [...fixture.rawRequest.declaredRoots, "/tmp/t281/other-root"]
    },
    actorRef: "actor://t281/other-admission",
    dependencyLock: {
      ref: fixture.rawRequest.resolvedLockRef,
      digest: fixture.rawRequest.resolvedLockDigest
    }
  });
  const exactAdmission = admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents: [],
    eventSink() {}
  });
  const otherAdmission = admitPrivatePublicOperationEvent({
    witness: otherPacket.witness,
    priorEvents: [],
    eventSink() {}
  });

  assert.doesNotThrow(() => assertPrivateOwnerEventAdmission({
    definition,
    packet,
    admission: exactAdmission
  }));
  assert.throws(
    () => assertPrivateOwnerEventAdmission({
      definition,
      packet,
      admission: otherAdmission
    }),
    /private owner event admission differs from its admitted P1 packet/u
  );
});

function boundContext(input, eventBytes) {
  return Object.freeze({
    kind: "bound_workspace",
    workspaceManifest: input.fixture.manifest,
    binding: input.binding,
    publicContractCatalog: publicContractCatalogFixture(),
    effects: Object.freeze({
      async readRecord() {
        return null;
      },
      async readInputAsset() {
        return null;
      },
      async readRuntimeEventBytes() {
        return new Uint8Array(eventBytes);
      },
      createRuntimeEventSink() {
        return () => {};
      },
      operatorCapabilityFactories: Object.freeze({})
    })
  });
}

test("T-281 workspace.bind admits ingress then emits one causally ordered Rule-B boundary event", async () => {
  const family = await exactFamily();
  const { fixture, binding, admission, runtimeEvents, boundaryEvents, outcome } =
    await bindWorkspaceFixture(family);
  assert.equal(outcome.value.workspaceBindingRef, binding.bindingId);
  assert.equal(outcome.value.workspaceBindingDigest, binding.bindingDigest);
  assert.equal(outcome.value.bindingManifestRef, binding.bindingId);
  assert.equal(outcome.value.bindingManifestDigest, binding.bindingDigest);
  assert.deepEqual(
    outcome.emittedEvents.map((event) => event.kind),
    ["public_operation_artifact_admitted"]
  );
  assert.deepEqual(outcome.emittedEvents, boundaryEvents);
  assert.deepEqual(
    runtimeEvents.map((event) => event.kind),
    [
      "public_operation_admitted",
      "public_operation_artifact_admitted",
      "public_operation_admitted",
      "public_operation_artifact_admitted",
      "public_operation_admitted",
      "public_operation_artifact_admitted"
    ]
  );
  assert.equal(admission.event.scopeRef, null);
  assert.equal(admission.event.scopeDigest, null);
  assert.equal(admission.event.actorRef, "actor://t281/binder");
  assert.equal(
    runtimeEvents.at(-1).eventAdmissionOrdinal,
    runtimeEvents.at(-2).eventAdmissionOrdinal + 1
  );
  assert.deepEqual(
    outcome.emittedEvents[0].causationEventRefs,
    [admission.event.eventId]
  );
  const fullCalculus = deriveRuntimeEventCalculusProjection({
    events: runtimeEvents
  });
  assert.deepEqual(
    {
      initiates: fullCalculus.effectRows[0].initiates,
      terminates: fullCalculus.effectRows[0].terminates,
      clips: fullCalculus.effectRows[0].clips,
      declips: fullCalculus.effectRows[0].declips
    },
    { initiates: [], terminates: [], clips: [], declips: [] }
  );
  const bindingEffect = fullCalculus.effectRows.find(
    (row) => row.sourceEvent.eventId === boundaryEvents[0].eventId
  );
  assert.notEqual(bindingEffect, undefined);
  assert.equal(bindingEffect.initiates.length, 1);
  assert.equal(
    bindingEffect.initiates[0].name,
    "public_operation_artifact_available"
  );
  assert.equal(
    outcome.emittedEvents[0].scopeRef,
    fixture.rawRequest.workspaceAuthorityRef
  );
  assert.equal(
    outcome.emittedEvents[0].scopeDigest,
    fixture.rawRequest.workspaceAuthorityDigest
  );
  const replay = derivePublicOperationArtifactReplayProjection({
    events: runtimeEvents,
    scopeRef: fixture.rawRequest.workspaceAuthorityRef,
    scopeDigest: fixture.rawRequest.workspaceAuthorityDigest
  });
  assert.equal(
    holdsAt(
      replay,
      constructRuntimeFluent({
        name: "public_operation_artifact_available",
        scope: "public_operation",
        constraintRef: fixture.rawRequest.workspaceAuthorityRef,
        ref: binding.bindingId
      })
    ),
    true
  );
});

test("T-281 project.read reloads Rule-B replay truth and exposes only the T-275 gap", async () => {
  const family = await exactFamily();
  const bound = await bindWorkspaceFixture(family);
  const eventBytes = new TextEncoder().encode(
    bound.runtimeEvents.map((event) => JSON.stringify(event)).join("\n") + "\n"
  );
  const source = Object.freeze({
    kind: "WorkspaceBinding",
    sourceRef: bound.binding.bindingId,
    sourceDigest: bound.binding.bindingDigest
  });
  const selector = Object.freeze({});
  const projectionBasis = deriveProjectReadProjectionBasis({
    kind: "project_read_projection_basis",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "workspace_status"
    },
    source,
    selector
  });
  const request = {
    kind: "project_read_request",
    caseKey: "workspace_status",
    source,
    projectionBasis,
    selector
  };
  const definition = family["abg.operation.project.read"].workspace_status;
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request,
    workspaceBinding: {
      ref: bound.binding.bindingId,
      digest: bound.binding.bindingDigest
    }
  });
  const handler = bindPrivateWorkspaceStatusProjectReadHandler(family);
  await assert.rejects(
    handler.execute({
      packet,
      context: boundContext(bound, eventBytes),
      candidateProjection: {}
    }),
    /expected exact keys packet/u,
    "public invocation cannot supply its own projection"
  );
  const outcome = await handler.execute({
    packet,
    context: boundContext(bound, eventBytes)
  });
  assert.equal(outcome.kind, "owner_handler_result", JSON.stringify(outcome));
  assert.equal(outcome.value.projection.readiness, "ready");
  assert.equal(outcome.value.projection.binding.ref, bound.binding.bindingId);
  assert.ok(outcome.value.projection.provenanceRefs.includes(
    bound.boundaryEvents[0].eventId
  ));
  assert.deepEqual(outcome.emittedEvents, []);

  const replayed = await handler.execute({
    packet,
    context: boundContext(bound, new Uint8Array(eventBytes))
  });
  assert.deepEqual(replayed, outcome, "second replay must derive the same read model");

  const stale = await handler.execute({
    packet,
    context: boundContext(bound, new Uint8Array())
  });
  assert.equal(stale.kind, "owner_handler_result", JSON.stringify(stale));
  assert.equal(stale.value.projection.readiness, "stale");
  assert.ok(stale.value.projection.residualRefs.some(
    (ref) => ref.includes("artifact-boundary-not-admitted")
  ));

  const mismatchSource = Object.freeze({
    ...request.source,
    sourceDigest: digest("wrong-binding")
  });
  const mismatchRequest = Object.freeze({
    ...request,
    source: mismatchSource,
    projectionBasis: deriveProjectReadProjectionBasis({
      kind: "project_read_projection_basis",
      definitionKey: definition.definitionKey,
      source: mismatchSource,
      selector
    })
  });
  const mismatch = await handler.execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition,
      request: mismatchRequest,
      workspaceBinding: {
        ref: bound.binding.bindingId,
        digest: bound.binding.bindingDigest
      }
    }),
    context: boundContext(bound, eventBytes)
  });
  assert.equal(mismatch.kind, "owner_handler_refusal");
  assert.equal(mismatch.value.code, "projection_basis_mismatch");

  const pending = bindPrivateTicketConsensusProjectReadGap(family).execute();
  assert.deepEqual(pending, {
    kind: "handler_semantic_not_realized",
    gapCode: "ticket_consensus_handler_pending_t275",
    coordinate: {
      definitionKey: family["abg.operation.project.read"].ticket_consensus.definitionKey,
      slot: "result"
    },
    ownerTicket: "T-275",
    evidenceRefs: [
      ".ai-workspace/tickets/active/T-275-realize-consensus-profile-and-ticket-result-contracts.md"
    ]
  });
});

test("T-281 catalog.view derives an admitted empty session view without events", async () => {
  const family = await exactFamily();
  const context = boundContext(
    await bindWorkspaceFixture(family),
    new Uint8Array()
  );
  const admittedCatalog = admitBoundWorkspaceCatalog({
    kind: "bound_catalog_admission_batch",
    workspaceId: context.binding.workspaceId,
    bindingId: context.binding.bindingId,
    catalogId: "catalog://t281/steel-thread",
    resolvedLockRef: context.binding.resolvedLockId,
    systemDeclarations: [],
    orderedProductBatches: [],
    causationEventRefs: [],
    correlationId: "correlation://t281/catalog"
  }, () => {});
  assert.equal(admittedCatalog.accepted, true);
  assert.notEqual(admittedCatalog.basis, null);

  const definition = family["abg.operation.catalog.view"].allowlist;
  const baseProgram = Object.freeze({
    ref: "gtl-program://t281/base",
    digest: digest("t281-catalog-view-base-program"),
    memberEntryRefs: Object.freeze([
      "catalog-entry://t281/base-member"
    ])
  });
  const outcome = await bindPrivateCatalogViewHandler(family).execute({
    packet: admitT281PrivateP1Packet({
      family,
      definition,
      request: { allowlist: [] },
      workspaceBinding: {
        ref: context.binding.bindingId,
        digest: context.binding.bindingDigest
      },
      productSet: {
        ref: `product-set:${context.binding.productSetDigest}`,
        digest: context.binding.productSetDigest
      },
      dependencyLock: {
        ref: context.binding.resolvedLockId,
        digest: context.binding.resolvedLockDigest
      }
    }),
    context,
    catalogBasis: admittedCatalog.basis,
    baseProgram
  });
  assert.equal(outcome.kind, "owner_handler_result", JSON.stringify(outcome));
  assert.equal("executionProgram" in outcome.value, false);
  assert.deepEqual(outcome.value.effectiveHandles, []);
  assert.deepEqual(outcome.value.residuals, []);
  assert.deepEqual(outcome.value.applicationCandidates, []);
  assert.deepEqual(outcome.emittedEvents, []);

  await assert.rejects(
    bindPrivateCatalogViewHandler(family).execute({
      packet: admitT281PrivateP1Packet({
        family,
        definition,
        request: { allowlist: [] },
        workspaceBinding: {
          ref: "workspace-binding://t281/other",
          digest: digest("catalog-view-other-workspace-binding")
        },
        productSet: {
          ref: `product-set:${context.binding.productSetDigest}`,
          digest: context.binding.productSetDigest
        },
        dependencyLock: {
          ref: context.binding.resolvedLockId,
          digest: context.binding.resolvedLockDigest
        }
      }),
      context,
      catalogBasis: admittedCatalog.basis,
      baseProgram
    }),
    /catalog\.view authority differs/
  );
});

test("T-281 result.assess refuses fixture-authored result authority", async () => {
  const family = await exactFamily();
  const bound = await bindWorkspaceFixture(family);
  const dispatch = fpDispatchRequest({
    selectedResultContractRef: "contract://t281/result-artifact"
  });
  const assessmentContract = {
    ref: dispatch.selectedResultContractRef,
    digest: digest("result-artifact-contract")
  };
  const assessment = resultAssessmentPayload(dispatch, {
    assessment_contract: assessmentContract
  });
  const ownerRequest = admitPublicResultAssessmentRequest(assessment);
  const authorityEvents = resultContractAuthorityReplay({
    priorEvents: bound.runtimeEvents,
    request: ownerRequest,
    contract: assessmentContract
  });
  const admittedEvidence = authorityEvents.find(
    (event) =>
      event.kind === "evidence_admitted" &&
      event.evidenceRef === "proof://runtime"
  );
  assert.notEqual(admittedEvidence, undefined);
  const rawRequest = {
    runtimeResultRef: dispatch.resultRef,
    runtimeResultDigest: stableSha256Digest(ownerRequest.artifact),
    assessmentContractRef: assessmentContract.ref,
    assessmentContractDigest: assessmentContract.digest,
    assessment,
    evidenceRefs: [admittedEvidence.eventId]
  };
  const sinkEvents = [];
  const definition = family["abg.operation.result.assess"].assess;
  const packet = admitT281PrivateP1Packet({
    family,
    definition,
    request: rawRequest,
    actorRef: "actor://t281/assessor",
    workspaceBinding: {
      ref: bound.binding.bindingId,
      digest: bound.binding.bindingDigest
    },
    causationEventRefs: [bound.boundaryEvents[0].eventId],
    priorEvents: authorityEvents
  });
  const admission = admitPrivatePublicOperationEvent({
    witness: packet.witness,
    priorEvents: authorityEvents,
    eventSink(event) {
      sinkEvents.push(event);
    }
  });
  const handler = bindPrivateResultAssessHandler(family);
  const outcome = handler.execute({
    packet,
    priorEvents: authorityEvents,
    admission
  });
  assert.equal(outcome.kind, "owner_handler_refusal", JSON.stringify(outcome));
  assert.equal(outcome.value.code, "result_missing");
  assert.match(outcome.value.message, /T-271 C-call relation/u);
  assert.deepEqual(outcome.emittedEvents, []);
  assert.equal(sinkEvents[0], admission.event);
  assert.deepEqual(sinkEvents, [admission.event]);
});
