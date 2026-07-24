import { isAbsolute, relative, resolve } from "node:path";

import * as abg from "../abg/index.js";
import * as gtl from "../gtl/index.js";
import * as hog from "../hog/index.js";
import * as implementation from "../implementation/index.js";
import * as product from "../product/index.js";
import * as validator from "../validator/index.js";
import type {
  CatalogContribution,
  GtlProgram,
  ModulePublication,
} from "../gtl/contracts.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";
import { bindChildTraversalPreparationPort } from "./child_traversal_port.js";
import { projectOutcome } from "./outcome.js";

export interface RootOperationContext {
  store: abg.AbgEventStore;
  readonly productState: product.RootOperationState;
}

interface ContinuationLocator {
  readonly continuationRef: string;
  readonly reopenAuthority: abg.EventStoreReopenAuthority;
  readonly runtimeInvocationRef: string;
  readonly outputContractRef: string;
  readonly invocationAdmissionRef: string;
  readonly runId: string;
  readonly installState: product.InstallOperationState;
  readonly workspaceState: product.WorkspaceOperationState;
  readonly viewState: product.CatalogViewOperationState;
  readonly program: Readonly<gtl.GtlProgram>;
  readonly graph: Readonly<gtl.GtlGraph>;
  readonly closureContract: Readonly<gtl.ClosureContract>;
}

const continuationLocators =
  new WeakMap<RootOperationContext, Map<string, ContinuationLocator>>();

function continuationLocatorMap(
  context: RootOperationContext,
): Map<string, ContinuationLocator> {
  const state = continuationLocators.get(context);
  if (state === undefined) {
    throw new TypeError("root operation context has no continuation registry");
  }
  return state;
}

class ApplicationRefusal extends Error {
  constructor(
    readonly code:
      | "invalid_request"
      | "missing_prerequisite"
      | "owner_refusal"
      | "target_mismatch",
    message: string,
  ) {
    super(message);
  }
}

export function createRootOperationContext(): RootOperationContext {
  const context = {
    store: new abg.AbgEventStore(),
    productState: new product.RootOperationState(),
  };
  continuationLocators.set(context, new Map());
  return context;
}

export function closeRootOperationContext(context: RootOperationContext): void {
  context.store.closeDurableLog();
  continuationLocators.delete(context);
}

function stringField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): string {
  const value = payload[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be one explicit non-empty string`);
  }
  return value;
}

function stringArrayField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): readonly string[] {
  const value = payload[key];
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit string array`);
  }
  return value as readonly string[];
}

function recordField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): Readonly<Record<string, product.JsonValue>> {
  const value = payload[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit object`);
  }
  return value as Readonly<Record<string, product.JsonValue>>;
}

function recordArrayField(
  payload: Readonly<Record<string, product.JsonValue>>,
  key: string,
): readonly Readonly<Record<string, product.JsonValue>>[] {
  const value = payload[key];
  if (
    !Array.isArray(value) ||
    value.some((row) => typeof row !== "object" || row === null || Array.isArray(row))
  ) {
    throw new ApplicationRefusal("invalid_request", `payload.${key} must be an explicit object array`);
  }
  return value as readonly Readonly<Record<string, product.JsonValue>>[];
}

function requireExactPayloadKeys(
  payload: Readonly<Record<string, product.JsonValue>>,
  allowed: readonly string[],
  operation: string,
): void {
  const allowedKeys = new Set(allowed);
  const undeclared = Object.keys(payload).filter((key) => !allowedKeys.has(key));
  if (undeclared.length !== 0) {
    throw new ApplicationRefusal(
      "invalid_request",
      `${operation} payload contains undeclared fields: ${undeclared.sort().join(", ")}`,
    );
  }
}

function required<T>(value: T | null, ref: string, kind: string): T {
  if (value === null) {
    throw new ApplicationRefusal("missing_prerequisite", `${kind} invocation ${ref} is not admitted in this transcript`);
  }
  return value;
}

function operationBasis(
  invocation: RootPublicInvocation,
  scopeRef: string,
  scopeDigest: product.Sha256Digest,
  causationEventRefs: readonly string[],
): abg.PublicOperationAdmissionBasis {
  if (invocation.operationId === "abg.operation.product.verify") {
    throw new ApplicationRefusal("invalid_request", "product.verify is a pure operation and has no ABG admission basis");
  }
  const invocationPayloadDigest = product.sha256Canonical(invocation.payload);
  return {
    operationId: invocation.operationId,
    definitionKey: invocation.operationId,
    definitionDigest: product.sha256Canonical({
      operationId: invocation.operationId,
      schemaVersion: "5.0.0",
    }),
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef: invocation.invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef: invocation.invocationRef,
      operationId: invocation.operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: invocation.correlationId,
    eventTime: invocation.eventTime,
    causationEventRefs,
  };
}

function rawAdmission<S>(
  value: unknown,
  kind: validator.RawSubjectKind,
  contractRef: string,
): validator.RawAdmittedValue<S> {
  const admitted = validator.rawAdmitValue<S>(value, kind, contractRef);
  if (admitted.kind !== "raw_admitted_value") {
    throw new ApplicationRefusal("owner_refusal", `GTL raw admission refused: ${JSON.stringify(admitted)}`);
  }
  return admitted;
}

function rawProgramInput(
  publicationAdmission: validator.RawAdmittedValue<ModulePublication>,
  program: Readonly<GtlProgram>,
): validator.ProgramValidationInput {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: rawAdmission(
      program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions
      .filter((value) => program.callableMembership.includes(value.name))
      .map((value) => rawAdmission(
        value,
        "graph_function",
        "contract://abiogenesis/gtl/graph-function@5",
      )),
    contracts: publication.contracts.map((value) => rawAdmission(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    )),
    implementationBindings: publication.implementationBindings.map((value) => rawAdmission(
      value,
      "implementation_binding",
      "contract://abiogenesis/gtl/implementation-binding@5",
    )),
    closureContracts: publication.closureContracts.map((value) => rawAdmission(
      value,
      "closure_contract",
      "contract://abiogenesis/gtl/closure-contract@5",
    )),
  };
}

function successOutcome(
  invocation: RootPublicInvocation,
  result: product.JsonValue,
  metadata: {
    readonly runtimeInvocationRef?: string;
    readonly runId?: string;
    readonly graphCallId?: string;
    readonly frameId?: string;
    readonly replayRef?: string;
    readonly replayDigest?: product.Sha256Digest;
    readonly eventLogPath?: string;
    readonly eventLogDigest?: product.Sha256Digest;
    readonly eventLogByteLength?: number;
    readonly durableEventCount?: number;
    readonly continuationRef?: string;
    readonly continuationStatus?: "open" | "responded" | "resolved";
  } = {},
): PublicOutcome {
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef: metadata.runtimeInvocationRef ?? null,
    disposition: "succeeded" as const,
    result,
    diagnosticRef: null,
    runId: metadata.runId ?? null,
    graphCallId: metadata.graphCallId ?? null,
    frameId: metadata.frameId ?? null,
    cCallRef: null,
    resultRef: null,
    judgmentRef: null,
    outputContractRef: null,
    admittedResultContractRef: null,
    replayRef: metadata.replayRef ?? null,
    replayDigest: metadata.replayDigest ?? null,
    replayAgreement: metadata.replayDigest === undefined ? null : true,
    eventLogPath: metadata.eventLogPath ?? null,
    eventLogDigest: metadata.eventLogDigest ?? null,
    eventLogByteLength: metadata.eventLogByteLength ?? null,
    durableEventCount: metadata.durableEventCount ?? null,
    continuationRef: metadata.continuationRef ?? null,
    continuationStatus: metadata.continuationStatus ?? null,
  };
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest: product.sha256Canonical(body as unknown as product.JsonValue),
    ...body,
  }) as PublicOutcome;
}

function refusalOutcome(
  invocation: RootPublicInvocation,
  code: string,
  message: string,
): PublicOutcome {
  const diagnosticRef = `diagnostic://abiogenesis/public/${code}@5`;
  const result = {
    kind: "public_operation_refusal",
    schemaVersion: "5.0.0",
    code,
    message,
  } as const;
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef: null,
    disposition: "refused" as const,
    result,
    diagnosticRef,
    runId: null,
    graphCallId: null,
    frameId: null,
    cCallRef: null,
    resultRef: null,
    judgmentRef: null,
    outputContractRef: null,
    admittedResultContractRef: null,
    replayRef: null,
    replayDigest: null,
    replayAgreement: null,
    eventLogPath: null,
    eventLogDigest: null,
    eventLogByteLength: null,
    durableEventCount: null,
    continuationRef: null,
    continuationStatus: null,
  };
  return deepFreeze({
    kind: "public_outcome" as const,
    schemaVersion: "5.0.0" as const,
    outcomeDigest: product.sha256Canonical(body as unknown as product.JsonValue),
    ...body,
  }) as PublicOutcome;
}

