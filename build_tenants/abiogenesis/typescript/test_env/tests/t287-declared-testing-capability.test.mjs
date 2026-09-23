import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { checkerRef, installTestingTransport, isTestingCommandExecutionSchema, LIVE_TESTING_TRANSPORT, observeTestingToolchain, prepareTestingProduct, setupTestingInvocation, TESTING_CHECKER_SUCCESS_CRITERION, TESTING_ROLE_POLICY, testingExecutionConfig, testingStageMeaning, testingWorksite } from "../support/declared-testing-capability.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";

const exec = promisify(execFile);
const packageRoot = process.env.ABI5_TESTING_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("declared testing transport routing uses the current response contract, not historical helper text", () => {
  const historicalHelper = "Evidence from prior worksite_command_helper.js execution.";
  const request = kind => ({ prompt: historicalHelper, responseJsonSchema: { properties: { kind: { const: kind } } } });
  const c2 = request("worksite_command_execution_worker_result"), evidenceAuthor = request("semantic_stage_asset_candidate");
  assert.equal(isTestingCommandExecutionSchema(c2.responseJsonSchema), true);
  assert.equal(isTestingCommandExecutionSchema(evidenceAuthor.responseJsonSchema), false);
  assert.equal(isTestingCommandExecutionSchema(request("semantic_stage_assessment_candidate").responseJsonSchema), false);
  assert.equal(isTestingCommandExecutionSchema({}), false);
});

test("declared testing preparation keeps prospective criteria and explicit transport modes", async () => {
  assert.equal(testingExecutionConfig({}).mode, "mechanical");
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_MODE: "live" }), /separate runtime activation/u);
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_MODE: "other" }), /mechanical or live/u);
  const config = testingExecutionConfig({ ABI5_TESTING_MODE: "live", ABI5_TESTING_ALLOW_LIVE: "1" });
  assert.equal(config.environment.ABG_TS_CLAUDE_COMMAND, LIVE_TESTING_TRANSPORT.command);
  assert.equal(config.environment.CLAUDE_CODE_EFFORT_LEVEL, "xhigh");
  assert.equal(config.nativeBudgetMs + config.readbackReserveMs + config.cleanupReserveMs, 3_000_000);
  assert.equal(config.outerBudgetMs, 3_300_000);
  assert.equal(config.freshReadbackBudgetMs, 45_000);
  const extended = testingExecutionConfig({ ABI5_TESTING_MODE: "live", ABI5_TESTING_ALLOW_LIVE: "1", ABI5_TESTING_NATIVE_BUDGET_MS: "7200000" });
  assert.equal(extended.nativeBudgetMs, 7_200_000);
  assert.equal(extended.outerBudgetMs, 8_400_000);
  assert.equal(extended.freshReadbackBudgetMs, extended.readbackReserveMs);
  assert.deepEqual(extended.environment, config.environment, "caller observation does not alter actor watchdogs or transport");
  assert.equal(testingExecutionConfig({}).nativeBudgetMs, 1_200_000);
  assert.equal(testingExecutionConfig({}).outerBudgetMs, 3_300_000);
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_NATIVE_BUDGET_MS: "7200000" }), /activated live mode/u);
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_MODE: "live", ABI5_TESTING_ALLOW_LIVE: "1", ABI5_TESTING_NATIVE_BUDGET_MS: "7200001" }), /40 and 120 minutes/u);
  const transport = await import(pathToFileURL(join(packageRoot, "build/code/src/abg/transport_contracts.js")).href);
  assert.deepEqual(transport.admitTransportAppendArgs({ agentKey: "claude", environment: config.environment }),
    ["--model", "claude-fable-5-1"]);
  const contract = transport.constructKnownWorkerTransportContract("claude", { command: config.environment.ABG_TS_CLAUDE_COMMAND, environment: config.environment });
  assert.equal(contract.command, LIVE_TESTING_TRANSPORT.command);
  assert.ok(contract.sanitizedEnvironmentPrefixes.every(prefix => !"CLAUDE_CODE_EFFORT_LEVEL".startsWith(prefix)));
  for (const lane of ["closed_prompt_proof", "worker_executes"]) {
    const args = transport.composeWorkerTransportArgs({ contract, prompt: "prospective preflight only", outputPath: "unused", lane, environment: config.environment });
    assert.equal(args[args.indexOf("--model") + 1], LIVE_TESTING_TRANSPORT.model);
  }
  const design = testingStageMeaning("design"), evidence = testingStageMeaning("evidence");
  assert.notEqual(design.assetKind, evidence.assetKind);
  assert.notDeepEqual(design.requiredContent, evidence.requiredContent);
  assert.ok(design.rubric.every(row => row.criterionRef.includes("/design/")));
  assert.ok(evidence.rubric.every(row => row.criterionRef.includes("/evidence/")));
  assert.match(evidence.rubric[0].instruction, /import and exercise that application/u);
  assert.match(evidence.rubric[1].instruction, /actual supplied C2/u);
  for (const text of [TESTING_ROLE_POLICY, design.rubric[1].instruction, evidence.rubric[1].instruction])
    assert.ok(text.includes(TESTING_CHECKER_SUCCESS_CRITERION), "one consumer-owned prospective criterion reaches both stages");
  assert.match(TESTING_CHECKER_SUCCESS_CRITERION, /Zero discovered tests is not success/u);
  assert.match(TESTING_ROLE_POLICY, /Empty report declarations or process outcome predicates do not remove/u);
});

