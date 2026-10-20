import { projectExactPrefixArtifactTruth } from "../abg/artifact_truth.js";
import { sameJson } from "../shared/definition_binding_mechanics.js";
import { readReleaseArtifactBytes, projectReleaseQualification, projectReleaseAcceptance } from "../implementation/release_publication.js";
import { releaseArtifactCoordinate } from "./release_snapshot_operations.js";
import { isRecord, hasObjectUnicodeNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { isConsensusResult, projectTicketConsensus, } from "../gtl/consensus.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { graphFunctionCatalogCanonicalSnapshot, } from "./catalog.js";
import { isProductSet, isResolvedProductLock, isWorkspaceBindingCandidate, } from "./environment.js";
function digestJson(value) {
    try {
        return sha256Canonical(value);
    }
    catch {
        return null;
    }
}
function validCoordinate(value) {
    return isRecord(value) &&
        hasExactKeys(value, ["digest", "ref"]) &&
        typeof value.ref === "string" &&
        value.ref.length > 0 &&
        isSha256Digest(value.digest);
}
function validProjectionBasis(value) {
    return isRecord(value) &&
        hasExactKeys(value, ["basisDigest", "basisRef", "value"]) &&
        typeof value.basisRef === "string" &&
        value.basisRef.length > 0 &&
        isSha256Digest(value.basisDigest) &&
        digestJson(value.value) === value.basisDigest;
}
function validEnvelope(packet, memberKey, additionalKeys) {
    return isRecord(packet) &&
        hasExactKeys(packet, [
            "kind",
            "memberKey",
            "projectionBasis",
            "schemaVersion",
            "sourceDigest",
            "sourceRef",
            ...additionalKeys,
        ]) &&
        packet.kind === "product_project_read_packet" &&
        packet.schemaVersion === "5.0.0" &&
        packet.memberKey === memberKey &&
        typeof packet.sourceRef === "string" &&
        packet.sourceRef.length > 0 &&
        isSha256Digest(packet.sourceDigest) &&
        validProjectionBasis(packet.projectionBasis);
}
function refusal(memberKey, code, message, packet, ownerRefusal = null) {
    const sourceRef = isRecord(packet) && typeof packet.sourceRef === "string"
        ? packet.sourceRef
        : null;
    const sourceDigest = isRecord(packet) && isSha256Digest(packet.sourceDigest)
        ? packet.sourceDigest
        : null;
    return deepFreeze({
        kind: "product_project_read_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        memberKey,
        code,
        message,
        sourceRef,
        sourceDigest,
        ownerRefusal,
    });
}
function projected(packet, projection) {
    const memberKey = packet.memberKey;
    const projectionBody = {
        memberKey,
        sourceRef: packet.sourceRef,
        sourceDigest: packet.sourceDigest,
        projectionBasisRef: packet.projectionBasis.basisRef,
        projectionBasisDigest: packet.projectionBasis.basisDigest,
        projection,
    };
    const projectionDigest = sha256Canonical(projectionBody);
    return deepFreeze({
        kind: "product_project_read_result",
        schemaVersion: "5.0.0",
        disposition: "projected",
        ...projectionBody,
        projectionRef: `product-projection://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
function catalogSnapshotDigest(catalog) {
    return sha256Canonical(JSON.parse(graphFunctionCatalogCanonicalSnapshot(catalog)));
}
function catalogRows(catalog, view) {
    const visibleHandles = view === null ? null : new Set(view.allowlist);
    const readinessRows = "rowDispositions" in catalog
        ? catalog.rowDispositions
        : [];
    const readinessFor = (handle, owningProductId, moduleRef) => readinessRows.find((row) => row.handle === handle &&
        row.owningProductId === owningProductId &&
        row.moduleRef === moduleRef) ?? null;
    return [
        ...catalog.entries.map((entry) => ({
            handle: entry.handle,
            contributionKind: "graph_function",
            entry,
            readiness: readinessFor(entry.handle, entry.owningProductId, entry.moduleRef),
        })),
        ...catalog.declarationEntries.map((entry) => ({
            handle: entry.handle,
            contributionKind: entry.declarationKind,
            entry,
            readiness: readinessFor(entry.handle, entry.owningProductId, entry.moduleRef),
        })),
    ].filter((row) => visibleHandles === null || visibleHandles.has(row.handle))
        .sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle));
}
function selectedView(catalog, selector) {
    if (selector.visibility.kind === "workspace_catalog")
        return null;
    return selector.visibility.view.catalogBasisDigest === catalog.basisDigest
        ? selector.visibility.view
        : "mismatch";
}
export function projectCatalogList(packet) {
    if (!validEnvelope(packet, "catalog_list", ["catalog", "selector"])) {
        return refusal("catalog_list", "source_kind_mismatch", "catalog list requires one exact Product catalog packet", packet);
    }
    if (!isRecord(packet.catalog) ||
        packet.catalog.kind !== "graph_function_catalog" ||
        packet.catalog.schemaVersion !== "5.0.0" ||
        packet.sourceDigest !== packet.catalog.basisDigest) {
        return refusal("catalog_list", "source_digest_mismatch", "catalog list source differs from its immutable catalog basis", packet);
    }
    if (!isRecord(packet.selector) ||
        packet.selector.kind !== "catalog_list" ||
        !isRecord(packet.selector.visibility) ||
        (packet.selector.visibility.kind !== "workspace_catalog" &&
            packet.selector.visibility.kind !== "session_view")) {
        return refusal("catalog_list", "projection_unsupported", "catalog list requires one closed visibility selector", packet);
    }
    const view = selectedView(packet.catalog, packet.selector);
    if (view === "mismatch") {
        return refusal("catalog_list", "projection_basis_mismatch", "catalog view differs from the selected catalog basis", packet);
    }
    const projection = {
        kind: "catalog_list_projection",
        catalogBasisDigest: packet.catalog.basisDigest,
        catalogSnapshotDigest: catalogSnapshotDigest(packet.catalog),
        visibility: view === null ? "workspace_catalog" : "session_view",
        viewDigest: view?.viewDigest ?? null,
        rows: catalogRows(packet.catalog, view),
    };
    return projected(packet, projection);
}
export function projectCatalogDescription(packet) {
    if (!validEnvelope(packet, "catalog_describe", ["catalog", "selector"])) {
        return refusal("catalog_describe", "source_kind_mismatch", "catalog describe requires one exact Product catalog packet", packet);
    }
    if (!isRecord(packet.catalog) ||
        packet.catalog.kind !== "graph_function_catalog" ||
        packet.catalog.schemaVersion !== "5.0.0" ||
        packet.sourceDigest !== packet.catalog.basisDigest) {
        return refusal("catalog_describe", "source_digest_mismatch", "catalog describe source differs from its immutable catalog basis", packet);
    }
    if (!isRecord(packet.selector) ||
        packet.selector.kind !== "catalog_describe" ||
        typeof packet.selector.handle !== "string" ||
        packet.selector.handle.length === 0 ||
        !isRecord(packet.selector.visibility)) {
        return refusal("catalog_describe", "projection_unsupported", "catalog describe requires one canonical handle and visibility selector", packet);
    }
    const view = selectedView(packet.catalog, packet.selector);
    if (view === "mismatch") {
        return refusal("catalog_describe", "projection_basis_mismatch", "catalog view differs from the selected catalog basis", packet);
    }
    const allRows = catalogRows(packet.catalog, null).filter((row) => row.handle === packet.selector.handle);
    if (allRows.length === 0) {
        return refusal("catalog_describe", "unknown_handle", `catalog handle ${packet.selector.handle} is absent`, packet);
    }
    if (allRows.length !== 1) {
        return refusal("catalog_describe", "ambiguous_handle", `catalog handle ${packet.selector.handle} is not unique`, packet);
    }
    if (view !== null && !view.allowlist.includes(packet.selector.handle)) {
        return refusal("catalog_describe", "hidden_by_view", `catalog handle ${packet.selector.handle} is outside the exact view`, packet);
    }
    const row = allRows[0];
    const projection = {
        kind: "catalog_description_projection",
        catalogBasisDigest: packet.catalog.basisDigest,
        visibility: view === null ? "workspace_catalog" : "session_view",
        viewDigest: view?.viewDigest ?? null,
        handle: row.handle,
        contributionKind: row.contributionKind,
        entry: row.entry,
        readiness: row.readiness,
    };
    return projected(packet, projection);
}
function admittedBindingCandidate(binding) {
    const { admissionEventRef: _admissionEventRef, kind: _kind, ...body } = binding;
    return { kind: "workspace_binding_candidate", ...body };
}
export function projectWorkspaceStatus(packet) {
    if (!validEnvelope(packet, "workspace_status", [
        "binding",
        "catalogCoordinate",
        "configurationCoordinates",
        "productSet",
        "resolvedLock",
        "selector",
    ])) {
        return refusal("workspace_status", "source_kind_mismatch", "workspace status requires one exact immutable workspace basis", packet);
    }
    const coordinatesAreValid = Array.isArray(packet.configurationCoordinates) &&
        packet.configurationCoordinates.every(validCoordinate) &&
        new Set(packet.configurationCoordinates.map((coordinate) => coordinate.ref))
            .size === packet.configurationCoordinates.length &&
        (packet.catalogCoordinate === null ||
            validCoordinate(packet.catalogCoordinate));
    if (!isRecord(packet.selector) ||
        !hasExactKeys(packet.selector, ["kind"]) ||
        packet.selector.kind !== "none" ||
        !isRecord(packet.binding) ||
        packet.binding.kind !== "workspace_binding" ||
        typeof packet.binding.admissionEventRef !== "string" ||
        packet.binding.admissionEventRef.length === 0 ||
        !isResolvedProductLock(packet.resolvedLock) ||
        !isProductSet(packet.productSet, packet.resolvedLock) ||
        !isWorkspaceBindingCandidate(admittedBindingCandidate(packet.binding), packet.resolvedLock, packet.productSet) ||
        !coordinatesAreValid) {
        return refusal("workspace_status", "not_ready", "workspace status basis is incomplete or internally inconsistent", packet);
    }
    if (packet.sourceRef !== packet.binding.bindingId ||
        packet.sourceDigest !== packet.binding.bindingDigest) {
        return refusal("workspace_status", "source_digest_mismatch", "workspace status source differs from the selected binding", packet);
    }
    const configurations = [...packet.configurationCoordinates].sort((left, right) => compareUnicodeCodeUnits(left.ref, right.ref));
    const projection = {
        kind: "workspace_status_projection",
        workspaceRef: packet.binding.workspaceId,
        workspaceAuthorityRef: packet.binding.authorityBasisId,
        workspaceAuthorityDigest: packet.binding.authorityBasisDigest,
        bindingRef: packet.binding.bindingId,
        bindingDigest: packet.binding.bindingDigest,
        productSetRef: packet.productSet.productSetId,
        productSetDigest: packet.productSet.productSetDigest,
        resolvedLockRef: packet.resolvedLock.lockId,
        resolvedLockDigest: packet.resolvedLock.lockDigest,
        boundProductRefs: [...packet.productSet.orderedInstallRefs],
        roots: packet.binding.roots,
        configurationCoordinates: configurations,
        catalogCoordinate: packet.catalogCoordinate,
        readiness: "ready",
        residuals: [],
        admissionEventRef: packet.binding.admissionEventRef,
    };
    return projected(packet, projection);
}
export function projectInstallEvidence(packet) {
    if (!validEnvelope(packet, "install_evidence", ["install", "selector"])) {
        return refusal("install_evidence", "source_kind_mismatch", "install evidence requires one exact admitted Product install", packet);
    }
    const installDigest = digestJson(packet.install);
    if (!isRecord(packet.install) ||
        packet.install.kind !== "product_install" ||
        packet.install.disposition !== "admitted" ||
        typeof packet.install.installId !== "string" ||
        typeof packet.install.admissionEventRef !== "string" ||
        packet.install.admissionEventRef.length === 0 ||
        installDigest === null ||
        packet.sourceRef !== packet.install.installId ||
        packet.sourceDigest !== installDigest) {
        return refusal("install_evidence", "source_digest_mismatch", "install evidence source differs from its admitted immutable carrier", packet);
    }
    const manifest = packet.selector?.manifest;
    if (!isRecord(packet.selector) ||
        packet.selector.kind !== "install_manifest" ||
        !isRecord(manifest) ||
        !hasExactKeys(manifest, ["manifestDigest", "manifestRef", "value"]) ||
        typeof manifest.manifestRef !== "string" ||
        manifest.manifestRef.length === 0 ||
        !isSha256Digest(manifest.manifestDigest) ||
        digestJson(manifest.value) !== manifest.manifestDigest) {
        return refusal("install_evidence", "projection_basis_mismatch", "install evidence requires one exact immutable install manifest", packet);
    }
    const projection = {
        kind: "install_evidence_projection",
        subjectRef: packet.install.installId,
        subjectDigest: installDigest,
        productId: packet.install.productId,
        artifactRef: packet.install.installId,
        artifactDigest: packet.install.artifactDigest,
        productContentDigest: packet.install.productContentDigest,
        manifest,
        producer: "ProductInstallPort.install",
        basisRefs: [
            packet.install.resolvedLockId,
            packet.projectionBasis.basisRef,
        ],
        provenanceRefs: [
            packet.install.provenanceRef,
            packet.install.admissionEventRef,
            manifest.manifestRef,
        ].sort(compareUnicodeCodeUnits),
    };
    return projected(packet, projection);
}
export function projectReleaseEvidence(packet) {
    try {
        if (!validEnvelope(packet, "release_evidence", ["prefix", "artifact", "artifactPath", "selector"]) ||
            packet.selector.kind !== "release_operation_observation" || !validCoordinate(packet.artifact) ||
            !sameJson(packet.selector.artifact, packet.artifact) || !sameJson(packet.projectionBasis.value, packet.prefix)) {
            return refusal("release_evidence", "projection_basis_mismatch", "release read requires its exact current prefix and observation selector", packet);
        }
        const truth = projectExactPrefixArtifactTruth(packet.prefix), artifact = readReleaseArtifactBytes(packet.artifactPath, packet.artifact);
        if (truth.kind !== "exact_prefix_artifact_truth_projection" || artifact === null)
            return refusal("release_evidence", "not_ready", "release observation bytes or native prefix are unavailable", packet);
        const rows = truth.rows.filter(row => row.operationId === "abg.operation.release.snapshot" && row.memberKey === artifact.memberKey && row.artifactRef === packet.artifact.ref && row.artifactDigest === packet.artifact.digest);
        const row = rows[0];
        if (rows.length !== 1 || row === undefined || !sameJson(row.artifact, artifact) || packet.sourceRef !== artifact.scope.ref || packet.sourceDigest !== artifact.scope.digest ||
            (artifact.memberKey === "published_rc" ? projectReleaseQualification(artifact.request, artifact.proof, artifact.selection, packet.prefix) :
                projectReleaseAcceptance(artifact.request, artifact.proof, artifact.selection, artifact.publication, artifact.ruling, artifact.effectGrant, packet.prefix, truth.rows.slice(0, truth.rows.indexOf(row)))) === null)
            return refusal("release_evidence", "source_digest_mismatch", "release source lacks its exact native owner/qualification relation", packet);
        const superseded = artifact.memberKey === "tapped_release" && truth.rows.slice(truth.rows.indexOf(row) + 1).some(r => r.operationId === "abg.operation.release.snapshot" && r.memberKey === "tapped_release" &&
            isRecord(r.artifact) && isRecord(r.artifact.request) && sameJson(r.artifact.request.acceptedRc, artifact.request.acceptedRc));
        return projected(packet, {
            kind: "release_evidence_projection", disposition: artifact.observation.disposition !== "complete" ? "incomplete_effect" : artifact.memberKey === "published_rc" ? "published_unqualified" : superseded ? "superseded" : artifact.decision === "accept" ? "accepted" : "qualified_unaccepted",
            releaseCut: artifact.scope, observationArtifact: releaseArtifactCoordinate(artifact), snapshotManifest: artifact.observation.snapshotManifest,
            artifacts: [artifact.request.qualificationBasis.artifact], qualification: artifact.request.verdict, acceptance: artifact.memberKey === "published_rc" ? "incomplete" : artifact.decision === "accept" && artifact.observation.disposition === "complete" && !superseded ? "accepted" : artifact.decision === "withhold" ? "withheld" : "incomplete",
            ...(artifact.memberKey === "tapped_release" ? { ownerRuling: artifact.request.acceptance, addendum: artifact.addendum, originalRuling: artifact.ruling, sourceApproval: artifact.effectGrant.sourceApproval } : {}),
            provenance: [{ ref: row.admissionEventRef, digest: row.admissionEventDigest }],
        });
    }
    catch {
        return refusal("release_evidence", "not_ready", "release native proof could not be reconstructed", packet);
    }
}
export function projectConsensusTicket(packet) {
    if (!validEnvelope(packet, "ticket_consensus", [
        "consensusResult",
        "selector",
    ])) {
        return refusal("ticket_consensus", "source_kind_mismatch", "ticket consensus requires one exact admitted Consensus result", packet);
    }
    const resultDigest = digestJson(packet.consensusResult);
    if (!isConsensusResult(packet.consensusResult) ||
        resultDigest === null ||
        packet.sourceRef !== packet.consensusResult.resultRef ||
        packet.sourceDigest !== resultDigest) {
        return refusal("ticket_consensus", "source_digest_mismatch", "ticket consensus source differs from its admitted result carrier", packet);
    }
    if (!isRecord(packet.selector) ||
        !hasExactKeys(packet.selector, [
            "kind",
            "outputAuthority",
            "replayBasis",
            "ticket",
        ]) ||
        packet.selector.kind !== "ticket_consensus" ||
        !validCoordinate(packet.selector.ticket) ||
        !validCoordinate(packet.selector.outputAuthority) ||
        !validCoordinate(packet.selector.replayBasis) ||
        packet.selector.ticket.ref !== packet.consensusResult.subjectRef ||
        packet.selector.ticket.digest !== packet.consensusResult.subjectDigest ||
        packet.selector.replayBasis.ref !== packet.consensusResult.replayRef) {
        return refusal("ticket_consensus", "projection_basis_mismatch", "ticket, output-authority, and replay bases must match the admitted result", packet);
    }
    try {
        return projected(packet, projectTicketConsensus(packet.consensusResult));
    }
    catch (error) {
        return refusal("ticket_consensus", "not_ready", `ticket consensus projection refused: ${String(error)}`, packet);
    }
}
export const CatalogProjectionPort = Object.freeze({
    list: projectCatalogList,
    describe: projectCatalogDescription,
});
export const WorkspaceProjectionPort = Object.freeze({
    status: projectWorkspaceStatus,
});
export const InstallProjectionPort = Object.freeze({
    evidence: projectInstallEvidence,
});
export const ReleaseProjectionPort = Object.freeze({
    evidence: projectReleaseEvidence,
});
export const ConsensusProjectionPort = Object.freeze({
    ticketConsensus: projectConsensusTicket,
});
export const PRODUCT_PROJECT_READ_CONTRACTS = Object.freeze({
    catalog_list: CatalogProjectionPort.list,
    catalog_describe: CatalogProjectionPort.describe,
    workspace_status: WorkspaceProjectionPort.status,
    install_evidence: InstallProjectionPort.evidence,
    release_evidence: ReleaseProjectionPort.evidence,
    ticket_consensus: ConsensusProjectionPort.ticketConsensus,
});
