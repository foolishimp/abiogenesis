import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { GraphFunction } from "./contracts.js";
export declare const WORKSITE_CONSTRUCTION_GTL_IDS: Readonly<{
    graphRef: "graph://abiogenesis/worksite/construction@5";
    nodeRef: "node://abiogenesis/worksite/construction/root@5";
    candidateLocusRef: "locus://abiogenesis/worksite/construction/candidate@5";
    candidateArmId: "arm://abiogenesis/worksite/construction/candidate-fp@5";
    joinLocusRef: "locus://abiogenesis/worksite/construction/authority-join@5";
    joinArmId: "arm://abiogenesis/worksite/construction/authority-join-fd@5";
    vectorApplicationGraphRef: "graph://abiogenesis/worksite/construction/vector-application@5";
    vectorApplicationNodeRef: "node://abiogenesis/worksite/construction/vector-application@5";
    reducerGraphRef: "graph://abiogenesis/worksite/construction/reduce@5";
    reducerNodeRef: "node://abiogenesis/worksite/construction/reduce@5";
    reducerLocusRef: "locus://abiogenesis/worksite/construction/reduce@5";
    reducerArmId: "arm://abiogenesis/worksite/construction/reduce-fd@5";
    batchRef: string;
}>;
export declare const WORKSITE_PRESERVED_RESULT_IDS: Readonly<{
    artifactContractRef: "contract://abiogenesis/worksite/preserved-result/artifact@5";
    authenticateImplementationRef: "implementation://abiogenesis/worksite/preserved-result/authenticate@5";
    authenticateBindingRef: "implementation-binding://abiogenesis/worksite/preserved-result/authenticate@5";
    deriveImplementationRef: "implementation://abiogenesis/worksite/preserved-result/derive@5";
    deriveBindingRef: "implementation-binding://abiogenesis/worksite/preserved-result/derive@5";
    authenticatePredicateRef: "predicate://abiogenesis/worksite/preserved-result/authenticated@5";
    derivePredicateRef: "predicate://abiogenesis/worksite/preserved-result/derived@5";
    authenticateLocusRef: "locus://abiogenesis/worksite/preserved-result/authenticate@5";
    deriveLocusRef: "locus://abiogenesis/worksite/preserved-result/derive@5";
}>;
export declare const WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS: readonly string[];
export interface WorksitePreservedResultSource {
    readonly kind: "worksite_preserved_result_source";
    readonly schemaVersion: "5.0.0";
    readonly historicalPrefix: Readonly<DurablePrefixCoordinate>;
    readonly sourceCCallRef: string;
    readonly actorInvocationRef: string;
}
export declare function constructWorksitePreservedResultSource(value: unknown): Readonly<WorksitePreservedResultSource>;
export declare function isWorksitePreservedResultSource(value: unknown): value is WorksitePreservedResultSource;
/** Caller-owned declaration; its closed selector is data, never a runtime grant. */
export declare function constructWorksitePreservedResultRecoveryGraphFunction(input: Readonly<{
    graphFunctionRef: string;
    source: WorksitePreservedResultSource;
}>): Readonly<GraphFunction>;
export declare function worksitePreservedResultSourceOfGraphFunction(graphFunction: GraphFunction): Readonly<WorksitePreservedResultSource> | null;
