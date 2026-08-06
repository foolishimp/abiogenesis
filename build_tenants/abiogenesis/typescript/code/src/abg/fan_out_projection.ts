import type {
  FanOutApplication,
  FanOutMaterialization,
  GtlGraph,
} from "../gtl/contracts.js";
import type { CProgramNode, CWorkflowNode } from "../gtl/c_algebra.js";
import { graphFunctionApplicationRef } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  validatedRuntimeEventPrefixThroughEvent,
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { RuntimeEvent } from "./event_store.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import type {
  CompleteFanOutAdmission,
  FanOutCompletedTaskRow,
  FanOutCompletionAdmission,
  FanOutStoppingTaskRow,
  PartialFanOutAdmission,
} from "./fan_out.js";

interface FanOutProjectionAuthority {
  readonly graph: Readonly<GtlGraph>;
  readonly application: Readonly<FanOutApplication>;
  readonly basisId: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
}

export type ExactFanOutCompletionProjectionRequest =
  | Readonly<{
    mode: "candidate";
    expectedPrefixDigest: Sha256Digest;
    authority: FanOutProjectionAuthority;
    completionKind: "complete_vector" | "partial_stop";
    validateOutputVector: (
      value: unknown,
    ) => value is Readonly<Record<string, JsonValue>>;
  }>
  | Readonly<{
    mode: "event_canonical";
    admissionEventRef: string;
  }>
  | Readonly<{
    mode: "graph_bound";
    admissionEventRef: string;
    authority: FanOutProjectionAuthority;
  }>;

export interface FanOutCompletionCandidateProjection {
  readonly kind: "fan_out_completion_candidate_projection";
  readonly schemaVersion: "5.0.0";
  readonly completionBody: Readonly<Record<string, JsonValue>>;
  readonly completionRef: string;
  readonly completionDigest: Sha256Digest;
  readonly requiredCausationEventRefs: readonly string[];
}

interface ExactTaskTruth {
  readonly ordinal: number;
  readonly cCallRef: string;
  readonly retryPath: readonly number[];
  readonly opened: RuntimeEvent;
  readonly foldback: RuntimeEvent;
  readonly evidence: RuntimeEvent;
  readonly result: RuntimeEvent;
  readonly judgment: RuntimeEvent;
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
  readonly resultClass: string;
  readonly resultContractRef: string;
  readonly resultValue: Readonly<Record<string, JsonValue>>;
  readonly resultValueDigest: Sha256Digest;
  readonly judgmentRef: string;
  readonly judgmentDisposition: string;
  readonly foldbackRef: string;
  readonly retryAttemptRef: string | null;
}

function isRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDigest(value: JsonValue | undefined): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isNonEmptyString(value: JsonValue | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function isOrdinal(value: JsonValue | undefined): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function sameStrings(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.length === right.length && left.every(
    (value, index) => value === right[index],
  );
}

function exactKeys(
  value: Readonly<Record<string, JsonValue>>,
  expected: readonly string[],
): boolean {
  return sameStrings(Object.keys(value).sort(), [...expected].sort());
}

function uniqueEvent(
  events: readonly RuntimeEvent[],
  predicate: (event: RuntimeEvent) => boolean,
): RuntimeEvent | null {
  const matches = events.filter(predicate);
  return matches.length === 1 ? matches[0]! : null;
}

function isCausallyReachable(
  events: readonly RuntimeEvent[],
  ancestorEventRef: string,
  descendant: RuntimeEvent,
): boolean {
  const byRef = new Map(events.map((event) => [event.eventId, event]));
  const pending = [...descendant.causationEventRefs];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const eventRef = pending.pop()!;
    if (eventRef === ancestorEventRef) return true;
    if (visited.has(eventRef)) continue;
    visited.add(eventRef);
    const event = byRef.get(eventRef);
    if (event !== undefined) pending.push(...event.causationEventRefs);
  }
  return false;
}

function exactHashedPayload(
  event: RuntimeEvent,
  refKey: string,
  digestKey: string,
  refPrefix: string,
): Readonly<Record<string, JsonValue>> | null {
  if (!isRecord(event.payload)) return null;
  const ref = event.payload[refKey];
  const digest = event.payload[digestKey];
  if (!isNonEmptyString(ref) || !isDigest(digest)) return null;
  const body = Object.fromEntries(
    Object.entries(event.payload).filter(
      ([key]) => key !== refKey && key !== digestKey,
    ),
  ) as Readonly<Record<string, JsonValue>>;
  return digest === sha256Canonical(body as unknown as JsonValue) &&
      ref === `${refPrefix}${digest.slice("sha256:".length)}`
    ? body
    : null;
}

function sameEnvelope(
  event: RuntimeEvent,
  expected: Readonly<{
    basisId: string;
    runId: string;
    graphCallId: string;
    frameId: string;
    materializationRef?: string | undefined;
  }>,
): boolean {
  return event.workflowVersion === "5.0.0" &&
    event.scopeClass === "run" &&
    event.basisId === expected.basisId &&
    event.runId === expected.runId &&
    event.graphCallId === expected.graphCallId &&
    event.frameId === expected.frameId &&
    (
      expected.materializationRef === undefined ||
      event.materializationRef === expected.materializationRef
    );
}

