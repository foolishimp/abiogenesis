// Implements: T-223 DS-1 M03 runtime-catalog slice
// Implements: REQ-P-CATALOG-006..008, REQ-P-CATALOG-016..017, REQ-P-CATALOG-023..025

import type { GraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import { materializeNodeType } from "../../../gtl/m01/algebra/core.js";
import { admitModule } from "../../../gtl/m02/admission/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  constructModuleLookupAuthority,
  resolvePublishedGraphFunction
} from "../../../gtl/m02/contracts/lookup.js";
import type {
  GtlLibraryEntryDeclaration,
  ProductRegistryStartupConfig
} from "../../../gtl/m02/contracts/runtime_registry.js";
import {
  deriveRegistrySessionViewRef,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext
} from "../events/emit.js";
import type { RuntimeEventSink } from "../events/emit.js";
import {
  codepointCompare,
  detachRowSnapshot,
  isPlainRecord,
  sortReplayByAdmissionOrdinalFailClosed
} from "./admission_hygiene.js";
import type {
  CanonicalRuntimeEvent,
  CatalogAssetAdmittedRuntimeEvent,
  CatalogAssetRejectedRuntimeEvent,
  CatalogAssetRejectionReason,
  RegistryEntryRejectedRuntimeEvent,
  RuntimeEvent
} from "./carriers.js";
import {
  assertCanonicalRuntimeEventSequence
} from "./event_admission.js";
import {
  admitGtlLibraryEntryDeclaration,
  deriveRuntimeRegistryProjectionRef,
  projectRuntimeGraphFunctionRegistry
} from "./runtime_graph_function_registry.js";
import type {
  RegistryAdmissionEvent,
  RuntimeRegistryEntryProjection,
  RuntimeRegistryProjection
} from "./runtime_graph_function_registry.js";

export const PUBLIC_RUNTIME_CATALOG_KIND_VALUES = Object.freeze([
  "graph_function",
  "node_type",
  "overlay"
] as const);

export type PublicRuntimeCatalogKind =
  (typeof PUBLIC_RUNTIME_CATALOG_KIND_VALUES)[number];

export interface OpaqueCatalogAssetDeclaration {
  readonly kind: "opaque_catalog_asset_declaration";
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly assetKind: "overlay";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly resolvedLockRef: string;
  readonly assetPath: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: string;
  readonly assetDigest: string;
  readonly authorityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export interface RuntimeLibraryCatalogAdmissionDeclaration {
  readonly kind: "runtime_library_entry";
  readonly declaration: GtlLibraryEntryDeclaration;
  readonly moduleRef: string;
  readonly module: Module;
}

export interface OpaqueCatalogAdmissionDeclaration {
  readonly kind: "opaque_catalog_asset";
  readonly declaration: OpaqueCatalogAssetDeclaration;
}

export type CatalogAdmissionDeclaration =
  | RuntimeLibraryCatalogAdmissionDeclaration
  | OpaqueCatalogAdmissionDeclaration;

export interface BoundCatalogProductBatch {
  readonly kind: "bound_catalog_product_batch";
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly productStartupConfig: ProductRegistryStartupConfig;
  readonly declarations: readonly CatalogAdmissionDeclaration[];
}

export interface BoundCatalogAdmissionBatch {
  readonly kind: "bound_catalog_admission_batch";
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly resolvedLockRef: string;
  readonly systemDeclarations: readonly RuntimeLibraryCatalogAdmissionDeclaration[];
  readonly orderedProductBatches: readonly BoundCatalogProductBatch[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

export type CatalogAssetAdmissionEvent =
  | CatalogAssetAdmittedRuntimeEvent
  | CatalogAssetRejectedRuntimeEvent;

export type CatalogAdmissionEvent =
  | RegistryAdmissionEvent
  | CatalogAssetAdmissionEvent;

export type CanonicalCatalogAdmissionEvent =
  CanonicalRuntimeEvent & CatalogAdmissionEvent;

export interface OpaqueCatalogAssetProjection {
  readonly kind: "opaque_catalog_asset_projection";
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly assetKind: "overlay";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly resolvedLockRef: string;
  readonly assetPath: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: string;
  readonly assetDigest: string;
  readonly authorityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly sourceEventRefs: readonly string[];
}

export interface RejectedOpaqueCatalogAssetProjection {
  readonly kind: "rejected_opaque_catalog_asset_projection";
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly assetKind: "overlay";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly descriptorRef: string;
  readonly contributionManifestRef: string;
  readonly resolvedLockRef: string;
  readonly assetPath: string;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: string;
  readonly assetDigest: string;
  readonly authorityRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly refinementOfEntryRef: string | null;
  readonly overrideOfEntryRef: string | null;
  readonly rejectionReason: CatalogAssetRejectionReason;
  readonly conflictingEntryRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
}

export interface RuntimeCatalogProjection {
  readonly kind: "runtime_catalog_projection";
  readonly projectionRef: string;
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly runtimeRegistryProjection: RuntimeRegistryProjection;
  readonly opaqueAssetEntries: readonly OpaqueCatalogAssetProjection[];
  readonly rejectedOpaqueAssetEntries: readonly RejectedOpaqueCatalogAssetProjection[];
  readonly sourceEventRefs: readonly string[];
}

export interface CatalogExecutionBinding {
  readonly kind: "catalog_execution_binding";
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly resolvedLockRef: string;
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly declarationDigest: string;
  readonly libraryScope: "system" | "product";
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly descriptorRef: string | null;
  readonly contributionManifestRef: string | null;
  readonly moduleRef: string;
  readonly moduleName: string;
  readonly moduleDigest: string;
  readonly graphFunctionHandle: string;
  readonly graphFunctionId: string;
  readonly graphFunctionDigest: string;
  readonly declarationSourceRefs: readonly string[];
  readonly readinessRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
  readonly module: Module;
  readonly graphFunction: GraphFunction;
}

export interface CatalogDeclarationModuleBinding {
  readonly kind: "catalog_declaration_module_binding";
  readonly moduleRef: string;
  readonly moduleName: string;
  readonly moduleDigest: string;
  readonly sourceEntryRefs: readonly string[];
  readonly sourceDeclarationRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
  readonly invocationAuthority: false;
  readonly module: Module;
}

export interface AdmittedRuntimeCatalogBasis {
  readonly kind: "admitted_runtime_catalog_basis";
  readonly basisRef: string;
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly resolvedLockRef: string;
  readonly runtimeCatalogProjectionRef: string;
  readonly runtimeRegistryProjectionRef: string;
  readonly admissionEventRefs: readonly string[];
  readonly descriptorRefs: readonly string[];
  readonly contributionManifestRefs: readonly string[];
  readonly productStartupConfigRefs: readonly string[];
  readonly projection: RuntimeCatalogProjection;
  readonly executionBindings: readonly CatalogExecutionBinding[];
  readonly declarationModuleBindings: readonly CatalogDeclarationModuleBinding[];
}

export type CatalogRowDispositionKind =
  | "admitted"
  | "already_admitted_exact"
  | "rejected";

export type CatalogRowEntryKind = PublicRuntimeCatalogKind | "unsupported";

export interface CatalogRowDisposition {
  readonly kind: "catalog_row_disposition";
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly entryKind: CatalogRowEntryKind;
  readonly disposition: CatalogRowDispositionKind;
  readonly eventRef: string | null;
  readonly rejectionReason: string | null;
}

export interface CatalogAdmissionResult {
  readonly kind: "catalog_admission_result";
  readonly accepted: boolean;
  readonly admissionEvents: readonly CanonicalCatalogAdmissionEvent[];
  readonly rowDispositions: readonly CatalogRowDisposition[];
  readonly projection: RuntimeCatalogProjection;
  readonly basis: AdmittedRuntimeCatalogBasis | null;
  readonly admittedEntryRefs: readonly string[];
  readonly rejectedDeclarationRefs: readonly string[];
}

interface RegistrySessionEntryBase {
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly namespace: string;
  readonly ownerRef: string;
  readonly version: string;
  readonly ready: boolean;
  readonly readinessRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly sourceEventRefs: readonly string[];
}

export interface RegistrySessionGraphFunctionEntry
  extends RegistrySessionEntryBase {
  readonly kind: "registry_session_graph_function_entry";
  readonly entryKind: "graph_function";
  readonly callable: true;
  readonly graphFunctionRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
}

export interface RegistrySessionNodeTypeEntry extends RegistrySessionEntryBase {
  readonly kind: "registry_session_node_type_entry";
  readonly entryKind: "node_type";
  readonly callable: false;
  readonly nodeTypeRef: string;
  readonly interfaceRef: string;
  readonly sourceContractRef: string;
  readonly targetContractRef: string;
}

export interface RegistrySessionOverlayEntry extends RegistrySessionEntryBase {
  readonly kind: "registry_session_overlay_entry";
  readonly entryKind: "overlay";
  readonly callable: false;
  readonly schemaId: string;
  readonly schemaVersion: string;
  readonly schemaDigest: string;
  readonly assetDigest: string;
}

export type RegistrySessionEntry =
  | RegistrySessionGraphFunctionEntry
  | RegistrySessionNodeTypeEntry
  | RegistrySessionOverlayEntry;

export type RegistrySessionViewResidualReason =
  | "duplicate_handle"
  | "unknown_handle"
  | "inadmissible"
  | "unready";

export interface RegistrySessionViewResidual {
  readonly kind: "registry_session_view_residual";
  readonly entryRef: string;
  readonly reason: RegistrySessionViewResidualReason;
}

export interface RegistrySessionView {
  readonly kind: "registry_session_view";
  readonly sessionViewRef: string;
  readonly catalogId: string;
  readonly catalogProjectionRef: string;
  readonly allowedEntryRefs: readonly string[];
  readonly entries: readonly RegistrySessionEntry[];
}

export interface RegistrySessionViewResult {
  readonly kind: "registry_session_view_result";
  readonly accepted: boolean;
  readonly view: RegistrySessionView | null;
  readonly residuals: readonly RegistrySessionViewResidual[];
}

const OPAQUE_CATALOG_ASSET_DECLARATION_FIELDS = Object.freeze([
  "kind",
  "workspaceId",
  "bindingId",
  "catalogId",
  "entryRef",
  "declarationRef",
  "declarationDigest",
  "libraryScope",
  "assetKind",
  "namespace",
  "ownerRef",
  "version",
  "descriptorRef",
  "contributionManifestRef",
  "resolvedLockRef",
  "assetPath",
  "schemaId",
  "schemaVersion",
  "schemaDigest",
  "assetDigest",
  "authorityRefs",
  "provenanceRefs",
  "readinessRefs",
  "proofRefs",
  "policyRefs",
  "refinementOfEntryRef",
  "overrideOfEntryRef",
  "causationEventRefs",
  "correlationId"
] as const);

function admitNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function admitNullableString(value: unknown, label: string): string | null {
  if (value === null) {
    return null;
  }
  return admitNonEmptyString(value, label);
}

function admitDigest(value: unknown, label: string): string {
  const digest = admitNonEmptyString(value, label);
  if (!/^sha256:[0-9a-f]{64}$/u.test(digest)) {
    throw new TypeError(`${label} must be a lowercase sha256 digest`);
  }
  return digest;
}

function admitUniqueStringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array`);
  }
  const admitted: string[] = [];
  const seen = new Set<string>();
  for (const [index, candidate] of value.entries()) {
    const entry = admitNonEmptyString(candidate, `${label}[${index}]`);
    if (seen.has(entry)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(entry)}`);
    }
    seen.add(entry);
    admitted.push(entry);
  }
  return Object.freeze(admitted);
}

