// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-EVENTS
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-CONVERGENCE

import type {
  ExecutionBasis,
  RuntimeAggregateProjection
} from "./carriers.js";
import {
  deriveIterationOutcomeFromRows,
  ITERATION_EVIDENCE_LIFECYCLE_VALUES,
  type IterationBindingGuardRow,
  type IterationEvidenceLifecycle,
  type IterationOutcome,
  type IterationRuntimeRow,
  type IterationSatisfactionRow
} from "./iteration_state_action.js";
import { sourceProjectionRef } from "./projection.js";
import {
  assertNonEmptyString,
  assertProjectionBasis,
  assertVectorIndexInRange,
  frameIdForBasis,
  freezeStringArray,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";
import {
  ENGINE_AUTHORITY_FIELD_KEYS
} from "../../../shared/engine_authority_fields.js";
import { parsePlainObject } from "../../../shared/validation/primitives.js";

export const ASSURANCE_AMBIGUITY_STATUS_VALUES = Object.freeze([
  "fulfilled",
  "partial",
  "missing",
  "stale_input",
  "authority_missing",
  "orphan_evidence",
  "contradictory_authority",
  "contradictory_evidence",
  "deferred",
  "event_ledger_invalid"
] as const);

export type AssuranceAmbiguityStatus =
  (typeof ASSURANCE_AMBIGUITY_STATUS_VALUES)[number];

export const ASSURANCE_CLOSURE_DECISION_KIND_VALUES = Object.freeze([
  "close",
  "retry",
  "reprice",
  "block",
  "qualified_defer"
] as const);

export type AssuranceClosureDecisionKind =
  (typeof ASSURANCE_CLOSURE_DECISION_KIND_VALUES)[number];

export interface AssuranceScopeRef {
  readonly kind: "assurance_scope_ref";
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly continuationId: string | null;
}

export interface AssuranceAuthoritySnapshot {
  readonly kind: "assurance_authority_snapshot";
  readonly scope: AssuranceScopeRef;
  readonly authorityRefs: readonly string[];
  readonly inputRefs: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly closureCapable: boolean;
  readonly contradictoryAuthority: boolean;
  readonly deferredAuthorityRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
}

export interface AssuranceEvidenceRow {
  readonly kind: "assurance_evidence_row";
  readonly evidenceRef: string;
  readonly scope: AssuranceScopeRef;
  readonly authorityRef: string | null;
  readonly authorityDigest: string | null;
  readonly inputDigest: string | null;
  readonly eventRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly boundToScope: boolean;
  readonly complete: boolean;
  readonly shallow: boolean;
  readonly contradictsAuthority: boolean;
  readonly deferred: boolean;
  readonly lifecycle: IterationEvidenceLifecycle;
}

export interface AssuranceAmbiguityRow {
  readonly kind: "assurance_ambiguity_row";
  readonly rowId: string;
  readonly status: AssuranceAmbiguityStatus;
  readonly scope: AssuranceScopeRef;
  readonly authorityRef: string | null;
  readonly evidenceRefs: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly eventRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly reason: string;
}

export interface AssuranceProjection {
  readonly kind: "assurance_projection";
  readonly scope: AssuranceScopeRef;
  readonly authoritySnapshot: AssuranceAuthoritySnapshot;
  readonly evidenceRows: readonly AssuranceEvidenceRow[];
  readonly ambiguityRows: readonly AssuranceAmbiguityRow[];
  readonly sourceProjectionRef: string;
  readonly projectionRef: string;
}

export interface AssuranceClosureDecision {
  readonly kind: "assurance_closure_decision";
  readonly decision: AssuranceClosureDecisionKind;
  readonly scope: AssuranceScopeRef;
  readonly projectionRef: string;
  readonly blockingStatuses: readonly AssuranceAmbiguityStatus[];
  readonly rowIds: readonly string[];
  readonly reason: string;
}

export interface AssuranceReportReadModel {
  readonly kind: "assurance_report_read_model";
  readonly projectionRef: string;
  readonly closureDecision: AssuranceClosureDecisionKind;
  readonly rowStatuses: readonly AssuranceAmbiguityStatus[];
  readonly rowIds: readonly string[];
}

export interface PriorClosureSnapshotRef {
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly projectionRef: string;
}

const FORBIDDEN_ASSURANCE_PROVIDER_FIELDS = ENGINE_AUTHORITY_FIELD_KEYS;

function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
  }
  return freezeStringArray(values);
}

