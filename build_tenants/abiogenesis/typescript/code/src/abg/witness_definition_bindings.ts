import * as Effect from "effect/Effect";
import * as v from "valibot";

import {
  ADMISSION_AUTHORITY_RESOURCE_SCHEMA,
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
import { bindExactPrefixTransition } from "../shared/static_definition_bindings.js";
import {
  abandonAbgEventResource,
  acquireAbgEventResource,
  closeAbgEventResource,
  validateAbgEventResourceAssertion,
  validateAbgEventResourceReceipt,
  type AbgEventResourceAssertion,
  type AbgEventResourceReceipt,
} from "./definition_event_resource.js";
import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { readRuntimeEventsAtDurablePrefix } from "./event_store.js";
import {
  admitWitnessedAct,
  type WitnessAdmitPacket,
  type WitnessAdmissionAuthority,
  type WitnessAdmissionRefusal,
} from "./witness_admission_operation.js";
import { WITNESS_OPERATION_CONTRACTS } from "./witness_operation_contracts.js";

type RepricePacket = typeof WITNESS_OPERATION_CONTRACTS.admit.reprice;
type ReopenAssertion = Extract<AbgEventResourceAssertion, { kind: "reopen_abg_event_resource" }>;

/** Data assertions only; the fixed owner acquires and closes its own store. */
export interface WitnessRepriceResourceAssertion {
  readonly kind: "witness_reprice_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenAssertion;
  readonly admissionAuthority: AdmissionAuthorityResource;
}

export interface WitnessRepriceResourceReceipt {
  readonly kind: "witness_reprice_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceReceipt;
}

type AuthorizedResources = Omit<WitnessRepriceResourceAssertion, "admissionAuthority">;
const packet = WITNESS_OPERATION_CONTRACTS.admit.reprice;
const assertionSchema = v.strictObject({
  kind: v.literal("witness_reprice_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<ReopenAssertion>((value) =>
    validateAbgEventResourceAssertion(value) && value.kind === "reopen_abg_event_resource",
  "one reopened ABG event resource"),
  // Keep the shared schema lazy across the existing Product/ABG import cycle;
  // the schema and exact grant reconstruction remain the same owners.
  admissionAuthority: v.lazy(() => ADMISSION_AUTHORITY_RESOURCE_SCHEMA),
});
// The shared wire schema admits I-JSON grant preimages. withAdmissionAuthority
// reconstructs and compares every complete grant before repriceOwner sees it.
const typedAssertionSchema = assertionSchema as unknown as
  v.GenericSchema<WitnessRepriceResourceAssertion, WitnessRepriceResourceAssertion>;
const receiptSchema = v.strictObject({
  kind: v.literal("witness_reprice_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceReceipt>((value) =>
    validateAbgEventResourceReceipt(value) && value.acquisitionKind === "reopen",
  "owner-issued reopened ABG successor"),
});

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
): ReturnType<ExactDefinitionCallable<RepricePacket, AuthorizedResources, WitnessRepriceResourceReceipt>> {
  return Effect.try({
    try: () => {
      const acquired = acquireAbgEventResource(call.resources.eventResource);
      if (acquired.kind !== "acquired_abg_event_resource") {
        throw definitionFault(packet.definitionKey, "resource_acquisition", acquired.code, acquired.message);
      }
      const resource = acquired.resource;
      try {
        const invocation = call.invocation;
        const slots = invocation.invocationAuthority.slots;
        const currentW = slots.workspace_binding;
        const actor = slots.actor?.actor;
        const environment = currentW === null ? null :
          projectExactPrefixWorkspaceEnvironment(resource.entryPrefix, currentW);
        if (environment?.kind !== "exact_prefix_workspace_environment" ||
            !sameJson(environment, approved.basis.boundEnvironment) ||
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
        return deepFreeze({
          ownerOutput: validatedOwnerOutput(packet, ownerOutput, "witness reprice"),
          resources: {
            kind: "witness_reprice_resource_receipt" as const,
            schemaVersion: "5.0.0" as const,
            eventResource: closeAbgEventResource(resource, native.successorPrefix ?? resource.entryPrefix),
          },
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
    (authorized: DefinitionCall<RepricePacket, AuthorizedResources>) =>
      repriceOwner(authorized, call.resources.admissionAuthority))(call);

/** Only this already-declared member is selected; no wildcard witness grant. */
export const WITNESS_DEFINITION_BINDINGS = Object.freeze({
  admit: Object.freeze({
    reprice: bindExactPrefixTransition(packet, reprice, typedAssertionSchema, receiptSchema),
  }),
});
