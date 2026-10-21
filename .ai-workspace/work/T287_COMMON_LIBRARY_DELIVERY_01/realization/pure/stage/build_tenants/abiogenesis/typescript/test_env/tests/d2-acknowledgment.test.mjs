import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {load,packageRoot} from '../support/d2-bounded-harness.mjs';
import {workflowStepHarness} from '../support/d2-workflow-step-harness.mjs';

async function pair() {
  const h=await workflowStepHarness(),p=h.product;
  const entry=p.constructWorksiteCommandPreparationInput({constructionTask:h.entry.constructionTask,commands:h.entry.commands,
    outcomePredicates:h.entry.outcomePredicates,allowedWriteTerritories:h.entry.allowedWriteTerritories});
  const task=p.prepareWorksiteCommandTask({kind:'worksite_command_preparation_bound_input',schemaVersion:'5.0.0',entry,source:h.construction});
  return {h,p,old:{task,...h.observationFor(task)},revision:{task:h.task,...h.example}};
}

test('closed raw guards and real constructors accept old/old and revision/revision only',async()=>{
  const {h,p,old,revision}=await pair();
  for(const [row,own,other]of [[old,p.isWorksiteCommandExecutionWorkerResult,p.isWorksiteRevisionCommandExecutionWorkerResult],
    [revision,p.isWorksiteRevisionCommandExecutionWorkerResult,p.isWorksiteCommandExecutionWorkerResult]]) {
    assert.equal(own(row.acknowledgment),true);assert.equal(other(row.acknowledgment),false);
    assert.deepEqual(p.constructWorksiteCommandExecutionWorkerResult(row.task,row.acknowledgment,row.plan),row.acknowledgment);
    assert.deepEqual(p.constructWorksiteExecutionObservation(row.task,row.acknowledgment,row.actor,row.artifact,row.plan),row.observation);
    assert.ok(row.observation.commandResults.every(command=>command.exitStatus===1),'nonzero command remains unchanged');
  }
  for(const [row,foreign]of [[old,revision],[revision,old]]) {
    const crossed={...row.acknowledgment,helperArtifactRef:h.identity(p.worksiteExecutionIdentityPrefix(foreign.task,'helper-artifact'),row.acknowledgment.helperArtifactDigest)};
    assert.throws(()=>p.constructWorksiteCommandExecutionWorkerResult(row.task,crossed,row.plan),/acknowledgment requires/);
    const schema=p.worksiteCommandExecutionWorkerResultSchema(row.task,row.plan);
    assert.equal(new RegExp(schema.properties.helperArtifactRef.pattern).test(crossed.helperArtifactRef),false);
  }
});

test('acknowledgment refuses wrong task, digest, attempt, artifact and extra fields at the owning seam',async()=>{
  const {h,p,old,revision}=await pair();
  for(const row of [old,revision]) {
    for(const mutate of [raw=>{raw.taskRef='synthetic-unadmitted:wrong-task';},raw=>{raw.taskDigest=h.hash('wrong-task');},
      raw=>{raw.attemptRef='synthetic-unadmitted:wrong-attempt';},raw=>{raw.helperArtifactDigest=h.hash('wrong-artifact');},
      raw=>{raw.helperArtifactRef+='x';},raw=>{raw.extra='not-in-compact-carrier';}]) {
      const raw=structuredClone(row.acknowledgment);mutate(raw);
      assert.throws(()=>p.constructWorksiteCommandExecutionWorkerResult(row.task,raw,row.plan),/acknowledgment requires/);
    }
    const digest=h.hash('well-shaped but different helper artifact'),raw={...row.acknowledgment,helperArtifactDigest:digest,
      helperArtifactRef:h.identity(p.worksiteExecutionIdentityPrefix(row.task,'helper-artifact'),digest)};
    assert.deepEqual(p.constructWorksiteCommandExecutionWorkerResult(row.task,raw,row.plan),raw,'compact guard cannot claim actual artifact equality');
    assert.throws(()=>p.constructWorksiteExecutionObservation(row.task,raw,row.actor,row.artifact,row.plan),/exact helper tool invocation/,
      'actual helper artifact join is enforced by the observation constructor');
  }
});

