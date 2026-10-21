import assert from 'node:assert/strict';
import {readFile,mkdir,realpath} from 'node:fs/promises';
import {join,dirname,isAbsolute} from 'node:path';

export const witnessRef=(kind,name)=>`${kind}://default-library-witness/${name}@5`;
export const assessmentContract={contractRef:witnessRef('contract','assessment'),contractVersion:'5.0.0',contractKind:'output',valueKind:'consumer_outcome_assessment'};
export const assessmentSchema={$id:assessmentContract.contractRef,type:'object',additionalProperties:false,
  required:['kind','disposition','reason','unresolvedCriteria'],properties:{kind:{const:assessmentContract.valueKind},disposition:{type:'string',enum:['satisfied','unmet','indeterminate']},reason:{type:'string'},unresolvedCriteria:{type:'array',items:{type:'string'}}}};
export const schemaPath='contracts/assessment.schema.json';

export function libraryConsumerDeclaration(gtl,library,runEnvironment,{purposes=['construction','testing','uat'],bound=8}={}){
  const graphs=structuredClone(gtl.defaultGovernanceGraphFunctions({purposes,recursionBound:bound}));
  const parent=graphs[0],step=graphs[1],oldStep=step.name;
  parent.name=witnessRef('graph-function','executive');parent.template.graphRef=parent.name+'/graph';
  const app=parent.template.applications[0],{applicationRef,_kind,...rest}=app;
  parent.template.applications=[gtl.recurseApplication({...rest,graphFunctionRef:witnessRef('graph-function','executive-step')})];
  parent.template.nodes[0].term.compositionRef=parent.template.applications[0].applicationRef;
  parent.declarations['abg.raw_result_contract']=assessmentContract.contractRef;
  step.name=witnessRef('graph-function','executive-step');step.template.graphRef=step.name+'/graph';
  assert.ok(library.graphFunctions.some(g=>g.name===oldStep));
  const program={...structuredClone(library.programs[0]),programRef:witnessRef('program','witness'),moduleRef:witnessRef('module','witness'),
    starts:[{startRef:witnessRef('start','witness'),graphFunctionRef:parent.name}],callableMembership:[parent.name,step.name,...graphs.slice(2).map(g=>g.name),
      ...library.programs[0].callableMembership.filter(r=>r.includes('/worksite/'))],
    policies:{...library.programs[0].policies,'abg.default_start_ref':witnessRef('start','witness'),'abg.run_environment':runEnvironment.declarationRef}};
  return {moduleRef:program.moduleRef,owningProductId:witnessRef('product','consumer'),descriptorRef:witnessRef('descriptor','consumer'),contributionManifestRef:witnessRef('contribution-manifest','consumer'),
    productSemanticsBinding:{kind:'product_semantics_binding',bindingRef:witnessRef('semantics','consumer'),packageName:'@abiogenesis-fixtures/registered-selection',packageVersion:'5.0.0',modulePath:'build/index.mjs',namedSymbol:'SEMANTICS'},contracts:[assessmentContract],evaluators:[],rules:[],implementationBindings:[],closureContracts:[],programs:[program],
    graphFunctions:[parent,step],runEnvironments:[runEnvironment],contributions:[parent,step].map(g=>({handle:g.name,kind:'graph_function',declarationOrContractRef:g.name,owningProductId:witnessRef('product','consumer'),
      programMembershipRefs:[program.programRef],readinessPrerequisiteRefs:[program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']}))};
}
export async function libraryEnvironment({gtl,product,packageRoot}){
  assert.ok(typeof packageRoot==='string'&&isAbsolute(packageRoot),'explicit exact packageRoot is required');
  const recordPath=await realpath(join(packageRoot,gtl.DEFAULT_LIBRARY_CONTEXT_INVENTORY.path)),sourceRoot=dirname(recordPath);
  const d=structuredClone(gtl.defaultLibraryRunEnvironment());
  assert.equal(d.dependencies.length,1,'packaged source subset has one declared inventory');
  const dependency=d.dependencies[0],recordBytes=await readFile(recordPath);
  assert.equal(product.sha256Bytes(recordBytes),dependency.recordDigest,'selected package inventory matches its declaration');
  assert.deepEqual(product.runEnvironmentRecordMembers(dependency.recordFormat,recordBytes),dependency.members);
  d.declarationRef=witnessRef('environment','selected');
  const selectors=d.roles.filter(role=>role.role==='selector');assert.equal(selectors.length,1);
  selectors[0].graphFunctionRef=witnessRef('graph-function','executive-step');
  const declaration=gtl.constructRunEnvironmentDeclaration(d);
  const physicalDependencies=[{dependencyRef:dependency.dependencyRef,root:sourceRoot,recordPath}];
  return {declaration,async resources({authority,program,workspaceBinding,product:resourceProduct=product}){
    const path=join(workspaceBinding.roots.archiveRoot,'default-library-context');await mkdir(path,{recursive:true});
    const coordinates={dependencies:physicalDependencies,pythonPath:null,temporaryRoot:await realpath(path)};
    return resourceProduct.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
      permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:program.programRef,
        environmentRef:declaration.declarationRef,environmentDigest:resourceProduct.sha256Canonical(declaration),operations:['read_context'],...coordinates}});
  }};
}
export async function witnessInput({product,selection,seedRoot}){
  const sourceText=await readFile(join(seedRoot,'source/original-basic-cli.txt'),'utf8');
  const contractText=await readFile(join(seedRoot,'source/witness-contract.md'),'utf8');
  const paths=Object.keys(selection.seedFiles),readFirst=paths.filter(p=>p!=='generated/hello-world.mjs').concat('generated/hello-world.mjs');
  const order=purpose=>({outcome:`Perform the selected ${purpose} work needed for the original task.`,instructions:[contractText],readFirst,
    writeRoots:purpose==='construction'?[...selection.applicationWriteRoots]:[],checks:[]});
  const commands=selection.commands.map((c,i)=>({commandId:witnessRef('command',String(i)),executable:c.command,args:c.args,relativeCwd:'.',environment:{},timeoutMs:20_000,terminationGraceMs:2_000,expectedReports:[]}));
  const original={taskRef:witnessRef('task','original'),task:sourceText+'\n\n'+contractText,
    sources:selection.protectedSeedPaths.map(path=>({path,digest:'sha256:'+selection.seedFiles[path].sha256})),
    requiredSupportRefs:[witnessRef('support','complete-source-outcome')],authorityRefs:[witnessRef('authority','consumer-scope')],
    readRoots:[...paths].sort(),maxContextFiles:128,maxContextBytes:131_072,maxPromptBytes:131_072,
    workOrders:Object.fromEntries(['construction','testing','uat'].map(p=>[p,order(p)])),
    testing:{selectedPaths:paths,commands,outcomePredicates:[],allowedWriteTerritories:selection.evidenceWriteRoots.map(relativePath=>({pathKind:'subtree',relativePath}))},
    assessment:{sources:selection.protectedSeedPaths.filter(p=>p!=='source/basic-cli.oracle.json'),candidatePath:'generated/hello-world.mjs',rubricPath:'source/basic-cli.oracle.json',resultContract:assessmentContract,
      schemaAsset:{productId:witnessRef('product','consumer'),contractId:witnessRef('contract','assessment'),bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')},
      verdictField:'disposition',satisfiedValue:'satisfied'}};
  return product.constructGovernanceWorkState(original);
}
