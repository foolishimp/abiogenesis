import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, stat } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import * as Effect from 'effect/Effect';

const predecessor = process.env.ABI5_COMPOSITION_PREDECESSOR;
const retained = process.env.ABI5_COMPOSITION_SCRATCH;
assert.ok(predecessor && retained, 'exact predecessor and immutable native history required');
const roots = [predecessor, resolve(import.meta.dirname, '../..')];
const load = (root, name) => import(pathToFileURL(join(root, 'build/code/src', name + '.js')));
const modules = await Promise.all(roots.map(async root => Object.fromEntries(await Promise.all(
  ['abg/c_call','abg/event_store','abg/event_prefix','abg/project_read_ports','abg/project_read_operation_contracts',
   'abg/environment_admission','product/invocation','shared/digests'].map(async name => [name.split('/').at(-1), await load(root,name)])))));
const fullCall = JSON.parse(await readFile(join(retained,'full-call.json')));
const original = JSON.parse(await readFile(join(retained,'full-outcome.json'))).resources.eventResource.closeHandoff;
const bytes = await readFile(fileURLToPath(original.prefix.eventLogRef));
const scratch = await mkdtemp(join(tmpdir(),'composition-controls-'));
const path = join(scratch,'events.jsonl'); await writeFile(path,bytes); const inode = await stat(path);
const hash = modules[1].digests.sha256Canonical;
const sign = (value,key) => { const { [key]:_,...body }=value; return {...body,[key]:hash(body)}; };
const prefix = sign({...original.prefix,eventLogRef:pathToFileURL(path).href,
  storeIdentity:{...original.prefix.storeIdentity,device:inode.dev,inode:inode.ino}},'coordinateDigest');
const handoff = {prefix,reopenAuthority:sign({...original.reopenAuthority,eventLogPath:path,device:inode.dev,inode:inode.ino},'authorityDigest')};
const events = modules[1].event_store.readRuntimeEventsAtDurablePrefix(prefix);
const prefixes = modules.map(m=>m.event_prefix.selectValidatedRuntimeEventPrefix(events));
const run = events.find(e=>e.kind==='run_segment_opened').runId;
const rootGraph = events.find(e=>e.kind==='graph_call_opened').graphCallId;
const declared = {kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:fullCall.resources.catalog,catalogView:fullCall.resources.catalogView};
const report = {scope:'focused source comparison over copied admitted D17 history; no installed or live qualification',scratch,
  predecessor,historySha256:modules[1].digests.sha256Bytes(bytes),measurements:[],cases:[]};
const counts = ()=>({...globalThis.p0Work});
const difference = (a,b)=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(k=>[k,(b[k]??0)-(a[k]??0)]).filter(([,v])=>v));
const outcome = fn=>{try{return {returned:fn()};}catch(e){return {error:e.name,message:e.message};}};
const compare = (label, fn)=>{
  const values=modules.map((m,i)=>outcome(()=>fn(m,i)));
  assert.deepEqual(values[1],values[0],label); report.cases.push(label); return values[1].returned;
};
const packet=(memberKey,targetRef,selected=prefix,proof)=>({kind:'abg_project_read_packet',schemaVersion:'5.0.0',memberKey,prefix:selected,targetRef,
  ...(proof===undefined?{}:{declarationProof:proof})});
const raw=(m,p)=>p.memberKey.startsWith('graph_call')?m.project_read_ports.GraphCallProjectionPort[p.memberKey](p):m.project_read_ports.RunProjectionPort[p.memberKey](p);
const source=(m,member,target,selected=prefix)=>{
  if(member.startsWith('graph_call'))return m.project_read_ports.projectGraphCallSourceAtDurablePrefix(selected,target);
  const truth=m.project_read_ports.projectRunTruthAtDurablePrefix(selected,target);
  return truth.kind==='abg_run_truth_projection'?{source:truth.run,workspaceBinding:truth.workspaceBinding}:null;
};
const prefixAt=ordinal=>{const selected=Buffer.from(bytes.toString('utf8').split('\n').slice(0,ordinal).join('\n')+'\n');
  return sign({...prefix,prefixLength:selected.length,prefixDigest:modules[1].digests.sha256Bytes(selected)},'coordinateDigest');};

// The retained full D17 history has a predecessor-established cold C2-source
// refusal. Positive context reuse is exercised at the last still-lawful cut.
const c2 = events.find(e=>e.kind==='basis_admitted'&&e.payload.rawInputValue?.kind==='worksite_command_execution_task');
const readBytes=Buffer.from(bytes.toString('utf8').split('\n').slice(0,c2.admissionOrdinal-1).join('\n')+'\n');
const readPath=join(scratch,'read-events.jsonl');await writeFile(readPath,readBytes);const readInode=await stat(readPath);
const readPrefix=sign({...prefix,eventLogRef:pathToFileURL(readPath).href,prefixLength:readBytes.length,
  prefixDigest:modules[1].digests.sha256Bytes(readBytes),storeIdentity:{...prefix.storeIdentity,device:readInode.dev,inode:readInode.ino}},'coordinateDigest');
