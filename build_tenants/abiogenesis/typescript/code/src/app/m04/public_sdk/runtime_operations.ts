// Implements: T-223 DS-1 M04 installed catalog SDK runtime operations
// Implements: REQ-P-CATALOG, REQ-P-PUBLIC-CONTRACTS

import { join } from "node:path";

import {
  admitBoundWorkspaceCatalog,
  admitOpaqueCatalogAssetDeclaration,
  deriveRegistrySessionView,
  type AdmittedRuntimeCatalogBasis,
  type BoundCatalogAdmissionBatch,
  type BoundCatalogProductBatch,
  type CatalogAdmissionDeclaration,
  type RegistrySessionEntry,
  type RegistrySessionView,
  type RuntimeLibraryCatalogAdmissionDeclaration
} from "../../../abg/m03/contracts/runtime_catalog.js";
import {
  assertCanonicalRuntimeEventSequence
} from "../../../abg/m03/contracts/event_admission.js";
import {
  sortReplayByAdmissionOrdinalFailClosed
} from "../../../abg/m03/contracts/admission_hygiene.js";
import {
  admitWorkspaceRuntimeEventBytes,
  assembleCatalogInvocation,
  admitPublicOperationAttribution,
  invokeAdmittedCatalogGraphFunction,
  projectRuntimePublicReplay,
  projectRuntimePublicResult,
  type AdmittedWorkspaceReplay
} from "../../../abg/m03/runner/index.js";
import { admitModule } from "../../../gtl/m02/admission/carriers.js";
import {
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig
} from "../../../gtl/m02/contracts/runtime_registry.js";
import {
  stableJson,
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  admitCatalogContributionManifest,
  admitProductToolchainManifest,
  admitPublicCatalogDescription,
  admitPublicCatalogRow,
  admitPublicContractCatalog,
  admitPublicSdkWorkspaceManifest,
  admitPublicSessionCatalogView,
  admitToolchainWorkspaceBindingV3,
  resolvePublicOperationContract
} from "./carrier_admission.js";
import {
  admitHostInvocationDescriptor,
  admitPublicOperationInvocationEnvelope
} from "./operation_admission.js";
import type {
  AbiogenesisPublicSdk,
  AnyPublicOperationInvocationEnvelope,
  BoundWorkspaceContext,
  CatalogAdmitRefusal,
  CatalogAdmitResult,
  CatalogAllowRefusal,
  CatalogAllowResult,
  CatalogContributionManifest,
  CatalogContributionRow,
  CatalogDescribeRefusal,
  CatalogDescribeResult,
  CatalogInvokeRefusal,
  CatalogInvokeResult,
  CatalogListRefusal,
  CatalogListResult,
  ProductToolchainManifest,
  PublicCatalogDescription,
  PublicCatalogRow,
  PublicContractCatalog,
  PublicOperationId,
  PublicOperationInvocationEnvelope,
  PublicResultProjection,
  PublicSessionCatalogView,
  ReadReplayRefusal,
  ReadReplayResult,
  ReadResultRefusal,
  ReadResultResult,
  ToolchainProductBindingV3
} from "./carriers.js";

const ABG_PRODUCT_ID = "abiogenesis";
const RUNTIME_CATALOG_VERSION = "1.0.0";

interface BoundProductSource {
  readonly binding: ToolchainProductBindingV3;
  readonly manifest: ProductToolchainManifest;
  readonly contribution: CatalogContributionManifest;
}

interface BoundCatalogState {
  readonly sources: readonly BoundProductSource[];
  readonly abg: BoundProductSource;
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: `sha256:${string}`;
  readonly batch: BoundCatalogAdmissionBatch;
  readonly rowsByHandle: ReadonlyMap<string, {
    readonly source: BoundProductSource;
    readonly row: CatalogContributionRow;
  }>;
}

class BoundCatalogFailure extends Error {
  public constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

function refusal<K extends PublicOperationId, C extends string>(input: {
  readonly operationId: K;
  readonly code: C;
  readonly message: string;
  readonly residualRefs?: readonly string[];
  readonly provenanceRefs?: readonly string[];
}) {
  return Object.freeze({
    kind: "refused" as const,
    operationId: input.operationId,
    code: input.code,
    message: input.message,
    residualRefs: Object.freeze([...(input.residualRefs ?? [])]),
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "refused" as const
  });
}

function accepted<K extends PublicOperationId, D extends string, V>(input: {
  readonly operationId: K;
  readonly disposition: D;
  readonly value: V;
  readonly provenanceRefs?: readonly string[];
}) {
  return Object.freeze({
    kind: "accepted" as const,
    operationId: input.operationId,
    disposition: input.disposition,
    value: input.value,
    provenanceRefs: Object.freeze([...(input.provenanceRefs ?? [])]),
    exitClassification: "accepted_terminal" as const
  });
}

function recordRoot(
  context: BoundWorkspaceContext,
  product: ToolchainProductBindingV3
): string {
  return join(
    context.binding.toolchainRoot,
    "records",
    product.publisher,
    product.productId,
    product.version,
    product.artifactDigest.slice("sha256:".length)
  );
}

async function requireRecord(
  context: BoundWorkspaceContext,
  absolutePath: string,
  label: string
): Promise<IJsonValue> {
  const value = await context.effects.readRecord(absolutePath);
  if (value === null) {
    throw new BoundCatalogFailure("catalog_stale", `${label} is missing`);
  }
  return value;
}

function admitBoundContext(context: BoundWorkspaceContext): void {
  if (context.kind !== "bound_workspace") {
    throw new BoundCatalogFailure("unbound", "operation requires bound_workspace context");
  }
  const workspace = admitPublicSdkWorkspaceManifest(context.workspaceManifest);
  const binding = admitToolchainWorkspaceBindingV3(context.binding);
  const publicContractCatalog = admitPublicContractCatalog(
    context.publicContractCatalog,
    "BoundWorkspaceContext.publicContractCatalog"
  );
  if (
    workspace.workspaceId !== binding.workspaceId ||
    workspace.root !== binding.targetRoot ||
    stableSha256Digest(workspace) !== binding.workspaceManifestDigest
  ) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      "workspace manifest and exact product binding disagree"
    );
  }
  const abgBindings = binding.products.filter(
    (product) => product.productId === ABG_PRODUCT_ID
  );
  const abgBinding = abgBindings[0];
  if (
    abgBindings.length !== 1 ||
    abgBinding === undefined ||
    abgBinding.publicContractCatalogId !== publicContractCatalog.catalogId ||
    abgBinding.publicContractCatalogVersion !== publicContractCatalog.catalogVersion ||
    abgBinding.publicContractCatalogDigest !== publicContractCatalog.catalogDigest
  ) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      "bound SDK contract catalog does not match the exact Abiogenesis product binding"
    );
  }
}

