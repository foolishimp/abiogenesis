// Implements: REQ-P-PUBLIC-CONTRACTS-001 through REQ-P-PUBLIC-CONTRACTS-006A
// Implements: REQ-P-PUBLIC-CONTRACTS-011

import { createHash } from "node:crypto";

import { RUNTIME_EVENT_KIND_VALUES } from "../../../abg/m03/index.js";
import {
  digest as admitDigest,
  nonEmptyString,
  relativePath
} from "../public_sdk/admission_primitives.js";
import {
  admitIJsonText,
  canonicalizeIJson
} from "../public_sdk/canonical.js";
import type {
  IJsonArray,
  IJsonObject,
  IJsonValue
} from "../public_sdk/canonical.js";
import type {
  NativeContractLocator,
  PublicContractRow,
  Sha256Digest
} from "../public_sdk/carriers.js";

const PACKAGE_NAME = "@abiogenesis/typescript-tenant";
const PRODUCT_ID = "abiogenesis";
const CONTRACT_VERSION = "1.0.0";

export interface Ds1StaticContractAssetDefinition {
  readonly contractId: string;
  readonly relativePath: string;
  readonly mediaType: "application/schema+json" | "application/json";
  readonly bytes: Uint8Array;
}

export interface NativeDeclarationInventoryRow {
  readonly packageExport: string;
  readonly declarationPath: string;
  readonly declarationDigest: Sha256Digest;
}

export type NativeContractInventoryTuple = readonly [
  packageExport: string,
  declarationPath: string,
  declarationDigest: Sha256Digest
];

export type PublishedNativeContractInventory =
  readonly NativeContractInventoryTuple[];

export interface PublishedCapabilityContract {
  readonly capabilityId: string;
  readonly dependentCapabilityIds: readonly string[];
  readonly effectRefs: readonly string[];
  readonly kind: "abg_capability_contract";
  readonly requiredContractIds: readonly string[];
  readonly schemaVersion: 1;
}

export interface PublishedClosedVocabulary {
  readonly kind: "abg_closed_vocabulary";
  readonly schemaVersion: 1;
  readonly vocabularyId: string;
  readonly values: readonly string[];
}

export interface Ds1NativeDeclarationInventory {
  readonly contractId: string;
  readonly rows: readonly NativeDeclarationInventoryRow[];
}

export interface PublishedContractAsset {
  readonly relativePath: string;
  readonly bytes: Uint8Array;
  readonly digest: Sha256Digest;
}

export interface Ds1PublicationFoundation {
  readonly rows: readonly PublicContractRow[];
  readonly generatedAssets: readonly PublishedContractAsset[];
}

interface NativeContractDefinition {
  readonly contractId: string;
  readonly packageExport: string;
  readonly symbols: readonly string[];
  readonly capabilityRefs: readonly string[];
}

interface SchemaContractDefinition {
  readonly contractId: string;
  readonly relativePath: string;
  readonly nativeType: string;
  readonly capabilityRefs: readonly string[];
}

export interface CapabilityContractDefinition {
  readonly capabilityId: string;
  readonly requiredContractIds: readonly string[];
  readonly dependentCapabilityIds: readonly string[];
  readonly effectRefs: readonly string[];
  readonly boundedProofRefs: readonly string[];
}

export interface Ds1CapabilityDefinitionGraph {
  readonly kind: "abg_capability_definition_graph";
  readonly graphId: string;
  readonly graphVersion: string;
  readonly graphDigest: Sha256Digest;
  readonly definitions: readonly CapabilityContractDefinition[];
}

