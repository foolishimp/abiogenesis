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
const root=resolve(import.meta.dirname,'../..');
const evidenceRoot=process.env.ABI5_HISTORICAL_SOURCE_EVIDENCE;
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
 const fixtureRoot=resolve(root,'../../../.ai-workspace/comments/codex/20260911_D2_BOUNDED_REPAIR/installed-continuation-09/installed-frame-01');
 const fd=fs.openSync(join(fixtureRoot,'events-01/runtime.events.jsonl'),'r'),bytes=Buffer.alloc(13540472);
 try{assert.equal(fs.readSync(fd,bytes,0,bytes.length,0),bytes.length);}finally{fs.closeSync(fd);}
 const readyBytes=fs.readFileSync(join(fixtureRoot,'attempt-01/program-ready-16.json'));
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

test('actual R10 ancestry, declaration and leaf proof owners return borrowed historical facts; same live resource resolves once and cold copies reconstruct',async t=>{
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
