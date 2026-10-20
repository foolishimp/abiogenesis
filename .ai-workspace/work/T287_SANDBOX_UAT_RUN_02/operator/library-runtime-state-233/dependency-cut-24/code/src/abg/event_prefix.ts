import { createHash } from "node:crypto";
import { canonicalJson, writeCanonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { ownedRuntimeDerivationSource, runtimeDerivationSource, RuntimeDerivationSource, type RuntimeDerivationScope } from "./runtime_derivation.js";
import {
  selectRuntimeEvents,
  LEGACY_ROOT_EVENT_CONTRACT_DIGEST,
  projectRootEventProfileSchedule,
  extendRootEventProfileProjection,
  assertOwnedRuntimeHistorySelection,
  validateOwnedRuntimeHistoryCandidate,
  selectEventStoreRuntimeHistory,
  projectOwnedRuntimeHistoryAtDurablePrefix,
  readOwnedRuntimeHistoryAtDurablePrefix,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type RootEventProfileSchedule,
  type RuntimeEvent,
  type RuntimeEventScope,
} from "./event_store.js";
import { RuntimeHistorySelection, RuntimeEventBodyView, runtimeHistorySelectorKeys } from "./runtime_history.js";

const VALIDATED_RUNTIME_EVENT_PREFIX = Symbol(
  "validated_runtime_event_prefix",
);
const PROFILE_SOURCE = Symbol("validated_runtime_profile_source");
const IMMUTABILITY_RECEIPT = Symbol("validated_runtime_prefix_immutability");
const RECEIPT_CONSTRUCTION = Symbol("owner_prefix_receipt_construction");

export interface ValidatedRuntimeEventPrefix {
  readonly kind: "validated_runtime_event_prefix";
  readonly events: readonly RuntimeEvent[];
  readonly [VALIDATED_RUNTIME_EVENT_PREFIX]: true;
  readonly [PROFILE_SOURCE]: readonly RuntimeEvent[];
}

/** @internal A different representation of the same authenticated owner cut.
 * It is neither a public prefix nor an array with partial/lazy Event values. */
export interface OwnedRuntimeEventPrefix {
  readonly kind: "owned_runtime_event_prefix";
  readonly selection: RuntimeHistorySelection;
}
/** @internal Existing computations may consume either authentic representation. */
export type RuntimeEventPrefix = ValidatedRuntimeEventPrefix | OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix;
/** @internal A pure candidate view has no admitted-history or durable receipt. */
export interface ValidationRuntimeEventPrefix {
  readonly kind: "runtime_validation_event_prefix";
  readonly selection: RuntimeHistorySelection;
}
const VALIDATION_PREFIXES = new WeakMap<ValidationRuntimeEventPrefix, {
  readonly source: RuntimeDerivationSource; readonly scopeKey: string; readonly selection: RuntimeHistorySelection;
  readonly base: OwnedRuntimeEventPrefix; readonly candidate: RuntimeEvent;
}>();
const OWNED_PREFIXES = new WeakMap<OwnedRuntimeEventPrefix, {
  readonly source: RuntimeDerivationSource; readonly scopeKey: string; readonly selection: RuntimeHistorySelection;
}>();

/** @internal No caller-constructed Selection can pass the Event Store binding. */
export function selectOwnedRuntimeEventPrefix(
  owner: AbgEventStore | RuntimeHistorySelection, scope?: RuntimeEventScope,
): OwnedRuntimeEventPrefix {
  const selection = RuntimeHistorySelection.is(owner) ? owner.selectScope(scope) : selectEventStoreRuntimeHistory(owner, scope);
  const source = assertOwnedRuntimeHistorySelection(selection);
  const prefix: OwnedRuntimeEventPrefix = Object.freeze({ kind: "owned_runtime_event_prefix", selection });
  OWNED_PREFIXES.set(prefix, { source, scopeKey: scopeKey(scope), selection }); return prefix;
}

/** @internal Pure-memory owners retain their existing explicit snapshot route. */
export function selectRuntimeEventPrefixFromStore(store: AbgEventStore, scope?: RuntimeEventScope): RuntimeEventPrefix {
  return store.configuredDurableLogPath() === null ? selectValidatedRuntimeEventPrefix(store.readAll(), scope) :
    selectOwnedRuntimeEventPrefix(store, scope);
}
/** @internal Borrow established history; an unbound/copied coordinate is cold. */
export function projectOwnedRuntimeEventPrefixAtDurablePrefix(prefix: DurablePrefixCoordinate): OwnedRuntimeEventPrefix {
  return selectOwnedRuntimeEventPrefix(projectOwnedRuntimeHistoryAtDurablePrefix(prefix));
}
/** @internal Explicit freshness retains its physical-reader meaning. */
export function readOwnedRuntimeEventPrefixAtDurablePrefix(prefix: DurablePrefixCoordinate,
  options: Readonly<{ requireCurrent?: boolean }> = {}): OwnedRuntimeEventPrefix {
  return selectOwnedRuntimeEventPrefix(readOwnedRuntimeHistoryAtDurablePrefix(prefix, options));
}
/** @internal The nominal prefix and its actual physical owner must both agree. */
export function isOwnedRuntimeEventPrefix(prefix: unknown): prefix is OwnedRuntimeEventPrefix {
  if (typeof prefix !== "object" || prefix === null || !OWNED_PREFIXES.has(prefix as OwnedRuntimeEventPrefix)) return false;
  const value = prefix as OwnedRuntimeEventPrefix, proof = OWNED_PREFIXES.get(value)!;
  return value.kind === "owned_runtime_event_prefix" && value.selection === proof.selection &&
    assertOwnedRuntimeHistorySelection(value.selection) === proof.source;
}

/** @internal Separate pure validation receipt; never accepted by the physical history owner. */
export function isValidationRuntimeEventPrefix(value: unknown): value is ValidationRuntimeEventPrefix {
  if (typeof value !== "object" || value === null) return false;
  const proof = VALIDATION_PREFIXES.get(value as ValidationRuntimeEventPrefix);
  return proof !== undefined && (value as ValidationRuntimeEventPrefix).kind === "runtime_validation_event_prefix" &&
    (value as ValidationRuntimeEventPrefix).selection === proof.selection && isOwnedRuntimeEventPrefix(proof.base);
}
/** @internal Borrow only the admitted predecessor of this owner's checked candidate. */
export function runtimeEventValidationBase(prefix: RuntimeEventPrefix): OwnedRuntimeEventPrefix | undefined {
  if (!isValidationRuntimeEventPrefix(prefix)) return undefined;
  const proof = VALIDATION_PREFIXES.get(prefix)!;
  const base = selectOwnedRuntimeEventPrefix(prefix.selection.validationPredecessor());
  const receipt = OWNED_PREFIXES.get(base)!;
  OWNED_PREFIXES.set(base, { ...receipt, scopeKey: proof.scopeKey });
  return base;
}
function isLocatedPrefix(prefix: RuntimeEventPrefix): prefix is OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix {
  return isOwnedRuntimeEventPrefix(prefix) || isValidationRuntimeEventPrefix(prefix);
}
function locatedReceipt(prefix: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix) {
  return prefix.kind === "owned_runtime_event_prefix" ? OWNED_PREFIXES.get(prefix)! : VALIDATION_PREFIXES.get(prefix)!;
}
function selectValidationPrefix(base: OwnedRuntimeEventPrefix, candidate: RuntimeEvent,
  selection: RuntimeHistorySelection, source = new RuntimeDerivationSource(), selectedScope = "all"): ValidationRuntimeEventPrefix {
  const prefix: ValidationRuntimeEventPrefix = Object.freeze({ kind: "runtime_validation_event_prefix", selection });
  VALIDATION_PREFIXES.set(prefix, { base, candidate, selection, source, scopeKey: selectedScope }); return prefix;
}
function selectLocatedSubset(prefix: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix,
  selection: RuntimeHistorySelection, selectedScope = locatedReceipt(prefix).scopeKey): OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix {
  if (prefix.kind === "owned_runtime_event_prefix") {
    const result = selectOwnedRuntimeEventPrefix(selection), proof = OWNED_PREFIXES.get(result)!;
    OWNED_PREFIXES.set(result, { ...proof, scopeKey: selectedScope }); return result;
  }
  const proof = VALIDATION_PREFIXES.get(prefix)!;
  return selectValidationPrefix(proof.base, proof.candidate, selection, proof.source, selectedScope);
}
/** @internal Constant-cost exact owner relation, with raw explicit-array behavior kept separately. */
export function runtimeEventPrefixIsExactExtension(before: RuntimeEventPrefix, after: RuntimeEventPrefix, event: RuntimeEvent): boolean {
  if (isOwnedRuntimeEventPrefix(before) && isLocatedPrefix(after)) {
    if (before.selection.length !== before.selection.through || after.selection.length !== after.selection.through ||
        after.selection.length !== before.selection.length + 1) return false;
    if (isValidationRuntimeEventPrefix(after)) {
      const proof = VALIDATION_PREFIXES.get(after)!;
      return proof.base.selection.sharesSource(before.selection) && proof.base.selection.through === before.selection.through &&
        proof.candidate.eventId === event.eventId && proof.candidate.payloadDigest === event.payloadDigest &&
        proof.candidate.admissionOrdinal === event.admissionOrdinal;
    }
    const row = after.selection.row(after.selection.length - 1)?.envelope;
    return after.selection.extends(before.selection) && row?.eventId === event.eventId && row.payloadDigest === event.payloadDigest;
  }
  if (before.kind !== "validated_runtime_event_prefix" || after.kind !== "validated_runtime_event_prefix") return false;
  const events = runtimeEventsFromValidatedPrefix(before), successor = runtimeEventsFromValidatedPrefix(after);
  return successor.length === events.length + 1 && successor.at(-1) === event &&
    events.every((row, index) => successor[index] === row) &&
    after[PROFILE_SOURCE].length === successor.length && after[PROFILE_SOURCE].every((row, index) => successor[index] === row);
}

/** @internal Selected bodies are explicit plain-data reads, not getters. */
export function runtimeEventAtPrefix(prefix: RuntimeEventPrefix, eventRef: string): RuntimeEvent | undefined {
  return isLocatedPrefix(prefix) ? prefix.selection.eventById(eventRef) :
    indexedRuntimeEvents(prefix, "id:" + eventRef)[0];
}
/** @internal One ordinal body read from the authenticated selected representation. */
export function runtimeEventAtPrefixIndex(prefix: RuntimeEventPrefix, index: number): RuntimeEvent | undefined {
  return isLocatedPrefix(prefix) ? prefix.selection.event(index) : runtimeEventsFromValidatedPrefix(prefix)[index];
}
/** @internal Explicit ordered body scan; narrow consumers use indexed selection. */
export function runtimeEventBodiesAtPrefix(prefix: RuntimeEventPrefix): RuntimeEventBodyView {
  const view = new RuntimeEventBodyView(isLocatedPrefix(prefix) ? prefix.selection : runtimeEventsFromValidatedPrefix(prefix));
  BODY_VIEW_PREFIXES.set(view, prefix);
  return view;
}
const BODY_VIEW_PREFIXES = new WeakMap<RuntimeEventBodyView, RuntimeEventPrefix>();
/** @internal Envelope predicates do not acquire payload bodies. */
export function runtimeEventEnvelopesAtPrefix(prefix: RuntimeEventPrefix, fromIndex = 0): Iterable<Omit<RuntimeEvent, "payload">> {
  if (!isLocatedPrefix(prefix)) return runtimeEventsFromValidatedPrefix(prefix).slice(fromIndex);
  return { *[Symbol.iterator]() { for (let i = fromIndex; i < prefix.selection.length; i++) yield prefix.selection.row(i)!.envelope; } };
}
/** @internal The end coordinate never acquires an unrelated final payload. */
export function runtimeEventPrefixLastEnvelope(prefix: RuntimeEventPrefix): Omit<RuntimeEvent, "payload"> | undefined {
  return isLocatedPrefix(prefix) ? prefix.selection.row(prefix.selection.length - 1)?.envelope : runtimeEventsFromValidatedPrefix(prefix).at(-1);
}
/** @internal Indexed envelope selection shares the exact ordered owner relation. */
export function indexedRuntimeEventEnvelopes(prefix: RuntimeEventPrefix, key: string): readonly Omit<RuntimeEvent, "payload">[] {
  return isLocatedPrefix(prefix) ? Array.from(prefix.selection.select(key).rows(), row => row.envelope) : indexedRuntimeEvents(prefix, key);
}
/** @internal Exact indexed extent; unscoped owned cuts neither copy buckets nor acquire bodies. */
export function runtimeEventSelectorExtent(prefix: RuntimeEventPrefix, key: string): Readonly<{ count: number; lastOrdinal: number }> {
  if (isLocatedPrefix(prefix)) return prefix.selection.selectorExtent(key);
  const rows = indexedRuntimeEvents(prefix, key);
  return { count: rows.length, lastOrdinal: rows.at(-1)?.admissionOrdinal ?? 0 };
}
/** @internal Exact count/last ordinal need no decoded body. */
export function runtimeEventPrefixExtent(prefix: RuntimeEventPrefix): Readonly<{ count: number; lastOrdinal: number }> {
  if (isLocatedPrefix(prefix)) return { count: prefix.selection.length,
    lastOrdinal: prefix.selection.row(prefix.selection.length - 1)?.envelope.admissionOrdinal ?? 0 };
  const events = runtimeEventsFromValidatedPrefix(prefix);
  return { count: events.length, lastOrdinal: events.at(-1)?.admissionOrdinal ?? 0 };
}

/** A value-bound proof only, not a registry, event admission or runtime state. */
class PrefixImmutabilityReceipt {
  readonly #prefix: ValidatedRuntimeEventPrefix;
  readonly source: RuntimeDerivationSource;
  readonly scopeKey: string;
  readonly computation: RuntimeDerivationScope;

  constructor(key: typeof RECEIPT_CONSTRUCTION, prefix: ValidatedRuntimeEventPrefix, source: RuntimeDerivationSource, scopeKey: string, computation: RuntimeDerivationScope) {
    if (key !== RECEIPT_CONSTRUCTION) throw new TypeError("prefix receipt is owner-constructed");
    this.#prefix = prefix;
    this.source = source; this.scopeKey = scopeKey; this.computation = computation;
    Object.freeze(this);
  }

  static isFor(value: unknown, prefix: ValidatedRuntimeEventPrefix): boolean {
    return typeof value === "object" && value !== null &&
      #prefix in value && value.#prefix === prefix;
  }
}

/** Called only after initial validation or a subset of an authenticated value. */
function constructImmutablePrefix(
  events: readonly RuntimeEvent[],
  profileSource: readonly RuntimeEvent[],
  source = runtimeDerivationSource(profileSource),
  scopeKey = "all",
  selectedComputation?: RuntimeDerivationScope,
): ValidatedRuntimeEventPrefix {
  const prefix: ValidatedRuntimeEventPrefix = {
    kind: "validated_runtime_event_prefix",
    events: source.snapshot(events),
    [VALIDATED_RUNTIME_EVENT_PREFIX]: true,
    [PROFILE_SOURCE]: profileSource,
  };
  Object.defineProperty(prefix, IMMUTABILITY_RECEIPT, {
    value: new PrefixImmutabilityReceipt(RECEIPT_CONSTRUCTION, prefix, source, scopeKey,
      selectedComputation ?? source.scope(scopeKey, prefix.events)),
  });
  return Object.freeze(prefix);
}

/** A tentative extension remains under the caller's owner derivation. It gives
 * no durable authority; transaction rollback discards its source. */
export function extendRuntimeEventPrefixForValidation(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent): ValidatedRuntimeEventPrefix;
/** @internal */
export function extendRuntimeEventPrefixForValidation(prefix: OwnedRuntimeEventPrefix, event: RuntimeEvent): OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix;
/** @internal */
export function extendRuntimeEventPrefixForValidation(prefix: RuntimeEventPrefix, event: RuntimeEvent): RuntimeEventPrefix;
export function extendRuntimeEventPrefixForValidation(prefix: RuntimeEventPrefix, event: RuntimeEvent): RuntimeEventPrefix {
  if (!isImmutableRuntimeValue(event)) throw new TypeError("candidate event must be immutable data");
  if (isOwnedRuntimeEventPrefix(prefix)) {
    const profileAfter = validateOwnedRuntimeHistoryCandidate(prefix.selection, event);
    try { return selectOwnedRuntimeEventPrefix(prefix.selection.actualSuccessor(event)); }
    catch { return selectValidationPrefix(prefix, event, prefix.selection.validationSuccessor(event, profileAfter)); }
  }
  if (isValidationRuntimeEventPrefix(prefix)) throw new TypeError("one prospective candidate cannot advance admitted history");
  const receipt = computationReceipt(prefix);
  return selectPrefixFromImmutableSnapshot(receipt.source.append(runtimeEventsFromValidatedPrefix(prefix), [event]), undefined, receipt.source);
}

/** Check a proposed suffix without advancing any accepted derivation. The
 * caller still owns event-envelope admission and the eventual checked append. */
export function validateRuntimeEventPrefixExtension(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent): void;
/** @internal */
export function validateRuntimeEventPrefixExtension(prefix: RuntimeEventPrefix, event: RuntimeEvent): void;
export function validateRuntimeEventPrefixExtension(prefix: RuntimeEventPrefix, event: RuntimeEvent): void {
  if (isOwnedRuntimeEventPrefix(prefix)) {
    if (!isImmutableRuntimeValue(event)) throw new TypeError("candidate event must be immutable data");
    validateOwnedRuntimeHistoryCandidate(prefix.selection, event); return;
  }
  if (isValidationRuntimeEventPrefix(prefix)) throw new TypeError("candidate validation requires admitted predecessor history");
  const receipt = computationReceipt(prefix);
  const events = runtimeEventsFromValidatedPrefix(prefix);
  if (receipt.scopeKey !== "all") throw new TypeError("candidate validation requires an unscoped predecessor");
  if (!isImmutableRuntimeValue(event)) throw new TypeError("candidate event must be immutable data");
  if (event.admissionOrdinal !== events.length + 1) throw new TypeError(
    "runtime event-prefix selection requires a total, gap-free admission-ordinal order");
  const index = authorityIndex(receipt.source, events);
  index.structure(events);
  extendRootEventProfileProjection(receipt.source.append(events, [event]), events.length, index.profile(events));
  for (const causeRef of event.causationEventRefs) {
    const cause = index.through("id:" + causeRef, events.length).at(-1);
    if (cause === undefined) throw new TypeError("runtime event-prefix selection encountered an unknown causal predecessor");
    if (event.runId !== undefined && cause.runId !== undefined && event.runId !== cause.runId) throw new TypeError(
      "runtime event-prefix selection cannot cross a run causation boundary");
  }
}

export function isImmutableRuntimeValue(
  value: unknown,
  visited: Set<object> = new Set(),
): boolean {
  if (typeof value !== "object" || value === null) return true;
  if (!Object.isFrozen(value)) return false;
  if (visited.has(value)) return true;
  visited.add(value);
  // A frozen accessor can still return changing values. Native event snapshots
  // are immutable data properties; do not certify a live getter as that data.
  return Reflect.ownKeys(value).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    return "value" in descriptor && isImmutableRuntimeValue(descriptor.value, visited);
  });
}

