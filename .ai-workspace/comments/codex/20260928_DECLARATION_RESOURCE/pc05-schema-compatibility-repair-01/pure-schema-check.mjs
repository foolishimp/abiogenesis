import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {ASSESSMENT_SCHEMA,ASSESSMENT_SCHEMA_TEXT,rawContract} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/native-continuation-contracts.mjs';
import {nativeWorkspaceAssessmentSchema,parseNativeWorkspaceAssessmentResult} from '../../../../../build_tenants/abiogenesis/typescript/build/code/src/product/native_workspace_assessment.js';
import {composeWorkerTransportArgs,constructKnownWorkerTransportContract} from '../../../../../build_tenants/abiogenesis/typescript/build/code/src/abg/transport_contracts.js';
const started=performance.now(), digest=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
const preimage=await readFile(new URL('./preimage-4.txt',import.meta.url),'utf8');
const old=JSON.parse(preimage.split('export const ASSESSMENT_SCHEMA = ')[1].split('\n};')[0]+'\n}');
const {$schema:marker,...unchanged}=old; assert.deepEqual(ASSESSMENT_SCHEMA,unchanged);
assert.equal(marker,'https://json-schema.org/draft/2020-12/schema');
const select=schema=>({resultContract:rawContract,schemaAsset:{productId:'product://component/exact-schema',contractId:rawContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(schema)).toString('base64')}});
for(const schema of [old,ASSESSMENT_SCHEMA])assert.deepEqual(nativeWorkspaceAssessmentSchema(select(schema)),schema);
for(const wrong of [null,'http://json-schema.org/draft-07/schema#'])assert.equal(nativeWorkspaceAssessmentSchema(select({...ASSESSMENT_SCHEMA,$schema:wrong})),null);
const retainedPath='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/pc05-06/execution/terminal-value.json';
const retainedBytes=await readFile(retainedPath);const actual=JSON.parse(retainedBytes).assessmentObservation.assessment;
assert.equal(actual.criteria.length,5);
const mutated=change=>{const value=structuredClone(actual);change(value);return JSON.stringify(value);};
const cases=[['actual typed assessment',JSON.stringify(actual),true],['malformed JSON','{',false],
 ['duplicate key',JSON.stringify(actual).replace('"kind":','"kind":"wrong","kind":'),false],
 ['wrong kind',mutated(x=>x.kind='wrong'),false],['extra root property',mutated(x=>x.extra=true),false],
 ['missing criteria',mutated(x=>delete x.criteria),false],['empty criteria',mutated(x=>x.criteria=[]),false],
 ['invalid disposition',mutated(x=>x.criteria[0].disposition='approved'),false],['empty rationale',mutated(x=>x.criteria[0].rationale=''),false],
 ['missing nested evidence quote',mutated(x=>delete x.criteria[0].evidence[0].quote),false],
 ['selected residual with null criterion',mutated(x=>x.residuals=[{scope:'selected-assessment',criterionRef:null,description:'mechanical schema case; no semantic acceptance'}]),true]];
const results=cases.map(([label,text,valid])=>{const before=parseNativeWorkspaceAssessmentResult(old,text),after=parseNativeWorkspaceAssessmentResult(ASSESSMENT_SCHEMA,text);assert.equal(before!==null,valid,label);assert.deepEqual(after,before,label);return {label,schemaValid:valid};});
const args=composeWorkerTransportArgs({contract:constructKnownWorkerTransportContract('claude',{environment:{}}),prompt:'No invocation is performed',outputPath:'/component/output',lane:'worker_executes',responseJsonSchema:ASSESSMENT_SCHEMA,environment:{}});
assert.equal(args[args.indexOf('--json-schema')+1],JSON.stringify(ASSESSMENT_SCHEMA));
await writeFile(new URL('./authored-schema.json',import.meta.url),ASSESSMENT_SCHEMA_TEXT);
await writeFile(new URL('./old-schema.json',import.meta.url),JSON.stringify(old)+'\n');
const report={scope:'Pure schema/argument comparison; retained assessment remains historically unsatisfied under unchanged GLC interpretation',elapsedMs:performance.now()-started,onlyRemovedMetadata:'$schema',oldAssetSha256:digest(JSON.stringify(old)+'\n'),newAssetSha256:digest(ASSESSMENT_SCHEMA_TEXT),oldAssetBytes:Buffer.byteLength(JSON.stringify(old)+'\n'),newAssetBytes:Buffer.byteLength(ASSESSMENT_SCHEMA_TEXT),exactArgumentEquality:true,retained:{path:retainedPath,sha256:digest(retainedBytes),criteria:actual.criteria.length},cases:results};
await writeFile(new URL('./pure-schema-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
