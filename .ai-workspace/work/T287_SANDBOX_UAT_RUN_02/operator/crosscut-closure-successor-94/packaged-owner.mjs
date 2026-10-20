import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const work='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02';
const candidate=work+'/candidate-21',packaged=candidate+'/scratch/successor/package';
const baseline=work+'/candidate-20/scratch/successor/package';
const inputs=JSON.parse(await readFile(work+'/operator/crosscut-closure-successor-94/inputs.json','utf8'));
const comparison=JSON.parse(await readFile(candidate+'/member-delta.json','utf8'));
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructConsensusModulePublication','constructWorksiteConstructionModulePublication','constructWorksiteCommandExecutionModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandForwardModulePublication','constructRequirementHandoffModulePublication','constructSemanticStageModulePublication','constructSemanticRevisionModulePublication','constructSelfConformanceModulePublication'];
const reports=[],publications=[];
for(const [label,root]of [['before',baseline],['after',packaged]]){
 const load=path=>import(pathToFileURL(join(root,'build/code/src',path+'.js')).href);
 const [p,gtl,exportsOwner,{PUBLIC_OPERATION_CONTRACT_PROJECTIONS}]=await Promise.all([load('product/index'),load('gtl/index'),load('product/declaration_exports'),load('shared/public_function_family')]);
 const m=JSON.parse(await readFile(root+'/product-toolchain-manifest.json','utf8')),pkg=JSON.parse(await readFile(root+'/package.json','utf8'));
 const closures=await exportsOwner.resolveNativeDeclarationClosures({packageName:pkg.name,packageType:pkg.type==='module'?'module':'commonjs',packageExports:pkg.exports,
  declarationSources:await Promise.all(m.productRelativeLocators.filter(x=>/\.d\.(?:c|m)?ts$/u.test(x)).map(async path=>({path,bytes:await readFile(join(root,path))}))),
  packageMetadataSources:await Promise.all(m.productRelativeLocators.filter(x=>x==='package.json'||x.endsWith('/package.json')).map(async path=>({path,bytes:await readFile(join(root,path))}))),sourceProductContentDigest:m.productContentDigest});
 assert.ok(closures);const byExport=new Map(closures.map(c=>[c.packageExportPath,c]));let typed=0,assets=0;
 for(const row of m.publicContractCatalog.rows){
  if(row.nativeTypedLocator){const l=row.nativeTypedLocator,c=byExport.get(l.packageExportPath);assert.ok(c);assert.deepEqual(l.declarationInventory,c.declarationInventory);assert.equal(l.declarationPath,c.declarationPath);assert.equal(l.packageName,pkg.name);assert.ok(c.exportedSymbols.includes(l.namedSymbol));typed++;if(row.contractKind==='native_typed_group')assert.equal(row.contractDigest,p.sha256Canonical(c.declarationInventory));}
  if(row.assetLocator){assert.equal(p.sha256Bytes(await readFile(join(root,row.assetLocator.path))),row.assetLocator.contentDigest);assets++;}
 }
 const proposals=p.derivePublicCatalogRowProposals(m.productId,pkg.name,byExport.get('./public')),ids=new Set(proposals.proposals.map(x=>x.contractId));
 const {catalogDigest,...catalogFields}=m.publicContractCatalog,extantFields={...catalogFields,rows:catalogFields.rows.filter(row=>!ids.has(row.contractId))};
 const extant={...extantFields,catalogDigest:p.sha256Canonical(extantFields)};
 const bound=p.bindS06PublicFunctionCatalog({extantCatalog:extant,extantCatalogCoordinate:{productId:m.productId,productContentDigest:m.productContentDigest,catalogId:extant.catalogId,catalogVersion:extant.catalogVersion,catalogDigest:extant.catalogDigest},productId:m.productId,productContentDigest:m.productContentDigest,proposalSequence:proposals.proposals,publicPackageName:pkg.name,publicDeclarationClosure:byExport.get('./public')});
 assert.equal(bound.disposition,'bound');assert.deepEqual(bound.catalog,m.publicContractCatalog);assert.equal(p.productPublicContractCatalogDigest(m.publicContractCatalog),catalogDigest);
 const coordinate={productId:m.productId,productContentDigest:m.productContentDigest,catalogId:m.publicContractCatalog.catalogId,catalogVersion:m.publicContractCatalog.catalogVersion,catalogDigest};
 const flat=m.publicContractCatalog.rows.map(row=>({contractCatalog:coordinate,flatRow:{contractId:row.contractId,contractVersion:row.contractVersion,contractDigest:row.contractDigest},nestedSelector:{selectorKind:'flat_contract',definitionKey:null,slot:null,definitionRef:null}}));
 const byId=new Map(flat.map(row=>[row.flatRow.contractId,row]));
 const slots=PUBLIC_OPERATION_CONTRACT_PROJECTIONS.flatMap(projection=>{const row=byId.get(projection.operationId);assert.ok(row);return projection.definitions.flatMap(definition=>[['request',definition.requestContract],['result',definition.resultContract],['refusal',definition.refusalContract],...(definition.nonTerminalContract===null?[]:[['non_terminal',definition.nonTerminalContract]])].map(([slot,identity])=>({contractCatalog:row.contractCatalog,flatRow:row.flatRow,nestedSelector:{selectorKind:'operation_definition_slot',definitionKey:definition.definitionKey,slot,definitionRef:identity.definitionRef}})));});
 const graph=p.constructCapabilityDefinitionGraph([...flat,...slots]),graphBytes=await readFile(join(root,p.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH));
 assert.equal(Buffer.from(p.capabilityDefinitionGraphAssetBytes(graph)).equals(graphBytes),true);assert.equal(p.sha256Bytes(graphBytes),m.capabilityDefinitionGraph.assetLocator.contentDigest);
 const graphCoordinate=p.capabilityDefinitionGraphCoordinate(graph);for(const[k,v]of Object.entries(graphCoordinate))assert.deepEqual(m.capabilityDefinitionGraph[k],v);
 const content=m.productContentDigest.slice(7),zero='sha256:'+'0'.repeat(64),basis={productId:m.productId,artifactDigest:zero,productContentDigest:m.productContentDigest,productManifestDigest:zero,packageName:m.packageName,packageVersion:m.packageVersion};
 const pubs=constructors.map(name=>gtl[name](basis));publications.push(pubs);
 const publicationBindings=pubs.map(pub=>({moduleRef:pub.moduleRef,publicationDigest:p.modulePublicationSemanticDigest(pub)})).sort((a,b)=>a.moduleRef.localeCompare(b.moduleRef));
 const provenanceRef='provenance://abiogenesis/typescript-tenant/'+content;
 const rows=pubs.flatMap(pub=>pub.contributions.map(c=>({moduleRef:pub.moduleRef,handle:c.handle,kind:c.kind,declarationOrContractRef:c.declarationOrContractRef,owningProductId:c.owningProductId,programMembershipRefs:[...c.programMembershipRefs],compatibilityRefs:[...c.compatibilityRefs],provenanceRef,readinessPrerequisiteRefs:[...c.readinessPrerequisiteRefs]}))).sort((a,b)=>{const x=a.moduleRef+'\0'+a.handle,y=b.moduleRef+'\0'+b.handle;return x<y?-1:x>y?1:0;});
 const expected={kind:'product_contribution_manifest',schemaVersion:'5.0.0',contributionManifestRef:'contribution-manifest://abiogenesis/conformance/'+content,productId:m.productId,productVersion:m.packageVersion,descriptorRef:'descriptor://abiogenesis/typescript-tenant/'+content,productContentDigest:m.productContentDigest,publicContractCatalogId:m.publicContractCatalog.catalogId,publicContractCatalogDigest:catalogDigest,capabilityDefinitionGraph:graphCoordinate,publicationBindings,rows};
 assert.deepEqual(m.contributionManifest,expected);assert.equal(m.contributionManifestDigest,p.sha256Canonical(expected));assert.equal(m.contributionManifestRef,expected.contributionManifestRef);assert.equal(m.descriptorRef,expected.descriptorRef);assert.equal(m.provenanceRef,provenanceRef);
 assert.equal(m.publicContractCatalog.rows.length,75);assert.equal(rows.length,47);assert.equal(publicationBindings.length,10);
 reports.push({label,productContentDigest:m.productContentDigest,manifestDigest:p.sha256Canonical(m),catalogDigest,capabilityGraphCoordinate:graphCoordinate,contributionManifestDigest:m.contributionManifestDigest,publicRows:75,publicationBindings:10,contributionRows:47,nativeDeclarationClosures:closures.length,nativeLocatorRows:typed,assets,completeCanonicalValuesRecomputed:true});
}
for(let i=0;i<constructors.length;i++)for(const field of ['contracts','graphFunctions','programs','closureContracts','evaluators','rules','contributions'])assert.deepEqual(publications[0][i][field],publications[1][i][field],constructors[i]+' '+field+' metadata conserved');
assert.equal(reports[1].productContentDigest,inputs.finalContentDigest);assert.equal(reports[1].manifestDigest,inputs.finalManifestDigest);
await writeFile(candidate+'/catalog-owner-derivation.json',JSON.stringify({reports,exactCatalogFieldDifferenceCount:comparison.catalogDifferences.length,allPublicNonDigestFieldsEqual:true,exactContributionIdentityCounts:comparison.contributionIdentityCounts,fullCanonicalContributionValues:true,definitionRoleInstructionContractMetadataConserved:true,noArbitraryDigestOmission:true},null,2)+'\n',{flag:'wx'});
const product=await import(pathToFileURL(packaged+'/build/code/src/product/index.js').href),manifest=JSON.parse(await readFile(packaged+'/product-toolchain-manifest.json','utf8'));
const archive=JSON.parse(await readFile(candidate+'/archive.json','utf8'));
const request={artifactPath:archive.archive.path,artifactRef:'abiogenesis-typescript-tenant-5.0.0-rc.1.tgz',expectedArtifactDigest:'sha256:'+archive.archive.sha256,expectedProductContentDigest:inputs.finalContentDigest,expectedManifestDigest:inputs.finalManifestDigest,expectedProductId:manifest.productId,expectedPackageName:manifest.packageName,expectedPackageVersion:manifest.packageVersion};
const startedAt=new Date().toISOString(),clock=performance.now(),result=await product.verifyProduct(request),wallMs=performance.now()-clock;
const projection=Object.fromEntries(['kind','disposition','artifactDigest','productContentDigest','manifestDigest','catalogDigest','contributionManifestDigest','checkedPayloadFiles'].filter(key=>result[key]!==undefined).map(key=>[key,result[key]]));
await writeFile(candidate+'/owner-verification.json',JSON.stringify({request,projection,startedAt,finishedAt:new Date().toISOString(),wallMs,sourceBlindPackagedOwner:true,noInstallOrRun:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({projection,wallMs}));assert.equal(result.kind,'verified_product_artifact');assert.equal(result.disposition,'verified');assert.equal(result.checkedPayloadFiles,5263);