export function runtimeEventsFromValidatedPrefix(
  prefix: ValidatedRuntimeEventPrefix,
): readonly RuntimeEvent[] {
  if (
    typeof prefix !== "object" ||
    prefix === null ||
    prefix[VALIDATED_RUNTIME_EVENT_PREFIX] !== true ||
    prefix.kind !== "validated_runtime_event_prefix" ||
    !Object.isFrozen(prefix) ||
    !PrefixImmutabilityReceipt.isFor(
      Object.getOwnPropertyDescriptor(prefix, IMMUTABILITY_RECEIPT)?.value,
      prefix,
    )
  ) {
    throw new TypeError(
      "Event Calculus requires a nominal validated immutable event prefix",
    );
  }
  return prefix.events;
}

function computationReceipt(prefix: ValidatedRuntimeEventPrefix): PrefixImmutabilityReceipt {
  runtimeEventsFromValidatedPrefix(prefix);
  return Object.getOwnPropertyDescriptor(prefix, IMMUTABILITY_RECEIPT)!.value as PrefixImmutabilityReceipt;
}
export function runtimePrefixComputation<T>(prefix: ValidatedRuntimeEventPrefix, owner: symbol, construct: () => T): T;
/** @internal */
export function runtimePrefixComputation<T>(prefix: RuntimeEventPrefix, owner: symbol, construct: () => T): T;
export function runtimePrefixComputation<T>(prefix: RuntimeEventPrefix, owner: symbol, construct: () => T): T {
  if (isLocatedPrefix(prefix)) {
    const receipt = locatedReceipt(prefix);
    return receipt.source.selectionScope(receipt.scopeKey, receipt.selection).owner(owner, construct);
  }
  return computationReceipt(prefix).computation.owner(owner, construct);
}

