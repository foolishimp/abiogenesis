import { isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
function hasExactKeys(value, expectedKeys) {
    const actual = Object.keys(value).sort();
    const expected = [...expectedKeys].sort();
    return actual.length === expected.length &&
        actual.every((key, index) => key === expected[index]);
}
function isExactTransitionEvidence(value) {
    if (value === null)
        return true;
    if (!isRecord(value))
        return false;
    switch (value.evidenceClass) {
        case "blocked":
            return hasExactKeys(value, [
                "cCall", "evidenceClass", "graphFunction", "judgmentEventRef",
                "judgmentRef", "reasonRef", "resultRef", "stoppedProgresses",
            ]) && Array.isArray(value.stoppedProgresses);
        case "fan_out":
            return hasExactKeys(value, [
                "application", "cCall", "completedProgresses", "completion",
                "evidenceClass", "graphFunction", "judgment", "result",
            ]) && Array.isArray(value.completedProgresses);
        case "hold":
            return hasExactKeys(value, [
                "cCall", "evidenceClass", "graphFunction", "judgment", "result",
            ]);
        case "interaction_resume":
            return hasExactKeys(value, [
                "cCall", "completedProgresses", "evidenceClass", "graphFunction",
                "judgment", "result", "resume",
            ]) && Array.isArray(value.completedProgresses);
        case "judged":
            return hasExactKeys(value, [
                "cCall", "completedProgresses", "evidenceClass", "graphFunction",
                "judgment", "result",
            ]) && Array.isArray(value.completedProgresses);
        case "recursion":
            return hasExactKeys(value, [
                "application", "cCall", "evidenceClass", "foldback", "judgment",
                "preparationRefusal", "result",
            ]) && (value.foldback === null || isRecord(value.foldback)) &&
                (value.preparationRefusal === null ||
                    isRecord(value.preparationRefusal));
        case "retry":
            return hasExactKeys(value, [
                "cCall", "evidenceClass", "graphFunction", "progress",
            ]);
        case "structural_identity":
            return hasExactKeys(value, [
                "completedProgresses", "completionClass",
                "completionWitnessEventRef", "evidenceClass", "graphFunction",
            ]) && value.completionClass === "structural_identity_success" &&
                Array.isArray(value.completedProgresses);
        default:
            return false;
    }
}
export function projectTraversalRouteBody(route) {
    const nextActionPresence = [
        route.nextActionProjectionRef,
        route.nextActionProjectionDigest,
        route.nextActionProjection,
    ].map((value) => value !== undefined);
    const graphSpanPresence = [
        route.graphSpanReentryProjectionRef,
        route.graphSpanReentryProjectionDigest,
        route.graphSpanReentryProjection,
    ].map((value) => value !== undefined);
    if ((route.registeredSelectionApplicationRef !== undefined &&
        (typeof route.registeredSelectionApplicationRef !== "string" || route.registeredSelectionApplicationRef.length === 0 || route.boundInput === undefined)) ||
        route.consumedAvailabilityRefs === null ||
        route.replayStateDigest === null ||
        (nextActionPresence.some(Boolean) && !nextActionPresence.every(Boolean)) ||
        (graphSpanPresence.some(Boolean) && !graphSpanPresence.every(Boolean)))
        return null;
    return {
        ...(route.boundInput === undefined ? {} : { boundInput: route.boundInput }),
        ...(route.registeredSelectionApplicationRef === undefined ? {} : { registeredSelectionApplicationRef: route.registeredSelectionApplicationRef }),
        routeKind: route.routeKind,
        declarationRef: route.declarationRef,
        declarationDigest: route.declarationDigest,
        sourceCursorRef: route.sourceCursorRef,
        sourceCursorDigest: route.sourceCursorDigest,
        targetCursorRef: route.targetCursorRef,
        targetCursorDigest: route.targetCursorDigest,
        cCallRef: route.cCallRef,
        judgmentRef: route.judgmentRef,
        consumedAvailabilityRefs: route.consumedAvailabilityRefs,
        contractRef: route.contractRef,
        replayStateDigest: route.replayStateDigest,
        ...(route.nextActionProjectionRef === undefined
            ? {}
            : {
                nextActionProjectionRef: route.nextActionProjectionRef,
                nextActionProjectionDigest: route.nextActionProjectionDigest,
                nextActionProjection: route.nextActionProjection,
            }),
        ...(route.graphSpanReentryProjectionRef === undefined
            ? {}
            : {
                graphSpanReentryProjectionRef: route.graphSpanReentryProjectionRef,
                graphSpanReentryProjectionDigest: route.graphSpanReentryProjectionDigest,
                graphSpanReentryProjection: route.graphSpanReentryProjection,
            }),
    };
}
export function routeCandidateBody(value) {
    if (!isRecord(value))
        return null;
    const route = value;
    const required = [
        "cCallRef", "consumedAvailabilityRefs", "contractRef", "declarationDigest",
        "declarationRef", "judgmentRef", "replayStateDigest", "routeKind",
        "sourceCursorDigest", "sourceCursorRef", "targetCursorDigest",
        "targetCursorRef",
    ];
    const nextAction = Object.hasOwn(route, "nextActionProjectionRef")
        ? [
            "nextActionProjection", "nextActionProjectionDigest",
            "nextActionProjectionRef",
        ]
        : [];
    const graphSpan = Object.hasOwn(route, "graphSpanReentryProjectionRef")
        ? [
            "graphSpanReentryProjection", "graphSpanReentryProjectionDigest",
            "graphSpanReentryProjectionRef",
        ]
        : [];
    if (!hasExactKeys(route, [
        "candidateDigest", "candidateRef", "kind", "schemaVersion",
        ...required, ...nextAction, ...graphSpan, ...(Object.hasOwn(route, "registeredSelectionApplicationRef") ? ["registeredSelectionApplicationRef"] : []), ...(Object.hasOwn(route, "boundInput") ? ["boundInput"] : []),
    ]))
        return null;
    return projectTraversalRouteBody(route);
}
export function isRouteCandidate(value) {
    if (!isRecord(value))
        return false;
    const body = routeCandidateBody(value);
    if (body === null ||
        value.kind !== "traversal_route_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        typeof value.candidateDigest !== "string" ||
        typeof value.candidateRef !== "string")
        return false;
    const digest = sha256Canonical(body);
    return value.candidateDigest === digest &&
        value.candidateRef ===
            `route-candidate://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function completeRouteCandidate(body) {
    const candidateDigest = sha256Canonical(body);
    const candidate = deepFreeze({
        kind: "traversal_route_candidate",
        schemaVersion: "5.0.0",
        candidateRef: `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
        candidateDigest,
        ...body,
    });
    if (!isRouteCandidate(candidate)) {
        throw new TypeError("traversal route candidate is not exact");
    }
    return candidate;
}
export function isTraversalTransitionCandidate(value) {
    if (!isRecord(value))
        return false;
    const retry = value.transitionClass === "retry";
    if (value.transitionClass !== "route" && !retry ||
        !hasExactKeys(value, [
            "candidateDigest", "candidateRef", "evidence", "kind",
            ...(retry ? ["retryInput"] : []),
            "route", "schemaVersion", "terminalizeRun", "transitionClass",
        ]) ||
        value.kind !== "traversal_transition_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        typeof value.candidateDigest !== "string" ||
        typeof value.candidateRef !== "string" ||
        !isRouteCandidate(value.route) ||
        !isExactTransitionEvidence(value.evidence) ||
        typeof value.terminalizeRun !== "boolean" ||
        (retry && !isRecord(value.retryInput)))
        return false;
    const evidenceClass = value.evidence === null
        ? "none"
        : value.evidence.evidenceClass;
    if (retry
        ? value.route.routeKind !== "retry" ||
            value.terminalizeRun !== false ||
            !["none", "retry", "structural_identity"].includes(evidenceClass)
        : value.route.routeKind === "retry")
        return false;
    const { candidateRef, candidateDigest, ...body } = value;
    const digest = sha256Canonical(body);
    return candidateDigest === digest && candidateRef ===
        `traversal-transition-candidate://abiogenesis/${digest.slice("sha256:".length)}`;
}
export function completeTraversalTransitionCandidate(body) {
    const candidateDigest = sha256Canonical(body);
    const candidate = deepFreeze({
        ...body,
        candidateRef: `traversal-transition-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
        candidateDigest,
    });
    if (!isTraversalTransitionCandidate(candidate)) {
        throw new TypeError("traversal transition candidate is not exact");
    }
    return candidate;
}