const readHandoff={prefix:readPrefix,reopenAuthority:sign({...handoff.reopenAuthority,eventLogPath:readPath,
  device:readInode.dev,inode:readInode.ino,durableByteLength:readBytes.length,eventLogDigest:readPrefix.prefixDigest},'authorityDigest')};
const simpleRoot='/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260911_D4_S01_PROGRAM_OWNER/fixture-program-selection-01/attempt-01';
const simpleCall=JSON.parse(await readFile(join(simpleRoot,'call-11.jsonl')));
const simplePrefix=simpleCall.acquisition.closeHandoff.prefix;
const simpleEvents=modules[1].event_store.readRuntimeEventsAtDurablePrefix(simplePrefix);
const simpleRun=simpleEvents.find(e=>e.kind==='run_segment_opened').runId;
const simpleGraph=simpleEvents.find(e=>e.kind==='graph_call_opened').graphCallId;

async function privateKernel(root) {
  const file=join(root,'build/code/src/abg/project_read_definition_bindings.js');
  const module=new SourceTextModule(await readFile(file,'utf8')+'\nexport {runReadKernel};',{identifier:file});
  const links=new Map();
  await module.link(async specifier=>{
    if(links.has(specifier))return links.get(specifier);
    const actual=await import(specifier.startsWith('.')?pathToFileURL(resolve(dirname(file),specifier)).href:specifier);
    const linked=new SyntheticModule(Object.keys(actual),function(){for(const [key,value]of Object.entries(actual))this.setExport(key,value);});
    links.set(specifier,linked);return linked;
  });
  await module.evaluate();return module.namespace.runReadKernel;
}

test('CCall joined outcomes conserve exact bodies, standalone results and historical refusals',()=>{
  const calls=events.filter(e=>e.kind==='c_call_opened');
  for(const open of calls){
    const rows=events.filter(e=>e.aggregateType==='c_call'&&e.aggregateId===open.aggregateId);
    const fibre=rows.find(e=>e.kind==='c_call_fibre_selected'),resultEvent=rows.find(e=>e.kind==='c_call_result_admitted'),judged=rows.find(e=>e.kind==='c_call_judged');
    if(!resultEvent||!judged)continue;
    const call={...open.payload,...fibre.payload,kind:'c_call',schemaVersion:'5.0.0',runId:open.runId,
      childGraphFunctionRef:open.payload.childGraphFunctionRef??null,failureContractRef:open.payload.failureContractRef??'',openedEventRef:open.eventId,fibreSelectedEventRef:fibre.eventId};
    const result={...resultEvent.payload,kind:'admitted_c_call_result',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:resultEvent.eventId};
    const judgment={...judged.payload,kind:'admitted_c_call_judgment',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:judged.eventId};
    const values=modules.map((m,i)=>{const before=counts();const value=m.c_call.projectAdmittedCCallOutcomeAtPrefix(prefixes[i],call,result,judgment);
      const work=difference(before,counts());assert.equal(work.projectCCallCarrierPhaseAtPrefix,i===0?2:1);
      return value;});assert.ok(values[0],open.aggregateId);assert.deepEqual(values[1],values[0]);
    report.cases.push('joined '+call.callClass+'/'+call.regime+' '+call.cCallRef);
    compare('standalone result '+call.cCallRef,(m,i)=>m.c_call.projectAdmittedCCallResultAtPrefix(prefixes[i],call,result));
    for(const [label,c,r,j]of [['value',call,{...result,value:{spoof:true}},judgment],['result producer',call,{...result,cCallRef:'c-call:foreign'},judgment],
      ['judgment result',call,result,{...judgment,resultRef:'result:foreign'}],['judgment digest',call,result,{...judgment,resultDigest:hash('foreign')}],
      ['call identity',{...call,cCallDigest:hash('foreign')},result,judgment]]){
      assert.equal(compare(label+' '+call.cCallRef,(m,i)=>m.c_call.projectAdmittedCCallOutcomeAtPrefix(prefixes[i],c,r,j)),null);
    }
    for(const event of [fibre,resultEvent,judged,fibre])compare('cut '+event.kind+' '+call.cCallRef,(m,i)=>m.c_call.projectAdmittedCCallOutcomeAtPrefix(
      m.event_prefix.validatedRuntimeEventPrefixThroughEvent(prefixes[i],event.eventId),call,result,judgment));
  }
  report.measurements.push({owner:'joined CCall carrier phase',perOutcome:{predecessor:2,successor:1},calls:calls.length});
});

