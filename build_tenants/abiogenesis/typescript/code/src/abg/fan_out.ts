import type {
  FanOutApplication,
  FanOutMaterialization,
  GtlGraph,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
} from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasAdmittedExecutionBasis,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
} from "./event_store.js";
import { replay, type ReplayCCallState, type ReplayState } from "./replay.js";
import {
  hasAdmittedTraversalCursor,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface FanOutCompletedTaskRow {
  readonly ordinal: number;
  readonly inputMemberRef: string;
  readonly inputMemberDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly foldbackRef: string;
  readonly foldbackEventRef: string;
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
  readonly judgmentRef: string;
  readonly outputMemberRef: string;
  readonly outputMemberDigest: Sha256Digest;
  readonly value: JsonValue;
}

export interface FanOutStoppingTaskRow {
  readonly ordinal: number;
  readonly inputMemberRef: string;
  readonly inputMemberDigest: Sha256Digest;
  readonly cCallRef: string;
  readonly foldbackRef: string;
  readonly foldbackEventRef: string;
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
  readonly judgmentRef: string;
  readonly disposition: "blocked";
  readonly stoppingEventRef: string;
}

interface FanOutCompletionBase {
  readonly kind: "fan_out_completion_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly completionRef: string;
  readonly completionDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly batchRef: string;
  readonly inputVectorRef: string;
  readonly outputVectorContractRef: string;
  readonly inputMemberContractRef: string;
  readonly outputMemberContractRef: string;
  readonly admissionEventRef: string;
}

export interface CompleteFanOutAdmission extends FanOutCompletionBase {
  readonly completionKind: "complete_vector";
  readonly taskRows: readonly FanOutCompletedTaskRow[];
  readonly outputVectorRef: string;
  readonly outputVectorDigest: Sha256Digest;
  readonly outputVector: Readonly<Record<string, JsonValue>>;
}

export interface PartialFanOutAdmission extends FanOutCompletionBase {
  readonly completionKind: "partial_stop";
  readonly completedRows: readonly FanOutCompletedTaskRow[];
  readonly stoppingRow: FanOutStoppingTaskRow;
  readonly unstartedRows: readonly {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly inputMemberDigest: Sha256Digest;
  }[];
}

export type FanOutCompletionAdmission =
  | CompleteFanOutAdmission
  | PartialFanOutAdmission;

export interface FanOutCompletionRefusal {
  readonly kind: "fan_out_completion_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "application_mismatch"
    | "completion_already_admitted"
    | "replay_mismatch"
    | "task_census_mismatch"
    | "vector_contract_mismatch";
  readonly message: string;
}

export type FanOutCompletionResult =
  | FanOutCompletionAdmission
  | FanOutCompletionRefusal;

export interface AdmitFanOutCompletionInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly graph: Readonly<GtlGraph>;
  readonly application: Readonly<FanOutApplication>;
  readonly sourceCursor: TraversalCursorCandidate;
  readonly replayState: ReplayState;
  readonly completionKind: "complete_vector" | "partial_stop";
  readonly validateOutputVector: (
    value: unknown,
  ) => value is Readonly<Record<string, JsonValue>>;
  readonly basis: RuntimeAdmissionBasis;
}

const admittedFanOutCompletions = new WeakSet<object>();

export function isAdmittedFanOutCompletion(
  value: object,
): value is FanOutCompletionAdmission {
  return admittedFanOutCompletions.has(value);
}

