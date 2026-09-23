import { prepareStdoNoteProduct, pilotResources, proveFreshSdkReplay, pilotEnvironmentDeclaration, PILOT_IDS, selectPreservedCatalogReceipt, resolveFreshSdkReplayModule, readRetainedStdoSourceEvidence } from "../support/stdo-environment-pilot.mjs";
import { mkdtemp } from "node:fs/promises";
import { basename } from "node:path";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, readdir, lstat, readlink, rename, copyFile, chmod, realpath } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import test from "node:test";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "../support/root-cli-environment.mjs";
const execFileAsync = promisify(execFile);
const packageRoot = process.env.ABI5_ENV_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://stdo-note.example/developer";
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
    eventTime: "2026-09-15T04:00:00.000Z",
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
  const permissionBoundReplay = call.invocation.definitionKey.memberKey === "run_replay";
  const lockIdentity=permissionBoundReplay?call.resources.eventResource.closeHandoff.prefix.storeIdentity:null;
  const lockSupport=lockIdentity===null?null:{directory:join(tmpdir(),"abiogenesis-event-store-locks-v5"),
    resolvedDirectory:await realpath(join(tmpdir(),"abiogenesis-event-store-locks-v5")),key:lockIdentity.device+"-"+lockIdentity.inode+".lock"};
  const command = permissionBoundReplay ? process.execPath : installedHarness.cliPath;
  const arguments_ = permissionBoundReplay ? ["--permission", "--allow-fs-read=" + installedHarness.cliHost,
    "--allow-fs-read=" + process.env.ABI5_ENV_RUN_ROOT, "--allow-fs-write=" + process.env.ABI5_ENV_RUN_ROOT,
    "--allow-fs-read=" + installedHarness.scratch,
    "--allow-fs-read=" + join(tmpdir(),"abiogenesis-event-store-locks-v5"), "--allow-fs-write=" + join(tmpdir(),"abiogenesis-event-store-locks-v5"),
    installedHarness.cliPath, "--jsonl", path] : ["--jsonl", path];
  const pending = execFileAsync(command, arguments_, {
    cwd: installedHarness.cliHost, env: { ...process.env, NODE_OPTIONS: "" },
    timeout: Math.min(call.invocation.definitionKey.memberKey === "start" ? 900_000 : 120_000, Math.max(1, Date.parse(process.env.ABI5_ENV_DEADLINE) - Date.now())),
    maxBuffer: 128 * 1024 * 1024,
  });
  const pid = pending.child.pid;
  await writeFile(join(installedHarness.scratch, `launch-${cliOrdinal}.json`), JSON.stringify({
    pid, started: new Date(started).toISOString(), definitionKey: call.invocation.definitionKey, command, arguments_, permissionBoundReplay,
    lockSupport:lockSupport===null?null:{...lockSupport,pendingKeyPrefix:lockSupport.key+"."+pid+"."},
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





function nativePublications(gtl, abiArtifact) {
  const basis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
  return [gtl.constructHelloWorldModulePublication, gtl.constructConsensusModulePublication,
    gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructWorksiteCommandForwardModulePublication,gtl.constructRequirementHandoffModulePublication,gtl.constructSemanticStageModulePublication,
    gtl.constructSemanticRevisionModulePublication,gtl.constructSelfConformanceModulePublication].map(fn => fn(basis));
}
test("STDO environment installed public invocation and fresh replay", async t => {
  const evidenceRoot = process.env.ABI5_ENV_EVIDENCE_ROOT;
  const scratch = process.env.ABI5_ENV_RUN_ROOT;
  const outputRoot = process.env.ABI5_ENV_OUTPUT_ROOT ?? scratch;
  if (!evidenceRoot || !scratch || !process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH) {
    t.skip("requires exact frozen artifact, isolated run root and retained evidence path"); return;
  }
  await mkdir(evidenceRoot, { recursive: true });
  const attempt = process.env.ABI5_ENV_ATTEMPT ?? "01";
  const setupAttempt = process.env.ABI5_STAGE_SETUP_ATTEMPT ?? "01";
  if (setupAttempt === "01" && attempt === "01") await assert.rejects(() => lstat(scratch), { code: "ENOENT" });
  if (attempt !== "01") assert.ok((await lstat(join(scratch, "workspace"))).isDirectory());
  const harnessScratch = join(outputRoot, `harness-${attempt}-${setupAttempt}`);
  await assert.rejects(() => lstat(harnessScratch), { code: "ENOENT" });
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: harnessScratch,
    rootPublicationKinds: ["hello_world"],
  });
  installedHarness = { ...harness, scratch: join(outputRoot, `attempt-${attempt}`) };
  await assert.rejects(() => lstat(installedHarness.scratch), {code:"ENOENT"});
  await mkdir(installedHarness.scratch, { recursive: true });
  const product = harness.product;
  const [publicApi, abg, gtl, validator] = await Promise.all(["public", "abg", "gtl", "validator"].map(
    surface => importInstalledPackageExport(harness, `@abiogenesis/typescript-tenant/${surface}`, `d1-${surface}`)));
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
  let ordinal = 0, environment = null, closeHandoff = null;
  async function authorized(packet, request, resources, supplied = {}) {
    const definition = definitionFor(publicApi, packet.definitionKey.operationId, packet.definitionKey.memberKey);
    const slots = authoritySlots(product, definition, supplied);
    const basis = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
        definitionDigest: definition.definitionDigest, owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null : product.admissionEnvironmentSelection(closeHandoff.prefix, slots.workspace_binding) };
    const authorityValue = { actorRef: ACTOR, authorityMode: "trusted_developer" };
    const approvalValue = { decision: "allow", actorRef: ACTOR, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
    // Explicit external trusted-desktop decision. ABI constructs the resulting grants.
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef: ACTOR,
      authorityMode: "trusted_developer", authority: { ...coord("authority://stdo-note.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://stdo-note.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
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
    let fixture,fixed,verifiedProducts,resolvedLock,lock,installed,consumerPublications,catalogRequest;
    let preservedCatalogReceipt=null,preservedViewReceipt=null,preservedSource=null;
    let retainedSourceEvidence=null;
    const resumeSource=process.env.ABI5_ENV_RESUME_PREPARATION==="03";
    if(process.env.ABI5_ENV_SOURCE_EVIDENCE){
      phase="retained_source_evidence";
      retainedSourceEvidence=await readRetainedStdoSourceEvidence(process.env.ABI5_ENV_SOURCE_EVIDENCE,{product,abg});
      const saved=retainedSourceEvidence.setup,basis=saved.catalog.readinessBasis;
      assert.deepEqual(saved.abiArtifact,abiArtifact);
      closeHandoff=retainedSourceEvidence.closeHandoff;
      environment=abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix,saved.boundSlots.workspace_binding);
      assert.equal(environment.kind,"exact_prefix_workspace_environment");
      assert.deepEqual(environment.workspaceBinding,saved.environment.workspaceBinding);
      verifiedProducts=basis.verifiedProducts;resolvedLock=environment.resolvedProductLock;lock=saved.lock;
      assert.deepEqual(resolvedLock,basis.resolvedLock);
      installed=environment.productInstalls.map(install=>abg.projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth,install.admissionEventRef));
      assert.ok(installed.every(Boolean));
      consumerPublications=saved.consumerPublications;
      const env=await pilotEnvironmentDeclaration({gtl,product,inputRoot:process.env.ABI5_ENV_INPUT_ROOT});
      const publication=consumerPublications.find(row=>row.semanticLifecycle!==undefined);
      assert.deepEqual(env.declaration,publication.stdoRunEnvironments[0]);
      fixture={...saved.fixture,env};fixed=fixture.source;
      assert.equal(hash(fixture.scenario),fixture.lifecycle.taskDataDigest);assert.equal(hash(fixture.oracle),fixture.lifecycle.evaluationDataDigest);
      assert.deepEqual(fixture.basis,verifiedProducts[1]);
      preservedCatalogReceipt=retainedSourceEvidence.catalogReceipt;preservedViewReceipt=retainedSourceEvidence.viewReceipt;
      preservedSource=retainedSourceEvidence.source;
      installedBefore=await Promise.all(environment.productInstalls.map(install=>inventory(install.installedRoot)));
      await writeFile(join(installedHarness.scratch,"preserved-source-entry.json"),JSON.stringify({evidencePath:process.env.ABI5_ENV_SOURCE_EVIDENCE,
        closeHandoff,sourceBasis:preservedSource.resultBasis,catalogScope:saved.catalogScope,reusedRefusals:["missing"]},null,2)+"\n",{flag:"wx"});
    }else if(!["02","03"].includes(process.env.ABI5_ENV_RESUME_PREPARATION)) {
    const workspaceRoot = join(scratch, "workspace");
    const workspaceResources = { kind: "workspace_resource_assertion", schemaVersion, targetRoot: workspaceRoot,
      targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) };
    const created = attempt === "01" ? await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources,
      { actor: actorAuthority(product) }), "workspace.create")
      : JSON.parse(await readFile(join(scratch, "attempt-01/receipt-1.json"), "utf8")).receipt;
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    fixture = await prepareStdoNoteProduct({ scratch, product, gtl, abiArtifact, inputRoot: process.env.ABI5_ENV_INPUT_ROOT });
    fixed = fixture.source;
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
    verifiedProducts = products.map(item => item.verification.verifiedArtifact);
    resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion,
      memberKey: "resolve", verifiedArtifacts: verifiedProducts });
    assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
    lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest };
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
    closeHandoff = null;
    installed = [];
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
      authorityManifestRef: "manifest://stdo-note.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
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
    consumerPublications = await fixture.loadInstalledPublications({ installedRoot: installed[1].install.installedRoot, gtl });
    catalogRequest={workspaceBinding:bound.ownerOutput.value.binding,descriptors:products.map(item=>item.packed.descriptor),
      contributionManifests:products.map(item=>item.packed.contributionManifest),resolvedLock:lock};
    } else {
      phase="resume_preserved_catalog_preparation";
      const previous=join(scratch,resumeSource?"attempt-02":"attempt-01");
      const priorCall=JSON.parse(await readFile(join(previous,resumeSource?"call-1.jsonl":"call-9.jsonl"),"utf8")).invocation;
      const refused=JSON.parse(await readFile(join(previous,resumeSource?"receipt-6.json":"receipt-9.json"),"utf8")).receipt;
      if(resumeSource){
        assert.equal(refused.failure.fault.code,"acquisition_refused");
        const sourceCall=JSON.parse(await readFile(join(previous,"call-4.jsonl"),"utf8")).invocation;
        const sourceReceipt=JSON.parse(await readFile(join(previous,"receipt-4.json"),"utf8")).receipt;
        assert.equal(sourceReceipt.ownerOutput.value.disposition,"completed");
        closeHandoff=sourceReceipt.resources.eventResource.closeHandoff;
        preservedCatalogReceipt=JSON.parse(await readFile(join(previous,"receipt-1.json"),"utf8")).receipt;
        preservedViewReceipt=JSON.parse(await readFile(join(previous,"receipt-2.json"),"utf8")).receipt;
        preservedSource={call:sourceCall,ran:sourceReceipt,reads:{run_result:JSON.parse(await readFile(join(previous,"receipt-5.json"),"utf8")).receipt},
          replayCall:JSON.parse(await readFile(join(previous,"call-6.jsonl"),"utf8")).invocation};
      }else{
        ({closeHandoff,preservedCatalogReceipt}=selectPreservedCatalogReceipt(priorCall,refused));
      }
      const basis=priorCall.resources;
      assert.deepEqual(basis.verifiedProducts[0],abiArtifact);
      const wb=basis.workspaceBinding,bindingCoordinate={ref:wb.bindingId,digest:wb.bindingDigest};
      environment=abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix,bindingCoordinate);
      assert.equal(environment.kind,"exact_prefix_workspace_environment");
      verifiedProducts=basis.verifiedProducts;resolvedLock=basis.resolvedLock;
      lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};catalogRequest=priorCall.invocation.request;
      const truth=abg.projectExactPrefixArtifactTruth(closeHandoff.prefix);
      installed=[];
      for(const ordinal of [6,7]){
        const call=JSON.parse(await readFile(join(scratch,"attempt-01","call-"+ordinal+".jsonl"),"utf8")).invocation;
        const row=abg.projectAdmittedProductInstallByInvocationRef(truth,call.invocation.invocationRef);assert.ok(row);installed.push(row);
      }
      consumerPublications=basis.publications.filter(p=>p.owningProductId!==abiArtifact.productId);
      const sourcePublication=consumerPublications.find(p=>p.requirementHandoffs!==undefined);
      const semanticPublication=consumerPublications.find(p=>p.semanticLifecycle!==undefined);
      const env=await pilotEnvironmentDeclaration({gtl,product,inputRoot:process.env.ABI5_ENV_INPUT_ROOT});
      assert.deepEqual(env.declaration,semanticPublication.stdoRunEnvironments[0]);
      const sourceInput=JSON.parse(await readFile(join(scratch,"stdo-note-product-source/build/source-input.json"),"utf8"));
      fixed={input:sourceInput,declaration:sourcePublication.requirementHandoffs[0]};
      fixture={ids:PILOT_IDS,env,source:fixed,lifecycle:semanticPublication.semanticLifecycle,
        scenario:{question:semanticPublication.semanticLifecycle.stages[0].purpose},oracle:{},basis:verifiedProducts[1]};
      assert.equal(hash(fixture.scenario),fixture.lifecycle.taskDataDigest);assert.equal(hash(fixture.oracle),fixture.lifecycle.evaluationDataDigest);
      installedBefore=await Promise.all(environment.productInstalls.map(install=>inventory(install.installedRoot)));
      ordinal=resumeSource?15:9;
      await writeFile(join(installedHarness.scratch,"preserved-preparation.json"),JSON.stringify({predecessor:previous,retainedOutcome:refused.ownerOutput,
        prefix:closeHandoff.prefix,productInstalls:environment.productInstalls,fixtureBasis:fixture.basis},null,2)+"\n");
    }
    const consumerPublication=consumerPublications.find(p=>p.programs.some(x=>x.programRef===fixture.ids.programRef));
    const programRefs=[fixture.ids.sourceProgramRef,fixture.ids.programRef];
    const publications=[...nativePublications(gtl,abiArtifact),...consumerPublications];
    const declaredPublicationBindings=verifiedProducts.flatMap(p=>p.contributionManifest.publicationBindings).sort((a,b)=>a.moduleRef.localeCompare(b.moduleRef));
    assert.deepEqual(publications.map(p=>({moduleRef:p.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(p)})).sort((a,b)=>a.moduleRef.localeCompare(b.moduleRef)),declaredPublicationBindings);
    const boundSlots={workspace_binding:{ref:environment.workspaceBinding.bindingId,digest:environment.workspaceBinding.bindingDigest},
      product_set:environment.productInstalls.map(product.productInstallCoordinate),dependency_lock:lock,actor:actorAuthority(product)};
    const catalogCall=preservedCatalogReceipt===null?await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,catalogRequest,
      {kind:"catalog_admission_resource_assertion",schemaVersion,eventResource:reopenEventResource(product,closeHandoff),
        workspaceBinding:environment.workspaceBinding,resolvedLock,verifiedProducts,admittedInstalls:environment.productInstalls,publications},boundSlots):null;
    // Resolve every catalog/conformance/installed owner relation before Public dispatch.
    const preparedCatalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(preparedCatalog.kind, "graph_function_catalog", JSON.stringify(preparedCatalog));
    if(preservedCatalogReceipt!==null) {
      assert.deepEqual(preservedCatalogReceipt.ownerOutput.value.catalog,
        {ref:`graph-function-catalog://abiogenesis/${preparedCatalog.basisDigest.slice(7)}`,digest:preparedCatalog.basisDigest},"retained catalog equals exact installed-owner reconstruction");
    }
    const preparedAllowlist = preparedCatalog.entries.filter(row => row.programMembershipRefs.some(ref=>programRefs.includes(ref))).map(row => row.handle).sort();
    const preparedView = product.narrowGraphFunctionCatalog(preparedCatalog, preparedAllowlist);
    assert.equal(preparedView.kind, "graph_function_catalog_view");
    if(preservedViewReceipt!==null)assert.deepEqual(preservedViewReceipt.ownerOutput.value.view,
      {ref:`graph-function-catalog-view://abiogenesis/${preparedView.viewDigest.slice(7)}`,digest:preparedView.viewDigest});
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
    if(process.env.ABI5_ENV_PROOF_ENTRY_ONLY==="1") {
      assert.ok(preservedCatalogReceipt,"mechanical proof-entry check requires retained successful catalog");
      const moduleUrl=await resolveFreshSdkReplayModule(installedHarness.cliHost);
      const replaySdk=await import(moduleUrl);
      const events=replaySdk.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
      const validated=replaySdk.selectValidatedRuntimeEventPrefix(events);
      assert.equal(validated.kind,"validated_runtime_event_prefix");
      assert.equal(events.length,retainedSourceEvidence===null?3:retainedSourceEvidence.eventCount);
      if(retainedSourceEvidence===null)assert.ok(events.every(event=>event.kind==="public_operation_artifact_admitted"));
      assert.equal(observedCalls.length,0);
      await writeFile(join(installedHarness.scratch,"proof-entry-ready.json"),JSON.stringify({kind:"retained_catalog_proof_entry_ready",
        moduleUrl,closeHandoff,catalog:preservedCatalogReceipt.ownerOutput.value.catalog,productInstalls:environment.productInstalls,
        workspaceBinding:boundSlots.workspace_binding,artifactDigest:abiArtifact.artifactDigest,consumerArtifactDigest:fixture.basis.artifactDigest,
        eventCount:events.length,publicCalls:0,preparedPrograms:preparedPrograms.map(row=>row.programRef),
        sourceBasis:retainedSourceEvidence?.source.resultBasis??null,reusedRefusals:retainedSourceEvidence===null?[]:["missing"],
        remainingPublicCalls:retainedSourceEvidence===null?15:8,nextOperation:retainedSourceEvidence===null?"catalog.view":"mismatch conformance"},null,2)+"\n",{flag:"wx"});
      return;
    }
    const catalogReceipt = preservedCatalogReceipt??await invoke(catalogCall, "catalog.admit");
    if(preservedCatalogReceipt===null)closeHandoff = catalogReceipt.resources.eventResource.closeHandoff;
    const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit",
      readinessBasis: { workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts,
        installedProducts: installed.map(row => row.candidate), publications } });
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));

    const allowlist = catalog.entries.filter(row => row.programMembershipRefs.some(ref=>programRefs.includes(ref))).map(row => row.handle).sort();
    const viewReceipt = preservedViewReceipt??await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
      { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist },
      { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots), "catalog.view");
    const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(catalogView.kind, "graph_function_catalog_view");
    const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
    const applications = [], applicationResources = [];
    const binding = environment.workspaceBinding, A = environment.workspaceAuthorityBasis;
    async function invokeProgram(programRef, makeInput, refusalCase = null) {
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
      const inputCarrier={contract:inputContract,valueRef:`value://d1-semantic/${ordinal+1}`,valueDigest:hash(input),value:input};
      const eventResource=reopenEventResource(product,closeHandoff),steeringDigest=hash(eventResource);
      const slots={workspace_binding:boundSlots.workspace_binding,product_set:environment.productInstalls.map(i=>({ref:i.installId,digest:i.productContentDigest})),
        dependency_lock:lock,catalog_scope:catalogScope,execution_program:{ref:programRef,digest:resolution.resolution.programDigest},input_contract:inputCarrier,
        session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},
        actor:{actor:{ref:ACTOR,digest:hash({actorRef:ACTOR})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},
        transport_steering:{ref:`transport-steering://abiogenesis/${steeringDigest.slice(7)}`,digest:steeringDigest}};
      let environmentResources;
      if (selectedProgram.policies["abg.stdo_run_environment"] !== undefined) {
        const temporaryRoot = join(binding.roots.archiveRoot, "stdo-access-support"); await mkdir(temporaryRoot, {recursive:true});
        environmentResources = pilotResources(product, fixture.env, authority, selectedProgram, temporaryRoot);
        if (refusalCase === "missing") environmentResources = undefined;
        if (refusalCase === "permission") environmentResources.permission.actorRef += "/not-permitted";
        if (refusalCase === "mismatch") { environmentResources.roots.pythonPath = environmentResources.roots.representationRecordPath; environmentResources.permission.roots = environmentResources.roots; }
      }
      const call=definitionCall({publicApi,product,...packet.definitionKey,ordinal:++ordinal,
        request:{program:slots.execution_program,scope:"program",target:{kind:"next"},until:"converged",catalogView:catalogScope.view,allowlist,input:inputCarrier,fhMode:"direct",rootMode:"direct",sourceBasis:{kind:"none"}},
        slots,resources:{kind:"run_invocation_resource_assertion",schemaVersion,eventResource,catalog,catalogView,applications,applicationResources,source:{kind:"none"},
          ...(environmentResources === undefined ? {} : {stdoEnvironmentResources:environmentResources})}});
      assert.equal(product.isRunInvocationResourceAssertion(call.resources),true);
      assert.equal(product.constructExactStartInvocation(call.invocation,binding,catalogView,resolution.program,resolution.selectedCatalogEntry,raw,policy,grants,authority).kind,"public_invocation_candidate");
      await writeFile(join(installedHarness.scratch,`program-ready-${ordinal}.json`),JSON.stringify({call,closeHandoff,resolution:resolution.resolution,programRef},null,2)+"\n");
      if (refusalCase !== null) {
        const before=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix).filter(e=>e.kind==="actor_transport_binding_admitted").length;
        const outcome=await cliCall(call,acquisitionFor(call));
        assert.equal(outcome.kind,"installed_definition_call_transport_result");
        const refused=outcome.receipt;
        assert.equal(refused.ownerOutput.outcomeKind,"refusal",JSON.stringify(refused));
        const expectedCause={missing:"missing_binding",mismatch:"identity_mismatch",permission:"access_not_permitted"}[refusalCase];
        assert.ok(refused.ownerOutput.value.issuePaths.includes("/stdoEnvironment/cause/"+expectedCause),JSON.stringify(refused));
        if (refused.resources?.eventResource?.closeHandoff) closeHandoff=refused.resources.eventResource.closeHandoff;
        const after=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix).filter(e=>e.kind==="actor_transport_binding_admitted").length;
        assert.equal(after,before,"refusal must not dispatch a native actor");
        await writeFile(join(installedHarness.scratch,"refusal-"+refusalCase+".json"),JSON.stringify({call,outcome,closeHandoff},null,2)+"\n");
        return {call,outcome,closeHandoff};
      }
      if (selectedProgram.policies["abg.stdo_run_environment"] !== undefined) {
        const nativeBudget=Number(process.env.ABI5_ENV_NATIVE_BUDGET_MS??900_000);
        assert.ok(Number.isSafeInteger(nativeBudget)&&nativeBudget>0,"explicit finite native/read budget");
        assert.ok(Date.now()+nativeBudget<Date.parse(process.env.ABI5_ENV_DEADLINE),"native attempt and fresh reads must fit the granted remaining budget");
        await writeFile(join(outputRoot,"native-positive.started.json"),JSON.stringify({startedAt:new Date().toISOString(),invocation:call.invocation.invocationRef})+"\n",{flag:"wx"});
      }
      const ran=await invoke(call,programRef);
      closeHandoff=ran.resources.eventResource.closeHandoff;
      await writeFile(join(installedHarness.scratch,"latest-prefix.json"),JSON.stringify(closeHandoff,null,2)+"\n");
      assert.equal(ran.ownerOutput.value.disposition,"completed",JSON.stringify(ran.ownerOutput));
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
      assert.ok(resultBasis);
      const result={call,ran,reads,resultBasis,closeHandoff,input};
      await writeFile(join(installedHarness.scratch,`program-result-${ordinal}.json`),JSON.stringify(result,null,2)+"\n");
      return result;
    }
    await writeFile(join(installedHarness.scratch,"setup-ready.json"),JSON.stringify({catalog,catalogView,catalogScope,consumerPublications,environment,boundSlots,lock,closeHandoff,ordinal,fixture:{ids:fixture.ids,source:fixture.source,lifecycle:fixture.lifecycle,scenario:fixture.scenario,oracle:fixture.oracle,basis:fixture.basis},ownerRequest,abiArtifact},null,2)+"\n");
    phase="source_handoff";
    let source;
    if(retainedSourceEvidence!==null)source=preservedSource;
    else if(preservedSource===null)source=await invokeProgram(fixture.ids.sourceProgramRef,async()=>fixed.input);
    else{
      preservedSource.reads.run_replay=await invoke(preservedSource.replayCall,"fresh preserved source run_replay");
      assert.deepEqual(preservedSource.reads.run_result.resources.eventResource.closeHandoff.prefix,closeHandoff.prefix);
      assert.deepEqual(preservedSource.reads.run_replay.resources.eventResource.closeHandoff.prefix,closeHandoff.prefix);
      const prefix=abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix));
      const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,preservedSource.ran.resources.invocationAdmission.ref);
      assert.ok(admission);
      const resultBasis=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:preservedSource.call.invocation.invocationDigest,
        runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:preservedSource.ran.resources.invocationAdmission.ref,
        runId:preservedSource.ran.ownerOutput.value.run.ref,resultRef:preservedSource.ran.ownerOutput.value.result.ref});
      assert.ok(resultBasis);
      source={call:preservedSource.call,ran:preservedSource.ran,reads:preservedSource.reads,resultBasis,closeHandoff,input:fixed.input};
      await writeFile(join(installedHarness.scratch,"program-result-"+ordinal+".json"),JSON.stringify(source,null,2)+"\n");
    }
    assert.deepEqual(source.resultBasis.sourceResultValue.declaration,fixed.declaration);
    assert.equal(source.resultBasis.sourceResultValue.coverage.obligations.length,2);
    assert.ok(fixed.declaration.fulfillmentBindings.every(b=>b.realizationContractRef&&b.proofContractRef&&b.proofPolicyRef&&b.proofShapeRef));
    assert.equal(process.env.ABI5_STAGE_MODE,"live","this witness permits no fixture LLM transport");
    phase="semantic_composition";
    const envelope=product.constructSemanticStageEnvelope({sourceHandoff:source.resultBasis.sourceResultValue,
      lifecycle:fixture.lifecycle,taskData:fixture.scenario,evaluationData:fixture.oracle,worksite:null});
    await writeFile(join(installedHarness.scratch,"explicit-envelope-input.json"),JSON.stringify({sourceResult:source.resultBasis,constructor:"installed Product.constructSemanticStageEnvelope",envelope},null,2)+"\n");
    if(retainedSourceEvidence!==null)assert.deepEqual(envelope,retainedSourceEvidence.envelope);
    const refusals=retainedSourceEvidence===null?[]:[retainedSourceEvidence.missing];
    for(const name of retainedSourceEvidence===null?["missing","mismatch","permission"]:["mismatch","permission"]) refusals.push(await invokeProgram(fixture.ids.programRef,async()=>envelope,name));
    const stages=await invokeProgram(fixture.ids.programRef,async()=>envelope);
    const output=stages.resultBasis.sourceResultValue;
    assert.equal(output.applicationCoverage,"non_closing");assert.equal(output.assets.length,1);
    assert.deepEqual(output.sourceHandoff,source.resultBasis.sourceResultValue);
    assert.deepEqual(output.lifecycle.proofPolicies,fixture.lifecycle.proofPolicies);
    assert.deepEqual(output.lifecycle.proofShapes,fixture.lifecycle.proofShapes);
    const events=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const assemblies=events.filter(e=>e.kind==="actor_transport_binding_admitted");
    assert.equal(assemblies.length,2);assert.ok(assemblies.every(e=>e.payload.instructionAssembly?.kind==="native_instruction_assembly"));
    assert.ok(events.filter(e=>e.kind==="actor_result_artifact_observed").every(e=>e.payload.toolCallCount===0));
    assert.deepEqual(await inventory(harness.installedPackageRoot),immutableBefore);
    assert.deepEqual(await Promise.all(environment.productInstalls.map(i=>inventory(i.installedRoot))),installedBefore);
    const environmentEvents=events.filter(e=>e.kind==="invocation_admitted"&&e.payload.stdoEnvironment!==undefined);
    assert.equal(environmentEvents.length,1);
    assert.ok(assemblies.every(e=>e.payload.instructionAssembly.manifest.stdoEnvironment?.evidenceDigest===environmentEvents[0].payload.stdoEnvironment.evidenceDigest));
    const sdkReplay=await proveFreshSdkReplay({cliHost:installedHarness.cliHost,runRoot:scratch,scratch:installedHarness.scratch,prefix:closeHandoff.prefix,
      runId:stages.ran.ownerOutput.value.run.ref,cliReplay:stages.reads.run_replay.ownerOutput.value.projection.replay,
      externalRoots:[fixture.env.roots.sourceRoot,fixture.env.roots.representationRoot,fixture.env.roots.axiomRoot],deadline:process.env.ABI5_ENV_DEADLINE});
    assert.ok(sdkReplay.projection.ownerFacts.some(row=>row.owner==="invocation_stdo_environment"));
    assert.equal(sdkReplay.projection.ownerFacts.filter(row=>row.owner==="stdo_instruction_assembly").length,2);
    const proof={disposition:"installed_environment_access_and_native_stage_completed",semanticMeaningQualified:false,source,stages,refusals,environmentEvents,assemblies,sdkReplay,observedCalls,
      closeHandoff,artifactDigest:abiArtifact.artifactDigest,consumerArtifactDigest:fixture.basis.artifactDigest};
    await writeFile(join(installedHarness.scratch,"proof.json"),JSON.stringify(proof,null,2)+"\n",{flag:"wx"});
    console.log(JSON.stringify({disposition:proof.disposition,stages:1,actors:2,sourceMembers:1,pairedObligations:2,coverage:output.applicationCoverage}));
  } catch(error) {
    await writeFile(join(outputRoot,`first-cause-${Date.now()}.json`),JSON.stringify({phase,name:error.name,message:error.message,stack:error.stack,observedCalls,preflight},null,2)+"\n",{flag:"wx"});
    throw error;
  }
});
