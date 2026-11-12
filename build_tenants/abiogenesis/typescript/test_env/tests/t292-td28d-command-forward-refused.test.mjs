import test from 'node:test';
import assert from 'node:assert/strict';
import { product, componentTask } from '../support/c2-observation-carrier.mjs';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as catalog from '../../build/code/src/product/catalog.js';
import * as closure from '../../build/code/src/product/declaration_closure.js';
import { ABI5_PRODUCT_SEMANTICS as semantics } from '../../build/code/src/product/builtin_semantics.js';
import { realizeWorksiteCommandExecution } from '../../build/code/src/implementation/worksite_command_execution.js';
import { isAuthorityFreeWorksiteCommandOccurrence } from '../../build/code/src/product/worksite_command_launch.js';

// TD-28d retired command forward. These are the coordinates its module published
// at the last cut that carried it; no current owner gives any of them a meaning.
const FORWARD = Object.freeze({
  moduleRef: 'module://abiogenesis/worksite/command-forward@5',
  programRef: 'program://abiogenesis/worksite/command-forward@5',
  graphFunctionRef: 'graph-function://abiogenesis/worksite/command-forward@5',
  childGraphFunctionRef: 'graph-function://abiogenesis/worksite/command-forward/execute@5',
  nodeRef: 'node://abiogenesis/worksite/command-forward/execute@5',
  requestContractRef: 'contract://abiogenesis/worksite/command-forward/request@5',
  taskContractRef: 'contract://abiogenesis/worksite/command-forward/task@5',
  predicateRefs: ['predicate://abiogenesis/worksite/command-forward/step@5',
    'predicate://abiogenesis/worksite/command-forward/terminal@5',
    'predicate://abiogenesis/worksite/command-forward/observation@5'],
  valueKinds: ['worksite_command_forward_request', 'worksite_command_forward_task',
    'worksite_command_forward_worker_result', 'worksite_command_forward_observation'],
});
const C2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
const occurrenceAt = programLocusRef => ({ cCallRef: 'c-call://t292/td28d', runId: 'run://t292/td28d',
  graphCallId: 'graph-call://t292/td28d', frameId: 'frame://t292/td28d', programLocusRef, taskOrdinal: 0, attempt: 1,
  executionAuthority: null });
// A forward-shaped task: the kept C2 task under the retired kind, and the request that named it.
const forwardTask = () => ({ ...componentTask(), kind: 'worksite_command_forward_task' });
const forwardRequest = () => ({ kind: 'worksite_command_forward_request', schemaVersion: '5.0.0',
  workspaceBinding: componentTask().workspaceBinding, protectedObservations: componentTask().protectedObservations });

test('TD-28d: a forward task or request is admitted by no Product owner and refused by the C2 leaf', () => {
  const task = forwardTask(), request = forwardRequest();
  assert.equal(semantics.admitInput(FORWARD.requestContractRef, request), null);
  assert.equal(semantics.admitInput(FORWARD.taskContractRef, task), null);
  assert.equal(semantics.admitInput(C2.taskContractRef, task), null);
  assert.notEqual(semantics.admitInput(C2.taskContractRef, componentTask()), null, 'control: the kept task is admitted');
  for (const kind of FORWARD.valueKinds) {
    assert.equal(semantics.validateContractValue(kind, kind.endsWith('_request') ? request : task), false, kind);
  }
  for (const ref of FORWARD.predicateRefs) assert.equal(semantics.resolveJudgmentRelation(ref), null, ref);
  assert.equal(product.isWorksiteExecutionTask(task), false, 'the helper task-manifest rule');
  assert.equal(product.isWorksiteExecutionTask(componentTask()), true, 'control: the helper task-manifest rule');
  assert.throws(() => realizeWorksiteCommandExecution(task, occurrenceAt(C2.nodeRef)),
    /^TypeError: command execution requires one exact admitted task$/u);
});

test('TD-28d: the forward command locus is refused by the C2 parent and the helper launch rule', () => {
  assert.equal(isAuthorityFreeWorksiteCommandOccurrence(occurrenceAt(FORWARD.nodeRef)), false);
  assert.equal(isAuthorityFreeWorksiteCommandOccurrence(occurrenceAt(C2.nodeRef)), true, 'control');
  assert.throws(() => realizeWorksiteCommandExecution(componentTask(), occurrenceAt(FORWARD.nodeRef)),
    /^TypeError: command execution requires one exact authority-free C2 occurrence$/u);
});

test('TD-28d: the shipped publications carry no forward module and the Catalog refuses its Program and GraphFunctions', () => {
  assert.deepEqual(Object.keys(gtl).filter(name => /CommandForward/u.test(name)), []);
  assert.deepEqual(Object.keys(product).filter(name => /CommandForward|COMMAND_FORWARD|ExecutableWorksiteCommand/u.test(name)), []);
  const artifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME,
    packageVersion: product.ABI5_PACKAGE_VERSION, artifactDigest: `sha256:${'1'.repeat(64)}`,
    productContentDigest: `sha256:${'2'.repeat(64)}`, productManifestDigest: `sha256:${'3'.repeat(64)}` };
  const publications = [gtl.constructConsensusModulePublication, gtl.constructWorksiteConstructionModulePublication,
    gtl.constructWorksiteCommandExecutionModulePublication, gtl.constructNativeWorkspaceWorkModulePublication,
    gtl.constructRequirementHandoffModulePublication, gtl.constructSemanticStageModulePublication,
    gtl.constructSemanticRevisionModulePublication, gtl.constructSelfConformanceModulePublication].map(f => f(artifact));
  assert.equal(publications.some(p => p.moduleRef === FORWARD.moduleRef), false);
  const built = catalog.buildGraphFunctionCatalog(publications);
  assert.equal(built.kind, 'graph_function_catalog');
  const ready = { ...built, boundPublications: publications, readinessBasis: { resolvedLock: { dependencyEdges: [] },
    installedProducts: [{ ...artifact, manifestDigest: artifact.productManifestDigest,
      installId: 'product-install://t292/td28d' }] } };
  for (const ref of [FORWARD.graphFunctionRef, FORWARD.childGraphFunctionRef]) {
    assert.equal(catalog.lookupGraphFunctionDefinition(ready, ref, FORWARD.programRef).kind,
      'graph_function_definition_lookup_absent', ref);
  }
  const refused = catalog.narrowGraphFunctionCatalog(ready, [FORWARD.graphFunctionRef]);
  assert.equal(refused.kind, 'catalog_construction_refusal');
  assert.equal(refused.code, 'unknown_allowlist_entry');
  const view = catalog.narrowGraphFunctionCatalog(ready, [C2.graphFunctionRef]);
  assert.equal(view.kind, 'graph_function_catalog_view');
  const absent = closure.resolveProgramDeclarationClosure(ready, view, FORWARD.programRef);
  assert.equal(absent.kind, 'execution_declaration_closure_refusal');
  assert.equal(absent.code, 'absent');
  assert.equal(closure.resolveProgramDeclarationClosure(ready, view, C2.programRef).kind,
    'resolved_program_declaration_closure', 'control: the C2 Program resolves');
});
