import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { genericLifecyclePublicationData } from '../support/t287-generic-job-lifecycle.mjs';
import { ordinaryJob } from '../support/t287-generic-job-intake.mjs';
import { worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import fsPromises from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { lstatSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
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
async function fixture(t,commandExecutionLimits,terminationGraceLimit=1000) {
 const env=await worksiteFixture({...p,...effects,...ops});t.after(()=>rm(env.scratch,{recursive:true,force:true}));
 const selectedDeclaration=commandExecutionLimits===undefined?declaration:g.constructSemanticJobLifecycleDeclaration({...declaration,bounds:{...declaration.bounds,maxCommands:32}});
 const initial=ordinaryJob(p,g,'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
 const job=p.constructSemanticJobInput({...initial,evaluationData:{independentSentinel:'evaluator-only-9bff'},taskData:{...initial.taskData,nativeLifecycle:{assets:declaration.stages.map((s,i)=>({stageRef:s.declarationRef,path:`assets/${i}.json`})),rubricPath:'assets/rubric.json',
 ...(commandExecutionLimits===undefined?{}:{commandExecutionLimits})}},
 worksiteScope:{...initial.worksiteScope,readRoots:['.'],writeRoots:['.'],parentWriteRoots:['.'],evidenceWriteRoots:['evidence'],
 ...(commandExecutionLimits===undefined?{}:{executableCapabilities:initial.worksiteScope.executableCapabilities.map(c=>({...c,maxTimeoutMs:120000,maxTerminationGraceMs:terminationGraceLimit}))})}});
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
 assert.equal(budget.commandBudgetMs,435750);assert.equal(budget.httpProbeBudgetMs,0);assert.equal(budget.requiredExecutionBudgetMs,440750);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits),false);
 assert.equal(m.semanticJobDesignIssues(current,over.design).at(-1).rule,'enclosing_execution_capacity');
 const boundary=structuredClone(over);boundary.design.commands=boundary.design.commands.slice(0,5).map(c=>({...c,timeoutMs:56750}));
 assert.equal(c2.projectWorksiteCommandExecutionBudget(boundary.design).requiredExecutionBudgetMs,300000);
 assert.equal(m.semanticJobDesignMatches(current,boundary.design),false,'equality fails the existing strict guard');
 boundary.design.commands[0].timeoutMs--;
 assert.equal(c2.projectWorksiteCommandExecutionBudget(boundary.design).requiredExecutionBudgetMs,299999);
 assert.equal(m.semanticJobDesignMatches(current,boundary.design),true,'the adjacent aggregate is within the same limits');
 const task=m.constructNativeSemanticTask(current,stage.declarationRef,'author',env,await env.observe());
 await writeFile(join(env.canonicalRoot,'assets/3.json'),JSON.stringify(over)+'\n');
 const observation=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'over-budget component candidate',gaps:[]},provenance('author-3'));
 let issues;assert.equal(m.deriveNativeSemanticAsset(current,stage.declarationRef,observation,adapter('author-3',{}),value=>{issues=value;}),null);
 assert.equal(issues.at(-1).actual.requiredExecutionBudgetMs,440750);
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
 // Component-only lower premises: owned authentication and its exact prefix event bodies
 // are supplied explicitly; this does not claim production authentication or runtime admission.
 const abg=await component('abg/semantic_job',{
  './execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>native,rehydrateExecutionBasisAtPrefix:()=>execution},
  // The owned root basis's admission event is the supplied index premise of
  // the one governance-root projection; every other key reads as built.
  './event_prefix.js':{runtimeEventBodiesAtPrefix:()=>native.events,indexedRuntimeEvents:(prefix,key)=>key==='invocation:'+execution.invocationRef?[{kind:'basis_admitted',payload:{basisClass:'root',basisRef:execution.basisRef,invocationAdmissionRef:execution.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:execution.rawInputValue}}]:prefixes.indexedRuntimeEvents(prefix,key)},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})},
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},
  './semantic_stage.js':{projectSemanticPredecessorAtPrefix:(_prefix,_events,_pub,ref)=>predecessors.get(ref)??null},
 });
 const seam=await component('implementation/semantic_stage',{'../abg/semantic_job.js':abg});
 // The basis carries the limits its validating reader selected where it was constructed.
 const occurrence={semanticStageBasis:{...basis,commandExecutionLimits:{...limits,inactivityTimeoutMs:60000}}};
 assert.equal((await seam.realizeNativeSemanticAssessorTask(a.authored,occurrence)).disposition,'failure','changed current controls refuse preparation');
 const prepared=await seam.realizeNativeSemanticAssessorTask(a.authored,{semanticStageBasis:{...basis,commandExecutionLimits:limits}});assert.equal(prepared.disposition,'success');
 assert.deepEqual(prepared.resultCandidate,v.task);
 assert.equal(abg.semanticJobResultMatchesBasis(basis,a.authored,prepared.resultCandidate),true,'historical result correspondence uses retained limits');
 const construction=m.constructNativeSemanticConstructionTask(v.assessed,env,await env.observe());
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),'component implementation');
 await writeFile(join(env.canonicalRoot,'app/check.mjs'),'component verifier');
 const built=n.constructNativeWorkspaceWorkObservation(construction,await env.observe(),{summary:'component files',gaps:[]},provenance('budget-construction'));
 const executionTask=m.constructNativeSemanticExecutionTask(v.assessed,built,construction);
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

test('command cleanup budget rejects the old one-grace envelope through the semantic owner',async t=>{
 const c2=await load('product/worksite_command_execution');
 for(const [limits,expected]of [[{inactivityTimeoutMs:95001,absoluteTimeoutMs:95002},false],
   [{inactivityTimeoutMs:125251,absoluteTimeoutMs:125252},true]]){
  const env=await fixture(t,limits,30000);let current=env.envelope;
  for(let i=0;i<3;i++){const a=await author(env,current,i);current=assess(env,a.authored,i).assessed;}
  const value=candidate(current,3);
  value.design.commands=[{...value.design.commands[0],timeoutMs:60000,terminationGraceMs:30000}];
  const budget=c2.projectWorksiteCommandExecutionBudget(value.design);
  assert.equal(budget.commandBudgetMs,120250);assert.equal(budget.requiredExecutionBudgetMs,125250);
  assert.equal(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits),expected);
  assert.equal(m.semanticJobDesignMatches(current,value.design),expected);
  if(!expected){
   assert.equal(c2.worksiteCommandExecutionBudgetFits(95000,limits),true,'the old one-grace total admitted this envelope');
   const issue=m.semanticJobDesignIssues(current,value.design).find(row=>row.rule==='enclosing_execution_capacity');
   assert.equal(issue.actual.requiredExecutionBudgetMs,125250);
   assert.deepEqual(issue.expected.selectedLimits,limits);
  }
  const contract=m.projectSemanticJobActorContract(current,declaration.stages[3].declarationRef,'author');
  assert.deepEqual(contract.design.executionCapacity.budgetRule,budget.rule);
  assert.deepEqual(contract.design.executionCapacity.selectedLimits,limits);
 }
 t.diagnostic('Controlled Product worksite/semantic values; no helper, actor, installed execution or UAT credit.');
});

