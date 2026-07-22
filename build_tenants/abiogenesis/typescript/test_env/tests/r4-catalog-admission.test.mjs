import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  expectedVerificationIdentity,
  readCandidateBasis,
} from "../support/candidate-basis.mjs";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function artifactBasis(product, operationId, scopeRef, scopeDigest, invocationRef, causationEventRefs = []) {
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
    correlationId: "correlation://t286/r4",
    eventTime: "2026-07-21T00:00:00.000Z",
    causationEventRefs,
  };
}

function requireRawAdmission(validator, value, subjectKind, contractRef) {
  const admitted = validator.rawAdmitValue(value, subjectKind, contractRef);
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

function rawProgramInput(validator, publicationAdmission, program = publicationAdmission.value.programs[0]) {
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

test("R4 admits and narrows the exact validated Hello World catalog", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-r4-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);

  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
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
  const candidateBasis = await readCandidateBasis(root);
  const verified = await bootstrapProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    ...expectedVerificationIdentity(candidateBasis),
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
  const product = await import(`${pathToFileURL(join(installedRoot, "build/code/src/product/index.js")).href}?r4=${nonce}`);
  const abg = await import(`${pathToFileURL(join(installedRoot, "build/code/src/abg/index.js")).href}?r4=${nonce}`);
  const gtl = await import(`${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?r4=${nonce}`);
  const validator = await import(`${pathToFileURL(join(installedRoot, "build/code/src/validator/index.js")).href}?r4=${nonce}`);
  const store = new abg.AbgEventStore();

  const admittedInstall = abg.admitProductInstall(
    store,
    installCandidate,
    artifactBasis(
      product,
      "abg.operation.product.install",
      installCandidate.installId,
      installCandidate.productContentDigest,
      "invocation://t286/r4/product-install",
    ),
  );
  assert.equal(admittedInstall.kind, "product_install", JSON.stringify(admittedInstall));
  const lock = product.constructResolvedProductLock([admittedInstall]);
  const productSet = product.constructProductSet([admittedInstall], lock);
  const workspaceRoot = join(scratch, "workspace");
  await mkdir(workspaceRoot);
  const authorityManifest = {
    workspaceId: "workspace://t286/abi5-root-r4",
    canonicalRoot: workspaceRoot,
    authorityMode: "trusted_developer",
  };
  const authority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://t286/r4/workspace-authority",
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  const bindingCandidate = product.constructWorkspaceBinding(authority, productSet, lock, {
    toolchainRoot: consumerRoot,
    productRoot: installedRoot,
    eventLogRoot: join(workspaceRoot, ".ai-workspace/events"),
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  });
  const workspaceBinding = abg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    artifactBasis(
      product,
      "abg.operation.workspace.bind",
      bindingCandidate.bindingId,
      bindingCandidate.bindingDigest,
      "invocation://t286/r4/workspace-bind",
      [admittedInstall.admissionEventRef],
    ),
  );
  assert.equal(workspaceBinding.kind, "workspace_binding", JSON.stringify(workspaceBinding));

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
  const publicationValidation = validator.validatePublication(
    publicationAdmission,
    contributionAdmissions,
  );
  assert.equal(publicationValidation.kind, "publication_validation", JSON.stringify(publicationValidation));
  const programValidations = publication.programs.map((program) =>
    validator.validateProgram(rawProgramInput(validator, publicationAdmission, program)));
  const programValidation = programValidations.find(
    (value) => value.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.equal(programValidation.kind, "program_validation", JSON.stringify(programValidation));
  assert.equal(programValidations.every((value) => value.kind === "program_validation"), true);
  assert.equal("compiledPlan" in programValidation, false);
  assert.equal("executionDeclaration" in programValidation, false);

  const catalogCandidate = product.constructCatalogAdmissionCandidate(
    workspaceBinding,
    lock,
    publicationAdmission.value,
    publicationValidation,
    programValidations,
  );
  assert.equal(catalogCandidate.kind, "catalog_admission_candidate", JSON.stringify(catalogCandidate));
  assert.equal(Object.isFrozen(catalogCandidate), true);
  const catalog = abg.admitCatalog(
    store,
    catalogCandidate,
    artifactBasis(
      product,
      "abg.operation.catalog.admit",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://t286/r4/catalog-admit",
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(catalog.kind, "admitted_catalog", JSON.stringify(catalog));
  assert.equal(catalog.rows.length, 2);
  assert.equal(catalog.rows[0].handle, gtl.HELLO_WORLD_IDS.graphFunctionRef);
  assert.equal(catalog.rows[0].kind, "graph_function");
  assert.equal(catalog.rows[0].disposition, "admitted");
  assert.deepEqual(catalog.rows[0].programMembershipRefs, [gtl.HELLO_WORLD_IDS.programRef]);
  assert.equal(Object.isFrozen(catalog), true);

  const emptyViewCandidate = product.constructCatalogViewCandidate(catalog, []);
  assert.equal(emptyViewCandidate.kind, "catalog_view_candidate");
  assert.deepEqual(emptyViewCandidate.selectedRows, []);
  const viewCandidate = product.constructCatalogViewCandidate(
    catalog,
    [gtl.HELLO_WORLD_IDS.graphFunctionRef],
  );
  assert.equal(viewCandidate.kind, "catalog_view_candidate", JSON.stringify(viewCandidate));
  const view = abg.narrowCatalogView(
    store,
    catalog,
    viewCandidate,
    artifactBasis(
      product,
      "abg.operation.catalog.view",
      catalog.catalogId,
      catalog.catalogDigest,
      "invocation://t286/r4/catalog-view",
      [catalog.admissionEventRef],
    ),
  );
  assert.equal(view.kind, "catalog_view", JSON.stringify(view));
  assert.deepEqual(view.allowlist, [gtl.HELLO_WORLD_IDS.graphFunctionRef]);
  assert.equal(view.selectedRows.length, 1);
  assert.equal(Object.isFrozen(view), true);

  const eventCountBeforeNegatives = store.readAll().length;
  const mutatedPublication = structuredClone(publication);
  mutatedPublication.programs[0].callableMembership = [];
  const mutatedAdmission = requireRawAdmission(
    validator,
    mutatedPublication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const mutatedProgramValidation = validator.validateProgram(
    rawProgramInput(validator, mutatedAdmission),
  );
  assert.equal(mutatedProgramValidation.kind, "static_validation_refusal");
  assert.equal(mutatedProgramValidation.disposition, "invalid");
  assert.ok(mutatedProgramValidation.diagnostics.some((diagnostic) => diagnostic.code === "missing_membership"));
  const malformedGraphFunction = requireRawAdmission(
    validator,
    { kind: "graph_function", name: gtl.HELLO_WORLD_IDS.graphFunctionRef },
    "graph_function",
    "contract://abiogenesis/gtl/graph-function@5",
  );
  const malformedProgramValidation = validator.validateProgram({
    ...rawProgramInput(validator, publicationAdmission),
    graphFunctions: [malformedGraphFunction],
  });
  assert.equal(malformedProgramValidation.kind, "static_validation_refusal");
  assert.ok(malformedProgramValidation.diagnostics.some((diagnostic) => diagnostic.code === "invalid_reference"));

  const unboundPublication = gtl.constructHelloWorldModulePublication({
    productId: verified.productId,
    artifactDigest: `sha256:${"0".repeat(64)}`,
    productContentDigest: verified.productContentDigest,
    productManifestDigest: verified.manifestDigest,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const unboundAdmission = requireRawAdmission(
    validator,
    unboundPublication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const unboundPublicationValidation = validator.validatePublication(
    unboundAdmission,
    unboundPublication.contributions.map((value) =>
      requireRawAdmission(validator, value, "catalog_contribution", "contract://abiogenesis/gtl/catalog-contribution@5")),
  );
  const unboundProgramValidations = unboundPublication.programs.map((program) =>
    validator.validateProgram(rawProgramInput(validator, unboundAdmission, program)));
  const unboundCatalogCandidate = product.constructCatalogAdmissionCandidate(
    workspaceBinding,
    lock,
    unboundAdmission.value,
    unboundPublicationValidation,
    unboundProgramValidations,
  );
  assert.equal(unboundCatalogCandidate.code, "publication_not_bound");

  const duplicateView = product.constructCatalogViewCandidate(
    catalog,
    [gtl.HELLO_WORLD_IDS.graphFunctionRef, gtl.HELLO_WORLD_IDS.graphFunctionRef],
  );
  assert.equal(duplicateView.code, "duplicate_allowlist_entry");
  const unknownView = product.constructCatalogViewCandidate(
    catalog,
    ["graph-function://abiogenesis/unknown@5"],
  );
  assert.equal(unknownView.code, "unknown_allowlist_entry");
  const changedCandidate = {
    ...catalogCandidate,
    workspaceBindingId: "workspace-binding://wrong",
  };
  const changedCandidateRefusal = abg.admitCatalog(
    store,
    changedCandidate,
    artifactBasis(
      product,
      "abg.operation.catalog.admit",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://t286/r4/catalog-mutated",
    ),
  );
  assert.equal(changedCandidateRefusal.code, "candidate_not_constructed");
  const forgedViewRefusal = abg.narrowCatalogView(
    store,
    catalog,
    structuredClone(viewCandidate),
    artifactBasis(
      product,
      "abg.operation.catalog.view",
      catalog.catalogId,
      catalog.catalogDigest,
      "invocation://t286/r4/catalog-view-forged",
    ),
  );
  assert.equal(forgedViewRefusal.code, "candidate_not_constructed");
  assert.equal(store.readAll().length, eventCountBeforeNegatives);
  assert.equal(typeof store.admit, "undefined");

  const events = store.readAll();
  assert.deepEqual(events.map((event) => event.admissionOrdinal), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(events.map((event) => event.kind), [
    "public_operation_artifact_admitted",
    "public_operation_artifact_admitted",
    "public_operation_artifact_admitted",
    "registry_entry_admitted",
    "registry_entry_admitted",
    "public_operation_artifact_admitted",
  ]);
  assert.equal(events.every((event) => Object.isFrozen(event) && Object.isFrozen(event.payload)), true);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r4.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R4_catalog_admitted_and_narrowed",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      workspaceBindingId: workspaceBinding.bindingId,
      moduleRef: publication.moduleRef,
      publicationValidationRef: publicationValidation.validationRef,
      programRef: publication.programs[0].programRef,
      programValidationRef: programValidation.validationRef,
      graphFunctionRef: publication.graphFunctions[0].name,
      catalogId: catalog.catalogId,
      catalogDigest: catalog.catalogDigest,
      catalogViewId: view.viewId,
      catalogViewDigest: view.viewDigest,
      rowDispositions: catalog.rows.map(({ handle, kind, disposition, admissionEventRef }) => ({
        handle,
        kind,
        disposition,
        admissionEventRef,
      })),
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      mutation: {
        malformedProgramRefusal: mutatedProgramValidation.diagnostics.map((diagnostic) => diagnostic.code),
        malformedDeclarationRefusal: malformedProgramValidation.diagnostics.map((diagnostic) => diagnostic.code),
        duplicateAllowlistRefusal: duplicateView.code,
        unknownAllowlistRefusal: unknownView.code,
        changedCandidateRefusal: changedCandidateRefusal.code,
        unboundPublicationRefusal: unboundCatalogCandidate.code,
        forgedViewRefusal: forgedViewRefusal.code,
        eventCountUnchanged: store.readAll().length === eventCountBeforeNegatives,
      },
      authorityBoundary: {
        validatorLowers: false,
        catalogInvokes: false,
        emptyViewFallsBack: false,
        publicAppendType: "undefined",
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
