import { RETAINED_GRAPH_INPUT_CONTRACT, isRetainedGraphInput } from "./worksite_preparation_contracts.js";
import { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import type { GtlEdgeInputBinding } from "../gtl/contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isSha256Digest } from "../shared/digests.js";
import { constructWorksiteSubject } from "./worksite_effect.js";
import { WORKSITE_REVISION_IDS, isWorksiteRevisionDependencyObservation, constructWorksiteRevisionCommandExecutionTask,
  type WorksiteExecutionTask, type WorksiteRevisionCommandPreparationInput, type WorksiteRevisionSnapshotSource } from "./worksite_revision.js";
import {
  isWorksiteConstructionTask,
  isWorksiteConstructionResult,
  resolveWorksiteConstructionJudgmentRelation,
  type WorksiteConstructionTask,
  type WorksiteConstructionResult,
} from "./worksite_construction.js";
import {
  WORKSITE_BRANCH_CONSTRUCTION_IDS,
  isWorksiteBranchConstructionTask,
  resolveWorksiteBranchConstructionJudgmentRelation,
  type WorksiteBranchConstructionTask,
} from "./worksite_branch_construction.js";
import {
  WORKSITE_COMMAND_EXECUTION_IDS,
  constructWorksiteCommandConfiguration,
  constructWorksiteCommandExecutionTask,
  isWorksiteReadDependencyBasis,
  resolveWorksiteCommandExecutionJudgmentRelation,
  type WorksiteCommandExecutionTask,
  type WorksiteDeclaredCommandInput,
  type WorksiteOutcomePredicateInput,
  type WorksiteCommandWriteTerritoryInput,
} from "./worksite_command_execution.js";

import { worksitePreparationSchemaSources, worksitePreparationContractDeclarations, worksiteRetentionBinding,
  isWorksiteRetentionContractRelation, WORKSITE_PREPARATION_IDS,
  type WorksiteCommandPreparationInput, type WorksiteBranchCommandPreparationInput,
  type WorksitePreparationInput, type WorksitePreparationBoundInput } from "./worksite_preparation_contracts.js";

export function preparationConstructionTasks(input: WorksitePreparationInput): readonly WorksiteConstructionTask[] {
  return input.constructionTask.kind === "worksite_construction_task"
    ? [input.constructionTask]
    : input.constructionTask.branches.map((branch) => branch.constructionTask);
}

function validConfiguration(input: WorksitePreparationInput): boolean {
  try {
    const tasks = preparationConstructionTasks(input);
    const first = tasks[0];
    if (first === undefined || tasks.some((task) =>
      canonicalJson(task.workspaceAuthorityBasis as unknown as JsonValue) !== canonicalJson(first.workspaceAuthorityBasis as unknown as JsonValue) ||
      canonicalJson(task.workspaceBinding as unknown as JsonValue) !== canonicalJson(first.workspaceBinding as unknown as JsonValue) ||
      canonicalJson(task.capabilityGrant as unknown as JsonValue) !== canonicalJson(first.capabilityGrant as unknown as JsonValue))) return false;
    const dependencies = input.kind === "worksite_revision_command_preparation_input" ? input.dependencyObservations : [];
    const readBasis = input.kind === "worksite_command_preparation_input" ? input.readDependencyBasis : undefined;
    if (readBasis !== undefined && (!isWorksiteReadDependencyBasis(readBasis) || readBasis.members.some(row =>
      tasks.some(task => task.targets.some(target => target.subject.relativePath === row.subject.relativePath)) ||
      canonicalJson(constructWorksiteSubject({ workspaceAuthorityBasis: first.workspaceAuthorityBasis,
        workspaceBinding: first.workspaceBinding, subjectUri: row.subject.subjectUri, relativePath: row.subject.relativePath }) as unknown as JsonValue) !==
        canonicalJson(row.subject as unknown as JsonValue)))) return false;
    if (input.kind === "worksite_revision_command_preparation_input") {
      if (!isSha256Digest(input.revisionBasisDigest) || input.revisionBasisRef !== `semantic-revision://abiogenesis/${input.revisionBasisDigest.slice(7)}` ||
        !Array.isArray(input.snapshotTargetRefs) || input.snapshotTargetRefs.some(r=>typeof r!=="string"||r.trim()!==r||r.length===0||r.includes("\0")) ||
        new Set(input.snapshotTargetRefs).size!==input.snapshotTargetRefs.length ||
        !Array.isArray(dependencies) || !dependencies.every(isWorksiteRevisionDependencyObservation) ||
        new Set(dependencies.map(d=>d.designTargetRef)).size!==dependencies.length ||
        input.snapshotTargetRefs.length!==first.targets.length+dependencies.length ||
        !dependencies.every(d=>input.snapshotTargetRefs.includes(d.designTargetRef)) ||
        dependencies.some((d,i)=>i>0&&input.snapshotTargetRefs.indexOf(dependencies[i-1]!.designTargetRef)>=input.snapshotTargetRefs.indexOf(d.designTargetRef)) ||
        dependencies.some(d=>canonicalJson(constructWorksiteSubject({workspaceAuthorityBasis:first.workspaceAuthorityBasis,workspaceBinding:first.workspaceBinding,subjectUri:d.subject.subjectUri,relativePath:d.subject.relativePath}) as unknown as JsonValue)!==canonicalJson(d.subject as unknown as JsonValue))) return false;
    }
    constructWorksiteCommandConfiguration({
      workspaceAuthorityBasis: first.workspaceAuthorityBasis,
      workspaceBinding: first.workspaceBinding,
      commands: input.commands,
      outcomePredicates: input.outcomePredicates,
      allowedWriteTerritories: input.allowedWriteTerritories,
      protectedSubjects: [...tasks.flatMap((task) => task.targets.map((target) => target.subject)), ...dependencies.map(d=>d.subject),
        ...(readBasis?.members.map(row => row.subject) ?? [])],
    });
    return true;
  } catch { return false; }
}

function schemaAccepts(contractRef: string, value: unknown): boolean {
  const source = worksitePreparationSchemaSources().find((candidate) => candidate.declaration.contractRef === contractRef);
  if (source === undefined || typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const readArm = contractRef === WORKSITE_PREPARATION_IDS.inputContractRef && Object.hasOwn(value, "readDependencyBasis");
  if (Object.keys(value).sort().join("\0") !== [...Object.keys(source.fields), ...(readArm ? ["readDependencyBasis"] : [])].sort().join("\0")) return false;
  if (readArm && !isWorksiteReadDependencyBasis((value as Record<string, unknown>).readDependencyBasis)) return false;
  const fields = value as Record<string, unknown>;
  const valid = Object.entries(source.fields).every(([key, node]) => {
    const candidate = fields[key];
    if (node.kind === "literal") return candidate === node.value;
    if (node.kind === "configuration_array") return Array.isArray(candidate);
    if (node.kind === "revision_coordinate") return node.coordinateKind === "digest" ? isSha256Digest(candidate)
      : typeof candidate === "string" && candidate.trim() === candidate && candidate.length > 0 && !candidate.includes("\0");
    const ref = node.declaration.contractRef;
    if (ref === WORKSITE_CONSTRUCTION_IDS.taskContractRef) return isWorksiteConstructionTask(candidate);
    if (ref === WORKSITE_CONSTRUCTION_IDS.resultContractRef) return isWorksiteConstructionResult(candidate);
    if (ref === WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef) return isWorksiteBranchConstructionTask(candidate);
    return worksitePreparationSchemaSources().some((source) => source.declaration.contractRef === ref) && schemaAccepts(ref, candidate);
  });
  return valid && (!("constructionTask" in source.fields) || validConfiguration(value as WorksitePreparationInput));
}
export function constructWorksiteCommandPreparationInput(input: Omit<WorksiteCommandPreparationInput, "kind" | "schemaVersion">): WorksiteCommandPreparationInput {
  const value = { kind: "worksite_command_preparation_input" as const, schemaVersion: "5.0.0" as const, ...input };
  if (!schemaAccepts(WORKSITE_PREPARATION_IDS.inputContractRef, value)) throw new TypeError("invalid command preparation input");
  return deepFreeze(value);
}
export function constructWorksiteBranchCommandPreparationInput(input: Omit<WorksiteBranchCommandPreparationInput, "kind" | "schemaVersion">): WorksiteBranchCommandPreparationInput {
  const value = { kind: "worksite_branch_command_preparation_input" as const, schemaVersion: "5.0.0" as const, ...input };
  if (!schemaAccepts(WORKSITE_PREPARATION_IDS.branchInputContractRef, value)) throw new TypeError("invalid branch command preparation input");
  return deepFreeze(value);
}

export function isWorksitePreparationInput(value: unknown): value is WorksitePreparationInput {
  return schemaAccepts(WORKSITE_PREPARATION_IDS.inputContractRef, value) || schemaAccepts(WORKSITE_PREPARATION_IDS.branchInputContractRef, value) ||
    schemaAccepts(WORKSITE_REVISION_IDS.inputContractRef, value);
}
export function isWorksitePreparationBoundInput(value: unknown): value is WorksitePreparationBoundInput {
  return schemaAccepts(WORKSITE_PREPARATION_IDS.boundInputContractRef, value) || schemaAccepts(WORKSITE_PREPARATION_IDS.branchBoundInputContractRef, value) ||
    schemaAccepts(WORKSITE_REVISION_IDS.boundInputContractRef, value);
}
export function constructWorksiteRevisionCommandPreparationInput(input: Omit<WorksiteRevisionCommandPreparationInput,"kind"|"schemaVersion">): WorksiteRevisionCommandPreparationInput {
  const value = {kind:"worksite_revision_command_preparation_input",schemaVersion:"5.0.0",...input} as const;
  if (!schemaAccepts(WORKSITE_REVISION_IDS.inputContractRef,value)) throw new TypeError("invalid D2 worksite preparation input");
  return deepFreeze(value);
}
export function validateWorksitePreparationContractValue(valueKind: string, value: unknown): boolean {
  if (valueKind === RETAINED_GRAPH_INPUT_CONTRACT.valueKind) return isRetainedGraphInput(value);
  const source = worksitePreparationSchemaSources().find((candidate) => candidate.declaration.valueKind === valueKind);
  return source !== undefined && schemaAccepts(source.declaration.contractRef, value);
}
export function admitWorksitePreparationInput(contractRef: string, value: unknown): Readonly<Record<string, JsonValue>> | null {
  const declaration = worksitePreparationContractDeclarations().find((row) => row.contractRef === contractRef);
  return declaration !== undefined && validateWorksitePreparationContractValue(declaration.valueKind, value)
    ? deepFreeze(value) as Readonly<Record<string, JsonValue>> : null;
}

export function constructRetainedWorksiteInput(binding: GtlEdgeInputBinding, entry: unknown, source: unknown): WorksitePreparationBoundInput {
  const schema = worksitePreparationSchemaSources().find((candidate) => candidate.declaration.contractRef === binding.targetContractRef);
  if (!isWorksiteRetentionContractRelation(binding) || schema === undefined) throw new TypeError("unknown worksite retention contract tuple");
  const value = { kind: schema.declaration.valueKind, schemaVersion: "5.0.0", entry, source };
  if (!schemaAccepts(schema.declaration.contractRef, value)) throw new TypeError("worksite retention value differs from its exact owner schema");
  return deepFreeze(value) as WorksitePreparationBoundInput;
}

export function selectWorksiteConstructionTask(input: WorksitePreparationInput): WorksiteConstructionTask | WorksiteBranchConstructionTask {
  if (!isWorksitePreparationInput(input)) throw new TypeError("invalid worksite preparation input");
  return input.constructionTask;
}
export function prepareWorksiteCommandTask(input: WorksitePreparationBoundInput): WorksiteExecutionTask {
  if (!isWorksitePreparationBoundInput(input)) throw new TypeError("invalid worksite preparation bound input");
  const tasks = preparationConstructionTasks(input.entry);
  const original = tasks[0]!;
  const targets = tasks.flatMap((task) => task.targets);
  if (targets.length !== input.source.members.length) throw new TypeError("construction result does not cover original targets");
  const protectedObservations = targets.map((target, ordinal) => {
    const result = input.source.members[ordinal]!;
    if (result.inputMemberRef !== target.targetRef || result.successorObservation.subjectRef !== target.subject.subjectRef ||
      result.successorObservation.subjectDigest !== target.subject.subjectDigest) throw new TypeError("construction result crossed original target order or identity");
    return { sourceMemberRef: result.inputMemberRef, subject: target.subject, observation: result.successorObservation };
  });
  const common = {
    workspaceAuthorityBasis: original.workspaceAuthorityBasis,
    workspaceBinding: original.workspaceBinding,
    capabilityGrant: original.capabilityGrant,
    sourceConstructionResultRef: input.source.resultRef,
    sourceConstructionResultDigest: input.source.resultDigest,
    sourceConstructionResult: input.source,
    commands: input.entry.commands,
    outcomePredicates: input.entry.outcomePredicates,
    allowedWriteTerritories: input.entry.allowedWriteTerritories,
    protectedObservations,
    ...(input.entry.kind === "worksite_command_preparation_input" && input.entry.readDependencyBasis !== undefined
      ? { readDependencyBasis: input.entry.readDependencyBasis } : {}),
  };
  if (input.entry.kind === "worksite_revision_command_preparation_input") {
    const entry = input.entry;
    const selectedRefs = entry.snapshotTargetRefs.filter(ref => !entry.dependencyObservations.some(row => row.designTargetRef === ref));
    if (selectedRefs.length !== targets.length) throw new TypeError("revision snapshot does not partition its exact selected construction");
    const snapshotSources: WorksiteRevisionSnapshotSource[] = entry.snapshotTargetRefs.map(designTargetRef => {
      const dependency = entry.dependencyObservations.find(row => row.designTargetRef === designTargetRef);
      if (dependency !== undefined) return { designTargetRef, subject: dependency.subject, observation: dependency.observation,
        source: { kind: "retained_dependency", origin: dependency.origin } };
      const selected = protectedObservations[selectedRefs.indexOf(designTargetRef)]!;
      return { designTargetRef, subject: selected.subject, observation: selected.observation,
        source: { kind: "construction_member", sourceMemberRef: selected.sourceMemberRef } };
    });
    return constructWorksiteRevisionCommandExecutionTask({ ...common, revisionBasisRef: entry.revisionBasisRef,
      revisionBasisDigest: entry.revisionBasisDigest, snapshotSources });
  }
  return constructWorksiteCommandExecutionTask(common);
}

export function resolveWorksitePreparationJudgmentRelation(predicateRef: string): Readonly<{
  predicateRef: string; advanceReasonRef: string; rejectionReasonRef: string;
  evaluate: (input: unknown, output: unknown) => boolean;
}> | null {
  if (predicateRef === WORKSITE_PREPARATION_IDS.rootPredicateRef) {
    const relations = [
      resolveWorksiteConstructionJudgmentRelation(WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef),
      resolveWorksiteBranchConstructionJudgmentRelation(WORKSITE_BRANCH_CONSTRUCTION_IDS.rootJudgmentPredicateRef),
      resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef),
      resolveWorksiteCommandExecutionJudgmentRelation(WORKSITE_REVISION_IDS.judgmentPredicateRef),
    ];
    return Object.freeze({ predicateRef,
      advanceReasonRef: "reason://abiogenesis/worksite/command-execution/child-exact@5",
      rejectionReasonRef: "reason://abiogenesis/worksite/command-execution/child-invalid@5",
      evaluate: (input: unknown, output: unknown) => relations.some((relation) => relation?.evaluate(input, output) === true),
    });
  }
  const revision = predicateRef === WORKSITE_REVISION_IDS.selectPredicateRef || predicateRef === WORKSITE_REVISION_IDS.preparePredicateRef;
  const select = predicateRef === WORKSITE_PREPARATION_IDS.selectPredicateRef || predicateRef === WORKSITE_PREPARATION_IDS.selectBranchPredicateRef || predicateRef === WORKSITE_REVISION_IDS.selectPredicateRef;
  const prepare = predicateRef === WORKSITE_PREPARATION_IDS.preparePredicateRef || predicateRef === WORKSITE_PREPARATION_IDS.prepareBranchPredicateRef || predicateRef === WORKSITE_REVISION_IDS.preparePredicateRef;
  if (!select && !prepare) return null;
  return Object.freeze({ predicateRef,
    advanceReasonRef: "reason://abiogenesis/worksite/command-execution/preparation-exact@5",
    rejectionReasonRef: "reason://abiogenesis/worksite/command-execution/preparation-invalid@5",
    evaluate(input: unknown, output: unknown): boolean {
      try {
        const branch = predicateRef === WORKSITE_PREPARATION_IDS.selectBranchPredicateRef || predicateRef === WORKSITE_PREPARATION_IDS.prepareBranchPredicateRef;
        const kind = typeof input === "object" && input !== null && "kind" in input ? input.kind : null;
        if (kind !== (revision ? select ? "worksite_revision_command_preparation_input" : "worksite_revision_command_preparation_bound_input"
          : select ? branch ? "worksite_branch_command_preparation_input" : "worksite_command_preparation_input"
          : branch ? "worksite_branch_command_preparation_bound_input" : "worksite_command_preparation_bound_input")) return false;
        const expected = select && isWorksitePreparationInput(input) ? selectWorksiteConstructionTask(input)
          : prepare && isWorksitePreparationBoundInput(input) ? prepareWorksiteCommandTask(input) : null;
        return expected !== null && canonicalJson(expected as unknown as JsonValue) === canonicalJson(output as JsonValue);
      } catch { return false; }
    },
  });
}

export { WORKSITE_PREPARATION_IDS, worksiteRetentionBinding } from "./worksite_preparation_contracts.js";
export { worksitePreparationContractDeclarations } from "./worksite_preparation_contracts.js";
export type { WorksiteCommandPreparationInput, WorksiteBranchCommandPreparationInput, WorksiteCommandPreparationBoundInput, WorksiteBranchCommandPreparationBoundInput, WorksitePreparationInput, WorksitePreparationBoundInput } from "./worksite_preparation_contracts.js";
