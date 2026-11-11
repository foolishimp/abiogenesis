// TD-31 (T-292). The module publication schema has no `stdoRunEnvironments`
// member, so a publication that carries one, empty or holding an old STDO
// declaration on its release allowlist, is refused at structural admission:
// by the GTL module admission and by the catalog admission door before any
// publication validation. A Program that selects the retired policy
// `abg.stdo_run_environment` is still refused by publication validation with
// `invalid_reference` at `$.runEnvironments`, and a publication without the
// member is admitted and validated. Before TD-31 the member was admitted
// structurally and refused only at validation (the Return records that run).
import assert from 'node:assert/strict';
import test from 'node:test';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = process.env.ABI5_ENV_TEST_PACKAGE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = path => import(pathToFileURL(join(packageRoot, 'build/code/src', path + '.js')).href);
const [m02, validator, product, gtl, relation] = await Promise.all(
  ['gtl/m02', 'validator/index', 'product/index', 'gtl/index', 'gtl/stdo_run_environment'].map(load));

const digest = c => 'sha256:' + c.repeat(64), zero = digest('0');
const identity = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: digest('a'), productContentDigest: digest('b'), productManifestDigest: digest('c') };
const publication = () => structuredClone(gtl.constructSemanticStageModulePublication(identity));
const contributions = value => value.contributions.map(c =>
  validator.rawAdmitValue(c, 'catalog_contribution', 'contract://abiogenesis/gtl/catalog-contribution@5'));
const catalogAdmit = value => product.CatalogOperationPort.admit({ kind: 'catalog_admit_packet', schemaVersion: '5.0.0',
  memberKey: 'admit', readinessBasis: { publications: [value] } });

// One declaration that the retired release allowlist accepted (STDO v2.5.0-rc.7),
// built as the retired shape's own relational checks required.
function historicalDeclaration() {
  const member = { memberRef: 'member://td31', path: 'source/input.md', byteCount: 4, digest: zero };
  const context = { contextRef: 'context://td31', sourceLocator: 'stdo://releases/v2.5.0-rc.7/', inventoryDigest: product.sha256Canonical([member]), members: [member] };
  const binding = { contextRef: context.contextRef, memberRef: member.memberRef, memberDigest: zero, startByte: 0, endByte: 4, spanDigest: zero };
  const inventory = paths => paths.map(path => ({ path, type: 'file', digest: zero, target: null }));
  const companion = paths => { const members = inventory(paths); return { productRef: 'product://td31', releaseRef: 'release://td31',
    tagObject: 'a'.repeat(40), recordUri: 'record://td31', recordDigest: zero, inventoryDigest: gtl.stdoInventoryDigest(members), members }; };
  const artifact = path => ({ path, uri: 'artifact://td31/' + path, byteDigest: zero, canonicalDigest: zero });
  return { kind: 'stdo_run_environment_declaration', schemaVersion: '5.0.0', declarationRef: 'declaration://td31',
    source: { releaseUri: context.sourceLocator, manifestDigest: zero },
    representation: { ...companion(['map.json', 'program.json']), program: artifact('program.json'), map: artifact('map.json') },
    axiom: { ...companion(['contract.json', 'executable.py']), executablePath: 'executable.py', outputContractPath: 'contract.json',
      outputContractVersion: 'axiom-indexer.frame-projection@1', pythonExecutableDigest: zero },
    contexts: [context], accesses: [{ accessRef: 'access://td31', operation: 'project', mode: 'materialized', frameIndexRefs: ['frame://td31'], maxOutputBytes: 1, timeoutMs: 1 }],
    roles: [{ graphFunctionRef: 'graph-function://td31', programLocusRef: 'locus://td31', role: 'author', frameRefs: ['frame://td31'],
      policy: { policyRef: 'policy://td31', text: ' ', digest: product.sha256Bytes(Buffer.from(' ')) }, accessRefs: ['access://td31'], sourceBindings: [binding] }] };
}

test('a publication carrying stdoRunEnvironments is refused at structural admission', () => {
  for (const [label, member] of [['empty', []], ['allowlisted rc.7 declaration', [historicalDeclaration()]]]) {
    const carrying = { ...publication(), stdoRunEnvironments: member };
    const refused = m02.admitModule(carrying);
    assert.equal(refused.kind, 'raw_admission_refusal', label + ': module admission stage');
    assert.equal(refused.code, 'invalid_kind', label + ': module admission code');
    assert.match(refused.message, /^\$\/stdoRunEnvironments: /u, label);
    assert.throws(() => m02.serializeModule(carrying), TypeError, label + ': serialization');
    const catalog = catalogAdmit(carrying);
    assert.equal(catalog.kind, 'catalog_validation_refusal', label + ': catalog door');
    assert.equal(catalog.validation.kind, 'raw_admission_refusal', label + ': catalog door stage');
    assert.equal(catalog.validation.code, 'invalid_kind', label + ': catalog door code');
  }
});

test('a Program selecting abg.stdo_run_environment is refused by publication validation with invalid_reference', () => {
  const value = publication();
  value.programs[0].policies['abg.stdo_run_environment'] = 'declaration://td31';
  const admitted = m02.admitModule(value);
  assert.equal(admitted.kind, 'raw_admitted_value');
  const validation = validator.validatePublication(admitted, contributions(value));
  assert.equal(validation.kind, 'static_validation_refusal');
  assert.equal(validation.stage, 'publication');
  assert.deepEqual(validation.diagnostics.map(d => [d.code, d.path]), [['invalid_reference', '$.runEnvironments']]);
  assert.equal(relation.runEnvironmentForProgram(admitted.value, admitted.value.programs[0]), false);
  const catalog = catalogAdmit(value);
  assert.equal(catalog.kind, 'catalog_validation_refusal');
  assert.equal(catalog.validation.kind, 'static_validation_refusal');
  assert.deepEqual(catalog.validation.diagnostics.map(d => [d.code, d.path]), [['invalid_reference', '$.runEnvironments']]);
});

test('a publication without stdoRunEnvironments is admitted and validated', () => {
  const value = publication();
  assert.equal(Object.hasOwn(value, 'stdoRunEnvironments'), false);
  const admitted = m02.admitModule(value);
  assert.equal(admitted.kind, 'raw_admitted_value');
  assert.equal(validator.validatePublication(admitted, contributions(value)).kind, 'publication_validation');
  assert.equal(relation.runEnvironmentForProgram(admitted.value, admitted.value.programs[0]), null);
  assert.equal(JSON.parse(m02.serializeModule(admitted.value)).moduleRef, value.moduleRef);
});
