import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { genericLifecyclePublicationData } from '../support/t287-generic-job-lifecycle.mjs';
import { ordinaryJob } from '../support/t287-generic-job-intake.mjs';
import { worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, '../..');
const load = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href);
const [p,g,m,n,ops,effects,owners,prefixes,immutable] = await Promise.all(['product/index','gtl/index','product/semantic_job',
 'product/native_workspace_work','product/worksite_operations','product/worksite_effect','abg/native_worksite_execution','abg/event_prefix','shared/immutable'].map(load));
const hash=p.sha256Canonical, zero='sha256:'+'0'.repeat(64);
const publication=g.constructSemanticStageModulePublication({productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
 artifactDigest:zero,productContentDigest:zero,productManifestDigest:zero});
const old=genericLifecyclePublicationData({product:p,gtl:g,abiPublication:publication}).semanticJobLifecycle;
const declaration=g.constructSemanticJobLifecycleDeclaration({...old,proofTemplates:old.proofTemplates.map(t=>({...t,realizationContractRef:g.NATIVE_WORKSPACE_WORK_IDS.observationContractRef}))});
const provenance = key => ({ cCallRef:'component:c-call:'+key,executionAuthorityRef:'component:authority:'+key,executionAuthorityDigest:hash(key),
 actorInvocationRef:'component:actor:'+key,transportBindingRef:'component:transport',transportBindingDigest:hash('transport'),promptDigest:hash(key),transportDigest:hash('transport:'+key) });
const adapter=(key,input)=>({cCallRef:'component:adapter:'+key,inputDigest:hash(input)});
async function fixture(t) {
 const env=await worksiteFixture({...p,...effects,...ops});t.after(()=>rm(env.scratch,{recursive:true,force:true}));
 const initial=ordinaryJob(p,g,'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
 const job=p.constructSemanticJobInput({...initial,evaluationData:{independentSentinel:'evaluator-only-9bff'},taskData:{...initial.taskData,nativeLifecycle:{assets:declaration.stages.map((s,i)=>({stageRef:s.declarationRef,path:`assets/${i}.json`})),rubricPath:'assets/rubric.json'}},
 worksiteScope:{...initial.worksiteScope,readRoots:['.'],writeRoots:['.'],parentWriteRoots:['.'],evidenceWriteRoots:['evidence']}});
 await mkdir(join(env.canonicalRoot,'assets'));for(const member of job.members){await mkdir(join(env.canonicalRoot,member.path,'..'),{recursive:true});await writeFile(join(env.canonicalRoot,member.path),Buffer.from(member.base64,'base64'));}
 await writeFile(join(env.canonicalRoot,'assets/rubric.json'),p.canonicalJson(declaration)+'\n');
 const observe=()=>ops.observeWorksiteContext({...env,readRoots:job.worksiteScope.readRoots,maxFiles:declaration.bounds.maxContextFiles,maxBytes:declaration.bounds.maxContextBytes});
 const envelope=p.constructSemanticJobEnvelope(job,declaration,{invocationAdmissionRef:'component:invocation',rootExecutionBasisRef:'component:root',rootInputRef:'component:input',rootInputDigest:hash(job),
 intakeCCallRef:'component:intake',intakeCCallDigest:hash('intake'),intakeExecutionBasisRef:'component:intake-basis'});
 return {...env,job,observe,envelope};
}
function candidate(envelope,i){const stage=declaration.stages[i],member=envelope.job.members[0],q={memberRef:member.memberRef,quote:Buffer.from(member.base64,'base64').toString()};
 const active=p.projectSemanticJobBindings(envelope);
 return {kind:'semantic_job_asset_candidate',schemaVersion:'5.0.0',asset:{kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',
 statements:[{statementRef:stage.declarationRef+'/s',text:q.quote,modality:'supporting',sourceQuotes:[q],requirementRefs:[],obligationRefs:[],predecessorStatementRefs:envelope.assets.flatMap(a=>a.candidate.asset.statements.map(s=>s.statementRef))}],
 requirementCandidates:i===2?[{candidateRef:'component:requirement',meaning:q.quote,parentRequirementRefs:[],sourceQuotes:[q]}]:[],worksiteDesign:null,pressure:[]},
 bindings:i===2?[{requirement:{kind:'candidate',ref:'component:requirement'},previousVersionRef:null,templateRef:declaration.proofTemplates[0].templateRef,scope:'Complete component input',realizationMeaning:['All requested behavior'],proofMeaning:['Independent verifier and observed execution'],unprovedScope:['Semantic adequacy'],closureRule:'Non-closing',requiredContent:[]}]:[],
 design:i===3?{targets:[['app/main.mjs','implementation'],['app/check.mjs','verifier']].map(([relativePath,role])=>({relativePath,role,obligationRefs:active.map(b=>b.binding.obligationRef),bindingVersionRefs:active.map(b=>b.versionRef),changeInstruction:'Implement the selected role'})),dependencyPaths:[],dependencyDisposition:'sufficient',commands:[{commandId:'component:check',executable:process.execPath,args:['app/check.mjs'],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],outcomePredicates:[]}:null};}
function verdict(authored,i,disposition='satisfied'){const member=authored.job.members[0];return {kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:declaration.stages[i].rubric.map(r=>({criterionRef:r.criterionRef,disposition,explanation:'Mechanical component value only; no semantic acceptance claim',sourceQuotes:[{memberRef:member.memberRef,quote:Buffer.from(member.base64,'base64').toString()}],statementRefs:authored.assets.at(-1).candidate.asset.statements.map(s=>s.statementRef)})),pressure:[]};}
async function author(env,envelope,i,value=candidate(envelope,i)){const stage=declaration.stages[i],task=m.constructNativeSemanticTask(envelope,stage.declarationRef,'author',env,await env.observe());
 await writeFile(join(env.canonicalRoot,`assets/${i}.json`),JSON.stringify(value)+'\n');const observation=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'component candidate',gaps:[]},provenance('author-'+i));
 const authored=m.deriveNativeSemanticAsset(envelope,stage.declarationRef,observation,adapter('author-'+i,p.constructRetainedGraphInput(envelope,observation)));assert(authored);return {task,observation,authored};}
