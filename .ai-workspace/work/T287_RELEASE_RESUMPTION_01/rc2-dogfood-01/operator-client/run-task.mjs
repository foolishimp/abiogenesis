import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installedModules, verifyArtifact, publicCaller } from './public-setup.mjs';
import { exclusiveRecord, commandRecorder, workerEnvironment, invokeLifecycle, freshReadbacks } from './runner.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const root=join(base,'setup-001');
const retained=JSON.parse(await readFile(join(root,'operator-resume-material.json'),'utf8'));
const budget=JSON.parse(await readFile(join(base,'budget-001.json'),'utf8'));
if(budget.ownerApprovedUsd!==100) throw new Error('Expected the explicit $100 owner allocation');
const environment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={...retained.config,setupEnvironment:environment,provider:budget.provider};
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
let caller;
try {
  const runtime=await installedModules(config.bootstrapRoot);
  const manifest=JSON.parse(await readFile(join(config.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:retained.native.request.artifactPath,manifest,
    expectedArtifactDigest:retained.native.request.expectedArtifactDigest},record,'dispatch-abg');
  caller=publicCaller({root,runtime,native,command:commandRecorder(root,{environment,timeoutMs:3600000,maxOutputBytes:67108864}),record,config,
    actorRef:'actor://abiogenesis/operator/codex-root'});
  Object.assign(caller.state,retained.state);
  caller.installedRoot=retained.installedRoot;
  caller.workspaceAuthority=retained.workspaceAuthority;
  const call=JSON.parse(await readFile(join(root,'diagnostic-01-prepared-call.json'),'utf8'));
  caller.refresh();
  await record('diagnostic-01-dispatch.json',{started:new Date().toISOString(),operatorPid:process.pid,
    ownerApprovedUsd:100,operatorStopThresholdUsd:90,provider:budget.provider,
    invocationRef:call.invocation.invocationRef,classification:'Actual RC2 source task through installed RC1; no whole-product qualification claim'});
  console.log(JSON.stringify({status:'dispatching',invocationRef:call.invocation.invocationRef,operatorPid:process.pid}));
  const execution=await invokeLifecycle(caller,retained.setup.installations,call,workerEnvironment(config));
  await record('diagnostic-01-execution.json',execution);
  await record('diagnostic-01-after-run-resume.json',{state:caller.state,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority});
  const reads=await freshReadbacks(caller,execution);
  await record('diagnostic-01-fresh-reads.json',reads);
  const output=execution.receipt.ownerOutput;
  await record('diagnostic-01-outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,
    outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,run:execution.receipt.resources.run??null,
    terminal:output.value?.terminalResult??null,reads:reads.map(x=>({memberKey:x.memberKey,outcomeKind:x.ownerOutput.outcomeKind})),
    qualification:false});
  console.log(JSON.stringify({status:'returned',outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,
    run:execution.receipt.resources.run??null,record:root}));
} catch(error) {
  await record('diagnostic-01-dispatch-failure.json',{failedAt:new Date().toISOString(),name:error?.name,
    message:error?.message,stack:error?.stack,closeHandoff:caller?.state.closeHandoff??null,
    classification:'Preserve actual effects; an operator or transport exception is not a fabricated terminal Run outcome'});
  console.error(JSON.stringify({status:'operator-exception',name:error?.name,message:error?.message,record:root}));
  process.exitCode=1;
}
