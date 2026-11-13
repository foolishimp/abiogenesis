// Pure operator finalization only. No installed modules, preflight or runtime calls.
import assert from 'node:assert/strict';
import {readFile,writeFile,lstat} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const dir=dirname(fileURLToPath(import.meta.url)),campaign=dirname(dir);
const work='/Users/jim/src/apps/abiogenesis-single-address-space',inputs=join(work,'consolidation-inputs/proof-10');
const hash=b=>createHash('sha256').update(b).digest('hex'),json=async p=>JSON.parse(await readFile(p,'utf8'));
const bindingsPath=join(dir,'ROOT_FINALIZATION_BINDINGS.json'),raw=await readFile(bindingsPath),bindings=JSON.parse(raw);
assert.equal(bindings.status,'ROOT_SELECTED_PROOF_ONLY_FINALIZATION');
assert.equal(bindings.subjectSha256,'38933d61515b3a4b07d7b86bf5b2a731ab35f86e43cdae8bd25ddace4e4c0a13');
assert.equal(bindings.native09RunRef,'run://abiogenesis/8151fe0a681158cbe0edc14139cee1dc877e592f278a5e78509364457a968c88');
assert.equal(bindings.allowProofOnlyTestingAndUat,true);assert.equal(bindings.preserveActual09FailuresAndSkips,true);
const outputs=[join(inputs,'INDEPENDENT_NATIVE09_REVIEW.json'),join(inputs,'ROOT_DISPOSITION.json'),join(inputs,'C2_SELECTED_INPUTS.json'),join(dir,'workload.json'),join(dir,'FINALIZATION_CUSTODY.json')];
for(const p of outputs.slice(2)){try{await lstat(p);throw Error('Stop: existing finalization output '+p);}catch(e){if(e.code!=='ENOENT')throw e;}}
const pinned={};
for(const key of ['afterRunResume','actualClose','actualOutcome','freshReads','actualUat','independentReview','rootDisposition']){
 const p=bindings.requiredPins?.[key];assert(p&&typeof p.path==='string'&&Number.isSafeInteger(p.bytes)&&p.bytes>=0&&/^[a-f0-9]{64}$/u.test(p.sha256),'Missing actual Root pin: '+key);
 const bytes=await readFile(p.path);assert.equal(bytes.length,p.bytes,key);assert.equal(hash(bytes),p.sha256,key);pinned[key]={...p,bytesValue:bytes};
}
assert.equal(resolve(pinned.afterRunResume.path),resolve(campaign,'native-09/execution/after-run-resume.json'),'Use genuine09 after-run-resume');
assert.equal(resolve(pinned.actualClose.path),resolve(campaign,'native-09/execution/calls/lifecycle-start.close.json'),'Use actual09 lifecycle close');
assert.equal(resolve(pinned.actualOutcome.path),resolve(campaign,'native-09/execution/calls/lifecycle-start.outcome.json'),'Use actual09 lifecycle outcome');
const retained=JSON.parse(pinned.afterRunResume.bytesValue),close=JSON.parse(pinned.actualClose.bytesValue),outcome=JSON.parse(pinned.actualOutcome.bytesValue),fresh=JSON.parse(pinned.freshReads.bytesValue);
assert.deepEqual(outcome.receipt?.resources?.eventResource?.closeHandoff,close,'Actual outcome/close relation');
assert.deepEqual(retained.state?.closeHandoff?.prefix,close.prefix,'Continuation must hold actual09 prefix');
assert.equal(retained.workspaceAuthority?.canonicalRoot,work);
const priorUat=JSON.parse(pinned.actualUat.bytesValue);assert.equal(priorUat.status,'NATIVE_UAT_NOT_SELECTED');assert.equal(priorUat.assessment,null,'Preserve actual non-entry; no nonexistent assessment required');
assert(Array.isArray(fresh)&&['run_result','run_replay'].every(key=>fresh.some(row=>row.memberKey===key)),'Both actual fresh readbacks required; no success assumed');
const supplements=await json(join(dir,'CURRENT_SUPPLEMENT_BINDINGS.json'));for(const key of ['independentReview','rootDisposition','actualUat'])assert.deepEqual(bindings.requiredPins[key],supplements[key],'Retain exact selected closed supplement');
const scopeBytes=await readFile(supplements.scopeSupplement.path);assert.equal(hash(scopeBytes),supplements.scopeSupplement.sha256);assert.deepEqual(scopeBytes,await readFile(join(inputs,'ROOT_PROOF_ONLY_DISPOSITION_10.md')));
const guard=await json(join(dir,'SOURCE_BEFORE.json'));assert.equal(guard.files.length,160);
for(const f of guard.files){const b=await readFile(join(work,f.relativePath));assert.equal(b.length,f.bytes,f.relativePath);assert.equal(hash(b),f.sha256,f.relativePath);}
const current=await json(join(inputs,'ACTUAL_NATIVE09_C2_SUMMARY.json')),closed=await json(join(inputs,'NATIVE09_C2_CLOSED_RESULT.json'));
assert.equal(hash(await readFile(join(inputs,'ACTUAL_NATIVE09_C2_SUMMARY.json'))),'796a3c82eef44ceb32425ed2a636187622d589ca6b4f3d0b88bfb638654efbef');
assert.equal(hash(await readFile(join(inputs,'NATIVE09_C2_CLOSED_RESULT.json'))),'5f93c6b93c5dc966519842450455de0ab4522130bf77cb5083d0d2471cf649be');
assert.equal(current.status,'ACTUAL_C2_COMPLETED_WITH_UNMET_PREDICATES');assert.equal(current.nativeProof,null);assert.equal(current.protectedBeforeEqualsAfter,true);assert.deepEqual(current.productDelta,[]);assert.equal(closed.status,'ACTUAL_ADMITTED_C2_RESULT_CAPTURED');
const selection=await json(join(dir,'SELECTION_PLAN.json')),w=await json(join(dir,'workload.template.json'));
const selected=[...new Set([...selection.baseSelectedPaths,...selection.newSelectedPaths])].sort();
assert.deepEqual(Object.keys(w.workOrders).sort(),['testing','uat']);assert(w.workOrders.uat.writeRoots.length===0&&w.workOrders.testing.writeRoots.length===0);
assert.deepEqual(await json(join(dir,'EXPECTED_FUTURE_FILES.json')),[]);
assert.deepEqual(await readFile(outputs[0]),pinned.independentReview.bytesValue,'Current closed review copy');assert.deepEqual(await readFile(outputs[1]),pinned.rootDisposition.bytesValue,'Current Root disposition copy');
await writeFile(outputs[2],JSON.stringify({kind:'operator_selected_file_guide',selectedPaths:selected,futureFiles:[],meaning:'Current existing candidate/control/fixture inputs; no future native author handoff. Historical09 controls remain history.'},null,2)+'\n',{flag:'wx'});
w.testing.selectedPaths=selected;w.readRoots=selected;
w.sources=[];for(const path of selection.sourceBodyPaths){const bytes=await readFile(join(work,path));w.sources.push({path,digest:'sha256:'+hash(bytes)});}
assert(!w.assessment.sources.includes(w.assessment.candidatePath));assert(!w.assessment.sources.includes(w.assessment.rubricPath));assert.equal(new Set(w.assessment.sources).size,w.assessment.sources.length);
for(const path of selected)assert((await lstat(join(work,path))).isFile(),'Selected current file missing: '+path);
const baseline=await readFile(join(inputs,'MEASURED_BASELINE.json'));assert.equal(baseline.length,5575);assert.equal(hash(baseline),'774df7457d5c10945f6d58ea144747bc051bca36e88624680f6f17c056ec5a06');
await writeFile(outputs[3],JSON.stringify(w,null,2)+'\n',{flag:'wx'});
const files=[];for(const p of [bindingsPath,...outputs.slice(0,-1),join(dir,'SOURCE_BEFORE.json'),join(dir,'PROOF_ONLY_GRANT.json'),join(dir,'PROVIDER_PROFILE.json')]){const b=await readFile(p);files.push({path:p,bytes:b.length,sha256:hash(b)});}
await writeFile(outputs[4],JSON.stringify({status:'FINALIZED_NOT_PREFLIGHTED_OR_DISPATCHED',rootBindingsSha256:hash(raw),requiredPins:Object.fromEntries(Object.entries(pinned).map(([k,{bytesValue,...p}])=>[k,p])),files,sourceCorrespondenceCount:160,selectedFiles:selected.length,workOrders:Object.keys(w.workOrders),futureFiles:[],providerCalls:0,RunAdmissions:0,meaning:'Pure pin/copy finalization; actual owner preflight and Root dispatch selection remain separate.'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'FINALIZED_NOT_PREFLIGHTED_OR_DISPATCHED',selectedFiles:selected.length,commands:w.testing.commands.length,sourceCorrespondence:160}));
