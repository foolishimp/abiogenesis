import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { product, componentTask } from '../support/c2-observation-carrier.mjs';
import { RECURSION_IDS, constructStructuralPublication } from '../fixtures/language-structural/program.mjs';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as m02 from '../../build/code/src/gtl/m02.js';
import * as relation from '../../build/code/src/gtl/stdo_run_environment.js';
import * as validator from '../../build/code/src/validator/index.js';
import { evaluateGtlProgramConformance } from '../../build/code/src/validator/conformance_operation.js';
import * as catalog from '../../build/code/src/product/catalog.js';
import { CatalogOperationPort, constructCatalogProgramValidationInput } from '../../build/code/src/product/catalog_operations.js';
import * as closure from '../../build/code/src/product/declaration_closure.js';
import { observeRunEnvironment } from '../../build/code/src/product/stdo_environment.js';
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

// TD-28e: `abg.worksite_command_forward` is the declaration key the forward module set on both of
// its GraphFunctions. A Program one of whose callable GraphFunctions declares it has no valid run
// environment, so every door that validates the Program refuses it with the existing run-environment
// refusal: `invalid_reference` at `$.runEnvironments` at publication validation, `catalog.admit`,
// conformance (`validation_failed`) and Product resolution (stage `program`), and
// `unsupported_declaration` at the run-environment observation. The value does not matter, and a
// callable GraphFunction of another closure publication counts. Module admission stays structural.
const FORWARD_KEY = 'abg.worksite_command_forward';
const FORWARD_KEY_VALUE = 'dependency://abiogenesis/worksite/command-forward/historical-owners@5';
const R = RECURSION_IDS;
const LIBRARY_PROGRAM = 'program://abiogenesis/default-library/default@5';
const SHIPPED = ['constructDefaultGovernanceLibraryModulePublication', 'constructConsensusModulePublication',
  'constructWorksiteConstructionModulePublication', 'constructWorksiteCommandExecutionModulePublication',
  'constructNativeWorkspaceWorkModulePublication', 'constructRequirementHandoffModulePublication',
  'constructSemanticStageModulePublication', 'constructSemanticRevisionModulePublication', 'constructSelfConformanceModulePublication'];
const fixtureArtifact = { productId: 'product://abi5-tests/static-source-owner@5', artifactDigest: `sha256:${'1'.repeat(64)}`,
  productContentDigest: `sha256:${'2'.repeat(64)}`, productManifestDigest: `sha256:${'3'.repeat(64)}`,
  packageName: '@abi5-tests/static-source-owner', packageVersion: '5.0.0' };
const tenantArtifact = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME,
  packageVersion: product.ABI5_PACKAGE_VERSION, artifactDigest: `sha256:${'4'.repeat(64)}`,
  productContentDigest: `sha256:${'5'.repeat(64)}`, productManifestDigest: `sha256:${'6'.repeat(64)}` };
const installOf = a => ({ ...a, manifestDigest: a.productManifestDigest, installId: `product-install://${a.productId.slice('product://'.length)}` });
const runEnvironmentRefusal = [['invalid_reference', '$.runEnvironments']];
const diagnosticPairs = result => result.diagnostics.map(d => [d.code, d.path]);
const validatePublication = value => validator.validatePublication(m02.admitModule(value), value.contributions.map(c =>
  validator.rawAdmitValue(c, 'catalog_contribution', 'contract://abiogenesis/gtl/catalog-contribution@5')));
// A basis with publications and no binding, lock or Product rows: publications that validate reach readiness, which refuses it.
const admitCatalog = publications => CatalogOperationPort.admit({ kind: 'catalog_admit_packet', schemaVersion: '5.0.0', memberKey: 'admit',
  readinessBasis: { workspaceBinding: null, resolvedLock: null, verifiedProducts: [], installedProducts: [], publications } });
const conform = (publication, program) => evaluateGtlProgramConformance({ kind: 'conformance_evaluate_packet', schemaVersion: '5.0.0',
  memberKey: 'gtl_program', publication, program });