function assess(env,authored,i,disposition='satisfied'){const task=m.constructNativeSemanticTask(authored,declaration.stages[i].declarationRef,'assessor',env,authored.context);
 const observation=n.constructNativeWorkspaceWorkObservation(task,authored.context,null,provenance('assessor-'+i),verdict(authored,i,disposition));
 const assessed=m.deriveNativeSemanticAssessment(authored,declaration.stages[i].declarationRef,observation,adapter('assessor-'+i,p.constructRetainedGraphInput(authored,observation)));assert(assessed);return {task,observation,assessed};}

test('native workspace candidate derives through the Product algebra; provenance never becomes cold admission',async t=>{
 const env=await fixture(t),a=await author(env,env.envelope,0),v=assess(env,a.authored,0),asset=v.assessed.assets[0];
 assert.equal(p.isSemanticJobEnvelope(v.assessed),true);assert.equal(asset.source.cCallRef,a.observation.provenance.cCallRef);
 assert.notEqual(asset.source.nativeWork.adapterCCallRef,asset.source.cCallRef);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAuthorFoldPredicateRef,p.constructRetainedGraphInput(env.envelope,a.observation),a.authored),true);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAssessorFoldPredicateRef,p.constructRetainedGraphInput(a.authored,v.observation),v.assessed),true);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeStagePredicateRef,env.envelope,v.assessed),true);
 assert.equal(m.evaluateSemanticJobRelation(g.SEMANTIC_STAGE_IDS.lifecycleStepPredicateRef,env.envelope,v.assessed),true);
 const prefix=prefixes.selectValidatedRuntimeEventPrefix(immutable.deepFreeze([]));
 assert.equal(owners.projectNativeWorkspaceWorkSourceAtPrefix(prefix,a.observation),null,'a pure native value is not an admitted producer');
 assert.equal(owners.projectNativeWorkspaceWorkSourceAtPrefix(prefix,v.observation),null,'assessment value also needs actual admitted actor provenance');
 const prompt=n.renderNativeWorkspaceWorkOrder(v.task);assert(!prompt.includes('semantic_stage_envelope'));assert(!prompt.includes('rootExecutionBasisRef'));assert(!prompt.includes('input.json'));
 assert(!n.renderNativeWorkspaceWorkOrder(a.task).includes(JSON.stringify(env.job.evaluationData)),'author cannot see evaluator-only payload');
});
test('independent rejection is retained and cannot advance; changed candidate or protected source refuses',async t=>{
 const env=await fixture(t),a=await author(env,env.envelope,0),v=assess(env,a.authored,0,'falsified');
 assert.equal(v.assessed.assets[0].assessment.disposition,'falsified');assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeStagePredicateRef,env.envelope,v.assessed),false);
 assert.throws(()=>m.constructNativeSemanticTask(v.assessed,declaration.stages[1].declarationRef,'author',env,v.assessed.context));
 const reused=n.constructNativeWorkspaceWorkObservation(v.task,a.authored.context,null,a.observation.provenance,verdict(a.authored,0));assert.equal(m.deriveNativeSemanticAssessment(a.authored,declaration.stages[0].declarationRef,reused,adapter('reused',{})),null);
 await writeFile(join(env.canonicalRoot,'assets/0.json'),'{}');const changed=await env.observe();assert.throws(()=>m.constructNativeSemanticTask(a.authored,declaration.stages[0].declarationRef,'assessor',env,changed));
 await writeFile(join(env.canonicalRoot,env.job.members[0].path),'changed governing input');assert.equal(m.nativeSemanticContextMatches(env.envelope,await env.observe()),false);
});
test('four assessed stages conserve requirement bindings and restrict construction/C2 to current Design',async t=>{
 const env=await fixture(t);let current=env.envelope;
 for(let i=0;i<4;i++){const a=await author(env,current,i);current=assess(env,a.authored,i).assessed;}
 assert.equal(current.assets.length,4);assert.equal(p.projectSemanticJobBindings(current).length,1);assert.deepEqual(current.job,env.job);
 const task=m.constructNativeSemanticConstructionTask(current,env,await env.observe());assert.deepEqual(task.writeRoots,['app/main.mjs','app/check.mjs']);
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),'component implementation');await writeFile(join(env.canonicalRoot,'app/check.mjs'),'component verifier');
 const observation=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'controlled component files',gaps:[]},provenance('construction'));
 const c2=m.constructNativeSemanticExecutionTask(current,observation);assert.equal(p.isNativeWorksiteCommandExecutionTask(c2),true);assert.deepEqual(c2.sourceNativeWork,observation);
 assert.deepEqual(c2.protectedObservations.map(x=>x.subject.relativePath),task.writeRoots);assert.equal('sourceConstructionResult' in c2,false);
 const initialBytes=await readFile(join(env.canonicalRoot,env.job.members[0].path));assert.deepEqual(initialBytes,Buffer.from(env.job.members[0].base64,'base64'));
 await writeFile(join(env.canonicalRoot,'assets/3.json'),'changed Design');const stale=await env.observe();assert.throws(()=>m.constructNativeSemanticConstructionTask(current,env,stale));
});

