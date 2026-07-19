import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  assertRuntimeEvent
} from "../../build/semantic/code/src/abg/m03/contracts/event_admission.js";
import {
  assertPrivatePublicOperationIngressAdmissionWitness
} from "../../build/semantic/code/src/abg/m03/contracts/private_public_operation_ingress.js";
import {
  admitPrivatePublicOperationEvent,
  admitPrivatePublicOperationIngressWitness,
  admitPublicOperationAttribution,
  emitPrivatePublicOperationArtifactBoundary,
  emitPrivatePublicOperationOwnerEvents
} from "../../build/semantic/code/src/abg/m03/runner/public_operation_admission.js";
import {
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicContractCatalog,
  constructPublicInvocation,
  definitionKeySchemaFor,
  projectPublicInvocationContractIdentity,
  publicContractCatalogCoordinate
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitPrivateP1PublicOperationIngress
} from "../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "../../build/semantic/code/src/app/m04/public_contracts/operation_publication.js";
import {
  publishedPublicOperationDefinitionDigest
} from "../../build/semantic/code/src/app/m04/public_sdk/carrier_admission.js";

const DIGEST = stableSha256Digest({ fixture: "private-p2-public-ingress" });

function allDefinitions(family) {
  return Object.values(family).flatMap((operation) =>
    Object.values(operation)
  );
}

function authoritySlots(definition, actorRef, authorityBasis) {
  const requirements = definition.authoritySlotRequirements;
  return {
    actor: requirements.actor === "forbidden"
      ? { state: "forbidden" }
      : {
          state: "admitted_actor",
          actorRef,
          attributionRef: `attribution:${definition.definitionDigest}`,
          attributionDigest: stableSha256Digest({ actorRef })
        },
    workspace: requirements.workspace === "forbidden"
      ? { state: "forbidden" }
      : {
          state: "admitted_workspace",
          bindingRef: `workspace-binding:${definition.definitionDigest}`,
          bindingDigest: stableSha256Digest({
            key: definition.definitionKey,
            authorityBasis
          })
        }
  };
}

function reissueWitness(witness, causationEventRefs, priorEvents) {
  return admitPrivatePublicOperationIngressWitness({
    definitionKey: witness.definitionKey,
    definitionDigest: witness.definitionDigest,
    eventAdmission: witness.eventAdmission,
    invocationRef: witness.invocationRef,
    invocationDigest: witness.invocationDigest,
    invocationAuthorityRef: witness.invocationAuthorityRef,
    invocationAuthorityDigest: witness.invocationAuthorityDigest,
    authorityBasisRef: witness.authorityBasisRef,
    authorityBasisDigest: witness.authorityBasisDigest,
    actorAttribution: witness.actorAttribution,
    workspaceBindingRequirement: witness.workspaceBindingRequirement,
    workspaceBindingWitness: witness.workspaceBindingWitness,
    causationEventRefs,
    correlationId: witness.correlationId,
    priorEvents
  });
}

function exactSlot(requirement, admitted) {
  return requirement === "forbidden" ? { state: "forbidden" } : admitted;
}

function fixedCatalogSlot(requirement, admitted) {
  assert.equal(requirement.kind, "fixed");
  return exactSlot(requirement.requirement, admitted);
}

