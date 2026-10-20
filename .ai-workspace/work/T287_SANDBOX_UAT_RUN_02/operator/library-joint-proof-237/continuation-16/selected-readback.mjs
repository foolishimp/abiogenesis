import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),record=(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const selected=JSON.parse(await readFile(join(root,'inputs.json'),'utf8'));
const setup=JSON.parse(await readFile(join(root,'execution/audit/prepared-setup.json'),'utf8'));
const close=JSON.parse(await readFile(join(root,'execution/audit/calls/lifecycle-start.close.json'),'utf8'));
const failure=JSON.parse(await readFile(join(root,'native-failure-summary.json'),'utf8')).failureEvidence[0];
const helper=selected.helperFiles.find(row=>row.path===join(selected.helperRoot,'public-setup.mjs'));
const bytes=await readFile(helper.path);assert.equal(bytes.length,helper.byteCount);assert.equal(createHash('sha256').update(bytes).digest('hex'),helper.sha256);
const {installedModules}=await import(pathToFileURL(helper.path).href);
const runtime=await installedModules(setup.installedRoot),a=runtime.abg,p=runtime.product,hash=p.sha256Canonical;
const prefixes=await import(pathToFileURL(join(setup.installedRoot,'build/code/src/abg/event_prefix.js')).href);
const started=performance.now();let resource=null;
try {
  const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:close,handoffDigest:hash(close)});
  await record('selected-readback-acquisition.json',{kind:acquired.kind,elapsedMs:performance.now()-started,selectedClose:join(root,'execution/audit/calls/lifecycle-start.close.json')});
  assert.equal(acquired.kind,'acquired_abg_event_resource');resource=acquired.resource;
  const durable=a.selectHeldEventStoreDurablePrefix(resource.store);assert.deepEqual(durable,close.prefix);
  const prefix=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);
  const envelopes=prefixes.indexedRuntimeEventEnvelopes(prefix,'run:'+failure.runId);
  const counts={};for(const event of envelopes)counts[event.kind]=(counts[event.kind]??0)+1;
  const selectedRows=[];
  for(const event of envelopes) {
    if(!['c_call_result_admitted','actor_process_observation_admitted','actor_process_carrier_validated','actor_transport_binding_admitted','deterministic_evidence_recorded','native_effect_receipt_admitted','runtime_failure_admitted'].includes(event.kind))continue;
    const owned=prefixes.runtimeEventAtPrefix(prefix,event.eventId);assert.equal(hash(owned.payload),owned.payloadDigest);
    selectedRows.push(owned);
  }
  const scalarRows=selectedRows.map(event=>({eventId:event.eventId,kind:event.kind,admissionOrdinal:event.admissionOrdinal,aggregateId:event.aggregateId,basisId:event.basisId,causationEventRefs:event.causationEventRefs,payloadDigest:event.payloadDigest,payloadKeys:Object.keys(event.payload),resultRef:event.payload.resultRef??null,valueKind:event.payload.resultValue?.kind??event.payload.value?.kind??null,diagnostic:event.payload.diagnosticRef??event.payload.resultValue?.diagnosticRef??event.payload.value?.diagnosticRef??null}));
  await record('selected-owner-event-index.json',{prefix:durable,runId:failure.runId,counts,selectedRows:scalarRows,elapsedMs:performance.now()-started});
  // Preserve only the bounded failure-bearing values and transport observations.
  const retained=selectedRows.filter(event=>event.kind==='c_call_result_admitted'&&p.canonicalJson(event.payload).includes('transport-identity-mismatch')||event.kind==='actor_process_observation_admitted');
  await record('selected-failure-values.json',{installedOwnerRoot:setup.installedRoot,prefix:durable,events:retained});
  console.log(JSON.stringify({stage:'selected-readback',counts,rows:scalarRows,retainedCount:retained.length,elapsedMs:performance.now()-started}));
} catch(error) {
  await record('selected-readback-error.json',{name:error.name,message:error.message,stack:error.stack});throw error;
} finally {
  if(resource){const closed=a.closeAbgEventResource(resource,a.selectHeldEventStoreDurablePrefix(resource.store));await record('selected-readback-close.json',closed);assert.deepEqual(closed.closeHandoff,close);}
}
