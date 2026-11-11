import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../../build/code/src/gtl/index.js';
import {selectGovernanceWork} from '../../build/code/src/implementation/default_library.js';
import {projectGovernanceFailedStepAtPrefix,projectGovernanceFailedAttemptsAtPrefix} from '../../build/code/src/abg/default_library.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {constructRuntimeFailureDiagnosticRef,readRuntimeFailureDiagnosticSubject} from '../../build/code/src/abg/runtime_failure.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {worksiteContextIdentityDigest,worksiteContextObservationRef} from '../../build/code/src/product/worksite_effect.js';
import {amendmentPrerequisites,amendmentRef} from '../support/amendment-witness.mjs';
import {standIn,json,definitionPath,amendmentPath,standInActor,runWitness,PURPOSES,installWitnessTenant} from '../support/amendment-witness-run.mjs';
import {installOncePerFile} from '../support/root-installed-environment.mjs';
// Recoverable step failure in the default library: the declared classes, the
// old-instance bytes of an empty list, the typed selector refusal, the parent's
// re-entry conditions and the failed-attempt fold over one admitted record.
const h=product.sha256Canonical,ref=p=>product.governanceRef('graph-function',p),IMPACT=amendmentRef('review','impact');
// The two witness Runs share one packed, verified and installed Product (the
// tenant and the consumer fixture Product) for this file; each Run opens its own
// store, workspace and scratch root on it.
const sharedInstall=installOncePerFile(bound=>installWitnessTenant({bound}));
const TRANSPORT='diagnostic://abiogenesis/worksite/native-work/transport_failure@5',CONTRACT='diagnostic://abiogenesis/worksite/native-work/contract_failure@5';
const NO_OUTPUT='diagnostic://abiogenesis/worksite/native-work/no_output@5';
const SELECT_CLASS='diagnostic://abiogenesis/default-library/missing-owned-select@5',EXCEPTION='diagnostic://abiogenesis/implementation/implementation-exception@5';
const executiveOf=graphs=>graphs.find(f=>f.template.applications.some(a=>a.relationKind==='recurse'));
const recurseOf=graphs=>executiveOf(graphs).template.applications.find(a=>a.relationKind==='recurse');

test('the executive recursion declares the four recoverable classes by default; an option overrides them; an empty list keeps every old-instance byte',()=>{
  assert.deepEqual(product.GOVERNANCE_RECOVERABLE_FAILURE_CLASSES,[TRANSPORT,CONTRACT,NO_OUTPUT,SELECT_CLASS]);
  assert.equal(product.GOVERNANCE_RECOVERABLE_FAILURE_CLASSES.includes(EXCEPTION),false,'a thrown implementation exception is never recoverable');
  assert.deepEqual(product.GOVERNANCE_SELECTION_REFUSALS,['response_refused','target_not_permitted','selector_process_ended']);
  assert.deepEqual(recurseOf(gtl.defaultGovernanceGraphFunctions()).foldback,{mode:'rebind',binding:'$',requiresParentEvaluation:true,failedChildDiagnosticClassRefs:[TRANSPORT,CONTRACT,NO_OUTPUT,SELECT_CLASS]});
  assert.deepEqual(recurseOf(gtl.defaultGovernanceGraphFunctions({failedChildDiagnosticClassRefs:[TRANSPORT]})).foldback.failedChildDiagnosticClassRefs,[TRANSPORT]);
  const empty=gtl.defaultGovernanceGraphFunctions({failedChildDiagnosticClassRefs:[]}),app=recurseOf(empty);
  assert.deepEqual(Object.keys(app.foldback).sort(),['binding','mode','requiresParentEvaluation']);
  assert.deepEqual({foldbackRef:app.foldbackRef,applicationRef:app.applicationRef,executive:h(executiveOf(empty)),graphs:h(empty),
    gtl3:h(gtl.defaultGovernanceGraphFunctions({purposes:['construction','testing','uat'],recursionBound:8,failedChildDiagnosticClassRefs:[]}))},
  {foldbackRef:'foldback://abiogenesis/e7df59cd5dc25a9252febf61e03e386cd22158dca44e9380fab9c984465b9a17',
    applicationRef:'graph-function-application://abiogenesis/ac6f1ba5135bcd521859934f3f5589fd89cc9016ec20f376f17e2f93035b2e70',
    executive:'sha256:235f8c59d9b4186f17b4f834288890e0dc56bb6f63238ed95a04194789d5f86b',
    graphs:'sha256:d29a3c03a28b2f10d64dfe0171cea257cd08e8a7cb6bfb6579f8f837cef0f779',
    gtl3:'sha256:6ded51374bf89c74fe20ef4dc019627886c00b6e2670edc24c8b9cf01f58ad48'});
  // The default changes only the executive recursion.
  const declared=gtl.defaultGovernanceGraphFunctions();
  assert.deepEqual(declared.filter(g=>g!==executiveOf(declared)),empty.filter(g=>g!==executiveOf(empty)));
});

