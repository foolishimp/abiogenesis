import type {
  ConsensusResult,
  TicketConsensusProjection,
} from "../gtl/consensus.js";
import {
  isConsensusResult,
  projectTicketConsensus,
} from "../gtl/consensus.js";
import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  graphFunctionCatalogCanonicalSnapshot,
  type CatalogReadinessRowDisposition,
  type DeclarationCatalogEntry,
  type GraphFunctionCatalog,
  type GraphFunctionCatalogEntry,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import type {
  ProductInstall,
  ProductSet,
  ResolvedProductLock,
  WorkspaceBinding,
} from "./environment.js";
import {
  isProductSet,
  isResolvedProductLock,
  isWorkspaceBindingCandidate,
} from "./environment.js";
import type { ReleaseSnapshotRefusal } from "./release_snapshot_operations.js";

export type ProductProjectReadCase =
  | "catalog_list"
  | "catalog_describe"
  | "workspace_status"
  | "install_evidence"
  | "release_evidence"
  | "ticket_consensus";

export interface ProductProjectionBasis {
  readonly basisRef: string;
  readonly basisDigest: Sha256Digest;
  readonly value: JsonValue;
}

export interface ProductReadCoordinate {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

interface ProductProjectReadPacketBase<C extends ProductProjectReadCase> {
  readonly kind: "product_project_read_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: C;
  readonly sourceRef: string;
  readonly sourceDigest: Sha256Digest;
  readonly projectionBasis: ProductProjectionBasis;
}

export interface CatalogListProjectReadPacket
  extends ProductProjectReadPacketBase<"catalog_list"> {
  readonly catalog: GraphFunctionCatalog;
  readonly selector: Readonly<{
    kind: "catalog_list";
    visibility:
      | Readonly<{ kind: "workspace_catalog" }>
      | Readonly<{
        kind: "session_view";
        view: GraphFunctionCatalogView;
      }>;
  }>;
}

export interface CatalogDescribeProjectReadPacket
  extends ProductProjectReadPacketBase<"catalog_describe"> {
  readonly catalog: GraphFunctionCatalog;
  readonly selector: Readonly<{
    kind: "catalog_describe";
    handle: string;
    visibility:
      | Readonly<{ kind: "workspace_catalog" }>
      | Readonly<{
        kind: "session_view";
        view: GraphFunctionCatalogView;
      }>;
  }>;
}

export interface WorkspaceStatusProjectReadPacket
  extends ProductProjectReadPacketBase<"workspace_status"> {
  readonly binding: WorkspaceBinding;
  readonly resolvedLock: ResolvedProductLock;
  readonly productSet: ProductSet;
  readonly configurationCoordinates: readonly ProductReadCoordinate[];
  readonly catalogCoordinate: ProductReadCoordinate | null;
  readonly selector: Readonly<{ kind: "none" }>;
}

export interface InstallEvidenceManifest {
  readonly manifestRef: string;
  readonly manifestDigest: Sha256Digest;
  readonly value: JsonValue;
}

export interface InstallEvidenceProjectReadPacket
  extends ProductProjectReadPacketBase<"install_evidence"> {
  readonly install: ProductInstall;
  readonly selector: Readonly<{
    kind: "install_manifest";
    manifest: InstallEvidenceManifest;
  }>;
}

export interface ReleaseEvidenceProjectReadPacket
  extends ProductProjectReadPacketBase<"release_evidence"> {
  readonly releaseSnapshotRefusal: ReleaseSnapshotRefusal;
  readonly selector: Readonly<{ kind: "release_snapshot_unavailable" }>;
}

export interface TicketConsensusProjectReadPacket
  extends ProductProjectReadPacketBase<"ticket_consensus"> {
  readonly consensusResult: Readonly<ConsensusResult>;
  readonly selector: Readonly<{
    kind: "ticket_consensus";
    ticket: ProductReadCoordinate;
    outputAuthority: ProductReadCoordinate;
    replayBasis: ProductReadCoordinate;
  }>;
}

export interface ProductProjectReadPacketByCase {
  readonly catalog_list: CatalogListProjectReadPacket;
  readonly catalog_describe: CatalogDescribeProjectReadPacket;
  readonly workspace_status: WorkspaceStatusProjectReadPacket;
  readonly install_evidence: InstallEvidenceProjectReadPacket;
  readonly release_evidence: ReleaseEvidenceProjectReadPacket;
  readonly ticket_consensus: TicketConsensusProjectReadPacket;
}

export type ProductProjectReadPacket<
  C extends ProductProjectReadCase = ProductProjectReadCase,
> = ProductProjectReadPacketByCase[C];

export type ProjectReadPacket<
  C extends ProductProjectReadCase = ProductProjectReadCase,
> = ProductProjectReadPacket<C>;

export type ProductProjectReadRefusalCode =
  | "unknown_source"
  | "source_kind_mismatch"
  | "source_digest_mismatch"
  | "projection_basis_mismatch"
  | "projection_unsupported"
  | "not_found"
  | "not_ready"
  | "unknown_handle"
  | "ambiguous_handle"
  | "hidden_by_view"
  | "incompatible"
  | "unbound"
  | "inadmissible";

export interface ProductProjectReadRefusal {
  readonly kind: "product_project_read_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly memberKey: ProductProjectReadCase;
  readonly code: ProductProjectReadRefusalCode;
  readonly message: string;
  readonly sourceRef: string | null;
  readonly sourceDigest: Sha256Digest | null;
  readonly ownerRefusal: ReleaseSnapshotRefusal | null;
}

export interface ProductProjectReadResult<
  C extends ProductProjectReadCase,
  P extends JsonValue,
> {
  readonly kind: "product_project_read_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "projected";
  readonly memberKey: C;
  readonly sourceRef: string;
  readonly sourceDigest: Sha256Digest;
  readonly projectionBasisRef: string;
  readonly projectionBasisDigest: Sha256Digest;
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly projection: P;
}

export interface CatalogListProjectionRow {
  readonly handle: string;
  readonly contributionKind: "graph_function" | "node_type" | "overlay";
  readonly entry:
    | Readonly<GraphFunctionCatalogEntry>
    | Readonly<DeclarationCatalogEntry>;
  readonly readiness: CatalogReadinessRowDisposition | null;
}

export interface CatalogListProjection {
  readonly kind: "catalog_list_projection";
  readonly catalogBasisDigest: Sha256Digest;
  readonly catalogSnapshotDigest: Sha256Digest;
  readonly visibility: "workspace_catalog" | "session_view";
  readonly viewDigest: Sha256Digest | null;
  readonly rows: readonly CatalogListProjectionRow[];
}

export interface CatalogDescriptionProjection {
  readonly kind: "catalog_description_projection";
  readonly catalogBasisDigest: Sha256Digest;
  readonly visibility: "workspace_catalog" | "session_view";
  readonly viewDigest: Sha256Digest | null;
  readonly handle: string;
  readonly contributionKind: "graph_function" | "node_type" | "overlay";
  readonly entry:
    | Readonly<GraphFunctionCatalogEntry>
    | Readonly<DeclarationCatalogEntry>;
  readonly readiness: CatalogReadinessRowDisposition | null;
}

export interface WorkspaceStatusProjection {
  readonly kind: "workspace_status_projection";
  readonly workspaceRef: string;
  readonly workspaceAuthorityRef: string;
  readonly workspaceAuthorityDigest: Sha256Digest;
  readonly bindingRef: string;
  readonly bindingDigest: Sha256Digest;
  readonly productSetRef: string;
  readonly productSetDigest: Sha256Digest;
  readonly resolvedLockRef: string;
  readonly resolvedLockDigest: Sha256Digest;
  readonly boundProductRefs: readonly string[];
  readonly roots: WorkspaceBinding["roots"];
  readonly configurationCoordinates: readonly ProductReadCoordinate[];
  readonly catalogCoordinate: ProductReadCoordinate | null;
  readonly readiness: "ready";
  readonly residuals: readonly [];
  readonly admissionEventRef: string;
}

export interface InstallEvidenceProjection {
  readonly kind: "install_evidence_projection";
  readonly subjectRef: string;
  readonly subjectDigest: Sha256Digest;
  readonly productId: string;
  readonly artifactRef: string;
  readonly artifactDigest: Sha256Digest;
  readonly productContentDigest: Sha256Digest;
  readonly manifest: InstallEvidenceManifest;
  readonly producer: "ProductInstallPort.install";
  readonly basisRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

type CatalogListOperationResult =
  | ProductProjectReadResult<"catalog_list", CatalogListProjection & JsonValue>
  | ProductProjectReadRefusal;
type CatalogDescribeOperationResult =
  | ProductProjectReadResult<
    "catalog_describe",
    CatalogDescriptionProjection & JsonValue
  >
  | ProductProjectReadRefusal;
type WorkspaceStatusOperationResult =
  | ProductProjectReadResult<
    "workspace_status",
    WorkspaceStatusProjection & JsonValue
  >
  | ProductProjectReadRefusal;
type InstallEvidenceOperationResult =
  | ProductProjectReadResult<
    "install_evidence",
    InstallEvidenceProjection & JsonValue
  >
  | ProductProjectReadRefusal;
type TicketConsensusOperationResult =
  | ProductProjectReadResult<
    "ticket_consensus",
    TicketConsensusProjection & JsonValue
  >
  | ProductProjectReadRefusal;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: object, keys: readonly string[]): boolean {
  return Object.keys(value).sort(compareUnicodeCodeUnits).join("\0") ===
    [...keys].sort(compareUnicodeCodeUnits).join("\0");
}

function digestJson(value: unknown): Sha256Digest | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

function validCoordinate(value: unknown): value is ProductReadCoordinate {
  return isRecord(value) &&
    hasExactKeys(value, ["digest", "ref"]) &&
    typeof value.ref === "string" &&
    value.ref.length > 0 &&
    isSha256Digest(value.digest);
}

function validProjectionBasis(value: unknown): value is ProductProjectionBasis {
  return isRecord(value) &&
    hasExactKeys(value, ["basisDigest", "basisRef", "value"]) &&
    typeof value.basisRef === "string" &&
    value.basisRef.length > 0 &&
    isSha256Digest(value.basisDigest) &&
    digestJson(value.value) === value.basisDigest;
}

function validEnvelope(
  packet: unknown,
  memberKey: ProductProjectReadCase,
  additionalKeys: readonly string[],
): packet is ProductProjectReadPacket {
  return isRecord(packet) &&
    hasExactKeys(packet, [
      "kind",
      "memberKey",
      "projectionBasis",
      "schemaVersion",
      "sourceDigest",
      "sourceRef",
      ...additionalKeys,
    ]) &&
    packet.kind === "product_project_read_packet" &&
    packet.schemaVersion === "5.0.0" &&
    packet.memberKey === memberKey &&
    typeof packet.sourceRef === "string" &&
    packet.sourceRef.length > 0 &&
    isSha256Digest(packet.sourceDigest) &&
    validProjectionBasis(packet.projectionBasis);
}

function refusal(
  memberKey: ProductProjectReadCase,
  code: ProductProjectReadRefusalCode,
  message: string,
  packet: unknown,
  ownerRefusal: ReleaseSnapshotRefusal | null = null,
): ProductProjectReadRefusal {
  const sourceRef = isRecord(packet) && typeof packet.sourceRef === "string"
    ? packet.sourceRef
    : null;
  const sourceDigest = isRecord(packet) && isSha256Digest(packet.sourceDigest)
    ? packet.sourceDigest
    : null;
  return deepFreeze({
    kind: "product_project_read_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    memberKey,
    code,
    message,
    sourceRef,
    sourceDigest,
    ownerRefusal,
  });
}

function projected<C extends ProductProjectReadCase, P extends JsonValue>(
  packet: ProductProjectReadPacket<C>,
  projection: P,
): ProductProjectReadResult<C, P> {
  const memberKey = packet.memberKey as C;
  const projectionBody = {
    memberKey,
    sourceRef: packet.sourceRef,
    sourceDigest: packet.sourceDigest,
    projectionBasisRef: packet.projectionBasis.basisRef,
    projectionBasisDigest: packet.projectionBasis.basisDigest,
    projection,
  };
  const projectionDigest = sha256Canonical(projectionBody as JsonValue);
  return deepFreeze({
    kind: "product_project_read_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    ...projectionBody,
    projectionRef:
      `product-projection://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
    projectionDigest,
  }) as ProductProjectReadResult<C, P>;
}

function catalogSnapshotDigest(catalog: GraphFunctionCatalog): Sha256Digest {
  return sha256Canonical(
    JSON.parse(graphFunctionCatalogCanonicalSnapshot(catalog)) as JsonValue,
  );
}

function catalogRows(
  catalog: GraphFunctionCatalog,
  view: GraphFunctionCatalogView | null,
): readonly CatalogListProjectionRow[] {
  const visibleHandles = view === null ? null : new Set(view.allowlist);
  const readinessRows = "rowDispositions" in catalog
    ? (catalog as ReadyGraphFunctionCatalog).rowDispositions
    : [];
  const readinessFor = (
    handle: string,
    owningProductId: string,
    moduleRef: string,
  ): CatalogReadinessRowDisposition | null =>
    readinessRows.find((row) =>
      row.handle === handle &&
      row.owningProductId === owningProductId &&
      row.moduleRef === moduleRef
    ) ?? null;
  return [
    ...catalog.entries.map((entry) => ({
      handle: entry.handle,
      contributionKind: "graph_function" as const,
      entry,
      readiness: readinessFor(
        entry.handle,
        entry.owningProductId,
        entry.moduleRef,
      ),
    })),
    ...catalog.declarationEntries.map((entry) => ({
      handle: entry.handle,
      contributionKind: entry.declarationKind,
      entry,
      readiness: readinessFor(
        entry.handle,
        entry.owningProductId,
        entry.moduleRef,
      ),
    })),
  ].filter((row) => visibleHandles === null || visibleHandles.has(row.handle))
    .sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle));
}

function selectedView(
  catalog: GraphFunctionCatalog,
  selector: CatalogListProjectReadPacket["selector"] |
    CatalogDescribeProjectReadPacket["selector"],
): GraphFunctionCatalogView | null | "mismatch" {
  if (selector.visibility.kind === "workspace_catalog") return null;
  return selector.visibility.view.catalogBasisDigest === catalog.basisDigest
    ? selector.visibility.view
    : "mismatch";
}

export function projectCatalogList(
  packet: CatalogListProjectReadPacket,
): CatalogListOperationResult {
  if (!validEnvelope(packet, "catalog_list", ["catalog", "selector"])) {
    return refusal(
      "catalog_list",
      "source_kind_mismatch",
      "catalog list requires one exact Product catalog packet",
      packet,
    );
  }
  if (
    !isRecord(packet.catalog) ||
    packet.catalog.kind !== "graph_function_catalog" ||
    packet.catalog.schemaVersion !== "5.0.0" ||
    packet.sourceDigest !== packet.catalog.basisDigest
  ) {
    return refusal(
      "catalog_list",
      "source_digest_mismatch",
      "catalog list source differs from its immutable catalog basis",
      packet,
    );
  }
  if (
    !isRecord(packet.selector) ||
    packet.selector.kind !== "catalog_list" ||
    !isRecord(packet.selector.visibility) ||
    (
      packet.selector.visibility.kind !== "workspace_catalog" &&
      packet.selector.visibility.kind !== "session_view"
    )
  ) {
    return refusal(
      "catalog_list",
      "projection_unsupported",
      "catalog list requires one closed visibility selector",
      packet,
    );
  }
  const view = selectedView(packet.catalog, packet.selector);
  if (view === "mismatch") {
    return refusal(
      "catalog_list",
      "projection_basis_mismatch",
      "catalog view differs from the selected catalog basis",
      packet,
    );
  }
  const projection: CatalogListProjection & JsonValue = {
    kind: "catalog_list_projection",
    catalogBasisDigest: packet.catalog.basisDigest,
    catalogSnapshotDigest: catalogSnapshotDigest(packet.catalog),
    visibility: view === null ? "workspace_catalog" : "session_view",
    viewDigest: view?.viewDigest ?? null,
    rows: catalogRows(packet.catalog, view),
  } as CatalogListProjection & JsonValue;
  return projected(packet, projection);
}

export function projectCatalogDescription(
  packet: CatalogDescribeProjectReadPacket,
): CatalogDescribeOperationResult {
  if (!validEnvelope(packet, "catalog_describe", ["catalog", "selector"])) {
    return refusal(
      "catalog_describe",
      "source_kind_mismatch",
      "catalog describe requires one exact Product catalog packet",
      packet,
    );
  }
  if (
    !isRecord(packet.catalog) ||
    packet.catalog.kind !== "graph_function_catalog" ||
    packet.catalog.schemaVersion !== "5.0.0" ||
    packet.sourceDigest !== packet.catalog.basisDigest
  ) {
    return refusal(
      "catalog_describe",
      "source_digest_mismatch",
      "catalog describe source differs from its immutable catalog basis",
      packet,
    );
  }
  if (
    !isRecord(packet.selector) ||
    packet.selector.kind !== "catalog_describe" ||
    typeof packet.selector.handle !== "string" ||
    packet.selector.handle.length === 0 ||
    !isRecord(packet.selector.visibility)
  ) {
    return refusal(
      "catalog_describe",
      "projection_unsupported",
      "catalog describe requires one canonical handle and visibility selector",
      packet,
    );
  }
  const view = selectedView(packet.catalog, packet.selector);
  if (view === "mismatch") {
    return refusal(
      "catalog_describe",
      "projection_basis_mismatch",
      "catalog view differs from the selected catalog basis",
      packet,
    );
  }
  const allRows = catalogRows(packet.catalog, null).filter((row) =>
    row.handle === packet.selector.handle
  );
  if (allRows.length === 0) {
    return refusal(
      "catalog_describe",
      "unknown_handle",
      `catalog handle ${packet.selector.handle} is absent`,
      packet,
    );
  }
  if (allRows.length !== 1) {
    return refusal(
      "catalog_describe",
      "ambiguous_handle",
      `catalog handle ${packet.selector.handle} is not unique`,
      packet,
    );
  }
  if (view !== null && !view.allowlist.includes(packet.selector.handle)) {
    return refusal(
      "catalog_describe",
      "hidden_by_view",
      `catalog handle ${packet.selector.handle} is outside the exact view`,
      packet,
    );
  }
  const row = allRows[0]!;
  const projection: CatalogDescriptionProjection & JsonValue = {
    kind: "catalog_description_projection",
    catalogBasisDigest: packet.catalog.basisDigest,
    visibility: view === null ? "workspace_catalog" : "session_view",
    viewDigest: view?.viewDigest ?? null,
    handle: row.handle,
    contributionKind: row.contributionKind,
    entry: row.entry,
    readiness: row.readiness,
  } as CatalogDescriptionProjection & JsonValue;
  return projected(packet, projection);
}

function admittedBindingCandidate(
  binding: WorkspaceBinding,
): Readonly<Record<string, unknown>> {
  const {
    admissionEventRef: _admissionEventRef,
    kind: _kind,
    ...body
  } = binding;
  return { kind: "workspace_binding_candidate", ...body };
}

export function projectWorkspaceStatus(
  packet: WorkspaceStatusProjectReadPacket,
): WorkspaceStatusOperationResult {
  if (
    !validEnvelope(packet, "workspace_status", [
      "binding",
      "catalogCoordinate",
      "configurationCoordinates",
      "productSet",
      "resolvedLock",
      "selector",
    ])
  ) {
    return refusal(
      "workspace_status",
      "source_kind_mismatch",
      "workspace status requires one exact immutable workspace basis",
      packet,
    );
  }
  const coordinatesAreValid = Array.isArray(packet.configurationCoordinates) &&
    packet.configurationCoordinates.every(validCoordinate) &&
    new Set(packet.configurationCoordinates.map((coordinate) => coordinate.ref))
        .size === packet.configurationCoordinates.length &&
    (packet.catalogCoordinate === null ||
      validCoordinate(packet.catalogCoordinate));
  if (
    !isRecord(packet.selector) ||
    !hasExactKeys(packet.selector, ["kind"]) ||
    packet.selector.kind !== "none" ||
    !isRecord(packet.binding) ||
    packet.binding.kind !== "workspace_binding" ||
    typeof packet.binding.admissionEventRef !== "string" ||
    packet.binding.admissionEventRef.length === 0 ||
    !isResolvedProductLock(packet.resolvedLock) ||
    !isProductSet(packet.productSet, packet.resolvedLock) ||
    !isWorkspaceBindingCandidate(
      admittedBindingCandidate(packet.binding),
      packet.resolvedLock,
      packet.productSet,
    ) ||
    !coordinatesAreValid
  ) {
    return refusal(
      "workspace_status",
      "not_ready",
      "workspace status basis is incomplete or internally inconsistent",
      packet,
    );
  }
  if (
    packet.sourceRef !== packet.binding.bindingId ||
    packet.sourceDigest !== packet.binding.bindingDigest
  ) {
    return refusal(
      "workspace_status",
      "source_digest_mismatch",
      "workspace status source differs from the selected binding",
      packet,
    );
  }
  const configurations = [...packet.configurationCoordinates].sort((left, right) =>
    compareUnicodeCodeUnits(left.ref, right.ref)
  );
  const projection = {
    kind: "workspace_status_projection",
    workspaceRef: packet.binding.workspaceId,
    workspaceAuthorityRef: packet.binding.authorityBasisId,
    workspaceAuthorityDigest: packet.binding.authorityBasisDigest,
    bindingRef: packet.binding.bindingId,
    bindingDigest: packet.binding.bindingDigest,
    productSetRef: packet.productSet.productSetId,
    productSetDigest: packet.productSet.productSetDigest,
    resolvedLockRef: packet.resolvedLock.lockId,
    resolvedLockDigest: packet.resolvedLock.lockDigest,
    boundProductRefs: [...packet.productSet.orderedInstallRefs],
    roots: packet.binding.roots,
    configurationCoordinates: configurations,
    catalogCoordinate: packet.catalogCoordinate,
    readiness: "ready",
    residuals: [],
    admissionEventRef: packet.binding.admissionEventRef,
  } as unknown as WorkspaceStatusProjection & JsonValue;
  return projected(packet, projection);
}

export function projectInstallEvidence(
  packet: InstallEvidenceProjectReadPacket,
): InstallEvidenceOperationResult {
  if (!validEnvelope(packet, "install_evidence", ["install", "selector"])) {
    return refusal(
      "install_evidence",
      "source_kind_mismatch",
      "install evidence requires one exact admitted Product install",
      packet,
    );
  }
  const installDigest = digestJson(packet.install);
  if (
    !isRecord(packet.install) ||
    packet.install.kind !== "product_install" ||
    packet.install.disposition !== "admitted" ||
    typeof packet.install.installId !== "string" ||
    typeof packet.install.admissionEventRef !== "string" ||
    packet.install.admissionEventRef.length === 0 ||
    installDigest === null ||
    packet.sourceRef !== packet.install.installId ||
    packet.sourceDigest !== installDigest
  ) {
    return refusal(
      "install_evidence",
      "source_digest_mismatch",
      "install evidence source differs from its admitted immutable carrier",
      packet,
    );
  }
  const manifest = packet.selector?.manifest;
  if (
    !isRecord(packet.selector) ||
    packet.selector.kind !== "install_manifest" ||
    !isRecord(manifest) ||
    !hasExactKeys(manifest, ["manifestDigest", "manifestRef", "value"]) ||
    typeof manifest.manifestRef !== "string" ||
    manifest.manifestRef.length === 0 ||
    !isSha256Digest(manifest.manifestDigest) ||
    digestJson(manifest.value) !== manifest.manifestDigest
  ) {
    return refusal(
      "install_evidence",
      "projection_basis_mismatch",
      "install evidence requires one exact immutable install manifest",
      packet,
    );
  }
  const projection: InstallEvidenceProjection & JsonValue = {
    kind: "install_evidence_projection",
    subjectRef: packet.install.installId,
    subjectDigest: installDigest,
    productId: packet.install.productId,
    artifactRef: packet.install.installId,
    artifactDigest: packet.install.artifactDigest,
    productContentDigest: packet.install.productContentDigest,
    manifest,
    producer: "ProductInstallPort.install",
    basisRefs: [
      packet.install.resolvedLockId,
      packet.projectionBasis.basisRef,
    ],
    provenanceRefs: [
      packet.install.provenanceRef,
      packet.install.admissionEventRef,
      manifest.manifestRef,
    ].sort(compareUnicodeCodeUnits),
  } as InstallEvidenceProjection & JsonValue;
  return projected(packet, projection);
}

export function projectReleaseEvidence(
  packet: ReleaseEvidenceProjectReadPacket,
): ProductProjectReadRefusal {
  if (
    !validEnvelope(packet, "release_evidence", [
      "releaseSnapshotRefusal",
      "selector",
    ]) ||
    !isRecord(packet.releaseSnapshotRefusal) ||
    packet.releaseSnapshotRefusal.kind !== "release_snapshot_refusal" ||
    packet.releaseSnapshotRefusal.disposition !== "refused" ||
    !isRecord(packet.selector) ||
    !hasExactKeys(packet.selector, ["kind"]) ||
    packet.selector.kind !== "release_snapshot_unavailable"
  ) {
    return refusal(
      "release_evidence",
      "source_kind_mismatch",
      "release evidence requires one exact release-owner outcome",
      packet,
    );
  }
  return refusal(
    "release_evidence",
    "not_ready",
    "release evidence is unavailable until the release owner publishes one immutable cut",
    packet,
    packet.releaseSnapshotRefusal,
  );
}

export function projectConsensusTicket(
  packet: TicketConsensusProjectReadPacket,
): TicketConsensusOperationResult {
  if (
    !validEnvelope(packet, "ticket_consensus", [
      "consensusResult",
      "selector",
    ])
  ) {
    return refusal(
      "ticket_consensus",
      "source_kind_mismatch",
      "ticket consensus requires one exact admitted Consensus result",
      packet,
    );
  }
  const resultDigest = digestJson(packet.consensusResult);
  if (
    !isConsensusResult(packet.consensusResult) ||
    resultDigest === null ||
    packet.sourceRef !== packet.consensusResult.resultRef ||
    packet.sourceDigest !== resultDigest
  ) {
    return refusal(
      "ticket_consensus",
      "source_digest_mismatch",
      "ticket consensus source differs from its admitted result carrier",
      packet,
    );
  }
  if (
    !isRecord(packet.selector) ||
    !hasExactKeys(packet.selector, [
      "kind",
      "outputAuthority",
      "replayBasis",
      "ticket",
    ]) ||
    packet.selector.kind !== "ticket_consensus" ||
    !validCoordinate(packet.selector.ticket) ||
    !validCoordinate(packet.selector.outputAuthority) ||
    !validCoordinate(packet.selector.replayBasis) ||
    packet.selector.ticket.ref !== packet.consensusResult.subjectRef ||
    packet.selector.ticket.digest !== packet.consensusResult.subjectDigest ||
    packet.selector.replayBasis.ref !== packet.consensusResult.replayRef
  ) {
    return refusal(
      "ticket_consensus",
      "projection_basis_mismatch",
      "ticket, output-authority, and replay bases must match the admitted result",
      packet,
    );
  }
  try {
    return projected(
      packet,
      projectTicketConsensus(packet.consensusResult) as
        TicketConsensusProjection & JsonValue,
    );
  } catch (error) {
    return refusal(
      "ticket_consensus",
      "not_ready",
      `ticket consensus projection refused: ${String(error)}`,
      packet,
    );
  }
}

export const CatalogProjectionPort = Object.freeze({
  list: projectCatalogList,
  describe: projectCatalogDescription,
});

export const WorkspaceProjectionPort = Object.freeze({
  status: projectWorkspaceStatus,
});

export const InstallProjectionPort = Object.freeze({
  evidence: projectInstallEvidence,
});

export const ReleaseProjectionPort = Object.freeze({
  evidence: projectReleaseEvidence,
});

export const ConsensusProjectionPort = Object.freeze({
  ticketConsensus: projectConsensusTicket,
});

export const PRODUCT_PROJECT_READ_CONTRACTS = Object.freeze({
  catalog_list: CatalogProjectionPort.list,
  catalog_describe: CatalogProjectionPort.describe,
  workspace_status: WorkspaceProjectionPort.status,
  install_evidence: InstallProjectionPort.evidence,
  release_evidence: ReleaseProjectionPort.evidence,
  ticket_consensus: ConsensusProjectionPort.ticketConsensus,
});