function normalizeNullableString(
  value: string | null | undefined,
  label: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

function normalizeEvidenceLifecycle(
  value: IterationEvidenceLifecycle | undefined,
  label: string
): IterationEvidenceLifecycle {
  if (value === undefined) {
    return "active";
  }
  if (!ITERATION_EVIDENCE_LIFECYCLE_VALUES.includes(value)) {
    throw new TypeError(`${label}: unsupported evidence lifecycle`);
  }
  return value;
}

function sameScope(left: AssuranceScopeRef, right: AssuranceScopeRef): boolean {
  return (
    left.basisId === right.basisId &&
    left.graphFunctionId === right.graphFunctionId &&
    left.graphCallId === right.graphCallId &&
    left.frameId === right.frameId &&
    left.vectorIndex === right.vectorIndex &&
    left.edge === right.edge &&
    left.continuationId === right.continuationId
  );
}

function rowId(input: {
  readonly scope: AssuranceScopeRef;
  readonly status: AssuranceAmbiguityStatus;
  readonly authorityRef: string | null;
  readonly evidenceRefs: readonly string[];
  readonly serial: string;
}): string {
  return [
    "assurance-row",
    input.scope.basisId,
    input.scope.graphCallId,
    input.scope.frameId,
    String(input.scope.vectorIndex),
    input.status,
    input.authorityRef ?? "none",
    input.evidenceRefs.join(",") || input.serial
  ].join(":");
}

function constructAmbiguityRow(input: {
  readonly status: AssuranceAmbiguityStatus;
  readonly scope: AssuranceScopeRef;
  readonly authorityRef: string | null;
  readonly evidenceRefs?: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly eventRefs?: readonly string[];
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly reason: string;
  readonly serial: string;
}): AssuranceAmbiguityRow {
  assertNonEmptyString(input.authorityDigest, "AssuranceAmbiguityRow.authorityDigest");
  assertNonEmptyString(input.inputDigest, "AssuranceAmbiguityRow.inputDigest");
  assertNonEmptyString(input.reason, "AssuranceAmbiguityRow.reason");
  const evidenceRefs = freezeNonEmptyStrings(
    input.evidenceRefs ?? Object.freeze([]),
    "AssuranceAmbiguityRow.evidenceRefs"
  );
  return Object.freeze({
    kind: "assurance_ambiguity_row",
    rowId: rowId({
      scope: input.scope,
      status: input.status,
      authorityRef: input.authorityRef,
      evidenceRefs,
      serial: input.serial
    }),
    status: input.status,
    scope: input.scope,
    authorityRef: input.authorityRef,
    evidenceRefs,
    authorityDigest: input.authorityDigest,
    inputDigest: input.inputDigest,
    eventRefs: freezeNonEmptyStrings(
      input.eventRefs ?? Object.freeze([]),
      "AssuranceAmbiguityRow.eventRefs"
    ),
    providerRefs: freezeNonEmptyStrings(
      input.providerRefs ?? Object.freeze([]),
      "AssuranceAmbiguityRow.providerRefs"
    ),
    policyRefs: freezeNonEmptyStrings(
      input.policyRefs ?? Object.freeze([]),
      "AssuranceAmbiguityRow.policyRefs"
    ),
    reason: input.reason
  });
}

function isCurrentFulfillmentEvidence(
  snapshot: AssuranceAuthoritySnapshot,
  evidence: AssuranceEvidenceRow
): boolean {
  return (
    evidence.boundToScope &&
    evidence.complete &&
    !evidence.shallow &&
    !evidence.contradictsAuthority &&
    !evidence.deferred &&
    (evidence.authorityDigest === null ||
      evidence.authorityDigest === snapshot.authorityDigest) &&
    (evidence.inputDigest === null || evidence.inputDigest === snapshot.inputDigest)
  );
}

function evidenceCarriesCurrentOrPreservedAuthority(input: {
  readonly evidence: AssuranceEvidenceRow;
  readonly authorityRefs: ReadonlySet<string>;
}): boolean {
  if (input.evidence.authorityRef === null) {
    return false;
  }
  return (
    input.authorityRefs.has(input.evidence.authorityRef) ||
    input.evidence.lifecycle !== "active"
  );
}

function statusRows(
  projection: AssuranceProjection,
  status: AssuranceAmbiguityStatus
): readonly AssuranceAmbiguityRow[] {
  return projection.ambiguityRows.filter((row) => row.status === status);
}

function uniqueStatuses(
  rows: readonly AssuranceAmbiguityRow[]
): readonly AssuranceAmbiguityStatus[] {
  return Object.freeze(
    [...new Set(rows.map((row) => row.status))].sort()
  );
}

function decision(input: {
  readonly projection: AssuranceProjection;
  readonly decision: AssuranceClosureDecisionKind;
  readonly reason: string;
  readonly rows: readonly AssuranceAmbiguityRow[];
}): AssuranceClosureDecision {
  assertNonEmptyString(input.reason, "AssuranceClosureDecision.reason");
  return Object.freeze({
    kind: "assurance_closure_decision",
    decision: input.decision,
    scope: input.projection.scope,
    projectionRef: input.projection.projectionRef,
    blockingStatuses: uniqueStatuses(input.rows),
    rowIds: freezeNonEmptyStrings(
      input.rows.map((row) => row.rowId),
      "AssuranceClosureDecision.rowIds"
    ),
    reason: input.reason
  });
}

export function deriveAssuranceScopeRef(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly continuationId?: string | null;
}): AssuranceScopeRef {
  assertProjectionBasis(input.basis, input.projection, "AssuranceScopeRef");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return Object.freeze({
    kind: "assurance_scope_ref",
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    graphCallId: input.projection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.projection.frameId ?? frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: vectorEdge(input.basis, input.vectorIndex),
    continuationId: input.continuationId ?? null
  });
}

