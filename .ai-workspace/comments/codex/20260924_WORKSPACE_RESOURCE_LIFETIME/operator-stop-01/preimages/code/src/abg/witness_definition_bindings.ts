import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  admissionAuthorityResourceStructure,
  withAdmissionAuthority,
  type AdmissionAuthorityResource,
} from "../product/admission_authority.js";
import { productInstallCoordinate } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  definitionFault,
  isDefinitionFault,
  reference,
  sameJson,
  validatedOwnerOutput,
} from "../shared/definition_binding_mechanics.js";
import { sha256Canonical } from "../shared/digests.js";
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from
  "../shared/operation_definition_coordinate.js";
import type { OwnerSemanticOutput } from "../shared/public_function_contracts.js";
import { bindStaticOwner } from "../shared/static_definition_bindings.js";
import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  completeAbgEventResource,
  abgEventResourceInputPrefix,
  abgEventResourceOutcomePrefix,
  validateReopenedAbgEventResourceInput,
  validateAbgEventResourceOutcome,
  type ReopenedAbgEventResourceInput,
  type AbgEventResourceOutcome,
} from "./definition_event_resource.js";
import { authenticateRuntimePrefixAncestry, projectRootEventProfileSchedule, readRuntimeEventsAtDurablePrefix,
  LEGACY_ROOT_EVENT_CONTRACT_DIGEST, ROOT_EVENT_CONTRACT_DIGEST, type DurablePrefixCoordinate } from "./event_store.js";
import { ROOT_EVENT_PROFILE_DECLARATION_REF } from "./event_contract_profiles.js";
import {
  admitWitnessedAct,
  type WitnessAdmitPacket,
  type WitnessAdmissionAuthority,
  type WitnessAdmissionRefusal,
} from "./witness_admission_operation.js";
import { WITNESS_OPERATION_CONTRACTS } from "./witness_operation_contracts.js";

type RepricePacket = typeof WITNESS_OPERATION_CONTRACTS.admit.reprice;
type ReopenAssertion = ReopenedAbgEventResourceInput;

/** The fixed owner consumes serialized acquisition or an actual native selection. */
export interface WitnessRepriceResourceAssertion {
  readonly kind: "witness_reprice_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenAssertion;
  readonly admissionAuthority: AdmissionAuthorityResource;
}

interface OrdinaryWitnessRepriceResourceReceipt {
  readonly kind: "witness_reprice_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceOutcome;
}
export type WitnessRepriceResourceReceipt = OrdinaryWitnessRepriceResourceReceipt | Readonly<{
  kind: "witness_profile_reprice_resource_receipt";
  schemaVersion: "5.0.0";
  eventResource: AbgEventResourceOutcome;
  boundaryEventRef: string;
}>;

type AuthorizedResources = Omit<WitnessRepriceResourceAssertion, "admissionAuthority">;
const packet = WITNESS_OPERATION_CONTRACTS.admit.reprice;
const assertionSchema = v.strictObject({
  kind: v.literal("witness_reprice_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<ReopenAssertion>((value) =>
    validateReopenedAbgEventResourceInput(value),
  "one reopened ABG event resource"),
  // Keep the shared schema lazy across the existing Product/ABG import cycle;
  // complete shape and semantic grant reconstruction remain in the fixed owner.
  admissionAuthority: v.lazy(() => admissionAuthorityResourceStructure),
});
// The shared wire schema admits I-JSON grant preimages. withAdmissionAuthority
// reconstructs and compares every complete grant before repriceOwner sees it.
const typedAssertionSchema = assertionSchema as unknown as
  v.GenericSchema<WitnessRepriceResourceAssertion, WitnessRepriceResourceAssertion>;
