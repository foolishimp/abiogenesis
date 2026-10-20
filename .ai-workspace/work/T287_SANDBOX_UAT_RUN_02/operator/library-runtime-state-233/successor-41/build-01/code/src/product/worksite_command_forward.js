/** Forward carriers describe proof; only ABG authenticates their occurrence. */
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical, isSha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { validateDurablePrefixCoordinate } from "../abg/event_store.js";
import { isAbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import { isWorkspaceAuthorityBasis } from "./environment.js";
import { isCapabilityGrantValue } from "./invocation.js";
import { constructWorksiteSubject, isWorksiteObservation, isWorksiteSubject } from "./worksite_effect.js";
import { constructWorksiteCommandConfiguration, isWorksiteCommandExecutionTask } from "./worksite_command_execution.js";
import { isWorksiteExecutionTask as isPriorTask, worksiteExecutionSources as priorSources, worksiteExecutionLocus as priorLocus, worksiteExecutionIdentityPrefix as priorPrefix, worksiteExecutionImplementationRef as priorImplementation } from "./worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS } from "./worksite_command_forward_identity.js";
export { WORKSITE_COMMAND_FORWARD_IDS } from "./worksite_command_forward_identity.js";
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const hash = (a) => sha256Canonical(a);
const record = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v) => typeof v === "string" && v.length > 0 && v.trim() === v && !v.includes("\0");
const exact = (v, fields) => Object.keys(v).sort().join("\0") === [...fields].sort().join("\0");
export function constructWorksiteCommandForwardRequest(input) {
    const s = input.source;
    if (!record(s) || !exact(s, ["prefix", "invocationRef", "invocationAdmissionRef", "runId", "failedCCallRef", "failureEventRef",
        "runFailureEventRef", "constructionGraphCallRef", "preparationResultEventRef", "preparationJudgmentEventRef", "declarationProof"]) ||
        !validateDurablePrefixCoordinate(s.prefix) || !isAbgHistoricalDeclarationProof(s.declarationProof) ||
        Object.entries(s).some(([key, value]) => key !== "prefix" && key !== "declarationProof" && !text(value)) ||
        !isWorkspaceAuthorityBasis(input.workspaceAuthorityBasis) || !isCapabilityGrantValue(input.capabilityGrant) ||
        input.capabilityGrant.operationId !== "abg.operation.run.invoke" ||
        input.capabilityGrant.scopeRef !== input.workspaceBinding.bindingId ||
        input.capabilityGrant.scopeDigest !== input.workspaceBinding.bindingDigest ||
        !["invoke", "start"].includes(input.capabilityGrant.definitionKey.memberKey) ||
        input.capabilityGrant.actorRef !== input.workspaceBinding.authorizedActorRef ||
        !Array.isArray(input.protectedObservations) || input.protectedObservations.length === 0 ||
        input.protectedObservations.some(row => !record(row) || !exact(row, ["subject", "observation"]) ||
            !isWorksiteSubject(row.subject) || !isWorksiteObservation(row.observation) || row.observation.state !== "file" ||
            row.observation.subjectRef !== row.subject.subjectRef || row.observation.subjectDigest !== row.subject.subjectDigest ||
            !same(constructWorksiteSubject({ ...input, subjectUri: row.subject.subjectUri, relativePath: row.subject.relativePath }), row.subject)) ||
        new Set(input.protectedObservations.map(r => r.subject.subjectRef)).size !== input.protectedObservations.length)
        throw new TypeError("forward request requires exact historical coordinates and a complete current A/W assertion vector");
    const body = { source: input.source, workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant, protectedObservations: input.protectedObservations };
    const requestDigest = hash(body);
    return deepFreeze({ kind: "worksite_command_forward_request", schemaVersion: "5.0.0",
        requestRef: `worksite-command-forward-request://abiogenesis/${requestDigest.slice(7)}`, requestDigest, ...body });
}
export function isWorksiteCommandForwardRequest(value) {
    if (!record(value) || value.kind !== "worksite_command_forward_request" || value.schemaVersion !== "5.0.0" ||
        !exact(value, ["kind", "schemaVersion", "requestRef", "requestDigest", "source", "workspaceAuthorityBasis", "workspaceBinding", "capabilityGrant", "protectedObservations"]))
        return false;
    try {
        return same(value, constructWorksiteCommandForwardRequest(value));
    }
    catch {
        return false;
    }
}
export function constructWorksiteCommandForwardTask(input) {
    const { request, originalTask, snapshotSources, bindingCoverEventRefs } = input;
    if (!isWorksiteCommandForwardRequest(request) || !isWorksiteCommandExecutionTask(originalTask) ||
        !same(request.workspaceAuthorityBasis, originalTask.workspaceAuthorityBasis) ||
        !Array.isArray(bindingCoverEventRefs) || bindingCoverEventRefs.length === 0 || !bindingCoverEventRefs.every(text) ||
        new Set(bindingCoverEventRefs).size !== bindingCoverEventRefs.length ||
        !Array.isArray(snapshotSources) || snapshotSources.length !== originalTask.sourceConstructionResult.members.length ||
        snapshotSources.length !== request.protectedObservations.length || snapshotSources.some((row, i) => {
        const old = originalTask.protectedObservations[i], current = request.protectedObservations[i];
        return !record(row) || !exact(row, ["sourceMemberRef", "subject", "observation", "source"]) || old === undefined || current === undefined ||
            !isWorksiteSubject(row.subject) || !isWorksiteObservation(row.observation) || row.observation.state !== "file" ||
            row.sourceMemberRef !== old.sourceMemberRef || !same({ subject: row.subject, observation: row.observation }, current) ||
            row.subject.subjectUri !== old.subject.subjectUri || row.subject.relativePath !== old.subject.relativePath ||
            row.observation.fileIdentity !== old.observation.fileIdentity || row.observation.fileDigest !== old.observation.fileDigest ||
            row.observation.byteLength !== old.observation.byteLength || !record(row.source) ||
            !exact(row.source, ["kind", "resultAdmissionEventRef", "evidenceEventRef", "bindingCoverEventRefs"]) ||
            row.source.kind !== "retained_construction" || !text(row.source.resultAdmissionEventRef) || !text(row.source.evidenceEventRef) ||
            !same(row.source.bindingCoverEventRefs, bindingCoverEventRefs);
    }))
        throw new TypeError("forward task requires the complete unchanged construction vector and explicit native proof coordinates");
    const configuration = constructWorksiteCommandConfiguration({ ...request, commands: originalTask.commands,
        outcomePredicates: originalTask.outcomePredicates, allowedWriteTerritories: originalTask.allowedWriteTerritories,
        protectedSubjects: snapshotSources.map(r => r.subject) });
    if (!same(configuration.commands, originalTask.commands) || !same(configuration.predicates, originalTask.outcomePredicates) ||
        !same(configuration.allowedWriteTerritories, originalTask.allowedWriteTerritories))
        throw new TypeError("forward command meaning changed");
    const { kind: _kind, schemaVersion: _schema, taskRef: _ref, taskDigest: _digest, protectedObservations: _observations, ...old } = originalTask;
    const body = { ...old, workspaceAuthorityBasis: request.workspaceAuthorityBasis, workspaceBinding: request.workspaceBinding, capabilityGrant: request.capabilityGrant,
        materializationPlanRef: WORKSITE_COMMAND_FORWARD_IDS.materializationPlanRef, rendererRef: WORKSITE_COMMAND_FORWARD_IDS.rendererRef,
        instructionContractRef: WORKSITE_COMMAND_FORWARD_IDS.taskContractRef, resultContractRef: WORKSITE_COMMAND_FORWARD_IDS.workerResultContractRef,
        request, originalTask, snapshotSources, bindingCoverEventRefs };
    const taskDigest = hash(body);
    return deepFreeze({ kind: "worksite_command_forward_task", schemaVersion: "5.0.0", taskRef: `worksite-command-forward-task://abiogenesis/${taskDigest.slice(7)}`, taskDigest, ...body });
}
export function isWorksiteCommandForwardTask(value) {
    if (!record(value) || value.kind !== "worksite_command_forward_task" || value.schemaVersion !== "5.0.0")
        return false;
    try {
        return same(value, constructWorksiteCommandForwardTask(value));
    }
    catch {
        return false;
    }
}
export function isExecutableWorksiteCommandTask(value) {
    return isPriorTask(value) || isWorksiteCommandForwardTask(value);
}
export function executableWorksiteCommandSources(task) {
    return task.kind === "worksite_command_forward_task" ? task.snapshotSources : priorSources(task);
}
export function executableWorksiteCommandLocus(task) {
    return task.kind === "worksite_command_forward_task" ? WORKSITE_COMMAND_FORWARD_IDS.nodeRef : priorLocus(task);
}
export function executableWorksiteCommandIdentityPrefix(task, suffix) {
    return task.kind === "worksite_command_forward_task" ? `worksite-command-forward-${suffix}://abiogenesis` : priorPrefix(task, suffix);
}
export function executableWorksiteCommandImplementationRef(task) {
    return task.kind === "worksite_command_forward_task" ? WORKSITE_COMMAND_FORWARD_IDS.implementationRef : priorImplementation(task);
}
export function isWorksiteCommandForwardWorkerResult(value) {
    return record(value) && exact(value, ["attemptRef", "helperArtifactDigest", "helperArtifactRef", "kind", "schemaVersion", "taskDigest", "taskRef"]) &&
        value.kind === "worksite_command_execution_worker_result" && value.schemaVersion === "5.0.0" && text(value.taskRef) &&
        isSha256Digest(value.taskDigest) && text(value.attemptRef) && isSha256Digest(value.helperArtifactDigest) &&
        value.helperArtifactRef === `worksite-command-forward-helper-artifact://abiogenesis/${value.helperArtifactDigest.slice(7)}`;
}
