import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t286/r10",
    payload,
  };
}

test("R10 installed abg.cli returns the same typed outcome as two ABG replay folds", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-r10-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const artifacts = join(scratch, "artifacts");
  await mkdir(artifacts);
  const { stdout: packStdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: root, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(packStdout);
  const artifactPath = join(artifacts, packResult.filename);
  const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

  const cliHost = join(scratch, "cli-host");
  await mkdir(cliHost);
  await writeFile(join(cliHost, "package.json"), `${JSON.stringify({
    name: "abiogenesis-r10-cli-host",
    version: "0.0.0",
    private: true,
    type: "module",
  })}\n`, "utf8");
  await execFileAsync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--offline",
      artifactPath,
    ],
    { cwd: cliHost, maxBuffer: 10 * 1024 * 1024 },
  );

  const productConsumer = join(scratch, "product-consumer");
  const workspaceRoot = join(scratch, "workspace");
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(eventLogRoot, "abi5-root-001.json");
  await mkdir(workspaceRoot);
  const refs = {
    verify: "invocation://t286/r10/product-verify",
    install: "invocation://t286/r10/product-install",
    bind: "invocation://t286/r10/workspace-bind",
    catalog: "invocation://t286/r10/catalog-admit",
    view: "invocation://t286/r10/catalog-view",
    run: "invocation://t286/r10/run-invoke",
  };
  const installedRoot = join(
    productConsumer,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const transcript = [
    invocation("abg.operation.product.verify", "artifact", refs.verify, {
      artifactPath,
      artifactRef: basename(artifactPath),
      expectedProductId: `product://abiogenesis/typescript-tenant@${packageJson.version}`,
      expectedPackageName: packageJson.name,
      expectedPackageVersion: packageJson.version,
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.install, {
      verifiedInvocationRef: refs.verify,
      artifactPath,
      targetRoot: productConsumer,
    }),
    invocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRef: refs.install,
      workspaceId: "workspace://t286/abi5-root-r10",
      canonicalRoot: workspaceRoot,
      authorityManifestRef: "manifest://t286/r10/workspace-authority",
      roots: {
        toolchainRoot: productConsumer,
        productRoot: installedRoot,
        eventLogRoot,
        runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
        projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
        archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
      },
    }),
    invocation("abg.operation.catalog.admit", "module_publication", refs.catalog, {
      verifiedInvocationRef: refs.verify,
      workspaceBindingInvocationRef: refs.bind,
    }),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: ["graph-function://abiogenesis/conformance/hello-world@5"],
    }),
    invocation("abg.operation.run.invoke", "direct", refs.run, {
      installInvocationRef: refs.install,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
      programRef: "program://abiogenesis/conformance/hello-world@5",
      graphFunctionRef: "graph-function://abiogenesis/conformance/hello-world@5",
      actorRef: "actor://abiogenesis/t286/trusted-developer",
      input: {
        kind: "hello_world_input",
        schemaVersion: "5.0.0",
        subject: "World",
      },
      eventLogPath,
    }),
  ];
  const transcriptPath = join(scratch, "root-transcript.jsonl");
  await writeFile(
    transcriptPath,
    `${transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );

  const cliPath = join(cliHost, "node_modules/.bin/abg.cli");
  const { stdout, stderr } = await execFileAsync(
    cliPath,
    ["--jsonl", transcriptPath],
    {
      cwd: cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  assert.equal(stderr, "");
  const outcomes = stdout.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  assert.equal(outcomes.length, 6, stdout);
  assert.deepEqual(outcomes.map((outcome) => outcome.disposition), [
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
  ]);
  const outcome = outcomes.at(-1);
  assert.equal(outcome.kind, "public_outcome");
  assert.equal(outcome.operationId, "abg.operation.run.invoke");
  assert.equal(outcome.invocationRef, refs.run);
  assert.equal(outcome.runtimeInvocationRef.startsWith("invocation://abiogenesis/"), true);
  assert.equal(outcome.outputContractRef, "contract://abiogenesis/conformance/hello-output@5");
  assert.equal(outcome.admittedResultContractRef, outcome.outputContractRef);
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    message: "Hello World",
    schemaVersion: "5.0.0",
  });
  assert.equal(outcome.replayAgreement, true);
  assert.equal(outcome.replayDigest.startsWith("sha256:"), true);
  assert.equal(outcome.runId.startsWith("run://abiogenesis/"), true);
  assert.equal(outcome.graphCallId.startsWith("graph-call://abiogenesis/"), true);
  assert.equal(outcome.frameId.startsWith("frame://abiogenesis/"), true);
  assert.equal(outcome.cCallRef.startsWith("c-call:sha256:"), true);

  const persisted = JSON.parse(await readFile(eventLogPath, "utf8"));
  assert.equal(persisted.kind, "abg_event_log");
  assert.deepEqual(persisted.events.slice(-10).map((event) => event.kind), [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
    "fd_advance_ready",
    "terminal_reached",
    "frame_closed",
    "graph_call_closed",
    "run_closed",
  ]);
  assert.equal(persisted.events.at(-1).causationEventRefs[0], persisted.events.at(-2).eventId);
  assert.equal(
    persisted.events.some((event) =>
      JSON.stringify(event).includes("CompiledCProgramPlan") ||
      JSON.stringify(event).includes("publicControlLoop")),
    false,
  );

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r10.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R10_replay_and_cli_typed_outcome_agree",
      result: "satisfied",
      sourceImportUsed: false,
      cliPath,
      artifactDigest: outcomes[0].result.artifactDigest,
      productInstallId: outcomes[1].result.installId,
      workspaceBindingId: outcomes[2].result.bindingId,
      catalogId: outcomes[3].result.catalogId,
      catalogViewId: outcomes[4].result.viewId,
      publicOutcome: outcome,
      replayAgreement: outcome.replayAgreement,
      durableEventCount: persisted.events.length,
      eventKinds: persisted.events.map((event) => event.kind),
      authorityBoundary: {
        callerAuthoredOperationOrder: true,
        cliConstructedExecutionBasis: false,
        cliWroteRuntimeEvents: false,
        cliSelectedHiddenTarget: false,
        publicOutcomeDerivedFromReplay: true,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
