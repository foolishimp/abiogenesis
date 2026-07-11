// A5-CONSENSUS-01 contract core. This module admits panel and reviewer truth
// and performs the deterministic round reduction. Runtime dispatch, recursion,
// publication, and ticket mutation remain outside this boundary.

import {
  admitIJsonValue,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import { isPlainRecord } from "./admission_hygiene.js";
import {
  CONSENSUS_ROUND_OUTCOME_VALUES,
  REVIEW_RULING_KIND_VALUES,
  type ReviewRulingKind,
  type ConsensusRoundOutcome
} from "./review_consensus_modules.js";

export const CONSENSUS_REQUEST_SCHEMA_REF = "abg.schema.consensus-request";
export const CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF =
  "abg.schema.consensus-reviewer-response";
export const CONSENSUS_RESULT_SCHEMA_REF = "abg.schema.consensus-result";

export const CONSENSUS_REVIEWER_DISPOSITION_VALUES = Object.freeze([
  "accept",
  "revise",
  "escalate"
] as const);

export type ConsensusReviewerDisposition =
  (typeof CONSENSUS_REVIEWER_DISPOSITION_VALUES)[number];

export const CONSENSUS_FINDING_KIND_VALUES = Object.freeze([
  "support",
  "objection",
  "unresolved"
] as const);

export type ConsensusFindingKind =
  (typeof CONSENSUS_FINDING_KIND_VALUES)[number];

export const CONSENSUS_NEXT_ACTION_VALUES = Object.freeze([
  "admit_ruling",
  "verify_next_round",
  "fh_adjudicate"
] as const);

export type ConsensusNextAction =
  (typeof CONSENSUS_NEXT_ACTION_VALUES)[number];

const CONSENSUS_REQUEST_ADMITTED: unique symbol = Symbol(
  "abg.consensus.request.admitted"
);
const CONSENSUS_RESPONSE_ADMITTED: unique symbol = Symbol(
  "abg.consensus.response.admitted"
);
const CONSENSUS_SUBMITTER_RESPONSE_ADMITTED: unique symbol = Symbol(
  "abg.consensus.submitter-response.admitted"
);
const CONSENSUS_DECISION_ADMITTED: unique symbol = Symbol(
  "abg.consensus.decision.admitted"
);

export interface ConsensusReviewerProfile {
  readonly kind: "consensus_reviewer_profile";
  readonly profileRef: string;
  readonly profileConfigDigest: string;
  readonly workerRef: string;
  readonly resultSchemaRef: string;
}

export interface ConsensusRequest {
  readonly kind: "consensus_request";
  readonly requestRef: string;
  readonly subjectRef: string;
  readonly subject: IJsonValue;
  readonly subjectDigest: string;
  readonly submitterRef: string;
  readonly submitterWorkerRef: string;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly roundIndex: number;
  readonly maxRounds: number;
  readonly reviewerProfiles: readonly ConsensusReviewerProfile[];
  /** @hidden */
  readonly [CONSENSUS_REQUEST_ADMITTED]: true;
}

export interface ConsensusReviewerFinding {
  readonly kind: "consensus_reviewer_finding";
  readonly findingRef: string;
  readonly claimRef: string;
  readonly findingKind: ConsensusFindingKind;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface ConsensusRulingProposal {
  readonly kind: "consensus_ruling_proposal";
  readonly rulingKind: ReviewRulingKind;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
}

export interface ConsensusReviewerResponse {
  readonly kind: "consensus_reviewer_response";
  readonly responseRef: string;
  readonly requestRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: string;
  readonly roundIndex: number;
  readonly reviewerProfileRef: string;
  readonly reviewerProfileDigest: string;
  readonly invocationRef: string;
  readonly outputDigest: string;
  readonly disposition: ConsensusReviewerDisposition;
  readonly findings: readonly ConsensusReviewerFinding[];
  readonly ruling: ConsensusRulingProposal;
  readonly evidenceRefs: readonly string[];
  /** @hidden */
  readonly [CONSENSUS_RESPONSE_ADMITTED]: true;
}

export interface ConsensusSubmitterResponse {
  readonly kind: "consensus_submitter_response";
  readonly responseRef: string;
  readonly requestRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: string;
  readonly roundIndex: number;
  readonly decisionRef: string;
  readonly submitterRef: string;
  readonly submitterWorkerRef: string;
  readonly invocationRef: string;
  readonly outputDigest: string;
  readonly summary: string;
  readonly addressedFindingRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  /** @hidden */
  readonly [CONSENSUS_SUBMITTER_RESPONSE_ADMITTED]: true;
}

export interface ConsensusRoundDecision {
  readonly kind: "consensus_round_decision";
  readonly decisionRef: string;
  readonly requestRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: string;
  readonly roundIndex: number;
  readonly maxRounds: number;
  readonly outcome: ConsensusRoundOutcome;
  readonly rulingKind: ReviewRulingKind | null;
  readonly nextAction: ConsensusNextAction;
  readonly reviewerProfileRefs: readonly string[];
  readonly reviewerResponseRefs: readonly string[];
  readonly findingRefs: readonly string[];
  readonly dissentFindingRefs: readonly string[];
  readonly dissentResponseRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  /** @hidden */
  readonly [CONSENSUS_DECISION_ADMITTED]: true;
}

export interface ConsensusRoundRecord {
  readonly kind: "consensus_round_record";
  readonly request: Readonly<Record<string, unknown>>;
  readonly responses: readonly Readonly<Record<string, unknown>>[];
  readonly decision: ConsensusRoundDecision;
  readonly submitterResponse: ConsensusSubmitterResponse | null;
  readonly frontierRef: string;
  readonly batchCount: number;
  readonly completedBranchRefs: readonly string[];
}

export interface ConsensusResult {
  readonly kind: "consensus_result";
  readonly contractRef: typeof CONSENSUS_RESULT_SCHEMA_REF;
  readonly initialRequestRef: string;
  readonly subjectRef: string;
  readonly subjectDigest: string;
  readonly submitterRef: string;
  readonly panelRef: string;
  readonly policyRef: string;
  readonly finalOutcome: ConsensusRoundOutcome;
  readonly rulingKind: ReviewRulingKind | null;
  readonly nextAction: ConsensusNextAction;
  readonly rounds: readonly ConsensusRoundRecord[];
  readonly priorRoundRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly resultDigest: string;
}

function strictRecord(
  input: unknown,
  fields: readonly string[],
  label: string
): Readonly<Record<string, unknown>> {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  const actual = Object.keys(input).sort();
  const expected = [...fields].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const expectedSet = new Set(expected);
    const actualSet = new Set(actual);
    const missing = expected.filter((field) => !actualSet.has(field));
    const unknown = actual.filter((field) => !expectedSet.has(field));
    throw new TypeError(
      `${label} field set mismatch; missing=${JSON.stringify(missing)} unknown=${JSON.stringify(unknown)}`
    );
  }
  return input;
}

function nonEmptyString(input: unknown, label: string): string {
  if (typeof input !== "string" || input.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return input;
}

function sha256Digest(input: unknown, label: string): string {
  const value = nonEmptyString(input, label);
  if (!/^sha256:[a-f0-9]{64}$/u.test(value)) {
    throw new TypeError(`${label} must be a lowercase sha256 digest`);
  }
  return value;
}

function positiveInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input <= 0) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return input;
}

