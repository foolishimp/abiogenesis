import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { performance } from 'node:perf_hooks';
const current=resolve(import.meta.dirname,'../..'), predecessor=process.env.ABG_OWNER_REUSE_PREDECESSOR;
const retained=process.env.ABG_OWNER_REUSE_TASK, evidence=process.env.ABG_OWNER_REUSE_EVIDENCE;
const selected=Boolean(predecessor&&retained&&evidence);
const load=(root,name)=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
async function instrument(root,name,overrides={},sharedRoot=root){
 const file=join(root,'build/code/src',name+'.js'), module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file});
 await module.link(async spec=>{
  const resolved=spec.startsWith('node:')?spec:pathToFileURL(resolve(sharedRoot,'build/code/src',dirname(name),spec)).href;
  const native=await import(resolved), values={...native,...overrides[spec]};
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();return module.namespace;
}
function record(name,value){fs.writeFileSync(join(evidence,name),JSON.stringify(value,null,2)+'\n');}

test('actual historical reacquisition contracts owner work without changing task or refusals',{skip:!selected},async()=>{
 const task=JSON.parse(fs.readFileSync(retained,'utf8')), request=task.sourceReacquisition.request, basis=task.sourceReacquisition.nativeBasis;
 const measures=[];let expected;
 for(const [variant,root]of [['predecessor',predecessor],['successor',current]]){
  const store=await load(root,'abg/event_store'), source=await load(root,'abg/native_worksite_execution'), digest=await load(root,'shared/digests');
  let reads=0,sourceProjections=0;
  const owner=await instrument(root,'abg/native_work_reacquisition',{
   './event_store.js':{readRuntimeEventsAtDurablePrefix:(...args)=>{reads++;return store.readRuntimeEventsAtDurablePrefix(...args);}},
   './native_worksite_execution.js':{projectNativeWorkCommandSourceAtPrefix:(...args)=>{sourceProjections++;return source.projectNativeWorkCommandSourceAtPrefix(...args);}}
  });
  const begin=performance.now(), result=owner.authenticateNativeWorkReacquisition(basis,request,false),elapsedMs=performance.now()-begin;
  assert(result);assert.deepEqual(result.task,task);
  const valueDigest=digest.sha256Canonical(result.task);
  if(expected===undefined)expected=valueDigest;else assert.equal(valueDigest,expected);
  assert.equal(sourceProjections,variant==='predecessor'?2:1);
  assert.equal(reads,variant==='predecessor'?2:1,'same-call current prefix is acquired only once in successor');
  measures.push({variant,condition:'cold serialized historical coordinate; no original store acquisition',elapsedMs,directCurrentPrefixReads:reads,nativeSourceProjections:sourceProjections,taskDigest:valueDigest});
  assert.equal(owner.authenticateNativeWorkReacquisition(basis,{...request,requestDigest:digest.sha256Canonical('malformed')},false),null);
  assert.equal(owner.authenticateNativeWorkReacquisition({...basis,cCallRef:'c-call://foreign'},request,false),null);
  assert.equal(owner.authenticateNativeWorkReacquisition(basis,request,true),null,'historical occurrence cannot claim latest prefix');
  assert.equal(await owner.nativeWorkReacquisitionContextCurrent(request),true,'all selected physical context remains exact');
  // Measure the execution-basis owner's duplicate input hashing independently.
  const digests=await load(root,'shared/digests');let rawHashes=0;
  const execution=await instrument(root,'abg/invocation_execution_truth',{'../shared/digests.js':{sha256Canonical:v=>{if(v===result.execution.rawInputValue)rawHashes++;return digests.sha256Canonical(v);}}});
  const projected=execution.projectExactExecutionBasisAtPrefix(result.prefix,result.execution.basisRef);assert(projected);
  assert.deepEqual(projected,result.execution);assert.equal(rawHashes,variant==='predecessor'?2:1);
  measures.at(-1).directRawInputHashes=rawHashes;
 }
 record('retained-owner-comparison.json',{kind:'matched_cold_historical_owner_differential',measures,limits:'No native execution/current-prefix authority or timing attribution to prior continuation. Counts cover named direct owner calls, not all recursive reads.'});
 console.log(JSON.stringify({kind:'retained_owner_comparison',measures}));
});

test('R10 keeps same-owner exact prefix warm while copies, closed owners and malformed cuts remain cold/refused',{skip:!selected},async()=>{
 const task=JSON.parse(fs.readFileSync(retained,'utf8')),request=task.sourceReacquisition.request;
 const store=await load(current,'abg/event_store'),digests=await load(current,'shared/digests');
 const source=request.source.prefix, originalPath=new URL(source.eventLogRef);
 const originalStat=fs.statSync(originalPath),bytes=Buffer.alloc(source.prefixLength),fd=fs.openSync(originalPath,'r');
 try{let offset=0;while(offset<bytes.length){const n=fs.readSync(fd,bytes,offset,bytes.length-offset,offset);assert(n>0);offset+=n;}}finally{fs.closeSync(fd);}
 assert.equal(digests.sha256Bytes(bytes),source.prefixDigest);
 const dir=fs.mkdtempSync(join(evidence,'r10-read-fixture-')),file=join(dir,'history.jsonl');fs.writeFileSync(file,bytes,{flag:'wx'});
 const st=fs.statSync(file),body={kind:'event_store_reopen_authority',schemaVersion:'5.0.0',eventLogPath:file,device:st.dev,inode:st.ino,eventLogDigest:digests.sha256Bytes(bytes),durableByteLength:bytes.length,eventContractDigest:source.storeIdentity.eventContractDigest};
 const opened=store.reopenEventStore({...body,authorityDigest:digests.sha256Canonical(body)});assert.equal(opened.kind,'reopened_event_store_context');
 const measures=[];
 try{
  const known=store.reidentifyHistoricalDurablePrefixCoordinate(opened.prefix,structuredClone(opened.prefix));
  assert.equal(store.captureDurablePrefixCoordinate(known),known);
  for(const condition of ['warm','cold-copy']){
   let expected;
   for(const [variant,root]of [['predecessor',predecessor],['successor',current]]){
    let owned=0,cold=0;
    const ports=await instrument(root,'abg/project_read_ports',{'./event_store.js':{
      readRuntimeEventsAtDurablePrefix:(p,...args)=>{if(store.captureDurablePrefixCoordinate(p)===p)owned++;else cold++;return store.readRuntimeEventsAtDurablePrefix(p,...args);}
    }},current);
    const input=condition==='warm'?known:structuredClone(known),begin=performance.now();
    const result=ports.projectClosedGraphCallTerminalAtDurablePrefix(input,request.source.graphCallRef,request.source.declarationProof),elapsedMs=performance.now()-begin;
    assert(result);assert.deepEqual(result.value,request.sourceNativeWork);
    const digest=digests.sha256Canonical(result);if(expected===undefined)expected=digest;else assert.equal(digest,expected);
    assert.equal(owned,variant==='successor'&&condition==='warm'?1:0);assert.equal(cold,1-owned);
    measures.push({variant,condition,elapsedMs,ownedCoordinateReads:owned,coldCoordinateReads:cold,terminalDigest:digest});
    assert.equal(ports.projectClosedGraphCallTerminalAtDurablePrefix(input,request.source.graphCallRef,{...request.source.declarationProof,schemaVersion:'foreign'}),null);
    const changed={...input,prefixDigest:digests.sha256Canonical('foreign')};
    assert.equal(ports.projectClosedGraphCallTerminalAtDurablePrefix(changed,request.source.graphCallRef,request.source.declarationProof),null);
   }
  }
  opened.store.closeDurableLog();
  for(const [variant,root]of [['predecessor',predecessor],['successor',current]]){
   const ports=await instrument(root,'abg/project_read_ports',{},current),begin=performance.now();
   const result=ports.projectClosedGraphCallTerminalAtDurablePrefix(known,request.source.graphCallRef,request.source.declarationProof);assert(result);
   assert.deepEqual(result.value,request.sourceNativeWork);measures.push({variant,condition:'closed-owner-cold-reconstruction',elapsedMs:performance.now()-begin});
  }
  assert.deepEqual(fs.readFileSync(file),bytes,'diagnostic owner never appended');
  // Corrupt only the disposable copy after closure; no retained receipt may hide changed bytes.
  const corrupt=fs.openSync(file,'r+');try{fs.writeSync(corrupt,Buffer.from('!'),0,1,0);}finally{fs.closeSync(corrupt);}
  for(const root of [predecessor,current]){
   const ports=await instrument(root,'abg/project_read_ports',{},current);
   assert.equal(ports.projectClosedGraphCallTerminalAtDurablePrefix(known,request.source.graphCallRef,request.source.declarationProof),null);
  }
  const after=fs.statSync(originalPath);assert.deepEqual([after.dev,after.ino],[originalStat.dev,originalStat.ino]);
  // Root may lawfully append concurrently. Only the selected immutable prefix
  // is this diagnostic's subject; no equality assertion on the moving frontier.
  const retainedBytes=Buffer.alloc(bytes.length),check=fs.openSync(originalPath,'r');
  try{let offset=0;while(offset<retainedBytes.length){const n=fs.readSync(check,retainedBytes,offset,retainedBytes.length-offset,offset);assert(n>0);offset+=n;}}finally{fs.closeSync(check);}
  assert.deepEqual(retainedBytes,bytes);
  record('r10-owner-comparison.json',{kind:'matched_owner_read_differential',fixtureBytes:bytes.length,sourceDigest:source.prefixDigest,measures,originalSelectedPrefixUnchanged:true,observedFrontierBytes:{before:originalStat.size,after:after.size},limits:'Disposable copy and no appends during measurements. Warm/cold R10 comparison is separate from actual reacquisition cold comparison; no runtime qualification. Original source opened read-only; concurrent append remains Executive-owned.'});
  console.log(JSON.stringify({kind:'r10_owner_comparison',measures}));
 }finally{opened.store.closeDurableLog();fs.rmSync(dir,{recursive:true,force:true});}
});


test('execution basis still refuses changed raw input and changed enclosing body',{skip:!selected},async()=>{
 const task=JSON.parse(fs.readFileSync(retained,'utf8')),basis=task.sourceReacquisition.nativeBasis;
 const store=await load(current,'abg/event_store'),prefixes=await load(current,'abg/event_prefix'),digest=await load(current,'shared/digests'),immutable=await load(current,'shared/immutable');
 const events=store.readRuntimeEventsAtDurablePrefix(basis.predecessorPrefix);
 const opened=events.find(e=>e.kind==='c_call_opened'&&e.aggregateId===basis.cCallRef);
 const event=events.find(e=>e.kind==='basis_admitted'&&e.basisId===opened.basisId);assert(event);
 const changedValue={...event.payload.rawInputValue,requestDigest:digest.sha256Canonical('changed')};
 const cases=[{...event,payload:{...event.payload,rawInputValue:changedValue}},
  {...event,payload:{...event.payload,rawInputValue:changedValue,rawInputDigest:digest.sha256Canonical(changedValue)}}];
 for(const root of [predecessor,current]){
  const projection=await instrument(root,'abg/invocation_execution_truth',{},current);
  const valid=projection.projectExactExecutionBasisAtPrefix(prefixes.selectValidatedRuntimeEventPrefix(events),event.basisId);assert(valid);
  for(const counterexample of cases){
   const prefix=prefixes.selectValidatedRuntimeEventPrefix(immutable.deepFreeze(events.map(row=>row.eventId===event.eventId?counterexample:row)));
   assert.equal(projection.projectExactExecutionBasisAtPrefix(prefix,event.basisId),null);
  }
 }
 record('basis-refusal-differential.json',{validActualBasis:true,malformedRawInputRefused:true,enclosingDigestStillRequired:true,subjects:2,claim:'Counterexample event values are pure fixtures, never runtime admission.'});
});