export function constructAssuranceAuthoritySnapshot(input: {
  readonly scope: AssuranceScopeRef;
  readonly authorityRefs: readonly string[];
  readonly inputRefs?: readonly string[];
  readonly authorityDigest: string;
  readonly inputDigest: string;
  readonly closureCapable?: boolean;
  readonly contradictoryAuthority?: boolean;
  readonly deferredAuthorityRefs?: readonly string[];
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
}): AssuranceAuthoritySnapshot {
  assertNonEmptyString(
    input.authorityDigest,
    "AssuranceAuthoritySnapshot.authorityDigest"
  );
  assertNonEmptyString(input.inputDigest, "AssuranceAuthoritySnapshot.inputDigest");
  return Object.freeze({
    kind: "assurance_authority_snapshot",
    scope: input.scope,
    authorityRefs: freezeNonEmptyStrings(
      input.authorityRefs,
      "AssuranceAuthoritySnapshot.authorityRefs"
    ),
    inputRefs: freezeNonEmptyStrings(
      input.inputRefs ?? Object.freeze([]),
      "AssuranceAuthoritySnapshot.inputRefs"
    ),
    authorityDigest: input.authorityDigest,
    inputDigest: input.inputDigest,
    closureCapable: input.closureCapable ?? true,
    contradictoryAuthority: input.contradictoryAuthority ?? false,
    deferredAuthorityRefs: freezeNonEmptyStrings(
      input.deferredAuthorityRefs ?? Object.freeze([]),
      "AssuranceAuthoritySnapshot.deferredAuthorityRefs"
    ),
    providerRefs: freezeNonEmptyStrings(
      input.providerRefs ?? Object.freeze([]),
      "AssuranceAuthoritySnapshot.providerRefs"
    ),
    policyRefs: freezeNonEmptyStrings(
      input.policyRefs ?? Object.freeze([]),
      "AssuranceAuthoritySnapshot.policyRefs"
    )
  });
}