function constructP1Invocation(admitted, definition, request) {
  const seed = definition.definitionDigest;
  const publishedDefinition =
    projectPublishedPublicOperationDefinitionFromPrivate(definition);
  const contractCoordinates = [
    definition.requestContract.contract.schemaCoordinate,
    definition.resultContract.contract.schemaCoordinate,
    definition.refusalContract.contract.schemaCoordinate
  ];
  const nonterminalCoordinate = definition.nonTerminalContract === null
    ? null
    : definition.nonTerminalContract.contract.schemaCoordinate;
  if (nonterminalCoordinate !== null) {
    contractCoordinates.push(nonterminalCoordinate);
  }
  const contractCatalog = publicContractCatalogCoordinate(
    constructPublicContractCatalog({
      catalogId: `abg.catalog.private-p2.${seed.slice(-12)}`,
      catalogVersion: "5.0.0",
      rows: contractCoordinates
    })
  );
  const definitionKeySchema = definitionKeySchemaFor(
    definition.definitionKey
  );
  const actorRef = `actor:${seed}`;
  const authorityBasisRef = `authority-basis:${seed}`;
  const authorityBasisDigest = stableSha256Digest({
    familyDigest: admitted.familyDigest,
    definitionKey: definition.definitionKey
  });
  const capabilityGrants = definition.capabilityRefs.map(
    (capabilityId, index) => constructCapabilityGrant({
      capabilityId,
      capabilityDefinitionRef: `capability-definition:${seed}:${index}`,
      capabilityDefinitionDigest: stableSha256Digest({ capabilityId }),
      actorRef,
      approvalRef: `approval:${seed}:${index}`,
      policyRef: `policy:${seed}:${index}`,
      scopeRef: `scope:${seed}:${index}`,
      scopeDigest: stableSha256Digest({ capabilityId, scope: seed }),
      authorityBasisRef,
      authorityBasisDigest
    })
  );
  const requirements = definition.authoritySlotRequirements;
  const requestDigest = stableSha256Digest(request);
  const slots = {
    actor: exactSlot(requirements.actor, {
      state: "admitted_actor",
      actorRef,
      attributionRef: `attribution:${seed}`,
      attributionDigest: stableSha256Digest({ actorRef })
    }),
    workspace: exactSlot(requirements.workspace, {
      state: "admitted_workspace",
      bindingRef: `workspace-binding:${seed}`,
      bindingDigest: stableSha256Digest({ binding: seed })
    }),
    productSet: exactSlot(requirements.productSet, {
      state: "admitted_product_set",
      productSetRef: `product-set:${seed}`,
      productSetDigest: stableSha256Digest({ productSet: seed })
    }),
    dependencyLock: exactSlot(requirements.dependencyLock, {
      state: "admitted_dependency_lock",
      lockRef: `dependency-lock:${seed}`,
      lockDigest: stableSha256Digest({ dependencyLock: seed })
    }),
    catalogScope: fixedCatalogSlot(requirements.catalogScope, {
      state: "admitted_catalog_scope",
      viewRef: `catalog-view:${seed}`,
      viewDigest: stableSha256Digest({ catalogView: seed }),
      allowlistRef: `catalog-allowlist:${seed}`,
      allowlistDigest: stableSha256Digest({ catalogAllowlist: seed })
    }),
    executionProgram: exactSlot(
      requirements.executionProgram,
      definition.definitionKey.operationId === "abg.operation.run.invoke" &&
        definition.definitionKey.variant === "invoke"
        ? {
            state: "admitted_execution_program",
            selectionState: "selected_graph_function",
            admittedGtlProgramRef: `gtl-program:${seed}`,
            admittedGtlProgramDigest: stableSha256Digest({ program: seed }),
            canonicalHandle: `catalog-entry:${seed}`,
            inputContract: definition.requestContract.contract.schemaCoordinate,
            inputPayloadRef: `input-payload:${seed}`,
            inputPayloadDigest: requestDigest
          }
        : {
            state: "admitted_execution_program",
            selectionState: "program_constraints_only",
            admittedGtlProgramRef: `gtl-program:${seed}`,
            admittedGtlProgramDigest: stableSha256Digest({ program: seed })
          }
    ),
    invocationPolicy: exactSlot(requirements.invocationPolicy, {
      state: "admitted_invocation_policy",
      policyRef: `invocation-policy:${seed}`,
      policyDigest: stableSha256Digest({ invocationPolicy: seed }),
      sessionPolicyRef: `session-policy:${seed}`,
      sessionPolicyDigest: stableSha256Digest({ sessionPolicy: seed })
    }),
    transportSteering: exactSlot(requirements.transportSteering, {
      state: "declared_transport_steering",
      steeringRef: `transport-steering:${seed}`,
      steeringDigest: stableSha256Digest({ transportSteering: seed }),
      provenanceRefs: []
    })
  };
  const authorityExpectation = {
    definitionKey: definition.definitionKey,
    definitionDigest: publishedDefinition.definitionDigest,
    contractCatalog,
    requiredGrantCapabilityIds: definition.capabilityRefs,
    slotStates: Object.fromEntries(
      Object.entries(slots).map(([slot, value]) => [slot, value.state])
    )
  };
  const authority = constructInvocationAuthority({
    definitionKeySchema,
    expected: authorityExpectation,
    basis: {
      authorityBasisRef,
      authorityBasisDigest,
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog,
      capabilityGrants,
      ...slots
    }
  });
  const invocation = constructPublicInvocation({
    definitionKeySchema,
    requestSchema: definition.requestContract.contract.schema,
    expected: {
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      resultContract: definition.resultContract.contract.schemaCoordinate,
      refusalContract: definition.refusalContract.contract.schemaCoordinate,
      nonTerminalContract: nonterminalCoordinate,
      authority: authorityExpectation
    },
    basis: {
      kind: "public_invocation",
      invocationRef: `public-invocation:${seed}`,
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog,
      authority,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      requestRef: `request:${seed}`,
      requestDigest,
      request,
      expectedResultContract:
        definition.resultContract.contract.schemaCoordinate,
      expectedRefusalContract:
        definition.refusalContract.contract.schemaCoordinate,
      expectedNonTerminalContract: nonterminalCoordinate,
      correlationRef: `correlation:${seed}`,
      provenanceRefs: []
    }
  });
  return { authority, invocation };
}

