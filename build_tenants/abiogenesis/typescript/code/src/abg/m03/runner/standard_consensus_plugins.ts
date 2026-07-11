// A5-CONSENSUS-01 standard SYSTEM GraphFunction effect implementation.
// The shell supplies one admitted invocation. ABG expands the declared panel,
// runs one reviewer round through the native saga frontier, admits every F_P
// response, and reduces exact agreement deterministically. ABG's ordinary
// same-edge continuation owns later rounds. This plugin never loops, writes
// tickets, selects traversal, or closes the graph.

import { createHash } from "node:crypto";
import { join } from "node:path";

import {
  runAgentTransport,
  type AgentTransportResult
} from "../../../shared/abg_library/index.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  CONSENSUS_REQUEST_SCHEMA_REF,
  CONSENSUS_RESULT_SCHEMA_REF,
  CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF,
  admitConsensusRequest,
  admitConsensusReviewerResponse,
  admitConsensusSubmitterResponse,
  bindConsensusSubmitterResponse,
  reduceConsensusRound,
  type ConsensusRequest,
  type ConsensusResult,
  type ConsensusReviewerProfile,
  type ConsensusReviewerResponse,
  type ConsensusSubmitterResponse,
  type ConsensusRoundRecord,
  type ConsensusRoundDecision
} from "../contracts/consensus.js";
import {
  constructBranchExecutionPolicy,
  constructBranchRef,
  constructDependencyFrontierDeclaration,
  deriveBranchIdempotencyKey
} from "../contracts/saga_frontier.js";
import {
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructFpEvaluationFinding,
  constructFpEvaluationOutcome,
  type EnginePluginInput,
  type FpDispatchOutcome,
  type FpDispatchPlugin,
  type FpEvaluationOutcome,
  type FpEvaluatorPlugin
} from "../contracts/plugins.js";
import { isPlainRecord } from "../contracts/admission_hygiene.js";
import { runNativeSagaFrontier, type NativeBranchTask } from "./saga_frontier_runner.js";
import { admitTimeoutBudgetMs } from "./standard_handlers.js";
import type { LiveFpDispatchCapability } from "./standard_live_plugins.js";

export const CONSENSUS_FP_DISPATCH_PLUGIN_REF =
  "plugin://abg/consensus/fp-dispatch-live";
export const CONSENSUS_FP_EVALUATOR_PLUGIN_REF =
  "plugin://abg/consensus/fp-evaluator";

const CONSENSUS_REVIEWER_PAYLOAD_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: Object.freeze({
    kind: Object.freeze({ const: "consensus_reviewer_payload" }),
    disposition: Object.freeze({
      enum: Object.freeze(["accept", "revise", "escalate"])
    }),
    evidenceRefs: Object.freeze({
      items: Object.freeze({ minLength: 1, type: "string" }),
      type: "array"
    }),
    findings: Object.freeze({
      items: Object.freeze({
        additionalProperties: false,
        properties: Object.freeze({
          claimRef: Object.freeze({ minLength: 1, type: "string" }),
          evidenceRefs: Object.freeze({
            items: Object.freeze({ minLength: 1, type: "string" }),
            minItems: 1,
            type: "array"
          }),
          findingKind: Object.freeze({
            enum: Object.freeze(["support", "objection", "unresolved"])
          }),
          findingRef: Object.freeze({ minLength: 1, type: "string" }),
          kind: Object.freeze({ const: "consensus_reviewer_finding" }),
          summary: Object.freeze({ minLength: 1, type: "string" })
        }),
        required: Object.freeze([
          "kind",
          "findingRef",
          "claimRef",
          "findingKind",
          "summary",
          "evidenceRefs"
        ]),
        type: "object"
      }),
      type: "array"
    }),
    ruling: Object.freeze({
      additionalProperties: false,
      properties: Object.freeze({
        evidenceRefs: Object.freeze({
          items: Object.freeze({ minLength: 1, type: "string" }),
          minItems: 1,
          type: "array"
        }),
        kind: Object.freeze({ const: "consensus_ruling_proposal" }),
        rulingKind: Object.freeze({
          enum: Object.freeze([
            "decision_row",
            "draft_ticket",
            "split_ticket",
            "deferment",
            "rejected_finding"
          ])
        }),
        summary: Object.freeze({ minLength: 1, type: "string" })
      }),
      required: Object.freeze([
        "kind",
        "rulingKind",
        "summary",
        "evidenceRefs"
      ]),
      type: "object"
    })
  }),
  required: Object.freeze([
    "kind",
    "disposition",
    "findings",
    "ruling",
    "evidenceRefs"
  ]),
  type: "object"
});

const CONSENSUS_SUBMITTER_PAYLOAD_SCHEMA = Object.freeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: Object.freeze({
    addressedFindingRefs: Object.freeze({
      items: Object.freeze({ minLength: 1, type: "string" }),
      type: "array",
      uniqueItems: true
    }),
    decisionRef: Object.freeze({ minLength: 1, type: "string" }),
    evidenceRefs: Object.freeze({
      items: Object.freeze({ minLength: 1, type: "string" }),
      minItems: 1,
      type: "array",
      uniqueItems: true
    }),
    kind: Object.freeze({ const: "consensus_submitter_payload" }),
    summary: Object.freeze({ minLength: 1, type: "string" })
  }),
  required: Object.freeze([
    "kind",
    "decisionRef",
    "summary",
    "addressedFindingRefs",
    "evidenceRefs"
  ]),
  type: "object"
});

