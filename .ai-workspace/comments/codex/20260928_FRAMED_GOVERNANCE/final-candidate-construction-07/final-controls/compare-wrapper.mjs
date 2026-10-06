import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=dirname(import.meta.dirname),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(read(join(D,'construction-execution-grant.json')).activation,'T287_RC1_SUCCESSOR_CONSTRUCTION_07');
const input=read(join(D,'wrapper-comparison/inputs.json'));
const baseline=read(join(D,'wrapper-comparison/packaged-C06-manifest.json'));
const beforeGraph=read(join(D,'wrapper-comparison/packaged-C06-capability-graph.json'));
const wrapper=read(join(D,'wrapper-comparison/original-wrapper-manifest.json'));
const selected=read(join(D,'final-selected-core.json'));
const current=read(join(selected.packageRoot,'product-toolchain-manifest.json'));
const afterGraph=read(join(selected.packageRoot,current.capabilityDefinitionGraph.assetLocator.path));
const pkg=read(join(selected.packageRoot,'package.json'));
const product=await import(pathToFileURL(join(selected.packageRoot,pkg.exports['./product'].import)).href);
const dependency=input.wrapperDependency;
assert.equal(dependency.productId,current.productId);
assert.equal(dependency.packageVersion,current.packageVersion);
assert.ok(current.compatibilityRefs.includes(dependency.compatibilityRef));
assert.deepEqual(wrapper.declaredDependencies,[dependency]);
assert.equal(Object.hasOwn(dependency,'productContentDigest'),false);
assert.equal(Object.hasOwn(dependency,'requiredContractDigests'),false);
assert.equal(Object.hasOwn(dependency,'requiredCapabilityDigests'),false);
const contracts=[];
for(const old of input.baselineRequiredContracts) {
  const matches=current.publicContractCatalog.rows.filter(row=>row.contractId===old.contractId);assert.equal(matches.length,1);
  assert.deepEqual(matches[0],old,'complete packaged required contract row '+old.contractId);
  contracts.push({contractId:old.contractId,before:old,after:matches[0],completeRowEqual:true});
}
const beforeNative=baseline.publicContractCatalog.rows.filter(row=>row.nativeTypedLocator);
const afterNative=current.publicContractCatalog.rows.filter(row=>row.nativeTypedLocator);
assert.deepEqual(afterNative,beforeNative,'complete actual 37 native contract rows, including locators/inventories and capability identities');
assert.equal(afterNative.length,37);
const bodies=[];
for(const member of input.requiredBodyInventory) {
  const bytes=fs.readFileSync(join(selected.packageRoot,member.path));
  assert.equal(product.sha256Bytes(bytes),'sha256:'+member.sha256,member.path);
  assert.equal(bytes.length,member.bytes,member.path);
  bodies.push({...member,C07InstalledExact:true});
}
// Keep the entire original coordinate population; recompute the full graph through
// the unchanged existing owner using only the actual new Product identity.
const coordinates=[...new Map(beforeGraph.rows.flatMap(row=>row.owningPublicContracts)
  .map(coordinate=>[product.canonicalJson(coordinate),coordinate])).values()];
assert.deepEqual(product.constructCapabilityDefinitionGraph(coordinates),beforeGraph,
  'current unchanged constructor reproduces complete actual packaged C06 graph');
const catalogCoordinate={productId:current.productId,productContentDigest:current.productContentDigest,
  catalogId:current.publicContractCatalog.catalogId,catalogVersion:current.publicContractCatalog.catalogVersion,
  catalogDigest:current.publicContractCatalog.catalogDigest};
const flatCurrent=current.publicContractCatalog.rows.map(row=>({contractCatalog:catalogCoordinate,
  flatRow:{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest},
  nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}}));
const verifiedDefinitions=read(join(D,'final-reader-binding.json')).definitionContractCoordinatesOverride;
const nestedCurrent=verifiedDefinitions.operations.flatMap(operation=>operation.members.flatMap(member=>
  Object.values(member.slots).filter(coordinate=>coordinate!==null)));
for(const coordinate of nestedCurrent) {
  assert.deepEqual(coordinate.contractCatalog,catalogCoordinate,'actual current verified operation-slot catalog basis');
  const row=current.publicContractCatalog.rows.find(row=>row.contractId===coordinate.flatRow.contractId);assert.ok(row);
  assert.deepEqual(coordinate.flatRow,{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest});
}
const expected=product.constructCapabilityDefinitionGraph([...flatCurrent,...nestedCurrent]);
assert.deepEqual(afterGraph,expected,'complete actual current graph from current catalog and actual verified definition slots');
const currentOwnerCoordinates=[...new Map(expected.rows.flatMap(row=>row.owningPublicContracts)
  .map(coordinate=>[product.canonicalJson(coordinate),coordinate])).values()];