function installedInvocationContractIdentity(coordinate) {
  if (coordinate === null) return null;
  return {
    contractId: coordinate.contractId,
    contractVersion: coordinate.contractVersion,
    contractDigest: coordinate.contractDigest,
    schemaId: coordinate.schemaId,
    schemaVersion: coordinate.schemaVersion,
    schemaDigest: coordinate.schemaDigest
  };
}

function resealInvocation(invocation, contracts) {
  const basis = {
    ...JSON.parse(JSON.stringify(invocation)),
    requestContract: installedInvocationContractIdentity(contracts.request),
    expectedResultContract:
      installedInvocationContractIdentity(contracts.result),
    expectedRefusalContract:
      installedInvocationContractIdentity(contracts.refusal),
    expectedNonTerminalContract:
      installedInvocationContractIdentity(contracts.nonterminal)
  };
  delete basis.invocationDigest;
  return {
    ...basis,
    invocationDigest: stableSha256Digest(basis)
  };
}

test("generic public-operation admission covers exact event-bearing P1 members and leaves pure definitions event-free", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const definitions = allDefinitions(admitted.family);
  assert.equal(definitions.length, 62);
  const eligible = definitions.filter(
    (definition) =>
      definition.eventAdmission === "owning_semantic_authority"
  );
  const eventFree = definitions.filter(
    (definition) => definition.eventAdmission === "none"
  );
  const artifactBoundaries = definitions.filter(
    (definition) =>
      definition.eventAdmission === "immutable_artifact_boundary"
  );
  assert.equal(eligible.length, 20);
  assert.equal(eventFree.length, 32);
  assert.equal(artifactBoundaries.length, 10);
  const witnesses = [];
  const events = [];
  const receipts = [];

  for (const definition of definitions) {
    const slots = authoritySlots(
      definition,
      `actor:${definition.definitionDigest}`,
      admitted.familyDigest
    );
    const witness = admitPrivatePublicOperationIngressWitness({
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      eventAdmission: definition.eventAdmission,
      invocationRef: `invocation:${definition.definitionDigest}`,
      invocationDigest: stableSha256Digest({
        definitionKey: definition.definitionKey,
        kind: "invocation"
      }),
      invocationAuthorityRef:
        `invocation-authority:${definition.definitionDigest}`,
      invocationAuthorityDigest: stableSha256Digest({
        definitionKey: definition.definitionKey,
        kind: "authority"
      }),
      authorityBasisRef: `authority-basis:${definition.definitionDigest}`,
      authorityBasisDigest: stableSha256Digest({
        definitionKey: definition.definitionKey,
        kind: "basis"
      }),
      actorAttribution: slots.actor,
      workspaceBindingRequirement: definition.workspaceBindingRequirement,
      workspaceBindingWitness: slots.workspace,
      causationEventRefs: [],
      correlationId: `correlation:${definition.definitionDigest}`,
      priorEvents: []
    });
    witnesses.push(witness);
    assert.deepEqual(witness.definitionKey, definition.definitionKey);
    assert.equal(witness.kind, "private_public_operation_ingress_admitted");
    if (definition.eventAdmission === "none") {
      const eventCount = events.length;
      assert.throws(
        () => admitPrivatePublicOperationEvent({
          witness,
          priorEvents: [],
          eventSink: (event) => events.push(event)
        }),
        /declares no runtime event admission/u
      );
      assert.equal(events.length, eventCount);
      continue;
    }
    const receipt = admitPrivatePublicOperationEvent({
      witness,
      priorEvents: [],
      eventSink: (event) => events.push(event)
    });
    receipts.push({
      receipt,
      eventAdmission: definition.eventAdmission
    });
    assert.deepEqual(receipt.event.definitionKey, definition.definitionKey);
    assert.equal(receipt.event.definitionDigest, definition.definitionDigest);
    assert.equal(
      receipt.event.scopeRef === null,
      definition.workspaceBindingRequirement === "forbidden"
    );
    assert.equal(Object.hasOwn(receipt.event, "catalogId"), false);
    assert.equal(Object.hasOwn(receipt.event, "bindingId"), false);
    assert.equal(Object.hasOwn(witness, "operationId"), false);
    assert.equal(Object.hasOwn(witness, "eventId"), false);
    assert.equal(Object.hasOwn(witness, "eventAdmissionOrdinal"), false);
  }

  assert.equal(witnesses.length, 62);
  assert.equal(receipts.length, 30);
  assert.equal(events.length, 30);
  assert.equal(
    new Set(
      receipts.map(({ receipt }) => JSON.stringify(receipt.event.definitionKey))
    ).size,
    30
  );

  const actorEvent = events.find((event) => event.actorRef !== null);
  assert.notEqual(actorEvent, undefined);
  assert.throws(
    () => assertRuntimeEvent({ ...actorEvent, actorAttributionDigest: null }),
    /actor attribution must be wholly present or wholly null/u
  );
  assert.throws(
    () => assertRuntimeEvent({ ...actorEvent, catalogId: "catalog:forbidden" }),
    /unexpected field "catalogId"/u
  );
  const boundEvent = events.find((event) => event.scopeRef !== null);
  assert.notEqual(boundEvent, undefined);
  assert.throws(
    () => assertRuntimeEvent({
      ...boundEvent,
      scopeRef: null,
      scopeDigest: null
    }),
    /scope must match the exact workspace-binding requirement/u
  );

  const prior = events[0];
  const eventWitness = witnesses.find(
    (witness) => witness.eventAdmission !== "none"
  );
  assert.notEqual(eventWitness, undefined);
  const causedEvents = [];
  const caused = admitPrivatePublicOperationEvent({
    witness: reissueWitness(eventWitness, [prior.eventId], [prior]),
    priorEvents: [prior],
    eventSink: (event) => causedEvents.push(event)
  });
  assert.equal(caused.event.eventAdmissionOrdinal, prior.eventAdmissionOrdinal + 1);
  assert.deepEqual(caused.event.causationEventRefs, [prior.eventId]);
  assert.deepEqual(causedEvents, [caused.event]);

  const owningReceipt = receipts.find(
    ({ eventAdmission }) => eventAdmission === "owning_semantic_authority"
  )?.receipt;
  const artifactReceipt = receipts.find(
    ({ eventAdmission }) => eventAdmission === "immutable_artifact_boundary"
  )?.receipt;
  assert.notEqual(owningReceipt, undefined);
  assert.notEqual(artifactReceipt, undefined);
  const [ownerEvent] = emitPrivatePublicOperationOwnerEvents({
    admission: owningReceipt,
    events: {
      kind: "fd_advance_ready",
      basisId: "basis:private-p2",
      graphFunctionId: "gtl://private-p2/owner-event",
      status: "ready"
    }
  });
  assert.equal(
    ownerEvent.eventAdmissionOrdinal,
    owningReceipt.event.eventAdmissionOrdinal + 1
  );
  assert.throws(
    () => emitPrivatePublicOperationOwnerEvents({
      admission: artifactReceipt,
      events: {
        kind: "fd_advance_ready",
        basisId: "basis:private-p2:artifact-route",
        graphFunctionId: "gtl://private-p2/artifact-route",
        status: "ready"
      }
    }),
    /require owning_semantic_authority admission/u
  );
  assert.throws(
    () => emitPrivatePublicOperationArtifactBoundary({
      admission: owningReceipt,
      scopeRef: "workspace://private-p2",
      scopeDigest: DIGEST,
      disposition: "materialized",
      artifactRef: "artifact://private-p2/forbidden",
      artifactDigest: DIGEST
    }),
    /requires immutable_artifact_boundary admission/u
  );
  const boundaryEvent = emitPrivatePublicOperationArtifactBoundary({
    admission: artifactReceipt,
    scopeRef: "workspace://private-p2",
    scopeDigest: DIGEST,
    disposition: "materialized",
    artifactRef: "artifact://private-p2/admitted",
    artifactDigest: DIGEST
  });
  assert.equal(boundaryEvent.kind, "public_operation_artifact_admitted");
  assert.equal(
    boundaryEvent.eventAdmissionOrdinal,
    artifactReceipt.event.eventAdmissionOrdinal + 1
  );
  assert.throws(
    () => emitPrivatePublicOperationArtifactBoundary({
      admission: artifactReceipt,
      scopeRef: "workspace://private-p2",
      scopeDigest: DIGEST,
      disposition: "materialized",
      artifactRef: "artifact://private-p2/admitted",
      artifactDigest: DIGEST
    }),
    /admits exactly one event per invocation/u
  );
  assert.throws(
    () => emitPrivatePublicOperationOwnerEvents({
      admission: { ...owningReceipt },
      events: {
        kind: "fd_advance_ready",
        basisId: "basis:forged",
        graphFunctionId: "gtl://private-p2/forged",
        status: "ready"
      }
    }),
    /require an emitted admission receipt/u
  );
  assert.throws(
    () => admitPrivatePublicOperationEvent({
      witness: reissueWitness(eventWitness, [], []),
      priorEvents: [{ ...prior, eventId: "runtime-event:duplicate" }, prior],
      eventSink: () => {}
    }),
    /ordinal collision/u
  );
});

