// Implements: REQ-R-ABG3-PAYLOAD
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-ASSURANCE

import type {
  AmbiguityObservationAdmittedRuntimeEvent,
  ActorResultArtifactObservedEvent,
  AuthoritySnapshotAdmittedRuntimeEvent,
  ClosureInputPublishedRuntimeEvent,
  EvidenceAdmittedRuntimeEvent,
  ExecutionBasis,
  PayloadObservedRuntimeEvent,
  PayloadRejectedRuntimeEvent,
  PayloadValidatedRuntimeEvent,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import type {
  GtlTargetCarrierDefaultsBundle,
  TargetCarrierContractBinding
} from "../../../gtl/m01/contracts/index.js";
import { resolveTargetCarrierContractBinding } from "../../../gtl/m01/contracts/index.js";
import type {
  AssuranceAuthoritySnapshot,
  AssuranceEvidenceRow,
  AssuranceScopeRef
} from "./assurance.js";
import {
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow
} from "./assurance.js";
import type {
  IterationEvidenceLifecycle
} from "./iteration_state_action.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export interface PayloadLedgerScope {
  readonly kind: "payload_ledger_scope";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
}

export type PayloadLedgerSourceEvent =
  | PayloadObservedRuntimeEvent
  | PayloadValidatedRuntimeEvent
  | PayloadRejectedRuntimeEvent
  | ActorResultArtifactObservedEvent
  | AuthoritySnapshotAdmittedRuntimeEvent
  | EvidenceAdmittedRuntimeEvent
  | AmbiguityObservationAdmittedRuntimeEvent
  | ClosureInputPublishedRuntimeEvent;

export interface PayloadLedgerProjection {
  readonly kind: "payload_ledger_projection";
  readonly scope: PayloadLedgerScope;
  readonly targetCarrierContract: TargetCarrierContractBinding;
  readonly observedPayloads: readonly PayloadObservedRuntimeEvent[];
  readonly validatedPayloads: readonly PayloadValidatedRuntimeEvent[];
  readonly rejectedPayloads: readonly PayloadRejectedRuntimeEvent[];
  readonly actorResultArtifacts: readonly ActorResultArtifactObservedEvent[];
  readonly authoritySnapshots: readonly AuthoritySnapshotAdmittedRuntimeEvent[];
  readonly evidenceRows: readonly EvidenceAdmittedRuntimeEvent[];
  readonly ambiguityObservations: readonly AmbiguityObservationAdmittedRuntimeEvent[];
  readonly closureInputs: readonly ClosureInputPublishedRuntimeEvent[];
  readonly projectionRef: string;
}

export type TargetCarrierAdmissionStatus =
  | "admitted"
  | "rejected"
  | "missing";

export interface TargetCarrierAdmissionProjection {
  readonly kind: "target_carrier_admission_projection";
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly status: TargetCarrierAdmissionStatus;
  readonly payloadRef: string | null;
  readonly validationRefs: readonly string[];
  readonly rejectedPayloadRefs: readonly string[];
  readonly reason: string | null;
}

export type AdmittedOutputAuthorityStatus =
  | "admitted"
  | "missing"
  | "rejected";

export interface AdmittedOutputAuthorityProjection {
  readonly kind: "admitted_output_authority_projection";
  readonly scope: PayloadLedgerScope;
  readonly targetCarrierContractRef: string;
  readonly targetCarrierContractDigest: string;
  readonly status: AdmittedOutputAuthorityStatus;
  readonly reason: string | null;
  readonly payloadRef: string | null;
  readonly payloadClass: string | null;
  readonly payloadDigest: string | null;
  readonly payloadContractRef: string | null;
  readonly producerRef: string | null;
  readonly sourceEventRef: string | null;
  readonly authorityRef: string | null;
  readonly inputDigest: string | null;
  readonly validationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly relatedPayloadRefs: readonly string[];
  readonly projectionRef: string;
}

export const INSTRUCTION_CAUSAL_CONTENT_MODE_VALUES = Object.freeze([
  "ref_digest_only",
  "excerpt",
  "full_content"
] as const);

export type InstructionCausalContentMode =
  (typeof INSTRUCTION_CAUSAL_CONTENT_MODE_VALUES)[number];

export interface InstructionCausalInputBinding {
  readonly kind: "instruction_causal_input_binding";
  readonly bindingRef: string;
  readonly targetBasisId: string;
  readonly targetGraphCallId: string;
  readonly targetFrameId: string;
  readonly targetVectorIndex: number;
  readonly targetEdge: string;
  readonly targetAssetKind: string;
  readonly sourceVectorIndex: number;
  readonly sourceEdge: string;
  readonly sourceAssetKind: string;
  readonly bindingRole: "prior_target_output" | "same_vector_retry_repair";
  readonly bindingPolicyRef: string;
  readonly contentMode: InstructionCausalContentMode;
  readonly contentRef: string | null;
  readonly contentDigest: string | null;
  readonly contentExcerpt: string | null;
  readonly required: boolean;
  readonly payloadRef: string;
  readonly payloadClass: string;
  readonly payloadDigest: string;
  readonly payloadContractRef: string | null;
  readonly producerRef: string;
  readonly sourceEventRef: string | null;
  readonly authorityRef: string | null;
  readonly inputDigest: string | null;
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRef: string;
}

