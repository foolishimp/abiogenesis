import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
} from "./event_store.js";
import { projectExactExecutionBasisAtPrefix } from
  "./invocation_execution_truth.js";
import {
  projectRunQuiescence,
  projectRunSemanticReplayProjection,
  replayValidatedRuntimeEventPrefix,
  type ReplayCCallState,
  type ReplayRouteState,
  type ReplayState,
  type RunSemanticReplayProjection,
} from "./replay.js";

export const ABG_PROJECT_READ_MEMBER_KEYS = Object.freeze([
  "run_status",
  "graph_call_status",
  "run_result",
  "graph_call_result",
  "run_evidence",
  "graph_call_evidence",
  "result_evidence",
  "assessment_evidence",
  "witness_evidence",
  "workspace_replay",
  "run_replay",
  "graph_call_replay",
  "interaction_replay",
  "continuation_replay",
  "c_call_replay",
  "workspace_gaps",
  "run_gaps",
  "run_lawful_actions",
] as const);

export type AbgProjectReadMemberKey =
  (typeof ABG_PROJECT_READ_MEMBER_KEYS)[number];

/**
 * The durable coordinate is the JSON carrier. The owner validates its bytes
 * and constructs the nominal immutable prefix before any projection runs.
 */
export interface AbgProjectReadPacket<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: K;
  readonly prefix: DurablePrefixCoordinate;
  readonly targetRef: string;
}

export type ProjectReadRefusalCode =
  | "invalid_history"
  | "invalid_packet"
  | "target_absent";

export interface AbgProjectReadRefusal<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly memberKey: K;
  readonly targetRef: string | null;
  readonly code: ProjectReadRefusalCode;
  readonly message: string;
}

export interface AbgProjectReadProjection<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> {
  readonly kind: "abg_project_read_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "projected";
  readonly memberKey: K;
  readonly targetRef: string;
  readonly prefixCoordinateDigest: Sha256Digest;
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly value: JsonValue;
}

export type AbgProjectReadResult<
  K extends AbgProjectReadMemberKey = AbgProjectReadMemberKey,
> = AbgProjectReadProjection<K> | AbgProjectReadRefusal<K>;

interface PreparedRead<K extends AbgProjectReadMemberKey> {
  readonly packet: AbgProjectReadPacket<K>;
  readonly events: readonly RuntimeEvent[];
  readonly fullPrefix: ValidatedRuntimeEventPrefix;
  readonly fullCalculus: RuntimeEventCalculusProjection;
}

interface RunReadContext {
  readonly prefix: ValidatedRuntimeEventPrefix;
  readonly calculus: RuntimeEventCalculusProjection;
  readonly replay: ReplayState;
  readonly semanticReplay: RunSemanticReplayProjection;
}

export interface AbgRunTruthCoordinate {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

/**
 * Canonical typed ABG truth for one Run. Product owners consume this carrier;
 * it contains no Product result/nonterminal/refusal meaning.
 */
export interface AbgRunTruthProjection {
  readonly kind: "abg_run_truth_projection";
  readonly schemaVersion: "5.0.0";
  readonly prefixCoordinateDigest: Sha256Digest;
  readonly runtimeStatus: ReplayState["runtimeStatus"];
  readonly run: AbgRunTruthCoordinate;
  readonly workspaceBinding: AbgRunTruthCoordinate;
  readonly graphCall: AbgRunTruthCoordinate | null;
  readonly result: AbgRunTruthCoordinate | null;
  readonly stop: AbgRunTruthCoordinate | null;
  readonly gap: AbgRunTruthCoordinate | null;
  readonly interaction: AbgRunTruthCoordinate | null;
  readonly evidence: readonly AbgRunTruthCoordinate[];
  readonly replay: AbgRunTruthCoordinate;
}

export interface AbgRunTruthRefusal {
  readonly kind: "abg_run_truth_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: ProjectReadRefusalCode;
  readonly targetRef: string;
  readonly message: string;
}

export type AbgRunTruthResult = AbgRunTruthProjection | AbgRunTruthRefusal;

interface CanonicalRunReadContext extends RunReadContext {
  readonly truth: AbgRunTruthProjection;
  readonly terminal: ReturnType<typeof terminalResult>;
}

interface GraphCallReadContext extends RunReadContext {
  readonly graphCallId: string;
  readonly eventAtoms: RunSemanticReplayProjection["eventAtoms"];
  readonly cCalls: readonly ReplayCCallState[];
  readonly routes: readonly ReplayRouteState[];
}

const ABSENT = Symbol("abg_project_read_target_absent");
type ProjectedValue = JsonValue | typeof ABSENT;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactDataFields(value: object, fields: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value);
  if (actual.some((key) => typeof key !== "string")) return false;
  const actualStrings = (actual as string[]).sort();
  const expected = [...fields].sort();
  if (
    actualStrings.length !== expected.length ||
    actualStrings.some((field, index) => field !== expected[index])
  ) return false;
  return actualStrings.every((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    return descriptor !== undefined &&
      Object.hasOwn(descriptor, "value") &&
      !Object.hasOwn(descriptor, "get") &&
      !Object.hasOwn(descriptor, "set") &&
      descriptor.enumerable === true;
  });
}

