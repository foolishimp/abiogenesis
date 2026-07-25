import type {
  ExecutiveReplaySnapshot,
} from "../gtl/executive.js";
import type { WorkspaceBinding } from "../product/environment.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { hasAdmittedWorkspaceBinding } from "./environment_admission.js";
import type { AbgEventStore } from "./event_store.js";
import { replay } from "./replay.js";

export function projectExecutiveReplaySnapshot(
  store: AbgEventStore,
  input: Readonly<{
    readonly workspaceBinding: WorkspaceBinding;
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly runId: string | null;
    readonly policyRefs: readonly string[];
  }>,
): Readonly<ExecutiveReplaySnapshot> {
  if (
    !hasAdmittedWorkspaceBinding(store, input.workspaceBinding) ||
    input.subjectRef.length === 0 ||
    input.policyRefs.some((policyRef) => policyRef.length === 0)
  ) {
    throw new TypeError(
      "executive replay projection requires an admitted workspace and exact subject basis",
    );
  }
  const scope = input.runId === null ? undefined : { runId: input.runId };
  const replayState = replay(store, scope);
  if (
    input.runId !== null &&
    replayState.runId !== input.runId
  ) {
    throw new TypeError(
      "executive replay projection run differs from admitted replay truth",
    );
  }
  const events = scope === undefined
    ? store.readAll()
    : store.readScope(scope);
  const body = {
    workspaceBindingId: input.workspaceBinding.bindingId,
    workspaceBindingDigest: input.workspaceBinding.bindingDigest,
    subjectRef: input.subjectRef,
    subjectDigest: input.subjectDigest,
    runId: input.runId,
    replayRef: replayState.replayRef,
    replayDigest: replayState.replayDigest,
    eventStoreDigest: replayState.eventStoreDigest,
    eventRows: events.map((event) => ({
      admissionOrdinal: event.admissionOrdinal,
      eventRef: event.eventId,
      eventKind: event.kind,
      payloadDigest: event.payloadDigest,
    })),
    haltClassification: replayState.runtimeStatus,
    evidenceRefs: replayState.cCalls.flatMap((cCall) => cCall.evidenceRefs),
    resultRefs: replayState.cCalls.flatMap((cCall) =>
      cCall.resultRef === null ? [] : [cCall.resultRef]
    ),
    routeRefs: replayState.routes.map((route) => route.routeRef),
    continuationRefs: replayState.continuations.map(
      (continuation) => continuation.continuationRef,
    ),
    policyRefs: [...input.policyRefs],
  };
  const snapshotDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "executive_replay_snapshot" as const,
    schemaVersion: "5.0.0" as const,
    snapshotRef:
      `replay-snapshot://abg/${snapshotDigest.slice("sha256:".length)}`,
    snapshotDigest,
    ...body,
  });
}
