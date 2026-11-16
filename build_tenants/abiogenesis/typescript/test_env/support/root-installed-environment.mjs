import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readdir, readFile, readlink, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { after } from "node:test";
import { promisify } from "node:util";
import { packProduct } from "../../scripts/product-payload.mjs";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "./candidate-basis.mjs";
import {
  LANGUAGE_TEST_IDS,
  LANGUAGE_TEST_DIRECT_IDS,
  constructLanguageTestInput,
  prepareLanguageSmokeFixture,
  languageTestGtlView,
} from "./language-smoke-fixture.mjs";

const execFileAsync = promisify(execFile);

// Optional coarse accounting for an already-required installed composition.
// These wall intervals include I/O and child waits; they are not CPU profiles.
function accountSetupPhase(options, name, started) {
  if (options.setupAccounting !== undefined)
    options.setupAccounting.wallMs[name] = performance.now() - started;
}

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

function constructRootPublication(gtl, basis, kind) {
  const construct = gtl.constructWorksiteConstructionModulePublication;
  assert.equal(
    typeof construct,
    "function",
    `root publication constructor is unavailable for ${kind ?? "worksite_construction"}`,
  );
  return construct({
    productId: basis.productId,
    artifactDigest: basis.artifactDigest,
    productContentDigest: basis.productContentDigest,
    productManifestDigest: basis.manifestDigest,
    packageName: basis.packageName,
    packageVersion: basis.packageVersion,
  });
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

export function requirePublicationValidations(validator, publications) {
  return publications.map((publication) => {
    const publicationAdmission = requireRawAdmission(
      validator, publication, "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const contributions = publication.contributions.map((value) =>
      requireRawAdmission(validator, value, "catalog_contribution",
        "contract://abiogenesis/gtl/catalog-contribution@5"));
    const publicationValidation = validator.validatePublication(publicationAdmission, contributions);
    assert.equal(publicationValidation.kind, "publication_validation",
      `${publication.moduleRef}: ${JSON.stringify(publicationValidation)}`);
    return { publicationAdmission, publicationValidation };
  });
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
      // Static compose/substitute source declarations are required validation
      // input even when the Program does not grant them callable membership.
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

// Installed setup has two phases. The install phase packs the tenant (or
// selects the frozen artifact), prepares the fixture Products, verifies every
// artifact, installs them under one resolved lock and imports the installed
// owners. The case phase opens one event store, workspace, binding, publication
// set and Catalog over an install. `installTenantOnce` and
// `openCaseEnvironment` expose the two phases so that a test file installs once
// and gives every case its own store, workspace and scratch root;
// `setupInstalledRootCatalog` composes them into one scratch root per case.

// Options that select what is installed. They belong to the install phase; a
// case opened on a shared install may repeat them only with the same value.
// `exportedSurfacesOnly` selects the bounded root-witness owner surface: every
// installed owner is loaded through the installed package's own `exports` map
// and no unexported implementation module is imported. Component callers keep
// the default surface, which also loads the implementation leaf-port owners.
const INSTALL_OPTION_KEYS = Object.freeze([
  "frozenArtifact",
  "candidateBasisSource",
  "rootPublicationKind",
  "prepareAdditionalProducts",
  "exportedSurfacesOnly",
]);

// Optional same-episode custody: an `episodeSink` with `record(name, value)`
// receives each actual owner-returned setup candidate before support asserts
// on it, so a failed or later-cleaned case cannot discard it. Absent sink
// records nothing.
function recordSetup(options, name, value) {
  options.episodeSink?.record(name, value);
}

/** The exact `import` target the installed package exports for `subpath`. */
export async function exportedImportHref(packageRootPath, subpath) {
  const packageJson = JSON.parse(await readFile(join(packageRootPath, "package.json"), "utf8"));
  const entry = packageJson.exports?.[subpath];
  const target = typeof entry === "string" ? entry : entry?.import;
  assert.equal(typeof target, "string", `${packageJson.name} exports no import target for ${subpath}`);
  assert.equal(target.startsWith("./"), true, `${packageJson.name} ${subpath} export is not package-relative`);
  return pathToFileURL(join(packageRootPath, target)).href;
}

async function loadInstalledOwners(packageRootPath, subpaths, query, exportedOnly, defaultTargets) {
  const ownerModules = [];
  const owners = {};
  for (const [name, subpath] of Object.entries(subpaths)) {
    const href = exportedOnly
      ? await exportedImportHref(packageRootPath, subpath)
      : pathToFileURL(join(packageRootPath, defaultTargets[name])).href;
    ownerModules.push(Object.freeze({ owner: name, subpath, exported: exportedOnly, href }));
    owners[name] = await import(`${href}?${query}`);
  }
  return { owners, ownerModules };
}

async function provisionInstalledTenant(scratch, packageRoot, options) {
  const frozenArtifact = selectedFrozenArtifact(options);
  let artifactPath;
  let bootstrapPackage;
  let consumerRoot;
  let phaseStarted = performance.now();
  if (frozenArtifact === null) {
    const artifacts = join(scratch, "artifacts");
    await mkdir(artifacts);
    const [packResult] = await packProduct(packageRoot, artifacts);
    accountSetupPhase(options, "provisioning_pack", phaseStarted);
    if (options.setupAccounting !== undefined) options.setupAccounting.volumes = {
      archiveBytes: packResult.size, archiveUnpackedBytes: packResult.unpackedSize,
      archiveMemberCount: packResult.entryCount,
      installedTreeBytes: null,
    };
    artifactPath = join(artifacts, packResult.filename);
    phaseStarted = performance.now();
    const bootstrapRoot = join(scratch, "bootstrap");
    await mkdir(bootstrapRoot);
    await execFileAsync("tar", ["-xzf", artifactPath, "-C", bootstrapRoot]);
    bootstrapPackage = join(bootstrapRoot, "package");
    consumerRoot = join(scratch, "consumer");
    accountSetupPhase(options, "provisioning_extract", phaseStarted);
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
  phaseStarted = performance.now();
  const exportedOnly = options.exportedSurfacesOnly === true;
  const bootstrapOwnerModules = [];
  const bootstrapImport = async (owner, subpath, target) => {
    const href = exportedOnly
      ? await exportedImportHref(bootstrapPackage, subpath)
      : pathToFileURL(join(bootstrapPackage, target)).href;
    bootstrapOwnerModules.push(Object.freeze({ owner, subpath, exported: exportedOnly, href }));
    return import(`${href}?artifact=${Date.now()}`);
  };
  const bootstrapProduct = await bootstrapImport("product", "./product", "build/code/src/product/index.js");
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
  const candidateBasis = options.candidateBasisSource === undefined || options.candidateBasisSource === "packed_artifact"
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
  const bootstrapGtl = await bootstrapImport("gtl", "./gtl", "build/code/src/gtl/index.js");
  const bootstrapRootPublication = constructRootPublication(
    bootstrapGtl,
    candidateBasis,
    options.rootPublicationKind,
  );
  const usesLanguageFixture = options.rootPublicationKind === undefined;
  const additionalProducts = options.prepareAdditionalProducts === undefined
    ? usesLanguageFixture ? [await prepareLanguageSmokeFixture({ scratch, product: bootstrapProduct,
      gtl: bootstrapGtl, abiPublication: bootstrapRootPublication, abiPackageArchivePath: artifactPath })] : []
    : await options.prepareAdditionalProducts({
        scratch,
        bootstrapPackage,
        product: bootstrapProduct,
        gtl: languageTestGtlView(bootstrapGtl),
        abiPublication: bootstrapRootPublication,
        abiPackageArchivePath: artifactPath,
      });
  assert.equal(
    Array.isArray(additionalProducts),
    true,
    "additional installed Products must be one exact prepared array",
  );
  accountSetupPhase(options, "bootstrap_owner_loading_and_candidate_preparation", phaseStarted);
  phaseStarted = performance.now();
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
  });
  recordSetup(options, "setup-candidate-basis", { artifactPath, candidateBasis,
    bootstrapOwnerModules, additionalProducts: additionalProducts.map(({ artifactPath: path, artifactRef, basis, ids }) =>
      ({ artifactPath: path, artifactRef, basis, ids })) });
  recordSetup(options, "setup-verified", verified);
  assert.equal(verified.disposition, "verified", JSON.stringify(verified));
  const additionalVerified = [];
  for (const [index, prepared] of additionalProducts.entries()) {
    const value = await bootstrapProduct.verifyProduct({
      artifactPath: prepared.artifactPath,
      artifactRef: prepared.artifactRef,
      ...expectedVerificationIdentity(prepared.basis),
    });
    recordSetup(options, `setup-additional-verified-${index}`, value);
    assert.equal(value.disposition, "verified", JSON.stringify(value));
    additionalVerified.push(value);
  }
  const verifiedProducts = [verified, ...additionalVerified];
  const lock = bootstrapProduct.constructResolvedProductLock(verifiedProducts);
  recordSetup(options, "setup-lock", lock);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  accountSetupPhase(options, "provisioning_verify_artifact", phaseStarted);
  phaseStarted = performance.now();
  const installCandidate = await bootstrapProduct.installProduct({
    artifactPath,
    targetRoot: consumerRoot,
    verifiedArtifact: verified,
    resolvedLock: lock,
  });
  recordSetup(options, "setup-install-candidate", installCandidate);
  assert.equal(installCandidate.disposition, "materialized", JSON.stringify(installCandidate));
  accountSetupPhase(options, "provisioning_install", phaseStarted);
  phaseStarted = performance.now();
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
  accountSetupPhase(options, "provisioning_installed_content_check", phaseStarted);
  phaseStarted = performance.now();
  const additionalInstallCandidates = [];
  for (const [index, prepared] of additionalProducts.entries()) {
    const candidate = await bootstrapProduct.installProduct({
      artifactPath: prepared.artifactPath,
      targetRoot: join(scratch, `consumer-additional-${index}`),
      verifiedArtifact: additionalVerified[index],
      resolvedLock: lock,
    });
    recordSetup(options, `setup-additional-install-candidate-${index}`, candidate);
    assert.equal(candidate.disposition, "materialized", JSON.stringify(candidate));
    assert.equal(
      bootstrapProduct.isProductInstallCandidate(candidate, lock),
      true,
      "additional installed Product does not satisfy the resolved lock",
    );
    assert.equal(
      await bootstrapProduct.installedProductContentMatches(candidate),
      true,
      "additional installed Product bytes differ from verified truth",
    );
    additionalInstallCandidates.push(candidate);
  }
  accountSetupPhase(options, "provisioning_additional_products", phaseStarted);
  const installCandidates = [installCandidate, ...additionalInstallCandidates];
  const installedRoot = installCandidate.installedRoot;
  const nonce = Date.now();
  phaseStarted = performance.now();
  const { owners: { product, abg, gtl, hog, validator }, ownerModules } = await loadInstalledOwners(
    installedRoot,
    { product: "./product", abg: "./abg", gtl: "./gtl", hog: "./hog", validator: "./validator" },
    `env=${nonce}`,
    exportedOnly,
    {
      product: "build/code/src/product/index.js",
      abg: "build/code/src/abg/index.js",
      gtl: "build/code/src/gtl/index.js",
      hog: "build/code/src/hog/index.js",
      validator: "build/code/src/validator/index.js",
    },
  );
  // The implementation modules are not package exports. Only the default
  // component surface loads them, for callers that construct a leaf port.
  const implementationLeafPort = exportedOnly ? undefined : await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/implementation/leaf_invocation_port.js")).href}?env=${nonce}`
  );
  const implementation = exportedOnly ? undefined : await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/implementation/index.js")).href}?env=${nonce}`
  );
  accountSetupPhase(options, "installed_owner_loading", phaseStarted);
  return {
    kind: "installed_tenant",
    installOptions: Object.freeze(Object.fromEntries(
      INSTALL_OPTION_KEYS.map((key) => [key, options[key]]),
    )),
    ownerSurface: exportedOnly ? "exported" : "component",
    ownerModules: Object.freeze([...bootstrapOwnerModules.map((row) => Object.freeze({ ...row, root: "bootstrap" })),
      ...ownerModules.map((row) => Object.freeze({ ...row, root: "installed" }))]),
    rootPublicationKind: options.rootPublicationKind,
    usesLanguageFixture,
    scratch,
    artifactPath,
    bootstrapPackage,
    consumerRoot,
    installedRoot,
    candidateBasis,
    additionalProducts,
    verified,
    additionalVerified,
    verifiedProducts,
    lock,
    installCandidate,
    installCandidates,
    additionalInstallCandidates,
    product,
    abg,
    gtl,
    hog,
    implementationLeafPort,
    implementation,
    validator,
  };
}

