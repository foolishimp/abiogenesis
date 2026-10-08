import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rename, rm, stat, symlink, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import * as product from '../../build/code/src/product/index.js';
import * as c2 from '../../build/code/src/product/worksite_command_execution.js';
import * as abg from '../../build/code/src/abg/index.js';
import * as storeOwner from '../../build/code/src/abg/event_store.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import { assessmentSelection, consumerDeclaration, IDS } from './consumer.mjs';
import { constructLifecycleCall, installedModules, publicCaller } from './public-setup.mjs';
import { acquireArchivedScenario, acquireScenario, constructWorkloadInput, digest, fixturePath, loadScenarios, selectScenarios, snapshotScenario } from './scenarios.mjs';
import { acquireResumeMaterial, applyCommandTimeoutOverrides, commandObservationOwner, commandObservationSourceUse, commandRecorder, configuration, eventResourceIdentity, exclusiveRecord, freshReadbacks, invokeLifecycle, main, newArchive, readOracleEvents, transferResumeMaterial, workerEnvironment } from './runner.mjs';

const fixtures=fileURLToPath(new URL('../fixtures/sandbox-uat/',import.meta.url));
const archives=fileURLToPath(new URL('../../../../../.ai-workspace/work/T287_SANDBOX_UAT_01/harness/unit-runs/',import.meta.url));
const policyUnits=process.env.ABI5_UAT_UNIT_ROOT??archives;
async function oracleEventFixture(t) {
  const scratch=await newArchive(policyUnits,'oracle-event-prefix'),eventLogPath=join(scratch.path,'events.jsonl');
  const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath});
  assert.ok('store'in acquired);t.after(()=>acquired.store.closeDurableLog());
  // The same ordinary raw-prefix fixture used by ordered reconstruction:
  // actual admission/stamps/physical authentication; no native UAT claim.
  const candidate=suffix=>({kind:'public_operation_admitted',eventTime:'2026-09-19T20:00:00.000Z',
    aggregateType:'workspace',aggregateId:'invocation://ordered/'+suffix,parentAggregateId:null,causationEventRefs:[],
    correlationId:'correlation://ordered/'+suffix,workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://ordered/held',
    payload:{invocationDigest:product.sha256Canonical(suffix),invocationRef:'invocation://ordered/'+suffix,
      operationId:'abg.operation.project.read',variant:'status'}});
  let prefix=acquired.prefix;
  for(const suffix of ['first','second'])prefix=storeOwner.admitNonEmptyRuntimeEventTransactionAtDurablePrefix(acquired.store,prefix,
    ()=>storeOwner.admitRuntimeEvent(acquired.store,candidate(suffix))).successorPrefix;
  return {root:scratch.path,prefix:structuredClone(prefix),expected:acquired.store.readAll(),eventLogPath};
}
test('Oracle event acquisition records the authentic prefix without serializing or changing complete owner events',async t=>{
  const f=await oracleEventFixture(t),before=await readFile(f.eventLogPath),steps=[];
  let returned;
  const owner={captureDurablePrefixCoordinate:abg.captureDurablePrefixCoordinate,readRuntimeEventsAtDurablePrefix(prefix) {
    assert.deepEqual(prefix,f.prefix);assert.equal(Object.isFrozen(prefix),true);steps.push('owner-read');
    const decoded=abg.readRuntimeEventsAtDurablePrefix(prefix);
    // A serialization sentinel is the only reader double: all underlying
    // events are the actual cold-decoded owner values, in their original order.
    returned=new Proxy(decoded,{get(target,key,receiver) {
      if(key==='toJSON')assert.fail('Hydrated event vectors must not be serialized by the caller');
      return Reflect.get(target,key,receiver);
    }});
    return returned;
  }};
  const record=async(path,value)=>{
    assert.equal(path,'runtime-event-prefix.json');assert.deepEqual(value,f.prefix);steps.push('prefix-record');
    return exclusiveRecord(f.root,path,value);
  };
  const events=await readOracleEvents(owner,f.prefix,record);
  assert.equal(events,returned);assert.deepEqual([...events],f.expected);
  assert.deepEqual(events.map(event=>event.admissionOrdinal),[1,2]);
  assert.deepEqual(steps,['owner-read','prefix-record']);
  const path=join(f.root,'runtime-event-prefix.json'),bytes=await readFile(path);
  assert.deepEqual(JSON.parse(bytes),f.prefix);
  await assert.rejects(readFile(join(f.root,'runtime-events.json')),error=>error.code==='ENOENT');
  await assert.rejects(readOracleEvents(owner,f.prefix,record),error=>error.code==='EEXIST');
  assert.deepEqual(await readFile(path),bytes);assert.deepEqual(await readFile(f.eventLogPath),before);
});
test('Oracle event acquisition preserves owner refusals and archive errors without writing alternate event evidence',async t=>{
  const f=await oracleEventFixture(t),bad={...f.prefix,prefixDigest:'sha256:'+'0'.repeat(64)};
  let refused;
  const owner={captureDurablePrefixCoordinate:abg.captureDurablePrefixCoordinate,readRuntimeEventsAtDurablePrefix(prefix) {
    try{return abg.readRuntimeEventsAtDurablePrefix(prefix);}catch(error){refused=error;throw error;}
  }};
  await assert.rejects(readOracleEvents(owner,bad,()=>assert.fail('A refused owner read cannot record evidence')),error=>{
    assert.equal(error,refused);assert.equal(error.code,'event_envelope_invalid');return true;
  });
  const recordFailure=new Error('controlled exclusive archive failure');
  await assert.rejects(readOracleEvents(abg,f.prefix,()=>{throw recordFailure;}),error=>error===recordFailure);
  await assert.rejects(readFile(join(f.root,'runtime-event-prefix.json')),error=>error.code==='ENOENT');
  await assert.rejects(readFile(join(f.root,'runtime-events.json')),error=>error.code==='ENOENT');
});
test('Eventless read conservation hashes bounded chunks and detects tampering, append and identical-byte replacement',async t=>{
  const root=await mkdtemp(join(tmpdir(),'uat-conservation-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const path=join(root,'events.jsonl'),bytes=Buffer.alloc(3*64*1024+17,65);
  await writeFile(path,bytes,{flag:'wx'});
  const initial=await eventResourceIdentity(path);
  assert.equal(initial.byteCount,bytes.length);assert.equal(initial.digest,digest(bytes));
  assert.deepEqual(await eventResourceIdentity(path),initial);
  const changed=Buffer.from(bytes);changed[64*1024+3]=66;await writeFile(path,changed);
  assert.notDeepEqual(await eventResourceIdentity(path),initial,'same-size mid-file tampering');
  await writeFile(path,Buffer.concat([bytes,Buffer.from('\n')]));
  assert.notDeepEqual(await eventResourceIdentity(path),initial,'append');
  const replacement=join(root,'replacement.jsonl');await writeFile(replacement,bytes,{flag:'wx'});await rename(replacement,path);
  const replaced=await eventResourceIdentity(path);assert.equal(replaced.digest,initial.digest);
  assert.notEqual(replaced.inode,initial.inode,'same bytes cannot substitute a different resource');
  await rm(path);await symlink(replacement,path);await assert.rejects(eventResourceIdentity(path));
});
test('One authentic cold read supplies caller artifact/environment/read preparation without another physical decode',
  {skip:!process.env.ABI5_AUTHENTIC_READ_HISTORY},async t=>{
  const bytes=await readFile(process.env.ABI5_AUTHENTIC_READ_HISTORY);
  assert.equal(digest(bytes),process.env.ABI5_AUTHENTIC_READ_HISTORY_DIGEST,'pinned existing admitted history');
  const root=await mkdtemp(join(tmpdir(),'uat-owned-read-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const path=join(root,'events.jsonl');await writeFile(path,bytes,{flag:'wx'});const node=await stat(path);
  const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:pathToFileURL(path).href,
    prefixLength:bytes.length,prefixDigest:digest(bytes),storeIdentity:{device:node.dev,inode:node.ino,eventContractDigest:abg.ROOT_EVENT_CONTRACT_DIGEST}};
  const prefix={...body,coordinateDigest:product.sha256Canonical(body)},caller=publicCaller({root,runtime:{product,abg,api:{}},
    native:{verified:{}},config:{runId:'authenticated-read-source'},record:async()=>{},command:()=>assert.fail('No Public/native dispatch')});
  caller.state.closeHandoff={prefix};
  let source;
  const originalRead=fs.readSync;let physicalReads=0;
  fs.readSync=(...args)=>{physicalReads++;return originalRead(...args);};syncBuiltinESMExports();
  t.after(()=>{fs.readSync=originalRead;syncBuiltinESMExports();});
  const events=await readOracleEvents(abg,prefix,async()=>{},owned=>{source=owned;});
  assert.ok(physicalReads>0);const acquiredReads=physicalReads;
  const truth=abg.projectOwnedPrefixArtifactTruth(source);assert.equal(truth.kind,'exact_prefix_artifact_truth_projection');
  const binding=truth.rows.find(row=>row.operationId==='abg.operation.workspace.bind').artifact;
  caller.state.binding={ref:binding.bindingId,digest:binding.bindingDigest};
  const environment=caller.refresh(source);assert.equal(environment.kind,'exact_prefix_workspace_environment');
  assert.equal(environment.artifactTruth,truth);
  assert.equal(caller.refresh(),environment,'internal preparation borrows the actual owner projection');
  assert.equal(physicalReads,acquiredReads,'complete source is decoded once');
  const cold=abg.projectExactPrefixWorkspaceEnvironment(structuredClone(prefix),caller.state.binding);
  assert.deepEqual(cold,environment);assert.ok(physicalReads>acquiredReads,'copied source reconstructs cold');
  assert.equal(events.length,434);assert.equal(Object.isFrozen(events),true);
  assert.deepEqual(await readFile(path),bytes);
});
test('Terminal-null admitted Run retains genuine C2 partial evidence and refuses foreign, invalid or fabricated observations',
  {skip:!process.env.ABI5_AUTHENTIC_C2_EVENT},async()=>{
  const bytes=await readFile(process.env.ABI5_AUTHENTIC_C2_EVENT);
  assert.equal(digest(bytes),process.env.ABI5_AUTHENTIC_C2_EVENT_DIGEST,'exact previously authenticated native event');
  const event=JSON.parse(bytes),value=event.payload.value;
  const provenance=JSON.parse(await readFile(process.env.ABI5_AUTHENTIC_C2_PROVENANCE));
  assert.equal(event.runId,provenance.runRef);assert.equal(event.admissionOrdinal,provenance.admissionOrdinal);
  const execution={receipt:{resources:{run:{ref:event.runId}},ownerOutput:{outcomeKind:'result',value:{terminalResult:null}}}};
  const owner=commandObservationOwner(product,execution);assert.equal(owner.runId,event.runId);
  const {root,rows}=await loadScenarios(fixtures),selected=await acquireScenario(root,rows.find(row=>row.key==='data-mapper-full'));
  const checker=await import(pathToFileURL(fixturePath(root,selected.row.oracleModule)).href);
  const relation=product.resolveWorksiteCommandExecutionJudgmentRelation(product.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef);
  assert.equal(relation.evaluate(value.task,value),true,'existing published owner validates retained native C2 observation');
  // The original acquired request remains unchanged. Its resolved command
  // plan is the actual retained native task, including the accepted five-hour
  // caller policy and toolchain binding; no new command or execution is made.
  const request={...selected.request,testing:{...selected.request.testing,commands:value.task.commands}};
  const evaluate=overrides=>checker.evaluate({worksiteRoot:provenance.worksiteRoot,runArchive:dirname(provenance.worksiteRoot),
    source:selected.row,request,events:[event],observationOwner:owner,
    validateObservation:observation=>relation.evaluate(observation.task,observation),...overrides});
  const result=await evaluate();
  const executionCriterion=result.criteria.find(row=>row.id==='execution:'+value.task.commands[0].commandId);
  assert.equal(executionCriterion.disposition,'unmet','genuine red is attributed rather than discarded for null terminal');
  assert.ok(executionCriterion.evidenceRefs.length>0);assert.notEqual(result.disposition,'satisfied','one retained red cannot complete original UAT');
  const completed=structuredClone(execution);completed.receipt.ownerOutput.value.terminalResult={producer:{runRef:event.runId}};
  assert.deepEqual(commandObservationOwner(product,completed),owner);
  completed.receipt.ownerOutput.value.terminalResult.producer.runRef='run://foreign/producer';
  assert.throws(()=>commandObservationOwner(product,completed),error=>error.stage==='oracle-source');
  for(const overrides of [{observationOwner:{...owner,runId:'run://foreign/receipt'}},{validateObservation:()=>false},
    {events:[]},{events:[{...event,payload:{...event.payload,cCallRef:'c-call:foreign'}}]}]) {
    const refused=await evaluate(overrides);
    assert.equal(refused.criteria.find(row=>row.id===executionCriterion.id).disposition,'indeterminate');
  }
  const fabricated=structuredClone(event);fabricated.payload.value.commandResults[0].args=['fabricated'];
  assert.equal(relation.evaluate(fabricated.payload.value.task,fabricated.payload.value),false);
  assert.equal((await evaluate({events:[fabricated]})).criteria.find(row=>row.id===executionCriterion.id).disposition,'indeterminate');
});
test('Source-use attribution refuses unauthenticated or unadmitted current invocations through actual installed owners',async t=>{
  const runtime=await installedModules(process.env.ABI5_ORACLE_SOURCE_OWNER_ROOT??fileURLToPath(new URL('../../',import.meta.url)));
  const f=await oracleEventFixture(t),prefix=runtime.abg.captureDurablePrefixCoordinate(f.prefix);
  const events=runtime.abg.readRuntimeEventsAtDurablePrefix(prefix);
  const owner={graphFunctionRef:runtime.product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    outputContractRef:runtime.product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,resultClass:'success',runId:'run://unadmitted'};
  const absent=commandObservationSourceUse(runtime,prefix,events,owner);
  assert.equal(events.some(absent),false,'a real authenticated event source has no invented invocation/source authority');
  const copied=commandObservationSourceUse(runtime,prefix,[...events],owner);
  assert.equal(events.some(copied),false,'copied caller vectors are not the exact authenticated source');
  const supplied={...owner,sourceResultBasis:{sourceResultContractRef:runtime.product.governanceContract('state'),
    sourceResultValue:{kind:'governance_work_state',observations:[{resultRef:'result://supplied',resultDigest:product.sha256Canonical('supplied'),cCallRef:'c-call:supplied'}],synthesis:null}}};
  assert.equal(events.some(commandObservationSourceUse(runtime,prefix,events,supplied)),false,'supplied JSON does not add an admission');
  assert.equal(events.some(commandObservationSourceUse(runtime,{...prefix,eventCount:prefix.eventCount+1},events,owner)),false,'crossed physical coordinate cannot earn credit');
});
test('Source-use finite owner tuples preserve cross-Run consumer guards under an explicit admission projection premise',async t=>{
  const runtime=await installedModules(process.env.ABI5_ORACLE_SOURCE_OWNER_ROOT??fileURLToPath(new URL('../../',import.meta.url)));
  const f=await rustServiceMechanicalFixture(t),old=f.event,newRun='run://controlled/resumed',ref='invocation-admission://controlled/resumed';
  old.payload.resultRef='result://controlled/old';old.payload.resultDigest=product.sha256Canonical(old.payload.value);
  const tuple={resultRef:old.payload.resultRef,resultDigest:old.payload.resultDigest,cCallRef:old.aggregateId};
  const admission={invocationAdmissionRef:ref,sourceResultBasis:{sourceResultContractRef:runtime.product.governanceContract('state'),
    sourceResultValue:{kind:'governance_work_state',observations:[tuple],synthesis:null}}};
  const run={kind:'run_segment_opened',aggregateId:newRun,payload:{invocationAdmissionRef:ref}};
  const events=[old,run],owner={...f.input.observationOwner,runId:newRun};
  // These four owner-operation doubles are explicit lower premises: this test
  // exercises the real installed immutable membership owner and consumer,
  // not native source admission or actual resumed-UAT authority. The previous
  // test exercises the actual cold/authentication/admission refusal boundary.
  const bound={...runtime,abg:{...runtime.abg,readRuntimeEventsAtDurablePrefix:()=>events,
    selectValidatedRuntimeEventPrefix:()=>({}),rehydrateInvocationAdmissionAtPrefix:()=>admission,
    hasInvocationRunBindingAtPrefix:()=>true}};
  const selected=commandObservationSourceUse(bound,{},events,owner);
  assert.equal(selected(old),true);assert.equal(selected(structuredClone(old)),false,'copied event identity is never inherited');
  const inherited=await f.evaluate({events:[old],observationOwner:owner,validateSourceObservation:selected});
  assert.equal(inherited.disposition,'satisfied','mechanical evaluator joins only the selected earlier observation premise');
  assert.equal((await f.evaluate({events:[old],observationOwner:owner})).disposition,'indeterminate','absence of source proof remains fail closed');
  for(const key of ['resultRef','resultDigest','cCallRef']) {
    const bad=structuredClone(old);bad.payload[key]=key==='resultDigest'?product.sha256Canonical('wrong'):'foreign';
    const rows=[bad,run],api={...bound,abg:{...bound.abg,readRuntimeEventsAtDurablePrefix:()=>rows}};
    assert.equal(commandObservationSourceUse(api,{},rows,owner)(bad),false,key+' cannot cross the retained tuple');
  }
  for(const change of [event=>event.graphFunctionRef='graph-function://foreign',event=>event.payload.contractRef='contract://foreign',
    event=>event.aggregateId='c-call:foreign',event=>event.payload.resultClass='failure']) {
    const bad=structuredClone(old);change(bad);const rows=[bad,run];
    assert.equal(commandObservationSourceUse({...bound,abg:{...bound.abg,readRuntimeEventsAtDurablePrefix:()=>rows}},{},rows,owner)(bad),false);
  }
  for(const projected of [null,{...admission,sourceResultBasis:null},
    {...admission,sourceResultBasis:{...admission.sourceResultBasis,sourceResultValue:{kind:'governance_work_state',observations:[],synthesis:null}}}]) {
    const api={...bound,abg:{...bound.abg,rehydrateInvocationAdmissionAtPrefix:()=>projected}};
    assert.equal(commandObservationSourceUse(api,{},events,owner)(old),false);
  }
  assert.equal(commandObservationSourceUse({...bound,abg:{...bound.abg,hasInvocationRunBindingAtPrefix:()=>false}},{},events,owner)(old),false);
  assert.equal(commandObservationSourceUse({...bound,abg:{...bound.abg,readRuntimeEventsAtDurablePrefix:()=>[...events,run]}},{},events,owner)(old),false);
  const invalid=await f.evaluate({events:[old],observationOwner:owner,validateSourceObservation:selected,validateObservation:()=>false});
  assert.equal(invalid.disposition,'indeterminate','source membership cannot replace the published C2 judgment');
  const red=structuredClone(old);red.payload.value.commandResults[0].exitStatus=7;
  const badCommand=await f.evaluate({events:[red],observationOwner:owner,validateSourceObservation:event=>event===red});
  assert.equal(badCommand.criteria.find(row=>row.id.startsWith('execution:')).disposition,'unmet','the unchanged execution guard retains red');
  const fresh={...old,runId:newRun};
  assert.equal((await f.evaluate({events:[fresh],observationOwner:owner})).disposition,'satisfied','ordinary current-Run behavior does not need historical support');
});
test('Caller execution policy omits optional actor caps, retains explicit positive flags and rejects invalid caps',async()=>{
  const scratch=await newArchive(policyUnits,'optional-actor-bounds');
  const base=await configuration(fileURLToPath(new URL('./config.example.json',import.meta.url)));
  base.provider.enabled=true;base.provider.model='claude-opus-5-5';base.provider.inheritEnvironment=[];
  const variants=[{}, {maxTurns:100}, {maxBudgetUsd:12.5}, {maxTurns:100,maxBudgetUsd:12.5}];
  for(const [i,bounds]of variants.entries()) {
    const config={...base,provider:{...base.provider,...bounds}},path=join(scratch.path,'valid-'+i+'.json');
    await writeFile(path,JSON.stringify(config)+'\n',{flag:'wx'});
    const selected=await configuration(path),environment=workerEnvironment(selected),args=JSON.parse(environment.ABG_TS_CLAUDE_APPEND_ARGS);
    assert.equal(args.includes('--max-turns'),Object.hasOwn(bounds,'maxTurns'));
    assert.equal(args.includes('--max-budget-usd'),Object.hasOwn(bounds,'maxBudgetUsd'));
    if(bounds.maxTurns)assert.equal(args[args.indexOf('--max-turns')+1],'100');
    if(bounds.maxBudgetUsd)assert.equal(args[args.indexOf('--max-budget-usd')+1],'12.5');
    assert.equal(args.includes('undefined'),false);
    assert.equal(environment.ABG_TS_FP_TIMEOUT_MS,String(selected.provider.inactivityTimeoutMs));
    assert.equal(environment.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS,String(selected.provider.absoluteTimeoutMs));
    assert.deepEqual(selected.package,base.package);assert.deepEqual(selected.toolchains,base.toolchains);
  }
  for(const [i,bounds]of [{maxTurns:0},{maxTurns:1.5},{maxBudgetUsd:0},{maxBudgetUsd:null}].entries()) {
    const path=join(scratch.path,'invalid-'+i+'.json');await writeFile(path,JSON.stringify({...base,provider:{...base.provider,...bounds}})+'\n',{flag:'wx'});
    await assert.rejects(configuration(path),/positive|budget/u);
  }
});
test('Caller execution policy preserves acquired meaning and all command fields except explicit effective timeout; canonical C2 budget fits',async()=>{
  const {root,rows}=await loadScenarios(fixtures),selected=await acquireScenario(root,rows.find(row=>row.key==='data-mapper-full'));
  const original=JSON.stringify(selected.request),command=selected.request.testing.commands[0];
  const effective=applyCommandTimeoutOverrides(selected.request,{[command.commandId]:18000000});
  const expected=structuredClone(command);expected.timeoutMs=18000000;
  assert.deepEqual(effective.testing.commands[0],expected);
  assert.equal(JSON.stringify(selected.request),original);
  assert.deepEqual(effective.testing.outcomePredicates,selected.request.testing.outcomePredicates);
  assert.deepEqual(effective.assessment,selected.request.assessment);assert.equal(effective.task,selected.request.task);
  for(const [purpose,order]of Object.entries(selected.request.workOrders)) {
    const next=effective.workOrders[purpose];
    assert.deepEqual(next.instructions.slice(0,-1),order.instructions);
    assert.match(next.instructions.at(-1),/Latest user-authorized execution timing.*18000000/u);
    for(const key of ['outcome','readFirst','writeRoots','checks'])assert.deepEqual(next[key],order[key]);
  }
  const input=constructWorkloadInput(product,{...selected,request:effective},assessmentSelection,{sbt:{executable:'/selected/sbt'}});
  assert.deepEqual(input.observations,[]);assert.equal(input.synthesis,null);assert.equal(input.terminal,false);
  assert.equal(input.original.testing.commands[0].timeoutMs,18000000);
  const budget=c2.projectWorksiteCommandExecutionBudget(input.original.testing);
  assert.equal(budget.requiredExecutionBudgetMs,18015000);
  assert.equal(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,{inactivityTimeoutMs:18030000,absoluteTimeoutMs:18040000}),true);
  assert.throws(()=>applyCommandTimeoutOverrides(selected.request,{foreign:18000000}),/no declared command/u);
});

async function suppliedWorkFixture() {
  const scratch=await newArchive(policyUnits,'supplied-work'),from=join(scratch.path,'old'),fresh=join(scratch.path,'fresh');await mkdir(from);await mkdir(fresh);
  const {root,rows}=await loadScenarios(fixtures),selected=await acquireScenario(root,rows.find(row=>row.key==='data-mapper-full'));
  const worksite=join(from,'sandbox/worksite');await mkdir(worksite,{recursive:true});
  const files=[];const put=async(path,bytes)=>{bytes=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes,{flag:'wx'});files.push({path,sha256:digest(bytes).slice(7),byteCount:bytes.length});};
  for(const source of selected.sources)await put(fixturePath(worksite,source.path),source.bytes);
  // Controlled frozen-file receipts exercise transfer mechanics only. They
  // contain no claimed native assessment, old producer or app solution.
  const retained=['intent','product','goals','requirements','uat-testcases','testcase-authority','scenario'].map(x=>'specification/'+x+'.md').concat(['design/feature-decomposition.md','design/module-design.md']);
  for(const p of retained)await put(fixturePath(worksite,p),'controlled retained unit material: '+p+'\n');
  await put(join(from,'SEALED.json'),JSON.stringify({retained:true,archiveRoot:from,status:'refused'}));
  await put(join(from,'run.json'),JSON.stringify({scenario:selected.row}));
  await put(join(from,'workload-source.json'),JSON.stringify({request:selected.request}));
  await put(join(from,'resources/events/runtime.events.jsonl'),'controlled old history, never imported as runtime truth\n');
  const observationPath=join(scratch.path,'observation.json'),freezePath=join(scratch.path,'freeze.json');
  const observation={archive:from,retainedAuthorFiles:retained.map(p=>({path:p,byteCount:files.find(x=>x.path===fixturePath(worksite,p)).byteCount})),trace:['controlled old producer: must not enter new input']};
  const persist=async()=>{const obs=Buffer.from(JSON.stringify(observation)),fr=Buffer.from(JSON.stringify({ledger:files}));await writeFile(observationPath,obs);await writeFile(freezePath,fr);return {resumeEvidence:{observation:{path:observationPath,digest:digest(obs)},freeze:{path:freezePath,digest:digest(fr)}}};};
  const config=await persist();for(const source of selected.sources){const p=fixturePath(fresh,source.path);await mkdir(dirname(p),{recursive:true});await writeFile(p,source.bytes,{flag:'wx'});}
  return {scratch,from,fresh,worksite,selected,files,observation,config,persist};
}
test('Fresh supplied work transfers exact retained material into source-none empty owner state without old archive or producer changes',async()=>{
  const f=await suppliedWorkFixture(),before=new Map(await Promise.all(f.files.map(async p=>[p.path,digest(await readFile(p.path))])));
  const material=await acquireResumeMaterial(f.config,f.from,f.selected),records=[];
  const provenance=await transferResumeMaterial(material,f.fresh,async(path,value)=>records.push({path,value}));
  assert.equal(provenance.transferred.length,9);assert.equal(provenance.originalSources.length,4);
  assert.equal(provenance.invocationSource,'none');assert.equal(provenance.oldObservationsImported,false);assert.equal(provenance.oldProducerCreditImported,false);
  assert.equal(records.length,1);
  for(const p of provenance.transferred)assert.equal(digest(await readFile(fixturePath(f.fresh,p.path))),p.digest);
  for(const p of f.files)assert.equal(digest(await readFile(p.path)),before.get(p.path));
  const state=constructWorkloadInput(product,f.selected,assessmentSelection,{sbt:{executable:'/selected/sbt'}});
  assert.deepEqual(state.observations,[]);assert.equal(state.synthesis,null);
  assert.deepEqual(state.original.workOrders,f.selected.request.workOrders);
  assert.deepEqual(state.unresolvedSupportRefs,f.selected.request.requiredSupportRefs);
  await assert.rejects(transferResumeMaterial(material,f.worksite,async()=>assert.fail('No old record writes')),/separate new worksite/u);
});
test('Resume refuses changed pins, symlinks, unauthorized paths and existing destinations before file transfer',async()=>{
  const f=await suppliedWorkFixture(),first=f.observation.retainedAuthorFiles[0],path=fixturePath(f.worksite,first.path),bytes=await readFile(path);
  await writeFile(path,Buffer.concat([bytes,Buffer.from('changed')]));await assert.rejects(acquireResumeMaterial(f.config,f.from,f.selected),/digest mismatch/u);await writeFile(path,bytes);
  const outside=join(f.scratch.path,'outside');await writeFile(outside,bytes,{flag:'wx'});await rm(path);await symlink(outside,path);
  await assert.rejects(acquireResumeMaterial(f.config,f.from,f.selected),/regular file without symlinks/u);await rm(path);await writeFile(path,bytes,{flag:'wx'});
  const saved=first.path;first.path='source/data-mapper-full/source.original.txt';const denied=await f.persist();
  await assert.rejects(acquireResumeMaterial(denied,f.from,f.selected),/outside its original grant/u);first.path=saved;const valid=await f.persist();
  const material=await acquireResumeMaterial(valid,f.from,f.selected),target=fixturePath(f.fresh,saved);await mkdir(dirname(target),{recursive:true});await writeFile(target,'existing preserved material',{flag:'wx'});
  await assert.rejects(transferResumeMaterial(material,f.fresh,async()=>assert.fail('No transfer record')),/cannot overwrite/u);
  assert.equal(await readFile(target,'utf8'),'existing preserved material');
  await assert.rejects(readFile(fixturePath(f.fresh,'specification/product.md')),error=>error.code==='ENOENT');
});
test('Resume selection requires one explicit source archive and cannot be activated by ordinary run flags',async()=>{
  await assert.rejects(main(['resume','--case','data-mapper-full']),/explicit --from/u);
  await assert.rejects(main(['resume','--from','unused','--all']),/one --case/u);
  await assert.rejects(main(['run','--from','unused']),/only supported for resume/u);
});
test('Seven exact original workloads authenticate source, request and independent oracle before use',async()=>{
  const {root,rows}=await loadScenarios(fixtures);
  for(const row of rows)assert.ok((await acquireScenario(root,row)).sources.length>0);
  assert.equal(selectScenarios(rows,{all:true}).length,7);
  assert.throws(()=>selectScenarios(rows,{caseKey:'invented'}));
  const altered={...rows[0],acquisitionDigests:rows[0].acquisitionDigests.map((pin,i)=>i===0?{...pin,digest:'sha256:'+'0'.repeat(64)}:pin)};
  await assert.rejects(acquireScenario(root,altered),/Acquisition digest mismatch/u);
  assert.throws(()=>fixturePath(root,'../foreign'),'Fixture paths must stay owned');
});
test('Resolved toolchain identity and configured environment flow into the canonical owner carrier',async()=>{
  const {root,rows}=await loadScenarios(fixtures),selected=await acquireScenario(root,rows.find(row=>row.key==='data-mapper-full'));
  const request=structuredClone(selected.request);request.testing.commands[0].environment.JAVA_HOME='/old/source/jdk';
  const received=[];
  const input=constructWorkloadInput({constructGovernanceWorkState:value=>{received.push(value);return value;}},{...selected,request},{},
    {sbt:{executable:'/selected/sbt',environment:{JAVA_HOME:'/selected/jdk'}}});
  assert.equal(input.testing.commands[0].executable,'/selected/sbt');
  assert.equal(input.testing.commands[0].environment.JAVA_HOME,'/selected/jdk');
  assert.deepEqual(input.sources,selected.sources.map(({path,digest})=>({path,digest})));
  assert.deepEqual(input.requiredSupportRefs,request.requiredSupportRefs);
  assert.equal(received.length,1);
});
test('Archive paths are unique and failed subprocess streams survive before any assertion or teardown',async()=>{
  const first=await newArchive(archives,'archive-negative'),second=await newArchive(archives,'archive-negative');
  assert.notEqual(first.path,second.path);
  await exclusiveRecord(first.path,'identity.json',{scenario:'archive-negative'});
  await assert.rejects(exclusiveRecord(first.path,'identity.json',{overwritten:true}),error=>error.code==='EEXIST');
  const command=commandRecorder(first.path,{environment:{PATH:process.env.PATH},timeoutMs:10000});
  const failure=await command('actual-failure',process.execPath,['-e','process.stdout.write("retained-out");process.stderr.write("retained-error");process.exit(7);']);
  assert.equal(failure.exitCode,7);
  assert.equal(await readFile(join(first.path,'commands/actual-failure.stdout'),'utf8'),'retained-out');
  assert.equal(await readFile(join(first.path,'commands/actual-failure.stderr'),'utf8'),'retained-error');
});
test('Archived judgment conserves acquired module, manifest and rubric despite later ambient edits; tampering refuses',async()=>{
  const original=await loadScenarios(fixtures),row=selectScenarios(original.rows,{caseKey:'basic-cli'})[0];
  const acquired=await acquireScenario(original.root,row);
  const archive=await newArchive(archives,'oracle-drift'),ambient=join(archive.path,'ambient'),worksiteRoot=join(archive.path,'worksite');
  await mkdir(ambient);await mkdir(worksiteRoot);
  await writeFile(join(ambient,'scenarios.json'),original.manifestBytes,{flag:'wx'});
  for(const asset of acquired.assets) {
    const path=fixturePath(ambient,asset.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,asset.bytes,{flag:'wx'});
  }
  for(const source of acquired.sources) {
    const path=fixturePath(worksiteRoot,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});
  }
  const selectedFixtures=await loadScenarios(ambient),selected=await acquireScenario(ambient,row);
  const input={worksiteRoot,runArchive:archive.path,source:row,request:selected.request,events:[]};
  const expected=await (await import(pathToFileURL(fixturePath(original.root,row.oracleModule)).href)).evaluate(input);
  // Change every ambient acceptance reader after acquisition and before the
  // snapshot. The snapshot must use held authenticated bytes, not rereads.
  await writeFile(fixturePath(ambient,row.oracleModule),'export async function evaluate(){return {disposition:"satisfied",reason:"ambient module replacement"};}\n');
  const changedRubric=JSON.parse(selected.assets.find(asset=>asset.path===row.oracleFile).bytes.toString('utf8'));
  changedRubric.requiredArtifacts.push('ambient-only-criterion.md');
  await writeFile(fixturePath(ambient,row.oracleFile),JSON.stringify(changedRubric)+'\n');
  await writeFile(join(ambient,'scenarios.json'),'{}\n');
  const snapshot=await snapshotScenario(selectedFixtures,selected,archive.path);
  assert.deepEqual(await readFile(join(snapshot.root,'scenarios.json')),original.manifestBytes);
  assert.equal(snapshot.assets.length,row.acquisitionDigests.length);
  const archived=await acquireArchivedScenario(snapshot);
  const checker=await import(pathToFileURL(fixturePath(snapshot.root,archived.row.oracleModule)).href);
  assert.deepEqual(await checker.evaluate(input),expected);
  assert.equal(expected.criteria.some(criterion=>criterion.id==='artifact:ambient-only-criterion.md'),false);
  await assert.rejects(acquireScenario(ambient,row),/Acquisition digest mismatch/u);
  await writeFile(fixturePath(snapshot.root,row.oracleFile),JSON.stringify(changedRubric)+'\n');
  await assert.rejects(acquireArchivedScenario(snapshot),/Acquisition digest mismatch/u);

  const config=await configuration(fileURLToPath(new URL('./config.example.json',import.meta.url)));
  for(const [name,sourceCommit] of [['absent',undefined],['blank','   ']]) {
    const path=join(archive.path,name+'.config.json');await writeFile(path,JSON.stringify({...config,sourceCommit})+'\n',{flag:'wx'});
    await assert.rejects(configuration(path),/Explicit nonempty sourceCommit/u);
  }
});
test('Both retained install roots are checked before dispatch and before fresh reads; missing or false owner results refuse',async()=>{
  // Controlled Product checker outputs exercise the caller barrier. The
  // independent review separately proves the real exported byte checker.
  const installations=['abg','consumer'].map(name=>({installId:name,installedRoot:'/controlled/'+name,
    packageName:name,productId:'product://controlled/'+name,admissionEventRef:'event://controlled/'+name,
    artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),manifestDigest:'sha256:'+'3'.repeat(64)}));
  for(const failure of [null,...['before-run','after-run'].flatMap(phase=>['abg','consumer'].map(installId=>({phase,installId,value:false}))),
    {phase:'after-run',installId:'consumer',value:undefined}]) {
    const steps=[],records=[];let phase='before-run',freshReaderExecuted=false;
    const caller={installedRoot:installations[0].installedRoot,
      runtime:{product:{async installedProductContentMatches(install){
        assert.ok(installations.includes(install));steps.push('check:'+phase+':'+install.installId);
        return failure?.phase===phase&&failure.installId===install.installId?failure.value:true;
      }}},
      async record(path,record){steps.push('record:'+record.phase);records.push({path,record});},
      async invoke(label){assert.equal(label,'lifecycle-start');steps.push('dispatch');phase='after-run';return {kind:'controlled-completion'};}};
    const consume=async()=>{const result=await invokeLifecycle(caller,installations,{kind:'controlled-call'},{});steps.push('fresh-read');freshReaderExecuted=true;return result;};
    if(failure) {
      await assert.rejects(consume(),error=>error.stage==='installed-content-'+failure.phase);
      assert.equal(freshReaderExecuted,false);
      assert.equal(steps.includes('dispatch'),failure.phase==='after-run');
      assert.equal(records.at(-1).record.observations.find(row=>row.installId===failure.installId).contentMatches,false);
    }else {
      assert.deepEqual(await consume(),{kind:'controlled-completion'});
      assert.equal(freshReaderExecuted,true);
    }
    const expected=['check:before-run:abg','check:before-run:consumer','record:before-run'];
    if(failure?.phase!=='before-run')expected.push('dispatch','check:after-run:abg','check:after-run:consumer','record:after-run');
    if(!failure)expected.push('fresh-read');
    assert.deepEqual(steps,expected);
    assert.equal(records.every(row=>row.record.observations.length===2),true);
  }
});

