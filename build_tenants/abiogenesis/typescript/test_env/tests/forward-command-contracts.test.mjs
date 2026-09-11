import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {product as p,gtl,declarations,retainedSource,carrierTask,packageRoot,hash} from '../support/forward-command-harness.mjs';
import {observationFor} from '../support/forward-observation-carrier.mjs';
import {ABI5_PRODUCT_SEMANTICS as semantics} from '../../build/code/src/product/builtin_semantics.js';
const F=p.WORKSITE_COMMAND_FORWARD_IDS;

test('native whole-Program validator accepts exactly prepare plus nested C2, with no historical call rights',()=>{
  const h=declarations(),valid=h.validate();assert.equal(valid.disposition,'valid',JSON.stringify(valid));
  assert.equal(valid.executableLeafRows.length,2);
  assert.deepEqual(h.program.callableMembership,[F.graphFunctionRef,F.childGraphFunctionRef].sort());
  assert.equal(h.program.starts.length,1);assert.equal(h.program.starts[0].graphFunctionRef,F.graphFunctionRef);
  assert.deepEqual(valid.executableLeafRows.map(r=>r.fibre).sort(),['F_D','F_P']);
  assert.ok(h.publication.graphFunctions.every(g=>gtl.isWorksiteCommandForwardGraphFunction(g)));
  for(const g of h.publication.graphFunctions)assert.deepEqual(g.effects,[]);
});

test('native validator rejects crossed raw/output and child closure; exact declaration owner refuses extra calls',()=>{
  const h=declarations(),raw=h.raw;
  for(const mutate of [g=>{g.declarations['abg.raw_result_contract']=F.observationContractRef;g.environment.carries=[F.observationContractRef];},
    g=>{g.declarations['abg.child_closure_contract']=F.closureContractRef;}]){
    const graphs=structuredClone(h.publication.graphFunctions),child=graphs.find(g=>g.name===F.childGraphFunctionRef);mutate(child);
    const verdict=h.validate(input=>({...input,graphFunctions:graphs.map(g=>raw(g,'graph_function'))}));
    assert.equal(verdict.disposition,'invalid',JSON.stringify(verdict));
    assert.equal(gtl.isWorksiteCommandForwardGraphFunction(child),false);
  }
  const extra=structuredClone(h.publication.graphFunctions[0]);extra.template.nodes.push(extra.template.nodes[0]);
  assert.equal(gtl.isWorksiteCommandForwardGraphFunction(extra),false);
});

test('closed Product carriers preserve all22 real source observations; no fabricated cover qualifies native currentness',()=>{
  const {request,originalTask}=retainedSource(),task=carrierTask();
  assert.equal(p.isWorksiteCommandForwardRequest(request),true);assert.equal(p.isWorksiteCommandForwardTask(task),true);
  assert.equal(task.snapshotSources.length,22);assert.deepEqual(task.originalTask,originalTask);
  assert.deepEqual(task.commands,originalTask.commands);assert.deepEqual(task.outcomePredicates,originalTask.outcomePredicates);
  assert.deepEqual(task.allowedWriteTerritories,originalTask.allowedWriteTerritories);
  assert.deepEqual(task.sourceConstructionResult,originalTask.sourceConstructionResult);
  assert.equal(p.isWorksiteCommandExecutionTask(task),false);assert.equal(p.isWorksiteRevisionCommandExecutionTask(task),false);
  for(const row of task.snapshotSources)assert.equal(row.source.kind,'retained_construction');
});

test('missing reordered duplicate changed or crossed retained members refuse at real Product constructor',()=>{
  const task=carrierTask();
  for(const mutate of [t=>{t.snapshotSources.pop();},t=>{t.snapshotSources.reverse();},
    t=>{t.snapshotSources[1]=t.snapshotSources[0];},t=>{t.snapshotSources[0].source.kind='retained_dependency';},
    t=>{t.bindingCoverEventRefs=[];},t=>{t.snapshotSources[0].source.bindingCoverEventRefs=['foreign'];},
    t=>{t.snapshotSources[0].observation.fileIdentity='synthetic:different-inode';},
    t=>{t.originalTask.commands[0].args.push('changed');}]){
    const bad=structuredClone(task);mutate(bad);assert.equal(p.isWorksiteCommandForwardTask(bad),false);
    assert.throws(()=>p.constructWorksiteCommandForwardTask(bad));
  }
});

