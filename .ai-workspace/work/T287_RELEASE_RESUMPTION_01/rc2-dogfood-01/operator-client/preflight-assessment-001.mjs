import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {createInterface} from 'node:readline';
import {assessmentSelection} from './consumer.mjs';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const root='/Users/jim/src/apps/abiogenesis-rc2-dogfood';
const {isNativeWorkspaceAssessmentSelection}=await import('/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.1/node_modules/@abiogenesis/typescript-tenant/build/code/src/product/native_workspace_assessment.js');
const input=JSON.parse(await readFile(base+'/workload-diagnostic-04.json','utf8'));
let producer;
for await(const line of createInterface({input:createReadStream(base+'/setup-001/resources/events/runtime.events.jsonl'),crlfDelay:Infinity})){
 const e=JSON.parse(line);
 if(e.kind==='c_call_result_admitted'&&e.payload.resultRef==='result://abiogenesis/17d2bfc0a198201d6e1c75ac027ca5f6414ba12f2a234b2eea92e035cae12f3b'){
 producer={resultRef:e.payload.resultRef,resultDigest:e.payload.resultDigest,cCallRef:e.aggregateId,actorInvocationRef:e.payload.value.provenance.actorInvocationRef};break;
 }
}
if(!producer)throw new Error('Actual admitted Testing producer missing');
const asset=async path=>({path,digest:'sha256:'+createHash('sha256').update(await readFile(root+'/'+path)).digest('hex')});
const original={resultContract:assessmentSelection.resultContract,schemaAsset:assessmentSelection.schemaAsset,sources:await Promise.all(input.assessment.sources.map(asset)),candidate:await asset(input.assessment.candidatePath),rubric:await asset(input.assessment.rubricPath),producer};
const corrected={...original,sources:original.sources.filter(s=>s.path!==original.rubric.path)};
const record={at:new Date().toISOString(),classification:'Pure exact installed assessment-selection comparison; no UAT task admission or assessor verdict',producer,originalAccepted:isNativeWorkspaceAssessmentSelection(original),onlyRubricRemovedFromSourcesAccepted:isNativeWorkspaceAssessmentSelection(corrected),originalSourcePaths:original.sources.map(s=>s.path),correctedSourcePaths:corrected.sources.map(s=>s.path),rubricPath:original.rubric.path};
if(record.originalAccepted!==false||record.onlyRubricRemovedFromSourcesAccepted!==true)throw new Error('Expected discriminator did not hold');
await writeFile(base+'/assessment-configuration-discriminator-001.json',JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(record));
