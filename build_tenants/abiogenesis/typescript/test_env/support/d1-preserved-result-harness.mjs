import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import * as validator from '../../build/code/src/validator/index.js';
import * as recovery from '../../build/code/src/abg/worksite_construction_recovery.js';
import * as store from '../../build/code/src/abg/event_store.js';
import * as prefixApi from '../../build/code/src/abg/event_prefix.js';
import * as basisApi from '../../build/code/src/abg/execution_basis.js';
import * as callApi from '../../build/code/src/abg/c_call.js';
import * as environmentApi from '../../build/code/src/abg/environment_admission.js';
import * as actorApi from '../../build/code/src/abg/actor_process.js';
import {deriveSemanticWorksitePreparation} from '../../build/code/src/product/semantic_stage.js';
import {SEMANTIC_STAGE_IDS} from '../../build/code/src/gtl/semantic_stage_identity.js';
export {product,gtl,validator,recovery};
export const packageRoot=resolve(import.meta.dirname,'../..');
export const sourceObservation=JSON.parse(readFileSync(resolve(packageRoot,'../preimages/source-observation.json'),'utf8'));
export const selector=product.constructWorksitePreservedResultSource({kind:'worksite_preserved_result_source',schemaVersion:'5.0.0',
  historicalPrefix:sourceObservation.nativeEventStore.coordinate,sourceCCallRef:sourceObservation.nativeSource.cCallRef,
  actorInvocationRef:sourceObservation.nativeSource.actorInvocationRef});
const hash=product.sha256Canonical;
const h=n=>'sha256:'+String(n).repeat(64);
let retained;
export function readRetained(){
  if(retained)return retained;
  const projected=recovery.projectPreservedWorksiteProposal(selector);
  assert.ok(projected,'actual unchanged native historical projection');
  const events=store.readRuntimeEventsAtDurablePrefix(selector.historicalPrefix);
  const prefix=prefixApi.selectValidatedRuntimeEventPrefix(events);
  const environment=environmentApi.projectExactPrefixWorkspaceEnvironment(selector.historicalPrefix,
    {ref:projected.originalTask.workspaceBinding.bindingId,digest:projected.originalTask.workspaceBinding.bindingDigest});
  assert.equal(environment.kind,'exact_prefix_workspace_environment');
  retained={projected,events,prefix,environment};
  return retained;
}

// Static declarations with explicit, uninstalled artifact coordinates. Catalog
// readiness below is a lookup assumption, never CatalogOperationPort admission.
export function staticDeclarations(graphTransform=graph=>graph){
  const artifact={productId:product.ABI5_PRODUCT_ID,artifactDigest:h(1),productContentDigest:h(2),
    productManifestDigest:h(3),packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION};
  const native=gtl.constructWorksiteConstructionModulePublication(artifact),ids=product.WORKSITE_CONSTRUCTION_IDS;
  const graph=graphTransform(gtl.constructWorksitePreservedResultRecoveryGraphFunction({
    graphFunctionRef:'graph-function://d1-preserved-mechanical/recovery@5',source:selector}));
  const oldProgram=native.programs.find(p=>p.programRef===ids.programRef);
  let program={...oldProgram,programRef:'program://d1-preserved-mechanical/recovery@5',moduleRef:'module://d1-preserved-mechanical/recovery@5',
    starts:[{startRef:'start://d1-preserved-mechanical/recovery@5',graphFunctionRef:graph.name}],
    callableMembership:oldProgram.callableMembership.map(ref=>ref===ids.graphFunctionRef?graph.name:ref),
    policies:{...oldProgram.policies,'abg.default_start_ref':'start://d1-preserved-mechanical/recovery@5'}};
  const contribution={...native.contributions[0],handle:graph.name,declarationOrContractRef:graph.name,
    moduleRef:program.moduleRef,programMembershipRefs:[program.programRef],readinessPrerequisiteRefs:[program.programRef]};
  const publication=gtl.modulePublication({...native,moduleRef:program.moduleRef,contracts:[],implementationBindings:[],closureContracts:[],
    programs:[program],graphFunctions:[graph],contributions:[contribution]});
  program=publication.programs[0];
  const publications=[native,publication],functions=publications.flatMap(p=>p.graphFunctions).filter(g=>program.callableMembership.includes(g.name));
  const raw=(value,kind)=>{const row=validator.rawAdmitValue(value,kind,'contract://mechanical/raw');assert.equal(row.kind,'raw_admitted_value');return row;};
  function validate(){const p=raw(publication,'module_publication');return validator.validateProgram({declarationBasisDigest:p.subjectDigest,
    programPublication:p,program:raw(program,'gtl_program'),graphFunctions:functions.map(g=>raw(g,'graph_function')),
    contracts:native.contracts.map(c=>raw(c,'contract_declaration')),implementationBindings:native.implementationBindings.map(b=>raw(b,'implementation_binding')),
    closureContracts:native.closureContracts.map(c=>raw(c,'closure_contract')),rules:[],evaluators:[]});}
  function closure(){
    const catalog=product.buildGraphFunctionCatalog(publications);assert.equal(catalog.kind,'graph_function_catalog');
    const assumed={...catalog,boundPublications:publications,readinessBasis:{resolvedLock:{dependencyEdges:[]},
      installedProducts:[{productId:artifact.productId,productContentDigest:artifact.productContentDigest,manifestDigest:artifact.productManifestDigest,
        installId:'install://mechanical/unadmitted',packageName:artifact.packageName,packageVersion:artifact.packageVersion}]}};
    return product.resolveProgramDeclarationClosure(assumed,product.narrowGraphFunctionCatalog(catalog,[graph.name]),program.programRef);
  }
  return {artifact,native,graph,program,publication,publications,validate,closure};
}

