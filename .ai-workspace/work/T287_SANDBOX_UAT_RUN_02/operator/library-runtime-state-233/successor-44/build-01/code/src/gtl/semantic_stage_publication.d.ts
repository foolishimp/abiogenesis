import type { ModulePublication, GraphFunction, RootModuleArtifactBasis, ImplementationBinding, ClosureContract } from "./contracts.js";
import { type SemanticStageDeclaration } from "./semantic_stage.js";
export declare function semanticStageImplementationBindings(artifact: RootModuleArtifactBasis): readonly ImplementationBinding[];
export declare function constructSemanticStageGraphFunction(stage: SemanticStageDeclaration, closureContractRef: string): Readonly<GraphFunction>;
export declare function constructSemanticBridgeGraphFunction(input: {
    readonly graphFunctionRef: string;
    readonly nodeRef: string;
    readonly closureContractRef: string;
    readonly operation: "design_worksite" | "evidence_input" | "envelope_output";
}): Readonly<GraphFunction>;
/** Finite native owners; callers declare composition, never sequence effects. */
export declare function constructSemanticJobGraphFunction(input: {
    readonly graphFunctionRef: string;
    readonly nodeRef: string;
    readonly closureContractRef: string;
    readonly lifecycleRef: string;
    readonly operation: "intake" | "context" | "worksite_plan" | "worksite_bridge";
}): Readonly<GraphFunction>;
export declare function constructSemanticClosureContract(input: {
    readonly closureContractRef: string;
    readonly predicateRef: string;
    readonly resultContractRef: string;
    readonly closureScope: "run" | "graph_call";
}): Readonly<ClosureContract>;
export declare function constructSemanticStageModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
/** Ordinary graph composition; native actors never return the computed envelope. */
export declare function constructNativeSemanticStageGraphFunctions(stage: SemanticStageDeclaration, closureContractRef: string, assessmentClosureContractRef: string): readonly Readonly<GraphFunction>[];
export declare function constructNativeSemanticConstructionGraphFunction(input: {
    readonly graphFunctionRef: string;
    readonly closureContractRef: string;
}): Readonly<GraphFunction>;
/** Exact constructed adapter relation; a marker alone cannot admit retention. */
export declare function isNativeSemanticGraphFunction(publication: Readonly<ModulePublication>, graph: Readonly<GraphFunction>): boolean;
