import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationDefinitionCoordinate } from "../shared/operation_definition_coordinate.js";
import type { ExecutionBasis } from "./execution_basis.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { InvocationAdmission } from "./invocation_admission.js";

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalRecordDigest(value: unknown): Sha256Digest | null {
  if (!isRecord(value)) return null;
  try {
    return sha256Canonical(value);
  } catch {
    return null;
  }
}

function sameStringArray(
  value: unknown,
  expected: readonly string[],
): boolean {
  return Array.isArray(value) &&
    value.length === expected.length &&
    value.every((entry, index) =>
      typeof entry === "string" && entry === expected[index]
    );
}

export function projectExactInvocationAdmissionAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  invocationAdmissionRef: string,
): InvocationAdmission | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const matches = events.filter(
    (event) =>
      event.kind === "invocation_admitted" &&
      isRecord(event.payload) &&
      event.payload.invocationAdmissionRef === invocationAdmissionRef,
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (event.causationEventRefs.length !== 1 || !isRecord(event.payload)) {
    return null;
  }
  const publicEvent = events.find((candidate) =>
    candidate.eventId === event.causationEventRefs[0] &&
    candidate.kind === "public_operation_admitted"
  );
  if (publicEvent === undefined || !isRecord(publicEvent.payload)) return null;
  const carriesCatalogApplications =
    Array.isArray(event.payload.catalogApplicationRefs) &&
    Array.isArray(event.payload.catalogApplicationDigests);
  const admission = deepFreeze({
    kind: "invocation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    ...event.payload,
    catalogApplicationRefs: carriesCatalogApplications
      ? event.payload.catalogApplicationRefs
      : [],
    catalogApplicationDigests: carriesCatalogApplications
      ? event.payload.catalogApplicationDigests
      : [],
    publicOperationEventRef: publicEvent.eventId,
    admissionEventRef: event.eventId,
  }) as unknown as InvocationAdmission;
  const body = {
    invocationRef: admission.invocationRef,
    invocationDigest: admission.invocationDigest,
    invocationVariant: admission.invocationVariant,
    rawInputAdmissionRef: admission.rawInputAdmissionRef,
    rawInputDigest: admission.rawInputDigest,
    publicRequestAdmissionRef: admission.publicRequestAdmissionRef,
    publicRequestDigest: admission.publicRequestDigest,
    publicRequestInvocationRef: admission.publicRequestInvocationRef,
    workspaceId: admission.workspaceId,
    workspaceBindingId: admission.workspaceBindingId,
    workspaceBindingDigest: admission.workspaceBindingDigest,
    catalogBasisRef: admission.catalogBasisRef,
    catalogBasisDigest: admission.catalogBasisDigest,
    catalogViewId: admission.catalogViewId,
    catalogViewDigest: admission.catalogViewDigest,
    ...(carriesCatalogApplications
      ? {
          catalogApplicationRefs: admission.catalogApplicationRefs,
          catalogApplicationDigests: admission.catalogApplicationDigests,
        }
      : {}),
    programRef: admission.programRef,
    programDigest: admission.programDigest,
    catalogHandle: admission.catalogHandle,
    graphFunctionRef: admission.graphFunctionRef,
    graphFunctionDigest: admission.graphFunctionDigest,
    selectedDefinitionRef: admission.selectedDefinitionRef,
    selectedDefinitionDigest: admission.selectedDefinitionDigest,
    gtlEntryCoordinate: admission.gtlEntryCoordinate,
    gtlEntryTerm: admission.gtlEntryTerm,
    inputContractRef: admission.inputContractRef,
    outputContractRef: admission.outputContractRef,
    programValidationRef: admission.programValidationRef,
    programValidationDigest: admission.programValidationDigest,
    policyRef: admission.policyRef,
    policyDigest: admission.policyDigest,
    capabilityGrants: admission.capabilityGrants,
    capabilityGrantRefs: admission.capabilityGrantRefs,
    authorityRef: admission.authorityRef,
    authorityDigest: admission.authorityDigest,
    actorRef: admission.actorRef,
    publicStart: admission.publicStart,
    reentryBasis: admission.reentryBasis,
    sourceResultBasis: admission.sourceResultBasis,
  };
  const operationId = "abg.operation.run.invoke";
  return sha256Canonical(body as unknown as JsonValue) ===
        admission.invocationAdmissionDigest &&
      typeof admission.publicRequestInvocationRef === "string" &&
      admission.publicRequestInvocationRef.length > 0 &&
      admission.invocationAdmissionRef ===
        `invocation-admission://abiogenesis/${admission.invocationAdmissionDigest.slice("sha256:".length)}` &&
      publicEvent.aggregateType === "workspace" &&
      publicEvent.aggregateId === admission.workspaceBindingId &&
      publicEvent.parentAggregateId === admission.invocationRef &&
      publicEvent.workflowVersion === "5.0.0" &&
      publicEvent.scopeClass === "workspace" &&
      publicEvent.basisId === admission.authorityRef &&
      event.aggregateType === "workspace" &&
      event.aggregateId === admission.workspaceBindingId &&
      event.parentAggregateId === admission.invocationRef &&
      event.workflowVersion === "5.0.0" &&
      event.scopeClass === "workspace" &&
      event.basisId === admission.invocationAdmissionRef &&
      event.eventTime === publicEvent.eventTime &&
      event.correlationId === publicEvent.correlationId &&
      event.causationEventRefs[0] === publicEvent.eventId &&
      publicEvent.payload.operationId === operationId &&
      isExactOperationDefinitionCoordinate({
        operationId: publicEvent.payload.operationId,
        memberKey: publicEvent.payload.memberKey,
        definitionDigest: publicEvent.payload.definitionDigest,
      }) &&
      publicEvent.payload.memberKey ===
        (admission.invocationVariant === "direct"
          ? "invoke"
          : admission.invocationVariant) &&
      publicEvent.payload.variant === admission.invocationVariant &&
      publicEvent.payload.invocationRef === admission.invocationRef &&
      publicEvent.payload.invocationDigest === admission.invocationDigest &&
      publicEvent.payload.actorRef === admission.actorRef &&
      publicEvent.payload.authorityRef === admission.authorityRef &&
      publicEvent.payload.authorityDigest === admission.authorityDigest &&
      sameStringArray(
        publicEvent.payload.capabilityGrantRefs,
        admission.capabilityGrantRefs,
      ) &&
      carriesCatalogApplications &&
      sameStringArray(
        publicEvent.payload.catalogApplicationRefs,
        admission.catalogApplicationRefs,
      ) &&
      sameStringArray(
        publicEvent.payload.catalogApplicationDigests,
        admission.catalogApplicationDigests,
      ) &&
      publicEvent.payload.catalogBasisRef === admission.catalogBasisRef &&
      publicEvent.payload.catalogBasisDigest === admission.catalogBasisDigest &&
      publicEvent.payload.catalogViewId === admission.catalogViewId &&
      publicEvent.payload.policyRef === admission.policyRef &&
      publicEvent.payload.policyDigest === admission.policyDigest &&
      publicEvent.payload.workspaceBindingId ===
        admission.workspaceBindingId &&
      publicEvent.payload.programRef === admission.programRef &&
      publicEvent.payload.catalogHandle === admission.catalogHandle &&
      publicEvent.payload.graphFunctionRef === admission.graphFunctionRef &&
      publicEvent.payload.selectedDefinitionRef ===
        admission.selectedDefinitionRef &&
      publicEvent.payload.selectedDefinitionDigest ===
        admission.selectedDefinitionDigest &&
      publicEvent.payload.programValidationRef ===
        admission.programValidationRef &&
      publicEvent.payload.programValidationDigest ===
        admission.programValidationDigest &&
      isRecord(publicEvent.payload.gtlEntryCoordinate) &&
      isRecord(publicEvent.payload.gtlEntryTerm) &&
      sha256Canonical(publicEvent.payload.gtlEntryCoordinate) ===
        sha256Canonical(
          admission.gtlEntryCoordinate as unknown as JsonValue,
        ) &&
      sha256Canonical(publicEvent.payload.gtlEntryTerm) ===
        sha256Canonical(admission.gtlEntryTerm as unknown as JsonValue) &&
      event.payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
      event.payload.invocationAdmissionDigest ===
        admission.invocationAdmissionDigest
    ? admission
    : null;
}

