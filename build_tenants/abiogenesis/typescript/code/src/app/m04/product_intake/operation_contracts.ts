// Owner-native payload contracts for accepted T-281 product-intake definitions.

import { validRange } from "semver";
import * as v from "valibot";

import { createInstalledProductEvidenceProjectionNativeContract } from "../../../abg/m03/contracts/runtime_projection_operation_contracts.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  absolutePosixPathSchema,
  canonicalIJsonSchema,
  nonEmptyTextSchema,
  refSchema,
  semanticVersionSchema,
  sha256DigestSchema,
  uniqueByNativeIdentityArray
} from "../../../shared/validation/native_contract_primitives.js";
import { freezeNativeValue } from "../../../shared/validation/immutable_native_value.js";
import type { NativeNamedCheckRegistry } from "../../../shared/validation/native_named_check_registry.js";
import {
  ownerNativeDefinitionContractSource,
  ownerNativeOperationContractSource,
  ownerProjectionRelationSource,
  type OwnerProjectionRelationAction,
  type OwnerProjectionRelationResult
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import {
  admitResolvedProductLock,
  admitVerifiedProductArtifact
} from "../public_sdk/carrier_admission.js";
import { assertResolvedProductLockCoherence } from "./resolve.js";

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
const INSTALL_EVIDENCE_SEMANTIC_OWNER_BASIS = freezeNativeValue({
  ref: "specification/requirements/product/REQ-P-POLICY.md#REQ-P-POLICY-055",
  digest:
    "sha256:89cf57e14f74cd4ea433c277f88d89a5972e49b421801878d44b7481801c022f"
} as const);
const INSTALLED_PRODUCT_EVIDENCE_PROJECTION_NATIVE_CONTRACT =
  createInstalledProductEvidenceProjectionNativeContract();
const PRODUCT_INTAKE_SOURCE_PRIMITIVES = freezeNativeValue({
  owner: PRODUCT_INTAKE_OWNER,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME,
  namedChecks: {
    kind: "family_registry" as const,
    exportName: "PRODUCT_INTAKE_NATIVE_CHECK_REGISTRY",
    memberPath: [] as const
  }
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

const selectedProductListSchema = v.pipe(
  v.array(resolvedProductSelectionSchema),
  v.minLength(1, "expected at least one selected product"),
  UNIQUE_SELECTED_PRODUCT_ACTION,
  v.readonly()
);

const RESOLVED_PRODUCT_LOCK_COHERENCE_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof canonicalIJsonSchema>) => {
    try {
      assertResolvedProductLockCoherence(admitResolvedProductLock(value));
      return true;
    } catch {
      return false;
    }
  },
  "expected one coherent resolved product lock"
));

const VERIFIED_PRODUCT_ARTIFACT_ADMISSION_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof canonicalIJsonSchema>) => {
    try {
      admitVerifiedProductArtifact(value);
      return true;
    } catch {
      return false;
    }
  },
  "expected one admitted verified product artifact"
));

const resolvedProductLockCarrierSchema = v.pipe(
  canonicalIJsonSchema,
  RESOLVED_PRODUCT_LOCK_COHERENCE_ACTION
);

const verifiedProductArtifactCarrierSchema = v.pipe(
  canonicalIJsonSchema,
  VERIFIED_PRODUCT_ARTIFACT_ADMISSION_ACTION
);

const productVerifyResultBaseSchema = v.strictObject({
  verifiedArtifactRef: refSchema,
  verifiedArtifactDigest: sha256DigestSchema,
  verifiedArtifact: verifiedProductArtifactCarrierSchema,
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
});