test("declared testing live actor allowance preserves defaults and existing transport policy", async () => {
  const live = { ABI5_TESTING_MODE: "live", ABI5_TESTING_ALLOW_LIVE: "1" };
  const baseline = testingExecutionConfig(live), mechanical = testingExecutionConfig({});
  assert.equal(baseline.environment.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS, "240000");
  assert.deepEqual(mechanical.environment, { ABG_TS_FP_TIMEOUT_MS: "60000", ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: "120000", ABG_TS_FP_TERMINATION_GRACE_MS: "1000" });
  for (const value of ["240000", "300000", "600000"]) {
    const config = testingExecutionConfig({ ...live, ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS: value });
    assert.deepEqual(config, { ...baseline, environment: { ...baseline.environment, ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: value } },
      "only the explicit invocation-wide actor hard cap changes; caller, inactivity, grace and transport stay fixed");
  }
  for (const value of ["", "0", "239999", "600001", "300000.5", "NaN", "Infinity"])
    assert.throws(() => testingExecutionConfig({ ...live, ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS: value }), /240000 and 600000/u);
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS: "600000" }), /activated live mode/u);
  assert.throws(() => testingExecutionConfig({ ABI5_TESTING_MODE: "live", ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS: "600000" }), /separate runtime activation/u);
  const config = testingExecutionConfig({ ...live, ABI5_TESTING_NATIVE_BUDGET_MS: "7200000", ABI5_TESTING_LIVE_ACTOR_ABSOLUTE_MS: "600000" });
  const callerOnly = testingExecutionConfig({ ...live, ABI5_TESTING_NATIVE_BUDGET_MS: "7200000" });
  assert.deepEqual(config, { ...callerOnly, environment: { ...callerOnly.environment, ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: "600000" } });
  const [transport, worker, liveness] = await Promise.all(["transport_contracts", "worker_transport", "runtime_liveness_contracts"]
    .map(name => import(pathToFileURL(join(packageRoot, "build/code/src/abg", name + ".js")).href)));
  const requestFor = environment => ({
    contract: transport.constructKnownWorkerTransportContract("claude", { command: environment.ABG_TS_CLAUDE_COMMAND, environment }),
    prompt: "Policy preparation only; no actor is executed.", lane: "closed_prompt_proof",
    cwd: packageRoot, archiveRoot: packageRoot, label: "actor-budget-preflight",
    timeoutMs: Number(environment.ABG_TS_FP_TIMEOUT_MS), absoluteTimeoutMs: Number(environment.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS),
    terminationGraceMs: Number(environment.ABG_TS_FP_TERMINATION_GRACE_MS), environment,
  });
  // This owner only prepares a plan; runPreparedWorkerTransport is never called.
  const oldPlan = await worker.prepareWorkerTransport(requestFor(baseline.environment));
  const plan = await worker.prepareWorkerTransport(requestFor(config.environment));
  assert.equal(plan.absoluteTimeoutMs, 600_000);
  for (const key of ["command", "args", "lane", "timeoutMs", "terminationGraceMs", "promptDigest", "responseJsonSchemaDigest"])
    assert.deepEqual(plan[key], oldPlan[key], key);
  const policy = liveness.constructRuntimeWatchdogPolicy({ startupMs: plan.timeoutMs, inactivityMs: plan.timeoutMs,
    hardCapMs: plan.absoluteTimeoutMs, terminationGraceMs: plan.terminationGraceMs });
  assert.ok(liveness.isRuntimeWatchdogPolicy(policy));
  assert.equal(policy.startupMs, 120_000);
  assert.equal(policy.inactivityMs, 120_000);
  assert.equal(policy.hardCapMs, 600_000);
  assert.equal(policy.terminationGraceMs, 1_000);
  await assert.rejects(worker.prepareWorkerTransport({ ...requestFor(config.environment), absoluteTimeoutMs: 120_000 }),
    /greater than its inactivity timeout/u);
});

