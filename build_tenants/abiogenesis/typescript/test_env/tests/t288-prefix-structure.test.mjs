import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import * as p from '../../build/code/src/abg/event_prefix.js';
import {RuntimeDerivationSource} from '../../build/code/src/abg/runtime_derivation.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
const old=await import(pathToFileURL(join(process.env.ABI5_PREFIX_PREDECESSOR_ROOT,'build/code/src/abg/event_prefix.js')));
const frozen=async()=>deepFreeze((await readFile(process.env.ABI5_OWNER_HISTORY,'utf8')).trimEnd().split('\n').map(JSON.parse));
const result=f=>{try{return {value:f()};}catch(e){return {error:e.constructor.name,message:e.message};}};
const project=(module,rows,scope)=>{const value=module.selectValidatedRuntimeEventPrefix(rows,scope);return {events:value.events,profile:module.runtimeEventProfileScheduleFromValidatedPrefix(value),hash:module.runtimeEventPrefixDigest(value)};};
const work=()=>({...globalThis.p0Work});
const diff=(a,k)=>(globalThis.p0Work?.[k]??0)-(a[k]??0);

test('prefix structure conserves native full/scoped/empty, earlier/reverse and cold values with suffix-only owned checks',async()=>{
 const events=await frozen(),owner=new RuntimeDerivationSource(),runId=events.find(e=>e.runId).runId;
 const scopes=[undefined,{runId},{invocationRef:events[0].payload.invocationRef},{runId:'absent'}];
 for(const cut of [0,1,87,104,434,events.length,104,87,events.length])for(const scope of scopes){
  const rows=events.slice(0,cut),actual=project(p,owner.snapshot(rows),scope);
  assert.deepEqual(actual,project(old,deepFreeze(structuredClone(rows)),scope));
 }
 const before=work();for(let repeat=0;repeat<3;repeat++)for(const scope of scopes)project(p,owner.snapshot(events),scope);
 if(globalThis.p0Work)for(const key of ['prefixOrdinalRows','profileRows','prefixIndexRows','prefixCausalRows','scopeClosureRows'])assert.equal(diff(before,key),0,key);
 const foreign=new RuntimeDerivationSource();assert.deepEqual(project(p,foreign.snapshot(events)),project(old,events));
 owner.invalidate();assert.deepEqual(project(p,owner.snapshot(events)),project(old,events));
 console.log(JSON.stringify({kind:'d12_native_structure_conservation',cuts:9,scopes:4,repeatedStructuralRows:0,foreignAndInvalidation:true}));
});

test('structure progress preserves cold refusals and non-monotone scope compatibility',async()=>{
 const sample=(await frozen())[0];
 const row=(n,extra={})=>deepFreeze(JSON.parse(JSON.stringify({...sample,eventId:'event://structure/'+n,admissionOrdinal:n,causationEventRefs:[],runId:undefined,payload:{},...extra})));
 const rows=[row(1),row(2,{runId:'r'}),row(3),row(4,{runId:'r',causationEventRefs:['event://structure/3']})];
 const owner=new RuntimeDerivationSource();project(p,owner.snapshot(rows),{runId:'r'});
 assert.deepEqual(project(p,owner.snapshot(rows.slice(0,3)),{runId:'r'}).events,[rows[1]],'later workspace cause must not leak backward');
 const cases=[rows,[row(1),row(3)], [row(1,{causationEventRefs:['missing']})],
  [row(1,{runId:'a'}),row(2,{runId:'b',causationEventRefs:['event://structure/1']})],
  [row(1,{causationEventRefs:['event://structure/2']}),row(2)],
  [row(1),row(2,{eventId:'event://structure/1'})],
  [row(1),row(2,{eventContractDigest:undefined})],
  [row(1,{eventContractDigest:undefined}),row(2)]];
 for(const events of cases)for(const scope of [undefined,{runId:'r'},{runId:'b'},{runId:'absent'}]){
  const source=new RuntimeDerivationSource();const expected=result(()=>project(old,deepFreeze(events),scope));
  assert.deepEqual(result(()=>project(p,source.snapshot(events),scope)),expected);
  assert.deepEqual(result(()=>project(p,source.snapshot(events),scope)),expected,'repeated refusal must remain');
 }
 const source=new RuntimeDerivationSource(),first=row(1,{runId:'a'}),bad=row(2,{runId:'b',causationEventRefs:[first.eventId]});
 project(p,source.snapshot([first]));assert.throws(()=>project(p,source.snapshot([first,bad])),/cross a run/);
 assert.deepEqual(project(p,source.snapshot([first])),project(old,deepFreeze([first])));
 assert.deepEqual(project(p,source.snapshot([first,bad]),{runId:'a'}),project(old,deepFreeze([first,bad]),{runId:'a'}));
 console.log(JSON.stringify({kind:'d12_structure_negatives',cases:cases.length,scopes:4,coldRefusalEquality:true,reverseDiscovery:true,refusedSuffixConserved:true}));
});

