import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installedModules, verifyArtifact, publicCaller, constructLifecycleCall } from './public-setup.mjs';
import { exclusiveRecord, commandRecorder } from './runner.mjs';
import { assessmentSelection } from './consumer.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const root=join(base,'setup-001');
const retained=JSON.parse(await readFile(join(root,'operator-resume-material.json'),'utf8'));
const environment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={...retained.config,setupEnvironment:environment};
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
try {
  const runtime=await installedModules(config.bootstrapRoot);
  const manifest=JSON.parse(await readFile(join(config.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:retained.native.request.artifactPath,manifest,
    expectedArtifactDigest:retained.native.request.expectedArtifactDigest},record,'task-preparation-abg');
  const caller=publicCaller({root,runtime,native,command:commandRecorder(root,{environment,timeoutMs:300000}),record,config,
    actorRef:'actor://abiogenesis/operator/codex-root'});
  Object.assign(caller.state,retained.state);
  caller.installedRoot=retained.installedRoot;
  caller.workspaceAuthority=retained.workspaceAuthority;
  const original=JSON.parse(await readFile(join(base,'workload-original.json'),'utf8'));
  const input=runtime.product.constructGovernanceWorkState({...original,assessment:{...original.assessment,...assessmentSelection}});
  await record('diagnostic-01-input.json',input);
  const prepared=await constructLifecycleCall(caller,input);
  await record('diagnostic-01-prepared-call.json',prepared.call);
  await record('diagnostic-01-preparation.json',{status:'prepared-not-dispatched',providerCalls:0,
    taskRef:original.taskRef,canonicalRoot:config.worksiteRoot,sourceBasis:'none',
    operator:'actor://abiogenesis/operator/codex-root',budget:'pending',
    invocationRef:prepared.call.invocation.invocationRef});
  console.log(JSON.stringify({status:'prepared-not-dispatched',providerCalls:0,taskRef:original.taskRef,
    invocationRef:prepared.call.invocation.invocationRef}));
} catch(error) {
  await record('diagnostic-01-preparation-failure.json',{status:'preparation-failed',providerCalls:0,
    name:error?.name,message:error?.message,stack:error?.stack});
  console.error(JSON.stringify({status:'preparation-failed',providerCalls:0,message:error?.message}));
  process.exitCode=1;
}