test('native typed semantic assessment uses the exact installed schema owner and rejects wrong declarations',async t=>{
 const env=await fixture(t),a=await author(env,env.envelope,0),v=assess(env,a.authored,0);
 const schemaOwner=await load('product/native_workspace_assessment'),selection=v.task.assessment;
 const bytes=Buffer.from(selection.schemaAsset.bytesBase64,'base64');await writeFile(join(env.scratch,'assessment.schema.json'),bytes);
 const install={productId:publication.owningProductId,installedRoot:env.scratch,publicContracts:[{contractId:selection.resultContract.contractRef,contractVersion:'5.0.0',
  contractKind:'schema_asset',owningProduct:publication.owningProductId,contractDigest:p.sha256Bytes(bytes),assetLocator:{path:'assessment.schema.json',mediaType:'application/schema+json',contentDigest:p.sha256Bytes(bytes)}}]};
 assert.deepEqual(schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[publication],[install]),m.NATIVE_SEMANTIC_ASSESSMENT_SCHEMA);
 assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[{...publication,owningProductId:'product://foreign'}],[install]),null);
 assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[publication,publication],[install]),null);
 assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[{...publication,contracts:publication.contracts.filter(c=>c.contractRef!==selection.resultContract.contractRef)}],[install]),null);
 await writeFile(join(env.scratch,'assessment.schema.json'),'{}');assert.equal(schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[publication],[install]),null);
});

