import { isRecord, hasObjectUnicodeNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { admitIJsonValue } from "../shared/i_json.js";
import { deepFreeze } from "../shared/immutable.js";
import { assertHeldEventStoreAtDurablePrefix, compareAndAppendExpectedPrefix, readRuntimeEventsAtDurablePrefix, } from "../abg/event_store.js";
import { runtimeEventPrefixDigest, selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import { rehydrateExecutionBasisAtPrefix, } from "../abg/execution_basis.js";
import { isAdmittedCCallResult, } from "../abg/c_call.js";
import { parseProductPublicContract } from "./verify_product.js";
export const RESULT_ASSESS_CAPABILITY = "abg.capability.runtime.admit-fp-result@5";
function exactRef(value) {
    return typeof value === "string" && value.length > 0 && value.trim() === value;
}
function validRefDigest(value) {
    return isRecord(value) &&
        hasExactKeys(value, ["digest", "ref"]) &&
        exactRef(value.ref) &&
        isSha256Digest(value.digest);
}
function sameCoordinate(left, right) {
    return left.ref === right.ref && left.digest === right.digest;
}
function refusal(code, message, issuePaths, evidenceRefs = []) {
    return deepFreeze({
        kind: "result_assessment_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        memberKey: "assess",
        code,
        message,
        issuePaths: [...new Set(issuePaths)].sort(compareUnicodeCodeUnits),
        evidenceRefs: [...new Set(evidenceRefs)].sort(compareUnicodeCodeUnits),
    });
}
function validResidual(value) {
    return isRecord(value) &&
        hasExactKeys(value, ["code", "kind", "message", "subjectRef"]) &&
        value.kind === "typed_residual" &&
        exactRef(value.code) &&
        exactRef(value.subjectRef) &&
        exactRef(value.message);
}
function validDeclaredValue(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "closureEligible",
            "disposition",
            "expectedResult",
            "kind",
            "residuals",
            "schemaVersion",
        ]) ||
        value.kind !== "result_assessment_value" ||
        value.schemaVersion !== "5.0.0" ||
        !validRefDigest(value.expectedResult) ||
        !["admitted", "blocked", "rejected", "retry"].includes(String(value.disposition)) ||
        typeof value.closureEligible !== "boolean" ||
        !Array.isArray(value.residuals) ||
        value.residuals.some((row) => !validResidual(row)) ||
        new Set(value.residuals.map((row) => sha256Canonical(row))).size !== value.residuals.length)
        return false;
    if ((value.disposition !== "admitted" && value.closureEligible) ||
        ((value.disposition === "blocked" || value.disposition === "retry") &&
            value.residuals.length === 0))
        return false;
    return true;
}
function validContractAdmittedValue(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "contract",
            "kind",
            "schemaVersion",
            "value",
            "valueDigest",
            "valueRef",
        ]) ||
        value.kind !== "contract_admitted_assessment_value" ||
        value.schemaVersion !== "5.0.0" ||
        !validRefDigest(value.contract) ||
        !exactRef(value.valueRef) ||
        !isSha256Digest(value.valueDigest) ||
        !validDeclaredValue(value.value))
        return false;
    const digest = sha256Canonical(value.value);
    return value.valueDigest === digest &&
        value.valueRef ===
            `assessment-value://abiogenesis/${digest.slice("sha256:".length)}`;
}
function validPacket(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "assessment",
            "assessmentContract",
            "currentBasis",
            "evidence",
            "expectedResult",
            "kind",
            "memberKey",
            "schemaVersion",
        ]) &&
        value.kind === "result_assess_packet" &&
        value.schemaVersion === "5.0.0" &&
        value.memberKey === "assess" &&
        validRefDigest(value.expectedResult) &&
        validRefDigest(value.assessmentContract) &&
        validContractAdmittedValue(value.assessment) &&
        Array.isArray(value.evidence) &&
        value.evidence.length > 0 &&
        value.evidence.every(validRefDigest) &&
        new Set(value.evidence.map((row) => row.ref)).size === value.evidence.length &&
        validRefDigest(value.currentBasis);
}
function validCapabilityGrant(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actorRef",
            "capabilityRef",
            "grantDigest",
            "grantRef",
            "kind",
            "operationId",
            "schemaVersion",
        ]) ||
        value.kind !== "result_assessment_capability_grant" ||
        value.schemaVersion !== "5.0.0" ||
        !exactRef(value.grantRef) ||
        !isSha256Digest(value.grantDigest) ||
        !exactRef(value.actorRef) ||
        value.operationId !== "abg.operation.result.assess" ||
        value.capabilityRef !== RESULT_ASSESS_CAPABILITY)
        return false;
    const digest = sha256Canonical({
        actorRef: value.actorRef,
        operationId: value.operationId,
        capabilityRef: value.capabilityRef,
    });
    return value.grantDigest === digest &&
        value.grantRef ===
            `capability-grant://abiogenesis/${digest.slice("sha256:".length)}`;
}
function validInvocationAuthority(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "actor",
            "authorityDigest",
            "authorityRef",
            "capabilityGrant",
            "currentBasis",
            "invocationDigest",
            "invocationRef",
            "kind",
            "schemaVersion",
        ]) ||
        value.kind !== "result_assessment_invocation_authority" ||
        value.schemaVersion !== "5.0.0" ||
        !exactRef(value.authorityRef) ||
        !isSha256Digest(value.authorityDigest) ||
        !exactRef(value.invocationRef) ||
        !isSha256Digest(value.invocationDigest) ||
        !validRefDigest(value.actor) ||
        !validCapabilityGrant(value.capabilityGrant) ||
        !validRefDigest(value.currentBasis))
        return false;
    const actorDigest = sha256Canonical({ actorRef: value.actor.ref });
    if (value.actor.digest !== actorDigest ||
        value.capabilityGrant.actorRef !== value.actor.ref)
        return false;
    const body = {
        invocationRef: value.invocationRef,
        invocationDigest: value.invocationDigest,
        actor: value.actor,
        capabilityGrant: value.capabilityGrant,
        currentBasis: value.currentBasis,
    };
    const digest = sha256Canonical(body);
    return value.authorityDigest === digest &&
        value.authorityRef ===
            `result-assessment-authority://abiogenesis/${digest.slice("sha256:".length)}`;
}
function exactAssessmentContract(value, coordinate) {
    if (!isRecord(value) || typeof value.owningProduct !== "string")
        return false;
    const parsed = parseProductPublicContract(value, value.owningProduct);
    return parsed !== null &&
        parsed.contractId === coordinate.ref &&
        parsed.contractDigest === coordinate.digest &&
        parsed.capabilityIdentities.includes(RESULT_ASSESS_CAPABILITY);
}
function runtimeResultAtPrefix(events, coordinate) {
    const matches = events.filter((event) => event.kind === "c_call_result_admitted" &&
        isRecord(event.payload) &&
        event.payload.resultRef === coordinate.ref &&
        event.payload.resultDigest === coordinate.digest);
    if (matches.length !== 1)
        return null;
    const event = matches[0];
    if (!isRecord(event.payload))
        return null;
    const result = {
        kind: "admitted_c_call_result",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        resultRef: event.payload.resultRef,
        resultDigest: event.payload.resultDigest,
        valueDigest: event.payload.valueDigest,
        cCallRef: event.payload.cCallRef,
        resultClass: event.payload.resultClass,
        contractRef: event.payload.contractRef,
        valueKind: event.payload.valueKind,
        value: event.payload.value,
        evidenceRefs: event.payload.evidenceRefs,
        admissionEventRef: event.eventId,
    };
    return isAdmittedCCallResult(result) &&
        event.aggregateType === "c_call" &&
        event.aggregateId === result.cCallRef
        ? deepFreeze({ result, event })
        : null;
}
function exactEvidenceEvents(events, cCallRef, evidence) {
    const rows = evidence.map((coordinate) => {
        const matches = events.filter((event) => event.kind === "c_call_evidenced" &&
            event.aggregateId === cCallRef &&
            isRecord(event.payload) &&
            event.payload.evidenceRef === coordinate.ref &&
            event.payload.evidenceDigest === coordinate.digest);
        return matches.length === 1 ? matches[0] : null;
    });
    return rows.some((row) => row === null)
        ? null
        : rows;
}
function exactContext(value) {
    if (!isRecord(value))
        return false;
    return Object.hasOwn(value, "store") &&
        Object.hasOwn(value, "predecessorPrefix") &&
        Object.hasOwn(value, "assessmentContract") &&
        Object.hasOwn(value, "invocationAuthority") &&
        exactRef(value.eventTime) &&
        !Number.isNaN(Date.parse(value.eventTime)) &&
        exactRef(value.correlationId) &&
        Array.isArray(value.causationEventRefs) &&
        value.causationEventRefs.every(exactRef) &&
        new Set(value.causationEventRefs).size === value.causationEventRefs.length;
}
function assessmentTruth(packet, authority) {
    return deepFreeze({
        expectedResult: packet.expectedResult,
        assessmentContract: packet.assessmentContract,
        assessmentValue: {
            ref: packet.assessment.valueRef,
            digest: packet.assessment.valueDigest,
        },
        disposition: packet.assessment.value.disposition,
        closureEligible: packet.assessment.value.closureEligible,
        residuals: packet.assessment.value.residuals,
        evidence: packet.evidence,
        currentBasis: packet.currentBasis,
        actor: authority.actor,
        capabilityGrant: {
            ref: authority.capabilityGrant.grantRef,
            digest: authority.capabilityGrant.grantDigest,
        },
        invocation: {
            ref: authority.invocationRef,
            digest: authority.invocationDigest,
        },
    });
}
export function assessResult(supplied, suppliedContext) {
    let admitted;
    try {
        admitted = admitIJsonValue(supplied, "result assessment packet");
    }
    catch {
        return refusal("value_mismatch", "result assessment requires one exact canonical I-JSON request", ["/"]);
    }
    if (!validPacket(admitted)) {
        return refusal("value_mismatch", "result assessment request differs from the closed owner packet", ["/"]);
    }
    const packet = admitted;
    if (!sameCoordinate(packet.assessmentContract, packet.assessment.contract) ||
        !sameCoordinate(packet.expectedResult, packet.assessment.value.expectedResult)) {
        return refusal("contract_mismatch", "assessment value must bind the request's exact contract and expected result", ["/assessment/contract", "/assessment/value/expectedResult"]);
    }
    if (!exactContext(suppliedContext)) {
        return refusal("basis_mismatch", "result assessment requires one exact owner invocation context", ["/invocationAuthority"]);
    }
    const context = suppliedContext;
    if (!validInvocationAuthority(context.invocationAuthority)) {
        return refusal("capability_mismatch", "result assessment requires one content-addressed actor capability authority", ["/invocationAuthority"]);
    }
    const authority = context.invocationAuthority;
    if (!sameCoordinate(authority.currentBasis, packet.currentBasis) ||
        authority.capabilityGrant.capabilityRef !== RESULT_ASSESS_CAPABILITY) {
        return refusal("capability_mismatch", "invocation authority must bind the packet basis and dedicated result-assessment capability", ["/invocationAuthority/capabilityGrant", "/invocationAuthority/currentBasis"]);
    }
    if (!exactAssessmentContract(context.assessmentContract, packet.assessmentContract)) {
        return refusal("contract_mismatch", "the declared Product contract does not admit this assessment operation", ["/assessmentContract"]);
    }
    let events;
    try {
        assertHeldEventStoreAtDurablePrefix(context.store, context.predecessorPrefix);
        events = readRuntimeEventsAtDurablePrefix(context.predecessorPrefix);
        if (context.store.digest() !==
            sha256Canonical(events))
            throw new TypeError("held store differs from predecessor event truth");
    }
    catch {
        return refusal("basis_mismatch", "result assessment requires the exact held expected-prefix store", ["/currentBasis"]);
    }
    let prefix;
    try {
        prefix = selectValidatedRuntimeEventPrefix(events);
    }
    catch {
        return refusal("basis_mismatch", "result assessment requires one valid immutable runtime prefix", ["/currentBasis"]);
    }
    const currentBasis = rehydrateExecutionBasisAtPrefix(prefix, packet.currentBasis.ref);
    if (currentBasis === null ||
        currentBasis.basisDigest !== packet.currentBasis.digest ||
        currentBasis.actorRef !== authority.actor.ref) {
        return refusal("basis_mismatch", "current basis must be admitted at the prefix and attributed to the authorized actor", ["/currentBasis", "/invocationAuthority/actor"]);
    }
    const projectedResult = runtimeResultAtPrefix(events, packet.expectedResult);
    if (projectedResult === null) {
        return refusal("result_mismatch", "expected result is not one exact admitted runtime result at the prefix", ["/expectedResult"]);
    }
    if (projectedResult.event.basisId !== currentBasis.basisRef) {
        return refusal("basis_mismatch", "expected result was not admitted under the selected current basis", ["/expectedResult", "/currentBasis"]);
    }
    if (projectedResult.event.runId === undefined ||
        projectedResult.event.graphCallId === undefined ||
        projectedResult.event.frameId === undefined) {
        return refusal("result_mismatch", "expected result lacks one exact admitted C-call scope", ["/expectedResult"]);
    }
    const runId = projectedResult.event.runId;
    const graphCallId = projectedResult.event.graphCallId;
    const frameId = projectedResult.event.frameId;
    const evidenceEvents = exactEvidenceEvents(events, projectedResult.result.cCallRef, packet.evidence);
    const resultEvidence = [...projectedResult.result.evidenceRefs]
        .sort(compareUnicodeCodeUnits);
    const suppliedEvidence = packet.evidence.map((row) => row.ref)
        .sort(compareUnicodeCodeUnits);
    if (evidenceEvents === null ||
        resultEvidence.join("\0") !== suppliedEvidence.join("\0")) {
        return refusal("evidence_mismatch", "assessment evidence must equal the result's complete admitted evidence set", ["/evidence"], packet.evidence.map((row) => row.ref));
    }
    const truth = assessmentTruth(packet, authority);
    const assessmentDigest = sha256Canonical(truth);
    const assessmentRef = `result-assessment://abiogenesis/${assessmentDigest.slice("sha256:".length)}`;
    const prior = events.filter((event) => event.kind === "assessed" &&
        isRecord(event.payload) &&
        event.payload.assessmentRef === assessmentRef);
    if (prior.length !== 0) {
        return refusal("digest_mismatch", "the exact result assessment is already admitted at this prefix", ["/assessment"], packet.evidence.map((row) => row.ref));
    }
    const requiredCauses = [
        projectedResult.event.eventId,
        currentBasis.admissionEventRef,
        ...evidenceEvents.map((event) => event.eventId),
        ...context.causationEventRefs,
    ];
    const causationEventRefs = [...new Set(requiredCauses)];
    if (causationEventRefs.some((eventRef) => !events.some((event) => event.eventId === eventRef))) {
        return refusal("basis_mismatch", "assessment causation must cite only truth admitted at the predecessor prefix", ["/invocationAuthority"]);
    }
    try {
        const admittedEvents = compareAndAppendExpectedPrefix(context.store, runtimeEventPrefixDigest(prefix), [() => ({
                kind: "assessed",
                eventTime: context.eventTime,
                aggregateType: "c_call",
                aggregateId: projectedResult.result.cCallRef,
                parentAggregateId: frameId,
                causationEventRefs,
                correlationId: context.correlationId,
                workflowVersion: "5.0.0",
                scopeClass: "run",
                basisId: currentBasis.basisRef,
                runId,
                ...(projectedResult.event.graphFunctionRef === undefined
                    ? {}
                    : { graphFunctionRef: projectedResult.event.graphFunctionRef }),
                graphCallId,
                frameId,
                payload: {
                    assessmentRef,
                    assessmentDigest,
                    assessment: truth,
                    expectedResultRef: packet.expectedResult.ref,
                    expectedResultDigest: packet.expectedResult.digest,
                    assessmentContractRef: packet.assessmentContract.ref,
                    assessmentContractDigest: packet.assessmentContract.digest,
                    assessmentValueRef: packet.assessment.valueRef,
                    assessmentValueDigest: packet.assessment.valueDigest,
                    disposition: packet.assessment.value.disposition,
                    closureEligible: packet.assessment.value.closureEligible,
                    residuals: packet.assessment.value.residuals,
                    evidence: packet.evidence,
                    executionBasisRef: packet.currentBasis.ref,
                    executionBasisDigest: packet.currentBasis.digest,
                    actorRef: authority.actor.ref,
                    actorDigest: authority.actor.digest,
                    capabilityGrantRef: authority.capabilityGrant.grantRef,
                    capabilityGrantDigest: authority.capabilityGrant.grantDigest,
                    invocationRef: authority.invocationRef,
                    invocationDigest: authority.invocationDigest,
                },
            })]);
        if (admittedEvents.length !== 1 || admittedEvents[0].kind !== "assessed") {
            throw new TypeError("assessment admission did not append one exact event");
        }
    }
    catch {
        return refusal("basis_mismatch", "result assessment could not atomically append at the expected prefix", ["/currentBasis"], packet.evidence.map((row) => row.ref));
    }
    const common = {
        schemaVersion: "5.0.0",
        memberKey: "assess",
        assessment: { ref: assessmentRef, digest: assessmentDigest },
        closureEligible: packet.assessment.value.closureEligible,
        residuals: packet.assessment.value.residuals,
        evidence: packet.evidence,
    };
    return packet.assessment.value.disposition === "admitted" ||
        packet.assessment.value.disposition === "rejected"
        ? deepFreeze({
            kind: "result_assess_result",
            ...common,
            disposition: packet.assessment.value.disposition,
        })
        : deepFreeze({
            kind: "result_assess_non_terminal",
            ...common,
            disposition: packet.assessment.value.disposition,
            closureEligible: false,
        });
}
export const ResultAssessmentPort = Object.freeze({
    assess: assessResult,
});
export const RESULT_OPERATION_CONTRACTS = Object.freeze({
    assess: ResultAssessmentPort.assess,
});
