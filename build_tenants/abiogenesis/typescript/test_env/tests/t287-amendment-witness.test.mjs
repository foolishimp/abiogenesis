import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,rm,mkdtemp,copyFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import * as product from '../../build/code/src/product/index.js';
import {projectWorksiteCommandExecutionBudget} from '../../build/code/src/product/worksite_command_execution.js';
import {witnessRef,assessmentSchema} from '../support/default-library.mjs';
import {amendmentWitnessInput,amendmentPrerequisites,amendmentRef,parseExamples,assessUnderRubric,summarizeActorCalls} from '../support/amendment-witness.mjs';
import {seed,standIn,json,definitionPath,amendmentPath,tree,within,standInActor,runWitness,changedPaths,installWitnessTenant} from '../support/amendment-witness-run.mjs';
import {installOncePerFile} from '../support/root-installed-environment.mjs';
// The amendment witness: an accepted specification and a working system exist;
// a person changes one business rule; one governed Public start does the
// affected work, preserves what the amendment does not authorize changing and
// closes only when acceptance and every required review hold for the current
// candidate. The process is defined once (process-definition.json); the
// amendment is the only per-task input.
// The installed Runs share one packed, verified and installed Product per
// recursion bound (W5's smaller bound is a second install); each Run still has
// its own store, workspace and scratch root. The live Run installs for itself.
const sharedInstall=installOncePerFile(bound=>installWitnessTenant({bound}));
const ref=p=>product.governanceRef('graph-function',p),IMPACT=amendmentRef('review','impact'),PRESERVATION=amendmentRef('review','preservation');
const cleanEnv=()=>Object.fromEntries(Object.entries(process.env).filter(([k])=>k!=='NODE_TEST_CONTEXT'));
const nodeTest=(cwd,files)=>{const r=spawnSync(process.execPath,['--test',...files],{cwd,encoding:'utf8',env:cleanEnv()});return {status:r.status,out:r.stdout+r.stderr};};
const SEED_TESTS=['test/approval.test.mjs','test/discount.test.mjs'];
async function scratchCopy(t){const dir=await mkdtemp(join(tmpdir(),'amendment-witness-'));t.after(()=>rm(dir,{recursive:true,force:true}));await cp(seed,dir,{recursive:true});return dir;}

test('seed system: its tests pass on the seed; the amended boundary tests fail until the realization changes',async t=>{
  const dir=await scratchCopy(t),onSeed=nodeTest(dir,SEED_TESTS);
  assert.equal(onSeed.status,0,onSeed.out);assert.match(onSeed.out,/pass 7/);assert.match(onSeed.out,/fail 0/);
  await amendmentWitnessInput({processDefinition:await json(definitionPath),amendment:await json(amendmentPath('approval-threshold')),seedRoot:dir,product});
  await copyFile(join(standIn,'approval-test-corrected.mjs'),join(dir,'test/approval.test.mjs'));
  const amendedTestsOnSeed=nodeTest(dir,SEED_TESTS);
  assert.notEqual(amendedTestsOnSeed.status,0);assert.match(amendedTestsOnSeed.out,/fail 4/,amendedTestsOnSeed.out);
  for(const name of ['a total of exactly 10,000 does not require approval','a total of 7,500 no longer requires approval','approval uses the total after the bulk discount'])
    assert.match(amendedTestsOnSeed.out,new RegExp('✖ '+name),name);
  const acceptance=async()=>(await assessUnderRubric({reviewName:'acceptance',rubricText:await readFile(join(dir,'review/acceptance-rubric.md'),'utf8'),root:dir,candidatePath:'src/approval.mjs',
    sources:[{path:'specification/requirements/REQ-ORDER-APPROVAL.md',digest:product.sha256Bytes(await readFile(join(dir,'specification/requirements/REQ-ORDER-APPROVAL.md')))}]})).criteria.find(c=>c.id==='A1');
  assert.equal((await acceptance()).met,false,'the amended examples fail on the seed realization');
  await copyFile(join(standIn,'approval.mjs'),join(dir,'src/approval.mjs'));
  const amendedTestsOnChange=nodeTest(dir,SEED_TESTS);assert.equal(amendedTestsOnChange.status,0,amendedTestsOnChange.out);assert.match(amendedTestsOnChange.out,/pass 8/);
  assert.equal((await acceptance()).met,true,'the amended examples hold once the threshold changes');
  t.diagnostic(JSON.stringify({seed:'pass 7 fail 0',amendedTestsOnSeed:'fail 4',amendedTestsOnChange:'pass 8 fail 0'}));
});

