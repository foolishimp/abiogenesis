import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, readdir, lstat, readlink, rename, copyFile, chmod } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
import { prepareSerialBranchWorksiteProduct } from "../support/serial-branch-worksite-program.mjs";
const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://parcel-summary.example/developer";
let installedHarness, admittedContractCatalog, admittedDefinitionContractCoordinates;
let cliOrdinal = 0;
const observedCalls = [];
function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, ACTOR),
    attribution: coordinate(
      product,
      "attribution://abiogenesis/t287/w2-05-worker",
    ),
  });
}

function authoritySlots(product, definition, supplied = {}) {
  return Object.freeze({
    workspace_binding: null,
    product_set: null,
    dependency_lock: null,
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [] },
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
    ...supplied,
  });
}

function definitionFor(publicApi, operationId, memberKey) {
  const matches = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) =>
      definition.definitionKey.operationId === operationId &&
      definition.definitionKey.memberKey === memberKey,
  );
  assert.equal(matches.length, 1, `${operationId}#${memberKey}`);
  return matches[0];
}

function definitionCall({
  publicApi,
  product,
  operationId,
  memberKey,
  ordinal,
  request,
  slots = {},
  resources,
}) {
  const definition = definitionFor(publicApi, operationId, memberKey);
  const requestDigest = product.sha256Canonical(request);
  const admittedSlots = authoritySlots(product, definition, slots);
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots: admittedSlots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
  });
  assert.ok(admittedContractCatalog, "installed contract catalog admitted");
  assert.ok(
    admittedDefinitionContractCoordinates,
    "installed definition contract coordinates admitted",
  );
  const operationContracts =
    admittedDefinitionContractCoordinates.operations.find((row) =>
      row.operationId === operationId
    );
  const memberContracts = operationContracts?.members.find((row) =>
    row.memberKey === memberKey
  );
  assert.ok(memberContracts, `${operationId}#${memberKey} contract coordinates`);
  const invocationContract = Object.freeze({
    contractCatalog: admittedContractCatalog,
    flatRow: Object.freeze({
      contractId: "abg.schema.public-operation-invocation",
      contractVersion: schemaVersion,
      contractDigest:
        publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "schema_definition",
      definitionKey: null,
      slot: null,
      definitionRef: "#/$defs/PublicInvocation",
    }),
  });
  const invocationBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract,
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: admittedContractCatalog,
    invocationAuthority,
    requestContract: memberContracts.slots.request,
    requestRef:
      `public-request://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/t287/w2-05-owner-chain",
    eventTime: "2026-08-18T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/t287/w2-05-worker"],
  });
  const invocationDigest = product.sha256Canonical(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}

function rehashInvocation(product, call) {
  call.invocation.requestDigest = product.sha256Canonical(
    call.invocation.request,
  );
  const {
    authorityDigest: _authorityDigest,
    ...authorityBody
  } = call.invocation.invocationAuthority;
  call.invocation.invocationAuthority.authorityDigest =
    product.sha256Canonical(authorityBody);
  const {
    invocationRef: _invocationRef,
    invocationDigest: _invocationDigest,
    ...invocationBody
  } = call.invocation;
  call.invocation.invocationDigest = product.sha256Canonical(invocationBody);
  call.invocation.invocationRef =
    `invocation://abiogenesis/${call.invocation.invocationDigest.slice("sha256:".length)}`;
  return call;
}