function refusal<K extends AbgProjectReadMemberKey>(
  memberKey: K,
  targetRef: string | null,
  code: ProjectReadRefusalCode,
  message: string,
): AbgProjectReadRefusal<K> {
  return deepFreeze({
    kind: "abg_project_read_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    memberKey,
    targetRef,
    code,
    message,
  });
}

function prepareRead<K extends AbgProjectReadMemberKey>(
  expectedMemberKey: K,
  supplied: AbgProjectReadPacket<K>,
): PreparedRead<K> | AbgProjectReadRefusal<K> {
  let admitted: JsonValue;
  try {
    admitted = admitIJsonValue(supplied, "ABG project read packet");
  } catch {
    return refusal(
      expectedMemberKey,
      null,
      "invalid_packet",
      "ABG project read requires one exact I-JSON packet",
    );
  }
  if (
    !isRecord(admitted) ||
    !hasExactDataFields(admitted, [
      "kind",
      "memberKey",
      "prefix",
      "schemaVersion",
      "targetRef",
    ]) ||
    admitted.kind !== "abg_project_read_packet" ||
    admitted.schemaVersion !== "5.0.0" ||
    admitted.memberKey !== expectedMemberKey ||
    typeof admitted.targetRef !== "string" ||
    admitted.targetRef.length === 0 ||
    admitted.targetRef.trim() !== admitted.targetRef ||
    !isRecord(admitted.prefix)
  ) {
    return refusal(
      expectedMemberKey,
      null,
      "invalid_packet",
      "ABG project read packet differs from its exact owner contract",
    );
  }

  const packet = admitted as unknown as AbgProjectReadPacket<K>;
  try {
    const events = readRuntimeEventsAtDurablePrefix(packet.prefix);
    const fullPrefix = selectValidatedRuntimeEventPrefix(events);
    return deepFreeze({
      packet,
      events,
      fullPrefix,
      fullCalculus: deriveRuntimeEventCalculusProjection(fullPrefix),
    });
  } catch {
    return refusal(
      expectedMemberKey,
      packet.targetRef,
      "invalid_history",
      "ABG project read requires one valid immutable durable event prefix",
    );
  }
}

function runIds(prepared: PreparedRead<AbgProjectReadMemberKey>): readonly string[] {
  return Object.freeze([
    ...new Set(
      runtimeEventsFromValidatedPrefix(prepared.fullPrefix).flatMap((event) =>
        event.runId === undefined ? [] : [event.runId]
      ),
    ),
  ].sort());
}

function runContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  runId: string,
): RunReadContext | null {
  const prefix = selectValidatedRuntimeEventPrefix(prepared.events, { runId });
  const replay = replayValidatedRuntimeEventPrefix(prefix, prepared.fullPrefix);
  if (replay.runId !== runId) return null;
  return deepFreeze({
    prefix,
    calculus: deriveRuntimeEventCalculusProjection(prefix),
    replay,
    semanticReplay: projectRunSemanticReplayProjection(
      prepared.fullPrefix,
      runId,
    ),
  });
}