export interface InstructionCausalContextProjection {
  readonly kind: "instruction_causal_context_projection";
  readonly contextRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly status: "empty" | "bound" | "blocked";
  readonly bindingRefs: readonly string[];
  readonly bindingPolicyRefs: readonly string[];
  readonly contentModes: readonly InstructionCausalContentMode[];
  readonly contentRefs: readonly string[];
  readonly contentDigests: readonly string[];
  readonly contentExcerpts: readonly string[];
  readonly payloadRefs: readonly string[];
  readonly payloadDigests: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly requiredInputRefs: readonly string[];
  readonly missingInputRefs: readonly string[];
  readonly bindings: readonly InstructionCausalInputBinding[];
  readonly reason: string | null;
}

export class TargetCarrierClosureRejectedError extends Error {
  readonly targetCarrierContractRef: string;
  readonly status: TargetCarrierAdmissionStatus;

  constructor(projection: TargetCarrierAdmissionProjection) {
    super(
      `Target carrier contract ${projection.targetCarrierContractRef} is ${projection.status}`
    );
    this.name = "TargetCarrierClosureRejectedError";
    this.targetCarrierContractRef = projection.targetCarrierContractRef;
    this.status = projection.status;
  }
}

function isPayloadLedgerSourceEvent(
  event: RuntimeEvent
): event is PayloadLedgerSourceEvent {
  return (
    event.kind === "payload_observed" ||
    event.kind === "payload_validated" ||
    event.kind === "payload_rejected" ||
    event.kind === "actor_result_artifact_observed" ||
    event.kind === "authority_snapshot_admitted" ||
    event.kind === "evidence_admitted" ||
    event.kind === "ambiguity_observation_admitted" ||
    event.kind === "closure_input_published"
  );
}

function matchesScope(
  event: PayloadLedgerSourceEvent,
  scope: PayloadLedgerScope
): boolean {
  return (
    event.basisId === scope.basisId &&
    event.graphCallId === scope.graphCallId &&
    event.frameId === scope.frameId &&
    event.vectorIndex === scope.vectorIndex &&
    event.edge === scope.edge
  );
}

function ensureScopeMatchesAssurance(
  payloadScope: PayloadLedgerScope,
  assuranceScope: AssuranceScopeRef
): void {
  if (
    payloadScope.basisId !== assuranceScope.basisId ||
    payloadScope.graphFunctionId !== assuranceScope.graphFunctionId ||
    payloadScope.graphCallId !== assuranceScope.graphCallId ||
    payloadScope.frameId !== assuranceScope.frameId ||
    payloadScope.vectorIndex !== assuranceScope.vectorIndex ||
    payloadScope.edge !== assuranceScope.edge
  ) {
    throw new TypeError(
      "Payload ledger scope does not match assurance scope"
    );
  }
}

function hasPayloadRef(
  event: AmbiguityObservationAdmittedRuntimeEvent
): event is AmbiguityObservationAdmittedRuntimeEvent & {
  readonly payloadRef: string;
} {
  return event.payloadRef !== null;
}

function payloadLedgerProjectionRef(input: PayloadLedgerProjection): string {
  return [
    "payload_ledger_projection",
    input.scope.basisId,
    input.scope.graphCallId,
    input.scope.frameId,
    String(input.scope.vectorIndex),
    `target_carrier=${input.targetCarrierContract.contractRef}`,
    `target_carrier_digest=${input.targetCarrierContract.configDigest}`,
    `observed=${input.observedPayloads.map((event) => event.payloadRef).join(",")}`,
    `validated=${input.validatedPayloads.map((event) => event.validationRef).join(",")}`,
    `rejected=${input.rejectedPayloads.map((event) => `${event.payloadRef}/${event.rejectionClass}`).join(",")}`,
    `artifacts=${input.actorResultArtifacts.map((event) => `${event.resultRef}/${event.artifactRef}/${event.artifactContentDigest ?? "null"}`).join(",")}`,
    `authority=${input.authoritySnapshots.map((event) => event.authoritySnapshotRef).join(",")}`,
    `evidence=${input.evidenceRows.map((event) => event.evidenceRef).join(",")}`,
    `ambiguity=${input.ambiguityObservations.map((event) => event.ambiguityRef).join(",")}`,
    `closure=${input.closureInputs.map((event) => event.closureInputRef).join(",")}`
  ].join(":");
}

function uniqueStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function lifecycleForObservedPayload(
  event: PayloadObservedRuntimeEvent | undefined
): IterationEvidenceLifecycle {
  return event?.payloadClass === "admitted_plugin_result_envelope"
    ? "preserved_rebased"
    : "active";
}

function admittedOutputAuthorityProjectionRef(
  input: Omit<AdmittedOutputAuthorityProjection, "projectionRef">
): string {
  return [
    "admitted_output_authority_projection",
    input.scope.basisId,
    input.scope.graphCallId,
    input.scope.frameId,
    String(input.scope.vectorIndex),
    `target_carrier=${input.targetCarrierContractRef}`,
    `target_carrier_digest=${input.targetCarrierContractDigest}`,
    `status=${input.status}`,
    `payload=${input.payloadRef ?? "null"}`,
    `validations=${input.validationRefs.join(",")}`,
    `evidence=${input.evidenceRefs.join(",")}`
  ].join(":");
}

