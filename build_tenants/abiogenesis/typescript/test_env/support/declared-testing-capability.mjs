import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { prepareStdoNoteProduct, pilotResources } from "./stdo-environment-pilot.mjs";
import { constructInstalledPublicDefinitionCall } from "./installed-public-definition-call.mjs";
import { expectedVerificationIdentity } from "./candidate-basis.mjs";
import { importInstalledPackageExport, setupInstalledCliHarness } from "./root-cli-environment.mjs";

const exec = promisify(execFile);
const schemaVersion = "5.0.0";
const actorRef = "actor://declared-testing.example/proof";
const zeros = "sha256:" + "0".repeat(64);
export const checkerRef = letter => "command://declared-testing.example/check-" + letter;
export const LIVE_TESTING_TRANSPORT = Object.freeze({
  command: "/Users/jim/.local/share/claude/versions/2.1.263", model: "claude-fable-5-1", effort: "xhigh",
});
export function testingExecutionConfig(environment = process.env) {
  const mode = environment.ABI5_TESTING_MODE ?? "mechanical";
  assert.ok(["mechanical", "live"].includes(mode), "testing mode must be mechanical or live");
  const live = mode === "live";
  if (live) assert.equal(environment.ABI5_TESTING_ALLOW_LIVE, "1", "live mode requires explicit separate runtime activation");
  const requestedBudget = environment.ABI5_TESTING_NATIVE_BUDGET_MS;
  const nativeBudgetMs = requestedBudget === undefined ? (live ? 2_400_000 : 1_200_000) : Number(requestedBudget);
  if (requestedBudget !== undefined) {
    assert.ok(live, "extended caller observation requires separately activated live mode");
    assert.ok(Number.isSafeInteger(nativeBudgetMs) && nativeBudgetMs >= 2_400_000 && nativeBudgetMs <= 7_200_000,
      "live caller observation must be between 40 and 120 minutes");
  }
  const requestedActorAbsolute = environment.ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS;
  const liveActorAbsoluteMs = requestedActorAbsolute === undefined ? 240_000 : Number(requestedActorAbsolute);
  if (requestedActorAbsolute !== undefined) {
    assert.ok(live, "actor allowance requires separately activated live mode");
    assert.ok(Number.isSafeInteger(liveActorAbsoluteMs) && liveActorAbsoluteMs >= 240_000 && liveActorAbsoluteMs <= 600_000,
      "live actor absolute allowance must be between 240000 and 600000 milliseconds");
  }
  return Object.freeze({ mode, live, nativeBudgetMs,
    outerBudgetMs: requestedBudget === undefined ? 3_300_000 : Math.max(3_300_000, nativeBudgetMs + 1_200_000),
    freshReadbackBudgetMs: requestedBudget === undefined ? 45_000 : 300_000,
    readbackReserveMs: 300_000, cleanupReserveMs: 300_000,
    environment: live ? Object.freeze({ ABG_TS_CLAUDE_COMMAND: LIVE_TESTING_TRANSPORT.command,
      ABG_TS_CLAUDE_APPEND_ARGS: JSON.stringify(["--model", LIVE_TESTING_TRANSPORT.model]),
      CLAUDE_CODE_EFFORT_LEVEL: LIVE_TESTING_TRANSPORT.effort,
      // Existing process policy is invocation-wide, not specific to an Evidence actor.
      ABG_TS_FP_TIMEOUT_MS: "120000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: String(liveActorAbsoluteMs), ABG_TS_FP_TERMINATION_GRACE_MS: "1000" })
      : Object.freeze({ ABG_TS_FP_TIMEOUT_MS: "60000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: "120000", ABG_TS_FP_TERMINATION_GRACE_MS: "1000" }) });
}

// Prospective domain criteria, not candidate responses or expected dispositions.
export const TESTING_CHECKER_SUCCESS_CRITERION = "The selected declared checker must execute at least one meaningful passing test: the verifier imports the actual application and checks answer() against the source-defined expected value. Read the recorded TAP summary and exit status together: require at least one passed test, exit status zero, no failed tests and no timeout. Zero discovered tests is not success. This is a prospective success criterion, not an observed result or an instruction to report success.";
export const TESTING_ROLE_POLICY = "Apply only the supplied role and exact native task. Consider declared checking operations and bounded proof scope; preserve missing support. The retrieved Executive projection is supporting corpus, not role or effect authority. " + TESTING_CHECKER_SUCCESS_CRITERION + " Assess construction readiness before execution, and assess actual evidence only when supplied. Empty report declarations or process outcome predicates do not remove this semantic proof obligation. Do not invent observations or acceptance.";

// Current setup facts travel as ordinary declared taskData, never as an ABG
// observation or a substituted checker result. A future invocation re-observes.
export async function observeTestingToolchain(product) {
  const executable = process.execPath, canonicalExecutable = await realpath(executable);
  const executableDigest = await product.sha256File(canonicalExecutable);
  const testModule = await import("node:test");
  assert.equal(typeof testModule.test, "function");
  const version = await exec(executable, ["--version"], { timeout: 5_000, maxBuffer: 16_384 });
  assert.equal(version.stdout.trim(), process.version, "declared checker executable is the current preparation runtime");
  assert.equal(await product.sha256File(canonicalExecutable), executableDigest, "toolchain bytes remained stable during setup observation");
  return { kind: "consumer_toolchain_availability_fact", executable, canonicalExecutable, executableDigest,
    runtimeVersion: process.version, platform: process.platform, architecture: process.arch,
    observedPreparationFeatures: ["This .mjs ES module loaded in the current runtime.", "node:assert/strict imported successfully.", "node:test imported successfully and exports a test function."],
    observedCommand: { executable, args: ["--version"], exitStatus: 0, stdout: version.stdout, stderr: version.stderr },
    availabilityPremise: "Both declared checkers use this same executable. It is the Node runtime executing this preparation; its version command succeeded with the recorded bytes. This warrants attempting the declared Node checker, not a claim that the not-yet-constructed application or verifier runs or passes. Command execution must supply that evidence; changed or inadequate prerequisites remain unresolved." };
}

export function testingStageMeaning(stage) {
  if (stage === "design") return {
    assetKind: "declared_testing_design",
    purpose: "Select one permitted checker and pair implementation and verifier targets for the original source requirement; preserve unresolved dependencies.",
    requiredContent: ["Identify the granted implementation and verifier targets and their paired source obligation.",
      "Select exactly one available command that executes the verifier against the application; explain its relevance and any missing support."],
    rubric: [{ criterionRef: "criterion://declared-testing.example/design/source-and-targets@5",
      instruction: "Assess whether the Design preserves the original answer() requirement and pairs the granted implementation and verifier targets with the source obligation, without widening writes or inventing dependencies." },
    { criterionRef: "criterion://declared-testing.example/design/checker-selection@5",
      instruction: "Assess whether exactly one selected command is declared and can execute a verifier that imports the actual application and checks answer() against the source requirement. " + TESTING_CHECKER_SUCCESS_CRITERION + " Missing support or uncertain dependencies must remain explicit; a Design is not execution evidence." }],
  };
  assert.equal(stage, "evidence");
  return {
    assetKind: "declared_testing_evidence_assessment",
    purpose: "Assess the supplied same-invocation construction and actual checker evidence against the original requirement and declared proof obligation.",
    requiredContent: ["Explain what the actual implementation, verifier and selected-command observation establish, citing supplied source and predecessor statements.",
      "Distinguish observed test outcomes from unsupported claims and retain all non-closing application gaps. Do not select new worksite changes."],
    rubric: [{ criterionRef: "criterion://declared-testing.example/evidence/application-and-verifier@5",
      instruction: "Inspect the supplied implementation and verifier artifacts: the application must implement answer() = 42, and the verifier must import and exercise that application and assert the required value rather than hardcode a passing outcome. Compare against evaluationData when supplied; absent or inadequate artifacts do not satisfy this criterion." },
    { criterionRef: "criterion://declared-testing.example/evidence/actual-execution@5",
      instruction: "Assess the actual supplied C2 command identity, argv, streams, exit status and timeout together with the admitted Design. " + TESTING_CHECKER_SUCCESS_CRITERION + " An actor assertion or well-formed carrier alone is not proof." },
    { criterionRef: "criterion://declared-testing.example/evidence/scope@5",
      instruction: "Keep this bounded requirement witness distinct from whole-Product qualification. Preserve unresolved pressure and non-closing gaps; do not infer unsupported capability or acceptance from structural validity." }],
  };
}
export const implementationText = "export const answer = () => 42;\n";
export const verifierText = `import test from 'node:test';
import assert from 'node:assert/strict';
import { answer } from './app.mjs';
test('declared independent answer oracle', () => assert.equal(answer(), 42));
`;

export function nativePublications(gtl, artifact) {
  const basis = { ...artifact, productManifestDigest: artifact.manifestDigest };
  return [gtl.constructHelloWorldModulePublication, gtl.constructConsensusModulePublication,
    gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructWorksiteCommandForwardModulePublication, gtl.constructRequirementHandoffModulePublication,
    gtl.constructSemanticStageModulePublication, gtl.constructSemanticRevisionModulePublication,
    gtl.constructSelfConformanceModulePublication].map(construct => construct(basis));
}

// Test-owned GTL composition over the existing preparation/C1/C2 declarations.
// This is declaration data, not an alternate runtime or event writer.
function worksiteGraph(gtl, product, publications) {
  const c1 = product.WORKSITE_CONSTRUCTION_IDS, c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const p = product.WORKSITE_PREPARATION_IDS;
  const all = publications.flatMap(x => x.graphFunctions);
  const c1Graph = all.find(g => g.name === c1.graphFunctionRef), c2Graph = all.find(g => g.name === c2.graphFunctionRef);
  const c2Publication = publications.find(p => p.graphFunctions.includes(c2Graph));
  const name = "graph-function://declared-testing.example/worksite@5";
  const closureRef = "contract://declared-testing.example/worksite/closure@5";
  const node = role => name + "/" + role;
  const pure = (role, bindingRef, predicateRef) => {
    const binding = c2Publication.implementationBindings.find(b => b.bindingRef === bindingRef);
    return { nodeRef: node(role), nodeKind: "c_locus", term: gtl.C.of({
      input: gtl.cCarrier(binding.inputContractRef), output: gtl.cCarrier(binding.outputContractRef),
      programLocusRef: node(role), stageRole: role, fibre: "F_D", armId: node(role) + "/arm",
      compositionRef: null, vectorIndex: 0, judgmentPredicateRef: predicateRef, resultBearing: false,
      requirement: { kind: "executable_leaf_requirement", implementationBindingRef: bindingRef,
        inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef,
        evidenceContractRef: c2.evidenceContractRef, failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef, judgmentContractRef: c2.judgmentContractRef } }) };
  };
  const call = (role, graph) => ({ nodeRef: node(role), nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
      input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) })) });
  const provided = [c1.taskContractRef, c1.resultContractRef, p.boundInputContractRef, c2.taskContractRef, c2.observationContractRef];
  const graph = { kind: "graph_function", name, version: schemaVersion,
    environment: { requires: [p.inputContractRef], provides: provided, carries: [p.inputContractRef, ...provided] },
    inputs: [p.inputContractRef], outputs: [c2.observationContractRef], effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])],
    tags: ["declared-testing-capability-witness"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": closureRef, "abg.child_closure_contract": closureRef,
      "abg.failure_contract": c2.failureContractRef, "abg.evidence_contract": c2.evidenceContractRef,
      "abg.judgment_contract": c2.judgmentContractRef, "abg.judgment_predicate": p.rootPredicateRef, "abg.transition_contract": c2.transitionContractRef },
    template: { kind: "inline_graph", graphRef: name + "/graph", startNodeRef: node("select"), terminalNodeRefs: [node("execute")],
      nodes: [pure("select", p.selectBindingRef, p.selectPredicateRef), call("construct", c1Graph),
        pure("prepare", p.prepareBindingRef, p.preparePredicateRef), call("execute", c2Graph)],
      edges: [gtl.graphEdge({ fromNodeRef: node("select"), toNodeRef: node("construct") }),
        gtl.graphEdge({ fromNodeRef: node("construct"), toNodeRef: node("prepare"), inputBinding: product.worksiteRetentionBinding() }),
        gtl.graphEdge({ fromNodeRef: node("prepare"), toNodeRef: node("execute") })], applications: [] } };
  const closure = gtl.closureContract({ ...c2Publication.closureContracts.find(c => c.closureContractRef === c2.closureContractRef),
    closureContractRef: closureRef, predicateRef: p.rootPredicateRef, closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] });
  return { graph, closure, closureDeclaration: { ...c2Publication.contracts.find(c => c.contractRef === c2.closureContractRef), contractRef: closureRef },
    membership: [c1.graphFunctionRef, c1.vectorApplicationGraphFunctionRef, c1.fileReplaceGraphFunctionRef, c1.reducerGraphFunctionRef, c2.graphFunctionRef] };
}

