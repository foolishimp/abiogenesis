import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  access,
  chmod,
  link,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import {
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
  writeCliTransportRequest,
} from "../support/root-cli-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const execFileAsync = promisify(execFile);
const OWNER_ACTOR_REF = "actor://abiogenesis/worksite/construction-worker@5";
const SOURCE_RELATIVE_PATH = "c2-source/service.mjs";
const DECOY_RELATIVE_PATH = "c2-source/service.mjs.bak";
const SOURCE_BYTES = Buffer.from([
  "import http from 'node:http';",
  "import { writeFileSync } from 'node:fs';",
  "import { fileURLToPath } from 'node:url';",
  "export function answer() { return 42; }",
  "if (process.argv[1] === fileURLToPath(import.meta.url)) {",
  "  const portFile = process.argv[2];",
  "  const server = http.createServer((_request, response) => {",
  "    response.statusCode = 201;",
  "    response.end('abi-ok');",
  "    server.close();",
  "  });",
  "  server.listen(0, '127.0.0.1', () => {",
  "    const address = server.address();",
  "    if (address === null || typeof address === 'string') throw new Error('missing port');",
  "    writeFileSync(portFile, `${address.port}\\n`, { flag: 'wx' });",
  "  });",
  "}",
  "",
].join("\n"), "utf8");

function invocation(invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    invocationRef,
    eventTime: "2026-09-02T00:00:00.000Z",
    correlationId: "correlation://t287/c2/public-chain",
    payload,
  };
}

function projectReadInvocation(invocationRef, variant, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.project.read",
    variant,
    invocationRef,
    eventTime: "2026-09-02T00:00:00.000Z",
    correlationId: "correlation://t287/c2/public-chain/read",
    payload,
  };
}

async function readPublicProjection(harness, authority, variant, targetRef) {
  const transcriptPath = join(
    harness.scratch,
    `t287-c2-public-chain/read-${variant}.jsonl`,
  );
  await writeCliTransportRequest(transcriptPath, {
    acquisition: {
      kind: "reopen",
      closeHandoff: {
        prefix: authority.prefix,
        reopenAuthority: authority.reopenAuthority,
      },
    },
    invocation: projectReadInvocation(
      `invocation://t287/c2/read-${variant}`,
      variant,
      { projectionAuthority: authority, targetRef },
    ),
  });
  return runInstalledCli(harness, { transcriptPath });
}

async function installConstructionTransport(scratch) {
  const command = join(scratch, "c2-bin", "claude-construction");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  if (prompt.length === 0) throw new Error('missing construction prompt');",
    "  const schemaIndex = process.argv.indexOf('--json-schema');",
    "  const schema = JSON.parse(process.argv[schemaIndex + 1]);",
    "  const targetSchema = schema.properties.files.items.properties.targetRef;",
    "  const targetRefs = targetSchema.enum ?? [targetSchema.const];",
    `  const replacementBase64 = ${JSON.stringify(SOURCE_BYTES.toString("base64"))};`,
    "  const result = {",
    "    kind: 'worksite_construction_worker_result',",
    "    schemaVersion: '5.0.0',",
    "    files: targetRefs.map((targetRef) => ({",
    "      kind: 'worksite_candidate_file', schemaVersion: '5.0.0',",
    "      targetRef, replacementBase64,",
    "    })),",
    "  };",
    "  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'c2-c1-proof' })}\\n`);",
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\\n`);",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function installCommandTransport(scratch) {
  const command = join(scratch, "c2-bin", "claude-command");
  await mkdir(dirname(command), { recursive: true });
  await writeFile(command, [
    "#!/usr/bin/env node",
    "import { spawnSync } from 'node:child_process';",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const blocks = prompt.split('\\n\\n');",
    "  const toolCommand = blocks[1];",
    "  if (typeof toolCommand !== 'string') throw new Error('missing exact helper plan');",
    "  const toolUse = { type: 'tool_use', id: 'toolu_c2_helper_001', name: 'Bash', input: { command: toolCommand, description: 'Run the exact ABI helper once' } };",
    "  process.stdout.write(`${JSON.stringify({ type: 'system', subtype: 'init', model: 'c2-command-proof' })}\\n`);",
    "  process.stdout.write(`${JSON.stringify({ type: 'assistant', message: { content: [toolUse] } })}\\n`);",
    "  const helper = spawnSync('/bin/sh', ['-c', toolCommand], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });",
    "  if (helper.status !== 0) throw new Error(`helper failed: ${helper.status}: ${helper.stderr}`);",
    "  const result = JSON.parse(helper.stdout);",
    "  process.stdout.write(`${JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) })}\\n`);",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

function sourceReplay(abg, authority) {
  const durableEvents = abg.readRuntimeEventsAtDurablePrefix(authority.prefix);
  const fullPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents);
  const runPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents, {
    runId: authority.runId,
  });
  return abg.replayValidatedRuntimeEventPrefix(runPrefix, fullPrefix);
}

function directOccurrence(label, nodeRef) {
  return {
    cCallRef: `c-call://t287/c2/${label}`,
    runId: `run://t287/c2/${label}`,
    graphCallId: `graph-call://t287/c2/${label}`,
    frameId: `frame://t287/c2/${label}`,
    programLocusRef: nodeRef,
    taskOrdinal: 0,
    attempt: 1,
    executionAuthority: null,
  };
}

function attemptRefForOccurrence(product, occurrence) {
  const digest = product.sha256Canonical({
    cCallRef: occurrence.cCallRef,
    runId: occurrence.runId,
    graphCallId: occurrence.graphCallId,
    frameId: occurrence.frameId,
    taskOrdinal: occurrence.taskOrdinal,
    attempt: occurrence.attempt,
  });
  return `worksite-command-attempt://abiogenesis/${digest.slice("sha256:".length)}`;
}

function helperPlanForOccurrence(product, task, occurrence) {
  return product.worksiteCommandExecutionHelperPlan(
    task,
    attemptRefForOccurrence(product, occurrence),
  );
}

function launchManifestPathForPlan(plan) {
  return join(dirname(plan.taskManifestPath), "launch.json");
}

function taskManifestBytes(product, task) {
  return Buffer.from(`${product.canonicalJson(task)}\n`, "utf8");
}

function launchManifestForOccurrence(product, task, occurrence, plan) {
  const attemptRef = attemptRefForOccurrence(product, occurrence);
  const attemptDigest = product.sha256Canonical({ attemptRef });
  const body = {
    kind: "worksite_command_execution_launch_manifest",
    schemaVersion: "5.0.0",
    taskRef: task.taskRef,
    taskDigest: task.taskDigest,
    taskManifestPath: plan.taskManifestPath,
    taskManifestDigest: plan.taskManifestDigest,
    taskManifestByteLength: plan.taskManifestByteLength,
    occurrence,
    occurrenceDigest: product.sha256Canonical(occurrence),
    attemptRef,
    attemptDigest,
    archiveRoot: task.workspaceBinding.roots.archiveRoot,
    attemptRoot: dirname(plan.taskManifestPath),
    launchManifestPath: launchManifestPathForPlan(plan),
    helperModulePath: plan.helperModulePath,
    implementationRef: product.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,
    implementationBindingRef:
      product.WORKSITE_COMMAND_EXECUTION_IDS.implementationBindingRef,
    packageName: product.ABI5_PACKAGE_NAME,
    packageVersion: product.ABI5_PACKAGE_VERSION,
  };
  const launchManifestDigest = product.sha256Canonical(body);
  return {
    ...body,
    launchManifestRef:
      `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
    launchManifestDigest,
  };
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function predecessorHelperPlan(product, task, attemptRef) {
  const current = product.worksiteCommandExecutionHelperPlan(task, attemptRef);
  const toolCommand = [
    shellQuote(process.execPath), shellQuote(current.helperModulePath),
    "--task", shellQuote(current.taskManifestPath),
  ].join(" ");
  const toolInputBytes = Buffer.from(
    product.canonicalJson({ command: toolCommand }),
    "utf8",
  );
  return {
    ...current,
    toolCommand,
    toolInputDigest: product.sha256Bytes(toolInputBytes),
    toolInputByteLength: toolInputBytes.byteLength,
  };
}

function exactHelperExchange(product, prepared, plan, label, finalOutput = "{}") {
  const request = prepared.workerRequest;
  const emptyDigest = product.sha256Bytes(Buffer.alloc(0));
  return {
    kind: "actor_process_carrier_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    request,
    observation: {
      actorInvocationRef: `actor-invocation://t287/c2/${label}`,
      actorRef: request.actorRef,
      workerBindingRef: request.workerBindingRef,
      implementationRef: request.implementationRef,
      inputDigest: request.inputDigest,
      materializationPlanRef: request.materializationPlanRef,
      rendererRef: request.rendererRef,
      instructionContractRef: request.instructionContractRef,
      resultContractRef: request.resultContractRef,
      processRef: `process://t287/c2/${label}`,
      transportBindingRef: `transport-binding://t287/c2/${label}`,
      transportBindingDigest: product.sha256Canonical({ label, kind: "binding" }),
      disposition: "success",
      failureClass: null,
      finalOutput,
      observedOutputDigest: product.sha256Bytes(Buffer.from(finalOutput, "utf8")),
      promptDigest: product.sha256Bytes(Buffer.from(request.prompt, "utf8")),
      transportDigest: product.sha256Canonical({ label, kind: "transport" }),
      transportLane: request.transportLane,
      processStatus: 0,
      processSignal: null,
      timeoutClass: null,
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
      structuredEventCount: 2,
      progressEventCount: 0,
      toolCallCount: 1,
      toolInvocations: [{
        kind: "worker_tool_invocation_evidence",
        schemaVersion: "5.0.0",
        ordinal: 0,
        toolUseRef: `tool-use://t287/c2/${label}`,
        toolName: "Bash",
        inputDigest: plan.toolInputDigest,
        inputByteLength: plan.toolInputByteLength,
      }],
      apiRetryCount: 0,
      stdoutByteLength: 0,
      stderrByteLength: 0,
      artifactDigests: {
        output: emptyDigest,
        prompt: emptyDigest,
        stderr: emptyDigest,
        stdout: emptyDigest,
        transport: emptyDigest,
      },
    },
  };
}

function replaceToolInputIdentity(product, exchange, input) {
  const bytes = Buffer.from(product.canonicalJson(input), "utf8");
  exchange.observation.toolInvocations[0].inputDigest = product.sha256Bytes(bytes);
  exchange.observation.toolInvocations[0].inputByteLength = bytes.byteLength;
  return exchange;
}