function instructionCausalInputBindingRef(
  input: Omit<InstructionCausalInputBinding, "kind" | "bindingRef">
): string {
  return [
    "instruction_causal_input",
    input.targetBasisId,
    input.targetGraphCallId,
    input.targetFrameId,
    String(input.targetVectorIndex),
    `role=${input.bindingRole}`,
    `source=${input.sourceVectorIndex}`,
    `source_asset=${input.sourceAssetKind}`,
    `target_asset=${input.targetAssetKind}`,
    `policy=${input.bindingPolicyRef}`,
    `content_mode=${input.contentMode}`,
    `payload=${input.payloadRef}`,
    `digest=${input.payloadDigest}`,
    `evidence=${input.evidenceRefs.join(",")}`
  ].join(":");
}

function instructionCausalContextProjectionRef(
  input: Omit<InstructionCausalContextProjection, "kind" | "contextRef">
): string {
  return [
    "instruction_causal_context",
    input.basisId,
    input.graphCallId,
    input.frameId,
    String(input.vectorIndex),
    `status=${input.status}`,
    `bindings=${input.bindingRefs.join(",")}`,
    `required=${input.requiredInputRefs.join(",")}`,
    `missing=${input.missingInputRefs.join(",")}`
  ].join(":");
}

function assetKindForTarget(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): string {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Instruction causal asset-kind vector index out of range");
  }
  return vector.target.assetSurface.kind;
}

function requiredInputAssetKindsForVector(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
}): readonly string[] {
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Instruction causal required-input vector index out of range");
  }
  return uniqueStringArray(vector.target.assetSurface.constructorInputAssetKinds);
}

function instructionCausalRequiredInputRef(input: {
  readonly basisId: string;
  readonly vectorIndex: number;
  readonly assetKind: string;
}): string {
  return [
    "instruction_causal_required_input",
    input.basisId,
    String(input.vectorIndex),
    `asset_kind=${input.assetKind}`
  ].join(":");
}

function instructionCausalBindingPolicyRef(input: {
  readonly basis: ExecutionBasis;
  readonly targetVectorIndex: number;
  readonly sourceAssetKind: string;
}): string {
  const vector = input.basis.graph.vectors[input.targetVectorIndex];
  if (vector === undefined) {
    throw new TypeError("Instruction causal policy vector index out of range");
  }
  return (
    vector.target.assetSurface.renderedViewDigestPolicyRef ??
    [
      "policy://abg/instruction-causal",
      "ref-digest-only",
      `source=${input.sourceAssetKind}`,
      `target=${vector.target.assetSurface.kind}`
    ].join("/")
  );
}

function instructionCausalContentMode(
  policyRef: string
): InstructionCausalContentMode {
  const normalized = policyRef.toLowerCase();
  if (
    normalized.includes("full_content") ||
    normalized.includes("full-content")
  ) {
    return "full_content";
  }
  if (normalized.includes("excerpt")) {
    return "excerpt";
  }
  return "ref_digest_only";
}

function actorResultArtifactForAuthority(input: {
  readonly ledger: PayloadLedgerProjection;
  readonly sourceEventRef: string | null;
}): ActorResultArtifactObservedEvent | undefined {
  if (input.sourceEventRef === null) {
    return undefined;
  }
  return input.ledger.actorResultArtifacts
    .filter(
      (event) =>
        event.resultRef === input.sourceEventRef ||
        event.artifactRef === input.sourceEventRef
    )
    .at(-1);
}

function actorResultArtifactForObservedPayload(input: {
  readonly ledger: PayloadLedgerProjection;
  readonly observed: PayloadObservedRuntimeEvent | undefined;
}): ActorResultArtifactObservedEvent | undefined {
  if (input.observed === undefined) {
    return undefined;
  }
  return actorResultArtifactForAuthority({
    ledger: input.ledger,
    sourceEventRef: input.observed.sourceEventRef
  });
}

