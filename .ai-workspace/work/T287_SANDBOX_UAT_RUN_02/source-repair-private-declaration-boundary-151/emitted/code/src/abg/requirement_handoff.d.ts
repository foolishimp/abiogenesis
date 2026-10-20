import type { GraphFunction, GtlGraph, ModulePublication } from "../gtl/contracts.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { CCall } from "./c_call.js";
import type { DurablePrefixCoordinate } from "./event_store.js";
export interface RequirementHandoffDeclarationBasis {
    readonly publication: Readonly<ModulePublication>;
    readonly graph: Readonly<GtlGraph>;
    readonly graphFunction: Readonly<GraphFunction>;
    readonly executionBasis: Readonly<ExecutionBasis>;
    readonly cCall: Readonly<CCall>;
    readonly predecessorPrefix: Readonly<DurablePrefixCoordinate>;
}
/** Reconstructs the read-only basis from exact durable ABG facts, not a local brand. */
export declare function authenticateRequirementHandoffBasis(basis: RequirementHandoffDeclarationBasis): Readonly<{
    declaration: Readonly<import("../gtl/requirement_handoff.js").GtlRequirementHandoffDeclaration>;
    coordinate: {
        publicationDigest: `sha256:${string}`;
        declarationDigest: `sha256:${string}`;
        executionBasisRef: string;
        executionBasisDigest: `sha256:${string}`;
        programRef: string;
        programDigest: `sha256:${string}`;
        graphFunctionRef: string;
        graphFunctionDigest: `sha256:${string}`;
        cCallRef: string;
        cCallDigest: `sha256:${string}`;
        implementationResolutionRef: string;
        implementationResolutionDigest: `sha256:${string}`;
        predecessorPrefixDigest: `sha256:${string}`;
        predecessorEventCount: number;
        inputDigest: `sha256:${string}`;
    };
}> | null;
export declare function constructRequirementHandoffDeclarationBasis(basis: RequirementHandoffDeclarationBasis): Readonly<RequirementHandoffDeclarationBasis> | null;
export declare function projectRequirementHandoffCandidate(basis: RequirementHandoffDeclarationBasis, input: unknown): Readonly<import("../product/requirement_handoff.js").RequirementHandoffOutput> | null;
/** ABG alone compares against its current admitted source, never output-owned declarations. */
export declare function requirementHandoffResultMatches(basis: RequirementHandoffDeclarationBasis, input: unknown, value: unknown): boolean;
