import type { CProgramNode } from "./c_algebra.js";
import type { GraphFunctionApplication } from "./contracts.js";
export interface GtlDeclarationReferenceProjection {
    readonly graphFunctionRefs: readonly string[];
    readonly contractRefs: readonly string[];
    readonly evaluatorRefs: readonly string[];
    readonly ruleRefs: readonly string[];
    readonly implementationBindingRefs: readonly string[];
}
export declare function projectCProgramNodeDeclarationReferences(term: Readonly<CProgramNode>): GtlDeclarationReferenceProjection;
export declare function projectGraphFunctionApplicationDeclarationReferences(application: Readonly<GraphFunctionApplication>): GtlDeclarationReferenceProjection;
