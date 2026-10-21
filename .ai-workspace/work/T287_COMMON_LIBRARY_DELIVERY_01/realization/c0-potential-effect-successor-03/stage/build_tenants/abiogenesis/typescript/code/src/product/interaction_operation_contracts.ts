import * as v from "valibot";

import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";

import type { ResultAssessmentResidual } from "./result_assessment_operation.js";

import {
  digestSchema,
  type ExactOwnerOperationPort,
  jsonValueSchema,
  nonblankSchema,
  nonemptyRefDigestSetSchema,
  nonemptyTypedResidualSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refusalSchema,
  RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
  typedResidualSchema,
  typedResidualSetSchema,
} from "../shared/public_function_contracts.js";

export const INTERACTION_RESPONSE_KINDS = Object.freeze([
  "select",
  "approve",
  "reject",
  "assess",
  "answer_escalation",
] as const);

type InteractionResponseKind =
  (typeof INTERACTION_RESPONSE_KINDS)[number];

const INTERACTION_AUTHORITY =
  "authority://abiogenesis/product/interaction-response@5";

const interactionRefusalSchema = refusalSchema([
  "missing_interaction",
  "resolved_interaction",
  "kind_mismatch",
  "contract_mismatch",
  "choice_mismatch",
  "value_mismatch",
  "capability_mismatch",
  "basis_mismatch",
]);

const respondedInteractionProjectionSchema = v.strictObject({
  kind: v.literal("fh_interaction_projection"),
  interactionRef: nonblankSchema,
  interactionBasisDigest: digestSchema,
  status: v.literal("responded"),
  graphCallId: nonblankSchema,
  continuationRef: nonblankSchema,
  responseContractRef: nonblankSchema,
  eligibleOperationIds: v.array(nonblankSchema),
  resumeEligibleOperationIds: v.array(nonblankSchema),
  declaredChoiceRefs: v.array(nonblankSchema),
  requiredCapabilityRefs: v.array(nonblankSchema),
  responseRef: nonblankSchema,
  eventRefs: v.array(nonblankSchema),
  replayRefs: v.array(nonblankSchema),
});

function interactionContract<const TKind extends InteractionResponseKind>(
  responseKind: TKind,
) {
  return ownerContractPacket(
    {
      operationId: "abg.operation.interaction.respond",
      memberKey: responseKind,
    } as const,
    v.strictObject({
      interaction: refDigestSchema,
      responseContract: refDigestSchema,
      responseKind: v.literal(responseKind),
      choice: responseKind === "select" ? refDigestSchema : v.null(),
      value: jsonValueSchema,
      evidence: nonemptyRefDigestSetSchema,
      currentBasis: refDigestSchema,
    }),
    v.never(),
    interactionRefusalSchema,
    v.strictObject({
      disposition: v.literal("responded"),
      responseKind: v.literal(responseKind),
      responseEvent: refDigestSchema,
      interaction: respondedInteractionProjectionSchema,
      run: refDigestSchema,
      continuation: refDigestSchema,
      evidence: nonemptyRefDigestSetSchema,
    }),
    {
      abstractModule: "Product.InteractionResponse",
      exportName: "INTERACTION_OPERATION_CONTRACTS",
      memberPath: ["respond", responseKind],
      authorityRef: INTERACTION_AUTHORITY,
      authorityDigest: ownerAuthorityDigest(INTERACTION_AUTHORITY),
    },
    ownerMetadata({
      authorityClass: "write",
      effectClass: "fh_response_event",
      eventAdmission: "owning_semantic_authority",
      actorRequirement: "required",
      workspaceBindingRequirement: "exactly_one",
      authoritySlotRequirements: [
        "capability_grants",
        "workspace_binding",
        "product_set",
        "dependency_lock",
        "actor",
        "execution_basis",
      ],
      capabilityRefs: capabilityRefsForDefinition({
        operationId: "abg.operation.interaction.respond",
        memberKey: responseKind,
      }),
      defaults: {},
      closedDomains: { responseKind: [responseKind] },
      sdkCoordinate: "sdk.interaction.respond",
      cliCoordinate: `interaction respond ${responseKind}`,
      adapterExitMap: RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
    }),
  );
}

const select = interactionContract("select");
const approve = interactionContract("approve");
const reject = interactionContract("reject");
const responseAssess = interactionContract("assess");
const answerEscalation = interactionContract("answer_escalation");

export const INTERACTION_OPERATION_CONTRACTS = Object.freeze({
  respond: Object.freeze({
    select,
    approve,
    reject,
    assess: responseAssess,
    answer_escalation: answerEscalation,
  }),
});

