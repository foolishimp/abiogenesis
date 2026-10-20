import { type JsonValue } from "../shared/canonical_json.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { RuntimeEvent, RuntimeEventCandidate } from "./event_store.js";
type BodySlot = "basis_input" | "c_call_result_value";
interface InlineBody {
    readonly event: RuntimeEvent;
    readonly slot: BodySlot;
    readonly value: JsonValue;
    readonly digest: Sha256Digest;
}
export type InlineEventBodies = Map<string, InlineBody>;
export declare function inlineEventBody(event: RuntimeEvent): InlineBody | null;
/** Detach caller data first; only this store's committed inline body may be
 * shared. Source eligibility and physical encoding remain the durable owner's. */
export declare function captureRuntimeEventCandidate(candidate: RuntimeEventCandidate, committed?: Pick<ReadonlyMap<string, InlineBody>, "get">): RuntimeEventCandidate;
/** The caller stages additions and publishes them only with the durable batch. */
export declare function encodeEventBody(event: RuntimeEvent, committed: InlineEventBodies, staged: InlineEventBodies): string;
/** Resolves only already validated, physically inline sources from this stream.
 * The event store still validates the complete restored envelope and all stamps. */
export declare function decodeEventBody(record: unknown, inlineByEvent: InlineEventBodies): {
    readonly event: unknown;
    readonly physicallyInline: boolean;
};
export {};
