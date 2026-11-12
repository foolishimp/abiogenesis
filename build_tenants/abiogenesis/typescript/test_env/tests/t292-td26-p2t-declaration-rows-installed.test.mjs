import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { prepareNeutralSchemaProduct } from "../support/neutral-schema-product.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";

// T-292 TD-26 P2T: the installed Public catalog.view and catalog.apply over
// declaration rows. The core Product publishes no declaration row; the
// neutral-schema consumer Product (support/neutral-schema-product.mjs)
// publishes one node_type and one overlay row whose contracts are installed
// schema assets. Every Public call crosses the installed transport
// (abg.cli --jsonl), as steel-basic-cli-public and
// t287-w2-05-install-catalog-owner-chain drive it. The lane needs no recorded
// input: setupInstalledCliHarness packs the tenant and installs its CLI host.
const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://abiogenesis/t292/td26-p2t";
const UNKNOWN_HANDLE = "node-type://neutral-schema.example/annotation/never-published@5";
const EMPTY_SLOTS = Object.freeze(Object.fromEntries([
  "workspace_binding", "product_set", "dependency_lock", "catalog_scope", "execution_program",
  "graph_function", "input_contract", "session_policy", "capability_grants", "actor",
  "transport_steering", "verification_references", "execution_basis",
].map((key) => [key, null])));

