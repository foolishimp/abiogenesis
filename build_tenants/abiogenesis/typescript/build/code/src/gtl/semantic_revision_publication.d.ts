import type { ModulePublication, GraphFunction, RootModuleArtifactBasis, ImplementationBinding } from "./contracts.js";
import type { SemanticStageDeclaration } from "./semantic_stage.js";
export type SemanticRevisionRole = "selection" | "projection" | "author" | "assessor" | "bridge" | "evidenceInput" | "terminal" | "nativeIntake" | "nativeRequest" | "nativeConstruction" | "nativeExecution" | "nativeEvidence";
export declare function semanticRevisionImplementationBindings(artifact: RootModuleArtifactBasis): readonly ImplementationBinding[];
export declare function constructSemanticRevisionGraphFunction(input: {
    readonly graphFunctionRef: string;
    readonly closureContractRef: string;
    readonly childClosureContractRef?: string;
    readonly role: "projection" | "bridge" | "evidenceInput" | "terminal" | "nativeIntake" | "nativeRequest" | "nativeConstruction" | "nativeExecution" | "nativeEvidence";
    readonly nativeEntry?: string;
    readonly stage?: SemanticStageDeclaration;
    readonly rootOutput?: boolean;
}): Readonly<GraphFunction>;
export declare function constructSemanticRevisionModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
export declare function constructSemanticRevisionSelectionGraphFunction(input: {
    readonly graphFunctionRef: string;
    readonly closureContractRef: string;
    readonly childClosureContractRef?: string;
    readonly lifecycleRef: string;
    readonly sealRequest?: boolean;
}): Readonly<GraphFunction>;
/** Retention has this exact factory as owner, never a free-form marker. */
export declare function isNativeSemanticRevisionGraphFunction(publication: Readonly<ModulePublication>, graph: Readonly<GraphFunction>): boolean;
