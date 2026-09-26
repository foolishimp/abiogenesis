import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {join} from 'node:path';
import {setupInstalledRootExecutionBasis} from './root-installed-environment.mjs';

// The existing installed helper owns publication, capability, invocation and
// execution admission. This fixture only opens and executes that admitted graph.
export async function executeAdmittedTestGraph(context, root, options) {
  const started = performance.now();
  const accounting = {wallMs: {}, volumes: {}, cpuAttribution: 'unmeasured; wall intervals include I/O and subprocess waits'};
  const environment = await setupInstalledRootExecutionBasis(context, root, {...options, setupAccounting: accounting});
  const setupMs = performance.now() - started;
  const e = environment, eventTime = '2026-09-26T00:00:00.000Z';
  accounting.volumes.preTraversalEventCount = e.store.readAll().length;
  accounting.volumes.preTraversalLogBytes = (await stat(join(e.scratch, 'runtime/events.jsonl'))).size;
  const openStarted = performance.now();
  const opened = e.abg.openTraversalScope(e.store, e.durablePrefix,
    {kind: 'root', executionBasis: e.executionBasis},
    {eventTime, correlationId: 'correlation://calculus/open', causationEventRefs: []});
  assert.equal(opened.kind, 'traversal_scope_open_admission', JSON.stringify(opened));
  accounting.wallMs.execution_preparation_open_scope = performance.now() - openStarted;
  const traversalStarted = performance.now();
  const completion = await e.hog.executeGraphTraversal({
    store: e.store, predecessorPrefix: opened.successorPrefix, executionBasis: e.executionBasis,
    openedTraversalScope: opened.scope, program: e.program, programPublication: e.publication,
    graphFunction: e.graphFunction, graph: e.graph, graphValidation: e.graphValidation,
    programValidation: e.programValidation, implementationSet: e.implementationSet,
    interactionSet: e.executionBasisAdmission.interactionSet, leafPort: e.leafPort,
    closureContract: e.closureContract, actorRuntimeBinding: {workspaceBinding: e.workspaceBinding, artifactTruth: e.artifactTruth},
    input: e.input, inputDigest: e.rawInput.subjectDigest, eventTime,
    correlationId: 'correlation://calculus/traversal',
  });
  const traversalMs = performance.now() - traversalStarted;
  const events = e.store.readAll();
  accounting.volumes.finalEventCount = events.length;
  accounting.volumes.finalLogBytes = (await stat(join(e.scratch, 'runtime/events.jsonl'))).size;
  return {environment, graph: e.graph, completion, events, timings: {setupMs, traversalMs, accounting}};
}
