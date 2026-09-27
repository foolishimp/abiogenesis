import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import * as product from '@abiogenesis/typescript-tenant/product';
import * as runtime from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/program-construction-runtime.mjs';
import {deriveNativeRecords} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/fixtures/program-construction/native-records-evaluator.mjs';
const here=new URL('./',import.meta.url),path=new URL('../pc05-evaluation-triage-01/retained-input.json',here);
const bytes=await fs.readFile(path),input=JSON.parse(bytes),digest=product.sha256Canonical(input);
assert.equal(digest,'sha256:99c58acf6b87ae9dc8ca2fa49144e38217fe6040add0ee81b92b99d37c1142d2');
const phases={},measure=(key,fn)=>{const start=performance.now(),value=fn();phases[key]=performance.now()-start;return value;};
const view=measure('prepareEvaluationMs',()=>runtime.constructedEvaluationInput(input));
const records=measure('evaluatorMs',()=>deriveNativeRecords(view));
const evaluated=measure('evaluationJoinMs',()=>runtime.evaluationOutput(product.constructRetainedGraphInput(view,records)));
const assessmentInput=measure('prepareAssessmentMs',()=>runtime.constructionAssessmentInput(product.constructRetainedGraphInput(input.entry,evaluated)));
const task=measure('prepareAssessmentTaskMs',()=>runtime.constructionAssessmentTask(assessmentInput));
const rows=view.constructionObservations,reports=rows.flatMap(row=>row.observation.report.gaps);
assert.equal(reports.length,12);assert.equal(input.source.disposition,'partial');
assert.deepEqual(rows,input.source.constructionObservations);
for(const row of rows)assert(task.instructions.some(s=>s.includes(product.canonicalJson(row.observation.report))&&
  s.includes(row.observation.observationRef)&&s.includes(product.canonicalJson(row.observation.provenance))));
assert.deepEqual(JSON.parse(assessmentInput.oracle.text),input.entry.origin.assessmentBasis.evaluationData);
assert.equal(product.sha256Canonical(input),digest);
assert.equal(crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex'),crypto.createHash('sha256').update(bytes).digest('hex'));
const result={status:'actual_retained_input_pure_path_passed',inputDigest:digest,inputBytes:bytes.length-1,phases,
  authorReports:reports.length,authorObservations:rows.length,constructionDisposition:input.source.disposition,
  constructionEdges:records.records.constructionEdges.length,edgeVerdicts:records.records.constructionEdges.map(r=>r.verdict),
  completeReportObservations:records.records.constructionEdges.map(r=>r.contentObservations.completeReport.value),
  comparisonVerdict:records.records.comparison.verdict,assessmentRecordSelections:assessmentInput.selection.recordSelections.length,
  assessmentTaskDigest:task.taskDigest,assessmentTaskBytes:Buffer.byteLength(product.canonicalJson(task)),
  inputAndHistoricalAuthorUnchanged:true,verbatimReportsProjected:true,originalOracleConserved:true,
  limits:'Pure original prepared-input path only; no historical owner acquisition, no synthetic native observation, no evaluator admission, no assessor dispatch/judgment or closure claim. Suffix owner authentication/current binding cover are separately bounded component premises until installed proof.'};
await fs.writeFile(new URL('actual-input-check.json',here),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
