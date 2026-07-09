// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-CONVERGENCE
// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-RUN

import type {
  AssuranceAmbiguityStatus,
  AssuranceAuthoritySnapshot,
  AssuranceClosureDecision,
  AssuranceClosureDecisionKind,
  AssuranceEvidenceRow,
  AssuranceProjection,
  AssuranceReportReadModel,
  AssuranceScopeRef,
  ExecutionBasis,
  PriorClosureSnapshotRef,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "../contracts/index.js";
import type { GtlTargetCarrierDefaultsBundle } from "../../../gtl/m01/contracts/index.js";
import {
  admitAssuranceProviderOutput,
  applyClosureTaintGate,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceClosureDecision,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  deriveAssuranceProjection,
  deriveAssuranceReportReadModel,
  deriveAssuranceScopeRef,
  derivePayloadLedgerProjection,
  deriveTargetCarrierAdmissionProjection,
  assertTargetCarrierAdmittedForClosure
} from "../contracts/index.js";

export interface EngineAssuranceProviderInput {
  readonly kind: "engine_assurance_provider_input";
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly scope: AssuranceScopeRef;
  readonly authoritySnapshot?: AssuranceAuthoritySnapshot;
}

export interface EngineAssuranceProvider {
  readonly authoritySnapshot: (
    input: EngineAssuranceProviderInput
  ) => AssuranceAuthoritySnapshot | null;
  readonly evidenceRows?: (
    input: EngineAssuranceProviderInput
  ) => readonly AssuranceEvidenceRow[];
  readonly eventLedgerValid?: (input: EngineAssuranceProviderInput) => boolean;
  readonly priorClosureSnapshot?: (
    input: EngineAssuranceProviderInput
  ) => PriorClosureSnapshotRef | null;
}

export interface EngineAssuranceScopeEvaluated {
  readonly kind: "evaluated";
  readonly scope: AssuranceScopeRef;
  readonly projection: AssuranceProjection;
  readonly decision: AssuranceClosureDecision;
  readonly report: AssuranceReportReadModel;
}

export interface EngineAssuranceScopeNotCapable {
  readonly kind: "not_assurance_capable";
  readonly scope: AssuranceScopeRef;
  readonly reason: string;
}

export interface EngineAssuranceScopeBlocked {
  readonly kind: "assurance_blocked";
  readonly scope: AssuranceScopeRef;
  readonly reason: string;
}

export type EngineAssuranceScopeResult =
  | EngineAssuranceScopeEvaluated
  | EngineAssuranceScopeNotCapable
  | EngineAssuranceScopeBlocked;

export type EngineAssuranceGateKind =
  | "not_evaluated"
  | "not_assurance_capable"
  | "assurance_closed"
  | "assurance_qualified_defer"
  | "assurance_blocked";

export interface EngineAssuranceGateResult {
  readonly kind: EngineAssuranceGateKind;
  readonly reason: string;
  readonly scopeResults: readonly EngineAssuranceScopeResult[];
  readonly projectionRefs: readonly string[];
  readonly closureDecisions: readonly AssuranceClosureDecisionKind[];
  readonly blockingStatuses: readonly AssuranceAmbiguityStatus[];
  readonly reports: readonly AssuranceReportReadModel[];
}

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values].sort());
}

function freezeClosureDecisions(
  values: readonly AssuranceClosureDecisionKind[]
): readonly AssuranceClosureDecisionKind[] {
  return Object.freeze([...new Set(values)].sort());
}

function freezeBlockingStatuses(
  values: readonly AssuranceAmbiguityStatus[]
): readonly AssuranceAmbiguityStatus[] {
  return Object.freeze([...new Set(values)].sort());
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

function baseInput(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly scope: AssuranceScopeRef;
  readonly authoritySnapshot?: AssuranceAuthoritySnapshot;
}): EngineAssuranceProviderInput {
  return Object.freeze({
    kind: "engine_assurance_provider_input",
    basis: input.basis,
    projection: input.projection,
    replayEvents: Object.freeze([...input.replayEvents]),
    scope: input.scope,
    ...(input.authoritySnapshot === undefined
      ? {}
      : { authoritySnapshot: input.authoritySnapshot })
  });
}