async function openInstalledCaseEnvironment(scratch, install, options, storeHolder) {
  const {
    product,
    abg,
    gtl,
    hog,
    implementationLeafPort,
    implementation,
    validator,
    usesLanguageFixture,
    additionalProducts,
    verified,
    verifiedProducts,
    additionalVerified,
    lock,
    installCandidate,
    installCandidates,
    additionalInstallCandidates,
    candidateBasis,
    artifactPath,
    consumerRoot,
    installedRoot,
  } = install;
  let phaseStarted = performance.now();
  const acquired = abg.createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath: join(scratch, "runtime", "events.jsonl"),
  });
  assert.equal(acquired.disposition, undefined, JSON.stringify(acquired));
  const store = acquired.store;
  storeHolder.store = store;
  const admittedInstallResults = [];
  let installPrefix = acquired.prefix;
  for (const [index, candidate] of installCandidates.entries()) {
    const admitted = abg.admitProductInstall(
      store,
      candidate,
      {
        ...publicOperationBasis(
          product,
          "abg.operation.product.install",
          candidate.installId,
          candidate.productContentDigest,
          `invocation://t286/root/product-install-${index}`,
        ),
        predecessorPrefix: installPrefix,
      },
      lock,
    );
    recordSetup(options, `setup-install-admission-${index}`, admitted);
    assert.equal(admitted.kind, "artifact_owner_result", JSON.stringify(admitted));
    admittedInstallResults.push(admitted);
    installPrefix = admitted.successorPrefix;
  }
  const admittedInstalls = admittedInstallResults.map((result) => result.value);
  const admittedInstallResult = admittedInstallResults[0];
  const admittedInstall = admittedInstalls[0];
  const additionalAdmittedInstalls = admittedInstalls.slice(1);
  const productSet = product.constructProductSet(admittedInstalls, lock);
  const workspaceRoot = join(scratch, "workspace");
  await mkdir(workspaceRoot);
  const authorityManifest = {
    workspaceId: "workspace://t286/abi5-root",
    canonicalRoot: workspaceRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: options.authorizedActorRef ??
      "actor://abiogenesis/t286/trusted-developer",
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
      productRoot: installCandidates[
        options.workspaceProductIndex ?? (usesLanguageFixture ? 1 : 0)
      ].installedRoot,
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
        admittedInstalls.map((install) => install.admissionEventRef),
      ),
      predecessorPrefix: installPrefix,
    },
    workspaceAuthority,
  );
  recordSetup(options, "setup-workspace-binding", { productSet, workspaceAuthority, bindingCandidate, workspaceBindingResult });
  assert.equal(
    workspaceBindingResult.kind,
    "artifact_owner_result",
    JSON.stringify(workspaceBindingResult),
  );
  const workspaceBinding = workspaceBindingResult.value;
  accountSetupPhase(options, "environment_install_and_workspace_admission", phaseStarted);
  phaseStarted = performance.now();
  const rootPublication = constructRootPublication(
    gtl,
    {
      productId: verified.productId,
      artifactDigest: verified.artifactDigest,
      productContentDigest: verified.productContentDigest,
      manifestDigest: verified.manifestDigest,
      packageName: verified.packageName,
      packageVersion: verified.packageVersion,
    },
    install.rootPublicationKind,
  );
  const additionalPublications = [];
  for (const [index, prepared] of additionalProducts.entries()) {
    additionalPublications.push(await prepared.loadInstalledPublication({
      installedRoot: additionalInstallCandidates[index].installedRoot,
      install: additionalInstallCandidates[index],
      verified: additionalVerified[index],
      gtl,
      product,
    }));
  }
  const corePublications = (options.additionalCorePublicationConstructors ?? []).map(name => {
    assert.equal(typeof gtl[name], 'function');
    return gtl[name]({ productId: candidateBasis.productId, artifactDigest: candidateBasis.artifactDigest,
      productContentDigest: candidateBasis.productContentDigest, productManifestDigest: candidateBasis.manifestDigest,
      packageName: candidateBasis.packageName, packageVersion: candidateBasis.packageVersion });
  });
  const publications = [rootPublication, ...corePublications, ...additionalPublications];
  recordSetup(options, "setup-publications", publications);
  const publicationChecks = requirePublicationValidations(validator, publications);
  recordSetup(options, "setup-publication-validations", publicationChecks);
  const selectedPublications = options.programRef === undefined ? [usesLanguageFixture ? additionalPublications[0] : rootPublication]
    : publications.filter(p => p.programs.some(program => program.programRef === options.programRef));
  assert.equal(selectedPublications.length, 1, "one exact selected Program publication");
  const publication = selectedPublications[0];
  const { publicationAdmission, publicationValidation } = publicationChecks[publications.indexOf(publication)];
  const rootProgramRef = publication.programs.some(
      (program) => program.programRef === options.programRef,
    )
    ? options.programRef
    : usesLanguageFixture ? (additionalProducts[0]?.ids?.programRef ?? LANGUAGE_TEST_IDS.programRef)
      : publication.programs[0].programRef;
  const selectedProgramRefs = new Set([
    rootProgramRef,
    LANGUAGE_TEST_DIRECT_IDS.programRef,
  ]);
  // A semantic Program (the validator's semanticLifecycleRefForProgram rule)
  // names lifecycle, contract and binding owners in the Products it depends on.
  // It validates over its Product-resolved declaration closure when the
  // caller's Catalog resolves its execution (ProductExecutionResolutionPort),
  // not over its own publication here; every other selected Program does.
  const semanticPrograms = publication.programs.filter((program) =>
    selectedProgramRefs.has(program.programRef) &&
    (program.policies["abg.semantic_lifecycle"] ?? publication.semanticLifecycle?.declarationRef ??
      publication.semanticJobLifecycle?.declarationRef) !== undefined);
  // A caller-declared cross-publication root Program references declarations
  // owned by other admitted publications (for example canonical ABI contracts).
  // It validates below over its Catalog-resolved declaration closure, never
  // over its own publication alone.
  const crossPublicationProgram = options.crossPublicationProgram === true;
  const locallyValidatedPrograms = publication.programs.filter((program) =>
    selectedProgramRefs.has(program.programRef) && !semanticPrograms.includes(program) &&
    !(crossPublicationProgram && program.programRef === rootProgramRef));
  const programValidations = locallyValidatedPrograms.map((program) =>
    validator.validateProgram(
      rawProgramInput(validator, publicationAdmission, program),
    ));
  // Pair by Program: a typed refusal carries no programRef.
  const rootValidationIndex = locallyValidatedPrograms.findIndex(
    (program) => program.programRef === rootProgramRef,
  );
  let programValidation = rootValidationIndex === -1 ? undefined : programValidations[rootValidationIndex];
  recordSetup(options, "setup-program-validations", programValidations);
  assert.equal(publicationValidation.kind, "publication_validation", JSON.stringify(publicationValidation));
  if (!semanticPrograms.some((program) => program.programRef === rootProgramRef) && !crossPublicationProgram)
    assert.equal(programValidation?.kind, "program_validation", JSON.stringify(programValidation));
  assert.equal(programValidations.every((value) => value.kind === "program_validation"), true,
    JSON.stringify(programValidations.filter((value) => value.kind !== "program_validation")));
  const catalogInstalledProducts = admittedInstalls.map((install, index) => {
    const {
      kind: _kind,
      disposition: _disposition,
      admissionEventRef: _admissionEventRef,
      ...body
    } = install;
    const candidate = {
      kind: "product_install_candidate",
      disposition: "materialized",
      ...body,
    };
    assert.equal(
      product.canonicalJson(candidate),
      product.canonicalJson(installCandidates[index]),
      "Catalog's candidate carrier must be the exact preimage of ABG-admitted install truth",
    );
    return installCandidates[index];
  });
  const {
    kind: _workspaceBindingKind,
    admissionEventRef: _workspaceBindingAdmissionEventRef,
    ...admittedWorkspaceBindingBody
  } = workspaceBinding;
  const catalogWorkspaceBinding = {
    kind: "workspace_binding_candidate",
    ...admittedWorkspaceBindingBody,
  };
  assert.equal(
    product.canonicalJson(catalogWorkspaceBinding),
    product.canonicalJson(bindingCandidate),
    "Catalog's binding candidate must be the exact preimage of ABG-admitted workspace truth",
  );
  const catalog = product.admitGraphFunctionCatalog({
    workspaceBinding: bindingCandidate,
    resolvedLock: lock,
    verifiedProducts,
    installedProducts: catalogInstalledProducts,
    publications,
  });
  recordSetup(options, "setup-catalog", catalog);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const workspaceAdditionalProduct = additionalProducts[
    (options.workspaceProductIndex ?? (usesLanguageFixture ? 1 : 0)) - 1
  ];
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [
      options.graphFunctionRef ??
        workspaceAdditionalProduct?.ids?.graphFunctionRef ??
        LANGUAGE_TEST_IDS.graphFunctionRef,
    ],
  );
  recordSetup(options, "setup-catalog-view", catalogView);
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  if (crossPublicationProgram) {
    // The Product closure owner resolves the Program over the genuine Catalog;
    // the validator then proves that whole declaration inventory.
    const declarationClosure = product.resolveProgramDeclarationClosure(catalog, catalogView, rootProgramRef);
    assert.equal(declarationClosure.kind, "resolved_program_declaration_closure", JSON.stringify(declarationClosure));
    const closureProgram = declarationClosure.programPublication.programs.find(
      (program) => program.programRef === rootProgramRef,
    );
    const validationInput = product.constructCatalogProgramValidationInput(
      catalog, catalogView, declarationClosure, closureProgram,
    );
    assert.notEqual(validationInput.kind, "raw_admission_refusal", JSON.stringify(validationInput));
    programValidation = validator.validateProgram(validationInput);
    assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
    programValidations.push(programValidation);
  }
  accountSetupPhase(options, "execution_preparation_publication_program_and_catalog", phaseStarted);

  return {
    scratch,
    artifactPath,
    artifactPaths: [artifactPath, ...additionalProducts.map(
      (prepared) => prepared.artifactPath,
    )],
    consumerRoot,
    installedRoot,
    installedRoots: installCandidates.map((candidate) => candidate.installedRoot),
    product,
    abg,
    gtl: languageTestGtlView(gtl),
    hog,
    implementationLeafPort,
    implementation,
    validator,
    ownerSurface: install.ownerSurface,
    ownerModules: install.ownerModules,
    candidateBasis,
    store,
    artifactTruth: workspaceBindingResult.artifactTruth,
    durablePrefix: workspaceBindingResult.successorPrefix,
    verified,
    verifiedProducts,
    additionalVerified,
    installCandidate,
    installCandidates,
    additionalInstallCandidates,
    admittedInstall,
    admittedInstalls,
    additionalAdmittedInstalls,
    admittedInstallResults,
    catalogInstalledProducts,
    lock,
    productSet,
    workspaceAuthority,
    bindingCandidate,
    workspaceBinding,
    workspaceBindingResult,
    publication,
    publications,
    publicationChecks,
    additionalPublications,
    additionalProducts,
    publicationAdmission,
    publicationValidation,
    selectedProgramRef: rootProgramRef,
    programValidation,
    programValidations,
    catalog,
    catalogView,
  };
}

