// Owner-native payload contracts for accepted T-281 product-intake definitions.

import { validRange } from "semver";
import * as v from "valibot";

import {
  nonEmptyTextSchema,
  refSchema,
  semanticVersionSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerNativeOperationContractGap,
  ownerNativeOperationContractSource
} from "../../../shared/validation/owner_native_operation_contract_source.js";

const MODULE_PATH =
  "code/src/app/m04/product_intake/operation_contracts.js";
const EXPORT_NAME = "PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES";
const PRODUCT_INTAKE_OWNER = freezeNativeValue({
  product: "abiogenesis",
  module: "app.m04",
  family: "product_intake"
} as const);
const VERIFY_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-INSTALL.md#REQ-P-INSTALL-043..045",
  digest:
    "sha256:72b09080ed9b47643a73e762a8a43622b798f5b0c7d55d31906947432b783e74"
} as const);
const RESOLVE_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-CATALOG.md#REQ-P-CATALOG-010..013",
  digest:
    "sha256:af273d059574c4e8e19a9599005956683372db88ba0d8e57d5c5b14a58ff3c84"
} as const);
const INSTALL_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-057",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const PRODUCT_INTAKE_SOURCE_PRIMITIVES = freezeNativeValue({
  owner: PRODUCT_INTAKE_OWNER,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME
} as const);

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.readonly()
);

const nonEmptyRefListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
  v.minLength(1, "expected at least one reference"),
  v.readonly()
);

const SEMVER_RANGE_ACTION = Object.freeze(v.check(
  (value: string) => validRange(value) !== null,
  "expected a valid semantic-version range"
));

const productRequirementSchema = v.strictObject({
  productId: nonEmptyTextSchema,
  versionConstraint: v.pipe(nonEmptyTextSchema, SEMVER_RANGE_ACTION),
  requiredContractRefs: refListSchema,
  requiredCapabilityRefs: refListSchema
});

const productCoordinateSchema = v.strictObject({
  productId: nonEmptyTextSchema,
  version: semanticVersionSchema,
  contractRefs: refListSchema,
  capabilityRefs: refListSchema
});

const resolvedDependencyEdgeSchema = v.strictObject({
  sourceProductId: nonEmptyTextSchema,
  targetProductId: nonEmptyTextSchema,
  requirement: productRequirementSchema
});

const selectedDependencyGraphSchema = v.pipe(
  v.array(resolvedDependencyEdgeSchema),
  v.readonly()
);

const resolvedProductSelectionBaseSchema = v.strictObject({
  productIdentity: nonEmptyTextSchema,
  selectedCoordinate: productCoordinateSchema,
  satisfiedRequirementRefs: nonEmptyRefListSchema
});

const SELECTION_IDENTITY_MATCH_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof resolvedProductSelectionBaseSchema>) =>
    value.productIdentity === value.selectedCoordinate.productId,
  "selected coordinate must match its product identity"
));

const resolvedProductSelectionSchema = v.pipe(
  resolvedProductSelectionBaseSchema,
  SELECTION_IDENTITY_MATCH_ACTION
);

const UNIQUE_REQUIREMENT_PRODUCT_ACTION = Object.freeze(v.check(
  (values: v.InferOutput<typeof productRequirementSchema>[]) =>
    new Set(values.map((value) => value.productId)).size === values.length,
  "duplicate product requirement"
));

const UNIQUE_CANDIDATE_COORDINATE_ACTION = Object.freeze(v.check(
  (values: v.InferOutput<typeof productCoordinateSchema>[]) => {
    const identities = values.map((value) => JSON.stringify([
      value.productId,
      value.version,
      [...value.contractRefs].sort(),
      [...value.capabilityRefs].sort()
    ]));
    return new Set(identities).size === identities.length;
  },
  "duplicate product coordinate"
));

const UNIQUE_SELECTED_PRODUCT_ACTION = Object.freeze(v.check(
  (values: v.InferOutput<typeof resolvedProductSelectionSchema>[]) =>
    new Set(values.map((value) => value.productIdentity)).size === values.length,
  "duplicate selected product identity"
));

