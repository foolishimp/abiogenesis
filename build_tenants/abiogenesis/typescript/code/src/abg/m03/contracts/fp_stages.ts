// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-PAYLOAD
// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-CONVERGENCE

import type {
  ActorInvocationRef,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import {
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent
} from "./event_factories.js";
import type { RetryFrontierProjection } from "./retry_frontier.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  freezeStringArray,
  graphCallIdForBasis,
  frameIdForBasis,
  vectorEdge
} from "./runtime_support.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import { stableSha256HexDigest } from "../../../shared/runtime_identity.js";
import type { PluginTraversalObserverBindingSelection } from "./plugin_traversal_observer.js";

export const FP_TRANSFORM_STATUS_VALUES = Object.freeze([
  "returned",
  "blocked",
  "runtime_failed",
  "contract_failed"
] as const);

export type FpTransformStatus =
  (typeof FP_TRANSFORM_STATUS_VALUES)[number];

export interface FpTransformRequest {
  readonly kind: "fp_transform_request";
  readonly requestRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationId: string;
  readonly attemptIndex: number;
  readonly dispatchRef: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly resultRef: string;
  readonly sourceProjectionRef: string;
  readonly expectedAssessmentIds: readonly string[];
  readonly retryFrontierRef: string;
  readonly retryReasonClasses: readonly string[];
  readonly pluginTraversalObserverBindingRef: string | null;
  readonly observerPromptRef: string | null;
  readonly promptTemplateRef: string | null;
  readonly defaultsBundleRef: string | null;
  readonly defaultsBundleDigest: string | null;
}

export interface FpEvidenceCandidate {
  readonly kind: "fp_evidence_candidate";
  readonly candidateRef: string;
  readonly authorityRef: string;
  readonly evidenceRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly payloadClass: string;
  readonly contractRef: string;
  readonly complete: boolean;
  readonly shallow: boolean;
  readonly contradictsAuthority: boolean;
  readonly deferred: boolean;
}

export interface FpTransformResult {
  readonly kind: "fp_transform_result";
  readonly requestRef: string;
  readonly actorInvocationId: string;
  readonly resultRef: string;
  readonly artifactRef: string | null;
  readonly status: FpTransformStatus;
  readonly reason: string | null;
  readonly evidenceCandidates: readonly FpEvidenceCandidate[];
}

const FORBIDDEN_FP_RESULT_AUTHORITY_FIELDS = Object.freeze([
  "runtimeEvents",
  "events",
  "closureDecision",
  "closureKind",
  "unresolvedReasons",
  "closedVectorIndexes",
  "nextVectorIndex",
  "transition"
] as const);

function fpTransformRequestRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly actorInvocationRef: ActorInvocationRef;
}): string {
  return `fp-transform-request:${stableSha256HexDigest({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    actorInvocationId: input.actorInvocationRef.actorInvocationId
  })}`;
}

