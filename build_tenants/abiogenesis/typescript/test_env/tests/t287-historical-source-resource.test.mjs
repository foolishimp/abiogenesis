// Changed sources run in memory over the frozen component build. The retained
// D2 fixture is a different, closed historical test resource, never the original
// Data Mapper journal. No actor, native Run or package is launched here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import * as eventOwner from '../../build/code/src/abg/event_store.js';
import * as prefixOwner from '../../build/code/src/abg/event_prefix.js';
import * as declarations from '../../build/code/src/product/declaration_closure.js';
import {projectExactExecutionBasisAtPrefix} from '../../build/code/src/abg/invocation_execution_truth.js';
import {GraphCallProjectionPort} from '../../build/code/src/abg/project_read_ports.js';
import {sha256Canonical as hash} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {evidenceInput} from '../support/evidence-root.mjs';
const root=resolve(import.meta.dirname,'../..');
const evidenceRoot=process.env.ABI5_HISTORICAL_SOURCE_EVIDENCE;
// The retained D2 store and its program-ready record are historical evidence
// under the evidence root (T-290 C-5), named by path, digest and bytes; without
// the root the cases over them skip with the reason. The store was appended
// after this fixture's capture: the fixture is its first 846 lines, 13,540,472
// bytes, sha256 4f561cea….
const D2='comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01/';
const logInput=evidenceInput({path:D2+'events-01/runtime.events.jsonl',sha256:'f841bba98385cb572a944edf1793634fcf10baf59a74331110042bcb200f8e82',bytes:19058361});
const readyInput=evidenceInput({path:D2+'attempt-01/program-ready-16.json',sha256:'2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02',bytes:12781893});
const skip=[logInput,readyInput].find(input=>input.kind==='absent')?.reason??false;
const byteHash=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
async function sourceOwner(relative,names=[],overrides={}){
 const source=join(root,'code/src',relative+'.ts'),file=join(root,'build/code/src',relative+'.js');
 const compiled=ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const module=new SourceTextModule(compiled+(names.length?'\nexport { '+names.join(',')+' };':''),{identifier:file});
 const links=new Map();
 await module.link(async specifier=>{
  if(links.has(specifier))return links.get(specifier);
  const url=specifier.startsWith('.')?pathToFileURL(resolve(dirname(file),specifier)).href:specifier;
  const actual={...await import(url),...(overrides[specifier]??{})};
  const linked=new SyntheticModule(Object.keys(actual),function(){for(const[k,v]of Object.entries(actual))this.setExport(k,v);});links.set(specifier,linked);return linked;
 });
 await module.evaluate();return module.namespace;
}