const NATIVE_CONTRACTS = Object.freeze([
  {
    contractId: "abg.contract.gtl.m01",
    packageExport: `${PACKAGE_NAME}/gtl/m01`,
    symbols: Object.freeze([
      "Graph",
      "Node",
      "GraphVector",
      "Context",
      "Operator",
      "Evaluator",
      "Rule",
      "GraphFunction",
      "admitGraphFunction",
      "serializeGraphFunction",
      "admitCProgramSyntax",
      "serializeCProgramCanonical"
    ]),
    capabilityRefs: Object.freeze([
      "abg.capability.gtl.declare@5",
      "abg.capability.gtl.admit@5",
      "abg.capability.gtl.serialize@5"
    ])
  },
  {
    contractId: "abg.contract.gtl.m02",
    packageExport: `${PACKAGE_NAME}/gtl/m02`,
    symbols: Object.freeze([
      "Module",
      "GraphFunctionHandleBinding",
      "ModuleLookupAuthority",
      "SemanticJobBinding",
      "admitModule",
      "serializeModule",
      "constructModuleLookupAuthority",
      "resolvePublishedGraphFunction",
      "resolveSemanticJobForGraphFunction"
    ]),
    capabilityRefs: Object.freeze(["abg.capability.module.publish@5"])
  },
  {
    contractId: "abg.contract.gtl.requirements",
    packageExport: `${PACKAGE_NAME}/gtl/requirements`,
    symbols: Object.freeze([
      "GtlRequirementDeclaration",
      "GtlRequirementRelationDeclaration",
      "declareRequirement",
      "declareRequirementRelation"
    ]),
    capabilityRefs: Object.freeze([])
  },
  {
    contractId: "abg.contract.abg.requirements",
    packageExport: `${PACKAGE_NAME}/abg/requirements`,
    symbols: Object.freeze([
      "RequirementProjection",
      "RequirementGraphProjection",
      "projectRequirementGraph",
      "queryRequirementReadModel"
    ]),
    capabilityRefs: Object.freeze([])
  },
  {
    contractId: "abg.contract.abg.executive",
    packageExport: `${PACKAGE_NAME}/abg/executive`,
    symbols: Object.freeze([
      "ExecutiveObservationView",
      "ExecutivePressureFactProjection",
      "projectExecutiveObservationView",
      "projectExecutivePressureFacts"
    ]),
    capabilityRefs: Object.freeze([])
  },
  {
    contractId: "abg.contract.abg.m03",
    packageExport: `${PACKAGE_NAME}/abg/m03`,
    symbols: Object.freeze([
      "RuntimeEvent",
      "CanonicalRuntimeEvent",
      "RUNTIME_EVENT_KIND_VALUES",
      "GtlProgramDiagnosticId",
      "GTL_PROGRAM_DIAGNOSTIC_ID_VALUES",
      "GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES",
      "GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS",
      "FhInteractionProjection",
      "FH_PUBLIC_OPERATION_ID_VALUES",
      "openFhInteraction",
      "projectFhInteraction",
      "submitFhInteractionResponse",
      "admitFhInteractionResume",
      "admitGtlProgramConformanceInput",
      "typecheckGtlProgram"
    ]),
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.contribute@5",
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.runtime.execute-seven-term-c@5"
    ])
  },
  {
    contractId: "abg.contract.abg.transport",
    packageExport: `${PACKAGE_NAME}/abg/m03/transport`,
    symbols: Object.freeze([
      "DispatchRequest",
      "ResultArtifact",
      "admitDispatchRequest",
      "admitResultArtifact"
    ]),
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.invoke-graph-function@5"
    ])
  },
  {
    contractId: "abg.contract.app.m04",
    packageExport: `${PACKAGE_NAME}/app/m04`,
    symbols: Object.freeze([
      "AbiogenesisPublicSdk",
      "Ds1PublicOperationContractMap",
      "PublicOperationInvocationEnvelope",
      "HostInvocationDescriptor",
      "ProductToolchainManifest",
      "PublicContractCatalog",
      "AbgTypescriptInstallManifest",
      "deriveInstallManifest",
      "AbgTypescriptInstallerManifest",
      "constructAbgTypescriptInstallerManifest"
    ]),
    capabilityRefs: Object.freeze([
      "abg.capability.catalog.contribute@5",
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.install.bind-products@5"
    ])
  },
  {
    contractId: "abg.contract.qualification.m05",
    packageExport: `${PACKAGE_NAME}/qualification/m05`,
    symbols: Object.freeze([
      "ReleaseSnapshotManifest",
      "ReleaseSnapshotOutcome",
      "constructReleaseSnapshotManifest"
    ]),
    capabilityRefs: Object.freeze([])
  }
] as const satisfies readonly NativeContractDefinition[]);

