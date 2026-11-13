// Complete readback only from the actual saved invocation receipt/close.
// Existing SDK owners perform population, transport and read-only checks.
process.on('uncaughtException',error=>{console.error(JSON.stringify({status:'READBACK_RECOVERY_FAILED',
  name:error.name,message:String(error.message).slice(0,800)}));process.exitCode=1;});
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getHeapStatistics} from 'node:v8';
import {installedModules,publicCaller} from '../../operator-client/public-setup.mjs';
import {exclusiveRecord,commandRecorder,freshReadbacks,workerEnvironment} from '../../operator-client/runner.mjs';

const dir=dirname(fileURLToPath(import.meta.url)),A=dirname(dir);
const hash=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const selection=await json(join(dir,'ROOT_RECOVERY_SELECTION.json'));
assert.equal(selection.status,'ROOT_SELECTED_ACTUAL_CLOSE_READBACK_RECOVERY');
assert(getHeapStatistics().heap_size_limit>=selection.requiredHostHeapMiB*1024*1024,
  'Declared host heap setting must be applied when Node starts');
for(const pin of selection.inputs){const b=await readFile(pin.path);assert.equal(b.length,pin.bytes);assert.equal(hash(b),pin.sha256);}
const input=await json(join(dir,'INPUT.json')),retained=input.retained;
assert.equal(retained.state.environment,null,'No serialized derived environment is a current owned source');
const runtime=await installedModules(retained.installedRoot);
const outcome=await json(input.actualOutcome.path),close=await json(input.actualClose.path);
assert.equal(outcome.kind,'installed_definition_call_transport_result');
assert.equal(runtime.product.sha256Canonical(outcome.receipt.resources.eventResource.closeHandoff),runtime.product.sha256Canonical(close));
assert.equal(outcome.receipt.resources.run.ref,input.actualRunRef);
assert.equal(outcome.receipt.ownerOutput.value.disposition,'runtime_failed');
const environment=workerEnvironment(retained.config);
const record=(p,v,raw=false)=>exclusiveRecord(dir,p,v,raw);
const runCommand=commandRecorder(dir,{environment,timeoutMs:600000,maxOutputBytes:536870912});
const command=(label,...args)=>{assert(['run_result','run_replay'].includes(label),'Recovery cannot invoke native work');return runCommand(label,...args);};
const caller=publicCaller({root:dir,runtime,native:retained.native,config:retained.config,
  record,command,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,{closeHandoff:close,binding:retained.state.binding,
  calls:[...retained.state.calls],environment:null});
caller.installedRoot=retained.installedRoot;caller.workspaceAuthority=retained.workspaceAuthority;
const start=performance.now();
await record('run.json',{kind:'actual_invocation_close_readback_recovery',startedUtc:new Date().toISOString(),
  sourceRunRef:input.actualRunRef,actualInvocationClose:input.actualClose,
  hostHeapLimitBytes:getHeapStatistics().heap_size_limit,nativeWorkRepeated:false,providerCalls:0});
const reads=await freshReadbacks(caller,{receipt:outcome.receipt});
await record('fresh-reads.json',reads);
assert.equal(runtime.product.sha256Canonical(caller.state.closeHandoff.prefix),runtime.product.sha256Canonical(close.prefix));
const resumed={...retained,state:{...retained.state,closeHandoff:caller.state.closeHandoff,
  binding:caller.state.binding,calls:caller.state.calls,environment:null},readbackRecovery:{
  kind:'actual_saved_invocation_close_recovered_through_existing_sdk_reads',
  sourceOutcome:input.actualOutcome,sourceClose:input.actualClose,root:dir,
  originalDispatcherHostFailed:true,nativeWorkRepeated:false,
  derivedEnvironment:'Rebuilt by the current owner for reads; omitted from persisted continuation',
  callHistory:'Previous retained call metadata plus recovered read calls; actual native invocation receipts remain separately pinned'}};
await writeFile(join(A,'execution/fresh-reads.json'),JSON.stringify(reads,null,2)+'\n',{flag:'wx'});
await writeFile(join(A,'execution/after-run-resume.json'),JSON.stringify(resumed,null,2)+'\n',{flag:'wx'});
await record('RECOVERY_COMPLETE.json',{endedUtc:new Date().toISOString(),wallMs:performance.now()-start,
  unchangedPrefix:close.prefix,readCount:reads.length,finalResumePath:join(A,'execution/after-run-resume.json'),
  status:'ACTUAL_READBACK_AND_CONTINUATION_RECOVERED',originalRuntimeDisposition:'runtime_failed',
  nativeWorkRepeated:false,qualified:false,accepted:false});
console.log(JSON.stringify({status:'ACTUAL_READBACK_AND_CONTINUATION_RECOVERED',reads:reads.map(r=>({
  memberKey:r.memberKey,outcomeKind:r.ownerOutput.outcomeKind,refusalCode:r.ownerOutput.value?.code??null,
  replayStatus:r.projection?.status??null,terminalResultRef:r.projection?.terminalResult?.ref??null})),wallMs:performance.now()-start}));
