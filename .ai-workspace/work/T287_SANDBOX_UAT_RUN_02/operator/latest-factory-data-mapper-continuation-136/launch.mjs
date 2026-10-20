import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord,workerEnvironment} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {readOperatorControl,effectiveWorkerConfiguration} from './operator-control.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const setup=JSON.parse(await readFile(join(root,'continuation-setup.json'),'utf8'));
const old=JSON.parse(await readFile(join(setup.fromArchive,'run.json'),'utf8'));
assert.equal(setup.classification,'Owner-constructed same24/sameW source-result candidate; no dispatch or new admission');
assert.equal(setup.limits.nativeMs,old.configuration.processTimeoutMs);
assert.equal(setup.limits.nativeBytes,old.configuration.maxProcessOutputBytes);
const control=await readOperatorControl();assert.deepEqual(control.pin,setup.operatorControl);
const effectiveConfig=effectiveWorkerConfiguration(old.configuration,control.value);
const result=await commandRecorder(root,{environment:workerEnvironment(effectiveConfig),timeoutMs:setup.limits.nativeMs,maxOutputBytes:setup.limits.nativeBytes})('lifecycle-continuation',setup.launch.executable,setup.launch.args,{cwd:setup.launch.cwd});
let outcome;
try{const rows=result.stdout.trim().split(/\r?\n/u);assert.equal(rows.length,1);outcome=JSON.parse(rows[0]);}
catch(error){await exclusiveRecord(root,'transport-failure.json',{name:error.name,message:error.message,stack:error.stack,exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated});throw error;}
await exclusiveRecord(root,'calls/continuation-start.outcome.json',outcome);
const handoff=outcome.receipt?.resources?.eventResource?.closeHandoff;
if(handoff)await exclusiveRecord(root,'final-close-handoff.json',handoff);
console.log(JSON.stringify({classification:'Actual native receipt only; original oracle and fresh readbacks remain required',exitCode:result.exitCode,signal:result.signal,timedOut:result.timedOut,truncated:result.truncated,wallMs:result.wallMs,run:outcome.receipt?.resources?.run??null,outcomeKind:outcome.receipt?.ownerOutput?.outcomeKind??outcome.kind,terminalAvailable:outcome.receipt?.ownerOutput?.value?.terminalResult!=null,handoffAvailable:!!handoff}));
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.truncated&&!result.failure?0:1;
