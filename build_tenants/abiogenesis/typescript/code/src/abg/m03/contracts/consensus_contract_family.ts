// Implements: REQ-P-CONSENSUS-004..008A, REQ-P-CONSENSUS-012.
// Prime realization: T-277 PC-001 and PC-003.

import * as v from "valibot";

export const REVIEW_RULING_KIND_VALUES = Object.freeze([
  "decision_row",
  "draft_ticket",
  "split_ticket",
  "deferment",
  "rejected_finding"
] as const);

export const CONSENSUS_ROUND_OUTCOME_VALUES = Object.freeze([
  "closed_done",
  "recurse_next_round",
  "escalate_fh"
] as const);

export const CONSENSUS_CLASSIFICATION_VALUES = Object.freeze([
  "unanimous_agreement",
  "partial_agreement_with_dissent",
  "unresolved_disagreement",
  "contract_failure"
] as const);

const nonEmptyTextSchema = v.pipe(
  v.string(),
  v.minLength(1, "expected a non-empty string")
);
const consensusDigestSchema = v.pipe(
  v.string(),
  v.regex(/^sha256:[0-9a-f]{64}$/u, "expected a lowercase sha256 digest"),
  v.brand("ConsensusDigest")
);
const positiveIntegerSchema = v.pipe(
  v.number(),
  v.integer("expected an integer"),
  v.minValue(1, "expected a positive integer")
);
const uniqueTextArraySchema = v.pipe(
  v.array(nonEmptyTextSchema),
  v.check(
    (values) => new Set(values).size === values.length,
    "duplicate values are forbidden"
  ),
  v.readonly()
);
const nonEmptyUniqueTextArraySchema = v.pipe(
  v.array(nonEmptyTextSchema),
  v.minLength(1, "expected a non-empty array"),
  v.check(
    (values) => new Set(values).size === values.length,
    "duplicate values are forbidden"
  ),
  v.readonly()
);
const reviewRulingKindSchema = v.picklist(REVIEW_RULING_KIND_VALUES);
const roundOutcomeValueSchema = v.picklist(CONSENSUS_ROUND_OUTCOME_VALUES);
const classificationSchema = v.picklist(CONSENSUS_CLASSIFICATION_VALUES);

function exactObject<const Entries extends v.ObjectEntries>(entries: Entries) {
  return v.strictObject(entries, "expected exact keys");
}

const consensusReviewerProfileSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_reviewer_profile"),
    profileRef: nonEmptyTextSchema,
    roleContractRef: nonEmptyTextSchema,
    configurationDigest: consensusDigestSchema,
    instructionContractRef: nonEmptyTextSchema,
    resultContractRef: nonEmptyTextSchema,
    capabilityRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const consensusPanelSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_panel"),
    panelRef: nonEmptyTextSchema,
    panelDigest: consensusDigestSchema,
    profiles: v.pipe(
      v.array(consensusReviewerProfileSchema),
      v.minLength(1, "expected a non-empty array"),
      v.check(
        (profiles) =>
          new Set(profiles.map((profile) => profile.profileRef)).size ===
          profiles.length,
        "duplicate profile identity"
      ),
      v.readonly()
    )
  }),
  v.readonly()
);

const consensusRoundPolicySchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_round_policy"),
    policyRef: nonEmptyTextSchema,
    policyDigest: consensusDigestSchema,
    roundBudget: positiveIntegerSchema,
    convergenceRuleRef: nonEmptyTextSchema,
    disagreementRuleRef: nonEmptyTextSchema,
    escalationRuleRef: nonEmptyTextSchema,
    foldbackContractRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const consensusSubjectSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_subject"),
    subjectContractRef: nonEmptyTextSchema,
    subjectRef: nonEmptyTextSchema,
    subjectDigest: consensusDigestSchema,
    submittingActorRef: nonEmptyTextSchema,
    panelRef: nonEmptyTextSchema,
    roundPolicyRef: nonEmptyTextSchema,
    workspaceRef: nonEmptyTextSchema,
    ticketRef: v.nullable(nonEmptyTextSchema),
    ticketDigest: v.nullable(consensusDigestSchema)
  }),
  v.check(
    (subject) => (subject.ticketRef === null) === (subject.ticketDigest === null),
    "ticketRef and ticketDigest must be jointly present or absent"
  ),
  v.readonly()
);