async function loadBoundProductSources(
  context: BoundWorkspaceContext
): Promise<readonly BoundProductSource[]> {
  admitBoundContext(context);
  const sources: BoundProductSource[] = [];
  for (const product of context.binding.products) {
    const manifest = admitProductToolchainManifest(
      await requireRecord(context, product.manifestPath, "bound product manifest")
    );
    const contribution = admitCatalogContributionManifest(
      await requireRecord(
        context,
        join(recordRoot(context, product), "contribution-manifest.json"),
        "bound contribution manifest"
      )
    );
    if (
      manifest.productId !== product.productId ||
      manifest.packageVersion !== product.version ||
      manifest.productContentDigest !== product.productContentDigest ||
      manifest.publicContractCatalog.catalogId !== product.publicContractCatalogId ||
      manifest.publicContractCatalog.catalogVersion !==
        product.publicContractCatalogVersion ||
      manifest.publicContractCatalog.catalogDigest !==
        product.publicContractCatalogDigest ||
      contribution.contributionId !== product.contributionId ||
      contribution.contributionDigest !== product.contributionDigest ||
      contribution.descriptorId !== product.descriptorId ||
      contribution.artifactDigest !== product.artifactDigest
    ) {
      throw new BoundCatalogFailure(
        "catalog_stale",
        `bound product identity is stale for ${product.productId}`
      );
    }
    sources.push(Object.freeze({ binding: product, manifest, contribution }));
  }
  return Object.freeze(sources);
}

function runtimeCatalogIdentity(input: {
  readonly context: BoundWorkspaceContext;
  readonly sources: readonly BoundProductSource[];
}): {
  readonly catalogId: string;
  readonly catalogVersion: string;
  readonly catalogDigest: `sha256:${string}`;
} {
  const catalogId = `catalog:${input.context.binding.bindingId}`;
  return Object.freeze({
    catalogId,
    catalogVersion: RUNTIME_CATALOG_VERSION,
    catalogDigest: stableSha256Digest({
      catalogId,
      catalogVersion: RUNTIME_CATALOG_VERSION,
      workspaceId: input.context.binding.workspaceId,
      bindingId: input.context.binding.bindingId,
      resolvedLockId: input.context.binding.resolvedLockId,
      productSetDigest: input.context.binding.productSetDigest,
      contributions: input.sources.map((source) => Object.freeze({
        productId: source.binding.productId,
        version: source.binding.version,
        contributionId: source.contribution.contributionId,
        contributionDigest: source.contribution.contributionDigest
      }))
    })
  });
}

async function runtimeDeclaration(input: {
  readonly context: BoundWorkspaceContext;
  readonly source: BoundProductSource;
  readonly row: CatalogContributionRow;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}): Promise<CatalogAdmissionDeclaration> {
  const locator = input.row.locator;
  if (locator.kind === "opaque_overlay_asset") {
    return Object.freeze({
      kind: "opaque_catalog_asset" as const,
      declaration: admitOpaqueCatalogAssetDeclaration({
        kind: "opaque_catalog_asset_declaration",
        workspaceId: input.context.binding.workspaceId,
        bindingId: input.context.binding.bindingId,
        catalogId: `catalog:${input.context.binding.bindingId}`,
        entryRef: input.row.canonicalHandle,
        declarationRef: input.row.declarationRef,
        declarationDigest: locator.assetDigest,
        libraryScope:
          input.source.binding.productId === ABG_PRODUCT_ID ? "system" : "product",
        assetKind: "overlay",
        namespace: input.source.binding.productId,
        ownerRef: input.source.binding.publisher,
        version: input.source.binding.version,
        descriptorRef: input.source.binding.descriptorId,
        contributionManifestRef: input.source.contribution.contributionId,
        resolvedLockRef: input.context.binding.resolvedLockId,
        assetPath: locator.assetPath,
        schemaId: locator.schemaId,
        schemaVersion: locator.schemaVersion,
        schemaDigest: locator.schemaDigest,
        assetDigest: locator.assetDigest,
        authorityRefs: [input.row.contractRef],
        provenanceRefs: input.row.provenanceRefs,
        readinessRefs: input.row.readinessRefs,
        proofRefs: input.row.proofRefs,
        policyRefs: input.row.policyRefs,
        refinementOfEntryRef: input.row.refinementOfHandle,
        overrideOfEntryRef: input.row.overrideOfHandle,
        causationEventRefs: input.causationEventRefs,
        correlationId: input.correlationId
      })
    });
  }
  if (input.row.interfaceRef === null) {
    throw new BoundCatalogFailure(
      "malformed_declaration",
      `${input.row.canonicalHandle} has no callable/type interface`
    );
  }
  const moduleValue = await requireRecord(
    input.context,
    join(input.source.binding.productRoot, locator.modulePath),
    `Module for ${input.row.canonicalHandle}`
  );
  let module;
  try {
    module = admitModule(moduleValue, `Module(${input.row.canonicalHandle})`);
  } catch (error: unknown) {
    throw new BoundCatalogFailure(
      "malformed_declaration",
      error instanceof Error ? error.message : "installed Module is malformed"
    );
  }
  const libraryScope =
    input.source.binding.productId === ABG_PRODUCT_ID ? "system" : "product";
  return Object.freeze({
    kind: "runtime_library_entry" as const,
    moduleRef: `${input.source.contribution.contributionId}#${locator.modulePath}`,
    module,
    declaration: constructGtlLibraryEntryDeclaration({
      declarationRef: input.row.declarationRef,
      entryRef: input.row.canonicalHandle,
      libraryScope,
      entryKind: input.row.publicKind,
      namespace: input.source.binding.productId,
      ownerRef: input.source.binding.publisher,
      version: input.source.binding.version,
      graphFunctionRef: locator.declarationRef,
      interfaceRef: input.row.interfaceRef,
      sourceContractRef: input.row.contractRef,
      targetContractRef: input.row.contractRef,
      authorityRefs: [input.row.contractRef],
      overlayRefs: [
        ...(input.row.refinementOfHandle === null
          ? []
          : [input.row.refinementOfHandle]),
        ...(input.row.overrideOfHandle === null ? [] : [input.row.overrideOfHandle])
      ],
      provenanceRefs: input.row.provenanceRefs,
      readinessRefs: input.row.readinessRefs,
      proofRefs: input.row.proofRefs,
      policyRefs: input.row.policyRefs,
      refinementOfEntryRef: input.row.refinementOfHandle,
      overrideOfEntryRef: input.row.overrideOfHandle,
      declarationSourceRefs: [
        `${input.source.contribution.contributionId}#${locator.modulePath}`
      ]
    })
  });
}

