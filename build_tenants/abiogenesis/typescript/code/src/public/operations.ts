import { isAbsolute, relative, resolve } from "node:path";

import * as abg from "../abg/index.js";
import * as gtl from "../gtl/index.js";
import * as hog from "../hog/index.js";
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
import {
  constructPublicContinuationAuthority,
  parsePublicContinuationAuthority,
  updatePublicContinuationAuthority,
  type PublicContinuationAuthority,
} from "./continuation_authority.js";
import {
  constructPublicGapAuthority,
  parsePublicGapAuthority,
  updatePublicGapAuthority,
  type PublicGapAuthority,
} from "./gap_authority.js";
import {
  attachContinuationAuthority,
  projectOutcome,
} from "./outcome.js";

export interface RootOperationContext {
  store: abg.AbgEventStore;
  readonly productState: product.RootOperationState;
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
  return {
    store: new abg.AbgEventStore(),
    productState: new product.RootOperationState(),
  };
}

export function closeRootOperationContext(context: RootOperationContext): void {
  context.store.closeDurableLog();
}

function usesDurableContinuationAuthority(
  operationId: RootPublicInvocation["operationId"],
): boolean {
  return (
    operationId === "abg.operation.project.read" ||
    operationId === "abg.operation.interaction.respond" ||
    operationId === "abg.operation.run.continue"
  );
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

function isJsonRecord(
  value: product.JsonValue,
): value is Readonly<Record<string, product.JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
    runtimeInvocationRef: metadata.runtimeInvocationRef ?? null,
    disposition: "refused" as const,
    result,
    diagnosticRef,
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

async function applyCatalogApplication(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant !== "declaration") {
    throw new ApplicationRefusal(
      "invalid_request",
      "catalog.apply requires variant declaration",
    );
  }
  requireExactPayloadKeys(invocation.payload, [
    "catalogViewInvocationRef",
    "handle",
  ], "catalog.apply");
  const viewInvocationRef = stringField(
    invocation.payload,
    "catalogViewInvocationRef",
  );
  const viewState = required(
    context.productState.catalogView(viewInvocationRef),
    viewInvocationRef,
    "CatalogView",
  );
  const candidate = product.constructCatalogApplicationCandidate(
    viewState.view,
    stringField(invocation.payload, "handle"),
  );
  if (candidate.kind !== "catalog_application_candidate") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `Catalog application construction refused: ${candidate.message}`,
    );
  }
  const application = abg.admitCatalogApplication(
    context.store,
    viewState.view,
    candidate,
    operationBasis(
      invocation,
      viewState.view.viewId,
      viewState.view.viewDigest,
      [viewState.view.admissionEventRef],
    ),
  );
  if (application.kind !== "catalog_application") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `Catalog application admission refused: ${application.message}`,
    );
  }
  context.productState.rememberCatalogApplication(invocation.invocationRef, {
    viewState,
    application,
  });
  return successOutcome(invocation, {
    kind: application.kind,
    applicationId: application.applicationId,
    applicationDigest: application.applicationDigest,
    catalogId: application.catalogId,
    viewId: application.viewId,
    rowHandle: application.rowHandle,
    rowDigest: application.rowDigest,
    contributionKind: application.contributionKind,
    declarationOrContractRef: application.declarationOrContractRef,
    owningProductId: application.owningProductId,
    moduleRef: application.moduleRef,
    programMembershipRefs: application.programMembershipRefs,
    compatibilityDisposition: application.compatibilityDisposition,
    compatibilityRefs: application.compatibilityRefs,
    provenanceRefs: application.provenanceRefs,
    admissionEventRef: application.admissionEventRef,
  });
}

