import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const D=dirname(import.meta.dirname),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(name,value)=>fs.writeFileSync(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const operationBasisBytes=fs.readFileSync(join(D,'controls/operation-basis.json'));
assert.equal(createHash('sha256').update(operationBasisBytes).digest('hex'),'adc8cb93426b08877e44ea6484acf5e532ba73f182b54365d1ab308b20a2206b');
const operationBasis=JSON.parse(operationBasisBytes.toString('utf8'));
assert.equal(operationBasis.effectTerritory,D);
assert.equal(read(join(D,'activation.json')).activation,operationBasis.operation);
assert.equal(read(join(D,'activation.json')).actor,operationBasis.actor);
assert.equal(read(join(D,'construction-execution-grant.json')).actor,operationBasis.actor);
assert.equal(read(join(D,'construction-execution-grant.json')).activation,operationBasis.operation);
const input=read(join(D,'wrapper-comparison/inputs.json'));
const baseline=read(join(D,'wrapper-comparison/packaged-baseline-manifest.json'));
const beforeGraph=read(join(D,'wrapper-comparison/packaged-baseline-capability-graph.json'));
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
const triageBytes=fs.readFileSync(join(D,'controls/native-dependency-triage.json'));
assert.equal(createHash('sha256').update(triageBytes).digest('hex'),'ec98cd863ec170ec1190340f2a16439ab3c8125a6da0dd2a80824f9d67a39169');
const triage=JSON.parse(triageBytes.toString('utf8'));
assert.equal(input.declarationChangeTriageSHA256,createHash('sha256').update(triageBytes).digest('hex'));
const allowedChanged=new Map(triage.allowedExistingDeclarationDeltas.map(r=>[r.path,r]));
const allowedAdded=triage.allowedDeclarationAddition;
const archiveMembers=new Map(read(join(D,'final-archive-members.json')).map(r=>[r.path,r]));
const bodyCache=new Map();
function currentBody(path) {
  if(bodyCache.has(path))return bodyCache.get(path);
  const bytes=fs.readFileSync(join(selected.packageRoot,path)),meta=fs.lstatSync(join(selected.packageRoot,path)),archived=archiveMembers.get(path);
  assert.ok(meta.isFile()&&!meta.isSymbolicLink()&&archived,path);
  const record={path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),mode:meta.mode&0o777};
  assert.equal(record.bytes,archived.bytes,path);assert.equal(record.sha256,archived.sha256,path);assert.equal(record.mode,archived.archiveMode,path);
  bodyCache.set(path,record);return record;
}
function nativeRelation(old,row) {
  const oldShape=structuredClone(old),newShape=structuredClone(row);
  delete oldShape.contractDigest;delete newShape.contractDigest;
  delete oldShape.nativeTypedLocator.declarationInventory;delete newShape.nativeTypedLocator.declarationInventory;
  assert.deepEqual(newShape,oldShape,'complete stable native row fields '+old.contractId);
  const before=new Map(old.nativeTypedLocator.declarationInventory.map(m=>[m.declarationPath,m]));
  const after=new Map(row.nativeTypedLocator.declarationInventory.map(m=>[m.declarationPath,m]));
  assert.equal(after.size,row.nativeTypedLocator.declarationInventory.length,'unique actual native inventory');
  const changes=[],additions=[];
  for(const [path,prior] of before) {
    const member=after.get(path);assert.ok(member,'no existing native inventory removal '+path);
    const expected=allowedChanged.get(path);
    if(member.declarationDigest!==prior.declarationDigest) {
      assert.ok(expected,'only exact accepted declaration replacements '+path);
      assert.deepEqual(member,{...prior,declarationDigest:'sha256:'+expected.sha256},path);
      const body=currentBody(path);assert.equal(body.bytes,expected.bytes);assert.equal(body.mode,expected.mode);assert.equal(body.sha256,expected.sha256);
      changes.push({path,before:prior,after:member,body});
    } else assert.deepEqual(member,prior,'unaffected complete inventory tuple '+path);
  }
  for(const [path,member] of after) {
    const body=currentBody(path);assert.equal('sha256:'+body.sha256,member.declarationDigest,'fresh native inventory hash '+path);
    if(!before.has(path)) {
      assert.equal(path,allowedAdded.path,'only exact shared declaration addition');
      assert.deepEqual(Object.keys(member).sort(),['declarationDigest','declarationPath','packageExportPath']);
      assert.equal(member.packageExportPath,row.nativeTypedLocator.packageExportPath);
      assert.equal(member.declarationDigest,'sha256:'+allowedAdded.sha256);
      assert.equal(body.bytes,allowedAdded.bytes);assert.equal(body.mode,allowedAdded.mode);assert.equal(body.sha256,allowedAdded.sha256);
      additions.push({path,member,body});
    }
  }
  if(changes.length===0&&additions.length===0)assert.equal(row.contractDigest,old.contractDigest,'unchanged inventory implies unchanged native digest');
  return {contractId:row.contractId,structuralFieldsExact:true,beforeContractDigest:old.contractDigest,currentContractDigest:row.contractDigest,
    changed:product.canonicalJson(old)!==product.canonicalJson(row),beforeInventoryCount:before.size,currentInventoryCount:after.size,changes,additions,allCurrentInventoryHashesAndArchiveModesExact:true};
}
const beforeNative=baseline.publicContractCatalog.rows.filter(row=>row.nativeTypedLocator);
const afterNative=current.publicContractCatalog.rows.filter(row=>row.nativeTypedLocator);
assert.equal(afterNative.length,37);assert.equal(beforeNative.length,37);
assert.deepEqual(afterNative.map(r=>r.contractId).sort(),beforeNative.map(r=>r.contractId).sort(),'complete37native identity population');
const nativeRelations=beforeNative.map(old=>{const rows=afterNative.filter(row=>row.contractId===old.contractId);assert.equal(rows.length,1);return nativeRelation(old,rows[0]);});
const contracts=[];
for(const old of input.baselineRequiredContracts) {
  const matches=current.publicContractCatalog.rows.filter(row=>row.contractId===old.contractId);assert.equal(matches.length,1);
  const row=matches[0],declared=input.currentRequiredContracts.filter(r=>r.contractId===row.contractId);assert.equal(declared.length,1);assert.deepEqual(row,declared[0]);
  if(!old.nativeTypedLocator)assert.deepEqual(row,old,'serialized required schema row remains exact');
  contracts.push({contractId:old.contractId,before:old,after:row,completeCurrentRowAuthenticated:true,completeRowEqual:product.canonicalJson(old)===product.canonicalJson(row),nativeRelation:nativeRelations.find(r=>r.contractId===old.contractId)??null});
}
const historicalBodies=new Map(input.requiredBodyInventory.map(r=>[r.path,r]));
const bodies=[],bodyDeltas=[];
for(const member of input.currentRequiredBodyInventory) {
  const actual=currentBody(member.path);assert.equal(actual.sha256,member.sha256);assert.equal(actual.bytes,member.bytes);assert.equal(actual.mode,member.mode);assert.equal(member.mode,member.archiveMode);
  const old=historicalBodies.get(member.path);
  if(old) {
    if(old.sha256!==member.sha256||old.bytes!==member.bytes) {
      const expected=allowedChanged.get(member.path);assert.ok(expected,'only accepted existing required body delta');
      assert.equal(member.sha256,expected.sha256);assert.equal(member.bytes,expected.bytes);assert.equal(member.mode,expected.mode);
      bodyDeltas.push({path:member.path,before:old,current:member,kind:'accepted_declaration_replacement'});
    }
  } else {
    assert.equal(member.path,allowedAdded.path);assert.equal(member.sha256,allowedAdded.sha256);assert.equal(member.bytes,allowedAdded.bytes);assert.equal(member.mode,allowedAdded.mode);
    bodyDeltas.push({path:member.path,before:null,current:member,kind:'accepted_shared_declaration_addition'});
  }
  bodies.push({...member,currentInstalledAndArchivedExact:true});
}
assert.deepEqual([...historicalBodies.keys()].filter(path=>!bodies.some(r=>r.path===path)),[],'no historical required body removal');
// Keep the entire original coordinate population; recompute the full graph through
// the unchanged existing owner using only the actual new Product identity.
const coordinates=[...new Map(beforeGraph.rows.flatMap(row=>row.owningPublicContracts)
  .map(coordinate=>[product.canonicalJson(coordinate),coordinate])).values()];
