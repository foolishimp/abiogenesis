import assert from "node:assert/strict";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function jsText(rootPath) {
  const values = [];
  const visit = async (path) => {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const absolute = join(path, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      if (entry.isFile() && entry.name.endsWith(".js")) {
        values.push(await readFile(absolute, "utf8"));
      }
    }
  };
  await visit(rootPath);
  return values.join("\n");
}

test("B8 installed public path refuses six rival authority carriers", async (context) => {
  const harness = await setupInstalledCliHarness(context, root);
  const mutations = [
    {
      id: "compiled-plan",
      field: "compiledPlan",
      transform: (payload) => ({
        ...payload,
        compiledPlan: {
          kind: "CompiledCProgramPlan",
          result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
        },
      }),
    },
    {
      id: "hidden-default-target",
      field: "defaultProgramRef",
      transform: ({ programRef: _programRef, ...payload }) => ({
        ...payload,
        defaultProgramRef: "program://abiogenesis/conformance/hello-world@5",
      }),
    },
    {
      id: "renamed-controller",
      field: "controller",
      transform: (payload) => ({
        ...payload,
        controller: {
          kind: "renamed_feature_runner",
          result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
        },
      }),
    },
    {
      id: "private-execution-basis",
      field: "executionBasis",
      transform: (payload) => ({
        ...payload,
        executionBasis: { kind: "execution_basis", disposition: "admitted", basisRef: "forged" },
      }),
    },
    {
      id: "event-bypass",
      field: "events",
      transform: (payload) => ({
        ...payload,
        events: [{ kind: "run_closed", aggregateId: "fixture-authored" }],
      }),
    },
    {
      id: "fixture-result-and-closure",
      field: "result",
      transform: (payload) => ({
        ...payload,
        result: { kind: "hello_world_output", schemaVersion: "5.0.0", message: "Hello World" },
        closed: true,
      }),
    },
  ];
  const results = [];
  let installedRoot = null;
  for (const mutation of mutations) {
    const scenario = await buildRootCliScenario(
      harness,
      `b8-${mutation.id}`,
      mutation.transform,
    );
    installedRoot = scenario.installedRoot;
    const run = await runInstalledCli(harness, scenario);
    assert.equal(run.exitCode, 2, `${mutation.id}: ${run.stdout}`);
    assert.equal(run.stderr, "");
    assert.equal(run.outcomes.length, 6, `${mutation.id}: ${run.stdout}`);
    assert.deepEqual(run.outcomes.slice(0, 5).map((row) => row.disposition), [
      "succeeded",
      "succeeded",
      "succeeded",
      "succeeded",
      "succeeded",
    ]);
    const refusal = run.outcomes.at(-1);
    assert.equal(refusal.operationId, "abg.operation.run.invoke");
    assert.equal(refusal.disposition, "refused");
    assert.equal(refusal.result.code, "invalid_request");
    assert.match(refusal.result.message, new RegExp(mutation.field));
    assert.equal(refusal.runtimeInvocationRef, null);
    assert.equal(refusal.runId, null);
    assert.equal(refusal.cCallRef, null);
    assert.equal(refusal.resultRef, null);
    assert.equal(refusal.replayDigest, null);
    assert.equal(await exists(scenario.eventLogPath), false);
    results.push({
      mutation: mutation.id,
      injectedField: mutation.field,
      exitCode: run.exitCode,
      disposition: refusal.disposition,
      diagnosticRef: refusal.diagnosticRef,
      runtimeInvocationAbsent: refusal.runtimeInvocationRef === null,
      causalRunAbsent: refusal.runId === null,
      durableEventLogAbsent: !(await exists(scenario.eventLogPath)),
    });
  }

  assert.notEqual(installedRoot, null);
  const installedSource = await jsText(join(installedRoot, "build/code/src"));
  for (const prohibited of [
    "CompiledCProgramPlan",
    "CompiledExecutionDeclaration",
    "publicControlLoop",
    "runtime-program-catalog",
  ]) {
    assert.equal(installedSource.includes(prohibited), false, prohibited);
  }

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-rival-authority-mutations.json"),
    `${JSON.stringify({
      kind: "abi5_root_rival_authority_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      result: "all_rivals_refused_before_runtime",
      sourceImportUsed: false,
      mutations: results,
      installedAbsence: {
        compiledPlan: true,
        compiledExecutionDeclaration: true,
        publicControlLoop: true,
        runtimeProgramCatalog: true,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
