import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { projectAbi5RootOwnerEvidence } from
  "../support/root-owner-evidence.mjs";
import { evaluateAbi5Root } from "../support/root-governor.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("R10 installed abg.cli returns the same typed outcome as two ABG replay folds", async (context) => {
  const harness = await setupInstalledCliHarness(context, root, {
    scratchPath: join(tmpdir(), "abi5-root-r10-proof"),
  });
  const scenario = await buildRootCliScenario(
    harness,
    "r10",
    (payload) => payload,
    { catalogApplications: [] },
  );
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.stderr, "");
  assert.equal(run.transportRequests.length, 7);
  assert.equal(run.transportResults.length, 7);
  assert.equal(run.transportRuns.length, 7);
  assert.deepEqual(
    run.transportRequests,
    run.transportRuns.map((transportRun) => transportRun.transportRequest),
  );
  assert.deepEqual(
    run.transportResults,
    run.transportRuns.map((transportRun) => transportRun.transportResult),
  );
  const transportOutcomeProjection = run.transportRuns.map(
    (transportRun) => transportRun.transportResult.outcome,
  );
  const operationIds = [
    "abg.operation.product.verify",
    "abg.operation.product.resolve",
    "abg.operation.product.install",
    "abg.operation.workspace.bind",
    "abg.operation.catalog.admit",
    "abg.operation.catalog.view",
    "abg.operation.run.invoke",
  ];
  assert.deepEqual(
    transportOutcomeProjection.map((outcome) => outcome.operationId),
    operationIds,
  );
  assert.deepEqual(transportOutcomeProjection.map((outcome) => outcome.disposition), [
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
    "succeeded",
  ]);
  for (const [index, transportRun] of run.transportRuns.entries()) {
    const request = transportRun.transportRequest;
    const result = transportRun.transportResult;
    assert.equal(transportRun.executor, "abg.cli");
    assert.equal(request.kind, "abg_cli_transport_request");
    assert.equal(request.schemaVersion, "5.0.0");
    assert.equal(request.invocation.operationId, operationIds[index]);
    assert.equal(result.kind, "abg_cli_transport_result");
    assert.equal(result.schemaVersion, "5.0.0");
    assert.equal(result.disposition, "completed");
    assert.equal(result.acquisitionKind, request.acquisition.kind);
    assert.equal(result.outcome.operationId, operationIds[index]);
    assert.equal(result.outcome.invocationRef, request.invocation.invocationRef);
    if (index === 0) {
      assert.equal(request.acquisition.kind, "new");
      assert.equal(result.entryPrefix.kind, "durable_prefix_coordinate");
      assert.equal(result.entryPrefix.prefixLength, 0);
      assert.equal(
        result.closeHandoff.reopenAuthority.eventLogPath,
        request.acquisition.eventLogPath,
      );
      assert.equal(
        result.entryPrefix.eventLogRef,
        result.closeHandoff.prefix.eventLogRef,
      );
    } else {
      assert.equal(request.acquisition.kind, "reopen");
      assert.deepEqual(
        request.acquisition.closeHandoff,
        run.transportRuns[index - 1].transportResult.closeHandoff,
      );
      assert.deepEqual(
        result.entryPrefix,
        request.acquisition.closeHandoff.prefix,
      );
    }
  }
  const outcome = run.transportRuns.at(-1).transportResult.outcome;
  assert.equal(outcome.kind, "public_outcome");
  assert.equal(outcome.operationId, "abg.operation.run.invoke");
  assert.equal(
    outcome.invocationRef,
    run.transportRuns.at(-1).transportRequest.invocation.invocationRef,
  );
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

  const rawEventLog = await readFile(scenario.eventLogPath);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `r10-product-owner=${Date.now()}`,
  );
  const installedAbg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `r10-abg-owner=${Date.now()}`,
  );
  const ownerEvidence = projectAbi5RootOwnerEvidence({
    product: installedProduct,
    abg: installedAbg,
    run,
  });
  const governor = evaluateAbi5Root({ ownerEvidence });
  assert.equal(governor.disposition, "root_satisfied", JSON.stringify(governor));
  const proofDirectory = join(root, "test_env/proof");
  await mkdir(proofDirectory, { recursive: true });
  await writeFile(join(proofDirectory, "abi5-root-r10.events.jsonl"), rawEventLog);
  const proofTransportRequests = ownerEvidence.transport.transportRuns.map(
    (transportRun) => transportRun.transportRequest,
  );
  const proofTransportResults = ownerEvidence.transport.transportRuns.map(
    (transportRun) => transportRun.transportResult,
  );
  await writeFile(
    join(proofDirectory, "abi5-root-r10.transcript.json"),
    `${JSON.stringify(proofTransportRequests, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(proofDirectory, "abi5-root-r10.outcomes.json"),
    `${JSON.stringify(proofTransportResults, null, 2)}\n`,
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
      artifactDigest: ownerEvidence.product.verifiedProduct.artifactDigest,
      productInstallId: ownerEvidence.product.admittedInstall.install.installId,
      workspaceBindingId:
        ownerEvidence.product.admittedWorkspace.binding.bindingId,
      catalogId: ownerEvidence.public.catalogOutcome.result.catalogId,
      catalogViewId: ownerEvidence.abg.executionBasis.catalogViewId,
      targetIdentity: {
        catalogHandle:
          ownerEvidence.public.runRequest.payload.catalogHandle,
        programRef: ownerEvidence.abg.executionBasis.programRef,
        selectedDefinitionRef:
          ownerEvidence.product.selectedCatalogEntry.definitionRef,
        selectedDefinitionDigest:
          ownerEvidence.product.selectedCatalogEntry.definitionDigest,
        executionBasisGraphFunctionRef:
          ownerEvidence.abg.executionBasis.graphFunctionRef,
        executionBasisGraphFunctionDigest:
          ownerEvidence.abg.executionBasis.graphFunctionDigest,
      },
      runOutcomes: [outcome].map((value) => ({
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
      replayAgreement: outcome.replayAgreement,
      rootGovernorId: governor.governorId,
      ownerSemanticViewRef: governor.ownerSemanticViewRef,
      ownerSemanticViewDigest: governor.ownerSemanticViewDigest,
      ownerReplayRef: governor.ownerReplayRef,
      rootGovernorDisposition: governor.disposition,
      transportExecutors: ownerEvidence.transport.transportRuns.map(
        (transportRun) => transportRun.executor,
      ),
      transportRequests: proofTransportRequests,
      transportResults: proofTransportResults,
      transportOutcomeProjection:
        ownerEvidence.public.transportOutcomeProjection,
      runSemanticEventCount: ownerEvidence.abg.semanticReplay.eventCount,
      durableEventLogLocator: "test_env/proof/abi5-root-r10.events.jsonl",
      durableEventLogDigest:
        ownerEvidence.transport.finalCloseHandoff.prefix.prefixDigest,
      authorityBoundary: {
        exactStaticTransportInvocations: true,
        rawTransportResultsAreTransportTruth: true,
        transportOutcomeProjectionIsTestOnly: true,
        everyTransportTraversedInstalledCli: true,
        cliConstructedExecutionBasis: false,
        cliWroteRuntimeEvents: false,
        cliSelectedHiddenTarget: false,
        publicOutcomeDerivedFromReplay: true,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
