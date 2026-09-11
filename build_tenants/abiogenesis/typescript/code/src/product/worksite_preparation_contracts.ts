import type { ContractDeclaration, GtlEdgeInputBinding } from "../gtl/contracts.js";
import type { WorksiteConstructionTask, WorksiteConstructionResult } from "./worksite_construction.js";
import type { WorksiteBranchConstructionTask } from "./worksite_branch_construction.js";
import type { WorksiteDeclaredCommandInput, WorksiteOutcomePredicateInput, WorksiteCommandWriteTerritoryInput } from "./worksite_command_execution.js";
import { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
import type { WorksiteRevisionCommandPreparationInput,
  WorksiteRevisionCommandPreparationBoundInput, WorksiteRevisionDependencyObservation } from "./worksite_revision.js";

export interface WorksiteCommandPreparationInput {
  readonly kind: "worksite_command_preparation_input";
  readonly schemaVersion: "5.0.0";
  readonly constructionTask: WorksiteConstructionTask;
  readonly commands: readonly WorksiteDeclaredCommandInput[];
  readonly outcomePredicates: readonly WorksiteOutcomePredicateInput[];
  readonly allowedWriteTerritories: readonly WorksiteCommandWriteTerritoryInput[];
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

function declaration(contractRef: string, contractKind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration {
  return Object.freeze({ contractRef, contractVersion: "5.0.0", contractKind, valueKind });
}

export const WORKSITE_PREPARATION_IDS = Object.freeze({
  rootPredicateRef: "predicate://abiogenesis/worksite/command-execution/construction-execution@5",
  inputContractRef: "contract://abiogenesis/worksite/command-execution-preparation-input@5",
  boundInputContractRef: "contract://abiogenesis/worksite/command-execution-preparation-bound-input@5",
  branchInputContractRef: "contract://abiogenesis/worksite/branch-command-execution-preparation-input@5",
  branchBoundInputContractRef: "contract://abiogenesis/worksite/branch-command-execution-preparation-bound-input@5",
  selectImplementationRef: "implementation://abiogenesis/worksite/command-execution/select-construction-fd@5",
  selectBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/select-construction-fd@5",
  selectPredicateRef: "predicate://abiogenesis/worksite/command-execution/select-construction@5",
  prepareImplementationRef: "implementation://abiogenesis/worksite/command-execution/prepare-task-fd@5",
  prepareBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/prepare-task-fd@5",
  preparePredicateRef: "predicate://abiogenesis/worksite/command-execution/prepare-task@5",
  selectBranchImplementationRef: "implementation://abiogenesis/worksite/command-execution/select-branch-construction-fd@5",
  selectBranchBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/select-branch-construction-fd@5",
  selectBranchPredicateRef: "predicate://abiogenesis/worksite/command-execution/select-branch-construction@5",
  prepareBranchImplementationRef: "implementation://abiogenesis/worksite/command-execution/prepare-branch-task-fd@5",
  prepareBranchBindingRef: "implementation-binding://abiogenesis/worksite/command-execution/prepare-branch-task-fd@5",
  prepareBranchPredicateRef: "predicate://abiogenesis/worksite/command-execution/prepare-branch-task@5",
});

// A closed module-local schema, not a registration surface. Runtime interpretation
// uses only the named existing ABI contract validators and C2 configuration law.
interface LiteralNode<T extends string> { readonly kind: "literal"; readonly value: T }
interface ContractNode<T> { readonly kind: "contract_value"; readonly declaration: ContractDeclaration; readonly valueType?: T }
interface ArrayNode<T> { readonly kind: "configuration_array"; readonly valueType?: readonly T[] }
interface RevisionCoordinateNode<T extends "ref" | "digest"> { readonly kind: "revision_coordinate"; readonly coordinateKind: T }
type NodeValue<N> = N extends LiteralNode<infer T> ? T : N extends ContractNode<infer T> ? T : N extends ArrayNode<infer T> ? readonly T[] :
  N extends RevisionCoordinateNode<infer T> ? T extends "digest" ? Sha256Digest : string : never;
type RecordValue<F> = { readonly [K in keyof F]: NodeValue<F[K]> };
function literal<const T extends string>(value: T): LiteralNode<T> { return Object.freeze({ kind: "literal", value }); }
function contractNode<T>(value: ContractDeclaration): ContractNode<T> { return Object.freeze({ kind: "contract_value", declaration: value }); }
function arrayNode<T>(): ArrayNode<T> { return Object.freeze({ kind: "configuration_array" }); }
const configurationFields = { schemaVersion: literal("5.0.0"),
  commands: arrayNode<WorksiteDeclaredCommandInput>(), outcomePredicates: arrayNode<WorksiteOutcomePredicateInput>(),
  allowedWriteTerritories: arrayNode<WorksiteCommandWriteTerritoryInput>() };
const entryFields = { kind: literal("worksite_command_preparation_input"), ...configurationFields,
  constructionTask: contractNode<WorksiteConstructionTask>(declaration(WORKSITE_CONSTRUCTION_IDS.taskContractRef, "input", "worksite_construction_task")) };
const branchEntryFields = { kind: literal("worksite_branch_command_preparation_input"), ...configurationFields,
  constructionTask: contractNode<WorksiteBranchConstructionTask>(declaration("contract://abiogenesis/worksite/branch-construction-task@5", "input", "worksite_branch_construction_task")) };
const entry = { declaration: declaration(WORKSITE_PREPARATION_IDS.inputContractRef, "input", "worksite_command_preparation_input"), fields: entryFields };
const branchEntry = { declaration: declaration(WORKSITE_PREPARATION_IDS.branchInputContractRef, "input", "worksite_branch_command_preparation_input"), fields: branchEntryFields };
const revisionEntryFields = { kind: literal("worksite_revision_command_preparation_input"), ...configurationFields,
  constructionTask: entryFields.constructionTask, revisionBasisRef: {kind:"revision_coordinate",coordinateKind:"ref"} as const,
  revisionBasisDigest: {kind:"revision_coordinate",coordinateKind:"digest"} as const,
  snapshotTargetRefs: arrayNode<string>(), dependencyObservations: arrayNode<WorksiteRevisionDependencyObservation>() };
const revisionEntry = { declaration: declaration(WORKSITE_REVISION_IDS.inputContractRef,"input","worksite_revision_command_preparation_input"), fields: revisionEntryFields };
const source = contractNode<WorksiteConstructionResult>(WORKSITE_CONSTRUCTION_RESULT_CONTRACT);
const boundFields = { kind: literal("worksite_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
  entry: { ...contractNode<WorksiteCommandPreparationInput>(entry.declaration), schema: entry }, source };
const branchBoundFields = { kind: literal("worksite_branch_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
  entry: { ...contractNode<WorksiteBranchCommandPreparationInput>(branchEntry.declaration), schema: branchEntry }, source };
const revisionBoundFields = { kind: literal("worksite_revision_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
  entry: { ...contractNode<WorksiteRevisionCommandPreparationInput>(revisionEntry.declaration), schema: revisionEntry }, source };
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type EntryAgreement = Assert<Equal<RecordValue<typeof entryFields>, WorksiteCommandPreparationInput>>;
type BranchEntryAgreement = Assert<Equal<RecordValue<typeof branchEntryFields>, WorksiteBranchCommandPreparationInput>>;
type BoundAgreement = Assert<Equal<RecordValue<typeof boundFields>, WorksiteCommandPreparationBoundInput>>;
type BranchBoundAgreement = Assert<Equal<RecordValue<typeof branchBoundFields>, WorksiteBranchCommandPreparationBoundInput>>;
type RevisionEntryAgreement = Assert<Equal<RecordValue<typeof revisionEntryFields>, WorksiteRevisionCommandPreparationInput>>;
type RevisionBoundAgreement = Assert<Equal<RecordValue<typeof revisionBoundFields>, WorksiteRevisionCommandPreparationBoundInput>>;
const boundSources = [
  { declaration: declaration(WORKSITE_PREPARATION_IDS.boundInputContractRef, "input", "worksite_command_preparation_bound_input"), fields: boundFields },
  { declaration: declaration(WORKSITE_PREPARATION_IDS.branchBoundInputContractRef, "input", "worksite_branch_command_preparation_bound_input"), fields: branchBoundFields },
  { declaration: declaration(WORKSITE_REVISION_IDS.boundInputContractRef, "input", "worksite_revision_command_preparation_bound_input"), fields: revisionBoundFields },
] as const;

/** @internal Fixed owning schema source consumed by the ABI value interpreter. */
export function worksitePreparationSchemaSources() { return [entry, branchEntry, revisionEntry, ...boundSources] as const; }
export function worksitePreparationContractDeclarations(): readonly ContractDeclaration[] {
  return Object.freeze(worksitePreparationSchemaSources().map((source) => source.declaration));
}
export function worksiteRetentionBinding(branch = false): GtlEdgeInputBinding {
  const bound = boundSources[branch ? 1 : 0];
  return Object.freeze({ kind: "retain_graph_input", entryContractRef: bound.fields.entry.declaration.contractRef,
    sourceContractRef: bound.fields.source.declaration.contractRef, targetContractRef: bound.declaration.contractRef });
}
export function worksiteRevisionRetentionBinding(): GtlEdgeInputBinding {
  const bound = boundSources[2];
  return Object.freeze({ kind:"retain_graph_input",entryContractRef:bound.fields.entry.declaration.contractRef,
    sourceContractRef:bound.fields.source.declaration.contractRef,targetContractRef:bound.declaration.contractRef });
}
export function isWorksiteRetentionContractRelation(binding: GtlEdgeInputBinding, contracts?: readonly Readonly<ContractDeclaration>[]): boolean {
  const bound = boundSources.find((candidate) => candidate.declaration.contractRef === binding.targetContractRef);
  if (bound === undefined || binding.kind !== "retain_graph_input" || binding.entryContractRef !== bound.fields.entry.declaration.contractRef ||
    binding.sourceContractRef !== bound.fields.source.declaration.contractRef) return false;
  return contracts === undefined || [bound.declaration, bound.fields.entry.declaration, bound.fields.source.declaration].every((expected) => {
    const matches = contracts.filter((candidate) => candidate.contractRef === expected.contractRef);
    return matches.length === 1 && canonicalJson(matches[0] as unknown as JsonValue) === canonicalJson(expected as unknown as JsonValue);
  });
}
