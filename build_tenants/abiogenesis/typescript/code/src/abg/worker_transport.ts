import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { appendFileSync, closeSync, fstatSync, fsyncSync, openSync, writeSync } from "node:fs";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  sha256Bytes,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze, isDeeplyFrozen } from "../shared/immutable.js";
import { admitIJsonText } from "../shared/i_json.js";
import { isRecord } from "../shared/admit/index.js";
import { createMonotonicDeadline, createOwnedProcessLifetime, type OwnedProcessFacts } from "../shared/owned_process_lifetime.js";
import { classifyOwnedProcessTerminal, encodeOwnedProcessFacts, hasConfirmedOwnedProcessBoundary } from "../shared/process/index.js";
import type { RuntimeLivenessObserverProjection } from "./runtime_liveness_contracts.js";
import {
  classifyWorkerTransportFailure,
  composeWorkerTransportArgs,
  deriveConfiguredActorIdentity,
  sanitizeWorkerTransportEnvironment,
  type ConfiguredActorIdentity,
  type TransportCapabilityLane,
  type WorkerTransportContract,
  type WorkerTransportFailureClass,
  type NativeWorkerResultAssessment,
} from "./transport_contracts.js";
import { canonicalEquals } from "../shared/value/index.js";

export type { WorkerTransportFailureClass } from "./transport_contracts.js";

export type WorkerTransportTimeoutClass = "absolute" | "inactivity";

/** A window closes at most this much actor clock after its first capture (§10.10). */
export const STDOUT_WINDOW_MAX_MS = 30_000;
/** One part of a captured chunk ending at chunk-relative character `end`,
 * classified only by the records it completes. `heartbeat` marks the worker
 * CLI's own status rows: lease-renewing activity, never model progress. */
export type WorkerStdoutChunkSegment = Readonly<{
  end: number;
  progress: boolean;
  heartbeat: boolean;
  result: boolean;
  turnBoundary: boolean;
}>;
/** One captured stdout chunk as its observer classifies it at capture. When
 * present, `segments` partitions the chunk at its completed turn boundaries
 * in order; absent, the whole chunk is one segment of the aggregate class. */
export type WorkerStdoutChunkClass = Readonly<{
  elapsedMs: number;
  progress: boolean;
  heartbeat: boolean;
  result: boolean;
  turnBoundary: boolean;
  segments?: readonly WorkerStdoutChunkSegment[];
}>;
export type WorkerStdoutWindowClosure = "turn_boundary" | "interval" | "flush" | "drain";
/** One closed window: an exact fsynced archive range and its capture instants. */
export type WorkerStdoutWindow = Readonly<{
  archiveOffset: number;
  byteLength: number;
  firstCaptureElapsedMs: number;
  lastCaptureElapsedMs: number;
  lastQualifyingElapsedMs: number | null;
  resultElapsedMs: number | null;
  closure: WorkerStdoutWindowClosure;
}>;
/** Closes the pending window now. Returns the restore of the taken window,
 * or null when nothing was pending. */
export type WorkerStdoutWindowFlush = () => (() => void) | null;

export type WorkerTransportArtifact = {
  readonly path: string;
  readonly byteLength: number;
  readonly digest: Sha256Digest;
};

export interface WorkerTransportRequest {
  readonly contract: WorkerTransportContract;
  readonly prompt: string;
  readonly lane: TransportCapabilityLane;
  readonly cwd: string;
  readonly archiveRoot: string;
  readonly label: string;
  readonly timeoutMs: number;
  readonly absoluteTimeoutMs?: number;
  readonly terminationGraceMs?: number;
  readonly responseJsonSchema?: Readonly<Record<string, JsonValue>>;
  readonly responsePresentation?: "result_text";
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly explicitAppendArgs?: readonly string[];
  readonly observer?: WorkerProcessObserver;
}

export interface WorkerProcessObserver {
  readonly assessNativeResultArtifact?: (output: string) => NativeWorkerResultAssessment;
  /** Only the existing native owner supplies this callback. A wakeup is raw;
   * containment requires the returned already-admitted threshold identity. */
  readonly onNativeSupervisionWakeup?: () => Readonly<{
    projection: RuntimeLivenessObserverProjection;
    admittedThresholdEventRef: string | null;
    timeoutClass: WorkerTransportTimeoutClass | null;
    nextWakeDelayMs: number;
  }>;
  readonly onProcessStarted?: (pid: number) => void;
  /** Declares window mode: each captured chunk is classified at capture and
   * referenced once per closed window. Without it every chunk is referenced. */
  readonly classifyStdoutChunk?: (chunk: string) => WorkerStdoutChunkClass;
  /** Window mode: receives the scope flush capability before launch. */
  readonly bindStdoutWindow?: (flush: WorkerStdoutWindowFlush) => void;
  /** One captured chunk, or in window mode one closed window. */
  readonly onStdoutObserved?: (chunk: string, window?: WorkerStdoutWindow) => boolean;
  readonly onStderrObserved?: (chunk: string) => boolean;
  readonly onTimeoutObserved?: (
    timeoutClass: WorkerTransportTimeoutClass,
  ) => void;
  readonly onSignalRequested?: (signal: NodeJS.Signals) => void;
  /** Final ownership handback, outside ordinary callbacks suppressed by failure. */
  readonly onProcessFinalized?: (facts: OwnedProcessFacts) => void;
  /** A genuine assessed candidate retained before an original transport error.
   * Prepared-plan correspondence has already been checked at this boundary. */
  readonly onResultArtifact?: (result: WorkerTransportResult) => void;
  /** Positive pre-launch refusal only; asynchronous launch facts use finalization. */
  readonly onSpawnFailed?: (message: string) => void;
}

export interface WorkerTransportResult {
  readonly nativeResultAssessment?: NativeWorkerResultAssessment;
  readonly kind: "worker_transport_result_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure" | "success";
  readonly agentKey: WorkerTransportContract["agentKey"];
  readonly lane: TransportCapabilityLane;
  readonly command: string;
  readonly args: readonly string[];
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly timeoutMs: number;
  readonly absoluteTimeoutMs: number;
  readonly timedOut: boolean;
  readonly timeoutClass: WorkerTransportTimeoutClass | null;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly failureClass: WorkerTransportFailureClass | null;
  readonly structuredEventCount: number;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly toolInvocations: readonly WorkerToolInvocationEvidence[];
  readonly apiRetryCount: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly finalOutput: string;
  /** The encoded final facts, referenced evidence bound by the transport digest. */
  readonly processFacts: JsonValue;
  readonly artifacts: Readonly<{
    output: WorkerTransportArtifact;
    prompt: WorkerTransportArtifact;
    stderr: WorkerTransportArtifact;
    stdout: WorkerTransportArtifact;
    transport: WorkerTransportArtifact;
  }>;
}