function materializationFor(
  authority: FanOutProjectionAuthority,
): Readonly<FanOutMaterialization> | null {
  const { graph, application } = authority;
  if (
    !isMaterializedGtlGraph(graph) ||
    graph.template.applications.find(
      (candidate) => candidate.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "fan_out" ||
    application.applicationRef !== graphFunctionApplicationRef(application)
  ) return null;
  const matches = graph.fanOutMaterializations.filter(
    (candidate) =>
      candidate.applicationRef === application.applicationRef &&
      candidate.batchRef === application.batchRef,
  );
  const materialization = matches.length === 1 ? matches[0]! : null;
  return materialization !== null &&
      materialization.inputVectorRef === application.inputVectorRef &&
      materialization.outputVectorRef === application.outputVectorRef &&
      materialization.inputMemberContractRef ===
        application.inputMemberContractRef &&
      materialization.outputMemberContractRef ===
        application.outputMemberContractRef
    ? materialization
    : null;
}

interface DeclaredFanOutWorkflowLocus {
  readonly nodeRef: string;
  readonly termPath: readonly string[];
  readonly term: Readonly<CWorkflowNode>;
  readonly taskOrdinal: number;
}

function collectFanOutWorkflowLoci(
  term: Readonly<CProgramNode>,
  nodeRef: string,
  path: readonly string[],
  batchRef: string,
  enclosingTaskOrdinal: number | null,
  rows: DeclaredFanOutWorkflowLocus[],
): void {
  switch (term.kind) {
    case "c_workflow":
      if (enclosingTaskOrdinal !== null) {
        rows.push({
          nodeRef,
          termPath: Object.freeze([...path]),
          term,
          taskOrdinal: enclosingTaskOrdinal,
        });
      }
      return;
    case "c_compose":
      term.terms.forEach((child, ordinal) =>
        collectFanOutWorkflowLoci(
          child,
          nodeRef,
          [...path, "terms", String(ordinal)],
          batchRef,
          enclosingTaskOrdinal,
          rows,
        ));
      return;
    case "c_edge":
      collectFanOutWorkflowLoci(
        term.transform,
        nodeRef,
        [...path, "transform"],
        batchRef,
        enclosingTaskOrdinal,
        rows,
      );
      collectFanOutWorkflowLoci(
        term.evaluate,
        nodeRef,
        [...path, "evaluate"],
        batchRef,
        enclosingTaskOrdinal,
        rows,
      );
      collectFanOutWorkflowLoci(
        term.consequence,
        nodeRef,
        [...path, "consequence"],
        batchRef,
        enclosingTaskOrdinal,
        rows,
      );
      return;
    case "c_batch":
      term.tasks.forEach((child, ordinal) =>
        collectFanOutWorkflowLoci(
          child,
          nodeRef,
          [...path, "tasks", String(ordinal)],
          batchRef,
          term.batchRef === batchRef ? ordinal : enclosingTaskOrdinal,
          rows,
        ));
      return;
    case "c_retry":
      collectFanOutWorkflowLoci(
        term.term,
        nodeRef,
        [...path, "term"],
        batchRef,
        enclosingTaskOrdinal,
        rows,
      );
      return;
    case "c_identity":
    case "c_of":
      return;
  }
}

function exactDeclaredFanOutWorkflowLocus(
  authority: FanOutProjectionAuthority,
  opened: RuntimeEvent,
): DeclaredFanOutWorkflowLocus | null {
  if (!isRecord(opened.payload) || !isOrdinal(opened.payload.taskOrdinal)) {
    return null;
  }
  const openedPayload = opened.payload;
  const taskOrdinal = openedPayload.taskOrdinal;
  const rows: DeclaredFanOutWorkflowLocus[] = [];
  for (const node of authority.graph.template.nodes) {
    collectFanOutWorkflowLoci(
      node.term,
      node.nodeRef,
      ["node", node.nodeRef, "c"],
      authority.application.batchRef,
      null,
      rows,
    );
  }
  const matches = rows.filter((row) => {
    if (
      row.taskOrdinal !== taskOrdinal ||
      row.term.graphFunctionRef !==
        authority.application.elementGraphFunctionRef ||
      row.term.inputCarrierRef !==
        authority.application.inputMemberContractRef ||
      row.term.outputCarrierRef !==
        authority.application.outputMemberContractRef
    ) return false;
    const locusDigest = sha256Canonical({
      graphFunctionRef: authority.graph.graphFunctionRef,
      nodeRef: row.nodeRef,
      termPath: row.termPath,
      childGraphFunctionRef: row.term.graphFunctionRef,
    } as unknown as JsonValue);
    return openedPayload.programLocusRef ===
      `workflow-locus://abiogenesis/${locusDigest.slice("sha256:".length)}`;
  });
  return matches.length === 1 ? matches[0]! : null;
}

function exactChildFoldbackBody(
  events: readonly RuntimeEvent[],
  opened: RuntimeEvent,
  fibre: RuntimeEvent,
  foldback: RuntimeEvent,
  boundaryOrdinal: number,
): Readonly<Record<string, JsonValue>> | null {
  const body = exactHashedPayload(
    foldback,
    "foldbackRef",
    "foldbackDigest",
    "child-foldback://abiogenesis/",
  );
  if (
    body === null ||
    body.parentCCallRef !== opened.aggregateId ||
    !isNonEmptyString(body.childExecutionBasisRef) ||
    !isDigest(body.childExecutionBasisDigest) ||
    !isNonEmptyString(body.childGraphCallId) ||
    !isNonEmptyString(body.childFrameId) ||
    !["blocked", "closed", "failed"].includes(
      String(body.childDisposition),
    ) ||
    !isNonEmptyString(body.childResultRef) ||
    !isDigest(body.childResultDigest) ||
    !isNonEmptyString(body.childJudgmentRef) ||
    !isDigest(body.outputDigest) ||
    !isNonEmptyString(body.childTerminalEventRef) ||
    foldback.causationEventRefs[1] !== fibre.eventId
  ) return null;
  const prior = events.filter(
    (event) => event.admissionOrdinal < foldback.admissionOrdinal &&
      event.admissionOrdinal < boundaryOrdinal,
  );
  const childBasis = uniqueEvent(prior, (event) =>
    event.kind === "basis_admitted" &&
    isRecord(event.payload) &&
    event.payload.basisRef === body.childExecutionBasisRef &&
    event.payload.basisDigest === body.childExecutionBasisDigest
  );
  const childResult = uniqueEvent(prior, (event) =>
    event.kind === "c_call_result_admitted" &&
    event.runId === opened.runId &&
    event.graphCallId === body.childGraphCallId &&
    event.frameId === body.childFrameId &&
    isRecord(event.payload) &&
    event.payload.resultRef === body.childResultRef &&
    event.payload.resultDigest === body.childResultDigest
  );
  const childJudgment = uniqueEvent(prior, (event) =>
    event.kind === "c_call_judged" &&
    event.runId === opened.runId &&
    event.graphCallId === body.childGraphCallId &&
    event.frameId === body.childFrameId &&
    isRecord(event.payload) &&
    event.payload.judgmentRef === body.childJudgmentRef &&
    event.payload.resultRef === body.childResultRef
  );
  if (
    childBasis === null || childResult === null || childJudgment === null ||
    childResult.aggregateType !== "c_call" ||
    childJudgment.aggregateType !== "c_call" ||
    childResult.aggregateId !== childJudgment.aggregateId ||
    childResult.parentAggregateId !== body.childFrameId ||
    childJudgment.parentAggregateId !== body.childFrameId ||
    childResult.basisId !== body.childExecutionBasisRef ||
    childJudgment.basisId !== body.childExecutionBasisRef ||
    childJudgment.causationEventRefs[0] !== childResult.eventId
  ) return null;
  const childResultBody = exactHashedPayload(
    childResult,
    "resultRef",
    "resultDigest",
    "result://abiogenesis/",
  );
  const childJudgmentBody = exactHashedPayload(
    childJudgment,
    "judgmentRef",
    "judgmentDigest",
    "judgment://abiogenesis/",
  );
  if (
    childResultBody === null || childJudgmentBody === null ||
    childResultBody.cCallRef !== childResult.aggregateId ||
    childResultBody.valueDigest !== body.outputDigest ||
    childJudgmentBody.cCallRef !== childResult.aggregateId ||
    childJudgmentBody.resultRef !== body.childResultRef ||
    childJudgmentBody.resultDigest !== body.childResultDigest ||
    childJudgmentBody.reasonRef !== body.childReasonRef
  ) return null;
  const expectedRouteKind = body.childDisposition === "closed"
    ? "terminal"
    : body.childDisposition;
  const childRoute = uniqueEvent(prior, (event) =>
    event.kind === "traversal_route_admitted" &&
    event.runId === opened.runId &&
    event.graphCallId === body.childGraphCallId &&
    event.frameId === body.childFrameId &&
    isRecord(event.payload) &&
    event.payload.routeKind === expectedRouteKind &&
    event.payload.cCallRef === childResult.aggregateId &&
      event.payload.judgmentRef === body.childJudgmentRef
  );
  const childRoutePayload = childRoute === null || !isRecord(childRoute.payload)
    ? null
    : childRoute.payload;
  if (
    childRoute === null || childRoutePayload === null ||
    childRoute.aggregateType !== "frame" ||
    childRoute.aggregateId !== body.childFrameId ||
    childRoute.parentAggregateId !== body.childGraphCallId ||
    childRoute.basisId !== body.childExecutionBasisRef ||
    !isCausallyReachable(prior, childJudgment.eventId, childRoute) ||
    exactHashedPayload(
      childRoute,
      "routeRef",
      "routeDigest",
      "traversal-route://abiogenesis/",
    ) === null
  ) return null;
  let childTerminal: RuntimeEvent | null = childRoute;
  if (body.childDisposition === "closed") {
    const terminalReached = uniqueEvent(prior, (event) =>
      event.kind === "terminal_reached" &&
      event.runId === opened.runId &&
      event.graphCallId === body.childGraphCallId &&
      event.frameId === body.childFrameId &&
      event.causationEventRefs[0] === childRoute.eventId &&
      isRecord(event.payload) &&
      event.payload.closureRef === body.childClosureRef &&
      event.payload.cCallRef === childResult.aggregateId &&
      event.payload.resultRef === body.childResultRef &&
      event.payload.judgmentRef === body.childJudgmentRef &&
      event.payload.routeRef === childRoutePayload.routeRef
    );
    const frameClosed = terminalReached === null
      ? null
      : uniqueEvent(prior, (event) =>
          event.kind === "frame_closed" &&
          event.runId === opened.runId &&
          event.graphCallId === body.childGraphCallId &&
          event.frameId === body.childFrameId &&
          event.causationEventRefs[0] === terminalReached.eventId
        );
    const graphCallClosed = frameClosed === null
      ? null
      : uniqueEvent(prior, (event) =>
          event.kind === "graph_call_closed" &&
          event.runId === opened.runId &&
          event.graphCallId === body.childGraphCallId &&
          event.causationEventRefs[0] === frameClosed.eventId
        );
    if (
      terminalReached === null || frameClosed === null ||
      graphCallClosed === null || body.childClosureRef === null
    ) return null;
    childTerminal = graphCallClosed;
  } else if (body.childClosureRef !== null) {
    return null;
  }
  return childTerminal.eventId === body.childTerminalEventRef &&
      foldback.causationEventRefs[0] === childTerminal.eventId
    ? body
    : null;
}

function exactTaskTruth(
  events: readonly RuntimeEvent[],
  opened: RuntimeEvent,
  boundaryOrdinal: number,
  authority: FanOutProjectionAuthority | null,
  batchRef: string,
): ExactTaskTruth | null {
  if (
    opened.kind !== "c_call_opened" ||
    opened.admissionOrdinal >= boundaryOrdinal ||
    opened.aggregateType !== "c_call" ||
    opened.parentAggregateId !== opened.frameId ||
    !isRecord(opened.payload) ||
    opened.payload.callClass !== "workflow" ||
    opened.payload.batchRef !== batchRef ||
    opened.payload.cCallRef !== opened.aggregateId ||
    !isNonEmptyString(opened.payload.cCallRef) ||
    !isDigest(opened.payload.cCallDigest) ||
    !isOrdinal(opened.payload.taskOrdinal) ||
    !isNonEmptyString(opened.payload.childGraphFunctionRef) ||
    !isNonEmptyString(opened.payload.failureContractRef) ||
    !isNonEmptyString(opened.payload.basisId) ||
    !isNonEmptyString(opened.payload.graphCallId) ||
    !isNonEmptyString(opened.payload.frameId) ||
    !isNonEmptyString(opened.payload.programLocusRef) ||
    !Number.isSafeInteger(opened.payload.vectorIndex) ||
    !Number.isSafeInteger(opened.payload.attempt) ||
    !Array.isArray(opened.payload.retryPath) ||
    !opened.payload.retryPath.every((value) =>
      Number.isSafeInteger(value) && Number(value) > 0
    )
  ) return null;
  const cCallIdentity = {
    basisId: opened.payload.basisId,
    graphCallId: opened.payload.graphCallId,
    frameId: opened.payload.frameId,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: opened.payload.stageRole,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
    childGraphFunctionRef: opened.payload.childGraphFunctionRef,
    failureContractRef: opened.payload.failureContractRef,
  };
  const cCallDigest = sha256Canonical(cCallIdentity as unknown as JsonValue);
  if (
    opened.payload.cCallDigest !== cCallDigest ||
    opened.aggregateId !== `c-call:${cCallDigest}` ||
    opened.payload.graphCallId !== opened.graphCallId ||
    opened.payload.frameId !== opened.frameId ||
    opened.payload.basisId !== opened.basisId ||
    (
      authority !== null &&
      (
        !sameEnvelope(opened, {
          ...authority,
          materializationRef: authority.graph.materializationRef,
        }) ||
        opened.graphFunctionRef !== authority.graph.graphFunctionRef ||
        opened.payload.childGraphFunctionRef !==
          authority.application.elementGraphFunctionRef ||
        exactDeclaredFanOutWorkflowLocus(authority, opened) === null
      )
    )
  ) return null;
  const cCallRows = events.filter(
    (event) =>
      event.aggregateType === "c_call" &&
      event.aggregateId === opened.aggregateId &&
      event.admissionOrdinal < boundaryOrdinal,
  );
  const fibre = uniqueEvent(cCallRows, (event) =>
    event.kind === "c_call_fibre_selected"
  );
  const result = uniqueEvent(cCallRows, (event) =>
    event.kind === "c_call_result_admitted"
  );
  const judgment = uniqueEvent(cCallRows, (event) =>
    event.kind === "c_call_judged"
  );
  const evidenceRows = cCallRows.filter(
    (event) => event.kind === "c_call_evidenced",
  );
  const evidence = evidenceRows.length === 1 ? evidenceRows[0]! : null;
  const foldback = uniqueEvent(events, (event) =>
    event.kind === "child_foldback_admitted" &&
    event.admissionOrdinal < boundaryOrdinal &&
    event.frameId === opened.frameId &&
    isRecord(event.payload) &&
    event.payload.parentCCallRef === opened.aggregateId
  );
  if (
    fibre === null || result === null || judgment === null ||
    evidence === null || foldback === null ||
    !isRecord(fibre.payload) ||
    fibre.payload.cCallRef !== opened.aggregateId ||
    fibre.payload.callClass !== "workflow" ||
    fibre.payload.childGraphFunctionRef !== opened.payload.childGraphFunctionRef ||
    fibre.parentAggregateId !== opened.frameId ||
    !sameEnvelope(fibre, {
      basisId: opened.basisId!,
      runId: opened.runId!,
      graphCallId: opened.graphCallId!,
      frameId: opened.frameId!,
      materializationRef: opened.materializationRef,
    }) ||
    fibre.causationEventRefs[0] !== opened.eventId ||
    !(opened.admissionOrdinal < fibre.admissionOrdinal &&
      fibre.admissionOrdinal < foldback.admissionOrdinal &&
      foldback.admissionOrdinal < evidence.admissionOrdinal &&
      evidence.admissionOrdinal < result.admissionOrdinal &&
      result.admissionOrdinal < judgment.admissionOrdinal)
  ) return null;
  const foldbackBody = exactChildFoldbackBody(
    events,
    opened,
    fibre,
    foldback,
    boundaryOrdinal,
  );
  const evidenceBody = exactHashedPayload(
    evidence,
    "evidenceRef",
    "evidenceDigest",
    "evidence://abiogenesis/",
  );
  const resultBody = exactHashedPayload(
    result,
    "resultRef",
    "resultDigest",
    "result://abiogenesis/",
  );
  const judgmentBody = exactHashedPayload(
    judgment,
    "judgmentRef",
    "judgmentDigest",
    "judgment://abiogenesis/",
  );
  if (
    foldbackBody === null || evidenceBody === null ||
    resultBody === null || judgmentBody === null ||
    !isRecord(foldback.payload) || !isRecord(evidence.payload) ||
    !isRecord(result.payload) || !isRecord(judgment.payload) ||
    foldback.aggregateType !== "frame" ||
    foldback.aggregateId !== opened.frameId ||
    foldback.parentAggregateId !== opened.graphCallId ||
    !sameEnvelope(foldback, {
      basisId: opened.basisId!,
      runId: opened.runId!,
      graphCallId: opened.graphCallId!,
      frameId: opened.frameId!,
    }) ||
    foldbackBody.parentCCallRef !== opened.aggregateId ||
    !isNonEmptyString(foldbackBody.childResultRef) ||
    !isDigest(foldbackBody.childResultDigest) ||
    !isNonEmptyString(foldbackBody.childJudgmentRef) ||
    !isDigest(foldbackBody.outputDigest) ||
    !["blocked", "closed", "failed"].includes(
      String(foldbackBody.childDisposition),
    ) ||
    evidenceBody.cCallRef !== opened.aggregateId ||
    evidenceBody.evidenceClass !== "sub_traversal" ||
    evidenceBody.foldbackRef !== foldback.payload.foldbackRef ||
    evidenceBody.foldbackDigest !== foldback.payload.foldbackDigest ||
    evidenceBody.foldbackEventRef !== foldback.eventId ||
    evidenceBody.childExecutionBasisRef !==
      foldbackBody.childExecutionBasisRef ||
    evidenceBody.childExecutionBasisDigest !==
      foldbackBody.childExecutionBasisDigest ||
    evidenceBody.childGraphCallId !== foldbackBody.childGraphCallId ||
    evidenceBody.childFrameId !== foldbackBody.childFrameId ||
    evidenceBody.childDisposition !== foldbackBody.childDisposition ||
    evidenceBody.childResultRef !== foldbackBody.childResultRef ||
    evidenceBody.childResultDigest !== foldbackBody.childResultDigest ||
    evidenceBody.childOutputDigest !== foldbackBody.outputDigest ||
    evidenceBody.childJudgmentRef !== foldbackBody.childJudgmentRef ||
    evidenceBody.childClosureRef !== foldbackBody.childClosureRef ||
    evidenceBody.childReasonRef !== foldbackBody.childReasonRef ||
    evidenceBody.childTerminalEventRef !== foldbackBody.childTerminalEventRef ||
    evidence.aggregateType !== "c_call" ||
    evidence.aggregateId !== opened.aggregateId ||
    evidence.parentAggregateId !== opened.frameId ||
    !sameEnvelope(evidence, {
      basisId: opened.basisId!,
      runId: opened.runId!,
      graphCallId: opened.graphCallId!,
      frameId: opened.frameId!,
    }) ||
    evidence.causationEventRefs[0] !== fibre.eventId ||
    evidence.causationEventRefs[1] !== foldback.eventId ||
    resultBody.cCallRef !== opened.aggregateId ||
    !isNonEmptyString(resultBody.resultClass) ||
    !isNonEmptyString(resultBody.contractRef) ||
    !isDigest(resultBody.valueDigest) ||
    !isRecord(resultBody.value) ||
    sha256Canonical(resultBody.value) !== resultBody.valueDigest ||
    !Array.isArray(resultBody.evidenceRefs) ||
    !sameStrings(
      resultBody.evidenceRefs.filter(
        (value): value is string => typeof value === "string",
      ),
      [String(evidence.payload.evidenceRef)],
    ) ||
    result.aggregateType !== "c_call" ||
    result.aggregateId !== opened.aggregateId ||
    result.parentAggregateId !== opened.frameId ||
    !sameEnvelope(result, {
      basisId: opened.basisId!,
      runId: opened.runId!,
      graphCallId: opened.graphCallId!,
      frameId: opened.frameId!,
    }) ||
    result.causationEventRefs[0] !== evidence.eventId ||
    judgmentBody.cCallRef !== opened.aggregateId ||
    judgmentBody.resultRef !== result.payload.resultRef ||
    judgmentBody.resultDigest !== result.payload.resultDigest ||
    !isNonEmptyString(judgmentBody.judgment) ||
    judgment.aggregateType !== "c_call" ||
    judgment.aggregateId !== opened.aggregateId ||
    judgment.parentAggregateId !== opened.frameId ||
    !sameEnvelope(judgment, {
      basisId: opened.basisId!,
      runId: opened.runId!,
      graphCallId: opened.graphCallId!,
      frameId: opened.frameId!,
    }) ||
    judgment.causationEventRefs[0] !== result.eventId
  ) return null;
  return {
    ordinal: opened.payload.taskOrdinal,
    cCallRef: opened.aggregateId,
    retryPath: Object.freeze(opened.payload.retryPath.map(Number)),
    opened,
    foldback,
    evidence,
    result,
    judgment,
    resultRef: result.payload.resultRef as string,
    resultDigest: result.payload.resultDigest as Sha256Digest,
    resultClass: resultBody.resultClass,
    resultContractRef: resultBody.contractRef,
    resultValue: resultBody.value,
    resultValueDigest: resultBody.valueDigest,
    judgmentRef: judgment.payload.judgmentRef as string,
    judgmentDisposition: judgmentBody.judgment,
    foldbackRef: foldback.payload.foldbackRef as string,
    retryAttemptRef: typeof judgmentBody.retryAttemptRef === "string"
      ? judgmentBody.retryAttemptRef
      : null,
  };
}

function exactTaskCensus(
  prefix: ValidatedRuntimeEventPrefix,
  boundaryOrdinal: number,
  envelope: Readonly<{
    runId: string;
    graphCallId: string;
    frameId: string;
  }>,
  batchRef: string,
  authority: FanOutProjectionAuthority | null,
): readonly ExactTaskTruth[] | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const historicalPrefix = Number.isFinite(boundaryOrdinal)
    ? (() => {
        const priorEvent = events.find(
          (event) => event.admissionOrdinal === boundaryOrdinal - 1,
        );
        return priorEvent === undefined
          ? null
          : validatedRuntimeEventPrefixThroughEvent(prefix, priorEvent.eventId);
      })()
    : prefix;
  if (historicalPrefix === null) return null;
  const calculus = deriveRuntimeEventCalculusProjection(historicalPrefix);
  const openedRows = events.filter((event) =>
    event.kind === "c_call_opened" &&
    event.admissionOrdinal < boundaryOrdinal &&
    event.runId === envelope.runId &&
    event.graphCallId === envelope.graphCallId &&
    event.frameId === envelope.frameId &&
    isRecord(event.payload) &&
    event.payload.callClass === "workflow" &&
    event.payload.batchRef === batchRef
  );
  if (
    openedRows.length === 0 ||
    new Set(openedRows.map((event) => event.aggregateId)).size !==
      openedRows.length
  ) return null;
  const truths = openedRows.map((opened) =>
    exactTaskTruth(events, opened, boundaryOrdinal, authority, batchRef)
  );
  if (truths.some((truth) => truth === null)) return null;
  const current = (truths as ExactTaskTruth[]).filter((truth) => {
    return truth.retryPath.length === 0
      ? truth.retryAttemptRef === null
      : truth.retryAttemptRef !== null && holdsAt(
          calculus,
          constructRuntimeFluent({
            name: "retry_attempt_active",
            identity: truth.retryAttemptRef,
          }),
        );
  });
  const historicalByOrdinal = new Map<number, ExactTaskTruth[]>();
  for (const truth of truths as ExactTaskTruth[]) {
    const rows = historicalByOrdinal.get(truth.ordinal) ?? [];
    rows.push(truth);
    historicalByOrdinal.set(truth.ordinal, rows);
  }
  if (
    current.some((truth) =>
      (historicalByOrdinal.get(truth.ordinal) ?? []).some((prior) =>
        prior !== truth && prior.retryAttemptRef === truth.retryAttemptRef
      )
    ) ||
    new Set(current.map((truth) => truth.ordinal)).size !== current.length
  ) return null;
  const ordered = current.sort(
    (left, right) => left.ordinal - right.ordinal,
  );
  return ordered.every((truth, ordinal) => truth.ordinal === ordinal)
    ? Object.freeze(ordered)
    : null;
}

