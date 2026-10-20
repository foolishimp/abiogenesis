import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { RuntimeEvent } from "./event_store.js";
/** Extend the existing replay fact's dependency version; owns no cache. */
export declare function registeredSelectionInputRelationVersion(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): string;
/** Project an already admitted binding, never choose a target during replay.
 * The route's application identity is issued only after declaration/target/input
 * admission. Source lineage authenticates the raw input retained by that route. */
export declare function projectRegisteredSelectionInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): import("../validator/raw_admission.js").RawAdmittedValue<unknown> | null;
