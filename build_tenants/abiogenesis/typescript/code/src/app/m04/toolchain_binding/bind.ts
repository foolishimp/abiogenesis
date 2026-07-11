// Implements: REQ-P-INSTALL-049
// Implements: REQ-P-INSTALL-050
// Implements: REQ-P-INSTALL-052
// Implements: REQ-P-INSTALL-053

import { dirname, join, relative, resolve, sep } from "node:path";
import {
  canonicalizeIJson,
  digestCanonicalIJson
} from "../public_sdk/canonical.js";
import {
  admitToolchainMutableStateRootsV3,
  admitToolchainWorkspaceBindingV3
} from "../public_sdk/index.js";
import type {
  CatalogBindRefusal,
  CatalogBindRequest,
  CatalogBindResult,
  InstalledProductRecord,
  PublicOperationAccepted,
  Sha256Digest,
  ToolchainMutableStateRootsV3,
  ToolchainProductBindingV3,
  ToolchainWorkspaceBindingV3,
  WorkspaceBindingContext
} from "../public_sdk/carriers.js";
import type { CatalogBindAttribution } from "./v3_carriers.js";
import { assertResolvedProductLockCoherence } from "../product_intake/resolve.js";

export type CatalogBindOutcome = CatalogBindResult | CatalogBindRefusal;

function accepted<D extends "bound" | "already_bound_exact">(
  disposition: D,
  binding: ToolchainWorkspaceBindingV3
): PublicOperationAccepted<
  "abg.operation.catalog.bind",
  D,
  ToolchainWorkspaceBindingV3
> {
  return Object.freeze({
    kind: "accepted",
    operationId: "abg.operation.catalog.bind",
    disposition,
    value: binding,
    provenanceRefs: binding.provenanceRefs,
    exitClassification: "accepted_terminal"
  });
}