const ordinaryReceiptSchema = v.strictObject({
  kind: v.literal("witness_reprice_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceOutcome>((value) =>
    validateAbgEventResourceOutcome(value),
  "owner-issued reopened ABG successor"),
});
const receiptSchema = v.union([
  ordinaryReceiptSchema,
  v.strictObject({
    kind: v.literal("witness_profile_reprice_resource_receipt"),
    schemaVersion: v.literal("5.0.0"),
    eventResource: v.custom<AbgEventResourceOutcome>(value =>
      validateAbgEventResourceOutcome(value)),
    boundaryEventRef: v.string(),
  }),
]);

export function witnessRepriceResourcesCorrespond(
  assertion: WitnessRepriceResourceAssertion,
  receipt: WitnessRepriceResourceReceipt,
  content: unknown,
): boolean {
  try {
    if (!receiptCoordinatesCorrespond(assertion.eventResource, receipt.eventResource)) return false;
    return witnessPrefixTransitionCorrespond(receipt.eventResource.entryPrefix, abgEventResourceOutcomePrefix(receipt.eventResource),
      receipt.kind === "witness_reprice_resource_receipt" ? null : receipt.boundaryEventRef, content);
  } catch { return false; }
}

function receiptCoordinatesCorrespond(assertion: ReopenAssertion, resource: AbgEventResourceOutcome): boolean {
  return validateReopenedAbgEventResourceInput(assertion) && validateAbgEventResourceOutcome(resource) &&
    resource.entryPrefix.coordinateDigest === abgEventResourceInputPrefix(assertion).coordinateDigest;
}

/** The same immutable transition relation serves live owner return and raw
 * correspondence. Only the live owner can avoid the ordinary cold ancestry. */
function witnessPrefixTransitionCorrespond(
  entry: DurablePrefixCoordinate, next: DurablePrefixCoordinate, boundaryEventRef: string | null, content: unknown,
): boolean {
  try {
    if (!authenticateRuntimePrefixAncestry(entry, next)) return false;
    if (boundaryEventRef === null) return sameJson(entry.storeIdentity, next.storeIdentity);
    const events = readRuntimeEventsAtDurablePrefix(next);
    const schedule = projectRootEventProfileSchedule(events);
    const boundary = events.at(-1), p = boundary?.payload as Record<string, unknown> | undefined;
    return entry.storeIdentity.eventContractDigest === LEGACY_ROOT_EVENT_CONTRACT_DIGEST &&
      next.storeIdentity.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST &&
      schedule.boundaryEventRef === boundaryEventRef && boundary?.eventId === boundaryEventRef &&
      p?.declarationRef === ROOT_EVENT_PROFILE_DECLARATION_REF && sameJson(p?.contentValue, content);
  } catch { return false; }
}

function refusalOutput(native: WitnessAdmissionRefusal<"reprice">): OwnerSemanticOutput<RepricePacket> {
  const mapping = {
    actor_missing: ["actor_mismatch", "/invocationAuthority/slots/actor"],
    subject_missing: ["subject_mismatch", "/subject"],
    act_forbidden: ["act_mismatch", "/act"],
    content_invalid: ["content_mismatch", "/content"],
    context_mismatch: ["context_mismatch", "/context"],
    evidence_invalid: ["evidence_mismatch", "/evidence"],
    provenance_invalid: ["provenance_mismatch", "/provenance"],
    basis_mismatch: ["basis_mismatch", "/invocationAuthority"],
    duplicate_invocation: ["basis_mismatch", "/invocationRef"],
  } as const;
  if (native.code === "sink_unavailable") {
    throw definitionFault(packet.definitionKey, "abg_admission", native.code, native.message);
  }
  const [code, issuePath] = mapping[native.code];
  return { outcomeKind: "refusal", value: { code, issuePaths: [issuePath], evidenceRefs: [] } };
}

