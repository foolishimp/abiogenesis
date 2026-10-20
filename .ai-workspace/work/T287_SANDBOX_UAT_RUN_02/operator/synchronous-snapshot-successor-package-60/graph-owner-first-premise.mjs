import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const work='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const product=await import(pathToFileURL(work+'/candidate-19/scratch/successor/package/build/code/src/product/index.js'));
const {PUBLIC_OPERATION_CONTRACT_PROJECTIONS}=await import(pathToFileURL(work+'/candidate-19/scratch/successor/package/build/code/src/shared/public_function_family.js'));
const results=[];
for(const number of [18,19]) {
  const root=work+'/candidate-'+number+'/scratch/successor/package';
  const manifest=JSON.parse(await readFile(root+'/product-toolchain-manifest.json','utf8'));
  const graph=JSON.parse(await readFile(root+'/contracts/capabilities/capability-definition-graph.json','utf8'));
  const contractCatalog={productId:manifest.productId,productContentDigest:manifest.productContentDigest,catalogId:manifest.publicContractCatalog.catalogId,catalogVersion:manifest.publicContractCatalog.catalogVersion,catalogDigest:manifest.publicContractCatalog.catalogDigest};
  const flat=manifest.publicContractCatalog.rows.map(row=>({contractCatalog,flatRow:{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest},nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}}));
  const rows=new Map(flat.map(row=>[row.flatRow.contractId,row]));
  const nested=PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap(projection=>{
    const row=rows.get(projection.operationId);assert.ok(row);
    return projection.definitions.flatMap(definition=>[
      ['request',definition.requestContract],['result',definition.resultContract],['refusal',definition.refusalContract],
      ...(definition.nonTerminalContract===null?[]:[['non_terminal',definition.nonTerminalContract]])
    ].map(([slot,identity])=>({contractCatalog:row.contractCatalog,flatRow:row.flatRow,nestedSelector:{selectorKind:'operation_definition_slot',definitionKey:definition.definitionKey,slot,definitionRef:identity.definitionRef}})));
  });
  const expected=product.constructCapabilityDefinitionGraph([...flat,...nested]);
  assert.deepEqual(graph,expected,'complete canonical graph '+number);
  assert.deepEqual(await readFile(root+'/contracts/capabilities/capability-definition-graph.json'),product.capabilityDefinitionGraphAssetBytes(expected),'canonical graph bytes '+number);
  results.push({candidate:number,graphDigest:product.capabilityDefinitionGraphCoordinate(expected).graphDigest,flatCount:flat.length,nestedCount:nested.length,graphRows:graph.rows.length,exactCanonicalValueAndBytes:true});
}
await writeFile(work+'/candidate-19/graph-owner-derivation.json',JSON.stringify({ownerRoute:'generator1030–1117 / product.constructCapabilityDefinitionGraph / public_function_family original projections',results,noFieldOmission:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(results));
