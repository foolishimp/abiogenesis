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
const [a,p,prefixes]=await Promise.all(['abg','product','abg/event_prefix'].map(name=>import(pathToFileURL(join(runtimeRoot,'build/code/src/'+name+'.js')).href)));
const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(closed.prefix.prefixLength,13131877);assert.equal(closed.prefix.coordinateDigest,'sha256:d359c4498ccf69d7d226af6be1a1cf3ec8ae8809eb7979761b9a48dab7527223');
assert.equal(outcome.ownerOutput.value.disposition,'runtime_failed');
const result=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:p.sha256Canonical(closed)});
if(result.kind!=='acquired_abg_event_resource'){await record('selected-read-refusal.json',result);throw new Error('Actual diagnostic resource owner refused');}
const resource=result.resource;
try {
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store),authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable),runId=outcome.resources.run.ref;
 assert.deepEqual(durable,closed.prefix);
 const envelopes=[];for(const row of prefixes.runtimeEventEnvelopesAtPrefix(authority))if(row.runId===runId)envelopes.push(row);
 const metadata=envelopes.map(row=>({eventId:row.eventId,admissionOrdinal:row.admissionOrdinal,kind:row.kind,aggregateId:row.aggregateId,causationEventRefs:row.causationEventRefs??null,payloadDigest:row.payloadDigest}));
 const chosen=envelopes.filter(row=>/execution_basis_admitted|f_d_binding_admitted|deterministic_evidence_attached|c_call_result_admitted|c_call_judgment_admitted|runtime_failure_admitted|native|actor_transport_binding_admitted|current_worksite/.test(row.kind));
 const rows=chosen.map(row=>prefixes.runtimeEventAtPrefix(authority,row.eventId));
 for(const event of rows)assert.equal(p.sha256Canonical(event.payload),event.payloadDigest);
 const bases=rows.filter(row=>row.kind==='execution_basis_admitted');
 const basisSummary=bases.map(row=>({eventId:row.eventId,admissionOrdinal:row.admissionOrdinal,basisId:row.payload.basisId,graphFunctionRef:row.payload.graphFunctionRef??row.payload.graphFunctionId??row.payload.graphFunction??null,inputDigest:row.payload.inputDigest??row.payload.rawInputDigest??null,payloadKeys:Object.keys(row.payload)}));
 const testing=bases.filter(row=>JSON.stringify(row.payload.graphFunctionRef??row.payload.graphFunctionId??row.payload.graphFunction??null).toLowerCase().includes('testing'));
 const files=[];for(let i=0;i<testing.length;i++){const name='selected-testing-basis-'+i+'.json';await record(name,{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,event:testing[i]});files.push(name);}
 const selected=rows.filter(row=>!bases.includes(row));
 await record('selected-failure-events.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:outcome.resources.run,selection:'Exact failed Run kind/causal facts via existing canonical envelope/body owner; no complete Replay/history materialization',events:selected});
 await record('selected-event-index.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:outcome.resources.run,eventCount:envelopes.length,kindCounts:metadata.reduce((counts,row)=>(counts[row.kind]=(counts[row.kind]??0)+1,counts),{}),metadata,bases:basisSummary,testingBasisFiles:files,selectedBodyCount:rows.length});
 console.log(JSON.stringify({eventCount:envelopes.length,selectedBodies:rows.length,bases:basisSummary,testingBasisFiles:files,failures:selected.filter(row=>row.kind==='runtime_failure_admitted').map(row=>({eventId:row.eventId,payload:row.payload})),results:selected.filter(row=>row.kind==='c_call_result_admitted').map(row=>({eventId:row.eventId,cCallRef:row.aggregateId,resultRef:row.payload.resultRef,resultClass:row.payload.resultClass,valueKind:row.payload.value?.kind,value:row.payload.resultClass!=='success'?row.payload.value:undefined}))}));
} finally {
 const final=a.selectHeldEventStoreDurablePrefix(resource.store),closing=a.closeAbgEventResource(resource,final);
 await record('selected-read-close.json',closing);
 assert.deepEqual(closing.closeHandoff,closed,'Selected diagnostic read must leave the genuine native cut unchanged');
}
