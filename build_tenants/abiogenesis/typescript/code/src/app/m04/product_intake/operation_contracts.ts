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
import { ownerNativeOperationContractSource } from "../../../shared/validation/owner_native_operation_contract_source.js";

type ProductIntakeOperationId =
  | "abg.operation.product.verify"
  | "abg.operation.product.resolve"
  | "abg.operation.product.install";
type ProductIntakeVariant = "verify" | "resolve" | "install";
type ProductIntakeSlot = "request" | "result" | "refusal";

export interface ProductInstallRequestContractGap {
  readonly kind: "semantic_not_realized";
  readonly gapCode: "p1_contract_product_install_policy_not_realized";
  readonly definitionKey: {
    readonly operationId: "abg.operation.product.install";
    readonly memberKind: "variant";
    readonly variant: "install";
  };
  readonly slot: "request";
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: `sha256:${string}`;
  readonly ownerDesignRef: string;
  readonly evidenceRefs: readonly [string, ...string[]];
}

const MODULE_PATH =
  "code/src/app/m04/product_intake/operation_contracts.js";
const EXPORT_NAME = "PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES";
const DESIGN_REF =
  "design://abg/m04/public-operation-definition-family";
const DESIGN_DIGEST =
  "sha256:d0525534d9ea5ce274860c793fd27bab48d92635874f28444d07d622c08b8281";

const refListSchema = v.pipe(
  uniqueByNativeIdentityArray(refSchema),
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

const UNIQUE_REQUIREMENT_PRODUCT_ACTION = Object.freeze(v.check(
  (values: v.InferOutput<typeof productRequirementSchema>[]) =>
    new Set(values.map((value) => value.productId)).size === values.length,
  "duplicate product requirement"
));

const UNIQUE_COORDINATE_PRODUCT_ACTION = Object.freeze(v.check(
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
      checkId: "unique-product-coordinate",
      action: UNIQUE_COORDINATE_PRODUCT_ACTION,
      relationRef: "relation://abg/product-intake/unique-product-coordinate"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const requirementListSchema = v.pipe(
  v.array(productRequirementSchema),
  v.minLength(1, "expected at least one product requirement"),
  UNIQUE_REQUIREMENT_PRODUCT_ACTION,
  v.readonly()
);

const coordinateListSchema = v.pipe(
  v.array(productCoordinateSchema),
  v.minLength(1, "expected at least one product coordinate"),
  UNIQUE_COORDINATE_PRODUCT_ACTION,
  v.readonly()
);

function familyKey(operationId: ProductIntakeOperationId):
  | "product_verify"
  | "product_resolve"
  | "product_install" {
  switch (operationId) {
    case "abg.operation.product.verify":
      return "product_verify";
    case "abg.operation.product.resolve":
      return "product_resolve";
    case "abg.operation.product.install":
      return "product_install";
  }
}

function source<
  const OperationId extends ProductIntakeOperationId,
  const Variant extends ProductIntakeVariant,
  const Slot extends ProductIntakeSlot,
  const S extends v.GenericSchema
>(input: {
  readonly operationId: OperationId;
  readonly variant: Variant;
  readonly slot: Slot;
  readonly schema: S;
}) {
  const suffix = `${input.operationId.slice("abg.operation.".length)}.${input.variant}.${input.slot}`;
  return ownerNativeOperationContractSource({
    kind: "owner_native_operation_contract_source",
    authority: {
      kind: "owner_native_operation_contract_authority",
      owner: {
        product: "abiogenesis",
        module: "app.m04",
        family: "product_intake"
      },
      subject: {
        operationId: input.operationId,
        variant: input.variant,
        slot: input.slot
      },
      carrierRevision: "5.0.0",
      lawBasis: { ref: DESIGN_REF, digest: DESIGN_DIGEST }
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
      memberPath: [
        familyKey(input.operationId),
        input.variant,
        input.slot,
        "schema"
      ]
    },
    schema: input.schema
  });
}

const refusal = <const Codes extends readonly [string, ...string[]]>(
  codes: Codes
) => v.strictObject({
  code: v.picklist(codes),
  message: nonEmptyTextSchema,
  residualRefs: refListSchema
});

const verifyRequest = source({
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "request",
  schema: v.strictObject({
    artifactRef: refSchema,
    artifactDigest: sha256DigestSchema,
    descriptorRef: refSchema,
    descriptorDigest: sha256DigestSchema,
    contributionManifestRef: refSchema,
    contributionManifestDigest: sha256DigestSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    expectedContractRefs: refListSchema
  })
});

const verifyResult = source({
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "result",
  schema: v.strictObject({
    verifiedArtifactRef: refSchema,
    verifiedArtifactDigest: sha256DigestSchema,
    descriptorRef: refSchema,
    descriptorDigest: sha256DigestSchema,
    contributionManifestRef: refSchema,
    contributionManifestDigest: sha256DigestSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    checkedContractRefs: refListSchema,
    verificationDisposition: v.literal("verified"),
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
});

const verifyRefusal = source({
  operationId: "abg.operation.product.verify",
  variant: "verify",
  slot: "refusal",
  schema: refusal([
    "invalid_artifact",
    "digest_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "lock_mismatch",
    "incompatible"
  ])
});

const resolveRequest = source({
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "request",
  schema: v.strictObject({
    requirements: requirementListSchema,
    candidates: coordinateListSchema
  })
});

const resolveResult = source({
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "result",
  schema: v.strictObject({
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    selectedProducts: coordinateListSchema,
    residualRefs: refListSchema,
    provenanceRefs: refListSchema
  })
});

const resolveRefusal = source({
  operationId: "abg.operation.product.resolve",
  variant: "resolve",
  slot: "refusal",
  schema: refusal([
    "invalid_requirement",
    "unresolved",
    "incompatible",
    "ambiguous",
    "cyclic"
  ])
});

const installResult = source({
  operationId: "abg.operation.product.install",
  variant: "install",
  slot: "result",
  schema: v.strictObject({
    installedProductRef: refSchema,
    installedProductDigest: sha256DigestSchema,
    installManifestRef: refSchema,
    installManifestDigest: sha256DigestSchema,
    installerManifestRef: refSchema,
    installerManifestDigest: sha256DigestSchema,
    provenanceRefs: refListSchema
  })
});

const installRefusal = source({
  operationId: "abg.operation.product.install",
  variant: "install",
  slot: "refusal",
  schema: refusal([
    "verification_failed",
    "invalid_target",
    "identity_conflict",
    "filesystem_failure"
  ])
});

export const PRODUCT_INSTALL_REQUEST_GAP = freezeNativeValue({
  kind: "semantic_not_realized",
  gapCode: "p1_contract_product_install_policy_not_realized",
  definitionKey: {
    operationId: "abg.operation.product.install",
    memberKind: "variant",
    variant: "install"
  },
  slot: "request",
  ownerAuthorityRef: DESIGN_REF,
  ownerAuthorityDigest: DESIGN_DIGEST,
  ownerDesignRef:
    "build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md#closed-payload-semantics",
  evidenceRefs: [
    "code/src/app/m04/product_intake/install.ts",
    "specification/requirements/product/REQ-P-INSTALL.md"
  ]
} satisfies ProductInstallRequestContractGap);

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
