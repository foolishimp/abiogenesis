// Root-only explicit launch, one attempt. Never imported by bootstrap/preparation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedModules,publicCaller} from './public-setup-b07.mjs';
import {commandRecorder,exclusiveRecord,invokeLifecycle,workerEnvironment} from '../operator-client/runner.mjs';
assert.equal(process.argv.length,4,'usage: node run-b07.mjs /absolute/provider-profile.json sha256:<profile bytes>');
assert.equal(resolve(process.argv[2]),process.argv[2]);const raw=await readFile(process.argv[2]);assert.equal('sha256:'+createHash('sha256').update(raw).digest('hex'),process.argv[3]);const profile=JSON.parse(raw);assert.equal(profile.provider.enabled,true);assert(Number.isSafeInteger(profile.processTimeoutMs)&&profile.processTimeoutMs>0);assert(Number.isSafeInteger(profile.maxProcessOutputBytes)&&profile.maxProcessOutputBytes>0);
const root=join(fileURLToPath(new URL('.',import.meta.url)),'runtime-b07-001'),record=(p,v,raw=false)=>exclusiveRecord(root,p,v,raw);
const saved=JSON.parse(await readFile(join(root,'operator-resume-material.json'),'utf8')),call=JSON.parse(await readFile(join(root,'witness-call.json'),'utf8'));
const runtime=await installedModules(saved.installedRoot),config={...saved.config,...profile,worksiteRoot:saved.config.worksiteRoot,dependencyResources:saved.config.dependencyResources};
const launch=workerEnvironment(config),caller=publicCaller({root,runtime,native:saved.native,command:commandRecorder(root,{environment:launch,timeoutMs:profile.processTimeoutMs,maxOutputBytes:profile.maxProcessOutputBytes}),record,config,actorRef:'actor://abiogenesis/operator/codex-root'});
caller.installedRoot=saved.installedRoot;caller.workspaceAuthority=saved.workspaceAuthority;Object.assign(caller.state,saved.state);
await record('NATIVE_LAUNCH_STARTED.json',{at:new Date().toISOString(),profilePath:process.argv[2],profileDigest:process.argv[3],classification:'one selected actual-use witness; no automatic retry'});
const result=await invokeLifecycle(caller,saved.setup.installations,call,launch);
await record('native-execution.json',result);await record('native-final-close.json',caller.state.closeHandoff);
console.log(JSON.stringify({status:'native_returned',ownerOutput:result.receipt.ownerOutput,root}));