test('command budget shares HTTP terms and exact existing C2 selector behavior',async()=>{
 const c2=await load('product/worksite_command_execution'),implementation=await load('implementation/worksite_command_execution');
 const budget=c2.projectWorksiteCommandExecutionBudget({commands:[{timeoutMs:1000,terminationGraceMs:100}],outcomePredicates:[
  {predicateKind:'http_response_exact',declaration:{launch:{timeoutMs:40000,terminationGraceMs:1000},request:{timeoutMs:20000}}},
  {predicateKind:'process_exit',declaration:{equals:0}}]});
 assert.equal(budget.commandBudgetMs,1300);assert.equal(budget.httpProbeBudgetMs,62250);assert.equal(budget.requiredExecutionBudgetMs,68550);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(68550,{inactivityTimeoutMs:68550,absoluteTimeoutMs:900000}),false);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(68550,{inactivityTimeoutMs:68551,absoluteTimeoutMs:68552}),true);
 assert.equal(c2.worksiteCommandExecutionBudgetFits(68550,{inactivityTimeoutMs:68551,absoluteTimeoutMs:68551}),false);
 const before=[process.env.ABG_TS_FP_TIMEOUT_MS,process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS];
 try{delete process.env.ABG_TS_FP_TIMEOUT_MS;delete process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS;
  assert.deepEqual(implementation.selectedWorksiteCommandExecutionLimits(),{inactivityTimeoutMs:60000,absoluteTimeoutMs:3600000});
  process.env.ABG_TS_FP_TIMEOUT_MS='';process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='invalid';
  assert.throws(()=>implementation.selectedWorksiteCommandExecutionLimits(),/ABG_TS_FP_ABSOLUTE_TIMEOUT_MS must be one positive safe integer/);
  process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS='900000';assert.throws(()=>implementation.selectedWorksiteCommandExecutionLimits(),/ABG_TS_FP_TIMEOUT_MS must be one positive safe integer/);
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
  // The fold borrows the owned basis facts and reads its event bodies at that prefix.
  './execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>native,rehydrateExecutionBasisAtPrefix:()=>execution},
  './event_prefix.js':{runtimeEventBodiesAtPrefix:prefix=>prefix===native.prefix?native.events:[],indexedRuntimeEvents:(prefix,key)=>key==='invocation:'+execution.invocationRef?[{kind:'basis_admitted',payload:{basisClass:'root',basisRef:execution.basisRef,invocationAdmissionRef:execution.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:execution.rawInputValue}}]:prefixes.indexedRuntimeEvents(prefix,key)},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})},
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},
  './semantic_stage.js':{projectSemanticPredecessorAtPrefix:(_prefix,_events,_publication,ref)=>predecessors.get(ref)??null},
  './native_worksite_execution.js':{projectNativeWorkspaceWorkSourceAtPrefix:()=>nativeSourceAvailable?{
   sourceResult:{runId:native.call.runId,admissionOrdinal:1},sourceBasis:execution,sourceTask:task,sourceClosedEvent:{admissionOrdinal:2}}:null,
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
 const c2=m.constructNativeSemanticExecutionTask(current,observation,task);assert.equal(p.isNativeWorksiteCommandExecutionTask(c2),true);assert.deepEqual(c2.sourceNativeWork,observation);
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
 // B56 complete dependency relation. Component premises, explicitly labelled:
 // (1) the actual core semantic-stage publication and its actual assessment
 // contract are the unique schema owner; (2) the executing consumer Program is
 // a component publication whose members are the actual native semantic
 // stage/review GraphFunctions; (3) installs and lock are admitted-shaped facts
 // built from those exact coordinates. No ABG admission, actor or install runs.
 const relationOwner=await load('product/publication'),contractRef=selection.resultContract.contractRef,consumerId='product://component/b56-consumer';
 const assessorOwnerProductId=p.ABI5_PRODUCT_ID,consumerModule='module://component/b56-consumer';
 const declaring=declaration.stages.slice(0,2).flatMap(stage=>g.constructNativeSemanticStageGraphFunctions(stage,'contract://component/b56-consumer/close','contract://component/b56-consumer/assess-close'));
 const consumerProgram=(programRef,members)=>({...publication.programs[0],programRef,moduleRef:consumerModule,starts:[{startRef:programRef+'/start',graphFunctionRef:members[0]}],
  callableMembership:members,policies:{...publication.programs[0].policies,'abg.default_start_ref':programRef+'/start'}});
 const executingRef='program://component/b56-consumer/executing',memberRefs=[...declaring.map(x=>x.name),g.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef];
 const consumer={...publication,moduleRef:consumerModule,owningProductId:consumerId,artifactDigest:hash('b56-consumer-artifact'),productContentDigest:hash('b56-consumer-content'),
  productManifestDigest:hash('b56-consumer-manifest'),contracts:[],implementationBindings:[],closureContracts:[],graphFunctions:declaring,programs:[consumerProgram(executingRef,memberRefs)],contributions:[]};
 const lockRow=x=>({productId:x.owningProductId,artifactDigest:x.artifactDigest,productContentDigest:x.productContentDigest,manifestDigest:x.productManifestDigest});
 const installOf=(x,lock,publicContracts=[])=>({productId:x.owningProductId,installId:'install://component/b56/'+x.owningProductId,installedRoot:env.scratch,publicContracts,
  artifactDigest:x.artifactDigest,productContentDigest:x.productContentDigest,manifestDigest:x.productManifestDigest,resolvedLockId:lock.lockId,resolvedLockDigest:lock.lockDigest,
  contributionManifest:{publicationBindings:[{moduleRef:x.moduleRef,publicationDigest:relationOwner.modulePublicationSemanticDigest(x)}]}});
 // One admitted-shaped world per case, so each negative crosses only its own coordinate.
 const world=({owner=publication,use=consumer,sel=selection,ownerContracts=install.publicContracts,programRef=executingRef,
  edges=[...new Set([assessorOwnerProductId,owner.owningProductId])].filter(to=>to!==use.owningProductId).map(to=>({kind:'requires',fromProductId:use.owningProductId,toProductId:to}))}={})=>{
  const rows=[...new Map([publication,owner,use].map(x=>[x.owningProductId,lockRow(x)])).values()],lockDigest=hash({rows,dependencyEdges:edges});
  const resolvedLock={kind:'resolved_product_lock',schemaVersion:'5.0.0',lockId:'product-lock://component/b56/'+lockDigest.slice(7),lockDigest,nativeContractClosureDigest:zero,rows,dependencyEdges:edges};
  const installs=[installOf(owner,resolvedLock,ownerContracts),...(use.owningProductId===owner.owningProductId?[]:[installOf(use,resolvedLock)])];
  const program=use.programs.find(x=>x.programRef===programRef);
  return {selection:sel,basis:{publications:[...new Map([owner,use].map(x=>[x.moduleRef,x])).values()],installs,resolvedLock,assessorOwnerProductId,
   program:{publication:use,programRef,programDigest:program===undefined?zero:hash(program)}}};
 };
 const base=world(),with_=(over)=>({selection,basis:{...base.basis,...over}});
 const otherProgram={...consumer,programs:[consumerProgram(executingRef,[g.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef]),consumerProgram('program://component/b56-consumer/other',declaring.map(x=>x.name))]};
 const nonMember={...consumer,programs:[consumerProgram(executingRef,[g.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef])]};
 // Consumer-owned coincident case: the consumer declares, installs and uses its own contract.
 const ownedRef='contract://component/b56-consumer/assessment@5',ownedText=JSON.stringify({...m.NATIVE_SEMANTIC_ASSESSMENT_SCHEMA,$id:ownedRef})+'\n';
 await writeFile(join(env.scratch,'b56-consumer.schema.json'),ownedText);
 const ownedSelection={...selection,resultContract:{...selection.resultContract,contractRef:ownedRef},schemaAsset:{productId:consumerId,contractId:ownedRef,bytesBase64:Buffer.from(ownedText).toString('base64')}};
 const owned={...consumer,contracts:[ownedSelection.resultContract],graphFunctions:declaring.map(x=>({...x,declarations:{...x.declarations,'abg.raw_result_contract':ownedRef}}))};
 const ownedContracts=[{contractId:ownedRef,contractVersion:'5.0.0',contractKind:'schema_asset',owningProduct:consumerId,contractDigest:p.sha256Bytes(Buffer.from(ownedText)),
  assetLocator:{path:'b56-consumer.schema.json',mediaType:'application/schema+json',contentDigest:p.sha256Bytes(Buffer.from(ownedText))}}];
 const cases=[
  ['split schema owner and executing consumer Program use',base,'resolved'],
  ['consumer-owned coincident schema owner and use',world({owner:owned,use:owned,sel:ownedSelection,ownerContracts:ownedContracts}),'resolved'],
  ['absent carried schema owner',with_({publications:[consumer]}),null],
  ['wrong carried schema owner',with_({publications:[{...publication,owningProductId:'product://foreign'},consumer]}),null],
  ['ambiguous schema declaration',world({use:{...consumer,contracts:[selection.resultContract]}}),null],
  ['missing executing Program',with_({program:{...base.basis.program,programRef:'program://component/b56-consumer/absent'}}),null],
  ['wrong executing Program digest',with_({program:{...base.basis.program,programDigest:zero}}),null],
  ['wrong executing Program publication',with_({program:{...base.basis.program,publication}}),null],
  ['use found only in another Program',world({use:otherProgram}),null],
  ['declaring callables are not members of the executing Program',world({use:nonMember}),null],
  ['crossed schema-owner install binding',with_({installs:base.basis.installs.map(i=>i.productId!==publication.owningProductId?i:{...i,contributionManifest:{publicationBindings:[]}})}),null],
  ['crossed executing Program install binding',with_({installs:base.basis.installs.map(i=>i.productId!==consumerId?i:{...i,contributionManifest:{publicationBindings:[{moduleRef:consumerModule,publicationDigest:zero}]}})}),null],
  ['crossed executing Program install lock',with_({installs:base.basis.installs.map(i=>i.productId!==consumerId?i:{...i,resolvedLockDigest:zero})}),null],
  ['crossed lock row',with_({resolvedLock:{...base.basis.resolvedLock,rows:base.basis.resolvedLock.rows.map(r=>r.productId!==consumerId?r:{...r,manifestDigest:zero})}}),null],
  ['crossed executing publication identity',with_({program:{...base.basis.program,publication:{...consumer,artifactDigest:zero}}}),null],
  ['missing forward dependency',world({edges:[]}),null],
  ['reverse dependency only',world({edges:[{kind:'requires',fromProductId:assessorOwnerProductId,toProductId:consumerId}]}),null],
 ];
 const observe=thunk=>{try{return {value:thunk()};}catch(error){return {thrown:{name:error?.name??null,message:String(error?.message??error),stack:error?.stack??null}};}};
 const outcomes=cases.map(([label,{selection:sel,basis}])=>({label,selection:sel,basis,...observe(()=>schemaOwner.resolveNativeWorkspaceAssessmentDependency(sel,basis))}));
 const schemaOnly=[['exact owner',[publication]],['foreign owner',[{...publication,owningProductId:'product://foreign'}]],['duplicate declaration',[publication,publication]],
  ['missing declaration',[{...publication,contracts:publication.contracts.filter(c=>c.contractRef!==contractRef)}]]]
  .map(([label,publications])=>({label,...observe(()=>schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,publications,[install]))}));
 await writeFile(join(env.scratch,'assessment.schema.json'),'{}');
 const changedBytes={label:'changed installed schema bytes',schemaOnly:observe(()=>schemaOwner.resolveNativeWorkspaceAssessmentSchema(selection,[publication],[install])),
  dependency:observe(()=>schemaOwner.resolveNativeWorkspaceAssessmentDependency(selection,base.basis))};
 const authorMembers=publication.graphFunctions.map(x=>({name:x.name,rawResultContract:x.declarations['abg.raw_result_contract']??null,
  programMember:publication.programs.some(pr=>pr.callableMembership.includes(x.name))}));
 const captureRoot=process.env.ABG_REGRESSION_PROOF_ROOT;
 if(captureRoot!==undefined&&captureRoot!==''){await mkdir(captureRoot,{recursive:true});
  await writeFile(join(captureRoot,'b56-dependency.candidate.json'),JSON.stringify({test:'native typed semantic assessment uses the exact installed schema owner and rejects wrong declarations',
   componentPremises:['actual core semantic-stage publication and assessment contract as schema owner','component consumer Program publication over actual native semantic GraphFunctions',
    'admitted-shaped install and lock facts from exact coordinates'],
   schemaOwner:{moduleRef:publication.moduleRef,owningProductId:publication.owningProductId,contractRef,authorMembers},
   executingProgram:{moduleRef:consumerModule,owningProductId:consumerId,programRef:executingRef,memberRefs},
   cases:outcomes,schemaOnly,changedBytes},null,1)+'\n',{flag:'wx'});}
 // Premise: the core owner's sole Program member keeps the original worker
 // result, so a same-publication owner/use restriction refuses the split case.
 assert.deepEqual(authorMembers,[{name:g.SEMANTIC_STAGE_IDS.graphFunctionRef,rawResultContract:g.SEMANTIC_STAGE_IDS.workerContractRef,programMember:true}]);
 assert.ok(publication.contracts.some(c=>c.contractRef===contractRef),'the core semantic-stage publication owns the assessment contract');
 assert.equal(consumer.contracts.some(c=>c.contractRef===contractRef),false,'the executing consumer Program does not own the contract');
 for(const outcome of outcomes){
  assert.equal(outcome.thrown,undefined,outcome.label+' owner boundary does not throw');
  const expected=cases.find(([label])=>label===outcome.label)[2];
  if(expected===null){assert.equal(outcome.value,null,outcome.label);continue;}
  assert.ok(outcome.value,outcome.label);
 }
 const split=outcomes[0].value,coincident=outcomes[1].value;
 assert.equal(split.publication,publication,'the schema owner stays the core semantic-stage publication');assert.equal(split.install.productId,publication.owningProductId);
 assert.deepEqual(split.schema,m.NATIVE_SEMANTIC_ASSESSMENT_SCHEMA);
 assert.equal(split.use.publication,consumer);assert.equal(split.use.install.productId,consumerId);assert.equal(split.use.programRef,executingRef);
 assert.deepEqual(split.use.memberRefs,declaring.map(x=>x.name),'several legitimate declaring members of the exact Program');assert.ok(split.use.memberRefs.length>1);
 assert.equal(coincident.publication,owned);assert.equal(coincident.use.publication,owned);assert.equal(coincident.install,coincident.use.install,'one consumer install owns and uses');
 assert.deepEqual(coincident.schema,{...m.NATIVE_SEMANTIC_ASSESSMENT_SCHEMA,$id:ownedRef});
 assert.deepEqual(schemaOnly.map(o=>[o.label,o.thrown,o.value===null?null:'schema']),[['exact owner',undefined,'schema'],['foreign owner',undefined,null],['duplicate declaration',undefined,null],['missing declaration',undefined,null]]);
 assert.deepEqual(schemaOnly[0].value,m.NATIVE_SEMANTIC_ASSESSMENT_SCHEMA);
 assert.equal(changedBytes.schemaOnly.value,null);assert.equal(changedBytes.dependency.value,null,'changed installed schema bytes refuse the complete relation');
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
 const c2=m.constructNativeSemanticExecutionTask(current,observation,task), expected=['app/main.mjs','app/check.mjs',dependency];
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
 const sourceOwner=await load('product/worksite_revision');
 assert.deepEqual(sourceOwner.worksiteExecutionSources(retained).map(row=>row.subject.relativePath),expected,
  'the existing C2 snapshot and evidence owner receive exactly the target/dependency union');
 for(const path of [dependency,'app/main.mjs']){const original=await readFile(join(env.canonicalRoot,path));
  await writeFile(join(env.canonicalRoot,path),'changed after exact observation');
  assert.throws(()=>implementation.realizeWorksiteCommandExecution(c2,occurrence),/protected worksite observation changed/);
  await writeFile(join(env.canonicalRoot,path),original);}
 assert.equal(await readFile(join(env.canonicalRoot,dependency),'utf8'),'export const value = 7;\n');
});

