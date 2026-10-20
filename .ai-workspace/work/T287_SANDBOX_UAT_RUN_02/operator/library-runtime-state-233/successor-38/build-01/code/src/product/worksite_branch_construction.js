import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonblankNulFreeString as nonEmptyString } from "../shared/admission_predicates.js";
import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction_identity.js";
import { canonicalJson, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isWorksiteConstructionResult, isWorksiteConstructionTask, } from "./worksite_construction.js";
const SCHEMA_VERSION = "5.0.0";
const FAN_OUT_APPLICATION_BODY = {
    kind: "graph_function_application",
    relationKind: "fan_out",
    inputContractRef: "contract://abiogenesis/worksite/branch-construction-vector@5",
    outputContractRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5",
    batchRef: "batch://abiogenesis/worksite/branch-construction/branches@5",
    elementGraphFunctionRef: "graph-function://abiogenesis/worksite/construction@5",
    inputVectorRef: "contract://abiogenesis/worksite/branch-construction-vector@5",
    outputVectorRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5",
    inputMemberContractRef: "contract://abiogenesis/worksite/construction-task@5",
    outputMemberContractRef: "contract://abiogenesis/worksite/construction-result@5",
};
const FAN_IN_APPLICATION_BODY = {
    kind: "graph_function_application",
    relationKind: "fan_in",
    inputContractRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5",
    outputContractRef: "contract://abiogenesis/worksite/construction-result@5",
    reducerGraphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction/reduce@5",
    inputVectorRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5",
};
function applicationRef(body) {
    const digest = sha256Canonical(body);
    return `graph-function-application://abiogenesis/${digest.slice("sha256:".length)}`;
}
export const WORKSITE_BRANCH_CONSTRUCTION_IDS = Object.freeze({
    moduleRef: WORKSITE_CONSTRUCTION_IDS.moduleRef,
    programRef: "program://abiogenesis/worksite/branch-construction@5",
    startRef: "start://abiogenesis/worksite/branch-construction@5",
    graphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction@5",
    branchApplicationGraphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction/branch-application@5",
    reducerGraphFunctionRef: "graph-function://abiogenesis/worksite/branch-construction/reduce@5",
    batchRef: FAN_OUT_APPLICATION_BODY.batchRef,
    fanOutApplicationRef: applicationRef(FAN_OUT_APPLICATION_BODY),
    fanInApplicationRef: applicationRef(FAN_IN_APPLICATION_BODY),
    taskContractRef: "contract://abiogenesis/worksite/branch-construction-task@5",
    vectorContractRef: "contract://abiogenesis/worksite/branch-construction-vector@5",
    outputVectorContractRef: "contract://abiogenesis/worksite/branch-construction-output-vector@5",
    resultContractRef: WORKSITE_CONSTRUCTION_IDS.resultContractRef,
    failureContractRef: "contract://abiogenesis/worksite/branch-construction-failure@5",
    refusalContractRef: "contract://abiogenesis/worksite/branch-construction-refusal@5",
    evidenceContractRef: "contract://abiogenesis/worksite/branch-construction-evidence@5",
    judgmentContractRef: "contract://abiogenesis/worksite/branch-construction-judgment@5",
    transitionContractRef: "contract://abiogenesis/worksite/branch-construction-transition@5",
    childClosureContractRef: "contract://abiogenesis/worksite/branch-construction-child-closure@5",
    closureContractRef: "contract://abiogenesis/worksite/branch-construction-closure@5",
    branchApplicationChildClosureContractRef: "contract://abiogenesis/worksite/branch-construction/branch-application-child-closure@5",
    branchApplicationFailureContractRef: "contract://abiogenesis/worksite/branch-construction/branch-application-failure@5",
    reducerChildClosureContractRef: "contract://abiogenesis/worksite/branch-construction/reducer-child-closure@5",
    planImplementationRef: "implementation://abiogenesis/worksite/branch-construction/plan-fd@5",
    planImplementationBindingRef: "implementation-binding://abiogenesis/worksite/branch-construction/plan-fd@5",
    reducerImplementationRef: "implementation://abiogenesis/worksite/branch-construction/reduce-fd@5",
    reducerImplementationBindingRef: "implementation-binding://abiogenesis/worksite/branch-construction/reduce-fd@5",
    planJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/plan@5",
    branchApplicationJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/branch-application@5",
    reducerJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction/reducer@5",
    rootJudgmentPredicateRef: "predicate://abiogenesis/worksite/branch-construction-result@5",
});
function identity(prefix, digest) {
    return `${prefix}/${digest.slice("sha256:".length)}`;
}
function sameCanonical(left, right) {
    return canonicalJson(left) === canonicalJson(right);
}
function pathIsAncestor(left, right) {
    const leftParts = left.split("/");
    const rightParts = right.split("/");
    return leftParts.length < rightParts.length &&
        leftParts.every((part, index) => part === rightParts[index]);
}
function requireUnique(values, label) {
    if (new Set(values).size !== values.length) {
        throw new TypeError(`${label} must be globally unique`);
    }
}
function branchBody(branch) {
    return branch;
}
function constructAllocation(branches) {
    const members = [];
    for (const branch of branches) {
        branch.constructionTask.targets.forEach((target, branchTargetOrdinal) => {
            members.push({
                ordinal: members.length,
                branchOrdinal: branch.ordinal,
                branchRef: branch.branchRef,
                branchTargetOrdinal,
                targetRef: target.targetRef,
                subjectRef: target.subject.subjectRef,
                subjectDigest: target.subject.subjectDigest,
                relativePath: target.subject.relativePath,
                territoryRef: target.territory.territoryRef,
                territoryDigest: target.territory.territoryDigest,
                predecessorObservationRef: target.predecessorObservation.observationRef,
                predecessorObservationDigest: target.predecessorObservation.observationDigest,
            });
        });
    }
    requireUnique(members.map((member) => member.targetRef), "target refs");
    requireUnique(members.map((member) => member.subjectRef), "subject refs");
    requireUnique(members.map((member) => member.subjectDigest), "subject digests");
    requireUnique(members.map((member) => member.relativePath), "target paths");
    for (let left = 0; left < members.length; left += 1) {
        for (let right = left + 1; right < members.length; right += 1) {
            const leftPath = members[left].relativePath;
            const rightPath = members[right].relativePath;
            if (pathIsAncestor(leftPath, rightPath) || pathIsAncestor(rightPath, leftPath)) {
                throw new TypeError("worksite branch targets cannot be path-component ancestors");
            }
        }
    }
    const allocationDigest = sha256Canonical({ members });
    return deepFreeze({
        allocationRef: identity("worksite-branch-target-allocation://abiogenesis", allocationDigest),
        allocationDigest,
        members,
    });
}
export function constructWorksiteBranchConstructionTask(input) {
    if (!Array.isArray(input.branches) || input.branches.length === 0) {
        throw new TypeError("worksite branch construction requires branches");
    }
    if (!input.branches.every((branch) => isRecord(branch) &&
        hasExactKeys(branch, ["branchRef", "constructionTask", "dependsOn"]) &&
        nonEmptyString(branch.branchRef) &&
        Array.isArray(branch.dependsOn) &&
        branch.dependsOn.every(nonEmptyString) &&
        isWorksiteConstructionTask(branch.constructionTask))) {
        throw new TypeError("worksite branch construction requires exact branch refs, dependencies, and C1 tasks");
    }
    const inputs = input.branches;
    const firstTask = inputs[0].constructionTask;
    if (!sameCanonical(input.workspaceBinding, firstTask.workspaceBinding) ||
        !sameCanonical(input.capabilityGrant, firstTask.capabilityGrant) ||
        inputs.some((branch) => !sameCanonical(branch.constructionTask.workspaceAuthorityBasis, firstTask.workspaceAuthorityBasis) ||
            !sameCanonical(branch.constructionTask.workspaceBinding, input.workspaceBinding) ||
            !sameCanonical(branch.constructionTask.capabilityGrant, input.capabilityGrant))) {
        throw new TypeError("aggregate and every C1 task require one exact authority basis, workspace, and grant");
    }
    requireUnique(inputs.map((branch) => branch.branchRef), "branch refs");
    const branchOrdinals = new Map(inputs.map((branch, ordinal) => [branch.branchRef, ordinal]));
    const levels = [];
    const branches = inputs.map((inputBranch, ordinal) => {
        requireUnique(inputBranch.dependsOn, "branch dependencies");
        const dependencyOrdinals = inputBranch.dependsOn.map((dependencyRef) => {
            const dependencyOrdinal = branchOrdinals.get(dependencyRef);
            if (dependencyOrdinal === undefined) {
                throw new TypeError("branch dependencies must name known branches");
            }
            if (dependencyOrdinal === ordinal) {
                throw new TypeError("a branch cannot depend on itself");
            }
            return dependencyOrdinal;
        });
        if (dependencyOrdinals.some((dependencyOrdinal) => dependencyOrdinal >= ordinal) ||
            dependencyOrdinals.some((dependencyOrdinal, index) => index > 0 && dependencyOrdinal <= dependencyOrdinals[index - 1])) {
            throw new TypeError("branch order must already be topological and dependencies ordinal-ordered");
        }
        const topologicalLevel = dependencyOrdinals.length === 0
            ? 0
            : 1 + Math.max(...dependencyOrdinals.map((dependencyOrdinal) => levels[dependencyOrdinal]));
        levels.push(topologicalLevel);
        const body = {
            ordinal,
            branchRef: inputBranch.branchRef,
            dependsOn: [...inputBranch.dependsOn],
            topologicalLevel,
            constructionTask: inputBranch.constructionTask,
        };
        return deepFreeze({
            ...body,
            branchDigest: sha256Canonical(branchBody(body)),
        });
    });
    const targetAllocation = constructAllocation(branches);
    const body = {
        workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant,
        branches,
        targetAllocation,
    };
    const taskDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_branch_construction_task",
        schemaVersion: SCHEMA_VERSION,
        taskRef: identity("worksite-branch-construction-task://abiogenesis", taskDigest),
        taskDigest,
        ...body,
    });
}
export function isWorksiteBranchConstructionTask(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "branches",
            "capabilityGrant",
            "kind",
            "schemaVersion",
            "targetAllocation",
            "taskDigest",
            "taskRef",
            "workspaceBinding",
        ]) ||
        value.kind !== "worksite_branch_construction_task" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.taskRef) ||
        !isSha256Digest(value.taskDigest) ||
        !Array.isArray(value.branches))
        return false;
    try {
        const expected = constructWorksiteBranchConstructionTask({
            workspaceBinding: value.workspaceBinding,
            capabilityGrant: value.capabilityGrant,
            branches: value.branches.map((branch) => {
                if (!isRecord(branch))
                    throw new TypeError("invalid branch");
                return {
                    branchRef: branch.branchRef,
                    dependsOn: branch.dependsOn,
                    constructionTask: branch.constructionTask,
                };
            }),
        });
        return sameCanonical(expected, value);
    }
    catch {
        return false;
    }
}
export function constructWorksiteBranchConstructionVector(task) {
    if (!isWorksiteBranchConstructionTask(task)) {
        throw new TypeError("branch vector requires one exact aggregate task");
    }
    const body = {
        sourceTaskRef: task.taskRef,
        sourceTaskDigest: task.taskDigest,
        members: task.branches.map((branch) => ({
            ordinal: branch.ordinal,
            memberRef: branch.branchRef,
            value: branch.constructionTask,
        })),
    };
    const vectorDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_branch_construction_vector",
        schemaVersion: SCHEMA_VERSION,
        vectorRef: identity("worksite-branch-construction-vector://abiogenesis", vectorDigest),
        vectorDigest,
        ...body,
    });
}
export function isWorksiteBranchConstructionVector(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "members",
            "schemaVersion",
            "sourceTaskDigest",
            "sourceTaskRef",
            "vectorDigest",
            "vectorRef",
        ]) ||
        value.kind !== "worksite_branch_construction_vector" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.vectorRef) ||
        !isSha256Digest(value.vectorDigest) ||
        !nonEmptyString(value.sourceTaskRef) ||
        !isSha256Digest(value.sourceTaskDigest) ||
        !Array.isArray(value.members) ||
        value.members.length === 0 ||
        !value.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, ["memberRef", "ordinal", "value"]) &&
            member.ordinal === ordinal &&
            nonEmptyString(member.memberRef) &&
            isWorksiteConstructionTask(member.value)))
        return false;
    const members = value.members;
    if (new Set(members.map((member) => member.memberRef)).size !== members.length) {
        return false;
    }
    const firstTask = members[0].value;
    if (members.some((member) => !sameCanonical(member.value.workspaceAuthorityBasis, firstTask.workspaceAuthorityBasis) ||
        !sameCanonical(member.value.workspaceBinding, firstTask.workspaceBinding) ||
        !sameCanonical(member.value.capabilityGrant, firstTask.capabilityGrant)))
        return false;
    const body = {
        sourceTaskRef: value.sourceTaskRef,
        sourceTaskDigest: value.sourceTaskDigest,
        members,
    };
    const digest = sha256Canonical(body);
    return value.vectorDigest === digest &&
        value.vectorRef === identity("worksite-branch-construction-vector://abiogenesis", digest);
}
export function isWorksiteBranchConstructionOutputVector(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, ["applicationRef", "kind", "members", "schemaVersion"]) ||
        value.kind !== "gtl_fan_out_vector" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        value.applicationRef !== WORKSITE_BRANCH_CONSTRUCTION_IDS.fanOutApplicationRef ||
        !Array.isArray(value.members) ||
        value.members.length === 0 ||
        !value.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, [
                "inputMemberRef",
                "ordinal",
                "outputMemberRef",
                "value",
            ]) &&
            member.ordinal === ordinal &&
            nonEmptyString(member.inputMemberRef) &&
            nonEmptyString(member.outputMemberRef) &&
            isWorksiteConstructionResult(member.value)))
        return false;
    const members = value.members;
    return new Set(members.map((member) => member.inputMemberRef)).size ===
        members.length &&
        new Set(members.map((member) => member.outputMemberRef)).size ===
            members.length;
}
export function reduceWorksiteBranchConstructionResults(input) {
    if (!isWorksiteBranchConstructionOutputVector(input)) {
        throw new TypeError("branch reducer requires one complete authenticated C1 output vector");
    }
    const nestedMembers = input.members.flatMap((branchMember) => branchMember.value.members);
    requireUnique(nestedMembers.map((member) => member.inputMemberRef), "nested input refs");
    requireUnique(nestedMembers.map((member) => member.outputMemberRef), "nested output refs");
    requireUnique(nestedMembers.map((member) => member.successorObservation.subjectRef), "nested successor subjects");
    const members = nestedMembers.map((member, ordinal) => ({
        ordinal,
        inputMemberRef: member.inputMemberRef,
        outputMemberRef: member.outputMemberRef,
        receipt: member.receipt,
        successorObservation: member.successorObservation,
    }));
    const body = {
        sourceApplicationRef: WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef,
        members,
    };
    const resultDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_construction_result",
        schemaVersion: SCHEMA_VERSION,
        resultRef: identity("worksite-construction-result://abiogenesis", resultDigest),
        resultDigest,
        ...body,
    });
}
export function isWorksiteBranchConstructionFailure(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "diagnosticRef",
            "failureClass",
            "kind",
            "schemaVersion",
        ]) &&
        value.kind === "worksite_branch_construction_failure" &&
        value.schemaVersion === SCHEMA_VERSION &&
        nonEmptyString(value.failureClass) &&
        nonEmptyString(value.diagnosticRef);
}
export function isWorksiteBranchConstructionBranchApplicationFailure(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "diagnosticRef",
            "failureClass",
            "kind",
            "schemaVersion",
        ]) &&
        value.kind === "worksite_branch_construction_branch_application_failure" &&
        value.schemaVersion === SCHEMA_VERSION &&
        nonEmptyString(value.failureClass) &&
        nonEmptyString(value.diagnosticRef);
}
function exactTaskResultRelation(input, output) {
    if (!isWorksiteBranchConstructionTask(input) ||
        !isWorksiteConstructionResult(output))
        return false;
    const targets = input.branches.flatMap((branch) => branch.constructionTask.targets);
    if (targets.length !== output.members.length)
        return false;
    return output.members.every((member, ordinal) => {
        const target = targets[ordinal];
        return target !== undefined &&
            member.inputMemberRef === target.targetRef &&
            member.successorObservation.workspaceBindingIdentity ===
                input.workspaceBinding.bindingId &&
            member.successorObservation.subjectRef === target.subject.subjectRef &&
            member.successorObservation.subjectDigest === target.subject.subjectDigest;
    });
}
function exactVectorResultRelation(input, output) {
    if (!isWorksiteBranchConstructionVector(input) ||
        !isWorksiteConstructionResult(output))
        return false;
    const targets = input.members.flatMap((member) => member.value.targets);
    if (targets.length !== output.members.length)
        return false;
    return output.members.every((member, ordinal) => {
        const target = targets[ordinal];
        return target !== undefined && member.inputMemberRef === target.targetRef &&
            member.successorObservation.subjectRef === target.subject.subjectRef &&
            member.successorObservation.subjectDigest === target.subject.subjectDigest;
    });
}
function exactNestedC1ResultRelation(input, output) {
    if (!isWorksiteConstructionTask(input) || !isWorksiteConstructionResult(output)) {
        return false;
    }
    if (input.targets.length !== output.members.length)
        return false;
    return output.members.every((member, ordinal) => {
        const target = input.targets[ordinal];
        return target !== undefined && member.inputMemberRef === target.targetRef &&
            member.successorObservation.workspaceBindingIdentity ===
                input.workspaceBinding.bindingId &&
            member.successorObservation.subjectRef === target.subject.subjectRef &&
            member.successorObservation.subjectDigest === target.subject.subjectDigest;
    });
}
function exactPlanRelation(input, output) {
    if (!isWorksiteBranchConstructionTask(input) ||
        !isWorksiteBranchConstructionVector(output))
        return false;
    try {
        return sameCanonical(constructWorksiteBranchConstructionVector(input), output);
    }
    catch {
        return false;
    }
}
function exactReducerRelation(input, output) {
    if (!isWorksiteBranchConstructionOutputVector(input) ||
        !isWorksiteConstructionResult(output))
        return false;
    try {
        return sameCanonical(reduceWorksiteBranchConstructionResults(input), output);
    }
    catch {
        return false;
    }
}
function exactBranchApplicationRelation(input, output) {
    return exactNestedC1ResultRelation(input, output) ||
        exactReducerRelation(input, output) ||
        exactVectorResultRelation(input, output);
}
function exactRootRelation(input, output) {
    return exactTaskResultRelation(input, output) ||
        exactVectorResultRelation(input, output);
}
export function resolveWorksiteBranchConstructionJudgmentRelation(predicateRef) {
    const evaluate = predicateRef ===
        WORKSITE_BRANCH_CONSTRUCTION_IDS.planJudgmentPredicateRef
        ? exactPlanRelation
        : predicateRef ===
            WORKSITE_BRANCH_CONSTRUCTION_IDS.branchApplicationJudgmentPredicateRef
            ? exactBranchApplicationRelation
            : predicateRef ===
                WORKSITE_BRANCH_CONSTRUCTION_IDS.reducerJudgmentPredicateRef
                ? exactReducerRelation
                : predicateRef === WORKSITE_BRANCH_CONSTRUCTION_IDS.rootJudgmentPredicateRef
                    ? exactRootRelation
                    : null;
    if (evaluate === null)
        return null;
    return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/worksite/branch-construction-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/worksite/branch-construction-rejected@5",
        evaluate,
    });
}
