import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { evaluateAbi5Root } from "../support/root-governor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R10 installed abg.cli returns the same typed outcome as two ABG replay folds", async (context) => {
  const harness = await setupInstalledCliHarness(context, root, {
    scratchPath: join(tmpdir(), "abi5-root-r10-proof"),
  });
  const scenario = await buildRootCliScenario(harness, "r10");
  const secondRun = structuredClone(scenario.transcript.at(-1));
  secondRun.invocationRef = `${scenario.refs.run}-second`;
  secondRun.correlationId = `${secondRun.correlationId}/second`;
  secondRun.payload.input.subject = "Universe";
  const transcript = [...scenario.transcript, secondRun];
  await writeFile(
    scenario.transcriptPath,
    `${transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.outcomes.length, 7, run.stdout);
  assert.deepEqual(run.outcomes.map((outcome) => outcome.disposition), [
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
  ]);
  const firstOutcome = run.outcomes.at(-2);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.kind, "public_outcome");
  assert.equal(outcome.operationId, "abg.operation.run.invoke");
  assert.equal(firstOutcome.invocationRef, scenario.refs.run);
  assert.equal(outcome.invocationRef, secondRun.invocationRef);
  assert.equal(outcome.runtimeInvocationRef.startsWith("invocation://abiogenesis/"), true);
  assert.equal(outcome.outputContractRef, "contract://abiogenesis/conformance/hello-output@5");
  assert.equal(outcome.admittedResultContractRef, outcome.outputContractRef);
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    message: "Hello Universe",
    schemaVersion: "5.0.0",
  });
  assert.equal(outcome.replayAgreement, true);
  assert.equal(outcome.replayDigest.startsWith("sha256:"), true);
  assert.equal(outcome.runId.startsWith("run://abiogenesis/"), true);
  assert.equal(outcome.graphCallId.startsWith("graph-call://abiogenesis/"), true);
  assert.equal(outcome.frameId.startsWith("frame://abiogenesis/"), true);
  assert.equal(outcome.cCallRef.startsWith("c-call:sha256:"), true);
  assert.equal(firstOutcome.disposition, "succeeded");
  assert.deepEqual(firstOutcome.result, {
    kind: "hello_world_output",
    message: "Hello World",
    schemaVersion: "5.0.0",
  });
  assert.equal(firstOutcome.replayAgreement, true);
  assert.notEqual(firstOutcome.runId, outcome.runId);
  assert.notEqual(firstOutcome.replayDigest, outcome.replayDigest);

  const persistedEvents = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  assert.deepEqual(persistedEvents.slice(-10).map((event) => event.kind), [
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
  assert.equal(persistedEvents.at(-1).causationEventRefs[0], persistedEvents.at(-2).eventId);
  assert.equal(persistedEvents.filter((event) => event.kind === "run_closed").length, 2);
  assert.equal(
    persistedEvents.some((event) =>
      JSON.stringify(event).includes("CompiledCProgramPlan") ||
      JSON.stringify(event).includes("publicControlLoop")),
    false,
  );

  const rawEventLog = await readFile(scenario.eventLogPath);
  const eventLogDigest = `sha256:${createHash("sha256").update(rawEventLog).digest("hex")}`;
  const governor = await evaluateAbi5Root({
    candidateBasis: harness.candidateBasis,
    artifactPath: harness.artifactPath,
    transcript,
    outcomes: run.outcomes,
    eventLogPath: scenario.eventLogPath,
  });
  assert.equal(governor.disposition, "root_satisfied", JSON.stringify(governor));
  const proofDirectory = join(root, "test_env/proof");
  await mkdir(proofDirectory, { recursive: true });
  await writeFile(join(proofDirectory, "abi5-root-r10.events.jsonl"), rawEventLog);
  const proofTranscript = transcript.map((request) => ({
    operationId: request.operationId,
    variant: request.variant,
    invocationRef: request.invocationRef,
    payload: request.operationId === "abg.operation.product.verify"
      ? {
        expectedArtifactDigest: request.payload.expectedArtifactDigest,
        expectedProductContentDigest: request.payload.expectedProductContentDigest,
        expectedManifestDigest: request.payload.expectedManifestDigest,
        expectedProductId: request.payload.expectedProductId,
        expectedPackageName: request.payload.expectedPackageName,
        expectedPackageVersion: request.payload.expectedPackageVersion,
      }
      : request.operationId === "abg.operation.run.invoke"
        ? {
          programRef: request.payload.programRef,
          graphFunctionRef: request.payload.graphFunctionRef,
          input: request.payload.input,
        }
        : {},
  }));
  const proofOutcomes = run.outcomes;
  await writeFile(
    join(proofDirectory, "abi5-root-r10.transcript.json"),
    `${JSON.stringify(proofTranscript, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(proofDirectory, "abi5-root-r10.outcomes.json"),
    `${JSON.stringify(proofOutcomes, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(proofDirectory, "abi5-root-governor.json"),
    `${JSON.stringify(governor, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(proofDirectory, "abi5-root-r10.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R10_replay_and_cli_typed_outcome_agree",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: run.outcomes[0].result.artifactDigest,
      productInstallId: run.outcomes[1].result.installId,
      workspaceBindingId: run.outcomes[2].result.bindingId,
      catalogId: run.outcomes[3].result.catalogId,
      catalogViewId: run.outcomes[4].result.viewId,
      runOutcomes: [firstOutcome, outcome].map((value) => ({
        invocationRef: value.invocationRef,
        disposition: value.disposition,
        result: value.result,
        runId: value.runId,
        graphCallId: value.graphCallId,
        frameId: value.frameId,
        cCallRef: value.cCallRef,
        resultRef: value.resultRef,
        judgmentRef: value.judgmentRef,
        replayRef: value.replayRef,
        replayDigest: value.replayDigest,
        replayAgreement: value.replayAgreement,
      })),
      replayAgreement: firstOutcome.replayAgreement && outcome.replayAgreement,
      replayScopesDistinct: firstOutcome.runId !== outcome.runId,
      rootGovernorId: governor.governorId,
      rootGovernorDigest: governor.governorDigest,
      rootGovernorDisposition: governor.disposition,
      durableEventCount: persistedEvents.length,
      durableEventLogLocator: "test_env/proof/abi5-root-r10.events.jsonl",
      durableEventLogDigest: eventLogDigest,
      eventKinds: persistedEvents.map((event) => event.kind),
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
