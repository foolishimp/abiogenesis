import {
  constructCapabilityGrant,
  constructInvocationAuthority,
  constructPublicContractCatalog,
  constructPublicInvocation,
  definitionKeySchemaFor,
  publicContractCatalogCoordinate
} from "../../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  admitPrivateP1PublicOperationPacket
} from "../../../build/semantic/code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import {
  projectPublishedPublicOperationDefinitionFromPrivate
} from "../../../build/semantic/code/src/app/m04/public_contracts/operation_publication.js";
import {
  stableSha256Digest
} from "../../../build/semantic/code/src/shared/runtime_identity.js";

function exactSlot(requirement, admitted) {
  return requirement === "forbidden" ? { state: "forbidden" } : admitted;
}

function catalogSlot(requirement, seed) {
  if (requirement.kind !== "fixed") {
    throw new TypeError("T-281 owner fixture requires a fixed catalog slot");
  }
  return exactSlot(requirement.requirement, {
    state: "admitted_catalog_scope",
    viewRef: `catalog-view:${seed}`,
    viewDigest: stableSha256Digest({ catalogView: seed }),
    allowlistRef: `catalog-allowlist:${seed}`,
    allowlistDigest: stableSha256Digest({ catalogAllowlist: seed })
  });
}

export function constructT281PrivateP1Invocation(input) {
  const definition = input.definition;
  const publishedDefinition =
    projectPublishedPublicOperationDefinitionFromPrivate(definition);
  const seed = definition.definitionDigest;
  const coordinates = [
    definition.requestContract.contract.schemaCoordinate,
    definition.resultContract.contract.schemaCoordinate,
    definition.refusalContract.contract.schemaCoordinate
  ];
  const nonterminal = definition.nonTerminalContract === null
    ? null
    : definition.nonTerminalContract.contract.schemaCoordinate;
  if (nonterminal !== null) {
    coordinates.push(nonterminal);
  }
  const contractCatalog = input.contractCatalogCoordinate ??
    publicContractCatalogCoordinate(
      constructPublicContractCatalog({
        catalogId: `abg.catalog.t281-owner.${seed.slice(-12)}`,
        catalogVersion: "5.0.0",
        rows: coordinates
      })
    );
  const definitionKeySchema = definitionKeySchemaFor(
    definition.definitionKey
  );
  const actorRef = input.actorRef ?? `actor:${seed}`;
  const authorityBasisRef = `authority-basis:${seed}`;
  const authorityBasisDigest = stableSha256Digest({
    definitionKey: definition.definitionKey,
    request: input.request
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
      scopeDigest: stableSha256Digest({ capabilityId, seed }),
      authorityBasisRef,
      authorityBasisDigest
    })
  );
  const requirements = definition.authoritySlotRequirements;
  const requestDigest = stableSha256Digest(input.request);
  const workspace = exactSlot(requirements.workspace, {
    state: "admitted_workspace",
    bindingRef: input.workspaceBinding?.ref ?? `workspace-binding:${seed}`,
    bindingDigest: input.workspaceBinding?.digest ??
      stableSha256Digest({ workspaceBinding: seed })
  });
  const slots = {
    actor: exactSlot(requirements.actor, {
      state: "admitted_actor",
      actorRef,
      attributionRef: `attribution:${seed}`,
      attributionDigest: stableSha256Digest({ actorRef })
    }),
    workspace,
    productSet: exactSlot(requirements.productSet, {
      state: "admitted_product_set",
      productSetRef: input.productSet?.ref ?? `product-set:${seed}`,
      productSetDigest: input.productSet?.digest ??
        stableSha256Digest({ productSet: seed })
    }),
    dependencyLock: exactSlot(requirements.dependencyLock, {
      state: "admitted_dependency_lock",
      lockRef: input.dependencyLock?.ref ?? `dependency-lock:${seed}`,
      lockDigest: input.dependencyLock?.digest ??
        stableSha256Digest({ dependencyLock: seed })
    }),
    catalogScope: catalogSlot(requirements.catalogScope, seed),
    executionProgram: exactSlot(requirements.executionProgram, {
      state: "admitted_execution_program",
      selectionState: "program_constraints_only",
      admittedGtlProgramRef: `gtl-program:${seed}`,
      admittedGtlProgramDigest: stableSha256Digest({ program: seed })
    }),
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
  const expectedAuthority = {
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
    expected: expectedAuthority,
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
      nonTerminalContract: nonterminal,
      authority: expectedAuthority
    },
    basis: {
      kind: "public_invocation",
      invocationRef: `public-invocation:${seed}:${requestDigest}`,
      definitionKey: definition.definitionKey,
      definitionDigest: publishedDefinition.definitionDigest,
      contractCatalog,
      authority,
      requestContract: definition.requestContract.contract.schemaCoordinate,
      requestRef: `request:${requestDigest}`,
      requestDigest,
      request: input.request,
      expectedResultContract:
        definition.resultContract.contract.schemaCoordinate,
      expectedRefusalContract:
        definition.refusalContract.contract.schemaCoordinate,
      expectedNonTerminalContract: nonterminal,
      correlationRef: `correlation:${seed}:${requestDigest}`,
      provenanceRefs: []
    }
  });
  return invocation;
}

export function admitT281PrivateP1Packet(input) {
  return admitPrivateP1PublicOperationPacket({
    family: input.family,
    definition: input.definition,
    rawInvocation: constructT281PrivateP1Invocation(input),
    causationEventRefs: input.causationEventRefs ?? [],
    priorEvents: input.priorEvents ?? []
  });
}