// Product resolution's path: Catalog, CatalogView, the declaration closure owner, then Program validation.
function resolveAndValidate(publications, program, installs) {
  const built = catalog.buildGraphFunctionCatalog(publications);
  assert.equal(built.kind, 'graph_function_catalog');
  const ready = { ...built, boundPublications: publications,
    readinessBasis: { resolvedLock: { dependencyEdges: [] }, installedProducts: installs } };
  const view = catalog.narrowGraphFunctionCatalog(ready, program.callableMembership);
  assert.equal(view.kind, 'graph_function_catalog_view');
  const resolved = closure.resolveProgramDeclarationClosure(ready, view, program.programRef);
  assert.equal(resolved.kind, 'resolved_program_declaration_closure', JSON.stringify(resolved));
  const input = constructCatalogProgramValidationInput(ready, view, resolved,
    resolved.programPublication.programs.find(p => p.programRef === resolved.programRef));
  assert.notEqual(input.kind, 'raw_admission_refusal');
  return validator.validateProgram(input);
}
const archiveRoot = mkdtempSync(join(tmpdir(), 'td28e-forward-key-'));
const observe = (publication, program, graphFunctions = publication.graphFunctions) => observeRunEnvironment({
  publication, program, graphFunctions, archiveRoot,
  authority: { authorityRef: 'authority://t292/td28e', authorityDigest: `sha256:${'e'.repeat(64)}`, actorRef: 'actor://t292/td28e' } });
const recursionSubject = (mutate = () => {}) => {
  const publication = structuredClone(constructStructuralPublication(gtl, fixtureArtifact));
  const program = publication.programs.find(p => p.programRef === R.programRef);
  mutate(publication, program);
  return { publication, program };
};
const declare = (publication, graphFunctionRef, key, value) => {
  publication.graphFunctions.find(g => g.name === graphFunctionRef).declarations[key] = value;
};

test('TD-28e: a Program one of whose callable GraphFunctions declares the forward key is refused at every Program-validating door', async () => {
  for (const [label, graphFunctionRef, value] of [['root, forward value', R.graphFunctionRef, FORWARD_KEY_VALUE],
    ['root, arbitrary value', R.graphFunctionRef, 'td28e://arbitrary-value'],
    ['second callable GraphFunction, forward value', R.childGraphFunctionRef, FORWARD_KEY_VALUE]]) {
    const { publication, program } = recursionSubject(p => declare(p, graphFunctionRef, FORWARD_KEY, value));
    assert.ok(program.callableMembership.includes(graphFunctionRef), label);
    assert.equal(m02.admitModule(publication).kind, 'raw_admitted_value', label + ': structural admission');
    assert.equal(relation.runEnvironmentForProgram(publication, program), false, label + ': run environment');
    const validation = validatePublication(publication);
    assert.equal(validation.kind, 'static_validation_refusal', label + ': publication validation');
    assert.equal(validation.stage, 'publication', label);
    assert.deepEqual(diagnosticPairs(validation), runEnvironmentRefusal, label);
    const admitted = admitCatalog([publication]);
    assert.equal(admitted.kind, 'catalog_validation_refusal', label + ': catalog.admit');
    assert.deepEqual(diagnosticPairs(admitted.validation), runEnvironmentRefusal, label + ': catalog.admit');
    const conformed = conform(publication, program);
    assert.equal(conformed.kind, 'gtl_program_conformance_refusal', label + ': conformance');
    assert.equal(conformed.code, 'validation_failed', label);
    assert.deepEqual(diagnosticPairs(conformed), runEnvironmentRefusal, label);
    const resolution = resolveAndValidate([publication], program, [installOf(fixtureArtifact)]);
    assert.equal(resolution.kind, 'static_validation_refusal', label + ': Product resolution');
    assert.equal(resolution.stage, 'program', label);
    assert.deepEqual(diagnosticPairs(resolution), runEnvironmentRefusal, label);
    const observed = await observe(publication, program);
    assert.equal(observed.kind, 'run_environment_refusal', label + ': run-environment observation');
    assert.equal(observed.cause, 'unsupported_declaration', label);
    assert.equal(observed.issuePath, '/program/runEnvironment', label);
  }
});