async function applyRunInvoke(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
  rawRequest: validator.RawAdmittedValue<RootPublicInvocation>,
): Promise<PublicOutcome> {
  if (invocation.variant !== "direct" && invocation.variant !== "start") {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.invoke requires the declared direct or start variant",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    invocation.variant === "direct"
      ? [
          "actorRef",
          "catalogViewInvocationRef",
          "eventLogPath",
          "graphFunctionRef",
          "input",
          "installInvocationRef",
          "programRef",
          "workspaceBindingInvocationRef",
        ]
      : [
          "actorRef",
          "catalogViewInvocationRef",
          "eventLogPath",
          "input",
          "installInvocationRef",
          "programRef",
          "reentryAuthority",
          "rootMode",
          "scope",
          "startRef",
          "target",
          "until",
          "workspaceBindingInvocationRef",
        ],
    "run.invoke",
  );
  const suppliedReentry = invocation.payload.reentryAuthority;
  const reentryState = suppliedReentry === undefined
    ? null
    : parsePublicGapAuthority(suppliedReentry);
  if (
    suppliedReentry !== undefined &&
    (
      invocation.variant !== "start" ||
      reentryState === null
    )
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "run.invoke re-entry requires one exact public gap authority on the start variant",
    );
  }
  if (
    reentryState !== null &&
    (
      reentryState.source.nextActionProjection.disposition !== "no_action" ||
      reentryState.source.nextActionProjection.noActionDisposition !==
        "gap_stop" ||
      stringField(invocation.payload, "installInvocationRef") !==
        reentryState.installInvocationRef ||
      stringField(invocation.payload, "workspaceBindingInvocationRef") !==
        reentryState.workspaceBindingInvocationRef ||
      stringField(invocation.payload, "catalogViewInvocationRef") !==
        reentryState.catalogViewInvocationRef
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke re-entry setup references differ from the durable gap authority",
    );
  }
  if (reentryState !== null) {
    reopenGapAuthority(context, reentryState);
  }
  const installState = reentryState === null
    ? required(
        context.productState.install(
          stringField(invocation.payload, "installInvocationRef"),
        ),
        stringField(invocation.payload, "installInvocationRef"),
        "ProductInstall",
      )
    : {
        candidate: { installedRoot: reentryState.install.installedRoot },
        install: reentryState.install,
      };
  const workspaceState = reentryState === null
    ? required(
        context.productState.workspace(
          stringField(invocation.payload, "workspaceBindingInvocationRef"),
        ),
        stringField(invocation.payload, "workspaceBindingInvocationRef"),
        "WorkspaceBinding",
      )
    : {
        lock: reentryState.resolvedProductLock,
        productSet: reentryState.productSet,
        binding: reentryState.workspaceBinding,
      };
  const viewState = reentryState === null
    ? required(
        context.productState.catalogView(
          stringField(invocation.payload, "catalogViewInvocationRef"),
        ),
        stringField(invocation.payload, "catalogViewInvocationRef"),
        "CatalogView",
      )
    : {
        catalogState: {
          publication: reentryState.catalog.modulePublication,
          programValidations: reentryState.catalog.programValidations,
          catalog: reentryState.catalog,
        },
        view: reentryState.catalogView,
      };
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
  const programValue = viewState.catalogState.publication.programs.find(
    (value) => value.programRef === programRef,
  );
  if (programValue === undefined) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke Program is absent from the admitted publication",
    );
  }
  const resolvedStart = invocation.variant === "start"
    ? gtl.resolveProgramStart(programValue, {
        scope: stringField(invocation.payload, "scope") as "program",
        target: stringField(invocation.payload, "target"),
        until: stringField(invocation.payload, "until") as "converged",
        rootMode: stringField(invocation.payload, "rootMode") as
          | "direct"
          | "supervised",
        ...(typeof invocation.payload.startRef === "string"
          ? { startRef: invocation.payload.startRef }
          : {}),
      })
    : null;
  const start =
    resolvedStart?.kind === "resolved_program_start"
      ? resolvedStart.start
      : undefined;
  if (
    invocation.variant === "start" &&
    resolvedStart?.kind !== "resolved_program_start"
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      resolvedStart?.message ??
        "run.invoke start requires one Product-resolved Program start",
    );
  }
  if (
    reentryState !== null &&
    (
      invocation.variant !== "start" ||
      start === undefined ||
      reentryState.publicStart.programRef !== programValue.programRef ||
      reentryState.publicStart.graphFunctionRef !== start.graphFunctionRef ||
      reentryState.publicStart.startRef !== start.startRef ||
      reentryState.publicStart.scope !==
        stringField(invocation.payload, "scope") ||
      reentryState.publicStart.target !==
        stringField(invocation.payload, "target") ||
      reentryState.publicStart.until !==
        stringField(invocation.payload, "until") ||
      reentryState.publicStart.rootMode !==
        stringField(invocation.payload, "rootMode")
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke re-entry must preserve the exact admitted public start identity",
    );
  }
  const graphFunctionRef = invocation.variant === "direct"
    ? stringField(invocation.payload, "graphFunctionRef")
    : start!.graphFunctionRef;
  const graphFunction = viewState.catalogState.publication.graphFunctions.find(
    (value) => value.name === graphFunctionRef,
  );
  if (graphFunction === undefined) {
    throw new ApplicationRefusal("target_mismatch", "run.invoke target is absent from the admitted publication");
  }
  const selectedRow = viewState.view.selectedRows.find(
    (row) =>
      (
        row.handle === graphFunctionRef ||
        row.declarationOrContractRef === graphFunctionRef
      ) &&
      row.disposition === "admitted" &&
      row.callability === "callable" &&
      row.programMembershipRefs.includes(programRef),
  );
  const storedProgramValidation = viewState.catalogState.programValidations.find(
    (value) => value.programRef === programRef,
  );
  if (
    selectedRow === undefined ||
    !programValue.callableMembership.includes(graphFunctionRef) ||
    storedProgramValidation === undefined
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke target must be callable under the exact admitted CatalogView and Program validation",
    );
  }
  let programValidation: validator.ProgramValidation = storedProgramValidation;
  if (reentryState !== null) {
    const publicationAdmission = rawAdmission<ModulePublication>(
      viewState.catalogState.publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const revalidated = validator.validateProgram(
      rawProgramInput(publicationAdmission, programValue),
    );
    if (
      revalidated.kind !== "program_validation" ||
      product.sha256Canonical(
        revalidated as unknown as product.JsonValue,
      ) !==
        product.sha256Canonical(
          storedProgramValidation as unknown as product.JsonValue,
        )
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "run.invoke re-entry could not reproduce its admitted non-lowering Program validation",
      );
    }
    programValidation = revalidated;
  }
  const inputValue = recordField(invocation.payload, "input");
  if (graphFunction.inputs.length !== 1) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input must satisfy the selected GraphFunction's exact admitted input contract",
    );
  }
  const inputContractRef = graphFunction.inputs[0]!;
  let admittedInput: Readonly<Record<string, product.JsonValue>> | null;
  try {
    admittedInput = await hog.admitInstalledProductInput(
      {
        store: context.store,
        install: installState.install,
        publication: viewState.catalogState.publication,
      },
      inputContractRef,
      inputValue,
    );
  } catch {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke selected Product semantics binding is not carried by the exact admitted install",
    );
  }
  if (admittedInput === null) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke input is refused by the selected Product-owned contract semantics",
    );
  }
  if (
    !abg.hasExactInvocationObservationBasis(
      admittedInput as unknown as Readonly<
        Record<string, product.JsonValue>
      >,
      workspaceState.binding.bindingId,
      workspaceState.binding.bindingDigest,
      programValue,
    )
  ) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke observation does not bind the exact admitted workspace and Program action catalog",
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
  const interactionCapabilityRefs = [
    ...new Set(
      programValidation.interactionLeafRows.map(
        (row) => row.requirement.actorCapabilityRef,
      ),
    ),
  ].sort();
  const grants = [
    product.constructCapabilityGrant(actorRef),
    ...interactionCapabilityRefs.flatMap((capabilityRef) => [
      product.constructCapabilityGrant(
        actorRef,
        "abg.operation.interaction.respond",
        capabilityRef,
      ),
      product.constructCapabilityGrant(
        actorRef,
        "abg.operation.run.continue",
        capabilityRef,
      ),
    ]),
  ];
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceState.binding,
    viewState.view,
    programValue.programRef,
    graphFunction.name,
    grants,
  );
  if (authority.kind !== "invocation_authority") {
    throw new ApplicationRefusal("owner_refusal", `Invocation authority refused: ${authority.message}`);
  }
  const candidate = (invocation.variant === "direct"
    ? product.constructDirectInvocation
    : product.constructStartInvocation)(
    workspaceState.binding,
    viewState.view,
    programValue,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    grants,
    authority,
  );
  if (candidate.kind !== "public_invocation_candidate") {
    throw new ApplicationRefusal("owner_refusal", `Invocation construction refused: ${candidate.message}`);
  }
  const durableEventLogPath = eventLogPath(invocation, workspaceState.binding);
  if (reentryState === null) {
    context.store.configureDurableLog(durableEventLogPath);
  } else if (durableEventLogPath !== reentryState.reopenAuthority.eventLogPath) {
    throw new ApplicationRefusal(
      "target_mismatch",
      "run.invoke re-entry must append to the exact durable source log",
    );
  }
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
      capabilityGrants: grants,
      authority,
      ...(reentryState === null
        ? {}
        : {
            reentryBasis: {
              kind: "invocation_reentry_basis" as const,
              schemaVersion: "5.0.0" as const,
              publicAuthorityDigest: reentryState.authorityDigest,
              sourceInvocationAdmissionRef:
                reentryState.source.sourceInvocationAdmissionRef,
              sourceRunId: reentryState.source.sourceRunId,
              sourceRouteRef: reentryState.source.sourceRouteRef,
              sourceRouteDigest: reentryState.source.sourceRouteDigest,
              sourceRouteEventRef:
                reentryState.source.sourceRouteEventRef,
              sourceRunStoppedEventRef:
                reentryState.source.sourceRunStoppedEventRef,
              gapRef: reentryState.source.gapRef,
              nextActionProjectionRef:
                reentryState.source.nextActionProjectionRef,
              nextActionProjectionDigest:
                reentryState.source.nextActionProjectionDigest,
              productSetId: reentryState.productSet.productSetId,
              productSetDigest: reentryState.productSet.productSetDigest,
              lockId: reentryState.resolvedProductLock.lockId,
              lockDigest: reentryState.resolvedProductLock.lockDigest,
              sourceStart: reentryState.publicStart,
            },
          }),
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
  const leafPort = await hog.bindInstalledLeafInvocationPort({
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
  let outcome = projectOutcome(
    invocation,
    firstReplay,
    secondReplay,
    graphFunction.outputs[0] ?? "",
    candidate.invocationRef,
    persisted,
  );
  const noActionStop =
    isJsonRecord(outcome.result) &&
    (
      outcome.result.kind === "construction_gap_stop" ||
      outcome.result.kind === "construction_no_action_stop"
    );
  const supervisedGapStart =
    invocationAdmission.publicStart?.until === "converged" &&
    invocationAdmission.publicStart.rootMode === "supervised" &&
    invocationAdmission.publicStart.target ===
      invocationAdmission.publicStart.startRef;
  if (noActionStop && supervisedGapStart) {
    const gapRoute = firstReplay.routes.find(
      (route) =>
        route.routeKind === "gap_stop" &&
        route.cCallRef === traversalCompletion.cCallRef &&
        route.judgmentRef === traversalCompletion.judgmentRef,
    );
    if (
      traversalCompletion.disposition !== "gap_stop" ||
      firstReplay.runId === null ||
      firstReplay.runStoppedEventRef === null ||
      gapRoute?.nextActionProjection?.disposition !== "no_action"
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "stopped traversal lacks its exact replayed no-action route",
      );
    }
    const reopenAuthority = context.store.projectReopenAuthorityAndClose();
    const gapAuthority = constructPublicGapAuthority({
      reopenAuthority,
      installInvocationRef:
        stringField(invocation.payload, "installInvocationRef"),
      workspaceBindingInvocationRef:
        stringField(invocation.payload, "workspaceBindingInvocationRef"),
      catalogViewInvocationRef:
        stringField(invocation.payload, "catalogViewInvocationRef"),
      install: installState.install,
      resolvedProductLock: workspaceState.lock,
      productSet: workspaceState.productSet,
      workspaceBinding: workspaceState.binding,
      catalog: viewState.catalogState.catalog,
      catalogView: viewState.view,
      publicStart: {
        kind: "public_start_identity",
        schemaVersion: "5.0.0",
        programRef: programValue.programRef,
        graphFunctionRef: graphFunction.name,
        startRef: start!.startRef,
        scope: "program",
        target: start!.startRef,
        until: "converged",
        rootMode: "supervised",
      },
      source: {
        sourceInvocationRef: candidate.invocationRef,
        sourceInvocationAdmissionRef:
          invocationAdmission.invocationAdmissionRef,
        sourceRunId: firstReplay.runId,
        sourceRouteRef: gapRoute.routeRef,
        sourceRouteDigest: gapRoute.routeDigest,
        sourceRouteEventRef: gapRoute.admissionEventRef,
        sourceRunStoppedEventRef: firstReplay.runStoppedEventRef,
        gapRef: gapRoute.nextActionProjection.gapRef,
        nextActionProjectionRef:
          gapRoute.nextActionProjection.projectionRef,
        nextActionProjectionDigest:
          gapRoute.nextActionProjection.projectionDigest,
        nextActionProjection:
          gapRoute.nextActionProjection as unknown as Readonly<
            Record<string, product.JsonValue>
          >,
      },
    });
    outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      persisted,
      null,
      gapAuthority as unknown as product.JsonValue,
    );
  } else if (outcome.disposition === "held") {
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
    const continuationAuthority = constructPublicContinuationAuthority({
      continuationRef: traversalCompletion.continuationRef,
      reopenAuthority,
      runtimeInvocationRef: candidate.invocationRef,
      outputContractRef: graphFunction.outputs[0] ?? "",
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      runId: traversalCompletion.heldInteraction.cCall.runId,
      install: installState.install,
      workspaceBinding: workspaceState.binding,
      catalog: viewState.catalogState.catalog,
      catalogView: viewState.view,
      program: programValue,
      graph,
      invocationInput:
        admittedInput as unknown as Readonly<Record<string, product.JsonValue>>,
      closureContract,
    });
    outcome = projectOutcome(
      invocation,
      firstReplay,
      secondReplay,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      persisted,
      continuationAuthority as unknown as product.JsonValue,
    );
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

function requireContinuationAuthority(
  continuationRef: string,
  payload: Readonly<Record<string, product.JsonValue>>,
): PublicContinuationAuthority {
  const supplied = payload.continuationAuthority;
  if (supplied === undefined) {
    throw new ApplicationRefusal(
      "missing_prerequisite",
      `continuation ${continuationRef} requires its durable public authority`,
    );
  }
  const parsed = parsePublicContinuationAuthority(
    supplied,
    continuationRef,
  );
  if (parsed === null) {
    throw new ApplicationRefusal(
      "invalid_request",
      "continuationAuthority is not the exact self-consistent public carrier",
    );
  }
  return parsed;
}

function reopenContinuation(
  context: RootOperationContext,
  state: PublicContinuationAuthority,
): abg.ReopenedEventStoreContext {
  const reopened = abg.reopenEventStore(state.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `durable continuation reopen refused: ${reopened.code}: ${reopened.message}`,
    );
  }
  const rootInvocation = abg.rehydrateInvocationAdmission(
    reopened.store,
    state.invocationAdmissionRef,
  );
  if (
    rootInvocation === null ||
    rootInvocation.invocationRef !== state.runtimeInvocationRef ||
    rootInvocation.outputContractRef !== state.outputContractRef ||
    rootInvocation.workspaceBindingId !== state.workspaceBinding.bindingId ||
    rootInvocation.workspaceBindingDigest !==
      state.workspaceBinding.bindingDigest ||
    rootInvocation.catalogViewId !== state.catalogView.viewId ||
    rootInvocation.catalogViewDigest !== state.catalogView.viewDigest ||
    rootInvocation.programRef !== state.program.programRef ||
    rootInvocation.graphFunctionRef !== state.graph.graphFunctionRef ||
    state.catalog.catalogId !== state.catalogView.catalogId ||
    state.catalog.catalogDigest !== state.catalogView.catalogDigest ||
    state.graph.admittedInputDigest !==
      product.sha256Canonical(state.invocationInput) ||
    !abg.hasAdmittedProductInstall(reopened.store, state.install) ||
    !abg.hasAdmittedWorkspaceBinding(reopened.store, state.workspaceBinding) ||
    !abg.hasAdmittedCatalog(reopened.store, state.catalog) ||
    !abg.hasAdmittedCatalogView(reopened.store, state.catalogView) ||
    gtl.rehydrateMaterializedGtlGraph(state.graph) === null
  ) {
    reopened.store.closeDurableLog();
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable continuation authority differs from its admitted Product and invocation basis",
    );
  }
  context.store = reopened.store;
  return reopened;
}