export type WorkerToolInvocationEvidence = {
  readonly [key: string]: JsonValue;
  readonly kind: "worker_tool_invocation_evidence";
  readonly schemaVersion: "5.0.0";
  readonly ordinal: number;
  readonly toolUseRef: string;
  readonly toolName: string;
  readonly inputDigest: Sha256Digest;
  readonly inputByteLength: number;
};

interface ProcessObservation {
  readonly facts: OwnedProcessFacts;
  readonly finalizationError?: unknown;
  readonly status: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly timedOut: boolean;
  readonly timeoutClass: WorkerTransportTimeoutClass | null;
  readonly exitObserved: boolean;
  readonly terminationConfirmed: boolean;
  readonly launchError: string | null;
  readonly resultBearingStdout: string;
  readonly stdout: string;
  readonly stderr: string;
}

interface StructuredObservation {
  readonly structuredEventCount: number;
  readonly progressEventCount: number;
  readonly toolCallCount: number;
  readonly toolInvocations: readonly WorkerToolInvocationEvidence[];
  readonly apiRetryCount: number;
  readonly finalOutput: string;
}

function toolUseIdentityInput(toolName: string, input: JsonValue): JsonValue {
  if (toolName !== "Bash") return input;
  if (!isRecord(input)) {
    throw new TypeError("Bash tool input must be one object");
  }
  const record = input;
  if (!Object.hasOwn(record, "command") || typeof record.command !== "string") {
    throw new TypeError("Bash tool input must carry one exact command string");
  }
  if (Object.hasOwn(record, "description") && typeof record.description !== "string") {
    throw new TypeError("Bash tool input description must be a string when present");
  }
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== "description"),
  );
}

function collectToolUses(
  value: JsonValue,
  structuredOutputExpected: boolean,
  rows: WorkerToolInvocationEvidence[],
): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectToolUses(entry, structuredOutputExpected, rows);
    return;
  }
  if (!isRecord(value)) return;
  const record = value;
  const protocolStructuredOutput = structuredOutputExpected &&
    record.type === "tool_use" && record.name === "StructuredOutput";
  if (record.type === "tool_use" && !protocolStructuredOutput &&
    typeof record.id === "string" && record.id.length > 0 &&
    typeof record.name === "string" && record.name.length > 0 &&
    Object.hasOwn(record, "input") && record.input !== undefined) {
    try {
      const inputBytes = Buffer.from(
        canonicalJson(toolUseIdentityInput(record.name, record.input)),
        "utf8",
      );
      rows.push(deepFreeze({
        kind: "worker_tool_invocation_evidence" as const,
        schemaVersion: "5.0.0" as const,
        ordinal: rows.length,
        toolUseRef: record.id,
        toolName: record.name,
        inputDigest: sha256Bytes(inputBytes),
        inputByteLength: inputBytes.byteLength,
      }));
    } catch {
      // Malformed tool input remains reflected in the count/classification but
      // cannot become exact invocation evidence.
    }
  }
  for (const entry of Object.values(record)) {
    collectToolUses(entry, structuredOutputExpected, rows);
  }
}

function artifact(path: string, bytes: Uint8Array): WorkerTransportArtifact {
  return deepFreeze({
    path,
    byteLength: bytes.byteLength,
    digest: sha256Bytes(bytes),
  });
}

function assertLabel(label: string): void {
  if (!/^[a-zA-Z0-9._-]+$/u.test(label)) {
    throw new TypeError("worker transport label must be one path-safe identity segment");
  }
}

function resolveAbsoluteTimeoutMs(
  timeoutMs: number,
  absoluteTimeoutMs: number | undefined,
): number {
  const resolved = absoluteTimeoutMs ?? timeoutMs * 4;
  if (!Number.isSafeInteger(resolved) || resolved <= timeoutMs) {
    throw new TypeError(
      "worker transport absolute timeout must be one safe integer greater than its inactivity timeout",
    );
  }
  return resolved;
}

function countToolUses(
  value: unknown,
  structuredOutputExpected: boolean,
): number {
  if (Array.isArray(value)) {
    return value.reduce(
      (count, entry) => count + countToolUses(entry, structuredOutputExpected),
      0,
    );
  }
  if (typeof value !== "object" || value === null) return 0;
  const record = value as Readonly<Record<string, unknown>>;
  // Claude emits this synthetic event to satisfy --json-schema; it has no capability effect.
  const protocolStructuredOutput = structuredOutputExpected &&
    record.type === "tool_use" &&
    record.name === "StructuredOutput";
  const current = record.type === "tool_use" && !protocolStructuredOutput ? 1 : 0;
  return Object.values(record).reduce<number>(
    (count, entry) => count + countToolUses(entry, structuredOutputExpected),
    current,
  );
}

/** One incremental decoder for complete protocol rows. Partial message events
 * expose received bytes, not unobservable model progress or tool execution.
 * The CLI's status rows are its heartbeat (TRANSPORT-025/027): they renew the
 * lease and count as no progress, retry, tool or result. */
