import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type {
  FpEvaluationFinding,
  FpEvaluationOutcome
} from "./plugins.js";
import type {
  ExecutionBasis,
  ExecutivePressureFactProjectedRuntimeEvent
} from "./carriers.js";
import type {
  RequirementSpanLineageProjection
} from "./requirements_algebra.js";
import {
  frameIdForBasis,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

const FORBIDDEN_EXECUTIVE_AUTHORITY_FIELDS = Object.freeze([
  "emit",
  "emitRuntimeEvent",
  "runtimeEvents",
  "ledgerWrites",
  "writeLedger",
  "closureAuthority",
  "traversalTransition",
  "continuationDecision",
  "mutateWorkspace",
  "graphMutation",
  "frameMutation"
]);

const EXECUTIVE_DISPOSITION_NONLOCAL_REENTRY_REF =
  "abg.executive.disposition://nonlocal_reentry";
const EXECUTIVE_DISPOSITION_REPRICE_REF =
  "abg.executive.disposition://reprice";
const EXECUTIVE_DISPOSITION_BLOCK_REF =
  "abg.executive.disposition://block";

export type ExecutivePressureDisposition =
  | "attenuated"
  | "non_attenuating_retry"
  | "local_repair"
  | "nonlocal_reentry"
  | "reprice"
  | "block"
  | "close_candidate";

export type ExecutivePressureAttenuation =
  | "cleared"
  | "narrowed"
  | "unchanged"
  | "escalated";

export interface ExecutiveObservationView {
  readonly kind: "abg_executive_observation_view";
  readonly observationRef: string;
  readonly observerGraphFunctionRef: string;
  readonly targetWorkspaceContextRef: string;
  readonly targetWorkspaceLocator: string;
  readonly targetWorkspaceDigest: string;
  readonly targetWorkRef: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly frameRefs: readonly string[];
  readonly replayEventRefs: readonly string[];
  readonly payloadLedgerRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly requirementIds: readonly string[];
  readonly spanLineage: readonly RequirementSpanLineageProjection[];
  readonly policyRefs: readonly string[];
  readonly hookRefs: readonly string[];
}

export interface ProjectExecutiveObservationViewInput {
  readonly observerGraphFunctionRef: string;
  readonly targetWorkspaceContextRef: string;
  readonly targetWorkspaceLocator: string;
  readonly targetWorkspaceDigest: string;
  readonly targetWorkRef: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly frameRefs?: readonly string[] | undefined;
  readonly replayEventRefs?: readonly string[] | undefined;
  readonly payloadLedgerRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly residualPressureRefs?: readonly string[] | undefined;
  readonly continuationRefs?: readonly string[] | undefined;
  readonly requirementIds?: readonly string[] | undefined;
  readonly spanLineage?: readonly RequirementSpanLineageProjection[] | undefined;
  readonly policyRefs?: readonly string[] | undefined;
  readonly hookRefs?: readonly string[] | undefined;
}

export interface ExecutivePressureFactProjection {
  readonly kind: "abg_executive_pressure_fact_projection";
  readonly pressureFactRef: string;
  readonly observationRef: string;
  readonly findingRef: string;
  readonly disposition: ExecutivePressureDisposition;
  readonly attenuation: ExecutivePressureAttenuation;
  readonly closeDisposition: FpEvaluationFinding["closeDisposition"];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
  readonly requirementIds: readonly string[];
  readonly spanRefs: readonly string[];
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
}

export interface ProjectExecutivePressureFactsInput {
  readonly observation: ExecutiveObservationView;
  readonly outcome: FpEvaluationOutcome;
  readonly priorResidualPressureRefs?: readonly string[] | undefined;
}

export interface ExecutiveContinuationInputProjection {
  readonly kind: "abg_executive_continuation_input_projection";
  readonly continuationInputRef: string;
  readonly observationRef: string;
  readonly pressureFactRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly reentryRefs: readonly string[];
  readonly repriceRefs: readonly string[];
  readonly blockedRefs: readonly string[];
  readonly closeCandidateRefs: readonly string[];
  readonly decision:
    | "retry_or_repair"
    | "yield_reentry"
    | "reprice"
    | "block"
    | "close_candidate";
}

function nonEmptyString(value: string, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function stringArray(
  value: readonly string[] | undefined,
  label: string
): readonly string[] {
  const array = value ?? Object.freeze([]);
  for (const item of array) {
    nonEmptyString(item, label);
  }
  return Object.freeze([...array]);
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function sameStringSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function isSubset(
  left: readonly string[],
  right: readonly string[]
): boolean {
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

export function assertExecutiveFindingHasNoRuntimeAuthority(
  finding: object
): void {
  const present = FORBIDDEN_EXECUTIVE_AUTHORITY_FIELDS.filter((field) =>
    Object.hasOwn(finding, field)
  );
  if (present.length > 0) {
    throw new TypeError(
      `Executive observer finding carries forbidden runtime authority fields: ${present.join(", ")}`
    );
  }
}

export function projectExecutiveObservationView(
  input: ProjectExecutiveObservationViewInput
): ExecutiveObservationView {
  const view = Object.freeze({
    kind: "abg_executive_observation_view" as const,
    observationRef: "",
    observerGraphFunctionRef: nonEmptyString(
      input.observerGraphFunctionRef,
      "ExecutiveObservationView.observerGraphFunctionRef"
    ),
    targetWorkspaceContextRef: nonEmptyString(
      input.targetWorkspaceContextRef,
      "ExecutiveObservationView.targetWorkspaceContextRef"
    ),
    targetWorkspaceLocator: nonEmptyString(
      input.targetWorkspaceLocator,
      "ExecutiveObservationView.targetWorkspaceLocator"
    ),
    targetWorkspaceDigest: nonEmptyString(
      input.targetWorkspaceDigest,
      "ExecutiveObservationView.targetWorkspaceDigest"
    ),
    targetWorkRef: nonEmptyString(
      input.targetWorkRef,
      "ExecutiveObservationView.targetWorkRef"
    ),
    selectedCompositionRef: nonEmptyString(
      input.selectedCompositionRef,
      "ExecutiveObservationView.selectedCompositionRef"
    ),
    selectedCompositionDigest: nonEmptyString(
      input.selectedCompositionDigest,
      "ExecutiveObservationView.selectedCompositionDigest"
    ),
    graphFunctionRef: nonEmptyString(
      input.graphFunctionRef,
      "ExecutiveObservationView.graphFunctionRef"
    ),
    graphVectorRef: nonEmptyString(
      input.graphVectorRef,
      "ExecutiveObservationView.graphVectorRef"
    ),
    frameRefs: stringArray(input.frameRefs, "ExecutiveObservationView.frameRefs"),
    replayEventRefs: stringArray(
      input.replayEventRefs,
      "ExecutiveObservationView.replayEventRefs"
    ),
    payloadLedgerRefs: stringArray(
      input.payloadLedgerRefs,
      "ExecutiveObservationView.payloadLedgerRefs"
    ),
    evidenceRefs: stringArray(
      input.evidenceRefs,
      "ExecutiveObservationView.evidenceRefs"
    ),
    residualPressureRefs: stringArray(
      input.residualPressureRefs,
      "ExecutiveObservationView.residualPressureRefs"
    ),
    continuationRefs: stringArray(
      input.continuationRefs,
      "ExecutiveObservationView.continuationRefs"
    ),
    requirementIds: stringArray(
      input.requirementIds,
      "ExecutiveObservationView.requirementIds"
    ),
    spanLineage: Object.freeze([...(input.spanLineage ?? Object.freeze([]))]),
    policyRefs: stringArray(input.policyRefs, "ExecutiveObservationView.policyRefs"),
    hookRefs: stringArray(input.hookRefs, "ExecutiveObservationView.hookRefs")
  });
  const observationRef = `abg-executive-observation:${stableSha256Digest(view)}`;
  return Object.freeze({ ...view, observationRef });
}

function attenuationKind(input: {
  readonly priorResidualPressureRefs: readonly string[];
  readonly residualPressureRefs: readonly string[];
}): ExecutivePressureAttenuation {
  if (input.residualPressureRefs.length === 0) {
    return "cleared";
  }
  if (input.priorResidualPressureRefs.length === 0) {
    return "escalated";
  }
  if (sameStringSet(input.residualPressureRefs, input.priorResidualPressureRefs)) {
    return "unchanged";
  }
  if (isSubset(input.residualPressureRefs, input.priorResidualPressureRefs)) {
    return "narrowed";
  }
  return "escalated";
}

function pressureDisposition(input: {
  readonly finding: FpEvaluationFinding;
  readonly attenuation: ExecutivePressureAttenuation;
}): ExecutivePressureDisposition {
  if (
    input.finding.closeDisposition !== "no_close" &&
    input.finding.residualPressureRefs.length === 0
  ) {
    return "close_candidate";
  }
  if (input.finding.closeDisposition === "human_required") {
    return "reprice";
  }
  if (input.finding.diagnosticRefs.includes(EXECUTIVE_DISPOSITION_REPRICE_REF)) {
    return "reprice";
  }
  if (input.finding.diagnosticRefs.includes(EXECUTIVE_DISPOSITION_BLOCK_REF)) {
    return "block";
  }
  if (
    input.finding.diagnosticRefs.includes(
      EXECUTIVE_DISPOSITION_NONLOCAL_REENTRY_REF
    )
  ) {
    return "nonlocal_reentry";
  }
  if (input.attenuation === "unchanged") {
    return "non_attenuating_retry";
  }
  if (input.finding.continuationRefs.length > 0) {
    return input.attenuation === "cleared" ? "attenuated" : "local_repair";
  }
  return input.finding.residualPressureRefs.length === 0 ? "attenuated" : "block";
}

export function projectExecutivePressureFacts(
  input: ProjectExecutivePressureFactsInput
): readonly ExecutivePressureFactProjection[] {
  if (input.outcome.status !== "evaluated") {
    return Object.freeze([]);
  }
  return Object.freeze(
    input.outcome.findings.map((finding) => {
      assertExecutiveFindingHasNoRuntimeAuthority(finding);
      const residualPressureRefs = uniqueStrings(finding.residualPressureRefs);
      const attenuation = attenuationKind({
        priorResidualPressureRefs: uniqueStrings(
          input.priorResidualPressureRefs ?? input.observation.residualPressureRefs
        ),
        residualPressureRefs
      });
      const disposition = pressureDisposition({ finding, attenuation });
      const spanRefs = uniqueStrings(
        input.observation.spanLineage.map((lineage) => lineage.spanId)
      );
      const requirementIds = uniqueStrings([
        ...input.observation.requirementIds,
        ...finding.authorityRefs.filter((ref) => ref.startsWith("REQ-"))
      ]);
      const payload = Object.freeze({
        observationRef: input.observation.observationRef,
        findingRef: finding.findingRef,
        disposition,
        attenuation,
        closeDisposition: finding.closeDisposition,
        residualPressureRefs,
        continuationRefs: uniqueStrings(finding.continuationRefs),
        evidenceRefs: uniqueStrings(finding.evidenceRefs),
        authorityRefs: uniqueStrings(finding.authorityRefs),
        diagnosticRefs: uniqueStrings(finding.diagnosticRefs),
        requirementIds,
        spanRefs,
        selectedCompositionRef: input.observation.selectedCompositionRef,
        selectedCompositionDigest: input.observation.selectedCompositionDigest
      });
      return Object.freeze({
        kind: "abg_executive_pressure_fact_projection" as const,
        pressureFactRef: `abg-executive-pressure:${stableSha256Digest(payload)}`,
        ...payload
      });
    })
  );
}

export function projectExecutiveContinuationInput(input: {
  readonly observation: ExecutiveObservationView;
  readonly pressureFacts: readonly ExecutivePressureFactProjection[];
}): ExecutiveContinuationInputProjection {
  const residualPressureRefs = uniqueStrings(
    input.pressureFacts.flatMap((fact) => fact.residualPressureRefs)
  );
  const continuationRefs = uniqueStrings(
    input.pressureFacts.flatMap((fact) => fact.continuationRefs)
  );
  const pressureFactRefs = uniqueStrings(
    input.pressureFacts.map((fact) => fact.pressureFactRef)
  );
  const reentryRefs = uniqueStrings(
    input.pressureFacts
      .filter((fact) => fact.disposition === "nonlocal_reentry")
      .map((fact) => fact.pressureFactRef)
  );
  const repriceRefs = uniqueStrings(
    input.pressureFacts
      .filter((fact) => fact.disposition === "reprice")
      .map((fact) => fact.pressureFactRef)
  );
  const blockedRefs = uniqueStrings(
    input.pressureFacts
      .filter((fact) => fact.disposition === "block")
      .map((fact) => fact.pressureFactRef)
  );
  const closeCandidateRefs = uniqueStrings(
    input.pressureFacts
      .filter((fact) => fact.disposition === "close_candidate")
      .map((fact) => fact.pressureFactRef)
  );
  const decision: ExecutiveContinuationInputProjection["decision"] =
    reentryRefs.length > 0
      ? "yield_reentry"
      : repriceRefs.length > 0
        ? "reprice"
        : blockedRefs.length > 0
          ? "block"
          : closeCandidateRefs.length > 0 && residualPressureRefs.length === 0
            ? "close_candidate"
            : "retry_or_repair";
  const payload = Object.freeze({
    observationRef: input.observation.observationRef,
    pressureFactRefs,
    residualPressureRefs,
    continuationRefs,
    reentryRefs,
    repriceRefs,
    blockedRefs,
    closeCandidateRefs,
    decision
  });
  return Object.freeze({
    kind: "abg_executive_continuation_input_projection" as const,
    continuationInputRef: `abg-executive-continuation-input:${stableSha256Digest(payload)}`,
    ...payload
  });
}

export function constructExecutivePressureFactProjectedEvent(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly observation: ExecutiveObservationView;
  readonly pressureFact: ExecutivePressureFactProjection;
  readonly sourceEventRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
}): ExecutivePressureFactProjectedRuntimeEvent {
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const pressureFactDigest = stableSha256Digest(input.pressureFact);
  const eventRef = [
    "executive-pressure-fact",
    encodeURIComponent(input.basis.id),
    String(input.vectorIndex),
    encodeURIComponent(input.pressureFact.pressureFactRef),
    pressureFactDigest
  ].join(":");
  return Object.freeze({
    kind: "executive_pressure_fact_projected" as const,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: graphCallIdForBasis(input.basis),
    frameId: frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge,
    eventRef,
    observationRef: input.observation.observationRef,
    pressureFactRef: input.pressureFact.pressureFactRef,
    pressureFactDigest,
    executivePressureFact: input.pressureFact,
    sourceEventRefs: Object.freeze([...(input.sourceEventRefs ?? Object.freeze([]))]),
    sourceProjectionRefs: Object.freeze([
      input.observation.observationRef,
      ...(input.sourceProjectionRefs ?? Object.freeze([]))
    ]),
    causationEventRefs: Object.freeze([...(input.causationEventRefs ?? Object.freeze([]))]),
    correlationId: [
      "correlation://executive-pressure",
      encodeURIComponent(input.basis.id),
      String(input.vectorIndex),
      pressureFactDigest
    ].join("/")
  });
}
