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

function selectedFrozenArtifact(options) {
  const explicit = options.frozenArtifact ?? null;
  const environment = process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH === undefined &&
      process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST === undefined &&
      process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256 === undefined
    ? null
    : {
      artifactPath: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH,
      installHost: process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST,
      artifactSha256: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256,
    };
  const selected = explicit ?? environment;
  if (selected === null) return null;
  for (const field of ["artifactPath", "installHost", "artifactSha256"]) {
    if (typeof selected[field] !== "string" || selected[field].length === 0) {
      throw new TypeError(`frozen artifact mode requires ${field}`);
    }
  }
  return {
    artifactPath: selected.artifactPath,
    installHost: selected.installHost,
    artifactSha256: selected.artifactSha256.startsWith("sha256:")
      ? selected.artifactSha256
      : `sha256:${selected.artifactSha256}`,
  };
}

export function publicOperationBasis(
  product,
  operationId,
  scopeRef,
  scopeDigest,
  invocationRef,
  causationEventRefs = [],
  selectedMemberKey = null,
) {
  const invocationPayloadDigest = product.sha256Canonical({});
  const memberKey = selectedMemberKey ??
    (operationId === "abg.operation.product.install"
      ? "install"
      : operationId === "abg.operation.workspace.bind"
        ? "bind"
        : operationId === "abg.operation.run.invoke"
          ? "invoke"
        : operationId);
  const definitionDigest = product.sha256Canonical({
    operationId,
    memberKey,
    schemaVersion: "5.0.0",
  });
  return {
    operationId,
    memberKey,
    definitionDigest,
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      definitionDigest,
      invocationRef,
      invocationPayloadDigest,
      memberKey,
      operationId,
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

export function rawProgramInput(validator, publicationAdmission, program) {
  assert.ok(program, "raw Program input requires one exact selected Program");
  const publication = publicationAdmission.value;
  return {
    declarationBasisDigest: publicationAdmission.subjectDigest,
    programPublication: publicationAdmission,
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
    evaluators: publication.evaluators,
    rules: publication.rules,
    implementationBindings: publication.implementationBindings.map((value) =>
      requireRawAdmission(validator, value, "implementation_binding", "contract://abiogenesis/gtl/implementation-binding@5")),
    closureContracts: publication.closureContracts.map((value) =>
      requireRawAdmission(validator, value, "closure_contract", "contract://abiogenesis/gtl/closure-contract@5")),
  };
}

export async function setupInstalledRootCatalog(
  context,
  packageRoot,
  options = {},
) {
  const frozenArtifact = selectedFrozenArtifact(options);
  const scratch = await mkdtemp(join(tmpdir(), "abi5-root-env-"));
  let durableStore = null;
  context.after(async () => {
    durableStore?.closeDurableLog();
    await rm(scratch, { force: true, recursive: true });
  });
  let artifactPath;
  let bootstrapPackage;
  let consumerRoot;
  let installedRoot;
  if (frozenArtifact === null) {
    const artifacts = join(scratch, "artifacts");
    await mkdir(artifacts);
    const { stdout } = await execFileAsync(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
      { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
    );
    const [packResult] = JSON.parse(stdout);
    artifactPath = join(artifacts, packResult.filename);
    const bootstrapRoot = join(scratch, "bootstrap");
    await mkdir(bootstrapRoot);
    await execFileAsync("tar", ["-xzf", artifactPath, "-C", bootstrapRoot]);
    bootstrapPackage = join(bootstrapRoot, "package");
    consumerRoot = join(scratch, "consumer");
  } else {
    artifactPath = frozenArtifact.artifactPath;
    bootstrapPackage = join(
      frozenArtifact.installHost,
      "node_modules",
      "@abiogenesis",
      "typescript-tenant",
    );
    consumerRoot = join(scratch, "consumer");
  }
  const bootstrapProduct = await import(
    `${pathToFileURL(join(bootstrapPackage, "build/code/src/product/index.js")).href}?artifact=${Date.now()}`
  );
  if (frozenArtifact !== null) {
    assert.equal(
      await bootstrapProduct.sha256File(artifactPath),
      frozenArtifact.artifactSha256,
      "frozen artifact digest differs from the authorized subject",
    );
  }
  const packageJson = JSON.parse(await readFile(join(bootstrapPackage, "package.json"), "utf8"));
  const persistedCandidateBasis = await readCandidateBasis(packageRoot);
  const candidateManifest = JSON.parse(
    await readFile(
      join(bootstrapPackage, "product-toolchain-manifest.json"),
      "utf8",
    ),
  );
  const candidateBasis = options.candidateBasisSource === "packed_artifact"
    ? {
        ...persistedCandidateBasis,
        artifactDigest: await bootstrapProduct.sha256File(artifactPath),
        productContentDigest: candidateManifest.productContentDigest,
        manifestDigest: bootstrapProduct.sha256Canonical(candidateManifest),
        productId: candidateManifest.productId,
        packageName: candidateManifest.packageName,
        packageVersion: candidateManifest.packageVersion,
      }
    : persistedCandidateBasis;
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  });
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const lock = bootstrapProduct.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
    resolvedLock: lock,
  });
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));
  assert.equal(
    bootstrapProduct.isProductInstallCandidate(installCandidate, lock),
    true,
    "frozen installed root does not satisfy the Product install carrier",
  );
  assert.equal(
    await bootstrapProduct.installedProductContentMatches(installCandidate),
    true,
    "frozen installed root bytes differ from the verified Product",
  );
  installedRoot = installCandidate.installedRoot;
  const nonce = Date.now();
  const product = await import(`${pathToFileURL(join(installedRoot, "build/code/src/product/index.js")).href}?env=${nonce}`);
  const abg = await import(`${pathToFileURL(join(installedRoot, "build/code/src/abg/index.js")).href}?env=${nonce}`);
  const gtl = await import(`${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?env=${nonce}`);
  const hog = await import(`${pathToFileURL(join(installedRoot, "build/code/src/hog/index.js")).href}?env=${nonce}`);
  const implementationLeafPort = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/implementation/leaf_invocation_port.js")).href}?env=${nonce}`
  );
  const interactionOwner = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/hog/interaction_resume.js")).href}?env=${nonce}`
  );
  const implementation = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/implementation/index.js")).href}?env=${nonce}`
  );
  const validator = await import(`${pathToFileURL(join(installedRoot, "build/code/src/validator/index.js")).href}?env=${nonce}`);
  const acquired = abg.createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath: join(scratch, "runtime", "events.jsonl"),
  });
  assert.equal(acquired.disposition, undefined, JSON.stringify(acquired));
  const store = acquired.store;
  durableStore = store;
  const admittedInstallResult = abg.admitProductInstall(
    store,
    installCandidate,
    {
      ...publicOperationBasis(
        product,
        "abg.operation.product.install",
        installCandidate.installId,
        installCandidate.productContentDigest,
        "invocation://t286/root/product-install",
      ),
      predecessorPrefix: acquired.prefix,
    },
    lock,
  );
  assert.equal(
    admittedInstallResult.kind,
    "artifact_owner_result",
    JSON.stringify(admittedInstallResult),
  );
  const admittedInstall = admittedInstallResult.value;
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
  const workspaceBindingResult = abg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    {
      ...publicOperationBasis(
        product,
        "abg.operation.workspace.bind",
        bindingCandidate.bindingId,
        bindingCandidate.bindingDigest,
        "invocation://t286/root/workspace-bind",
        [admittedInstall.admissionEventRef],
      ),
      predecessorPrefix: admittedInstallResult.successorPrefix,
    },
    workspaceAuthority,
  );
  assert.equal(
    workspaceBindingResult.kind,
    "artifact_owner_result",
    JSON.stringify(workspaceBindingResult),
  );
  const workspaceBinding = workspaceBindingResult.value;
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
  const selectedProgramRefs = new Set([
    options.programRef ?? gtl.HELLO_WORLD_IDS.programRef,
    gtl.HELLO_WORLD_DIRECT_IDS.programRef,
  ]);
  const programValidations = publication.programs
    .filter((program) => selectedProgramRefs.has(program.programRef))
    .map((program) =>
      validator.validateProgram(
        rawProgramInput(validator, publicationAdmission, program),
      ));
  const programValidation = programValidations.find(
    (value) => value.programRef ===
      (options.programRef ?? gtl.HELLO_WORLD_IDS.programRef),
  );
  assert.equal(publicationValidation.kind, "publication_validation", JSON.stringify(publicationValidation));
  assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
  assert.equal(programValidations.every((value) => value.kind === "program_validation"), true);
  const catalog = product.buildGraphFunctionCatalog([publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [options.graphFunctionRef ?? gtl.HELLO_WORLD_IDS.graphFunctionRef],
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
    implementationLeafPort,
    interactionOwner,
    implementation,
    validator,
    store,
    artifactTruth: workspaceBindingResult.artifactTruth,
    durablePrefix: workspaceBindingResult.successorPrefix,
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

export async function setupInstalledRootInvocation(
  context,
  packageRoot,
  options = {},
) {
  const environment = await setupInstalledRootCatalog(
    context,
    packageRoot,
    options,
  );
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    workspaceBinding,
    artifactTruth,
    publication,
    programValidation,
    catalogView,
  } = environment;
  const programRef = options.programRef ?? gtl.HELLO_WORLD_IDS.programRef;
  const graphFunctionRef = options.graphFunctionRef ??
    gtl.HELLO_WORLD_IDS.graphFunctionRef;
  const program = publication.programs.find(
    (candidate) => candidate.programRef === programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === graphFunctionRef,
  );
  assert.ok(program, "installed root requires one exact selected Program");
  assert.ok(
    graphFunction,
    "installed root requires one exact selected GraphFunction",
  );
  const input = options.input ?? gtl.constructHelloWorldInput("World");
  const inputContractRef = options.inputContractRef ??
    gtl.HELLO_WORLD_IDS.inputContractRef;
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    inputContractRef,
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
        catalogHandle: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const interactionCapabilities = programValidation.interactionLeafRows.map(
    (row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    }),
  );
  const allowedComputeRegimes = ["F_D", "F_P", "F_H"].filter((regime) =>
    [
      ...programValidation.executableLeafRows,
      ...programValidation.interactionLeafRows,
    ].some((row) => row.fibre === regime));
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    interactionCapabilities,
    allowedComputeRegimes,
  );
  const actorRef = options.actorRef ??
    "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(policy, actorRef);
  const capabilityGrants = [
    capabilityGrant,
    ...[...new Set(
      interactionCapabilities.map((row) => row.actorCapabilityRef),
    )].sort().flatMap((capabilityRef) => [
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.interaction.respond",
        capabilityRef,
      ),
      product.constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.run.continue",
        capabilityRef,
      ),
    ]),
  ];
  const selectedRow = product.lookupGraphFunction(
    catalogView,
    graphFunction.name,
  );
  assert.ok(selectedRow);
  const invocationAuthority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    selectedRow,
    policy,
    capabilityGrants,
  );
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    rawRequest,
    rawInput,
    policy,
    capabilityGrants,
    invocationAuthority,
  );
  const invocationAdmissionReceipt = abg.admitInvocation(
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
      artifactTruth,
      catalogView,
      policy,
      capabilityGrants,
      authority: invocationAuthority,
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(
    invocationAdmissionReceipt.kind,
    "invocation_admission_receipt",
    JSON.stringify(invocationAdmissionReceipt),
  );
  const invocationAdmission = invocationAdmissionReceipt.admission;
  return {
    ...environment,
    durablePrefix: invocationAdmissionReceipt.successorPrefix,
    program,
    graphFunction,
    input,
    rawInput,
    rawRequest,
    policy,
    actorRef,
    capabilityGrant,
    capabilityGrants,
    invocationAuthority,
    invocation,
    invocationAdmission,
  };
}

