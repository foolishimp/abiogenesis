// Owner-native payload contracts for the accepted T-281 result assessment.

import * as v from "valibot";

import {
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import { ownerNativeOperationContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/result_assessment/operation_contracts.js";
const EXPORT_NAME = "RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES";
const CONTRACT_SHAPE_BASIS = freezeNativeValue({
  ref: "design://abg/m04/public-operation-definition-family",
  digest:
    "sha256:9ab76163499e0831a3ff87f3dc1b5adba02c19d690b6a953651888f6fe9915b7",
  status: "candidate_integration_pin_pending_final_rebind"
} as const);
const RESULT_ASSESSMENT_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "result_assessment"
} as const);
const SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-034",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);

export const RESULT_ASSESSMENT_SEMANTIC_TRACE = freezeNativeValue({
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  ontologyFunction: {
    ref: "build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md#AF-19",
    digest:
      "sha256:039c19d3b6639ebc0357b40d8f12a6e8340e55ba0f8ef2f41c1e8cab914f53f1"
  },
  realizationDesign: {
    ref: "build_tenants/abiogenesis/typescript/design/M04_RESULT_ASSESSMENT_DERIVATION.md",
    digest:
      "sha256:d43f46c6ae46807fa273c07cfd94dc9c73f4d3913813d45b2a04dd0ae11226d3"
  },
  legacyCarrierEquivalence: "not_claimed"
} as const);
const SOURCE_PRIMITIVES = freezeNativeValue({
  owner: RESULT_ASSESSMENT_OWNER,
  contractShapeBasis: CONTRACT_SHAPE_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const request = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.result.assess",
  variant: "assess",
  slot: "request",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["result_assess", "assess", "request"],
  schema: v.strictObject({
    runtimeResultRef: refSchema,
    runtimeResultDigest: sha256DigestSchema,
    assessmentContractRef: refSchema,
    assessmentContractDigest: sha256DigestSchema,
    assessment: canonicalIJsonSchema,
    evidenceRefs: refListSchema
  })
});

const result = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.result.assess",
  variant: "assess",
  slot: "result",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["result_assess", "assess", "result"],
  schema: v.strictObject({
    assessmentRef: refSchema,
    admittedDisposition: v.literal("assessed"),
    residualRefs: refListSchema,
    evidenceRefs: refListSchema
  })
});

const refusal = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.result.assess",
  variant: "assess",
  slot: "refusal",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["result_assess", "assess", "refusal"],
  schema: v.strictObject({
    code: v.picklist([
      "result_missing",
      "assessment_contract_mismatch",
      "assessment_invalid",
      "basis_mismatch"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  })
});

const nonterminal = ownerNativeOperationContractSource({
  ...SOURCE_PRIMITIVES,
  operationId: "abg.operation.result.assess",
  variant: "assess",
  slot: "nonterminal",
  semanticOwnerBasis: SEMANTIC_OWNER_BASIS,
  memberPath: ["result_assess", "assess", "nonterminal"],
  schema: v.strictObject({
    disposition: v.picklist(["retry", "blocked"]),
    residualRefs: refListSchema,
    evidenceRefs: refListSchema
  })
});

export const RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  result_assess: {
    assess: { request, result, refusal, nonterminal }
  }
});
