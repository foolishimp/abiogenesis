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
test("D1 native operating-basis projection conserves exact preparation identity", async t => {
  // Opt-in read-only counterexample: supply a closed proof observation record
  // containing its durable prefix and bridgeResult admissionOrdinal. No run,
  // actor, event append, fixture normalization or synthetic admission occurs.
  const evidencePath = process.env.ABI5_D1_NATIVE_PROJECTION_EVIDENCE;
  if (!evidencePath) {
    t.skip("requires an explicit closed native proof observation record"); return;
  }
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  const product = await import(pathToFileURL(join(packageRoot, "build/code/src/product/index.js")).href);
  const semantic = await import(pathToFileURL(join(packageRoot, "build/code/src/product/semantic_stage.js")).href);
  const abg = await import(pathToFileURL(join(packageRoot, "build/code/src/abg/index.js")).href);
  const { ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS: semantics } = await import(
    pathToFileURL(join(packageRoot, "build/code/src/product/builtin_semantics.js")).href);
  const events = abg.readRuntimeEventsAtDurablePrefix(evidence.prefix);
  const result = events.find(e => e.admissionOrdinal === evidence.bridgeResult.admissionOrdinal);
  assert.equal(result?.kind, "c_call_result_admitted");
  assert.equal(result.payload.valueDigest, evidence.bridgeResult.valueDigest);
  const bases = events.filter(e => e.kind === "basis_admitted" && e.basisId === result.basisId);
  assert.equal(bases.length, 1, "one exact admitted bridge input basis");
  const envelope = bases[0].payload.rawInputValue, original = result.payload.value;
  assert.equal(product.isSemanticStageEnvelope(envelope), true);
  assert.equal(original.kind, "worksite_command_preparation_input");
  assert.equal(product.sha256Canonical(envelope), bases[0].payload.rawInputDigest);
  assert.equal(product.sha256Canonical(original), result.payload.valueDigest);
  const task = original.constructionTask;
  const picked = { workspaceAuthorityBasis: task.workspaceAuthorityBasis,
    workspaceBinding: task.workspaceBinding, capabilityGrant: task.capabilityGrant };
  assert.ok(Object.keys(task).length > Object.keys(picked).length,
    "the actual complete C1 task, not a fixture-normalized basis, reaches the owner");
  const projected = semantic.projectSemanticWorksiteCoordinates(envelope.worksite, task);
  assert.ok(projected);
  assert.deepEqual(Object.keys(projected).sort(), Object.keys(envelope.worksite).sort(),
    "caller-only task metadata never becomes semantic inventory");
  assert.deepEqual(projected, semantic.projectSemanticWorksiteCoordinates(envelope.worksite, picked));
  for (const target of task.targets) assert.deepEqual(projected.targets.find(row =>
    row.target.subject.relativePath === target.subject.relativePath)?.target, target,
  "actual selected current target identities and their historical observations are preserved");
  for (const [i, row] of projected.targets.entries()) {
    const before = envelope.worksite.targets[i].target.predecessorObservation;
    const after = row.target.predecessorObservation;
    for (const key of ["state", "fileIdentity", "fileDigest", "byteLength"])
      assert.deepEqual(after[key], before[key], "historical physical observation " + key);
  }
  assert.deepEqual(projected.targets.map(row => row.base64), envelope.worksite.targets.map(row => row.base64));
  const derived = semantic.deriveSemanticWorksitePreparation(envelope, task);
  assert.deepEqual(derived, semantic.deriveSemanticWorksitePreparation(envelope, picked));
  assert.deepEqual(derived, original, "full preparation, prompt bytes, digests and refs equal the admitted original");
  const judgment = events.find(e => e.kind === "c_call_judged" && e.payload.cCallRef === result.payload.cCallRef);
  assert.ok(judgment);
  const relation = semantics.resolveJudgmentRelation(judgment.payload.predicateRef);
  assert.ok(relation);
  assert.equal(relation.evaluate(envelope, original), true, "actual unchanged built-in bridge predicate");
  for (const [label, mutate] of [
    ["stale authority", basis => { basis.workspaceAuthorityBasis.authorityBasisDigest = product.sha256Canonical("stale authority"); }],
    ["foreign workspace", basis => { basis.workspaceBinding.workspaceId += "/foreign"; }],
    ["foreign grant actor", basis => { basis.capabilityGrant.actorRef += "/foreign"; }],
    ["malformed authority", basis => { basis.workspaceAuthorityBasis = null; }],
  ]) {
    const crossed = structuredClone(task); mutate(crossed);
    assert.equal(semantic.projectSemanticWorksiteCoordinates(envelope.worksite, crossed), null, label);
    assert.equal(semantic.deriveSemanticWorksitePreparation(envelope, crossed), null, label);
    assert.equal(relation.evaluate(envelope, { ...original, constructionTask: crossed }), false, label);
  }
  const changedPrompt = { ...original, constructionTask: product.constructWorksiteConstructionTask({
    ...task, prompt: task.prompt + "\nDifferent task instruction." }) };
  assert.equal(relation.evaluate(envelope, changedPrompt), false,
    "projection does not weaken full admitted task equality");
  assert.equal(product.sha256Canonical(abg.readRuntimeEventsAtDurablePrefix(evidence.prefix)),
    product.sha256Canonical(events), "the exact closed admitted prefix is unchanged");
});

