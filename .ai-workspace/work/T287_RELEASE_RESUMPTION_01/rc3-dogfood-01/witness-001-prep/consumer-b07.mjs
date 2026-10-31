import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const OWNER = {productId:'product://abi5-tests/sandbox-uat@5.0.0', packageName:'@abi5-tests/sandbox-uat', packageVersion:'5.0.0'};
const ref = (kind, name) => kind + '://abi5-tests/sandbox-uat/' + name + '@5';
export const IDS = {moduleRef:ref('module','consumer'), programRef:ref('program','lifecycle'),
  graphFunctionRef:ref('graph-function','executive'), stepRef:ref('graph-function','executive-step'),
  startRef:ref('start','lifecycle'), environmentRef:ref('environment','default-library'),
  descriptorRef:ref('descriptor','consumer'), contributionManifestRef:ref('contribution-manifest','consumer'),
  semanticsRef:ref('semantics','consumer')};
export const ASSESSMENT = {contractRef:ref('contract','assessment'), contractVersion:'5.0.0', contractKind:'output', valueKind:'sandbox_uat_assessment'};
export const ASSESSMENT_SCHEMA = {$schema:'https://json-schema.org/draft/2020-12/schema', $id:ASSESSMENT.contractRef,
  type:'object', additionalProperties:false, required:['kind','disposition','reason','unresolvedCriteria'],
  properties:{kind:{const:ASSESSMENT.valueKind}, disposition:{type:'string',enum:['satisfied','unmet','indeterminate']},
    reason:{type:'string',minLength:1}, unresolvedCriteria:{type:'array',items:{type:'string'}}}};
export const assessmentBytes = Buffer.from(JSON.stringify(ASSESSMENT_SCHEMA) + '\n');
export const assessmentSelection = {resultContract:ASSESSMENT,
  schemaAsset:{productId:OWNER.productId,contractId:ASSESSMENT.contractRef,bytesBase64:assessmentBytes.toString('base64')},
  verdictField:'disposition',satisfiedValue:'satisfied'};

export function consumerDeclaration(gtl, product, library, recursionBound) {
  const graphs = structuredClone(gtl.defaultGovernanceGraphFunctions({purposes:['testing','construction'],recursionBound}));
  const parent = graphs[0], step = graphs[1];
  parent.name = IDS.graphFunctionRef; parent.template.graphRef = parent.name + '/graph';
  const {applicationRef, ...application} = parent.template.applications[0];
  parent.template.applications = [gtl.recurseApplication({...application,graphFunctionRef:IDS.stepRef})];
  parent.template.nodes[0].term.compositionRef = parent.template.applications[0].applicationRef;
  parent.declarations['abg.raw_result_contract'] = ASSESSMENT.contractRef;
  step.name = IDS.stepRef; step.template.graphRef = step.name + '/graph';
  const environment = structuredClone(library.runEnvironments[0]);
  environment.declarationRef = IDS.environmentRef;
  environment.roles = environment.roles.map(role => role.role === 'selector' ? {...role,graphFunctionRef:IDS.stepRef} : role);
  const declaredEnvironment = gtl.constructRunEnvironmentDeclaration(environment);
  const originalProgram = library.programs[0];
  const program = {...structuredClone(originalProgram),programRef:IDS.programRef,moduleRef:IDS.moduleRef,
    starts:[{startRef:IDS.startRef,graphFunctionRef:IDS.graphFunctionRef}],
    callableMembership:[IDS.graphFunctionRef,IDS.stepRef,...graphs.slice(2).map(graph=>graph.name),
      product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef,
      product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef],
    policies:{...originalProgram.policies,'abg.default_start_ref':IDS.startRef,'abg.run_environment':IDS.environmentRef}};
  return {kind:'module_publication',moduleRef:IDS.moduleRef,moduleVersion:'5.0.0',owningProductId:OWNER.productId,
    descriptorRef:IDS.descriptorRef,contributionManifestRef:IDS.contributionManifestRef,
    productSemanticsBinding:{kind:'product_semantics_binding',bindingRef:IDS.semanticsRef,packageName:OWNER.packageName,packageVersion:OWNER.packageVersion,
      modulePath:'build/semantics.mjs',namedSymbol:'SEMANTICS'},
    contracts:[ASSESSMENT],evaluators:[],rules:[],implementationBindings:[],closureContracts:[],programs:[program],
    graphFunctions:[parent,step],runEnvironments:[declaredEnvironment],
    contributions:[parent,step].map(graph=>({handle:graph.name,kind:'graph_function',declarationOrContractRef:graph.name,
      owningProductId:OWNER.productId,programMembershipRefs:[IDS.programRef],readinessPrerequisiteRefs:[IDS.programRef],
      compatibilityRefs:['compatibility://abiogenesis/major/5']}))};
}