async function buildBoundCatalogState(
  context: BoundWorkspaceContext,
  correlationId: string,
  causationEventRefs: readonly string[]
): Promise<BoundCatalogState> {
  const sources = await loadBoundProductSources(context);
  const abgSources = sources.filter(
    (source) => source.binding.productId === ABG_PRODUCT_ID
  );
  if (abgSources.length !== 1) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      "bound catalog requires one exact Abiogenesis product"
    );
  }
  const abg = abgSources[0];
  if (abg === undefined || abg.manifest.runtimeSystemProfile === null) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      "bound Abiogenesis product has no runtime-system profile"
    );
  }
  const identity = runtimeCatalogIdentity({ context, sources });
  const systemDeclarations: RuntimeLibraryCatalogAdmissionDeclaration[] = [];
  const orderedProductBatches: BoundCatalogProductBatch[] = [];
  const rowsByHandle = new Map<string, {
    readonly source: BoundProductSource;
    readonly row: CatalogContributionRow;
  }>();

  for (const source of sources) {
    const declarations: CatalogAdmissionDeclaration[] = [];
    for (const row of source.contribution.rows) {
      if (!rowsByHandle.has(row.canonicalHandle)) {
        rowsByHandle.set(row.canonicalHandle, Object.freeze({ source, row }));
      }
      const declaration = await runtimeDeclaration({
        context,
        source,
        row,
        causationEventRefs,
        correlationId
      });
      if (source.binding.productId === ABG_PRODUCT_ID) {
        if (declaration.kind !== "runtime_library_entry") {
          throw new BoundCatalogFailure(
            "malformed_declaration",
            "DS-1 ABG system contributions must be Module-backed declarations"
          );
        }
        systemDeclarations.push(declaration);
      } else {
        declarations.push(declaration);
      }
    }
    if (source.binding.productId !== ABG_PRODUCT_ID) {
      orderedProductBatches.push(Object.freeze({
        kind: "bound_catalog_product_batch",
        descriptorRef: source.binding.descriptorId,
        contributionManifestRef: source.contribution.contributionId,
        productStartupConfig: constructProductRegistryStartupConfig({
          configRef: `product-registry-startup:${source.contribution.contributionId}`,
          productNamespace: source.binding.productId,
          ownerRef: source.binding.publisher,
          version: source.binding.version,
          enabledLibraryRefs: source.contribution.rows.map(
            (row) => row.canonicalHandle
          ),
          overlayRefs: source.contribution.rows
            .filter((row) => row.publicKind === "overlay")
            .map((row) => row.canonicalHandle),
          readinessRefs: [...new Set(
            source.contribution.rows.flatMap((row) => row.readinessRefs)
          )],
          proofRefs: [...new Set(
            source.contribution.rows.flatMap((row) => row.proofRefs)
          )],
          policyRefs: [...new Set(
            source.contribution.rows.flatMap((row) => row.policyRefs)
          )],
          configSourceRefs: [source.contribution.contributionId]
        }),
        declarations: Object.freeze(declarations)
      }));
    }
  }

  return Object.freeze({
    sources,
    abg,
    ...identity,
    batch: Object.freeze({
      kind: "bound_catalog_admission_batch",
      workspaceId: context.binding.workspaceId,
      bindingId: context.binding.bindingId,
      catalogId: identity.catalogId,
      resolvedLockRef: context.binding.resolvedLockId,
      systemDeclarations: Object.freeze(systemDeclarations),
      orderedProductBatches: Object.freeze(orderedProductBatches),
      causationEventRefs: Object.freeze([...causationEventRefs]),
      correlationId
    }),
    rowsByHandle
  });
}

async function readAdmittedReplay(
  context: BoundWorkspaceContext
): Promise<AdmittedWorkspaceReplay> {
  return admitWorkspaceRuntimeEventBytes(
    await context.effects.readRuntimeEventBytes()
  );
}

function assertStateContractCatalog(
  context: BoundWorkspaceContext,
  state: BoundCatalogState
): void {
  if (!stableJsonEquals(
    context.publicContractCatalog,
    state.abg.manifest.publicContractCatalog
  )) {
    throw new BoundCatalogFailure(
      "catalog_stale",
      "bound SDK contract catalog differs from installed Abiogenesis truth"
    );
  }
}

function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.admit"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.list">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.list"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.list">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.describe"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.allow"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.catalog.invoke"
): PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.read.result">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.read.result"
): PublicOperationInvocationEnvelope<"abg.operation.read.result">;
function admittedEnvelope(
  input: PublicOperationInvocationEnvelope<"abg.operation.read.replay">,
  catalog: PublicContractCatalog,
  operationId: "abg.operation.read.replay"
): PublicOperationInvocationEnvelope<"abg.operation.read.replay">;
function admittedEnvelope(
  input: unknown,
  catalog: PublicContractCatalog,
  operationId: PublicOperationId
): AnyPublicOperationInvocationEnvelope {
  const envelope = admitPublicOperationInvocationEnvelope(
    input,
    resolvePublicOperationContract(catalog, operationId)
  );
  if (envelope.operationId !== operationId) {
    throw new BoundCatalogFailure(
      "binding_mismatch",
      `expected ${operationId} invocation`
    );
  }
  return envelope;
}