function strictArray(input: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  return input;
}

function uniqueStrings(
  input: unknown,
  label: string,
  minimumLength = 0
): readonly string[] {
  const values = strictArray(input, label).map((value, index) =>
    nonEmptyString(value, `${label}[${String(index)}]`)
  );
  if (values.length < minimumLength) {
    throw new TypeError(
      `${label} must contain at least ${String(minimumLength)} value(s)`
    );
  }
  if (new Set(values).size !== values.length) {
    throw new TypeError(`${label} must not contain duplicate values`);
  }
  return Object.freeze(values);
}

function enumValue<const Values extends readonly string[]>(
  input: unknown,
  values: Values,
  label: string
): Values[number] {
  if (typeof input !== "string" || !values.includes(input)) {
    throw new TypeError(
      `${label} must be one of ${values.map((value) => JSON.stringify(value)).join(", ")}`
    );
  }
  return input;
}

export function admitConsensusReviewerProfile(
  input: unknown,
  label = "ConsensusReviewerProfile"
): ConsensusReviewerProfile {
  const value = strictRecord(
    input,
    [
      "kind",
      "profileRef",
      "profileConfigDigest",
      "workerRef",
      "resultSchemaRef"
    ],
    label
  );
  if (value["kind"] !== "consensus_reviewer_profile") {
    throw new TypeError(`${label}.kind must equal consensus_reviewer_profile`);
  }
  return Object.freeze({
    kind: "consensus_reviewer_profile",
    profileRef: nonEmptyString(value["profileRef"], `${label}.profileRef`),
    profileConfigDigest: sha256Digest(
      value["profileConfigDigest"],
      `${label}.profileConfigDigest`
    ),
    workerRef: nonEmptyString(value["workerRef"], `${label}.workerRef`),
    resultSchemaRef: nonEmptyString(
      value["resultSchemaRef"],
      `${label}.resultSchemaRef`
    )
  });
}