function refusal(
  code: FanOutCompletionRefusal["code"],
  message: string,
): FanOutCompletionRefusal {
  return {
    kind: "fan_out_completion_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function materializationFor(
  graph: Readonly<GtlGraph>,
  application: Readonly<FanOutApplication>,
): Readonly<FanOutMaterialization> | null {
  return graph.fanOutMaterializations.find(
    (candidate) =>
      candidate.applicationRef === application.applicationRef &&
      candidate.batchRef === application.batchRef,
  ) ?? null;
}

interface TaskTruth {
  readonly state: ReplayCCallState;
  readonly openedEventRef: string;
  readonly resultEventRef: string;
  readonly judgmentEventRef: string;
  readonly foldbackRef: string;
  readonly foldbackEventRef: string;
}

function taskTruth(
  store: AbgEventStore,
  frameId: string,
  batchRef: string,
  state: ReplayCCallState,
): TaskTruth | null {
  const events = store.readAll();
  const opened = events.find(
    (event) =>
      event.kind === "c_call_opened" &&
      event.aggregateId === state.cCallRef &&
      event.frameId === frameId &&
      isRecord(event.payload) &&
      event.payload.callClass === "workflow" &&
      event.payload.batchRef === batchRef &&
      event.payload.taskOrdinal === state.taskOrdinal,
  );
  const result = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === state.cCallRef &&
      isRecord(event.payload) &&
      event.payload.resultRef === state.resultRef,
  );
  const judgment = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === state.cCallRef &&
      isRecord(event.payload) &&
      event.payload.judgmentRef === state.judgmentRef &&
      event.payload.resultRef === state.resultRef,
  );
  const foldback = events.find(
    (event) =>
      event.kind === "child_foldback_admitted" &&
      event.frameId === frameId &&
      isRecord(event.payload) &&
      event.payload.parentCCallRef === state.cCallRef,
  );
  const foldbackRef = foldback !== undefined && isRecord(foldback.payload)
    ? foldback.payload.foldbackRef
    : null;
  if (
    opened === undefined ||
    result === undefined ||
    judgment === undefined ||
    foldback === undefined ||
    typeof foldbackRef !== "string" ||
    !judgment.causationEventRefs.includes(result.eventId)
  ) {
    return null;
  }
  return {
    state,
    openedEventRef: opened.eventId,
    resultEventRef: result.eventId,
    judgmentEventRef: judgment.eventId,
    foldbackRef,
    foldbackEventRef: foldback.eventId,
  };
}

function completedRow(
  member: FanOutMaterialization["members"][number],
  truth: TaskTruth,
  outputMemberContractRef: string,
): FanOutCompletedTaskRow | null {
  const state = truth.state;
  if (
    state.status !== "judged" ||
    state.taskOrdinal !== member.ordinal ||
    state.resultRef === null ||
    state.resultDigest === null ||
    state.resultClass !== "success" ||
    state.resultContractRef !== outputMemberContractRef ||
    state.resultValue === null ||
    state.judgmentRef === null ||
    state.judgment !== "advance"
  ) {
    return null;
  }
  const outputMemberDigest = sha256Canonical({
    applicationInputMemberRef: member.memberRef,
    ordinal: member.ordinal,
    resultRef: state.resultRef,
    resultDigest: state.resultDigest,
    value: state.resultValue,
  });
  return {
    ordinal: member.ordinal,
    inputMemberRef: member.memberRef,
    inputMemberDigest: member.memberDigest,
    cCallRef: state.cCallRef,
    foldbackRef: truth.foldbackRef,
    foldbackEventRef: truth.foldbackEventRef,
    resultRef: state.resultRef,
    resultDigest: state.resultDigest,
    judgmentRef: state.judgmentRef,
    outputMemberRef:
      `fan-out-output-member://abiogenesis/${outputMemberDigest.slice("sha256:".length)}`,
    outputMemberDigest,
    value: state.resultValue,
  };
}

function completionBody(
  input: AdmitFanOutCompletionInput,
  materialization: Readonly<FanOutMaterialization>,
): Omit<FanOutCompletionBase, "admissionEventRef" | "completionDigest" | "completionRef" | "disposition" | "kind" | "schemaVersion"> {
  return {
    applicationRef: input.application.applicationRef,
    batchRef: input.application.batchRef,
    inputVectorRef: materialization.inputVectorRef,
    outputVectorContractRef: materialization.outputVectorRef,
    inputMemberContractRef: materialization.inputMemberContractRef,
    outputMemberContractRef: materialization.outputMemberContractRef,
  };
}