const resultAssessmentRefusalSchema = refusalSchema([
  "result_mismatch",
  "digest_mismatch",
  "contract_mismatch",
  "value_mismatch",
  "capability_mismatch",
  "evidence_mismatch",
  "basis_mismatch",
]);

type Assert<T extends true> = T;
type SameShape<A, B> = [A] extends [B]
  ? [B] extends [A] ? true : false
  : false;
type _TypedResidualSchemaIsNative = Assert<
  SameShape<
    v.InferOutput<typeof typedResidualSchema>,
    ResultAssessmentResidual
  >
>;

const resultAssessmentValueSchema = v.union([
  v.strictObject({
    kind: v.literal("result_assessment_value"),
    schemaVersion: v.literal("5.0.0"),
    expectedResult: refDigestSchema,
    disposition: v.literal("admitted"),
    closureEligible: v.boolean(),
    residuals: typedResidualSetSchema,
  }),
  v.strictObject({
    kind: v.literal("result_assessment_value"),
    schemaVersion: v.literal("5.0.0"),
    expectedResult: refDigestSchema,
    disposition: v.literal("rejected"),
    closureEligible: v.literal(false),
    residuals: typedResidualSetSchema,
  }),
  v.strictObject({
    kind: v.literal("result_assessment_value"),
    schemaVersion: v.literal("5.0.0"),
    expectedResult: refDigestSchema,
    disposition: v.picklist(["retry", "blocked"]),
    closureEligible: v.literal(false),
    residuals: nonemptyTypedResidualSetSchema,
  }),
]);

const contractAdmittedAssessmentValueSchema = v.strictObject({
  kind: v.literal("contract_admitted_assessment_value"),
  schemaVersion: v.literal("5.0.0"),
  contract: refDigestSchema,
  valueRef: nonblankSchema,
  valueDigest: refDigestSchema.entries.digest,
  value: resultAssessmentValueSchema,
});

const assess = ownerContractPacket(
  { operationId: "abg.operation.result.assess", memberKey: "assess" },
  v.strictObject({
    expectedResult: refDigestSchema,
    assessmentContract: refDigestSchema,
    assessment: contractAdmittedAssessmentValueSchema,
    evidence: nonemptyRefDigestSetSchema,
    currentBasis: refDigestSchema,
  }),
  v.strictObject({
    assessment: refDigestSchema,
    disposition: v.picklist(["admitted", "rejected"]),
    closureEligible: v.boolean(),
    residuals: typedResidualSetSchema,
    evidence: nonemptyRefDigestSetSchema,
  }),
  resultAssessmentRefusalSchema,
  v.strictObject({
    assessment: refDigestSchema,
    disposition: v.picklist(["retry", "blocked"]),
    closureEligible: v.literal(false),
    residuals: nonemptyTypedResidualSetSchema,
    evidence: nonemptyRefDigestSetSchema,
  }),
  {
    abstractModule: "Product.ResultAssessment",
    exportName: "RESULT_OPERATION_CONTRACTS",
    memberPath: ["assess"],
    authorityRef: "authority://abiogenesis/product/result-assessment@5",
    authorityDigest: ownerAuthorityDigest(
      "authority://abiogenesis/product/result-assessment@5",
    ),
  },
  ownerMetadata({
    authorityClass: "write",
    effectClass: "result_assessment_event",
    eventAdmission: "owning_semantic_authority",
    actorRequirement: "required",
    workspaceBindingRequirement: "exactly_one",
    authoritySlotRequirements: [
      "capability_grants",
      "workspace_binding",
      "product_set",
      "dependency_lock",
      "actor",
      "execution_basis",
    ],
    capabilityRefs: capabilityRefsForDefinition({ operationId: "abg.operation.result.assess", memberKey: "assess" }),
    defaults: {},
    closedDomains: {
      terminalDisposition: ["admitted", "rejected"],
      nonTerminalDisposition: ["retry", "blocked"],
    },
    sdkCoordinate: "sdk.result.assess",
    cliCoordinate: "result assess",
    adapterExitMap: RUNTIME_NONTERMINAL_ADAPTER_EXIT_MAP,
  }),
);

export const RESULT_OPERATION_CONTRACTS = Object.freeze({ assess });

export interface InteractionResponsePort {
  readonly respond: ExactOwnerOperationPort<
    typeof select | typeof approve | typeof reject | typeof responseAssess |
      typeof answerEscalation
  >;
}

export interface ResultAssessmentPort {
  readonly assess: ExactOwnerOperationPort<typeof assess>;
}