// Every path under a shared install root with its kind, mode and content
// digest. A shared install is inventoried when it is made and again when it is
// disposed; any difference means a case wrote under the install.
async function installTreeInventory(root) {
  const rows = [];
  async function visit(path, relativePath) {
    const status = await lstat(path);
    const mode = status.mode & 0o7777;
    if (status.isSymbolicLink()) {
      rows.push(`${relativePath}\tsymlink\t${await readlink(path)}`);
    } else if (status.isDirectory()) {
      rows.push(`${relativePath}\tdirectory\t${mode}`);
      for (const name of (await readdir(path)).sort())
        await visit(join(path, name), relativePath === "" ? name : `${relativePath}/${name}`);
    } else {
      const digest = status.isFile()
        ? createHash("sha256").update(await readFile(path)).digest("hex")
        : "not-a-file";
      rows.push(`${relativePath}\tfile\t${mode}\t${status.size}\t${digest}`);
    }
  }
  await visit(root, "");
  return rows;
}

/**
 * Install phase, once per test file. Packs the tenant (or selects the frozen
 * artifact), prepares the fixture Products, verifies every artifact, installs
 * them under one resolved lock and imports the installed owners, all under one
 * scratch root that belongs to the install. Accepts the install options
 * (`frozenArtifact`, `candidateBasisSource`, `rootPublicationKind`,
 * `prepareAdditionalProducts`, and `setupAccounting` for the install phases).
 * The caller disposes the install after the file's last case: `dispose()`
 * checks that the install root is byte-for-byte as it was made, then removes
 * it; it throws, and keeps the root, when a case changed it.
 */
