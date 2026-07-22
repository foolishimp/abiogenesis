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
import { deepFreeze } from "../shared/immutable.js";
import type {
  PublicOutcome,
  RootPublicInvocation,
} from "./contracts.js";
import { projectOutcome } from "./outcome.js";

export interface RootOperationContext {
  readonly store: abg.AbgEventStore;
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
    eventLogByteLength: null,
    durableEventCount: null,
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
    "installInvocationRef",
    "roots",
    "workspaceId",
  ], "workspace.bind");
  const installState = required(
    context.productState.install(stringField(invocation.payload, "installInvocationRef")),
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
      [installState.install.admissionEventRef],
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
  context.productState.rememberCatalog(invocation.invocationRef, {
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
  activeRefusalStage = "implementation_resolution";
  const matchingBindings = viewState.catalogState.publication.implementationBindings.filter(
    (binding) => binding.bindingRef === node.implementationBindingRef,
  );
  const implementationModules = new Map<string, Record<string, unknown>>();
  const packagedImplementations: product.PackagedLeafImplementationDescriptor[] = [];
  for (const binding of matchingBindings) {
    if (implementationModules.has(binding.modulePath)) continue;
    const modulePath = resolve(installState.candidate.installedRoot, binding.modulePath);
    const moduleRelation = relative(installState.candidate.installedRoot, modulePath);
    let implementationModule: Record<string, unknown> | null = null;
    if (!moduleRelation.startsWith("..") && !isAbsolute(moduleRelation) && moduleRelation.length > 0) {
      try {
        implementationModule = await import(pathToFileURL(modulePath).href) as Record<string, unknown>;
      } catch {
        implementationModule = null;
      }
    }
    if (implementationModule === null) {
      abg.admitInvocationRefusal(
        context.store,
        invocationAdmission,
        "implementation_resolution",
        product.sha256Canonical(binding as unknown as product.JsonValue),
        ["diagnostic://abiogenesis/implementation-resolution/module-load-failed@5"],
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
    implementationModules.set(binding.modulePath, implementationModule);
    packagedImplementations.push(
      ...Object.values(implementationModule).filter(product.isPackagedLeafImplementationDescriptor),
    );
  }
  const resolutionCandidate = product.resolveImplementation(
    viewState.view,
    viewState.catalogState.publication,
    viewState.catalogState.programValidation,
    graphValidation,
    graphFunction.name,
    node.nodeRef,
    packagedImplementations,
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
  const selectedDescriptor = packagedImplementations.find(
    (descriptor) => descriptor.descriptorDigest === resolutionCandidate.implementationDescriptorDigest,
  );
  if (selectedDescriptor === undefined) {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      resolutionCandidate.resolutionCandidateDigest,
      ["diagnostic://abiogenesis/implementation-resolution/descriptor-selection-failed@5"],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/descriptor-selection`, causationEventRefs: [] },
    );
    return projectCurrentOutcome(
      context,
      invocation,
      graphFunction.outputs[0] ?? "",
      candidate.invocationRef,
      durableEventLogPath,
    );
  }
  const resolutionValidation = validator.validateImplementationResolution(
    resolutionCandidate,
    viewState.catalogState.publication,
    viewState.catalogState.programValidation,
    graphValidation,
    graphFunction,
    selectedDescriptor,
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
  const implementationModule = implementationModules.get(resolutionCandidate.modulePath);
  const leaf = implementationModule?.[resolutionCandidate.namedSymbol] as unknown;
  if (typeof leaf !== "function") {
    abg.admitInvocationRefusal(
      context.store,
      invocationAdmission,
      "implementation_resolution",
      resolutionCandidate.resolutionCandidateDigest,
      ["diagnostic://abiogenesis/implementation-resolution/symbol-not-callable@5"],
      { eventTime: invocation.eventTime, correlationId: `${invocation.correlationId}/implementation-symbol`, causationEventRefs: [] },
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
  failureExecutionBasis = executionAdmission.executionBasis;
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
      validateSuccessResult: gtl.isHelloWorldOutput,
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