// T-293 B21 component evidence: both live subject observations of the
// semantic-job bridge (Design targets and read-only dependencies) receive the
// authenticated owner's complete admitted install roots and refuse a held
// install before reading it. Upstream authentication, prefix events and
// predecessor projections are supplied component premises, as in the Design
// budget case; the bridge, the actual C0 subject owner and the cold parent
// effect run. Opens, path reads and handle content reads are counted at
// node:fs/promises. No journal, runtime admission, actor, provider or
// installed claim.
test('B21 component: the semantic-job bridge observes targets and read dependencies under the held admitted install roots',async t=>{
 const DATA='/System/Volumes/Data';
 const aliasHolds=path=>{if(process.platform!=='darwin')return false;
  try{const a=lstatSync(path,{bigint:true}),b=lstatSync(DATA+path,{bigint:true});
   return a.dev===b.dev&&a.ino===b.ino&&realpathSync.native(path)===path&&realpathSync.native(DATA+path)===DATA+path;}catch{return false;}};
 const watched=async run=>{
  const names=['open','readFile','mkdir','writeFile','link','rename','unlink'],originals=Object.fromEntries(names.map(n=>[n,fsPromises[n]])),calls=[];
  for(const name of names)fsPromises[name]=async(...args)=>{const path=String(args[0]);calls.push({syscall:name,path});const value=await originals[name](...args);
   if(name==='open')for(const method of ['read','readFile','readv','readLines','createReadStream']){const original=value[method];
    if(typeof original==='function')value[method]=(...rest)=>{calls.push({syscall:'content',path});return original.apply(value,rest);};}
   return value;};
  syncBuiltinESMExports();
  try{return {result:await run(),calls};}finally{Object.assign(fsPromises,originals);syncBuiltinESMExports();}
 };
 const env=await fixture(t),dependency='config/value.mjs',dependencyPath=join(env.canonicalRoot,dependency);
 await mkdir(join(env.canonicalRoot,'config'));await writeFile(dependencyPath,'export const value = 7;\n');
 let current=env.envelope;
 for(let i=0;i<4;i++){const value=candidate(current,i);if(i===3)value.design.dependencyPaths=[dependency];
  const a=await author(env,current,i,value);current=assess(env,a.authored,i).assessed;}
 const asset=current.assets.at(-1);
 // The cold parent effect over the assessed Design targets (component coordinates).
 const request=await env.request(['app/main.mjs','app/check.mjs'],{sourceEnvelopeRef:'component:design-result',sourceEnvelopeDigest:hash(current),
  sourceDesignAssetRef:asset.assetRef,sourceDesignAssetDigest:asset.assetDigest,jobRef:current.basis.jobRef,jobDigest:current.basis.jobDigest});
 assert.equal(request.kind,'worksite_file_parents_request',JSON.stringify(request));
 const success=await env.create(request);assert.equal(success.kind,'worksite_file_parents_result',JSON.stringify(success));
 const ids=g.SEMANTIC_STAGE_IDS,pub=await load('product/publication'),{WORKSITE_FILE_PARENTS_IMPLEMENTATION:parents}=await load('implementation/worksite_file_replace');
 const selectedPublication={...publication,semanticJobLifecycle:current.declaration};
 const execution={...env.executionBasis,basisRef:current.basis.rootExecutionBasisRef,parentExecutionBasisRef:null,
  rawInputValue:env.job,rawInputDigest:hash(env.job),rawInputAdmissionRef:current.basis.rootInputRef,invocationAdmissionRef:current.basis.invocationAdmissionRef};
 const events=[{kind:'c_call_result_admitted',aggregateId:'component:plan',payload:{value:request}},
  {kind:'c_call_result_admitted',aggregateId:'component:design',payload:{resultRef:request.sourceEnvelopeRef,resultDigest:request.sourceEnvelopeDigest,value:current}},
  {kind:'c_call_result_admitted',aggregateId:'component:parents',payload:{value:success}}];
 const previous=(value,implementationRef,basisId)=>({cCall:{implementationRef,basisId},result:{resultClass:'success',value},judgment:{judgment:'advance'}});
 const predecessors=new Map([['component:plan',previous(request,ids.jobPlanImplementationRef,'component:plan-basis')],
  ['component:design',previous(current,ids.assessorImplementationRef,'component:design-basis')],
  ['component:parents',previous(success,parents.implementationRef,'component:parents-basis')]]);
 const install=installedRoot=>({productId:selectedPublication.owningProductId,artifactDigest:selectedPublication.artifactDigest,
  productContentDigest:selectedPublication.productContentDigest,manifestDigest:selectedPublication.productManifestDigest,installedRoot,
  contributionManifest:{publicationBindings:[{moduleRef:selectedPublication.moduleRef,publicationDigest:pub.modulePublicationSemanticDigest(selectedPublication)}]}});
 const native={execution,inputValue:success,inputDigest:hash(success),program:{},prefix:{component:'supplied'},
  call:{...env.cCall,regime:'F_D',implementationRef:ids.jobBridgeImplementationRef},events,
  environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,productInstalls:[]}};
 const {SourceTextModule,SyntheticModule}=await import('node:vm');
 async function component(name,overrides){
  const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await module.link(async spec=>{
   const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href);
   const values={...imported,...overrides[spec]};
   return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});
  });await module.evaluate();return module.namespace;
 }
 // Every live subject call is recorded and delegated to the actual C0 owner.
 const observed=[];
 const abg=await component('abg/semantic_job',{
  './execution_basis.js':{authenticateOwnedNativeInstructionAssemblyBasis:()=>native,
   rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>({...execution,basisRef:ref,parentExecutionBasisRef:execution.basisRef,rawInputValue:ref==='component:plan-basis'?current:env.job})},
  './event_prefix.js':{runtimeEventBodiesAtPrefix:()=>events,indexedRuntimeEvents:(_prefix,key)=>key==='invocation:'+execution.invocationRef
   ?[{kind:'basis_admitted',payload:{basisClass:'root',basisRef:execution.basisRef,invocationAdmissionRef:execution.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:execution.rawInputValue}}]
   :key==='kind:c_call_result_admitted'?events:events.filter(e=>key==='payload:resultRef:'+e.payload.resultRef)},
  './invocation_admission.js':{rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})},
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},
  './semantic_stage.js':{projectSemanticPredecessorAtPrefix:(_prefix,_events,_pub,ref)=>predecessors.get(ref)??null},
  '../product/worksite_operations.js':{observeWorksiteSubject:async(...args)=>{const value=await ops.observeWorksiteSubject(...args);observed.push({args,value});return value;}},
 });
 const basis={publication:selectedPublication,graphFunction:{declarations:{}}};
 const bridge=installedRoot=>{native.environment={...native.environment,productInstalls:[install(installedRoot)]};observed.length=0;
  return watched(()=>abg.projectSemanticJobBridge(basis,success));};
 const heldRoots=installedRoot=>observed.map(()=>[installedRoot]);
 const dependencyReads=calls=>calls.filter(c=>(c.path===dependencyPath||c.path===DATA+dependencyPath)&&['open','readFile','content'].includes(c.syscall));
 // Lawful: the held admitted install lies outside the worksite.
 const productRoot=env.workspaceBinding.roots.productRoot,lawful=await bridge(productRoot);
 assert.ok(lawful.result,'the lawful bridge prepares its construction input');
 assert.deepEqual(observed.map(row=>row.args[2].relativePath),['app/main.mjs','app/check.mjs',dependency],'both live call sites run');
 assert.deepEqual(observed.map(row=>row.args[3]),heldRoots(productRoot),'every live subject observation carries the held install roots');
 assert.ok(dependencyReads(lawful.calls).length>=1,'the lawful dependency is read through the actual owner (instrumentation live)');
 // Lexical held installs over a read dependency and over the Design targets.
 for(const [label,installedRoot,refusedPath] of [['dependency install',join(env.canonicalRoot,'config'),dependency],['target install',join(env.canonicalRoot,'app'),'app/main.mjs']]){
  const {result,calls}=await bridge(installedRoot);
  assert.equal(result,null,label);
  assert.deepEqual(observed.map(row=>row.args[3]),heldRoots(installedRoot),label+': held install roots reach every subject call');
  assert.equal(observed.at(-1).args[2].relativePath,refusedPath,label);
  assert.equal(observed.at(-1).value.code,'binding_mismatch',label+': '+JSON.stringify(observed.at(-1).value));
  assert.deepEqual(dependencyReads(calls),[],label+': the dependency is never opened or read');
 }
 await t.test('Data-aliased held install over the read dependency',{skip:!aliasHolds(env.canonicalRoot)&&'host premise absent: no /System/Volumes/Data alias of the worksite'},async()=>{
  const {result,calls}=await bridge(DATA+join(env.canonicalRoot,'config'));
  assert.equal(result,null);
  assert.equal(observed.at(-1).args[2].relativePath,dependency);
  assert.equal(observed.at(-1).value.code,'subject_outside_territory',JSON.stringify(observed.at(-1).value));
  assert.deepEqual(dependencyReads(calls),[],'refused before the dependency is opened or read');
 });
 assert.equal(await readFile(dependencyPath,'utf8'),'export const value = 7;\n');
 t.diagnostic('Component semantic-job bridge proof; upstream authentication, prefix events and predecessors supplied; no actor or installed execution.');
});

