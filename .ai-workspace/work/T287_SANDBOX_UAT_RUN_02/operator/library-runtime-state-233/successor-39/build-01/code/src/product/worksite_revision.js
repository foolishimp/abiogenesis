/** Closed D2-only source carriers. Origins are evidence coordinates, not grants. */
import { canonicalJson } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isWorksiteObservation, isWorksiteSubject, constructWorksiteSubject } from "./worksite_effect.js";
import { constructWorksiteCommandExecutionTask, constructWorksiteCommandConfiguration, isWorksiteCommandExecutionTask, isNativeWorksiteCommandExecutionTask, isObservedWorksiteCommandExecutionTask } from "./worksite_command_execution.js";
import { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
export { WORKSITE_REVISION_IDS } from "./worksite_revision_identity.js";
const record = (x) => typeof x === "object" && x !== null && !Array.isArray(x);
const text = (x) => typeof x === "string" && x.trim() === x && x.length > 0 && !x.includes("\0");
const keys = (x, names) => Object.keys(x).sort().join("\0") === [...names].sort().join("\0");
export function isWorksiteRevisionObservationOrigin(x) {
    return record(x) && (x.kind === "admitted_input"
        ? keys(x, ["kind", "basisAdmissionEventRef", "inputAdmissionRef", "inputDigest"]) && text(x.basisAdmissionEventRef) && text(x.inputAdmissionRef) && isSha256Digest(x.inputDigest)
        : x.kind === "admitted_replacement"
            ? keys(x, ["kind", "resultAdmissionEventRef", "evidenceEventRef"]) && text(x.resultAdmissionEventRef) && text(x.evidenceEventRef)
            : (x.kind === "admitted_binding_projection" || x.kind === "admitted_initial_job_bridge") && keys(x, ["kind", "resultAdmissionEventRef", "judgmentEventRef"]) && text(x.resultAdmissionEventRef) && text(x.judgmentEventRef));
}
export function isWorksiteRevisionDependencyObservation(x) {
    return record(x) && keys(x, ["designTargetRef", "subject", "observation", "origin"]) && text(x.designTargetRef) &&
        isWorksiteSubject(x.subject) && isWorksiteObservation(x.observation) && x.observation.state === "file" &&
        x.observation.subjectRef === x.subject.subjectRef && x.observation.subjectDigest === x.subject.subjectDigest &&
        isWorksiteRevisionObservationOrigin(x.origin);
}
export function isWorksiteRevisionSnapshotSource(x) {
    if (!record(x) || !keys(x, ["designTargetRef", "subject", "observation", "source"]) || !text(x.designTargetRef) ||
        !isWorksiteSubject(x.subject) || !isWorksiteObservation(x.observation) || x.observation.state !== "file" ||
        x.observation.subjectRef !== x.subject.subjectRef || x.observation.subjectDigest !== x.subject.subjectDigest || !record(x.source))
        return false;
    return x.source.kind === "construction_member" ? keys(x.source, ["kind", "sourceMemberRef"]) && text(x.source.sourceMemberRef)
        : x.source.kind === "retained_dependency" && keys(x.source, ["kind", "origin"]) && isWorksiteRevisionObservationOrigin(x.source.origin);
}
/** Authority-free view used by unchanged snapshot/command mechanics. */
export function worksiteExecutionSources(task) {
    return task.kind === "worksite_command_execution_task" ? task.protectedObservations : task.snapshotSources;
}
export function worksiteExecutionLocus(task) {
    return task.kind === "worksite_command_execution_task" ? "node://abiogenesis/worksite/command-execution/fp@5" : WORKSITE_REVISION_IDS.nodeRef;
}
export function constructWorksiteRevisionCommandExecutionTask(input) {
    if (!isSha256Digest(input.revisionBasisDigest) || input.revisionBasisRef !== `semantic-revision://abiogenesis/${input.revisionBasisDigest.slice(7)}` ||
        !Array.isArray(input.snapshotSources) || input.snapshotSources.length === 0 || !input.snapshotSources.every(isWorksiteRevisionSnapshotSource) ||
        new Set(input.snapshotSources.map(row => row.designTargetRef)).size !== input.snapshotSources.length ||
        new Set(input.snapshotSources.map(row => row.subject.subjectRef)).size !== input.snapshotSources.length) {
        throw new TypeError("revision C2 requires one exact revision and unique ordered snapshot sources");
    }
    const selected = input.snapshotSources.filter(row => row.source.kind === "construction_member");
    // This is the real, unmodified C1 result over S. The old constructor validates
    // its existing source-member/O1 bijection; dependencies never enter that C1.
    const base = constructWorksiteCommandExecutionTask({ ...input, outcomePredicates: [],
        protectedObservations: selected.map(row => ({ sourceMemberRef: row.source.sourceMemberRef,
            subject: row.subject, observation: row.observation })) });
    for (const row of input.snapshotSources) {
        if (row.observation.workspaceBindingIdentity !== input.workspaceBinding.bindingId ||
            canonicalJson(row.subject) !== canonicalJson(constructWorksiteSubject({
                workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
                subjectUri: row.subject.subjectUri, relativePath: row.subject.relativePath,
            })))
            throw new TypeError("revision C2 snapshot source crosses its exact A/W subject");
    }
    const configuration = constructWorksiteCommandConfiguration({ ...input,
        outcomePredicates: input.outcomePredicates ?? [], protectedSubjects: input.snapshotSources.map(row => row.subject) });
    const { kind: _kind, schemaVersion: _schema, taskRef: _ref, taskDigest: _digest, protectedObservations: _protected, ...common } = base;
    const body = { ...common, revisionBasisRef: input.revisionBasisRef, revisionBasisDigest: input.revisionBasisDigest,
        materializationPlanRef: WORKSITE_REVISION_IDS.materializationPlanRef, rendererRef: WORKSITE_REVISION_IDS.rendererRef,
        instructionContractRef: WORKSITE_REVISION_IDS.taskContractRef, resultContractRef: WORKSITE_REVISION_IDS.workerResultContractRef,
        commands: configuration.commands,
        outcomePredicates: configuration.predicates, allowedWriteTerritories: configuration.allowedWriteTerritories,
        snapshotSources: input.snapshotSources };
    const taskDigest = sha256Canonical(body);
    return deepFreeze({ kind: "worksite_revision_command_execution_task", schemaVersion: "5.0.0",
        taskRef: `worksite-revision-command-execution-task://abiogenesis/${taskDigest.slice(7)}`, taskDigest, ...body });
}
export function isWorksiteRevisionCommandExecutionTask(value) {
    if (!record(value) || value.kind !== "worksite_revision_command_execution_task" || value.schemaVersion !== "5.0.0" ||
        !keys(value, ["kind", "schemaVersion", "taskRef", "taskDigest", "workspaceAuthorityBasis", "workspaceBinding", "capabilityGrant",
            "sourceConstructionResultRef", "sourceConstructionResultDigest", "sourceConstructionResult", "materializationPlanRef", "rendererRef",
            "instructionContractRef", "resultContractRef", "workerActorRef", "workerBindingRef", "transportLane", "commands", "outcomePredicates",
            "allowedWriteTerritories", "revisionBasisRef", "revisionBasisDigest", "snapshotSources"]))
        return false;
    try {
        return canonicalJson(value) === canonicalJson(constructWorksiteRevisionCommandExecutionTask(value));
    }
    catch {
        return false;
    }
}
export function isWorksiteExecutionTask(value) {
    return isWorksiteCommandExecutionTask(value) || isNativeWorksiteCommandExecutionTask(value) || isObservedWorksiteCommandExecutionTask(value) || isWorksiteRevisionCommandExecutionTask(value);
}
export function worksiteExecutionIdentityPrefix(task, suffix) {
    return `worksite-${task.kind === "worksite_command_execution_task" ? "command" : "revision-command"}-${suffix}://abiogenesis`;
}
export function worksiteExecutionImplementationRef(task) {
    return task.kind === "worksite_command_execution_task" ? "implementation://abiogenesis/worksite/command-execution-fp@5" : WORKSITE_REVISION_IDS.implementationRef;
}
