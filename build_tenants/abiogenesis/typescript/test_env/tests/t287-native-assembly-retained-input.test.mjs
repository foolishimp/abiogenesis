import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.ABI5_GENERIC_JOB_BUILD_ROOT??resolve(import.meta.dirname,'../..');
const load=name=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
const [store,prefixes,native,calls,cursors,gtl,traversal,semantic,job,immutable]=await Promise.all([
 'abg/event_store','abg/event_prefix','abg/execution_basis','abg/c_call','abg/traversal_cursor','gtl/index',
 'hog/traversal','abg/semantic_stage','abg/semantic_job','shared/immutable'].map(load));

test('actual native author fold consumes its admitted retained pair; crossed basis and input refuse',async t=>{
 const selected=process.env.ABI5_NATIVE_RETAINED_JOB;
 assert.ok(selected,'explicit closed job selection required; this test never acquires or writes its resource');
 const read=async name=>JSON.parse(await readFile(join(selected,name),'utf8'));
 const receipt=(await read('live-receipt.json')).receipt, start=await read('live-start.jsonl'), prepared=await read('prepared.json');
 assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
 const closed=receipt.resources.eventResource.closeHandoff.prefix, path=fileURLToPath(closed.eventLogRef),before=await stat(path);
 const events=store.readRuntimeEventsAtDurablePrefix(closed,{requireCurrent:true});
 const failed=events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.failureClass==='implementation_exception'&&
  events.some(x=>x.kind==='c_call_fibre_selected'&&x.aggregateId===e.aggregateId&&x.payload.implementationRef===gtl.SEMANTIC_STAGE_IDS.nativeAuthorFoldImplementationRef));
 assert.ok(failed,'retained native-author-fold counterexample');
 const fibre=events.find(e=>e.kind==='c_call_fibre_selected'&&e.aggregateId===failed.aggregateId);
 const coordinate=store.durableRuntimeEventPrefixThroughEvent(closed,fibre.eventId);
 const selectedPrefix=prefixes.selectValidatedRuntimeEventPrefix(store.readRuntimeEventsAtDurablePrefix(coordinate));
 const execution=native.rehydrateExecutionBasisAtPrefix(selectedPrefix,fibre.basisId);assert.ok(execution);
 const publications=immutable.deepFreeze(start.invocation.resources.catalog.boundPublications);
 const publication=publications.find(p=>p.programs.some(program=>program.programRef===execution.programRef));assert.ok(publication);
 const graphs=publications.flatMap(p=>p.graphFunctions),graphFunction=graphs.find(g=>g.name===execution.graphFunctionRef);
 const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,
  admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
 const initial=events.find(e=>e.kind==='traversal_cursor_entered'&&e.basisId===execution.basisRef&&e.frameId===fibre.frameId);assert.ok(initial);
 let cursor=cursors.constructTraversalCursorCandidate({programRef:execution.programRef,executionBasisRef:execution.basisRef,
  traversalScopeRef:initial.payload.traversalScopeRef,runId:initial.runId,graphCallId:initial.graphCallId,frameId:initial.frameId,
  graphRef:graph.materializationRef,inputRef:initial.payload.inputRef,inputDigest:initial.payload.inputDigest,
  currentNodeRef:graph.template.startNodeRef,position:'at_term',termPath:initial.payload.termPath,taskOrdinal:initial.payload.taskOrdinal,
  attempt:initial.payload.attempt,retryPath:initial.payload.retryPath});
 assert.equal(cursor.cursorRef,initial.payload.cursorRef);
 // Replay only the two declared cursor advances, using the existing HoG constructor.
 for(const route of events.filter(e=>e.kind==='traversal_route_admitted'&&e.basisId===execution.basisRef&&
  e.frameId===fibre.frameId&&e.admissionOrdinal<fibre.admissionOrdinal)){
  assert.equal(route.payload.sourceCursorRef,cursor.cursorRef);
  const result=events.find(e=>e.kind==='c_call_result_admitted'&&e.aggregateId===route.payload.cCallRef);
  const input=route.payload.boundInput;
  cursor=traversal.deriveCompletedTraversalCursor(graph,cursor,{inputRef:input?.admissionRef??result.payload.resultRef,
   inputDigest:input?.subjectDigest??result.payload.valueDigest});
  assert.equal(cursor.cursorRef,route.payload.targetCursorRef);
 }
 const cCall=calls.projectOpenedCCallCarrierAtPrefix(selectedPrefix,graph,failed.aggregateId);assert.ok(cCall);
 const sample={publication,lifecyclePublication:publication,sourcePublication:publication,graph,graphFunction,
  declarationGraphFunctions:graphs,executionBasis:execution,cCall,cursor,predecessorPrefix:coordinate};
 const predecessor=await import(pathToFileURL(join(prepared.abiRoot,'build/code/src/abg/execution_basis.js')).href);
 assert.equal(predecessor.constructNativeInstructionAssemblyBasis(sample),null,'unchanged installed core15 reproduces missing retained-input join');
 const basis=semantic.constructSemanticStageNativeBasis(sample);assert.ok(basis,'actual source/route/native basis authenticates');
 const owner=native.authenticateNativeInstructionAssemblyBasis(basis);assert.ok(owner);
 assert.equal(owner.inputRef,cursor.inputRef);assert.equal(owner.inputDigest,cursor.inputDigest);
 assert.equal(owner.inputValue.kind,'retained_graph_input');
 assert.equal(job.authenticateSemanticJobBasis(basis).role,'author');
 const folded=job.projectNativeSemanticFold(basis,owner.inputValue);assert.ok(folded,'preserved paid candidate folds without another actor');
 assert.equal(folded.assets.length,1);assert.equal(folded.assets[0].assessment,null);
 assert.equal(folded.assets[0].source.cCallRef,owner.inputValue.source.provenance.cCallRef,'actual Fable native author is conserved');
 assert.equal(folded.assets[0].source.nativeWork.adapterCCallRef,cCall.cCallRef);
 assert.equal(semantic.constructSemanticStageNativeBasis({...sample,executionBasis:{...execution,basisRef:execution.parentExecutionBasisRef}}),null);
 const crossed=cursors.constructTraversalCursorCandidate({...cursor,inputRef:execution.rawInputAdmissionRef,inputDigest:execution.rawInputDigest});
 assert.equal(semantic.constructSemanticStageNativeBasis({...sample,cursor:crossed}),null);
 assert.equal(job.projectNativeSemanticFold(basis,{...owner.inputValue,source:{...owner.inputValue.source,observationDigest:'sha256:'+'0'.repeat(64)}}),null);
 const after=await stat(path);for(const key of ['dev','ino','size','mtimeMs'])assert.equal(after[key],before[key]);
 t.diagnostic(JSON.stringify({run:receipt.ownerOutput.value.run,closed,foldCCall:cCall.cCallRef,inputRef:owner.inputRef,inputDigest:owner.inputDigest,
  sourceObservation:owner.inputValue.source.observationRef,sourceActor:folded.assets[0].source.actorInvocationRef,
  candidateDigest:folded.assets[0].source.nativeWork.assetDigest,scope:'Historical native owner/value derivation only; no new admission, actor, effect or acceptance.'}));
});
