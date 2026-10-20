import { type CProgramNode } from "../gtl/c_algebra.js";
import type { ImplementationBinding } from "../gtl/contracts.js";
import type { StaticDiagnostic } from "./validation.js";
export interface CProgramValidationContext {
    readonly path: string;
    readonly availableGraphFunctionRefs: ReadonlySet<string>;
    readonly callableGraphFunctionRefs: ReadonlySet<string>;
    readonly contractRefs: ReadonlySet<string>;
    readonly bindingByRef: ReadonlyMap<string, Readonly<ImplementationBinding>>;
    readonly expectedRootResultCardinality?: "one" | "zero" | "consumed";
}
export interface CProgramTermInspection {
    readonly term: CProgramNode | null;
    readonly diagnostics: readonly StaticDiagnostic[];
}
export declare function inspectCProgramTerm(value: unknown, context: CProgramValidationContext): CProgramTermInspection;