/** Exact profile-source value for owner derivation authentication. */
export function runtimeEventProfileSourceFromValidatedPrefix(prefix: ValidatedRuntimeEventPrefix): readonly RuntimeEvent[] {
  runtimeEventsFromValidatedPrefix(prefix);
  return prefix[PROFILE_SOURCE];
}

export function runtimeEventProfileScheduleFromValidatedPrefix(prefix: ValidatedRuntimeEventPrefix): RootEventProfileSchedule;
/** @internal */
export function runtimeEventProfileScheduleFromValidatedPrefix(prefix: RuntimeEventPrefix): RootEventProfileSchedule;
export function runtimeEventProfileScheduleFromValidatedPrefix(prefix: RuntimeEventPrefix): RootEventProfileSchedule {
  if (isLocatedPrefix(prefix)) {
    return prefix.selection.profileSchedule(projectRootEventProfileSchedule([]).currentEventContractDigest);
  }
  runtimeEventsFromValidatedPrefix(prefix);
  const events = prefix[PROFILE_SOURCE];
  const index = authorityIndex(computationReceipt(prefix).source, events);
  index.structure(events);
  return index.profile(events);
}
export function unscopedRuntimeEventPrefix(prefix: ValidatedRuntimeEventPrefix): ValidatedRuntimeEventPrefix;
/** @internal */
export function unscopedRuntimeEventPrefix(prefix: OwnedRuntimeEventPrefix): OwnedRuntimeEventPrefix;
/** @internal */
export function unscopedRuntimeEventPrefix(prefix: RuntimeEventPrefix): RuntimeEventPrefix;
export function unscopedRuntimeEventPrefix(prefix: RuntimeEventPrefix): RuntimeEventPrefix {
  if (isLocatedPrefix(prefix)) return selectLocatedSubset(prefix, prefix.selection.unscoped(), "all");
  runtimeEventsFromValidatedPrefix(prefix);
  return selectPrefixFromImmutableSnapshot(prefix[PROFILE_SOURCE], undefined, computationReceipt(prefix).source);
}

