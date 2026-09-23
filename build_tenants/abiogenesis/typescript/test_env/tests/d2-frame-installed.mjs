import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, readdir, lstat, readlink } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
const execFileAsync = promisify(execFile);
const packageRoot = process.env.ABI5_D2_FRAME_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
import { prepareD2FrameProduct, nativePublications, assertD2FrameCatalogInventory, observeFixtureWorksite, installD2FrameActor,
  D2_FRAME_SPECIFICATION, confined } from "../support/d2-frame-fixture.mjs";
// Author-only fixture; opt-in execution belongs to the candidate Worker.
// Retained Public harness composition, not a substitute Program controller.
const territory = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ACTOR = "actor://d2-frame.example/mechanical-fixture";
let installedHarness, admittedContractCatalog, admittedDefinitionContractCoordinates;
let cliOrdinal = 0;
const observedCalls = [];
function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, ACTOR),
    attribution: coordinate(
      product,
      "attribution://d2-frame.example/mechanical-fixture",
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
    timeout: call.invocation.definitionKey.memberKey === "start" ? 3_660_000 : 600_000,
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





test("D2 mechanical installed repair writes two files and snapshots twenty-two", async t => {
  if (process.env.ABI5_D2_FRAME_RUN !== "1") { t.skip("author-only until explicitly selected by candidate Worker"); return; }
  const scratch = process.env.ABI5_D2_FRAME_RUN_ROOT;
  assert.ok(scratch && isAbsolute(scratch) && confined(territory, scratch));
  assert.equal(dirname(resolve(scratch)), territory, "run root must be a new direct child of the isolated implementation");
  assert.ok(relative(territory, scratch).startsWith("installed-frame-"), "new isolated installed-frame-* territory only");
  for (const key of ["ABI5_WAVE1_FROZEN_ARTIFACT_PATH", "ABI5_WAVE1_FROZEN_INSTALL_HOST", "ABI5_WAVE1_FROZEN_ARTIFACT_SHA256"]) assert.ok(process.env[key], key);
  assert.ok(confined(territory, process.env.ABI5_WAVE1_FROZEN_INSTALL_HOST), "immutable builder host must be in this isolated implementation");
  await assert.rejects(() => lstat(scratch), { code: "ENOENT" });
  await mkdir(scratch);
  try {
  const attempt = "01", harnessScratch = join(scratch, "harness");
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: harnessScratch,
    rootPublicationKinds: ["hello_world"],
  });
  installedHarness = { ...harness, scratch: join(scratch, `attempt-${attempt}`) };
  await mkdir(installedHarness.scratch, { recursive: true });
  const product = harness.product;
  const [publicApi, abg, gtl, validator] = await Promise.all(["public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d2-frame-${surface}`)));
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
      authorityMode: "trusted_developer", authority: { ...coord("authority://d2-frame.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://d2-frame.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
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
    for (const child of ["runtime", "projections", "archives"]) {
      const path = join(workspaceRoot, child);
      await assert.rejects(() => lstat(path), { code: "ENOENT" });
      await mkdir(path);
    }
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    const fixture = await prepareD2FrameProduct({ scratch, product, gtl, abiArtifact });
    const fixed = fixture.source;
    const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef,
      ...expectedVerificationIdentity(fixture.basis) };
    const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
      schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
    assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
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
    const eventLogRoot = join(scratch, `events-${attempt}`);
    await mkdir(eventLogRoot);
    const eventLogPath = join(eventLogRoot, "runtime.events.jsonl");
    let closeHandoff = null;
    const installed = [];
    const installTargets = products.map((_, index) => join(scratch, `installed-${attempt}-${index}`));
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
      authorityManifestRef: "manifest://d2-frame.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
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
    const consumerPublications = await fixture.loadInstalledPublications({ installedRoot: installed[1].install.installedRoot, gtl });
    const consumerPublication = consumerPublications.find(p=>p.programs.some(x=>x.programRef===fixture.ids.programRef));
    const programRefs = [fixture.ids.sourceProgramRef, fixture.ids.programRef, fixture.ids.selectionProgramRef, fixture.ids.repairProgramRef];
    const artifactBasis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
      productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
      packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
    const publications = [...nativePublications(gtl,abiArtifact),...consumerPublications];
    const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate),
      dependency_lock: lock, actor: actorAuthority(product) };
    const catalogCall = await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      { workspaceBinding: bound.ownerOutput.value.binding, descriptors: products.map(item => item.packed.descriptor),
        contributionManifests: products.map(item => item.packed.contributionManifest), resolvedLock: lock },
      { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff),
        workspaceBinding: environment.workspaceBinding, resolvedLock, verifiedProducts,
        admittedInstalls: environment.productInstalls, publications }, boundSlots);
    // Resolve every catalog/conformance/installed owner relation before Public dispatch.
    const preparedCatalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(preparedCatalog.kind, "graph_function_catalog", JSON.stringify(preparedCatalog));
    assertD2FrameCatalogInventory(verifiedProducts, publications, preparedCatalog.rowDispositions);
    const preparedAllowlist = preparedCatalog.entries.filter(row => row.programMembershipRefs.some(ref=>programRefs.includes(ref))).map(row => row.handle).sort();
    const preparedView = product.narrowGraphFunctionCatalog(preparedCatalog, preparedAllowlist);
    assert.equal(preparedView.kind, "graph_function_catalog_view");
    const preparedPrograms = [];
    for (const programRef of programRefs) {
      const publication = consumerPublications.find(p=>p.programs.some(x=>x.programRef===programRef));
      const program = publication.programs.find(p=>p.programRef===programRef);
      const closure = product.resolveProgramDeclarationClosure(preparedCatalog,preparedView,programRef);
      assert.equal(closure.kind,"resolved_program_declaration_closure",JSON.stringify(closure));
      assert.deepEqual(closure.programPublication,publication);
      const validationInput = product.constructCatalogProgramValidationInput(preparedCatalog,preparedView,closure,program);
      const validation = validator.validateProgram(validationInput);
      assert.equal(validation.kind,"program_validation",JSON.stringify(validation));
      if (publication.semanticLifecycle !== undefined) {
        const {semanticSourcePublication,...missing} = validationInput;
        assert.ok(semanticSourcePublication);
        assert.equal(validator.validateProgram(missing).kind,"static_validation_refusal","borrowed source owner is required");
        const foreign = structuredClone(semanticSourcePublication.value);
        foreign.requirementHandoffs[0].declarationRef += "/foreign";
        const wrong = validator.rawAdmitValue(foreign,"module_publication","contract://abiogenesis/gtl/module-publication@5");
        assert.equal(wrong.kind,"raw_admitted_value");
        assert.equal(validator.validateProgram({...validationInput,semanticSourcePublication:wrong}).kind,"static_validation_refusal","foreign source owner refuses");
      }
      const resolution = await product.ProductExecutionResolutionPort.resolve({catalog:preparedCatalog,catalogView:preparedView,
        admittedInstalls:environment.productInstalls,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),
        programRef,selection:{kind:"start",scope:"program",target:"next",until:"converged",rootMode:"direct"}});
      assert.equal(resolution.kind,"loaded_product_execution_resolution",JSON.stringify(resolution));
      assert.equal(resolution.resolution.inputContract.contractKind,"input");
      assert.equal(resolution.resolution.outputContract.contractKind,"output");
      preparedPrograms.push({programRef,closure,validation,resolution:resolution.resolution});
    }
    await writeFile(join(installedHarness.scratch,"declaration-preflight.json"),JSON.stringify({preparedCatalog,preparedView,preparedPrograms},null,2)+"\n");
    const catalogReceipt = await invoke(catalogCall, "catalog.admit");
    closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));

    const allowlist = catalog.entries.filter(row => row.programMembershipRefs.some(ref=>programRefs.includes(ref))).map(row => row.handle).sort();
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const applications = [], applicationResources = [];

    const binding = environment.workspaceBinding, A = environment.workspaceAuthorityBasis;
    await mkdir(join(A.canonicalRoot, "app"));
    const actor = await installD2FrameActor(join(installedHarness.scratch, "mechanical-actor.mjs"), scratch);
    process.env.ABG_TS_CLAUDE_COMMAND = actor;
    process.env.ABG_TS_CLAUDE_APPEND_ARGS = "[]";
    process.env.ABG_TS_FP_TIMEOUT_MS = "120000";
    process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = "300000";
    async function invokeProgram(programRef, makeInput, expectedDisposition="completed") {
      const selectedPublication = consumerPublications.find(p=>p.programs.some(x=>x.programRef===programRef));
      const selectedProgram = selectedPublication.programs.find(p=>p.programRef===programRef);
      assert.ok(selectedProgram);
      const selectedLaw = coord("law://abiogenesis/validator/gtl-program@5",{ref:"law://abiogenesis/validator/gtl-program@5"});
      const checked = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
        {program:coord(programRef,selectedProgram),conformanceLaw:selectedLaw,inventoryBasis:{kind:"declared_inventory",inventory:catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},
        {kind:"conformance_evaluation_resource_assertion",schemaVersion,packet:{kind:"conformance_evaluate_packet",schemaVersion,memberKey:"gtl_program",publication:selectedPublication,program:selectedProgram},
          conformanceLaw:selectedLaw,declaredInventory:catalog.boundPublications,declarationCatalog:{catalog,catalogView}},boundSlots),"selected Program conformance");
      assert.equal(checked.ownerOutput.value.disposition,"passed");
      const resolution = await product.ProductExecutionResolutionPort.resolve({catalog,catalogView,admittedInstalls:environment.productInstalls,
        verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),programRef,
        selection:{kind:"start",scope:"program",target:"next",until:"converged",rootMode:"direct"}});
      assert.equal(resolution.kind,"loaded_product_execution_resolution",JSON.stringify(resolution));
      assert.equal(resolution.resolution.inputContract.contractKind,"input");
      assert.equal(resolution.resolution.outputContract.contractKind,"output");
      const packet=product.RUN_OPERATION_CONTRACTS.invoke.start;
      const declaredRegimes=new Set([...resolution.programValidation.executableLeafRows,...resolution.programValidation.interactionLeafRows].map(row=>row.fibre));
      const policy=product.constructRootInvocationPolicy(binding,resolution.program,[],["F_D","F_P","F_H"].filter(regime=>declaredRegimes.has(regime)),applications);
      const grantBasis={admittedInstalls:environment.productInstalls,workspaceBinding:binding,fixedPacket:packet};
      const grants=[product.constructCapabilityGrant(policy,ACTOR,"abg.operation.run.invoke",product.DIRECT_INVOKE_CAPABILITY,grantBasis)];
      const authority=product.constructInvocationAuthority(ACTOR,binding,catalogView,programRef,resolution.selectedCatalogEntry,policy,grants,grantBasis);
      assert.equal(authority.kind,"invocation_authority");
      const input=await makeInput({grants,resolution});
      const inputContract={ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest};
      const admittedInput=product.admitInstalledProductInput(resolution.productSemantics,inputContract.ref,input);
      assert.ok(admittedInput,"installed input admission");
      const raw=validator.rawAdmitValue(admittedInput,"invocation_input",inputContract.ref);assert.equal(raw.kind,"raw_admitted_value");
      const inputCarrier={contract:inputContract,valueRef:`value://d2-frame/${ordinal+1}`,valueDigest:hash(input),value:input};
      const eventResource=reopenEventResource(product,closeHandoff),steeringDigest=hash(eventResource);
      const slots={workspace_binding:boundSlots.workspace_binding,product_set:environment.productInstalls.map(i=>({ref:i.installId,digest:i.productContentDigest})),
        dependency_lock:lock,catalog_scope:catalogScope,execution_program:{ref:programRef,digest:resolution.resolution.programDigest},input_contract:inputCarrier,
        session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},
        actor:{actor:{ref:ACTOR,digest:hash({actorRef:ACTOR})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},
        transport_steering:{ref:`transport-steering://abiogenesis/${steeringDigest.slice(7)}`,digest:steeringDigest}};
      const call=definitionCall({publicApi,product,...packet.definitionKey,ordinal:++ordinal,
        request:{program:slots.execution_program,scope:"program",target:{kind:"next"},until:"converged",catalogView:catalogScope.view,allowlist,input:inputCarrier,fhMode:"direct",rootMode:"direct",sourceBasis:{kind:"none"}},
        slots,resources:{kind:"run_invocation_resource_assertion",schemaVersion,eventResource,catalog,catalogView,applications,applicationResources,source:{kind:"none"}}});
      assert.equal(product.isRunInvocationResourceAssertion(call.resources),true);
      assert.equal(product.constructExactStartInvocation(call.invocation,binding,catalogView,resolution.program,resolution.selectedCatalogEntry,raw,policy,grants,authority).kind,"public_invocation_candidate");
      await writeFile(join(installedHarness.scratch,`program-ready-${ordinal}.json`),JSON.stringify({call,closeHandoff,resolution:resolution.resolution,programRef},null,2)+"\n");
      const preparedInvocation=await product.ProductRunInvocationPort.prepare({memberKey:"start",invocation:call.invocation,
        resources:{catalog,catalogView,applications,source:{kind:"none"}},admittedInstalls:environment.productInstalls,
        workspaceBinding:binding,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(environment.artifactTruth,install),
        transportResourceAssertion:call.resources.eventResource});
      assert.equal(preparedInvocation.kind,"prepared_product_run_invocation",JSON.stringify(preparedInvocation));
      const ran=await invoke(call,programRef);
      closeHandoff=ran.resources.eventResource.closeHandoff;
      await writeFile(join(installedHarness.scratch,"latest-prefix.json"),JSON.stringify(closeHandoff,null,2)+"\n");
      assert.equal(ran.ownerOutput.value.disposition,expectedDisposition,JSON.stringify(ran.ownerOutput));
      const reads={};
      for(const memberKey of ["run_result","run_replay"]){
        const readPacket=abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
        const readGrants=readPacket.metadata.capabilityRefs.map(cap=>product.constructCapabilityGrant(A,ACTOR,readPacket.definitionKey.operationId,cap,
          {admittedInstalls:environment.productInstalls,workspaceBinding:binding,fixedPacket:readPacket}));
        reads[memberKey]=await invoke(definitionCall({publicApi,product,...readPacket.definitionKey,ordinal:++ordinal,
          request:{caseKey:memberKey,source:{sourceKind:"run",sourceRef:ran.ownerOutput.value.run.ref,sourceDigest:ran.ownerOutput.value.run.digest},
            projectionBasis:{projectionBasisRef:closeHandoff.prefix.eventLogRef,projectionBasisDigest:closeHandoff.prefix.coordinateDigest},selector:memberKey==="run_replay"?{kind:"ordinal_page",fromOrdinal:0,limit:10000}:{kind:"none"}},
          slots:{workspace_binding:boundSlots.workspace_binding,product_set:slots.product_set,dependency_lock:lock,capability_grants:{requiredCapabilityRefs:[...readPacket.metadata.capabilityRefs],grants:readGrants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}},
          resources:{kind:"abg_project_read_resource_assertion",schemaVersion,eventResource:reopenEventResource(product,closeHandoff)}}),`fresh ${memberKey}`);
        assert.deepEqual(reads[memberKey].resources.eventResource.closeHandoff.prefix,closeHandoff.prefix);
      }
      assert.deepEqual(reads.run_result.ownerOutput.value.projection.result,ran.ownerOutput.value.result);
      const prefix=abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
      const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,ran.resources.invocationAdmission.ref);
      const resultBasis=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:call.invocation.invocationDigest,runtimeInvocationRef:admission.invocationRef,
        invocationAdmissionRef:ran.resources.invocationAdmission.ref,runId:ran.ownerOutput.value.run.ref,resultRef:ran.ownerOutput.value.result.ref});
      if(expectedDisposition==="completed") assert.ok(resultBasis);
      const result={call,ran,reads,resultBasis,closeHandoff,input};
      await writeFile(join(installedHarness.scratch,`program-result-${ordinal}.json`),JSON.stringify(result,null,2)+"\n");
      return result;
    }
    await writeFile(join(installedHarness.scratch,"setup-ready.json"),JSON.stringify({catalog,catalogView,catalogScope,consumerPublications,environment,boundSlots,lock,closeHandoff,ordinal,fixture:{ids:fixture.ids,source:fixture.source,lifecycle:fixture.lifecycle,scenario:fixture.scenario,oracle:fixture.oracle,basis:fixture.basis},ownerRequest,abiArtifact},null,2)+"\n");
    phase = "source_handoff";
    const source = await invokeProgram(fixture.ids.sourceProgramRef, async () => fixed.input);
    assert.deepEqual(source.resultBasis.sourceResultValue.declaration, fixed.declaration);
    assert.equal(source.resultBasis.sourceResultValue.coverage.obligations.length, 1);
    phase = "initial_declared_bad_construction";
    const initial = await invokeProgram(fixture.ids.programRef, async ({ grants }) =>
      product.constructSemanticStageEnvelope({ sourceHandoff: source.resultBasis.sourceResultValue,
        lifecycle: fixture.lifecycle, taskData: fixture.scenario, evaluationData: fixture.oracle,
        worksite: await observeFixtureWorksite({ product, workspaceAuthorityBasis: A, workspaceBinding: binding,
          capabilityGrant: grants[0], nodeExecutable: process.execPath }) }));
    const history = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const parentEvent = history.filter(e => e.kind === "c_call_result_admitted" &&
      e.payload.value?.kind === "semantic_stage_envelope" && e.payload.value.assets.length === 4 &&
      e.payload.value.assets.every(a => a.assessment?.disposition === "satisfied") &&
      e.payload.value.evidence === null).at(-1);
    assert.ok(parentEvent, "native admitted four-stage Design predecessor");
    const parentValue = parentEvent.payload.value;
    const design = parentValue.assets.at(-1).candidate.worksiteDesign;
    assert.equal(design.targets.length, 22); assert.equal(design.dependencyTargetRefs.length, 20);
    const causesFound = history.filter(e => e.kind === "c_call_result_admitted" &&
      e.payload.value?.kind === "worksite_command_execution_observation");
    assert.equal(causesFound.length, 1, "one actual initial C2 observation");
    const causeEvent = causesFound[0], initialObservation = causeEvent.payload.value;
    assert.notEqual(initialObservation.commandResults[0].exitStatus, 0, "actual failed Node command, not invented counterevidence");
    assert.equal(initialObservation.snapshotMembers.length, 22);
    assert.equal(initialObservation.task.sourceConstructionResult.members.length, 22);
    const coordinateFor = event => {
      const judgment = history.find(e => e.kind === "c_call_judged" && e.aggregateId === event.aggregateId);
      assert.ok(judgment);
      return { cCallRef: event.aggregateId, resultRef: event.payload.resultRef, resultDigest: event.payload.resultDigest,
        resultAdmissionEventRef: event.eventId, judgmentEventRef: judgment.eventId };
    };
    const parent = coordinateFor(parentEvent), causes = [coordinateFor(causeEvent)];
    async function applicationInventory() {
      assert.deepEqual((await readdir(join(A.canonicalRoot, "app"))).sort(), [...D2_FRAME_SPECIFICATION.paths].sort());
      return Promise.all(D2_FRAME_SPECIFICATION.paths.map(async path => {
        const full = join(A.canonicalRoot, "app", path), st = await lstat(full);
        assert.ok(st.isFile() && !st.isSymbolicLink() && st.nlink === 1);
        const bytes = await readFile(full);
        return { path, sha256: createHash("sha256").update(bytes).digest("hex"), byteLength: bytes.length,
          fileIdentity: String(st.dev) + ":" + String(st.ino) };
      }));
    }
    const before = await applicationInventory();
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    assert.deepEqual(await Promise.all(environment.productInstalls.map(i => inventory(i.installedRoot))), installedBefore);
    phase = "native_selection_two";
    const selection = await invokeProgram(fixture.ids.selectionProgramRef, async ({ grants }) => ({
      kind: "semantic_revision_selection_input", schemaVersion, parent, causes,
      currentWorksite: await observeFixtureWorksite({ product, workspaceAuthorityBasis: A, workspaceBinding: binding,
        capabilityGrant: grants[0], nodeExecutable: process.execPath }) }));
    const selectionHistory = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const decisions = selectionHistory.filter(e => e.kind === "c_call_result_admitted" && e.payload.value?.kind === "semantic_revision_selection");
    assert.equal(decisions.length, 1); const decisionEvent = decisions[0], decision = decisionEvent.payload.value;
    const selectedPaths = decision.selectedTargetRefs.map(ref =>
      parentValue.worksite.targets.find(row => row.target.targetRef === ref)?.target.subject.relativePath);
    assert.deepEqual(selectedPaths, ["app/app.mjs", "app/check.mjs"]);
    assert.equal(decision.mode, "construction_repair"); assert.equal(decision.selectedStageRef, null);
    const judgment = selectionHistory.find(e => e.kind === "c_call_judged" && e.aggregateId === decisionEvent.aggregateId);
    assert.ok(judgment);
    const selectionCoordinate = { cCallRef: decisionEvent.aggregateId, resultRef: decisionEvent.payload.resultRef,
      resultDigest: decisionEvent.payload.resultDigest, resultAdmissionEventRef: decisionEvent.eventId, judgmentEventRef: judgment.eventId };
    const beforeRepairEventIds = new Set(selectionHistory.map(e => e.eventId));
    phase = "native_declared_repair_pipeline";
    const repair = await invokeProgram(fixture.ids.repairProgramRef, async ({ grants }) => ({
      kind: "semantic_revision_request", schemaVersion, parent, causes, selection: selectionCoordinate,
      currentWorksite: await observeFixtureWorksite({ product, workspaceAuthorityBasis: A, workspaceBinding: binding,
        capabilityGrant: grants[0], nodeExecutable: process.execPath }) }));
    assert.notDeepEqual(selection.input.currentWorksite.capabilityGrant, repair.input.currentWorksite.capabilityGrant,
      "selection and repair retain independently constructed Program grants");
    assert.deepEqual(product.projectSemanticWorksiteCoordinates(selection.input.currentWorksite, repair.input.currentWorksite),
      repair.input.currentWorksite, "same observed subject through the shared mapper, not whole-grant equality");
    const finalEvents = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    assert.deepEqual(finalEvents.slice(0, history.length), history, "initial counterevidence remains unchanged in the admitted prefix");
    const repairEvents = finalEvents.filter(e => !beforeRepairEventIds.has(e.eventId));
    const admitted = kind => repairEvents.filter(e => e.kind === "c_call_result_admitted" && e.payload.value?.kind === kind);
    const preparations = admitted("worksite_revision_command_preparation_input");
    assert.equal(preparations.length, 1); const entry = preparations[0].payload.value;
    assert.equal(entry.constructionTask.targets.length, 2); assert.equal(entry.snapshotTargetRefs.length, 22);
    assert.equal(entry.dependencyObservations.length, 20);
    const constructions = admitted("worksite_construction_result"); assert.equal(constructions.length, 1);
    assert.equal(constructions[0].payload.value.members.length, 2);
    const replacements = admitted("worksite_file_replace_output"); assert.equal(replacements.length, 2, "exactly two admitted C0 replacements");
    assert.deepEqual(replacements.map(e => e.payload.value.successorObservation.subjectRef).sort(),
      entry.constructionTask.targets.map(t => t.subject.subjectRef).sort(), "C0 writes exactly the selected two subjects");
    const observations = admitted("worksite_revision_command_execution_observation"); assert.equal(observations.length, 1);
    const observation = observations[0].payload.value;
    assert.ok(product.isWorksiteRevisionCommandExecutionObservation(observation));
    assert.equal(product.isWorksiteCommandExecutionObservation(observation), false, "old closed C2 arm stays distinct");
    assert.deepEqual(observation.task.sourceConstructionResult, constructions[0].payload.value);
    assert.equal(observation.snapshotMembers.length, 22);
    assert.equal(observation.snapshotMembers.filter(r => r.source.kind === "construction_member").length, 2);
    assert.equal(observation.snapshotMembers.filter(r => r.source.kind === "retained_dependency").length, 20);
    assert.deepEqual(observation.snapshotMembers.map(r => r.relativePath), D2_FRAME_SPECIFICATION.paths.map(p => "app/" + p));
    for (const row of observation.task.snapshotSources.filter(r => r.source.kind === "retained_dependency")) {
      assert.equal(row.source.origin.kind, "admitted_replacement", "initial C0 is the retained dependency origin");
      const origin = history.find(e => e.eventId === row.source.origin.resultAdmissionEventRef);
      assert.equal(origin?.payload.value?.kind, "worksite_file_replace_output");
      assert.deepEqual(origin.payload.value.successorObservation, row.observation);
      assert.ok(history.some(e => e.eventId === row.source.origin.evidenceEventRef));
    }
    assert.equal(observation.commandResults.length, 1);
    assert.equal(observation.commandResults[0].exitStatus, 0);
    assert.equal(Buffer.from(observation.commandResults[0].stdout.payload, "base64").toString("utf8"), D2_FRAME_SPECIFICATION.stdout);
    assert.equal(Buffer.from(observation.commandResults[0].stderr.payload, "base64").byteLength, 0);
    assert.deepEqual(observation.worksiteDelta, []); assert.deepEqual(observation.productDelta, []);
    const after = await applicationInventory();
    assert.deepEqual(after.slice(2), before.slice(2), "all twenty retained bytes and device/inode identities remain unchanged");
    for (let i = 0; i < 2; i++) assert.notEqual(after[i].sha256, before[i].sha256, "both selected files are meaningful changes");
    const successor = repair.resultBasis.sourceResultValue;
    assert.equal(successor.kind, "semantic_revision_envelope");
    assert.deepEqual(successor.current.assets, parentValue.assets, "no four-stage rerun");
    assert.deepEqual(successor.current.evidence.executionObservation, observation);
    assert.equal(successor.current.applicationCoverage, "non_closing");
    const semanticCalls = repairEvents.filter(e => e.kind === "actor_transport_binding_admitted" && e.payload.instructionAssembly);
    assert.equal(semanticCalls.length, 0, "repair reuses assessed stages; no author or assessor is rerun");
    phase = "independent_process_source_replay";
    const replayCode = "import {readFile} from 'node:fs/promises'; import {pathToFileURL} from 'node:url'; " +
      "const abg=await import(pathToFileURL(process.argv[1]+'/build/code/src/abg/index.js')); " +
      "const handoff=JSON.parse(process.argv[2]),runId=process.argv[3]; " +
      "const events=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix),full=abg.selectValidatedRuntimeEventPrefix(events)," +
      "run=abg.selectValidatedRuntimeEventPrefix(events,{runId});" +
      "const replay=abg.replayValidatedRuntimeEventPrefix(run,full); console.log(JSON.stringify(replay));";
    const fresh = await execFileAsync(process.execPath, ["--input-type=module", "-e", replayCode,
      harness.installedPackageRoot, JSON.stringify(closeHandoff), repair.ran.ownerOutput.value.run.ref],
      { cwd: scratch, env: { ...process.env, NODE_OPTIONS: "" }, timeout: 60000, maxBuffer: 128 * 1024 * 1024 });
    await writeFile(join(installedHarness.scratch, "fresh-source-replay.json"), fresh.stdout, { flag: "wx" });
    const replay = JSON.parse(fresh.stdout);
    const replayObservations = replay.cCalls.filter(c => c.resultValue?.kind === observation.kind);
    assert.equal(replayObservations.length, 1); assert.deepEqual(replayObservations[0].resultValue, observation);
    assert.equal(replay.cCalls.filter(c => c.resultValue?.kind === "worksite_file_replace_output").length, 2);
    assert.deepEqual(await inventory(harness.installedPackageRoot), immutableBefore);
    assert.deepEqual(await Promise.all(environment.productInstalls.map(i => inventory(i.installedRoot))), installedBefore);
    const proof = { disposition: "mechanical_d2_two_write_twenty_two_snapshot_demonstrated", semanticMeaningQualified: false,
      applicationAccepted: false, fixture: D2_FRAME_SPECIFICATION, artifactDigest: abiArtifact.artifactDigest,
      consumerArtifactDigest: fixture.basis.artifactDigest, initial, parent, causes, selection, repair, observation,
      before, after, closeHandoff, freshReplaySha256: createHash("sha256").update(fresh.stdout).digest("hex"), observedCalls };
    await writeFile(join(installedHarness.scratch, "proof.json"), JSON.stringify(proof, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ disposition: proof.disposition, c0Writes: 2, snapshotMembers: 22, retainedMembers: 20,
      stageReruns: 0, semanticMeaningQualified: false, applicationAccepted: false }));
  } catch (error) {
    await writeFile(join(scratch, "first-cause.json"), JSON.stringify({ phase, name: error.name,
      message: error.message, stack: error.stack, observedCalls, preflight }, null, 2) + "\n", { flag: "wx" });
    throw error;
  }
  } catch (error) {
    // Preserve an inner runtime first cause; also retain an earlier setup fault.
    try {
      await writeFile(join(scratch, "first-cause.json"), JSON.stringify({ phase: "installed_fixture_setup",
        name: error.name, message: error.message, stack: error.stack, observedCalls }, null, 2) + "\n", { flag: "wx" });
    } catch (recordError) { if (recordError.code !== "EEXIST") throw recordError; }
    throw error;
  }
});