test('joining function: the amendment is the only per-task input; the input is deterministic, protects the amended requirement and declares complete frames',async t=>{
  const definitionBytes=await readFile(definitionPath),definition=JSON.parse(definitionBytes),amendment=await json(amendmentPath('approval-threshold'));
  assert.deepEqual(Object.keys(amendment).sort(),['statement','text']);
  const [a,b]=[await scratchCopy(t),await scratchCopy(t)];
  const first=await amendmentWitnessInput({processDefinition:definition,amendment,seedRoot:a,product}),second=await amendmentWitnessInput({processDefinition:structuredClone(definition),amendment,seedRoot:b,product});
  assert.deepEqual(first,second,'same definition, amendment and seed give the same input');
  assert.deepEqual(await readFile(definitionPath),definitionBytes,'the process definition is not edited');
  const {state,derivation}=first,original=state.original;
  assert.ok(product.isGovernanceWorkState(state));assert.equal(state.terminal,false);
  assert.equal(await readFile(join(a,'specification/requirements/REQ-ORDER-APPROVAL.md'),'utf8'),amendment.text,'the amendment is applied to the requirement file');
  assert.deepEqual(original.sources.find(s=>s.path==='specification/requirements/REQ-ORDER-APPROVAL.md'),{path:'specification/requirements/REQ-ORDER-APPROVAL.md',digest:product.sha256Bytes(Buffer.from(amendment.text))},'the amended requirement is a protected source');
  assert.deepEqual(derivation.writeRoots,['design/impact-assessment.md','src/approval.mjs','src/order.mjs','test/approval.test.mjs','work/intake-triage.md']);
  for(const path of derivation.writeRoots)assert.ok(!path.startsWith('specification/')&&!path.startsWith('review/'));
  for(const path of ['src/discount.mjs','test/discount.test.mjs','specification/requirements/REQ-ORDER-DISCOUNT.md','specification/PRODUCT.md','review/preservation-rubric.md'])
    assert.ok(original.sources.some(s=>s.path===path),path+' is protected');
  assert.deepEqual(original.workOrders.construction.writeRoots,['src/approval.mjs','src/order.mjs','test/approval.test.mjs']);
  assert.deepEqual([original.assessment.candidatePath,original.assessment.rubricPath,original.assessment.sources],['src/approval.mjs','review/acceptance-rubric.md',
    ['specification/requirements/REQ-ORDER-APPROVAL.md','specification/PRODUCT.md','src/order.mjs','test/approval.test.mjs']]);
  assert.deepEqual(original.reviews.map(r=>[r.reviewRef,r.required,r.assessment.candidatePath,r.assessment.rubricPath,r.assessment.sources,r.order.writeRoots]),[
    [IMPACT,true,'design/impact-assessment.md','review/impact-rubric.md',['specification/requirements/REQ-ORDER-APPROVAL.md','specification/PRODUCT.md'],[]],
    [PRESERVATION,true,'src/order.mjs','review/preservation-rubric.md',['specification/requirements/REQ-ORDER-DISCOUNT.md','src/discount.mjs','test/discount.test.mjs','specification/PRODUCT.md'],[]]]);
  // A frame is a complete statement (REFERENCE_FRAME section 1), with every declared STDO source by exact URI.
  for(const [i,review] of original.reviews.entries()){
    for(const part of ['Evaluation family:','Subject:','Basis:','Authority:','Admissible evidence:','Excluded:','Capability:','Result:','Return:'])assert.ok(review.frame.includes(part),review.reviewRef+' '+part);
    for(const uri of definition.reviews[i].frame.authority.filter(s=>s.startsWith('stdo://')))assert.ok(review.frame.includes(uri),uri);
    assert.ok(review.order.instructions.some(s=>s.startsWith('Applicability: ')),'applicability is explicit');
  }
  // Prerequisites are the consumer Program's declaration, not instruction text.
  assert.deepEqual(amendmentPrerequisites(definition),{construction:[IMPACT],uat:[PRESERVATION]});
  assert.equal(Object.values(original.workOrders).some(o=>o.instructions.some(s=>s.startsWith('Prerequisite'))),false);
  assert.deepEqual(product.governancePrerequisitesUndeclared(original,amendmentPrerequisites(definition)),[]);
  for(const [purpose,requiredReviews] of Object.entries(amendmentPrerequisites(definition)))
    assert.equal(product.governanceTargetPermission({state},{purpose,requiredReviews}).permitted,false,purpose+' waits for its review');
  assert.deepEqual(JSON.parse(await readFile(join(seed,'review/assessment-result.schema.json'),'utf8')),assessmentSchema,'the seed result schema is the consumer assessment contract');
  assert.equal(Buffer.from(original.assessment.schemaAsset.bytesBase64,'base64').toString(),JSON.stringify(assessmentSchema)+'\n');
  assert.equal(original.testing.commands.length,1);assert.deepEqual(original.testing.outcomePredicates.map(p=>[p.predicateKind,p.declaration.equals]),[['process_exit',0]]);
  await assert.rejects(amendmentWitnessInput({processDefinition:definition,amendment:{...amendment,writeRoots:['src/discount.mjs']},seedRoot:a,product}),/statement and new text only/);
});

test('reuse: the same process definition gives a valid input for a discount amendment; a wording-only amendment declares only the reviews that apply',async t=>{
  const definitionBytes=await readFile(definitionPath),definition=JSON.parse(definitionBytes),dir=await scratchCopy(t);
  const {state,derivation}=await amendmentWitnessInput({processDefinition:definition,amendment:await json(amendmentPath('discount-items')),seedRoot:dir,product});
  assert.deepEqual(await readFile(definitionPath),definitionBytes,'no edit to the process definition');
  const original=state.original;assert.ok(product.isGovernanceWorkState(state));assert.equal(derivation.requirementId,'REQ-ORDER-DISCOUNT');
  assert.deepEqual(original.workOrders.construction.writeRoots,['src/discount.mjs','src/order.mjs','test/discount.test.mjs']);
  assert.ok(['src/approval.mjs','test/approval.test.mjs','specification/requirements/REQ-ORDER-APPROVAL.md'].every(p=>original.sources.some(s=>s.path===p)),'the approval rule is now the protected one');
  assert.deepEqual(original.reviews.map(r=>[r.reviewRef,r.assessment.candidatePath,r.assessment.sources]),[
    [IMPACT,'design/impact-assessment.md',['specification/requirements/REQ-ORDER-DISCOUNT.md','specification/PRODUCT.md']],
    [PRESERVATION,'src/order.mjs',['specification/requirements/REQ-ORDER-APPROVAL.md','src/approval.mjs','test/approval.test.mjs','specification/PRODUCT.md']]]);
  assert.equal(original.assessment.candidatePath,'src/discount.mjs');
  // Every declared read, source and subject exists in the amended seed as a file.
  const files=await tree(dir);
  for(const path of [...original.sources.map(s=>s.path),...Object.values(original.workOrders).flatMap(o=>o.readFirst),original.assessment.candidatePath,original.assessment.rubricPath,...original.assessment.sources,
    ...original.reviews.flatMap(r=>[r.assessment.candidatePath==='design/impact-assessment.md'?null:r.assessment.candidatePath,r.assessment.rubricPath,...r.assessment.sources]).filter(Boolean),...original.testing.selectedPaths])assert.ok(files.has(path),path);
  for(const s of original.sources)assert.equal(files.get(s.path),s.digest,s.path);
  // Wording only: the examples are unchanged, so preservation is declared not applicable, with the process's stated reason, and does not gate UAT.
  const wordingDir=await scratchCopy(t),seedText=await readFile(join(seed,'specification/requirements/REQ-ORDER-APPROVAL.md'),'utf8');
  const reworded=seedText.replace('An order whose total is above 5,000 requires manager approval.','Manager approval is required for an order whose total is above 5,000.');
  assert.notEqual(reworded,seedText);assert.deepEqual(parseExamples(reworded),parseExamples(seedText));
  const wording=await amendmentWitnessInput({processDefinition:definition,amendment:{statement:'Reword the approval rule.',text:reworded},seedRoot:wordingDir,product});
  const reason=definition.reviews.find(r=>r.name==='preservation').applicability.notApplicable;
  assert.deepEqual([wording.derivation.examplesChanged,wording.derivation.notApplicable,wording.state.original.reviews.map(r=>[r.reviewRef,r.required,r.notApplicableReason])],
    [false,['preservation'],[[IMPACT,true,undefined],[PRESERVATION,false,reason]]]);
  assert.deepEqual(original.reviews.map(r=>Object.hasOwn(r,'notApplicableReason')),[false,false],'a required review states no reason');
  const prerequisites=amendmentPrerequisites(definition),gates=(purpose,state)=>!product.governanceTargetPermission({state},{purpose,requiredReviews:prerequisites[purpose]}).permitted;
  assert.deepEqual(product.governancePrerequisitesUndeclared(wording.state.original,prerequisites),[],'intake admits the not-applicable declaration with its reason');
  const withReason=text=>({...wording.state.original,reviews:wording.state.original.reviews.map(({notApplicableReason,...r})=>r.reviewRef===PRESERVATION&&text!==undefined?{...r,notApplicableReason:text}:r)});
  for(const [label,text] of [['no reason',undefined],['a blank reason',' \t']])
    assert.deepEqual(product.governancePrerequisitesUndeclared(withReason(text),prerequisites),[PRESERVATION],'intake refuses the not-applicable declaration with '+label);
  assert.equal(gates('uat',wording.state),false,'a review declared not applicable does not gate UAT');assert.equal(gates('construction',wording.state),true,'impact still gates construction');
});

