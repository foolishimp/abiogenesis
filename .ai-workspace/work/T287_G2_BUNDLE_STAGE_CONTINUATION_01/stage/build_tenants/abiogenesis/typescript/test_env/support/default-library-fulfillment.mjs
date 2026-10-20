import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { assessmentContract, assessmentSchema, libraryConsumerDeclaration, witnessRef } from './default-library.mjs';

export const freshLifecyclePaths=['specification/project-conformance.md','design/implementation-design.md','design/test-design.md','test-execution-plan.json'];
export const suppliedLifecyclePaths=['source/original-basic-cli.txt','source/basic-cli.oracle.json','generated/hello-world.mjs','test/component/hello-cli.test.mjs','test/uat/hello-cli.uat.test.mjs'];
export function fulfillmentAssessmentSchema(product){
  return {...assessmentSchema,required:[...assessmentSchema.required,'fulfillment'],properties:{...assessmentSchema.properties,fulfillment:product.governanceFulfillmentAssessmentJsonSchema()}};
}
export function fulfillmentConsumerDeclaration({gtl,product,library,runEnvironment}){
  const declaration=libraryConsumerDeclaration(gtl,library,runEnvironment,{purposes:['specification','design','construction','testing','uat'],bound:12});
  declaration.programs[0].policies['abg.default_library_fulfillment']=product.GOVERNANCE_FULFILLMENT_PROFILE;
  return declaration;
}
/** Prospective inputs only; this helper never authors or repairs an application. */
export async function prepareFulfillmentSeed({seedRoot,caseContractPath,destination}){
  const files={};
  for(const path of suppliedLifecyclePaths)files[path]=await readFile(join(seedRoot,path));
  files['source/witness-contract.md']=await readFile(caseContractPath);
  for(const [path,bytes]of Object.entries(files)){await mkdir(dirname(join(destination,path)),{recursive:true});await writeFile(join(destination,path),bytes,{flag:'wx'});}
  return files;
}
export function fulfillmentWitnessInput({product,files}){
  const src='source/original-basic-cli.txt',contract='source/witness-contract.md',oracle='source/basic-cli.oracle.json';
  const sourcePaths=[src,contract,oracle],members=sourcePaths.map(path=>({memberRef:witnessRef('member',path),path,byteCount:files[path].length,digest:product.sha256Bytes(files[path])}));
  const context={contextRef:witnessRef('context','fulfillment-source'),sourceLocator:'consumer:complete-basic-cli-and-case',inventoryDigest:product.sha256Canonical(members),members};
  const quote=(path,text)=>{const bytes=files[path],selected=Buffer.from(text),startByte=bytes.indexOf(selected);assert.ok(startByte>=0&&bytes.indexOf(selected,startByte+1)<0,text);
    const member=members.find(m=>m.path===path);return {contextRef:context.contextRef,memberRef:member.memberRef,memberDigest:member.digest,startByte,endByte:startByte+selected.length,spanDigest:product.sha256Bytes(selected)};};
  const specs=[
    ['complete-original',src,files[src].toString(),'Complete original outcome; preserve every original obligation and honest execution-result meaning.','behavior'],
    ['conformance',contract,'`specification/project-conformance.md`: the small task\'s Intent, Product boundary,','Fresh substantive source-grounded conformance, Intent/Product/Requirements and completion criteria.','document'],
    ['implementation-design',contract,'`design/implementation-design.md`: a realizable design faithful to the original','Fresh realizable implementation design faithful to source and actual predecessor conformance.','document'],
    ['test-design',contract,'`design/test-design.md`: meaningful component and user-outcome checks of the','Fresh test-design meaning preserving exact CLI output/exit and actual test surfaces.','document'],
    ['execution-plan',contract,'`test-execution-plan.json`: the declared commands, expected test coverage and','Fresh JSON plan agrees with fixed prospective commands and original expectations; it does not control execution.','document'],
    ['behavior',contract,'At completion, the CLI runs under Node without package installation, exits zero,','Actual current CLI stdout, successful exit, at least two real passing tests and zero failures.','behavior'],
    ['revision',contract,'failure must remain admitted evidence for a subsequently justified, different','Actual baseline failure before CLI change, changed registered choice and consequential same-lineage correction; old failure remains historical.','revision'],
  ];
  const native=product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,c2=product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef;
  const terms=[],bindings=[],policies=[],shapes=[],completeness=[];
  for(const [name,path,text,meaning,kind]of specs){
    const requirementRef=witnessRef('requirement',name),obligationRef=witnessRef('obligation',name),policyRef=witnessRef('proof-policy',name),proofShapeRef=witnessRef('proof-shape',name),sourceBindings=[quote(path,text)];
    const realizationContractRef=kind==='document'?native:c2,proofContractRef=kind==='document'?native:c2;
    terms.push({requirementRef,sourceBindings});bindings.push({requirementRef,obligationRef,realizationContractRef,proofContractRef,proofPolicyRef:policyRef,proofShapeRef});
    policies.push({policyRef,sourceRequirementRef:requirementRef,sourceBindings,scope:meaning,realizationMeaning:[meaning],proofMeaning:['Independent semantic assessment of exact current evidence; retain explicit historical counterevidence where selected.'],unprovedScope:[],closureRule:'All selected evidence roles and semantic/depth criteria under the declared current-independent rule.',obligationRef});
    shapes.push({proofShapeRef,requirementRef,obligationRef,requiredEvidenceRoles:kind==='document'?['realization','semantic_assessment']:['realization','verifier_artifact','verifier_execution','semantic_assessment'],sharedBasis:['same-invocation','exact-source','current-subject'],requiredContent:[meaning],nativeCarrierBoundary:'Actual admitted native/C2/assessment child observations only.',roleContractRefs:{realization:realizationContractRef,proof:proofContractRef}});
    completeness.push({policyRef,semanticCriteria:[witnessRef('criterion',name)],depthClasses:[{classRef:witnessRef('depth',name),permitsNonApplicability:false}],strengthRuleRef:product.GOVERNANCE_FULFILLMENT_STRENGTH,
      adverseCommands:kind==='revision'?[{commandId:witnessRef('command','1'),disposition:'nonzero'}]:[]});
  }
  const fulfillment={profileRef:product.GOVERNANCE_FULFILLMENT_PROFILE,context,terms,bindings,policies,shapes,completeness,
    discoveryClasses:[{classRef:witnessRef('discovery','source-obligations'),ruleRef:product.GOVERNANCE_FULFILLMENT_DISCOVERY,templatePolicyRef:policies[0].policyRef,templateShapeRef:shapes[0].proofShapeRef}],assessmentContractRef:assessmentContract.contractRef};
  assert.ok(product.isGovernanceFulfillmentDeclaration(fulfillment));
  const paths=Object.keys(files),readRoots=[...paths,...freshLifecyclePaths].sort();
  const commands=[['generated/hello-world.mjs'],['--test','test/component/hello-cli.test.mjs','test/uat/hello-cli.uat.test.mjs']].map((args,i)=>({commandId:witnessRef('command',String(i)),executable:'node',args,relativeCwd:'.',environment:{},timeoutMs:20_000,terminationGraceMs:2_000,expectedReports:[]}));
  const scope={specification:[freshLifecyclePaths[0]],design:freshLifecyclePaths.slice(1),construction:['generated/hello-world.mjs'],testing:[],uat:[]};
  const original={taskRef:witnessRef('task','s6-original'),task:files[src].toString()+'\n\n'+files[contract].toString(),
    sources:paths.filter(p=>p!=='generated/hello-world.mjs').map(path=>({path,digest:product.sha256Bytes(files[path])})),requiredSupportRefs:bindings.map(b=>b.obligationRef),authorityRefs:[witnessRef('authority','s6-case')],
    readRoots,maxContextFiles:128,maxContextBytes:131_072,maxPromptBytes:131_072,
    workOrders:Object.fromEntries(Object.entries(scope).map(([purpose,writeRoots])=>[purpose,{outcome:`Perform the justified ${purpose} contribution to the complete original outcome.`,instructions:[files[contract].toString(),`Writable files for this capability: ${JSON.stringify(writeRoots)}. Use the actual current inventory and prior admitted assets; do not treat absent files as completed work.`],readFirst:purpose==='uat'?[...paths,...freshLifecyclePaths]:paths,writeRoots,checks:[]}])),
    testing:{selectedPaths:paths,commands,outcomePredicates:[],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'execution-evidence'}]},
    assessment:{sources:[...paths.filter(p=>p!=='generated/hello-world.mjs'&&p!==oracle),...freshLifecyclePaths],candidatePath:'generated/hello-world.mjs',rubricPath:oracle,
      resultContract:assessmentContract,schemaAsset:{productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(fulfillmentAssessmentSchema(product))+'\n').toString('base64')},verdictField:'disposition',satisfiedValue:'satisfied'},fulfillment};
  return product.constructGovernanceWorkState(original);
}
