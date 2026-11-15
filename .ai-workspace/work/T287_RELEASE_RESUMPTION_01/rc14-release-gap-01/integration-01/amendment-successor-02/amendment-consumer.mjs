// External fixture packaging; canonical Product constructors retain ownership.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {basename,dirname,join} from 'node:path';
export async function prepareAmendmentConsumer({root,product,gtl,verified,archivePath,npm,recursionBound,command,definition,A,D,tenant,packageRoot}) {
  const sourceRoot=join(root,'consumer-source'), artifacts=join(root,'consumer-artifacts');
  await mkdir(join(sourceRoot,'build'),{recursive:true}); await mkdir(join(sourceRoot,'contracts'),{recursive:true});
  await mkdir(artifacts,{recursive:true});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication({...verified,productManifestDigest:verified.manifestDigest});
  const environment=await D.libraryEnvironment({gtl,product,packageRoot});
  const data={kind:'module_publication',moduleVersion:'5.0.0',...D.libraryConsumerDeclaration(gtl,library,environment.declaration,{purposes:['induction','design','construction','testing','review','uat'],bound:recursionBound,prerequisites:A.amendmentPrerequisites(definition)})};
  const OWNER={productId:data.owningProductId,packageName:data.productSemanticsBinding.packageName,packageVersion:data.productSemanticsBinding.packageVersion};
  const IDS=data,ASSESSMENT=D.assessmentContract;
  const assessmentBytes=await readFile(join(tenant,'test_env/fixtures/amendment-witness/seed',definition.acceptance.resultSchema));
  assert.deepEqual(JSON.parse(assessmentBytes),D.assessmentSchema);
  const semanticsSource=await readFile(join(tenant,'test_env/fixtures/default-library-product/index.mjs'));
  const ref=D.witnessRef;
  const files={'package.json':JSON.stringify({...OWNER,name:OWNER.packageName,version:OWNER.packageVersion,type:'module',
      exports:{'./publication':'./build/publication.json','./semantics':'./build/index.mjs'},
      files:['build','contracts','product-toolchain-manifest.json'],dependencies:{'@abiogenesis/typescript-tenant':'file:'+archivePath}})+'\n',
    'build/publication.json':product.canonicalJson(data)+'\n','build/index.mjs':semanticsSource,
    'contracts/assessment.schema.json':assessmentBytes,
    'contracts/public-contract-catalog.schema.json':JSON.stringify({$schema:'https://json-schema.org/draft/2020-12/schema',type:'object'})+'\n'};
  for(const [path,bytes] of Object.entries(files))await writeFile(join(sourceRoot,path),bytes,{flag:'wx'});
  const capabilityGraph=product.constructCapabilityDefinitionGraph([]), capabilityBytes=product.capabilityDefinitionGraphAssetBytes(capabilityGraph);
  const capabilityPath=product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH;
  await mkdir(dirname(join(sourceRoot,capabilityPath)),{recursive:true}); await writeFile(join(sourceRoot,capabilityPath),capabilityBytes,{flag:'wx'});
  const productRelativeLocators=Object.keys(files), payloadInventory=await Promise.all(productRelativeLocators.map(async path=>({path,sha256:await product.sha256File(join(sourceRoot,path))})));
  const productContentDigest=product.payloadInventoryDigest(payloadInventory), placeholder='sha256:'+'0'.repeat(64);
  const materialize=basis=>gtl.modulePublication({...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,
    productManifestDigest:basis.manifestDigest,contributions:data.contributions.map(row=>({...row,provenanceRefs:[basis.artifactDigest,basis.manifestDigest]}))});
  const draft=materialize({artifactDigest:placeholder,manifestDigest:placeholder,productContentDigest});
  const catalogData={schemaVersion:'5.0.0',catalogId:ref('catalog','public-contracts'),catalogVersion:'5.0.0',
    catalogSchemaPath:'contracts/public-contract-catalog.schema.json',catalogSchemaDigest:await product.sha256File(join(sourceRoot,'contracts/public-contract-catalog.schema.json')),
    rows:[{contractId:ASSESSMENT.contractRef,contractVersion:'5.0.0',contractDigest:product.sha256Bytes(assessmentBytes),
      contractKind:'schema_asset',owningProduct:OWNER.productId,requirementAuthorityRefs:[A.amendmentRef('support','amended-requirement-realized')],capabilityIdentities:[],
      assetLocator:{path:'contracts/assessment.schema.json',mediaType:'application/schema+json',schemaVersion:'5.0.0',contentDigest:product.sha256Bytes(assessmentBytes)}}]};
  const publicContractCatalog={...catalogData,catalogDigest:product.sha256Canonical(catalogData)};
  const capabilityCoordinate=product.capabilityDefinitionGraphCoordinate(capabilityGraph), provenanceRef=ref('provenance','external-test-artifact');
  const contributionManifest={kind:'product_contribution_manifest',schemaVersion:'5.0.0',contributionManifestRef:IDS.contributionManifestRef,
    productId:OWNER.productId,productVersion:OWNER.packageVersion,descriptorRef:IDS.descriptorRef,productContentDigest,
    publicContractCatalogId:publicContractCatalog.catalogId,publicContractCatalogDigest:publicContractCatalog.catalogDigest,
    capabilityDefinitionGraph:capabilityCoordinate,publicationBindings:[{moduleRef:IDS.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(draft)}],
    rows:draft.contributions.map(row=>({moduleRef:IDS.moduleRef,handle:row.handle,kind:row.kind,
      declarationOrContractRef:row.declarationOrContractRef,owningProductId:row.owningProductId,
      programMembershipRefs:row.programMembershipRefs,readinessPrerequisiteRefs:row.readinessPrerequisiteRefs,
      compatibilityRefs:row.compatibilityRefs,provenanceRef}))};
  const manifest={kind:'abg_product_toolchain_manifest',schemaVersion:'5.0.0',...OWNER,productContentDigest,productRelativeLocators,
    descriptorRef:IDS.descriptorRef,publisherNamespace:'registered-selection',contributionManifestRef:IDS.contributionManifestRef,
    contributionManifestDigest:product.sha256Canonical(contributionManifest),contributionManifest,
    compatibilityRefs:['compatibility://abiogenesis/major/5'],declaredDependencies:[{kind:'requires',productId:verified.productId,packageVersion:verified.packageVersion,
      compatibilityRef:'compatibility://abiogenesis/major/5',requiredContractRefs:['abg.contract.gtl.root-declaration','abg.schema.public-operation-invocation'],
      requiredCapabilityRefs:['abg.capability.catalog.invoke-graph-function@5','abg.capability.gtl.declare@5']}],
    provenanceRef,declaredCapabilityRefs:[],capabilityDefinitionGraph:{...capabilityCoordinate,assetLocator:{path:capabilityPath,mediaType:'application/json',schemaVersion:'5.0.0',contentDigest:product.sha256Bytes(capabilityBytes)}},publicContractCatalog};
  await writeFile(join(sourceRoot,'product-toolchain-manifest.json'),product.canonicalJson(manifest)+'\n',{flag:'wx'});
  const packed=await command('pack-consumer',npm,['pack','--ignore-scripts','--json','--pack-destination',artifacts],{cwd:sourceRoot});
  if(packed.exitCode!==0)throw new Error('Independent consumer packing failed');
  const [row]=JSON.parse(packed.stdout), artifactPath=join(artifacts,row.filename);
  const basis={...OWNER,artifactDigest:await product.sha256File(artifactPath),manifestDigest:product.sha256Canonical(manifest),productContentDigest};
  return {artifactPath,artifactRef:basename(artifactPath),basis,manifest,publication:materialize(basis),ids:IDS};
}