// One Public start whose selector ends its first process and whose correction
// writes part of its change and exits non-zero; the Run closes.
let shared;
async function recorded(t){
  if(shared)return shared;
  const proof=await mkdtemp(join(tmpdir(),'recoverable-failure-'));
  const actor=await standInActor(proof),actorLog=join(proof,'actor.jsonl');
  const run=await runWitness({after:()=>{}},{amendment:await json(amendmentPath('approval-threshold')),shared:sharedInstall,
    actorEnvironment:{ABG_TS_CLAUDE_COMMAND:actor,ABI5_AMENDMENT_ACTOR_LOG:actorLog,ABI5_AMENDMENT_STAND_IN:standIn,ABI5_AMENDMENT_ACTOR_FAIL:'select:exit,correction:exit'}});
  const log=(await readFile(actorLog,'utf8')).trim().split('\n').map(l=>JSON.parse(l));
  await rm(proof,{recursive:true,force:true});
  assert.equal(run.receipt.ownerOutput.value.disposition,'completed',JSON.stringify({roles:log.map(r=>r.role)}));
  const all=deepFreeze(structuredClone(run.allEvents)),recursion=all.filter(e=>e.kind==='child_foldback_admitted'&&typeof e.payload.applicationRef==='string');
  const failed=recursion.filter(e=>e.payload.childDisposition==='failed');
  shared={run,log,all,failed,runId:failed[0].runId,parentBasis:failed[0].basisId};
  return shared;
}
const prefixOf=events=>selectValidatedRuntimeEventPrefix(Object.freeze(events));
const resultOf=(events,resultRef)=>events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===resultRef);
/** The record with one event replaced by a mutated copy; ordinals and identities are kept. */
function mutated(events,match,change){
  const at=events.findIndex(match);assert.ok(at>=0,'mutation target');
  const copy=structuredClone(events[at]);change(copy);const out=[...events];out[at]=deepFreeze(copy);return out;
}
const reading=(events,s,foldback)=>projectGovernanceFailedStepAtPrefix(prefixOf(events),s.runId,events.find(e=>e.eventId===foldback.eventId));

test('the fold: each selection task carries this Run\'s failed steps in order, re-derived from the admitted prefix, absent before the first failure',{timeout:900_000},async t=>{
  const s=await recorded(t),{all,failed,runId,parentBasis}=s;
  assert.deepEqual(s.log.map(r=>r.role).slice(0,3),['fail:select','select:induction','native:intake-triage']);
  assert.equal(failed.length,2);
  const rows=projectGovernanceFailedAttemptsAtPrefix(prefixOf(all),runId,parentBasis);
  const select=resultOf(all,failed[0].payload.childResultRef),subject=readRuntimeFailureDiagnosticSubject(select.payload.value.diagnosticRef);
  assert.deepEqual([subject.diagnosticClassRef,subject.computeRegime,subject.stage,subject.relation],[SELECT_CLASS,'F_P','selector_completion','selector_process_ended']);
  assert.deepEqual(Object.keys(subject.selectors).sort(),['actorInvocationRef','failureClass','timeoutClass']);
  assert.deepEqual(rows[0],{graphFunctionRef:null,failureClassRef:SELECT_CLASS,timeoutClass:null,changedPaths:[],
    refusal:{relation:'selector_process_ended',selectors:subject.selectors},resultRef:select.payload.resultRef});
  const leaf=resultOf(all,rows[1].resultRef);
  assert.deepEqual(rows[1],{graphFunctionRef:ref('construction'),failureClassRef:TRANSPORT,timeoutClass:null,changedPaths:['src/order.mjs'],resultRef:leaf.payload.resultRef});
  assert.deepEqual([leaf.graphFunctionRef,leaf.payload.value.failureClass],[product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,'transport_failure']);
  // Every admitted selection task equals the fold over the prefix before its admission (R5); the member is absent before the first failure.
  const tasks=all.filter(e=>e.kind==='c_call_result_admitted'&&e.runId===runId&&e.payload.value?.kind==='framed_synthesis_task');
  let before=0,after=0;
  for(const task of tasks){
    const fold=projectGovernanceFailedAttemptsAtPrefix(prefixOf(all.slice(0,task.admissionOrdinal-1)),runId,parentBasis);
    if(fold.length===0){before++;assert.equal(Object.hasOwn(task.payload.value,'failedAttempts'),false);}
    else{after++;assert.deepEqual(task.payload.value.failedAttempts,fold);}
  }
  assert.deepEqual([before,after],[1,tasks.length-1],'only the first task, before the selector failed, has no failed step');
  assert.deepEqual(projectGovernanceFailedAttemptsAtPrefix(prefixOf(all.slice(0,failed[0].admissionOrdinal-1)),runId,parentBasis),[]);
  assert.deepEqual(tasks.at(-1).payload.value.failedAttempts,rows);
  // Each selector saw them in its view; the failure Results join the admissible evidence.
  assert.deepEqual(s.log.filter(r=>r.role.startsWith('select:')).at(-1).failed,rows);
  const last=tasks.at(-1).payload.value,evidence=product.framedSynthesisEvidenceRefs(last);
  assert.deepEqual(evidence.slice(-2),rows.map(r=>r.resultRef));
  const {failedAttempts,...withoutRows}=last;
  assert.deepEqual(product.framedSynthesisEvidenceRefs(withoutRows),evidence.slice(0,-2));
  assert.deepEqual(s.log[0],{role:'fail:select',failed:[]},'the first view, before any failure, shows none');
  // The task schema: a present member is non-empty with unique failure Results.
  assert.equal(product.isFramedSynthesisTask(last),true);
  assert.equal(product.isFramedSynthesisTask({...withoutRows,failedAttempts:[]}),false);
  assert.equal(product.isFramedSynthesisTask({...withoutRows,failedAttempts:[rows[1],rows[1]]}),false);
  t.diagnostic(JSON.stringify({tasks:tasks.length,rows:rows.map(r=>[r.graphFunctionRef,r.failureClassRef,r.refusal?.relation??null,r.changedPaths])}));
});

