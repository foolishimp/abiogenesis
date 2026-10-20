import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root='/Users/jim/src/apps/abiogenesis',tenant=join(root,'build_tenants/abiogenesis/typescript'),phase=join(root,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/terminal-route-projection-successor-222');
const p=await import(pathToFileURL(join(tenant,'build/code/src/product/index.js')).href);
const {PUBLIC_OPERATION_CONTRACT_PROJECTIONS}=await import(pathToFileURL(join(tenant,'build/code/src/shared/public_function_family.js')).href);
const manifest=JSON.parse(await readFile(join(tenant,'product-toolchain-manifest.json'),'utf8'));
const catalog=manifest.publicContractCatalog,{catalogDigest,...catalogFields}=catalog;
assert.equal(p.sha256Canonical(catalogFields),catalogDigest);
assert.equal(p.sha256Canonical(manifest.contributionManifest),manifest.contributionManifestDigest);
const payload=[];for(const path of manifest.productRelativeLocators)payload.push({path,sha256:p.sha256Bytes(await readFile(join(tenant,path)))});
assert.equal(p.payloadInventoryDigest(payload),manifest.productContentDigest);
const coordinate={productId:manifest.productId,productContentDigest:manifest.productContentDigest,catalogId:catalog.catalogId,catalogVersion:catalog.catalogVersion,catalogDigest};
const flat=catalog.rows.map(row=>({contractCatalog:coordinate,flatRow:{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest},nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}}));
const byId=new Map(flat.map(row=>[row.flatRow.contractId,row]));
const slots=PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap(projection=>{const row=byId.get(projection.operationId);assert.ok(row);return projection.definitions.flatMap(definition=>[
 ['request',definition.requestContract],['result',definition.resultContract],['refusal',definition.refusalContract],...(definition.nonTerminalContract===null?[]:[['non_terminal',definition.nonTerminalContract]])].map(([slot,identity])=>({contractCatalog:row.contractCatalog,flatRow:row.flatRow,nestedSelector:{selectorKind:'operation_definition_slot',definitionKey:definition.definitionKey,slot,definitionRef:identity.definitionRef}})));});
const graph=p.constructCapabilityDefinitionGraph([...flat,...slots]);
const graphBytes=await readFile(join(tenant,p.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH));
assert.equal(Buffer.from(p.capabilityDefinitionGraphAssetBytes(graph)).equals(graphBytes),true);
assert.equal(p.sha256Bytes(graphBytes),manifest.capabilityDefinitionGraph.assetLocator.contentDigest);
const graphCoordinate=p.capabilityDefinitionGraphCoordinate(graph);
for(const[key,value]of Object.entries(graphCoordinate))assert.deepEqual(manifest.capabilityDefinitionGraph[key],value);
let assets=0,declaredInventoryMembers=0;
for(const row of catalog.rows){
 if(row.assetLocator){assert.equal(p.sha256Bytes(await readFile(join(tenant,row.assetLocator.path))),row.assetLocator.contentDigest);assets++;}
 const visit=async(value)=>{if(!value||typeof value!=='object')return;if(Array.isArray(value)){for(const child of value)await visit(child);return;}
  if(typeof value.declarationPath==='string'&&typeof value.declarationDigest==='string'&&value.declarationPath.endsWith('.d.ts')){assert.equal(p.sha256Bytes(await readFile(join(tenant,value.declarationPath))),value.declarationDigest);declaredInventoryMembers++;}
  for(const child of Object.values(value))await visit(child);};await visit(row);
}
const runtime=JSON.parse(await readFile(join(tenant,'contracts/schemas/native-runtime-observation.json'),'utf8'));
const abg=await import(pathToFileURL(join(tenant,'build/code/src/abg/index.js')).href);
assert.deepEqual(runtime.eventCalculus,abg.ROOT_EVENT_CALCULUS);
const result={kind:'bounded_deterministic_generation_parity',productContentDigest:manifest.productContentDigest,payloadMembers:payload.length,publicCatalogRows:catalog.rows.length,capabilityCount:graph.rows.length,catalogDigest,contributionManifestDigest:manifest.contributionManifestDigest,capabilityGraphCoordinate:manifest.capabilityDefinitionGraph,assetLocationsVerified:assets,declarationInventoryDigestLocationsVerified:declaredInventoryMembers,currentNativeRuntimeAssetMatchesOwnedEventCalculus:true,noBuildTestRuntimeAdmissionOrQualificationClaim:true};


