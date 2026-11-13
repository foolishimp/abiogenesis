// Root-only read-only owner projection; no Public call, C2, provider or Run admission.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {sha,pinned,loadSetup,checkInstalled,checkPrefix,selectProcessEnvironment,work} from '../setup-state.mjs';
const here=fileURLToPath(new URL('.',import.meta.url));
assert.equal(process.argv.length,3,'usage: node diagnose.mjs MANIFEST_SHA256');
const manifestBytes=await readFile(join(here,'MANIFEST.json'));assert.equal(sha(manifestBytes),process.argv[2]);
const manifest=JSON.parse(manifestBytes);for(const r of manifest.files)await pinned(r);
const {selection,retained,profile,sourceBasis:asserted}=await loadSetup(manifest.bindingSha256);
selectProcessEnvironment(profile.runtimeEnvironment);
const out=join(here,'output');await mkdir(out,{mode:0o700});
const record=async(n,v)=>{const b=JSON.stringify(v,null,2)+'\n';await writeFile(join(out,n),b,{flag:'wx'});return sha(b);};
let fault=null;
try {
 const owner=async n=>import(pathToFileURL(join(selection.installedRoot,'build/code/src/abg',n+'.js')).href);
 const events=await owner('event_store'),prefixOwner=await owner('event_prefix'),invocation=await owner('invocation_admission');
 const prefix=prefixOwner.selectValidatedRuntimeEventPrefix(events.readRuntimeEventsAtDurablePrefix(retained.state.closeHandoff.prefix));
 const coordinates={publicAuthorityDigest:asserted.publicAuthorityDigest,runtimeInvocationRef:asserted.sourceInvocationRef,invocationAdmissionRef:asserted.sourceInvocationAdmissionRef,runId:asserted.sourceRunId,resultRef:asserted.sourceResultRef};
 const projected=invocation.deriveInvocationSourceResultBasisAtPrefix(prefix,coordinates);
 assert(projected===null||(typeof projected==='object'&&!Array.isArray(projected)));
 const projectedSha256=await record('projected-source-basis.json',projected);
 const canonical=v=>v===undefined?'undefined':v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
 const summary=v=>({type:v===null?'null':Array.isArray(v)?'array':typeof v,canonicalSha256:sha(canonical(v)),...(v===null||['string','number','boolean'].includes(typeof v)?{value:typeof v==='string'&&v.length>300?v.slice(0,300)+'…':v}:{})});
 const changed=projected===null?null:[...new Set([...Object.keys(asserted),...Object.keys(projected)])].sort().filter(k=>canonical(asserted[k])!==canonical(projected[k])).map(field=>({field,asserted:summary(asserted[field]),projected:summary(projected[field])}));
 const result={status:projected===null?'OWNER_SOURCE_BASIS_NULL':changed.length===0?'OWNER_SOURCE_BASIS_UNCHANGED':'OWNER_SOURCE_BASIS_REFRESHED',coordinates,currentPrefix:selection.eventPrefix,projectedSha256,changedTopLevelFields:changed,sourceResultValueUnchanged:projected===null?null:canonical(asserted.sourceResultValue)===canonical(projected.sourceResultValue),providerCalls:0,RunAdmissions:0,meaning:'Read-only existing-owner derivation; no new source authority, admission, recovery or acceptance is inferred.'};
 await record('RESULT.json',result);console.log(JSON.stringify({status:result.status,changedFields:changed?.map(x=>x.field)??null,projectedSha256,output:out}));
} catch(error) {
 fault=error;await record('FAULT.json',{name:error.name,message:String(error.message).slice(0,2000),providerCalls:0,RunAdmissions:0});
} finally {
 await checkPrefix(selection);await checkInstalled(selection);for(const r of manifest.files)await pinned(r);
 assert.equal(execFileSync('/usr/bin/git',['-C',work,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),selection.sourceCommit);
 assert.equal(execFileSync('/usr/bin/git',['-C',work,'status','--short','--untracked-files=no'],{encoding:'utf8'}),'');
 await record('PRESERVATION.json',{eventLogUnchanged:true,installedPayloadUnchanged:true,packetInputsUnchanged:true,sourceCommit:selection.sourceCommit,trackedSourceClean:true,providerCalls:0,RunAdmissions:0});
}
if(fault){console.error(fault.name+': '+String(fault.message).slice(0,1000));process.exitCode=1;}
