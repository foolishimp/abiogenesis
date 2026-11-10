/** Immutable physical state and pure transition for one owned process lifetime.
 * The reducer decides; `owned_process_lifetime.ts` alone performs host actions.
 * It infers no owner success, ABG admission or universal descendant absence. */

export type OwnedProcessScopeAbsence = "absent" | "present" | "unknown";
export type OwnedProcessSignal = "SIGTERM" | "SIGKILL";
export type OwnedProcessWaitName = "phase" | "probe" | "drain";
/** A wait is accepted only while it is still the state's own wait object. */
export interface OwnedProcessWait { readonly atNs: bigint }

export interface OwnedProcessState {
  readonly phase: "live" | "term" | "kill" | "drain" | "complete";
  readonly directExit: Readonly<{ status: number | null; signal: NodeJS.Signals | null }> | null;
  readonly launchFailure: Error | null;
  readonly firstError: Error | null;
  readonly scopeAbsence: OwnedProcessScopeAbsence;
  readonly closeObserved: boolean;
  readonly streamsDisposed: boolean;
  readonly drainExpired: boolean;
  readonly cleanupStartedNs: bigint | null;
  readonly scopeDeadlineNs: bigint | null;
  readonly cleanupDeadlineNs: bigint | null;
  readonly probeCount: number;
  readonly signalAttempts: number;
  readonly killAttempted: boolean;
  readonly sealed: boolean;
  readonly waits: Readonly<Record<OwnedProcessWaitName, OwnedProcessWait | null>>;
  /** The entered assessment whose result is still current; a later entry or completion supersedes it. */
  readonly probing: OwnedProcessProbe | null;
}

export interface OwnedProcessTiming {
  readonly platform: "posix" | "win32";
  readonly graceNs: bigint;
  readonly drainNs: bigint;
  readonly probeNs: bigint;
}
/** Host observations read once by the bridge for each input. */
export interface OwnedProcessContext {
  readonly nowNs: bigint;
  readonly pid: number | undefined;
}

type ProbeContinuation = "terminate-graceful" | "terminate-immediate" | "kill" | "check" | "deadline";
/** One proposed assessment; like a wait, its result is accepted only while it is the state's own probe. */
export interface OwnedProcessProbe { readonly then: ProbeContinuation }
export type OwnedProcessNotice =
  | { readonly kind: "error"; readonly error: Error }
  | { readonly kind: "exit"; readonly status: number | null; readonly signal: NodeJS.Signals | null }
  | { readonly kind: "signal"; readonly signal: OwnedProcessSignal }
  | { readonly kind: "unconfirmed" };

/** Error values are carried as opaque references; the reducer never clones them. */
export type OwnedProcessInput =
  | { readonly kind: "terminate"; readonly mode: "graceful" | "immediate" }
  | { readonly kind: "fail"; readonly error: Error; readonly disposal: boolean }
  | { readonly kind: "launchError"; readonly error: Error }
  | { readonly kind: "exit"; readonly status: number | null; readonly signal: NodeJS.Signals | null }
  | { readonly kind: "close" }
  | { readonly kind: "check" }
  | { readonly kind: "due"; readonly wait: OwnedProcessWaitName; readonly token: OwnedProcessWait }
  | { readonly kind: "probing"; readonly probe: OwnedProcessProbe }
  | { readonly kind: "probed"; readonly probe: OwnedProcessProbe; readonly absence: OwnedProcessScopeAbsence }
  | { readonly kind: "notified"; readonly after: "term" | "kill" | "unconfirmed" }
  | { readonly kind: "seal" };

/** At most one tail per step. A tail may re-enter, so it is always last and its
 * continuation is a new input decided against the then-current state. */
export type OwnedProcessTail =
  | { readonly kind: "notify"; readonly notice: OwnedProcessNotice }
  | { readonly kind: "probe"; readonly probe: OwnedProcessProbe; readonly known: OwnedProcessScopeAbsence | null; readonly pid: number | undefined }
  | { readonly kind: "dispose" }
  | { readonly kind: "publish" };

export interface OwnedProcessStep {
  readonly state: OwnedProcessState;
  readonly signal: OwnedProcessSignal | null;
  readonly tail: OwnedProcessTail | null;
  readonly next: readonly OwnedProcessInput[];
}

const NO_WAITS = Object.freeze({ phase: null, probe: null, drain: null });
export const initialOwnedProcessState: OwnedProcessState = Object.freeze({
  phase: "live", directExit: null, launchFailure: null, firstError: null,
  scopeAbsence: "unknown", closeObserved: false, streamsDisposed: false, drainExpired: false,
  cleanupStartedNs: null, scopeDeadlineNs: null, cleanupDeadlineNs: null,
  probeCount: 0, signalAttempts: 0, killAttempted: false, sealed: false, waits: NO_WAITS, probing: null,
});

