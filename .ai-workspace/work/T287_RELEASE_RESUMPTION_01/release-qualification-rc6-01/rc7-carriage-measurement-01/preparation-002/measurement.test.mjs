// One finite installed S4 measurement; composes existing fixture, Public and ABG owners.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
const input=process.env.ABI5_S4_BINDINGS;assert(input,'Root binding required');const raw=await readFile(input);assert.equal(hex(raw),process.env.ABI5_S4_BINDINGS_SHA256);const b=JSON.parse(raw);assert.equal(b.status,'ROOT_SELECTED_S4_INSTALLED_CARRIAGE_MEASUREMENT');
const refs=JSON.parse(await readFile(join(here,'OWNER_REFERENCES.json'),'utf8'));
const {commandRecorder,exclusiveRecord,invokeColdInstalledEntry,eventResourceIdentity}=await import(pathToFileURL(refs.canonicalOperatorOwners[0].path));
const {setupInstalledRootCatalog}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/root-installed-environment.mjs')));
const {constructInstalledRunReadCall}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/registered-graph-selection.mjs')));
const O=b.outputRoot,save=(n,v,raw=false)=>exclusiveRecord(O,n,v,raw),bounds=b.boundsSelectedByRoot;
const pin=async path=>{const bytes=await readFile(path);return {path,bytes:bytes.length,sha256:hex(bytes)};};
const full=async(name,value)=>{const at=performance.now(),text=JSON.stringify(value);await save(name,text+'\n',true);return {...await pin(join(O,name)),serializedBytes:Buffer.byteLength(text),serializationAndCustodyMs:performance.now()-at};};
const one=(xs,label)=>{assert.equal(xs.length,1,label);return xs[0];};