test("T-292 TD-26 P2T installed Public catalog.view and catalog.apply admit a consumer's node_type and overlay rows and refuse an unknown handle and a row outside the view", async (context) => {
  const started = performance.now();
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKinds: ["worksite_construction"],
  });
  const harnessMs = performance.now() - started;
  const product = harness.product;
  const [publicApi, abg, gtl] = await Promise.all(["public", "abg", "gtl"].map((surface) =>
    importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `td26-p2t-${surface}`)));
  const hash = product.sha256Canonical;
  const coordinate = (ref, value = { ref }) => ({ ref, digest: hash(value) });
  const viewCoordinate = (view) => ({
    ref: `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`,
    digest: view.viewDigest,
  });
  const actor = { actor: coordinate(ACTOR), attribution: coordinate(`${ACTOR}/attribution`) };

  const ownerRequest = { artifactPath: harness.artifactPath, artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis) };
  const ownerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
    schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: ownerRequest });
  assert.equal(ownerVerification.kind, "product_verification_success", JSON.stringify(ownerVerification));
  const abiArtifact = ownerVerification.verifiedArtifact;
  // The consumer declares the tenant archive as its npm dependency: the
  // install owner requires each declared Product dependency materialized
  // under the consumer's own install target.
  const fixture = await prepareNeutralSchemaProduct({ scratch: harness.scratch, product, gtl,
    abiPublication: harness.rootPublication, abiArtifact, abiPackageArchivePath: harness.artifactPath });
  const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef,
    ...expectedVerificationIdentity(fixture.basis) };
  const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
    schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
  assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));

  // One installed Public call: the shipped admission-data and grant
  // constructors, then the installed call constructor (uat/public-setup.mjs).
  let ordinal = 0;
  let closeHandoff = null;
  async function authorized(packet, request, resources, supplied = {}) {
    const { operationId, memberKey } = packet.definitionKey;
    const definitions = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter((row) =>
      row.definitionKey.operationId === operationId && row.definitionKey.memberKey === memberKey);
    assert.equal(definitions.length, 1, `${operationId}#${memberKey}`);
    const [definition] = definitions;
    const slots = { ...EMPTY_SLOTS, ...supplied };
    const data = product.constructAdmissionCapabilityData({ fixedPacket: packet,
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request, resources, authoritySlots: slots,
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden"
        ? null : product.admissionEnvironmentSelection(closeHandoff?.prefix ?? null, slots.workspace_binding) });
    ordinal += 1;
    const authorityValue = { actorRef: ACTOR, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: ACTOR, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request),
      scopeDigest: product.admissionAuthorityScope(data).digest };
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef: ACTOR,
      authorityMode: "trusted_developer",
      authority: { ...coordinate("authority://abiogenesis/t292/td26-p2t", authorityValue), value: authorityValue },
      approval: { ...coordinate(`approval://abiogenesis/t292/td26-p2t/${ordinal}`, approvalValue), value: approvalValue } };
    const admitted = await product.constructAdmissionCapabilityGrants(authority, ACTOR,
      { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data }, null);
    const member = abiArtifact.definitionContractCoordinates.operations
      .find((row) => row.operationId === operationId)?.members.find((row) => row.memberKey === memberKey);
    assert.ok(member, `${operationId}#${memberKey} contract coordinates`);
    return publicApi.constructInstalledPublicDefinitionCall({ product, installedPublic: publicApi,
      definitionContractCoordinates: abiArtifact.definitionContractCoordinates,
      contractCatalog: member.slots.request.contractCatalog, operationId, memberKey, request,
      slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: admitted.grants.map((grant) => ({ ref: grant.grantRef, digest: grant.grantDigest })) } },
      resources: { ...resources, admissionAuthority: { basis: admitted.data, authority, grants: admitted.grants } },
      requestRef: `public-request://abiogenesis/t292/td26-p2t/${String(ordinal).padStart(2, "0")}-${memberKey}`,
      correlationRef: "correlation://abiogenesis/t292/td26-p2t",
      eventTime: "2026-11-13T00:00:00.000Z",
      provenanceRefs: ["provenance://abiogenesis/t292/td26-p2t"] });
  }
  let cliOrdinal = 0;
  let cliMs = 0;
  async function cliCall(call) {
    const callStarted = performance.now();
    const resource = call.resources.eventResource;
    const acquisition = resource === undefined ? { kind: "eventless" }
      : resource.kind === "new_abg_event_resource" ? { kind: "new", eventLogPath: resource.eventLogPath }
      : { kind: "reopen", closeHandoff: resource.closeHandoff };
    const path = join(harness.scratch, `td26-p2t-${++cliOrdinal}.jsonl`);
    await writeFile(path, `${JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion, acquisition,
      invocation: call })}\n`);
    let stdout;
    try {
      ({ stdout } = await execFileAsync(harness.cliPath, ["--jsonl", path], { cwd: harness.cliHost,
        env: { ...process.env, NODE_OPTIONS: "" }, timeout: 120_000, maxBuffer: 20 * 1024 * 1024 }));
    } catch (error) { stdout = error.stdout; }
    cliMs += performance.now() - callStarted;
    return JSON.parse(stdout);
  }
  async function invoke(call, label) {
    const outcome = await cliCall(call);
    assert.equal(outcome.kind, "installed_definition_call_transport_result",
      `${label}: ${JSON.stringify(outcome).slice(0, 4000)}`);
    assert.equal(outcome.receipt.exitCode, 0, `${label}: ${JSON.stringify(outcome.receipt).slice(0, 4000)}`);
    assert.equal(outcome.receipt.ownerOutput.outcomeKind, "result", label);
    return outcome.receipt;
  }
  const reopen = () => ({ kind: "reopen_abg_event_resource", schemaVersion, closeHandoff,
    handoffDigest: hash(closeHandoff) });

  // Setup through the installed Public route: verify both Products, resolve
  // one lock, install both, bind one workspace and admit the Catalog.
  const products = [
    { verification: ownerVerification, request: ownerRequest },
    { verification: consumerVerification, request: consumerRequest },
  ];
  for (const item of products) {
    const verified = item.verification.verifiedArtifact;
    item.packed = { kind: "product_verification_artifact_resource", schemaVersion,
      artifactPath: item.request.artifactPath,
      artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
      productContent: { ref: `product-content://abiogenesis/${verified.productContentDigest.slice("sha256:".length)}`,
        digest: verified.productContentDigest },
      descriptor: item.verification.coordinates.descriptor,
      contributionManifest: { ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest },
      manifestDigest: verified.manifestDigest, productId: verified.productId,
      packageName: verified.packageName, packageVersion: verified.packageVersion };
    const call = await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
      { targetKind: "packed_artifact", artifact: item.packed.artifact, productContent: item.packed.productContent,
        descriptor: item.packed.descriptor, contributionManifest: item.packed.contributionManifest,
        declaredDependencies: verified.declaredDependencies,
        compatibilityInputs: verified.compatibilityRefs.map((compatibilityRef) => ({ compatibilityRef,
          subjectRef: item.packed.productContent.ref })) },
      { kind: "product_verification_resources", schemaVersion, targetKind: "packed_artifact",
        packedArtifact: item.packed });
    item.receipt = await invoke(call, `product.verify ${verified.productId}`);
    item.reference = { invocation: { ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest },
      outcome: item.receipt.ownerOutput.value.verifiedArtifact };
  }
  const verifiedProducts = products.map((item) => item.verification.verifiedArtifact);
  const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion,
    memberKey: "resolve", verifiedArtifacts: verifiedProducts });
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
  const references = products.map((item) => item.reference);
  const resolved = await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    { requirements: verifiedProducts.map((verified) => ({ productId: verified.productId,
      packageVersion: verified.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: [] })),
    verifiedCandidates: references },
    { kind: "product_resolution_resource_assertion", schemaVersion,
      verifiedPreimages: products.map((item) => ({ verification: item.reference,
        verifiedArtifact: item.verification.verifiedArtifact, verificationOutput: item.receipt.ownerOutput })),
      nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } },
    { verification_references: references }), "product.resolve");
  assert.deepEqual(resolved.ownerOutput.value.resolvedLock, lock);

  const eventLogPath = join(harness.scratch, "td26-p2t.events.jsonl");
  const installed = [];
  for (const [index, item] of products.entries()) {
    const eventResource = closeHandoff === null ? { kind: "new_abg_event_resource", schemaVersion, eventLogPath,
      locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) } : reopen();
    const call = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
      { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor,
        contributionManifest: item.packed.contributionManifest, resolvedLock: lock,
        targetRoot: join(harness.scratch, `installed-${index}`), installPolicy: "clean" },
      { kind: "product_install_resource_assertion", schemaVersion, eventResource, packedArtifact: item.packed,
        verifiedArtifact: item.verification.verifiedArtifact, resolvedLock },
      { dependency_lock: lock, verification_references: [item.reference], actor });
    const receipt = await invoke(call, `product.install ${index}`);
    assert.equal(receipt.ownerOutput.value.disposition, "materialized");
    closeHandoff = receipt.resources.eventResource.closeHandoff;
    const projection = abg.projectAdmittedProductInstallByInvocationRef(
      abg.projectExactPrefixArtifactTruth(closeHandoff.prefix), call.invocation.invocationRef);
    assert.ok(projection, `admitted install ${index}`);
    installed.push(projection);
  }

  const workspaceRoot = join(harness.scratch, "workspace");
  await mkdir(workspaceRoot);
  const workspaceCreation = await product.WorkspaceOperationPort.create({ kind: "workspace_create_packet",
    schemaVersion, memberKey: "clean", targetRoot: workspaceRoot, scaffoldPolicy: "none" });
  assert.equal(workspaceCreation.kind, "workspace_create_result", JSON.stringify(workspaceCreation));
  const workspaceManifest = workspaceCreation.manifest;
  const authorityManifest = { workspaceId: workspaceManifest.workspaceRef,
    canonicalRoot: workspaceManifest.canonicalRoot, authorityMode: "trusted_developer", authorizedActorRef: ACTOR };
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
    authorityManifestRef: "manifest://abiogenesis/t292/td26-p2t/workspace-authority",
    authorityManifestDigest: hash(authorityManifest) });
  assert.equal(workspaceAuthority.kind, "workspace_authority_basis", JSON.stringify(workspaceAuthority));
  const declaredRoots = { toolchainRoot: harness.installedPackageRoot, productRoot: installed[1].install.installedRoot,
    eventLogRoot: dirname(eventLogPath), runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive") };
  const rootFields = { toolchain: "toolchainRoot", product: "productRoot", event_log: "eventLogRoot",
    runtime_state: "runtimeStateRoot", projection: "projectionRoot", archive: "archiveRoot" };
  const installCoordinates = installed.map((row) => product.productInstallCoordinate(row.install));
  const bound = await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
    { workspaceAuthority: { ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest },
      installedSet: installCoordinates, resolvedLock: lock,
      declaredRoots: Object.entries(rootFields).map(([rootKind, field]) => ({ rootKind, path: declaredRoots[field] })) },
    { kind: "product_workspace_binding_resource_assertion", schemaVersion, eventResource: reopen(),
      workspaceAuthority, workspaceManifest, admittedInstalls: installed.map((row) => row.install), resolvedLock,
      declaredRoots },
    { product_set: installCoordinates, dependency_lock: lock, actor }), "workspace.bind");
  closeHandoff = bound.resources.eventResource.closeHandoff;
  const environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment", JSON.stringify(environment).slice(0, 2000));

  const consumerPublication = await fixture.loadInstalledPublication({
    installedRoot: installed[1].install.installedRoot, gtl });
  // The tenant's contribution manifest binds its core publications; the
  // Catalog admits exactly them and the consumer's publication.
  const corePublications = [
    "constructDefaultGovernanceLibraryModulePublication", "constructWorksiteConstructionModulePublication",
    "constructWorksiteCommandExecutionModulePublication", "constructNativeWorkspaceWorkModulePublication",
    "constructRequirementHandoffModulePublication", "constructSemanticStageModulePublication",
    "constructSemanticRevisionModulePublication", "constructSelfConformanceModulePublication",
  ].map((name) => gtl[name]({ productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion }));
  assert.deepEqual(corePublications.map(product.modulePublicationSemanticDigest).sort(),
    abiArtifact.contributionManifest.publicationBindings.map(({ publicationDigest }) => publicationDigest).sort());
  const publications = [...corePublications, consumerPublication];
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
    readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
      installedProducts: installed.map((row) => row.candidate), publications } });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog).slice(0, 2000));
  const boundSlots = { workspace_binding: bound.ownerOutput.value.binding,
    product_set: environment.productInstalls.map(product.productInstallCoordinate), dependency_lock: lock, actor };
  const catalogReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
    { workspaceBinding: bound.ownerOutput.value.binding, descriptors: products.map((item) => item.packed.descriptor),
      contributionManifests: products.map((item) => item.packed.contributionManifest), resolvedLock: lock },
    { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopen(),
      workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
      admittedInstalls: environment.productInstalls, publications }, boundSlots), "catalog.admit");
  assert.deepEqual(catalogReceipt.resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
  closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
  assert.deepEqual(catalogReceipt.ownerOutput.value.catalog, catalogReceipt.resources.catalog);
  assert.equal(catalogReceipt.ownerOutput.value.catalog.digest, catalog.basisDigest);
  const catalogCoordinate = catalogReceipt.ownerOutput.value.catalog;

  // The admitted Catalog holds the consumer's node_type and overlay rows.
  const consumerRows = catalog.declarationEntries.filter((row) => row.owningProductId === fixture.ids.productId);
  assert.deepEqual(consumerRows.map((row) => [row.declarationKind, row.handle, row.declarationOrContractRef]).sort(), [
    ["node_type", fixture.ids.nodeTypeHandle, fixture.ids.nodeTypeContractRef],
    ["overlay", fixture.ids.overlayHandle, fixture.ids.overlayContractRef],
  ]);
  const rowOf = (kind) => consumerRows.find((row) => row.declarationKind === kind);
  const eventBytesBeforeView = await readFile(eventLogPath);

  // catalog.view over exactly the two declaration rows.
  const declarationAllowlist = [fixture.ids.nodeTypeHandle, fixture.ids.overlayHandle].sort();
  const declarationViewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    { catalog: catalogCoordinate, allowlist: declarationAllowlist },
    { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view declarations");
  assert.deepEqual(declarationViewReceipt.ownerOutput.value.effectiveHandles, declarationAllowlist);
  assert.deepEqual(declarationViewReceipt.ownerOutput.value.residuals, []);
  const declarationView = product.narrowGraphFunctionCatalog(catalog, declarationAllowlist);
  assert.equal(declarationView.kind, "graph_function_catalog_view", JSON.stringify(declarationView).slice(0, 2000));
  assert.deepEqual(declarationViewReceipt.ownerOutput.value.view, viewCoordinate(declarationView));
  assert.equal(declarationView.entries.length, 0);
  assert.deepEqual(Object.keys(declarationView.declarationsByHandle).sort(), declarationAllowlist);
  for (const [kind, handle, contractRef] of [
    ["node_type", fixture.ids.nodeTypeHandle, fixture.ids.nodeTypeContractRef],
    ["overlay", fixture.ids.overlayHandle, fixture.ids.overlayContractRef],
  ]) {
    const row = declarationView.declarationsByHandle[handle];
    assert.equal(row.declarationKind, kind, handle);
    assert.equal(row.declarationOrContractRef, contractRef, handle);
    assert.equal(row.owningProductId, fixture.ids.productId, handle);
    assert.deepEqual(row, rowOf(kind), handle);
  }

  // catalog.apply over each row. A node_type target is a node of a callable
  // Program member, so the application view also holds that member.
  const applicationAllowlist = [fixture.ids.graphFunctionRef, fixture.ids.nodeTypeHandle,
    fixture.ids.overlayHandle].sort();
  const applicationViewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    { catalog: catalogCoordinate, allowlist: applicationAllowlist },
    { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view application");
  assert.deepEqual(applicationViewReceipt.ownerOutput.value.effectiveHandles, applicationAllowlist);
  const applicationView = product.narrowGraphFunctionCatalog(catalog, applicationAllowlist);
  assert.equal(applicationView.kind, "graph_function_catalog_view", JSON.stringify(applicationView).slice(0, 2000));
  assert.deepEqual(applicationViewReceipt.ownerOutput.value.view, viewCoordinate(applicationView));
  const applicationScope = { catalog: catalogCoordinate, view: applicationViewReceipt.ownerOutput.value.view,
    allowlist: applicationAllowlist };
  const schemaAssets = await fixture.loadInstalledSchemaAssets({ installedRoot: installed[1].install.installedRoot });
  const applyRequest = (kind, resources, application) => ({ applicationKind: kind,
    catalogRow: { ref: resources.catalogRow.handle, digest: resources.catalogRow.entryDigest },
    catalogView: viewCoordinate(resources.catalogView),
    declaration: { ref: resources.catalogRow.declarationOrContractRef, digest: resources.catalogRow.entryDigest },
    target: kind === "overlay" ? null : { ref: application.targetRef, digest: application.targetDigest },
    applicationBasis: resources.applicationBasis, validationReceipt: resources.validationReceipt,
    contributor: resources.contributor });
  const constructed = {};
  for (const kind of ["node_type", "overlay"]) {
    const value = fixture.validValues[kind === "node_type" ? "nodeType" : "overlay"][0];
    const targetRef = kind === "node_type" ? fixture.ids.nodeRef : fixture.ids.programRef;
    const { resources, application } = product.constructCatalogApplicationResources({ catalog,
      catalogView: applicationView, catalogRow: rowOf(kind),
      construction: { prefix: closeHandoff.prefix, programRef: fixture.ids.programRef, targetRef, value, schemaAssets } });
    constructed[kind] = { resources, application };
    assert.deepEqual(application.declaration, rowOf(kind));
    assert.equal(application.viewDigest, applicationView.viewDigest);
    assert.equal(application.targetRef, targetRef);
    assert.equal(application.appliedValueDigest, hash(value));
    const request = applyRequest(kind, resources, application);
    const receipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.apply[kind],
      request, resources, { ...boundSlots, catalog_scope: applicationScope }), `catalog.apply ${kind}`);
    const result = receipt.ownerOutput.value;
    assert.equal(result.applicationKind, kind);
    assert.deepEqual(result.application, { ref: application.applicationRef, digest: application.applicationDigest });
    assert.deepEqual(result.target, request.target);
    assert.deepEqual(result.evidence, [resources.validationReceipt, resources.applicationBasis]);
    assert.deepEqual(result.provenance, [resources.contributor]);
    assert.equal(receipt.resources.disposition, "read_only_unchanged");
    assert.deepEqual(receipt.resources.application, result.application);
  }

  // An unknown handle at catalog.view: the Public owner refuses with `unknown`;
  // the native owner it projects refuses with `unknown_allowlist_entry`.
  const unknownAllowlist = [fixture.ids.nodeTypeHandle, UNKNOWN_HANDLE].sort();
  const unknownOutcome = await cliCall(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    { catalog: catalogCoordinate, allowlist: unknownAllowlist },
    { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots));
  assert.equal(unknownOutcome.kind, "installed_definition_call_transport_result", JSON.stringify(unknownOutcome).slice(0, 4000));
  assert.equal(unknownOutcome.receipt.exitCode, 1, JSON.stringify(unknownOutcome.receipt).slice(0, 4000));
  assert.equal(unknownOutcome.receipt.ownerOutput.outcomeKind, "refusal");
  assert.equal(unknownOutcome.receipt.ownerOutput.value.code, "unknown");
  assert.deepEqual(unknownOutcome.receipt.ownerOutput.value.issuePaths, ["/allowlist"]);
  assert.equal(unknownOutcome.receipt.resources.view, null);
  const unknownNative = product.narrowGraphFunctionCatalog(catalog, unknownAllowlist);
  assert.equal(unknownNative.kind, "catalog_construction_refusal");
  assert.equal(unknownNative.code, "unknown_allowlist_entry");

  // The node_type row outside the view at catalog.apply: the Public owner
  // refuses the call at resource admission; the native owner refuses the
  // application with `outside_view`.
  const overlayOnlyAllowlist = [fixture.ids.graphFunctionRef, fixture.ids.overlayHandle].sort();
  const overlayOnlyView = product.narrowGraphFunctionCatalog(catalog, overlayOnlyAllowlist);
  assert.equal(overlayOnlyView.kind, "graph_function_catalog_view", JSON.stringify(overlayOnlyView).slice(0, 2000));
  assert.equal(overlayOnlyView.declarationsByHandle[fixture.ids.nodeTypeHandle], undefined);
  const node = constructed.node_type;
  const outsideResources = { ...structuredClone(node.resources), catalogView: overlayOnlyView };
  const outsideOutcome = await cliCall(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.apply.node_type,
    applyRequest("node_type", outsideResources, node.application), outsideResources,
    { ...boundSlots, catalog_scope: { catalog: catalogCoordinate, view: viewCoordinate(overlayOnlyView),
      allowlist: overlayOnlyAllowlist } }));
  assert.equal(outsideOutcome.kind, "installed_definition_call_transport_result", JSON.stringify(outsideOutcome).slice(0, 4000));
  assert.equal(outsideOutcome.receipt.exitCode, 70, JSON.stringify(outsideOutcome.receipt).slice(0, 4000));
  assert.equal(outsideOutcome.receipt.failure.fault.code, "resource_relation_mismatch");
  assert.match(outsideOutcome.receipt.failure.fault.message, /exact CatalogView row/u);
  const outsideNative = product.applyCatalogDeclaration(overlayOnlyView, { applicationKind: "node_type",
    handle: fixture.ids.nodeTypeHandle, targetRef: node.application.targetRef,
    targetDigest: node.application.targetDigest, appliedValueRef: node.application.appliedValueRef,
    appliedValueDigest: node.application.appliedValueDigest });
  assert.equal(outsideNative.kind, "declaration_application_refusal");
  assert.equal(outsideNative.code, "outside_view");

  // View, apply and both refusals append no event.
  assert.deepEqual(await readFile(eventLogPath), eventBytesBeforeView);
  context.diagnostic(`installed Public chain: ${cliOrdinal} abg.cli calls; views ${declarationAllowlist.length} and ${applicationAllowlist.length} handles; node_type and overlay applied; unknown handle and outside row refused; zero event delta`);
  context.diagnostic(`wall ms: harness pack and CLI host install ${Math.round(harnessMs)}; abg.cli calls ${Math.round(cliMs)}; total ${Math.round(performance.now() - started)}`);
});