export async function setupInstalledRootResolution(
  context,
  packageRoot,
  options = {},
) {
  const environment = await setupInstalledRootInvocation(
    context,
    packageRoot,
    options,
  );
  const {
    product,
    gtl,
    validator,
    installedRoot,
    publication,
    programValidation,
    graphFunction,
    catalogView,
    input,
    rawInput,
    invocationAdmission,
  } = environment;
  const rootNodes = graphFunction.template.nodes.filter(
    (candidate) => candidate.nodeRef === graphFunction.template.startNodeRef,
  );
  assert.equal(
    rootNodes.length,
    1,
    "installed resolution requires one exact declared graph root",
  );
  const [node] = rootNodes;
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: input,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: input,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation", JSON.stringify(graphValidation));
  const implementationBinding = publication.implementationBindings.find(
    (candidate) =>
      candidate.bindingRef === node.term.requirement.implementationBindingRef,
  );
  assert.ok(
    implementationBinding,
    "installed resolution requires the canonical Hello World binding",
  );
  const implementationModule = await import(
    `${pathToFileURL(join(installedRoot, implementationBinding.modulePath)).href}?resolution=${Date.now()}`
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

export async function setupInstalledRootExecutionBasis(
  context,
  packageRoot,
  options = {},
) {
  const environment = await setupInstalledRootResolution(
    context,
    packageRoot,
    options,
  );
  const {
    abg,
    store,
    program,
    programValidation,
    invocationAdmission,
    durablePrefix,
    input,
    publication,
    node,
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
    durablePrefix,
    {
      invocationAdmission,
      rawInputValue: input,
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
      programLocusRef: node.term.programLocusRef,
      implementationBindingRef: node.term.requirement.implementationBindingRef,
    },
  );
  assert.notEqual(implementationRow, null);
  const semantics = await environment.product.loadInstalledProductSemantics({
    install: environment.admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
  });
  const semanticsProjection =
    environment.product.projectInstalledLeafSemantics(semantics);
  const leafPort = await environment.implementationLeafPort.constructAdmittedLeafInvocationPort({
    prefix: abg.selectValidatedRuntimeEventPrefix(
      abg.readRuntimeEventsAtDurablePrefix(
        executionBasisAdmission.successorPrefix,
      ),
    ),
    artifactTruth: environment.artifactTruth,
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
    durablePrefix: executionBasisAdmission.successorPrefix,
    implementationSet: executionBasisAdmission.implementationSet,
    implementationRow,
    semantics,
    semanticsProjection,
    leafPort,
    implementationResolution: executionBasisAdmission.implementationResolution,
    executionBasis: executionBasisAdmission.executionBasis,
  };
}
