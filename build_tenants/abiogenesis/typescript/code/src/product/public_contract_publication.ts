import * as v from "valibot";

import { capabilityRefsForContract } from "../shared/capability_contracts.js";

import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  digestSchema,
  jsonPointerSchema,
  nonblankSchema,
  nonemptyUniqueArray,
  projectStrictJsonSchema,
  publicContractCatalogCoordinateSchema,
  publicContractCoordinateSchema,
} from "../shared/public_function_contracts.js";
import {
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  type IntrinsicPublicFunctionFamilyCoordinate,
} from "../shared/public_function_family.js";
import {
  PUBLIC_PROJECTION_PAYLOADS,
  S06_COMMON_PUBLIC_CONTRACT_IDS,
  type PublicProjectionPayloads,
} from "../shared/public_function_projections.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
} from "../shared/public_invocation.js";
import {
  ABI5_PACKAGE_NAME,
  type ProductAssetLocator,
  type ProductNativeTypedLocator,
  type ProductPublicContract,
  type ProductPublicContractCatalog,
} from "./contracts.js";
import type { NativeDeclarationClosure } from "./declaration_exports.js";

export const PUBLIC_CATALOG_BINDING_FAILURE_CLASSES = Object.freeze([
  "forbidden_operation_identity",
  "duplicate_contract_identity",
  "missing_projected_identity",
  "unexpected_projected_identity",
  "retained_row_changed",
  "owning_product_mismatch",
  "unresolved_locator",
  "content_digest_mismatch",
] as const);

export type PublicCatalogBindingFailureClass =
  (typeof PUBLIC_CATALOG_BINDING_FAILURE_CLASSES)[number];

export const MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS = Object.freeze([
  "abg.schema.product-toolchain-manifest",
  "abg.schema.public-contract-catalog",
  "abg.schema.public-operation-contract",
  "abg.schema.public-operation-invocation",
  "abg.schema.public-operation-outcome",
  "abg.schema.native-contract-inventory",
  "abg.schema.capability-contract",
  "abg.schema.closed-vocabulary",
  "abg.schema.gtl-graph-function",
  "abg.schema.gtl-module",
  "abg.schema.gtl-c-program",
  "abg.schema.gtl-program-conformance-input",
  "abg.schema.catalog-product-descriptor",
  "abg.schema.catalog-contribution-manifest",
  "abg.schema.resolved-product-lock",
  "abg.schema.workspace-binding",
  "abg.schema.install-manifest",
  "abg.schema.installer-manifest",
  "abg.schema.catalog-admission",
  "abg.schema.host-invocation",
  "abg.schema.runtime-event",
  "abg.schema.runtime-result",
  "abg.schema.runtime-replay",
  "abg.schema.fh-interaction",
  "abg.schema.tenant-conformance-manifest",
  "abg.schema.self-conformance-result",
  "abg.schema.exact-candidate-qualification",
  "abg.schema.consensus-subject",
  "abg.schema.consensus-panel",
  "abg.schema.consensus-reviewer-profile",
  "abg.schema.review-findings",
  "abg.schema.review-rulings",
  "abg.schema.consensus-round-policy",
  "abg.schema.consensus-round-outcome",
  "abg.schema.consensus-result",
  "abg.schema.ticket-consensus-projection",
  "abg.schema.release-snapshot",
  "abg.schema.a5-r1-release-manifest",
  "abg.vocabulary.runtime-event-kind",
  "abg.vocabulary.gtl-program-diagnostic-id",
  "abg.vocabulary.gtl-program-repair-edit-class",
  "abg.vocabulary.review-ruling-kind",
  "abg.vocabulary.consensus-round-outcome",
  "abg.asset.gtl.language-conformance-corpus",
] as const);

const operationIds = Object.freeze([
  ...new Set(PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.map(
    ({ definitionKey }) => definitionKey.operationId,
  )),
].sort(compareUnicodeCodeUnits));

export const S06_REPLACEMENT_CONTRACT_IDS = Object.freeze([
  ...S06_COMMON_PUBLIC_CONTRACT_IDS,
  ...operationIds,
].sort(compareUnicodeCodeUnits));

