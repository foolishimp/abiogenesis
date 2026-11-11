import assert from "node:assert/strict";
import { realpath } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { checkerRef, isTestingCommandExecutionSchema, LIVE_TESTING_TRANSPORT, liveTransportSkip, observeTestingToolchain, TESTING_CHECKER_SUCCESS_CRITERION, TESTING_ROLE_POLICY, testingExecutionConfig, testingStageMeaning, testingWorksite } from "../support/declared-testing-capability.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";

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

test("declared testing preparation keeps prospective criteria and explicit transport modes", { skip: liveTransportSkip }, async () => {
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

test("declared testing live actor allowance preserves defaults and existing transport policy", { skip: liveTransportSkip }, async () => {
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

// Retired (T-292 TD-31): "declared testing context is bound into the actual consumer lifecycle and shared role policies"; its fixture is the retired STDO pilot declaration under the retired member and policy.

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

// Retired (T-292 TD-31): "declared checker composition uses native owners and independently rederives saved C1/C2 requests"; its fixture is the retired STDO pilot declaration under the retired member and policy.
