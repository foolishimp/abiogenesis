import {writeFileSync} from 'node:fs';
import {checkReadCall} from './owner-checks.mjs';
// Finite ordinary Public caller. No private imports, source dispatch or retries.
import assert from 'node:assert/strict';
import {readFile,writeFile,open} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {loadRuntime,declaredCli,constructStart} from './public-support.mjs';
export const here=import.meta.dirname,schemaVersion='5.0.0';
export const read=async p=>JSON.parse(await readFile(p,'utf8'));
export async function caller(mode, nominalVerification, driverDeadline, outputRoot){
 assert.equal(outputRoot,join(dirname(here),'final-f11-native-assessment-execution-02'));
 const write=(n,v)=>writeFile(join(outputRoot,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
 const packageIdentity=await read(join(here,'selected-core.json')),prospect=await read(join(here,'prospective-cases.json'));
 const r=await loadRuntime(packageIdentity.installedRoot),{product,abg,public:installedPublic}=r,hash=product.sha256Canonical,cli=await declaredCli(packageIdentity.installedRoot);
 const core=prospect.core,verification=nominalVerification,verified=verification.verifiedArtifact;
 const ownerRequest=verificationRequest(core),contractCatalog={productId:verified.productId,productContentDigest:verified.productContentDigest,catalogId:verified.catalogId,catalogVersion:schemaVersion,catalogDigest:verified.catalogDigest};
 const coord=(ref,value={ref})=>({ref,digest:hash(value)}),base='abiogenesis/t287/final-f11-current-resource-caller-02',actorRef='actor://abiogenesis/t287/final-native-setup-03/operator';
 const op={actorRef,attributionRef:'attribution://'+base,authorityRef:'authority://'+base,approvalRef:'approval://'+base,requestBaseRef:'request://'+base,correlationRef:'correlation://'+base,provenanceRefs:[pathToFileURL(join(here,'worker-activation.json')).href,pathToFileURL(join(here,'prospective-cases.json')).href]};
 const state={closeHandoff:null,environment:null,catalog:null,catalogView:null,binding:null,resolvedLock:null,calls:[]};
 const budgets=await read(join(here,'budgets.json')),taskEnvironment=await read(join(here,'runtime-environment.json'));
 const physicalLog=[];
 async function physical(label){const f=(await read(join(here,'resource-plan.json'))).eventLogPath;try{const fs=await import('node:fs/promises'),crypto=await import('node:crypto'),before=await fs.stat(f),b=await fs.readFile(f),after=await fs.stat(f);const lock=join(taskEnvironment.TMPDIR,'abiogenesis-event-store-locks-v5',String(after.dev)+'-'+String(after.ino)+'.lock');let lockPresent=false;try{await fs.stat(lock);lockPresent=true;}catch(e){if(e.code!=='ENOENT')throw e;}const row={label,path:f,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),device:after.dev,inode:after.ino,stable:before.dev===after.dev&&before.ino===after.ino&&before.size===after.size&&before.mtimeMs===after.mtimeMs,lockPath:lock,lockPresent,prefix:state.closeHandoff?.prefix??null};physicalLog.push(row);await write(mode+'-'+label+'-physical.json',row);assert.equal(row.stable,true);assert.equal(lockPresent,false);return row;}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 const actor={actor:coord(actorRef),attribution:coord(op.attributionRef)};
 const boundSlots=()=>({workspace_binding:state.binding,product_set:state.environment.productInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:state.resolvedLock.lockId,digest:state.resolvedLock.lockDigest},actor});
 const reopen=()=>({kind:'reopen_abg_event_resource',schemaVersion,closeHandoff:state.closeHandoff,handoffDigest:hash(state.closeHandoff)});
 const refresh=()=>{state.environment=abg.projectExactPrefixWorkspaceEnvironment(state.closeHandoff.prefix,state.binding);assert.equal(state.environment.kind,'exact_prefix_workspace_environment');return state.environment;};
 let authorizationSequence=0;
 async function authorized(packet,request,resources,supplied={}){
  const constructionIndex=authorizationSequence++;
  const definition=installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d=>d.definitionKey.operationId===packet.definitionKey.operationId&&d.definitionKey.memberKey===packet.definitionKey.memberKey);assert.ok(definition);
  const slots={workspace_binding:null,product_set:null,dependency_lock:null,catalog_scope:null,execution_program:null,graph_function:null,input_contract:null,session_policy:null,capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],grants:[]},actor:null,transport_steering:null,verification_references:null,execution_basis:null,...supplied};
  const basis={kind:'admission_capability_data',schemaVersion,definition:{definitionKey:definition.definitionKey,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,owner:{ref:packet.owner.authorityRef,digest:packet.owner.authorityDigest}},ownerArtifact:{request:ownerRequest,verified},request,resourceScope:{resourcesDigest:hash(resources),authoritySlots:product.admissionAuthoritySlots(slots)},boundEnvironment:packet.metadata.workspaceBindingRequirement==='forbidden'?null:product.admissionEnvironmentSelection(state.closeHandoff.prefix,slots.workspace_binding)};
  const authorityValue={actorRef,authorityMode:'trusted_developer'},approvalValue={decision:'allow',actorRef,definitionRef:definition.definitionRef,definitionDigest:definition.definitionDigest,requestDigest:hash(request),scopeDigest:product.admissionAuthorityScope(basis).digest};
  const authority={kind:'resolved_admission_authority',schemaVersion,actorRef,authorityMode:'trusted_developer',authority:{...coord(op.authorityRef,authorityValue),value:authorityValue},approval:{...coord(op.approvalRef+'/'+mode+'/'+constructionIndex,approvalValue),value:approvalValue}};
  const grants=await Promise.all(definition.capabilityRefs.map(cap=>product.constructCapabilityGrant(authority,actorRef,definition.definitionKey.operationId,cap,{kind:'admission_capability_grant_construction_basis',fixedPacket:packet,data:basis})));
  await write(mode+'-authorization-'+constructionIndex+'.json',{basis,authority,grants,scope:product.admissionAuthorityScope(basis),claim:'Actual current selection/scope/approval/grants before native invocation; selection is not an admitted environment'});
  return installedPublic.constructInstalledPublicDefinitionCall({product,installedPublic,definitionContractCoordinates:verified.definitionContractCoordinates,contractCatalog,...packet.definitionKey,request,slots:{...slots,capability_grants:{requiredCapabilityRefs:[...definition.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}},resources:{...resources,admissionAuthority:{basis,authority,grants}},requestRef:op.requestBaseRef+'/'+mode+'/'+constructionIndex,correlationRef:op.correlationRef,eventTime:new Date().toISOString(),provenanceRefs:op.provenanceRefs});
 }
 async function invoke(label,call,stage='setup'){
  assert.equal(label,budgets.operationPlan[state.calls.length],'exact assessment view/conformance/start/two-read population/order');
  const stem=join(outputRoot,mode+'-'+label),resource=call.resources.eventResource,acquisition=resource===undefined?{kind:'eventless'}:resource.kind==='new_abg_event_resource'?{kind:'new',eventLogPath:resource.eventLogPath}:{kind:'reopen',closeHandoff:resource.closeHandoff};
  await writeFile(stem+'.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion,acquisition,invocation:call})+'\n',{flag:'wx'});
  const out=await open(stem+'-stdout.json','wx'),err=await open(stem+'-stderr.log','wx');
  const started=performance.now();let processFailure=null,terminal;const remaining=driverDeadline.deadline-performance.now();assert.ok(remaining>0,'finite driver deadline');const capMs=Math.min(budgets.stages[stage],remaining-1000);assert.ok(capMs>0,'termination grace preserved');await write(mode+'-'+label+'-command.json',{command:[process.execPath,cli,'--jsonl',stem+'.jsonl'],cwd:packageIdentity.installedRoot,environment:taskEnvironment,budgetMs:capMs,driverRemainingMs:remaining});
  try{
   terminal=await new Promise(resolve=>{
    const child=spawn('python3',[join(here,'observe-process.py'),stem+'-native-process.json',process.execPath,cli,'--jsonl',stem+'.jsonl'],{cwd:packageIdentity.installedRoot,env:{...process.env,...taskEnvironment},detached:true,stdio:['ignore',out.fd,err.fd]});
    writeFileSync(stem+'-process-start.json',JSON.stringify({pid:child.pid,processGroup:child.pid,command:[process.execPath,cli,'--jsonl',stem+'.jsonl'],startedAt:new Date().toISOString(),mode,label,capMs},null,2)+'\n',{flag:'wx'});
    let timedOut=false,spawnError=null,killTimer;
    const signal=sig=>{try{process.kill(-child.pid,sig);}catch(e){if(e.code!=='ESRCH')throw e;}};
    const timer=setTimeout(()=>{timedOut=true;signal('SIGTERM');killTimer=setTimeout(()=>signal('SIGKILL'),1000);},capMs);
    child.once('error',error=>{spawnError=String(error);});
    child.once('close',(code,signal)=>{clearTimeout(timer);clearTimeout(killTimer);resolve({pid:child.pid??null,code,signal,timedOut,spawnError});});
   });
   if(terminal.code!==0||terminal.signal!==null||terminal.timedOut||terminal.spawnError)processFailure=terminal;
  }finally{await out.close();await err.close();}
  const elapsedMs=performance.now()-started;await write(mode+'-'+label+'-timing.json',{elapsedMs,processFailure,terminal,stage,budgetMs:budgets.stages[stage],capture:'stdout/stderr descriptors opened before spawn'});
  const stdout=await readFile(stem+'-stdout.json','utf8');
  let transport;try{transport=JSON.parse(stdout);}catch{throw Error(label+': no complete transport receipt; '+JSON.stringify(processFailure));}
  assert.equal(transport.kind,'installed_definition_call_transport_result');const receipt=transport.receipt;
  if(receipt.resources?.eventResource?.closeHandoff)state.closeHandoff=receipt.resources.eventResource.closeHandoff;
  const row={label,definitionKey:call.invocation.definitionKey,invocationRef:call.invocation.invocationRef,outcomeKind:receipt.ownerOutput?.outcomeKind,elapsedMs,processFailure};state.calls.push(row);await write(mode+'-'+label+'-handoff.json',{closeHandoff:state.closeHandoff,calls:state.calls});console.log(JSON.stringify(row));
  await physical(label);
  assert.equal(terminal.timedOut,false);assert.equal(terminal.signal,null);assert.equal(terminal.spawnError,null);
  if(stage==='setup'){assert.equal(processFailure,null,JSON.stringify(processFailure));assert.equal(receipt.ownerOutput?.outcomeKind,'result',JSON.stringify(receipt));assert.equal(receipt.exitCode,0,JSON.stringify(receipt));}
  return {call,receipt,processFailure,terminal,returnedHandoff:receipt.resources?.eventResource?.closeHandoff??null};
 }
 async function prepareConformance(programRef,label,publicationInputs){
  const publication=publicationInputs.modulePublications.find(p=>p.programs.some(p=>p.programRef===programRef)),program=publication.programs.find(p=>p.programRef===programRef),law=coord('law://abiogenesis/validator/gtl-program@5');
  const call=await authorized(r.validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,{program:coord(programRef,program),conformanceLaw:law,inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(p=>coord(p.moduleRef,p)).sort((a,b)=>a.ref.localeCompare(b.ref))}},{kind:'conformance_evaluation_resource_assertion',schemaVersion,packet:{kind:'conformance_evaluate_packet',schemaVersion,memberKey:'gtl_program',publication,program},conformanceLaw:law,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:state.catalogView}},boundSlots());
  return {label,program,call};
 }
 async function prepareStart(programRef,graphFunctionHandle,inputFactory,label){
  refresh();const selection={programRef,selection:{kind:'start',scope:'program',target:'graph_function',graphFunctionHandle,until:'converged',rootMode:'direct'},fhMode:'direct',sourceBasis:{kind:'none'},inputRef:'input://'+base+'/'+label,requestRef:op.requestBaseRef+'/'+label,correlationRef:op.correlationRef,provenanceRefs:op.provenanceRefs};
  const s=await constructStart({environment:{...state.environment,product,abg,catalog:state.catalog,catalogView:state.catalogView,admittedInstalls:state.environment.productInstalls,verified},publicApi:installedPublic,eventResource:reopen(),inputFactory,selection});return s;
 }
 async function freshReads(label,started){
  const run=started.receipt.ownerOutput?.value?.run;assert.ok(run&&state.closeHandoff);const closed=state.closeHandoff;refresh();const reads={};
  for(const memberKey of ['run_result','run_replay']){
   const packet=abg.ABG_PROJECT_READ_CONTRACTS[memberKey],originalSlots=started.call.invocation.invocationAuthority.slots;
   const grants=packet.metadata.capabilityRefs.map(cap=>product.constructCapabilityGrant(state.environment.workspaceAuthorityBasis,actorRef,packet.definitionKey.operationId,cap,{admittedInstalls:state.environment.productInstalls,workspaceBinding:state.environment.workspaceBinding,fixedPacket:packet}));
   const slots=Object.fromEntries(Object.keys(originalSlots).map(k=>[k,null]));Object.assign(slots,{workspace_binding:originalSlots.workspace_binding,product_set:originalSlots.product_set,dependency_lock:originalSlots.dependency_lock,capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))}});
   const request={caseKey:memberKey,source:{sourceKind:'run',sourceRef:run.ref,sourceDigest:run.digest},projectionBasis:{projectionBasisRef:closed.prefix.eventLogRef,projectionBasisDigest:closed.prefix.coordinateDigest},selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:1000}:{kind:'none'}};
   const call=installedPublic.constructInstalledPublicDefinitionCall({product,installedPublic,definitionContractCoordinates:verified.definitionContractCoordinates,contractCatalog,...packet.definitionKey,request,slots,resources:{kind:'abg_project_read_resource_assertion',schemaVersion,eventResource:{kind:'reopen_abg_event_resource',schemaVersion,closeHandoff:state.closeHandoff,handoffDigest:hash(state.closeHandoff)}},requestRef:op.requestBaseRef+'/'+label+'/'+memberKey,correlationRef:op.correlationRef+'/fresh-read',eventTime:new Date().toISOString(),provenanceRefs:op.provenanceRefs});
   await checkReadCall({product,abg,call,state,verified,run,closed,grants,write,label:label+'-'+memberKey});
   reads[memberKey]=(await invoke(label+'-'+memberKey,call,'read')).receipt;assert.deepEqual(state.closeHandoff.prefix,closed.prefix);
  }
  return reads;
 }
 return {...r,installedPublic,hash,coord,actor,op,state,core,verified,verification,ownerRequest,prospect,contractCatalog,packageIdentity,authorized,invoke,prepareConformance,prepareStart,freshReads,reopen,refresh,boundSlots,physical,physicalLog};
}
export function verificationRequest(item){return {artifactPath:item.artifactPath,artifactRef:item.artifactRef,...Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,item.basis[k[0].toLowerCase()+k.slice(1)]]))};}