export async function prepareTestingProduct({ scratch, product, gtl, abiArtifact, inputRoot }) {
  const original = await prepareStdoNoteProduct({ scratch, product, gtl, abiArtifact, inputRoot });
  const sourcePath = join(original.sourceRoot, "build/source-publication.json"), publicationPath = join(original.sourceRoot, "build/publication.json");
  const source = JSON.parse(await readFile(sourcePath, "utf8")), publication = JSON.parse(await readFile(publicationPath, "utf8"));
  const sourceBytes = Buffer.from("# Declared testing capability witness\n\nConstruct proof/app.mjs exporting answer() = 42 and proof/verifier.test.mjs which imports and checks that function using node:test. Select exactly one permitted checker; preserve paired implementation and verifier obligations. Execute at least one meaningful test of the actual application. Evidence must come from the actual selected checker, not an actor assertion.\n");
  const declaration = source.requirementHandoffs[0], member = declaration.context.members[0];
  member.byteCount = sourceBytes.length; member.digest = product.sha256Bytes(sourceBytes);
  declaration.context.inventoryDigest = product.sha256Canonical(declaration.context.members);
  const binding = { contextRef: declaration.context.contextRef, memberRef: member.memberRef, memberDigest: member.digest,
    startByte: 0, endByte: sourceBytes.length, spanDigest: member.digest };
  declaration.terms.forEach(t => { t.sourceBindings = [binding]; });
  source.requirementHandoffs = [gtl.constructRequirementHandoffDeclaration(declaration)];
  const sourceInput = product.constructRequirementHandoffInput({ ...original.source.input,
    members: [{ memberRef: member.memberRef, base64: sourceBytes.toString("base64") }] });
  const scenario = { question: "Select exactly one declared checking operation for the bounded implementation/verifier task; preserve gaps and use actual evidence.",
    toolchainAvailability: await observeTestingToolchain(product) };
  const oracle = { expectedAnswer: 42, requiredCheckerPasses: 1 };
  const lifecycle = structuredClone(original.lifecycle), first = lifecycle.stages[0];
  lifecycle.taskDataDigest = product.sha256Canonical(scenario); lifecycle.evaluationDataDigest = product.sha256Canonical(oracle);
  lifecycle.proofPolicies[0] = { ...lifecycle.proofPolicies[0], sourceBindings: [binding], scope: "One bounded declared-checker witness over the supplied original requirement",
    realizationMeaning: ["The implementation exports answer() = 42."], proofMeaning: ["The verifier imports the application and checks the independently fixed expected value."],
    unprovedScope: ["Unexecuted transport or user populations and whole Product qualification."], closureRule: "Preserve non-closing application coverage and distinguish observed from unexecuted claims." };
  lifecycle.proofShapes[0] = { ...lifecycle.proofShapes[0], requiredEvidenceRoles: ["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"],
    requiredContent: ["Actual selected command execution and same-invocation evidence."], nativeCarrierBoundary: "Existing C1 and C2 owners plus semantic evidence bridge." };
  const designMeaning = testingStageMeaning("design"), evidenceMeaning = testingStageMeaning("evidence");
  first.assetSurface.kind = designMeaning.assetKind;
  first.purpose = designMeaning.purpose; first.bodyCapabilities = ["worksite_design"];
  first.requiredContent = designMeaning.requiredContent; first.rubric = designMeaning.rubric;
  first.assembly = { ...first.assembly, contentPolicy: "role_scoped_worksite", worksiteContentByRole: { author: "current_inventory", assessor: "current_inventory" } };
  const evidenceStage = structuredClone(first);
  for (const key of ["declarationRef", "graphFunctionRef", "authorLocusRef", "assessorLocusRef"]) evidenceStage[key] += "/evidence";
  evidenceStage.assembly.graphFunctionRef = evidenceStage.graphFunctionRef; evidenceStage.assembly.ruleRef += "/evidence";
  evidenceStage.assembly.worksiteContentByRole = { author: "not_required", assessor: "not_required" };
  evidenceStage.predecessorStageRefs = [first.declarationRef]; evidenceStage.bodyCapabilities = ["application_assessment"];
  evidenceStage.assetSurface.kind = evidenceMeaning.assetKind;
  evidenceStage.purpose = evidenceMeaning.purpose;
  evidenceStage.requiredContent = evidenceMeaning.requiredContent; evidenceStage.rubric = evidenceMeaning.rubric;
  lifecycle.stages = [first, evidenceStage]; publication.semanticLifecycle = gtl.constructSemanticLifecycleDeclaration(lifecycle);
  const natives = nativePublications(gtl, abiArtifact), worksite = worksiteGraph(gtl, product, natives), ids = gtl.SEMANTIC_STAGE_IDS;
  const closures = [], close = (label, predicateRef, resultContractRef, closureScope = "graph_call") => {
    const closureContractRef = "contract://declared-testing.example/" + label + "/closure@5";
    closures.push(gtl.constructSemanticClosureContract({ closureContractRef, predicateRef, resultContractRef, closureScope })); return closureContractRef;
  };
  const stageGraphs = lifecycle.stages.map((s, i) => gtl.constructSemanticStageGraphFunction(s, close("stage-" + i, ids.assessorPredicateRef, ids.envelopeContractRef)));
  const bridge = (label, operation, predicateRef, resultContractRef) => gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: "graph-function://declared-testing.example/" + label + "@5", nodeRef: "node://declared-testing.example/" + label + "@5",
    operation, closureContractRef: close(label, predicateRef, resultContractRef) });
  const chain = [stageGraphs[0], bridge("design-worksite", "design_worksite", ids.bridgePredicateRef, product.WORKSITE_PREPARATION_IDS.inputContractRef),
    worksite.graph, bridge("evidence-input", "evidence_input", ids.evidenceInputPredicateRef, ids.envelopeContractRef), stageGraphs[1],
    bridge("terminal", "envelope_output", ids.terminalPredicateRef, ids.outputContractRef)];
  const root = structuredClone(publication.graphFunctions.find(g => g.name === original.ids.graphFunctionRef));
  const nodes = chain.map((g, i) => ({ nodeRef: root.name + "/step-" + i, nodeKind: "c_locus", term: gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: g.name, input: gtl.cCarrier(g.inputs[0]), output: gtl.cCarrier(g.outputs[0]) })) }));
  root.template = { ...root.template, startNodeRef: nodes[0].nodeRef, terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
    edges: nodes.slice(1).map((n, i) => gtl.graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: n.nodeRef })) };
  const contracts = [...new Set(chain.flatMap(g => [...g.inputs, ...g.outputs]))];
  root.environment = { requires: [ids.envelopeContractRef], provides: contracts, carries: contracts };
  root.effects = [...new Set(chain.flatMap(g => g.effects))]; root.declarations["abg.judgment_predicate"] = ids.lifecycleStepPredicateRef;
  root.declarations["abg.closure_contract"] = close("root", ids.lifecyclePredicateRef, ids.outputContractRef, "run");
  publication.graphFunctions = [...chain, root]; publication.closureContracts = [...closures, worksite.closure];
  const nativeClose = natives.flatMap(p => p.contracts).find(c => c.contractRef === ids.closureContractRef);
  publication.contracts = [...closures.map(c => ({ ...nativeClose, contractRef: c.closureContractRef })), worksite.closureDeclaration];
  const program = publication.programs[0]; program.callableMembership = [...new Set([...publication.graphFunctions.map(g => g.name), ...worksite.membership])];
  program.closureContractRef = root.declarations["abg.closure_contract"];
  publication.contributions = publication.graphFunctions.map(g => ({ ...publication.contributions[0], handle: g.name, declarationOrContractRef: g.name }));
  const env = structuredClone(original.env.declaration), templates = env.roles;
  env.accesses[0].frameIndexRefs = ["urn:stdo-representation:frame-index:executive-steel-thread-delivery"];
  env.roles = lifecycle.stages.flatMap(stage => templates.map(row => ({ ...row, graphFunctionRef: stage.graphFunctionRef,
    programLocusRef: row.role === "author" ? stage.authorLocusRef : stage.assessorLocusRef })));
  const allGraphs = [...publication.graphFunctions, ...natives.flatMap(p => p.graphFunctions)];
  for (const [role, ref, stageRole] of [["constructor", product.WORKSITE_CONSTRUCTION_IDS.graphFunctionRef, "candidate"],
    ["command_executor", product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef, "command-execution"]]) {
    const graph = allGraphs.find(g => g.name === ref);
    const leaf = graph.template.nodes.flatMap(n => gtl.cLeafTerms(n.term)).find(l => l.fibre === "F_P" && l.stageRole === stageRole);
    assert.ok(leaf, "existing published F_P leaf " + stageRole);
    env.roles.push({ ...templates[0], role, graphFunctionRef: ref, programLocusRef: leaf.programLocusRef });
  }
  for (const role of env.roles) {
    role.policy = { policyRef: "policy://declared-testing.example/" + role.role + "@5",
      text: TESTING_ROLE_POLICY };
    role.policy.digest = product.sha256Bytes(Buffer.from(role.policy.text));
  }
  publication.stdoRunEnvironments = [gtl.constructStdoRunEnvironmentDeclaration(env)];
  const envInfo = { ...original.env, declaration: publication.stdoRunEnvironments[0] };
  const materialize = (data, basis) => gtl.modulePublication({ ...structuredClone(data), artifactDigest: basis.artifactDigest,
    productContentDigest: basis.productContentDigest, productManifestDigest: basis.manifestDigest,
    contributions: data.contributions.map(c => ({ ...c, provenanceRefs: [basis.artifactDigest, basis.manifestDigest] })) });
  await writeFile(sourcePath, product.canonicalJson(source) + "\n");
  await writeFile(publicationPath, product.canonicalJson(publication) + "\n");
  await writeFile(join(original.sourceRoot, "build/source-input.json"), product.canonicalJson(sourceInput) + "\n");
  const manifest = structuredClone(original.manifest);
  const inventory = await Promise.all(manifest.productRelativeLocators.map(async path => ({ path, sha256: await product.sha256File(join(original.sourceRoot, path)) })));
  manifest.productContentDigest = product.payloadInventoryDigest(inventory);
  const draft = [source, publication].map(p => materialize(p, { artifactDigest: zeros, manifestDigest: zeros, productContentDigest: manifest.productContentDigest }));
  manifest.contributionManifest.productContentDigest = manifest.productContentDigest;
  manifest.contributionManifest.publicationBindings = draft.map(p => ({ moduleRef: p.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(p) }));
  manifest.contributionManifest.rows = draft.flatMap(p => p.contributions.map(c => ({ moduleRef: p.moduleRef, handle: c.handle, kind: c.kind,
    declarationOrContractRef: c.declarationOrContractRef, owningProductId: c.owningProductId, programMembershipRefs: c.programMembershipRefs,
    compatibilityRefs: c.compatibilityRefs, provenanceRef: manifest.provenanceRef, readinessPrerequisiteRefs: c.readinessPrerequisiteRefs })));
  manifest.contributionManifestDigest = product.sha256Canonical(manifest.contributionManifest);
  await writeFile(join(original.sourceRoot, "product-toolchain-manifest.json"), product.canonicalJson(manifest) + "\n");
  const artifacts = join(scratch, "testing-artifact"); await mkdir(artifacts);
  const packed = await exec("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: original.sourceRoot, maxBuffer: 10_000_000 });
  const artifactPath = join(artifacts, JSON.parse(packed.stdout)[0].filename);
  const basis = { ...original.basis, artifactDigest: await product.sha256File(artifactPath), manifestDigest: product.sha256Canonical(manifest), productContentDigest: manifest.productContentDigest };
  return { ...original, env: envInfo, lifecycle: publication.semanticLifecycle, scenario, oracle, source: { declaration: source.requirementHandoffs[0], input: sourceInput },
    basis, artifactPath, artifactRef: basename(artifactPath), manifest,
    async loadInstalledPublications({ installedRoot }) {
      return Promise.all(["build/source-publication.json", "build/publication.json"].map(async path => {
        const bytes = await readFile(join(installedRoot, path)); assert.equal(product.sha256Bytes(bytes), inventory.find(i => i.path === path).sha256);
        return materialize(JSON.parse(bytes), basis);
      }));
    } };
}

