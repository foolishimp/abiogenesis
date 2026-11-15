// External two-publication consumer package. No runtime policy is implemented.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,dirname,basename} from 'node:path';
import {declare,ids} from './declarations.mjs';
export async function prepareConsumer({root,product,gtl,verified,archivePath,npm,recursionBound,command,D,P,nativeDeclarations,tenant,packageRoot}) {
 const corePublications=P.corePublications(gtl,verified),environment=await D.libraryEnvironment({gtl,product,packageRoot});
 const bundle=declare({gtl,product,corePublications,nativeDeclarations,D,environment,recursionBound});
 const sourceRoot=join(root,'consumer-source'),artifacts=join(root,'consumer-artifacts');
 await mkdir(sourceRoot,{recursive:true});await mkdir(artifacts,{recursive:true});
 const data=bundle.publications.map(({kind,moduleVersion,artifactDigest,productContentDigest,productManifestDigest,...row})=>row);
 const semantics=await readFile(join(tenant,'test_env/fixtures/default-library-product/index.mjs'));
 const schemaBytes=Buffer.from(JSON.stringify(D.assessmentSchema)+'\n');
 const files={'package.json':JSON.stringify({name:ids.packageName,version:ids.packageVersion,type:'module',exports:{'./d1':'./build/d1.json','./d2':'./build/d2.json','./semantics':'./build/index.mjs'},files:['build','contracts','product-toolchain-manifest.json'],dependencies:{'@abiogenesis/typescript-tenant':'file:'+archivePath}})+'\n',
  'build/d1.json':product.canonicalJson(data[0])+'\n','build/d2.json':product.canonicalJson(data[1])+'\n','build/index.mjs':semantics,
  'contracts/assessment.schema.json':schemaBytes,'contracts/public-contract-catalog.schema.json':JSON.stringify({$schema:'https://json-schema.org/draft/2020-12/schema',type:'object'})+'\n'};
 for(const [path,bytes] of Object.entries(files)){await mkdir(dirname(join(sourceRoot,path)),{recursive:true});await writeFile(join(sourceRoot,path),bytes,{flag:'wx'});}
 const graph=product.constructCapabilityDefinitionGraph([]),graphBytes=product.capabilityDefinitionGraphAssetBytes(graph),coordinate=product.capabilityDefinitionGraphCoordinate(graph);
 await mkdir(dirname(join(sourceRoot,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH)),{recursive:true});await writeFile(join(sourceRoot,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH),graphBytes,{flag:'wx'});
 const productRelativeLocators=Object.keys(files).sort(),payloadInventory=productRelativeLocators.map(path=>({path,sha256:product.sha256Bytes(files[path])})),content=product.payloadInventoryDigest(payloadInventory),zero='sha256:'+'0'.repeat(64);
 const materialize=basis=>data.map(row=>gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...row,artifactDigest:basis.artifactDigest,productContentDigest:content,productManifestDigest:basis.manifestDigest,
  contributions:row.contributions.map(c=>({...c,provenanceRefs:[basis.artifactDigest,basis.manifestDigest]}))}));
 const draft=materialize({artifactDigest:zero,manifestDigest:zero});
 const catalogData={schemaVersion:'5.0.0',catalogId:ids.catalogRef,catalogVersion:'5.0.0',catalogSchemaPath:'contracts/public-contract-catalog.schema.json',catalogSchemaDigest:product.sha256Bytes(files['contracts/public-contract-catalog.schema.json']),
  rows:[{contractId:D.assessmentContract.contractRef,contractVersion:'5.0.0',contractDigest:product.sha256Bytes(schemaBytes),contractKind:'schema_asset',owningProduct:ids.productId,requirementAuthorityRefs:['support://s06-witness/original-outcome@5'],capabilityIdentities:[],assetLocator:{path:'contracts/assessment.schema.json',mediaType:'application/schema+json',schemaVersion:'5.0.0',contentDigest:product.sha256Bytes(schemaBytes)}}]};
 const publicContractCatalog={...catalogData,catalogDigest:product.sha256Canonical(catalogData)};
 const contributionManifest={kind:'product_contribution_manifest',schemaVersion:'5.0.0',contributionManifestRef:ids.contributionManifestRef,productId:ids.productId,productVersion:ids.packageVersion,descriptorRef:ids.descriptorRef,productContentDigest:content,
  publicContractCatalogId:publicContractCatalog.catalogId,publicContractCatalogDigest:publicContractCatalog.catalogDigest,capabilityDefinitionGraph:coordinate,
  publicationBindings:draft.map(p=>({moduleRef:p.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(p)})),
  rows:draft.flatMap(p=>p.contributions.map(({provenanceRefs,...c})=>({moduleRef:p.moduleRef,...c,provenanceRef:ids.provenanceRef})))};
 const manifest={kind:'abg_product_toolchain_manifest',schemaVersion:'5.0.0',productId:ids.productId,packageName:ids.packageName,packageVersion:ids.packageVersion,productContentDigest:content,productRelativeLocators,descriptorRef:ids.descriptorRef,publisherNamespace:'registered-selection',contributionManifestRef:ids.contributionManifestRef,contributionManifestDigest:product.sha256Canonical(contributionManifest),contributionManifest,
  compatibilityRefs:['compatibility://abiogenesis/major/5'],declaredDependencies:[{kind:'requires',productId:verified.productId,packageVersion:verified.packageVersion,compatibilityRef:'compatibility://abiogenesis/major/5',requiredContractRefs:['abg.contract.gtl.root-declaration','abg.schema.public-operation-invocation'],requiredCapabilityRefs:['abg.capability.catalog.invoke-graph-function@5','abg.capability.gtl.declare@5']}],provenanceRef:ids.provenanceRef,declaredCapabilityRefs:[],
  capabilityDefinitionGraph:{...coordinate,assetLocator:{path:product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,mediaType:'application/json',schemaVersion:'5.0.0',contentDigest:product.sha256Bytes(graphBytes)}},publicContractCatalog};
 await writeFile(join(sourceRoot,'product-toolchain-manifest.json'),product.canonicalJson(manifest)+'\n',{flag:'wx'});
 const packed=await command('pack-consumer',npm,['pack','--ignore-scripts','--json','--pack-destination',artifacts],{cwd:sourceRoot});assert.equal(packed.exitCode,0,'consumer packing');
 const [row]=JSON.parse(packed.stdout),artifactPath=join(artifacts,row.filename),basis={artifactDigest:await product.sha256File(artifactPath),manifestDigest:product.sha256Canonical(manifest),productContentDigest:content};
 return {artifactPath,artifactRef:basename(artifactPath),manifest,basis,publications:materialize(basis),programRefs:bundle.programRefs,lifecycle:bundle.lifecycle,ids};
}
