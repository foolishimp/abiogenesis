import type {
  BlockedRouteAdmissionEvidence,
  FanOutRouteAdmissionEvidence,
  HoldRouteAdmissionEvidence,
  InteractionResumeRouteAdmissionEvidence,
  RecursionRouteAdmissionEvidence,
  RetryRouteAdmissionEvidence,
  RouteAdmissionEvidence,
  RouteCandidate,
  StructuralIdentityRouteAdmissionEvidence,
} from "./traversal_route.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

export type TraversalTransitionEvidence =
  | BlockedRouteAdmissionEvidence
  | FanOutRouteAdmissionEvidence
  | HoldRouteAdmissionEvidence
  | InteractionResumeRouteAdmissionEvidence
  | RecursionRouteAdmissionEvidence
  | RetryRouteAdmissionEvidence
  | RouteAdmissionEvidence
  | StructuralIdentityRouteAdmissionEvidence
  | null;

export type RouteCandidateBody = Omit<
  RouteCandidate,
  "kind" | "schemaVersion" | "candidateRef" | "candidateDigest"
>;

export interface TraversalRouteBodySource {
  readonly routeKind: RouteCandidate["routeKind"];
  readonly declarationRef: string;
  readonly declarationDigest: `sha256:${string}`;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: `sha256:${string}`;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: `sha256:${string}` | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[] | null;
  readonly contractRef: string | null;
  readonly replayStateDigest: `sha256:${string}` | null;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: `sha256:${string}`;
  readonly nextActionProjection?: Readonly<object>;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: `sha256:${string}`;
  readonly graphSpanReentryProjection?: Readonly<object>;
}

export type TraversalTransitionCandidateBody =
  | Readonly<{
      kind: "traversal_transition_candidate";
      schemaVersion: "5.0.0";
      transitionClass: "route";
      route: RouteCandidate;
      evidence: TraversalTransitionEvidence;
      terminalizeRun: boolean;
    }>
  | Readonly<{
      kind: "traversal_transition_candidate";
      schemaVersion: "5.0.0";
      transitionClass: "retry";
      route: RouteCandidate;
      evidence:
        | RetryRouteAdmissionEvidence
        | StructuralIdentityRouteAdmissionEvidence
        | null;
      retryInput: Readonly<Record<string, JsonValue>>;
      terminalizeRun: false;
    }>;

export type TraversalTransitionCandidate = TraversalTransitionCandidateBody &
  Readonly<{
    candidateRef: string;
    candidateDigest: `sha256:${string}`;
  }>;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expectedKeys: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index]);
}

function isExactTransitionEvidence(
  value: unknown,
): value is TraversalTransitionEvidence {
  if (value === null) return true;
  if (!isRecord(value)) return false;
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

export function projectTraversalRouteBody(
  route: TraversalRouteBodySource,
): RouteCandidateBody | null {
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
  if (
    route.consumedAvailabilityRefs === null ||
    route.replayStateDigest === null ||
    (nextActionPresence.some(Boolean) && !nextActionPresence.every(Boolean)) ||
    (graphSpanPresence.some(Boolean) && !graphSpanPresence.every(Boolean))
  ) return null;
  return {
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
          nextActionProjectionDigest: route.nextActionProjectionDigest!,
          nextActionProjection: route.nextActionProjection! as unknown as
            Readonly<Record<string, JsonValue>>,
        }),
    ...(route.graphSpanReentryProjectionRef === undefined
      ? {}
      : {
          graphSpanReentryProjectionRef: route.graphSpanReentryProjectionRef,
          graphSpanReentryProjectionDigest:
            route.graphSpanReentryProjectionDigest!,
          graphSpanReentryProjection:
            route.graphSpanReentryProjection! as unknown as
              Readonly<Record<string, JsonValue>>,
        }),
  };
}

export function routeCandidateBody(
  value: unknown,
): RouteCandidateBody | null {
  if (!isRecord(value)) return null;
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
    ...required, ...nextAction, ...graphSpan,
  ])) return null;
  return projectTraversalRouteBody(
    route as unknown as TraversalRouteBodySource,
  );
}

export function isRouteCandidate(value: unknown): value is RouteCandidate {
  if (!isRecord(value)) return false;
  const body = routeCandidateBody(value);
  if (
    body === null ||
    value.kind !== "traversal_route_candidate" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.candidateDigest !== "string" ||
    typeof value.candidateRef !== "string"
  ) return false;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return value.candidateDigest === digest &&
    value.candidateRef ===
      `route-candidate://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function completeRouteCandidate(
  body: RouteCandidateBody,
): RouteCandidate {
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    kind: "traversal_route_candidate" as const,
    schemaVersion: "5.0.0" as const,
    candidateRef:
      `route-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
    ...body,
  });
  if (!isRouteCandidate(candidate)) {
    throw new TypeError("traversal route candidate is not exact");
  }
  return candidate;
}

export function isTraversalTransitionCandidate(
  value: unknown,
): value is TraversalTransitionCandidate {
  if (!isRecord(value)) return false;
  const retry = value.transitionClass === "retry";
  if (
    value.transitionClass !== "route" && !retry ||
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
    (retry && !isRecord(value.retryInput))
  ) return false;
  const evidenceClass = value.evidence === null
    ? "none"
    : value.evidence.evidenceClass;
  if (
    retry
      ? value.route.routeKind !== "retry" ||
        value.terminalizeRun !== false ||
        !["none", "retry", "structural_identity"].includes(evidenceClass)
      : value.route.routeKind === "retry"
  ) return false;
  const { candidateRef, candidateDigest, ...body } = value;
  const digest = sha256Canonical(body as unknown as JsonValue);
  return candidateDigest === digest && candidateRef ===
    `traversal-transition-candidate://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function completeTraversalTransitionCandidate(
  body: TraversalTransitionCandidateBody,
): TraversalTransitionCandidate {
  const candidateDigest = sha256Canonical(body as unknown as JsonValue);
  const candidate = deepFreeze({
    ...body,
    candidateRef:
      `traversal-transition-candidate://abiogenesis/${candidateDigest.slice("sha256:".length)}`,
    candidateDigest,
  });
  if (!isTraversalTransitionCandidate(candidate)) {
    throw new TypeError("traversal transition candidate is not exact");
  }
  return candidate;
}
