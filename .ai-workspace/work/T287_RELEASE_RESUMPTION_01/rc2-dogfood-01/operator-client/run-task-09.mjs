import { assessmentSelection } from './consumer.mjs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { installedModules, verifyArtifact, publicCaller, constructLifecycleCall } from './public-setup.mjs';
import { exclusiveRecord, commandRecorder, workerEnvironment, invokeLifecycle, freshReadbacks } from './runner.mjs';

const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const previousRoot=join(base,'setup-001');
const root=join(base,'attempt-009');
const retained=JSON.parse(await readFile(join(previousRoot,'operator-resume-material.json'),'utf8'));
const budget=JSON.parse(await readFile(join(base,'budget-004.json'),'utf8'));
if(budget.ownerApprovedUsd!==100) throw new Error('Expected the explicit $100 owner allocation');
const baseEnvironment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
if(!process.env.CLAUDE_CODE_OAUTH_TOKEN) throw new Error('Required existing provider authentication is unavailable');
const environment={...baseEnvironment,...budget.launchEnvironment};
const config={...retained.config,toolchainEnvironment:{...retained.config.toolchainEnvironment,...budget.launchEnvironment},runId:'rc2-dogfood-01-attempt-009',setupEnvironment:environment,provider:{...budget.provider,inheritEnvironment:['CLAUDE_CODE_OAUTH_TOKEN']}};
const record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
let caller;
try {
  const runtime=await installedModules(config.bootstrapRoot);
  const manifest=JSON.parse(await readFile(join(config.bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
  const native=await verifyArtifact(runtime,{artifactPath:retained.native.request.artifactPath,manifest,
    expectedArtifactDigest:retained.native.request.expectedArtifactDigest},record,'dispatch-abg');
  caller=publicCaller({root,runtime,native,command:commandRecorder(root,{environment,timeoutMs:7200000,maxOutputBytes:536870912}),record,config,
    actorRef:'actor://abiogenesis/operator/codex-root'});
  const after=JSON.parse(await readFile(join(base,'attempt-008/fixture-repair-01-after-run-resume.json'),'utf8'));
  Object.assign(caller.state,after.state);
  caller.installedRoot=retained.installedRoot;
  caller.workspaceAuthority=retained.workspaceAuthority;
  const original=JSON.parse(await readFile(join(base,'workload-candidate-rc2-01.json'),'utf8'));
  const input=runtime.product.constructGovernanceWorkState({...original,assessment:{...original.assessment,...assessmentSelection}});
  await record('candidate-rc2-01-input.json',input);
  const {call}=await constructLifecycleCall(caller,input);
  await record('candidate-rc2-01-prepared-call.json',call);
  await record('run.json',{runId:config.runId,priorAttempt:'attempt-008',relation:'new Run: corrected complete test-source input, ABG-owned RC2 identity and candidate claim, actual isolated fixture/diagnostic/package proof; prior input omission and blocked run retained; no publication or full qualification',at:new Date().toISOString()});
  caller.refresh();
  await record('candidate-rc2-01-dispatch.json',{started:new Date().toISOString(),operatorPid:process.pid,
    ownerApprovedUsd:100,operatorStopThresholdUsd:90,provider:config.provider,
    invocationRef:call.invocation.invocationRef,classification:'Actual RC2 source task through installed RC1; no whole-product qualification claim'});
  console.log(JSON.stringify({status:'dispatching',invocationRef:call.invocation.invocationRef,operatorPid:process.pid}));
  const execution=await invokeLifecycle(caller,retained.setup.installations,call,workerEnvironment(config));
  await record('candidate-rc2-01-execution.json',execution);
  await record('candidate-rc2-01-after-run-resume.json',{state:caller.state,installedRoot:caller.installedRoot,workspaceAuthority:caller.workspaceAuthority});
  const reads=await freshReadbacks(caller,execution);
  await record('candidate-rc2-01-fresh-reads.json',reads);
  const output=execution.receipt.ownerOutput;
  await record('candidate-rc2-01-outcome-summary.json',{ended:new Date().toISOString(),exitCode:execution.execution.exitCode,
    outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,run:execution.receipt.resources.run??null,
    terminal:output.value?.terminalResult??null,reads:reads.map(x=>({memberKey:x.memberKey,outcomeKind:x.ownerOutput.outcomeKind})),
    qualification:false});
  console.log(JSON.stringify({status:'returned',outcomeKind:output.outcomeKind,disposition:output.value?.disposition??null,
    run:execution.receipt.resources.run??null,record:root}));
} catch(error) {
  await record('candidate-rc2-01-dispatch-failure.json',{failedAt:new Date().toISOString(),name:error?.name,
    message:error?.message,stack:error?.stack,closeHandoff:caller?.state.closeHandoff??null,
    classification:'Preserve actual effects; an operator or transport exception is not a fabricated terminal Run outcome'});
  console.error(JSON.stringify({status:'operator-exception',name:error?.name,message:String(error?.message).slice(0,1000),record:root}));
  process.exitCode=1;
}