export async function installTenantOnce(packageRoot, options = {}) {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi5-root-install-")));
  let install;
  try {
    install = await provisionInstalledTenant(scratch, packageRoot, options);
  } catch (error) {
    await rm(scratch, { force: true, recursive: true });
    throw error;
  }
  const inventoryAtInstall = await installTreeInventory(scratch);
  let disposed = false;
  return Object.freeze({
    ...install,
    async dispose() {
      if (disposed) return;
      disposed = true;
      const inventoryAtDispose = await installTreeInventory(scratch);
      const before = new Set(inventoryAtInstall);
      const after = new Set(inventoryAtDispose);
      const changed = [
        ...inventoryAtInstall.filter((row) => !after.has(row)).map((row) => `- ${row}`),
        ...inventoryAtDispose.filter((row) => !before.has(row)).map((row) => `+ ${row}`),
      ];
      if (changed.length > 0) {
        throw new Error(`shared install ${scratch} changed while its cases ran:\n${changed.slice(0, 20).join("\n")}`);
      }
      await rm(scratch, { force: true, recursive: true });
    },
  });
}

/**
 * Case phase. Opens a fresh case environment on an install from
 * `installTenantOnce`: its own scratch root, event store, admitted installs,
 * workspace, binding, publications and Catalog. Returns the environment shape
 * `setupInstalledRootCatalog` returns; `scratch` is the case's root, while
 * `artifactPath`, `consumerRoot` and `installedRoot` are the shared install's.
 * The case's store is closed and its scratch removed after the case.
 */
