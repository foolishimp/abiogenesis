import type { ChildProcess } from "node:child_process";
import {
  initialOwnedProcessState, transitionOwnedProcess,
  type OwnedProcessInput, type OwnedProcessNotice, type OwnedProcessScopeAbsence,
  type OwnedProcessTiming, type OwnedProcessWait, type OwnedProcessWaitName,
} from "./owned_process_state.js";

const HOST_MAX_MS = 2_147_483_647;
const NS_PER_MS = 1_000_000n;

/** Internal host seam for the finite timing/physical falsifiers. Production uses Node. */
export interface MonotonicTimerHost {
  readonly nowNs: () => bigint;
  readonly arm: (callback: () => void, delayMs: number) => unknown;
  readonly cancel: (timer: unknown) => void;
}
const nodeClock: MonotonicTimerHost = {
  nowNs: () => process.hrtime.bigint(),
  arm: (callback, delayMs) => setTimeout(callback, delayMs),
  cancel: (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
};

function durationNs(delayMs: number): bigint {
  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    throw new TypeError("owned process wait must be positive and finite");
  }
  // Split before scaling: even Number.MAX_VALUE is finite input. Rounding a
  // positive fraction upward to the clock's resolution never makes it due early.
  const whole = Math.floor(delayMs);
  return BigInt(whole) * NS_PER_MS + BigInt(Math.ceil((delayMs - whole) * 1_000_000));
}

/** One cancellable wait, not an owner of timeout or renewal policy. */
export function createMonotonicDeadline(clock: MonotonicTimerHost = nodeClock) {
  let generation = 0;
  let armGeneration = 0;
  let timer: unknown;
  let armed = false;
  const cancel = (): void => {
    generation += 1;
    if (armed) clock.cancel(timer);
    armed = false;
  };
  const at = (deadlineNs: bigint, action: () => void): void => {
    cancel();
    const selected = generation;
    const check = (): void => {
      if (selected !== generation) return;
      const remaining = deadlineNs - clock.nowNs();
      if (remaining <= 0n) {
        generation += 1;
        armed = false;
        action();
        return;
      }
      const ceilingMs = (remaining + NS_PER_MS - 1n) / NS_PER_MS;
      const delayMs = ceilingMs > BigInt(HOST_MAX_MS) ? HOST_MAX_MS : Number(ceilingMs);
      const selectedArm = ++armGeneration;
      armed = true;
      timer = clock.arm(() => {
        if (selected !== generation || selectedArm !== armGeneration || !armed) return;
        armed = false;
        check();
      }, delayMs);
    };
    check();
  };
  return {
    at,
    after(delayMs: number, action: () => void): void {
      const duration = durationNs(delayMs);
      at(clock.nowNs() + duration, action);
    },
    cancel,
  };
}

export type { OwnedProcessScopeAbsence };
export interface OwnedProcessHost {
  readonly clock: MonotonicTimerHost;
  readonly platform: "posix" | "win32";
  readonly signal: (child: ChildProcess, signal: NodeJS.Signals) => void;
  readonly probeGroup: (pid: number) => OwnedProcessScopeAbsence;
}
const nodeHost: OwnedProcessHost = {
  clock: nodeClock,
  platform: process.platform === "win32" ? "win32" : "posix",
  signal: (child, signal) => {
    if (process.platform !== "win32" && child.pid !== undefined) process.kill(-child.pid, signal);
    else child.kill(signal);
  },
  probeGroup: (pid) => {
    try { process.kill(-pid, 0); return "present"; }
    catch (error) { return (error as NodeJS.ErrnoException).code === "ESRCH" ? "absent" : "unknown"; }
  },
};

