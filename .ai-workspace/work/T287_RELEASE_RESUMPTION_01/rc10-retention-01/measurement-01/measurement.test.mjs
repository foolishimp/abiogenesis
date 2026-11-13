// External RC10 adaptation of RC9's exact-archive native reference workload.
// No Product mutation, provider, invented lifetime handle or snapshot gauge rescan.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,lstat,readdir} from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {createGzip} from 'node:zlib';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const hex=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(process.env.ABI5_RETENTION_BINDING);assert.equal(hex(raw),process.env.ABI5_RETENTION_BINDING_SHA256);
const b=JSON.parse(raw);assert.equal(b.status,'PREPARED_RC10_FROZEN_RETENTION_MEASUREMENT');
const {commandRecorder,exclusiveRecord,invokeColdInstalledEntry,eventResourceIdentity}=await import(pathToFileURL(b.runner.path));
const {setupInstalledRootCatalog}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/root-installed-environment.mjs')));
const {constructInstalledRunReadCall}=await import(pathToFileURL(join(b.packageRoot,'test_env/support/registered-graph-selection.mjs')));
const O=b.outputRoot, K=b.bounds, ZERO={openHandles:0,retainedRows:0,retainedPayloadBytes:0,historyBasisBodies:0,historyBasisPayloadBytes:0};
const save=async(n,v)=>{const z=Buffer.from(JSON.stringify(v,null,2)+'\n');assert(z.length<=K.outputBytes);return exclusiveRecord(O,n,z,true);};
const pin=async p=>{const z=await readFile(p);return {path:p,bytes:z.length,sha256:hex(z)};};
const memory=()=>{const {rss,heapUsed,external,arrayBuffers}=process.memoryUsage();return {rss,heapUsed,external,arrayBuffers};};
const heap=()=>memory(); // Natural parent-process observation; no forced-GC intervention.
const delta=(a,z)=>Object.fromEntries(Object.entries(z).map(([k,v])=>[k,v-a[k]]));
async function budget(label){let bytes=0;const seen=new Set();async function walk(p){const st=await lstat(p).catch(e=>e.code==='ENOENT'?null:Promise.reject(e));if(!st)return;if(st.isSymbolicLink()){bytes+=st.size;return;}if(st.isDirectory()){for(const n of await readdir(p))await walk(join(p,n));return;}const key=st.dev+':'+st.ino;if(!seen.has(key)){seen.add(key);bytes+=st.size;}}await walk(b.tempRoot);await walk(O);assert(bytes<=K.aggregateBytes,'scratch bound at '+label+': '+bytes);return {label,logicalBytes:bytes,limit:K.aggregateBytes,quota:false};}
function identity(terminal){const {projectionBasis,...rest}=terminal;return rest;}

