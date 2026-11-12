import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as catalogOwner from '../../build/code/src/product/catalog.js';
import * as builtin from '../../build/code/src/product/builtin_semantics.js';
import { productSemanticsFromModules } from '../../build/code/src/product/semantics.js';

// T-292 TD-26 P2: the Product ships no Consensus module, no system semantics
// and no Consensus vocabulary. A value that names one of them is refused at
// the door a caller reaches with that door's existing refusal; no refusal code
// is new. The 13 Consensus schema contracts stay published until the
// capability register changes (P7).
const packageRoot = new URL('../..', import.meta.url).pathname;
const MODULE = 'module://abg/consensus@5';
const PROGRAM = 'program://abg/system/consensus-one-surface@5';
const GRAPH_FUNCTION = 'graph-function://abg/consensus/one-surface@5';
const HANDLE = 'gtl://abg/consensus/submitter-reviewer-rounds';
const NODE_TYPE = 'catalog://abg/consensus/subject';
const OVERLAY = 'catalog://abg/consensus/overlay/ruling';
const VOCABULARIES = ['abg.vocabulary.review-ruling-kind', 'abg.vocabulary.consensus-round-outcome', 'abg.vocabulary.consensus-fh-decision'];
const DIFFERS = 'installed Product semantics provider differs from its published binding';
// The shipped module publication constructors (scripts/generate-product-manifest.mjs).
const SHIPPED = ['constructDefaultGovernanceLibraryModulePublication', 'constructWorksiteConstructionModulePublication',
  'constructWorksiteCommandExecutionModulePublication', 'constructNativeWorkspaceWorkModulePublication',
  'constructRequirementHandoffModulePublication', 'constructSemanticStageModulePublication',
  'constructSemanticRevisionModulePublication', 'constructSelfConformanceModulePublication'];
const basis = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: `sha256:${'1'.repeat(64)}`, productContentDigest: `sha256:${'2'.repeat(64)}`, productManifestDigest: `sha256:${'3'.repeat(64)}` };
const install = { installId: 'install://td26p2/door', packageName: basis.packageName, packageVersion: basis.packageVersion,
  productContentDigest: basis.productContentDigest, manifestDigest: basis.productManifestDigest };
const load = (binding, module) => productSemanticsFromModules({ install, verifyInstallAdmission: () => true,
  publicationDigest: `sha256:${'4'.repeat(64)}`, productSemanticsBinding: binding },
{ kind: 'installed_product_module_loading', install, load: async () => ({ kind: 'loaded', module }) });

test('the semantics loader refuses a provider that carries a retired result-projection key, whatever its value', async () => {
  const provider = builtin.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS;
  const binding = { kind: 'product_semantics_binding', bindingRef: provider.bindingRef, packageName: basis.packageName,
    packageVersion: basis.packageVersion, modulePath: 'build/index.mjs', namedSymbol: 'SEMANTICS' };
  const loaded = await load(binding, { SEMANTICS: { ...provider } });
  assert.equal(loaded.bindingRef, provider.bindingRef, 'positive control: the provider without either key loads');
  for (const [label, extra] of [
    ['an empty roster', { publicResultProjectionKinds: [] }],
    ['a roster', { publicResultProjectionKinds: ['result'] }],
    ['a function hook', { projectPublicResult: () => null }],
    ['a non-function hook', { projectPublicResult: null }],
    ['an undefined hook', { projectPublicResult: undefined }],
    ['an inherited hook', null],
  ]) {
    const candidate = extra === null
      ? Object.assign(Object.create({ projectPublicResult: () => null }), provider)
      : { ...provider, ...extra };
    await assert.rejects(load(binding, { SEMANTICS: candidate }), { name: 'TypeError', message: DIFFERS }, label);
  }
});

test('the semantics loader refuses the system semantics binding over the tenant module', async () => {
  assert.equal('ABI5_SYSTEM_PRODUCT_SEMANTICS' in builtin, false);
  const binding = { kind: 'product_semantics_binding', bindingRef: 'product-semantics://abiogenesis/system@5', packageName: basis.packageName,
    packageVersion: basis.packageVersion, modulePath: 'build/code/src/product/builtin_semantics.js', namedSymbol: 'ABI5_SYSTEM_PRODUCT_SEMANTICS' };
  await assert.rejects(load(binding, builtin), { name: 'TypeError', message: DIFFERS });
});

