import test from 'node:test';
import assert from 'node:assert/strict';
import {load,capturedEnvelopeSkip} from '../support/d2-bounded-harness.mjs';
import {workflowStepHarness,retainedIntentWitness,retainedIntentSkip} from '../support/d2-workflow-step-harness.mjs';

test('retained stopped Intent foldback satisfies existing D1 step, not premature lifecycle closure',{skip:retainedIntentSkip},async()=>{
  const product=await load('build/code/src/product/index.js'),{SEMANTIC_STAGE_IDS:D}=await load('build/code/src/gtl/semantic_stage_identity.js');
  const {ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS:semantics}=await load('build/code/src/product/builtin_semantics.js'),w=retainedIntentWitness();
  assert.equal(product.sha256Bytes(w.bytes),'sha256:42c1bfd29619425dab0bedb270f2bcce0111cb6cb3ebee274db9438fcc4644cc');
  assert.equal(w.call.payload.judgmentPredicateRef,D.lifecyclePredicateRef);
  assert.equal(w.result.payload.resultDigest,'sha256:4779176e5a5ec15f9d40f58e71ebcb63503d3e91150d611b5dc6d607faaf5196');
  assert.notEqual(w.result.payload.resultDigest,product.sha256Canonical(w.output),'ABG result identity is not the embedded value digest');
  assert.equal(w.input.assets.length,0);assert.equal(w.output.assets.length,1);
  assert.equal(semantics.resolveJudgmentRelation(D.lifecyclePredicateRef).evaluate(w.input,w.output),false);
  assert.equal(semantics.resolveJudgmentRelation(D.lifecycleStepPredicateRef).evaluate(w.input,w.output),true);
  assert.equal(semantics.resolveJudgmentRelation(D.lifecycleStepPredicateRef).evaluate(w.output,w.output),false,'incomplete equal carrier is not terminal');
});

test('new relation accepts exact revision projection and refuses unknown or crossed request coordinates',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness();
  assert.equal(h.step(h.cut.request,h.cut.value),true);
  assert.equal(h.step({...h.cut.request,parent:{...h.cut.request.parent,resultRef:'synthetic-unadmitted:foreign'}},h.cut.value),false);
  assert.equal(h.step(h.stage,h.cut.value),false);assert.equal(h.step(null,null),false);
});

test('stage author, assessment and combined stage foldback conserve revision basis and exact role',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness(),cut=h.project(h.original,h.stage.worksite,{mode:'stage_revision'}),asset=h.stage.assets.at(-1);
  const source={...asset.source,cCallRef:'synthetic-unadmitted:revision-author',inputDigest:h.hash(cut.value)};
  const authored=h.revision.deriveRevisionAsset(cut.value,asset.stageRef,asset.candidate,source);assert.ok(authored);
  const assessed=h.revision.deriveRevisionAssessment(authored,asset.stageRef,asset.assessment.candidate,
    {...asset.assessment.source,cCallRef:'synthetic-unadmitted:revision-assessor',inputDigest:h.hash(authored)});assert.ok(assessed);
  assert.equal(h.step(cut.value,authored),true);assert.equal(h.step(authored,assessed),true);assert.equal(h.step(cut.value,assessed),true);
  assert.equal(h.step(assessed,authored),false);assert.equal(h.step(authored,authored),false);
  assert.equal(h.step(h.cut.value,assessed),false,'different valid revision basis cannot mix');
  const wrong=structuredClone(assessed);wrong.current.assets.at(-1).assessment.disposition='falsified';
  assert.equal(h.step(authored,wrong),false);
});

test('bridge requires matching revision/A/W coordinates while retaining the actual historical Design',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness();
  assert.deepEqual(h.cut.value.current.assets,h.stage.assets);
  assert.equal(h.step(h.cut.value,h.entry),true);assert.equal(h.entry.constructionTask.targets.length,2);
  assert.equal(h.entry.snapshotTargetRefs.length,22);assert.equal(h.entry.dependencyObservations.length,20);
  const other=h.project(h.original,h.cut.value.current.worksite);
  assert.equal(h.step(other.value,h.entry),false,'different valid basis not accepted');
  assert.equal(h.step(h.foldback(h.observation),h.entry),false,'evidence-bearing envelope does not restart bridge');
});

test('E_D to new C2 reconstructs exact task, selected construction and retained sources; command failure remains evidence',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness();
  assert.equal(h.step(h.entry,h.observation),true);
  assert.ok(h.observation.commandResults.every(row=>row.exitStatus===1));
  assert.equal(h.observation.task.snapshotSources.filter(row=>row.source.kind==='construction_member').length,2);
  assert.equal(h.observation.task.snapshotSources.filter(row=>row.source.kind==='retained_dependency').length,20);
  const changedEntry=h.product.constructWorksiteRevisionCommandPreparationInput({...h.entry,
    dependencyObservations:h.entry.dependencyObservations.map((row,i)=>i===0?{...row,origin:{...row.origin,inputAdmissionRef:'synthetic-unadmitted:foreign'}}:row)});
  assert.equal(h.step(changedEntry,h.observation),false,'valid differently tagged retained origin is not silently adopted');
  const corrupted=structuredClone(h.observation);corrupted.task.revisionBasisDigest=h.hash('forged');
  assert.equal(h.step(h.entry,corrupted),false);
});