test("declared testing context records current toolchain facts without checker or semantic success", async () => {
  const product = await import(pathToFileURL(join(packageRoot, "build/code/src/product/index.js")).href);
  const fact = await observeTestingToolchain(product);
  assert.equal(fact.executable, process.execPath);
  assert.equal(fact.canonicalExecutable, await realpath(process.execPath));
  assert.equal(fact.executableDigest, await product.sha256File(fact.canonicalExecutable));
  assert.equal(fact.runtimeVersion, process.version);
  assert.deepEqual(fact.observedCommand, { executable: process.execPath, args: ["--version"], exitStatus: 0,
    stdout: process.version + "\n", stderr: "" });
  assert.equal(fact.observedPreparationFeatures.length, 3);
  assert.match(fact.availabilityPremise, /not a claim.*runs or passes/u);
  assert.equal(fact.dependencyDisposition, undefined);
  assert.equal(fact.executionObservation, undefined);
});

test("declared testing context is bound into the actual consumer lifecycle and shared role policies", { timeout: 180_000 }, async t => {
  if (!process.env.ABI5_TESTING_INPUT_ROOT) { t.skip("requires exact selected RC7 companion release-record directory"); return; }
  const [product, gtl] = await Promise.all(["product", "gtl"].map(name => import(pathToFileURL(join(packageRoot, "build/code/src", name, "index.js")).href)));
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi-testing-context-")));
  const manifest = JSON.parse(await readFile(join(packageRoot, "product-toolchain-manifest.json"), "utf8"));
  const fixture = await prepareTestingProduct({ scratch, product, gtl, inputRoot: process.env.ABI5_TESTING_INPUT_ROOT,
    abiArtifact: { ...manifest, manifestDigest: product.sha256Canonical(manifest), artifactDigest: "sha256:" + "0".repeat(64) } });
  const publications = await fixture.loadInstalledPublications({ installedRoot: fixture.sourceRoot });
  const publication = publications.find(p => p.semanticLifecycle);
  assert.deepEqual(publication.semanticLifecycle, fixture.lifecycle);
  assert.equal(fixture.lifecycle.taskDataDigest, product.sha256Canonical(fixture.scenario));
  assert.equal(fixture.scenario.toolchainAvailability.executable, process.execPath);
  assert.equal(fixture.scenario.toolchainAvailability.executableDigest, await product.sha256File(process.execPath));
  assert.deepEqual(fixture.lifecycle.stages.map(s => s.assetSurface.kind), ["declared_testing_design", "declared_testing_evidence_assessment"]);
  for (const role of publication.stdoRunEnvironments[0].roles) {
    assert.equal(role.policy.text, TESTING_ROLE_POLICY);
    assert.equal(role.policy.digest, product.sha256Bytes(Buffer.from(TESTING_ROLE_POLICY)));
  }
  assert.deepEqual(gtl.constructSemanticLifecycleDeclaration(fixture.lifecycle), fixture.lifecycle);
  console.log(JSON.stringify({ kind: "consumer_context_only", scratch, taskDataDigest: fixture.lifecycle.taskDataDigest,
    policyDigest: publication.stdoRunEnvironments[0].roles[0].policy.digest, toolchain: fixture.scenario.toolchainAvailability,
    checkerExecuted: false, nativeAdmission: false }));
});

