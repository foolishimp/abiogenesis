import { pathToFileURL } from "node:url";
import { isAbsolute, relative, resolve } from "node:path";

import * as abg from "../abg/index.js";
import * as gtl from "../gtl/index.js";
import * as hog from "../hog/index.js";
import * as product from "../product/index.js";
import * as validator from "../validator/index.js";
import type {
  CatalogContribution,
  HelloWorldInput,
  HelloWorldOutput,
  ModulePublication,
} from "../gtl/contracts.js";
import { deepFreeze } from "../product/immutable.js";
import type {
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";
import { projectOutcome } from "./outcome.js";

interface VerifiedState {
  readonly verified: product.VerifiedProductArtifact;
}

interface InstallState {
  readonly candidate: product.ProductInstallCandidate;
  readonly install: product.ProductInstall;
}

interface WorkspaceState {
  readonly lock: product.ResolvedProductLock;
  readonly productSet: product.ProductSet;
  readonly binding: product.WorkspaceBinding;
}

interface CatalogState {
  readonly publication: Readonly<ModulePublication>;
  readonly publicationValidation: validator.PublicationValidation;
  readonly programValidation: validator.ProgramValidation;
  readonly catalog: product.AdmittedCatalog;
}

interface CatalogViewState {
  readonly catalogState: CatalogState;
  readonly view: product.CatalogView;
}

export interface RootOperationContext {
  readonly store: abg.AbgEventStore;
  readonly seenInvocations: Set<string>;
  readonly verified: Map<string, VerifiedState>;
  readonly installs: Map<string, InstallState>;
  readonly workspaces: Map<string, WorkspaceState>;
  readonly catalogs: Map<string, CatalogState>;
  readonly catalogViews: Map<string, CatalogViewState>;
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
    seenInvocations: new Set<string>(),
    verified: new Map<string, VerifiedState>(),
    installs: new Map<string, InstallState>(),
    workspaces: new Map<string, WorkspaceState>(),
    catalogs: new Map<string, CatalogState>(),
    catalogViews: new Map<string, CatalogViewState>(),
  };
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

function required<T>(map: Map<string, T>, ref: string, kind: string): T {
  const value = map.get(ref);
  if (value === undefined) {
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
    invocationDigest: product.sha256Canonical({
      invocationRef: invocation.invocationRef,
      operationId: invocation.operationId,
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
): validator.ProgramValidationInput {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: rawAdmission(
      publication.programs[0],
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions.map((value) => rawAdmission(
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
): PublicOutcome {
  const body = {
    operationId: invocation.operationId,
    variant: invocation.variant,
    invocationRef: invocation.invocationRef,
    runtimeInvocationRef: null,
    disposition: "succeeded" as const,
    result,
    diagnosticRef: null,
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
  context.verified.set(invocation.invocationRef, { verified });
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
  const verifiedState = required(
    context.verified,
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
  context.installs.set(invocation.invocationRef, { candidate, install });
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
  const installState = required(
    context.installs,
    stringField(invocation.payload, "installInvocationRef"),
    "ProductInstall",
  );
  const lock = product.constructResolvedProductLock([installState.install]);
  if (lock.kind !== "resolved_product_lock") {
    throw new ApplicationRefusal("owner_refusal", `Product lock construction refused: ${lock.message}`);
  }
  const productSet = product.constructProductSet([installState.install], lock);
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
      [installState.install.admissionEventRef],
    ),
  );
  if (binding.kind !== "workspace_binding") {
    throw new ApplicationRefusal("owner_refusal", `Workspace binding admission refused: ${binding.message}`);
  }
  context.workspaces.set(invocation.invocationRef, { lock, productSet, binding });
  return successOutcome(invocation, {
    kind: binding.kind,
    bindingId: binding.bindingId,
    bindingDigest: binding.bindingDigest,
    productSetId: binding.productSetId,
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
  const verifiedState = required(
    context.verified,
    stringField(invocation.payload, "verifiedInvocationRef"),
    "verified Product",
  );
  const workspaceState = required(
    context.workspaces,
    stringField(invocation.payload, "workspaceBindingInvocationRef"),
    "WorkspaceBinding",
  );
  const publication = gtl.constructHelloWorldModulePublication({
    productId: verifiedState.verified.productId,
    artifactDigest: verifiedState.verified.artifactDigest,
    productContentDigest: verifiedState.verified.productContentDigest,
    productManifestDigest: verifiedState.verified.manifestDigest,
    packageName: verifiedState.verified.packageName,
    packageVersion: verifiedState.verified.packageVersion,
  });
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
  const programValidation = validator.validateProgram(rawProgramInput(publicationAdmission));
  if (programValidation.kind !== "program_validation") {
    throw new ApplicationRefusal("owner_refusal", `Program validation refused: ${JSON.stringify(programValidation)}`);
  }
  const candidate = product.constructCatalogAdmissionCandidate(
    workspaceState.binding,
    workspaceState.lock,
    publication,
    publicationValidation,
    [programValidation],
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
  context.catalogs.set(invocation.invocationRef, {
    publication,
    publicationValidation,
    programValidation,
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
  const catalogState = required(
    context.catalogs,
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
  context.catalogViews.set(invocation.invocationRef, { catalogState, view });
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
    context.installs,
    stringField(invocation.payload, "installInvocationRef"),
    "ProductInstall",
  );
  const workspaceState = required(
    context.workspaces,
    stringField(invocation.payload, "workspaceBindingInvocationRef"),
    "WorkspaceBinding",
  );
  const viewState = required(
    context.catalogViews,
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
  if (
    programRef !== gtl.HELLO_WORLD_IDS.programRef ||
    graphFunctionRef !== gtl.HELLO_WORLD_IDS.graphFunctionRef
  ) {
    throw new ApplicationRefusal("target_mismatch", "run.invoke target must be the explicit admitted root Program and GraphFunction");
  }
  const programValue = viewState.catalogState.publication.programs.find(
    (value) => value.programRef === programRef,
  );
  const graphFunction = viewState.catalogState.publication.graphFunctions.find(
    (value) => value.name === graphFunctionRef,
  );
  if (programValue === undefined || graphFunction === undefined) {
    throw new ApplicationRefusal("target_mismatch", "run.invoke target is absent from the admitted publication");
  }
  const inputValue = recordField(invocation.payload, "input");
  if (
    inputValue.kind !== "hello_world_input" ||
    inputValue.schemaVersion !== "5.0.0"
  ) {
    throw new ApplicationRefusal("target_mismatch", "run.invoke input must carry the exact declared Hello World input kind and schema");
  }
  const subject = stringField(inputValue, "subject");
  const helloInput = gtl.constructHelloWorldInput(subject);
  const rawInput = rawAdmission<HelloWorldInput>(
    helloInput,
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const policy = product.constructRootInvocationPolicy();
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
      rawInput,
      modulePublication: viewState.catalogState.publication,
      program: programValue,
      graphFunction,
      programValidation: viewState.catalogState.programValidation,
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
  const resolutionCandidate = product.resolveImplementation(
    viewState.view,
    viewState.catalogState.publication,
    viewState.catalogState.programValidation,
    graphFunction.name,
    node.nodeRef,
  );
  if (resolutionCandidate.kind !== "implementation_resolution_candidate") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      product.sha256Canonical(resolutionCandidate as unknown as product.JsonValue),
      [`diagnostic://abiogenesis/implementation-resolution/${resolutionCandidate.code}@5`],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const descriptor = product.rootPackagedImplementationDescriptor();
  const resolutionValidation = validator.validateImplementationResolution(
    resolutionCandidate,
    viewState.catalogState.publication,
    viewState.catalogState.programValidation,
    graphFunction,
    descriptor,
  );
  if (resolutionValidation.kind !== "implementation_resolution_validation") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      resolutionValidation.subjectDigest,
      resolutionValidation.diagnostics.map((row) => `diagnostic://abiogenesis/validator/${row.code}@5`),
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/resolution-validation`, causationEventRefs: [] },
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
  });
  const graphValidation = validator.validateGraph(
    graph,
    viewState.catalogState.programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
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
  const executionAdmission = abg.admitExecutionBasis(
    context.store,
    {
      invocationAdmission,
      program: programValue,
      graph,
      graphValidation,
      resolutionCandidate,
      resolutionValidation,
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
  let stop: ReturnType<typeof hog.traverse>;
  try {
    stop = hog.traverse({
      program: programValue,
      graph,
      graphValidation,
      executionBasis: executionAdmission.executionBasis,
      openedTraversalScope: opened.scope,
    });
  } catch (error) {
    abg.admitRuntimeFailure(
      context.store,
      executionAdmission.executionBasis,
      opened.scope,
      "hog_traversal",
      { errorClass: "traversal_exception" },
      "diagnostic://abiogenesis/hog/traversal-exception@5",
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/traversal-failure`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      opened.scope.runId,
    );
  }
  if (stop.kind !== "traversal_stop_ref") {
    abg.admitRuntimeFailure(
      context.store,
      executionAdmission.executionBasis,
      opened.scope,
      "hog_traversal",
      stop as unknown as product.JsonValue,
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/traversal-refusal`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      opened.scope.runId,
    );
  }
  const moduleUrl = pathToFileURL(resolve(
    installState.candidate.installedRoot,
    executionAdmission.implementationResolution.modulePath,
  )).href;
  let implementationModule: Record<string, unknown>;
  try {
    implementationModule = await import(moduleUrl) as Record<string, unknown>;
  } catch {
    abg.admitRuntimeFailure(
      context.store,
      executionAdmission.executionBasis,
      opened.scope,
      "implementation_load",
      { modulePath: executionAdmission.implementationResolution.modulePath },
      "diagnostic://abiogenesis/implementation/module-load-failed@5",
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/implementation-load`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      opened.scope.runId,
    );
  }
  const leaf = implementationModule[executionAdmission.implementationResolution.namedSymbol] as unknown;
  if (typeof leaf !== "function") {
    abg.admitRuntimeFailure(
      context.store,
      executionAdmission.executionBasis,
      opened.scope,
      "implementation_load",
      { namedSymbol: executionAdmission.implementationResolution.namedSymbol },
      "diagnostic://abiogenesis/implementation/symbol-not-callable@5",
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/implementation-symbol`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      opened.scope.runId,
    );
  }
  const outputDeclaration = viewState.catalogState.publication.contracts.find(
    (value) => value.contractRef === graphFunction.outputs[0] && value.contractKind === "output",
  );
  const failureDeclaration = viewState.catalogState.publication.contracts.find(
    (value) =>
      value.contractRef === executionAdmission.implementationResolution.failureContractRef &&
      value.contractKind === "failure",
  );
  if (outputDeclaration === undefined || failureDeclaration === undefined) {
    abg.admitRuntimeFailure(
      context.store,
      executionAdmission.executionBasis,
      opened.scope,
      "output_contract",
      {
        failureContractRef: executionAdmission.implementationResolution.failureContractRef,
        outputContractRef: graphFunction.outputs[0] ?? null,
      },
      "diagnostic://abiogenesis/implementation/result-contract-absent@5",
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/output-contract`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
      opened.scope.runId,
    );
  }
  const traversalCompletion = hog.completeDeterministicTraversal<HelloWorldInput, HelloWorldOutput>(
    {
      store: context.store,
      executionBasis: executionAdmission.executionBasis,
      openedTraversalScope: opened.scope,
      program: programValue,
      graph,
      traversalStop: stop,
      implementationResolution: executionAdmission.implementationResolution,
      input: helloInput,
      inputDigest: rawInput.subjectDigest,
      failureValueKind: failureDeclaration.valueKind,
      resultValueKind: outputDeclaration.valueKind,
      closureContract,
      judgmentRelation: {
        predicateRef: gtl.HELLO_WORLD_IDS.judgmentPredicateRef,
        advanceReasonRef: "reason://abiogenesis/conformance/hello-world-satisfied@5",
        rejectionReasonRef: "reason://abiogenesis/conformance/hello-world-rejected@5",
        evaluate: gtl.evaluateHelloWorldResult,
      },
      realize: leaf as (value: Readonly<HelloWorldInput>) => unknown,
      clock: {
        eventTime: invocation.eventTime,
        correlationId: `${invocation.correlationId}/hog`,
      },
    },
  );
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
  return projectOutcome(
    invocation,
    firstReplay,
    secondReplay,
    outputDeclaration.contractRef,
    candidate.invocationRef,
    persisted,
  );
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

export async function applyRootPublicInvocation(
  context: RootOperationContext,
  invocation: RootPublicInvocation,
): Promise<PublicOutcome> {
  if (context.seenInvocations.has(invocation.invocationRef)) {
    return refusalOutcome(invocation, "duplicate_invocation", "invocationRef already appeared in this transcript");
  }
  context.seenInvocations.add(invocation.invocationRef);
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
      case "abg.operation.run.invoke":
        return await applyRunInvoke(context, invocation);
    }
  } catch (error) {
    if (error instanceof ApplicationRefusal) {
      return refusalOutcome(invocation, error.code, error.message);
    }
    return refusalOutcome(invocation, "owner_refusal", String(error));
  }
}
