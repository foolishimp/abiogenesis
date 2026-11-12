// TD-28c (T-292). Governed context (GC03) and its Python host adapter are
// retired. A Program whose policies name `abg.governed_context` or
// `abg.governed_context.activation` has no valid run environment, so every door
// that validates the Program refuses it with the existing codes: publication
// validation and catalog admission (`invalid_reference` at `$.runEnvironments`),
// GTL Program conformance (`validation_failed`), Product resolution's Program
// validation (stage `program`) and run-environment observation
// (`unsupported_declaration`). Before TD-28c these Programs were admitted at
// every door and the key selected the retired capability at Native Construction
// (the Return records that run). A Program without the keys, including the
// default library Program, is unchanged.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = process.env.ABI5_ENV_TEST_PACKAGE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = path => import(pathToFileURL(join(packageRoot, 'build/code/src', path + '.js')).href);
const [m02, validator, product, gtl, relation, conformance, catalogOps, environment] = await Promise.all(
  ['gtl/m02', 'validator/index', 'product/index', 'gtl/index', 'gtl/stdo_run_environment',
    'validator/conformance_operation', 'product/catalog_operations', 'product/stdo_environment'].map(load));

const digest = c => 'sha256:' + c.repeat(64);
const identity = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: digest('a'), productContentDigest: digest('b'), productManifestDigest: digest('c') };
const publication = (policies = {}) => {
  const value = structuredClone(gtl.constructSemanticStageModulePublication(identity));
  Object.assign(value.programs[0].policies, policies);
  return value;
};
const contributions = value => value.contributions.map(c =>
  validator.rawAdmitValue(c, 'catalog_contribution', 'contract://abiogenesis/gtl/catalog-contribution@5'));
const catalogAdmit = value => product.CatalogOperationPort.admit({ kind: 'catalog_admit_packet', schemaVersion: '5.0.0',
  memberKey: 'admit', readinessBasis: { publications: [value] } });
const conform = value => conformance.evaluateGtlProgramConformance({ kind: 'conformance_evaluate_packet', schemaVersion: '5.0.0',
  memberKey: 'gtl_program', publication: value, program: value.programs[0] });
const refusal = [['invalid_reference', '$.runEnvironments']];
const pairs = result => result.diagnostics.map(d => [d.code, d.path]);

// The resolved closure that Product resolution hands to Program validation: the
// Program's own publication plus a second publication in the closure.
function programValidation(value) {
  const program = value.programs[0];
  const owners = (list, key) => list.map(x => ({ declarationRef: x[key], productId: value.owningProductId, moduleRef: value.moduleRef }));
  const closure = { kind: 'resolved_program_declaration_closure', closureScope: 'program', selectedGraphFunctionRef: null,
    closureDigest: digest('d'), programPublication: value,
    publications: [value, structuredClone(gtl.constructWorksiteC0ModulePublication(identity))],
    graphFunctionOwners: owners(value.graphFunctions.filter(g => program.callableMembership.includes(g.name)), 'name'),
    contractOwners: owners(value.contracts, 'contractRef'),
    implementationBindingOwners: owners(value.implementationBindings, 'bindingRef'),
    closureContractOwners: owners(value.closureContracts, 'closureContractRef'),
    evaluatorOwners: [], ruleOwners: [] };
  const input = catalogOps.constructProgramValidationInputFromResolvedClosure(closure, program);
  assert.notEqual(input.kind, 'raw_admission_refusal');
  return validator.validateProgram(input);
}
const archiveRoot = mkdtempSync(join(tmpdir(), 'td28c-governed-'));
const observe = value => environment.observeRunEnvironment({ publication: value, program: value.programs[0], graphFunctions: value.graphFunctions,
  authority: { authorityRef: 'authority://td28c', authorityDigest: digest('e'), actorRef: 'actor://td28c' }, archiveRoot });

const retired = [
  ['abg.governed_context', { 'abg.governed_context': 'member://td28c/policy' }],
  ['abg.governed_context.activation only', { 'abg.governed_context.activation': 'member://td28c/template' }],
];

test('a Program naming a governed-context policy key is refused at every Program-validating door', async () => {
  for (const [label, policies] of retired) {
    const value = publication(policies);
    const admitted = m02.admitModule(value);
    assert.equal(admitted.kind, 'raw_admitted_value', label + ': structural admission');
    assert.equal(relation.runEnvironmentForProgram(admitted.value, admitted.value.programs[0]), false, label + ': run environment');
    const validation = validator.validatePublication(admitted, contributions(value));
    assert.equal(validation.kind, 'static_validation_refusal', label + ': publication validation');
    assert.equal(validation.stage, 'publication', label);
    assert.deepEqual(pairs(validation), refusal, label);
    const catalog = catalogAdmit(value);
    assert.equal(catalog.kind, 'catalog_validation_refusal', label + ': catalog door');
    assert.equal(catalog.validation.kind, 'static_validation_refusal', label + ': catalog door stage');
    assert.deepEqual(pairs(catalog.validation), refusal, label + ': catalog door');
    const conformed = conform(value);
    assert.equal(conformed.kind, 'gtl_program_conformance_refusal', label + ': conformance');
    assert.equal(conformed.code, 'validation_failed', label + ': conformance');
    assert.deepEqual(pairs(conformed), refusal, label + ': conformance');
    const program = programValidation(value);
    assert.equal(program.kind, 'static_validation_refusal', label + ': Product resolution');
    assert.equal(program.stage, 'program', label + ': Product resolution');
    assert.deepEqual(pairs(program), refusal, label + ': Product resolution');
    const observed = await observe(value);
    assert.equal(observed.kind, 'run_environment_refusal', label + ': run environment observation');
    assert.equal(observed.cause, 'unsupported_declaration', label);
    assert.equal(observed.issuePath, '/program/runEnvironment', label);
  }
});

test('a Program without the keys is admitted at the same doors', async () => {
  for (const [label, policies] of [['clean', {}], ['unknown policy key', { 'abg.td28c_unknown': 'x' }]]) {
    const value = publication(policies);
    const admitted = m02.admitModule(value);
    assert.equal(admitted.kind, 'raw_admitted_value', label);
    assert.equal(relation.runEnvironmentForProgram(admitted.value, admitted.value.programs[0]), null, label);
    assert.equal(validator.validatePublication(admitted, contributions(value)).kind, 'publication_validation', label);
    assert.equal(conform(value).kind, 'gtl_program_conformance_result', label);
    assert.equal(programValidation(value).kind, 'program_validation', label);
    const observed = await observe(value);
    assert.equal(observed.kind, 'run_environment_observed', label);
    assert.equal(observed.evidence, null, label);
  }
});

test('the default library Program names no governed-context key and validates; adding one is refused', () => {
  const basis = { ...identity };
  const library = () => structuredClone(gtl.constructDefaultGovernanceLibraryModulePublication(basis));
  const value = library();
  for (const program of value.programs) {
    assert.equal(Object.keys(program.policies).some(key => key.startsWith('abg.governed_context')), false, program.programRef);
  }
  assert.equal(validator.validatePublication(m02.admitModule(value), contributions(value)).kind, 'publication_validation');
  for (const [label, policies] of retired) {
    const carrying = library();
    Object.assign(carrying.programs[0].policies, policies);
    const validation = validator.validatePublication(m02.admitModule(carrying), contributions(carrying));
    assert.equal(validation.kind, 'static_validation_refusal', label);
    assert.deepEqual(pairs(validation), refusal, label);
  }
});
