import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root='/Users/jim/src/apps/abiogenesis',tenant=join(root,'build_tenants/abiogenesis/typescript'),phase=join(root,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-joint-build-64');
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
for(const rel of ['product/default_library.js','abg/default_library.js','product/semantic_stage.js'])assert.deepEqual(await readFile(join(tenant,'build/code/src',rel)),await readFile(join(root,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/crosscut-source-context-repair-62/isolated/build/code/src',rel)));
const result={kind:'bounded_deterministic_generation_parity',productContentDigest:manifest.productContentDigest,payloadMembers:payload.length,publicCatalogRows:catalog.rows.length,capabilityIds:graph.rows.map(r=>r.capabilityId),catalogDigest,contributionManifestDigest:manifest.contributionManifestDigest,capabilityGraphCoordinate:manifest.capabilityDefinitionGraph,assetLocationsVerified:assets,declarationInventoryDigestLocationsVerified:declaredInventoryMembers,source62EmittedJavaScriptExact:3,currentNativeRuntimeAssetMatchesOwnedEventCalculus:true,noBuildTestRuntimeAdmissionOrQualificationClaim:true};
await writeFile(join(phase,'essential-parity.json'),JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result)+'\n');