export function constructAssuranceEvidenceRow(input: {
  readonly scope: AssuranceScopeRef;
  readonly evidenceRef: string;
  readonly authorityRef?: string | null;
  readonly authorityDigest?: string | null;
  readonly inputDigest?: string | null;
  readonly eventRefs?: readonly string[];
  readonly providerRefs?: readonly string[];
  readonly policyRefs?: readonly string[];
  readonly boundToScope?: boolean;
  readonly complete?: boolean;
  readonly shallow?: boolean;
  readonly contradictsAuthority?: boolean;
  readonly deferred?: boolean;
  readonly lifecycle?: IterationEvidenceLifecycle | undefined;
}): AssuranceEvidenceRow {
  assertNonEmptyString(input.evidenceRef, "AssuranceEvidenceRow.evidenceRef");
  return Object.freeze({
    kind: "assurance_evidence_row",
    evidenceRef: input.evidenceRef,
    scope: input.scope,
    authorityRef: normalizeNullableString(
      input.authorityRef,
      "AssuranceEvidenceRow.authorityRef"
    ),
    authorityDigest: normalizeNullableString(
      input.authorityDigest,
      "AssuranceEvidenceRow.authorityDigest"
    ),
    inputDigest: normalizeNullableString(
      input.inputDigest,
      "AssuranceEvidenceRow.inputDigest"
    ),
    eventRefs: freezeNonEmptyStrings(
      input.eventRefs ?? Object.freeze([]),
      "AssuranceEvidenceRow.eventRefs"
    ),
    providerRefs: freezeNonEmptyStrings(
      input.providerRefs ?? Object.freeze([]),
      "AssuranceEvidenceRow.providerRefs"
    ),
    policyRefs: freezeNonEmptyStrings(
      input.policyRefs ?? Object.freeze([]),
      "AssuranceEvidenceRow.policyRefs"
    ),
    boundToScope: input.boundToScope ?? true,
    complete: input.complete ?? true,
    shallow: input.shallow ?? false,
    contradictsAuthority: input.contradictsAuthority ?? false,
    deferred: input.deferred ?? false,
    lifecycle: normalizeEvidenceLifecycle(
      input.lifecycle,
      "AssuranceEvidenceRow.lifecycle"
    )
  });
}

export function assuranceProjectionRef(
  projection: Pick<AssuranceProjection, "scope" | "authoritySnapshot" | "ambiguityRows">
): string {
  return [
    "assurance_projection",
    projection.scope.basisId,
    projection.scope.graphCallId,
    projection.scope.frameId,
    String(projection.scope.vectorIndex),
    projection.authoritySnapshot.authorityDigest,
    projection.authoritySnapshot.inputDigest,
    projection.ambiguityRows.map((row) => row.status).join(",")
  ].join(":");
}