function runIdForGraphCall(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  graphCallId: string,
): string | null {
  const candidates = new Set(
    runtimeEventsFromValidatedPrefix(prepared.fullPrefix).flatMap((event) =>
      event.graphCallId === graphCallId && event.runId !== undefined
        ? [event.runId]
        : []
    ),
  );
  return candidates.size === 1 ? [...candidates][0]! : null;
}

function graphCallContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  graphCallId: string,
): GraphCallReadContext | null {
  const runId = runIdForGraphCall(prepared, graphCallId);
  if (runId === null) return null;
  const context = canonicalRunContext(prepared, runId);
  if (context === null) return null;
  const eventAtoms = context.semanticReplay.eventAtoms.filter((event) =>
    event.graphCallId === graphCallId
  );
  if (!eventAtoms.some((event) =>
    event.eventKind === "graph_call_opened" && event.aggregateId === graphCallId
  )) return null;
  const cCallRefs = new Set(
    eventAtoms.flatMap((event) =>
      event.aggregateType === "c_call" ? [event.aggregateId] : []
    ),
  );
  return deepFreeze({
    ...context,
    graphCallId,
    eventAtoms: Object.freeze(eventAtoms),
    cCalls: Object.freeze(
      context.replay.cCalls.filter((row) => cCallRefs.has(row.cCallRef)),
    ),
    routes: Object.freeze(
      context.replay.routes.filter((row) =>
        row.cCallRef !== null && cCallRefs.has(row.cCallRef)
      ),
    ),
  });
}

function terminalResult(
  routes: readonly ReplayRouteState[],
  cCalls: readonly ReplayCCallState[],
): Readonly<{ readonly route: ReplayRouteState; readonly result: ReplayCCallState }> | null {
  const terminalRoutes = routes.filter((route) => route.routeKind === "terminal");
  if (terminalRoutes.length !== 1 || terminalRoutes[0]!.cCallRef === null) return null;
  const results = cCalls.filter((row) =>
    row.cCallRef === terminalRoutes[0]!.cCallRef &&
    row.resultRef !== null &&
    row.resultDigest !== null &&
    row.resultValue !== null
  );
  return results.length === 1
    ? deepFreeze({ route: terminalRoutes[0]!, result: results[0]! })
    : null;
}

function truthCoordinate(
  ref: string,
  digest: Sha256Digest,
): AbgRunTruthCoordinate {
  return deepFreeze({ ref, digest });
}

function physicalEventCoordinate(
  context: RunReadContext,
  eventId: string | null,
): AbgRunTruthCoordinate | null {
  if (eventId === null) return null;
  const physical = context.semanticReplay.physicalCoordinates.events.find(
    (event) => event.eventId === eventId,
  );
  return physical === undefined
    ? null
    : truthCoordinate(physical.eventId, physical.payloadDigest);
}

