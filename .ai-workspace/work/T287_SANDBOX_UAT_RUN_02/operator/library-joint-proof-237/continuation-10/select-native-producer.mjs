import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),directory=join(root,'execution/audit');
const setup=JSON.parse(await readFile(join(directory,'prepared-setup.json'),'utf8'));
const closed=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.close.json'),'utf8'));
const {installedModules}=await import('../continuation-09/helpers/public-setup.mjs');
const runtimeRoot=setup.installedRoot,runtime=await installedModules(runtimeRoot),a=runtime.abg,p=runtime.product;
const prefixes=await import(pathToFileURL(join(runtimeRoot,'build/code/src/abg/event_prefix.js')).href);
const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const cCallRef='c-call:sha256:eb91f1b4c385a797dfc23f34f8b7888e2d3437c9eeff6b1fd8682f118fe0006f';
const resultRef='result://abiogenesis/4f184872023163f5570f57a4d3bec2719451020a98017cf4261f17d5a5aecc80';
assert.equal(closed.prefix.prefixLength,13131877);
assert.equal(closed.prefix.coordinateDigest,'sha256:d359c4498ccf69d7d226af6be1a1cf3ec8ae8809eb7979761b9a48dab7527223');
const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:p.sha256Canonical(closed)});
if(acquired.kind!=='acquired_abg_event_resource'){await record('selected-native-producer-refusal.json',acquired);throw new Error('Selected producer resource owner refused');}
const resource=acquired.resource;
try {
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store),authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);
 assert.deepEqual(durable,closed.prefix);
 const envelopes=[];
 for(const row of prefixes.runtimeEventEnvelopesAtPrefix(authority))if(row.aggregateId===cCallRef&&row.kind==='c_call_result_admitted')envelopes.push(row);
 assert.equal(envelopes.length,1,'Exact already-selected native C_Call must have one Result');
 const event=prefixes.runtimeEventAtPrefix(authority,envelopes[0].eventId);
 assert(event);assert.equal(p.sha256Canonical(event.payload),event.payloadDigest);
 assert.equal(event.payload.resultRef,resultRef);
 const value=event.payload.value;
 assert.equal(value.kind,'native_workspace_work_observation');
 // This Result value is the worksite observation/task, not a repeated declaration/native-basis bundle.
 // All definition authority remains selected by its already-durable C_Call/basis/owner coordinates.
 await record('selected-native-producer.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,selection:{cCallRef,resultRef,purpose:'Root-authorized one addressed original native producer for Testing original-after/current-binding comparison'},event});
 console.log(JSON.stringify({eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,cCallRef,resultRef,payloadDigest:event.payloadDigest,valueKind:value.kind,observationRef:value.observationRef,observationDigest:value.observationDigest,beforeBinding:value.before.workspaceBindingIdentity,afterBinding:value.after.workspaceBindingIdentity,afterDigest:p.sha256Canonical(value.after),valueKeys:Object.keys(value),taskKeys:Object.keys(value.task)}));
} finally {
 const final=a.selectHeldEventStoreDurablePrefix(resource.store),closing=a.closeAbgEventResource(resource,final);
 await record('selected-native-producer-close.json',closing);
 assert.deepEqual(closing.closeHandoff,closed,'Addressed producer read must leave the genuine native cut unchanged');
}