async function cliCall(call, acquisition) {
  const path = join(installedHarness.scratch, `call-${++cliOrdinal}.jsonl`);
  await writeFile(path, `${JSON.stringify({
    kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation: call,
  })}\n`);
  const started = Date.now();
  const pending = execFileAsync(installedHarness.cliPath, ["--jsonl", path], {
    cwd: installedHarness.cliHost, env: { ...process.env, NODE_OPTIONS: "" },
    timeout: call.invocation.definitionKey.memberKey === "start" ? 3_660_000 : 60_000,
    maxBuffer: 128 * 1024 * 1024,
  });
  const pid = pending.child.pid;
  await writeFile(join(installedHarness.scratch, `launch-${cliOrdinal}.json`), JSON.stringify({
    pid, started: new Date(started).toISOString(), definitionKey: call.invocation.definitionKey,
  }, null, 2) + "\n");
  let stdout, stderr;
  try { ({ stdout, stderr } = await pending); }
  catch (error) {
    stdout = error.stdout; stderr = error.stderr;
    await writeFile(join(installedHarness.scratch, `transport-error-${cliOrdinal}.json`),
      JSON.stringify({ name: error.name, message: error.message, code: error.code,
        signal: error.signal, killed: error.killed }, null, 2) + "\n");
  }
  await writeFile(join(installedHarness.scratch, `stdout-${cliOrdinal}.json`), stdout ?? "");
  await writeFile(join(installedHarness.scratch, `stderr-${cliOrdinal}.log`), stderr ?? "");
  const outcome = JSON.parse(stdout);
  await writeFile(join(installedHarness.scratch, `receipt-${cliOrdinal}.json`), `${JSON.stringify(outcome, null, 2)}\n`);
  observedCalls.push({
    pid, durationMs: Date.now() - started,
    definitionKey: call.invocation?.definitionKey ?? null,
    invocationRef: call.invocation?.invocationRef ?? null,
    invocationDigest: call.invocation?.invocationDigest ?? null,
    requestSha256: installedHarness.product.sha256Canonical(call),
    acquisitionKind: acquisition.kind,
    outcomeSha256: installedHarness.product.sha256Canonical(outcome),
    transportKind: outcome.kind,
    exitCode: outcome.receipt?.exitCode ?? null,
    code: outcome.code ?? outcome.receipt?.failure?.fault?.code ?? null,
    ownerOutputKind: outcome.receipt?.ownerOutput?.outcomeKind ?? null,
    disposition: outcome.receipt?.ownerOutput?.value?.disposition ?? null,
    closePrefix: outcome.receipt?.resources?.eventResource?.closeHandoff?.prefix ?? null,
  });
  console.log(JSON.stringify({ phase: "public_call", ordinal: cliOrdinal, pid, durationMs: Date.now() - started, definitionKey: call.invocation.definitionKey, exitCode: outcome.receipt?.exitCode ?? null }));
  return outcome;
}
function acquisitionFor(call) {
  const resource = call.resources.eventResource;
  return resource === undefined ? { kind: "eventless" }
    : resource.kind === "new_abg_event_resource"
    ? { kind: "new", eventLogPath: resource.eventLogPath }
    : { kind: "reopen", closeHandoff: resource.closeHandoff };
}
async function runBinding(_binding, call, label) {
  const outcome = await cliCall(call, acquisitionFor(call));
  assert.equal(outcome.kind, "installed_definition_call_transport_result", `${label}: ${JSON.stringify(outcome)}`);
  const value = outcome.receipt;
  assert.equal(value.exitCode, 0, `${label}: ${JSON.stringify(value)}`);
  assert.equal(value.ownerOutput.outcomeKind, "result", label);
  return value;
}

