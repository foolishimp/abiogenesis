import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function publicOperationBasis(
  product,
  operationId,
  scopeRef,
  scopeDigest,
  invocationRef,
  causationEventRefs = [],
) {
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({ operationId, schemaVersion: "5.0.0" }),
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef,
    invocationDigest: product.sha256Canonical({ invocationRef, operationId }),
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

export function rawProgramInput(validator, publicationAdmission) {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: requireRawAdmission(
      validator,
      publication.programs[0],
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions.map((value) =>
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
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedProductId: `product://abiogenesis/typescript-tenant@${packageJson.version}`,
    expectedPackageName: packageJson.name,
    expectedPackageVersion: packageJson.version,
  });
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const consumerRoot = join(scratch, "consumer");
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
  });
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));
  const installedRoot = installCandidate.installedRoot;
  const nonce = Date.now();
  const product = await import(`${pathToFileURL(join(installedRoot, "build/code/src/product/index.js")).href}?env=${nonce}`);
  const abg = await import(`${pathToFileURL(join(installedRoot, "build/code/src/abg/index.js")).href}?env=${nonce}`);
  const gtl = await import(`${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?env=${nonce}`);
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
  const lock = product.constructResolvedProductLock([admittedInstall]);
  const productSet = product.constructProductSet([admittedInstall], lock);
  const workspaceRoot = join(scratch, "workspace");
  await mkdir(workspaceRoot);
  const authorityManifest = {
    workspaceId: "workspace://t286/abi5-root",
    canonicalRoot: workspaceRoot,
    authorityMode: "trusted_developer",
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
  const programValidation = validator.validateProgram(rawProgramInput(validator, publicationAdmission));
  assert.equal(publicationValidation.kind, "publication_validation", JSON.stringify(publicationValidation));
  assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
  const catalogCandidate = product.constructCatalogAdmissionCandidate(
    workspaceBinding,
    lock,
    publicationAdmission.value,
    publicationValidation,
    [programValidation],
  );
  const catalog = abg.admitCatalog(
    store,
    catalogCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.admit",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://t286/root/catalog-admit",
      [workspaceBinding.admissionEventRef],
    ),
  );
  const viewCandidate = product.constructCatalogViewCandidate(
    catalog,
    [gtl.HELLO_WORLD_IDS.graphFunctionRef],
  );
  const catalogView = abg.narrowCatalogView(
    store,
    catalog,
    viewCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.view",
      catalog.catalogId,
      catalog.catalogDigest,
      "invocation://t286/root/catalog-view",
      [catalog.admissionEventRef],
    ),
  );
  assert.equal(catalogView.kind, "catalog_view", JSON.stringify(catalogView));

  return {
    scratch,
    artifactPath,
    consumerRoot,
    installedRoot,
    product,
    abg,
    gtl,
    validator,
    store,
    verified,
    admittedInstall,
    lock,
    productSet,
    workspaceAuthority,
    workspaceBinding,
    publication,
    publicationAdmission,
    publicationValidation,
    programValidation,
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
  const policy = product.constructRootInvocationPolicy();
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(actorRef);
  const invocationAuthority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.name,
    [capabilityGrant],
  );
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawInput,
    policy,
    [capabilityGrant],
    invocationAuthority,
  );
  const invocationAdmission = abg.admitInvocation(
    store,
    {
      invocation,
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
      [catalogView.admissionEventRef],
    ),
  );
  assert.equal(invocationAdmission.kind, "invocation_admission", JSON.stringify(invocationAdmission));
  return {
    ...environment,
    program,
    graphFunction,
    input,
    rawInput,
    policy,
    actorRef,
    capabilityGrant,
    invocationAuthority,
    invocation,
    invocationAdmission,
  };
}