export function validatedRuntimeEventPrefixThroughEvent(
  prefix: ValidatedRuntimeEventPrefix,
  eventId: string,
): ValidatedRuntimeEventPrefix;
/** @internal */
export function validatedRuntimeEventPrefixThroughEvent(prefix: RuntimeEventPrefix, eventId: string): RuntimeEventPrefix;
export function validatedRuntimeEventPrefixThroughEvent(prefix: RuntimeEventPrefix, eventId: string): RuntimeEventPrefix {
  return historicalRuntimeEventPrefix(prefix, eventId, true);
}

export function validatedRuntimeEventPrefixBeforeEvent(
  prefix: ValidatedRuntimeEventPrefix,
  eventId: string,
): ValidatedRuntimeEventPrefix;
/** @internal */
export function validatedRuntimeEventPrefixBeforeEvent(prefix: RuntimeEventPrefix, eventId: string): RuntimeEventPrefix;
export function validatedRuntimeEventPrefixBeforeEvent(prefix: RuntimeEventPrefix, eventId: string): RuntimeEventPrefix {
  return historicalRuntimeEventPrefix(prefix, eventId, false);
}

function historicalRuntimeEventPrefix(prefix: RuntimeEventPrefix, eventId: string, inclusive: boolean): RuntimeEventPrefix {
  if (isLocatedPrefix(prefix)) {
    const boundary = prefix.selection.rowById(eventId);
    if (boundary === undefined) throw new TypeError("historical event-prefix boundary requires one exact admitted event");
    const selection = prefix.selection.cut(boundary.envelope.admissionOrdinal - (inclusive ? 0 : 1));
    return selectLocatedSubset(prefix, selection);
  }
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const boundary = indexedRuntimeEvents(prefix, "id:" + eventId)[0];
  if (boundary === undefined) {
    throw new TypeError(
      "historical event-prefix boundary requires one exact admitted event",
    );
  }
  const ordinal = boundary.admissionOrdinal - (inclusive ? 0 : 1);
  let low = 0, high = events.length;
  while (low < high) { const mid = (low + high) >>> 1; if (events[mid]!.admissionOrdinal <= ordinal) low = mid + 1; else high = mid; }
  const receipt = computationReceipt(prefix);
  return constructImmutablePrefix(receipt.source.prefix(events, low),
    receipt.source.prefix(prefix[PROFILE_SOURCE], Math.min(ordinal, prefix[PROFILE_SOURCE].length)), receipt.source, receipt.scopeKey);
}

