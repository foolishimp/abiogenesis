// Private P1 owner contracts for AF-08..AF-10. Runtime catalog behavior,
// event admission, and public projection remain in their existing owners.

import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import { PUBLIC_RUNTIME_CATALOG_KIND_VALUES } from "./runtime_catalog.js";
import { m03OwnerContractSet } from "./m03_owner_contract_set.js";

const MODULE_PATH =
  "code/src/abg/m03/contracts/catalog_operation_contracts.js" as const;
const EXPORT_NAME = "CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES";

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);
const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1),
  v.readonly()
);

const catalogAdmitRequestSchema = v.pipe(
  v.strictObject({
    descriptorRefs: nonEmptyRefListSchema,
    contributionManifestRefs: nonEmptyRefListSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema
  }),
  v.readonly()
);

const catalogAdmissionDispositionSchema = v.pipe(
  v.strictObject({
    kind: v.literal("catalog_row_disposition"),
    entryRef: refSchema,
    declarationRef: refSchema,
    entryKind: v.picklist([...PUBLIC_RUNTIME_CATALOG_KIND_VALUES, "unsupported"]),
    disposition: v.picklist([
      "admitted",
      "already_admitted_exact",
      "rejected"
    ]),
    eventRef: v.nullable(refSchema),
    rejectionReason: v.nullable(nonEmptyTextSchema)
  }),
  v.readonly()
);

const catalogAdmitResultSchema = v.pipe(
  v.strictObject({
    catalogRef: refSchema,
    catalogDigest: sha256DigestSchema,
    dispositions: v.pipe(
      v.array(catalogAdmissionDispositionSchema),
      v.minLength(1),
      v.readonly()
    ),
    evidenceRefs: refListSchema
  }),
  v.readonly()
);

const CATALOG_ADMIT_REFUSAL_CODES = Object.freeze([
  "descriptor_invalid",
  "contribution_invalid",
  "conflict",
  "incompatible",
  "unready",
  "unresolved"
] as const);

const catalogAdmitRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(CATALOG_ADMIT_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const catalogViewRequestSchema = v.pipe(
  v.strictObject({
    allowlist: refListSchema
  }),
  v.readonly()
);

const catalogViewResidualSchema = v.pipe(
  v.strictObject({
    handle: refSchema,
    code: v.picklist([
      "unknown",
      "duplicate",
      "ambiguous",
      "unauthorized",
      "inadmissible",
      "not_ready"
    ])
  }),
  v.readonly()
);

const catalogViewResultSchema = v.pipe(
  v.strictObject({
    catalogViewRef: refSchema,
    catalogViewDigest: sha256DigestSchema,
    effectiveHandles: refListSchema,
    residuals: v.pipe(v.array(catalogViewResidualSchema), v.readonly())
  }),
  v.readonly()
);

const catalogViewRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist([
      "unknown",
      "duplicate",
      "ambiguous",
      "unauthorized",
      "inadmissible",
      "not_ready"
    ]),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

const catalogApplyRequestSchema = v.pipe(
  v.strictObject({
    declarationRef: refSchema,
    declarationDigest: sha256DigestSchema,
    targetRef: refSchema,
    applicationBasisRef: refSchema,
    applicationBasisDigest: sha256DigestSchema
  }),
  v.readonly()
);

function catalogApplyResultSchema<const Kind extends "node_type" | "overlay">(
  declarationKind: Kind
) {
  return v.pipe(
    v.strictObject({
      applicationRef: refSchema,
      applicationKind: v.literal(declarationKind),
      declarationRef: refSchema,
      targetRef: refSchema,
      evidenceRefs: refListSchema
    }),
    v.readonly()
  );
}

const CATALOG_APPLY_REFUSAL_CODES = Object.freeze([
  "kind_mismatch",
  "outside_view",
  "not_ready",
  "target_invalid",
  "application_refused",
  "callable_kind_forbidden"
] as const);

const catalogApplyRefusalSchema = v.pipe(
  v.strictObject({
    code: v.picklist(CATALOG_APPLY_REFUSAL_CODES),
    message: nonEmptyTextSchema,
    residualRefs: refListSchema
  }),
  v.readonly()
);

function catalogApplyContractSet<const Kind extends "node_type" | "overlay">(
  declarationKind: Kind
) {
  return m03OwnerContractSet({
    operationId: "abg.operation.catalog.apply",
    variant: declarationKind,
    family: "catalog_application",
    familyKey: "catalog_apply",
    modulePath: MODULE_PATH,
    exportName: EXPORT_NAME,
    request: catalogApplyRequestSchema,
    result: catalogApplyResultSchema(declarationKind),
    refusal: catalogApplyRefusalSchema
  });
}

export const CATALOG_OPERATION_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  catalog_admit: {
    admit: m03OwnerContractSet({
      operationId: "abg.operation.catalog.admit",
      variant: "admit",
      family: "catalog_admission",
      familyKey: "catalog_admit",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      request: catalogAdmitRequestSchema,
      result: catalogAdmitResultSchema,
      refusal: catalogAdmitRefusalSchema
    })
  },
  catalog_view: {
    allowlist: m03OwnerContractSet({
      operationId: "abg.operation.catalog.view",
      variant: "allowlist",
      family: "catalog_view",
      familyKey: "catalog_view",
      modulePath: MODULE_PATH,
      exportName: EXPORT_NAME,
      request: catalogViewRequestSchema,
      result: catalogViewResultSchema,
      refusal: catalogViewRefusalSchema
    })
  },
  catalog_apply: {
    node_type: catalogApplyContractSet("node_type"),
    overlay: catalogApplyContractSet("overlay")
  }
});