function reopenEventResource(product, closeHandoff) {
  return { kind: "reopen_abg_event_resource", schemaVersion, closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff) };
}
async function inventory(root) {
  const rows = [];
  async function visit(relative) {
    const path = join(root, relative), stat = await lstat(path);
    if (stat.isSymbolicLink()) rows.push([relative, "link", await readlink(path)]);
    else if (stat.isFile()) rows.push([relative, "file", createHash("sha256").update(await readFile(path)).digest("hex")]);
    else if (stat.isDirectory()) for (const name of (await readdir(path)).sort()) await visit(join(relative, name));
  }
  await visit("");
  return { rows, members: rows.length, sha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
}


async function runScenario(t, variantId) {
  const failureCase = variantId === "failed-report-with-independent-suffix";
  cliOrdinal = 0; observedCalls.length = 0;
  const evidenceRoot = process.env.ABI5_STEEL04_EVIDENCE_PATH;
  const scratch = process.env.ABI5_STEEL04_RUN_ROOT;
  if (!evidenceRoot || !scratch || !process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH) {
    t.skip("requires exact frozen artifact, isolated run root and retained evidence path"); return;
  }
  await mkdir(evidenceRoot, { recursive: true });
  await assert.rejects(() => lstat(scratch), { code: "ENOENT" });
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: scratch,
    rootPublicationKinds: ["hello_world", "worksite_construction", "worksite_command_execution"],
  });
  installedHarness = harness;
  const product = harness.product;
  const [publicApi, abg, gtl, validator] = await Promise.all(["public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `steel04-${surface}`)));
  const hash = value => product.sha256Canonical(value);
  const coord = (ref, value) => ({ ref, digest: hash(value) });
  const ownerRequest = { artifactPath: harness.artifactPath, artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis) };
  const ownerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
    schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: ownerRequest });
  assert.equal(ownerVerification.kind, "product_verification_success", JSON.stringify(ownerVerification));
  const abiArtifact = ownerVerification.verifiedArtifact;
  admittedContractCatalog = { productId: abiArtifact.productId, productContentDigest: abiArtifact.productContentDigest,
    catalogId: abiArtifact.catalogId, catalogVersion: schemaVersion, catalogDigest: abiArtifact.catalogDigest };
  admittedDefinitionContractCoordinates = abiArtifact.definitionContractCoordinates;
  let ordinal = 0, environment = null;
  async function authorized(packet, request, resources, supplied = {}) {
    const definition = definitionFor(publicApi, packet.definitionKey.operationId, packet.definitionKey.memberKey);
    const slots = authoritySlots(product, definition, supplied);
    const basis = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null : environment };
    const authorityValue = { actorRef: ACTOR, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: ACTOR, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
    // Explicit external trusted-desktop decision. ABI constructs the resulting grants.
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef: ACTOR,
      authorityMode: "trusted_developer", authority: { ...coord("authority://parcel-summary.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://parcel-summary.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
      authority, ACTOR, definition.definitionKey.operationId, capabilityRef,
      { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data: basis })));
    const call = definitionCall({ publicApi, product, ...definition.definitionKey, ordinal: ++ordinal, request,
      slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
        grants: grants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
      resources: { ...resources, admissionAuthority: { basis, authority, grants } } });
    assert.deepEqual(JSON.parse(JSON.stringify(call)), call, "only data crosses the installed JSON boundary");
    return call;
  }
  const invoke = (call, label) => runBinding(null, call, label);

  let phase = "workspace_create", installedBefore = null, preflight = null;
  const immutableBefore = await inventory(harness.installedPackageRoot);
  try {
    const workspaceRoot = join(scratch, "workspace");
    const workspaceResources = { kind: "workspace_resource_assertion", schemaVersion, targetRoot: workspaceRoot,
      targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) };
    const created = await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources,
      { actor: actorAuthority(product) }), "workspace.create");
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    phase = "consumer_fixture";
    const fixture = await prepareSerialBranchWorksiteProduct({ scratch, product, gtl, abiArtifact,
      abiPublications: harness.rootPublications });
    const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef,
      ...expectedVerificationIdentity(fixture.basis) };
    const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
      schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
    assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
    const consumerArtifact = consumerVerification.verifiedArtifact;
    phase = "verify_resolve_install_bind_catalog";
    const products = [
      { verification: ownerVerification, request: ownerRequest },
      { verification: consumerVerification, request: consumerRequest },
    ];
    for (const item of products) {
      const verified = item.verification.verifiedArtifact;
      item.packed = { kind: "product_verification_artifact_resource", schemaVersion, artifactPath: item.request.artifactPath,
        artifact: { ref: verified.artifactRef, digest: verified.artifactDigest },
        productContent: { ref: `product-content://abiogenesis/${verified.productContentDigest.slice(7)}`, digest: verified.productContentDigest },
        descriptor: item.verification.coordinates.descriptor,
        contributionManifest: { ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest },
        manifestDigest: verified.manifestDigest, productId: verified.productId, packageName: verified.packageName, packageVersion: verified.packageVersion };
      const request = { targetKind: "packed_artifact", artifact: item.packed.artifact,
        productContent: item.packed.productContent, descriptor: item.packed.descriptor,
        contributionManifest: item.packed.contributionManifest, declaredDependencies: verified.declaredDependencies,
        compatibilityInputs: verified.compatibilityRefs.map(compatibilityRef => ({ compatibilityRef, subjectRef: item.packed.productContent.ref })) };
      const call = await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify, request,
        { kind: "product_verification_resources", schemaVersion, targetKind: "packed_artifact", packedArtifact: item.packed });
      item.receipt = await invoke(call, `verify ${verified.productId}`);
      item.reference = { invocation: { ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest },
        outcome: item.receipt.ownerOutput.value.verifiedArtifact };
    }
    const verifiedProducts = products.map(item => item.verification.verifiedArtifact);
    const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion,
      memberKey: "resolve", verifiedArtifacts: verifiedProducts });
    assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
    const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
    const references = products.map(item => item.reference);
    const resolveCall = await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
      { requirements: verifiedProducts.map(item => ({ productId: item.productId, packageVersion: item.packageVersion,
        requiredContractRefs: [], requiredCapabilityRefs: [] })), verifiedCandidates: references },
      { kind: "product_resolution_resource_assertion", schemaVersion,
        verifiedPreimages: products.map(item => ({ verification: item.reference, verifiedArtifact: item.verification.verifiedArtifact,
          verificationOutput: item.receipt.ownerOutput })),
        nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } },
      { verification_references: references });
    const resolved = await invoke(resolveCall, "product.resolve");
    assert.deepEqual(resolved.ownerOutput.value.resolvedLock, lock);
    const eventLogRoot = join(scratch, "events");
    await mkdir(eventLogRoot);
    const eventLogPath = join(eventLogRoot, "runtime.events.jsonl");
    let closeHandoff = null;
    const installed = [];
    const installTargets = products.map((_, index) => join(scratch, `installed-${index}`));
    for (const [index, item] of products.entries()) {
      const eventResource = closeHandoff ? reopenEventResource(product, closeHandoff) : {
        kind: "new_abg_event_resource", schemaVersion, eventLogPath,
        locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) };
      const call = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
        { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor,
          contributionManifest: item.packed.contributionManifest, resolvedLock: lock,
          targetRoot: installTargets[index], installPolicy: "clean" },
        { kind: "product_install_resource_assertion", schemaVersion, eventResource,
          packedArtifact: item.packed, verifiedArtifact: item.verification.verifiedArtifact, resolvedLock },
        { dependency_lock: lock, verification_references: [item.reference], actor: actorAuthority(product) });
      const result = await invoke(call, `product.install ${index}`);
      closeHandoff = result.resources.eventResource.closeHandoff;
      const truth = abg.projectExactPrefixArtifactTruth(closeHandoff.prefix);
      const projection = abg.projectAdmittedProductInstallByInvocationRef(truth, call.invocation.invocationRef);
      assert.ok(projection); installed.push(projection);
    }
    const authorityManifest = { workspaceId: workspaceManifest.workspaceRef, canonicalRoot: workspaceManifest.canonicalRoot,
      authorityMode: "trusted_developer", authorizedActorRef: ACTOR };
    const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
      authorityManifestRef: "manifest://parcel-summary.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
    assert.equal(workspaceAuthority.kind, "workspace_authority_basis");
    const declaredRoots = { toolchainRoot: installTargets[0], productRoot: installed[1].install.installedRoot,
      eventLogRoot: dirname(eventLogPath), runtimeStateRoot: join(workspaceRoot, "runtime"),
      projectionRoot: join(workspaceRoot, "projections"), archiveRoot: join(workspaceRoot, "archives") };
    const rootFields = { toolchain: "toolchainRoot", product: "productRoot", event_log: "eventLogRoot",
      runtime_state: "runtimeStateRoot", projection: "projectionRoot", archive: "archiveRoot" };
    const installCoordinates = installed.map(row => product.productInstallCoordinate(row.install));
    const bindCall = await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
      { workspaceAuthority: { ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest },
        installedSet: installCoordinates, resolvedLock: lock,
        declaredRoots: Object.entries(rootFields).map(([rootKind, field]) => ({ rootKind, path: declaredRoots[field] })) },
      { kind: "product_workspace_binding_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceAuthority, workspaceManifest, admittedInstalls: installed.map(row => row.install), resolvedLock, declaredRoots },
      { product_set: installCoordinates, dependency_lock: lock, actor: actorAuthority(product) });
    const bound = await invoke(bindCall, "workspace.bind");
    closeHandoff = bound.resources.eventResource.closeHandoff;
    environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
    assert.equal(environment.kind, "exact_prefix_workspace_environment");
    installedBefore = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    const consumerPublication = await fixture.loadInstalledPublication({ installedRoot: installed[1].install.installedRoot, gtl });
    const artifactBasis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
      productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
      packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
    const publications = [harness.rootPublication, gtl.constructConsensusModulePublication(artifactBasis),
      gtl.constructWorksiteConstructionModulePublication(artifactBasis), gtl.constructWorksiteCommandExecutionModulePublication(artifactBasis), consumerPublication];
    const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate),
      dependency_lock: lock, actor: actorAuthority(product) };
    const catalogCall = await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      { workspaceBinding: bound.ownerOutput.value.binding, descriptors: products.map(item => item.packed.descriptor),
        contributionManifests: products.map(item => item.packed.contributionManifest), resolvedLock: lock },
      { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
        admittedInstalls: environment.productInstalls, publications }, boundSlots);
    const catalogReceipt = await invoke(catalogCall, "catalog.admit");
    closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));

    const allowlist = catalog.entries.filter(row => row.programMembershipRefs.includes(fixture.ids.programRef)).map(row => row.handle).sort();
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const applications = [], applicationResources = [];
    const program = consumerPublication.programs.find(row => row.programRef === fixture.ids.programRef);
    phase = "conformance";
    const law = coord("law://abiogenesis/validator/gtl-program@5", { ref: "law://abiogenesis/validator/gtl-program@5" });
    const conformance = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(program.programRef, program), conformanceLaw: law,
        inventoryBasis: { kind: "declared_inventory", inventory: publications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion,
        memberKey: "gtl_program", publication: consumerPublication, program }, conformanceLaw: law,
        declaredInventory: publications,
        declarationCatalog: { catalog, catalogView } }, boundSlots), "conformance.evaluate");
    assert.equal(conformance.ownerOutput.value.disposition, "passed", JSON.stringify(conformance.ownerOutput));
    phase = "installed_owner_resolution";
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const runPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const binding = environment.workspaceBinding, A = environment.workspaceAuthorityBasis;
    assert.equal(binding.roots.productRoot, installed[1].install.installedRoot);
    assert.equal(binding.roots.toolchainRoot, installTargets[0]);
    assert.notEqual(A.canonicalRoot, binding.roots.productRoot);
    assert.notEqual(installed[0].install.installedRoot, installed[1].install.installedRoot);
    const policy = product.constructRootInvocationPolicy(binding, resolution.program, [], ["F_D", "F_P"], applications);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: runPacket };
    const grants = [product.constructCapabilityGrant(policy, ACTOR, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(ACTOR, binding, catalogView, program.programRef,
      resolution.selectedCatalogEntry, policy, grants, grantBasis);
    assert.equal(authority.kind, "invocation_authority");
    phase = "input_and_authority_preflight";
    const branches = failureCase ? [...fixture.specification.branches, fixture.specification.failureVariant.independentSuffix] : fixture.specification.branches;
    const targetPaths = branches.map(branch => join(A.canonicalRoot, branch.targetRelativePath));
    const protectedRoots = [...new Set([...Object.values(binding.roots), ...environment.productInstalls.map(row => row.installedRoot)])];
    const confined = (root, target) => { const suffix = relative(root, target); return suffix === "" ||
      (!isAbsolute(suffix) && suffix !== ".." && !suffix.startsWith(".." + sep)); };
    for (const root of protectedRoots) {
      assert.equal(confined(root, A.canonicalRoot), false, `canonical worksite is inside protected root ${root}`);
      for (const targetPath of targetPaths) assert.equal(confined(root, targetPath), false, `authored target is inside protected root ${root}`);
    }
    const targets = [];
    for (const [index, branch] of branches.entries()) {
      await mkdir(dirname(targetPaths[index]), { recursive: true });
      const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis: A, workspaceBinding: binding,
        subjectUri: pathToFileURL(targetPaths[index]).href, relativePath: branch.targetRelativePath });
      assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
      const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis: A, workspaceBinding: binding,
        territoryUri: pathToFileURL(dirname(targetPaths[index])).href, relativeRoot: fixture.specification.relativeCwd });
      assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
      const predecessorObservation = await product.observeWorksiteSubject(A, binding, subject);
      assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
      targets.push({ subject, territory, predecessorObservation });
    }
    const selected = fixture.constructInput({ configurationId: "mixed-loads", variantId, workspaceAuthorityBasis: A,
      workspaceBinding: binding, capabilityGrant: grants[0], targets, nodeExecutable: process.execPath });
    const input = selected.input;
    const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
    const admittedInput = product.admitInstalledProductInput(resolution.productSemantics, inputContract.ref, input);
    assert.ok(admittedInput, "actual installed semantics admits the complete preparation input");
    const rawInput = validator.rawAdmitValue(admittedInput, "invocation_input", inputContract.ref);
    assert.equal(rawInput.kind, "raw_admitted_value");
    const inputCarrier = { contract: inputContract, valueRef: "value://parcel-summary.example/mixed-loads/input",
      valueDigest: hash(input), value: input };
    const eventResource = reopenEventResource(product, closeHandoff), steeringDigest = hash(eventResource);
    const runSlots = { workspace_binding: boundSlots.workspace_binding,
      product_set: environment.productInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: lock, catalog_scope: catalogScope,
      execution_program: { ref: program.programRef, digest: resolution.resolution.programDigest },
      input_contract: inputCarrier, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...runPacket.metadata.capabilityRefs], grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
      actor: { actor: { ref: ACTOR, digest: hash({ actorRef: ACTOR }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest } };
    const runCall = definitionCall({ publicApi, product, ...runPacket.definitionKey, ordinal: ++ordinal,
      request: { program: runSlots.execution_program, scope: "program", target: { kind: "next" }, until: "converged",
        catalogView: catalogScope.view, allowlist, input: inputCarrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } },
      slots: runSlots, resources: { kind: "run_invocation_resource_assertion", schemaVersion, eventResource,
        catalog, catalogView, applications, applicationResources, source: { kind: "none" } } });
    assert.equal(product.isRunInvocationResourceAssertion(runCall.resources), true,
      "exact run resources satisfy the installed owner structural schema before start");
    const invocation = product.constructExactStartInvocation(runCall.invocation, binding, catalogView, resolution.program,
      resolution.selectedCatalogEntry, rawInput, policy, grants, authority);
    assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
    const helperMember = "build/code/src/implementation/worksite_command_helper.js";
    const helperPackageRoot = join(environment.workspaceBinding.roots.toolchainRoot,
      "node_modules", "@abiogenesis", "typescript-tenant");
    assert.equal(helperPackageRoot, installed[0].install.installedRoot);
    const helperPath = join(helperPackageRoot, helperMember);
    assert.equal((await lstat(helperPath)).isFile(), true);
    const helperSha256 = createHash("sha256").update(await readFile(helperPath)).digest("hex");
    const helperOwnerIndex = environment.productInstalls.findIndex(install => install.installId === installed[0].install.installId);
    assert.ok(helperOwnerIndex >= 0);
    assert.deepEqual(installedBefore[helperOwnerIndex].rows.find(row => row[0] === helperMember),
      [helperMember, "file", helperSha256]);
    const c2Helper = { toolchainRoot: environment.workspaceBinding.roots.toolchainRoot,
      implementationOwnerInstallId: installed[0].install.installId, packageRoot: helperPackageRoot,
      helperPath, helperSha256 };
    const installedNow = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    assert.deepEqual(installedNow, installedBefore);
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    let deterministicInput = null;
    if (failureCase) {
      const successRoot = process.env.ABI5_STEEL04_SUCCESS_ROOT;
      assert.ok(successRoot, "deterministic failure requires the actual retained live success");
      const successResultPath = join(successRoot, "result.json");
      const successResultBytes = await readFile(successResultPath);
      const successResult = JSON.parse(successResultBytes.toString("utf8"));
      assert.equal(successResult.variantId, "success");
      assert.equal(successResult.preflight.artifactSha256, process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256);
      const sourceA = successResult.generatedFiles.find(row => row.relativePath === branches[0].targetRelativePath);
      assert.ok(sourceA);
      const sourceBytes = await readFile(join(successRoot, "workspace", sourceA.relativePath));
      assert.equal(createHash("sha256").update(sourceBytes).digest("hex"), sourceA.sha256);
      const task = selected.input.constructionTask;
      const targetRefs = task.branches.map(branch => branch.constructionTask.targets[0].targetRef);
      assert.equal(targetRefs.length, 3);
      const command = join(evidenceRoot, "deterministic-transport.mjs");
      const fixtureSource = [
        "#!/usr/bin/env node",
        "let prompt = ''; process.stdin.setEncoding('utf8');",
        "process.stdin.on('data', value => { prompt += value; });",
        "process.stdin.on('end', () => {",
        "  if (!prompt) throw new Error('missing C1 prompt');",
        "  const index = process.argv.indexOf('--json-schema');",
        "  if (index < 0) throw new Error('missing C1 response schema');",
        "  const schema = JSON.parse(process.argv[index + 1]);",
        "  const selected = schema.properties.files.items.properties.targetRef;",
        "  const refs = selected.enum ?? [selected.const];",
        `  const targetRefs = ${JSON.stringify(targetRefs)};`,
        "  if (refs.length !== 1) throw new Error('expected one exact branch target');",
        "  process.stdout.write(JSON.stringify({type:'system',subtype:'init',model:'deterministic-thread4-transport'}) + String.fromCharCode(10));",
        "  if (refs[0] === targetRefs[1]) { process.stderr.write('STEEL04_CONTROLLED_B_EXIT' + String.fromCharCode(10)); process.exitCode = 73; return; }",
        "  if (refs[0] !== targetRefs[0]) { process.stderr.write('STEEL04_UNEXPECTED_TARGET' + String.fromCharCode(10)); process.exitCode = 74; return; }",
        `  const replacementBase64 = ${JSON.stringify(sourceBytes.toString("base64"))};`,
        "  const value = {kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:[{kind:'worksite_candidate_file',schemaVersion:'5.0.0',targetRef:refs[0],replacementBase64}]};",
        "  process.stdout.write(JSON.stringify({type:'result',subtype:'success',result:JSON.stringify(value)}) + String.fromCharCode(10));",
        "});", "",
      ].join("\n");
      await writeFile(command, fixtureSource, { flag: "wx" }); await chmod(command, 0o755);
      process.env.ABG_TS_CLAUDE_COMMAND = command;
      deterministicInput = { sourceResultPath: successResultPath, sourceResultSha256: createHash("sha256").update(successResultBytes).digest("hex"),
        ordinaryCandidateSha256: sourceA.sha256, targetRefs, command, commandSha256: createHash("sha256").update(fixtureSource).digest("hex") };
    }
    preflight = { disposition: "installed_preflight_passed", artifactSha256: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256,
      fixture: fixture.basis, environment, catalog, catalogView, publications, resolution: resolution.resolution,
      programValidation: resolution.programValidation, input, selectedOracle: selected.oracle, commands: selected.commands,
      predicates: selected.outcomePredicates, failureOracle: selected.failureOracle, variantId, deterministicInput, runCall, invocation, closeHandoff, immutableBefore, installedBefore, c2Helper,
      runtime: { command: process.env.ABG_TS_CLAUDE_COMMAND, appendArgs: process.env.ABG_TS_CLAUDE_APPEND_ARGS,
        inactivityMs: process.env.ABG_TS_FP_TIMEOUT_MS, absoluteMs: process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS } };
    await writeFile(join(scratch, "preflight.json"), JSON.stringify(preflight, null, 2) + "\n", { flag: "wx" });
    await writeFile(join(evidenceRoot, "attempt.json"), JSON.stringify({ scratch, phase: preflight.disposition,
      preflightSha256: createHash("sha256").update(await readFile(join(scratch, "preflight.json"))).digest("hex") }, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ phase: preflight.disposition, scratch, callables: program.callableMembership.length,
      leaves: resolution.programValidation.executableLeafRows.length, installedMembers: installedBefore.map(row => row.members) }));
    if (process.env.ABI5_STEEL04_RUN_LIVE !== "1") return;
    if (!failureCase) assert.equal(process.env.ABG_TS_CLAUDE_COMMAND, "/Users/jim/.local/bin/claude");
    assert.equal(process.env.ABG_TS_CLAUDE_APPEND_ARGS, '["--effort","medium"]');
    assert.equal(process.env.ABG_TS_FP_TIMEOUT_MS, "900000");
    assert.equal(process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS, "3600000");
    // The actual installed consumer publication/oracle are already loaded and
    // bound. Preserve the authoring package under an unavailable source route.
    await copyFile(fixture.artifactPath, join(scratch, "consumer-artifact.tgz"));
    await rename(fixture.sourceRoot, fixture.sourceRoot + ".retained-unavailable");
    phase = failureCase ? "one_start_deterministic_failure" : "one_start_live";
    console.log(JSON.stringify({ phase, scratch, invocationRef: runCall.invocation.invocationRef }));
    const ran = await invoke(runCall, "one consumer start");
    if (!failureCase) {
      assert.equal(ran.ownerOutput.value.disposition, "completed", JSON.stringify(ran.ownerOutput));
      assert.ok(ran.ownerOutput.value.result);
    } else assert.notEqual(ran.ownerOutput.value.disposition, "completed");
    closeHandoff = ran.resources.eventResource.closeHandoff;
    phase = "fresh_reads";
    const reads = {};
    const hasRootResult = ran.ownerOutput.value.result !== null;
    if (failureCase) assert.equal(hasRootResult, false);
    for (const memberKey of [hasRootResult ? "run_result" : "run_status", "run_replay"]) {
      const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
      const readGrants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
        A, ACTOR, packet.definitionKey.operationId, capabilityRef,
        { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet }));
      reads[memberKey] = await invoke(definitionCall({ publicApi, product, ...packet.definitionKey, ordinal: ++ordinal,
        request: { caseKey: memberKey,
          source: { sourceKind: "run", sourceRef: ran.ownerOutput.value.run.ref, sourceDigest: ran.ownerOutput.value.run.digest },
          projectionBasis: { projectionBasisRef: closeHandoff.prefix.eventLogRef, projectionBasisDigest: closeHandoff.prefix.coordinateDigest },
          selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } },
        slots: { workspace_binding: boundSlots.workspace_binding, product_set: runSlots.product_set, dependency_lock: lock,
          capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: readGrants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
        resources: { kind: "abg_project_read_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff) } }), `fresh ${memberKey}`);
      assert.deepEqual(reads[memberKey].resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
    }
    if (hasRootResult) assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, ran.ownerOutput.value.result);
    else assert.equal(reads.run_status.ownerOutput.value.projection.status, "failed");
    const durableEvents = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const prefix = abg.selectValidatedRuntimeEventPrefix(durableEvents);
    const runId = ran.ownerOutput.value.run.ref;
    const replay = abg.replayValidatedRuntimeEventPrefix(abg.selectValidatedRuntimeEventPrefix(durableEvents, { runId }), prefix);
    const semantic = abg.projectRunSemanticReplayProjection(prefix, runId);
    assert.deepEqual(reads.run_replay.ownerOutput.value.projection.replay,
      { ref: replay.replayRef, digest: replay.replayDigest });
    assert.deepEqual(ran.ownerOutput.value.replay, reads.run_replay.ownerOutput.value.projection.replay);
    const c3 = product.WORKSITE_BRANCH_CONSTRUCTION_IDS, c1 = product.WORKSITE_CONSTRUCTION_IDS;
    const c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
    const outerRows = replay.fanOutCompletions.filter(row => row.applicationRef === c3.fanOutApplicationRef);
    assert.equal(outerRows.length, 1);
    const outer = outerRows[0];
    const sourceRows = semantic.ownerFacts.filter(row => row.owner === "same_run_source_result");
    const c0Successes = durableEvents.filter(event => event.runId === runId && event.kind === "c_call_result_admitted" &&
      event.graphFunctionRef === c1.fileReplaceGraphFunctionRef && event.payload.resultClass === "success");
    const c1Successes = durableEvents.filter(event => event.runId === runId && event.kind === "c_call_result_admitted" &&
      event.graphFunctionRef === c1.graphFunctionRef && event.payload.resultClass === "success" &&
      event.payload.value?.kind === "worksite_construction_result" &&
      durableEvents.some(fold => fold.kind === "child_foldback_admitted" && fold.runId === runId &&
        fold.payload.childExecutionBasisRef === event.basisId && fold.payload.childDisposition === "closed" &&
        fold.payload.childResultRef === event.payload.resultRef &&
        durableEvents.some(closed => closed.eventId === fold.payload.childTerminalEventRef &&
          closed.kind === "graph_call_closed" && closed.basisId === event.basisId)));
    let resultBasis = null;
    if (!failureCase) {
      const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, ran.resources.invocationAdmission.ref);
      resultBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: runCall.invocation.invocationDigest,
        runtimeInvocationRef: admission.invocationRef, invocationAdmissionRef: ran.resources.invocationAdmission.ref,
        runId, resultRef: ran.ownerOutput.value.result.ref });
      assert.ok(resultBasis);
      const observation = resultBasis.sourceResultValue;
      assert.equal(observation.kind, "worksite_command_execution_observation");
      assert.equal(observation.commandResults.length, 4);
      assert.equal(observation.predicateObservations.length, 8);
      for (const expected of selected.outcomePredicates) {
        const actual = observation.predicateObservations.find(row => row.predicateId === expected.predicateId);
        assert.ok(actual); assert.equal(actual.observedValue, expected.declaration.equals);
      }
      for (const command of observation.commandResults) {
        assert.equal(command.exitStatus, 0); assert.equal(command.timedOut, false);
        assert.equal(command.terminationConfirmed, true); assert.equal(command.stderr.byteLength, 0);
      }
      assert.deepEqual(observation.productDelta, []); assert.deepEqual(observation.worksiteDelta, []);
      assert.equal(observation.provenance.toolCallCount, 1);
      assert.equal(outer.completionKind, "complete_vector");
      assert.deepEqual(outer.taskRows.map(row => row.ordinal), [0, 1]);
      assert.equal(c0Successes.length, 2); assert.equal(c1Successes.length, 2);
      assert.equal(sourceRows.length, 1);
      assert.equal(sourceRows[0].sourceResultBasis.sourceGraphFunctionRef, c3.reducerGraphFunctionRef);
      assert.equal(durableEvents.filter(event => event.runId === runId && event.kind === "run_closed").length, 1);
    } else {
      assert.equal(replay.runtimeStatus, "failed");
      assert.equal(outer.completionKind, "partial_stop");
      assert.deepEqual(outer.completedRows.map(row => row.ordinal), [0]);
      assert.equal(outer.stoppingRow.ordinal, 1);
      assert.deepEqual(outer.unstartedRows.map(row => row.ordinal), [2]);
      assert.deepEqual(branches[2].dependsOn, []);
      assert.equal(Object.hasOwn(outer, "outputVector"), false);
      assert.equal(c0Successes.length, 1); assert.equal(c1Successes.length, 1);
      assert.equal(sourceRows.length, 0);
      for (const ref of [c3.reducerGraphFunctionRef, c2.graphFunctionRef])
        assert.equal(durableEvents.some(event => event.runId === runId && event.kind === "graph_call_opened" && event.graphFunctionRef === ref), false);
      assert.equal(durableEvents.some(event => event.runId === runId && event.kind === "c_call_opened" && event.payload.nodeRef === fixture.ids.prepareNodeRef), false);
      assert.equal(durableEvents.some(event => event.runId === runId && event.kind === "run_closed"), false);
      const actors = durableEvents.filter(event => event.runId === runId && event.kind === "actor_process_started");
      assert.equal(actors.length, 2);
      for (const [index, target] of targets.entries()) if (index > 0)
        assert.deepEqual(await product.observeWorksiteSubject(A, binding, target.subject), target.predecessorObservation);
      assert.equal(createHash("sha256").update(await readFile(targetPaths[0])).digest("hex"), deterministicInput.ordinaryCandidateSha256);
    }
    const installedAfter = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
    assert.deepEqual(installedAfter, installedBefore);
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    const generatedFiles = [];
    for (const [index, branch] of branches.entries()) {
      if (failureCase && index > 0) continue;
      generatedFiles.push({ relativePath: branch.targetRelativePath,
        sha256: createHash("sha256").update(await readFile(targetPaths[index])).digest("hex") });
    }
    const proof = { disposition: "awaiting_outcome_review", variantId, preflight, runReceipt: ran, reads, resultBasis,
      replay, semantic, closeHandoff, observedCalls, installedAfter, immutableAfter: await inventory(harness.installedPackageRoot), generatedFiles };
    await writeFile(join(scratch, "result.json"), JSON.stringify(proof, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ phase: proof.disposition, scratch, runRef: ran.ownerOutput.value.run.ref,
      resultRef: ran.ownerOutput.value.result?.ref ?? null, resultKind: resultBasis?.sourceResultValue.kind ?? "deterministic_partial_stop" }));
  } catch (error) {
    const failure = { disposition: "first_causal_failure", phase, name: error.name, message: error.message, stack: error.stack,
      scratch, observedCalls, preflightPath: preflight ? join(scratch, "preflight.json") : null,
      immutableBefore, immutableAfter: await inventory(harness.installedPackageRoot), installedBefore,
      installedAfter: environment ? await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot))) : null };
    await writeFile(join(scratch, "first-cause.json"), JSON.stringify(failure, null, 2) + "\n", { flag: "wx" });
    await writeFile(join(evidenceRoot, "first-cause.json"), JSON.stringify({ disposition: failure.disposition,
      phase, scratch, record: join(scratch, "first-cause.json"), sha256: createHash("sha256").update(await readFile(join(scratch, "first-cause.json"))).digest("hex") }, null, 2) + "\n", { flag: "wx" });
    throw new Error(`Thread 4 stopped at ${phase}; first cause retained at ${join(scratch, "first-cause.json")}`);
  }
}

test("Thread 4 live success", async t => runScenario(t, "success"));
test("Thread 4 deterministic partial stop", async t => runScenario(t, "failed-report-with-independent-suffix"));