function rehydrateBasis(input: {
  readonly state: BoundCatalogState;
  readonly replay: AdmittedWorkspaceReplay;
}): AdmittedRuntimeCatalogBasis {
  const noReadSideEffect = (): never => {
    throw new BoundCatalogFailure(
      "catalog_stale",
      "catalog read cannot admit missing runtime catalog truth"
    );
  };
  const result = admitBoundWorkspaceCatalog(
    input.state.batch,
    noReadSideEffect,
    input.replay.orderedEvents
  );
  if (!result.accepted || result.basis === null || result.admissionEvents.length > 0) {
    throw new BoundCatalogFailure(
      "catalog_stale",
      "runtime catalog admission truth is missing or rejected"
    );
  }
  return result.basis;
}

function publicRow(input: {
  readonly state: BoundCatalogState;
  readonly entry: RegistrySessionEntry;
  readonly sessionVisible: boolean;
}): PublicCatalogRow {
  const sourceRow = input.state.rowsByHandle.get(input.entry.entryRef);
  if (sourceRow === undefined) {
    throw new BoundCatalogFailure(
      "catalog_stale",
      `runtime entry ${input.entry.entryRef} has no bound contribution row`
    );
  }
  const locator = sourceRow.row.locator;
  return admitPublicCatalogRow({
    canonicalHandle: sourceRow.row.canonicalHandle,
    runtimeEntryRef: input.entry.entryRef,
    kind: sourceRow.row.publicKind,
    ownerProductId: sourceRow.source.binding.productId,
    ownerVersion: sourceRow.source.binding.version,
    descriptorId: sourceRow.source.binding.descriptorId,
    contributionId: sourceRow.source.contribution.contributionId,
    artifactDigest: sourceRow.source.binding.artifactDigest,
    resolvedLockId: input.state.batch.resolvedLockRef,
    compatible: sourceRow.source.binding.compatibility.compatible,
    ready: input.entry.ready,
    readinessBlockers: input.entry.ready ? [] : ["readiness_unsatisfied"],
    eligible: input.entry.ready && input.sessionVisible,
    callable: input.entry.callable,
    sessionVisible: input.sessionVisible,
    contractRef: sourceRow.row.contractRef,
    schemaRefs:
      locator.kind === "opaque_overlay_asset"
        ? [locator.schemaId, locator.schemaDigest]
        : ["abg.schema.gtl-module", locator.moduleDigest],
    provenanceRefs: [
      ...new Set([
        ...sourceRow.row.provenanceRefs,
        ...input.entry.sourceEventRefs
      ])
    ]
  });
}

function publicDescription(input: {
  readonly state: BoundCatalogState;
  readonly entry: RegistrySessionEntry;
}): PublicCatalogDescription {
  const row = publicRow({ state: input.state, entry: input.entry, sessionVisible: true });
  const sourceRow = input.state.rowsByHandle.get(input.entry.entryRef);
  if (sourceRow === undefined) {
    throw new BoundCatalogFailure("catalog_stale", "catalog source row disappeared");
  }
  return admitPublicCatalogDescription({
    ...row,
    declarationRef: sourceRow.row.declarationRef,
    interfaceRef: sourceRow.row.interfaceRef,
    dependencyRefs: [
      ...sourceRow.row.compatibility.requiredProductRefs,
      ...sourceRow.row.compatibility.requiredContractRefs,
      ...sourceRow.row.compatibility.requiredCapabilityRefs
    ],
    policyRefs: sourceRow.row.policyRefs,
    capabilityRefs: sourceRow.row.capabilityRefs,
    proofRefs: sourceRow.row.proofRefs
  });
}

function publicSessionView(input: {
  readonly state: BoundCatalogState;
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly view: RegistrySessionView;
}): PublicSessionCatalogView {
  const rows = input.view.entries.map((entry) =>
    publicRow({ state: input.state, entry, sessionVisible: true })
  );
  return admitPublicSessionCatalogView({
    kind: "public_session_catalog_view",
    workspaceId: input.basis.workspaceId,
    catalogId: input.state.catalogId,
    catalogVersion: input.state.catalogVersion,
    catalogDigest: input.state.catalogDigest,
    runtimeCatalogProjectionRef: input.basis.runtimeCatalogProjectionRef,
    effectiveSessionViewId: input.view.sessionViewRef,
    allowedHandles: rows.map((row) => row.canonicalHandle),
    allowedEntryRefs: input.view.allowedEntryRefs,
    rows
  });
}

function derivePublicSession(input: {
  readonly state: BoundCatalogState;
  readonly basis: AdmittedRuntimeCatalogBasis;
  readonly allowedHandles: readonly string[] | null;
  readonly suppliedView: PublicSessionCatalogView | null;
}): PublicSessionCatalogView {
  const allowedEntryRefs =
    input.suppliedView !== null
      ? input.suppliedView.allowedEntryRefs
      : input.allowedHandles === null
        ? undefined
        : input.allowedHandles.map((handle) =>
            input.state.rowsByHandle.has(handle) ? handle : handle
          );
  const derived = deriveRegistrySessionView({
    basis: input.basis,
    ...(allowedEntryRefs === undefined ? {} : { allowedEntryRefs })
  });
  if (!derived.accepted || derived.view === null) {
    const residual = derived.residuals[0];
    throw new BoundCatalogFailure(
      residual?.reason ?? "catalog_stale",
      residual === undefined
        ? "session view could not be derived"
        : `${residual.reason}: ${residual.entryRef}`
    );
  }
  const view = publicSessionView({
    state: input.state,
    basis: input.basis,
    view: derived.view
  });
  if (input.suppliedView !== null && !stableJsonEquals(view, input.suppliedView)) {
    throw new BoundCatalogFailure(
      "view_mismatch",
      "supplied public session view does not match current replay truth"
    );
  }
  return view;
}