const IMMUTABLE_PAYLOADS = Symbol("owner_immutable_event_payloads");

export function selectValidatedRuntimeEventPrefix(
  admittedEvents: readonly RuntimeEvent[],
  scope?: RuntimeEventScope,
): ValidatedRuntimeEventPrefix;
/** @internal Private body scans retain their actual owner prefix, never create a partial public vector. */
export function selectValidatedRuntimeEventPrefix(
  admittedEvents: RuntimeEventBodyView,
  scope?: RuntimeEventScope,
): RuntimeEventPrefix;
/** @internal */
export function selectValidatedRuntimeEventPrefix(admittedEvents: readonly RuntimeEvent[] | RuntimeEventBodyView, scope?: RuntimeEventScope): RuntimeEventPrefix;
export function selectValidatedRuntimeEventPrefix(
  admittedEvents: readonly RuntimeEvent[] | RuntimeEventBodyView,
  scope?: RuntimeEventScope,
): RuntimeEventPrefix {
  if (admittedEvents instanceof RuntimeEventBodyView) {
    const prefix = BODY_VIEW_PREFIXES.get(admittedEvents);
    if (prefix === undefined) throw new TypeError("runtime body scan has no authenticated prefix owner");
    return scope === undefined ? prefix : selectRuntimeEventPrefixFromAuthority(prefix, scope);
  }
  const source = ownedRuntimeDerivationSource(admittedEvents);
  if (source === undefined) {
    if (!isImmutableRuntimeValue(admittedEvents)) throw new TypeError(
      "runtime event-prefix selection requires one explicit immutable snapshot");
  } else {
    // The exact snapshot owns a frozen data array. Its existing derivation
    // retains only completed payload checks over the same event identities.
    const checked = source.scope("immutable_payloads", admittedEvents)
      .owner(IMMUTABLE_PAYLOADS, () => ({ count: 0 }));
    for (; checked.count < admittedEvents.length; checked.count++) {
      if (!isImmutableRuntimeValue(admittedEvents[checked.count])) throw new TypeError(
        "runtime event-prefix selection requires one explicit immutable snapshot");
    }
  }
  return source === undefined
    ? selectColdPrefixFromImmutableSnapshot(admittedEvents, scope)
    : selectPrefixFromImmutableSnapshot(admittedEvents, scope, source);
}