test("D1 assessor statement domain matches native assembly and preserves strict relation refusals", { timeout: 180_000 }, async t => {
  // Explicit closed evidence, never an implicit dependency on one scratch Run.
  // This regression reads admitted inputs and invokes existing pure owners;
  // its lawful synthetic candidate is not substituted into saved output/history.
  const evidencePath = process.env.ABI5_D1_ASSESSOR_DOMAIN_EVIDENCE;
  const predecessorRoot = process.env.ABI5_D1_ASSESSOR_PREDECESSOR_ROOT;
  if (!evidencePath || !predecessorRoot) { t.skip("requires explicit closed native observations and predecessor package"); return; }
  const load = (root, name) => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
  const [store, prefixes, executions, calls, cursors, materialize, native, instructions, traversal, meaning, digests,
    priorMeaning, priorInstructions] = await Promise.all([
    ...["abg/event_store", "abg/event_prefix", "abg/execution_basis", "abg/c_call", "abg/traversal_cursor", "gtl/materialize",
      "abg/semantic_stage", "abg/instruction_assembly", "hog/traversal", "product/semantic_stage", "shared/digests"].map(name => load(packageRoot, name)),
    load(predecessorRoot, "product/semantic_stage"), load(predecessorRoot, "abg/instruction_assembly")]);
  const closed = JSON.parse(await readFile(evidencePath, "utf8"));
  const allEvents = store.readRuntimeEventsAtDurablePrefix(closed.prefix);
  const bindings = allEvents.filter(e => e.kind === "actor_transport_binding_admitted" && e.payload.instructionAssembly);
  const binding = bindings.findLast(e => e.payload.instructionAssembly.plan.role === "assessor" &&
    Array.isArray(e.payload.instructionAssembly.envelope.sections.predecessors) && e.payload.instructionAssembly.envelope.sections.predecessors.length > 1);
  assert.ok(binding, "actual two-asset native assessor request is required");
  const saved = binding.payload.instructionAssembly;
  const inputs = allEvents.filter(e => e.kind === "c_call_result_admitted" && e.payload.resultRef === saved.envelope.inputRef);
  assert.equal(inputs.length, 1);
  const input = inputs[0].payload.value, asset = input.assets.at(-1), stageRef = saved.plan.stageRef;
  const originalInputDigest = digests.sha256Canonical(input);
  assert.equal(originalInputDigest, binding.payload.inputDigest);
  const observations = allEvents.filter(e => e.kind === "actor_result_artifact_observed" && e.payload.cCallRef === binding.payload.cCallRef);
  assert.equal(observations.length, 1);
  const observed = observations[0].payload, raw = JSON.parse(observed.finalOutput);
  const originalRawDigest = digests.sha256Canonical(raw);
  const source = { cCallRef: binding.payload.cCallRef, inputDigest: observed.inputDigest,
    actorInvocationRef: observed.actorInvocationRef, promptDigest: observed.promptDigest, transportDigest: observed.transportDigest };
  assert.equal(source.inputDigest, originalInputDigest);
  const domain = meaning.semanticAssessmentStatementDomain(input);
  assert.deepEqual(domain, { assetRef: asset.assetRef, statementRefs: asset.candidate.statements.map(s => s.statementRef) });
  assert.ok(Object.isFrozen(domain) && Object.isFrozen(domain.statementRefs));
  assert.equal(meaning.semanticAssessmentStatementDomain({ ...input, assets: [] }), null);
  const earlierRefs = new Set(input.assets.slice(0, -1).flatMap(a => a.candidate.statements.map(s => s.statementRef)));
  const invalidRefs = raw.criteria.flatMap(c => c.statementRefs).filter(ref => !domain.statementRefs.includes(ref));
  assert.ok(invalidRefs.length > 0 && invalidRefs.every(ref => earlierRefs.has(ref)), "actual counterexample cites predecessor statements");
  for (const owner of [priorMeaning, meaning]) assert.equal(owner.deriveSemanticAssessment(input, stageRef, raw, source), null,
    "the original mixed-reference response stays refused, never filtered or rescued");
  const stage = input.lifecycle.stages.find(s => s.declarationRef === stageRef);
  const lawful = { kind: "semantic_stage_assessment_candidate", schemaVersion,
    criteria: stage.rubric.map((c, i) => ({ criterionRef: c.criterionRef, disposition: "indeterminate",
      explanation: "Synthetic field-domain conservation witness, not semantic acceptance.",
      sourceQuotes: raw.criteria[i].sourceQuotes, statementRefs: [...domain.statementRefs] })), pressure: [] };
  const admitted = meaning.deriveSemanticAssessment(input, stageRef, lawful, source);
  assert.ok(admitted);
  assert.equal(admitted.assets.at(-1).assessment.disposition, "indeterminate");
  assert.deepEqual(admitted, priorMeaning.deriveSemanticAssessment(input, stageRef, lawful, source), "admission meaning is unchanged");
  const emptyRefs = structuredClone(lawful); for (const criterion of emptyRefs.criteria) criterion.statementRefs = [];
  assert.ok(meaning.deriveSemanticAssessment(input, stageRef, emptyRefs, source), "empty reference arrays remain lawful");
  for (const [label, mutate] of [
    ["predecessor ref", value => { value.criteria[0].statementRefs = [invalidRefs[0]]; }],
    ["unknown ref", value => { value.criteria[0].statementRefs = ["statement://assessor-domain.example/not-in-candidate"]; }],
    ["ungrounded quote", value => { value.criteria[0].sourceQuotes = [{ memberRef: raw.criteria[0].sourceQuotes[0].memberRef, quote: "Not an original source quotation." }]; }],
    ["rubric order", value => { value.criteria.reverse(); }],
    ["rubric cardinality", value => { value.criteria.pop(); }],
  ]) {
    const changed = structuredClone(lawful); mutate(changed);
    assert.equal(meaning.deriveSemanticAssessment(input, stageRef, changed, source), null, label);
    assert.equal(priorMeaning.deriveSemanticAssessment(input, stageRef, changed, source), null, "prior " + label);
  }
  assert.equal(meaning.deriveSemanticAssessment(input, stageRef, lawful, { ...source, actorInvocationRef: asset.source.actorInvocationRef }), null,
    "author cannot assess itself");
  assert.equal(meaning.deriveSemanticAssessment(input, input.assets[0].stageRef, lawful, source), null, "wrong stage refuses");
  assert.equal(meaning.deriveSemanticAssessment(admitted, stageRef, lawful, source), null, "already assessed candidate refuses");

  const callPaths = Object.keys(closed.rawFileHashes).filter(path => /^call-\d+\.jsonl$/u.test(path));
  assert.equal(callPaths.length, 1, "closed packet identifies one native public call");
  const callBytes = await readFile(join(closed.scratch, callPaths[0]));
  assert.equal(digests.sha256Bytes(callBytes), "sha256:" + closed.rawFileHashes[callPaths[0]]);
  const publications = JSON.parse(callBytes).invocation.resources.catalog.boundPublications;
  function rehydrate(savedAssembly) {
    const durable = savedAssembly.envelope.predecessorPrefix;
    const events = store.readRuntimeEventsAtDurablePrefix(durable), prefix = prefixes.selectValidatedRuntimeEventPrefix(events);
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === savedAssembly.envelope.cCallRef);
    assert.ok(opened);
    const execution = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(execution);
    const publication = publications.find(p => p.programs.some(row => row.programRef === execution.programRef));
    const lifecyclePublication = publications.find(p => p.semanticLifecycle?.declarationRef === execution.rawInputValue.lifecycle.declarationRef);
    const sourcePublication = publications.find(p => p.requirementHandoffs?.some(row => row.declarationRef === lifecyclePublication.semanticLifecycle.sourceDeclarationRef));
    const declarations = publications.flatMap(p => p.graphFunctions), graphFunction = declarations.find(g => g.name === execution.graphFunctionRef);
    const graph = materialize.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
    const entered = events.find(e => e.kind === "traversal_cursor_entered" && e.graphCallId === opened.graphCallId && e.basisId === opened.basisId);
    assert.ok(entered); const cp = entered.payload;
    let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
      traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
      graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
      position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
    assert.equal(cursor.cursorDigest, cp.cursorDigest);
    cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
    assert.equal(cursor?.kind, "traversal_cursor");
    if (savedAssembly.plan.role === "assessor") cursor = traversal.deriveCompletedTraversalCursor(graph, cursor,
      { inputRef: savedAssembly.envelope.inputRef, inputDigest: savedAssembly.envelope.inputDigest });
    assert.equal(cursor?.cursorDigest, opened.payload.cursorDigest, "existing HoG derivation recreates the exact admitted cursor");
    const basis = { publication, lifecyclePublication, sourcePublication, graph, graphFunction, declarationGraphFunctions: declarations,
      executionBasis: execution, cCall, cursor, predecessorPrefix: durable };
    assert.ok(native.authenticateSemanticStageBasis(basis));
    const exactInput = native.semanticInputValueAtBasis(basis);
    assert.equal(native.semanticInputMatchesBasis(basis, exactInput), true);
    return { basis, exactInput };
  }
  const { basis, exactInput } = rehydrate(saved);
  assert.deepEqual(exactInput, input);
  assert.deepEqual(priorInstructions.constructNativeInstructionAssembly(basis, input), saved, "original full request rederives against saved admitted basis");
  const current = instructions.constructNativeInstructionAssembly(basis, input); assert.ok(current);
  assert.deepEqual(instructions.constructNativeInstructionAssembly(basis, input), current, "complete new assembly rederives deterministically");
  assert.deepEqual(current.plan, saved.plan);
  assert.deepEqual(current.envelope.sections.role.stdo, saved.envelope.sections.role.stdo);
  for (const section of ["source", "obligations", "predecessors", "worksite", "evidence", "task"])
    assert.deepEqual(current.envelope.sections[section], saved.envelope.sections[section], section + " is conserved");
  const role = current.envelope.sections.role.native ?? current.envelope.sections.role;
  assert.ok(role.includes(JSON.stringify(domain.assetRef)));
  assert.ok(role.includes("Eligible current-candidate statement refs: " + JSON.stringify(domain.statementRefs)));
  assert.match(role, /predecessor assets remain contextual evidence/u);
  const projectedSchema = current.request.responseJsonSchema;
  assert.match(projectedSchema.properties.criteria.items.properties.statementRefs.description, /exact current candidate/u);
  const schemaWithoutDescription = structuredClone(projectedSchema);
  delete schemaWithoutDescription.properties.criteria.items.properties.statementRefs.description;
  assert.deepEqual(schemaWithoutDescription, saved.request.responseJsonSchema, "only the existing field's description changes");
  assert.notEqual(current.manifest.promptDigest, saved.manifest.promptDigest);
  assert.equal(current.request.inputDigest, saved.request.inputDigest);
  for (const row of current.manifest.sections) assert.equal(row.digest, digests.sha256Canonical(current.envelope.sections[row.name]));
  assert.equal(current.envelopeDigest, digests.sha256Canonical(current.envelope));
  assert.equal(current.manifestDigest, digests.sha256Canonical(current.manifest));
  assert.ok(instructions.nativeInstructionRequestMatches(basis, input, current.request));
  assert.equal(instructions.nativeInstructionRequestMatches(basis, input, saved.request), false, "old ambiguous request cannot pass as repaired assembly");
  const stale = structuredClone(input); stale.assets.at(-1).candidate.statements[0].statementRef += "/stale";
  assert.equal(instructions.constructNativeInstructionAssembly(basis, stale), null, "same-shaped stale input refuses before dispatch");
  const author = bindings.findLast(e => e.payload.instructionAssembly.plan.role === "author" && e.payload.instructionAssembly.plan.stageRef === stageRef);
  assert.ok(author);
  const authorSaved = author.payload.instructionAssembly, authorBasis = rehydrate(authorSaved);
  assert.deepEqual(instructions.constructNativeInstructionAssembly(authorBasis.basis, authorBasis.exactInput), authorSaved, "author assembly is unchanged");
  assert.equal(digests.sha256Canonical(input), originalInputDigest);
  assert.equal(digests.sha256Canonical(raw), originalRawDigest);
  assert.deepEqual(store.readRuntimeEventsAtDurablePrefix(closed.prefix), allEvents, "closed history is unchanged");
  console.log(JSON.stringify({ kind: "assessor_field_domain_native_rederivation", assetRef: domain.assetRef,
    eligibleStatementCount: domain.statementRefs.length, originalInvalidReferenceCount: invalidRefs.length,
    oldPromptDigest: saved.manifest.promptDigest, newPromptDigest: current.manifest.promptDigest,
    manifestDigest: current.manifestDigest, authorConserved: true, originalMixedResponseRefused: true,
    syntheticCurrentOnlyDisposition: "indeterminate", newNativeExecution: false }));
});

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