test("private P1 ingress admits all exact definitions before applying their semantic event route", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const definitions = Object.values(
    admitted.family["abg.operation.project.read"]
  );
  assert.equal(definitions.length, 27);
  assert.equal(
    definitions.every((definition) => definition.eventAdmission === "none"),
    true
  );

  for (const definition of definitions) {
    assert.throws(
      () => admitPrivateP1PublicOperationIngress({
        family: admitted.family,
        definition,
        rawInvocation: null,
        causationEventRefs: [],
        priorEvents: []
      }),
      (error) => {
        assert.doesNotMatch(
          String(error),
          /definition declares no event admission/u
        );
        return true;
      }
    );
  }
});

test("private P1 adapter admits interaction and continuation consumers", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const cases = [
    {
      definition:
        admitted.family["abg.operation.interaction.respond"].approve,
      request: {
        kind: "interaction_respond_request",
        responseKind: "approve",
        interactionRef: "interaction:private-p2",
        interactionBasisDigest: DIGEST,
        responseContractRef: "contract:interaction-response",
        responseContractDigest: DIGEST,
        choiceRef: null,
        value: { approved: true },
        evidenceRefs: [],
        capabilityProvenanceRefs: []
      }
    },
    {
      definition:
        admitted.family["abg.operation.run.continue"].current_intent,
      request: {
        kind: "run_continue_request",
        variant: "current_intent",
        runRef: "run:private-p2",
        continuationRef: "continuation:private-p2",
        continuationDigest: DIGEST,
        currentIntentRef: "intent:private-p2",
        currentIntentDigest: DIGEST,
        continuationInputRef: "response:private-p2",
        continuationInputDigest: DIGEST,
        expectedExecutionBasisRef: "execution-basis:private-p2",
        expectedExecutionBasisDigest: DIGEST
      }
    }
  ];

  for (const fixture of cases) {
    const { authority, invocation } = constructP1Invocation(
      admitted,
      fixture.definition,
      fixture.request
    );
    const witness = admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition: fixture.definition,
      rawInvocation: invocation,
      causationEventRefs: [],
      priorEvents: []
    });
    assert.deepEqual(witness.definitionKey, fixture.definition.definitionKey);
    assert.deepEqual(witness.actorAttribution, authority.actor);
    assert.equal(witness.workspaceBindingRequirement, "exactly_one");
    assert.deepEqual(witness.workspaceBindingWitness, authority.workspace);
  }

  const definition = cases[0].definition;
  const { invocation } = constructP1Invocation(
    admitted,
    definition,
    cases[0].request
  );
  const clone = Object.freeze({ ...definition });
  assert.throws(
    () => admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition: clone,
      rawInvocation: invocation,
      causationEventRefs: [],
      priorEvents: []
    }),
    /definition is not owned by the admitted family/u
  );
});