function sameVectorRetryRepairBindings(input: {
  readonly targetScope: PayloadLedgerScope;
  readonly targetAssetKind: string;
  readonly ledger: PayloadLedgerProjection;
}): readonly InstructionCausalInputBinding[] {
  if (input.ledger.rejectedPayloads.length === 0) {
    return Object.freeze([]);
  }
  const observedByPayloadRef = new Map(
    input.ledger.observedPayloads.map((event) => [event.payloadRef, event])
  );
  return Object.freeze(
    input.ledger.rejectedPayloads.map((rejected) => {
      const observed = observedByPayloadRef.get(rejected.payloadRef);
      const artifact = actorResultArtifactForObservedPayload({
        ledger: input.ledger,
        observed
      });
      const sourceEventRef = [
        "event:payload_rejected",
        rejected.payloadRef,
        rejected.rejectionClass
      ].join(":");
      const contentExcerpt = [
        `Rejected same-vector candidate payload ${rejected.payloadRef}.`,
        `rejectionClass: ${rejected.rejectionClass}`,
        `reason: ${rejected.reason}`,
        artifact?.artifactContentExcerpt === null ||
        artifact?.artifactContentExcerpt === undefined
          ? null
          : `artifactExcerpt: ${artifact.artifactContentExcerpt}`
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
      const contentDigest =
        artifact?.artifactContentDigest ?? rejected.digest ?? observed?.digest ?? null;
      const payloadDigest =
        rejected.digest ??
        observed?.digest ??
        [
          "digest:rejected_payload",
          rejected.payloadRef,
          rejected.rejectionClass
        ].join(":");
      const partial = Object.freeze({
        targetBasisId: input.targetScope.basisId,
        targetGraphCallId: input.targetScope.graphCallId,
        targetFrameId: input.targetScope.frameId,
        targetVectorIndex: input.targetScope.vectorIndex,
        targetEdge: input.targetScope.edge,
        targetAssetKind: input.targetAssetKind,
        sourceVectorIndex: input.targetScope.vectorIndex,
        sourceEdge: input.targetScope.edge,
        sourceAssetKind: input.targetAssetKind,
        bindingRole: "same_vector_retry_repair" as const,
        bindingPolicyRef: [
          "instruction_causal_retry_repair_policy",
          input.targetScope.basisId,
          String(input.targetScope.vectorIndex),
          rejected.payloadRef
        ].join(":"),
        contentMode: "excerpt" as const,
        contentRef: artifact?.artifactRef ?? observed?.sourceEventRef ?? null,
        contentDigest,
        contentExcerpt,
        required: false,
        payloadRef: rejected.payloadRef,
        payloadClass: observed?.payloadClass ?? "rejected_target_candidate",
        payloadDigest,
        payloadContractRef: rejected.contractRef,
        producerRef: observed?.producerRef ?? "unknown_rejected_payload_producer",
        sourceEventRef,
        authorityRef: observed?.authorityRef ?? null,
        inputDigest: observed?.inputDigest ?? null,
        evidenceRefs: freezeStringArray([
          sourceEventRef,
          ...(observed === undefined
            ? []
            : [`event:payload_observed:${observed.payloadRef}`]),
          ...(artifact === undefined
            ? []
            : [`event:actor_result_artifact_observed:${artifact.artifactRef}`])
        ]),
        sourceProjectionRef: sourceEventRef
      });
      return Object.freeze({
        kind: "instruction_causal_input_binding" as const,
        bindingRef: instructionCausalInputBindingRef(partial),
        ...partial
      });
    })
  );
}

export function derivePayloadLedgerScope(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}): PayloadLedgerScope {
  assertProjectionBasis(
    input.basis,
    input.runtimeProjection,
    "PayloadLedgerScope"
  );
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "payload_ledger_scope",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId:
      input.runtimeProjection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.runtimeProjection.frameId ?? frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex)
  });
}

export function derivePayloadLedgerProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly events: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): PayloadLedgerProjection {
  const scope = derivePayloadLedgerScope(input);
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("Payload ledger vector index out of range");
  }
  const targetCarrierContract = resolveTargetCarrierContractBinding({
    vector,
    defaults: input.targetCarrierDefaults
  });
  const sourceEvents = input.events
    .filter(isPayloadLedgerSourceEvent)
    .filter((event) => matchesScope(event, scope));

  const partial = Object.freeze({
    kind: "payload_ledger_projection" as const,
    scope,
    targetCarrierContract,
    observedPayloads: Object.freeze(
      sourceEvents.filter(
        (event): event is PayloadObservedRuntimeEvent =>
          event.kind === "payload_observed"
      )
    ),
    validatedPayloads: Object.freeze(
      sourceEvents.filter(
        (event): event is PayloadValidatedRuntimeEvent =>
          event.kind === "payload_validated"
      )
    ),
    rejectedPayloads: Object.freeze(
      sourceEvents.filter(
        (event): event is PayloadRejectedRuntimeEvent =>
          event.kind === "payload_rejected"
      )
    ),
    actorResultArtifacts: Object.freeze(
      sourceEvents.filter(
        (event): event is ActorResultArtifactObservedEvent =>
          event.kind === "actor_result_artifact_observed"
      )
    ),
    authoritySnapshots: Object.freeze(
      sourceEvents.filter(
        (event): event is AuthoritySnapshotAdmittedRuntimeEvent =>
          event.kind === "authority_snapshot_admitted"
      )
    ),
    evidenceRows: Object.freeze(
      sourceEvents.filter(
        (event): event is EvidenceAdmittedRuntimeEvent =>
          event.kind === "evidence_admitted"
      )
    ),
    ambiguityObservations: Object.freeze(
      sourceEvents.filter(
        (event): event is AmbiguityObservationAdmittedRuntimeEvent =>
          event.kind === "ambiguity_observation_admitted"
      )
    ),
    closureInputs: Object.freeze(
      sourceEvents.filter(
        (event): event is ClosureInputPublishedRuntimeEvent =>
          event.kind === "closure_input_published"
      )
    )
  });

  return Object.freeze({
    ...partial,
    projectionRef: payloadLedgerProjectionRef({
      ...partial,
      projectionRef: "pending"
    })
  });
}

type TargetCarrierDecisionEvent =
  | {
      readonly kind: "admitted";
      readonly event: PayloadValidatedRuntimeEvent;
      readonly index: number;
    }
  | {
      readonly kind: "rejected";
      readonly event: PayloadRejectedRuntimeEvent;
      readonly index: number;
    };

function eventAdmissionOrdinal(event: object): number | null {
  const ordinal = (event as { readonly eventAdmissionOrdinal?: unknown })
    .eventAdmissionOrdinal;
  return typeof ordinal === "number" && Number.isFinite(ordinal) ? ordinal : null;
}

function compareTargetCarrierDecisions(
  left: TargetCarrierDecisionEvent,
  right: TargetCarrierDecisionEvent
): number {
  const leftOrdinal = eventAdmissionOrdinal(left.event);
  const rightOrdinal = eventAdmissionOrdinal(right.event);
  if (leftOrdinal !== null && rightOrdinal !== null) {
    return leftOrdinal - rightOrdinal;
  }
  if (leftOrdinal !== null) {
    return 1;
  }
  if (rightOrdinal !== null) {
    return -1;
  }
  const leftFallback = left.kind === "rejected" ? 1 : 0;
  const rightFallback = right.kind === "rejected" ? 1 : 0;
  if (leftFallback !== rightFallback) {
    return leftFallback - rightFallback;
  }
  return left.index - right.index;
}