test('RC7 S4 installed carriage: two read-only native work contexts over one held resource',{timeout:bounds.hostMs-5000},async t=>{
  const started=performance.now(),phases=[],cases=[],setupAccounting={wallMs:{}},report={status:'PARTIAL',contexts:b.contextBodyBytes,candidateArchive:b.candidateArchive,finalSourceSubject:b.finalSourceSubject,sourceArtifactRelation:b.sourceArtifactRelation,phases,cases,S6Disposition:null,qualified:false};
  let env=null,held=null,logPath=null,owner=null,closed=null;
  const mark=()=>({at:performance.now(),rss:process.memoryUsage().rss,work:owner?.observeRuntimeHistoryWork?.()??null});
  const phase=(name,a,z,extra={})=>phases.push({name,wallMs:z.at-a.at,endRssBytes:z.rss,work:a.work&&z.work?Object.fromEntries(Object.keys(z.work).map(k=>[k,z.work[k]-a.work[k]])):null,...extra});
  try{
    const nativeScope='abiogenesis/worksite/native-work',programRef='program://'+nativeScope+'@5',graphFunctionRef='graph-function://'+nativeScope+'@5';
    const setupStart=mark();
    env=await setupInstalledRootCatalog(t,b.packageRoot,{frozenArtifact:{artifactPath:b.candidateArchive.path,artifactSha256:b.candidateArchive.sha256,installHost:b.bootstrapInstallHost},candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:0,additionalCorePublicationConstructors:['constructNativeWorkspaceWorkModulePublication'],prepareAdditionalProducts:async()=>[],programRef,graphFunctionRef,setupAccounting});
    const load=name=>import(pathToFileURL(join(env.installedRoot,'build/code/src',name+'.js')));
    const [abg,publicApi,store,physical,native,prefixOwner,currentness,basisOwner,callOwner]=await Promise.all(['abg/index','public/index','abg/event_store','product/worksite_operations','product/native_workspace_work','abg/event_prefix','abg/native_worksite_execution','abg/invocation_execution_truth','abg/c_call'].map(load));
    owner=store;const product=env.product,hash=product.sha256Canonical,ids=native.NATIVE_WORKSPACE_WORK_IDS;assert.equal(ids.programRef,programRef);
    phase('installed_fixture_setup',setupStart,mark());report.setupAccounting=setupAccounting;report.installedRoot=env.installedRoot;report.installCandidate={installId:env.installCandidate.installId,installedRoot:env.installCandidate.installedRoot,artifactDigest:env.installCandidate.artifactDigest,productContentDigest:env.installCandidate.productContentDigest,manifestDigest:env.installCandidate.manifestDigest};
    const fixtureStart=mark(),worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority.canonicalRoot;
    const files=[{name:'context-1MiB.txt',bytes:1048576,fill:65},{name:'context-4MiB.txt',bytes:4194304,fill:66}];
    for(const f of files)await writeFile(join(worksite,f.name),Buffer.alloc(f.bytes,f.fill),{flag:'wx'});
    const sourcePins=await Promise.all(files.map(f=>pin(join(worksite,f.name))));report.fixtureSourcePins=sourcePins;phase('fixture_bytes',fixtureStart,mark());
    const initialClose=env.store.projectReopenAuthorityAndClose();await save('SETUP_CLOSE.json',initialClose);
    logPath=fileURLToPath(initialClose.prefix.eventLogRef);
    const reopen=closeHandoff=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff,handoffDigest:hash(closeHandoff)});
    const a=mark(),acquired=abg.acquireAbgEventResource(reopen(initialClose));assert.equal(acquired.kind,'acquired_abg_event_resource');held=acquired.resource;
    let selection=abg.selectAcquiredAbgEventResource(held,held.entryPrefix);const z=mark();phase('held_acquisition',a,z);
    if(a.work&&z.work){assert.equal(z.work.storeReopens-a.work.storeReopens,1);assert.equal(z.work.historyDecodes-a.work.historyDecodes,1);}
    const runs=[];
    for(const [i,f] of files.entries()){
      const label=i===0?'1MiB':'4MiB',entry=selection,constructionStart=mark();let actualInput=null;
      const populated=await publicApi.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'declared_start',startRef:ids.startRef},rootMode:'direct',fhMode:'direct'},programRef,catalog:env.catalog,catalogView:env.catalogView,applications:[],admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(env.artifactTruth,install),actorRef:env.workspaceBinding.authorizedActorRef,
        input:{factory:async({workspaceBinding,grants})=>{assert.equal(grants.length,1);const context=await physical.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,readRoots:[f.name],maxFiles:2,maxBytes:f.bytes});actualInput=native.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,capabilityGrant:grants[0],context,outcome:'Read the selected fixture without changes.',instructions:['Read the whole selected file. Make no worksite change. Return the existing short report.'],readFirst:[f.name],writeRoots:[],checks:[]});return actualInput;}},inputValueRef:'value://abi5-tests/rc7-s4/'+label,source:{kind:'none'},eventResource:selection,envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:'request://abi5-tests/rc7-s4/'+label,correlationRef:'correlation://abi5-tests/rc7-s4/'+label,eventTime:new Date().toISOString(),provenanceRefs:['provenance://abi5-tests/rc7-s4-scripted-measurement']}});
      assert.equal(populated.kind,'installed_start_call',JSON.stringify(populated).slice(0,2000));phase('construct_'+label,constructionStart,mark());
      const callBytes=await full('calls/'+label+'.sdk-call.json',populated.call);
      const callStart=mark(),outcome=await publicApi.runInstalledDefinitionCallWithResource(selection,populated.call),callEnd=mark();phase('sdk_call_'+label,callStart,callEnd);
      const outcomeBytes=await full('calls/'+label+'.sdk-outcome.json',outcome);assert.equal(outcome.kind,'installed_definition_call_transport_result');const receipt=outcome.receipt;
      assert.equal(receipt.ownerOutput.outcomeKind,'result','native call outcome');const terminal=receipt.ownerOutput.value?.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal),'actual complete typed terminal');
      assert.equal(terminal.value?.kind,'native_workspace_work_observation');assert.equal(receipt.resources.eventResource.kind,'abg_event_resource_completion');selection=receipt.resources.eventResource.successor;
      assert(selection.prefix.prefixLength>entry.prefix.prefixLength);if(callStart.work&&callEnd.work)for(const key of ['historyDecodes','storeReopens','coldHistoryReads'])assert.equal(callEnd.work[key]-callStart.work[key],0,'warm native call '+key);
      const row={label,contextBodyBytes:f.bytes,contextCanonicalBytes:Buffer.byteLength(product.canonicalJson(actualInput.context)),taskCanonicalBytes:Buffer.byteLength(product.canonicalJson(actualInput)),sdkCall:callBytes,sdkOutcome:outcomeBytes,callWallMs:callEnd.at-callStart.at,eventLog:{beforeBytes:entry.prefix.prefixLength,afterBytes:selection.prefix.prefixLength,appendedBytes:selection.prefix.prefixLength-entry.prefix.prefixLength},terminalIdentity:{result:terminal.result,producer:terminal.producer,valueDigest:hash(terminal.value),originalProjectionBasis:terminal.projectionBasis}};
      cases.push(row);runs.push({label,file:f,input:actualInput,receipt,terminal,row});
    }
    // Both reads select the final P2. A Run's immutable terminal identity is
    // conserved from its original return; projectionBasis belongs to this read.
    const finalReadPrefix=selection.prefix;
    const finalReadBasis={ref:finalReadPrefix.eventLogRef,digest:finalReadPrefix.coordinateDigest};
    report.readProjectionBasis=finalReadBasis;
    const beforeReads=await eventResourceIdentity(logPath);await save('PREFIX_BEFORE_READS.json',{selectionPrefix:finalReadPrefix,projectionBasis:finalReadBasis,identity:beforeReads});
    const warm=[];
    for(const run of runs){
      const at=mark(),entry=selection;assert.deepEqual(entry.prefix,finalReadPrefix);
      const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey:'run_result',selector:{kind:'none'},source:run.receipt.resources.run,eventResource:entry,identity:'rc7-s4-warm-'+run.label});
      const outcome=await publicApi.runInstalledDefinitionCallWithResource(entry,call);phase('warm_result_'+run.label,at,mark());
      const body=await full('calls/'+run.label+'.warm-run-result.json',outcome);assert.equal(outcome.kind,'installed_definition_call_transport_result');assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result');
      const completion=outcome.receipt.resources.eventResource;assert.equal(completion.kind,'abg_event_resource_completion');assert.deepEqual(completion.successor.prefix,finalReadPrefix);selection=completion.successor;
      const terminal=outcome.receipt.ownerOutput.value.projection.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));
      const {projectionBasis:originalBasis,...originalIdentity}=run.terminal;
      const {projectionBasis:readBasis,...readIdentity}=terminal;
      assert.deepEqual(readIdentity,originalIdentity,'original Run Result, complete value, producer and contract identity are unchanged');
      assert.deepEqual(readBasis,finalReadBasis,'held terminal is projected at actual final P2');
      warm.push(outcome.receipt.ownerOutput);run.row.warmRead={...body,originalRunIdentityEquality:true,projectionBasis:readBasis,originalProjectionBasis:originalBasis};
    }
    assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);
    const closeStart=mark();closed=abg.closeAbgEventResource(held,selection.prefix);held=null;assert.equal(closed.kind,'abg_event_resource_receipt');assert.deepEqual(closed.closeHandoff.prefix,selection.prefix);assert.deepEqual(closed.closeHandoff.prefix,finalReadPrefix);await save('ACTUAL_CLOSE.json',closed);phase('outer_close',closeStart,mark());
    const record=(name,value,raw=false)=>save(name,value,raw),command=commandRecorder(O,{environment:process.env,timeoutMs:bounds.coldReadMs,maxOutputBytes:bounds.outputBytes});
    const caller={root:O,record,command,config:{nodePath:b.node.configuredPath,setupEnvironment:process.env},state:{closeHandoff:closed.closeHandoff,calls:[]},runtime:{product}};
    for(const [i,run] of runs.entries()){
      const at=mark(),{call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey:'run_result',selector:{kind:'none'},source:run.receipt.resources.run,eventResource:reopen(closed.closeHandoff),identity:'rc7-s4-cold-'+run.label});
      const read=await invokeColdInstalledEntry(caller,'cold-'+run.label,call,{runtimeRoot:env.installedRoot,environment:process.env});phase('cold_result_'+run.label,at,mark(),{childWallMs:read.execution.wallMs,parentCountersExcludeChild:true});
      assert.equal(read.execution.exitCode,0);assert(!read.execution.signal&&!read.execution.failure&&!read.execution.timedOut&&!read.execution.truncated);assert.equal(read.receipt.ownerOutput.outcomeKind,'result');assert.deepEqual(read.receipt.resources.eventResource.closeHandoff.prefix,closed.closeHandoff.prefix);
      const terminal=read.receipt.ownerOutput.value?.projection?.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));
      const {projectionBasis:originalBasis,...originalIdentity}=run.terminal;
      const {projectionBasis:readBasis,...readIdentity}=terminal;
      assert.deepEqual(readIdentity,originalIdentity,'cold read conserves original Run Result, complete value, producer and contract identity');
      assert.deepEqual(readBasis,finalReadBasis,'cold terminal is projected at actual final P2');
      assert.deepEqual(terminal,warm[i].value.projection.terminalResult,'complete warm and cold typed terminal equality at P2');
      assert.deepEqual(read.receipt.ownerOutput,warm[i],'complete warm and cold owner-output equality at P2');
      run.row.coldRead={outcome:await pin(join(O,'calls/cold-'+run.label+'.outcome.json')),request:await pin(join(O,'calls/cold-'+run.label+'.request.jsonl')),rawStdout:await pin(join(O,'commands/cold-'+run.label+'.stdout')),originalRunIdentityEquality:true,projectionBasis:readBasis,originalProjectionBasis:originalBasis,fullTypedTerminalEquality:true,fullReadOwnerOutputEquality:true,terminalComparison:'COMPLETE_WARM_COLD_AT_FINAL_SELECTED_PREFIX',unchangedPrefix:true};
    }
    assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);
    // One explicit post-session proof decode. It is separate from warm-call/read work.
    const inspectStart=mark(),physicalBytes=await readFile(logPath),events=store.validateHistoricalEvents(physicalBytes,closed.closeHandoff.prefix.storeIdentity.eventContractDigest),prefix=prefixOwner.selectValidatedRuntimeEventPrefix(events);
    const extent=store.runtimeEventPhysicalPrefix(events);assert.equal(extent.byteLength,physicalBytes.length);assert.equal(extent.digest,'sha256:'+hex(physicalBytes));
    const span=event=>{const i=events.indexOf(event);assert(i>=0);const before=store.runtimeEventPhysicalPrefix(events.slice(0,i)).byteLength,after=store.runtimeEventPhysicalPrefix(events.slice(0,i+1)).byteLength;return {eventId:event.eventId,kind:event.kind,admissionOrdinal:event.admissionOrdinal,offset:before,bytes:after-before,sha256:hex(physicalBytes.subarray(before,after)),logicalEventCanonicalBytes:Buffer.byteLength(product.canonicalJson(event))};};
    const occurrences=(haystack,needle)=>{const h=product.canonicalJson(haystack),n=product.canonicalJson(needle);let count=0;for(let i=h.indexOf(n);i>=0;i=h.indexOf(n,i+n.length))count++;return count;};
    for(const run of runs){
      const e=one(events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload?.resultRef===run.terminal.result.ref),'one actual native Result admission'),value=e.payload.value;
      assert.equal(e.graphFunctionRef,graphFunctionRef);assert.deepEqual(value,run.terminal.value);assert.equal(e.payload.resultDigest,run.terminal.result.digest);assert.equal(e.payload.valueDigest,hash(value));assert.equal(value.provenance.cCallRef,e.aggregateId);
      const task=currentness.projectNativeWorkspaceWorkResultTaskAtPrefix(prefix,e);assert(task,'existing owner joins native Result to its admitted task');assert.deepEqual(task,run.input);
      const basis=basisOwner.projectExactExecutionBasisAtPrefix(prefix,e.basisId);assert(basis);const basisEvent=one(events.filter(e=>e.kind==='basis_admitted'&&e.basisId===basis.basisRef&&e.payload?.basisRef===basis.basisRef),'one actual basis');
      const bindingEvent=one(events.filter(e=>e.kind==='actor_transport_binding_admitted'&&e.aggregateId===value.provenance.transportBindingRef),'one actual binding');const actorEvent=one(events.filter(e=>e.kind==='actor_invocation_started'&&e.aggregateId===value.provenance.actorInvocationRef),'one actual actor');
      assert(callOwner.projectTransportBindingSelection(bindingEvent,actorEvent,value.provenance),'existing owner authenticates transport binding/actor selection');
      const assembly=bindingEvent.payload.instructionAssembly,coordinate=assembly?.envelope?.nativeBasis?.executionBasis;assert(coordinate,'persisted native execution-basis coordinate');
      const afterFiles=value.after?.entries.filter(e=>e.state==='file')??[];
      Object.assign(run.row,{taskHolderEvent:span(basisEvent),bindingEvent:span(bindingEvent),resultEvent:{...span(e),resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,valueDigest:e.payload.valueDigest},resultCanonicalBytes:Buffer.byteLength(product.canonicalJson(value)),bindingCanonicalBytes:Buffer.byteLength(product.canonicalJson(bindingEvent.payload)),contextCarriage:{afterFileCount:afterFiles.length,changedPaths:value.changedPaths,entries:afterFiles.map(x=>({relativePath:x.relativePath,encoding:x.encoding,digest:x.digest,byteLength:x.byteLength,member:x.member??null}))},sourceBasis:{ref:basis.basisRef,digest:basis.basisDigest,inputDigest:basis.rawInputDigest},bodyCopyCounts:{basisTask:occurrences(basis,task),bindingTask:occurrences(assembly.envelope.nativeBasis,task),resultTask:occurrences(value,task),resultContext:occurrences(value,task.context)}});
      assert.equal(Object.hasOwn(value,'task'),false);assert.equal(Object.hasOwn(value,'before'),false);assert.equal(Object.hasOwn(coordinate,'rawInputValue'),false);const {rawInputValue,...withoutBody}=basis;assert.deepEqual(coordinate,withoutBody);assert.deepEqual(rawInputValue,task);assert.equal(value.inputDigest,basis.rawInputDigest);assert.equal(hash(task),value.inputDigest);
      assert.equal(run.row.bodyCopyCounts.basisTask,1);assert.equal(run.row.bodyCopyCounts.bindingTask,0);assert.equal(run.row.bodyCopyCounts.resultTask,0);assert.equal(run.row.bodyCopyCounts.resultContext,0);
      assert.deepEqual(value.changedPaths,[]);assert.equal(afterFiles.length,1);const after=afterFiles[0],index=task.context.entries.findIndex(x=>x.relativePath===run.file.name);assert(index>=0);assert.equal(after.relativePath,run.file.name);assert.equal(after.encoding,'admitted_member');assert.equal(Object.hasOwn(after,'bytes'),false);assert.deepEqual(after.member,{basisRef:basis.basisRef,basisDigest:basis.basisDigest,path:['context','entries',index]});assert.equal(after.digest,task.context.entries[index].digest);assert.equal(after.byteLength,run.file.bytes);assert(native.nativeWorkspaceWorkObservationMatchesTask(task,value));
    }
    phase('post_session_physical_custody_and_owner_checks',inspectStart,mark());
    for(const source of sourcePins)assert.deepEqual(await pin(source.path),source,'read-only task preserves selected worksite bytes');
    await save('runtime.events.jsonl',physicalBytes,true);report.eventLog={originalPath:logPath,retained:await pin(join(O,'runtime.events.jsonl')),closedPrefix:closed.closeHandoff.prefix,readOnlyIdentity:beforeReads,rows:events.length};
    const [small,large]=cases,delta=large.contextBodyBytes-small.contextBodyBytes;report.twoPointGrowth={contextBodyDelta:delta,taskCanonicalDelta:large.taskCanonicalBytes-small.taskCanonicalBytes,taskHolderEventDelta:large.taskHolderEvent.bytes-small.taskHolderEvent.bytes,bindingEventDelta:large.bindingEvent.bytes-small.bindingEvent.bytes,resultEventDelta:large.resultEvent.bytes-small.resultEvent.bytes,resultCanonicalDelta:large.resultCanonicalBytes-small.resultCanonicalBytes,sdkOutcomeSerializedDelta:large.sdkOutcome.serializedBytes-small.sdkOutcome.serializedBytes,eventLogAppendedDelta:large.eventLog.appendedBytes-small.eventLog.appendedBytes,note:'Two sizes in one sequential session; shared prefixes/encoding and ordering differ. These observations are not an isolated causal slope, coding benchmark or release qualification.'};report.status='SELECTED_INSTALLED_S4_MEASUREMENT_CLOSED';
  }catch(error){report.error=String(error?.stack??error);throw error;}finally{
    if(held!==null&&env!==null){env.abg.abandonAbgEventResource(held);held=null;report.abandonedOnFailure=true;}
    if(logPath!==null){try{await lstat(join(O,'runtime.events.jsonl'));}catch(e){if(e.code!=='ENOENT')throw e;try{await save('runtime.events.jsonl',await readFile(logPath),true);report.partialEventLog=await pin(join(O,'runtime.events.jsonl'));}catch(copyError){report.partialLogCustodyError=String(copyError);}}}
    report.totalWallMs=performance.now()-started;report.nodeResourceUsage=process.resourceUsage();report.measuredPhaseWallMs=phases.reduce((a,x)=>a+x.wallMs,0);report.unassignedFixtureSerializationOrOtherMs=report.totalWallMs-report.measuredPhaseWallMs;report.limits=['Scripted actor; no provider, native-coding productivity, general performance or matched-baseline speedup claim.','The two tasks are read-only: changed-body birth remains covered by accepted S4 evidence, not re-exercised here.','Task-holder row bytes are actual physical row extents, not an invented allocation of shared encoded body bytes.','Complete SDK serialization is explicit JSON.stringify measurement; it is not claimed to be mandatory internal runtime serialization.','Fixture setup includes the maintained helper actual scratch install; original bootstrap remains immutable.','Two full run_result cold equalities only; HS02 replay equality is reused on its original subject, not relabelled as this measurement.','S6 remains a Root Product/consumer-contract decision; linear bytes alone do not select redesign.','Phase RSS and nodeResourceUsage describe the parent process; they exclude cold CLI and actor child peak RSS.','Fixture-owned temporary installation/worksite is cleaned by its existing test hook; retained physical log and complete outcomes preserve this proof.'];
    await save('MEASUREMENT.json',report);t.diagnostic('RC7_S4_MEASUREMENT '+JSON.stringify({status:report.status,totalWallMs:report.totalWallMs,phases:phases.map(p=>({name:p.name,wallMs:p.wallMs})),contexts:cases.map(x=>({label:x.label,contextBodyBytes:x.contextBodyBytes,resultCanonicalBytes:x.resultCanonicalBytes,sdkSerializedBytes:x.sdkOutcome.serializedBytes})),S6Disposition:null}));
  }
});