async function applyVerify(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "artifact") {
    throw new ApplicationRefusal("invalid_request", "product.verify requires variant artifact");
  }
  requireExactPayloadKeys(invocation.payload, [
    "artifactPath",
    "artifactRef",
    "expectedArtifactDigest",
    "expectedManifestDigest",
    "expectedPackageName",
    "expectedPackageVersion",
    "expectedProductContentDigest",
    "expectedProductId",
  ], "product.verify");
  const verified = await product.verifyProduct({
    artifactPath: stringField(invocation.payload, "artifactPath"),
    artifactRef: stringField(invocation.payload, "artifactRef"),
    expectedArtifactDigest: stringField(invocation.payload, "expectedArtifactDigest") as product.Sha256Digest,
    expectedProductContentDigest: stringField(invocation.payload, "expectedProductContentDigest") as product.Sha256Digest,
    expectedManifestDigest: stringField(invocation.payload, "expectedManifestDigest") as product.Sha256Digest,
    expectedProductId: stringField(invocation.payload, "expectedProductId"),
    expectedPackageName: stringField(invocation.payload, "expectedPackageName"),
    expectedPackageVersion: stringField(invocation.payload, "expectedPackageVersion"),
  });
  if (verified.disposition !== "verified") {
    throw new ApplicationRefusal("owner_refusal", `Product verification refused: ${verified.code}`);
  }
  context.productState.rememberVerified(invocation.invocationRef, { verified });
  return successOutcome(invocation, {
    kind: verified.kind,
    disposition: verified.disposition,
    productId: verified.productId,
    artifactDigest: verified.artifactDigest,
    productContentDigest: verified.productContentDigest,
    manifestDigest: verified.manifestDigest,
  });
}

async function applyInstall(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "verified_artifact") {
    throw new ApplicationRefusal("invalid_request", "product.install requires variant verified_artifact");
  }
  requireExactPayloadKeys(invocation.payload, [
    "artifactPath",
    "targetRoot",
    "verifiedInvocationRef",
  ], "product.install");
  const verifiedState = required(
    context.productState.verified(stringField(invocation.payload, "verifiedInvocationRef")),
    stringField(invocation.payload, "verifiedInvocationRef"),
    "verified Product",
  );
  const candidate = await product.installProduct({
    artifactPath: stringField(invocation.payload, "artifactPath"),
    targetRoot: stringField(invocation.payload, "targetRoot"),
    verifiedArtifact: verifiedState.verified,
  });
  if (candidate.disposition !== "materialized") {
    throw new ApplicationRefusal("owner_refusal", `Product installation refused: ${candidate.code}`);
  }
  const install = abg.admitProductInstall(
    context.store,
    candidate,
    operationBasis(
      invocation,
      candidate.installId,
      candidate.productContentDigest,
      [],
    ),
  );
  if (install.kind !== "product_install") {
    throw new ApplicationRefusal("owner_refusal", `ProductInstall admission refused: ${install.message}`);
  }
  context.productState.rememberInstall(invocation.invocationRef, { candidate, install });
  return successOutcome(invocation, {
    kind: install.kind,
    disposition: install.disposition,
    installId: install.installId,
    productId: install.productId,
    installedRoot: install.installedRoot,
    admissionEventRef: install.admissionEventRef,
  });
}