export function deriveAssuranceProjection(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly authoritySnapshot: AssuranceAuthoritySnapshot;
  readonly evidenceRows?: readonly AssuranceEvidenceRow[];
  readonly eventLedgerValid?: boolean;
  readonly priorClosureSnapshot?: PriorClosureSnapshotRef | null;
}): AssuranceProjection {
  assertProjectionBasis(
    input.basis,
    input.runtimeProjection,
    "AssuranceProjection"
  );
  const scope = input.authoritySnapshot.scope;
  if (scope.basisId !== input.basis.id) {
    throw new TypeError("AssuranceProjection requires scope for the same basis");
  }
  const evidenceRows = Object.freeze([...(input.evidenceRows ?? Object.freeze([]))]);
  const authorityRefs = new Set(input.authoritySnapshot.authorityRefs);
  const deferredRefs = new Set(input.authoritySnapshot.deferredAuthorityRefs);
  const rows: AssuranceAmbiguityRow[] = [];
  const snapshot = input.authoritySnapshot;

  if (input.eventLedgerValid === false) {
    rows.push(
      constructAmbiguityRow({
        status: "event_ledger_invalid",
        scope,
        authorityRef: null,
        authorityDigest: snapshot.authorityDigest,
        inputDigest: snapshot.inputDigest,
        providerRefs: snapshot.providerRefs,
        policyRefs: snapshot.policyRefs,
        reason: "event_ledger_invalid",
        serial: "event-ledger"
      })
    );
  }

  if (snapshot.closureCapable && snapshot.authorityRefs.length === 0) {
    rows.push(
      constructAmbiguityRow({
        status: "authority_missing",
        scope,
        authorityRef: null,
        authorityDigest: snapshot.authorityDigest,
        inputDigest: snapshot.inputDigest,
        providerRefs: snapshot.providerRefs,
        policyRefs: snapshot.policyRefs,
        reason: "closure_capable_scope_has_no_current_authority",
        serial: "authority-missing"
      })
    );
  }

  if (snapshot.contradictoryAuthority) {
    const refs =
      snapshot.authorityRefs.length === 0
        ? [null]
        : snapshot.authorityRefs.map((authorityRef) => authorityRef);
    for (const authorityRef of refs) {
      rows.push(
        constructAmbiguityRow({
          status: "contradictory_authority",
          scope,
          authorityRef,
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          providerRefs: snapshot.providerRefs,
          policyRefs: snapshot.policyRefs,
          reason: "current_authority_conflicts",
          serial: authorityRef ?? "contradictory-authority"
        })
      );
    }
  }

  if (
    input.priorClosureSnapshot !== undefined &&
    input.priorClosureSnapshot !== null &&
    (input.priorClosureSnapshot.authorityDigest !== snapshot.authorityDigest ||
      input.priorClosureSnapshot.inputDigest !== snapshot.inputDigest)
  ) {
    rows.push(
      constructAmbiguityRow({
        status: "stale_input",
        scope,
        authorityRef: null,
        evidenceRefs: [input.priorClosureSnapshot.projectionRef],
        authorityDigest: snapshot.authorityDigest,
        inputDigest: snapshot.inputDigest,
        providerRefs: snapshot.providerRefs,
        policyRefs: snapshot.policyRefs,
        reason: "prior_closure_projection_digest_is_stale",
        serial: "stale-input"
      })
    );
  }

  for (const evidence of evidenceRows) {
    if (
      !evidence.boundToScope ||
      !sameScope(evidence.scope, scope) ||
      !evidenceCarriesCurrentOrPreservedAuthority({
        evidence,
        authorityRefs
      })
    ) {
      rows.push(
        constructAmbiguityRow({
          status: "orphan_evidence",
          scope,
          authorityRef: evidence.authorityRef,
          evidenceRefs: [evidence.evidenceRef],
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          eventRefs: evidence.eventRefs,
          providerRefs: evidence.providerRefs,
          policyRefs: evidence.policyRefs,
          reason: "evidence_has_no_current_scope_authority_binding",
          serial: evidence.evidenceRef
        })
      );
    }
  }

  for (const authorityRef of snapshot.authorityRefs) {
    const matchingEvidence = evidenceRows.filter(
      (evidence) =>
        evidence.boundToScope &&
        sameScope(evidence.scope, scope) &&
        evidence.authorityRef === authorityRef
    );
    if (deferredRefs.has(authorityRef)) {
      rows.push(
        constructAmbiguityRow({
          status: "deferred",
          scope,
          authorityRef,
          evidenceRefs: matchingEvidence.map((evidence) => evidence.evidenceRef),
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          providerRefs: snapshot.providerRefs,
          policyRefs: snapshot.policyRefs,
          reason: "authority_is_lawfully_deferred_by_policy",
          serial: authorityRef
        })
      );
      continue;
    }
    if (matchingEvidence.length === 0) {
      rows.push(
        constructAmbiguityRow({
          status: "missing",
          scope,
          authorityRef,
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          providerRefs: snapshot.providerRefs,
          policyRefs: snapshot.policyRefs,
          reason: "required_authority_bound_evidence_is_missing",
          serial: authorityRef
        })
      );
      continue;
    }
    if (matchingEvidence.some((evidence) => evidence.contradictsAuthority)) {
      rows.push(
        constructAmbiguityRow({
          status: "contradictory_evidence",
          scope,
          authorityRef,
          evidenceRefs: matchingEvidence.map((evidence) => evidence.evidenceRef),
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          eventRefs: matchingEvidence.flatMap((evidence) => evidence.eventRefs),
          providerRefs: snapshot.providerRefs,
          policyRefs: snapshot.policyRefs,
          reason: "admitted_evidence_conflicts_with_current_authority",
          serial: authorityRef
        })
      );
      continue;
    }
    if (
      matchingEvidence.some((evidence) =>
        isCurrentFulfillmentEvidence(snapshot, evidence)
      )
    ) {
      rows.push(
        constructAmbiguityRow({
          status: "fulfilled",
          scope,
          authorityRef,
          evidenceRefs: matchingEvidence.map((evidence) => evidence.evidenceRef),
          authorityDigest: snapshot.authorityDigest,
          inputDigest: snapshot.inputDigest,
          eventRefs: matchingEvidence.flatMap((evidence) => evidence.eventRefs),
          providerRefs: snapshot.providerRefs,
          policyRefs: snapshot.policyRefs,
          reason: "current_evidence_fulfills_authority",
          serial: authorityRef
        })
      );
      continue;
    }
    rows.push(
      constructAmbiguityRow({
        status: "partial",
        scope,
        authorityRef,
        evidenceRefs: matchingEvidence.map((evidence) => evidence.evidenceRef),
        authorityDigest: snapshot.authorityDigest,
        inputDigest: snapshot.inputDigest,
        eventRefs: matchingEvidence.flatMap((evidence) => evidence.eventRefs),
        providerRefs: snapshot.providerRefs,
        policyRefs: snapshot.policyRefs,
        reason: "evidence_is_shallow_incomplete_unbound_or_stale",
        serial: authorityRef
      })
    );
  }

  const partialProjection = {
    scope,
    authoritySnapshot: snapshot,
    ambiguityRows: Object.freeze([...rows])
  };

  const projectionRef = assuranceProjectionRef(partialProjection);
  return Object.freeze({
    kind: "assurance_projection",
    scope,
    authoritySnapshot: snapshot,
    evidenceRows,
    ambiguityRows: partialProjection.ambiguityRows,
    sourceProjectionRef: sourceProjectionRef(input.runtimeProjection),
    projectionRef
  });
}

