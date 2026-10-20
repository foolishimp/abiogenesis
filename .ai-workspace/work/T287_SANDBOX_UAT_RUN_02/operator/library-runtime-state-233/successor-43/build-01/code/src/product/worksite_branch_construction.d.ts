import { type Sha256Digest } from "../shared/digests.js";
import type { WorkspaceBinding } from "./environment.js";
import type { CapabilityGrant } from "./invocation.js";
import { type WorksiteConstructionResult, type WorksiteConstructionTask } from "./worksite_construction.js";
export declare const WORKSITE_BRANCH_CONSTRUCTION_IDS: Readonly<{
    moduleRef: "module://abiogenesis/worksite/construction@5";
    programRef: "program://abiogenesis/worksite/branch-construction@5";
    startRef: "start://abiogenesis/worksite/branch-construction@5";
    graphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction@5";
    branchApplicationGraphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction/branch-application@5";
    reducerGraphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction/reduce@5";
    batchRef: string;
    fanOutApplicationRef: string;
    fanInApplicationRef: string;
    taskContractRef: "contract://abiogenesis/worksite/branch-construction-task@5";
    vectorContractRef: "contract://abiogenesis/worksite/branch-construction-vector@5";
    outputVectorContractRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5";
    resultContractRef: "contract://abiogenesis/worksite/construction-result@5";
    failureContractRef: "contract://abiogenesis/worksite/branch-construction-failure@5";
    refusalContractRef: "contract://abiogenesis/worksite/branch-construction-refusal@5";
    evidenceContractRef: "contract://abiogenesis/worksite/branch-construction-evidence@5";
    judgmentContractRef: "contract://abiogenesis/worksite/branch-construction-judgment@5";
    transitionContractRef: "contract://abiogenesis/worksite/branch-construction-transition@5";
    childClosureContractRef: "contract://abiogenesis/worksite/branch-construction-child-closure@5";
    closureContractRef: "contract://abiogenesis/worksite/branch-construction-closure@5";
    branchApplicationChildClosureContractRef: "contract://abiogenesis/worksite/branch-construction/branch-application-child-closure@5";
    branchApplicationFailureContractRef: "contract://abiogenesis/worksite/branch-construction/branch-application-failure@5";
    reducerChildClosureContractRef: "contract://abiogenesis/worksite/branch-construction/reducer-child-closure@5";
    planImplementationRef: "implementation://abiogenesis/worksite/branch-construction/plan-fd@5";
    planImplementationBindingRef: "implementation-binding://abiogenesis/worksite/branch-construction/plan-fd@5";
    reducerImplementationRef: "implementation://abiogenesis/worksite/branch-construction/reduce-fd@5";
    reducerImplementationBindingRef: "implementation-binding://abiogenesis/worksite/branch-construction/reduce-fd@5";
    planJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/plan@5";
    branchApplicationJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/branch-application@5";
    reducerJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/reducer@5";
    rootJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction-result@5";
}>;
export interface WorksiteConstructionBranchInput {
    readonly branchRef: string;
    readonly dependsOn: readonly string[];
    readonly constructionTask: WorksiteConstructionTask;
}
export interface WorksiteConstructionBranch {
    readonly ordinal: number;
    readonly branchRef: string;
    readonly branchDigest: Sha256Digest;
    readonly dependsOn: readonly string[];
    readonly topologicalLevel: number;
    readonly constructionTask: WorksiteConstructionTask;
}
export interface WorksiteConstructionTargetAllocationMember {
    readonly ordinal: number;
    readonly branchOrdinal: number;
    readonly branchRef: string;
    readonly branchTargetOrdinal: number;
    readonly targetRef: string;
    readonly subjectRef: string;
    readonly subjectDigest: Sha256Digest;
    readonly relativePath: string;
    readonly territoryRef: string;
    readonly territoryDigest: Sha256Digest;
    readonly predecessorObservationRef: string;
    readonly predecessorObservationDigest: Sha256Digest;
}
export interface WorksiteConstructionTargetAllocation {
    readonly allocationRef: string;
    readonly allocationDigest: Sha256Digest;
    readonly members: readonly WorksiteConstructionTargetAllocationMember[];
}
export interface WorksiteBranchConstructionTask {
    readonly kind: "worksite_branch_construction_task";
    readonly schemaVersion: "5.0.0";
    readonly taskRef: string;
    readonly taskDigest: Sha256Digest;
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly branches: readonly WorksiteConstructionBranch[];
    readonly targetAllocation: WorksiteConstructionTargetAllocation;
}
export interface WorksiteBranchConstructionTaskInput {
    readonly workspaceBinding: WorkspaceBinding;
    readonly capabilityGrant: CapabilityGrant;
    readonly branches: readonly WorksiteConstructionBranchInput[];
}
export interface WorksiteBranchConstructionVectorMember {
    readonly ordinal: number;
    readonly memberRef: string;
    readonly value: WorksiteConstructionTask;
}
export interface WorksiteBranchConstructionVector {
    readonly kind: "worksite_branch_construction_vector";
    readonly schemaVersion: "5.0.0";
    readonly vectorRef: string;
    readonly vectorDigest: Sha256Digest;
    readonly sourceTaskRef: string;
    readonly sourceTaskDigest: Sha256Digest;
    readonly members: readonly WorksiteBranchConstructionVectorMember[];
}
export interface WorksiteBranchConstructionOutputVectorMember {
    readonly ordinal: number;
    readonly inputMemberRef: string;
    readonly outputMemberRef: string;
    readonly value: WorksiteConstructionResult;
}
export interface WorksiteBranchConstructionOutputVector {
    readonly kind: "gtl_fan_out_vector";
    readonly schemaVersion: "5.0.0";
    readonly applicationRef: string;
    readonly members: readonly WorksiteBranchConstructionOutputVectorMember[];
}
export interface WorksiteBranchConstructionFailure {
    readonly kind: "worksite_branch_construction_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
}
export interface WorksiteBranchConstructionBranchApplicationFailure {
    readonly kind: "worksite_branch_construction_branch_application_failure";
    readonly schemaVersion: "5.0.0";
    readonly failureClass: string;
    readonly diagnosticRef: string;
}
export declare function constructWorksiteBranchConstructionTask(input: WorksiteBranchConstructionTaskInput): WorksiteBranchConstructionTask;
export declare function isWorksiteBranchConstructionTask(value: unknown): value is WorksiteBranchConstructionTask;
export declare function constructWorksiteBranchConstructionVector(task: WorksiteBranchConstructionTask): WorksiteBranchConstructionVector;
export declare function isWorksiteBranchConstructionVector(value: unknown): value is WorksiteBranchConstructionVector;
export declare function isWorksiteBranchConstructionOutputVector(value: unknown): value is WorksiteBranchConstructionOutputVector;
export declare function reduceWorksiteBranchConstructionResults(input: WorksiteBranchConstructionOutputVector): WorksiteConstructionResult;
export declare function isWorksiteBranchConstructionFailure(value: unknown): value is WorksiteBranchConstructionFailure;
export declare function isWorksiteBranchConstructionBranchApplicationFailure(value: unknown): value is WorksiteBranchConstructionBranchApplicationFailure;
export declare function resolveWorksiteBranchConstructionJudgmentRelation(predicateRef: string): Readonly<{
    readonly predicateRef: string;
    readonly advanceReasonRef: string;
    readonly rejectionReasonRef: string;
    readonly evaluate: (input: unknown, output: unknown) => boolean;
}> | null;
