// Pure component discriminator over retained PC05-06 values. Synthetic
// observations below are unadmitted premises, never runtime or semantic proof.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import * as product from '@abiogenesis/typescript-tenant/product';
import {assessmentEvidence,constructionAssessmentTask,constructionAssessmentOutput} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/program-construction-runtime.mjs';
const here=import.meta.dirname,root='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-06';
const start=performance.now(),timings={};
const measure=(name,f)=>{const start=performance.now(),value=f();timings[name]=performance.now()-start;return value;};
const rawFile=await fs.readFile(root+'/execution/terminal-value.json');
assert.equal(product.sha256Bytes(rawFile),'sha256:fdd30fce48071ed4b07befbd57b1bc7a6dcbedd2951e1386a0ff223fee2aa8e8');
const retained=JSON.parse(rawFile),input=retained.assessmentInput,before=product.sha256Canonical(input);
const evidence=measure('evidenceMs',()=>assessmentEvidence(input));
const task=measure('taskMs',()=>constructionAssessmentTask(input));
const records=evidence.records,authors=input.evaluationState.evaluationInput.constructionObservations;
assert.equal(records.length,15);assert.equal(records.filter(r=>r.role==='construction_record').length,14);
const instruction=prefix=>task.instructions.find(s=>s.startsWith(prefix));
const parseInstruction=prefix=>JSON.parse(instruction(prefix).slice(prefix.length));
assert.deepEqual(parseInstruction('Complete required computed-record citation set: '),records.map(r=>r.label));
assert(instruction('Response acceptance conditions: ').includes('EACH required role'));
assert(instruction('Response acceptance conditions: ').includes('cite EVERY selected computed record'));
assert(instruction('Exact criterion/required-role/allowed-label mapping: ').includes('preserving whitespace and newlines'));
assert(instruction('A selected-assessment residual prevents overall satisfaction'));
assert(instruction('The joined construction observations below').includes('producerDutyRef is null'));
const projected=parseInstruction('Actual author reports, verbatim and non-closing; assess every reported residual against its selected or outside scope: ');
assert.equal(projected.length,authors.length);let reportCount=0;
for(const row of authors) {
  const actual=row.observation,p=projected.find(p=>p.observation.ref===actual.observationRef);assert(p);
  assert.deepEqual(p.task,Object.fromEntries(['outcome','instructions','readFirst','writeRoots','checks'].map(k=>[k,actual.task[k]])));
  assert.deepEqual(p.report,actual.report);assert.deepEqual(p.changedPaths,actual.changedPaths);assert.deepEqual(p.provenance,actual.provenance);
  assert.deepEqual(Object.keys(p).sort(),['changedPaths','dutyRefs','groupRef','observation','provenance','report','task']);
  reportCount+=actual.report.gaps.length;
}
assert.equal(reportCount,12);
assert(projected.some(p=>p.task.instructions.some(s=>s.includes('Retain correct existing content when warranted by actual derivation'))));
for(const record of records)assert(task.instructions.some(s=>s.endsWith('\n'+record.text)));
for(const key of Object.keys(task).filter(k=>k!=='instructions'))assert.deepEqual(task[key],retained.assessmentObservation.task[key]);
const synthetic={kind:retained.assessmentObservation.assessment.kind,criteria:evidence.criteria.map(c=>({
  criterionRef:c.criterionRef,disposition:'satisfied',rationale:'Unadmitted component premise; no semantic assessment or acceptance.',
  evidence:[...new Set(Object.values(evidence.roleLabels[c.criterionRef]).flat())].filter(path=>evidence.bytes.get(path).length)
    .map(path=>({path,quote:evidence.bytes.get(path).slice(0,32)}))})),residuals:[]};