const SCHEMA_CONTRACT_ROWS = Object.freeze([
  ["abg.schema.product-toolchain-manifest", "product-toolchain-manifest.schema.json", "ProductToolchainManifest"],
  ["abg.schema.public-contract-catalog", "public-contract-catalog.schema.json", "PublicContractCatalog"],
  ["abg.schema.public-operation-contract", "public-operation-contract.schema.json", "PublicOperationDefinitionAsset"],
  ["abg.schema.native-contract-inventory", "native-contract-inventory.schema.json", "PublishedNativeContractInventory"],
  ["abg.schema.capability-contract", "capability-contract.schema.json", "PublishedCapabilityContract"],
  ["abg.schema.closed-vocabulary", "closed-vocabulary.schema.json", "PublishedClosedVocabulary"],
  ["abg.schema.gtl-graph-function", "gtl-graph-function.schema.json", "GraphFunction"],
  ["abg.schema.gtl-module", "gtl-module.schema.json", "Module"],
  ["abg.schema.catalog-product-descriptor", "catalog-product-descriptor.schema.json", "CatalogProductDescriptor"],
  ["abg.schema.catalog-contribution-manifest", "catalog-contribution-manifest.schema.json", "CatalogContributionManifest"],
  ["abg.schema.resolved-product-lock", "resolved-product-lock.schema.json", "ResolvedProductLock"],
  ["abg.schema.workspace-manifest", "workspace-manifest.schema.json", "WorkspaceManifest"],
  ["abg.schema.workspace-binding", "workspace-binding.schema.json", "ToolchainWorkspaceBindingV3"],
  ["abg.schema.install-manifest", "install-manifest.schema.json", "AbgTypescriptInstallManifest"],
  ["abg.schema.installer-manifest", "installer-manifest.schema.json", "AbgTypescriptInstallerManifest"],
  ["abg.schema.catalog-admission", "catalog-admission.schema.json", "PublicCatalogAdmission"],
  ["abg.schema.public-catalog-row", "public-catalog-row.schema.json", "PublicCatalogRow"],
  ["abg.schema.public-catalog-description", "public-catalog-description.schema.json", "PublicCatalogDescription"],
  ["abg.schema.public-session-catalog-view", "public-session-catalog-view.schema.json", "PublicSessionCatalogView"],
  ["abg.schema.public-operation-invocation", "public-operation-invocation.schema.json", "AnyPublicOperationInvocationEnvelope"],
  ["abg.schema.host-invocation", "host-invocation.schema.json", "HostInvocationDescriptor"],
  ["abg.schema.runtime-event", "runtime-event.schema.json", "CanonicalRuntimeEvent"],
  ["abg.schema.runtime-result", "runtime-result.schema.json", "PublicResultProjection"],
  ["abg.schema.runtime-replay", "runtime-replay.schema.json", "PublicReplayProjection"],
  ["abg.schema.fh-interaction", "fh-interaction.schema.json", "PublicFhInteractionProjection"],
  ["abg.schema.tenant-conformance-manifest", "tenant-conformance-manifest.schema.json", "TenantConformanceManifest"]
] satisfies readonly (readonly [string, string, string])[]);

const SCHEMA_CONTRACTS: readonly SchemaContractDefinition[] = Object.freeze(
  SCHEMA_CONTRACT_ROWS.map(([contractId, filename, nativeType]) => ({
  contractId,
  relativePath: `contracts/schemas/${filename}`,
  nativeType,
  capabilityRefs: Object.freeze(
    contractId === "abg.schema.gtl-graph-function"
      ? [
          "abg.capability.gtl.declare@5",
          "abg.capability.gtl.admit@5",
          "abg.capability.gtl.serialize@5"
        ]
      : contractId === "abg.schema.gtl-module"
        ? ["abg.capability.module.publish@5"]
        : contractId === "abg.schema.catalog-product-descriptor" ||
            contractId === "abg.schema.catalog-contribution-manifest" ||
            contractId === "abg.schema.catalog-admission"
          ? ["abg.capability.catalog.contribute@5"]
          : contractId === "abg.schema.host-invocation"
            ? ["abg.capability.catalog.invoke-graph-function@5"]
            : contractId === "abg.schema.resolved-product-lock" ||
                  contractId === "abg.schema.workspace-binding" ||
                  contractId === "abg.schema.install-manifest"
                ? ["abg.capability.install.bind-products@5"]
                : []
  )
  }))
);

