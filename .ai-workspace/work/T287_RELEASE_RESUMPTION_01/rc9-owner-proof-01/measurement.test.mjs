// RC9 external adaptation of the pinned RC8 measurement: same workload, result plus replay parity.
// Existing setup, Public/ABG owners and actual raw CLI parity remain authoritative.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,lstat,readdir} from 'node:fs/promises';
import {Session} from 'node:inspector';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),hex=b=>createHash('sha256').update(b).digest('hex');
const input=process.env.ABI5_REFERENCE_BINDINGS;assert(input,'Root binding required');const raw=await readFile(input);assert.equal(hex(raw),process.env.ABI5_REFERENCE_BINDINGS_SHA256);const b=JSON.parse(raw);assert.equal(b.status,'PREPARED_MATCHED_REFERENCE_MEASUREMENT');
const refs=JSON.parse(await readFile(join(here,'OWNER_REFERENCES.json'),'utf8'));
const {commandRecorder,exclusiveRecord,invokeColdInstalledEntry,eventResourceIdentity}=await import(pathToFileURL(refs.canonicalOperatorOwners[0].path));
const {setupInstalledRootCatalog}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/root-installed-environment.mjs')));
const {constructInstalledRunReadCall}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/registered-graph-selection.mjs')));
const O=b.outputRoot,bounds=b.bounds;
const save=async(n,v,raw=false)=>{const bytes=raw?(Buffer.isBuffer(v)?v:Buffer.from(v)):Buffer.from(JSON.stringify(v,null,2)+'\n');assert(bytes.length<=bounds.outputBytes,'retained file exceeds output bound: '+n);return exclusiveRecord(O,n,bytes,true);};
const memory=()=>{const {rss,heapUsed,external,arrayBuffers}=process.memoryUsage();return {rss,heapUsed,external,arrayBuffers};};
async function budgetCheck(label){const seen=new Set();let bytes=0;async function walk(p){const st=await lstat(p).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));if(!st)return;if(st.isSymbolicLink()){bytes+=st.size;return;}if(st.isDirectory()){for(const name of await readdir(p))await walk(join(p,name));return;}const key=st.dev+':'+st.ino;if(!seen.has(key)){seen.add(key);bytes+=st.size;}}await walk(b.tempRoot);await walk(O);if(b.bootstrapBudget){await walk(b.bootstrapBudget.tempRoot);await walk(b.bootstrapBudget.outputRoot);}assert(bytes<=bounds.aggregateBytes,'aggregate scratch/output stop: '+label+' '+bytes);return {label,logicalBytes:bytes,bound:bounds.aggregateBytes,quota:false};}
const counters=[];
const snapshots=()=>Object.fromEntries(counters.map(({name,observe})=>{const value=observe();assert(value&&typeof value==='object');for(const v of Object.values(value))assert(Number.isFinite(v));return [name,value];}));
const counterDelta=(a,z)=>Object.fromEntries(Object.entries(z).map(([name,values])=>[name,Object.fromEntries(Object.keys(values).map(k=>[k,Number.isFinite(a[name]?.[k])?values[k]-a[name][k]:null]))]));
const profileStart=async()=>{const session=new Session();session.connect();const post=method=>new Promise((resolve,reject)=>session.post(method,(error,value)=>error?reject(error):resolve(value)));await post('Profiler.enable');await post('Profiler.start');return {session,post};};
const profileStop=async(p,label)=>{try{const {profile}=await p.post('Profiler.stop');await save('profiles/'+label+'.cpuprofile',profile);return 'profiles/'+label+'.cpuprofile';}finally{p.session.disconnect();}};
const pin=async path=>{const bytes=await readFile(path);return {path,bytes:bytes.length,sha256:hex(bytes)};};
const full=async(name,value)=>{const at=performance.now(),startMemory=memory(),text=JSON.stringify(value),serializationMs=performance.now()-at;await save(name,text+'\n',true);return {...await pin(join(O,name)),serializedBytes:Buffer.byteLength(text),serializationMs,serializationAndCustodyMs:performance.now()-at,startMemory,endMemory:memory()};};
const compactCall=async(name,value)=>{const startMemory=memory(),at=performance.now(),text=JSON.stringify(value),serializationMs=performance.now()-at,bytes=Buffer.byteLength(text),digest=hex(text);const record={kind:'operator_serialization_receipt',serializedBytes:bytes,sha256:digest,serializationMs,startMemory,endMemory:memory(),payloadRetained:false,coordinate:{definitionKey:value.invocation?.definitionKey,invocationRef:value.invocation?.invocationRef,requestRef:value.invocation?.requestRef},standing:'Optional operator serialization outside construction/call measurements; not a clone allocation or required runtime cost.'};await save(name,record);return record;};

