// The pure Event Calculus fold. effectOf and foldStep read ROOT_EVENT_CALCULUS
// and ROOT_DERIVED_RULES from their own modules; no caller supplies an axiom,
// a rule or a callback. RuntimeEventCalculusDerivation in abg/event_calculus.ts
// is the memoized realization of foldStep.
import { isRecord } from "../../shared/admit/index.js";
import { compareUnicodeCodeUnits } from "../../shared/canonical_json.js";
import type { RuntimeEventPrefix, ValidatedRuntimeEventPrefix } from "../event_prefix.js";
import { runtimeEventProfile, type RuntimeEvent } from "../event_store.js";
import { isRuntimeProbeObservation, isRuntimeSystemProbeContract,
  type RuntimeProbeObservation, type RuntimeSystemProbeContract } from "../runtime_liveness_contracts.js";
import {
  axiomEffectOf,
  completeEffect,
  frameProbeScopeKey,
  ownedExactRuntimeFluentPatternRef,
  ownedRuntimeFluentMatchesPattern,
  ownedRuntimeFluentPatternKey,
  runtimeFluentKey,
  runtimeFluentPatternKey,
  type EventCalculusEffect,
  type RuntimeEventCalculusProjection,
  type RuntimeFluent,
  type RuntimeFluentPattern,
} from "./axioms.js";
import { ROOT_DERIVED_RULES } from "./rules.js";

/** The fluents that hold at one cut: fluent ref to fluent. */
export type HoldsAt = ReadonlyMap<string, RuntimeFluent>;

/** @internal The same fold, without complete historical effect bodies. */
export type RuntimeHeldFluentProjection = Pick<RuntimeEventCalculusProjection, "holds">;

export interface FoldFluentTransition {
  readonly fluent: RuntimeFluent;
  readonly held: boolean;
  readonly runId?: string;
}

export interface FoldProbeFact {
  readonly ordinal: number;
  readonly actor: string | null;
  readonly target: "frame" | "call" | null;
  readonly key: string;
  readonly digest: string;
}

export interface FoldInterruptionFact {
  readonly ordinal: number;
  readonly digest: string;
}

/** The record of the last step: its effect, its fluent transitions in applied
 * order, and the probe and interruption facts it captured. */
export interface FoldTransition {
  readonly eventKind: RuntimeEvent["kind"];
  readonly sourceEventRef: string;
  readonly ordinal: number;
  readonly effect: EventCalculusEffect;
  readonly fluents: readonly FoldFluentTransition[];
  readonly clipped: readonly string[];
  readonly declipped: readonly string[];
  readonly probe: FoldProbeFact | null;
  readonly interruption: FoldInterruptionFact | null;
}

/** The fold carrier at one prefix cut. Its subordinate facts have no identity,
 * admission or lifecycle of their own; the state is recomputed from the log. */
export interface FoldState {
  readonly kind: "event_calculus_fold_state";
  /** @internal The admitted prefix this fold reads: event lookup by reference,
   * the cut before each event, and the liveness source relation. */
  readonly source: RuntimeEventPrefix | null;
  readonly holds: HoldsAt;
  readonly ordinal: number;
  readonly transition: FoldTransition | null;
  readonly contextualFluentRunIds: ReadonlyMap<string, string>;
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
  readonly interruptedScopes: ReadonlySet<string>;
  readonly frameProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly cCallProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly actorProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
}

const NO_FLUENTS: HoldsAt = new Map();
const NO_RUNS: ReadonlyMap<string, string> = new Map();
const NO_SCOPES: ReadonlySet<string> = new Set();
const NO_SCOPE_MAP: ReadonlyMap<string, ReadonlySet<string>> = new Map();

/** The empty fold over one admitted prefix. */
export function emptyFoldState(source: ValidatedRuntimeEventPrefix | null): FoldState;
/** @internal */
export function emptyFoldState(source: RuntimeEventPrefix | null): FoldState;
export function emptyFoldState(source: RuntimeEventPrefix | null): FoldState {
  return Object.freeze({
    kind: "event_calculus_fold_state" as const,
    source,
    holds: NO_FLUENTS,
    ordinal: 0,
    transition: null,
    contextualFluentRunIds: NO_RUNS,
    clippedFluentRefs: Object.freeze([]),
    declippedPatternRefs: Object.freeze([]),
    interruptedScopes: NO_SCOPES,
    frameProbeScopes: NO_SCOPE_MAP,
    cCallProbeScopes: NO_SCOPE_MAP,
    actorProbeScopes: NO_SCOPE_MAP,
  });
}

/** The axiom effect and every applicable rule effect of one event. Rules
 * derive from the state before the event; the axiom effect comes first. */