test('the parent continues only over a recoverable origin with attributable effects; each other reading refuses with its relation',{timeout:900_000},async t=>{
  const s=await recorded(t),{all,failed}=s,[selectStep,nativeStep]=failed;
  assert.deepEqual([reading(all,s,selectStep).relation,reading(all,s,nativeStep).relation],[null,null]);
  const select=resultOf(all,selectStep.payload.childResultRef),subject=readRuntimeFailureDiagnosticSubject(select.payload.value.diagnosticRef);
  const nativeRow=reading(all,s,nativeStep).attempt,leaf=resultOf(all,nativeRow.resultRef),value=leaf.payload.value,actor=value.provenance.actorInvocationRef;
  const isLeaf=e=>e.eventId===leaf.eventId,isSelect=e=>e.eventId===select.eventId;
  const retained=(events,next)=>{const refd=constructRuntimeFailureDiagnosticRef(next);
    return mutated(mutated(events,isSelect,e=>{e.payload.value.diagnosticRef=refd;}),e=>e.eventId===selectStep.eventId,e=>{e.payload.childReasonRef=refd;});};
  const cases=[
    // Ruling A: the relation is read from the admitted record, never from a message.
    ['selector relation outside the three',retained(all,{...subject,relation:'caught',cause:{errorClass:'TypeError',errorCode:null,message:'native selector choice binding refused',messageTruncated:false}}),selectStep,'selection_failure_not_recoverable'],
    // An exchange identity mismatch throws: its class is the generic exception, which no reading continues.
    ['selector identity mismatch class',retained(all,{...subject,diagnosticClassRef:EXCEPTION,relation:'caught'}),selectStep,'selection_failure_not_recoverable'],
    ['selector process end without its transport fact',mutated(all,e=>e.kind==='actor_invocation_failed'&&e.aggregateId===subject.selectors.actorInvocationRef,e=>{e.payload.cCallRef='c-call:sha256:'+'0'.repeat(64);}),selectStep,'selection_failure_not_recoverable'],
    ['native work without an after observation',mutated(all,isLeaf,e=>{Object.assign(e.payload.value,{after:null,changedPaths:null,observationFailure:{relation:'post_work_observation'}});}),nativeStep,'failure_effects_unattributed'],
    ['native work with a transport exception',mutated(all,e=>e.kind==='actor_invocation_failed'&&e.aggregateId===actor,e=>{e.payload.failureClass='transport_exception';}),nativeStep,'failure_effects_unattributed'],
    ['native work with an unconfirmed termination',mutated(all,e=>e.kind==='actor_process_exited'&&e.parentAggregateId===actor,e=>{e.kind='actor_process_termination_unconfirmed';}),nativeStep,'failure_effects_unattributed'],
    ['native work with an unrecoverable class',mutated(all,isLeaf,e=>{e.payload.value.failureClass='write_scope_violation';}),nativeStep,'failure_class_not_recoverable'],
    ['native work that changed a path outside its grant',mutated(all,isLeaf,e=>{
      const entries=e.payload.value.after.entries,at=entries.findIndex(x=>x.relativePath==='design/impact-assessment.md'),bytes=Buffer.from('Written outside the grant.\n');
      entries[at]={relativePath:entries[at].relativePath,state:'file',fileIdentity:entries[at].fileIdentity,byteLength:bytes.length,digest:product.sha256Bytes(bytes),encoding:'base64',bytes:bytes.toString('base64')};
      // The observation keeps its own identity over the changed entry.
      e.payload.value.changedPaths=[...e.payload.value.changedPaths,'design/impact-assessment.md'].sort();
      const after=e.payload.value.after,{kind,schemaVersion,observationRef,observationDigest,...body}=after;
      after.observationDigest=worksiteContextIdentityDigest(body);after.observationRef=worksiteContextObservationRef(after.observationDigest);}),nativeStep,'failure_write_outside_grant'],
    ['an origin at another locus',mutated(all,e=>e.kind==='c_call_opened'&&e.aggregateId===leaf.aggregateId,e=>{e.payload.programLocusRef='node://abiogenesis/elsewhere@5';}),nativeStep,'failure_origin_not_recoverable'],
    ['a failed step whose Result is not in the record',mutated(all,e=>e.eventId===nativeStep.eventId,e=>{e.payload.childResultDigest='sha256:'+'0'.repeat(64);}),nativeStep,'failure_record_unresolved'],
  ];
  for(const [name,events,step,relation] of cases){
    assert.deepEqual(reading(events,s,step),{attempt:null,relation},name);
    assert.equal(projectGovernanceFailedAttemptsAtPrefix(prefixOf(events),s.runId,s.parentBasis),null,name+': the fold refuses with the parent');
  }
  t.diagnostic(JSON.stringify(cases.map(([name,,,relation])=>[name,relation])));
});