// B64 capture law: every actual candidate is collected before any assertion
// and written complete to ABG_REGRESSION_PROOF_ROOT. A collection or assertion
// failure is primary and stays primary; a capture failure alone fails the case,
// and beside a primary it is reported as distinct secondary evidence.
function writeB64Candidate(file,value){const dir=process.env.ABG_REGRESSION_PROOF_ROOT;if(dir===undefined||dir==='')return null;
 try{mkdirSync(dir,{recursive:true});writeFileSync(join(dir,file),JSON.stringify(value,null,1));return null;}catch(error){return error;}}
async function b64CapturedCase(t,file,candidate,collect,verify){
 const fail=(phase,primary)=>{candidate.primaryError={phase,error:String(primary?.stack??primary)};const secondary=writeB64Candidate(file,candidate);
  if(secondary!==null)t.diagnostic(`secondary capture failure beside primary ${phase} failure: ${String(secondary?.stack??secondary)}`);throw primary;};
 try{await collect();}catch(primary){fail('collect',primary);}
 const captureError=writeB64Candidate(file,candidate);
 if(captureError!==null)throw new Error(`B64 candidate capture failed: ${String(captureError?.stack??captureError)}`,{cause:captureError});
 try{await verify();}catch(primary){fail('verify',primary);}
}

