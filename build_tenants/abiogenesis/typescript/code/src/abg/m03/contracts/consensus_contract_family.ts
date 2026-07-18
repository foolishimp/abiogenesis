// Implements: REQ-P-CONSENSUS-004..008A, REQ-P-CONSENSUS-012.
// Prime realization: T-277 PC-001 and PC-003.

import * as v from "valibot";

import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import type { OwnerNativeContractSourceRow } from "../../../shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  ownerProjectionRelationSource,
  type OwnerProjectionRelationAction,
  type OwnerProjectionRelationResult
} from "../../../shared/validation/owner_native_operation_contract_source.js";

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

const CONSENSUS_NATIVE_CHECK_FAMILY_REF =
  "contract-family://abg/consensus@5";
const CONSENSUS_PROJECTION_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-CONSENSUS.md#REQ-P-CONSENSUS-004/-008A/-012",
  digest:
    "sha256:d6e92b75cd52fb9f2063d0a6ff99d36a7617a52c997ff165236cb2571c9fd36d"
} as const);

type ConsensusReadRefDigest = Readonly<{
  ref: string;
  digest: string;
}>;
type TicketConsensusReadRequest = Readonly<{
  kind: "project_read_request";
  caseKey: "ticket_consensus";
  source: Readonly<{
    kind: "ConsensusResult";
    sourceRef: string;
    sourceDigest: string;
  }>;
  projectionBasis: ConsensusReadRefDigest;
  selector: Readonly<{
    ticket: ConsensusReadRefDigest;
    outputAuthority: ConsensusReadRefDigest;
    replayBasis: ConsensusReadRefDigest;
  }>;
}>;
type TicketConsensusReadDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "ticket_consensus";
}>;

function ticketConsensusRelationResult(
  issuePaths: readonly string[]
): OwnerProjectionRelationResult {
  const [first, ...remaining] = issuePaths;
  return first === undefined
    ? { kind: "projection_related" }
    : {
        kind: "projection_relation_mismatch",
        issuePaths: [first, ...remaining]
      };
}

function hasUniqueTextValues(values: string[]): boolean {
  return new Set(values).size === values.length;
}

