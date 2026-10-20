import type { AbgEventStore, AdmittedImplementationSet, CCall, ExecutionBasis, OpenedTraversalScope } from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ClosureContract, FanOutApplication, GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { type ChildTraversalBasis, type PreparedChildTraversal } from "./child_traversal.js";
import { resolveTraversalTerm, type TraversalCursor } from "./traversal.js";
import { type ExecutableTraversalCompletion } from "./traversal_completion.js";
export interface WorkflowLocusAuthority {
    readonly store: AbgEventStore;
    readonly predecessorPrefix: DurablePrefixCoordinate;
    readonly executionBasis: ExecutionBasis;
    readonly openedTraversalScope: OpenedTraversalScope;
    readonly program: Readonly<GtlProgram>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly graph: Readonly<GtlGraph>;
    readonly implementationSet: AdmittedImplementationSet;
    readonly leafPort: LeafInvocationPort;
    readonly childTraversalBasis: ChildTraversalBasis;
    readonly closureContract: Readonly<ClosureContract>;
    readonly deferFailedRunStop?: boolean;
    readonly eventTime: string;
    readonly correlationId: string;
    readonly scopeClass: "root" | "child";
}
export interface TraversalLocusEvaluation {
    readonly completion: ExecutableTraversalCompletion;
    readonly outputValueKind: string | null;
    readonly outputContractRef: string | null;
}
export type WorkflowTerm = Extract<ReturnType<typeof resolveTraversalTerm>, Readonly<{
    kind: "c_workflow";
}>>;
export interface WorkflowChildFoldFrame {
    readonly kind: "workflow_child_fold_frame";
    readonly authority: WorkflowLocusAuthority;
    readonly cursor: TraversalCursor;
    readonly value: Readonly<Record<string, JsonValue>>;
    readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
    readonly graphEntryInputDigest: `sha256:${string}`;
    readonly ordinal: number;
    readonly workflowTerm: WorkflowTerm;
    readonly parentCCall: CCall;
    readonly application: Readonly<FanOutApplication> | null;
    readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
    readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
    readonly childInput: PreparedChildTraversal["input"];
    readonly childInputDigest: PreparedChildTraversal["inputDigest"];
    readonly foldbackCorrelationId: string;
}
export type WorkflowLocusStep = Readonly<{
    kind: "locus_evaluation";
    evaluation: TraversalLocusEvaluation;
}> | Readonly<{
    kind: "workflow_child_request";
    frame: WorkflowChildFoldFrame;
    prepared: PreparedChildTraversal;
    correlationId: string;
    deferFailedRunStop: boolean;
}>;
export declare function beginWorkflowLocus(input: Readonly<{
    authority: WorkflowLocusAuthority;
    cursor: TraversalCursor;
    value: Readonly<Record<string, JsonValue>>;
    graphEntryInput: Readonly<Record<string, JsonValue>>;
    graphEntryInputDigest: `sha256:${string}`;
    ordinal: number;
}>): WorkflowLocusStep;
export declare function completeWorkflowLocus(frame: WorkflowChildFoldFrame, child: ExecutableTraversalCompletion): TraversalLocusEvaluation;