function assuranceAuthorityRef(row: AssuranceAmbiguityRow): string {
  return row.authorityRef ?? row.rowId;
}

function assuranceSatisfactionRow(input: {
  readonly row: AssuranceAmbiguityRow;
  readonly status: IterationSatisfactionRow["status"];
  readonly reason: IterationSatisfactionRow["reason"];
  readonly reEntryPoint?: IterationSatisfactionRow["reEntryPoint"] | undefined;
}): IterationSatisfactionRow {
  return Object.freeze({
    authorityRef: assuranceAuthorityRef(input.row),
    status: input.status,
    reason: input.reason,
    lifecycle: "active" as const,
    evidenceRefs: freezeStringArray(input.row.evidenceRefs),
    sourceProjectionRefs: freezeStringArray([input.row.rowId]),
    reEntryPoint: input.reEntryPoint ?? null
  });
}

function assuranceRuntimeRow(input: {
  readonly row: AssuranceAmbiguityRow;
  readonly reason: IterationRuntimeRow["reason"];
}): IterationRuntimeRow {
  return Object.freeze({
    boundary: "worker" as const,
    status: "failed" as const,
    reason: input.reason,
    retryable: false,
    evidenceRefs: freezeStringArray(input.row.evidenceRefs),
    sourceProjectionRefs: freezeStringArray([input.row.rowId])
  });
}

