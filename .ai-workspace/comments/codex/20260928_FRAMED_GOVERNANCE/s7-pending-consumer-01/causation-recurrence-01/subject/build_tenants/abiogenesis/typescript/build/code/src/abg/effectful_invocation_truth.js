import { projectSelectedActionOperation, continuationOperationWorkspaceCorresponds } from "./construction_continuation.js";
import { isRecord } from "../shared/admission_predicates.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectArtifactTruth, projectExactPrefixArtifactTruth, } from "./artifact_truth.js";
import { readRuntimeEventsAtDurablePrefix, } from "./event_store.js";
import { runtimeEventsFromValidatedPrefix, selectValidatedRuntimeEventPrefix, } from "./event_prefix.js";
import { projectFhEffectfulPublicInvocationFacts, } from "./fh_continuation_projection.js";
import { projectExactRunInvocationFactsAtPrefix, projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix, } from "./invocation_execution_truth.js";
function invalidHistory(prefix, invocationRef, code, eventRefs = [], artifactTruthCode = null) {
    return deepFreeze({
        kind: "effectful_public_invocation_truth_invalid_history",
        schemaVersion: "5.0.0",
        disposition: "invalid_history",
        code,
        invocationRef,
        prefix,
        eventRefs: [...new Set(eventRefs)].sort(),
        artifactTruthCode,
    });
}
export function projectEffectfulPublicInvocationTruthAtPrefix(prefix, invocationRef) {
    let events;
    let artifactRows;
    if (prefix.kind === "validated_runtime_event_prefix") {
        try {
            events = runtimeEventsFromValidatedPrefix(prefix);
            artifactRows = projectArtifactTruth(prefix).artifacts;
        }
        catch {
            return invalidHistory(prefix, invocationRef, "artifact_truth_invalid");
        }
    }
    else {
        try {
            events = runtimeEventsFromValidatedPrefix(selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(prefix)));
        }
        catch {
            return invalidHistory(prefix, invocationRef, "prefix_invalid");
        }
        const artifactTruth = projectExactPrefixArtifactTruth(prefix);
        if (artifactTruth.kind ===
            "exact_prefix_artifact_truth_projection_refusal") {
            return invalidHistory(prefix, invocationRef, "artifact_truth_invalid", artifactTruth.eventRefs, artifactTruth.code);
        }
        artifactRows = artifactTruth.rows;
    }
    const facts = artifactRows.map((row) => deepFreeze({
        operationId: row.operationId,
        publicInvocationRef: row.invocationRef,
        ownerInvocationRef: row.invocationRef,
        ownerInvocationDigest: row.invocationDigest,
        publicOperationEventRef: row.admissionEventRef,
        admissionEventRef: row.admissionEventRef,
    }));
    const validatedPrefix = prefix.kind === "validated_runtime_event_prefix"
        ? prefix
        : selectValidatedRuntimeEventPrefix(events);
    const runFacts = projectExactRunInvocationFactsAtPrefix(validatedPrefix);
    if (runFacts.disposition === "invalid_history") {
        return invalidHistory(prefix, invocationRef, "invocation_pair_invalid", runFacts.eventRefs);
    }
    facts.push(...runFacts.facts);
    const continuationFacts = projectFhEffectfulPublicInvocationFacts(validatedPrefix);
    if (continuationFacts.disposition === "invalid_history") {
        return invalidHistory(prefix, invocationRef, "invocation_pair_invalid", continuationFacts.eventRefs);
    }
    facts.push(...continuationFacts.facts);
    const constructionOperations = events.filter(e => e.kind === "public_operation_admitted" &&
        typeof e.payload === "object" && e.payload !== null && !Array.isArray(e.payload) &&
        e.payload.continuationKind === "construction_intent");
    for (const operation of constructionOperations) {
        const p = operation.payload;
        const bases = events.filter(e => e.kind === "basis_admitted" && typeof e.payload === "object" &&
            e.payload !== null && !Array.isArray(e.payload) &&
            isRecord(e.payload) && isRecord(e.payload.constructionContinuationUse) &&
            e.payload.constructionContinuationUse.operationAdmissionEventRef === operation.eventId);
        const basis = bases.length === 1 ? projectExactExecutionBasisAtPrefix(validatedPrefix, bases[0].basisId) : null;
        const use = basis?.constructionContinuationUse;
        const original = use === undefined ? null : projectExactExecutionBasisAtPrefix(validatedPrefix, use.sourceExecutionBasisRef);
        const invocation = original === null ? null : projectExactInvocationAdmissionAtPrefix(validatedPrefix, original.invocationAdmissionRef);
        if (basis === null || use === undefined || original === null || invocation === null ||
            !continuationOperationWorkspaceCorresponds(operation, invocation) ||
            basis.invocationAdmissionRef !== original.invocationAdmissionRef || p.operationId !== "abg.operation.run.continue" ||
            p.memberKey !== "current_intent" || p.continuationRef !== use.continuationRef || p.continuationDigest !== use.continuationDigest ||
            p.currentIntentRef !== use.constructionIntentRef || p.currentIntentDigest !== use.constructionIntentDigest ||
            p.authorityRef !== invocation.authorityRef || p.authorityDigest !== invocation.authorityDigest ||
            typeof p.invocationRef !== "string" || typeof p.invocationDigest !== "string")
            return invalidHistory(prefix, invocationRef, "invocation_pair_invalid", [operation.eventId]);
        facts.push({ operationId: "abg.operation.run.continue", publicInvocationRef: p.invocationRef,
            ownerInvocationRef: p.invocationRef, ownerInvocationDigest: p.invocationDigest,
            publicOperationEventRef: operation.eventId, admissionEventRef: basis.admissionEventRef });
    }
    for (const operation of events.filter(e => e.kind === "public_operation_admitted" &&
        isRecord(e.payload) && e.payload.continuationKind === "selected_action")) {
        const fact = projectSelectedActionOperation(validatedPrefix, operation);
        if (fact === null)
            return invalidHistory(prefix, invocationRef, "invocation_pair_invalid", [operation.eventId]);
        facts.push(fact);
    }
    const byPublicRef = new Map();
    for (const fact of facts) {
        const held = byPublicRef.get(fact.publicInvocationRef) ?? [];
        held.push(fact);
        byPublicRef.set(fact.publicInvocationRef, held);
    }
    const ambiguous = [...byPublicRef.entries()].find(([, held]) => held.length !== 1);
    if (ambiguous !== undefined) {
        return invalidHistory(prefix, invocationRef, "duplicate_outer_invocation", ambiguous[1].flatMap((fact) => [
            fact.publicOperationEventRef,
            fact.admissionEventRef,
        ]));
    }
    const prior = byPublicRef.get(invocationRef)?.[0];
    return prior === undefined
        ? deepFreeze({
            kind: "effectful_public_invocation_truth",
            schemaVersion: "5.0.0",
            disposition: "available",
            invocationRef,
            prefix,
        })
        : deepFreeze({
            kind: "effectful_public_invocation_truth",
            schemaVersion: "5.0.0",
            disposition: "duplicate",
            invocationRef,
            prefix,
            priorAdmission: prior,
        });
}