test("private P1 ingress admits the published definition identity without private locators", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const definition = admitted.family["abg.operation.workspace.create"].clean;
  const operationAsset = JSON.parse(await readFile(new URL(
    "../../contracts/operations/workspace.create.json",
    import.meta.url
  ), "utf8"));
  const publishedDefinition = operationAsset.definitions.find(
    (candidate) =>
      candidate.definitionKey.memberKind === "variant" &&
      candidate.definitionKey.variant === "clean"
  );
  assert.notEqual(publishedDefinition, undefined);
  const candidateDefinition = {
    ...publishedDefinition,
    definitionDigest:
      publishedPublicOperationDefinitionDigest(publishedDefinition)
  };
  assert.equal(
    candidateDefinition.definitionDigest,
    projectPublishedPublicOperationDefinitionFromPrivate(definition)
      .definitionDigest
  );
  assert.notEqual(
    candidateDefinition.definitionDigest,
    definition.definitionDigest
  );

  const request = {
    targetRoot: "/tmp/abg-p2-installed-invocation",
    createPolicy: "clean",
    scaffoldPolicy: "no_scaffold"
  };
  const { invocation } = constructP1Invocation(
    admitted,
    definition,
    request
  );
  const sourceBlindInvocation = resealInvocation(
    invocation,
    candidateDefinition.schemaCoordinates
  );
  const witness = admitPrivateP1PublicOperationIngress({
    family: admitted.family,
    definition,
    rawInvocation: sourceBlindInvocation,
    causationEventRefs: [],
    priorEvents: []
  });
  assert.equal(witness.definitionDigest, candidateDefinition.definitionDigest);
  assert.deepEqual(
    sourceBlindInvocation.requestContract,
    projectPublicInvocationContractIdentity(
      candidateDefinition.schemaCoordinates.request
    )
  );
  assert.equal(
    Object.hasOwn(sourceBlindInvocation.requestContract, "nativeLocator"),
    false
  );
  assert.equal(
    Object.hasOwn(sourceBlindInvocation.requestContract, "assetLocator"),
    false
  );

  const tamperedDigest = stableSha256Digest({
    contract: "tampered-installed-request"
  });
  const tampered = JSON.parse(JSON.stringify(sourceBlindInvocation));
  tampered.requestContract.contractDigest = tamperedDigest;
  tampered.requestContract.schemaDigest = tamperedDigest;
  delete tampered.invocationDigest;
  tampered.invocationDigest = stableSha256Digest(tampered);
  assert.throws(
    () => admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition,
      rawInvocation: tampered,
      causationEventRefs: [],
      priorEvents: []
    }),
    /public invocation request contract: exact value mismatch/u
  );
});