const UNIQUE_TEXT_VALUES_ACTION = Object.freeze(v.check(
  hasUniqueTextValues,
  "duplicate values are forbidden"
));

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
  UNIQUE_TEXT_VALUES_ACTION,
  v.readonly()
);
const nonEmptyUniqueTextArraySchema = v.pipe(
  v.array(nonEmptyTextSchema),
  v.minLength(1, "expected a non-empty array"),
  UNIQUE_TEXT_VALUES_ACTION,
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

const UNIQUE_PROFILE_IDENTITIES_ACTION = Object.freeze(v.check(
  (profiles: v.InferOutput<typeof consensusReviewerProfileSchema>[]) =>
    new Set(profiles.map((profile) => profile.profileRef)).size ===
    profiles.length,
  "duplicate profile identity"
));

const consensusPanelProfilesSchema = v.pipe(
  v.array(consensusReviewerProfileSchema),
  v.minLength(1, "expected a non-empty array"),
  UNIQUE_PROFILE_IDENTITIES_ACTION,
  v.readonly()
);

const consensusPanelSchema = v.pipe(
  exactObject({
    kind: v.literal("consensus_panel"),
    panelRef: nonEmptyTextSchema,
    panelDigest: consensusDigestSchema,
    profiles: consensusPanelProfilesSchema
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

const consensusSubjectCarrierSchema = exactObject({
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
});

const JOINT_TICKET_IDENTITY_ACTION = Object.freeze(v.check(
  (subject: v.InferOutput<typeof consensusSubjectCarrierSchema>) =>
    (subject.ticketRef === null) === (subject.ticketDigest === null),
  "ticketRef and ticketDigest must be jointly present or absent"
));

const consensusSubjectSchema = v.pipe(
  consensusSubjectCarrierSchema,
  JOINT_TICKET_IDENTITY_ACTION,
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

const reviewFindingsCarrierSchema = exactObject({
  kind: v.literal("review_findings"),
  profileRef: nonEmptyTextSchema,
  configurationDigest: consensusDigestSchema,
  invocationRef: nonEmptyTextSchema,
  outputDigest: consensusDigestSchema,
  evidenceRefs: uniqueTextArraySchema,
  findings: v.pipe(v.array(reviewFindingSchema), v.readonly()),
  residuals: v.pipe(v.array(reviewResidualSchema), v.readonly()),
  refusal: v.nullable(reviewRefusalSchema)
});

const REVIEW_CONTENT_REQUIRED_ACTION = Object.freeze(v.check(
  (findings: v.InferOutput<typeof reviewFindingsCarrierSchema>) =>
    findings.findings.length > 0 ||
    findings.residuals.length > 0 ||
    findings.refusal !== null,
  "findings, residuals, or refusal is required"
));

const reviewFindingsSchema = v.pipe(
  reviewFindingsCarrierSchema,
  REVIEW_CONTENT_REQUIRED_ACTION,
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

const consensusResultCarrierSchema = exactObject({
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
});

const MATCHING_CONTRACT_FAILURE_ACTION = Object.freeze(v.check(
  (result: v.InferOutput<typeof consensusResultCarrierSchema>) =>
    (result.classification === "contract_failure") ===
    (result.contractFailureRef !== null),
  "contractFailureRef must match contract_failure classification"
));

const consensusResultSchema = v.pipe(
  consensusResultCarrierSchema,
  MATCHING_CONTRACT_FAILURE_ACTION,
  v.readonly()
);

const ticketConsensusProjectionCarrierSchema = exactObject({
  kind: v.literal("ticket_consensus_projection"),
  projectionRef: nonEmptyTextSchema,
  projectionDigest: consensusDigestSchema,
  ticketRef: nonEmptyTextSchema,
  ticketDigest: consensusDigestSchema,
  result: consensusResultSchema
});

const MATCHING_TICKET_SUBJECT_ACTION = Object.freeze(v.check(
  (projection: v.InferOutput<typeof ticketConsensusProjectionCarrierSchema>) =>
    projection.result.subjectRef === projection.ticketRef &&
    projection.result.subjectDigest === projection.ticketDigest,
  "ticket identity does not match Consensus result subject"
));

const ticketConsensusProjectionSchema = v.pipe(
  ticketConsensusProjectionCarrierSchema,
  MATCHING_TICKET_SUBJECT_ACTION,
  v.readonly()
);

type TicketConsensusProjectionValue = v.InferOutput<
  typeof ticketConsensusProjectionSchema
>;

const TICKET_CONSENSUS_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  TicketConsensusReadDefinitionKey,
  TicketConsensusReadRequest,
  TicketConsensusProjectionValue
> = ({ admittedRequest, candidateProjection }) => {
  const issuePaths: string[] = [];
  if (
    admittedRequest.source.sourceRef !==
    candidateProjection.result.resultRef
  ) {
    issuePaths.push("candidateProjection.result.resultRef");
  }
  if (
    admittedRequest.source.sourceDigest !==
    stableSha256Digest(candidateProjection.result)
  ) {
    issuePaths.push("candidateProjection.result");
  }
  if (admittedRequest.selector.ticket.ref !== candidateProjection.ticketRef) {
    issuePaths.push("candidateProjection.ticketRef");
  }
  if (
    admittedRequest.selector.ticket.digest !== candidateProjection.ticketDigest
  ) {
    issuePaths.push("candidateProjection.ticketDigest");
  }
  if (
    admittedRequest.selector.ticket.ref !==
    candidateProjection.result.subjectRef
  ) {
    issuePaths.push("candidateProjection.result.subjectRef");
  }
  if (
    admittedRequest.selector.ticket.digest !==
    candidateProjection.result.subjectDigest
  ) {
    issuePaths.push("candidateProjection.result.subjectDigest");
  }
  if (
    admittedRequest.selector.replayBasis.ref !==
    candidateProjection.result.replayRef
  ) {
    issuePaths.push("candidateProjection.result.replayRef");
  }
  // outputAuthority and replayBasis.digest remain in the generic projection
  // basis; TicketConsensusProjection carries no duplicate coordinates.
  return ticketConsensusRelationResult(issuePaths);
};

/** @internal */
export const CONSENSUS_NATIVE_CHECK_REGISTRY = Object.freeze({
  familyRef: CONSENSUS_NATIVE_CHECK_FAMILY_REF,
  checks: Object.freeze([
    Object.freeze({
      checkId: "unique_text_values",
      action: UNIQUE_TEXT_VALUES_ACTION,
      relationRef: null
    }),
    Object.freeze({
      checkId: "unique_profile_identities",
      action: UNIQUE_PROFILE_IDENTITIES_ACTION,
      relationRef: "REQ-P-CONSENSUS-006"
    }),
    Object.freeze({
      checkId: "joint_ticket_identity",
      action: JOINT_TICKET_IDENTITY_ACTION,
      relationRef: "REQ-P-CONSENSUS-005"
    }),
    Object.freeze({
      checkId: "review_content_required",
      action: REVIEW_CONTENT_REQUIRED_ACTION,
      relationRef: "REQ-P-CONSENSUS-006"
    }),
    Object.freeze({
      checkId: "matching_contract_failure",
      action: MATCHING_CONTRACT_FAILURE_ACTION,
      relationRef: "REQ-P-CONSENSUS-008A"
    }),
    Object.freeze({
      checkId: "matching_ticket_subject",
      action: MATCHING_TICKET_SUBJECT_ACTION,
      relationRef: "REQ-P-CONSENSUS-012"
    })
  ])
});

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

export const CONSENSUS_PUBLIC_CONTRACT_FAMILY = freezeNativeValue({
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

function consensusPublicContractSource<
  const Kind extends keyof typeof CONSENSUS_PUBLIC_CONTRACT_FAMILY,
  const S extends v.GenericSchema
>(kind: Kind, definition: {
  readonly contractId: string;
  readonly nativeType: string;
  readonly schema: S;
}) {
  return freezeNativeValue({
    contractKind: kind,
    contractId: definition.contractId,
    nativeType: definition.nativeType,
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath:
        "code/src/abg/m03/contracts/consensus_contract_family.js",
      exportName: "CONSENSUS_PUBLIC_CONTRACT_SOURCES",
      memberPath: [kind, "schema"] as const
    },
    namedChecks: {
      kind: "family_registry" as const,
      exportName: "CONSENSUS_NATIVE_CHECK_REGISTRY",
      memberPath: [] as const
    },
    schema: definition.schema
  });
}

export const CONSENSUS_PUBLIC_CONTRACT_SOURCES = freezeNativeValue({
  consensus_subject: consensusPublicContractSource(
    "consensus_subject",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_subject
  ),
  consensus_panel: consensusPublicContractSource(
    "consensus_panel",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_panel
  ),
  consensus_reviewer_profile: consensusPublicContractSource(
    "consensus_reviewer_profile",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_reviewer_profile
  ),
  review_findings: consensusPublicContractSource(
    "review_findings",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_findings
  ),
  review_rulings: consensusPublicContractSource(
    "review_rulings",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.review_rulings
  ),
  consensus_round_policy: consensusPublicContractSource(
    "consensus_round_policy",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_policy
  ),
  consensus_round_outcome: consensusPublicContractSource(
    "consensus_round_outcome",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_round_outcome
  ),
  consensus_result: consensusPublicContractSource(
    "consensus_result",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.consensus_result
  ),
  ticket_consensus_projection: consensusPublicContractSource(
    "ticket_consensus_projection",
    CONSENSUS_PUBLIC_CONTRACT_FAMILY.ticket_consensus_projection
  )
} as const);

export const CONSENSUS_PROJECT_READ_RELATION_SOURCES = freezeNativeValue({
  ticket_consensus: ownerProjectionRelationSource({
    relationIdentity: "relation://abg/project-read/ticket-consensus@5",
    definitionKey: {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey: "ticket_consensus"
    },
    semanticOwnerBasis: CONSENSUS_PROJECTION_OWNER_BASIS,
    modulePath:
      "code/src/abg/m03/contracts/consensus_contract_family.js",
    exportName: "CONSENSUS_PROJECT_READ_RELATION_SOURCES",
    memberPath: ["ticket_consensus"],
    relation: TICKET_CONSENSUS_PROJECT_READ_RELATION
  })
});

export const CONSENSUS_PUBLIC_CONTRACT_DEFINITIONS = Object.freeze(
  Object.entries(CONSENSUS_PUBLIC_CONTRACT_FAMILY).map(([kind, definition]) =>
    Object.freeze({
      kind,
      contractId: definition.contractId,
      nativeType: definition.nativeType
    })
  )
);

export type ConsensusPublicContractKind =
  keyof typeof CONSENSUS_PUBLIC_CONTRACT_FAMILY;
export type ConsensusPublicContractValueByKind = {
  readonly [Kind in ConsensusPublicContractKind]: v.InferOutput<
    (typeof CONSENSUS_PUBLIC_CONTRACT_FAMILY)[Kind]["schema"]
  >;
};

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

export const CONSENSUS_CONTRACT_VERSION = "5.0.0" as const;

export const CONSENSUS_REVIEWER_ASSIGNMENT_VECTOR_SCHEMA = v.pipe(
  v.array(reviewerAssignmentSchema),
  v.readonly()
);

export const CONSENSUS_REVIEW_FINDINGS_VECTOR_SCHEMA = v.pipe(
  v.array(reviewFindingsSchema),
  v.readonly()
);

export type ConsensusRuntimeSchemaPublication =
  | "existing_public_asset"
  | "engine_private_definition";

export interface ConsensusRuntimeSchemaSource<
  Schema extends v.GenericSchema = v.GenericSchema
> extends OwnerNativeContractSourceRow<Schema> {
  readonly symbolicSchemaRef: string;
  readonly contractId: string;
  readonly contractVersion: typeof CONSENSUS_CONTRACT_VERSION;
  readonly publication: ConsensusRuntimeSchemaPublication;
}

function consensusRuntimeSchemaSource<
  const SourceKey extends string,
  Schema extends v.GenericSchema
>(sourceKey: SourceKey, input: {
  readonly symbolicSchemaRef: string;
  readonly contractId: string;
  readonly publication: ConsensusRuntimeSchemaPublication;
  readonly schema: Schema;
}): ConsensusRuntimeSchemaSource<Schema> {
  return freezeNativeValue({
    ...input,
    contractVersion: CONSENSUS_CONTRACT_VERSION,
    sourceLocator: {
      kind: "private_source_module" as const,
      sourceRoot: "semantic_build" as const,
      modulePath:
        "code/src/abg/m03/contracts/consensus_contract_family.js",
      exportName: "CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY",
      memberPath: [sourceKey, "schema"] as const
    },
    namedChecks: {
      kind: "family_registry" as const,
      exportName: "CONSENSUS_NATIVE_CHECK_REGISTRY",
      memberPath: [] as const
    }
  });
}

/**
 * The one native source/key family for every symbolic schema reachable from
 * the canonical Consensus Module. Public rows reuse standing identities;
 * private rows are engine definitions and never imply catalog publication.
 */
export const CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY = freezeNativeValue({
  consensus_subject: consensusRuntimeSchemaSource("consensus_subject", {
    symbolicSchemaRef: "schema://abg/consensus/subject",
    contractId: "abg.schema.consensus-subject",
    publication: "existing_public_asset",
    schema: CONSENSUS_DOMAIN_SCHEMAS.consensus_subject
  }),
  consensus_result: consensusRuntimeSchemaSource("consensus_result", {
    symbolicSchemaRef: "schema://abg/consensus/result",
    contractId: "abg.schema.consensus-result",
    publication: "existing_public_asset",
    schema: CONSENSUS_DOMAIN_SCHEMAS.consensus_result
  }),
  review_findings: consensusRuntimeSchemaSource("review_findings", {
    symbolicSchemaRef: "schema://abg/consensus/review-findings",
    contractId: "abg.schema.review-findings",
    publication: "existing_public_asset",
    schema: CONSENSUS_DOMAIN_SCHEMAS.review_findings
  }),
  consensus_round_execution: consensusRuntimeSchemaSource(
    "consensus_round_execution",
    {
    symbolicSchemaRef: "schema://abg/consensus/round-execution",
    contractId: "abg.private.schema.consensus-round-execution",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.consensus_round_execution
    }
  ),
  consensus_round_disposition: consensusRuntimeSchemaSource(
    "consensus_round_disposition",
    {
    symbolicSchemaRef: "schema://abg/consensus/round-disposition",
    contractId: "abg.private.schema.consensus-round-disposition",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.consensus_round_disposition
    }
  ),
  reviewer_assignment: consensusRuntimeSchemaSource("reviewer_assignment", {
    symbolicSchemaRef: "schema://abg/consensus/reviewer-assignment",
    contractId: "abg.private.schema.consensus-reviewer-assignment",
    publication: "engine_private_definition",
    schema: CONSENSUS_DOMAIN_SCHEMAS.reviewer_assignment
  }),
  reviewer_assignment_vector: consensusRuntimeSchemaSource(
    "reviewer_assignment_vector",
    {
    symbolicSchemaRef:
      "Vector[schema://abg/consensus/reviewer-assignment]",
    contractId: "abg.private.schema.consensus-reviewer-assignment-vector",
    publication: "engine_private_definition",
      schema: CONSENSUS_REVIEWER_ASSIGNMENT_VECTOR_SCHEMA
    }
  ),
  review_findings_vector: consensusRuntimeSchemaSource(
    "review_findings_vector",
    {
    symbolicSchemaRef: "Vector[schema://abg/consensus/review-findings]",
    contractId: "abg.private.schema.consensus-review-findings-vector",
    publication: "engine_private_definition",
      schema: CONSENSUS_REVIEW_FINDINGS_VECTOR_SCHEMA
    }
  ),
  round_exact_projection: consensusRuntimeSchemaSource(
    "round_exact_projection",
    {
    symbolicSchemaRef: "schema://abg/consensus/round-exact-projection",
    contractId: "abg.private.schema.consensus-round-exact-projection",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.round_exact_projection
    }
  ),
  semantic_reducer_binding: consensusRuntimeSchemaSource(
    "semantic_reducer_binding",
    {
    symbolicSchemaRef: "schema://abg/consensus/semantic-reducer-binding",
    contractId: "abg.private.schema.consensus-semantic-reducer-binding",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.semantic_reducer_binding
    }
  ),
  initial_semantic_assessment: consensusRuntimeSchemaSource(
    "initial_semantic_assessment",
    {
    symbolicSchemaRef: "schema://abg/consensus/initial-semantic-assessment",
    contractId: "abg.private.schema.consensus-initial-semantic-assessment",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.initial_semantic_assessment
    }
  ),
  submitter_turn_binding: consensusRuntimeSchemaSource(
    "submitter_turn_binding",
    {
    symbolicSchemaRef: "schema://abg/consensus/submitter-turn-binding",
    contractId: "abg.private.schema.consensus-submitter-turn-binding",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.submitter_turn_binding
    }
  ),
  submitter_response: consensusRuntimeSchemaSource("submitter_response", {
    symbolicSchemaRef: "schema://abg/consensus/submitter-response",
    contractId: "abg.private.schema.consensus-submitter-response",
    publication: "engine_private_definition",
    schema: CONSENSUS_DOMAIN_SCHEMAS.submitter_response
  }),
  post_submitter_semantic_assessment: consensusRuntimeSchemaSource(
    "post_submitter_semantic_assessment",
    {
    symbolicSchemaRef:
      "schema://abg/consensus/post-submitter-semantic-assessment",
    contractId:
      "abg.private.schema.consensus-post-submitter-semantic-assessment",
    publication: "engine_private_definition",
      schema:
      CONSENSUS_DOMAIN_SCHEMAS.post_submitter_semantic_assessment
    }
  ),
  fh_interaction_binding: consensusRuntimeSchemaSource(
    "fh_interaction_binding",
    {
    symbolicSchemaRef: "schema://abg/consensus/fh-interaction-binding",
    contractId: "abg.private.schema.consensus-fh-interaction-binding",
    publication: "engine_private_definition",
      schema: CONSENSUS_DOMAIN_SCHEMAS.fh_interaction_binding
    }
  )
} as const);

export const CONSENSUS_RUNTIME_SCHEMA_SOURCES: readonly ConsensusRuntimeSchemaSource[] =
  freezeNativeValue(Object.values(CONSENSUS_RUNTIME_SCHEMA_SOURCE_FAMILY));

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
    return freezeNativeValue(admitted);
  } catch (error: unknown) {
    throw new TypeError(`${label}: ${describeValidationError(error)}`, {
      cause: error
    });
  }
}

export function admitConsensusPublicContract<
  const Kind extends ConsensusPublicContractKind
>(
  value: unknown,
  expectedKind: Kind,
  label = `ConsensusPublicContract.${expectedKind}`
): v.InferOutput<
  (typeof CONSENSUS_PUBLIC_CONTRACT_FAMILY)[Kind]["schema"]
> {
  return parseConsensusSchema(
    CONSENSUS_PUBLIC_CONTRACT_FAMILY[expectedKind].schema,
    value,
    label
  );
}

export function admitConsensusDomainValue<const Kind extends ConsensusDomainKind>(
  value: unknown,
  expectedKind: Kind,
  label = `ConsensusDomainValue.${expectedKind}`
): v.InferOutput<(typeof CONSENSUS_DOMAIN_SCHEMAS)[Kind]> {
  return parseConsensusSchema(
    CONSENSUS_DOMAIN_SCHEMAS[expectedKind],
    value,
    label
  );
}