const CAPABILITY_CONTRACTS = Object.freeze([
  {
    capabilityId: "abg.capability.gtl.declare@5",
    requiredContractIds: Object.freeze([
      "abg.contract.gtl.m01",
      "abg.schema.gtl-graph-function"
    ]),
    dependentCapabilityIds: Object.freeze([]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze(["proof://t220/declaration-law"])
  },
  {
    capabilityId: "abg.capability.gtl.admit@5",
    requiredContractIds: Object.freeze([
      "abg.contract.gtl.m01",
      "abg.schema.gtl-graph-function"
    ]),
    dependentCapabilityIds: Object.freeze([
      "abg.capability.gtl.declare@5"
    ]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze(["proof://t220/declaration-law"])
  },
  {
    capabilityId: "abg.capability.gtl.serialize@5",
    requiredContractIds: Object.freeze([
      "abg.contract.gtl.m01",
      "abg.schema.gtl-graph-function"
    ]),
    dependentCapabilityIds: Object.freeze([
      "abg.capability.gtl.declare@5",
      "abg.capability.gtl.admit@5"
    ]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze(["proof://t220/declaration-law"])
  },
  {
    capabilityId: "abg.capability.module.publish@5",
    requiredContractIds: Object.freeze([
      "abg.contract.gtl.m02",
      "abg.schema.gtl-module"
    ]),
    dependentCapabilityIds: Object.freeze([
      "abg.capability.gtl.admit@5",
      "abg.capability.gtl.serialize@5"
    ]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze([
      "proof://t263/strict-raw-module-admission"
    ])
  },
  {
    capabilityId: "abg.capability.catalog.contribute@5",
    requiredContractIds: Object.freeze([
      "abg.schema.catalog-product-descriptor",
      "abg.schema.catalog-contribution-manifest",
      "abg.schema.catalog-admission",
      "abg.operation.catalog.admit"
    ]),
    dependentCapabilityIds: Object.freeze([]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze([
      "proof://t223/public-contract-publication"
    ])
  },
  {
    capabilityId: "abg.capability.catalog.invoke-graph-function@5",
    requiredContractIds: Object.freeze([
      "abg.operation.catalog.view",
      "abg.operation.run.invoke",
      "abg.schema.host-invocation",
      "abg.contract.abg.m03"
    ]),
    dependentCapabilityIds: Object.freeze([
      "abg.capability.gtl.admit@5",
      "abg.capability.module.publish@5"
    ]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze([
      "proof://t270/direct-fd-sunny-execution"
    ])
  },
  {
    capabilityId: "abg.capability.install.bind-products@5",
    requiredContractIds: Object.freeze([
      "abg.operation.product.resolve",
      "abg.operation.product.verify",
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
      "abg.schema.resolved-product-lock",
      "abg.schema.install-manifest",
      "abg.schema.workspace-binding"
    ]),
    dependentCapabilityIds: Object.freeze([]),
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze([
      "proof://t223/product-intake",
      "proof://t281/prebinding-owner-handlers"
    ])
  },
  {
    capabilityId: "abg.capability.runtime.execute-seven-term-c@5",
    requiredContractIds: Object.freeze([
      "abg.contract.abg.m03",
      "abg.operation.run.invoke",
      "abg.schema.runtime-event",
      "abg.schema.runtime-result",
      "abg.schema.runtime-replay"
    ]),
    dependentCapabilityIds: Object.freeze([
      "abg.capability.gtl.admit@5",
      "abg.capability.catalog.invoke-graph-function@5"
    ]),
    // Engine interpretation support is not a GraphFunction-declared effect.
    // A graph contributes effect bindings only when its own effects[] says so.
    effectRefs: Object.freeze([]),
    boundedProofRefs: Object.freeze([
      "proof://t271/complete-c-program-interpreter",
      "proof://t270/direct-fd-sunny-execution"
    ])
  }
] as const satisfies readonly CapabilityContractDefinition[]);

const CAPABILITY_DEFINITION_GRAPH_ID =
  "capability-definition-graph://abiogenesis/abg-5";
const CAPABILITY_DEFINITION_GRAPH_VERSION = "5.0.0";

const RUNTIME_EVENT_VOCABULARY_ID = "abg.vocabulary.runtime-event-kind";
const RUNTIME_EVENT_VOCABULARY_PATH =
  "contracts/vocabularies/runtime-event-kind.json";

function sha256Bytes(bytes: Uint8Array): Sha256Digest {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalBytes(input: unknown): Uint8Array {
  return new TextEncoder().encode(canonicalizeIJson(input));
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function assertUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new TypeError(`${label}: duplicate ${value}`);
    }
    seen.add(value);
  }
}

function ds1CapabilityDefinitionGraph(): Ds1CapabilityDefinitionGraph {
  assertUnique(
    CAPABILITY_CONTRACTS.map((definition) => definition.capabilityId),
    "DS1 capability definition graph identities"
  );
  const capabilityIds = new Set<string>(
    CAPABILITY_CONTRACTS.map((definition) => definition.capabilityId)
  );
  const effectRefs: string[] = [];
  for (const definition of CAPABILITY_CONTRACTS) {
    assertUnique(
      definition.requiredContractIds,
      `${definition.capabilityId}.requiredContractIds`
    );
    assertUnique(
      definition.dependentCapabilityIds,
      `${definition.capabilityId}.dependentCapabilityIds`
    );
    assertUnique(definition.effectRefs, `${definition.capabilityId}.effectRefs`);
    assertUnique(
      definition.boundedProofRefs,
      `${definition.capabilityId}.boundedProofRefs`
    );
    for (const dependencyId of definition.dependentCapabilityIds) {
      if (!capabilityIds.has(dependencyId)) {
        throw new TypeError(
          `${definition.capabilityId}: unknown dependent capability ${dependencyId}`
        );
      }
    }
    effectRefs.push(...definition.effectRefs);
  }
  assertUnique(effectRefs, "DS1 capability definition graph effect refs");
  const definitions = Object.freeze([...CAPABILITY_CONTRACTS]);
  const semanticDefinitions = Object.freeze(definitions.map((definition) =>
    Object.freeze({
      capabilityId: definition.capabilityId,
      requiredContractIds: definition.requiredContractIds,
      dependentCapabilityIds: definition.dependentCapabilityIds,
      effectRefs: definition.effectRefs
    })
  ));
  const basis = Object.freeze({
    kind: "abg_capability_definition_graph" as const,
    graphId: CAPABILITY_DEFINITION_GRAPH_ID,
    graphVersion: CAPABILITY_DEFINITION_GRAPH_VERSION,
    definitions: semanticDefinitions
  });
  return Object.freeze({
    kind: basis.kind,
    graphId: basis.graphId,
    graphVersion: basis.graphVersion,
    definitions,
    graphDigest: sha256Bytes(canonicalBytes(basis))
  });
}

function isIJsonArray(value: IJsonValue): value is IJsonArray {
  return Array.isArray(value);
}

function iJsonObject(value: IJsonValue, label: string): IJsonObject {
  if (value === null || typeof value !== "object" || isIJsonArray(value)) {
    throw new TypeError(`${label}: expected an I-JSON object`);
  }
  return value;
}

function assertSchemaAssetIdentity(
  asset: Ds1StaticContractAssetDefinition
): void {
  if (asset.mediaType !== "application/schema+json") {
    return;
  }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(asset.bytes);
  const value = iJsonObject(admitIJsonText(decoded, asset.relativePath), asset.relativePath);
  if (value["$id"] !== asset.contractId) {
    throw new TypeError(`${asset.relativePath}: $id must equal ${asset.contractId}`);
  }
  if (
    value["$schema"] !== "http://json-schema.org/draft-07/schema#" &&
    value["$schema"] !== "https://json-schema.org/draft/2020-12/schema"
  ) {
    throw new TypeError(`${asset.relativePath}: unsupported JSON Schema dialect`);
  }
}

export function admitDs1StaticContractAsset(
  asset: Ds1StaticContractAssetDefinition
): Ds1StaticContractAssetDefinition {
  const contractId = nonEmptyString(
    asset.contractId,
    "static contract asset contractId"
  );
  const admittedPath = relativePath(
    asset.relativePath,
    `static contract asset ${contractId}`
  );
  if (
    asset.mediaType !== "application/schema+json" &&
    asset.mediaType !== "application/json"
  ) {
    throw new TypeError(`${admittedPath}: unsupported static contract media type`);
  }
  const bytes = new Uint8Array(asset.bytes);
  const admitted = Object.freeze({
    contractId,
    relativePath: admittedPath,
    mediaType: asset.mediaType,
    bytes
  });
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  admitIJsonText(decoded, admittedPath);
  assertSchemaAssetIdentity(admitted);
  return admitted;
}

function staticAssetMap(
  assets: readonly Ds1StaticContractAssetDefinition[]
): ReadonlyMap<string, Ds1StaticContractAssetDefinition> {
  const byId = new Map<string, Ds1StaticContractAssetDefinition>();
  const paths = new Set<string>();
  for (const rawAsset of assets) {
    const asset = admitDs1StaticContractAsset(rawAsset);
    if (byId.has(asset.contractId)) {
      throw new TypeError(`static contract assets: duplicate ${asset.contractId}`);
    }
    if (paths.has(asset.relativePath)) {
      throw new TypeError(`static contract assets: duplicate path ${asset.relativePath}`);
    }
    byId.set(asset.contractId, asset);
    paths.add(asset.relativePath);
  }
  return byId;
}

function nativeInventoryMap(
  inventories: readonly Ds1NativeDeclarationInventory[]
): ReadonlyMap<string, Ds1NativeDeclarationInventory> {
  const byId = new Map<string, Ds1NativeDeclarationInventory>();
  for (const inventory of inventories) {
    nonEmptyString(inventory.contractId, "native inventory contractId");
    if (byId.has(inventory.contractId)) {
      throw new TypeError(`native inventories: duplicate ${inventory.contractId}`);
    }
    if (inventory.rows.length === 0) {
      throw new TypeError(`native inventories: ${inventory.contractId} is empty`);
    }
    assertUnique(
      inventory.rows.map(
        (row) => `${row.packageExport}\u0000${row.declarationPath}`
      ),
      `native inventories: ${inventory.contractId}`
    );
    for (const [index, row] of inventory.rows.entries()) {
      nonEmptyString(
        row.packageExport,
        `native inventories: ${inventory.contractId}[${String(index)}].packageExport`
      );
      relativePath(
        row.declarationPath,
        `native inventories: ${inventory.contractId}[${String(index)}].declarationPath`
      );
      admitDigest(
        row.declarationDigest,
        `native inventories: ${inventory.contractId}[${String(index)}].declarationDigest`
      );
    }
    byId.set(inventory.contractId, inventory);
  }
  return byId;
}

function nativeInventoryAsset(
  definition: NativeContractDefinition,
  inventory: Ds1NativeDeclarationInventory
): PublishedContractAsset {
  const tuples: NativeContractInventoryTuple[] = inventory.rows
    .map((row) => {
      if (row.packageExport !== definition.packageExport) {
        throw new TypeError(
          `${definition.contractId}: inventory package export mismatch`
        );
      }
      const tuple: NativeContractInventoryTuple = Object.freeze([
        row.packageExport,
        row.declarationPath,
        row.declarationDigest
      ]);
      return tuple;
    })
    .sort((left, right) =>
      compareText(`${left[0]}\u0000${left[1]}`, `${right[0]}\u0000${right[1]}`)
    );
  const bytes = canonicalBytes(tuples);
  return Object.freeze({
    relativePath: `contracts/native/${definition.contractId}.inventory.json`,
    bytes,
    digest: sha256Bytes(bytes)
  });
}

function nativeRow(
  definition: NativeContractDefinition,
  inventoryAsset: PublishedContractAsset
): PublicContractRow {
  return Object.freeze({
    contractId: definition.contractId,
    contractKind: "native_contract",
    owningProductId: PRODUCT_ID,
    version: CONTRACT_VERSION,
    digest: inventoryAsset.digest,
    authorityRefs: Object.freeze([
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
    ]),
    capabilityRefs: definition.capabilityRefs,
    nativeLocator: Object.freeze({
      kind: "native",
      packageName: PACKAGE_NAME,
      packageExport: definition.packageExport,
      symbols: definition.symbols
    }),
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: inventoryAsset.relativePath,
      schemaId: "abg.schema.native-contract-inventory",
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/json",
      digest: inventoryAsset.digest
    }),
    operationContract: null
  });
}

function schemaNativeLocator(
  definition: SchemaContractDefinition
): NativeContractLocator | null {
  return (
    definition.contractId === "abg.schema.gtl-graph-function"
      ? Object.freeze({
          kind: "native",
          packageName: PACKAGE_NAME,
          packageExport: `${PACKAGE_NAME}/gtl/m01`,
          symbols: Object.freeze(["admitGraphFunction", "serializeGraphFunction"])
        })
      : definition.contractId === "abg.schema.gtl-module"
        ? Object.freeze({
            kind: "native",
            packageName: PACKAGE_NAME,
            packageExport: `${PACKAGE_NAME}/gtl/m02`,
            symbols: Object.freeze(["admitModule", "serializeModule"])
          })
        : definition.contractId === "abg.schema.install-manifest"
          ? Object.freeze({
              kind: "native",
              packageName: PACKAGE_NAME,
              packageExport: `${PACKAGE_NAME}/app/m04`,
              symbols: Object.freeze([
                "AbgTypescriptInstallManifest",
                "deriveInstallManifest"
              ])
            })
          : definition.contractId === "abg.schema.installer-manifest"
            ? Object.freeze({
                kind: "native",
                packageName: PACKAGE_NAME,
                packageExport: `${PACKAGE_NAME}/app/m04`,
                symbols: Object.freeze([
                  "AbgTypescriptInstallerManifest",
                  "constructAbgTypescriptInstallerManifest"
                ])
              })
            : null
  );
}

function schemaRow(
  definition: SchemaContractDefinition,
  asset: Ds1StaticContractAssetDefinition
): PublicContractRow {
  if (asset.relativePath !== definition.relativePath) {
    throw new TypeError(
      `${definition.contractId}: expected ${definition.relativePath}, got ${asset.relativePath}`
    );
  }
  if (asset.mediaType !== "application/schema+json") {
    throw new TypeError(`${definition.contractId}: expected application/schema+json`);
  }
  const assetDigest = sha256Bytes(asset.bytes);
  return Object.freeze({
    contractId: definition.contractId,
    contractKind: "schema_asset",
    owningProductId: PRODUCT_ID,
    version: CONTRACT_VERSION,
    digest: assetDigest,
    authorityRefs: Object.freeze([
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
    ]),
    capabilityRefs: definition.capabilityRefs,
    nativeLocator: schemaNativeLocator(definition),
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: definition.relativePath,
      schemaId: definition.contractId,
      schemaVersion: CONTRACT_VERSION,
      mediaType: asset.mediaType,
      digest: assetDigest
    }),
    operationContract: null
  });
}

function capabilityAsset(
  definition: CapabilityContractDefinition
): PublishedContractAsset {
  const contract: PublishedCapabilityContract = Object.freeze({
    capabilityId: definition.capabilityId,
    dependentCapabilityIds: definition.dependentCapabilityIds,
    effectRefs: definition.effectRefs,
    kind: "abg_capability_contract",
    requiredContractIds: definition.requiredContractIds,
    schemaVersion: 1
  });
  const bytes = canonicalBytes(contract);
  return Object.freeze({
    relativePath: `contracts/capabilities/${definition.capabilityId}.json`,
    bytes,
    digest: sha256Bytes(bytes)
  });
}

function capabilityRow(
  definition: CapabilityContractDefinition,
  asset: PublishedContractAsset
): PublicContractRow {
  return Object.freeze({
    contractId: definition.capabilityId,
    contractKind: "capability",
    owningProductId: PRODUCT_ID,
    version: "5.0.0",
    digest: asset.digest,
    authorityRefs: Object.freeze([
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
    ]),
    capabilityRefs: Object.freeze([definition.capabilityId]),
    nativeLocator: null,
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: asset.relativePath,
      schemaId: "abg.schema.capability-contract",
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/json",
      digest: asset.digest
    }),
    operationContract: null
  });
}

