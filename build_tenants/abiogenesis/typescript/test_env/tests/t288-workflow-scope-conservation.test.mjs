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
const load=async root=>Object.fromEntries(await Promise.all(['abg/event_store','abg/definition_event_resource','abg/execution_basis','abg/event_prefix','abg/open_call','product/index','validator/index','gtl/index','abg/traversal_route','abg/runtime_derivation','abg/c_call','shared/digests','shared/canonical_json','shared/immutable'].map(async name=>[name.replaceAll('/','_'),await import(pathToFileURL(path.join(root,'build/code/src',name+'.js')))])));
const modules=[await load(prior),await load(root)];
const outcome=f=>{try{return{returned:f()};}catch(e){return{error:e.name,message:e.message,causes:e.errors?.map(x=>({name:x.name,message:x.message}))};}};
const counters=()=>({reads:globalThis.p0Work.descriptorReads??0,bytes:globalThis.p0Work.descriptorBytes??0});
const difference=before=>{const now=counters();return{reads:now.reads-before.reads,bytes:now.bytes-before.bytes};};
const seed=(()=>{const{eventId,admissionOrdinal,payloadDigest,eventContractDigest,...value}=history.find(x=>x.kind==='public_operation_admitted');return value;})();
function empty(m,scratch,label){const file=path.join(scratch,label+'.jsonl');const a=m.abg_event_store.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:file});assert.ok(a.store);return{...a,file};}
function row(m,a,suffix='first'){return m.abg_event_store.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(a.store,a.prefix,()=>m.abg_event_store.admitRuntimeEvent(a.store,{...seed,correlationId:'correlation://close-test/'+suffix})).successorPrefix;}
function reidentify(m,prefix,bytes){const{coordinateDigest,...body}=prefix;body.prefixDigest=m.shared_digests.sha256Bytes(bytes);body.prefixLength=bytes.length;return{...body,coordinateDigest:m.shared_digests.sha256Canonical(body)};}

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

// Fixture construction is shared in shape with the retained D06 comparison.
// This VM varies only the private lookup-purity premise; the installed witness
// separately exercises actual native-port registration with unmodified code.
import { SourceTextModule, SyntheticModule } from 'node:vm';
const pureLookups=Object.freeze({graphFunctionByRef:()=>null,closureContractByRef:()=>null});
async function executionWithPurePremise(){
 const file=path.join(root,'build/code/src/abg/execution_basis.js');
 const module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
 await module.link(async specifier=>{
  const actual=await import(specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(file),specifier)).href:specifier);
  const linked=new SyntheticModule(Object.keys(actual),function(){for(const[key,value]of Object.entries(actual))this.setExport(key,
   specifier==='../implementation/leaf_invocation_port.js'&&key==='hasOwnedDeclarationLookups'
    ?(graph,closure)=>graph===pureLookups.graphFunctionByRef&&closure===pureLookups.closureContractByRef:value);});
  return linked;
 });
 await module.evaluate();return module.namespace;
}
const preparedModule=await executionWithPurePremise();