async function fixture(t){
 const bytes=Buffer.from(logInput.bytes.subarray(0,13540472));
 const readyBytes=readyInput.bytes;
 assert.equal(byteHash(bytes),'sha256:4f561ceacf40fd13db82132d93890cb67750453dfa81a75c0401f04bd9345649');
 assert.equal(byteHash(readyBytes),'sha256:2147862a16f8526d546ca918563b8d8b8094e684d8f629784b256e4803d3fc02');
 const ready=JSON.parse(readyBytes),rows=bytes.toString().trimEnd().split('\n').map(JSON.parse);
 const scratch=fs.mkdtempSync(join(tmpdir(),'abi5-historical-source-')),eventLogPath=join(scratch,'fixture.events.jsonl');
 t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));fs.writeFileSync(eventLogPath,bytes,{flag:'wx'});
 const stat=fs.statSync(eventLogPath),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath,device:stat.dev,inode:stat.ino,
  eventLogDigest:byteHash(bytes),durableByteLength:bytes.length,eventContractDigest:eventOwner.LEGACY_ROOT_EVENT_CONTRACT_DIGEST};
 const opened=eventOwner.reopenEventStore({...body,authorityDigest:hash(body)});assert.ok(opened.store,JSON.stringify(opened));
 t.after(()=>opened.store.closeDurableLog());const prefix=opened.prefix,child=rows.find(e=>e.admissionOrdinal===67);
 const proof=deepFreeze({kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:ready.call.resources.catalog,catalogView:ready.call.resources.catalogView});
 const terminal=GraphCallProjectionPort.graph_call_result({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'graph_call_result',prefix,targetRef:child.graphCallId,declarationProof:proof}).value.terminalResult;
 const nominal=prefixOwner.selectValidatedRuntimeEventPrefix(eventOwner.readRuntimeEventsAtDurablePrefix(prefix));
 const leaf=projectExactExecutionBasisAtPrefix(nominal,terminal.producer.executionBasis.ref);
 const ancestor=projectExactExecutionBasisAtPrefix(nominal,leaf.parentExecutionBasisRef);assert.ok(ancestor);
 const publication=proof.catalog.boundPublications.find(p=>p.graphFunctions.some(g=>g.name===ancestor.graphFunctionRef));
 const graph=publication.graphFunctions.find(g=>g.name===ancestor.graphFunctionRef);assert.equal(graph.inputs.length,1);
 const {value,projectionBasis,...selection}=terminal;
 const resource=deepFreeze({kind:'abg_historical_graph_call_source_resource',schemaVersion:'5.0.0',terminal:selection,
  input:{graphFunctionRef:ancestor.graphFunctionRef,contractRef:graph.inputs[0]},declarationProof:proof});
 return {bytes,readyBytes,rows,opened,prefix,resource,ancestor,terminal,publication,eventLogPath};
}

