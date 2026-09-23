import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const prior=process.env.ABI5_PHYSICAL_PREDECESSOR,retained=process.env.ABI5_PHYSICAL_SCRATCH;
assert.ok(prior);assert.ok(retained);
const root=path.resolve(import.meta.dirname,'../..');
const historyBytes=fs.readFileSync(path.join(retained,'runtime/events.jsonl'));
const history=historyBytes.toString('utf8').trimEnd().split('\n').map(JSON.parse);
const call=JSON.parse(fs.readFileSync(path.join(retained,'full-call.json')));
const originalClose=JSON.parse(fs.readFileSync(path.join(retained,'full-outcome.json'))).resources.eventResource.closeHandoff;
const load=async root=>Object.fromEntries(await Promise.all(['abg/event_store','abg/definition_event_resource','abg/execution_basis','abg/event_prefix','abg/open_call','product/index','validator/index','gtl/index','shared/digests','shared/canonical_json','shared/immutable'].map(async name=>[name.replaceAll('/','_'),await import(pathToFileURL(path.join(root,'build/code/src',name+'.js')))])));
const modules=[await load(prior),await load(root)];
const outcome=f=>{try{return{returned:f()};}catch(e){return{error:e.name,message:e.message,causes:e.errors?.map(x=>({name:x.name,message:x.message}))};}};
const counters=()=>({reads:globalThis.p0Work.descriptorReads??0,bytes:globalThis.p0Work.descriptorBytes??0});
const difference=before=>{const now=counters();return{reads:now.reads-before.reads,bytes:now.bytes-before.bytes};};
const seed=(()=>{const{eventId,admissionOrdinal,payloadDigest,eventContractDigest,...value}=history.find(x=>x.kind==='public_operation_admitted');return value;})();
function empty(m,scratch,label){const file=path.join(scratch,label+'.jsonl');const a=m.abg_event_store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:file});assert.ok(a.store);return{...a,file};}
function row(m,a,suffix='first'){return m.abg_event_store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(a.store,a.prefix,()=>m.abg_event_store.admitRuntimeEvent(a.store,{...seed,correlationId:'correlation://close-test/'+suffix})).successorPrefix;}
function reidentify(m,prefix,bytes){const{coordinateDigest,...body}=prefix;body.prefixDigest=m.shared_digests.sha256Bytes(bytes);body.prefixLength=bytes.length;return{...body,coordinateDigest:m.shared_digests.sha256Canonical(body)};}

test('resource close preserves complete expected-prefix, foreign-owner and changed-history refusal with one read',context=>{
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'t288-close-return-'));context.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
 const reports=[];
 for(const [variant,m]of modules.entries()){
  const cases=[];
  for(const mode of ['issued','copy','undefined','null','malformed','stale','foreign','tamper','recomputed_changed_history']){
   const a=empty(m,scratch,variant+'-'+mode);const prefix=row(m,a),bytes=fs.readFileSync(a.file);const resource={acquisitionKind:'new',store:a.store,entryPrefix:a.prefix};let expected=prefix,other;
   if(mode==='copy')expected=structuredClone(prefix);
   if(mode==='undefined')expected=undefined;
   if(mode==='null')expected=null;
   if(mode==='malformed')expected={...prefix,coordinateDigest:'sha256:'+'0'.repeat(64)};
   if(mode==='stale')expected=a.prefix;
   if(mode==='foreign'){other=empty(modules[1-variant],scratch,variant+'-foreign-owner');resource.store=other.store;expected=other.prefix;}
   if(mode==='tamper'){const changed=Buffer.from(bytes);changed[0]=91;fs.writeFileSync(a.file,changed);}
   if(mode==='recomputed_changed_history'){
    other=empty(m,scratch,variant+'-changed-row');row(m,other,'other');const changed=fs.readFileSync(other.file);assert.equal(changed.length,bytes.length);fs.writeFileSync(a.file,changed);expected=reidentify(m,prefix,changed);
   }
   const before=counters(),result=outcome(()=>m.abg_definition_event_resource.closeAbgEventResource(resource,expected)),work=difference(before);
   if(mode==='issued'||mode==='copy'){
    assert.ok(result.returned);assert.deepEqual(result.returned.closeHandoff.prefix,prefix);assert.equal(work.reads,variant===0?2:1);assert.equal(work.bytes,(variant===0?2:1)*bytes.length);
    const reopened=m.abg_event_store.reopenEventStore(result.returned.closeHandoff.reopenAuthority);assert.equal(reopened.kind,'reopened_event_store_context');assert.deepEqual(reopened.store.readAll(),a.store.readAll());reopened.store.closeDurableLog();
   }else{assert.ok(result.error,mode);assert.equal(a.store.readAll().length,1);fs.writeFileSync(a.file,bytes);m.abg_event_store.assertHeldEventStoreAtDurablePrefix(a.store,prefix);}
   cases.push({mode,result:result.returned?{disposition:'closed'}:result,work});a.store.closeDurableLog();other?.store.closeDurableLog();
  }
  reports.push(cases);
 }
 assert.deepEqual(reports[1].map(x=>[x.mode,x.result]),reports[0].map(x=>[x.mode,x.result]));
 console.log(JSON.stringify({kind:'d06_close_return_conservation',reports}));
});