function observation(assessment) {
  const body={kind:'native_workspace_work_observation',schemaVersion:'5.0.0',task,before:task.context,after:task.context,
    changedPaths:[],report:null,assessment,provenance:{...retained.assessmentObservation.provenance,
      actorInvocationRef:'actor://component/unadmitted-assessment-contract',cCallRef:'c-call://component/unadmitted-assessment-contract'}};
  const digest=product.sha256Canonical(body),value={...body,observationRef:'native-work-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};
  assert(product.isNativeWorkspaceWorkObservation(value));return value;
}
const interpret=raw=>constructionAssessmentOutput(product.constructRetainedGraphInput(input,observation(raw)));
const positive=measure('completeSyntheticMs',()=>interpret(synthetic));assert.equal(positive.assessmentDisposition,'satisfied');
assert.equal(positive.semanticClosure,'not_claimed');assert.equal(positive.originalTaskCompletion,'not_claimed');
const controls={};
for(const [name,mutate,diagnostic] of [
  ['missingRole',raw=>{raw.criteria[0].evidence=raw.criteria[0].evidence.filter(e=>!evidence.roleLabels[raw.criteria[0].criterionRef].oracle.includes(e.path));},'missing_declared_evidence_role:'],
  ['missingEdge',raw=>{for(const c of raw.criteria)c.evidence=c.evidence.filter(e=>e.path!==records[2].label);},'computed_record_coverage_missing:'],
  ['newlineQuote',raw=>{raw.criteria[0].evidence.push({path:'design/test-design.md',quote:'Each file declares exactly one test through test().'});},'evidence_quote_mismatch:'],
  ['selectedResidual',raw=>{raw.residuals.push({scope:'selected-assessment',criterionRef:raw.criteria[0].criterionRef,description:'Unresolved selected component premise.'});},null],
]) {
  const raw=structuredClone(synthetic);mutate(raw);const result=measure(name+'Ms',()=>interpret(raw));assert.equal(result.assessmentDisposition,'unsatisfied');
  if(diagnostic)assert(result.interpretation.diagnostics.some(d=>d.startsWith(diagnostic)));
  controls[name]={assessmentDisposition:result.assessmentDisposition,diagnostics:result.interpretation.diagnostics};
}
assert(evidence.bytes.get('design/test-design.md').includes('Each file declares exactly\none test through test().'));
const outside=structuredClone(synthetic);outside.residuals.push({scope:'outside-assessment',criterionRef:null,description:'Unadmitted outside-scope component premise retained.'});
assert.equal(measure('outsideResidualMs',()=>interpret(outside)).assessmentDisposition,'satisfied');
// Reinterpret the unchanged actual output with the same evidence checker;
// the replacement task/observation is an explicitly unadmitted component value.
const actual=measure('actualOutputMs',()=>interpret(retained.assessmentObservation.assessment));
assert.equal(actual.assessmentDisposition,'unsatisfied');assert.deepEqual(actual.interpretation,retained.interpretation);
assert.deepEqual(actual.assessmentObservation.assessment,retained.assessmentObservation.assessment);
// The retained installed implementation also reads its exact original task.
const frozenPath=root+'/products/construction/node_modules/@odd-glc/route-one-typescript/build/program-construction-runtime.mjs';
const frozen=await import(pathToFileURL(frozenPath));
const original=measure('frozenActualOutputMs',()=>frozen.constructionAssessmentOutput(product.constructRetainedGraphInput(input,retained.assessmentObservation)));
assert.deepEqual(original,retained);
const oldTask=retained.assessmentObservation.task,bytes=x=>Buffer.byteLength(product.canonicalJson(x));
const size={taskBefore:bytes(oldTask),taskAfter:bytes(task),taskGrowth:bytes(task)-bytes(oldTask)};
if(typeof product.renderNativeWorkspaceWorkOrder==='function') {
  const old=product.renderNativeWorkspaceWorkOrder(oldTask),next=product.renderNativeWorkspaceWorkOrder(task);
  const prompt=await fs.readFile(root+'/invocation/archives/fp-acf53f1bff5e640d-prompt.txt','utf8');
  assert(prompt.includes(old));size.nativeOrderBefore=Buffer.byteLength(old);size.nativeOrderAfter=Buffer.byteLength(next);
  size.archivedPromptBefore=Buffer.byteLength(prompt);size.projectedSameEnvelopePromptAfter=Buffer.byteLength(prompt.replace(old,next));
  size.promptGrowth=size.nativeOrderAfter-size.nativeOrderBefore;
  assert(task.instructions.every(s=>next.includes(s)));
}
assert.equal(product.sha256Canonical(input),before);assert.equal(product.sha256Bytes(await fs.readFile(root+'/execution/terminal-value.json')),product.sha256Bytes(rawFile));
const result={scope:'pure component premises and retained installed pure interpretation; no runtime admission/provider/history acquisition',
  inputDigest:before,retainedFileDigest:product.sha256Bytes(rawFile),oldTaskDigest:product.sha256Canonical(oldTask),newTaskDigest:product.sha256Canonical(task),
  records:records.length,constructionRecords:14,verbatimReports:reportCount,syntheticDisposition:positive.assessmentDisposition,controls,
  actualDisposition:actual.assessmentDisposition,actualInterpretationUnchanged:true,frozenActualTerminalUnchanged:true,
  selectedActualResiduals:retained.assessmentObservation.assessment.residuals.filter(r=>r.scope==='selected-assessment').length,
  sizes:size,timings,totalMs:performance.now()-start};
await fs.writeFile(here+'/actual-input-result.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