test('the shipped publications carry no Consensus module and the Catalog refuses its handles, Program and declarations', () => {
  assert.deepEqual(Object.keys(gtl).filter((name) => /Consensus/u.test(name) && name !== 'CONSENSUS_PUBLIC_SCHEMA'), []);
  const publications = SHIPPED.map((name) => gtl[name](basis));
  assert.equal(publications.some(({ moduleRef }) => moduleRef === MODULE), false);
  const catalog = catalogOwner.buildGraphFunctionCatalog(publications);
  assert.equal(catalog.kind, 'graph_function_catalog', JSON.stringify(catalog).slice(0, 500));
  assert.equal(catalog.declarationEntries.length, 0, 'no shipped publication contributes a node_type or overlay');
  for (const handle of [HANDLE, GRAPH_FUNCTION, NODE_TYPE, OVERLAY]) {
    assert.equal(catalogOwner.lookupGraphFunction(catalog, handle), null, handle);
    const narrowed = catalogOwner.narrowGraphFunctionCatalog(catalog, [handle]);
    assert.equal(`${narrowed.kind}:${narrowed.code}`, 'catalog_construction_refusal:unknown_allowlist_entry', handle);
  }
  const view = catalogOwner.narrowGraphFunctionCatalog(catalog, catalog.entries.map(({ handle }) => handle));
  assert.equal(view.kind, 'graph_function_catalog_view');
  const closure = product.resolveExecutionDeclarationClosure({ ...catalog, boundPublications: publications }, view, PROGRAM, GRAPH_FUNCTION);
  assert.equal(`${closure.kind}:${closure.code}`, 'execution_declaration_closure_refusal:absent');
  for (const [applicationKind, handle] of [['node_type', NODE_TYPE], ['overlay', OVERLAY]]) {
    const applied = catalogOwner.applyCatalogDeclaration(view, { applicationKind, handle, targetRef: PROGRAM,
      targetDigest: product.sha256Canonical({ programRef: PROGRAM }), appliedValueRef: 'value://td26p2/door',
      appliedValueDigest: product.sha256Canonical({ value: 'door' }) });
    assert.equal(`${applied.kind}:${applied.code}`, 'declaration_application_refusal:outside_view', handle);
  }
});

test('the generated contracts bind eight publications, no Consensus row and no Consensus vocabulary', async () => {
  const manifest = JSON.parse(await readFile(new URL('product-toolchain-manifest.json', `file://${packageRoot}`), 'utf8'));
  const bindings = manifest.contributionManifest.publicationBindings.map(({ moduleRef }) => moduleRef);
  assert.deepEqual(bindings.sort(), SHIPPED.map((name) => gtl[name](basis).moduleRef).sort());
  assert.equal(bindings.includes(MODULE), false);
  assert.equal(manifest.contributionManifest.rows.some(({ moduleRef }) => moduleRef === MODULE), false);
  const contractIds = manifest.publicContractCatalog.rows.map(({ contractId }) => contractId);
  for (const id of VOCABULARIES) {
    assert.equal(contractIds.includes(id), false, id);
    assert.equal(product.MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS.includes(id), false, id);
    await assert.rejects(stat(new URL(`contracts/vocabularies/${id.slice('abg.vocabulary.'.length)}.json`, `file://${packageRoot}`)), { code: 'ENOENT' }, id);
  }
  assert.equal(product.MANDATORY_SCHEMA_VOCABULARY_CORPUS_IDS.length, 42);
  // The schema contracts stay: they carry the Consensus capability of the register.
  const schemaRows = manifest.publicContractCatalog.rows.filter(({ assetLocator }) => assetLocator?.path === 'contracts/schemas/consensus.schema.json');
  assert.equal(schemaRows.length, 13);
  assert.ok(schemaRows.every(({ capabilityIdentities }) => capabilityIdentities.includes('abg.capability.graph-function.consensus@5')));
});
