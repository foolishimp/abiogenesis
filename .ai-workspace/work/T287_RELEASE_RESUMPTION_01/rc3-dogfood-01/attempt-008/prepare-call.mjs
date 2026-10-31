// Model-free owner preparation only. This entry has no lifecycle invocation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedModules,publicCaller,constructLifecycleCall} from '../increment-b-06/public-setup.mjs';
import {exclusiveRecord} from '../operator-client/runner.mjs';
import {assessmentSelection} from '../operator-client/consumer.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const root=join(base,'attempt-008'),setup=join(base,'setup-002');
const sha=b=>createHash('sha256').update(b).digest('hex');
const fileSha=path=>new Promise((ok,no)=>{const h=createHash('sha256'),s=createReadStream(path);s.on('data',b=>h.update(b));s.on('error',no);s.on('end',()=>ok(h.digest('hex')))});
const activationRaw=await readFile(join(root,'ACTIVATE_B06.json'));
assert.equal(sha(activationRaw),process.argv[2]);
const activation=JSON.parse(activationRaw),workloadRaw=await readFile(activation.workload.path);
assert.equal(sha(workloadRaw),activation.workload.sha256);
const preflight=JSON.parse(await readFile(join(base,'increment-b-06/model-free-preflight.json'),'utf8'));
assert.equal(preflight.workloadSha256,activation.workload.sha256);
const retainedRaw=await readFile(join(setup,'operator-resume-material.json'));
assert.equal(sha(retainedRaw),activation.setupResume.sha256);const retained=JSON.parse(retainedRaw);
const priorRaw=await readFile(join(base,'setup-002/operator-resume-material.json'));assert.equal(sha(priorRaw),activation.freshSetupResume.sha256);const prior=JSON.parse(priorRaw);
const eventPath=fileURLToPath(prior.state.closeHandoff.prefix.eventLogRef),before=await fileSha(eventPath);
assert.equal(before,activation.initialEventLog.sha256);assert.equal((await stat(eventPath)).size,activation.initialEventLog.bytes);
const archive=await readFile(retained.native.request.artifactPath);assert.equal(sha(archive),activation.executingArtifactSha256);
const runtime=await installedModules(retained.installedRoot);
const manifest=JSON.parse(await readFile(join(retained.installedRoot,'product-toolchain-manifest.json'),'utf8'));
assert.equal(runtime.product.sha256Canonical(manifest),activation.executingManifestDigest);
for(const install of retained.setup.installations)assert(await runtime.product.installedProductContentMatches(install),'selected installed Product changed');
const runId='rc3-dogfood-01-increment-b-06';const config={...retained.config,runId};
const record=(path,value,raw=false)=>exclusiveRecord(root,path,value,raw);
const caller=publicCaller({root,runtime,native:retained.native,command:()=>{throw Error('unexpected command execution')},record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
Object.assign(caller.state,prior.state);caller.installedRoot=prior.installedRoot;caller.workspaceAuthority=prior.workspaceAuthority;
const original=JSON.parse(workloadRaw),input=runtime.product.constructGovernanceWorkState({...original,assessment:{...original.assessment,...assessmentSelection}});
assert(runtime.product.isGovernanceWorkState(input));
await record('run.json',{runId,kind:'selected_rc3_increment_b06',operator:'actor://abiogenesis/operator/codex-root',
 activationSha256:sha(activationRaw),workloadSha256:sha(workloadRaw),classification:'model-free preparation; no Run admitted or provider dispatched'});
await record('input.json',input);
const {call}=await constructLifecycleCall(caller,input);
await record('prepared-call.json',call);
assert.equal(await fileSha(eventPath),before,'call preparation changed the ABG event log');
const callRaw=await readFile(join(root,'prepared-call.json')),inputRaw=await readFile(join(root,'input.json'));
const recordValue={kind:'rc3_b06_prepared_call_binding',status:'prepared_not_admitted',
 activationSha256:sha(activationRaw),workloadSha256:sha(workloadRaw),inputFileSha256:sha(inputRaw),
 inputCanonicalDigest:runtime.product.sha256Canonical(input),callFileSha256:sha(callRaw),
 callCanonicalDigest:runtime.product.sha256Canonical(call),invocationRef:call.invocation.invocationRef,
 installedRoot:retained.installedRoot,sourceCommit:activation.sourceCommit,productId:retained.native.request.expectedProductId,
 eventLogSha256:before,eventLogBytes:(await stat(eventPath)).size,environmentBasis:'fresh selected RC2 setup and fresh setup-002 closeHandoff',
 sourceAndRolePreflight:'model-free-preflight.json',
 limits:['No actual run admission, runtime event, F_P call or provider spend was created','Root controls one later dispatch and budget monitoring']};
await record('PREPARED_CALL.json',recordValue);
console.log(JSON.stringify(recordValue));