function completedRow(
  truth: ExactTaskTruth,
  member: Readonly<{
    ordinal: number;
    memberRef: string;
    memberDigest: Sha256Digest;
  }>,
  outputMemberContractRef: string,
): FanOutCompletedTaskRow | null {
  if (
    truth.ordinal !== member.ordinal ||
    truth.resultClass !== "success" ||
    truth.resultContractRef !== outputMemberContractRef ||
    truth.judgmentDisposition !== "advance"
  ) return null;
  const outputMemberDigest = sha256Canonical({
    applicationInputMemberRef: member.memberRef,
    ordinal: member.ordinal,
    resultRef: truth.resultRef,
    resultDigest: truth.resultDigest,
    value: truth.resultValue,
  });
  return {
    ordinal: member.ordinal,
    inputMemberRef: member.memberRef,
    inputMemberDigest: member.memberDigest,
    cCallRef: truth.cCallRef,
    foldbackRef: truth.foldbackRef,
    foldbackEventRef: truth.foldback.eventId,
    resultRef: truth.resultRef,
    resultDigest: truth.resultDigest,
    judgmentRef: truth.judgmentRef,
    outputMemberRef:
      `fan-out-output-member://abiogenesis/${outputMemberDigest.slice("sha256:".length)}`,
    outputMemberDigest,
    value: truth.resultValue,
  };
}