async function applyWorkspaceBind(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "exact_product_set") {
    throw new ApplicationRefusal("invalid_request", "workspace.bind requires variant exact_product_set");
  }
  requireExactPayloadKeys(invocation.payload, [
    "authorityManifestRef",
    "canonicalRoot",
    "dependencyEdges",
    "installInvocationRef",
    "installInvocationRefs",
    "roots",
    "workspaceId",
  ], "workspace.bind");
  const singularInstallRef = invocation.payload.installInvocationRef;
  const pluralInstallRefs = invocation.payload.installInvocationRefs;
  if ((singularInstallRef === undefined) === (pluralInstallRefs === undefined)) {
    throw new ApplicationRefusal(
      "invalid_request",
      "workspace.bind requires exactly one of installInvocationRef or installInvocationRefs",
    );
  }
  const installInvocationRefs = singularInstallRef === undefined
    ? stringArrayField(invocation.payload, "installInvocationRefs")
    : [stringField(invocation.payload, "installInvocationRef")];
  if (
    installInvocationRefs.length === 0 ||
    new Set(installInvocationRefs).size !== installInvocationRefs.length
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "workspace.bind installInvocationRefs must be non-empty and unique",
    );
  }
  const installStates = installInvocationRefs.map((installInvocationRef) =>
    required(
      context.productState.install(installInvocationRef),
      installInvocationRef,
      "ProductInstall",
    ));
  const dependencyEdges = invocation.payload.dependencyEdges === undefined
    ? []
    : recordArrayField(invocation.payload, "dependencyEdges").map((edge) => {
      requireExactPayloadKeys(
        edge,
        ["fromProductId", "kind", "toProductId"],
        "workspace.bind dependency edge",
      );
      const kind = stringField(edge, "kind");
      if (kind !== "requires") {
        throw new ApplicationRefusal(
          "invalid_request",
          "workspace.bind dependency edge kind must be requires",
        );
      }
      return {
        kind,
        fromProductId: stringField(edge, "fromProductId"),
        toProductId: stringField(edge, "toProductId"),
      } satisfies product.ProductDependencyEdge;
    });
  const lock = product.constructResolvedProductLock(
    installStates.map((state) => state.install),
    dependencyEdges,
  );
  if (lock.kind !== "resolved_product_lock") {
    throw new ApplicationRefusal("owner_refusal", `Product lock construction refused: ${lock.message}`);
  }
  const productSet = product.constructProductSet(
    installStates.map((state) => state.install),
    lock,
  );
  if (productSet.kind !== "product_set") {
    throw new ApplicationRefusal("owner_refusal", `ProductSet construction refused: ${productSet.message}`);
  }
  const workspaceId = stringField(invocation.payload, "workspaceId");
  const canonicalRoot = stringField(invocation.payload, "canonicalRoot");
  const authorityManifest = {
    workspaceId,
    canonicalRoot,
    authorityMode: "trusted_developer" as const,
  };
  const authority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: stringField(invocation.payload, "authorityManifestRef"),
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  if (authority.kind !== "workspace_authority_basis") {
    throw new ApplicationRefusal("owner_refusal", `Workspace authority refused: ${authority.message}`);
  }
  const rootsValue = recordField(invocation.payload, "roots");
  requireExactPayloadKeys(rootsValue, [
    "archiveRoot",
    "eventLogRoot",
    "productRoot",
    "projectionRoot",
    "runtimeStateRoot",
    "toolchainRoot",
  ], "workspace.bind roots");
  const roots: product.WorkspaceDeclaredRoots = {
    toolchainRoot: stringField(rootsValue, "toolchainRoot"),
    productRoot: stringField(rootsValue, "productRoot"),
    eventLogRoot: stringField(rootsValue, "eventLogRoot"),
    runtimeStateRoot: stringField(rootsValue, "runtimeStateRoot"),
    projectionRoot: stringField(rootsValue, "projectionRoot"),
    archiveRoot: stringField(rootsValue, "archiveRoot"),
  };
  const candidate = product.constructWorkspaceBinding(authority, productSet, lock, roots);
  if (candidate.kind !== "workspace_binding_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Workspace binding construction refused: ${candidate.message}`);
  }
  const binding = abg.admitWorkspaceBinding(
    context.store,
    candidate,
    operationBasis(
      invocation,
      candidate.bindingId,
      candidate.bindingDigest,
      installStates.map((state) => state.install.admissionEventRef),
    ),
  );
  if (binding.kind !== "workspace_binding") {
    throw new ApplicationRefusal("owner_refusal", `Workspace binding admission refused: ${binding.message}`);
  }
  context.productState.rememberWorkspace(invocation.invocationRef, { lock, productSet, binding });
  return successOutcome(invocation, {
    kind: binding.kind,
    bindingId: binding.bindingId,
    bindingDigest: binding.bindingDigest,
    productSetId: binding.productSetId,
    lockedProductIds: lock.rows.map((row) => row.productId),
    dependencyEdges: lock.dependencyEdges.map((edge) => ({
      kind: edge.kind,
      fromProductId: edge.fromProductId,
      toProductId: edge.toProductId,
    })),
    admissionEventRef: binding.admissionEventRef,
  });
}

