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

test('actual native author fold consumes its admitted retained pair; crossed basis and input refuse',{skip:!process.env.ABI5_NATIVE_RETAINED_JOB&&'ABI5_NATIVE_RETAINED_JOB unset; requires the explicit closed retained native job selection'},async t=>{
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
 const owner=native.authenticateOwnedNativeInstructionAssemblyBasis(basis);assert.ok(owner);
 assert.equal(owner.inputRef,cursor.inputRef);assert.equal(owner.inputDigest,cursor.inputDigest);
 assert.equal(owner.inputValue.kind,'retained_graph_input');
 assert.equal(job.authenticateOwnedSemanticJobBasis(basis).role,'author');
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

// Pre-P1 Context value-use boundary at the actual instruction-assembly and actor
// preparation owners. Basis authentication and role evidence are controlled lower
// premises (component frontier); the task, both Context identities, the assembly
// and the actor preparation are real. No Run, admission, provider or history claim.
test('pre-P1 native Context input refuses unsupported_selection before any actor; fresh format assembles',async t=>{
 const fs=await import('node:fs/promises'),{dirname}=await import('node:path'),{SourceTextModule,SyntheticModule}=await import('node:vm');
 const {loadWorksiteOwner,worksiteFixture}=await import('../support/t287-generic-job-worksite.mjs');
 const product=await loadWorksiteOwner(),nativeWork=await load('product/native_workspace_work'),ids=nativeWork.NATIVE_WORKSPACE_WORK_IDS;
 const env=await worksiteFixture(product);t.after(()=>fs.rm(env.scratch,{recursive:true,force:true}));
 await fs.writeFile(join(env.canonicalRoot,'target.txt'),'before\n');await fs.writeFile(join(env.canonicalRoot,'keep.txt'),'unchanged\n');
 const context=await product.observeWorksiteContext({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,readRoots:['.'],maxFiles:20,maxBytes:10000});
 const task=nativeWork.constructNativeWorkspaceWorkTask({workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
  capabilityGrant:env.capabilityGrant,context,outcome:'Perform the declared local work',instructions:['Read the selected input.'],readFirst:['target.txt'],writeRoots:['target.txt'],checks:[]});
 // The same physical observation under its pre-P1 identity: the digest covered the inline bytes.
 const {kind:_k,schemaVersion:_s,observationRef:_r,observationDigest:_d,...body}=context,preDigest=product.sha256Canonical(body);
 assert.notEqual(preDigest,context.observationDigest);
 const preContext=immutable.deepFreeze({...context,observationDigest:preDigest,observationRef:'worksite-context-observation://abiogenesis/'+preDigest.slice(7)});
 assert.equal(product.isWorksiteContextObservation(preContext),false);
 const preTask=immutable.deepFreeze({...task,context:preContext});assert.equal(nativeWork.isNativeWorkspaceWorkTask(preTask),false);
 const digest=label=>product.sha256Canonical({label});
 const publication=gtl.constructNativeWorkspaceWorkModulePublication({productId:'product://native-owner/test',artifactDigest:digest('artifact'),
  productContentDigest:digest('content'),productManifestDigest:digest('manifest'),packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-dev.286'});
 const graphFunction=publication.graphFunctions.find(g=>g.name===nativeWork.nativeWorkspaceWorkGraphFunctionRef(task));assert.ok(graphFunction);
 const call={cCallRef:'c-call://pre-p1/native',cCallDigest:digest('call'),regime:'F_P',callClass:'leaf',runId:'run://pre-p1/native',graphCallId:'graph-call://pre-p1/native',
  frameId:'frame://pre-p1/native',programLocusRef:ids.nodeRef,taskOrdinal:null,attempt:1,implementationRef:ids.implementationRef,graphFunctionRef:graphFunction.name,
  inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef};
 const execution={basisRef:'basis://pre-p1/native',basisDigest:digest('basis'),invocationAdmissionRef:'invocation://pre-p1/native',programRef:ids.programRef};
 const predecessorPrefix={kind:'durable_prefix_coordinate',coordinateDigest:digest('prefix')};
 const basis=immutable.deepFreeze({publication,graphFunction,executionBasis:execution,cCall:call,predecessorPrefix});
 let supplied=task,roles=0,dispatches=0;
 const owner=()=>({prefix:null,call,execution,program:publication.programs[0],environment:null,inputRef:'input://pre-p1/native',
  inputDigest:product.sha256Canonical(supplied),inputValue:supplied});
 async function component(name,overrides){
  const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file});
  await module.link(async specifier=>{const imported=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
   const values={...imported,...overrides[specifier]};return new SyntheticModule(Object.keys(values),function(){for(const [key,value] of Object.entries(values))this.setExport(key,value);});});
  await module.evaluate();return module.namespace;
 }
 const executionOwner={authenticateOwnedNativeInstructionAssemblyBasis:()=>owner(),constructNativeInstructionAssemblyBasis:value=>value};
 const assembly=await component('abg/instruction_assembly',{'./execution_basis.js':executionOwner,
  './stdo_environment.js':{projectRunEnvironmentRoleEvidenceAtPrefix:()=>{roles++;return null;}}});
 const actor=await component('abg/actor_process',{'./instruction_assembly.js':assembly,'./execution_basis.js':executionOwner,
  './worker_transport.js':{prepareWorkerTransport:async()=>{dispatches++;throw new Error('provider dispatch prohibited');},
   runPreparedWorkerTransport:()=>{dispatches++;throw new Error('provider dispatch prohibited');}}});
 const occurrence={cCallRef:call.cCallRef,runId:call.runId,graphCallId:call.graphCallId,frameId:call.frameId,programLocusRef:call.programLocusRef,
  taskOrdinal:call.taskOrdinal,attempt:call.attempt,nativeInstructionAssemblyBasis:basis};

 // Fresh current format: the same owner assembles the native work order.
 const fresh=assembly.requireDeclaredNativeInstructionAssembly(basis,task);
 assert.equal(fresh.kind,'native_instruction_assembly');assert.equal(fresh.request.implementationRef,ids.implementationRef);
 assert.equal(fresh.request.inputDigest,product.sha256Canonical(task));assert.equal(fresh.request.transportLane,'worker_executes');
 assert.equal(fresh.manifest.contextRef,context.observationRef);assert.match(fresh.request.prompt,/Perform the declared work/);
 assert.deepEqual(actor.prepareActorProcessInvocation(task,occurrence).prepareInstructionAssembly().request,fresh.request);

 // Pre-P1 format of the same physical observation: one typed refusal, no actor.
 supplied=preTask;const rolesBefore=roles;
 const typed=error=>{const refusal=JSON.parse(error.message);assert.deepEqual(refusal,{kind:'native_instruction_assembly_refusal',
  cause:'unsupported_selection',policy:null,role:'constructor',unresolvedRefs:[preContext.observationRef]});return true;};
 assert.throws(()=>assembly.requireDeclaredNativeInstructionAssembly(basis,preTask),typed);
 assert.equal(assembly.constructDeclaredNativeInstructionAssembly(basis,preTask),null);
 assert.throws(()=>assembly.requireWorksiteNativeInstructionAssembly(basis,preTask),typed);
 assert.equal(roles,rolesBefore,'refused before role evidence or prompt rendering');
 const prepared=actor.prepareActorProcessInvocation(preTask,occurrence);
 assert.throws(()=>prepared.prepareInstructionAssembly(),typed);
 const effect=await prepared.invokeActorProcess({predecessorPrefix,occurrence});
 assert.equal(effect.kind,'actor_process_effect_refusal');assert.equal(effect.code,'actor_process_invocation_refused');
 assert.equal(effect.message,'native assembly preparation did not complete');assert.equal(effect.processFacts,null);
 assert.equal(dispatches,0,'no actor transport is prepared or run');

 // A fresh observation of the same files is the current input; it is not the pre-P1 value.
 supplied=task;assert.equal(assembly.requireDeclaredNativeInstructionAssembly(basis,task).request.inputDigest,fresh.request.inputDigest);
 t.diagnostic(JSON.stringify({kind:'pre_p1_native_context_boundary',owner:'abg/instruction_assembly',cause:'unsupported_selection',
  preP1ContextRef:preContext.observationRef,currentContextRef:context.observationRef,dispatches,
  scope:'Native work task input only; no decoder, migration, schema change or generic history-read claim. Lower basis/role premises are controlled.'}));
});