// The actual stand-in actor binary, given an assessment task: the declared
// review and rubric it receives decide the verdict, not the candidate path.
function assessmentPrompt({root,review,assessment,digests}){
  const asset=path=>({path,digest:digests.get(path)});
  return ['Independently assess the exact declared subject.',`Worksite root: ${root}`,
    `Exact assessment basis: ${JSON.stringify({candidate:asset(assessment.candidatePath),rubric:asset(assessment.rubricPath),sources:assessment.sources.map(asset),
      producer:{resultRef:'result:producer',resultDigest:'sha256:'+'0'.repeat(64),cCallRef:'call:producer',actorInvocationRef:'actor:producer'},resultContract:assessment.resultContract})}`,
    'Instructions:',`Declared review: ${JSON.stringify({reviewRef:review.reviewRef,frame:review.frame,required:review.required})}`].join('\n');
}
function runActor(actor,prompt,log){
  const r=spawnSync(actor,['--json-schema',JSON.stringify(assessmentSchema)],{input:prompt,encoding:'utf8',env:{...cleanEnv(),ABI5_AMENDMENT_ACTOR_LOG:log}});
  assert.equal(r.status,0,r.stderr);const rows=r.stdout.trim().split('\n').map(l=>JSON.parse(l));return rows.find(x=>x.type==='result').structured_output;
}
test('the stand-in assessor is discriminating: one candidate, different verdicts under the two declared reviews; a frame/rubric mismatch is indeterminate',async t=>{
  const dir=await scratchCopy(t),{state}=await amendmentWitnessInput({processDefinition:await json(definitionPath),amendment:await json(amendmentPath('approval-threshold')),seedRoot:dir,product});
  await copyFile(join(standIn,'approval.mjs'),join(dir,'src/approval.mjs'));await copyFile(join(standIn,'approval-test-corrected.mjs'),join(dir,'test/approval.test.mjs'));
  const work=await mkdtemp(join(tmpdir(),'amendment-actor-'));t.after(()=>rm(work,{recursive:true,force:true}));
  const actor=await standInActor(work),log=join(work,'actor.jsonl'),digests=await tree(dir);
  const [impact,preservation]=state.original.reviews;
  // The same candidate (src/order.mjs) under each review's own frame, rubric and sources.
  const sameCandidate=review=>({...review.assessment,candidatePath:'src/order.mjs'});
  const underPreservation=runActor(actor,assessmentPrompt({root:dir,review:preservation,assessment:sameCandidate(preservation),digests}),log);
  const underImpact=runActor(actor,assessmentPrompt({root:dir,review:impact,assessment:sameCandidate(impact),digests}),log);
  assert.deepEqual([underPreservation.disposition,underPreservation.unresolvedCriteria],['satisfied',[]]);
  assert.deepEqual([underImpact.disposition,underImpact.unresolvedCriteria],['unmet',['I1','I2','I3','I4','I5']]);
  // The damaged shared realization under the preservation rubric: the discount examples and the import fail.
  await copyFile(join(standIn,'order-damaged.mjs'),join(dir,'src/order.mjs'));
  const damaged=runActor(actor,assessmentPrompt({root:dir,review:preservation,assessment:preservation.assessment,digests:await tree(dir)}),log);
  assert.deepEqual([damaged.disposition,damaged.unresolvedCriteria],['unmet',['P1','P2']]);
  assert.match(damaged.reason,/REQ-ORDER-DISCOUNT 10x100: discount 0 != 50/);
  // The preservation rubric delivered under the impact frame: the frame does not own the rubric.
  const mismatch=runActor(actor,assessmentPrompt({root:dir,review:impact,assessment:preservation.assessment,digests:await tree(dir)}),log);
  assert.deepEqual([mismatch.disposition,mismatch.unresolvedCriteria],['indeterminate',['P1','P2','P3']]);
  const rows=(await readFile(log,'utf8')).trim().split('\n').map(l=>JSON.parse(l));
  assert.deepEqual(rows.map(r=>[r.role,r.frame===null?null:r.frame.slice(0,12),r.candidate.path,r.disposition]),[
    ['assess:'+PRESERVATION,'Preservation','src/order.mjs','satisfied'],['assess:'+IMPACT,'Impact revie','src/order.mjs','unmet'],
    ['assess:'+PRESERVATION,'Preservation','src/order.mjs','unmet'],['assess:'+IMPACT,'Impact revie','src/order.mjs','indeterminate']]);
});