function canonicalRunContext(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): CanonicalRunReadContext | null {
  const context = runContext(prepared, targetRef);
  if (context === null) return null;
  const runAtoms = context.semanticReplay.eventAtoms.filter((atom) =>
    atom.eventKind === "run_segment_opened" &&
    atom.aggregateType === "run" && atom.aggregateId === targetRef
  );
  if (runAtoms.length !== 1) return null;
  const runAtom = runAtoms[0]!;
  const executionBasis = runAtom.basisId === null
    ? null
    : projectExactExecutionBasisAtPrefix(
        prepared.fullPrefix,
        runAtom.basisId,
      );
  if (
    executionBasis === null || executionBasis.basisClass !== "root" ||
    runAtom.parentAggregateId !== executionBasis.workspaceBindingId
  ) return null;
  const graphCallAtoms = context.replay.graphCallId === null
    ? []
    : context.semanticReplay.eventAtoms.filter((atom) =>
        atom.eventKind === "graph_call_opened" &&
        atom.aggregateType === "graph_call" &&
        atom.aggregateId === context.replay.graphCallId
      );
  if (context.replay.graphCallId !== null && graphCallAtoms.length !== 1) {
    return null;
  }
  const terminal = terminalResult(context.replay.routes, context.replay.cCalls);
  const gapRoute = [...context.replay.routes].reverse().find((route) =>
    route.routeKind === "gap_stop" &&
    route.nextActionProjectionRef !== undefined &&
    route.nextActionProjectionDigest !== undefined
  );
  const continuation = [...context.replay.continuations].reverse().find((row) =>
    row.status === "open" || row.status === "responded"
  );
  const evidence = context.semanticReplay.physicalCoordinates.events.map((event) =>
    truthCoordinate(event.eventId, event.payloadDigest)
  );
  if (evidence.length === 0) return null;
  const truth = deepFreeze({
    kind: "abg_run_truth_projection" as const,
    schemaVersion: "5.0.0" as const,
    prefixCoordinateDigest: prepared.packet.prefix.coordinateDigest,
    runtimeStatus: context.replay.runtimeStatus,
    run: truthCoordinate(targetRef, runAtoms[0]!.semanticPayloadDigest),
    workspaceBinding: truthCoordinate(
      executionBasis.workspaceBindingId,
      executionBasis.workspaceBindingDigest,
    ),
    graphCall: context.replay.graphCallId === null
      ? null
      : truthCoordinate(
          context.replay.graphCallId,
          graphCallAtoms[0]!.semanticPayloadDigest,
        ),
    result: terminal === null || terminal.result.resultRef === null ||
        terminal.result.resultDigest === null
      ? null
      : truthCoordinate(
          terminal.result.resultRef,
          terminal.result.resultDigest,
        ),
    stop: physicalEventCoordinate(
      context,
      context.replay.runStoppedEventRef ??
        context.replay.runtimeFailureEventRef,
    ),
    gap: gapRoute?.nextActionProjectionRef === undefined ||
        gapRoute.nextActionProjectionDigest === undefined
      ? null
      : truthCoordinate(
          gapRoute.nextActionProjectionRef,
          gapRoute.nextActionProjectionDigest,
        ),
    interaction: continuation === undefined
      ? null
      : truthCoordinate(continuation.requestRef, continuation.requestDigest),
    evidence,
    replay: truthCoordinate(
      context.replay.replayRef,
      context.replay.replayDigest,
    ),
  });
  return deepFreeze({ ...context, truth, terminal });
}

/**
 * Direct owner entry to the same canonical Run atom used by run project-read
 * members. The durable packet is admitted by the existing read path first.
 */
export function projectRunTruthAtDurablePrefix(
  prefix: DurablePrefixCoordinate,
  runId: string,
): AbgRunTruthResult {
  const prepared = prepareRead("run_replay", {
    kind: "abg_project_read_packet",
    schemaVersion: "5.0.0",
    memberKey: "run_replay",
    prefix,
    targetRef: runId,
  });
  if ("code" in prepared) {
    return deepFreeze({
      kind: "abg_run_truth_refusal" as const,
      schemaVersion: "5.0.0" as const,
      code: prepared.code,
      targetRef: runId,
      message: prepared.message,
    });
  }
  const context = canonicalRunContext(
    prepared as PreparedRead<AbgProjectReadMemberKey>,
    runId,
  );
  return context === null
    ? deepFreeze({
        kind: "abg_run_truth_refusal" as const,
        schemaVersion: "5.0.0" as const,
        code: "target_absent" as const,
        targetRef: runId,
        message: "ABG Run truth is absent from the selected admitted history",
      })
    : context.truth;
}

function projectRunStatus(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  if (context === null) return ABSENT;
  return {
    runId: targetRef,
    runtimeStatus: context.truth.runtimeStatus,
    replayRef: context.truth.replay.ref,
    replayDigest: context.truth.replay.digest,
    quiescence: projectRunQuiescence(context.prefix),
    holdsAt: context.calculus.holds,
  } as unknown as JsonValue;
}