async function rustServiceMechanicalFixture(t) {
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-rust-oracle-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const {root,rows}=await loadScenarios(fixtures),row=rows.find(row=>row.key==='rust-service'),selected=await acquireScenario(root,row);
  const rubric=JSON.parse(selected.assets.find(asset=>asset.path===row.oracleFile).bytes.toString('utf8'));
  const joinedSource='import path from "node:path";\nconst SOURCE=path.join(WORKSITE,"src","service.rs");\n';
  for(const source of selected.sources) {
    const path=fixturePath(scratch,source.path);await mkdir(dirname(path),{recursive:true});await writeFile(path,source.bytes,{flag:'wx'});
  }
  for(const artifact of rubric.requiredArtifacts) {
    const path=fixturePath(scratch,artifact);await mkdir(dirname(path),{recursive:true});
    await writeFile(path,rubric.requiredTestFiles.includes(artifact)?joinedSource:'controlled artifact-existence premise\n',{flag:'wx'});
  }
  // Only owner validation is a controlled premise for this pure evaluator
  // test. These data are never executed or admitted, and supply no semantic
  // UAT judgment. Retained real C2 evidence is re-evaluated separately.
  const owner={graphFunctionRef:product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef,
    outputContractRef:product.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,resultClass:'success',runId:'run://controlled/oracle'};
  const commands=selected.request.testing.commands.map(command=>({...command,
    environment:Object.entries(command.environment??{}).map(([name,value])=>({name,value}))}));
  const value={kind:'worksite_command_execution_observation',observationRef:'worksite-command-observation://controlled/oracle',
    task:{commands},commandResults:commands.map(command=>({...command,kind:'worksite_command_result',reports:[],
      observationRef:'worksite-command-result://controlled/'+command.commandId,observationDigest:product.sha256Canonical(command),
      timedOut:false,terminationConfirmed:true,exitStatus:0,
      stdout:{encoding:'base64',payload:Buffer.from('# pass 4\n# fail 0\n').toString('base64')},stderr:{encoding:'base64',payload:''}}))};
  const cCallRef='c-call:controlled-oracle',event={kind:'c_call_result_admitted',graphFunctionRef:owner.graphFunctionRef,runId:owner.runId,
    aggregateId:cCallRef,payload:{contractRef:owner.outputContractRef,resultClass:'success',valueKind:value.kind,cCallRef,value}};
  const checker=await import(pathToFileURL(fixturePath(root,row.oracleModule)).href);
  const input={worksiteRoot:scratch,runArchive:scratch,source:row,request:selected.request,events:[event],observationOwner:owner,validateObservation:()=>true};
  return {scratch,row,selected,rubric,joinedSource,event,input,evaluate:overrides=>checker.evaluate({...input,...overrides})};
}

