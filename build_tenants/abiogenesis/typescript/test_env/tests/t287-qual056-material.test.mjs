// Component proof. Node report/lint processes are real; C2 command/actor and
// lower-native admission coordinates below are explicit supplied premises.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as p from '../../build/code/src/product/index.js';
import { constructQualificationIdentity as identity } from '../../build/code/src/validator/qualification_contracts.js';
import { parseQualificationTestReport, constructQualificationVerificationMaterial, reduceExactCandidateQualification,
  qualificationVerificationMaterialEntry, parseQualificationRuleCatalog } from '../../build/code/src/validator/qualification.js';
import { QUALIFICATION_ROLE_POLICY as policy } from '../../build/code/src/validator/qualification_contracts.js';
import { createHash } from 'node:crypto';
import { readSelfConformanceCatalog } from '../../build/code/src/validator/self_conformance.js';
import { nativeJoinFixture, coverage, publication, ids } from '../support/malformed-gtl-native-fixture.mjs';
import { SELF_CONFORMANCE_IDS as self } from '../../build/code/src/gtl/self_conformance.js';
import { privateOwner } from '../support/r10-private-owner-harness.mjs';
import { releaseVerificationSnapshotFields } from '../../build/code/src/implementation/release_publication.js';
import { worksiteCommandExecutionHelperPlan, constructWorksiteExecutionHelperArtifact, constructWorksiteExecutionObservation } from '../../build/code/src/product/worksite_command_execution.js';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const reporter=resolve(import.meta.dirname,'../../scripts/node-test-evidence-reporter.mjs');
const lint=resolve(import.meta.dirname,'../../scripts/lint-verification.mjs');
const hash=p.sha256Canonical, bytesHash=p.sha256Bytes, clone=x=>JSON.parse(JSON.stringify(x));
const stream=text=>{const bytes=Buffer.from(text);return {kind:'worksite_observed_stream',schemaVersion:'5.0.0',encoding:'base64',payload:bytes.toString('base64'),byteLength:bytes.length,digest:bytesHash(bytes)};};
const processCommand=(stdout,exitStatus=0,extra={})=>({commandId:'command://test',stdout:stream(stdout),stderr:stream(''),exitStatus,timedOut:false,processSignal:null,signalSequence:[],terminationConfirmed:true,...extra});
function temp(t){const root=fs.mkdtempSync(join(os.tmpdir(),'abi-qual056-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return root;}
function runTests(root,files){const env={...process.env};delete env.NODE_TEST_CONTEXT;
 return spawnSync(process.execPath,['--test','--test-concurrency=1','--test-reporter='+reporter,...files],{cwd:root,env,encoding:'utf8',timeout:5000});}
function report(root,files){const run=runTests(root,files);assert.ifError(run.error);return {run,command:processCommand(run.stdout,run.status,{stderr:stream(run.stderr),processSignal:run.signal}),summary:parseQualificationTestReport(processCommand(run.stdout,run.status,{processSignal:run.signal}),files)};}

test('real Node report conserves complete multi-file, nested-suite and ordinary test outcomes',t=>{
 const root=temp(t);fs.writeFileSync(join(root,'a.test.mjs'),"import {test,describe} from 'node:test';describe('suite',()=>{test('a',()=>{});test('b',()=>{});});\n");
 fs.writeFileSync(join(root,'b.test.mjs'),"import test from 'node:test';test('c',()=>{});\n");
 const r=report(root,['a.test.mjs','b.test.mjs']);assert.equal(r.run.status,0);assert.equal(r.summary.disposition,'passed',JSON.stringify(r.summary));assert.equal(r.summary.tests,3);assert.equal(r.summary.passed,3);
});
test('real skip, todo, failure, import error, process crash and cancellation never yield green material',t=>{
 const root=temp(t),cases={skip:"import test from 'node:test';test('skip',{skip:true},()=>{});",todo:"import test from 'node:test';test.todo('todo');",
 failure:"import test from 'node:test';test('bad',()=>{throw Error('actual failure');});",import_error:"import './absent-module.mjs';",
 crash:"process.exit(3);",cancel:"import test from 'node:test';test('cancelled',{timeout:20},async()=>new Promise(()=>{}));"};
 for(const [name,body]of Object.entries(cases)){const file=name+'.test.mjs';fs.writeFileSync(join(root,file),body);const r=report(root,[file]);
  assert.notEqual(r.summary.disposition,'passed',name+JSON.stringify(r.summary));assert.equal(r.summary.complete,true,name+JSON.stringify(r.summary));
  if(name==='skip')assert.equal(r.summary.skipped,1);else if(name==='todo')assert.equal(r.summary.todo,1);else {assert.equal(r.summary.disposition,'failed',name);if(name==='cancel')assert(r.summary.cancelled>0,JSON.stringify(r.summary));}
 }
});
test('missing, truncated, duplicated, malformed, mismatched and signalled reports retain non-green outcomes',t=>{
 const root=temp(t);fs.writeFileSync(join(root,'a.test.mjs'),"import test from 'node:test';test('a',()=>{});");const good=report(root,['a.test.mjs']);
 assert.equal(good.summary.disposition,'passed',JSON.stringify(good.summary));
 const rows=good.run.stdout.trimEnd().split('\n').map(JSON.parse),mismatch=clone(rows);mismatch.find(r=>r.type==='summary'&&r.file===null).counts.passed++;
 const fileMismatch=clone(rows);fileMismatch.find(r=>r.type==='summary'&&r.file!==null).counts.passed++;
 for(const stdout of ['',good.run.stdout.slice(0,-4),good.run.stdout+'{}\n','{bad}\n',mismatch.map(JSON.stringify).join('\n')+'\n',fileMismatch.map(JSON.stringify).join('\n')+'\n',good.run.stdout+good.run.stdout])
  assert.notEqual(parseQualificationTestReport(processCommand(stdout),['a.test.mjs']).disposition,'passed');
 assert.notEqual(parseQualificationTestReport(good.command,['foreign.test.mjs']).disposition,'passed');
 for(const extra of [{exitStatus:1},{timedOut:true},{processSignal:'SIGTERM',signalSequence:['SIGTERM']},{terminationConfirmed:false}])
  assert.equal(parseQualificationTestReport({...good.command,...extra},['a.test.mjs']).disposition,'failed');
});
test('finite lint checks actual selected MJS and JSON and reports failures without executing tests',t=>{
 const root=temp(t);fs.writeFileSync(join(root,'a.mjs'),'globalThis.notExecuted();');fs.writeFileSync(join(root,'b.json'),'{}');
 const recipe={lint:{files:[{path:'a.mjs',kind:'mjs'},{path:'b.json',kind:'json'}]}};fs.writeFileSync(join(root,'recipe.json'),JSON.stringify(recipe));
 const run=()=>spawnSync(process.execPath,[lint,'recipe.json'],{cwd:root,encoding:'utf8',timeout:5000});
 let result=run();assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).files.length,2);
 fs.writeFileSync(join(root,'a.mjs'),'const = ;');fs.writeFileSync(join(root,'b.json'),'{');result=run();assert.equal(result.status,1);assert(JSON.parse(result.stdout).files.every(f=>f.disposition==='failed'));
});

const comparison=(observedValue='inventory matches')=>({predicateKind:'stdout_exact',declaration:{validationCommandId:'command://compare',equals:'inventory matches'},observedValue});
async function materialFixture(t,predicates=[comparison()]){
 const owner=await loadWorksiteOwner(),env=await worksiteFixture(owner);t.after(()=>fs.rmSync(env.scratch,{recursive:true,force:true}));
 const root=env.canonicalRoot,source="import test from 'node:test';test('actual',()=>{});\n";
 fs.writeFileSync(join(root,'a.test.mjs'),source);const actual=report(root,['a.test.mjs']);assert.equal(actual.summary.disposition,'passed',JSON.stringify(actual.summary));
 const commands=['build','lint','test','compare'].map(role=>({commandId:'command://'+role,executable:process.execPath,args:['--version'],relativeCwd:'.',environment:{},timeoutMs:5000,terminationGraceMs:100,expectedReports:[]}));
 const observed=async path=>{const subject=owner.constructWorksiteSubject({...env,relativePath:path,subjectUri:pathToFileURL(join(root,path)).href});return {subject,observation:await owner.observeWorksiteSubject(env.workspaceAuthorityBasis,env.workspaceBinding,subject)};};
 const input={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,capabilityGrant:env.capabilityGrant,
  observedFiles:[await observed('a.test.mjs')],commands,outcomePredicates:predicates.map(({predicateKind,declaration},i)=>({predicateId:'predicate://'+i,predicateKind,declaration})),allowedWriteTerritories:[{pathKind:'subtree',relativePath:'verification'}]};
 const initial=p.constructObservedWorksiteCommandExecutionTask(input),recipe={kind:'qualification_verification_recipe',schemaVersion:'1',sourceInputs:[{memberRef:'source://a',relativePath:'a.test.mjs'}],auxiliaryInputs:[],
  commandConfigurationDigest:hash(initial.commands),predicateConfigurationDigest:hash(initial.outcomePredicates),writeTerritoriesDigest:hash(initial.allowedWriteTerritories),
  commands:commands.map((c,i)=>({commandId:c.commandId,role:['build','lint','test','compare'][i]})),lint:{commandId:'command://lint',files:[{path:'a.test.mjs',kind:'mjs'}]},
  tests:[{commandId:'command://test',files:['a.test.mjs']}],skipPolicy:'incomplete',reportFormat:'node-test-events-jsonl@1'};
 const recipeBytes=Buffer.from(JSON.stringify(recipe));fs.writeFileSync(join(root,'recipe.json'),recipeBytes);input.observedFiles.push(await observed('recipe.json'));
 const task=p.constructObservedWorksiteCommandExecutionTask(input),plan=worksiteCommandExecutionHelperPlan(task,'attempt://qual056/component');
 const lintRun=spawnSync(process.execPath,[lint,'recipe.json'],{cwd:root,encoding:'utf8'});assert.equal(lintRun.status,0,lintRun.stderr);
 const commandResults=task.commands.map(c=>{const {kind,schemaVersion,expectedReports,...body}=c;
  Object.assign(body,processCommand(c.commandId==='command://test'?actual.run.stdout:c.commandId==='command://lint'?lintRun.stdout:c.commandId==='command://compare'?(predicates.find(p=>p.predicateKind==='stdout_exact')?.observedValue??'inventory matches'):'',0,{commandId:c.commandId}),{reports:[],reportCount:0});
  const digest=hash(body);return {kind:'worksite_command_result',schemaVersion:'5.0.0',...body,observationRef:'worksite-command-observation://abiogenesis/'+digest.slice(7),observationDigest:digest};});
 const compare=commandResults.find(c=>c.commandId==='command://compare'),predicateObservations=task.outcomePredicates.map((declaration,i)=>({
  kind:'worksite_predicate_observation',schemaVersion:'5.0.0',ordinal:i,predicateId:declaration.predicateId,predicateKind:declaration.predicateKind,observedValue:predicates[i].observedValue,
  evidence:[{kind:'worksite_command_observation_coordinate',schemaVersion:'5.0.0',ref:compare.observationRef,digest:compare.observationDigest}],evidenceRefs:[compare.observationRef]}));
 const members=task.protectedObservations.map(row=>({kind:'worksite_snapshot_member',schemaVersion:'5.0.0',ordinal:row.ordinal,sourceMemberRef:row.sourceMemberRef,sourceObservationRef:row.observation.observationRef,
  sourceObservationDigest:row.observation.observationDigest,relativePath:row.subject.relativePath,byteLength:row.observation.byteLength,digest:row.observation.fileDigest}));
 const snapshotDigest=hash(members),artifact=constructWorksiteExecutionHelperArtifact({task,disposition:'success',commandResults,predicateObservations,worksiteDelta:[],productDelta:[],snapshotRoot:plan.sandboxRoot,
  snapshotRef:'worksite-command-snapshot://abiogenesis/'+snapshotDigest.slice(7),snapshotDigest,snapshotMembers:members,protectedBefore:task.protectedObservations.map(r=>r.observation),protectedAfter:task.protectedObservations.map(r=>r.observation)});
 const ack={kind:'worksite_command_execution_worker_result',schemaVersion:'5.0.0',taskRef:task.taskRef,taskDigest:task.taskDigest,attemptRef:plan.attemptRef,helperArtifactRef:artifact.artifactRef,helperArtifactDigest:artifact.artifactDigest};
 const actor={actorRef:task.workerActorRef,workerBindingRef:task.workerBindingRef,implementationRef:p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,inputDigest:hash(task),transportLane:'worker_executes',disposition:'success',toolCallCount:1,
  toolInvocations:[{kind:'worker_tool_invocation_evidence',schemaVersion:'5.0.0',ordinal:0,toolName:'Bash',toolUseRef:'tool://component',inputDigest:plan.toolInputDigest,inputByteLength:plan.toolInputByteLength}],
  actorInvocationRef:'actor://component',processRef:'process://component',transportBindingRef:'transport://component',transportBindingDigest:hash('transport'),transportDigest:hash('transport')};
 const observation=constructWorksiteExecutionObservation(task,ack,actor,artifact,plan);
 const recipeMaterial={ref:'source://recipe',path:'recipe.json',digest:bytesHash(recipeBytes),byteCount:recipeBytes.length,contentBase64:recipeBytes.toString('base64')};
 const inventory=identity({kind:'qualification_subject_inventory',coverage:'complete_claim',selectedRoots:['.'],members:[{ref:'source://a',path:'a.test.mjs',digest:bytesHash(Buffer.from(source)),byteCount:Buffer.byteLength(source),surfaceRoles:['proof'],classificationEvidenceRefs:[]},
  {ref:recipeMaterial.ref,path:recipeMaterial.path,digest:recipeMaterial.digest,byteCount:recipeMaterial.byteCount,surfaceRoles:['qualification'],classificationEvidenceRefs:[]}]},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 const basis={basisRef:'basis://component',basisDigest:hash('basis'),lawBasis:{ref:'law://component',digest:hash('law')},sourceInventory:{ref:inventory.inventoryRef,digest:inventory.inventoryDigest}};
 return {basis,inventory,observation,selection:{executionSelectionRef:'execution://component',recipe:recipeMaterial,recipePath:'recipe.json'},execution:{ref:'result://component',digest:hash(observation)},cCall:{ref:'c-call://component',digest:hash('call')}};
}
test('observed C2 material binds exact inventory, recipe, policy and command bodies; snapshot copies unchanged',async t=>{
 const f=await materialFixture(t),material=constructQualificationVerificationMaterial(f);assert(material);assert.equal(material.disposition,'passed',JSON.stringify(material));
 assert.equal(material.commandOutcomes.length,4);assert.equal(material.testSummaries[0].passed,1);
 assert.deepEqual(material.predicateOutcomes.map(p=>p.declaration),f.observation.task.outcomePredicates);
 assert.deepEqual(material.predicateOutcomes.map(p=>p.observation),f.observation.predicateObservations);
 assert.equal(material.predicateOutcomes[0].disposition,'passed');
 const q={subjectBasis:material.subjectBasis,lawBasis:material.lawBasis,selfConformance:{verification:material}};
 const fields=releaseVerificationSnapshotFields(q);assert.equal(fields.verificationMaterial,material);assert.equal(fields.verificationFacts,q);
 const bad=clone(q);bad.selfConformance.verification.subjectBasis.digest=hash('foreign');assert.throws(()=>releaseVerificationSnapshotFields(bad));
 delete bad.selfConformance.verification;assert.throws(()=>releaseVerificationSnapshotFields(bad));
 const altered=clone(f);altered.inventory.members[0].digest=hash('foreign source');
 const {inventoryRef,inventoryDigest,...body}=altered.inventory;altered.inventory=identity(body,'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');altered.basis.sourceInventory={ref:altered.inventory.inventoryRef,digest:altered.inventory.inventoryDigest};
 assert.equal(constructQualificationVerificationMaterial(altered).disposition,'failed');
 const wrongRecipe=clone(f);wrongRecipe.selection.recipe.digest=hash('not recipe bytes');assert.equal(constructQualificationVerificationMaterial(wrongRecipe),null);
 const forged=clone(f);forged.observation.commandResults[0].exitStatus=0;forged.observation.commandResults[0].stdout=stream('changed after observation');assert.equal(constructQualificationVerificationMaterial(forged),null);
});
test('selected zero-exit stdout contradiction fails while exact match and indeterminate predicates retain their meaning',async t=>{
 const unknown={predicateKind:'module_export_return_exact',declaration:{path:'a.test.mjs',export:'missing',equals:null},observedValue:null};
 const unsupported={predicateKind:'http_response_exact',declaration:{validationCommandId:'command://compare',status:200,body:'ok',
  launch:{executable:process.execPath,args:[p.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder],relativeCwd:'.',environment:[{kind:'worksite_command_environment_entry',schemaVersion:'5.0.0',name:'PATH',value:process.env.PATH}],portFile:{relativePath:'verification/port'},timeoutMs:5000,terminationGraceMs:100},
  request:{hostname:'127.0.0.1',method:'GET',path:'/',timeoutMs:100}},observedValue:{status:200,body:'ok'}};
 for(const [name,predicates,expected]of [
  ['contradiction',[comparison('inventory differs')],'failed'],['match',[comparison()],'passed'],
  ['unknown',[unknown],'blocked_incomplete'],['unsupported',[unsupported],'blocked_incomplete'],
  ['failure survives unknown',[unknown,comparison('inventory differs')],'failed'],
  ['minimum passes',[{predicateKind:'test_pass_count',declaration:{validationCommandId:'command://test',greaterThanOrEqual:1},observedValue:2}],'passed'],
  ['minimum fails',[{predicateKind:'test_pass_count',declaration:{validationCommandId:'command://test',greaterThanOrEqual:2},observedValue:1}],'failed'],
 ]){
  const f=await materialFixture(t,predicates),material=constructQualificationVerificationMaterial(f);assert(material,name);assert.equal(material.disposition,expected,name);
  assert(material.commandOutcomes.every(c=>c.exitStatus===0));assert.equal(material.testSummaries[0].disposition,'passed');assert.equal(material.lintOutcome.passed,true);
  assert.deepEqual(material.predicateOutcomes.map(p=>p.declaration),f.observation.task.outcomePredicates,name);
  assert.deepEqual(material.predicateOutcomes.map(p=>p.observation),f.observation.predicateObservations,name);
  const qualification={subjectBasis:material.subjectBasis,lawBasis:material.lawBasis,selfConformance:{verification:material}};
  if(expected==='passed')assert.deepEqual(releaseVerificationSnapshotFields(qualification).verificationMaterial.predicateOutcomes,material.predicateOutcomes);
  else assert.throws(()=>releaseVerificationSnapshotFields(qualification),name);
 }
});
test('F11 conserves selected passed, failed and incomplete predicates through native summary and AF22',async t=>{
 for(const [predicates,expected]of [[[comparison()],'blocked'],[[comparison('inventory differs')],'red'],[[{predicateKind:'module_export_return_exact',declaration:{path:'a.test.mjs',export:'missing',equals:null},observedValue:null}],'blocked']]){
 const f=await materialFixture(t,predicates),verification=constructQualificationVerificationMaterial(f),native=await nativeJoinFixture();
 const law=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/law-basis.json',import.meta.url)));
 const input={kind:'self_conformance_input',schemaVersion:'5.0.0',basis:native.input.basis,law,inventory:null,tenantManifest:null,authorityMembers:[],applications:[],evidenceCitations:[],
  qualification:{plan:{subjectBasis:{ref:native.input.basis.basisRef,digest:native.input.basis.basisDigest},lawBasis:native.input.basis.lawBasis},proof:native.proof(),sourceMembers:[],coverageCatalog:coverage}};
 verification.subjectBasis={ref:input.basis.basisRef,digest:input.basis.basisDigest};verification.lawBasis=input.basis.lawBasis;
 // This test supplies the resolved C2-material premise. Its construction and
 // source refusals are tested above; installed native C2 resolution remains separate.
 const module=await privateOwner('validator/self_conformance.js',[],{'../abg/qualification_proof.js':{resolveQualificationAssessments:()=>[],resolveQualificationExecutionMaterial:()=>({evidence:[],verification})}});
 const opened=native.open(self.graphFunctionRef,input,'material-F11'),install=native.environment.productInstalls[0],{catalog}=readSelfConformanceCatalog();
 const owner={installId:install.installId,installDigest:hash(install),artifactDigest:install.artifactDigest,productId:install.productId,productVersion:install.packageVersion,
  productContentDigest:install.productContentDigest,manifestDigest:install.manifestDigest,publicationDigest:hash(publication),workspaceBinding:input.basis.workspaceBinding,
  executionBasis:{ref:opened.execution.basisRef,digest:opened.execution.basisDigest??hash(opened.execution.basisRef)},cCallDigest:opened.call.cCallDigest,nativeBasis:opened.basis,
  catalogDigest:law.catalog.digest,catalogRef:catalog.catalogRef,catalogVersion:catalog.catalogVersion,catalogAssetPath:law.catalog.assetPath};
 const value=module.evaluateSelfConformance(input,owner);assert.equal(value.disposition,expected==='red'?'failed':'blocked_incomplete');assert.deepEqual(value.verification,verification);
 const result=native.complete(opened,value),selection={kind:'self_conformance_selection',selectionRef:'selection://material',slotRef:opened.call.programLocusRef,
  programRef:opened.execution.programRef,invocationAdmissionRef:opened.execution.invocationAdmissionRef,result:{ref:result.resultRef,digest:result.resultDigest}},proof={...native.proof(),selections:[selection]};
 const summary=native.owner.projectQualificationSelfConformance(proof,selection,input.basis);assert.deepEqual(summary.verification,verification);
 const verdictInput={kind:'qualification_verdict_input',schemaVersion:'5.0.0',slotRef:publication.graphFunctions.find(g=>g.name===ids.verdictGraph).template.startNodeRef,basis:input.basis,coverage,
  selectionRef:selection.selectionRef,selfConformance:summary,proof};const consumer=native.open(ids.verdictGraph,verdictInput,'material-AF22');
 assert(native.owner.qualificationHasNativeSelfConformance(verdictInput,consumer.basis));
 const verdict=reduceExactCandidateQualification(verdictInput,consumer.basis);assert.equal(verdict.disposition,expected);assert.deepEqual(verdict.selfConformance.verification,verification);
 const forged=clone(verdictInput);forged.selfConformance.verification.predicateOutcomes[0].observation.observedValue='caller replacement';
 assert.equal(native.owner.qualificationHasNativeSelfConformance(forged,consumer.basis),false);
 }
});

// REQ-P-SELF-CONFORMANCE-009 seeded negatives over the fold's verification material entry (RP-1 P1). Component
// premises: a small published catalog whose rule group governs REQ-P-QUAL-056, the native join's honest entries and
// admitted J supplied explicitly (as the scoped-assessment lane supplies them); each task carries a seeded entry.
async function verificationFold(t){
 const real=constructQualificationVerificationMaterial(await materialFixture(t));assert.equal(real.disposition,'passed');
 const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex'),coord=(ref,d=hash(ref))=>({ref,digest:d}),plain=m=>({ref:m.ref,path:m.path,digest:m.digest,byteCount:m.byteCount});
 const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canon(v[k])])):v;
 const bytes=(ref,text,path=ref)=>{const b=Buffer.from(text);return {ref,path,digest:digest(b),byteCount:b.length,contentBase64:b.toString('base64')};};
 const mat=(ref,value)=>bytes(ref,JSON.stringify(canon(value)));
 const installed=JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/rule-catalog.json',import.meta.url)));
 const roleSources=policy.authoritySourceRefs.map(ref=>installed.sources.find(s=>s.ref===ref));
 const authority=roleSources.map(s=>({...s,contentBase64:fs.readFileSync(new URL('../../'+s.path,import.meta.url)).toString('base64')}));
 const source=[0,1,2].map(i=>({...bytes('source://member/'+i,'export const value'+i+' = '+i+';\n','member-'+i+'.mjs'),surfaceRoles:[['code','public_contract','proof'][i]],classificationEvidenceRefs:['classification://premise']}));
 const inventory=identity({kind:'qualification_subject_inventory',selectedRoots:['root://candidate'],coverage:'complete_claim',members:source.map(({contentBase64,...m})=>m)},'inventoryRef','inventoryDigest','qualification-inventory://abiogenesis/');
 const rules=[0,1].map(i=>({ruleRef:'rule://verification/'+i,version:'1',sourceRef:authority[i%2].ref,sourceDigest:authority[i%2].digest,startByte:0,endByte:authority[i%2].byteCount,spanDigest:authority[i%2].digest,governedClaim:i===0?'REQ-P-QUAL-056':'component-law-'+i,applicability:'requires_admitted_judgment',requiredEvidenceRoles:['semantic_assessment'],computableRelation:'source_span_integrity',diagnostic:'semantic_assessment_required'}));
 const catalog={kind:'qualification_rule_catalog',schemaVersion:'5.0.0',catalogRef:'catalog://verification-component',catalogVersion:'1',ownerRef:'owner://component',method:installed.method,sources:roleSources,rules,coverageClaim:'finite_candidate_unassessed',requiredCatalogEvidenceRoles:['catalog_fidelity']};
 const catalogBytes=Buffer.from(JSON.stringify(catalog)),catalogDigest=digest(catalogBytes);
 const law=identity({kind:'qualification_law_basis',...catalog.method,catalog:{ref:catalog.catalogRef,digest:catalogDigest,ownerRef:catalog.ownerRef,version:catalog.catalogVersion,assetPath:'contracts/qualification/rule-catalog.json'},sources:catalog.sources},'lawBasisRef','lawBasisDigest','qualification-law://abiogenesis/');
 const tenant=identity({kind:'tenant_conformance_manifest',schemaVersion:'5.0.0',productId:'product://component',capabilityDefinitionGraph:coord('capability://component'),publicContractCatalog:coord('public://component'),claims:[{claimRef:'claim://component',capabilityRef:'capability://one',publicContractRefs:['contract://one'],evidenceRefs:['evidence://one']}]},'manifestRef','manifestDigest','tenant-manifest://abiogenesis/');
 const coverage=identity({kind:'qualification_coverage_catalog',lawBasis:coord(law.lawBasisRef,law.lawBasisDigest),authoritySources:roleSources,claims:[{coverageRef:'coverage://one',behaviors:['behavior://one'],requirementRefs:[authority[1].ref+'#REQ'],evidenceRoles:['behavioral_coverage']}]},'catalogRef','catalogDigest','qualification-coverage://abiogenesis/');
 const catalogs={rules:parseQualificationRuleCatalog(catalogBytes),coverage};
 const basis=identity({kind:'exact_candidate_qualification',projection:'basis',schemaVersion:'5.0.0',subjectKind:'installed_rc',productId:tenant.productId,productVersion:'5.0.0-rc.1',sourceInventory:coord(inventory.inventoryRef,inventory.inventoryDigest),artifact:coord('artifact://component'),productManifest:coord('manifest://component'),productContentDigest:hash('content'),toolchain:coord('manifest://component'),installedProduct:coord('install://component'),workspaceBinding:coord('workspace://component'),prospectiveRelease:{productId:tenant.productId,namespace:'abiogenesis',profile:'one_project_unqualified',projectSubtree:'.',versionLine:'5.0.0',ordinal:1,version:'5.0.0-rc.1',releaseClaim:coord('release-claim://component')},tenantManifest:coord(tenant.manifestRef,tenant.manifestDigest),coverageCatalog:coord(coverage.catalogRef,coverage.catalogDigest),lawBasis:coverage.lawBasis},'basisRef','basisDigest','qualification-basis://abiogenesis/');
 const scope=identity({kind:'qualification_scope',subjectBasis:coord(basis.basisRef,basis.basisDigest),lawBasis:basis.lawBasis,catalog:coord(catalog.catalogRef,catalogDigest),inventory,ruleGroups:[{groupRef:'group://rules',ruleRefs:rules.map(r=>r.ruleRef),sourceRefs:roleSources.map(s=>s.ref)}],surfaceGroups:[{groupRef:'group://surfaces',memberRefs:source.map(s=>s.ref),rootRefs:inventory.selectedRoots,surfaceRoles:[...new Set(source.flatMap(s=>s.surfaceRoles))],ownerRefs:['owner://component'],sourceRefs:[source[0].ref]}]},'scopeRef','scopeDigest','qualification-scope://abiogenesis/');
 const sourceMembers=source.map(({surfaceRoles,classificationEvidenceRefs,...m})=>m);
 // The native join's honest premise: the execution entry, and the real verification material rebased onto this basis
 // with the recipe as an inventory member; its entry is the product constructor's.
 const execution=mat('execution://actual-premise',{kind:'component_native_execution_premise'});
 const verification={...clone(real),subjectBasis:scope.subjectBasis,lawBasis:basis.lawBasis,recipe:coord(sourceMembers[2].ref,sourceMembers[2].digest),execution:coord(execution.ref,execution.digest)};
 const entry=qualificationVerificationMaterialEntry(verification);
 const owner={installId:basis.installedProduct.ref,installDigest:basis.installedProduct.digest,artifactDigest:basis.artifact.digest,productId:basis.productId,productVersion:basis.productVersion,productContentDigest:basis.productContentDigest,manifestDigest:basis.productManifest.digest,publicationDigest:hash('publication'),workspaceBinding:basis.workspaceBinding,executionBasis:coord('execution-basis://component'),cCallDigest:hash('call'),nativeBasis:{cCallRef:'c-call://F11',predecessorPrefix:{kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///synthetic-no-resource',prefixLength:0,prefixDigest:hash('prefix'),storeIdentity:{device:1,inode:2,eventContractDigest:hash('event')},coordinateDigest:hash('coordinate')}},catalogDigest,catalogRef:catalog.catalogRef,catalogVersion:catalog.catalogVersion,catalogAssetPath:law.catalog.assetPath};
 const input={kind:'self_conformance_input',schemaVersion:'5.0.0',basis,law,inventory,tenantManifest:tenant,scope,authorityMembers:authority,applications:[{ruleRef:'group://rules',surfaceRef:'group://surfaces',applicability:'applicable',premiseEvidenceRefs:[],evaluationEvidenceRefs:[],rulingEvidenceRefs:[]}],evidenceCitations:[],qualification:{plan:{subjectBasis:scope.subjectBasis,lawBasis:basis.lawBasis},proof:{selections:[]},sourceMembers,coverageCatalog:coverage}};
 const declarations=[{ref:catalog.catalogRef,path:law.catalog.assetPath,digest:catalogDigest,byteCount:catalogBytes.length,contentBase64:catalogBytes.toString('base64')},mat(inventory.inventoryRef,inventory),mat(tenant.manifestRef,tenant),mat(law.lawBasisRef,law),mat(coverage.catalogRef,coverage)];
 const judgments=[];
 const judgment=(role,evidenceRole,ruleRef,surfaceRef,{evidenceRefs=role==='coverage'?[execution.ref]:[],material=[...declarations,...authority,...sourceMembers,execution]}={})=>{
  const n=judgments.length,c={criterionRef:'criterion://'+n,ruleRef,surfaceRef,evidenceRole,disposition:'satisfied',applicability:'applicable',grouping:'justified',reason:'Supplied independent component premise',sourceRefs:[sourceMembers[0].ref],evidenceRefs,residuals:[]};
  const j={task:{inventory:basis.sourceInventory,catalog:scope.catalog,scope,subjectMembers:sourceMembers.map(plain),material,role:{roleRef:'qualification-role://abiogenesis/'+role+'@5'},coverage:[c],slotRef:'slot://'+n,provenance:{kind:'native_construction'}},raw:{criteria:[c],residuals:[]},source:{actorRef:policy.actorRefs[0]}};
  judgments.push(j);input.qualification.proof.selections.push({kind:'judgment_selection',slotRef:j.task.slotRef,result:coord('judgment://'+n)});return j;};
 // The verification-bound rule slot carries the recipe member and the material entry, and its criterion cites the entry.
 const evaluate=async seeded=>{judgments.length=0;input.qualification.proof.selections=[];
  judgment('catalog','catalog_fidelity','group://rules',catalog.catalogRef);judgment('inventory','inventory_coverage',inventory.inventoryRef,'group://surfaces');judgment('inventory','inventory_classification',inventory.inventoryRef,'group://surfaces');
  judgment('rule','semantic_assessment','group://rules','group://surfaces',{evidenceRefs:[seeded.cited??entry.ref],material:[...declarations,...authority,...sourceMembers,execution,...(seeded.entry===null?[]:[seeded.entry??entry])]});
  judgment('tenant','tenant_realization','tenant',tenant.manifestRef);judgment('coverage','behavioral_coverage',coverage.claims[0].coverageRef,coverage.claims[0].behaviors[0]);
  const m=await privateOwner('validator/self_conformance.js',[],{'../abg/qualification_proof.js':{resolveQualificationAssessments:()=>judgments,
   resolveQualificationExecutionMaterial:()=>({evidence:[execution],verification,verificationEntry:entry}),qualificationTenantClaimsMatch:()=>true}});
  const out=m.evaluateSelfConformance(input,owner,undefined,catalogs);
  return {out,rule:out.findings.find(x=>x.diagnostic==='semantic_assessment_required'&&x.ruleRef==='group://rules')};};
 return {verification,entry,execution,evaluate};
}
test('REQ-P-SELF-CONFORMANCE-009: seeded verification material entries never discharge a REQ-P-QUAL-056 rule application',async t=>{
 const f=await verificationFold(t);
 assert(f.entry.ref.startsWith('qualification-verification-material://abiogenesis/'));assert.equal(f.entry.path,f.entry.ref);
 assert.equal(f.entry.digest,bytesHash(Buffer.from(f.entry.contentBase64,'base64')));assert.deepEqual(JSON.parse(Buffer.from(f.entry.contentBase64,'base64')),f.verification);
 const honest=await f.evaluate({});assert.equal(honest.out.disposition,'passed',JSON.stringify(honest.out.findings.filter(x=>x.disposition!=='passed')));
 assert.equal(honest.rule.disposition,'passed');assert.equal(honest.rule.provenance,'J');
 const restream=clone(f.verification);restream.commandOutcomes[0].stdout.digest=bytesHash(Buffer.from('another stream'));
 const other=clone(f.verification);other.execution={ref:'result://another-execution',digest:hash('another execution')};
 for(const [name,seeded] of [
  ['a material whose stream digest differs from the admitted observation',{entry:qualificationVerificationMaterialEntry(restream)}],
  ['a material entry missing from the task',{entry:null}],
  ['a material over a different execution coordinate',{entry:qualificationVerificationMaterialEntry(other)}],
  ['a criterion citing the execution coordinate in place of the material entry',{cited:f.verification.execution.ref}],
 ]){
  if(seeded.entry)assert.equal(seeded.entry.ref,f.entry.ref,name+': the seeded entry keeps the selection-derived ref');
  const {out,rule}=await f.evaluate(seeded);
  assert.notEqual(out.disposition,'passed',name);assert(rule,name);assert.equal(rule.disposition,'blocked_incomplete',name);assert.equal(rule.provenance,'J_required',name);
 }
});