if (
  operationIds.length !== 18 ||
  S06_REPLACEMENT_CONTRACT_IDS.length !== 21 ||
  MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS.length !== 44
) {
  throw new TypeError("PFC-F08 closed identity cardinality diverged");
}

export type PublicContractCatalogRowProposal = ProductPublicContract & Readonly<{
  readonly contractVersion: "5.0.0";
  readonly contractKind: "serialized_native_contract";
  readonly nativeTypedLocator: ProductNativeTypedLocator;
  readonly assetLocator: ProductAssetLocator;
}>;

export interface PublicCatalogProposalSet {
  readonly family: IntrinsicPublicFunctionFamilyCoordinate;
  readonly proposals: readonly PublicContractCatalogRowProposal[];
  readonly proposalSetRef: string;
  readonly proposalSetDigest: Sha256Digest;
}

const PUBLIC_REQUIREMENT_AUTHORITY_REFS = Object.freeze([
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-009",
  "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-010",
]);
const PUBLIC_PACKAGE_EXPORT = "./public";
const PUBLIC_NATIVE_SCHEMA_EXPORT = "PUBLIC_OPERATION_SCHEMAS";
const PUBLIC_OPERATION_PROJECTION_EXPORT =
  "PUBLIC_OPERATION_CONTRACT_PROJECTIONS";

function exactNativeLocator(
  packageName: string,
  closure: NativeDeclarationClosure,
  namedSymbol: string,
): ProductNativeTypedLocator {
  if (
    packageName !== ABI5_PACKAGE_NAME ||
    closure.packageExportPath !== PUBLIC_PACKAGE_EXPORT ||
    !closure.exportedSymbols.includes(namedSymbol) ||
    !closure.declarationInventory.some((entry) =>
      entry.packageExportPath === PUBLIC_PACKAGE_EXPORT &&
      entry.declarationPath === closure.declarationPath
    )
  ) {
    throw new TypeError(`invalid exact public declaration closure for ${namedSymbol}`);
  }
  return deepFreeze({
    packageName,
    packageExportPath: closure.packageExportPath,
    namedSymbol,
    declarationPath: closure.declarationPath,
    declarationInventory: closure.declarationInventory,
  });
}

function canonicalProposalSequence(
  proposals: readonly PublicContractCatalogRowProposal[],
): readonly PublicContractCatalogRowProposal[] {
  return [...proposals].sort((left, right) => {
    const identity = compareUnicodeCodeUnits(left.contractId, right.contractId);
    if (identity !== 0) return identity;
    return compareUnicodeCodeUnits(
      canonicalJson(left as unknown as JsonValue),
      canonicalJson(right as unknown as JsonValue),
    );
  });
}

export function publicProposalSetDigest(
  proposals: readonly PublicContractCatalogRowProposal[],
): Sha256Digest {
  return sha256Canonical(
    canonicalProposalSequence(proposals) as unknown as JsonValue,
  );
}