export interface OwnedProcessLifetimeBounds {
  readonly terminationGraceMs: number;
  readonly host?: OwnedProcessHost;
}
export interface OwnedProcessObservations {
  readonly onSpawn?: (pid: number) => void;
  readonly onError?: (error: Error) => void;
  readonly onExit?: (status: number | null, signal: NodeJS.Signals | null) => void;
  readonly onSignalRequested?: (signal: "SIGTERM" | "SIGKILL") => void;
  readonly onUnconfirmed?: () => void;
}
export interface OwnedProcessFacts {
  readonly directExit: Readonly<{ status: number | null; signal: NodeJS.Signals | null }> | null;
  readonly launchFailure: Error | null;
  readonly noChildEstablished: boolean;
  readonly scopeKind: "posix_process_group" | "windows_direct_child";
  readonly scopeAbsence: OwnedProcessScopeAbsence;
  readonly closeObserved: boolean;
  readonly streamsDisposed: boolean;
  readonly drainExpired: boolean;
  readonly firstError: Error | null;
  readonly cleanupDeadlineNs: bigint | null;
  readonly cleanupElapsedMs: number;
  readonly probeCount: number;
  readonly signalAttempts: number;
}

/** Keep Node's error channel observed through terminal close, including errors
 * queued by destroy(). Disconnect the lifetime before publishing its outcome;
 * the remaining inert guard retains no owner callback or completion authority. */
function guardOwnedErrors(
  emitter: ChildProcess | NonNullable<ChildProcess["stdin"]> | NonNullable<ChildProcess["stdout"]>,
  observeError: (error: Error) => void,
): () => void {
  let report: ((error: Error) => void) | null = observeError;
  const onError = (error: Error): void => { report?.(error); };
  const onClose = (): void => {
    report = null;
    emitter.off("error", onError); emitter.off("close", onClose);
  };
  emitter.on("error", onError); emitter.once("close", onClose);
  return () => { report = null; };
}

/** Physical facts for one freshly spawned, caller-owned group/direct child.
 * It never infers owner success, ABG admission, or universal descendant absence. */