function completedRowFromPayload(
  value: JsonValue | undefined,
  truth: ExactTaskTruth,
): FanOutCompletedTaskRow | null {
  if (!isRecord(value) || !exactKeys(value, [
    "cCallRef",
    "foldbackEventRef",
    "foldbackRef",
    "inputMemberDigest",
    "inputMemberRef",
    "judgmentRef",
    "ordinal",
    "outputMemberDigest",
    "outputMemberRef",
    "resultDigest",
    "resultRef",
    "value",
  ]) || !isOrdinal(value.ordinal) || !isNonEmptyString(value.inputMemberRef) ||
    !isDigest(value.inputMemberDigest) || !isRecord(value.value)) return null;
  const member = {
    ordinal: value.ordinal,
    memberRef: value.inputMemberRef,
    memberDigest: value.inputMemberDigest,
  };
  const expected = completedRow(truth, member, truth.resultContractRef);
  return expected !== null &&
      sha256Canonical(expected as unknown as JsonValue) ===
        sha256Canonical(value)
    ? expected
    : null;
}

function stoppingRow(
  truth: ExactTaskTruth,
  member: Readonly<{
    ordinal: number;
    memberRef: string;
    memberDigest: Sha256Digest;
  }>,
): FanOutStoppingTaskRow | null {
  return truth.ordinal === member.ordinal &&
      truth.judgmentDisposition === "blocked"
    ? {
        ordinal: member.ordinal,
        inputMemberRef: member.memberRef,
        inputMemberDigest: member.memberDigest,
        cCallRef: truth.cCallRef,
        foldbackRef: truth.foldbackRef,
        foldbackEventRef: truth.foldback.eventId,
        resultRef: truth.resultRef,
        resultDigest: truth.resultDigest,
        judgmentRef: truth.judgmentRef,
        disposition: "blocked",
        stoppingEventRef: truth.judgment.eventId,
      }
    : null;
}