function parseNullableNonEmptyString(input: unknown, label: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseBooleanField(input: unknown, label: string): boolean {
  if (typeof input !== "boolean") {
    throw new TypeError(`${label}: expected boolean`);
  }
  return input;
}

function rejectForbiddenFpResultAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_FP_RESULT_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: F_P transform result cannot own engine authority`
      );
    }
  }
}

function normalizeEvidenceCandidate(input: {
  readonly candidateRef: string;
  readonly authorityRef: string;
  readonly evidenceRefs: readonly string[];
  readonly providerRefs: readonly string[];
  readonly payloadClass?: string | undefined;
  readonly contractRef?: string | undefined;
  readonly complete?: boolean | undefined;
  readonly shallow?: boolean | undefined;
  readonly contradictsAuthority?: boolean | undefined;
  readonly deferred?: boolean | undefined;
}): FpEvidenceCandidate {
  return Object.freeze({
    kind: "fp_evidence_candidate",
    candidateRef: input.candidateRef,
    authorityRef: input.authorityRef,
    evidenceRefs: freezeStringArray(input.evidenceRefs),
    providerRefs: freezeStringArray(input.providerRefs),
    payloadClass: input.payloadClass ?? "evidence",
    contractRef: input.contractRef ?? "contract://abg/fp-transform-evidence",
    complete: input.complete ?? true,
    shallow: input.shallow ?? false,
    contradictsAuthority: input.contradictsAuthority ?? false,
    deferred: input.deferred ?? false
  });
}

function parseEvidenceCandidate(input: unknown, label: string): FpEvidenceCandidate {
  const candidate = parsePlainObject(input, label);
  const kind = parseOptionalField(candidate, "kind");
  if (kind !== undefined && kind !== "fp_evidence_candidate") {
    throw new TypeError(
      `${label}.kind: expected "fp_evidence_candidate" when supplied`
    );
  }
  return normalizeEvidenceCandidate({
    candidateRef: parseNonEmptyString(candidate["candidateRef"], `${label}.candidateRef`),
    authorityRef: parseNonEmptyString(candidate["authorityRef"], `${label}.authorityRef`),
    evidenceRefs: parseStringArray(candidate["evidenceRefs"], `${label}.evidenceRefs`),
    providerRefs: parseStringArray(candidate["providerRefs"], `${label}.providerRefs`),
    payloadClass:
      parseNullableNonEmptyString(
        parseOptionalField(candidate, "payloadClass"),
        `${label}.payloadClass`
      ) ?? undefined,
    contractRef:
      parseNullableNonEmptyString(
        parseOptionalField(candidate, "contractRef"),
        `${label}.contractRef`
      ) ?? undefined,
    complete:
      parseOptionalField(candidate, "complete") === undefined
        ? undefined
        : parseBooleanField(
            parseOptionalField(candidate, "complete"),
            `${label}.complete`
          ),
    shallow:
      parseOptionalField(candidate, "shallow") === undefined
        ? undefined
        : parseBooleanField(
            parseOptionalField(candidate, "shallow"),
            `${label}.shallow`
          ),
    contradictsAuthority:
      parseOptionalField(candidate, "contradictsAuthority") === undefined
        ? undefined
        : parseBooleanField(
            parseOptionalField(candidate, "contradictsAuthority"),
            `${label}.contradictsAuthority`
          ),
    deferred:
      parseOptionalField(candidate, "deferred") === undefined
        ? undefined
        : parseBooleanField(
            parseOptionalField(candidate, "deferred"),
            `${label}.deferred`
          )
  });
}

function assertTransformStatus(
  status: string,
  label: string
): FpTransformStatus {
  for (const candidate of FP_TRANSFORM_STATUS_VALUES) {
    if (status === candidate) {
      return candidate;
    }
  }
  throw new TypeError(`${label}: expected F_P transform status`);
}

function assertFpTransformResultMatchesRequest(input: {
  readonly request: FpTransformRequest;
  readonly result: FpTransformResult;
  readonly label: string;
}): void {
  if (input.result.requestRef !== input.request.requestRef) {
    throw new TypeError(
      `${input.label}.requestRef: transform result does not match active request`
    );
  }
  if (input.result.actorInvocationId !== input.request.actorInvocationId) {
    throw new TypeError(
      `${input.label}.actorInvocationId: transform result does not match active actor invocation`
    );
  }
  if (input.result.resultRef !== input.request.resultRef) {
    throw new TypeError(
      `${input.label}.resultRef: transform result does not match active result ref`
    );
  }
}

function authorityDigestForResult(input: {
  readonly request: FpTransformRequest;
  readonly result: FpTransformResult;
}): string {
  return `authority:fp_transform:${stableSha256HexDigest({
    requestRef: input.request.requestRef,
    resultRef: input.result.resultRef,
    authorityRefs: input.result.evidenceCandidates.map(
      (candidate) => candidate.authorityRef
    )
  })}`;
}

function inputDigestForResult(input: {
  readonly request: FpTransformRequest;
  readonly result: FpTransformResult;
}): string {
  return `input:fp_transform:${stableSha256HexDigest({
    requestRef: input.request.requestRef,
    resultRef: input.result.resultRef,
    sourceProjectionRef: input.request.sourceProjectionRef
  })}`;
}

function payloadRefForEvidence(input: {
  readonly request: FpTransformRequest;
  readonly result: FpTransformResult;
  readonly candidate: FpEvidenceCandidate;
  readonly evidenceRef: string;
}): string {
  return `payload:fp_transform:${stableSha256HexDigest({
    requestRef: input.request.requestRef,
    resultRef: input.result.resultRef,
    candidateRef: input.candidate.candidateRef,
    evidenceRef: input.evidenceRef
  })}`;
}

function digestForEvidence(input: {
  readonly result: FpTransformResult;
  readonly candidate: FpEvidenceCandidate;
  readonly evidenceRef: string;
}): string {
  return `digest:fp_transform:${stableSha256HexDigest({
    resultRef: input.result.resultRef,
    candidateRef: input.candidate.candidateRef,
    evidenceRef: input.evidenceRef
  })}`;
}

export function constructFpTransformRequest(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly actorInvocationRef: ActorInvocationRef;
  readonly sourceProjectionRef: string;
  readonly expectedAssessmentIds: readonly string[];
  readonly retryFrontier: RetryFrontierProjection;
  readonly pluginTraversalObserverBinding?: PluginTraversalObserverBindingSelection | null;
}): FpTransformRequest {
  assertProjectionBasis(input.basis, input.projection, "FpTransformRequest");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  if (input.edge !== vectorEdge(input.basis, input.vectorIndex)) {
    throw new TypeError("FpTransformRequest edge does not match vector");
  }
  if (input.retryFrontier.vectorIndex !== input.vectorIndex) {
    throw new TypeError("FpTransformRequest retry frontier vector mismatch");
  }
  const requestRef = fpTransformRequestRef({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    actorInvocationRef: input.actorInvocationRef
  });
  return Object.freeze({
    kind: "fp_transform_request",
    requestRef,
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    jobId: input.basis.job.id,
    graphCallId: input.projection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.projection.frameId ?? frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    actorInvocationId: input.actorInvocationRef.actorInvocationId,
    attemptIndex: input.actorInvocationRef.attemptIndex,
    dispatchRef: input.actorInvocationRef.dispatchRef,
    workerId: input.basis.runtimeIdentity.workerId,
    backendId: input.basis.runtimeIdentity.backendId,
    resultRef: input.actorInvocationRef.resultRef,
    sourceProjectionRef: input.sourceProjectionRef,
    expectedAssessmentIds: freezeStringArray(input.expectedAssessmentIds),
    retryFrontierRef: input.retryFrontier.frontierRef,
    retryReasonClasses: freezeStringArray(input.retryFrontier.reasonClasses),
    pluginTraversalObserverBindingRef:
      input.pluginTraversalObserverBinding?.selectionRef ?? null,
    observerPromptRef:
      input.pluginTraversalObserverBinding?.binding.observerPromptRef ?? null,
    promptTemplateRef:
      input.pluginTraversalObserverBinding?.binding.promptTemplateRef ?? null,
    defaultsBundleRef:
      input.pluginTraversalObserverBinding?.fallbackBundleRef?.bundleRef ?? null,
    defaultsBundleDigest:
      input.pluginTraversalObserverBinding?.fallbackBundleRef?.bundleDigest ?? null
  });
}

export function constructFpTransformResult(input: {
  readonly request: FpTransformRequest;
  readonly resultRef?: string | null;
  readonly artifactRef?: string | null;
  readonly status: FpTransformStatus;
  readonly reason?: string | null;
  readonly evidenceCandidates?: readonly {
    readonly candidateRef: string;
    readonly authorityRef: string;
    readonly evidenceRefs: readonly string[];
    readonly providerRefs?: readonly string[];
    readonly payloadClass?: string | undefined;
    readonly contractRef?: string | undefined;
    readonly complete?: boolean | undefined;
    readonly shallow?: boolean | undefined;
    readonly contradictsAuthority?: boolean | undefined;
    readonly deferred?: boolean | undefined;
  }[];
}): FpTransformResult {
  const resultRef = input.resultRef ?? input.request.resultRef;
  if (resultRef !== input.request.resultRef) {
    throw new TypeError(
      "FpTransformResult.resultRef: transform result does not match active request"
    );
  }
  return Object.freeze({
    kind: "fp_transform_result",
    requestRef: input.request.requestRef,
    actorInvocationId: input.request.actorInvocationId,
    resultRef,
    artifactRef: input.artifactRef ?? null,
    status: input.status,
    reason: input.reason ?? null,
    evidenceCandidates: Object.freeze(
      (input.evidenceCandidates ?? Object.freeze([])).map((candidate) =>
        normalizeEvidenceCandidate({
          candidateRef: candidate.candidateRef,
          authorityRef: candidate.authorityRef,
          evidenceRefs: candidate.evidenceRefs,
          providerRefs: candidate.providerRefs ?? [
            input.request.workerId,
            input.request.backendId
          ],
          payloadClass: candidate.payloadClass,
          contractRef: candidate.contractRef,
          complete: candidate.complete,
          shallow: candidate.shallow,
          contradictsAuthority: candidate.contradictsAuthority,
          deferred: candidate.deferred
        })
      )
    )
  });
}

export function admitFpTransformResult(
  input: unknown,
  label = "FpTransformResult"
): FpTransformResult {
  const result = parsePlainObject(input, label);
  rejectForbiddenFpResultAuthorityFields(result, label);
  const kind = parseString(result["kind"], `${label}.kind`);
  if (kind !== "fp_transform_result") {
    throw new TypeError(
      `${label}.kind: expected "fp_transform_result", got ${JSON.stringify(kind)}`
    );
  }
  const status = assertTransformStatus(
    parseString(result["status"], `${label}.status`),
    `${label}.status`
  );
  const candidatesRaw = parseOptionalField(result, "evidenceCandidates");
  if (candidatesRaw !== undefined && !Array.isArray(candidatesRaw)) {
    throw new TypeError(`${label}.evidenceCandidates: expected list`);
  }
  return Object.freeze({
    kind: "fp_transform_result",
    requestRef: parseNonEmptyString(result["requestRef"], `${label}.requestRef`),
    actorInvocationId: parseNonEmptyString(
      result["actorInvocationId"],
      `${label}.actorInvocationId`
    ),
    resultRef: parseNonEmptyString(result["resultRef"], `${label}.resultRef`),
    artifactRef: parseNullableNonEmptyString(
      parseOptionalField(result, "artifactRef"),
      `${label}.artifactRef`
    ),
    status,
    reason: parseNullableNonEmptyString(
      parseOptionalField(result, "reason"),
      `${label}.reason`
    ),
    evidenceCandidates: Object.freeze(
      (candidatesRaw ?? []).map((candidate, index) =>
        parseEvidenceCandidate(candidate, `${label}.evidenceCandidates[${index}]`)
      )
    )
  });
}

export function admitFpTransformResultForRequest(
  request: FpTransformRequest,
  input: unknown,
  label = "FpTransformResult"
): FpTransformResult {
  const result = admitFpTransformResult(input, label);
  assertFpTransformResultMatchesRequest({
    request,
    result,
    label
  });
  return result;
}

export function runtimeEventsForFpTransformResult(input: {
  readonly basis: ExecutionBasis;
  readonly request: FpTransformRequest;
  readonly result: FpTransformResult;
}): readonly RuntimeEvent[] {
  assertFpTransformResultMatchesRequest({
    request: input.request,
    result: input.result,
    label: "FpTransformResult"
  });
  if (input.result.status !== "returned") {
    return Object.freeze([]);
  }
  if (input.result.evidenceCandidates.length === 0) {
    return Object.freeze([]);
  }

  const authorityRefs = input.result.evidenceCandidates.map(
    (candidate) => candidate.authorityRef
  );
  const authorityDigest = authorityDigestForResult(input);
  const inputDigest = inputDigestForResult(input);
  const policyRefs = [input.basis.resolvedPolicy.resolvedPolicyBundleRef];
  const events: RuntimeEvent[] = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: input.basis,
      vectorIndex: input.request.vectorIndex,
      authoritySnapshotRef: `authority-snapshot:fp_transform:${input.result.resultRef}`,
      authorityRefs,
      inputRefs: [input.request.resultRef],
      authorityDigest,
      inputDigest,
      providerRefs: [input.request.workerId, input.request.backendId],
      policyRefs
    })
  ];

  for (const candidate of input.result.evidenceCandidates) {
    const evidenceRefs =
      candidate.evidenceRefs.length === 0
        ? [`evidence:fp_transform:${candidate.candidateRef}`]
        : candidate.evidenceRefs;
    for (const evidenceRef of evidenceRefs) {
      const payloadRef = payloadRefForEvidence({
        request: input.request,
        result: input.result,
        candidate,
        evidenceRef
      });
      const digest = digestForEvidence({
        result: input.result,
        candidate,
        evidenceRef
      });
      events.push(
        constructPayloadObservedEvent({
          basis: input.basis,
          vectorIndex: input.request.vectorIndex,
          payloadRef,
          payloadClass: candidate.payloadClass,
          contractRef: candidate.contractRef,
          digest,
          producerRef: input.request.workerId,
          sourceEventRef: input.result.resultRef,
          actorInvocationId: input.request.actorInvocationId,
          authorityRef: candidate.authorityRef,
          inputDigest,
          policyRefs
        }),
        constructPayloadValidatedEvent({
          basis: input.basis,
          vectorIndex: input.request.vectorIndex,
          payloadRef,
          contractRef: candidate.contractRef,
          digest,
          validationRef: `validation:fp_transform:${payloadRef}`,
          evidenceRef,
          policyRefs
        }),
        constructEvidenceAdmittedEvent({
          basis: input.basis,
          vectorIndex: input.request.vectorIndex,
          evidenceRef,
          payloadRef,
          authorityRef: candidate.authorityRef,
          authorityDigest,
          inputDigest,
          providerRefs: candidate.providerRefs,
          policyRefs,
          complete: candidate.complete,
          shallow: candidate.shallow,
          contradictsAuthority: candidate.contradictsAuthority,
          deferred: candidate.deferred
        })
      );
    }
  }

  return Object.freeze(events);
}