export function createWorkerTransportOutputObserver(structuredOutputExpected: boolean) {
  let pending = "";
  let structuredEventCount = 0;
  let finalOutput = "";
  let progressEventCount = 0;
  // Window classification only; no observation or transport result carries it.
  let heartbeatEventCount = 0;
  let rawToolCallCount = 0;
  const rawToolInvocations: WorkerToolInvocationEvidence[] = [];
  // The tool projection, maintained as raw rows arrive: each ref's first-seen
  // row in first-seen order, and a sticky disagreement flag. A cut folds only
  // the raw rows after `foldedToolInvocationCount`; no old row is read again.
  let foldedToolInvocationCount = 0;
  const firstSeenToolInvocations = new Map<string, WorkerToolInvocationEvidence>();
  const toolInvocations: WorkerToolInvocationEvidence[] = [];
  let conflictingToolUseRef = false;
  let frozenToolInvocations: readonly WorkerToolInvocationEvidence[] = Object.freeze([]);
  let apiRetryCount = 0;
  let turnBoundaryCount = 0;
  // Turn boundaries completed by the last observed chunk: each chunk-relative
  // end (after its newline) with the progress, heartbeat and final output standing there.
  let chunkTurnBoundaries: Readonly<{ end: number; progressEventCount: number; heartbeatEventCount: number; finalOutput: string }>[] = [];
  // The standing at the end of the last classified window segment.
  let classifiedProgressEventCount = 0;
  let classifiedHeartbeatEventCount = 0;
  let classifiedFinalOutput = "";
  const observeLine = (line: string): void => {
    if (line.trim().length === 0) return;
    let value: JsonValue;
    try { value = JSON.parse(line); } catch { return; }
    structuredEventCount += 1;
    if (typeof value !== "object" || value === null || Array.isArray(value)) return;
    const record = value as Readonly<Record<string, unknown>>;
    // A complete assistant, user or result record ends one structured turn.
    if (record.type === "assistant" || record.type === "user" || record.type === "result") turnBoundaryCount += 1;
    const retry = record.type === "api_retry" ||
      record.type === "system" && record.subtype === "api_retry";
    if (retry) { apiRetryCount += 1; return; }
    if (record.type === "system" && record.subtype === "status") heartbeatEventCount += 1;
    const streamEvent = record.type === "stream_event" && typeof record.event === "object" && record.event !== null
      ? record.event as Readonly<Record<string, unknown>> : null;
    const reportedThinking = record.type === "system" && record.subtype === "thinking_tokens" &&
      typeof record.estimated_tokens_delta === "number" && record.estimated_tokens_delta > 0;
    if (record.type === "assistant" || record.type === "user" || record.type === "tool_progress" || reportedThinking ||
        streamEvent !== null && ["message_start", "content_block_start", "content_block_delta",
          "content_block_stop", "message_delta", "message_stop"].includes(String(streamEvent.type))) progressEventCount += 1;
    // Partial tool blocks contain an unfinished input and repeat the complete
    // assistant tool_use. Only the complete message supplies effect evidence.
    if (record.type !== "stream_event") {
      rawToolCallCount += countToolUses(record, structuredOutputExpected);
      collectToolUses(value, structuredOutputExpected, rawToolInvocations);
    }
    if (record.type === "result") {
      if (structuredOutputExpected) {
        // Only the successful final host carrier supplies the requested result.
        // Admit its raw JSON before serializing the selected value, so duplicate
        // keys or invalid I-JSON cannot disappear through JSON.parse/stringify.
        finalOutput = "";
        if (record.subtype !== "success" || record.is_error !== false) return;
        try {
          const admitted = admitIJsonText(line, "worker structured result");
          if (isRecord(admitted) && Object.hasOwn(admitted, "structured_output")) {
            finalOutput = canonicalJson(admitted.structured_output!);
          }
        } catch { /* retain the raw stream; never repair or fall back */ }
      } else if (typeof record.result === "string") {
        finalOutput = record.result;
      }
    }
  };
  const snapshot = (): StructuredObservation => {
    for (; foldedToolInvocationCount < rawToolInvocations.length; foldedToolInvocationCount += 1) {
      const row = rawToolInvocations[foldedToolInvocationCount]!;
      const prior = firstSeenToolInvocations.get(row.toolUseRef);
      if (prior === undefined) {
        const unique = deepFreeze({ ...row, ordinal: toolInvocations.length });
        firstSeenToolInvocations.set(unique.toolUseRef, unique);
        toolInvocations.push(unique);
      } else if (prior.toolName !== row.toolName || prior.inputDigest !== row.inputDigest ||
        prior.inputByteLength !== row.inputByteLength) {
        conflictingToolUseRef = true;
      }
    }
    // Rows are frozen at insertion; a cut forms a new frozen array only when
    // a first-seen row arrived since the previous cut.
    if (frozenToolInvocations.length !== toolInvocations.length) {
      frozenToolInvocations = Object.freeze(toolInvocations.slice());
    }
    const unevidencedToolUse = rawToolCallCount > rawToolInvocations.length;
    return {
      structuredEventCount,
      progressEventCount,
      toolCallCount: conflictingToolUseRef || unevidencedToolUse
        ? toolInvocations.length + 1
        : toolInvocations.length,
      toolInvocations: frozenToolInvocations,
      apiRetryCount,
      finalOutput,
    };
  };
  const observe = (chunk: string): StructuredObservation => {
    // The held incomplete line precedes this chunk; ends are chunk-relative.
    let consumed = -pending.length;
    chunkTurnBoundaries = [];
    pending += chunk;
    let newline: number;
    while ((newline = pending.indexOf("\n")) !== -1) {
      const turns = turnBoundaryCount;
      observeLine(pending.slice(0, newline));
      consumed += newline + 1;
      pending = pending.slice(newline + 1);
      if (turnBoundaryCount > turns) chunkTurnBoundaries.push({ end: consumed, progressEventCount, heartbeatEventCount, finalOutput });
    }
    return snapshot();
  };
  const classifySegment = (end: number, progressCount: number, heartbeatCount: number, output: string, turnBoundary: boolean): WorkerStdoutChunkSegment => {
    const segment = Object.freeze({ end, progress: progressCount > classifiedProgressEventCount,
      heartbeat: heartbeatCount > classifiedHeartbeatEventCount, result: output.length > 0 && output !== classifiedFinalOutput, turnBoundary });
    classifiedProgressEventCount = progressCount; classifiedHeartbeatEventCount = heartbeatCount; classifiedFinalOutput = output;
    return segment;
  };
  return {
    observe,
    finish(): StructuredObservation {
      observeLine(pending); pending = "";
      return snapshot();
    },
    /** Complete structured turn records observed so far. */
    turnBoundaryCount(): number { return turnBoundaryCount; },
    /** Window classification (§10.10): observes one captured chunk and
     * partitions it at the turn boundaries it completes. Each segment is
     * classified only by the records it completes, so a noise-only tail
     * after a boundary is not activity. */
    classifyChunk(chunk: string): readonly WorkerStdoutChunkSegment[] {
      const output = observe(chunk);
      const segments = chunkTurnBoundaries.map(row => classifySegment(row.end, row.progressEventCount, row.heartbeatEventCount, row.finalOutput, true));
      if (segments.length === 0 || segments.at(-1)!.end !== chunk.length) {
        segments.push(classifySegment(chunk.length, output.progressEventCount, heartbeatEventCount, output.finalOutput, false));
      }
      return Object.freeze(segments);
    },
  };
}