test('CCall ID references preserve ordered global matches for accepted raw duplicate histories',async()=>{
  const open=events.find(e=>e.kind==='c_call_opened');
  const rows=events.filter(e=>e.aggregateType==='c_call'&&e.aggregateId===open.aggregateId);
  const fibre=rows.find(e=>e.kind==='c_call_fibre_selected'),resultEvent=rows.find(e=>e.kind==='c_call_result_admitted'),judged=rows.find(e=>e.kind==='c_call_judged');
  const call={...open.payload,...fibre.payload,kind:'c_call',schemaVersion:'5.0.0',runId:open.runId,
    childGraphFunctionRef:open.payload.childGraphFunctionRef??null,failureContractRef:open.payload.failureContractRef??'',openedEventRef:open.eventId,fibreSelectedEventRef:fibre.eventId};
  const result={...resultEvent.payload,kind:'admitted_c_call_result',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:resultEvent.eventId};
  const judgment={...judged.payload,kind:'admitted_c_call_judgment',schemaVersion:'5.0.0',disposition:'admitted',admissionEventRef:judged.eventId};
  const freeze=value=>{if(value!==null&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
  const project=(m,p)=>({phase:m.c_call.projectCCallCarrierPhaseAtPrefix(p,call),
    result:m.c_call.projectAdmittedCCallResultAtPrefix(p,call,result),
    outcome:m.c_call.projectAdmittedCCallOutcomeAtPrefix(p,call,result,judgment)});
  const check=(label,history)=>{
    const frozen=freeze(structuredClone(history));
    const value=compare(label,m=>project(m,m.event_prefix.selectValidatedRuntimeEventPrefix(frozen)));
    report.measurements.push({owner:'ordered global CCall ID',label,rows:history.length,
      phase:value.phase?.phase??null,result:value.result!==null,outcome:value.outcome!==null});return value;
  };
  const positive=check('unchanged copied native CCall history',events);assert.equal(positive.phase.phase,'judged');assert.ok(positive.result&&positive.outcome);
  for(const target of [open,fibre,resultEvent,judged])for(const body of ['same','different'])for(const order of ['before','after']){
    const shadow={...target,aggregateId:'c-call:foreign-shadow',causationEventRefs:target===judged&&body==='same'?target.causationEventRefs:[],
      payload:body==='same'?target.payload:{...target.payload,foreignShadow:true}};
    const at=order==='before'?open.admissionOrdinal-1:events.length;
    const history=[...events.slice(0,at),shadow,...events.slice(at)].map((event,i)=>({...event,admissionOrdinal:i+1}));
    const value=check(target.kind+' '+body+' body '+order,history);
    if(order==='after'){assert.deepEqual(value,positive);continue;}
    if(target===open||target===fibre){assert.deepEqual(value,{phase:null,result:null,outcome:null});continue;}
    assert.deepEqual(value.phase,positive.phase);
    assert.deepEqual(value.result,target===resultEvent&&body==='different'?null:positive.result);
    assert.deepEqual(value.outcome,body==='different'?null:positive.outcome);
  }
  await writeFile(join(scratch,'ordered-id-proof.json'),JSON.stringify({predecessor,historySha256:report.historySha256,
    measurements:report.measurements.filter(row=>row.owner==='ordered global CCall ID')},null,2)+'\n');
});

test('Run and GraphCall source/projections share context with complete raw packet and historical behavior',()=>{
  const child=events.find(e=>e.kind==='graph_call_closed'&&e.graphCallId!==rootGraph).graphCallId;
  const cases=[['run_status',run,readPrefix],['run_result',run,readPrefix],['run_replay',run,readPrefix],
    ['graph_call_result',child,readPrefix,declared],['graph_call_replay',child,readPrefix,declared],
    ['graph_call_result',child,readPrefix],['graph_call_result',child,readPrefix,{}],
    ['run_result',simpleRun,simplePrefix],['run_replay',simpleRun,simplePrefix],
    ['graph_call_result',simpleGraph,simplePrefix],['graph_call_replay',simpleGraph,simplePrefix],
    ['graph_call_replay',simpleGraph,simplePrefix,{}]];
  const refused=compare('full D17 cold C2-source historical refusal',m=>m.project_read_ports.projectRunTruthAtDurablePrefix(prefix,run));
  assert.equal(refused.code,'invalid_history');
  for(const [member,target,selected,proof]of cases){
    const p=packet(member,target,selected,proof);
    const oldBefore=counts(),truth=source(modules[0],member,target,selected),expected=raw(modules[0],p),oldWork=difference(oldBefore,counts());
    assert.ok(truth,member+' '+target);
    const newBefore=counts(),owned=modules[1].project_read_ports.prepareRunReadAtDurablePrefix(selected,member,target);
    assert.ok(owned);assert.deepEqual({source:owned.source,workspaceBinding:owned.workspaceBinding},truth);
    const actual=owned.project(proof),newWork=difference(newBefore,counts());assert.deepEqual(actual,expected,member+' '+target);
    assert.deepEqual(raw(modules[1],p),expected,'standalone '+member);
    assert.equal(oldWork.prepareRead,2);assert.equal(newWork.prepareRead,1);
    assert.equal(oldWork.canonicalRunContext,proof && Object.keys(proof).length===0 ? 1 : 2);assert.equal(newWork.canonicalRunContext,1);
    report.measurements.push({owner:member,target,proof:proof!==undefined,predecessor:oldWork,successor:newWork});
    report.cases.push(member+' '+target+' '+(proof===undefined?'no proof':'proof')+' '+(actual.code??actual.kind));
  }
  for(const target of ['run://missing',rootGraph]){
    compare('absent run '+target,m=>source(m,'run_result',target));
    assert.equal(modules[1].project_read_ports.prepareRunReadAtDurablePrefix(prefix,'run_result',target),null);
  }
  for(const p of [{...packet('run_result',run),extra:true},{...packet('run_result',run),declarationProof:{}},
    {...packet('run_result',run),prefix:{...prefix,coordinateDigest:hash('wrong')}},packet('graph_call_result',run)])
    compare('raw packet '+JSON.stringify(p).slice(-80),m=>raw(m,p));
});

test('Run read kernel preserves complete source, catalog and resource refusals with fresh acquisition',async()=>{
  const kernels=await Promise.all(roots.map(privateKernel));
  const readRoot=JSON.parse(await readFile(join(retained,'generic-full-proof.json'))).readbackRoot;
  for(const member of ['run_result','run_replay']){
    const base=JSON.parse(await readFile(join(readRoot,member+'.jsonl'))).invocation;
    base.invocation.request.projectionBasis={projectionBasisRef:readPrefix.eventLogRef,projectionBasisDigest:readPrefix.coordinateDigest};
    base.resources.eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:readHandoff,handoffDigest:hash(readHandoff)};
    for(const [label,mutate]of [['success',()=>{}],['source digest',c=>{c.invocation.request.source.sourceDigest=hash('foreign');}],
      ['source absent',c=>{c.invocation.request.source.sourceRef='run://absent';}],
      ['workspace mismatch',c=>{c.invocation.invocationAuthority.slots.workspace_binding.digest=hash('foreign');}],
      ['Product coordinate',c=>{c.invocation.invocationAuthority.slots.product_set[0].digest=hash('foreign');}],
      ['catalog coordinate',c=>{c.invocation.contractCatalog.digest=hash('foreign');}],
      ['projection basis',c=>{c.invocation.request.projectionBasis.projectionBasisDigest=hash('foreign');}]]){
      const call=structuredClone(base);mutate(call);const outputs=[];
      for(let i=0;i<2;i++){
        const m=modules[i],definition=m.project_read_operation_contracts.ABG_PROJECT_READ_CONTRACTS[member];
        const before=counts();const output=await Effect.runPromise(kernels[i](definition,p=>raw(m,p))(call));
        outputs.push(output);report.measurements.push({owner:'kernel '+member,label,variant:i,work:difference(before,counts())});
      }
      assert.deepEqual(outputs[1],outputs[0],member+' '+label);report.cases.push('kernel '+member+' '+label);
      assert.deepEqual(await readFile(readPath),readBytes,'read kernel is zero-event');
      if(label==='success')assert.equal(outputs[0].ownerOutput.outcomeKind,member==='run_replay'?'result':'refusal');
    }
  }
  const changed=Buffer.from(bytes);changed[0]=91;await writeFile(path,changed);
  try{
    compare('fresh raw read refuses physical drift',m=>raw(m,packet('run_result',run)));
    assert.equal(modules[1].project_read_ports.prepareRunReadAtDurablePrefix(prefix,'run_result',run),null);
  }finally{await writeFile(path,bytes);}
  assert.deepEqual(await readFile(fileURLToPath(original.prefix.eventLogRef)),bytes,'historical source untouched');
  await writeFile(join(scratch,'proof.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({kind:'composition_conservation',scratch,cases:report.cases.length,measurements:report.measurements}));
});