test('profile suffix progress preserves the exact witnessed boundary and historical profile cuts',async()=>{
 const store=await import('../../build/code/src/abg/event_store.js');
 const profile=await import('../../build/code/src/abg/event_contract_profiles.js');
 const {sha256Canonical}=await import('../../build/code/src/shared/digests.js');
 const sample=(await frozen())[0];
 const row=(n,extra={})=>deepFreeze(JSON.parse(JSON.stringify({...sample,eventId:'event://profile/'+n,admissionOrdinal:n,causationEventRefs:[],eventContractDigest:undefined,payload:{},...extra})));
 const first=row(1),invocationRef='invocation://profile/reprice';
 const operation=row(2,{kind:'public_operation_admitted',payload:{operationId:'abg.operation.witness.admit',memberKey:'reprice',invocationRef}});
 const content={declarationRef:profile.ROOT_EVENT_PROFILE_DECLARATION_REF,beforeDigest:profile.LEGACY_ROOT_EVENT_CONTRACT_DIGEST,afterDigest:store.ROOT_EVENT_CONTRACT_DIGEST,changeClass:'design_reframe',owningTicketRef:'ticket://profile/control',reason:profile.ROOT_EVENT_PROFILE_UPGRADE_REASON};
 const boundary=row(3,{kind:'declaration_reprice_admitted',scopeClass:'workspace',parentAggregateId:invocationRef,causationEventRefs:[operation.eventId],payload:{...content,operatorActorRef:'actor://operator',actorRef:'actor://operator',act:'reprice',contentValue:content,contentValueDigest:sha256Canonical(content),evidence:[{ref:profile.ROOT_CURRENT_EVENT_PROFILE_REF,digest:store.ROOT_EVENT_CONTRACT_DIGEST}]}});
 const current=row(4,{runId:'r',eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST});
 const rows=[first,operation,boundary,current],source=new RuntimeDerivationSource();
 for(const cut of [1,2,3,4,2,3,0,4])assert.deepEqual(project(p,source.snapshot(rows.slice(0,cut))),project(old,deepFreeze(rows.slice(0,cut))));
 // A scoped raw/cold value retains its full profile source through historical cuts.
 const cold=p.selectValidatedRuntimeEventPrefix(deepFreeze(rows),{runId:'r'});
 const coldOld=old.selectValidatedRuntimeEventPrefix(deepFreeze(rows),{runId:'r'});
 p.runtimeEventProfileScheduleFromValidatedPrefix(cold);
 assert.deepEqual(p.runtimeEventProfileScheduleFromValidatedPrefix(p.validatedRuntimeEventPrefixThroughEvent(cold,current.eventId)),old.runtimeEventProfileScheduleFromValidatedPrefix(old.validatedRuntimeEventPrefixThroughEvent(coldOld,current.eventId)));
 assert.deepEqual(p.runtimeEventProfileScheduleFromValidatedPrefix(p.validatedRuntimeEventPrefixBeforeEvent(cold,current.eventId)),old.runtimeEventProfileScheduleFromValidatedPrefix(old.validatedRuntimeEventPrefixBeforeEvent(coldOld,current.eventId)));
 // QA P2: an ordinary row aliases the later witnessed boundary ID.
 const aliased=deepFreeze([first,operation,{...boundary,eventId:first.eventId},current]);
 const rawFull=p.selectValidatedRuntimeEventPrefix(aliased);
 p.runtimeEventProfileScheduleFromValidatedPrefix(rawFull);
 const rawEarlier=p.validatedRuntimeEventPrefixBeforeEvent(rawFull,operation.eventId);
 const warmed=new RuntimeDerivationSource();
 p.runtimeEventProfileScheduleFromValidatedPrefix(p.selectValidatedRuntimeEventPrefix(warmed.snapshot(aliased)));
 const ownedEarlier=p.selectValidatedRuntimeEventPrefix(warmed.snapshot(aliased.slice(0,2)));
 const actual=[p.runtimeEventProfileScheduleFromValidatedPrefix(rawEarlier),p.runtimeEventProfileScheduleFromValidatedPrefix(ownedEarlier)];
 const expected=[1,2].map(cut=>old.runtimeEventProfileScheduleFromValidatedPrefix(old.selectValidatedRuntimeEventPrefix(deepFreeze(aliased.slice(0,cut)))));
 console.log(JSON.stringify({kind:'d12_duplicate_boundary_regression',routes:['raw-cold-to-cut-1','warmed-source-to-cut-2'],actual,expected}));
 assert.deepEqual(actual,expected,'warm irregular history must not place a future witnessed boundary in an earlier cut');
 for(const cut of [4,1,3,2,4])assert.deepEqual(
  p.runtimeEventProfileScheduleFromValidatedPrefix(p.selectValidatedRuntimeEventPrefix(warmed.snapshot(aliased.slice(0,cut)))),
  old.runtimeEventProfileScheduleFromValidatedPrefix(old.selectValidatedRuntimeEventPrefix(deepFreeze(aliased.slice(0,cut)))));
 for(const changed of [
  {...boundary,payload:{...boundary.payload,reason:'wrong'}},
  {...boundary,parentAggregateId:'wrong'},
  {...boundary,causationEventRefs:[]},
  {...boundary,eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST},
 ]){
  const events=deepFreeze([first,operation,changed,current]),owner=new RuntimeDerivationSource();
  project(p,owner.snapshot([first,operation]));
  assert.deepEqual(result(()=>project(p,owner.snapshot(events))),result(()=>project(old,events)));
 }
 const repeated=deepFreeze([...rows,row(5,{...boundary,eventId:'event://profile/5',admissionOrdinal:5,eventContractDigest:store.ROOT_EVENT_CONTRACT_DIGEST})]);
 assert.deepEqual(result(()=>project(p,new RuntimeDerivationSource().snapshot(repeated))),result(()=>project(old,repeated)));
 console.log(JSON.stringify({kind:'d12_profile_controls',validBoundaryAndReverseCuts:true,malformedAndRepeatedBoundariesRefused:true}));
});