function observeStructuredOutput(stdout: string, structuredOutputExpected: boolean): StructuredObservation {
  const observer = createWorkerTransportOutputObserver(structuredOutputExpected);
  observer.observe(stdout);
  return observer.finish();
}

async function runProcess(input: {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
  readonly stdin: string | null;
  readonly timeoutMs: number;
  readonly absoluteTimeoutMs: number;
  readonly terminationGraceMs: number;
  readonly stdoutPath: string;
  readonly stderrPath: string;
  readonly observer?: WorkerProcessObserver;
}): Promise<ProcessObservation> {
  let stdout = "";
  let stderr = "";
  let timedOut = false;
  let timeoutClass: WorkerTransportTimeoutClass | null = null;
  let launchError: string | null = null;
  let resultBearingStdout: string | null = null;
  let captureOpen = true;
  const inactivityTimer = createMonotonicDeadline();
  const absoluteTimer = createMonotonicDeadline();
  const windowTimer = createMonotonicDeadline();
  const clearLeaseTimers = (): void => { inactivityTimer.cancel(); absoluteTimer.cancel(); windowTimer.cancel(); };
  const snapshotResultBearingStdout = (): void => { resultBearingStdout ??= stdout; };
  const classifyStdoutChunk = input.observer?.classifyStdoutChunk;
  // E-A: one archive descriptor; each chunk is written at the running length,
  // which is its archive offset. A write or fsync failure is sticky.
  let archiveDescriptor: number;
  let archiveLength: number;
  try {
    archiveDescriptor = openSync(input.stdoutPath, "r+");
    archiveLength = fstatSync(archiveDescriptor).size;
  } catch (error) { return refuseBeforeLaunch(error, input.observer); }
  let archiveFailure: { readonly error: unknown } | null = null;
  let archiveOpen = true;
  const closeArchive = (): void => { if (archiveOpen) { archiveOpen = false; closeSync(archiveDescriptor); } };
  let pendingWindow: PendingStdoutWindow | null = null;
  let windowsDrained = false;
  let child: ChildProcessWithoutNullStreams;
  try {
    if (classifyStdoutChunk !== undefined) input.observer?.bindStdoutWindow?.(() => flushStdoutWindow());
    child = spawn(input.command, input.args, {
      cwd: input.cwd, env: input.env, detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    closeArchive();
    return refuseBeforeLaunch(error, input.observer);
  }
  const lifetime = createOwnedProcessLifetime(child, { terminationGraceMs: input.terminationGraceMs }, {
    onSpawn: (pid) => input.observer?.onProcessStarted?.(pid),
    onError: (error) => {
      clearLeaseTimers(); snapshotResultBearingStdout(); launchError = error.message;
    },
    onExit: () => {
      clearLeaseTimers(); snapshotResultBearingStdout(); captureOpen = false;
      child.stdout.destroy(); child.stderr.destroy(); child.stdin.destroy();
    },
    onSignalRequested: (signal) => {
      clearLeaseTimers(); input.observer?.onSignalRequested?.(signal);
    },
  });
  const beginTimeout = (observedTimeoutClass: WorkerTransportTimeoutClass): void => {
    if (timedOut || lifetime.snapshot().cleanupDeadlineNs !== null) return;
    if (input.observer?.onNativeSupervisionWakeup !== undefined) {
      const selected = lifetime.observe(() => input.observer!.onNativeSupervisionWakeup!());
      if (selected === undefined) return;
      if (!Number.isFinite(selected.nextWakeDelayMs) || selected.nextWakeDelayMs <= 0) {
        lifetime.fail(new TypeError("native supervision returned no finite declared wakeup")); return;
      }
      if (selected.projection.disposition.disposition !== "controlled_terminate") {
        if (selected.admittedThresholdEventRef !== null || selected.timeoutClass !== null) {
          lifetime.fail(new TypeError("non-consequential native wakeup claimed a threshold")); return;
        }
        inactivityTimer.after(selected.nextWakeDelayMs, () => beginTimeout("inactivity"));
        return;
      }
      if (selected.admittedThresholdEventRef === null || selected.timeoutClass === null) {
        lifetime.fail(new TypeError("native containment lacks its admitted threshold")); return;
      }
      observedTimeoutClass = selected.timeoutClass;
    }
    timedOut = true; timeoutClass = observedTimeoutClass;
    clearLeaseTimers(); snapshotResultBearingStdout();
    if (input.observer?.onNativeSupervisionWakeup === undefined) {
      lifetime.observe(() => input.observer?.onTimeoutObserved?.(observedTimeoutClass));
    }
    lifetime.requestTermination();
  };
  const renewInactivityLease = (): void => {
    if (timedOut || lifetime.snapshot().cleanupDeadlineNs !== null) return;
    inactivityTimer.after(input.timeoutMs, () => beginTimeout("inactivity"));
  };
  const archiveFailed = (error: unknown): never => {
    archiveFailure ??= { error };
    lifetime.fail(archiveFailure.error);
    throw archiveFailure.error;
  };
  const archiveWrite = (bytes: Buffer): void => {
    if (archiveFailure !== null) throw archiveFailure.error;
    try {
      for (let written = 0; written < bytes.length;) {
        const count = writeSync(archiveDescriptor, bytes, written, bytes.length - written, archiveLength + written);
        if (!Number.isSafeInteger(count) || count < 1) throw new TypeError("worker stdout archive write made no progress");
        written += count;
      }
    } catch (error) { archiveFailed(error); }
    archiveLength += bytes.length;
  };
  const archiveSync = (): void => {
    if (archiveFailure !== null) throw archiveFailure.error;
    try { fsyncSync(archiveDescriptor); }
    catch (error) { archiveFailed(error); }
  };
  const takeWindow = (): PendingStdoutWindow | null => {
    const taken = pendingWindow;
    pendingWindow = null; windowTimer.cancel();
    return taken;
  };
  // The taken window's bytes are durable before its one reference.
  const emitWindow = (taken: PendingStdoutWindow, closure: WorkerStdoutWindowClosure): void => {
    archiveSync();
    input.observer?.onStdoutObserved?.(taken.parts.join(""), Object.freeze({
      archiveOffset: taken.archiveOffset, byteLength: taken.byteLength,
      firstCaptureElapsedMs: taken.firstCaptureElapsedMs, lastCaptureElapsedMs: taken.lastCaptureElapsedMs,
      lastQualifyingElapsedMs: taken.lastQualifyingElapsedMs, resultElapsedMs: taken.resultElapsedMs, closure,
    }));
  };
  const closeWindow = (closure: WorkerStdoutWindowClosure): void => {
    const taken = takeWindow();
    if (taken !== null) emitWindow(taken, closure);
  };
  const armWindowTimer = (): void => {
    if (pendingWindow === null || timedOut || lifetime.snapshot().cleanupDeadlineNs !== null) return;
    const remainingMs = Number(pendingWindow.closeAtNs - process.hrtime.bigint()) / 1_000_000;
    windowTimer.after(Math.max(1, Math.ceil(remainingMs)), () => lifetime.observe(() => closeWindow("interval")));
  };
  // A rolled-back flush returns its window ahead of any newer pending bytes.
  const restoreWindow = (taken: PendingStdoutWindow): void => {
    const newer = pendingWindow;
    pendingWindow = newer === null ? taken : {
      ...taken, byteLength: taken.byteLength + newer.byteLength, parts: [...taken.parts, ...newer.parts],
      lastCaptureElapsedMs: newer.lastCaptureElapsedMs,
      lastQualifyingElapsedMs: newer.lastQualifyingElapsedMs ?? taken.lastQualifyingElapsedMs,
      resultElapsedMs: newer.resultElapsedMs ?? taken.resultElapsedMs,
    };
    if (!windowsDrained) armWindowTimer();
  };
  const flushStdoutWindow = (): (() => void) | null => {
    const taken = takeWindow();
    if (taken === null) return null;
    try { emitWindow(taken, "flush"); }
    catch (error) { restoreWindow(taken); throw error; }
    return () => restoreWindow(taken);
  };
  const observeStdoutWindow = (chunk: string, byteLength: number, archiveOffset: number): void => {
    const selected = classifyStdoutChunk!(chunk);
    if (!Number.isFinite(selected.elapsedMs) || selected.elapsedMs < 0) {
      throw new TypeError("worker stdout capture requires one finite actor-clock instant");
    }
    // Each completed turn boundary closes the window holding it at its exact
    // position; a later segment of the same capture keeps its own class.
    const segments = selected.segments ?? [{ end: chunk.length, progress: selected.progress, heartbeat: selected.heartbeat,
      result: selected.result, turnBoundary: selected.turnBoundary }];
    const parts: { readonly text: string; readonly byteLength: number; readonly segment: WorkerStdoutChunkSegment }[] = [];
    let start = 0, partitioned = 0;
    for (const segment of segments) {
      if (!Number.isSafeInteger(segment.end) || segment.end < start || segment.end === start && start > 0 || segment.end > chunk.length) {
        throw new TypeError("worker stdout segments must partition the captured chunk in order");
      }
      const text = chunk.slice(start, segment.end), length = Buffer.byteLength(text, "utf8");
      parts.push({ text, byteLength: length, segment }); partitioned += length; start = segment.end;
    }
    if (start !== chunk.length || partitioned !== byteLength) throw new TypeError("worker stdout segments must partition the captured bytes");
    if (pendingWindow !== null && selected.elapsedMs - pendingWindow.firstCaptureElapsedMs >= STDOUT_WINDOW_MAX_MS) closeWindow("interval");
    let offset = archiveOffset, renew = false;
    for (const { text, byteLength: length, segment } of parts) {
      // Model progress, a result or the CLI heartbeat is admitted activity.
      const qualifying = segment.progress || segment.heartbeat || segment.result;
      if (pendingWindow === null) {
        pendingWindow = { archiveOffset: offset, byteLength: 0, parts: [], firstCaptureElapsedMs: selected.elapsedMs,
          lastCaptureElapsedMs: selected.elapsedMs, lastQualifyingElapsedMs: null, resultElapsedMs: null,
          closeAtNs: process.hrtime.bigint() + BigInt(STDOUT_WINDOW_MAX_MS) * 1_000_000n };
        armWindowTimer();
      }
      pendingWindow.byteLength += length; pendingWindow.parts.push(text);
      pendingWindow.lastCaptureElapsedMs = selected.elapsedMs;
      if (qualifying) pendingWindow.lastQualifyingElapsedMs = selected.elapsedMs;
      if (segment.result) pendingWindow.resultElapsedMs = selected.elapsedMs;
      if (segment.turnBoundary) closeWindow("turn_boundary");
      offset += length; renew ||= qualifying;
    }
    if (renew) renewInactivityLease();
  };
  const onStdout = (chunk: string): void => {
    if (!captureOpen) return;
    lifetime.observe(() => {
      const bytes = Buffer.from(chunk, "utf8"), archiveOffset = archiveLength;
      archiveWrite(bytes); stdout += chunk;
      if (classifyStdoutChunk !== undefined) observeStdoutWindow(chunk, bytes.length, archiveOffset);
      else if (input.observer?.onStdoutObserved?.(chunk) === true) renewInactivityLease();
    });
  };
  const onStderr = (chunk: string): void => {
    if (!captureOpen) return;
    lifetime.observe(() => {
      appendFileSync(input.stderrPath, chunk, "utf8"); stderr += chunk;
      if (input.observer?.onStderrObserved?.(chunk) === true) renewInactivityLease();
    });
  };
  try {
    renewInactivityLease();
    absoluteTimer.after(input.absoluteTimeoutMs, () => beginTimeout("absolute"));
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", onStdout); child.stderr.on("data", onStderr);
    child.stdin.end(input.stdin ?? undefined);
  } catch (error) { lifetime.fail(error); }
  try {
    const facts = await lifetime.completion;
    let finalization: Pick<ProcessObservation, "finalizationError"> = {};
    // Every stdout row precedes finalization. A drain failure is the
    // finalization error, and finalization still runs.
    try { windowsDrained = true; closeWindow("drain"); }
    catch (error) { finalization = { finalizationError: error }; }
    try { input.observer?.onProcessFinalized?.(facts); }
    catch (error) { if (!Object.hasOwn(finalization, "finalizationError")) finalization = { finalizationError: error }; }
    try { closeArchive(); }
    catch (error) { if (!Object.hasOwn(finalization, "finalizationError")) finalization = { finalizationError: error }; }
    return {
      facts, ...finalization,
      status: facts.directExit?.status ?? null, signal: facts.directExit?.signal ?? null,
      timedOut, timeoutClass, exitObserved: facts.directExit !== null,
      terminationConfirmed: hasConfirmedOwnedProcessBoundary(facts),
      launchError: facts.launchFailure?.message ?? launchError,
      resultBearingStdout: resultBearingStdout ?? stdout, stdout, stderr,
    };
  } finally {
    clearLeaseTimers(); captureOpen = false; windowsDrained = true; pendingWindow = null;
    child.stdout.off("data", onStdout); child.stderr.off("data", onStderr);
    try { closeArchive(); } catch { /* Only an abandoned completion reaches here; it already carries its own failure. */ }
  }
}

type PendingStdoutWindow = {
  readonly archiveOffset: number;
  byteLength: number;
  readonly parts: string[];
  readonly firstCaptureElapsedMs: number;
  lastCaptureElapsedMs: number;
  lastQualifyingElapsedMs: number | null;
  resultElapsedMs: number | null;
  readonly closeAtNs: bigint;
};

function refuseBeforeLaunch(error: unknown, observer?: WorkerProcessObserver): never {
  try { observer?.onSpawnFailed?.(error instanceof Error ? error.message : String(error)); }
  catch { /* A later admission failure cannot replace the original pre-launch failure. */ }
  throw error;
}

/** Pure existing protocol parser, shared by the native artifact observer. */
export function observeWorkerTransportOutput(parser: WorkerTransportContract["parser"], stdout: string, structuredRequested: boolean) {
  return parser === "claude_stream_json" ? observeStructuredOutput(stdout, structuredRequested) : {
    structuredEventCount: 0, progressEventCount: stdout.length > 0 ? 1 : 0,
    toolCallCount: 0, toolInvocations: [] as readonly WorkerToolInvocationEvidence[], apiRetryCount: 0, finalOutput: stdout,
  };
}

async function executeWorkerTransport(
  input: WorkerTransportRequest,
  validatePreparedResult: (result: WorkerTransportResult) => void,
): Promise<WorkerTransportResult> {
  // This catch ends before spawn. No post-launch rejection can become no-child.
  const { paths, args, promptBytes, absoluteTimeoutMs, terminationGraceMs, env } = await (async () => {
    assertLabel(input.label);
    if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1) {
      throw new TypeError("worker transport timeout must be one positive safe integer");
    }
    const terminationGraceMs = input.terminationGraceMs ?? 1_000;
    if (!Number.isSafeInteger(terminationGraceMs) || terminationGraceMs < 1) {
      throw new TypeError("worker transport termination grace must be one positive safe integer");
    }
    const absoluteTimeoutMs = resolveAbsoluteTimeoutMs(
      input.timeoutMs,
      input.absoluteTimeoutMs,
    );
    await mkdir(input.archiveRoot, { recursive: true });
    const archiveRoot = resolve(input.archiveRoot);
    const paths = {
      prompt: resolve(archiveRoot, `${input.label}-prompt.txt`),
      output: resolve(archiveRoot, `${input.label}-output.txt`),
      stdout: resolve(archiveRoot, `${input.label}-stdout.log`),
      stderr: resolve(archiveRoot, `${input.label}-stderr.log`),
      transport: resolve(archiveRoot, `${input.label}-transport.json`),
    };
    const environment = input.environment ?? process.env;
    const args = composeWorkerTransportArgs({
      contract: input.contract,
      prompt: input.prompt,
      outputPath: paths.output,
      lane: input.lane,
      environment,
      ...(input.responseJsonSchema === undefined
        ? {}
        : { responseJsonSchema: input.responseJsonSchema }),
      ...(input.responsePresentation === undefined ? {} : { responsePresentation: input.responsePresentation }),
      ...(input.explicitAppendArgs === undefined
        ? {}
        : { explicitAppendArgs: input.explicitAppendArgs }),
    });
    // Establish the archive before a paid process can emit bytes. Refuse reuse
    // of an existing attempt archive instead of truncating retained evidence.
    const promptBytes = Buffer.from(input.prompt, "utf8");
    await writeFile(paths.prompt, promptBytes, { flag: "wx" });
    await writeFile(paths.stdout, "", { flag: "wx" });
    await writeFile(paths.stderr, "", { flag: "wx" });
    return { paths, args, promptBytes, absoluteTimeoutMs, terminationGraceMs,
      env: sanitizeWorkerTransportEnvironment(input.contract, environment) ?? {} };
  })().catch(error => refuseBeforeLaunch(error, input.observer));
  const processObservation = await runProcess({
    command: input.contract.command,
    args,
    cwd: input.cwd,
    env,
    stdin: input.contract.promptTransport === "stdin" ? input.prompt : null,
    timeoutMs: input.timeoutMs,
    absoluteTimeoutMs,
    terminationGraceMs,
    stdoutPath: paths.stdout,
    stderrPath: paths.stderr,
    ...(input.observer === undefined ? {} : { observer: input.observer }),
  });
  const failed = processObservation.facts.firstError !== null || Object.hasOwn(processObservation, "finalizationError");
  const firstError = processObservation.facts.firstError ?? processObservation.finalizationError;
  if (classifyOwnedProcessTerminal(processObservation.facts) === "unconfirmed") {
    if (failed) throw firstError;
    throw new TypeError("worker owned process scope remains unconfirmed");
  }
  // A raw transport caller (no native result assessor) receives the original
  // Error. An assessing owner assesses available candidates before the same
  // original Error is thrown.
  if (failed && input.observer?.assessNativeResultArtifact === undefined) throw firstError;
  try {
    const structuredOutputExpected = input.contract.agentKey === "claude" && args.includes("--json-schema");
    const observation = input.contract.parser === "claude_stream_json"
      ? observeStructuredOutput(
          processObservation.resultBearingStdout,
          structuredOutputExpected,
        )
      : {
        structuredEventCount: 0,
        progressEventCount:
          processObservation.resultBearingStdout.length > 0 ? 1 : 0,
        toolCallCount: 0,
        toolInvocations: [],
        apiRetryCount: 0,
        finalOutput: processObservation.resultBearingStdout,
      };
    let finalOutput = observation.finalOutput;
    let nativeResultAssessment: NativeWorkerResultAssessment | undefined;
    if (input.observer?.assessNativeResultArtifact !== undefined) {
      let fileOutput: string | null = null;
      try { fileOutput = (await readFile(paths.output)).toString("utf8"); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
      if (fileOutput !== null && fileOutput.trim().length > 0) {
        if (finalOutput.trim().length === 0) {
          if (!structuredOutputExpected && input.responsePresentation !== "result_text") finalOutput = fileOutput;
        }
        else {
          let sameOutput = fileOutput === finalOutput;
          try { sameOutput ||= canonicalEquals(JSON.parse(fileOutput), JSON.parse(finalOutput)); } catch { /* no parser repair */ }
          if (!sameOutput) throw new TypeError("distinct worker output channels disagree; no first/last result selection");
        }
      }
      nativeResultAssessment = input.observer.assessNativeResultArtifact(finalOutput);
    }
    const failureClass = classifyWorkerTransportFailure({
      parser: input.contract.parser,
      lane: input.lane,
      processStatus: processObservation.status,
      timedOut: processObservation.timedOut,
      terminationConfirmed: processObservation.terminationConfirmed,
      processSpawnFailed: processObservation.launchError !== null,
      structuredEventCount: observation.structuredEventCount,
      toolCallCount: observation.toolCallCount,
      apiRetryCount: observation.apiRetryCount,
      finalOutput,
      ...(nativeResultAssessment === undefined ? {} : { nativeResultDisposition: nativeResultAssessment.disposition }),
    });
    const outputBytes = Buffer.from(finalOutput, "utf8");
    const stdoutBytes = Buffer.from(processObservation.stdout, "utf8");
    const stderrBytes = Buffer.from(processObservation.stderr, "utf8");
    await writeFile(paths.output, outputBytes);
    if (sha256Bytes(await readFile(paths.stdout)) !== sha256Bytes(stdoutBytes) ||
        sha256Bytes(await readFile(paths.stderr)) !== sha256Bytes(stderrBytes)) {
      throw new TypeError("worker stream archive differs from observed bytes");
    }
    const body = {
      ...(nativeResultAssessment === undefined ? {} : { nativeResultAssessment }),
      kind: "worker_transport_result_candidate" as const,
      schemaVersion: "5.0.0" as const,
      disposition: failureClass === null ? "success" as const : "failure" as const,
      agentKey: input.contract.agentKey,
      lane: input.lane,
      command: input.contract.command,
      args,
      status: processObservation.status,
      signal: processObservation.signal,
      timeoutMs: input.timeoutMs,
      absoluteTimeoutMs,
      timeoutClass: processObservation.timeoutClass,
      failureClass,
      structuredEventCount: observation.structuredEventCount,
      progressEventCount: observation.progressEventCount,
      toolCallCount: observation.toolCallCount,
      toolInvocations: observation.toolInvocations,
      apiRetryCount: observation.apiRetryCount,
      stdout: processObservation.stdout,
      stderr: processObservation.stderr,
      finalOutput,
      processFacts: encodeOwnedProcessFacts(processObservation.facts),
      artifacts: {
        prompt: artifact(paths.prompt, promptBytes),
        output: artifact(paths.output, outputBytes),
        stdout: artifact(paths.stdout, stdoutBytes),
        stderr: artifact(paths.stderr, stderrBytes),
      },
    };
    const transportBytes = Buffer.from(`${canonicalJson(body)}\n`, "utf8");
    await writeFile(paths.transport, transportBytes);
    // D5: the archive omits the lifecycle copies its status, signal, timeoutClass
    // and processFacts already determine; the live result still carries them.
    const result = deepFreeze({
      ...body,
      timedOut: processObservation.timedOut,
      exitObserved: processObservation.exitObserved,
      terminationConfirmed: processObservation.terminationConfirmed,
      artifacts: {
        ...body.artifacts,
        transport: artifact(paths.transport, transportBytes),
      },
    }) as WorkerTransportResult;
    const persistedTransport = await readFile(paths.transport);
    if (sha256Bytes(persistedTransport) !== result.artifacts.transport.digest) {
      throw new TypeError("worker transport artifact changed after persistence");
    }
    validatePreparedResult(result);
    if (failed) {
      input.observer?.onResultArtifact?.(result);
      throw firstError;
    }
    return result;
  } catch (error) { throw failed ? firstError : error; }
}

export interface PreparedWorkerTransport {
  readonly kind: "prepared_worker_transport";
  readonly schemaVersion: "5.0.0";
  readonly planDigest: Sha256Digest;
  readonly contractDigest: Sha256Digest;
  readonly agentKey: WorkerTransportContract["agentKey"];
  readonly parser: WorkerTransportContract["parser"];
  readonly promptTransport: WorkerTransportContract["promptTransport"];
  readonly lane: TransportCapabilityLane;
  readonly command: string;
  readonly args: readonly string[];
  /** Derived from exactly these final args and the sanitized environment the
   * process receives; the frozen request re-executes the same selection. */
  readonly configuredIdentity: ConfiguredActorIdentity;
  readonly cwd: string;
  readonly archiveRoot: string;
  readonly label: string;
  readonly timeoutMs: number;
  readonly absoluteTimeoutMs: number;
  readonly terminationGraceMs: number;
  readonly promptDigest: Sha256Digest;
  readonly responseJsonSchemaDigest: Sha256Digest | null;
  readonly environmentPolicyDigest: Sha256Digest;
  readonly environmentDigest: Sha256Digest;
  readonly paths: Readonly<{
    prompt: string;
    output: string;
    stdout: string;
    stderr: string;
    transport: string;
  }>;
}

const preparedTransportState = new WeakMap<
  PreparedWorkerTransport,
  Omit<WorkerTransportRequest, "observer">
>();

function exactEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(
    Object.entries(environment)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
      .sort(([left], [right]) => left.localeCompare(right)),
  ));
}