assert.deepEqual(product.constructCapabilityDefinitionGraph(coordinates),beforeGraph,
  'current unchanged constructor reproduces complete actual packaged accepted baseline graph');
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
for(const prior of beforeGraph.rows) {
  const currentRow=afterGraph.rows.find(row=>row.capabilityId===prior.capabilityId);assert.ok(currentRow);
  const stable=row=>{const value=structuredClone(row);delete value.capabilityDefinitionDigest;delete value.capabilityDefinitionRef;delete value.owningPublicContracts;
    value.dependentCapabilities=value.dependentCapabilities.map(({capabilityId})=>({capabilityId}));return value;};
  assert.deepEqual(stable(currentRow),stable(prior),'full capability IDs/version/effects/proof/dependency identities preserved');
}

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
const result={status:'REQUIRED_WRAPPER_ROWS_COMPATIBLE',baseline:'actual packaged accepted baseline archive; not final-source inputs',baselineArchive:input.baselineArchive,current:selected.basis,originalWrapper:input.wrapperArchive,wrapperContentDigest:input.wrapperContentDigest,wrapperDependency:dependency,requiredContracts:contracts,requiredCapabilityRows:capabilities,completeCapabilityGraphComparison:{beforeGraphDigest:beforeGraph.graphDigest,afterGraphDigest:afterGraph.graphDigest,completeRows:afterGraph.rows.length,originalCoordinateCount:coordinates.length,oldGraphReproducedExactly:true,currentGraphReproducedExactly:true,currentCoordinateDerivation:'actual current catalog rows plus actual verified definition slots; current existing constructor',currentOwnerCoordinateCount:currentOwnerCoordinates.length,measuredOwnerCoordinateDeltas:ownerCoordinateDeltas,actualCatalogComparison:{before:baseline.publicContractCatalog.catalogDigest,after:current.publicContractCatalog.catalogDigest,beforeRows:baseline.publicContractCatalog.rows.length,afterRows:current.publicContractCatalog.rows.length,changedRows:catalogRowsDelta},completeDefinitionAndDependencyDigestsRederived:true},completeNativeRowsCompared:afterNative.length,completeNativeStructuralRelations:nativeRelations,changedNativeRows:nativeRelations.filter(r=>r.changed).map(r=>r.contractId),historicalRequiredBodyCount:input.requiredBodyInventory.length,currentRequiredBodyCount:bodies.length,requiredBodyDeltas:bodyDeltas,requiredPackagedBodies:bodies,wrapperHasNoNativeAdvertisement:input.originalWrapperPublicNativeRows===0,intrinsicWrapperRepackRequired:false,reason:'Required version/compatibility, contract and capability IDs are satisfied by the actual verified successor. Complete actual current required rows/bodies are authenticated. Historical predecessor equality is not a dependency; exact3pinned declarations and1shared addition are the only admitted native inventory deltas. Complete capability rows/graph are exactly the unchanged constructor result from the actual current catalog and verified definition coordinates; all changes are measured and all digests/dependencies recomputed.',limit:'Mechanical wrapper compatibility only. No actual new nominal wrapper verification, ProductEnvironment, Public singleton/mixed lock, ABG-admitted install or runtime qualification.'};
save('final-required-wrapper-rows.json',result);
console.log(JSON.stringify({status:result.status,contracts:contracts.length,capabilities:capabilities.length,requiredBodies:bodies.length,nativeRows:afterNative.length,capabilityRows:afterGraph.rows.length,intrinsicWrapperRepackRequired:false}));