function admitLiteral<T extends string>(
  value: unknown,
  expected: T,
  label: string
): T {
  if (value !== expected) {
    throw new TypeError(`${label} must equal ${JSON.stringify(expected)}`);
  }
  return expected;
}

function admitLibraryScope(
  value: unknown,
  label: string
): "system" | "product" {
  if (value !== "system" && value !== "product") {
    throw new TypeError(`${label} must be system or product`);
  }
  return value;
}

function admitProductRelativePath(value: unknown, label: string): string {
  const assetPath = admitNonEmptyString(value, label);
  if (
    assetPath.startsWith("/") ||
    /^[A-Za-z]:/u.test(assetPath) ||
    assetPath.includes("\\") ||
    assetPath.split("/").some((part) => part.length === 0 || part === "." || part === "..")
  ) {
    throw new TypeError(`${label} must be a normalized product-relative path`);
  }
  return assetPath;
}

function assertExactFields(
  record: Readonly<Record<string, unknown>>,
  expected: readonly string[],
  label: string
): void {
  const expectedSet = new Set(expected);
  for (const field of expected) {
    if (!Object.hasOwn(record, field)) {
      throw new TypeError(`${label} is missing field ${JSON.stringify(field)}`);
    }
  }
  for (const field of Object.keys(record)) {
    if (!expectedSet.has(field)) {
      throw new TypeError(`${label} has unexpected field ${JSON.stringify(field)}`);
    }
  }
}

export function admitOpaqueCatalogAssetDeclaration(
  input: unknown,
  label = "OpaqueCatalogAssetDeclaration"
): OpaqueCatalogAssetDeclaration {
  const snapshot = detachRowSnapshot(input);
  if (!isPlainRecord(snapshot)) {
    throw new TypeError(`${label} must be a plain JSON object`);
  }
  assertExactFields(snapshot, OPAQUE_CATALOG_ASSET_DECLARATION_FIELDS, label);
  return Object.freeze({
    kind: admitLiteral(
      snapshot["kind"],
      "opaque_catalog_asset_declaration",
      `${label}.kind`
    ),
    workspaceId: admitNonEmptyString(snapshot["workspaceId"], `${label}.workspaceId`),
    bindingId: admitNonEmptyString(snapshot["bindingId"], `${label}.bindingId`),
    catalogId: admitNonEmptyString(snapshot["catalogId"], `${label}.catalogId`),
    entryRef: admitNonEmptyString(snapshot["entryRef"], `${label}.entryRef`),
    declarationRef: admitNonEmptyString(
      snapshot["declarationRef"],
      `${label}.declarationRef`
    ),
    declarationDigest: admitDigest(
      snapshot["declarationDigest"],
      `${label}.declarationDigest`
    ),
    libraryScope: admitLibraryScope(snapshot["libraryScope"], `${label}.libraryScope`),
    assetKind: admitLiteral(snapshot["assetKind"], "overlay", `${label}.assetKind`),
    namespace: admitNonEmptyString(snapshot["namespace"], `${label}.namespace`),
    ownerRef: admitNonEmptyString(snapshot["ownerRef"], `${label}.ownerRef`),
    version: admitNonEmptyString(snapshot["version"], `${label}.version`),
    descriptorRef: admitNonEmptyString(
      snapshot["descriptorRef"],
      `${label}.descriptorRef`
    ),
    contributionManifestRef: admitNonEmptyString(
      snapshot["contributionManifestRef"],
      `${label}.contributionManifestRef`
    ),
    resolvedLockRef: admitNonEmptyString(
      snapshot["resolvedLockRef"],
      `${label}.resolvedLockRef`
    ),
    assetPath: admitProductRelativePath(snapshot["assetPath"], `${label}.assetPath`),
    schemaId: admitNonEmptyString(snapshot["schemaId"], `${label}.schemaId`),
    schemaVersion: admitNonEmptyString(
      snapshot["schemaVersion"],
      `${label}.schemaVersion`
    ),
    schemaDigest: admitDigest(snapshot["schemaDigest"], `${label}.schemaDigest`),
    assetDigest: admitDigest(snapshot["assetDigest"], `${label}.assetDigest`),
    authorityRefs: admitUniqueStringArray(
      snapshot["authorityRefs"],
      `${label}.authorityRefs`
    ),
    provenanceRefs: admitUniqueStringArray(
      snapshot["provenanceRefs"],
      `${label}.provenanceRefs`
    ),
    readinessRefs: admitUniqueStringArray(
      snapshot["readinessRefs"],
      `${label}.readinessRefs`
    ),
    proofRefs: admitUniqueStringArray(snapshot["proofRefs"], `${label}.proofRefs`),
    policyRefs: admitUniqueStringArray(snapshot["policyRefs"], `${label}.policyRefs`),
    refinementOfEntryRef: admitNullableString(
      snapshot["refinementOfEntryRef"],
      `${label}.refinementOfEntryRef`
    ),
    overrideOfEntryRef: admitNullableString(
      snapshot["overrideOfEntryRef"],
      `${label}.overrideOfEntryRef`
    ),
    causationEventRefs: admitUniqueStringArray(
      snapshot["causationEventRefs"],
      `${label}.causationEventRefs`
    ),
    correlationId: admitNonEmptyString(
      snapshot["correlationId"],
      `${label}.correlationId`
    )
  });
}

function eventRef(event: RuntimeEvent): string {
  if ("eventId" in event && typeof event.eventId === "string") {
    return event.eventId;
  }
  if ("declarationRef" in event && typeof event.declarationRef === "string") {
    return `${event.kind}:${event.declarationRef}`;
  }
  return event.kind;
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function opaqueIdentityPayload(
  value: OpaqueCatalogAssetDeclaration | CatalogAssetAdmittedRuntimeEvent | OpaqueCatalogAssetProjection
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    workspaceId: value.workspaceId,
    bindingId: value.bindingId,
    catalogId: value.catalogId,
    entryRef: value.entryRef,
    declarationRef: value.declarationRef,
    declarationDigest: value.declarationDigest,
    libraryScope: value.libraryScope,
    assetKind: value.assetKind,
    namespace: value.namespace,
    ownerRef: value.ownerRef,
    version: value.version,
    descriptorRef: value.descriptorRef,
    contributionManifestRef: value.contributionManifestRef,
    resolvedLockRef: value.resolvedLockRef,
    assetPath: value.assetPath,
    schemaId: value.schemaId,
    schemaVersion: value.schemaVersion,
    schemaDigest: value.schemaDigest,
    assetDigest: value.assetDigest,
    authorityRefs: value.authorityRefs,
    provenanceRefs: value.provenanceRefs,
    readinessRefs: value.readinessRefs,
    proofRefs: value.proofRefs,
    policyRefs: value.policyRefs,
    refinementOfEntryRef: value.refinementOfEntryRef,
    overrideOfEntryRef: value.overrideOfEntryRef
  });
}