interface ConsensusEvaluationArtifact {
  readonly kind: "consensus_result";
  readonly contractRef: typeof CONSENSUS_RESULT_SCHEMA_REF;
  readonly initialRequestRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: string;
  readonly submitterRef: string;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly finalOutcome:
    | "closed_done"
    | "recurse_next_round"
    | "escalate_fh";
  readonly rulingKind:
    | "decision_row"
    | "draft_ticket"
    | "split_ticket"
    | "deferment"
    | "rejected_finding"
    | null;
  readonly nextAction:
    | "admit_ruling"
    | "verify_next_round"
    | "fh_adjudicate";
  readonly rounds: readonly unknown[];
  readonly priorRoundRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly resultDigest: string;
}

class ConsensusReviewerFailure extends Error {
  readonly evidenceRefs: readonly string[];

  constructor(message: string, evidenceRefs: readonly string[]) {
    super(message);
    this.name = "ConsensusReviewerFailure";
    this.evidenceRefs = Object.freeze([...evidenceRefs]);
  }
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function strictRecord(
  value: unknown,
  fields: readonly string[],
  label: string
): Readonly<Record<string, unknown>> {
  if (!isPlainRecord(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  const expected = [...fields].sort();
  const actual = Object.keys(value).sort();
  if (stableJson(actual) !== stableJson(expected)) {
    throw new TypeError(`${label} carries an unknown or missing field`);
  }
  return value;
}

function decodeJsonDataUri(uri: string): unknown {
  const separator = uri.indexOf(",");
  if (
    separator < 0 ||
    !uri.slice(0, separator).startsWith("data:application/json")
  ) {
    throw new TypeError("Consensus input must be an application/json data URI");
  }
  const metadata = uri.slice(0, separator);
  if (metadata.includes(";base64")) {
    throw new TypeError("Consensus input does not admit base64 data URIs");
  }
  return JSON.parse(decodeURIComponent(uri.slice(separator + 1)));
}

function requestFromPluginInput(input: EnginePluginInput): ConsensusRequest {
  const candidates = input.inputAssetBindings.filter(
    (binding) => binding.assetType === CONSENSUS_REQUEST_SCHEMA_REF
  );
  const binding = candidates[0];
  if (candidates.length !== 1 || binding === undefined) {
    throw new TypeError(
      `Consensus requires exactly one ${CONSENSUS_REQUEST_SCHEMA_REF} input binding`
    );
  }
  return admitConsensusRequest(
    decodeJsonDataUri(binding.uri),
    "Consensus GraphFunction request"
  );
}

function plainRequest(request: ConsensusRequest): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: request.kind,
    requestRef: request.requestRef,
    subjectRef: request.subjectRef,
    subject: request.subject,
    subjectDigest: request.subjectDigest,
    submitterRef: request.submitterRef,
    submitterWorkerRef: request.submitterWorkerRef,
    panelRef: request.panelRef,
    policyRef: request.policyRef,
    roundIndex: request.roundIndex,
    maxRounds: request.maxRounds,
    reviewerProfiles: request.reviewerProfiles
  });
}

function plainResponse(
  response: ConsensusReviewerResponse
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: response.kind,
    responseRef: response.responseRef,
    requestRef: response.requestRef,
    subjectRef: response.subjectRef,
    subjectDigest: response.subjectDigest,
    roundIndex: response.roundIndex,
    reviewerProfileRef: response.reviewerProfileRef,
    reviewerProfileDigest: response.reviewerProfileDigest,
    invocationRef: response.invocationRef,
    outputDigest: response.outputDigest,
    disposition: response.disposition,
    findings: response.findings,
    ruling: response.ruling,
    evidenceRefs: response.evidenceRefs
  });
}

function parseReviewerPayload(text: string): Readonly<Record<string, unknown>> {
  return strictRecord(
    JSON.parse(text.trim()),
    ["kind", "disposition", "findings", "ruling", "evidenceRefs"],
    "Consensus reviewer payload"
  );
}

function strictEvidenceRefs(
  input: unknown,
  label: string
): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  const refs = input.map((value, index) =>
    nonEmptyString(value, `${label}[${String(index)}]`)
  );
  if (new Set(refs).size !== refs.length) {
    throw new TypeError(`${label} must not contain duplicates`);
  }
  return Object.freeze(refs);
}

