import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
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
async function fixture(t,commandExecutionLimits) {
 const env=await worksiteFixture({...p,...effects,...ops});t.after(()=>rm(env.scratch,{recursive:true,force:true}));
 const selectedDeclaration=commandExecutionLimits===undefined?declaration:g.constructSemanticJobLifecycleDeclaration({...declaration,bounds:{...declaration.bounds,maxCommands:32}});
 const initial=ordinaryJob(p,g,'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
 const job=p.constructSemanticJobInput({...initial,evaluationData:{independentSentinel:'evaluator-only-9bff'},taskData:{...initial.taskData,nativeLifecycle:{assets:declaration.stages.map((s,i)=>({stageRef:s.declarationRef,path:`assets/${i}.json`})),rubricPath:'assets/rubric.json',
 ...(commandExecutionLimits===undefined?{}:{commandExecutionLimits})}},
 worksiteScope:{...initial.worksiteScope,readRoots:['.'],writeRoots:['.'],parentWriteRoots:['.'],evidenceWriteRoots:['evidence'],
 ...(commandExecutionLimits===undefined?{}:{executableCapabilities:initial.worksiteScope.executableCapabilities.map(c=>({...c,maxTimeoutMs:120000}))})}});
 await mkdir(join(env.canonicalRoot,'assets'));for(const member of job.members){await mkdir(join(env.canonicalRoot,member.path,'..'),{recursive:true});await writeFile(join(env.canonicalRoot,member.path),Buffer.from(member.base64,'base64'));}
 await writeFile(join(env.canonicalRoot,'assets/rubric.json'),p.canonicalJson(selectedDeclaration)+'\n');
 const observe=()=>ops.observeWorksiteContext({...env,readRoots:job.worksiteScope.readRoots,maxFiles:declaration.bounds.maxContextFiles,maxBytes:declaration.bounds.maxContextBytes});
 const envelope=p.constructSemanticJobEnvelope(job,selectedDeclaration,{invocationAdmissionRef:'component:invocation',rootExecutionBasisRef:'component:root',rootInputRef:'component:input',rootInputDigest:hash(job),
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

test('native Design command budget retains exact capacity through both roles, readiness and historical correspondence',async t=>{
 const limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000},env=await fixture(t,limits);
 const c2=await load('product/worksite_command_execution'),implementation=await load('implementation/worksite_command_execution');
 const traces=[];let current=env.envelope;
 for(let i=0;i<3;i++){const a=await author(env,current,i),v=assess(env,a.authored,i);traces.push(a.authored,v.assessed);current=v.assessed;}
 const stage=declaration.stages[3],base=candidate(current,3),over=structuredClone(base);
 over.design.commands=Array.from({length:7},(_,i)=>({...base.design.commands[0],commandId:'component:budget-'+i,timeoutMs:60000,terminationGraceMs:1000}));
 const budget=c2.projectWorksiteCommandExecutionBudget(over.design);
 assert.equal(budget.commandBudgetMs,427000);assert.equal(budget.httpProbeBudgetMs,0);assert.equal(budget.requiredExecutionBudgetMs,432000);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits),false);
 assert.equal(m.semanticJobDesignIssues(current,over.design).at(-1).rule,'enclosing_execution_capacity');
 const boundary=structuredClone(over);boundary.design.commands=boundary.design.commands.slice(0,5).map(c=>({...c,timeoutMs:58000}));
 assert.equal(c2.projectWorksiteCommandExecutionBudget(boundary.design).requiredExecutionBudgetMs,300000);
 assert.equal(m.semanticJobDesignMatches(current,boundary.design),false,'equality fails the existing strict guard');
 boundary.design.commands[0].timeoutMs--;
 assert.equal(c2.projectWorksiteCommandExecutionBudget(boundary.design).requiredExecutionBudgetMs,299999);
 assert.equal(m.semanticJobDesignMatches(current,boundary.design),true,'the adjacent aggregate is within the same limits');
 const task=m.constructNativeSemanticTask(current,stage.declarationRef,'author',env,await env.observe());
 await writeFile(join(env.canonicalRoot,'assets/3.json'),JSON.stringify(over)+'\n');
 const observation=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'over-budget component candidate',gaps:[]},provenance('author-3'));
 let issues;assert.equal(m.deriveNativeSemanticAsset(current,stage.declarationRef,observation,adapter('author-3',{}),value=>{issues=value;}),null);
 assert.equal(issues.at(-1).actual.requiredExecutionBudgetMs,432000);
 const unknown=structuredClone(over);unknown.design.dependencyDisposition='unknown';
 assert.equal(m.semanticJobDesignMatches(current,unknown.design),true,'insufficient capacity can remain non-executable pressure');
 await rm(join(env.canonicalRoot,'assets/3.json'));
 const a=await author(env,current,3,boundary),v=assess(env,a.authored,3);
 traces.push(a.authored,v.assessed);
 const authorContract=m.projectSemanticJobActorContract(current,stage.declarationRef,'author');
 const assessorContract=m.projectSemanticJobActorContract(a.authored,stage.declarationRef,'assessor');
 assert.deepEqual(authorContract.design.executionCapacity.selectedLimits,limits);
 assert.deepEqual(assessorContract.design.executionCapacity.selectedLimits,limits);
 assert.deepEqual(authorContract.design.executionCapacity.budgetRule,budget.rule);
 assert.equal(authorContract.design.executionCapacity.currentCandidate,null);
 assert.equal(assessorContract.design.executionCapacity.currentCandidate.requiredExecutionBudgetMs,299999);
 assert.equal(assessorContract.design.executionCapacity.currentCandidate.compatible,true);
 for(const [nativeTask,contract]of [[a.task,authorContract],[v.task,assessorContract]])
  assert(n.renderNativeWorkspaceWorkOrder(nativeTask).includes(p.canonicalJson(contract)),'the exact retained limits reach the rendered role task');
 assert(m.constructNativeSemanticConstructionTask(v.assessed,env,await env.observe()));
 const previousIdle=process.env.ABG_TS_FP_TIMEOUT_MS,previousAbsolute=process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
 t.after(()=>{for(const [key,value]of [['ABG_TS_FP_TIMEOUT_MS',previousIdle],['ABG_TS_FP_ABSOLUTE_TIMEOUT_MS',previousAbsolute]])
  if(value===undefined)delete process.env[key];else process.env[key]=value;});
 process.env.ABG_TS_FP_TIMEOUT_MS='300000';process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='900000';
 assert.deepEqual(implementation.selectedWorksiteCommandExecutionLimits(),limits);
 process.env.ABG_TS_FP_TIMEOUT_MS='60000';
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAuthorTaskPredicateRef,current,a.task),true);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAssessorTaskPredicateRef,a.authored,v.task),true);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAuthorFoldPredicateRef,p.constructRetainedGraphInput(current,a.observation),a.authored),true);
 assert.equal(m.evaluateNativeSemanticRelation(g.SEMANTIC_STAGE_IDS.nativeAssessorFoldPredicateRef,p.constructRetainedGraphInput(a.authored,v.observation),v.assessed),true);
 const legacy=await fixture(t);
 assert.equal(m.nativeSemanticCommandExecutionLimits(legacy.envelope),null);
 assert.equal('executionCapacity' in m.projectSemanticJobActorContract(legacy.envelope,declaration.stages[0].declarationRef,'author').design,false);

 // Component upstream facts only. Actual task preparation and result/fold
 // correspondence execute; no journal, admission or actor is manufactured.
 const {SourceTextModule,SyntheticModule}=await import('node:vm');
 async function component(name,overrides){const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await module.link(async spec=>{const native=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href),values={...native,...overrides[spec]};
   return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});});
  await module.evaluate();return module.namespace;}
 const ids=g.SEMANTIC_STAGE_IDS,selectedPublication={...publication,semanticJobLifecycle:current.declaration},pub=await load('product/publication');
 const execution={...env.executionBasis,basisRef:current.basis.rootExecutionBasisRef,parentExecutionBasisRef:null,
  rawInputValue:env.job,rawInputDigest:hash(env.job),rawInputAdmissionRef:current.basis.rootInputRef,invocationAdmissionRef:current.basis.invocationAdmissionRef};
 const previous=(value,implementationRef)=>({cCall:{implementationRef,basisId:execution.basisRef},result:{resultClass:'success',value},judgment:{judgment:'advance'}});
 const predecessors=new Map([[current.basis.intakeCCallRef,previous(env.envelope,ids.jobIntakeImplementationRef)]]);
 for(const value of traces){const asset=value.assets.at(-1),source=asset.assessment?.source??asset.source;
  predecessors.set(source.nativeWork.adapterCCallRef,previous(value,asset.assessment?ids.nativeAssessorFoldImplementationRef:ids.nativeAuthorFoldImplementationRef));}
 const native={execution,inputValue:a.authored,inputDigest:hash(a.authored),program:{},prefix:{component:'supplied'},
  call:{...env.cCall,regime:'F_D',implementationRef:ids.nativeAssessorTaskImplementationRef,programLocusRef:stage.assessorLocusRef+'/prepare'},
  events:[{kind:'c_call_result_admitted',aggregateId:'component:current',payload:{value:a.authored}}],
  environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
   productInstalls:[{productId:selectedPublication.owningProductId,artifactDigest:selectedPublication.artifactDigest,
    productContentDigest:selectedPublication.productContentDigest,manifestDigest:selectedPublication.productManifestDigest,installedRoot:env.workspaceBinding.roots.productRoot,
    contributionManifest:{publicationBindings:[{moduleRef:selectedPublication.moduleRef,publicationDigest:pub.modulePublicationSemanticDigest(selectedPublication)}]}}]}};
 predecessors.set('component:current',previous(a.authored,ids.nativeAuthorFoldImplementationRef));
 const basis={publication:selectedPublication,graphFunction:{declarations:{'abg.semantic_native_stage':stage.declarationRef}}};
 const abg=await component('abg/semantic_job',{
  './execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>native,rehydrateExecutionBasisAtPrefix:()=>execution},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})},
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},
  './semantic_stage.js':{projectSemanticPredecessorAtPrefix:(_prefix,_events,_pub,ref)=>predecessors.get(ref)??null},
 });
 const seam=await component('implementation/semantic_stage',{'../abg/semantic_job.js':abg});
 const occurrence={semanticStageBasis:basis};
 assert.equal((await seam.realizeNativeSemanticAssessorTask(a.authored,occurrence)).disposition,'failure','changed current controls refuse preparation');
 process.env.ABG_TS_FP_TIMEOUT_MS='300000';
 const prepared=await seam.realizeNativeSemanticAssessorTask(a.authored,occurrence);assert.equal(prepared.disposition,'success');
 assert.deepEqual(prepared.resultCandidate,v.task);
 process.env.ABG_TS_FP_TIMEOUT_MS='60000';
 assert.equal(abg.semanticJobResultMatchesBasis(basis,a.authored,prepared.resultCandidate),true,'historical result correspondence uses retained limits');
 const construction=m.constructNativeSemanticConstructionTask(v.assessed,env,await env.observe());
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),'component implementation');
 await writeFile(join(env.canonicalRoot,'app/check.mjs'),'component verifier');
 const built=n.constructNativeWorkspaceWorkObservation(construction,await env.observe(),{summary:'component files',gaps:[]},provenance('budget-construction'));
 const executionTask=m.constructNativeSemanticExecutionTask(v.assessed,built);
 const c2Occurrence={cCallRef:'component:budget-c2',runId:'component:run',graphCallId:'component:graph',frameId:'component:frame',
  programLocusRef:p.WORKSITE_COMMAND_EXECUTION_IDS.nodeRef,taskOrdinal:null,attempt:1,executionAuthority:null};
 process.env.ABG_TS_FP_TIMEOUT_MS='299999';
 assert.throws(()=>implementation.realizeWorksiteCommandExecution(executionTask,c2Occurrence),/actor inactivity timeout must exceed/);
 process.env.ABG_TS_FP_TIMEOUT_MS='300000';process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='300000';
 assert.throws(()=>implementation.realizeWorksiteCommandExecution(executionTask,c2Occurrence),/actor absolute timeout must exceed/);
 process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='900000';
 for(const path of Object.values(env.workspaceBinding.roots))await mkdir(path,{recursive:true});
 assert.equal(implementation.realizeWorksiteCommandExecution(executionTask,c2Occurrence).kind,'prepared_probabilistic_leaf_invocation');
 t.diagnostic('Component Design/C2 budget and native preparation proof; upstream authentication supplied, no actor or installed execution.');
});

