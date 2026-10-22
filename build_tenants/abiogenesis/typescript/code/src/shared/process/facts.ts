// The `shared/process/` family (design §4.6): the owner's reporting choice at
// the physical boundary and the one encoding of the facts as admitted evidence.
// Pure: no I/O, no clock, no process authority. Not a lifecycle read; only
// `holdsAt` answers a lifecycle question (design §9.1).
import type { JsonValue } from "../canonical_json.js";
import { deepFreeze } from "../immutable.js";
import type { OwnedProcessFacts } from "../owned_process_lifetime.js";

/** The three terminal outcomes an owner reports from its facts, once. */
export type OwnedProcessTerminal = "spawn_failed" | "exited" | "unconfirmed";

/** The owned process is gone at the physical observation: its scope is absent
 * and its direct exit was observed. A launch with no child is never one. */
export function hasConfirmedOwnedProcessBoundary(facts: OwnedProcessFacts): boolean {
  return facts.scopeAbsence === "absent" && facts.directExit !== null;
}

/** The one three-outcome report: a spawn failure when no child was
 * established, an exit for a confirmed boundary, unconfirmed otherwise. */
export function classifyOwnedProcessTerminal(facts: OwnedProcessFacts): OwnedProcessTerminal {
  if (facts.scopeAbsence === "absent" && facts.noChildEstablished && facts.launchFailure !== null) {
    return "spawn_failed";
  }
  return hasConfirmedOwnedProcessBoundary(facts) ? "exited" : "unconfirmed";
}

// A member of an Error description is a string or null. Node's numeric
// `errno` keeps its value as base-10 digits; any other value is null.
function errorMember(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function encodeError(error: Error | null): JsonValue {
  if (error === null) return null;
  const members = error as Error & Readonly<Partial<Record<"code" | "errno" | "syscall" | "path", unknown>>>;
  return {
    name: errorMember(members.name),
    message: errorMember(members.message),
    code: errorMember(members.code),
    errno: errorMember(members.errno),
    syscall: errorMember(members.syscall),
    path: errorMember(members.path),
  };
}

/** The members of the encoding below, in default string sort. A reader that
 * checks an encoding's exact keys takes this list. */
export const OWNED_PROCESS_FACT_MEMBERS = Object.freeze([
  "cleanupDeadlineNs", "cleanupElapsedMs", "closeObserved", "directExit", "drainExpired", "firstError",
  "launchFailure", "noChildEstablished", "probeCount", "scopeAbsence", "scopeKind", "signalAttempts",
  "streamsDisposed",
] as const);

/** The one encoding of the facts as admitted evidence. Every member keeps its
 * name; an Error is described without `stack`; the bigint is tagged. */
export function encodeOwnedProcessFacts(facts: OwnedProcessFacts): JsonValue {
  return deepFreeze({
    directExit: facts.directExit === null ? null : { status: facts.directExit.status, signal: facts.directExit.signal },
    launchFailure: encodeError(facts.launchFailure),
    noChildEstablished: facts.noChildEstablished,
    scopeKind: facts.scopeKind,
    scopeAbsence: facts.scopeAbsence,
    closeObserved: facts.closeObserved,
    streamsDisposed: facts.streamsDisposed,
    drainExpired: facts.drainExpired,
    firstError: encodeError(facts.firstError),
    cleanupDeadlineNs: facts.cleanupDeadlineNs === null ? null
      : { kind: "bigint", value: facts.cleanupDeadlineNs.toString(10) },
    cleanupElapsedMs: facts.cleanupElapsedMs,
    probeCount: facts.probeCount,
    signalAttempts: facts.signalAttempts,
  });
}