assert.equal(expected.rows.length,16);assert.equal(currentOwnerCoordinates.length,196);
const selectorKey=coordinate=>product.canonicalJson({contractId:coordinate.flatRow.contractId,nestedSelector:coordinate.nestedSelector});
assert.deepEqual(currentOwnerCoordinates.map(selectorKey).sort(),coordinates.map(selectorKey).sort(),'complete existing owner/interface selector population');
const oldOwners=new Map(coordinates.map(coordinate=>[selectorKey(coordinate),coordinate]));
const ownerCoordinateDeltas=currentOwnerCoordinates.filter(coordinate=>product.canonicalJson(coordinate)!==product.canonicalJson(oldOwners.get(selectorKey(coordinate))))
  .map(coordinate=>({selectorKey:selectorKey(coordinate),before:oldOwners.get(selectorKey(coordinate)),after:coordinate}));
const catalogRowsDelta=current.publicContractCatalog.rows.filter(row=>product.canonicalJson(row)!==product.canonicalJson(baseline.publicContractCatalog.rows.find(old=>old.contractId===row.contractId)??null))
  .map(row=>({contractId:row.contractId,before:baseline.publicContractCatalog.rows.find(old=>old.contractId===row.contractId)??null,after:row}));
const capabilities=[];
for(const old of input.baselineRequiredCapabilities) {
  const actual=afterGraph.rows.filter(row=>row.capabilityId===old.capabilityId),expectedRow=expected.rows.filter(row=>row.capabilityId===old.capabilityId);
  assert.equal(actual.length,1);assert.equal(expectedRow.length,1);assert.deepEqual(actual[0],expectedRow[0]);
  assert.ok(current.declaredCapabilityRefs.includes(old.capabilityId));
  capabilities.push({capabilityId:old.capabilityId,before:old,after:actual[0],actualCompleteConstructorReboundRowEqual:true});
}
const result={status:'REQUIRED_WRAPPER_ROWS_COMPATIBLE',baseline:'actual packaged C06 archive; not final-source inputs',baselineArchive:input.baselineArchive,current:selected.basis,originalWrapper:input.wrapperArchive,wrapperContentDigest:input.wrapperContentDigest,wrapperDependency:dependency,requiredContracts:contracts,requiredCapabilityRows:capabilities,completeCapabilityGraphComparison:{beforeGraphDigest:beforeGraph.graphDigest,afterGraphDigest:afterGraph.graphDigest,completeRows:afterGraph.rows.length,originalCoordinateCount:coordinates.length,oldGraphReproducedExactly:true,currentGraphReproducedExactly:true,currentCoordinateDerivation:'actual current catalog rows plus actual verified definition slots; current existing constructor',currentOwnerCoordinateCount:currentOwnerCoordinates.length,measuredOwnerCoordinateDeltas:ownerCoordinateDeltas,actualCatalogComparison:{before:baseline.publicContractCatalog.catalogDigest,after:current.publicContractCatalog.catalogDigest,beforeRows:baseline.publicContractCatalog.rows.length,afterRows:current.publicContractCatalog.rows.length,changedRows:catalogRowsDelta},completeDefinitionAndDependencyDigestsRederived:true},completeNativeRowsCompared:afterNative.length,requiredPackagedBodies:bodies,wrapperHasNoNativeAdvertisement:input.originalWrapperPublicNativeRows===0,intrinsicWrapperRepackRequired:false,reason:'Required version/compatibility, contract and capability IDs are satisfied by the actual verified successor. Required full contract rows and 308 packaged bodies are conserved. Complete capability rows/graph are exactly the unchanged constructor result from the actual current catalog and verified definition coordinates; all changes are measured and all digests/dependencies recomputed.',limit:'Mechanical wrapper compatibility only. No actual new nominal wrapper verification, ProductEnvironment, Public singleton/mixed lock, ABG-admitted install or runtime qualification.'};
save('final-required-wrapper-rows.json',result);
console.log(JSON.stringify({status:result.status,contracts:contracts.length,capabilities:capabilities.length,requiredBodies:bodies.length,nativeRows:afterNative.length,capabilityRows:afterGraph.rows.length,intrinsicWrapperRepackRequired:false}));