export function isTestingCommandExecutionSchema(schema) {
  return schema?.properties?.kind?.const === "worksite_command_execution_worker_result";
}

// Disclosed transport double: candidates only. C2 invokes the exact emitted
// helper command; no result/event is injected and no runtime owner is replaced.
export async function installTestingTransport(scratch, selected) {
  const path = join(scratch, "declared-testing-transport.mjs");
  const code = `#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
const isCommandExecutionSchema=${isTestingCommandExecutionSchema.toString()};
let prompt=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',x=>prompt+=x);
process.stdin.on('end',()=>{
 const schema=JSON.parse(process.argv[process.argv.indexOf('--json-schema')+1]);
 console.log(JSON.stringify({type:'system',subtype:'init',model:'explicit-transport-double'}));
 let result;
 if(schema.properties.files){
  const target=schema.properties.files.items.properties.targetRef;
  const refs=target.enum??[target.const];
  result={kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:refs.map((targetRef,i)=>({kind:'worksite_candidate_file',schemaVersion:'5.0.0',targetRef,replacementText:i===0?${JSON.stringify(implementationText)}:${JSON.stringify(verifierText)}}))};
 }else if(isCommandExecutionSchema(schema)){
  const sections={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf('\\n');try{sections[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim())}catch{}}
  const nativePrompt=sections.task?.ownerPrompt??prompt;
  const toolInput=nativePrompt.split('\\n').map(line=>{try{return JSON.parse(line)}catch{return null}}).find(value=>typeof value?.command==='string'&&value.command.includes('worksite_command_helper.js'));
  const command=toolInput?.command;
  if(!command)throw Error('exact helper command absent');
  console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_declared_testing_once',name:'Bash',input:{command,description:'Run exactly the supplied native helper once'}}]}}));
  const ran=spawnSync('/bin/sh',['-c',command],{encoding:'utf8',maxBuffer:20*1024*1024});
  if(ran.status!==0)throw Error('native helper failed: '+ran.status+' '+ran.stderr);
  result=JSON.parse(ran.stdout);
 }else{
  const sections={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf('\\n');try{sections[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim())}catch{}}
  const task=sections.task,current=sections.predecessors.at(-1),q={memberRef:sections.source[0].memberRef,quote:sections.source[0].text.slice(0,160)};
  const assessor=schema.properties.criteria!==undefined;
  const obligations=sections.obligations.sourceDeclaration.fulfillmentBindings.map(b=>b.obligationRef);
  result=assessor?{kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:task.rubric.map(c=>({criterionRef:c.criterionRef,disposition:'satisfied',explanation:'Disclosed mechanical candidate; no live semantic qualification.',sourceQuotes:[q],statementRefs:current.candidate.statements.map(s=>s.statementRef)})),pressure:[]}:
   {kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',statements:[{statementRef:task.stageRef+'/statement',text:'Mechanical actor candidate for declared checker evidence.',modality:'supporting',sourceQuotes:[q],requirementRefs:sections.obligations.sourceDeclaration.terms.map(t=>t.requirementRef),obligationRefs:obligations,predecessorStatementRefs:sections.predecessors.flatMap(a=>a.candidate.statements.map(s=>s.statementRef))}],requirementCandidates:[],pressure:[],worksiteDesign:task.bodyCapabilities.includes('worksite_design')?{targets:sections.worksite.targets.map(r=>({targetRef:r.target.targetRef,role:r.role,obligationRefs:obligations,changeInstruction:'Implement the prospectively declared source requirement.'})),commandRefs:[${JSON.stringify(checkerRef(selected))}],dependencyTargetRefs:[],dependencyDisposition:'sufficient'}:null};
 }
 console.log(JSON.stringify({type:'result',subtype:'success',result:JSON.stringify(result)}));
});
`;
  await writeFile(path, code); await chmod(path, 0o755); return path;
}