function latestTargetCarrierDecision(input: {
  readonly validatedPayloads: readonly PayloadValidatedRuntimeEvent[];
  readonly rejectedPayloads: readonly PayloadRejectedRuntimeEvent[];
}): TargetCarrierDecisionEvent | null {
  const decisions: TargetCarrierDecisionEvent[] = [
    ...input.validatedPayloads.map((event, index) =>
      Object.freeze({ kind: "admitted" as const, event, index })
    ),
    ...input.rejectedPayloads.map((event, index) =>
      Object.freeze({ kind: "rejected" as const, event, index })
    )
  ];
  return decisions.sort(compareTargetCarrierDecisions).at(-1) ?? null;
}

export function deriveTargetCarrierAdmissionProjection(input: {
  readonly ledger: PayloadLedgerProjection;
  readonly payloadRef?: string | null | undefined;
}): TargetCarrierAdmissionProjection {
  const payloadRef = input.payloadRef ?? null;
  const contractRef = input.ledger.targetCarrierContract.contractRef;
  const contractDigest = input.ledger.targetCarrierContract.configDigest;
  const validatedPayloads = input.ledger.validatedPayloads.filter(
    (event) =>
      event.contractRef === contractRef &&
      event.contractDigest === contractDigest &&
      (payloadRef === null || event.payloadRef === payloadRef)
  );
  const rejectedPayloads = input.ledger.rejectedPayloads.filter(
    (event) =>
      event.contractRef === contractRef &&
      event.contractDigest === contractDigest &&
      (payloadRef === null || event.payloadRef === payloadRef)
  );

  if (payloadRef === null) {
    const latestDecision = latestTargetCarrierDecision({
      validatedPayloads,
      rejectedPayloads
    });
    if (latestDecision?.kind === "rejected") {
      return Object.freeze({
        kind: "target_carrier_admission_projection",
        targetCarrierContractRef: contractRef,
        targetCarrierContractDigest: contractDigest,
        status: "rejected",
        payloadRef: latestDecision.event.payloadRef,
        validationRefs: freezeStringArray([]),
        rejectedPayloadRefs: freezeStringArray([latestDecision.event.payloadRef]),
        reason: latestDecision.event.reason
      });
    }
    if (latestDecision?.kind === "admitted") {
      return Object.freeze({
        kind: "target_carrier_admission_projection",
        targetCarrierContractRef: contractRef,
        targetCarrierContractDigest: contractDigest,
        status: "admitted",
        payloadRef: latestDecision.event.payloadRef,
        validationRefs: freezeStringArray([latestDecision.event.validationRef]),
        rejectedPayloadRefs: freezeStringArray([]),
        reason: null
      });
    }
  }

  const targetPayloadRef =
    payloadRef ??
    rejectedPayloads.at(-1)?.payloadRef ??
    validatedPayloads.at(-1)?.payloadRef ??
    null;

  if (rejectedPayloads.length > 0) {
    return Object.freeze({
      kind: "target_carrier_admission_projection",
      targetCarrierContractRef: contractRef,
      targetCarrierContractDigest: contractDigest,
      status: "rejected",
      payloadRef: targetPayloadRef,
      validationRefs: freezeStringArray(
        validatedPayloads.map((event) => event.validationRef)
      ),
      rejectedPayloadRefs: freezeStringArray(
        rejectedPayloads.map((event) => event.payloadRef)
      ),
      reason: rejectedPayloads.at(-1)?.reason ?? "target carrier rejected"
    });
  }

  if (validatedPayloads.length > 0) {
    return Object.freeze({
      kind: "target_carrier_admission_projection",
      targetCarrierContractRef: contractRef,
      targetCarrierContractDigest: contractDigest,
      status: "admitted",
      payloadRef: targetPayloadRef,
      validationRefs: freezeStringArray(
        validatedPayloads.map((event) => event.validationRef)
      ),
      rejectedPayloadRefs: freezeStringArray([]),
      reason: null
    });
  }

  return Object.freeze({
    kind: "target_carrier_admission_projection",
    targetCarrierContractRef: contractRef,
    targetCarrierContractDigest: contractDigest,
    status: "missing",
    payloadRef: targetPayloadRef,
    validationRefs: freezeStringArray([]),
    rejectedPayloadRefs: freezeStringArray([]),
    reason: "target carrier contract has no admitted payload"
  });
}

