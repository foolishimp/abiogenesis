import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as product from './stage/build_tenants/abiogenesis/typescript/build/code/src/product/index.js';
import * as gtl from './stage/build_tenants/abiogenesis/typescript/build/code/src/gtl/index.js';
import { PUBLIC_OPERATION_CONTRACT_PROJECTIONS } from './stage/build_tenants/abiogenesis/typescript/build/code/src/shared/public_function_family.js';
import { renderWorksiteCommandExecutionPrompt } from './stage/build_tenants/abiogenesis/typescript/build/code/src/product/worksite_command_execution.js';

const work = import.meta.dirname, tenant = join(work, 'stage/build_tenants/abiogenesis/typescript');
const baseline = join(work, '../combined-final-02/stage/build_tenants/abiogenesis/typescript');
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const a = await read(join(baseline, 'product-toolchain-manifest.json'));
const b = await read(join(tenant, 'product-toolchain-manifest.json'));
const graphPath = 'contracts/capabilities/capability-definition-graph.json';
const oldGraph = await read(join(baseline, graphPath)), newGraph = await read(join(tenant, graphPath));
const stableManifestFields = ['kind', 'schemaVersion', 'productId', 'packageName', 'packageVersion', 'publisherNamespace',
  'compatibilityRefs', 'declaredCapabilityRefs', 'declaredDependencies'];
for (const field of stableManifestFields) assert.deepEqual(a[field], b[field], field);

function coordinates(manifest) {
  const catalog = manifest.publicContractCatalog;
  const coordinate = { productId: manifest.productId, productContentDigest: manifest.productContentDigest,
    catalogId: catalog.catalogId, catalogVersion: catalog.catalogVersion, catalogDigest: catalog.catalogDigest };
  const flat = catalog.rows.map(row => ({ contractCatalog: coordinate,
    flatRow: { contractId: row.contractId, contractVersion: row.contractVersion, contractDigest: row.contractDigest },
    nestedSelector: { selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null } }));
  const slots = PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap(projection => {
    const source = flat.find(row => row.flatRow.contractId === projection.operationId);
    assert.ok(source);
    return projection.definitions.flatMap(definition => [
      ['request', definition.requestContract], ['result', definition.resultContract], ['refusal', definition.refusalContract],
      ...(definition.nonTerminalContract === null ? [] : [['non_terminal', definition.nonTerminalContract]]),
    ].map(([slot, identity]) => ({ contractCatalog: source.contractCatalog, flatRow: source.flatRow,
      nestedSelector: { selectorKind: 'operation_definition_slot', definitionKey: definition.definitionKey, slot, definitionRef: identity.definitionRef } })));
  });
  return [...flat, ...slots];
}

const material = [], ownerChecks = [];
for (const [label, root, manifest, graph] of [['baseline', baseline, a, oldGraph], ['candidate', tenant, b, newGraph]]) {
  const inventory = [];
  for (const path of manifest.productRelativeLocators) inventory.push({ path, sha256: product.sha256Bytes(await readFile(join(root, path))) });
  assert.equal(product.payloadInventoryDigest(inventory), manifest.productContentDigest);
  assert.equal(product.productPublicContractCatalogDigest(manifest.publicContractCatalog), manifest.publicContractCatalog.catalogDigest);
  const produced = product.constructCapabilityDefinitionGraph(coordinates(manifest));
  assert.deepEqual(produced, graph, label + ' exact capability owner construction');
  assert.deepEqual(product.capabilityDefinitionGraphCoordinate(graph), {
    graphId: manifest.capabilityDefinitionGraph.graphId, graphVersion: manifest.capabilityDefinitionGraph.graphVersion,
    graphDigest: manifest.capabilityDefinitionGraph.graphDigest });
  const graphBytes = await readFile(join(root, graphPath));
  assert.equal(product.sha256Bytes(graphBytes), manifest.capabilityDefinitionGraph.assetLocator.contentDigest);
  assert.equal(product.sha256Canonical(manifest.contributionManifest), manifest.contributionManifestDigest);
  const content = manifest.productContentDigest.slice('sha256:'.length);
  assert.equal(manifest.descriptorRef, 'descriptor://abiogenesis/typescript-tenant/' + content);
  assert.equal(manifest.contributionManifestRef, 'contribution-manifest://abiogenesis/conformance/' + content);
  assert.equal(manifest.provenanceRef, 'provenance://abiogenesis/typescript-tenant/' + content);
  ownerChecks.push({ label, payloadRows: inventory.length, productContentDigest: manifest.productContentDigest,
    catalogDigest: manifest.publicContractCatalog.catalogDigest, graphDigest: graph.graphDigest,
    contributionManifestDigest: manifest.contributionManifestDigest });
}

