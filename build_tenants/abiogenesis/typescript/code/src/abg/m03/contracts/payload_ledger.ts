// Implements: REQ-R-ABG3-PAYLOAD
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-ASSURANCE

import type {
  AmbiguityObservationAdmittedRuntimeEvent,
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
    `authority=${input.authoritySnapshots.map((event) => event.authoritySnapshotRef).join(",")}`,
    `evidence=${input.evidenceRows.map((event) => event.evidenceRef).join(",")}`,
    `ambiguity=${input.ambiguityObservations.map((event) => event.ambiguityRef).join(",")}`,
    `closure=${input.closureInputs.map((event) => event.closureInputRef).join(",")}`
  ].join(":");
}

function uniqueStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
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
  const evidenceRefs =
    targetPayloadRef === null
      ? Object.freeze([])
      : uniqueStringArray(
          input.ledger.evidenceRows
            .filter((event) => event.payloadRef === targetPayloadRef)
            .map((event) => event.evidenceRef)
        );

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
        deferred: event.deferred
      });
    })
  );
}