export function admitConsensusRequest(
  input: unknown,
  label = "ConsensusRequest"
): ConsensusRequest {
  const value = strictRecord(
    input,
    [
      "kind",
      "requestRef",
      "subjectRef",
      "subject",
      "subjectDigest",
      "submitterRef",
      "submitterWorkerRef",
      "panelRef",
      "policyRef",
      "roundIndex",
      "maxRounds",
      "reviewerProfiles"
    ],
    label
  );
  if (value["kind"] !== "consensus_request") {
    throw new TypeError(`${label}.kind must equal consensus_request`);
  }
  const roundIndex = positiveInteger(value["roundIndex"], `${label}.roundIndex`);
  const maxRounds = positiveInteger(value["maxRounds"], `${label}.maxRounds`);
  if (roundIndex > maxRounds) {
    throw new TypeError(`${label}.roundIndex must not exceed maxRounds`);
  }
  const reviewerProfiles = Object.freeze(
    strictArray(value["reviewerProfiles"], `${label}.reviewerProfiles`).map(
      (profile, index) =>
        admitConsensusReviewerProfile(
          profile,
          `${label}.reviewerProfiles[${String(index)}]`
        )
    )
  );
  if (reviewerProfiles.length < 2) {
    throw new TypeError(`${label}.reviewerProfiles must contain at least two profiles`);
  }
  const profileRefs = reviewerProfiles.map((profile) => profile.profileRef);
  if (new Set(profileRefs).size !== profileRefs.length) {
    throw new TypeError(`${label}.reviewerProfiles must have unique profileRef values`);
  }
  const subject = admitIJsonValue(value["subject"], `${label}.subject`);
  const subjectDigest = sha256Digest(
    value["subjectDigest"],
    `${label}.subjectDigest`
  );
  if (stableSha256Digest(subject) !== subjectDigest) {
    throw new TypeError(`${label}.subjectDigest does not match the admitted subject`);
  }
  const admittedRequest: ConsensusRequest = {
    kind: "consensus_request",
    requestRef: nonEmptyString(value["requestRef"], `${label}.requestRef`),
    subjectRef: nonEmptyString(value["subjectRef"], `${label}.subjectRef`),
    subject,
    subjectDigest,
    submitterRef: nonEmptyString(
      value["submitterRef"],
      `${label}.submitterRef`
    ),
    submitterWorkerRef: nonEmptyString(
      value["submitterWorkerRef"],
      `${label}.submitterWorkerRef`
    ),
    panelRef: nonEmptyString(value["panelRef"], `${label}.panelRef`),
    policyRef: nonEmptyString(value["policyRef"], `${label}.policyRef`),
    roundIndex,
    maxRounds,
    reviewerProfiles,
    [CONSENSUS_REQUEST_ADMITTED]: true
  };
  Object.defineProperty(admittedRequest, CONSENSUS_REQUEST_ADMITTED, {
    enumerable: false
  });
  return Object.freeze(admittedRequest);
}

export function admitConsensusReviewerFinding(
  input: unknown,
  label = "ConsensusReviewerFinding"
): ConsensusReviewerFinding {
  const value = strictRecord(
    input,
    ["kind", "findingRef", "claimRef", "findingKind", "summary", "evidenceRefs"],
    label
  );
  if (value["kind"] !== "consensus_reviewer_finding") {
    throw new TypeError(`${label}.kind must equal consensus_reviewer_finding`);
  }
  return Object.freeze({
    kind: "consensus_reviewer_finding",
    findingRef: nonEmptyString(value["findingRef"], `${label}.findingRef`),
    claimRef: nonEmptyString(value["claimRef"], `${label}.claimRef`),
    findingKind: enumValue(
      value["findingKind"],
      CONSENSUS_FINDING_KIND_VALUES,
      `${label}.findingKind`
    ),
    summary: nonEmptyString(value["summary"], `${label}.summary`),
    evidenceRefs: uniqueStrings(
      value["evidenceRefs"],
      `${label}.evidenceRefs`,
      1
    )
  });
}

