import { createHash } from "node:crypto";
import { canonicalJson, writeCanonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { WorksiteContextBodyMember, WorksiteContextEntry, WorksiteContextObservation } from "../product/worksite_effect.js";
import type { CheckedRecord } from "../shared/select/index.js";
import { ownedRuntimeDerivationSource, runtimeDerivationSource, RuntimeDerivationSource, type RuntimeDerivationScope } from "./runtime_derivation.js";
import {
  selectRuntimeEvents,
  projectRootEventProfileSchedule,
  extendRootEventProfileProjection,
  assertOwnedRuntimeHistorySelection,
  validateOwnedRuntimeHistoryCandidate,
  validateRuntimeHistoryCandidate,
  selectEventStoreRuntimeHistory,
  projectOwnedRuntimeHistoryAtDurablePrefix,
  readOwnedRuntimeHistoryAtDurablePrefix,
  activeRuntimeHistoryAtDurablePrefix,
  type AbgEventStore,
  type DurablePrefixCoordinate,
  type RootEventProfileSchedule,
  type RuntimeEvent,
  type RuntimeEventScope,
} from "./event_store.js";
import { RuntimeHistorySelection, type RuntimeHistory, RuntimeEventBodyView, runtimeHistorySelectorKeys, nativeContextBodyHolders,
  NATIVE_CONTEXT_BODY_KEY } from "./runtime_history.js";
import { canonicalEquals } from "../shared/value/index.js";

const VALIDATED_RUNTIME_EVENT_PREFIX = Symbol(
  "validated_runtime_event_prefix",
);
const PROFILE_SOURCE = Symbol("validated_runtime_profile_source");
const IMMUTABILITY_RECEIPT = Symbol("validated_runtime_prefix_immutability");
const RECEIPT_CONSTRUCTION = Symbol("owner_prefix_receipt_construction");

export type ValidatedRuntimeEventPrefix = {
  readonly kind: "validated_runtime_event_prefix";
  readonly events: readonly RuntimeEvent[];
  readonly [VALIDATED_RUNTIME_EVENT_PREFIX]: true;
  readonly [PROFILE_SOURCE]: readonly RuntimeEvent[];
};

/** @internal A different representation of the same authenticated owner cut.
 * It is neither a public prefix nor an array with partial/lazy Event values. */
export type OwnedRuntimeEventPrefix = {
  readonly kind: "owned_runtime_event_prefix";
  readonly selection: RuntimeHistorySelection;
};
/** @internal Existing computations may consume either authentic representation. */
export type RuntimeEventPrefix = ValidatedRuntimeEventPrefix | OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix;
/** @internal A pure candidate view has no admitted-history or durable receipt. */
export type ValidationRuntimeEventPrefix = {
  readonly kind: "runtime_validation_event_prefix";
  readonly selection: RuntimeHistorySelection;
};
const VALIDATION_PREFIXES = new WeakMap<ValidationRuntimeEventPrefix, {
  readonly source: RuntimeDerivationSource; readonly scopeKey: string; readonly selection: RuntimeHistorySelection;
  readonly base: OwnedRuntimeEventPrefix; readonly candidate: RuntimeEvent;
  readonly predecessor: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix;
  readonly scopedFrom?: ValidationRuntimeEventPrefix;
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
/** @internal §10.12 O1 lifetime: one run operation scope's basis retention
 * handle on the active held history of its acquired coordinate. The returned
 * release is that scope's finalizer. A cold, closed or copied coordinate opens
 * nothing, and no read path calls this. */
export function retainExecutionBasisLifetime(coordinate: DurablePrefixCoordinate, invocationRef: string): () => void {
  const history = activeRuntimeHistoryAtDurablePrefix(coordinate);
  return history === undefined ? () => {} : history.retainBasis(invocationRef);
}
/** @internal §10.12 O1 lifetime, read operations: one read or admission
 * operation's hold on the bodies it selects from the active held history of
 * its acquired coordinate. The returned release is that operation's
 * finalizer. A cold, closed or copied coordinate opens nothing. */
export function holdOperationBodies(coordinate: DurablePrefixCoordinate): () => void {
  const history = activeRuntimeHistoryAtDurablePrefix(coordinate);
  return history === undefined ? () => {} : history.holdOperationBodies();
}
/** @internal §10.12 O1 lifetime, operations: the one owner of the operation
 * hold. `operation` is one synchronous stack. The hold opens on the history it
 * reads, before it runs, and is released when it returns or throws:
 * - a durable coordinate names the active held history of an acquired or
 *   handed resource, and a cold, closed or copied coordinate opens nothing;
 * - an owned runtime prefix names its own history, the active owner's or the
 *   cold copy a read port prepared for this call; a validation prefix opens
 *   nothing.
 * While the hold is open each basis body the operation selects is read from
 * its location and authenticated once. Holds nest, and the last release drops
 * the held bodies, so nothing stays held after the outermost return. Rollback
 * and physical close dispose the hold, and a later release is inert. It is not
 * O1 retention, and no O1 gauge counts it. */
export function withOperationBodies<T>(source: DurablePrefixCoordinate | RuntimeEventPrefix, operation: () => T): T {
  const release = source.kind === "durable_prefix_coordinate" ? holdOperationBodies(source)
    : runtimePrefixBasisRetention(source)?.holdOperationBodies();
  try { return operation(); } finally { release?.(); }
}
/** @internal §10.12 O1: the store history whose open scopes may retain a basis
 * row of this owned cut; an array, copied or validation prefix has none. */
export function runtimePrefixBasisRetention(prefix: RuntimeEventPrefix): RuntimeHistory | undefined {
  return isOwnedRuntimeEventPrefix(prefix) ? RuntimeHistorySelection.owner(prefix.selection) : undefined;
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
export function runtimeEventValidationBase(prefix: RuntimeEventPrefix): RuntimeEventPrefix | undefined {
  if (!isValidationRuntimeEventPrefix(prefix)) return undefined;
  const proof = VALIDATION_PREFIXES.get(prefix)!;
  return selectLocatedSubset(proof.predecessor, prefix.selection.validationPredecessor(), proof.scopeKey);
}
function isLocatedPrefix(prefix: RuntimeEventPrefix): prefix is OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix {
  return isOwnedRuntimeEventPrefix(prefix) || isValidationRuntimeEventPrefix(prefix);
}
function locatedReceipt(prefix: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix) {
  return prefix.kind === "owned_runtime_event_prefix" ? OWNED_PREFIXES.get(prefix)! : VALIDATION_PREFIXES.get(prefix)!;
}

/** @internal Exact owner-issued cut relation, never an admission or raw-copy shortcut. */
export function runtimeEventPrefixesHaveSameOwnedCut(left: RuntimeEventPrefix, right: RuntimeEventPrefix): boolean {
  if (!isLocatedPrefix(left) || !isLocatedPrefix(right) || left.kind !== right.kind ||
      left.selection.through !== right.selection.through || left.selection.length !== right.selection.length) return false;
  if (isOwnedRuntimeEventPrefix(left) && isOwnedRuntimeEventPrefix(right)) {
    return left.selection.sharesSource(right.selection) && left.selection.extends(right.selection) &&
      right.selection.extends(left.selection);
  }
  if (!isValidationRuntimeEventPrefix(left) || !isValidationRuntimeEventPrefix(right)) return false;
  const a = VALIDATION_PREFIXES.get(left)!, b = VALIDATION_PREFIXES.get(right)!;
  if (a.scopeKey !== b.scopeKey) return false;
  if (a.scopedFrom !== undefined || b.scopedFrom !== undefined) {
    return a.scopedFrom !== undefined && b.scopedFrom !== undefined &&
      runtimeEventPrefixesHaveSameOwnedCut(a.scopedFrom, b.scopedFrom);
  }
  return left.selection.length === left.selection.through && a.scopeKey === "all" &&
    runtimeEventPrefixesHaveSameOwnedCut(a.predecessor, b.predecessor) &&
    canonicalEquals(a.candidate, b.candidate);
}
function selectValidationPrefix(base: OwnedRuntimeEventPrefix, candidate: RuntimeEvent,
  selection: RuntimeHistorySelection, source = new RuntimeDerivationSource(), selectedScope = "all",
  predecessor: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix = base): ValidationRuntimeEventPrefix {
  const prefix: ValidationRuntimeEventPrefix = Object.freeze({ kind: "runtime_validation_event_prefix", selection });
  VALIDATION_PREFIXES.set(prefix, { base, candidate, selection, source, scopeKey: selectedScope, predecessor }); return prefix;
}
function selectLocatedSubset(prefix: OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix,
  selection: RuntimeHistorySelection, selectedScope = locatedReceipt(prefix).scopeKey): OwnedRuntimeEventPrefix | ValidationRuntimeEventPrefix {
  if (prefix.kind === "owned_runtime_event_prefix") {
    const result = selectOwnedRuntimeEventPrefix(selection), proof = OWNED_PREFIXES.get(result)!;
    OWNED_PREFIXES.set(result, { ...proof, scopeKey: selectedScope }); return result;
  }
  const proof = VALIDATION_PREFIXES.get(prefix)!;
  return selectValidationPrefix(proof.base, proof.candidate, selection, proof.source, selectedScope, proof.predecessor);
}
/** @internal Constant-cost exact owner relation, with raw explicit-array behavior kept separately. */
export function runtimeEventPrefixIsExactExtension(before: RuntimeEventPrefix, after: RuntimeEventPrefix, event: RuntimeEvent): boolean {
  if (isLocatedPrefix(before) && isLocatedPrefix(after)) {
    if (before.selection.length !== before.selection.through || after.selection.length !== after.selection.through ||
        after.selection.length !== before.selection.length + 1) return false;
    if (isValidationRuntimeEventPrefix(after)) {
      const proof = VALIDATION_PREFIXES.get(after)!;
      return proof.predecessor.selection.sharesSource(before.selection) && proof.predecessor.selection.through === before.selection.through &&
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

/** @internal Existing pure multi-candidate planners borrow one genuine base
 * plus a checked finite ordered suffix. This never returns admitted history. */
export function extendRuntimeEventPlanPrefixForValidation(prefix: RuntimeEventPrefix, event: RuntimeEvent): RuntimeEventPrefix {
  if (prefix.kind === "validated_runtime_event_prefix") return extendRuntimeEventPrefixForValidation(prefix, event);
  if (!isLocatedPrefix(prefix) || !isImmutableRuntimeValue(event))
    throw new TypeError("pure plan requires its genuine base and immutable candidate");
  const profileAfter = isOwnedRuntimeEventPrefix(prefix)
    ? validateOwnedRuntimeHistoryCandidate(prefix.selection, event)
    : validateRuntimeHistoryCandidate(prefix.selection, event);
  const base = isOwnedRuntimeEventPrefix(prefix) ? prefix : VALIDATION_PREFIXES.get(prefix)!.base;
  return selectValidationPrefix(base, event, prefix.selection.validationSuccessor(event, profileAfter),
    new RuntimeDerivationSource(), "all", prefix);
}

/** @internal Complete Public prefix JSON is an explicit canonical output, not
 * a retained operational array. The existing canonical writer selects one body. */
export function writeRuntimeEventPrefixValue(prefix: RuntimeEventPrefix, write: (part: string) => void): void {
  write("{\"events\":["); let comma = false;
  for (let index = 0; index < runtimeEventPrefixExtent(prefix).count; index++) {
    if (comma) write(","); comma = true;
    writeCanonicalJson(runtimeEventAtPrefixIndex(prefix, index)!, write);
  }
  write("],\"kind\":\"validated_runtime_event_prefix\"}");
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
  if (isLocatedPrefix(authorityPrefix)) {
    const selected = selectLocatedSubset(authorityPrefix, authorityPrefix.selection.selectScope(scope), scopeKey(scope));
    if (isValidationRuntimeEventPrefix(authorityPrefix) && isValidationRuntimeEventPrefix(selected))
      VALIDATION_PREFIXES.set(selected, { ...VALIDATION_PREFIXES.get(selected)!, scopedFrom: authorityPrefix });
    return selected;
  }
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

const CHECKED_RECORDS = Symbol("runtime_prefix_checked_records");
/** @internal A module-constant reader's checked record over one immutable
 * admitted cut is a derived fact of that cut. It is acquired once and recorded
 * in the cut's own computation territory under the reader's constant and the
 * canonical digest of the context data (the cut itself is the territory, so it
 * is not part of the data); every later identical read returns the record.
 * The territory spans every cut of one ordered lineage, so the cut's extent is
 * part of the key. Only a `one` outcome is recorded: any other outcome is
 * acquired again, so the owner's refusal channel reproduces its first refusal.
 * A validation view, and a context that is not I-JSON, record nothing.
 * Nothing is persisted, and nothing outlives the territory. */
export function checkedRecordAtPrefix<P>(prefix: RuntimeEventPrefix, reader: object, context: JsonValue,
  acquire: () => CheckedRecord<RuntimeEvent, P>): CheckedRecord<RuntimeEvent, P> {
  if (isValidationRuntimeEventPrefix(prefix)) return acquire();
  const extent = runtimeEventPrefixExtent(prefix);
  let key: Sha256Digest;
  // A context that is not I-JSON names no record; the reader acquires as before.
  try { key = sha256Canonical(context); } catch { return acquire(); }
  const cuts = runtimePrefixComputation(prefix, CHECKED_RECORDS,
    () => new Map<string, WeakMap<object, Map<Sha256Digest, CheckedRecord<RuntimeEvent, unknown>>>>());
  const cut = extent.count + ":" + extent.lastOrdinal;
  let readers = cuts.get(cut);
  if (readers === undefined) cuts.set(cut, readers = new WeakMap());
  let records = readers.get(reader);
  if (records === undefined) readers.set(reader, records = new Map());
  const recorded = records.get(key);
  if (recorded !== undefined) return recorded as CheckedRecord<RuntimeEvent, P>;
  const checked = acquire();
  if (checked.kind === "one") records.set(key, checked);
  return checked;
}

const CANONICAL_PREFIX = Symbol("ordered_canonical_prefix_digest");
class CanonicalPrefixDerivation {
  readonly hash = createHash("sha256").update("[");
  readonly digests: Sha256Digest[] = [`sha256:${this.hash.copy().update("]").digest("hex")}`];
  advance(events: readonly RuntimeEvent[]): void {
    for (let index = this.digests.length - 1; index < events.length; index++) {
      // Encode before mutating the hash, so a refused value cannot contaminate it.
      const event = events[index];
      if (event === undefined) throw new TypeError("runtime event prefix advance reached an absent event");
      const encoded = canonicalJson(event);
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
      writeCanonicalJson(event, part => this.hash.update(part));
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

/** Typed fail-closed cause of one native context body read. */
export type WorksiteContextBodyRefusalCode = "malformed" | "missing" | "pending" | "foreign" | "tampered" | "stale" | "denied";
/** The consumer's own Run and read grant; a body never widens either. An
 * invocation with admitted retained-source use also carries the exact selected
 * Results of that source as its owner transports them (`sourceResults`); a
 * body held in another Run is readable only as the member that one of those
 * native work Results declares in its admitted task context. */
export type WorksiteContextBodyUse = Readonly<{ runId: string; readable?: (relativePath: string) => boolean;
  sourceResults?: readonly WorksiteContextBodySourceResult[] }>;
export type WorksiteContextBodySourceResult = Readonly<{ resultRef: string; resultDigest: string; cCallRef: string }>;
export type WorksiteContextBodyResolution = Readonly<{ kind: "worksite_context_body"; relativePath: string; digest: Sha256Digest;
  byteLength: number; bytes: Buffer; holder: Readonly<{ eventRef: string; resultRef: string; resultDigest: Sha256Digest }> |
    Readonly<{ eventRef: string; basisRef: string; basisDigest: Sha256Digest }> | null }> |
  Readonly<{ kind: "worksite_context_body_refusal"; code: WorksiteContextBodyRefusalCode; relativePath: string; reason: string }>;

const HELD_CONTEXT_BODIES = Symbol("held_native_context_bodies");
type HeldContextBodies = { readonly events: Map<string, RuntimeEvent | null>; readonly members: Map<string, Map<string, readonly (string | number)[]>>;
  acquisitions: number };
const contextScope = (c: Pick<WorksiteContextObservation, "workspaceAuthorityBasisRef" | "workspaceAuthorityBasisDigest" | "workspaceBindingIdentity" | "workspaceBindingDigest">) =>
  [c.workspaceAuthorityBasisRef, c.workspaceAuthorityBasisDigest, c.workspaceBindingIdentity, c.workspaceBindingDigest].join("\0");
/** Derived facts of committed bodies only: a validation candidate is never a holder. */
function committedBodyPrefix(prefix: RuntimeEventPrefix): RuntimeEventPrefix | undefined {
  return isValidationRuntimeEventPrefix(prefix) ? runtimeEventValidationBase(prefix) : prefix;
}
function heldContextBodies(prefix: RuntimeEventPrefix): HeldContextBodies {
  return runtimePrefixComputation(prefix, HELD_CONTEXT_BODIES, () => ({ events: new Map(), members: new Map(), acquisitions: 0 }));
}
/** One acquisition of a committed holder Result per derivation territory. */
function heldResultEvent(prefix: RuntimeEventPrefix, held: HeldContextBodies, eventRef: string): RuntimeEvent | null {
  if (held.events.has(eventRef)) return held.events.get(eventRef)!;
  const event = runtimeEventAtPrefix(prefix, eventRef) ?? null;
  held.acquisitions++; held.events.set(eventRef, event);
  return event;
}
/** The held value of one admitted holder: a Result's `value` or a basis's raw input. */
const heldValue = (event: RuntimeEvent): unknown => {
  const payload = event.payload as Readonly<Record<string, JsonValue>> | undefined;
  return event.kind === "basis_admitted" ? payload?.rawInputValue : payload?.value;
};
function heldMembers(event: RuntimeEvent, held: HeldContextBodies): Map<string, readonly (string | number)[]> {
  let members = held.members.get(event.eventId);
  if (members !== undefined) return members;
  members = new Map();
  for (const holder of nativeContextBodyHolders(heldValue(event))) {
    const scope = contextScope(holder.context as unknown as WorksiteContextObservation);
    holder.entries.forEach((entry, index) => {
      const e = entry as unknown as WorksiteContextEntry;
      if (typeof e === "object" && e !== null && e.state === "file" && e.encoding === "base64") {
        const key = [scope, e.relativePath, e.digest].join("\0");
        if (!members!.has(key)) members!.set(key, Object.freeze([...holder.path, "entries", index]));
      }
    });
  }
  held.members.set(event.eventId, members);
  return members;
}
function admittedHolderEnvelopes(prefix: RuntimeEventPrefix, key: string) {
  return indexedRuntimeEventEnvelopes(prefix, key).filter(row => row.kind === "c_call_result_admitted");
}
function admittedBasisEnvelopes(prefix: RuntimeEventPrefix, basisRef: string) {
  return indexedRuntimeEventEnvelopes(prefix, "payload:basisRef:" + basisRef).filter(row => row.kind === "basis_admitted" && row.basisId === basisRef);
}
const sameMember = (a: Readonly<Record<string, unknown>>, b: WorksiteContextBodyMember) =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(b).every(([k, x]) => k === "path"
    ? Array.isArray(a.path) && a.path.length === (x as readonly unknown[]).length && a.path.every((step, i) => step === (x as readonly unknown[])[i])
    : a[k] === x);
/** Admitted retained-source use -> selected native work Result -> its task
 * context -> exact member for this path and version. The selected Result is one
 * exact successful admission of its source identity whose task context shares
 * the consumer's authority basis and binding. A prospective Result's task is
 * the raw input of its own admitted basis, and an inline task-context body
 * names that basis input; a retained original Result carries its task and an
 * inline body names that Result. Holder admission, digest, coordinate, bytes
 * and read scope remain the resolver's. No other Result of the source Run is selected. */
function sourceUseDeclaresMember(prefix: RuntimeEventPrefix, held: HeldContextBodies, use: WorksiteContextBodyUse, scope: string,
  entry: Readonly<{ relativePath: string; digest: string; byteLength: number }>, member: WorksiteContextBodyMember): boolean {
  const record = (x: unknown): x is Readonly<Record<string, JsonValue>> => typeof x === "object" && x !== null && !Array.isArray(x);
  for (const selected of use.sourceResults ?? []) {
    const rows = admittedHolderEnvelopes(prefix, "payload:resultRef:" + selected.resultRef);
    if (rows.length !== 1 || rows[0]!.aggregateId !== selected.cCallRef) continue;
    const event = heldResultEvent(prefix, held, rows[0]!.eventId), payload = event?.payload;
    if (!record(payload) || payload.resultClass !== "success" || payload.resultRef !== selected.resultRef ||
      payload.resultDigest !== selected.resultDigest || !record(payload.value) || payload.value.kind !== "native_workspace_work_observation" ||
      Object.hasOwn(payload.value, "assessment")) continue;
    const original = record(payload.value.task);
    // The task's admitted holder: the retained Result itself, or the Result's own basis input.
    const basis = original || typeof event?.basisId !== "string" ? undefined
      : admittedBasisEnvelopes(prefix, event.basisId).map(row => heldResultEvent(prefix, held, row.eventId));
    const basisEvent = basis?.length === 1 ? basis[0] ?? null : null;
    const basisPayload = basisEvent?.payload;
    const taskValue = original ? payload.value : record(basisPayload) && basisEvent!.runId === event!.runId &&
      sha256Canonical(basisPayload.rawInputValue ?? null) === payload.value.inputDigest ? basisPayload.rawInputValue : undefined;
    const task = nativeContextBodyHolders(taskValue).find(h => original
      ? h.path.length === 2 && h.path[0] === "task" && h.path[1] === "context" : h.path.length === 1 && h.path[0] === "context");
    if (task === undefined || (record(taskValue) && "assessment" in (original ? taskValue.task as Record<string, unknown> : taskValue)) ||
      contextScope(task.context as unknown as WorksiteContextObservation) !== scope) continue;
    for (const [index, raw] of task.entries.entries()) {
      const e = raw as unknown as WorksiteContextEntry;
      if (!record(raw) || e.state !== "file" || e.relativePath !== entry.relativePath || e.digest !== entry.digest || e.byteLength !== entry.byteLength) continue;
      const declared = e.encoding === "admitted_member" ? e.member : e.encoding !== "base64" ? undefined : original
        ? { resultRef: selected.resultRef, resultDigest: selected.resultDigest, path: [...task.path, "entries", index] }
        : { basisRef: (basisPayload as Readonly<Record<string, JsonValue>>).basisRef, basisDigest: (basisPayload as Readonly<Record<string, JsonValue>>).basisDigest, path: [...task.path, "entries", index] };
      if (record(declared) && sameMember(declared, member)) return true;
    }
  }
  return false;
}

/** @internal Producer carriage at the held-prefix owner. Each inline body that
 * an earlier committed same-Run Result already holds inline at a declared
 * native context coordinate, for the same path, digest, authority basis and
 * binding, becomes an exact admitted member reference. Otherwise a holder in
 * another Run is used only when the consumer's admitted retained-source use
 * declares that exact member (`sourceUseDeclaresMember`). Every other body
 * stays inline and is born by the Result that admits this context. The
 * observed identity is unchanged and no worksite is read. */
export function reuseWorksiteContextBodiesAtPrefix<T extends WorksiteContextObservation>(prefix: RuntimeEventPrefix, context: T,
  use: WorksiteContextBodyUse): T {
  if (isValidationRuntimeEventPrefix(prefix)) return context;
  try { return reuseHeldContextBodies(prefix, context, use); }
  // Carriage only removes repeated bytes: an unavailable derivation keeps every body inline.
  catch { return context; }
}
function reuseHeldContextBodies<T extends WorksiteContextObservation>(prefix: RuntimeEventPrefix, context: T, use: WorksiteContextBodyUse): T {
  const held = heldContextBodies(prefix), scope = contextScope(context);
  let reused = false;
  const entries = context.entries.map(entry => {
    if (entry.state !== "file" || entry.encoding !== "base64") return entry;
    let selected: WorksiteContextBodyMember | undefined;
    for (const row of indexedRuntimeEventEnvelopes(prefix, NATIVE_CONTEXT_BODY_KEY + entry.digest)) {
      if (row.kind !== "c_call_result_admitted" && row.kind !== "basis_admitted") continue;
      const own = row.runId === use.runId;
      if (!own && (use.sourceResults === undefined || selected !== undefined)) continue;
      const event = heldResultEvent(prefix, held, row.eventId), payload = event?.payload as Readonly<Record<string, JsonValue>> | undefined;
      if (event === null || payload === undefined) continue;
      const basis = event.kind === "basis_admitted";
      if (basis ? typeof payload.basisRef !== "string" || typeof payload.basisDigest !== "string" || event.basisId !== payload.basisRef
        : typeof payload.resultRef !== "string" || typeof payload.resultDigest !== "string" ||
          (payload.resultClass !== "success" && payload.resultClass !== "failure")) continue;
      const path = heldMembers(event, held).get([scope, entry.relativePath, entry.digest].join("\0"));
      if (path === undefined) continue;
      const member: WorksiteContextBodyMember = basis ? { basisRef: payload.basisRef as string, basisDigest: payload.basisDigest as Sha256Digest, path }
        : { resultRef: payload.resultRef as string, resultDigest: payload.resultDigest as Sha256Digest, path };
      if (own) { selected = member; break; }
      if (sourceUseDeclaresMember(prefix, held, use, scope, entry, member)) selected = member;
    }
    if (selected === undefined) return entry;
    reused = true;
    const { encoding: _encoding, bytes: _bytes, ...facts } = entry;
    return { ...facts, encoding: "admitted_member" as const, member: selected };
  });
  return reused ? deepFreeze({ ...context, entries }) as T : context;
}

/** @internal Exact selected-member read at a raw ingress, effect, helper or
 * cold-recovery boundary. A reference is only a locator: the owner rejoins the
 * committed Result, its digest and Run, the declared member coordinate, the
 * holder's authority basis and binding, the consumer's path, digest and read
 * grant, and the held bytes. Another Run's holder additionally requires that
 * the consumer's admitted retained-source use declares this exact member.
 * Every other case refuses with its typed cause. */
export function resolveWorksiteContextBodyAtPrefix(prefix: RuntimeEventPrefix, context: WorksiteContextObservation,
  relativePath: string, use: WorksiteContextBodyUse): WorksiteContextBodyResolution {
  const refuse = (code: WorksiteContextBodyRefusalCode, reason: string): WorksiteContextBodyResolution =>
    Object.freeze({ kind: "worksite_context_body_refusal", code, relativePath, reason });
  const verify = (entry: { digest: Sha256Digest; byteLength: number }, base64: unknown) => {
    if (typeof base64 !== "string") return null;
    const bytes = Buffer.from(base64, "base64");
    return bytes.toString("base64") === base64 && bytes.length === entry.byteLength && sha256Bytes(bytes) === entry.digest ? bytes : null;
  };
  try {
    if (typeof relativePath !== "string" || !context.readRoots.some(root => root === "." || root === relativePath || relativePath.startsWith(root + "/")) ||
      (use.readable !== undefined && !use.readable(relativePath))) return refuse("denied", "path is outside the consumer's read scope or grant");
    const entry = context.entries.find(e => e.relativePath === relativePath);
    if (entry === undefined || entry.state !== "file") return refuse("missing", "the consumer context observes no file at this path");
    if (entry.encoding === "base64") {
      const bytes = verify(entry, entry.bytes);
      return bytes === null ? refuse("tampered", "inline body differs from its observed digest or length")
        : Object.freeze({ kind: "worksite_context_body", relativePath, digest: entry.digest, byteLength: entry.byteLength, bytes, holder: null });
    }
    const member = (entry as { member?: unknown }).member as Readonly<Record<string, unknown>> | undefined;
    const basisMember = typeof member === "object" && member !== null && Object.hasOwn(member, "basisRef");
    const [holderRef, holderDigest] = basisMember ? [member!.basisRef, member!.basisDigest] : [member?.resultRef, member?.resultDigest];
    if (entry.encoding !== "admitted_member" || typeof member !== "object" || member === null || typeof holderRef !== "string" ||
      typeof holderDigest !== "string" || !Array.isArray(member.path)) return refuse("malformed", "admitted member reference is malformed");
    const memberPath = member.path as readonly (string | number)[];
    const committed = committedBodyPrefix(prefix);
    if (committed === undefined) return refuse("pending", "no committed predecessor prefix");
    const rows = basisMember ? admittedBasisEnvelopes(committed, holderRef) : admittedHolderEnvelopes(committed, "payload:resultRef:" + holderRef);
    if (rows.length === 0) return refuse("pending", "referenced holder is not admitted at this prefix");
    if (rows.length !== 1) return refuse("tampered", "referenced holder is not one exact admission");
    const otherRun = rows[0]!.runId !== use.runId;
    if (otherRun && use.sourceResults === undefined) return refuse("foreign", "referenced holder belongs to another Run");
    const held = heldContextBodies(committed), event = heldResultEvent(committed, held, rows[0]!.eventId);
    const payload = event?.payload as Readonly<Record<string, JsonValue>> | undefined;
    if (event === null || payload === undefined) return refuse("pending", "referenced holder body is unavailable");
    if ((basisMember ? payload.basisDigest : payload.resultDigest) !== holderDigest) return refuse("tampered", "referenced holder digest differs from its admission");
    if (!basisMember && payload.resultClass !== "success" && payload.resultClass !== "failure") return refuse("pending", "referenced Result is not a committed body");
    const holder = nativeContextBodyHolders(heldValue(event)).find(h => memberPath.length === h.path.length + 2 &&
      h.path.every((step, i) => memberPath[i] === step) && memberPath[h.path.length] === "entries");
    const index = memberPath.at(-1);
    if (holder === undefined || !Number.isSafeInteger(index)) return refuse("tampered", "reference names no declared native context member");
    if (contextScope(holder.context as unknown as WorksiteContextObservation) !== contextScope(context))
      return refuse("foreign", "holder context belongs to another authority basis or binding");
    const source = holder.entries[index as number] as unknown as WorksiteContextEntry | undefined;
    if (typeof source !== "object" || source === null || source.state !== "file" || source.encoding !== "base64" || source.relativePath !== relativePath)
      return refuse("tampered", "referenced member is not one inline body of this path");
    if (source.digest !== entry.digest || source.byteLength !== entry.byteLength) return refuse("stale", "referenced member holds another version of this path");
    const bytes = verify(entry, source.bytes);
    if (bytes === null) return refuse("tampered", "held body differs from its digest or length");
    if (otherRun && !sourceUseDeclaresMember(committed, held, use, contextScope(context), entry, member as WorksiteContextBodyMember))
      return refuse("foreign", "another Run's member is not declared by a selected native Result of the consumer's admitted source use");
    return Object.freeze({ kind: "worksite_context_body", relativePath, digest: entry.digest, byteLength: entry.byteLength, bytes,
      holder: Object.freeze(basisMember ? { eventRef: event.eventId, basisRef: holderRef, basisDigest: holderDigest as Sha256Digest }
        : { eventRef: event.eventId, resultRef: holderRef, resultDigest: holderDigest as Sha256Digest }) });
  } catch (error) { return refuse("malformed", `native context body read failed: ${String(error)}`); }
}
/** One historical context use the revision owner derives from its authenticated
 * subject: the exact admitted parent/cause/construction Result, its CCall and
 * genuine historical Run, and the source binding the admitted intake's binding
 * cover relates to the consumer's current W. It presents historical bytes only;
 * it grants no source, read, currentness or effect authority. */
export type WorksiteContextBodyHistoricalUse = Readonly<{ resultRef: string; resultDigest: string; cCallRef: string; runId: string;
  coveredBinding: Readonly<{ bindingId: string; bindingDigest: string }> }>;
/** Fixed declared envelope coordinates of a historical context. They are typed
 * slots of the admitted value kind, never a recursive carrier-shaped search. */
const HISTORICAL_CONTEXT_POSITIONS: Readonly<Record<string, readonly (readonly string[])[]>> = Object.freeze({
  semantic_stage_envelope: [["context"], ["evidence", "constructionResult", "after"], ["evidence", "executionObservation", "task", "sourceNativeWork", "after"]],
  semantic_revision_envelope: [["current", "context"], ["current", "evidence", "constructionResult", "after"],
    ["current", "evidence", "executionObservation", "task", "sourceNativeWork", "after"], ["revisionBasis", "request", "nativeWorksite", "context"]],
  native_workspace_work_observation: [["after"], ["task", "context"]],
  native_workspace_work_failure: [["after"], ["task", "context"]],
});
/** @internal Historical member read for a revision presentation. The context
 * must equal the one held at a declared coordinate of a declared committed
 * Result and carry its covered source binding; its bytes then resolve under that
 * Result's own Run through the unchanged resolver (holder admission, digest,
 * basis, coordinate, scope, path, version, length, read roots and bytes). */
export function resolveHistoricalWorksiteContextBodyAtPrefix(prefix: RuntimeEventPrefix, context: WorksiteContextObservation,
  relativePath: string, uses: readonly WorksiteContextBodyHistoricalUse[]): WorksiteContextBodyResolution {
  const refuse = (code: WorksiteContextBodyRefusalCode, reason: string): WorksiteContextBodyResolution =>
    Object.freeze({ kind: "worksite_context_body_refusal", code, relativePath, reason });
  try {
    const committed = committedBodyPrefix(prefix);
    if (committed === undefined) return refuse("pending", "no committed predecessor prefix");
    const record = (x: unknown): x is Readonly<Record<string, JsonValue>> => typeof x === "object" && x !== null && !Array.isArray(x);
    const held = heldContextBodies(committed);
    let refusal: WorksiteContextBodyResolution | null = null;
    for (const use of Array.isArray(uses) ? uses : []) {
      if (!record(use) || !record(use.coveredBinding) || context.workspaceBindingIdentity !== use.coveredBinding.bindingId ||
        context.workspaceBindingDigest !== use.coveredBinding.bindingDigest) continue;
      const rows = admittedHolderEnvelopes(committed, "payload:resultRef:" + use.resultRef);
      if (rows.length !== 1) { refusal ??= refuse(rows.length === 0 ? "pending" : "tampered", "declared historical Result is not one exact admission at this prefix"); continue; }
      if (rows[0]!.aggregateId !== use.cCallRef || rows[0]!.runId !== use.runId) { refusal ??= refuse("foreign", "declared historical Result belongs to another CCall or Run"); continue; }
      const event = heldResultEvent(committed, held, rows[0]!.eventId), payload = event?.payload;
      if (!record(payload) || payload.resultRef !== use.resultRef || payload.resultDigest !== use.resultDigest ||
        (payload.resultClass !== "success" && payload.resultClass !== "failure") || !record(payload.value) || typeof payload.value.kind !== "string") {
        refusal ??= refuse("tampered", "declared historical Result differs from its admission"); continue;
      }
      const value: Readonly<Record<string, JsonValue>> = payload.value, kind = value.kind as string;
      const positions = Object.hasOwn(HISTORICAL_CONTEXT_POSITIONS, kind) ? HISTORICAL_CONTEXT_POSITIONS[kind]! : [];
      const declared = positions.some(path => {
        let cursor: unknown = value;
        for (const step of path) cursor = record(cursor) ? cursor[step] : undefined;
        return record(cursor) && cursor.kind === "worksite_context_observation" && canonicalEquals(cursor, context as unknown as JsonValue);
      });
      if (!declared) { refusal ??= refuse("foreign", "context is not held at a declared coordinate of the declared historical Result"); continue; }
      return resolveWorksiteContextBodyAtPrefix(committed, context, relativePath, { runId: use.runId });
    }
    return refusal ?? refuse("foreign", "no authenticated historical revision use declares this context and binding");
  } catch (error) { return refuse("malformed", `historical context body read failed: ${String(error)}`); }
}
/** @internal One consumer's selected-body reader over one context at this prefix. */
export function worksiteContextBodyReaderAtPrefix(prefix: RuntimeEventPrefix, context: WorksiteContextObservation,
  use: WorksiteContextBodyUse): (entry: Readonly<{ relativePath: string }>) => Buffer | null {
  return entry => {
    const read = resolveWorksiteContextBodyAtPrefix(prefix, context, entry.relativePath, use);
    return read.kind === "worksite_context_body" ? read.bytes : null;
  };
}
/** @internal Holder Result acquisitions recorded in this prefix's derivation territory. */
export function worksiteContextBodyAcquisitionsAtPrefix(prefix: RuntimeEventPrefix): number {
  const committed = committedBodyPrefix(prefix);
  return committed === undefined ? 0 : heldContextBodies(committed).acquisitions;
}
