import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),directory=join(root,'execution/audit');
const setup=JSON.parse(await readFile(join(directory,'prepared-setup.json'),'utf8'));
const closed=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.close.json'),'utf8'));
const receipt=JSON.parse(await readFile(join(directory,'calls/lifecycle-start.outcome.json'),'utf8')).receipt;
const selected=JSON.parse(await readFile(join(root,'selected-testing-basis.json'),'utf8')).event;
const {installedModules}=await import('../continuation-09/helpers/public-setup.mjs');
const runtimeRoot=setup.installedRoot,runtime=await installedModules(runtimeRoot),a=runtime.abg,p=runtime.product;
const prefixes=await import(pathToFileURL(join(runtimeRoot,'build/code/src/abg/event_prefix.js')).href);
const truth=await import(pathToFileURL(join(runtimeRoot,'build/code/src/abg/invocation_execution_truth.js')).href);
const record=async(name,value)=>writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
assert.equal(closed.prefix.prefixLength,17131527);
assert.equal(closed.prefix.coordinateDigest,'sha256:2c302161f365f230e815beac170465932ba835480a498bd1cd9c1ed77bc5cecb');
assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
const acquired=a.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:closed,handoffDigest:p.sha256Canonical(closed)});
if(acquired.kind!=='acquired_abg_event_resource'){await record('selected-invocation-owner-refusal-02.json',acquired);throw new Error('Addressed stopped invocation owner refused');}
const resource=acquired.resource;
try {
 const durable=a.selectHeldEventStoreDurablePrefix(resource.store),authority=prefixes.projectOwnedRuntimeEventPrefixAtDurablePrefix(durable);assert.deepEqual(durable,closed.prefix);
 const requested=receipt.resources.invocationAdmission;
 const invocation=truth.projectExactInvocationAdmissionAtPrefix(authority,requested.ref);
 if(invocation===null){await record('selected-invocation-null-02.json',{requested,prefix:durable});throw new Error('Exact invocation admission projection returned null');}
 assert.equal(invocation.invocationAdmissionDigest,requested.digest);
 const execution=truth.projectExactExecutionBasisAtPrefix(authority,selected.payload.basisRef);assert(execution,'Testing execution basis projection');
 assert.equal(execution.invocationAdmissionRef,invocation.invocationAdmissionRef);
 const roots=prefixes.indexedRuntimeEvents(authority,'invocation:'+invocation.invocationRef).filter(e=>e.kind==='basis_admitted'&&e.payload.basisClass==='root'&&e.payload.invocationAdmissionRef===invocation.invocationAdmissionRef&&e.payload.implementationSetRef===execution.rootImplementationSetRef);
 if(roots.length!==1){await record('selected-root-cardinality-02.json',{requested,prefix:durable,rootImplementationSetRef:execution.rootImplementationSetRef,matches:roots.map(e=>({eventId:e.eventId,basisId:e.basisId}))});throw new Error('Unique exact root basis not selected');}
 const event=roots[0],rootBasis=truth.projectExactExecutionBasisAtPrefix(authority,event.payload.basisRef);assert(rootBasis);
 assert.equal(p.sha256Canonical(event.payload.rawInputValue),rootBasis.rawInputDigest);
 await record('selected-root-basis-02.json',{installedOwnerRoot:runtimeRoot,prefix:durable,selector:{invocationRef:invocation.invocationRef,invocationAdmissionRef:invocation.invocationAdmissionRef,basisClass:'root',implementationSetRef:execution.rootImplementationSetRef},event});
 const fields=['invocationAdmissionRef','invocationAdmissionDigest','invocationRef','invocationDigest','invocationVariant','publicRequestInvocationRef','rawInputAdmissionRef','rawInputDigest','inputContractRef','inputContractDigest','outputContractRef','outputContractDigest','workspaceBindingId','workspaceBindingDigest','programRef','programDigest','graphFunctionRef','graphFunctionDigest','admissionEventRef','publicOperationEventRef','sourceResultBasis'];
 const admission=Object.fromEntries(fields.map(name=>[name,invocation[name]]));
 const state=event.payload.rawInputValue;
 const source=invocation.sourceResultBasis;
 const retained=source?.sourceResultContractRef==='contract://abiogenesis/default-library/state@5'&&source.sourceResultValueDigest===invocation.rawInputDigest;
 await record('selected-invocation-source-relation-02.json',{installedOwnerRoot:runtimeRoot,prefix:durable,canonicalOwner:'projectExactInvocationAdmissionAtPrefix',requestedInvocationAdmission:requested,admission,capabilityGrantCount:invocation.capabilityGrants.length,testingExecution:{basisRef:execution.basisRef,rootImplementationSetRef:execution.rootImplementationSetRef,rootImplementationSetDigest:execution.rootImplementationSetDigest},rootBasis:{eventId:event.eventId,admissionOrdinal:event.admissionOrdinal,basisClass:rootBasis.basisClass,basisRef:rootBasis.basisRef,implementationSetRef:rootBasis.implementationSetRef,implementationSetDigest:rootBasis.implementationSetDigest,rawInputAdmissionRef:rootBasis.rawInputAdmissionRef,rawInputDigest:rootBasis.rawInputDigest,rawInputFile:'selected-root-basis-02.json',rawInputPath:'event.payload.rawInputValue',resultContractRef:rootBasis.resultContractRef},retainedIdentityConjunct:retained,initialSummary:{kind:state?.kind,terminal:state?.terminal,observationCount:state?.observations?.length,synthesisIsNull:state?.synthesis===null},documentaryCorrection:{predecessor:'selected-invocation-source-relation.json',formerRoot:'selected-root-basis.json',cause:'The first selector addressed admissions by aggregateId and selected child rows from the current Run. The canonical admission owner and exact root predicate now select the authorized facts; no absence or root claim follows from the incomplete predecessor.'},limits:'Captured owner facts do not identify the earliest internal null branch or authenticate a future effect.'});
 console.log(JSON.stringify({invocationAdmission:requested,sourceResultBasis:source,rawInputDigest:invocation.rawInputDigest,rootEventId:event.eventId,rootOrdinal:event.admissionOrdinal,rootBasisRef:rootBasis.basisRef,basisClass:rootBasis.basisClass,implementationSetRef:rootBasis.implementationSetRef,rootRawInputDigest:rootBasis.rawInputDigest,retainedIdentityConjunct:retained,observationCount:state?.observations?.length}));
} finally {
 const final=a.selectHeldEventStoreDurablePrefix(resource.store),closing=a.closeAbgEventResource(resource,final);await record('selected-invocation-close-02.json',closing);assert.deepEqual(closing.closeHandoff,closed,'Addressed stopped input selection must leave the native cut unchanged');
}
