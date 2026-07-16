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
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

function source<
  const Slot extends "request" | "result" | "refusal" | "nonterminal",
  const S extends v.GenericSchema
>(slot: Slot, schema: S) {
  const suffix = `result.assess.assess.${slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "app.m04",
        family: "result_assessment"
      },
      subject: {
        operationId: "abg.operation.result.assess",
        variant: "assess",
        slot
      },
      carrierRevision: "5.0.0",
      lawBasis: {
        ref: "design://abg/m04/public-operation-definition-family",
        digest: DESIGN_DIGEST
      }
    },
    identity: {
      contractId: `abg.contract.operation.${suffix}`,
      contractVersion: "5.0.0",
      schemaId: `abg.schema.operation.${suffix}`,
      schemaVersion: "5.0.0"
    },
    sourceLocator: {
      kind: "private_source_module",
      sourceRoot: "semantic_build",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      memberPath: ["result_assess", "assess", slot, "schema"]
    },
    schema
  });
}

const request = source("request", v.strictObject({
  runtimeResultRef: refSchema,
  runtimeResultDigest: sha256DigestSchema,
  assessmentContractRef: refSchema,
  assessmentContractDigest: sha256DigestSchema,
  assessment: canonicalIJsonSchema,
  evidenceRefs: refListSchema
}));

const result = source("result", v.strictObject({
  assessmentRef: refSchema,
  admittedDisposition: v.literal("assessed"),
  residualRefs: refListSchema,
  evidenceRefs: refListSchema
}));

const refusal = source("refusal", v.strictObject({
  code: v.picklist([
    "result_missing",
    "assessment_contract_mismatch",
    "assessment_invalid",
    "basis_mismatch"
  ]),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
}));

const nonterminal = source("nonterminal", v.strictObject({
  disposition: v.picklist(["retry", "blocked"]),
  residualRefs: refListSchema,
  evidenceRefs: refListSchema
}));

export const RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  result_assess: {
    assess: { request, result, refusal, nonterminal }
  }
});
