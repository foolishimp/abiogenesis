import { type ExecutionBasis, type OpenedTraversalScope, type ReplayState, type RuntimeAdmissionBasis } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { GtlGraph } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { GraphValidation } from "../validator/graph.js";
import type { CCallLocusCandidate } from "../abg/c_call.js";
import type { TraversalCursor, TraverseInput } from "./traversal.js";
export interface ExecutionClock {
    readonly eventTime: string;
    readonly correlationId: string;
}
export declare function sameCanonical(left: unknown, right: unknown): boolean;
export declare function canonicalDigest(value: unknown): `sha256:${string}` | null;
export declare function runtimePrefixAtDurable(prefix: DurablePrefixCoordinate, runId: string): import("../abg/event_prefix.js").ValidatedRuntimeEventPrefix;
export declare function replayAtDurable(prefix: DurablePrefixCoordinate, runId: string): ReplayState;
export declare function admissionBasis(clock: ExecutionClock, stage: string): RuntimeAdmissionBasis;
export declare function isExactLocusStep(stop: CCallLocusCandidate | TraversalCursor, term: Readonly<CProgramNode>): boolean;
export declare function materializedInputAtCursor(graph: Readonly<GtlGraph>, cursor: TraversalCursor | null): Readonly<{
    inputContractRef: string;
    value: Readonly<Record<string, JsonValue>>;
}> | null;
export declare function traversalBasis(input: Readonly<{
    program: TraverseInput["program"];
    graphFunction: TraverseInput["graphFunction"];
    graph: TraverseInput["graph"];
    graphValidation: GraphValidation;
    executionBasis: ExecutionBasis;
    openedTraversalScope: OpenedTraversalScope;
}>): TraverseInput;