/** PFC-F07 Product-row projection over the closed family payloads. */
export function derivePublicCatalogRowProposals(
  productId: string,
  packageName: string,
  closure: NativeDeclarationClosure,
  payloads: PublicProjectionPayloads = PUBLIC_PROJECTION_PAYLOADS,
): PublicCatalogProposalSet {
  if (
    payloads.family.familyDigest !== PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest ||
    payloads.projectionDigest !== PUBLIC_PROJECTION_PAYLOADS.projectionDigest
  ) {
    throw new TypeError("PFC-F07 payload projection is not the exact closed family");
  }
  const commonDefinitions = [
    [S06_COMMON_PUBLIC_CONTRACT_IDS[0], "#/$defs/PublicOperationContractProjection", PUBLIC_OPERATION_PROJECTION_EXPORT],
    [S06_COMMON_PUBLIC_CONTRACT_IDS[1], "#/$defs/PublicInvocation", PUBLIC_NATIVE_SCHEMA_EXPORT],
    [S06_COMMON_PUBLIC_CONTRACT_IDS[2], "#/$defs/PublicOutcome", PUBLIC_NATIVE_SCHEMA_EXPORT],
  ] as const;
  const commonRows = commonDefinitions.map(
    ([contractId, definitionRef, namedSymbol]): PublicContractCatalogRowProposal =>
      deepFreeze({
        contractId,
        contractVersion: "5.0.0",
        contractDigest: payloads.commonSchemaAsset.contentDigest,
        contractKind: "serialized_native_contract",
        owningProduct: productId,
        requirementAuthorityRefs: PUBLIC_REQUIREMENT_AUTHORITY_REFS,
        capabilityIdentities: capabilityRefsForContract(contractId),
        nativeTypedLocator: exactNativeLocator(
          packageName,
          closure,
          namedSymbol,
        ),
        assetLocator: deepFreeze({
          path: payloads.commonSchemaAsset.path,
          mediaType: payloads.commonSchemaAsset.mediaType,
          schemaVersion: "5.0.0",
          contentDigest: payloads.commonSchemaAsset.contentDigest,
          definitionRef,
        }),
      }),
  );
  const operationRows = payloads.operationContractAssets.map(
    (asset): PublicContractCatalogRowProposal => {
      const operationId = asset.operationId!;
      const definitions = PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
        (definition) => definition.definitionKey.operationId === operationId,
      );
      return deepFreeze({
        contractId: operationId,
        contractVersion: "5.0.0",
        contractDigest: asset.contentDigest,
        contractKind: "serialized_native_contract",
        owningProduct: productId,
        requirementAuthorityRefs:
          PUBLIC_FUNCTION_DEFINITION_FAMILY.requirementAuthorityRefs,
        capabilityIdentities: capabilityRefsForContract(operationId),
        nativeTypedLocator: exactNativeLocator(
          packageName,
          closure,
          PUBLIC_NATIVE_SCHEMA_EXPORT,
        ),
        assetLocator: deepFreeze({
          path: asset.path,
          mediaType: asset.mediaType,
          schemaVersion: "5.0.0",
          contentDigest: asset.contentDigest,
        }),
      });
    },
  );
  const proposals = deepFreeze(canonicalProposalSequence([
    ...commonRows,
    ...operationRows,
  ]));
  if (
    proposals.length !== 21 ||
    new Set(proposals.map(({ contractId }) => contractId)).size !== 21
  ) {
    throw new TypeError(
      "PFC-F07 must produce exactly three common plus eighteen operation rows",
    );
  }
  const proposalSetDigest = publicProposalSetDigest(proposals);
  return deepFreeze({
    family: payloads.family,
    proposals,
    proposalSetRef:
      `public-catalog-proposal-set://abiogenesis/${proposalSetDigest.slice(7)}`,
    proposalSetDigest,
  });
}

export interface PublicCatalogBindingAttempt {
  readonly schemaVersion: "5.0.0";
  readonly extantCatalog: PublicContractCatalogCoordinate;
  readonly family: IntrinsicPublicFunctionFamilyCoordinate;
  readonly proposalSetRef: string;
  readonly proposalSetDigest: Sha256Digest;
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly attemptRef: string;
  readonly attemptDigest: Sha256Digest;
}

export interface ExactPublicCatalogBindingNativeSource {
  readonly abstractModule: "Product.PublicContractPublication";
  readonly exportName: "PUBLIC_CATALOG_BINDING_CONTRACTS";
  readonly memberPath: readonly ["refusal"];
  readonly sourceModuleDigest: Sha256Digest;
  readonly memberDigest: Sha256Digest;
}

export interface PublicCatalogBindingRefusal {
  readonly kind: "public_catalog_binding_refusal";
  readonly schemaVersion: "5.0.0";
  readonly refusalContract: PublicContractCoordinate;
  readonly nativeContractSource: ExactPublicCatalogBindingNativeSource;
  readonly attempt: PublicCatalogBindingAttempt;
  readonly refusalRef: string;
  readonly refusalDigest: Sha256Digest;
  readonly failureClass: PublicCatalogBindingFailureClass;
  readonly issuePaths: readonly [string, ...string[]];
}

