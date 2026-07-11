// Validates: T-223 packed-and-installed live Hello World through the public SDK
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { runTracedProcess } from "../../build/semantic/code/src/shared/traced_process/index.js";
import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";
import { generateT223HelloWorldFixture } from "../tools/t223_hello_world_fixture.mjs";

const tenantRoot = path.resolve(import.meta.dirname, "../..");
const consumerFixtureRoot = path.join(
  tenantRoot,
  "test_env/fixtures/t223_packed_consumer"
);
const testRunsRoot = path.join(
  tenantRoot,
  "test_env/test_runs/t223_packed_hello_world_live"
);
const graphHandle = "graph-function://fixture/hello-world";
const livePluginBySeam = Object.freeze({
  dispatch: "plugin://abg/fp-dispatch-live",
  evaluation: "plugin://abg/fp-evaluator-live"
});

function liveEnabled() {
  return (
    process.env["ABG_TS_T223_PACKED_HELLO_WORLD_LIVE"] === "1" ||
    process.env["CODEX_LIVE_FP"] === "1"
  );
}

function timestampId() {
  return `${new Date().toISOString().replace(/[-:.]/gu, "")}_pid${String(process.pid)}`;
}

function liveSteering() {
  const agent = process.env["ABG_TS_LIVE_AGENT"] ?? "claude";
  assert.ok(
    agent === "claude" || agent === "codex",
    "T-223 live proof admits only the installed claude or codex standard transport"
  );
  const profile = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] ?? "local-spawn";
  assert.ok(
    profile === "local-spawn" || profile === "pty-terminal",
    "ABG_TS_AGENT_EXECUTOR_PROFILE must be local-spawn or pty-terminal"
  );
  const timeoutText = process.env["ABG_TS_LIVE_TIMEOUT_MS"] ?? "180000";
  assert.match(timeoutText, /^[1-9][0-9]*$/u);
  const timeoutMs = Number(timeoutText);
  assert.equal(Number.isSafeInteger(timeoutMs), true);
  return Object.freeze({ agent, model: null, profile, timeoutMs });
}

