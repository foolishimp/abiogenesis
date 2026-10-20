import type { CatalogContribution, ClosureContract, ContractDeclaration, GraphFunction, GtlProgram, ImplementationBinding, ModulePublication, RootModuleArtifactBasis } from "./contracts.js";
export declare const WORKSITE_C0_IDS: Readonly<{
    moduleRef: "module://abiogenesis/worksite/c0@5";
    programRef: "program://abiogenesis/worksite/file-replace@5";
    startRef: "start://abiogenesis/worksite/file-replace@5";
    graphFunctionRef: "graph-function://abiogenesis/worksite/file-replace@5";
    graphRef: "graph://abiogenesis/worksite/file-replace@5";
    nodeRef: "node://abiogenesis/worksite/file-replace/fd-leaf@5";
    armId: "arm://abiogenesis/worksite/file-replace/fd@5";
    inputContractRef: "contract://abiogenesis/worksite/file-replace-input@5";
    outputContractRef: "contract://abiogenesis/worksite/file-replace-output@5";
    failureContractRef: "contract://abiogenesis/worksite/file-replace-failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/file-replace-refusal@5";
    evidenceContractRef: "contract://abiogenesis/worksite/file-replace-evidence@5";
    judgmentContractRef: "contract://abiogenesis/worksite/file-replace-judgment@5";
    transitionContractRef: "contract://abiogenesis/worksite/file-replace-transition@5";
    closureContractRef: "contract://abiogenesis/worksite/file-replace-closure@5";
    childClosureContractRef: "contract://abiogenesis/worksite/file-replace-child-closure@5";
    judgmentPredicateRef: "predicate://abiogenesis/worksite/file-replace-result@5";
}>;
export interface WorksiteC0PublicationParts {
    readonly contracts: readonly ContractDeclaration[];
    readonly implementationBindings: readonly ImplementationBinding[];
    readonly closureContracts: readonly ClosureContract[];
    readonly programs: readonly GtlProgram[];
    readonly graphFunctions: readonly GraphFunction[];
    readonly contributions: readonly CatalogContribution[];
}
export declare function isWorksiteFileReplaceOutput(value: unknown): value is Readonly<Record<string, unknown>>;
export declare function resolveWorksiteC0JudgmentRelation(predicateRef: string): Readonly<{
    predicateRef: "predicate://abiogenesis/worksite/file-parents@5";
    advanceReasonRef: "reason://abiogenesis/worksite/file-parents-satisfied@5";
    rejectionReasonRef: "reason://abiogenesis/worksite/file-parents-rejected@5";
    evaluate: (input: unknown, output: unknown) => boolean;
}> | Readonly<{
    predicateRef: "predicate://abiogenesis/worksite/file-replace-result@5";
    advanceReasonRef: "reason://abiogenesis/worksite/file-replace-satisfied@5";
    rejectionReasonRef: "reason://abiogenesis/worksite/file-replace-rejected@5";
    evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
export declare const WORKSITE_FILE_PARENTS_IDS: Readonly<{
    moduleRef: "module://abiogenesis/worksite/c0@5";
    programRef: "program://abiogenesis/worksite/file-parents@5";
    startRef: "start://abiogenesis/worksite/file-parents@5";
    graphFunctionRef: "graph-function://abiogenesis/worksite/file-parents@5";
    graphRef: "graph://abiogenesis/worksite/file-parents@5";
    nodeRef: "node://abiogenesis/worksite/file-parents/fd@5";
    armId: "arm://abiogenesis/worksite/file-parents/fd@5";
    inputContractRef: "contract://abiogenesis/worksite/file-parents-input@5";
    outputContractRef: "contract://abiogenesis/worksite/file-parents-output@5";
    failureContractRef: "contract://abiogenesis/worksite/file-parents-failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/file-parents-refusal@5";
    evidenceContractRef: "contract://abiogenesis/worksite/file-parents-evidence@5";
    judgmentContractRef: "contract://abiogenesis/worksite/file-parents-judgment@5";
    transitionContractRef: "contract://abiogenesis/worksite/file-parents-transition@5";
    closureContractRef: "contract://abiogenesis/worksite/file-parents-closure@5";
    childClosureContractRef: "contract://abiogenesis/worksite/file-parents-child-closure@5";
    judgmentPredicateRef: "predicate://abiogenesis/worksite/file-parents@5";
}>;
/** Additive declaration; the existing file-replace publication is unchanged. */
export declare function constructWorksiteFileParentsPublicationParts(artifact: RootModuleArtifactBasis, moduleRef: string, programMembershipRefs?: readonly string[]): Readonly<WorksiteC0PublicationParts>;
/** Reusable C0 authority parts; callers still require normal catalog/basis admission. */
export declare function constructWorksiteC0PublicationParts(artifact: RootModuleArtifactBasis, moduleRef: string, programMembershipRefs?: readonly string[]): Readonly<WorksiteC0PublicationParts>;
/** One declared Product leaf; retained as an isolated C0 proof helper. */
export declare function constructWorksiteC0ModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication>;
