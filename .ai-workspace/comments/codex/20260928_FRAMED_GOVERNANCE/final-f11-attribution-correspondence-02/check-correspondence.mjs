/** Pure partial-byte diagnostics on authentic inputs. No task/J or native run. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const O=path.dirname(fileURLToPath(import.meta.url)),G=path.dirname(O);
const I=path.join(G,'final-candidate-construction-01/install/node_modules/@abiogenesis/typescript-tenant');
const v=createRequire(path.join(I,'package.json'))('valibot');
const qc=await import(pathToFileURL(path.join(I,'build/code/src/validator/qualification_contracts.js')));
const {projectExternalConstructionAttribution:project}=await import(pathToFileURL(path.join(I,'build/code/src/validator/qualification.js')));
const {sha256Bytes:sha,sha256Canonical:hash}=await import(pathToFileURL(path.join(I,'build/code/src/shared/digests.js')));
const read=p=>JSON.parse(fs.readFileSync(path.join(O,p),'utf8'));
const suffix=process.argv[2]??'';assert(['','initial'].includes(suffix));
const save=(p,o)=>fs.writeFileSync(path.join(O,suffix?p.replace('.json','.'+suffix+'.json'):p),JSON.stringify(o,null,2)+'\n',{flag:'wx'});
const originals=read('original-record-materials.json').records;
const derived=read('derived-record-materials.json').records;
// Supplemental evidence, if any, is acquired separately before the final check.
const supplemental=fs.existsSync(path.join(O,'supplemental-record-materials.json'))?read('supplemental-record-materials.json').records:[];
const ops=read(fs.existsSync(path.join(O,'operation-inputs-with-supplements.json'))?'operation-inputs-with-supplements.json':'operation-inputs.json').operations;
const records=[...originals,...derived,...supplemental];
const byRef=new Map(records.map(r=>[r.ref,r]));assert.equal(byRef.size,records.length);
for(const r of records){assert(v.is(qc.QUALIFICATION_MATERIAL_SCHEMA,r));const b=Buffer.from(r.contentBase64,'base64');assert.equal(b.length,r.byteCount);assert.equal(sha(b),r.digest);assert.equal(b.toString('base64'),r.contentBase64);}
const sourceSchemaResults=[];
function create(op,useOriginal=false){
 const chain=structuredClone(useOriginal?op.originalChain:op.candidateChain);
 const rs=op.recordRefs.map(ref=>{assert(byRef.has(ref),ref);return byRef.get(ref);});
 const digest=hash(rs),recordSet={ref:'external-record-set://abiogenesis/'+digest.slice(7),digest};
 const selectedMaterial=chain.postimageMembers.map(m=>{
  assert(v.is(qc.QUALIFICATION_SOURCE_SCHEMA,m));
  const change=chain.changes.find(c=>c.memberRef===m.ref),r=byRef.get(change.postimageMemberRef);
  const out={...m,contentBase64:r.contentBase64};assert(v.is(qc.QUALIFICATION_MATERIAL_SCHEMA,out));assert.equal(r.digest,m.digest);assert.equal(r.byteCount,m.byteCount);
  return out;
 });
 const provenance={kind:'external_construction',subjectInventory:op.applicability.subjectInventory??null,recordSet,records:rs,chains:[chain],acknowledgmentSelectionRef:null};
 return {provenance,subjectMembers:chain.postimageMembers,material:selectedMaterial};
}
function probe(task,ownerAuthorityRef=null){return project({task,raw:{attributions:[]}}, {ownerAuthorityRef});}
function plainErrors(result){return result.issues?.map(i=>({message:i.message,path:i.path?.map(p=>p.key).join('.')}))??[];}
const tests=[],sets=[],prepared=[];
for(const op of ops){
 const original=create(op,true),task=create(op);
 assert.equal(probe(original).status,'invalid');
 const result=probe(task);assert.equal(result.status,'insufficient');
 const schema=v.safeParse(qc.QUALIFICATION_CONSTRUCTION_PROVENANCE_SCHEMA,task.provenance);
 assert.equal(schema.success,false); // unknowns are rejected, never replaced with placeholders
 const crossed=structuredClone(task);crossed.provenance.chains[0].changes[0].postimageMemberRef=crossed.provenance.chains[0].changes[1].postimageMemberRef;
 assert.equal(probe(crossed).status,'invalid');
 const actualOther=ops.find(x=>x.operation!==op.operation).candidateChain.postimageMembers[0];
 assert(v.is(qc.QUALIFICATION_SOURCE_SCHEMA,actualOther));
 const uncovered=structuredClone(task);uncovered.subjectMembers.push(actualOther);
 assert.equal(probe(uncovered).status,'invalid');
 const wrongMaterial=structuredClone(task);wrongMaterial.material[0].digest=task.material[1].digest;
 assert.equal(probe(wrongMaterial).status,'invalid');
 const wrongSpan=structuredClone(task);wrongSpan.provenance.chains[0].attributionSources[0].endByte-=1;
 assert.equal(probe(wrongSpan).status,'invalid');
 const wrongRecord=structuredClone(task);wrongRecord.provenance.records[0].byteCount+=1;
 wrongRecord.provenance.recordSet.digest=hash(wrongRecord.provenance.records);
 assert.equal(probe(wrongRecord).status,'invalid');
 assert.equal(probe(task,qc.QUALIFICATION_ROLE_POLICY.authorityRef).status,'invalid');
 tests.push({operation:op.operation,applicability:op.applicability,originalCarrierStatus:probe(original).status,derivedByteBranch:result,
   fullProvenanceSchemaValid:schema.success,expectedMissingFields:plainErrors(schema),
   negatives:{crossedPostimage:'invalid',actualUncoveredMember:'invalid',wrongSelectedMaterial:'invalid',wrongAttributionSpan:'invalid',wrongRecordBytes:'invalid',unestablishedPublishedAuthoritySlot:'invalid'},
   actorIdentityRef:task.provenance.chains[0].actorIdentityRef,authorityRef:task.provenance.chains[0].authorityRef,
   rawAttributions:0,materialSchemaMembers:task.material.length});
 sets.push({operation:op.operation,recordSet:task.provenance.recordSet,recordRefs:op.recordRefs,material:task.material,sourceMembers:task.subjectMembers,applicability:op.applicability});
 prepared.push(task);
}
// Only the two original source operations are conjoined at the actual Q01
// inventory. D is deliberately never inserted into that candidate union.
const oldOps=ops.filter(x=>x.applicability.kind==='eight_original_C01_Q01_members');assert.equal(oldOps.length,2);
const unionRefs=[...new Set(oldOps.flatMap(x=>x.recordRefs))].sort();
const unionRecords=unionRefs.map(r=>byRef.get(r));const digest=hash(unionRecords);
const oldTasks=oldOps.map(x=>create(x));
const union={provenance:{kind:'external_construction',subjectInventory:oldOps[0].applicability.subjectInventory,
 recordSet:{ref:'external-record-set://abiogenesis/'+digest.slice(7),digest},records:unionRecords,
 chains:oldOps.map(x=>x.candidateChain),acknowledgmentSelectionRef:null},
 subjectMembers:oldTasks.flatMap(x=>x.subjectMembers),material:oldTasks.flatMap(x=>x.material)};
assert.equal(union.subjectMembers.length,8);assert.equal(probe(union).status,'insufficient');
const ownerFiles=['build/code/src/validator/qualification.js','build/code/src/validator/qualification_contracts.js','build/code/src/shared/digests.js'].map(p=>{const b=fs.readFileSync(path.join(I,p));return {path:path.join(I,p),byteCount:b.length,digest:sha(b)};});
save('record-sets.json',{kind:'bounded_operation_record_sets_and_actual_source_material',operations:sets,oldEightUnion:{recordSet:union.provenance.recordSet,recordRefs:unionRefs},successorBinding:null});
save('correspondence-checks.json',{status:'pure_partial_byte_branch_checks_passed',installedOwners:ownerFiles,tests,oldEightUnionStatus:probe(union).status,
 checkedOriginalRecords:originals.length,checkedDerivedRecords:derived.length,checkedSupplementalRecords:supplemental.length,
 allMaterialAndSourceSchemasValid:true,fullProvenanceOrTaskValid:false,actualJudgments:0,nativeEffects:0,
 controlledVariables:'All unknown authorityRef fields and partial plan.ownerAuthorityRef stay null. Original unknown actors remain null unless an acquired explicit supplemental statement establishes a scoped claim. Every raw.attributions array is empty. This isolates structural record/byte correspondence; it is not a valid qualification task, semantic J, authority admission or independence proof.',
 limits:'Only eight source members are bound to C01/Q01; the separate D three-member operation remains successor-unbound. No eleven-member candidate union was constructed.'});
console.log(JSON.stringify({tests:tests.map(x=>({operation:x.operation,original:x.originalCarrierStatus,derived:x.derivedByteBranch.status,negatives:Object.keys(x.negatives).length,unknowns:x.expectedMissingFields})),oldEightUnion:probe(union).status,nativeEffects:0},null,2));