// B64 owner path: the actual Product native assessor fold folds an `after`
// whose unchanged bodies the real held-prefix owner carried as admitted members
// of the real event store; the actual revision intake and subject owner derive
// the historical use in a new Run; the actual selector decision view presents
// the complete bytes through the real body owner, held and cold. Upstream
// execution-basis/invocation/leaf/prefix-index authentication uses the same
// component premises as the native revision harness; Result coordinates,
// member holders and every body read are the real store's. No provider runs.
test('B64 historical revision: admitted assessor context reaches new-Run selector assembly held and cold',async t=>{
 const candidate={kind:'b64_historical_revision_candidate',premise:null,intake:null,subject:null,views:{},refusals:[],current:null,carriers:null};
 const asJson=read=>read.kind==='worksite_context_body'?{...read,bytes:read.bytes.toString('base64')}:read;
 let x=null;
 await b64CapturedCase(t,'b64-historical-revision.candidate.json',candidate,async()=>{
  const [storeOwner,revisionIds,history,assembly,decl,{SourceTextModule,SyntheticModule}]=await Promise.all([load('abg/event_store'),load('gtl/semantic_revision_identity'),
   load('abg/runtime_history'),load('abg/instruction_assembly'),import('../fixtures/native-semantic-revision/declarations.mjs'),import('node:vm')]);
  const R=revisionIds.SEMANTIC_REVISION_IDS,D=g.SEMANTIC_STAGE_IDS;
  const ids=Object.fromEntries(Object.entries({productId:'product',moduleRef:'module',descriptorRef:'descriptor',contributionManifestRef:'contribution-manifest',
   lifecycleDeclarationRef:'lifecycle',graphFunctionRef:'graph-function',graphRef:'graph',closureContractRef:'contract',programRef:'program',startRef:'start'}).map(([k,v])=>[k,v+'://component/b64@5']));
  const revPublication=decl.constructFreshNativeLifecyclePublication({gtl:g,product:p,ids,semanticPublication:publication}),lifecycle=revPublication.semanticJobLifecycle;
  // Real worksite and real event store.
  const env=await worksiteFixture({...p,...effects,...ops});t.after(()=>rm(env.scratch,{recursive:true,force:true}));
  const initial=ordinaryJob(p,g,'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
  const job=p.constructSemanticJobInput({...initial,lifecycleRef:lifecycle.declarationRef,evaluationData:{independentSentinel:'evaluator-only-b64'},taskData:{...initial.taskData,nativeLifecycle:{assets:lifecycle.stages.map((s,i)=>({stageRef:s.declarationRef,path:`assets/${i}.json`})),rubricPath:'assets/rubric.json'}},
   worksiteScope:{...initial.worksiteScope,readRoots:['.'],writeRoots:['.'],parentWriteRoots:['.'],evidenceWriteRoots:['evidence']}});
  await mkdir(join(env.canonicalRoot,'assets'));for(const member of job.members){await mkdir(join(env.canonicalRoot,member.path,'..'),{recursive:true});await writeFile(join(env.canonicalRoot,member.path),Buffer.from(member.base64,'base64'));}
  await writeFile(join(env.canonicalRoot,'assets/rubric.json'),p.canonicalJson(lifecycle)+'\n');
  const observe=()=>ops.observeWorksiteContext({...env,readRoots:job.worksiteScope.readRoots,maxFiles:lifecycle.bounds.maxContextFiles,maxBytes:lifecycle.bounds.maxContextBytes});
  const envelope0=p.constructSemanticJobEnvelope(job,lifecycle,{invocationAdmissionRef:'component:invocation',rootExecutionBasisRef:'component:root',rootInputRef:'component:input',rootInputDigest:hash(job),
   intakeCCallRef:'component:intake',intakeCCallDigest:hash('intake'),intakeExecutionBasisRef:'component:intake-basis'});
  const dir=await fsPromises.mkdtemp(join(env.scratch,'b64-store-')),eventLogPath=join(dir,'events.jsonl');
  const acquired=storeOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath});assert.ok(acquired.store,JSON.stringify(acquired));
  t.after(()=>acquired.store.closeDurableLog());const store=acquired.store;
  const envl=(kind,payload,o={})=>({kind,payload,eventTime:'2026-11-16T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://b64',parentAggregateId:null,
   causationEventRefs:[],correlationId:'correlation://b64',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://b64',...o});
  // Real store admission of one CCall Result at exact cCallRef/Run coordinates.
  const storeResult=(cCallRef,runId,value)=>{const extra={aggregateType:'c_call',aggregateId:cCallRef,parentAggregateId:'frame://'+cCallRef,scopeClass:'run',runId,graphCallId:'graph-call://'+cCallRef,frameId:'frame://'+cCallRef};
   const pair=storeOwner.admitRuntimeEventBatch(store,[()=>envl('c_call_opened',{cCallRef,cCallDigest:hash(cCallRef),callClass:'leaf',batchRef:null,taskOrdinal:null,attempt:1,programLocusRef:'locus://'+cCallRef,retryPath:[]},extra),
    prior=>envl('c_call_fibre_selected',{cCallRef,callClass:'leaf',armId:'arm://b64',regime:'F_D'},{...extra,causationEventRefs:[prior.at(-1).eventId]})]);
   const body={cCallRef,resultClass:'success',contractRef:'contract://b64-output',valueKind:value.kind,evidenceRefs:[],value,valueDigest:hash(value)};
   const resultDigest=hash(body),resultRef='result://b64/'+resultDigest.slice(7);
   return storeOwner.admitRuntimeEvent(store,envl('c_call_result_admitted',{...body,resultRef,resultDigest},{...extra,causationEventRefs:[pair.at(-1).eventId]}));};
  const heldPrefix=()=>prefixes.selectRuntimeEventPrefixFromStore(store);
  // Lifecycle stages through the actual Product folds; stage 2 is assessed adverse.
  const stageCandidate=(envelope,i)=>{const stage=lifecycle.stages[i],member=envelope.job.members[0],q={memberRef:member.memberRef,quote:Buffer.from(member.base64,'base64').toString()};
   return {kind:'semantic_job_asset_candidate',schemaVersion:'5.0.0',asset:{kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',
    statements:[{statementRef:stage.declarationRef+'/s',text:q.quote,modality:'supporting',sourceQuotes:[q],requirementRefs:[],obligationRefs:[],predecessorStatementRefs:envelope.assets.flatMap(a=>a.candidate.asset.statements.map(s=>s.statementRef))}],
    requirementCandidates:[],worksiteDesign:null,pressure:[]},bindings:[],design:null};};
  const stageVerdict=(authored,i,disposition)=>{const member=authored.job.members[0];return {kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:lifecycle.stages[i].rubric.map(r=>({criterionRef:r.criterionRef,disposition,
   explanation:'Mechanical component value only; no semantic acceptance claim',sourceQuotes:[{memberRef:member.memberRef,quote:Buffer.from(member.base64,'base64').toString()}],statementRefs:authored.assets.at(-1).candidate.asset.statements.map(s=>s.statementRef)})),pressure:[]};};
  const stageAuthor=async(envelope,i)=>{const stage=lifecycle.stages[i],task=m.constructNativeSemanticTask(envelope,stage.declarationRef,'author',env,await observe());
   await writeFile(join(env.canonicalRoot,`assets/${i}.json`),JSON.stringify(stageCandidate(envelope,i))+'\n');const observation=n.constructNativeWorkspaceWorkObservation(task,await observe(),{summary:'component candidate',gaps:[]},provenance('b64-author-'+i));
   const authored=m.deriveNativeSemanticAsset(envelope,stage.declarationRef,observation,adapter('b64-author-'+i,p.constructRetainedGraphInput(envelope,observation)));assert(authored,'author fold '+i);return authored;};
  let parent=envelope0;
  for(let i=0;i<2;i++){const authored=await stageAuthor(parent,i),task=m.constructNativeSemanticTask(authored,lifecycle.stages[i].declarationRef,'assessor',env,authored.context);
   const observation=n.constructNativeWorkspaceWorkObservation(task,authored.context,null,provenance('b64-assessor-'+i),stageVerdict(authored,i,'satisfied'));
   parent=m.deriveNativeSemanticAssessment(authored,lifecycle.stages[i].declarationRef,observation,adapter('b64-assessor-'+i,p.constructRetainedGraphInput(authored,observation)));assert(parent,'assessor fold '+i);}
  const sourceRun={ref:'component:source-run',digest:hash('public-run')};
  const authored=await stageAuthor(parent,2),assessorTask=m.constructNativeSemanticTask(authored,lifecycle.stages[2].declarationRef,'assessor',env,authored.context);
  // The assessor task's admitted inline context is the holder; the real
  // held-prefix owner then carries the unchanged reobserved after as members.
  const holder=storeResult('component:b64-assessor-task',sourceRun.ref,assessorTask);
  const after=prefixes.reuseWorksiteContextBodiesAtPrefix(heldPrefix(),await observe(),{runId:sourceRun.ref});
  const assessorObservation=n.constructNativeWorkspaceWorkObservation(assessorTask,after,null,provenance('b64-assessor-2'),stageVerdict(authored,2,'falsified'));
  const adverse=m.deriveNativeSemanticAssessment(authored,lifecycle.stages[2].declarationRef,assessorObservation,adapter('b64-assessor-2',p.constructRetainedGraphInput(authored,assessorObservation)));
  // The carriage premise is a candidate, retained before any assertion.
  const files=context=>context.entries.filter(e=>e.state==='file');
  candidate.premise={holder:{eventRef:holder.eventId,resultRef:holder.payload.resultRef,runId:sourceRun.ref},after,
   foldContext:adverse?.context??null,entries:files(after).map(e=>({relativePath:e.relativePath,encoding:e.encoding,member:e.member??null,digest:e.digest,byteLength:e.byteLength})),
   foldDerived:adverse!==null,foldNativeIntakeFoldPredicate:adverse===null?null:m.evaluateNativeSemanticRelation(D.nativeAssessorFoldPredicateRef,p.constructRetainedGraphInput(authored,assessorObservation),adverse)};
  if(adverse===null)throw new Error('native assessor fold refused its member-carried observation');
  // Component premises of the existing native revision harness; leaves and holders are real store rows.
  const events=[],states=new Map(),bases=new Map(),nativeSources=new Map(),runs=new Map(),admittedRoots=[];let ordinal=0;
  const prefix={events},original={...env.executionBasis,basisRef:adverse.basis.rootExecutionBasisRef,parentExecutionBasisRef:null,rawInputValue:job,rawInputDigest:hash(job),
   rawInputAdmissionRef:adverse.basis.rootInputRef,invocationAdmissionRef:adverse.basis.invocationAdmissionRef};
  bases.set(original.basisRef,original);admittedRoots.push(original);runs.set(sourceRun.ref,{run:sourceRun,executionBasis:{ref:original.basisRef}});
  const environment={kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,productInstalls:[]};
  const lifecycleInstallRoot=join(env.scratch,'installed-lifecycle');await mkdir(lifecycleInstallRoot,{recursive:true});const pub=await load('product/publication');
  environment.productInstalls.push({productId:revPublication.owningProductId,artifactDigest:revPublication.artifactDigest,productContentDigest:revPublication.productContentDigest,
   manifestDigest:revPublication.productManifestDigest,installedRoot:lifecycleInstallRoot,contributionManifest:{publicationBindings:[{moduleRef:revPublication.moduleRef,publicationDigest:pub.modulePublicationSemanticDigest(revPublication)}]}});
  const prefixBody={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///component/no-journal',prefixLength:0,prefixDigest:hash('prefix'),storeIdentity:{device:1,inode:1,eventContractDigest:storeOwner.ROOT_EVENT_CONTRACT_DIGEST}};
  const intake={kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun,sourcePrefix:{...prefixBody,coordinateDigest:hash(prefixBody)}};
  let current,rootBasis,runId;const basis={publication:revPublication,lifecyclePublication:revPublication,sourcePublication:revPublication,predecessorPrefix:intake.sourcePrefix,declarationGraphFunctions:[],graphFunction:{declarations:{}}};
  const invocation=(name,input)=>{runId='component:run:'+name;rootBasis={...original,basisRef:'component:root:'+name,basisDigest:hash(['basis',name]),admissionEventRef:'component:basis-event:'+name,
   rawInputValue:input,rawInputDigest:hash(input),rawInputAdmissionRef:'component:input:'+name,invocationAdmissionRef:'component:invocation:'+name,
   workspaceBindingId:env.workspaceBinding.bindingId,workspaceBindingDigest:env.workspaceBinding.bindingDigest};bases.set(rootBasis.basisRef,rootBasis);admittedRoots.push(rootBasis);
   runs.set(runId,{run:{ref:runId,digest:hash(['run',name])},executionBasis:{ref:rootBasis.basisRef}});};
  const call=(impl,input,raw=input,extra={})=>{const execution={...rootBasis,basisRef:'component:basis:'+(++ordinal),parentExecutionBasisRef:rootBasis.basisRef,rawInputValue:raw,rawInputDigest:hash(raw)};
   bases.set(execution.basisRef,execution);const cCall={...env.cCall,cCallRef:'component:call:'+ordinal,basisId:execution.basisRef,runId,implementationRef:impl,regime:[R.selectionImplementationRef].includes(impl)?'F_P':'F_D',...extra};
   current={execution,call:cCall,inputValue:input,inputDigest:hash(input),inputRef:'component:input:'+ordinal,prefix,events,environment,program:{}};basis.cCall=cCall;basis.executionBasis=execution;return current;};
  // Each harness leaf is the real store's Result at the same CCall and Run.
  const admit=(value,impl,execution,judgment,cCallRef,run)=>{const real=storeResult(cCallRef,run,value),judgmentEventRef='component:judgment:'+(++ordinal);
   const state={cCall:{...env.cCall,cCallRef,basisId:execution.basisRef,runId:run,implementationRef:impl,graphFunctionRef:current?.call.graphFunctionRef??'component:graph',regime:impl===R.selectionImplementationRef?'F_P':'F_D'},
    result:{resultClass:'success',resultRef:real.payload.resultRef,resultDigest:real.payload.resultDigest,value,valueKind:value.kind,admissionEventRef:real.eventId},judgment:{judgment,admissionEventRef:judgmentEventRef}};
   states.set(cCallRef,state);events.push({kind:'c_call_result_admitted',aggregateId:cCallRef,runId:run,eventId:real.eventId,admissionOrdinal:++ordinal,payload:{resultRef:real.payload.resultRef,resultDigest:real.payload.resultDigest,value}},
    {kind:'c_call_judged',aggregateId:cCallRef,runId:run,eventId:judgmentEventRef,admissionOrdinal:++ordinal,payload:{}});return state;};
  const coordinate=s=>({cCallRef:s.cCall.cCallRef,resultRef:s.result.resultRef,resultDigest:s.result.resultDigest,resultAdmissionEventRef:s.result.admissionEventRef,judgmentEventRef:s.judgment.admissionEventRef});
  const lookup=(_prefix,c)=>{const state=states.get(c.cCallRef);return state&&hash(coordinate(state))===hash(c)?state:null;};
  const selected=(_basis,impl,value)=>{const rows=[...states.values()].filter(s=>s.result.resultClass==='success'&&s.judgment.judgment==='advance'&&s.cCall.implementationRef===impl&&hash(s.result.value)===hash(value)&&bases.get(s.cCall.basisId)?.invocationAdmissionRef===current.execution.invocationAdmissionRef);
   return rows.length===1?{previous:rows[0],execution:bases.get(rows[0].cCall.basisId),event:events.find(e=>e.eventId===rows[0].result.admissionEventRef)}:null;};
  async function component(name,overrides){const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
   await module.link(async spec=>{const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href),values={...imported,...overrides[spec]};
    return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});});await module.evaluate();return module.namespace;}
  const executionOverrides={authenticateNativeInstructionAssemblyBasis:()=>current,authenticateOwnedNativeInstructionAssemblyBasis:()=>current,rehydrateExecutionBasisAtPrefix:(_p,ref)=>bases.get(ref)??null};
  const invocationOverrides={rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[env.capabilityGrant]})};
  const rootAdmissions=key=>admittedRoots.filter(b=>'invocation:'+b.invocationRef===key).map(b=>({kind:'basis_admitted',eventId:b.admissionEventRef,
   payload:{basisClass:'root',basisRef:b.basisRef,invocationAdmissionRef:b.invocationAdmissionRef,implementationSetRef:b.rootImplementationSetRef,rawInputValue:b.rawInputValue}}));
  const prefixOverrides={validatedRuntimeEventPrefixBeforeEvent:()=>prefix,runtimeEventsFromValidatedPrefix:()=>events,runtimeEventBodiesAtPrefix:()=>new history.RuntimeEventBodyView(events),
   indexedRuntimeEvents:(_p,key)=>key.startsWith('invocation:')?rootAdmissions(key):events.filter(e=>key==='aggregate:c_call:'+e.aggregateId||key==='id:'+e.eventId||/^(run|related):/.test(key)&&history.runtimeHistorySelectorKeys(e).includes(key)),
   readOwnedRuntimeEventPrefixAtDurablePrefix:c=>{if(hash(c)!==hash(intake.sourcePrefix))throw new Error('component: no durable cut');return prefix;}};
  const jobOwner=await component('abg/semantic_job',{'./execution_basis.js':executionOverrides,'./invocation_admission.js':invocationOverrides,'./event_prefix.js':prefixOverrides,
   '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},'./worksite_revision.js':{projectWorksiteRevisionNativeResult:lookup}});
  const owner=await component('abg/semantic_revision',{'./execution_basis.js':executionOverrides,'./invocation_admission.js':invocationOverrides,'./semantic_job.js':jobOwner,
   './semantic_stage.js':{selectedSemanticPredecessor:selected},'./event_store.js':{authenticateRuntimePrefixAncestry:()=>true,reidentifyHistoricalDurablePrefixCoordinate:(_c,h)=>h},
   './event_prefix.js':prefixOverrides,'./replay.js':{projectRunIdentityAtPrefix:(_p,ref)=>runs.get(ref)??null},
   './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:()=>environment},'./worksite_revision.js':{projectWorksiteRevisionNativeResult:lookup,projectWorksiteRevisionBindingCover:()=>[]},
   './native_worksite_execution.js':{projectNativeWorkspaceWorkSourceAtPrefix:(_p,value)=>nativeSources.get(value.observationRef)??null,worksiteCommandSourcesInvalidatedAfter:()=>false}});
  // Source Run: the accepted parent and the adverse native assessor fold.
  const parentState=admit(parent,D.nativeAssessorFoldImplementationRef,original,'advance',parent.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,sourceRun.ref);
  const causeState=admit(adverse,D.nativeAssessorFoldImplementationRef,original,'stop',adverse.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,sourceRun.ref);
  // New Run: authenticated revision intake, then the selection leaf.
  invocation('intake',intake);call(R.nativeIntakeImplementationRef,intake);let reason=null;
  const limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000};
  const prepared=await owner.prepareNativeSemanticRevisionIntake(basis,intake,limits,r=>reason=r);
  candidate.intake={prepared,refusal:reason,matches:prepared===null?null:owner.nativeSemanticRevisionIntakeMatches(basis,intake,prepared)};
  if(prepared===null)throw new Error('authenticated revision intake refused: '+reason);
  admit(prepared,R.nativeIntakeImplementationRef,current.execution,'advance',current.call.cCallRef,runId);
  basis.graphFunction={name:'component:selection-graph',declarations:{'abg.semantic_revision_selection':lifecycle.declarationRef}};
  call(R.selectionImplementationRef,prepared,prepared,{graphFunctionRef:'component:selection-graph'});
  const subject=owner.projectOwnedJobRevisionSubject(basis,prepared);
  candidate.subject=subject===null?null:{historicalContexts:subject.historicalContexts,parent:coordinate(subject.parent),causes:subject.causes.map(coordinate),
   nativeContext:subject.nativeWorksite.context};
  if(subject===null)throw new Error('authenticated revision subject refused');
  // Selector decision view over the same subject, with the owner's exact sections.
  const leaf=s=>({cCall:s.cCall,result:{...s.result,valueKind:s.result.value.kind},judgment:s.judgment});
  const sections={role:'selection',source:subject.envelope.job.members.map(member=>({memberRef:member.memberRef,path:member.path,text:Buffer.from(member.base64,'base64').toString()})),
   obligations:{activeBindings:p.projectSemanticJobBindings(subject.envelope),remainingGaps:subject.envelope.remainingGaps},predecessors:subject.envelope.assets,
   worksite:{context:subject.nativeWorksite.context,construction:null,commandExecutionLimits:subject.nativeWorksite.commandExecutionLimits},
   evidence:{parent:leaf(subject.parent),causes:subject.causes.map(leaf)},task:{input:{kind:prepared.kind}},response:{}};
  const cold=prefixes.selectValidatedRuntimeEventPrefix(storeOwner.validateHistoricalEvents(await readFile(eventLogPath)));
  const present=(label,at,uses)=>{const reads=[];let view=null,error=null;
   try{view=assembly.renderNativeRevisionSelectionDecisionView(sections,subject.envelope,(coordinateAt,context,relativePath)=>{
    const read=prefixes.resolveHistoricalWorksiteContextBodyAtPrefix(at,coordinateAt,context,relativePath,uses);reads.push({at:coordinateAt,relativePath,read:asJson(read)});
    if(read.kind!=='worksite_context_body')throw new TypeError(`historical context member ${read.code}: ${read.reason}`);return read.bytes;});}
   catch(e){error=String(e?.message??e);}
   candidate.views[label]={reads,view,error};return candidate.views[label];};
  present('held',heldPrefix(),subject.historicalContexts);present('cold',cold,subject.historicalContexts);
  // Strict negatives over the same subject: no declared use, an uncovered
  // binding, another Run and a use naming another Result.
  const use=subject.historicalContexts.find(u=>u.resultRef===causeState.result.resultRef);
  for(const [label,uses] of [['no historical use',[]],['uncovered binding',subject.historicalContexts.map(u=>({...u,coveredBinding:{...u.coveredBinding,bindingDigest:hash('other-binding')}}))],
   ['another Run',subject.historicalContexts.map(u=>({...u,runId:runId}))],['parent use only',subject.historicalContexts.filter(u=>u.resultRef!==causeState.result.resultRef)]])
   candidate.refusals.push({label,...present('negative: '+label,heldPrefix(),uses)});
  // A caller-altered request is not the authenticated acquisition.
  candidate.refusals.push({label:'altered cause coordinate',subject:owner.projectOwnedJobRevisionSubject(basis,{...prepared,causes:[{...prepared.causes[0],resultDigest:hash('other')}]})});
  // The applicable same-Run semantic-stage member view reads its own envelope.
  candidate.stageView=files(adverse.context).map(e=>({relativePath:e.relativePath,read:asJson(prefixes.resolveWorksiteContextBodyAtPrefix(heldPrefix(),adverse.context,e.relativePath,{runId:sourceRun.ref}))}));
  candidate.current={context:subject.nativeWorksite.context};
  const stored=store.readAll();
  candidate.carriers={cause:{original:p.canonicalJson(adverse),stored:p.canonicalJson(stored.find(e=>e.eventId===causeState.result.admissionEventRef).payload.value)}};
  x={holder,causeState,parentState,use,adverse};
 },async()=>{
  assert.equal(candidate.premise.foldDerived,true);assert.equal(candidate.premise.foldNativeIntakeFoldPredicate,true,'actual native assessor fold relation');
  assert.ok(candidate.premise.entries.length>0&&candidate.premise.entries.every(e=>e.encoding==='admitted_member'&&e.member.resultRef===candidate.premise.holder.resultRef),JSON.stringify(candidate.premise.entries));
  assert.deepEqual(candidate.premise.foldContext,candidate.premise.after,'the fold carries the native observation after unchanged');
  assert.equal(candidate.intake.matches,true);
  assert.ok(candidate.subject.historicalContexts.some(u=>u.resultRef===x.causeState.result.resultRef&&u.runId===x.causeState.cCall.runId&&u.cCallRef===x.causeState.cCall.cCallRef),
   'the revision owner derives the cause use from its authenticated subject');
  assert.ok(candidate.subject.historicalContexts.every(u=>u.coveredBinding.bindingId===candidate.premise.after.workspaceBindingIdentity));
  for(const label of ['held','cold']){const row=candidate.views[label];
   assert.equal(row.error,null,`${label}: ${row.error}`);assert.ok(row.reads.length>=candidate.premise.entries.length);
   for(const r of row.reads){assert.equal(r.read.kind,'worksite_context_body',JSON.stringify(r));assert.equal(r.read.holder.eventRef,x.holder.eventId);assert.deepEqual(r.at.route,['context']);}
   const causeView=row.view.evidence.causes[0].result.value.context.entries.filter(e=>e.state==='file');
   for(const e of causeView){assert.equal(e.sourceEncoding,'admitted_member');assert.ok(e.member,'original member coordinate remains beside the view');
    const body=row.view.worksite.byteBodies[Number(e.textView.presentationRef.split('/').at(-1))]??null;
    if(e.textView.presentationRef.startsWith('#/worksite/byteBodies/'))assert.equal(body.digest,e.digest);}
  }
  assert.deepEqual(candidate.views.cold.view,candidate.views.held.view,'held and cold prefixes yield the same presentation');
  assert.deepEqual(candidate.views.cold.reads,candidate.views.held.reads);
  for(const row of candidate.refusals.filter(r=>r.label!=='altered cause coordinate')){assert.notEqual(row.error,null,row.label);assert.equal(row.view,null,row.label);
   assert.ok(row.reads.length>0&&row.reads.at(-1).read.kind==='worksite_context_body_refusal',row.label);}
  assert.equal(candidate.refusals.find(r=>r.label==='altered cause coordinate').subject,null);
  for(const row of candidate.stageView){assert.equal(row.read.kind,'worksite_context_body',JSON.stringify(row));assert.equal(row.read.holder.eventRef,x.holder.eventId);}
  assert.ok(candidate.current.context.entries.filter(e=>e.state==='file').every(e=>e.encoding==='base64'),'current W is the fresh inline intake observation');
  assert.equal(candidate.carriers.cause.stored,candidate.carriers.cause.original,'the admitted adverse fold carrier is unchanged');
  t.diagnostic('B64 owner path: actual Product folds, real store member carriage, real revision intake/subject derivation and real selector decision view; execution-basis/invocation/leaf/prefix-index authentication are the native revision harness premises. No actor, provider or installed Run.');
 });
});