const VERIFY_RESULT_CARRIER_RELATION_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof productVerifyResultBaseSchema>) => {
    const verified = admitVerifiedProductArtifact(value.verifiedArtifact);
    return value.verifiedArtifactRef === verified.artifact.artifactPath &&
      value.verifiedArtifactDigest === stableSha256Digest(verified) &&
      value.productContentDigest ===
        verified.artifact.expectedProductContentDigest &&
      value.descriptorRef === verified.descriptor.descriptorId &&
      value.descriptorDigest === verified.descriptor.descriptorDigest &&
      value.contributionManifestRef ===
        verified.contributionManifest.contributionId &&
      value.contributionManifestDigest ===
        verified.contributionManifest.contributionDigest &&
      value.resolvedLockRef === verified.resolvedLock.lockId &&
      value.resolvedLockDigest === verified.resolvedLock.lockDigest &&
      stableJsonEquals(
        [...value.checkedContractRefs].sort(),
        [...verified.descriptor.contractRefs].sort()
      );
  },
  "verified artifact projection must match its exact owner carrier"
));

const productVerifyResultSchema = v.pipe(
  productVerifyResultBaseSchema,
  VERIFY_RESULT_CARRIER_RELATION_ACTION
);

const productResolveResultBaseSchema = v.strictObject({
  resolvedLockRef: refSchema,
  resolvedLockDigest: sha256DigestSchema,
  resolvedLock: resolvedProductLockCarrierSchema,
  selectedProducts: selectedProductListSchema,
  selectedDependencyGraph: selectedDependencyGraphSchema,
  residualRefs: refListSchema,
  provenanceRefs: refListSchema
});

const RESOLVE_RESULT_CARRIER_RELATION_ACTION = Object.freeze(v.check(
  (value: v.InferOutput<typeof productResolveResultBaseSchema>) => {
    const lock = assertResolvedProductLockCoherence(
      admitResolvedProductLock(value.resolvedLock)
    );
    return value.resolvedLockRef === lock.lockId &&
      value.resolvedLockDigest === lock.lockDigest &&
      stableJsonEquals(value.selectedDependencyGraph, lock.dependencyEdges) &&
      stableJsonEquals(
        [...value.selectedProducts]
          .map((selection) => selection.productIdentity)
          .sort(),
        [...lock.products].map((selection) => selection.productId).sort()
      );
  },
  "resolved lock projection must match its exact owner carrier"
));

const productResolveResultSchema = v.pipe(
  productResolveResultBaseSchema,
  RESOLVE_RESULT_CARRIER_RELATION_ACTION
);

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
    },
    {
      checkId: "resolved-product-lock-coherence",
      action: RESOLVED_PRODUCT_LOCK_COHERENCE_ACTION,
      relationRef: "REQ-P-CATALOG-010..013"
    },
    {
      checkId: "verified-product-artifact-admission",
      action: VERIFIED_PRODUCT_ARTIFACT_ADMISSION_ACTION,
      relationRef: "REQ-P-INSTALL-043..045"
    },
    {
      checkId: "verify-result-carrier-relation",
      action: VERIFY_RESULT_CARRIER_RELATION_ACTION,
      relationRef: "REQ-P-INSTALL-043..045"
    },
    {
      checkId: "resolve-result-carrier-relation",
      action: RESOLVE_RESULT_CARRIER_RELATION_ACTION,
      relationRef: "REQ-P-CATALOG-010..013"
    },
    {
      checkId: "install-evidence-subject-relation",
      action:
        INSTALLED_PRODUCT_EVIDENCE_PROJECTION_NATIVE_CONTRACT.subjectConservationAction,
      relationRef: "REQ-P-POLICY-055"
    }
  ]
} satisfies NativeNamedCheckRegistry);

const installEvidenceResult = ownerNativeDefinitionContractSource({
  owner: PRODUCT_INTAKE_OWNER,
  definitionKey: {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "install_evidence"
  },
  slot: "result",
  semanticOwnerBasis: INSTALL_EVIDENCE_SEMANTIC_OWNER_BASIS,
  modulePath: MODULE_PATH,
  exportName: EXPORT_NAME,
  memberPath: ["project_read", "install_evidence", "result"],
  namedChecks: PRODUCT_INTAKE_SOURCE_PRIMITIVES.namedChecks,
  schema: INSTALLED_PRODUCT_EVIDENCE_PROJECTION_NATIVE_CONTRACT.schema
});

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
  schema: productVerifyResultSchema
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
  schema: productResolveResultSchema
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

