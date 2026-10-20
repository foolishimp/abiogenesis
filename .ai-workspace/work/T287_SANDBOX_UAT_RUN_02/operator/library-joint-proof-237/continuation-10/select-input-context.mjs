import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url)),directory=join(root,'execution/audit');
const setup=JSON.parse(await readFile(join(directory,'prepared-setup.json'),'utf8'));
const closed=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.close.json'),'utf8'));
const outcome=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.outcome.json'),'utf8')).receipt;
const runtimeRoot=setup.installedRoot;
const {installedModules}=await import('../continuation-09/helpers/public-setup.mjs');
const runtime=await installedModules(runtimeRoot),a=runtime.abg,p=runtime.product;
const prefixes=await import(pathToFileURL(join(runtimeRoot,'build/code/src/abg/event_prefix.js')).href);
const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(closed.prefix.prefixLength,13131877);assert.equal(closed.prefix.coordinateDigest,'sha256:d359c4498ccf69d7d226af6be1a1cf3ec8ae8809eb7979761b9a48dab7527223');
assert.equal(outcome.ownerOutput.value.disposition,'runtime_failed');
const result=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:p.sha256Canonical(closed)});
if(result.kind!=='acquired_abg_event_resource'){await record('selected-read-refusal.json',result);throw new Error('Actual diagnostic resource owner refused');}
const resource=result.resource;
try {
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store),authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable),runId=outcome.resources.run.ref;
 assert.deepEqual(durable,closed.prefix);
 const inputs=JSON.parse(await readFile(join(root,'selected-input-context-refs.json'),'utf8'));
 assert.deepEqual(inputs.prefix,closed.prefix);assert.deepEqual(inputs.run,outcome.resources.run);
 const rows=inputs.eventRefs.map(eventId=>prefixes.runtimeEventAtPrefix(authority,eventId));
 for(const event of rows){assert(event);assert.equal(event.runId,inputs.run.ref);assert.equal(p.sha256Canonical(event.payload),event.payloadDigest);}
 const bases=rows.filter(row=>row.kind==='basis_admitted');
 const testing=bases.filter(row=>JSON.stringify(row.payload.graphFunctionRef??row.payload.graphFunctionId??row.payload.graphFunction??null).toLowerCase().includes('testing'));
 const basisRefs=[];
 for(let i=0;i<bases.length;i++){
  const event=bases[i],name=event.admissionOrdinal===586?'selected-testing-basis.json':'selected-executive-basis.json';
  await record(name,{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,event});basisRefs.push({path:join(root,name),eventId:event.eventId,ordinal:event.admissionOrdinal,payloadKeys:Object.keys(event.payload)});
 }
 await record('selected-input-context-events.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:inputs.run,selection:inputs.purpose,basisFiles:basisRefs,events:rows.filter(row=>row.kind!=='basis_admitted')});
 console.log(JSON.stringify({selectedBodies:rows.length,basisFiles:basisRefs,leafFacts:rows.filter(row=>['c_call_fibre_selected','c_call_evidenced'].includes(row.kind)&&row.aggregateId.includes('632ad4d3')).map(row=>({eventId:row.eventId,ordinal:row.admissionOrdinal,kind:row.kind,payload:row.payload})),runtimeFailure:rows.filter(row=>row.kind==='runtime_failure_observed').map(row=>row.payload)}));
} finally {
 const final=a.selectHeldEventStoreDurablePrefix(resource.store),closing=a.closeAbgEventResource(resource,final);
 await record('selected-input-context-close.json',closing);
 assert.deepEqual(closing.closeHandoff,closed,'Selected diagnostic read must leave the genuine native cut unchanged');
}