function runtimeEventVocabularyRow(
  asset: Ds1StaticContractAssetDefinition
): PublicContractRow {
  if (asset.relativePath !== RUNTIME_EVENT_VOCABULARY_PATH) {
    throw new TypeError(
      `${RUNTIME_EVENT_VOCABULARY_ID}: expected ${RUNTIME_EVENT_VOCABULARY_PATH}`
    );
  }
  const value = iJsonObject(
    admitIJsonText(
      new TextDecoder("utf-8", { fatal: true }).decode(asset.bytes),
      asset.relativePath
    ),
    asset.relativePath
  );
  const expectedVocabulary: PublishedClosedVocabulary = Object.freeze({
    kind: "abg_closed_vocabulary",
    schemaVersion: 1,
    vocabularyId: RUNTIME_EVENT_VOCABULARY_ID,
    values: RUNTIME_EVENT_KIND_VALUES
  });
  if (canonicalizeIJson(value) !== canonicalizeIJson(expectedVocabulary)) {
    throw new TypeError(
      `${RUNTIME_EVENT_VOCABULARY_ID}: vocabulary does not equal the native event-kind roster`
    );
  }
  const assetDigest = sha256Bytes(asset.bytes);
  return Object.freeze({
    contractId: RUNTIME_EVENT_VOCABULARY_ID,
    contractKind: "vocabulary_asset",
    owningProductId: PRODUCT_ID,
    version: CONTRACT_VERSION,
    digest: assetDigest,
    authorityRefs: Object.freeze([
      "specification/requirements/abg/REQ-R-ABG3-EVENTS.md",
      "specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md"
    ]),
    capabilityRefs: Object.freeze([]),
    nativeLocator: Object.freeze({
      kind: "native",
      packageName: PACKAGE_NAME,
      packageExport: `${PACKAGE_NAME}/abg/m03`,
      symbols: Object.freeze(["RUNTIME_EVENT_KIND_VALUES"])
    }),
    assetLocator: Object.freeze({
      kind: "asset",
      relativePath: asset.relativePath,
      schemaId: "abg.schema.closed-vocabulary",
      schemaVersion: CONTRACT_VERSION,
      mediaType: "application/json",
      digest: assetDigest
    }),
    operationContract: null
  });
}

