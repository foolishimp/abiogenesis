import { WORKSITE_PRESERVED_RESULT_IDS, constructWorksitePreservedResultSource, isWorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
export { WORKSITE_PRESERVED_RESULT_IDS, WORKSITE_PRESERVED_RESULT_IMPLEMENTATION_REFS, constructWorksitePreservedResultSource, isWorksitePreservedResultSource } from "../gtl/worksite_construction_recovery.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSITE_CONSTRUCTION_IDS, constructWorksiteCandidateBundle, constructWorksiteConstructionWorkerResult, isWorksiteConstructionTask } from "./worksite_construction.js";
const scope = "abiogenesis/worksite/preserved-result";
const hash = (value) => sha256Canonical(value);
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exact(value, fields) {
    if (!record(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
        return false;
    const keys = Reflect.ownKeys(value);
    return keys.length === fields.length && keys.every(k => typeof k === "string" && fields.includes(k) &&
        Object.getOwnPropertyDescriptor(value, k)?.enumerable === true && "value" in Object.getOwnPropertyDescriptor(value, k));
}
const ref = (x) => typeof x === "string" && x.length > 0 && x.trim() === x;
/** This relation changes coordinates only; native bridge admission supplies meaning and authority. */
export function preservedWorksiteTargetJoin(original, current) {
    if (!isWorksiteConstructionTask(original) || !isWorksiteConstructionTask(current) ||
        !same(original.workspaceAuthorityBasis, current.workspaceAuthorityBasis) || original.targets.length !== current.targets.length ||
        original.workspaceBinding.workspaceId !== current.workspaceBinding.workspaceId)
        throw new TypeError("preserved source crosses worksite");
    const physical = (target) => {
        const observation = target.predecessorObservation;
        return { uri: target.subject.subjectUri, path: target.subject.relativePath,
            territoryUri: target.territory.territoryUri, territoryRoot: target.territory.relativeRoot, operations: target.territory.operations,
            state: observation.state, ...(observation.state === "file" ? { fileIdentity: observation.fileIdentity,
                fileDigest: observation.fileDigest, byteLength: observation.byteLength } : {}) };
    };
    const used = new Set();
    const rows = original.targets.map(target => {
        const matches = current.targets.filter(other => same(physical(target), physical(other)));
        if (matches.length !== 1 || used.has(matches[0].targetRef))
            throw new TypeError("preserved targets require a physical bijection");
        used.add(matches[0].targetRef);
        return { originalTargetRef: target.targetRef, currentTargetRef: matches[0].targetRef };
    });
    return deepFreeze(rows);
}
const proofFields = ["sourceExecutionBasisRef", "sourceExecutionBasisDigest", "sourceRunId", "sourceAttempt", "requestDigest",
    "transportBindingRef", "transportBindingDigest", "processRef", "artifactEventRef", "originalResultRef", "originalResultDigest",
    "originalJudgmentRef", "originalJudgmentDigest", "assessedEnvelopeDigest", "artifactDigests", "artifactByteLengths",
    "stdoutChunkEventRefs", "proposal", "acknowledgment", "toolUseId", "sessionId"];
function validProof(value) {
    if (!exact(value, proofFields))
        return false;
    if (!["sourceExecutionBasisRef", "sourceRunId", "transportBindingRef", "processRef", "artifactEventRef", "originalResultRef",
        "originalJudgmentRef", "toolUseId", "sessionId"].every(k => ref(value[k])) ||
        !["sourceExecutionBasisDigest", "requestDigest", "transportBindingDigest", "originalResultDigest", "originalJudgmentDigest",
            "assessedEnvelopeDigest"].every(k => isSha256Digest(value[k])) || !Number.isSafeInteger(value.sourceAttempt) || Number(value.sourceAttempt) < 0 ||
        !exact(value.artifactDigests, ["output", "prompt", "stderr", "stdout", "transport"]) ||
        !Object.values(value.artifactDigests).every(isSha256Digest) ||
        !exact(value.artifactByteLengths, ["output", "prompt", "stderr", "stdout", "transport"]) ||
        !Object.values(value.artifactByteLengths).every(x => Number.isSafeInteger(x) && Number(x) >= 0) ||
        !Array.isArray(value.stdoutChunkEventRefs) || value.stdoutChunkEventRefs.length === 0 ||
        !value.stdoutChunkEventRefs.every(ref) || new Set(value.stdoutChunkEventRefs).size !== value.stdoutChunkEventRefs.length)
        return false;
    for (const row of [value.proposal, value.acknowledgment])
        if (!exact(row, ["line", "startByte", "endByte", "digest"]) ||
            ![row.line, row.startByte, row.endByte].every(Number.isSafeInteger) || Number(row.line) < 1 || Number(row.startByte) < 0 ||
            Number(row.endByte) <= Number(row.startByte) || !isSha256Digest(row.digest))
            return false;
    const p = value.proposal, a = value.acknowledgment;
    return p.endByte <= a.startByte && p.line < a.line && a.endByte <= Number(value.artifactByteLengths.stdout);
}
export function constructWorksitePreservedResultArtifact(body) {
    if (!exact(body, ["source", "proof", "originalTask", "currentTask", "workerResult", "owner"]) ||
        !isWorksitePreservedResultSource(body.source) || !validProof(body.proof) ||
        !exact(body.owner, ["graphFunctionRef", "executionBasisRef", "executionBasisDigest", "cCallRef"]) ||
        !ref(body.owner.graphFunctionRef) || !ref(body.owner.executionBasisRef) || !ref(body.owner.cCallRef) || !isSha256Digest(body.owner.executionBasisDigest)) {
        throw new TypeError("preserved artifact requires exact source, proof and current native-owner coordinates");
    }
    const workerResult = constructWorksiteConstructionWorkerResult(body.originalTask, body.workerResult);
    const targetJoin = preservedWorksiteTargetJoin(body.originalTask, body.currentTask);
    const content = { ...body, workerResult, targetJoin };
    const artifactDigest = hash(content);
    return deepFreeze({ kind: "worksite_preserved_result_artifact", schemaVersion: "5.0.0",
        artifactRef: `worksite-preserved-result://abiogenesis/${artifactDigest.slice(7)}`, artifactDigest, ...content });
}
export function isWorksitePreservedResultArtifact(value) {
    try {
        if (!exact(value, ["kind", "schemaVersion", "artifactRef", "artifactDigest", "source", "proof", "originalTask", "currentTask", "workerResult", "owner", "targetJoin"]) ||
            value.kind !== "worksite_preserved_result_artifact" || value.schemaVersion !== "5.0.0")
            return false;
        const { kind: _kind, schemaVersion: _version, artifactRef: _ref, artifactDigest: _digest, targetJoin: _join, ...body } = value;
        return same(constructWorksitePreservedResultArtifact(body), value);
    }
    catch {
        return false;
    }
}
export function derivePreservedWorksiteCandidateBundle(artifact) {
    if (!isWorksitePreservedResultArtifact(artifact))
        throw new TypeError("current bundle requires an exact preserved artifact");
    const files = artifact.currentTask.targets.map(target => {
        const joins = artifact.targetJoin.filter(row => row.currentTargetRef === target.targetRef);
        if (joins.length !== 1)
            throw new TypeError("current target mapping is not unique");
        const source = artifact.workerResult.files.filter(file => file.targetRef === joins[0].originalTargetRef);
        if (source.length !== 1)
            throw new TypeError("original proposal member is not unique");
        return { ...source[0], targetRef: target.targetRef };
    });
    return constructWorksiteCandidateBundle(artifact.currentTask, constructWorksiteConstructionWorkerResult(artifact.currentTask, {
        kind: "worksite_construction_worker_result", schemaVersion: "5.0.0", files
    }));
}
export function resolveWorksitePreservedResultJudgmentRelation(predicateRef) {
    const reasons = { predicateRef, advanceReasonRef: `reason://${scope}/valid@5`, rejectionReasonRef: `reason://${scope}/invalid@5` };
    if (predicateRef === WORKSITE_PRESERVED_RESULT_IDS.authenticatePredicateRef)
        return Object.freeze({
            ...reasons,
            inputContractRef: WORKSITE_CONSTRUCTION_IDS.taskContractRef, outputContractRef: WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef,
            evaluate: (input, output) => isWorksiteConstructionTask(input) && isWorksitePreservedResultArtifact(output) && same(input, output.currentTask)
        });
    if (predicateRef === WORKSITE_PRESERVED_RESULT_IDS.derivePredicateRef)
        return Object.freeze({
            ...reasons,
            inputContractRef: WORKSITE_PRESERVED_RESULT_IDS.artifactContractRef, outputContractRef: WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,
            evaluate: (input, output) => { try {
                return isWorksitePreservedResultArtifact(input) && same(derivePreservedWorksiteCandidateBundle(input), output);
            }
            catch {
                return false;
            } }
        });
    return null;
}