const oldCatalog = a.publicContractCatalog, newCatalog = b.publicContractCatalog, catalogRows = [], declarationChanges = new Map();
assert.equal(oldCatalog.rows.length, newCatalog.rows.length);
for (const key of Object.keys(oldCatalog)) if (!['rows', 'catalogDigest'].includes(key)) assert.deepEqual(oldCatalog[key], newCatalog[key], key);
for (let index = 0; index < oldCatalog.rows.length; index += 1) {
  const old = oldCatalog.rows[index], next = newCatalog.rows[index];
  assert.equal(old.contractId, next.contractId);
  const changedKeys = Object.keys(old).filter(key => product.canonicalJson(old[key]) !== product.canonicalJson(next[key]));
  assert.ok(changedKeys.every(key => ['contractDigest', 'nativeTypedLocator'].includes(key)), [old.contractId, changedKeys]);
  if (changedKeys.includes('nativeTypedLocator')) {
    const oi = old.nativeTypedLocator.declarationInventory, ni = next.nativeTypedLocator.declarationInventory;
    assert.equal(oi.length, ni.length);
    for (const key of Object.keys(old.nativeTypedLocator)) if (key !== 'declarationInventory')
      assert.deepEqual(old.nativeTypedLocator[key], next.nativeTypedLocator[key]);
    for (let n = 0; n < oi.length; n += 1) {
      assert.equal(oi[n].declarationPath, ni[n].declarationPath);
      assert.equal(oi[n].packageExportPath, ni[n].packageExportPath);
      assert.equal(product.sha256Bytes(await readFile(join(baseline, oi[n].declarationPath))), oi[n].declarationDigest);
      assert.equal(product.sha256Bytes(await readFile(join(tenant, ni[n].declarationPath))), ni[n].declarationDigest);
      if (oi[n].declarationDigest !== ni[n].declarationDigest) declarationChanges.set(ni[n].declarationPath, { before: oi[n], after: ni[n] });
    }
  }
  if (changedKeys.includes('contractDigest')) {
    assert.equal(old.contractDigest, product.sha256Canonical(old.nativeTypedLocator.declarationInventory));
    assert.equal(next.contractDigest, product.sha256Canonical(next.nativeTypedLocator.declarationInventory));
  }
  catalogRows.push({ contractId: old.contractId, unchangedExactly: changedKeys.length === 0, changedKeys,
    beforeDigest: old.contractDigest, afterDigest: next.contractDigest,
    relation: changedKeys.length === 0 ? 'exact equality' : 'exact native declaration bytes and owner inventory digest; every other row field equal' });
}
const ownedDeclarations = new Set(['abg/c_call_outcome', 'abg/event_calculus', 'abg/native_worksite_execution', 'abg/runtime_history',
  'hog/ccall_lifecycle', 'implementation/leaf_invocation_port', 'implementation/worksite_file_replace', 'abg/worksite_revision', 'abg/replay']
  .map(path => 'build/code/src/' + path + '.d.ts'));
for (const change of declarationChanges.values()) {
  const path = change.after.declarationPath; assert.ok(ownedDeclarations.has(path), path);
  const old = await readFile(join(baseline, path), 'utf8'), next = await readFile(join(tenant, path), 'utf8');
  const exports = text => [...text.matchAll(/^export (?:declare )?(?:type|interface|class|function|const|let|enum) ([A-Za-z0-9_]+)/gm)].map(row => row[1]);
  assert.deepEqual(exports(next), exports(old), path + ' existing public names');
  change.producer = 'single isolated TypeScript compile of the exact selected owning source; internal exports stripped; existing public names conserved';
  change.beforeBytes = Buffer.byteLength(old); change.afterBytes = Buffer.byteLength(next);
}

assert.equal(oldGraph.rows.length, newGraph.rows.length);
const graphRows = oldGraph.rows.map((old, index) => {
  const next = newGraph.rows[index];
  const identityKeys = ['capabilityDefinitionDigest', 'capabilityDefinitionRef', 'dependentCapabilities', 'owningPublicContracts'];
  for (const key of Object.keys(old)) if (!identityKeys.includes(key)) assert.deepEqual(old[key], next[key], old.capabilityId + '/' + key);
  assert.deepEqual(old.dependentCapabilities.map(x => x.capabilityId), next.dependentCapabilities.map(x => x.capabilityId));
  assert.equal(old.owningPublicContracts.length, next.owningPublicContracts.length);
  for (let i = 0; i < old.owningPublicContracts.length; i += 1) {
    const o = old.owningPublicContracts[i], n = next.owningPublicContracts[i];
    assert.deepEqual(o.nestedSelector, n.nestedSelector);
    assert.equal(o.flatRow.contractId, n.flatRow.contractId); assert.equal(o.flatRow.contractVersion, n.flatRow.contractVersion);
    for (const key of ['productId', 'catalogId', 'catalogVersion']) assert.equal(o.contractCatalog[key], n.contractCatalog[key]);
  }
  return { capabilityId: old.capabilityId, semanticFieldsExactlyEqual: true,
    identityRelation: 'both complete graphs exactly reconstructed by unchanged capability owner from each actual verified catalog coordinate' };
});