function prepareChild(m){
 const child=history.find(x=>x.kind==='basis_admitted'&&x.payload.basisClass==='child'),cut=history.slice(0,child.admissionOrdinal-1),prefix=m.abg_event_prefix.selectValidatedRuntimeEventPrefix(m.shared_immutable.deepFreeze(cut));
 const parent=m.abg_execution_basis.rehydrateExecutionBasisAtPrefix(prefix,child.payload.parentExecutionBasisRef);assert.ok(parent);
 const run=cut.find(x=>x.kind==='run_segment_opened'&&x.runId===child.runId),graph=cut.find(x=>x.kind==='graph_call_opened'&&x.graphCallId===child.graphCallId),frame=cut.find(x=>x.kind==='frame_opened'&&x.frameId===child.frameId);
 const body={executionBasisRef:parent.basisRef,executionBasisDigest:parent.basisDigest,invocationAdmissionRef:parent.invocationAdmissionRef,invocationRef:parent.invocationRef,programRef:parent.programRef,graphFunctionRef:parent.graphFunctionRef,graphRef:parent.graphRef,runId:run.runId,runDigest:run.payload.runDigest,runOpenEventRef:run.eventId,graphCallId:graph.graphCallId,graphCallDigest:graph.payload.graphCallDigest,graphCallOpenEventRef:graph.eventId,frameId:frame.frameId,frameDigest:frame.payload.frameDigest,frameLineageId:frame.frameLineageId,frameOpenEventRef:frame.eventId};
 const digest=m.shared_digests.sha256Canonical(body),scope=m.abg_open_call.rehydrateOpenedTraversalScopeAtPrefix(prefix,{scopeRef:'traversal-scope://abiogenesis/'+digest.slice(7),scopeDigest:digest,...body});assert.ok(scope);
 const catalog=m.product_index.admitGraphFunctionCatalog(call.resources.catalog.readinessBasis);assert.equal(catalog.kind,'graph_function_catalog');const view=m.product_index.narrowGraphFunctionCatalog(catalog,call.resources.catalogView.allowlist);
 const closure=m.product_index.resolveProgramDeclarationClosure(catalog,view,parent.programRef);assert.equal(closure.kind,'resolved_program_declaration_closure');
 const program=closure.programPublication.programs.find(p=>p.programRef===parent.programRef),programValidation=m.validator_index.validateProgram(m.product_index.constructCatalogProgramValidationInput(catalog,view,closure,program));assert.equal(programValidation.kind,'program_validation');assert.equal(programValidation.validationRef,parent.programValidationRef);
 const graphFunction=closure.publications.flatMap(x=>x.graphFunctions).find(g=>g.name===child.payload.graphFunctionRef);
 const materialization={invocationAdmissionRef:parent.invocationAdmissionRef,admittedInputRef:child.payload.rawInputAdmissionRef,admittedInputDigest:child.payload.rawInputDigest,admittedInput:child.payload.rawInputValue};
 const childGraph=m.gtl_index.materializeGraph(graphFunction,materialization),graphValidation=m.validator_index.validateGraph(childGraph,programValidation,graphFunction,materialization);assert.equal(graphValidation.kind,'graph_validation');assert.equal(graphValidation.validationRef,child.payload.graphValidationRef);
 const input={parentExecutionBasis:parent,parentTraversalScope:scope,parentCCallRef:child.payload.parentCCallRef,program,programPublication:closure.programPublication,programValidation,graphFunction,graph:childGraph,graphValidation,rootImplementationSet:m.abg_execution_basis.rehydrateAdmittedImplementationSetAtPrefix(prefix,parent.rootImplementationSetRef),rootInteractionSet:m.abg_execution_basis.rehydrateAdmittedInteractionSetAtPrefix(prefix,parent.rootInteractionSetRef),closureContract:closure.publications.flatMap(p=>p.closureContracts).find(c=>c.closureContractRef===child.payload.closureContractRef),admittedInputRef:child.payload.rawInputAdmissionRef,admittedInputDigest:child.payload.rawInputDigest,rawInputValue:child.payload.rawInputValue};
 return{input,cutBytes:Buffer.from(historyBytes.toString('utf8').split('\n').slice(0,cut.length).join('\n')+'\n'),cutLength:cut.length};
}
function reopenCut(m,scratch,label,bytes){
 const file=path.join(scratch,label+'.jsonl');fs.writeFileSync(file,bytes);const st=fs.statSync(file),{authorityDigest,...body}=originalClose.reopenAuthority;Object.assign(body,{eventLogPath:file,device:st.dev,inode:st.ino,eventLogDigest:m.shared_digests.sha256Bytes(bytes),durableByteLength:bytes.length});
 const acquired=m.abg_event_store.reopenEventStore({...body,authorityDigest:m.shared_digests.sha256Canonical(body)});assert.equal(acquired.kind,'reopened_event_store_context');return{...acquired,file};
}

