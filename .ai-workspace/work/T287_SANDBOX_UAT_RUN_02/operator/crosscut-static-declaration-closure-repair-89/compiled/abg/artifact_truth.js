import { projectExactPrefixWorkspaceEnvironment } from "./environment_admission.js";
import { isReleaseOperationArtifact, projectReleaseQualification, projectReleaseAcceptance } from "../implementation/release_publication.js";
import { releaseArtifactCoordinate } from "../product/release_snapshot_operations.js";
import { constructProductSet, isResolvedProductLock, isWorkspaceAuthorityBasis, } from "../product/index.js";
import { constructWorkspaceBindingInResolvedLock, isProductInstallCandidateInResolvedLock, isWorkspaceBindingCandidateInResolvedLock, productInstallCoordinate, } from "../product/environment.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { constructRuntimeFluent, eventCalculusEffect, runtimeEventCalculusEffectsByKind, runtimeFluentHoldsAtPrefix, } from "./event_calculus.js";
import { DurablePrefixReadError, captureDurablePrefixCoordinate, assertDurableRuntimePrefixBytes, assertDurableRuntimePrefixCurrent, readRuntimeEventsAtDurablePrefix, projectRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, runtimePrefixComputation, selectValidatedRuntimeEventPrefix, validateRuntimeEventPrefixExtension, } from "./event_prefix.js";
class ArtifactTruthHistoryError extends TypeError {
    code;
    eventRefs;
    authorityScopeRef;
    conflictingFields;
    constructor(code, eventRefs, authorityScopeRef, conflictingFields) {
        super(code);
        this.code = code;
        this.eventRefs = eventRefs;
        this.authorityScopeRef = authorityScopeRef;
        this.conflictingFields = conflictingFields;
    }
}
function recordPayload(row) {
    const payload = row.sourceEvent.payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        throw new TypeError("artifact admission requires one closed object payload");
    }
    return payload;
}
function requiredString(payload, field) {
    const value = payload[field];
    if (typeof value !== "string" || value.length === 0) {
        throw new TypeError(`artifact admission requires non-empty ${field}`);
    }
    return value;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasExactKeys(value, keys) {
    return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function isDigest(value) {
    return /^sha256:[a-f0-9]{64}$/u.test(value);
}
function assertsArtifactAvailabilityEffect(row, authorityScopeRef) {
    if (row.initiates.length !== 1 ||
        row.initiates[0]?.name !== "public_operation_artifact_available" ||
        row.initiates[0]?.identity !== authorityScopeRef) {
        throw new TypeError("artifact admission lacks its authority-scoped Event Calculus availability effect");
    }
}
/**
 * Ordered artifact relations consume the shared Event Calculus owner facts.
 * The installed authority surface remains projectExactPrefixArtifactTruth.
 */
const ARTIFACT_FACTS = Symbol("ordered_artifact_facts");
class RuntimeArtifactFacts {
    artifacts = [];
    exactProjections = new Map();
    admittedInstalls = new Map();
    advance(artifactRows) {
        for (const row of artifactRows.slice(this.artifacts.length)) {
            const prepared = this.prepare(row);
            this.accept(prepared);
        }
    }
    accept(prepared) {
        if (prepared.install !== undefined)
            this.admittedInstalls.set(prepared.artifact.admissionEventRef, prepared.install);
        this.artifacts.push(prepared.artifact);
    }
    /** Shared cold/live relation, with no mutation until the complete row passes.
     * An enclosing install owner may supply its established lock; copied event
     * metadata must still reproduce that complete body. */
    prepare(row, establishedLock) {
        let admittedInstall;
        const payload = recordPayload(row);
        const authorityScopeRef = requiredString(payload, "authorityScopeRef");
        assertsArtifactAvailabilityEffect(row, authorityScopeRef);
        const operationId = requiredString(payload, "operationId");
        const ownerAdmittedDisposition = requiredString(payload, "ownerAdmittedDisposition");
        if ((operationId !== "abg.operation.product.install" &&
            operationId !== "abg.operation.workspace.bind" && operationId !== "abg.operation.release.snapshot") ||
            ownerAdmittedDisposition !== "admitted") {
            throw new TypeError("artifact admission is outside the admitted install/workspace relation");
        }
        const memberKey = requiredString(payload, "memberKey");
        const definitionDigest = requiredString(payload, "definitionDigest");
        const invocationRef = requiredString(payload, "invocationRef");
        const invocationPayloadDigest = requiredString(payload, "invocationPayloadDigest");
        const invocationDigest = requiredString(payload, "invocationDigest");
        const authorityScopeDigest = requiredString(payload, "authorityScopeDigest");
        const artifactRef = requiredString(payload, "artifactRef");
        const artifactDigest = requiredString(payload, "artifactDigest");
        const event = row.sourceEvent;
        if (!(operationId === "abg.operation.release.snapshot" && memberKey === "tapped_release") && memberKey !== (operationId === "abg.operation.product.install"
            ? "install"
            : operationId === "abg.operation.release.snapshot" ? "published_rc" : "bind") ||
            !isExactOperationInvocationCoordinate({
                operationId,
                memberKey,
                definitionDigest,
                invocationRef,
                invocationPayloadDigest,
                invocationDigest,
            }) ||
            !isDigest(invocationPayloadDigest) ||
            !isDigest(authorityScopeDigest) ||
            !isDigest(artifactDigest) ||
            event.aggregateType !== "workspace" ||
            event.aggregateId !== authorityScopeRef ||
            event.parentAggregateId !== null ||
            event.workflowVersion !== "5.0.0" ||
            event.scopeClass !== "workspace" ||
            event.basisId !== authorityScopeRef ||
            payload.correlationId !== event.correlationId ||
            !Array.isArray(payload.causationEventRefs) ||
            canonicalJson(payload.causationEventRefs) !==
                canonicalJson(event.causationEventRefs)) {
            throw new TypeError("artifact admission differs from its exact Public operation and event basis");
        }
        let artifact = payload.artifact ?? null;
        let resolvedLockBody = payload.resolvedLock ?? null;
        if (operationId === "abg.operation.product.install") {
            let checkedLock;
            const establishInlineLock = (value) => {
                if (establishedLock !== undefined &&
                    (value === establishedLock || canonicalJson(value) ===
                        canonicalJson(establishedLock))) {
                    checkedLock = establishedLock;
                    return true;
                }
                if (!isResolvedProductLock(value))
                    return false;
                checkedLock = value;
                return true;
            };
            if (isRecord(artifact) && artifact.kind === "product_install_lock_row") {
                if (!hasExactKeys(artifact, ["kind", "schemaVersion", "productId", "installId", "installedRoot"]) ||
                    artifact.schemaVersion !== "5.0.0")
                    throw new TypeError("Product install compact body is malformed");
                const reference = payload.resolvedLock;
                const referencesBody = reference !== undefined && isRecord(reference) &&
                    reference.kind === "resolved_product_lock_reference";
                if (!referencesBody) {
                    if (event.causationEventRefs.length !== 0 || !establishInlineLock(reference)) {
                        throw new TypeError("Product install inline body requires one resolved lock and no body cause");
                    }
                }
                else {
                    if (!hasExactKeys(reference, ["kind", "schemaVersion", "admissionEventRef", "admissionEventDigest", "lockId", "lockDigest"]) ||
                        reference.schemaVersion !== "5.0.0" ||
                        typeof reference.admissionEventRef !== "string" ||
                        event.causationEventRefs.length !== 1 ||
                        event.causationEventRefs[0] !== reference.admissionEventRef)
                        throw new TypeError("Product install lock reference is malformed or differs from its body cause");
                    const source = this.admittedInstalls.get(reference.admissionEventRef);
                    if (source === undefined || !source.embeddedLock ||
                        source.admissionEventDigest !== reference.admissionEventDigest ||
                        source.resolvedLock.lockId !== reference.lockId ||
                        source.resolvedLock.lockDigest !== reference.lockDigest)
                        throw new TypeError("Product install lock reference lacks its exact earlier embedded body");
                    checkedLock = source.resolvedLock;
                    resolvedLockBody = source.resolvedLock;
                }
                const lock = resolvedLockBody;
                const productId = artifact.productId;
                const selectedRows = lock.rows.filter((entry) => entry.productId === productId);
                if (selectedRows.length !== 1)
                    throw new TypeError("Product install compact body requires one exact lock row");
                artifact = {
                    ...selectedRows[0],
                    kind: "product_install_candidate",
                    schemaVersion: "5.0.0",
                    disposition: "materialized",
                    installId: artifact.installId,
                    installedRoot: artifact.installedRoot,
                    resolvedLockId: lock.lockId,
                    resolvedLockDigest: lock.lockDigest,
                };
            }
            else if (event.causationEventRefs.length !== 0) {
                throw new TypeError("Historical Product install body requires its embedded lock and no body cause");
            }
            if ((checkedLock === undefined && !establishInlineLock(resolvedLockBody)) ||
                !isProductInstallCandidateInResolvedLock(artifact, checkedLock) ||
                payload.workspaceAuthorityBasis !== undefined) {
                throw new TypeError("Product install artifact truth requires one complete candidate and resolved lock");
            }
            const candidate = artifact;
            const resolvedLock = checkedLock;
            if (authorityScopeRef !== candidate.installId ||
                authorityScopeDigest !== candidate.productContentDigest ||
                artifactRef !== candidate.installId ||
                artifactDigest !== sha256Canonical(candidate)) {
                throw new TypeError("Product install artifact truth differs from its exact candidate scope");
            }
            const { kind: _kind, disposition: _disposition, ...body } = candidate;
            admittedInstall = deepFreeze({
                install: {
                    kind: "product_install",
                    disposition: "admitted",
                    ...body,
                    admissionEventRef: event.eventId,
                },
                resolvedLock,
                embeddedLock: event.causationEventRefs.length === 0,
                admissionEventDigest: event.payloadDigest,
            });
        }
        else if (operationId === "abg.operation.release.snapshot") {
            if (!isReleaseOperationArtifact(artifact) || payload.resolvedLock !== undefined || payload.workspaceAuthorityBasis !== undefined ||
                canonicalJson(artifact.invocation) !== canonicalJson({ operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest, invocationDigest }) ||
                artifact.scope.ref !== authorityScopeRef || artifact.scope.digest !== authorityScopeDigest ||
                releaseArtifactCoordinate(artifact).ref !== artifactRef || releaseArtifactCoordinate(artifact).digest !== artifactDigest ||
                (artifact.memberKey === "published_rc"
                    ? projectReleaseQualification(artifact.request, artifact.proof, artifact.selection, artifact.entryPrefix)
                    : projectReleaseAcceptance(artifact.request, artifact.proof, artifact.selection, artifact.publication, artifact.ruling, artifact.effectGrant, artifact.entryPrefix, this.artifacts)) === null) {
                throw new TypeError("release artifact differs from its closed native qualification/observation/scope/Definition relation");
            }
            const environment = projectExactPrefixWorkspaceEnvironment(artifact.entryPrefix, artifact.workspaceBinding);
            if (environment.kind !== "exact_prefix_workspace_environment" ||
                environment.workspaceAuthorityBasis.authorizedActorRef !== artifact.actorRef ||
                canonicalJson(artifact.productSet) !== canonicalJson(environment.productInstalls.map(productInstallCoordinate)) ||
                artifact.dependencyLock.ref !== environment.resolvedProductLock.lockId || artifact.dependencyLock.digest !== environment.resolvedProductLock.lockDigest ||
                event.causationEventRefs.length !== 1 || event.causationEventRefs[0] !== environment.workspaceBinding.admissionEventRef) {
                throw new TypeError("release artifact actor/environment differs from its exact admitted predecessor");
            }
        }
        else {
            if (new Set(event.causationEventRefs).size !==
                event.causationEventRefs.length) {
                throw new TypeError("workspace binding artifact truth requires each causal install exactly once");
            }
            const causalInstalls = event.causationEventRefs.map((eventRef) => this.admittedInstalls.get(eventRef));
            const resolvedLock = causalInstalls[0]?.resolvedLock;
            const productSet = resolvedLock === undefined ||
                causalInstalls.length === 0 ||
                causalInstalls.some((basis) => basis === undefined ||
                    (basis.resolvedLock !== resolvedLock &&
                        canonicalJson(basis.resolvedLock) !==
                            canonicalJson(resolvedLock)))
                ? null
                : constructProductSet(causalInstalls.map((basis) => basis.install), resolvedLock);
            const authority = isWorkspaceAuthorityBasis(payload.workspaceAuthorityBasis)
                ? payload.workspaceAuthorityBasis
                : null;
            if (productSet === null ||
                productSet.kind !== "product_set" ||
                authority === null ||
                !isWorkspaceBindingCandidateInResolvedLock(payload.artifact, resolvedLock, productSet, authority) ||
                payload.resolvedLock !== undefined) {
                throw new TypeError("workspace binding artifact truth requires its exact causal Product set");
            }
            const candidate = payload.artifact;
            const reconstructed = constructWorkspaceBindingInResolvedLock(authority, productSet, resolvedLock, candidate.roots);
            if (reconstructed.kind !== "workspace_binding_candidate" ||
                canonicalJson(reconstructed) !==
                    canonicalJson(candidate) ||
                authorityScopeRef !== candidate.bindingId ||
                authorityScopeDigest !== candidate.bindingDigest ||
                artifactRef !== candidate.bindingId ||
                artifactDigest !== candidate.bindingDigest) {
                throw new TypeError("workspace binding artifact truth differs from its exact candidate scope");
            }
        }
        return { install: admittedInstall, artifact: deepFreeze({
                operationId,
                memberKey,
                definitionDigest,
                invocationRef,
                invocationPayloadDigest,
                invocationDigest,
                authorityScopeRef,
                authorityScopeDigest,
                artifactRef,
                artifactDigest,
                artifact,
                resolvedLock: resolvedLockBody,
                workspaceAuthorityBasis: payload.workspaceAuthorityBasis ?? null,
                admissionEventRef: event.eventId,
                admissionEventDigest: event.payloadDigest,
                admissionOrdinal: event.admissionOrdinal,
                causationEventRefs: [...event.causationEventRefs],
                ownerAdmittedDisposition: "admitted",
            }) };
    }
}
export function projectArtifactTruth(prefix) {
    const artifactRows = runtimeEventCalculusEffectsByKind(prefix, "public_operation_artifact_admitted");
    const facts = runtimePrefixComputation(prefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
    facts.advance(artifactRows);
    const artifacts = facts.artifacts.slice(0, artifactRows.length);
    for (const row of artifacts) {
        if (!runtimeFluentHoldsAtPrefix(prefix, constructRuntimeFluent({ name: "public_operation_artifact_available", identity: row.authorityScopeRef })))
            throw new TypeError("artifact admission history disagrees with scoped Event Calculus availability");
    }
    assertUniqueArtifactTruth(artifacts);
    return deepFreeze({
        kind: "artifact_truth_projection",
        artifacts,
    });
}
function assertUniqueArtifactTruth(artifacts) {
    artifacts.sort((left, right) => left.authorityScopeRef < right.authorityScopeRef
        ? -1
        : left.authorityScopeRef > right.authorityScopeRef
            ? 1
            : left.admissionOrdinal - right.admissionOrdinal);
    const factFields = [
        "operationId",
        "memberKey",
        "definitionDigest",
        "invocationRef",
        "invocationPayloadDigest",
        "invocationDigest",
        "authorityScopeRef",
        "authorityScopeDigest",
        "artifactRef",
        "artifactDigest",
        "admissionEventDigest",
    ];
    const assertUniqueFact = (previous, current) => {
        const conflictingFields = factFields
            .filter((field) => previous[field] !== current[field])
            .sort();
        const eventRefs = [
            ...new Set([
                previous.admissionEventRef,
                current.admissionEventRef,
            ]),
        ].sort();
        throw new ArtifactTruthHistoryError(conflictingFields.length === 0
            ? "duplicate_artifact_admission"
            : "artifact_truth_history_conflict", eventRefs, current.authorityScopeRef, conflictingFields);
    };
    const heldByScope = new Map();
    const heldByInvocation = new Map();
    for (const current of artifacts) {
        const previousAtScope = heldByScope.get(current.authorityScopeRef);
        if (previousAtScope === undefined) {
            heldByScope.set(current.authorityScopeRef, current);
        }
        else {
            assertUniqueFact(previousAtScope, current);
        }
        const previousAtInvocation = heldByInvocation.get(current.invocationRef);
        if (previousAtInvocation === undefined) {
            heldByInvocation.set(current.invocationRef, current);
        }
        else {
            assertUniqueFact(previousAtInvocation, current);
        }
    }
}
/** Speculation borrows the actual predecessor's checked facts. It never lends
 * candidate rows to the live prefix or creates another history derivation. */
export function validateArtifactTruthCandidate(predecessor, event) {
    prepareArtifactTruthCandidate(predecessor, event);
}
/** @internal Prepare against the actual owner without publishing speculative
 * facts. The continuation accepts only the exact checked append, then advances
 * that same owner's derivation. A cold/different owner reconstructs normally. */
export function prepareArtifactTruthCandidate(predecessor, event, establishedLock) {
    const prefix = runtimePrefixFromArtifactTruth(predecessor);
    if (prefix === null)
        throw new TypeError("artifact candidate requires its owner-derived predecessor");
    if (event.kind !== "public_operation_artifact_admitted")
        throw new TypeError("artifact candidate requires an artifact event");
    validateRuntimeEventPrefixExtension(prefix, event);
    const facts = runtimePrefixComputation(prefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
    const prepared = facts.prepare({ kind: "event_calculus_effect_row", eventKind: event.kind,
        sourceEvent: event, ...eventCalculusEffect(event) }, establishedLock);
    const artifacts = facts.artifacts.filter(row => row.admissionOrdinal <= predecessor.lastAdmissionOrdinal);
    assertUniqueArtifactTruth([...artifacts, prepared.artifact]);
    return (appended) => {
        if (sha256Canonical(appended.event) !== sha256Canonical(event)) {
            throw new TypeError("artifact append differs from its exact pre-effect semantic projection");
        }
        const events = projectRuntimeEventsAtDurablePrefix(appended.successorPrefix);
        const actualPrefix = selectValidatedRuntimeEventPrefix(events);
        const actualFacts = runtimePrefixComputation(actualPrefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
        // The append receipt owns the actual prefix; the prepared row must be its
        // next actual event and have the same complete predecessor derivation.
        if (actualFacts === facts && facts.artifacts.length === artifacts.length &&
            events.length === predecessor.prefixEventCount + 1 && events.at(-1) === appended.event) {
            facts.accept(prepared);
        }
        return projectOwnedPrefixArtifactTruth(appended.successorPrefix);
    };
}
function refusal(prefix, code, input = {}) {
    return deepFreeze({
        kind: "exact_prefix_artifact_truth_projection_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        prefix,
        eventRefs: [...new Set(input.eventRefs ?? [])].sort(),
        authorityScopeRef: input.authorityScopeRef ?? null,
        conflictingFields: [...new Set(input.conflictingFields ?? [])].sort(),
    });
}
export function projectValidatedPrefixArtifactTruth(prefix, validatedPrefix) {
    const events = runtimeEventsFromValidatedPrefix(validatedPrefix);
    const folded = projectArtifactTruth(validatedPrefix);
    const rows = folded.artifacts.map((row) => deepFreeze({
        operationId: row.operationId,
        memberKey: row.memberKey,
        definitionDigest: row.definitionDigest,
        invocationRef: row.invocationRef,
        invocationPayloadDigest: row.invocationPayloadDigest,
        invocationDigest: row.invocationDigest,
        authorityScopeRef: row.authorityScopeRef,
        authorityScopeDigest: row.authorityScopeDigest,
        artifactRef: row.artifactRef,
        artifactDigest: row.artifactDigest,
        artifact: row.artifact,
        resolvedLock: row.resolvedLock,
        workspaceAuthorityBasis: row.workspaceAuthorityBasis,
        admissionEventRef: row.admissionEventRef,
        admissionEventDigest: row.admissionEventDigest,
        admissionOrdinal: row.admissionOrdinal,
        causationEventRefs: [...row.causationEventRefs],
    }));
    rows.sort((left, right) => left.authorityScopeRef < right.authorityScopeRef
        ? -1
        : left.authorityScopeRef > right.authorityScopeRef
            ? 1
            : left.admissionOrdinal - right.admissionOrdinal);
    const body = {
        kind: "exact_prefix_artifact_truth_projection",
        schemaVersion: "5.0.0",
        prefix,
        prefixEventCount: events.length,
        lastAdmissionOrdinal: events.at(-1)?.admissionOrdinal ?? 0,
        rows,
    };
    const projectionDigest = sha256Canonical(body);
    return deepFreeze({
        ...body,
        projectionRef: `artifact-truth-projection://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
    });
}
const ARTIFACT_DERIVATION = Symbol("owner_artifact_truth_derivation");
const ARTIFACT_DERIVATION_KEY = Symbol("owner_artifact_truth_derivation_construction");
class ArtifactTruthDerivation {
    #projection;
    #prefix;
    constructor(key, projection, prefix) {
        if (key !== ARTIFACT_DERIVATION_KEY)
            throw new TypeError("artifact truth derivation is owner constructed");
        this.#projection = projection;
        this.#prefix = prefix;
        Object.freeze(this);
    }
    static isFor(value) {
        if (typeof value !== "object" || value === null)
            return false;
        const proof = Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION)?.value;
        return typeof proof === "object" && proof !== null && #projection in proof && proof.#projection === value;
    }
    static prefix(value) {
        if (!this.isFor(value))
            return null;
        return Object.getOwnPropertyDescriptor(value, ARTIFACT_DERIVATION).value.#prefix;
    }
}
/** Pure consumers borrow the exact owner value; copies still reconstruct cold.
 * Explicit fresh validation below remains the acquisition/effect check. */
export function validateArtifactTruthProjectionValue(value) {
    return ArtifactTruthDerivation.isFor(value) || validateExactPrefixArtifactTruthProjection(value);
}
export function runtimePrefixFromArtifactTruth(value) {
    return ArtifactTruthDerivation.prefix(value);
}
export function projectExactPrefixArtifactTruth(prefix) {
    return deriveExactPrefixArtifactTruth(prefix, readRuntimeEventsAtDurablePrefix);
}
/** Pure projection from the existing authenticated coordinate receipt. Raw
 * coordinates have no receipt and retain the complete cold acquisition. */
export function projectOwnedPrefixArtifactTruth(prefix) {
    return deriveExactPrefixArtifactTruth(prefix, projectRuntimeEventsAtDurablePrefix);
}
function deriveExactPrefixArtifactTruth(prefix, eventsAtPrefix) {
    try {
        // Capture ordinary data once so a mutable/accessor-bearing caller cannot
        // make the validated read and the computation key name different inputs.
        const coordinate = captureDurablePrefixCoordinate(prefix);
        const events = eventsAtPrefix(coordinate);
        const validatedPrefix = selectValidatedRuntimeEventPrefix(events);
        const facts = runtimePrefixComputation(validatedPrefix, ARTIFACT_FACTS, () => new RuntimeArtifactFacts());
        const retained = facts.exactProjections.get(coordinate.coordinateDigest);
        if (retained !== undefined)
            return retained;
        const projection = { ...projectValidatedPrefixArtifactTruth(coordinate, validatedPrefix) };
        Object.defineProperty(projection, ARTIFACT_DERIVATION, {
            value: new ArtifactTruthDerivation(ARTIFACT_DERIVATION_KEY, projection, validatedPrefix),
        });
        const result = deepFreeze(projection);
        facts.exactProjections.set(coordinate.coordinateDigest, result);
        return result;
    }
    catch (error) {
        if (error instanceof ArtifactTruthHistoryError) {
            return refusal(prefix, error.code, {
                eventRefs: error.eventRefs,
                authorityScopeRef: error.authorityScopeRef,
                conflictingFields: error.conflictingFields,
            });
        }
        if (error instanceof DurablePrefixReadError) {
            return refusal(prefix, error.code);
        }
        return refusal(prefix, "event_envelope_invalid");
    }
}
export function validateExactPrefixArtifactTruthProjection(value, options = {}) {
    try {
        if (ArtifactTruthDerivation.isFor(value)) {
            // A live consumer retaining this actual acquisition checks ordinary
            // currentness. Historical byte validation keeps its existing contract.
            if (options.requireCurrent)
                assertDurableRuntimePrefixCurrent(value.prefix);
            else
                assertDurableRuntimePrefixBytes(value.prefix);
            return true;
        }
        if (typeof value !== "object" ||
            value === null ||
            !("prefix" in value))
            return false;
        const projected = projectExactPrefixArtifactTruth(value.prefix);
        if (options.requireCurrent && projected.kind === "exact_prefix_artifact_truth_projection")
            assertDurableRuntimePrefixCurrent(projected.prefix);
        return projected.kind === "exact_prefix_artifact_truth_projection" &&
            canonicalJson(projected) ===
                canonicalJson(value);
    }
    catch {
        return false;
    }
}
