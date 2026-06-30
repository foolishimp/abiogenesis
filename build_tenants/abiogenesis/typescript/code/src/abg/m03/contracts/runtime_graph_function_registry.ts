// Implements: T-177
// Implements: REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL
// Implements: REQ-L-GTL3-SELECTION-BOUNDARY

import type {
  GraphFunctionSelectedRuntimeEvent,
  GraphFunctionSelectionRejectedRuntimeEvent,
  RegistryEntryAdmittedRuntimeEvent,
  RegistryEntryRejectedRuntimeEvent,
  RegistryPluginAdviceAdmittedRuntimeEvent,
  RegistryPluginAdviceRejectedRuntimeEvent,
  RuntimeEvent
} from "./carriers.js";
import { assertRuntimeEvent } from "./event_admission.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import { GTL_REGISTRY_ENTRY_KIND_VALUES } from "../../../gtl/m02/contracts/runtime_registry.js";
import type {
  GtlLibraryEntryDeclaration,
  GtlRegistryEntryKind,
  GtlRegistryLibraryScope,
  ProductPluginSelectionAdvice,
  ProductRegistryStartupConfig
} from "../../../gtl/m02/contracts/runtime_registry.js";

export type RegistryAdmissionEvent =
  | RegistryEntryAdmittedRuntimeEvent
  | RegistryEntryRejectedRuntimeEvent;

export type RegistryPluginAdviceAdmissionEvent =
  | RegistryPluginAdviceAdmittedRuntimeEvent
  | RegistryPluginAdviceRejectedRuntimeEvent;

export type GraphFunctionSelectionEvent =
  | GraphFunctionSelectedRuntimeEvent
  | GraphFunctionSelectionRejectedRuntimeEvent;

export interface RuntimeRegistryEntryProjection {
  readonly kind: "runtime_registry_entry_projection";
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: GtlRegistryLibraryScope;
  readonly entryKind: GtlRegistryEntryKind;
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly graphFunctionRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly sourceEventRefs: readonly string[];
}

export interface RuntimeRegistryRejectedEntryProjection {
  readonly kind: "runtime_registry_rejected_entry_projection";
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: GtlRegistryLibraryScope;
  readonly entryKind: GtlRegistryEntryKind;
  readonly namespace: string;
  readonly ownerRef: string;
  readonly rejectionReason: string;
  readonly conflictingEntryRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
}

export interface RuntimeRegistryProjection {
  readonly kind: "runtime_registry_projection";
  readonly projectionRef: string;
  readonly entries: readonly RuntimeRegistryEntryProjection[];
  readonly rejectedEntries: readonly RuntimeRegistryRejectedEntryProjection[];
  readonly sourceEventRefs: readonly string[];
}

export interface RuntimeRegistryStartupAdmissionResult {
  readonly kind: "runtime_registry_startup_admission_result";
  readonly productStartupConfigRef: string | null;
  readonly productStartupConfigDigest: string | null;
  readonly admissionEvents: readonly RegistryAdmissionEvent[];
  readonly projection: RuntimeRegistryProjection;
  readonly admittedEntryRefs: readonly string[];
  readonly rejectedDeclarationRefs: readonly string[];
}

export interface RuntimeRegistryStartupInput {
  readonly systemDeclarations: readonly GtlLibraryEntryDeclaration[];
  readonly productStartupConfig?: ProductRegistryStartupConfig | undefined;
  readonly productDeclarations: readonly GtlLibraryEntryDeclaration[];
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}

