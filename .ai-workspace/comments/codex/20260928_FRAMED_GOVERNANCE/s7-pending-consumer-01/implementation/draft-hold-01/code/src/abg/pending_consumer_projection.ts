import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isRecord } from "../shared/admission_predicates.js";
import { indexedRuntimeEvents, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { projectExactInvocationAdmissionAtPrefix, projectExactExecutionBasisAtPrefix } from "./invocation_execution_truth.js";
import type { RuntimeEvent } from "./event_store.js";
import type { CCall, AdmittedCCallEvidence } from "./c_call.js";
import type { GraphFunction } from "../gtl/contracts.js";
import type { TraversalCursorCandidate } from "./traversal_cursor.js";
import { declaredConsumerPreparation } from "../gtl/consumer_preparation.js";

/** Subordinate coordinates admitted with a failed preparation Result. The
 * cursor/input are already owned facts; this contains no copied input or graph. */
export interface PendingConsumerSource {
  readonly kind: "pending_consumer_source";
  readonly schemaVersion: "5.0.0";
  readonly sourceClass: "declared_preparation" | "undispatched_preparation";
  readonly runId: string;
  readonly executionBasisRef: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly cursorRef: string;
  readonly cursorDigest: Sha256Digest;
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly resultRef: string;
  readonly resultDigest: Sha256Digest;
}

export interface PendingConsumerContinuation {
  readonly continuationKind: "pending_consumer";
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly runId: string;
  readonly source: PendingConsumerSource;
  readonly openedEventRef: string;
  readonly sourceInvocationAdmissionRef: string;
  readonly currentIntent: Readonly<{ ref: string; digest: Sha256Digest }>;
  readonly expectedBasis: Readonly<{ ref: string; digest: Sha256Digest }>;
  readonly continuationInput: Readonly<{ ref: string; digest: Sha256Digest }>;
  readonly status: "open" | "superseded";
  readonly terminalEventRef: string | null;
  readonly successorInvocationAdmissionRef: string | null;
  readonly successorRunId: string | null;
}

/** A new operation authorizes this use; the original invoke authorization
 * remains the work/effect authority on the successor invocation. */
export interface PendingConsumerReentryBasis {
  readonly kind: "pending_consumer_reentry_basis";
  readonly schemaVersion: "5.0.0";
  readonly publicAuthorityDigest: Sha256Digest;
  readonly operationAuthorityRef: string;
  readonly operationGrant: import("../product/invocation.js").CapabilityGrant;
  readonly sourceInvocationAdmissionRef: string;
  readonly sourceRunId: string;
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly source: PendingConsumerSource;
  readonly sourceEventRef: string;
  readonly request: Readonly<Record<string, JsonValue>>;
}

const same = (a: unknown, b: unknown) => sha256Canonical(a as JsonValue) === sha256Canonical(b as JsonValue);

export function pendingConsumerIdentity(source: PendingConsumerSource) {
  const continuationDigest = sha256Canonical({ continuationKind: "pending_consumer", source } as unknown as JsonValue);
  return { continuationRef: `continuation://abiogenesis/${continuationDigest.slice(7)}`, continuationDigest };
}

/** Called only after the owning Result checks. A declared pure preparation is
 * different from an arbitrary failed computation or a dispatched actor. */
export function pendingConsumerSource(graphFunction: Readonly<GraphFunction>, cursor: TraversalCursorCandidate,
  call: CCall, evidence: readonly AdmittedCCallEvidence[], resultRef: string, resultDigest: Sha256Digest): PendingConsumerSource | null {
  if (call.callClass !== "leaf" || call.retryPath.length !== 0) return null;
  const relation = declaredConsumerPreparation(graphFunction);
  const declared = relation !== null && call.regime === "F_D" &&
    relation.preparation.programLocusRef === call.programLocusRef &&
    call.inputContractRef === relation.preparation.inputCarrierRef &&
    call.outputContractRef === relation.preparation.outputCarrierRef &&
    evidence.length === 1 && evidence[0]!.evidenceClass === "deterministic";
  // F_P preparation refusal alone does not authorize a backwards transition.
  // The selected relation resumes the declared F_D preparation; no dispatched
  // actor result or arbitrary deterministic failure is eligible.
  const undispatched = false;
  if (!declared && !undispatched) return null;
  return deepFreeze({ kind: "pending_consumer_source", schemaVersion: "5.0.0",
    sourceClass: declared ? "declared_preparation" : "undispatched_preparation",
    runId: call.runId, executionBasisRef: call.basisId, graphCallId: call.graphCallId, frameId: call.frameId,
    cCallRef: call.cCallRef, cursorRef: cursor.cursorRef, cursorDigest: cursor.cursorDigest,
    inputRef: cursor.inputRef, inputDigest: cursor.inputDigest, resultRef, resultDigest });
}

/** One selected failed preparation, not the most recent timestamp. The Result
 * owner admits the source coordinate; projection cannot infer a retry from prose. */
export function projectPendingConsumerContinuations(
  prefix: ValidatedRuntimeEventPrefix,
  runId: string,
): readonly PendingConsumerContinuation[] {
  const rows: PendingConsumerContinuation[] = [];
  const sourceEvents = indexedRuntimeEvents(prefix, "kind:c_call_result_admitted").filter(event =>
    event.runId === runId && isRecord(event.payload) && event.payload.pendingConsumer !== undefined);
  for (const event of sourceEvents) {
    const p = event.payload;
    if (!isRecord(p) || !isRecord(p.pendingConsumer)) throw new TypeError("pending preparation source is malformed");
    const source = p.pendingConsumer as unknown as PendingConsumerSource;
    if (source.kind !== "pending_consumer_source" || source.schemaVersion !== "5.0.0" ||
      !["declared_preparation", "undispatched_preparation"].includes(source.sourceClass) ||
      p.resultClass !== "failure" || source.runId !== event.runId || source.executionBasisRef !== event.basisId ||
      source.graphCallId !== event.graphCallId || source.frameId !== event.frameId || source.cCallRef !== event.aggregateId ||
      source.cCallRef !== p.cCallRef || source.resultRef !== p.resultRef || source.resultDigest !== p.resultDigest) {
      throw new TypeError("pending preparation differs from its admitted failed Result");
    }
    const execution = projectExactExecutionBasisAtPrefix(prefix, source.executionBasisRef);
    const invocation = execution === null ? null : projectExactInvocationAdmissionAtPrefix(prefix, execution.invocationAdmissionRef);
    const opens = indexedRuntimeEvents(prefix, "aggregate:c_call:" + source.cCallRef).filter(e => e.kind === "c_call_opened");
    const opened = opens.length === 1 ? opens[0] : undefined;
    if (execution === null || invocation === null || opened === undefined || !isRecord(opened.payload) ||
      opened.basisId !== execution.basisRef || opened.runId !== runId || opened.graphCallId !== source.graphCallId ||
      opened.frameId !== source.frameId || opened.payload.cursorRef !== source.cursorRef || opened.payload.cursorDigest !== source.cursorDigest ||
      opened.admissionOrdinal >= event.admissionOrdinal) throw new TypeError("pending preparation lacks its exact admitted call");
    const identity = { continuationKind: "pending_consumer" as const, runId, source, openedEventRef: event.eventId,
      sourceInvocationAdmissionRef: invocation.invocationAdmissionRef };
    const { continuationDigest, continuationRef } = pendingConsumerIdentity(source);
    const consumed = indexedRuntimeEvents(prefix, "kind:invocation_admitted").filter(e => isRecord(e.payload) &&
      isRecord(e.payload.reentryBasis) && e.payload.reentryBasis.kind === "pending_consumer_reentry_basis" &&
      e.payload.reentryBasis.continuationRef === continuationRef);
    if (consumed.length > 1) throw new TypeError("pending consumer was consumed more than once");
    const successor = consumed[0], successorPayload = successor !== undefined && isRecord(successor.payload) ? successor.payload : null;
    const successorRuns = successorPayload === null ? [] : indexedRuntimeEvents(prefix, "kind:run_segment_opened").filter(e =>
      isRecord(e.payload) && e.payload.invocationAdmissionRef === successorPayload.invocationAdmissionRef);
    if (successorRuns.length > 1) throw new TypeError("pending consumer has ambiguous successor Runs");
    rows.push(deepFreeze({ ...identity, continuationRef, continuationDigest,
      currentIntent: { ref: invocation.authorityRef, digest: invocation.authorityDigest },
      expectedBasis: { ref: execution.basisRef, digest: execution.basisDigest },
      continuationInput: { ref: source.inputRef, digest: source.inputDigest },
      status: consumed.length === 0 ? "open" as const : "superseded" as const,
      terminalEventRef: successor?.eventId ?? null,
      successorInvocationAdmissionRef: successorPayload === null ? null : String(successorPayload.invocationAdmissionRef),
      successorRunId: successorRuns[0]?.runId ?? null,
    }));
  }
  return Object.freeze(rows);
}

export function exactPendingConsumerContinuation(prefix: ValidatedRuntimeEventPrefix,
  candidate: PendingConsumerContinuation): PendingConsumerContinuation | null {
  const rows = projectPendingConsumerContinuations(prefix, candidate.runId).filter(row => row.continuationRef === candidate.continuationRef);
  return rows.length === 1 && same(rows[0], candidate) ? rows[0]! : null;
}

/** The event owning the selected historical source remains in its original Run. */
export function pendingConsumerSourceEvent(prefix: ValidatedRuntimeEventPrefix,
  continuation: PendingConsumerContinuation): RuntimeEvent | null {
  const rows = indexedRuntimeEvents(prefix, "id:" + continuation.openedEventRef);
  return rows.length === 1 && rows[0]!.kind === "c_call_result_admitted" ? rows[0]! : null;
}