const diagnosticSubject=ref=>JSON.parse(decodeURIComponent(ref.slice(ref.indexOf(',')+1)));
/** Facts every witness Run must show, scripted or live. */
async function assertWitnessOutcome(run){
  const {worksite,input,derivation,preexisting,initialTree,results}=run;
  const parents=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')&&e.payload.value?.kind==='governance_work_state').map(e=>e.payload.value);
  const final=parents.at(-1);
  assert.equal(final.terminal,true);assert.deepEqual(final.unresolvedSupportRefs,[]);assert.ok(product.isGovernanceWorkState(final));
  assert.ok(final.reviewStanding.every(r=>!r.required||r.satisfied&&r.current),'final standing: every required review satisfied and current');
  for(const p of parents)for(const r of p.reviewStanding)if(r.required&&!(r.satisfied&&r.current))assert.equal(p.terminal,false,'never terminal while a required review is adverse, missing or stale');
  // Unrelated requirement, module and test are byte-identical to the seed; every protected source keeps its input digest.
  for(const path of ['specification/requirements/REQ-ORDER-DISCOUNT.md','src/discount.mjs','test/discount.test.mjs'])
    assert.deepEqual(await readFile(join(worksite,path)),await readFile(join(seed,path)),path+' is byte-identical to the seed');
  for(const s of input.original.sources)assert.equal(product.sha256Bytes(await readFile(join(worksite,s.path))),s.digest,s.path);
  // Every changed path of the whole tree lies inside the write roots. Excluded: framework entries present before the
  // seed copy, and the archive root the runtime declares in every transport binding, which it creates inside the
  // worksite during the Run. That archive holds no seed path.
  const archives=[...new Set(run.events.filter(e=>e.kind==='actor_transport_binding_admitted').map(e=>relative(worksite,e.payload.archiveRoot)))];
  assert.equal(archives.length,1);assert.ok(!archives[0].startsWith('..')&&![...initialTree.keys()].some(p=>within(p,archives)&&!preexisting.has(p)),'the archive root holds no seed path');
  const changed=await changedPaths(run);
  assert.deepEqual(changed.filter(p=>!within(p,derivation.writeRoots)),[],'changes outside the write roots: '+changed.join(', '));
  for(const row of final.observations.filter(o=>Array.isArray(o.value.changedPaths)))
    assert.ok(row.value.changedPaths.every(p=>within(p,input.original.workOrders[row.purpose].writeRoots)),row.purpose+' changed '+row.value.changedPaths.join(', '));
  // The final tests pass on the amended threshold boundary, in the Run and again here.
  const testing=final.observations.filter(o=>o.purpose==='testing').at(-1).value;
  assert.ok(testing.commandResults.every(r=>r.exitStatus===0));
  const rerun=nodeTest(worksite,SEED_TESTS);assert.equal(rerun.status,0,rerun.out);assert.match(rerun.out,/fail 0/);
  // Every assessment ran under an actor invocation other than its producer's.
  const choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>e.payload.value);
  const pairs=final.observations.filter(o=>o.purpose==='review'||o.purpose==='uat').map(o=>{
    const subject=choices.find(c=>c.input.value.synthesis.resultRef===o.synthesisResultRef).input.value.synthesis.judgment.subjectEvidenceRef;
    const producer=final.observations.find(p=>p.resultRef===subject);
    assert.ok(producer&&o.actorInvocationRef&&producer.actorInvocationRef);assert.notEqual(o.actorInvocationRef,producer.actorInvocationRef,o.purpose+' '+(o.reviewRef??''));
    return {purpose:o.purpose,reviewRef:o.reviewRef??null,assessor:o.actorInvocationRef,producerPurpose:producer.purpose,producer:producer.actorInvocationRef};});
  return {parents,final,changed,choices,pairs,testing};
}

test('one Public start builds the amendment: impact review once and current, preservation adverse then corrected, closure only when acceptance and both reviews hold',{timeout:900_000},async t=>{
  const proof=await mkdtemp(join(tmpdir(),'amendment-proof-'));t.after(()=>rm(proof,{recursive:true,force:true}));
  const actor=await standInActor(proof),actorLog=join(proof,'actor.jsonl');
  const run=await runWitness(t,{amendment:await json(amendmentPath('approval-threshold')),shared:sharedInstall,actorEnvironment:{ABG_TS_CLAUDE_COMMAND:actor,ABI5_AMENDMENT_ACTOR_LOG:actorLog,ABI5_AMENDMENT_STAND_IN:standIn}});
  const {receipt,events,results,input,worksite}=run;
  const log=(await readFile(actorLog,'utf8').catch(()=>'')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
  if(process.env.ABI5_AMENDMENT_WITNESS_DUMP){await mkdir(process.env.ABI5_AMENDMENT_WITNESS_DUMP,{recursive:true});
    await writeFile(join(process.env.ABI5_AMENDMENT_WITNESS_DUMP,'events.json'),JSON.stringify(events));await copyFile(actorLog,join(process.env.ABI5_AMENDMENT_WITNESS_DUMP,'actor.jsonl')).catch(()=>{});}
  const diagnostic=()=>JSON.stringify({disposition:receipt.ownerOutput?.value?.disposition,roles:log.map(r=>r.role),trace:events.filter(e=>['child_preparation_refused','runtime_failure_observed','actor_invocation_failed','run_stopped'].includes(e.kind))
    .slice(0,6).map(e=>({kind:e.kind,graphFunctionRef:e.graphFunctionRef,payload:JSON.stringify(e.payload).slice(0,1200)}))}).slice(0,9000);
  assert.equal(receipt.failure,null,diagnostic());assert.equal(receipt.ownerOutput.outcomeKind,'result',diagnostic());assert.equal(receipt.ownerOutput.value.disposition,'completed',diagnostic());
  // The choices made, in order, and the stand-in steps they ran.
  assert.deepEqual(log.map(r=>r.role),['select:induction','native:intake-triage','select:design','native:impact-assessment','select:review:'+IMPACT,'assess:'+IMPACT,
    'select:construction','native:construction','select:testing','c2','select:review:'+PRESERVATION,'assess:'+PRESERVATION,
    'select:construction','native:correction','select:testing','c2','select:review:'+PRESERVATION,'assess:'+PRESERVATION,'select:uat','assess:uat'],diagnostic());
  const {parents,final,changed,choices,pairs,testing}=await assertWitnessOutcome(run);
  assert.deepEqual(choices.map(c=>[c.graphFunctionRef,c.input.value.synthesis.judgment.reviewRef]),[[ref('induction'),null],[ref('design'),null],[ref('review'),IMPACT],[ref('construction'),null],
    [ref('testing'),null],[ref('review'),PRESERVATION],[ref('construction'),null],[ref('testing'),null],[ref('review'),PRESERVATION],[ref('uat'),null]]);
  // Each admitted choice of a stage with declared prerequisites was permitted by the standing it was chosen over.
  const prerequisites=amendmentPrerequisites(run.definition);
  for(const c of choices){const purpose=Object.keys(prerequisites).find(p=>c.graphFunctionRef===ref(p));
    if(purpose!==undefined)assert.equal(product.governanceTargetPermission({state:c.input.value},{purpose,requiredReviews:prerequisites[purpose]}).permitted,true,purpose);}
  assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef).length,4,'both frames and acceptance run on the one assessor');
  // Intake triage recorded the change class and the affected surfaces.
  const triage=await readFile(join(worksite,'work/intake-triage.md'),'utf8');
  assert.match(triage,/^Change class: requirement_reprice$/m);assert.match(triage,/^Affected surfaces: src\/approval\.mjs, src\/order\.mjs, test\/approval\.test\.mjs$/m);
  assert.deepEqual(final.observations.find(o=>o.purpose==='induction').value.changedPaths,['work/intake-triage.md']);
  // Impact ran once and stayed satisfied and current through the correction.
  const reviewRows=final.observations.filter(o=>o.purpose==='review');
  assert.deepEqual(reviewRows.map(o=>[o.reviewRef,o.value.disposition,o.value.unresolvedCriteria]),[[IMPACT,'satisfied',[]],[PRESERVATION,'unmet',['P1','P2']],[PRESERVATION,'satisfied',[]]]);
  const impactStanding=p=>p.reviewStanding.find(r=>r.reviewRef===IMPACT),preservationStanding=p=>p.reviewStanding.find(r=>r.reviewRef===PRESERVATION);
  const afterImpact=parents.filter(p=>p.observations.some(o=>o.reviewRef===IMPACT));
  assert.ok(afterImpact.length>=7);for(const p of afterImpact)assert.deepEqual(impactStanding(p),{reviewRef:IMPACT,required:true,resultRef:reviewRows[0].resultRef,satisfied:true,current:true});
  const corrected=parents.filter(p=>p.observations.filter(o=>o.purpose==='construction').length===2);assert.ok(corrected.length>0&&corrected.every(p=>impactStanding(p).current),'the correction left the impact verdict current');
  // Preservation: adverse and current, then adverse and stale after the correction; the Run stayed open throughout.
  const standings=parents.map(p=>[preservationStanding(p).satisfied,preservationStanding(p).current,p.terminal]);
  assert.ok(standings.some(([s,c])=>!s&&c),'adverse and current');assert.ok(standings.some(([s,c],i)=>!s&&!c&&parents[i].observations.some(o=>o.reviewRef===PRESERVATION)),'adverse and stale');
  assert.deepEqual(parents.map(p=>p.terminal),[...parents.slice(1).map(()=>false),true],'only the last parent evaluation closes');
  // The first construction passed its tests: the preservation review, not testing, caught the damage.
  const testingRows=final.observations.filter(o=>o.purpose==='testing');assert.equal(testingRows.length,2);
  assert.ok(testingRows[0].value.commandResults.every(r=>r.exitStatus===0),'the damaged construction passed the declared tests');
  assert.match(testing.commandResults[0].stdout.text,/a total of exactly 10,000 does not require approval/);assert.match(testing.commandResults[0].stdout.text,/fail 0/);
  assert.deepEqual(changed,['design/impact-assessment.md','src/approval.mjs','test/approval.test.mjs','work/intake-triage.md'],'src/order.mjs ends byte-identical to the seed');
  // The frame and rubric reached the assessor and decided its verdict.
  const assessments=log.filter(r=>r.role.startsWith('assess:'));
  for(const a of assessments){assert.equal(a.rubric.digest,a.rubric.declaredDigest);
    if(a.frame!==null)assert.equal(a.frame,input.original.reviews.find(r=>'assess:'+r.reviewRef===a.role).frame);}
  assert.deepEqual(assessments.map(a=>[a.role,a.rubric.path,a.candidate.path,a.criteria.map(c=>c.id+':'+c.met).join(' '),a.disposition]),[
    ['assess:'+IMPACT,'review/impact-rubric.md','design/impact-assessment.md','I1:true I2:true I3:true I4:true I5:true','satisfied'],
    ['assess:'+PRESERVATION,'review/preservation-rubric.md','src/order.mjs','P1:false P2:false P3:true','unmet'],
    ['assess:'+PRESERVATION,'review/preservation-rubric.md','src/order.mjs','P1:true P2:true P3:true','satisfied'],
    ['assess:uat','review/acceptance-rubric.md','src/approval.mjs','A1:true A2:true A3:true','satisfied']]);
  assert.deepEqual(log.find(r=>r.role==='native:correction').actingOn,['P1','P2'],'the correction acts on the adverse review criteria');
  // Actor separation and the evidence summary of every call.
  assert.deepEqual(pairs.map(p=>[p.purpose,p.reviewRef,p.producerPurpose]),[['review',IMPACT,'design'],['review',PRESERVATION,'construction'],['review',PRESERVATION,'construction'],['uat',null,'testing']]);
  const calls=await summarizeActorCalls(events);
  assert.equal(calls.length,log.length,'one summarized actor call per stand-in invocation');
  for(const c of calls){assert.ok(c.actorInvocationRef&&c.actorRef,'actor identity');assert.deepEqual(c.reportedModels,['scripted-stand-in'],'model identity');assert.equal(c.command,actor);}
  assert.equal(new Set(calls.map(c=>c.actorInvocationRef)).size,calls.length,'every call has its own actor invocation');
  assert.equal(events.filter(e=>e.kind==='run_closed').length,1);assert.equal(events.some(e=>e.kind==='runtime_failure_observed'),false);
  t.diagnostic(JSON.stringify({roles:log.map(r=>r.role),parents:parents.length,events:events.length,changed}));
});