export function admitFanOutCompletion(
  input: AdmitFanOutCompletionInput,
): FanOutCompletionResult {
  const materialization = materializationFor(input.graph, input.application);
  if (
    !hasAdmittedExecutionBasis(input.store, input.executionBasis) ||
    !isMaterializedGtlGraph(input.graph) ||
    input.executionBasis.graphRef !== input.graph.materializationRef ||
    input.graph.template.applications.find(
      (candidate) => candidate.applicationRef === input.application.applicationRef,
    ) !== input.application ||
    input.application.relationKind !== "fan_out" ||
    input.application.applicationRef !== graphFunctionApplicationRef(input.application) ||
    materialization === null ||
    !hasAdmittedTraversalCursor(input.store, input.sourceCursor) ||
    input.sourceCursor.executionBasisRef !== input.executionBasis.basisRef ||
    input.sourceCursor.frameId.length === 0
  ) {
    return refusal(
      "application_mismatch",
      "fan-out completion requires the exact admitted application, materialization, basis, and source cursor",
    );
  }
  const currentReplay = replay(input.store, {
    runId: input.sourceCursor.runId,
  });
  if (
    currentReplay.replayDigest !== input.replayState.replayDigest ||
    currentReplay.activeFluents.includes(
      `fan_out_vector_available(${input.application.applicationRef})`,
    ) ||
    currentReplay.activeFluents.includes(
      `fan_out_partial_stop_available(${input.application.applicationRef})`,
    ) ||
    input.store.readAll().some(
      (event) =>
        event.kind === "fan_out_completion_admitted" &&
        event.frameId === input.sourceCursor.frameId &&
        isRecord(event.payload) &&
        event.payload.applicationRef === input.application.applicationRef,
    )
  ) {
    return currentReplay.replayDigest !== input.replayState.replayDigest
      ? refusal("replay_mismatch", "fan-out completion is not based on current replay truth")
      : refusal(
          "completion_already_admitted",
          "one fan-out application can admit only one completion variant per frame",
        );
  }
  const frameCCallRefs = new Set(
    input.store.readAll()
      .filter(
        (event) =>
          event.kind === "c_call_opened" &&
          event.frameId === input.sourceCursor.frameId,
      )
      .map((event) => event.aggregateId),
  );
  const taskStates = currentReplay.cCalls.filter(
    (state) =>
      frameCCallRefs.has(state.cCallRef) &&
      state.batchRef === input.application.batchRef,
  );
  const truths = taskStates
    .map((state) =>
      taskTruth(
        input.store,
        input.sourceCursor.frameId,
        input.application.batchRef,
        state,
      ))
    .filter((value): value is TaskTruth => value !== null)
    .sort((left, right) =>
      (left.state.taskOrdinal ?? -1) - (right.state.taskOrdinal ?? -1));
  if (
    truths.length !== taskStates.length ||
    truths.some((truth, ordinal) => truth.state.taskOrdinal !== ordinal) ||
    truths.length === 0 ||
    truths.length > materialization.members.length
  ) {
    return refusal(
      "task_census_mismatch",
      "fan-out task truth is not one exact zero-based prefix of the materialized member vector",
    );
  }
  const completedRows: FanOutCompletedTaskRow[] = [];
  for (let ordinal = 0; ordinal < truths.length; ordinal += 1) {
    const truth = truths[ordinal]!;
    const member = materialization.members[ordinal]!;
    const row = completedRow(
      member,
      truth,
      materialization.outputMemberContractRef,
    );
    if (row === null) break;
    completedRows.push(row);
  }
  const common = completionBody(input, materialization);
  let variant:
    | Omit<CompleteFanOutAdmission, keyof FanOutCompletionBase>
    | Omit<PartialFanOutAdmission, keyof FanOutCompletionBase>;
  if (input.completionKind === "complete_vector") {
    if (
      truths.length !== materialization.members.length ||
      completedRows.length !== materialization.members.length
    ) {
      return refusal(
        "task_census_mismatch",
        "complete fan-out requires one admitted advancing task result at every materialized ordinal",
      );
    }
    const outputVector = deepFreeze({
      kind: "gtl_fan_out_vector" as const,
      schemaVersion: "5.0.0" as const,
      applicationRef: input.application.applicationRef,
      members: completedRows.map((row) => ({
        ordinal: row.ordinal,
        inputMemberRef: row.inputMemberRef,
        outputMemberRef: row.outputMemberRef,
        value: row.value,
      })),
    }) as Readonly<Record<string, JsonValue>>;
    if (!input.validateOutputVector(outputVector)) {
      return refusal(
        "vector_contract_mismatch",
        "canonical fan-out output vector does not satisfy the declared vector contract",
      );
    }
    const outputVectorDigest = sha256Canonical(outputVector);
    variant = {
      completionKind: "complete_vector",
      taskRows: completedRows,
      outputVectorRef:
        `graph-vector-value://abiogenesis/${outputVectorDigest.slice("sha256:".length)}`,
      outputVectorDigest,
      outputVector,
    };
  } else {
    const stoppingTruth = truths[completedRows.length];
    const stoppingMember = materialization.members[completedRows.length];
    const state = stoppingTruth?.state;
    if (
      stoppingTruth === undefined ||
      stoppingMember === undefined ||
      truths.length !== completedRows.length + 1 ||
      state?.status !== "judged" ||
      state.taskOrdinal !== stoppingMember.ordinal ||
      state.resultRef === null ||
      state.resultDigest === null ||
      state.judgmentRef === null ||
      state.judgment !== "blocked"
    ) {
      return refusal(
        "task_census_mismatch",
        "partial fan-out requires an exact advancing prefix followed by one blocked stopping task",
      );
    }
    variant = {
      completionKind: "partial_stop",
      completedRows,
      stoppingRow: {
        ordinal: stoppingMember.ordinal,
        inputMemberRef: stoppingMember.memberRef,
        inputMemberDigest: stoppingMember.memberDigest,
        cCallRef: state.cCallRef,
        foldbackRef: stoppingTruth.foldbackRef,
        foldbackEventRef: stoppingTruth.foldbackEventRef,
        resultRef: state.resultRef,
        resultDigest: state.resultDigest,
        judgmentRef: state.judgmentRef,
        disposition: "blocked",
        stoppingEventRef: stoppingTruth.judgmentEventRef,
      },
      unstartedRows: materialization.members.slice(completedRows.length + 1).map(
        (member) => ({
          ordinal: member.ordinal,
          inputMemberRef: member.memberRef,
          inputMemberDigest: member.memberDigest,
        }),
      ),
    };
  }
  const body = {
    ...common,
    ...variant,
  };
  const completionDigest = sha256Canonical(body as unknown as JsonValue);
  const completionRef =
    `fan-out-completion://abiogenesis/${completionDigest.slice("sha256:".length)}`;
  const causeRefs = truths.flatMap((truth) => [
    truth.foldbackEventRef,
    truth.judgmentEventRef,
  ]);
  const event = admitRuntimeEvent(input.store, {
    kind: "fan_out_completion_admitted",
    eventTime: input.basis.eventTime,
    aggregateType: "frame",
    aggregateId: input.sourceCursor.frameId,
    parentAggregateId: input.sourceCursor.graphCallId,
    causationEventRefs: [...new Set([
      ...causeRefs,
      ...input.basis.causationEventRefs,
    ])],
    correlationId: input.basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: input.executionBasis.basisRef,
    runId: input.sourceCursor.runId,
    graphFunctionRef: input.executionBasis.graphFunctionRef,
    materializationRef: input.graph.materializationRef,
    graphCallId: input.sourceCursor.graphCallId,
    frameId: input.sourceCursor.frameId,
    payload: {
      completionRef,
      completionDigest,
      ...body,
    } as unknown as JsonValue,
  });
  const admitted = deepFreeze({
    kind: "fan_out_completion_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    completionRef,
    completionDigest,
    ...body,
    admissionEventRef: event.eventId,
  }) as FanOutCompletionAdmission;
  admittedFanOutCompletions.add(admitted);
  return admitted;
}
