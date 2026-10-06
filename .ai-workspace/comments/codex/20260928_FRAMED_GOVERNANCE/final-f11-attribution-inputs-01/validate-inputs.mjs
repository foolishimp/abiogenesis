// Finite current installed schemas and byte/span correspondence only.
// No QualificationAssessmentTask, fabricated J/O or native proof is constructed.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const D=import.meta.dirname, C=resolve(D,'../final-candidate-construction-01');
const I=join(C,'install/node_modules/@abiogenesis/typescript-tenant');
const load=async name=>import(pathToFileURL(join(I,'build/code/src',name+'.js')).href);
const q=await load('validator/qualification_contracts');
const dg=await load('shared/digests');
const v=createRequire(join(I,'package.json'))('valibot');
const read=name=>JSON.parse(fs.readFileSync(join(D,name),'utf8'));
const write=(name,body)=>fs.writeFileSync(join(D,name),JSON.stringify(body,null,2)+'\n',{flag:'wx'});
const input=read('external-record-materials.json');
const chainInputs=read('source-chain-inputs.json');
const inventory=read('inventory-attribution-coverage.json');
assert.equal(new Set(input.records.map(r=>r.ref)).size,input.records.length);
const materialMap=new Map(input.records.map(r=>[r.ref,r]));
for(const m of input.records){
  v.parse(q.QUALIFICATION_MATERIAL_SCHEMA,m);
  const b=Buffer.from(m.contentBase64,'base64');
  assert.equal(b.toString('base64'),m.contentBase64);
  assert.equal(b.length,m.byteCount);assert.equal(dg.sha256Bytes(b),m.digest);
}
for(const row of inventory.members) v.parse(q.QUALIFICATION_SOURCE_SCHEMA,row.member);
let spanCount=0;
for(const row of chainInputs.chains){
  const chain=row.candidateChain;
  assert.equal(chain.actorIdentityRef,null);assert.equal(chain.authorityRef,null);
  for(const span of chain.attributionSources){
    const m=materialMap.get(span.sourceRef);assert.ok(m);
    const b=Buffer.from(m.contentBase64,'base64');
    assert.ok(span.startByte<span.endByte&&span.endByte<=b.length);
    const part=b.subarray(span.startByte,span.endByte);
    assert.equal(dg.sha256Bytes(part),span.spanDigest);
    new TextDecoder('utf-8',{fatal:true}).decode(part);spanCount++;
  }
}
const digest=dg.sha256Canonical(input.records);
const recordSet={ref:'construction-record-set://abiogenesis/'+digest.slice(7),digest};
v.parse(q.QUALIFICATION_COORDINATE_SCHEMA,recordSet);
write('record-set.json',{recordSet,recordCount:input.records.length,
  source:'external-record-materials.json#/records',
  meaning:'Exact retained original material identities only; no established author or native provenance claim.'});
const schemaResults=[];
for(const row of chainInputs.chains){
  const proposed={kind:'external_construction',subjectInventory:chainInputs.subjectInventory,
    recordSet,records:input.records,chains:[row.candidateChain],acknowledgmentSelectionRef:null};
  const result=v.safeParse(q.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA,proposed);
  assert.equal(result.success,false);
  const issues=result.issues.map(i=>({path:i.path?.map(p=>p.key).join('.'),message:i.message}));
  assert.deepEqual(issues.map(i=>i.path).sort(),['chains.0.actorIdentityRef','chains.0.authorityRef']);
  schemaResults.push({activation:row.sourceActivation,schemaReady:false,issues,
    interpretation:'Expected missing-input refusal. Unknown concrete identity and authority remain null; no unavailable marker or invented identity was supplied.'});
}
// Independently reacquire only the consumed input bytes. Moving sibling outputs
// and native resources are absent from this input set.
const joins=read('input-joins.json');
for(const r of joins.records){
  const b=fs.readFileSync(r.path);assert.equal(b.length,r.bytes,r.path);
  assert.equal(dg.sha256Bytes(b),'sha256:'+r.sha256,r.path);
}
const ownerFiles=['validator/qualification_contracts.js','shared/digests.js'].map(n=>{
  const path=join(I,'build/code/src',n),b=fs.readFileSync(path);
  return {path,bytes:b.length,digest:dg.sha256Bytes(b)};
});
const summary={status:'partial_material_inputs_valid_full_provenance_not_ready',
  materialSchemaPasses:input.records.length,sourceSchemaPasses:inventory.members.length,
  exactMaterialBytes:input.records.reduce((n,m)=>n+m.byteCount,0),originalAttributionSpansVerified:spanCount,
  consumedInputRechecks:joins.records.length,recordSet,schemaResults,ownerFiles,
  currentOwnerProjectionClaim:'Not evaluated with a fabricated judgment. Original header/closure correspondence failures are source-bound separately.',
  effects:{candidateSource:0,native:0,provider:0,qualification:0,gitMutation:0},
  readyChains:0,readyAssessmentTasks:0,actualJudgments:0};
write('validation-result.json',summary);
console.log(JSON.stringify({status:summary.status,materials:summary.materialSchemaPasses,
  members:summary.sourceSchemaPasses,spans:spanCount,recordSet,readyChains:0}));
