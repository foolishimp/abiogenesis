// Root-selected preparation only; does not invoke the lifecycle/provider.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedModules,publicCaller,constructLifecycleCall} from './public-setup-b07.mjs';
import {commandRecorder,exclusiveRecord} from '../operator-client/runner.mjs';
import {witnessInput} from './workload-b07.mjs';
const here=fileURLToPath(new URL('.',import.meta.url)),root=join(here,'runtime-b09-001');
const saved=JSON.parse(await readFile(join(root,'operator-resume-material.json'),'utf8'));
const runtime=await installedModules(saved.installedRoot),record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
const environment=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const config={...saved.config,setupEnvironment:environment};assert(Array.isArray(config.dependencyResources));
const caller=publicCaller({root,runtime,native:saved.native,command:commandRecorder(root,{environment,timeoutMs:300000}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
caller.installedRoot=saved.installedRoot;caller.workspaceAuthority=saved.workspaceAuthority;Object.assign(caller.state,saved.state);
const input=await witnessInput(runtime.product,config.worksiteRoot);const prepared=await constructLifecycleCall(caller,input);
await record('witness-workload.json',input);await record('witness-call.json',prepared.call);
await record('ACTIVATION_PENDING.json',{status:'prepared_not_dispatched',recursionBound:3,onlyPermittedPurposes:['testing','construction'],requires:'Root review and exact pinned provider-profile JSON before run-b07.mjs',qualification:false});
console.log(JSON.stringify({status:'prepared_not_dispatched',root}));
