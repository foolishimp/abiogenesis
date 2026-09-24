import { WORKSITE_REVISION_IDS } from "../product/worksite_revision.js";
import { WORKSITE_COMMAND_FORWARD_IDS } from "../product/worksite_command_forward_identity.js";
import { isExecutableWorksiteCommandTask as isWorksiteExecutionTask, executableWorksiteCommandSources as worksiteExecutionSources, executableWorksiteCommandLocus as worksiteExecutionLocus, executableWorksiteCommandImplementationRef as worksiteExecutionImplementationRef, executableWorksiteCommandIdentityPrefix as worksiteExecutionIdentityPrefix } from "../product/worksite_command_forward.js";
import { WORKSITE_PREPARATION_IDS, isWorksitePreparationInput, isWorksitePreparationBoundInput, selectWorksiteConstructionTask, prepareWorksiteCommandTask, } from "../product/worksite_preparation.js";
import { WORKSITE_CONSTRUCTION_IDS } from "../product/worksite_construction.js";
import { WORKSITE_BRANCH_CONSTRUCTION_IDS } from "../product/worksite_branch_construction.js";
import { lstatSync, linkSync, mkdirSync, readFileSync, readdirSync, readlinkSync, realpathSync, unlinkSync, writeFileSync, } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import { authenticateNativeInstructionAssemblyBasis } from "../abg/execution_basis.js";
import { requireWorksiteNativeInstructionAssembly, worksiteCommandExecutionAttemptRef } from "../abg/instruction_assembly.js";
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION, } from "../product/contracts.js";
import { WORKSITE_COMMAND_EXECUTION_IDS, constructWorksiteExecutionObservation, constructWorksiteCommandExecutionWorkerResult, helperArtifactPreservesProtectedObservations, isWorksiteCommandExecutionHelperPlan, isWorksiteExecutionHelperArtifact, renderWorksiteCommandExecutionPrompt, worksiteCommandExecutionHelperPlan, worksiteCommandExecutionWorkerResultSchema, projectWorksiteCommandExecutionBudget, } from "../product/worksite_command_execution.js";
import { observeWorksiteSubject } from "../product/worksite_operations.js";
import { constructWorksiteObservation, isWorksiteObservation, } from "../product/worksite_effect.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical, } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
const descriptorBody = {
    implementationRef: WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    packageName: ABI5_PACKAGE_NAME,
    packageVersion: ABI5_PACKAGE_VERSION,
    modulePath: "build/code/src/implementation/worksite_command_execution.js",
    namedSymbol: "realizeWorksiteCommandExecution",
    computeRegime: "F_P",
    inputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef,
    outputContractRef: WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,
    failureContractRef: WORKSITE_COMMAND_EXECUTION_IDS.failureContractRef,
    refusalContractRef: WORKSITE_COMMAND_EXECUTION_IDS.refusalContractRef,
};
export const WORKSITE_COMMAND_EXECUTION_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(descriptorBody),
    ...descriptorBody,
});
function exactAuthorityFreeOccurrence(occurrence, verifyNativeOccurrence) {
    const { nativeInstructionAssemblyBasis, ...coordinates } = occurrence;
    if (nativeInstructionAssemblyBasis !== undefined) {
        const owner = verifyNativeOccurrence === undefined ? authenticateNativeInstructionAssemblyBasis(nativeInstructionAssemblyBasis) : null;
        if (verifyNativeOccurrence !== undefined ? !verifyNativeOccurrence(occurrence) : owner === null ||
            owner.call.cCallRef !== occurrence.cCallRef || owner.call.runId !== occurrence.runId ||
            owner.call.graphCallId !== occurrence.graphCallId || owner.call.frameId !== occurrence.frameId ||
            owner.call.programLocusRef !== occurrence.programLocusRef || owner.call.taskOrdinal !== occurrence.taskOrdinal ||
            owner.call.attempt !== occurrence.attempt)
            throw new TypeError("C2 assembly companion differs from admitted occurrence");
    }
    const expectedKeys = [
        "attempt", "cCallRef", "executionAuthority", "frameId", "graphCallId",
        "programLocusRef", "runId", "taskOrdinal",
    ].sort().join("\0");
    if (Object.keys(coordinates).sort().join("\0") !== expectedKeys ||
        typeof occurrence.cCallRef !== "string" || occurrence.cCallRef.trim() === "" ||
        typeof occurrence.runId !== "string" || occurrence.runId.trim() === "" ||
        typeof occurrence.graphCallId !== "string" || occurrence.graphCallId.trim() === "" ||
        typeof occurrence.frameId !== "string" || occurrence.frameId.trim() === "" ||
        ![WORKSITE_COMMAND_EXECUTION_IDS.nodeRef, WORKSITE_REVISION_IDS.nodeRef, WORKSITE_COMMAND_FORWARD_IDS.nodeRef].includes(occurrence.programLocusRef) ||
        !(occurrence.taskOrdinal === null || Number.isSafeInteger(occurrence.taskOrdinal) &&
            Number(occurrence.taskOrdinal) >= 0) || !Number.isSafeInteger(occurrence.attempt) ||
        occurrence.attempt < 1 || occurrence.executionAuthority !== null) {
        throw new TypeError("command execution requires one exact authority-free C2 occurrence");
    }
    return admitIJsonValue(coordinates, "worksite command execution occurrence");
}
function constructWorksiteCommandExecutionLaunchPlan(task, rawOccurrence) {
    const occurrence = exactAuthorityFreeOccurrence(rawOccurrence);
    if (occurrence.programLocusRef !== worksiteExecutionLocus(task))
        throw new TypeError("C2 occurrence crosses task arm");
    const attemptRef = worksiteCommandExecutionAttemptRef(occurrence);
    const helperPlan = worksiteCommandExecutionHelperPlan(task, attemptRef);
    const occurrenceDigest = sha256Canonical(occurrence);
    const attemptDigest = sha256Canonical({ attemptRef });
    const attemptRoot = dirname(helperPlan.taskManifestPath);
    const launchManifestPath = resolve(attemptRoot, "launch.json");
    const body = {
        kind: "worksite_command_execution_launch_manifest",
        schemaVersion: "5.0.0",
        taskRef: task.taskRef,
        taskDigest: task.taskDigest,
        taskManifestPath: helperPlan.taskManifestPath,
        taskManifestDigest: helperPlan.taskManifestDigest,
        taskManifestByteLength: helperPlan.taskManifestByteLength,
        occurrence,
        occurrenceDigest,
        attemptRef,
        attemptDigest,
        archiveRoot: task.workspaceBinding.roots.archiveRoot,
        attemptRoot,
        launchManifestPath,
        helperModulePath: helperPlan.helperModulePath,
        implementationRef: worksiteExecutionImplementationRef(task),
        implementationBindingRef: task.kind === "worksite_command_forward_task" ? WORKSITE_COMMAND_FORWARD_IDS.implementationBindingRef
            : task.kind === "worksite_command_execution_task" ? WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef : WORKSITE_REVISION_IDS.implementationBindingRef,
        packageName: ABI5_PACKAGE_NAME,
        packageVersion: ABI5_PACKAGE_VERSION,
    };
    const launchManifestDigest = sha256Canonical(body);
    const launchManifest = deepFreeze({
        ...body,
        launchManifestRef: `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
        launchManifestDigest,
    });
    const bytes = Buffer.from(`${canonicalJson(launchManifest)}\n`, "utf8");
    return deepFreeze({
        helperPlan,
        occurrence,
        attemptDigest,
        attemptRoot,
        launchManifest,
        launchManifestPath,
        launchManifestRef: launchManifest.launchManifestRef,
        launchManifestDigest,
        launchManifestByteDigest: sha256Bytes(bytes),
        launchManifestByteLength: bytes.byteLength,
    });
}
function failure(failureClass) {
    const diagnosticRef = `diagnostic://abiogenesis/worksite/command-execution/${failureClass.replaceAll("_", "-")}@5`;
    return deepFreeze({
        kind: "leaf_realization_candidate",
        schemaVersion: "5.0.0",
        disposition: "failure",
        evidenceCandidates: [],
        resultCandidate: {
            kind: "worksite_command_execution_failure",
            schemaVersion: "5.0.0",
            failureClass,
            diagnosticRef,
        },
        diagnosticRef,
    });
}
function exactExchange(task, inputDigest, request, plan, exchange) {
    const observation = exchange.observation;
    const tool = observation.toolInvocations[0];
    return canonicalJson(exchange.request) === canonicalJson(request) &&
        observation.actorRef === task.workerActorRef &&
        observation.workerBindingRef === task.workerBindingRef &&
        observation.implementationRef === worksiteExecutionImplementationRef(task) &&
        observation.inputDigest === inputDigest &&
        observation.materializationPlanRef === request.materializationPlanRef &&
        observation.rendererRef === request.rendererRef &&
        typeof request.prompt === "string" && observation.promptDigest === sha256Canonical(request.prompt) &&
        observation.instructionContractRef === task.instructionContractRef &&
        observation.resultContractRef === task.resultContractRef &&
        observation.transportLane === "worker_executes" &&
        observation.disposition === "success" && observation.failureClass === null &&
        observation.toolCallCount === 1 && observation.toolInvocations.length === 1 &&
        tool !== undefined && tool.ordinal === 0 && tool.toolName === "Bash" &&
        tool.inputDigest === plan.toolInputDigest &&
        tool.inputByteLength === plan.toolInputByteLength;
}
function plannedCanonicalPath(path) {
    let cursor = resolve(path);
    const missing = [];
    for (;;) {
        try {
            const node = lstatSync(cursor);
            if (!node.isDirectory() && missing.length > 0) {
                throw new TypeError("workspace execution root crosses a non-directory node");
            }
            return resolve(realpathSync(cursor), ...missing);
        }
        catch (error) {
            if (error.code !== "ENOENT")
                throw error;
            const parent = dirname(cursor);
            if (parent === cursor) {
                throw new TypeError("workspace execution root has no concrete ancestor");
            }
            missing.unshift(basename(cursor));
            cursor = parent;
        }
    }
}
function assertFinalRootNotSymlink(path) {
    try {
        if (lstatSync(resolve(path)).isSymbolicLink()) {
            throw new TypeError("workspace execution root must not itself be a symlink");
        }
    }
    catch (error) {
        if (error.code !== "ENOENT")
            throw error;
    }
}
function assertCanonicalArchiveRoot(path) {
    const declared = resolve(path);
    const node = lstatSync(declared);
    if (path !== declared || node.isSymbolicLink() || !node.isDirectory() ||
        realpathSync(declared) !== declared) {
        throw new TypeError("command execution archive root must be one canonical concrete directory");
    }
}
function containsPath(root, candidate) {
    const relation = relative(root, candidate);
    return relation === "" || (!relation.startsWith("..") && !isAbsolute(relation));
}
function observeWorksiteSubjectSync(task, subject) {
    const declaredRoot = resolve(task.workspaceAuthorityBasis.canonicalRoot);
    const rootStatus = lstatSync(declaredRoot);
    if (declaredRoot !== task.workspaceAuthorityBasis.canonicalRoot ||
        rootStatus.isSymbolicLink() || !rootStatus.isDirectory() ||
        realpathSync(declaredRoot) !== declaredRoot) {
        throw new TypeError("canonical worksite root changed before Worker dispatch");
    }
    const target = resolve(declaredRoot, ...subject.relativePath.split("/"));
    if (target === declaredRoot || !containsPath(declaredRoot, target)) {
        throw new TypeError("protected subject escapes the canonical worksite root");
    }
    const protectedRoots = Object.values(task.workspaceBinding.roots)
        .map(plannedCanonicalPath);
    if (protectedRoots.some((root) => containsPath(root, target))) {
        throw new TypeError("protected subject enters a WorkspaceBinding protected root");
    }
    let cursor = declaredRoot;
    for (const [ordinal, segment] of subject.relativePath.split("/").entries()) {
        cursor = resolve(cursor, segment);
        const status = lstatSync(cursor);
        if (status.isSymbolicLink() || realpathSync(cursor) !== cursor) {
            throw new TypeError("protected subject has a symlink or physical alias");
        }
        const final = ordinal === subject.relativePath.split("/").length - 1;
        if (!final && !status.isDirectory() || final && !status.isFile()) {
            throw new TypeError("protected subject is not one concrete file");
        }
        if (final && status.nlink !== 1) {
            throw new TypeError("protected subject has a hard-link alias");
        }
    }
    const status = lstatSync(target);
    const bytes = readFileSync(target);
    const observation = constructWorksiteObservation({
        subject,
        state: "file",
        fileIdentity: `${status.dev}:${status.ino}`,
        fileDigest: sha256Bytes(bytes),
        byteLength: bytes.byteLength,
    });
    if (!isWorksiteObservation(observation)) {
        throw new TypeError("protected subject observation could not be constructed");
    }
    return observation;
}
export function installedProductInventoryDigest(rootValue) {
    const root = resolve(rootValue);
    const rootStatus = lstatSync(root);
    if (root !== rootValue || rootStatus.isSymbolicLink() ||
        !rootStatus.isDirectory() || realpathSync(root) !== root) {
        throw new TypeError("installed Product root must remain canonical");
    }
    const rows = [];
    const visit = (directory, relativeDirectory) => {
        const entries = readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name));
        for (const entry of entries) {
            const relativePath = relativeDirectory.length === 0
                ? entry.name
                : `${relativeDirectory}/${entry.name}`;
            const path = resolve(directory, entry.name);
            const status = lstatSync(path);
            if (status.isSymbolicLink()) {
                const target = readlinkSync(path);
                rows.push({
                    relativePath,
                    nodeKind: "symlink",
                    symlinkTarget: target,
                    byteLength: null,
                    digest: sha256Bytes(Buffer.from(target, "utf8")),
                    fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
                });
            }
            else if (status.isDirectory()) {
                rows.push({
                    relativePath,
                    nodeKind: "directory",
                    symlinkTarget: null,
                    byteLength: null,
                    digest: sha256Bytes(Buffer.from("directory", "utf8")),
                    fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
                });
                visit(path, relativePath);
            }
            else if (status.isFile()) {
                const bytes = readFileSync(path);
                rows.push({
                    relativePath,
                    nodeKind: "file",
                    symlinkTarget: null,
                    byteLength: bytes.byteLength,
                    digest: sha256Bytes(bytes),
                    fileIdentity: `${status.dev}:${status.ino}:${status.nlink}`,
                });
            }
            else {
                throw new TypeError("installed Product inventory encountered a special node");
            }
        }
    };
    visit(root, "");
    return sha256Canonical(rows);
}
function assertArchiveExecutionBoundary(task, plan) {
    for (const root of Object.values(task.workspaceBinding.roots)) {
        assertFinalRootNotSymlink(root);
    }
    assertCanonicalArchiveRoot(task.workspaceBinding.roots.archiveRoot);
    const productRoot = plannedCanonicalPath(task.workspaceBinding.roots.productRoot);
    const archiveRoot = plannedCanonicalPath(task.workspaceBinding.roots.archiveRoot);
    const nonProductRoots = [
        task.workspaceBinding.roots.productRoot,
        task.workspaceBinding.roots.toolchainRoot,
        task.workspaceBinding.roots.eventLogRoot,
        task.workspaceBinding.roots.runtimeStateRoot,
        task.workspaceBinding.roots.projectionRoot,
    ].map(plannedCanonicalPath);
    if (nonProductRoots.some((root) => containsPath(root, archiveRoot) || containsPath(archiveRoot, root))) {
        throw new TypeError("command execution archive root overlaps a protected workspace root");
    }
    const otherMutableRoots = [
        task.workspaceBinding.roots.eventLogRoot,
        task.workspaceBinding.roots.runtimeStateRoot,
        task.workspaceBinding.roots.projectionRoot,
        task.workspaceBinding.roots.toolchainRoot,
    ].map(plannedCanonicalPath);
    if (otherMutableRoots.some((root) => containsPath(productRoot, root))) {
        throw new TypeError("command execution workspace mechanics overlap the Product root");
    }
    for (const path of [
        plan.attemptRoot,
        plan.helperPlan.taskManifestPath,
        plan.launchManifestPath,
        plan.helperPlan.artifactPath,
        plan.helperPlan.sandboxRoot,
    ]) {
        const lexicalRelation = relative(resolve(task.workspaceBinding.roots.archiveRoot), resolve(path));
        const canonicalCandidate = plannedCanonicalPath(path);
        const canonicalLexicalCandidate = resolve(archiveRoot, lexicalRelation);
        if (lexicalRelation === "" || lexicalRelation.startsWith("..") ||
            isAbsolute(lexicalRelation) || !containsPath(archiveRoot, canonicalCandidate) ||
            canonicalCandidate !== canonicalLexicalCandidate) {
            throw new TypeError("command execution attempt path escapes its archive root");
        }
    }
}
function assertExistingCanonicalNode(path, expectedKind) {
    if (!isAbsolute(path) || resolve(path) !== path) {
        throw new TypeError("command execution path must be absolute and lexical-canonical");
    }
    const node = lstatSync(path);
    if (node.isSymbolicLink() ||
        realpathSync(path) !== path ||
        (expectedKind === "directory" ? !node.isDirectory() : !node.isFile())) {
        throw new TypeError(`command execution path must be one concrete ${expectedKind}`);
    }
}
function launchManifestBytes(plan) {
    return Buffer.from(`${canonicalJson(plan.launchManifest)}\n`, "utf8");
}
function taskManifestBytes(task) {
    return Buffer.from(`${canonicalJson(task)}\n`, "utf8");
}
function sameFilesystemNode(leftPath, rightPath) {
    const left = lstatSync(leftPath);
    const right = lstatSync(rightPath);
    return left.dev === right.dev && left.ino === right.ino;
}
function publishCreateOnly(path, bytes, label) {
    const temporaryPath = `${path}.tmp-${String(process.pid)}`;
    writeFileSync(temporaryPath, bytes, { flag: "wx" });
    try {
        linkSync(temporaryPath, path);
    }
    finally {
        unlinkSync(temporaryPath);
    }
    assertExistingCanonicalNode(path, "file");
    if (lstatSync(path).nlink !== 1 || !readFileSync(path).equals(bytes)) {
        throw new TypeError(`${label} publication changed identity or bytes`);
    }
}
function assertManifestPairCurrent(task, occurrence, plan) {
    const expectedPlan = constructWorksiteCommandExecutionLaunchPlan(task, occurrence);
    const taskBytes = taskManifestBytes(task);
    const launchBytes = launchManifestBytes(plan);
    if (!isWorksiteCommandExecutionHelperPlan(task, plan.helperPlan) ||
        canonicalJson(plan) !==
            canonicalJson(expectedPlan) ||
        plan.launchManifest.taskRef !== task.taskRef ||
        plan.launchManifest.taskDigest !== task.taskDigest ||
        plan.launchManifest.taskManifestPath !== plan.helperPlan.taskManifestPath ||
        plan.launchManifest.taskManifestDigest !== plan.helperPlan.taskManifestDigest ||
        plan.launchManifest.taskManifestByteLength !== plan.helperPlan.taskManifestByteLength ||
        taskBytes.byteLength !== plan.helperPlan.taskManifestByteLength ||
        sha256Bytes(taskBytes) !== plan.helperPlan.taskManifestDigest ||
        launchBytes.byteLength !== plan.launchManifestByteLength ||
        sha256Bytes(launchBytes) !== plan.launchManifestByteDigest ||
        plan.launchManifest.launchManifestRef !== plan.launchManifestRef ||
        plan.launchManifest.launchManifestDigest !== plan.launchManifestDigest) {
        throw new TypeError("command execution manifests differ from their exact plan");
    }
    assertArchiveExecutionBoundary(task, plan);
    assertExistingCanonicalNode(plan.attemptRoot, "directory");
    assertExistingCanonicalNode(plan.helperPlan.taskManifestPath, "file");
    assertExistingCanonicalNode(plan.launchManifestPath, "file");
    if (plan.helperPlan.taskManifestPath === plan.launchManifestPath ||
        sameFilesystemNode(plan.helperPlan.taskManifestPath, plan.launchManifestPath) ||
        lstatSync(plan.helperPlan.taskManifestPath).nlink !== 1 ||
        lstatSync(plan.launchManifestPath).nlink !== 1) {
        throw new TypeError("command execution manifests must be distinct single-linked files");
    }
    const observedTask = readFileSync(plan.helperPlan.taskManifestPath);
    const observedLaunch = readFileSync(plan.launchManifestPath);
    if (!observedTask.equals(taskBytes) || !observedLaunch.equals(launchBytes) ||
        observedTask.byteLength !== plan.helperPlan.taskManifestByteLength ||
        sha256Bytes(observedTask) !== plan.helperPlan.taskManifestDigest ||
        observedLaunch.byteLength !== plan.launchManifestByteLength ||
        sha256Bytes(observedLaunch) !== plan.launchManifestByteDigest) {
        throw new TypeError("command execution manifest publication changed bytes");
    }
}
function materializeExecutionManifests(task, occurrence, plan) {
    const taskBytes = taskManifestBytes(task);
    const launchBytes = launchManifestBytes(plan);
    mkdirSync(plan.attemptRoot, { recursive: true });
    assertArchiveExecutionBoundary(task, plan);
    assertExistingCanonicalNode(plan.attemptRoot, "directory");
    publishCreateOnly(plan.helperPlan.taskManifestPath, taskBytes, "command task manifest");
    assertExistingCanonicalNode(plan.helperPlan.taskManifestPath, "file");
    if (lstatSync(plan.helperPlan.taskManifestPath).nlink !== 1 ||
        !readFileSync(plan.helperPlan.taskManifestPath).equals(taskBytes)) {
        throw new TypeError("command task manifest is not current before launch readiness");
    }
    publishCreateOnly(plan.launchManifestPath, launchBytes, "command launch manifest");
    assertManifestPairCurrent(task, occurrence, plan);
}
function manifestPairIsCurrent(task, occurrence, plan) {
    try {
        assertManifestPairCurrent(task, occurrence, plan);
        return true;
    }
    catch {
        return false;
    }
}
export function selectedWorksiteCommandExecutionLimits() {
    return { absoluteTimeoutMs: Number(process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS ?? "3600000"),
        inactivityTimeoutMs: Number(process.env.ABG_TS_FP_TIMEOUT_MS ?? "60000") };
}
export function realizeWorksiteCommandExecution(input, occurrence, prepareAssembly, verifyNativeOccurrence) {
    if (!isWorksiteExecutionTask(input)) {
        throw new TypeError("command execution requires one exact admitted task");
    }
    const c2Occurrence = exactAuthorityFreeOccurrence(occurrence, verifyNativeOccurrence);
    const { absoluteTimeoutMs: configuredAbsoluteTimeout, inactivityTimeoutMs: configuredInactivityTimeout } = selectedWorksiteCommandExecutionLimits();
    const requiredBudget = projectWorksiteCommandExecutionBudget(input).requiredExecutionBudgetMs;
    if (!Number.isSafeInteger(configuredInactivityTimeout) ||
        configuredInactivityTimeout <= requiredBudget) {
        throw new TypeError("actor inactivity timeout must exceed the task's closed helper execution budget");
    }
    if (!Number.isSafeInteger(configuredAbsoluteTimeout) ||
        configuredAbsoluteTimeout <= requiredBudget ||
        configuredAbsoluteTimeout <= configuredInactivityTimeout) {
        throw new TypeError("actor absolute timeout must exceed the task's closed helper execution budget");
    }
    const inputDigest = sha256Canonical(input);
    const launchPlan = constructWorksiteCommandExecutionLaunchPlan(input, c2Occurrence);
    const helperPlan = launchPlan.helperPlan;
    const nativeAssembly = occurrence.nativeInstructionAssemblyBasis === undefined ? null
        : (prepareAssembly === undefined ? requireWorksiteNativeInstructionAssembly(occurrence.nativeInstructionAssemblyBasis, input) : prepareAssembly());
    const before = worksiteExecutionSources(input).map((row) => observeWorksiteSubjectSync(input, row.subject));
    if (before.some((observation, ordinal) => canonicalJson(observation) !== canonicalJson(worksiteExecutionSources(input)[ordinal].observation))) {
        throw new TypeError("protected worksite observation changed before Worker dispatch");
    }
    const productInventoryBefore = installedProductInventoryDigest(input.workspaceBinding.roots.productRoot);
    assertArchiveExecutionBoundary(input, launchPlan);
    materializeExecutionManifests(input, c2Occurrence, launchPlan);
    const workerRequest = nativeAssembly?.request ?? deepFreeze({
        actorRef: input.workerActorRef,
        workerBindingRef: input.workerBindingRef,
        implementationRef: worksiteExecutionImplementationRef(input),
        inputDigest,
        materializationPlanRef: input.materializationPlanRef,
        rendererRef: input.rendererRef,
        instructionContractRef: input.instructionContractRef,
        resultContractRef: input.resultContractRef,
        transportLane: input.transportLane,
        prompt: renderWorksiteCommandExecutionPrompt(input, helperPlan),
        responseJsonSchema: worksiteCommandExecutionWorkerResultSchema(input, helperPlan),
    });
    return deepFreeze({
        kind: "prepared_probabilistic_leaf_invocation",
        schemaVersion: "5.0.0",
        workerRequest,
        async complete(exchange) {
            const current = await Promise.all(worksiteExecutionSources(input).map((row) => observeWorksiteSubject(input.workspaceAuthorityBasis, input.workspaceBinding, row.subject)));
            if (current.some((row, ordinal) => canonicalJson(row) !== canonicalJson(worksiteExecutionSources(input)[ordinal].observation))) {
                return failure("protected_observation_mismatch");
            }
            let productInventoryAfter;
            try {
                productInventoryAfter = installedProductInventoryDigest(input.workspaceBinding.roots.productRoot);
            }
            catch {
                return failure("product_inventory_mismatch");
            }
            if (productInventoryAfter !== productInventoryBefore) {
                return failure("product_inventory_mismatch");
            }
            if (!exactExchange(input, inputDigest, workerRequest, helperPlan, exchange))
                return failure("transport_identity_mismatch");
            if (!manifestPairIsCurrent(input, c2Occurrence, launchPlan)) {
                return failure("helper_manifest_mismatch");
            }
            let helperValue;
            let helperBytes;
            try {
                assertArchiveExecutionBoundary(input, launchPlan);
                assertExistingCanonicalNode(helperPlan.sandboxRoot, "directory");
                assertExistingCanonicalNode(helperPlan.artifactPath, "file");
                if (lstatSync(helperPlan.artifactPath).nlink !== 1 ||
                    sameFilesystemNode(helperPlan.artifactPath, helperPlan.taskManifestPath) ||
                    sameFilesystemNode(helperPlan.artifactPath, launchPlan.launchManifestPath)) {
                    throw new TypeError("helper artifact must be one distinct single-linked file");
                }
                helperBytes = readFileSync(helperPlan.artifactPath);
                helperValue = JSON.parse(helperBytes.toString("utf8"));
            }
            catch {
                return failure("helper_artifact_absent");
            }
            if (!isWorksiteExecutionHelperArtifact(input, helperValue)) {
                return failure("helper_artifact_contract_failure");
            }
            const canonicalHelperBytes = Buffer.from(`${canonicalJson(helperValue)}\n`, "utf8");
            if (!helperBytes.equals(canonicalHelperBytes)) {
                return failure("helper_artifact_contract_failure");
            }
            if (helperValue.disposition !== "success") {
                return failure(`helper_${helperValue.disposition}`);
            }
            let rawValue;
            try {
                rawValue = JSON.parse(exchange.observation.finalOutput);
            }
            catch {
                return failure("result_contract_failure");
            }
            let workerResult;
            try {
                workerResult = constructWorksiteCommandExecutionWorkerResult(input, rawValue, helperPlan);
            }
            catch {
                return failure("result_contract_failure");
            }
            if (!helperArtifactPreservesProtectedObservations(input, helperValue)) {
                return failure("protected_observation_mismatch");
            }
            let observation;
            try {
                observation = constructWorksiteExecutionObservation(input, workerResult, exchange.observation, helperValue, helperPlan);
            }
            catch {
                return failure("result_contract_failure");
            }
            return deepFreeze({
                kind: "leaf_realization_candidate",
                schemaVersion: "5.0.0",
                disposition: "success",
                evidenceCandidates: [],
                resultCandidate: observation,
            });
        },
    });
}
function preparationDescriptor(implementationRef, namedSymbol, inputContractRef, outputContractRef) {
    const body = { ...descriptorBody, implementationRef, namedSymbol, computeRegime: "F_D", inputContractRef, outputContractRef };
    return deepFreeze({ kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0",
        descriptorDigest: sha256Canonical(body), ...body });
}
export const WORKSITE_PREPARATION_SELECT_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_PREPARATION_IDS.selectImplementationRef, "selectWorksiteConstruction", WORKSITE_PREPARATION_IDS.inputContractRef, WORKSITE_CONSTRUCTION_IDS.taskContractRef);
export const WORKSITE_PREPARATION_COMMAND_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_PREPARATION_IDS.prepareImplementationRef, "prepareWorksiteCommands", WORKSITE_PREPARATION_IDS.boundInputContractRef, WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef);
export const WORKSITE_PREPARATION_BRANCH_SELECT_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_PREPARATION_IDS.selectBranchImplementationRef, "selectWorksiteBranchConstruction", WORKSITE_PREPARATION_IDS.branchInputContractRef, WORKSITE_BRANCH_CONSTRUCTION_IDS.taskContractRef);
export const WORKSITE_PREPARATION_BRANCH_COMMAND_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_PREPARATION_IDS.prepareBranchImplementationRef, "prepareWorksiteBranchCommands", WORKSITE_PREPARATION_IDS.branchBoundInputContractRef, WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef);
function realizePreparation(input, implementationRef, selection, branch, revision = false) {
    try {
        const admitted = selection ? isWorksitePreparationInput(input) : isWorksitePreparationBoundInput(input);
        const kind = typeof input === "object" && input !== null && "kind" in input ? input.kind : null;
        const expectedKind = revision ? selection ? "worksite_revision_command_preparation_input" : "worksite_revision_command_preparation_bound_input" : selection
            ? branch ? "worksite_branch_command_preparation_input" : "worksite_command_preparation_input"
            : branch ? "worksite_branch_command_preparation_bound_input" : "worksite_command_preparation_bound_input";
        if (!admitted || kind !== expectedKind)
            throw new TypeError("preparation input does not match its declared leaf");
        const resultCandidate = (selection && isWorksitePreparationInput(input) ? selectWorksiteConstructionTask(input)
            : !selection && isWorksitePreparationBoundInput(input) ? prepareWorksiteCommandTask(input) : null);
        if (resultCandidate === null)
            throw new TypeError("preparation result absent");
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0",
            disposition: "success",
            evidenceCandidates: [{ kind: "deterministic_evidence_candidate", schemaVersion: "5.0.0",
                    implementationRef, inputDigest: sha256Canonical(input), outputDigest: sha256Canonical(resultCandidate) }], resultCandidate });
    }
    catch {
        const diagnosticRef = "diagnostic://abiogenesis/worksite/command-execution/preparation-invalid@5";
        return deepFreeze({ kind: "leaf_realization_candidate", schemaVersion: "5.0.0",
            disposition: "failure", evidenceCandidates: [], diagnosticRef,
            resultCandidate: { kind: "worksite_command_execution_failure", schemaVersion: "5.0.0", failureClass: "preparation_invalid", diagnosticRef } });
    }
}
export function selectWorksiteConstruction(input) {
    return realizePreparation(input, WORKSITE_PREPARATION_IDS.selectImplementationRef, true, false);
}
export function prepareWorksiteCommands(input) {
    return realizePreparation(input, WORKSITE_PREPARATION_IDS.prepareImplementationRef, false, false);
}
export function selectWorksiteBranchConstruction(input) {
    return realizePreparation(input, WORKSITE_PREPARATION_IDS.selectBranchImplementationRef, true, true);
}
export function prepareWorksiteBranchCommands(input) {
    return realizePreparation(input, WORKSITE_PREPARATION_IDS.prepareBranchImplementationRef, false, true);
}
const revisionDescriptorBody = { ...descriptorBody, implementationRef: WORKSITE_REVISION_IDS.implementationRef,
    namedSymbol: "realizeWorksiteRevisionCommandExecution", inputContractRef: WORKSITE_REVISION_IDS.taskContractRef,
    outputContractRef: WORKSITE_REVISION_IDS.observationContractRef };