function completionCommon(
  applicationRef: string,
  batchRef: string,
  materialization: Readonly<FanOutMaterialization>,
): Readonly<Record<string, JsonValue>> {
  return {
    applicationRef,
    batchRef,
    inputVectorRef: materialization.inputVectorRef,
    outputVectorContractRef: materialization.outputVectorRef,
    inputMemberContractRef: materialization.inputMemberContractRef,
    outputMemberContractRef: materialization.outputMemberContractRef,
  };
}

function candidateProjection(
  prefix: ValidatedRuntimeEventPrefix,
  request: Extract<ExactFanOutCompletionProjectionRequest, { mode: "candidate" }>,
): FanOutCompletionCandidateProjection | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  if (
    sha256Canonical(events as unknown as JsonValue) !==
      request.expectedPrefixDigest
  ) return null;
  const materialization = materializationFor(request.authority);
  if (materialization === null) return null;
  const truths = exactTaskCensus(
    prefix,
    Number.POSITIVE_INFINITY,
    request.authority,
    request.authority.application.batchRef,
    request.authority,
  );
  if (
    truths === null || truths.length > materialization.members.length
  ) return null;
  const completedRows: FanOutCompletedTaskRow[] = [];
  for (const [ordinal, truth] of truths.entries()) {
    const member = materialization.members[ordinal];
    if (member === undefined) return null;
    const row = completedRow(
      truth,
      member,
      materialization.outputMemberContractRef,
    );
    if (row === null) break;
    completedRows.push(row);
  }
  const common = completionCommon(
    request.authority.application.applicationRef,
    request.authority.application.batchRef,
    materialization,
  );
  let variant: Readonly<Record<string, JsonValue>>;
  if (request.completionKind === "complete_vector") {
    if (
      truths.length !== materialization.members.length ||
      completedRows.length !== materialization.members.length
    ) return null;
    const outputVector = deepFreeze({
      kind: "gtl_fan_out_vector" as const,
      schemaVersion: "5.0.0" as const,
      applicationRef: request.authority.application.applicationRef,
      members: completedRows.map((row) => ({
        ordinal: row.ordinal,
        inputMemberRef: row.inputMemberRef,
        outputMemberRef: row.outputMemberRef,
        value: row.value,
      })),
    }) as Readonly<Record<string, JsonValue>>;
    if (!request.validateOutputVector(outputVector)) return null;
    const outputVectorDigest = sha256Canonical(outputVector);
    variant = {
      completionKind: "complete_vector",
      taskRows: completedRows as unknown as JsonValue,
      outputVectorRef:
        `graph-vector-value://abiogenesis/${outputVectorDigest.slice("sha256:".length)}`,
      outputVectorDigest,
      outputVector,
    };
  } else {
    const truth = truths[completedRows.length];
    const member = materialization.members[completedRows.length];
    const stopped = truth === undefined || member === undefined
      ? null
      : stoppingRow(truth, member);
    if (
      stopped === null || truths.length !== completedRows.length + 1
    ) return null;
    variant = {
      completionKind: "partial_stop",
      completedRows: completedRows as unknown as JsonValue,
      stoppingRow: stopped as unknown as JsonValue,
      unstartedRows: materialization.members.slice(completedRows.length + 1)
        .map((unstarted) => ({
          ordinal: unstarted.ordinal,
          inputMemberRef: unstarted.memberRef,
          inputMemberDigest: unstarted.memberDigest,
        })),
    };
  }
  const completionBody = deepFreeze({
    ...common,
    ...variant,
  }) as Readonly<Record<string, JsonValue>>;
  const completionDigest = sha256Canonical(completionBody as JsonValue);
  const completionRef =
    `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}`;
  return deepFreeze({
    kind: "fan_out_completion_candidate_projection" as const,
    schemaVersion: "5.0.0" as const,
    completionBody,
    completionRef,
    completionDigest,
    requiredCausationEventRefs: [...new Set(truths.flatMap((truth) => [
      truth.foldback.eventId,
      truth.judgment.eventId,
    ]))],
  });
}

