import assert from 'node:assert/strict';
import {readFile,mkdir,realpath} from 'node:fs/promises';
import {join} from 'node:path';
import {nativeSelectionEnvironment} from './native-registered-selection.mjs';

export const witnessRef=(kind,name)=>`${kind}://default-library-witness/${name}@5`;
export const assessmentContract={contractRef:witnessRef('contract','assessment'),contractVersion:'5.0.0',contractKind:'output',valueKind:'consumer_outcome_assessment'};
export const assessmentSchema={$schema:'https://json-schema.org/draft/2020-12/schema',$id:assessmentContract.contractRef,type:'object',additionalProperties:false,
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
    productSemanticsBinding:{kind:'product_semantics_binding',bindingRef:witnessRef('semantics','consumer'),packageName:'@abiogenesis-fixtures/registered-selection',packageVersion:'5.0.0',modulePath:'build/index.mjs',namedSymbol:'SEMANTICS'},contracts:[...library.contracts,assessmentContract],evaluators:[],rules:[],implementationBindings:[],closureContracts:[],programs:[program],
    graphFunctions:[parent,step],runEnvironments:[runEnvironment],contributions:[parent,step].map(g=>({handle:g.name,kind:'graph_function',declarationOrContractRef:g.name,owningProductId:witnessRef('product','consumer'),
      programMembershipRefs:[program.programRef],readinessPrerequisiteRefs:[program.programRef],compatibilityRefs:['compatibility://abiogenesis/major/5']}))};
}
export async function libraryEnvironment({gtl,product}){
  const base=await nativeSelectionEnvironment({gtl,product}),d=structuredClone(base.declaration),source=d.dependencies[0];
  const sourceRoot=base.physicalDependencies[0].root,path='standards/STDO_REFERENCE_FRAME_BASELINE.md',bytes=await readFile(join(sourceRoot,path));
  const memberDigest=product.sha256Bytes(bytes),contextRef=witnessRef('context','frames'),memberRef=witnessRef('member','frames');
  const member={memberRef,path,byteCount:bytes.length,digest:memberDigest};
  d.contexts.push({contextRef,sourceLocator:source.basisRef,inventoryDigest:product.sha256Canonical([member]),members:[member]});
  const bind=heading=>{const marker=Buffer.from(`## ${heading}\n`),startByte=bytes.indexOf(marker);assert.ok(startByte>=0);const next=bytes.indexOf(Buffer.from('\n## '),startByte+marker.length),endByte=next<0?bytes.length:next+1;
    return {contextRef,memberRef,memberDigest,startByte,endByte,spanDigest:product.sha256Bytes(bytes.subarray(startByte,endByte))};};
  const native=product.NATIVE_WORKSPACE_WORK_IDS,c2=product.WORKSITE_COMMAND_EXECUTION_IDS;
  d.declarationRef=witnessRef('environment','selected');
  const policy=product.DEFAULT_LIBRARY_POLICY;
  d.roles=[
    [witnessRef('graph-function','executive-step'),product.governanceRef('node','select'),'selector',['Derived Executive Frame']],
    [native.graphFunctionRef,native.nodeRef,'constructor',['Derived Worker Frame','Derived Generic Specialist Frame Set']],
    [native.assessmentGraphFunctionRef,native.assessmentNodeRef,'assessor',['Derived Reviewer Frame','Derived Product Testing Frame Set']],
    [c2.graphFunctionRef,c2.nodeRef,'command_executor',['Derived Worker Frame','Derived Product Testing Frame Set']],
  ].map(([graphFunctionRef,programLocusRef,role,headings])=>({graphFunctionRef,programLocusRef,role,
    frameRefs:headings.map(h=>source.basisRef+path+'#'+h.toLowerCase().replaceAll(' ','-')).sort(),policy:{policyRef:witnessRef('policy',role),text:policy,digest:product.sha256Bytes(Buffer.from(policy))},
    contextPolicy:{policyRef:witnessRef('policy',role+'/context'),selectors:role==='selector'?['full_source','active_binding_semantics']:['current_worksite','admitted_execution_evidence']},
    accessRefs:base.declaration.roles[0].accessRefs,sourceBindings:headings.map(bind)}));
  const declaration=gtl.constructStdoRunEnvironmentDeclaration(d);
  return {declaration,async resources({authority,program,workspaceBinding,product}){
    const path=join(workspaceBinding.roots.archiveRoot,'default-library-context');await mkdir(path,{recursive:true});
    const coordinates={dependencies:base.physicalDependencies,pythonPath:base.pythonPath,temporaryRoot:await realpath(path)};
    return product.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:'5.0.0',...coordinates,
      permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:program.programRef,
        environmentRef:declaration.declarationRef,environmentDigest:product.sha256Canonical(declaration),operations:['read_context','validate'],...coordinates}});
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
    readRoots:['.'],maxContextFiles:128,maxContextBytes:131_072,maxPromptBytes:131_072,
    workOrders:Object.fromEntries(['construction','testing','uat'].map(p=>[p,order(p)])),
    testing:{selectedPaths:paths,commands,outcomePredicates:[],allowedWriteTerritories:selection.evidenceWriteRoots.map(relativePath=>({pathKind:'subtree',relativePath}))},
    assessment:{sources:selection.protectedSeedPaths,candidatePath:'generated/hello-world.mjs',rubricPath:'source/basic-cli.oracle.json',resultContract:assessmentContract,
      schemaAsset:{productId:witnessRef('product','consumer'),contractId:witnessRef('schema','assessment'),bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')},
      verdictField:'disposition',satisfiedValue:'satisfied'}};
  return product.constructGovernanceWorkState(original);
}
