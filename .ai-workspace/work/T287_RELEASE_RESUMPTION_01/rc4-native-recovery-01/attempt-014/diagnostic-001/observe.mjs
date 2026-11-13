// Root-only exact observation diagnostic; no task/call/provider construction.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {loadSetup,runtimeEnvironment,selectProcessEnvironment,checkInstalled,checkPrefix,sha} from '../setup-state.mjs';
const D=dirname(fileURLToPath(import.meta.url));assert.equal(process.argv.length,3);
const record=async(name,value)=>writeFile(join(D,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
try {
 const {selection,retained,workload:w,profile,local,bindingDigest}=await loadSetup(process.argv[2]);
 const {installedModules,publicCaller}=await import(pathToFileURL(local[0]).href);
 const {workerEnvironment}=await import(pathToFileURL(local[1]).href);
 const assembled=runtimeEnvironment(profile,workerEnvironment,retained);selectProcessEnvironment(assembled.environment);retained.config=assembled.config;
 const runtime=await installedModules(retained.installedRoot),{product}=runtime;
 const dry=publicCaller({root:join(D,'../../runtime-002'),runtime,native:retained.native,command:()=>{throw Error('No Public execution permitted')},record:()=>{throw Error('No Public record permitted')},config:retained.config,actorRef:'actor://abiogenesis/operator/codex-root'});
 Object.assign(dry.state,retained.state);dry.installedRoot=retained.installedRoot;dry.workspaceAuthority=retained.workspaceAuthority;
 const env=dry.refresh(),authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
 await record('INPUT_IDENTITIES.json',{bindingDigest,sourceCommit:selection.sourceCommit,installedRoot:retained.installedRoot,authority:env.workspaceAuthorityBasis,binding:{bindingId:env.workspaceBinding.bindingId,bindingDigest:env.workspaceBinding.bindingDigest,roots:env.workspaceBinding.roots},protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRootCount:w.readRoots.length,readRootsDigest:product.sha256Canonical(w.readRoots),maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes,eventPrefix:selection.eventPrefix,RuntimeTMPDIR:process.env.TMPDIR,providerCalls:0,RunAdmissions:0});
 const observed=await product.observeWorksiteContext({...authority,protectedInstallRoots:env.productInstalls.map(i=>i.installedRoot),readRoots:w.readRoots,maxFiles:w.maxContextFiles,maxBytes:w.maxContextBytes});
 // Preserve exact typed owner output before any assertion or downstream operation.
 await record('OWNER_OBSERVATION.json',observed);
 await checkPrefix(selection);await checkInstalled(selection);
 const bytes=await readFile(join(D,'OWNER_OBSERVATION.json'));
 await record('RESULT.json',{status:'OBSERVATION_DIAGNOSTIC_RETURNED',kind:observed.kind,ownerOutput:{path:join(D,'OWNER_OBSERVATION.json'),bytes:bytes.length,sha256:sha(bytes)},sourceCommit:selection.sourceCommit,eventPrefixUnchanged:true,installedFilesUnchanged:true,providerCalls:0,RunAdmissions:0,taskConstructed:false,callConstructed:false,limit:'Exact current owner observation only; no retry, repair, admission or refusal workaround.'});
 console.log(JSON.stringify({kind:observed.kind,record:join(D,'RESULT.json'),providerCalls:0,RunAdmissions:0}));
} catch(error) {await record('FAULT.json',{at:new Date().toISOString(),name:error.name,message:String(error.message).slice(0,6000),observation:error.observation??null,providerCalls:0,RunAdmissions:0,meaning:'Actual diagnostic fault retained; no guessed refusal or fallback.'});throw error;}