export interface ExactRunInvocationFact {
  readonly operationId: "abg.operation.run.invoke";
  readonly publicInvocationRef: string;
  readonly ownerInvocationRef: string;
  readonly ownerInvocationDigest: Sha256Digest;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export type ExactRunInvocationFacts =
  | Readonly<{
      disposition: "valid";
      facts: readonly ExactRunInvocationFact[];
    }>
  | Readonly<{
      disposition: "invalid_history";
      eventRefs: readonly string[];
    }>;

export function projectExactRunInvocationFactsAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
): ExactRunInvocationFacts {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const ownerEvents = events.filter((event) =>
    event.kind === "invocation_admitted"
  );
  const facts: ExactRunInvocationFact[] = [];
  const invalidEventRefs = new Set<string>();
  for (const ownerEvent of ownerEvents) {
    const invocationAdmissionRef = isRecord(ownerEvent.payload) &&
        typeof ownerEvent.payload.invocationAdmissionRef === "string"
      ? ownerEvent.payload.invocationAdmissionRef
      : null;
    const admission = invocationAdmissionRef === null
      ? null
      : projectExactInvocationAdmissionAtPrefix(
          prefix,
          invocationAdmissionRef,
        );
    if (
      admission === null ||
      admission.admissionEventRef !== ownerEvent.eventId ||
      ownerEvent.causationEventRefs.length !== 1 ||
      admission.publicOperationEventRef !== ownerEvent.causationEventRefs[0]
    ) {
      invalidEventRefs.add(ownerEvent.eventId);
      for (const eventRef of ownerEvent.causationEventRefs) {
        invalidEventRefs.add(eventRef);
      }
      continue;
    }
    facts.push(deepFreeze({
      operationId: "abg.operation.run.invoke" as const,
      publicInvocationRef: admission.publicRequestInvocationRef,
      ownerInvocationRef: admission.invocationRef,
      ownerInvocationDigest: admission.invocationDigest,
      publicOperationEventRef: admission.publicOperationEventRef,
      admissionEventRef: admission.admissionEventRef,
    }));
  }
  const publicRunEventRefs = events
    .filter((event) =>
      event.kind === "public_operation_admitted" &&
      isRecord(event.payload) &&
      event.payload.operationId === "abg.operation.run.invoke"
    )
    .map((event) => event.eventId);
  const heldPublicEventRefs = facts.map((fact) =>
    fact.publicOperationEventRef
  );
  const publicRefCounts = new Map<string, number>();
  for (const eventRef of heldPublicEventRefs) {
    publicRefCounts.set(eventRef, (publicRefCounts.get(eventRef) ?? 0) + 1);
  }
  const publicRunEventRefSet = new Set(publicRunEventRefs);
  const heldPublicEventRefSet = new Set(heldPublicEventRefs);
  for (const eventRef of publicRunEventRefs) {
    if (!heldPublicEventRefSet.has(eventRef)) invalidEventRefs.add(eventRef);
  }
  for (const eventRef of heldPublicEventRefs) {
    if (
      !publicRunEventRefSet.has(eventRef) ||
      publicRefCounts.get(eventRef) !== 1
    ) {
      invalidEventRefs.add(eventRef);
    }
  }
  return invalidEventRefs.size === 0 &&
      publicRunEventRefs.length === facts.length
    ? deepFreeze({
        disposition: "valid" as const,
        facts,
      })
    : deepFreeze({
        disposition: "invalid_history" as const,
        eventRefs: [...invalidEventRefs].sort(),
      });
}

export function hasExactInvocationAdmissionAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
): boolean {
  const projected = projectExactInvocationAdmissionAtPrefix(
    prefix,
    admission.invocationAdmissionRef,
  );
  return projected !== null &&
    sha256Canonical(projected as unknown as JsonValue) ===
      sha256Canonical(admission as unknown as JsonValue);
}

export function hasExactInvocationRunBindingAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admission: InvocationAdmission,
  runId: string,
): boolean {
  if (!hasExactInvocationAdmissionAtPrefix(prefix, admission)) return false;
  const runOpenEvents = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      event.kind === "run_segment_opened" &&
      event.aggregateType === "run" &&
      event.aggregateId === runId &&
      event.runId === runId,
  );
  if (runOpenEvents.length !== 1) return false;
  const runOpen = runOpenEvents[0]!;
  const payload = runOpen.payload;
  return isRecord(payload) &&
    runOpen.parentAggregateId === admission.workspaceBindingId &&
    runOpen.graphFunctionRef === admission.graphFunctionRef &&
    payload.runId === runId &&
    payload.invocationAdmissionRef === admission.invocationAdmissionRef &&
    payload.invocationRef === admission.invocationRef &&
    payload.workspaceBindingId === admission.workspaceBindingId &&
    payload.programRef === admission.programRef &&
    payload.graphFunctionRef === admission.graphFunctionRef;
}

export function projectExactExecutionBasisAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  basisRef: string,
): ExecutionBasis | null {
  const matches = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      event.kind === "basis_admitted" &&
      event.basisId === basisRef &&
      isRecord(event.payload) &&
      event.payload.basisRef === basisRef,
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (
    !isRecord(event.payload) ||
    canonicalRecordDigest(event.payload.rawInputValue) !==
      event.payload.rawInputDigest
  ) return null;
  const basis = deepFreeze({
    kind: "execution_basis" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    ...event.payload,
    admissionEventRef: event.eventId,
  }) as unknown as ExecutionBasis;
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    basisRef: _basisRef,
    basisDigest: _basisDigest,
    admissionEventRef: _admissionEventRef,
    ...body
  } = basis;
  return canonicalRecordDigest(basis.rawInputValue) === basis.rawInputDigest &&
      sha256Canonical(body as unknown as JsonValue) === basis.basisDigest &&
      basis.basisRef ===
        `execution-basis://abiogenesis/${basis.basisDigest.slice("sha256:".length)}` &&
      event.payload.basisRef === basis.basisRef &&
      event.payload.basisDigest === basis.basisDigest &&
      event.payload.invocationAdmissionRef === basis.invocationAdmissionRef &&
      event.payload.implementationSetRef === basis.implementationSetRef &&
      event.payload.implementationSetDigest === basis.implementationSetDigest &&
      event.payload.interactionSetRef === basis.interactionSetRef &&
      event.payload.interactionSetDigest === basis.interactionSetDigest &&
      event.payload.implementationResolutionRef ===
        basis.implementationResolutionRef
    ? basis
    : null;
}