const step = (
  state: OwnedProcessState,
  signal: OwnedProcessSignal | null = null,
  tail: OwnedProcessTail | null = null,
  next: readonly OwnedProcessInput[] = [],
): OwnedProcessStep => ({ state: Object.freeze(state), signal, tail, next });
const earlier = (value: bigint, bound: bigint | null): bigint => bound === null || value < bound ? value : bound;
const noChild = (s: OwnedProcessState, at: OwnedProcessContext): boolean => at.pid === undefined && s.launchFailure !== null;
const observable = (s: OwnedProcessState): boolean => s.phase !== "complete" && s.firstError === null;
const notifyThen = (s: OwnedProcessState, notice: OwnedProcessNotice, next: readonly OwnedProcessInput[]): OwnedProcessStep =>
  observable(s) ? step(s, null, { kind: "notify", notice }, next) : step(s, null, null, next);

function signalled(s: OwnedProcessState, at: OwnedProcessContext, value: OwnedProcessSignal): [OwnedProcessState, OwnedProcessSignal | null] {
  if (noChild(s, at) || (value === "SIGKILL" && s.killAttempted)) return [s, null];
  return [{ ...s, signalAttempts: s.signalAttempts + 1, killAttempted: s.killAttempted || value === "SIGKILL" }, value];
}

function probe(timing: OwnedProcessTiming, s: OwnedProcessState, at: OwnedProcessContext, then: ProbeContinuation, signal: OwnedProcessSignal | null = null): OwnedProcessStep {
  const known = noChild(s, at) ? "absent"
    : timing.platform === "win32" ? (s.directExit === null ? "unknown" : "absent")
    : at.pid === undefined ? "unknown" : null;
  return step(s, signal, { kind: "probe", probe: Object.freeze({ then }), known, pid: at.pid });
}

function check(timing: OwnedProcessTiming, s: OwnedProcessState, at: OwnedProcessContext, signal: OwnedProcessSignal | null = null): OwnedProcessStep {
  const cleared: OwnedProcessState = { ...s, waits: { ...s.waits, probe: null } };
  // An entered assessment still in progress is this re-check: its own result
  // decides against the then-current state, so its kill/deadline duty survives.
  if ((cleared.phase !== "term" && cleared.phase !== "kill") || cleared.probing !== null) return step(cleared, signal);
  return probe(timing, cleared, at, "check", signal);
}

function complete(s: OwnedProcessState): OwnedProcessStep {
  if (s.phase === "complete") return step(s);
  return step({ ...s, phase: "complete", streamsDisposed: true, waits: NO_WAITS, probing: null }, null, { kind: "dispose" }, [{ kind: "seal" }]);
}

function drainOrComplete(timing: OwnedProcessTiming, s: OwnedProcessState, at: OwnedProcessContext): OwnedProcessStep {
  if (s.phase !== "drain") return step(s);
  if (s.closeObserved) return complete(s);
  const drain = { atNs: earlier(at.nowNs + timing.drainNs, s.cleanupDeadlineNs) };
  return step({ ...s, waits: { ...s.waits, drain } });
}

function finishScope(timing: OwnedProcessTiming, s: OwnedProcessState, at: OwnedProcessContext): OwnedProcessStep {
  if (s.phase === "drain" || s.phase === "complete") return step(s);
  const draining: OwnedProcessState = { ...s, phase: "drain", waits: { ...s.waits, phase: null, probe: null } };
  if (draining.scopeAbsence !== "absent") return notifyThen(draining, { kind: "unconfirmed" }, [{ kind: "notified", after: "unconfirmed" }]);
  return drainOrComplete(timing, draining, at);
}

function startKill(timing: OwnedProcessTiming, s: OwnedProcessState, at: OwnedProcessContext): OwnedProcessStep {
  if (s.phase === "kill" || s.phase === "complete") return step(s);
  if (s.phase === "drain") {
    if (s.scopeAbsence === "absent") return step(s);
    const [next, signal] = signalled(s, at, "SIGKILL");
    return step(next, signal);
  }
  return probe(timing, { ...s, phase: "kill", waits: { ...s.waits, phase: null } }, at, "kill");
}

function terminate(timing: OwnedProcessTiming, s: OwnedProcessState, mode: "graceful" | "immediate", at: OwnedProcessContext): OwnedProcessStep {
  if (s.phase === "complete") return step(s);
  if (s.phase !== "live") return mode === "immediate" ? startKill(timing, s, at) : step(s);
  const scope = at.nowNs + 2n * timing.graceNs;
  return probe(timing, { ...s, cleanupStartedNs: at.nowNs, scopeDeadlineNs: scope, cleanupDeadlineNs: scope + timing.drainNs },
    at, mode === "immediate" ? "terminate-immediate" : "terminate-graceful");
}