function closeContinuationContext(
  context: RootOperationContext,
  state: PublicContinuationAuthority,
): PublicContinuationAuthority {
  return updatePublicContinuationAuthority(
    state,
    context.store.projectReopenAuthorityAndClose(),
  );
}

function continuationMetadata(
  state: PublicContinuationAuthority,
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

function reopenGapAuthority(
  context: RootOperationContext,
  state: PublicGapAuthority,
): {
  readonly rootInvocation: abg.InvocationAdmission;
  readonly replayState: abg.ReplayState;
  readonly route: abg.ReplayRouteState;
} {
  const reopened = abg.reopenEventStore(state.reopenAuthority);
  if (reopened.kind !== "reopened_event_store_context") {
    throw new ApplicationRefusal(
      "owner_refusal",
      `durable gap reopen refused: ${reopened.code}: ${reopened.message}`,
    );
  }
  const rootInvocation = abg.rehydrateInvocationAdmission(
    reopened.store,
    state.source.sourceInvocationAdmissionRef,
  );
  const replayState = abg.replay(reopened.store, {
    runId: state.source.sourceRunId,
  });
  const route = replayState.routes.find(
    (candidate) =>
      candidate.routeKind === "gap_stop" &&
      candidate.routeRef === state.source.sourceRouteRef &&
      candidate.routeDigest === state.source.sourceRouteDigest &&
      candidate.admissionEventRef === state.source.sourceRouteEventRef,
  );
  const stopEvent = reopened.store.readAll().find(
    (event) =>
      event.eventId === state.source.sourceRunStoppedEventRef &&
      event.kind === "run_stopped" &&
      event.runId === state.source.sourceRunId,
  );
  const selectedLockRow = state.resolvedProductLock.rows.find(
    (row) => row.installId === state.install.installId,
  );
  const noActionDisposition =
    route?.nextActionProjection?.disposition === "no_action"
      ? route.nextActionProjection.noActionDisposition
      : null;
  const stoppedDisposition =
    stopEvent !== undefined &&
      isJsonRecord(stopEvent.payload) &&
      typeof stopEvent.payload.disposition === "string"
      ? stopEvent.payload.disposition
      : null;
  const expectedRuntimeStatus = noActionDisposition === "gap_stop"
    ? "gap_stopped"
    : "stopped";
  if (
    rootInvocation === null ||
    rootInvocation.invocationRef !== state.source.sourceInvocationRef ||
    rootInvocation.invocationVariant !== "start" ||
    rootInvocation.publicStart === null ||
    product.sha256Canonical(
      rootInvocation.publicStart as unknown as product.JsonValue,
    ) !== product.sha256Canonical(
      state.publicStart as unknown as product.JsonValue,
    ) ||
    !product.isResolvedProductLock(state.resolvedProductLock) ||
    !product.isProductSet(state.productSet, state.resolvedProductLock) ||
    state.workspaceBinding.productSetId !== state.productSet.productSetId ||
    state.workspaceBinding.productSetDigest !==
      state.productSet.productSetDigest ||
    state.workspaceBinding.lockId !== state.resolvedProductLock.lockId ||
    state.workspaceBinding.lockDigest !==
      state.resolvedProductLock.lockDigest ||
    !state.productSet.orderedInstallRefs.includes(state.install.installId) ||
    selectedLockRow === undefined ||
    selectedLockRow.productId !== state.install.productId ||
    selectedLockRow.packageName !== state.install.packageName ||
    selectedLockRow.packageVersion !== state.install.packageVersion ||
    selectedLockRow.artifactDigest !== state.install.artifactDigest ||
    selectedLockRow.productContentDigest !==
      state.install.productContentDigest ||
    selectedLockRow.manifestDigest !== state.install.manifestDigest ||
    rootInvocation.workspaceBindingId !== state.workspaceBinding.bindingId ||
    rootInvocation.workspaceBindingDigest !==
      state.workspaceBinding.bindingDigest ||
    rootInvocation.catalogViewId !== state.catalogView.viewId ||
    rootInvocation.catalogViewDigest !== state.catalogView.viewDigest ||
    state.install.installedRoot !== state.workspaceBinding.roots.productRoot ||
    state.catalog.workspaceBindingId !== state.workspaceBinding.bindingId ||
    state.catalog.workspaceBindingDigest !==
      state.workspaceBinding.bindingDigest ||
    state.catalog.catalogId !== state.catalogView.catalogId ||
    state.catalog.catalogDigest !== state.catalogView.catalogDigest ||
    !abg.hasAdmittedProductInstall(reopened.store, state.install) ||
    !abg.hasAdmittedWorkspaceBinding(reopened.store, state.workspaceBinding) ||
    !abg.hasAdmittedCatalog(reopened.store, state.catalog) ||
    !abg.hasAdmittedCatalogView(reopened.store, state.catalogView) ||
    route === undefined ||
    route.nextActionProjectionRef !==
      state.source.nextActionProjectionRef ||
    route.nextActionProjectionDigest !==
      state.source.nextActionProjectionDigest ||
    route.nextActionProjection?.disposition !== "no_action" ||
    route.nextActionProjection.gapRef !== state.source.gapRef ||
    product.sha256Canonical(
      route.nextActionProjection as unknown as product.JsonValue,
    ) !== product.sha256Canonical(
      state.source.nextActionProjection as unknown as product.JsonValue,
    ) ||
    stopEvent === undefined ||
    noActionDisposition === null ||
    stoppedDisposition !== noActionDisposition ||
    replayState.runStoppedDisposition !== noActionDisposition ||
    !stopEvent.causationEventRefs.includes(
      state.source.sourceRouteEventRef,
    ) ||
    replayState.runtimeStatus !== expectedRuntimeStatus ||
    replayState.runStoppedEventRef !==
      state.source.sourceRunStoppedEventRef
  ) {
    reopened.store.closeDurableLog();
    throw new ApplicationRefusal(
      "owner_refusal",
      "durable gap authority differs from its admitted Product, route, stop, or invocation basis",
    );
  }
  context.store = reopened.store;
  return { rootInvocation, replayState, route };
}

function closeGapAuthority(
  context: RootOperationContext,
  state: PublicGapAuthority,
): PublicGapAuthority {
  return updatePublicGapAuthority(
    state,
    context.store.projectReopenAuthorityAndClose(),
  );
}

async function applyGapRead(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  requireExactPayloadKeys(
    invocation.payload,
    ["gapAuthority", "gapRef"],
    "project.read",
  );
  const gapRef = stringField(invocation.payload, "gapRef");
  const state = parsePublicGapAuthority(
    invocation.payload.gapAuthority,
    gapRef,
  );
  if (state === null) {
    throw new ApplicationRefusal(
      "invalid_request",
      "project.read gaps requires the exact self-consistent public gap authority",
    );
  }
  reopenGapAuthority(context, state);
  let closed = false;
  try {
    const replayState = abg.replay(context.store, {
      runId: state.source.sourceRunId,
    });
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: state.source.sourceRunId },
    );
    if (
      eventLog.eventCount !== replayState.eventCount ||
      eventLog.eventLogDigest !== state.reopenAuthority.eventLogDigest
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "project.read gaps must remain a pure projection over one exact durable prefix",
      );
    }
    const updated = closeGapAuthority(context, state);
    closed = true;
    return successOutcome(
      invocation,
      {
        kind: "public_gap_projection",
        schemaVersion: "5.0.0",
        constructionStatus:
          state.source.nextActionProjection.noActionDisposition ===
              "reprice_required"
            ? "reprice_required"
            : "construction_stalled",
        gapRef,
        sourceRunId: state.source.sourceRunId,
        sourceRouteRef: state.source.sourceRouteRef,
        nextActionProjection:
          state.source.nextActionProjection as unknown as product.JsonValue,
        gapAuthority: updated as unknown as product.JsonValue,
      },
      {
        runtimeInvocationRef: state.source.sourceInvocationRef,
        runId: state.source.sourceRunId,
        replayRef: replayState.replayRef,
        replayDigest: replayState.replayDigest,
        eventLogPath: eventLog.eventLogPath,
        eventLogDigest: eventLog.eventLogDigest,
        eventLogByteLength: eventLog.durableByteLength,
        durableEventCount: eventLog.durableEventCount,
      },
    );
  } finally {
    if (!closed) closeGapAuthority(context, state);
  }
}