async function applyCatalogAdmit(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "module_publication") {
    throw new ApplicationRefusal("invalid_request", "catalog.admit requires variant module_publication");
  }
  requireExactPayloadKeys(invocation.payload, [
    "publication",
    "verifiedInvocationRef",
    "workspaceBindingInvocationRef",
  ], "catalog.admit");
  const verifiedState = required(
    context.productState.verified(stringField(invocation.payload, "verifiedInvocationRef")),
    stringField(invocation.payload, "verifiedInvocationRef"),
    "verified Product",
  );
  const workspaceState = required(
    context.productState.workspace(stringField(invocation.payload, "workspaceBindingInvocationRef")),
    stringField(invocation.payload, "workspaceBindingInvocationRef"),
    "WorkspaceBinding",
  );
  const publicationValue = recordField(invocation.payload, "publication");
  const publication = publicationValue as unknown as Readonly<ModulePublication>;
  if (
    publication.owningProductId !== verifiedState.verified.productId ||
    publication.artifactDigest !== verifiedState.verified.artifactDigest ||
    publication.productContentDigest !== verifiedState.verified.productContentDigest ||
    publication.productManifestDigest !== verifiedState.verified.manifestDigest
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "catalog.admit publication differs from the exact verified Product basis",
    );
  }
  const publicationAdmission = rawAdmission<ModulePublication>(
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const contributionAdmissions = publication.contributions.map((value) => rawAdmission<CatalogContribution>(
    value,
    "catalog_contribution",
    "contract://abiogenesis/gtl/catalog-contribution@5",
  ));
  const publicationValidation = validator.validatePublication(
    publicationAdmission,
    contributionAdmissions,
  );
  if (publicationValidation.kind !== "publication_validation") {
    throw new ApplicationRefusal("owner_refusal", `Publication validation refused: ${JSON.stringify(publicationValidation)}`);
  }
  const programValidations = publication.programs.map((program) =>
    validator.validateProgram(rawProgramInput(publicationAdmission, program)));
  const invalidProgram = programValidations.find(
    (programValidation) => programValidation.kind !== "program_validation",
  );
  if (invalidProgram !== undefined) {
    throw new ApplicationRefusal("owner_refusal", `Program validation refused: ${JSON.stringify(invalidProgram)}`);
  }
  const candidate = product.constructCatalogAdmissionCandidate(
    workspaceState.binding,
    workspaceState.lock,
    publication,
    publicationValidation,
    programValidations as readonly validator.ProgramValidation[],
  );
  if (candidate.kind !== "catalog_admission_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Catalog construction refused: ${candidate.message}`);
  }
  const catalog = abg.admitCatalog(
    context.store,
    candidate,
    operationBasis(
      invocation,
      workspaceState.binding.bindingId,
      workspaceState.binding.bindingDigest,
      [workspaceState.binding.admissionEventRef],
    ),
  );
  if (catalog.kind !== "admitted_catalog") {
    throw new ApplicationRefusal("owner_refusal", `Catalog admission refused: ${catalog.message}`);
  }
  context.productState.rememberCatalog(invocation.invocationRef, {
    publication,
    publicationValidation,
    programValidations: programValidations as readonly validator.ProgramValidation[],
    catalog,
  });
  return successOutcome(invocation, {
    kind: catalog.kind,
    catalogId: catalog.catalogId,
    catalogDigest: catalog.catalogDigest,
    admittedRows: catalog.rows.length,
    admissionEventRef: catalog.admissionEventRef,
  });
}

async function applyCatalogView(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "allowlist") {
    throw new ApplicationRefusal("invalid_request", "catalog.view requires variant allowlist");
  }
  requireExactPayloadKeys(invocation.payload, [
    "allowlist",
    "catalogInvocationRef",
  ], "catalog.view");
  const catalogState = required(
    context.productState.catalog(stringField(invocation.payload, "catalogInvocationRef")),
    stringField(invocation.payload, "catalogInvocationRef"),
    "AdmittedCatalog",
  );
  const candidate = product.constructCatalogViewCandidate(
    catalogState.catalog,
    stringArrayField(invocation.payload, "allowlist"),
  );
  if (candidate.kind !== "catalog_view_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Catalog view construction refused: ${candidate.message}`);
  }
  const view = abg.narrowCatalogView(
    context.store,
    catalogState.catalog,
    candidate,
    operationBasis(
      invocation,
      catalogState.catalog.catalogId,
      catalogState.catalog.catalogDigest,
      [catalogState.catalog.admissionEventRef],
    ),
  );
  if (view.kind !== "catalog_view") {
    throw new ApplicationRefusal("owner_refusal", `Catalog view admission refused: ${view.message}`);
  }
  context.productState.rememberCatalogView(invocation.invocationRef, { catalogState, view });
  return successOutcome(invocation, {
    kind: view.kind,
    viewId: view.viewId,
    viewDigest: view.viewDigest,
    allowlist: view.allowlist,
    admissionEventRef: view.admissionEventRef,
  });
}