test('real shared helper-plan artifact acknowledgment and observation constructors bind the forward arm',()=>{
  const task=carrierTask(),row=observationFor(task,1),contracts=semantics.resolveProbabilisticWorkerContracts({
    inputContractRef:F.taskContractRef,outputContractRef:F.observationContractRef,input:task});
  assert.deepEqual(contracts,{instructionContractRef:F.taskContractRef,resultContractRef:F.workerResultContractRef});
  assert.equal(p.isWorksiteCommandForwardWorkerResult(row.acknowledgment),true);
  assert.equal(p.isWorksiteCommandExecutionWorkerResult(row.acknowledgment),false);
  assert.equal(p.isWorksiteRevisionCommandExecutionWorkerResult(row.acknowledgment),false);
  assert.deepEqual(p.constructWorksiteCommandExecutionWorkerResult(task,row.acknowledgment,row.plan),row.acknowledgment);
  const contract=declarations().publication.contracts.find(c=>c.contractRef===F.workerResultContractRef);
  assert.equal(contract.valueKind,'worksite_command_forward_worker_result');
  assert.equal(semantics.validateContractValue(contract.valueKind,row.acknowledgment),true);
  assert.equal(p.isWorksiteCommandForwardObservation(row.observation),true);
  assert.equal(row.observation.snapshotMembers.length,22);assert.ok(row.observation.commandResults.every(r=>r.exitStatus===1));
  assert.ok(row.observation.snapshotMembers.every(r=>r.kind==='worksite_command_forward_snapshot_member'&&r.source.kind==='retained_construction'));
  const schema=p.worksiteCommandExecutionWorkerResultSchema(task,row.plan);
  assert.equal(schema.additionalProperties,false);assert.equal(schema.required.length,7);
  assert.equal(new RegExp(schema.properties.helperArtifactRef.pattern).test(row.acknowledgment.helperArtifactRef),true);
});

test('raw namespaces, attempt/task/artifact and actor/tool mismatches remain refused',()=>{
  const task=carrierTask(),row=observationFor(task,1);
  for(const mutate of [r=>{r.taskRef='foreign';},r=>{r.taskDigest=hash('wrong');},r=>{r.attemptRef='wrong';},
    r=>{r.helperArtifactRef=r.helperArtifactRef.replace('worksite-command-forward-helper','worksite-command-helper');},
    r=>{r.helperArtifactRef=r.helperArtifactRef.replace('worksite-command-forward-helper','worksite-revision-command-helper');},
    r=>{r.helperArtifactDigest=hash('wrong');},r=>{r.extra=true;}]){
    const raw=structuredClone(row.acknowledgment);mutate(raw);
    assert.throws(()=>p.constructWorksiteCommandExecutionWorkerResult(task,raw,row.plan));
  }
  for(const actor of [{...row.actor,implementationRef:p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef},
    {...row.actor,toolInvocations:[]}, {...row.actor,disposition:'failure'}])
    assert.throws(()=>p.constructWorksiteExecutionObservation(task,row.acknowledgment,actor,row.artifact,row.plan));
});

test('step and terminal predicates preserve honest command failure but reject incomplete or crossed final carriers',()=>{
  const task=carrierTask(),row=observationFor(task,1),step=semantics.resolveJudgmentRelation(F.stepPredicateRef),
    terminal=semantics.resolveJudgmentRelation(F.rootPredicateRef),child=semantics.resolveJudgmentRelation(F.judgmentPredicateRef);
  assert.equal(step.evaluate(task.request,task),true);assert.equal(step.evaluate(task,row.observation),true);
  assert.equal(terminal.evaluate(task.request,row.observation),true);assert.equal(child.evaluate(task,row.observation),true);
  assert.equal(terminal.evaluate(task.request,task.request),false);assert.equal(terminal.evaluate(task.request,task),false);
  assert.equal(child.evaluate(task,task),false);assert.equal(child.evaluate(task.request,row.observation),false);
  const incomplete=structuredClone(row.observation);incomplete.commandResults=[];
  assert.equal(terminal.evaluate(task.request,incomplete),false);
  assert.equal(p.resolveWorksiteCommandExecutionJudgmentRelation(p.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef).evaluate(task,row.observation),false);
});

test('legacy task/raw schema/closed predicates and parent public/event contracts remain exact',async()=>{
  const {originalTask}=retainedSource(),row=observationFor(originalTask,1);
  const parent=path.resolve(packageRoot,'../../20260911_ABG5_ACCEPTED_SOURCE_INTEGRATION_01');
  const old=await import(path.join(parent,'work/build/code/src/product/worksite_command_execution.js'));
  assert.deepEqual(old.constructWorksiteCommandExecutionTask(originalTask),p.constructWorksiteCommandExecutionTask(originalTask));
  assert.deepEqual(old.worksiteCommandExecutionWorkerResultSchema(originalTask,row.plan),p.worksiteCommandExecutionWorkerResultSchema(originalTask,row.plan));
  assert.equal(old.isWorksiteCommandExecutionWorkerResult(row.acknowledgment),true);assert.equal(p.isWorksiteCommandForwardWorkerResult(row.acknowledgment),false);
  assert.equal(old.resolveWorksiteCommandExecutionJudgmentRelation(p.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef).evaluate(originalTask,row.observation),true);
  for(const relative of ['abg/event_store.ts','abg/replay.ts','abg/c_call.ts','abg/actor_process.ts','product/worksite_revision.ts',
    'abg/semantic_stage.ts','abg/semantic_revision.ts','product/public_contract_publication.ts']){
    const before=path.join(parent,'candidate-01/source/code/src',relative),after=path.join(packageRoot,'code/src',relative);
    assert.ok(fs.readFileSync(before).equals(fs.readFileSync(after)),relative);
  }
});
