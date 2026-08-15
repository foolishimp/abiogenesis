import type {
  FanOutApplication,
  GtlGraph,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
} from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import {
  hasAdmittedExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import {
  selectValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  projectExactFanOutCompletion,
  type FanOutCompletionCandidateProjection,
} from "./fan_out_projection.js";
import {
  replayValidatedRuntimeEventPrefix,
  type ReplayState,
} from "./replay.js";
import {
  hasAdmittedTraversalCursorAtPrefix,
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

export interface FanOutCompletionReceipt {
  readonly kind: "fan_out_completion_receipt";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly admission: FanOutCompletionAdmission;
  readonly successorPrefix: DurablePrefixCoordinate;
}

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
  | FanOutCompletionReceipt
  | FanOutCompletionRefusal;

export interface AdmitFanOutCompletionInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
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

class FanOutCompletionProjectionError extends TypeError {}

export function admitFanOutCompletion(
  input: AdmitFanOutCompletionInput,
): FanOutCompletionResult {
  try {
    assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  } catch {
    return refusal(
      "replay_mismatch",
      "fan-out completion requires its exact durable predecessor",
    );
  }
  const predecessorEvents = readRuntimeEventsAtDurablePrefix(
    input.predecessorPrefix,
  );
  const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
  if (
    !hasAdmittedExecutionBasisAtPrefix(
      authorityPrefix,
      input.executionBasis,
    ) ||
    !isMaterializedGtlGraph(input.graph) ||
    input.executionBasis.graphRef !== input.graph.materializationRef ||
    input.graph.template.applications.find(
      (candidate) => candidate.applicationRef === input.application.applicationRef,
    ) !== input.application ||
    input.application.relationKind !== "fan_out" ||
    input.application.applicationRef !== graphFunctionApplicationRef(input.application) ||
    !hasAdmittedTraversalCursorAtPrefix(
      authorityPrefix,
      input.sourceCursor,
    ) ||
    input.sourceCursor.executionBasisRef !== input.executionBasis.basisRef ||
    input.sourceCursor.frameId.length === 0
  ) {
    return refusal(
      "application_mismatch",
      "fan-out completion requires the exact admitted application, materialization, basis, and source cursor",
    );
  }
  const authority = {
    graph: input.graph,
    application: input.application,
    basisId: input.executionBasis.basisRef,
    runId: input.sourceCursor.runId,
    graphCallId: input.sourceCursor.graphCallId,
    frameId: input.sourceCursor.frameId,
  };
  const expectedPrefixDigest = input.predecessorPrefix.prefixDigest;
  try {
    const committed = admitRuntimeEventTransactionAtExpectedPrefix(
      input.store,
      expectedPrefixDigest,
      () => {
        const snapshot = input.store.readAll();
        const prefix = selectValidatedRuntimeEventPrefix(snapshot);
        const currentReplay = replayValidatedRuntimeEventPrefix(
          selectValidatedRuntimeEventPrefix(snapshot, {
          runId: input.sourceCursor.runId,
          }),
          selectValidatedRuntimeEventPrefix(snapshot),
        );
        if (currentReplay.replayDigest !== input.replayState.replayDigest) {
          return refusal(
            "replay_mismatch",
            "fan-out completion is not based on current replay truth",
          );
        }
        if (
          currentReplay.activeFluents.includes(
            `fan_out_vector_available(${input.application.applicationRef})`,
          ) ||
          currentReplay.activeFluents.includes(
            `fan_out_partial_stop_available(${input.application.applicationRef})`,
          ) ||
          snapshot.some(
            (event) =>
              event.kind === "fan_out_completion_admitted" &&
              event.frameId === input.sourceCursor.frameId &&
              isRecord(event.payload) &&
              event.payload.applicationRef === input.application.applicationRef,
          )
        ) {
          return refusal(
            "completion_already_admitted",
            "one fan-out application can admit only one completion variant per frame",
          );
        }
        const candidate = projectExactFanOutCompletion(prefix, {
          mode: "candidate",
          expectedPrefixDigest,
          authority,
          completionKind: input.completionKind,
          validateOutputVector: input.validateOutputVector,
        });
        if (
          candidate === null ||
          candidate.kind !== "fan_out_completion_candidate_projection"
        ) {
          return refusal(
            "task_census_mismatch",
            "fan-out completion requires one exact graph-bound task census and output partition",
          );
        }
        const event = admitProjectedFanOutCompletion(input, candidate);
        const postPrefix = selectValidatedRuntimeEventPrefix(
          input.store.readAll(),
        );
        const projected = projectExactFanOutCompletion(postPrefix, {
          mode: "graph_bound",
          admissionEventRef: event.eventId,
          authority,
        });
        if (
          projected === null ||
          projected.kind !== "fan_out_completion_admission" ||
          projected.completionRef !== candidate.completionRef ||
          projected.completionDigest !== candidate.completionDigest
        ) {
          throw new FanOutCompletionProjectionError(
            "admitted fan-out completion did not reproject under its exact graph authority",
          );
        }
        return projected;
      },
    );
    if (committed.value.kind !== "fan_out_completion_admission") {
      return committed.value;
    }
    if (committed.successorPrefix === null) {
      return refusal(
        "replay_mismatch",
        "fan-out completion produced no durable successor",
      );
    }
    return Object.freeze({
      kind: "fan_out_completion_receipt" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      admission: committed.value,
      successorPrefix: committed.successorPrefix,
    });
  } catch (error) {
    if (
      error instanceof FanOutCompletionProjectionError ||
      (error instanceof TypeError && error.message ===
        "runtime event append requires the exact expected immutable prefix")
    ) {
      return refusal(
        "replay_mismatch",
        "fan-out completion authority changed or failed exact post-append reprojection",
      );
    }
    throw error;
  }
}

function admitProjectedFanOutCompletion(
  input: AdmitFanOutCompletionInput,
  projection: FanOutCompletionCandidateProjection,
) {
  return admitRuntimeEvent(input.store, {
    kind: "fan_out_completion_admitted",
    eventTime: input.basis.eventTime,
    aggregateType: "frame",
    aggregateId: input.sourceCursor.frameId,
    parentAggregateId: input.sourceCursor.graphCallId,
    causationEventRefs: [...new Set([
      ...projection.requiredCausationEventRefs,
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
      completionRef: projection.completionRef,
      completionDigest: projection.completionDigest,
      ...projection.completionBody,
    } as unknown as JsonValue,
  });
}
