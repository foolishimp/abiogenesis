import { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
function declaration(contractRef, contractKind, valueKind) {
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
function literal(value) { return Object.freeze({ kind: "literal", value }); }
function contractNode(value) { return Object.freeze({ kind: "contract_value", declaration: value }); }
function arrayNode() { return Object.freeze({ kind: "configuration_array" }); }
const configurationFields = { schemaVersion: literal("5.0.0"),
    commands: arrayNode(), outcomePredicates: arrayNode(),
    allowedWriteTerritories: arrayNode() };
const entryFields = { kind: literal("worksite_command_preparation_input"), ...configurationFields,
    constructionTask: contractNode(declaration(WORKSITE_CONSTRUCTION_IDS.taskContractRef, "input", "worksite_construction_task")) };
const branchEntryFields = { kind: literal("worksite_branch_command_preparation_input"), ...configurationFields,
    constructionTask: contractNode(declaration("contract://abiogenesis/worksite/branch-construction-task@5", "input", "worksite_branch_construction_task")) };
const entry = { declaration: declaration(WORKSITE_PREPARATION_IDS.inputContractRef, "input", "worksite_command_preparation_input"), fields: entryFields };
const branchEntry = { declaration: declaration(WORKSITE_PREPARATION_IDS.branchInputContractRef, "input", "worksite_branch_command_preparation_input"), fields: branchEntryFields };
const revisionEntryFields = { kind: literal("worksite_revision_command_preparation_input"), ...configurationFields,
    constructionTask: entryFields.constructionTask, revisionBasisRef: { kind: "revision_coordinate", coordinateKind: "ref" },
    revisionBasisDigest: { kind: "revision_coordinate", coordinateKind: "digest" },
    snapshotTargetRefs: arrayNode(), dependencyObservations: arrayNode() };
const revisionEntry = { declaration: declaration(WORKSITE_REVISION_IDS.inputContractRef, "input", "worksite_revision_command_preparation_input"), fields: revisionEntryFields };
const source = contractNode(WORKSITE_CONSTRUCTION_RESULT_CONTRACT);
const boundFields = { kind: literal("worksite_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
    entry: { ...contractNode(entry.declaration), schema: entry }, source };
const branchBoundFields = { kind: literal("worksite_branch_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
    entry: { ...contractNode(branchEntry.declaration), schema: branchEntry }, source };
const revisionBoundFields = { kind: literal("worksite_revision_command_preparation_bound_input"), schemaVersion: literal("5.0.0"),
    entry: { ...contractNode(revisionEntry.declaration), schema: revisionEntry }, source };
const boundSources = [
    { declaration: declaration(WORKSITE_PREPARATION_IDS.boundInputContractRef, "input", "worksite_command_preparation_bound_input"), fields: boundFields },
    { declaration: declaration(WORKSITE_PREPARATION_IDS.branchBoundInputContractRef, "input", "worksite_branch_command_preparation_bound_input"), fields: branchBoundFields },
    { declaration: declaration(WORKSITE_REVISION_IDS.boundInputContractRef, "input", "worksite_revision_command_preparation_bound_input"), fields: revisionBoundFields },
];
/** @internal Fixed owning schema source consumed by the ABI value interpreter. */
export function worksitePreparationSchemaSources() { return [entry, branchEntry, revisionEntry, ...boundSources]; }
export function worksitePreparationContractDeclarations() {
    return Object.freeze([...worksitePreparationSchemaSources().map((source) => source.declaration), RETAINED_GRAPH_INPUT_CONTRACT]);
}
export function worksiteRetentionBinding(branch = false) {
    const bound = boundSources[branch ? 1 : 0];
    return Object.freeze({ kind: "retain_graph_input", entryContractRef: bound.fields.entry.declaration.contractRef,
        sourceContractRef: bound.fields.source.declaration.contractRef, targetContractRef: bound.declaration.contractRef });
}
export function worksiteRevisionRetentionBinding() {
    const bound = boundSources[2];
    return Object.freeze({ kind: "retain_graph_input", entryContractRef: bound.fields.entry.declaration.contractRef,
        sourceContractRef: bound.fields.source.declaration.contractRef, targetContractRef: bound.declaration.contractRef });
}
export function isWorksiteRetentionContractRelation(binding, contracts) {
    const bound = boundSources.find((candidate) => candidate.declaration.contractRef === binding.targetContractRef);
    if (bound === undefined || binding.kind !== "retain_graph_input" || binding.entryContractRef !== bound.fields.entry.declaration.contractRef ||
        binding.sourceContractRef !== bound.fields.source.declaration.contractRef)
        return false;
    return contracts === undefined || [bound.declaration, bound.fields.entry.declaration, bound.fields.source.declaration].every((expected) => {
        const matches = contracts.filter((candidate) => candidate.contractRef === expected.contractRef);
        return matches.length === 1 && canonicalJson(matches[0]) === canonicalJson(expected);
    });
}
/** One ABI-owned structural pair. Consumers narrow E/S before dependent work. */
export const RETAINED_GRAPH_INPUT_CONTRACT = Object.freeze({
    contractRef: "contract://abiogenesis/worksite/retained-graph-input@5",
    contractVersion: "5.0.0", contractKind: "input", valueKind: "retained_graph_input",
});
export function isRetainedGraphInput(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return false;
    const v = value;
    return Object.keys(v).sort().join("|") === "entry|kind|schemaVersion|source" &&
        v.kind === RETAINED_GRAPH_INPUT_CONTRACT.valueKind && v.schemaVersion === "5.0.0" &&
        [v.entry, v.source].every(x => typeof x === "object" && x !== null && !Array.isArray(x));
}
export function graphInputRetentionBinding(entryContractRef, sourceContractRef) {
    const binding = { kind: "retain_graph_input", entryContractRef, sourceContractRef,
        targetContractRef: RETAINED_GRAPH_INPUT_CONTRACT.contractRef };
    if (!isGraphInputRetentionContractRelation(binding))
        throw new TypeError("invalid retained pair contract references");
    return Object.freeze(binding);
}
export function isGraphInputRetentionContractRelation(binding, contracts) {
    if (binding.targetContractRef !== RETAINED_GRAPH_INPUT_CONTRACT.contractRef)
        return isWorksiteRetentionContractRelation(binding, contracts);
    if (binding.kind !== "retain_graph_input" || Object.keys(binding).sort().join("|") !== "entryContractRef|kind|sourceContractRef|targetContractRef" ||
        ![binding.entryContractRef, binding.sourceContractRef].every(ref => typeof ref === "string" && ref.trim().length > 0) ||
        binding.entryContractRef === binding.targetContractRef || binding.sourceContractRef === binding.targetContractRef)
        return false;
    if (contracts === undefined)
        return true;
    const target = contracts.filter(c => c.contractRef === binding.targetContractRef);
    return target.length === 1 && canonicalJson(target[0]) === canonicalJson(RETAINED_GRAPH_INPUT_CONTRACT) &&
        [binding.entryContractRef, binding.sourceContractRef].every(ref => contracts.filter(c => c.contractRef === ref).length === 1);
}
export function constructRetainedGraphInput(entry, source) {
    const value = { kind: "retained_graph_input", schemaVersion: "5.0.0", entry, source };
    if (!isRetainedGraphInput(value))
        throw new TypeError("retained pair requires exact entry/source records");
    return Object.freeze(value);
}
