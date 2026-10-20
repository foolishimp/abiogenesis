import type { CatalogContribution, ClosureContract, ContractDeclaration, GraphFunction, GtlProgram, ImplementationBinding, RootModuleArtifactBasis } from "./contracts.js";
export declare const WORKSITE_BRANCH_CONSTRUCTION_GTL_IDS: Readonly<{
    graphRef: "graph://abiogenesis/worksite/branch-construction@5";
    nodeRef: "node://abiogenesis/worksite/branch-construction/root@5";
    planLocusRef: "locus://abiogenesis/worksite/branch-construction/plan@5";
    planArmId: "arm://abiogenesis/worksite/branch-construction/plan-fd@5";
    branchApplicationGraphRef: "graph://abiogenesis/worksite/branch-construction/branch-application@5";
    branchApplicationNodeRef: "node://abiogenesis/worksite/branch-construction/branch-application@5";
    reducerGraphRef: "graph://abiogenesis/worksite/branch-construction/reduce@5";
    reducerNodeRef: "node://abiogenesis/worksite/branch-construction/reduce@5";
    reducerLocusRef: "locus://abiogenesis/worksite/branch-construction/reduce@5";
    reducerArmId: "arm://abiogenesis/worksite/branch-construction/reduce-fd@5";
}>;
export interface WorksiteBranchConstructionPublicationParts {
    readonly contracts: readonly ContractDeclaration[];
    readonly implementationBindings: readonly ImplementationBinding[];
    readonly closureContracts: readonly ClosureContract[];
    readonly programs: readonly GtlProgram[];
    readonly graphFunctions: readonly GraphFunction[];
    readonly contributions: readonly CatalogContribution[];
}
export declare function constructWorksiteBranchConstructionPublicationParts(artifact: RootModuleArtifactBasis): Readonly<WorksiteBranchConstructionPublicationParts>;