const installRequest = ownerNativeOperationContractSource({
  ...PRODUCT_INTAKE_SOURCE_PRIMITIVES,
  operationId: "abg.operation.product.install",
  variant: "install",
  slot: "request",
  semanticOwnerBasis: INSTALL_SEMANTIC_OWNER_BASIS,
  memberPath: ["product_install", "install", "request"],
  schema: v.strictObject({
    verifiedArtifactRef: refSchema,
    verifiedArtifactDigest: sha256DigestSchema,
    productContentDigest: sha256DigestSchema,
    productDescriptorRef: refSchema,
    productDescriptorDigest: sha256DigestSchema,
    contributionManifestRef: refSchema,
    contributionManifestDigest: sha256DigestSchema,
    resolvedLockRef: refSchema,
    resolvedLockDigest: sha256DigestSchema,
    targetRoot: absolutePosixPathSchema,
    installPolicy: v.literal("immutable_idempotent")
  })
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

export const PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES = freezeNativeValue({
  project_read: {
    install_evidence: { result: installEvidenceResult }
  },
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
      request: installRequest,
      result: installResult,
      refusal: installRefusal
    }
  }
});

type InstallEvidenceRefDigest = Readonly<{
  ref: string;
  digest: string;
}>;
type InstallEvidenceDefinitionKey = Readonly<{
  operationId: "abg.operation.project.read";
  memberKind: "project_read_case";
  caseKey: "install_evidence";
}>;
type InstallEvidenceReadRequest = Readonly<{
  kind: "project_read_request";
  caseKey: "install_evidence";
  source: Readonly<{
    kind: "InstalledProduct";
    sourceRef: string;
    sourceDigest: string;
  }>;
  projectionBasis: InstallEvidenceRefDigest;
  selector: Readonly<{
    installManifest: InstallEvidenceRefDigest;
  }>;
}>;
type InstallEvidenceProjection = v.InferOutput<
  typeof INSTALLED_PRODUCT_EVIDENCE_PROJECTION_NATIVE_CONTRACT.schema
>;

function sameInstallEvidenceCoordinate(
  left: InstallEvidenceRefDigest,
  right: InstallEvidenceRefDigest
): boolean {
  return left.ref === right.ref && left.digest === right.digest;
}

function installEvidenceRelationResult(
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

const INSTALL_EVIDENCE_PROJECT_READ_RELATION: OwnerProjectionRelationAction<
  InstallEvidenceDefinitionKey,
  InstallEvidenceReadRequest,
  InstallEvidenceProjection
> = ({ admittedRequest, candidateProjection }) => {
  const issuePaths: string[] = [];
  if (
    admittedRequest.source.sourceRef !== candidateProjection.subject.ref ||
    admittedRequest.source.sourceDigest !== candidateProjection.subject.digest
  ) {
    issuePaths.push("candidateProjection.subject");
  }
  candidateProjection.rows.forEach((row, index) => {
    if (!sameInstallEvidenceCoordinate(
      admittedRequest.selector.installManifest,
      row.basis
    )) {
      issuePaths.push(`candidateProjection.rows.${index}.basis`);
    }
  });
  return installEvidenceRelationResult(issuePaths);
};

export const PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES =
  freezeNativeValue({
    install_evidence: ownerProjectionRelationSource({
      relationIdentity: "relation://abg/project-read/install-evidence@5",
      definitionKey: {
        operationId: "abg.operation.project.read",
        memberKind: "project_read_case",
        caseKey: "install_evidence"
      },
      semanticOwnerBasis: INSTALL_EVIDENCE_SEMANTIC_OWNER_BASIS,
      modulePath: MODULE_PATH,
      exportName: "PRODUCT_INTAKE_PROJECT_READ_RELATION_SOURCES",
      memberPath: ["install_evidence"],
      relation: INSTALL_EVIDENCE_PROJECT_READ_RELATION
    })
  });