export const WORKSITE_REVISION_COMMAND_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
    kind: "packaged_leaf_implementation_descriptor", schemaVersion: "5.0.0",
    descriptorDigest: sha256Canonical(revisionDescriptorBody), ...revisionDescriptorBody,
});
export const WORKSITE_REVISION_SELECT_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_REVISION_IDS.selectImplementationRef, "selectWorksiteRevisionConstruction", WORKSITE_REVISION_IDS.inputContractRef, WORKSITE_CONSTRUCTION_IDS.taskContractRef);
export const WORKSITE_REVISION_PREPARE_IMPLEMENTATION_DESCRIPTOR = preparationDescriptor(WORKSITE_REVISION_IDS.prepareImplementationRef, "prepareWorksiteRevisionCommands", WORKSITE_REVISION_IDS.boundInputContractRef, WORKSITE_REVISION_IDS.taskContractRef);
export function selectWorksiteRevisionConstruction(input) {
    return realizePreparation(input, WORKSITE_REVISION_IDS.selectImplementationRef, true, false, true);
}
export function prepareWorksiteRevisionCommands(input) {
    return realizePreparation(input, WORKSITE_REVISION_IDS.prepareImplementationRef, false, false, true);
}
export const realizeWorksiteRevisionCommandExecution = realizeWorksiteCommandExecution;
