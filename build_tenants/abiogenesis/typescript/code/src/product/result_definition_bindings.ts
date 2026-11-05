/**
 * The statically composed callable the route row `RESULT_DEFINITION_BINDINGS`
 * declares for `abg.operation.result.assess#assess`.
 *
 * The admission authority admits the call. This binding projects the admitted
 * Public truth onto the native result-assessment owner and returns the
 * declared result from the owner's. The owner keeps the semantic decision and
 * its one `assessed` append.
 *
 * Authority: the Public `capability_grant` that the admission authority
 * constructs for this member is the authority for the call. The owner-native
 * `result_assessment_capability_grant` is its projection: the same `actorRef`,
 * `operationId` and `capabilityRef` under the owner's content address. The
 * projection adds no slot and grants nothing the Public grant does not.
 */
import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  abandonAbgEventResource,
  abgEventResourceInputPrefix,
  abgEventResourceOutcomePrefix,
  acquireAbgEventResource,
  completeAbgEventResource,
  validateAbgEventResourceOutcome,
  validateReopenedAbgEventResourceInput,
  type AbgEventResourceOutcome,
  type AcquiredAbgEventResource,
  type ReopenedAbgEventResourceInput,
} from "../abg/definition_event_resource.js";
import type { ExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import {
  authenticateRuntimePrefixAncestry,
  selectHeldEventStoreDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { readOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventAtPrefixIndex, runtimeEventPrefixExtent } from "../abg/event_prefix.js";
import {
  definitionFault,
  isDefinitionFault,
  reference,
  sameJson,
  validatedOwnerOutput,
} from "../public/binding/definition_binding_mechanics.js";
import { bindStaticOwner } from "../public/binding/static_definition_bindings.js";
import { sha256Canonical } from "../shared/digests.js";
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OwnerSemanticOutput } from "../shared/public_function_contracts.js";

import {
  admissionAuthorityResourceStructure,
  withAdmissionAuthority,
  type AdmissionAuthorityResource,
} from "./admission_authority.js";
import { productInstallCoordinate } from "./environment.js";
import { RESULT_OPERATION_CONTRACTS } from "./interaction_operation_contracts.js";
import {
  assessResult,
  type ResultAssessmentCapabilityGrant,
  type ResultAssessmentInvocationAuthority,
  type ResultAssessmentRefusalCode,
} from "./result_assessment_operation.js";

type AssessPacket = typeof RESULT_OPERATION_CONTRACTS.assess;
type AssessOutput = OwnerSemanticOutput<AssessPacket>;
type DeclaredRefusalCode = Extract<AssessOutput, { outcomeKind: "refusal" }>["value"]["code"];

/** The owner-authored structural resource contract: one reopened event resource. */
export interface ResultAssessResourceAssertion {
  readonly kind: "result_assess_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenedAbgEventResourceInput;
  readonly admissionAuthority: AdmissionAuthorityResource;
}

export interface ResultAssessResourceReceipt {
  readonly kind: "result_assess_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceOutcome;
}

type AuthorizedResources = Omit<ResultAssessResourceAssertion, "admissionAuthority">;

const packet = RESULT_OPERATION_CONTRACTS.assess;
const assertionSchema = v.strictObject({
  kind: v.literal("result_assess_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<ReopenedAbgEventResourceInput>((value) =>
    validateReopenedAbgEventResourceInput(value),
  "one reopened ABG event resource"),
  // Lazy across the Product/ABG import cycle; withAdmissionAuthority
  // reconstructs and compares every complete grant before the owner runs.
  admissionAuthority: v.lazy(() => admissionAuthorityResourceStructure),
});
const typedAssertionSchema = assertionSchema as unknown as
  v.GenericSchema<ResultAssessResourceAssertion, ResultAssessResourceAssertion>;
const receiptSchema = v.strictObject({
  kind: v.literal("result_assess_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceOutcome>((value) =>
    validateAbgEventResourceOutcome(value),
  "owner-issued reopened ABG successor"),
});

/** Owner refusal code onto the declared reason: the identity over seven codes. */
const DECLARED_REFUSAL: Readonly<Record<ResultAssessmentRefusalCode, DeclaredRefusalCode>> = Object.freeze({
  basis_mismatch: "basis_mismatch",
  capability_mismatch: "capability_mismatch",
  contract_mismatch: "contract_mismatch",
  digest_mismatch: "digest_mismatch",
  evidence_mismatch: "evidence_mismatch",
  result_mismatch: "result_mismatch",
  value_mismatch: "value_mismatch",
});

function relationFault(message: string): DefinitionExecutionFault<AssessPacket["definitionKey"]> {
  return definitionFault(packet.definitionKey, "resource_admission", "resource_relation_mismatch", message);
}

/** The installed Product contract catalog row the request names, from the bound environment only. */
function installedAssessmentContract(
  environment: ExactPrefixWorkspaceEnvironment,
  coordinate: Readonly<{ ref: string; digest: string }>,
) {
  const rows = environment.productInstalls.flatMap((install) =>
    install.publicContracts.filter((row) => row.contractId === coordinate.ref));
  return rows.length === 1 && rows[0]!.contractDigest === coordinate.digest ? rows[0]! : null;
}

/** The owner-native grant: a projection of the admitted Public grant row. */
function nativeCapabilityGrant(
  grant: AdmissionAuthorityResource["grants"][number],
): ResultAssessmentCapabilityGrant {
  const body = {
    actorRef: grant.actorRef,
    operationId: grant.operationId,
    capabilityRef: grant.capabilityRef,
  };
  const grantDigest = sha256Canonical(body);
  return deepFreeze({
    kind: "result_assessment_capability_grant",
    schemaVersion: "5.0.0",
    grantRef: `capability-grant://abiogenesis/${grantDigest.slice("sha256:".length)}`,
    grantDigest,
    ...body,
  }) as ResultAssessmentCapabilityGrant;
}

/** The successor is the unchanged entry on refusal, or the entry plus the
 * owner's one `assessed` event naming the returned assessment. */
function assessTransitionCorresponds(
  entry: DurablePrefixCoordinate,
  successor: DurablePrefixCoordinate,
  assessment: Readonly<{ ref: string; digest: string }> | null,
): boolean {
  try {
    if (assessment === null) return successor.coordinateDigest === entry.coordinateDigest;
    if (!sameJson(entry.storeIdentity, successor.storeIdentity) ||
        !authenticateRuntimePrefixAncestry(entry, successor)) return false;
    // One-event increment over owned extents, then the exact final event.
    const before = runtimeEventPrefixExtent(readOwnedRuntimeEventPrefixAtDurablePrefix(entry)).count;
    const afterPrefix = readOwnedRuntimeEventPrefixAtDurablePrefix(successor);
    const afterCount = runtimeEventPrefixExtent(afterPrefix).count;
    const last = runtimeEventAtPrefixIndex(afterPrefix, afterCount - 1);
    const payload = last?.payload as Record<string, unknown> | undefined;
    return afterCount === before + 1 && last?.kind === "assessed" &&
      payload?.assessmentRef === assessment.ref && payload?.assessmentDigest === assessment.digest;
  } catch {
    return false;
  }
}

function assessOwner(
  call: DefinitionCall<AssessPacket, AuthorizedResources>,
  approved: AdmissionAuthorityResource,
  boundEnvironment: ExactPrefixWorkspaceEnvironment | null,
  heldResource: AcquiredAbgEventResource | null,
): ReturnType<ExactDefinitionCallable<AssessPacket, AuthorizedResources, ResultAssessResourceReceipt>> {
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
        const actor = slots.actor?.actor;
        const environment = boundEnvironment;
        const request = invocation.request;
        const grant = approved.grants.length === 1 ? approved.grants[0]! : null;
        if (environment?.kind !== "exact_prefix_workspace_environment" ||
            !sameJson(environment.prefix, resource.entryPrefix) ||
            !sameJson(slots.workspace_binding, reference(environment.workspaceBinding.bindingId,
              environment.workspaceBinding.bindingDigest)) ||
            actor === undefined || actor.ref !== environment.workspaceAuthorityBasis.authorizedActorRef ||
            actor.ref !== approved.authority.actorRef ||
            !sameJson(slots.execution_basis, request.currentBasis) ||
            !sameJson(slots.product_set, environment.productInstalls.map(productInstallCoordinate)) ||
            !sameJson(slots.dependency_lock, reference(environment.resolvedProductLock.lockId,
              environment.resolvedProductLock.lockDigest)) ||
            grant === null || grant.actorRef !== actor.ref ||
            grant.operationId !== packet.definitionKey.operationId ||
            !packet.metadata.capabilityRefs.includes(grant.capabilityRef) ||
            !sameJson(grant.operationContract.contractCatalog, invocation.contractCatalog)) {
          throw relationFault(
            "result assessment requires the approved exact acquired environment, actor, basis, grant and installed contract");
        }
        // The assessment contract body is the bound environment's installed
        // catalog row the request names, never a caller-supplied body.
        const assessmentContract = installedAssessmentContract(environment, request.assessmentContract);
        let ownerOutput: AssessOutput;
        let assessment: Readonly<{ ref: string; digest: string }> | null = null;
        if (assessmentContract === null) {
          ownerOutput = { outcomeKind: "refusal",
            value: { code: "contract_mismatch", issuePaths: ["/assessmentContract"], evidenceRefs: [] } };
        } else {
          const actorCoordinate = { ref: actor.ref, digest: sha256Canonical({ actorRef: actor.ref }) };
          const authorityBody = {
            invocationRef: invocation.invocationRef,
            invocationDigest: invocation.invocationDigest,
            actor: actorCoordinate,
            capabilityGrant: nativeCapabilityGrant(grant),
            currentBasis: request.currentBasis,
          };
          const authorityDigest = sha256Canonical(authorityBody);
          const invocationAuthority: ResultAssessmentInvocationAuthority = {
            kind: "result_assessment_invocation_authority",
            schemaVersion: "5.0.0",
            authorityRef: `result-assessment-authority://abiogenesis/${authorityDigest.slice("sha256:".length)}`,
            authorityDigest,
            ...authorityBody,
          };
          const native = assessResult({
            kind: "result_assess_packet",
            schemaVersion: "5.0.0",
            memberKey: "assess",
            expectedResult: request.expectedResult,
            assessmentContract: request.assessmentContract,
            assessment: request.assessment,
            evidence: request.evidence,
            currentBasis: request.currentBasis,
          }, {
            store: resource.store,
            predecessorPrefix: resource.entryPrefix,
            assessmentContract,
            invocationAuthority,
            eventTime: invocation.eventTime,
            correlationId: invocation.correlationRef,
            causationEventRefs: [environment.workspaceBinding.admissionEventRef],
          });
          if (native.kind === "result_assessment_refusal") {
            ownerOutput = { outcomeKind: "refusal", value: {
              code: DECLARED_REFUSAL[native.code],
              issuePaths: [...native.issuePaths],
              evidenceRefs: [...native.evidenceRefs],
            } };
          } else {
            assessment = native.assessment;
            const value = {
              assessment: native.assessment,
              closureEligible: native.closureEligible,
              residuals: [...native.residuals],
              evidence: [...native.evidence],
            };
            ownerOutput = native.kind === "result_assess_result"
              ? { outcomeKind: "result", value: { ...value, disposition: native.disposition } }
              : { outcomeKind: "nonterminal", value: { ...value, disposition: native.disposition, closureEligible: false } };
          }
        }
        const successor = selectHeldEventStoreDurablePrefix(resource.store);
        if (!assessTransitionCorresponds(resource.entryPrefix, successor, assessment)) {
          throw definitionFault(packet.definitionKey, "receipt_admission", "invalid_resource_receipt",
            "result assessment returned neither its unchanged entry nor exactly its one admitted assessment");
        }
        const eventResource = completeAbgEventResource(resource, successor);
        if (eventResource.entryPrefix.coordinateDigest !== abgEventResourceInputPrefix(call.resources.eventResource).coordinateDigest ||
            abgEventResourceOutcomePrefix(eventResource).coordinateDigest !== successor.coordinateDigest) {
          throw definitionFault(packet.definitionKey, "receipt_admission", "invalid_resource_receipt",
            "result assessment close differs from its checked transition");
        }
        return deepFreeze({
          ownerOutput: validatedOwnerOutput(packet, ownerOutput, "result assessment"),
          resources: { kind: "result_assess_resource_receipt" as const, schemaVersion: "5.0.0" as const, eventResource },
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<AssessPacket["definitionKey"]>
      : definitionFault(packet.definitionKey, "owner_execution", "result_assess_execution_failure", String(cause)),
  });
}

const assess: ExactDefinitionCallable<AssessPacket, ResultAssessResourceAssertion, ResultAssessResourceReceipt> =
  (call) => withAdmissionAuthority(packet,
    (authorized: DefinitionCall<AssessPacket, AuthorizedResources>, environment, resource) =>
      assessOwner(authorized, call.resources.admissionAuthority, environment, resource))(call);

/** The one declared member; no wildcard result grant. */
export const RESULT_DEFINITION_BINDINGS = Object.freeze({
  assess: bindStaticOwner(packet, assess, typedAssertionSchema, receiptSchema),
});