async function run(command, args, options) {
  const result = await runTracedProcess({
    command,
    args,
    cwd: options.cwd,
    env: options.env ?? process.env,
    archiveRoot: path.join(options.runRoot, "processes", options.label),
    label: options.label,
    timeoutMs: options.timeoutMs,
    executorProfile: "local-spawn"
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.equal(result.stderr, "", `${command} wrote stderr`);
  return result.stdout;
}

async function installPackedTenantPackage(input) {
  await run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      input.artifactPath
    ],
    {
      cwd: input.consumerRoot,
      runRoot: input.runRoot,
      label: "install-packed-abg-candidate",
      timeoutMs: 60000
    }
  );
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function productInput(input) {
  return {
    artifactPath: input.artifactPath,
    descriptor: input.descriptor,
    contribution: input.contribution,
    publicContractCatalog: input.publicContractCatalog
  };
}

function jsonLines(text) {
  return text
    .split(/\r?\n/gu)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

async function assertRegularFiles(root, relativePaths) {
  for (const relativePath of relativePaths) {
    assert.equal(
      (await stat(path.join(root, relativePath))).isFile(),
      true,
      `${relativePath} is not a regular evidence file`
    );
  }
}

async function inspectLiveBundles(archiveRoot, steering) {
  const callsRoot = path.join(archiveRoot, "by-c-call");
  const entries = await readdir(callsRoot, { withFileTypes: true });
  assert.equal(entries.length, 2, "live Hello World must archive two F_P effects");
  assert.equal(entries.every((entry) => entry.isDirectory()), true);
  const rows = [];
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    assert.match(entry.name, /^[0-9a-f]{64}$/u);
    const bundleRoot = path.join(callsRoot, entry.name);
    const requiredFiles = [
      "request.json",
      "instruction-manifest.json",
      "launch.json",
      "prompt.txt",
      "output.txt",
      "stdout.log",
      "stderr.log",
      "transport.json",
      "trace/result.json",
      "completion.json"
    ];
    await assertRegularFiles(bundleRoot, requiredFiles);
    const request = await readJson(path.join(bundleRoot, "request.json"));
    const completion = await readJson(path.join(bundleRoot, "completion.json"));
    const transport = await readJson(path.join(bundleRoot, "transport.json"));
    const trace = await readJson(path.join(bundleRoot, "trace/result.json"));
    assert.ok(request.seam === "dispatch" || request.seam === "evaluation");
    assert.equal(request.pluginRef, livePluginBySeam[request.seam]);
    assert.equal(completion.seam, request.seam);
    assert.equal(completion.pluginRef, request.pluginRef);
    assert.equal(completion.cCallRef, request.cCallRef);
    assert.equal(completion.requestDigest, request.requestDigest);
    assert.equal(
      completion.outcome.status,
      request.seam === "dispatch" ? "dispatched" : "evaluated"
    );
    if (request.seam === "evaluation") {
      assert.equal(completion.outcome.ambiguityStatus, "fulfilled");
    }
    assert.equal(
      completion.outcome.evidenceRefs.some((ref) => ref.startsWith("agent-output:")),
      true
    );
    assert.equal(
      completion.outcome.evidenceRefs.some((ref) => ref.startsWith("agent-trace:")),
      true
    );
    assert.equal(transport.agentKey, steering.agent);
    assert.equal(transport.executorProfile, steering.profile);
    assert.equal(transport.status, 0);
    assert.equal(transport.failureClass, null);
    assert.equal(transport.toolCallCount, 0);
    assert.equal(trace.status, 0);
    assert.equal(
      path.resolve(transport.traceResultPath),
      path.resolve(bundleRoot, "trace/result.json")
    );
    rows.push(Object.freeze({
      seam: request.seam,
      pluginRef: request.pluginRef,
      bundleRoot
    }));
  }
  assert.deepEqual(rows.map((row) => row.seam).sort(), ["dispatch", "evaluation"]);
  return Object.freeze(rows);
}

test("T-223 packed installed public SDK runs one live Hello World and preserves exact evidence", async (t) => {
  if (!liveEnabled()) {
    t.skip(
      "set ABG_TS_T223_PACKED_HELLO_WORLD_LIVE=1 or CODEX_LIVE_FP=1 to run the packed live proof"
    );
    return;
  }

  const steering = liveSteering();
  const runRoot = path.join(testRunsRoot, timestampId());
  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(runRoot, "candidate")
  });
  const fixture = await generateT223HelloWorldFixture({
    root: path.join(runRoot, "fixture"),
    abgVersion: candidate.descriptor.version
  });
  const consumerRoot = path.join(runRoot, "consumer");
  const laneRoot = path.join(runRoot, "sdk");
  const workspaceRoot = path.join(laneRoot, "workspace");
  const evidenceRoot = path.join(runRoot, "evidence");
  await cp(consumerFixtureRoot, consumerRoot, { recursive: true });
  await mkdir(laneRoot, { recursive: true });

  await installPackedTenantPackage({
    artifactPath: candidate.artifactPath,
    consumerRoot,
    runRoot
  });
  const installedPackageRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const fixtureDescriptor = await readJson(
    path.join(fixture.root, "sidecars/product-descriptor.json")
  );
  const fixtureContribution = await readJson(
    path.join(fixture.root, "sidecars/contribution-manifest.json")
  );
  const fixtureCatalog = await readJson(
    path.join(fixture.packageRoot, "contracts/public-contract-catalog.json")
  );
  const config = {
    publicContractCatalogPath: path.join(
      installedPackageRoot,
      "contracts/public-contract-catalog.json"
    ),
    cliPath: path.join(consumerRoot, "node_modules/.bin/abg.cli"),
    laneRoot,
    workspaceRoot,
    toolchainRoot: path.join(laneRoot, "toolchain"),
    callLogPath: null,
    evidenceRoot,
    transportSteering: steering,
    abg: productInput({
      artifactPath: candidate.artifactPath,
      descriptor: candidate.descriptor,
      contribution: candidate.contribution,
      publicContractCatalog: candidate.publication.publication.catalog
    }),
    fixture: productInput({
      artifactPath: fixture.artifactPath,
      descriptor: fixtureDescriptor,
      contribution: fixtureContribution,
      publicContractCatalog: fixtureCatalog
    })
  };
  const configPath = path.join(laneRoot, "config.json");
  await writeJson(configPath, config);
  const stdout = await run(process.execPath, ["consumer.mjs", "sdk", configPath], {
    cwd: consumerRoot,
    runRoot,
    label: "run-packed-sdk-consumer",
    timeoutMs: steering.timeoutMs * 2 + 60000,
    env: {
      ...process.env,
      PATH: `${path.join(consumerRoot, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`
    }
  });
  const summary = JSON.parse(stdout);
  assert.equal(summary.invokeDisposition, "blocked");
  assert.equal(summary.invokeExitClassification, "accepted_non_terminal");
  assert.equal(summary.resultDisposition, "blocked");
  assert.match(summary.resultTerminalReason, /assurance_block/u);
  assert.equal(summary.promptManifestCount, 2);
  assert.equal(summary.registryReadmissionCount, 0);
  assert.equal(summary.selectedHandleCount, 1);
  assert.equal(summary.replaySubjectKind, "graph_call");
  assert.equal(summary.transportCallCount, null);
  assert.equal(summary.workerAndAssurance.responseContractAdmitted, true);
  assert.equal(summary.workerAndAssurance.actorClosedWithArtifact, true);
  assert.equal(summary.workerAndAssurance.transformEvidenceAdmitted, true);
  assert.equal(summary.workerAndAssurance.evaluatorPayloadsValidated, true);
  assert.equal(
    typeof summary.workerAndAssurance.helloWorldMessage,
    "string"
  );
  assert.notEqual(summary.workerAndAssurance.helloWorldMessage.length, 0);
  assert.match(summary.workerAndAssurance.helloWorldMessage, /world/iu);

  const invoke = await readJson(
    path.join(evidenceRoot, "catalog-invoke-response.json")
  );
  const result = await readJson(path.join(evidenceRoot, "read-result-response.json"));
  const replay = await readJson(path.join(evidenceRoot, "read-replay-response.json"));
  const workspaceReplay = await readJson(
    path.join(evidenceRoot, "workspace-replay-response.json")
  );
  assert.equal(invoke.kind, "accepted");
  assert.equal(invoke.disposition, "blocked");
  assert.equal(invoke.exitClassification, "accepted_non_terminal");
  assert.deepEqual(result.value, invoke.value);
  assert.equal(replay.value.subject.kind, "graph_call");
  assert.equal(replay.value.subject.graphCallId, invoke.value.graphCallId);
  assert.equal(replay.value.events.at(-1)?.kind, "terminal_reached");
  assert.match(replay.value.events.at(-1)?.reason ?? "", /assurance_block/u);

  const eventLogPath = path.join(
    workspaceRoot,
    ".ai-workspace/events/events.jsonl"
  );
  const rawEvents = jsonLines(await readFile(eventLogPath, "utf8"));
  assert.deepEqual(
    rawEvents.map((event) => event.eventId),
    workspaceReplay.value.events.map((event) => event.eventId)
  );
  const ordinals = rawEvents.map((event) => event.eventAdmissionOrdinal);
  assert.deepEqual(ordinals, [...ordinals].sort((left, right) => left - right));
  assert.equal(new Set(ordinals).size, ordinals.length);
  const invokeAttribution = rawEvents.findLast(
    (event) =>
      event.kind === "public_operation_admitted" &&
      event.operationId === "abg.operation.catalog.invoke"
  );
  assert.notEqual(invokeAttribution, undefined);
  assert.equal(invokeAttribution.capabilityProvenanceRefs.length, 3);
  assert.match(invokeAttribution.capabilityProvenanceRefs[0], /^capability:live:sha256:/u);
  assert.match(invokeAttribution.capabilityProvenanceRefs[1], /^sha256:/u);
  assert.match(invokeAttribution.capabilityProvenanceRefs[2], /^sha256:/u);
  const selectedIndex = replay.value.events.findIndex(
    (event) => event.kind === "graph_function_selected"
  );
  const graphCallIndex = replay.value.events.findIndex(
    (event) => event.kind === "graph_call_opened"
  );
  assert.equal(selectedIndex >= 0 && selectedIndex < graphCallIndex, true);
  assert.equal(replay.value.events[selectedIndex].selectedEntryRef, graphHandle);

  const binding = await readJson(
    path.join(workspaceRoot, ".abiogenesis/toolchain-binding.json")
  );
  assert.deepEqual(
    binding.products.map((product) => [
      product.productId,
      product.version,
      product.artifactDigest
    ]),
    [
      [
        candidate.descriptor.productId,
        candidate.descriptor.version,
        candidate.descriptor.distributionArtifactDigest
      ],
      [
        fixtureDescriptor.productId,
        fixtureDescriptor.version,
        fixtureDescriptor.distributionArtifactDigest
      ]
    ]
  );
  const bundles = await inspectLiveBundles(binding.mutableStateRoots.archiveRoot, steering);
  const relative = (absolutePath) => path.relative(runRoot, absolutePath);
  await writeJson(path.join(runRoot, "proof.json"), {
    kind: "t223_packed_hello_world_live_proof",
    schemaVersion: 1,
    status: "accepted_non_terminal",
    candidate: {
      productId: candidate.descriptor.productId,
      version: candidate.descriptor.version,
      artifactDigest: candidate.descriptor.distributionArtifactDigest,
      artifactPath: relative(candidate.artifactPath)
    },
    fixture: {
      productId: fixtureDescriptor.productId,
      version: fixtureDescriptor.version,
      artifactDigest: fixtureDescriptor.distributionArtifactDigest,
      artifactPath: relative(fixture.artifactPath)
    },
    transportSteering: steering,
    graphCallId: invoke.value.graphCallId,
    terminalReason: invoke.value.result.terminalReason,
    evidence: {
      catalogInvokeResponse: "evidence/catalog-invoke-response.json",
      result: "evidence/read-result-response.json",
      replay: "evidence/read-replay-response.json",
      workspaceReplay: "evidence/workspace-replay-response.json",
      eventLog: relative(eventLogPath),
      liveBundles: bundles.map((bundle) => ({
        seam: bundle.seam,
        pluginRef: bundle.pluginRef,
        root: relative(bundle.bundleRoot)
      }))
    }
  });
});