// Component preparation only: real C2 manifests/current-file checks, no actor or runtime admission.
test('native C2 retains assessed non-target dependencies without granting realization credit',async t=>{
 const env=await fixture(t), dependency='config/value.mjs';
 await mkdir(join(env.canonicalRoot,'config'));await writeFile(join(env.canonicalRoot,dependency),'export const value = 7;\n');
 await writeFile(join(env.canonicalRoot,'unselected.txt'),'outside the selected source set');
 let current=env.envelope;
 for(let i=0;i<4;i++){const value=candidate(current,i);if(i===3)value.design.dependencyPaths=[dependency];
  const a=await author(env,current,i,value);current=assess(env,a.authored,i).assessed;}
 const task=m.constructNativeSemanticConstructionTask(current,env,await env.observe());assert(task.readFirst.includes(dependency));
 assert.deepEqual(task.writeRoots,['app/main.mjs','app/check.mjs']);
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),
  "import {value} from '../config/value.mjs'; export const actual = value;\n");
 await writeFile(join(env.canonicalRoot,'app/check.mjs'),
  "import {actual} from './main.mjs'; if (actual !== 7) throw Error('dependency unavailable');\n");
 const observation=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'component dependency fixture',gaps:[]},provenance('construction-dependency'));
 const c2=m.constructNativeSemanticExecutionTask(current,observation), expected=['app/main.mjs','app/check.mjs',dependency];
 assert.deepEqual(c2.protectedObservations.map(row=>row.subject.relativePath),expected);
 const protectedDependency=c2.protectedObservations[2];assert.equal(protectedDependency.observation.fileDigest,p.sha256Bytes(await readFile(join(env.canonicalRoot,dependency))));
 assert.equal(current.assets.at(-1).candidate.design.targets.some(row=>row.relativePath===dependency),false,
  'existing evidence owner derives realization/verifier artifacts only from the unchanged Design targets');
 assert.deepEqual(c2.allowedWriteTerritories.map(row=>row.relativePath),['evidence']);
 for(const path of Object.values(env.workspaceBinding.roots))await mkdir(path,{recursive:true});
 const implementation=await load('implementation/worksite_command_execution'),c2Owner=await load('product/worksite_command_execution');
 const occurrence={cCallRef:'component:c2-dependency',runId:'component:run',graphCallId:'component:graph',frameId:'component:frame',
  programLocusRef:p.WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,taskOrdinal:null,attempt:1,executionAuthority:null};
 const prepared=implementation.realizeWorksiteCommandExecution(c2,occurrence);assert.equal(prepared.kind,'prepared_probabilistic_leaf_invocation');
 const {programLocusRef,executionAuthority,...attempt}=occurrence;
 const plan=c2Owner.worksiteCommandExecutionHelperPlan(c2,'worksite-command-attempt://abiogenesis/'+hash(attempt).slice(7));
 const retained=JSON.parse(await readFile(plan.taskManifestPath,'utf8'));assert.deepEqual(retained,c2);
 const sourceOwner=await load('product/worksite_command_forward');
 assert.deepEqual(sourceOwner.executableWorksiteCommandSources(retained).map(row=>row.subject.relativePath),expected,
  'the existing C2 snapshot and evidence owner receive exactly the target/dependency union');
 for(const path of [dependency,'app/main.mjs']){const original=await readFile(join(env.canonicalRoot,path));
  await writeFile(join(env.canonicalRoot,path),'changed after exact observation');
  assert.throws(()=>implementation.realizeWorksiteCommandExecution(c2,occurrence),/protected worksite observation changed/);
  await writeFile(join(env.canonicalRoot,path),original);}
 assert.equal(await readFile(join(env.canonicalRoot,dependency),'utf8'),'export const value = 7;\n');
});