export function effectOf(state: FoldState, event: RuntimeEvent, dependencies: readonly RuntimeEvent[]): EventCalculusEffect {
  const derived = ROOT_DERIVED_RULES.filter(rule => rule.appliesTo.includes(event.kind))
    .map(rule => rule.derive(state, event, dependencies));
  const axiom = axiomEffectOf(event, dependencies, state.source === null ? undefined : {
    source: state.source,
    interruptedScopes: state.interruptedScopes,
    frameProbeScopes: state.frameProbeScopes,
    cCallProbeScopes: state.cCallProbeScopes,
  });
  if (derived.length === 0) return axiom;
  const parts = [axiom, ...derived];
  return completeEffect({
    initiates: parts.flatMap(part => part.initiates),
    terminates: parts.flatMap(part => part.terminates),
    clips: parts.flatMap(part => part.clips),
    declips: parts.flatMap(part => part.declips),
  });
}

/** @internal A fold state under construction: the members of FoldState in
 * mutable carriers, changed in place by applyStep. */
export interface WorkingFoldState {
  readonly kind: "event_calculus_fold_state";
  source: RuntimeEventPrefix | null;
  readonly holds: Map<string, RuntimeFluent>;
  ordinal: number;
  transition: FoldTransition | null;
  readonly contextualFluentRunIds: Map<string, string>;
  readonly clippedFluentRefs: string[];
  readonly declippedPatternRefs: string[];
  readonly interruptedScopes: Set<string>;
  readonly frameProbeScopes: Map<string, Set<string>>;
  readonly cCallProbeScopes: Map<string, Set<string>>;
  readonly actorProbeScopes: Map<string, Set<string>>;
}

function copyScopes(map: ReadonlyMap<string, ReadonlySet<string>>): Map<string, Set<string>> {
  return new Map([...map].map(([key, digests]) => [key, new Set(digests)]));
}

/** @internal A working copy of `state` over `source`. Every carrier is copied,
 * so applying steps to the copy never changes `state` or a shared constant. */
export function workingFoldState(state: FoldState, source: RuntimeEventPrefix | null = state.source): WorkingFoldState {
  return {
    kind: "event_calculus_fold_state",
    source,
    holds: new Map(state.holds),
    ordinal: state.ordinal,
    transition: state.transition,
    contextualFluentRunIds: new Map(state.contextualFluentRunIds),
    clippedFluentRefs: [...state.clippedFluentRefs],
    declippedPatternRefs: [...state.declippedPatternRefs],
    interruptedScopes: new Set(state.interruptedScopes),
    frameProbeScopes: copyScopes(state.frameProbeScopes),
    cCallProbeScopes: copyScopes(state.cCallProbeScopes),
    actorProbeScopes: copyScopes(state.actorProbeScopes),
  };
}

/** @internal The frozen FoldState of a working copy; the copy takes no
 * further step. */
export function frozenFoldState(working: WorkingFoldState): FoldState {
  return Object.freeze({
    ...working,
    clippedFluentRefs: Object.freeze(working.clippedFluentRefs),
    declippedPatternRefs: Object.freeze(working.declippedPatternRefs),
  });
}

function addScope(map: Map<string, Set<string>>, key: string, digest: string): void {
  const digests = map.get(key);
  if (digests === undefined) map.set(key, new Set([digest]));
  else digests.add(digest);
}

/** @internal One clip pattern applied in place to `holds`: each held fluent
 * the pattern matches is clipped, in held order, its transition appended to
 * `fluents` and its ref to `clipped`. An exact pattern reads its one key; a
 * wildcard enumerates `holds`. The enumeration reads the live map: deleting
 * the current entry during a Map iteration neither skips nor repeats a later
 * entry, and the loop adds none. */
export function applyClip(holds: Map<string, RuntimeFluent>, pattern: RuntimeFluentPattern,
  fluents: FoldFluentTransition[], clipped: string[]): void {
  const ref = ownedExactRuntimeFluentPatternRef(pattern);
  const held = ref === null ? undefined : holds.get(ref);
  const candidates: Iterable<readonly [string, RuntimeFluent]> =
    ref === null ? holds : held === undefined ? [] : [[ref, held]];
  for (const [key, fluent] of candidates) {
    if (ownedRuntimeFluentMatchesPattern(fluent, pattern)) {
      fluents.push({ fluent, held: false });
      holds.delete(key);
      clipped.push(key);
    }
  }
}

/** @internal One step applied in place: terminates, clips, declips, then
 * initiates, and the probe and interruption facts of the event. The effect,
 * the declip keys and the event's facts are computed before any change, so a
 * refused step leaves `working` as it was. Returns the step's transition. */