function stateIdentityMatches(input: {
  readonly context: BoundWorkspaceContext;
  readonly state: BoundCatalogState;
  readonly workspaceId: string;
  readonly catalogId?: string | undefined;
  readonly bindingId?: string | undefined;
  readonly resolvedLockId?: string | undefined;
}): boolean {
  return (
    input.workspaceId === input.context.binding.workspaceId &&
    (input.catalogId === undefined || input.catalogId === input.state.catalogId) &&
    (input.bindingId === undefined || input.bindingId === input.context.binding.bindingId) &&
    (input.resolvedLockId === undefined ||
      input.resolvedLockId === input.context.binding.resolvedLockId)
  );
}

export async function catalogAdmit(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.admit">
): Promise<CatalogAdmitResult | CatalogAdmitRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.admit"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    const request = admittedInvocation.request;
    if (
      !stateIdentityMatches({
        context,
        state,
        workspaceId: request.workspaceId,
        bindingId: request.bindingId,
        resolvedLockId: request.resolvedLockId
      }) ||
      request.productSetDigest !== context.binding.productSetDigest
    ) {
      return refusal({
        operationId: "abg.operation.catalog.admit",
        code: "binding_mismatch",
        message: "catalog admission request does not match the bound workspace"
      });
    }
    const replay = await readAdmittedReplay(context);
    if (admittedInvocation.actorRef === null) {
      throw new BoundCatalogFailure(
        "binding_mismatch",
        "catalog admission requires actor attribution"
      );
    }
    const eventSink = context.effects.createRuntimeEventSink();
    const attributionEvent = admitPublicOperationAttribution({
      operationId: "abg.operation.catalog.admit",
      invocationId: admittedInvocation.invocationId,
      requestId: admittedInvocation.requestId,
      actorRef: admittedInvocation.actorRef,
      workspaceId: context.binding.workspaceId,
      bindingId: context.binding.bindingId,
      catalogId: state.catalogId,
      capabilityProvenanceRefs: Object.freeze([]),
      causationEventRefs: Object.freeze([]),
      correlationId: admittedInvocation.correlationId,
      priorEvents: replay.orderedEvents,
      eventSink
    });
    const result = admitBoundWorkspaceCatalog(
      Object.freeze({
        ...state.batch,
        causationEventRefs: Object.freeze([attributionEvent.eventId])
      }),
      eventSink,
      Object.freeze([...replay.orderedEvents, attributionEvent])
    );
    const rows = result.rowDispositions.map((row) => Object.freeze({
      canonicalHandle: row.entryRef,
      disposition:
        row.disposition === "rejected" ? ("rejected" as const) : ("admitted" as const),
      reason: row.rejectionReason,
      eventRefs: Object.freeze(row.eventRef === null ? [] : [row.eventRef])
    }));
    if (!result.accepted || result.basis === null) {
      return refusal({
        operationId: "abg.operation.catalog.admit",
        code: "required_row_rejected",
        message: "one or more required catalog rows were rejected",
        residualRefs: result.rejectedDeclarationRefs
      });
    }
    return accepted({
      operationId: "abg.operation.catalog.admit",
      disposition: "admitted",
      value: Object.freeze({
        catalogId: state.catalogId,
        catalogVersion: state.catalogVersion,
        catalogDigest: state.catalogDigest,
        rows: Object.freeze(rows)
      }),
      provenanceRefs: [
        ...(admittedInvocation.actorRef === null
          ? []
          : [admittedInvocation.actorRef]),
        ...admittedInvocation.provenanceRefs,
        attributionEvent.eventId,
        ...result.admissionEvents.map((event) => event.eventId)
      ]
    });
  } catch (error: unknown) {
    const failure = error instanceof BoundCatalogFailure ? error : null;
    const code =
      failure?.code === "unbound"
        ? "unbound"
        : failure?.code === "binding_mismatch"
          ? "binding_mismatch"
          : failure?.code === "product_conflict"
            ? "product_conflict"
            : failure?.code === "malformed_declaration"
              ? "malformed_declaration"
              : "lock_mismatch";
    return refusal({
      operationId: "abg.operation.catalog.admit",
      code,
      message: error instanceof Error ? error.message : "catalog admission failed"
    });
  }
}

export async function catalogList(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.list">
): Promise<CatalogListResult | CatalogListRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.list"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: admittedInvocation.request.workspaceId,
      catalogId: admittedInvocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("catalog_missing", "catalog identity is not bound");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, replay });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: admittedInvocation.request.allowedHandles,
      suppliedView: admittedInvocation.request.sessionView
    });
    return accepted({
      operationId: "abg.operation.catalog.list",
      disposition: "listed",
      value: Object.freeze(
        view.rows.filter((row) =>
          admittedInvocation.request.kinds.includes(row.kind)
        )
      ),
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const code =
      error instanceof BoundCatalogFailure && error.code === "catalog_missing"
        ? "catalog_missing"
        : error instanceof BoundCatalogFailure && error.code === "view_mismatch"
          ? "view_mismatch"
          : "catalog_stale";
    return refusal({
      operationId: "abg.operation.catalog.list",
      code,
      message: error instanceof Error ? error.message : "catalog list failed"
    });
  }
}

export async function catalogDescribe(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.describe">
): Promise<CatalogDescribeResult | CatalogDescribeRefusal> {
  admitBoundContext(context);
  const admittedInvocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.describe"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      admittedInvocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: admittedInvocation.request.workspaceId,
      catalogId: admittedInvocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("catalog_missing", "catalog identity is not bound");
    }
    if (!state.rowsByHandle.has(admittedInvocation.request.handle)) {
      throw new BoundCatalogFailure("unknown_handle", "catalog handle is unknown");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, replay });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: admittedInvocation.request.allowedHandles,
      suppliedView: admittedInvocation.request.sessionView
    });
    const row = view.rows.find(
      (candidate) =>
        candidate.canonicalHandle === admittedInvocation.request.handle
    );
    if (row === undefined) {
      throw new BoundCatalogFailure("hidden_by_view", "catalog handle is hidden by the effective view");
    }
    const sessionEntry = deriveRegistrySessionView({
      basis,
      allowedEntryRefs: [row.runtimeEntryRef]
    }).view?.entries[0];
    if (sessionEntry === undefined) {
      throw new BoundCatalogFailure("stale", "catalog description basis is stale");
    }
    return accepted({
      operationId: "abg.operation.catalog.describe",
      disposition: "described",
      value: publicDescription({ state, entry: sessionEntry }),
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "stale";
    const code =
      known === "catalog_missing" ||
      known === "unknown_handle" ||
      known === "hidden_by_view"
        ? known
        : "stale";
    return refusal({
      operationId: "abg.operation.catalog.describe",
      code,
      message: error instanceof Error ? error.message : "catalog describe failed"
    });
  }
}