test("declared testing fixture aligns with current authority, observation, construction and command owners", { timeout: 180_000 }, async t => {
  const context = await setupInstalledRootCatalog(t, packageRoot, { candidateBasisSource: "packed_artifact" });
  const { product, workspaceAuthority: workspaceAuthorityBasis, workspaceBinding, admittedInstalls, publication } = context;
  const policy = product.constructRootInvocationPolicy(workspaceBinding, publication.programs[0], [], ["F_D"], []);
  const grant = product.constructCapabilityGrant(policy, workspaceBinding.authorizedActorRef,
    "abg.operation.run.invoke", product.DIRECT_INVOKE_CAPABILITY,
    { admittedInstalls, workspaceBinding, fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.start });
  const eventCount = context.store.readAll().length;
  for (const selected of ["A", "B"]) {
    const worksite = await testingWorksite({ product, environment: { workspaceAuthorityBasis, workspaceBinding }, grants: [grant], selected });
    assert.equal(worksite.targets.length, 2);
    assert.ok(worksite.targets.every(row => row.target.predecessorObservation.state === "absent" && row.base64 === ""));
    for (const row of worksite.targets) assert.equal(row.target.subject.subjectUri,
      pathToFileURL(join(workspaceAuthorityBasis.canonicalRoot, row.target.subject.relativePath)).href);
    assert.notEqual(workspaceAuthorityBasis.canonicalRoot, workspaceBinding.roots.productRoot);
    assert.equal(worksite.outcomePredicates[0].declaration.validationCommandId, checkerRef(selected));
    assert.ok(worksite.commands.every(command => command.executable === process.execPath));
    assert.deepEqual(worksite.allowedWriteTerritories, [{ pathKind: "subtree", relativePath: "proof/checker-output" }]);
  }
  const absentAuthority = { workspaceBinding };
  await assert.rejects(testingWorksite({ product, environment: absentAuthority, grants: [grant], selected: "A" }),
    /worksite requires the admitted authority basis/u);
  assert.equal(context.store.readAll().length, eventCount, "fixture observation and configuration add no runtime events");
});

