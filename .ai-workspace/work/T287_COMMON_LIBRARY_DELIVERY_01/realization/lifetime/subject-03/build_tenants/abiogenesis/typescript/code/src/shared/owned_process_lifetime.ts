import type { ChildProcess } from "node:child_process";

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

export type OwnedProcessScopeAbsence = "absent" | "present" | "unknown";
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
  const grace = durationNs(bounds.terminationGraceMs);
  const drain = durationNs(Math.min(bounds.terminationGraceMs, 250));
  const phaseTimer = createMonotonicDeadline(clock);
  const probeTimer = createMonotonicDeadline(clock);
  const drainTimer = createMonotonicDeadline(clock);
  let phase: "live" | "term" | "kill" | "drain" | "complete" = "live";
  let directExit: OwnedProcessFacts["directExit"] = null;
  let launchFailure: Error | null = null;
  let firstError: Error | null = null;
  let scopeAbsence: OwnedProcessScopeAbsence = "unknown";
  let closeObserved = false;
  let streamsDisposed = false;
  let drainExpired = false;
  let cleanupStartedNs: bigint | null = null;
  let scopeDeadlineNs: bigint | null = null;
  let cleanupDeadlineNs: bigint | null = null;
  let probeCount = 0;
  let signalAttempts = 0;
  let killAttempted = false;
  let resolveCompletion!: (facts: OwnedProcessFacts) => void;
  const completion = new Promise<OwnedProcessFacts>((resolve) => { resolveCompletion = resolve; });
  const noChild = (): boolean => child.pid === undefined && launchFailure !== null;
  const snapshot = (): OwnedProcessFacts => ({
    directExit, launchFailure, noChildEstablished: noChild(),
    scopeKind: host.platform === "win32" ? "windows_direct_child" : "posix_process_group",
    scopeAbsence, closeObserved, streamsDisposed, drainExpired, firstError,
    cleanupDeadlineNs,
    cleanupElapsedMs: cleanupStartedNs === null ? 0 : Number(clock.nowNs() - cleanupStartedNs) / 1_000_000,
    probeCount, signalAttempts,
  });
  const probe = (): OwnedProcessScopeAbsence => {
    probeCount += 1;
    if (noChild()) scopeAbsence = "absent";
    else if (host.platform === "win32") scopeAbsence = directExit === null ? "unknown" : "absent";
    else if (child.pid === undefined) scopeAbsence = "unknown";
    else {
      try { scopeAbsence = host.probeGroup(child.pid); }
      catch { scopeAbsence = "unknown"; }
    }
    return scopeAbsence;
  };
  const signal = (value: "SIGTERM" | "SIGKILL"): void => {
    if (noChild() || (value === "SIGKILL" && killAttempted)) return;
    if (value === "SIGKILL") killAttempted = true;
    signalAttempts += 1;
    try { host.signal(child, value); }
    catch { /* Signal failure cannot establish absence. */ }
  };
  const complete = (): void => {
    if (phase === "complete") return;
    phase = "complete";
    phaseTimer.cancel(); probeTimer.cancel(); drainTimer.cancel();
    child.off("spawn", onSpawn); child.off("error", onError);
    child.off("exit", onExit); child.off("close", onClose);
    child.stdin?.destroy(); child.stdout?.destroy(); child.stderr?.destroy();
    streamsDisposed = true;
    resolveCompletion(Object.freeze(snapshot()));
  };
  const observe = <T>(action: () => T): T | undefined => {
    if (phase === "complete" || firstError !== null) return undefined;
    try { return action(); }
    catch (error) { fail(error); return undefined; }
  };
  const finishScope = (): void => {
    if (phase === "drain" || phase === "complete") return;
    phase = "drain";
    phaseTimer.cancel(); probeTimer.cancel();
    if (scopeAbsence !== "absent") observe(() => observations.onUnconfirmed?.());
    if (closeObserved) { complete(); return; }
    const requested = clock.nowNs() + drain;
    const deadline = cleanupDeadlineNs === null || requested < cleanupDeadlineNs ? requested : cleanupDeadlineNs;
    drainTimer.at(deadline, () => { drainExpired = true; complete(); });
  };
  const check = (): void => {
    probeTimer.cancel();
    if (phase === "live" || phase === "drain" || phase === "complete") return;
    if (probe() === "absent" && (directExit !== null || noChild())) { finishScope(); return; }
    probeTimer.after(Math.min(bounds.terminationGraceMs, 10), check);
  };
  const startKill = (): void => {
    if (phase === "kill" || phase === "complete") return;
    if (phase === "drain") { if (scopeAbsence !== "absent") signal("SIGKILL"); return; }
    phase = "kill";
    phaseTimer.cancel();
    if (probe() === "absent" && (directExit !== null || noChild())) { finishScope(); return; }
    observe(() => observations.onSignalRequested?.("SIGKILL"));
    signal("SIGKILL");
    const requested = clock.nowNs() + grace;
    scopeDeadlineNs = scopeDeadlineNs === null || requested < scopeDeadlineNs ? requested : scopeDeadlineNs;
    const final = scopeDeadlineNs + drain;
    if (cleanupDeadlineNs === null || final < cleanupDeadlineNs) cleanupDeadlineNs = final;
    phaseTimer.at(scopeDeadlineNs, () => { probe(); finishScope(); });
    check();
  };
  const requestTermination = (mode: "graceful" | "immediate" = "graceful"): void => {
    if (phase === "complete") return;
    if (phase !== "live") { if (mode === "immediate") startKill(); return; }
    cleanupStartedNs = clock.nowNs();
    scopeDeadlineNs = cleanupStartedNs + 2n * grace;
    cleanupDeadlineNs = scopeDeadlineNs + drain;
    if (probe() === "absent" && (directExit !== null || noChild())) { finishScope(); return; }
    if (mode === "immediate") { startKill(); return; }
    phase = "term";
    observe(() => observations.onSignalRequested?.("SIGTERM"));
    // A throwing signal observer may already have strengthened this attempt.
    if (phase !== "term") return;
    signal("SIGTERM");
    phaseTimer.at(cleanupStartedNs + grace, startKill);
    check();
  };
  const fail = (error: unknown): void => {
    if (phase === "complete") return;
    firstError ??= error instanceof Error ? error : new TypeError(String(error));
    requestTermination("immediate");
  };
  function onSpawn(): void { if (child.pid !== undefined) observe(() => observations.onSpawn?.(child.pid!)); }
  function onError(error: Error): void {
    if (child.pid === undefined) launchFailure = error;
    observe(() => observations.onError?.(error));
    requestTermination();
  }
  function onExit(status: number | null, signalValue: NodeJS.Signals | null): void {
    directExit = Object.freeze({ status, signal: signalValue });
    observe(() => observations.onExit?.(status, signalValue));
    requestTermination();
    check();
  }
  function onClose(): void {
    closeObserved = true;
    if (phase === "drain") complete();
    else { requestTermination(); check(); }
  }
  child.once("spawn", onSpawn); child.once("error", onError);
  child.once("exit", onExit); child.once("close", onClose);
  return { completion, requestTermination, fail, observe, snapshot };
}
