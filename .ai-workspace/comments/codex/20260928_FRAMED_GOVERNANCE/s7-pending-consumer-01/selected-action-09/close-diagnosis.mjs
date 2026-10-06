import {readFile,writeFile,stat} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const proof=dirname(fileURLToPath(import.meta.url));
const read=async n=>JSON.parse(await readFile(join(proof,n),'utf8'));
const save=async(n,v)=>writeFile(join(proof,n),JSON.stringify(v,null,2)+'\n');
const handoff=await read('latest-handoff.json'), setup=await read('same-basis/setup.json');
const load=p=>import(pathToFileURL(join(setup.installedRoot,'build/code/src',p+'.js')).href);
await load('product/index');
const abg=await load('abg/index'),replay=await load('abg/replay'),eventOwner=await load('abg/event_store'),ports=await load('abg/project_read_ports'),continuations=await load('abg/construction_continuation');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=await readFile(fileURLToPath(handoff.prefix.eventLogRef));
const events=eventOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(freeze(events));
const opened=await read('same-basis/opened.json'),relation=await read('same-basis/prepared-relation.json');
const outcome=await read('same-basis/continue-receipt.json'),receipt=outcome.output.receipt;
const identity=replay.projectRunIdentityAtPrefix(prefix,opened.scope.runId),truth=ports.projectRunTruthAtDurablePrefix(handoff.prefix,opened.scope.runId);
const selected=relation.use.current,local=events.filter(e=>e.runId===identity.run.ref),delta=local.find(e=>e.kind==='construction_delta_observed'&&e.payload.constructionIntentRef===selected.constructionIntentRef);
const byRef=ref=>events.find(e=>e.eventId===ref);
const resultEvents=local.filter(e=>e.kind==='c_call_result_admitted');
const child=delta?.payload.actionEvaluation.admittedEvidenceRefs.map(ref=>resultEvents.find(e=>e.payload.resultRef===ref));
const refreshed=resultEvents.filter(e=>e.payload.value?.kind==='graph_span_selection'&&e.payload.value.state?.evaluation?.constructionIntentRef===selected.constructionIntentRef);
const closure=local.find(e=>e.kind==='run_closed');
const selectedOperations=events.filter(e=>e.kind==='public_operation_admitted'&&e.payload.continuationKind==='selected_action'&&e.payload.currentContinuationRef===selected.continuationRef);
const native={ref:opened.scope.runId,digest:opened.scope.runDigest};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canonicalEq=(a,b)=>a.ref===b.ref&&a.digest===b.digest;
const opening=byRef(identity.runOpenEventRef);
await save('coordinate-diagnosis.json',{class:'read_only_post_failure_owner_observation_not_cold_Public_proof',boundary:handoff.prefix,identity,nativeScopeCoordinate:native,requestRun:relation.request.run,receiptRun:receipt.resources.run,ownerOutputRun:receipt.ownerOutput.value.run,opening,truth:{kind:truth.kind,runtimeStatus:truth.runtimeStatus,run:truth.run,executionBasis:truth.executionBasis,graphCall:truth.graphCall,terminalResult:truth.terminalResult,replay:truth.replay},comparisons:{nativeScopeMatchesNativeOwner:canonicalEq(native,identity.nativeRun),requestMatchesNativeOwner:canonicalEq(relation.request.run,identity.nativeRun),receiptMatchesPublicOwner:canonicalEq(receipt.resources.run,identity.run),outputMatchesPublicOwner:canonicalEq(receipt.ownerOutput.value.run,identity.run),nativeAndPublicEqual:canonicalEq(native,identity.run)},semanticEvents:{selectedOccurrence:selected,finalOccurrences:continuations.projectSelectedActionContinuations(prefix,identity.run.ref),selectedOperations,delta,child,refreshed,runClosure:closure,parentClosure:closure?byRef(closure.payload.graphCallClosedEventRef):null},transportColdReadsExecuted:false,duplicateCallsExecuted:false,coveredPopulationExecuted:false});
const negativeNames=['alternate-view','crossed-basis','crossed-selection','crossed-run'];
const negatives=[];for(const name of negativeNames){const o=await read(`same-basis/${name}-receipt.json`);negatives.push({name,wallMs:o.wallMs,ownerOutput:o.output.receipt.ownerOutput,prefix:o.output.receipt.resources.eventResource.closeHandoff.prefix,failure:o.output.receipt.failure});}
await save('negative-summary.json',negatives);
const recoverySelection=await read('same-basis/recovery-selection.json'),termination=await read('same-basis/host-termination.json');
let lock=null;try{const s=await stat(recoverySelection.abandonedLock.path);lock={device:s.dev,inode:s.ino,bytes:s.size};}catch(e){if(e.code!=='ENOENT')throw e;}
let hostLive=true;try{process.kill(termination.pid,0);}catch(e){if(e.code==='ESRCH')hostLive=false;else throw e;}
const s=await stat(fileURLToPath(handoff.prefix.eventLogRef));
await save('closed-native-state.json',{handoff,eventCount:events.length,nativeBytes:bytes.length,nativeSha256:createHash('sha256').update(bytes).digest('hex'),device:s.dev,inode:s.ino,nativeMatchesHandoff:bytes.length===handoff.prefix.prefixLength&&'sha256:'+createHash('sha256').update(bytes).digest('hex')===handoff.prefix.prefixDigest,interruptedHost:{...termination,live:hostLive},lockPath:recoverySelection.abandonedLock.path,lock,resourceCompleted:receipt.failure===null&&receipt.resources.eventResource.closeHandoff.prefix.coordinateDigest===handoff.prefix.coordinateDigest,installedCliExitCode:receipt.exitCode,testProcessExitCode:1,postFailureRuntimeAcquisitions:0});
console.log(JSON.stringify({identity,truthKind:truth.kind,runtimeStatus:truth.runtimeStatus,terminalValue:truth.terminalResult?.value,selectedOperations:selectedOperations.length,childValues:child?.map(e=>e?.payload.value),refreshCount:refreshed.length,closure:closure?.eventId,eventCount:events.length,hostLive,lock,negatives:negatives.map(n=>({name:n.name,code:n.ownerOutput.value.code,path:n.ownerOutput.value.issuePaths,wallMs:n.wallMs}))}));