test('evidence foldback and complete terminal preserve failed command and reject missing or crossed evidence',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness(),failed=h.foldback(h.observation);
  assert.equal(h.step(h.observation,failed),true);
  assert.equal(h.step(failed,failed),false,'retained five-stage lifecycle still requires its fifth assessment');
  function complete(envelope) {
    const stage=envelope.current.lifecycle.stages.at(-1),prior=envelope.current.assets.at(-1);
    const candidate={...prior.candidate,worksiteDesign:null,requirementCandidates:[],
      statements:prior.candidate.statements.map((s,i)=>({...s,statementRef:`synthetic-unadmitted:evidence-statement-${i}`}))};
    const source={...prior.source,cCallRef:'synthetic-unadmitted:evidence-author',actorInvocationRef:'synthetic-unadmitted:evidence-author',inputDigest:h.hash(envelope)};
    const authored=h.revision.deriveRevisionAsset(envelope,stage.declarationRef,candidate,source);assert.ok(authored);
    const assessment={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',pressure:[],criteria:stage.rubric.map(c=>({
      criterionRef:c.criterionRef,disposition:'satisfied',explanation:'Pure typed completion fixture; not semantic UAT or command success.',
      sourceQuotes:candidate.statements[0].sourceQuotes,statementRefs:candidate.statements.map(s=>s.statementRef)}))};
    const result=h.revision.deriveRevisionAssessment(authored,stage.declarationRef,assessment,{...source,
      cCallRef:'synthetic-unadmitted:evidence-assessor',actorInvocationRef:'synthetic-unadmitted:evidence-assessor',inputDigest:h.hash(authored)});
    assert.ok(result);assert.equal(h.step(envelope,result),true);return result;
  }
  const terminal=complete(failed);assert.equal(h.step(terminal,terminal),true);
  assert.equal(h.step(h.cut.value,h.cut.value),false,'complete semantic assets without C2 cannot close a worksite chain');
  assert.equal(failed.current.applicationCoverage,'non_closing');assert.ok(failed.current.remainingGaps.length>0);
  assert.ok(failed.current.evidence.executionObservation.commandResults.every(row=>row.exitStatus===1));
  for(const mutate of [v=>{v.current.evidence.executionResultDigest=h.hash('crossed');},
    v=>{v.current.evidence.constructionResultDigest=h.hash('crossed');},
    v=>{v.current.evidence.constructionResult={};},
    v=>{v.current.assets.pop();},v=>{v.current.assets[0].assessment.disposition='indeterminate';}]) {
    const changed=structuredClone(terminal);mutate(changed);assert.equal(h.step(changed,changed),false);
  }
  const other=h.project(h.original,h.cut.value.current.worksite);
  assert.equal(h.step(h.observation,h.foldback(h.observation,other.value)),false,'same observation cannot cross a valid revision basis');
  const success=h.observationFor(h.task,0).observation,completed=h.foldback(success);
  assert.equal(h.step(success,completed),true);assert.equal(h.step(complete(completed),complete(completed)),true);
});

test('old C2 carrier/observation constructor and predicates stay unchanged; new chain will not accept the old arm',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness(),input=h.product.constructWorksiteCommandPreparationInput({constructionTask:h.entry.constructionTask,
    commands:h.entry.commands,outcomePredicates:h.entry.outcomePredicates,allowedWriteTerritories:h.entry.allowedWriteTerritories});
  const oldTask=h.product.prepareWorksiteCommandTask({kind:'worksite_command_preparation_bound_input',schemaVersion:'5.0.0',entry:input,source:h.construction});
  const old=h.observationFor(oldTask),actual=h.product.constructWorksiteCommandExecutionObservation(oldTask,old.acknowledgment,old.actor,old.artifact,old.plan);
  assert.deepEqual(actual,old.observation);
  assert.equal(h.semantics.resolveJudgmentRelation(h.D.lifecycleStepPredicateRef).evaluate(input,actual),true);
  assert.equal(h.step(input,actual),false);assert.equal(h.step(h.entry,actual),false);
});

test('revision acknowledgment now constructs its honest nonzero-command observation while old guard stays closed',{skip:capturedEnvelopeSkip},async()=>{
  const h=await workflowStepHarness(),{acknowledgment,actor,artifact,plan}=h.example;
  assert.match(artifact.artifactRef,/^worksite-revision-command-helper-artifact:\/\/abiogenesis\//);
  assert.equal(h.product.isWorksiteCommandExecutionWorkerResult(acknowledgment),false);
  assert.equal(h.product.isWorksiteRevisionCommandExecutionWorkerResult(acknowledgment),true);
  assert.deepEqual(h.product.constructWorksiteRevisionCommandExecutionObservation(h.task,acknowledgment,actor,artifact,plan),h.observation);
  assert.ok(h.observation.commandResults.every(row=>row.exitStatus===1));
  // Pre-ack failure and exact inputs remain frozen separately; no runtime runs.
});