export async function catalogAllow(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.allow">
): Promise<CatalogAllowResult | CatalogAllowRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.allow"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      invocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    if (!stateIdentityMatches({
      context,
      state,
      workspaceId: invocation.request.workspaceId,
      catalogId: invocation.request.catalogId
    })) {
      throw new BoundCatalogFailure("unknown_handle", "catalog identity is not bound");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, replay });
    const view = derivePublicSession({
      state,
      basis,
      allowedHandles: invocation.request.handles,
      suppliedView: null
    });
    return accepted({
      operationId: "abg.operation.catalog.allow",
      disposition: "allowed",
      value: view,
      provenanceRefs: [basis.runtimeCatalogProjectionRef]
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "inadmissible";
    const code =
      known === "duplicate_handle" ||
      known === "unknown_handle" ||
      known === "unready"
        ? known
        : "inadmissible";
    return refusal({
      operationId: "abg.operation.catalog.allow",
      code,
      message: error instanceof Error ? error.message : "catalog allow failed"
    });
  }
}

function publicResult(
  value: ReturnType<typeof projectRuntimePublicResult>
): PublicResultProjection {
  if (value === null) {
    throw new BoundCatalogFailure("unknown_identity", "runtime result is unknown");
  }
  return Object.freeze({ ...value });
}

function catalogInvokeRefusalCode(
  input: string
): CatalogInvokeRefusal["code"] {
  switch (input) {
    case "catalog_stale":
    case "view_mismatch":
    case "disallowed":
    case "non_callable":
    case "unready":
    case "interface_mismatch":
    case "input_invalid":
    case "missing_capability":
    case "preflight_failure":
    case "runtime_refused":
      return input;
    default:
      return "runtime_refused";
  }
}

