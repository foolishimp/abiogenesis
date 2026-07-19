// Private owner authority for bound runtime-catalog assembly and replay.

import { join } from "node:path";

import type {
  CanonicalRuntimeEvent,
  ExecutionBasis
} from "../../../abg/m03/contracts/carriers.js";
import {
  admitExecutionBasis
} from "../../../abg/m03/admission/carriers.js";
import {
  admitBoundWorkspaceCatalog,
  admitOpaqueCatalogAssetDeclaration,
  type AdmittedRuntimeCatalogBasis,
  type BoundCatalogAdmissionBatch,
  type BoundCatalogProductBatch,
  type CatalogAdmissionDeclaration,
  type RuntimeLibraryCatalogAdmissionDeclaration
} from "../../../abg/m03/contracts/runtime_catalog.js";
import { admitModule } from "../../../gtl/m02/admission/carriers.js";
import {
  constructGtlLibraryEntryDeclaration,
  constructProductRegistryStartupConfig
} from "../../../gtl/m02/contracts/runtime_registry.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  admitCatalogContributionManifest,
  admitProductToolchainManifest,
  admitPublicContractCatalog,
  admitPublicSdkWorkspaceManifest,
  admitToolchainWorkspaceBindingV3
} from "../public_sdk/carrier_admission.js";
import type {
  BoundWorkspaceContext,
  CatalogContributionManifest,
  CatalogContributionRow,
  ProductToolchainManifest,
  ToolchainProductBindingV3
} from "../public_sdk/carriers.js";
import {
  projectInstalledAbgSystemOneSurfaceAuthority
} from "./abg_system_one_surface_program.js";

const ABG_PRODUCT_ID = "abiogenesis";
const RUNTIME_CATALOG_VERSION = "1.0.0";

function assertSha256Digest(
  value: string,
  label: string
): asserts value is `sha256:${string}` {
  if (!/^sha256:[0-9a-f]{64}$/u.test(value)) {
    throw new BoundCatalogFailure("runtime_refused", `${label} must be sha256`);
  }
}

interface BoundProductSource {
  readonly binding: ToolchainProductBindingV3;
  readonly manifest: ProductToolchainManifest;
  readonly contribution: CatalogContributionManifest;
}

