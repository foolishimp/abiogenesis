import * as Effect from "effect/Effect";

import { projectExactPrefixArtifactTruth } from
  "../abg/artifact_truth.js";
import {
  commitFhInteractionResponseAtExpectedPrefix,
  prepareContinuationPublicOperation,
  prepareFhInteractionResponse,
  projectFhInteractionSemanticBasisAtPrefix,
} from "../abg/continuation.js";
import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
  type AcquiredAbgEventResource,
} from "../abg/definition_event_resource.js";
import { hasAdmittedProductInstall } from
  "../abg/environment_admission.js";
import { deriveRuntimeEventCalculusProjection } from
  "../abg/event_calculus.js";
import { rehydrateExecutionBasisAtPrefix } from
  "../abg/execution_basis.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type RuntimeEvent,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from
  "../abg/event_prefix.js";
import { projectFhContinuations } from
  "../abg/fh_continuation_projection.js";
import { rehydrateInvocationAdmissionAtPrefix } from
  "../abg/invocation_admission.js";
import { projectRunSemanticReplayProjection } from "../abg/replay.js";
import type { ModulePublication } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  definitionFault,
  exactDefinitionCallMatches,
  hasExactKeys,
  isDefinitionFault,
  isRecord,
  reference,
  sameCoordinate,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  DefinitionReturn,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import type {
  OwnerRefusalOf,
  OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import type { ReferenceDigest } from "../shared/public_invocation.js";
import {
  productInstallCoordinate,
  type ProductInstall,
} from "./environment.js";
import { INTERACTION_OPERATION_CONTRACTS } from
  "./interaction_operation_contracts.js";
import { modulePublicationSemanticDigest } from "./publication.js";
import {
  evaluateInstalledInteractionResponse,
  loadInstalledProductSemantics,
} from "./semantics.js";

type InteractionResponseKind =
  keyof typeof INTERACTION_OPERATION_CONTRACTS.respond;
type InteractionPacket<K extends InteractionResponseKind> =
  (typeof INTERACTION_OPERATION_CONTRACTS.respond)[K];
type InteractionRefusalCode<K extends InteractionResponseKind> =
  OwnerRefusalOf<InteractionPacket<K>>["code"];

const CORRECTION_DISPOSITIONS = Object.freeze([
  "repair",
  "inspect_runtime_archive",
  "reprice",
  "escalate",
] as const);

export interface InteractionResponseResourceAssertion {
  readonly kind: "interaction_response_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceAssertion;
  readonly productInstall: ProductInstall;
  readonly publication: Readonly<ModulePublication>;
}

export interface InteractionResponseResourceReceipt {
  readonly kind: "interaction_response_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
  readonly productInstall: ReferenceDigest<"InstalledProduct">;
  readonly publication: ReferenceDigest<"ModulePublication">;
  readonly responseContract: ReferenceDigest<"ResponseContract">;
  readonly executionBasis: ReferenceDigest<"ExecutionBasis">;
}

function packet<K extends InteractionResponseKind>(
  responseKind: K,
): InteractionPacket<K> {
  return INTERACTION_OPERATION_CONTRACTS.respond[responseKind];
}

function fault<K extends InteractionResponseKind>(
  call: DefinitionCall<InteractionPacket<K>, unknown>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<InteractionPacket<K>["definitionKey"]> {
  return definitionFault(call.invocation.definitionKey, stage, code, message);
}

function publicationCoordinate(
  publication: Readonly<ModulePublication>,
): ReferenceDigest<"ModulePublication"> {
  return reference(
    publication.moduleRef,
    modulePublicationSemanticDigest(publication),
  );
}

function validateResourceShape<K extends InteractionResponseKind>(
  call: DefinitionCall<InteractionPacket<K>, InteractionResponseResourceAssertion>,
): DefinitionExecutionFault<InteractionPacket<K>["definitionKey"]> | null {
  const resources: unknown = call.resources;
  if (
    !isRecord(resources) ||
    !hasExactKeys(resources, [
      "eventResource",
      "kind",
      "productInstall",
      "publication",
      "schemaVersion",
    ]) ||
    resources.kind !== "interaction_response_resource_assertion" ||
    resources.schemaVersion !== "5.0.0" ||
    !isRecord(resources.productInstall) ||
    !isRecord(resources.publication) ||
    !sameJson(resources, resources)
  ) {
    return fault(
      call,
      "resource_admission",
      "invalid_resource_assertion",
      "interaction response requires exact Product publication, install, and ABG-prefix resources",
    );
  }
  try {
    productInstallCoordinate(call.resources.productInstall);
    publicationCoordinate(call.resources.publication);
  } catch (cause) {
    return fault(
      call,
      "resource_admission",
      "invalid_product_resource",
      String(cause),
    );
  }
  return null;
}

function resourceReceipt(
  resources: InteractionResponseResourceAssertion,
  eventResource: AbgEventResourceReceipt,
  responseContract: ReferenceDigest,
  executionBasis: ReferenceDigest,
): InteractionResponseResourceReceipt {
  return deepFreeze({
    kind: "interaction_response_resource_receipt" as const,
    schemaVersion: "5.0.0" as const,
    eventResource,
    productInstall: productInstallCoordinate(resources.productInstall),
    publication: publicationCoordinate(resources.publication),
    responseContract: { ...responseContract },
    executionBasis: { ...executionBasis },
  });
}

function ownerRefusal<K extends InteractionResponseKind>(
  responseKind: K,
  code: InteractionRefusalCode<K>,
  issuePaths: readonly string[],
  evidenceRefs: readonly string[],
): OwnerSemanticOutput<InteractionPacket<K>> {
  return validatedOwnerOutput(packet(responseKind), {
    outcomeKind: "refusal",
    value: { code, issuePaths, evidenceRefs },
  } as OwnerSemanticOutput<InteractionPacket<K>>, "Product interaction response");
}

function refusalReturn<K extends InteractionResponseKind>(
  call: DefinitionCall<
    InteractionPacket<K>,
    InteractionResponseResourceAssertion
  >,
  responseKind: K,
  resource: AcquiredAbgEventResource,
  code: InteractionRefusalCode<K>,
  issuePaths: readonly string[],
): DefinitionReturn<InteractionPacket<K>, InteractionResponseResourceReceipt> {
  return deepFreeze({
    ownerOutput: ownerRefusal(
      responseKind,
      code,
      issuePaths,
      call.invocation.request.evidence.map((row) => row.ref),
    ),
    resources: resourceReceipt(
      call.resources,
      closeAbgEventResource(resource, resource.entryPrefix),
      call.invocation.request.responseContract,
      call.invocation.request.currentBasis,
    ),
  });
}

function declaredChoiceRefs(
  requestValue: Readonly<Record<string, JsonValue>>,
): readonly string[] {
  const value = requestValue.declaredChoiceRefs;
  return Array.isArray(value) &&
      value.every((item) => typeof item === "string" && item.length > 0) &&
      new Set(value).size === value.length
    ? value as readonly string[]
    : [];
}

function eventCoordinate(
  event: RuntimeEvent,
): ReferenceDigest<"RuntimeEvent"> {
  return reference(
    event.eventId,
    sha256Canonical(event as unknown as JsonValue),
  );
}

async function respond<K extends InteractionResponseKind>(
  call: DefinitionCall<
    InteractionPacket<K>,
    InteractionResponseResourceAssertion
  >,
  responseKind: K,
): Promise<DefinitionReturn<
  InteractionPacket<K>,
  InteractionResponseResourceReceipt
>> {
  const invalidResources = validateResourceShape(call);
  if (invalidResources !== null) throw invalidResources;
  if (!exactDefinitionCallMatches(call, packet(responseKind))) {
    throw fault(
      call,
      "resource_admission",
      "call_identity_mismatch",
      "interaction response call differs from its fixed definition, contracts, request digest, or authority topology",
    );
  }
  const acquired = acquireAbgEventResource(call.resources.eventResource);
  if (acquired.kind !== "acquired_abg_event_resource") {
    throw fault(
      call,
      "resource_acquisition",
      acquired.code,
      acquired.message,
    );
  }
  const resource = acquired.resource;
  let closed = false;
  try {
    const request = call.invocation.request;
    if (
      call.invocation.definitionKey.memberKey !== responseKind ||
      request.responseKind !== responseKind
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "kind_mismatch",
        ["/responseKind"],
      );
    }
    const prefix = selectValidatedRuntimeEventPrefix(
      readRuntimeEventsAtDurablePrefix(resource.entryPrefix),
    );
    let continuations;
    try {
      continuations = projectFhContinuations(
        prefix,
        deriveRuntimeEventCalculusProjection(prefix),
      );
    } catch {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/currentBasis"],
      );
    }
    const referenceMatches = continuations.filter((candidate) =>
      candidate.requestRef === request.interaction.ref
    );
    if (referenceMatches.length === 0) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "missing_interaction",
        ["/interaction"],
      );
    }
    const interactionMatches = referenceMatches.filter((candidate) =>
      candidate.requestDigest === request.interaction.digest
    );
    if (interactionMatches.length !== 1) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/interaction"],
      );
    }
    const continuation = interactionMatches[0]!;
    if (continuation.status !== "open") {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "resolved_interaction",
        ["/interaction"],
      );
    }
    if (
      continuation.responseContractRef !== request.responseContract.ref
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "contract_mismatch",
        ["/responseContract"],
      );
    }
    const interactionBasis = projectFhInteractionSemanticBasisAtPrefix(
      prefix,
      continuation,
    );
    if (interactionBasis === null) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/interaction"],
      );
    }
    const choices = declaredChoiceRefs(interactionBasis.requestValue);
    if (
      responseKind === "select"
        ? request.choice === null || !choices.includes(request.choice.ref)
        : request.choice !== null
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "choice_mismatch",
        ["/choice"],
      );
    }

    const events = readRuntimeEventsAtDurablePrefix(resource.entryPrefix);
    const opened = events.find((event) =>
      event.eventId === continuation.openedEventRef
    );
    const openedPayload = opened !== undefined && isRecord(opened.payload)
      ? opened.payload
      : null;
    const executionBasisRef = openedPayload?.executionBasisRef;
    const executionBasis = typeof executionBasisRef === "string"
      ? rehydrateExecutionBasisAtPrefix(prefix, executionBasisRef)
      : null;
    const rootInvocation = executionBasis === null
      ? null
      : rehydrateInvocationAdmissionAtPrefix(
        prefix,
        executionBasis.invocationAdmissionRef,
      );
    const authority = call.invocation.invocationAuthority.slots;
    const actor = authority.actor;
    const installCoordinate = productInstallCoordinate(
      call.resources.productInstall,
    );
    const artifactTruth = projectExactPrefixArtifactTruth(resource.entryPrefix);
    const publication = call.resources.publication;
    const installed = call.resources.productInstall;
    const publicationPrograms = publication.programs.filter((program) =>
      program.programRef === rootInvocation?.programRef
    );
    const contractRows = publication.contracts.filter((contract) =>
      contract.contractRef === request.responseContract.ref
    );
    const declaredResponseContract = contractRows.length === 1
      ? reference(
        contractRows[0]!.contractRef,
        sha256Canonical(contractRows[0]! as unknown as JsonValue),
      )
      : null;
    const hasExactInstall = artifactTruth.kind ===
        "exact_prefix_artifact_truth_projection" &&
      hasAdmittedProductInstall(artifactTruth, installed);
    const productSet = authority.product_set;
    const capabilityAuthority = authority.capability_grants;
    const requiredCapabilities = packet(responseKind).metadata.capabilityRefs;
    const hasRootGrant = rootInvocation?.capabilityGrants.some((grant) =>
      grant.actorRef === rootInvocation.actorRef &&
      grant.operationId === "abg.operation.interaction.respond" &&
      grant.capabilityRef === continuation.actorCapabilityRef &&
      rootInvocation.capabilityGrantRefs.includes(grant.grantRef)
    ) ?? false;
    if (
      executionBasis === null ||
      rootInvocation === null ||
      openedPayload === null ||
      openedPayload.productId !== installed.productId ||
      openedPayload.productContentDigest !== installed.productContentDigest ||
      openedPayload.manifestDigest !== installed.manifestDigest ||
      openedPayload.installId !== installed.installId ||
      !sameCoordinate(request.currentBasis, {
        ref: executionBasis.basisRef,
        digest: executionBasis.basisDigest,
      }) ||
      authority.execution_basis === null ||
      !sameCoordinate(authority.execution_basis, request.currentBasis) ||
      authority.workspace_binding === null ||
      !sameCoordinate(authority.workspace_binding, {
        ref: executionBasis.workspaceBindingId,
        digest: executionBasis.workspaceBindingDigest,
      }) ||
      authority.dependency_lock === null ||
      productSet === null ||
      !productSet.some((coordinate) =>
        sameCoordinate(coordinate, installCoordinate)
      ) ||
      actor === null ||
      actor.actor.ref !== rootInvocation.actorRef ||
      capabilityAuthority === null ||
      !sameJson(
        capabilityAuthority.requiredCapabilityRefs,
        requiredCapabilities,
      ) ||
      !hasRootGrant ||
      !hasExactInstall ||
      publication.owningProductId !== installed.productId ||
      publication.artifactDigest !== installed.artifactDigest ||
      publication.productContentDigest !== installed.productContentDigest ||
      publication.productManifestDigest !== installed.manifestDigest ||
      publication.productSemanticsBinding.packageName !==
        installed.packageName ||
      publication.productSemanticsBinding.packageVersion !==
        installed.packageVersion ||
      publicationPrograms.length !== 1 ||
      sha256Canonical(publicationPrograms[0]! as unknown as JsonValue) !==
        rootInvocation.programDigest
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        hasRootGrant ? "basis_mismatch" : "capability_mismatch",
        [hasRootGrant ? "/currentBasis" : "/interaction"],
      );
    }
    if (
      declaredResponseContract === null ||
      !sameCoordinate(declaredResponseContract, request.responseContract)
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "contract_mismatch",
        ["/responseContract"],
      );
    }

    const invocationCoordinate = constructExactOperationInvocationCoordinate(
      {
        operationId: "abg.operation.interaction.respond",
        memberKey: responseKind,
        definitionDigest: call.invocation.definitionDigest,
      },
      call.invocation.invocationRef,
      call.invocation.requestDigest,
    );
    const operationBasis = deepFreeze({
      ...invocationCoordinate,
      operationId: "abg.operation.interaction.respond" as const,
      authorityScopeRef: executionBasis.workspaceBindingId,
      authorityScopeDigest: executionBasis.workspaceBindingDigest,
      correlationId: call.invocation.correlationRef,
      eventTime: call.invocation.eventTime,
      causationEventRefs: [] as const,
    });
    let preparedOperation;
    try {
      preparedOperation = prepareContinuationPublicOperation(
        prefix,
        rootInvocation,
        "abg.operation.interaction.respond",
        continuation,
        responseKind,
        actor.actor.ref,
        continuation.actorCapabilityRef,
        operationBasis,
      );
    } catch {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "capability_mismatch",
        ["/interaction"],
      );
    }
    if (preparedOperation.kind !== "prepared_continuation_public_operation") {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/currentBasis"],
      );
    }

    const semantics = await loadInstalledProductSemantics({
      install: installed,
      publication,
      verifyInstallAdmission: (candidate) =>
        sameJson(candidate, installed) &&
        artifactTruth.kind === "exact_prefix_artifact_truth_projection" &&
        hasAdmittedProductInstall(artifactTruth, candidate),
    });
    const evaluated = evaluateInstalledInteractionResponse(
      semantics,
      {
        ...interactionBasis,
        actingActorRef: preparedOperation.operation.actorRef,
      },
      request.value,
    );
    if (evaluated === null) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "value_mismatch",
        ["/value"],
      );
    }
    const correctionDisposition = evaluated.correctionDisposition;
    if (
      correctionDisposition !== undefined &&
      (
        responseKind !== "answer_escalation" ||
        !CORRECTION_DISPOSITIONS.includes(
          correctionDisposition as typeof CORRECTION_DISPOSITIONS[number],
        )
      )
    ) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "kind_mismatch",
        ["/responseKind", "/value/correctionDisposition"],
      );
    }
    const responseBasis = deepFreeze({
      eventTime: call.invocation.eventTime,
      correlationId: call.invocation.correlationRef,
      causationEventRefs: [] as const,
    });
    let preparedResponse;
    try {
      preparedResponse = prepareFhInteractionResponse(
        preparedOperation,
        continuation,
        continuation.responseContractRef,
        evaluated,
        responseBasis,
      );
    } catch {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/currentBasis"],
      );
    }
    const projectedContinuations = projectFhContinuations(
      preparedResponse.projectedPrefix,
      deriveRuntimeEventCalculusProjection(preparedResponse.projectedPrefix),
    );
    const projected = projectedContinuations.find((candidate) =>
      candidate.continuationRef === continuation.continuationRef
    );
    if (projected?.status !== "responded") {
      throw fault(
        call,
        "owner_projection",
        "response_projection_failure",
        "prepared F_H response did not project one responded continuation",
      );
    }
    const replay = projectRunSemanticReplayProjection(
      preparedResponse.projectedPrefix,
      continuation.runId,
    );
    const responseEvent = eventCoordinate(preparedResponse.event);
    const ownerOutput = validatedOwnerOutput(packet(responseKind), {
      outcomeKind: "nonterminal",
      value: {
        disposition: "responded",
        responseKind,
        responseEvent,
        interaction: {
          kind: "fh_interaction_projection",
          interactionRef: request.interaction.ref,
          interactionBasisDigest: request.interaction.digest,
          status: "responded",
          graphCallId: projected.graphCallId,
          continuationRef: projected.continuationRef,
          responseContractRef: projected.responseContractRef,
          eligibleOperationIds: [responseKind],
          resumeEligibleOperationIds: ["current_intent"],
          declaredChoiceRefs: choices,
          requiredCapabilityRefs: requiredCapabilities,
          responseRef: preparedResponse.response.responseRef,
          eventRefs: [
            projected.openedEventRef,
            preparedOperation.operation.admissionEventRef,
            preparedResponse.response.admissionEventRef,
          ],
          replayRefs: [replay.viewRef],
        },
        run: reference(projected.runId, replay.viewDigest),
        continuation: reference(
          projected.continuationRef,
          projected.continuationDigest,
        ),
        evidence: request.evidence,
      },
    } as OwnerSemanticOutput<InteractionPacket<K>>, "Product interaction response");

    const committed = commitFhInteractionResponseAtExpectedPrefix(
      resource.store,
      resource.entryPrefix,
      rootInvocation,
      continuation,
      responseKind,
      actor.actor.ref,
      continuation.actorCapabilityRef,
      operationBasis,
      continuation.responseContractRef,
      evaluated,
      responseBasis,
    );
    if (!("successorPrefix" in committed)) {
      closed = true;
      return refusalReturn(
        call,
        responseKind,
        resource,
        "basis_mismatch",
        ["/currentBasis"],
      );
    }
    const eventReceipt = closeAbgEventResource(
      resource,
      committed.successorPrefix,
    );
    closed = true;
    return deepFreeze({
      ownerOutput,
      resources: resourceReceipt(
        call.resources,
        eventReceipt,
        request.responseContract,
        request.currentBasis,
      ),
    });
  } finally {
    if (!closed) abandonAbgEventResource(resource);
  }
}

export const InteractionResponsePort = Object.freeze({ respond });

function binding<K extends InteractionResponseKind>(
  responseKind: K,
): ExactDefinitionCallable<
  InteractionPacket<K>,
  InteractionResponseResourceAssertion,
  InteractionResponseResourceReceipt
> {
  return (call) => Effect.tryPromise({
    try: () => InteractionResponsePort.respond(call, responseKind),
    catch: (cause): DefinitionExecutionFault<
      InteractionPacket<K>["definitionKey"]
    > => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<
        InteractionPacket<K>["definitionKey"]
      >
      : fault(
        call,
        "owner_execution",
        "interaction_response_execution_failure",
        String(cause),
      ),
  });
}

export const INTERACTION_DEFINITION_BINDINGS = Object.freeze({
  respond: Object.freeze({
    select: binding("select"),
    approve: binding("approve"),
    reject: binding("reject"),
    assess: binding("assess"),
    answer_escalation: binding("answer_escalation"),
  }),
});
