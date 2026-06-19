// Implements: T-161

import path from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import type { Dirent } from "node:fs";

import {
  dirMtimeMsOrNull,
  fileMtimeMsOrNull,
  fileRef,
  operatorRunRef
} from "./archive_reader.js";
import type {
  OperatorRunCarriers,
  WorkerProcessEventRecord
} from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";
import {
  sdlcBlockingReasonFromLegacy,
  type SdlcBlockingReason
} from "../shared/blocking_reason.js";
import type {
  SdlcFdRunAnalysisActiveRunLiveness,
  SdlcFdRunAnalysisProductiveSignal,
  SdlcFdRunAnalysisThresholds
} from "./types.js";

function workerPidFromCarriers(carriers: OperatorRunCarriers): number | null {
  const started = carriers.workerProcessStarted.status === "present"
    ? carriers.workerProcessStarted.data
    : null;
  if (typeof started?.pid === "number" && Number.isFinite(started.pid)) {
    return started.pid;
  }
  const baseName = path.basename(carriers.operatorRunRoot);
  const pidMatch = /_pid(\d+)$/u.exec(baseName);
  if (pidMatch?.[1] !== undefined) {
    const value = Number.parseInt(pidMatch[1], 10);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

function processAlive(pid: number | null): boolean | null {
  if (pid === null) {
    return null;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      const code: unknown = Reflect.get(error, "code");
      if (code === "ESRCH") {
        return false;
      }
      if (code === "EPERM") {
        return true;
      }
    }
    return null;
  }
}

function lastEventTimestampMs(
  events: readonly WorkerProcessEventRecord[]
): number | null {
  let latest: number | null = null;
  for (const event of events) {
    if (typeof event.observedAtMs === "number" && Number.isFinite(event.observedAtMs)) {
      if (latest === null || event.observedAtMs > latest) {
        latest = event.observedAtMs;
      }
    }
  }
  return latest;
}

function lastHeartbeatTimestampMs(
  events: readonly WorkerProcessEventRecord[]
): number | null {
  let latest: number | null = null;
  for (const event of events) {
    if (
      event.kind === "actor_process_heartbeat" &&
      typeof event.observedAtMs === "number" &&
      Number.isFinite(event.observedAtMs)
    ) {
      if (latest === null || event.observedAtMs > latest) {
        latest = event.observedAtMs;
      }
    }
  }
  return latest;
}

function maxNoOutputGapFromEvents(
  events: readonly WorkerProcessEventRecord[]
): number | null {
  let previous: number | null = null;
  let maxGap: number | null = null;
  for (const event of events) {
    const observed =
      typeof event.observedAtMs === "number" && Number.isFinite(event.observedAtMs)
        ? event.observedAtMs
        : typeof event.elapsedMs === "number" && Number.isFinite(event.elapsedMs)
          ? event.elapsedMs
          : null;
    if (observed === null) {
      continue;
    }
    if (previous !== null) {
      const gap = observed - previous;
      if (gap > 0 && (maxGap === null || gap > maxGap)) {
        maxGap = gap;
      }
    }
    previous = observed;
  }
  return maxGap;
}

const ARCHIVE_GROWTH_ROLLING_WINDOW_MS = 60_000;

function archiveGrowthBytesPerMinute(input: {
  readonly operatorRunRoot: string;
  readonly nowMs: number;
}): number | null {
  if (!existsSync(input.operatorRunRoot)) {
    return null;
  }
  const stats = statSync(input.operatorRunRoot);
  if (!stats.isDirectory()) {
    return null;
  }
  let recentBytes = 0;
  const windowStartMs = input.nowMs - ARCHIVE_GROWTH_ROLLING_WINDOW_MS;
  for (const entry of readDirRecursively(input.operatorRunRoot)) {
    if (entry.mtimeMs >= windowStartMs) {
      recentBytes += entry.size;
    }
  }
  return Math.round((recentBytes / ARCHIVE_GROWTH_ROLLING_WINDOW_MS) * 60_000);
}

function readDirRecursively(
  rootDir: string
): readonly { readonly size: number; readonly mtimeMs: number }[] {
  const out: { readonly size: number; readonly mtimeMs: number }[] = [];
  const walk = (dir: string): void => {
    try {
      const entries: Dirent<string>[] = readdirSync(dir, {
        withFileTypes: true,
        encoding: "utf8"
      });
      for (const entry of entries) {
        const child = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(child);
        } else if (entry.isFile()) {
          try {
            const stats = statSync(child);
            out.push({ size: stats.size, mtimeMs: stats.mtimeMs });
          } catch {
            continue;
          }
        }
      }
    } catch {
      return;
    }
  };
  walk(rootDir);
  return out;
}

