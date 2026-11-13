// Two genuine cold reads of the actual RC9 author03 close through immutable RC8 read owners.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,mkdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const load=async(path,expected)=>{const bytes=await readFile(path);if(expected)assert.equal(sha(bytes),expected);return {value:JSON.parse(bytes),pin:{path,bytes:bytes.length,sha256:sha(bytes)}};};
const readback=await load(join(dir,'READBACK_BINDING.json'),process.argv[2]),rb=readback.value;
await load(rb.authority.path,rb.authority.sha256);
const binding=await load(rb.binding.path,rb.binding.sha256),b=binding.value;
const prepared=await load(rb.prepared.path,rb.prepared.sha256);
const closed=await load(rb.closed.path,rb.closed.sha256);
const outcome=await load(rb.outcome.path,rb.outcome.sha256);
const acquisition=await load(rb.acquisition.path,rb.acquisition.sha256);
for(const p of Object.values(b.sourceHelpers)){const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes);assert.equal(sha(bytes),p.sha256);}
const environment={...b.environment};for(const k of Object.keys(environment))if(/CLAUDE|ANTHROPIC|OPENAI|PROVIDER/u.test(k))delete environment[k];
Object.assign(process.env,environment);
const owner=await import(pathToFileURL(b.sourceHelpers['public-setup.mjs'].path)),runner=await import(pathToFileURL(b.sourceHelpers['runner.mjs'].path));
const root=rb.readbackRoot;await mkdir(root);
const record=(p,v,raw=false)=>runner.exclusiveRecord(root,p,v,raw),runtime=await owner.installedModules(b.bootstrapRoot);
const native={...acquisition.value,verified:acquisition.value.verification.verifiedArtifact};
const caller=owner.publicCaller({root,runtime,native,record,command:runner.commandRecorder(root,{environment,timeoutMs:b.proofTimeoutMs}),
  config:{runId:'rc9-owner-reuse-01-author03-fresh-readbacks',nodePath:process.execPath,setupEnvironment:environment}});
caller.state.binding=prepared.value.workspaceBinding;caller.state.closeHandoff=closed.value.closeHandoff;caller.installedRoot=prepared.value.installedRoot;
const prefix=closed.value.closeHandoff.prefix,before=await runner.eventResourceIdentity(fileURLToPath(prefix.eventLogRef));
const startedUtc=new Date().toISOString(),started=performance.now();
await record('run.json',{status:'EXACT_CLOSED_READ_SUBJECT_PINNED_BEFORE_CALL',startedUtc,authority:'Root selected fresh result/replay from actual native close; existing read owners only',
  binding:binding.pin,prepared:prepared.pin,close:closed.pin,outcome:outcome.pin,acquisition:acquisition.pin,run:outcome.value.receipt.resources.run,
  prefix,physicalIdentity:before,installedRoot:caller.installedRoot,sourceHelpers:b.sourceHelpers,providerDispatch:false,sourceAcceptance:false});
try{
  const reads=await runner.freshReadbacks(caller,{receipt:outcome.value.receipt});
  const after=await runner.eventResourceIdentity(fileURLToPath(prefix.eventLogRef));assert.deepEqual(after,before);assert.deepEqual(caller.state.closeHandoff.prefix,prefix);
  const sdk=outcome.value.receipt.ownerOutput.value;
  assert.equal(sdk.disposition,'runtime_failed');assert.equal(sdk.result,null);assert.equal(sdk.terminalResult,null);
  // The maintained runner records both read outcomes and already enforces absence parity.
  // A truthful absent-result refusal is retained rather than relabelled a successful Result.
  for(const read of reads)assert(read.projection?.terminalResult==null,'A read invented an absent SDK terminal');
  const observations=runner.freshReadbackRecord(reads,runtime.product.sha256Canonical);
  assert.equal(observations.length,2);assert.equal(observations.find(r=>r.memberKey==='run_replay').outcomeKind,'result');
  const result={status:'READBACKS_RECORDED_UNCHANGED_PREFIX_RUNTIME_FAILED',startedUtc,completedUtc:new Date().toISOString(),wallMs:performance.now()-started,observations,physicalIdentity:after,prefixUnchanged:true,terminalAbsenceAgreesWithActualSdk:true,actualSdkDisposition:sdk.disposition,actualSdkResult:sdk.result,actualSdkStop:sdk.stop,actualSdkOwnerOutputDigest:runtime.product.sha256Canonical(outcome.value.receipt.ownerOutput),standing:'Two genuine closed-prefix reads; truthful absent-result/refusal and replay outcome retained. No successful typed terminal or source/proof acceptance claimed.',sourceAccepted:false,qualified:false};
  await record('RESULT.json',result);console.log(JSON.stringify({status:result.status,wallMs:result.wallMs,observations:observations.map(r=>({memberKey:r.memberKey,outcomeKind:r.outcomeKind,status:r.status})),root}));
}catch(error){await record('FAILURE.json',{completedUtc:new Date().toISOString(),wallMs:performance.now()-started,name:error.name,message:error.message,observation:error.observation??null});throw error;}
