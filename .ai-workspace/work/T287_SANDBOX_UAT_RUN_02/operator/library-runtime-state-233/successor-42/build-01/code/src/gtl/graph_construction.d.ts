import type { GraphFunction, GraphTemplate, GtlEdge } from "./contracts.js";
export interface ComposeGraphFunctionsInput {
    readonly name: string;
    readonly left: Readonly<GraphFunction>;
    readonly right: Readonly<GraphFunction>;
}
export interface SubstituteGraphFunctionInput {
    readonly name: string;
    readonly outer: Readonly<GraphFunction>;
    readonly targetVectorRef: string;
    readonly inner: Readonly<GraphFunction>;
}
export interface IdentityGraphFunctionInput {
    readonly name: string;
    readonly contractRef: string;
}
export interface PromoteGraphFunctionInput {
    readonly name: string;
    readonly source: Readonly<GraphFunction>;
    readonly sourceRef: string;
    readonly targetRef: string;
}
/** Internal original-GTL law; these helpers are not facade exports. */
export declare function graphNodeIdentityFailure(template: Readonly<GraphTemplate>): string | null;
export declare function ordinaryGraphBoundaryFailure(template: Readonly<GraphTemplate>, nodeRef: string, outgoing?: readonly Readonly<GtlEdge>[]): string | null;
export interface GraphTemplateDiagnostic {
    readonly code: "duplicate_identity" | "topology_mismatch";
    readonly path: string;
    readonly message: string;
}
/** Local structure only; evaluator, policy and callable law remain whole checks. */
export declare function graphTemplateDiagnostics(template: Readonly<GraphTemplate>, path?: string): readonly GraphTemplateDiagnostic[];
export declare function identityGraphFunction(input: IdentityGraphFunctionInput): Readonly<GraphFunction>;
export declare function promoteGraphFunction(input: PromoteGraphFunctionInput): Readonly<GraphFunction>;
export declare function composeGraphFunctions(input: ComposeGraphFunctionsInput): Readonly<GraphFunction>;
export declare function substituteGraphFunction(input: SubstituteGraphFunctionInput): Readonly<GraphFunction>;