export const PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY = freezeNativeValue({
  familyRef: "contract-family://abg/operation/product-intake@5",
  checks: [
    {
      checkId: "semantic-version-range",
      action: SEMVER_RANGE_ACTION,
      relationRef: "relation://abg/product-intake/semantic-version-range"
    },
    {
      checkId: "unique-requirement-product",
      action: UNIQUE_REQUIREMENT_PRODUCT_ACTION,
      relationRef: "relation://abg/product-intake/unique-requirement-product"
    },
    {
      checkId: "unique-candidate-coordinate",
      action: UNIQUE_CANDIDATE_COORDINATE_ACTION,
      relationRef: "relation://abg/product-intake/unique-candidate-coordinate"
    },
    {
      checkId: "unique-selected-product",
      action: UNIQUE_SELECTED_PRODUCT_ACTION,
      relationRef: "relation://abg/product-intake/unique-selected-product"
    },
    {
      checkId: "selection-identity-match",
      action: SELECTION_IDENTITY_MATCH_ACTION,
      relationRef: "relation://abg/product-intake/selection-identity-match"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const requirementListSchema = v.pipe(
  v.array(productRequirementSchema),
  v.minLength(1, "expected at least one product requirement"),
  UNIQUE_REQUIREMENT_PRODUCT_ACTION,
  v.readonly()
);

const candidateCoordinateListSchema = v.pipe(
  v.array(productCoordinateSchema),
  v.minLength(1, "expected at least one product coordinate"),
  UNIQUE_CANDIDATE_COORDINATE_ACTION,
  v.readonly()
);

const selectedProductListSchema = v.pipe(
  v.array(resolvedProductSelectionSchema),
  v.minLength(1, "expected at least one selected product"),
  UNIQUE_SELECTED_PRODUCT_ACTION,
  v.readonly()
);

const refusal = <const Codes extends readonly [string, ...string[]]>(
  codes: Codes
) => v.strictObject({
  code: v.picklist(codes),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
});

const verifyRequest = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "request",
  semanticOwnerBasis: VERIFY_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_verify", "verify", "request"],
  schema: v.strictObject({
    artifactRef: refSchema,
    artifactDigest: sha256DigestSchema,
    productContentDigest: sha256DigestSchema,
    descriptorRef: refSchema,
    descriptorDigest: sha256DigestSchema,
    contributionManifestRef: refSchema,
    contributionManifestDigest: sha256DigestSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    expectedContractRefs: refListSchema
  })
});

const verifyResult = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "result",
  semanticOwnerBasis: VERIFY_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_verify", "verify", "result"],
  schema: v.strictObject({
    verifiedArtifactRef: refSchema,
    verifiedArtifactDigest: sha256DigestSchema,
    productContentDigest: sha256DigestSchema,
    descriptorRef: refSchema,
    descriptorDigest: sha256DigestSchema,
    contributionManifestRef: refSchema,
    contributionManifestDigest: sha256DigestSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    checkedContractRefs: refListSchema,
    verificationDisposition: v.picklist(["verified", "installed_unbound"]),
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
});

const verifyRefusal = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "refusal",
  semanticOwnerBasis: VERIFY_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_verify", "verify", "refusal"],
  schema: refusal([
    "artifact_invalid",
    "content_mismatch",
    "identity_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "lock_mismatch",
    "unresolved_dependency",
    "incompatible_dependency",
    "unsupported_contract",
    "installed_state_missing",
    "installed_state_stale"
  ])
});

const resolveRequest = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "request",
  semanticOwnerBasis: RESOLVE_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_resolve", "resolve", "request"],
  schema: v.strictObject({
    requirements: requirementListSchema,
    candidates: candidateCoordinateListSchema
  })
});

const resolveResult = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "result",
  semanticOwnerBasis: RESOLVE_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_resolve", "resolve", "result"],
  schema: v.strictObject({
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    selectedProducts: selectedProductListSchema,
    selectedDependencyGraph: selectedDependencyGraphSchema,
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
});

const resolveRefusal = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "refusal",
  semanticOwnerBasis: RESOLVE_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_resolve", "resolve", "refusal"],
  schema: refusal([
    "invalid_requirement",
    "unresolved",
    "incompatible",
    "ambiguous",
    "cyclic"
  ])
});

const installResult = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.install",
  variant: "install",
  slot: "result",
  semanticOwnerBasis: INSTALL_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_install", "install", "result"],
  schema: v.strictObject({
    installedProductRef: refSchema,
    installedProductDigest: sha256DigestSchema,
    installManifestRef: refSchema,
    installManifestDigest: sha256DigestSchema,
    installerManifestRef: refSchema,
    installerManifestDigest: sha256DigestSchema,
    verificationDisposition: v.literal("verified"),
    materializationDisposition: v.picklist(["materialized", "idempotent"]),
    selectedDependencyGraph: selectedDependencyGraphSchema,
    provenanceRefs: refListSchema
  })
});

const installRefusal = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.install",
  variant: "install",
  slot: "refusal",
  semanticOwnerBasis: INSTALL_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_install", "install", "refusal"],
  schema: refusal([
    "verification_failed",
    "invalid_target",
    "identity_conflict",
    "content_conflict",
    "descriptor_conflict",
    "contribution_conflict",
    "lock_conflict",
    "unsupported_contract",
    "filesystem_failure"
  ])
});

export const PRODUCT_INSTALL_REQUEST_GAP = ownerNativeOperationContractGap({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_product_install_policy_not_realized",
  coordinate: {
    definitionKey: {
      operationId: "abg.operation.product.install",
      memberKind: "variant",
      variant: "install"
    },
    slot: "request"
  },
  ownerAuthorityRef: INSTALL_SEMANTIC_OWNER_BASIS.ref,
  ownerAuthorityDigest: INSTALL_SEMANTIC_OWNER_BASIS.digest,
  ownerTicket: null,
  ownerDesignRef:
    "build_tenants/abiogenesis/typescript/design/M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md",
  evidenceRefs: [
    "code/src/app/m04/product_intake/install.ts",
    "specification/requirements/product/REQ-P-INSTALL.md"
  ]
});

export const PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  product_verify: {
    verify: {
      request: verifyRequest,
      result: verifyResult,
      refusal: verifyRefusal
    }
  },
  product_resolve: {
    resolve: {
      request: resolveRequest,
      result: resolveResult,
      refusal: resolveRefusal
    }
  },
  product_install: {
    install: {
      request: PRODUCT_INSTALL_REQUEST_GAP,
      result: installResult,
      refusal: installRefusal
    }
  }
});