function safeLabel(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function transportEvidence(transport: AgentTransportResult): readonly string[] {
  return Object.freeze([
    `agent-output:${transport.outputPath}`,
    ...(transport.traceResultPath === null
      ? []
      : [`agent-trace:${transport.traceResultPath}`]),
    `worker:${transport.workerRef}`
  ]);
}

function reviewerPrompt(input: {
  readonly request: ConsensusRequest;
  readonly profile: ConsensusReviewerProfile;
  readonly priorRoundRefs: readonly string[];
  readonly priorRoundContext: ConsensusEvaluationArtifact | null;
  readonly basePrompt: string;
}): string {
  return [
    input.basePrompt,
    "",
    "You are one declared reviewer in an ABIogenesis Consensus GraphFunction.",
    `Reviewer profile ref: ${input.profile.profileRef}`,
    `Reviewer profile digest: ${input.profile.profileConfigDigest}`,
    `Reviewer worker ref: ${input.profile.workerRef}`,
    `Subject ref: ${input.request.subjectRef}`,
    `Subject digest: ${input.request.subjectDigest}`,
    `Round: ${String(input.request.roundIndex)} of ${String(input.request.maxRounds)}`,
    `Admitted subject: ${stableJson(input.request.subject)}`,
    "Review the admitted subject under the named profile.",
    "Return exactly one JSON object with kind, disposition, findings, ruling, and evidenceRefs.",
    "Each finding must use the declared consensus_reviewer_finding fields.",
    "The ruling must use kind consensus_ruling_proposal and one closed review ruling kind.",
    "Use the same stable claimRef for the same cited claim across reviewers and rounds.",
    "Use accept only with support findings or no findings; revise for objections; escalate for unresolved judgment.",
    input.priorRoundRefs.length === 0
      ? "This is the first round."
      : [
          "This is a governed verification round.",
          `Prior round replay refs: ${stableJson(input.priorRoundRefs)}`,
          `Admitted prior decision and submitter response: ${stableJson(input.priorRoundContext)}`
        ].join(" ")
  ].join("\n");
}

function submitterPrompt(input: {
  readonly request: ConsensusRequest;
  readonly decision: ConsensusRoundDecision;
}): string {
  return [
    "You are the declared submitter in an ABIogenesis Consensus GraphFunction.",
    `Submitter ref: ${input.request.submitterRef}`,
    `Submitter worker ref: ${input.request.submitterWorkerRef}`,
    `Subject ref: ${input.request.subjectRef}`,
    `Subject digest: ${input.request.subjectDigest}`,
    `Admitted subject: ${stableJson(input.request.subject)}`,
    `Disputed round decision: ${stableJson(input.decision)}`,
    "Respond to every dissentFindingRef. Return exactly one JSON object with kind, decisionRef, summary, addressedFindingRefs, and evidenceRefs.",
    "The decisionRef must match the admitted disputed decision."
  ].join("\n");
}

function reviewerResponse(input: {
  readonly request: ConsensusRequest;
  readonly profile: ConsensusReviewerProfile;
  readonly transport: AgentTransportResult;
  readonly rawPayload: Readonly<Record<string, unknown>>;
}): ConsensusReviewerResponse {
  if (input.rawPayload["kind"] !== "consensus_reviewer_payload") {
    throw new TypeError("Consensus reviewer payload.kind is invalid");
  }
  const outputDigest = stableSha256Digest({
    agentKey: input.transport.agentKey,
    workerRef: input.transport.workerRef,
    text: input.transport.text
  });
  const declaredEvidenceRefs = strictEvidenceRefs(
    input.rawPayload["evidenceRefs"],
    "Consensus reviewer payload.evidenceRefs"
  );
  const evidenceRefs = Object.freeze([
    ...new Set([...transportEvidence(input.transport), ...declaredEvidenceRefs])
  ]);
  return admitConsensusReviewerResponse({
    kind: "consensus_reviewer_response",
    requestRef: input.request.requestRef,
    subjectRef: input.request.subjectRef,
    subjectDigest: input.request.subjectDigest,
    roundIndex: input.request.roundIndex,
    reviewerProfileRef: input.profile.profileRef,
    reviewerProfileDigest: input.profile.profileConfigDigest,
    invocationRef: `actor-invocation://abg/consensus/${safeLabel(
      `${input.request.requestRef}:${input.profile.profileRef}:${outputDigest}`
    )}`,
    outputDigest,
    disposition: input.rawPayload["disposition"],
    findings: input.rawPayload["findings"],
    ruling: input.rawPayload["ruling"],
    evidenceRefs
  });
}

function parseSubmitterPayload(
  text: string
): Readonly<Record<string, unknown>> {
  return strictRecord(
    JSON.parse(text.trim()),
    [
      "kind",
      "decisionRef",
      "summary",
      "addressedFindingRefs",
      "evidenceRefs"
    ],
    "Consensus submitter payload"
  );
}

function submitterResponse(input: {
  readonly request: ConsensusRequest;
  readonly decision: ConsensusRoundDecision;
  readonly transport: AgentTransportResult;
  readonly rawPayload: Readonly<Record<string, unknown>>;
}): ConsensusSubmitterResponse {
  if (input.rawPayload["kind"] !== "consensus_submitter_payload") {
    throw new TypeError("Consensus submitter payload.kind is invalid");
  }
  if (input.rawPayload["decisionRef"] !== input.decision.decisionRef) {
    throw new TypeError(
      "Consensus submitter payload.decisionRef does not match the disputed decision"
    );
  }
  const addressedFindingRefs = strictEvidenceRefs(
    input.rawPayload["addressedFindingRefs"],
    "Consensus submitter payload.addressedFindingRefs"
  );
  if (
    stableJson([...addressedFindingRefs].sort()) !==
    stableJson([...input.decision.dissentFindingRefs].sort())
  ) {
    throw new TypeError(
      "Consensus submitter response must address every disputed finding exactly"
    );
  }
  const declaredEvidenceRefs = strictEvidenceRefs(
    input.rawPayload["evidenceRefs"],
    "Consensus submitter payload.evidenceRefs"
  );
  const outputDigest = stableSha256Digest({
    agentKey: input.transport.agentKey,
    workerRef: input.transport.workerRef,
    text: input.transport.text
  });
  const response = admitConsensusSubmitterResponse({
    kind: "consensus_submitter_response",
    requestRef: input.request.requestRef,
    subjectRef: input.request.subjectRef,
    subjectDigest: input.request.subjectDigest,
    roundIndex: input.request.roundIndex,
    decisionRef: input.decision.decisionRef,
    submitterRef: input.request.submitterRef,
    submitterWorkerRef: input.request.submitterWorkerRef,
    invocationRef: `actor-invocation://abg/consensus/${safeLabel(
      `${input.request.requestRef}:${input.request.submitterWorkerRef}:${outputDigest}`
    )}`,
    outputDigest,
    summary: input.rawPayload["summary"],
    addressedFindingRefs,
    evidenceRefs: Object.freeze([
      ...new Set([
        ...transportEvidence(input.transport),
        ...declaredEvidenceRefs
      ])
    ])
  });
  return bindConsensusSubmitterResponse({
    request: input.request,
    decision: input.decision,
    response
  });
}

function nextRoundRequest(
  initialRequest: ConsensusRequest,
  roundIndex: number
): ConsensusRequest {
  return admitConsensusRequest({
    ...plainRequest(initialRequest),
    requestRef: `${initialRequest.requestRef}#round-${String(roundIndex)}`,
    roundIndex
  });
}

function artifactFromRound(input: {
  readonly initialRequest: ConsensusRequest;
  readonly round: ConsensusRoundRecord;
  readonly priorRoundRefs: readonly string[];
}): ConsensusResult {
  const evidenceRefs = Object.freeze([
    ...new Set([
      ...input.round.decision.evidenceRefs,
      ...(input.round.submitterResponse?.evidenceRefs ?? [])
    ])
  ].sort());
  const basis = Object.freeze({
    kind: "consensus_result" as const,
    contractRef: CONSENSUS_RESULT_SCHEMA_REF,
    initialRequestRef: input.initialRequest.requestRef,
    subjectRef: input.initialRequest.subjectRef,
    subjectDigest: input.initialRequest.subjectDigest,
    submitterRef: input.initialRequest.submitterRef,
    panelRef: input.initialRequest.panelRef,
    policyRef: input.initialRequest.policyRef,
    finalOutcome: input.round.decision.outcome,
    rulingKind: input.round.decision.rulingKind,
    nextAction: input.round.decision.nextAction,
    rounds: Object.freeze([input.round]),
    priorRoundRefs: Object.freeze([...input.priorRoundRefs]),
    evidenceRefs
  });
  return Object.freeze({
    ...basis,
    resultDigest: stableSha256Digest(basis)
  });
}

function admitConsensusResultArtifact(
  input: unknown,
  label = "ConsensusResultArtifact"
): ConsensusEvaluationArtifact {
  const value = strictRecord(
    input,
    [
      "kind",
      "contractRef",
      "initialRequestRef",
      "subjectRef",
      "subjectDigest",
      "submitterRef",
      "panelRef",
      "policyRef",
      "finalOutcome",
      "rulingKind",
      "nextAction",
      "rounds",
      "priorRoundRefs",
      "evidenceRefs",
      "resultDigest"
    ],
    label
  );
  if (
    value["kind"] !== "consensus_result" ||
    value["contractRef"] !== CONSENSUS_RESULT_SCHEMA_REF ||
    (value["finalOutcome"] !== "closed_done" &&
      value["finalOutcome"] !== "recurse_next_round" &&
      value["finalOutcome"] !== "escalate_fh") ||
    !Array.isArray(value["rounds"]) ||
    value["rounds"].length === 0 ||
    !Array.isArray(value["priorRoundRefs"]) ||
    !Array.isArray(value["evidenceRefs"])
  ) {
    throw new TypeError(`${label} has an invalid result envelope`);
  }
  const finalOutcome = value["finalOutcome"];
  const rulingKind = value["rulingKind"];
  if (
    rulingKind !== null &&
    rulingKind !== "decision_row" &&
    rulingKind !== "draft_ticket" &&
    rulingKind !== "split_ticket" &&
    rulingKind !== "deferment" &&
    rulingKind !== "rejected_finding"
  ) {
    throw new TypeError(`${label}.rulingKind is invalid`);
  }
  const nextAction = value["nextAction"];
  if (
    nextAction !== "admit_ruling" &&
    nextAction !== "verify_next_round" &&
    nextAction !== "fh_adjudicate"
  ) {
    throw new TypeError(`${label}.nextAction is invalid`);
  }
  const evidenceRefs = Object.freeze(
    value["evidenceRefs"].map((entry, index) =>
      nonEmptyString(entry, `${label}.evidenceRefs[${String(index)}]`)
    )
  );
  const basis = Object.freeze({
    kind: "consensus_result" as const,
    contractRef: CONSENSUS_RESULT_SCHEMA_REF,
    initialRequestRef: nonEmptyString(
      value["initialRequestRef"],
      `${label}.initialRequestRef`
    ),
    subjectRef: nonEmptyString(value["subjectRef"], `${label}.subjectRef`),
    subjectDigest: nonEmptyString(
      value["subjectDigest"],
      `${label}.subjectDigest`
    ),
    submitterRef: nonEmptyString(
      value["submitterRef"],
      `${label}.submitterRef`
    ),
    panelRef: nonEmptyString(value["panelRef"], `${label}.panelRef`),
    policyRef: nonEmptyString(value["policyRef"], `${label}.policyRef`),
    finalOutcome,
    rulingKind,
    nextAction,
    rounds: Object.freeze(
      value["rounds"].map((entry: unknown): unknown => entry)
    ),
    priorRoundRefs: strictEvidenceRefs(
      value["priorRoundRefs"],
      `${label}.priorRoundRefs`
    ),
    evidenceRefs
  });
  const resultDigest = nonEmptyString(
    value["resultDigest"],
    `${label}.resultDigest`
  );
  if (stableSha256Digest(basis) !== resultDigest) {
    throw new TypeError(`${label}.resultDigest does not match result content`);
  }
  return Object.freeze({ ...basis, resultDigest });
}

function admitPersistedReviewerResponse(
  input: unknown,
  label: string
): ConsensusReviewerResponse {
  const value = strictRecord(
    input,
    [
      "kind",
      "responseRef",
      "requestRef",
      "subjectRef",
      "subjectDigest",
      "roundIndex",
      "reviewerProfileRef",
      "reviewerProfileDigest",
      "invocationRef",
      "outputDigest",
      "disposition",
      "findings",
      "ruling",
      "evidenceRefs"
    ],
    label
  );
  const responseRef = nonEmptyString(value["responseRef"], `${label}.responseRef`);
  const admitted = admitConsensusReviewerResponse(
    Object.fromEntries(
      Object.entries(value).filter(([field]) => field !== "responseRef")
    ),
    label
  );
  if (admitted.responseRef !== responseRef) {
    throw new TypeError(`${label}.responseRef does not match admitted content`);
  }
  return admitted;
}

function admitPersistedSubmitterResponse(
  input: unknown,
  label: string
): ConsensusSubmitterResponse {
  const value = strictRecord(
    input,
    [
      "kind",
      "responseRef",
      "requestRef",
      "subjectRef",
      "subjectDigest",
      "roundIndex",
      "decisionRef",
      "submitterRef",
      "submitterWorkerRef",
      "invocationRef",
      "outputDigest",
      "summary",
      "addressedFindingRefs",
      "evidenceRefs"
    ],
    label
  );
  const responseRef = nonEmptyString(value["responseRef"], `${label}.responseRef`);
  const admitted = admitConsensusSubmitterResponse(
    Object.fromEntries(
      Object.entries(value).filter(([field]) => field !== "responseRef")
    ),
    label
  );
  if (admitted.responseRef !== responseRef) {
    throw new TypeError(`${label}.responseRef does not match admitted content`);
  }
  return admitted;
}

function admitPriorConsensusRound(
  input: unknown,
  label: string
): ConsensusRoundRecord {
  const value = strictRecord(
    input,
    [
      "kind",
      "request",
      "responses",
      "decision",
      "submitterResponse",
      "frontierRef",
      "batchCount",
      "completedBranchRefs"
    ],
    label
  );
  if (value["kind"] !== "consensus_round_record") {
    throw new TypeError(`${label}.kind is invalid`);
  }
  const request = admitConsensusRequest(value["request"], `${label}.request`);
  if (!Array.isArray(value["responses"])) {
    throw new TypeError(`${label}.responses must be an array`);
  }
  const responses = Object.freeze(
    value["responses"].map((response, index) =>
      admitPersistedReviewerResponse(
        response,
        `${label}.responses[${String(index)}]`
      )
    )
  );
  const decision = reduceConsensusRound({ request, responses });
  if (stableJson(value["decision"]) !== stableJson(decision)) {
    throw new TypeError(`${label}.decision does not match admitted round reduction`);
  }
  let submitterResponse: ConsensusSubmitterResponse | null = null;
  if (decision.outcome === "recurse_next_round") {
    submitterResponse = bindConsensusSubmitterResponse({
      request,
      decision,
      response: admitPersistedSubmitterResponse(
        value["submitterResponse"],
        `${label}.submitterResponse`
      )
    });
  } else if (value["submitterResponse"] !== null) {
    throw new TypeError(
      `${label}.submitterResponse is admitted only for recurse_next_round`
    );
  }
  const frontierRef = nonEmptyString(value["frontierRef"], `${label}.frontierRef`);
  const batchCount = value["batchCount"];
  if (
    typeof batchCount !== "number" ||
    !Number.isInteger(batchCount) ||
    batchCount < 1
  ) {
    throw new TypeError(`${label}.batchCount must be a positive integer`);
  }
  const completedBranchRefs = strictEvidenceRefs(
    value["completedBranchRefs"],
    `${label}.completedBranchRefs`
  );
  if (completedBranchRefs.length !== request.reviewerProfiles.length) {
    throw new TypeError(
      `${label}.completedBranchRefs must cover every reviewer profile`
    );
  }
  return Object.freeze({
    kind: "consensus_round_record",
    request: plainRequest(request),
    responses: Object.freeze(responses.map(plainResponse)),
    decision,
    submitterResponse,
    frontierRef,
    batchCount,
    completedBranchRefs
  });
}

function priorConsensusArtifacts(
  input: EnginePluginInput,
  initialRequest: ConsensusRequest
): readonly ConsensusEvaluationArtifact[] {
  const admitted: ConsensusEvaluationArtifact[] = [];
  const seenAttempts = new Set<number>();
  for (const [index, artifact] of input.priorAttemptResultArtifacts.entries()) {
    const candidate = artifact.body["consensus_result"];
    if (candidate === undefined) {
      continue;
    }
    if (seenAttempts.has(artifact.attemptIndex)) {
      throw new TypeError(
        `Consensus continuation carries duplicate result artifacts for attempt ${String(artifact.attemptIndex)}`
      );
    }
    const label =
      `EnginePluginInput.priorAttemptResultArtifacts[${String(index)}].consensus_result`;
    const result = admitConsensusResultArtifact(candidate, label);
    if (result.rounds.length !== 1) {
      throw new TypeError(`${label}.rounds must contain exactly one round`);
    }
    const round = admitPriorConsensusRound(result.rounds[0], `${label}.rounds[0]`);
    const expectedRoundIndex = initialRequest.roundIndex + admitted.length;
    const expectedRequest =
      admitted.length === 0
        ? initialRequest
        : nextRoundRequest(initialRequest, expectedRoundIndex);
    if (stableJson(round.request) !== stableJson(plainRequest(expectedRequest))) {
      throw new TypeError(`${label} does not match the current request lineage`);
    }
    if (
      result.initialRequestRef !== initialRequest.requestRef ||
      result.subjectRef !== initialRequest.subjectRef ||
      result.subjectDigest !== initialRequest.subjectDigest ||
      result.submitterRef !== initialRequest.submitterRef ||
      result.panelRef !== initialRequest.panelRef ||
      result.policyRef !== initialRequest.policyRef ||
      result.finalOutcome !== round.decision.outcome ||
      result.rulingKind !== round.decision.rulingKind ||
      result.nextAction !== round.decision.nextAction ||
      stableJson(result.priorRoundRefs) !==
        stableJson(admitted.map((prior) => prior.resultDigest))
    ) {
      throw new TypeError(`${label} carries contradictory continuation truth`);
    }
    seenAttempts.add(artifact.attemptIndex);
    admitted.push(Object.freeze({ ...result, rounds: Object.freeze([round]) }));
  }
  return Object.freeze(admitted);
}

function requiredReviewerResponse(
  responses: ReadonlyMap<string, ConsensusReviewerResponse>,
  profileRef: string
): ConsensusReviewerResponse {
  const response = responses.get(profileRef);
  if (response === undefined) {
    throw new TypeError(`missing reviewer response ${profileRef}`);
  }
  return response;
}

function snapshotCapability(input: LiveFpDispatchCapability): LiveFpDispatchCapability {
  return Object.freeze({
    agentContract: Object.freeze({
      agentKey: input.agentContract.agentKey,
      command: input.agentContract.command,
      argsTemplate: Object.freeze([...input.agentContract.argsTemplate]),
      sanitizedEnvironmentPolicy: Object.freeze({
        prefixes: Object.freeze([...input.agentContract.sanitizedEnvironmentPolicy.prefixes])
      })
    }),
    archiveRoot: input.archiveRoot,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
    ...(input.executorProfile === undefined
      ? {}
      : { executorProfile: input.executorProfile }),
    ...(input.terminalSessionKeyPrefix === undefined
      ? {}
      : { terminalSessionKeyPrefix: input.terminalSessionKeyPrefix }),
    ...(input.labelPrefix === undefined ? {} : { labelPrefix: input.labelPrefix })
  });
}

const consensusDispatchContract = constructEnginePluginContract({
  ref: CONSENSUS_FP_DISPATCH_PLUGIN_REF,
  driverRequirement: "async_required",
  pluginKind: "fp_dispatch",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpDispatchOutcome"
});

const consensusEvaluatorContract = constructEnginePluginContract({
  ref: CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
  driverRequirement: "sync_compatible",
  pluginKind: "fp_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpEvaluationOutcome"
});

export function standardConsensusFpDispatchPlugin(
  inputCapability: LiveFpDispatchCapability
): FpDispatchPlugin<"async_required"> {
  const capability = snapshotCapability(inputCapability);
  const timeoutMs = admitTimeoutBudgetMs(
    capability.timeoutMs,
    "consensus_live_fp_capability"
  );
  return Object.freeze({
    contract: consensusDispatchContract,
    dispatch: async (input: EnginePluginInput): Promise<FpDispatchOutcome> => {
      if (
        input.cCallRef === null ||
        input.graphCallId === null ||
        input.frameId === null ||
        input.instructionPromptManifest === null
      ) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: "Consensus dispatch requires c-call, graph, frame, and instruction truth (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let initialRequest: ConsensusRequest;
      try {
        initialRequest = requestFromPluginInput(input);
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `Consensus request admission failed: ${
            error instanceof Error ? error.message : "invalid input"
          } (contract_failure)`,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const incompatibleProfiles = initialRequest.reviewerProfiles.filter(
        (profile) =>
          profile.resultSchemaRef !== CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF
      );
      if (incompatibleProfiles.length > 0) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `Consensus reviewer profiles select unsupported result schemas: ${incompatibleProfiles
            .map((profile) => profile.profileRef)
            .join(", ")} (contract_failure)`,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }

      const attemptIndex = input.actorInvocationRef?.attemptIndex;
      if (attemptIndex === undefined) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: "Consensus dispatch requires an admitted actor attempt (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let priorArtifacts: readonly ConsensusEvaluationArtifact[];
      try {
        priorArtifacts = priorConsensusArtifacts(input, initialRequest);
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `Consensus continuation foldback admission failed: ${
            error instanceof Error ? error.message : "invalid prior result"
          } (contract_failure)`,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const roundIndex = initialRequest.roundIndex + priorArtifacts.length;
      if (roundIndex > initialRequest.maxRounds) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: "Consensus retry exceeded the declared round budget (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const request =
        roundIndex === initialRequest.roundIndex
          ? initialRequest
          : nextRoundRequest(initialRequest, roundIndex);
      const priorRoundContext = priorArtifacts.at(-1) ?? null;
      if (roundIndex > initialRequest.roundIndex) {
        const priorRound = priorRoundContext?.rounds.at(-1);
        if (
          priorRoundContext === null ||
          priorRoundContext.finalOutcome !== "recurse_next_round" ||
          !isPlainRecord(priorRound) ||
          !isPlainRecord(priorRound["submitterResponse"])
        ) {
          return constructFpDispatchOutcome({
            status: "blocked",
            reason: "Consensus verification round requires admitted prior dissent and submitter response (contract_failure)",
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
      }
      const priorRoundRefs = Object.freeze(
        priorArtifacts.map((artifact) => artifact.resultDigest)
      );
      const frontierRef = `frontier://abg/consensus/${safeLabel(request.requestRef)}`;
      const fanInScopeRef = `${frontierRef}/reviewer-findings`;
      const responses = new Map<string, ConsensusReviewerResponse>();
      const branches = request.reviewerProfiles.map((profile) =>
        constructBranchRef({
          graphCallId: input.graphCallId ?? "",
          frameId: input.frameId ?? "",
          actionRef: profile.profileRef,
          branchKey: profile.profileRef,
          fanInScopeRef,
          workKey: request.requestRef,
          basisId: input.basisId,
          graphFunctionId: input.graphFunctionId,
          frontierRef
        })
      );
      const declarations = branches.map((branch, index) => {
        const observedStateRefs = [request.subjectRef, request.subjectDigest];
        const outputAllocationRefs = [
          `output://abg/consensus/${safeLabel(request.requestRef)}/${String(index)}`
        ];
        return constructDependencyFrontierDeclaration({
          branchRef: branch,
          observedStateRefs,
          readRefs: observedStateRefs,
          outputAllocationRefs,
          idempotencyKey: deriveBranchIdempotencyKey({
            commandKind: "consensus_reviewer_subwork",
            branchRef: branch,
            payloadScopeRef: request.requestRef,
            observedStateRefs,
            outputAllocationRefs
          }),
          fanInScopeRef,
          declaredPriority: request.reviewerProfiles.length - index
        });
      });
      const tasks: readonly NativeBranchTask[] = Object.freeze(
        request.reviewerProfiles.map((profile, index) => {
          const branch = branches[index];
          if (branch === undefined) {
            throw new TypeError("Consensus branch construction lost a reviewer profile");
          }
          return Object.freeze({
            kind: "native_branch_task" as const,
            branchRef: branch.branchRef,
            failureEvidenceRefs: [input.sourceProjectionRef, profile.profileRef],
            run: async () => {
              const label = `consensus-${safeLabel(
                `${input.cCallRef}:${request.roundIndex}:${profile.profileRef}`
              )}`;
              const archiveRoot = join(capability.archiveRoot, "consensus");
              const transport = await runAgentTransport({
                contract: capability.agentContract,
                prompt: reviewerPrompt({
                  request,
                  profile,
                  priorRoundRefs,
                  priorRoundContext,
                  basePrompt: input.instructionPromptManifest?.renderedPrompt ?? ""
                }),
                responseJsonSchema: CONSENSUS_REVIEWER_PAYLOAD_SCHEMA,
                cwd: capability.cwd,
                archiveRoot,
                label,
                timeoutMs,
                ...(capability.executorProfile === undefined
                  ? {}
                  : { executorProfile: capability.executorProfile }),
                ...(capability.terminalSessionKeyPrefix === undefined
                  ? {}
                  : {
                      terminalSessionKey: `${capability.terminalSessionKeyPrefix}-${label}`
                    }),
                workerRef: profile.workerRef,
                actorRef: request.submitterRef
              });
              const evidenceRefs = transportEvidence(transport);
              if (transport.status !== 0 || transport.failureClass !== null) {
                throw new ConsensusReviewerFailure(
                  `reviewer transport failed for ${profile.profileRef}: ${transport.failureClass ?? String(transport.status)}`,
                  evidenceRefs
                );
              }
              try {
                const response = reviewerResponse({
                  request,
                  profile,
                  transport,
                  rawPayload: parseReviewerPayload(transport.text)
                });
                responses.set(profile.profileRef, response);
                return Object.freeze({
                  kind: "native_branch_task_result" as const,
                  branchRef: branch.branchRef,
                  payloadDigest: response.outputDigest,
                  evidenceRefs: response.evidenceRefs
                });
              } catch (error) {
                throw new ConsensusReviewerFailure(
                  `reviewer result admission failed for ${profile.profileRef}: ${
                    error instanceof Error ? error.message : "malformed output"
                  }`,
                  evidenceRefs
                );
              }
            }
          });
        })
      );
      const frontier = await runNativeSagaFrontier({
        frontierRef,
        declarations,
        policy: constructBranchExecutionPolicy({
          policyRef: `${request.policyRef}#round-${String(request.roundIndex)}`,
          maxConcurrency: Math.max(1, request.reviewerProfiles.length),
          maxRetryAttempts: 0,
          retryBudgetExhaustedDisposition: "block"
        }),
        tasks
      });
      if (
        frontier.failedBranchRefs.length > 0 ||
        responses.size !== request.reviewerProfiles.length
      ) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `Consensus reviewer subwork failed for ${frontier.failedBranchRefs.join(", ")} (contract_failure)`,
          evidenceRefs: [
            input.sourceProjectionRef,
            ...frontier.batches.flatMap((batch) =>
              batch.taskFailures.flatMap((failure) => failure.evidenceRefs)
            )
          ]
        });
      }
      let decision: ConsensusRoundDecision;
      try {
        decision = reduceConsensusRound({
          request,
          responses: request.reviewerProfiles.map((profile) =>
            requiredReviewerResponse(responses, profile.profileRef)
          )
        });
      } catch (error) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: `Consensus reduction failed: ${
            error instanceof Error ? error.message : "invalid round"
          } (contract_failure)`,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      let admittedSubmitterResponse: ConsensusSubmitterResponse | null = null;
      if (decision.outcome === "recurse_next_round") {
        const label = `consensus-${safeLabel(
          `${input.cCallRef}:${request.roundIndex}:${request.submitterWorkerRef}:submitter`
        )}`;
        const archiveRoot = join(capability.archiveRoot, "consensus");
        let transport: AgentTransportResult;
        try {
          transport = await runAgentTransport({
            contract: capability.agentContract,
            prompt: submitterPrompt({ request, decision }),
            responseJsonSchema: CONSENSUS_SUBMITTER_PAYLOAD_SCHEMA,
            cwd: capability.cwd,
            archiveRoot,
            label,
            timeoutMs,
            ...(capability.executorProfile === undefined
              ? {}
              : { executorProfile: capability.executorProfile }),
            ...(capability.terminalSessionKeyPrefix === undefined
              ? {}
              : {
                  terminalSessionKey: `${capability.terminalSessionKeyPrefix}-${label}`
                }),
            workerRef: request.submitterWorkerRef,
            actorRef: request.submitterRef
          });
        } catch (error) {
          return constructFpDispatchOutcome({
            status: "blocked",
            reason: `Consensus submitter transport threw: ${
              error instanceof Error ? error.message : "transport failure"
            } (contract_failure)`,
            evidenceRefs: [input.sourceProjectionRef]
          });
        }
        const submitterEvidenceRefs = transportEvidence(transport);
        if (transport.status !== 0 || transport.failureClass !== null) {
          return constructFpDispatchOutcome({
            status: "blocked",
            reason: `Consensus submitter transport failed: ${transport.failureClass ?? String(transport.status)} (contract_failure)`,
            evidenceRefs: [input.sourceProjectionRef, ...submitterEvidenceRefs]
          });
        }
        try {
          admittedSubmitterResponse = submitterResponse({
            request,
            decision,
            transport,
            rawPayload: parseSubmitterPayload(transport.text)
          });
        } catch (error) {
          return constructFpDispatchOutcome({
            status: "blocked",
            reason: `Consensus submitter response admission failed: ${
              error instanceof Error ? error.message : "malformed output"
            } (contract_failure)`,
            evidenceRefs: [input.sourceProjectionRef, ...submitterEvidenceRefs]
          });
        }
      }
      const round = Object.freeze({
        kind: "consensus_round_record" as const,
        request: plainRequest(request),
        responses: Object.freeze(
          request.reviewerProfiles.map((profile) =>
            plainResponse(requiredReviewerResponse(responses, profile.profileRef))
          )
        ),
        decision,
        submitterResponse: admittedSubmitterResponse,
        frontierRef,
        batchCount: frontier.batchCount,
        completedBranchRefs: frontier.completedBranchRefs
      });
      const artifact = artifactFromRound({
        initialRequest,
        round,
        priorRoundRefs
      });
      const attachedResultArtifact = Object.freeze({
        edge: input.expectedEdge ?? input.edge,
        actor: "worker://abg/consensus-panel",
        fulfillment_assessments: Object.freeze([
          Object.freeze({
            id: "consensus_round_admitted",
            evaluator: CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
            fulfillment_status: "fulfilled",
            fulfillment_detail: `Consensus round ${String(request.roundIndex)} admitted`,
            blocking_reasons: Object.freeze([]),
            evidence_refs: Object.freeze([artifact.resultDigest])
          })
        ]),
        consensus_result: Object.freeze({ ...artifact })
      });
      if (stableJson(attachedResultArtifact).length > 52_000) {
        return constructFpDispatchOutcome({
          status: "blocked",
          reason: "Consensus result exceeds the public replay artifact bound (contract_failure)",
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: null,
        attachedResultArtifact,
        evidenceRefs: [
          input.sourceProjectionRef,
          artifact.resultDigest,
          ...artifact.evidenceRefs
        ]
      });
    }
  });
}

export function standardConsensusFpEvaluatorPlugin(): FpEvaluatorPlugin<"sync_compatible"> {
  return Object.freeze({
    contract: consensusEvaluatorContract,
    evaluate: (input: EnginePluginInput): FpEvaluationOutcome => {
      let artifact: ConsensusEvaluationArtifact;
      try {
        artifact = admitConsensusResultArtifact(
          input.attachedResultArtifact?.["consensus_result"]
        );
      } catch (error) {
        return constructFpEvaluationOutcome({
          status: "blocked",
          reason: `Consensus result admission failed: ${
            error instanceof Error ? error.message : "missing artifact"
          } (contract_failure)`,
          evidenceRefs: [input.sourceProjectionRef]
        });
      }
      const closed = artifact.finalOutcome === "closed_done";
      const recurse = artifact.finalOutcome === "recurse_next_round";
      return constructFpEvaluationOutcome({
        status: "evaluated",
        findings: [
          constructFpEvaluationFinding({
            findingRef: `finding:consensus:${artifact.resultDigest}`,
            evaluatorRef: CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
            closeDisposition: closed
              ? "close"
              : recurse
                ? "retry"
                : "human_gate_required",
            residualPressureRefs: closed
              ? []
              : [`pressure:consensus:${artifact.resultDigest}`],
            continuationRefs: recurse
              ? [`continuation:consensus:${artifact.resultDigest}`]
              : [],
            evidenceRefs: [artifact.resultDigest, ...artifact.evidenceRefs],
            authorityRefs: [
              artifact.policyRef,
              artifact.panelRef,
              "consensus_round_admitted",
              ...input.expectedAssessmentIds
            ],
            compositionContributionRef:
              input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
            compositionRef: input.selectedCompositionRef,
            compositionDigest: input.selectedCompositionDigest,
            diagnosticRefs: closed
              ? []
              : [
                  recurse
                    ? "consensus_verification_round_required"
                    : "consensus_round_limit_escalated_fh"
                ],
            executiveDisposition: closed
              ? "close_candidate"
              : recurse
                ? "local_repair"
                : "block"
          })
        ],
        ambiguityStatus: closed ? "fulfilled" : "partial",
        diagnosticRefs: closed
          ? []
          : [
              recurse
                ? "consensus_verification_round_required"
                : "consensus_round_limit_escalated_fh"
            ],
        evidenceRefs: [input.sourceProjectionRef, artifact.resultDigest]
      });
    }
  });
}
