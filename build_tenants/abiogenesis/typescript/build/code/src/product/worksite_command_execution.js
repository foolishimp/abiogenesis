import { isDeepStrictEqual } from "node:util";
import { validateDurablePrefixCoordinate } from "../abg/event_store.js";
import { isAbgHistoricalDeclarationProof } from "../abg/terminal_result_contracts.js";
import { isWorksiteContextObservation } from "./worksite_effect.js";
import { isRecord, hasNulJoinedFields as exactKeys } from "../shared/admission_predicates.js";
import { delimiter as pathDelimiter, dirname, isAbsolute, join, posix, relative, resolve, win32, } from "node:path";
import { canonicalJson, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Bytes, sha256Canonical, } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { isWorkspaceAuthorityBasis, } from "./environment.js";
import { isCapabilityGrantValue, } from "./invocation.js";
import { isWorksiteConstructionResult, } from "./worksite_construction.js";
import { isWorksiteObservation, isWorksiteSubject, constructWorksiteSubject, constructWorksiteObservation, } from "./worksite_effect.js";
import { WORKSITE_REVISION_IDS, isWorksiteRevisionCommandExecutionTask, isWorksiteRevisionObservationOrigin } from "./worksite_revision.js";
import { isExecutableWorksiteCommandTask as isWorksiteExecutionTask, executableWorksiteCommandSources as worksiteExecutionSources, executableWorksiteCommandIdentityPrefix as worksiteExecutionIdentityPrefix, executableWorksiteCommandImplementationRef as worksiteExecutionImplementationRef, isWorksiteCommandForwardWorkerResult } from "./worksite_command_forward.js";
import { isNativeWorkspaceWorkObservation } from "./native_workspace_work.js";
const SCHEMA_VERSION = "5.0.0";
const BASE64_PATTERN = "^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
export { WORKSITE_COMMAND_EXECUTION_IDS } from "./worksite_command_execution_identity.js";
// The displayed terms also drive the calculation used by the C2 guard.
const commandExecutionBudgetRule = deepFreeze({
    aggregation: "sum",
    commandFields: ["timeoutMs", "terminationGraceMs"],
    httpResponseFields: { launch: ["timeoutMs", "terminationGraceMs"], request: ["timeoutMs"] },
    ownerAllowanceMs: 5_000,
    limitComparison: "required_budget_strictly_less_than_each_limit",
    limitOrdering: "absolute_strictly_greater_than_inactivity",
});
export function projectWorksiteCommandExecutionBudget(task) {
    const commandBudgetMs = task.commands.reduce((sum, command) => commandExecutionBudgetRule.commandFields.reduce((subtotal, field) => subtotal + command[field], sum), 0);
    const httpProbeBudgetMs = task.outcomePredicates.reduce((sum, predicate) => {
        if (predicate.predicateKind !== "http_response_exact" ||
            typeof predicate.declaration !== "object" || predicate.declaration === null ||
            Array.isArray(predicate.declaration))
            return sum;
        const declaration = predicate.declaration;
        const launch = declaration.launch, request = declaration.request;
        if (typeof launch !== "object" || launch === null || Array.isArray(launch) ||
            typeof request !== "object" || request === null || Array.isArray(request))
            return sum;
        const parts = { launch: launch, request: request };
        return Object.keys(commandExecutionBudgetRule.httpResponseFields).reduce((subtotal, part) => commandExecutionBudgetRule.httpResponseFields[part].reduce((total, field) => total + Number(parts[part][field]), subtotal), sum);
    }, 0);
    return deepFreeze({ rule: commandExecutionBudgetRule, commandBudgetMs, httpProbeBudgetMs,
        requiredExecutionBudgetMs: commandBudgetMs + httpProbeBudgetMs + commandExecutionBudgetRule.ownerAllowanceMs });
}
export function worksiteCommandExecutionBudgetFits(requiredBudget, limits) {
    return Number.isSafeInteger(limits.inactivityTimeoutMs) && limits.inactivityTimeoutMs > requiredBudget &&
        Number.isSafeInteger(limits.absoluteTimeoutMs) && limits.absoluteTimeoutMs > requiredBudget &&
        limits.absoluteTimeoutMs > limits.inactivityTimeoutMs;
}
export function constructWorksiteReadDependencyBasis(input) {
    const coordinates = { jobRef: input.jobRef, jobDigest: input.jobDigest, designAssetRef: input.designAssetRef,
        designAssetDigest: input.designAssetDigest, contextObservationRef: input.contextObservationRef,
        contextObservationDigest: input.contextObservationDigest };
    if (![input.jobRef, input.designAssetRef, input.contextObservationRef].every(nonempty) ||
        ![input.jobDigest, input.designAssetDigest, input.contextObservationDigest].every(isSha256Digest) ||
        !Array.isArray(input.members) || input.members.length === 0 || input.members.some(row => !isWorksiteSubject(row.subject) || !isWorksiteObservation(row.observation) || row.observation.state !== "file" ||
        row.observation.subjectRef !== row.subject.subjectRef || row.observation.subjectDigest !== row.subject.subjectDigest) ||
        new Set(input.members.map(row => row.subject.relativePath)).size !== input.members.length) {
        throw new TypeError("read dependencies require exact job, assessed Design, context and unique observed files");
    }
    const members = input.members.map(row => ({ sourceMemberRef: identity("worksite-read-dependency://abiogenesis", sha256Canonical({ ...coordinates, subject: row.subject, observation: row.observation })),
        subject: row.subject, observation: row.observation }));
    return deepFreeze({ kind: "semantic_job_read_dependencies", schemaVersion: "5.0.0", ...coordinates, members });
}
export function isWorksiteReadDependencyBasis(value) {
    if (!isRecord(value) || !exactKeys(value, ["kind", "schemaVersion", "jobRef", "jobDigest", "designAssetRef", "designAssetDigest",
        "contextObservationRef", "contextObservationDigest", "members"]) || value.kind !== "semantic_job_read_dependencies" ||
        value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.members) || value.members.some(row => !isRecord(row) || !exactKeys(row, ["sourceMemberRef", "subject", "observation"])))
        return false;
    try {
        return same(value, constructWorksiteReadDependencyBasis(value));
    }
    catch {
        return false;
    }
}
export const NATIVE_WORK_REACQUISITION_IDS = Object.freeze({
    graphFunctionRef: "graph-function://abiogenesis/worksite/native-command-reacquisition@5",
    programRef: "program://abiogenesis/worksite/native-command-reacquisition@5",
    nodeRef: "node://abiogenesis/worksite/native-command-reacquisition@5",
    requestContractRef: "contract://abiogenesis/worksite/native-command-reacquisition-request@5",
    implementationRef: "implementation://abiogenesis/worksite/native-command-reacquisition-fd@5",
    implementationBindingRef: "implementation-binding://abiogenesis/worksite/native-command-reacquisition-fd@5",
    predicateRef: "predicate://abiogenesis/worksite/native-command-reacquisition@5",
    closureContractRef: "closure://abiogenesis/worksite/native-command-reacquisition@5",
    childClosureContractRef: "closure://abiogenesis/worksite/native-command-reacquisition-child@5",
});
function nativeReacquisitionBody(input) {
    const { source, currentContext, sourceNativeWork: original } = input;
    if (!source || !validateDurablePrefixCoordinate(source.prefix) || typeof source.graphCallRef !== "string" || source.graphCallRef.length === 0 ||
        !isAbgHistoricalDeclarationProof(source.declarationProof) || !isNativeWorkspaceWorkObservation(original) || original.task.assessment !== undefined ||
        !exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) || !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) ||
        !same(original.task.workspaceAuthorityBasis, input.workspaceAuthorityBasis) || !isWorksiteContextObservation(currentContext) ||
        currentContext.workspaceBindingIdentity !== input.workspaceBinding.bindingId || currentContext.workspaceBindingDigest !== input.workspaceBinding.bindingDigest ||
        currentContext.workspaceAuthorityBasisRef !== input.workspaceAuthorityBasis.authorityBasisId ||
        currentContext.workspaceAuthorityBasisDigest !== input.workspaceAuthorityBasis.authorityBasisDigest ||
        !same(currentContext.entries, original.after.entries) || !same(currentContext.readRoots, original.after.readRoots) ||
        currentContext.maxFiles !== original.after.maxFiles || currentContext.maxBytes !== original.after.maxBytes ||
        !Array.isArray(input.selectedSources) || input.selectedSources.length === 0 ||
        new Set(input.selectedSources.map(row => row.relativePath)).size !== input.selectedSources.length ||
        input.selectedSources.some(row => typeof row.subjectUri !== "string" || row.subjectUri.length === 0 || !original.after.entries.some(e => e.relativePath === row.relativePath && e.state === "file")))
        throw new TypeError("native reacquisition requires exact retained context, source selector and current authority");
    const configuration = constructWorksiteCommandConfiguration({ ...input, outcomePredicates: input.outcomePredicates ?? [],
        protectedSubjects: input.selectedSources.map(row => {
            const subject = constructWorksiteSubject({ ...input, ...row });
            if (!isWorksiteSubject(subject))
                throw new TypeError("native reacquisition source subject is refused");
            return subject;
        }) });
    const body = { workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding, capabilityGrant: input.capabilityGrant,
        sourceNativeWork: original, selectedSources: input.selectedSources, commands: configuration.commands, outcomePredicates: configuration.predicates,
        allowedWriteTerritories: configuration.allowedWriteTerritories, source, currentContext };
    return body;
}
export function constructNativeWorksiteCommandReacquisitionRequest(input) {
    const body = nativeReacquisitionBody(input), requestDigest = sha256Canonical(body);
    return deepFreeze({ kind: "native_worksite_command_reacquisition_request", schemaVersion: SCHEMA_VERSION,
        requestRef: identity("native-work-command-reacquisition://abiogenesis", requestDigest), requestDigest, ...body });
}
export function isNativeWorksiteCommandReacquisitionRequest(value) {
    if (!isRecord(value) || value.kind !== "native_worksite_command_reacquisition_request" || value.schemaVersion !== SCHEMA_VERSION)
        return false;
    try {
        const { kind, schemaVersion, requestRef, requestDigest, ...body } = value;
        const expected = nativeReacquisitionBody(value);
        return same(body, expected) && requestDigest === sha256Canonical(expected) &&
            requestRef === identity("native-work-command-reacquisition://abiogenesis", requestDigest);
    }
    catch {
        return false;
    }
}
function reacquisitionTaskMatches(input) {
    const proof = input.sourceReacquisition;
    return proof !== undefined && isNativeWorksiteCommandReacquisitionRequest(proof.request) &&
        exactKeys(proof, ["request", "nativeBasis", "bindingCoverEventRefs"]) &&
        exactKeys(proof.nativeBasis, ["predecessorPrefix", "cCallRef"]) && validateDurablePrefixCoordinate(proof.nativeBasis.predecessorPrefix) &&
        typeof proof.nativeBasis.cCallRef === "string" && proof.nativeBasis.cCallRef.length > 0 &&
        Array.isArray(proof.bindingCoverEventRefs) && proof.bindingCoverEventRefs.every(ref => typeof ref === "string" && ref.length > 0) &&
        new Set(proof.bindingCoverEventRefs).size === proof.bindingCoverEventRefs.length &&
        same(proof.request.workspaceAuthorityBasis, input.workspaceAuthorityBasis) && same(proof.request.workspaceBinding, input.workspaceBinding) &&
        same(proof.request.capabilityGrant, input.capabilityGrant) && same(proof.request.sourceNativeWork, input.sourceNativeWork) &&
        same(proof.request.selectedSources, input.selectedSources) && same(proof.request.commands, input.commands) &&
        same(proof.request.outcomePredicates, input.outcomePredicates ?? []) && same(proof.request.allowedWriteTerritories, input.allowedWriteTerritories);
}
function nativeCommandTaskBody(input) {
    const source = input.sourceNativeWork;
    if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) ||
        !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) || !isNativeWorkspaceWorkObservation(source) ||
        source.task.assessment !== undefined || !same(source.task.workspaceAuthorityBasis, input.workspaceAuthorityBasis) ||
        (input.sourceReacquisition === undefined ? !same(source.task.workspaceBinding, input.workspaceBinding) : !reacquisitionTaskMatches(input)) || !Array.isArray(input.selectedSources) ||
        input.selectedSources.length === 0 || new Set(input.selectedSources.map(row => row.relativePath)).size !== input.selectedSources.length) {
        throw new TypeError("native C2 requires exact A/W/grant, native work result and a complete unique source selection");
    }
    const protectedObservations = input.selectedSources.map((row, ordinal) => {
        const subject = constructWorksiteSubject({ ...input, ...row });
        const entry = source.after.entries.find(entry => entry.relativePath === row.relativePath);
        if (!isWorksiteSubject(subject) || entry?.state !== "file")
            throw new TypeError("native C2 source must be an exactly observed file");
        const observation = constructWorksiteObservation({ subject, state: "file", fileIdentity: entry.fileIdentity,
            fileDigest: entry.digest, byteLength: entry.byteLength });
        if (!isWorksiteObservation(observation) || observation.state !== "file")
            throw new TypeError("invalid native source observation");
        const sourceMemberRef = identity("native-work-execution-source://abiogenesis", sha256Canonical({ sourceObservationRef: source.observationRef, subject, observation }));
        return { kind: "worksite_protected_observation", schemaVersion: SCHEMA_VERSION, ordinal, sourceMemberRef, subject, observation };
    });
    const configuration = constructWorksiteCommandConfiguration({ ...input,
        outcomePredicates: input.outcomePredicates ?? [], protectedSubjects: protectedObservations.map(row => row.subject) });
    const body = { workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant, sourceNativeWork: source,
        ...(input.sourceReacquisition === undefined ? {} : { sourceReacquisition: input.sourceReacquisition }),
        materializationPlanRef: WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef, rendererRef: WORKSITE_COMMAND_EXECUTION_IDS.rendererRef,
        instructionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef, resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
        workerActorRef: WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef, workerBindingRef: WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef,
        transportLane: WORKSITE_COMMAND_EXECUTION_IDS.transportLane, commands: configuration.commands,
        outcomePredicates: configuration.predicates, protectedObservations, allowedWriteTerritories: configuration.allowedWriteTerritories };
    return body;
}
export function constructNativeWorksiteCommandExecutionTask(input) {
    const body = nativeCommandTaskBody(input), taskDigest = sha256Canonical(body);
    return deepFreeze({ kind: "worksite_command_execution_task", schemaVersion: SCHEMA_VERSION,
        taskRef: identity("worksite-command-execution-task://abiogenesis", taskDigest), taskDigest, ...body });
}
export function isNativeWorksiteCommandExecutionTask(value) {
    if (!isRecord(value) || value.kind !== "worksite_command_execution_task" || value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.protectedObservations))
        return false;
    try {
        const input = value;
        const expected = nativeCommandTaskBody({ ...input,
            selectedSources: input.protectedObservations.map(row => ({ subjectUri: row.subject.subjectUri, relativePath: row.subject.relativePath })) });
        const { kind, schemaVersion, taskRef, taskDigest, ...body } = value;
        return same(body, expected) && taskDigest === sha256Canonical(expected) &&
            taskRef === identity("worksite-command-execution-task://abiogenesis", taskDigest);
    }
    catch {
        return false;
    }
}
/** Pure construction only. ABG binds these file claims to the current admitted
 * root input; the existing physical owner re-observes them before effects. */
