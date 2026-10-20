import { isRecord } from "../shared/admission_predicates.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { validatePublicOperationBasis, } from "./environment_admission.js";
import { constructRuntimeFluent, deriveRuntimeEventCalculusProjection, holdsAt, } from "./event_calculus.js";
import { admitRuntimeEvent, admitRootEventProfileUpgrade, admitRuntimeEventTransactionAtDurablePrefix, assertHeldEventStoreAtDurablePrefix, projectRuntimeEventFromValidatedHistory, readHeldRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { selectValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { replayValidatedRuntimeEventPrefix } from "./replay.js";
import { ROOT_EVENT_PROFILE_DECLARATION_REF } from "./event_contract_profiles.js";
export const WITNESS_ADMISSION_MEMBER_KEYS = Object.freeze([
    "reprice",
    "attest",
    "hygiene-stamp",
    "intake",
    "run-resumed",
    "run-stopped",
]);
export const GRAPH_CHANGE_CLASS_VALUES = Object.freeze([
    "goal_reprice",
    "intent_reprice",
    "product_reprice",
    "requirement_reprice",
    "design_reframe",
    "realization_refactor",
]);
export const GRAPH_REENTRY_POINT_VALUES = Object.freeze([
    "goals",
    "intent",
    "product_definition",
    "requirements",
    "design_surface",
    "realization",
    "proof",
]);
export const RUN_STOP_REASON_KIND_VALUES = Object.freeze([
    "operator_stop",
    "operator_abort",
    "external_interruption",
    "campaign_close",
]);
export const RUN_RESUME_REASON_KIND_VALUES = Object.freeze([
    "operator_resume",
    "reprice_reentry",
    "external_recovery",
    "campaign_continue",
]);
export const WORKSPACE_HYGIENE_CLASSIFICATION_VALUES = Object.freeze([
    "clean",
    "foreign_write",
    "missing",
    "untracked",
]);
const SUBJECT_KIND_BY_MEMBER = Object.freeze({
    reprice: "authority_basis",
    attest: "evidence_claim",
    "hygiene-stamp": "workspace",
    intake: "intake_item",
    "run-resumed": "run",
    "run-stopped": "run",
});
const CONTEXT_KIND_BY_MEMBER = Object.freeze({
    reprice: "basis",
    attest: "basis",
    "hygiene-stamp": "workspace",
    intake: "segment",
    "run-resumed": "run",
    "run-stopped": "run",
});
const CONTENT_KIND_BY_MEMBER = Object.freeze({
    reprice: "typed_payload",
    attest: "typed_payload",
    "hygiene-stamp": "typed_payload",
    intake: "typed_payload",
    "run-resumed": "typed_reason",
    "run-stopped": "typed_reason",
});
const CONTENT_FIELDS_BY_MEMBER = Object.freeze({
    reprice: Object.freeze([
        "declarationRef",
        "beforeDigest",
        "afterDigest",
        "changeClass",
        "owningTicketRef",
        "reason",
    ]),
    attest: Object.freeze(["scope"]),
    "hygiene-stamp": Object.freeze(["observedBy", "observations"]),
    intake: Object.freeze([
        "owner",
        "changeClass",
        "reEntryPoint",
        "summary",
        "triagedBy",
    ]),
    "run-resumed": Object.freeze(["reasonKind", "reasonDetail"]),
    "run-stopped": Object.freeze(["reasonKind", "reasonDetail"]),
});
export const WITNESS_CONTENT_CONTRACTS = deepFreeze(Object.fromEntries(WITNESS_ADMISSION_MEMBER_KEYS.map((memberKey) => {
    const body = {
        kind: "witness_content_contract",
        schemaVersion: "5.0.0",
        memberKey,
        contentKind: CONTENT_KIND_BY_MEMBER[memberKey],
        closedFields: CONTENT_FIELDS_BY_MEMBER[memberKey],
    };
    const digest = sha256Canonical(body);
    return [memberKey, {
            ref: `contract://abiogenesis/witness/${memberKey}@5`,
            digest,
            ...body,
        }];
})));
function hasExactDataFields(value, fields) {
    const keys = Reflect.ownKeys(value);
    if (keys.some((key) => typeof key !== "string"))
        return false;
    const actual = keys.sort();
    const expected = [...fields].sort();
    if (actual.length !== expected.length ||
        actual.some((field, index) => field !== expected[index]))
        return false;
    return actual.every((field) => {
        const descriptor = Object.getOwnPropertyDescriptor(value, field);
        return descriptor !== undefined &&
            Object.hasOwn(descriptor, "value") &&
            !Object.hasOwn(descriptor, "get") &&
            !Object.hasOwn(descriptor, "set") &&
            descriptor.enumerable === true;
    });
}
function exactRef(value) {
    return typeof value === "string" && value.length > 0 && value.trim() === value;
}
function exactCoordinate(value) {
    return isRecord(value) &&
        hasExactDataFields(value, ["digest", "ref"]) &&
        exactRef(value.ref) &&
        isSha256Digest(value.digest);
}
function exactCoordinateSet(value) {
    return Array.isArray(value) &&
        value.length > 0 &&
        value.every(exactCoordinate) &&
        new Set(value.map((row) => row.ref)).size === value.length;
}
function sameCoordinate(left, right) {
    return left.ref === right.ref && left.digest === right.digest;
}
function refusal(memberKey, subjectRef, code, message, successorPrefix = null) {
    return deepFreeze({
        kind: "witness_admission_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        memberKey,
        subjectRef,
        code,
        message,
        successorPrefix,
    });
}
function expectedMemberKey(value) {
    return WITNESS_ADMISSION_MEMBER_KEYS.includes(value)
        ? value
        : "attest";
}
function validateContext(memberKey, context) {
    if (!isRecord(context) || context.kind !== CONTEXT_KIND_BY_MEMBER[memberKey]) {
        return false;
    }
    switch (context.kind) {
        case "basis":
            return hasExactDataFields(context, ["basis", "kind"]) &&
                exactCoordinate(context.basis);
        case "workspace":
            return hasExactDataFields(context, ["kind", "workspace"]) &&
                exactCoordinate(context.workspace);
        case "segment":
            return hasExactDataFields(context, ["kind", "run", "segment"]) &&
                exactCoordinate(context.run) && exactCoordinate(context.segment);
        case "run":
            return hasExactDataFields(context, ["basis", "kind", "run"]) &&
                exactCoordinate(context.run) && exactCoordinate(context.basis);
        default:
            return false;
    }
}
function isDigestOrNull(value) {
    return value === null || isSha256Digest(value);
}
function validateContentValue(memberKey, value) {
    if (!isRecord(value) ||
        !hasExactDataFields(value, CONTENT_FIELDS_BY_MEMBER[memberKey]))
        return false;
    switch (memberKey) {
        case "reprice":
            return exactRef(value.declarationRef) &&
                isSha256Digest(value.beforeDigest) &&
                isSha256Digest(value.afterDigest) &&
                value.beforeDigest !== value.afterDigest &&
                GRAPH_CHANGE_CLASS_VALUES.includes(value.changeClass) &&
                exactRef(value.owningTicketRef) && exactRef(value.reason);
        case "attest":
            return value.scope === "selected_prefix";
        case "hygiene-stamp":
            return exactRef(value.observedBy) &&
                Array.isArray(value.observations) &&
                value.observations.length > 0 &&
                value.observations.every((row) => isRecord(row) &&
                    hasExactDataFields(row, [
                        "artifactRef",
                        "copyOutRef",
                        "observedDigest",
                    ]) &&
                    exactRef(row.artifactRef) &&
                    isDigestOrNull(row.observedDigest) &&
                    (row.copyOutRef === null || exactRef(row.copyOutRef))) &&
                new Set(value.observations.map((row) => row.artifactRef)).size === value.observations.length;
        case "intake":
            return exactRef(value.owner) &&
                GRAPH_CHANGE_CLASS_VALUES.includes(value.changeClass) &&
                GRAPH_REENTRY_POINT_VALUES.includes(value.reEntryPoint) &&
                exactRef(value.summary) && exactRef(value.triagedBy);
        case "run-resumed":
            return RUN_RESUME_REASON_KIND_VALUES.includes(value.reasonKind) &&
                exactRef(value.reasonDetail);
        case "run-stopped":
            return RUN_STOP_REASON_KIND_VALUES.includes(value.reasonKind) &&
                exactRef(value.reasonDetail);
    }
}
function validatePacket(supplied) {
    const memberKey = expectedMemberKey(isRecord(supplied) ? supplied.memberKey : undefined);
    let admitted;
    try {
        admitted = admitIJsonValue(supplied, "witness admission packet");
    }
    catch {
        return refusal(memberKey, null, "content_invalid", "witness admission requires one exact canonical I-JSON packet");
    }
    if (!isRecord(admitted) ||
        !hasExactDataFields(admitted, [
            "act",
            "actor",
            "content",
            "context",
            "evidence",
            "kind",
            "memberKey",
            "prefix",
            "provenance",
            "schemaVersion",
            "subject",
        ]) ||
        admitted.kind !== "witness_admit_packet" ||
        admitted.schemaVersion !== "5.0.0" ||
        admitted.memberKey !== memberKey ||
        admitted.act !== memberKey ||
        !exactCoordinate(admitted.actor) ||
        !isRecord(admitted.subject) ||
        !hasExactDataFields(admitted.subject, ["digest", "kind", "ref"]) ||
        admitted.subject.kind !== SUBJECT_KIND_BY_MEMBER[memberKey] ||
        !exactRef(admitted.subject.ref) ||
        !isSha256Digest(admitted.subject.digest) ||
        !isRecord(admitted.content) ||
        !hasExactDataFields(admitted.content, [
            "contentContract",
            "kind",
            "value",
            "valueDigest",
            "valueRef",
        ]) ||
        admitted.content.kind !== CONTENT_KIND_BY_MEMBER[memberKey] ||
        !exactCoordinate(admitted.content.contentContract) ||
        !sameCoordinate(admitted.content.contentContract, WITNESS_CONTENT_CONTRACTS[memberKey]) ||
        !exactRef(admitted.content.valueRef) ||
        !isSha256Digest(admitted.content.valueDigest) ||
        admitted.content.valueDigest !== sha256Canonical(admitted.content.value) ||
        admitted.content.valueRef !==
            `witness-content://abiogenesis/${admitted.content.valueDigest.slice("sha256:".length)}` ||
        !validateContentValue(memberKey, admitted.content.value) ||
        !validateContext(memberKey, admitted.context) ||
        !exactCoordinateSet(admitted.evidence) ||
        !exactCoordinateSet(admitted.provenance) ||
        !isRecord(admitted.prefix)) {
        return refusal(memberKey, isRecord(admitted) && isRecord(admitted.subject) &&
            exactRef(admitted.subject.ref)
            ? admitted.subject.ref
            : null, "content_invalid", "witness admission packet differs from its exact indexed owner contract");
    }
    return admitted;
}
function validateAuthority(packet, authority, dependencies) {
    if (!isRecord(authority) ||
        !hasExactDataFields(authority, [
            "actor",
            "capabilityGrant",
            "dependencyLock",
            "executionBasis",
            "kind",
            "operationBasis",
            "predecessorPrefix",
            "productSet",
            "schemaVersion",
            "workspaceBinding",
        ]) ||
        authority.kind !== "witness_admission_authority" ||
        authority.schemaVersion !== "5.0.0" ||
        !exactCoordinate(authority.actor) ||
        !exactCoordinate(authority.capabilityGrant) ||
        !exactCoordinate(authority.dependencyLock) ||
        !exactCoordinate(authority.productSet) ||
        !exactCoordinate(authority.workspaceBinding) ||
        (authority.executionBasis !== null &&
            !exactCoordinate(authority.executionBasis)) ||
        !sameCoordinate(packet.actor, authority.actor) ||
        !isRecord(authority.predecessorPrefix) ||
        authority.predecessorPrefix.coordinateDigest !== packet.prefix.coordinateDigest ||
        authority.operationBasis.authorityScopeRef !== authority.workspaceBinding.ref ||
        authority.operationBasis.authorityScopeDigest !== authority.workspaceBinding.digest ||
        validatePublicOperationBasis(authority.operationBasis, "abg.operation.witness.admit", packet.memberKey) !== null) {
        return refusal(packet.memberKey, packet.subject.ref, "basis_mismatch", "witness admission authority differs from the selected definition, actor, workspace, or prefix");
    }
    const requiresExecutionBasis = packet.context.kind === "run" ||
        packet.context.kind === "segment";
    if (requiresExecutionBasis !== (authority.executionBasis !== null) ||
        (packet.context.kind === "run" &&
            !sameCoordinate(packet.context.basis, authority.executionBasis))) {
        return refusal(packet.memberKey, packet.subject.ref, "basis_mismatch", "witness context and exact execution-basis authority disagree");
    }
    if (!isRecord(dependencies) ||
        !hasExactDataFields(dependencies, ["eventStore", "kind", "schemaVersion"]) ||
        dependencies.kind !== "witness_admission_dependencies" ||
        dependencies.schemaVersion !== "5.0.0" ||
        typeof dependencies.eventStore?.readAll !== "function") {
        return refusal(packet.memberKey, packet.subject.ref, "basis_mismatch", "witness admission requires one prebound installed ABG event store");
    }
    try {
        assertHeldEventStoreAtDurablePrefix(dependencies.eventStore, packet.prefix);
    }
    catch {
        return refusal(packet.memberKey, packet.subject.ref, "basis_mismatch", "witness admission requires the exact held durable predecessor");
    }
    return null;
}
function eventPayload(event) {
    return isRecord(event.payload)
        ? event.payload
        : null;
}
function hasExactBasis(events, basis) {
    return events.some((event) => {
        const payload = eventPayload(event);
        return event.kind === "basis_admitted" &&
            payload?.basisRef === basis.ref && payload.basisDigest === basis.digest;
    });
}
function selectRunOpen(events, run, basis) {
    const matches = events.filter((event) => {
        const payload = eventPayload(event);
        return event.kind === "run_segment_opened" &&
            event.runId === run.ref &&
            payload?.runId === run.ref &&
            payload.runDigest === run.digest &&
            payload.executionBasisRef === basis.ref &&
            payload.executionBasisDigest === basis.digest;
    });
    return matches.length === 1 ? matches[0] : null;
}
function witnessedActBody(packet) {
    return {
        act: packet.act,
        actor: packet.actor,
        subject: packet.subject,
        content: {
            kind: packet.content.kind,
            contractRef: packet.content.contentContract.ref,
            contractDigest: packet.content.contentContract.digest,
            valueRef: packet.content.valueRef,
            valueDigest: packet.content.valueDigest,
            value: packet.content.value,
        },
        context: packet.context,
        evidence: packet.evidence,
        provenance: packet.provenance,
    };
}
function commonWitnessPayload(packet, witnessedActRef, witnessedActDigest) {
    return {
        act: packet.act,
        actorRef: packet.actor.ref,
        actorDigest: packet.actor.digest,
        subjectKind: packet.subject.kind,
        subjectRef: packet.subject.ref,
        subjectDigest: packet.subject.digest,
        contentKind: packet.content.kind,
        contentContractRef: packet.content.contentContract.ref,
        contentContractDigest: packet.content.contentContract.digest,
        contentValueRef: packet.content.valueRef,
        contentValueDigest: packet.content.valueDigest,
        contentValue: packet.content.value,
        context: packet.context,
        evidence: packet.evidence,
        provenance: packet.provenance,
        witnessedActRef,
        witnessedActDigest,
    };
}
function publicOperationCandidate(packet, authority) {
    const basis = authority.operationBasis;
    return {
        kind: "public_operation_admitted",
        eventTime: basis.eventTime,
        aggregateType: "workspace",
        aggregateId: authority.workspaceBinding.ref,
        parentAggregateId: basis.invocationRef,
        causationEventRefs: basis.causationEventRefs,
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: basis.authorityScopeRef,
        payload: {
            operationId: basis.operationId,
            memberKey: basis.memberKey,
            definitionDigest: basis.definitionDigest,
            invocationRef: basis.invocationRef,
            invocationPayloadDigest: basis.invocationPayloadDigest,
            invocationDigest: basis.invocationDigest,
            authorityScopeRef: basis.authorityScopeRef,
            authorityScopeDigest: basis.authorityScopeDigest,
            workspaceBindingRef: authority.workspaceBinding.ref,
            workspaceBindingDigest: authority.workspaceBinding.digest,
            productSetRef: authority.productSet.ref,
            productSetDigest: authority.productSet.digest,
            dependencyLockRef: authority.dependencyLock.ref,
            dependencyLockDigest: authority.dependencyLock.digest,
            actorRef: authority.actor.ref,
            actorDigest: authority.actor.digest,
            capabilityGrantRef: authority.capabilityGrant.ref,
            capabilityGrantDigest: authority.capabilityGrant.digest,
            ...(authority.executionBasis === null
                ? {}
                : {
                    executionBasisRef: authority.executionBasis.ref,
                    executionBasisDigest: authority.executionBasis.digest,
                }),
        },
    };
}
function prepareSemanticEvent(packet, authority, events, publicOperationEventRef) {
    const body = witnessedActBody(packet);
    const witnessedActDigest = sha256Canonical(body);
    const witnessedActRef = `witnessed-act://abiogenesis/${witnessedActDigest.slice("sha256:".length)}`;
    const common = commonWitnessPayload(packet, witnessedActRef, witnessedActDigest);
    const content = packet.content.value;
    const operationBasis = authority.operationBasis;
    const causationEventRefs = Object.freeze([
        ...new Set([...operationBasis.causationEventRefs, publicOperationEventRef]),
    ]);
    const workspaceEnvelope = (kind, payload) => ({
        kind,
        eventTime: operationBasis.eventTime,
        aggregateType: "workspace",
        aggregateId: authority.workspaceBinding.ref,
        parentAggregateId: operationBasis.invocationRef,
        causationEventRefs,
        correlationId: operationBasis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: packet.context.kind === "basis"
            ? packet.context.basis.ref
            : authority.workspaceBinding.ref,
        payload,
    });
    const runEnvelope = (kind, runId, basisId, payload) => ({
        kind,
        eventTime: operationBasis.eventTime,
        aggregateType: "run",
        aggregateId: runId,
        parentAggregateId: operationBasis.invocationRef,
        causationEventRefs,
        correlationId: operationBasis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "run",
        basisId,
        runId,
        payload,
    });
    switch (packet.memberKey) {
        case "reprice": {
            if (packet.context.kind !== "basis" ||
                !sameCoordinate(packet.subject, packet.context.basis) ||
                !hasExactBasis(events, packet.context.basis)) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "declaration reprice requires the exact admitted authority basis it changes");
            }
            const repriceBody = {
                declarationRef: content.declarationRef,
                beforeDigest: content.beforeDigest,
                afterDigest: content.afterDigest,
                changeClass: content.changeClass,
                owningTicketRef: content.owningTicketRef,
            };
            return {
                witnessedActRef,
                witnessedActDigest,
                candidate: workspaceEnvelope("declaration_reprice_admitted", {
                    ...common,
                    ...repriceBody,
                    repriceRef: `declaration-reprice:${sha256Canonical(repriceBody)}`,
                    operatorActorRef: packet.actor.ref,
                    reason: content.reason,
                }),
            };
        }
        case "attest": {
            if (packet.context.kind !== "basis" ||
                !hasExactBasis(events, packet.context.basis) ||
                packet.subject.ref !== packet.prefix.eventLogRef ||
                packet.subject.digest !== packet.prefix.prefixDigest) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "replay attestation subject must be the exact selected durable prefix");
            }
            const chainDigest = sha256Canonical({
                kind: "canonical_replay_chain",
                schemaVersion: "5.0.0",
                events,
            });
            const attestationBody = {
                basisId: packet.context.basis.ref,
                chainDigest,
                eventCount: events.length,
                attestedBy: packet.actor.ref,
            };
            return {
                witnessedActRef,
                witnessedActDigest,
                candidate: workspaceEnvelope("replay_log_attested", {
                    ...common,
                    attestationRef: `replay-attestation:${sha256Canonical(attestationBody)}`,
                    chainDigest,
                    eventCount: events.length,
                    attestedBy: packet.actor.ref,
                }),
            };
        }
        case "hygiene-stamp": {
            if (packet.context.kind !== "workspace" ||
                !sameCoordinate(packet.subject, packet.context.workspace) ||
                !sameCoordinate(packet.context.workspace, authority.workspaceBinding)) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "workspace hygiene requires the exact admitted workspace binding");
            }
            const observations = content.observations;
            const rows = [];
            for (const observation of observations) {
                const admitted = events.filter((event) => {
                    const payload = eventPayload(event);
                    return event.kind === "public_operation_artifact_admitted" &&
                        payload?.artifactRef === observation.artifactRef;
                });
                if (admitted.length > 1) {
                    return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "workspace hygiene found ambiguous admitted artifact truth");
                }
                const admittedDigest = admitted.length === 0
                    ? null
                    : eventPayload(admitted[0])?.artifactDigest;
                const classification = observation.observedDigest === null &&
                    admittedDigest === null
                    ? null
                    : observation.observedDigest === null
                        ? "missing"
                        : admittedDigest === null
                            ? "untracked"
                            : observation.observedDigest === admittedDigest
                                ? "clean"
                                : "foreign_write";
                if (classification === null ||
                    (classification === "foreign_write" && observation.copyOutRef === null)) {
                    return refusal(packet.memberKey, packet.subject.ref, "evidence_invalid", "workspace hygiene requires observable truth and copy-out for every foreign write");
                }
                rows.push({
                    artifactRef: observation.artifactRef,
                    observedDigest: observation.observedDigest,
                    admittedDigest,
                    classification,
                    copyOutRef: observation.copyOutRef,
                });
            }
            const hygieneBody = {
                basisId: authority.workspaceBinding.ref,
                segmentRef: null,
                observedBy: content.observedBy,
                rows,
            };
            return {
                witnessedActRef,
                witnessedActDigest,
                candidate: workspaceEnvelope("workspace_hygiene_stamped", {
                    ...common,
                    hygieneRef: `workspace-hygiene:${sha256Canonical(hygieneBody)}`,
                    segmentRef: null,
                    observedBy: content.observedBy,
                    rows,
                }),
            };
        }
        case "intake": {
            if (packet.context.kind !== "segment" ||
                authority.executionBasis === null) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "defect intake requires one exact admitted Run segment");
            }
            const runOpen = selectRunOpen(events, packet.context.run, authority.executionBasis);
            if (runOpen === null ||
                packet.context.segment.ref !== runOpen.eventId ||
                packet.context.segment.digest !==
                    sha256Canonical(runOpen)) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "defect intake segment differs from admitted Run truth");
            }
            const fullPrefix = selectValidatedRuntimeEventPrefix(events);
            const replay = replayValidatedRuntimeEventPrefix(selectValidatedRuntimeEventPrefix(events, {
                runId: packet.context.run.ref,
            }), fullPrefix);
            if (!["blocked", "failed", "gap_stopped", "stopped"].includes(replay.runtimeStatus)) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "defect intake requires replay-derived halted Run truth");
            }
            const haltBody = {
                runId: replay.runId,
                runtimeStatus: replay.runtimeStatus,
                routeRefs: replay.routes.map((route) => route.routeRef),
                resultRefs: replay.cCalls.flatMap((row) => row.resultRef === null ? [] : [row.resultRef]),
            };
            const haltDiagnosisDigest = sha256Canonical(haltBody);
            const haltDiagnosisRef = `halt-diagnosis://abiogenesis/${haltDiagnosisDigest.slice("sha256:".length)}`;
            if (packet.subject.ref !== haltDiagnosisRef ||
                packet.subject.digest !== haltDiagnosisDigest) {
                return refusal(packet.memberKey, packet.subject.ref, "subject_missing", "defect intake subject differs from the replay-derived halt diagnosis");
            }
            const intakeBody = {
                basisId: authority.executionBasis.ref,
                haltDiagnosisRef,
                owner: content.owner,
                changeClass: content.changeClass,
                reEntryPoint: content.reEntryPoint,
                summary: content.summary,
                evidenceRefs: packet.evidence.map((row) => row.ref),
                triagedBy: content.triagedBy,
            };
            return {
                witnessedActRef,
                witnessedActDigest,
                candidate: runEnvelope("defect_intake_admitted", packet.context.run.ref, authority.executionBasis.ref, {
                    ...common,
                    intakeRef: `defect-intake:${sha256Canonical(intakeBody)}`,
                    haltDiagnosisRef,
                    haltDiagnosisDigest,
                    owner: content.owner,
                    changeClass: content.changeClass,
                    reEntryPoint: content.reEntryPoint,
                    summary: content.summary,
                    triagedBy: content.triagedBy,
                }),
            };
        }
        case "run-resumed":
        case "run-stopped": {
            if (packet.context.kind !== "run" ||
                authority.executionBasis === null ||
                !sameCoordinate(packet.subject, packet.context.run) ||
                !sameCoordinate(packet.context.basis, authority.executionBasis) ||
                selectRunOpen(events, packet.context.run, packet.context.basis) === null) {
                return refusal(packet.memberKey, packet.subject.ref, "context_mismatch", "operator lifecycle act requires the exact admitted Run and execution basis");
            }
            const runPrefix = selectValidatedRuntimeEventPrefix(events, {
                runId: packet.context.run.ref,
            });
            const calculus = deriveRuntimeEventCalculusProjection(runPrefix);
            const current = packet.memberKey === "run-stopped"
                ? holdsAt(calculus, constructRuntimeFluent({
                    name: "run_active",
                    identity: packet.context.run.ref,
                }))
                : holdsAt(calculus, constructRuntimeFluent({
                    name: "operator_run_stopped",
                    identity: packet.context.run.ref,
                }));
            if (!current) {
                return refusal(packet.memberKey, packet.subject.ref, "act_forbidden", packet.memberKey === "run-stopped"
                    ? "operator stop requires one currently active Run"
                    : "operator resume requires one currently operator-stopped Run");
            }
            return {
                witnessedActRef,
                witnessedActDigest,
                candidate: runEnvelope(packet.memberKey === "run-resumed" ? "run_resumed" : "run_stopped", packet.context.run.ref, packet.context.basis.ref, {
                    ...common,
                    operatorActorRef: packet.actor.ref,
                    reasonKind: content.reasonKind,
                    reasonDetail: content.reasonDetail,
                }),
            };
        }
    }
}
export function admitWitnessedAct(supplied, authority, dependencies) {
    const packetResult = validatePacket(supplied);
    if (packetResult.kind === "witness_admission_refusal") {
        return packetResult;
    }
    const packet = packetResult;
    const authorityRefusal = validateAuthority(packet, authority, dependencies);
    if (authorityRefusal !== null) {
        return authorityRefusal;
    }
    // I-JSON admission deliberately copies the packet. Authority validation has
    // already joined that coordinate to this live owner; retain that relation.
    const events = readHeldRuntimeEventsAtDurablePrefix(dependencies.eventStore, packet.prefix);
    const duplicates = events.filter((event) => {
        const payload = eventPayload(event);
        return event.kind === "public_operation_admitted" &&
            payload?.invocationRef === authority.operationBasis.invocationRef;
    });
    if (duplicates.length !== 0) {
        return refusal(packet.memberKey, packet.subject.ref, "duplicate_invocation", "witness invocation identity is already present in admitted event truth", packet.prefix);
    }
    try {
        const publicCandidate = publicOperationCandidate(packet, authority);
        const projectedPublicOperationEvent = projectRuntimeEventFromValidatedHistory(events, publicCandidate);
        const prepared = prepareSemanticEvent(packet, authority, events, projectedPublicOperationEvent.eventId);
        if ("kind" in prepared && prepared.kind === "witness_admission_refusal") {
            return prepared;
        }
        const admittedPreparation = prepared;
        const isProfileUpgrade = packet.memberKey === "reprice" &&
            packet.content.value.declarationRef === ROOT_EVENT_PROFILE_DECLARATION_REF;
        const committed = isProfileUpgrade
            ? (() => {
                const upgraded = admitRootEventProfileUpgrade(dependencies.eventStore, packet.prefix, publicCandidate, admittedPreparation.candidate);
                return { ...upgraded, value: { ...upgraded.value, prepared: admittedPreparation } };
            })()
            : admitRuntimeEventTransactionAtDurablePrefix(dependencies.eventStore, packet.prefix, () => {
                const publicOperationEvent = admitRuntimeEvent(dependencies.eventStore, publicCandidate);
                if (publicOperationEvent.eventId !== projectedPublicOperationEvent.eventId) {
                    throw new TypeError("witness public-operation preflight identity changed");
                }
                const admittedEvent = admitRuntimeEvent(dependencies.eventStore, admittedPreparation.candidate);
                return { publicOperationEvent, admittedEvent, prepared: admittedPreparation };
            });
        if (committed.successorPrefix === null) {
            throw new TypeError("witness admission produced no durable successor");
        }
        const value = committed.value;
        return deepFreeze({
            kind: "witness_admission",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            memberKey: packet.memberKey,
            act: packet.act,
            witnessedActRef: value.prepared.witnessedActRef,
            witnessedActDigest: value.prepared.witnessedActDigest,
            publicOperationEventRef: value.publicOperationEvent.eventId,
            admittedEventRef: value.admittedEvent.eventId,
            evidence: packet.evidence,
            successorPrefix: committed.successorPrefix,
        });
    }
    catch (error) {
        return refusal(packet.memberKey, packet.subject.ref, "sink_unavailable", `witness admission appended no partial truth: ${String(error)}`);
    }
}
export const WitnessAdmissionPort = Object.freeze({
    admit: admitWitnessedAct,
});
export const WITNESS_OPERATION_CONTRACTS = Object.freeze({
    admit: Object.freeze({
        reprice: WitnessAdmissionPort.admit,
        attest: WitnessAdmissionPort.admit,
        "hygiene-stamp": WitnessAdmissionPort.admit,
        intake: WitnessAdmissionPort.admit,
        "run-resumed": WitnessAdmissionPort.admit,
        "run-stopped": WitnessAdmissionPort.admit,
    }),
});