export function deriveAdmittedOutputAuthorityProjection(input: {
  readonly ledger: PayloadLedgerProjection;
  readonly payloadRef?: string | null | undefined;
}): AdmittedOutputAuthorityProjection {
  const targetCarrierAdmission = deriveTargetCarrierAdmissionProjection({
    ledger: input.ledger,
    payloadRef: input.payloadRef
  });
  const relatedPayloadRefs = uniqueStringArray([
    ...input.ledger.observedPayloads.map((event) => event.payloadRef),
    ...input.ledger.validatedPayloads.map((event) => event.payloadRef),
    ...input.ledger.rejectedPayloads.map((event) => event.payloadRef)
  ]);
  const targetPayloadRef = targetCarrierAdmission.payloadRef;
  const observed =
    targetPayloadRef === null
      ? undefined
      : input.ledger.observedPayloads
          .filter((event) => event.payloadRef === targetPayloadRef)
          .at(-1);
  const validated =
    targetPayloadRef === null
      ? undefined
      : input.ledger.validatedPayloads
          .filter(
            (event) =>
              event.payloadRef === targetPayloadRef &&
              event.contractRef === targetCarrierAdmission.targetCarrierContractRef &&
              event.contractDigest ===
                targetCarrierAdmission.targetCarrierContractDigest
          )
          .at(-1);
  const payloadEvidenceRefs =
    targetPayloadRef === null
      ? Object.freeze([])
      : uniqueStringArray(
          input.ledger.evidenceRows
            .filter((event) => event.payloadRef === targetPayloadRef)
            .map((event) => event.evidenceRef)
        );
  const evidenceRefs =
    targetCarrierAdmission.status === "admitted"
      ? uniqueStringArray([
          ...payloadEvidenceRefs,
          ...targetCarrierAdmission.validationRefs
        ])
      : payloadEvidenceRefs;

  let status: AdmittedOutputAuthorityStatus = targetCarrierAdmission.status;
  let reason = targetCarrierAdmission.reason;
  if (
    targetCarrierAdmission.status === "admitted" &&
    (observed === undefined || validated === undefined)
  ) {
    status = "missing";
    reason =
      observed === undefined
        ? "target carrier payload validation lacks observed payload envelope"
        : "target carrier payload validation is not current ledger evidence";
  }
  if (
    targetCarrierAdmission.status === "admitted" &&
    observed !== undefined &&
    validated !== undefined &&
    observed.digest !== validated.digest
  ) {
    status = "missing";
    reason = "target carrier payload digest drift";
  }
  const isAdmitted = status === "admitted" && observed !== undefined;
  const partial = Object.freeze({
    kind: "admitted_output_authority_projection" as const,
    scope: input.ledger.scope,
    targetCarrierContractRef: targetCarrierAdmission.targetCarrierContractRef,
    targetCarrierContractDigest:
      targetCarrierAdmission.targetCarrierContractDigest,
    status,
    reason,
    payloadRef: isAdmitted ? observed.payloadRef : null,
    payloadClass: isAdmitted ? observed.payloadClass : null,
    payloadDigest: isAdmitted ? observed.digest : null,
    payloadContractRef: isAdmitted ? observed.contractRef : null,
    producerRef: isAdmitted ? observed.producerRef : null,
    sourceEventRef: isAdmitted ? observed.sourceEventRef : null,
    authorityRef: isAdmitted ? observed.authorityRef : null,
    inputDigest: isAdmitted ? observed.inputDigest : null,
    validationRefs:
      status === "admitted"
        ? targetCarrierAdmission.validationRefs
        : freezeStringArray([]),
    evidenceRefs: status === "admitted" ? evidenceRefs : freezeStringArray([]),
    relatedPayloadRefs
  });

  return Object.freeze({
    ...partial,
    projectionRef: admittedOutputAuthorityProjectionRef(partial)
  });
}

export function deriveInstructionCausalContextProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly events: readonly RuntimeEvent[];
  readonly vectorIndex: number;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): InstructionCausalContextProjection {
  const targetScope = derivePayloadLedgerScope(input);
  const targetAssetKind = assetKindForTarget({
    basis: input.basis,
    vectorIndex: input.vectorIndex
  });
  const requiredInputAssetKinds = requiredInputAssetKindsForVector({
    basis: input.basis,
    vectorIndex: input.vectorIndex
  });
  const requiredInputRefs = freezeStringArray(
    requiredInputAssetKinds.map((assetKind) =>
      instructionCausalRequiredInputRef({
        basisId: input.basis.id,
        vectorIndex: input.vectorIndex,
        assetKind
      })
    )
  );
  const requiredInputAssetKindSet = new Set(requiredInputAssetKinds);
  const bindings: InstructionCausalInputBinding[] = [];
  const missingInputRefs: string[] = [];
  const targetLedger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: input.events,
    vectorIndex: input.vectorIndex,
    targetCarrierDefaults: input.targetCarrierDefaults
  });
  bindings.push(
    ...sameVectorRetryRepairBindings({
      targetScope,
      targetAssetKind,
      ledger: targetLedger
    })
  );
  const requiredSourceVectorIndexes = input.runtimeProjection.closedVectorIndexes
    .filter((index) => index < input.vectorIndex)
    .filter((index) => {
      if (requiredInputAssetKindSet.size === 0) {
        return true;
      }
      const sourceAssetKind = assetKindForTarget({
        basis: input.basis,
        vectorIndex: index
      });
      return requiredInputAssetKindSet.has(sourceAssetKind);
    })
    .sort((left, right) => left - right);

  for (const sourceVectorIndex of requiredSourceVectorIndexes) {
    const ledger = derivePayloadLedgerProjection({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      events: input.events,
      vectorIndex: sourceVectorIndex,
      targetCarrierDefaults: input.targetCarrierDefaults
    });
    const authority = deriveAdmittedOutputAuthorityProjection({ ledger });
    if (authority.status !== "admitted") {
      if (
        authority.status === "missing" &&
        authority.reason !== "target carrier payload digest drift"
      ) {
        continue;
      }
      missingInputRefs.push(
        [
          "instruction_causal_missing_input",
          input.basis.id,
          String(input.vectorIndex),
          `source=${sourceVectorIndex}`,
          authority.reason ?? authority.status
        ].join(":")
      );
      continue;
    }
    if (
      authority.payloadRef === null ||
      authority.payloadClass === null ||
      authority.payloadDigest === null ||
      authority.producerRef === null
    ) {
      missingInputRefs.push(
        [
          "instruction_causal_missing_input",
          input.basis.id,
          String(input.vectorIndex),
          `source=${sourceVectorIndex}`,
          "admitted_projection_missing_payload_identity"
        ].join(":")
      );
      continue;
    }
    const sourceAssetKind = assetKindForTarget({
      basis: input.basis,
      vectorIndex: sourceVectorIndex
    });
    const bindingPolicyRef = instructionCausalBindingPolicyRef({
      basis: input.basis,
      targetVectorIndex: input.vectorIndex,
      sourceAssetKind
    });
    const contentMode = instructionCausalContentMode(bindingPolicyRef);
    const artifact = actorResultArtifactForAuthority({
      ledger,
      sourceEventRef: authority.sourceEventRef
    });
    const contentRef = artifact?.artifactRef ?? null;
    const contentDigest = artifact?.artifactContentDigest ?? null;
    const contentExcerpt = artifact?.artifactContentExcerpt ?? null;
    if (
      contentMode === "excerpt" &&
      (contentRef === null || contentDigest === null || contentExcerpt === null)
    ) {
      missingInputRefs.push(
        [
          "instruction_causal_content_unavailable",
          input.basis.id,
          String(input.vectorIndex),
          `source=${sourceVectorIndex}`,
          `source_asset=${sourceAssetKind}`,
          `content_mode=${contentMode}`,
          "admitted artifact content excerpt is missing"
        ].join(":")
      );
      continue;
    }
    if (contentMode === "full_content") {
      missingInputRefs.push(
        [
          "instruction_causal_content_unavailable",
          input.basis.id,
          String(input.vectorIndex),
          `source=${sourceVectorIndex}`,
          `source_asset=${sourceAssetKind}`,
          `content_mode=${contentMode}`,
          "admitted full content body is not available in this slice"
        ].join(":")
      );
      continue;
    }
    const partial = Object.freeze({
      targetBasisId: targetScope.basisId,
      targetGraphCallId: targetScope.graphCallId,
      targetFrameId: targetScope.frameId,
      targetVectorIndex: targetScope.vectorIndex,
      targetEdge: targetScope.edge,
      targetAssetKind,
      sourceVectorIndex,
      sourceEdge: ledger.scope.edge,
      sourceAssetKind,
      bindingRole: "prior_target_output" as const,
      bindingPolicyRef,
      contentMode,
      contentRef,
      contentDigest,
      contentExcerpt,
      required: requiredInputAssetKindSet.has(sourceAssetKind),
      payloadRef: authority.payloadRef,
      payloadClass: authority.payloadClass,
      payloadDigest: authority.payloadDigest,
      payloadContractRef: authority.payloadContractRef,
      producerRef: authority.producerRef,
      sourceEventRef: authority.sourceEventRef,
      authorityRef: authority.authorityRef,
      inputDigest: authority.inputDigest,
      evidenceRefs: freezeStringArray(authority.evidenceRefs),
      sourceProjectionRef: authority.projectionRef
    });
    bindings.push(
      Object.freeze({
        kind: "instruction_causal_input_binding" as const,
        bindingRef: instructionCausalInputBindingRef(partial),
        ...partial
      })
    );
  }

  const satisfiedRequiredAssetKinds = new Set(
    bindings
      .filter((binding) => binding.required)
      .map((binding) => binding.sourceAssetKind)
  );
  for (const assetKind of requiredInputAssetKinds) {
    if (!satisfiedRequiredAssetKinds.has(assetKind)) {
      missingInputRefs.push(
        [
          "instruction_causal_required_input_missing",
          input.basis.id,
          String(input.vectorIndex),
          `asset_kind=${assetKind}`
        ].join(":")
      );
    }
  }

  const bindingRefs = freezeStringArray(
    bindings.map((binding) => binding.bindingRef)
  );
  const bindingPolicyRefs = freezeStringArray(
    bindings.map((binding) => binding.bindingPolicyRef)
  );
  const contentModes = Object.freeze(
    bindings.map((binding) => binding.contentMode)
  );
  const contentRefs = freezeStringArray(
    bindings.flatMap((binding) =>
      binding.contentRef === null ? [] : [binding.contentRef]
    )
  );
  const contentDigests = freezeStringArray(
    bindings.flatMap((binding) =>
      binding.contentDigest === null ? [] : [binding.contentDigest]
    )
  );
  const contentExcerpts = freezeStringArray(
    bindings.flatMap((binding) =>
      binding.contentExcerpt === null ? [] : [binding.contentExcerpt]
    )
  );
  const payloadRefs = freezeStringArray(
    bindings.map((binding) => binding.payloadRef)
  );
  const payloadDigests = freezeStringArray(
    bindings.map((binding) => binding.payloadDigest)
  );
  const evidenceRefs = uniqueStringArray(
    bindings.flatMap((binding) => binding.evidenceRefs)
  );
  const sourceProjectionRefs = freezeStringArray(
    bindings.map((binding) => binding.sourceProjectionRef)
  );
  const frozenMissingInputRefs = freezeStringArray(missingInputRefs);
  const status =
    frozenMissingInputRefs.length > 0
      ? "blocked"
      : bindingRefs.length > 0
        ? "bound"
        : "empty";
  const partial = Object.freeze({
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: targetScope.graphCallId,
    frameId: targetScope.frameId,
    vectorIndex: input.vectorIndex,
    edge: targetScope.edge,
    status,
    bindingRefs,
    bindingPolicyRefs,
    contentModes,
    contentRefs,
    contentDigests,
    contentExcerpts,
    payloadRefs,
    payloadDigests,
    evidenceRefs,
    sourceProjectionRefs,
    requiredInputRefs,
    missingInputRefs: frozenMissingInputRefs,
    bindings: Object.freeze([...bindings]),
    reason:
      status === "blocked"
        ? "required prior admitted output is missing or stale"
        : null
  });
  return Object.freeze({
    kind: "instruction_causal_context_projection",
    contextRef: instructionCausalContextProjectionRef(partial),
    ...partial
  });
}