function projectGraphCallStatus(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  if (context === null) return ABSENT;
  const closed = context.eventAtoms.some((event) =>
    event.eventKind === "graph_call_closed" && event.aggregateId === targetRef
  );
  const active = holdsAt(
    context.calculus,
    constructRuntimeFluent({ name: "graph_call_active", identity: targetRef }),
  );
  return {
    graphCallId: targetRef,
    runId: context.replay.runId,
    status: closed
      ? "closed"
      : active
        ? "active"
        : context.replay.runtimeStatus,
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
    eventAtoms: context.eventAtoms,
  } as unknown as JsonValue;
}

function projectRunResult(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  if (context === null) return ABSENT;
  return context.terminal === null
    ? ABSENT
    : {
        runId: targetRef,
        runtimeStatus: context.truth.runtimeStatus,
        terminalRoute: context.terminal.route,
        admittedResult: context.terminal.result,
        replayRef: context.truth.replay.ref,
        replayDigest: context.truth.replay.digest,
      } as unknown as JsonValue;
}

function projectGraphCallResult(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  if (context === null) return ABSENT;
  const terminal = terminalResult(context.routes, context.cCalls);
  return terminal === null
    ? ABSENT
    : {
        graphCallId: targetRef,
        runId: context.replay.runId,
        terminalRoute: terminal.route,
        admittedResult: terminal.result,
        replayRef: context.replay.replayRef,
        replayDigest: context.replay.replayDigest,
      } as unknown as JsonValue;
}

function evidenceProjection(
  context: RunReadContext,
  cCalls: readonly ReplayCCallState[],
): JsonValue {
  const cCallRefs = new Set(cCalls.map((row) => row.cCallRef));
  const evidenceRefs = [...new Set(cCalls.flatMap((row) => row.evidenceRefs))].sort();
  const eventAtoms = context.semanticReplay.eventAtoms.filter((event) =>
    event.aggregateType === "c_call" &&
    cCallRefs.has(event.aggregateId) &&
    ["c_call_evidenced", "c_call_judged", "c_call_result_admitted"].includes(
      event.eventKind,
    )
  );
  return {
    runId: context.replay.runId,
    evidenceRefs,
    cCalls,
    eventAtoms,
    physicalCoordinates: context.semanticReplay.physicalCoordinates,
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
  } as unknown as JsonValue;
}

function projectRunEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : evidenceProjection(context, context.replay.cCalls);
}

function projectGraphCallEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : evidenceProjection(context, context.cCalls);
}

function projectResultEvidence(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    const cCalls = context.replay.cCalls.filter((row) => row.resultRef === targetRef);
    return cCalls.length === 0 ? [] : [{ context, cCalls }];
  });
  return matches.length === 1
    ? evidenceProjection(matches[0]!.context, matches[0]!.cCalls)
    : ABSENT;
}

function projectWorkspaceReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const workspaceEvents = runtimeEventsFromValidatedPrefix(prepared.fullPrefix).filter(
    (event) => event.scopeClass === "workspace" && event.aggregateId === targetRef,
  );
  if (workspaceEvents.length === 0) return ABSENT;
  const replays = runIds(prepared).map((runId) =>
    projectRunSemanticReplayProjection(prepared.fullPrefix, runId)
  );
  return {
    workspaceRef: targetRef,
    eventContractProjection: prepared.fullCalculus,
    workspaceEventRefs: workspaceEvents.map((event) => event.eventId),
    runReplays: replays,
  } as unknown as JsonValue;
}

function projectRunReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const semanticReplay = canonicalRunContext(prepared, targetRef)?.semanticReplay;
  return semanticReplay === undefined
    ? ABSENT
    : semanticReplay as unknown as JsonValue;
}

function projectGraphCallReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = graphCallContext(prepared, targetRef);
  if (context === null) return ABSENT;
  const atomRefs = new Set(context.eventAtoms.map((event) => event.atomRef));
  return {
    graphCallId: targetRef,
    runId: context.replay.runId,
    runtimeStatus: context.replay.runtimeStatus,
    eventAtoms: context.eventAtoms,
    relations: context.semanticReplay.relations.filter((edge) =>
      atomRefs.has(edge.sourceAtom) && atomRefs.has(edge.targetAtom)
    ),
    cCalls: context.cCalls,
    routes: context.routes,
    continuations: context.replay.continuations.filter((row) =>
      row.graphCallId === targetRef
    ),
    replayRef: context.replay.replayRef,
    replayDigest: context.replay.replayDigest,
  } as unknown as JsonValue;
}

function projectInteractionReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.continuations
      .filter((row) => row.requestRef === targetRef)
      .map((continuation) => ({ context, continuation }));
  });
  return matches.length === 1
    ? {
        interactionRef: targetRef,
        continuation: matches[0]!.continuation,
        replayRef: matches[0]!.context.replay.replayRef,
        replayDigest: matches[0]!.context.replay.replayDigest,
      } as unknown as JsonValue
    : ABSENT;
}

function projectContinuationReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.continuations
      .filter((row) => row.continuationRef === targetRef)
      .map((continuation) => ({ context, continuation }));
  });
  return matches.length === 1
    ? {
        continuationRef: targetRef,
        continuation: matches[0]!.continuation,
        replayRef: matches[0]!.context.replay.replayRef,
        replayDigest: matches[0]!.context.replay.replayDigest,
      } as unknown as JsonValue
    : ABSENT;
}

function projectCCallReplay(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const matches = runIds(prepared).flatMap((runId) => {
    const context = canonicalRunContext(prepared, runId);
    if (context === null) return [];
    return context.replay.cCalls
      .filter((row) => row.cCallRef === targetRef)
      .map((cCall) => ({ context, cCall }));
  });
  if (matches.length !== 1) return ABSENT;
  return {
    cCallRef: targetRef,
    cCall: matches[0]!.cCall,
    eventAtoms: matches[0]!.context.semanticReplay.eventAtoms.filter((event) =>
      event.aggregateType === "c_call" && event.aggregateId === targetRef
    ),
    replayRef: matches[0]!.context.replay.replayRef,
    replayDigest: matches[0]!.context.replay.replayDigest,
  } as unknown as JsonValue;
}

function gapRows(context: RunReadContext): readonly ReplayRouteState[] {
  return Object.freeze(context.replay.routes.filter((route) =>
    route.routeKind === "gap_stop" &&
    route.nextActionProjection?.disposition === "no_action"
  ));
}

function projectWorkspaceGaps(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const workspaceEvents = runtimeEventsFromValidatedPrefix(prepared.fullPrefix).filter(
    (event) => event.scopeClass === "workspace" && event.aggregateId === targetRef,
  );
  if (workspaceEvents.length === 0) return ABSENT;
  return {
    workspaceRef: targetRef,
    runs: runIds(prepared).flatMap((runId) => {
      const context = canonicalRunContext(prepared, runId);
      return context === null ? [] : [{ runId, gaps: gapRows(context) }];
    }),
  } as unknown as JsonValue;
}

function projectRunGaps(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  return context === null
    ? ABSENT
    : { runId: targetRef, gaps: gapRows(context) } as unknown as JsonValue;
}

function projectRunLawfulActions(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  targetRef: string,
): ProjectedValue {
  const context = canonicalRunContext(prepared, targetRef);
  if (context === null) return ABSENT;
  return {
    runId: targetRef,
    lawfulActions: context.replay.routes.flatMap((route) =>
      route.nextActionProjection?.disposition === "selected"
        ? [{
            routeRef: route.routeRef,
            projectionRef: route.nextActionProjectionRef!,
            projectionDigest: route.nextActionProjectionDigest!,
            action: route.nextActionProjection,
          }]
        : []
    ),
  } as unknown as JsonValue;
}