test('held snapshot lineage and scoped selection reuse exact values without old seed or identity walks',async()=>{
 const events=await frozen(),source=new RuntimeDerivationSource(),runId=events.find(e=>e.runId).runId;
 const growth=[];
 let snapshot=source.snapshot([]),priorSelected=p.selectValidatedRuntimeEventPrefix(snapshot,{runId}).events;
 for(const stop of [1,87,104,122,140,events.length]){
  const start=snapshot.length;
  snapshot=source.append(snapshot,events.slice(start,stop));
  const beforeGrowth=work(),current=p.selectValidatedRuntimeEventPrefix(snapshot,{runId});
  const seedRows=diff(beforeGrowth,'scopeSeedRows');
  if(globalThis.p0Work)assert.equal(seedRows,events.slice(start,stop).filter(e=>e.runId===runId).length);
  growth.push({start,stop,seedRows});
  assert.deepEqual(current.events,old.selectValidatedRuntimeEventPrefix(deepFreeze(events.slice(0,stop)),{runId}).events);
  const before=work();
  for(let n=0;n<4;n++){
   assert.equal(source.snapshot(snapshot),snapshot);
   assert.equal(p.selectValidatedRuntimeEventPrefix(snapshot,{runId}).events,current.events);
  }
  if(globalThis.p0Work)for(const key of ['sourceSnapshotRows','derivationIdentityRows','scopeSeedRows','scopeMaterializedRows','prefixIndexRows','prefixOrdinalRows'])assert.equal(diff(before,key),0,key);
  priorSelected=current.events;
 }
 const full=snapshot,cut=source.prefix(full,104),reverse=p.selectValidatedRuntimeEventPrefix(cut,{runId});
 assert.deepEqual(reverse.events,old.selectValidatedRuntimeEventPrefix(deepFreeze(events.slice(0,104)),{runId}).events);
 assert.equal(p.selectValidatedRuntimeEventPrefix(full,{runId}).events,priorSelected,'reverse cut retains the advanced selected value');
 assert.equal(source.hasPrefix(full,cut),true);
 const foreign=new RuntimeDerivationSource().snapshot(events);assert.equal(source.hasPrefix(full,foreign),true,'copied outer array with exact event identities remains compatible');
 const changed=deepFreeze({...events[104],eventId:events[104].eventId+'/foreign'}),branch=source.append(cut,[changed]);
 assert.equal(source.hasPrefix(full,branch),false,'divergent branch must not borrow future facts');
 const ownerKey=Symbol('fork-control'),firstScope=source.scope('fork',full);firstScope.owner(ownerKey,()=>1);
 assert.equal(source.scope('fork',branch).owner(ownerKey,()=>2),2);
 const descriptors=Object.getOwnPropertyDescriptors(full),forged=[...full];
 for(const key of Reflect.ownKeys(descriptors))if(typeof key==='symbol')Object.defineProperty(forged,key,descriptors[key]);
 Object.freeze(forged);assert.notEqual(source.snapshot(forged),forged,'descriptor copying cannot lend the exact snapshot receipt');
 const oldSourceModule=await import(pathToFileURL(join(process.env.ABI5_PREFIX_PREDECESSOR_ROOT,'build/code/src/abg/runtime_derivation.js')));
 const oldGrowthSource=new oldSourceModule.RuntimeDerivationSource();
 for(const row of growth){const before=work();old.selectValidatedRuntimeEventPrefix(oldGrowthSource.snapshot(events.slice(0,row.stop)),{runId});row.oldSeedRows=diff(before,'scopeSeedRows');}
 const oldSource=new oldSourceModule.RuntimeDerivationSource(),oldSnapshot=oldSource.snapshot(events);
 old.selectValidatedRuntimeEventPrefix(oldSnapshot,{runId});
 const beforeOld=work();for(let n=0;n<4;n++)old.selectValidatedRuntimeEventPrefix(oldSource.snapshot(oldSnapshot),{runId});
 const repeatedOld=Object.fromEntries(['sourceSnapshotRows','derivationIdentityRows','scopeSeedRows','scopeMaterializedRows'].map(key=>[key,diff(beforeOld,key)]));
 console.log(JSON.stringify({kind:'storage_snapshot_selection_controls',ordinaryCuts:6,repeatCount:4,repeatCopiesIdentitySeedsMaterializations:0,repeatedOld,growth,reverseRetainsAdvanced:true,foreignAndFork:true}));
});