function repriceOwner(
  call: DefinitionCall<RepricePacket, AuthorizedResources>,
  approved: AdmissionAuthorityResource,
  boundEnvironment: import("./environment_admission.js").ExactPrefixWorkspaceEnvironment | null,
  heldResource: import("./definition_event_resource.js").AcquiredAbgEventResource | null,
): ReturnType<ExactDefinitionCallable<RepricePacket, AuthorizedResources, WitnessRepriceResourceReceipt>> {
  return Effect.try({
    try: () => {
      const acquired = heldResource === null ? acquireAbgEventResource(call.resources.eventResource) :
        { kind: "acquired_abg_event_resource" as const, resource: heldResource };
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw definitionFault(packet.definitionKey, "resource_acquisition", acquired.code, acquired.message);
      }
      const resource = acquired.resource;
      try {
        const invocation = call.invocation;
        const slots = invocation.invocationAuthority.slots;
        const currentW = slots.workspace_binding;
        const actor = slots.actor?.actor;
        const environment = boundEnvironment;
        if (environment?.kind !== "exact_prefix_workspace_environment" ||
            !sameJson(environment.prefix, resource.entryPrefix) ||
            !sameJson(currentW, reference(environment.workspaceBinding.bindingId, environment.workspaceBinding.bindingDigest)) ||
            actor === undefined || actor.ref !== environment.workspaceAuthorityBasis.authorizedActorRef ||
            actor.ref !== approved.authority.actorRef || slots.execution_basis !== null ||
            !sameJson(slots.product_set, environment.productInstalls.map(productInstallCoordinate)) ||
            !sameJson(slots.dependency_lock, reference(environment.resolvedProductLock.lockId,
              environment.resolvedProductLock.lockDigest)) ||
            approved.grants.length !== 1 ||
            approved.grants.some((grant) => !sameJson(grant.operationContract.contractCatalog, invocation.contractCatalog))) {
          throw definitionFault(packet.definitionKey, "resource_admission", "resource_relation_mismatch",
            "witness reprice requires the approved exact acquired environment, actor, grants and installed contract");
        }
        const request = invocation.request;
        const contentDigest = sha256Canonical(request.content.value);
        const nativePacket: WitnessAdmitPacket<"reprice"> = {
          kind: "witness_admit_packet",
          schemaVersion: "5.0.0",
          memberKey: "reprice",
          prefix: resource.entryPrefix,
          actor,
          subject: { kind: request.subjectKind, ...request.subject },
          act: request.act,
          content: {
            ...request.content,
            valueRef: `witness-content://abiogenesis/${contentDigest.slice("sha256:".length)}`,
            valueDigest: contentDigest,
            // The native owner admits the closed content value and reports a
            // semantic content refusal; Public carries generic I-JSON here.
            value: request.content.value as Readonly<Record<string, JsonValue>>,
          },
          context: request.context,
          evidence: request.evidence,
          provenance: request.provenance,
        };
        const grant = approved.grants[0]!;
        const authority: WitnessAdmissionAuthority = {
          kind: "witness_admission_authority",
          schemaVersion: "5.0.0",
          operationBasis: {
            ...constructExactOperationInvocationCoordinate({
              operationId: packet.definitionKey.operationId,
              memberKey: packet.definitionKey.memberKey,
              definitionDigest: invocation.definitionDigest,
            }, invocation.invocationRef, invocation.requestDigest),
            operationId: "abg.operation.witness.admit",
            authorityScopeRef: environment.workspaceBinding.bindingId,
            authorityScopeDigest: environment.workspaceBinding.bindingDigest,
            correlationId: invocation.correlationRef,
            eventTime: invocation.eventTime,
            causationEventRefs: [environment.workspaceBinding.admissionEventRef],
          },
          predecessorPrefix: resource.entryPrefix,
          workspaceBinding: reference(environment.workspaceBinding.bindingId, environment.workspaceBinding.bindingDigest),
          productSet: reference(environment.productSet.productSetId, environment.productSet.productSetDigest),
          dependencyLock: reference(environment.resolvedProductLock.lockId, environment.resolvedProductLock.lockDigest),
          actor,
          capabilityGrant: reference(grant.grantRef, grant.grantDigest),
          executionBasis: null,
        };
        const native = admitWitnessedAct(nativePacket, authority, {
          kind: "witness_admission_dependencies",
          schemaVersion: "5.0.0",
          eventStore: resource.store,
        });
        let ownerOutput: OwnerSemanticOutput<RepricePacket>;
        if (native.kind === "witness_admission_refusal") {
          ownerOutput = refusalOutput(native);
        } else {
          const events = readRuntimeEventsAtDurablePrefix(native.successorPrefix);
          const matches = events.filter((event) => event.eventId === native.admittedEventRef);
          const event = matches[0];
          if (matches.length !== 1 || event?.kind !== "declaration_reprice_admitted") {
            throw definitionFault(packet.definitionKey, "abg_projection", "witness_event_projection_mismatch",
              "witness result must resolve one exact admitted reprice event");
          }
          // Runtime event identity hashes its admitted body, not only payload.
          const { eventId, ...eventBody } = event;
          ownerOutput = {
            outcomeKind: "result",
            value: {
              act: "reprice",
              witnessedAct: reference(native.witnessedActRef, native.witnessedActDigest),
              admittedEvent: reference(eventId, sha256Canonical(eventBody as unknown as JsonValue)),
              evidence: [...native.evidence],
            },
          };
        }
        // Check the immutable transition while its actual owner still holds the
        // admitted cuts. Close must then issue exactly that checked successor;
        // a successful close preserves the fact, never a live effect capability.
        const successor = native.successorPrefix ?? resource.entryPrefix;
        const changedProfile = resource.entryPrefix.storeIdentity.eventContractDigest !== successor.storeIdentity.eventContractDigest;
        const boundaryEventRef = changedProfile && native.kind === "witness_admission" ? native.admittedEventRef : null;
        if (!witnessPrefixTransitionCorrespond(resource.entryPrefix, successor, boundaryEventRef, request.content.value)) {
          throw definitionFault(packet.definitionKey, "receipt_admission", "invalid_resource_receipt",
            "witness reprice returned neither its exact ordinary prefix nor its authenticated L-to-P boundary");
        }
        const eventResource = completeAbgEventResource(resource, successor);
        if (!receiptCoordinatesCorrespond(call.resources.eventResource, eventResource) ||
            abgEventResourceOutcomePrefix(eventResource).coordinateDigest !== successor.coordinateDigest) {
          throw definitionFault(packet.definitionKey, "receipt_admission", "invalid_resource_receipt",
            "witness reprice close differs from its checked immutable transition");
        }
        const resources: WitnessRepriceResourceReceipt = boundaryEventRef !== null
          ? { kind: "witness_profile_reprice_resource_receipt", schemaVersion: "5.0.0",
              eventResource, boundaryEventRef }
          : { kind: "witness_reprice_resource_receipt", schemaVersion: "5.0.0", eventResource };
        return deepFreeze({
          ownerOutput: validatedOwnerOutput(packet, ownerOutput, "witness reprice"),
          resources,
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<RepricePacket["definitionKey"]>
      : definitionFault(packet.definitionKey, "owner_execution", "witness_reprice_execution_failure", String(cause)),
  });
}

const reprice: ExactDefinitionCallable<RepricePacket, WitnessRepriceResourceAssertion, WitnessRepriceResourceReceipt> =
  (call) => withAdmissionAuthority(packet,
    (authorized: DefinitionCall<RepricePacket, AuthorizedResources>, environment, resource) =>
      repriceOwner(authorized, call.resources.admissionAuthority, environment, resource))(call);

/** Only this already-declared member is selected; no wildcard witness grant. */
export const WITNESS_DEFINITION_BINDINGS = Object.freeze({
  admit: Object.freeze({
    reprice: bindStaticOwner(packet, reprice, typedAssertionSchema, receiptSchema),
  }),
});