export interface RegistryLookupRequest {
  readonly kind: "registry_lookup_request";
  readonly lookupRef: string;
  readonly entryKinds: readonly GtlRegistryEntryKind[];
  readonly candidateIdentityRefs: readonly string[];
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly namespaceRefs: readonly string[];
  readonly acceptedVersions: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export type CandidateEligibilityField =
  | "candidate_identity"
  | "entry_kind"
  | "interface"
  | "source_contract"
  | "target_contract"
  | "context"
  | "authority"
  | "overlay"
  | "namespace"
  | "version"
  | "provenance"
  | "readiness"
  | "proof"
  | "policy_constraints";

export interface CandidateEligibilityFieldDecision {
  readonly kind: "candidate_eligibility_field_decision";
  readonly field: CandidateEligibilityField;
  readonly accepted: boolean;
  readonly reason: string | null;
}

export interface CandidateEligibilityDecision {
  readonly kind: "candidate_eligibility_decision";
  readonly decisionRef: string;
  readonly candidateRef: string;
  readonly eligible: boolean;
  readonly fieldDecisions: readonly CandidateEligibilityFieldDecision[];
  readonly rejectionReasons: readonly string[];
}

export interface RegistryLookupResult {
  readonly kind: "registry_lookup_result";
  readonly lookupResultRef: string;
  readonly lookupRef: string;
  readonly candidateDecisions: readonly CandidateEligibilityDecision[];
  readonly eligibleCandidateRefs: readonly string[];
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new TypeError(`${label} must be non-empty`);
  }
}

function freezeUniqueStrings<T extends string>(
  values: readonly T[],
  label: string
): readonly T[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return Object.freeze([...values]);
}

function freezeEntryKinds(
  values: readonly GtlRegistryEntryKind[],
  label: string
): readonly GtlRegistryEntryKind[] {
  const allowed = new Set<string>(GTL_REGISTRY_ENTRY_KIND_VALUES);
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (!allowed.has(value)) {
      throw new TypeError(`${label}[${index}] has unsupported value ${JSON.stringify(value)}`);
    }
  }
  return freezeUniqueStrings(values, label);
}

function sourceEventRef(event: RuntimeEvent): string {
  if ("eventId" in event && typeof event.eventId === "string") {
    return event.eventId;
  }
  if ("entryRef" in event && typeof event.entryRef === "string") {
    return event.entryRef;
  }
  if ("declarationRef" in event && typeof event.declarationRef === "string") {
    return event.declarationRef;
  }
  if ("adviceRef" in event && typeof event.adviceRef === "string") {
    return event.adviceRef;
  }
  if ("selectionRef" in event && typeof event.selectionRef === "string") {
    return event.selectionRef;
  }
  return event.kind;
}

function isSubset(
  required: readonly string[],
  available: readonly string[]
): boolean {
  const availableSet = new Set(available);
  return required.every((value) => availableSet.has(value));
}

function matchesOptionalSet(
  accepted: readonly string[],
  candidate: string
): boolean {
  return accepted.includes("*") || accepted.includes(candidate);
}

function refIsEnabledByStartupConfig(input: {
  readonly config: ProductRegistryStartupConfig;
  readonly declaration: GtlLibraryEntryDeclaration;
}): boolean {
  if (input.config.enabledLibraryRefs.length === 0) {
    return true;
  }
  const enabled = new Set(input.config.enabledLibraryRefs);
  return (
    enabled.has(input.declaration.entryRef) ||
    enabled.has(input.declaration.declarationRef) ||
    input.declaration.declarationSourceRefs.some((ref) => enabled.has(ref))
  );
}

function assertProductDeclarationMatchesStartupConfig(input: {
  readonly config: ProductRegistryStartupConfig;
  readonly declaration: GtlLibraryEntryDeclaration;
}): void {
  if (input.declaration.namespace !== input.config.productNamespace) {
    throw new TypeError(
      "RuntimeRegistryStartup.productDeclarations must match product startup namespace"
    );
  }
  if (input.declaration.ownerRef !== input.config.ownerRef) {
    throw new TypeError(
      "RuntimeRegistryStartup.productDeclarations must match product startup owner"
    );
  }
  if (input.declaration.version !== input.config.version) {
    throw new TypeError(
      "RuntimeRegistryStartup.productDeclarations must match product startup version"
    );
  }
  if (!refIsEnabledByStartupConfig(input)) {
    throw new TypeError(
      "RuntimeRegistryStartup.productDeclarations must be enabled by product startup config"
    );
  }
}

