import type {
  LegacyPublicOperationAdmittedRuntimeEvent
} from "../../code/src/abg/m03/contracts/carriers.js";
import type {
  PrivatePublicOperationIngressAdmissionWitness
} from "../../code/src/abg/m03/contracts/private_public_operation_ingress.js";
import {
  admitPrivateP1PublicOperationIngress,
  admitPrivateP1PublicOperationPacket,
  assertAdmittedPrivateP1PublicOperationPacket
} from "../../code/src/app/m04/public_contracts/private_public_operation_ingress.js";
import type {
  PrivatePublicOperationDefinitionFamily
} from "../../code/src/app/m04/public_contracts/public_operation_definition_family.js";

type ValueOf<T> = T[keyof T];
type Definition = ValueOf<{
  [Operation in keyof PrivatePublicOperationDefinitionFamily]: ValueOf<
    PrivatePublicOperationDefinitionFamily[Operation]
  >;
}>;
type DefinitionKey = Definition["definitionKey"];

declare const family: PrivatePublicOperationDefinitionFamily;
declare const rawInvocation: unknown;

const definition = family["abg.operation.run.continue"].current_intent;
const witness = admitPrivateP1PublicOperationIngress({
  family,
  definition,
  rawInvocation,
  causationEventRefs: [],
  priorEvents: []
});

const exactKey: typeof definition.definitionKey = witness.definitionKey;
void exactKey;

const packet = admitPrivateP1PublicOperationPacket({
  family,
  definition,
  rawInvocation,
  causationEventRefs: [],
  priorEvents: []
});
assertAdmittedPrivateP1PublicOperationPacket(packet, definition);
const packetExactKey: typeof definition.definitionKey =
  packet.invocation.definitionKey;
void packetExactKey;
const admittedRequest = packet.invocation.request;
void admittedRequest;

declare const allWitnesses:
  PrivatePublicOperationIngressAdmissionWitness<DefinitionKey>;
const allExactKeys: DefinitionKey = allWitnesses.definitionKey;
void allExactKeys;

// @ts-expect-error exact P1 ingress has no sibling operation identity
witness.operationId;

// @ts-expect-error private ingress witness is not a canonical runtime event
witness.eventId;

admitPrivateP1PublicOperationIngress({
  family,
  definition: family["abg.operation.project.read"].ticket_consensus,
  rawInvocation,
  causationEventRefs: [],
  priorEvents: []
});

declare const legacy: LegacyPublicOperationAdmittedRuntimeEvent;
// @ts-expect-error legacy attribution cannot satisfy exact P1 ingress
const exactFromLegacy: PrivatePublicOperationIngressAdmissionWitness<DefinitionKey> = legacy;
void exactFromLegacy;
