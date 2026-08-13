import * as v from "valibot";

import {
  type CompleteDefinitionContractCoordinateMap,
  completeDefinitionContractCoordinateMapSchema,
  contractIndexedPendingExternalSelectorSchema,
  type ExactOwnerOperationPort,
  nonemptyRefDigestSetSchema,
  nonblankSchema,
  ownerAuthorityDigest,
  ownerContractPacket,
  ownerMetadata,
  refDigestSchema,
  refSetSchema,
  refusalSchema,
  requestDependentAuthoritySlot,
  TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  typedResidualSetSchema,
  uniqueArray,
} from "../shared/public_function_contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import type { OwnerContractPacket } from "../shared/public_function_contracts.js";
import type {
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
  PublicDefinitionKeyLike,
} from "../shared/public_invocation.js";

const VERIFY_CAPABILITY = "abg.capability.install.bind-products@5";
const VERIFY_AUTHORITY =
  "authority://abiogenesis/product/verification@5";

const dependencyRequirementSchema = v.strictObject({
  kind: v.literal("requires"),
  productId: nonblankSchema,
  packageVersion: nonblankSchema,
  compatibilityRef: nonblankSchema,
  requiredContractRefs: refSetSchema,
  requiredCapabilityRefs: refSetSchema,
});

const compatibilityRequirementSchema = v.strictObject({
  compatibilityRef: nonblankSchema,
  subjectRef: nonblankSchema,
});

const commonRequest = {
  artifact: refDigestSchema,
  productContent: refDigestSchema,
  descriptor: refDigestSchema,
  contributionManifest: refDigestSchema,
  declaredDependencies: uniqueArray(dependencyRequirementSchema),
  compatibilityInputs: uniqueArray(compatibilityRequirementSchema),
} as const;

const requestSchema = v.union([
  v.strictObject({
    targetKind: v.literal("packed_artifact"),
    ...commonRequest,
  }),
  v.strictObject({
    targetKind: v.literal("installed_artifact"),
    ...commonRequest,
    resolvedLock: refDigestSchema,
    installedProduct: refDigestSchema,
    installManifest: refDigestSchema,
  }),
]);