test('a worker that ends normally with an empty final output fails with the native no_output class; the Run continues and the next selection shows the attempt',{timeout:900_000},async t=>{
  const proof=await mkdtemp(join(tmpdir(),'recoverable-no-output-'));
  const actor=await standInActor(proof),actorLog=join(proof,'actor.jsonl');
  const run=await runWitness({after:()=>{}},{amendment:await json(amendmentPath('approval-threshold')),shared:sharedInstall,
    actorEnvironment:{ABG_TS_CLAUDE_COMMAND:actor,ABI5_AMENDMENT_ACTOR_LOG:actorLog,ABI5_AMENDMENT_STAND_IN:standIn,ABI5_AMENDMENT_ACTOR_FAIL:'construction:empty'}});
  const log=(await readFile(actorLog,'utf8')).trim().split('\n').map(l=>JSON.parse(l));
  await rm(proof,{recursive:true,force:true});
  const all=run.allEvents,leaves=all.filter(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.payload.value?.kind==='native_workspace_work_failure');
  t.diagnostic(JSON.stringify({roles:log.map(r=>r.role),failures:leaves.map(e=>[e.payload.value.failureClass,e.payload.value.diagnosticRef])}));
  assert.equal(run.receipt.ownerOutput.value.disposition,'completed');
  assert.deepEqual(leaves.map(e=>[e.payload.value.failureClass,e.payload.value.diagnosticRef]),[['no_output',NO_OUTPUT]]);
  const failed=all.filter(e=>e.kind==='child_foldback_admitted'&&typeof e.payload.applicationRef==='string'&&e.payload.childDisposition==='failed');
  assert.equal(failed.length,1);
  const rows=projectGovernanceFailedAttemptsAtPrefix(prefixOf(all),failed[0].runId,failed[0].basisId);
  assert.deepEqual(rows,[{graphFunctionRef:ref('construction'),failureClassRef:NO_OUTPUT,timeoutClass:null,changedPaths:[],resultRef:leaves[0].payload.resultRef}]);
  // The next selection's task and view carry the attempt; the step is retried and the Run closes.
  const at=log.findIndex(r=>r.role==='fail:construction'),next=log.slice(at+1).find(r=>r.role.startsWith('select:'));
  assert.deepEqual([next.role,next.failed],['select:construction',rows]);
  const tasks=all.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='framed_synthesis_task');
  assert.deepEqual(tasks.at(-1).payload.value.failedAttempts,rows);
});