// Actual Product constructors create changed binding/subject/observation/target
// identities. The admissionEventRef and later lookup rows remain explicit test
// assumptions, not newly admitted native history or effect authority.
export function rebindRetained(){
  const {projected,environment}=readRetained(),original=projected.originalTask,declared=staticDeclarations();
  const candidate=product.constructWorkspaceBinding(original.workspaceAuthorityBasis,environment.productSet,environment.resolvedProductLock,
    {...original.workspaceBinding.roots,archiveRoot:resolve(packageRoot,'../scratch/unexecuted-current-archive')});
  assert.equal(candidate.kind,'workspace_binding_candidate');
  const workspaceBinding={...candidate,kind:'workspace_binding',admissionEventRef:'lookup-only:current-binding'};
  const policy=product.constructRootInvocationPolicy(workspaceBinding,declared.program,[],['F_D']);
  const capabilityGrant=product.constructCapabilityGrant(policy,workspaceBinding.authorizedActorRef,'abg.operation.run.invoke',
    product.DIRECT_INVOKE_CAPABILITY,{admittedInstalls:environment.productInstalls,workspaceBinding,fixedPacket:product.RUN_OPERATION_CONTRACTS.invoke.start});
  const current={workspaceAuthorityBasis:original.workspaceAuthorityBasis,workspaceBinding,capabilityGrant};
  const preparation=deriveSemanticWorksitePreparation(projected.envelope,current);
  assert.ok(preparation,'existing D1 physical-coordinate derivation');
  return {current,preparation,task:preparation.constructionTask,declared};
}