const zero = 'sha256:' + '0'.repeat(64);
const publicationBasis = manifest => ({ productId: manifest.productId, packageName: manifest.packageName, packageVersion: manifest.packageVersion,
  artifactDigest: zero, productContentDigest: manifest.productContentDigest, productManifestDigest: zero });
const factories = ['constructDefaultGovernanceLibraryModulePublication', 'constructConsensusModulePublication',
  'constructWorksiteConstructionModulePublication', 'constructWorksiteCommandExecutionModulePublication',
  'constructNativeWorkspaceWorkModulePublication', 'constructWorksiteCommandForwardModulePublication',
  'constructRequirementHandoffModulePublication', 'constructSemanticStageModulePublication',
  'constructSemanticRevisionModulePublication', 'constructSelfConformanceModulePublication'];
const baselineGtl = await import(pathToFileURL(join(baseline, 'build/code/src/gtl/index.js')));
const publicationChecks = [];
for (const [label, manifest, api] of [['baseline', a, baselineGtl], ['candidate', b, gtl]]) {
  const publications = factories.map(factory => api[factory](publicationBasis(manifest)));
  const bindings = publications.map(value => ({ moduleRef: value.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(value) }))
    .sort((left, right) => left.moduleRef.localeCompare(right.moduleRef));
  assert.deepEqual(bindings, manifest.contributionManifest.publicationBindings);
  publicationChecks.push({ label, bindings });
}
assert.equal(a.contributionManifest.rows.length, b.contributionManifest.rows.length);
for (let i = 0; i < a.contributionManifest.rows.length; i += 1) {
  const old = a.contributionManifest.rows[i], next = b.contributionManifest.rows[i];
  assert.equal(old.provenanceRef, a.provenanceRef); assert.equal(next.provenanceRef, b.provenanceRef);
  assert.deepEqual({ ...old, provenanceRef: b.provenanceRef }, next);
}

const publication = gtl.constructWorksiteCommandExecutionModulePublication(publicationBasis(b));
const environment = publication.runEnvironments[0];
for (const member of environment.contexts.flatMap(context => context.members)) {
  const bytes = await readFile(join(tenant, member.path));
  assert.equal(bytes.length, member.byteCount); assert.equal(product.sha256Bytes(bytes), member.digest);
  for (const role of environment.roles) for (const span of role.sourceBindings.filter(span => span.memberRef === member.memberRef)) {
    const slice = bytes.subarray(span.startByte, span.endByte);
    assert.equal(product.sha256Bytes(slice), span.spanDigest); assert.equal(slice.toString('utf8'), role.policy.text);
    assert.equal(role.policy.text, renderWorksiteCommandExecutionPrompt.toString());
    material.push({ member, span, rendererMatches: true });
  }
}
assert.equal(await readFile(join(tenant, gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.path), 'utf8'), gtl.WORKSITE_COMMAND_EXECUTION_CONTEXT_INVENTORY.content);
const oldLocators = new Set(a.productRelativeLocators), nextLocators = new Set(b.productRelativeLocators);
const addedLocators = [...nextLocators].filter(path => !oldLocators.has(path));
assert.deepEqual([...oldLocators].filter(path => !nextLocators.has(path)), []);
assert.deepEqual(addedLocators, []);
const result = { scope: 'pure construction and emitted member metadata only; no runtime, endpoint, installed or test workload',
  stableManifestFields, ownerChecks, catalogRows, declarationChanges: [...declarationChanges.values()], graphRows,
  publicationChecks, unchangedContributionRowsExceptExactProducerProvenance: a.contributionManifest.rows.length,
  material, addedLocators, noGlobalIdentityStripping: true };
await writeFile(join(work, 'metadata-correspondence.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ catalogRows: catalogRows.length, exactlyUnchangedCatalogRows: catalogRows.filter(x => x.unchangedExactly).length,
  capabilityRows: graphRows.length, changedDeclarationFiles: declarationChanges.size, publicationBindingsVerifiedPerSubject: factories.length,
  materialBindings: material.length, addedLocators, status: 'satisfied' }));
