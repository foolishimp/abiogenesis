import * as Abg from "../abg/index.js";
import type { AbgEventStore, ActorRuntimeBinding, AdmittedImplementationResolutionRow, AdmittedImplementationSet, ExecutionBasis, OpenedTraversalScope } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ClosureContract, GraphFunction, GtlGraph, GtlProgram, RecurseApplication } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type ChildTraversalBasis, type PreparedChildTraversal } from "./child_traversal.js";
import { type ExecutionClock } from "./operator_support.js";
import { type ExecutableTraversalCompletion } from "./traversal_completion.js";
export interface CompleteExecutableTraversalInput<Input> {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly traversalStop: Abg.ExecutableCCallLocusCandidate;
    readonly implementationSet: AdmittedImplementationSet;
    readonly implementationResolution: AdmittedImplementationResolutionRow;
    readonly leafPort: LeafInvocationPort;
    readonly input: Readonly<Input>;
    readonly inputDigest: `sha256:${string}`;
    readonly closureContract: Readonly<ClosureContract>;
    readonly actorRuntimeBinding?: ActorRuntimeBinding;
    readonly deferFailedRunStop?: boolean;
    readonly deferToApplication?: true;
    readonly completionScopeClass: "root" | "child";
    readonly clock: ExecutionClock;
}
export interface RestoreDeferredRecursionInput {
    readonly traversalInput: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
    readonly application: Readonly<RecurseApplication>;
    readonly cCallRef: string;
    readonly resultRef: string;
    readonly judgmentRef: string;
}
export interface RecursionChildFoldFrame {
    readonly kind: "recursion_child_fold_frame";
    readonly parentClock: ExecutionClock;
    readonly parentScopeClass: "root" | "child";
    readonly traversalInput: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
    readonly application: Readonly<RecurseApplication>;
    readonly restored: ExecutableTraversalCompletion;
    readonly restoration: RestoreDeferredRecursionInput;
    readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
    readonly graphEntryInputDigest: `sha256:${string}`;
    readonly leafOrdinal: number;
    readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
    readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
    readonly childInput: PreparedChildTraversal["input"];
    readonly childInputDigest: PreparedChildTraversal["inputDigest"];
}
export type RecursionApplicationStep = Readonly<{
    kind: "recursion_completion";
    completion: ExecutableTraversalCompletion;
}> | Readonly<{
    kind: "recursion_child_request";
    frame: RecursionChildFoldFrame;
    prepared: PreparedChildTraversal;
    correlationId: string;
}>;
export declare function recursionApplication(graph: Readonly<GtlGraph>, compositionRef: string | null): Readonly<RecurseApplication> | null;
export declare function restoreDeferredRecursion(input: RestoreDeferredRecursionInput): ExecutableTraversalCompletion | null;
export declare function beginRecursionApplication(input: Readonly<{
    traversalInput: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>;
    childTraversalBasis: ChildTraversalBasis;
    parentClock: ExecutionClock;
    application: Readonly<RecurseApplication>;
    completion: ExecutableTraversalCompletion;
    graphEntryInput: Readonly<Record<string, JsonValue>>;
    graphEntryInputDigest: `sha256:${string}`;
    leafOrdinal: number;
}>): Readonly<{
    kind: "recursion_completion";
    completion: ExecutableTraversalCompletion;
}> | Readonly<{
    kind: "recursion_child_request";
    frame: RecursionChildFoldFrame;
    prepared: PreparedChildTraversal;
    correlationId: string;
}>;
export declare function completeRecursionChild(frame: RecursionChildFoldFrame, child: ExecutableTraversalCompletion): ExecutableTraversalCompletion;