test('actual R10 ancestry, declaration and leaf proof owners return borrowed historical facts; same live resource resolves once and cold copies reconstruct',{skip},async t=>{
 const f=await fixture(t),counts={catalog:0};
 const r10=await sourceOwner('abg/project_read_ports',[],{'../product/declaration_closure.js':{
  reconstructHistoricalDeclarationCatalog:(...args)=>{counts.catalog++;return declarations.reconstructHistoricalDeclarationCatalog(...args);},
 }});
 const leaf=await sourceOwner('implementation/leaf_invocation_port',['nativeJudgmentProofOperations'],{'../abg/project_read_ports.js':r10});
 const read=(prefix,resource=f.resource)=>leaf.nativeJudgmentProofOperations('predicate://generic/consumer',{},null,prefix,resource).historicalGraphCallSource();
 const result=read(f.prefix);assert.ok(result);assert.equal(counts.catalog,1);
 assert.deepEqual(result.terminalResult,f.terminal);assert.deepEqual(result.publication,f.publication);
 assert.strictEqual(result.input.value,f.ancestor.rawInputValue,'exact existing basis body is borrowed');
 assert.deepEqual(result.input,{...f.resource.input,value:f.ancestor.rawInputValue});
 assert.strictEqual(read(f.prefix),result);assert.equal(counts.catalog,1,'same resource in live scope performs no second declaration or source walk');
 assert.equal(read(undefined),null,'HoG prefix is mandatory');
 assert.equal(leaf.nativeJudgmentProofOperations('predicate://generic/consumer',{},null,f.prefix).historicalGraphCallSource,undefined);
 const cold=read(structuredClone(f.prefix));assert.deepEqual(cold,result);assert.notStrictEqual(cold,result);assert.equal(counts.catalog,2);
 const copiedResource=deepFreeze(structuredClone(f.resource));assert.deepEqual(read(f.prefix,copiedResource),result);assert.equal(counts.catalog,3,'equal caller bytes do not impersonate the owned resource');
 for(const change of [r=>r.terminal.result.digest=hash('foreign result'),r=>r.terminal.producer.judgmentAdmissionEventRef+='-foreign',
  r=>r.input.graphFunctionRef='graph-function://foreign',r=>r.input.contractRef='contract://foreign',
  r=>r.declarationProof.catalogView.allowlist=[],r=>delete r.declarationProof]){
  const changed=structuredClone(f.resource);change(changed);assert.equal(read(f.prefix,deepFreeze(changed)),null);
 }
 assert.strictEqual(read(f.prefix),result,'refused candidates do not poison the live owned result');
 const lines=f.bytes.toString().trimEnd().split('\n'),early=Buffer.from(lines.slice(0,66).join('\n')+'\n');
 const {coordinateDigest:_,...body}=f.prefix,earlyBody={...body,prefixLength:early.length,prefixDigest:byteHash(early)};
 const beforeClose=eventOwner.reidentifyHistoricalDurablePrefixCoordinate(f.prefix,{...earlyBody,coordinateDigest:hash(earlyBody)});
 assert.equal(read(beforeClose),null,'a historical cut before closure cannot borrow later facts');
 const ordinary=r10.GraphCallProjectionPort.graph_call_result({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey:'graph_call_result',
  prefix:f.prefix,targetRef:f.resource.terminal.producer.graphCallRef,declarationProof:f.resource.declarationProof});
 assert.deepEqual(ordinary.value.terminalResult,f.terminal,'unchanged R10 terminal route agrees with frozen predecessor');
 const distinctProof={...f.resource.declarationProof,catalog:{...f.resource.declarationProof.catalog,basisDigest:hash('additional untrusted basis')},
  catalogView:{...f.resource.declarationProof.catalogView,catalogBasisDigest:hash('additional untrusted basis')}};
 const extended=deepFreeze({...f.resource,declarationDependencies:[distinctProof]});
 const contracts=await import('../../build/code/src/abg/terminal_result_contracts.js'),v=await import('valibot');
 assert.equal(v.safeParse(contracts.ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA,extended).success,true);
 assert.equal(v.safeParse(contracts.ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA,{...f.resource,declarationDependencies:[f.resource.declarationProof]}).success,false);
 assert.deepEqual(read(f.prefix,extended),result,'optional constructor dependencies do not replace the primary historical source proof');
 assert.equal(read(f.prefix,deepFreeze({...f.resource,declarationDependencies:[f.resource.declarationProof]})),null,'duplicate primary/dependency basis refuses');
 assert.equal(read(f.prefix,deepFreeze({...f.resource,declarationDependencies:[distinctProof,distinctProof]})),null,'duplicate additional dependency refuses');
 const countBeforeClose=counts.catalog;f.opened.store.closeDurableLog();assert.deepEqual(read(f.prefix),result);assert.equal(counts.catalog,countBeforeClose+1);
 const fd=fs.openSync(f.eventLogPath,'r+');try{fs.writeSync(fd,Buffer.from('!'),0,1,0);}finally{fs.closeSync(fd);}
 assert.equal(read(f.prefix),null,'closed owner must authenticate physical history, not preserve live authority');
 const observations={kind:'historical_source_resource_component',catalogResolutions:counts.catalog,retainedFixtureBytes:f.bytes.length,
  historicalProofBytes:Buffer.byteLength(JSON.stringify(f.resource.declarationProof)),resourceSelectionBytes:Buffer.byteLength(JSON.stringify({...f.resource,declarationProof:undefined})),
  borrowedAncestor:true,liveIdentityReuse:true,coldReconstruction:true,originalHistoryRead:false,installedProof:false};
 if(evidenceRoot)fs.writeFileSync(join(evidenceRoot,'core-owner-observations.json'),JSON.stringify(observations,null,2)+'\n');
 t.diagnostic(JSON.stringify(observations));
});

test('Run resource schema admits the one declaration dependency and refuses extra authority before owner effects',async()=>{
 const contracts=await sourceOwner('abg/terminal_result_contracts');
 const owner=await sourceOwner('owner_bindings/run_invocation',['RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA'],{'../abg/terminal_result_contracts.js':contracts});
 const schema=owner.RUN_INVOCATION_RESOURCE_ASSERTION_SCHEMA.entries.historicalSource;
 const v=await import('valibot');
 // The complete outer Run assertion and capability admission remain existing
 // owners. This bounded check exercises its exact newly composed resource slot.
 assert.equal(schema.wrapped,contracts.ABG_HISTORICAL_GRAPH_CALL_SOURCE_RESOURCE_SCHEMA);
 assert.equal(v.safeParse(schema,{kind:'abg_historical_graph_call_source_resource',schemaVersion:'5.0.0',trusted:true}).success,false);
});

