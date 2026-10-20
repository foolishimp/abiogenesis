import { type Sha256Digest } from "../shared/digests.js";
import { type RootEventProfileSchedule, type RuntimeEvent, type RuntimeEventScope } from "./event_store.js";
declare const VALIDATED_RUNTIME_EVENT_PREFIX: unique symbol;
declare const PROFILE_SOURCE: unique symbol;
export interface ValidatedRuntimeEventPrefix {
    readonly kind: "validated_runtime_event_prefix";
    readonly events: readonly RuntimeEvent[];
    readonly [VALIDATED_RUNTIME_EVENT_PREFIX]: true;
    readonly [PROFILE_SOURCE]: readonly RuntimeEvent[];
}
/** A tentative extension remains under the caller's owner derivation. It gives
 * no durable authority; transaction rollback discards its source. */
export declare function extendRuntimeEventPrefixForValidation(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent): ValidatedRuntimeEventPrefix;
/** Check a proposed suffix without advancing any accepted derivation. The
 * caller still owns event-envelope admission and the eventual checked append. */
export declare function validateRuntimeEventPrefixExtension(prefix: ValidatedRuntimeEventPrefix, event: RuntimeEvent): void;
export declare function isImmutableRuntimeValue(value: unknown, visited?: Set<object>): boolean;
export declare function runtimeEventsFromValidatedPrefix(prefix: ValidatedRuntimeEventPrefix): readonly RuntimeEvent[];
export declare function runtimePrefixComputation<T>(prefix: ValidatedRuntimeEventPrefix, owner: symbol, construct: () => T): T;
/** Exact profile-source value for owner derivation authentication. */
export declare function runtimeEventProfileSourceFromValidatedPrefix(prefix: ValidatedRuntimeEventPrefix): readonly RuntimeEvent[];
export declare function runtimeEventProfileScheduleFromValidatedPrefix(prefix: ValidatedRuntimeEventPrefix): RootEventProfileSchedule;
export declare function unscopedRuntimeEventPrefix(prefix: ValidatedRuntimeEventPrefix): ValidatedRuntimeEventPrefix;
export declare function validatedRuntimeEventPrefixThroughEvent(prefix: ValidatedRuntimeEventPrefix, eventId: string): ValidatedRuntimeEventPrefix;
export declare function validatedRuntimeEventPrefixBeforeEvent(prefix: ValidatedRuntimeEventPrefix, eventId: string): ValidatedRuntimeEventPrefix;
export declare function selectValidatedRuntimeEventPrefix(admittedEvents: readonly RuntimeEvent[], scope?: RuntimeEventScope): ValidatedRuntimeEventPrefix;
/** Derive another scope from the already authenticated immutable authority
 * value. Do not walk its payload bytes again to rediscover immutability. */
export declare function selectRuntimeEventPrefixFromAuthority(authorityPrefix: ValidatedRuntimeEventPrefix, scope: RuntimeEventScope): ValidatedRuntimeEventPrefix;
export declare function indexedRuntimeEvents(prefix: ValidatedRuntimeEventPrefix, key: string): readonly RuntimeEvent[];
/** Exactly SHA256(canonicalJson(events)); old bytes are never re-encoded.
 * The checkpoints are disposable derived facts, not persisted authority. */
export declare function runtimeEventPrefixDigest(prefix: ValidatedRuntimeEventPrefix): Sha256Digest;
export {};