// Recoverable step failure (W1-W6). A failed step of a declared recoverable
// class returns to the Executive in the same Run; the next selection task
// carries it as a failed attempt; a write outside the grant stops the Run.
const MAIN=['select:induction','native:intake-triage','select:design','native:impact-assessment','select:review:'+IMPACT,'assess:'+IMPACT,
  'select:construction','native:construction','select:testing','c2','select:review:'+PRESERVATION,'assess:'+PRESERVATION,
  'select:construction','native:correction','select:testing','c2','select:review:'+PRESERVATION,'assess:'+PRESERVATION,'select:uat','assess:uat'];
const SELECT_CLASS=product.governanceRef('diagnostic','missing-owned-select'),TRANSPORT='diagnostic://abiogenesis/worksite/native-work/transport_failure@5';
const actorRows=async path=>(await readFile(path,'utf8').catch(()=>'')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
async function failureRun(t,name,actorEnvironment,options={}){
  const proof=await mkdtemp(join(tmpdir(),'amendment-'+name+'-'));t.after(()=>rm(proof,{recursive:true,force:true}));
  const actor=await standInActor(proof),actorLog=join(proof,'actor.jsonl');
  const run=await runWitness(t,{amendment:await json(amendmentPath('approval-threshold')),shared:sharedInstall,...options,
    actorEnvironment:{ABG_TS_CLAUDE_COMMAND:actor,ABI5_AMENDMENT_ACTOR_LOG:actorLog,ABI5_AMENDMENT_STAND_IN:standIn,...actorEnvironment}});
  const log=await actorRows(actorLog),{events,receipt}=run;
  const recursion=events.filter(e=>e.kind==='child_foldback_admitted'&&typeof e.payload.applicationRef==='string');
  const failedSteps=recursion.filter(e=>e.payload.childDisposition==='failed');
  const result=resultRef=>events.find(e=>e.kind==='c_call_result_admitted'&&e.payload.resultRef===resultRef);
  const parents=run.results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')&&e.payload.value?.kind==='governance_work_state');
  const stops=events.filter(e=>e.kind==='runtime_failure_observed'||e.kind==='run_stopped');
  const diagnostic=()=>JSON.stringify({disposition:receipt.ownerOutput?.value?.disposition,roles:log.map(r=>r.role),
    stops:stops.map(e=>({kind:e.kind,stage:e.payload.stage,reasonRef:e.payload.reasonRef,subject:typeof e.payload.diagnosticRef==='string'&&e.payload.diagnosticRef.startsWith('data:')?diagnosticSubject(e.payload.diagnosticRef):e.payload.diagnosticRef}))}).slice(0,6000);
  return {...run,log,recursion,failedSteps,result,parents,stops,diagnostic};
}
const selections=run=>run.log.filter(r=>r.role.startsWith('select:'));
const closes=async(run)=>{assert.equal(run.receipt.failure,null,run.diagnostic());assert.equal(run.receipt.ownerOutput.value.disposition,'completed',run.diagnostic());
  assert.equal(run.events.filter(e=>e.kind==='run_closed').length,1);assert.equal(run.events.some(e=>e.kind==='runtime_failure_observed'),false);return assertWitnessOutcome(run);};

test('W1: a choice whose prerequisites do not hold is refused before its stage runs; the typed refusal returns to the Executive, the lawful order follows and the Run closes',{timeout:900_000},async t=>{
  const run=await failureRun(t,'early',{ABI5_AMENDMENT_ACTOR_EARLY:'construction'});
  assert.deepEqual(run.log.map(r=>r.role),[...MAIN.slice(0,4),'select:construction',...MAIN.slice(4)],run.diagnostic());
  await closes(run);
  assert.equal(run.failedSteps.length,1);
  const refused=run.result(run.failedSteps[0].payload.childResultRef),subject=diagnosticSubject(refused.payload.value.diagnosticRef);
  assert.equal(refused.payload.resultClass,'failure');
  assert.deepEqual([subject.diagnosticClassRef,subject.computeRegime,subject.implementationRef,subject.stage,subject.relation,subject.selectors,subject.cause],
    [SELECT_CLASS,'F_P',product.governanceRef('implementation','select'),'selector_completion','target_not_permitted',
      {graphFunctionRef:ref('construction'),reviewRef:null,missingReviews:IMPACT,staleReviews:null,missingSelectedPaths:null},null]);
  // Refused before effect: no construction wrapper call opens before the impact review is admitted.
  const firstConstruction=run.events.find(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===ref('construction'));
  assert.ok(firstConstruction.admissionOrdinal>run.failedSteps[0].admissionOrdinal);
  // The next selection sees the failed attempt from the admitted record; the one before saw none.
  const seen=selections(run).map(r=>r.failed);
  assert.deepEqual(seen.slice(0,3),[[],[],[]]);
  assert.deepEqual(seen[3],[{graphFunctionRef:ref('construction'),failureClassRef:SELECT_CLASS,timeoutClass:null,changedPaths:[],
    refusal:{relation:'target_not_permitted',selectors:subject.selectors},resultRef:refused.payload.resultRef}]);
  assert.ok(seen.slice(3).every(f=>f.length===1));
  t.diagnostic(JSON.stringify({relation:subject.relation,selectors:subject.selectors,selections:seen.length}));
});

test('W2: a worker that writes part of its change and exits non-zero returns its attempt with the changed path; the touched review is not current; construction is selected again and the Run closes',{timeout:900_000},async t=>{
  const run=await failureRun(t,'partial',{ABI5_AMENDMENT_ACTOR_FAIL:'correction:exit'});
  assert.deepEqual(run.log.map(r=>r.role),[...MAIN.slice(0,13),'fail:correction','select:construction',...MAIN.slice(13)],run.diagnostic());
  const {final}=await closes(run);
  assert.equal(run.failedSteps.length,1);
  const step=run.failedSteps[0],attempt=selections(run)[7].failed;
  const leaf=run.result(attempt[0].resultRef),value=leaf.payload.value;
  assert.deepEqual([leaf.graphFunctionRef,value.kind,value.failureClass,value.changedPaths,value.after!==null],
    [product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef,'native_workspace_work_failure','transport_failure',['src/order.mjs'],true]);
  assert.deepEqual(attempt,[{graphFunctionRef:ref('construction'),failureClassRef:TRANSPORT,timeoutClass:null,changedPaths:['src/order.mjs'],resultRef:attempt[0].resultRef}]);
  // Preservation's subject is src/order.mjs: adverse and current before the failed attempt, stale after it.
  const standing=p=>p.payload.value.reviewStanding.find(r=>r.reviewRef===PRESERVATION);
  const before=run.parents.filter(p=>p.admissionOrdinal<step.admissionOrdinal).at(-1),after=run.parents.find(p=>p.admissionOrdinal>step.admissionOrdinal);
  assert.deepEqual([standing(before).satisfied,standing(before).current],[false,true]);
  assert.deepEqual([standing(after).satisfied,standing(after).current],[false,false]);
  assert.deepEqual(after.payload.value.observations,before.payload.value.observations,'no failure row enters the work state');
  // The retry cites the failure Result as admissible evidence.
  const retry=run.results.filter(e=>e.payload.value?.kind==='registered_graph_choice'&&e.admissionOrdinal>step.admissionOrdinal)[0].payload.value;
  assert.deepEqual([retry.graphFunctionRef,retry.evidenceRefs],[ref('construction'),[attempt[0].resultRef]]);
  assert.equal(final.observations.filter(o=>o.purpose==='construction').length,2);
  t.diagnostic(JSON.stringify({attempt,before:standing(before),after:standing(after)}));
});

test('W3: a silent worker is contained at inactivity; its failed attempt carries the timeout class; the Run continues and closes',{timeout:900_000},async t=>{
  const dir=await scratchCopy(t),{state}=await amendmentWitnessInput({processDefinition:await json(definitionPath),amendment:await json(amendmentPath('approval-threshold')),seedRoot:dir,product});
  const budget=projectWorksiteCommandExecutionBudget(state.original.testing).requiredExecutionBudgetMs,inactivity=budget+5000;
  const run=await failureRun(t,'silent',{ABI5_AMENDMENT_ACTOR_FAIL:'construction:silent',ABG_TS_FP_TIMEOUT_MS:String(inactivity),ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:String(inactivity*4)});
  assert.deepEqual(run.log.map(r=>r.role),[...MAIN.slice(0,7),'fail:construction','select:construction',...MAIN.slice(7)],run.diagnostic());
  await closes(run);
  const attempt=selections(run)[4].failed;
  assert.deepEqual(attempt,[{graphFunctionRef:ref('construction'),failureClassRef:TRANSPORT,timeoutClass:'inactivity',changedPaths:[],resultRef:attempt[0].resultRef}]);
  assert.equal(run.result(attempt[0].resultRef).payload.value.failureClass,'transport_failure');
  t.diagnostic(JSON.stringify({inactivityMs:inactivity,attempt}));
});

test('W4: a write outside the grant stops the Run; nothing folds back into a selection',{timeout:1_800_000},async t=>{
  // The worker writes outside its grant and exits non-zero: the class is declared, the step folds back
  // failed, and the parent refuses at re-entry from the admitted changed paths.
  const exited=await failureRun(t,'scope-exit',{ABI5_AMENDMENT_ACTOR_FAIL:'construction:scope'});
  assert.deepEqual(exited.log.map(r=>r.role),[...MAIN.slice(0,7),'fail:construction'],exited.diagnostic());
  assert.equal(exited.receipt.ownerOutput.value.disposition,'runtime_failed',exited.diagnostic());
  assert.equal(exited.failedSteps.length,1,exited.diagnostic());
  // The parent's own evaluation is the refused leaf: its failure Result carries the typed refusal.
  const tail=JSON.stringify(exited.events.slice(-14).map(e=>[e.kind,e.graphFunctionRef,e.payload?.resultClass??e.payload?.stage??null]));
  const refusedParent=exited.results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')&&e.payload.resultClass==='failure');
  assert.equal(refusedParent.length,1,exited.diagnostic()+tail);
  const subject=diagnosticSubject(refusedParent[0].payload.value.diagnosticRef);
  assert.deepEqual([subject.diagnosticClassRef,subject.computeRegime,subject.stage,subject.relation,subject.selectors],
    [product.governanceRef('diagnostic','missing-owned-evaluate-parent'),'F_D','parent_reentry','failure_write_outside_grant',{failureResultRef:exited.failedSteps[0].payload.childResultRef}]);
  assert.ok(selections(exited).every(r=>r.failed.length===0));
  const leaf=exited.events.find(e=>e.kind==='c_call_result_admitted'&&e.graphFunctionRef===product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef&&e.payload.resultClass==='failure').payload.value;
  assert.deepEqual([leaf.failureClass,leaf.changedPaths.includes('design/impact-assessment.md')],['transport_failure',true]);
  // The worker writes outside its grant and reports success: the undeclared class stops the Run at the route.
  const reported=await failureRun(t,'scope-success',{ABI5_AMENDMENT_ACTOR_FAIL:'construction:scope-success'});
  assert.deepEqual(reported.log.map(r=>r.role),[...MAIN.slice(0,7),'fail:construction','native:construction'],reported.diagnostic());
  assert.equal(reported.failedSteps.length,0);assert.equal(reported.receipt.ownerOutput.value.disposition,'runtime_failed');
  const route=reported.events.filter(e=>e.kind==='runtime_failure_observed');assert.equal(route.length,1);
  const routeClass=route[0].payload.diagnosticRef.startsWith('data:')?diagnosticSubject(route[0].payload.diagnosticRef).diagnosticClassRef:route[0].payload.diagnosticRef;
  assert.deepEqual([route[0].payload.stage,routeClass],['route','diagnostic://abiogenesis/worksite/native-work/write_scope_violation@5'],reported.diagnostic());
  t.diagnostic(JSON.stringify({reentry:subject.relation,route:routeClass}));
});

test('W5: with a small limit and an always-failing worker, failed steps consume the limit and the Run ends at the blocked stop',{timeout:900_000},async t=>{
  // Bound 4 admits four parent evaluations and so three steps (REQ-L-GTL3-RECURSE-007).
  const run=await failureRun(t,'limit',{ABI5_AMENDMENT_ACTOR_FAIL:'intake-triage:exit:99'},{bound:4});
  assert.deepEqual(run.log.map(r=>r.role),['select:induction','fail:intake-triage','select:induction','fail:intake-triage','select:induction','fail:intake-triage'],run.diagnostic());
  assert.equal(run.receipt.ownerOutput.value.disposition,'blocked',run.diagnostic());
  assert.deepEqual(run.stops.map(e=>[e.kind,e.payload.reasonRef]),[['run_stopped','reason://abiogenesis/recursion/bound-exhausted@5']]);
  assert.deepEqual(run.recursion.map(e=>e.payload.childDisposition),['failed','failed','failed']);
  const seen=selections(run).map(r=>r.failed);
  assert.deepEqual(seen.map(f=>f.length),[0,1,2]);
  assert.deepEqual(seen[2].map(a=>[a.graphFunctionRef,a.failureClassRef,a.changedPaths]),[[ref('induction'),TRANSPORT,['work/intake-triage.md']],[ref('induction'),TRANSPORT,[]]]);
  t.diagnostic(JSON.stringify({stops:run.stops.length,failedSteps:run.failedSteps.length}));
});

test('W6: after a restated design makes impact stale, construction is refused again until impact is re-satisfied, then the Run closes',{timeout:900_000},async t=>{
  const run=await failureRun(t,'stale',{ABI5_AMENDMENT_ACTOR_REDESIGN:'1'});
  assert.deepEqual(run.log.map(r=>r.role),[...MAIN.slice(0,6),'select:design','native:impact-assessment:restated','select:construction','select:review:'+IMPACT,'assess:'+IMPACT,...MAIN.slice(6)],run.diagnostic());
  await closes(run);
  assert.equal(run.failedSteps.length,1);
  const refused=run.result(run.failedSteps[0].payload.childResultRef),subject=diagnosticSubject(refused.payload.value.diagnosticRef);
  assert.deepEqual([subject.diagnosticClassRef,subject.relation,subject.selectors],[SELECT_CLASS,'target_not_permitted',
    {graphFunctionRef:ref('construction'),reviewRef:null,missingReviews:null,staleReviews:IMPACT,missingSelectedPaths:null}]);
  const impact=p=>p.payload.value.reviewStanding.find(r=>r.reviewRef===IMPACT);
  const atRefusal=run.parents.filter(p=>p.admissionOrdinal<run.failedSteps[0].admissionOrdinal).at(-1);
  assert.deepEqual([impact(atRefusal).satisfied,impact(atRefusal).current],[true,false]);
  const reviews=run.parents.at(-1).payload.value.observations.filter(o=>o.reviewRef===IMPACT);
  assert.equal(reviews.length,2);assert.ok(reviews.every(o=>o.value.disposition==='satisfied'));
  t.diagnostic(JSON.stringify({relation:subject.relation,selectors:subject.selectors}));
});
test('a task that omits a review its Program names is refused at selection intake: no actor call, no write; the event log names the review',{timeout:900_000},async t=>{
  const proof=await mkdtemp(join(tmpdir(),'amendment-intake-'));t.after(()=>rm(proof,{recursive:true,force:true}));
  const actor=await standInActor(proof),actorLog=join(proof,'actor.jsonl');
  const run=await runWitness(t,{amendment:await json(amendmentPath('approval-threshold')),shared:sharedInstall,actorEnvironment:{ABG_TS_CLAUDE_COMMAND:actor,ABI5_AMENDMENT_ACTOR_LOG:actorLog,ABI5_AMENDMENT_STAND_IN:standIn},
    adjust:state=>product.constructGovernanceWorkState({...state.original,reviews:state.original.reviews.filter(r=>r.reviewRef!==PRESERVATION)})});
  const {receipt,events}=run;
  assert.equal(await readFile(actorLog,'utf8').catch(()=>''),'');assert.equal(events.some(e=>e.kind==='actor_invocation_started'),false);
  assert.deepEqual(await changedPaths(run),[]);
  const failures=events.filter(e=>e.kind==='runtime_failure_observed');assert.equal(failures.length,1);
  const subject=diagnosticSubject(failures[0].payload.diagnosticRef);
  assert.deepEqual([subject.computeRegime,subject.diagnosticClassRef,subject.implementationRef,subject.stage,subject.relation,subject.selectors],
    ['F_D',product.governanceRef('diagnostic','missing-owned-prepare-selection'),product.governanceRef('implementation','prepare-selection'),'selection_intake','process_review_undeclared',{reviewRefs:PRESERVATION}]);
  assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
  t.diagnostic(JSON.stringify({stage:failures[0].payload.stage,diagnosticClassRef:subject.diagnosticClassRef,relation:subject.relation,selectors:subject.selectors}));
});

const STDO_COVERAGE=`# STDO relations exercised by the amendment witness

Basis: stdo://releases/v3.0.4/. This is one amendment workflow on a small
system. It exercises the relations below and no others.

| STDO relation | Source | Exercised | How, or why not |
|---|---|---|---|
| Universal intake triage | stdo://releases/v3.0.4/standards/SPEC_METHOD.md#universal-intake-triage | yes | intake-triage stage records class, re-entry and surfaces |
| Change classes | stdo://releases/v3.0.4/standards/SPEC_METHOD.md#change-classes | yes | requirement_reprice recorded and checked by the impact rubric |
| Change impact and evidence reuse | stdo://releases/v3.0.4/standards/FOUNDATIONS.md#change-impact-and-evidence-reuse | partly | impact assessment names affected and preserved surfaces; reuse is the runtime's currentness, not an S_Δ selection |
| Preservation through construction | stdo://releases/v3.0.4/standards/FOUNDATIONS.md#preservation-through-construction | partly | preservation review checks unchanged requirements' examples on one shared file |
| Reference frame as engagement unit | stdo://releases/v3.0.4/standards/REFERENCE_FRAME.md#1-the-frame-as-the-engagement-unit | yes | each review declares family, subject, basis, authority, evidence, exclusions, capability, result, return |
| Closed results | stdo://releases/v3.0.4/standards/REFERENCE_FRAME.md#rf-012-closed-results | partly | satisfied/unmet/indeterminate only; out_of_frame and invalid_basis have no value in the result contract |
| Independent assessment | stdo://releases/v3.0.4/standards/EVALUATION.md#3-independent-assessment | partly | distinct actor invocation per assessment; one model family serves every role, which by the section's default is not independent |
| Assurance subject acquisition | stdo://releases/v3.0.4/standards/ASSURANCE.md#11-assurance-subject-acquisition-and-evaluation | partly | the assessor reads the current worksite and the admitted Testing result |
| Product, intent, goal repricing | stdo://releases/v3.0.4/standards/SPEC_METHOD.md#change-classes | no | the amendment is a requirement change only |
| Ticketing and work-item carriers | stdo://releases/v3.0.4/standards/TICKETS.md | no | no ticket is created or closed |
| Design records and modules | stdo://releases/v3.0.4/standards/DESIGN_MODULE.md | no | the impact assessment is the only design output |
| Release and qualification | stdo://releases/v3.0.4/standards/RELEASE.md | no | no release cut |
| Human decision and re-entry above Requirements | stdo://releases/v3.0.4/standards/SPEC_METHOD.md#universal-intake-triage | no | ABIogenesis 5.0 has no human-response path; zero interventions holds by construction |
| Prerequisite order between stages | process-definition.json prerequisites | yes | declared on the consumer Program's executive step; only permitted work can be selected next, and an early choice is refused before its stage runs and returns to the Executive |
`;
test('live: the same amendment witness against a real provider writes its evidence',{timeout:3_600_000,skip:process.env.ABI5_AMENDMENT_WITNESS_LIVE!=='1'&&"ABI5_AMENDMENT_WITNESS_LIVE is not '1'; selects the live amendment witness"},async t=>{
  const evidence=process.env.ABI5_AMENDMENT_WITNESS_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-amendment-witness-'));
  await mkdir(evidence,{recursive:true});const save=(n,v)=>writeFile(join(evidence,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'});
  const provider=await json(process.env.ABI5_NATIVE_SELECTION_PROVIDER);
  assert.equal(await product.sha256File(provider.executable),provider.sha256);await save('provider.json',provider);
  const amendment=await json(amendmentPath('approval-threshold'));await save('amendment.json',amendment);await save('process-definition.json',await json(definitionPath));
  const accounting={wallMs:{}},started=performance.now();
  const run=await runWitness(t,{amendment,keep:true,accounting,actorEnvironment:{ABG_TS_CLAUDE_COMMAND:provider.executable,ABG_TS_CLAUDE_APPEND_ARGS:JSON.stringify(provider.appendArgs??[])}});
  const elapsedMs=performance.now()-started,{receipt,events,results}=run;
  await save('input.json',run.input);await save('derivation.json',run.derivation);await save('events.json',events);await save('receipt.json',receipt);
  const calls=await summarizeActorCalls(events);await save('actor-calls.json',calls);
  // Elapsed time per Executive step: from each registered choice to the parent evaluation that follows it.
  const parentEvents=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive'));
  const steps=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>{const p=parentEvents.find(x=>x.admissionOrdinal>e.admissionOrdinal);
    return {graphFunctionRef:e.payload.value.graphFunctionRef,reviewRef:e.payload.value.input.value.synthesis.judgment.reviewRef??null,elapsedMs:p?Date.parse(p.eventTime)-Date.parse(e.eventTime):null};});
  const sum=k=>calls.every(c=>c[k]===null)?null:calls.reduce((n,c)=>n+(typeof c[k]==='number'?c[k]:0),0);
  const tokens=calls.every(c=>c.usage===null)?null:calls.reduce((n,c)=>n+(c.usage?.input_tokens??0)+(c.usage?.output_tokens??0)+(c.usage?.cache_read_input_tokens??0)+(c.usage?.cache_creation_input_tokens??0),0);
  const measures={elapsedMs,setup:accounting,executionMs:run.execution.wallMs,steps,costUsd:sum('costUsd'),tokens,actorCalls:calls.length,
    models:[...new Set(calls.flatMap(c=>c.reportedModels))],humanInterventions:0,humanInterventionsBasis:'one Public start and no further caller request; 5.0 has no human-response path',
    outcome:receipt.ownerOutput};
  await save('measures.json',measures);await save('stdo-coverage.md',STDO_COVERAGE);
  await cp(run.worksite,join(evidence,'worksite-result'),{recursive:true});
  assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
  const outcome=await assertWitnessOutcome(run);await save('outcome.json',{changed:outcome.changed,pairs:outcome.pairs,standing:outcome.final.reviewStanding});
  for(const c of calls){assert.ok(c.actorInvocationRef);assert.ok(c.reportedModels.length>0,'the provider reports its model');}
  t.diagnostic(evidence);
});