function constructGateResult(input: {
  readonly kind: EngineAssuranceGateKind;
  readonly reason: string;
  readonly scopeResults?: readonly EngineAssuranceScopeResult[];
}): EngineAssuranceGateResult {
  const scopeResults = Object.freeze([
    ...(input.scopeResults ?? Object.freeze([]))
  ]);
  const evaluated = scopeResults.filter(
    (entry): entry is EngineAssuranceScopeEvaluated => entry.kind === "evaluated"
  );
  return Object.freeze({
    kind: input.kind,
    reason: input.reason,
    scopeResults,
    projectionRefs: freezeStringArray(
      evaluated.map((entry) => entry.projection.projectionRef)
    ),
    closureDecisions: freezeClosureDecisions(
      evaluated.map((entry) => entry.decision.decision)
    ),
    blockingStatuses: freezeBlockingStatuses(
      evaluated.flatMap((entry) => entry.decision.blockingStatuses)
    ),
    reports: Object.freeze(evaluated.map((entry) => entry.report))
  });
}

export function constructNotEvaluatedAssuranceGate(
  reason: string
): EngineAssuranceGateResult {
  return constructGateResult({
    kind: "not_evaluated",
    reason
  });
}

function scopeResultForProvider(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly provider: EngineAssuranceProvider;
  readonly scope: AssuranceScopeRef;
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
}): EngineAssuranceScopeResult {
  const providerInput = baseInput(input);
  const providerAuthoritySnapshot = input.provider.authoritySnapshot(providerInput);
  if (providerAuthoritySnapshot !== null) {
    admitAssuranceProviderOutput(
      providerAuthoritySnapshot,
      "EngineAssuranceProvider.authoritySnapshot"
    );
    if (!sameScope(providerAuthoritySnapshot.scope, input.scope)) {
      throw new TypeError(
        "assurance provider returned authority snapshot for a different scope"
      );
    }
  }

  const payloadLedger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    events: input.replayEvents,
    vectorIndex: input.scope.vectorIndex,
    targetCarrierDefaults: input.targetCarrierDefaults
  });
  const ledgerHasAuthority = payloadLedger.authoritySnapshots.length > 0;
  if (!ledgerHasAuthority && providerAuthoritySnapshot === null) {
    return Object.freeze({
      kind: "not_assurance_capable",
      scope: input.scope,
      reason: "assurance provider returned no authority snapshot for scope"
    });
  }
  const targetCarrierAdmission = deriveTargetCarrierAdmissionProjection({
    ledger: payloadLedger
  });
  try {
    assertTargetCarrierAdmittedForClosure(targetCarrierAdmission);
  } catch (error) {
    return Object.freeze({
      kind: "assurance_blocked",
      scope: input.scope,
      reason:
        error instanceof Error
          ? error.message
          : "target carrier contract is not admitted"
    });
  }
  const authoritySnapshot =
    providerAuthoritySnapshot ??
    (ledgerHasAuthority
      ? deriveAssuranceAuthoritySnapshotFromPayloadLedger({
          assuranceScope: input.scope,
          ledger: payloadLedger
        })
      : null);
  if (authoritySnapshot === null) {
    throw new TypeError("assurance scope requires authority snapshot");
  }

  const scopedProviderInput = baseInput({
    ...input,
    authoritySnapshot
  });
  const ledgerEvidenceRows = ledgerHasAuthority
    ? deriveAssuranceEvidenceRowsFromPayloadLedger({
        assuranceScope: input.scope,
        ledger: payloadLedger
      })
    : Object.freeze([]);
  const providerEvidenceRows =
    input.provider.evidenceRows?.(scopedProviderInput) ?? Object.freeze([]);
  for (const [index, row] of providerEvidenceRows.entries()) {
    admitAssuranceProviderOutput(
      row,
      `EngineAssuranceProvider.evidenceRows[${String(index)}]`
    );
    if (!sameScope(row.scope, input.scope)) {
      throw new TypeError(
        "assurance provider returned evidence row for a different scope"
      );
    }
  }
  const evidenceRows = Object.freeze([
    ...ledgerEvidenceRows,
    ...providerEvidenceRows
  ]);
  const priorClosureSnapshot =
    input.provider.priorClosureSnapshot?.(scopedProviderInput) ?? null;
  if (priorClosureSnapshot !== null) {
    admitAssuranceProviderOutput(
      priorClosureSnapshot,
      "EngineAssuranceProvider.priorClosureSnapshot"
    );
  }

  const providerEventLedgerValid =
    input.provider.eventLedgerValid?.(scopedProviderInput);
  const eventLedgerValid = ledgerHasAuthority
    ? providerEventLedgerValid
    : false;
  const projection = deriveAssuranceProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    authoritySnapshot,
    evidenceRows,
    ...(eventLedgerValid === undefined ? {} : { eventLedgerValid }),
    ...(priorClosureSnapshot === null ? {} : { priorClosureSnapshot })
  });
  // T-217 S2.2 (WITNESS-007 enforcement half): the terminal gate consumes
  // the same closure-taint law as the per-vector fold — a scope cannot
  // close over this basis's foreign-written evidence.
  const decision = applyClosureTaintGate({
    decision: deriveAssuranceClosureDecision(projection),
    basisId: input.basis.id,
    events: input.replayEvents
  });
  const report = deriveAssuranceReportReadModel({
    projection,
    decision
  });

  return Object.freeze({
    kind: "evaluated",
    scope: input.scope,
    projection,
    decision,
    report
  });
}

