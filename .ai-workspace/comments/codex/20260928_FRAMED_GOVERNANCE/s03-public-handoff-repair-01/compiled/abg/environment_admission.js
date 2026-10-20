import { constructProductSet, isProductInstallCandidate, isWorkspaceAuthorityBasis, isWorkspaceBindingCandidate, } from "../product/index.js";
import { constructWorkspaceBindingInResolvedLock, isProductInstallCandidateInResolvedLock, isWorkspaceBindingCandidateInResolvedLock, } from "../product/environment.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationInvocationCoordinate, } from "../shared/operation_definition_coordinate.js";
import { projectExactPrefixArtifactTruth, runtimePrefixFromArtifactTruth, prepareArtifactTruthCandidate, validateArtifactTruthProjectionValue, } from "./artifact_truth.js";
import { projectEffectfulPublicInvocationTruthAtPrefix, } from "./effectful_invocation_truth.js";
import { appendCheckedArtifactEvent, assertHeldEventStoreAtDurablePrefix, projectRuntimeEventFromValidatedHistory, } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix, runtimePrefixComputation, } from "./event_prefix.js";
function refusal(code, message) {
    return {
        kind: "abg_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function duplicateInvocationRefusal(held) {
    return deepFreeze({
        kind: "abg_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: "duplicate_invocation",
        message: "the effectful invocation identity already has one admitted durable fact",
        priorAdmission: held,
    });
}
function artifactMemberKey(operationId) {
    return operationId === "abg.operation.product.install" ? "install" : "bind";
}
function selectExactArtifactTruthRow(projection, identity) {
    if (!validateArtifactTruthProjectionValue(projection))
        return null;
    return selectArtifactTruthRow(projection.rows, identity);
}
// Pure row relations below consume the immutable owner projection selected at
// the surrounding boundary. They neither authenticate nor acquire a prefix.
function selectArtifactTruthRow(rows, identity) {
    const scopeRows = rows.filter((row) => row.operationId === identity.operationId &&
        row.authorityScopeRef === identity.authorityScopeRef);
    if (scopeRows.length !== 1)
        return null;
    const row = scopeRows[0];
    const exact = row.memberKey === artifactMemberKey(identity.operationId) &&
        isSha256Digest(row.definitionDigest) &&
        row.authorityScopeDigest === identity.authorityScopeDigest &&
        row.artifactRef === identity.artifactRef &&
        row.artifactDigest === identity.artifactDigest &&
        (identity.invocationRef === undefined ||
            row.invocationRef === identity.invocationRef);
    return exact && (identity.admissionEventRef === undefined ||
        row.admissionEventRef === identity.admissionEventRef) ? row : null;
}
function selectExactArtifactTruthRowByInvocation(projection, operationId, invocationRef) {
    if (!validateArtifactTruthProjectionValue(projection) ||
        invocationRef.length === 0)
        return null;
    return selectArtifactTruthRowByInvocation(projection.rows, operationId, invocationRef);
}
function selectArtifactTruthRowByInvocation(rows, operationId, invocationRef) {
    if (invocationRef.length === 0)
        return null;
    const matches = rows.filter((row) => row.operationId === operationId && row.invocationRef === invocationRef);
    if (matches.length !== 1)
        return null;
    const row = matches[0];
    return row.memberKey === artifactMemberKey(operationId) &&
        isSha256Digest(row.definitionDigest)
        ? row
        : null;
}
function rehydrateProductInstallRow(projection, row) {
    if (!validateArtifactTruthProjectionValue(projection))
        return null;
    return rehydrateProductInstallRowFromRows(projection.rows, row);
}
function rehydrateProductInstallRowFromRows(rows, row) {
    // Every caller acquired/validated this complete projection before selecting
    // its row. Artifact truth already established the embedded or causal lock.
    const resolvedLock = row.resolvedLock;
    if (row.operationId !== "abg.operation.product.install" ||
        !isProductInstallCandidateInResolvedLock(row.artifact, resolvedLock))
        return null;
    const candidate = row.artifact;
    if (selectArtifactTruthRow(rows, {
        operationId: "abg.operation.product.install",
        authorityScopeRef: candidate.installId,
        authorityScopeDigest: candidate.productContentDigest,
        artifactRef: candidate.installId,
        artifactDigest: sha256Canonical(candidate),
        invocationRef: row.invocationRef,
        admissionEventRef: row.admissionEventRef,
    }) === null)
        return null;
    const { kind: _kind, disposition: _disposition, ...body } = candidate;
    return deepFreeze({
        candidate,
        install: {
            kind: "product_install",
            disposition: "admitted",
            ...body,
            admissionEventRef: row.admissionEventRef,
        },
        resolvedLock,
        invocationRef: row.invocationRef,
    });
}
export function projectAdmittedProductInstallByInvocationRef(projection, invocationRef) {
    const row = selectExactArtifactTruthRowByInvocation(projection, "abg.operation.product.install", invocationRef);
    return row === null ? null : rehydrateProductInstallRow(projection, row);
}
export function projectAdmittedProductInstallByAdmissionEventRef(projection, admissionEventRef) {
    if (!validateArtifactTruthProjectionValue(projection) ||
        admissionEventRef.length === 0)
        return null;
    const matches = projection.rows.filter((row) => row.operationId === "abg.operation.product.install" &&
        row.admissionEventRef === admissionEventRef);
    return matches.length === 1
        ? rehydrateProductInstallRow(projection, matches[0])
        : null;
}
export function projectAdmittedWorkspaceProductInstall(projection, workspaceBindingId, installId) {
    if (!validateArtifactTruthProjectionValue(projection) ||
        workspaceBindingId.length === 0 ||
        installId.length === 0)
        return null;
    const installRows = projection.rows.filter((row) => row.operationId === "abg.operation.product.install" &&
        row.authorityScopeRef === installId &&
        row.artifactRef === installId);
    if (installRows.length !== 1)
        return null;
    const install = rehydrateProductInstallRow(projection, installRows[0]);
    if (install === null)
        return null;
    const workspaceRows = projection.rows.filter((row) => row.operationId === "abg.operation.workspace.bind" &&
        row.authorityScopeRef === workspaceBindingId &&
        row.artifactRef === workspaceBindingId &&
        row.causationEventRefs.includes(install.install.admissionEventRef));
    return workspaceRows.length === 1 ? install : null;
}
export function projectAdmittedWorkspaceBindingByInvocationRef(projection, invocationRef, resolvedLock) {
    const row = selectExactArtifactTruthRowByInvocation(projection, "abg.operation.workspace.bind", invocationRef);
    if (!validateArtifactTruthProjectionValue(projection))
        return null;
    return rehydrateWorkspaceBindingRow(projection.rows, row, invocationRef, resolvedLock);
}
function rehydrateWorkspaceBindingRow(rows, row, invocationRef, resolvedLock, productSet, workspaceAuthorityBasis, checkCandidate = isWorkspaceBindingCandidate) {
    if (row === null ||
        !checkCandidate(row.artifact, resolvedLock, productSet, workspaceAuthorityBasis))
        return null;
    const candidate = row.artifact;
    if (selectArtifactTruthRow(rows, {
        operationId: "abg.operation.workspace.bind",
        authorityScopeRef: candidate.bindingId,
        authorityScopeDigest: candidate.bindingDigest,
        artifactRef: candidate.bindingId,
        artifactDigest: candidate.bindingDigest,
        invocationRef,
        admissionEventRef: row.admissionEventRef,
    }) === null)
        return null;
    const { kind: _kind, ...body } = candidate;
    return deepFreeze({
        candidate,
        binding: {
            kind: "workspace_binding",
            ...body,
            admissionEventRef: row.admissionEventRef,
        },
        installAdmissionEventRefs: [...row.causationEventRefs],
        invocationRef,
    });
}
function exactPrefixEnvironmentRefusal(code, message, eventRefs = []) {
    return deepFreeze({
        kind: "exact_prefix_workspace_environment_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
        eventRefs: [...new Set(eventRefs)],
    });
}
/**
 * Pure exact-prefix projection of the one admitted workspace environment.
 * Event meaning remains owned by artifact truth; Product reconstructs the
 * lock-bound ProductSet and revalidates the binding candidate.
 */
export function projectExactPrefixWorkspaceEnvironment(prefix, workspaceBindingCoordinate) {
    const artifactTruth = projectExactPrefixArtifactTruth(prefix);
    if (artifactTruth.kind !== "exact_prefix_artifact_truth_projection") {
        return exactPrefixEnvironmentRefusal("artifact_truth_invalid", `exact-prefix artifact truth refused the durable prefix: ${artifactTruth.code}`, artifactTruth.eventRefs);
    }
    return projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, workspaceBindingCoordinate);
}
/** Pure environment relation over the already authenticated owner projection. */
export function projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth, workspaceBindingCoordinate) {
    if (!validateArtifactTruthProjectionValue(artifactTruth))
        return exactPrefixEnvironmentRefusal("artifact_truth_invalid", "workspace environment requires authenticated artifact truth");
    const prefix = artifactTruth.prefix;
    if (typeof workspaceBindingCoordinate !== "object" ||
        workspaceBindingCoordinate === null ||
        typeof workspaceBindingCoordinate.ref !== "string" ||
        workspaceBindingCoordinate.ref.length === 0 ||
        !isSha256Digest(workspaceBindingCoordinate.digest)) {
        return exactPrefixEnvironmentRefusal("workspace_binding_coordinate_invalid", "workspace environment projection requires one exact WorkspaceBinding ref and digest");
    }
    const ownerPrefix = runtimePrefixFromArtifactTruth(artifactTruth);
    const key = `${artifactTruth.projectionDigest}:${workspaceBindingCoordinate.ref}:${workspaceBindingCoordinate.digest}`;
    const facts = ownerPrefix === null ? null : runtimePrefixComputation(ownerPrefix, WORKSPACE_ENVIRONMENTS, () => new Map());
    const retained = facts?.get(key);
    if (retained !== undefined)
        return retained;
    const result = deriveWorkspaceEnvironment(artifactTruth, workspaceBindingCoordinate);
    facts?.set(key, result);
    return result;
}
const WORKSPACE_ENVIRONMENTS = Symbol("exact_workspace_environment_derivations");
function deriveWorkspaceEnvironment(artifactTruth, workspaceBindingCoordinate) {
    const prefix = artifactTruth.prefix;
    const bindingRow = selectArtifactTruthRow(artifactTruth.rows, {
        operationId: "abg.operation.workspace.bind",
        authorityScopeRef: workspaceBindingCoordinate.ref,
        authorityScopeDigest: workspaceBindingCoordinate.digest,
        artifactRef: workspaceBindingCoordinate.ref,
        artifactDigest: workspaceBindingCoordinate.digest,
    });
    if (bindingRow === null) {
        const bindingRefExists = artifactTruth.rows.some((row) => row.operationId === "abg.operation.workspace.bind" &&
            row.authorityScopeRef === workspaceBindingCoordinate.ref &&
            row.artifactRef === workspaceBindingCoordinate.ref);
        return exactPrefixEnvironmentRefusal(bindingRefExists
            ? "workspace_binding_mismatch"
            : "workspace_binding_missing", bindingRefExists
            ? "the selected WorkspaceBinding digest differs from admitted artifact truth"
            : "the durable prefix contains no admitted WorkspaceBinding at the selected ref");
    }
    if (!isWorkspaceAuthorityBasis(bindingRow.workspaceAuthorityBasis)) {
        return exactPrefixEnvironmentRefusal("workspace_authority_invalid", "the admitted WorkspaceBinding lacks its exact Product-valid authority basis", [bindingRow.admissionEventRef]);
    }
    const productInstalls = [];
    const resolvedLocks = [];
    for (const eventRef of bindingRow.causationEventRefs) {
        const matches = artifactTruth.rows.filter(row => row.operationId === "abg.operation.product.install" && row.admissionEventRef === eventRef);
        const truth = matches.length === 1
            ? rehydrateProductInstallRowFromRows(artifactTruth.rows, matches[0]) : null;
        if (truth === null) {
            return exactPrefixEnvironmentRefusal("causal_install_missing", "the admitted WorkspaceBinding lacks one exact causal ProductInstall", [bindingRow.admissionEventRef, eventRef]);
        }
        productInstalls.push(truth.install);
        resolvedLocks.push(truth.resolvedLock);
    }
    const resolvedProductLock = resolvedLocks[0];
    if (resolvedProductLock === undefined ||
        resolvedLocks.some((lock) => canonicalJson(lock) !==
            canonicalJson(resolvedProductLock))) {
        return exactPrefixEnvironmentRefusal("causal_lock_mismatch", "the causal ProductInstall set does not reproduce one exact ResolvedProductLock", bindingRow.causationEventRefs);
    }
    const productSet = constructProductSet(productInstalls, resolvedProductLock);
    if (productSet.kind !== "product_set") {
        return exactPrefixEnvironmentRefusal("product_set_invalid", "Product refused the exact causal ProductInstall set and resolved lock", bindingRow.causationEventRefs);
    }
    const bindingTruth = rehydrateWorkspaceBindingRow(artifactTruth.rows, selectArtifactTruthRowByInvocation(artifactTruth.rows, "abg.operation.workspace.bind", bindingRow.invocationRef), bindingRow.invocationRef, resolvedProductLock, productSet, bindingRow.workspaceAuthorityBasis, isWorkspaceBindingCandidateInResolvedLock);
    if (bindingTruth === null ||
        canonicalJson(bindingTruth.installAdmissionEventRefs) !== canonicalJson(bindingRow.causationEventRefs)) {
        return exactPrefixEnvironmentRefusal("workspace_binding_invalid", "the admitted WorkspaceBinding differs from its causal Product environment", [bindingRow.admissionEventRef]);
    }
    return deepFreeze({
        kind: "exact_prefix_workspace_environment",
        schemaVersion: "5.0.0",
        prefix,
        artifactTruth,
        workspaceAuthorityBasis: bindingRow.workspaceAuthorityBasis,
        workspaceBindingCandidate: bindingTruth.candidate,
        workspaceBinding: bindingTruth.binding,
        productInstalls,
        resolvedProductLock,
        productSet,
    });
}
export function hasAdmittedProductInstall(projection, install) {
    const { kind: _kind, disposition: _disposition, admissionEventRef: _admissionEventRef, ...body } = install;
    const candidate = {
        kind: "product_install_candidate",
        disposition: "materialized",
        ...body,
    };
    return selectExactArtifactTruthRow(projection, {
        operationId: "abg.operation.product.install",
        authorityScopeRef: install.installId,
        authorityScopeDigest: install.productContentDigest,
        artifactRef: install.installId,
        artifactDigest: sha256Canonical(candidate),
        admissionEventRef: install.admissionEventRef,
    }) !== null;
}
export function projectAdmittedProductInstall(projection, candidate, invocationRef) {
    const candidateDigest = sha256Canonical(candidate);
    const row = selectExactArtifactTruthRow(projection, {
        operationId: "abg.operation.product.install",
        authorityScopeRef: candidate.installId,
        authorityScopeDigest: candidate.productContentDigest,
        artifactRef: candidate.installId,
        artifactDigest: candidateDigest,
        ...(invocationRef === undefined ? {} : { invocationRef }),
    });
    if (row === null)
        return null;
    const { kind: _kind, disposition: _disposition, ...body } = candidate;
    return deepFreeze({
        kind: "product_install",
        disposition: "admitted",
        ...body,
        admissionEventRef: row.admissionEventRef,
    });
}
export function projectAdmittedWorkspaceBinding(projection, candidate, invocationRef) {
    const row = selectExactArtifactTruthRow(projection, {
        operationId: "abg.operation.workspace.bind",
        authorityScopeRef: candidate.bindingId,
        authorityScopeDigest: candidate.bindingDigest,
        artifactRef: candidate.bindingId,
        artifactDigest: candidate.bindingDigest,
        ...(invocationRef === undefined ? {} : { invocationRef }),
    });
    if (row === null)
        return null;
    const { kind: _kind, ...body } = candidate;
    return deepFreeze({
        kind: "workspace_binding",
        ...body,
        admissionEventRef: row.admissionEventRef,
    });
}
export function validatePublicOperationBasis(basis, expectedOperation, expectedMemberKey) {
    if (typeof basis !== "object" ||
        basis === null ||
        basis.operationId !== expectedOperation ||
        basis.memberKey !== expectedMemberKey) {
        return refusal("operation_mismatch", "operation and member identity must match the selected owner definition");
    }
    if (!isExactOperationInvocationCoordinate({
        operationId: basis.operationId,
        memberKey: basis.memberKey,
        definitionDigest: basis.definitionDigest,
        invocationRef: basis.invocationRef,
        invocationPayloadDigest: basis.invocationPayloadDigest,
        invocationDigest: basis.invocationDigest,
    }) ||
        typeof basis.authorityScopeRef !== "string" ||
        basis.authorityScopeRef.length === 0 ||
        !isSha256Digest(basis.authorityScopeDigest) ||
        typeof basis.invocationRef !== "string" ||
        basis.invocationRef.length === 0 ||
        !isSha256Digest(basis.invocationPayloadDigest) ||
        !isSha256Digest(basis.invocationDigest) ||
        typeof basis.correlationId !== "string" ||
        basis.correlationId.length === 0 ||
        typeof basis.eventTime !== "string" ||
        Number.isNaN(Date.parse(basis.eventTime)) ||
        !Array.isArray(basis.causationEventRefs) ||
        basis.causationEventRefs.some((eventRef) => typeof eventRef !== "string" || eventRef.length === 0) ||
        new Set(basis.causationEventRefs).size !== basis.causationEventRefs.length) {
        return refusal("operation_mismatch", "operation definition, invocation, or event-time basis is invalid");
    }
    return null;
}
function projectArtifactTruthAtPrefix(prefix) {
    return projectExactPrefixArtifactTruth(prefix);
}
function predecessorCoordinateRefusal(error) {
    return deepFreeze({
        kind: "event_store_append_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code: "prefix_mismatch",
        message: String(error),
    });
}
export function admitArtifact(store, basis, expectedOperation, artifactRef, artifactDigest, metadata = {}) {
    return admitArtifactFromOwner(store, basis, expectedOperation, artifactRef, artifactDigest, metadata);
}
function admitArtifactFromOwner(store, basis, expectedOperation, artifactRef, artifactDigest, metadata, establishedLock) {
    try {
        assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
    }
    catch (error) {
        return {
            disposition: "coordinate_refused",
            successorPrefix: null,
            refusal: predecessorCoordinateRefusal(error),
        };
    }
    if (expectedOperation !== "abg.operation.product.install" &&
        expectedOperation !== "abg.operation.workspace.bind" &&
        expectedOperation !== "abg.operation.release.snapshot") {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("operation_mismatch", "artifact admission is closed to Product install and workspace binding"),
        };
    }
    const invalidBasis = validatePublicOperationBasis(basis, expectedOperation, expectedOperation === "abg.operation.release.snapshot" && basis.memberKey === "tapped_release" ? "tapped_release" :
        expectedOperation === "abg.operation.release.snapshot" ? "published_rc" : artifactMemberKey(expectedOperation));
    if (invalidBasis !== null) {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: invalidBasis,
        };
    }
    const predecessorProjection = projectArtifactTruthAtPrefix(basis.predecessorPrefix);
    if (predecessorProjection.kind ===
        "exact_prefix_artifact_truth_projection_refusal") {
        return {
            disposition: "coordinate_refused",
            successorPrefix: null,
            refusal: predecessorProjection,
        };
    }
    const predecessorTruth = predecessorProjection;
    const invocationTruth = projectEffectfulPublicInvocationTruthAtPrefix(basis.predecessorPrefix, basis.invocationRef);
    if (invocationTruth.disposition === "invalid_history") {
        return {
            disposition: "coordinate_refused",
            successorPrefix: null,
            refusal: invocationTruth,
        };
    }
    if (invocationTruth.disposition === "duplicate") {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: duplicateInvocationRefusal(invocationTruth.priorAdmission),
        };
    }
    const heldAtScope = predecessorTruth.rows.filter((row) => row.authorityScopeRef === basis.authorityScopeRef);
    if (heldAtScope.length > 1) {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("artifact_truth_conflict", "artifact truth contains an ambiguous authority scope"),
        };
    }
    const held = heldAtScope[0];
    if (held !== undefined) {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("artifact_truth_conflict", "artifact admission conflicts with held scope truth under another invocation"),
        };
    }
    // Encode immutable install content only after admission has acquired its
    // exact predecessor. The reference reuses a body, never another install's
    // admission. Zero-cause rows are the validated physically embedded sources.
    let eventMetadata = metadata;
    let causationEventRefs = basis.causationEventRefs;
    try {
        if (expectedOperation === "abg.operation.product.install" &&
            basis.causationEventRefs.length === 0 &&
            (establishedLock === undefined ? isProductInstallCandidate : isProductInstallCandidateInResolvedLock)(metadata.artifact, metadata.resolvedLock)) {
            const candidate = metadata.artifact;
            const resolvedLock = metadata.resolvedLock;
            establishedLock = resolvedLock;
            let lockBody;
            const source = predecessorTruth.rows
                .filter((row) => row.operationId === "abg.operation.product.install" &&
                row.causationEventRefs.length === 0 &&
                row.resolvedLock.lockId === resolvedLock.lockId &&
                row.resolvedLock.lockDigest === resolvedLock.lockDigest &&
                canonicalJson(row.resolvedLock) === (lockBody ??= canonicalJson(metadata.resolvedLock)))
                .sort((left, right) => left.admissionOrdinal - right.admissionOrdinal)[0];
            const { artifact: _artifact, resolvedLock: _resolvedLock, ...otherMetadata } = metadata;
            eventMetadata = {
                ...otherMetadata,
                artifact: {
                    kind: "product_install_lock_row",
                    schemaVersion: "5.0.0",
                    productId: candidate.productId,
                    installId: candidate.installId,
                    installedRoot: candidate.installedRoot,
                },
                ...(source === undefined
                    ? { resolvedLock: metadata.resolvedLock }
                    : { resolvedLock: {
                            kind: "resolved_product_lock_reference",
                            schemaVersion: "5.0.0",
                            admissionEventRef: source.admissionEventRef,
                            admissionEventDigest: source.admissionEventDigest,
                            lockId: resolvedLock.lockId,
                            lockDigest: resolvedLock.lockDigest,
                        } }),
            };
            causationEventRefs = source === undefined ? [] : [source.admissionEventRef];
        }
    }
    catch (error) {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("artifact_truth_conflict", `artifact successor semantics refused before append: ${String(error)}`),
        };
    }
    const initiatedEvent = {
        kind: "public_operation_artifact_admitted",
        eventTime: basis.eventTime,
        aggregateType: "workspace",
        aggregateId: basis.authorityScopeRef,
        parentAggregateId: null,
        causationEventRefs,
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: basis.authorityScopeRef,
        payload: {
            operationId: basis.operationId,
            memberKey: basis.memberKey,
            definitionDigest: basis.definitionDigest,
            authorityScopeRef: basis.authorityScopeRef,
            authorityScopeDigest: basis.authorityScopeDigest,
            invocationRef: basis.invocationRef,
            invocationPayloadDigest: basis.invocationPayloadDigest,
            invocationDigest: basis.invocationDigest,
            ownerAdmittedDisposition: "admitted",
            artifactRef,
            artifactDigest,
            ...eventMetadata,
            causationEventRefs,
            correlationId: basis.correlationId,
        },
    };
    try {
        assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
    }
    catch (error) {
        return {
            disposition: "coordinate_refused",
            successorPrefix: null,
            refusal: predecessorCoordinateRefusal(error),
        };
    }
    const predecessorEvents = store.readAll();
    let preparedEvent;
    let acceptPrepared;
    try {
        preparedEvent = projectRuntimeEventFromValidatedHistory(predecessorEvents, initiatedEvent);
        acceptPrepared = prepareArtifactTruthCandidate(predecessorTruth, preparedEvent, establishedLock);
    }
    catch (error) {
        return {
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("artifact_truth_conflict", `artifact successor semantics refused before append: ${String(error)}`),
        };
    }
    const appended = appendCheckedArtifactEvent(store, basis.predecessorPrefix, initiatedEvent);
    if (!("event" in appended)) {
        return {
            disposition: "coordinate_refused",
            successorPrefix: null,
            refusal: appended,
        };
    }
    // Publication occurs only after the checked append. The continuation binds
    // the exact event and retains the existing authenticated projection handoff.
    const artifactTruth = acceptPrepared(appended);
    if (artifactTruth.kind === "exact_prefix_artifact_truth_projection_refusal") {
        return { disposition: "coordinate_refused", successorPrefix: null, refusal: artifactTruth };
    }
    return {
        disposition: "admitted",
        admissionEventRef: appended.event.eventId,
        successorPrefix: appended.successorPrefix,
        artifactTruth,
    };
}
export function hasAdmittedWorkspaceBinding(projection, binding) {
    const bindingDigest = sha256Canonical({
        workspaceId: binding.workspaceId,
        authorityBasisId: binding.authorityBasisId,
        authorityBasisDigest: binding.authorityBasisDigest,
        authorizedActorRef: binding.authorizedActorRef,
        productSetId: binding.productSetId,
        productSetDigest: binding.productSetDigest,
        lockId: binding.lockId,
        lockDigest: binding.lockDigest,
        roots: binding.roots,
    });
    return (bindingDigest === binding.bindingDigest &&
        selectExactArtifactTruthRow(projection, {
            operationId: "abg.operation.workspace.bind",
            authorityScopeRef: binding.bindingId,
            authorityScopeDigest: binding.bindingDigest,
            artifactRef: binding.bindingId,
            artifactDigest: binding.bindingDigest,
            admissionEventRef: binding.admissionEventRef,
        }) !== null);
}
export function admitProductInstall(store, candidate, basis, resolvedLock) {
    return admitProductInstallWithCandidateCheck(store, candidate, basis, resolvedLock, isProductInstallCandidate);
}
/** @internal The Product Definition has admitted the lock; candidate scope,
 * exact membership, predecessor and ABG semantics still belong to this owner. */
