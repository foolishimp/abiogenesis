import fs from 'node:fs';
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as changedGtl from './scratch/build/code/src/gtl/index.js';
import * as changedValidator from './scratch/build/code/src/validator/index.js';
import * as product from './scratch/build/code/src/product/index.js';
import { requirePublicationValidations } from './scratch/test_env/support/root-installed-environment.mjs';

const D=import.meta.dirname,G=resolve(D,'..'),N1=join(G,'final-native-setup-01'),N2=join(G,'final-native-setup-02');
const inputs=[];
const bytes=p=>{const b=fs.readFileSync(p);inputs.push({path:p,bytes:b.length,digest:product.sha256Bytes(b)});return b;};
const read=p=>JSON.parse(bytes(p).toString('utf8'));
const write=(name,body)=>fs.writeFileSync(join(D,name),JSON.stringify(body,null,2)+'\n',{flag:'wx'});
const began=performance.now();
const selected=read(join(N2,'selected-core.json'));
const oldRoot=selected.installedRoot;
const originalGtl=await import(pathToFileURL(join(oldRoot,'build/code/src/gtl/index.js')).href);
const originalValidator=await import(pathToFileURL(join(oldRoot,'build/code/src/validator/index.js')).href);
const verified=read(join(N2,'bootstrap-core.json')).verifiedArtifact;
const artifactBasis={productId:verified.productId,packageName:verified.packageName,packageVersion:verified.packageVersion,
  artifactDigest:verified.artifactDigest,productContentDigest:verified.productContentDigest,productManifestDigest:verified.manifestDigest};
const actualRequest=read(join(N2,'pre-effect-catalog-call.json'));
const nativeReceipt=read(join(N2,'continue-catalog-stdout.json'));
const bindingRows=read(join(N1,'pure-preflight.json')).publicationBindings;
const actualPublications=actualRequest.resources.publications;
assert.equal(actualPublications.length,11);assert.equal(bindingRows.length,11);
assert.deepEqual(bindingRows.map(r=>r.moduleRef),actualPublications.map(p=>p.moduleRef));
const fromOriginal=bindingRows.map(r=>originalGtl[r.constructor](artifactBasis));
assert.deepEqual(fromOriginal,actualPublications,'Every retained native request member must equal its actual original constructor.');
const current=bindingRows.map(r=>changedGtl[r.constructor](artifactBasis));
assert.equal(nativeReceipt.receipt.ownerOutput.outcomeKind,'refusal');
assert.equal(nativeReceipt.receipt.ownerOutput.value.code,'malformed_contribution');
assert.deepEqual(nativeReceipt.receipt.ownerOutput.value.issuePaths,['/contributionManifests']);
assert.equal(nativeReceipt.receipt.resources.disposition,'read_only_unchanged');

function validate(v,p){
  const publication=v.rawAdmitValue(p,'module_publication','contract://abiogenesis/gtl/module-publication@5');
  assert.equal(publication.kind,'raw_admitted_value');
  const contributions=p.contributions.map(c=>v.rawAdmitValue(c,'catalog_contribution','contract://abiogenesis/gtl/catalog-contribution@5'));
  assert.ok(contributions.every(c=>c.kind==='raw_admitted_value'));
  return v.validatePublication(publication,contributions);
}
const originalResults=actualPublications.map(p=>({moduleRef:p.moduleRef,result:validate(originalValidator,p)}));
const bad=originalResults.filter(r=>r.result.kind!=='publication_validation');
assert.equal(bad.length,1);assert.equal(bad[0].moduleRef,'module://abiogenesis/default-library/default@5');
const expectedPurposes=['construction','design','induction','specification','testing','uat'];
assert.deepEqual([...product.GOVERNANCE_PURPOSES].sort(),expectedPurposes);
assert.deepEqual(bad[0].result.diagnostics.map(d=>d.path).sort(),expectedPurposes.map(p=>
  '$.graphFunctions[graph-function://abiogenesis/default-library/'+p+'@5].environment.carries').sort());
assert.ok(bad[0].result.diagnostics.every(d=>d.code==='duplicate_identity'));
const localResults=current.map((p,i)=>({constructor:bindingRows[i].constructor,moduleRef:p.moduleRef,
  result:validate(changedValidator,p),unchangedInstalledValidatorResult:validate(originalValidator,p)}));
assert.ok(localResults.every(r=>r.result.kind==='publication_validation'&&r.unchangedInstalledValidatorResult.kind==='publication_validation'));
assert.equal(requirePublicationValidations(changedValidator,current).length,11);

