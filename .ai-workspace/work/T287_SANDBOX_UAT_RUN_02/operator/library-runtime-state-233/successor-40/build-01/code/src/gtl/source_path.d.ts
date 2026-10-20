import type { COfNode, CProgramNode } from "./c_algebra.js";
import type { GraphTemplate, GtlGraph } from "./contracts.js";
import { type Sha256Digest } from "../shared/digests.js";
import type { CanonicalRootedTopologyWitness } from "../shared/rooted_topology_partition.js";
export type CSourcePath = readonly string[];
export interface CSourcePathRefusal {
    readonly kind: "c_source_path_refusal";
    readonly schemaVersion: "5.0.0";
    readonly code: "invalid_source_path" | "term_path_missing";
    readonly message: string;
}
export interface CSourceContinuation {
    readonly kind: "c_source_continuation";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "advance" | "terminal";
    readonly relation: "batch_next" | "compose_next" | "edge_next" | "graph_edge" | "root_complete";
    readonly sourcePath: CSourcePath;
    readonly targetPath: CSourcePath | null;
    readonly targetTaskOrdinal: number | null;
    readonly targetRetryDepth: number;
}
export interface CContinuationTarget {
    readonly kind: "c_continuation_target";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "advance" | "terminal";
    readonly relation: CSourceContinuation["relation"];
    readonly nodeRef: string | null;
    readonly termPath: CSourcePath | null;
    readonly taskOrdinal: number | null;
    readonly attempt: number | null;
    readonly retryPath: readonly number[];
    readonly inputRef: string | null;
    readonly inputDigest: Sha256Digest | null;
}
export interface CTraversalTarget {
    readonly kind: "c_traversal_target";
    readonly schemaVersion: "5.0.0";
    readonly relation: "batch_enter" | "compose_enter" | "edge_enter" | "identity_continue" | "retry_enter" | "retry_same_edge";
    readonly nodeRef: string;
    readonly termPath: CSourcePath;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
}
export interface CTraversalCoordinate {
    readonly nodeRef: string;
    readonly termPath: CSourcePath;
    readonly taskOrdinal: number | null;
    readonly attempt: number;
    readonly retryPath: readonly number[];
}
export interface CTraversalSource extends CTraversalCoordinate {
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
}
export declare function rootCTraversalCoordinate(nodeRef: string): CTraversalCoordinate;
export interface CBatchTaskInput {
    readonly kind: "c_batch_task_input";
    readonly schemaVersion: "5.0.0";
    readonly disposition: "shared_batch_input" | "fan_out_member";
    readonly batchRef: string;
    readonly taskOrdinal: number;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
}
interface CBatchInputSource {
    readonly nodeRef: string;
    readonly termPath: CSourcePath;
    readonly taskOrdinal: number | null;
    readonly inputRef: string;
    readonly inputDigest: Sha256Digest;
}
export interface CEnclosingRetryContext {
    readonly retryTermPath: CSourcePath;
    readonly wrappedTermPath: CSourcePath;
    readonly retryDepth: number;
    readonly taskOrdinal: number | null;
    readonly budget: number;
    readonly inputCarrierRef: string;
    readonly outputCarrierRef: string;
}
export interface CEnclosingRetryTopology {
    readonly kind: "c_enclosing_retry_topology";
    readonly schemaVersion: "5.0.0";
    readonly witness: CanonicalRootedTopologyWitness;
    readonly entries: readonly Readonly<{
        readonly segmentRef: string;
        readonly context: CEnclosingRetryContext;
    }>[];
}
export interface CProgramLocus {
    readonly kind: "c_program_locus";
    readonly nodeRef: string;
    readonly termPath: CSourcePath;
    readonly leaf: Readonly<COfNode>;
}
export declare function rootCSourcePath(nodeRef: string): CSourcePath;
export declare function resolveCProgramLocus(template: Readonly<GraphTemplate>, programLocusRef: string): CProgramLocus | CSourcePathRefusal;
export declare function resolveCProgramTermAtSourcePath(template: Readonly<GraphTemplate>, nodeRef: string, termPath: CSourcePath): CProgramNode | CSourcePathRefusal;
export declare function resolveEnclosingCBatchRef(template: Readonly<GraphTemplate>, nodeRef: string, sourcePath: CSourcePath): string | null | CSourcePathRefusal;
declare function enclosingCBatchContext(template: Readonly<GraphTemplate>, nodeRef: string, sourcePath: CSourcePath): Readonly<{
    batchRef: string;
    batchTermPath: CSourcePath;
    sourceTaskOrdinal: number;
    taskCount: number;
}> | null | CSourcePathRefusal;
/** The batch being advanced may enclose a completed inner batch. Its next
 * task path, rather than the nearest batch around the last leaf, identifies it. */
export declare function continuationCBatchContext(template: Readonly<GraphTemplate>, nodeRef: string, sourcePath: CSourcePath): ReturnType<typeof enclosingCBatchContext>;
export declare function deriveCBatchTaskInput(graph: Readonly<GtlGraph>, source: Readonly<CBatchInputSource>, relation: "enter_batch" | "advance_member", batchRef: string, targetTaskOrdinal: number, batchEntryInput?: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>): CBatchTaskInput | CSourcePathRefusal;
export declare function resolveEnclosingCRetryContexts(template: Readonly<GraphTemplate>, nodeRef: string, sourcePath: CSourcePath): readonly CEnclosingRetryContext[] | CSourcePathRefusal;
export declare function deriveCEnclosingRetryTopology(graph: Readonly<GtlGraph>, locus: Readonly<{
    readonly nodeRef: string;
    readonly termPath: CSourcePath;
}> | null): CEnclosingRetryTopology | CSourcePathRefusal;
export declare function deriveCSourceContinuation(template: Readonly<GraphTemplate>, nodeRef: string, sourcePath: CSourcePath): CSourceContinuation | CSourcePathRefusal;
export declare function deriveCContinuationTarget(graph: Readonly<GtlGraph>, source: Readonly<{
    nodeRef: string;
    termPath: CSourcePath;
    taskOrdinal: number | null;
    attempt: number;
    retryPath: readonly number[];
    inputRef: string;
    inputDigest: Sha256Digest;
}>, completed: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>, batchEntryInput?: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>): CContinuationTarget | CSourcePathRefusal;
/**
 * GTL's single structural-topology projection. HoG constructs a runtime cursor
 * from this value; ABG may compare it with an admitted cursor but may not
 * independently derive another structural successor.
 */
export declare function deriveCStructuralTarget(graph: Readonly<GtlGraph>, source: CTraversalSource, routeKind: "advance" | "retry", batchEntryInput?: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>): CTraversalTarget | CSourcePathRefusal | null;
/** GTL's single same-boundary retry target projection. */
export declare function deriveCRetryTarget(graph: Readonly<GtlGraph>, source: CTraversalSource, retryInput: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
}>): CTraversalTarget | CSourcePathRefusal;
export {};