function canonicalAdmission(
  prefix: ValidatedRuntimeEventPrefix,
  request: Exclude<ExactFanOutCompletionProjectionRequest, { mode: "candidate" }>,
): FanOutCompletionAdmission | null {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const completionEvent = uniqueEvent(events, (event) =>
    event.eventId === request.admissionEventRef &&
    event.kind === "fan_out_completion_admitted"
  );
  if (
    completionEvent === null ||
    completionEvent.aggregateType !== "frame" ||
    completionEvent.aggregateId !== completionEvent.frameId ||
    completionEvent.parentAggregateId !== completionEvent.graphCallId ||
    completionEvent.workflowVersion !== "5.0.0" ||
    completionEvent.scopeClass !== "run" ||
    !isNonEmptyString(completionEvent.basisId) ||
    !isNonEmptyString(completionEvent.runId) ||
    !isNonEmptyString(completionEvent.graphCallId) ||
    !isNonEmptyString(completionEvent.frameId) ||
    !isRecord(completionEvent.payload)
  ) return null;
  const payload = completionEvent.payload;
  const completionRef = payload.completionRef;
  const completionDigest = payload.completionDigest;
  const applicationRef = payload.applicationRef;
  const batchRef = payload.batchRef;
  const inputVectorRef = payload.inputVectorRef;
  const outputVectorContractRef = payload.outputVectorContractRef;
  const inputMemberContractRef = payload.inputMemberContractRef;
  const outputMemberContractRef = payload.outputMemberContractRef;
  const completionKind = payload.completionKind;
  if (
    !isNonEmptyString(completionRef) || !isDigest(completionDigest) ||
    !isNonEmptyString(applicationRef) || !isNonEmptyString(batchRef) ||
    !isNonEmptyString(inputVectorRef) ||
    !isNonEmptyString(outputVectorContractRef) ||
    !isNonEmptyString(inputMemberContractRef) ||
    !isNonEmptyString(outputMemberContractRef) ||
    (completionKind !== "complete_vector" && completionKind !== "partial_stop")
  ) return null;
  const authority = request.mode === "graph_bound" ? request.authority : null;
  const materialization = authority === null ? null : materializationFor(authority);
  if (
    authority !== null &&
    (
      materialization === null ||
      !sameEnvelope(completionEvent, {
        ...authority,
        materializationRef: authority.graph.materializationRef,
      }) ||
      completionEvent.graphFunctionRef !== authority.graph.graphFunctionRef ||
      applicationRef !== authority.application.applicationRef ||
      batchRef !== authority.application.batchRef ||
      inputVectorRef !== materialization.inputVectorRef ||
      outputVectorContractRef !== materialization.outputVectorRef ||
      inputMemberContractRef !== materialization.inputMemberContractRef ||
      outputMemberContractRef !== materialization.outputMemberContractRef
    )
  ) return null;
  const truths = exactTaskCensus(
    prefix,
    completionEvent.admissionOrdinal,
    {
      runId: completionEvent.runId,
      graphCallId: completionEvent.graphCallId,
      frameId: completionEvent.frameId,
    },
    batchRef,
    authority,
  );
  if (truths === null) return null;
  const common = {
    applicationRef,
    batchRef,
    inputVectorRef,
    outputVectorContractRef,
    inputMemberContractRef,
    outputMemberContractRef,
  };
  let body: Readonly<Record<string, JsonValue>>;
  if (completionKind === "complete_vector") {
    if (!exactKeys(payload, [
      "applicationRef",
      "batchRef",
      "completionDigest",
      "completionKind",
      "completionRef",
      "inputMemberContractRef",
      "inputVectorRef",
      "outputMemberContractRef",
      "outputVector",
      "outputVectorContractRef",
      "outputVectorDigest",
      "outputVectorRef",
      "taskRows",
    ]) || !Array.isArray(payload.taskRows) ||
      payload.taskRows.length !== truths.length ||
      !isRecord(payload.outputVector) ||
      !isDigest(payload.outputVectorDigest) ||
      !isNonEmptyString(payload.outputVectorRef)) return null;
    const rows = payload.taskRows.map((value, ordinal) => {
      const truth = truths[ordinal];
      if (truth === undefined) return null;
      const row = completedRowFromPayload(value, truth);
      if (
        row === null ||
        (
          materialization !== null &&
          (
            materialization.members[ordinal]?.ordinal !== row.ordinal ||
            materialization.members[ordinal]?.memberRef !== row.inputMemberRef ||
            materialization.members[ordinal]?.memberDigest !==
              row.inputMemberDigest ||
            truth.resultContractRef !== materialization.outputMemberContractRef
          )
        )
      ) return null;
      return row;
    });
    if (
      rows.some((row) => row === null) ||
      (materialization !== null && rows.length !== materialization.members.length)
    ) return null;
    const taskRows = rows as FanOutCompletedTaskRow[];
    const outputVector = {
      kind: "gtl_fan_out_vector",
      schemaVersion: "5.0.0",
      applicationRef,
      members: taskRows.map((row) => ({
        ordinal: row.ordinal,
        inputMemberRef: row.inputMemberRef,
        outputMemberRef: row.outputMemberRef,
        value: row.value,
      })),
    };
    const outputVectorDigest = sha256Canonical(outputVector as JsonValue);
    if (
      sha256Canonical(payload.outputVector) !== outputVectorDigest ||
      sha256Canonical(payload.outputVector) !==
        sha256Canonical(outputVector as JsonValue) ||
      payload.outputVectorDigest !== outputVectorDigest ||
      payload.outputVectorRef !==
        `graph-vector-value://abiogenesis/${outputVectorDigest.slice("sha256:".length)}`
    ) return null;
    body = {
      ...common,
      completionKind,
      taskRows: taskRows as unknown as JsonValue,
      outputVectorRef: payload.outputVectorRef,
      outputVectorDigest,
      outputVector: payload.outputVector,
    };
  } else {
    if (!exactKeys(payload, [
      "applicationRef",
      "batchRef",
      "completedRows",
      "completionDigest",
      "completionKind",
      "completionRef",
      "inputMemberContractRef",
      "inputVectorRef",
      "outputMemberContractRef",
      "outputVectorContractRef",
      "stoppingRow",
      "unstartedRows",
    ]) || !Array.isArray(payload.completedRows) ||
      !Array.isArray(payload.unstartedRows) || !isRecord(payload.stoppingRow) ||
      truths.length !== payload.completedRows.length + 1) return null;
    const completedRows = payload.completedRows.map((value, ordinal) => {
      const truth = truths[ordinal];
      return truth === undefined ? null : completedRowFromPayload(value, truth);
    });
    if (completedRows.some((row) => row === null)) return null;
    const stoppingTruth = truths[payload.completedRows.length]!;
    const stoppingValue = payload.stoppingRow;
    if (
      !exactKeys(stoppingValue, [
        "cCallRef",
        "disposition",
        "foldbackEventRef",
        "foldbackRef",
        "inputMemberDigest",
        "inputMemberRef",
        "judgmentRef",
        "ordinal",
        "resultDigest",
        "resultRef",
        "stoppingEventRef",
      ]) || !isOrdinal(stoppingValue.ordinal) ||
      !isNonEmptyString(stoppingValue.inputMemberRef) ||
      !isDigest(stoppingValue.inputMemberDigest)
    ) return null;
    const stoppingOrdinal = stoppingValue.ordinal;
    const expectedStopping = stoppingRow(stoppingTruth, {
      ordinal: stoppingValue.ordinal,
      memberRef: stoppingValue.inputMemberRef,
      memberDigest: stoppingValue.inputMemberDigest,
    });
    if (
      expectedStopping === null ||
      sha256Canonical(expectedStopping as unknown as JsonValue) !==
        sha256Canonical(stoppingValue) ||
      (
        materialization !== null &&
        (
          materialization.members[stoppingOrdinal]?.memberRef !==
            stoppingValue.inputMemberRef ||
          materialization.members[stoppingOrdinal]?.memberDigest !==
            stoppingValue.inputMemberDigest
        )
      )
    ) return null;
    const unstartedRows = payload.unstartedRows.map((value, offset) => {
      if (!isRecord(value) || !exactKeys(value, [
        "inputMemberDigest",
        "inputMemberRef",
        "ordinal",
      ]) || !isOrdinal(value.ordinal) || !isNonEmptyString(value.inputMemberRef) ||
        !isDigest(value.inputMemberDigest) ||
        value.ordinal !== stoppingOrdinal + offset + 1) return null;
      return value;
    });
    if (
      unstartedRows.some((row) => row === null) ||
      (
        materialization !== null &&
        (
          materialization.members.length !==
            payload.completedRows.length + 1 + unstartedRows.length ||
          unstartedRows.some((row) => {
            if (row === null) return true;
            const member = materialization.members[row.ordinal as number];
            return member === undefined ||
              member.memberRef !== row.inputMemberRef ||
              member.memberDigest !== row.inputMemberDigest;
          })
        )
      )
    ) return null;
    body = {
      ...common,
      completionKind,
      completedRows: completedRows as unknown as JsonValue,
      stoppingRow: expectedStopping as unknown as JsonValue,
      unstartedRows: unstartedRows as unknown as JsonValue,
    };
  }
  if (
    completionDigest !== sha256Canonical(body as JsonValue) ||
    completionRef !==
      `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}` ||
    truths.some((truth) =>
      !completionEvent.causationEventRefs.includes(truth.foldback.eventId) ||
      !completionEvent.causationEventRefs.includes(truth.judgment.eventId)
    )
  ) return null;
  return deepFreeze({
    kind: "fan_out_completion_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    completionRef,
    completionDigest,
    ...body,
    admissionEventRef: completionEvent.eventId,
  }) as FanOutCompletionAdmission;
}

export function projectExactFanOutCompletion(
  prefix: ValidatedRuntimeEventPrefix,
  request: ExactFanOutCompletionProjectionRequest,
): FanOutCompletionCandidateProjection | FanOutCompletionAdmission | null {
  return request.mode === "candidate"
    ? candidateProjection(prefix, request)
    : canonicalAdmission(prefix, request);
}