async function applyRunInvoke(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
  rawRequest: validator.RawAdmittedValue<RootPublicInvocation>,
): Promise<PublicOutcome> {
  if (invocation.variant !== "direct") {
    throw new ApplicationRefusal("invalid_request", "run.invoke requires variant direct");
  }
  requireExactPayloadKeys(invocation.payload, [
    "actorRef",
    "catalogViewInvocationRef",
    "eventLogPath",
    "graphFunctionRef",
    "input",
    "installInvocationRef",
    "programRef",
    "workspaceBindingInvocationRef",
  ], "run.invoke");
  const installState = required(
    context.productState.install(stringField(invocation.payload, "installInvocationRef")),
    stringField(invocation.payload, "installInvocationRef"),
    "ProductInstall",
  );
  const workspaceState = required(
    context.productState.workspace(stringField(invocation.payload, "workspaceBindingInvocationRef")),
    stringField(invocation.payload, "workspaceBindingInvocationRef"),
    "WorkspaceBinding",
  );
  const viewState = required(
    context.productState.catalogView(stringField(invocation.payload, "catalogViewInvocationRef")),
    stringField(invocation.payload, "catalogViewInvocationRef"),
    "CatalogView",
  );
  if (
    !workspaceState.productSet.orderedInstallRefs.includes(installState.install.installId) ||
    workspaceState.binding.roots.productRoot !== installState.candidate.installedRoot ||
    viewState.catalogState.catalog.workspaceBindingId !== workspaceState.binding.bindingId ||
    viewState.catalogState.catalog.workspaceBindingDigest !== workspaceState.binding.bindingDigest
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke ProductInstall, WorkspaceBinding, and CatalogView do not share one exact environment",
    );
  }
  const programRef = stringField(invocation.payload, "programRef");
  const graphFunctionRef = stringField(invocation.payload, "graphFunctionRef");
  const programValue = viewState.catalogState.publication.programs.find(
    (value) => value.programRef === programRef,
  );
  const graphFunction = viewState.catalogState.publication.graphFunctions.find(
    (value) => value.name === graphFunctionRef,
  );
  if (programValue === undefined || graphFunction === undefined) {
    throw new ApplicationRefusal("target_mismatch", "run.invoke target is absent from the admitted publication");
  }
  const selectedRow = viewState.view.selectedRows.find(
    (row) =>
      row.handle === graphFunctionRef &&
      row.disposition === "admitted" &&
      row.callability === "callable" &&
      row.programMembershipRefs.includes(programRef),
  );
  const programValidation = viewState.catalogState.programValidations.find(
    (value) => value.programRef === programRef,
  );
  if (
    selectedRow === undefined ||
    !programValue.callableMembership.includes(graphFunctionRef) ||
    programValidation === undefined
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke target must be callable under the exact admitted CatalogView and Program validation",
    );
  }
  const inputValue = recordField(invocation.payload, "input");
  if (graphFunction.inputs.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input must satisfy the selected GraphFunction's exact admitted input contract",
    );
  }
  const inputContractRef = graphFunction.inputs[0]!;
  let productSemantics: implementation.ProductSemanticsProvider;
  try {
    productSemantics = await implementation.loadInstalledProductSemantics({
      store: context.store,
      install: installState.install,
      publication: viewState.catalogState.publication,
    });
  } catch {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke selected Product semantics binding is not carried by the exact admitted install",
    );
  }
  const admittedInput = productSemantics.admitInput(inputContractRef, inputValue);
  if (admittedInput === null) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input is refused by the selected Product-owned contract semantics",
    );
  }
  const rawInput = rawAdmission<Readonly<Record<string, product.JsonValue>>>(
    admittedInput,
    "invocation_input",
    inputContractRef,
  );
  const declaredRegimes = new Set<gtl.ComputeRegime>([
    ...programValidation.executableLeafRows.map((row) => row.fibre),
    ...programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    (["F_D", "F_P", "F_H"] as const).filter((regime) => declaredRegimes.has(regime)),
  );
  const actorRef = stringField(invocation.payload, "actorRef");
  const grant = product.constructCapabilityGrant(actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceState.binding,
    viewState.view,
    programValue.programRef,
    graphFunction.name,
    [grant],
  );
  if (authority.kind !== "invocation_authority") {
    throw new ApplicationRefusal("owner_refusal", `Invocation authority refused: ${authority.message}`);
  }
  const candidate = product.constructDirectInvocation(
    workspaceState.binding,
    viewState.view,
    programValue,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    [grant],
    authority,
  );
  if (candidate.kind !== "public_invocation_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Invocation construction refused: ${candidate.message}`);
  }
  const durableEventLogPath = eventLogPath(invocation, workspaceState.binding);
  context.store.configureDurableLog(durableEventLogPath);
  const invocationAdmission = abg.admitInvocation(
    context.store,
    {
      invocation: candidate,
      rawRequest,
      rawInput,
      modulePublication: viewState.catalogState.publication,
      program: programValue,
      graphFunction,
      programValidation,
      workspaceBinding: workspaceState.binding,
      catalogView: viewState.view,
      policy,
      capabilityGrants: [grant],
      authority,
    },
    operationBasis(
      { ...invocation, invocationRef: candidate.invocationRef },
      workspaceState.binding.bindingId,
      workspaceState.binding.bindingDigest,
      [viewState.view.admissionEventRef],
    ),
  );
  if (invocationAdmission.kind !== "invocation_admission") {
    throw new ApplicationRefusal("owner_refusal", `Invocation admission refused: ${invocationAdmission.message}`);
  }
  let activeRefusalStage: abg.InvocationRefusalAdmission["stage"] = "graph_validation";
  let failureExecutionBasis: abg.ExecutionBasis | null = null;
  let failureScope: abg.OpenedTraversalScope | null = null;
  try {
  const node = graphFunction.template.nodes[0];
  if (node === undefined) {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(graphFunction as unknown as product.JsonValue),
      ["diagnostic://abiogenesis/implementation-resolution/c-locus-absent@5"],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/missing-c-locus`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: rawInput.value as unknown as Readonly<
      Record<string, product.JsonValue>
    >,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: rawInput.value as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
    },
  );
  if (graphValidation.kind !== "graph_validation") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "graph_validation",
      graphValidation.subjectDigest,
      graphValidation.diagnostics.map((row) => `diagnostic://abiogenesis/validator/${row.code}@5`),
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/graph-validation`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  activeRefusalStage = "implementation_resolution";
  const packagedImplementations = await product.loadInstalledImplementationDescriptors(
    installState.install,
    viewState.catalogState.publication,
  );
  if (!Array.isArray(packagedImplementations)) {
    const descriptorRefusal = packagedImplementations as product.ImplementationResolutionSetRefusal;
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(descriptorRefusal as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/implementation-resolution/${descriptorRefusal.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/implementation-load`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const resolutionSetCandidate = product.resolveImplementationSet(
    viewState.view,
    viewState.catalogState.publication,
    programValidation,
    packagedImplementations,
  );
  if (resolutionSetCandidate.kind !== "implementation_resolution_set_candidate") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(resolutionSetCandidate as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/implementation-resolution/${resolutionSetCandidate.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution-set`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const resolutionSetValidation = validator.validateImplementationResolutionSet(
    resolutionSetCandidate,
    viewState.view,
    viewState.catalogState.publication,
    programValidation,
    packagedImplementations,
  );
  if (resolutionSetValidation.kind !== "implementation_resolution_set_validation") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      resolutionSetValidation.subjectDigest,
      resolutionSetValidation.diagnostics.map((row) =>
        `diagnostic://abiogenesis/validator/${row.code}@5`),
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution-set-validation`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const closureContract = viewState.catalogState.publication.closureContracts.find(
    (value) => value.closureContractRef === programValue.closureContractRef,
  );
  if (closureContract === undefined) {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "execution_basis",
      product.sha256Canonical(programValue as unknown as product.JsonValue),
      ["diagnostic://abiogenesis/execution-basis/closure-contract-absent@5"],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/missing-closure-contract`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  activeRefusalStage = "execution_basis";
  const executionAdmission = abg.admitExecutionBasis(
    context.store,
    {
      invocationAdmission,
      program: programValue,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      closureContract,
    },
    { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/execution-basis`, causationEventRefs: [] },
  );
  if (executionAdmission.kind !== "execution_basis_admission") {
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  failureExecutionBasis = executionAdmission.executionBasis;
  const implementationSet = executionAdmission.implementationSet;
  activeRefusalStage = "open_call";
  const opened = abg.openCall(
    context.store,
    executionAdmission.executionBasis,
    { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/open`, causationEventRefs: [] },
  );
  if (opened.kind !== "open_call_admission") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "open_call",
      product.sha256Canonical(opened as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/open-call/${opened.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/open-refusal`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  failureScope = opened.scope;
  const leafPort = await implementation.constructAdmittedLeafInvocationPort({
    store: context.store,
    install: installState.install,
    implementationSet,
    publication: viewState.catalogState.publication,
  });
  const childTraversalPreparationPort = bindChildTraversalPreparationPort({
    store: context.store,
    publication: viewState.catalogState.publication,
    program: programValue,
    programValidation,
    rootImplementationSet: implementationSet,
    rootInteractionSet: executionAdmission.interactionSet,
  });
  const traversalCompletion = await hog.executeGraphTraversal({
    store: context.store,
    executionBasis: executionAdmission.executionBasis,
    openedTraversalScope: opened.scope,
    program: programValue,
    graphFunction,
    graph,
    graphValidation,
    implementationSet,
    interactionSet: executionAdmission.interactionSet,
    continuationProductBasis: {
      install: installState.install,
      workspaceBinding: workspaceState.binding,
      catalogView: viewState.view,
      programValidation,
      graphValidation,
    },
    leafPort,
    childTraversalPreparationPort,
    closureContract,
    actorRuntimeBinding: {
      workspaceBinding: workspaceState.binding,
    },
    input: admittedInput as unknown as Readonly<Record<string, product.JsonValue>>,
    inputDigest: rawInput.subjectDigest,
    eventTime: invocation.eventTime,
    correlationId: `${invocation.correlationId}/hog`,
  });
  const replayScope = {
    invocationRef: candidate.invocationRef,
    runId: opened.scope.runId,
  };
  const firstReplay = abg.replay(context.store, replayScope);
  const secondReplay = abg.replay(context.store, replayScope);
  if (traversalCompletion.replayState.replayDigest !== firstReplay.replayDigest) {
    throw new ApplicationRefusal("owner_refusal", "HoG completion and ABG replay disagree");
  }
  const persisted = await abg.persistEventLog(
    context.store,
    durableEventLogPath,
    replayScope,
  );
  const outcome = projectOutcome(
    invocation,
    firstReplay,
    secondReplay,
    graphFunction.outputs[0] ?? "",
    candidate.invocationRef,
    persisted,
  );
  if (outcome.disposition === "held") {
    if (
      traversalCompletion.continuationRef === null ||
      traversalCompletion.heldInteraction === null ||
      outcome.continuationRef !== traversalCompletion.continuationRef
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "held traversal is missing its exact continuation basis",
      );
    }
    const reopenAuthority = context.store.projectReopenAuthorityAndClose();
    continuationLocatorMap(context).set(traversalCompletion.continuationRef, {
      continuationRef: traversalCompletion.continuationRef,
      reopenAuthority,
      runtimeInvocationRef: candidate.invocationRef,
      outputContractRef: graphFunction.outputs[0] ?? "",
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      runId: traversalCompletion.heldInteraction.cCall.runId,
      installState,
      workspaceState,
      viewState,
      program: programValue,
      graph,
      closureContract,
    });
  }
  return outcome;
  } catch (error) {
    const failureSubject = {
      errorClass: error instanceof Error ? error.name : typeof error,
      stage: activeRefusalStage,
    };
    const diagnosticRef =
      `diagnostic://abiogenesis/operation-application/${activeRefusalStage}-exception@5`;
    if (failureExecutionBasis !== null && failureScope !== null) {
      const replayState = abg.replay(context.store, { runId: failureScope.runId });
      if (replayState.runtimeStatus !== "closed" && replayState.runtimeStatus !== "failed") {
        abg.admitRuntimeFailure(
          context.store,
          failureExecutionBasis,
          failureScope,
          "operation_application",
          failureSubject,
          diagnosticRef,
          {
            eventTime: invocation.eventTime,
            correlationId: `${invocation.correlationId}/operation-application-failure`,
            causationEventRefs: [],
          },
        );
      }
      return projectCurrentOutcome(
        context,
        invocation,
        graphFunction.outputs[0] ?? "",
        candidate.invocationRef,
        durableEventLogPath,
        failureScope.runId,
      );
    }
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      activeRefusalStage,
      product.sha256Canonical(failureSubject),
      [diagnosticRef],
      {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/operation-application-refusal`,
        causationEventRefs: [],
      },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
}

async function projectCurrentOutcome(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
  outputContractRef: string,
  runtimeInvocationRef: string,
  durableEventLogPath: string,
  runId?: string,
): Promise<PublicOutcome> {
  const scope = runId === undefined
    ? { invocationRef: runtimeInvocationRef }
    : { invocationRef: runtimeInvocationRef, runId };
  const first = abg.replay(context.store, scope);
  const second = abg.replay(context.store, scope);
  const eventLog = await abg.persistEventLog(context.store, durableEventLogPath, scope);
  return projectOutcome(
    invocation,
    first,
    second,
    outputContractRef,
    runtimeInvocationRef,
    eventLog,
  );
}

function eventLogPath(
  invocation: RootPublicInvocation,
  binding: product.WorkspaceBinding,
): string {
  const requested = resolve(stringField(invocation.payload, "eventLogPath"));
  const root = resolve(binding.roots.eventLogRoot);
  const relation = relative(root, requested);
  if (relation.startsWith("..") || isAbsolute(relation) || relation.length === 0) {
    throw new ApplicationRefusal("invalid_request", "eventLogPath must name a file below the admitted eventLogRoot");
  }
  return requested;
}

function requireContinuationLocator(
  context: RootOperationContext,
  continuationRef: string,
): ContinuationLocator {
  const state = continuationLocatorMap(context).get(continuationRef);
  if (state === undefined) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      `continuation ${continuationRef} is not open in this transcript`,
    );
  }
  return state;
}

function reopenContinuation(
  context: RootOperationContext,
  state: ContinuationLocator,
): abg.ReopenedEventStoreContext {
  const reopened = abg.reopenEventStore(state.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `durable continuation reopen refused: ${reopened.code}: ${reopened.message}`,
    );
  }
  context.store = reopened.store;
  return reopened;
}

function closeAndRememberContinuation(
  context: RootOperationContext,
  state: ContinuationLocator,
): ContinuationLocator {
  const updated = {
    ...state,
    reopenAuthority: context.store.projectReopenAuthorityAndClose(),
  };
  continuationLocatorMap(context).set(state.continuationRef, updated);
  return updated;
}

function continuationMetadata(
  state: ContinuationLocator,
  replayState: abg.ReplayState,
  eventLog: abg.PersistedEventLog,
  status: "open" | "responded" | "resolved",
) {
  return {
    runtimeInvocationRef: state.runtimeInvocationRef,
    ...(replayState.runId === null ? {} : { runId: replayState.runId }),
    ...(replayState.graphCallId === null
      ? {}
      : { graphCallId: replayState.graphCallId }),
    ...(replayState.frameId === null ? {} : { frameId: replayState.frameId }),
    replayRef: replayState.replayRef,
    replayDigest: replayState.replayDigest,
    eventLogPath: eventLog.eventLogPath,
    eventLogDigest: eventLog.eventLogDigest,
    eventLogByteLength: eventLog.durableByteLength,
    durableEventCount: eventLog.durableEventCount,
    continuationRef: state.continuationRef,
    continuationStatus: status,
  } as const;
}

async function applyProjectRead(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "status") {
    throw new ApplicationRefusal(
      "invalid_request",
      "project.read continuation requires variant status",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["continuationRef"],
    "project.read",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationLocator(context, continuationRef);
  reopenContinuation(context, state);
  try {
    const replayState = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuation = replayState.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    if (
      continuation === undefined ||
      continuation.status === "resolved"
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read requires the exact open or responded continuation",
      );
    }
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: continuation.runId },
    );
    return successOutcome(
      invocation,
      {
        kind: "continuation_status",
        schemaVersion: "5.0.0",
        continuationRef,
        status: continuation.status,
        requestRef: continuation.requestRef,
        requestDigest: continuation.requestDigest,
        responseContractRef: continuation.responseContractRef,
        responseRef: continuation.responseRef,
        replayRef: replayState.replayRef,
        replayDigest: replayState.replayDigest,
      },
      continuationMetadata(state, replayState, eventLog, continuation.status),
    );
  } finally {
    closeAndRememberContinuation(context, state);
  }
}

async function applyInteractionRespond(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "approve") {
    throw new ApplicationRefusal(
      "invalid_request",
      "interaction.respond requires the declared approve variant",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["actorRef", "capabilityRef", "continuationRef", "response"],
    "interaction.respond",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationLocator(context, continuationRef);
  reopenContinuation(context, state);
  try {
    const replayBefore = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuation = replayBefore.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    if (continuation === undefined || continuation.status !== "open") {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction.respond requires the exact open continuation",
      );
    }
    const responseCandidate = recordField(invocation.payload, "response");
    const semantics = await implementation.loadInstalledProductSemantics({
      store: context.store,
      install: state.installState.install,
      publication: state.viewState.catalogState.publication,
    });
    const response = semantics.admitInput(
      continuation.responseContractRef,
      responseCandidate,
    );
    if (response === null) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction response does not satisfy the Product-owned response contract",
      );
    }
    const rootInvocation = abg.rehydrateInvocationAdmission(
      context.store,
      state.invocationAdmissionRef,
    );
    if (rootInvocation === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "interaction response could not rehydrate its exact invocation authority",
      );
    }
    const operation = abg.admitContinuationPublicOperation(
      context.store,
      rootInvocation,
      "abg.operation.interaction.respond",
      continuationRef,
      invocation.variant,
      stringField(invocation.payload, "actorRef"),
      stringField(invocation.payload, "capabilityRef"),
      operationBasis(
        invocation,
        state.workspaceState.binding.bindingId,
        state.workspaceState.binding.bindingDigest,
        [],
      ),
    );
    const admitted = abg.admitFhInteractionResponse(
      context.store,
      continuationRef,
      operation,
      continuation.responseContractRef,
      response,
      {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/fh-response`,
        causationEventRefs: [],
      },
    );
    const replayAfter = abg.replay(context.store, {
      runId: continuation.runId,
    });
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: continuation.runId },
    );
    return successOutcome(
      invocation,
      {
        kind: admitted.kind,
        schemaVersion: admitted.schemaVersion,
        disposition: admitted.disposition,
        continuationRef,
        responseRef: admitted.responseRef,
        responseDigest: admitted.responseDigest,
      },
      continuationMetadata(state, replayAfter, eventLog, "responded"),
    );
  } finally {
    closeAndRememberContinuation(context, state);
  }
}

async function applyRunContinue(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "current_intent") {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.continue requires variant current_intent",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["actorRef", "capabilityRef", "continuationRef"],
    "run.continue",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationLocator(context, continuationRef);
  reopenContinuation(context, state);
  let completed = false;
  try {
    const replayBefore = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuation = replayBefore.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    if (
      continuation === undefined ||
      continuation.status !== "responded" ||
      continuation.responseRef === null ||
      continuation.responseDigest === null
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "run.continue requires the exact responded continuation",
      );
    }
    const rootInvocation = abg.rehydrateInvocationAdmission(
      context.store,
      state.invocationAdmissionRef,
    );
    if (rootInvocation === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "run continuation could not rehydrate its exact invocation authority",
      );
    }
    const operation = abg.admitContinuationPublicOperation(
      context.store,
      rootInvocation,
      "abg.operation.run.continue",
      continuationRef,
      invocation.variant,
      stringField(invocation.payload, "actorRef"),
      stringField(invocation.payload, "capabilityRef"),
      operationBasis(
        invocation,
        state.workspaceState.binding.bindingId,
        state.workspaceState.binding.bindingDigest,
        [],
      ),
    );
    const rehydrated = abg.rehydrateFhContinuation(
      context.store,
      continuationRef,
      {
        install: state.installState.install,
        workspaceBinding: state.workspaceState.binding,
        catalogView: state.viewState.view,
        program: state.program,
        graph: state.graph,
        closureContract: state.closureContract,
      },
      operation,
    );
    if (rehydrated === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "run continuation durable authority reconstruction failed",
      );
    }
    const heldCursor = hog.rehydrateHeldInteractionCursor(
      context.store,
      rehydrated.heldInteraction.cursor,
    );
    if (heldCursor === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "run continuation could not rehydrate its exact HoG cursor",
      );
    }
    const successorCursor = hog.deriveInteractionResumeCursor(
      heldCursor,
      {
        inputRef: continuation.responseRef,
        inputDigest: continuation.responseDigest,
      },
    );
    if (successorCursor.kind !== "traversal_cursor") {
      throw new ApplicationRefusal(
        "owner_refusal",
        `interaction resume cursor refused: ${successorCursor.message}`,
      );
    }
    const resume = abg.admitFhInteractionResume(
      context.store,
      continuationRef,
      operation,
      successorCursor,
      state.reopenAuthority.eventLogDigest,
      {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/fh-resume`,
        causationEventRefs: [],
      },
    );
    const completion = hog.completeInteractionResume({
      store: context.store,
      executionBasis: rehydrated.executionBasis,
      graph: state.graph,
      heldInteraction: {
        ...rehydrated.heldInteraction,
        cursor: heldCursor,
      },
      successorCursor,
      resume,
      closureContract: state.closureContract,
      clock: {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/hog`,
      },
    });
    const firstReplay = abg.replay(context.store, {
      runId: state.runId,
    });
    const secondReplay = abg.replay(context.store, {
      runId: state.runId,
    });
    if (completion.replayState.replayDigest !== firstReplay.replayDigest) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "continued HoG completion and ABG replay disagree",
      );
    }
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: state.runId },
    );
    const outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      state.outputContractRef,
      state.runtimeInvocationRef,
      eventLog,
    );
    completed = outcome.disposition === "succeeded";
    return outcome;
  } finally {
    closeAndRememberContinuation(context, state);
    if (completed) continuationLocatorMap(context).delete(continuationRef);
  }
}

