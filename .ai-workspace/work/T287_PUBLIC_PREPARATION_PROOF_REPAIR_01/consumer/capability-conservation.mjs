// Mechanical projection proof through the published canonical owners.
// No capability definition, generator, Runtime or qualification is authored.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as product from '@abiogenesis/typescript-tenant/product';
import {PUBLIC_OPERATION_CONTRACT_PROJECTIONS} from '@abiogenesis/typescript-tenant/app/m04';

const root=process.env.ABI5_PUBLIC_PREPARATION_PACKAGE_ROOT;
assert(root);
assert.equal(fileURLToPath(import.meta.resolve('@abiogenesis/typescript-tenant/product')),join(root,'build/code/src/product/index.js'));
const prior='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_G2_SEMANTIC_ASSEMBLY_TUPLE_REPAIR_01/stage/build_tenants/abiogenesis/typescript';
const json=(base,path)=>JSON.parse(readFileSync(join(base,path)));
const oldManifest=json(prior,'product-toolchain-manifest.json'),manifest=json(root,'product-toolchain-manifest.json');
const oldGraph=json(prior,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH),graphBytes=readFileSync(join(root,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH)),graph=JSON.parse(graphBytes);
function basis(m){
 const catalog=m.publicContractCatalog, contractCatalog={productId:m.productId,productContentDigest:m.productContentDigest,catalogId:catalog.catalogId,catalogVersion:catalog.catalogVersion,catalogDigest:catalog.catalogDigest};
 const flat=catalog.rows.map(row=>({contractCatalog,flatRow:{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest},nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}}));
 const byId=new Map(flat.map(value=>[value.flatRow.contractId,value]));
 const slots=PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap(projection=>{
  const owner=byId.get(projection.operationId);assert(owner,projection.operationId);
  return projection.definitions.flatMap(definition=>[
   ['request',definition.requestContract],['result',definition.resultContract],['refusal',definition.refusalContract],
   ...(definition.nonTerminalContract===null?[]:[['non_terminal',definition.nonTerminalContract]])
  ].map(([slot,identity])=>({contractCatalog:owner.contractCatalog,flatRow:owner.flatRow,nestedSelector:{selectorKind:'operation_definition_slot',definitionKey:definition.definitionKey,slot,definitionRef:identity.definitionRef}})));
 });
 return [...flat,...slots];
}
assert.deepEqual(product.constructCapabilityDefinitionGraph(basis(manifest)),graph,'actual capability owner must reproduce the exact published graph');
assert.deepEqual(product.constructCapabilityDefinitionGraph(basis(oldManifest)),oldGraph,'the same unchanged owner and operation definitions reproduce the accepted predecessor');
assert.equal(product.isCapabilityDefinitionGraph(graph),true);
assert.equal(product.capabilityDefinitionGraphDigest(graph),graph.graphDigest);
assert.equal(Buffer.compare(Buffer.from(product.capabilityDefinitionGraphAssetBytes(graph)),graphBytes),0);
const coordinate=product.capabilityDefinitionGraphCoordinate(graph);
assert.deepEqual(manifest.contributionManifest.capabilityDefinitionGraph,coordinate);
assert.deepEqual({graphId:manifest.capabilityDefinitionGraph.graphId,graphVersion:manifest.capabilityDefinitionGraph.graphVersion,graphDigest:manifest.capabilityDefinitionGraph.graphDigest},coordinate);
assert.equal(product.sha256Bytes(graphBytes),manifest.capabilityDefinitionGraph.assetLocator.contentDigest);
assert.equal(manifest.capabilityDefinitionGraph.assetLocator.path,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH);
assert.deepEqual(graph.rows.map(row=>row.capabilityId).sort(),[...product.MANDATORY_ABI5_CAPABILITY_IDS].sort());
function meaning(value){
 return {kind:value.kind,schemaVersion:value.schemaVersion,graphId:value.graphId,graphVersion:value.graphVersion,rows:value.rows.map(row=>{
  const {capabilityDefinitionRef,capabilityDefinitionDigest,owningPublicContracts,dependentCapabilities,...rest}=row;
  return {...rest,dependentCapabilities:dependentCapabilities.map(dependency=>dependency.capabilityId),owningPublicContracts:owningPublicContracts.map(owner=>({contractCatalog:{productId:owner.contractCatalog.productId,catalogId:owner.contractCatalog.catalogId,catalogVersion:owner.contractCatalog.catalogVersion},flatRow:{contractId:owner.flatRow.contractId,contractVersion:owner.flatRow.contractVersion},nestedSelector:owner.nestedSelector}))};
 })};
}
assert.deepEqual(meaning(graph),meaning(oldGraph),'capability identities, semantic membership, selectors, requirements, effects and dependent capability identities must be conserved');
let ownerCoordinates=0;
for(const row of graph.rows)for(const owner of row.owningPublicContracts){
 ownerCoordinates++;
 const published=manifest.publicContractCatalog.rows.find(value=>value.contractId===owner.flatRow.contractId);assert(published);
 assert.deepEqual(owner.flatRow,{contractId:published.contractId,contractVersion:published.contractVersion,contractDigest:published.contractDigest});
 assert.equal(owner.contractCatalog.catalogDigest,manifest.publicContractCatalog.catalogDigest);
 assert.equal(owner.contractCatalog.productContentDigest,manifest.productContentDigest);
}
function leafChanges(a,b){
 if(a!==null&&b!==null&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].reduce((sum,key)=>sum+leafChanges(a[key],b[key]),0);
 return a===b?0:1;
}
console.log(JSON.stringify({actualOwnerGraphReproduced:true,predecessorReproducedBySameOwner:true,semanticMembershipPreserved:true,capabilities:graph.rows.length,ownerCoordinates,changedIdentityAndCatalogLeaves:leafChanges(oldGraph,graph),capabilityGraphDigest:graph.graphDigest,graphAssetDigest:product.sha256Bytes(graphBytes),catalogDigest:manifest.publicContractCatalog.catalogDigest,productContentDigest:manifest.productContentDigest,runtimeCalls:0,qualificationClaims:0}));