export function createOwnedProcessLifetime(
  child: ChildProcess,
  bounds: OwnedProcessLifetimeBounds,
  observations: OwnedProcessObservations = {},
) {
  if (!Number.isSafeInteger(bounds.terminationGraceMs) || bounds.terminationGraceMs <= 0) {
    throw new TypeError("owned process grace must be one positive safe integer");
  }
  const host = bounds.host ?? nodeHost;
  const clock = host.clock;
  const timing: OwnedProcessTiming = Object.freeze({
    platform: host.platform,
    graceNs: durationNs(bounds.terminationGraceMs),
    drainNs: durationNs(Math.min(bounds.terminationGraceMs, 250)),
    probeNs: durationNs(Math.min(bounds.terminationGraceMs, 10)),
  });
  const timers: Record<OwnedProcessWaitName, ReturnType<typeof createMonotonicDeadline>> = {
    phase: createMonotonicDeadline(clock), probe: createMonotonicDeadline(clock), drain: createMonotonicDeadline(clock),
  };
  const armed: Record<OwnedProcessWaitName, OwnedProcessWait | null> = { phase: null, probe: null, drain: null };
  let current = initialOwnedProcessState;
  let resolveCompletion!: (facts: OwnedProcessFacts) => void;
  const completion = new Promise<OwnedProcessFacts>((resolve) => { resolveCompletion = resolve; });
  // Every call returns a fresh view; elapsed cleanup time is recomputed, also after completion.
  const snapshot = (): OwnedProcessFacts => {
    const s = current;
    return {
      directExit: s.directExit, launchFailure: s.launchFailure,
      noChildEstablished: child.pid === undefined && s.launchFailure !== null,
      scopeKind: host.platform === "win32" ? "windows_direct_child" : "posix_process_group",
      scopeAbsence: s.scopeAbsence, closeObserved: s.closeObserved, streamsDisposed: s.streamsDisposed,
      drainExpired: s.drainExpired, firstError: s.firstError,
      cleanupDeadlineNs: s.cleanupDeadlineNs,
      cleanupElapsedMs: s.cleanupStartedNs === null ? 0 : Number(clock.nowNs() - s.cleanupStartedNs) / 1_000_000,
      probeCount: s.probeCount, signalAttempts: s.signalAttempts,
    };
  };
  const probeGroup = (pid: number | undefined): OwnedProcessScopeAbsence => {
    if (pid === undefined) return "unknown";
    try { return host.probeGroup(pid); }
    catch { return "unknown"; }
  };
  const notify = (notice: OwnedProcessNotice): void => {
    if (notice.kind === "error") observations.onError?.(notice.error);
    else if (notice.kind === "exit") observations.onExit?.(notice.status, notice.signal);
    else if (notice.kind === "signal") observations.onSignalRequested?.(notice.signal);
    else observations.onUnconfirmed?.();
  };
  // Waits follow the published state; an already-due wait re-enters synchronously.
  const reconcile = (): void => {
    for (const name of ["phase", "probe", "drain"] as const) {
      const wait = current.waits[name];
      if (armed[name] === wait) continue;
      armed[name] = wait;
      if (wait === null) timers[name].cancel();
      else timers[name].at(wait.atNs, () => dispatch({ kind: "due", wait: name, token: wait }));
    }
  };
  const dispose = (): void => {
    child.off("spawn", onSpawn);
    child.off("exit", onExit); child.off("close", onClose);
    for (const stream of [child.stdin, child.stdout, child.stderr]) {
      try { stream?.destroy(); }
      catch (error) { failWith(error, true); }
    }
    // Synchronous disposal errors still belong to this outcome. Errors queued
    // for later delivery cannot rewrite it or become an unhandled host error.
    for (const disconnect of errorGuards) disconnect();
  };
  /** Publish the next state before any action; after host or callback re-entry,
   * only inputs decided against the then-current state may act. */
  function dispatch(input: OwnedProcessInput): void {
    const step = transitionOwnedProcess(timing, current, input, { nowNs: clock.nowNs(), pid: child.pid });
    current = step.state;
    if (step.signal !== null) {
      try { host.signal(child, step.signal); }
      catch { /* Signal failure cannot establish absence. */ }
    }
    reconcile();
    if (current !== step.state) return;
    const tail = step.tail;
    let next = step.next;
    if (tail?.kind === "notify") observe(() => notify(tail.notice));
    else if (tail?.kind === "probe") {
      // Count the entered assessment before evaluation or the host can re-enter.
      dispatch({ kind: "probing", probe: tail.probe });
      next = [{ kind: "probed", probe: tail.probe, absence: tail.known ?? probeGroup(tail.pid) }, ...next];
    } else if (tail?.kind === "dispose") dispose();
    else if (tail?.kind === "publish") resolveCompletion(Object.freeze(snapshot()));
    for (const following of next) dispatch(following);
  }
  const observe = <T>(action: () => T): T | undefined => {
    if (current.phase === "complete" || current.firstError !== null) return undefined;
    try { return action(); }
    catch (error) { fail(error); return undefined; }
  };
  const requestTermination = (mode: "graceful" | "immediate" = "graceful"): void => {
    dispatch({ kind: "terminate", mode });
  };
  const failWith = (error: unknown, disposal: boolean): void => {
    if (current.sealed) return;
    dispatch({ kind: "fail", disposal,
      error: current.firstError ?? (error instanceof Error ? error : new TypeError(String(error))) });
  };
  const fail = (error: unknown): void => { failWith(error, false); };
  function onSpawn(): void { if (child.pid !== undefined) observe(() => observations.onSpawn?.(child.pid!)); }
  function onError(error: Error): void {
    if (child.pid === undefined) dispatch({ kind: "launchError", error });
    else fail(error);
  }
  function onExit(status: number | null, signalValue: NodeJS.Signals | null): void {
    dispatch({ kind: "exit", status, signal: signalValue });
  }
  function onClose(): void { dispatch({ kind: "close" }); }
  const errorGuards = [guardOwnedErrors(child, onError)];
  for (const stream of [child.stdin, child.stdout, child.stderr]) {
    if (stream !== null && !stream.closed) errorGuards.push(guardOwnedErrors(stream, fail));
  }
  child.once("spawn", onSpawn);
  child.once("exit", onExit); child.once("close", onClose);
  return { completion, requestTermination, fail, observe, snapshot };
}