function assuranceBindingGuardRow(
  row: AssuranceAmbiguityRow
): IterationBindingGuardRow {
  return Object.freeze({
    status: "orphan" as const,
    authorityRef: row.authorityRef,
    evidenceRef: row.evidenceRefs[0] ?? null,
    failedCondition: row.reason,
    eventRefs: freezeStringArray(row.eventRefs),
    sourceProjectionRefs: freezeStringArray([row.rowId])
  });
}

function iterationRowsForAssuranceProjection(
  projection: AssuranceProjection
): {
  readonly satisfactionRows: readonly IterationSatisfactionRow[];
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly bindingGuardRows: readonly IterationBindingGuardRow[];
} {
  const satisfactionRows: IterationSatisfactionRow[] = [];
  const runtimeRows: IterationRuntimeRow[] = [];
  const bindingGuardRows: IterationBindingGuardRow[] = [];

  for (const row of projection.ambiguityRows) {
    switch (row.status) {
      case "fulfilled":
        satisfactionRows.push(
          assuranceSatisfactionRow({ row, status: "satisfied", reason: null })
        );
        break;
      case "deferred":
        satisfactionRows.push(
          assuranceSatisfactionRow({ row, status: "deferred", reason: null })
        );
        break;
      case "missing":
        satisfactionRows.push(
          assuranceSatisfactionRow({
            row,
            status: "unsatisfied",
            reason: "missing_evidence"
          })
        );
        break;
      case "partial":
        satisfactionRows.push(
          assuranceSatisfactionRow({
            row,
            status: "unsatisfied",
            reason: "partial_evidence"
          })
        );
        break;
      case "stale_input":
        satisfactionRows.push(
          assuranceSatisfactionRow({
            row,
            status: "unsatisfied",
            reason: "stale_input"
          })
        );
        break;
      case "authority_missing":
        satisfactionRows.push(
          assuranceSatisfactionRow({
            row,
            status: "unsatisfied",
            reason: "missing_authority",
            reEntryPoint: "requirements"
          })
        );
        break;
      case "contradictory_authority":
        satisfactionRows.push(
          assuranceSatisfactionRow({
            row,
            status: "unsatisfied",
            reason: "contradiction",
            reEntryPoint: "requirements"
          })
        );
        break;
      case "contradictory_evidence":
      case "event_ledger_invalid":
        runtimeRows.push(assuranceRuntimeRow({ row, reason: "runtime_failure" }));
        break;
      case "orphan_evidence":
        bindingGuardRows.push(assuranceBindingGuardRow(row));
        break;
      default: {
        const exhaustive: never = row.status;
        throw new TypeError(
          `Unsupported assurance ambiguity status ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  return Object.freeze({
    satisfactionRows: Object.freeze(satisfactionRows),
    runtimeRows: Object.freeze(runtimeRows),
    bindingGuardRows: Object.freeze(bindingGuardRows)
  });
}

function firstRows(
  projection: AssuranceProjection,
  statuses: readonly AssuranceAmbiguityStatus[]
): readonly AssuranceAmbiguityRow[] {
  const rows = projection.ambiguityRows.filter((row) =>
    statuses.includes(row.status)
  );
  return rows.length === 0 ? projection.ambiguityRows : Object.freeze(rows);
}

function assuranceDecisionForIterationOutcome(input: {
  readonly projection: AssuranceProjection;
  readonly outcome: IterationOutcome;
}): AssuranceClosureDecision {
  const { projection, outcome } = input;
  if (outcome.kind === "redispatch") {
    if (outcome.reason === "stale_input") {
      return decision({
        projection,
        decision: "retry",
        reason: "stale_input_invalidates_prior_closure",
        rows: firstRows(projection, ["stale_input"])
      });
    }
    return decision({
      projection,
      decision: "retry",
      reason: "partial_or_missing_evidence_requires_retry_or_repair",
      rows: firstRows(projection, ["partial", "missing"])
    });
  }
  if (outcome.kind === "suspend") {
    return decision({
      projection,
      decision: "qualified_defer",
      reason: "iteration_outcome_suspended",
      rows: projection.ambiguityRows
    });
  }
  if (outcome.disposition === "converged") {
    return decision({
      projection,
      decision: "close",
      reason: "all_required_rows_are_fulfilled",
      rows: Object.freeze([])
    });
  }
  if (outcome.disposition === "deferred") {
    return decision({
      projection,
      decision: "qualified_defer",
      reason: "all_unfulfilled_rows_are_lawfully_deferred",
      rows: firstRows(projection, ["deferred"])
    });
  }
  if (outcome.reEntryPoint !== null) {
    if (outcome.reason === "contradiction") {
      return decision({
        projection,
        decision: "reprice",
        reason: "contradictory_authority_requires_reprice",
        rows: firstRows(projection, ["contradictory_authority"])
      });
    }
    return decision({
      projection,
      decision: "reprice",
      reason: "missing_authority_requires_reprice",
      rows: firstRows(projection, ["authority_missing"])
    });
  }
  if (outcome.reason === "orphan_current_binding") {
    return decision({
      projection,
      decision: "block",
      reason: "orphan_evidence_cannot_satisfy_authority",
      rows: firstRows(projection, ["orphan_evidence"])
    });
  }
  if (statusRows(projection, "event_ledger_invalid").length > 0) {
    return decision({
      projection,
      decision: "block",
      reason: "event_ledger_invalid_blocks_assurance",
      rows: firstRows(projection, ["event_ledger_invalid"])
    });
  }
  if (statusRows(projection, "contradictory_evidence").length > 0) {
    return decision({
      projection,
      decision: "block",
      reason: "contradictory_evidence_blocks_assurance",
      rows: firstRows(projection, ["contradictory_evidence"])
    });
  }
  return decision({
    projection,
    decision: "block",
    reason: "assurance_projection_has_no_closing_rows",
    rows: projection.ambiguityRows
  });
}

export function deriveAssuranceClosureDecision(
  projection: AssuranceProjection
): AssuranceClosureDecision {
  const rowInput = iterationRowsForAssuranceProjection(projection);
  const outcome = deriveIterationOutcomeFromRows({
    vectorIndex: projection.scope.vectorIndex,
    satisfactionRows: rowInput.satisfactionRows,
    runtimeRows: rowInput.runtimeRows,
    bindingGuardRows: rowInput.bindingGuardRows
  });
  return assuranceDecisionForIterationOutcome({
    projection,
    outcome
  });
}

export function deriveAssuranceReportReadModel(input: {
  readonly projection: AssuranceProjection;
  readonly decision: AssuranceClosureDecision;
}): AssuranceReportReadModel {
  if (input.decision.projectionRef !== input.projection.projectionRef) {
    throw new TypeError("Assurance report requires decision for projection");
  }
  return Object.freeze({
    kind: "assurance_report_read_model",
    projectionRef: input.projection.projectionRef,
    closureDecision: input.decision.decision,
    rowStatuses: uniqueStatuses(input.projection.ambiguityRows),
    rowIds: freezeNonEmptyStrings(
      input.projection.ambiguityRows.map((row) => row.rowId),
      "AssuranceReportReadModel.rowIds"
    )
  });
}

export function admitAssuranceProviderOutput(
  input: unknown,
  label = "AssuranceProviderOutput"
): Readonly<Record<string, unknown>> {
  const providerOutput = parsePlainObject(input, label);
  for (const field of FORBIDDEN_ASSURANCE_PROVIDER_FIELDS) {
    if (Object.hasOwn(providerOutput, field)) {
      throw new TypeError(
        `${label}.${field}: assurance provider output cannot own engine authority`
      );
    }
  }
  return Object.freeze({ ...providerOutput });
}
