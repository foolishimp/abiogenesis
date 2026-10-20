import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord,workerEnvironment} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {readOperatorControl,effectiveWorkerConfiguration} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/latest-factory-data-mapper-continuation-136/operator-control.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const preparation=root;
const setup=JSON.parse(await readFile(join(preparation,'prepared-setup.json'),'utf8'));
const inputs=JSON.parse(await readFile(join(preparation,'inputs.json'),'utf8'));
const old=JSON.parse(await readFile(join(inputs.archive,'run.json'),'utf8'));
assert.equal(setup.limits.nativeMs,old.configuration.processTimeoutMs);
assert.equal(setup.limits.nativeBytes,old.configuration.maxProcessOutputBytes);
const control=await readOperatorControl();assert.deepEqual(control.pin,setup.operatorControlReference);
const effectiveConfig=effectiveWorkerConfiguration(old.configuration,control.value);
const result=await commandRecorder(root,{environment:workerEnvironment(effectiveConfig),timeoutMs:setup.limits.nativeMs,maxOutputBytes:setup.limits.nativeBytes})('lifecycle-continuation-231',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
let outcome;
try{const rows=result.stdout.trim().split(/\r?\n/u);assert.equal(rows.length,1);outcome=JSON.parse(rows[0]);}
catch(error){await exclusiveRecord(root,'transport-failure.json',{name:error.name,message:error.message,stack:error.stack,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated});throw error;}
await exclusiveRecord(root,'calls/continuation-start.outcome.json',outcome);
const handoff=outcome.receipt?.resources?.eventResource?.closeHandoff;
if(handoff)await exclusiveRecord(root,'final-close-handoff.json',handoff);
console.log(JSON.stringify({classification:'Actual native receipt only; original oracle and fresh readbacks remain required',exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,wallMs:result.wallMs,run:outcome.receipt?.resources?.run??null,outcomeKind:outcome.receipt?.ownerOutput?.outcomeKind??outcome.kind,terminalAvailable:outcome.receipt?.ownerOutput?.value?.terminalResult!=null,handoffAvailable:!!handoff}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