async function executeHelper(plan) {
  return execFileAsync("/bin/sh", ["-c", plan.toolCommand], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

async function executeHelperArguments(plan, argv) {
  return execFileAsync(process.execPath, [plan.helperModulePath, ...argv], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

async function assertHelperPreflightRefusal(plan, argv, expected) {
  await assert.rejects(
    () => executeHelperArguments(plan, argv),
    (error) => {
      assert.match(String(error?.stderr ?? error), expected);
      return true;
    },
  );
  await assert.rejects(() => access(plan.artifactPath), /ENOENT/);
  await assert.rejects(() => access(plan.sandboxRoot), /ENOENT/);
}

function launchManifestBytes(product, manifest) {
  return Buffer.from(`${product.canonicalJson(manifest)}\n`, "utf8");
}

function resignLaunchManifest(product, manifest, overrides) {
  const merged = { ...manifest, ...overrides };
  const {
    launchManifestDigest: _discardDigest,
    launchManifestRef: _discardRef,
    ...body
  } = merged;
  const launchManifestDigest = product.sha256Canonical(body);
  return {
    ...body,
    launchManifestRef:
      `worksite-command-launch-manifest://abiogenesis/${launchManifestDigest.slice("sha256:".length)}`,
    launchManifestDigest,
  };
}

async function publishTestLaunchManifest(product, path, manifest, options = {}) {
  await mkdir(dirname(path), { recursive: true });
  const bytes = options.noncanonical === true
    ? Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8")
    : launchManifestBytes(product, manifest);
  await writeFile(path, bytes, { flag: "wx" });
  return bytes;
}

async function publishTestTaskManifest(product, task, plan) {
  await mkdir(dirname(plan.taskManifestPath), { recursive: true });
  const bytes = taskManifestBytes(product, task);
  await writeFile(plan.taskManifestPath, bytes, { flag: "wx" });
  return bytes;
}

test("T-287 C2 publicly consumes C1, executes exact helper evidence, closes, and replays", {
  timeout: 360_000,
}, async (context) => {
  const priorInactivityTimeout = process.env.ABG_TS_FP_TIMEOUT_MS;
  const priorAbsoluteTimeout = process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  delete process.env.ABG_TS_FP_TIMEOUT_MS;
  delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  context.after(() => {
    if (priorInactivityTimeout === undefined) delete process.env.ABG_TS_FP_TIMEOUT_MS;
    else process.env.ABG_TS_FP_TIMEOUT_MS = priorInactivityTimeout;
    if (priorAbsoluteTimeout === undefined) delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
    else process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = priorAbsoluteTimeout;
  });
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
    rootPublicationKinds: [
      "worksite_construction",
      "worksite_command_execution",
    ],
  });
  const c1 = harness.product.WORKSITE_CONSTRUCTION_IDS;
  const c2 = harness.product.WORKSITE_COMMAND_EXECUTION_IDS;
  const canonicalScratch = await realpath(harness.scratch);
  let constructionTask;
  const scenario = await buildRootCliScenario(
    harness,
    "t287-c2-public-chain",
    (payload) => payload,
    {
      authorizedActorRef: OWNER_ACTOR_REF,
      programRef: c1.programRef,
      catalogHandle: c1.graphFunctionRef,
      allowlist: [c1.graphFunctionRef, c2.graphFunctionRef].sort(),
      catalogApplications: [],
      productConsumer: join(
        canonicalScratch,
        "t287-c2-public-chain",
        "product-consumer",
      ),
      workspaceRoot: join(
        canonicalScratch,
        "t287-c2-public-chain",
        "workspace",
      ),
      inputContractRef: c1.taskContractRef,
      inputFactory: async ({
        product,
        workspaceBinding,
        admittedInstall,
        catalog,
        catalogView,
      }) => {
        const relativePaths = [SOURCE_RELATIVE_PATH, DECOY_RELATIVE_PATH];
        await mkdir(join(
          workspaceBinding.roots.productRoot,
          dirname(SOURCE_RELATIVE_PATH),
        ), { recursive: true });
        const targets = await Promise.all(relativePaths.map(async (relativePath) => {
          const sourcePath = join(workspaceBinding.roots.productRoot, relativePath);
          const subject = product.constructWorksiteSubject({
            workspaceBinding,
            subjectUri: pathToFileURL(sourcePath).href,
            relativePath,
          });
          const territory = product.constructWorksiteTerritory({
            workspaceBinding,
            territoryUri: pathToFileURL(dirname(sourcePath)).href,
            relativeRoot: dirname(relativePath),
          });
          return {
            subject,
            territory,
            predecessorObservation: await product.observeWorksiteSubject(
              workspaceBinding,
              subject,
            ),
          };
        }));
        const resolution = await product.ProductExecutionResolutionPort.resolve({
          catalog,
          catalogView,
          admittedInstalls: [admittedInstall],
          verifyInstallAdmission: () => true,
          programRef: c1.programRef,
          selection: { kind: "direct", catalogHandle: c1.graphFunctionRef },
        });
        assert.equal(resolution.kind, "loaded_product_execution_resolution");
        const declaredRegimes = new Set([
          ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
          ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
        ]);
        const policy = product.constructRootInvocationPolicy(
          workspaceBinding,
          resolution.program,
          resolution.programValidation.interactionLeafRows.map((row) => ({
            requirementKey: row.requirementKey,
            requirementKeyDigest: row.requirementKeyDigest,
            actorCapabilityRef: row.requirement.actorCapabilityRef,
          })),
          ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
        );
        const capabilityGrant = product.constructCapabilityGrant(
          policy,
          OWNER_ACTOR_REF,
          "abg.operation.run.invoke",
          product.DIRECT_INVOKE_CAPABILITY,
          {
            admittedInstalls: [admittedInstall],
            workspaceBinding,
            fixedPacket: product.RUN_OPERATION_CONTRACTS.invoke.invoke,
          },
        );
        constructionTask = product.constructWorksiteConstructionTask({
          workspaceBinding,
          capabilityGrant,
          prompt: "Construct the exact declared generic validation source.",
          targets,
        });
        return constructionTask;
      },
    },
  );
  assert.ok(constructionTask);
  const constructionCommand = await installConstructionTransport(harness.scratch);
  const c1Run = await runInstalledCli(harness, scenario, {
    timeoutMs: 120_000,
    environment: { ABG_TS_CLAUDE_COMMAND: constructionCommand },
  });
  assert.equal(c1Run.exitCode, 0, JSON.stringify({
    exitCode: c1Run.exitCode,
    stderr: c1Run.stderr,
    outcome: c1Run.outcomes?.at(-1) === undefined ? null : {
      disposition: c1Run.outcomes.at(-1).disposition,
      diagnosticRef: c1Run.outcomes.at(-1).diagnosticRef,
      result: c1Run.outcomes.at(-1).result,
    },
  }));
  const c1Outcome = c1Run.outcomes.at(-1);
  assert.equal(c1Outcome.disposition, "succeeded", JSON.stringify({
    disposition: c1Outcome.disposition,
    diagnosticRef: c1Outcome.diagnosticRef,
    result: c1Outcome.result,
  }));
  assert.equal(c1Outcome.projectionAuthority.kind, "public_run_projection_authority");
  const abg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `c2-source-replay=${Date.now()}`,
  );
  const sourceResult = c1Outcome.result;
  assert.equal(c1Outcome.resultRef, c1Outcome.projectionAuthority.resultRef);
  assert.equal(harness.product.isWorksiteConstructionResult(sourceResult), true);
  const c1DurableEvents = abg.readRuntimeEventsAtDurablePrefix(
    c1Outcome.projectionAuthority.prefix,
  );
  const c1ExactPrefix = abg.selectValidatedRuntimeEventPrefix(c1DurableEvents);
  const admittedSourceBasis = abg.deriveInvocationSourceResultBasisAtPrefix(
    c1ExactPrefix,
    {
      publicAuthorityDigest: c1Outcome.projectionAuthority.authorityDigest,
      runtimeInvocationRef: c1Outcome.projectionAuthority.runtimeInvocationRef,
      invocationAdmissionRef:
        c1Outcome.projectionAuthority.invocationAdmissionRef,
      runId: c1Outcome.projectionAuthority.runId,
      resultRef: c1Outcome.resultRef,
    },
  );
  assert.ok(admittedSourceBasis);
  assert.deepEqual({
    sourceGraphFunctionRef: admittedSourceBasis.sourceGraphFunctionRef,
    sourceResultContractRef: admittedSourceBasis.sourceResultContractRef,
    sourceResultValueDigest: admittedSourceBasis.sourceResultValueDigest,
    expectedValueDigest: harness.product.sha256Canonical(sourceResult),
    sourceWorkspaceId: admittedSourceBasis.sourceWorkspaceId,
    workspaceId: constructionTask.workspaceBinding.workspaceId,
    workspaceBindingId: admittedSourceBasis.workspaceBindingId,
    expectedWorkspaceBindingId: constructionTask.workspaceBinding.bindingId,
    workspaceBindingDigest: admittedSourceBasis.workspaceBindingDigest,
    expectedWorkspaceBindingDigest: constructionTask.workspaceBinding.bindingDigest,
  }, {
    sourceGraphFunctionRef: c1.reducerGraphFunctionRef,
    sourceResultContractRef: c1.resultContractRef,
    sourceResultValueDigest: harness.product.sha256Canonical(sourceResult),
    expectedValueDigest: harness.product.sha256Canonical(sourceResult),
    sourceWorkspaceId: constructionTask.workspaceBinding.workspaceId,
    workspaceId: constructionTask.workspaceBinding.workspaceId,
    workspaceBindingId: constructionTask.workspaceBinding.bindingId,
    expectedWorkspaceBindingId: constructionTask.workspaceBinding.bindingId,
    workspaceBindingDigest: constructionTask.workspaceBinding.bindingDigest,
    expectedWorkspaceBindingDigest: constructionTask.workspaceBinding.bindingDigest,
  });
  assert.deepEqual(await readFile(join(
    constructionTask.workspaceBinding.roots.productRoot,
    SOURCE_RELATIVE_PATH,
  )), SOURCE_BYTES);
  assert.deepEqual(await readFile(join(
    constructionTask.workspaceBinding.roots.productRoot,
    DECOY_RELATIVE_PATH,
  )), SOURCE_BYTES);

  const catalog = scenario.preRunOutcomes.find((outcome) =>
    outcome.result?.kind === "graph_function_catalog"
  ).result;
  const catalogView = scenario.preRunOutcomes.find((outcome) =>
    outcome.result?.kind === "graph_function_catalog_view"
  ).result;
  const admittedInstall = scenario.ownerProjections.admittedInstall.install;
  const c2Resolution = await harness.product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls: [admittedInstall],
    verifyInstallAdmission: () => true,
    programRef: c2.programRef,
    selection: { kind: "direct", catalogHandle: c2.graphFunctionRef },
  });
  assert.equal(c2Resolution.kind, "loaded_product_execution_resolution");
  const c2Regimes = new Set([
    ...c2Resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...c2Resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const c2Policy = harness.product.constructRootInvocationPolicy(
    constructionTask.workspaceBinding,
    c2Resolution.program,
    c2Resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => c2Regimes.has(regime)),
  );
  const c2CapabilityGrant = harness.product.constructCapabilityGrant(
    c2Policy,
    OWNER_ACTOR_REF,
    "abg.operation.run.invoke",
    harness.product.DIRECT_INVOKE_CAPABILITY,
    {
      admittedInstalls: [admittedInstall],
      workspaceBinding: constructionTask.workspaceBinding,
      fixedPacket: harness.product.RUN_OPERATION_CONTRACTS.invoke.invoke,
    },
  );

  const initialReport = "<testsuite tests=\"99\"><testcase name=\"initial\"/></testsuite>\n";
  const finalReport = [
    "<testsuite tests=\"999\" failures=\"999\">",
    "<!-- <testcase><failure/></testcase> -->",
    "<![CDATA[<testcase><error/></testcase>]]>",
    "<testcase name=\"one\"/>",
    "<testcase name=\"two\"/>",
    "<testcase name=\"three\"><skipped/></testcase>",
    "</testsuite>",
    "",
  ].join("\n");
  const nodePath = process.execPath;
  const task = harness.product.constructWorksiteCommandExecutionTask({
    workspaceBinding: constructionTask.workspaceBinding,
    capabilityGrant: c2CapabilityGrant,
    sourceConstructionResultRef: sourceResult.resultRef,
    sourceConstructionResultDigest: sourceResult.resultDigest,
    sourceConstructionResult: sourceResult,
    commands: [
      {
        commandId: "command://c2/setup",
        executable: nodePath,
        args: ["-e", [
          "const fs=require('node:fs')",
          "fs.mkdirSync('reports',{recursive:true})",
          "fs.mkdirSync('evidence',{recursive:true})",
          `fs.writeFileSync('reports/final.xml',${JSON.stringify(initialReport)})`,
        ].join(";")],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [{
          reportIdentity: "report://c2/initial-junit",
          relativePath: "reports/final.xml",
        }],
      },
      {
        commandId: "command://c2/mutate-report",
        executable: nodePath,
        args: ["-e", [
          "const fs=require('node:fs')",
          `fs.writeFileSync('reports/final.xml',${JSON.stringify(finalReport)})`,
          "process.stdout.write('mutated\\n')",
        ].join(";")],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
      {
        commandId: "command://c2/tap",
        executable: nodePath,
        args: ["-e", "process.stdout.write('# pass 3\\n')"],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
      {
        commandId: "command://c2/nonzero",
        executable: nodePath,
        args: ["-e", "process.exit(7)"],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
    ],
    outcomePredicates: [
      {
        predicateId: "predicate://c2/nonzero-exit",
        predicateKind: "process_exit",
        declaration: { validationCommandId: "command://c2/nonzero", equals: 7 },
      },
      {
        predicateId: "predicate://c2/stdout",
        predicateKind: "stdout_exact",
        declaration: { validationCommandId: "command://c2/mutate-report", equals: "mutated\n" },
      },
      {
        predicateId: "predicate://c2/pass-count",
        predicateKind: "test_pass_count",
        declaration: { validationCommandId: "command://c2/tap", greaterThanOrEqual: 3 },
      },
      {
        predicateId: "predicate://c2/report-pass-count",
        predicateKind: "test_pass_count",
        declaration: {
          validationCommandId: "command://c2/nonzero",
          greaterThanOrEqual: 2,
        },
      },
      {
        predicateId: "predicate://c2/module-export",
        predicateKind: "module_export_return_exact",
        declaration: { path: SOURCE_RELATIVE_PATH, export: "answer", equals: 42 },
      },
      {
        predicateId: "predicate://c2/http",
        predicateKind: "http_response_exact",
        declaration: {
          validationCommandId: "command://c2/setup",
          status: 418,
          body: "declared-but-not-observed",
          launch: {
            executable: nodePath,
            args: [
              SOURCE_RELATIVE_PATH,
              c2.httpPortFileArgumentPlaceholder,
            ],
            relativeCwd: ".",
            environment: { PATH: process.env.PATH },
            timeoutMs: 5_000,
            terminationGraceMs: 1_000,
            portFile: { relativePath: "evidence/http.port" },
          },
          request: {
            hostname: "127.0.0.1",
            method: "GET",
            path: "/health",
            timeoutMs: 2_000,
          },
        },
      },
      {
        predicateId: "predicate://c2/modules",
        predicateKind: "module_set_exact",
        declaration: {
          selector: {
            source: "protected_paths",
            prefix: "c2-source/",
            suffix: ".mjs",
            segmentIndex: 0,
          },
          equals: ["service.mjs"],
        },
      },
      {
        predicateId: "predicate://c2/files",
        predicateKind: "file_count",
        declaration: {
          selector: {
            source: "protected_paths",
            includeSubstrings: [],
            includeSuffixes: [".mjs"],
          },
          equals: 1,
        },
      },
      {
        predicateId: "predicate://c2/reports",
        predicateKind: "test_report_set_exact",
        declaration: {
          base: "reports",
          selector: { includeSubstrings: [], includeSuffixes: [".xml"] },
          equals: ["final.xml"],
        },
      },
      {
        predicateId: "predicate://c2/report-failures",
        predicateKind: "test_report_failure_count",
        declaration: { equals: 0 },
      },
      {
        predicateId: "predicate://c2/report-errors",
        predicateKind: "test_report_error_count",
        declaration: { equals: 0 },
      },
    ],
    protectedObservations: sourceResult.members.map((member, ordinal) => ({
      sourceMemberRef: member.inputMemberRef,
      subject: constructionTask.targets[ordinal].subject,
      observation: member.successorObservation,
    })),
    allowedWriteTerritories: [
      { pathKind: "subtree", relativePath: "reports" },
      { pathKind: "subtree", relativePath: "evidence" },
    ],
  });
  assert.equal(harness.product.isWorksiteCommandExecutionTask(task), true);
  const admittedHttpDeclaration = task.outcomePredicates.find(
    (predicate) => predicate.predicateId === "predicate://c2/http",
  ).declaration;
  assert.equal(admittedHttpDeclaration.status, 418);
  assert.equal(admittedHttpDeclaration.body, "declared-but-not-observed");
  assert.equal(
    "minItems" in harness.product.worksiteCommandExecutionWorkerResultSchema(task)
      .properties.commandResults,
    false,
    "the schema must carry typed helper preflight refusals with zero command rows",
  );

  const c1CloseHandoff = {
    prefix: c1Outcome.projectionAuthority.prefix,
    reopenAuthority: c1Outcome.projectionAuthority.reopenAuthority,
  };
  const c2Request = invocation(
    "invocation://t287/c2/public-command-execution",
    {
      installInvocationRef: scenario.refs.install,
      workspaceBindingInvocationRef: scenario.refs.bind,
      catalog,
      catalogView,
      applications: [],
      programRef: c2.programRef,
      catalogHandle: c2.graphFunctionRef,
      actorRef: OWNER_ACTOR_REF,
      input: task,
      eventLogPath: scenario.eventLogPath,
      runtimePrefixAuthority: c1CloseHandoff,
      sourceProjectionAuthority: c1Outcome.projectionAuthority,
      sourceResultRef: c1Outcome.resultRef,
    },
  );
  const c2TranscriptPath = join(
    harness.scratch,
    "t287-c2-public-chain",
    "c2-run.jsonl",
  );
  await writeCliTransportRequest(c2TranscriptPath, {
    acquisition: { kind: "reopen", closeHandoff: c1CloseHandoff },
    invocation: c2Request,
  });
  const commandTransport = await installCommandTransport(harness.scratch);
  const c2Run = await runInstalledCli(harness, {
    ...c1Run,
    transcriptPath: c2TranscriptPath,
  }, {
    timeoutMs: 120_000,
    environment: {
      ABG_TS_CLAUDE_COMMAND: commandTransport,
      ABG_TS_FP_TIMEOUT_MS: undefined,
      ABG_TS_FP_ABSOLUTE_TIMEOUT_MS: undefined,
    },
  });
  assert.equal(c2Run.exitCode, 0, JSON.stringify({
    exitCode: c2Run.exitCode,
    stderr: c2Run.stderr,
    outcome: c2Run.outcomes?.at(-1) === undefined ? null : {
      disposition: c2Run.outcomes.at(-1).disposition,
      diagnosticRef: c2Run.outcomes.at(-1).diagnosticRef,
      result: c2Run.outcomes.at(-1).result,
    },
  }));
  const c2Outcome = c2Run.outcomes.at(-1);
  assert.equal(c2Outcome.disposition, "succeeded", JSON.stringify({
    disposition: c2Outcome.disposition,
    diagnosticRef: c2Outcome.diagnosticRef,
    result: c2Outcome.result,
  }));
  assert.equal(c2Outcome.projectionAuthority.kind, "public_run_projection_authority");
  assert.equal(c2Outcome.projectionAuthority.catalogViewDigest,
    c1Outcome.projectionAuthority.catalogViewDigest);
  const c2Replay = sourceReplay(abg, c2Outcome.projectionAuthority);
  assert.equal(c2Replay.runtimeStatus, "closed");
  const observationCall = c2Replay.cCalls.find((row) =>
    row.resultValue?.kind === "worksite_command_execution_observation"
  );
  assert.ok(observationCall, JSON.stringify(c2Replay));
  const observation = observationCall.resultValue;
  assert.equal(harness.product.isWorksiteCommandExecutionObservation(observation), true);
  assert.deepEqual(c2Outcome.result, observation);
  assert.equal(c2Outcome.resultRef, observationCall.resultRef);
  const helperPlanKeys = [
    "artifactPath", "attemptRef", "helperModulePath", "kind", "sandboxRoot",
    "schemaVersion", "taskManifestByteLength", "taskManifestDigest",
    "taskManifestPath", "toolCommand", "toolInputByteLength", "toolInputDigest",
  ].sort();
  assert.deepEqual(
    Object.keys(observation.provenance.helperPlan).sort(),
    helperPlanKeys,
  );
  for (const privateKey of [
    "attemptDigest", "attemptRoot", "launchManifest", "launchManifestByteDigest",
    "launchManifestByteLength", "launchManifestDigest", "launchManifestPath",
    "launchManifestRef", "occurrence", "occurrenceDigest", "packageName",
    "packageVersion",
  ]) {
    assert.equal(
      Object.hasOwn(observation.provenance.helperPlan, privateKey),
      false,
      privateKey,
    );
  }
  const replayedObservationBytes = harness.product.canonicalJson(observation);
  for (const privateEnvelopeKey of [
    "attemptDigest", "attemptRoot", "launchManifest", "launchManifestByteDigest",
    "launchManifestByteLength", "launchManifestDigest", "launchManifestPath",
    "launchManifestRef", "occurrenceDigest", "packageName", "packageVersion",
  ]) {
    assert.equal(
      replayedObservationBytes.includes(`\"${privateEnvelopeKey}\"`),
      false,
      privateEnvelopeKey,
    );
  }
  const priorHelperPlan = predecessorHelperPlan(
    harness.product,
    observation.task,
    observation.provenance.helperPlan.attemptRef,
  );
  assert.deepEqual(Object.keys(priorHelperPlan).sort(), helperPlanKeys);
  assert.equal(
    harness.product.isWorksiteCommandExecutionHelperPlan(
      observation.task,
      priorHelperPlan,
    ),
    false,
  );
  const priorProvenance = {
    ...observation.provenance,
    helperToolInvocation: {
      ...observation.provenance.helperToolInvocation,
      inputDigest: priorHelperPlan.toolInputDigest,
      inputByteLength: priorHelperPlan.toolInputByteLength,
    },
    helperPlan: priorHelperPlan,
  };
  const {
    kind: _observationKind,
    schemaVersion: _observationSchemaVersion,
    observationRef: _observationRef,
    observationDigest: _observationDigest,
    ...currentObservationBody
  } = observation;
  const priorObservationBody = {
    ...currentObservationBody,
    provenance: priorProvenance,
  };
  const priorObservationDigest = harness.product.sha256Canonical(
    priorObservationBody,
  );
  const priorObservation = {
    kind: "worksite_command_execution_observation",
    schemaVersion: "5.0.0",
    observationRef:
      `worksite-command-execution-observation://abiogenesis/${priorObservationDigest.slice("sha256:".length)}`,
    observationDigest: priorObservationDigest,
    ...priorObservationBody,
  };
  assert.equal(
    harness.product.isWorksiteCommandExecutionObservation(priorObservation),
    false,
  );
  assert.equal(
    harness.product.isWorksiteCommandExecutionObservation({
      ...priorObservation,
      provenance: {
        ...priorObservation.provenance,
        helperPlan: {
          ...priorObservation.provenance.helperPlan,
          launchManifest: { private: true },
        },
      },
    }),
    false,
  );
  assert.equal(observation.commandResults.length, 4);
  assert.deepEqual(observation.commandResults.map((row) => row.exitStatus), [0, 0, 0, 7]);
  assert.equal(observation.commandResults.every((row) => row.terminationConfirmed), true);
  assert.equal(observation.provenance.toolCallCount, 1);
  assert.equal(observation.provenance.helperToolInvocation.toolName, "Bash");
  assert.equal(observation.productDelta.length, 0);
  assert.equal(observation.worksiteDelta.every((row) => row.matchedTerritoryRef !== null), true);
  assert.equal(observation.helperArtifactRef,
    `worksite-command-helper-artifact://abiogenesis/${observation.helperArtifactDigest.slice("sha256:".length)}`);
  const values = new Map(observation.predicateObservations.map((row) => [
    row.predicateId,
    row,
  ]));
  assert.equal(values.get("predicate://c2/nonzero-exit").observedValue, 7);
  assert.equal(values.get("predicate://c2/stdout").observedValue, "mutated\n");
  assert.equal(values.get("predicate://c2/pass-count").observedValue, 3);
  assert.equal(values.get("predicate://c2/report-pass-count").observedValue, 2);
  assert.equal(values.get("predicate://c2/module-export").observedValue, 42);
  assert.deepEqual(values.get("predicate://c2/modules").observedValue, ["service.mjs"]);
  assert.equal(values.get("predicate://c2/files").observedValue, 1);
  assert.deepEqual(values.get("predicate://c2/reports").observedValue, ["final.xml"]);
  assert.equal(values.get("predicate://c2/report-failures").observedValue, 0);
  assert.equal(values.get("predicate://c2/report-errors").observedValue, 0);
  const http = values.get("predicate://c2/http").observedValue;
  assert.equal(http.response.status, 201);
  assert.equal(http.response.body, "abi-ok");
  assert.equal(http.portFile.state, "observed");
  assert.equal(http.process.terminationConfirmed, true);
  const initialReportObservation = observation.commandResults[0].reports[0];
  const finalReportEvidence = values.get("predicate://c2/reports").evidence[0];
  assert.notEqual(finalReportEvidence.digest, initialReportObservation.digest);
  assert.equal(
    values.get("predicate://c2/reports").evidenceRefs[0],
    finalReportEvidence.observationRef,
  );
  assert.equal(
    c2Replay.cCalls.find((row) => row.resultRef === observationCall.resultRef)
      .resultValue.helperArtifactDigest,
    observation.helperArtifactDigest,
  );
  const retainedHelperArtifact = JSON.parse(
    await readFile(observation.provenance.helperArtifactPath, "utf8"),
  );
  assert.equal(retainedHelperArtifact.artifactRef, observation.helperArtifactRef);
  assert.equal(retainedHelperArtifact.artifactDigest, observation.helperArtifactDigest);
  assert.deepEqual(retainedHelperArtifact.commandResults, observation.commandResults);
  assert.deepEqual(
    retainedHelperArtifact.predicateObservations,
    observation.predicateObservations,
  );
  assert.deepEqual(retainedHelperArtifact.protectedBefore, retainedHelperArtifact.protectedAfter);
  assert.deepEqual(retainedHelperArtifact.productDelta, []);

  const c2DurableEvents = abg.readRuntimeEventsAtDurablePrefix(
    c2Outcome.projectionAuthority.prefix,
  );
  const c2InvocationAdmissions = c2DurableEvents.filter((event) =>
    event.kind === "invocation_admitted" &&
    event.payload?.publicRequestInvocationRef === c2Request.invocationRef
  );
  assert.equal(c2InvocationAdmissions.length, 1);
  assert.deepEqual(
    c2InvocationAdmissions[0].payload.sourceResultBasis,
    admittedSourceBasis,
  );
  assert.equal(
    c2DurableEvents.filter((event) =>
      event.kind === "run_closed" && event.runId === c2Outcome.runId
    ).length,
    1,
  );

  const publicResultRead = await readPublicProjection(
    harness,
    c2Outcome.projectionAuthority,
    "result",
    c2Outcome.resultRef,
  );
  assert.equal(publicResultRead.exitCode, 0, publicResultRead.stderr);
  const publicResult = publicResultRead.outcomes.at(-1);
  assert.equal(publicResult.disposition, "succeeded");
  assert.equal(publicResult.result.kind, "public_result_projection");
  assert.equal(publicResult.result.resultRef, c2Outcome.resultRef);
  assert.deepEqual(publicResult.result.value, c2Outcome.result);
  assert.equal(publicResult.replayRef, c2Outcome.replayRef);
  assert.equal(publicResult.replayDigest, c2Outcome.replayDigest);

  const publicReplayRead = await readPublicProjection(
    harness,
    c2Outcome.projectionAuthority,
    "replay",
    c2Outcome.runId,
  );
  assert.equal(publicReplayRead.exitCode, 0, publicReplayRead.stderr);
  const publicReplay = publicReplayRead.outcomes.at(-1);
  assert.equal(publicReplay.disposition, "succeeded");
  assert.equal(publicReplay.result.kind, "public_replay_projection");
  assert.equal(publicReplay.result.replayRef, c2Outcome.replayRef);
  assert.equal(publicReplay.result.replayDigest, c2Outcome.replayDigest);
  assert.deepEqual(publicReplay.projectionAuthority, c2Outcome.projectionAuthority);

  const commandImplementation = await import(
    `${pathToFileURL(join(
      harness.installedPackageRoot,
      "build/code/src/implementation/worksite_command_execution.js",
    )).href}?c2-negatives=${Date.now()}`
  );
  const commandProduct = await import(
    `${pathToFileURL(join(
      harness.installedPackageRoot,
      "build/code/src/product/worksite_command_execution.js",
    )).href}?c2-product-negatives=${Date.now()}`
  );
  const directTaskBasis = {
    workspaceBinding: constructionTask.workspaceBinding,
    capabilityGrant: c2CapabilityGrant,
    sourceConstructionResultRef: sourceResult.resultRef,
    sourceConstructionResultDigest: sourceResult.resultDigest,
    sourceConstructionResult: sourceResult,
    protectedObservations: task.protectedObservations,
  };

  const productRoot = constructionTask.workspaceBinding.roots.productRoot;
  const rootAliases = [
    ["repeated-separator", `${dirname(productRoot)}//${basename(productRoot)}/private.txt`],
    ["dot-segment", `${dirname(productRoot)}/./${basename(productRoot)}/private.txt`],
    ["parent-segment", `${productRoot}/../${basename(productRoot)}/private.txt`],
  ];
  const rootAliasCarriers = [
    "command-executable",
    "command-argv",
    "command-environment",
    "http-executable",
    "http-argv",
    "http-environment",
  ];
  for (const [aliasKind, aliasValue] of rootAliases) {
    assert.equal(resolve(aliasValue), resolve(productRoot, "private.txt"));
    for (const carrier of rootAliasCarriers) {
      const label = `${aliasKind}-${carrier}`;
      const spawnSentinel = join(harness.scratch, `${label}.spawned`);
      const sentinelScript =
        `require('node:fs').writeFileSync(${JSON.stringify(spawnSentinel)},'spawned')`;
      assert.throws(
        () => harness.product.constructWorksiteCommandExecutionTask({
          ...directTaskBasis,
          commands: [{
            commandId: `command://c2/${label}`,
            executable: carrier === "command-executable" ? aliasValue : nodePath,
            args: carrier === "command-argv"
              ? ["-e", sentinelScript, aliasValue]
              : ["-e", sentinelScript],
            relativeCwd: ".",
            environment: carrier === "command-environment"
              ? { PATH: process.env.PATH, C2_ROOT_ALIAS: aliasValue }
              : { PATH: process.env.PATH },
            timeoutMs: 5_000,
            terminationGraceMs: 1_000,
            expectedReports: [],
          }],
          outcomePredicates: carrier.startsWith("http-") ? [{
            predicateId: `predicate://c2/${label}`,
            predicateKind: "http_response_exact",
            declaration: {
              validationCommandId: `command://c2/${label}`,
              status: 200,
              body: "unused",
              launch: {
                executable: carrier === "http-executable" ? aliasValue : nodePath,
                args: carrier === "http-argv"
                  ? [c2.httpPortFileArgumentPlaceholder, aliasValue]
                  : ["-e", "setInterval(()=>{},1000)", c2.httpPortFileArgumentPlaceholder],
                relativeCwd: ".",
                environment: carrier === "http-environment"
                  ? { PATH: process.env.PATH, C2_ROOT_ALIAS: aliasValue }
                  : { PATH: process.env.PATH },
                timeoutMs: 5_000,
                terminationGraceMs: 1_000,
                portFile: {
                  relativePath: `root-alias-evidence-${label}/http.port`,
                },
              },
              request: {
                hostname: "127.0.0.1",
                method: "GET",
                path: "/",
                timeoutMs: 1_000,
              },
            },
          }] : [],
          allowedWriteTerritories: [{
            pathKind: "subtree",
            relativePath: `root-alias-evidence-${label}`,
          }],
        }),
        /command and predicate identities must be unique/,
        label,
      );
      await assert.rejects(() => access(spawnSentinel), /ENOENT/, label);
    }
  }

  const boundedRelayTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [
      {
        commandId: "command://c2/bounded-relay-nonzero",
        executable: nodePath,
        args: ["-e", [
          "const fs=require('node:fs')",
          "fs.mkdirSync('relay-diagnostics',{recursive:true})",
          "for(let ordinal=0;ordinal<96;ordinal+=1)fs.writeFileSync('relay-diagnostics/diagnostic-'+String(ordinal).padStart(3,'0')+'.txt','diagnostic-'+ordinal+'\\n')",
          "process.stdout.write('failed-with-evidence\\n')",
          "process.exit(7)",
        ].join(";")],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
      {
        commandId: "command://c2/bounded-relay-success",
        executable: nodePath,
        args: ["-e", "process.stdout.write('success\\n')"],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
    ],
    outcomePredicates: [
      {
        predicateId: "predicate://c2/bounded-relay-nonzero",
        predicateKind: "process_exit",
        declaration: {
          validationCommandId: "command://c2/bounded-relay-nonzero",
          equals: 7,
        },
      },
      {
        predicateId: "predicate://c2/bounded-relay-success",
        predicateKind: "process_exit",
        declaration: {
          validationCommandId: "command://c2/bounded-relay-success",
          equals: 0,
        },
      },
    ],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "relay-diagnostics",
    }],
  });
  const boundedRelayOccurrence = directOccurrence("bounded-relay", c2.nodeRef);
  const boundedRelayPlan = helperPlanForOccurrence(
    harness.product,
    boundedRelayTask,
    boundedRelayOccurrence,
  );
  const boundedRelayPrepared = commandImplementation
    .realizeWorksiteCommandExecution(boundedRelayTask, boundedRelayOccurrence);
  assert.equal(
    harness.product.isWorksiteCommandExecutionHelperPlan(
      boundedRelayTask,
      boundedRelayPlan,
    ),
    true,
  );
  assert.deepEqual(
    Object.keys(boundedRelayPlan).sort(),
    [
      "artifactPath", "attemptRef", "helperModulePath", "kind", "sandboxRoot",
      "schemaVersion", "taskManifestByteLength", "taskManifestDigest",
      "taskManifestPath", "toolCommand", "toolInputByteLength", "toolInputDigest",
    ].sort(),
  );
  const boundedTaskBytes = await readFile(boundedRelayPlan.taskManifestPath);
  assert.deepEqual(
    boundedTaskBytes,
    taskManifestBytes(harness.product, boundedRelayTask),
  );
  assert.equal(
    harness.product.sha256Bytes(boundedTaskBytes),
    boundedRelayPlan.taskManifestDigest,
  );
  assert.equal(boundedTaskBytes.byteLength, boundedRelayPlan.taskManifestByteLength);
  assert.deepEqual(JSON.parse(boundedTaskBytes.toString("utf8")), boundedRelayTask);
  const boundedLaunchPath = launchManifestPathForPlan(boundedRelayPlan);
  const boundedRelayManifest = JSON.parse(
    await readFile(boundedLaunchPath, "utf8"),
  );
  const expectedBoundedRelayManifest = launchManifestForOccurrence(
    harness.product,
    boundedRelayTask,
    boundedRelayOccurrence,
    boundedRelayPlan,
  );
  assert.deepEqual(
    Object.keys(boundedRelayManifest).sort(),
    [
      "archiveRoot", "attemptDigest", "attemptRef", "attemptRoot",
      "helperModulePath", "implementationBindingRef", "implementationRef",
      "kind", "launchManifestDigest", "launchManifestPath",
      "launchManifestRef", "occurrence", "occurrenceDigest", "packageName",
      "packageVersion", "schemaVersion", "taskDigest", "taskManifestByteLength",
      "taskManifestDigest", "taskManifestPath", "taskRef",
    ].sort(),
  );
  assert.deepEqual(boundedRelayManifest, expectedBoundedRelayManifest);
  assert.equal(Object.hasOwn(boundedRelayManifest, "task"), false);
  assert.deepEqual(
    boundedRelayManifest.occurrence,
    boundedRelayOccurrence,
  );
  assert.equal(
    boundedRelayManifest.occurrenceDigest,
    harness.product.sha256Canonical(boundedRelayOccurrence),
  );
  assert.equal(
    boundedRelayManifest.attemptDigest,
    harness.product.sha256Canonical({ attemptRef: boundedRelayPlan.attemptRef }),
  );
  assert.equal(
    boundedRelayManifest.launchManifestDigest,
    expectedBoundedRelayManifest.launchManifestDigest,
  );
  const boundedLaunchBytes = await readFile(
    boundedLaunchPath,
  );
  assert.deepEqual(
    boundedLaunchBytes,
    launchManifestBytes(harness.product, boundedRelayManifest),
  );
  const boundedTaskStatus = await lstat(boundedRelayPlan.taskManifestPath);
  const boundedLaunchStatus = await lstat(boundedLaunchPath);
  assert.equal(boundedTaskStatus.nlink, 1);
  assert.equal(boundedLaunchStatus.nlink, 1);
  assert.equal(
    boundedTaskStatus.dev === boundedLaunchStatus.dev &&
      boundedTaskStatus.ino === boundedLaunchStatus.ino,
    false,
  );
  assert.match(boundedRelayPlan.toolCommand, / --task '[^']+\/launch\.json'$/);
  assert.equal(boundedRelayPlan.toolCommand.includes("--artifact"), false);
  assert.equal(boundedRelayPlan.toolCommand.includes("--sandbox"), false);
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes(
      "Do not run any declared command directly and do not use another tool call.",
    ),
    true,
  );
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes("Read the helper artifact"),
    false,
  );
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes(boundedRelayPlan.artifactPath),
    false,
  );
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes(boundedRelayPlan.sandboxRoot),
    false,
  );
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes("artifactPath"),
    false,
  );
  assert.equal(
    boundedRelayPrepared.workerRequest.prompt.includes("sandboxRoot"),
    false,
  );
  const boundedRelayExecution = await executeHelper(boundedRelayPlan);
  assert.equal(
    boundedRelayExecution.stdout.includes("ABI_WORKSITE_HEARTBEAT"),
    false,
  );
  const boundedRelayBytes = Buffer.from(boundedRelayExecution.stdout, "utf8");
  const fullArtifactBytes = await readFile(boundedRelayPlan.artifactPath);
  const installedHelperSource = await readFile(
    boundedRelayPlan.helperModulePath,
    "utf8",
  );
  assert.match(
    installedHelperSource,
    /finally\s*\{\s*await unlink\(temporaryPath\);\s*\}/u,
  );
  assert.equal(
    /unlink\(temporaryPath\)\.catch/u.test(installedHelperSource),
    false,
  );
  assert.equal(fullArtifactBytes.byteLength > 32 * 1024, true);
  assert.equal(boundedRelayBytes.byteLength < 30_000, true);
  const fullArtifact = JSON.parse(fullArtifactBytes.toString("utf8"));
  assert.equal(
    harness.product.isWorksiteCommandHelperArtifact(boundedRelayTask, fullArtifact),
    true,
  );
  assert.equal(
    fullArtifact.artifactRef,
    `worksite-command-helper-artifact://abiogenesis/${fullArtifact.artifactDigest.slice("sha256:".length)}`,
  );
  assert.deepEqual(await readFile(boundedRelayPlan.artifactPath), fullArtifactBytes);
  const boundedRelay = JSON.parse(boundedRelayExecution.stdout);
  const expectedBoundedRelay = {
    kind: "worksite_command_execution_worker_result",
    schemaVersion: "5.0.0",
    taskRef: boundedRelayTask.taskRef,
    taskDigest: boundedRelayTask.taskDigest,
    workspaceBindingIdentity: boundedRelayTask.workspaceBinding.bindingId,
    workspaceBindingDigest: boundedRelayTask.workspaceBinding.bindingDigest,
    sourceConstructionResultRef: boundedRelayTask.sourceConstructionResultRef,
    sourceConstructionResultDigest: boundedRelayTask.sourceConstructionResultDigest,
    commandResults: fullArtifact.commandResults,
    predicateObservations: fullArtifact.predicateObservations,
  };
  assert.deepEqual(boundedRelay, expectedBoundedRelay);
  assert.deepEqual(
    Object.keys(boundedRelay).sort(),
    [...boundedRelayPrepared.workerRequest.responseJsonSchema.required].sort(),
  );
  assert.deepEqual(
    boundedRelay.commandResults.map((row) => row.exitStatus),
    [7, 0],
  );
  assert.equal(
    boundedRelay.predicateObservations.find(
      (row) => row.predicateId === "predicate://c2/bounded-relay-nonzero",
    ).observedValue,
    7,
  );
  const boundedRelayExchange = exactHelperExchange(
    harness.product,
    boundedRelayPrepared,
    boundedRelayPlan,
    "bounded-relay",
    boundedRelayExecution.stdout.trimEnd(),
  );
  const legacyBoundedRelayPlan = predecessorHelperPlan(
    harness.product,
    boundedRelayTask,
    boundedRelayPlan.attemptRef,
  );
  assert.equal(
    harness.product.isWorksiteCommandExecutionHelperPlan(
      boundedRelayTask,
      legacyBoundedRelayPlan,
    ),
    false,
  );
  assert.throws(
    () => harness.product.constructWorksiteCommandExecutionObservation(
      boundedRelayTask,
      boundedRelay,
      boundedRelayExchange.observation,
      fullArtifact,
      legacyBoundedRelayPlan,
    ),
    /requires the exact helper tool invocation/,
  );
  const predecessorExchangeFailure = await boundedRelayPrepared.complete(
    exactHelperExchange(
      harness.product,
      boundedRelayPrepared,
      legacyBoundedRelayPlan,
      "predecessor-task-json-plan",
      boundedRelayExecution.stdout.trimEnd(),
    ),
  );
  assert.equal(predecessorExchangeFailure.disposition, "failure");
  assert.equal(
    predecessorExchangeFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  const boundedRelayCompletion = await boundedRelayPrepared.complete(
    boundedRelayExchange,
  );
  assert.equal(boundedRelayCompletion.disposition, "success");
  assert.deepEqual(
    boundedRelayCompletion.resultCandidate.commandResults.map(
      (row) => row.exitStatus,
    ),
    [7, 0],
  );
  assert.equal((await lstat(boundedRelayPlan.artifactPath)).nlink, 1);
  const resultAliasPath = `${boundedRelayPlan.artifactPath}.hard-link-alias`;
  await link(boundedRelayPlan.artifactPath, resultAliasPath);
  try {
    assert.equal((await lstat(boundedRelayPlan.artifactPath)).nlink, 2);
    const resultAliasFailure = await boundedRelayPrepared.complete(
      boundedRelayExchange,
    );
    assert.equal(resultAliasFailure.disposition, "failure");
    assert.equal(
      resultAliasFailure.resultCandidate.failureClass,
      "helper_artifact_absent",
    );
  } finally {
    await unlink(resultAliasPath);
  }
  const refusesBoundedRelay = async (label, projection) => {
    const completion = await boundedRelayPrepared.complete(exactHelperExchange(
      harness.product,
      boundedRelayPrepared,
      boundedRelayPlan,
      label,
      JSON.stringify(projection),
    ));
    assert.equal(completion.disposition, "failure");
    assert.equal(completion.resultCandidate.failureClass, "result_contract_failure");
  };
  await refusesBoundedRelay("bounded-relay-added", {
    ...boundedRelay,
    undeclared: true,
  });
  await refusesBoundedRelay("bounded-relay-missing", {
    ...boundedRelay,
    commandResults: boundedRelay.commandResults.slice(0, -1),
  });
  await refusesBoundedRelay("bounded-relay-reordered", {
    ...boundedRelay,
    commandResults: [
      boundedRelay.commandResults[1],
      boundedRelay.commandResults[0],
      ...boundedRelay.commandResults.slice(2),
    ],
  });
  await refusesBoundedRelay("bounded-relay-forged", {
    ...boundedRelay,
    taskRef: `${boundedRelay.taskRef}/forged`,
  });
  await refusesBoundedRelay("bounded-relay-command-id", {
    ...boundedRelay,
    commandResults: boundedRelay.commandResults.map((row, ordinal) =>
      ordinal === 0 ? { ...row, commandId: `${row.commandId}/forged` } : row
    ),
  });
  await refusesBoundedRelay("bounded-relay-source-ref", {
    ...boundedRelay,
    sourceConstructionResultRef:
      `${boundedRelay.sourceConstructionResultRef}/forged`,
  });
  await refusesBoundedRelay("bounded-relay-source-digest", {
    ...boundedRelay,
    sourceConstructionResultDigest: harness.product.sha256Canonical({
      forged: "source",
    }),
  });
  await refusesBoundedRelay("bounded-relay-workspace-id", {
    ...boundedRelay,
    workspaceBindingIdentity: `${boundedRelay.workspaceBindingIdentity}/forged`,
  });
  await refusesBoundedRelay("bounded-relay-workspace-digest", {
    ...boundedRelay,
    workspaceBindingDigest: harness.product.sha256Canonical({
      forged: "workspace",
    }),
  });
  const wrongLaneExchange = exactHelperExchange(
    harness.product,
    boundedRelayPrepared,
    boundedRelayPlan,
    "wrong-lane",
    boundedRelayExecution.stdout.trimEnd(),
  );
  wrongLaneExchange.observation.transportLane = "closed_prompt_proof";
  const wrongLaneFailure = await boundedRelayPrepared.complete(
    wrongLaneExchange,
  );
  assert.equal(wrongLaneFailure.disposition, "failure");
  assert.equal(
    wrongLaneFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  const wrongSnapshotArtifact = commandProduct
    .constructWorksiteCommandHelperArtifact({
      task: boundedRelayTask,
      disposition: fullArtifact.disposition,
      commandResults: fullArtifact.commandResults,
      predicateObservations: fullArtifact.predicateObservations,
      worksiteDelta: fullArtifact.worksiteDelta,
      productDelta: fullArtifact.productDelta,
      snapshotRoot: `${fullArtifact.snapshotRoot}/crossed`,
      snapshotRef: fullArtifact.snapshotRef,
      snapshotDigest: fullArtifact.snapshotDigest,
      snapshotMembers: fullArtifact.snapshotMembers,
      protectedBefore: fullArtifact.protectedBefore,
      protectedAfter: fullArtifact.protectedAfter,
    });
  assert.throws(
    () => harness.product.constructWorksiteCommandExecutionObservation(
      boundedRelayTask,
      boundedRelay,
      boundedRelayExchange.observation,
      wrongSnapshotArtifact,
      boundedRelayPlan,
    ),
    /exact helper tool invocation, artifact, commands, and protected O1 preservation/,
  );
  assert.throws(
    () => harness.product.constructWorksiteCommandExecutionObservation(
      boundedRelayTask,
      boundedRelay,
      boundedRelayExchange.observation,
      { ...fullArtifact, artifactRef: `${fullArtifact.artifactRef}/forged` },
      boundedRelayPlan,
    ),
    /exact helper tool invocation, artifact, commands, and protected O1 preservation/,
  );
  assert.throws(
    () => commandProduct.constructWorksiteCommandHelperArtifact({
      task: boundedRelayTask,
      disposition: fullArtifact.disposition,
      commandResults: fullArtifact.commandResults,
      predicateObservations: fullArtifact.predicateObservations,
      worksiteDelta: fullArtifact.worksiteDelta,
      productDelta: fullArtifact.productDelta,
      snapshotRoot: fullArtifact.snapshotRoot,
      snapshotRef: fullArtifact.snapshotRef,
      snapshotDigest: fullArtifact.snapshotDigest,
      snapshotMembers: fullArtifact.snapshotMembers,
      protectedBefore: fullArtifact.protectedBefore,
      protectedAfter: fullArtifact.protectedAfter.map((row, ordinal) =>
        ordinal === 0
          ? { ...row, observationRef: `${row.observationRef}/forged` }
          : row
      ),
    }),
    /exact task-bound commands and protected observations/,
  );
  const boundedTaskBeforeDrift = await readFile(
    boundedRelayPlan.taskManifestPath,
  );
  await writeFile(
    boundedRelayPlan.taskManifestPath,
    Buffer.concat([boundedTaskBeforeDrift, Buffer.from("\n")]),
  );
  const taskDriftFailure = await boundedRelayPrepared.complete(
    boundedRelayExchange,
  );
  assert.equal(taskDriftFailure.disposition, "failure");
  assert.equal(
    taskDriftFailure.resultCandidate.failureClass,
    "helper_manifest_mismatch",
  );

  const basicTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [
      {
        commandId: "command://c2/basic-one",
        executable: nodePath,
        args: ["-e", "process.stdout.write('basic-one\\n')"],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
      {
        commandId: "command://c2/basic-two",
        executable: nodePath,
        args: ["-e", "process.stdout.write('# pass 2\\n')"],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      },
    ],
    outcomePredicates: [
      {
        predicateId: "predicate://c2/basic-one-exit",
        predicateKind: "process_exit",
        declaration: {
          validationCommandId: "command://c2/basic-one",
          equals: 0,
        },
      },
      {
        predicateId: "predicate://c2/basic-one-stdout",
        predicateKind: "stdout_exact",
        declaration: {
          validationCommandId: "command://c2/basic-one",
          equals: "basic-one\n",
        },
      },
      {
        predicateId: "predicate://c2/basic-two-exit",
        predicateKind: "process_exit",
        declaration: {
          validationCommandId: "command://c2/basic-two",
          equals: 0,
        },
      },
      {
        predicateId: "predicate://c2/basic-two-pass-count",
        predicateKind: "test_pass_count",
        declaration: {
          validationCommandId: "command://c2/basic-two",
          greaterThanOrEqual: 2,
        },
      },
    ],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "basic-evidence",
    }],
  });
  const basicSchema = harness.product.worksiteCommandExecutionWorkerResultSchema(
    basicTask,
  );
  const basicCommandProperties = basicSchema.properties.commandResults.items.properties;
  const basicPredicateProperties = basicSchema.properties.predicateObservations.items.properties;
  assert.equal(basicCommandProperties.commandId.type, "string");
  assert.deepEqual(basicCommandProperties.commandId.enum, [
    "command://c2/basic-one",
    "command://c2/basic-two",
  ]);
  assert.equal(basicCommandProperties.executable.type, "string");
  assert.deepEqual(basicCommandProperties.executable.enum, [nodePath]);
  assert.equal(basicPredicateProperties.predicateId.type, "string");
  assert.deepEqual(basicPredicateProperties.predicateId.enum, [
    "predicate://c2/basic-one-exit",
    "predicate://c2/basic-one-stdout",
    "predicate://c2/basic-two-exit",
    "predicate://c2/basic-two-pass-count",
  ]);
  assert.equal(basicPredicateProperties.predicateKind.type, "string");
  assert.deepEqual(basicPredicateProperties.predicateKind.enum, [
    "process_exit",
    "stdout_exact",
    "test_pass_count",
  ]);
  const schemaEnums = (schema) => {
    const enums = [];
    const collectSchemaEnums = (value) => {
      if (Array.isArray(value)) {
        value.forEach(collectSchemaEnums);
        return;
      }
      if (value === null || typeof value !== "object") return;
      if (Array.isArray(value.enum)) enums.push(value.enum);
      Object.values(value).forEach(collectSchemaEnums);
    };
    collectSchemaEnums(schema);
    return enums;
  };
  const assertCanonicalEnums = (schema) => {
    const enums = schemaEnums(schema);
    assert.equal(enums.length > 0, true);
    for (const values of enums) {
      assert.equal(values.length > 0, true);
      assert.deepEqual(values, [...new Set(values)]);
    }
  };
  assertCanonicalEnums(basicSchema);

  const basicOccurrence = directOccurrence("basic-schema", c2.nodeRef);
  const basicPlan = helperPlanForOccurrence(
    harness.product,
    basicTask,
    basicOccurrence,
  );
  const basicPrepared = commandImplementation.realizeWorksiteCommandExecution(
    basicTask,
    basicOccurrence,
  );
  const basicExecution = await executeHelper(basicPlan);
  const basicArtifact = JSON.parse(await readFile(basicPlan.artifactPath, "utf8"));
  assert.equal(basicArtifact.disposition, "success");
  const basicWorkerResult = {
    kind: "worksite_command_execution_worker_result",
    schemaVersion: "5.0.0",
    taskRef: basicTask.taskRef,
    taskDigest: basicTask.taskDigest,
    workspaceBindingIdentity: basicTask.workspaceBinding.bindingId,
    workspaceBindingDigest: basicTask.workspaceBinding.bindingDigest,
    sourceConstructionResultRef: basicTask.sourceConstructionResultRef,
    sourceConstructionResultDigest: basicTask.sourceConstructionResultDigest,
    commandResults: basicArtifact.commandResults,
    predicateObservations: basicArtifact.predicateObservations,
  };
  assert.deepEqual(
    harness.product.constructWorksiteCommandExecutionWorkerResult(
      basicTask,
      basicWorkerResult,
    ),
    basicWorkerResult,
  );
  const refusesBasicRows = (overrides) => assert.throws(
    () => harness.product.constructWorksiteCommandExecutionWorkerResult(
      basicTask,
      { ...basicWorkerResult, ...overrides },
    ),
    /must preserve exact task, source, workspace, command, report, and predicate identity\/order/,
  );
  refusesBasicRows({ commandResults: basicWorkerResult.commandResults.slice(0, 1) });
  refusesBasicRows({
    commandResults: [
      basicWorkerResult.commandResults[1],
      basicWorkerResult.commandResults[0],
    ],
  });
  refusesBasicRows({
    predicateObservations: basicWorkerResult.predicateObservations.slice(0, 3),
  });
  refusesBasicRows({
    predicateObservations: [
      basicWorkerResult.predicateObservations[1],
      basicWorkerResult.predicateObservations[0],
      ...basicWorkerResult.predicateObservations.slice(2),
    ],
  });
  const basicLaunchPath = launchManifestPathForPlan(basicPlan);
  const basicLaunchBeforeDrift = await readFile(basicLaunchPath);
  await writeFile(
    basicLaunchPath,
    Buffer.concat([basicLaunchBeforeDrift, Buffer.from("\n")]),
  );
  const launchDriftFailure = await basicPrepared.complete(exactHelperExchange(
    harness.product,
    basicPrepared,
    basicPlan,
    "post-helper-launch-drift",
    basicExecution.stdout.trimEnd(),
  ));
  assert.equal(launchDriftFailure.disposition, "failure");
  assert.equal(
    launchDriftFailure.resultCandidate.failureClass,
    "helper_manifest_mismatch",
  );

  const zeroPredicateTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/zero-predicate",
      executable: nodePath,
      args: ["-e", "process.stdout.write('zero-predicate\\n')"],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 5_000,
      terminationGraceMs: 1_000,
      expectedReports: [],
    }],
    outcomePredicates: [],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "zero-predicate-evidence",
    }],
  });
  const zeroPredicateSchema = harness.product
    .worksiteCommandExecutionWorkerResultSchema(zeroPredicateTask);
  const zeroPredicateProperties = zeroPredicateSchema.properties
    .predicateObservations.items.properties;
  assert.deepEqual(zeroPredicateProperties.predicateId, { type: "string" });
  assert.deepEqual(zeroPredicateProperties.predicateKind, { type: "string" });
  assert.equal("enum" in zeroPredicateProperties.predicateId, false);
  assert.equal("enum" in zeroPredicateProperties.predicateKind, false);
  assertCanonicalEnums(zeroPredicateSchema);

  const zeroPredicateOccurrence = directOccurrence(
    "zero-predicate-schema",
    c2.nodeRef,
  );
  const zeroPredicatePlan = helperPlanForOccurrence(
    harness.product,
    zeroPredicateTask,
    zeroPredicateOccurrence,
  );
  const zeroPredicatePrepared = commandImplementation.realizeWorksiteCommandExecution(
    zeroPredicateTask,
    zeroPredicateOccurrence,
  );
  const zeroPredicateExecution = await executeHelper(zeroPredicatePlan);
  const zeroPredicateArtifact = JSON.parse(
    await readFile(zeroPredicatePlan.artifactPath, "utf8"),
  );
  assert.equal(zeroPredicateArtifact.disposition, "success");
  assert.deepEqual(zeroPredicateArtifact.predicateObservations, []);
  const zeroPredicateWorkerResult = {
    kind: "worksite_command_execution_worker_result",
    schemaVersion: "5.0.0",
    taskRef: zeroPredicateTask.taskRef,
    taskDigest: zeroPredicateTask.taskDigest,
    workspaceBindingIdentity: zeroPredicateTask.workspaceBinding.bindingId,
    workspaceBindingDigest: zeroPredicateTask.workspaceBinding.bindingDigest,
    sourceConstructionResultRef: zeroPredicateTask.sourceConstructionResultRef,
    sourceConstructionResultDigest: zeroPredicateTask.sourceConstructionResultDigest,
    commandResults: zeroPredicateArtifact.commandResults,
    predicateObservations: zeroPredicateArtifact.predicateObservations,
  };
  assert.deepEqual(
    harness.product.constructWorksiteCommandExecutionWorkerResult(
      zeroPredicateTask,
      zeroPredicateWorkerResult,
    ),
    zeroPredicateWorkerResult,
  );
  assert.throws(
    () => harness.product.constructWorksiteCommandExecutionWorkerResult(
      zeroPredicateTask,
      {
        ...zeroPredicateWorkerResult,
        predicateObservations: [{
          kind: "worksite_predicate_observation",
          schemaVersion: "5.0.0",
          ordinal: 0,
          predicateId: "predicate://c2/undeclared-extra",
          predicateKind: "process_exit",
          observedValue: 0,
          evidence: [],
          evidenceRefs: [],
        }],
      },
    ),
    /must preserve exact task, source, workspace, command, report, and predicate identity\/order/,
  );
  const protectedBeforePostHelperDrift = await readFile(
    join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
  );
  await writeFile(
    join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
    "post-helper-protected-drift\n",
    "utf8",
  );
  try {
    const o1DriftFailure = await zeroPredicatePrepared.complete(
      exactHelperExchange(
        harness.product,
        zeroPredicatePrepared,
        zeroPredicatePlan,
        "post-helper-o1-drift",
        zeroPredicateExecution.stdout.trimEnd(),
      ),
    );
    assert.equal(o1DriftFailure.disposition, "failure");
    assert.equal(
      o1DriftFailure.resultCandidate.failureClass,
      "protected_observation_mismatch",
    );
  } finally {
    await writeFile(
      join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
      protectedBeforePostHelperDrift,
    );
  }

  const reportTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/report-identity",
      executable: nodePath,
      args: ["-e", [
        "const fs=require('node:fs')",
        "fs.mkdirSync('report-evidence',{recursive:true})",
        "fs.writeFileSync('report-evidence/direct.xml','<testsuite><testcase name=\\\"direct\\\"/></testsuite>\\n')",
      ].join(";")],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 5_000,
      terminationGraceMs: 1_000,
      expectedReports: [{
        reportIdentity: "report://c2/direct-junit",
        relativePath: "report-evidence/direct.xml",
      }],
    }],
    outcomePredicates: [],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "report-evidence",
    }],
  });
  const reportOccurrence = directOccurrence("report-identity", c2.nodeRef);
  const reportPlan = helperPlanForOccurrence(
    harness.product,
    reportTask,
    reportOccurrence,
  );
  const reportPrepared = commandImplementation.realizeWorksiteCommandExecution(
    reportTask,
    reportOccurrence,
  );
  const reportExecution = await executeHelper(reportPlan);
  const reportWorkerResult = JSON.parse(reportExecution.stdout);
  assert.equal(reportWorkerResult.commandResults[0].reports.length, 1);
  const crossedReportResult = {
    ...reportWorkerResult,
    commandResults: [{
      ...reportWorkerResult.commandResults[0],
      reports: [{
        ...reportWorkerResult.commandResults[0].reports[0],
        expectedReportIdentity: "report://c2/crossed-junit",
      }],
    }],
  };
  const crossedReportFailure = await reportPrepared.complete(
    exactHelperExchange(
      harness.product,
      reportPrepared,
      reportPlan,
      "crossed-report-identity",
      JSON.stringify(crossedReportResult),
    ),
  );
  assert.equal(crossedReportFailure.disposition, "failure");
  assert.equal(
    crossedReportFailure.resultCandidate.failureClass,
    "result_contract_failure",
  );
  const reportCompletion = await reportPrepared.complete(exactHelperExchange(
    harness.product,
    reportPrepared,
    reportPlan,
    "report-identity",
    reportExecution.stdout.trimEnd(),
  ));
  assert.equal(reportCompletion.disposition, "success");

  const overBudgetTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/over-default-budget",
      executable: nodePath,
      args: ["-e", "process.exit(0)"],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 54_000,
      terminationGraceMs: 1_000,
      expectedReports: [],
    }],
    outcomePredicates: [],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "over-budget-evidence",
    }],
  });
  const overBudgetOccurrence = directOccurrence("over-default-budget", c2.nodeRef);
  const overBudgetPlan = helperPlanForOccurrence(
    harness.product,
    overBudgetTask,
    overBudgetOccurrence,
  );
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      overBudgetTask,
      overBudgetOccurrence,
    ),
    /actor inactivity timeout must exceed/,
  );
  await assert.rejects(() => access(overBudgetPlan.taskManifestPath), /ENOENT/);

  assert.throws(
    () => harness.product.constructWorksiteCommandExecutionTask({
      ...directTaskBasis,
      commands: [{
        commandId: "command://c2/unsafe-path",
        executable: nodePath,
        args: ["-e", "process.exit(0)"],
        relativeCwd: ".",
        environment: { PATH: "relative/bin:/usr/bin" },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      }],
      outcomePredicates: [],
      allowedWriteTerritories: [{
        pathKind: "subtree",
        relativePath: "unsafe-path-evidence",
      }],
    }),
    /PATH requires only non-empty absolute entries/,
  );

  process.env.ABG_TS_FP_TIMEOUT_MS = "20000";
  process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = "15000";
  try {
    assert.throws(
      () => commandImplementation.realizeWorksiteCommandExecution(
        zeroPredicateTask,
        directOccurrence("absolute-budget", c2.nodeRef),
      ),
      /actor absolute timeout must exceed/,
    );
  } finally {
    delete process.env.ABG_TS_FP_TIMEOUT_MS;
    delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  }

  const httpBudgetTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/http-budget",
      executable: nodePath,
      args: ["-e", "process.exit(0)"],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 1_000,
      terminationGraceMs: 100,
      expectedReports: [],
    }],
    outcomePredicates: [{
      predicateId: "predicate://c2/http-budget",
      predicateKind: "http_response_exact",
      declaration: {
        validationCommandId: "command://c2/http-budget",
        status: 200,
        body: "unused",
        launch: {
          executable: nodePath,
          args: ["-e", "setInterval(()=>{},1000)", c2.httpPortFileArgumentPlaceholder],
          relativeCwd: ".",
          environment: { PATH: process.env.PATH },
          timeoutMs: 40_000,
          terminationGraceMs: 1_000,
          portFile: { relativePath: "http-budget-evidence/http.port" },
        },
        request: {
          hostname: "127.0.0.1",
          method: "GET",
          path: "/",
          timeoutMs: 20_000,
        },
      },
    }],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "http-budget-evidence",
    }],
  });
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      httpBudgetTask,
      directOccurrence("http-budget", c2.nodeRef),
    ),
    /actor inactivity timeout must exceed/,
  );

  const occurrenceParity = {
    ...directOccurrence("occurrence-parity", c2.nodeRef),
    cCallRef: " c-call://t287/c2/occurrence-parity ",
    taskOrdinal: null,
    attempt: 2,
  };
  const occurrenceParityPlan = helperPlanForOccurrence(
    harness.product,
    zeroPredicateTask,
    occurrenceParity,
  );
  commandImplementation.realizeWorksiteCommandExecution(
    zeroPredicateTask,
    occurrenceParity,
  );
  await executeHelper(occurrenceParityPlan);
  assert.equal(
    JSON.parse(await readFile(occurrenceParityPlan.artifactPath, "utf8")).disposition,
    "success",
  );

  for (const [label, occurrence] of [
    ["extra-key", { ...directOccurrence("extra-key", c2.nodeRef), extra: true }],
    ["non-null-authority", {
      ...directOccurrence("non-null-authority", c2.nodeRef),
      executionAuthority: { forged: true },
    }],
    ["wrong-locus", directOccurrence("wrong-locus", `${c2.nodeRef}/wrong`)],
    ["blank-c-call", { ...directOccurrence("blank-c-call", c2.nodeRef), cCallRef: "  " }],
    ["blank-run", { ...directOccurrence("blank-run", c2.nodeRef), runId: "\t" }],
    ["blank-graph-call", {
      ...directOccurrence("blank-graph-call", c2.nodeRef),
      graphCallId: "\n",
    }],
    ["blank-frame", { ...directOccurrence("blank-frame", c2.nodeRef), frameId: " " }],
    ["negative-ordinal", {
      ...directOccurrence("negative-ordinal", c2.nodeRef),
      taskOrdinal: -1,
    }],
    ["fractional-ordinal", {
      ...directOccurrence("fractional-ordinal", c2.nodeRef),
      taskOrdinal: 0.5,
    }],
    ["zero-attempt", { ...directOccurrence("zero-attempt", c2.nodeRef), attempt: 0 }],
    ["fractional-attempt", {
      ...directOccurrence("fractional-attempt", c2.nodeRef),
      attempt: 1.5,
    }],
  ]) {
    assert.throws(
      () => commandImplementation.realizeWorksiteCommandExecution(
        zeroPredicateTask,
        occurrence,
      ),
      /exact authority-free C2 occurrence/,
      label,
    );
  }

  const taskBlockedOccurrence = directOccurrence(
    "task-publication-blocked",
    c2.nodeRef,
  );
  const taskBlockedPlan = helperPlanForOccurrence(
    harness.product,
    zeroPredicateTask,
    taskBlockedOccurrence,
  );
  await mkdir(dirname(taskBlockedPlan.taskManifestPath), { recursive: true });
  const taskBlocker = Buffer.from("preexisting-task-blocker\n", "utf8");
  await writeFile(taskBlockedPlan.taskManifestPath, taskBlocker, { flag: "wx" });
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      zeroPredicateTask,
      taskBlockedOccurrence,
    ),
    /EEXIST|file already exists/,
  );
  assert.deepEqual(await readFile(taskBlockedPlan.taskManifestPath), taskBlocker);
  await assert.rejects(
    () => access(launchManifestPathForPlan(taskBlockedPlan)),
    /ENOENT/,
  );
  await assert.rejects(() => access(taskBlockedPlan.artifactPath), /ENOENT/);
  await assert.rejects(() => access(taskBlockedPlan.sandboxRoot), /ENOENT/);
  await assert.rejects(
    () => access(`${taskBlockedPlan.taskManifestPath}.tmp-${process.pid}`),
    /ENOENT/,
  );
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      zeroPredicateTask,
      taskBlockedOccurrence,
    ),
    /EEXIST|file already exists/,
    "an extant task manifest remains fail-closed without repair or retry",
  );

  const launchBlockedOccurrence = directOccurrence(
    "launch-publication-blocked",
    c2.nodeRef,
  );
  const launchBlockedPlan = helperPlanForOccurrence(
    harness.product,
    zeroPredicateTask,
    launchBlockedOccurrence,
  );
  const launchBlockedPath = launchManifestPathForPlan(launchBlockedPlan);
  await mkdir(dirname(launchBlockedPath), { recursive: true });
  const launchBlocker = Buffer.from("preexisting-launch-blocker\n", "utf8");
  await writeFile(launchBlockedPath, launchBlocker, { flag: "wx" });
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      zeroPredicateTask,
      launchBlockedOccurrence,
    ),
    /EEXIST|file already exists/,
  );
  const retainedTaskBytes = await readFile(launchBlockedPlan.taskManifestPath);
  assert.deepEqual(
    retainedTaskBytes,
    taskManifestBytes(harness.product, zeroPredicateTask),
  );
  assert.equal(
    harness.product.sha256Bytes(retainedTaskBytes),
    launchBlockedPlan.taskManifestDigest,
  );
  assert.equal((await lstat(launchBlockedPlan.taskManifestPath)).nlink, 1);
  assert.deepEqual(await readFile(launchBlockedPath), launchBlocker);
  await assert.rejects(() => access(launchBlockedPlan.artifactPath), /ENOENT/);
  await assert.rejects(() => access(launchBlockedPlan.sandboxRoot), /ENOENT/);
  await assert.rejects(
    () => access(`${launchBlockedPath}.tmp-${process.pid}`),
    /ENOENT/,
  );
  assert.throws(
    () => commandImplementation.realizeWorksiteCommandExecution(
      zeroPredicateTask,
      launchBlockedOccurrence,
    ),
    /EEXIST|file already exists/,
    "partial publication remains fail-closed without repair or retry",
  );

  const absentOccurrence = directOccurrence("helper-artifact-absent", c2.nodeRef);
  const absentPlan = helperPlanForOccurrence(harness.product, task, absentOccurrence);
  const absentPrepared = commandImplementation.realizeWorksiteCommandExecution(
    task,
    absentOccurrence,
  );
  const absentLaunchPath = launchManifestPathForPlan(absentPlan);
  for (const [label, argv] of [
    ["no-arguments", []],
    ["missing-value", ["--task"]],
    ["empty-value", ["--task", ""]],
    ["duplicate-task", [
      "--task", absentLaunchPath,
      "--task", absentLaunchPath,
    ]],
    ["legacy-artifact-sandbox", [
      "--task", absentLaunchPath,
      "--artifact", absentPlan.artifactPath,
      "--sandbox", absentPlan.sandboxRoot,
    ]],
    ["unknown-flag", ["--unknown", absentLaunchPath]],
    ["bare-positional", [absentLaunchPath]],
    ["leading-extra", ["extra", "--task", absentLaunchPath]],
    ["trailing-extra", ["--task", absentLaunchPath, "extra"]],
  ]) {
    await assertHelperPreflightRefusal(
      absentPlan,
      argv,
      /helper requires exactly --task <launch-manifest>/,
    );
  }

  const protectedBeforeMissingManifestCases = await readFile(
    join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
  );
  const missingLaunchOccurrence = directOccurrence(
    "missing-launch-manifest",
    c2.nodeRef,
  );
  const missingLaunchPlan = helperPlanForOccurrence(
    harness.product,
    task,
    missingLaunchOccurrence,
  );
  await publishTestTaskManifest(harness.product, task, missingLaunchPlan);
  await assertHelperPreflightRefusal(
    missingLaunchPlan,
    ["--task", launchManifestPathForPlan(missingLaunchPlan)],
    /ENOENT|no such file/,
  );

  const missingTaskOccurrence = directOccurrence(
    "missing-task-manifest",
    c2.nodeRef,
  );
  const missingTaskPlan = helperPlanForOccurrence(
    harness.product,
    task,
    missingTaskOccurrence,
  );
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(missingTaskPlan),
    launchManifestForOccurrence(
      harness.product,
      task,
      missingTaskOccurrence,
      missingTaskPlan,
    ),
  );
  await assertHelperPreflightRefusal(
    missingTaskPlan,
    ["--task", launchManifestPathForPlan(missingTaskPlan)],
    /ENOENT|no such file/,
  );

  const staleTaskOccurrence = directOccurrence(
    "stale-task-manifest",
    c2.nodeRef,
  );
  const staleTaskPlan = helperPlanForOccurrence(
    harness.product,
    task,
    staleTaskOccurrence,
  );
  await mkdir(dirname(staleTaskPlan.taskManifestPath), { recursive: true });
  await writeFile(
    staleTaskPlan.taskManifestPath,
    `${harness.product.canonicalJson({ stale: true })}\n`,
    { flag: "wx" },
  );
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(staleTaskPlan),
    launchManifestForOccurrence(
      harness.product,
      task,
      staleTaskOccurrence,
      staleTaskPlan,
    ),
  );
  await assertHelperPreflightRefusal(
    staleTaskPlan,
    ["--task", launchManifestPathForPlan(staleTaskPlan)],
    /Product task manifest|one exact Product task/,
  );

  const staleLaunchOccurrence = directOccurrence(
    "stale-launch-manifest",
    c2.nodeRef,
  );
  const staleLaunchPlan = helperPlanForOccurrence(
    harness.product,
    task,
    staleLaunchOccurrence,
  );
  const staleLaunch = launchManifestForOccurrence(
    harness.product,
    task,
    staleLaunchOccurrence,
    staleLaunchPlan,
  );
  await publishTestTaskManifest(harness.product, task, staleLaunchPlan);
  await mkdir(dirname(launchManifestPathForPlan(staleLaunchPlan)), {
    recursive: true,
  });
  await writeFile(
    launchManifestPathForPlan(staleLaunchPlan),
    Buffer.concat([
      launchManifestBytes(harness.product, staleLaunch),
      Buffer.from("\n"),
    ]),
    { flag: "wx" },
  );
  await assertHelperPreflightRefusal(
    staleLaunchPlan,
    ["--task", launchManifestPathForPlan(staleLaunchPlan)],
    /bytes or locus are not canonical/,
  );
  assert.deepEqual(
    await readFile(
      join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
    ),
    protectedBeforeMissingManifestCases,
  );

  const manifestAliasPath = `${absentLaunchPath}.hard-link-alias`;
  const protectedBytesBeforeManifestAlias = await readFile(
    join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
  );
  await link(absentLaunchPath, manifestAliasPath);
  try {
    assert.equal((await lstat(absentLaunchPath)).nlink, 2);
    await assertHelperPreflightRefusal(
      absentPlan,
      ["--task", absentLaunchPath],
      /manifests must be distinct single-linked filesystem nodes/,
    );
    assert.deepEqual(
      await readFile(
        join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
      ),
      protectedBytesBeforeManifestAlias,
    );
    const aliasedManifestCompletion = await absentPrepared.complete(
      exactHelperExchange(
        harness.product,
        absentPrepared,
        absentPlan,
        "hard-link-alias",
      ),
    );
    assert.equal(aliasedManifestCompletion.disposition, "failure");
    assert.equal(
      aliasedManifestCompletion.resultCandidate.failureClass,
      "helper_manifest_mismatch",
    );
    await assert.rejects(() => access(absentPlan.artifactPath), /ENOENT/);
    await assert.rejects(() => access(absentPlan.sandboxRoot), /ENOENT/);
  } finally {
    await unlink(manifestAliasPath);
  }
  assert.equal((await lstat(absentLaunchPath)).nlink, 1);

  const taskAliasPath = `${absentPlan.taskManifestPath}.hard-link-alias`;
  await link(absentPlan.taskManifestPath, taskAliasPath);
  try {
    assert.equal((await lstat(absentPlan.taskManifestPath)).nlink, 2);
    await assertHelperPreflightRefusal(
      absentPlan,
      ["--task", absentLaunchPath],
      /manifests must be distinct single-linked filesystem nodes/,
    );
    const taskAliasFailure = await absentPrepared.complete(
      exactHelperExchange(
        harness.product,
        absentPrepared,
        absentPlan,
        "task-hard-link",
      ),
    );
    assert.equal(taskAliasFailure.disposition, "failure");
    assert.equal(
      taskAliasFailure.resultCandidate.failureClass,
      "helper_manifest_mismatch",
    );
  } finally {
    await unlink(taskAliasPath);
  }
  assert.equal((await lstat(absentPlan.taskManifestPath)).nlink, 1);

  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", absentPlan.taskManifestPath],
    /invalid command-execution launch manifest/,
  );

  const sameInodeOccurrence = directOccurrence(
    "same-inode-manifests",
    c2.nodeRef,
  );
  const sameInodePlan = helperPlanForOccurrence(
    harness.product,
    task,
    sameInodeOccurrence,
  );
  const sameInodeLaunch = launchManifestForOccurrence(
    harness.product,
    task,
    sameInodeOccurrence,
    sameInodePlan,
  );
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(sameInodePlan),
    sameInodeLaunch,
  );
  await link(
    launchManifestPathForPlan(sameInodePlan),
    sameInodePlan.taskManifestPath,
  );
  const sameTaskStatus = await lstat(sameInodePlan.taskManifestPath);
  const sameLaunchStatus = await lstat(launchManifestPathForPlan(sameInodePlan));
  assert.equal(
    sameTaskStatus.dev === sameLaunchStatus.dev &&
      sameTaskStatus.ino === sameLaunchStatus.ino,
    true,
  );
  await assertHelperPreflightRefusal(
    sameInodePlan,
    ["--task", launchManifestPathForPlan(sameInodePlan)],
    /manifests must be distinct single-linked filesystem nodes/,
  );

  const swappedOccurrence = directOccurrence("swapped-manifests", c2.nodeRef);
  const swappedPlan = helperPlanForOccurrence(
    harness.product,
    task,
    swappedOccurrence,
  );
  const swappedLaunch = launchManifestForOccurrence(
    harness.product,
    task,
    swappedOccurrence,
    swappedPlan,
  );
  await mkdir(dirname(swappedPlan.taskManifestPath), { recursive: true });
  await writeFile(
    swappedPlan.taskManifestPath,
    launchManifestBytes(harness.product, swappedLaunch),
    { flag: "wx" },
  );
  await writeFile(
    launchManifestPathForPlan(swappedPlan),
    taskManifestBytes(harness.product, task),
    { flag: "wx" },
  );
  await assertHelperPreflightRefusal(
    swappedPlan,
    ["--task", launchManifestPathForPlan(swappedPlan)],
    /invalid command-execution launch manifest/,
  );

  const wrongTaskLocusOccurrence = directOccurrence(
    "copied-task-wrong-locus",
    c2.nodeRef,
  );
  const wrongTaskLocusPlan = helperPlanForOccurrence(
    harness.product,
    task,
    wrongTaskLocusOccurrence,
  );
  const copiedTaskPath = join(
    dirname(wrongTaskLocusPlan.taskManifestPath),
    "copied-task.json",
  );
  await mkdir(dirname(copiedTaskPath), { recursive: true });
  await writeFile(
    copiedTaskPath,
    taskManifestBytes(harness.product, task),
    { flag: "wx" },
  );
  const wrongTaskLocusLaunch = resignLaunchManifest(
    harness.product,
    launchManifestForOccurrence(
      harness.product,
      task,
      wrongTaskLocusOccurrence,
      wrongTaskLocusPlan,
    ),
    { taskManifestPath: copiedTaskPath },
  );
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(wrongTaskLocusPlan),
    wrongTaskLocusLaunch,
  );
  await assertHelperPreflightRefusal(
    wrongTaskLocusPlan,
    ["--task", launchManifestPathForPlan(wrongTaskLocusPlan)],
    /does not name exact distinct siblings/,
  );

  const copiedOccurrence = directOccurrence("copied-envelope", c2.nodeRef);
  const copiedPlan = helperPlanForOccurrence(
    harness.product,
    task,
    copiedOccurrence,
  );
  const absentManifest = launchManifestForOccurrence(
    harness.product,
    task,
    absentOccurrence,
    absentPlan,
  );
  await publishTestTaskManifest(harness.product, task, copiedPlan);
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(copiedPlan),
    absentManifest,
  );
  await assertHelperPreflightRefusal(
    copiedPlan,
    ["--task", launchManifestPathForPlan(copiedPlan)],
    /bytes or locus are not canonical/,
  );

  const crossedManifestCases = [
    ["task-ref", (manifest) => ({ taskRef: `${manifest.taskRef}/crossed` })],
    ["task-digest", () => ({
      taskDigest: harness.product.sha256Canonical({ crossed: "task" }),
    })],
    ["occurrence", (manifest) => ({
      occurrence: { ...manifest.occurrence, runId: `${manifest.occurrence.runId}/crossed` },
    })],
    ["occurrence-digest", () => ({
      occurrenceDigest: harness.product.sha256Canonical({ crossed: "occurrence" }),
    })],
    ["attempt-ref", (manifest) => ({ attemptRef: `${manifest.attemptRef}/crossed` })],
    ["attempt-digest", () => ({
      attemptDigest: harness.product.sha256Canonical({ crossed: "attempt" }),
    })],
    ["helper", (manifest) => ({ helperModulePath: `${manifest.helperModulePath}.crossed` })],
    ["implementation", (manifest) => ({
      implementationRef: `${manifest.implementationRef}/crossed`,
    })],
    ["implementation-binding", (manifest) => ({
      implementationBindingRef: `${manifest.implementationBindingRef}/crossed`,
    })],
    ["package", () => ({ packageVersion: "0.0.0-crossed" })],
    ["archive", (manifest) => ({ archiveRoot: `${manifest.archiveRoot}/crossed` })],
    ["attempt-root", (manifest) => ({ attemptRoot: `${manifest.attemptRoot}/crossed` })],
    ["manifest-path", (manifest) => ({
      launchManifestPath: `${manifest.launchManifestPath}.crossed`,
    })],
    ["task-manifest-path", (manifest) => ({
      taskManifestPath: `${manifest.taskManifestPath}.crossed`,
    })],
    ["task-manifest-digest", () => ({
      taskManifestDigest: harness.product.sha256Canonical({ crossed: "task-manifest" }),
    })],
    ["task-manifest-byte-length", (manifest) => ({
      taskManifestByteLength: manifest.taskManifestByteLength + 1,
    })],
  ];
  for (const [label, mutate] of crossedManifestCases) {
    const occurrence = directOccurrence(`crossed-${label}`, c2.nodeRef);
    const plan = helperPlanForOccurrence(harness.product, task, occurrence);
    const manifest = launchManifestForOccurrence(
      harness.product,
      task,
      occurrence,
      plan,
    );
    const crossed = resignLaunchManifest(
      harness.product,
      manifest,
      mutate(manifest),
    );
    await publishTestTaskManifest(harness.product, task, plan);
    await publishTestLaunchManifest(
      harness.product,
      launchManifestPathForPlan(plan),
      crossed,
    );
    await assertHelperPreflightRefusal(
      plan,
      ["--task", launchManifestPathForPlan(plan)],
      /TypeError: helper /,
    );
  }

  for (const [label, mutateOccurrence] of [
    ["extra-key", (occurrence) => ({ ...occurrence, extra: true })],
    ["non-null-authority", (occurrence) => ({
      ...occurrence,
      executionAuthority: { forged: true },
    })],
    ["wrong-locus", (occurrence) => ({
      ...occurrence,
      programLocusRef: `${c2.nodeRef}/wrong`,
    })],
    ["blank-c-call", (occurrence) => ({ ...occurrence, cCallRef: "  " })],
    ["blank-run", (occurrence) => ({ ...occurrence, runId: "\t" })],
    ["blank-graph-call", (occurrence) => ({
      ...occurrence,
      graphCallId: "\n",
    })],
    ["blank-frame", (occurrence) => ({ ...occurrence, frameId: " " })],
    ["negative-ordinal", (occurrence) => ({ ...occurrence, taskOrdinal: -1 })],
    ["fractional-ordinal", (occurrence) => ({
      ...occurrence,
      taskOrdinal: 0.5,
    })],
    ["zero-attempt", (occurrence) => ({ ...occurrence, attempt: 0 })],
    ["fractional-attempt", (occurrence) => ({ ...occurrence, attempt: 1.5 })],
  ]) {
    const baseOccurrence = directOccurrence(
      `helper-invalid-${label}`,
      c2.nodeRef,
    );
    const invalidOccurrence = mutateOccurrence(baseOccurrence);
    const plan = helperPlanForOccurrence(
      harness.product,
      task,
      invalidOccurrence,
    );
    await publishTestTaskManifest(harness.product, task, plan);
    await publishTestLaunchManifest(
      harness.product,
      launchManifestPathForPlan(plan),
      launchManifestForOccurrence(
        harness.product,
        task,
        invalidOccurrence,
        plan,
      ),
    );
    await assertHelperPreflightRefusal(
      plan,
      ["--task", launchManifestPathForPlan(plan)],
      /invalid command-execution launch manifest/,
    );
  }

  const coherentCrossingOccurrence = directOccurrence(
    "coherent-crossing-retained-locus",
    c2.nodeRef,
  );
  const coherentCrossingPlan = helperPlanForOccurrence(
    harness.product,
    task,
    coherentCrossingOccurrence,
  );
  const coherentCrossingManifest = launchManifestForOccurrence(
    harness.product,
    task,
    coherentCrossingOccurrence,
    coherentCrossingPlan,
  );
  const crossedOccurrence = {
    ...coherentCrossingOccurrence,
    runId: `${coherentCrossingOccurrence.runId}/crossed`,
  };
  const crossedAttemptRef = attemptRefForOccurrence(
    harness.product,
    crossedOccurrence,
  );
  const coherentCrossedManifest = resignLaunchManifest(
    harness.product,
    coherentCrossingManifest,
    {
      occurrence: crossedOccurrence,
      occurrenceDigest: harness.product.sha256Canonical(crossedOccurrence),
      attemptRef: crossedAttemptRef,
      attemptDigest: harness.product.sha256Canonical({
        attemptRef: crossedAttemptRef,
      }),
    },
  );
  await publishTestTaskManifest(harness.product, task, coherentCrossingPlan);
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(coherentCrossingPlan),
    coherentCrossedManifest,
  );
  await assertHelperPreflightRefusal(
    coherentCrossingPlan,
    ["--task", launchManifestPathForPlan(coherentCrossingPlan)],
    /do not form one exact attempt/,
  );

  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", `${dirname(absentPlan.taskManifestPath)}/./launch.json`],
    /absolute and lexical-canonical/,
  );
  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", `${dirname(absentPlan.taskManifestPath)}/nested/../launch.json`],
    /absolute and lexical-canonical/,
  );
  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", `${dirname(absentPlan.taskManifestPath)}//launch.json`],
    /absolute and lexical-canonical/,
  );
  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", relative(process.cwd(), absentLaunchPath)],
    /absolute and lexical-canonical/,
  );
  const escapedLaunchPath = join(canonicalScratch, "escaped-launch.json");
  await publishTestLaunchManifest(
    harness.product,
    escapedLaunchPath,
    absentManifest,
  );
  await assertHelperPreflightRefusal(
    absentPlan,
    ["--task", escapedLaunchPath],
    /bytes or locus are not canonical/,
  );

  const malformedOccurrence = directOccurrence("malformed-envelope", c2.nodeRef);
  const malformedPlan = helperPlanForOccurrence(
    harness.product,
    task,
    malformedOccurrence,
  );
  await publishTestTaskManifest(harness.product, task, malformedPlan);
  await writeFile(launchManifestPathForPlan(malformedPlan), "{\"broken\":\n", {
    flag: "wx",
  });
  await assertHelperPreflightRefusal(
    malformedPlan,
    ["--task", launchManifestPathForPlan(malformedPlan)],
    /worksite command execution launch manifest/,
  );

  const noncanonicalOccurrence = directOccurrence(
    "noncanonical-envelope",
    c2.nodeRef,
  );
  const noncanonicalPlan = helperPlanForOccurrence(
    harness.product,
    task,
    noncanonicalOccurrence,
  );
  const noncanonicalManifest = launchManifestForOccurrence(
    harness.product,
    task,
    noncanonicalOccurrence,
    noncanonicalPlan,
  );
  await publishTestTaskManifest(harness.product, task, noncanonicalPlan);
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(noncanonicalPlan),
    noncanonicalManifest,
    { noncanonical: true },
  );
  await assertHelperPreflightRefusal(
    noncanonicalPlan,
    ["--task", launchManifestPathForPlan(noncanonicalPlan)],
    /bytes or locus are not canonical/,
  );

  const wrongSegmentPath = join(
    task.workspaceBinding.roots.archiveRoot,
    "worksite-command-execution",
    "0".repeat(64),
    absentManifest.attemptDigest.slice("sha256:".length),
    "launch.json",
  );
  await publishTestLaunchManifest(
    harness.product,
    wrongSegmentPath,
    absentManifest,
  );
  await assert.rejects(
    () => executeHelperArguments(absentPlan, ["--task", wrongSegmentPath]),
    /Command failed/,
  );
  await assert.rejects(() => access(join(dirname(wrongSegmentPath), "result.json")), /ENOENT/);
  await assert.rejects(() => access(join(dirname(wrongSegmentPath), "sandbox")), /ENOENT/);

  for (const [label, wrongPath] of [
    ["alternate-filename", join(dirname(absentPlan.taskManifestPath), "alternate.json")],
    ["alternate-depth", join(dirname(absentPlan.taskManifestPath), "extra", "launch.json")],
  ]) {
    await publishTestLaunchManifest(
      harness.product,
      wrongPath,
      absentManifest,
    );
    await assert.rejects(
      () => executeHelperArguments(absentPlan, ["--task", wrongPath]),
      (error) => {
        assert.match(String(error?.stderr ?? error), /bytes or locus are not canonical/);
        return true;
      },
      label,
    );
    await assert.rejects(() => access(join(dirname(wrongPath), "result.json")), /ENOENT/);
    await assert.rejects(() => access(join(dirname(wrongPath), "sandbox")), /ENOENT/);
  }

  const symlinkOccurrence = directOccurrence("symlink-envelope", c2.nodeRef);
  const symlinkPlan = helperPlanForOccurrence(
    harness.product,
    task,
    symlinkOccurrence,
  );
  const symlinkManifest = launchManifestForOccurrence(
    harness.product,
    task,
    symlinkOccurrence,
    symlinkPlan,
  );
  await publishTestTaskManifest(harness.product, task, symlinkPlan);
  const symlinkLaunchPath = launchManifestPathForPlan(symlinkPlan);
  const symlinkTarget = `${symlinkLaunchPath}.target`;
  await publishTestLaunchManifest(
    harness.product,
    symlinkTarget,
    symlinkManifest,
  );
  await symlink(symlinkTarget, symlinkLaunchPath, "file");
  await assertHelperPreflightRefusal(
    symlinkPlan,
    ["--task", symlinkLaunchPath],
    /symlink or aliased component/,
  );

  const symlinkTaskOccurrence = directOccurrence(
    "symlink-task-manifest",
    c2.nodeRef,
  );
  const symlinkTaskPlan = helperPlanForOccurrence(
    harness.product,
    task,
    symlinkTaskOccurrence,
  );
  const symlinkTaskManifest = launchManifestForOccurrence(
    harness.product,
    task,
    symlinkTaskOccurrence,
    symlinkTaskPlan,
  );
  await mkdir(dirname(symlinkTaskPlan.taskManifestPath), { recursive: true });
  const symlinkTaskTarget = `${symlinkTaskPlan.taskManifestPath}.target`;
  await writeFile(
    symlinkTaskTarget,
    taskManifestBytes(harness.product, task),
    { flag: "wx" },
  );
  await symlink(symlinkTaskTarget, symlinkTaskPlan.taskManifestPath, "file");
  await publishTestLaunchManifest(
    harness.product,
    launchManifestPathForPlan(symlinkTaskPlan),
    symlinkTaskManifest,
  );
  await assertHelperPreflightRefusal(
    symlinkTaskPlan,
    ["--task", launchManifestPathForPlan(symlinkTaskPlan)],
    /symlink or aliased component/,
  );

  const protectedBeforeOutputCollision = await readFile(
    join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
  );
  const preexistingResultOccurrence = directOccurrence(
    "preexisting-result",
    c2.nodeRef,
  );
  const preexistingResultPlan = helperPlanForOccurrence(
    harness.product,
    task,
    preexistingResultOccurrence,
  );
  commandImplementation.realizeWorksiteCommandExecution(
    task,
    preexistingResultOccurrence,
  );
  const preexistingResultBytes = Buffer.from("result-sentinel\n", "utf8");
  await writeFile(preexistingResultPlan.artifactPath, preexistingResultBytes, {
    flag: "wx",
  });
  await assert.rejects(
    () => executeHelper(preexistingResultPlan),
    (error) => {
      assert.match(String(error?.stderr ?? error), /result sibling must be absent/);
      return true;
    },
  );
  assert.deepEqual(
    await readFile(preexistingResultPlan.artifactPath),
    preexistingResultBytes,
  );
  await assert.rejects(() => access(preexistingResultPlan.sandboxRoot), /ENOENT/);

  const preexistingSandboxOccurrence = directOccurrence(
    "preexisting-sandbox",
    c2.nodeRef,
  );
  const preexistingSandboxPlan = helperPlanForOccurrence(
    harness.product,
    task,
    preexistingSandboxOccurrence,
  );
  commandImplementation.realizeWorksiteCommandExecution(
    task,
    preexistingSandboxOccurrence,
  );
  const sandboxSentinel = join(preexistingSandboxPlan.sandboxRoot, "sentinel.txt");
  await mkdir(preexistingSandboxPlan.sandboxRoot);
  await writeFile(sandboxSentinel, "sandbox-sentinel\n", "utf8");
  await assert.rejects(
    () => executeHelper(preexistingSandboxPlan),
    (error) => {
      assert.match(String(error?.stderr ?? error), /sandbox sibling must be absent/);
      return true;
    },
  );
  assert.equal(await readFile(sandboxSentinel, "utf8"), "sandbox-sentinel\n");
  await assert.rejects(() => access(preexistingSandboxPlan.artifactPath), /ENOENT/);
  assert.deepEqual(
    await readFile(
      join(task.workspaceBinding.roots.productRoot, SOURCE_RELATIVE_PATH),
    ),
    protectedBeforeOutputCollision,
  );

  const wrongToolExchange = exactHelperExchange(
    harness.product,
    absentPrepared,
    absentPlan,
    "wrong-tool",
  );
  wrongToolExchange.observation.toolInvocations[0].toolName = "Read";
  const wrongToolFailure = await absentPrepared.complete(wrongToolExchange);
  assert.equal(wrongToolFailure.disposition, "failure");
  assert.equal(
    wrongToolFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  for (const [label, toolInput] of [
    ["wrong-command", { command: `${absentPlan.toolCommand} --wrong` }],
    ["extra-timeout", { command: absentPlan.toolCommand, timeout: 1_000 }],
    ["extra-background", { command: absentPlan.toolCommand, background: true }],
    ["extra-sandbox", { command: absentPlan.toolCommand, sandbox: "alternate" }],
    ["extra-unknown", { command: absentPlan.toolCommand, unknownField: "retained" }],
  ]) {
    const mismatchedExchange = replaceToolInputIdentity(
      harness.product,
      exactHelperExchange(
        harness.product,
        absentPrepared,
        absentPlan,
        label,
      ),
      toolInput,
    );
    const mismatch = await absentPrepared.complete(mismatchedExchange);
    assert.equal(mismatch.disposition, "failure");
    assert.equal(
      mismatch.resultCandidate.failureClass,
      "transport_identity_mismatch",
    );
  }
  const noToolExchange = exactHelperExchange(
    harness.product,
    absentPrepared,
    absentPlan,
    "no-tool",
  );
  noToolExchange.observation.toolCallCount = 0;
  noToolExchange.observation.toolInvocations = [];
  const noToolFailure = await absentPrepared.complete(noToolExchange);
  assert.equal(noToolFailure.disposition, "failure");
  assert.equal(
    noToolFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  const secondToolExchange = exactHelperExchange(
    harness.product,
    absentPrepared,
    absentPlan,
    "second-tool",
  );
  secondToolExchange.observation.toolCallCount = 2;
  secondToolExchange.observation.toolInvocations.push({
    ...secondToolExchange.observation.toolInvocations[0],
    ordinal: 1,
    toolUseRef: "tool-use://t287/c2/second-tool/read",
    toolName: "Read",
  });
  const secondToolFailure = await absentPrepared.complete(secondToolExchange);
  assert.equal(secondToolFailure.disposition, "failure");
  assert.equal(
    secondToolFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  const conflictingDuplicateExchange = exactHelperExchange(
    harness.product,
    absentPrepared,
    absentPlan,
    "conflicting-duplicate",
  );
  conflictingDuplicateExchange.observation.toolCallCount = 2;
  const conflictingDuplicateFailure = await absentPrepared.complete(
    conflictingDuplicateExchange,
  );
  assert.equal(conflictingDuplicateFailure.disposition, "failure");
  assert.equal(
    conflictingDuplicateFailure.resultCandidate.failureClass,
    "transport_identity_mismatch",
  );
  const absentFailure = await absentPrepared.complete(exactHelperExchange(
    harness.product,
    absentPrepared,
    absentPlan,
    "helper-artifact-absent",
  ));
  assert.equal(absentFailure.disposition, "failure");
  assert.equal(
    absentFailure.resultCandidate.failureClass,
    "helper_artifact_absent",
  );

  const aliasOccurrence = directOccurrence("archive-root-alias", c2.nodeRef);
  const aliasPlan = helperPlanForOccurrence(harness.product, task, aliasOccurrence);
  const archiveRoot = task.workspaceBinding.roots.archiveRoot;
  const savedArchiveRoot = `${archiveRoot}.c2-proof-saved`;
  const aliasedManifestPath = join(
    task.workspaceBinding.roots.productRoot,
    relative(archiveRoot, aliasPlan.taskManifestPath),
  );
  const aliasedArtifactPath = join(
    task.workspaceBinding.roots.productRoot,
    relative(archiveRoot, aliasPlan.artifactPath),
  );
  await rename(archiveRoot, savedArchiveRoot);
  try {
    await symlink(task.workspaceBinding.roots.productRoot, archiveRoot, "dir");
    assert.throws(
      () => commandImplementation.realizeWorksiteCommandExecution(
        task,
        aliasOccurrence,
      ),
      /symlink|overlaps a protected workspace root/,
    );
    await assert.rejects(() => access(aliasedManifestPath), /ENOENT/);
    await assert.rejects(() => access(aliasedArtifactPath), /ENOENT/);
  } finally {
    await unlink(archiveRoot).catch(() => undefined);
    await rename(savedArchiveRoot, archiveRoot);
  }

  const crossAttemptOccurrence = directOccurrence(
    "archive-cross-attempt-symlink",
    c2.nodeRef,
  );
  const crossAttemptPlan = helperPlanForOccurrence(
    harness.product,
    task,
    crossAttemptOccurrence,
  );
  const crossAttemptRoot = dirname(crossAttemptPlan.taskManifestPath);
  const crossAttemptTarget = join(
    archiveRoot,
    "worksite-command-execution",
    "cross-attempt-proof-target",
  );
  await mkdir(dirname(crossAttemptRoot), { recursive: true });
  await mkdir(crossAttemptTarget, { recursive: true });
  await symlink(crossAttemptTarget, crossAttemptRoot, "dir");
  try {
    assert.throws(
      () => commandImplementation.realizeWorksiteCommandExecution(
        task,
        crossAttemptOccurrence,
      ),
      /non-directory node|escapes its archive root/,
    );
    await assert.rejects(
      () => access(join(crossAttemptTarget, "task.json")),
      /ENOENT/,
    );
    await assert.rejects(
      () => access(join(crossAttemptTarget, "result.json")),
      /ENOENT/,
    );
  } finally {
    await unlink(crossAttemptRoot).catch(() => undefined);
  }

  const protectedOccurrence = directOccurrence("protected-mismatch", c2.nodeRef);
  const protectedPlan = helperPlanForOccurrence(
    harness.product,
    task,
    protectedOccurrence,
  );
  const protectedPrepared = commandImplementation.realizeWorksiteCommandExecution(
    task,
    protectedOccurrence,
  );
  assert.equal(protectedPrepared.workerRequest.prompt.includes(protectedPlan.toolCommand), true);
  const protectedSourcePath = join(
    task.workspaceBinding.roots.productRoot,
    SOURCE_RELATIVE_PATH,
  );
  await writeFile(protectedSourcePath, "stale-before-helper\n", "utf8");
  try {
    await executeHelper(protectedPlan);
  } finally {
    await writeFile(protectedSourcePath, SOURCE_BYTES);
  }
  const protectedArtifact = JSON.parse(
    await readFile(protectedPlan.artifactPath, "utf8"),
  );
  assert.equal(protectedArtifact.disposition, "protected_mismatch");
  assert.deepEqual(protectedArtifact.commandResults, []);
  assert.deepEqual(protectedArtifact.predicateObservations, []);
  const protectedFailure = await protectedPrepared.complete(exactHelperExchange(
    harness.product,
    protectedPrepared,
    protectedPlan,
    "protected-mismatch",
  ));
  assert.equal(protectedFailure.disposition, "failure");
  assert.equal(
    protectedFailure.resultCandidate.failureClass,
    "helper_protected_mismatch",
  );

  const territoryTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/undeclared-residue",
      executable: nodePath,
      args: [
        "-e",
        "require('node:fs').writeFileSync('undeclared.txt','residue')",
      ],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 5_000,
      terminationGraceMs: 1_000,
      expectedReports: [],
    }],
    outcomePredicates: [],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "declared-evidence-only",
    }],
  });
  const territoryOccurrence = directOccurrence("territory-mismatch", c2.nodeRef);
  const territoryPlan = helperPlanForOccurrence(
    harness.product,
    territoryTask,
    territoryOccurrence,
  );
  const territoryPrepared = commandImplementation.realizeWorksiteCommandExecution(
    territoryTask,
    territoryOccurrence,
  );
  await executeHelper(territoryPlan);
  const territoryArtifact = JSON.parse(
    await readFile(territoryPlan.artifactPath, "utf8"),
  );
  assert.equal(territoryArtifact.disposition, "territory_mismatch");
  assert.deepEqual(territoryArtifact.productDelta, []);
  assert.deepEqual(
    territoryArtifact.worksiteDelta.map((row) => ({
      relativePath: row.relativePath,
      matchedTerritoryRef: row.matchedTerritoryRef,
    })),
    [{ relativePath: "undeclared.txt", matchedTerritoryRef: null }],
  );
  const territoryFailure = await territoryPrepared.complete(exactHelperExchange(
    harness.product,
    territoryPrepared,
    territoryPlan,
    "territory-mismatch",
  ));
  assert.equal(territoryFailure.disposition, "failure");
  assert.equal(
    territoryFailure.resultCandidate.failureClass,
    "helper_territory_mismatch",
  );

  const snapshotMutationTask = harness.product
    .constructWorksiteCommandExecutionTask({
      ...directTaskBasis,
      commands: [{
        commandId: "command://c2/snapshot-change-delete",
        executable: nodePath,
        args: ["-e", [
          "const fs=require('node:fs')",
          `fs.writeFileSync(${JSON.stringify(SOURCE_RELATIVE_PATH)},'changed')`,
          `fs.unlinkSync(${JSON.stringify(DECOY_RELATIVE_PATH)})`,
        ].join(";")],
        relativeCwd: ".",
        environment: { PATH: process.env.PATH },
        timeoutMs: 5_000,
        terminationGraceMs: 1_000,
        expectedReports: [],
      }],
      outcomePredicates: [],
      allowedWriteTerritories: [{
        pathKind: "subtree",
        relativePath: "declared-evidence-only",
      }],
    });
  const snapshotMutationOccurrence = directOccurrence(
    "snapshot-change-delete",
    c2.nodeRef,
  );
  const snapshotMutationPlan = helperPlanForOccurrence(
    harness.product,
    snapshotMutationTask,
    snapshotMutationOccurrence,
  );
  const snapshotMutationPrepared = commandImplementation
    .realizeWorksiteCommandExecution(
      snapshotMutationTask,
      snapshotMutationOccurrence,
    );
  const snapshotMutationExecution = await executeHelper(snapshotMutationPlan);
  const snapshotMutationArtifact = JSON.parse(
    await readFile(snapshotMutationPlan.artifactPath, "utf8"),
  );
  assert.equal(snapshotMutationArtifact.disposition, "territory_mismatch");
  assert.deepEqual(
    snapshotMutationArtifact.worksiteDelta.map((row) => ({
      relativePath: row.relativePath,
      changeKind: row.changeKind,
      matchedTerritoryRef: row.matchedTerritoryRef,
    })),
    [
      {
        relativePath: SOURCE_RELATIVE_PATH,
        changeKind: "changed",
        matchedTerritoryRef: null,
      },
      {
        relativePath: DECOY_RELATIVE_PATH,
        changeKind: "deleted",
        matchedTerritoryRef: null,
      },
    ].sort((left, right) => left.relativePath.localeCompare(right.relativePath)),
  );
  const snapshotMutationFailure = await snapshotMutationPrepared.complete(
    exactHelperExchange(
      harness.product,
      snapshotMutationPrepared,
      snapshotMutationPlan,
      "snapshot-change-delete",
      snapshotMutationExecution.stdout.trimEnd(),
    ),
  );
  assert.equal(snapshotMutationFailure.disposition, "failure");
  assert.equal(
    snapshotMutationFailure.resultCandidate.failureClass,
    "helper_territory_mismatch",
  );

  const productDeltaRoot = join(
    task.workspaceBinding.roots.productRoot,
    "c2-product-delta-baseline",
  );
  await mkdir(productDeltaRoot);
  await writeFile(join(productDeltaRoot, "content.txt"), "before\n", "utf8");
  await symlink("content.txt", join(productDeltaRoot, "deleted-link"), "file");
  const encodedProductDeltaRoot = Buffer.from(productDeltaRoot, "utf8")
    .toString("base64");
  const productDeltaTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/original-product-delta",
      executable: nodePath,
      args: ["-e", [
        "const fs=require('node:fs')",
        `const root=Buffer.from(${JSON.stringify(encodedProductDeltaRoot)},'base64').toString('utf8')`,
        "fs.writeFileSync(root+'/content.txt','after\\n')",
        "fs.unlinkSync(root+'/deleted-link')",
        "fs.mkdirSync(root+'/created-directory')",
      ].join(";")],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 5_000,
      terminationGraceMs: 1_000,
      expectedReports: [],
    }],
    outcomePredicates: [],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "declared-evidence-only",
    }],
  });
  const productDeltaOccurrence = directOccurrence(
    "original-product-delta",
    c2.nodeRef,
  );
  const productDeltaPlan = helperPlanForOccurrence(
    harness.product,
    productDeltaTask,
    productDeltaOccurrence,
  );
  const productDeltaPrepared = commandImplementation
    .realizeWorksiteCommandExecution(productDeltaTask, productDeltaOccurrence);
  try {
    const productDeltaExecution = await executeHelper(productDeltaPlan);
    const productDeltaArtifact = JSON.parse(
      await readFile(productDeltaPlan.artifactPath, "utf8"),
    );
    assert.equal(productDeltaArtifact.disposition, "product_mismatch");
    assert.deepEqual(
      productDeltaArtifact.productDelta.map((row) => ({
        relativePath: row.relativePath,
        changeKind: row.changeKind,
        matchedTerritoryRef: row.matchedTerritoryRef,
      })),
      [
        {
          relativePath: "c2-product-delta-baseline/content.txt",
          changeKind: "changed",
          matchedTerritoryRef: null,
        },
        {
          relativePath: "c2-product-delta-baseline/created-directory",
          changeKind: "created",
          matchedTerritoryRef: null,
        },
        {
          relativePath: "c2-product-delta-baseline/deleted-link",
          changeKind: "deleted",
          matchedTerritoryRef: null,
        },
      ].sort((left, right) => left.relativePath.localeCompare(right.relativePath)),
    );
    const productDeltaFailure = await productDeltaPrepared.complete(
      exactHelperExchange(
        harness.product,
        productDeltaPrepared,
        productDeltaPlan,
        "original-product-delta",
        productDeltaExecution.stdout.trimEnd(),
      ),
    );
    assert.equal(productDeltaFailure.disposition, "failure");
    assert.equal(
      productDeltaFailure.resultCandidate.failureClass,
      "helper_product_mismatch",
    );
  } finally {
    await rm(productDeltaRoot, { recursive: true, force: true });
  }

  const lateMarkerRelativePath = "evidence/orphan.txt";
  const descendantScript = [
    "process.on('SIGTERM',()=>{})",
    `setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(lateMarkerRelativePath)},'late'),750)`,
    "setInterval(()=>{},1000)",
  ].join(";");
  const parentScript = [
    "const fs=require('node:fs')",
    "const {spawn}=require('node:child_process')",
    "fs.mkdirSync('evidence',{recursive:true})",
    `const child=spawn(process.execPath,['-e',${JSON.stringify(descendantScript)}],{stdio:'ignore'})`,
    "fs.writeFileSync('evidence/child.pid',String(child.pid))",
    "process.on('SIGTERM',()=>{})",
    "setInterval(()=>{},1000)",
  ].join(";");
  const timeoutTask = harness.product.constructWorksiteCommandExecutionTask({
    ...directTaskBasis,
    commands: [{
      commandId: "command://c2/process-tree-timeout",
      executable: nodePath,
      args: ["-e", parentScript],
      relativeCwd: ".",
      environment: { PATH: process.env.PATH },
      timeoutMs: 200,
      terminationGraceMs: 100,
      expectedReports: [],
    }],
    outcomePredicates: [{
      predicateId: "predicate://c2/process-tree-timeout",
      predicateKind: "process_exit",
      declaration: {
        validationCommandId: "command://c2/process-tree-timeout",
        equals: 124,
      },
    }],
    allowedWriteTerritories: [{
      pathKind: "subtree",
      relativePath: "evidence",
    }],
  });
  const timeoutOccurrence = directOccurrence("process-tree-timeout", c2.nodeRef);
  const timeoutPlan = helperPlanForOccurrence(
    harness.product,
    timeoutTask,
    timeoutOccurrence,
  );
  const timeoutPrepared = commandImplementation.realizeWorksiteCommandExecution(
    timeoutTask,
    timeoutOccurrence,
  );
  const childPidPath = join(timeoutPlan.sandboxRoot, "evidence/child.pid");
  let timeoutChildPid = null;
  try {
    await executeHelper(timeoutPlan);
    timeoutChildPid = Number(await readFile(childPidPath, "utf8"));
    assert.equal(Number.isSafeInteger(timeoutChildPid) && timeoutChildPid > 0, true);
    const timeoutArtifact = JSON.parse(
      await readFile(timeoutPlan.artifactPath, "utf8"),
    );
    assert.equal(timeoutArtifact.disposition, "success");
    assert.equal(timeoutArtifact.commandResults.length, 1);
    const timedCommand = timeoutArtifact.commandResults[0];
    assert.equal(timedCommand.exitStatus, 124);
    assert.equal(timedCommand.timedOut, true);
    assert.equal(timedCommand.processSignal, "SIGKILL");
    assert.deepEqual(timedCommand.signalSequence, ["SIGTERM", "SIGKILL"]);
    assert.equal(timedCommand.terminationConfirmed, true);
    assert.deepEqual(timeoutArtifact.productDelta, []);
    const timeoutWorkerResult = {
      kind: "worksite_command_execution_worker_result",
      schemaVersion: "5.0.0",
      taskRef: timeoutArtifact.taskRef,
      taskDigest: timeoutArtifact.taskDigest,
      workspaceBindingIdentity: timeoutTask.workspaceBinding.bindingId,
      workspaceBindingDigest: timeoutTask.workspaceBinding.bindingDigest,
      sourceConstructionResultRef: timeoutTask.sourceConstructionResultRef,
      sourceConstructionResultDigest: timeoutTask.sourceConstructionResultDigest,
      commandResults: timeoutArtifact.commandResults,
      predicateObservations: timeoutArtifact.predicateObservations,
    };
    const timeoutCompletion = await timeoutPrepared.complete(exactHelperExchange(
      harness.product,
      timeoutPrepared,
      timeoutPlan,
      "process-tree-timeout",
      JSON.stringify(timeoutWorkerResult),
    ));
    assert.equal(timeoutCompletion.disposition, "success");
    assert.equal(timeoutCompletion.resultCandidate.commandResults[0].timedOut, true);
    await new Promise((resolveWait) => setTimeout(resolveWait, 900));
    await assert.rejects(
      () => access(join(timeoutPlan.sandboxRoot, lateMarkerRelativePath)),
      /ENOENT/,
    );
    assert.throws(
      () => process.kill(timeoutChildPid, 0),
      (error) => error?.code === "ESRCH",
    );
  } finally {
    if (timeoutChildPid === null) {
      try {
        timeoutChildPid = Number(await readFile(childPidPath, "utf8"));
      } catch {
        timeoutChildPid = null;
      }
    }
    if (Number.isSafeInteger(timeoutChildPid) && timeoutChildPid > 0) {
      try {
        process.kill(timeoutChildPid, "SIGKILL");
      } catch (error) {
        if (error?.code !== "ESRCH") throw error;
      }
    }
  }

  const fakeInFlightWorker = join(
    canonicalScratch,
    "t287-c2-fake-in-flight-worker.mjs",
  );
  const fakeInFlightValue = {
    kind: "fake_in_flight_helper_result",
    schemaVersion: "5.0.0",
  };
  await writeFile(fakeInFlightWorker, [
    "#!/usr/bin/env node",
    `const toolCommand=${JSON.stringify(absentPlan.toolCommand)};`,
    "const toolUse={type:'tool_use',id:'toolu_c2_in_flight',name:'Bash',input:{command:toolCommand}};",
    "process.stdout.write(`${JSON.stringify({type:'system',subtype:'init',model:'c2-in-flight-proof'})}\\n`);",
    "process.stdout.write(`${JSON.stringify({type:'assistant',message:{content:[toolUse]}})}\\n`);",
    "setTimeout(()=>{",
    `  const result=${JSON.stringify(JSON.stringify(fakeInFlightValue))};`,
    "  process.stdout.write(`${JSON.stringify({type:'result',subtype:'success',result})}\\n`,()=>process.exit(0));",
    "},60_250);",
    "",
  ].join("\n"), "utf8");
  await chmod(fakeInFlightWorker, 0o755);
  const fakeInFlightStartedAt = Date.now();
  const fakeInFlightResult = await abg.runWorkerTransport({
    contract: abg.constructKnownWorkerTransportContract("claude", {
      command: process.execPath,
      prefixArgs: [fakeInFlightWorker],
      environment: {},
    }),
    prompt: "retain one fake helper call beyond the former 60-second boundary",
    lane: "worker_executes",
    cwd: canonicalScratch,
    archiveRoot: join(canonicalScratch, "t287-c2-fake-in-flight-archive"),
    label: "t287-c2-fake-in-flight",
    timeoutMs: 65_000,
    absoluteTimeoutMs: 90_000,
    terminationGraceMs: 1_000,
    environment: {},
  });
  assert.equal(Date.now() - fakeInFlightStartedAt >= 60_000, true);
  assert.equal(fakeInFlightResult.disposition, "success");
  assert.equal(fakeInFlightResult.timedOut, false);
  assert.equal(fakeInFlightResult.timeoutClass, null);
  assert.equal(fakeInFlightResult.toolCallCount, 1);
  assert.equal(fakeInFlightResult.toolInvocations.length, 1);
  assert.equal(fakeInFlightResult.toolInvocations[0].toolName, "Bash");
  assert.deepEqual(JSON.parse(fakeInFlightResult.finalOutput), fakeInFlightValue);
});
