import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=dirname(import.meta.dirname),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(read(join(D,'construction-execution-grant.json')).activation,'T287_RC1_SUCCESSOR_CONSTRUCTION_06');
const input=read(join(D,'wrapper-comparison/inputs.json'));
const baseline=read(join(D,'wrapper-comparison/packaged-C05-manifest.json'));
const beforeGraph=read(join(D,'wrapper-comparison/packaged-C05-capability-graph.json'));
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
  bodies.push({...member,C06InstalledExact:true});
}
// Keep the entire original coordinate population; recompute the full graph through
// the unchanged existing owner using only the actual new Product identity.
const coordinates=[...new Map(beforeGraph.rows.flatMap(row=>row.owningPublicContracts)
  .map(coordinate=>[product.canonicalJson(coordinate),coordinate])).values()];
assert.deepEqual(product.constructCapabilityDefinitionGraph(coordinates),beforeGraph,
  'current unchanged constructor reproduces complete actual packaged C05 graph');
const rebound=coordinates.map(coordinate=>{
  const old=coordinate.contractCatalog;
  assert.equal(old.productId,baseline.productId);
  assert.equal(old.productContentDigest,baseline.productContentDigest);
  assert.equal(old.catalogId,current.publicContractCatalog.catalogId);
  assert.equal(old.catalogDigest,current.publicContractCatalog.catalogDigest);
  assert.equal(old.catalogVersion,current.publicContractCatalog.catalogVersion);
  return {...coordinate,contractCatalog:{...old,productContentDigest:current.productContentDigest}};
});
const expected=product.constructCapabilityDefinitionGraph(rebound);
assert.deepEqual(afterGraph,expected,'complete capability graph is the existing constructor relation at the sole new Product-content coordinate');
const capabilities=[];
for(const old of input.baselineRequiredCapabilities) {
  const actual=afterGraph.rows.filter(row=>row.capabilityId===old.capabilityId),expectedRow=expected.rows.filter(row=>row.capabilityId===old.capabilityId);
  assert.equal(actual.length,1);assert.equal(expectedRow.length,1);assert.deepEqual(actual[0],expectedRow[0]);
  assert.ok(current.declaredCapabilityRefs.includes(old.capabilityId));
  capabilities.push({capabilityId:old.capabilityId,before:old,after:actual[0],actualCompleteConstructorReboundRowEqual:true});
}
const result={status:'REQUIRED_WRAPPER_ROWS_COMPATIBLE',baseline:'actual packaged C05 archive; not final-source inputs',baselineArchive:input.baselineArchive,current:selected.basis,originalWrapper:input.wrapperArchive,wrapperContentDigest:input.wrapperContentDigest,wrapperDependency:dependency,requiredContracts:contracts,requiredCapabilityRows:capabilities,completeCapabilityGraphComparison:{beforeGraphDigest:beforeGraph.graphDigest,afterGraphDigest:afterGraph.graphDigest,completeRows:afterGraph.rows.length,originalCoordinateCount:coordinates.length,oldGraphReproducedExactly:true,currentGraphReproducedExactly:true,onlyCoordinateRebinding:{path:'owningPublicContracts[*].contractCatalog.productContentDigest',before:baseline.productContentDigest,after:current.productContentDigest},completeDefinitionAndDependencyDigestsRederived:true},completeNativeRowsCompared:afterNative.length,requiredPackagedBodies:bodies,wrapperHasNoNativeAdvertisement:input.originalWrapperPublicNativeRows===0,intrinsicWrapperRepackRequired:false,reason:'Required version/compatibility, contract and capability IDs are satisfied by the actual verified successor. Required full contract rows and 308 packaged bodies are conserved. Complete capability rows/graph are exactly the unchanged constructor result at the new Product-content coordinate; all digests and dependent coordinates are recomputed.',limit:'Mechanical wrapper compatibility only. No actual new nominal wrapper verification, ProductEnvironment, Public singleton/mixed lock, ABG-admitted install or runtime qualification.'};
save('final-required-wrapper-rows.json',result);
console.log(JSON.stringify({status:result.status,contracts:contracts.length,capabilities:capabilities.length,requiredBodies:bodies.length,nativeRows:afterNative.length,capabilityRows:afterGraph.rows.length,intrinsicWrapperRepackRequired:false}));