/** Observation-only §10.11 counts of plan contract and schema copies, reuses
 * and first-sight deep-frozen walks; no barrel exports them. */
const workerTransportCopyWork = { contractCopies: 0, schemaCopies: 0, reuses: 0, deepFrozenChecks: 0 };

/** @internal A frozen snapshot of the observation-only counts. */
export function observeWorkerTransportCopyWork(): Readonly<typeof workerTransportCopyWork> {
  return Object.freeze({ ...workerTransportCopyWork });
}

// §10.11 X6: values the plan owner copied, or found deeply frozen when first
// supplied. Identity carries the fact; a mutable value is copied every time.
const planOwnedValues = new WeakSet<object>();

function planOwned<T>(value: T, copies: "contractCopies" | "schemaCopies"): T {
  if (typeof value === "object" && value !== null) {
    if (planOwnedValues.has(value)) {
      workerTransportCopyWork.reuses++;
      return value;
    }
    if (Object.isFrozen(value) && (workerTransportCopyWork.deepFrozenChecks++, isDeeplyFrozen(value))) {
      planOwnedValues.add(value);
      workerTransportCopyWork.reuses++;
      return value;
    }
  }
  workerTransportCopyWork[copies]++;
  const copy = deepFreeze(structuredClone(value));
  if (typeof copy === "object" && copy !== null) planOwnedValues.add(copy);
  return copy as T;
}

