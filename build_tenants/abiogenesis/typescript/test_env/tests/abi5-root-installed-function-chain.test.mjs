import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { proveFreshProcessRuntimeProjectionEquality } from
  "../support/fresh-process-runtime-proof.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const operationOrder = [
  "abg.operation.product.verify",
  "abg.operation.product.resolve",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.view",
  "abg.operation.run.invoke",
];

test("ABI5-ROOT-001 composes seven installed Public owners into ABG replay", async (context) => {
  const harness = await setupInstalledCliHarness(context, root, {
    candidateBasisSource: "packed_artifact",
  });
  const gtl = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/gtl",
    `abi5-root-chain-gtl=${Date.now()}`,
  );
  const canonicalHandle = gtl.HELLO_WORLD_IDS.graphFunctionRef;
  const rootGraphFunction = harness.rootPublication.graphFunctions.find(
    (graphFunction) => graphFunction.name === canonicalHandle,
  );
  assert.ok(rootGraphFunction);
  const expectedRootCoordinate = gtl.rootCTraversalCoordinate(
    rootGraphFunction.template.startNodeRef,
  );
  const expectedRootTerm = gtl.resolveCProgramTermAtSourcePath(
    rootGraphFunction.template,
    expectedRootCoordinate.nodeRef,
    expectedRootCoordinate.termPath,
  );
  assert.notEqual(
    expectedRootTerm.kind,
    "c_source_path_refusal",
    JSON.stringify(expectedRootTerm),
  );
  const callableContribution = harness.rootPublication.contributions.find(
    (row) => row.handle === canonicalHandle,
  );
  const callableProgram = harness.rootPublication.programs.find(
    (row) => row.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.ok(callableContribution);
  assert.ok(callableProgram);
  assert.equal(
    callableContribution.declarationOrContractRef,
    gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.equal(
    callableContribution.handle,
    callableContribution.declarationOrContractRef,
  );
  assert.equal(callableProgram.publicAssetTargets, undefined);
  assert.equal(callableProgram.starts.length, 1);
  const scenario = await buildRootCliScenario(
    harness,
    "abi5-root-installed-function-chain",
    (payload) => payload,
    {
      allowlist: [canonicalHandle],
      catalogApplications: [],
      catalogHandle: canonicalHandle,
      programRef: gtl.HELLO_WORLD_IDS.programRef,
    },
  );
  const run = await runInstalledCli(harness, scenario);

  assert.equal(run.transportRuns.length, operationOrder.length);
  assert.equal(run.transportRequests.length, operationOrder.length);
  assert.equal(run.transportResults.length, operationOrder.length);
  assert.ok(run.transportRuns.every((value) => value.executor === "abg.cli"));

  for (const [index, request] of run.transportRequests.entries()) {
    const result = run.transportResults[index];
    assert.equal(request.kind, "abg_cli_transport_request");
    assert.equal(result.kind, "abg_cli_transport_result");
    assert.equal(request.invocation.operationId, operationOrder[index]);
    assert.equal(result.outcome.operationId, request.invocation.operationId);
    assert.equal(result.outcome.invocationRef, request.invocation.invocationRef);
    assert.equal(
      result.outcome.disposition,
      "succeeded",
      JSON.stringify(result.outcome),
    );
    assert.equal(result.acquisitionKind, request.acquisition.kind);
    if (index === 0) {
      assert.equal(request.acquisition.kind, "new");
      assert.equal(result.entryPrefix.prefixLength, 0);
    } else {
      assert.equal(request.acquisition.kind, "reopen");
      assert.deepEqual(
        request.acquisition.closeHandoff,
        run.transportResults[index - 1].closeHandoff,
      );
      assert.deepEqual(
        result.entryPrefix,
        run.transportResults[index - 1].closeHandoff.prefix,
      );
    }
  }

  const catalog = run.transportResults[4].outcome.result;
  const viewRequest = run.transportRequests[5].invocation;
  assert.equal(catalog.kind, "graph_function_catalog");
  assert.equal(catalog.readinessBasis.kind, undefined);
  assert.equal(typeof catalog.byHandle, "object");
  assert.deepEqual(viewRequest.payload.catalog, catalog);
  assert.deepEqual(viewRequest.payload.allowlist, [
    canonicalHandle,
  ]);

  const catalogView = run.transportResults[5].outcome.result;
  const runRequest = run.transportRequests[6].invocation;
  assert.equal(catalogView.kind, "graph_function_catalog_view");
  assert.equal(typeof catalogView.byHandle, "object");
  assert.deepEqual(runRequest.payload.catalog, catalog);
  assert.deepEqual(runRequest.payload.catalogView, catalogView);
  assert.deepEqual(runRequest.payload.applications, []);

  const product = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `abi5-root-chain-product=${Date.now()}`,
  );
  const abg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `abi5-root-chain-abg=${Date.now()}`,
  );
  const reconstructedCatalog = product.admitGraphFunctionCatalog(
    catalog.readinessBasis,
  );
  const reconstructedView = product.narrowGraphFunctionCatalog(
    reconstructedCatalog,
    catalogView.allowlist,
  );
  assert.deepEqual(reconstructedCatalog, catalog);
  assert.deepEqual(reconstructedView, catalogView);

  const outcome = run.transportResults.at(-1).outcome;
  const finalPrefix = run.transportResults.at(-1).closeHandoff.prefix;
  const durableEvents = abg.readRuntimeEventsAtDurablePrefix(finalPrefix);
  const fullPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents);
  const invocationEvent = durableEvents.find(
    (event) => event.kind === "invocation_admitted",
  );
  const basisEvent = durableEvents.find(
    (event) => event.kind === "basis_admitted",
  );
  assert.ok(invocationEvent);
  assert.ok(basisEvent);
  assert.equal(invocationEvent.payload.catalogHandle, canonicalHandle);
  assert.equal(
    invocationEvent.payload.selectedDefinitionRef,
    gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.equal(
    invocationEvent.payload.catalogHandle,
    invocationEvent.payload.selectedDefinitionRef,
  );
  assert.equal(invocationEvent.payload.publicStart, null);
  assert.equal(callableProgram.starts.length, 1);
  assert.equal(
    basisEvent.payload.entryRef,
    expectedRootCoordinate.nodeRef,
  );
  assert.deepEqual(
    invocationEvent.payload.gtlEntryCoordinate,
    expectedRootCoordinate,
  );
  assert.deepEqual(
    invocationEvent.payload.gtlEntryTerm,
    expectedRootTerm,
  );
  assert.equal(
    JSON.stringify(durableEvents).includes("fibre-selection://"),
    false,
  );
  assert.equal(
    JSON.stringify(durableEvents).includes("execution-plan://"),
    false,
  );
  const runPrefix = abg.selectValidatedRuntimeEventPrefix(durableEvents, {
    runId: outcome.runId,
  });
  const semanticReplay = abg.projectRunSemanticReplayProjection(
    fullPrefix,
    outcome.runId,
  );
  const replayFirst = abg.replayValidatedRuntimeEventPrefix(
    runPrefix,
    fullPrefix,
  );
  const replaySecond = abg.replayValidatedRuntimeEventPrefix(
    runPrefix,
    fullPrefix,
  );
  assert.deepEqual(replayFirst, replaySecond);
  assert.equal(semanticReplay.physicalCoordinates.scopedReplayRef, replayFirst.replayRef);
  assert.equal(semanticReplay.physicalCoordinates.scopedReplayDigest, replayFirst.replayDigest);
  assert.equal(outcome.replayRef, replayFirst.replayRef);
  assert.equal(outcome.replayDigest, replayFirst.replayDigest);
  assert.equal(outcome.replayAgreement, true);
  assert.deepEqual(outcome.result, {
    kind: "hello_world_output",
    message: "Hello World",
    schemaVersion: "5.0.0",
  });
  const reopened = abg.reopenEventStore(
    run.transportResults.at(-1).closeHandoff.reopenAuthority,
  );
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  const freshProof = await proveFreshProcessRuntimeProjectionEquality({
    abg,
    product,
    installedPackageRoot: harness.installedPackageRoot,
    requests: [{
      rowId: "wave1_scalar_replay",
      exportName: "replay",
      args: [{ runId: outcome.runId }],
    }],
    store: reopened.store,
  });
  assert.equal(freshProof.retainedRows.length, 1);
  assert.equal(
    freshProof.retainedRows[0].projection.replayDigest,
    outcome.replayDigest,
  );
  assert.equal(
    freshProof.retainedRows[0].projection.runtimeStatus,
    "closed",
  );
  context.diagnostic(JSON.stringify({
    operations: run.transportRequests.map((request, index) => ({
      operationId: request.invocation.operationId,
      invocationRef: request.invocation.invocationRef,
      outcomeInvocationRef:
        run.transportResults[index].outcome.invocationRef,
      entryPrefixLength: run.transportResults[index].entryPrefix.prefixLength,
      entryPrefixDigest: run.transportResults[index].entryPrefix.prefixDigest,
      closePrefixLength:
        run.transportResults[index].closeHandoff.prefix.prefixLength,
      closePrefixDigest:
        run.transportResults[index].closeHandoff.prefix.prefixDigest,
    })),
    final: {
      result: outcome.result,
      runtimeInvocationRef: outcome.runtimeInvocationRef,
      runId: outcome.runId,
      graphCallId: outcome.graphCallId,
      frameId: outcome.frameId,
      cCallRef: outcome.cCallRef,
      resultRef: outcome.resultRef,
      judgmentRef: outcome.judgmentRef,
      replayRef: outcome.replayRef,
      replayDigest: outcome.replayDigest,
      replayAgreement: outcome.replayAgreement,
    },
  }));
});