// Existing installed Public calls and owners supply every runtime effect.
// The mutable locals below retain caller receipts; they are not runtime truth.
export async function setupTestingInvocation({ packageRoot, scratch, inputRoot, deadline, executionConfig = testingExecutionConfig() }) {
  const harness = await setupInstalledCliHarness({ after() {} }, packageRoot, { candidateBasisSource: "packed_artifact", scratchPath: join(scratch, "harness") });
  const product = harness.product;
  const [gtl, abg, installedPublic, validator] = await Promise.all(["gtl", "abg", "public", "validator"].map(surface =>
    importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/" + surface, "testing-reuse")));
  const hash = product.sha256Canonical, coord = (ref, value = { ref }) => ({ ref, digest: hash(value) });
  const ownerRequest = { artifactPath: harness.artifactPath, artifactRef: harness.artifactRef, ...expectedVerificationIdentity(harness.candidateBasis) };
  const ownerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: ownerRequest });
  assert.equal(ownerVerification.kind, "product_verification_success", JSON.stringify(ownerVerification));
  const abiArtifact = ownerVerification.verifiedArtifact;
  const contractCatalog = { productId: abiArtifact.productId, productContentDigest: abiArtifact.productContentDigest,
    catalogId: abiArtifact.catalogId, catalogVersion: schemaVersion, catalogDigest: abiArtifact.catalogDigest };
  const calls = []; let ordinal = 0, environment = null, closeHandoff = null;
  const actor = { actor: coord(actorRef), attribution: coord("attribution://declared-testing.example/proof") };
  const slotsFor = (definition, supplied = {}) => ({ workspace_binding: null, product_set: null, dependency_lock: null, catalog_scope: null,
    execution_program: null, graph_function: null, input_contract: null, session_policy: null,
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [] }, actor: null, transport_steering: null,
    verification_references: null, execution_basis: null, ...supplied });
  function definitionCall(packet, request, slots, resources) {
    return constructInstalledPublicDefinitionCall({ product, installedPublic, definitionContractCoordinates: abiArtifact.definitionContractCoordinates,
      contractCatalog, ...packet.definitionKey, request, slots, resources, requestRef: "request://declared-testing.example/" + (++ordinal),
      correlationRef: "correlation://declared-testing.example/" + executionConfig.mode, eventTime: "2026-09-16T19:00:00.000Z", provenanceRefs: ["provenance://declared-testing.example/proof"] });
  }
  async function authorized(packet, request, resources, supplied = {}) {
    const definition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
      d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
    const slots = slotsFor(definition, supplied);
    const basis = { kind: "admission_capability_data", schemaVersion,
      definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
        owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
      ownerArtifact: { request: ownerRequest, verified: abiArtifact }, request,
      resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
      boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden" ? null : environment };
    const authorityValue = { actorRef, authorityMode: "trusted_developer" }, approvalValue = { decision: "allow", actorRef,
      definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
    const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef, authorityMode: "trusted_developer",
      authority: { ...coord("authority://declared-testing.example/proof", authorityValue), value: authorityValue },
      approval: { ...coord("approval://declared-testing.example/" + ordinal, approvalValue), value: approvalValue } };
    const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority, actorRef,
      definition.definitionKey.operationId, cap, { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data: basis })));
    return definitionCall(packet, request, { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) } },
      { ...resources, admissionAuthority: { basis, authority, grants } });
  }
  const reopen = () => ({ kind: "reopen_abg_event_resource", schemaVersion, closeHandoff, handoffDigest: hash(closeHandoff) });
  async function invoke(call, { transport, expectRefusal = false, native = false } = {}) {
    const path = join(scratch, "call-" + calls.length + ".jsonl"), resource = call.resources.eventResource;
    const acquisition = resource === undefined ? { kind: "eventless" } : resource.kind === "new_abg_event_resource"
      ? { kind: "new", eventLogPath: resource.eventLogPath } : { kind: "reopen", closeHandoff: resource.closeHandoff };
    await writeFile(path, JSON.stringify({ kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation: call }) + "\n");
    const env = { ...process.env, ...executionConfig.environment, NODE_OPTIONS: "", ...(transport ? { ABG_TS_CLAUDE_COMMAND: transport } : {}) };
    const remaining = Date.parse(deadline) - Date.now() - executionConfig.cleanupReserveMs;
    assert.ok(remaining > 0, "cleanup reserve reached before a new public call");
    if (native) assert.ok(remaining >= executionConfig.nativeBudgetMs + executionConfig.readbackReserveMs,
      "the one native attempt plus readback and cleanup must fit before dispatch");
    let result, processFailure = null;
    try { result = await exec(harness.cliPath, ["--jsonl", path], { cwd: harness.cliHost, env,
      timeout: Math.min(native ? executionConfig.nativeBudgetMs : 150_000, remaining), maxBuffer: 128 * 1024 * 1024 }); }
    catch (error) {
      processFailure = { code: error.code ?? null, signal: error.signal ?? null, killed: error.killed ?? false, message: error.message };
      result = { stdout: error.stdout ?? "", stderr: error.stderr ?? String(error) };
    }
    await writeFile(join(scratch, "receipt-" + calls.length + ".json"), result.stdout);
    await writeFile(join(scratch, "stderr-" + calls.length + ".log"), result.stderr);
    if (processFailure) await writeFile(join(scratch, "process-failure-" + calls.length + ".json"), JSON.stringify(processFailure, null, 2) + "\n");
    assert.ok(result.stdout.trim().length > 0, "public CLI returned no receipt: " + JSON.stringify(processFailure));
    const outcome = JSON.parse(result.stdout), receipt = outcome.receipt;
    calls.push({ definitionKey: call.invocation.definitionKey, invocationRef: call.invocation.invocationRef,
      outcomeKind: receipt?.ownerOutput?.outcomeKind, exitCode: receipt?.exitCode });
    console.log(JSON.stringify({ phase: "declared_testing_public_call", ordinal: calls.length, ...calls.at(-1) }));
    assert.equal(outcome.kind, "installed_definition_call_transport_result", JSON.stringify(outcome));
    if (receipt.resources?.eventResource?.closeHandoff) closeHandoff = receipt.resources.eventResource.closeHandoff;
    assert.equal(receipt.ownerOutput.outcomeKind, expectRefusal ? "refusal" : "result", JSON.stringify(receipt));
    if (!expectRefusal) assert.equal(receipt.exitCode, 0, JSON.stringify(receipt));
    return receipt;
  }
  const workspaceRoot = join(scratch, "workspace"), workspaceResources = { kind: "workspace_resource_assertion", schemaVersion,
    targetRoot: workspaceRoot, targetRootDigest: hash({ kind: "workspace_target", targetRoot: workspaceRoot }) };
  const created = await invoke(await authorized(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
    { targetRoot: workspaceRoot, createPolicy: "clean", scaffoldPolicy: "none" }, workspaceResources, { actor }));
  const workspaceManifest = JSON.parse(await readFile(created.resources.manifest.locator, "utf8"));
  const fixture = await prepareTestingProduct({ scratch, product, gtl, abiArtifact, inputRoot });
  const consumerRequest = { artifactPath: fixture.artifactPath, artifactRef: fixture.artifactRef, ...expectedVerificationIdentity(fixture.basis) };
  const consumerVerification = await product.ProductVerificationPort.verify({ kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact", request: consumerRequest });
  assert.equal(consumerVerification.kind, "product_verification_success", JSON.stringify(consumerVerification));
  const products = [{ verification: ownerVerification, request: ownerRequest }, { verification: consumerVerification, request: consumerRequest }];
  for (const item of products) {
    const verified = item.verification.verifiedArtifact;
    item.packed = { kind: "product_verification_artifact_resource", schemaVersion, artifactPath: item.request.artifactPath,
      artifact: { ref: verified.artifactRef, digest: verified.artifactDigest }, productContent: { ref: "product-content://abiogenesis/" + verified.productContentDigest.slice(7), digest: verified.productContentDigest },
      descriptor: item.verification.coordinates.descriptor, contributionManifest: { ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest },
      manifestDigest: verified.manifestDigest, productId: verified.productId, packageName: verified.packageName, packageVersion: verified.packageVersion };
    const call = await authorized(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
      { targetKind: "packed_artifact", artifact: item.packed.artifact, productContent: item.packed.productContent, descriptor: item.packed.descriptor,
        contributionManifest: item.packed.contributionManifest, declaredDependencies: verified.declaredDependencies,
        compatibilityInputs: verified.compatibilityRefs.map(compatibilityRef => ({ compatibilityRef, subjectRef: item.packed.productContent.ref })) },
      { kind: "product_verification_resources", schemaVersion, targetKind: "packed_artifact", packedArtifact: item.packed });
    item.receipt = await invoke(call); item.reference = { invocation: { ref: call.invocation.invocationRef, digest: call.invocation.invocationDigest }, outcome: item.receipt.ownerOutput.value.verifiedArtifact };
  }
  const verifiedProducts = products.map(p => p.verification.verifiedArtifact);
  const resolvedLock = product.ProductEnvironmentPort.resolve({ kind: "product_resolution_packet", schemaVersion, memberKey: "resolve", verifiedArtifacts: verifiedProducts });
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  const lock = { ref: resolvedLock.lockId, digest: resolvedLock.lockDigest }, references = products.map(p => p.reference);
  await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
    { requirements: verifiedProducts.map(p => ({ productId: p.productId, packageVersion: p.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: [] })), verifiedCandidates: references },
    { kind: "product_resolution_resource_assertion", schemaVersion, verifiedPreimages: products.map(p => ({ verification: p.reference, verifiedArtifact: p.verification.verifiedArtifact, verificationOutput: p.receipt.ownerOutput })),
      nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } }, { verification_references: references }));
  const eventLogPath = join(scratch, "events/runtime.events.jsonl"); await mkdir(dirname(eventLogPath));
  const installed = [], installTargets = products.map((_, i) => join(scratch, "installed-" + i));
  for (const [i, item] of products.entries()) {
    const eventResource = closeHandoff === null ? { kind: "new_abg_event_resource", schemaVersion, eventLogPath,
      locatorDigest: hash({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) } : reopen();
    const call = await authorized(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
      { verifiedArtifact: item.verification.coordinates.verifiedArtifact, descriptor: item.packed.descriptor, contributionManifest: item.packed.contributionManifest,
        resolvedLock: lock, targetRoot: installTargets[i], installPolicy: "clean" },
      { kind: "product_install_resource_assertion", schemaVersion, eventResource, packedArtifact: item.packed,
        verifiedArtifact: item.verification.verifiedArtifact, resolvedLock }, { dependency_lock: lock, verification_references: [item.reference], actor });
    await invoke(call); const truth = abg.projectExactPrefixArtifactTruth(closeHandoff.prefix);
    const row = abg.projectAdmittedProductInstallByInvocationRef(truth, call.invocation.invocationRef); assert.ok(row); installed.push(row);
  }
  const authorityManifest = { workspaceId: workspaceManifest.workspaceRef, canonicalRoot: workspaceManifest.canonicalRoot, authorityMode: "trusted_developer", authorizedActorRef: actorRef };
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ ...authorityManifest,
    authorityManifestRef: "manifest://declared-testing.example/workspace", authorityManifestDigest: hash(authorityManifest) });
  const roots = { toolchainRoot: installTargets[0], productRoot: installed[1].install.installedRoot, eventLogRoot: dirname(eventLogPath),
    runtimeStateRoot: join(workspaceRoot, "runtime"), projectionRoot: join(workspaceRoot, "projections"), archiveRoot: join(workspaceRoot, "archives") };
  const rootFields = { toolchain: "toolchainRoot", product: "productRoot", event_log: "eventLogRoot", runtime_state: "runtimeStateRoot", projection: "projectionRoot", archive: "archiveRoot" };
  const installCoordinates = installed.map(row => product.productInstallCoordinate(row.install));
  const bound = await invoke(await authorized(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
    { workspaceAuthority: { ref: workspaceAuthority.authorityBasisId, digest: workspaceAuthority.authorityBasisDigest }, installedSet: installCoordinates, resolvedLock: lock,
      declaredRoots: Object.entries(rootFields).map(([rootKind, field]) => ({ rootKind, path: roots[field] })) },
    { kind: "product_workspace_binding_resource_assertion", schemaVersion, eventResource: reopen(), workspaceAuthority, workspaceManifest,
      admittedInstalls: installed.map(row => row.install), resolvedLock, declaredRoots: roots }, { product_set: installCoordinates, dependency_lock: lock, actor }));
  environment = abg.projectExactPrefixWorkspaceEnvironment(closeHandoff.prefix, bound.ownerOutput.value.binding);
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const consumerPublications = await fixture.loadInstalledPublications({ installedRoot: installed[1].install.installedRoot });
  const publications = [...nativePublications(gtl, abiArtifact), ...consumerPublications];
  const boundSlots = { workspace_binding: bound.ownerOutput.value.binding, product_set: environment.productInstalls.map(product.productInstallCoordinate), dependency_lock: lock, actor };
  const catalogReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
    { workspaceBinding: boundSlots.workspace_binding, descriptors: products.map(p => p.packed.descriptor), contributionManifests: products.map(p => p.packed.contributionManifest), resolvedLock: lock },
    { kind: "catalog_admission_resource_assertion", schemaVersion, eventResource: reopen(), workspaceBinding: environment.workspaceBinding,
      resolvedLock, verifiedProducts, admittedInstalls: environment.productInstalls, publications }, boundSlots));
  const catalog = product.CatalogOperationPort.admit({ kind: "catalog_admit_packet", schemaVersion, memberKey: "admit", readinessBasis: {
    workspaceBinding: environment.workspaceBindingCandidate, resolvedLock, verifiedProducts, installedProducts: installed.map(row => row.candidate), publications } });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const allowlist = catalog.entries.filter(r => r.programMembershipRefs.some(ref => [fixture.ids.sourceProgramRef, fixture.ids.programRef].includes(ref))).map(r => r.handle).sort();
  const viewReceipt = await invoke(await authorized(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    { catalog: catalogReceipt.ownerOutput.value.catalog, allowlist }, { kind: "catalog_view_resource_assertion", schemaVersion, catalog }, boundSlots));
  const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
  const catalogScope = { catalog: catalogReceipt.ownerOutput.value.catalog, view: viewReceipt.ownerOutput.value.view, allowlist };
  const binding = environment.workspaceBinding;
  async function runProgram(programRef, makeInput, { transport, missingEnvironment = false } = {}) {
    const publication = consumerPublications.find(p => p.programs.some(x => x.programRef === programRef)), program = publication.programs.find(p => p.programRef === programRef);
    const law = coord("law://abiogenesis/validator/gtl-program@5");
    const checked = await invoke(await authorized(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
      { program: coord(programRef, program), conformanceLaw: law, inventoryBasis: { kind: "declared_inventory", inventory: catalog.boundPublications.map(p => coord(p.moduleRef, p)).sort((a, b) => a.ref.localeCompare(b.ref)) } },
      { kind: "conformance_evaluation_resource_assertion", schemaVersion, packet: { kind: "conformance_evaluate_packet", schemaVersion, memberKey: "gtl_program", publication, program },
        conformanceLaw: law, artifactTruth: environment.artifactTruth, declaredInventory: catalog.boundPublications, declarationCatalog: { catalog, catalogView } }, boundSlots));
    assert.equal(checked.ownerOutput.value.disposition, "passed");
    const resolution = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView, admittedInstalls: environment.productInstalls,
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(environment.artifactTruth, install), programRef,
      selection: { kind: "start", scope: "program", target: "next", until: "converged", rootMode: "direct" } });
    assert.equal(resolution.kind, "loaded_product_execution_resolution", JSON.stringify(resolution));
    const packet = product.RUN_OPERATION_CONTRACTS.invoke.start;
    const regimes = new Set([...resolution.programValidation.executableLeafRows, ...resolution.programValidation.interactionLeafRows].map(r => r.fibre));
    const policy = product.constructRootInvocationPolicy(binding, program, [], ["F_D", "F_P", "F_H"].filter(r => regimes.has(r)), []);
    const grantBasis = { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: packet };
    const grants = [product.constructCapabilityGrant(policy, actorRef, "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY, grantBasis)];
    const authority = product.constructInvocationAuthority(actorRef, binding, catalogView, programRef, resolution.selectedCatalogEntry, policy, grants, grantBasis);
    const input = await makeInput({ grants, resolution });
    const inputContract = { ref: resolution.resolution.inputContract.contractRef, digest: resolution.resolution.inputContractDigest };
    const carrier = { contract: inputContract, valueRef: "value://declared-testing.example/" + ordinal, valueDigest: hash(input), value: input };
    const eventResource = reopen(), steeringDigest = hash(eventResource);
    const slots = { graph_function: null, verification_references: null, execution_basis: null,
      workspace_binding: boundSlots.workspace_binding, product_set: environment.productInstalls.map(i => ({ ref: i.installId, digest: i.productContentDigest })),
      dependency_lock: lock, catalog_scope: catalogScope, execution_program: { ref: programRef, digest: resolution.resolution.programDigest }, input_contract: carrier,
      session_policy: { ref: policy.policyRef, digest: policy.policyDigest }, capability_grants: { requiredCapabilityRefs: [...packet.metadata.capabilityRefs], grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) },
      actor: { actor: { ref: actorRef, digest: hash({ actorRef }) }, attribution: { ref: authority.authorityRef, digest: authority.authorityDigest } },
      transport_steering: { ref: "transport-steering://abiogenesis/" + steeringDigest.slice(7), digest: steeringDigest } };
    let resources = { kind: "run_invocation_resource_assertion", schemaVersion, eventResource, catalog, catalogView, applications: [], applicationResources: [], source: { kind: "none" } };
    if (program.policies["abg.stdo_run_environment"] !== undefined && !missingEnvironment) {
      const temporaryRoot = join(binding.roots.archiveRoot, "stdo-access-support"); await mkdir(temporaryRoot, { recursive: true });
      resources.stdoEnvironmentResources = pilotResources(product, fixture.env, authority, program, await realpath(temporaryRoot));
    }
    const call = definitionCall(packet, { program: slots.execution_program, scope: "program", target: { kind: "next" }, until: "converged", catalogView: catalogScope.view,
      allowlist, input: carrier, fhMode: "direct", rootMode: "direct", sourceBasis: { kind: "none" } }, slots, resources);
    const native = program.policies["abg.stdo_run_environment"] !== undefined && !missingEnvironment;
    if (native) assert.equal(typeof transport, executionConfig.live ? "undefined" : "string",
      "mechanical mode requires a disclosed double; live mode forbids one");
    const receipt = await invoke(call, { transport, expectRefusal: missingEnvironment, native });
    if (missingEnvironment) return { call, receipt, input, prefix: closeHandoff.prefix };
    assert.equal(receipt.ownerOutput.value.disposition, "completed", JSON.stringify(receipt.ownerOutput));
    const events = abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix), prefix = abg.selectValidatedRuntimeEventPrefix(events);
    const admission = abg.rehydrateInvocationAdmissionAtPrefix(prefix, receipt.resources.invocationAdmission.ref);
    const resultBasis = abg.deriveInvocationSourceResultBasisAtPrefix(prefix, { publicAuthorityDigest: call.invocation.invocationDigest,
      runtimeInvocationRef: admission.invocationRef, invocationAdmissionRef: receipt.resources.invocationAdmission.ref,
      runId: receipt.ownerOutput.value.run.ref, resultRef: receipt.ownerOutput.value.result.ref });
    assert.ok(resultBasis);
    const reads = {};
    if (native) {
      const savedPrefix = closeHandoff.prefix;
      for (const memberKey of ["run_result", "run_replay"]) {
        const readPacket = abg.ABG_PROJECT_READ_CONTRACTS[memberKey];
        const readGrants = readPacket.metadata.capabilityRefs.map(cap => product.constructCapabilityGrant(
          environment.workspaceAuthorityBasis, actorRef, readPacket.definitionKey.operationId, cap,
          { admittedInstalls: environment.productInstalls, workspaceBinding: binding, fixedPacket: readPacket }));
        const readDefinition = installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
          d.definitionKey.operationId === readPacket.definitionKey.operationId && d.definitionKey.memberKey === memberKey);
        const readSlots = slotsFor(readDefinition, { workspace_binding: boundSlots.workspace_binding,
          product_set: slots.product_set, dependency_lock: lock,
          capability_grants: { requiredCapabilityRefs: [...readPacket.metadata.capabilityRefs], grants: readGrants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) } });
        reads[memberKey] = await invoke(definitionCall(readPacket, { caseKey: memberKey,
          source: { sourceKind: "run", sourceRef: receipt.ownerOutput.value.run.ref, sourceDigest: receipt.ownerOutput.value.run.digest },
          projectionBasis: { projectionBasisRef: savedPrefix.eventLogRef, projectionBasisDigest: savedPrefix.coordinateDigest },
          selector: memberKey === "run_replay" ? { kind: "ordinal_page", fromOrdinal: 0, limit: 10000 } : { kind: "none" } },
        readSlots, { kind: "abg_project_read_resource_assertion", schemaVersion, eventResource: reopen() }));
        assert.deepEqual(closeHandoff.prefix, savedPrefix, "supported reads preserve the exact durable prefix");
      }
      assert.deepEqual(reads.run_result.ownerOutput.value.projection.result, receipt.ownerOutput.value.result);
      const replay = abg.projectRunSemanticReplayProjection(prefix, receipt.ownerOutput.value.run.ref);
      assert.deepEqual(reads.run_replay.ownerOutput.value.projection.replay,
        { ref: replay.physicalCoordinates.scopedReplayRef, digest: replay.physicalCoordinates.scopedReplayDigest });
    }
    return { call, receipt, resultBasis, input, events, reads, prefix: closeHandoff.prefix };
  }
  return { harness, product, gtl, abg, validator, fixture, environment, catalog, catalogView, consumerPublications,
    runProgram, calls, abiArtifact, scratch, deadline, getPrefix: () => closeHandoff.prefix };
}