function entryProjectionFromEvent(
  event: RegistryEntryAdmittedRuntimeEvent
): RuntimeRegistryEntryProjection {
  return Object.freeze({
    kind: "runtime_registry_entry_projection",
    entryRef: event.entryRef,
    declarationRef: event.declarationRef,
    declarationDigest: event.declarationDigest,
    libraryScope: event.libraryScope,
    entryKind: event.entryKind,
    namespace: event.namespace,
    ownerRef: event.ownerRef,
    version: event.version,
    graphFunctionRef: event.graphFunctionRef,
    interfaceRef: event.interfaceRef,
    sourceContractRef: event.sourceContractRef,
    targetContractRef: event.targetContractRef,
    contextRefs: Object.freeze([...event.contextRefs]),
    authorityRefs: Object.freeze([...event.authorityRefs]),
    overlayRefs: Object.freeze([...event.overlayRefs]),
    provenanceRefs: Object.freeze([...event.provenanceRefs]),
    readinessRefs: Object.freeze([...event.readinessRefs]),
    proofRefs: Object.freeze([...event.proofRefs]),
    policyRefs: Object.freeze([...event.policyRefs]),
    refinementOfEntryRef: event.refinementOfEntryRef,
    overrideOfEntryRef: event.overrideOfEntryRef,
    sourceEventRefs: Object.freeze([sourceEventRef(event)])
  });
}

function rejectedEntryProjectionFromEvent(
  event: RegistryEntryRejectedRuntimeEvent
): RuntimeRegistryRejectedEntryProjection {
  return Object.freeze({
    kind: "runtime_registry_rejected_entry_projection",
    declarationRef: event.declarationRef,
    declarationDigest: event.declarationDigest,
    libraryScope: event.libraryScope,
    entryKind: event.entryKind,
    namespace: event.namespace,
    ownerRef: event.ownerRef,
    rejectionReason: event.rejectionReason,
    conflictingEntryRefs: Object.freeze([...event.conflictingEntryRefs]),
    sourceEventRefs: Object.freeze([sourceEventRef(event)])
  });
}

function entryShadowsSystemEntry(input: {
  readonly declaration: GtlLibraryEntryDeclaration;
  readonly projection: RuntimeRegistryProjection;
}): readonly RuntimeRegistryEntryProjection[] {
  if (input.declaration.libraryScope !== "product") {
    return Object.freeze([]);
  }
  return Object.freeze(
    input.projection.entries.filter((entry) =>
      entry.libraryScope === "system" &&
      entry.graphFunctionRef === input.declaration.graphFunctionRef
    )
  );
}

export function projectRuntimeGraphFunctionRegistry(
  events: readonly RuntimeEvent[]
): RuntimeRegistryProjection {
  const entries = new Map<string, RuntimeRegistryEntryProjection>();
  const rejectedEntries: RuntimeRegistryRejectedEntryProjection[] = [];
  const sourceEventRefs: string[] = [];

  for (const event of events) {
    assertRuntimeEvent(event);
    if (event.kind === "registry_entry_admitted") {
      entries.set(event.entryRef, entryProjectionFromEvent(event));
      sourceEventRefs.push(sourceEventRef(event));
    }
    if (event.kind === "registry_entry_rejected") {
      rejectedEntries.push(rejectedEntryProjectionFromEvent(event));
      sourceEventRefs.push(sourceEventRef(event));
    }
  }

  const sortedEntries = [...entries.values()].sort((left, right) =>
    left.entryRef < right.entryRef ? -1 : left.entryRef > right.entryRef ? 1 : 0
  );
  return Object.freeze({
    kind: "runtime_registry_projection",
    projectionRef: `runtime-registry-projection:${stableSha256Digest(sortedEntries)}`,
    entries: Object.freeze(sortedEntries),
    rejectedEntries: Object.freeze([...rejectedEntries]),
    sourceEventRefs: Object.freeze(sourceEventRefs)
  });
}

