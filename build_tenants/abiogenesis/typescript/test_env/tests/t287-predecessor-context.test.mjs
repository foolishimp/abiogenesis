import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {join} from 'node:path';
const out=process.env.ABI5_PREDECESSOR_PROOF_ROOT,selected=Boolean(process.env.ABI5_PREDECESSOR_PRIOR_ROOT&&out&&process.env.ABI5_PREDECESSOR_OLD_PACKAGE_ROOT);
const options={skip:!selected&&'ABI5_PREDECESSOR_PRIOR_ROOT, ABI5_PREDECESSOR_PROOF_ROOT or ABI5_PREDECESSOR_OLD_PACKAGE_ROOT unset; requires the exact preserved original1B evidence, its proof root and the predecessor package'};
const {root,load,semantic,hash,input,stage,raw,source,retainedBasis,componentAssembly,assertIdentities}=selected?await import('../support/t287-predecessor-context.mjs'):{};
if(selected)fs.mkdirSync(out,{recursive:true});
const report={scope:'pure and native-assembly rederivation only; no new runtime admission or actor',checks:[]};
const record=(name,details)=>{report.checks.push({name,...details});fs.writeFileSync(join(out,'result.json'),JSON.stringify(report,null,2)+'\n');};
// Retired (T-292 TD-60): the current package reproduces the retained empty-eligibility counterexample of the old package; input the RC7 combined-qualification install recorded value gone
test('all active assets remain eligible, not just declared predecessor stages; exact nonempty native rendering',options,async()=>{
  const gtl=await load('gtl/semantic_stage');
  const second=structuredClone(stage);second.declarationRef+='-second';second.graphFunctionRef+='-second';second.assembly.graphFunctionRef=second.graphFunctionRef;second.predecessorStageRefs=[];
  const third=structuredClone(second);third.declarationRef+='-third';third.graphFunctionRef+='-third';third.assembly.graphFunctionRef=third.graphFunctionRef;third.predecessorStageRefs=[stage.declarationRef];
  const lifecycle=gtl.constructSemanticLifecycleDeclaration({...input.lifecycle,stages:[stage,second,third]});
  let value={...input,lifecycle};
  value=semantic.deriveSemanticAsset(value,stage.declarationRef,raw('statement://pure/first'),source('first'));assert.ok(value);
  const assessment={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:stage.rubric.map(c=>({criterionRef:c.criterionRef,disposition:'satisfied',explanation:'Pure fixture only.',sourceQuotes:[],statementRefs:['statement://pure/first']})),pressure:[]};
  value=semantic.deriveSemanticAssessment(value,stage.declarationRef,assessment,source('first-assessor'));assert.ok(value);
  value=semantic.deriveSemanticAsset(value,second.declarationRef,raw('statement://pure/second',['statement://pure/first']),source('second'));assert.ok(value);
  assert.deepEqual(semantic.semanticPredecessorStatementRefs(value),['statement://pure/first','statement://pure/second']);
  const historicalOnly=semantic.deriveSemanticAsset(input,stage.declarationRef,raw('statement://historical-only'),source('historical')).assets[0];
  assert.equal(historicalOnly.candidate.statements[0].statementRef,'statement://historical-only');
  const revisionContext={current:value,historicalContext:[historicalOnly]};
  assert.deepEqual(semantic.semanticPredecessorStatementRefs(revisionContext.current),['statement://pure/first','statement://pure/second'],'retained historical asset is not in active input domain');
  assert.ok(semantic.deriveSemanticAsset(value,third.declarationRef,raw('statement://pure/third',['statement://pure/second']),source('third')),'active asset outside declared predecessorStageRefs stays eligible');
  for(const ref of ['statement://pure/third','statement://unknown','statement://historical-only'])assert.equal(semantic.deriveSemanticAsset(value,third.declarationRef,raw('statement://pure/third',[ref]),source('third')),null);
  const {basis,authenticated}=await retainedBasis();
  const owner={...authenticated,stage:third,lifecycle,role:'author',inputDigest:hash(value),inputRef:'component-only:nonempty'};
  const assembly=await componentAssembly(owner,basis,value);assertIdentities(assembly);
  assert.match(assembly.envelope.sections.role.native,/Eligible predecessor statement refs: \["statement:\/\/pure\/first","statement:\/\/pure\/second"\]/);
  assert.deepEqual(assembly.envelope.sections.predecessors,value.assets);
  assert.deepEqual(assembly.envelope.sections.task.taskData,input.taskData);assert.deepEqual(assembly.envelope.sections.task.rubric,third.rubric);
  record('nonempty component',{lookupAndInputAuthenticationDoubled:true,eligible:semantic.semanticPredecessorStatementRefs(value),historicalOnlyRef:historicalOnly.candidate.statements[0].statementRef,historicalRevisionAdmissionNotExercised:true,promptDigest:assembly.manifest.promptDigest});
});
// Retired (T-292 TD-60): the retained native owner authenticates the empty author assembly of the old package; input the RC7 combined-qualification install recorded value gone
