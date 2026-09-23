import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, readdir, lstat, readlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
import { prepareNeutralSchemaProduct } from "../support/neutral-schema-product.mjs";
const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://neutral-schema.example/developer";
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
  let stdout;
  try { ({ stdout } = await execFileAsync(installedHarness.cliPath, ["--jsonl", path], {
    cwd: installedHarness.cliHost, env: { ...process.env, NODE_OPTIONS: "" },
    timeout: 60_000, maxBuffer: 20 * 1024 * 1024,
  })); } catch (error) { stdout = error.stdout; }
  const outcome = JSON.parse(stdout);
  await writeFile(join(installedHarness.scratch, `receipt-${cliOrdinal}.json`), `${JSON.stringify(outcome, null, 2)}\n`);
  observedCalls.push({
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
  return { members: rows.length, sha256: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
}

test("Thread 2: independent data-only declarations through actual installed Public", async t => {
  const evidenceRoot = process.env.ABI5_STEEL02_EVIDENCE_PATH;
  if (!evidenceRoot || !process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH) {
    t.skip("requires exact frozen artifact/install and a fresh retained evidence directory"); return;
  }
  await mkdir(evidenceRoot, { recursive: true });
  const scratch = join(evidenceRoot, `attempt-${Date.now()}-${process.pid}`);
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: scratch,
  });
  installedHarness = harness;
  const product = harness.product;
  const [publicApi, abg, gtl, validator] = await Promise.all(["public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `steel02-${surface}`)));
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
      authorityMode: "trusted_developer", authority: { ...coord("authority://neutral-schema.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://neutral-schema.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
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
  try {
    const immutableBefore = await inventory(harness.installedPackageRoot);
    const workspaceRoot = join(scratch, "workspace");
    const workspaceResources = { kind: "workspace_resource_assertion", schemaVersion, targetRoot: workspaceRoot,
      targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) };
    const createCall = await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources,
      { actor: actorAuthority(product) });
    const crossedCreate = structuredClone(createCall);
    crossedCreate.resources.admissionAuthority.basis.definition.owner.digest = `sha256:${"0".repeat(64)}`;
    const crossedOutcome = await cliCall(crossedCreate, { kind: "eventless" });
    assert.equal(crossedOutcome.receipt.exitCode, 70);
    await assert.rejects(lstat(workspaceRoot), { code: "ENOENT" });
    const created = await invoke(createCall, "workspace.create");
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    const fixture = await prepareNeutralSchemaProduct({ scratch, product, gtl,
      abiPublication: harness.rootPublication, abiArtifact });
    const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef,
      ...expectedVerificationIdentity(fixture.basis) };
    const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet",
      schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
    assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
    const neutralArtifact = consumerVerification.verifiedArtifact;
    const flatGraphCoordinates = artifact => artifact.publicContracts.map(row => ({
      contractCatalog: { productId: artifact.productId, productContentDigest: artifact.productContentDigest,
        catalogId: artifact.catalogId, catalogVersion: schemaVersion, catalogDigest: artifact.catalogDigest },
      flatRow: { contractId: row.contractId, contractVersion: row.contractVersion, contractDigest: row.contractDigest },
      nestedSelector: { selectorKind: "flat_contract", definitionKey: null, slot: null, definitionRef: null },
    }));
    const neutralCoordinates = flatGraphCoordinates(neutralArtifact);
    assert.equal(neutralCoordinates.length, 2);
    assert.deepEqual(product.constructCapabilityDefinitionGraph(neutralCoordinates).rows, []);
    assert.throws(() => product.constructCapabilityDefinitionGraph([...neutralCoordinates, neutralCoordinates[0]]), /duplicate/u);
    const abiCoordinates = flatGraphCoordinates(abiArtifact);
    const definitionCoordinates = abiArtifact.definitionContractCoordinates.operations.flatMap(operation =>
      operation.members.flatMap(member => [member.slots.request, member.slots.result, member.slots.refusal,
        ...(member.slots.nonTerminal === null ? [] : [member.slots.nonTerminal])]));
    assert.throws(() => product.constructCapabilityDefinitionGraph(abiCoordinates.filter(row =>
      row.flatRow.contractId !== "abg.operation.catalog.admit")), /missing graph owner/u);
    const crossedGraphCoordinates = structuredClone([...abiCoordinates, ...definitionCoordinates]);
    crossedGraphCoordinates.find(row => row.flatRow.contractId === "abg.operation.catalog.admit" &&
      row.nestedSelector.selectorKind === "flat_contract").contractCatalog.productId = neutralArtifact.productId;
    assert.throws(() => product.constructCapabilityDefinitionGraph(crossedGraphCoordinates), /crossed operation definition catalog/u);
    const graphNegatives = ["duplicate neutral coordinate", "missing ABI graph owner", "crossed ABI graph owner"];
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
    const eventLogPath = join(scratch, "runtime.events.jsonl");
    let closeHandoff = null;
    const installed = [];
    for (const [index, item] of products.entries()) {
      const eventResource = closeHandoff ? reopenEventResource(product, closeHandoff) : {
        kind: "new_abg_event_resource", schemaVersion, eventLogPath,
        locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) };
      const call = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
        { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor,
          contributionManifest: item.packed.contributionManifest, resolvedLock: lock,
          targetRoot: join(scratch, `installed-${index}`), installPolicy: "clean" },
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
      authorityManifestRef: "manifest://neutral-schema.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
    assert.equal(workspaceAuthority.kind, "workspace_authority_basis");
    const declaredRoots = { toolchainRoot: harness.installedPackageRoot, productRoot: installed[1].install.installedRoot,
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
    const installedBefore = await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot)));
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
    const invalidMembershipBasis = structuredClone(catalog.readinessBasis);
    invalidMembershipBasis.publications.find(p => p.owningProductId === fixture.ids.productId)
      .contributions.find(row => row.kind === "node_type").programMembershipRefs = [fixture.ids.programRef];
    const invalidMembership = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion,
      memberKey: "admit", readinessBasis: invalidMembershipBasis });
    assert.equal(invalidMembership.kind, "catalog_validation_refusal");
    assert.ok(invalidMembership.validation.diagnostics.some(row => row.code === "invalid_contribution" &&
      row.message === "node_type contributions cannot carry callable Program membership"));
    const consumerRows = catalog.declarationEntries.filter(row => row.owningProductId === consumerVerification.verifiedArtifact.productId);
    assert.equal(consumerRows.length, 2);
    const allowlist = [...catalog.entries.filter(row => row.programMembershipRefs.includes(fixture.ids.programRef)).map(row => row.handle),
      ...consumerRows.map(row => row.handle)].sort();
    const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const schemaAssets = await fixture.loadInstalledSchemaAssets({ installedRoot: installed[1].install.installedRoot });
    const applications = [], applicationResources = [];
    for (const kind of ["node_type", "overlay"]) {
      const catalogRow = consumerRows.find(row => row.declarationKind === kind);
      const value = fixture.validValues[kind === "node_type" ? "nodeType" : "overlay"][0];
      const constructed = product.constructCatalogApplicationResources({ catalog, catalogView, catalogRow,
        construction: { prefix: closeHandoff.prefix, programRef: fixture.ids.programRef,
          targetRef: kind === "node_type" ? fixture.ids.nodeRef : fixture.ids.programRef, value, schemaAssets } });
      const resources = constructed.resources, application = constructed.application;
      const request = { applicationKind: kind, catalogRow: { ref: catalogRow.handle, digest: catalogRow.entryDigest },
        catalogView: catalogScope.view, declaration: { ref: catalogRow.declarationOrContractRef, digest: catalogRow.entryDigest },
        target: kind === "overlay" ? null : { ref: application.targetRef, digest: application.targetDigest },
        applicationBasis: resources.applicationBasis, validationReceipt: resources.validationReceipt, contributor: resources.contributor };
      const call = await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.apply[kind], request, resources,
        { ...boundSlots, catalog_scope: catalogScope });
      const applied = await invoke(call, `catalog.apply ${kind}`);
      assert.deepEqual(applied.ownerOutput.value.application, { ref: application.applicationRef, digest: application.applicationDigest });
      assert.deepEqual(product.constructCatalogApplicationResources(JSON.parse(JSON.stringify(resources))).application, application);
      applications.push(application); applicationResources.push(resources);
    }
    const program = consumerPublication.programs.find(row => row.programRef === fixture.ids.programRef);
    const law = coord("law://abiogenesis/validator/gtl-program@5", { ref: "law://abiogenesis/validator/gtl-program@5" });
    const conformanceCall = await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(program.programRef, program), conformanceLaw: law,
        inventoryBasis: { kind: "declared_inventory", inventory: publications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion,
        memberKey: "gtl_program", publication: consumerPublication, program }, conformanceLaw: law,
        declaredInventory: publications,
        declarationCatalog: { catalog, catalogView } }, boundSlots);
    const conformance = await invoke(conformanceCall, "conformance.evaluate");
    assert.equal(conformance.ownerOutput.value.disposition, "passed");
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView,
      admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
      programRef: fixture.ids.programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const runPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const binding = environment.workspaceBinding;
    const policy = product.constructRootInvocationPolicy(binding, resolution.program, [], ["F_D"], applications);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: runPacket };
    const grants = [product.constructCapabilityGrant(policy, ACTOR, "abg.operation.run.invoke",
      product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(ACTOR, binding, catalogView, program.programRef,
      resolution.selectedCatalogEntry, policy, grants, grantBasis);
    assert.equal(authority.kind, "invocation_authority");
    const input = { kind: "hello_world_input", schemaVersion, subject: "neutral schema consumer" };
    const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
    const inputCarrier = { contract: inputContract, valueRef: "value://neutral-schema.example/input",
      valueDigest: hash(input), value: input };
    const eventResource = reopenEventResource(product, closeHandoff);
    const steeringDigest = hash(eventResource);
    const runSlots = { workspace_binding: boundSlots.workspace_binding,
      product_set: environment.productInstalls.map(install => ({ ref: install.installId, digest: install.productContentDigest })),
      dependency_lock: lock, catalog_scope: catalogScope,
      execution_program: { ref: program.programRef, digest: resolution.resolution.programDigest },
      input_contract: inputCarrier, session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: [...runPacket.metadata.capabilityRefs],
        grants: grants.map(grant => ({ ref: grant.grantRef, digest: grant.grantDigest })) },
      actor: { actor: { ref: ACTOR, digest: hash({ actorRef: ACTOR }) },
        attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steeringDigest.slice(7)}`, digest: steeringDigest } };
    const runCall = definitionCall({ publicApi, product, ...runPacket.definitionKey, ordinal: ++ordinal,
      request: { program: runSlots.execution_program, scope: "program", target: { kind: "next" }, until: "converged",
        catalogView: catalogScope.view, allowlist, input: inputCarrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } },
      slots: runSlots, resources: { kind: "run_invocation_resource_assertion", schemaVersion, eventResource,
        catalog, catalogView, applications, applicationResources, source: { kind: "none" } } });
    const missingInputs = structuredClone(runCall);
    missingInputs.resources.applicationResources = [];
    const missingOutcome = await cliCall(missingInputs, acquisitionFor(missingInputs));
    assert.notEqual(missingOutcome.receipt.exitCode, 0, "bare application coordinates must refuse");
    assert.deepEqual(missingOutcome.receipt.resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
    const ran = await invoke(runCall, "consumer Program start");
    assert.equal(ran.ownerOutput.value.disposition, "completed");
    assert.ok(ran.ownerOutput.value.result);
    closeHandoff = ran.resources.eventResource.closeHandoff;
    const reads = {};
    for (const memberKey of ["run_result", "run_replay"]) {
      const packet = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
      const readGrants = packet.metadata.capabilityRefs.map(capabilityRef => product.constructCapabilityGrant(
        environment.workspaceAuthorityBasis, ACTOR, packet.definitionKey.operationId, capabilityRef,
        { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet }));
      const readCall = definitionCall({ publicApi, product, ...packet.definitionKey, ordinal: ++ordinal,
        request: { caseKey: memberKey,
          source: { sourceKind: "run", sourceRef: ran.ownerOutput.value.run.ref, sourceDigest: ran.ownerOutput.value.run.digest },
          projectionBasis: { projectionBasisRef: closeHandoff.prefix.eventLogRef, projectionBasisDigest: closeHandoff.prefix.coordinateDigest },
          selector: memberKey === "run_replay"
            ? { kind: "ordinal_page", fromOrdinal: 0, limit: 1000 } : { kind: "none" } },
        slots: { workspace_binding: boundSlots.workspace_binding, product_set: runSlots.product_set, dependency_lock: lock,
          capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs],
            grants: readGrants.map(row => ({ ref: row.grantRef, digest: row.grantDigest })) } },
        resources: { kind: "abg_project_read_resource_assertion", schemaVersion, eventResource: reopenEventResource(product, closeHandoff) } });
      reads[memberKey] = await invoke(readCall, `fresh ${memberKey}`);
      assert.deepEqual(reads[memberKey].resources.eventResource.closeHandoff.prefix, closeHandoff.prefix);
    }
    assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, ran.ownerOutput.value.result);
    const prefix = abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
    const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, ran.resources.invocationAdmission.ref);
    const sourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, {
      publicAuthorityDigest: runCall.invocation.invocationDigest, runtimeInvocationRef: admission.invocationRef,
      invocationAdmissionRef: ran.resources.invocationAdmission.ref, runId: ran.ownerOutput.value.run.ref,
      resultRef: ran.ownerOutput.value.result.ref });
    assert.ok(sourceBasis);
    assert.equal(sourceBasis.sourceResultValue.kind, "hello_world_output");
    const positiveBasisPath = join(scratch, "positive-basis.json");
    const positiveBasis = { disposition: "installed_positive_passed", fixture: fixture.basis,
      environment, catalog, catalogView, program, consumerPublication, closeHandoff,
      runReceipt: ran, reads, sourceBasis };
    await writeFile(positiveBasisPath, `${JSON.stringify(positiveBasis, null, 2)}\n`);
    await writeFile(join(evidenceRoot, "latest-positive.json"), `${JSON.stringify({ scratch, positiveBasisPath,
      artifactSha256: process.env.ABI5_WAVE1_FROZEN_ARTIFACT_SHA256 }, null, 2)}\n`);
    const conformanceNegatives = [];
    for (const label of ["missing declared dependency", "crossed declaration catalog"]) {
      const request = structuredClone(conformanceCall.invocation.request);
      const resources = structuredClone(conformanceCall.resources);
      delete resources.admissionAuthority;
      if (label === "missing declared dependency") {
        resources.declaredInventory = resources.declaredInventory.filter(p => p.moduleRef !== harness.rootPublication.moduleRef);
        request.inventoryBasis.inventory = request.inventoryBasis.inventory.filter(p => p.ref !== harness.rootPublication.moduleRef);
      } else {
        resources.declarationCatalog.catalog.lockDigest = `sha256:${"0".repeat(64)}`;
      }
      const negative = await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
        request, resources, boundSlots);
      const before = await readFile(eventLogPath);
      const outcome = await cliCall(negative, { kind: "eventless" });
      assert.equal(outcome.receipt.exitCode, 70, label);
      assert.equal(outcome.receipt.failure.fault.code, "resource_relation_mismatch", label);
      assert.deepEqual(await readFile(eventLogPath), before, label);
      conformanceNegatives.push({ label, code: outcome.receipt.failure.fault.code });
    }
    const applicationNegatives = [];
    const nodeResources = applicationResources[0];
    const assertApplicationRefusal = (label, mutate, code) => {
      const candidate = structuredClone(nodeResources); mutate(candidate);
      assert.throws(() => product.reconstructCatalogApplication(candidate), error => error.code === code, label);
      applicationNegatives.push({ label, code });
    };
    assertApplicationRefusal("missing schema", r => { r.construction.schemaAssets = []; }, "unready");
    assertApplicationRefusal("duplicate schema", r => { r.construction.schemaAssets.push(r.construction.schemaAssets[0]); }, "unready");
    assertApplicationRefusal("wrong schema owner", r => { r.construction.schemaAssets[0].productId = abiArtifact.productId; }, "unready");
    assertApplicationRefusal("outside Program node", r => { r.construction.targetRef = fixture.membershipTargets.nodeOutsideProgramRef; }, "target_mismatch");
    assertApplicationRefusal("outside contribution Program", r => { r.construction.programRef = fixture.membershipTargets.programOutsideContributionRef; }, "target_mismatch");
    assertApplicationRefusal("crossed validation", r => { r.validationReceipt = applicationResources[1].validationReceipt; }, "invalid_validation_receipt");
    assertApplicationRefusal("changed contributor", r => { r.contributor.digest = `sha256:${"0".repeat(64)}`; }, "invalid_contributor");
    for (const invalid of fixture.invalidValues.nodeType) {
      assertApplicationRefusal(`schema value ${invalid.name}`, r => { r.construction.value = invalid.value; }, "application_mismatch");
    }
    const secondValue = structuredClone(nodeResources);
    secondValue.construction.value = fixture.validValues.nodeType[1];
    const secondApplication = product.constructCatalogApplicationResources(secondValue);
    assert.notEqual(secondApplication.application.appliedValueDigest, applications[0].appliedValueDigest);
    const crossedValidationResources = structuredClone(nodeResources);
    crossedValidationResources.validationReceipt = applicationResources[1].validationReceipt;
    const nodeRow = nodeResources.catalogRow;
    const crossedValidationCall = await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.apply.node_type,
      { applicationKind: "node_type", catalogRow: { ref: nodeRow.handle, digest: nodeRow.entryDigest },
        catalogView: catalogScope.view, declaration: { ref: nodeRow.declarationOrContractRef, digest: nodeRow.entryDigest },
        target: { ref: applications[0].targetRef, digest: applications[0].targetDigest },
        applicationBasis: crossedValidationResources.applicationBasis, validationReceipt: crossedValidationResources.validationReceipt,
        contributor: crossedValidationResources.contributor }, crossedValidationResources, { ...boundSlots, catalog_scope: catalogScope });
    const eventBytesBefore = await readFile(eventLogPath);
    const crossedValidationOutcome = await cliCall(crossedValidationCall, { kind: "eventless" });
    assert.equal(crossedValidationOutcome.receipt.ownerOutput.outcomeKind, "refusal");
    assert.equal(crossedValidationOutcome.receipt.ownerOutput.value.code, "invalid_validation_receipt");
    assert.deepEqual(await readFile(eventLogPath), eventBytesBefore);
    const proof = { disposition: "installed_thread_passed", fixture: fixture.basis,
      applications, applicationResources, environment, catalog, catalogView, program, consumerPublication,
      declarationClosure: resolution.declarationClosure, programValidation: resolution.programValidation,
      closeHandoff, runReceipt: ran, reads, sourceBasis, calls: observedCalls,
      applicationNegatives, conformanceNegatives, graphNegatives, immutableBefore, immutableAfter: await inventory(harness.installedPackageRoot),
      installedBefore, installedAfter: await Promise.all(environment.productInstalls.map(install => inventory(install.installedRoot))) };
    assert.deepEqual(proof.immutableAfter, immutableBefore);
    assert.deepEqual(proof.installedAfter, installedBefore);
    await writeFile(join(scratch, "setup-proof.json"), `${JSON.stringify(proof, null, 2)}\n`);
    await writeFile(join(evidenceRoot, "latest-attempt.json"), `${JSON.stringify({ scratch, disposition: proof.disposition }, null, 2)}\n`);
  } catch (error) {
    await writeFile(join(scratch, "first-cause.json"), `${JSON.stringify({ message: error.message, stack: error.stack,
      lastCall: observedCalls.at(-1) ?? null, calls: observedCalls }, null, 2)}\n`);
    throw error;
  }
});