test('child return consumes its authenticated publication and conserves copied, stale, nested and rollback paths',context=>{
 context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'t288-child-return-'));context.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));const reports=[];
 for(const [variant,m]of modules.entries()){
  const fixture=prepareChild(m),cases=[];
  for(const mode of ['issued','copy','nested','semantic_refusal','stale','foreign','tamper','candidate_error','during_append_tamper']){
   const a=reopenCut(m,scratch,variant+'-'+mode,fixture.cutBytes);let prefix=a.prefix,input=fixture.input,target=a.store,other;
   const basis={eventTime:'2026-09-20T00:00:00.000Z',correlationId:'correlation://child-return/test',causationEventRefs:[]};
   if(mode==='copy')prefix=structuredClone(prefix);
   if(mode==='semantic_refusal')input={...input,program:{...input.program,callableMembership:[]}};
   if(mode==='stale')prefix=reidentify(m,prefix,Buffer.from(fixture.cutBytes.toString('utf8').trimEnd().split('\n').slice(0,-1).join('\n')+'\n'));
   if(mode==='foreign'){other=empty(modules[1-variant],scratch,variant+'-foreign-child');target=other.store;prefix=other.prefix;}
   if(mode==='candidate_error')basis.causationEventRefs=['event://absent'];
   const changed=Buffer.from(fixture.cutBytes);changed[0]=91;
   if(mode==='tamper')fs.writeFileSync(a.file,changed);
   if(mode==='during_append_tamper')Object.defineProperty(basis,'correlationId',{get(){fs.writeFileSync(a.file,changed);return'correlation://child-return/test';}});
   const before=counters();let nested;
   const invoke=()=>m.abg_execution_basis.admitChildExecutionBasis(target,prefix,input,basis);
   const result=outcome(()=>mode==='nested'?m.abg_event_store.admitRuntimeEventTransaction(a.store,()=>{nested=invoke();assert.equal(nested.kind,'child_execution_basis_admission');assert.deepEqual(nested.successorPrefix,a.prefix);throw Error('outer rollback discriminator');}):invoke());
   const work=difference(before),bytes=fs.readFileSync(a.file);
   if(mode==='issued'||mode==='copy'){
    assert.equal(result.returned?.kind,'child_execution_basis_admission',JSON.stringify(result));assert.equal(a.store.readAll().length,fixture.cutLength+1);assert.equal(work.reads,variant===0?3:2);assert.equal(result.returned.successorPrefix.prefixLength,bytes.length);assert.equal(result.returned.successorPrefix.prefixDigest,m.shared_digests.sha256Bytes(bytes));
    // The adjacent scope owner remains a separate acquisition: physical tamper
    // must dominate its otherwise malformed child-basis semantic refusal.
    const subject={kind:'child',executionBasis:{...result.returned.executionBasis,basisDigest:'sha256:'+'0'.repeat(64)},parentScope:input.parentTraversalScope};
    const unchanged=Buffer.from(bytes),tampered=Buffer.from(bytes);tampered[0]=91;fs.writeFileSync(a.file,tampered);
    const refused=m.abg_open_call.openTraversalScope(a.store,result.returned.successorPrefix,subject,basis);assert.equal(refused.code,'child_basis_not_admitted');assert.equal(refused.message,'scope opening requires one exact durable predecessor prefix');fs.writeFileSync(a.file,unchanged);
    const semantic=m.abg_open_call.openTraversalScope(a.store,result.returned.successorPrefix,subject,basis);assert.equal(semantic.code,'child_basis_not_admitted');assert.notEqual(semantic.message,refused.message);assert.deepEqual(fs.readFileSync(a.file),unchanged);assert.equal(a.store.readAll().length,fixture.cutLength+1);
   }else{
    assert.equal(a.store.readAll().length,fixture.cutLength);assert.deepEqual(bytes,mode==='tamper'||mode==='during_append_tamper'?changed:fixture.cutBytes);
    if(['candidate_error','during_append_tamper','nested'].includes(mode))assert.ok(result.error,JSON.stringify(result));else assert.equal(result.returned?.kind,'child_execution_basis_refusal');
   }
   cases.push({mode,result:result.returned?.kind==='child_execution_basis_admission'?{executionBasis:result.returned.executionBasis,suffix:bytes.subarray(fixture.cutBytes.length).toString('utf8')}:result,work,nestedPrefixConserved:mode==='nested'?nested.successorPrefix.coordinateDigest===a.prefix.coordinateDigest:undefined});
   if(mode==='tamper'||mode==='during_append_tamper')fs.writeFileSync(a.file,fixture.cutBytes);a.store.closeDurableLog();other?.store.closeDurableLog();
  }
  reports.push(cases);
 }
 assert.deepEqual(reports[1].map(({mode,result,nestedPrefixConserved})=>({mode,result,nestedPrefixConserved})),reports[0].map(({mode,result,nestedPrefixConserved})=>({mode,result,nestedPrefixConserved})));
 console.log(JSON.stringify({kind:'d06_child_return_conservation',reports}));
});