export function assertTargetCarrierAdmittedForClosure(
  projection: TargetCarrierAdmissionProjection
): void {
  if (projection.status !== "admitted") {
    throw new TargetCarrierClosureRejectedError(projection);
  }
}

export function deriveAssuranceAuthoritySnapshotFromPayloadLedger(input: {
  readonly assuranceScope: AssuranceScopeRef;
  readonly ledger: PayloadLedgerProjection;
  readonly authoritySnapshotRef?: string;
}): AssuranceAuthoritySnapshot {
  ensureScopeMatchesAssurance(input.ledger.scope, input.assuranceScope);
  const candidates =
    input.authoritySnapshotRef === undefined
      ? input.ledger.authoritySnapshots
      : input.ledger.authoritySnapshots.filter(
          (event) => event.authoritySnapshotRef === input.authoritySnapshotRef
        );
  const snapshot = candidates.at(-1);
  if (snapshot === undefined) {
    throw new TypeError("Payload ledger has no admitted authority snapshot");
  }
  return constructAssuranceAuthoritySnapshot({
    scope: input.assuranceScope,
    authorityRefs: snapshot.authorityRefs,
    inputRefs: snapshot.inputRefs,
    authorityDigest: snapshot.authorityDigest,
    inputDigest: snapshot.inputDigest,
    closureCapable: snapshot.closureCapable,
    contradictoryAuthority: snapshot.contradictoryAuthority,
    deferredAuthorityRefs: snapshot.deferredAuthorityRefs,
    providerRefs: snapshot.providerRefs,
    policyRefs: snapshot.policyRefs
  });
}

export function deriveAssuranceEvidenceRowsFromPayloadLedger(input: {
  readonly assuranceScope: AssuranceScopeRef;
  readonly ledger: PayloadLedgerProjection;
}): readonly AssuranceEvidenceRow[] {
  ensureScopeMatchesAssurance(input.ledger.scope, input.assuranceScope);
  const observedByPayloadRef = new Map(
    input.ledger.observedPayloads.map((event) => [event.payloadRef, event])
  );
  const rejectedPayloadRefs = new Set(
    input.ledger.rejectedPayloads.map((event) => event.payloadRef)
  );
  const contradictoryPayloadRefs = new Set(
    input.ledger.ambiguityObservations
      .filter(hasPayloadRef)
      .filter(
        (event) =>
          (event.ambiguityStatus === "contradictory_evidence" ||
            event.ambiguityStatus === "event_ledger_invalid")
      )
      .map((event) => event.payloadRef)
  );
  const acceptedPayloadEvents = new Map(
    input.ledger.validatedPayloads
      .filter((validated) => {
        const observed = observedByPayloadRef.get(validated.payloadRef);
        return (
          observed !== undefined &&
          observed.digest === validated.digest &&
          !rejectedPayloadRefs.has(validated.payloadRef) &&
          !contradictoryPayloadRefs.has(validated.payloadRef)
        );
      })
      .map((event) => [event.payloadRef, event])
  );
  return Object.freeze(
    input.ledger.evidenceRows.map((event) => {
      const observed = observedByPayloadRef.get(event.payloadRef);
      const validated = acceptedPayloadEvents.get(event.payloadRef);
      const payloadAccepted = observed !== undefined && validated !== undefined;
      return constructAssuranceEvidenceRow({
        scope: input.assuranceScope,
        evidenceRef: event.evidenceRef,
        authorityRef: event.authorityRef,
        authorityDigest: event.authorityDigest,
        inputDigest: event.inputDigest,
        eventRefs: freezeStringArray([
          ...(observed === undefined
            ? []
            : [`event:payload_observed:${observed.payloadRef}`]),
          ...(validated === undefined
            ? []
            : [`event:payload_validated:${validated.validationRef}`]),
          ...input.ledger.rejectedPayloads
            .filter((rejected) => rejected.payloadRef === event.payloadRef)
            .map(
              (rejected) =>
                `event:payload_rejected:${rejected.payloadRef}:${rejected.rejectionClass}`
            ),
          ...input.ledger.ambiguityObservations
            .filter((observation) => observation.payloadRef === event.payloadRef)
            .map(
              (observation) =>
                `event:ambiguity_observation_admitted:${observation.ambiguityRef}`
            ),
          `event:evidence_admitted:${event.evidenceRef}`
        ]),
        providerRefs: event.providerRefs,
        policyRefs: event.policyRefs,
        boundToScope: payloadAccepted,
        complete: payloadAccepted && event.complete,
        shallow: !payloadAccepted || event.shallow,
        contradictsAuthority: event.contradictsAuthority,
        deferred: event.deferred,
        lifecycle: lifecycleForObservedPayload(observed)
      });
    })
  );
}