export function admitConsensusRulingProposal(
  input: unknown,
  label = "ConsensusRulingProposal"
): ConsensusRulingProposal {
  const value = strictRecord(
    input,
    ["kind", "rulingKind", "summary", "evidenceRefs"],
    label
  );
  if (value["kind"] !== "consensus_ruling_proposal") {
    throw new TypeError(`${label}.kind must equal consensus_ruling_proposal`);
  }
  return Object.freeze({
    kind: "consensus_ruling_proposal",
    rulingKind: enumValue(
      value["rulingKind"],
      REVIEW_RULING_KIND_VALUES,
      `${label}.rulingKind`
    ),
    summary: nonEmptyString(value["summary"], `${label}.summary`),
    evidenceRefs: uniqueStrings(
      value["evidenceRefs"],
      `${label}.evidenceRefs`,
      1
    )
  });
}

function assertDispositionMatchesFindings(input: {
  readonly disposition: ConsensusReviewerDisposition;
  readonly findings: readonly ConsensusReviewerFinding[];
  readonly label: string;
}): void {
  const expectedFindingKind: ConsensusFindingKind =
    input.disposition === "accept"
      ? "support"
      : input.disposition === "revise"
        ? "objection"
        : "unresolved";
  if (input.findings.length === 0 && input.disposition !== "accept") {
    throw new TypeError(
      `${input.label}.disposition ${input.disposition} requires at least one ${expectedFindingKind} finding`
    );
  }
  if (
    input.findings.some(
      (finding) => finding.findingKind !== expectedFindingKind
    )
  ) {
    throw new TypeError(
      `${input.label}.disposition ${input.disposition} admits only ${expectedFindingKind} findings`
    );
  }
}

