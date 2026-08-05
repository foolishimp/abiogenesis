import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "./candidate-basis.mjs";

const execFileAsync = promisify(execFile);

export function publicOperationBasis(
  product,
  operationId,
  scopeRef,
  scopeDigest,
  invocationRef,
  causationEventRefs = [],
) {
  const invocationPayloadDigest = product.sha256Canonical({});
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({ operationId, schemaVersion: "5.0.0" }),
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: "correlation://t286/root",
    eventTime: "2026-07-21T00:00:00.000Z",
    causationEventRefs,
  };
}

export function requireRawAdmission(validator, value, subjectKind, contractRef) {
  const admitted = validator.rawAdmitValue(value, subjectKind, contractRef);
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

export function rawProgramInput(validator, publicationAdmission, program = publicationAdmission.value.programs[0]) {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: requireRawAdmission(
      validator,
      program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions
      .filter((value) => program.callableMembership.includes(value.name))
      .map((value) =>
        requireRawAdmission(validator, value, "graph_function", "contract://abiogenesis/gtl/graph-function@5")),
    contracts: publication.contracts.map((value) =>
      requireRawAdmission(validator, value, "contract_declaration", "contract://abiogenesis/gtl/contract-declaration@5")),
    implementationBindings: publication.implementationBindings.map((value) =>
      requireRawAdmission(validator, value, "implementation_binding", "contract://abiogenesis/gtl/implementation-binding@5")),
    closureContracts: publication.closureContracts.map((value) =>
      requireRawAdmission(validator, value, "closure_contract", "contract://abiogenesis/gtl/closure-contract@5")),
  };
}

export async function setupInstalledRootCatalog(context, packageRoot) {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-root-env-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const bootstrapRoot = join(scratch, "bootstrap");
  await mkdir(bootstrapRoot);
  await execFileAsync("tar", ["-xzf", artifactPath, "-C", bootstrapRoot]);
  const bootstrapPackage = join(bootstrapRoot, "package");
  const bootstrapProduct = await import(
    `${pathToFileURL(join(bootstrapPackage, "build/code/src/product/index.js")).href}?artifact=${Date.now()}`
  );
  const packageJson = JSON.parse(await readFile(join(bootstrapPackage, "package.json"), "utf8"));
  const candidateBasis = await readCandidateBasis(packageRoot);
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  });
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const lock = bootstrapProduct.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  const consumerRoot = join(scratch, "consumer");
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
    resolvedLock: lock,
  });
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));
  const installedRoot = installCandidate.installedRoot;
  const nonce = Date.now();
  const product = await import(`${pathToFileURL(join(installedRoot, "build/code/src/product/index.js")).href}?env=${nonce}`);
  const abg = await import(`${pathToFileURL(join(installedRoot, "build/code/src/abg/index.js")).href}?env=${nonce}`);
  const gtl = await import(`${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?env=${nonce}`);
  const hog = await import(`${pathToFileURL(join(installedRoot, "build/code/src/hog/index.js")).href}?env=${nonce}`);
  const hogInstalledProduct = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/hog/installed_product.js")).href}?env=${nonce}`
  );
  const hogExecute = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/hog/execute.js")).href}?env=${nonce}`
  );
  const implementation = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/implementation/index.js")).href}?env=${nonce}`
  );
  const validator = await import(`${pathToFileURL(join(installedRoot, "build/code/src/validator/index.js")).href}?env=${nonce}`);
  const store = new abg.AbgEventStore();
  const admittedInstall = abg.admitProductInstall(
    store,
    installCandidate,
    publicOperationBasis(
      product,
      "abg.operation.product.install",
      installCandidate.installId,
      installCandidate.productContentDigest,
      "invocation://t286/root/product-install",
    ),
  );
  const productSet = product.constructProductSet([admittedInstall], lock);
  const workspaceRoot = join(scratch, "workspace");
  await mkdir(workspaceRoot);
  const authorityManifest = {
    workspaceId: "workspace://t286/abi5-root",
    canonicalRoot: workspaceRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://abiogenesis/t286/trusted-developer",
  };
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://t286/root/workspace-authority",
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  const bindingCandidate = product.constructWorkspaceBinding(
    workspaceAuthority,
    productSet,
    lock,
    {
      toolchainRoot: consumerRoot,
      productRoot: installedRoot,
      eventLogRoot: join(workspaceRoot, ".ai-workspace/events"),
      runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
      projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
      archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
    },
  );
  const workspaceBinding = abg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    publicOperationBasis(
      product,
      "abg.operation.workspace.bind",
      bindingCandidate.bindingId,
      bindingCandidate.bindingDigest,
      "invocation://t286/root/workspace-bind",
      [admittedInstall.admissionEventRef],
    ),
  );
  const publication = gtl.constructHelloWorldModulePublication({
    productId: verified.productId,
    artifactDigest: verified.artifactDigest,
    productContentDigest: verified.productContentDigest,
    productManifestDigest: verified.manifestDigest,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const publicationAdmission = requireRawAdmission(
    validator,
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const contributionAdmissions = publication.contributions.map((value) =>
    requireRawAdmission(validator, value, "catalog_contribution", "contract://abiogenesis/gtl/catalog-contribution@5"));
  const publicationValidation = validator.validatePublication(publicationAdmission, contributionAdmissions);
  const programValidations = publication.programs.map((program) =>
    validator.validateProgram(rawProgramInput(validator, publicationAdmission, program)));
  const programValidation = programValidations.find(
    (value) => value.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.equal(publicationValidation.kind, "publication_validation", JSON.stringify(publicationValidation));
  assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
  assert.equal(programValidations.every((value) => value.kind === "program_validation"), true);
  const catalog = product.buildGraphFunctionCatalog([publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [gtl.HELLO_WORLD_IDS.graphFunctionRef],
  );
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));

  return {
    scratch,
    artifactPath,
    consumerRoot,
    installedRoot,
    product,
    abg,
    gtl,
    hog,
    hogInstalledProduct,
    hogExecute,
    implementation,
    validator,
    store,
    verified,
    installCandidate,
    admittedInstall,
    lock,
    productSet,
    workspaceAuthority,
    bindingCandidate,
    workspaceBinding,
    publication,
    publicationAdmission,
    publicationValidation,
    programValidation,
    programValidations,
    catalog,
    catalogView,
  };
}

export async function setupInstalledRootInvocation(context, packageRoot) {
  const environment = await setupInstalledRootCatalog(context, packageRoot);
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    workspaceBinding,
    publication,
    programValidation,
    catalogView,
  } = environment;
  const program = publication.programs[0];
  const graphFunction = publication.graphFunctions[0];
  const input = gtl.constructHelloWorldInput("World");
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const rawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t286/support/run-invoke",
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/support/run-invoke",
      payload: {
        programRef: program.programRef,
        graphFunctionRef: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
  );
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(policy, actorRef);
  const invocationAuthority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.name,
    policy,
    [capabilityGrant],
  );
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    [capabilityGrant],
    invocationAuthority,
  );
  const invocationAdmission = abg.admitInvocation(
    store,
    {
      invocation,
      rawRequest,
      rawInput,
      modulePublication: publication,
      program,
      graphFunction,
      programValidation,
      workspaceBinding,
      catalogView,
      policy,
      capabilityGrants: [capabilityGrant],
      authority: invocationAuthority,
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(invocationAdmission.kind, "invocation_admission", JSON.stringify(invocationAdmission));
  return {
    ...environment,
    program,
    graphFunction,
    input,
    rawInput,
    rawRequest,
    policy,
    actorRef,
    capabilityGrant,
    invocationAuthority,
    invocation,
    invocationAdmission,
  };
}

export async function setupInstalledRootResolution(context, packageRoot) {
  const environment = await setupInstalledRootInvocation(context, packageRoot);
  const {
    product,
    gtl,
    validator,
    installedRoot,
    publication,
    programValidation,
    graphFunction,
    catalogView,
    rawInput,
    invocationAdmission,
  } = environment;
  const node = graphFunction.template.nodes[0];
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation", JSON.stringify(graphValidation));
  const implementationModule = await import(
    `${pathToFileURL(join(installedRoot, publication.implementationBindings[0].modulePath)).href}?resolution=${Date.now()}`
  );
  const packagedImplementations = Object.values(implementationModule).filter(
    product.isPackagedLeafImplementationDescriptor,
  );
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetCandidate.kind,
    "implementation_resolution_set_candidate",
    JSON.stringify(resolutionSetCandidate),
  );
  const resolutionSetValidation = validator.validateImplementationResolutionSet(
    resolutionSetCandidate,
    catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
    JSON.stringify(resolutionSetValidation),
  );
  const resolutionCandidate = product.resolveImplementation(
    catalogView,
    publication,
    programValidation,
    graphValidation,
    graphFunction.name,
    node.nodeRef,
    packagedImplementations,
  );
  assert.equal(resolutionCandidate.kind, "implementation_resolution_candidate", JSON.stringify(resolutionCandidate));
  const implementationDescriptor = packagedImplementations.find(
    (descriptor) => descriptor.descriptorDigest === resolutionCandidate.implementationDescriptorDigest,
  );
  assert.notEqual(implementationDescriptor, undefined);
  const resolutionValidation = validator.validateImplementationResolution(
    resolutionCandidate,
    publication,
    programValidation,
    graphValidation,
    graphFunction,
    implementationDescriptor,
  );
  assert.equal(resolutionValidation.kind, "implementation_resolution_validation", JSON.stringify(resolutionValidation));
  return {
    ...environment,
    node,
    graph,
    graphValidation,
    implementationDescriptor,
    packagedImplementations,
    resolutionSetCandidate,
    resolutionSetValidation,
    resolutionCandidate,
    resolutionValidation,
  };
}