test('command budget shares HTTP terms and exact existing C2 selector behavior',async()=>{
 const c2=await load('product/worksite_command_execution'),implementation=await load('implementation/worksite_command_execution');
 const budget=c2.projectWorksiteCommandExecutionBudget({commands:[{timeoutMs:1000,terminationGraceMs:100}],outcomePredicates:[
  {predicateKind:'http_response_exact',declaration:{launch:{timeoutMs:40000,terminationGraceMs:1000},request:{timeoutMs:20000}}},
  {predicateKind:'process_exit',declaration:{equals:0}}]});
 assert.equal(budget.commandBudgetMs,1100);assert.equal(budget.httpProbeBudgetMs,61000);assert.equal(budget.requiredExecutionBudgetMs,67100);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(67100,{inactivityTimeoutMs:67100,absoluteTimeoutMs:900000}),false);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(67100,{inactivityTimeoutMs:67101,absoluteTimeoutMs:67102}),true);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(67100,{inactivityTimeoutMs:67101,absoluteTimeoutMs:67101}),false);
 const before=[process.env.ABG_TS_FP_TIMEOUT_MS,process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS];
 try{delete process.env.ABG_TS_FP_TIMEOUT_MS;delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  assert.deepEqual(implementation.selectedWorksiteCommandExecutionLimits(),{inactivityTimeoutMs:60000,absoluteTimeoutMs:3600000});
  process.env.ABG_TS_FP_TIMEOUT_MS='';process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='invalid';
  const invalid=implementation.selectedWorksiteCommandExecutionLimits();assert.equal(invalid.inactivityTimeoutMs,0);assert(Number.isNaN(invalid.absoluteTimeoutMs));
 }finally{for(const [i,key]of ['ABG_TS_FP_TIMEOUT_MS','ABG_TS_FP_ABSOLUTE_TIMEOUT_MS'].entries())if(before[i]===undefined)delete process.env[key];else process.env[key]=before[i];}
});

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
test('native author fold preserves exact contract issues for same-response requirement refs outside the incoming domain',async t=>{
 const env=await fixture(t), ids=g.SEMANTIC_STAGE_IDS, predecessors=new Map();let current=env.envelope;
 const previous=(value,implementationRef)=>({cCall:{implementationRef,basisId:env.envelope.basis.rootExecutionBasisRef},
  result:{resultClass:'success',value},judgment:{judgment:'advance'}});
 predecessors.set(current.basis.intakeCCallRef,previous(current,ids.jobIntakeImplementationRef));
 for(let i=0;i<2;i++){
  const a=await author(env,current,i),v=assess(env,a.authored,i);
  predecessors.set(a.authored.assets.at(-1).source.nativeWork.adapterCCallRef,previous(a.authored,ids.nativeAuthorFoldImplementationRef));
  predecessors.set(v.assessed.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,previous(v.assessed,ids.nativeAssessorFoldImplementationRef));
  current=v.assessed;
 }
 const stage=declaration.stages[2],valid=candidate(current,2),invalid=structuredClone(valid);
 invalid.asset.statements[0].requirementRefs=[invalid.asset.requirementCandidates[0].candidateRef];
 assert.deepEqual(m.projectSemanticJobActorContract(current,stage.declarationRef,'author').requirementRefs,[]);
 const expected=[{path:'asset.statements[0].requirementRefs',rule:'eligible_reference_domain',expected:[],actual:['component:requirement']}];
 const task=m.constructNativeSemanticTask(current,stage.declarationRef,'author',env,await env.observe());
 async function observed(value){
  await writeFile(join(env.canonicalRoot,'assets/2.json'),JSON.stringify(value)+'\n');
  return n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'component reference-domain candidate',gaps:[]},provenance('author-2'));
 }
 const badObservation=await observed(invalid), goodObservation=await observed(valid);
 const bad=p.constructRetainedGraphInput(current,badObservation), good=p.constructRetainedGraphInput(current,goodObservation);
 const coordinate=adapter('author-2',good);
 assert.equal(m.deriveNativeSemanticAsset(current,stage.declarationRef,badObservation,adapter('author-2',bad)),null);
 const accepted=m.deriveNativeSemanticAsset(current,stage.declarationRef,goodObservation,coordinate);assert(accepted);

 // Component seam: existing upstream authentication/producer facts are supplied.
 // Product candidate validation, native fold joins and implementation refusal run
 // unchanged; this fixture grants no runtime admission or installed-path proof.
 const {SourceTextModule,SyntheticModule}=await import('node:vm');
 async function component(name,overrides){
  const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await module.link(async spec=>{
   const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href);
   const values={...imported,...overrides[spec]};
   return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });await module.evaluate();return module.namespace;
 }
 const selectedPublication={...publication,semanticJobLifecycle:declaration};
 const publicationOwner=await load('product/publication');
 const execution={...env.executionBasis,basisRef:current.basis.rootExecutionBasisRef,parentExecutionBasisRef:null,
  rawInputValue:env.job,rawInputDigest:hash(env.job),rawInputAdmissionRef:current.basis.rootInputRef,
  invocationAdmissionRef:current.basis.invocationAdmissionRef};
 const native={execution,inputValue:bad,inputDigest:hash(bad),program:{},prefix:{component:'supplied-owner-facts'},
  call:{...env.cCall,cCallRef:coordinate.cCallRef,runId:'component:run',regime:'F_D',implementationRef:ids.nativeAuthorFoldImplementationRef,
   programLocusRef:stage.authorLocusRef},
  events:[{eventId:env.cCall.openedEventRef,admissionOrdinal:3},
   {kind:'c_call_result_admitted',aggregateId:'component:current',payload:{value:current}}],
  environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
   productInstalls:[{productId:selectedPublication.owningProductId,artifactDigest:selectedPublication.artifactDigest,
    productContentDigest:selectedPublication.productContentDigest,manifestDigest:selectedPublication.productManifestDigest,installedRoot:env.scratch,
    contributionManifest:{publicationBindings:[{moduleRef:selectedPublication.moduleRef,publicationDigest:publicationOwner.modulePublicationSemanticDigest(selectedPublication)}]}}]}};
 predecessors.set('component:current',previous(current,ids.nativeAssessorFoldImplementationRef));
 const basis={publication:selectedPublication,graphFunction:{declarations:{'abg.semantic_native_stage':stage.declarationRef}}};
 let nativeSourceAvailable=true,productDerivations=0,computedIssues;
 const fold=await component('abg/semantic_job',{
  './execution_basis.js':{authenticateNativeInstructionAssemblyBasis:()=>native,rehydrateExecutionBasisAtPrefix:()=>execution},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})},
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},
  './semantic_stage.js':{projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>predecessors.get(ref)??null},
  './native_worksite_execution.js':{projectNativeWorkspaceWorkSourceAtPrefix:()=>nativeSourceAvailable?{
   sourceResult:{runId:native.call.runId,admissionOrdinal:1},sourceBasis:execution,sourceClosedEvent:{admissionOrdinal:2}}:null,
   worksiteCommandSourcesInvalidatedAfter:()=>false},
  '../product/semantic_job.js':{deriveNativeSemanticAsset:(...args)=>{productDerivations++;const observe=args[4];
   return m.deriveNativeSemanticAsset(...args.slice(0,4),issues=>{computedIssues=issues;observe?.(issues);});}},
 });
 const implementation=await component('implementation/semantic_stage',{'../abg/semantic_job.js':fold});
 const occurrence={semanticStageBasis:basis};
 const rejected=implementation.realizeNativeSemanticAuthorFold(bad,occurrence);
 assert.equal(productDerivations,1,'native failure reuses the original derivation');
 assert.equal(rejected.disposition,'failure');
 assert.equal(rejected.resultCandidate.failureClass,'native_semantic_source_relation_mismatch');
 assert.equal(rejected.diagnosticRef,'diagnostic://abiogenesis/semantic-stage/native_semantic_source_relation_mismatch@5');
 assert.deepEqual(rejected.resultCandidate.contractIssues,expected);
 assert.equal(rejected.resultCandidate.contractIssues,computedIssues,'the computed issue array survives every adapter');
 assert.equal(rejected.evidenceCandidates[0].inputDigest,hash(bad));
 assert.equal(rejected.evidenceCandidates[0].outputDigest,hash(rejected.resultCandidate));
 native.inputValue=good;native.inputDigest=hash(good);
 const succeeded=implementation.realizeNativeSemanticAuthorFold(good,occurrence);
 assert.equal(succeeded.disposition,'success');assert.deepEqual(succeeded.resultCandidate,accepted);
 assert.equal(productDerivations,2);
 nativeSourceAvailable=false;
 const unauthenticated=implementation.realizeNativeSemanticAuthorFold(bad,occurrence);
 assert.equal(unauthenticated.disposition,'failure');assert.equal('contractIssues' in unauthenticated.resultCandidate,false);
 assert.equal(productDerivations,2,'source refusal does not inspect or diagnose the candidate');
 t.diagnostic('Product/ABG/implementation component path only; supplied authentication facts, no actor, journal or installed execution.');
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
