// Validates: T-223 source-blind packed SDK/CLI sunny vertical
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";
import { generateT223HelloWorldFixture } from "../tools/t223_hello_world_fixture.mjs";

const tenantRoot = path.resolve(import.meta.dirname, "../..");
const consumerFixtureRoot = path.join(
  tenantRoot,
  "test_env/fixtures/t223_packed_consumer"
);

function run(command, args, options) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  );
  assert.equal(result.stderr, "", `${command} wrote stderr`);
  return result.stdout;
}

async function jsonFile(absolutePath) {
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

function productInput(input) {
  return {
    artifactPath: input.artifactPath,
    descriptor: input.descriptor,
    contribution: input.contribution,
    publicContractCatalog: input.publicContractCatalog
  };
}

test("T-223 packed candidate gives isolated source-blind SDK and CLI lanes the same sunny runtime truth", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-packed-consumer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(root, "candidate")
  });
  const fixture = await generateT223HelloWorldFixture({
    root: path.join(root, "fixture"),
    abgVersion: candidate.descriptor.version
  });
  const consumerRoot = path.join(root, "consumer");
  await cp(consumerFixtureRoot, consumerRoot, { recursive: true });
  await chmod(path.join(consumerRoot, "fp-transport"), 0o755);

  run(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      candidate.artifactPath
    ],
    { cwd: consumerRoot }
  );
  const consumerPackage = await jsonFile(path.join(consumerRoot, "package.json"));
  assert.deepEqual(Object.keys(consumerPackage.dependencies ?? {}), [
    "@abiogenesis/typescript-tenant"
  ]);
  assert.equal(
    consumerPackage.dependencies["@abiogenesis/typescript-tenant"].endsWith(
      path.basename(candidate.artifactPath)
    ),
    true
  );

  const installedPackageRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const publicContractCatalogPath = path.join(
    installedPackageRoot,
    "contracts/public-contract-catalog.json"
  );
  const cliPath = path.join(consumerRoot, "node_modules/.bin/abg.cli");
  const consumerSource = await readFile(
    path.join(consumerRoot, "consumer.mjs"),
    "utf8"
  );
  const packageImports = [
    ...consumerSource.matchAll(/from\s+"(@abiogenesis\/[^"]+)"/gu)
  ].map((match) => match[1]);
  assert.deepEqual(packageImports, [
    "@abiogenesis/typescript-tenant/app/m04"
  ]);
  assert.doesNotMatch(consumerSource, /build\/semantic|code\/src|\.\.\//u);

  const fixtureDescriptor = await jsonFile(
    path.join(fixture.root, "sidecars/product-descriptor.json")
  );
  const fixtureContribution = await jsonFile(
    path.join(fixture.root, "sidecars/contribution-manifest.json")
  );
  const fixtureCatalog = await jsonFile(
    path.join(fixture.packageRoot, "contracts/public-contract-catalog.json")
  );
  const baseConfig = {
    publicContractCatalogPath,
    cliPath,
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
  const reports = {};
  for (const lane of ["sdk", "cli"]) {
    const laneRoot = path.join(root, lane);
    await mkdir(laneRoot, { recursive: true });
    const configPath = path.join(laneRoot, "config.json");
    const callLogPath = path.join(laneRoot, "fp-transport-calls.txt");
    await writeFile(
      configPath,
      JSON.stringify({
        ...baseConfig,
        laneRoot,
        workspaceRoot: path.join(laneRoot, "workspace"),
        toolchainRoot: path.join(laneRoot, "toolchain"),
        callLogPath
      }),
      "utf8"
    );
    const output = run(process.execPath, ["consumer.mjs", lane, configPath], {
      cwd: consumerRoot,
      env: {
        ...process.env,
        PATH: `${consumerRoot}${path.delimiter}${path.join(consumerRoot, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`,
        T223_FP_CALL_LOG: callLogPath
      }
    });
    reports[lane] = JSON.parse(output);
  }
  for (const lane of ["sdk", "cli"]) {
    const report = reports[lane];
    const retainedRows = new Map(
      report.catalogRows.map((row) => [row.canonicalHandle, row])
    );
    assert.equal(
      retainedRows.get("graph-function://fixture/hello-world")?.callable,
      true
    );
    assert.deepEqual(
      [
        retainedRows.get("node-type://fixture/hello-input"),
        retainedRows.get("overlay://fixture/default")
      ].map((row) => [row?.kind, row?.sessionVisible, row?.callable]),
      [
        ["node_type", true, false],
        ["overlay", true, false]
      ]
    );
    assert.equal(
      report.helloDescription.canonicalHandle,
      "graph-function://fixture/hello-world"
    );
    assert.equal(report.helloDescription.callable, true);
    assert.equal(
      report.helloDescription.interfaceRef,
      "interface://fixture/hello-world/v1"
    );
    assert.deepEqual(report.projectionCoherence, {
      invokeEqualsReadResult: true,
      replaySubjectMatchesResult: true,
      replayRefsResolveExactly: true,
      evidenceRefsResolve: true,
      evidenceEventKinds: [
        "actor_invocation_closed",
        "actor_result_artifact_observed",
        "terminal_reached"
      ],
      resultRefsResolve: true
    });
    assert.deepEqual(report.workerAndAssurance, {
      workerResponse: {
        edge: "hello-input-to-output",
        actor: "t223-packed-fake-agent",
        message: "Hello, world!",
        fulfillment_assessments: [
          {
            id: "instruction_response_admitted",
            evaluator: "instruction_response_admitted",
            fulfillment_status: "fulfilled",
            fulfillment_detail: "packed fake transport admitted",
            blocking_reasons: [],
            evidence_refs: ["evidence://t223/packed-fake-transport"]
          }
        ]
      },
      helloWorldMessage: "Hello, world!",
      responseContractAdmitted: true,
      actorClosedWithArtifact: true,
      transformEvidenceAdmitted: true,
      targetCarrierClass: "hellooutput",
      targetCarrierProducer: "worker://abiogenesis/installed-public-sdk",
      boundWorkerId: "worker://abiogenesis/installed-public-sdk",
      evaluatorPayloadClasses: [
        "evaluation_rule_outcome",
        "fp_evaluation_finding"
      ],
      evaluatorPayloadsValidated: true,
      assuranceTransition: {
        closureDecision: "block",
        terminalKind: "gap_stop",
        reason: "runtime_continuation_transition:block:assurance_block"
      }
    });
    assert.equal(report.invokeDisposition, "blocked");
    assert.equal(report.invokeExitClassification, "accepted_non_terminal");
    assert.equal(report.resultDisposition, "blocked");
    assert.match(report.resultTerminalReason, /assurance_block/u);
    assert.equal(report.promptManifestCount, 2);
    assert.equal(report.transportCallCount, 2);
    assert.equal(report.registryReadmissionCount, 0);
    assert.equal(report.selectedHandleCount, 1);
    assert.equal(report.replaySubjectKind, "graph_call");
  }
  assert.deepEqual(reports.sdk, reports.cli);
});