test('Matched reference carriage: two read-only native contexts over one held resource',{timeout:bounds.hostMs-5000},async t=>{
  const started=performance.now(),phases=[],cases=[],setupAccounting={wallMs:{}},report={status:'PARTIAL',contexts:b.contextBodyBytes,candidateArchive:b.candidateArchive,subject:b.subject,helperRoot:b.packageRoot,phases,cases,budgetObservations:[],counterAvailability:[],ownerCounterSnapshots:[],cpuProfileCall:b.cpuProfileCall,qualified:false};
  let env=null,held=null,logPath=null,owner=null,closed=null,profile=null;
  const mark=()=>({at:performance.now(),memory:memory(),work:owner?.observeRuntimeHistoryWork?.()??null,counters:snapshots()});
  const phase=(name,a,z,extra={})=>phases.push({name,wallMs:z.at-a.at,startMemory:a.memory,endMemory:z.memory,memoryDelta:Object.fromEntries(Object.keys(z.memory).map(k=>[k,z.memory[k]-a.memory[k]])),work:a.work&&z.work?Object.fromEntries(Object.keys(z.work).map(k=>[k,Number.isFinite(a.work[k])?z.work[k]-a.work[k]:null])):null,counters:counterDelta(a.counters,z.counters),...extra});
  const retainOwnerCounters=point=>{const raw=snapshots(),work=owner?.observeRuntimeHistoryWork?.()??null;report.ownerCounterSnapshots.push({point,observedAtMs:performance.now(),counters:Object.fromEntries(Object.entries(raw).map(([name,values])=>[name,{...values}])),runtimeHistoryWork:work===null?null:{...work}});};
  try{
    const nativeScope='abiogenesis/worksite/native-work',programRef='program://'+nativeScope+'@5',graphFunctionRef='graph-function://'+nativeScope+'@5';
    const setupStart=mark();
    env=await setupInstalledRootCatalog(t,b.packageRoot,{frozenArtifact:{artifactPath:b.candidateArchive.path,artifactSha256:b.candidateArchive.sha256,installHost:b.bootstrapInstallHost},candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:0,additionalCorePublicationConstructors:['constructNativeWorkspaceWorkModulePublication'],prepareAdditionalProducts:async()=>[],programRef,graphFunctionRef,setupAccounting});
    const load=name=>import(pathToFileURL(join(env.installedRoot,'build/code/src',name+'.js')));
    const [abg,publicApi,store,physical,native,projectReadContracts]=await Promise.all(['abg/index','public/index','abg/event_store','product/worksite_operations','product/native_workspace_work','abg/project_read_operation_contracts'].map(load));
    owner=store;report.counterAvailability.push({name:'runtimeHistoryWork',available:typeof owner.observeRuntimeHistoryWork==='function'});for(const spec of b.additionalCounterSources){assert(!spec.module.includes('..')&&!spec.module.startsWith('/'));const module=await load(spec.module),observe=module[spec.exportName];report.counterAvailability.push({...spec,available:typeof observe==='function'});if(typeof observe==='function')counters.push({name:spec.name,observe});else assert(!spec.required,'required counter unavailable: '+spec.name);}const product=env.product,hash=product.sha256Canonical,ids=native.NATIVE_WORKSPACE_WORK_IDS;assert.equal(ids.programRef,programRef);
    phase('installed_fixture_setup',setupStart,mark());report.setupAccounting=setupAccounting;report.installedRoot=env.installedRoot;report.installCandidate={installId:env.installCandidate.installId,installedRoot:env.installCandidate.installedRoot,artifactDigest:env.installCandidate.artifactDigest,productContentDigest:env.installCandidate.productContentDigest,manifestDigest:env.installCandidate.manifestDigest};
    retainOwnerCounters('after_setup');
    report.budgetObservations.push(await budgetCheck('after_setup'));const fixtureStart=mark(),worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority.canonicalRoot;
    const files=[{name:'context-1MiB.txt',bytes:1048576,fill:65},{name:'context-4MiB.txt',bytes:4194304,fill:66}];
    for(const f of files)await writeFile(join(worksite,f.name),Buffer.alloc(f.bytes,f.fill),{flag:'wx'});
    const sourcePins=await Promise.all(files.map(f=>pin(join(worksite,f.name))));report.fixtureSourcePins=sourcePins;phase('fixture_bytes',fixtureStart,mark());
    const initialClose=env.store.projectReopenAuthorityAndClose();await save('SETUP_CLOSE.json',initialClose);
    logPath=fileURLToPath(initialClose.prefix.eventLogRef);
    const reopen=closeHandoff=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff,handoffDigest:hash(closeHandoff)});
    const a=mark(),acquired=abg.acquireAbgEventResource(reopen(initialClose));assert.equal(acquired.kind,'acquired_abg_event_resource');held=acquired.resource;
    let selection=abg.selectAcquiredAbgEventResource(held,held.entryPrefix);const z=mark();phase('held_acquisition',a,z);
    if(a.work&&z.work){assert.equal(z.work.storeReopens-a.work.storeReopens,1);assert.equal(z.work.historyDecodes-a.work.historyDecodes,1);}
    const runs=[],callCases=files.map((f,i)=>({...f,label:i===0?'1MiB':'4MiB',profileOnly:false}));
    if(b.cpuProfileCall==='4MiB-profile'){assert.equal(b.subject.phase,'after');callCases.push({...files[1],label:'4MiB-profile',profileOnly:true});}
    for(const f of callCases){
      const label=f.label,entry=selection;report.budgetObservations.push(await budgetCheck('before_construct_'+label));retainOwnerCounters('before_construct_'+label);const constructionStart=mark();let actualInput=null;
      const populated=await publicApi.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},programRef,catalog:env.catalog,catalogView:env.catalogView,applications:[],admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(env.artifactTruth,install),actorRef:env.workspaceBinding.authorizedActorRef,
        input:{factory:async({workspaceBinding,grants})=>{assert.equal(grants.length,1);const context=await physical.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,readRoots:[f.name],maxFiles:2,maxBytes:f.bytes});actualInput=native.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,capabilityGrant:grants[0],context,outcome:'Read the selected fixture without changes.',instructions:['Read the whole selected file. Make no worksite change. Return the existing short report.'],readFirst:[f.name],writeRoots:[],checks:[]});return actualInput;}},inputValueRef:'value://abi5-tests/reference-measurement/'+label,source:{kind:'none'},eventResource:selection,envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:'request://abi5-tests/reference-measurement/'+label,correlationRef:'correlation://abi5-tests/reference-measurement/'+label,eventTime:new Date().toISOString(),provenanceRefs:['provenance://abi5-tests/reference-measurement-scripted-measurement']}});
      assert.equal(populated.kind,'installed_start_call',JSON.stringify(populated).slice(0,2000));phase(f.profileOnly?'profile_construct_4MiB':'construct_'+label,constructionStart,mark(),{profileOnly:f.profileOnly});retainOwnerCounters('after_construct_'+label);
      const callBytes=await compactCall('calls/'+label+'.sdk-call.serialization.json',populated.call);report.budgetObservations.push(await budgetCheck('before_call_'+label));retainOwnerCounters('before_call_'+label);if(b.cpuProfileCall===label){assert.equal(b.subject.phase,'after');profile=await profileStart();}
      const callStart=mark(),outcome=await publicApi.runInstalledDefinitionCallWithResource(selection,populated.call),callEnd=mark();phase(f.profileOnly?'profile_call_4MiB':'sdk_call_'+label,callStart,callEnd,{profiled:f.profileOnly,matched:!f.profileOnly});if(profile){report.cpuProfilePath=await profileStop(profile,label);profile=null;}retainOwnerCounters('after_call_'+label);report.budgetObservations.push(await budgetCheck('after_call_'+label));
      const outcomeBytes=await full('calls/'+label+'.sdk-outcome.json',outcome);assert.equal(outcome.kind,'installed_definition_call_transport_result');const receipt=outcome.receipt;
      assert.equal(receipt.ownerOutput.outcomeKind,'result','native call outcome');const terminal=receipt.ownerOutput.value?.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal),'actual complete typed terminal');
      assert.equal(terminal.value?.kind,'native_workspace_work_observation');assert.deepEqual(terminal.value.changedPaths,[]);assert(native.nativeWorkspaceWorkObservationMatchesTask(actualInput,terminal.value));assert.equal(receipt.resources.eventResource.kind,'abg_event_resource_completion');selection=receipt.resources.eventResource.successor;
      assert(selection.prefix.prefixLength>entry.prefix.prefixLength);if(callStart.work&&callEnd.work)for(const key of ['historyDecodes','storeReopens','coldHistoryReads'])assert.equal(callEnd.work[key]-callStart.work[key],0,'warm native call '+key);
      const row={label,contextBodyBytes:f.bytes,contextCanonicalBytes:Buffer.byteLength(product.canonicalJson(actualInput.context)),taskCanonicalBytes:Buffer.byteLength(product.canonicalJson(actualInput)),sdkCall:callBytes,sdkOutcome:outcomeBytes,callWallMs:callEnd.at-callStart.at,resultCanonicalBytes:Buffer.byteLength(product.canonicalJson(terminal.value)),eventLog:{beforeBytes:entry.prefix.prefixLength,afterBytes:selection.prefix.prefixLength,appendedBytes:selection.prefix.prefixLength-entry.prefix.prefixLength},terminalIdentity:{result:terminal.result,producer:terminal.producer,valueDigest:hash(terminal.value),originalProjectionBasis:terminal.projectionBasis}};
      if(f.profileOnly){report.profileCall={...row,matched:false,cpuProfilePath:report.cpuProfilePath,completeNativeResult:true,successorPrefix:selection.prefix};}else{cases.push(row);runs.push({label,file:f,input:actualInput,receipt,terminal,row});}
    }
    // Matched-pair reads select the final prefix, including the optional profile call.
    // A Run's immutable terminal identity is
    // conserved from its original return; projectionBasis belongs to this read.
    const finalReadPrefix=selection.prefix;
    const finalReadBasis={ref:finalReadPrefix.eventLogRef,digest:finalReadPrefix.coordinateDigest};
    report.readProjectionBasis=finalReadBasis;
    const beforeReads=await eventResourceIdentity(logPath);await save('PREFIX_BEFORE_READS.json',{selectionPrefix:finalReadPrefix,projectionBasis:finalReadBasis,identity:beforeReads});
    const selectors={run_result:{kind:'none'},run_replay:{kind:'ordinal_page',fromOrdinal:0,limit:4096}};
    const warm=new Map();
    for(const run of runs)for(const memberKey of ['run_result','run_replay']){
      const key=run.label+'-'+memberKey,at=mark(),entry=selection;assert.deepEqual(entry.prefix,finalReadPrefix);
      const {call}=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts,memberKey,selector:selectors[memberKey],source:run.receipt.resources.run,eventResource:entry,identity:'reference-measurement-warm-'+key});
      const outcome=await publicApi.runInstalledDefinitionCallWithResource(entry,call);phase('warm_'+key,at,mark());
      const body=await full('calls/'+key+'.warm.json',outcome);assert.equal(outcome.kind,'installed_definition_call_transport_result');assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result');
      const completion=outcome.receipt.resources.eventResource;assert.equal(completion.kind,'abg_event_resource_completion');assert.deepEqual(completion.successor.prefix,finalReadPrefix);selection=completion.successor;
      const terminal=outcome.receipt.ownerOutput.value.projection.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));
      const {projectionBasis:originalBasis,...originalIdentity}=run.terminal;
      const {projectionBasis:readBasis,...readIdentity}=terminal;
      assert.deepEqual(readIdentity,originalIdentity,'original Run Result, complete value, producer and contract identity are unchanged');
      assert.deepEqual(readBasis,finalReadBasis,'held terminal is projected at actual final selected prefix');
      if(memberKey==='run_replay')assert.equal(outcome.receipt.ownerOutput.value.projection.status,'closed');
      warm.set(key,outcome.receipt.ownerOutput);(run.row.warmReads??={})[memberKey]={...body,originalRunIdentityEquality:true,projectionBasis:readBasis,originalProjectionBasis:originalBasis};
    }
    assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);
    const closeStart=mark();closed=abg.closeAbgEventResource(held,selection.prefix);held=null;assert.equal(closed.kind,'abg_event_resource_receipt');assert.deepEqual(closed.closeHandoff.prefix,selection.prefix);assert.deepEqual(closed.closeHandoff.prefix,finalReadPrefix);await save('ACTUAL_CLOSE.json',closed);phase('outer_close',closeStart,mark());
    const coldRoot=join(env.scratch,'raw-cli-requests');await mkdir(coldRoot);const record=async(name,value,raw=false)=>{if(name.endsWith('.request.jsonl')){assert(Buffer.byteLength(value)<=bounds.rawCliRequestBytes,'raw CLI request bound');return exclusiveRecord(coldRoot,name,value,true);}return save(name,value,raw);},command=commandRecorder(O,{environment:process.env,timeoutMs:bounds.coldReadMs,maxOutputBytes:bounds.outputBytes});
    const caller={root:coldRoot,record,command,config:{nodePath:b.node.configuredPath,setupEnvironment:process.env},state:{closeHandoff:closed.closeHandoff,calls:[]},runtime:{product}};
    for(const run of runs)for(const memberKey of ['run_result','run_replay']){
      const key=run.label+'-'+memberKey,at=mark(),{call}=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts,memberKey,selector:selectors[memberKey],source:run.receipt.resources.run,eventResource:reopen(closed.closeHandoff),identity:'reference-measurement-cold-'+key});
      const read=await invokeColdInstalledEntry(caller,'cold-'+key,call,{runtimeRoot:env.installedRoot,environment:process.env});phase('cold_'+key,at,mark(),{childWallMs:read.execution.wallMs,parentCountersExcludeChild:true});
      assert.equal(read.execution.exitCode,0);assert(!read.execution.signal&&!read.execution.failure&&!read.execution.timedOut&&!read.execution.truncated);assert.equal(read.receipt.ownerOutput.outcomeKind,'result');assert.deepEqual(read.receipt.resources.eventResource.closeHandoff.prefix,closed.closeHandoff.prefix);
      const terminal=read.receipt.ownerOutput.value?.projection?.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));
      const {projectionBasis:originalBasis,...originalIdentity}=run.terminal;
      const {projectionBasis:readBasis,...readIdentity}=terminal;
      assert.deepEqual(readIdentity,originalIdentity,'cold read conserves original Run Result, complete value, producer and contract identity');
      assert.deepEqual(readBasis,finalReadBasis,'cold terminal is projected at actual final selected prefix');
      assert.deepEqual(terminal,warm.get(key).value.projection.terminalResult,'complete warm and cold typed terminal equality at the final selected prefix');
      assert.deepEqual(read.receipt.ownerOutput,warm.get(key),'complete warm and cold same-operation owner-output equality');
      if(memberKey==='run_replay')assert.equal(read.receipt.ownerOutput.value.projection.status,'closed');
      (run.row.coldReads??={})[memberKey]={outcome:await pin(join(O,'calls/cold-'+key+'.outcome.json')),request:{...await pin(join(coldRoot,'calls/cold-'+key+'.request.jsonl')),retained:false,cleanup:'existing fixture hook'},rawStdout:await pin(join(O,'commands/cold-'+key+'.stdout')),originalRunIdentityEquality:true,projectionBasis:readBasis,originalProjectionBasis:originalBasis,fullTypedTerminalEquality:true,fullReadOwnerOutputEquality:true,unchangedPrefix:true};
    }
    assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);
    for(const source of sourcePins)assert.deepEqual(await pin(source.path),source,'read-only task preserves selected worksite bytes');
    const physicalBytes=await readFile(logPath);await save('runtime.events.jsonl.gz',gzipSync(physicalBytes),true);report.eventLog={originalPath:logPath,physicalBytes:physicalBytes.length,physicalSha256:hex(physicalBytes),retained:await pin(join(O,'runtime.events.jsonl.gz')),compression:'gzip',closedPrefix:closed.closeHandoff.prefix,readOnlyIdentity:beforeReads};
    report.budgetObservations.push(await budgetCheck('after_cold_parity'));
    const [small,large]=cases;report.twoPointGrowth={contextBodyDelta:large.contextBodyBytes-small.contextBodyBytes,sdkCallSerializedDelta:large.sdkCall.serializedBytes-small.sdkCall.serializedBytes,resultCanonicalDelta:large.resultCanonicalBytes-small.resultCanonicalBytes,sdkOutcomeSerializedDelta:large.sdkOutcome.serializedBytes-small.sdkOutcome.serializedBytes,note:'Two sequential fixture sizes; compare exact before/after subjects and profiling flags, not an isolated causal slope.'};report.status='MATCHED_REFERENCE_MEASUREMENT_CLOSED';
  }catch(error){report.error=String(error?.stack??error);await save('FAILURE.json',{error:report.error,at:new Date().toISOString()});throw error;}finally{
    if(profile){try{report.cpuProfilePath=await profileStop(profile,'failed-call');}catch(e){report.profileFailure=String(e);}profile=null;}
    if(held!==null&&env!==null){env.abg.abandonAbgEventResource(held);held=null;report.abandonedOnFailure=true;}
    if(logPath!==null){try{await lstat(join(O,'runtime.events.jsonl.gz'));}catch(e){if(e.code!=='ENOENT')throw e;try{const log=await readFile(logPath);await save('runtime.events.jsonl.gz',gzipSync(log),true);report.partialEventLog={...await pin(join(O,'runtime.events.jsonl.gz')),physicalBytes:log.length,physicalSha256:hex(log)};}catch(copyError){report.partialLogCustodyError=String(copyError);}}}
    report.totalWallMs=performance.now()-started;report.nodeResourceUsage=process.resourceUsage();report.measuredPhaseWallMs=phases.reduce((a,x)=>a+x.wallMs,0);report.unassignedFixtureSerializationOrOtherMs=report.totalWallMs-report.measuredPhaseWallMs;report.limits=['Scripted actor; no provider/coding productivity, causal clone allocation, speedup or release qualification claim.','Construction, calls, operator serialization, setup, custody and cold CLI phases stay separate; RSS includes retained allocations and GC effects.','Memory and counters describe this parent; child peak memory is not measured. Missing optional work counters remain unavailable, never inferred zero.','Raw absolute owner snapshots are retained after setup and before/after construction and SDK calls, outside timed phases and the CPU-profile interval. Existing phase delta collection is unchanged. Missing dynamic keys stay absent and first-appearing-key deltas stay null; no zero baseline is inferred. Exact owner implementation and named focused receipts govern any zero interpretation or binder-work claim.','Both matched calls are unprofiled. One optional after-only third 4 MiB call is separately profiled; its timing/counters are excluded from the matched pair. Actual close includes its successor; cold parity is scoped to the pair at that final prefix.','Budget checks occur at phase boundaries outside timed calls; aggregate 1 GiB is a monitored operational stop, not a filesystem quota, and may overshoot between checks.','Raw CLI requests live only in fixture-owned scratch and are cleaned by its existing hook; retained digests and actual cold outcomes/streams preserve the observed check.','Fixture setup materializes the already-packed artifact into disposable scratch through existing owners; immutable bootstrap install is not written.','Two full run_result and two bounded ordinal-page run_replay cold equalities are exercised at the final prefix; full typed terminal and same-operation owner outputs match. This is not whole-history replay qualification.'];
    await save('MEASUREMENT.json',report);t.diagnostic('REFERENCE_MEASUREMENT '+JSON.stringify({status:report.status,totalWallMs:report.totalWallMs,phases:phases.map(p=>({name:p.name,wallMs:p.wallMs})),contexts:cases.map(x=>({label:x.label,contextBodyBytes:x.contextBodyBytes,resultCanonicalBytes:x.resultCanonicalBytes,sdkSerializedBytes:x.sdkOutcome.serializedBytes}))}));
  }
});
