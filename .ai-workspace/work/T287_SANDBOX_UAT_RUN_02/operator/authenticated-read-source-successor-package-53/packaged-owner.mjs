import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const work='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const candidate=work+'/candidate-18', packaged=candidate+'/scratch/successor/package';
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href);
const manifest=JSON.parse(await readFile(packaged+'/product-toolchain-manifest.json','utf8'));
const oldManifest=JSON.parse(await readFile(work+'/candidate-17/scratch/successor/package/product-toolchain-manifest.json','utf8'));
const comparison=JSON.parse(await readFile(candidate+'/member-delta.json','utf8'));
const declarationPath='build/code/src/abg/index.d.ts';
const declarations=await Promise.all([work+'/candidate-17/scratch/successor/package',packaged].map(async root=>product.sha256Bytes(await readFile(root+'/'+declarationPath))));
let catalogCount=0,inventoryCount=0,contractCount=0;
for(const difference of comparison.catalogDifferences) {
 const path=difference.path;let before=oldManifest.publicContractCatalog,after=manifest.publicContractCatalog;
 for(const segment of path){before=before[segment];after=after[segment];}
 assert.equal(before,difference.before);assert.equal(after,difference.after);
 if(path.length===1&&path[0]==='catalogDigest') {
  assert.equal(before,product.productPublicContractCatalogDigest(oldManifest.publicContractCatalog));assert.equal(after,product.productPublicContractCatalogDigest(manifest.publicContractCatalog));catalogCount++;
 }else if(path.length===6&&path[0]==='rows'&&path[2]==='nativeTypedLocator'&&path[3]==='declarationInventory'&&path[5]==='declarationDigest') {
  assert.equal(manifest.publicContractCatalog.rows[path[1]].nativeTypedLocator.declarationInventory[path[4]].declarationPath,declarationPath);
  assert.equal(before,declarations[0]);assert.equal(after,declarations[1]);inventoryCount++;
 }else if(path.length===3&&path[0]==='rows'&&path[2]==='contractDigest') {
  assert.equal(before,product.sha256Canonical(oldManifest.publicContractCatalog.rows[path[1]].nativeTypedLocator.declarationInventory));
  assert.equal(after,product.sha256Canonical(manifest.publicContractCatalog.rows[path[1]].nativeTypedLocator.declarationInventory));contractCount++;
 }else assert.fail('Unexpected catalog field '+JSON.stringify(path));
}
assert.deepEqual({catalogCount,inventoryCount,contractCount},{catalogCount:1,inventoryCount:47,contractCount:21});
assert.equal(product.productPublicContractCatalogDigest(manifest.publicContractCatalog),manifest.publicContractCatalog.catalogDigest);
assert.equal(product.productPublicContractCatalogDigest(oldManifest.publicContractCatalog),oldManifest.publicContractCatalog.catalogDigest);
const gtl=await import(pathToFileURL(packaged+'/build/code/src/gtl/index.js').href);
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructConsensusModulePublication','constructWorksiteConstructionModulePublication','constructWorksiteCommandExecutionModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandForwardModulePublication','constructRequirementHandoffModulePublication','constructSemanticStageModulePublication','constructSemanticRevisionModulePublication','constructSelfConformanceModulePublication'];
const canonicalConsequenceResults=[];
for(const [label,m,root]of [['before',oldManifest,work+'/candidate-17/scratch/successor/package'],['after',manifest,packaged]]){
 const contentIdentity=m.productContentDigest.slice(7),placeholder='sha256:'+'0'.repeat(64);
 const basis={productId:m.productId,artifactDigest:placeholder,productContentDigest:m.productContentDigest,productManifestDigest:placeholder,packageName:m.packageName,packageVersion:m.packageVersion};
 const publications=constructors.map(name=>gtl[name](basis));
 const publicationBindings=publications.map(publication=>({moduleRef:publication.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(publication)})).sort((a,b)=>a.moduleRef.localeCompare(b.moduleRef));
 const provenanceRef='provenance://abiogenesis/typescript-tenant/'+contentIdentity;
 const rows=publications.flatMap(publication=>publication.contributions.map(c=>({moduleRef:publication.moduleRef,handle:c.handle,kind:c.kind,declarationOrContractRef:c.declarationOrContractRef,owningProductId:c.owningProductId,programMembershipRefs:[...c.programMembershipRefs],compatibilityRefs:[...c.compatibilityRefs],provenanceRef,readinessPrerequisiteRefs:[...c.readinessPrerequisiteRefs]}))).sort((a,b)=>{const x=a.moduleRef+'\0'+a.handle,y=b.moduleRef+'\0'+b.handle;return x<y?-1:x>y?1:0;});
 const graph=JSON.parse(await readFile(root+'/contracts/capabilities/capability-definition-graph.json','utf8'));
 const expected={kind:'product_contribution_manifest',schemaVersion:'5.0.0',contributionManifestRef:'contribution-manifest://abiogenesis/conformance/'+contentIdentity,productId:m.productId,productVersion:m.packageVersion,descriptorRef:'descriptor://abiogenesis/typescript-tenant/'+contentIdentity,productContentDigest:m.productContentDigest,publicContractCatalogId:m.publicContractCatalog.catalogId,publicContractCatalogDigest:m.publicContractCatalog.catalogDigest,capabilityDefinitionGraph:product.capabilityDefinitionGraphCoordinate(graph),publicationBindings,rows};
 assert.deepEqual(m.contributionManifest,expected,label+' full canonical contribution owner value');
 assert.equal(m.contributionManifestDigest,product.sha256Canonical(expected));
 assert.equal(m.contributionManifestRef,expected.contributionManifestRef);assert.equal(m.descriptorRef,expected.descriptorRef);assert.equal(m.provenanceRef,provenanceRef);
 canonicalConsequenceResults.push({label,productContentDigest:m.productContentDigest,graphDigest:expected.capabilityDefinitionGraph.graphDigest,contributionManifestDigest:m.contributionManifestDigest,publicationBindingCount:publicationBindings.length,rowCount:rows.length,entireCanonicalValueExact:true});
}
assert.equal(manifest.publicContractCatalog.rows.length,75);
assert.equal(manifest.contributionManifest.publicationBindings.length,10);
assert.equal(manifest.contributionManifest.rows.length,47);
await writeFile(candidate+'/catalog-owner-derivation.json',JSON.stringify({catalogDigest:manifest.publicContractCatalog.catalogDigest,beforeCatalogDigest:oldManifest.publicContractCatalog.catalogDigest,allBeforeAndAfterCanonicallyRecomputed:true,exactCatalogFieldDifferenceCount:comparison.catalogDifferences.length,publicRows:75,publicationBindings:10,contributionRows:47,exactContributionIdentityCounts:comparison.contributionIdentityCounts,canonicalConsequenceResults,allOtherContributionFieldsEqual:true,exactCatalogCounts:{catalogCount,inventoryCount,contractCount},declarationPath,declarations,noArbitraryDigestOmission:true,ownerRoute:'product.productPublicContractCatalogDigest and verifyProduct'},null,2)+'\n',{flag:'wx'});
const archive=JSON.parse(await readFile(candidate+'/archive.json','utf8'));
const request={artifactPath:archive.archive.path,artifactRef:'abiogenesis-typescript-tenant-5.0.0-rc.1.tgz',expectedArtifactDigest:'sha256:'+archive.archive.sha256,expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:product.sha256Canonical(manifest),expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const startedAt=new Date().toISOString(),clock=performance.now();
const result=await product.verifyProduct(request);
const wallMs=performance.now()-clock;
const projection=Object.fromEntries(['kind','disposition','artifactDigest','productContentDigest','manifestDigest','catalogDigest','contributionManifestDigest','checkedPayloadFiles'].filter(key=>result[key]!==undefined).map(key=>[key,result[key]]));
await writeFile(candidate+'/owner-verification.json',JSON.stringify({request,projection,startedAt,finishedAt:new Date().toISOString(),wallMs,sourceBlindPackagedOwner:true,noInstallOrRun:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({projection,wallMs}));
assert.equal(result.kind,'verified_product_artifact');assert.equal(result.disposition,'verified');assert.equal(result.checkedPayloadFiles,5263);