export interface MandatorySchemaVocabularyCorpusGapSet {
  readonly kind: "mandatory_schema_vocabulary_corpus_gap_set";
  readonly schemaVersion: "5.0.0";
  readonly requirementAuthorityRef:
    "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-006A";
  readonly catalogId: string;
  readonly catalogDigest: Sha256Digest;
  readonly mandatoryIdentityCount: 44;
  readonly missingContractIds: readonly string[];
  readonly diagnosticDigest: Sha256Digest;
}

export interface S06PublicCatalogBindingSuccess {
  readonly kind: "s06_public_contract_catalog_binding";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "bound";
  readonly attempt: PublicCatalogBindingAttempt;
  readonly catalog: ProductPublicContractCatalog;
  readonly mandatorySchemaVocabularyCorpusGapSet:
    MandatorySchemaVocabularyCorpusGapSet;
}

export type S06PublicCatalogBindingResult =
  | S06PublicCatalogBindingSuccess
  | PublicCatalogBindingRefusal;

export interface BindS06PublicFunctionCatalogInput {
  readonly extantCatalog: ProductPublicContractCatalog;
  readonly extantCatalogCoordinate: PublicContractCatalogCoordinate;
  readonly productId: string;
  readonly productContentDigest: Sha256Digest;
  readonly proposalSequence: readonly PublicContractCatalogRowProposal[];
  readonly publicPackageName: string;
  readonly publicDeclarationClosure: NativeDeclarationClosure;
  readonly projectionPayloads?: PublicProjectionPayloads;
}

const familyCoordinateSchema = v.strictObject({
  requirementAuthorityRefs: nonemptyUniqueArray(nonblankSchema),
  familyRef: nonblankSchema,
  familyVersion: v.literal("5.0.0"),
  familyDigest: digestSchema,
});

const bindingAttemptSchema = v.strictObject({
  schemaVersion: v.literal("5.0.0"),
  extantCatalog: publicContractCatalogCoordinateSchema,
  family: familyCoordinateSchema,
  proposalSetRef: nonblankSchema,
  proposalSetDigest: digestSchema,
  productId: nonblankSchema,
  productContentDigest: digestSchema,
  attemptRef: nonblankSchema,
  attemptDigest: digestSchema,
});

const nativeSourceSchema = v.strictObject({
  abstractModule: v.literal("Product.PublicContractPublication"),
  exportName: v.literal("PUBLIC_CATALOG_BINDING_CONTRACTS"),
  memberPath: v.tuple([v.literal("refusal")]),
  sourceModuleDigest: digestSchema,
  memberDigest: digestSchema,
});

const bindingRefusalSchema = v.strictObject({
  kind: v.literal("public_catalog_binding_refusal"),
  schemaVersion: v.literal("5.0.0"),
  refusalContract: publicContractCoordinateSchema,
  nativeContractSource: nativeSourceSchema,
  attempt: bindingAttemptSchema,
  refusalRef: nonblankSchema,
  refusalDigest: digestSchema,
  failureClass: v.picklist(PUBLIC_CATALOG_BINDING_FAILURE_CLASSES),
  issuePaths: nonemptyUniqueArray(jsonPointerSchema),
});

const refusalMemberDigest = sha256Canonical({
  failureClasses: PUBLIC_CATALOG_BINDING_FAILURE_CLASSES,
  attemptSchema: projectStrictJsonSchema(bindingAttemptSchema),
  refusalSchema: projectStrictJsonSchema(bindingRefusalSchema),
} as unknown as JsonValue);
const refusalSourceModuleDigest = sha256Canonical({
  abstractModule: "Product.PublicContractPublication",
  members: [{ exportName: "PUBLIC_CATALOG_BINDING_CONTRACTS", memberPath: ["refusal"], memberDigest: refusalMemberDigest }],
} as JsonValue);
const refusalNativeSource: ExactPublicCatalogBindingNativeSource = deepFreeze({
  abstractModule: "Product.PublicContractPublication",
  exportName: "PUBLIC_CATALOG_BINDING_CONTRACTS",
  memberPath: ["refusal"],
  sourceModuleDigest: refusalSourceModuleDigest,
  memberDigest: refusalMemberDigest,
});