export function admitConsensusReviewerResponse(
  input: unknown,
  label = "ConsensusReviewerResponse"
): ConsensusReviewerResponse {
  const value = strictRecord(
    input,
    [
      "kind",
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
  if (value["kind"] !== "consensus_reviewer_response") {
    throw new TypeError(`${label}.kind must equal consensus_reviewer_response`);
  }
  const findings = Object.freeze(
    strictArray(value["findings"], `${label}.findings`).map((finding, index) =>
      admitConsensusReviewerFinding(
        finding,
        `${label}.findings[${String(index)}]`
      )
    )
  );
  const findingRefs = findings.map((finding) => finding.findingRef);
  if (new Set(findingRefs).size !== findingRefs.length) {
    throw new TypeError(`${label}.findings must have unique findingRef values`);
  }
  const claimRefs = findings.map((finding) => finding.claimRef);
  if (new Set(claimRefs).size !== claimRefs.length) {
    throw new TypeError(`${label}.findings must have unique claimRef values`);
  }
  const disposition = enumValue(
    value["disposition"],
    CONSENSUS_REVIEWER_DISPOSITION_VALUES,
    `${label}.disposition`
  );
  assertDispositionMatchesFindings({ disposition, findings, label });
  const admitted = {
    kind: "consensus_reviewer_response" as const,
    requestRef: nonEmptyString(value["requestRef"], `${label}.requestRef`),
    subjectRef: nonEmptyString(value["subjectRef"], `${label}.subjectRef`),
    subjectDigest: sha256Digest(
      value["subjectDigest"],
      `${label}.subjectDigest`
    ),
    roundIndex: positiveInteger(value["roundIndex"], `${label}.roundIndex`),
    reviewerProfileRef: nonEmptyString(
      value["reviewerProfileRef"],
      `${label}.reviewerProfileRef`
    ),
    reviewerProfileDigest: sha256Digest(
      value["reviewerProfileDigest"],
      `${label}.reviewerProfileDigest`
    ),
    invocationRef: nonEmptyString(
      value["invocationRef"],
      `${label}.invocationRef`
    ),
    outputDigest: sha256Digest(value["outputDigest"], `${label}.outputDigest`),
    disposition,
    findings,
    ruling: admitConsensusRulingProposal(value["ruling"], `${label}.ruling`),
    evidenceRefs: uniqueStrings(
      value["evidenceRefs"],
      `${label}.evidenceRefs`,
      1
    )
  };
  const admittedResponse: ConsensusReviewerResponse = {
    ...admitted,
    responseRef: `consensus-response:${stableSha256Digest(admitted)}`,
    [CONSENSUS_RESPONSE_ADMITTED]: true
  };
  Object.defineProperty(admittedResponse, CONSENSUS_RESPONSE_ADMITTED, {
    enumerable: false
  });
  return Object.freeze(admittedResponse);
}

export function admitConsensusSubmitterResponse(
  input: unknown,
  label = "ConsensusSubmitterResponse"
): ConsensusSubmitterResponse {
  const value = strictRecord(
    input,
    [
      "kind",
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
  if (value["kind"] !== "consensus_submitter_response") {
    throw new TypeError(`${label}.kind must equal consensus_submitter_response`);
  }
  const admitted = {
    kind: "consensus_submitter_response" as const,
    requestRef: nonEmptyString(value["requestRef"], `${label}.requestRef`),
    subjectRef: nonEmptyString(value["subjectRef"], `${label}.subjectRef`),
    subjectDigest: sha256Digest(
      value["subjectDigest"],
      `${label}.subjectDigest`
    ),
    roundIndex: positiveInteger(value["roundIndex"], `${label}.roundIndex`),
    decisionRef: nonEmptyString(value["decisionRef"], `${label}.decisionRef`),
    submitterRef: nonEmptyString(value["submitterRef"], `${label}.submitterRef`),
    submitterWorkerRef: nonEmptyString(
      value["submitterWorkerRef"],
      `${label}.submitterWorkerRef`
    ),
    invocationRef: nonEmptyString(
      value["invocationRef"],
      `${label}.invocationRef`
    ),
    outputDigest: sha256Digest(value["outputDigest"], `${label}.outputDigest`),
    summary: nonEmptyString(value["summary"], `${label}.summary`),
    addressedFindingRefs: uniqueStrings(
      value["addressedFindingRefs"],
      `${label}.addressedFindingRefs`
    ),
    evidenceRefs: uniqueStrings(
      value["evidenceRefs"],
      `${label}.evidenceRefs`,
      1
    )
  };
  const admittedResponse: ConsensusSubmitterResponse = {
    ...admitted,
    responseRef: `consensus-submitter-response:${stableSha256Digest(admitted)}`,
    [CONSENSUS_SUBMITTER_RESPONSE_ADMITTED]: true
  };
  Object.defineProperty(
    admittedResponse,
    CONSENSUS_SUBMITTER_RESPONSE_ADMITTED,
    { enumerable: false }
  );
  return Object.freeze(admittedResponse);
}

function assertAdmittedRequest(request: ConsensusRequest): void {
  if (request[CONSENSUS_REQUEST_ADMITTED] !== true) {
    throw new TypeError("Consensus reduction requires an admitted request");
  }
}

function assertAdmittedResponse(response: ConsensusReviewerResponse): void {
  if (response[CONSENSUS_RESPONSE_ADMITTED] !== true) {
    throw new TypeError("Consensus reduction requires admitted reviewer responses");
  }
}

function assertAdmittedDecision(decision: ConsensusRoundDecision): void {
  if (decision[CONSENSUS_DECISION_ADMITTED] !== true) {
    throw new TypeError("Consensus submitter binding requires an admitted decision");
  }
}

function assertAdmittedSubmitterResponse(
  response: ConsensusSubmitterResponse
): void {
  if (response[CONSENSUS_SUBMITTER_RESPONSE_ADMITTED] !== true) {
    throw new TypeError(
      "Consensus submitter binding requires an admitted submitter response"
    );
  }
}

function sameStringSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function bindConsensusSubmitterResponse(input: {
  readonly request: ConsensusRequest;
  readonly decision: ConsensusRoundDecision;
  readonly response: ConsensusSubmitterResponse;
}): ConsensusSubmitterResponse {
  assertAdmittedRequest(input.request);
  assertAdmittedDecision(input.decision);
  assertAdmittedSubmitterResponse(input.response);
  if (input.decision.outcome !== "recurse_next_round") {
    throw new TypeError(
      "Consensus submitter response is admitted only for recurse_next_round"
    );
  }
  if (
    input.decision.requestRef !== input.request.requestRef ||
    input.decision.subjectRef !== input.request.subjectRef ||
    input.decision.subjectDigest !== input.request.subjectDigest ||
    input.decision.roundIndex !== input.request.roundIndex
  ) {
    throw new TypeError(
      "Consensus submitter binding decision does not match the admitted request basis"
    );
  }
  if (
    input.response.requestRef !== input.request.requestRef ||
    input.response.subjectRef !== input.request.subjectRef ||
    input.response.subjectDigest !== input.request.subjectDigest ||
    input.response.roundIndex !== input.request.roundIndex ||
    input.response.decisionRef !== input.decision.decisionRef
  ) {
    throw new TypeError(
      "Consensus submitter response does not match the admitted request and decision basis"
    );
  }
  if (
    input.response.submitterRef !== input.request.submitterRef ||
    input.response.submitterWorkerRef !== input.request.submitterWorkerRef
  ) {
    throw new TypeError(
      "Consensus submitter response does not match the declared submitter binding"
    );
  }
  if (
    !sameStringSet(
      input.response.addressedFindingRefs,
      input.decision.dissentFindingRefs
    )
  ) {
    throw new TypeError(
      "Consensus submitter response must exactly address the decision dissentFindingRefs"
    );
  }
  return input.response;
}

function sortedClaimRefs(
  response: ConsensusReviewerResponse
): readonly string[] {
  return Object.freeze(response.findings.map((finding) => finding.claimRef).sort());
}

function exactClaimSets(
  responses: readonly ConsensusReviewerResponse[]
): boolean {
  const first = responses[0];
  if (first === undefined) {
    return false;
  }
  const expected = JSON.stringify(sortedClaimRefs(first));
  return responses.every(
    (response) => JSON.stringify(sortedClaimRefs(response)) === expected
  );
}

function unanimousRulingKind(
  responses: readonly ConsensusReviewerResponse[]
): ReviewRulingKind | null {
  const kinds = new Set(
    responses.map((response) => response.ruling.rulingKind)
  );
  return kinds.size === 1 ? (responses[0]?.ruling.rulingKind ?? null) : null;
}

function isExactConsensus(input: {
  readonly responses: readonly ConsensusReviewerResponse[];
  readonly rulingKind: ReviewRulingKind | null;
}): boolean {
  if (input.rulingKind === null || !exactClaimSets(input.responses)) {
    return false;
  }
  const findings = input.responses.flatMap((response) => response.findings);
  if (findings.length === 0) {
    return input.responses.every(
      (response) => response.disposition === "accept"
    );
  }
  const unanimousSupport =
    input.responses.every((response) => response.disposition === "accept") &&
    findings.every((finding) => finding.findingKind === "support");
  const unanimousObjection =
    input.responses.every((response) => response.disposition === "revise") &&
    findings.every((finding) => finding.findingKind === "objection");
  return unanimousSupport || unanimousObjection;
}

export function reduceConsensusRound(input: {
  readonly request: ConsensusRequest;
  readonly responses: readonly ConsensusReviewerResponse[];
}): ConsensusRoundDecision {
  assertAdmittedRequest(input.request);
  for (const response of input.responses) {
    assertAdmittedResponse(response);
  }
  const profiles = input.request.reviewerProfiles;
  if (input.responses.length !== profiles.length) {
    throw new TypeError(
      "Consensus reduction requires exactly one response for every reviewer profile"
    );
  }
  const responsesByProfile = new Map<string, ConsensusReviewerResponse>();
  const invocationRefs = new Set<string>();
  const findingRefs = new Set<string>();
  for (const response of input.responses) {
    if (responsesByProfile.has(response.reviewerProfileRef)) {
      throw new TypeError(
        `Consensus reduction received duplicate profile response ${response.reviewerProfileRef}`
      );
    }
    if (invocationRefs.has(response.invocationRef)) {
      throw new TypeError(
        `Consensus reduction received duplicate invocationRef ${response.invocationRef}`
      );
    }
    invocationRefs.add(response.invocationRef);
    for (const finding of response.findings) {
      if (findingRefs.has(finding.findingRef)) {
        throw new TypeError(
          `Consensus reduction received duplicate findingRef ${finding.findingRef}`
        );
      }
      findingRefs.add(finding.findingRef);
    }
    responsesByProfile.set(response.reviewerProfileRef, response);
  }
  const orderedResponses = Object.freeze(
    profiles.map((profile) => {
      const response = responsesByProfile.get(profile.profileRef);
      if (response === undefined) {
        throw new TypeError(
          `Consensus reduction is missing response for profile ${profile.profileRef}`
        );
      }
      if (
        response.requestRef !== input.request.requestRef ||
        response.subjectRef !== input.request.subjectRef ||
        response.subjectDigest !== input.request.subjectDigest ||
        response.roundIndex !== input.request.roundIndex
      ) {
        throw new TypeError(
          `Consensus response for ${profile.profileRef} does not match the admitted request basis`
        );
      }
      if (response.reviewerProfileDigest !== profile.profileConfigDigest) {
        throw new TypeError(
          `Consensus response for ${profile.profileRef} does not match its admitted profile digest`
        );
      }
      return response;
    })
  );
  const unknownProfileRefs = [...responsesByProfile.keys()].filter(
    (profileRef) => !profiles.some((profile) => profile.profileRef === profileRef)
  );
  if (unknownProfileRefs.length > 0) {
    throw new TypeError(
      `Consensus reduction received unknown reviewer profiles ${unknownProfileRefs.join(", ")}`
    );
  }
  const proposedRulingKind = unanimousRulingKind(orderedResponses);
  const exactConsensus = isExactConsensus({
    responses: orderedResponses,
    rulingKind: proposedRulingKind
  });
  const outcome: ConsensusRoundOutcome = exactConsensus
    ? "closed_done"
    : input.request.roundIndex < input.request.maxRounds
      ? "recurse_next_round"
      : "escalate_fh";
  if (!CONSENSUS_ROUND_OUTCOME_VALUES.includes(outcome)) {
    throw new TypeError(`Consensus reduction produced unsupported outcome ${outcome}`);
  }
  const allFindings = orderedResponses.flatMap((response) => response.findings);
  const rulingKind = exactConsensus ? proposedRulingKind : null;
  const nextAction: ConsensusNextAction =
    outcome === "closed_done"
      ? "admit_ruling"
      : outcome === "recurse_next_round"
        ? "verify_next_round"
        : "fh_adjudicate";
  const roundDissentFindingRefs = Object.freeze(
    exactConsensus
      ? []
      : allFindings.map((finding) => finding.findingRef).sort()
  );
  const roundDissentResponseRefs = Object.freeze(
    exactConsensus
      ? []
      : orderedResponses.map((response) => response.responseRef)
  );
  const decisionBasis = Object.freeze({
    requestRef: input.request.requestRef,
    subjectRef: input.request.subjectRef,
    subjectDigest: input.request.subjectDigest,
    roundIndex: input.request.roundIndex,
    maxRounds: input.request.maxRounds,
    outcome,
    rulingKind,
    nextAction,
    reviewerProfileRefs: profiles.map((profile) => profile.profileRef),
    reviewerResponseRefs: orderedResponses.map((response) => response.responseRef),
    findingRefs: [...findingRefs].sort(),
    dissentFindingRefs: roundDissentFindingRefs,
    dissentResponseRefs: roundDissentResponseRefs,
    evidenceRefs: [
      ...new Set([
        ...orderedResponses.flatMap((response) => response.evidenceRefs),
        ...orderedResponses.flatMap(
          (response) => response.ruling.evidenceRefs
        ),
        ...allFindings.flatMap((finding) => finding.evidenceRefs)
      ])
    ].sort()
  });
  const decision: ConsensusRoundDecision = {
    kind: "consensus_round_decision",
    decisionRef: `consensus-decision:${stableSha256Digest(decisionBasis)}`,
    ...decisionBasis,
    [CONSENSUS_DECISION_ADMITTED]: true
  };
  Object.defineProperty(decision, CONSENSUS_DECISION_ADMITTED, {
    enumerable: false
  });
  return Object.freeze(decision);
}