test('RC10 exact installed candidate: fifty 1MiB/4MiB native calls release both basis-retaining owners',{timeout:K.hostMs-5000},async t=>{
 const began=performance.now(),report={status:'PARTIAL',source:b.subject,candidateArchive:b.candidateArchive,perCall:[],historical:[],readbacks:[],heap:[],budgets:[],qualified:false,providerCallsSelected:0};
 let env=null,abg=null,held=null,selection=null,historySelection=null,logPath=null,closed=null;
 try{
  const setupAccounting={wallMs:{}},setupAt=performance.now(),programRef='program://abiogenesis/worksite/native-work@5';
  env=await setupInstalledRootCatalog(t,b.packageRoot,{frozenArtifact:{artifactPath:b.candidateArchive.path,artifactSha256:b.candidateArchive.sha256,installHost:b.bootstrapInstallHost},candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:0,additionalCorePublicationConstructors:['constructNativeWorkspaceWorkModulePublication'],prepareAdditionalProducts:async()=>[],programRef,graphFunctionRef:'graph-function://abiogenesis/worksite/native-work@5',setupAccounting});
  const load=n=>import(pathToFileURL(join(env.installedRoot,'build/code/src',n+'.js')));
  let api,physical,native,history,prefix,basis,projectReads,store;
  [abg,api,physical,native,history,prefix,basis,projectReads,store]=await Promise.all(['abg/index','public/index','product/worksite_operations','product/native_workspace_work','abg/runtime_history','abg/event_prefix','abg/calculus/execution_basis_record','abg/project_read_operation_contracts','abg/event_store'].map(load));
  const product=env.product,hash=product.sha256Canonical;
  assert.equal(typeof history.observeRuntimeHistoryBasisRetention,'function');
  report.setup={wallMs:performance.now()-setupAt,accounting:setupAccounting,installedRoot:env.installedRoot,installId:env.installCandidate.installId,artifactDigest:env.installCandidate.artifactDigest,productContentDigest:env.installCandidate.productContentDigest,manifestDigest:env.installCandidate.manifestDigest};
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority.canonicalRoot;
  const files=[{name:'context-1MiB.txt',bytes:1048576,fill:65},{name:'context-4MiB.txt',bytes:4194304,fill:66}];
  for(const f of files)await writeFile(join(worksite,f.name),Buffer.alloc(f.bytes,f.fill),{flag:'wx'});
  report.fixturePins=await Promise.all(files.map(f=>pin(join(worksite,f.name))));
  const setupClose=env.store.projectReopenAuthorityAndClose();await save('SETUP_CLOSE.json',setupClose);logPath=fileURLToPath(setupClose.prefix.eventLogRef);
  const reopen=h=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:h,handoffDigest:hash(h)});
  const acquired=abg.acquireAbgEventResource(reopen(setupClose));assert.equal(acquired.kind,'acquired_abg_event_resource');held=acquired.resource;selection=abg.selectAcquiredAbgEventResource(held,held.entryPrefix);
  historySelection=prefix.projectOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix).selection;
  const gauges=()=>history.observeRuntimeHistoryBasisRetention(historySelection);
  const work=()=>({basis:basis.observeExecutionBasisRowWork(),history:store.observeRuntimeHistoryWork()});
  assert.deepEqual(gauges(),ZERO);report.heap.push({point:'before_calls',...heap()});report.budgets.push(await budget('before_calls'));
  const sentinels=[];let last=null;
  // Function scope drops the constructed call, input and full result before the loop samples heap.
  async function oneCall(i){
   const f=files[i%2],label=String(i).padStart(2,'0')+'-'+f.bytes,entry=selection,constructionAt=performance.now();let input=null;
   const beforeWork=work(),beforeGauge=gauges();assert.deepEqual(beforeGauge,ZERO);
   const populated=await api.constructInstalledStartCall({selection:{memberKey:'start',target:{kind:'next'},rootMode:'direct',fhMode:'direct'},programRef,catalog:env.catalog,catalogView:env.catalogView,applications:[],admittedInstalls:env.admittedInstalls,workspaceBinding:env.workspaceBinding,verifyInstallAdmission:x=>abg.hasAdmittedProductInstall(env.artifactTruth,x),actorRef:env.workspaceBinding.authorizedActorRef,
    input:{factory:async({workspaceBinding,grants})=>{assert.equal(grants.length,1);const context=await physical.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,readRoots:[f.name],maxFiles:2,maxBytes:f.bytes});input=native.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthority,workspaceBinding,capabilityGrant:grants[0],context,outcome:'Read the selected fixture without changes.',instructions:['Read the whole selected file. Make no worksite change. Return the existing short report.'],readFirst:[f.name],writeRoots:[],checks:[]});return input;}},
    inputValueRef:'value://abi5-tests/rc10-retention/'+label,source:{kind:'none'},eventResource:entry,envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:'request://abi5-tests/rc10-retention/'+label,correlationRef:'correlation://abi5-tests/rc10-retention/'+label,eventTime:new Date().toISOString(),provenanceRefs:['provenance://abi5-tests/rc10-retention-external']}});
   assert.equal(populated.kind,'installed_start_call');const constructMs=performance.now()-constructionAt,taskCanonicalBytes=Buffer.byteLength(product.canonicalJson(input));
   const maxima={...ZERO};let samples=0,sampleError=null,inFlightWitness=null,witnessAttempted=false;
   const sample=()=>{try{
    const g=gauges();samples++;for(const k of Object.keys(maxima))maxima[k]=Math.max(maxima[k],g[k]);
    if(i<2&&!witnessAttempted&&g.openHandles>0&&g.retainedRows>0&&g.historyBasisBodies>0){
     witnessAttempted=true;
     const coordinate=store.selectHeldEventStoreDurablePrefix(held.store);
     const current=prefix.projectOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
     const matching=[...current.selection.select('kind:basis_admitted').rows()].filter(row=>row.scalarPayload.invocationRef===populated.call.invocation.invocationRef);
     assert.equal(matching.length,1,'actual in-flight invocation has one basis metadata row');
     const row=matching[0],keys=row.selectorKeys.filter(key=>key.startsWith('payload:basisRef:'));
     assert.equal(keys.length,1);const basisRef=keys[0].slice('payload:basisRef:'.length);assert.equal(row.envelope.basisId,basisRef);
     const w0=basis.observeExecutionBasisRowWork(),first=basis.projectExactExecutionBasisRecordAtPrefix(current,basisRef);
     const second=basis.projectExactExecutionBasisRecordAtPrefix(current,basisRef),w1=basis.observeExecutionBasisRowWork();
     assert(first!==null);assert.strictEqual(second,first,'in-flight repeated basis read preserves actual retained identity');
     assert.deepEqual(delta(w0,w1),{rowAdmissions:0,bodyDigests:0},'both reads reuse the already retained row without new row work');
     assert.equal(first.invocationRef,populated.call.invocation.invocationRef);assert.deepEqual(gauges(),g,'identity witness changes no retention gauge');
     inFlightWitness={actualCurrentPrefix:coordinate,basisRef,invocationRef:first.invocationRef,admissionEventRef:row.envelope.eventId,admissionOrdinal:row.envelope.admissionOrdinal,strictIdentity:true,bothReadWorkDelta:delta(w0,w1),gauges:g,selection:'actual installed owner current metadata; no new retention handle'};
    }
   }catch(e){sampleError??=String(e?.stack??e);}};
   const timer=setInterval(sample,b.sampleIntervalMs),callAt=performance.now();let outcome;
   try{sample();outcome=await api.runInstalledDefinitionCallWithResource(entry,populated.call);}finally{clearInterval(timer);}
   const callMs=performance.now()-callAt,after=gauges(),afterWork=work();
   assert.equal(outcome.kind,'installed_definition_call_transport_result');const r=outcome.receipt;assert.equal(r.exitCode,0);assert.equal(r.failure,null);assert.equal(r.ownerOutput.outcomeKind,'result');
   const terminal=r.ownerOutput.value?.terminalResult;assert(abg.isAbgTypedTerminalResult(terminal));assert.equal(terminal.value?.kind,'native_workspace_work_observation');assert.deepEqual(terminal.value.changedPaths,[]);assert(native.nativeWorkspaceWorkObservationMatchesTask(input,terminal.value));assert.equal(r.resources.eventResource.kind,'abg_event_resource_completion');selection=r.resources.eventResource.successor;
   const compact={i,contextBodyBytes:f.bytes,taskCanonicalBytes,constructMs,callMs,invocationRef:r.invocationRef,run:r.resources.run,basisRef:terminal.producer.executionBasis.ref,terminalIdentityDigest:hash(identity(terminal)),retentionBefore:beforeGauge,retentionAfter:after,activeSamples:samples,activeSampleMaxima:maxima,activeSampleError:sampleError,inFlightWitness,workDelta:{basis:delta(beforeWork.basis,afterWork.basis),history:delta(beforeWork.history,afterWork.history)},eventBytesBefore:entry.prefix.prefixLength,eventBytesAfter:selection.prefix.prefixLength};
   report.perCall.push(compact);await save('calls/'+label+'.json',compact);
   assert.deepEqual(after,ZERO,'completed call '+i+' must release both owners');assert.equal(sampleError,null);if(i<2){assert(inFlightWitness!==null,'first actual call at each input size needs the in-flight identity/work witness');assert.equal(inFlightWitness.basisRef,terminal.producer.executionBasis.ref);}
   assert(maxima.openHandles>0&&maxima.retainedRows>0&&maxima.historyBasisBodies>0,'active retention must be actually observed; zero-after cannot pass vacuously');
   assert.equal(maxima.retainedPayloadBytes,taskCanonicalBytes,'logical row payload bytes of this simple one-basis native invocation');assert.equal(maxima.historyBasisPayloadBytes,taskCanonicalBytes,'logical history basis payload bytes');
   return {i,contextBodyBytes:f.bytes,run:r.resources.run,basisRef:compact.basisRef,terminalIdentityDigest:compact.terminalIdentityDigest};
  }
  function historical(s,point){
   const w0=basis.observeExecutionBasisRowWork(),row=basis.projectExactExecutionBasisRecordAtPrefix(prefix.projectOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix),s.basisRef);assert(row!==null);
   const digest=hash(row),after=gauges();if(s.basisRecordDigest!==undefined)assert.equal(digest,s.basisRecordDigest);assert.deepEqual(after,ZERO,'historical read may not repopulate retention');
   report.historical.push({point,sourceCall:s.i,basisRef:s.basisRef,recordDigest:digest,retentionAfter:after,workDelta:delta(w0,basis.observeExecutionBasisRowWork())});return digest;
  }
  for(let i=0;i<50;i++){
   const c=await oneCall(i);last=c;if(i<2){c.basisRecordDigest=historical(c,'sentinel_baseline');sentinels.push(c);}else if(i%10===9)for(const s of sentinels)historical(s,'after_call_'+i);
   report.heap.push({point:'after_call_'+i,...heap()});if(i%5===4)report.budgets.push(await budget('after_call_'+i));
  }
  report.heap.push({point:'after_50_calls',...heap()});assert.equal(report.perCall.length,50);
  const finalPrefix=selection.prefix,beforeReads=await eventResourceIdentity(logPath),readSources=[sentinels[0],last],warm=new Map();
  const selectors={run_result:{kind:'none'},run_replay:{kind:'ordinal_page',fromOrdinal:0,limit:4096}};
  for(const s of readSources)for(const memberKey of ['run_result','run_replay']){
   const key=s.i+'-'+memberKey,{call}=constructInstalledRunReadCall({environment:env,publicApi:api,projectReadContracts:projectReads,memberKey,selector:selectors[memberKey],source:s.run,eventResource:selection,identity:'rc10-retention-warm-'+key});
   const out=await api.runInstalledDefinitionCallWithResource(selection,call);assert.equal(out.receipt.ownerOutput.outcomeKind,'result');selection=out.receipt.resources.eventResource.successor;assert.deepEqual(selection.prefix,finalPrefix);
   const owner=out.receipt.ownerOutput,terminal=owner.value.projection.terminalResult;assert.equal(hash(identity(terminal)),s.terminalIdentityDigest);assert.deepEqual(gauges(),ZERO);warm.set(key,hash(owner));report.readbacks.push({kind:'warm',key,ownerOutputDigest:hash(owner),retentionAfter:gauges()});
  }
  assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);closed=abg.closeAbgEventResource(held,selection.prefix);held=null;await save('ACTUAL_CLOSE.json',closed);assert.deepEqual(closed.closeHandoff.prefix,finalPrefix);assert.deepEqual(gauges(),ZERO);
  const coldRoot=join(env.scratch,'raw-cli-requests');await mkdir(coldRoot);
  const record=async(n,v,raw=false)=>{if(n.endsWith('.request.jsonl')){assert(Buffer.byteLength(v)<=K.rawCliRequestBytes);return exclusiveRecord(coldRoot,n,v,true);}return exclusiveRecord(O,n,v,raw);};
  const caller={root:coldRoot,record,command:commandRecorder(O,{environment:process.env,timeoutMs:K.coldReadMs,maxOutputBytes:K.outputBytes}),config:{nodePath:b.node.realPath,setupEnvironment:process.env},state:{closeHandoff:closed.closeHandoff,calls:[]},runtime:{product}};
  for(const s of readSources)for(const memberKey of ['run_result','run_replay']){
   const key=s.i+'-'+memberKey,{call}=constructInstalledRunReadCall({environment:env,publicApi:api,projectReadContracts:projectReads,memberKey,selector:selectors[memberKey],source:s.run,eventResource:reopen(closed.closeHandoff),identity:'rc10-retention-cold-'+key});
   const out=await invokeColdInstalledEntry(caller,'cold-'+key,call,{runtimeRoot:env.installedRoot,environment:process.env});assert.equal(out.execution.exitCode,0);assert(!out.execution.signal&&!out.execution.failure&&!out.execution.timedOut&&!out.execution.truncated);assert.equal(out.receipt.ownerOutput.outcomeKind,'result');assert.equal(hash(out.receipt.ownerOutput),warm.get(key));assert.deepEqual(out.receipt.resources.eventResource.closeHandoff.prefix,finalPrefix);report.readbacks.push({kind:'cold',key,ownerOutputDigest:hash(out.receipt.ownerOutput),sameOperationEquality:true,exitCode:out.execution.exitCode});
  }
  assert.deepEqual(await eventResourceIdentity(logPath),beforeReads);for(const p of report.fixturePins)assert.deepEqual(await pin(p.path),p);
  report.closedPrefix=finalPrefix;report.budgets.push(await budget('after_cold_reads'));report.status='FIFTY_CALL_RETENTION_MEASUREMENT_CLOSED';
 }catch(e){report.error=String(e?.stack??e);await save('FAILURE.json',{error:report.error});throw e;}
 finally{
  if(held!==null&&abg!==null){try{abg.abandonAbgEventResource(held);report.abandonedOnFailure=true;}catch(e){report.abandonFailure=String(e);}held=null;}
  if(logPath!==null){try{const identity=await eventResourceIdentity(logPath),dest=join(O,'runtime.events.jsonl.gz');await pipeline(createReadStream(logPath),createGzip(),createWriteStream(dest,{flags:'wx'}));report.eventLog={identity,compressed:await pin(dest),originalPath:logPath};}catch(e){report.logCustodyFailure=String(e);}}
  report.totalWallMs=performance.now()-began;report.actualPhysicalClose=closed!==null;report.limits=['Logical canonical raw-input bytes are owner gauges, not allocated heap; active maxima are sampled observations, not a high-water bound.','Only compact identities/counters are retained across calls; heap is natural parent process memory after call-object scope return, without forced GC. No blanket heap bound, speedup or provider-productivity claim.','Historical checks are two first-call basis sentinels initially and after calls9/19/29/39/49. Final read parity is first/last Run result and bounded replay, not whole-history qualification.','Active sampling opens no retention handles and serializes no event history. Missing active samples or zero-only retention cannot count as active-reuse proof.','Scripted actor, exact candidate archive and fresh runtime only. Source/fixture/helper roots read-only except fixture-owned temporary worksite.','Aggregate scratch is monitored between calls, not an OS quota; overshoot between checks remains possible. Failure or timeout preserves actual records and has no automatic retry.'];
  await save('MEASUREMENT.json',report);t.diagnostic('RC10_RETENTION '+JSON.stringify({status:report.status,calls:report.perCall.length,totalWallMs:report.totalWallMs,actualPhysicalClose:report.actualPhysicalClose}));
 }
});