function opaqueProjectionFromEvent(
  event: CatalogAssetAdmittedRuntimeEvent,
  prior?: OpaqueCatalogAssetProjection
): OpaqueCatalogAssetProjection {
  return Object.freeze({
    kind: "opaque_catalog_asset_projection",
    workspaceId: event.workspaceId,
    bindingId: event.bindingId,
    catalogId: event.catalogId,
    entryRef: event.entryRef,
    declarationRef: event.declarationRef,
    declarationDigest: event.declarationDigest,
    libraryScope: event.libraryScope,
    assetKind: event.assetKind,
    namespace: event.namespace,
    ownerRef: event.ownerRef,
    version: event.version,
    descriptorRef: event.descriptorRef,
    contributionManifestRef: event.contributionManifestRef,
    resolvedLockRef: event.resolvedLockRef,
    assetPath: event.assetPath,
    schemaId: event.schemaId,
    schemaVersion: event.schemaVersion,
    schemaDigest: event.schemaDigest,
    assetDigest: event.assetDigest,
    authorityRefs: freezeStrings(event.authorityRefs),
    provenanceRefs: freezeStrings(event.provenanceRefs),
    readinessRefs: freezeStrings(event.readinessRefs),
    proofRefs: freezeStrings(event.proofRefs),
    policyRefs: freezeStrings(event.policyRefs),
    refinementOfEntryRef: event.refinementOfEntryRef,
    overrideOfEntryRef: event.overrideOfEntryRef,
    sourceEventRefs: Object.freeze([
      ...(prior?.sourceEventRefs ?? []),
      eventRef(event),
      ...event.sourceEventRefs
    ])
  });
}

function rejectedOpaqueProjectionFromEvent(
  event: CatalogAssetRejectedRuntimeEvent
): RejectedOpaqueCatalogAssetProjection {
  return Object.freeze({
    kind: "rejected_opaque_catalog_asset_projection",
    workspaceId: event.workspaceId,
    bindingId: event.bindingId,
    catalogId: event.catalogId,
    entryRef: event.entryRef,
    declarationRef: event.declarationRef,
    declarationDigest: event.declarationDigest,
    libraryScope: event.libraryScope,
    assetKind: event.assetKind,
    namespace: event.namespace,
    ownerRef: event.ownerRef,
    version: event.version,
    descriptorRef: event.descriptorRef,
    contributionManifestRef: event.contributionManifestRef,
    resolvedLockRef: event.resolvedLockRef,
    assetPath: event.assetPath,
    schemaId: event.schemaId,
    schemaVersion: event.schemaVersion,
    schemaDigest: event.schemaDigest,
    assetDigest: event.assetDigest,
    authorityRefs: freezeStrings(event.authorityRefs),
    provenanceRefs: freezeStrings(event.provenanceRefs),
    readinessRefs: freezeStrings(event.readinessRefs),
    proofRefs: freezeStrings(event.proofRefs),
    policyRefs: freezeStrings(event.policyRefs),
    refinementOfEntryRef: event.refinementOfEntryRef,
    overrideOfEntryRef: event.overrideOfEntryRef,
    rejectionReason: event.rejectionReason,
    conflictingEntryRefs: freezeStrings(event.conflictingEntryRefs),
    sourceEventRefs: Object.freeze([eventRef(event), ...event.sourceEventRefs])
  });
}

function assertCatalogIdentity(input: {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly event: CatalogAssetAdmissionEvent;
}): void {
  if (
    input.event.workspaceId !== input.workspaceId ||
    input.event.bindingId !== input.bindingId ||
    input.event.catalogId !== input.catalogId
  ) {
    throw new TypeError(
      "RuntimeCatalogProjection catalog-asset event belongs to a different workspace binding or catalog"
    );
  }
}

function assertNoRuntimeIdentityConflicts(events: readonly RuntimeEvent[]): void {
  const admitted = new Map<string, string>();
  for (const event of events) {
    if (event.kind !== "registry_entry_admitted") {
      continue;
    }
    const existing = admitted.get(event.entryRef);
    if (existing !== undefined && existing !== event.declarationDigest) {
      throw new TypeError(
        `RuntimeCatalogProjection has conflicting admitted registry identity ${JSON.stringify(event.entryRef)}`
      );
    }
    admitted.set(event.entryRef, event.declarationDigest);
  }
}

interface RuntimeCatalogProjectionIdentitySource {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly runtimeRegistryProjectionRef: string;
  readonly opaqueAssetEntries: readonly OpaqueCatalogAssetProjection[];
  readonly rejectedOpaqueAssetEntries: readonly RejectedOpaqueCatalogAssetProjection[];
  readonly sourceEventRefs: readonly string[];
}

function runtimeCatalogProjectionIdentity(
  input: RuntimeCatalogProjectionIdentitySource
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    catalogId: input.catalogId,
    runtimeRegistryProjectionRef: input.runtimeRegistryProjectionRef,
    opaqueAssetEntries: input.opaqueAssetEntries,
    rejectedOpaqueAssetEntries: input.rejectedOpaqueAssetEntries,
    sourceEventRefs: input.sourceEventRefs
  });
}

function deriveRuntimeCatalogProjectionRef(
  input: RuntimeCatalogProjectionIdentitySource
): string {
  return `runtime-catalog-projection:${stableSha256Digest(
    runtimeCatalogProjectionIdentity(input)
  )}`;
}

// Registry-entry events predate workspace identity on their carrier. The caller
// must supply them from the exact event log bound to workspaceId/bindingId;
// catalog-asset events carry that identity and are checked here directly.
export function projectRuntimeCatalog(input: {
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly events: readonly CanonicalRuntimeEvent[];
}): RuntimeCatalogProjection {
  admitNonEmptyString(input.workspaceId, "RuntimeCatalogProjection.workspaceId");
  admitNonEmptyString(input.bindingId, "RuntimeCatalogProjection.bindingId");
  admitNonEmptyString(input.catalogId, "RuntimeCatalogProjection.catalogId");
  assertCanonicalRuntimeEventSequence(input.events, "RuntimeCatalogProjection.events");
  const orderedLog = sortReplayByAdmissionOrdinalFailClosed(
    input.events,
    "RuntimeCatalogProjection.events"
  );
  const relevantEvents = orderedLog.filter((event) =>
    event.kind === "registry_entry_admitted" ||
    event.kind === "registry_entry_rejected" ||
    event.kind === "catalog_asset_admitted" ||
    event.kind === "catalog_asset_rejected"
  );
  const orderedEvents = relevantEvents;
  assertNoRuntimeIdentityConflicts(orderedEvents);

  const runtimeRegistryProjection = projectRuntimeGraphFunctionRegistry(orderedEvents);
  const opaqueByEntryRef = new Map<string, OpaqueCatalogAssetProjection>();
  const rejectedOpaqueAssetEntries: RejectedOpaqueCatalogAssetProjection[] = [];
  const sourceEventRefs: string[] = [];

  for (const event of orderedEvents) {
    if (event.kind === "registry_entry_admitted" || event.kind === "registry_entry_rejected") {
      sourceEventRefs.push(eventRef(event));
      continue;
    }
    assertCatalogIdentity({
      workspaceId: input.workspaceId,
      bindingId: input.bindingId,
      catalogId: input.catalogId,
      event
    });
    sourceEventRefs.push(eventRef(event));
    if (event.kind === "catalog_asset_rejected") {
      rejectedOpaqueAssetEntries.push(rejectedOpaqueProjectionFromEvent(event));
      continue;
    }
    if (runtimeRegistryProjection.entries.some((entry) => entry.entryRef === event.entryRef)) {
      throw new TypeError(
        `RuntimeCatalogProjection has cross-arm identity conflict ${JSON.stringify(event.entryRef)}`
      );
    }
    const existing = opaqueByEntryRef.get(event.entryRef);
    if (
      existing !== undefined &&
      stableSha256Digest(opaqueIdentityPayload(existing)) !==
        stableSha256Digest(opaqueIdentityPayload(event))
    ) {
      throw new TypeError(
        `RuntimeCatalogProjection has conflicting admitted opaque identity ${JSON.stringify(event.entryRef)}`
      );
    }
    opaqueByEntryRef.set(event.entryRef, opaqueProjectionFromEvent(event, existing));
  }

  const opaqueAssetEntries = [...opaqueByEntryRef.values()].sort((left, right) =>
    codepointCompare(left.entryRef, right.entryRef)
  );
  const projectionIdentitySource = Object.freeze({
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    catalogId: input.catalogId,
    runtimeRegistryProjectionRef: runtimeRegistryProjection.projectionRef,
    opaqueAssetEntries,
    rejectedOpaqueAssetEntries,
    sourceEventRefs
  });
  return Object.freeze({
    kind: "runtime_catalog_projection",
    projectionRef: deriveRuntimeCatalogProjectionRef(projectionIdentitySource),
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    catalogId: input.catalogId,
    runtimeRegistryProjection,
    opaqueAssetEntries: Object.freeze(opaqueAssetEntries),
    rejectedOpaqueAssetEntries: Object.freeze(rejectedOpaqueAssetEntries),
    sourceEventRefs: Object.freeze(sourceEventRefs)
  });
}

