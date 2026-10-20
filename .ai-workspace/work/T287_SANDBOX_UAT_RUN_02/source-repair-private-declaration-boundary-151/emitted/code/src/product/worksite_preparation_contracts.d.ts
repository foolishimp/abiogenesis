import type { ContractDeclaration, GtlEdgeInputBinding } from "../gtl/contracts.js";
import type { WorksiteConstructionTask, WorksiteConstructionResult } from "./worksite_construction.js";
import type { WorksiteBranchConstructionTask } from "./worksite_branch_construction.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput, WorksiteReadDependencyBasis } from "./worksite_command_execution.js";
import { type JsonValue } from "../shared/canonical_json.js";
import type { WorksiteRevisionCommandPreparationInput, WorksiteRevisionCommandPreparationBoundInput } from "./worksite_revision.js";
export interface WorksiteCommandPreparationInput {
    readonly kind: "worksite_command_preparation_input";
    readonly schemaVersion: "5.0.0";
    readonly constructionTask: WorksiteConstructionTask;
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
    readonly readDependencyBasis?: WorksiteReadDependencyBasis;
}
export interface WorksiteBranchCommandPreparationInput {
    readonly kind: "worksite_branch_command_preparation_input";
    readonly schemaVersion: "5.0.0";
    readonly constructionTask: WorksiteBranchConstructionTask;
    readonly commands: readonly WorksiteDeclaredCommandInput[];
    readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
    readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
}
export interface WorksiteCommandPreparationBoundInput {
    readonly kind: "worksite_command_preparation_bound_input";
    readonly schemaVersion: "5.0.0";
    readonly entry: WorksiteCommandPreparationInput;
    readonly source: WorksiteConstructionResult;
}
export interface WorksiteBranchCommandPreparationBoundInput {
    readonly kind: "worksite_branch_command_preparation_bound_input";
    readonly schemaVersion: "5.0.0";
    readonly entry: WorksiteBranchCommandPreparationInput;
    readonly source: WorksiteConstructionResult;
}
export type WorksitePreparationInput = WorksiteCommandPreparationInput | WorksiteBranchCommandPreparationInput | WorksiteRevisionCommandPreparationInput;
export type WorksitePreparationBoundInput = WorksiteCommandPreparationBoundInput | WorksiteBranchCommandPreparationBoundInput | WorksiteRevisionCommandPreparationBoundInput;
export declare const WORKSITE_PREPARATION_IDS: Readonly<{
    rootPredicateRef: "predicate://abiogenesis/worksite/command-execution/construction-execution@5";
    inputContractRef: "contract://abiogenesis/worksite/command-execution-preparation-input@5";
    boundInputContractRef: "contract://abiogenesis/worksite/command-execution-preparation-bound-input@5";
    branchInputContractRef: "contract://abiogenesis/worksite/branch-command-execution-preparation-input@5";
    branchBoundInputContractRef: "contract://abiogenesis/worksite/branch-command-execution-preparation-bound-input@5";
    selectImplementationRef: "implementation://abiogenesis/worksite/command-execution/select-construction-fd@5";
    selectBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/select-construction-fd@5";
    selectPredicateRef: "predicate://abiogenesis/worksite/command-execution/select-construction@5";
    prepareImplementationRef: "implementation://abiogenesis/worksite/command-execution/prepare-task-fd@5";
    prepareBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/prepare-task-fd@5";
    preparePredicateRef: "predicate://abiogenesis/worksite/command-execution/prepare-task@5";
    selectBranchImplementationRef: "implementation://abiogenesis/worksite/command-execution/select-branch-construction-fd@5";
    selectBranchBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/select-branch-construction-fd@5";
    selectBranchPredicateRef: "predicate://abiogenesis/worksite/command-execution/select-branch-construction@5";
    prepareBranchImplementationRef: "implementation://abiogenesis/worksite/command-execution/prepare-branch-task-fd@5";
    prepareBranchBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/prepare-branch-task-fd@5";
    prepareBranchPredicateRef: "predicate://abiogenesis/worksite/command-execution/prepare-branch-task@5";
}>;
export declare function worksitePreparationContractDeclarations(): readonly ContractDeclaration[];
export declare function worksiteRetentionBinding(branch?: boolean): GtlEdgeInputBinding;
export declare function worksiteRevisionRetentionBinding(): GtlEdgeInputBinding;
export declare function isWorksiteRetentionContractRelation(binding: GtlEdgeInputBinding, contracts?: readonly Readonly<ContractDeclaration>[]): boolean;
/** One ABI-owned structural pair. Consumers narrow E/S before dependent work. */
export declare const RETAINED_GRAPH_INPUT_CONTRACT: Readonly<{
    readonly contractRef: "contract://abiogenesis/worksite/retained-graph-input@5";
    readonly contractVersion: "5.0.0";
    readonly contractKind: "input";
    readonly valueKind: "retained_graph_input";
}>;
export interface RetainedGraphInput {
    readonly kind: "retained_graph_input";
    readonly schemaVersion: "5.0.0";
    readonly entry: Readonly<Record<string, JsonValue>>;
    readonly source: Readonly<Record<string, JsonValue>>;
}
export declare function isRetainedGraphInput(value: unknown): value is RetainedGraphInput;
export declare function graphInputRetentionBinding(entryContractRef: string, sourceContractRef: string): GtlEdgeInputBinding;
export declare function isGraphInputRetentionContractRelation(binding: GtlEdgeInputBinding, contracts?: readonly Readonly<ContractDeclaration>[]): boolean;
export declare function constructRetainedGraphInput(entry: unknown, source: unknown): RetainedGraphInput;