/** Derive another scope from the already authenticated immutable authority
 * value. Do not walk its payload bytes again to rediscover immutability. */
export function selectRuntimeEventPrefixFromAuthority(
  authorityPrefix: ValidatedRuntimeEventPrefix,
  scope: RuntimeEventScope,
): ValidatedRuntimeEventPrefix;
/** @internal */
export function selectRuntimeEventPrefixFromAuthority(authorityPrefix: OwnedRuntimeEventPrefix, scope: RuntimeEventScope): OwnedRuntimeEventPrefix;
/** @internal */
export function selectRuntimeEventPrefixFromAuthority(authorityPrefix: RuntimeEventPrefix, scope: RuntimeEventScope): RuntimeEventPrefix;
export function selectRuntimeEventPrefixFromAuthority(authorityPrefix: RuntimeEventPrefix, scope: RuntimeEventScope): RuntimeEventPrefix {
  if (isLocatedPrefix(authorityPrefix)) return selectLocatedSubset(authorityPrefix, authorityPrefix.selection.selectScope(scope), scopeKey(scope));
  const events = runtimeEventsFromValidatedPrefix(authorityPrefix);
  return selectPrefixFromImmutableSnapshot(events, scope, computationReceipt(authorityPrefix).source);
}

function scopeKey(scope?: RuntimeEventScope): string {
  return scope === undefined ? "all" : JSON.stringify(Object.fromEntries(
    Object.entries(scope).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0),
  ));
}

function authorityIndex(source: RuntimeDerivationSource, events: readonly RuntimeEvent[]): RuntimeEventIndex {
  return source.scope("all", events).owner(EVENT_INDEX, () => new RuntimeEventIndex());
}

function selectPrefixFromImmutableSnapshot(
  admittedEvents: readonly RuntimeEvent[], scope?: RuntimeEventScope,
  source = runtimeDerivationSource(admittedEvents),
): ValidatedRuntimeEventPrefix {
  const computation = source.scope("all", admittedEvents);
  const index = computation.owner(EVENT_INDEX, () => new RuntimeEventIndex());
  index.structure(admittedEvents);
  // Raw compatibility includes duplicate identities and forward causes. Those
  // histories retain the original selection/refusal order, without lending
  // their non-monotone relations to ordinary suffix progress.
  if (index.irregularAt <= admittedEvents.length || (scope !== undefined &&
      (scope === null || typeof scope !== "object" ||
        (scope.runId !== undefined && typeof scope.runId !== "string") ||
        (scope.invocationRef !== undefined && typeof scope.invocationRef !== "string")))) {
    return selectColdPrefixFromImmutableSnapshot(admittedEvents, scope, source);
  }
  const selected = index.select(admittedEvents, source, scope);
  index.profile(admittedEvents);
  if (scope === undefined) index.validateCauses(admittedEvents);
  return constructImmutablePrefix(selected, admittedEvents, source, scopeKey(scope),
    scope === undefined ? computation : undefined);
}

function selectColdPrefixFromImmutableSnapshot(
  admittedEvents: readonly RuntimeEvent[],
  scope?: RuntimeEventScope,
  source = runtimeDerivationSource(admittedEvents),
): ValidatedRuntimeEventPrefix {
  for (const [index, event] of admittedEvents.entries()) {
    if (event.admissionOrdinal !== index + 1) {
      throw new TypeError(
        "runtime event-prefix selection requires a total, gap-free admission-ordinal order",
      );
    }
  }

  const selected = selectRuntimeEvents(admittedEvents, scope);
  projectRootEventProfileSchedule(admittedEvents);
  const admittedById = new Map(
    admittedEvents.map((event) => [event.eventId, event]),
  );
  const selectedIds = new Set(selected.map((event) => event.eventId));
  let previousOrdinal = 0;
  for (const event of selected) {
    if (event.admissionOrdinal <= previousOrdinal) {
      throw new TypeError(
        "runtime event-prefix selection must preserve original admission order",
      );
    }
    previousOrdinal = event.admissionOrdinal;
    for (const causeRef of event.causationEventRefs) {
      const cause = admittedById.get(causeRef);
      if (cause === undefined || !selectedIds.has(causeRef)) {
        throw new TypeError(
          "runtime event-prefix selection encountered an unknown causal predecessor",
        );
      }
      if (
        event.runId !== undefined &&
        cause.runId !== undefined &&
        event.runId !== cause.runId
      ) {
        throw new TypeError(
          "runtime event-prefix selection cannot cross a run causation boundary",
        );
      }
    }
  }
  const events = Object.freeze([...selected]);
  return constructImmutablePrefix(events, admittedEvents, source, scopeKey(scope));
}