test("declared checker composition uses native owners and independently rederives saved C1/C2 requests", { timeout: testingExecutionConfig().outerBudgetMs }, async t => {
  const executionConfig = testingExecutionConfig(), live = executionConfig.live;
  const inputRoot = process.env.ABI5_TESTING_INPUT_ROOT;
  assert.ok(inputRoot, "exact selected RC7 companion release-record directory is required");
  const deadline = process.env.ABI5_TESTING_DEADLINE;
  assert.ok(deadline && Date.parse(deadline) > Date.now(), "bounded proof deadline is required");
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi-testing-reuse-proof-")));
  console.log(JSON.stringify({ phase: "declared_testing_scratch", scratch }));
  // Preserve this one isolated proof output, including an actual failed first
  // cause. The test never writes to a retained native Run or canonical build.
  const evidence = { kind: live ? "declared_testing_live_observation" : "declared_testing_mechanical_proof", scratch,
    liveLLM: live, actorMode: live ? "ordinary_claude_transport" : "declared_response_doubles_with_real_C2_helper",
    executionConfig, component: {}, composed: [], failures: [] };
  let context;
  try {
    context = await setupTestingInvocation({ packageRoot, scratch, inputRoot, deadline, executionConfig });
    const { product, gtl, abg, fixture, consumerPublications, environment } = context;
    const environmentDeclarations = await import(pathToFileURL(join(context.harness.installedPackageRoot, "build/code/src/gtl/stdo_run_environment.js")).href);
    const publication = consumerPublications.find(p => p.programs.some(x => x.programRef === fixture.ids.programRef));
    const program = publication.programs.find(p => p.programRef === fixture.ids.programRef);
    const graphs = context.catalog.boundPublications.flatMap(p => p.graphFunctions);
    assert.equal(environmentDeclarations.validStdoEnvironmentProgram(publication, program, graphs), true);
    const missingRole = structuredClone(publication); missingRole.stdoRunEnvironments[0].roles.pop();
    assert.equal(environmentDeclarations.validStdoEnvironmentProgram(missingRole, program, graphs), false);
    const unsupported = structuredClone(publication); unsupported.stdoRunEnvironments[0].roles.at(-1).role = "reviewer";
    assert.equal(environmentDeclarations.validStdoEnvironmentPublication(unsupported), false);
    const nonAdopter = structuredClone(publication); delete nonAdopter.programs[0].policies["abg.stdo_run_environment"];
    nonAdopter.stdoRunEnvironments = [];
    assert.equal(environmentDeclarations.validStdoEnvironmentProgram(nonAdopter, nonAdopter.programs[0], graphs), true);
    evidence.component.declarationCoverage = { full: true, missingRoleRefuses: true, unsupportedRoleRefuses: true, nonAdopterImplicitRequirement: false };
    const source = await context.runProgram(fixture.ids.sourceProgramRef, async () => fixture.source.input);
    assert.equal(source.events.filter(e => e.kind === "actor_transport_binding_admitted").length, 0);
    assert.deepEqual(source.resultBasis.sourceResultValue.declaration, fixture.source.declaration);
    const envelopeFor = selected => async ({ grants }) => product.constructSemanticStageEnvelope({
      sourceHandoff: source.resultBasis.sourceResultValue, lifecycle: fixture.lifecycle, taskData: fixture.scenario, evaluationData: fixture.oracle,
      worksite: await testingWorksite({ product, environment, grants, selected }) });
    const outcomes = [];
    for (const selected of (live ? [null] : ["A", "B"])) {
      let transport;
      if (!live) {
        const transportRoot = join(scratch, "transport-" + selected);
        const { mkdir } = await import("node:fs/promises"); await mkdir(transportRoot);
        transport = await installTestingTransport(transportRoot, selected);
      }
      const result = await context.runProgram(fixture.ids.programRef, envelopeFor(selected), { transport });
      const output = result.resultBasis.sourceResultValue;
      assert.equal(output.assets.length, 2);
      const selectedCommands = output.assets[0].candidate.worksiteDesign.commandRefs;
      assert.equal(selectedCommands.length, 1);
      assert.ok([checkerRef("A"), checkerRef("B")].includes(selectedCommands[0]));
      if (!live) assert.deepEqual(selectedCommands, [checkerRef(selected)]);
      assert.ok(output.assets.every(a => a.assessment?.disposition === "satisfied"));
      assert.ok(output.evidence, "same-invocation native semantic evidence bridge must supply actual C1/C2 evidence");
      const observation = output.evidence.executionObservation;
      assert.equal(observation.kind, "worksite_command_execution_observation");
      assert.deepEqual(observation.task.commands.map(c => c.commandId), selectedCommands);
      assert.deepEqual(observation.commandResults.map(c => c.commandId), selectedCommands);
      assert.equal(observation.commandResults[0].exitStatus, 0);
      assert.equal(observation.commandResults[0].timedOut, false);
      const stdout = Buffer.from(observation.commandResults[0].stdout.payload, "base64").toString("utf8");
      const passed = stdout.match(/^# pass (\d+)$/mu), failed = stdout.match(/^# fail (\d+)$/mu);
      assert.ok(passed && Number(passed[1]) >= fixture.oracle.requiredCheckerPasses);
      assert.ok(failed && Number(failed[1]) === 0);
      assert.equal(observation.predicateObservations.length, live ? 0 : 1);
      const runId = result.receipt.ownerOutput.value.run.ref;
      const runEvents = result.events.filter(e => e.runId === runId);
      const assemblies = runEvents.filter(e => e.kind === "actor_transport_binding_admitted").map(e => e.payload.instructionAssembly);
      assert.equal(assemblies.length, 6, "Design author/assessor, C1, C2 and evidence author/assessor share one invocation");
      assert.ok(assemblies.every(a => a?.kind === "native_instruction_assembly"));
      const worksiteAssemblies = assemblies.filter(a => a.plan.variant === "worksite");
      assert.deepEqual(worksiteAssemblies.map(a => a.plan.role), ["constructor", "command_executor"]);
      for (const assembly of worksiteAssemblies) {
        const basis = assembly.envelope.nativeBasis, owner = abg.authenticateNativeInstructionAssemblyBasis(basis);
        assert.ok(owner);
        assert.deepEqual(abg.constructWorksiteNativeInstructionAssembly(basis, owner.inputValue), assembly);
        assert.equal(abg.constructWorksiteNativeInstructionAssembly(basis, { ...owner.inputValue, prompt: "stale input" }), null);
        const badBasis = structuredClone(basis); badBasis.cursor.inputDigest = "sha256:" + "f".repeat(64);
        assert.equal(abg.constructWorksiteNativeInstructionAssembly(badBasis, owner.inputValue), null);
        assert.equal(owner.execution.invocationAdmissionRef, result.receipt.resources.invocationAdmission.ref);
      }
      const c1 = worksiteAssemblies[0], c2 = worksiteAssemblies[1];
      assert.notEqual(c1.manifest.promptDigest, c1.manifest.basePromptDigest);
      assert.match(c2.envelope.sections.task.ownerPrompt, /worksite_command_helper\.js/u);
      const admitted = runEvents.filter(e => e.kind === "c_call_result_admitted");
      assert.ok(admitted.some(e => e.payload.value?.kind === "worksite_construction_result"));
      assert.ok(admitted.some(e => e.payload.value?.kind === "worksite_command_execution_observation"));
      outcomes.push({ selected, result, assemblies, runId });
      evidence.composed.push({ requestedSelection: selected, runId, invocationAdmissionRef: result.receipt.resources.invocationAdmission.ref,
        prefix: result.prefix, selectedCommand: observation.commandResults[0].commandId, exitStatus: observation.commandResults[0].exitStatus,
        checkerStdout: stdout, assemblyCount: assemblies.length, actualEvidence: product.sha256Canonical(output.evidence),
        publicReads: Object.fromEntries(Object.entries(result.reads).map(([key, receipt]) => [key, receipt.ownerOutput.value.projection])) });
      await writeFile(join(scratch, "proof.json"), JSON.stringify(evidence, null, 2) + "\n");
      console.log(JSON.stringify({ phase: "declared_testing_selection_observed", selected, runId }));
    }
    if (!live) {
      const actorsBeforeRefusal = abg.readRuntimeEventsAtDurablePrefix(context.getPrefix()).filter(e => e.kind === "actor_transport_binding_admitted").length;
      const missing = await context.runProgram(fixture.ids.programRef, envelopeFor("A"), { missingEnvironment: true });
      assert.ok(missing.receipt.ownerOutput.value.issuePaths.includes("/stdoEnvironment/cause/missing_binding"));
      assert.equal(abg.readRuntimeEventsAtDurablePrefix(missing.prefix).filter(e => e.kind === "actor_transport_binding_admitted").length, actorsBeforeRefusal);
      evidence.component.missingEnvironmentRefusesBeforeActor = true;
    }
    // Mechanical A is not retroactively changed by B; live has one free choice.
    const a = outcomes[0], b = outcomes.at(-1);
    const aReplay = abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(a.result.prefix)), a.runId);
    const packet = { prefix: b.result.prefix, runId: b.runId,
      expectedReplay: abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(b.result.prefix)), b.runId),
      assemblies: b.assemblies.filter(a => a.plan.variant === "worksite"), externalRoots: Object.values(fixture.env.roots).filter(p => typeof p === "string") };
    const packetPath = join(scratch, "fresh-request-rederivation-input.json"); await writeFile(packetPath, JSON.stringify(packet));
    const moduleUrl = pathToFileURL(join(context.harness.installedPackageRoot, "build/code/src/abg/index.js")).href;
    const script = `import assert from 'node:assert/strict'; import {readFile} from 'node:fs/promises';
const packet=JSON.parse(await readFile(process.argv[1],'utf8')),abg=await import(process.argv[2]);
assert.equal(process.permission.has('child'),false);
const denied=packet.externalRoots.map(path=>({path,readAllowed:process.permission.has('fs.read',path)}));assert.ok(denied.every(r=>r.readAllowed===false));
const rows=[];
for(const saved of packet.assemblies){
 const basis=saved.envelope.nativeBasis,owner=abg.authenticateNativeInstructionAssemblyBasis(basis);assert.ok(owner);
 const actual=abg.constructWorksiteNativeInstructionAssembly(basis,owner.inputValue);assert.deepEqual(actual,saved);
 const changed=structuredClone(saved);changed.manifest.promptDigest='sha256:'+'f'.repeat(64);assert.notDeepEqual(actual,changed);
 const environment=abg.projectExactPrefixWorkspaceEnvironment(basis.predecessorPrefix,{ref:owner.execution.workspaceBindingId,digest:owner.execution.workspaceBindingDigest});
 assert.equal(environment.kind,'exact_prefix_workspace_environment');
 const request={...saved.request,prompt:saved.request.prompt+' altered saved request'};
 const occurrence={...Object.fromEntries(['cCallRef','runId','graphCallId','frameId','programLocusRef','taskOrdinal','attempt'].map(k=>[k,owner.call[k]])),nativeInstructionAssemblyBasis:basis};
 const refusal=await abg.invokeActorProcess({predecessorPrefix:basis.predecessorPrefix,executionBasis:owner.execution,cCall:owner.call,
 expectedInputDigest:owner.inputDigest,occurrence,workerContracts:{instructionContractRef:request.instructionContractRef,resultContractRef:request.resultContractRef},
 runtime:{artifactTruth:environment.artifactTruth,workspaceBinding:environment.workspaceBinding},request,dispatchOrdinal:1});
 assert.equal(refusal.kind,'actor_process_effect_refusal');
 assert.match(refusal.diagnostic??refusal.message??refusal.diagnosticMessage??JSON.stringify(refusal),/dependent dispatch requires exact native admitted instruction assembly/);
 rows.push({role:saved.plan.role,requestDigest:actual.manifest.promptDigest,independentlyRederived:true,tamperedRequest:'native_pre_effect_refusal',tamperedManifest:'rederivation_disagreement'});
}
const events=abg.readRuntimeEventsAtDurablePrefix(packet.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(events);
assert.deepEqual(abg.projectRunSemanticReplayProjection(prefix,packet.runId),packet.expectedReplay);
console.log(JSON.stringify({kind:'fresh_request_rederivation_and_replay',rows,externalAccess:denied,childProcessAllowed:false}));`;
    const fresh = await exec(process.execPath, ["--permission", "--allow-fs-read=" + scratch, "--input-type=module", "-e", script, packetPath, moduleUrl],
      { cwd: scratch, env: { ...process.env, NODE_OPTIONS: "" }, timeout: Math.min(executionConfig.freshReadbackBudgetMs, Date.parse(deadline) - Date.now()), maxBuffer: 40 * 1024 * 1024 });
    evidence.freshProcess = JSON.parse(fresh.stdout); evidence.predecessorReplayDigest = product.sha256Canonical(aReplay);
    evidence.artifactDigest = context.abiArtifact.artifactDigest; evidence.consumerArtifactDigest = fixture.basis.artifactDigest;
    evidence.calls = context.calls; evidence.disposition = live ? "live_composition_observed" : "mechanical_composition_observed";
    await writeFile(join(scratch, "proof.json"), JSON.stringify(evidence, null, 2) + "\n");
    console.log(JSON.stringify({ phase: "declared_testing_completed", scratch, artifactDigest: evidence.artifactDigest, composed: evidence.composed }));
  } catch (error) {
    if (context) { evidence.calls = context.calls; evidence.lastPrefix = context.getPrefix(); }
    evidence.disposition = "incomplete"; evidence.failures.push({ name: error.name, message: error.message, stack: error.stack });
    await writeFile(join(scratch, "proof.json"), JSON.stringify(evidence, null, 2) + "\n");
    throw error;
  }
});