function projectValue(
  prepared: PreparedRead<AbgProjectReadMemberKey>,
  memberKey: AbgProjectReadMemberKey,
  targetRef: string,
): ProjectedValue {
  switch (memberKey) {
    case "run_status":
      return projectRunStatus(prepared, targetRef);
    case "graph_call_status":
      return projectGraphCallStatus(prepared, targetRef);
    case "run_result":
      return projectRunResult(prepared, targetRef);
    case "graph_call_result":
      return projectGraphCallResult(prepared, targetRef);
    case "run_evidence":
      return projectRunEvidence(prepared, targetRef);
    case "graph_call_evidence":
      return projectGraphCallEvidence(prepared, targetRef);
    case "result_evidence":
      return projectResultEvidence(prepared, targetRef);
    case "assessment_evidence":
    case "witness_evidence":
      // D11/D12 have no admitted owner event in the frozen Wave 2 basis.
      return ABSENT;
    case "workspace_replay":
      return projectWorkspaceReplay(prepared, targetRef);
    case "run_replay":
      return projectRunReplay(prepared, targetRef);
    case "graph_call_replay":
      return projectGraphCallReplay(prepared, targetRef);
    case "interaction_replay":
      return projectInteractionReplay(prepared, targetRef);
    case "continuation_replay":
      return projectContinuationReplay(prepared, targetRef);
    case "c_call_replay":
      return projectCCallReplay(prepared, targetRef);
    case "workspace_gaps":
      return projectWorkspaceGaps(prepared, targetRef);
    case "run_gaps":
      return projectRunGaps(prepared, targetRef);
    case "run_lawful_actions":
      return projectRunLawfulActions(prepared, targetRef);
  }
}