test('the selector completion: an exchange identity mismatch throws; every other unbound completion is a typed missing-owned-select refusal',{timeout:900_000},async t=>{
  const s=await recorded(t),tasks=s.all.filter(e=>e.kind==='c_call_result_admitted'&&e.runId===s.runId&&e.payload.value?.kind==='framed_synthesis_task');
  const input=tasks[0].payload.value,definition=await json(definitionPath),prerequisites=amendmentPrerequisites(definition);
  const graphs=gtl.defaultGovernanceGraphFunctions({purposes:PURPOSES,prerequisites}),step=graphs.find(g=>g.name===ref('executive-step'));
  const targets=graphs.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>product.governanceTarget(g,h(g),product.governancePrerequisites(step.declarations)));
  assert.equal(product.governanceTargetPermission(input,targets.find(x=>x.purpose==='construction')).permitted,false,'construction waits for impact');
  const assembly=deepFreeze({request:{kind:'stub_request',prompt:'p'},manifest:{promptDigest:'sha256:'+'a'.repeat(64)},envelope:{targetBindings:targets,boundBasis:{}}});
  const occurrence={cCallRef:'c-call:sha256:'+'1'.repeat(64),runId:s.runId,graphCallId:'graph-call:x',frameId:'frame:x',programLocusRef:product.governanceRef('node','select'),taskOrdinal:1,attempt:1};
  const prepared=selectGovernanceWork(input,occurrence,()=>assembly);
  const observation={actorInvocationRef:'actor-invocation:x',disposition:'success',failureClass:null,finalOutput:'{}',promptDigest:assembly.manifest.promptDigest,
    inputDigest:h(input),implementationRef:product.governanceRef('implementation','select'),toolCallCount:0,timeoutClass:null};
  const complete=o=>prepared.complete({request:assembly.request,observation:{...observation,...o}});
  const typed=candidate=>{assert.equal(candidate.disposition,'failure');assert.deepEqual(candidate.evidenceCandidates,[]);
    const subject=readRuntimeFailureDiagnosticSubject(candidate.diagnosticRef);
    assert.deepEqual([subject.diagnosticClassRef,subject.computeRegime,subject.implementationRef,subject.stage,subject.occurrence.cCallRef,subject.cause],
      [SELECT_CLASS,'F_P',product.governanceRef('implementation','select'),'selector_completion',occurrence.cCallRef,null]);
    assert.equal(candidate.resultCandidate.diagnosticRef,candidate.diagnosticRef);return [subject.relation,subject.selectors];};
  // W7 at unit level: no stand-in can make the transport report another request, prompt, input or implementation.
  for(const o of [{promptDigest:'sha256:'+'b'.repeat(64)},{inputDigest:'sha256:'+'c'.repeat(64)},{implementationRef:product.governanceRef('implementation','fold')}])
    assert.throws(()=>complete(o),/^TypeError: native selector exchange mismatch$/);
  assert.throws(()=>prepared.complete({request:{...assembly.request,prompt:'q'},observation}),/native selector exchange mismatch/);
  assert.deepEqual(typed(complete({disposition:'failure',failureClass:'transport_failure',timeoutClass:'inactivity'})),
    ['selector_process_ended',{actorInvocationRef:'actor-invocation:x',failureClass:'transport_failure',timeoutClass:'inactivity'}]);
  // A malformed or non-JSON answer reaches the completion as the transport delivers it: a failed process with the contract failure class.
  // A tool call in the closed selection lane delivers no completion; response_refused is the strict binder refusing a well-formed response (below).
  assert.deepEqual(typed(complete({disposition:'failure',failureClass:'contract_failure',finalOutput:'not json'})),
    ['selector_process_ended',{actorInvocationRef:'actor-invocation:x',failureClass:'contract_failure',timeoutClass:null}]);
  const early=JSON.stringify({interpretation:'Early',contributions:[],gaps:[],nextGraphFunctionRef:ref('construction'),nextReason:'Early',nextEvidenceRefs:[],subjectEvidenceRef:null,
    revisionReason:'Early',revisionEvidenceRefs:[],reviewRef:null});
  assert.deepEqual(typed(complete({finalOutput:early})),['target_not_permitted',{graphFunctionRef:ref('construction'),reviewRef:null,missingReviews:IMPACT,staleReviews:null,missingSelectedPaths:null}]);
  assert.deepEqual(typed(complete({finalOutput:early.replace(ref('construction'),'graph-function://elsewhere@5')})),['response_refused',{graphFunctionRef:null,reviewRef:null}]);
});
