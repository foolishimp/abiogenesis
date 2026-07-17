// Private P1 owner contract for AF-22's public GTL-program evaluation variant.
// The existing conformance implementation remains the semantic evaluator.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import {
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
  GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES
} from "./gtl_program_conformance.js";
import { m03OwnerContractSet } from "./m03_owner_contract_set.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/gtl_conformance_operation_contracts.js" as const;
const EXPORT_NAME = "GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES";
const NO_NAMED_CHECKS = freezeNativeValue({ kind: "none" as const });
const CONFORMANCE_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-038",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const inventoryEntrySchema = v.pipe(
  v.strictObject({ ref: refSchema, digest: sha256DigestSchema }),
  v.readonly()
);

const inventoryBasisSchema = v.union([
  v.pipe(v.strictObject({ kind: v.literal("program_only") }), v.readonly()),
  v.pipe(
    v.strictObject({
      kind: v.literal("declared_inventory"),
      inventory: v.pipe(
        uniqueByNativeIdentityArray(inventoryEntrySchema),
        v.minLength(1),
        v.readonly()
      )
    }),
    v.readonly()
  )
]);

const conformanceRequestSchema = v.pipe(
  v.strictObject({
    programRef: refSchema,
    programDigest: sha256DigestSchema,
    conformanceLawRef: refSchema,
    conformanceLawDigest: sha256DigestSchema,
    inventoryBasis: inventoryBasisSchema
  }),
  v.readonly()
);

const repairAffordanceSchema = v.pipe(
  v.strictObject({
    kind: v.literal("gtl_program_admissible_repair"),
    editClass: v.picklist(GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES),
    repairSurfaceRef: refSchema,
    changeClassRef: v.nullable(refSchema)
  }),
  v.readonly()
);

const diagnosticSchema = v.pipe(
  v.strictObject({
    diagnosticId: v.picklist(GTL_PROGRAM_DIAGNOSTIC_ID_VALUES),
    surfaceRef: refSchema,
    message: nonEmptyTextSchema,
    violatedLawRefs: refListSchema,
    evidenceRefs: refListSchema,
    admissibleRepairs: v.pipe(v.array(repairAffordanceSchema), v.readonly())
  }),
  v.readonly()
);

const conformanceResultSchema = v.pipe(
  v.strictObject({
    assessmentRef: refSchema,
    assessmentDigest: sha256DigestSchema,
    programRef: refSchema,
    inventoryRef: v.nullable(refSchema),
    inventoryDigest: v.nullable(sha256DigestSchema),
    disposition: v.picklist(["passed", "failed"]),
    diagnostics: v.pipe(v.array(diagnosticSchema), v.readonly()),
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

const conformanceRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist([
      "program_invalid",
      "law_basis_mismatch",
      "inventory_mismatch",
      "assessment_blocked"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

export const GTL_CONFORMANCE_OPERATION_NATIVE_CONTRACT_SOURCES =
  freezeNativeValue({
    conformance_evaluate: {
      gtl_program: m03OwnerContractSet({
        operationId: "abg.operation.conformance.evaluate",
        variant: "gtl_program",
        family: "gtl_program_conformance",
        familyKey: "conformance_evaluate",
        modulePath: MODULE_PATH,
        exportName: EXPORT_NAME,
        namedChecks: NO_NAMED_CHECKS,
        semanticOwnerBasis: CONFORMANCE_SEMANTIC_OWNER_BASIS,
        request: conformanceRequestSchema,
        result: conformanceResultSchema,
        refusal: conformanceRefusalSchema
      })
    }
  });