test('Rust-service mechanical oracle preserves coordinate spelling independence without inventing semantic UAT',async t=>{
  const fixture=await rustServiceMechanicalFixture(t),joined=await fixture.evaluate();
  assert.equal(joined.disposition,'satisfied');
  assert.equal(joined.criteria.some(row=>row.id.startsWith('service-test-contract:')),false);
  for(const path of fixture.rubric.requiredTestFiles)await writeFile(fixturePath(fixture.scratch,path),
    '// rustc src/service.rs 127.0.0.1 fetch( status Hello, world!\n'+fixture.joinedSource);
  assert.deepEqual(await fixture.evaluate(),joined);
  assert.equal(Object.hasOwn(fixture.input,'assessment'),false);
  // Magic role words cannot replace the missing admitted execution premise.
  const absent=await fixture.evaluate({events:[]});
  assert.equal(absent.disposition,'indeterminate');
  assert.equal(absent.criteria.find(row=>row.id==='original-test-floor').disposition,'indeterminate');
});

test('Rust-service mechanical oracle conserves admission, execution, source, artifact and pass-floor guards',async t=>{
  const fixture=await rustServiceMechanicalFixture(t);
  assert.equal((await fixture.evaluate()).disposition,'satisfied');
  for(const override of [{events:[]},{observationOwner:{...fixture.input.observationOwner,runId:'run://controlled/foreign'}},
    {validateObservation:()=>false}])assert.equal((await fixture.evaluate(override)).disposition,'indeterminate');
  const failed=structuredClone(fixture.event);failed.payload.value.commandResults[0].exitStatus=7;
  const failure=await fixture.evaluate({events:[failed]});
  assert.equal(failure.disposition,'unmet');
  assert.equal(failure.criteria.find(row=>row.id.startsWith('execution:')).disposition,'unmet');
  const shallow=structuredClone(fixture.event);shallow.payload.value.commandResults.at(-1).stdout.payload=Buffer.from('# pass 1\n').toString('base64');
  const belowFloor=await fixture.evaluate({events:[shallow]});
  assert.equal(belowFloor.disposition,'unmet');
  assert.equal(belowFloor.criteria.find(row=>row.id==='original-test-floor').disposition,'unmet');
  const protectedSource=fixture.selected.sources[0],sourcePath=fixturePath(fixture.scratch,protectedSource.path);
  await writeFile(sourcePath,Buffer.concat([protectedSource.bytes,Buffer.from('\nchanged\n')]));
  const changed=await fixture.evaluate();
  assert.equal(changed.disposition,'unmet');
  assert.equal(changed.criteria.find(row=>row.id==='original-source:'+protectedSource.path).disposition,'unmet');
  await writeFile(sourcePath,protectedSource.bytes);
  const missing=fixture.rubric.requiredArtifacts[0];await rm(fixturePath(fixture.scratch,missing));
  const incomplete=await fixture.evaluate();
  assert.equal(incomplete.disposition,'unmet');
  assert.equal(incomplete.criteria.find(row=>row.id==='artifact:'+missing).disposition,'unmet');
});