export const PUBLIC_CATALOG_BINDING_CONTRACTS = deepFreeze({
  attempt: bindingAttemptSchema,
  refusal: bindingRefusalSchema,
  refusalNativeSource,
});

function sameCanonical(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

export function productPublicContractCatalogDigest(
  catalog: ProductPublicContractCatalog,
): Sha256Digest {
  const { catalogDigest: _catalogDigest, ...projection } = catalog;
  return sha256Canonical(projection as unknown as JsonValue);
}

function catalogCoordinateMatches(
  catalog: ProductPublicContractCatalog,
  coordinate: PublicContractCatalogCoordinate,
): boolean {
  return catalog.catalogId === coordinate.catalogId &&
    catalog.catalogVersion === coordinate.catalogVersion &&
    catalog.catalogDigest === coordinate.catalogDigest &&
    productPublicContractCatalogDigest(catalog) === coordinate.catalogDigest;
}

function exactAttempt(
  input: BindS06PublicFunctionCatalogInput,
  payloads: PublicProjectionPayloads,
): PublicCatalogBindingAttempt {
  const proposalSetDigest = publicProposalSetDigest(input.proposalSequence);
  const fields = {
    schemaVersion: "5.0.0" as const,
    extantCatalog: input.extantCatalogCoordinate,
    family: payloads.family,
    proposalSetRef:
      `public-catalog-proposal-set://abiogenesis/${proposalSetDigest.slice(7)}`,
    proposalSetDigest,
    productId: input.productId,
    productContentDigest: input.productContentDigest,
  };
  const attemptDigest = sha256Canonical(fields as unknown as JsonValue);
  return deepFreeze({
    ...fields,
    attemptRef: `public-catalog-binding-attempt://abiogenesis/${attemptDigest.slice(7)}`,
    attemptDigest,
  });
}

function pointerSegment(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function catalogSchemaRow(
  catalog: ProductPublicContractCatalog,
): ProductPublicContract {
  const rows = catalog.rows.filter(({ contractId }) =>
    contractId === "abg.schema.public-contract-catalog"
  );
  if (rows.length !== 1 || rows[0]!.contractVersion !== "5.0.0") {
    throw new TypeError("exact extant catalog lacks its refusal contract row");
  }
  return rows[0]!;
}

function refusalContract(
  input: BindS06PublicFunctionCatalogInput,
): PublicContractCoordinate {
  const row = catalogSchemaRow(input.extantCatalog);
  return deepFreeze({
    contractCatalog: input.extantCatalogCoordinate,
    flatRow: {
      contractId: row.contractId,
      contractVersion: row.contractVersion,
      contractDigest: row.contractDigest,
    },
    nestedSelector: {
      selectorKind: "schema_definition" as const,
      definitionKey: null,
      slot: null,
      definitionRef: "#/$defs/PublicCatalogBindingRefusal",
    },
  });
}

function bindingRefusal(
  input: BindS06PublicFunctionCatalogInput,
  attempt: PublicCatalogBindingAttempt,
  failureClass: PublicCatalogBindingFailureClass,
  issuePaths: readonly string[],
): PublicCatalogBindingRefusal {
  const uniquePaths = [...new Set(issuePaths)].sort(compareUnicodeCodeUnits);
  if (uniquePaths.length === 0) uniquePaths.push("/");
  const fields = {
    kind: "public_catalog_binding_refusal" as const,
    schemaVersion: "5.0.0" as const,
    refusalContract: refusalContract(input),
    nativeContractSource: refusalNativeSource,
    attempt,
    failureClass,
    issuePaths: uniquePaths as [string, ...string[]],
  };
  const refusalDigest = sha256Canonical(fields as unknown as JsonValue);
  const refusal = deepFreeze({
    ...fields,
    refusalRef:
      `public-catalog-binding-refusal://abiogenesis/${refusalDigest.slice(7)}`,
    refusalDigest,
  });
  const admitted = v.safeParse(bindingRefusalSchema, refusal);
  if (!admitted.success) {
    throw new TypeError("constructed PFC-F08 refusal violates its owner schema");
  }
  return refusal;
}

function duplicateIndexes(
  rows: readonly Readonly<{ readonly contractId: string }>[],
): number[] {
  const indexesById = new Map<string, number[]>();
  rows.forEach((row, index) => {
    indexesById.set(row.contractId, [
      ...(indexesById.get(row.contractId) ?? []),
      index,
    ]);
  });
  return [...indexesById.values()].filter((indexes) => indexes.length > 1).flat();
}

function resolveDefinition(content: JsonValue, definitionRef: string | undefined): boolean {
  if (definitionRef === undefined) return true;
  if (!definitionRef.startsWith("#/")) return false;
  let selected: JsonValue = content;
  for (const encoded of definitionRef.slice(2).split("/")) {
    const segment = encoded.replaceAll("~1", "/").replaceAll("~0", "~");
    if (
      typeof selected !== "object" ||
      selected === null ||
      Array.isArray(selected) ||
      !Object.hasOwn(selected, segment)
    ) return false;
    selected = (selected as Readonly<Record<string, JsonValue>>)[segment]!;
  }
  return true;
}

function mandatoryGapSet(
  catalog: ProductPublicContractCatalog,
): MandatorySchemaVocabularyCorpusGapSet {
  const present = new Set(catalog.rows.map(({ contractId }) => contractId));
  const fields = {
    kind: "mandatory_schema_vocabulary_corpus_gap_set" as const,
    schemaVersion: "5.0.0" as const,
    requirementAuthorityRef:
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md#REQ-P-PUBLIC-CONTRACTS-006A" as const,
    catalogId: catalog.catalogId,
    catalogDigest: catalog.catalogDigest,
    mandatoryIdentityCount: 44 as const,
    missingContractIds: MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS.filter(
      (contractId) => !present.has(contractId),
    ),
  };
  return deepFreeze({
    ...fields,
    diagnosticDigest: sha256Canonical(fields as unknown as JsonValue),
  });
}

/** PFC-F08. Pure, eventless binding into the extant flat catalog carrier. */
export function bindS06PublicFunctionCatalog(
  input: BindS06PublicFunctionCatalogInput,
): S06PublicCatalogBindingResult {
  const payloads = input.projectionPayloads ?? PUBLIC_PROJECTION_PAYLOADS;
  const attempt = exactAttempt(input, payloads);
  if (
    input.productId !== input.extantCatalogCoordinate.productId ||
    input.proposalSequence.some(({ owningProduct }) =>
      owningProduct !== input.productId
    )
  ) {
    return bindingRefusal(
      input,
      attempt,
      "owning_product_mismatch",
      ["/productId", "/proposalSequence"],
    );
  }
  if (
    input.productContentDigest !==
      input.extantCatalogCoordinate.productContentDigest
  ) {
    return bindingRefusal(
      input,
      attempt,
      "content_digest_mismatch",
      ["/productContentDigest"],
    );
  }
  const duplicates = duplicateIndexes(input.proposalSequence);
  if (duplicates.length > 0) {
    return bindingRefusal(
      input,
      attempt,
      "duplicate_contract_identity",
      duplicates.map((index) => `/proposalSequence/${index}/contractId`),
    );
  }
  if (!catalogCoordinateMatches(input.extantCatalog, input.extantCatalogCoordinate)) {
    return bindingRefusal(
      input,
      attempt,
      "retained_row_changed",
      ["/extantCatalog"],
    );
  }
  const extantDuplicates = duplicateIndexes(input.extantCatalog.rows);
  if (extantDuplicates.length > 0) {
    return bindingRefusal(
      input,
      attempt,
      "duplicate_contract_identity",
      extantDuplicates.map((index) =>
        `/extantCatalog/rows/${index}/contractId`
      ),
    );
  }
  const forbidden = input.extantCatalog.rows.flatMap((row, index) =>
    row.contractId.startsWith("abg.operation.") &&
      !operationIds.includes(row.contractId)
      ? [{ row, index }]
      : []
  );
  if (forbidden.length > 0) {
    return bindingRefusal(
      input,
      attempt,
      "forbidden_operation_identity",
      forbidden.map(({ index }) => `/extantCatalog/rows/${index}/contractId`),
    );
  }
  const suppliedIds = new Set(input.proposalSequence.map(({ contractId }) => contractId));
  const missing = S06_REPLACEMENT_CONTRACT_IDS.filter((id) => !suppliedIds.has(id));
  if (missing.length > 0) {
    return bindingRefusal(
      input,
      attempt,
      "missing_projected_identity",
      missing.map((id) => `/proposalSequence/${pointerSegment(id)}`),
    );
  }
  const extra = [...suppliedIds].filter((id) =>
    !S06_REPLACEMENT_CONTRACT_IDS.includes(id)
  );
  if (extra.length > 0) {
    return bindingRefusal(
      input,
      attempt,
      "unexpected_projected_identity",
      extra.map((id) => `/proposalSequence/${pointerSegment(id)}`),
    );
  }
  let expected: PublicCatalogProposalSet;
  try {
    expected = derivePublicCatalogRowProposals(
      input.productId,
      input.publicPackageName,
      input.publicDeclarationClosure,
      payloads,
    );
  } catch {
    return bindingRefusal(
      input,
      attempt,
      "unresolved_locator",
      ["/publicDeclarationClosure"],
    );
  }
  const expectedById = new Map(expected.proposals.map((row) => [row.contractId, row]));
  const assetsByPath = new Map(payloads.assets.map((asset) => [asset.path, asset]));
  for (const [index, row] of input.proposalSequence.entries()) {
    const expectedRow = expectedById.get(row.contractId)!;
    if (
      row.nativeTypedLocator === undefined ||
      row.assetLocator === undefined ||
      !sameCanonical(
        row.nativeTypedLocator,
        expectedRow.nativeTypedLocator,
      )
    ) {
      return bindingRefusal(
        input,
        attempt,
        "unresolved_locator",
        [`/proposalSequence/${index}`],
      );
    }
    const asset = assetsByPath.get(row.assetLocator.path);
    if (
      asset === undefined ||
      !resolveDefinition(asset.content, row.assetLocator.definitionRef)
    ) {
      return bindingRefusal(
        input,
        attempt,
        "unresolved_locator",
        [`/proposalSequence/${index}/assetLocator`],
      );
    }
    if (
      row.contractDigest !== asset.contentDigest ||
      row.assetLocator.contentDigest !== asset.contentDigest ||
      row.contractDigest !== row.assetLocator.contentDigest
    ) {
      return bindingRefusal(
        input,
        attempt,
        "content_digest_mismatch",
        [`/proposalSequence/${index}/contractDigest`],
      );
    }
    if (!sameCanonical(row, expectedRow)) {
      return bindingRefusal(
        input,
        attempt,
        "content_digest_mismatch",
        [`/proposalSequence/${index}`],
      );
    }
  }
  if (
    publicProposalSetDigest(input.proposalSequence) !== expected.proposalSetDigest ||
    payloads.family.familyDigest !== PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest
  ) {
    return bindingRefusal(
      input,
      attempt,
      "content_digest_mismatch",
      ["/proposalSequence"],
    );
  }
  const replacementIds = new Set(S06_REPLACEMENT_CONTRACT_IDS);
  const retainedRows = input.extantCatalog.rows.filter(
    ({ contractId }) => !replacementIds.has(contractId),
  );
  const rows = deepFreeze([
    ...retainedRows,
    ...expected.proposals,
  ].sort((left, right) => compareUnicodeCodeUnits(left.contractId, right.contractId)));
  const catalogFields = {
    schemaVersion: "5.0.0" as const,
    catalogId: input.extantCatalog.catalogId,
    catalogVersion: input.extantCatalog.catalogVersion,
    catalogSchemaPath: input.extantCatalog.catalogSchemaPath,
    catalogSchemaDigest: input.extantCatalog.catalogSchemaDigest,
    rows,
  };
  const catalog = deepFreeze({
    ...catalogFields,
    catalogDigest: sha256Canonical(catalogFields as unknown as JsonValue),
  });
  return deepFreeze({
    kind: "s06_public_contract_catalog_binding" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "bound" as const,
    attempt,
    catalog,
    mandatorySchemaVocabularyCorpusGapSet: mandatoryGapSet(catalog),
  });
}