function probed(timing: OwnedProcessTiming, s: OwnedProcessState, input: Extract<OwnedProcessInput, { kind: "probed" }>, at: OwnedProcessContext): OwnedProcessStep {
  // Counted at entry. A superseded or completed assessment writes no fact and continues nothing.
  // Its observation is obsolete, but an immediate request it carried is not: that
  // request is decided again against the current state, which may already satisfy it.
  if (s.probing !== input.probe) {
    return input.probe.then === "terminate-immediate" ? terminate(timing, s, "immediate", at) : step(s);
  }
  const recorded: OwnedProcessState = { ...s, probing: null, scopeAbsence: input.absence };
  const gone = input.absence === "absent" && (recorded.directExit !== null || noChild(recorded, at));
  switch (input.probe.then) {
    case "terminate-graceful":
    case "terminate-immediate":
      if (recorded.phase !== "live") return step(recorded);
      if (gone) return finishScope(timing, recorded, at);
      if (input.probe.then === "terminate-immediate") return startKill(timing, recorded, at);
      return notifyThen({ ...recorded, phase: "term" }, { kind: "signal", signal: "SIGTERM" }, [{ kind: "notified", after: "term" }]);
    case "kill":
      if (recorded.phase !== "kill") return step(recorded);
      if (gone) return finishScope(timing, recorded, at);
      return notifyThen(recorded, { kind: "signal", signal: "SIGKILL" }, [{ kind: "notified", after: "kill" }]);
    case "check":
      if (recorded.phase !== "term" && recorded.phase !== "kill") return step(recorded);
      if (gone) return finishScope(timing, recorded, at);
      return step({ ...recorded, waits: { ...recorded.waits, probe: { atNs: at.nowNs + timing.probeNs } } });
    case "deadline":
      return finishScope(timing, recorded, at);
  }
}

function notified(timing: OwnedProcessTiming, s: OwnedProcessState, after: "term" | "kill" | "unconfirmed", at: OwnedProcessContext): OwnedProcessStep {
  if (after === "unconfirmed") return drainOrComplete(timing, s, at);
  // A notification may have strengthened, finished or completed this attempt;
  // its obsolete signal and waits are then never performed.
  if (s.phase !== after) return step(s);
  if (after === "term") {
    const [next, signal] = signalled(s, at, "SIGTERM");
    return check(timing, { ...next, waits: { ...next.waits, phase: { atNs: next.cleanupStartedNs! + timing.graceNs } } }, at, signal);
  }
  const [next, signal] = signalled(s, at, "SIGKILL");
  const scopeDeadlineNs = earlier(at.nowNs + timing.graceNs, next.scopeDeadlineNs);
  const cleanupDeadlineNs = earlier(scopeDeadlineNs + timing.drainNs, next.cleanupDeadlineNs);
  return check(timing, { ...next, scopeDeadlineNs, cleanupDeadlineNs, waits: { ...next.waits, phase: { atNs: scopeDeadlineNs } } }, at, signal);
}

/** Pure: the next immutable state plus finite physical actions for the bridge. */
export function transitionOwnedProcess(
  timing: OwnedProcessTiming,
  s: OwnedProcessState,
  input: OwnedProcessInput,
  at: OwnedProcessContext,
): OwnedProcessStep {
  switch (input.kind) {
    case "terminate": return terminate(timing, s, input.mode, at);
    case "fail":
      if (s.sealed) return step(s);
      return terminate(timing, { ...s, firstError: s.firstError ?? input.error,
        streamsDisposed: input.disposal ? false : s.streamsDisposed }, "immediate", at);
    case "launchError":
      return notifyThen({ ...s, launchFailure: s.launchFailure ?? input.error }, { kind: "error", error: input.error },
        [{ kind: "terminate", mode: "graceful" }]);
    case "exit":
      return notifyThen({ ...s, directExit: Object.freeze({ status: input.status, signal: input.signal }) },
        { kind: "exit", status: input.status, signal: input.signal }, [{ kind: "terminate", mode: "graceful" }, { kind: "check" }]);
    case "close": {
      const closed: OwnedProcessState = { ...s, closeObserved: true };
      return closed.phase === "drain" ? complete(closed) : step(closed, null, null, [{ kind: "terminate", mode: "graceful" }, { kind: "check" }]);
    }
    case "check": return check(timing, s, at);
    case "due": {
      if (s.waits[input.wait] !== input.token) return step(s);
      const fired: OwnedProcessState = { ...s, waits: { ...s.waits, [input.wait]: null } };
      if (input.wait === "probe") return check(timing, fired, at);
      if (input.wait === "drain") return complete({ ...fired, drainExpired: true });
      if (fired.phase === "term") return startKill(timing, fired, at);
      return fired.phase === "kill" ? probe(timing, fired, at, "deadline") : step(fired);
    }
    case "probing": return step({ ...s, probeCount: s.probeCount + 1, probing: input.probe });
    case "probed": return probed(timing, s, input, at);
    case "notified": return notified(timing, s, input.after, at);
    case "seal":
      return s.phase === "complete" && !s.sealed ? step({ ...s, sealed: true }, null, { kind: "publish" }) : step(s);
  }
}