// Runs the unchanged compiled native projector. Actual retained history,
// archive bytes and original native owner projections remain real. The new
// current occurrence and mutations are ONLY native lookup assumptions supplied
// at imported read boundaries; no synthetic rows are admitted or persisted.
export async function nativeHarness(){
  const original=readRetained(),rebased=rebindRetained(),{declared,task,preparation}=rebased;
  const lookups={executions:new Map(),calls:new Map(),outcomes:new Map(),sets:new Map(),cursors:new Map()};
  const oldCache={executions:new Map(),calls:new Map(),outcomes:new Map()};
  const synthetic=[],currentPrefix={assumption:'unadmitted current prefix lookup'};
  let historicalRows=original.events,physicalMutation=null;
  const count={currentReads:0,historicalReads:0,archiveReads:0,physicalReads:0};
  const originalExecution=basisApi.rehydrateExecutionBasisAtPrefix(original.prefix,original.projected.proof.sourceExecutionBasisRef);
  const materialize=(graph,execution)=>gtl.materializeGraph(graph,{invocationAdmissionRef:execution.invocationAdmissionRef,
    admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
  function execution(name,input,graph,{parent=null,closure=product.WORKSITE_CONSTRUCTION_IDS.childClosureContractRef}={}){
    const row={...originalExecution,basisRef:'basis://mechanical/'+name,basisDigest:hash(name),admissionEventRef:'lookup-basis:'+name,
      invocationAdmissionRef:'invocation://mechanical/current',invocationRef:'invocation://mechanical/current',invocationDigest:hash('current invocation'),
      programRef:declared.program.programRef,programDigest:hash(declared.program),rawInputValue:input,rawInputAdmissionRef:'input://mechanical/'+name,
      rawInputDigest:hash(input),graphFunctionRef:graph.name,graphFunctionDigest:hash(graph),graphRef:'pending',graphDigest:hash('pending'),
      implementationSetRef:'implementation-set://mechanical/'+name,implementationSetDigest:hash('set:'+name),
      rootImplementationSetRef:'implementation-set://mechanical/root',rootImplementationSetDigest:hash('root-set'),
      workspaceBindingId:task.workspaceBinding.bindingId,workspaceBindingDigest:task.workspaceBinding.bindingDigest,
      closureContractRef:closure,parentExecutionBasisRef:parent?.basisRef??null,parentCCallRef:parent?'c-call://mechanical/parent-workflow':null};
    const bound=materialize(graph,row);row.graphRef=bound.materializationRef;row.graphDigest=bound.materializationDigest;
    lookups.executions.set(row.basisRef,row);
    synthetic.push({kind:'basis_admitted',eventId:row.admissionEventRef,admissionOrdinal:2000+synthetic.length,basisId:row.basisRef,payload:{}});
    return row;
  }
  const bridgeGraph=gtl.constructSemanticBridgeGraphFunction({graphFunctionRef:'graph-function://mechanical/current-design-bridge@5',
    nodeRef:'node://mechanical/current-design-bridge@5',closureContractRef:originalExecution.closureContractRef,operation:'design_worksite'});
  const bridgeExecution=execution('bridge',original.projected.envelope,bridgeGraph);
  function closed(name,owner,graph,value,implementationRef,locus){
    const cCallRef='c-call://mechanical/'+name,openedEventRef='lookup-open:'+name;
    const call={cCallRef,openedEventRef,basisId:owner.basisRef,runId:'run://mechanical/current',callClass:'leaf',regime:'F_D',
      graphFunctionRef:graph.name,implementationRef,implementationBindingRef:'binding://mechanical/'+name,programLocusRef:locus};
    const result={resultRef:'result://mechanical/'+name,resultDigest:hash({domain:'result-envelope',name}),resultClass:'success',value,admissionEventRef:'lookup-result:'+name};
    const judgment={judgmentRef:'judgment://mechanical/'+name,judgmentDigest:hash({domain:'judgment-envelope',name}),judgment:'advance',admissionEventRef:'lookup-judgment:'+name};
    synthetic.push({kind:'c_call_opened',eventId:openedEventRef,aggregateId:cCallRef,basisId:owner.basisRef,
      admissionOrdinal:2000+synthetic.length,payload:{programLocusRef:locus}});
    const resultEvent={kind:'c_call_result_admitted',eventId:result.admissionEventRef,aggregateId:cCallRef,basisId:owner.basisRef,
      admissionOrdinal:2000+synthetic.length,payload:result};
    synthetic.push(resultEvent,{kind:'c_call_judged',eventId:judgment.admissionEventRef,aggregateId:cCallRef,basisId:owner.basisRef,
      admissionOrdinal:2001+synthetic.length,payload:judgment});
    const state={cCall:call,result,judgment};lookups.calls.set(cCallRef,call);lookups.outcomes.set(cCallRef,state);
    return {call,result,judgment,resultEvent,state};
  }
  const bridge=closed('bridge',bridgeExecution,bridgeGraph,preparation,SEMANTIC_STAGE_IDS.bridgeImplementationRef,'node://mechanical/current-design-bridge@5');
  const entry=execution('entry',preparation,{...declared.graph,name:'graph-function://mechanical/entry@5'});
  const owner=execution('recovery',task,declared.graph,{parent:entry});
  const graph=materialize(declared.graph,owner);
  lookups.sets.set(owner.rootImplementationSetRef,{implementationSetDigest:owner.rootImplementationSetDigest,publicationDigest:hash(declared.publication)});
  const ids=product.WORKSITE_PRESERVED_RESULT_IDS;
  const prefixBody={...selector.historicalPrefix,prefixLength:selector.historicalPrefix.prefixLength+1,prefixDigest:hash('unadmitted lookup suffix')};
  delete prefixBody.coordinateDigest;
  const predecessorPrefix={...prefixBody,coordinateDigest:hash(prefixBody)};
  function open(name,implementationRef,bindingRef,inputContractRef,outputContractRef,inputRef,input){
    const cCallRef='c-call://mechanical/'+name,openedEventRef='lookup-open:'+name;
    const call={cCallRef,openedEventRef,basisId:owner.basisRef,runId:'run://mechanical/current',callClass:'leaf',regime:'F_D',
      graphFunctionRef:declared.graph.name,implementationRef,implementationBindingRef:bindingRef,programLocusRef:implementationRef===ids.authenticateImplementationRef?ids.authenticateLocusRef:ids.deriveLocusRef,
      graphCallId:'graph-call://mechanical/recovery',frameId:'frame://mechanical/recovery',inputContractRef,outputContractRef};
    const cursor={cursorRef:'cursor://mechanical/'+name,cursorDigest:hash(name+' cursor'),executionBasisRef:owner.basisRef,
      graphRef:graph.materializationRef,graphCallId:call.graphCallId,frameId:call.frameId,inputRef,inputDigest:hash(input)};
    synthetic.push({kind:'c_call_opened',eventId:openedEventRef,aggregateId:cCallRef,basisId:owner.basisRef,
      admissionOrdinal:2000+synthetic.length,payload:{cursorRef:cursor.cursorRef,cursorDigest:cursor.cursorDigest}});
    lookups.calls.set(cCallRef,call);lookups.cursors.set(cursor.cursorRef,cursor);
    const set=lookups.sets.get(owner.implementationSetRef)??{implementationSetDigest:owner.implementationSetDigest,rows:[]};
    set.rows.push({graphFunctionRef:call.graphFunctionRef,programLocusRef:call.programLocusRef,implementationRef,implementationBindingRef:bindingRef,inputContractRef,outputContractRef,computeRegime:'F_D'});
    lookups.sets.set(owner.implementationSetRef,set);
    return {publication:declared.publication,graph,graphFunction:declared.graph,executionBasis:owner,cCall:call,cursor,predecessorPrefix};
  }
  const authBasis=open('authenticate',ids.authenticateImplementationRef,ids.authenticateBindingRef,product.WORKSITE_CONSTRUCTION_IDS.taskContractRef,
    ids.artifactContractRef,owner.rawInputAdmissionRef,task);
  const nativePath=resolve(packageRoot,'build/code/src/abg/worksite_construction_recovery.js');
  const cache=(map,key,fn)=>{if(!map.has(key))map.set(key,fn());return map.get(key);};
  const modules={
    './event_store.js':{readRuntimeEventsAtDurablePrefix:p=>{
      if(p.coordinateDigest===selector.historicalPrefix.coordinateDigest){++count.historicalReads;return historicalRows;}
      if(p.coordinateDigest===predecessorPrefix.coordinateDigest){++count.currentReads;return [...original.events,...synthetic];}
      throw Error('lookup-only prefix not selected');
    }},
    './event_prefix.js':{selectValidatedRuntimeEventPrefix:rows=>rows.length===original.events.length&&rows===historicalRows?original.prefix:currentPrefix,
      runtimeEventsFromValidatedPrefix:p=>p===currentPrefix?[...original.events,...synthetic]:historicalRows},
    './execution_basis.js':{rehydrateExecutionBasisAtPrefix:(_p,ref)=>lookups.executions.get(ref)??cache(oldCache.executions,ref,()=>basisApi.rehydrateExecutionBasisAtPrefix(original.prefix,ref)),
      rehydrateAdmittedImplementationSetAtPrefix:(_p,ref)=>lookups.sets.get(ref)??null},
    './c_call.js':{projectOpenedCCallCarrierAtPrefix:(_p,g,ref)=>lookups.calls.get(ref)??cache(oldCache.calls,ref,()=>callApi.projectOpenedCCallCarrierAtPrefix(original.prefix,g,ref)),
      projectAdmittedCCallStateAtPrefix:(_p,c,r,j)=>lookups.outcomes.get(c.cCallRef)??cache(oldCache.outcomes,c.cCallRef,()=>callApi.projectAdmittedCCallStateAtPrefix(original.prefix,c,r,j)),
      projectCCallCarrierPhaseAtPrefix:(_p,c)=>({phase:lookups.outcomes.has(c.cCallRef)?'judged':'selected_no_evidence'})},
    './traversal_cursor.js':{hasAdmittedTraversalCursorAtPrefix:(_p,c)=>hash(lookups.cursors.get(c.cursorRef)??null)===hash(c)},
    './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:p=>p.coordinateDigest===selector.historicalPrefix.coordinateDigest?original.environment:
      {...original.environment,workspaceBinding:task.workspaceBinding,workspaceAuthorityBasis:task.workspaceAuthorityBasis}},
    './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:(_p,ref)=>ref===owner.invocationAdmissionRef?{capabilityGrants:[task.capabilityGrant]}:null},
    './actor_process.js':{projectActorProcessLifecycle:(_p,ref)=>actorApi.projectActorProcessLifecycle(original.prefix,ref)},
    'node:fs':{readFileSync:(path,...args)=>{
      const bytes=readFileSync(path,...args);
      if(String(path).startsWith(task.workspaceAuthorityBasis.canonicalRoot+'/')){++count.physicalReads;return physicalMutation?physicalMutation(path,bytes):bytes;}
      ++count.archiveReads;return bytes;
    }},
  };
  const module=new SourceTextModule(readFileSync(nativePath,'utf8'),{identifier:nativePath}),links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const native=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(nativePath),specifier)).href);
    const exports={...native,...modules[specifier]},linked=new SyntheticModule(Object.keys(exports),function(){for(const [key,value]of Object.entries(exports))this.setExport(key,value);});
    links.set(specifier,linked);return linked;
  });
  await module.evaluate();
  function deriveBasis(artifact){
    const call=authBasis.cCall,result={resultRef:'result://mechanical/authenticate',resultDigest:hash('native result envelope, not value hash'),
      resultClass:'success',value:artifact,admissionEventRef:'lookup-result:authenticate'};
    const judgment={judgmentRef:'judgment://mechanical/authenticate',judgmentDigest:hash('auth judgment'),judgment:'advance',admissionEventRef:'lookup-judgment:authenticate'};
    synthetic.push({kind:'c_call_result_admitted',aggregateId:call.cCallRef,basisId:owner.basisRef,eventId:result.admissionEventRef,admissionOrdinal:2000+synthetic.length,payload:result},
      {kind:'c_call_judged',aggregateId:call.cCallRef,basisId:owner.basisRef,eventId:judgment.admissionEventRef,admissionOrdinal:2001+synthetic.length,payload:judgment});
    lookups.outcomes.set(call.cCallRef,{cCall:call,result,judgment});
    return open('derive',ids.deriveImplementationRef,ids.deriveBindingRef,ids.artifactContractRef,product.WORKSITE_CONSTRUCTION_IDS.candidateBundleContractRef,result.resultRef,artifact);
  }
  return {native:module.namespace,original,task,preparation,declared,owner,graph,authBasis,deriveBasis,lookups,synthetic,currentPrefix,bridge,count,
    mutateHistory:fn=>{historicalRows=fn(original.events);},mutatePhysical:fn=>{physicalMutation=fn;},
    resetHistory:()=>{historicalRows=original.events;},resetPhysical:()=>{physicalMutation=null;}};
}