export async function applyRootPublicInvocation(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (!context.productState.claimInvocation(invocation.invocationRef)) {
    return refusalOutcome(invocation, "duplicate_invocation", "invocationRef already appeared in this transcript");
  }
  const rawRequest = rawAdmission<RootPublicInvocation>(
    invocation,
    "public_operation_request",
    invocation.operationId === "abg.operation.run.invoke"
      ? "contract://abiogenesis/public/run-invoke-request@5"
      : `contract://abiogenesis/public/${invocation.operationId}@5`,
  );
  try {
    switch (invocation.operationId) {
      case "abg.operation.product.verify":
        return await applyVerify(context, invocation);
      case "abg.operation.product.install":
        return await applyInstall(context, invocation);
      case "abg.operation.workspace.bind":
        return await applyWorkspaceBind(context, invocation);
      case "abg.operation.catalog.admit":
        return await applyCatalogAdmit(context, invocation);
      case "abg.operation.catalog.view":
        return await applyCatalogView(context, invocation);
      case "abg.operation.project.read":
        return await applyProjectRead(context, invocation);
      case "abg.operation.interaction.respond":
        return await applyInteractionRespond(context, invocation);
      case "abg.operation.run.continue":
        return await applyRunContinue(context, invocation);
      case "abg.operation.run.invoke":
        return await applyRunInvoke(context, invocation, rawRequest);
    }
  } catch (error) {
    if (error instanceof ApplicationRefusal) {
      return refusalOutcome(invocation, error.code, error.message);
    }
    return refusalOutcome(invocation, "owner_refusal", String(error));
  }
}