test('workflow first read and child admission conserve results, raw callbacks and physical refusals',context=>{
 context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'t288-workflow-return-'));context.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
 const reports=[];
 for(const[variant,base]of modules.entries()){
  const m=variant===0?base:{...base,abg_execution_basis:preparedModule};const fixture=prepareChild(m),cases=[];
  for(const mode of ['issued','copy','semantic_refusal','stale','tamper_before','raw_callback_tamper','mutable_lookup_tamper','accessor_lookup_tamper','proxy_lookup_tamper','candidate_error','during_append_tamper']){
   const a=reopenCut(m,scratch,variant+'-'+mode,fixture.cutBytes);let prefix=a.prefix,input=fixture.input;
   const basis={eventTime:'2026-09-20T00:00:00.000Z',correlationId:'correlation://workflow-return/test',causationEventRefs:[]};
   const cursor={runId:'absent-intent',graphCallId:'absent-intent',frameId:'absent-intent',cursorRef:'absent-intent'};
   const changed=Buffer.from(fixture.cutBytes);changed[0]=91;
   const rawLookups={graphFunctionByRef(){fs.writeFileSync(a.file,changed);return null;},closureContractByRef:()=>null};
   let proxyTraps=0;
   const proxyLookups=new Proxy(pureLookups,{
    get(target,key,receiver){proxyTraps++;if(key==='graphFunctionByRef')fs.writeFileSync(a.file,changed);return Reflect.get(target,key,receiver);},
    getOwnPropertyDescriptor(target,key){proxyTraps++;return Reflect.getOwnPropertyDescriptor(target,key);},
    isExtensible(target){proxyTraps++;return Reflect.isExtensible(target);},
    ownKeys(target){proxyTraps++;return Reflect.ownKeys(target);},
   });
   const lookupMutation=['raw_callback_tamper','mutable_lookup_tamper','accessor_lookup_tamper'].includes(mode);
   const selectedLookups=mode==='proxy_lookup_tamper'?proxyLookups:mode==='mutable_lookup_tamper'?{...pureLookups}:mode==='accessor_lookup_tamper'?Object.freeze({get graphFunctionByRef(){return pureLookups.graphFunctionByRef;},closureContractByRef:pureLookups.closureContractByRef}):mode==='raw_callback_tamper'?rawLookups:pureLookups;
   if(mode==='copy')prefix=structuredClone(prefix);
   if(mode==='semantic_refusal')input={...input,program:{...input.program,callableMembership:[]}};
   if(mode==='stale')prefix=reidentify(m,prefix,Buffer.from(fixture.cutBytes.toString('utf8').trimEnd().split('\n').slice(0,-1).join('\n')+'\n'));
   if(mode==='tamper_before')fs.writeFileSync(a.file,changed);
   if(mode==='candidate_error')basis.causationEventRefs=['event://absent'];
   if(mode==='during_append_tamper')Object.defineProperty(basis,'correlationId',{get(){fs.writeFileSync(a.file,changed);return'correlation://workflow-return/test';}});
   const before=counters();const result=outcome(()=>{
    if(variant===0){assert.equal(m.abg_traversal_route.rehydrateConstructionIntentForCursorAtDurablePrefix(prefix,cursor),null);
     if(mode==='proxy_lookup_tamper')selectedLookups.graphFunctionByRef();
     if(lookupMutation)rawLookups.graphFunctionByRef();return m.abg_execution_basis.admitChildExecutionBasis(a.store,prefix,input,basis);}
    const preparation=m.abg_execution_basis.prepareWorkflowChildExecutionBasis(a.store,prefix,cursor,selectedLookups);
    assert.equal(proxyTraps,0,'eligibility does not execute Proxy traps');
    if(mode==='proxy_lookup_tamper')selectedLookups.graphFunctionByRef();
    assert.equal(preparation.intent,null);if(lookupMutation)rawLookups.graphFunctionByRef();return preparation.admit(input,basis);
   });const work=difference(before),bytes=fs.readFileSync(a.file);
   if(mode==='issued'||mode==='copy'){
    assert.equal(result.returned?.kind,'child_execution_basis_admission',JSON.stringify(result));
    assert.equal(a.store.readAll().length,fixture.cutLength+1);
    assert.equal(work.reads,mode==='issued'&&variant===1?2:3);
   }else assert.equal(a.store.readAll().length,fixture.cutLength,'refusal publishes no child');
   if(mode==='proxy_lookup_tamper'){
    assert.equal(proxyTraps,1,'only the actual callback property access executes the trap');
    assert.equal(result.returned?.code,'parent_basis_mismatch');
   }
   cases.push({mode,result:result.returned?.kind==='child_execution_basis_admission'
    ?{executionBasis:result.returned.executionBasis,suffix:bytes.subarray(fixture.cutBytes.length).toString('utf8')}:result,work});
   if(['tamper_before','raw_callback_tamper','mutable_lookup_tamper','accessor_lookup_tamper','proxy_lookup_tamper','during_append_tamper'].includes(mode))fs.writeFileSync(a.file,fixture.cutBytes);
   a.store.closeDurableLog();
  }reports.push(cases);
 }
 assert.deepEqual(reports[1].map(({mode,result})=>({mode,result})),reports[0].map(({mode,result})=>({mode,result})));
 console.log(JSON.stringify({kind:'workflow_child_read_conservation',premise:'pure declaration lookup owner isolated; installed proof validates actual registration',reports}));
});

test('unscoped receipt reuses its exact scope while forks, cuts and invalidation retain checks',()=>{
 const reports=[];
 for(const[variant,m]of modules.entries()){
  const source=new m.abg_runtime_derivation.RuntimeDerivationSource();const rows=m.shared_immutable.deepFreeze(structuredClone(history));
  const all=source.scope.bind(source);let calls=0;source.scope=(key,events)=>{if(key==='all')calls++;return all(key,events);};
  m.abg_event_prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows));
  calls=0;const sibling=source.snapshot([...rows]);const selected=m.abg_event_prefix.selectValidatedRuntimeEventPrefix(sibling);const selectedCalls=calls;
  assert.deepEqual(selected.events,rows);assert.equal(selectedCalls,variant===0?2:1);
  const earlier=m.abg_event_prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows.slice(0,87)));assert.deepEqual(earlier.events,rows.slice(0,87));
  const clone=m.shared_immutable.deepFreeze(structuredClone(rows));assert.deepEqual(m.abg_event_prefix.selectValidatedRuntimeEventPrefix(source.snapshot(clone)).events,clone);
  source.invalidate();assert.deepEqual(m.abg_event_prefix.selectValidatedRuntimeEventPrefix(source.snapshot(rows)).events,rows);
  reports.push({variant,selectedCalls,earlier:earlier.events.length,invalidation:true,copiedRows:true});
 }console.log(JSON.stringify({kind:'workflow_scope_conservation',reports}));
});