export async function catalogInvoke(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.catalog.invoke">
): Promise<CatalogInvokeResult | CatalogInvokeRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.catalog.invoke"
  );
  try {
    const state = await buildBoundCatalogState(
      context,
      invocation.correlationId,
      Object.freeze([])
    );
    assertStateContractCatalog(context, state);
    const request = invocation.request;
    if (
      !stateIdentityMatches({
        context,
        state,
        workspaceId: request.workspaceId,
        catalogId: request.catalogId,
        bindingId: request.bindingId,
        resolvedLockId: request.resolvedLockId
      }) ||
      request.catalogVersion !== state.catalogVersion ||
      request.catalogDigest !== state.catalogDigest
    ) {
      throw new BoundCatalogFailure("catalog_stale", "catalog invoke request identity is stale");
    }
    const replay = await readAdmittedReplay(context);
    const basis = rehydrateBasis({ state, replay });
    const session = derivePublicSession({
      state,
      basis,
      allowedHandles: request.allowedHandles,
      suppliedView: request.sessionView
    });
    const hostSchema = state.abg.manifest.publicContractCatalog.rows.find(
      (row) => row.contractId === "abg.schema.host-invocation"
    );
    if (hostSchema === undefined) {
      throw new BoundCatalogFailure(
        "catalog_stale",
        "bound ABG product has no host-invocation schema contract"
      );
    }
    const descriptorInput = Object.freeze({
      ...invocation,
      contractCatalogVersion:
        state.abg.manifest.publicContractCatalog.catalogVersion,
      contractCatalogDigest:
        state.abg.manifest.publicContractCatalog.catalogDigest,
      workspaceId: request.workspaceId,
      workspaceManifestDigest: context.binding.workspaceManifestDigest,
      productSetDigest: context.binding.productSetDigest,
      productBindingRefs: context.binding.productBindingRefs,
      bindingId: request.bindingId,
      resolvedLockId: request.resolvedLockId,
      catalogId: request.catalogId,
      catalogVersion: request.catalogVersion,
      catalogDigest: request.catalogDigest,
      runtimeCatalogProjectionRef: session.runtimeCatalogProjectionRef,
      effectiveSessionViewId: session.effectiveSessionViewId,
      allowedHandles: session.allowedHandles,
      allowedEntryRefs: session.allowedEntryRefs,
      graphFunctionHandle: request.graphFunctionHandle,
      interfaceRef: request.interfaceRef,
      inputId: request.inputId,
      inputSchemaId: request.inputSchemaId,
      inputSchemaVersion: request.inputSchemaVersion,
      inputSchemaDigest: request.inputSchemaDigest,
      requiredCapabilityRefs: request.requiredCapabilityRefs,
      transportSteering: request.transportSteering,
      mode: "invoke",
      scope: "graph_function",
      target: request.graphFunctionHandle,
      until: "converged",
      ...(request.inputRef === undefined
        ? { input: request.input }
        : { inputRef: request.inputRef })
    });
    const descriptor = admitHostInvocationDescriptor(
      descriptorInput,
      resolvePublicOperationContract(
        context.publicContractCatalog,
        "abg.operation.catalog.invoke"
      ),
      hostSchema
    );
    let pluginCapabilities;
    let availableLivePluginRefs: readonly string[] = Object.freeze([]);
    let capabilityProvenanceRefs: readonly string[] = Object.freeze([]);
    if (descriptor.requiredCapabilityRefs.length > 0) {
      if (descriptor.transportSteering === null) {
        throw new BoundCatalogFailure(
          "missing_capability",
          "requested live capabilities require declared transport steering"
        );
      }
      const factories = descriptor.requiredCapabilityRefs.map((ref) => {
        const factory = context.effects.operatorCapabilityFactories[ref];
        if (factory === undefined) {
          throw new BoundCatalogFailure(
            "missing_capability",
            `operator capability factory is unavailable for ${ref}`
          );
        }
        return factory;
      });
      const steering = descriptor.transportSteering;
      if (steering === null) {
        throw new BoundCatalogFailure(
          "missing_capability",
          "capability factories require admitted transport steering"
        );
      }
      let bindings;
      try {
        bindings = factories.map((factory) => factory({
          workspaceRoot: context.workspaceManifest.root,
          archiveRoot: context.binding.mutableStateRoots.archiveRoot,
          steering
        }));
      } catch (error: unknown) {
        throw new BoundCatalogFailure(
          "preflight_failure",
          `operator capability preflight failed: ${
            error instanceof Error ? error.message : "capability construction failed"
          }`
        );
      }
      const first = bindings[0];
      if (
        first === undefined ||
        bindings.some((binding) =>
          !stableJsonEquals(binding.projection, first.projection)
        )
      ) {
        throw new BoundCatalogFailure(
          "preflight_failure",
          "requested capability refs do not resolve to one execution-equivalent binding"
        );
      }
      pluginCapabilities = first.pluginCapabilities;
      availableLivePluginRefs = first.projection.availableLivePluginRefs;
      capabilityProvenanceRefs = Object.freeze([
        first.projection.capabilityRef,
        first.projection.capabilityDigest,
        first.projection.executionContractDigest
      ]);
    }
    const profile = state.abg.manifest.runtimeSystemProfile;
    if (profile === null) {
      throw new BoundCatalogFailure("runtime_refused", "ABG runtime profile is absent");
    }
    const selectedRow = state.rowsByHandle.get(descriptor.graphFunctionHandle);
    if (selectedRow === undefined) {
      throw new BoundCatalogFailure("disallowed", "selected catalog handle is unresolved");
    }
    const selectedPublicRow = session.rows.find(
      (row) => row.canonicalHandle === descriptor.graphFunctionHandle
    );
    if (selectedPublicRow === undefined || !selectedPublicRow.callable) {
      throw new BoundCatalogFailure(
        "non_callable",
        "only an admitted GraphFunction contribution may be invoked"
      );
    }
    const undeclaredCapabilityRefs = selectedRow.row.capabilityRefs.filter(
      (ref) => !descriptor.requiredCapabilityRefs.includes(ref)
    );
    if (undeclaredCapabilityRefs.length > 0) {
      throw new BoundCatalogFailure(
        "missing_capability",
        `invoke omits contribution-required capabilities: ${undeclaredCapabilityRefs.join(",")}`
      );
    }
    const inputContract = selectedRow.source.manifest.publicContractCatalog.rows.find(
      (row) => row.contractId === selectedRow.row.contractRef
    );
    if (
      inputContract?.assetLocator === null ||
      inputContract?.assetLocator === undefined ||
      inputContract.assetLocator.schemaId !== descriptor.inputSchemaId ||
      inputContract.assetLocator.schemaVersion !== descriptor.inputSchemaVersion ||
      inputContract.assetLocator.digest !== descriptor.inputSchemaDigest
    ) {
      throw new BoundCatalogFailure(
        "input_invalid",
        "input schema identity does not match the selected contribution contract"
      );
    }
    const inputSchema = await requireRecord(
      context,
      join(
        selectedRow.source.binding.productRoot,
        inputContract.assetLocator.relativePath
      ),
      `input schema for ${descriptor.graphFunctionHandle}`
    );
    if (stableSha256Digest(inputSchema) !== descriptor.inputSchemaDigest) {
      throw new BoundCatalogFailure(
        "input_invalid",
        "installed input schema content does not match its bound digest"
      );
    }
    const inputValue = "input" in descriptor
      ? descriptor.input
      : await context.effects.readInputAsset(descriptor.inputRef);
    if (inputValue === null) {
      throw new BoundCatalogFailure(
        "input_invalid",
        `input reference is unreadable: ${descriptor.inputRef}`
      );
    }
    const foreignPluginRefs = availableLivePluginRefs.filter(
      (ref) => !profile.standardPluginRefs.includes(ref)
    );
    if (foreignPluginRefs.length > 0) {
      throw new BoundCatalogFailure(
        "preflight_failure",
        `live capability exposes plugin refs outside the bound ABG profile: ${foreignPluginRefs.join(",")}`
      );
    }
    const inputUri =
      `data:application/json;charset=utf-8,${encodeURIComponent(stableJson(inputValue))}`;
    const runtimeSession = deriveRegistrySessionView({
      basis,
      allowedEntryRefs: session.allowedEntryRefs
    });
    if (!runtimeSession.accepted || runtimeSession.view === null) {
      throw new BoundCatalogFailure(
        "view_mismatch",
        "public session view cannot be reconstructed as M03 session truth"
      );
    }
    const assemblyResult = assembleCatalogInvocation({
      basis,
      sessionView: runtimeSession.view,
      entryRef: descriptor.graphFunctionHandle,
      interfaceRef: descriptor.interfaceRef,
      workspaceRoot: context.workspaceManifest.root,
      inputBinding: Object.freeze({
        assetRef: descriptor.inputId,
        assetType: descriptor.inputSchemaId,
        uri: inputUri
      }),
      inputSchema,
      inputValue,
      until: descriptor.until,
      runtimeIdentity: profile.runtimeIdentity,
      resolvedPolicy: profile.resolvedPolicy,
      runtimeEvents: replay.orderedEvents,
      eventSink: context.effects.createRuntimeEventSink(),
      ...(pluginCapabilities === undefined ? {} : { pluginCapabilities }),
      standardPluginRefs: profile.standardPluginRefs,
      capabilityProvenanceRefs,
      actorRef: descriptor.actorRef,
      invocationId: descriptor.invocationId,
      requestId: descriptor.requestId,
      correlationId: descriptor.correlationId
    });
    if (!assemblyResult.accepted) {
      return refusal({
        operationId: "abg.operation.catalog.invoke",
        code: catalogInvokeRefusalCode(assemblyResult.code),
        message: assemblyResult.message
      });
    }
    const runtimeInvocation = await invokeAdmittedCatalogGraphFunction(
      assemblyResult.assembly
    );
    if (!runtimeInvocation.accepted) {
      return refusal({
        operationId: "abg.operation.catalog.invoke",
        code: runtimeInvocation.code,
        message: runtimeInvocation.message
      });
    }
    const combinedReplay = Object.freeze(
      sortReplayByAdmissionOrdinalFailClosed(
        [
      ...replay.orderedEvents,
      runtimeInvocation.attributionEvent,
      runtimeInvocation.selectionEvent,
      ...runtimeInvocation.engineResult.emittedEvents
        ],
        "CatalogInvoke.combinedReplay"
      )
    );
    assertCanonicalRuntimeEventSequence(
      combinedReplay,
      "CatalogInvoke.combinedReplay"
    );
    const graphCall = runtimeInvocation.engineResult.emittedEvents.find(
      (event) => event.kind === "graph_call_opened"
    );
    if (graphCall?.kind !== "graph_call_opened") {
      throw new BoundCatalogFailure("runtime_refused", "runtime emitted no GraphCall truth");
    }
    const projection = projectRuntimePublicResult({
      replay: Object.freeze({
        kind: "admitted_workspace_replay",
        orderedEvents: combinedReplay
      }),
      graphCallId: graphCall.graphCallId
    });
    const value = publicResult(projection);
    if (value.disposition === "converged") {
      return Object.freeze({
        kind: "accepted",
        operationId: "abg.operation.catalog.invoke",
        disposition: "converged",
        value,
        provenanceRefs: [
          descriptor.actorRef,
          ...capabilityProvenanceRefs,
          runtimeInvocation.attributionEvent.eventId,
          ...value.replayRefs
        ],
        exitClassification: "accepted_terminal"
      });
    }
    return Object.freeze({
      kind: "accepted",
      operationId: "abg.operation.catalog.invoke",
      disposition: value.disposition,
      value,
      provenanceRefs: [
        descriptor.actorRef,
        ...capabilityProvenanceRefs,
        runtimeInvocation.attributionEvent.eventId,
        ...value.replayRefs
      ],
      exitClassification: "accepted_non_terminal"
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "runtime_refused";
    return refusal({
      operationId: "abg.operation.catalog.invoke",
      code: catalogInvokeRefusalCode(known),
      message: error instanceof Error ? error.message : "catalog invoke failed"
    });
  }
}

async function boundOperationState(
  context: BoundWorkspaceContext,
  correlationId: string
): Promise<BoundCatalogState> {
  const state = await buildBoundCatalogState(context, correlationId, Object.freeze([]));
  assertStateContractCatalog(context, state);
  return state;
}

export async function readResult(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.read.result">
): Promise<ReadResultResult | ReadResultRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.read.result"
  );
  try {
    await boundOperationState(
      context,
      invocation.correlationId
    );
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure("stale_basis", "result request workspace is stale");
    }
    const replay = await readAdmittedReplay(context);
    const value = publicResult(projectRuntimePublicResult({
      replay,
      ...(invocation.request.resultId === undefined
        ? { graphCallId: invocation.request.graphCallId }
        : { resultId: invocation.request.resultId })
    }));
    return accepted({
      operationId: "abg.operation.read.result",
      disposition: "projected",
      value,
      provenanceRefs: value.replayRefs
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "malformed_replay";
    const code =
      known === "unknown_identity" || known === "stale_basis"
        ? known
        : error instanceof TypeError && /ambiguous/u.test(error.message)
          ? "ambiguous_identity"
          : "malformed_replay";
    return refusal({
      operationId: "abg.operation.read.result",
      code,
      message: error instanceof Error ? error.message : "result projection failed"
    });
  }
}