test('Caller run-environment support is canonical, strictly contained and admitted by the existing resource owner',async t=>{
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-caller-environment-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const archiveRoot=join(scratch,'archive');await mkdir(archiveRoot);
  const hash=product.sha256Canonical,artifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,
    packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:hash('controlled-artifact'),
    productContentDigest:hash('controlled-content'),productManifestDigest:hash('controlled-manifest')};
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(artifact);
  const publication=consumerDeclaration(gtl,product,library,12),program=publication.programs[0];
  const graphFunctions=[...publication.graphFunctions,...gtl.constructNativeWorkspaceWorkModulePublication(artifact).graphFunctions,
    ...gtl.constructWorksiteCommandExecutionModulePublication(artifact).graphFunctions];
  const actorRef='actor://controlled/uat-caller',authority={actorRef,authorityRef:'authority://controlled/uat-caller',authorityDigest:hash('controlled-authority')};
  const packet=product.RUN_OPERATION_CONTRACTS.invoke.start;
  // Resolution, authority and Public transport are controlled premises. The
  // actual caller, canonical resources constructor and containment owner run.
  let supplied;
  const caller={root:scratch,installedRoot:fileURLToPath(new URL('../../',import.meta.url)),actorRef,config:{runId:'controlled-environment'},
    state:{binding:{ref:'binding://controlled',digest:hash('binding')},resolvedLock:{lockId:'lock://controlled',lockDigest:hash('lock')},
      catalog:{basisDigest:hash('catalog'),boundPublications:[publication]},catalogView:{viewDigest:hash('view'),allowlist:[IDS.graphFunctionRef]}},
    native:{verified:{definitionContractCoordinates:{operations:[{operationId:packet.definitionKey.operationId,
      members:[{memberKey:packet.definitionKey.memberKey,slots:{request:{contractCatalog:null}}}]}]}}},
    runtime:{product:{...product,
      ProductExecutionResolutionPort:{async resolve(){return {kind:'loaded_product_execution_resolution',productSemantics:null,program,
        programValidation:{executableLeafRows:[]},selectedCatalogEntry:null,
        resolution:{inputContract:{contractRef:'contract://controlled/input'},inputContractDigest:hash('input-contract'),
          programRef:program.programRef,programDigest:hash(program)}};}},
      admitInstalledProductInput:()=>true,
      constructRootInvocationPolicy:()=>({policyRef:'policy://controlled',policyDigest:hash('policy')}),
      constructCapabilityGrant:()=>({grantRef:'grant://controlled',grantDigest:hash('grant')}),
      constructInvocationAuthority:()=>authority},
      abg:{hasAdmittedProductInstall:()=>true},api:{constructInstalledPublicDefinitionCall(value){supplied=value;return value;}}},
    refresh:()=>({productInstalls:[],workspaceBinding:{roots:{archiveRoot}}}),reopen:()=>({kind:'controlled-event-resource'})};
  await constructLifecycleCall(caller,{kind:'controlled-input'});
  assert.deepEqual(supplied.request.sourceBasis,{kind:'none'});
  assert.deepEqual(supplied.resources.source,{kind:'none'});
  const resources=supplied.resources.runEnvironmentResources,temporaryRoot=resources.temporaryRoot;
  assert.notEqual(temporaryRoot,archiveRoot);
  assert.equal(temporaryRoot,await realpath(join(archiveRoot,'run-environment-support')));
  assert.equal((await stat(temporaryRoot)).isDirectory(),true);
  assert.equal(resources.permission.temporaryRoot,temporaryRoot);
  const input={publication,program,graphFunctions,authority,archiveRoot,resources};
  assert.equal((await product.observeRunEnvironment(input)).kind,'run_environment_observed');
  for(const forbiddenRoot of [archiveRoot,scratch]) {
    const denied=structuredClone(resources);denied.temporaryRoot=forbiddenRoot;denied.permission.temporaryRoot=forbiddenRoot;
    const observed=await product.observeRunEnvironment({...input,resources:product.constructRunEnvironmentResources(denied)});
    assert.deepEqual(observed,{kind:'run_environment_refusal',cause:'access_not_permitted',issuePath:'/runEnvironmentResources/permission'});
  }
});