const resultSchema = v.union([
  v.strictObject({
    targetKind: v.literal("packed_artifact"),
    disposition: v.literal("locally_verified"),
    verifiedArtifact: refDigestSchema,
    localNativeEvidence: refDigestSchema,
    pendingExternalSelectors: uniqueArray(
      contractIndexedPendingExternalSelectorSchema,
    ),
    definitionContractCoordinates: v.nullable(
      completeDefinitionContractCoordinateMapSchema,
    ),
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
  v.strictObject({
    targetKind: v.literal("installed_artifact"),
    disposition: v.literal("installed_verified"),
    verifiedArtifact: refDigestSchema,
    resolvedLock: refDigestSchema,
    installedProduct: refDigestSchema,
    definitionContractCoordinates: v.nullable(
      completeDefinitionContractCoordinateMapSchema,
    ),
    residuals: typedResidualSetSchema,
    provenance: nonemptyRefDigestSetSchema,
  }),
]);

export type OwnerContractSlot =
  | "request"
  | "result"
  | "refusal"
  | "non_terminal";

export interface OwnerContractIdentityProjection {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly slot: OwnerContractSlot;
  readonly contractId: string;
  readonly contractVersion: "5.0.0";
  readonly ownerAuthorityRef: string;
  readonly ownerAuthorityDigest: Sha256Digest;
  readonly nativeSchemaIdentity: Sha256Digest;
}

export interface ContentVerifiedDeclaredPublicFunctionDefinition {
  readonly definitionKey: PublicDefinitionKeyLike;
  readonly requestContract: OwnerContractIdentityProjection;
  readonly resultContract: OwnerContractIdentityProjection;
  readonly refusalContract: OwnerContractIdentityProjection;
  readonly nonTerminalContract: OwnerContractIdentityProjection | null;
}

interface ProjectedDefinitionSlot {
  readonly identity: OwnerContractIdentityProjection;
  readonly definitionRef: string;
}

export interface PublicOperationContractProjection {
  readonly rowKind: "public_operation_contract";
  readonly rowRef: string;
  readonly rowDigest: Sha256Digest;
  readonly operationId: string;
  readonly operationVersion: "5.0.0";
  readonly definitions: readonly Readonly<{
    readonly definitionKey: PublicDefinitionKeyLike;
    readonly requestContract: ProjectedDefinitionSlot;
    readonly resultContract: ProjectedDefinitionSlot;
    readonly refusalContract: ProjectedDefinitionSlot;
    readonly nonTerminalContract: ProjectedDefinitionSlot | null;
  }>[];
}

export interface ContentVerifiedOperationProjection {
  readonly payloadDigest: Sha256Digest;
  readonly projection: PublicOperationContractProjection;
}

export interface VerifiedPublicContractCatalogBasis {
  readonly coordinate: PublicContractCatalogCoordinate;
  readonly rows: readonly Readonly<{
    readonly contractId: string;
    readonly contractVersion: "5.0.0";
    readonly contractDigest: Sha256Digest;
    readonly owningProduct: string;
    readonly assetLocator: Readonly<{
      readonly contentDigest: Sha256Digest;
    }>;
  }>[];
}

export type ProductContractBindingRefusalCode =
  | "declared_family_incomplete"
  | "operation_projection_mismatch"
  | "catalog_identity_mismatch"
  | "nested_contract_mismatch";

export interface ProductContractBindingRefusal {
  readonly kind: "product_contract_binding_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: ProductContractBindingRefusalCode;
  readonly issuePaths: readonly string[];
}

function contractBindingRefusal(
  code: ProductContractBindingRefusalCode,
  issuePaths: readonly string[],
): ProductContractBindingRefusal {
  return Object.freeze({
    kind: "product_contract_binding_refusal" as const,
    schemaVersion: "5.0.0" as const,
    code,
    issuePaths: Object.freeze([...new Set(issuePaths)].sort()),
  });
}

function sameDefinitionKey(
  left: PublicDefinitionKeyLike,
  right: PublicDefinitionKeyLike,
): boolean {
  return left.operationId === right.operationId &&
    left.memberKey === right.memberKey;
}

function sameOwnerIdentity(
  left: OwnerContractIdentityProjection,
  right: OwnerContractIdentityProjection,
): boolean {
  return canonicalJson(left as unknown as JsonValue) ===
    canonicalJson(right as unknown as JsonValue);
}

function projectionRowDigest(
  projection: PublicOperationContractProjection,
): Sha256Digest {
  const { rowRef: _rowRef, rowDigest: _rowDigest, ...body } = projection;
  return sha256Canonical(body as unknown as JsonValue);
}

/**
 * PFC-F08A. Product constructs the map from a content-verified declared family,
 * the exact PFC-F07 projections, and the verified containing manifest catalog.
 * There is deliberately no candidate map or caller-supplied expected set.
 */
export function joinExpectedOwnerContractSet(
  declaredArtifactFamily: readonly ContentVerifiedDeclaredPublicFunctionDefinition[],
  operationProjectionAssets: readonly ContentVerifiedOperationProjection[],
  catalogBasis: VerifiedPublicContractCatalogBasis,
): CompleteDefinitionContractCoordinateMap | ProductContractBindingRefusal {
  if (declaredArtifactFamily.length === 0) {
    return contractBindingRefusal(
      "declared_family_incomplete",
      ["/declaredArtifactFamily"],
    );
  }
  const declaredByOperation = new Map<
    string,
    Map<string, ContentVerifiedDeclaredPublicFunctionDefinition>
  >();
  for (const [index, definition] of declaredArtifactFamily.entries()) {
    const members = declaredByOperation.get(definition.definitionKey.operationId) ??
      new Map<string, ContentVerifiedDeclaredPublicFunctionDefinition>();
    if (members.has(definition.definitionKey.memberKey)) {
      return contractBindingRefusal(
        "declared_family_incomplete",
        [`/declaredArtifactFamily/${index}/definitionKey`],
      );
    }
    const expectedContracts = [
      ["request", definition.requestContract],
      ["result", definition.resultContract],
      ["refusal", definition.refusalContract],
      ...(definition.nonTerminalContract === null
        ? []
        : [["non_terminal", definition.nonTerminalContract] as const]),
    ] as const;
    if (expectedContracts.some(([slot, identity]) =>
      identity.slot !== slot ||
      !sameDefinitionKey(identity.definitionKey, definition.definitionKey)
    )) {
      return contractBindingRefusal(
        "declared_family_incomplete",
        [`/declaredArtifactFamily/${index}`],
      );
    }
    members.set(definition.definitionKey.memberKey, definition);
    declaredByOperation.set(definition.definitionKey.operationId, members);
  }

  const projectionByOperation = new Map<string, ContentVerifiedOperationProjection>();
  for (const [index, asset] of operationProjectionAssets.entries()) {
    const projection = asset.projection;
    if (
      projectionByOperation.has(projection.operationId) ||
      projection.rowKind !== "public_operation_contract" ||
      projection.operationVersion !== "5.0.0" ||
      projection.rowDigest !== projectionRowDigest(projection) ||
      asset.payloadDigest !==
        sha256Canonical(projection as unknown as JsonValue)
    ) {
      return contractBindingRefusal(
        "operation_projection_mismatch",
        [`/operationProjectionAssets/${index}`],
      );
    }
    projectionByOperation.set(projection.operationId, asset);
  }
  if (
    projectionByOperation.size !== declaredByOperation.size ||
    [...declaredByOperation.keys()].some((key) => !projectionByOperation.has(key))
  ) {
    return contractBindingRefusal(
      "operation_projection_mismatch",
      ["/operationProjectionAssets"],
    );
  }

  const operations: CompleteDefinitionContractCoordinateMap["operations"][number][] = [];
  for (const operationId of [...declaredByOperation.keys()].sort()) {
    const expectedMembers = declaredByOperation.get(operationId)!;
    const asset = projectionByOperation.get(operationId)!;
    const projection = asset.projection;
    const catalogRows = catalogBasis.rows.filter((row) =>
      row.contractId === operationId
    );
    if (
      catalogRows.length !== 1 ||
      catalogRows[0]!.contractVersion !== "5.0.0" ||
      catalogRows[0]!.owningProduct !== catalogBasis.coordinate.productId ||
      catalogRows[0]!.assetLocator.contentDigest !== asset.payloadDigest
    ) {
      return contractBindingRefusal(
        "catalog_identity_mismatch",
        [`/catalogBasis/rows/${operationId}`],
      );
    }
    const catalogRow = catalogRows[0]!;
    const projectedMembers = new Map(
      projection.definitions.map((definition) => [
        definition.definitionKey.memberKey,
        definition,
      ]),
    );
    if (
      projectedMembers.size !== projection.definitions.length ||
      projectedMembers.size !== expectedMembers.size ||
      projection.definitions.some((definition) =>
        definition.definitionKey.operationId !== operationId ||
        !expectedMembers.has(definition.definitionKey.memberKey)
      )
    ) {
      return contractBindingRefusal(
        "operation_projection_mismatch",
        [`/operationProjectionAssets/${operationId}/definitions`],
      );
    }

    const members: CompleteDefinitionContractCoordinateMap["operations"][number]["members"][number][] = [];
    for (const memberKey of [...expectedMembers.keys()].sort()) {
      const expected = expectedMembers.get(memberKey)!;
      const projected = projectedMembers.get(memberKey)!;
      const projectedSlots = [
        ["request", projected.requestContract, expected.requestContract],
        ["result", projected.resultContract, expected.resultContract],
        ["refusal", projected.refusalContract, expected.refusalContract],
      ] as const;
      const seenPointers = new Set<string>();
      const coordinates: Partial<Record<
        "request" | "result" | "refusal",
        PublicContractCoordinate
      >> = {};
      for (const [slot, selected, expectedIdentity] of projectedSlots) {
        if (
          !sameOwnerIdentity(selected.identity, expectedIdentity) ||
          !selected.definitionRef.startsWith("#/") ||
          seenPointers.has(selected.definitionRef)
        ) {
          return contractBindingRefusal(
            "nested_contract_mismatch",
            [`/operationProjectionAssets/${operationId}/${memberKey}/${slot}`],
          );
        }
        seenPointers.add(selected.definitionRef);
        coordinates[slot] = {
          contractCatalog: catalogBasis.coordinate,
          flatRow: {
            contractId: catalogRow.contractId,
            contractVersion: catalogRow.contractVersion,
            contractDigest: catalogRow.contractDigest,
          },
          nestedSelector: {
            selectorKind: "operation_definition_slot",
            definitionKey: expected.definitionKey,
            slot,
            definitionRef: selected.definitionRef,
          },
        };
      }
      let nonTerminal: PublicContractCoordinate | null = null;
      if (
        (expected.nonTerminalContract === null) !==
          (projected.nonTerminalContract === null)
      ) {
        return contractBindingRefusal(
          "nested_contract_mismatch",
          [`/operationProjectionAssets/${operationId}/${memberKey}/nonTerminal`],
        );
      }
      if (
        expected.nonTerminalContract !== null &&
        projected.nonTerminalContract !== null
      ) {
        const selected = projected.nonTerminalContract;
        if (
          !sameOwnerIdentity(selected.identity, expected.nonTerminalContract) ||
          !selected.definitionRef.startsWith("#/") ||
          seenPointers.has(selected.definitionRef)
        ) {
          return contractBindingRefusal(
            "nested_contract_mismatch",
            [`/operationProjectionAssets/${operationId}/${memberKey}/nonTerminal`],
          );
        }
        nonTerminal = {
          contractCatalog: catalogBasis.coordinate,
          flatRow: {
            contractId: catalogRow.contractId,
            contractVersion: catalogRow.contractVersion,
            contractDigest: catalogRow.contractDigest,
          },
          nestedSelector: {
            selectorKind: "operation_definition_slot",
            definitionKey: expected.definitionKey,
            slot: "non_terminal",
            definitionRef: selected.definitionRef,
          },
        };
      }
      members.push({
        memberKey,
        slots: {
          request: coordinates.request!,
          result: coordinates.result!,
          refusal: coordinates.refusal!,
          nonTerminal,
        },
      });
    }
    operations.push({ operationId, members });
  }
  const result = { operations };
  const admitted = v.safeParse(completeDefinitionContractCoordinateMapSchema, result);
  return admitted.success
    ? admitted.output
    : contractBindingRefusal(
      "nested_contract_mismatch",
      admitted.issues.map((issue) =>
        `/${issue.path?.map((entry) => String(entry.key)).join("/") ?? ""}`
      ),
    );
}

const verify = ownerContractPacket(
  { operationId: "abg.operation.product.verify", memberKey: "verify" },
  requestSchema,
  resultSchema,
  refusalSchema([
    "artifact_mismatch",
    "content_mismatch",
    "identity_mismatch",
    "descriptor_mismatch",
    "contribution_mismatch",
    "invalid_declared_dependency",
    "unsupported_contract",
    "lock_mismatch",
    "stale_installed_state",
  ]),
  null,
  {
    abstractModule: "Product.Verification",
    exportName: "PRODUCT_VERIFICATION_CONTRACTS",
    memberPath: ["verify"],
    port: "ProductVerificationPort.verify",
    authorityRef: VERIFY_AUTHORITY,
    authorityDigest: ownerAuthorityDigest(VERIFY_AUTHORITY),
  },
  ownerMetadata({
    authorityClass: "attestation",
    effectClass: "deterministic_product_attestation",
    eventAdmission: "none",
    actorRequirement: "forbidden",
    workspaceBindingRequirement: "forbidden",
    authoritySlotRequirements: [
      "capability_grants",
      requestDependentAuthoritySlot(
        "dependency_lock",
        ["targetKind"],
        ["installed_artifact"],
      ),
    ],
    capabilityRefs: [VERIFY_CAPABILITY],
    defaults: {},
    closedDomains: {
      targetKind: ["packed_artifact", "installed_artifact"],
      disposition: ["locally_verified", "installed_verified"],
    },
    sdkCoordinate: "sdk.product.verify",
    cliCoordinate: "product verify",
    adapterExitMap: TERMINAL_ONLY_ADAPTER_EXIT_MAP,
  }),
);

export const PRODUCT_VERIFICATION_CONTRACTS = Object.freeze({ verify });

export interface ProductVerificationPort {
  readonly verify: ExactOwnerOperationPort<typeof verify>;
}