// The retention lives in the open owner's derivation generation
// (`projectHistoricalGraphCallSourceAtDurablePrefix`): a later prefix of the same
// generation lends the retained source, and the Event Store's own rollback
// replaces the generation, so the next read reconstructs. The driver is the owner
// operation `admitRuntimeEventTransaction`; no store internal is reached.
async function retentionOwner(t){
 const f=await fixture(t),counts={catalog:0};
 const r10=await sourceOwner('abg/project_read_ports',[],{'../product/declaration_closure.js':{
  reconstructHistoricalDeclarationCatalog:(...args)=>{counts.catalog++;return declarations.reconstructHistoricalDeclarationCatalog(...args);},
 }});
 const leaf=await sourceOwner('implementation/leaf_invocation_port',['nativeJudgmentProofOperations'],{'../abg/project_read_ports.js':r10});
 const read=prefix=>leaf.nativeJudgmentProofOperations('predicate://generic/consumer',{},null,prefix,f.resource).historicalGraphCallSource();
 const eventTime=f.rows.at(-1).eventTime,candidate=key=>{const invocationRef='invocation://t287/historical-retention/'+key,correlationId='correlation://t287/historical-retention/'+key;
  return {kind:'public_operation_admitted',eventTime,aggregateType:'workspace',aggregateId:invocationRef,parentAggregateId:null,causationEventRefs:[],correlationId,
   workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://t287/historical-retention',
   payload:{invocationDigest:hash({invocationRef,correlationId}),invocationRef,operationId:'abg.operation.project.read',variant:'status'}};};
 return {f,counts,read,candidate};
}

test('a later prefix of the same derivation generation lends the same retained historical source; the count is unchanged',{skip},async t=>{
 const {f,counts,read,candidate}=await retentionOwner(t);
 const result=read(f.prefix);assert.ok(result);assert.equal(counts.catalog,1);
 const appended=eventOwner.admitRuntimeEvent(f.opened.store,candidate('later'));assert.equal(appended.admissionOrdinal,f.rows.length+1);
 const later=eventOwner.selectHeldEventStoreDurablePrefix(f.opened.store);
 assert.ok(later.prefixLength>f.prefix.prefixLength);assert.notEqual(later.prefixDigest,f.prefix.prefixDigest);
 assert.strictEqual(read(later),result,'same generation lends the retained object at its later prefix');assert.equal(counts.catalog,1);
 assert.strictEqual(read(f.prefix),result);assert.equal(counts.catalog,1);
});

test('an append rollback replaces the derivation generation and drops the retained historical source; the next read reconstructs once',{skip},async t=>{
 const {f,counts,read,candidate}=await retentionOwner(t);
 const result=read(f.prefix);assert.ok(result);assert.equal(counts.catalog,1);
 assert.strictEqual(read(f.prefix),result);assert.equal(counts.catalog,1);
 let tentative;
 assert.throws(()=>eventOwner.admitRuntimeEventTransaction(f.opened.store,()=>{
  tentative=eventOwner.admitRuntimeEvent(f.opened.store,candidate('rolled-back'));throw Error('injected append rollback');
 }),/injected append rollback/);
 assert.equal(tentative.admissionOrdinal,f.rows.length+1);assert.deepEqual(eventOwner.selectHeldEventStoreDurablePrefix(f.opened.store),f.prefix);
 const rebuilt=read(f.prefix);assert.deepEqual(rebuilt,result);assert.notStrictEqual(rebuilt,result,'the rolled-back generation lends nothing');
 assert.equal(counts.catalog,2);
 assert.strictEqual(read(f.prefix),rebuilt,'the replacement generation retains its own reconstruction');assert.equal(counts.catalog,2);
});