function catalogAssetEventFields(
  declaration: OpaqueCatalogAssetDeclaration,
  causationEventRefs: readonly string[],
  correlationId: string
): Omit<CatalogAssetAdmittedRuntimeEvent, "kind" | "sourceEventRefs"> {
  return Object.freeze({
    workspaceId: declaration.workspaceId,
    bindingId: declaration.bindingId,
    catalogId: declaration.catalogId,
    entryRef: declaration.entryRef,
    declarationRef: declaration.declarationRef,
    declarationDigest: declaration.declarationDigest,
    libraryScope: declaration.libraryScope,
    assetKind: declaration.assetKind,
    namespace: declaration.namespace,
    ownerRef: declaration.ownerRef,
    version: declaration.version,
    descriptorRef: declaration.descriptorRef,
    contributionManifestRef: declaration.contributionManifestRef,
    resolvedLockRef: declaration.resolvedLockRef,
    assetPath: declaration.assetPath,
    schemaId: declaration.schemaId,
    schemaVersion: declaration.schemaVersion,
    schemaDigest: declaration.schemaDigest,
    assetDigest: declaration.assetDigest,
    authorityRefs: declaration.authorityRefs,
    provenanceRefs: declaration.provenanceRefs,
    readinessRefs: declaration.readinessRefs,
    proofRefs: declaration.proofRefs,
    policyRefs: declaration.policyRefs,
    refinementOfEntryRef: declaration.refinementOfEntryRef,
    overrideOfEntryRef: declaration.overrideOfEntryRef,
    causationEventRefs: Object.freeze([...causationEventRefs]),
    correlationId
  });
}

function admittedCatalogAssetEvent(input: {
  readonly declaration: OpaqueCatalogAssetDeclaration;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}
): CatalogAssetAdmittedRuntimeEvent {
  return Object.freeze({
    kind: "catalog_asset_admitted",
    ...catalogAssetEventFields(
      input.declaration,
      input.causationEventRefs,
      input.correlationId
    ),
    sourceEventRefs: input.declaration.causationEventRefs
  });
}

function rejectedCatalogAssetEvent(input: {
  readonly declaration: OpaqueCatalogAssetDeclaration;
  readonly rejectionReason: CatalogAssetRejectionReason;
  readonly conflictingEntryRefs?: readonly string[] | undefined;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}): CatalogAssetRejectedRuntimeEvent {
  return Object.freeze({
    kind: "catalog_asset_rejected",
    ...catalogAssetEventFields(
      input.declaration,
      input.causationEventRefs,
      input.correlationId
    ),
    rejectionReason: input.rejectionReason,
    conflictingEntryRefs: Object.freeze([...(input.conflictingEntryRefs ?? [])]),
    sourceEventRefs: input.declaration.causationEventRefs
  });
}

function rejectedRegistryEvent(input: {
  readonly declaration: GtlLibraryEntryDeclaration;
  readonly reason: string;
  readonly conflictingEntryRefs?: readonly string[] | undefined;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}): RegistryEntryRejectedRuntimeEvent {
  return Object.freeze({
    kind: "registry_entry_rejected",
    declarationRef: input.declaration.declarationRef,
    declarationDigest: stableSha256Digest(input.declaration),
    libraryScope: input.declaration.libraryScope,
    entryKind: input.declaration.entryKind,
    namespace: input.declaration.namespace,
    ownerRef: input.declaration.ownerRef,
    rejectionReason: input.reason,
    conflictingEntryRefs: Object.freeze([...(input.conflictingEntryRefs ?? [])]),
    causationEventRefs: Object.freeze([...input.causationEventRefs]),
    correlationId: input.correlationId
  });
}

function productConfigMatchesRuntimeDeclaration(input: {
  readonly config: ProductRegistryStartupConfig;
  readonly declaration: GtlLibraryEntryDeclaration;
}): boolean {
  if (
    input.declaration.namespace !== input.config.productNamespace ||
    input.declaration.ownerRef !== input.config.ownerRef ||
    input.declaration.version !== input.config.version
  ) {
    return false;
  }
  if (input.config.enabledLibraryRefs.length === 0) {
    return true;
  }
  const enabled = new Set(input.config.enabledLibraryRefs);
  return (
    enabled.has(input.declaration.entryRef) ||
    enabled.has(input.declaration.declarationRef) ||
    input.declaration.declarationSourceRefs.some((ref) => enabled.has(ref))
  );
}

function productConfigMatchesOpaqueDeclaration(input: {
  readonly config: ProductRegistryStartupConfig;
  readonly declaration: OpaqueCatalogAssetDeclaration;
}): boolean {
  if (
    input.declaration.namespace !== input.config.productNamespace ||
    input.declaration.ownerRef !== input.config.ownerRef ||
    input.declaration.version !== input.config.version
  ) {
    return false;
  }
  if (input.config.enabledLibraryRefs.length === 0) {
    return true;
  }
  const enabled = new Set(input.config.enabledLibraryRefs);
  return (
    enabled.has(input.declaration.entryRef) ||
    enabled.has(input.declaration.declarationRef) ||
    enabled.has(input.declaration.contributionManifestRef)
  );
}

interface RuntimeLibraryResolution {
  readonly module: Module;
  readonly graphFunction: GraphFunction;
}

interface RuntimeLibraryRejection {
  readonly reason: string;
  readonly conflictingEntryRefs: readonly string[];
}