// This independently installed test artifact imports the published generic
// library's semantics. It adds only its own response value contract.
const semanticsSource = "import {ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS as base} from '@abiogenesis/typescript-tenant/product';\n" +
  'export const SEMANTICS=Object.freeze({...base,bindingRef:' + JSON.stringify(IDS.semanticsRef) + ',packageName:' + JSON.stringify(OWNER.packageName) + ',packageVersion:"5.0.0",\n' +
  'validateContractValue(kind,value){if(kind!=="sandbox_uat_assessment")return base.validateContractValue(kind,value);return value!==null&&typeof value==="object"&&Object.keys(value).sort().join(",")==="disposition,kind,reason,unresolvedCriteria"&&value.kind===kind&&["satisfied","unmet","indeterminate"].includes(value.disposition)&&typeof value.reason==="string"&&value.reason.length>0&&Array.isArray(value.unresolvedCriteria)&&value.unresolvedCriteria.every(x=>typeof x==="string");}});\n';

export async function prepareConsumer({root,product,gtl,verified,archivePath,npm,recursionBound,command}) {
  const sourceRoot=join(root,'consumer-source'), artifacts=join(root,'consumer-artifacts');
  await mkdir(join(sourceRoot,'build'),{recursive:true}); await mkdir(join(sourceRoot,'contracts'),{recursive:true});
  await mkdir(artifacts,{recursive:true});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication({...verified,productManifestDigest:verified.manifestDigest});
  const data=consumerDeclaration(gtl,product,library,recursionBound);
  const policyRoot=join(dirname(root),'gc03-policy'), names=['abg-private-policy-member.json','activation-request.template.json'];
  const assets=await Promise.all(names.map(async name=>({name,bytes:await readFile(join(policyRoot,name))})));
  const dependencyRef='dependency://abi5-tests/gc03/policy@5',basisRef='support://abi5-tests/gc03/',contextRef='context://abi5-tests/gc03/policy@5';
  const members=assets.map(a=>({digest:product.sha256Bytes(a.bytes),path:a.name,target:null,type:'file'})).sort((a,b)=>a.path.localeCompare(b.path));
  const record=product.canonicalJson(members);await writeFile(join(policyRoot,'inventory.json'),record,{flag:'wx'});
  const cm=assets.map(a=>({memberRef:a.name===names[0]?'member://abi5-tests/gc03/private-policy@5':'member://abi5-tests/gc03/activation@5',path:a.name,byteCount:a.bytes.length,digest:product.sha256Bytes(a.bytes)}));
  const d=structuredClone(data.runEnvironments[0]);delete d.declarationDigest;
  d.dependencies.push({dependencyRef,basisRef,recordRef:basisRef+'inventory.json',recordDigest:product.sha256Bytes(Buffer.from(record)),recordFormat:'member_inventory@1',inventoryDigest:gtl.stdoInventoryDigest(members),members});
  d.contexts.push({contextRef,sourceLocator:basisRef,inventoryDigest:product.sha256Canonical(cm),members:cm});
  for(const role of d.roles.filter(r=>r.role==='constructor'))role.sourceBindings.push(...cm.map(m=>({contextRef,memberRef:m.memberRef,memberDigest:m.digest,startByte:0,endByte:m.byteCount,spanDigest:m.digest})));
  data.runEnvironments=[gtl.constructRunEnvironmentDeclaration(d)];
  data.programs[0].policies={...data.programs[0].policies,'abg.governed_context':cm[0].memberRef,'abg.governed_context.activation':cm[1].memberRef};
  const selected=JSON.parse(await readFile(join(policyRoot,'operator-binding.json'),'utf8'));
  const dependencyResources=d.dependencies.map(dep=>dep.dependencyRef===dependencyRef?{dependencyRef,root:policyRoot,recordPath:join(policyRoot,'inventory.json')}:{dependencyRef:dep.dependencyRef,root:join(selected.installedRoot,'contracts/default-library/stdo'),recordPath:join(selected.installedRoot,'contracts/default-library/stdo/context.inventory.json')});
  const files={'package.json':JSON.stringify({...OWNER,name:OWNER.packageName,version:OWNER.packageVersion,type:'module',
      exports:{'./publication':'./build/publication.json','./semantics':'./build/semantics.mjs'},
      files:['build','contracts','product-toolchain-manifest.json'],dependencies:{'@abiogenesis/typescript-tenant':'file:'+archivePath}})+'\n',
    'build/publication.json':product.canonicalJson(data)+'\n','build/semantics.mjs':semanticsSource,
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
      contractKind:'schema_asset',owningProduct:OWNER.productId,requirementAuthorityRefs:['requirement://abiogenesis/qual/018G'],capabilityIdentities:[],
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
    descriptorRef:IDS.descriptorRef,publisherNamespace:'abi5-tests',contributionManifestRef:IDS.contributionManifestRef,
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
  return {artifactPath,artifactRef:basename(artifactPath),basis,manifest,publication:materialize(basis),ids:IDS,dependencyResources};
}