function refused(
  code: CatalogBindRefusal["code"],
  message: string,
  residualRefs: readonly string[] = []
): CatalogBindRefusal {
  return Object.freeze({
    kind: "refused",
    operationId: "abg.operation.catalog.bind",
    code,
    message,
    residualRefs: Object.freeze([...residualRefs]),
    provenanceRefs: Object.freeze([]),
    exitClassification: "refused"
  });
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function productBindingFromRecord(
  record: InstalledProductRecord
): ToolchainProductBindingV3 {
  return Object.freeze({
    installedProductId: record.installedProductId,
    publisher: record.publisher,
    productId: record.productId,
    packageName: record.packageName,
    version: record.version,
    productContentDigest: record.productContentDigest,
    descriptorId: record.descriptorId,
    descriptorDigest: record.descriptorDigest,
    contributionId: record.contributionId,
    contributionDigest: record.contributionDigest,
    artifactDigest: record.artifactDigest,
    installedRoot: record.installedRoot,
    productRoot: record.productRoot,
    packageRoot: record.packageRoot,
    manifestPath: record.manifestPath,
    manifestDigest: record.manifestDigest,
    compatibilityRange: record.compatibilityRange,
    compatibility: record.compatibility,
    commandRefs: Object.freeze([...record.commandRefs]),
    publicContractCatalogId: record.publicContractCatalogId,
    publicContractCatalogVersion: record.publicContractCatalogVersion,
    publicContractCatalogDigest: record.publicContractCatalogDigest
  });
}

function defaultMutableStateRoots(
  targetRoot: string
): ToolchainMutableStateRootsV3 {
  const observerStateRoot = join(targetRoot, ".ai-workspace");
  const eventRoot = join(observerStateRoot, "events");
  return Object.freeze({
    observedWorkspaceRoot: targetRoot,
    observerStateRoot,
    executorStateRoot: observerStateRoot,
    eventRoot,
    eventLogPath: join(eventRoot, "events.jsonl"),
    runtimeRoot: join(observerStateRoot, "runtime"),
    projectionRoot: join(observerStateRoot, "projections"),
    archiveRoot: join(observerStateRoot, "archives")
  });
}

function normalizeMutableStateRoots(
  roots: ToolchainMutableStateRootsV3
): ToolchainMutableStateRootsV3 {
  return Object.freeze({
    observedWorkspaceRoot: resolve(roots.observedWorkspaceRoot),
    observerStateRoot: resolve(roots.observerStateRoot),
    executorStateRoot: resolve(roots.executorStateRoot),
    eventRoot: resolve(roots.eventRoot),
    eventLogPath: resolve(roots.eventLogPath),
    runtimeRoot: resolve(roots.runtimeRoot),
    projectionRoot: resolve(roots.projectionRoot),
    archiveRoot: resolve(roots.archiveRoot)
  });
}

function toolchainRootForProduct(record: InstalledProductRecord): string {
  const expectedRelative = join("products", record.productId, record.version);
  const segmentCount = expectedRelative.split(sep).length;
  let root = resolve(record.productRoot);
  for (let index = 0; index < segmentCount; index += 1) {
    root = dirname(root);
  }
  if (relative(root, resolve(record.productRoot)) !== expectedRelative) {
    throw new TypeError(
      `installed product ${record.installedProductId} is outside the shared toolchain layout`
    );
  }
  return root;
}

function recordMatchesLockSelection(
  record: InstalledProductRecord,
  selection: CatalogBindRequest["resolvedLock"]["products"][number]
): boolean {
  return (
    record.publisher === selection.publisher &&
    record.productId === selection.productId &&
    record.version === selection.version &&
    record.descriptorId === selection.descriptorId &&
    record.descriptorDigest === selection.descriptorDigest &&
    record.contributionId === selection.contributionId &&
    record.contributionDigest === selection.contributionDigest &&
    record.artifactDigest === selection.artifactDigest &&
    record.productContentDigest === selection.productContentDigest
  );
}

function bindingDigestBasis(
  binding: ToolchainWorkspaceBindingV3
): Omit<ToolchainWorkspaceBindingV3, "bindingDigest"> {
  return Object.freeze({
    kind: binding.kind,
    schemaVersion: binding.schemaVersion,
    bindingId: binding.bindingId,
    workspaceId: binding.workspaceId,
    workspaceManifestDigest: binding.workspaceManifestDigest,
    targetRoot: binding.targetRoot,
    toolchainRoot: binding.toolchainRoot,
    resolvedLockId: binding.resolvedLockId,
    resolvedLockDigest: binding.resolvedLockDigest,
    productSetDigest: binding.productSetDigest,
    productBindingRefs: binding.productBindingRefs,
    products: binding.products,
    mutableStateRoots: binding.mutableStateRoots,
    provenanceRefs: binding.provenanceRefs
  });
}

export function assertToolchainWorkspaceBindingV3Coherence(
  input: ToolchainWorkspaceBindingV3
): ToolchainWorkspaceBindingV3 {
  const binding = admitToolchainWorkspaceBindingV3(input);
  if (binding.mutableStateRoots.observedWorkspaceRoot !== binding.targetRoot) {
    throw new TypeError("workspace binding observed root does not match target root");
  }
  const expectedRefs = binding.products.map((product) => product.installedProductId);
  if (
    expectedRefs.length !== binding.productBindingRefs.length ||
    expectedRefs.some((entry, index) => entry !== binding.productBindingRefs[index])
  ) {
    throw new TypeError("workspace binding product refs do not match product order");
  }
  if (binding.productSetDigest !== digestCanonicalIJson(binding.products)) {
    throw new TypeError("workspace binding product-set digest mismatch");
  }
  if (binding.bindingDigest !== digestCanonicalIJson(bindingDigestBasis(binding))) {
    throw new TypeError("workspace binding digest mismatch");
  }
  return binding;
}

export function constructToolchainWorkspaceBindingV3(input: {
  readonly workspaceId: string;
  readonly workspaceManifestDigest: Sha256Digest;
  readonly targetRoot: string;
  readonly toolchainRoot: string;
  readonly resolvedLockId: string;
  readonly resolvedLockDigest: Sha256Digest;
  readonly products: readonly ToolchainProductBindingV3[];
  readonly mutableStateRoots: ToolchainMutableStateRootsV3;
  readonly provenanceRefs: readonly string[];
}): ToolchainWorkspaceBindingV3 {
  const products = Object.freeze([...input.products]);
  const productSetDigest = digestCanonicalIJson(products);
  const identityDigest = digestCanonicalIJson({
    workspaceId: input.workspaceId,
    resolvedLockId: input.resolvedLockId,
    productSetDigest
  });
  const bindingWithoutDigest: Omit<
    ToolchainWorkspaceBindingV3,
    "bindingDigest"
  > = Object.freeze({
    kind: "abg_toolchain_workspace_binding",
    schemaVersion: "3",
    bindingId: `binding:${identityDigest.slice("sha256:".length)}`,
    workspaceId: input.workspaceId,
    workspaceManifestDigest: input.workspaceManifestDigest,
    targetRoot: resolve(input.targetRoot),
    toolchainRoot: resolve(input.toolchainRoot),
    resolvedLockId: input.resolvedLockId,
    resolvedLockDigest: input.resolvedLockDigest,
    productSetDigest,
    productBindingRefs: Object.freeze(
      products.map((product) => product.installedProductId)
    ),
    products,
    mutableStateRoots: input.mutableStateRoots,
    provenanceRefs: uniqueStrings(input.provenanceRefs)
  });
  const binding: ToolchainWorkspaceBindingV3 = Object.freeze({
    ...bindingWithoutDigest,
    bindingDigest: digestCanonicalIJson(bindingWithoutDigest)
  });
  return assertToolchainWorkspaceBindingV3Coherence(binding);
}

async function exactInstalledRecords(input: {
  readonly request: CatalogBindRequest;
  readonly context: WorkspaceBindingContext;
}): Promise<readonly InstalledProductRecord[] | CatalogBindRefusal> {
  const selections = input.request.resolvedLock.products;
  const supplied = input.request.installedProductRecords;
  if (selections.length === 0 || supplied.length !== selections.length) {
    return refused("lock_mismatch", "installed product set does not match resolved lock");
  }
  const records: InstalledProductRecord[] = [];
  for (let index = 0; index < selections.length; index += 1) {
    const selection = selections[index];
    const record = supplied[index];
    if (selection === undefined || record === undefined) {
      return refused("lock_mismatch", "installed product order is incomplete");
    }
    if (!recordMatchesLockSelection(record, selection)) {
      return refused(
        "lock_mismatch",
        `installed product ${record.installedProductId} does not match lock selection`
      );
    }
    if (!record.compatibility.compatible) {
      return refused(
        "incompatible",
        record.compatibility.reason ?? `product ${record.productId} is incompatible`
      );
    }
    const durable = await input.context.effects.readInstalledProductRecord(
      record.installedProductId
    );
    if (
      durable === null ||
      canonicalizeIJson(durable) !== canonicalizeIJson(record)
    ) {
      return refused(
        "product_not_installed",
        `installed product record ${record.installedProductId} is missing or stale`
      );
    }
    records.push(record);
  }
  return Object.freeze(records);
}

function isCatalogBindRefusal(
  value: readonly InstalledProductRecord[] | CatalogBindRefusal
): value is CatalogBindRefusal {
  return !Array.isArray(value);
}

export async function catalogBind(
  request: CatalogBindRequest,
  context: WorkspaceBindingContext,
  attribution: CatalogBindAttribution
): Promise<CatalogBindOutcome> {
  const manifest = context.workspaceManifest;
  if (
    manifest.workspaceId !== request.workspaceId ||
    resolve(manifest.root) !== manifest.root ||
    attribution.actorRef.trim().length === 0
  ) {
    return refused("workspace_not_ready", "workspace identity is not ready for binding");
  }
  const actualManifestDigest = digestCanonicalIJson(manifest);
  if (actualManifestDigest !== request.workspaceManifestDigest) {
    return refused("workspace_not_ready", "workspace manifest digest mismatch");
  }
  let resolvedLock: CatalogBindRequest["resolvedLock"];
  try {
    resolvedLock = assertResolvedProductLockCoherence(request.resolvedLock);
  } catch (error: unknown) {
    return refused(
      "lock_mismatch",
      error instanceof Error ? error.message : "resolved lock is incoherent"
    );
  }

  const admittedRequest = Object.freeze({ ...request, resolvedLock });

  const exactRecords = await exactInstalledRecords({
    request: admittedRequest,
    context
  });
  if (isCatalogBindRefusal(exactRecords)) {
    return exactRecords;
  }
  let toolchainRoot: string;
  try {
    const roots = exactRecords.map(toolchainRootForProduct);
    toolchainRoot = roots[0] ?? "";
    if (toolchainRoot.length === 0 || roots.some((root) => root !== toolchainRoot)) {
      return refused("lock_mismatch", "products do not share one exact toolchain root");
    }
  } catch (error: unknown) {
    return refused(
      "lock_mismatch",
      error instanceof Error ? error.message : "installed product layout is invalid"
    );
  }

  let mutableStateRoots: ToolchainMutableStateRootsV3;
  try {
    mutableStateRoots =
      admittedRequest.mutableStateRoots === null
        ? defaultMutableStateRoots(manifest.root)
        : normalizeMutableStateRoots(
            admitToolchainMutableStateRootsV3(admittedRequest.mutableStateRoots)
          );
  } catch (error: unknown) {
    return refused(
      "workspace_not_ready",
      error instanceof Error ? error.message : "mutable state roots are invalid"
    );
  }
  if (resolve(mutableStateRoots.observedWorkspaceRoot) !== resolve(manifest.root)) {
    return refused(
      "workspace_not_ready",
      "observed workspace root does not match the workspace manifest"
    );
  }

  let binding: ToolchainWorkspaceBindingV3;
  try {
    binding = constructToolchainWorkspaceBindingV3({
      workspaceId: manifest.workspaceId,
      workspaceManifestDigest: admittedRequest.workspaceManifestDigest,
      targetRoot: manifest.root,
      toolchainRoot,
      resolvedLockId: resolvedLock.lockId,
      resolvedLockDigest: resolvedLock.lockDigest,
      products: exactRecords.map(productBindingFromRecord),
      mutableStateRoots,
      provenanceRefs: uniqueStrings([
        ...manifest.provenanceRefs,
        ...exactRecords.flatMap((record) => record.provenanceRefs),
        ...(attribution.provenanceRefs ?? []),
        `actor:${attribution.actorRef}`
      ])
    });
  } catch (error: unknown) {
    return refused(
      "workspace_not_ready",
      error instanceof Error ? error.message : "workspace binding is incoherent"
    );
  }

  const existing = await context.effects.readBinding();
  if (existing !== null) {
    try {
      const admittedExisting = assertToolchainWorkspaceBindingV3Coherence(existing);
      if (canonicalizeIJson(admittedExisting) === canonicalizeIJson(binding)) {
        return accepted("already_bound_exact", admittedExisting);
      }
    } catch {
      // Malformed existing truth is an identity conflict, never overwrite input.
    }
    return refused("binding_conflict", "workspace already has different binding truth");
  }

  const rootsToCreate = uniqueStrings([
    mutableStateRoots.observerStateRoot,
    mutableStateRoots.executorStateRoot,
    mutableStateRoots.eventRoot,
    dirname(mutableStateRoots.eventLogPath),
    mutableStateRoots.runtimeRoot,
    mutableStateRoots.projectionRoot,
    mutableStateRoots.archiveRoot
  ]);
  for (const root of rootsToCreate) {
    await context.effects.createMutableRoot(root);
  }
  await context.effects.writeBinding(binding);
  return accepted("bound", binding);
}