test('foldback preparation preserves first-read and held-owner refusal order',context=>{
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'t288-foldback-return-'));context.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));const reports=[];
 for(const[variant,m]of modules.entries()){
  const cases=[];
  for(const mode of ['issued','copy','stale','tamper_before','tamper_after','foreign']){
   const a=empty(m,scratch,variant+'-'+mode),prefix=row(m,a),bytes=fs.readFileSync(a.file);let selected=mode==='copy'?structuredClone(prefix):mode==='stale'?a.prefix:prefix,other;
   const changed=Buffer.from(bytes);changed[0]=91;
   if(mode==='foreign')other=empty(modules[1-variant],scratch,variant+'-foreign-foldback');
   if(mode==='tamper_before')fs.writeFileSync(a.file,changed);
   const input={relationClass:'workflow',store:other?.store??a.store,predecessorPrefix:selected,graph:{},graphFunction:{},cursor:{runId:'absent'},parentCCall:{retryPath:[]},childExecutionBasis:{},childScope:{},child:{childResultRef:'absent',childJudgmentRef:'absent',childClosureRef:null},basis:{eventTime:'2026-09-20T00:00:00Z',correlationId:'test',causationEventRefs:[]}};
   const result=outcome(()=>{
    if(variant===0){assert.equal(m.abg_traversal_route.rehydrateConstructionIntentForCursorAtDurablePrefix(selected,input.cursor),null);
     if(mode==='tamper_after')fs.writeFileSync(a.file,changed);
     return m.abg_c_call.admitWorkflowChildFoldback(input.store,selected,input.graph,input.graphFunction,input.cursor,input.parentCCall,input.childExecutionBasis,input.childScope,input.child,input.basis);}
    const preparation=m.abg_c_call.prepareWorkflowChildFoldback(input);assert.equal(preparation.intent,null);
    if(mode==='tamper_after')fs.writeFileSync(a.file,changed);return preparation.admit();
   });assert.equal(a.store.readAll().length,1);cases.push({mode,result});
   fs.writeFileSync(a.file,bytes);a.store.closeDurableLog();other?.store.closeDurableLog();
  }reports.push(cases);
 }
 assert.deepEqual(reports[1],reports[0]);console.log(JSON.stringify({kind:'workflow_foldback_refusal_conservation',reports}));
});

test('native lookup reuse rejects mutable, accessor, callable and Proxy captured data',async()=>{
 const file=path.join(root,'build/code/src/implementation/leaf_invocation_port.js');
 const module=new SourceTextModule(fs.readFileSync(file,'utf8')+'\nexport {isFixedDeclarationData};',{identifier:file});
 await module.link(async specifier=>{const actual=await import(specifier.startsWith('.')?pathToFileURL(path.resolve(path.dirname(file),specifier)).href:specifier);
  return new SyntheticModule(Object.keys(actual),function(){for(const[key,value]of Object.entries(actual))this.setExport(key,value);});});
 await module.evaluate();const check=module.namespace.isFixedDeclarationData;let getterCalls=0;
 assert.equal(check(Object.freeze({ordinary:Object.freeze([1,'a'])})),true);
 assert.equal(check(Object.freeze({nested:{mutable:true}})),false);
 assert.equal(check(Object.freeze({get changing(){getterCalls++;return'changed';}})),false);assert.equal(getterCalls,0);
 assert.equal(check(Object.freeze({invoke:()=>{throw Error('must not invoke');}})),false);
 assert.equal(check(Object.freeze(Object.create({inherited:true}))),false);
 let proxyTraps=0;const rejectTrap=()=>{proxyTraps++;throw Error('purity check must not invoke Proxy traps');};
 const proxy=new Proxy(Object.freeze({ordinary:1}),{get:rejectTrap,getOwnPropertyDescriptor:rejectTrap,getPrototypeOf:rejectTrap,isExtensible:rejectTrap,ownKeys:rejectTrap});
 assert.equal(check(proxy),false);
 assert.equal(check(Object.freeze({nested:proxy})),false);
 assert.equal(check(new Proxy(Object.freeze([1]),{get:rejectTrap,getOwnPropertyDescriptor:rejectTrap,getPrototypeOf:rejectTrap,isExtensible:rejectTrap,ownKeys:rejectTrap})),false);
 const revoked=Proxy.revocable(Object.freeze({}),{});revoked.revoke();assert.equal(check(revoked.proxy),false);
 assert.equal(proxyTraps,0);
 assert.equal(module.namespace.hasOwnedDeclarationLookups(()=>null,()=>null),false);
 console.log(JSON.stringify({kind:'workflow_lookup_purity_controls',gettersInvoked:getterCalls,proxyTrapsInvoked:proxyTraps,rawFunctionsAccepted:false,proxiesAccepted:false}));
});