export async function prepareWorkerTransport(
  input: WorkerTransportRequest,
): Promise<PreparedWorkerTransport> {
  assertLabel(input.label);
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs < 1) {
    throw new TypeError("worker transport timeout must be one positive safe integer");
  }
  const terminationGraceMs = input.terminationGraceMs ?? 1_000;
  if (!Number.isSafeInteger(terminationGraceMs) || terminationGraceMs < 1) {
    throw new TypeError("worker transport termination grace must be one positive safe integer");
  }
  const absoluteTimeoutMs = resolveAbsoluteTimeoutMs(
    input.timeoutMs,
    input.absoluteTimeoutMs,
  );
  const archiveRoot = resolve(input.archiveRoot);
  const cwd = await realpath(input.cwd);
  const sourceEnvironment = exactEnvironment(input.environment ?? process.env);
  // The plan owns frozen copies: a later change to the caller's contract,
  // schema or appended arguments cannot alter the executed command, arguments
  // or identity. An established immutable contract or schema is already that
  // (§10.11 X6) and is reused by identity.
  const contract: WorkerTransportContract = planOwned(input.contract, "contractCopies");
  const responseJsonSchema = input.responseJsonSchema === undefined ? undefined : planOwned(input.responseJsonSchema, "schemaCopies");
  const explicitAppendArgs = input.explicitAppendArgs === undefined ? undefined : Object.freeze([...input.explicitAppendArgs]);
  const paths = deepFreeze({
    prompt: resolve(archiveRoot, `${input.label}-prompt.txt`),
    output: resolve(archiveRoot, `${input.label}-output.txt`),
    stdout: resolve(archiveRoot, `${input.label}-stdout.log`),
    stderr: resolve(archiveRoot, `${input.label}-stderr.log`),
    transport: resolve(archiveRoot, `${input.label}-transport.json`),
  });
  const args = composeWorkerTransportArgs({
    contract,
    prompt: input.prompt,
    outputPath: paths.output,
    lane: input.lane,
    environment: sourceEnvironment,
    ...(responseJsonSchema === undefined
      ? {}
      : { responseJsonSchema }),
    ...(input.responsePresentation === undefined ? {} : { responsePresentation: input.responsePresentation }),
    ...(explicitAppendArgs === undefined
      ? {}
      : { explicitAppendArgs }),
  });
  const sanitizedEnvironment = exactEnvironment(
    sanitizeWorkerTransportEnvironment(contract, sourceEnvironment) ?? {},
  );
  const body = {
    contractDigest: sha256Canonical(contract),
    agentKey: contract.agentKey,
    parser: contract.parser,
    promptTransport: contract.promptTransport,
    lane: input.lane,
    command: contract.command,
    args,
    configuredIdentity: deriveConfiguredActorIdentity(contract, args, sanitizedEnvironment),
    cwd,
    archiveRoot,
    label: input.label,
    timeoutMs: input.timeoutMs,
    absoluteTimeoutMs,
    terminationGraceMs,
    promptDigest: sha256Canonical(input.prompt),
    responseJsonSchemaDigest: responseJsonSchema === undefined
      ? null
      : sha256Canonical(responseJsonSchema),
    environmentPolicyDigest: sha256Canonical({
      agentKey: contract.agentKey,
      sanitizedEnvironmentPrefixes: contract.sanitizedEnvironmentPrefixes,
    }),
    environmentDigest: sha256Canonical(sanitizedEnvironment),
    paths,
  };
  const plan = deepFreeze({
    kind: "prepared_worker_transport" as const,
    schemaVersion: "5.0.0" as const,
    planDigest: sha256Canonical(body),
    ...body,
  }) as PreparedWorkerTransport;
  const request: Omit<WorkerTransportRequest, "observer"> = {
    contract,
    prompt: input.prompt,
    lane: input.lane,
    cwd,
    archiveRoot,
    label: input.label,
    timeoutMs: input.timeoutMs,
    absoluteTimeoutMs,
    terminationGraceMs,
    ...(responseJsonSchema === undefined
      ? {}
      : { responseJsonSchema }),
    ...(input.responsePresentation === undefined ? {} : { responsePresentation: input.responsePresentation }),
    environment: sourceEnvironment,
    ...(explicitAppendArgs === undefined
      ? {}
      : { explicitAppendArgs }),
  };
  preparedTransportState.set(plan, request);
  return plan;
}

export async function runPreparedWorkerTransport(
  plan: PreparedWorkerTransport,
  observer?: WorkerProcessObserver,
): Promise<WorkerTransportResult> {
  const request = preparedTransportState.get(plan);
  if (request === undefined) {
    return refuseBeforeLaunch(new TypeError("worker transport plan was not prepared by this ABG module"), observer);
  }
  return executeWorkerTransport({
    ...request,
    ...(observer === undefined ? {} : { observer }),
  }, result => {
    if (
      result.command !== plan.command ||
      !canonicalEquals(
        result.args,
        plan.args,
      )
    ) {
      throw new TypeError("executed worker transport differs from the prepared binding");
    }
  });
}

export async function runWorkerTransport(
  input: WorkerTransportRequest,
): Promise<WorkerTransportResult> {
  const plan = await prepareWorkerTransport(input).catch(error => refuseBeforeLaunch(error, input.observer));
  return runPreparedWorkerTransport(plan, input.observer);
}