test('task, published raw contract, Product routing, schema and constructor select the same closed arm',async()=>{
  const {h,p,old,revision}=await pair(),gtl=await load('build/code/src/gtl/index.js');
  const {ABI5_PRODUCT_SEMANTICS:semantics}=await load('build/code/src/product/builtin_semantics.js');
  const publication=gtl.constructWorksiteCommandExecutionModulePublication({productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,
    packageVersion:p.ABI5_PACKAGE_VERSION,artifactDigest:h.hash('unit-package'),productContentDigest:h.hash('unit-content'),productManifestDigest:h.hash('unit-manifest')});
  for(const [row,ids,valueKind]of [[old,p.WORKSITE_COMMAND_EXECUTION_IDS,'worksite_command_execution_worker_result'],
    [revision,p.WORKSITE_REVISION_IDS,'worksite_revision_command_execution_worker_result']]) {
    const contracts=semantics.resolveProbabilisticWorkerContracts({inputContractRef:ids.taskContractRef,outputContractRef:ids.observationContractRef,input:row.task});
    assert.deepEqual(contracts,{instructionContractRef:ids.taskContractRef,resultContractRef:ids.workerResultContractRef});
    assert.equal(row.task.resultContractRef,contracts.resultContractRef);
    const declaration=publication.contracts.filter(c=>c.contractRef===contracts.resultContractRef);
    assert.equal(declaration.length,1);assert.equal(declaration[0].valueKind,valueKind);
    // This is the unchanged generic LeafPort's declaration/valueKind-to-Product
    // validation relation, not a fabricated admitted LeafPort or owner lookup.
    assert.equal(semantics.validateContractValue(declaration[0].valueKind,row.acknowledgment),true);
    assert.equal(semantics.validateContractValue(declaration[0].valueKind,(row===old?revision:old).acknowledgment),false);
    const graph=publication.graphFunctions.find(g=>g.name===ids.graphFunctionRef);
    assert.deepEqual(graph.environment.carries,[contracts.resultContractRef]);
    assert.equal(graph.declarations['abg.raw_result_contract'],contracts.resultContractRef);
    const schema=p.worksiteCommandExecutionWorkerResultSchema(row.task,row.plan);
    assert.equal(schema.additionalProperties,false);assert.equal(schema.required.length,7);
    assert.deepEqual(Object.keys(row.acknowledgment).sort(),[...schema.required].sort());
    for(const [key,rule]of Object.entries(schema.properties)) {
      if('const'in rule)assert.equal(row.acknowledgment[key],rule.const,key);
      if('pattern'in rule)assert.equal(new RegExp(rule.pattern).test(row.acknowledgment[key]),true,key);
    }
    assert.equal(schema.properties.kind.const,'worksite_command_execution_worker_result','wire kind is intentionally shared, raw valueKind is not');
  }
});

test('legacy schema, task and predicates remain exact; generic native owners and helper are byte-exact',async()=>{
  const {h,p,old}=await pair(),previousRoot=resolve(packageRoot,'../../implementation-02/work');
  const previous=await import(pathToFileURL(resolve(previousRoot,'build/code/src/product/worksite_command_execution.js')).href);
  assert.deepEqual(p.worksiteCommandExecutionWorkerResultSchema(old.task,old.plan),previous.worksiteCommandExecutionWorkerResultSchema(old.task,old.plan));
  assert.deepEqual(p.constructWorksiteCommandExecutionTask(old.task),previous.constructWorksiteCommandExecutionTask(old.task));
  for(const [before,after]of [[old.task,old.observation],[old.task,{...old.observation,task:h.task}]]) {
    assert.equal(p.resolveWorksiteCommandExecutionJudgmentRelation(p.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef).evaluate(before,after),
      previous.resolveWorksiteCommandExecutionJudgmentRelation(p.WORKSITE_COMMAND_EXECUTION_IDS.judgmentPredicateRef).evaluate(before,after));
  }
  const currentSource=readFileSync(resolve(packageRoot,'code/src/product/worksite_command_execution.ts'),'utf8');
  const oldSource=readFileSync(resolve(packageRoot,'../pre-ack-01/source/code/src/product/worksite_command_execution.ts'),'utf8');
  const guard=text=>text.slice(text.indexOf('export function isWorksiteCommandExecutionWorkerResult('),text.indexOf('export function constructWorksiteCommandExecutionWorkerResult('));
  assert.equal(guard(currentSource),guard(oldSource),'old one-argument guard is byte-exact');
  const builtin=readFileSync(resolve(packageRoot,'code/src/product/builtin_semantics.ts'),'utf8'),preAck=readFileSync(resolve(packageRoot,'../pre-ack-01/source/code/src/product/builtin_semantics.ts'),'utf8');
  const steps=text=>text.slice(text.indexOf('    if (predicateRef === revisionIds.stepPredicateRef)'));
  assert.equal(steps(builtin),steps(preAck),'reviewed workflow-step and existing D1/D2 judgments unchanged');
  for(const path of ['code/src/implementation/leaf_invocation_port.ts','code/src/implementation/worksite_command_execution.ts',
    'code/src/implementation/worksite_command_helper.ts','code/src/abg/c_call.ts','code/src/abg/c_call_outcome.ts',
    'code/src/abg/semantic_revision.ts','code/src/abg/worksite_revision.ts']) {
    const after=readFileSync(resolve(packageRoot,path)),before=readFileSync(resolve(packageRoot,'../pre-ack-01/source',path));
    if(path==='code/src/abg/semantic_revision.ts') {
      const {restorePre08RevisionCollector}=await import('../support/d2-evidence-owner-conservation.mjs');
      assert.equal(restorePre08RevisionCollector(after.toString('utf8')),before.toString('utf8'),path);
    } else assert.deepEqual(after,before,path);
  }
});
