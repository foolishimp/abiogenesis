import {
  admitGraphSpanAssessment,
  assertRuntimeEvent,
  constructGraphSpanAssessedEvent,
  constructGraphSpanEvaluationScheduledEvent,
  constructGraphSpanFoldbackEvaluatedEvent,
  deriveEndpointSpanSchedule
} from "../../../build/semantic/code/src/abg/m03/index.js";
import { buildThreeStageBasis } from "./m03-iteration-fixtures.mjs";

export function spanBySource(schedule, sourceVectorIndex) {
  const span = schedule.spanRefs.find(
    (candidate) => candidate.sourceVectorIndex === sourceVectorIndex
  );
  if (span === undefined) {
    throw new Error(`missing span for source vector ${sourceVectorIndex}`);
  }
  return span;
}

export function fulfilledRow(obligationId, terminalEvidenceRefs = null) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "fulfilled",
    terminalEvidenceRefs:
      terminalEvidenceRefs ?? [`evidence://${obligationId}/terminal`],
    carryObservations: [],
    detail: null
  };
}

export function gapRow(obligationId, carryObservations = []) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "semantic_gap",
    terminalEvidenceRefs: [`evidence://${obligationId}/gap`],
    carryObservations,
    detail: "terminal artifact deviates from source obligation"
  };
}

export function staleInputRow(obligationId, carryObservations = []) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "stale_input",
    terminalEvidenceRefs: [`evidence://${obligationId}/stale-input`],
    carryObservations,
    detail: "terminal artifact was derived from superseded source truth"
  };
}

export function contradictoryEvidenceRow(obligationId, carryObservations = []) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "contradictory_evidence",
    terminalEvidenceRefs: [`evidence://${obligationId}/contradictory`],
    carryObservations,
    detail: "terminal evidence contains mutually inconsistent assessments"
  };
}

export function blockedRow(obligationId) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "blocked",
    terminalEvidenceRefs: [`evidence://${obligationId}/blocked`],
    carryObservations: [],
    detail: "semantic assessment could not be completed"
  };
}

export function constitutionalGapRow(obligationId) {
  return {
    obligationId,
    sourceAuthorityRef: `authority://${obligationId}`,
    status: "constitutional_gap",
    terminalEvidenceRefs: [`evidence://${obligationId}/intent-gap`],
    carryObservations: [],
    detail: "terminal feedback requires renewed governing intent"
  };
}

export function carried(fromVectorIndex, toVectorIndex) {
  return {
    fromVectorIndex,
    toVectorIndex,
    status: "carried",
    evidenceRefs: [`carry://${fromVectorIndex}-${toVectorIndex}/carried`]
  };
}

export function dropped(fromVectorIndex, toVectorIndex) {
  return {
    fromVectorIndex,
    toVectorIndex,
    status: "dropped",
    evidenceRefs: [`carry://${fromVectorIndex}-${toVectorIndex}/dropped`]
  };
}

export function constitutionalReentry(input = {}) {
  const changeClass = input.changeClass ?? "intent_reprice";
  const reEntryPoint = input.reEntryPoint ?? "intent";
  return {
    kind: "graph_constitutional_reentry",
    changeClass,
    reEntryPoint,
    targetGraphFunctionRef:
      input.targetGraphFunctionRef ??
      `graph_function://derive_${reEntryPoint}_surface`,
    targetVectorIndex: input.targetVectorIndex ?? null,
    routeContractRefs:
      input.routeContractRefs ?? [`route-contract://odd-sdlc/${reEntryPoint}`],
    authorityRefs: input.authorityRefs ?? ["ticket://T-103", "intent://current"],
    rationale:
      input.rationale ??
      "Endpoint feedback shows the governing target condition is insufficient"
  };
}

export function assessmentFor(input) {
  return admitGraphSpanAssessment({
    basis: input.basis,
    span: input.span,
    assessmentId: input.assessmentId,
    attemptIndex: input.attemptIndex ?? 0,
    assessmentRegime: input.assessmentRegime ?? "F_P",
    obligationRows: input.rows,
    constitutionalReentry: input.constitutionalReentry ?? null,
    evidenceRefs: input.evidenceRefs ?? [`assessment-evidence://${input.assessmentId}`],
    edgeFoldbackRefs: input.edgeFoldbackRefs ?? [],
    detail: input.detail ?? null,
    generation: input.generation ?? 0
  });
}

export function buildSchedule(input = {}) {
  const basisOptions = {
    runId: input.runId ?? "run://t103/graph-span"
  };
  for (const key of [
    "workKey",
    "defaultRegime",
    "dispatchRef",
    "approvalSubjectRef",
    "frameId",
    "frameLineageId"
  ]) {
    if (Object.hasOwn(input, key)) {
      basisOptions[key] = input[key];
    }
  }
  const basis = buildThreeStageBasis(basisOptions);
  const schedule = deriveEndpointSpanSchedule({
    basis,
    terminalVectorIndex: input.terminalVectorIndex ?? 2,
    closedVectorIndexes: input.closedVectorIndexes ?? [0, 1, 2],
    generation: input.generation ?? 0
  });
  return { basis, schedule };
}

export function materializeEvents(basis, schedule, assessments, foldback) {
  const events = [
    constructGraphSpanEvaluationScheduledEvent({ basis, schedule }),
    ...assessments.map((assessment) =>
      constructGraphSpanAssessedEvent({ basis, assessment })
    ),
    constructGraphSpanFoldbackEvaluatedEvent({ basis, foldback })
  ];
  for (const event of events) {
    assertRuntimeEvent(event);
  }
  return events;
}