async function applyProjectRead(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (invocation.variant === "gaps") {
    return applyGapRead(context, invocation);
  }
  if (
    !["lawful-actions", "replay", "result", "status"].includes(
      invocation.variant,
    )
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "project.read continuation requires status, result, replay, or lawful-actions",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    ["continuationAuthority", "continuationRef"],
    "project.read",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  reopenContinuation(context, state);
  let closed = false;
  try {
    const replayState = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuation = replayState.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    if (continuation === undefined) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read requires the exact admitted continuation",
      );
    }
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: continuation.runId },
    );
    const intentRoute = continuation.constructionIntentRef === null
      ? undefined
      : replayState.routes.find(
          (route) =>
            route.constructionIntentRef ===
              continuation.constructionIntentRef,
        );
    const latestActionRoute = [...replayState.routes].reverse().find(
      (route) => route.nextActionProjection !== undefined,
    );
    const actionCalls = replayState.cCalls.filter(
      (cCall) =>
        cCall.status === "judged" &&
        cCall.judgmentRef !== null &&
        replayState.routes.some(
          (route) =>
            route.cCallRef === cCall.cCallRef &&
            route.judgmentRef === cCall.judgmentRef,
        ) &&
        typeof cCall.resultValue === "object" &&
        cCall.resultValue !== null &&
        !Array.isArray(cCall.resultValue) &&
        (
          cCall.resultValue as Readonly<
            Record<string, product.JsonValue>
          >
        ).kind === "next_action_projection",
    );
    const latestActionCall = actionCalls.at(-1);
    const latestConstructionDelta =
      replayState.constructionDeltas.at(-1) ?? null;
    const scopedEvents = context.store.readScope({ runId: state.runId });
    const constructionStatus = replayState.runtimeStatus === "closed"
      ? "construction_closed"
      : replayState.runtimeStatus === "blocked"
        ? "construction_blocked"
        : replayState.runtimeStatus === "failed"
          ? "construction_stalled"
          : replayState.runtimeStatus === "stopped" &&
              [
                "repair",
                "inspect_runtime_archive",
                "reprice",
                "escalate",
              ].includes(String(replayState.runStoppedDisposition))
            ? `construction_${replayState.runStoppedDisposition}`
          : continuation.status === "open"
            ? "fh_input_required"
            : "construction_progressing_yield";
    const eventsBeforeRead = context.store.readAll();
    const projectedResult = invocation.variant === "result"
      ? projectOutcome(
          invocation,
          replayState,
          abg.replay(context.store, { runId: state.runId }),
          state.outputContractRef,
          state.runtimeInvocationRef,
          eventLog,
        )
      : null;
    if (
      invocation.variant === "result" &&
      (
        continuation.status !== "resolved" ||
        projectedResult?.disposition !== "succeeded"
      )
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "project.read result requires one replay-closed resolved continuation",
      );
    }
    const readResult = invocation.variant === "status"
      ? {
          kind: "continuation_status",
          schemaVersion: "5.0.0",
          continuationRef,
          status: continuation.status,
          constructionStatus,
          runtimeStatus: replayState.runtimeStatus,
          requestRef: continuation.requestRef,
          requestDigest: continuation.requestDigest,
          responseContractRef: continuation.responseContractRef,
          responseRef: continuation.responseRef,
          constructionIntentRef: continuation.constructionIntentRef,
          constructionIntentDigest: continuation.constructionIntentDigest,
          runStoppedDisposition: replayState.runStoppedDisposition,
          actionEvaluation:
            latestConstructionDelta?.actionEvaluation ?? null,
          runtimeArchiveInspection:
            latestConstructionDelta?.actionEvaluation
              .runtimeArchiveInspection ?? null,
          nextActionProjection:
            intentRoute?.nextActionProjection === undefined
              ? null
              : intentRoute.nextActionProjection as unknown as product.JsonValue,
          replayRef: replayState.replayRef,
          replayDigest: replayState.replayDigest,
        }
      : invocation.variant === "result"
        ? {
            kind: "public_result_projection",
            schemaVersion: "5.0.0",
            constructionStatus,
            disposition: projectedResult!.disposition,
            resultRef: projectedResult!.resultRef,
            resultContractRef: projectedResult!.admittedResultContractRef,
            outputContractRef: projectedResult!.outputContractRef,
            value: projectedResult!.result,
            closureEligible: true,
            residuals: [],
            replayRef: replayState.replayRef,
            replayDigest: replayState.replayDigest,
          }
        : invocation.variant === "replay"
          ? {
              kind: "public_replay_projection",
              schemaVersion: "5.0.0",
              runId: state.runId,
              ordering: "admission_ordinal",
              fromOrdinal:
                scopedEvents.at(0)?.admissionOrdinal ?? null,
              toOrdinal:
                scopedEvents.at(-1)?.admissionOrdinal ?? null,
              eventCount: scopedEvents.length,
              events: scopedEvents,
              replayRef: replayState.replayRef,
              replayDigest: replayState.replayDigest,
              eventStoreDigest: replayState.eventStoreDigest,
            }
          : {
              kind: "public_lawful_actions_projection",
              schemaVersion: "5.0.0",
              constructionStatus,
              current: latestActionCall?.resultValue ??
                latestActionRoute?.nextActionProjection ??
                null,
              rows: actionCalls
                .map((cCall) => ({
                  cCallRef: cCall.cCallRef,
                  resultRef: cCall.resultRef,
                  judgmentRef: cCall.judgmentRef,
                  projection: cCall.resultValue,
                })),
              replayRef: replayState.replayRef,
              replayDigest: replayState.replayDigest,
            };
    if (
      context.store.readAll().length !== eventsBeforeRead.length ||
      context.store.digest({ runId: state.runId }) !==
        replayState.eventStoreDigest
    ) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "project.read must not append or alter runtime truth",
      );
    }
    const updated = closeContinuationContext(context, state);
    closed = true;
    return successOutcome(
      invocation,
      {
        ...readResult,
        continuationAuthority: updated as unknown as product.JsonValue,
      } as unknown as product.JsonValue,
      continuationMetadata(
        updated,
        replayState,
        eventLog,
        continuation.status,
      ),
    );
  } finally {
    if (!closed) closeContinuationContext(context, state);
  }
}