export function applyStep(working: WorkingFoldState, event: RuntimeEvent, dependencies: readonly RuntimeEvent[]): FoldTransition {
  const effect = effectOf(working, event, dependencies);
  const declipped = effect.declips.map(ownedRuntimeFluentPatternKey);
  // A native observation has just completed its exact liveness source
  // relation. Other profiles retain the raw contract guards used by the
  // exported effect helper. Later closures consume only these scoped facts.
  let probe: FoldProbeFact | null = null;
  if (event.kind === "runtime_activity_probe_observed" && isRecord(event.payload) &&
      (runtimeEventProfile(event)?.nativeLiveness === true ||
        isRuntimeSystemProbeContract(event.payload.probeContract) && isRuntimeProbeObservation(event.payload.observation))) {
    const contract = event.payload.probeContract as unknown as RuntimeSystemProbeContract;
    const observation = event.payload.observation as unknown as RuntimeProbeObservation;
    const { scope } = contract;
    const actor = typeof event.payload.actorInvocationRef === "string" ? event.payload.actorInvocationRef : null;
    const target = scope.cCallRef !== null ? "call" as const : scope.actorInvocationRef === null ? "frame" as const : null;
    const key = scope.cCallRef ?? frameProbeScopeKey(scope);
    probe = Object.freeze({ ordinal: event.admissionOrdinal, actor, target, key, digest: observation.scopeDigest });
  }
  let interruption: FoldInterruptionFact | null = null;
  if (event.kind === "runtime_external_interruption_observed" && isRecord(event.payload) &&
      isRuntimeProbeObservation(event.payload.observation)) {
    interruption = Object.freeze({ ordinal: event.admissionOrdinal, digest: event.payload.observation.scopeDigest });
  }
  const { holds, contextualFluentRunIds: runIds } = working;
  const fluents: FoldFluentTransition[] = [];
  for (const fluent of effect.terminates) {
    fluents.push({ fluent, held: false });
    holds.delete(fluent.fluentRef);
    runIds.delete(fluent.fluentRef);
  }
  const clipped: string[] = [];
  for (const pattern of effect.clips) applyClip(holds, pattern, fluents, clipped);
  for (const fluent of effect.initiates) {
    fluents.push(event.runId === undefined ? { fluent, held: true } : { fluent, held: true, runId: event.runId });
    holds.set(fluent.fluentRef, fluent);
    if (event.runId !== undefined) runIds.set(fluent.fluentRef, event.runId);
  }
  if (probe !== null) {
    if (probe.actor !== null) addScope(working.actorProbeScopes, probe.actor, probe.digest);
    if (probe.target === "call") addScope(working.cCallProbeScopes, probe.key, probe.digest);
    if (probe.target === "frame") addScope(working.frameProbeScopes, probe.key, probe.digest);
  }
  if (interruption !== null) working.interruptedScopes.add(interruption.digest);
  working.clippedFluentRefs.push(...clipped);
  working.declippedPatternRefs.push(...declipped);
  working.ordinal = event.admissionOrdinal;
  working.transition = Object.freeze({
    eventKind: event.kind,
    sourceEventRef: event.eventId,
    ordinal: event.admissionOrdinal,
    effect,
    fluents: Object.freeze(fluents),
    clipped: Object.freeze(clipped),
    declipped: Object.freeze(declipped),
    probe,
    interruption,
  });
  return working.transition;
}

/** One step: the state is copied once and the step applied to the copy
 * (applyStep). The input state is not changed. */
export function foldStep(state: FoldState, event: RuntimeEvent, dependencies: readonly RuntimeEvent[]): FoldState {
  const working = workingFoldState(state);
  applyStep(working, event, dependencies);
  return frozenFoldState(working);
}

function isFoldState(value: FoldState | RuntimeHeldFluentProjection): value is FoldState {
  return (value as Partial<FoldState>).kind === "event_calculus_fold_state";
}

/** The only admitted reader of a lifecycle fact. With a fluent, whether it
 * holds; with a pattern, every holding fluent it matches, ordered by ref. */
export function holdsAt(projection: RuntimeEventCalculusProjection, fluent: RuntimeFluent): boolean;
/** @internal */
export function holdsAt(projection: RuntimeHeldFluentProjection, fluent: RuntimeFluent): boolean;
export function holdsAt(state: FoldState | RuntimeEventCalculusProjection, pattern: RuntimeFluentPattern): readonly RuntimeFluent[];
/** @internal */
export function holdsAt(projection: RuntimeHeldFluentProjection, pattern: RuntimeFluentPattern): readonly RuntimeFluent[];
export function holdsAt(
  source: FoldState | RuntimeHeldFluentProjection,
  query: RuntimeFluent | RuntimeFluentPattern,
): boolean | readonly RuntimeFluent[] {
  if (query.kind === "runtime_fluent") {
    const key = runtimeFluentKey(query);
    return isFoldState(source)
      ? source.holds.has(key)
      : source.holds.some((candidate) => runtimeFluentKey(candidate) === key);
  }
  runtimeFluentPatternKey(query);
  const values = isFoldState(source)
    ? [...source.holds.values()].sort((left, right) => compareUnicodeCodeUnits(left.fluentRef, right.fluentRef))
    : source.holds.filter((candidate) => runtimeFluentKey(candidate).length > 0);
  return Object.freeze(values.filter((fluent) => ownedRuntimeFluentMatchesPattern(fluent, query)));
}