const EVENT_INDEX = Symbol("runtime_event_index");
/** Ordered selectors share the owner's suffix walk; returned cuts are immutable. */
class RuntimeEventIndex {
  count = 0;
  irregularAt = Infinity;
  private ordinalCount = 0;
  private causalCount = 0;
  private profileCount = 0;
  private profileValue: RootEventProfileSchedule | undefined;
  private readonly selections = new Map<string, {
    through: number;
    selected: Set<string>;
    discovered: { event: RuntimeEvent; at: number }[];
    value: readonly RuntimeEvent[];
  }>();
  readonly buckets = new Map<string, RuntimeEvent[]>();

  structure(events: readonly RuntimeEvent[]): void {
    for (; this.ordinalCount < events.length; this.ordinalCount++) {
      if (events[this.ordinalCount]!.admissionOrdinal !== this.ordinalCount + 1) {
        throw new TypeError("runtime event-prefix selection requires a total, gap-free admission-ordinal order");
      }
    }
    this.advance(events);
  }

  profile(events: readonly RuntimeEvent[]): RootEventProfileSchedule {
    // A later duplicate can alias the witnessed boundary even when this cut
    // is regular. Keep every cut of that warmed source on the cold profile owner.
    if (this.irregularAt !== Infinity) return projectRootEventProfileSchedule(events);
    if (this.profileValue === undefined || this.profileCount === 0) {
      this.profileValue = projectRootEventProfileSchedule(events);
      this.profileCount = events.length;
    } else if (events.length > this.profileCount) {
      this.profileValue = extendRootEventProfileProjection(events, this.profileCount, this.profileValue);
      this.profileCount = events.length;
    }
    if (events.length === this.profileCount) return this.profileValue;
    if (events.length === 0) return projectRootEventProfileSchedule(events);
    const spans = this.profileValue.spans.filter(span => span.firstOrdinal <= events.length)
      .map(span => Object.freeze({ ...span, lastOrdinal: Math.min(span.lastOrdinal, events.length) }));
    const boundary = this.profileValue.boundaryEventRef;
    const hasBoundary = boundary !== null && this.through("id:" + boundary, events.length).length !== 0;
    return Object.freeze({ ...this.profileValue, spans: Object.freeze(spans),
      boundaryEventRef: hasBoundary ? boundary : null,
      currentEventContractDigest: hasBoundary ? this.profileValue.currentEventContractDigest : spans.at(-1)!.eventContractDigest,
    });
  }

  validateCauses(events: readonly RuntimeEvent[]): void {
    for (; this.causalCount < events.length; this.causalCount++) {
      const event = events[this.causalCount]!;
      for (const causeRef of event.causationEventRefs) {
        const cause = this.through("id:" + causeRef, events.length).at(-1);
        if (cause === undefined) throw new TypeError("runtime event-prefix selection encountered an unknown causal predecessor");
        if (event.runId !== undefined && cause.runId !== undefined && event.runId !== cause.runId) {
          throw new TypeError("runtime event-prefix selection cannot cross a run causation boundary");
        }
      }
    }
  }