export async function testingWorksite({ product, environment, grants, selected }) {
  const { workspaceAuthorityBasis, workspaceBinding } = environment, rows = [];
  assert.equal(workspaceAuthorityBasis?.kind, "workspace_authority_basis", "worksite requires the admitted authority basis");
  assert.ok(selected === null || ["A", "B"].includes(selected), "selection is either unselected live input or a declared mechanical alternative");
  for (const [relativePath, role] of [["proof/app.mjs", "implementation"], ["proof/verifier.test.mjs", "verifier"]]) {
    const path = join(workspaceAuthorityBasis.canonicalRoot, relativePath); await mkdir(dirname(path), { recursive: true });
    const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, subjectUri: pathToFileURL(path).href, relativePath });
    assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
    const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis, workspaceBinding, territoryUri: pathToFileURL(dirname(path)).href, relativeRoot: dirname(relativePath) });
    assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));
    const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    assert.equal(predecessorObservation.kind, "worksite_observation", JSON.stringify(predecessorObservation));
    const bytes = predecessorObservation.state === "absent" ? Buffer.alloc(0) : await readFile(path);
    if (predecessorObservation.state === "file") {
      assert.equal(product.sha256Bytes(bytes), predecessorObservation.fileDigest, "observed worksite bytes must remain current");
      assert.equal(bytes.length, predecessorObservation.byteLength);
    }
    rows.push({ subject, territory, predecessorObservation, bytes, role });
  }
  const basis = { workspaceAuthorityBasis, workspaceBinding, capabilityGrant: grants[0] };
  const task = product.constructWorksiteConstructionTask({ ...basis, prompt: "Prospectively selected bounded checker witness.", targets: rows });
  const worksite = { ...basis, targets: rows.map((row, i) => ({ target: task.targets[i], base64: row.bytes.toString("base64"), role: row.role })),
    commands: ["A", "B"].map(letter => ({ commandId: checkerRef(letter), executable: process.execPath,
      args: ["--test", "--test-reporter=tap", "proof/verifier.test.mjs"], relativeCwd: ".", environment: { DECLARED_CHECKER: letter },
      timeoutMs: 5_000, terminationGraceMs: 1_000, expectedReports: [] })),
    outcomePredicates: selected === null ? [] : [{ predicateId: "predicate://declared-testing.example/selected-checker-exit", predicateKind: "process_exit",
      declaration: { validationCommandId: checkerRef(selected), equals: 0 } }],
    allowedWriteTerritories: [{ pathKind: "subtree", relativePath: "proof/checker-output" }] };
  // Validate the same selected command configuration before any native setup
  // can consume it. This is only owner construction, never execution evidence.
  product.constructWorksiteCommandPreparationInput({ constructionTask: task,
    commands: selected === null ? worksite.commands : worksite.commands.filter(command => command.commandId === checkerRef(selected)),
    outcomePredicates: worksite.outcomePredicates, allowedWriteTerritories: worksite.allowedWriteTerritories });
  return worksite;
}