test('TD-28e: a callable GraphFunction of another closure publication that declares the key refuses the Program that calls it', async () => {
  const publications = SHIPPED.map(name => structuredClone(gtl[name](tenantArtifact)));
  const library = publications.find(p => p.programs.some(q => q.programRef === LIBRARY_PROGRAM));
  const program = library.programs.find(q => q.programRef === LIBRARY_PROGRAM);
  const c2 = publications.find(p => p.graphFunctions.some(g => g.name === C2.graphFunctionRef));
  assert.ok(program.callableMembership.includes(C2.graphFunctionRef) && c2 !== library);
  assert.equal(resolveAndValidate(publications, program, [installOf(tenantArtifact)]).kind, 'program_validation', 'control');
  declare(c2, C2.graphFunctionRef, FORWARD_KEY, FORWARD_KEY_VALUE);
  assert.equal(validatePublication(library).kind, 'publication_validation', 'the library publication itself declares no key');
  assert.deepEqual(diagnosticPairs(validatePublication(c2)), runEnvironmentRefusal, 'the C2 publication: its own Program calls it');
  const admitted = admitCatalog(publications);
  assert.equal(admitted.kind, 'catalog_validation_refusal');
  assert.deepEqual(diagnosticPairs(admitted.validation), runEnvironmentRefusal);
  const resolution = resolveAndValidate(publications, program, [installOf(tenantArtifact)]);
  assert.equal(resolution.kind, 'static_validation_refusal');
  assert.equal(resolution.stage, 'program');
  assert.deepEqual(diagnosticPairs(resolution), runEnvironmentRefusal);
  // The run door hands the observation every GraphFunction of the Program's closure.
  const { publication, program: recursion } = recursionSubject();
  const closureGraphFunctions = publication.graphFunctions.map(g => g.name === R.childGraphFunctionRef
    ? { ...g, declarations: { ...g.declarations, [FORWARD_KEY]: FORWARD_KEY_VALUE } } : g);
  assert.equal(relation.runEnvironmentForProgram(publication, recursion), null, 'the publication itself declares no key');
  assert.equal(relation.validRunEnvironmentProgram(publication, recursion, closureGraphFunctions), false);
  const observed = await observe(publication, recursion, closureGraphFunctions);
  assert.equal(observed.kind, 'run_environment_refusal');
  assert.equal(observed.cause, 'unsupported_declaration');
  assert.equal(observed.issuePath, '/program/runEnvironment');
});

test('TD-28e: without the key on a callable GraphFunction the same doors admit the Program', async () => {
  for (const [label, mutate] of [['no key', () => {}],
    ['an unknown declaration key', p => declare(p, R.graphFunctionRef, 'abg.td28e_unknown', FORWARD_KEY_VALUE)],
    ['the key as a Program policy', (p, program) => { program.policies[FORWARD_KEY] = FORWARD_KEY_VALUE; }]]) {
    const { publication, program } = recursionSubject(mutate);
    assert.equal(m02.admitModule(publication).kind, 'raw_admitted_value', label);
    assert.equal(relation.runEnvironmentForProgram(publication, program), null, label);
    assert.equal(relation.validRunEnvironmentProgram(publication, program, publication.graphFunctions), true, label);
    assert.equal(validatePublication(publication).kind, 'publication_validation', label);
    const admitted = admitCatalog([publication]);
    assert.equal(admitted.kind, 'catalog_construction_refusal', label + ': validated, then refused at readiness');
    assert.equal(admitted.code, 'binding_lock_mismatch', label);
    assert.equal(conform(publication, program).kind, 'gtl_program_conformance_result', label);
    assert.equal(resolveAndValidate([publication], program, [installOf(fixtureArtifact)]).kind, 'program_validation', label);
    const observed = await observe(publication, program);
    assert.equal(observed.kind, 'run_environment_observed', label);
    assert.equal(observed.evidence, null, label);
  }
});