const reviewFindingSchema = v.pipe(
  exactObject({
    findingRef: nonEmptyTextSchema,
    findingContractRef: nonEmptyTextSchema,
    findingPayloadRef: nonEmptyTextSchema,
    evidenceRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const reviewResidualSchema = v.pipe(
  exactObject({
    residualRef: nonEmptyTextSchema,
    residualContractRef: nonEmptyTextSchema,
    residualPayloadRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const reviewRefusalSchema = v.pipe(
  exactObject({
    refusalRef: nonEmptyTextSchema,
    refusalContractRef: nonEmptyTextSchema,
    reasonRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const reviewFindingsSchema = v.pipe(
  exactObject({
    kind: v.literal("review_findings"),
    profileRef: nonEmptyTextSchema,
    configurationDigest: consensusDigestSchema,
    invocationRef: nonEmptyTextSchema,
    outputDigest: consensusDigestSchema,
    evidenceRefs: uniqueTextArraySchema,
    findings: v.pipe(v.array(reviewFindingSchema), v.readonly()),
    residuals: v.pipe(v.array(reviewResidualSchema), v.readonly()),
    refusal: v.nullable(reviewRefusalSchema)
  }),
  v.check(
    (findings) =>
      findings.findings.length > 0 ||
      findings.residuals.length > 0 ||
      findings.refusal !== null,
    "findings, residuals, or refusal is required"
  ),
  v.readonly()
);

const reviewRulingSchema = v.pipe(
  exactObject({
    rulingRef: nonEmptyTextSchema,
    rulingKind: reviewRulingKindSchema,
    findingRefs: uniqueTextArraySchema,
    rationaleRef: nonEmptyTextSchema,
    payloadRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const reviewRulingsSchema = v.pipe(
  exactObject({
    kind: v.literal("review_rulings"),
    roundRef: nonEmptyTextSchema,
    rows: v.pipe(v.array(reviewRulingSchema), v.readonly())
  }),
  v.readonly()
);

const consensusRoundOutcomeSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_round_outcome"),
    roundRef: nonEmptyTextSchema,
    outcome: roundOutcomeValueSchema,
    findingSetRefs: uniqueTextArraySchema,
    rulingRefs: uniqueTextArraySchema,
    evidenceRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const consensusResultSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_result"),
    subjectRef: nonEmptyTextSchema,
    subjectDigest: consensusDigestSchema,
    panelRef: nonEmptyTextSchema,
    policyRef: nonEmptyTextSchema,
    roundRefs: nonEmptyUniqueTextArraySchema,
    findingSetRefs: uniqueTextArraySchema,
    rulings: reviewRulingsSchema,
    classification: classificationSchema,
    dissentProfileRefs: uniqueTextArraySchema,
    terminalOutcome: consensusRoundOutcomeSchema,
    evidenceRefs: uniqueTextArraySchema,
    lineageRefs: nonEmptyUniqueTextArraySchema,
    resultRef: nonEmptyTextSchema,
    replayRef: nonEmptyTextSchema,
    contractFailureRef: v.nullable(nonEmptyTextSchema)
  }),
  v.check(
    (result) =>
      (result.classification === "contract_failure") ===
      (result.contractFailureRef !== null),
    "contractFailureRef must match contract_failure classification"
  ),
  v.readonly()
);

const ticketConsensusProjectionSchema = v.pipe(
  exactObject({
    kind: v.literal("ticket_consensus_projection"),
    projectionRef: nonEmptyTextSchema,
    projectionDigest: consensusDigestSchema,
    ticketRef: nonEmptyTextSchema,
    ticketDigest: consensusDigestSchema,
    result: consensusResultSchema
  }),
  v.check(
    (projection) =>
      projection.result.subjectRef === projection.ticketRef &&
      projection.result.subjectDigest === projection.ticketDigest,
    "ticket identity does not match Consensus result subject"
  ),
  v.readonly()
);

const consensusRoundExecutionSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_round_execution"),
    roundRef: nonEmptyTextSchema,
    subjectRef: nonEmptyTextSchema,
    panelRef: nonEmptyTextSchema,
    policyRef: nonEmptyTextSchema,
    roundOrdinal: positiveIntegerSchema,
    priorRoundRef: v.nullable(nonEmptyTextSchema)
  }),
  v.readonly()
);

const consensusRoundDispositionSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_round_disposition"),
    roundRef: nonEmptyTextSchema,
    outcome: roundOutcomeValueSchema,
    findingSetRefs: uniqueTextArraySchema,
    rulingRefs: uniqueTextArraySchema,
    evidenceRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const reviewerAssignmentSchema = v.pipe(
  exactObject({
    kind: v.literal("reviewer_assignment"),
    roundRef: nonEmptyTextSchema,
    panelRef: nonEmptyTextSchema,
    profileRef: nonEmptyTextSchema,
    panelOrdinal: positiveIntegerSchema,
    instructionContractRef: nonEmptyTextSchema,
    resultContractRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const roundExactProjectionSchema = v.pipe(
  exactObject({
    kind: v.literal("round_exact_projection"),
    roundRef: nonEmptyTextSchema,
    panelProfileRefs: nonEmptyUniqueTextArraySchema,
    completedProfileRefs: uniqueTextArraySchema,
    missingProfileRefs: uniqueTextArraySchema,
    agreementDigest: consensusDigestSchema
  }),
  v.readonly()
);

const semanticReducerBindingSchema = v.pipe(
  exactObject({
    kind: v.literal("semantic_reducer_binding"),
    reducerRef: nonEmptyTextSchema,
    instructionContractRef: nonEmptyTextSchema,
    resultContractRef: nonEmptyTextSchema,
    policyRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const initialSemanticAssessmentSchema = v.pipe(
  exactObject({
    kind: v.literal("initial_semantic_assessment"),
    roundRef: nonEmptyTextSchema,
    classification: classificationSchema,
    rulingRefs: uniqueTextArraySchema,
    residualRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const submitterTurnBindingSchema = v.pipe(
  exactObject({
    kind: v.literal("submitter_turn_binding"),
    roundRef: nonEmptyTextSchema,
    submitterRef: nonEmptyTextSchema,
    instructionContractRef: nonEmptyTextSchema,
    resultContractRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const submitterResponseSchema = v.pipe(
  exactObject({
    kind: v.literal("submitter_response"),
    roundRef: nonEmptyTextSchema,
    submitterRef: nonEmptyTextSchema,
    responseRef: nonEmptyTextSchema,
    outputDigest: consensusDigestSchema,
    evidenceRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

const postSubmitterSemanticAssessmentSchema = v.pipe(
  exactObject({
    kind: v.literal("post_submitter_semantic_assessment"),
    roundRef: nonEmptyTextSchema,
    classification: classificationSchema,
    rulingRefs: uniqueTextArraySchema,
    residualRefs: uniqueTextArraySchema,
    submitterResponseRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const fhInteractionBindingSchema = v.pipe(
  exactObject({
    kind: v.literal("fh_interaction_binding"),
    roundRef: nonEmptyTextSchema,
    interactionRef: nonEmptyTextSchema,
    expectedActorRef: nonEmptyTextSchema,
    requestContractRef: nonEmptyTextSchema,
    resultContractRef: nonEmptyTextSchema
  }),
  v.readonly()
);

const fhPendingInteractionSchema = v.pipe(
  exactObject({
    kind: v.literal("fh_pending_interaction"),
    roundRef: nonEmptyTextSchema,
    interactionRef: nonEmptyTextSchema,
    requestRef: nonEmptyTextSchema,
    evidenceRefs: uniqueTextArraySchema
  }),
  v.readonly()
);

export const CONSENSUS_PUBLIC_CONTRACT_FAMILY = Object.freeze({
  consensus_subject: Object.freeze({
    contractId: "abg.schema.consensus-subject",
    nativeType: "ConsensusSubject",
    schema: consensusSubjectSchema
  }),
  consensus_panel: Object.freeze({
    contractId: "abg.schema.consensus-panel",
    nativeType: "ConsensusPanel",
    schema: consensusPanelSchema
  }),
  consensus_reviewer_profile: Object.freeze({
    contractId: "abg.schema.consensus-reviewer-profile",
    nativeType: "ConsensusReviewerProfile",
    schema: consensusReviewerProfileSchema
  }),
  review_findings: Object.freeze({
    contractId: "abg.schema.review-findings",
    nativeType: "ReviewFindings",
    schema: reviewFindingsSchema
  }),
  review_rulings: Object.freeze({
    contractId: "abg.schema.review-rulings",
    nativeType: "ReviewRulings",
    schema: reviewRulingsSchema
  }),
  consensus_round_policy: Object.freeze({
    contractId: "abg.schema.consensus-round-policy",
    nativeType: "ConsensusRoundPolicy",
    schema: consensusRoundPolicySchema
  }),
  consensus_round_outcome: Object.freeze({
    contractId: "abg.schema.consensus-round-outcome",
    nativeType: "ConsensusRoundOutcome",
    schema: consensusRoundOutcomeSchema
  }),
  consensus_result: Object.freeze({
    contractId: "abg.schema.consensus-result",
    nativeType: "ConsensusResult",
    schema: consensusResultSchema
  }),
  ticket_consensus_projection: Object.freeze({
    contractId: "abg.schema.ticket-consensus-projection",
    nativeType: "TicketConsensusProjection",
    schema: ticketConsensusProjectionSchema
  })
} as const);

export const CONSENSUS_PUBLIC_CONTRACT_DEFINITIONS = Object.freeze(
  Object.entries(CONSENSUS_PUBLIC_CONTRACT_FAMILY).map(([kind, definition]) =>
    Object.freeze({
      kind,
      contractId: definition.contractId,
      nativeType: definition.nativeType
    })
  )
);

export const CONSENSUS_DOMAIN_SCHEMAS = Object.freeze({
  consensus_subject: CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_subject.schema,
  consensus_panel: CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_panel.schema,
  consensus_reviewer_profile:
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_reviewer_profile.schema,
  review_findings: CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_findings.schema,
  review_rulings: CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_rulings.schema,
  consensus_round_policy:
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_policy.schema,
  consensus_round_outcome:
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_outcome.schema,
  consensus_result: CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_result.schema,
  ticket_consensus_projection:
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.ticket_consensus_projection.schema,
  consensus_round_execution: consensusRoundExecutionSchema,
  consensus_round_disposition: consensusRoundDispositionSchema,
  reviewer_assignment: reviewerAssignmentSchema,
  round_exact_projection: roundExactProjectionSchema,
  semantic_reducer_binding: semanticReducerBindingSchema,
  initial_semantic_assessment: initialSemanticAssessmentSchema,
  submitter_turn_binding: submitterTurnBindingSchema,
  submitter_response: submitterResponseSchema,
  post_submitter_semantic_assessment: postSubmitterSemanticAssessmentSchema,
  fh_interaction_binding: fhInteractionBindingSchema,
  fh_pending_interaction: fhPendingInteractionSchema
} as const);

export type ReviewRulingKind = v.InferOutput<typeof reviewRulingKindSchema>;
export type ConsensusRoundOutcomeValue =
  v.InferOutput<typeof roundOutcomeValueSchema>;
export type ConsensusClassification = v.InferOutput<typeof classificationSchema>;
export type ConsensusDigest = v.InferOutput<typeof consensusDigestSchema>;
export type ConsensusReviewerProfile =
  v.InferOutput<typeof consensusReviewerProfileSchema>;
export type ConsensusPanel = v.InferOutput<typeof consensusPanelSchema>;
export type ConsensusRoundPolicy =
  v.InferOutput<typeof consensusRoundPolicySchema>;
export type ConsensusSubject = v.InferOutput<typeof consensusSubjectSchema>;
export type ReviewFinding = v.InferOutput<typeof reviewFindingSchema>;
export type ReviewResidual = v.InferOutput<typeof reviewResidualSchema>;
export type ReviewRefusal = v.InferOutput<typeof reviewRefusalSchema>;
export type ReviewFindings = v.InferOutput<typeof reviewFindingsSchema>;
export type ReviewRuling = v.InferOutput<typeof reviewRulingSchema>;
export type ReviewRulings = v.InferOutput<typeof reviewRulingsSchema>;
export type ConsensusRoundOutcome =
  v.InferOutput<typeof consensusRoundOutcomeSchema>;
export type ConsensusResult = v.InferOutput<typeof consensusResultSchema>;
export type TicketConsensusProjection =
  v.InferOutput<typeof ticketConsensusProjectionSchema>;

export type ConsensusDomainKind = keyof typeof CONSENSUS_DOMAIN_SCHEMAS;
export type ConsensusDomainValueByKind = {
  readonly [Kind in ConsensusDomainKind]: v.InferOutput<
    (typeof CONSENSUS_DOMAIN_SCHEMAS)[Kind]
  >;
};
export type ConsensusDomainValue =
  ConsensusDomainValueByKind[ConsensusDomainKind];

function freezeRecursively(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return;
  }
  for (const child of Object.values(value)) {
    freezeRecursively(child);
  }
  Object.freeze(value);
}

function describeValidationError(error: unknown): string {
  return error instanceof Error ? error.message : "validation failed";
}

function parseConsensusSchema<
  const Schema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(
  schema: Schema,
  value: unknown,
  label: string
): v.InferOutput<Schema> {
  try {
    const admitted = v.parse(schema, value);
    freezeRecursively(admitted);
    return admitted;
  } catch (error: unknown) {
    throw new TypeError(`${label}: ${describeValidationError(error)}`, {
      cause: error
    });
  }
}

export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_subject", label?: string): ConsensusDomainValueByKind["consensus_subject"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_panel", label?: string): ConsensusDomainValueByKind["consensus_panel"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_reviewer_profile", label?: string): ConsensusDomainValueByKind["consensus_reviewer_profile"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "review_findings", label?: string): ConsensusDomainValueByKind["review_findings"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "review_rulings", label?: string): ConsensusDomainValueByKind["review_rulings"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_round_policy", label?: string): ConsensusDomainValueByKind["consensus_round_policy"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_round_outcome", label?: string): ConsensusDomainValueByKind["consensus_round_outcome"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_result", label?: string): ConsensusDomainValueByKind["consensus_result"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "ticket_consensus_projection", label?: string): ConsensusDomainValueByKind["ticket_consensus_projection"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_round_execution", label?: string): ConsensusDomainValueByKind["consensus_round_execution"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "consensus_round_disposition", label?: string): ConsensusDomainValueByKind["consensus_round_disposition"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "reviewer_assignment", label?: string): ConsensusDomainValueByKind["reviewer_assignment"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "round_exact_projection", label?: string): ConsensusDomainValueByKind["round_exact_projection"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "semantic_reducer_binding", label?: string): ConsensusDomainValueByKind["semantic_reducer_binding"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "initial_semantic_assessment", label?: string): ConsensusDomainValueByKind["initial_semantic_assessment"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "submitter_turn_binding", label?: string): ConsensusDomainValueByKind["submitter_turn_binding"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "submitter_response", label?: string): ConsensusDomainValueByKind["submitter_response"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "post_submitter_semantic_assessment", label?: string): ConsensusDomainValueByKind["post_submitter_semantic_assessment"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "fh_interaction_binding", label?: string): ConsensusDomainValueByKind["fh_interaction_binding"];
export function admitConsensusDomainValue(value: unknown, expectedKind: "fh_pending_interaction", label?: string): ConsensusDomainValueByKind["fh_pending_interaction"];
export function admitConsensusDomainValue(
  value: unknown,
  expectedKind: ConsensusDomainKind,
  label = `ConsensusDomainValue.${expectedKind}`
): ConsensusDomainValue {
  switch (expectedKind) {
    case "consensus_subject": return parseConsensusSchema(consensusSubjectSchema, value, label);
    case "consensus_panel": return parseConsensusSchema(consensusPanelSchema, value, label);
    case "consensus_reviewer_profile": return parseConsensusSchema(consensusReviewerProfileSchema, value, label);
    case "review_findings": return parseConsensusSchema(reviewFindingsSchema, value, label);
    case "review_rulings": return parseConsensusSchema(reviewRulingsSchema, value, label);
    case "consensus_round_policy": return parseConsensusSchema(consensusRoundPolicySchema, value, label);
    case "consensus_round_outcome": return parseConsensusSchema(consensusRoundOutcomeSchema, value, label);
    case "consensus_result": return parseConsensusSchema(consensusResultSchema, value, label);
    case "ticket_consensus_projection": return parseConsensusSchema(ticketConsensusProjectionSchema, value, label);
    case "consensus_round_execution": return parseConsensusSchema(consensusRoundExecutionSchema, value, label);
    case "consensus_round_disposition": return parseConsensusSchema(consensusRoundDispositionSchema, value, label);
    case "reviewer_assignment": return parseConsensusSchema(reviewerAssignmentSchema, value, label);
    case "round_exact_projection": return parseConsensusSchema(roundExactProjectionSchema, value, label);
    case "semantic_reducer_binding": return parseConsensusSchema(semanticReducerBindingSchema, value, label);
    case "initial_semantic_assessment": return parseConsensusSchema(initialSemanticAssessmentSchema, value, label);
    case "submitter_turn_binding": return parseConsensusSchema(submitterTurnBindingSchema, value, label);
    case "submitter_response": return parseConsensusSchema(submitterResponseSchema, value, label);
    case "post_submitter_semantic_assessment": return parseConsensusSchema(postSubmitterSemanticAssessmentSchema, value, label);
    case "fh_interaction_binding": return parseConsensusSchema(fhInteractionBindingSchema, value, label);
    case "fh_pending_interaction": return parseConsensusSchema(fhPendingInteractionSchema, value, label);
  }
}

export function admitConsensusReviewerProfile(
  value: unknown,
  label = "ConsensusReviewerProfile"
): ConsensusReviewerProfile {
  return parseConsensusSchema(consensusReviewerProfileSchema, value, label);
}

export function admitConsensusPanel(
  value: unknown,
  label = "ConsensusPanel"
): ConsensusPanel {
  return parseConsensusSchema(consensusPanelSchema, value, label);
}

export function admitConsensusRoundPolicy(
  value: unknown,
  label = "ConsensusRoundPolicy"
): ConsensusRoundPolicy {
  return parseConsensusSchema(consensusRoundPolicySchema, value, label);
}

export function admitConsensusSubject(
  value: unknown,
  label = "ConsensusSubject"
): ConsensusSubject {
  return parseConsensusSchema(consensusSubjectSchema, value, label);
}

export function admitReviewFindings(
  value: unknown,
  label = "ReviewFindings"
): ReviewFindings {
  return parseConsensusSchema(reviewFindingsSchema, value, label);
}

export function admitReviewRulings(
  value: unknown,
  label = "ReviewRulings"
): ReviewRulings {
  return parseConsensusSchema(reviewRulingsSchema, value, label);
}

export function admitConsensusRoundOutcome(
  value: unknown,
  label = "ConsensusRoundOutcome"
): ConsensusRoundOutcome {
  return parseConsensusSchema(consensusRoundOutcomeSchema, value, label);
}

export function admitConsensusResult(
  value: unknown,
  label = "ConsensusResult"
): ConsensusResult {
  return parseConsensusSchema(consensusResultSchema, value, label);
}

export function admitTicketConsensusProjection(
  value: unknown,
  label = "TicketConsensusProjection"
): TicketConsensusProjection {
  return parseConsensusSchema(ticketConsensusProjectionSchema, value, label);
}