test("private P1 adapter rejects binding and cross-member substitution", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const definition =
    admitted.family["abg.operation.run.continue"].current_intent;
  const request = {
    kind: "run_continue_request",
    variant: "current_intent",
    runRef: "run:private-p2-negative",
    continuationRef: "continuation:private-p2-negative",
    continuationDigest: DIGEST,
    currentIntentRef: "intent:private-p2-negative",
    currentIntentDigest: DIGEST,
    continuationInputRef: "response:private-p2-negative",
    continuationInputDigest: DIGEST,
    expectedExecutionBasisRef: "execution-basis:private-p2-negative",
    expectedExecutionBasisDigest: DIGEST
  };
  const { invocation } = constructP1Invocation(
    admitted,
    definition,
    request
  );
  const wrongBinding = JSON.parse(JSON.stringify(invocation));
  wrongBinding.authority.workspace = { state: "forbidden" };
  assert.throws(
    () => admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition,
      rawInvocation: wrongBinding,
      causationEventRefs: [],
      priorEvents: []
    }),
    /invocation authority\.workspace: state mismatch/u
  );

  const injectedSelection = JSON.parse(JSON.stringify(invocation));
  injectedSelection.authority.executionProgram = {
    state: "admitted_execution_program",
    selectionState: "selected_graph_function",
    admittedGtlProgramRef: invocation.authority.executionProgram.admittedGtlProgramRef,
    admittedGtlProgramDigest:
      invocation.authority.executionProgram.admittedGtlProgramDigest,
    canonicalHandle: "catalog-entry:forbidden-continuation-selection",
    inputContract: definition.requestContract.contract.schemaCoordinate,
    inputPayloadRef: "input-payload:forbidden-continuation-selection",
    inputPayloadDigest: stableSha256Digest(request)
  };
  assert.throws(
    () => admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition,
      rawInvocation: injectedSelection,
      causationEventRefs: [],
      priorEvents: []
    }),
    /execution-program state differs from operation variant/u
  );

  assert.throws(
    () => admitPrivateP1PublicOperationIngress({
      family: admitted.family,
      definition:
        admitted.family["abg.operation.run.continue"].selected_action,
      rawInvocation: invocation,
      causationEventRefs: [],
      priorEvents: []
    }),
    /Invalid type|definition key/u
  );
});

test("legacy attribution cannot substitute for exact P1 ingress", () => {
  const legacyEvents = [];
  const legacy = admitPublicOperationAttribution({
    operationId: "abg.operation.catalog.invoke",
    invocationId: "legacy-invocation",
    requestId: "legacy-request",
    actorRef: "actor:legacy",
    workspaceId: "workspace:legacy",
    bindingId: "binding:legacy",
    catalogId: "catalog:legacy",
    capabilityProvenanceRefs: [],
    causationEventRefs: [],
    correlationId: "correlation:legacy",
    priorEvents: [],
    eventSink: (event) => legacyEvents.push(event)
  });
  assertRuntimeEvent(legacy);
  assert.equal(legacyEvents.length, 1);

  assert.throws(
    () => assertPrivatePublicOperationIngressAdmissionWitness(legacy),
    /must contain exactly/u
  );
});