export function admitGtlLibraryEntryDeclaration(input: {
  readonly declaration: GtlLibraryEntryDeclaration;
  readonly projection?: RuntimeRegistryProjection | undefined;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): RegistryAdmissionEvent {
  const declarationDigest = stableSha256Digest(input.declaration);
  const conflictingSystemEntries =
    input.projection === undefined
      ? Object.freeze([])
      : entryShadowsSystemEntry({
          declaration: input.declaration,
          projection: input.projection
        });
  const hasOverrideLaw =
    input.declaration.refinementOfEntryRef !== null ||
    input.declaration.overrideOfEntryRef !== null;
  if (conflictingSystemEntries.length > 0 && !hasOverrideLaw) {
    return Object.freeze({
      kind: "registry_entry_rejected",
      declarationRef: input.declaration.declarationRef,
      declarationDigest,
      libraryScope: input.declaration.libraryScope,
      entryKind: input.declaration.entryKind,
      namespace: input.declaration.namespace,
      ownerRef: input.declaration.ownerRef,
      rejectionReason: "unlawful_system_shadow",
      conflictingEntryRefs: Object.freeze(
        conflictingSystemEntries.map((entry) => entry.entryRef)
      ),
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }

  return Object.freeze({
    kind: "registry_entry_admitted",
    entryRef: input.declaration.entryRef,
    declarationRef: input.declaration.declarationRef,
    declarationDigest,
    libraryScope: input.declaration.libraryScope,
    entryKind: input.declaration.entryKind,
    namespace: input.declaration.namespace,
    ownerRef: input.declaration.ownerRef,
    version: input.declaration.version,
    graphFunctionRef: input.declaration.graphFunctionRef,
    interfaceRef: input.declaration.interfaceRef,
    sourceContractRef: input.declaration.sourceContractRef,
    targetContractRef: input.declaration.targetContractRef,
    contextRefs: input.declaration.contextRefs,
    authorityRefs: input.declaration.authorityRefs,
    overlayRefs: input.declaration.overlayRefs,
    provenanceRefs: input.declaration.provenanceRefs,
    readinessRefs: input.declaration.readinessRefs,
    proofRefs: input.declaration.proofRefs,
    policyRefs: input.declaration.policyRefs,
    refinementOfEntryRef: input.declaration.refinementOfEntryRef,
    overrideOfEntryRef: input.declaration.overrideOfEntryRef,
    causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
    correlationId: input.correlationId
  });
}

export function admitRuntimeGraphFunctionRegistryStartup(
  input: RuntimeRegistryStartupInput
): RuntimeRegistryStartupAdmissionResult {
  assertNonEmptyString(input.correlationId, "RuntimeRegistryStartup.correlationId");
  for (const declaration of input.systemDeclarations) {
    if (declaration.libraryScope !== "system") {
      throw new TypeError("RuntimeRegistryStartup.systemDeclarations must be system entries");
    }
  }
  if (
    input.productDeclarations.length > 0 &&
    input.productStartupConfig === undefined
  ) {
    throw new TypeError(
      "RuntimeRegistryStartup.productDeclarations require product startup config"
    );
  }
  for (const declaration of input.productDeclarations) {
    if (declaration.libraryScope !== "product") {
      throw new TypeError("RuntimeRegistryStartup.productDeclarations must be product entries");
    }
    if (input.productStartupConfig !== undefined) {
      assertProductDeclarationMatchesStartupConfig({
        config: input.productStartupConfig,
        declaration
      });
    }
  }
  const admissionEvents: RegistryAdmissionEvent[] = [];
  let projection = projectRuntimeGraphFunctionRegistry([]);
  for (const declaration of [
    ...input.systemDeclarations,
    ...input.productDeclarations
  ]) {
    const event = admitGtlLibraryEntryDeclaration({
      declaration,
      projection,
      ...(input.causationEventRefs === undefined
        ? {}
        : { causationEventRefs: input.causationEventRefs }),
      correlationId: input.correlationId
    });
    admissionEvents.push(event);
    projection = projectRuntimeGraphFunctionRegistry(admissionEvents);
  }
  return Object.freeze({
    kind: "runtime_registry_startup_admission_result",
    productStartupConfigRef: input.productStartupConfig?.configRef ?? null,
    productStartupConfigDigest:
      input.productStartupConfig === undefined
        ? null
        : stableSha256Digest(input.productStartupConfig),
    admissionEvents: Object.freeze([...admissionEvents]),
    projection,
    admittedEntryRefs: Object.freeze(
      admissionEvents.flatMap((event) =>
        event.kind === "registry_entry_admitted" ? [event.entryRef] : []
      )
    ),
    rejectedDeclarationRefs: Object.freeze(
      admissionEvents.flatMap((event) =>
        event.kind === "registry_entry_rejected" ? [event.declarationRef] : []
      )
    )
  });
}

export function constructRegistryLookupRequest(input: {
  readonly lookupRef: string;
  readonly entryKinds?: readonly GtlRegistryEntryKind[];
  readonly candidateIdentityRefs?: readonly string[];
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
  readonly contextRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly overlayRefs: readonly string[];
  readonly namespaceRefs: readonly string[];
  readonly acceptedVersions: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
}): RegistryLookupRequest {
  assertNonEmptyString(input.lookupRef, "RegistryLookupRequest.lookupRef");
  assertNonEmptyString(input.interfaceRef, "RegistryLookupRequest.interfaceRef");
  assertNonEmptyString(input.sourceContractRef, "RegistryLookupRequest.sourceContractRef");
  assertNonEmptyString(input.targetContractRef, "RegistryLookupRequest.targetContractRef");
  return Object.freeze({
    kind: "registry_lookup_request",
    lookupRef: input.lookupRef,
    entryKinds: freezeEntryKinds(
      input.entryKinds ?? [],
      "RegistryLookupRequest.entryKinds"
    ),
    candidateIdentityRefs: freezeUniqueStrings(
      input.candidateIdentityRefs ?? [],
      "RegistryLookupRequest.candidateIdentityRefs"
    ),
    interfaceRef: input.interfaceRef,
    sourceContractRef: input.sourceContractRef,
    targetContractRef: input.targetContractRef,
    contextRefs: freezeUniqueStrings(input.contextRefs, "RegistryLookupRequest.contextRefs"),
    authorityRefs: freezeUniqueStrings(input.authorityRefs, "RegistryLookupRequest.authorityRefs"),
    overlayRefs: freezeUniqueStrings(input.overlayRefs, "RegistryLookupRequest.overlayRefs"),
    namespaceRefs: freezeUniqueStrings(input.namespaceRefs, "RegistryLookupRequest.namespaceRefs"),
    acceptedVersions: freezeUniqueStrings(
      input.acceptedVersions,
      "RegistryLookupRequest.acceptedVersions"
    ),
    provenanceRefs: freezeUniqueStrings(
      input.provenanceRefs,
      "RegistryLookupRequest.provenanceRefs"
    ),
    readinessRefs: freezeUniqueStrings(input.readinessRefs, "RegistryLookupRequest.readinessRefs"),
    proofRefs: freezeUniqueStrings(input.proofRefs, "RegistryLookupRequest.proofRefs"),
    policyRefs: freezeUniqueStrings(input.policyRefs, "RegistryLookupRequest.policyRefs")
  });
}

function fieldDecision(input: {
  readonly field: CandidateEligibilityField;
  readonly accepted: boolean;
  readonly reason: string | null;
}): CandidateEligibilityFieldDecision {
  return Object.freeze({
    kind: "candidate_eligibility_field_decision",
    field: input.field,
    accepted: input.accepted,
    reason: input.reason
  });
}

function eligibilityForEntry(
  entry: RuntimeRegistryEntryProjection,
  request: RegistryLookupRequest
): CandidateEligibilityDecision {
  const fieldDecisions = Object.freeze([
    fieldDecision({
      field: "candidate_identity",
      accepted:
        request.candidateIdentityRefs.length === 0 ||
        request.candidateIdentityRefs.includes(entry.entryRef),
      reason: "candidate_identity_mismatch"
    }),
    fieldDecision({
      field: "entry_kind",
      accepted:
        request.entryKinds.length === 0 ||
        request.entryKinds.includes(entry.entryKind),
      reason: "entry_kind_mismatch"
    }),
    fieldDecision({
      field: "interface",
      accepted: entry.interfaceRef === request.interfaceRef,
      reason: "interface_mismatch"
    }),
    fieldDecision({
      field: "source_contract",
      accepted: entry.sourceContractRef === request.sourceContractRef,
      reason: "source_contract_mismatch"
    }),
    fieldDecision({
      field: "target_contract",
      accepted: entry.targetContractRef === request.targetContractRef,
      reason: "target_contract_mismatch"
    }),
    fieldDecision({
      field: "context",
      accepted: isSubset(entry.contextRefs, request.contextRefs),
      reason: "context_unsatisfied"
    }),
    fieldDecision({
      field: "authority",
      accepted: isSubset(entry.authorityRefs, request.authorityRefs),
      reason: "authority_unsatisfied"
    }),
    fieldDecision({
      field: "overlay",
      accepted: isSubset(entry.overlayRefs, request.overlayRefs),
      reason: "overlay_unsatisfied"
    }),
    fieldDecision({
      field: "namespace",
      accepted: matchesOptionalSet(request.namespaceRefs, entry.namespace),
      reason: "namespace_mismatch"
    }),
    fieldDecision({
      field: "version",
      accepted: matchesOptionalSet(request.acceptedVersions, entry.version),
      reason: "version_mismatch"
    }),
    fieldDecision({
      field: "provenance",
      accepted: isSubset(entry.provenanceRefs, request.provenanceRefs),
      reason: "provenance_unsatisfied"
    }),
    fieldDecision({
      field: "readiness",
      accepted: isSubset(entry.readinessRefs, request.readinessRefs),
      reason: "readiness_unsatisfied"
    }),
    fieldDecision({
      field: "proof",
      accepted: isSubset(entry.proofRefs, request.proofRefs),
      reason: "proof_unsatisfied"
    }),
    fieldDecision({
      field: "policy_constraints",
      accepted: isSubset(entry.policyRefs, request.policyRefs),
      reason: "policy_constraints_unsatisfied"
    })
  ]);
  const rejectionReasons = Object.freeze(
    fieldDecisions
      .filter((decision) => !decision.accepted)
      .map((decision) => {
        if (decision.reason === null) {
          throw new TypeError("Rejected eligibility field requires reason");
        }
        return decision.reason;
      })
  );
  return Object.freeze({
    kind: "candidate_eligibility_decision",
    decisionRef: `candidate-eligibility:${request.lookupRef}:${entry.entryRef}`,
    candidateRef: entry.entryRef,
    eligible: rejectionReasons.length === 0,
    fieldDecisions,
    rejectionReasons
  });
}

export function lookupRuntimeGraphFunctionRegistry(input: {
  readonly projection: RuntimeRegistryProjection;
  readonly request: RegistryLookupRequest;
}): RegistryLookupResult {
  const candidateDecisions = Object.freeze(
    input.projection.entries.map((entry) => eligibilityForEntry(entry, input.request))
  );
  const eligibleCandidateRefs = Object.freeze(
    candidateDecisions
      .filter((decision) => decision.eligible)
      .map((decision) => decision.candidateRef)
  );
  return Object.freeze({
    kind: "registry_lookup_result",
    lookupResultRef: `registry-lookup-result:${stableSha256Digest({
      lookupRef: input.request.lookupRef,
      eligibleCandidateRefs
    })}`,
    lookupRef: input.request.lookupRef,
    candidateDecisions,
    eligibleCandidateRefs
  });
}

export function admitProductPluginSelectionAdvice(input: {
  readonly advice: ProductPluginSelectionAdvice;
  readonly lookupResult: RegistryLookupResult;
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): RegistryPluginAdviceAdmissionEvent {
  if (input.advice.lookupResultRef !== input.lookupResult.lookupResultRef) {
    return Object.freeze({
      kind: "registry_plugin_advice_rejected",
      pluginRef: input.advice.pluginRef,
      lookupResultRef: input.advice.lookupResultRef,
      rejectionReason: "lookup_result_mismatch",
      invalidCandidateRefs: Object.freeze([]),
      authorityViolationRefs: Object.freeze([]),
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  if (input.advice.forbiddenAuthorityRefs.length > 0) {
    return Object.freeze({
      kind: "registry_plugin_advice_rejected",
      pluginRef: input.advice.pluginRef,
      lookupResultRef: input.advice.lookupResultRef,
      rejectionReason: "plugin_advice_contains_runtime_authority",
      invalidCandidateRefs: Object.freeze([]),
      authorityViolationRefs: input.advice.forbiddenAuthorityRefs,
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  const eligible = new Set(input.lookupResult.eligibleCandidateRefs);
  const advisedCandidates = Object.freeze([
    ...(input.advice.preferredCandidateRef === null
      ? []
      : [input.advice.preferredCandidateRef]),
    ...input.advice.rankedCandidateRefs
  ]);
  const invalidCandidateRefs = Object.freeze(
    [...new Set(advisedCandidates.filter((candidate) => !eligible.has(candidate)))]
  );
  if (invalidCandidateRefs.length > 0) {
    return Object.freeze({
      kind: "registry_plugin_advice_rejected",
      pluginRef: input.advice.pluginRef,
      lookupResultRef: input.advice.lookupResultRef,
      rejectionReason: "plugin_advice_candidate_not_eligible",
      invalidCandidateRefs,
      authorityViolationRefs: Object.freeze([]),
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  return Object.freeze({
    kind: "registry_plugin_advice_admitted",
    adviceRef: input.advice.adviceRef,
    adviceDigest: stableSha256Digest(input.advice),
    pluginRef: input.advice.pluginRef,
    lookupResultRef: input.advice.lookupResultRef,
    preferredCandidateRef: input.advice.preferredCandidateRef,
    rankedCandidateRefs: input.advice.rankedCandidateRefs,
    constraintRefs: input.advice.constraintRefs,
    rationaleRef: input.advice.rationaleRef,
    policyRefs: input.advice.policyRefs,
    causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
    correlationId: input.correlationId
  });
}

function selectedCandidateRef(input: {
  readonly lookupResult: RegistryLookupResult;
  readonly admittedAdvice?: RegistryPluginAdviceAdmittedRuntimeEvent | undefined;
  readonly abgSelectedCandidateRef?: string | undefined;
  readonly fallbackCandidateRef?: string | undefined;
}): string | null {
  if (input.abgSelectedCandidateRef !== undefined) {
    return input.abgSelectedCandidateRef;
  }
  if (input.admittedAdvice !== undefined) {
    return input.admittedAdvice.preferredCandidateRef ??
      input.admittedAdvice.rankedCandidateRefs[0] ??
      null;
  }
  if (input.fallbackCandidateRef !== undefined) {
    return input.fallbackCandidateRef;
  }
  if (input.lookupResult.eligibleCandidateRefs.length === 1) {
    return input.lookupResult.eligibleCandidateRefs[0] ?? null;
  }
  return null;
}

export function selectGraphFunctionFromRegistry(input: {
  readonly lookupResult: RegistryLookupResult;
  readonly projection: RuntimeRegistryProjection;
  readonly selectionRef: string;
  readonly runtimeBasisRef: string;
  readonly rationaleRef: string;
  readonly admittedAdvice?: RegistryPluginAdviceAdmittedRuntimeEvent | undefined;
  readonly abgSelectedCandidateRef?: string | undefined;
  readonly fallbackCandidateRef?: string | undefined;
  readonly fhResponseRefs?: readonly string[];
  readonly causationEventRefs?: readonly string[];
  readonly correlationId: string;
}): GraphFunctionSelectionEvent {
  assertNonEmptyString(input.selectionRef, "GraphFunctionSelection.selectionRef");
  assertNonEmptyString(input.runtimeBasisRef, "GraphFunctionSelection.runtimeBasisRef");
  assertNonEmptyString(input.rationaleRef, "GraphFunctionSelection.rationaleRef");
  if (
    input.admittedAdvice !== undefined &&
    input.admittedAdvice.kind !== "registry_plugin_advice_admitted"
  ) {
    throw new TypeError(
      "GraphFunctionSelection.admittedAdvice must be an admitted registry plugin advice event"
    );
  }
  if (
    input.admittedAdvice !== undefined &&
    input.admittedAdvice.lookupResultRef !== input.lookupResult.lookupResultRef
  ) {
    throw new TypeError(
      "GraphFunctionSelection.admittedAdvice must belong to the lookup result"
    );
  }
  const candidateRef = selectedCandidateRef(input);
  const eligible = new Set(input.lookupResult.eligibleCandidateRefs);
  if (candidateRef === null || !eligible.has(candidateRef)) {
    return Object.freeze({
      kind: "graph_function_selection_rejected",
      lookupResultRef: input.lookupResult.lookupResultRef,
      rejectionReason:
        candidateRef === null ? "no_selected_candidate" : "selected_candidate_not_eligible",
      rejectedCandidateRefs:
        candidateRef === null ? Object.freeze([]) : Object.freeze([candidateRef]),
      pressureDispositionRef: null,
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  const entry = input.projection.entries.find((candidate) =>
    candidate.entryRef === candidateRef
  );
  if (entry === undefined) {
    return Object.freeze({
      kind: "graph_function_selection_rejected",
      lookupResultRef: input.lookupResult.lookupResultRef,
      rejectionReason: "selected_candidate_missing_from_projection",
      rejectedCandidateRefs: Object.freeze([candidateRef]),
      pressureDispositionRef: null,
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  if (entry.entryKind !== "graph_function") {
    return Object.freeze({
      kind: "graph_function_selection_rejected",
      lookupResultRef: input.lookupResult.lookupResultRef,
      rejectionReason: "selected_candidate_not_graph_function",
      rejectedCandidateRefs: Object.freeze([candidateRef]),
      pressureDispositionRef: null,
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  const eligibilityDecision = input.lookupResult.candidateDecisions.find(
    (decision) => decision.candidateRef === candidateRef
  );
  if (eligibilityDecision === undefined || !eligibilityDecision.eligible) {
    return Object.freeze({
      kind: "graph_function_selection_rejected",
      lookupResultRef: input.lookupResult.lookupResultRef,
      rejectionReason: "selected_candidate_without_eligibility_decision",
      rejectedCandidateRefs: Object.freeze([candidateRef]),
      pressureDispositionRef: null,
      causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
      correlationId: input.correlationId
    });
  }
  return Object.freeze({
    kind: "graph_function_selected",
    selectionRef: input.selectionRef,
    selectedEntryRef: entry.entryRef,
    selectedEntryKind: "graph_function",
    selectedGraphFunctionRef: entry.graphFunctionRef,
    lookupResultRef: input.lookupResult.lookupResultRef,
    eligibilityDecisionRefs: Object.freeze([eligibilityDecision.decisionRef]),
    adviceRefs:
      input.admittedAdvice === undefined
        ? Object.freeze([])
        : Object.freeze([input.admittedAdvice.adviceRef]),
    fhResponseRefs: freezeUniqueStrings(
      input.fhResponseRefs ?? [],
      "GraphFunctionSelection.fhResponseRefs"
    ),
    rationaleRef: input.rationaleRef,
    runtimeBasisRef: input.runtimeBasisRef,
    causationEventRefs: Object.freeze([...(input.causationEventRefs ?? [])]),
    correlationId: input.correlationId
  });
}

export function assertGraphFunctionInvocationSelected(input: {
  readonly events: readonly RuntimeEvent[];
  readonly runtimeBasisRef: string;
  readonly graphFunctionRef: string;
  readonly selectionRef?: string | undefined;
}): GraphFunctionSelectedRuntimeEvent {
  assertNonEmptyString(input.runtimeBasisRef, "GraphFunctionInvocation.runtimeBasisRef");
  assertNonEmptyString(input.graphFunctionRef, "GraphFunctionInvocation.graphFunctionRef");
  if (input.selectionRef !== undefined) {
    assertNonEmptyString(input.selectionRef, "GraphFunctionInvocation.selectionRef");
  }
  for (const event of input.events) {
    assertRuntimeEvent(event);
    if (
      event.kind === "graph_function_selected" &&
      event.selectedEntryKind === "graph_function" &&
      event.runtimeBasisRef === input.runtimeBasisRef &&
      event.selectedGraphFunctionRef === input.graphFunctionRef &&
      (input.selectionRef === undefined || event.selectionRef === input.selectionRef)
    ) {
      return event;
    }
  }
  throw new TypeError(
    "GraphFunctionInvocation requires prior graph_function_selected runtime truth"
  );
}