export async function readReplay(
  context: BoundWorkspaceContext,
  invocationInput: PublicOperationInvocationEnvelope<"abg.operation.read.replay">
): Promise<ReadReplayResult | ReadReplayRefusal> {
  admitBoundContext(context);
  const invocation = admittedEnvelope(
    invocationInput,
    context.publicContractCatalog,
    "abg.operation.read.replay"
  );
  try {
    await boundOperationState(
      context,
      invocation.correlationId
    );
    if (invocation.request.workspaceId !== context.binding.workspaceId) {
      throw new BoundCatalogFailure("stale_basis", "replay request workspace is stale");
    }
    if (
      invocation.request.subject.kind === "workspace" &&
      invocation.request.subject.workspaceId !== context.binding.workspaceId
    ) {
      throw new BoundCatalogFailure("unknown_identity", "replay workspace subject is unknown");
    }
    const replay = await readAdmittedReplay(context);
    const value = projectRuntimePublicReplay({
      replay,
      subject: invocation.request.subject,
      fromOrdinal: invocation.request.fromOrdinal,
      limit: invocation.request.limit
    });
    if (value === null) {
      throw new BoundCatalogFailure("unknown_identity", "replay subject is unknown");
    }
    return accepted({
      operationId: "abg.operation.read.replay",
      disposition: "projected",
      value: Object.freeze({ ...value }),
      provenanceRefs: value.events.flatMap((event) => {
        if (
          typeof event === "object" &&
          event !== null &&
          !Array.isArray(event)
        ) {
          const record: Readonly<Record<string, unknown>> = Object.fromEntries(
            Object.entries(event)
          );
          return typeof record["eventId"] === "string"
            ? [record["eventId"]]
            : [];
        }
        return [];
      })
    });
  } catch (error: unknown) {
    const known = error instanceof BoundCatalogFailure ? error.code : "corrupt_event";
    const code =
      known === "unknown_identity" || known === "stale_basis"
        ? known
        : error instanceof TypeError && /ordinal.*collision/u.test(error.message)
          ? "ordinal_collision"
          : "corrupt_event";
    return refusal({
      operationId: "abg.operation.read.replay",
      code,
      message: error instanceof Error ? error.message : "replay projection failed"
    });
  }
}

export type BoundRuntimeSdkMethods = Pick<
  AbiogenesisPublicSdk,
  | "catalogAdmit"
  | "catalogList"
  | "catalogDescribe"
  | "catalogAllow"
  | "catalogInvoke"
  | "readResult"
  | "readReplay"
>;