export function constructObservedWorksiteCommandExecutionTask(input) {
    if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) ||
        !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) || !Array.isArray(input.observedFiles) || input.observedFiles.length === 0 ||
        new Set(input.observedFiles.map(row => row.subject?.relativePath)).size !== input.observedFiles.length) {
        throw new TypeError("observed C2 requires exact A/W/grant and a nonempty unique file selection");
    }
    const protectedObservations = input.observedFiles.map(({ subject, observation }, ordinal) => {
        if (!isWorksiteSubject(subject) || !isWorksiteObservation(observation) || observation.state !== "file" ||
            !same(subject, constructWorksiteSubject({ ...input, subjectUri: subject.subjectUri, relativePath: subject.relativePath })) ||
            observation.subjectRef !== subject.subjectRef || observation.subjectDigest !== subject.subjectDigest ||
            observation.workspaceBindingIdentity !== subject.workspaceBindingIdentity) {
            throw new TypeError("observed C2 source requires an exact current-binding file observation");
        }
        return { kind: "worksite_protected_observation", schemaVersion: SCHEMA_VERSION, ordinal,
            sourceMemberRef: identity("observed-worksite-execution-source://abiogenesis", sha256Canonical({ subject, observation })), subject, observation };
    });
    const sourceSetDigest = sha256Canonical(protectedObservations);
    const configuration = constructWorksiteCommandConfiguration({ ...input, outcomePredicates: input.outcomePredicates ?? [],
        protectedSubjects: protectedObservations.map(row => row.subject) });
    const body = { workspaceAuthorityBasis: input.workspaceAuthorityBasis, workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant, sourceObservedInput: { kind: "observed_worksite_input",
            sourceSetRef: identity("observed-worksite-execution-source-set://abiogenesis", sourceSetDigest), sourceSetDigest },
        materializationPlanRef: WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef, rendererRef: WORKSITE_COMMAND_EXECUTION_IDS.rendererRef,
        instructionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef, resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
        workerActorRef: WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef, workerBindingRef: WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef,
        transportLane: WORKSITE_COMMAND_EXECUTION_IDS.transportLane, commands: configuration.commands,
        outcomePredicates: configuration.predicates, protectedObservations, allowedWriteTerritories: configuration.allowedWriteTerritories };
    const taskDigest = sha256Canonical(body);
    return deepFreeze({ kind: "worksite_command_execution_task", schemaVersion: SCHEMA_VERSION,
        taskRef: identity("worksite-command-execution-task://abiogenesis", taskDigest), taskDigest, ...body });
}
export function isObservedWorksiteCommandExecutionTask(value) {
    if (!isRecord(value) || value.kind !== "worksite_command_execution_task" || !Array.isArray(value.protectedObservations))
        return false;
    try {
        const input = value;
        return same(value, constructObservedWorksiteCommandExecutionTask({ ...input, observedFiles: input.protectedObservations }));
    }
    catch {
        return false;
    }
}
export function isC2WorksiteCommandExecutionTask(value) {
    return isWorksiteCommandExecutionTask(value) || isNativeWorksiteCommandExecutionTask(value) || isObservedWorksiteCommandExecutionTask(value);
}
function nonempty(value) {
    return typeof value === "string" && value.trim().length > 0 &&
        value.trim() === value && !value.includes("\0");
}
function same(left, right) {
    if (left === right || isDeepStrictEqual(left, right))
        return true;
    return canonicalJson(left) === canonicalJson(right);
}
function identity(prefix, digest) {
    return `${prefix}/${digest.slice("sha256:".length)}`;
}
function shellQuote(value) {
    return `'${value.replaceAll("'", `'"'"'`)}'`;
}
export function worksiteCommandExecutionHelperPlan(task, attemptRef) {
    return helperPlanForExecutable(task, attemptRef, process.execPath);
}
function helperPlanForExecutable(task, attemptRef, executable) {
    if (!isWorksiteExecutionTask(task) || !nonempty(attemptRef) ||
        !nonempty(executable) || !isAbsolute(executable)) {
        throw new TypeError("command helper plan requires one exact task, attempt identity, and absolute executable");
    }
    const helperModulePath = join(task.workspaceBinding.roots.toolchainRoot, "node_modules", "@abiogenesis", "typescript-tenant", "build", "code", "src", "implementation", "worksite_command_helper.js");
    const attemptDigest = sha256Canonical({ attemptRef });
    const attemptRoot = join(task.workspaceBinding.roots.archiveRoot, "worksite-command-execution", task.taskDigest.slice("sha256:".length), attemptDigest.slice("sha256:".length));
    const taskManifestPath = join(attemptRoot, "task.json");
    const launchManifestPath = join(dirname(taskManifestPath), "launch.json");
    const artifactPath = join(attemptRoot, "result.json");
    const sandboxRoot = join(attemptRoot, "sandbox");
    const taskBytes = Buffer.from(`${canonicalJson(task)}\n`, "utf8");
    const toolCommand = [
        shellQuote(executable), shellQuote(helperModulePath),
        "--task", shellQuote(launchManifestPath),
    ].join(" ");
    const toolInputBytes = Buffer.from(canonicalJson({ command: toolCommand }), "utf8");
    return deepFreeze({
        kind: "worksite_command_execution_helper_plan",
        schemaVersion: SCHEMA_VERSION,
        attemptRef,
        helperModulePath,
        taskManifestPath,
        taskManifestDigest: sha256Bytes(taskBytes),
        taskManifestByteLength: taskBytes.byteLength,
        artifactPath,
        sandboxRoot,
        toolCommand,
        toolInputDigest: sha256Bytes(toolInputBytes),
        toolInputByteLength: toolInputBytes.byteLength,
    });
}
export function isWorksiteCommandExecutionHelperPlan(task, value) {
    if (!isRecord(value) || !exactKeys(value, [
        "artifactPath", "attemptRef", "helperModulePath", "kind", "sandboxRoot", "schemaVersion",
        "taskManifestByteLength", "taskManifestDigest", "taskManifestPath", "toolCommand",
        "toolInputByteLength", "toolInputDigest",
    ]) || value.kind !== "worksite_command_execution_helper_plan" ||
        value.schemaVersion !== SCHEMA_VERSION || !nonempty(value.attemptRef) ||
        typeof value.toolCommand !== "string")
        return false;
    try {
        // Only the executable is read from retained command bytes. Every remaining
        // command word and all plan coordinates are rederived from task/attempt.
        const executableWord = /^'((?:[^']|'"'"')*)' /u.exec(value.toolCommand)?.[1];
        if (executableWord === undefined)
            return false;
        const executable = executableWord.replaceAll(`'"'"'`, "'");
        return same(value, helperPlanForExecutable(task, value.attemptRef, executable));
    }
    catch {
        return false;
    }
}
function isExactWorkspaceBinding(value) {
    if (!isRecord(value) || !exactKeys(value, [
        "admissionEventRef", "authorityBasisDigest", "authorityBasisId",
        "authorizedActorRef", "bindingDigest", "bindingId", "kind", "lockDigest",
        "lockId", "productSetDigest", "productSetId", "roots", "schemaVersion",
        "workspaceId",
    ]) || value.kind !== "workspace_binding" || value.schemaVersion !== SCHEMA_VERSION ||
        !nonempty(value.bindingId) || !isSha256Digest(value.bindingDigest) ||
        !nonempty(value.workspaceId) || !nonempty(value.authorityBasisId) ||
        !isSha256Digest(value.authorityBasisDigest) || !nonempty(value.authorizedActorRef) ||
        !nonempty(value.productSetId) || !isSha256Digest(value.productSetDigest) ||
        !nonempty(value.lockId) || !isSha256Digest(value.lockDigest) ||
        !nonempty(value.admissionEventRef) || !isRecord(value.roots) ||
        !exactKeys(value.roots, [
            "archiveRoot", "eventLogRoot", "productRoot", "projectionRoot",
            "runtimeStateRoot", "toolchainRoot",
        ]) || Object.values(value.roots).some((root) => !nonempty(root) || !isAbsolute(root)))
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
function isExactDirectGrant(value, workspace) {
    return isCapabilityGrantValue(value) &&
        value.operationId === "abg.operation.run.invoke" &&
        value.definitionKey.operationId === "abg.operation.run.invoke" &&
        (value.definitionKey.memberKey === "invoke" || value.definitionKey.memberKey === "start") &&
        value.actorRef === workspace.authorizedActorRef &&
        value.scopeRef === workspace.bindingId &&
        value.scopeDigest === workspace.bindingDigest;
}
function safeRelativePath(value) {
    if (typeof value !== "string" || value.length === 0 ||
        value.trim() !== value || value.includes("\0") ||
        posix.isAbsolute(value) || win32.isAbsolute(value) || value.includes("\\") ||
        value.split("/").some((part) => part === ".."))
        return false;
    const normalized = posix.normalize(value);
    return normalized !== ".." && normalized === value;
}
function environmentEntries(value) {
    const raw = value ?? {};
    const alreadyBound = Array.isArray(raw);
    const declared = alreadyBound
        ? raw.map((entry) => ({ name: entry.name, value: entry.value }))
        : Object.entries(raw)
            .map(([name, entryValue]) => ({ name, value: entryValue }));
    if (!alreadyBound) {
        for (const name of ["HOME", "TMPDIR", "LANG", "LC_ALL"]) {
            const ambient = process.env[name];
            if (ambient !== undefined && !declared.some((row) => row.name === name)) {
                declared.push({ name, value: ambient });
            }
        }
    }
    const prefixRows = declared.filter((row) => row.name === "PATH_PREFIX");
    if (prefixRows.length > 1) {
        throw new TypeError("worksite command environment permits at most one PATH_PREFIX");
    }
    const rows = declared.filter((row) => row.name !== "PATH_PREFIX");
    const suppliedPath = rows.find((row) => row.name === "PATH");
    const safeAmbientPath = process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";
    const normalizedPath = prefixRows[0] === undefined
        ? (suppliedPath?.value ?? safeAmbientPath)
        : `${prefixRows[0].value}${pathDelimiter}${suppliedPath?.value ?? safeAmbientPath}`;
    if (normalizedPath.split(pathDelimiter).some((segment) => segment.length === 0 || !isAbsolute(segment))) {
        throw new TypeError("worksite command PATH requires only non-empty absolute entries");
    }
    if (suppliedPath === undefined)
        rows.push({ name: "PATH", value: normalizedPath });
    else
        suppliedPath.value = normalizedPath;
    rows.sort((left, right) => left.name.localeCompare(right.name));
    if (rows.some((row) => !/^[A-Za-z_][A-Za-z0-9_]*$/u.test(row.name) ||
        typeof row.value !== "string" || row.value.includes("\0")) || new Set(rows.map((row) => row.name)).size !== rows.length) {
        throw new TypeError("worksite command environment requires unique POSIX names and string values");
    }
    return deepFreeze(rows.map((row) => ({
        kind: "worksite_command_environment_entry",
        schemaVersion: SCHEMA_VERSION,
        ...row,
    })));
}
function constructExpectedReport(input, ordinal) {
    if (!nonempty(input.reportIdentity) || !safeRelativePath(input.relativePath)) {
        throw new TypeError("expected report requires one identity and safe relative path");
    }
    return deepFreeze({
        kind: "worksite_expected_report",
        schemaVersion: SCHEMA_VERSION,
        ordinal,
        reportIdentity: input.reportIdentity,
        relativePath: input.relativePath,
    });
}
function isExpectedReport(value, ordinal) {
    return isRecord(value) && exactKeys(value, [
        "kind", "ordinal", "relativePath", "reportIdentity", "schemaVersion",
    ]) && value.kind === "worksite_expected_report" && value.schemaVersion === SCHEMA_VERSION &&
        value.ordinal === ordinal && nonempty(value.reportIdentity) && safeRelativePath(value.relativePath);
}
function constructCommand(input, ordinal) {
    if (!nonempty(input.commandId) || !nonempty(input.executable) ||
        !Array.isArray(input.args) || input.args.some((arg) => typeof arg !== "string" || arg.includes("\0")) || !safeRelativePath(input.relativeCwd) || !Number.isSafeInteger(input.timeoutMs) ||
        input.timeoutMs <= 0 || input.timeoutMs > 3_600_000 ||
        !Number.isSafeInteger(input.terminationGraceMs) || input.terminationGraceMs <= 0 ||
        input.terminationGraceMs > 30_000 || input.terminationGraceMs >= input.timeoutMs ||
        !Array.isArray(input.expectedReports)) {
        throw new TypeError("worksite command requires exact executable, args, cwd, timeout, and reports");
    }
    const expectedReports = input.expectedReports.map(constructExpectedReport);
    if (new Set(expectedReports.map((row) => row.reportIdentity)).size !== expectedReports.length ||
        new Set(expectedReports.map((row) => row.relativePath)).size !== expectedReports.length) {
        throw new TypeError("worksite command report identities and paths must be unique");
    }
    return deepFreeze({
        kind: "worksite_declared_command",
        schemaVersion: SCHEMA_VERSION,
        ordinal,
        commandId: input.commandId,
        executable: input.executable,
        args: [...input.args],
        relativeCwd: input.relativeCwd,
        environment: environmentEntries(input.environment),
        timeoutMs: input.timeoutMs,
        terminationGraceMs: input.terminationGraceMs,
        expectedReports,
    });
}
function isCommand(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "args", "commandId", "environment", "executable", "expectedReports",
        "kind", "ordinal", "relativeCwd", "schemaVersion", "terminationGraceMs", "timeoutMs",
    ]) || value.kind !== "worksite_declared_command" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal || !Array.isArray(value.expectedReports) ||
        !value.expectedReports.every(isExpectedReport))
        return false;
    try {
        return same(value, constructCommand({
            commandId: value.commandId,
            executable: value.executable,
            args: value.args,
            relativeCwd: value.relativeCwd,
            environment: value.environment,
            timeoutMs: value.timeoutMs,
            terminationGraceMs: value.terminationGraceMs,
            expectedReports: value.expectedReports,
        }, ordinal));
    }
    catch {
        return false;
    }
}
function constructPredicate(input, ordinal) {
    let declaration = admitIJsonValue(input.declaration, "outcome predicate declaration");
    if (input.predicateKind === "http_response_exact" && isRecord(declaration) &&
        isRecord(declaration.launch)) {
        declaration = admitIJsonValue({
            ...declaration,
            launch: {
                ...declaration.launch,
                environment: environmentEntries(declaration.launch.environment),
            },
        }, "HTTP predicate declaration");
    }
    if (!nonempty(input.predicateId) || !nonempty(input.predicateKind) ||
        !validPredicateDeclaration(input.predicateKind, declaration)) {
        throw new TypeError("worksite outcome predicate requires exact id and kind");
    }
    return deepFreeze({
        kind: "worksite_outcome_predicate",
        schemaVersion: SCHEMA_VERSION,
        ordinal,
        predicateId: input.predicateId,
        predicateKind: input.predicateKind,
        declaration,
    });
}
function validPredicateDeclaration(kind, value) {
    if (!isRecord(value))
        return false;
    const keys = (expected) => exactKeys(value, expected);
    if (kind === "process_exit") {
        return keys(["equals", "validationCommandId"]) && nonempty(value.validationCommandId) &&
            Number.isSafeInteger(value.equals);
    }
    if (kind === "stdout_exact") {
        return keys(["equals", "validationCommandId"]) && nonempty(value.validationCommandId) &&
            typeof value.equals === "string";
    }
    if (kind === "test_pass_count") {
        return keys(["greaterThanOrEqual", "validationCommandId"]) && nonempty(value.validationCommandId) &&
            Number.isSafeInteger(value.greaterThanOrEqual) && Number(value.greaterThanOrEqual) >= 0;
    }
    if (kind === "module_export_return_exact") {
        return keys(["equals", "export", "path"]) && safeRelativePath(value.path) && nonempty(value.export);
    }
    if (kind === "http_response_exact") {
        if (!keys(["body", "launch", "request", "status", "validationCommandId"]) ||
            !nonempty(value.validationCommandId) || !Number.isSafeInteger(value.status) ||
            typeof value.body !== "string" || !isRecord(value.launch) || !isRecord(value.request) ||
            !exactKeys(value.launch, [
                "args", "environment", "executable", "portFile", "relativeCwd", "terminationGraceMs", "timeoutMs",
            ]) || !nonempty(value.launch.executable) || !Array.isArray(value.launch.args) ||
            !value.launch.args.every((row) => typeof row === "string" && !row.includes("\0")) ||
            value.launch.args.filter((row) => row === WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder).length !== 1 || !isRecord(value.launch.portFile) ||
            !exactKeys(value.launch.portFile, ["relativePath"]) ||
            !safeRelativePath(value.launch.portFile.relativePath) ||
            !safeRelativePath(value.launch.relativeCwd) || !Array.isArray(value.launch.environment) ||
            !value.launch.environment.every((entry, index) => isRecord(entry) && exactKeys(entry, [
                "kind", "name", "schemaVersion", "value",
            ]) && entry.kind === "worksite_command_environment_entry" && entry.schemaVersion === SCHEMA_VERSION &&
                typeof entry.name === "string" && typeof entry.value === "string" && index >= 0) ||
            !value.launch.environment.some((entry) => isRecord(entry) && entry.name === "PATH") ||
            !Number.isSafeInteger(value.launch.timeoutMs) || Number(value.launch.timeoutMs) <= 0 ||
            !Number.isSafeInteger(value.launch.terminationGraceMs) ||
            Number(value.launch.terminationGraceMs) <= 0 ||
            Number(value.launch.terminationGraceMs) >= Number(value.launch.timeoutMs) ||
            !exactKeys(value.request, ["hostname", "method", "path", "timeoutMs"]) ||
            (value.request.hostname !== "127.0.0.1" && value.request.hostname !== "::1") ||
            !nonempty(value.request.method) || !nonempty(value.request.path) ||
            !Number.isSafeInteger(value.request.timeoutMs) ||
            Number(value.request.timeoutMs) <= 0)
            return false;
        return new Set(value.launch.environment.map((entry) => entry.name)).size === value.launch.environment.length;
    }
    if (kind === "module_set_exact") {
        return keys(["equals", "selector"]) && Array.isArray(value.equals) && value.equals.every(nonempty) &&
            isRecord(value.selector) && exactKeys(value.selector, ["prefix", "segmentIndex", "source", "suffix"]) &&
            value.selector.source === "protected_paths" && typeof value.selector.prefix === "string" &&
            typeof value.selector.suffix === "string" && Number.isSafeInteger(value.selector.segmentIndex) &&
            Number(value.selector.segmentIndex) >= 0;
    }
    if (kind === "file_count") {
        return keys(["equals", "selector"]) && Number.isSafeInteger(value.equals) && Number(value.equals) >= 0 &&
            isRecord(value.selector) && exactKeys(value.selector, ["includeSubstrings", "includeSuffixes", "source"]) &&
            value.selector.source === "protected_paths" && Array.isArray(value.selector.includeSubstrings) &&
            value.selector.includeSubstrings.every((row) => typeof row === "string" && row.length > 0) &&
            Array.isArray(value.selector.includeSuffixes) &&
            value.selector.includeSuffixes.every((row) => typeof row === "string" && row.length > 0) &&
            value.selector.includeSubstrings.length + value.selector.includeSuffixes.length > 0;
    }
    if (kind === "test_report_set_exact") {
        return keys(["base", "equals", "selector"]) && safeRelativePath(value.base) &&
            Array.isArray(value.equals) && value.equals.every(safeRelativePath) &&
            isRecord(value.selector) && exactKeys(value.selector, ["includeSubstrings", "includeSuffixes"]) &&
            Array.isArray(value.selector.includeSubstrings) &&
            value.selector.includeSubstrings.every((row) => typeof row === "string" && row.length > 0) &&
            Array.isArray(value.selector.includeSuffixes) &&
            value.selector.includeSuffixes.every((row) => typeof row === "string" && row.length > 0) &&
            value.selector.includeSubstrings.length + value.selector.includeSuffixes.length > 0;
    }
    if (kind === "test_report_failure_count" || kind === "test_report_error_count") {
        return keys(["equals"]) && Number.isSafeInteger(value.equals) && Number(value.equals) >= 0;
    }
    return false;
}
function isPredicate(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "declaration", "kind", "ordinal", "predicateId", "predicateKind", "schemaVersion",
    ]) || value.kind !== "worksite_outcome_predicate" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal)
        return false;
    try {
        return same(value, constructPredicate({
            predicateId: value.predicateId,
            predicateKind: value.predicateKind,
            declaration: value.declaration,
        }, ordinal));
    }
    catch {
        return false;
    }
}
function constructProtectedObservation(workspaceAuthorityBasis, workspace, source, input, ordinal) {
    const member = source.members[ordinal];
    if (member === undefined || input.sourceMemberRef !== member.inputMemberRef ||
        !isWorksiteSubject(input.subject) || !isWorksiteObservation(input.observation) ||
        input.observation.state !== "file" || !same(input.observation, member.successorObservation) ||
        input.subject.workspaceBindingIdentity !== workspace.bindingId ||
        input.subject.workspaceBindingDigest !== workspace.bindingDigest ||
        input.observation.workspaceBindingIdentity !== workspace.bindingId ||
        input.observation.subjectRef !== input.subject.subjectRef ||
        input.observation.subjectDigest !== input.subject.subjectDigest) {
        throw new TypeError("protected observation must bind one exact source C1 member, subject, O1, and workspace");
    }
    const exactSubject = constructWorksiteSubject({
        workspaceAuthorityBasis,
        workspaceBinding: workspace,
        subjectUri: input.subject.subjectUri,
        relativePath: input.subject.relativePath,
    });
    if (exactSubject.kind !== "worksite_subject" ||
        !same(exactSubject, input.subject)) {
        throw new TypeError("protected observation subject must reproduce under the exact canonical worksite authority");
    }
    return deepFreeze({
        kind: "worksite_protected_observation",
        schemaVersion: SCHEMA_VERSION,
        ordinal,
        sourceMemberRef: input.sourceMemberRef,
        subject: input.subject,
        observation: input.observation,
    });
}
function isProtectedObservation(value, ordinal) {
    return isRecord(value) && exactKeys(value, [
        "kind", "observation", "ordinal", "schemaVersion", "sourceMemberRef", "subject",
    ]) && value.kind === "worksite_protected_observation" &&
        value.schemaVersion === SCHEMA_VERSION && value.ordinal === ordinal &&
        nonempty(value.sourceMemberRef) && isWorksiteSubject(value.subject) &&
        isWorksiteObservation(value.observation) && value.observation.state === "file";
}
function constructWriteTerritory(input, ordinal) {
    if ((input.pathKind !== "file" && input.pathKind !== "subtree") ||
        !safeRelativePath(input.relativePath)) {
        throw new TypeError("command write territory requires one exact file or subtree path");
    }
    const body = {
        ordinal,
        pathKind: input.pathKind,
        relativePath: input.relativePath,
        purpose: "execution_evidence",
    };
    const territoryDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_command_write_territory",
        schemaVersion: SCHEMA_VERSION,
        territoryRef: identity("worksite-command-write-territory://abiogenesis", territoryDigest),
        territoryDigest,
        ...body,
    });
}
function isWriteTerritory(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "kind", "ordinal", "pathKind", "purpose", "relativePath", "schemaVersion", "territoryDigest", "territoryRef",
    ]) || value.kind !== "worksite_command_write_territory" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal || value.purpose !== "execution_evidence" ||
        (value.pathKind !== "file" && value.pathKind !== "subtree") ||
        !safeRelativePath(value.relativePath) || !isSha256Digest(value.territoryDigest) ||
        !nonempty(value.territoryRef))
        return false;
    const digest = sha256Canonical({
        ordinal, pathKind: value.pathKind, relativePath: value.relativePath, purpose: value.purpose,
    });
    return value.territoryDigest === digest &&
        value.territoryRef === identity("worksite-command-write-territory://abiogenesis", digest);
}
function withinRelativeRoot(path, root) {
    const normalizedPath = posix.normalize(path.replaceAll("\\", "/"));
    const normalizedRoot = posix.normalize(root.replaceAll("\\", "/"));
    return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
}
function exposesWorkspaceRoot(value, authority, workspace) {
    const normalized = posix.normalize(value.replaceAll("\\", "/")).toLowerCase();
    return [authority.canonicalRoot, ...Object.values(workspace.roots)].some((root) => normalized.includes(posix.normalize(resolve(root).replaceAll("\\", "/")).toLowerCase()));
}
function hasParentPathSegment(value) {
    return /(^|[\s"'=,:;\/\\])\.\.(?=$|[\s"'=,:;\/\\])/u.test(value);
}
function unsafeChildValue(value, authority, workspace) {
    return exposesWorkspaceRoot(value, authority, workspace) ||
        hasParentPathSegment(value);
}
function protectedRelativeWorksitePath(path, authority, workspace) {
    const candidate = resolve(authority.canonicalRoot, ...path.replaceAll("\\", "/").split("/"));
    return Object.values(workspace.roots).some((root) => {
        const relation = relative(resolve(root), candidate);
        return relation === "" ||
            (!isAbsolute(relation) && relation !== ".." &&
                !relation.startsWith("../"));
    });
}
function predicatePaths(predicate) {
    const declaration = predicate.declaration;
    if (!isRecord(declaration))
        return [];
    if (predicate.predicateKind === "module_export_return_exact") {
        return typeof declaration.path === "string" ? [declaration.path] : [];
    }
    if (predicate.predicateKind === "test_report_set_exact") {
        return typeof declaration.base === "string" && Array.isArray(declaration.equals)
            ? [declaration.base, ...declaration.equals.flatMap((path) => typeof path === "string" ? [posix.join(declaration.base, path)] : [])]
            : [];
    }
    if (predicate.predicateKind === "http_response_exact" &&
        isRecord(declaration.launch)) {
        const launch = declaration.launch;
        return [
            typeof launch.relativeCwd === "string" ? launch.relativeCwd : null,
            isRecord(launch.portFile) &&
                typeof launch.portFile.relativePath === "string"
                ? launch.portFile.relativePath
                : null,
        ].filter((path) => path !== null);
    }
    return [];
}
export function worksitePathIsAllowed(path, territories) {
    return territories.some((territory) => territory.pathKind === "file"
        ? posix.normalize(path.replaceAll("\\", "/")) === territory.relativePath
        : withinRelativeRoot(path, territory.relativePath));
}
export function matchingWorksiteTerritoryRef(path, territories) {
    const matches = territories.filter((territory) => territory.pathKind === "file"
        ? posix.normalize(path.replaceAll("\\", "/")) === territory.relativePath
        : withinRelativeRoot(path, territory.relativePath));
    return matches.length === 1 ? matches[0].territoryRef : null;
}
/** Prospective, unbound JSON input view for existing C2 configuration producers.
 * Environment uses its ordinary object form, not the owner's bound rows.
 * This view is not validation: constructWorksiteCommandConfiguration retains
 * all relational, workspace, territory and normalization checks below. */
export function worksiteCommandConfigurationInputSchema() {
    const text = { type: "string", minLength: 1 };
    const integer = { type: "integer", minimum: Number.MIN_SAFE_INTEGER, maximum: Number.MAX_SAFE_INTEGER };
    const positive = { ...integer, minimum: 1 }, count = { ...integer, minimum: 0 };
    const path = { ...text, description: "Canonical safe relative path; no absolute, parent, backslash or protected install paths." };
    const strings = { type: "array", items: text };
    const environment = { type: "object", additionalProperties: { type: "string" },
        description: "Declared POSIX environment names and string values; C2 normalizes the existing runtime environment." };
    const object = (properties) => ({ type: "object", additionalProperties: false,
        properties, required: Object.keys(properties) });
    const selector = object({ includeSubstrings: strings, includeSuffixes: strings });
    const declarations = [
        ["process_exit", object({ equals: integer, validationCommandId: text })],
        ["stdout_exact", object({ equals: { type: "string" }, validationCommandId: text })],
        ["test_pass_count", object({ greaterThanOrEqual: count, validationCommandId: text })],
        ["module_export_return_exact", object({ equals: {}, export: text, path })],
        ["http_response_exact", object({ body: { type: "string" }, status: integer, validationCommandId: text,
                launch: object({ executable: text, args: { type: "array", items: { type: "string" },
                        description: `Exactly one argument is ${WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder}; C2 supplies the port-file path.` },
                    environment, relativeCwd: path, portFile: object({ relativePath: path }), timeoutMs: positive,
                    terminationGraceMs: { ...positive, description: "Strictly less than launch.timeoutMs." } }),
                request: object({ hostname: { enum: ["127.0.0.1", "::1"] }, method: text, path: text, timeoutMs: positive }) })],
        ["module_set_exact", object({ equals: strings, selector: object({ source: { const: "protected_paths" },
                    prefix: { type: "string" }, suffix: { type: "string" }, segmentIndex: count }) })],
        ["file_count", object({ equals: count, selector: object({ source: { const: "protected_paths" },
                    includeSubstrings: strings, includeSuffixes: strings }) })],
        ["test_report_set_exact", object({ base: path, equals: { type: "array", items: path }, selector })],
        ["test_report_failure_count", object({ equals: count })],
        ["test_report_error_count", object({ equals: count })],
    ];
    return deepFreeze({
        commands: { type: "array", minItems: 1, items: object({ commandId: text, executable: text,
                args: { type: "array", items: { type: "string" } }, relativeCwd: path, environment,
                timeoutMs: { ...positive, maximum: 3_600_000 },
                terminationGraceMs: { ...positive, maximum: 30_000, description: "Strictly less than timeoutMs." },
                expectedReports: { type: "array", items: object({ reportIdentity: text, relativePath: path }) } }) },
        outcomePredicates: { type: "array", description: "Existing C2 predicates only. Referenced commands must exist; module paths must be protected targets. Report counts require exactly one report-set predicate whose paths are declared command reports. Selectors require at least one filter. Port/report writes require explicit evidence territory.",
            items: { anyOf: declarations.map(([predicateKind, declaration]) => object({ predicateId: text, predicateKind: { const: predicateKind }, declaration })) } },
    });
}
/** Pure pre-construction checks; no source result or observation is fabricated. */
export function constructWorksiteCommandConfiguration(input) {
    if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) ||
        !Array.isArray(input.commands) || input.commands.length === 0 ||
        !Array.isArray(input.outcomePredicates) || !Array.isArray(input.protectedSubjects) ||
        !Array.isArray(input.allowedWriteTerritories) || input.allowedWriteTerritories.length === 0 ||
        input.protectedSubjects.some((subject) => !isWorksiteSubject(subject))) {
        throw new TypeError("worksite command configuration requires exact A/W, subjects and explicit arrays");
    }
    const protectedSubjects = input.protectedSubjects;
    const commands = input.commands.map(constructCommand);
    const predicates = (input.outcomePredicates ?? []).map(constructPredicate);
    const allowedWriteTerritories = input.allowedWriteTerritories.map(constructWriteTerritory);
    const territoriesOverlap = allowedWriteTerritories.some((left, leftOrdinal) => allowedWriteTerritories.some((right, rightOrdinal) => leftOrdinal !== rightOrdinal &&
        (left.pathKind === "subtree" && withinRelativeRoot(right.relativePath, left.relativePath) ||
            right.pathKind === "subtree" && withinRelativeRoot(left.relativePath, right.relativePath) ||
            left.relativePath === right.relativePath)));
    const commandIds = new Set(commands.map((row) => row.commandId));
    const reportRows = commands.flatMap((row) => row.expectedReports);
    const referencedCommandsAreExact = predicates.every((predicate) => {
        if (!isRecord(predicate.declaration) ||
            !Object.hasOwn(predicate.declaration, "validationCommandId"))
            return true;
        return typeof predicate.declaration.validationCommandId === "string" &&
            commandIds.has(predicate.declaration.validationCommandId);
    });
    const reportSetPredicates = predicates.filter((row) => row.predicateKind === "test_report_set_exact");
    const reportCountsHaveOneBase = predicates.every((row) => (row.predicateKind !== "test_report_failure_count" && row.predicateKind !== "test_report_error_count") ||
        reportSetPredicates.length === 1);
    const declaredReportPathsAreObserved = reportSetPredicates.every((row) => {
        const declaration = row.declaration;
        return typeof declaration.base === "string" && Array.isArray(declaration.equals) &&
            declaration.equals.every((path) => typeof path === "string" && reportRows.some((report) => report.relativePath === posix.join(declaration.base, path)));
    });
    const modulePredicatesAreProtected = predicates.every((row) => {
        if (row.predicateKind !== "module_export_return_exact")
            return true;
        const declaration = row.declaration;
        return isRecord(declaration) && typeof declaration.path === "string" &&
            protectedSubjects.some((protectedRow) => protectedRow.relativePath === declaration.path);
    });
    const childInputsExposeWorkspace = commands.some((command) => unsafeChildValue(command.executable, input.workspaceAuthorityBasis, input.workspaceBinding) ||
        command.args.some((arg) => unsafeChildValue(arg, input.workspaceAuthorityBasis, input.workspaceBinding)) ||
        command.environment.some((entry) => unsafeChildValue(entry.value, input.workspaceAuthorityBasis, input.workspaceBinding))) ||
        predicates.some((predicate) => {
            if (predicate.predicateKind !== "http_response_exact" || !isRecord(predicate.declaration) ||
                !isRecord(predicate.declaration.launch))
                return false;
            const launch = predicate.declaration.launch;
            return typeof launch.executable === "string" &&
                unsafeChildValue(launch.executable, input.workspaceAuthorityBasis, input.workspaceBinding) ||
                launch.args.some((arg) => typeof arg === "string" && unsafeChildValue(arg, input.workspaceAuthorityBasis, input.workspaceBinding)) ||
                launch.environment.some((rawEntry) => {
                    const entry = rawEntry;
                    return typeof entry.value === "string" && unsafeChildValue(entry.value, input.workspaceAuthorityBasis, input.workspaceBinding);
                });
        });
    const httpPortFilesAreAuthorized = predicates.every((predicate) => {
        if (predicate.predicateKind !== "http_response_exact" || !isRecord(predicate.declaration) ||
            !isRecord(predicate.declaration.launch) || !isRecord(predicate.declaration.launch.portFile))
            return true;
        return typeof predicate.declaration.launch.portFile.relativePath === "string" &&
            worksitePathIsAllowed(predicate.declaration.launch.portFile.relativePath, allowedWriteTerritories);
    });
    const declaredPathsEnterProtectedRoots = [
        ...commands.flatMap((command) => [
            command.relativeCwd,
            ...command.expectedReports.map((report) => report.relativePath),
        ]),
        ...allowedWriteTerritories.map((territory) => territory.relativePath),
        ...predicates.flatMap(predicatePaths),
    ].some((path) => protectedRelativeWorksitePath(path, input.workspaceAuthorityBasis, input.workspaceBinding));
    if (new Set(commands.map((row) => row.commandId)).size !== commands.length ||
        new Set(predicates.map((row) => row.predicateId)).size !== predicates.length ||
        new Set(protectedSubjects.map((row) => row.subjectRef)).size !== protectedSubjects.length ||
        new Set(allowedWriteTerritories.map((row) => `${row.pathKind}:${row.relativePath}`)).size !== allowedWriteTerritories.length ||
        territoriesOverlap ||
        new Set(reportRows.map((row) => row.reportIdentity)).size !== reportRows.length ||
        new Set(reportRows.map((row) => row.relativePath)).size !== reportRows.length ||
        !referencedCommandsAreExact || !reportCountsHaveOneBase || !declaredReportPathsAreObserved ||
        !modulePredicatesAreProtected || childInputsExposeWorkspace ||
        declaredPathsEnterProtectedRoots || !httpPortFilesAreAuthorized ||
        protectedSubjects.some((row) => worksitePathIsAllowed(row.relativePath, allowedWriteTerritories)) ||
        commands.some((command) => command.expectedReports.some((report) => !worksitePathIsAllowed(report.relativePath, allowedWriteTerritories)))) {
        throw new TypeError("worksite command and predicate identities must be unique");
    }
    return deepFreeze({ commands, predicates, allowedWriteTerritories });
}
export function constructWorksiteCommandExecutionTask(input) {
    if (!exactWorkspaceAuthorityJoin(input.workspaceAuthorityBasis, input.workspaceBinding) ||
        !isExactDirectGrant(input.capabilityGrant, input.workspaceBinding) ||
        !nonempty(input.sourceConstructionResultRef) ||
        !isSha256Digest(input.sourceConstructionResultDigest) ||
        input.sourceConstructionResultRef !== identity("worksite-construction-result://abiogenesis", input.sourceConstructionResultDigest) || !Array.isArray(input.commands) || input.commands.length === 0 ||
        !Array.isArray(input.outcomePredicates ?? []) ||
        !Array.isArray(input.protectedObservations) ||
        !Array.isArray(input.allowedWriteTerritories) || input.allowedWriteTerritories.length === 0) {
        throw new TypeError("worksite command execution task requires exact W, grant, source C1 result, commands, and predicates");
    }
    const source = input.sourceConstructionResult;
    if (!isWorksiteConstructionResult(source) ||
        source.resultRef !== input.sourceConstructionResultRef ||
        source.resultDigest !== input.sourceConstructionResultDigest ||
        source.members.some((member) => member.successorObservation.workspaceBindingIdentity !== input.workspaceBinding.bindingId)) {
        throw new TypeError("worksite command execution source value differs from its exact C1 coordinates or workspace");
    }
    const constructionObservations = input.protectedObservations.map((row, ordinal) => constructProtectedObservation(input.workspaceAuthorityBasis, input.workspaceBinding, source, row, ordinal));
    if (constructionObservations.length !== source.members.length) {
        throw new TypeError("worksite command protected observations must cover the exact source");
    }
    const readBasis = input.readDependencyBasis;
    if (readBasis !== undefined && !isWorksiteReadDependencyBasis(readBasis))
        throw new TypeError("invalid initial-job read source");
    const dependencies = (readBasis?.members ?? []).map((row, index) => {
        const subject = constructWorksiteSubject({ workspaceAuthorityBasis: input.workspaceAuthorityBasis,
            workspaceBinding: input.workspaceBinding, subjectUri: row.subject.subjectUri, relativePath: row.subject.relativePath });
        if (!same(subject, row.subject) || row.observation.workspaceBindingIdentity !== input.workspaceBinding.bindingId ||
            constructionObservations.some(selected => selected.subject.relativePath === row.subject.relativePath)) {
            throw new TypeError("read dependencies must share exact A/W and cannot be C1 construction targets");
        }
        return { kind: "worksite_protected_observation", schemaVersion: SCHEMA_VERSION,
            ordinal: constructionObservations.length + index, ...row };
    });
    const protectedObservations = [...constructionObservations, ...dependencies];
    const { commands, predicates, allowedWriteTerritories } = constructWorksiteCommandConfiguration({
        ...input,
        outcomePredicates: input.outcomePredicates ?? [],
        protectedSubjects: protectedObservations.map((row) => row.subject),
    });
    const body = {
        workspaceAuthorityBasis: input.workspaceAuthorityBasis,
        workspaceBinding: input.workspaceBinding,
        capabilityGrant: input.capabilityGrant,
        sourceConstructionResultRef: input.sourceConstructionResultRef,
        sourceConstructionResultDigest: input.sourceConstructionResultDigest,
        sourceConstructionResult: source,
        materializationPlanRef: WORKSITE_COMMAND_EXECUTION_IDS.materializationPlanRef,
        rendererRef: WORKSITE_COMMAND_EXECUTION_IDS.rendererRef,
        instructionContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
        resultContractRef: WORKSITE_COMMAND_EXECUTION_IDS.workerResultContractRef,
        workerActorRef: WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef,
        workerBindingRef: WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef,
        transportLane: WORKSITE_COMMAND_EXECUTION_IDS.transportLane,
        commands,
        outcomePredicates: predicates,
        protectedObservations,
        ...(readBasis === undefined ? {} : { readDependencyBasis: readBasis }),
        allowedWriteTerritories,
    };
    const taskDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "worksite_command_execution_task",
        schemaVersion: SCHEMA_VERSION,
        taskRef: identity("worksite-command-execution-task://abiogenesis", taskDigest),
        taskDigest,
        ...body,
    });
}
export function isWorksiteCommandExecutionTask(value) {
    if (!isRecord(value) || !exactKeys(value, [
        "allowedWriteTerritories", "capabilityGrant", "commands", "instructionContractRef", "kind",
        "materializationPlanRef", "outcomePredicates", "protectedObservations", "rendererRef", "resultContractRef",
        "schemaVersion", "sourceConstructionResult", "sourceConstructionResultDigest",
        "sourceConstructionResultRef", "taskDigest", "taskRef", "transportLane",
        "workerActorRef", "workerBindingRef", "workspaceBinding",
        "workspaceAuthorityBasis", ...(Object.hasOwn(value, "readDependencyBasis") ? ["readDependencyBasis"] : []),
    ]) || value.kind !== "worksite_command_execution_task" || value.schemaVersion !== SCHEMA_VERSION ||
        !isWorkspaceAuthorityBasis(value.workspaceAuthorityBasis) ||
        !isExactWorkspaceBinding(value.workspaceBinding) ||
        !exactWorkspaceAuthorityJoin(value.workspaceAuthorityBasis, value.workspaceBinding) ||
        !Array.isArray(value.commands) || !value.commands.every(isCommand) ||
        !Array.isArray(value.outcomePredicates) || !value.outcomePredicates.every(isPredicate) ||
        !Array.isArray(value.protectedObservations) || !value.protectedObservations.every(isProtectedObservation) ||
        !Array.isArray(value.allowedWriteTerritories) || !value.allowedWriteTerritories.every(isWriteTerritory))
        return false;
    try {
        const expected = constructWorksiteCommandExecutionTask({
            workspaceAuthorityBasis: value.workspaceAuthorityBasis,
            workspaceBinding: value.workspaceBinding,
            capabilityGrant: value.capabilityGrant,
            sourceConstructionResultRef: value.sourceConstructionResultRef,
            sourceConstructionResultDigest: value.sourceConstructionResultDigest,
            sourceConstructionResult: value.sourceConstructionResult,
            commands: value.commands,
            outcomePredicates: value.outcomePredicates,
            protectedObservations: value.protectedObservations.slice(0, value.sourceConstructionResult.members.length),
            ...(Object.hasOwn(value, "readDependencyBasis") ? { readDependencyBasis: value.readDependencyBasis } : {}),
            allowedWriteTerritories: value.allowedWriteTerritories,
        });
        return same(value, expected);
    }
    catch {
        return false;
    }
}
function canonicalBase64(value) {
    return typeof value === "string" && Buffer.from(value, "base64").toString("base64") === value;
}
function isObservedStream(value) {
    if (!isRecord(value) || !exactKeys(value, [
        "byteLength", "digest", "encoding", "kind", "payload", "schemaVersion",
    ]) || value.kind !== "worksite_observed_stream" || value.schemaVersion !== SCHEMA_VERSION ||
        value.encoding !== "base64" || !canonicalBase64(value.payload) ||
        !Number.isSafeInteger(value.byteLength) || Number(value.byteLength) < 0 ||
        !isSha256Digest(value.digest))
        return false;
    const bytes = Buffer.from(value.payload, "base64");
    return bytes.byteLength === value.byteLength && sha256Bytes(bytes) === value.digest;
}
function isReportObservation(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "byteLength", "commandId", "commandOrdinal", "digest", "expectedReportIdentity", "kind",
        "observationDigest", "observationRef", "ordinal", "relativePath", "schemaVersion", "state",
    ]) || value.kind !== "worksite_report_observation" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal || !Number.isSafeInteger(value.commandOrdinal) ||
        Number(value.commandOrdinal) < 0 || !nonempty(value.commandId) ||
        !nonempty(value.expectedReportIdentity) || !safeRelativePath(value.relativePath) ||
        (value.state !== "absent" && value.state !== "file") ||
        !nonempty(value.observationRef) || !isSha256Digest(value.observationDigest))
        return false;
    const stateIsValid = value.state === "absent"
        ? value.byteLength === null && value.digest === null
        : Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 &&
            isSha256Digest(value.digest);
    if (!stateIsValid)
        return false;
    const observationDigest = sha256Canonical({
        commandOrdinal: Number(value.commandOrdinal),
        commandId: value.commandId,
        expectedReportIdentity: value.expectedReportIdentity,
        reportOrdinal: value.ordinal,
        relativePath: value.relativePath,
        state: value.state,
        byteLength: value.byteLength,
        digest: value.digest,
    });
    return value.observationDigest === observationDigest &&
        value.observationRef === identity("worksite-report-observation://abiogenesis", observationDigest);
}
function isCommandResult(value, ordinal) {
    if (!(isRecord(value) && exactKeys(value, [
        "args", "commandId", "environment", "executable", "exitStatus", "kind",
        "observationDigest", "observationRef", "ordinal", "processSignal", "relativeCwd",
        "reportCount", "reports", "schemaVersion",
        "signalSequence", "stderr", "stdout", "terminationConfirmed", "terminationGraceMs",
        "timedOut", "timeoutMs",
    ]) && value.kind === "worksite_command_result" && value.schemaVersion === SCHEMA_VERSION &&
        value.ordinal === ordinal && nonempty(value.commandId) && nonempty(value.executable) &&
        Array.isArray(value.args) && value.args.every((arg) => typeof arg === "string" && !arg.includes("\0")) &&
        safeRelativePath(value.relativeCwd) && Array.isArray(value.environment) &&
        value.environment.every((entry) => isRecord(entry) && exactKeys(entry, ["kind", "name", "schemaVersion", "value"]) &&
            entry.kind === "worksite_command_environment_entry" && entry.schemaVersion === SCHEMA_VERSION &&
            typeof entry.name === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/u.test(entry.name) && typeof entry.value === "string") &&
        Number.isSafeInteger(value.exitStatus) && isObservedStream(value.stdout) && isObservedStream(value.stderr) &&
        Number.isSafeInteger(value.timeoutMs) && Number(value.timeoutMs) > 0 &&
        Number.isSafeInteger(value.terminationGraceMs) && Number(value.terminationGraceMs) > 0 &&
        typeof value.timedOut === "boolean" &&
        (value.processSignal === null || nonempty(value.processSignal)) &&
        Array.isArray(value.signalSequence) && value.signalSequence.every((signal) => signal === "SIGTERM" || signal === "SIGKILL") &&
        typeof value.terminationConfirmed === "boolean" &&
        Array.isArray(value.reports) && value.reports.every(isReportObservation) &&
        value.reports.every((report) => report.commandOrdinal === value.ordinal && report.commandId === value.commandId) &&
        Number.isSafeInteger(value.reportCount) && Number(value.reportCount) >= 0 &&
        value.reportCount === value.reports.filter((row) => row.state === "file").length &&
        nonempty(value.observationRef) && isSha256Digest(value.observationDigest)))
        return false;
    const observationDigest = sha256Canonical({
        ordinal: value.ordinal,
        commandId: value.commandId,
        executable: value.executable,
        args: value.args,
        relativeCwd: value.relativeCwd,
        environment: value.environment,
        timeoutMs: value.timeoutMs,
        terminationGraceMs: value.terminationGraceMs,
        exitStatus: value.exitStatus,
        timedOut: value.timedOut,
        processSignal: value.processSignal,
        signalSequence: value.signalSequence,
        terminationConfirmed: value.terminationConfirmed,
        stdout: value.stdout,
        stderr: value.stderr,
        reports: value.reports,
        reportCount: value.reportCount,
    });
    return value.observationDigest === observationDigest &&
        value.observationRef === identity("worksite-command-observation://abiogenesis", observationDigest);
}
function isPredicateObservation(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "evidence", "evidenceRefs", "kind", "observedValue", "ordinal", "predicateId",
        "predicateKind", "schemaVersion",
    ]) || value.kind !== "worksite_predicate_observation" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal || !nonempty(value.predicateId) || !nonempty(value.predicateKind) ||
        !Array.isArray(value.evidence) || !Array.isArray(value.evidenceRefs) ||
        !value.evidenceRefs.every(nonempty))
        return false;
    try {
        admitIJsonValue(value.observedValue, "predicate observation");
        admitIJsonValue(value.evidence, "predicate evidence");
        return true;
    }
    catch {
        return false;
    }
}
function isPathObservation(value) {
    return isRecord(value) && exactKeys(value, [
        "byteLength", "digest", "kind", "nodeKind", "relativePath", "schemaVersion", "symlinkTarget",
    ]) && value.kind === "worksite_path_observation" && value.schemaVersion === SCHEMA_VERSION &&
        safeRelativePath(value.relativePath) &&
        (value.nodeKind === "directory" || value.nodeKind === "file" || value.nodeKind === "symlink") &&
        isSha256Digest(value.digest) &&
        (value.nodeKind === "file"
            ? Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 && value.symlinkTarget === null
            : value.nodeKind === "symlink"
                ? value.byteLength === null && typeof value.symlinkTarget === "string"
                : value.byteLength === null && value.symlinkTarget === null);
}
function isPathDelta(value, ordinal) {
    if (!isRecord(value) || !exactKeys(value, [
        "after", "before", "changeKind", "kind", "matchedTerritoryRef", "ordinal", "relativePath", "schemaVersion",
    ]) || value.kind !== "worksite_path_delta" || value.schemaVersion !== SCHEMA_VERSION ||
        value.ordinal !== ordinal || !safeRelativePath(value.relativePath) ||
        (value.changeKind !== "changed" && value.changeKind !== "created" && value.changeKind !== "deleted") ||
        (value.matchedTerritoryRef !== null && !nonempty(value.matchedTerritoryRef)) ||
        (value.before !== null && !isPathObservation(value.before)) ||
        (value.after !== null && !isPathObservation(value.after)))
        return false;
    return value.changeKind === "created" ? value.before === null && value.after !== null
        : value.changeKind === "deleted" ? value.before !== null && value.after === null
            : value.before !== null && value.after !== null && !same(value.before, value.after);
}
function isSnapshotMember(value, ordinal) {
    return isRecord(value) && exactKeys(value, [
        "byteLength", "digest", "kind", "ordinal", "relativePath", "schemaVersion",
        "sourceMemberRef", "sourceObservationDigest", "sourceObservationRef",
    ]) && value.kind === "worksite_snapshot_member" && value.schemaVersion === SCHEMA_VERSION &&
        value.ordinal === ordinal && nonempty(value.sourceMemberRef) && safeRelativePath(value.relativePath) &&
        nonempty(value.sourceObservationRef) && isSha256Digest(value.sourceObservationDigest) &&
        Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 && isSha256Digest(value.digest);
}
export function constructWorksiteExecutionHelperArtifact(input) {
    if (!isWorksiteExecutionTask(input.task) ||
        !Array.isArray(input.commandResults) || !input.commandResults.every(isCommandResult) ||
        !Array.isArray(input.predicateObservations) ||
        !input.predicateObservations.every(isPredicateObservation) ||
        !Array.isArray(input.worksiteDelta) || !input.worksiteDelta.every(isPathDelta) ||
        !Array.isArray(input.productDelta) || !input.productDelta.every(isPathDelta) ||
        input.productDelta.some((row) => row.matchedTerritoryRef !== null) ||
        input.worksiteDelta.some((row) => row.matchedTerritoryRef !==
            matchingWorksiteTerritoryRef(row.relativePath, input.task.allowedWriteTerritories)) ||
        !Array.isArray(input.protectedBefore) || !Array.isArray(input.protectedAfter) ||
        !input.protectedBefore.every(isWorksiteObservation) ||
        !input.protectedAfter.every(isWorksiteObservation) ||
        input.protectedBefore.length !== worksiteExecutionSources(input.task).length ||
        input.protectedAfter.length !== worksiteExecutionSources(input.task).length ||
        !isAbsolute(input.snapshotRoot) || !nonempty(input.snapshotRef) || !isSha256Digest(input.snapshotDigest) ||
        !Array.isArray(input.snapshotMembers) || !input.snapshotMembers.every((member, ordinal) => isExecutionSnapshotMember(input.task, member, ordinal)) ||
        (input.snapshotMembers.length !== 0 &&
            input.snapshotMembers.length !== worksiteExecutionSources(input.task).length) ||
        (input.snapshotMembers.length === 0 && input.disposition !== "protected_mismatch") ||
        input.snapshotMembers.some((member, ordinal) => {
            const protectedRow = worksiteExecutionSources(input.task)[ordinal];
            return protectedRow === undefined || !executionSnapshotSourceMatches(member, protectedRow) ||
                member.relativePath !== protectedRow.subject.relativePath ||
                member.sourceObservationRef !== protectedRow.observation.observationRef ||
                member.sourceObservationDigest !== protectedRow.observation.observationDigest ||
                member.byteLength !== protectedRow.observation.byteLength ||
                member.digest !== protectedRow.observation.fileDigest;
        }) || input.snapshotDigest !== sha256Canonical(input.snapshotMembers) ||
        (input.commandResults.length !== 0 && input.commandResults.length !== input.task.commands.length) ||
        (input.predicateObservations.length !== 0 &&
            input.predicateObservations.length !== input.task.outcomePredicates.length) ||
        !((input.commandResults.length === 0 && input.predicateObservations.length === 0) ||
            (input.commandResults.length === input.task.commands.length &&
                input.predicateObservations.length === input.task.outcomePredicates.length)) ||
        (input.disposition === "success" && input.commandResults.length !== input.task.commands.length) ||
        (input.disposition === "success" && input.predicateObservations.length !== input.task.outcomePredicates.length) ||
        (input.disposition === "success" && input.worksiteDelta.some((row) => row.matchedTerritoryRef === null)) ||
        (input.disposition === "success" && input.productDelta.length !== 0) ||
        (input.disposition === "territory_mismatch" && !input.worksiteDelta.some((row) => row.matchedTerritoryRef === null)) ||
        (input.disposition === "product_mismatch" && input.productDelta.length === 0) ||
        input.snapshotRef !== identity(worksiteExecutionIdentityPrefix(input.task, "snapshot"), input.snapshotDigest) ||
        (input.disposition !== "success" && input.disposition !== "protected_mismatch" &&
            input.disposition !== "territory_mismatch" && input.disposition !== "product_mismatch")) {
        throw new TypeError("command helper artifact requires exact task-bound commands and protected observations");
    }
    if (input.commandResults.length === input.task.commands.length) {
        assertWorksiteCommandVectors(input.task, input.commandResults, input.predicateObservations);
    }
    const body = {
        taskRef: input.task.taskRef,
        taskDigest: input.task.taskDigest,
        disposition: input.disposition,
        commandResults: input.commandResults,
        predicateObservations: input.predicateObservations,
        worksiteDelta: input.worksiteDelta,
        productDelta: input.productDelta,
        snapshotRoot: input.snapshotRoot,
        snapshotRef: input.snapshotRef,
        snapshotDigest: input.snapshotDigest,
        snapshotMembers: input.snapshotMembers,
        protectedBefore: input.protectedBefore,
        protectedAfter: input.protectedAfter,
    };
    const artifactDigest = sha256Canonical(body);
    return deepFreeze({
        kind: input.task.kind === "worksite_command_forward_task" ? "worksite_command_forward_helper_artifact"
            : input.task.kind === "worksite_command_execution_task" ? "worksite_command_helper_artifact" : "worksite_revision_command_helper_artifact",
        schemaVersion: SCHEMA_VERSION,
        artifactRef: identity(worksiteExecutionIdentityPrefix(input.task, "helper-artifact"), artifactDigest),
        artifactDigest,
        ...body,
    });
}
export function isWorksiteExecutionHelperArtifact(task, value) {
    if (!isRecord(value) || !exactKeys(value, [
        "artifactDigest", "artifactRef", "commandResults", "disposition", "kind", "predicateObservations",
        "productDelta", "protectedAfter", "protectedBefore", "schemaVersion", "taskDigest", "taskRef",
        "snapshotDigest", "snapshotMembers", "snapshotRef", "snapshotRoot", "worksiteDelta",
    ]) || value.kind !== (task.kind === "worksite_command_forward_task" ? "worksite_command_forward_helper_artifact"
        : task.kind === "worksite_command_execution_task" ? "worksite_command_helper_artifact" : "worksite_revision_command_helper_artifact") || value.schemaVersion !== SCHEMA_VERSION ||
        value.taskRef !== task.taskRef || value.taskDigest !== task.taskDigest ||
        !isSha256Digest(value.artifactDigest) || !nonempty(value.artifactRef))
        return false;
    try {
        return same(value, constructWorksiteExecutionHelperArtifact({
            task,
            disposition: value.disposition,
            commandResults: value.commandResults,
            predicateObservations: value.predicateObservations,
            worksiteDelta: value.worksiteDelta,
            productDelta: value.productDelta,
            snapshotRoot: value.snapshotRoot,
            snapshotRef: value.snapshotRef,
            snapshotDigest: value.snapshotDigest,
            snapshotMembers: value.snapshotMembers,
            protectedBefore: value.protectedBefore,
            protectedAfter: value.protectedAfter,
        }));
    }
    catch {
        return false;
    }
}
export function helperArtifactPreservesProtectedObservations(task, artifact) {
    return isWorksiteExecutionHelperArtifact(task, artifact) && artifact.disposition === "success" &&
        worksiteExecutionSources(task).every((protectedRow, ordinal) => same(artifact.protectedBefore[ordinal], protectedRow.observation) &&
            same(artifact.protectedAfter[ordinal], protectedRow.observation));
}
export function isWorksiteCommandExecutionWorkerResult(value) {
    return isRecord(value) && exactKeys(value, [
        "attemptRef", "helperArtifactDigest", "helperArtifactRef", "kind",
        "schemaVersion", "taskDigest", "taskRef",
    ]) && value.kind === "worksite_command_execution_worker_result" &&
        value.schemaVersion === SCHEMA_VERSION && nonempty(value.taskRef) &&
        isSha256Digest(value.taskDigest) && nonempty(value.attemptRef) &&
        isSha256Digest(value.helperArtifactDigest) &&
        value.helperArtifactRef === identity("worksite-command-helper-artifact://abiogenesis", value.helperArtifactDigest);
}
export function constructWorksiteCommandExecutionWorkerResult(task, rawValue, helperPlan) {
    if (!isWorksiteExecutionTask(task) || !isRecord(rawValue) ||
        !(task.kind === "worksite_command_forward_task" ? isWorksiteCommandForwardWorkerResult(rawValue)
            : task.kind === "worksite_command_execution_task" ? isWorksiteCommandExecutionWorkerResult(rawValue)
                : isWorksiteRevisionCommandExecutionWorkerResult(rawValue)) ||
        !isWorksiteCommandExecutionHelperPlan(task, helperPlan) ||
        rawValue.taskRef !== task.taskRef || rawValue.taskDigest !== task.taskDigest ||
        rawValue.attemptRef !== helperPlan.attemptRef) {
        throw new TypeError("worksite command execution acknowledgment requires exact task, attempt, and artifact identity");
    }
    return deepFreeze(admitIJsonValue(rawValue, "worksite command execution acknowledgment"));
}
/** Same compact carrier shape, distinct closed revision artifact namespace. */
export function isWorksiteRevisionCommandExecutionWorkerResult(value) {
    return isRecord(value) && exactKeys(value, [
        "attemptRef", "helperArtifactDigest", "helperArtifactRef", "kind",
        "schemaVersion", "taskDigest", "taskRef",
    ]) && value.kind === "worksite_command_execution_worker_result" &&
        value.schemaVersion === SCHEMA_VERSION && nonempty(value.taskRef) &&
        isSha256Digest(value.taskDigest) && nonempty(value.attemptRef) &&
        isSha256Digest(value.helperArtifactDigest) &&
        value.helperArtifactRef === identity("worksite-revision-command-helper-artifact://abiogenesis", value.helperArtifactDigest);
}
/** Full artifact and replay row law is independent of the raw Worker acknowledgment. */
function assertWorksiteCommandVectors(task, commandResults, predicateObservations) {
    if (!isWorksiteExecutionTask(task) ||
        !Array.isArray(commandResults) || !commandResults.every(isCommandResult) ||
        !Array.isArray(predicateObservations) || !predicateObservations.every(isPredicateObservation) ||
        commandResults.length !== task.commands.length ||
        !commandResults.every((result, ordinal) => {
            const declared = task.commands[ordinal];
            return declared !== undefined && result.ordinal === ordinal &&
                result.commandId === declared.commandId && result.executable === declared.executable &&
                same(result.args, declared.args) && result.relativeCwd === declared.relativeCwd &&
                same(result.environment, declared.environment) && result.timeoutMs === declared.timeoutMs &&
                result.terminationGraceMs === declared.terminationGraceMs &&
                result.reports.length === declared.expectedReports.length &&
                result.reports.every((report, reportOrdinal) => {
                    const expected = declared.expectedReports[reportOrdinal];
                    return expected !== undefined && report.ordinal === reportOrdinal &&
                        report.commandOrdinal === declared.ordinal && report.commandId === declared.commandId &&
                        report.expectedReportIdentity === expected.reportIdentity &&
                        report.relativePath === expected.relativePath;
                });
        }) || predicateObservations.length !== task.outcomePredicates.length ||
        !predicateObservations.every((observation, ordinal) => {
            const declared = task.outcomePredicates[ordinal];
            return declared !== undefined && observation.ordinal === ordinal &&
                observation.predicateId === declared.predicateId &&
                observation.predicateKind === declared.predicateKind;
        })) {
        throw new TypeError("worksite command execution rows must preserve exact command, report, and predicate identity/order");
    }
    admitIJsonValue({ commandResults, predicateObservations }, "worksite command execution rows");
}
export function constructWorksiteExecutionObservation(task, workerResult, actorObservation, helperArtifact, helperPlan) {
    const exact = constructWorksiteCommandExecutionWorkerResult(task, workerResult, helperPlan);
    const helperToolInvocation = actorObservation.toolInvocations[0];
    if (!isWorksiteCommandExecutionHelperPlan(task, helperPlan) ||
        actorObservation.actorRef !== task.workerActorRef ||
        actorObservation.workerBindingRef !== task.workerBindingRef ||
        actorObservation.implementationRef !== worksiteExecutionImplementationRef(task) ||
        actorObservation.inputDigest !== sha256Canonical(task) ||
        actorObservation.transportLane !== "worker_executes" || actorObservation.disposition !== "success" ||
        actorObservation.toolCallCount !== 1 || actorObservation.toolInvocations.length !== 1 ||
        helperToolInvocation === undefined || helperToolInvocation.ordinal !== 0 ||
        helperToolInvocation.toolName !== "Bash" ||
        helperToolInvocation.inputDigest !== helperPlan.toolInputDigest ||
        helperToolInvocation.inputByteLength !== helperPlan.toolInputByteLength ||
        !isWorksiteExecutionHelperArtifact(task, helperArtifact) ||
        !helperArtifactPreservesProtectedObservations(task, helperArtifact) ||
        helperArtifact.snapshotRoot !== helperPlan.sandboxRoot ||
        helperArtifact.artifactRef !== exact.helperArtifactRef ||
        helperArtifact.artifactDigest !== exact.helperArtifactDigest ||
        !nonempty(actorObservation.actorInvocationRef) || !nonempty(actorObservation.processRef)) {
        throw new TypeError("worksite command execution observation requires the exact helper tool invocation, artifact, commands, and protected O1 preservation");
    }
    const provenance = deepFreeze({
        kind: "worksite_command_execution_provenance",
        schemaVersion: SCHEMA_VERSION,
        actorInvocationRef: actorObservation.actorInvocationRef,
        actorRef: actorObservation.actorRef,
        workerBindingRef: actorObservation.workerBindingRef,
        actorProcessRef: actorObservation.processRef,
        transportBindingRef: actorObservation.transportBindingRef,
        transportBindingDigest: actorObservation.transportBindingDigest,
        transportDigest: actorObservation.transportDigest,
        toolCallCount: actorObservation.toolCallCount,
        helperArtifactPath: helperPlan.artifactPath,
        helperArtifactRef: helperArtifact.artifactRef,
        helperArtifactDigest: helperArtifact.artifactDigest,
        helperArtifactByteLength: Buffer.byteLength(`${canonicalJson(helperArtifact)}\n`, "utf8"),
        helperToolInvocation,
        helperPlan,
    });
    const body = {
        task,
        provenance,
        helperArtifactRef: helperArtifact.artifactRef,
        helperArtifactDigest: helperArtifact.artifactDigest,
        commandResults: helperArtifact.commandResults,
        predicateObservations: helperArtifact.predicateObservations,
        worksiteDelta: helperArtifact.worksiteDelta,
        productDelta: helperArtifact.productDelta,
        snapshotRef: helperArtifact.snapshotRef,
        snapshotDigest: helperArtifact.snapshotDigest,
        snapshotMembers: helperArtifact.snapshotMembers,
    };
    const observationDigest = sha256Canonical(body);
    return deepFreeze({
        kind: task.kind === "worksite_command_forward_task" ? "worksite_command_forward_observation"
            : task.kind === "worksite_command_execution_task" ? "worksite_command_execution_observation" : "worksite_revision_command_execution_observation",
        schemaVersion: SCHEMA_VERSION,
        observationRef: identity(worksiteExecutionIdentityPrefix(task, "execution-observation"), observationDigest),
        observationDigest,
        ...body,
    });
}
export function isWorksiteExecutionObservation(value) {
    if (!isRecord(value) || !exactKeys(value, [
        "commandResults", "helperArtifactDigest", "helperArtifactRef", "kind", "observationDigest", "observationRef",
        "predicateObservations", "productDelta", "provenance", "schemaVersion", "snapshotDigest",
        "snapshotMembers", "snapshotRef", "task", "worksiteDelta",
    ]) || !isWorksiteExecutionTask(value.task) || value.kind !== (value.task.kind === "worksite_command_forward_task" ? "worksite_command_forward_observation"
        : value.task.kind === "worksite_command_execution_task" ? "worksite_command_execution_observation" : "worksite_revision_command_execution_observation") || value.schemaVersion !== SCHEMA_VERSION || !isRecord(value.provenance) ||
        !exactKeys(value.provenance, [
            "actorInvocationRef", "actorProcessRef", "actorRef", "kind", "schemaVersion",
            "helperArtifactByteLength", "helperArtifactDigest", "helperArtifactPath", "helperArtifactRef",
            "helperPlan", "helperToolInvocation", "toolCallCount", "transportBindingDigest", "transportBindingRef", "transportDigest",
            "workerBindingRef",
        ]) || value.provenance.kind !== "worksite_command_execution_provenance" ||
        value.provenance.schemaVersion !== SCHEMA_VERSION || value.provenance.actorRef !== WORKSITE_COMMAND_EXECUTION_IDS.workerActorRef ||
        value.provenance.workerBindingRef !== WORKSITE_COMMAND_EXECUTION_IDS.workerBindingRef ||
        !nonempty(value.provenance.actorInvocationRef) || !nonempty(value.provenance.actorProcessRef) ||
        !nonempty(value.provenance.transportBindingRef) || !isSha256Digest(value.provenance.transportBindingDigest) ||
        !isSha256Digest(value.provenance.transportDigest) || !Number.isSafeInteger(value.provenance.toolCallCount) ||
        !nonempty(value.provenance.helperArtifactPath) || !nonempty(value.provenance.helperArtifactRef) ||
        !isSha256Digest(value.provenance.helperArtifactDigest) ||
        !Number.isSafeInteger(value.provenance.helperArtifactByteLength) ||
        Number(value.provenance.helperArtifactByteLength) <= 0 ||
        value.provenance.toolCallCount !== 1 || !isRecord(value.provenance.helperToolInvocation) ||
        !exactKeys(value.provenance.helperToolInvocation, [
            "inputByteLength", "inputDigest", "kind", "ordinal", "schemaVersion", "toolName", "toolUseRef",
        ]) || value.provenance.helperToolInvocation.kind !== "worker_tool_invocation_evidence" ||
        value.provenance.helperToolInvocation.schemaVersion !== SCHEMA_VERSION ||
        value.provenance.helperToolInvocation.ordinal !== 0 ||
        value.provenance.helperToolInvocation.toolName !== "Bash" ||
        !nonempty(value.provenance.helperToolInvocation.toolUseRef) ||
        !isSha256Digest(value.provenance.helperToolInvocation.inputDigest) ||
        !Number.isSafeInteger(value.provenance.helperToolInvocation.inputByteLength) ||
        !isWorksiteCommandExecutionHelperPlan(value.task, value.provenance.helperPlan) ||
        value.provenance.helperToolInvocation.inputDigest !== value.provenance.helperPlan.toolInputDigest ||
        value.provenance.helperToolInvocation.inputByteLength !== value.provenance.helperPlan.toolInputByteLength ||
        value.provenance.helperArtifactPath !== value.provenance.helperPlan.artifactPath ||
        value.provenance.helperArtifactRef !== value.helperArtifactRef ||
        value.provenance.helperArtifactDigest !== value.helperArtifactDigest ||
        !Array.isArray(value.commandResults) ||
        !value.commandResults.every(isCommandResult) || !Array.isArray(value.predicateObservations) ||
        !value.predicateObservations.every(isPredicateObservation) || !isSha256Digest(value.observationDigest) ||
        !nonempty(value.observationRef) || !nonempty(value.helperArtifactRef) ||
        !isSha256Digest(value.helperArtifactDigest) || !Array.isArray(value.worksiteDelta) ||
        !value.worksiteDelta.every(isPathDelta) || !Array.isArray(value.productDelta) ||
        !value.productDelta.every(isPathDelta) || value.productDelta.length !== 0 ||
        value.worksiteDelta.some((row) => row.matchedTerritoryRef !==
            matchingWorksiteTerritoryRef(row.relativePath, value.task.allowedWriteTerritories)) ||
        !nonempty(value.snapshotRef) || !isSha256Digest(value.snapshotDigest) ||
        !Array.isArray(value.snapshotMembers) || !value.snapshotMembers.every((member, ordinal) => isExecutionSnapshotMember(value.task, member, ordinal)) ||
        value.helperArtifactRef !== identity(worksiteExecutionIdentityPrefix(value.task, "helper-artifact"), value.helperArtifactDigest) ||
        value.worksiteDelta.some((row) => row.matchedTerritoryRef === null) ||
        value.snapshotMembers.length !== worksiteExecutionSources(value.task).length ||
        value.snapshotMembers.some((member, ordinal) => {
            const protectedRow = worksiteExecutionSources(value.task)[ordinal];
            return protectedRow === undefined || !executionSnapshotSourceMatches(member, protectedRow) ||
                member.sourceObservationRef !== protectedRow.observation.observationRef ||
                member.sourceObservationDigest !== protectedRow.observation.observationDigest ||
                member.relativePath !== protectedRow.subject.relativePath ||
                member.digest !== protectedRow.observation.fileDigest ||
                member.byteLength !== protectedRow.observation.byteLength;
        }) ||
        value.snapshotRef !== identity(worksiteExecutionIdentityPrefix(value.task, "snapshot"), value.snapshotDigest) ||
        value.snapshotDigest !== sha256Canonical(value.snapshotMembers))
        return false;
    try {
        assertWorksiteCommandVectors(value.task, value.commandResults, value.predicateObservations);
        const body = {
            task: value.task,
            provenance: value.provenance,
            helperArtifactRef: value.helperArtifactRef,
            helperArtifactDigest: value.helperArtifactDigest,
            commandResults: value.commandResults,
            predicateObservations: value.predicateObservations,
            worksiteDelta: value.worksiteDelta,
            productDelta: value.productDelta,
            snapshotRef: value.snapshotRef,
            snapshotDigest: value.snapshotDigest,
            snapshotMembers: value.snapshotMembers,
        };
        const digest = sha256Canonical(body);
        return value.observationDigest === digest &&
            value.observationRef === identity(worksiteExecutionIdentityPrefix(value.task, "execution-observation"), digest);
    }
    catch {
        return false;
    }
}
export function isWorksiteCommandExecutionFailure(value) {
    return isRecord(value) && exactKeys(value, ["diagnosticRef", "failureClass", "kind", "schemaVersion"]) &&
        value.kind === "worksite_command_execution_failure" && value.schemaVersion === SCHEMA_VERSION &&
        nonempty(value.failureClass) && nonempty(value.diagnosticRef);
}
/** Product-owned rendering of exact task commands and outcome predicates. */
export function renderWorksiteCommandExecutionPrompt(task, helperPlan) {
    if (!isWorksiteExecutionTask(task) ||
        !isWorksiteCommandExecutionHelperPlan(task, helperPlan)) {
        throw new TypeError("command execution prompt requires one exact admitted task and helper plan");
    }
    return [
        "Invoke the Bash tool exactly once with the exact semantic tool-input object below. The ABI-owned helper executes every declared command in order and records its exact argv, cwd, environment, streams, exit status, reports, and protected-file observations.",
        canonicalJson({ command: helperPlan.toolCommand }),
        "Do not add timeout, run_in_background, or any other operational input field. An optional string description is metadata only. Preserve the command string exactly.",
        "Return the helper's compact task/attempt/artifact acknowledgment unchanged. The helper retains every computed command, stream, and predicate in its full artifact; do not copy, summarize, or compute those rows.",
        "Do not run any declared command directly and do not use another tool call.",
        "A nonzero subject-command exit is an observation, not a transport failure.",
        "Return only the JSON value required by the supplied schema.",
        canonicalJson({
            taskRef: task.taskRef,
            taskDigest: task.taskDigest,
            attemptRef: helperPlan.attemptRef,
            workspaceBindingIdentity: task.workspaceBinding.bindingId,
            workspaceBindingDigest: task.workspaceBinding.bindingDigest,
            ...("sourceObservedInput" in task ? { sourceObservedInput: task.sourceObservedInput } : "sourceNativeWork" in task ? { sourceNativeWorkRef: task.sourceNativeWork.observationRef,
                sourceNativeWorkDigest: task.sourceNativeWork.observationDigest } : { sourceConstructionResultRef: task.sourceConstructionResultRef,
                sourceConstructionResultDigest: task.sourceConstructionResultDigest }),
            commands: task.commands.map((row) => ({ ordinal: row.ordinal, commandId: row.commandId })),
            outcomePredicates: task.outcomePredicates.map((row) => ({
                ordinal: row.ordinal, predicateId: row.predicateId, predicateKind: row.predicateKind,
            })),
        }),
    ].join("\n\n");
}
export function worksiteCommandExecutionWorkerResultSchema(task, helperPlan) {
    if (!isWorksiteExecutionTask(task) ||
        !isWorksiteCommandExecutionHelperPlan(task, helperPlan)) {
        throw new TypeError("command result schema requires one exact task and helper plan");
    }
    return deepFreeze({
        type: "object", additionalProperties: false,
        required: [
            "kind", "schemaVersion", "taskRef", "taskDigest", "attemptRef",
            "helperArtifactRef", "helperArtifactDigest",
        ],
        properties: {
            kind: { const: "worksite_command_execution_worker_result" },
            schemaVersion: { const: SCHEMA_VERSION }, taskRef: { const: task.taskRef },
            taskDigest: { const: task.taskDigest }, attemptRef: { const: helperPlan.attemptRef },
            helperArtifactRef: {
                type: "string", pattern: `^${worksiteExecutionIdentityPrefix(task, "helper-artifact")}/[a-f0-9]{64}$`,
            },
            helperArtifactDigest: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        },
    });
}
/** F_D admission checks carrier identity only; it never judges domain success. */
export function resolveWorksiteCommandExecutionJudgmentRelation(predicateRef) {
    if (predicateRef !== WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef && predicateRef !== WORKSITE_REVISION_IDS.judgmentPredicateRef)
        return null;
    return Object.freeze({
        predicateRef,
        advanceReasonRef: "reason://abiogenesis/worksite/command-execution-observed@5",
        rejectionReasonRef: "reason://abiogenesis/worksite/command-execution-malformed@5",
        evaluate: (input, output) => (predicateRef === WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef
            ? isC2WorksiteCommandExecutionTask(input) && (isWorksiteCommandExecutionObservation(output) || isNativeWorksiteCommandExecutionObservation(output) || isObservedWorksiteCommandExecutionObservation(output))
            : isWorksiteRevisionCommandExecutionTask(input) && isWorksiteRevisionCommandExecutionObservation(output)) &&
            isWorksiteExecutionObservation(output) && same(output.task, input),
    });
}
/** Separate closed D2 rows; the existing old-row guard remains unchanged. */
function isExecutionSnapshotMember(task, value, ordinal) {
    if (task.kind === "worksite_command_execution_task")
        return isSnapshotMember(value, ordinal);
    if (task.kind === "worksite_command_forward_task") {
        const source = task.snapshotSources[ordinal];
        return source !== undefined && isRecord(value) && exactKeys(value, ["kind", "schemaVersion", "ordinal", "sourceMemberRef", "source",
            "sourceObservationRef", "sourceObservationDigest", "relativePath", "byteLength", "digest"]) &&
            value.kind === "worksite_command_forward_snapshot_member" && value.schemaVersion === SCHEMA_VERSION &&
            value.ordinal === ordinal && value.sourceMemberRef === source.sourceMemberRef && same(value.source, source.source) &&
            value.sourceObservationRef === source.observation.observationRef && value.sourceObservationDigest === source.observation.observationDigest &&
            value.relativePath === source.subject.relativePath && value.byteLength === source.observation.byteLength && value.digest === source.observation.fileDigest;
    }
    return isRecord(value) && exactKeys(value, ["kind", "schemaVersion", "ordinal", "designTargetRef", "source", "sourceObservationRef",
        "sourceObservationDigest", "relativePath", "byteLength", "digest"]) && value.kind === "worksite_revision_snapshot_member" &&
        value.schemaVersion === SCHEMA_VERSION && value.ordinal === ordinal && nonempty(value.designTargetRef) &&
        nonempty(value.sourceObservationRef) && isSha256Digest(value.sourceObservationDigest) && safeRelativePath(value.relativePath) &&
        Number.isSafeInteger(value.byteLength) && Number(value.byteLength) >= 0 && isSha256Digest(value.digest) && isRecord(value.source) &&
        (value.source.kind === "construction_member" ? exactKeys(value.source, ["kind", "sourceMemberRef"]) && nonempty(value.source.sourceMemberRef)
            : value.source.kind === "retained_dependency" && exactKeys(value.source, ["kind", "origin"]) && isWorksiteRevisionObservationOrigin(value.source.origin));
}
function executionSnapshotSourceMatches(member, row) {
    if (member.kind === "worksite_command_forward_snapshot_member")
        return "sourceMemberRef" in row && "source" in row &&
            member.sourceMemberRef === row.sourceMemberRef && same(member.source, row.source);
    return member.kind === "worksite_snapshot_member"
        ? "sourceMemberRef" in row && member.sourceMemberRef === row.sourceMemberRef
        : "designTargetRef" in row && member.designTargetRef === row.designTargetRef && same(member.source, row.source);
}
export function constructWorksiteCommandHelperArtifact(input) {
    if (!isWorksiteCommandExecutionTask(input.task))
        throw new TypeError("old C2 helper requires old C2 task");
    return constructWorksiteExecutionHelperArtifact(input);
}
export function constructWorksiteRevisionCommandHelperArtifact(input) {
    if (!isWorksiteRevisionCommandExecutionTask(input.task))
        throw new TypeError("revision C2 helper requires revision C2 task");
    return constructWorksiteExecutionHelperArtifact(input);
}
export function isWorksiteCommandHelperArtifact(task, value) {
    return isWorksiteCommandExecutionTask(task) && isWorksiteExecutionHelperArtifact(task, value);
}
export function isWorksiteRevisionCommandHelperArtifact(task, value) {
    return isWorksiteRevisionCommandExecutionTask(task) && isWorksiteExecutionHelperArtifact(task, value);
}
export function constructWorksiteCommandExecutionObservation(task, workerResult, actorObservation, helperArtifact, helperPlan) {
    if (!isWorksiteCommandExecutionTask(task))
        throw new TypeError("old C2 observation requires old C2 task");
    return constructWorksiteExecutionObservation(task, workerResult, actorObservation, helperArtifact, helperPlan);
}
export function constructWorksiteRevisionCommandExecutionObservation(task, workerResult, actorObservation, helperArtifact, helperPlan) {
    if (!isWorksiteRevisionCommandExecutionTask(task))
        throw new TypeError("revision C2 observation requires revision C2 task");
    return constructWorksiteExecutionObservation(task, workerResult, actorObservation, helperArtifact, helperPlan);
}
export function isWorksiteCommandExecutionObservation(value) {
    return isRecord(value) && value.kind === "worksite_command_execution_observation" && isWorksiteCommandExecutionTask(value.task) && isWorksiteExecutionObservation(value);
}
export function isWorksiteRevisionCommandExecutionObservation(value) {
    return isRecord(value) && value.kind === "worksite_revision_command_execution_observation" && isWorksiteExecutionObservation(value);
}
export function isWorksiteCommandForwardObservation(value) {
    return isRecord(value) && value.kind === "worksite_command_forward_observation" && isWorksiteExecutionObservation(value);
}
export function isNativeWorksiteCommandExecutionObservation(value) {
    return isRecord(value) && value.kind === "worksite_command_execution_observation" && isNativeWorksiteCommandExecutionTask(value.task) && isWorksiteExecutionObservation(value);
}
export function isObservedWorksiteCommandExecutionObservation(value) {
    return isRecord(value) && value.kind === "worksite_command_execution_observation" && isObservedWorksiteCommandExecutionTask(value.task) && isWorksiteExecutionObservation(value);
}
