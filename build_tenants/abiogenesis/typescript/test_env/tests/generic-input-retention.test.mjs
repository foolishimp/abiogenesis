import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import * as p from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {rawAdmitValue} from '../../build/code/src/validator/index.js';
import {projectTraversalRouteBody} from '../../build/code/src/abg/traversal_transition.js';
import {canonicalJson} from '../../build/code/src/shared/canonical_json.js';
import * as value from '../../build/code/src/shared/value/index.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {RuntimeEventBodyView,runtimeHistorySelectorKeys} from '../../build/code/src/abg/runtime_history.js';
const hash=p.sha256Canonical, version='5.0.0';
const E={contractRef:'contract://retention/entry',contractVersion:version,contractKind:'input',valueKind:'job_entry'};
const S={contractRef:'contract://retention/source',contractVersion:version,contractKind:'output',valueKind:'job_execution'};
const T=p.RETAINED_GRAPH_INPUT_CONTRACT;
const binding=p.graphInputRetentionBinding(E.contractRef,S.contractRef), entry={kind:E.valueKind,schemaVersion:version,job:{label:'one'}}, output={kind:S.valueKind,schemaVersion:version,result:'observed'};
// Exact compiled owners, with explicit already-admitted basis/cursor/outcome
// premises. This does not manufacture installed or runtime admission evidence.
export async function owner(relative,overrides={}){
 const file=path.resolve('build/code/src',relative),m=new vm.SourceTextModule(await fs.readFile(file,'utf8'),{identifier:file});
 await m.link(async spec=>{const actual=await import(spec.startsWith('node:')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href),values={...actual,...overrides[spec]};
  return new vm.SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();return m.namespace;
}
export function fixture(origin="entry"){
 const scope={runId:'run://component',basisId:'basis://parent',graphCallId:'graph-call://parent',frameId:'frame://parent'};
 const childScope={...scope,basisId:'basis://child',graphCallId:'graph-call://child',frameId:'frame://child'};
 const common={invocationAdmissionRef:'invocation-admission://component',invocationRef:'invocation://component',invocationDigest:hash('invocation')};
 const basis={...common,basisClass:'root',basisRef:scope.basisId,basisDigest:hash('parent'),admissionEventRef:'event://entry',rawInputValue:entry,
  graphFunctionRef:'graph-function://root',graphRef:'graph://root',graphDigest:hash('graph'),parentCCallRef:null};
 const child={...common,basisRef:childScope.basisId,basisDigest:hash('child'),graphFunctionRef:'graph-function://source',
  parentExecutionBasisRef:basis.basisRef,parentCCallRef:'call://source',rawInputDigest:hash('source-input'),closureContractRef:'closure://child',resultContractRef:S.contractRef};
 const event=(kind,eventId,payload,s=scope,causes=[])=>({kind,eventId,admissionOrdinal:0,...s,aggregateType:'c_call',aggregateId:'call://source',payload,causationEventRefs:causes});
 const rows=[event('basis_admitted',basis.admissionEventRef,{basisRef:basis.basisRef}),
  event('c_call_opened','event://open',{callClass:'workflow',cursorRef:'cursor://source',cursorDigest:hash('cursor'),childGraphFunctionRef:child.graphFunctionRef},scope,['event://cursor']),
  event('c_call_result_admitted','event://child-result',{resultRef:'result://child',resultClass:'success',resultDigest:hash('child-result'),value:output,valueDigest:hash(output)},childScope),
  event('c_call_judged','event://child-judge',{resultRef:'result://child',resultDigest:hash('child-result'),judgment:'advance',judgmentRef:'judgment://child'},childScope,['event://child-result']),
  event('terminal_reached','event://terminal',{closureRef:'closure://value',resultRef:'result://child',judgmentRef:'judgment://child'},childScope),
  event('graph_call_closed','event://closed',{closureContractRef:child.closureContractRef},childScope),
  event('child_foldback_admitted','event://fold',{parentCCallRef:'call://source',childDisposition:'closed',childExecutionBasisRef:child.basisRef,childExecutionBasisDigest:child.basisDigest,
   childGraphCallId:childScope.graphCallId,childResultRef:'result://child',childJudgmentRef:'judgment://child',childClosureRef:'closure://value',childTerminalEventRef:'event://closed',outputDigest:hash(output),foldbackRef:'foldback://source',foldbackDigest:hash('foldback')}),
  event('c_call_result_admitted','event://result',{resultRef:'result://parent',resultClass:'success',resultDigest:hash('parent-result'),value:output,valueDigest:hash(output)}),
  event('c_call_judged','event://judge',{resultRef:'result://parent',resultDigest:hash('parent-result'),judgment:'advance',judgmentRef:'judgment://parent'},scope,['event://result'])];
 const sourceOrigin=origin==='entry'
  ? event('traversal_cursor_entered','event://cursor',{cursorRef:'cursor://source',cursorDigest:hash('cursor'),inputDigest:child.rawInputDigest})
  : origin==='route' ? event('traversal_route_admitted','event://cursor',{targetCursorRef:'cursor://source',targetCursorDigest:hash('cursor')})
  : event('fh_interaction_resume_admitted','event://cursor',{successorCursorRef:'cursor://source',successorCursorDigest:hash('cursor'),successorInputDigest:child.rawInputDigest,successorCursor:{executionBasisRef:basis.basisRef}});
 Object.assign(sourceOrigin,{aggregateType:origin==='resume'?'continuation':'frame',aggregateId:scope.frameId});
 if(origin==='resume')sourceOrigin.basisId='continuation://basis';
 rows.splice(1,0,sourceOrigin);
 const body={cCallRef:'call://source',evidenceClass:'sub_traversal',inputDigest:child.rawInputDigest,outputDigest:hash(output),
  foldbackEventRef:'event://fold',foldbackRef:'foldback://source',foldbackDigest:hash('foldback'),childExecutionBasisRef:child.basisRef,childExecutionBasisDigest:child.basisDigest,
  childOutputDigest:hash(output)};
 const evidenceDigest=hash(body),evidenceRef=`evidence://abiogenesis/${evidenceDigest.slice(7)}`;
 rows.splice(rows.findIndex(e=>e.eventId==='event://result'),0,event('c_call_evidenced','event://evidence',{...body,evidenceDigest,evidenceRef},scope,['event://fold']));
 rows.find(e=>e.eventId==='event://result').payload.evidenceRefs=[evidenceRef];
 rows.forEach((e,i)=>e.admissionOrdinal=i+1);
 const input=rawAdmitValue(p.constructRetainedGraphInput(entry,output),'invocation_input',T.contractRef);
 const route=event('traversal_route_admitted','event://route',{routeKind:'advance',boundInput:input,declarationRef:basis.graphRef,declarationDigest:basis.graphDigest,
  cCallRef:'call://source',sourceCursorRef:'cursor://source',sourceCursorDigest:hash('cursor'),judgmentRef:'judgment://parent',targetCursorRef:'cursor://target',targetCursorDigest:hash('target')},scope,[basis.admissionEventRef,'event://result','event://judge','event://fold']);
 Object.assign(route,{aggregateType:'frame',aggregateId:scope.frameId,admissionOrdinal:rows.length+1,graphFunctionRef:basis.graphFunctionRef,materializationRef:basis.graphRef});rows.push(route);
 const graph={materializationRef:basis.graphRef,materializationDigest:basis.graphDigest,template:{nodes:[{nodeRef:'n1',term:{kind:'c_workflow',graphFunctionRef:child.graphFunctionRef}},{nodeRef:'n2',term:{kind:'c_of'}}],
  edges:[gtl.graphEdge({fromNodeRef:'n1',toNodeRef:'n2',inputBinding:binding})]}};
 const cursor={...scope,executionBasisRef:basis.basisRef,currentNodeRef:'n1',termPath:[]};
 const call={...scope,cCallRef:'call://source',outputContractRef:S.contractRef};
 const result={...rows.find(e=>e.eventId==='event://result').payload,admissionEventRef:'event://result'},judgment={...rows.find(e=>e.eventId==='event://judge').payload,admissionEventRef:'event://judge'};
 return {rows,route,input,basis,child,graph,cursor,call,result,judgment};
}
test('finite installed declaration equation, raw round trip and old tuples',()=>{
 assert(p.isGraphInputRetentionContractRelation(binding,[E,S,T]));
 const bound=p.constructRetainedGraphInput(entry,output);assert.equal(bound.entry,entry);assert.equal(bound.source,output);
 assert.deepEqual(JSON.parse(JSON.stringify(bound)),bound);
 for(const branch of [false,true])assert(p.isGraphInputRetentionContractRelation(p.worksiteRetentionBinding(branch)));
 assert(p.isGraphInputRetentionContractRelation(p.worksiteRevisionRetentionBinding()));
 assert(!p.isGraphInputRetentionContractRelation({...binding,targetContract:{...T,extra:true}},[E,S,T]));
 assert(!p.isGraphInputRetentionContractRelation(binding,[E,S,{...T,valueKind:'crossed'}]));
 assert(!p.isGraphInputRetentionContractRelation(binding,[E,S,S,T]));
 assert.throws(()=>p.constructRetainedGraphInput(null,output));
 // Generic T asserts records only; consumer narrowing separately refuses wrong E/S.
 assert(p.isRetainedGraphInput(p.constructRetainedGraphInput({...entry,kind:S.valueKind},output)));
 assert.notEqual(gtl.graphEdgeRef({fromNodeRef:'a',toNodeRef:'b',inputBinding:binding}),gtl.graphEdgeRef({fromNodeRef:'a',toNodeRef:'b',inputBinding:{...binding,targetContract:{...T,valueKind:'crossed'}}}));
});
test('real warm derivation and serialized cold projector agree; crossed/missing/duplicate lineage refuses',async()=>{
 const f=fixture(),lookup={projectExactExecutionBasisAtPrefix:(v,ref)=>ref===v.basis.basisRef?v.basis:ref===v.child.basisRef?v.child:null,
  projectExactInvocationAdmissionAtPrefix:()=>({inputContractRef:E.contractRef})};
 // The owners read the premise rows through the runtime-history body view.
 const runtime={runtimeEventBodiesAtPrefix:x=>new RuntimeEventBodyView(x.rows),
  checkedRecordAtPrefix:(_prefix,_reader,_context,acquire)=>acquire(),
  // The selector index is the real selector-key vocabulary over the rows.
  indexedRuntimeEvents:(x,key)=>x.rows.filter(event=>runtimeHistorySelectorKeys(event).includes(key)),
  runtimePrefixComputation:(_prefix,_owner,construct)=>construct()};
 const warm=await owner('abg/traversal_route.js',{'./event_prefix.js':runtime,'./execution_basis.js':{hasAdmittedExecutionBasisAtPrefix:()=>true,rehydrateExecutionBasisAtPrefix:lookup.projectExactExecutionBasisAtPrefix},
  './traversal_cursor.js':{hasAdmittedTraversalCursorAtPrefix:()=>true},'./c_call.js':{projectAdmittedCCallOutcomeAtPrefix:()=>({})},'../gtl/source_path.js':{deriveCSourceContinuation:()=>({relation:'graph_edge'})}});
 const cursors=await owner('abg/traversal_cursor.js',{'./event_prefix.js':runtime});
 const calls=await owner('abg/c_call.js',{'./event_prefix.js':runtime,'./traversal_cursor.js':cursors});
 const cold=await owner('abg/worksite_input_provenance.js',{'./event_prefix.js':runtime,'./invocation_execution_truth.js':lookup,'./traversal_cursor.js':cursors,'./c_call.js':calls});
 const derived=warm.deriveRetainedCCallInputAtPrefix(f,f.basis,f.graph,f.cursor,f.call,f.result,f.judgment);
 assert.deepEqual(derived.input,f.input);
 const decoded=JSON.parse(JSON.stringify(f));assert.deepEqual(cold.projectRetainedWorksiteInputAtPrefix(decoded,decoded.route)?.input,derived.input);
 for(const alter of [x=>x.route.payload.boundInput.contractRef=E.contractRef,x=>x.child.rawInputDigest=hash('wrong-input'),
  x=>delete x.child.resultContractRef,x=>x.rows.find(e=>e.eventId==='event://fold').payload.outputDigest=hash('wrong'),x=>x.rows.push({...x.rows.find(e=>e.eventId==='event://fold'),eventId:'event://competing-fold'}),
  x=>x.route.payload.boundInput.value.entry.job.label='crossed']){
  const changed=structuredClone(f);alter(changed);assert.equal(cold.projectRetainedWorksiteInputAtPrefix(changed,changed.route),null);
 }
 // Human response and resumption are reserved to 5.1: a hand-built resume
 // event is no cursor origin, and the cold projector refuses its input.
 const resumed=JSON.parse(JSON.stringify(fixture('resume')));
 assert.equal(cold.projectRetainedWorksiteInputAtPrefix(resumed,resumed.route),null,'resume');
 for(const origin of ['entry','route']){
  const raw=JSON.parse(JSON.stringify(fixture(origin)));
  assert.deepEqual(cold.projectRetainedWorksiteInputAtPrefix(raw,raw.route)?.input,raw.input,origin);
  if(origin!=='entry')assert.equal(raw.rows.filter(e=>e.kind==='traversal_cursor_entered').length,0);
  const changes=[
   x=>x.rows.splice(x.rows.findIndex(e=>e.eventId==='event://cursor'),1),
   x=>x.rows.find(e=>e.eventId==='event://cursor').graphCallId='graph-call://crossed',
   x=>x.rows.find(e=>e.eventId==='event://cursor').runId='run://crossed',
   x=>x.rows.find(e=>e.eventId==='event://cursor').basisId='basis://crossed',
   x=>x.rows.find(e=>e.eventId==='event://cursor').frameId='frame://crossed',
   x=>x.child.invocationRef='invocation://crossed',
   x=>x.rows.splice(x.rows.findIndex(e=>e.eventId==='event://route'),1),
   x=>x.route.payload.boundInput.value.source.result='altered',
   x=>x.rows.find(e=>e.eventId==='event://cursor').payload[origin==='entry'?'cursorDigest':'targetCursorDigest']=hash('crossed'),
   x=>x.rows.find(e=>e.eventId==='event://open').causationEventRefs=['event://entry'],
   x=>x.rows.find(e=>e.eventId==='event://cursor').admissionOrdinal=x.route.admissionOrdinal+1,
   x=>x.rows.find(e=>e.eventId==='event://evidence').payload.inputDigest=hash('crossed'),
   x=>x.rows.splice(x.rows.findIndex(e=>e.eventId==='event://evidence'),1),
   x=>x.rows.find(e=>e.eventId==='event://result').payload.evidenceRefs=[],
   x=>x.rows.find(e=>e.eventId==='event://closed').payload.closureContractRef='closure://crossed',
   x=>x.rows.find(e=>e.eventId==='event://fold').payload.childTerminalEventRef='event://missing',
   x=>x.rows.splice(x.rows.findIndex(e=>e.eventId==='event://child-judge'),1),
  ];
  for(const [index,change] of changes.entries()){
   const altered=structuredClone(raw);change(altered);
   assert.equal(cold.projectRetainedWorksiteInputAtPrefix(altered,altered.route),null,`${origin} negative ${index}`);
  }
 }
 const routeBody=projectTraversalRouteBody(f.route.payload);assert(!('retentionBinding' in routeBody));assert.deepEqual(routeBody.boundInput,f.input);
});
test('indexed immutable route membership avoids whole-route comparison and preserves detached-copy provenance',async t=>{
 const f=deepFreeze(fixture()),lookup={projectExactExecutionBasisAtPrefix:(v,ref)=>ref===v.basis.basisRef?v.basis:ref===v.child.basisRef?v.child:null,
  projectExactInvocationAdmissionAtPrefix:()=>({inputContractRef:E.contractRef})};
 // The owners read the premise rows through the runtime-history body view.
 const runtime={runtimeEventBodiesAtPrefix:x=>new RuntimeEventBodyView(x.rows),
  checkedRecordAtPrefix:(_prefix,_reader,_context,acquire)=>acquire(),
  // The selector index is the real selector-key vocabulary over the rows.
  indexedRuntimeEvents:(x,key)=>x.rows.filter(event=>runtimeHistorySelectorKeys(event).includes(key))};
 const cursors=await owner('abg/traversal_cursor.js',{'./event_prefix.js':runtime});
 const calls=await owner('abg/c_call.js',{'./event_prefix.js':runtime,'./traversal_cursor.js':cursors});
 // The owner compares a detached route through canonicalEquals, which writes
 // both events in full; a comparison naming the route is the counted cost.
 let wholeRouteComparisons=0;
 const isRoute=event=>event?.kind==='traversal_route_admitted'&&event.eventId===f.route.eventId;
 const cold=await owner('abg/worksite_input_provenance.js',{'./event_prefix.js':runtime,'./invocation_execution_truth.js':lookup,
  './traversal_cursor.js':cursors,'./c_call.js':calls,'../shared/value/index.js':{canonicalEquals:(left,right)=>{
   if(isRoute(left)||isRoute(right))wholeRouteComparisons++;
   return value.canonicalEquals(left,right);
  }}});
 const indexed=cold.projectRetainedWorksiteInputAtPrefix(f,f.route);
 assert.deepEqual(indexed?.input,f.input);assert.equal(wholeRouteComparisons,0);
 const copied=structuredClone(f.route);
 assert.deepEqual(cold.projectRetainedWorksiteInputAtPrefix(f,copied),indexed);
 assert.equal(wholeRouteComparisons,1,'detached equal copy retains exact whole-event comparison');
 copied.payload.boundInput.value.source.result='altered';
 assert.equal(cold.projectRetainedWorksiteInputAtPrefix(f,copied),null);
 assert.equal(wholeRouteComparisons,2,'altered detached route still compares and refuses');
 const missing={...f,rows:f.rows.filter(row=>row!==f.route)};
 assert.equal(cold.projectRetainedWorksiteInputAtPrefix(missing,f.route),null);
 assert.equal(wholeRouteComparisons,2,'identity outside the selected prefix supplies no membership');
 const crossed=structuredClone(f);crossed.child.invocationRef='invocation://crossed';
 assert.equal(cold.projectRetainedWorksiteInputAtPrefix(crossed,crossed.route),null,'identity does not waive source lineage');
 assert.equal(wholeRouteComparisons,2);
 t.diagnostic(JSON.stringify({sameObjectWholeRouteComparisons:0,equalDetachedWholeRouteComparisons:1,
  routeBytes:Buffer.byteLength(canonicalJson(f.route)),scope:'Existing component admission premises; no history acquisition or OOM-cure claim.'}));
});

test('one material record conserves E/S references and never retains an assessment result again',t=>{
 const e={...entry,body:'e'.repeat(10*1024*1024)},s={...output,body:'s'.repeat(11*1024*1024)};
 const bound=p.constructRetainedGraphInput(e,s);assert.equal(bound.entry,e);assert.equal(bound.source,s);assert.deepEqual(Object.keys(bound).sort(),['entry','kind','schemaVersion','source']);
 const bytes=Buffer.byteLength(JSON.stringify(bound));assert(bytes>20*1024*1024&&bytes<22*1024*1024);
 t.diagnostic(JSON.stringify({bytes,retentionConstructions:1,entryCopies:0,sourceCopies:0,secondRetention:0,peakRss:process.resourceUsage().maxRSS,limits:'Component construction; no native admission or historical-resource replay.'}));
});