function resolveRuntimeLibraryDeclaration(
  row: RuntimeLibraryCatalogAdmissionDeclaration
): RuntimeLibraryResolution | RuntimeLibraryRejection {
  if (typeof row.moduleRef !== "string" || row.moduleRef.length === 0) {
    return { reason: "module_locator_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }
  if (!row.declaration.declarationSourceRefs.includes(row.moduleRef)) {
    return { reason: "module_locator_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }

  let module: Module;
  try {
    module = admitModule(
      row.module,
      `RuntimeLibraryCatalogAdmissionDeclaration(${JSON.stringify(row.declaration.entryRef)}).module`
    );
  } catch {
    return { reason: "malformed_module", conflictingEntryRefs: Object.freeze([]) };
  }

  try {
    const graphFunction = resolvePublishedGraphFunction(
      constructModuleLookupAuthority(module),
      row.declaration.graphFunctionRef
    );
    return Object.freeze({ module, graphFunction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return {
      reason: message.includes("publishes multiple graph functions")
        ? "ambiguous_graph_function"
        : "unresolved_graph_function",
      conflictingEntryRefs: Object.freeze([])
    };
  }
}

function isRuntimeLibraryRejection(
  value: RuntimeLibraryResolution | RuntimeLibraryRejection
): value is RuntimeLibraryRejection {
  return "reason" in value;
}

function runtimeDeclarationRejection(input: {
  readonly row: RuntimeLibraryCatalogAdmissionDeclaration;
  readonly resolution: RuntimeLibraryResolution;
  readonly expectedScope: "system" | "product";
  readonly productConfig?: ProductRegistryStartupConfig | undefined;
  readonly projection: RuntimeCatalogProjection;
}): { readonly reason: string; readonly conflictingEntryRefs: readonly string[] } | null {
  const declaration = input.row.declaration;
  if (declaration.libraryScope !== input.expectedScope) {
    return { reason: "scope_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }
  if (declaration.entryKind !== "graph_function" && declaration.entryKind !== "node_type") {
    return {
      reason: "unsupported_public_catalog_kind",
      conflictingEntryRefs: Object.freeze([])
    };
  }
  if (
    input.productConfig !== undefined &&
    !productConfigMatchesRuntimeDeclaration({
      config: input.productConfig,
      declaration
    })
  ) {
    return {
      reason: "product_startup_config_mismatch",
      conflictingEntryRefs: Object.freeze([])
    };
  }
  const opaqueConflict = input.projection.opaqueAssetEntries.find(
    (entry) => entry.entryRef === declaration.entryRef
  );
  if (opaqueConflict !== undefined) {
    return {
      reason: "identity_conflict",
      conflictingEntryRefs: Object.freeze([opaqueConflict.entryRef])
    };
  }
  const duplicateDeclaration = input.projection.runtimeRegistryProjection.entries.find(
    (entry) =>
      entry.declarationRef === declaration.declarationRef &&
      entry.entryRef !== declaration.entryRef
  );
  if (duplicateDeclaration !== undefined) {
    return {
      reason: "duplicate_handle",
      conflictingEntryRefs: Object.freeze([duplicateDeclaration.entryRef])
    };
  }
  const existing = input.projection.runtimeRegistryProjection.entries.find(
    (entry) => entry.entryRef === declaration.entryRef
  );
  if (
    existing !== undefined &&
    existing.declarationDigest !== stableSha256Digest(declaration)
  ) {
    return {
      reason: "identity_conflict",
      conflictingEntryRefs: Object.freeze([existing.entryRef])
    };
  }
  if (declaration.entryKind === "node_type") {
    const materialized = materializeNodeType({
      typeRef: declaration.graphFunctionRef,
      graphFunctions: [input.resolution.graphFunction]
    });
    if (!materialized.satisfied) {
      return {
        reason: materialized.rejectionReason ?? "node_type_not_identity_graph_function",
        conflictingEntryRefs: Object.freeze([])
      };
    }
  }
  return null;
}

function opaqueDeclarationRejection(input: {
  readonly declaration: OpaqueCatalogAssetDeclaration;
  readonly batch: BoundCatalogAdmissionBatch;
  readonly productBatch: BoundCatalogProductBatch;
  readonly projection: RuntimeCatalogProjection;
}): {
  readonly reason: CatalogAssetRejectionReason;
  readonly conflictingEntryRefs: readonly string[];
} | null {
  const declaration = input.declaration;
  if (
    declaration.workspaceId !== input.batch.workspaceId ||
    declaration.bindingId !== input.batch.bindingId ||
    declaration.catalogId !== input.batch.catalogId ||
    declaration.libraryScope !== "product" ||
    !productConfigMatchesOpaqueDeclaration({
      config: input.productBatch.productStartupConfig,
      declaration
    })
  ) {
    return { reason: "scope_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }
  if (declaration.assetKind !== "overlay") {
    return {
      reason: "unsupported_asset_kind",
      conflictingEntryRefs: Object.freeze([])
    };
  }
  if (
    declaration.descriptorRef !== input.productBatch.descriptorRef ||
    declaration.contributionManifestRef !== input.productBatch.contributionManifestRef
  ) {
    return { reason: "descriptor_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }
  if (declaration.resolvedLockRef !== input.batch.resolvedLockRef) {
    return { reason: "lock_mismatch", conflictingEntryRefs: Object.freeze([]) };
  }
  if (declaration.readinessRefs.length === 0) {
    return { reason: "readiness_invalid", conflictingEntryRefs: Object.freeze([]) };
  }
  const runtimeConflict = input.projection.runtimeRegistryProjection.entries.find(
    (entry) => entry.entryRef === declaration.entryRef
  );
  if (runtimeConflict !== undefined) {
    return {
      reason: "identity_conflict",
      conflictingEntryRefs: Object.freeze([runtimeConflict.entryRef])
    };
  }
  const duplicateDeclaration = input.projection.opaqueAssetEntries.find(
    (entry) =>
      entry.declarationRef === declaration.declarationRef &&
      entry.entryRef !== declaration.entryRef
  );
  if (duplicateDeclaration !== undefined) {
    return {
      reason: "duplicate_handle",
      conflictingEntryRefs: Object.freeze([duplicateDeclaration.entryRef])
    };
  }
  const existing = input.projection.opaqueAssetEntries.find(
    (entry) => entry.entryRef === declaration.entryRef
  );
  if (
    existing !== undefined &&
    stableSha256Digest(opaqueIdentityPayload(existing)) !==
      stableSha256Digest(opaqueIdentityPayload(declaration))
  ) {
    return {
      reason: "identity_conflict",
      conflictingEntryRefs: Object.freeze([existing.entryRef])
    };
  }
  return null;
}

function isExactRuntimeReadmission(input: {
  readonly declaration: GtlLibraryEntryDeclaration;
  readonly projection: RuntimeCatalogProjection;
}): boolean {
  const existing = input.projection.runtimeRegistryProjection.entries.find(
    (entry) => entry.entryRef === input.declaration.entryRef
  );
  return (
    existing !== undefined &&
    existing.declarationDigest === stableSha256Digest(input.declaration)
  );
}

function isExactOpaqueReadmission(input: {
  readonly declaration: OpaqueCatalogAssetDeclaration;
  readonly projection: RuntimeCatalogProjection;
}): boolean {
  const existing = input.projection.opaqueAssetEntries.find(
    (entry) => entry.entryRef === input.declaration.entryRef
  );
  return (
    existing !== undefined &&
    stableSha256Digest(opaqueIdentityPayload(existing)) ===
      stableSha256Digest(opaqueIdentityPayload(input.declaration))
  );
}

function isCanonicalCatalogAdmissionEvent(
  event: CanonicalRuntimeEvent
): event is CanonicalCatalogAdmissionEvent {
  return (
    event.kind === "registry_entry_admitted" ||
    event.kind === "registry_entry_rejected" ||
    event.kind === "catalog_asset_admitted" ||
    event.kind === "catalog_asset_rejected"
  );
}

function canonicalAdmissionEventRef(event: CanonicalCatalogAdmissionEvent): string {
  return event.eventId;
}

function rowDisposition(input: {
  readonly entryRef: string;
  readonly declarationRef: string;
  readonly entryKind: CatalogRowEntryKind;
  readonly disposition: CatalogRowDispositionKind;
  readonly eventRef?: string | null | undefined;
  readonly rejectionReason?: string | null | undefined;
}): CatalogRowDisposition {
  return Object.freeze({
    kind: "catalog_row_disposition",
    entryRef: input.entryRef,
    declarationRef: input.declarationRef,
    entryKind: input.entryKind,
    disposition: input.disposition,
    eventRef: input.eventRef ?? null,
    rejectionReason: input.rejectionReason ?? null
  });
}

function runtimeDispositionEntryKind(
  entryKind: GtlLibraryEntryDeclaration["entryKind"]
): CatalogRowEntryKind {
  if (entryKind === "graph_function" || entryKind === "node_type") {
    return entryKind;
  }
  return "unsupported";
}

function catalogExecutionBinding(input: {
  readonly batch: BoundCatalogAdmissionBatch;
  readonly row: RuntimeLibraryCatalogAdmissionDeclaration;
  readonly resolution: RuntimeLibraryResolution;
  readonly projection: RuntimeCatalogProjection;
  readonly productBatch?: BoundCatalogProductBatch | undefined;
}): CatalogExecutionBinding {
  if (input.row.declaration.entryKind !== "graph_function") {
    throw new TypeError("CatalogExecutionBinding is defined only for graph_function rows");
  }
  const projected = input.projection.runtimeRegistryProjection.entries.find(
    (entry) => entry.entryRef === input.row.declaration.entryRef
  );
  if (
    projected === undefined ||
    projected.declarationRef !== input.row.declaration.declarationRef ||
    projected.declarationDigest !== stableSha256Digest(input.row.declaration) ||
    projected.graphFunctionRef !== input.row.declaration.graphFunctionRef
  ) {
    throw new TypeError(
      `CatalogExecutionBinding requires matching admitted registry truth for ${JSON.stringify(input.row.declaration.entryRef)}`
    );
  }
  return Object.freeze({
    kind: "catalog_execution_binding",
    workspaceId: input.batch.workspaceId,
    bindingId: input.batch.bindingId,
    catalogId: input.batch.catalogId,
    resolvedLockRef: input.batch.resolvedLockRef,
    entryRef: projected.entryRef,
    declarationRef: projected.declarationRef,
    declarationDigest: projected.declarationDigest,
    libraryScope: projected.libraryScope,
    namespace: projected.namespace,
    ownerRef: projected.ownerRef,
    version: projected.version,
    descriptorRef: input.productBatch?.descriptorRef ?? null,
    contributionManifestRef: input.productBatch?.contributionManifestRef ?? null,
    moduleRef: input.row.moduleRef,
    moduleName: input.resolution.module.name,
    moduleDigest: stableSha256Digest(input.resolution.module),
    graphFunctionHandle: projected.graphFunctionRef,
    graphFunctionId: input.resolution.graphFunction.id,
    graphFunctionDigest: stableSha256Digest(input.resolution.graphFunction),
    declarationSourceRefs: projected.declarationSourceRefs,
    readinessRefs: projected.readinessRefs,
    sourceEventRefs: projected.sourceEventRefs,
    module: input.resolution.module,
    graphFunction: input.resolution.graphFunction
  });
}

function catalogExecutionBindingIdentity(
  binding: CatalogExecutionBinding
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    workspaceId: binding.workspaceId,
    bindingId: binding.bindingId,
    catalogId: binding.catalogId,
    resolvedLockRef: binding.resolvedLockRef,
    entryRef: binding.entryRef,
    declarationRef: binding.declarationRef,
    declarationDigest: binding.declarationDigest,
    libraryScope: binding.libraryScope,
    namespace: binding.namespace,
    ownerRef: binding.ownerRef,
    version: binding.version,
    descriptorRef: binding.descriptorRef,
    contributionManifestRef: binding.contributionManifestRef,
    moduleRef: binding.moduleRef,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    graphFunctionHandle: binding.graphFunctionHandle,
    graphFunctionId: binding.graphFunctionId,
    graphFunctionDigest: binding.graphFunctionDigest,
    declarationSourceRefs: binding.declarationSourceRefs,
    readinessRefs: binding.readinessRefs,
    sourceEventRefs: binding.sourceEventRefs
  });
}

function addExecutionBinding(
  bindings: Map<string, CatalogExecutionBinding>,
  binding: CatalogExecutionBinding
): void {
  const existing = bindings.get(binding.entryRef);
  if (
    existing !== undefined &&
    stableSha256Digest(catalogExecutionBindingIdentity(existing)) !==
      stableSha256Digest(catalogExecutionBindingIdentity(binding))
  ) {
    throw new TypeError(
      `CatalogExecutionBinding identity conflicts for ${JSON.stringify(binding.entryRef)}`
    );
  }
  bindings.set(binding.entryRef, binding);
}

function executionBindingMatchesRegistryEntry(
  binding: CatalogExecutionBinding,
  entry: RuntimeRegistryEntryProjection
): boolean {
  if (
    binding.entryRef !== entry.entryRef ||
    binding.declarationRef !== entry.declarationRef ||
    binding.declarationDigest !== entry.declarationDigest ||
    binding.graphFunctionHandle !== entry.graphFunctionRef ||
    binding.declarationSourceRefs.length !== entry.declarationSourceRefs.length ||
    binding.declarationSourceRefs.some(
      (ref, index) => ref !== entry.declarationSourceRefs[index]
    ) ||
    binding.readinessRefs.length !== entry.readinessRefs.length ||
    binding.readinessRefs.some((ref, index) => ref !== entry.readinessRefs[index]) ||
    binding.moduleDigest !== stableSha256Digest(binding.module) ||
    binding.graphFunctionDigest !== stableSha256Digest(binding.graphFunction)
  ) {
    return false;
  }
  try {
    const resolved = resolvePublishedGraphFunction(
      constructModuleLookupAuthority(binding.module),
      binding.graphFunctionHandle
    );
    return (
      resolved.id === binding.graphFunctionId &&
      stableSha256Digest(resolved) === binding.graphFunctionDigest
    );
  } catch {
    return false;
  }
}

function freezeSortedUnique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort(codepointCompare));
}

function addDeclarationModuleBinding(input: {
  readonly bindings: Map<string, CatalogDeclarationModuleBinding>;
  readonly row: RuntimeLibraryCatalogAdmissionDeclaration;
  readonly resolution: RuntimeLibraryResolution;
  readonly projection: RuntimeCatalogProjection;
}): void {
  const projected = input.projection.runtimeRegistryProjection.entries.find(
    (entry) => entry.entryRef === input.row.declaration.entryRef
  );
  if (
    projected === undefined ||
    projected.declarationRef !== input.row.declaration.declarationRef ||
    projected.declarationDigest !== stableSha256Digest(input.row.declaration) ||
    !projected.declarationSourceRefs.includes(input.row.moduleRef)
  ) {
    throw new TypeError(
      `CatalogDeclarationModuleBinding requires matching replay truth for ${JSON.stringify(input.row.moduleRef)}`
    );
  }
  const moduleDigest = stableSha256Digest(input.resolution.module);
  const existing = input.bindings.get(input.row.moduleRef);
  if (
    existing !== undefined &&
    (existing.moduleName !== input.resolution.module.name ||
      existing.moduleDigest !== moduleDigest)
  ) {
    throw new TypeError(
      `CatalogDeclarationModuleBinding identity conflicts for ${JSON.stringify(input.row.moduleRef)}`
    );
  }
  input.bindings.set(
    input.row.moduleRef,
    Object.freeze({
      kind: "catalog_declaration_module_binding" as const,
      moduleRef: input.row.moduleRef,
      moduleName: input.resolution.module.name,
      moduleDigest,
      sourceEntryRefs: freezeSortedUnique([
        ...(existing?.sourceEntryRefs ?? []),
        projected.entryRef
      ]),
      sourceDeclarationRefs: freezeSortedUnique([
        ...(existing?.sourceDeclarationRefs ?? []),
        projected.declarationRef
      ]),
      sourceEventRefs: freezeSortedUnique([
        ...(existing?.sourceEventRefs ?? []),
        ...projected.sourceEventRefs
      ]),
      invocationAuthority: false as const,
      module: input.resolution.module
    })
  );
}

function declarationModuleBindingIdentity(
  binding: CatalogDeclarationModuleBinding
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    moduleRef: binding.moduleRef,
    moduleName: binding.moduleName,
    moduleDigest: binding.moduleDigest,
    sourceEntryRefs: binding.sourceEntryRefs,
    sourceDeclarationRefs: binding.sourceDeclarationRefs,
    sourceEventRefs: binding.sourceEventRefs,
    invocationAuthority: binding.invocationAuthority
  });
}

type AdmittedRuntimeCatalogBasisIdentitySource = Pick<
  AdmittedRuntimeCatalogBasis,
  | "workspaceId"
  | "bindingId"
  | "catalogId"
  | "resolvedLockRef"
  | "runtimeCatalogProjectionRef"
  | "runtimeRegistryProjectionRef"
  | "admissionEventRefs"
  | "descriptorRefs"
  | "contributionManifestRefs"
  | "productStartupConfigRefs"
  | "executionBindings"
  | "declarationModuleBindings"
>;

function admittedRuntimeCatalogBasisIdentity(
  input: AdmittedRuntimeCatalogBasisIdentitySource
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    workspaceId: input.workspaceId,
    bindingId: input.bindingId,
    catalogId: input.catalogId,
    resolvedLockRef: input.resolvedLockRef,
    runtimeCatalogProjectionRef: input.runtimeCatalogProjectionRef,
    runtimeRegistryProjectionRef: input.runtimeRegistryProjectionRef,
    admissionEventRefs: input.admissionEventRefs,
    descriptorRefs: input.descriptorRefs,
    contributionManifestRefs: input.contributionManifestRefs,
    productStartupConfigRefs: input.productStartupConfigRefs,
    executionBindings: input.executionBindings.map(
      catalogExecutionBindingIdentity
    ),
    declarationModuleBindings: input.declarationModuleBindings.map(
      declarationModuleBindingIdentity
    )
  });
}

function orderedStringsEqual(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

export function assertAdmittedRuntimeCatalogBasis(
  basis: AdmittedRuntimeCatalogBasis
): void {
  const projection = basis.projection;
  const expectedRegistryProjectionRef = deriveRuntimeRegistryProjectionRef(
    projection.runtimeRegistryProjection.entries
  );
  if (
    projection.runtimeRegistryProjection.projectionRef !==
      expectedRegistryProjectionRef
  ) {
    throw new TypeError(
      "AdmittedRuntimeCatalogBasis runtime registry projection content differs from its projectionRef"
    );
  }
  const expectedCatalogProjectionRef = deriveRuntimeCatalogProjectionRef({
    workspaceId: projection.workspaceId,
    bindingId: projection.bindingId,
    catalogId: projection.catalogId,
    runtimeRegistryProjectionRef: expectedRegistryProjectionRef,
    opaqueAssetEntries: projection.opaqueAssetEntries,
    rejectedOpaqueAssetEntries: projection.rejectedOpaqueAssetEntries,
    sourceEventRefs: projection.sourceEventRefs
  });
  if (projection.projectionRef !== expectedCatalogProjectionRef) {
    throw new TypeError(
      "AdmittedRuntimeCatalogBasis runtime catalog projection content differs from its projectionRef"
    );
  }
  const graphFunctionEntries =
    projection.runtimeRegistryProjection.entries.filter(
      (entry) => entry.entryKind === "graph_function"
    );
  if (
    graphFunctionEntries.length !== basis.executionBindings.length ||
    graphFunctionEntries.some((entry) => {
      const matchingBindings = basis.executionBindings.filter((binding) =>
        binding.entryRef === entry.entryRef &&
        executionBindingMatchesRegistryEntry(binding, entry)
      );
      return matchingBindings.length !== 1;
    })
  ) {
    throw new TypeError(
      "AdmittedRuntimeCatalogBasis execution bindings differ from registry entries"
    );
  }
  if (
    basis.kind !== "admitted_runtime_catalog_basis" ||
    projection.kind !== "runtime_catalog_projection" ||
    projection.runtimeRegistryProjection.kind !== "runtime_registry_projection" ||
    basis.workspaceId !== projection.workspaceId ||
    basis.bindingId !== projection.bindingId ||
    basis.catalogId !== projection.catalogId ||
    basis.runtimeCatalogProjectionRef !== projection.projectionRef ||
    basis.runtimeRegistryProjectionRef !==
      projection.runtimeRegistryProjection.projectionRef ||
    !orderedStringsEqual(basis.admissionEventRefs, projection.sourceEventRefs)
  ) {
    throw new TypeError(
      "AdmittedRuntimeCatalogBasis does not match its runtime catalog projection"
    );
  }
  const expectedBasisRef =
    `admitted-runtime-catalog-basis:${stableSha256Digest(
      admittedRuntimeCatalogBasisIdentity(basis)
    )}`;
  if (basis.basisRef !== expectedBasisRef) {
    throw new TypeError(
      "AdmittedRuntimeCatalogBasis.basisRef does not match canonical basis identity"
    );
  }
}

function constructAdmittedRuntimeCatalogBasis(input: {
  readonly batch: BoundCatalogAdmissionBatch;
  readonly projection: RuntimeCatalogProjection;
  readonly executionBindings: readonly CatalogExecutionBinding[];
  readonly declarationModuleBindings: readonly CatalogDeclarationModuleBinding[];
}): AdmittedRuntimeCatalogBasis {
  const executionBindings = Object.freeze(
    [...input.executionBindings].sort((left, right) =>
      codepointCompare(left.entryRef, right.entryRef)
    )
  );
  const declarationModuleBindings = Object.freeze(
    [...input.declarationModuleBindings].sort((left, right) =>
      codepointCompare(left.moduleRef, right.moduleRef)
    )
  );
  const descriptorRefs = Object.freeze(
    input.batch.orderedProductBatches.map((batch) => batch.descriptorRef)
  );
  const contributionManifestRefs = Object.freeze(
    input.batch.orderedProductBatches.map((batch) => batch.contributionManifestRef)
  );
  const productStartupConfigRefs = Object.freeze(
    input.batch.orderedProductBatches.map(
      (batch) => batch.productStartupConfig.configRef
    )
  );
  const basisIdentity = admittedRuntimeCatalogBasisIdentity({
    workspaceId: input.batch.workspaceId,
    bindingId: input.batch.bindingId,
    catalogId: input.batch.catalogId,
    resolvedLockRef: input.batch.resolvedLockRef,
    runtimeCatalogProjectionRef: input.projection.projectionRef,
    runtimeRegistryProjectionRef: input.projection.runtimeRegistryProjection.projectionRef,
    admissionEventRefs: input.projection.sourceEventRefs,
    descriptorRefs,
    contributionManifestRefs,
    productStartupConfigRefs,
    executionBindings,
    declarationModuleBindings
  });
  return Object.freeze({
    kind: "admitted_runtime_catalog_basis",
    basisRef: `admitted-runtime-catalog-basis:${stableSha256Digest(basisIdentity)}`,
    workspaceId: input.batch.workspaceId,
    bindingId: input.batch.bindingId,
    catalogId: input.batch.catalogId,
    resolvedLockRef: input.batch.resolvedLockRef,
    runtimeCatalogProjectionRef: input.projection.projectionRef,
    runtimeRegistryProjectionRef: input.projection.runtimeRegistryProjection.projectionRef,
    admissionEventRefs: input.projection.sourceEventRefs,
    descriptorRefs,
    contributionManifestRefs,
    productStartupConfigRefs,
    projection: input.projection,
    executionBindings,
    declarationModuleBindings
  });
}

export function admitBoundWorkspaceCatalog(
  batch: BoundCatalogAdmissionBatch,
  sink: RuntimeEventSink,
  priorEvents: readonly CanonicalRuntimeEvent[] = []
): CatalogAdmissionResult {
  admitLiteral(batch.kind, "bound_catalog_admission_batch", "BoundCatalogAdmissionBatch.kind");
  admitNonEmptyString(batch.workspaceId, "BoundCatalogAdmissionBatch.workspaceId");
  admitNonEmptyString(batch.bindingId, "BoundCatalogAdmissionBatch.bindingId");
  admitNonEmptyString(batch.catalogId, "BoundCatalogAdmissionBatch.catalogId");
  admitNonEmptyString(batch.resolvedLockRef, "BoundCatalogAdmissionBatch.resolvedLockRef");
  admitNonEmptyString(batch.correlationId, "BoundCatalogAdmissionBatch.correlationId");

  const context = createSeededLiveEmitterContext(priorEvents);
  const allEvents: CanonicalRuntimeEvent[] = [...priorEvents];
  const admissionEvents: CanonicalCatalogAdmissionEvent[] = [];
  const rowDispositions: CatalogRowDisposition[] = [];
  const executionBindings = new Map<string, CatalogExecutionBinding>();
  const declarationModuleBindings = new Map<
    string,
    CatalogDeclarationModuleBinding
  >();
  let projection = projectRuntimeCatalog({
    workspaceId: batch.workspaceId,
    bindingId: batch.bindingId,
    catalogId: batch.catalogId,
    events: allEvents
  });

  const emitAdmission = (rawEvent: CatalogAdmissionEvent): CanonicalCatalogAdmissionEvent => {
    const [emitted] = emitWithContext(context, rawEvent, sink);
    if (emitted === undefined || !isCanonicalCatalogAdmissionEvent(emitted)) {
      throw new TypeError("Catalog admission did not emit one canonical catalog event");
    }
    admissionEvents.push(emitted);
    allEvents.push(emitted);
    projection = projectRuntimeCatalog({
      workspaceId: batch.workspaceId,
      bindingId: batch.bindingId,
      catalogId: batch.catalogId,
      events: allEvents
    });
    return emitted;
  };

  const admitRuntimeRow = (
    row: RuntimeLibraryCatalogAdmissionDeclaration,
    expectedScope: "system" | "product",
    productBatch?: BoundCatalogProductBatch
  ): void => {
    const rejectRow = (rejection: RuntimeLibraryRejection): void => {
      const emitted = emitAdmission(
        rejectedRegistryEvent({
          declaration: row.declaration,
          reason: rejection.reason,
          conflictingEntryRefs: rejection.conflictingEntryRefs,
          causationEventRefs: batch.causationEventRefs,
          correlationId: batch.correlationId
        })
      );
      rowDispositions.push(
        rowDisposition({
          entryRef: row.declaration.entryRef,
          declarationRef: row.declaration.declarationRef,
          entryKind: runtimeDispositionEntryKind(row.declaration.entryKind),
          disposition: "rejected",
          eventRef: canonicalAdmissionEventRef(emitted),
          rejectionReason: rejection.reason
        })
      );
    };

    const resolution = resolveRuntimeLibraryDeclaration(row);
    if (isRuntimeLibraryRejection(resolution)) {
      rejectRow(resolution);
      return;
    }
    const rejection = runtimeDeclarationRejection({
      row,
      resolution,
      expectedScope,
      ...(productBatch === undefined
        ? {}
        : { productConfig: productBatch.productStartupConfig }),
      projection
    });
    if (rejection !== null) {
      rejectRow(rejection);
      return;
    }
    if (isExactRuntimeReadmission({ declaration: row.declaration, projection })) {
      const existing = projection.runtimeRegistryProjection.entries.find(
        (entry) => entry.entryRef === row.declaration.entryRef
      );
      rowDispositions.push(
        rowDisposition({
          entryRef: row.declaration.entryRef,
          declarationRef: row.declaration.declarationRef,
          entryKind: runtimeDispositionEntryKind(row.declaration.entryKind),
          disposition: "already_admitted_exact",
          eventRef: existing?.sourceEventRefs[0] ?? null
        })
      );
      if (row.declaration.entryKind === "graph_function") {
        addExecutionBinding(
          executionBindings,
          catalogExecutionBinding({
            batch,
            row,
            resolution,
            projection,
            ...(productBatch === undefined ? {} : { productBatch })
          })
        );
      }
      addDeclarationModuleBinding({
        bindings: declarationModuleBindings,
        row,
        resolution,
        projection
      });
      return;
    }
    const emitted = emitAdmission(
      admitGtlLibraryEntryDeclaration({
        declaration: row.declaration,
        projection: projection.runtimeRegistryProjection,
        causationEventRefs: batch.causationEventRefs,
        correlationId: batch.correlationId
      })
    );
    rowDispositions.push(
      rowDisposition({
        entryRef: row.declaration.entryRef,
        declarationRef: row.declaration.declarationRef,
        entryKind: runtimeDispositionEntryKind(row.declaration.entryKind),
        disposition:
          emitted.kind === "registry_entry_admitted" ? "admitted" : "rejected",
        eventRef: canonicalAdmissionEventRef(emitted),
        rejectionReason:
          emitted.kind === "registry_entry_rejected" ? emitted.rejectionReason : null
      })
    );
    if (
      emitted.kind === "registry_entry_admitted" &&
      row.declaration.entryKind === "graph_function"
    ) {
      addExecutionBinding(
        executionBindings,
        catalogExecutionBinding({
          batch,
          row,
          resolution,
          projection,
          ...(productBatch === undefined ? {} : { productBatch })
        })
      );
    }
    if (emitted.kind === "registry_entry_admitted") {
      addDeclarationModuleBinding({
        bindings: declarationModuleBindings,
        row,
        resolution,
        projection
      });
    }
  };

  for (const row of batch.systemDeclarations) {
    admitRuntimeRow(row, "system");
  }
  for (const productBatch of batch.orderedProductBatches) {
    admitLiteral(
      productBatch.kind,
      "bound_catalog_product_batch",
      "BoundCatalogProductBatch.kind"
    );
    admitNonEmptyString(
      productBatch.descriptorRef,
      "BoundCatalogProductBatch.descriptorRef"
    );
    admitNonEmptyString(
      productBatch.contributionManifestRef,
      "BoundCatalogProductBatch.contributionManifestRef"
    );
    for (const row of productBatch.declarations) {
      if (row.kind === "runtime_library_entry") {
        admitRuntimeRow(row, "product", productBatch);
        continue;
      }
      const declaration = row.declaration;
      const rejection = opaqueDeclarationRejection({
        declaration,
        batch,
        productBatch,
        projection
      });
      if (rejection !== null) {
        const emitted = emitAdmission(
          rejectedCatalogAssetEvent({
            declaration,
            rejectionReason: rejection.reason,
            conflictingEntryRefs: rejection.conflictingEntryRefs,
            causationEventRefs: batch.causationEventRefs,
            correlationId: batch.correlationId
          })
        );
        rowDispositions.push(
          rowDisposition({
            entryRef: declaration.entryRef,
            declarationRef: declaration.declarationRef,
            entryKind: "overlay",
            disposition: "rejected",
            eventRef: canonicalAdmissionEventRef(emitted),
            rejectionReason: rejection.reason
          })
        );
        continue;
      }
      if (isExactOpaqueReadmission({ declaration, projection })) {
        const existing = projection.opaqueAssetEntries.find(
          (entry) => entry.entryRef === declaration.entryRef
        );
        rowDispositions.push(
          rowDisposition({
            entryRef: declaration.entryRef,
            declarationRef: declaration.declarationRef,
            entryKind: "overlay",
            disposition: "already_admitted_exact",
            eventRef: existing?.sourceEventRefs[0] ?? null
          })
        );
        continue;
      }
      const emitted = emitAdmission(admittedCatalogAssetEvent({
        declaration,
        causationEventRefs: batch.causationEventRefs,
        correlationId: batch.correlationId
      }));
      rowDispositions.push(
        rowDisposition({
          entryRef: declaration.entryRef,
          declarationRef: declaration.declarationRef,
          entryKind: "overlay",
          disposition: "admitted",
          eventRef: canonicalAdmissionEventRef(emitted)
        })
      );
    }
  }

  const graphFunctionEntries = projection.runtimeRegistryProjection.entries.filter(
    (entry) => entry.entryKind === "graph_function"
  );
  const bindingCoverage =
    graphFunctionEntries.length === executionBindings.size &&
    graphFunctionEntries.every((entry) => {
      const binding = executionBindings.get(entry.entryRef);
      return binding !== undefined && executionBindingMatchesRegistryEntry(binding, entry);
    });
  const declarationSourceCoverage =
    projection.runtimeRegistryProjection.entries.every((entry) =>
      entry.declarationSourceRefs.every((sourceRef) =>
        declarationModuleBindings.has(sourceRef)
      )
    );
  const accepted =
    rowDispositions.every((row) => row.disposition !== "rejected") &&
    bindingCoverage &&
    declarationSourceCoverage;
  const basis = accepted
    ? constructAdmittedRuntimeCatalogBasis({
        batch,
        projection,
        executionBindings: [...executionBindings.values()],
        declarationModuleBindings: [...declarationModuleBindings.values()]
      })
    : null;

  return Object.freeze({
    kind: "catalog_admission_result",
    accepted,
    admissionEvents: Object.freeze(admissionEvents),
    rowDispositions: Object.freeze(rowDispositions),
    projection,
    basis,
    admittedEntryRefs: Object.freeze(
      rowDispositions.flatMap((row) =>
        row.disposition === "rejected" ? [] : [row.entryRef]
      )
    ),
    rejectedDeclarationRefs: Object.freeze(
      rowDispositions.flatMap((row) =>
        row.disposition === "rejected" ? [row.declarationRef] : []
      )
    )
  });
}

function registrySessionEntry(
  entry: RuntimeRegistryEntryProjection,
  executionBinding?: CatalogExecutionBinding | undefined
): RegistrySessionGraphFunctionEntry | RegistrySessionNodeTypeEntry | null {
  const common = Object.freeze({
    entryRef: entry.entryRef,
    declarationRef: entry.declarationRef,
    namespace: entry.namespace,
    ownerRef: entry.ownerRef,
    version: entry.version,
    ready: entry.readinessRefs.length > 0,
    readinessRefs: entry.readinessRefs,
    provenanceRefs: entry.provenanceRefs,
    proofRefs: entry.proofRefs,
    policyRefs: entry.policyRefs,
    sourceEventRefs: entry.sourceEventRefs
  });
  if (entry.entryKind === "graph_function") {
    if (
      executionBinding === undefined ||
      !executionBindingMatchesRegistryEntry(executionBinding, entry)
    ) {
      return null;
    }
    return Object.freeze({
      kind: "registry_session_graph_function_entry",
      entryKind: "graph_function",
      callable: true,
      ...common,
      graphFunctionRef: entry.graphFunctionRef,
      interfaceRef: entry.interfaceRef,
      sourceContractRef: entry.sourceContractRef,
      targetContractRef: entry.targetContractRef
    });
  }
  if (entry.entryKind === "node_type") {
    return Object.freeze({
      kind: "registry_session_node_type_entry",
      entryKind: "node_type",
      callable: false,
      ...common,
      nodeTypeRef: entry.graphFunctionRef,
      interfaceRef: entry.interfaceRef,
      sourceContractRef: entry.sourceContractRef,
      targetContractRef: entry.targetContractRef
    });
  }
  return null;
}

function overlaySessionEntry(
  entry: OpaqueCatalogAssetProjection
): RegistrySessionOverlayEntry {
  return Object.freeze({
    kind: "registry_session_overlay_entry",
    entryKind: "overlay",
    callable: false,
    entryRef: entry.entryRef,
    declarationRef: entry.declarationRef,
    namespace: entry.namespace,
    ownerRef: entry.ownerRef,
    version: entry.version,
    ready: entry.readinessRefs.length > 0,
    readinessRefs: entry.readinessRefs,
    provenanceRefs: entry.provenanceRefs,
    proofRefs: entry.proofRefs,
    policyRefs: entry.policyRefs,
    sourceEventRefs: entry.sourceEventRefs,
    schemaId: entry.schemaId,
    schemaVersion: entry.schemaVersion,
    schemaDigest: entry.schemaDigest,
    assetDigest: entry.assetDigest
  });
}

export function deriveRegistrySessionView(input: {
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly allowedEntryRefs?: readonly string[] | undefined;
}): RegistrySessionViewResult {
  assertAdmittedRuntimeCatalogBasis(input.basis);
  const projection = input.basis.projection;
  const bindingsByEntryRef = new Map(
    input.basis.executionBindings.map((binding) => [binding.entryRef, binding])
  );
  const inadmissibleEntryRefs = new Set<string>();
  const publicRegistryEntries = projection.runtimeRegistryProjection.entries.filter(
    (entry) => entry.entryKind === "graph_function" || entry.entryKind === "node_type"
  );
  const allEntries = [
    ...publicRegistryEntries.flatMap((entry) => {
      const binding = bindingsByEntryRef.get(entry.entryRef);
      const publicEntry = registrySessionEntry(entry, binding);
      if (entry.entryKind === "graph_function" && publicEntry === null) {
        inadmissibleEntryRefs.add(entry.entryRef);
      }
      return publicEntry === null ? [] : [publicEntry];
    }),
    ...projection.opaqueAssetEntries.map(overlaySessionEntry)
  ].sort((left, right) => codepointCompare(left.entryRef, right.entryRef));
  const byEntryRef = new Map(allEntries.map((entry) => [entry.entryRef, entry]));
  const requested = input.allowedEntryRefs === undefined
    ? [
        ...publicRegistryEntries.map((entry) => entry.entryRef),
        ...projection.opaqueAssetEntries.map((entry) => entry.entryRef)
      ].sort(codepointCompare)
    : [...input.allowedEntryRefs];
  const residuals: RegistrySessionViewResidual[] = [];
  const seen = new Set<string>();
  const admittedEntryRefs: string[] = [];

  for (const entryRef of requested) {
    if (seen.has(entryRef)) {
      residuals.push(Object.freeze({
        kind: "registry_session_view_residual",
        entryRef,
        reason: "duplicate_handle"
      }));
      continue;
    }
    seen.add(entryRef);
    if (inadmissibleEntryRefs.has(entryRef)) {
      residuals.push(Object.freeze({
        kind: "registry_session_view_residual",
        entryRef,
        reason: "inadmissible"
      }));
      continue;
    }
    const entry = byEntryRef.get(entryRef);
    if (entry === undefined) {
      residuals.push(Object.freeze({
        kind: "registry_session_view_residual",
        entryRef,
        reason: "unknown_handle"
      }));
      continue;
    }
    if (!entry.ready) {
      residuals.push(Object.freeze({
        kind: "registry_session_view_residual",
        entryRef,
        reason: "unready"
      }));
      continue;
    }
    admittedEntryRefs.push(entryRef);
  }

  if (residuals.length > 0) {
    return Object.freeze({
      kind: "registry_session_view_result",
      accepted: false,
      view: null,
      residuals: Object.freeze(residuals)
    });
  }
  const allowedEntryRefs = Object.freeze(
    [...admittedEntryRefs].sort(codepointCompare)
  );
  const entries = Object.freeze(
    allowedEntryRefs.flatMap((entryRef) => {
      const entry = byEntryRef.get(entryRef);
      return entry === undefined ? [] : [entry];
    })
  );
  const sessionViewRef = deriveRegistrySessionViewRef({
    catalogId: projection.catalogId,
    catalogProjectionRef: projection.projectionRef,
    allowedEntryRefs
  });
  return Object.freeze({
    kind: "registry_session_view_result",
    accepted: true,
    view: Object.freeze({
      kind: "registry_session_view",
      sessionViewRef,
      catalogId: projection.catalogId,
      catalogProjectionRef: projection.projectionRef,
      allowedEntryRefs,
      entries
    }),
    residuals: Object.freeze([])
  });
}