/** @internal */
export interface BoundRuntimeCatalogState {
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

/** @internal */
export class BoundCatalogFailure extends Error {
  public constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
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

/** @internal */
export async function requireBoundCatalogRecord(
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

/** @internal */
export function assertBoundCatalogContext(
  context: BoundWorkspaceContext
): void {
  if (context.kind !== "bound_workspace") {
    throw new BoundCatalogFailure(
      "unbound",
      "operation requires bound_workspace context"
    );
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
    abgBinding.publicContractCatalogVersion !==
      publicContractCatalog.catalogVersion ||
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
  assertBoundCatalogContext(context);
  const sources: BoundProductSource[] = [];
  for (const product of context.binding.products) {
    const manifest = admitProductToolchainManifest(
      await requireBoundCatalogRecord(
        context,
        product.manifestPath,
        "bound product manifest"
      )
    );
    const contribution = admitCatalogContributionManifest(
      await requireBoundCatalogRecord(
        context,
        join(recordRoot(context, product), "contribution-manifest.json"),
        "bound contribution manifest"
      )
    );
    if (
      manifest.productId !== product.productId ||
      manifest.packageVersion !== product.version ||
      manifest.productContentDigest !== product.productContentDigest ||
      manifest.publicContractCatalog.catalogId !==
        product.publicContractCatalogId ||
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
          input.source.binding.productId === ABG_PRODUCT_ID
            ? "system"
            : "product",
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
  const moduleValue = await requireBoundCatalogRecord(
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
        ...(input.row.overrideOfHandle === null
          ? []
          : [input.row.overrideOfHandle])
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

/** @internal */
export async function buildBoundRuntimeCatalogState(
  context: BoundWorkspaceContext,
  correlationId: string,
  causationEventRefs: readonly string[]
): Promise<BoundRuntimeCatalogState> {
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
            "ABG system contributions must be Module-backed declarations"
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
          configRef:
            `product-registry-startup:${source.contribution.contributionId}`,
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

/** @internal */
export function assertBoundRuntimeCatalogStateContract(
  context: BoundWorkspaceContext,
  state: BoundRuntimeCatalogState
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

/** @internal */
export interface PreparedBoundRuntimeCatalogAdmission {
  readonly batch: BoundCatalogAdmissionBatch;
  readonly catalogId: string;
  readonly catalogDigest: `sha256:${string}`;
  readonly descriptorRefs: readonly string[];
  readonly contributionManifestRefs: readonly string[];
}

/** @internal */
export async function prepareBoundRuntimeCatalogAdmission(input: {
  readonly context: BoundWorkspaceContext;
  readonly correlationId: string;
  readonly causationEventRefs: readonly string[];
}): Promise<PreparedBoundRuntimeCatalogAdmission> {
  const state = await buildBoundRuntimeCatalogState(
    input.context,
    input.correlationId,
    input.causationEventRefs
  );
  assertBoundRuntimeCatalogStateContract(input.context, state);
  return Object.freeze({
    batch: state.batch,
    catalogId: state.catalogId,
    catalogDigest: state.catalogDigest,
    descriptorRefs: Object.freeze(
      state.sources.map((source) => source.binding.descriptorId)
    ),
    contributionManifestRefs: Object.freeze(
      state.sources.map((source) => source.contribution.contributionId)
    )
  });
}

/** @internal */
export function rehydrateBoundRuntimeCatalogStateBasis(input: {
  readonly state: BoundRuntimeCatalogState;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
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
    input.priorEvents
  );
  if (
    !result.accepted ||
    result.basis === null ||
    result.admissionEvents.length > 0
  ) {
    throw new BoundCatalogFailure(
      "catalog_stale",
      "runtime catalog admission truth is missing or rejected"
    );
  }
  return result.basis;
}

/** @internal */
export async function rehydrateBoundRuntimeCatalogBasis(input: {
  readonly context: BoundWorkspaceContext;
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}): Promise<AdmittedRuntimeCatalogBasis> {
  const state = await buildBoundRuntimeCatalogState(
    input.context,
    input.correlationId,
    Object.freeze([])
  );
  assertBoundRuntimeCatalogStateContract(input.context, state);
  return rehydrateBoundRuntimeCatalogStateBasis({
    state,
    priorEvents: Object.freeze([...input.priorEvents])
  });
}

/** @internal */
export interface ReconstructedBoundRuntimeExecutionBasis {
  readonly kind: "reconstructed_bound_runtime_execution_basis";
  readonly executionBasis: ExecutionBasis;
  readonly program: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly workspaceBinding: Readonly<{
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  }>;
  readonly basisAdmissionEvent: CanonicalRuntimeEvent & Readonly<{
    readonly kind: "basis_admitted";
  }>;
}

/**
 * Rebuilds runtime projection authority from installed product truth and the
 * replayed basis admission. The caller cannot supply any ExecutionBasis field.
 * @internal
 */
export async function reconstructBoundRuntimeExecutionBasis(input: {
  readonly context: BoundWorkspaceContext;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly runRef: string;
}): Promise<ReconstructedBoundRuntimeExecutionBasis> {
  const state = await buildBoundRuntimeCatalogState(
    input.context,
    `correlation://abg/project.read/run-status/${stableSha256Digest({
      runRef: input.runRef,
      bindingId: input.context.binding.bindingId
    }).slice("sha256:".length)}`,
    Object.freeze([])
  );
  assertBoundRuntimeCatalogStateContract(input.context, state);
  const catalogBasis = rehydrateBoundRuntimeCatalogStateBasis({
    state,
    priorEvents: Object.freeze([...input.priorEvents])
  });
  const oneSurfaceAuthority =
    await projectInstalledAbgSystemOneSurfaceAuthority({ catalogBasis });
  const basisRows = input.priorEvents.filter(
    (event): event is CanonicalRuntimeEvent & Readonly<{
      readonly kind: "basis_admitted";
    }> => event.kind === "basis_admitted" && event.runId === input.runRef
  );
  const basisAdmissionEvent = basisRows[0];
  if (basisRows.length !== 1 || basisAdmissionEvent === undefined) {
    throw new BoundCatalogFailure(
      "runtime_refused",
      "run status requires one exact replay-admitted ExecutionBasis"
    );
  }
  const executionBindings = catalogBasis.executionBindings.filter(
    (binding) => binding.graphFunctionId === basisAdmissionEvent.graphFunctionId
  );
  const executionBinding = executionBindings[0];
  if (executionBindings.length !== 1 || executionBinding === undefined) {
    throw new BoundCatalogFailure(
      "runtime_refused",
      "run status basis does not resolve one installed GraphFunction binding"
    );
  }
  const runtimeProfile = state.abg.manifest.runtimeSystemProfile;
  if (runtimeProfile === null) {
    throw new BoundCatalogFailure(
      "runtime_refused",
      "run status requires the installed ABIogenesis runtime profile"
    );
  }
  const { profileDigest, ...runtimeProfileBasis } = runtimeProfile;
  if (profileDigest !== stableSha256Digest(runtimeProfileBasis)) {
    throw new BoundCatalogFailure(
      "runtime_refused",
      "run status rejects a stale installed runtime profile"
    );
  }
  const executionBasis = admitExecutionBasis({
    module: executionBinding.module,
    startIntent: Object.freeze({
      scope: Object.freeze({
        kind: "workspace" as const,
        workspaceRoot: input.context.binding.targetRoot,
        moduleName: executionBinding.moduleName
      }),
      target: Object.freeze({
        kind: "graph_function" as const,
        handle: executionBinding.graphFunctionHandle
      }),
      until: "first_traversal" as const
    }),
    runtimeIdentity: runtimeProfile.runtimeIdentity,
    resolvedPolicy: runtimeProfile.resolvedPolicy,
    runId: basisAdmissionEvent.runId,
    workKey: basisAdmissionEvent.workKey,
    startAdmissionWitnessDigest:
      basisAdmissionEvent.startAdmissionWitnessDigest
  });
  if (
    executionBasis.id !== basisAdmissionEvent.basisId ||
    executionBasis.graphFunction.id !== basisAdmissionEvent.graphFunctionId ||
    executionBasis.job.id !== basisAdmissionEvent.jobId ||
    executionBasis.runtimeIdentity.resolvedRuntimeRef !==
      basisAdmissionEvent.resolvedRuntimeRef ||
    executionBasis.resolvedPolicy.resolvedPolicyBundleRef !==
      basisAdmissionEvent.resolvedPolicyBundleRef
  ) {
    throw new BoundCatalogFailure(
      "runtime_refused",
      "reconstructed ExecutionBasis differs from replay-admitted basis truth"
    );
  }
  assertSha256Digest(
    executionBinding.moduleDigest,
    "installed GTL module digest"
  );
  const admittedProgramDigest =
    oneSurfaceAuthority.authorityProgram.admittedProgramDigest;
  assertSha256Digest(
    admittedProgramDigest,
    "installed One Surface GTL program digest"
  );
  return Object.freeze({
    kind: "reconstructed_bound_runtime_execution_basis" as const,
    executionBasis,
    program: Object.freeze({
      ref: oneSurfaceAuthority.authorityProgram.admittedProgramRef,
      digest: admittedProgramDigest
    }),
    workspaceBinding: Object.freeze({
      ref: input.context.binding.bindingId,
      digest: input.context.binding.bindingDigest
    }),
    basisAdmissionEvent
  });
}