export async function openCaseEnvironment(context, install, options = {}) {
  assert.equal(install?.kind, "installed_tenant", "openCaseEnvironment requires an install from installTenantOnce");
  for (const key of INSTALL_OPTION_KEYS) {
    if (options[key] !== undefined && options[key] !== install.installOptions[key]) {
      throw new TypeError(`${key} selects the shared install; the case gives a different value`);
    }
  }
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi5-root-case-")));
  const storeHolder = { store: null };
  context.after(async () => {
    storeHolder.store?.closeDurableLog();
    await rm(scratch, { force: true, recursive: true });
  });
  return openInstalledCaseEnvironment(scratch, install, options, storeHolder);
}

/**
 * One shared install per key for the calling test file, made on first use and
 * disposed after the file's last test. `create(key)` returns the install
 * (or an object holding one under `install` with its own `dispose`).
 */
export function installOncePerFile(create) {
  const installs = new Map();
  after(async () => {
    for (const pending of installs.values()) {
      const made = await pending.catch(() => null);
      await made?.dispose?.();
    }
  });
  return (key = "default") => {
    if (!installs.has(key)) installs.set(key, create(key));
    return installs.get(key);
  };
}

/**
 * The per-case entry: one scratch root holding the install and the case, made
 * and removed with the case. Files whose cases share one install use
 * `installTenantOnce` and `openCaseEnvironment` instead.
 */
