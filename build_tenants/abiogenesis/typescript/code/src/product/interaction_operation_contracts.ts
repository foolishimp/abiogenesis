import * as v from "valibot";

import { capabilityRefsForDefinition } from "../shared/capability_contracts.js";

import type { ResultAssessmentResidual } from "./result_assessment_operation.js";

import {
  type ExactOwnerOperationPort,
  nonblankSchema,
  nonemptyRefDigestSetSchema,
  nonemptyTypedResidualSetSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refusalSchema,
  typedResidualSchema,
  typedResidualSetSchema,
} from "../shared/public_function_contracts.js";

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
/** @internal Compile-time agreement check. */
export type _TypedResidualSchemaIsNative = Assert<
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
  }),
);

export const RESULT_OPERATION_CONTRACTS = Object.freeze({ assess });

export interface ResultAssessmentPort {
  readonly assess: ExactOwnerOperationPort<typeof assess>;
}