test('Native refusal without an admitted Run is preserved before any refresh, reopen or read',async()=>{
  const touched=()=>assert.fail('No runtime or read activity is permitted without an admitted Run');
  const caller={get runtime(){return touched();},refresh:touched,reopen:touched,invoke:touched};
  const ownerOutput={outcomeKind:'refusal',value:{code:'invalid_capability',issuePaths:['/invocationAuthority'],evidenceRefs:[]}};
  await assert.rejects(freshReadbacks(caller,{receipt:{resources:{run:null},ownerOutput}}),error=>{
    assert.equal(error.stage,'lifecycle-start');assert.deepEqual(error.observation,ownerOutput);return true;
  });
  await assert.rejects(freshReadbacks(caller,{receipt:{resources:{run:null},ownerOutput:{outcomeKind:'result',value:null}}}),error=>{
    assert.equal(error.stage,'readback-source');assert.equal(error.observation,'No admitted Run coordinate');return true;
  });
});

test('Admitted failed and blocked Runs retain both fresh reads and unchanged event bytes',async t=>{
  const scratch=await realpath(await mkdtemp(join(tmpdir(),'abi5-uat-caller-readbacks-')));
  t.after(()=>rm(scratch,{recursive:true,force:true}));
  const hash=product.sha256Canonical;
  for(const status of ['failed','blocked']) {
    const eventPath=join(scratch,status+'.events.jsonl'),bytes=Buffer.from('controlled admitted '+status+' Run premise\n');
    await writeFile(eventPath,bytes,{flag:'wx'});
    const prefix={eventLogRef:pathToFileURL(eventPath).href,coordinateDigest:hash(status)},calls=[];
    // Run admission and Public projection are controlled premises. The actual
    // two-read caller uses canonical read packets and checks physical bytes.
    const caller={root:scratch,installedRoot:'/controlled/installed',actorRef:'actor://controlled/readback',config:{runId:status},
      state:{binding:{ref:'binding://controlled',digest:hash('binding')},closeHandoff:{prefix}},native:{verified:{definitionContractCoordinates:null}},contractCatalog:null,
      runtime:{product:{...product,constructCapabilityGrant:()=>({grantRef:'grant://controlled',grantDigest:hash('grant')})},abg,
        api:{constructInstalledPublicDefinitionCall:value=>value}},
      refresh:()=>({workspaceAuthorityBasis:null,productInstalls:[],workspaceBinding:{lockId:'lock://controlled',lockDigest:hash('lock')}}),
      reopen:()=>({kind:'controlled-event-resource'}),
      async invoke(memberKey,call){
        calls.push({memberKey,call});
        return {receipt:{ownerOutput:memberKey==='run_result'?{outcomeKind:'refusal',value:{code:'absent_terminal_result'}}:
          {outcomeKind:'result',value:{projection:{status,terminalResult:null}}}}};
      }};
    const ownerOutput=status==='failed'?{outcomeKind:'refusal',value:{code:'controlled_failure'}}:
      {outcomeKind:'result',value:{kind:'governance_work_state',terminal:false}};
    const run={ref:'run://controlled/'+status,digest:hash(status)};
    const execution={receipt:{exitCode:1,resources:{run},ownerOutput},call:{invocation:{invocationAuthority:{slots:{}}}}};
    const reads=await freshReadbacks(caller,execution);
    assert.deepEqual(calls.map(row=>row.memberKey),['run_result','run_replay']);
    assert.equal(reads.length,2);assert.equal(reads[0].ownerOutput.outcomeKind,'refusal');assert.equal(reads[1].projection.status,status);
    for(const {memberKey,call}of calls) {
      assert.equal(call.operationId,abg.ABG_PROJECT_READ_CONTRACTS[memberKey].definitionKey.operationId);
      assert.deepEqual(call.request.source,{sourceKind:'run',sourceRef:run.ref,sourceDigest:run.digest});
    }
    assert.deepEqual(await readFile(eventPath),bytes);assert.deepEqual(caller.state.closeHandoff.prefix,prefix);
  }
});