export function admitProductInstallInResolvedLock(store, candidate, basis, resolvedLock) {
    return admitProductInstallWithCandidateCheck(store, candidate, basis, resolvedLock, isProductInstallCandidateInResolvedLock);
}
function admitProductInstallWithCandidateCheck(store, candidate, basis, resolvedLock, checkCandidate) {
    try {
        assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
    }
    catch (error) {
        return {
            kind: "artifact_owner_coordinate_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: null,
            suppliedPredecessor: basis.predecessorPrefix,
            refusal: predecessorCoordinateRefusal(error),
        };
    }
    const invalidBasis = validatePublicOperationBasis(basis, "abg.operation.product.install", "install");
    if (invalidBasis !== null) {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: invalidBasis,
        };
    }
    if (!checkCandidate(candidate, resolvedLock) ||
        basis.authorityScopeRef !== candidate.installId ||
        basis.authorityScopeDigest !== candidate.productContentDigest) {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("scope_mismatch", "install admission scope differs from the candidate"),
        };
    }
    const candidateDigest = sha256Canonical(candidate);
    const admission = admitArtifactFromOwner(store, basis, "abg.operation.product.install", candidate.installId, candidateDigest, {
        artifact: candidate,
        resolvedLock: resolvedLock,
    }, resolvedLock);
    if (admission.disposition === "coordinate_refused") {
        return {
            kind: "artifact_owner_coordinate_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: null,
            suppliedPredecessor: basis.predecessorPrefix,
            refusal: admission.refusal,
        };
    }
    if (admission.disposition === "refused") {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: admission.successorPrefix,
            refusal: admission.refusal,
        };
    }
    const { kind: _kind, disposition: _disposition, ...body } = candidate;
    const install = deepFreeze({
        kind: "product_install",
        disposition: "admitted",
        ...body,
        admissionEventRef: admission.admissionEventRef,
    });
    return deepFreeze({
        kind: "artifact_owner_result",
        schemaVersion: "5.0.0",
        disposition: admission.disposition,
        value: install,
        admissionEventRef: admission.admissionEventRef,
        successorPrefix: admission.successorPrefix,
        artifactTruth: admission.artifactTruth,
    });
}
export function admitWorkspaceBinding(store, candidate, basis, authority) {
    try {
        assertHeldEventStoreAtDurablePrefix(store, basis.predecessorPrefix);
    }
    catch (error) {
        return {
            kind: "artifact_owner_coordinate_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: null,
            suppliedPredecessor: basis.predecessorPrefix,
            refusal: predecessorCoordinateRefusal(error),
        };
    }
    const invalidBasis = validatePublicOperationBasis(basis, "abg.operation.workspace.bind", "bind");
    if (invalidBasis !== null) {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: invalidBasis,
        };
    }
    const predecessorProjection = projectExactPrefixArtifactTruth(basis.predecessorPrefix);
    if (predecessorProjection.kind ===
        "exact_prefix_artifact_truth_projection_refusal") {
        return {
            kind: "artifact_owner_coordinate_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: null,
            suppliedPredecessor: basis.predecessorPrefix,
            refusal: predecessorProjection,
        };
    }
    const causalInstalls = basis.causationEventRefs.map((eventRef) => projectAdmittedProductInstallByAdmissionEventRef(predecessorProjection, eventRef));
    const resolvedLock = causalInstalls[0]?.resolvedLock;
    const productSet = resolvedLock === undefined ||
        causalInstalls.length === 0 ||
        causalInstalls.some((row) => row === null ||
            row.resolvedLock.lockId !== resolvedLock.lockId ||
            row.resolvedLock.lockDigest !== resolvedLock.lockDigest)
        ? null
        : constructProductSet(causalInstalls.map((row) => row.install), resolvedLock);
    const reconstructedCandidate = resolvedLock === undefined ||
        productSet === null || productSet.kind !== "product_set" ||
        !isWorkspaceAuthorityBasis(authority)
        ? null
        : constructWorkspaceBindingInResolvedLock(authority, productSet, resolvedLock, candidate.roots);
    if (resolvedLock === undefined ||
        productSet === null ||
        productSet.kind !== "product_set" ||
        reconstructedCandidate === null ||
        reconstructedCandidate.kind !== "workspace_binding_candidate" ||
        !isWorkspaceBindingCandidateInResolvedLock(candidate, resolvedLock, productSet, authority) ||
        sha256Canonical(reconstructedCandidate) !==
            sha256Canonical(candidate) ||
        basis.authorityScopeRef !== candidate.bindingId ||
        basis.authorityScopeDigest !== candidate.bindingDigest) {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: basis.predecessorPrefix,
            refusal: refusal("scope_mismatch", "workspace admission scope differs from the candidate"),
        };
    }
    const admission = admitArtifact(store, basis, "abg.operation.workspace.bind", candidate.bindingId, candidate.bindingDigest, {
        artifact: candidate,
        workspaceAuthorityBasis: authority,
    });
    if (admission.disposition === "coordinate_refused") {
        return {
            kind: "artifact_owner_coordinate_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: null,
            suppliedPredecessor: basis.predecessorPrefix,
            refusal: admission.refusal,
        };
    }
    if (admission.disposition === "refused") {
        return {
            kind: "artifact_owner_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            successorPrefix: admission.successorPrefix,
            refusal: admission.refusal,
        };
    }
    const { kind: _kind, ...body } = candidate;
    const binding = deepFreeze({
        kind: "workspace_binding",
        ...body,
        admissionEventRef: admission.admissionEventRef,
    });
    return deepFreeze({
        kind: "artifact_owner_result",
        schemaVersion: "5.0.0",
        disposition: admission.disposition,
        value: binding,
        admissionEventRef: admission.admissionEventRef,
        successorPrefix: admission.successorPrefix,
        artifactTruth: admission.artifactTruth,
    });
}
