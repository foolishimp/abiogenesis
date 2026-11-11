import assert from 'node:assert/strict';
import test from 'node:test';
import * as product from '../../build/code/src/product/index.js';
import {assessmentContract,assessmentSchema,witnessRef} from '../support/default-library.mjs';

// Self-contained governance original over in-memory paths. Only the assessment
// role selection varies between cases; intake construction reads no files.
const task='source/task.md',notes='source/notes.md',rubric='source/rubric.json',candidate='generated/candidate.mjs';
const digest=c=>'sha256:'+c.repeat(64);
const order=purpose=>({outcome:`Perform the selected ${purpose} work needed for the original task.`,instructions:[],readFirst:[task,notes,rubric],
  writeRoots:purpose==='construction'?['generated']:[],checks:[]});
function original(roles={}){
  return {taskRef:witnessRef('task','rc2-assessment-intake'),task:'Construct the candidate the source task describes.',
    sources:[{path:task,digest:digest('a')},{path:notes,digest:digest('b')},{path:rubric,digest:digest('c')}],
    requiredSupportRefs:[witnessRef('support','rc2-assessment-intake')],authorityRefs:[witnessRef('authority','consumer-scope')],
    readRoots:['generated','source'],maxContextFiles:16,maxContextBytes:65_536,maxPromptBytes:65_536,
    workOrders:Object.fromEntries(['construction','testing','uat'].map(p=>[p,order(p)])),
    testing:{selectedPaths:[candidate],commands:[],outcomePredicates:[],allowedWriteTerritories:[]},
    assessment:{sources:[task],candidatePath:candidate,rubricPath:rubric,resultContract:assessmentContract,
      schemaAsset:{productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,
        bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')},
      verdictField:'disposition',satisfiedValue:'satisfied',...roles}};
}
const refusal={name:'TypeError',message:'governance input requires complete original source, scope and declared work contracts'};
const control=product.constructGovernanceWorkState(original());
// A complete state for the predicate: the valid constructed control with only its original replaced.
const stateWith=input=>({...control,original:input});
const withoutAssessment=({assessment:_a,...rest})=>rest;

function assertRefused(roles){
  const input=original(roles);
  assert.deepEqual(withoutAssessment(input),withoutAssessment(control.original),'only the assessment role selection differs from the valid control');
  assert.equal(product.isGovernanceWorkState(stateWith(input)),false,'predicate rejects the role selection');
  assert.throws(()=>product.constructGovernanceWorkState(input),refusal,'constructor refuses before any state exists');
}

test('RC2 assessment intake valid disjoint roles stay constructible and valid',()=>{
  const input=original();
  assert.equal(product.isGovernanceWorkState(stateWith(input)),true,'predicate accepts the disjoint selection over the control state');
  assert.ok(Object.isFrozen(control));
  assert.deepEqual(control,{kind:'governance_work_state',schemaVersion:'5.0.0',original:input,synthesis:null,observations:[],
    unresolvedSupportRefs:input.requiredSupportRefs,terminal:false});
  assert.equal(product.isGovernanceWorkState(control),true);
  const selection=product.governanceAssessmentContract(control,'uat');
  assert.deepEqual([selection.sources,selection.candidatePath,selection.rubricPath],[[task],candidate,rubric]);
  // Several distinct sources, including a protected original source beside the rubric, remain valid.
  const several=product.constructGovernanceWorkState(original({sources:[task,notes]}));
  assert.equal(product.isGovernanceWorkState(several),true);
  assert.deepEqual(product.governanceAssessmentContract(several,'uat').sources,[task,notes]);
});

test('RC2 assessment intake refuses duplicate assessment sources',()=>{
  assertRefused({sources:[task,task]});
  assertRefused({sources:[task,notes,task]});
});

test('RC2 assessment intake refuses a source equal to candidatePath',()=>{
  assertRefused({sources:[candidate]});
  assertRefused({sources:[task,candidate]});
});

test('RC2 assessment intake refuses a source equal to rubricPath, and removing only that source is accepted',()=>{
  // The RC1-OP-006 relation: the rubric is selected both as a source and as the rubric.
  assertRefused({sources:[task,rubric]});
  assertRefused({sources:[rubric]});
  const corrected=product.constructGovernanceWorkState(original({sources:[task]}));
  assert.equal(product.isGovernanceWorkState(corrected),true);
  assert.deepEqual(corrected,control);
});

test('RC2 assessment intake refuses candidatePath equal to rubricPath',()=>{
  assertRefused({candidatePath:rubric});
  assertRefused({rubricPath:candidate});
});