export const DS1_BASELINE_SCHEMA_ASSET_REGISTER = Object.freeze(
  SCHEMA_CONTRACTS.map((definition) =>
    Object.freeze({
      contractId: definition.contractId,
      relativePath: definition.relativePath,
      nativeType: definition.nativeType
    })
  )
);

export const DS1_NATIVE_CONTRACT_REGISTER = NATIVE_CONTRACTS;
export const DS1_CAPABILITY_CONTRACT_REGISTER = CAPABILITY_CONTRACTS;
export const DS1_CAPABILITY_DEFINITION_GRAPH =
  ds1CapabilityDefinitionGraph();

export function buildDs1PublicationFoundation(input: {
  readonly staticAssets: readonly Ds1StaticContractAssetDefinition[];
  readonly nativeInventories: readonly Ds1NativeDeclarationInventory[];
}): Ds1PublicationFoundation {
  const assets = staticAssetMap(input.staticAssets);
  const inventories = nativeInventoryMap(input.nativeInventories);
  const generatedAssets: PublishedContractAsset[] = [];
  const rows: PublicContractRow[] = [];

  for (const definition of NATIVE_CONTRACTS) {
    const inventory = inventories.get(definition.contractId);
    if (inventory === undefined) {
      throw new TypeError(`native inventories: missing ${definition.contractId}`);
    }
    const asset = nativeInventoryAsset(definition, inventory);
    generatedAssets.push(asset);
    rows.push(nativeRow(definition, asset));
  }
  for (const definition of SCHEMA_CONTRACTS) {
    const asset = assets.get(definition.contractId);
    if (asset === undefined) {
      throw new TypeError(`static contract assets: missing ${definition.contractId}`);
    }
    rows.push(schemaRow(definition, asset));
  }
  const vocabularyAsset = assets.get(RUNTIME_EVENT_VOCABULARY_ID);
  if (vocabularyAsset === undefined) {
    throw new TypeError(`static contract assets: missing ${RUNTIME_EVENT_VOCABULARY_ID}`);
  }
  rows.push(runtimeEventVocabularyRow(vocabularyAsset));

  for (const definition of CAPABILITY_CONTRACTS) {
    const asset = capabilityAsset(definition);
    generatedAssets.push(asset);
    rows.push(capabilityRow(definition, asset));
  }

  const expectedStaticIds = new Set([
    ...SCHEMA_CONTRACTS.map((definition) => definition.contractId),
    RUNTIME_EVENT_VOCABULARY_ID
  ]);
  const unexpectedStaticIds = [...assets.keys()].filter(
    (contractId) => !expectedStaticIds.has(contractId)
  );
  if (unexpectedStaticIds.length > 0) {
    throw new TypeError(
      `static contract assets: unexpected ${unexpectedStaticIds.sort(compareText).join(", ")}`
    );
  }
  const unexpectedInventoryIds = [...inventories.keys()].filter(
    (contractId) =>
      !NATIVE_CONTRACTS.some((definition) => definition.contractId === contractId)
  );
  if (unexpectedInventoryIds.length > 0) {
    throw new TypeError(
      `native inventories: unexpected ${unexpectedInventoryIds.sort(compareText).join(", ")}`
    );
  }

  rows.sort((left, right) => compareText(left.contractId, right.contractId));
  generatedAssets.sort((left, right) =>
    compareText(left.relativePath, right.relativePath)
  );
  return Object.freeze({
    rows: Object.freeze(rows),
    generatedAssets: Object.freeze(generatedAssets)
  });
}

export function staticContractAssetFromText(input: {
  readonly contractId: string;
  readonly relativePath: string;
  readonly mediaType: "application/schema+json" | "application/json";
  readonly text: string;
}): Ds1StaticContractAssetDefinition {
  return admitDs1StaticContractAsset({
    contractId: input.contractId,
    relativePath: input.relativePath,
    mediaType: input.mediaType,
    bytes: new TextEncoder().encode(input.text)
  });
}

export function publicContractAssetDigest(bytes: Uint8Array): Sha256Digest {
  return sha256Bytes(bytes);
}