async function applyInteractionRespond(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (
    invocation.variant !== "approve" &&
    invocation.variant !== "answer_escalation"
  ) {
    throw new ApplicationRefusal(
      "invalid_request",
      "interaction.respond requires the declared approve or answer_escalation variant",
    );
  }
  requireExactPayloadKeys(
    invocation.payload,
    [
      "actorRef",
      "capabilityRef",
      "continuationAuthority",
      "continuationRef",
      "response",
    ],
    "interaction.respond",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  reopenContinuation(context, state);
  let closed = false;
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
    const interactionBasis = abg.projectFhInteractionSemanticBasis(
      context.store,
      continuationRef,
    );
    if (interactionBasis === null) {
      throw new ApplicationRefusal(
        "owner_refusal",
        "interaction response could not reproduce its exact pending Product basis",
      );
    }
    const response = await hog.evaluateInstalledInteractionResponse(
      {
        store: context.store,
        install: state.install,
        publication: state.catalog.modulePublication,
      },
      interactionBasis,
      responseCandidate,
    );
    if (response === null) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction response differs from the Product-owned pending choice or response contract",
      );
    }
    const correctionDisposition = response.correctionDisposition;
    if (
      (
        correctionDisposition !== undefined &&
        (
          invocation.variant !== "answer_escalation" ||
          ![
            "repair",
            "inspect_runtime_archive",
            "reprice",
            "escalate",
          ].includes(String(correctionDisposition))
        )
      )
    ) {
      throw new ApplicationRefusal(
        "target_mismatch",
        "interaction response variant differs from its Product-owned correction decision",
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
        state.workspaceBinding.bindingId,
        state.workspaceBinding.bindingDigest,
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
    const updated = closeContinuationContext(context, state);
    closed = true;
    return successOutcome(
      invocation,
      {
        kind: admitted.kind,
        schemaVersion: admitted.schemaVersion,
        disposition: admitted.disposition,
        continuationRef,
        responseRef: admitted.responseRef,
        responseDigest: admitted.responseDigest,
        continuationAuthority: updated as unknown as product.JsonValue,
      },
      continuationMetadata(updated, replayAfter, eventLog, "responded"),
    );
  } catch (error) {
    const replayAfterRefusal = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuationAfterRefusal = replayAfterRefusal.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: state.runId },
    );
    const updatedAuthority = closeContinuationContext(context, state);
    closed = true;
    const code =
      error instanceof ApplicationRefusal ? error.code : "owner_refusal";
    const message =
      error instanceof Error ? error.message : String(error);
    const outcome = refusalOutcome(
      invocation,
      code,
      message,
      continuationMetadata(
        updatedAuthority,
        replayAfterRefusal,
        eventLog,
        continuationAfterRefusal?.status ?? "open",
      ),
    );
    return attachContinuationAuthority(
      outcome,
      updatedAuthority as unknown as product.JsonValue,
    );
  } finally {
    if (!closed) closeContinuationContext(context, state);
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
    [
      "actorRef",
      "capabilityRef",
      "continuationAuthority",
      "continuationRef",
    ],
    "run.continue",
  );
  const continuationRef = stringField(invocation.payload, "continuationRef");
  const state = requireContinuationAuthority(
    continuationRef,
    invocation.payload,
  );
  reopenContinuation(context, state);
  let durableAuthorityClosed = false;
  let resumedFailureBasis: {
    readonly executionBasis: abg.ExecutionBasis;
    readonly scope: abg.OpenedTraversalScope;
    readonly resumeEventRef: string;
  } | null = null;
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
        state.workspaceBinding.bindingId,
        state.workspaceBinding.bindingDigest,
        [],
      ),
    );
    const rehydrated = abg.rehydrateFhContinuation(
      context.store,
      continuationRef,
      {
        install: state.install,
        workspaceBinding: state.workspaceBinding,
        catalogView: state.catalogView,
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
    const successorInput = abg.deriveFhResumeSuccessorInput(
      context.store,
      continuationRef,
      operation,
      rehydrated.executionBasis,
      state.closureContract,
    );
    const successorCursor = hog.deriveInteractionResumeCursor(
      heldCursor,
      {
        inputRef: successorInput.inputRef,
        inputDigest: successorInput.inputDigest,
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
      rehydrated.executionBasis,
      state.closureContract,
      successorInput,
      successorCursor,
      state.reopenAuthority.eventLogDigest,
      {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/fh-resume`,
        causationEventRefs: [],
      },
    );
    resumedFailureBasis = {
      executionBasis: rehydrated.executionBasis,
      scope: rehydrated.openedTraversalScope,
      resumeEventRef: resume.admissionEventRef,
    };
    let completion = hog.completeInteractionResume({
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
    if (completion.disposition === "advanced") {
      if (
        completion.nextCursor === null ||
        completion.resultValue === null ||
        typeof completion.resultValue !== "object" ||
        Array.isArray(completion.resultValue)
      ) {
        throw new ApplicationRefusal(
          "owner_refusal",
          "advanced interaction resume lacks its GTL-derived cursor and admitted response",
        );
      }
      const publication = state.catalog.modulePublication;
      const graphFunction = publication.graphFunctions.find(
        (value) => value.name === state.graph.graphFunctionRef,
      );
      const publicationAdmission = rawAdmission<ModulePublication>(
        publication,
        "module_publication",
        "contract://abiogenesis/gtl/module-publication@5",
      );
      const programValidation = validator.validateProgram(
        rawProgramInput(publicationAdmission, state.program),
      );
      if (
        graphFunction === undefined ||
        programValidation.kind !== "program_validation" ||
        programValidation.validationRef !==
          rehydrated.executionBasis.programValidationRef
      ) {
        throw new ApplicationRefusal(
          "owner_refusal",
          "continued run could not reproduce its admitted Program validation",
        );
      }
      const graphValidation = validator.validateGraph(
        state.graph,
        programValidation,
        graphFunction,
        {
          invocationAdmissionRef: rootInvocation.invocationAdmissionRef,
          admittedInputRef: state.graph.admittedInputRef,
          admittedInputDigest: state.graph.admittedInputDigest,
          admittedInput: state.invocationInput,
        },
      );
      const implementationSet = abg.rehydrateAdmittedImplementationSet(
        context.store,
        rehydrated.executionBasis.implementationSetRef,
      );
      const interactionSet = abg.rehydrateAdmittedInteractionSet(
        context.store,
        rehydrated.executionBasis.interactionSetRef,
      );
      if (
        graphValidation.kind !== "graph_validation" ||
        graphValidation.validationRef !==
          rehydrated.executionBasis.graphValidationRef ||
        implementationSet === null ||
        interactionSet === null
      ) {
        throw new ApplicationRefusal(
          "owner_refusal",
          "continued run could not reproduce its admitted Graph and execution sets",
        );
      }
      const leafPort = await hog.bindInstalledLeafInvocationPort({
        store: context.store,
        install: state.install,
        implementationSet,
        publication,
      });
      const childTraversalPreparationPort = bindChildTraversalPreparationPort({
        store: context.store,
        publication,
        program: state.program,
        programValidation,
        rootImplementationSet: implementationSet,
        rootInteractionSet: interactionSet,
      });
      completion = await hog.executeGraphTraversal({
        store: context.store,
        executionBasis: rehydrated.executionBasis,
        openedTraversalScope: rehydrated.openedTraversalScope,
        program: state.program,
        graphFunction,
        graph: state.graph,
        graphValidation,
        implementationSet,
        interactionSet,
        continuationProductBasis: {
          install: state.install,
          workspaceBinding: state.workspaceBinding,
          catalogView: state.catalogView,
          programValidation,
          graphValidation,
        },
        leafPort,
        childTraversalPreparationPort,
        closureContract: state.closureContract,
        actorRuntimeBinding: {
          workspaceBinding: state.workspaceBinding,
        },
        input: state.invocationInput,
        inputDigest: state.graph.admittedInputDigest,
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/hog/resumed`,
        resume: {
          cursor: completion.nextCursor,
          input: completion.resultValue as Readonly<
            Record<string, product.JsonValue>
          >,
          inputDigest: resume.successorInputDigest,
        },
      });
    }
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
    const updatedAuthority = closeContinuationContext(context, state);
    durableAuthorityClosed = true;
    return attachContinuationAuthority(
      outcome,
      updatedAuthority as unknown as product.JsonValue,
    );
  } catch (error) {
    if (resumedFailureBasis !== null) {
      const replayAfterFailure = abg.replay(context.store, {
        runId: state.runId,
      });
      if (replayAfterFailure.runtimeStatus === "active") {
        abg.admitRuntimeFailure(
          context.store,
          resumedFailureBasis.executionBasis,
          resumedFailureBasis.scope,
          "operation_application",
          {
            continuationRef,
            error: String(error),
          },
          "diagnostic://abiogenesis/continuation/post-resume-failure@5",
          {
            eventTime: invocation.eventTime,
            correlationId: `${invocation.correlationId}/post-resume-failure`,
            causationEventRefs: [resumedFailureBasis.resumeEventRef],
          },
        );
      }
    }
    const replayAfterFailure = abg.replay(context.store, {
      runId: state.runId,
    });
    const continuationAfterFailure = replayAfterFailure.continuations.find(
      (row) => row.continuationRef === continuationRef,
    );
    const eventLog = await abg.persistEventLog(
      context.store,
      state.reopenAuthority.eventLogPath,
      { runId: state.runId },
    );
    const updatedAuthority = closeContinuationContext(context, state);
    durableAuthorityClosed = true;
    const code =
      error instanceof ApplicationRefusal ? error.code : "owner_refusal";
    const message =
      error instanceof Error ? error.message : String(error);
    const outcome = refusalOutcome(
      invocation,
      code,
      message,
      continuationMetadata(
        updatedAuthority,
        replayAfterFailure,
        eventLog,
        continuationAfterFailure?.status ?? "responded",
      ),
    );
    return attachContinuationAuthority(
      outcome,
      updatedAuthority as unknown as product.JsonValue,
    );
  } finally {
    if (!durableAuthorityClosed) {
      closeContinuationContext(context, state);
    }
  }
}

export async function applyRootPublicInvocation(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (
    !usesDurableContinuationAuthority(invocation.operationId) &&
    !context.productState.claimInvocation(invocation.invocationRef)
  ) {
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
      case "abg.operation.catalog.apply":
        return await applyCatalogApplication(context, invocation);
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
