import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function runtimeBasis(correlationId) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId,
    causationEventRefs: [],
  };
}

test("R8 opens explicit runtime scope and enters HoG at the declared C locus", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root);
  const {
    abg,
    hog,
    store,
    verified,
    program,
    graph,
    graphValidation,
    invocationAdmission,
    executionBasis,
  } = environment;
  const eventsBeforeOpen = store.readAll();
  assert.equal(eventsBeforeOpen.at(-1).kind, "basis_admitted");
  assert.equal(abg.hasAdmittedExecutionBasis(store, executionBasis), true);
  assert.equal(
    executionBasis.entryRef,
    invocationAdmission.hogEntryCoordinate.nodeRef,
  );

  const opened = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r8/open"),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  assert.equal(abg.hasOpenedTraversalScope(store, opened.scope), true);
  assert.equal(opened.scope.executionBasisRef, executionBasis.basisRef);
  assert.equal(opened.scope.invocationAdmissionRef, invocationAdmission.invocationAdmissionRef);
  assert.equal(opened.scope.programRef, program.programRef);
  assert.equal(opened.scope.graphRef, graph.materializationRef);
  assert.equal(opened.scope.runId, opened.run.runId);
  assert.equal(opened.scope.graphCallId, opened.graphCall.graphCallId);
  assert.equal(opened.scope.frameId, opened.frame.frameId);
  assert.equal(Object.isFrozen(opened.scope), true);

  const traversalStop = hog.traverse({
    program,
    graph,
    graphValidation,
    executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversalStop.kind, "traversal_stop_ref", JSON.stringify(traversalStop));
  assert.equal(traversalStop.disposition, "at_compute_locus");
  assert.equal(traversalStop.nodeRef, graph.template.startNodeRef);
  assert.deepEqual(
    traversalStop.cursor.termPath,
    invocationAdmission.hogEntryCoordinate.termPath,
  );
  assert.equal(
    traversalStop.cursor.currentNodeRef,
    invocationAdmission.hogEntryCoordinate.nodeRef,
  );
  assert.deepEqual(
    hog.deriveDirectCStepFromGraph(
      graph.template,
      invocationAdmission.hogEntryCoordinate,
    ),
    invocationAdmission.hogEntryStep,
  );
  assert.equal(traversalStop.computeRegime, "F_D");
  assert.equal(traversalStop.frameId, opened.frame.frameId);
  assert.equal(traversalStop.cursor.frameId, opened.frame.frameId);
  assert.equal(traversalStop.implementationBindingRef, environment.resolutionCandidate.implementationBindingRef);
  assert.equal(Object.isFrozen(traversalStop), true);
  assert.equal("result" in traversalStop, false);
  assert.equal("event" in traversalStop, false);
  assert.equal("plan" in traversalStop, false);

  const events = store.readAll();
  assert.equal(events.length, eventsBeforeOpen.length + 3);
  assert.deepEqual(events.slice(-3).map((event) => event.kind), [
    "run_segment_opened",
    "graph_call_opened",
    "frame_opened",
  ]);
  const runEvent = events.at(-3);
  const graphCallEvent = events.at(-2);
  const frameEvent = events.at(-1);
  const executionBasisEvent = events.find((event) => event.eventId === executionBasis.admissionEventRef);
  const implementationEvent = events.find(
    (event) => event.eventId === environment.implementationResolution.admissionEventRef,
  );
  const invocationEvent = events.find(
    (event) => event.eventId === invocationAdmission.admissionEventRef,
  );
  assert.equal(runEvent.causationEventRefs[0], executionBasisEvent.eventId);
  assert.equal(executionBasisEvent.causationEventRefs[0], implementationEvent.eventId);
  assert.equal(implementationEvent.causationEventRefs[0], invocationEvent.eventId);
  assert.equal(invocationEvent.causationEventRefs.includes(invocationAdmission.publicOperationEventRef), true);
  assert.equal(graphCallEvent.causationEventRefs[0], runEvent.eventId);
  assert.equal(frameEvent.causationEventRefs[0], graphCallEvent.eventId);
  assert.equal(runEvent.runId, opened.run.runId);
  assert.equal(graphCallEvent.graphCallId, opened.graphCall.graphCallId);
  assert.equal(frameEvent.frameId, opened.frame.frameId);
  assert.equal(events.some((event) => event.kind.startsWith("c_call_")), false);
  assert.equal(events.some((event) => event.kind === "terminal_reached"), false);
  assert.equal(
    JSON.stringify(events).includes("fibre-selection://"),
    false,
  );
  assert.equal(
    JSON.stringify(events).includes("execution-plan://"),
    false,
  );

  const eventCountBeforeCopiedScope = events.length;
  const copiedScope = structuredClone(opened.scope);
  const copiedScopeResult = hog.traverse({
    program,
    graph,
    graphValidation,
    executionBasis,
    openedTraversalScope: copiedScope,
  });
  assert.equal(copiedScopeResult.kind, "traversal_refusal");
  assert.equal(copiedScopeResult.code, "scope_not_admitted");
  assert.equal(store.readAll().length, eventCountBeforeCopiedScope);

  const copiedBasis = structuredClone(executionBasis);
  const copiedBasisOpen = abg.openCall(
    store,
    copiedBasis,
    runtimeBasis("correlation://t286/r8/copied-basis"),
  );
  assert.equal(copiedBasisOpen.kind, "open_call_refusal");
  assert.equal(copiedBasisOpen.code, "execution_basis_already_opened");
  assert.equal(store.readAll().length, eventCountBeforeCopiedScope);
  const duplicateOpen = abg.openCall(
    store,
    executionBasis,
    runtimeBasis("correlation://t286/r8/duplicate-open"),
  );
  assert.equal(duplicateOpen.kind, "open_call_refusal");
  assert.equal(duplicateOpen.code, "execution_basis_already_opened");
  assert.equal(store.readAll().length, eventCountBeforeCopiedScope);
  assert.equal(
    Object.keys(hog).some((name) => /compiled|controller|plan|scheduler/i.test(name)),
    false,
  );

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r8.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R8_hog_execution_entered_through_public_invocation",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      publicOperationEventRef: invocationAdmission.publicOperationEventRef,
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      executionBasisRef: executionBasis.basisRef,
      traversalScopeRef: opened.scope.scopeRef,
      runId: opened.run.runId,
      graphCallId: opened.graphCall.graphCallId,
      frameId: opened.frame.frameId,
      traversalStopRef: traversalStop.stopRef,
      traversalCursorRef: traversalStop.cursor.cursorRef,
      computeLocusRef: traversalStop.nodeRef,
      computeRegime: traversalStop.computeRegime,
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      mutation: {
        copiedScopeRefused: copiedScopeResult.code,
        rehydratedExecutionBasisCannotBypassDuplicateGuard:
          copiedBasisOpen.code,
        duplicateExecutionBasisOpenRefused: duplicateOpen.code,
        noEventsAddedByRefusals: true,
      },
      authorityBoundary: {
        explicitScopeOnly: true,
        ambientLineageUsed: false,
        compiledRepresentationUsed: false,
        controllerUsed: false,
        leafExecuted: false,
        cCallOpened: false,
        terminalClaimed: false,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
