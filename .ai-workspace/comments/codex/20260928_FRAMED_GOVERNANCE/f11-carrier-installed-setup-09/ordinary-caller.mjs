// DRAFT: one finite ordinary Public caller. Invocation is separately activated in a fresh output root.
import {writeFileSync} from 'node:fs';
import {declaredInventoryConformanceResources} from './conformance-resources.mjs';
// Finite ordinary Public caller. No private imports, source dispatch or retries.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {loadRuntime,declaredCli} from './public-support.mjs';
export const schemaVersion='5.0.0';
export const read=async p=>JSON.parse(await readFile(p,'utf8'));
export async function caller(mode, nominalVerification, driverDeadline, executionRoot){
 const here=executionRoot;
 const write=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
 const activation=await read(join(here,'runtime-activation.json'));
 assert.equal(activation.kind,'root_runtime_execution_activation');
 assert.equal(activation.operation,(await read(join(here,'controls/acceptance.json'))).releasedConditionalOperation);
 assert.equal(activation.executionRoot,here);
 assert.equal(activation.realProviderCalls,0);

 const packageIdentity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
 const r=await loadRuntime(packageIdentity.installedRoot),{product,abg,public:installedPublic}=r,hash=product.sha256Canonical,cli=await declaredCli(packageIdentity.installedRoot);
 const core=prospect.core,verification=nominalVerification,verified=verification.verifiedArtifact;
 const ownerRequest=verificationRequest(core),contractCatalog={productId:verified.productId,productContentDigest:verified.productContentDigest,catalogId:verified.catalogId,catalogVersion:schemaVersion,catalogDigest:verified.catalogDigest};
 const coord=(ref,value={ref})=>({ref,digest:hash(value)}),base=activation.callerIdentity.base,actorRef=activation.callerIdentity.actorRef;
 const op={actorRef,attributionRef:'attribution://'+base,authorityRef:'authority://'+base,approvalRef:'approval://'+base,requestBaseRef:'request://'+base,correlationRef:'correlation://'+base,provenanceRefs:[pathToFileURL(join(here,'runtime-activation.json')).href,pathToFileURL(join(here,'prospective-cases.json')).href]};
 const state={closeHandoff:null,environment:null,catalog:null,catalogView:null,binding:null,resolvedLock:null,calls:[]};
 const budgets=await read(join(here,'budgets.json')),taskEnvironment=await read(join(here,'runtime-environment.json'));
 const physicalLog=[];
 async function physical(label){const f=(await read(join(here,'resource-plan.json'))).eventLogPath;try{const fs=await import('node:fs/promises'),crypto=await import('node:crypto'),before=await fs.stat(f),b=await fs.readFile(f),after=await fs.stat(f);const lock=join(taskEnvironment.TMPDIR,'abiogenesis-event-store-locks-v5',String(after.dev)+'-'+String(after.ino)+'.lock');let lockPresent=false;try{await fs.stat(lock);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}const row={label,path:f,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),device:after.dev,inode:after.ino,stable:before.dev===after.dev&&before.ino===after.ino&&before.size===after.size&&before.mtimeMs===after.mtimeMs,lockPath:lock,lockPresent,prefix:state.closeHandoff?.prefix??null};physicalLog.push(row);await write(mode+'-'+label+'-physical.json',row);assert.equal(row.stable,true);assert.equal(lockPresent,false);return row;}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 const actor={actor:coord(actorRef),attribution:coord(op.attributionRef)};
 const boundSlots=()=>({workspace_binding:state.binding,product_set:state.environment.productInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest},actor});
 const reopen=()=>({kind:'reopen_abg_event_resource',schemaVersion,closeHandoff:state.closeHandoff,handoffDigest:hash(state.closeHandoff)});
 const refresh=()=>{state.environment=abg.projectExactPrefixWorkspaceEnvironment(state.closeHandoff.prefix,state.binding);assert.equal(state.environment.kind,'exact_prefix_workspace_environment');return state.environment;};
 async function authorized(packet,request,resources,supplied={}){
  const definition=installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===packet.definitionKey.operationId&&d.definitionKey.memberKey===packet.definitionKey.memberKey);assert.ok(definition);
  const slots={workspace_binding:null,product_set:null,dependency_lock:null,catalog_scope:null,execution_program:null,graph_function:null,input_contract:null,session_policy:null,capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],grants:[]},actor:null,transport_steering:null,verification_references:null,execution_basis:null,...supplied};
  const basis={kind:'admission_capability_data',schemaVersion,definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},ownerArtifact:{request:ownerRequest,verified},request,resourceScope:{resourcesDigest:hash(resources),authoritySlots:product.admissionAuthoritySlots(slots)},boundEnvironment:packet.metadata.workspaceBindingRequirement==='forbidden'?null:product.admissionEnvironmentSelection(state.closeHandoff.prefix,slots.workspace_binding)};
  const authorityValue={actorRef,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(request),scopeDigest:product.admissionAuthorityScope(basis).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion,actorRef,authorityMode:'trusted_developer',authority:{...coord(op.authorityRef,authorityValue),value:authorityValue},approval:{...coord(op.approvalRef+'/'+mode+'/'+state.calls.length,approvalValue),value:approvalValue}};
  const grants=await Promise.all(definition.capabilityRefs.map(cap=>product.constructCapabilityGrant(authority,actorRef,definition.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data:basis})));
  await write(mode+'-authorization-'+state.calls.length+'.json',{basis,authority,grants,scope:product.admissionAuthorityScope(basis),claim:'Actual current selection/scope/approval/grants before native invocation; selection is not an admitted environment'});
  return installedPublic.constructInstalledPublicDefinitionCall({product,installedPublic,definitionContractCoordinates:verified.definitionContractCoordinates,contractCatalog,...packet.definitionKey,request,slots:{...slots,capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}},resources:{...resources,admissionAuthority:{basis,authority,grants}},requestRef:op.requestBaseRef+'/'+mode+'/'+state.calls.length,correlationRef:op.correlationRef,eventTime:new Date().toISOString(),provenanceRefs:op.provenanceRefs});
 }
 async function invoke(label,call,stage='setup',expectedOutcomeKind='result'){
  assert.ok(['result','non_terminal','refusal'].includes(expectedOutcomeKind),'case explicitly selects typed Public outcome class');
  const definition=installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===call.invocation.definitionKey.operationId&&d.definitionKey.memberKey===call.invocation.definitionKey.memberKey);assert.ok(definition);
  const adapterExitMap=definition.adapterExitMap;assert.ok(adapterExitMap,'actual selected definition owns adapter mapping');
  const expectedExitCode=adapterExitMap[expectedOutcomeKind==='result'?'acceptedTerminal':expectedOutcomeKind==='non_terminal'?'acceptedNonTerminal':'refused'];assert.notEqual(expectedExitCode,null,'selected Public declaration admits expected outcome');
  const stem=join(here,mode+'-'+label),resource=call.resources.eventResource,acquisition=resource===undefined?{kind:'eventless'}:resource.kind==='new_abg_event_resource'?{kind:'new',eventLogPath:resource.eventLogPath}:{kind:'reopen',closeHandoff:resource.closeHandoff};
  await writeFile(stem+'.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion,acquisition,invocation:call})+'\n',{flag:'wx'});
  const out=await open(stem+'-stdout.json','wx'),err=await open(stem+'-stderr.log','wx');
  const started=performance.now();let processFailure=null,terminal;const remaining=driverDeadline-performance.now();assert.ok(remaining>0,'finite driver deadline');const capMs=Math.min(budgets.stages[stage],remaining-1000);assert.ok(capMs>0,'termination grace preserved');await write(mode+'-'+label+'-command.json',{command:[process.execPath,cli,'--jsonl',stem+'.jsonl'],cwd:packageIdentity.installedRoot,environment:taskEnvironment,budgetMs:capMs,driverRemainingMs:remaining,expectedOutcomeKind,expectedExitCode,selectedDefinition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,adapterExitMap}});
  try{
   terminal=await new Promise(resolve=>{
    const child=spawn("/Users/jim/.pyenv/versions/3.11.5/bin/python3.11",[join(here,'observe-process.py'),stem+'-native-process.json',process.execPath,cli,'--jsonl',stem+'.jsonl'],{cwd:packageIdentity.installedRoot,env:{...process.env,...taskEnvironment},detached:true,stdio:['ignore',out.fd,err.fd]});
    writeFileSync(stem+'-process-start.json',JSON.stringify({pid:child.pid,processGroup:child.pid,command:[process.execPath,cli,'--jsonl',stem+'.jsonl'],startedAt:new Date().toISOString(),mode,label,capMs},null,2)+'\n',{flag:'wx'});
    let timedOut=false,spawnError=null,killTimer;
    const signal=sig=>{try{process.kill(-child.pid,sig);}catch(e){if(e.code!=='ESRCH')throw e;}};
    const timer=setTimeout(()=>{timedOut=true;signal('SIGTERM');killTimer=setTimeout(()=>signal('SIGKILL'),1000);},capMs);
    child.once('error',error=>{spawnError=String(error);});
    child.once('close',(code,signal)=>{clearTimeout(timer);clearTimeout(killTimer);resolve({pid:child.pid??null,code,signal,timedOut,spawnError});});
   });
   if(terminal.code!==expectedExitCode||terminal.signal!==null||terminal.timedOut||terminal.spawnError)processFailure=terminal;
  }finally{await out.close();await err.close();}
  const elapsedMs=performance.now()-started;await write(mode+'-'+label+'-timing.json',{elapsedMs,processFailure,terminal,stage,budgetMs:budgets.stages[stage],capture:'stdout/stderr descriptors opened before spawn'});
  const stdout=await readFile(stem+'-stdout.json','utf8');
  let transport;try{transport=JSON.parse(stdout);}catch{throw Error(label+': no complete transport receipt; '+JSON.stringify(processFailure));}
  assert.equal(transport.kind,'installed_definition_call_transport_result');const receipt=transport.receipt;
  if(receipt.resources?.eventResource?.closeHandoff)state.closeHandoff=receipt.resources.eventResource.closeHandoff;
  const row={label,definitionKey:call.invocation.definitionKey,invocationRef:call.invocation.invocationRef,outcomeKind:receipt.ownerOutput?.outcomeKind,elapsedMs,processFailure};state.calls.push(row);await write(mode+'-'+label+'-handoff.json',{closeHandoff:state.closeHandoff,calls:state.calls});console.log(JSON.stringify(row));
  assert.equal(processFailure,null,JSON.stringify(processFailure));assert.equal(receipt.ownerOutput?.outcomeKind,expectedOutcomeKind,JSON.stringify(receipt));assert.equal(receipt.exitCode,expectedExitCode,JSON.stringify(receipt));await physical(label+'-after');return {call,receipt};
 }
 async function conformance(programRef,label,publicationInputs){
  const publication=publicationInputs.modulePublications.find(p=>p.programs.some(p=>p.programRef===programRef)),program=publication.programs.find(p=>p.programRef===programRef),law=coord('law://abiogenesis/validator/gtl-program@5');
  const res=await invoke(label,await authorized(r.validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,{program:coord(programRef,program),conformanceLaw:law,inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},declaredInventoryConformanceResources({publication,program,conformanceLaw:law,declaredInventory:state.catalog.boundPublications,catalog:state.catalog,catalogView:state.catalogView}),boundSlots()),'conformance');
  assert.equal(res.receipt.ownerOutput.value.disposition,'passed',JSON.stringify(res.receipt));return program;
 }
 return {...r,installedPublic,hash,coord,actor,op,state,core,verified,verification,ownerRequest,prospect,contractCatalog,packageIdentity,authorized,invoke,conformance,reopen,refresh,boundSlots,physical,physicalLog};
}
export function verificationRequest(item){return {artifactPath:item.artifactPath,artifactRef:item.artifactRef,...Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,item.basis[k[0].toLowerCase()+k.slice(1)]]))};}