const originalLibrary=actualPublications.find(p=>p.moduleRef===bad[0].moduleRef);
const correctedLibrary=current.find(p=>p.moduleRef===bad[0].moduleRef);
const conserved=structuredClone(actualPublications), expectedLibrary=conserved.find(p=>p.moduleRef===bad[0].moduleRef);
const wrapperRows=[];
for(const purpose of expectedPurposes){
  const name=product.governanceRef('graph-function',purpose);
  const a=originalLibrary.graphFunctions.find(g=>g.name===name),b=correctedLibrary.graphFunctions.find(g=>g.name===name);
  const state=product.governanceContract('state');
  const children=purpose==='testing'?product.WORKSITE_COMMAND_EXECUTION_IDS:product.NATIVE_WORKSPACE_WORK_IDS;
  assert.deepEqual(a.environment.carries,[state,children.taskContractRef,children.observationContractRef,state]);
  assert.deepEqual(b.environment,{requires:[state],provides:[state],carries:[state,children.taskContractRef,children.observationContractRef]});
  expectedLibrary.graphFunctions.find(g=>g.name===name).environment.carries=[state,children.taskContractRef,children.observationContractRef];
  const counter=structuredClone(correctedLibrary),target=counter.graphFunctions.find(g=>g.name===name);
  target.environment.carries.push(state);
  const red=validate(originalValidator,counter);
  assert.equal(red.kind,'static_validation_refusal');assert.equal(red.diagnostics.length,1);
  assert.equal(red.diagnostics[0].code,'duplicate_identity');
  assert.equal(red.diagnostics[0].path,'$.graphFunctions['+name+'].environment.carries');
  wrapperRows.push({purpose,graphFunctionRef:name,before:a.environment,after:b.environment,
    fixedChild:b.template.nodes[1].term.graphFunctionRef,effects:b.effects,
    templateConserved:product.canonicalJson(a.template)===product.canonicalJson(b.template),negative:red});
}
assert.deepEqual(current,conserved,'Complete eleven-publication comparison permits only the six declared carried-binding removals.');
assert.ok(wrapperRows.every(r=>r.templateConserved));
const hello=current.find(p=>p.moduleRef==='module://abiogenesis/conformance/hello-world@5');
const wrong=structuredClone(correctedLibrary);wrong.graphFunctions.find(g=>g.name===product.governanceRef('graph-function','uat')).environment.carries.push(product.governanceContract('state'));
assert.equal(requirePublicationValidations(changedValidator,[hello])[0].publicationValidation.kind,'publication_validation');
let rejection=null;
try { requirePublicationValidations(changedValidator,[...current.filter(p=>p!==correctedLibrary),wrong]); }
catch(e){rejection={name:e.name,message:e.message};}
assert.ok(rejection?.message.includes('duplicate_identity')&&rejection.message.includes(wrong.moduleRef));
const unchangedFiles=['validator/validation.js','validator/raw_admission.js'];
const unchanged=unchangedFiles.map(name=>{
  const old=bytes(join(oldRoot,'build/code/src',name));
  const next=bytes(join(D,'scratch/build/code/src',name));assert.ok(old.equals(next));
  return {name,digest:product.sha256Bytes(old),bytes:old.length};
});
write('independent-full11.json',{status:'passed_static_component_only',artifactBasis,
  originalNativeRefusal:nativeReceipt.receipt.ownerOutput,originalResults,correctedResults:localResults,
  completeOriginalConstructorCorrespondence:true,completeOnlySixWrapperDelta:true,wrapperRows,
  allElevenHelperAccepted:true,badFinalNonSelectedPublication:{selected:hello.moduleRef,invalid:wrong.moduleRef,rejection},
  unchangedValidators:unchanged,elapsedMs:performance.now()-began,
  limits:'Historical artifact coordinates are comparison parameters, not verification or admission of a changed Product. No full11 Program closure, installed corrected Public catalog, native run or qualification was executed.'});
write('component-input-joins.json',{inputs,originalNativeResourcesRead:false});
console.log(JSON.stringify({status:'passed_static_component_only',originalInvalidPublications:bad.length,
  originalDiagnostics:bad[0].result.diagnostics.length,correctedPublications:localResults.length,
  wrapperConservation:wrapperRows.length,nearestNegatives:wrapperRows.length,badFinalNonSelected:'refused',elapsedMs:performance.now()-began}));
