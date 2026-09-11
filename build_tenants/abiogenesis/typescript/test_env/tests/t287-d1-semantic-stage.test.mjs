import { mkdtemp } from "node:fs/promises";
import { basename } from "node:path";
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
const execFileAsync = promisify(execFile);
const packageRoot = process.env.ABI5_D1_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const ACTOR = "actor://d1-handoff.example/developer";
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





const glcRoot = "/Users/jim/src/apps/odd_glc";
const glcEvidence = join(glcRoot, ".ai-workspace/comments/codex/20260909_D1_LIFECYCLE");
const glc = await import(pathToFileURL(join(glcRoot, "build_tenants/odd_glc/typescript/test/d1-lifecycle-declarations.mjs")).href);
function nativePublications(gtl, abiArtifact) {
  const basis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
  return [gtl.constructHelloWorldModulePublication, gtl.constructConsensusModulePublication,
    gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructRequirementHandoffModulePublication, gtl.constructSemanticStageModulePublication].map(fn => fn(basis));
}
async function prepareDeclarationProduct({ scratch, product, gtl, abiArtifact, sourceFixture }) {
  const sourceFixtureBytes = await readFile(join(glcEvidence, "source-witness/source-input.json"));
  const derivedDeclarationBytes = await readFile(join(glcEvidence, "stage-contract/derived-declarations.json"));
  const derived = JSON.parse(derivedDeclarationBytes), oracle = JSON.parse(await readFile(join(glcEvidence,"stage-contract/oracle.json"),"utf8"));
  const scenario = JSON.parse(await readFile(join(glcRoot,"build_tenants/odd_glc/typescript/test/fixtures/d1-lifecycle-scenario.json"),"utf8"));
  const abiPublications = nativePublications(gtl, abiArtifact);
  const bundle = glc.constructD1DeclarationBundle({ gtl, product, abiArtifact, abiPublications, fixture: sourceFixture, derived, scenario, oracle });
  let consumerPublication = bundle.consumerPublication;
  if (process.env.ABI5_STAGE_MODE !== "live") {
    // Test-owned two-stage declaration: all five source members and non-null
    // paired obligations remain fixed. This does not qualify semantic meaning.
    const lifecycle = gtl.constructSemanticLifecycleDeclaration({ ...bundle.lifecycle, stages: bundle.lifecycle.stages.slice(0,2) });
    const root = structuredClone(consumerPublication.graphFunctions.find(g => g.name === bundle.ids.graphFunctionRef));
    const terminalNode = root.template.nodes.at(-1);
    root.template.nodes = [...root.template.nodes.slice(0,2), terminalNode];
    root.template.edges = [root.template.edges[0], gtl.graphEdge({fromNodeRef: root.template.nodes[1].nodeRef, toNodeRef: terminalNode.nodeRef})];
    root.template.terminalNodeRefs = [terminalNode.nodeRef]; root.effects = [];
    root.environment = { requires: [gtl.SEMANTIC_STAGE_IDS.envelopeContractRef], provides: [gtl.SEMANTIC_STAGE_IDS.outputContractRef], carries: [gtl.SEMANTIC_STAGE_IDS.envelopeContractRef] };
    const terminalGraph = consumerPublication.graphFunctions.find(g => g.outputs.includes(gtl.SEMANTIC_STAGE_IDS.outputContractRef) && g.name !== root.name);
    assert.ok(terminalGraph);
    const keep = [bundle.ids.graphFunctionRef, ...lifecycle.stages.map(s=>s.graphFunctionRef), terminalGraph.name];
    const graphFunctions = consumerPublication.graphFunctions.filter(g => keep.includes(g.name)).map(g => g.name === root.name ? root : g);
    consumerPublication = gtl.modulePublication({ ...structuredClone(consumerPublication), semanticLifecycle: lifecycle, graphFunctions,
      programs: consumerPublication.programs.map(p => p.programRef === bundle.ids.programRef ? {...p,callableMembership:keep} : p),
      contributions: consumerPublication.contributions.filter(c => keep.includes(c.handle)) });
    bundle.lifecycle = lifecycle;
  }
  const prepared = glc.constructD1ConsumerPackageFiles({product,gtl,abiArtifact,sourcePublication:bundle.sourcePublication,consumerPublication,fixture:sourceFixture,derived,scenario,sourceFixtureBytes,derivedDeclarationBytes});
  const sourceRoot = join(scratch,`consumer-source-${process.env.ABI5_D1_ATTEMPT ?? "01"}`); await mkdir(sourceRoot,{recursive:true});
  for (const [path,bytes] of Object.entries(prepared.files)) { await mkdir(dirname(join(sourceRoot,path)),{recursive:true}); await writeFile(join(sourceRoot,path),bytes); }
  const artifacts = join(sourceRoot,"artifacts"); await mkdir(artifacts);
  const {stdout} = await execFileAsync("npm",["pack","--ignore-scripts","--json","--pack-destination",artifacts],{cwd:sourceRoot,maxBuffer:10485760});
  const artifactPath = join(artifacts,JSON.parse(stdout)[0].filename);
  const basis = { artifactDigest:await product.sha256File(artifactPath),manifestDigest:product.sha256Canonical(prepared.manifest),
    productContentDigest:prepared.productContentDigest,productId:bundle.ids.productId,packageName:bundle.ids.packageName,packageVersion:bundle.ids.packageVersion };
  return {...bundle,scenario,oracle,artifactPath,artifactRef:basename(artifactPath),basis,sourceRoot,manifest:prepared.manifest,
    nativePublication:abiPublications.find(p=>p.moduleRef===gtl.REQUIREMENT_HANDOFF_IDS.moduleRef),
    async loadInstalledPublications({installedRoot,gtl}) {
      return Promise.all(["build/source-publication.json","build/publication.json"].map(async path=>{
        const bytes=await readFile(join(installedRoot,path));
        assert.equal(product.sha256Bytes(bytes),prepared.payloadInventory.find(r=>r.path===path).sha256);
        return glc.materializeD1Publication({gtl,identity:basis,publicationData:JSON.parse(bytes)});
      }));
    }};
}
async function installSemanticFixture(path) {
  const code = `#!/usr/bin/env node
let prompt="";process.stdin.setEncoding("utf8");process.stdin.on("data",c=>prompt+=c);process.stdin.on("end",()=>{
  const sections={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf("\\n");sections[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim());}
  const task=sections.task; const current=sections.predecessors.at(-1);
  const assessor=sections.role.startsWith("Independently");
  const q={memberRef:sections.source[0].memberRef,quote:sections.source[0].text.slice(0,200)};
  const raw=assessor?{kind:"semantic_stage_assessment_candidate",schemaVersion:"5.0.0",criteria:task.rubric.map(c=>({criterionRef:c.criterionRef,disposition:"satisfied",explanation:"Deterministic carrier witness only; no semantic qualification.",sourceQuotes:[q],statementRefs:current.candidate.statements.map(s=>s.statementRef)})),pressure:[]}:
    {kind:"semantic_stage_asset_candidate",schemaVersion:"5.0.0",statements:[{statementRef:task.stageRef+"/fixture-statement",text:"Deterministic carrier witness retains every original source and declared obligation.",modality:"supporting",sourceQuotes:[q],requirementRefs:sections.obligations.sourceDeclaration.terms.map(t=>t.requirementRef),obligationRefs:sections.obligations.sourceDeclaration.fulfillmentBindings.map(b=>b.obligationRef),predecessorStatementRefs:sections.predecessors.flatMap(a=>a.candidate.statements.map(s=>s.statementRef))}],requirementCandidates:[],worksiteDesign:null,pressure:[]};
  console.log(JSON.stringify({type:"system",subtype:"init"}));console.log(JSON.stringify({type:"result",subtype:"success",result:JSON.stringify(raw)}));
});
`;
  await writeFile(path,code);await chmod(path,0o755);return path;
}
test("D1 installed semantic stage composition and fresh replay", async t => {
  const evidenceRoot = process.env.ABI5_D1_EVIDENCE_ROOT;
  const scratch = process.env.ABI5_D1_RUN_ROOT;
  if (!evidenceRoot || !scratch || !process.env.ABI5_WAVE1_FROZEN_ARTIFACT_PATH) {
    t.skip("requires exact frozen artifact, isolated run root and retained evidence path"); return;
  }
  await mkdir(evidenceRoot, { recursive: true });
  const attempt = process.env.ABI5_D1_ATTEMPT ?? "01";
  const setupAttempt = process.env.ABI5_STAGE_SETUP_ATTEMPT ?? "01";
  if (setupAttempt === "01" && attempt === "01") await assert.rejects(() => lstat(scratch), { code: "ENOENT" });
  if (attempt !== "01") assert.ok((await lstat(join(scratch, "workspace"))).isDirectory());
  const harnessScratch = join(scratch, `harness-${attempt}-${setupAttempt}`);
  await assert.rejects(() => lstat(harnessScratch), { code: "ENOENT" });
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, {
    candidateBasisSource: "packed_artifact", scratchPath: harnessScratch,
    rootPublicationKinds: ["hello_world"],
  });
  installedHarness = { ...harness, scratch: join(scratch, `attempt-${attempt}`) };
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
      authorityMode: "trusted_developer", authority: { ...coord("authority://d1-handoff.example/developer", authorityValue), value: authorityValue },
      approval: { ...coord(`approval://d1-handoff.example/${ordinal + 1}`, approvalValue), value: approvalValue } };
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
    const created = attempt === "01" ? await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
      { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources,
      { actor: actorAuthority(product) }), "workspace.create")
      : JSON.parse(await readFile(join(scratch, "attempt-01/receipt-1.json"), "utf8")).receipt;
    const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
    await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.open.open,
      { targetRoot: workspaceRoot, expectedAuthority: { ref: workspaceManifest.authorityBasis.authorityRef,
        digest: workspaceManifest.authorityBasis.authorityDigest } }, workspaceResources), "workspace.open");
    const fixtureBytes = await readFile(process.env.ABI5_D1_SOURCE_FIXTURE);
    assert.equal(createHash("sha256").update(fixtureBytes).digest("hex"), "13137b2080d9c9c6d8af5f5880f92b46a8cbbd4afc4c66451812e9e92f023871");
    const sourceFixture = JSON.parse(fixtureBytes);
    const fixture = await prepareDeclarationProduct({ scratch, product, gtl, abiArtifact, sourceFixture });
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
      authorityManifestRef: "manifest://d1-handoff.example/workspace-authority", authorityManifestDigest: hash(authorityManifest) });
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
    const programRefs = [fixture.ids.sourceProgramRef, fixture.ids.programRef];
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
    async function invokeProgram(programRef, makeInput) {
      const selectedPublication = consumerPublications.find(p=>p.programs.some(x=>x.programRef===programRef));
      const selectedProgram = selectedPublication.programs.find(p=>p.programRef===programRef);
      assert.ok(selectedProgram);
      const selectedLaw = coord("law://abiogenesis/validator/gtl-program@5",{ref:"law://abiogenesis/validator/gtl-program@5"});
      const checked = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
        {program:coord(programRef,selectedProgram),conformanceLaw:selectedLaw,inventoryBasis:{kind:"declared_inventory",inventory:catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},
        {kind:"conformance_evaluation_resource_assertion",schemaVersion,packet:{kind:"conformance_evaluate_packet",schemaVersion,memberKey:"gtl_program",publication:selectedPublication,program:selectedProgram},
          conformanceLaw:selectedLaw,artifactTruth:environment.artifactTruth,declaredInventory:catalog.boundPublications,declarationCatalog:{catalog,catalogView}},boundSlots),"selected Program conformance");
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
    const source=await invokeProgram(fixture.ids.sourceProgramRef,async()=>fixed.input);
    assert.deepEqual(source.resultBasis.sourceResultValue.declaration,fixed.declaration);
    assert.equal(source.resultBasis.sourceResultValue.coverage.obligations.length,10);
    assert.ok(fixed.declaration.fulfillmentBindings.every(b=>b.realizationContractRef&&b.proofContractRef&&b.proofPolicyRef&&b.proofShapeRef));
    if(process.env.ABI5_STAGE_MODE!=="live") process.env.ABG_TS_CLAUDE_COMMAND=await installSemanticFixture(join(installedHarness.scratch,"fixture-claude"));
    phase="semantic_composition";
    const stages=await invokeProgram(fixture.ids.programRef,async()=>product.constructSemanticStageEnvelope({sourceHandoff:source.resultBasis.sourceResultValue,
      lifecycle:fixture.lifecycle,taskData:fixture.scenario,evaluationData:fixture.oracle,worksite:null}));
    const output=stages.resultBasis.sourceResultValue;
    assert.equal(output.applicationCoverage,"non_closing");assert.equal(output.assets.length,2);
    assert.deepEqual(output.sourceHandoff,source.resultBasis.sourceResultValue);
    assert.deepEqual(output.lifecycle.proofPolicies,fixture.lifecycle.proofPolicies);
    assert.deepEqual(output.lifecycle.proofShapes,fixture.lifecycle.proofShapes);
    const events=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix);
    const assemblies=events.filter(e=>e.kind==="actor_transport_binding_admitted");
    assert.equal(assemblies.length,4);assert.ok(assemblies.every(e=>e.payload.instructionAssembly?.kind==="native_instruction_assembly"));
    assert.ok(events.filter(e=>e.kind==="actor_result_artifact_observed").every(e=>e.payload.toolCallCount===0));
    assert.deepEqual(await inventory(harness.installedPackageRoot),immutableBefore);
    assert.deepEqual(await Promise.all(environment.productInstalls.map(i=>inventory(i.installedRoot))),installedBefore);
    const proof={disposition:"deterministic_stage_relation_demonstrated",semanticMeaningQualified:false,source,stages,assemblies,observedCalls,
      closeHandoff,artifactDigest:abiArtifact.artifactDigest,consumerArtifactDigest:fixture.basis.artifactDigest};
    await writeFile(join(installedHarness.scratch,"proof.json"),JSON.stringify(proof,null,2)+"\n",{flag:"wx"});
    console.log(JSON.stringify({disposition:proof.disposition,stages:2,actors:4,sourceMembers:5,pairedObligations:10,coverage:output.applicationCoverage}));
  } catch(error) {
    await writeFile(join(scratch,`first-cause-${Date.now()}.json`),JSON.stringify({phase,name:error.name,message:error.message,stack:error.stack,observedCalls,preflight},null,2)+"\n",{flag:"wx"});
    throw error;
  }
});