function lastBlockingReasonFromCarriers(
  carriers: OperatorRunCarriers
): SdlcBlockingReason | null {
  if (carriers.postflight.status === "present") {
    const postflight = carriers.postflight.data;
    const carrierList = postflight.blockingReasonCarriers ?? [];
    for (let index = carrierList.length - 1; index >= 0; index -= 1) {
      const candidate = carrierList[index];
      if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
        continue;
      }
      const codeValue: unknown = Reflect.get(candidate, "code");
      if (typeof codeValue !== "string") {
        continue;
      }
      return sdlcBlockingReasonFromLegacy({ reason: codeValue });
    }
  }
  return null;
}

function classifyProductiveSignal(input: {
  readonly carriers: OperatorRunCarriers;
  readonly processAlive: boolean | null;
  readonly heartbeatAgeMs: number | null;
  readonly archiveGrowthBytesPerMinute: number | null;
  readonly thresholds: SdlcFdRunAnalysisThresholds;
  readonly nowMs: number;
}): SdlcFdRunAnalysisProductiveSignal {
  const { carriers, processAlive: alive, heartbeatAgeMs, archiveGrowthBytesPerMinute: growth, thresholds, nowMs } = input;
  const closureDecision = carriers.edgeClosure.status === "present"
    ? carriers.edgeClosure.data
    : null;
  if (carriers.postflight.status === "present" && closureDecision !== null) {
    if (closureDecision.disposition === "close" || closureDecision.disposition === "yield") {
      return "completed";
    }
  }
  const workerRun = carriers.workerRun.status === "present" ? carriers.workerRun.data : null;
  if (workerRun !== null && typeof workerRun.status === "number" && workerRun.status !== 0) {
    return "aborted_or_killed";
  }
  if (alive === false && carriers.postflight.status !== "present") {
    const dirMtime = dirMtimeMsOrNull(carriers.operatorRunRoot);
    if (dirMtime !== null && nowMs - dirMtime > thresholds.heartbeatAgeStallMs) {
      return "aborted_or_killed";
    }
  }
  if (heartbeatAgeMs !== null && heartbeatAgeMs > thresholds.heartbeatAgeStallMs) {
    if (growth !== null && growth > 0) {
      return "stalled_with_io";
    }
    return "stalled_no_io";
  }
  if (growth !== null && growth > 0) {
    return "progressing";
  }
  if (alive === true) {
    return "progressing";
  }
  return "unknown";
}

