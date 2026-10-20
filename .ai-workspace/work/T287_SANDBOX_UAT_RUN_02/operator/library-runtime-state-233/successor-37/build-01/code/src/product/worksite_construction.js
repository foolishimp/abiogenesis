import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonblankNulFreeString as nonEmptyString } from "../shared/admission_predicates.js";
import { WORKSITE_CONSTRUCTION_IDS } from "./worksite_construction_identity.js";
export { WORKSITE_CONSTRUCTION_IDS, WORKSITE_CONSTRUCTION_RESULT_CONTRACT } from "./worksite_construction_identity.js";
import { isAbsolute } from "node:path";
import { canonicalJson, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isWorkspaceAuthorityBasis, } from "./environment.js";
import { isCapabilityGrantValue, } from "./invocation.js";
import { constructWorksiteFileReplaceRequest, constructWorksiteSubject, constructWorksiteTerritory, isWorksiteEffectAuthorization, isWorksiteFileReplaceReceipt, isWorksiteFileReplaceRequest, isWorksiteObservation, isWorksiteSubject, isWorksiteTerritory, worksiteSubjectWithinTerritory, } from "./worksite_effect.js";
const SCHEMA_VERSION = "5.0.0";
function identity(prefix, digest) {
    return `${prefix}/${digest.slice("sha256:".length)}`;
}
function sameCanonical(left, right) {
    return canonicalJson(left) === canonicalJson(right);
}
function isExactWorkspaceBinding(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "admissionEventRef",
            "authorityBasisDigest",
            "authorityBasisId",
            "authorizedActorRef",
            "bindingDigest",
            "bindingId",
            "kind",
            "lockDigest",
            "lockId",
            "productSetDigest",
            "productSetId",
            "roots",
            "schemaVersion",
            "workspaceId",
        ]) ||
        value.kind !== "workspace_binding" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.bindingId) ||
        !isSha256Digest(value.bindingDigest) ||
        !nonEmptyString(value.workspaceId) ||
        !nonEmptyString(value.authorityBasisId) ||
        !isSha256Digest(value.authorityBasisDigest) ||
        !nonEmptyString(value.authorizedActorRef) ||
        !nonEmptyString(value.productSetId) ||
        !isSha256Digest(value.productSetDigest) ||
        !nonEmptyString(value.lockId) ||
        !isSha256Digest(value.lockDigest) ||
        !nonEmptyString(value.admissionEventRef) ||
        !isRecord(value.roots) ||
        !hasExactKeys(value.roots, [
            "archiveRoot",
            "eventLogRoot",
            "productRoot",
            "projectionRoot",
            "runtimeStateRoot",
            "toolchainRoot",
        ]) ||
        Object.values(value.roots).some((root) => !nonEmptyString(root) || !isAbsolute(root)))
        return false;
    const body = {
        workspaceId: value.workspaceId,
        authorityBasisId: value.authorityBasisId,
        authorityBasisDigest: value.authorityBasisDigest,
        authorizedActorRef: value.authorizedActorRef,
        productSetId: value.productSetId,
        productSetDigest: value.productSetDigest,
        lockId: value.lockId,
        lockDigest: value.lockDigest,
        roots: value.roots,
    };
    const digest = sha256Canonical(body);
    return value.bindingDigest === digest &&
        value.bindingId === identity("workspace-binding://abiogenesis", digest);
}
function exactWorkspaceAuthorityJoin(authority, workspace) {
    return isWorkspaceAuthorityBasis(authority) &&
        isExactWorkspaceBinding(workspace) &&
        authority.workspaceId === workspace.workspaceId &&
        authority.authorityBasisId === workspace.authorityBasisId &&
        authority.authorityBasisDigest === workspace.authorityBasisDigest &&
        authority.authorizedActorRef === workspace.authorizedActorRef;
}
function isExactDirectGrant(value, workspaceBinding) {
    return isCapabilityGrantValue(value) &&
        value.operationId === "abg.operation.run.invoke" &&
        value.definitionKey.operationId === "abg.operation.run.invoke" &&
        (value.definitionKey.memberKey === "invoke" || value.definitionKey.memberKey === "start") &&
        value.actorRef === workspaceBinding.authorizedActorRef &&
        value.scopeRef === workspaceBinding.bindingId &&
        value.scopeDigest === workspaceBinding.bindingDigest;
}
function targetBody(value) {
    return {
        subject: value.subject,
        territory: value.territory,
        predecessorObservation: value.predecessorObservation,
    };
}
function constructTarget(workspaceAuthorityBasis, workspaceBinding, input) {
    if (!isWorksiteSubject(input.subject) ||
        !isWorksiteTerritory(input.territory) ||
        !isWorksiteObservation(input.predecessorObservation) ||
        input.subject.workspaceBindingIdentity !== workspaceBinding.bindingId ||
        input.subject.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
        input.territory.workspaceBindingIdentity !== workspaceBinding.bindingId ||
        input.territory.workspaceBindingDigest !== workspaceBinding.bindingDigest ||
        input.predecessorObservation.workspaceBindingIdentity !==
            workspaceBinding.bindingId ||
        input.predecessorObservation.subjectRef !== input.subject.subjectRef ||
        input.predecessorObservation.subjectDigest !== input.subject.subjectDigest ||
        !worksiteSubjectWithinTerritory(input.subject, input.territory)) {
        throw new TypeError("worksite construction target requires one W-bound subject, territory, and predecessor observation");
    }
    const exactSubject = constructWorksiteSubject({
        workspaceAuthorityBasis,
        workspaceBinding,
        subjectUri: input.subject.subjectUri,
        relativePath: input.subject.relativePath,
    });
    const exactTerritory = constructWorksiteTerritory({
        workspaceAuthorityBasis,
        workspaceBinding,
        territoryUri: input.territory.territoryUri,
        relativeRoot: input.territory.relativeRoot,
    });
    if (exactSubject.kind !== "worksite_subject" ||
        exactTerritory.kind !== "worksite_territory" ||
        !sameCanonical(exactSubject, input.subject) ||
        !sameCanonical(exactTerritory, input.territory)) {
        throw new TypeError("worksite construction target must reproduce under the exact canonical worksite authority");
    }
    const digest = sha256Canonical(targetBody(input));
    const targetRef = identity("worksite-construction-target://abiogenesis", digest);
    if (input.targetRef !== undefined && input.targetRef !== targetRef) {
        throw new TypeError("worksite construction target ref must cover its complete canonical body");
    }
    return deepFreeze({
        kind: "worksite_construction_target",
        schemaVersion: SCHEMA_VERSION,
        targetRef,
        subject: input.subject,
        territory: input.territory,
        predecessorObservation: input.predecessorObservation,
    });
}
function isWorksiteConstructionTarget(value, workspaceAuthorityBasis, workspaceBinding) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "predecessorObservation",
            "schemaVersion",
            "subject",
            "targetRef",
            "territory",
        ]) ||
        value.kind !== "worksite_construction_target" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.targetRef))
        return false;
    try {
        const expected = constructTarget(workspaceAuthorityBasis, workspaceBinding, {
            subject: value.subject,
            territory: value.territory,
            predecessorObservation: value.predecessorObservation,
        });
        return sameCanonical(expected, value);
    }
    catch {
        return false;
    }
}
function taskBody(value) {
    return value;
}
export function constructWorksiteConstructionTask(input) {
    if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) ||
        !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) ||
        typeof input.prompt !== "string" ||
        input.prompt.trim().length === 0 ||
        !Array.isArray(input.targets) ||
        input.targets.length === 0) {
        throw new TypeError("worksite construction task requires one exact W, direct grant, prompt, and non-empty target vector");
    }
    const targets = input.targets.map((target) => constructTarget(input.workspaceAuthorityBasis, input.workspaceBinding, target));
    if (new Set(targets.map((target) => target.targetRef)).size !== targets.length ||
        new Set(targets.map((target) => target.subject.subjectRef)).size !==
            targets.length) {
        throw new TypeError("worksite construction targets require unique refs and subjects");
    }
    const body = {
        workspaceAuthorityBasis: input.workspaceAuthorityBasis,
        workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant,
        materializationPlanRef: WORKSITE_CONSTRUCTION_IDS.materializationPlanRef,
        rendererRef: WORKSITE_CONSTRUCTION_IDS.rendererRef,
        instructionContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef,
        resultContractRef: WORKSITE_CONSTRUCTION_IDS.workerResultContractRef,
        workerActorRef: WORKSITE_CONSTRUCTION_IDS.workerActorRef,
        workerBindingRef: WORKSITE_CONSTRUCTION_IDS.workerBindingRef,
        transportLane: WORKSITE_CONSTRUCTION_IDS.transportLane,
        prompt: input.prompt,
        promptDigest: sha256Canonical(input.prompt),
        targets,
    };
    const taskDigest = sha256Canonical(taskBody(body));
    return deepFreeze({
        kind: "worksite_construction_task",
        schemaVersion: SCHEMA_VERSION,
        taskRef: identity("worksite-construction-task://abiogenesis", taskDigest),
        taskDigest,
        ...body,
    });
}
export function isWorksiteConstructionTask(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "capabilityGrant",
            "instructionContractRef",
            "kind",
            "materializationPlanRef",
            "prompt",
            "promptDigest",
            "rendererRef",
            "resultContractRef",
            "schemaVersion",
            "targets",
            "taskDigest",
            "taskRef",
            "transportLane",
            "workerActorRef",
            "workerBindingRef",
            "workspaceAuthorityBasis",
            "workspaceBinding",
        ]) ||
        value.kind !== "worksite_construction_task" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.taskRef) ||
        !isSha256Digest(value.taskDigest) ||
        !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) ||
        !isExactWorkspaceBinding(value.workspaceBinding) ||
        !exactWorkspaceAuthorityJoin(value.workspaceAuthorityBasis, value.workspaceBinding) ||
        !isExactDirectGrant(value.capabilityGrant, value.workspaceBinding) ||
        value.materializationPlanRef !==
            WORKSITE_CONSTRUCTION_IDS.materializationPlanRef ||
        value.rendererRef !== WORKSITE_CONSTRUCTION_IDS.rendererRef ||
        value.instructionContractRef !==
            WORKSITE_CONSTRUCTION_IDS.taskContractRef ||
        value.resultContractRef !==
            WORKSITE_CONSTRUCTION_IDS.workerResultContractRef ||
        value.workerActorRef !== WORKSITE_CONSTRUCTION_IDS.workerActorRef ||
        value.workerBindingRef !== WORKSITE_CONSTRUCTION_IDS.workerBindingRef ||
        value.transportLane !== WORKSITE_CONSTRUCTION_IDS.transportLane ||
        typeof value.prompt !== "string" ||
        value.prompt.trim().length === 0 ||
        !isSha256Digest(value.promptDigest) ||
        value.promptDigest !== sha256Canonical(value.prompt) ||
        !Array.isArray(value.targets) ||
        value.targets.length === 0 ||
        !value.targets.every((target) => isWorksiteConstructionTarget(target, value.workspaceAuthorityBasis, value.workspaceBinding)))
        return false;
    const targets = value.targets;
    if (new Set(targets.map((target) => target.targetRef)).size !== targets.length ||
        new Set(targets.map((target) => target.subject.subjectRef)).size !==
            targets.length)
        return false;
    const { kind: _kind, schemaVersion: _schemaVersion, taskRef: _taskRef, taskDigest: _taskDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return value.taskDigest === digest &&
        value.taskRef === identity("worksite-construction-task://abiogenesis", digest);
}
function canonicalBase64(value) {
    if (typeof value !== "string")
        return false;
    const bytes = Buffer.from(value, "base64");
    return bytes.toString("base64") === value;
}
function isWorksiteCandidateFile(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "kind",
            "replacementBase64",
            "schemaVersion",
            "targetRef",
        ]) &&
        value.kind === "worksite_candidate_file" &&
        value.schemaVersion === SCHEMA_VERSION &&
        nonEmptyString(value.targetRef) &&
        canonicalBase64(value.replacementBase64);
}
function scalarText(value) {
    if (typeof value !== "string")
        return false;
    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint >= 0xD800 && codePoint <= 0xDFFF)
            return false;
    }
    return true;
}
function isWorksiteConstructionWorkerFile(value) {
    return isWorksiteCandidateFile(value) ||
        (isRecord(value) &&
            hasExactKeys(value, ["kind", "replacementText", "schemaVersion", "targetRef"]) &&
            value.kind === "worksite_candidate_file" &&
            value.schemaVersion === SCHEMA_VERSION &&
            nonEmptyString(value.targetRef) &&
            scalarText(value.replacementText));
}
export function isWorksiteConstructionWorkerResult(value) {
    return isRecord(value) &&
        hasExactKeys(value, ["files", "kind", "schemaVersion"]) &&
        value.kind === "worksite_construction_worker_result" &&
        value.schemaVersion === SCHEMA_VERSION &&
        Array.isArray(value.files) &&
        value.files.length > 0 &&
        value.files.every(isWorksiteConstructionWorkerFile) &&
        new Set(value.files.map((file) => file.targetRef)).size === value.files.length;
}
export function constructWorksiteConstructionWorkerResult(task, rawValue) {
    if (!isWorksiteConstructionTask(task) ||
        !isWorksiteConstructionWorkerResult(rawValue)) {
        throw new TypeError("worksite construction worker result requires one exact task-derived closed value");
    }
    if (rawValue.files.length !== task.targets.length ||
        !rawValue.files.every((file, ordinal) => file.targetRef === task.targets[ordinal]?.targetRef)) {
        throw new TypeError("worksite construction worker result must preserve exact target cardinality and order");
    }
    return deepFreeze({
        kind: "worksite_construction_worker_result",
        schemaVersion: SCHEMA_VERSION,
        files: rawValue.files.map((file) => ({ ...file })),
    });
}
export function worksiteConstructionWorkerResultSchema(task) {
    if (!isWorksiteConstructionTask(task)) {
        throw new TypeError("worksite construction response schema requires one exact task");
    }
    const targetRefs = task.targets.map((target) => target.targetRef);
    const fileSchema = {
        type: "object",
        additionalProperties: false,
        required: ["kind", "schemaVersion", "targetRef"],
        properties: {
            kind: { const: "worksite_candidate_file" },
            schemaVersion: { const: SCHEMA_VERSION },
            targetRef: targetRefs.length === 1
                ? { const: targetRefs[0] }
                : { enum: targetRefs },
            replacementText: { type: "string" },
            replacementBase64: {
                type: "string",
                pattern: "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
            },
        },
    };
    return deepFreeze({
        type: "object",
        additionalProperties: false,
        required: ["kind", "schemaVersion", "files"],
        properties: {
            kind: { const: "worksite_construction_worker_result" },
            schemaVersion: { const: SCHEMA_VERSION },
            files: {
                type: "array",
                minItems: 1,
                items: fileSchema,
            },
        },
    });
}
export function constructWorksiteCandidateBundle(task, workerResult) {
    const exactWorkerResult = constructWorksiteConstructionWorkerResult(task, workerResult);
    const body = {
        task,
        files: exactWorkerResult.files.map((file) => ({
            kind: file.kind,
            schemaVersion: file.schemaVersion,
            targetRef: file.targetRef,
            replacementBase64: "replacementText" in file
                ? Buffer.from(file.replacementText, "utf8").toString("base64")
                : file.replacementBase64,
        })),
    };
    const candidateBundleDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_candidate_bundle",
        schemaVersion: SCHEMA_VERSION,
        candidateBundleRef: identity("worksite-candidate-bundle://abiogenesis", candidateBundleDigest),
        candidateBundleDigest,
        ...body,
    });
}
export function isWorksiteCandidateBundle(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "candidateBundleDigest",
            "candidateBundleRef",
            "files",
            "kind",
            "schemaVersion",
            "task",
        ]) ||
        value.kind !== "worksite_candidate_bundle" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.candidateBundleRef) ||
        !isSha256Digest(value.candidateBundleDigest) ||
        !isWorksiteConstructionTask(value.task))
        return false;
    try {
        const expected = constructWorksiteCandidateBundle(value.task, {
            kind: "worksite_construction_worker_result",
            schemaVersion: SCHEMA_VERSION,
            files: value.files,
        });
        return sameCanonical(expected, value);
    }
    catch {
        return false;
    }
}
export function constructWorksiteFileReplaceVector(candidate) {
    if (!isWorksiteCandidateBundle(candidate)) {
        throw new TypeError("worksite authority join requires one exact Product-wrapped candidate bundle");
    }
    const members = candidate.task.targets.map((target, ordinal) => {
        const file = candidate.files[ordinal];
        const request = constructWorksiteFileReplaceRequest({
            workspaceAuthorityBasis: candidate.task.workspaceAuthorityBasis,
            workspaceBinding: candidate.task.workspaceBinding,
            capabilityGrant: candidate.task.capabilityGrant,
            subject: target.subject,
            territory: target.territory,
            predecessorObservation: target.predecessorObservation,
            replacementBytes: Buffer.from(file.replacementBase64, "base64"),
        });
        if (!isWorksiteFileReplaceRequest(request)) {
            throw new TypeError("worksite authority join could not construct one exact C0 request");
        }
        return deepFreeze({
            ordinal,
            memberRef: target.targetRef,
            value: request,
        });
    });
    const body = {
        sourceCandidateBundleRef: candidate.candidateBundleRef,
        sourceCandidateBundleDigest: candidate.candidateBundleDigest,
        members,
    };
    const vectorDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_file_replace_vector",
        schemaVersion: SCHEMA_VERSION,
        vectorRef: identity("worksite-file-replace-vector://abiogenesis", vectorDigest),
        vectorDigest,
        ...body,
    });
}
export function isWorksiteFileReplaceVector(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "members",
            "schemaVersion",
            "sourceCandidateBundleDigest",
            "sourceCandidateBundleRef",
            "vectorDigest",
            "vectorRef",
        ]) ||
        value.kind !== "worksite_file_replace_vector" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.vectorRef) ||
        !isSha256Digest(value.vectorDigest) ||
        !nonEmptyString(value.sourceCandidateBundleRef) ||
        !isSha256Digest(value.sourceCandidateBundleDigest) ||
        !Array.isArray(value.members) ||
        value.members.length === 0 ||
        !value.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, ["memberRef", "ordinal", "value"]) &&
            member.ordinal === ordinal &&
            nonEmptyString(member.memberRef) &&
            isWorksiteFileReplaceRequest(member.value)))
        return false;
    const members = value.members;
    if (new Set(members.map((member) => member.memberRef)).size !== members.length ||
        new Set(members.map((member) => member.value.subject.subjectRef)).size !==
            members.length ||
        new Set(members.map((member) => member.value.workspaceBindingIdentity)).size !==
            1 ||
        new Set(members.map((member) => member.value.workspaceBindingDigest)).size !==
            1 ||
        members.some((member) => !sameCanonical(member.value.workspaceAuthorityBasis, members[0].value.workspaceAuthorityBasis)) ||
        new Set(members.map((member) => member.value.capabilityGrant.grantRef)).size !==
            1 ||
        new Set(members.map((member) => member.value.capabilityGrant.grantDigest)).size !==
            1)
        return false;
    const body = {
        sourceCandidateBundleRef: value.sourceCandidateBundleRef,
        sourceCandidateBundleDigest: value.sourceCandidateBundleDigest,
        members,
    };
    const digest = sha256Canonical(body);
    return value.vectorDigest === digest &&
        value.vectorRef ===
            identity("worksite-file-replace-vector://abiogenesis", digest);
}
function isWorksiteFileReplaceOutput(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "authorization",
            "kind",
            "receipt",
            "schemaVersion",
            "successorObservation",
        ]) ||
        value.kind !== "worksite_file_replace_output" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !isWorksiteEffectAuthorization(value.authorization) ||
        !isWorksiteFileReplaceReceipt(value.receipt) ||
        !isWorksiteObservation(value.successorObservation) ||
        value.successorObservation.state !== "file")
        return false;
    const authorization = value.authorization;
    const receipt = value.receipt;
    const successor = value.successorObservation;
    return authorization.workspaceBindingIdentity ===
        successor.workspaceBindingIdentity &&
        authorization.subjectRef === successor.subjectRef &&
        authorization.subjectDigest === successor.subjectDigest &&
        receipt.authorizationRef === authorization.authorizationRef &&
        receipt.authorizationDigest === authorization.authorizationDigest &&
        receipt.afterObservationRef === successor.observationRef &&
        receipt.afterObservationDigest === successor.observationDigest &&
        receipt.writtenDigest === successor.fileDigest;
}
export function isWorksiteFileReplaceOutputVector(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "applicationRef",
            "kind",
            "members",
            "schemaVersion",
        ]) ||
        value.kind !== "gtl_fan_out_vector" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        value.applicationRef !== WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef ||
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
            isWorksiteFileReplaceOutput(member.value)))
        return false;
    const members = value.members;
    return new Set(members.map((member) => member.inputMemberRef)).size ===
        members.length &&
        new Set(members.map((member) => member.outputMemberRef)).size ===
            members.length &&
        new Set(members.map((member) => member.value.successorObservation.subjectRef)).size === members.length;
}
export function reduceWorksiteFileReplaceResults(input) {
    if (!isWorksiteFileReplaceOutputVector(input)) {
        throw new TypeError("worksite construction reducer requires one complete authenticated C0 output vector");
    }
    const body = {
        sourceApplicationRef: input.applicationRef,
        members: input.members.map((member) => ({
            ordinal: member.ordinal,
            inputMemberRef: member.inputMemberRef,
            outputMemberRef: member.outputMemberRef,
            receipt: member.value.receipt,
            successorObservation: member.value.successorObservation,
        })),
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
export function isWorksiteConstructionResult(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "members",
            "resultDigest",
            "resultRef",
            "schemaVersion",
            "sourceApplicationRef",
        ]) ||
        value.kind !== "worksite_construction_result" ||
        value.schemaVersion !== SCHEMA_VERSION ||
        !nonEmptyString(value.resultRef) ||
        !isSha256Digest(value.resultDigest) ||
        value.sourceApplicationRef !== WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef ||
        !Array.isArray(value.members) ||
        value.members.length === 0 ||
        !value.members.every((member, ordinal) => isRecord(member) &&
            hasExactKeys(member, [
                "inputMemberRef",
                "ordinal",
                "outputMemberRef",
                "receipt",
                "successorObservation",
            ]) &&
            member.ordinal === ordinal &&
            nonEmptyString(member.inputMemberRef) &&
            nonEmptyString(member.outputMemberRef) &&
            isWorksiteFileReplaceReceipt(member.receipt) &&
            isWorksiteObservation(member.successorObservation) &&
            member.successorObservation.state === "file" &&
            member.receipt.afterObservationRef ===
                member.successorObservation.observationRef &&
            member.receipt.afterObservationDigest ===
                member.successorObservation.observationDigest))
        return false;
    const members = value.members;
    if (new Set(members.map((member) => member.inputMemberRef)).size !==
        members.length ||
        new Set(members.map((member) => member.outputMemberRef)).size !==
            members.length)
        return false;
    const body = {
        sourceApplicationRef: value.sourceApplicationRef,
        members,
    };
    const digest = sha256Canonical(body);
    return value.resultDigest === digest &&
        value.resultRef ===
            identity("worksite-construction-result://abiogenesis", digest);
}
export function isWorksiteConstructionFailure(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "diagnosticRef",
            "failureClass",
            "kind",
            "schemaVersion",
        ]) &&
        value.kind === "worksite_construction_failure" &&
        value.schemaVersion === SCHEMA_VERSION &&
        nonEmptyString(value.failureClass) &&
        nonEmptyString(value.diagnosticRef);
}
export function isWorksiteConstructionVectorApplicationFailure(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "diagnosticRef",
            "failureClass",
            "kind",
            "schemaVersion",
        ]) &&
        value.kind === "worksite_construction_vector_application_failure" &&
        value.schemaVersion === SCHEMA_VERSION &&
        nonEmptyString(value.failureClass) &&
        nonEmptyString(value.diagnosticRef);
}
function exactCandidateRelation(input, output) {
    return isWorksiteConstructionTask(input) &&
        isWorksiteCandidateBundle(output) &&
        sameCanonical(output.task, input);
}
function exactJoinRelation(input, output) {
    if (!isWorksiteCandidateBundle(input) ||
        !isWorksiteFileReplaceVector(output))
        return false;
    try {
        return sameCanonical(constructWorksiteFileReplaceVector(input), output);
    }
    catch {
        return false;
    }
}
function exactReducerRelation(input, output) {
    if (!isWorksiteFileReplaceOutputVector(input) ||
        !isWorksiteConstructionResult(output))
        return false;
    try {
        return sameCanonical(reduceWorksiteFileReplaceResults(input), output);
    }
    catch {
        return false;
    }
}
function exactRootTaskRelation(input, output) {
    if (!isWorksiteConstructionTask(input) ||
        !isWorksiteConstructionResult(output) ||
        input.targets.length !== output.members.length)
        return false;
    return output.members.every((member, ordinal) => {
        const target = input.targets[ordinal];
        return target !== undefined &&
            member.inputMemberRef === target.targetRef &&
            member.successorObservation.workspaceBindingIdentity ===
                input.workspaceBinding.bindingId &&
            member.successorObservation.subjectRef === target.subject.subjectRef &&
            member.successorObservation.subjectDigest === target.subject.subjectDigest;
    });
}
function exactVectorResultRelation(input, output) {
    if (!isWorksiteFileReplaceVector(input) ||
        !isWorksiteConstructionResult(output) ||
        input.members.length !== output.members.length)
        return false;
    return output.members.every((member, ordinal) => {
        const inputMember = input.members[ordinal];
        return inputMember !== undefined &&
            member.inputMemberRef === inputMember.memberRef &&
            member.successorObservation.workspaceBindingIdentity ===
                inputMember.value.workspaceBindingIdentity &&
            member.successorObservation.subjectRef ===
                inputMember.value.subject.subjectRef &&
            member.successorObservation.subjectDigest ===
                inputMember.value.subject.subjectDigest;
    });
}
function exactC0ResultRelation(input, output) {
    if (!isWorksiteFileReplaceRequest(input) ||
        !isWorksiteFileReplaceOutput(output))
        return false;
    return output.authorization.predecessorObservationRef ===
        input.predecessorObservation.observationRef &&
        output.authorization.predecessorObservationDigest ===
            input.predecessorObservation.observationDigest &&
        output.authorization.capabilityGrantRef === input.capabilityGrant.grantRef &&
        output.authorization.capabilityGrantDigest ===
            input.capabilityGrant.grantDigest;
}
function exactRootRelation(input, output) {
    return exactRootTaskRelation(input, output) ||
        exactVectorResultRelation(input, output);
}
function exactVectorApplicationRelation(input, output) {
    return exactC0ResultRelation(input, output) ||
        exactReducerRelation(input, output) ||
        exactVectorResultRelation(input, output);
}
export function resolveWorksiteConstructionJudgmentRelation(predicateRef) {
    const evaluate = predicateRef ===
        WORKSITE_CONSTRUCTION_IDS.candidateJudgmentPredicateRef
        ? exactCandidateRelation
        : predicateRef === WORKSITE_CONSTRUCTION_IDS.joinJudgmentPredicateRef
            ? exactJoinRelation
            : predicateRef === WORKSITE_CONSTRUCTION_IDS.reducerJudgmentPredicateRef
                ? exactReducerRelation
                : predicateRef ===
                    WORKSITE_CONSTRUCTION_IDS.vectorApplicationJudgmentPredicateRef
                    ? exactVectorApplicationRelation
                    : predicateRef === WORKSITE_CONSTRUCTION_IDS.rootJudgmentPredicateRef
                        ? exactRootRelation
                        : null;
    if (evaluate === null)
        return null;
    return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/worksite/construction-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/worksite/construction-rejected@5",
        evaluate,
    });
}