export async function setupInstalledRootExecutionBasis(context, packageRoot) {
  const environment = await setupInstalledRootResolution(context, packageRoot);
  const {
    abg,
    store,
    program,
    programValidation,
    invocationAdmission,
    publication,
    graph,
    graphValidation,
    resolutionSetCandidate,
    resolutionSetValidation,
    resolutionCandidate,
    resolutionValidation,
  } = environment;
  const closureContract = publication.closureContracts.find(
    (value) => value.closureContractRef === program.closureContractRef,
  );
  const executionBasisAdmission = abg.admitExecutionBasis(
    store,
    {
      invocationAdmission,
      program,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      resolutionCandidate,
      resolutionValidation,
      closureContract,
    },
    {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/root/execution-basis",
      causationEventRefs: [],
    },
  );
  assert.equal(executionBasisAdmission.kind, "execution_basis_admission", JSON.stringify(executionBasisAdmission));
  assert.notEqual(executionBasisAdmission.implementationResolution, null);
  const implementationRow = abg.selectAdmittedImplementationResolution(
    executionBasisAdmission.implementationSet,
    {
      graphFunctionRef: graph.graphFunctionRef,
      nodeRef: graph.template.startNodeRef,
      programLocusRef: graph.template.nodes[0].term.programLocusRef,
      implementationBindingRef: graph.template.nodes[0].term.requirement.implementationBindingRef,
    },
  );
  assert.notEqual(implementationRow, null);
  const semantics = await environment.product.loadInstalledProductSemantics({
    install: environment.admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(store, install),
  });
  const semanticsProjection =
    environment.product.projectInstalledLeafSemantics(semantics);
  const leafPort = await environment.hogInstalledProduct.bindInstalledLeafInvocationPort({
    store,
    install: environment.admittedInstall,
    implementationSet: executionBasisAdmission.implementationSet,
    publication,
    semanticsProjection,
  });
  return {
    ...environment,
    graph,
    graphValidation,
    closureContract,
    executionBasisAdmission,
    implementationSet: executionBasisAdmission.implementationSet,
    implementationRow,
    semantics,
    semanticsProjection,
    leafPort,
    implementationResolution: executionBasisAdmission.implementationResolution,
    executionBasis: executionBasisAdmission.executionBasis,
  };
}