export function deriveActiveRunLiveness(input: {
  readonly carriers: OperatorRunCarriers | null;
  readonly thresholds: SdlcFdRunAnalysisThresholds;
  readonly nowMs: number;
}): {
  readonly liveness: SdlcFdRunAnalysisActiveRunLiveness;
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  const { carriers, thresholds, nowMs } = input;
  if (carriers === null) {
    return Object.freeze({
      liveness: Object.freeze({
        activeOperatorRunRef: null,
        activeEdgeRef: null,
        activeGraphVectorRef: null,
        activeTargetAssetType: null,
        actorInvocationRef: null,
        workerProcessRef: null,
        workerPid: null,
        processAlive: null,
        processAliveCheckedAtMs: nowMs,
        lastEventAtMs: null,
        lastStdoutAtMs: null,
        lastHeartbeatAtMs: null,
        heartbeatAgeMs: null,
        maxNoOutputGapMs: null,
        archiveGrowthBytesPerMinute: null,
        productiveSignal: "unknown" as const,
        lastBlockingReason: null
      }),
      diagnostics: Object.freeze([])
    });
  }
  const operatorRunRootValue = operatorRunRef(carriers.operatorRunRoot);
  const handoff = carriers.handoffManifest.status === "present"
    ? carriers.handoffManifest.data
    : null;
  const operatorSummary = carriers.operatorSummary.status === "present"
    ? carriers.operatorSummary.data
    : null;
  const workerProcessStartedPath = path.join(
    carriers.operatorRunRoot,
    "worker_process_started.json"
  );
  const workerProcessStartedExists = existsSync(workerProcessStartedPath);
  const events =
    carriers.workerProcessEvents.status === "present"
      ? carriers.workerProcessEvents.data
      : [];
  const lastEventAt = lastEventTimestampMs(events);
  const lastHeartbeatAt = lastHeartbeatTimestampMs(events);
  const lastStdoutAt = fileMtimeMsOrNull(
    path.join(carriers.operatorRunRoot, "worker_stdout.log")
  );
  const workerPid = workerPidFromCarriers(carriers);
  const alive = processAlive(workerPid);
  const heartbeatAgeMs = lastHeartbeatAt === null ? null : Math.max(0, nowMs - lastHeartbeatAt);
  const maxGap = maxNoOutputGapFromEvents(events);
  const growth = archiveGrowthBytesPerMinute({
    operatorRunRoot: carriers.operatorRunRoot,
    nowMs
  });
  const lastBlockingReason = lastBlockingReasonFromCarriers(carriers);
  const productiveSignal = classifyProductiveSignal({
    carriers,
    processAlive: alive,
    heartbeatAgeMs,
    archiveGrowthBytesPerMinute: growth,
    thresholds,
    nowMs
  });
  const liveness: SdlcFdRunAnalysisActiveRunLiveness = Object.freeze({
    activeOperatorRunRef: operatorRunRootValue,
    activeEdgeRef:
      operatorSummary?.graphFunctionName ?? handoff?.graphFunctionName ?? null,
    activeGraphVectorRef: handoff?.edgeName ?? null,
    activeTargetAssetType: handoff?.targetAssetType ?? null,
    actorInvocationRef:
      events.length > 0
        ? Object.freeze(events).find((event) => event.kind === "actor_invocation_started")
            ? fileRef(path.join(carriers.operatorRunRoot, "worker_process_events.jsonl"))
            : null
        : null,
    workerProcessRef: workerProcessStartedExists
      ? fileRef(workerProcessStartedPath)
      : null,
    workerPid,
    processAlive: alive,
    processAliveCheckedAtMs: nowMs,
    lastEventAtMs: lastEventAt,
    lastStdoutAtMs: lastStdoutAt,
    lastHeartbeatAtMs: lastHeartbeatAt,
    heartbeatAgeMs,
    maxNoOutputGapMs: maxGap,
    archiveGrowthBytesPerMinute: growth,
    productiveSignal,
    lastBlockingReason
  });
  const diagnostics = collectLivenessDiagnostics({
    liveness,
    thresholds,
    operatorRunRef: operatorRunRootValue
  });
  return Object.freeze({ liveness, diagnostics });
}

function collectLivenessDiagnostics(input: {
  readonly liveness: SdlcFdRunAnalysisActiveRunLiveness;
  readonly thresholds: SdlcFdRunAnalysisThresholds;
  readonly operatorRunRef: string;
}): readonly DiagnosticDraft[] {
  const drafts: DiagnosticDraft[] = [];
  if (input.liveness.productiveSignal === "stalled_no_io") {
    drafts.push({
      code: "active_run_stalled_no_io",
      severity: "warn",
      detail:
        "Active run shows no stdout or event activity within the configured no-output window.",
      evidenceRefs: Object.freeze([input.operatorRunRef]),
      operatorRunRef: input.operatorRunRef,
      edgeName: input.liveness.activeEdgeRef
    });
  }
  if (input.liveness.productiveSignal === "stalled_with_io") {
    drafts.push({
      code: "active_run_stalled_with_io",
      severity: "warn",
      detail:
        "Active run still produces stdout/events but heartbeat age exceeds the configured threshold.",
      evidenceRefs: Object.freeze([input.operatorRunRef]),
      operatorRunRef: input.operatorRunRef,
      edgeName: input.liveness.activeEdgeRef
    });
  }
  if (
    input.liveness.heartbeatAgeMs !== null &&
    input.liveness.heartbeatAgeMs > input.thresholds.heartbeatAgeStallMs
  ) {
    drafts.push({
      code: "worker_heartbeat_age_high",
      severity: "warn",
      detail: `worker heartbeat age ${input.liveness.heartbeatAgeMs}ms exceeds ${input.thresholds.heartbeatAgeStallMs}ms`,
      evidenceRefs: Object.freeze([input.operatorRunRef]),
      operatorRunRef: input.operatorRunRef,
      edgeName: input.liveness.activeEdgeRef
    });
  }
  if (
    input.liveness.archiveGrowthBytesPerMinute !== null &&
    input.liveness.archiveGrowthBytesPerMinute === 0 &&
    (input.liveness.productiveSignal === "stalled_no_io" ||
      input.liveness.productiveSignal === "stalled_with_io")
  ) {
    drafts.push({
      code: "archive_growth_zero_during_active_edge",
      severity: "warn",
      detail: "operator-run archive is not growing while edge is still active",
      evidenceRefs: Object.freeze([input.operatorRunRef]),
      operatorRunRef: input.operatorRunRef,
      edgeName: input.liveness.activeEdgeRef
    });
  }
  return Object.freeze(drafts);
}