export async function setupInstalledRootCatalog(
  context,
  packageRoot,
  options = {},
) {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi5-root-env-")));
  const storeHolder = { store: null };
  context.after(async () => {
    storeHolder.store?.closeDurableLog();
    await rm(scratch, { force: true, recursive: true });
  });
  const install = await provisionInstalledTenant(scratch, packageRoot, options);
  return openInstalledCaseEnvironment(scratch, install, options, storeHolder);
}

export async function setupInstalledRootInvocation(
  context,
  packageRoot,
  options = {},
) {
  // A bounded proof may reuse an already admitted installed environment to
  // establish another binding/Run through the same ordinary invocation owner.
  // With `install` (from installTenantOnce) the case opens its own environment
  // on that shared install; otherwise the case installs for itself.
  const environment = options.existingEnvironment ?? (options.install === undefined
    ? await setupInstalledRootCatalog(context, packageRoot, options)
    : await openCaseEnvironment(context, options.install, options));
  let phaseStarted = performance.now();
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    workspaceBinding,
    artifactTruth,
    publication,
    programValidation: catalogProgramValidation,
    catalog,
    catalogView,
    admittedInstalls,
  } = environment;
  const programRef = options.programRef ?? environment.selectedProgramRef;
  const graphFunctionRef = options.graphFunctionRef ??
    environment.additionalProducts[0]?.ids?.graphFunctionRef ?? LANGUAGE_TEST_IDS.graphFunctionRef;
  const catalogProgram = publication.programs.find(
    (candidate) => candidate.programRef === programRef,
  );
  const catalogGraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === graphFunctionRef,
  );
  assert.ok(catalogProgram, "installed root requires one exact selected Program");
  assert.ok(
    catalogGraphFunction,
    "installed root requires one exact selected GraphFunction",
  );
  const executionResolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
    programRef: catalogProgram.programRef,
    selection: {
      kind: "direct",
      catalogHandle: catalogGraphFunction.name,
    },
  });
  assert.equal(
    executionResolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(executionResolution),
  );
  const program = executionResolution.program;
  const graphFunction = executionResolution.graphFunction;
  const programValidation = executionResolution.programValidation;
  accountSetupPhase(options, "execution_preparation_resolution_and_program_validation", phaseStarted);
  phaseStarted = performance.now();
  assert.equal(program.programRef, catalogProgram.programRef);
  assert.equal(graphFunction.name, catalogGraphFunction.name);
  assert.equal(
    programValidation.programRef,
    catalogProgramValidation.programRef,
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
    workspaceBinding.authorizedActorRef;
  const supervised = program.policies["abg.root_mode"] === "supervised";
  const capabilityGrantBasis = {
    admittedInstalls,
    workspaceBinding,
    fixedPacket: supervised ? product.RUN_OPERATION_CONTRACTS.invoke.start : product.RUN_OPERATION_CONTRACTS.invoke.invoke,
  };
  const capabilityGrant = product.constructCapabilityGrant(
    policy,
    actorRef,
    "abg.operation.run.invoke",
    product.DIRECT_INVOKE_CAPABILITY,
    capabilityGrantBasis,
  );
  const capabilityGrants = [capabilityGrant];
  const input = options.inputFactory === undefined
    ? options.input ?? constructLanguageTestInput("World")
    : await options.inputFactory({
        product,
        workspaceAuthority: environment.workspaceAuthority,
        workspaceBinding,
        program,
        graphFunction,
        programValidation,
        admittedInstalls,
        capabilityGrant,
      });
  const inputContractRef = options.inputContractRef ??
    graphFunction.inputs[0];
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
      variant: supervised ? "start" : "direct",
      invocationRef: options.publicInvocationRef ?? "invocation://t286/support/run-invoke",
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/support/run-invoke",
      payload: {
        programRef: program.programRef,
        catalogHandle: graphFunction.name,
        ...(supervised ? {scope:"program",target:program.policies["abg.default_start_ref"],startRef:program.policies["abg.default_start_ref"],until:"converged",rootMode:"supervised"} : {}),
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
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
    capabilityGrantBasis,
  );
  const invocation = (supervised ? product.constructStartInvocation : product.constructDirectInvocation)(
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
  assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
  const invocationAdmissionReceipt = abg.admitInvocation(
    store,
    {
      invocation,
      rawRequest,
      rawInput,
      programPublication: executionResolution.programPublication,
      executionResolution: executionResolution.resolution,
      program,
      graphFunction,
      programValidation: executionResolution.programValidation,
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
      supervised ? "start" : "invoke",
    ),
  );
  assert.equal(
    invocationAdmissionReceipt.kind,
    "invocation_admission_receipt",
    JSON.stringify(invocationAdmissionReceipt),
  );
  const invocationAdmission = invocationAdmissionReceipt.admission;
  accountSetupPhase(options, "execution_preparation_invocation_admission", phaseStarted);
  return {
    ...environment,
    durablePrefix: invocationAdmissionReceipt.successorPrefix,
    publication: executionResolution.programPublication,
    program,
    programValidation,
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
    executionResolution,
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
  const phaseStarted = performance.now();
  const {
    product,
    gtl,
    validator,
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
  const [selectedLeaf] = gtl.cLeafTerms(node.term);
  assert.ok(
    selectedLeaf,
    "installed resolution requires one declared executable root leaf",
  );
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
      candidate.bindingRef ===
        selectedLeaf.requirement.implementationBindingRef,
  );
  assert.ok(
    implementationBinding,
    "installed resolution requires the selected canonical implementation binding",
  );
  const packagedImplementations =
    environment.executionResolution.packagedImplementations;
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
    environment.executionResolution.declarationClosure,
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
    environment.executionResolution.declarationClosure,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
    JSON.stringify(resolutionSetValidation),
  );
  const rootRows = resolutionSetCandidate.rows.filter(
    (row) =>
      row.graphFunctionRef === graphFunction.name &&
      row.nodeRef === node.nodeRef,
  );
  const resolutionCandidate = rootRows.length === 1 && gtl.isExecutableCLeaf(node.term)
    ? product.resolveImplementation(
        catalogView,
        environment.executionResolution.declarationClosure,
        programValidation,
        graphValidation,
        graphFunction.name,
        node.nodeRef,
        packagedImplementations,
      )
    : undefined;
  if (resolutionCandidate !== undefined) {
    assert.equal(
      resolutionCandidate.kind,
      "implementation_resolution_candidate",
      JSON.stringify(resolutionCandidate),
    );
  }
  const implementationDescriptor = resolutionCandidate === undefined
    ? packagedImplementations.find(
        (descriptor) =>
          descriptor.descriptorDigest ===
            rootRows.find((row) =>
              row.implementationBindingRef ===
                selectedLeaf.requirement.implementationBindingRef &&
              row.programLocusRef === selectedLeaf.programLocusRef
            )?.implementationDescriptorDigest,
      )
    : packagedImplementations.find(
        (descriptor) =>
          descriptor.descriptorDigest ===
            resolutionCandidate.implementationDescriptorDigest,
      );
  assert.notEqual(implementationDescriptor, undefined);
  const resolutionValidation = resolutionCandidate === undefined
    ? undefined
    : validator.validateImplementationResolution(
        resolutionCandidate,
        publication,
        programValidation,
        graphValidation,
        graphFunction,
        implementationDescriptor,
      );
  if (resolutionValidation !== undefined) {
    assert.equal(
      resolutionValidation.kind,
      "implementation_resolution_validation",
      JSON.stringify(resolutionValidation),
    );
  }
  accountSetupPhase(options, "execution_preparation_graph_and_implementation_resolution", phaseStarted);
  return {
    ...environment,
    node,
    selectedLeaf,
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
  const phaseStarted = performance.now();
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
    selectedLeaf,
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
  assert.equal(graphValidation.graphRef, graph.materializationRef);
  assert.equal(graphValidation.graphDigest, graph.materializationDigest);
  assert.equal(
    graphValidation.graphFunctionRef,
    invocationAdmission.graphFunctionRef,
  );
  assert.equal(
    graphValidation.graphFunctionDigest,
    invocationAdmission.graphFunctionDigest,
  );
  assert.equal(graph.graphFunctionRef, invocationAdmission.graphFunctionRef);
  assert.equal(
    graph.graphFunctionDigest,
    invocationAdmission.graphFunctionDigest,
  );
  assert.equal(
    graphValidation.invocationAdmissionRef,
    invocationAdmission.invocationAdmissionRef,
  );
  assert.equal(
    graphValidation.programValidationRef,
    invocationAdmission.programValidationRef,
  );
  const executionBasisAdmission = abg.admitExecutionBasis(
    store,
    durablePrefix,
    {
      invocationAdmission,
      rawInputValue: input,
      program,
      programPublication: environment.executionResolution.programPublication,
      executionResolution: environment.executionResolution.resolution,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      ...(resolutionCandidate === undefined
        ? {}
        : { resolutionCandidate, resolutionValidation }),
      closureContract,
    },
    {
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/root/execution-basis",
      causationEventRefs: [],
    },
  );
  assert.equal(executionBasisAdmission.kind, "execution_basis_admission", JSON.stringify(executionBasisAdmission));
  if (resolutionCandidate !== undefined) {
    assert.notEqual(executionBasisAdmission.implementationResolution, null);
  }
  const implementationRow = abg.selectAdmittedImplementationResolution(
    executionBasisAdmission.implementationSet,
    {
      graphFunctionRef: graph.graphFunctionRef,
      nodeRef: graph.template.startNodeRef,
      programLocusRef: selectedLeaf.programLocusRef,
      implementationBindingRef:
        selectedLeaf.requirement.implementationBindingRef,
    },
  );
  assert.notEqual(implementationRow, null);
  const semantics = environment.executionResolution.productSemantics;
  const semanticsProjection =
    environment.product.projectInstalledLeafSemantics(semantics);
  assert.ok(environment.implementationLeafPort,
    "a leaf-port component route requires the default installed owner surface; the exported-only root route loads no implementation module");
  const leafPort = await environment.implementationLeafPort.constructAdmittedLeafInvocationPort({
    prefix: abg.selectValidatedRuntimeEventPrefix(
      abg.readRuntimeEventsAtDurablePrefix(
        executionBasisAdmission.successorPrefix,
      ),
    ),
    artifactTruth: environment.artifactTruth,
    implementationSet: executionBasisAdmission.implementationSet,
    executionResolution: environment.executionResolution,
    semanticsProjection,
  });
  accountSetupPhase(options, "execution_preparation_basis_and_leaf_port", phaseStarted);
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
