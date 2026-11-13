import { isRecord } from "../shared/admission_predicates.js";
import { runtimeEventAtPrefixIndex, indexedRuntimeEvents } from "./event_prefix.js";
import {
  compareUnicodeCodeUnits,
} from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isWorksiteFileReplaceRequest,
  isWorksitePostPublicationFailure,
  type WorksiteFileReplaceRequest,
} from "../product/worksite_effect.js";
import {
  runtimeEventValidationBase,
  runtimeEventAtPrefix,
  runtimeEventPrefixExtent,
  validatedRuntimeEventPrefixBeforeEvent,
  type RuntimeEventPrefix,
  runtimePrefixComputation,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { RuntimeEvent } from "./event_store.js";
import { projectWorksiteSelectedOccurrence, worksiteSelectedOccurrenceDependencies, worksiteFailureResultDependencies } from "./c_call_outcome.js";
import { WORKSITE_C0_IDS } from "../gtl/worksite_c0.js";
import { isNativeWorkspaceWorkObservation, isNativeWorkspaceWorkFailure } from "../product/native_workspace_work.js";
import { worksiteCommandSourcesInvalidatedAfter } from "./native_worksite_execution.js";
import type { CCall } from "./c_call.js";
import { nativeWorkUnknownEffectDependencies } from "./native_work_effect.js";
import { canonicalEquals } from "../shared/value/index.js";
import {
  constructWorksiteObservationCurrentFluent,
  emptyFoldState,
  runtimeFluentKey,
  type EventCalculusEffect,
  type FoldInterruptionFact,
  type FoldProbeFact,
  type FoldState,
  type FoldTransition,
  type RuntimeEventCalculusEffectRow,
  type RuntimeEventCalculusProjection,
  type RuntimeFluent,
} from "./calculus/index.js";
import { stringArrayField } from "./calculus/axioms.js";
import { applyStep, workingFoldState, type WorkingFoldState } from "./calculus/fold.js";

// The Event Calculus law (carriers, ROOT_EVENT_CALCULUS, ROOT_DERIVED_RULES
// and the pure fold) lives in abg/calculus/. This module re-exports its
// existing public names and keeps the memoized realization of foldStep.
export {
  constructRetryFluentIdentity,
  constructRunActiveFluent,
  constructRunClosedFluent,
  constructRunTerminalFluent,
  constructRuntimeFluent,
  constructRuntimeFluentPattern,
  constructScopedRetryFluent,
  constructWorksiteObservationCurrentFluent,
  declaredRuntimeEventCalculusTerminationNames,
  eventCalculusEffect,
  holdsAt,
  projectNativeWorkRetiredObservations,
  projectWorksiteTransitionForResult,
  ROOT_EVENT_CALCULUS,
  runtimeFluentKey,
  runtimeFluentMatchesPattern,
  runtimeFluentPatternKey,
  validateRuntimeEventCalculusAxiomKindsForModuleTest,
  validateRuntimeEventCalculusEffectForModuleTest,
  type EventCalculusEffect,
  type RetryFluentIdentityCoordinates,
  type RetryFluentName,
  type RuntimeEventCalculusEffectRow,
  type RuntimeEventCalculusProjection,
  type RuntimeFluent,
  type RuntimeFluentInput,
  type RuntimeFluentPattern,
  type RuntimeFluentPatternInput,
} from "./calculus/index.js";


const EVENT_CALCULUS_DERIVATION = Symbol("ordered_event_calculus_derivation");

/** The same fold serves cold input, suffix advancement and historical facts.
 * A scope is issued only for exact immutable prefix extensions; rollback drops
 * the store's source. No materialized projection is mutable admission truth. */
interface RuntimeEffectFact extends EventCalculusEffect {
  readonly eventKind: RuntimeEvent["kind"]; readonly sourceEventRef: string; readonly ordinal: number;
}
/** @internal The same exact transition dependencies serve the fold and replay,
 * for every prefix kind: the rows the event's transition reads, selected from
 * the cut before the event. The cut is taken only when a selector is read. */
export function eventCalculusDependencies(prefix: RuntimeEventPrefix, event: RuntimeEvent): readonly RuntimeEvent[] {
  const unknownEffect = event.kind === "actor_process_termination_unconfirmed" ||
    (event.kind === "actor_invocation_failed" && isRecord(event.payload) && event.payload.failureClass === "transport_exception");
  const unknownDependencies = unknownEffect ? nativeWorkUnknownEffectDependencies(prefix, event) : [];
  if (unknownEffect && unknownDependencies.length === 0) return [];
  let cut: RuntimeEventPrefix | undefined;
  const before = () => cut ??= validatedRuntimeEventPrefixBeforeEvent(prefix, event.eventId);
  const selected = new Map<string, RuntimeEvent>();
  const add = (key: string) => { for (const row of indexedRuntimeEvents(before(), key)) selected.set(row.eventId, row); };
  const addPhysicalDependencies = () => {
    add("worksite-observation-dependency");
    for (const cause of indexedRuntimeEvents(before(), "worksite-observation-dependency")) {
      if (cause.kind === "c_call_fibre_selected")
        for (const row of worksiteSelectedOccurrenceDependencies(before(), cause)) selected.set(row.eventId, row);
      if (cause.kind === "c_call_result_admitted") {
        add("aggregate:c_call:" + cause.aggregateId);
        for (const row of worksiteFailureResultDependencies(before(), cause)) selected.set(row.eventId, row);
      }
      if (cause.kind === "actor_invocation_failed" || cause.kind === "actor_process_termination_unconfirmed")
        for (const row of nativeWorkUnknownEffectDependencies(before(), cause)) selected.set(row.eventId, row);
    }
  };
  const payload = isRecord(event.payload) ? event.payload : null;
  if (event.kind === "basis_admitted" && payload !== null) {
    if (isWorksiteFileReplaceRequest(payload.rawInputValue)) addPhysicalDependencies();
    if (typeof payload.invocationAdmissionRef === "string") add("payload:invocationAdmissionRef:" + payload.invocationAdmissionRef);
    if (typeof payload.parentExecutionBasisRef === "string") add("basis:" + payload.parentExecutionBasisRef);
    if (typeof payload.parentCCallRef === "string") add("aggregate:c_call:" + payload.parentCCallRef);
  } else if (event.kind === "c_call_fibre_selected") {
    for (const row of worksiteSelectedOccurrenceDependencies(prefix, event)) selected.set(row.eventId, row);
    add("worksite-observation-dependency");
  } else if (event.kind === "c_call_result_admitted") {
    add("aggregate:c_call:" + event.aggregateId);
    if (payload?.contractRef === WORKSITE_C0_IDS.outputContractRef)
      add("worksite-observation-dependency");
    if (payload?.contractRef === WORKSITE_C0_IDS.failureContractRef && isWorksitePostPublicationFailure(payload.value)) {
      for (const row of worksiteFailureResultDependencies(prefix, event)) selected.set(row.eventId, row);
      add("worksite-observation-dependency");
    }
    if (isNativeWorkspaceWorkObservation(payload?.value) || isNativeWorkspaceWorkFailure(payload?.value))
      add("worksite-observation-dependency");
  } else if (unknownEffect) {
    for (const row of unknownDependencies) selected.set(row.eventId, row);
    add("worksite-observation-dependency");
  } else if (event.kind === "traversal_route_admitted") {
    for (const ref of stringArrayField(event, "consumedAvailabilityRefs"))
      if (ref.startsWith("retry-progress://")) add("payload:progressRef:" + ref);
  }
  return [...selected.values()].sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
}
/** The memoized realization of foldStep: it owns one working fold state,
 * advanced in place, and records every step's transition for historical cuts
 * and forks. The empty state shares module constants, so the owned state
 * starts from its own copy; forkAt is the only other copy. Each step reads its
 * dependencies from the prefix (eventCalculusDependencies), and nothing else
 * is carried beside it, so a fork advanced from a cut folds as its base did. */
class RuntimeEventCalculusDerivation {
  state: WorkingFoldState = workingFoldState(emptyFoldState(null));
  readonly effectRows: RuntimeEffectFact[] = [];
  readonly effectByEvent = new Map<string, RuntimeEffectFact>();
  readonly clippedFluentRefs: string[] = [];
  readonly declippedPatternRefs: string[] = [];
  private base: RuntimeEventCalculusDerivation | undefined;
  private baseCount = 0;
  private baseOrdinal = 0;
  readonly probeFacts: FoldProbeFact[] = [];
  readonly interruptionFacts: FoldInterruptionFact[] = [];
  private get effectCount(): number { return this.baseCount + this.effectRows.length; }
  private *factsThrough(count: number): Iterable<RuntimeEffectFact> {
    if (this.base !== undefined) yield* this.base.factsThrough(Math.min(count, this.baseCount));
    yield* this.effectRows.slice(0, Math.max(0, count - this.baseCount));
  }
  effectAtRef(ref: string): RuntimeEffectFact | undefined {
    const own = this.effectByEvent.get(ref);
    if (own !== undefined) return own;
    const fact = this.base?.effectAtRef(ref);
    return fact !== undefined && fact.ordinal <= this.baseOrdinal ? fact : undefined;
  }
  private clipCountAt(count: number): number { return count < this.baseCount ? this.base!.clipCountAt(count) : this.clipCounts[count - this.baseCount]!; }
  private declipCountAt(count: number): number { return count < this.baseCount ? this.base!.declipCountAt(count) : this.declipCounts[count - this.baseCount]!; }
  private clippedAt(count: number): string[] {
    return [...(this.base?.clippedAt(Math.min(count, this.baseCount)) ?? []),
      ...this.clippedFluentRefs.slice(0, this.clipCountAt(count) - this.clipCounts[0]!)];
  }
  private declippedAt(count: number): string[] {
    return [...(this.base?.declippedAt(Math.min(count, this.baseCount)) ?? []),
      ...this.declippedPatternRefs.slice(0, this.declipCountAt(count) - this.declipCounts[0]!)];
  }
  private fluentKeys(): Iterable<string> {
    return new Set([...(this.base?.fluentKeys() ?? []), ...this.transitions.keys()]);
  }
  private *allProbeFacts(): Iterable<FoldProbeFact> {
    if (this.base !== undefined) for (const fact of this.base.allProbeFacts()) if (fact.ordinal <= this.baseOrdinal) yield fact;
    yield* this.probeFacts;
  }
  private *allInterruptionFacts(): Iterable<FoldInterruptionFact> {
    if (this.base !== undefined) for (const fact of this.base.allInterruptionFacts()) if (fact.ordinal <= this.baseOrdinal) yield fact;
    yield* this.interruptionFacts;
  }
  forkAt(prefix: RuntimeEventPrefix): RuntimeEventCalculusDerivation {
    const fork = new RuntimeEventCalculusDerivation();
    const extent = runtimeEventPrefixExtent(prefix);
    fork.base = this; fork.baseCount = extent.count; fork.baseOrdinal = extent.lastOrdinal;
    fork.clipCounts[0] = this.clipCountAt(extent.count); fork.declipCounts[0] = this.declipCountAt(extent.count);
    const holds = new Map<string, RuntimeFluent>(), runIds = new Map<string, string>();
    for (const fluent of this.held(prefix)) {
      holds.set(fluent.fluentRef, fluent);
      const run = this.fluentRunAt(fluent.fluentRef, extent.lastOrdinal);
      if (run !== undefined) runIds.set(fluent.fluentRef, run);
    }
    const scopes = { actor: new Map<string, Set<string>>(), call: new Map<string, Set<string>>(), frame: new Map<string, Set<string>>() };
    const add = (target: Map<string, Set<string>>, key: string, digest: string) => {
      const known = target.get(key) ?? new Set<string>(); known.add(digest); target.set(key, known);
    };
    for (const fact of this.allProbeFacts()) if (fact.ordinal <= extent.lastOrdinal) {
      if (fact.actor !== null) add(scopes.actor, fact.actor, fact.digest);
      if (fact.target !== null) add(scopes[fact.target], fact.key, fact.digest);
    }
    const interruptedScopes = new Set<string>();
    for (const fact of this.allInterruptionFacts()) if (fact.ordinal <= extent.lastOrdinal) interruptedScopes.add(fact.digest);
    fork.state = workingFoldState(Object.freeze({ ...emptyFoldState(null), holds, ordinal: extent.lastOrdinal, contextualFluentRunIds: runIds,
      clippedFluentRefs: Object.freeze(this.clippedAt(extent.count)), declippedPatternRefs: Object.freeze(this.declippedAt(extent.count)),
      interruptedScopes, frameProbeScopes: scopes.frame, cCallProbeScopes: scopes.call, actorProbeScopes: scopes.actor }));
    return fork;
  }
  private fluentRunAt(key: string, ordinal: number): string | undefined {
    const rows = this.transitions.get(key) ?? [];
    let low = 0, high = rows.length;
    while (low < high) { const mid = (low + high) >>> 1; if (rows[mid]!.ordinal <= ordinal) low = mid + 1; else high = mid; }
    return low > 0 ? rows[low - 1]!.runId : this.base?.fluentRunAt(key, Math.min(ordinal, this.baseOrdinal));
  }
  readonly clipCounts = [0];
  readonly declipCounts = [0];
  readonly transitions = new Map<string, { ordinal: number; fluent: RuntimeFluent | null; runId?: string }[]>();
  private materialized: { count: number; projection: RuntimeEventCalculusProjection } | undefined;
  recordFluent(fluent: RuntimeFluent, ordinal: number, held: boolean, runId?: string): void {
    const key = fluent.fluentRef, rows = this.transitions.get(key) ?? [];
    rows.push({ ordinal, fluent: held ? fluent : null, ...(runId === undefined ? {} : { runId }) }); this.transitions.set(key, rows);
  }
  fluentAt(key: string, ordinal: number): RuntimeFluent | null {
    const rows = this.transitions.get(key) ?? [];
    let low = 0, high = rows.length;
    while (low < high) { const middle = (low + high) >>> 1; if (rows[middle]!.ordinal <= ordinal) low = middle + 1; else high = middle; }
    return low > 0 ? rows[low - 1]!.fluent : this.base?.fluentAt(key, Math.min(ordinal, this.baseOrdinal)) ?? null;
  }
  /** For each event after the folded count, the step of foldStep applied in
   * place (applyStep) to the owned state; nothing is copied. The source is
   * this call's prefix and is set only when the call advances: a nested read
   * of an earlier cut during a step returns before that assignment and reads
   * the owned state at the folded count. A refused step leaves the state at
   * the folded count. */
  advance(prefix: RuntimeEventPrefix): void {
    const count = runtimeEventPrefixExtent(prefix).count;
    if (this.effectCount >= count) return;
    this.state.source = prefix;
    for (let index = this.effectCount; index < count; index++) {
      const event = runtimeEventAtPrefixIndex(prefix, index)!;
      const dependencies = eventCalculusDependencies(prefix, event);
      this.memoize(applyStep(this.state, event, dependencies), event);
    }
  }
  private memoize(transition: FoldTransition, event: RuntimeEvent): void {
    for (const row of transition.fluents) this.recordFluent(row.fluent, transition.ordinal, row.held, row.runId);
    this.clippedFluentRefs.push(...transition.clipped);
    this.declippedPatternRefs.push(...transition.declipped);
    this.effectRows.push(deepFreeze({ eventKind: event.kind, sourceEventRef: event.eventId,
      ordinal: event.admissionOrdinal, ...transition.effect }));
    this.effectByEvent.set(event.eventId, this.effectRows.at(-1)!);
    this.clipCounts.push(this.clipCounts[0]! + this.clippedFluentRefs.length);
    this.declipCounts.push(this.declipCounts[0]! + this.declippedPatternRefs.length);
    if (transition.probe !== null) this.probeFacts.push(transition.probe);
    if (transition.interruption !== null) this.interruptionFacts.push(transition.interruption);
  }
  project(prefix: RuntimeEventPrefix): RuntimeEventCalculusProjection {
    const { count, lastOrdinal: ordinal } = runtimeEventPrefixExtent(prefix);
    if (prefix.kind === "validated_runtime_event_prefix" && this.materialized?.count === count) return this.materialized.projection;
    const holds = count === this.effectCount ? [...this.state.holds.values()] :
      [...this.fluentKeys()].flatMap(key => { const fluent = this.fluentAt(key, ordinal); return fluent === null ? [] : [fluent]; });
    const projection = deepFreeze({ kind: "event_calculus_projection" as const,
      holds: holds.sort((left, right) => compareUnicodeCodeUnits(left.fluentRef, right.fluentRef)),
      effectRows: Array.from(this.factsThrough(count), fact => {
        const { sourceEventRef, ordinal: _ordinal, ...effect } = fact;
        return { kind: "event_calculus_effect_row" as const, ...effect, sourceEvent: runtimeEventAtPrefix(prefix, sourceEventRef)! };
      }),
      clippedFluentRefs: this.clippedAt(count),
      declippedPatternRefs: this.declippedAt(count),
    }) as RuntimeEventCalculusProjection;
    if (prefix.kind === "validated_runtime_event_prefix") this.materialized = { count, projection }; return projection;
  }
  held(prefix: RuntimeEventPrefix): readonly RuntimeFluent[] {
    const { count, lastOrdinal } = runtimeEventPrefixExtent(prefix);
    const values = count === this.effectCount ? [...this.state.holds.values()] :
      [...this.fluentKeys()].flatMap(key => { const fluent = this.fluentAt(key, lastOrdinal); return fluent === null ? [] : [fluent]; });
    return Object.freeze(values.sort((left, right) => compareUnicodeCodeUnits(left.fluentRef, right.fluentRef)));
  }
}

function eventCalculusDerivation(prefix: RuntimeEventPrefix): RuntimeEventCalculusDerivation {
  const derivation = runtimePrefixComputation(prefix, EVENT_CALCULUS_DERIVATION, () => {
    const base = runtimeEventValidationBase(prefix);
    return base === undefined ? new RuntimeEventCalculusDerivation() : eventCalculusDerivation(base).forkAt(base);
  });
  derivation.advance(prefix); return derivation;
}
/** @internal Module test: the warm fork of the derivation of `source` at
 * `cut`, advanced through `through` (default `cut`) and projected there. A
 * fork advances only over a selected prefix, as in production. */
export function forkRuntimeEventCalculusAtForModuleTest(source: RuntimeEventPrefix, cut: RuntimeEventPrefix,
  through: RuntimeEventPrefix = cut): RuntimeEventCalculusProjection {
  const fork = eventCalculusDerivation(source).forkAt(cut);
  fork.advance(through);
  return fork.project(through);
}
/** @internal Module test: the fold state the derivation of `prefix` holds
 * after advancing to it. No barrel re-exports it. */
export function runtimeEventCalculusStateForModuleTest(prefix: RuntimeEventPrefix): FoldState {
  return eventCalculusDerivation(prefix).state;
}
export function deriveRuntimeEventCalculusProjection(prefix: ValidatedRuntimeEventPrefix): RuntimeEventCalculusProjection;
/** @internal Explicit complete projection; the private fold does not retain its output. */
export function deriveRuntimeEventCalculusProjection(prefix: RuntimeEventPrefix): RuntimeEventCalculusProjection;
export function deriveRuntimeEventCalculusProjection(prefix: RuntimeEventPrefix): RuntimeEventCalculusProjection {
  return eventCalculusDerivation(prefix).project(prefix);
}
/** @internal The same authenticated fold, without complete historical effect bodies. */
export type RuntimeHeldFluentProjection = Pick<RuntimeEventCalculusProjection, "holds">;
/** @internal */
export function deriveRuntimeHeldFluentProjection(prefix: RuntimeEventPrefix): RuntimeHeldFluentProjection {
  return Object.freeze({ holds: eventCalculusDerivation(prefix).held(prefix) });
}
/** Select the required owner effects without materializing every effect row. */
export function runtimeEventCalculusEffectsByKind(prefix: ValidatedRuntimeEventPrefix, kind: RuntimeEvent["kind"]): readonly RuntimeEventCalculusEffectRow[];
/** @internal */
export function runtimeEventCalculusEffectsByKind(prefix: RuntimeEventPrefix, kind: RuntimeEvent["kind"]): readonly RuntimeEventCalculusEffectRow[];
export function runtimeEventCalculusEffectsByKind(prefix: RuntimeEventPrefix, kind: RuntimeEvent["kind"]): readonly RuntimeEventCalculusEffectRow[] {
  const derivation = eventCalculusDerivation(prefix);
  return indexedRuntimeEvents(prefix, "kind:" + kind).map(event => {
    const { sourceEventRef: _ref, ordinal: _ordinal, ...effect } = derivation.effectAtRef(event.eventId)!;
    return deepFreeze({ kind: "event_calculus_effect_row" as const, ...effect, sourceEvent: event });
  });
}
/** Exact historical availability without manufacturing a historical projection. */
export function runtimeFluentHoldsAtPrefix(prefix: ValidatedRuntimeEventPrefix, fluent: RuntimeFluent, ordinal?: number): boolean;
/** @internal */
export function runtimeFluentHoldsAtPrefix(prefix: RuntimeEventPrefix, fluent: RuntimeFluent, ordinal?: number): boolean;
export function runtimeFluentHoldsAtPrefix(prefix: RuntimeEventPrefix, fluent: RuntimeFluent,
  ordinal = runtimeEventPrefixExtent(prefix).lastOrdinal): boolean {
  if (ordinal > runtimeEventPrefixExtent(prefix).lastOrdinal) return false;
  return eventCalculusDerivation(prefix).fluentAt(runtimeFluentKey(fluent), ordinal) !== null;
}

/** @internal Eligibility of this selected C0 occurrence, never public currentness.
 * The three current owners retain their own exact prefix/phase/authority checks. */
export function worksiteSelectedOccurrenceInputCurrent(authorityPrefix: RuntimeEventPrefix,
  cCall: CCall, request: WorksiteFileReplaceRequest): boolean {
  const fibre = runtimeEventAtPrefix(authorityPrefix, cCall.fibreSelectedEventRef);
  if (fibre === undefined) return false;
  const occurrence = projectWorksiteSelectedOccurrence(fibre, worksiteSelectedOccurrenceDependencies(authorityPrefix, fibre));
  if (occurrence === null || occurrence.cCall.cCallRef !== cCall.cCallRef ||
    occurrence.cCall.cCallDigest !== cCall.cCallDigest || occurrence.cCall.openedEventRef !== cCall.openedEventRef ||
    !canonicalEquals(occurrence.request, request)) return false;
  const before = validatedRuntimeEventPrefixBeforeEvent(authorityPrefix, fibre.eventId);
  return runtimeFluentHoldsAtPrefix(before,
    constructWorksiteObservationCurrentFluent(request.predecessorObservation.observationRef)) &&
    !worksiteCommandSourcesInvalidatedAfter(authorityPrefix, fibre.admissionOrdinal,
      request.workspaceAuthorityBasis.canonicalRoot, [request.subject.relativePath]);
}