const gt=await import(pathToFileURL(join(tenant,'build/code/src/gtl/index.js')).href);
const archive=JSON.parse(await readFile(join(root,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-30/archive.json'),'utf8')).archive;
const publicationBasis={productId:manifest.productId,artifactDigest:'sha256:'+archive.sha256,productContentDigest:manifest.productContentDigest,productManifestDigest:p.sha256Canonical(manifest),packageName:manifest.packageName,packageVersion:manifest.packageVersion};
const before=JSON.parse(await readFile(join(root,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/candidate-29/scratch/successor/package/product-toolchain-manifest.json'),'utf8'));
// Exact selected declaration changes and complete canonical owner catalog binding; no arbitrary digest omission.
const generated=JSON.parse(await readFile(join(phase,'generated-delta.json'),'utf8')),changedDeclarations=new Set(generated.changedDeclarations);
const catalogDifferences=[];const diff=(x,y,path='')=>{if(p.canonicalJson(x)===p.canonicalJson(y))return;if(x!==null&&y!==null&&typeof x==='object'&&typeof y==='object'){assert.deepEqual(Object.keys(x),Object.keys(y));for(const key of Object.keys(x))diff(x[key],y[key],path+'/'+key);}else{const parts=path.split('/'),last=parts.at(-1);assert.ok(['catalogDigest','declarationDigest','contractDigest'].includes(last),path);if(last==='declarationDigest'){assert.equal(parts[3],'nativeTypedLocator');assert.equal(parts[4],'declarationInventory');assert.ok(changedDeclarations.has(catalog.rows[Number(parts[2])].nativeTypedLocator.declarationInventory[Number(parts[5])].declarationPath),path);}if(last==='contractDigest')assert.equal(catalog.rows[Number(parts[2])].contractKind,'native_typed_group');catalogDifferences.push({path,before:x,after:y});}};diff(before.publicContractCatalog,manifest.publicContractCatalog);
await writeFile(join(phase,'public-catalog-diff.json'),JSON.stringify({rowCounts:[before.publicContractCatalog.rows.length,catalog.rows.length],differenceCount:catalogDifferences.length,differences:catalogDifferences,nonDigestMetadataUnchanged:true},null,2)+'\n');
// Reconstruct the complete canonical contribution value, not a digest-stripped equality.
const pubs=[gt.constructDefaultGovernanceLibraryModulePublication,gt.constructConsensusModulePublication,gt.constructWorksiteConstructionModulePublication,gt.constructWorksiteCommandExecutionModulePublication,gt.constructNativeWorkspaceWorkModulePublication,gt.constructWorksiteCommandForwardModulePublication,gt.constructRequirementHandoffModulePublication,gt.constructSemanticStageModulePublication,gt.constructSemanticRevisionModulePublication,gt.constructSelfConformanceModulePublication].map(f=>f(publicationBasis));
const suffix=manifest.productContentDigest.slice(7),descriptorRef=`descriptor://abiogenesis/typescript-tenant/${suffix}`,contributionManifestRef=`contribution-manifest://abiogenesis/conformance/${suffix}`,provenanceRef=`provenance://abiogenesis/typescript-tenant/${suffix}`;
const publicationBindings=pubs.map(pub=>({moduleRef:pub.moduleRef,publicationDigest:p.modulePublicationSemanticDigest(pub)})).sort((x,y)=>x.moduleRef.localeCompare(y.moduleRef));
const contributionRows=pubs.flatMap(pub=>pub.contributions.map(c=>({moduleRef:pub.moduleRef,handle:c.handle,kind:c.kind,declarationOrContractRef:c.declarationOrContractRef,owningProductId:c.owningProductId,programMembershipRefs:[...c.programMembershipRefs],compatibilityRefs:[...c.compatibilityRefs],provenanceRef,readinessPrerequisiteRefs:[...c.readinessPrerequisiteRefs]}))).sort((x,y)=>{const a=x.moduleRef+'\0'+x.handle,b=y.moduleRef+'\0'+y.handle;return a<b?-1:a>b?1:0;});
const contribution={kind:'product_contribution_manifest',schemaVersion:'5.0.0',contributionManifestRef,productId:manifest.productId,productVersion:manifest.packageVersion,descriptorRef,productContentDigest:manifest.productContentDigest,publicContractCatalogId:catalog.catalogId,publicContractCatalogDigest:catalog.catalogDigest,capabilityDefinitionGraph:graphCoordinate,publicationBindings,rows:contributionRows};assert.deepEqual(contribution,manifest.contributionManifest);assert.equal(p.sha256Canonical(contribution),manifest.contributionManifestDigest);assert.equal(manifest.descriptorRef,descriptorRef);assert.equal(manifest.contributionManifestRef,contributionManifestRef);assert.equal(manifest.provenanceRef,provenanceRef);
const leafDifferences=[];const allDiff=(x,y,path='')=>{if(p.canonicalJson(x)===p.canonicalJson(y))return;if(x!==null&&y!==null&&typeof x==='object'&&typeof y==='object'){assert.deepEqual(Object.keys(x),Object.keys(y));for(const key of Object.keys(x))allDiff(x[key],y[key],path+'/'+key);}else leafDifferences.push({path,before:x,after:y});};allDiff(before.contributionManifest,manifest.contributionManifest);
await writeFile(join(phase,'contribution-diff.json'),JSON.stringify({publicationCount:publicationBindings.length,contributionCount:contributionRows.length,differenceCount:leafDifferences.length,differences:leafDifferences,completeValueCanonicallyReconstructed:true},null,2)+'\n');
const extended={...result,canonicalManifestDigest:p.sha256Canonical(manifest),rawManifestDigest:p.sha256Bytes(await readFile(join(tenant,'product-toolchain-manifest.json'))),catalogDifferenceCount:catalogDifferences.length,publicNonDigestMetadataUnchanged:true,publications:publicationBindings.length,contributions:contributionRows.length,contributionDifferenceCount:leafDifferences.length,completeContributionValueReconstructed:true};
await writeFile(join(phase,'essential-parity.json'),JSON.stringify(extended,null,2)+'\n');process.stdout.write(JSON.stringify(extended)+'\n');
