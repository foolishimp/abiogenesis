import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {exclusiveRecord,workerEnvironment} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {readOperatorControl,effectiveWorkerConfiguration} from './operator-control.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const selected=JSON.parse(await readFile(join(root,'inputs.json'),'utf8'));
const old=JSON.parse(await readFile(join(selected.archive,'run.json'),'utf8'));
const control=await readOperatorControl();
const effectiveConfig=effectiveWorkerConfiguration(old.configuration,control.value);
const environment=workerEnvironment(effectiveConfig);
const command=old.configuration.provider.command,args=['auth','status'];
const started=new Date().toISOString(),startedMs=performance.now();
const child=spawn(command,args,{env:environment,cwd:root,stdio:['ignore','pipe','pipe']});
let stdout='',stderrBytes=0,spawnError=null;
child.stdout.on('data',b=>{stdout+=b.toString('utf8');});
child.stderr.on('data',b=>{stderrBytes+=b.length;});
child.on('error',e=>{spawnError={name:e.name,code:e.code??null};});
const closed=await new Promise(resolve=>child.once('close',(exitCode,signal)=>resolve({exitCode,signal})));
let parsed=null;
try{parsed=JSON.parse(stdout);}catch{}
const safeAuth={};
for(const key of ['loggedIn','authMethod','apiProvider','subscriptionType'])if(parsed&&Object.hasOwn(parsed,key))safeAuth[key]=parsed[key];
const names=[...(old.configuration.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']),...(old.configuration.provider.inheritEnvironment??[])];
const receipt={classification:'Read-only authentication status through exact workerEnvironment/config.provider.command; no model or Run',
  started,wallMs:performance.now()-startedMs,command,args,...closed,spawnError,safeAuth,
  variablePresence:Object.fromEntries(names.map(k=>[k,Object.hasOwn(environment,k)])),
  environmentNames:Object.keys(environment).sort(),stderrByteCount:stderrBytes,
  parsedStatus:parsed!==null,credentialValues:'Never serialized, printed or hashed; raw status output discarded'};
await exclusiveRecord(root,'safe-auth-readiness.json',receipt);
console.log(JSON.stringify(receipt));
assert.equal(spawnError,null);assert.equal(closed.exitCode,0);assert.equal(closed.signal,null);
assert.equal(safeAuth.loggedIn,true,'Exact declared worker environment is not logged in; HOLD');