function project<K extends AbgProjectReadMemberKey>(
  expectedMemberKey: K,
  packet: AbgProjectReadPacket<K>,
): AbgProjectReadResult<K> {
  const prepared = prepareRead(expectedMemberKey, packet);
  if ("code" in prepared) return prepared;
  let projected: ProjectedValue;
  try {
    projected = projectValue(
      prepared as PreparedRead<AbgProjectReadMemberKey>,
      expectedMemberKey,
      prepared.packet.targetRef,
    );
  } catch {
    return refusal(
      expectedMemberKey,
      prepared.packet.targetRef,
      "invalid_history",
      "ABG project read owner projectors refused the durable event history",
    );
  }
  if (projected === ABSENT) {
    return refusal(
      expectedMemberKey,
      prepared.packet.targetRef,
      "target_absent",
      "ABG project read target is absent from the selected admitted history",
    );
  }
  const value = admitIJsonValue(projected, "ABG project read projection");
  const body = {
    memberKey: expectedMemberKey,
    targetRef: prepared.packet.targetRef,
    prefixCoordinateDigest: prepared.packet.prefix.coordinateDigest,
    value,
  };
  const projectionDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "abg_project_read_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    ...body,
    projectionRef:
      `project-read://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  });
}

export const RunProjectionPort = Object.freeze({
  run_status: (packet: AbgProjectReadPacket<"run_status">) =>
    project("run_status", packet),
  run_result: (packet: AbgProjectReadPacket<"run_result">) =>
    project("run_result", packet),
  run_evidence: (packet: AbgProjectReadPacket<"run_evidence">) =>
    project("run_evidence", packet),
  run_replay: (packet: AbgProjectReadPacket<"run_replay">) =>
    project("run_replay", packet),
  run_gaps: (packet: AbgProjectReadPacket<"run_gaps">) =>
    project("run_gaps", packet),
  run_lawful_actions: (
    packet: AbgProjectReadPacket<"run_lawful_actions">,
  ) => project("run_lawful_actions", packet),
});

export const GraphCallProjectionPort = Object.freeze({
  graph_call_status: (packet: AbgProjectReadPacket<"graph_call_status">) =>
    project("graph_call_status", packet),
  graph_call_result: (packet: AbgProjectReadPacket<"graph_call_result">) =>
    project("graph_call_result", packet),
  graph_call_evidence: (
    packet: AbgProjectReadPacket<"graph_call_evidence">,
  ) => project("graph_call_evidence", packet),
  graph_call_replay: (packet: AbgProjectReadPacket<"graph_call_replay">) =>
    project("graph_call_replay", packet),
});

export const ResultProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"result_evidence">) =>
    project("result_evidence", packet),
});

export const AssessmentProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"assessment_evidence">) =>
    project("assessment_evidence", packet),
});

export const WitnessProjectionPort = Object.freeze({
  evidence: (packet: AbgProjectReadPacket<"witness_evidence">) =>
    project("witness_evidence", packet),
});

export const WorkspaceProjectionPort = Object.freeze({
  workspace_replay: (packet: AbgProjectReadPacket<"workspace_replay">) =>
    project("workspace_replay", packet),
  workspace_gaps: (packet: AbgProjectReadPacket<"workspace_gaps">) =>
    project("workspace_gaps", packet),
});

export const InteractionProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"interaction_replay">) =>
    project("interaction_replay", packet),
});

export const ContinuationProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"continuation_replay">) =>
    project("continuation_replay", packet),
});

export const CCallProjectionPort = Object.freeze({
  replay: (packet: AbgProjectReadPacket<"c_call_replay">) =>
    project("c_call_replay", packet),
});

export const ABG_PROJECT_READ_OWNER_PORTS = Object.freeze({
  run_status: Object.freeze({ project: RunProjectionPort.run_status }),
  graph_call_status: Object.freeze({
    project: GraphCallProjectionPort.graph_call_status,
  }),
  run_result: Object.freeze({ project: RunProjectionPort.run_result }),
  graph_call_result: Object.freeze({
    project: GraphCallProjectionPort.graph_call_result,
  }),
  run_evidence: Object.freeze({ project: RunProjectionPort.run_evidence }),
  graph_call_evidence: Object.freeze({
    project: GraphCallProjectionPort.graph_call_evidence,
  }),
  result_evidence: Object.freeze({ project: ResultProjectionPort.evidence }),
  assessment_evidence: Object.freeze({
    project: AssessmentProjectionPort.evidence,
  }),
  witness_evidence: Object.freeze({ project: WitnessProjectionPort.evidence }),
  workspace_replay: Object.freeze({
    project: WorkspaceProjectionPort.workspace_replay,
  }),
  run_replay: Object.freeze({ project: RunProjectionPort.run_replay }),
  graph_call_replay: Object.freeze({
    project: GraphCallProjectionPort.graph_call_replay,
  }),
  interaction_replay: Object.freeze({
    project: InteractionProjectionPort.replay,
  }),
  continuation_replay: Object.freeze({
    project: ContinuationProjectionPort.replay,
  }),
  c_call_replay: Object.freeze({ project: CCallProjectionPort.replay }),
  workspace_gaps: Object.freeze({
    project: WorkspaceProjectionPort.workspace_gaps,
  }),
  run_gaps: Object.freeze({ project: RunProjectionPort.run_gaps }),
  run_lawful_actions: Object.freeze({
    project: RunProjectionPort.run_lawful_actions,
  }),
});

export const ABG_PROJECT_READ_CONTRACTS = Object.freeze({
  run_status: RunProjectionPort.run_status,
  graph_call_status: GraphCallProjectionPort.graph_call_status,
  run_result: RunProjectionPort.run_result,
  graph_call_result: GraphCallProjectionPort.graph_call_result,
  run_evidence: RunProjectionPort.run_evidence,
  graph_call_evidence: GraphCallProjectionPort.graph_call_evidence,
  result_evidence: ResultProjectionPort.evidence,
  assessment_evidence: AssessmentProjectionPort.evidence,
  witness_evidence: WitnessProjectionPort.evidence,
  workspace_replay: WorkspaceProjectionPort.workspace_replay,
  run_replay: RunProjectionPort.run_replay,
  graph_call_replay: GraphCallProjectionPort.graph_call_replay,
  interaction_replay: InteractionProjectionPort.replay,
  continuation_replay: ContinuationProjectionPort.replay,
  c_call_replay: CCallProjectionPort.replay,
  workspace_gaps: WorkspaceProjectionPort.workspace_gaps,
  run_gaps: RunProjectionPort.run_gaps,
  run_lawful_actions: RunProjectionPort.run_lawful_actions,
});
