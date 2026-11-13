import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {installOncePerFile, installTenantOnce, setupInstalledRootExecutionBasis, openCaseEnvironment} from './root-installed-environment.mjs';
import * as events from '../../build/code/src/abg/event_store.js';
import {GraphCallProjectionPort} from '../../build/code/src/abg/project_read_ports.js';
import {projectExactPrefixWorkspaceEnvironment} from '../../build/code/src/abg/environment_admission.js';
import {constructCapabilityDefinitionGraph, capabilityRefsForContract} from '../../build/code/src/shared/capability_contracts.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const installed = installOncePerFile(() => installTenantOnce(root));

// The expectation comes from the reader's register construction, independently
// of the artifact-truth accessors whose strict refusal the tests exercise.
export function recordedLockMatchesCurrentRegister(lock) {
  return lock.rows.every(row => {
    const graph = row.capabilityDefinitionGraph;
    const owners = [...new Map(graph.rows.flatMap(r => r.owningPublicContracts).map(owner => [canonicalJson(owner), owner])).values()];
    return canonicalJson(constructCapabilityDefinitionGraph(owners)) === canonicalJson(graph) &&
      row.publicContracts.every(contract => canonicalJson(contract.capabilityIdentities) === canonicalJson(capabilityRefsForContract(contract.contractId)));
  });
}

export async function createCurrentConformanceFixture(t) {
  const basis = await openCaseEnvironment(t, await installed());
  const environment = projectExactPrefixWorkspaceEnvironment(basis.durablePrefix,
    {ref: basis.workspaceBinding.bindingId, digest: basis.workspaceBinding.bindingDigest});
  assert.equal(environment.kind, 'exact_prefix_workspace_environment');
  assert.equal(recordedLockMatchesCurrentRegister(environment.resolvedProductLock), true);
  const publication = basis.catalog.boundPublications.find(p => p.programs.some(program => program.programRef === basis.selectedProgramRef));
  assert.ok(publication);
  return {environment, resources: {
    declarationCatalog: {catalog: basis.catalog, catalogView: basis.catalogView},
    declaredInventory: basis.catalog.boundPublications,
    packet: {program: publication.programs.find(program => program.programRef === basis.selectedProgramRef), publication},
  }};
}

// The existing R9 installed execution produces every event through HoG/ABG.
// It supplies a fresh strict-positive source after a register retirement;
// retained D2 bytes remain a separate historical-read/refusal fixture.
export async function createCurrentTerminalFixture(t) {
  const environment = await setupInstalledRootExecutionBasis(t, root, {install: await installed()});
  const {abg, hog, store, executionBasis} = environment;
  const runtime = correlationId => ({eventTime: '2026-07-21T00:00:00.000Z', correlationId, causationEventRefs: []});
  const opened = abg.openTraversalScope(store, environment.durablePrefix, {kind: 'root', executionBasis}, runtime('correlation://td77/current/open'));
  assert.equal(opened.kind, 'traversal_scope_open_admission');
  const completion = await hog.executeGraphTraversal({
    store, predecessorPrefix: opened.successorPrefix, executionBasis, openedTraversalScope: opened.scope,
    program: environment.program, programPublication: environment.publication, graphFunction: environment.graphFunction,
    graph: environment.graph, graphValidation: environment.graphValidation, programValidation: environment.programValidation,
    implementationSet: environment.implementationSet, interactionSet: environment.executionBasisAdmission.interactionSet,
    leafPort: environment.leafPort, closureContract: environment.closureContract,
    actorRuntimeBinding: {workspaceBinding: environment.workspaceBinding, artifactTruth: environment.artifactTruth},
    input: environment.input, inputDigest: environment.rawInput.subjectDigest, ...runtime('correlation://td77/current/traversal'),
  });
  assert.equal(completion.disposition, 'closed', completion.diagnosticRef);
  assert.deepEqual(completion.resultValue, {kind: 'hello_world_output', schemaVersion: '5.0.0', message: 'Hello World'});
  assert.equal(recordedLockMatchesCurrentRegister(environment.lock), true);
  const handoff = store.projectReopenAuthorityAndClose();
  const local = events.reopenEventStore(handoff.reopenAuthority);
  assert.equal(local.kind, 'reopened_event_store_context');
  t.after(() => local.store.closeDurableLog());
  const prefix = local.prefix, eventLogPath = fileURLToPath(prefix.eventLogRef);
  const bytes = fs.readFileSync(eventLogPath), rows = bytes.toString().trimEnd().split('\n').map(JSON.parse);
  const proof = deepFreeze({kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: environment.catalog, catalogView: environment.catalogView});
  const projection = GraphCallProjectionPort.graph_call_result({kind: 'abg_project_read_packet', schemaVersion: '5.0.0',
    memberKey: 'graph_call_result', prefix, targetRef: opened.scope.graphCallId, declarationProof: proof});
  assert.equal(projection.kind, 'abg_project_read_projection', JSON.stringify(projection));
  const terminal = projection.value.terminalResult, {value, projectionBasis, ...selection} = terminal;
  const publication = proof.catalog.boundPublications.find(p => p.graphFunctions.some(g => g.name === executionBasis.graphFunctionRef));
  const graph = publication.graphFunctions.find(g => g.name === executionBasis.graphFunctionRef);
  assert.equal(graph.inputs.length, 1);
  const resource = deepFreeze({kind: 'abg_historical_graph_call_source_resource', schemaVersion: '5.0.0', terminal: selection,
    input: {graphFunctionRef: executionBasis.graphFunctionRef, contractRef: graph.inputs[0]}, declarationProof: proof});
  return {bytes, rows, opened: local, prefix, resource, ancestor: executionBasis, terminal, publication, eventLogPath};
}
