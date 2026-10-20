import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url)),directory=join(root,'execution/audit');
const setup=JSON.parse(await readFile(join(directory,'prepared-setup.json'),'utf8'));
const closed=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.close.json'),'utf8'));
const receipt=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.outcome.json'),'utf8')).receipt;
const {installedModules}=await import('../continuation-09/helpers/public-setup.mjs');
const runtimeRoot=setup.installedRoot,runtime=await installedModules(runtimeRoot),a=runtime.abg,p=runtime.product;
const prefixes=await import(pathToFileURL(join(runtimeRoot,'build/code/src/abg/event_prefix.js')).href);
const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(closed.prefix.prefixLength,17131527);
assert.equal(closed.prefix.coordinateDigest,'sha256:2c302161f365f230e815beac170465932ba835480a498bd1cd9c1ed77bc5cecb');
assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:p.sha256Canonical(closed)});
if(acquired.kind!=='acquired_abg_event_resource'){await record('selected-owner-refusal.json',acquired);throw new Error('Selected stopped-facts owner refused');}
const resource=acquired.resource;
try {
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store),authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);assert.deepEqual(durable,closed.prefix);
 const all=[...prefixes.runtimeEventEnvelopesAtPrefix(authority)],rows=all.filter(x=>x.runId===receipt.resources.run.ref);
 const load=row=>{const event=prefixes.runtimeEventAtPrefix(authority,row.eventId);assert(event);assert.equal(p.sha256Canonical(event.payload),event.payloadDigest);return event;};
 const bases=rows.filter(x=>x.kind==='basis_admitted').map(load);
 const testing=bases.filter(x=>String(x.payload.graphFunctionRef??x.payload.graphFunctionId??x.payload.graphFunction).includes('/testing@5'));
 assert.equal(testing.length,1);await record('selected-testing-basis.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,event:testing[0]});
 const rootBases=bases.filter(x=>!testing.includes(x));
 assert.equal(rootBases.length,1);await record('selected-root-basis.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,event:rootBases[0]});
 const fibres=rows.filter(x=>x.kind==='c_call_fibre_selected').map(load);
 const leaf=fibres.filter(x=>x.payload.implementationRef==='implementation://abiogenesis/default-library/prepare-testing@5');assert.equal(leaf.length,1);
 const cCallRef=leaf[0].payload.cCallRef;
 const leafEvents=rows.filter(x=>x.aggregateId===cCallRef&&x.kind!=='activity_probe').map(load);
 const failures=rows.filter(x=>x.kind==='runtime_failure_observed').map(load);
 await record('selected-leaf-events.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:receipt.resources.run,cCallRef,events:leafEvents,runtimeFailures:failures});
 const transports=rows.filter(x=>x.kind==='actor_transport_binding_admitted').map(load);
 const nativeContext=transports.map(event=>{const assembly=event.payload.instructionAssembly;return {eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,payloadDigest:event.payloadDigest,cCallRef:event.payload.cCallRef,inputDigest:event.payload.inputDigest,transportBindingRef:event.payload.transportBindingRef,transportBindingDigest:event.payload.transportBindingDigest,assemblyDigest:assembly.envelopeDigest,assemblyPlanRef:assembly.planRef,assemblyPlanDigest:assembly.planDigest,boundBasis:assembly.envelope.boundBasis,targetBindings:assembly.envelope.targetBindings,planningTask:assembly.envelope.sections.task,requestInputDigest:assembly.request.inputDigest,requestActorRef:assembly.request.actorRef};});
 await record('selected-current-context.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:receipt.resources.run,classification:'Addressed admitted transport planning/context projection for triage; complete assembly definitions/prompt remain in original event body',contexts:nativeContext,originalNativeProducer:{path:join(root,'../continuation-10/selected-native-producer.json'),resultRef:'result://abiogenesis/4f184872023163f5570f57a4d3bec2719451020a98017cf4261f17d5a5aecc80'}});
 const admissions=all.filter(x=>x.kind==='invocation_admitted'&&(x.aggregateId===receipt.resources.invocationAdmission.ref||x.aggregateId===receipt.invocationRef));
 const admissionFacts=admissions.map(load).map(event=>{const q=event.payload;const source=q.sourceResultBasis??q.admission?.sourceResultBasis??null;return {eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,payloadDigest:event.payloadDigest,payloadKeys:Object.keys(q),admissionRef:q.admissionRef??q.invocationAdmissionRef??null,invocationRef:q.invocationRef??null,publicAuthorityDigest:q.publicAuthorityDigest??null,inputDigest:q.inputDigest??q.rawInputDigest??null,graphFunctionRef:q.graphFunctionRef??null,programRef:q.programRef??null,outputContractRef:q.outputContractRef??null,sourceResultBasis:source};});
 // The source basis is finite semantic provenance, never a saved nominal admission receipt.
 await record('selected-invocation-source-relation.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,requestedInvocationAdmission:receipt.resources.invocationAdmission,admissionFacts,rootBasis:{eventId:rootBases[0].eventId,basisId:rootBases[0].payload.basisId,graphFunctionRef:rootBases[0].payload.graphFunctionRef,inputDigest:rootBases[0].payload.inputDigest??rootBases[0].payload.rawInputDigest??null,rawInputDigest:p.sha256Canonical(rootBases[0].payload.rawInputValue),outputContractRef:rootBases[0].payload.outputContractRef??null},admissionEnvelopeCount:all.filter(x=>x.kind==='invocation_admitted').length});
 const sourceImage=await readFile(join(runtimeRoot,'build/code/src/abg/native_work_reacquisition.js'));
 await record('selected-owner-code.json',{path:join(runtimeRoot,'build/code/src/abg/native_work_reacquisition.js'),sha256:createHash('sha256').update(sourceImage).digest('hex'),byteCount:sourceImage.length,source:'Exact39 emitted owner; current install selected by actual11 binding/setup',claim:'Binding comparison implementation is selected; this does not prove it was the first refusing conjunct'});
 await record('selected-run-index.json',{installedOwnerRoot:runtimeRoot,prefix:closed.prefix,run:receipt.resources.run,metadata:rows.map(x=>({eventId:x.eventId,admissionOrdinal:x.admissionOrdinal,kind:x.kind,aggregateId:x.aggregateId,payloadDigest:x.payloadDigest})),allInvocationEnvelopes:all.filter(x=>x.kind==='invocation_admitted').map(x=>({eventId:x.eventId,admissionOrdinal:x.admissionOrdinal,aggregateId:x.aggregateId,payloadDigest:x.payloadDigest}))});
 const results=leafEvents.filter(x=>x.kind==='c_call_result_admitted');
 console.log(JSON.stringify({testingBasis:{eventId:testing[0].eventId,basisId:testing[0].payload.basisId,inputDigest:testing[0].payload.inputDigest??testing[0].payload.rawInputDigest},leaf:cCallRef,results:results.map(x=>({eventId:x.eventId,ordinal:x.admissionOrdinal,resultRef:x.payload.resultRef,resultClass:x.payload.resultClass,value:x.payload.value})),invocationAdmissionFacts:admissionFacts.length,rootBasis:rootBases[0].eventId,contextCount:nativeContext.length}));
} finally {
 const final=a.selectHeldEventStoreDurablePrefix(resource.store),closing=a.closeAbgEventResource(resource,final);await record('selected-facts-close.json',closing);assert.deepEqual(closing.closeHandoff,closed,'Read-only closing facts must leave native cut unchanged');
}