export function evaluateAssuranceGate(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly targetCarrierDefaults: GtlTargetCarrierDefaultsBundle;
  readonly provider?: EngineAssuranceProvider;
}): EngineAssuranceGateResult {
  if (input.provider === undefined) {
    return constructGateResult({
      kind: "not_assurance_capable",
      reason: "no assurance provider configured for runtime scope"
    });
  }
  if (input.basis.graph.vectors.length === 0) {
    return constructGateResult({
      kind: "not_assurance_capable",
      reason: "runtime projection contains no assurance scopes"
    });
  }

  const scopeResults: EngineAssuranceScopeResult[] = [];
  for (let index = 0; index < input.basis.graph.vectors.length; index += 1) {
    const scope = deriveAssuranceScopeRef({
      basis: input.basis,
      projection: input.projection,
      vectorIndex: index
    });
    scopeResults.push(
      scopeResultForProvider({
        basis: input.basis,
        projection: input.projection,
        replayEvents: input.replayEvents,
        provider: input.provider,
        scope,
        targetCarrierDefaults: input.targetCarrierDefaults
      })
    );
  }

  const evaluated = scopeResults.filter(
    (entry): entry is EngineAssuranceScopeEvaluated => entry.kind === "evaluated"
  );
  const blocking = evaluated.filter(
    (entry) =>
      entry.decision.decision !== "close" &&
      entry.decision.decision !== "qualified_defer"
  );
  const firstBlocking = blocking[0];
  if (firstBlocking !== undefined) {
    return constructGateResult({
      kind: "assurance_blocked",
      reason: firstBlocking.decision.reason,
      scopeResults
    });
  }

  const carrierBlocked = scopeResults.filter(
    (entry): entry is EngineAssuranceScopeBlocked =>
      entry.kind === "assurance_blocked"
  );
  const firstCarrierBlocked = carrierBlocked[0];
  if (firstCarrierBlocked !== undefined) {
    return constructGateResult({
      kind: "assurance_blocked",
      reason: firstCarrierBlocked.reason,
      scopeResults
    });
  }

  const notCapable = scopeResults.filter(
    (entry) => entry.kind === "not_assurance_capable"
  );
  const firstNotCapable = notCapable[0];
  if (firstNotCapable !== undefined) {
    return constructGateResult({
      kind: "not_assurance_capable",
      reason: firstNotCapable.reason,
      scopeResults
    });
  }

  const qualified = evaluated.some(
    (entry) => entry.decision.decision === "qualified_defer"
  );
  return constructGateResult({
    kind: qualified ? "assurance_qualified_defer" : "assurance_closed",
    reason: qualified
      ? "all assurance scopes close or lawfully defer"
      : "all assurance scopes close",
    scopeResults
  });
}