  select(events: readonly RuntimeEvent[], source: RuntimeDerivationSource, scope?: RuntimeEventScope): readonly RuntimeEvent[] {
    if (scope === undefined) return events;
    const key = scopeKey(scope);
    let progress = this.selections.get(key);
    if (progress === undefined) {
      progress = { through: 0, selected: new Set(), discovered: [], value: source.snapshot([]) };
      this.selections.set(key, progress);
    }
    if (events.length > progress.through) {
      const seeds = new Set<RuntimeEvent>();
      for (const selector of [scope.runId === undefined ? null : "run:" + scope.runId,
        scope.invocationRef === undefined ? null : "invocation:" + scope.invocationRef]) {
        if (selector !== null) for (const event of this.range(selector, progress.through, events.length)) seeds.add(event);
      }
      // Discovery order is monotone even when a new run event first selects an
      // older workspace cause. Historical cuts must exclude those later discoveries.
      const added = new Map<string, { event: RuntimeEvent; at: number }>();
      for (const seed of [...seeds].sort((a, b) => a.admissionOrdinal - b.admissionOrdinal)) {
        const pending = [seed];
        for (let i = 0; i < pending.length; i++) {
          const event = pending[i]!;
          if (progress.selected.has(event.eventId) || added.has(event.eventId)) continue;
          added.set(event.eventId, { event, at: seed.admissionOrdinal });
          for (const causeRef of event.causationEventRefs) {
            const cause = this.through("id:" + causeRef, events.length).at(-1);
            if (cause === undefined) throw new TypeError("scoped replay encountered an unknown causation event");
            if (event.runId !== undefined && cause.runId !== undefined && event.runId !== cause.runId) {
              throw new TypeError("scoped replay cannot cross a run causation boundary");
            }
            pending.push(cause);
          }
        }
      }
      if (added.size !== 0) {
        const suffix = [...added.values()].map(row => row.event).sort((a, b) => a.admissionOrdinal - b.admissionOrdinal);
        // Ordinary growth appends to the existing selected value. A newly
        // discovered older cause requires a new ordered selection instead.
        progress.value = suffix[0]!.admissionOrdinal > (progress.value.at(-1)?.admissionOrdinal ?? 0)
          ? source.append(progress.value, suffix)
          : source.snapshot([...progress.value, ...suffix].sort((a, b) => a.admissionOrdinal - b.admissionOrdinal));
        for (const [id, row] of added) { progress.selected.add(id); progress.discovered.push(row); }
      }
      progress.through = events.length;
    }
    if (events.length === progress.through) return progress.value;
    let low = 0, high = progress.discovered.length;
    while (low < high) { const mid = (low + high) >>> 1; if (progress.discovered[mid]!.at <= events.length) low = mid + 1; else high = mid; }
    if (low === progress.discovered.length) return progress.value;
    return source.snapshot(progress.discovered.slice(0, low).map(row => row.event)
      .sort((a, b) => a.admissionOrdinal - b.admissionOrdinal));
  }
  advance(events: readonly RuntimeEvent[]): void {
    for (let i = this.count; i < events.length; i++) {
      const event = events[i]!;
      if (this.buckets.has("id:" + event.eventId) || event.causationEventRefs.some(ref =>
        !this.buckets.has("id:" + ref))) this.irregularAt = Math.min(this.irregularAt, event.admissionOrdinal);
      const keys = runtimeHistorySelectorKeys(event);
      for (const key of keys) {
        let rows = this.buckets.get(key);
        if (rows === undefined) this.buckets.set(key, rows = []);
        rows.push(event);
      }
      this.count++;
    }
  }
  private range(key: string, after: number, through: number): readonly RuntimeEvent[] {
    const rows = this.buckets.get(key) ?? [];
    const upper = (ordinal: number): number => {
      let lo = 0, hi = rows.length;
      while (lo < hi) { const mid = (lo + hi) >>> 1; if (rows[mid]!.admissionOrdinal <= ordinal) lo = mid + 1; else hi = mid; }
      return lo;
    };
    return rows.slice(upper(after), upper(through));
  }
  through(key: string, ordinal: number): readonly RuntimeEvent[] {
    return this.range(key, 0, ordinal);
  }
}
export function indexedRuntimeEvents(prefix: ValidatedRuntimeEventPrefix, key: string): readonly RuntimeEvent[];
/** @internal */
export function indexedRuntimeEvents(prefix: RuntimeEventPrefix, key: string): readonly RuntimeEvent[];
export function indexedRuntimeEvents(prefix: RuntimeEventPrefix, key: string): readonly RuntimeEvent[] {
  if (isLocatedPrefix(prefix)) return prefix.selection.select(key).materialize();
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const index = runtimePrefixComputation(prefix, EVENT_INDEX, () => new RuntimeEventIndex());
  index.advance(events);
  return index.through(key, events.at(-1)?.admissionOrdinal ?? 0);
}

const CANONICAL_PREFIX = Symbol("ordered_canonical_prefix_digest");
class CanonicalPrefixDerivation {
  readonly hash = createHash("sha256").update("[");
  readonly digests: Sha256Digest[] = [`sha256:${this.hash.copy().update("]").digest("hex")}`];
  advance(events: readonly RuntimeEvent[]): void {
    for (let index = this.digests.length - 1; index < events.length; index++) {
      // Encode before mutating the hash, so a refused value cannot contaminate it.
      const encoded = canonicalJson(events[index] as unknown as JsonValue);
      if (index !== 0) this.hash.update(",");
      this.hash.update(encoded);
      this.digests.push(`sha256:${this.hash.copy().update("]").digest("hex")}`);
    }
  }
  advanceSelection(selection: RuntimeHistorySelection): void {
    for (let index = this.digests.length - 1; index < selection.length; index++) {
      const event = selection.event(index)!;
      // Acquire one selected body at a time; the memo retains hash facts only.
      if (index !== 0) this.hash.update(",");
      writeCanonicalJson(event as unknown as JsonValue, part => this.hash.update(part));
      this.digests.push(`sha256:${this.hash.copy().update("]").digest("hex")}`);
    }
  }
}
/** Exactly SHA256(canonicalJson(events)); old bytes are never re-encoded.
 * The checkpoints are disposable derived facts, not persisted authority. */
export function runtimeEventPrefixDigest(prefix: ValidatedRuntimeEventPrefix): Sha256Digest;
/** @internal */
export function runtimeEventPrefixDigest(prefix: RuntimeEventPrefix): Sha256Digest;
export function runtimeEventPrefixDigest(prefix: RuntimeEventPrefix): Sha256Digest {
  if (isLocatedPrefix(prefix)) {
    const full = prefix.selection.canonicalDigest();
    if (full !== undefined) return full;
    const derivation = runtimePrefixComputation(prefix, CANONICAL_PREFIX, () => new CanonicalPrefixDerivation());
    derivation.advanceSelection(prefix.selection); return derivation.digests[prefix.selection.length]!;
  }
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const derivation = runtimePrefixComputation(prefix, CANONICAL_PREFIX, () => new CanonicalPrefixDerivation());
  derivation.advance(events);
  return derivation.digests[events.length]!;
}
