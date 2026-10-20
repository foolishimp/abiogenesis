import assert from 'node:assert/strict';
import {readFile,writeFile,stat,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const record=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const selected=JSON.parse(await readFile(join(root,'inputs.json'),'utf8'));
const digest=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const pin=async row=>{const bytes=await readFile(row.path);assert.equal(bytes.length,row.byteCount);assert.equal(digest(bytes),'sha256:'+row.sha256);return bytes;};
for(const row of [...selected.references,...selected.ownerFiles])await pin(row);
const close=JSON.parse(await readFile(selected.selectedClose,'utf8'));
const physical=async()=>{const s=await stat(selected.logStat.path,{bigint:true});return {path:selected.logStat.path,bytes:Number(s.size),device:Number(s.dev),inode:Number(s.ino),mtimeNs:String(s.mtimeNs)};};
const quiet=async()=>{
 const locks=[];for(const path of selected.locks){try{await access(path);locks.push(path);}catch(e){if(e.code!=='ENOENT')throw e;}}
 const processes=execFileSync('ps',['-axo','pid=,ppid=,pgid=,args='],{encoding:'utf8'}).split('\n').filter(line=>line.includes('/library-joint-proof-237/')&&/(?:cli\.js|responder\.mjs)/.test(line)&&/(?:^|\s)(?:\S*\/)?node(?:\s|$)/.test(line));
 assert.equal(locks.length,0);assert.equal(processes.length,0);return {locks,processes};
};
const checkPhysical=async()=>{assert.deepEqual(await physical(),selected.logStat);for(const row of selected.protectedFiles)await pin(row);return {logStat:await physical(),quiet:await quiet(),protectedFiles: selected.protectedFiles};};
await checkPhysical();
const {installedModules}=await import(pathToFileURL(selected.publicSetup.path).href);
const runtime=await installedModules(selected.installedOwnerRoot),a=runtime.abg,p=runtime.product,hash=p.sha256Canonical;
const load=name=>import(pathToFileURL(join(selected.installedOwnerRoot,'build/code/src',name+'.js')).href);
const prefixes=await load('abg/event_prefix'),assemblyOwner=await load('abg/instruction_assembly');
const commandOwner=await load('product/worksite_command_execution'),forwardOwner=await load('product/worksite_command_forward'),actorOwner=await load('abg/actor_process');
const started=performance.now();let resource=null,stage='acquire';
const compactText=text=>({byteCount:Buffer.byteLength(text),digest:digest(Buffer.from(text)),...(Buffer.byteLength(text)<=2048?{text}:{textNotCopied:true})});
try{
 const request={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:close,handoffDigest:hash(close)};
 const acquired=a.acquireAbgEventResource(request);
 if(acquired.kind!=='acquired_abg_event_resource'){await record('owner-refusal.json',acquired);throw new Error('Selected resource owner refused');}
 resource=acquired.resource;
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store);assert.deepEqual(durable,close.prefix);
 const prefix=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);
 await record('acquisition.json',{kind:acquired.kind,requestDigest:hash(request),prefix:durable,elapsedMs:performance.now()-started});
 stage='select_exact_occurrence';
 const run=prefixes.indexedRuntimeEventEnvelopes(prefix,'run:'+selected.runRef);
 const row=envelope=>{const event=prefixes.runtimeEventAtPrefix(prefix,envelope.eventId);assert(event);assert.equal(hash(event.payload),event.payloadDigest);return event;};
 const binding=row({eventId:selected.transportEventRef});
 assert.equal(binding.kind,'actor_transport_binding_admitted');assert.equal(binding.admissionOrdinal,selected.transportOrdinal);assert.equal(binding.basisId,selected.basisRef);assert.equal(binding.payload.cCallRef,selected.cCallRef);assert.equal(binding.runId,selected.runRef);
 const kinds=new Set(['c_call_opened','c_call_fibre_selected','basis_admitted','actor_invocation_started','actor_process_started','actor_process_stdout_observed','actor_process_stderr_observed','actor_process_exited','actor_result_artifact_observed','actor_invocation_failed','actor_invocation_closed','c_call_result_admitted']);
 const events=run.filter(e=>e.basisId===selected.basisRef&&kinds.has(e.kind)).map(row);
 const one=(kind,filter=()=>true)=>{const rows=events.filter(e=>e.kind===kind&&filter(e));assert.equal(rows.length,1,'exact selected '+kind);return rows[0];};
 const opened=one('c_call_opened',e=>e.aggregateId===selected.cCallRef),fibre=one('c_call_fibre_selected',e=>e.aggregateId===selected.cCallRef);
 const execution=runtime.invocationTruth.projectExactExecutionBasisAtPrefix(prefix,selected.basisRef);assert(execution);
 const task=execution.rawInputValue;assert.equal(hash(task),execution.rawInputDigest);
 const native=binding.payload.instructionAssembly;assert(native&&native.request);assert.equal(hash(native.plan),native.planDigest);assert.equal(hash(native.envelope),native.envelopeDigest);assert.equal(hash(native.manifest),native.manifestDigest);
 const actualRequest=native.request;
 const observationEvent=one('actor_result_artifact_observed',e=>e.payload.cCallRef===selected.cCallRef),start=one('actor_invocation_started',e=>e.payload.cCallRef===selected.cCallRef);
 const terminal=events.filter(e=>['actor_invocation_failed','actor_invocation_closed'].includes(e.kind)&&e.payload.cCallRef===selected.cCallRef);assert.equal(terminal.length,1);
 assert.equal(terminal[0].payload.consumedArtifactEventRef,observationEvent.eventId);
 assert.equal(hash(actualRequest),start.payload.requestDigest);assert.equal(hash(actualRequest),observationEvent.payload.requestDigest);
 assert.equal(hash(actualRequest.prompt),binding.payload.promptDigest);assert.equal(hash(actualRequest.responseJsonSchema),binding.payload.responseJsonSchemaDigest);
 const {cCallRef:ignoredCall,requestRef:ignoredRef,requestDigest:ignoredDigest,...observation}=observationEvent.payload;
 const carrier=actorOwner.validateActorProcessCarrierPair(actualRequest,observation);
 await record('selected-events.json',{prefix:durable,runRef:selected.runRef,basisRef:selected.basisRef,cCallRef:selected.cCallRef,events:[binding,...events].map(e=>({eventId:e.eventId,kind:e.kind,admissionOrdinal:e.admissionOrdinal,aggregateId:e.aggregateId,parentAggregateId:e.parentAggregateId,basisId:e.basisId,payloadDigest:e.payloadDigest,causationEventRefs:e.causationEventRefs,...(['actor_process_started','actor_process_stdout_observed','actor_process_stderr_observed','actor_process_exited','actor_invocation_failed','actor_invocation_closed'].includes(e.kind)?{payload:e.payload}:{})})),carrierValidation:{kind:carrier.kind,disposition:carrier.disposition,...(carrier.code?{code:carrier.code,message:carrier.message}:{})}});
 stage='request_helper_plan_comparison';
 const call=opened.payload;
 const occurrence={cCallRef:selected.cCallRef,runId:selected.runRef,graphCallId:opened.graphCallId,frameId:opened.frameId,taskOrdinal:call.taskOrdinal,attempt:call.attempt};
 const attemptRef=assemblyOwner.worksiteCommandExecutionAttemptRef(occurrence);
 const helperPlan=commandOwner.worksiteCommandExecutionHelperPlan(task,attemptRef);
 const implementationRef=forwardOwner.executableWorksiteCommandImplementationRef(task);
 const tool=observation.toolInvocations[0];
 const comparisons=[
  {relation:'exchange.request == prepared request',expected:hash(actualRequest),observed:observationEvent.payload.requestDigest,equal:hash(actualRequest)===observationEvent.payload.requestDigest,source:'actor_process persists exactly instructionAssembly.request after dependent dispatch equality'},
  {relation:'actorRef',expected:task.workerActorRef,observed:observation.actorRef,equal:task.workerActorRef===observation.actorRef},
  {relation:'workerBindingRef',expected:task.workerBindingRef,observed:observation.workerBindingRef,equal:task.workerBindingRef===observation.workerBindingRef},
  {relation:'implementationRef',expected:implementationRef,observed:observation.implementationRef,equal:implementationRef===observation.implementationRef},
  {relation:'inputDigest',expected:execution.rawInputDigest,observed:observation.inputDigest,equal:execution.rawInputDigest===observation.inputDigest},
  {relation:'materializationPlanRef',expected:actualRequest.materializationPlanRef,observed:observation.materializationPlanRef,equal:actualRequest.materializationPlanRef===observation.materializationPlanRef},
  {relation:'rendererRef',expected:actualRequest.rendererRef,observed:observation.rendererRef,equal:actualRequest.rendererRef===observation.rendererRef},
  {relation:'request.prompt is string',equal:typeof actualRequest.prompt==='string'},
  {relation:'promptDigest',expected:hash(actualRequest.prompt),observed:observation.promptDigest,equal:hash(actualRequest.prompt)===observation.promptDigest},
  {relation:'instructionContractRef',expected:task.instructionContractRef,observed:observation.instructionContractRef,equal:task.instructionContractRef===observation.instructionContractRef},
  {relation:'resultContractRef',expected:task.resultContractRef,observed:observation.resultContractRef,equal:task.resultContractRef===observation.resultContractRef},
  {relation:'transportLane',expected:'worker_executes',observed:observation.transportLane,equal:observation.transportLane==='worker_executes'},
  {relation:'disposition',expected:'success',observed:observation.disposition,equal:observation.disposition==='success'},
  {relation:'failureClass',expected:null,observed:observation.failureClass,equal:observation.failureClass===null},
  {relation:'toolCallCount',expected:1,observed:observation.toolCallCount,equal:observation.toolCallCount===1},
  {relation:'toolInvocations.length',expected:1,observed:observation.toolInvocations.length,equal:observation.toolInvocations.length===1},
  {relation:'first tool present',equal:tool!==undefined},
  {relation:'tool.ordinal',expected:0,observed:tool?.ordinal??null,equal:tool!==undefined&&tool.ordinal===0},
  {relation:'tool.toolName',expected:'Bash',observed:tool?.toolName??null,equal:tool!==undefined&&tool.toolName==='Bash'},
  {relation:'tool.inputDigest',expected:helperPlan.toolInputDigest,observed:tool?.inputDigest??null,equal:tool!==undefined&&tool.inputDigest===helperPlan.toolInputDigest},
  {relation:'tool.inputByteLength',expected:helperPlan.toolInputByteLength,observed:tool?.inputByteLength??null,equal:tool!==undefined&&tool.inputByteLength===helperPlan.toolInputByteLength},
 ];
 await record('exchange-comparison.json',{prefix:durable,basisRef:selected.basisRef,cCallRef:selected.cCallRef,openedEventRef:opened.eventId,fibreEventRef:fibre.eventId,execution:{basisRef:execution.basisRef,basisDigest:execution.basisDigest,inputDigest:execution.rawInputDigest,admissionEventRef:execution.admissionEventRef},task:{kind:task.kind,taskRef:task.taskRef,taskDigest:task.taskDigest,workspaceBindingRef:task.workspaceBinding.bindingId,materializationPlanRef:task.materializationPlanRef,rendererRef:task.rendererRef},request:{requestRef:start.payload.requestRef,requestDigest:start.payload.requestDigest,actorRef:actualRequest.actorRef,workerBindingRef:actualRequest.workerBindingRef,implementationRef:actualRequest.implementationRef,inputDigest:actualRequest.inputDigest,materializationPlanRef:actualRequest.materializationPlanRef,rendererRef:actualRequest.rendererRef,instructionContractRef:actualRequest.instructionContractRef,resultContractRef:actualRequest.resultContractRef,transportLane:actualRequest.transportLane,promptDigest:hash(actualRequest.prompt),promptByteCount:Buffer.byteLength(actualRequest.prompt),responseJsonSchemaDigest:hash(actualRequest.responseJsonSchema),responseJsonSchema:actualRequest.responseJsonSchema},assembly:{planRef:native.planRef,planDigest:native.planDigest,envelopeDigest:native.envelopeDigest,manifestDigest:native.manifestDigest},helperPlan,helperInput:{command:helperPlan.toolCommand,digest:digest(Buffer.from(p.canonicalJson({command:helperPlan.toolCommand}))),byteCount:Buffer.byteLength(p.canonicalJson({command:helperPlan.toolCommand}))},observation:{eventRef:observationEvent.eventId,actorInvocationRef:observation.actorInvocationRef,processRef:observation.processRef,transportBindingRef:observation.transportBindingRef,transportBindingDigest:observation.transportBindingDigest,disposition:observation.disposition,failureClass:observation.failureClass,transportLane:observation.transportLane,processStatus:observation.processStatus,processSignal:observation.processSignal,timeoutClass:observation.timeoutClass,timedOut:observation.timedOut,exitObserved:observation.exitObserved,terminationConfirmed:observation.terminationConfirmed,structuredEventCount:observation.structuredEventCount,toolCallCount:observation.toolCallCount,toolInvocations:observation.toolInvocations,stdoutByteLength:observation.stdoutByteLength,stderrByteLength:observation.stderrByteLength,artifactDigests:observation.artifactDigests,finalOutput:compactText(observation.finalOutput)},comparisons,firstFalse:comparisons.find(row=>!row.equal)??null});
 stage='addressed_transport_artifacts';
 const artifacts={};
 for(const name of ['transport','stdout','stderr','output','prompt']){
  const path=binding.payload.paths[name];assert.equal(resolve(path),path);assert(path.startsWith(resolve(binding.payload.archiveRoot)+'/'));
  const bytes=await readFile(path);assert.equal(digest(bytes),observation.artifactDigests[name]);
  artifacts[name]={path,sha256:digest(bytes).slice(7),byteCount:bytes.length,authenticatedBy:observationEvent.eventId};
  if(name==='prompt'){assert.equal(hash(bytes.toString('utf8')),observation.promptDigest);continue;}
  if(name==='transport'){
   const actual=JSON.parse(bytes.toString('utf8'));
   assert.equal(actual.failureClass,observation.failureClass);assert.equal(actual.toolCallCount,observation.toolCallCount);assert.deepEqual(actual.toolInvocations,observation.toolInvocations);
   assert.equal(actual.disposition,observation.disposition);assert.equal(actual.finalOutput,observation.finalOutput);
   artifacts[name].result={kind:actual.kind,disposition:actual.disposition,status:actual.status,signal:actual.signal,failureClass:actual.failureClass,lane:actual.lane,command:actual.command,args:actual.args.map(arg=>Buffer.byteLength(arg)<=2048?arg:compactText(arg)),toolCallCount:actual.toolCallCount,toolInvocations:actual.toolInvocations,nativeResultAssessment:actual.nativeResultAssessment??null,stderr:compactText(actual.stderr),finalOutput:compactText(actual.finalOutput)};
  }else artifacts[name].content=compactText(bytes.toString('utf8'));
 }
 await record('transport-artifacts.json',{transportEventRef:binding.eventId,transportBindingRef:binding.payload.transportBindingRef,transportBindingDigest:binding.payload.transportBindingDigest,transportPlanDigest:binding.payload.transportPlanDigest,paths:binding.payload.paths,command:binding.payload.command,args:binding.payload.args.map(arg=>Buffer.byteLength(arg)<=2048?arg:compactText(arg)),cwd:binding.payload.cwd,artifactObservationEventRef:observationEvent.eventId,artifacts});
 console.log(JSON.stringify({status:'selected read complete',firstFalse:comparisons.find(row=>!row.equal),observationDisposition:observation.disposition,failureClass:observation.failureClass,toolCallCount:observation.toolCallCount,toolInvocations:observation.toolInvocations,artifacts: Object.fromEntries(Object.entries(artifacts).map(([k,v])=>[k,{path:v.path,sha256:v.sha256,byteCount:v.byteCount}])),elapsedMs:performance.now()-started}));
}catch(error){await record('first-cause.json',{stage,name:error.name,message:error.message,stack:error.stack,elapsedMs:performance.now()-started});throw error;}
finally{
 if(resource){const closed=a.closeAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));await record('normal-close.json',closed);assert.deepEqual(closed.closeHandoff,close);}
 await record('conservation.json',{...await checkPhysical(),identicalClose:resource!==null,resourceAcquisitions:resource===null?0:1,elapsedMs:performance.now()-started});
}
