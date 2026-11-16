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
import { lstatSync, realpathSync, mkdirSync, writeFileSync, openSync, writeSync, ftruncateSync, closeSync } from 'node:fs';
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

// B64 capture law: each actual observation is appended to this case's
// candidate under ABG_REGRESSION_PROOF_ROOT when it is seen, before any check,
// parse, strip or cleanup that depends on it; the file stays one complete JSON
// document after every append and is sealed with the final state. A
// collection, child, parse or assertion failure is primary and is rethrown
// unchanged. A capture failure beside it is secondary and is carried where the
// selected reporter (scripts/node-test-evidence-reporter.mjs: name, message,
// stack, code, failureType and cause, recursively) retains it: appended at the
// end of the primary's cause chain, else to its message, else written to
// stderr. A capture failure alone fails the case. No t.diagnostic is relied on.
function b64ErrorRecord(error,depth=0){
 if(error===null||error===undefined)return null;
 if(typeof error!=='object'&&typeof error!=='function')return {name:'NonErrorThrow',message:String(error),stack:null,code:null,failureType:null,cause:null};
 const text=v=>v===null||v===undefined?null:String(v);let message;
 try{message=String(error.message??error);}catch{message='[unprintable]';}
 return {name:text(error.name)??'Error',message,stack:typeof error.stack==='string'?error.stack:null,code:text(error.code),failureType:text(error.failureType),
  ...(typeof error.operator==='string'?{operator:error.operator}:{}),cause:depth>=16?null:b64ErrorRecord(error.cause,depth+1)};
}
function b64Json(value){
 const ancestors=[];
 return JSON.stringify(value,function(_key,v){
  if(typeof v==='bigint'||typeof v==='symbol')return String(v);
  if(typeof v==='function')return `[function ${v.name||'anonymous'}]`;
  if(v instanceof Error)return b64ErrorRecord(v);
  if(Buffer.isBuffer(v))return {kind:'buffer_base64',base64:v.toString('base64')};
  if(typeof v!=='object'||v===null)return v;
  while(ancestors.length>0&&ancestors.at(-1)!==this)ancestors.pop();
  if(ancestors.includes(v))return '[circular]';
  ancestors.push(v);return v;
 })??'null';
}
class B64CaptureFailure extends Error{constructor(message,cause){super(message,{cause});this.name='B64CaptureFailure';this.code='B64_CAPTURE_FAILURE';}}
function b64CarrySecondary(primary,secondary,what='capture'){
 let detail;try{detail=String(secondary?.stack??secondary);}catch{detail='[unprintable secondary failure]';}
 const carried=new Error(`B64 ${what} failure after the primary failure: ${detail}`,{cause:secondary});
 carried.name='B64SecondaryFailure';carried.code='B64_SECONDARY_FAILURE';
 let link=primary;
 for(let depth=0;depth<32&&link!==null&&(typeof link==='object'||typeof link==='function');depth++){
  let next;try{next=link.cause;}catch{break;}
  if(next===undefined||next===null){
   try{Object.defineProperty(link,'cause',{value:carried,configurable:true,writable:true,enumerable:false});}catch{}
   if(link.cause===carried)return 'primary_cause_chain_end';
   break;
  }
  link=next;
 }
 try{if(primary!==null&&typeof primary==='object'){const suffix=` [${carried.message}]`;primary.message=String(primary.message)+suffix;if(String(primary.message).endsWith(suffix))return 'primary_message';}}catch{}
 try{process.stderr.write(carried.message+'\n');return 'stderr';}catch{return 'not_carried';}
}
function b64CandidateWriter(file,header){
 const dir=process.env.ABG_REGRESSION_PROOF_ROOT;if(dir===undefined||dir==='')return null;
 mkdirSync(dir,{recursive:true});const fd=openSync(join(dir,file),'w');let position=0,count=0;
 const write=(text,at)=>{const bytes=Buffer.from(text,'utf8');let offset=0;while(offset<bytes.length)offset+=writeSync(fd,bytes,offset,bytes.length-offset,at+offset);return at+bytes.length;};
 const seal=state=>{const end=write(`\n],"state":${b64Json(state)}}\n`,position);ftruncateSync(fd,end);};
 position=write(b64Json(header).slice(0,-1)+',"observations":[\n',0);seal({status:'running',observations:0});
 return {append(entry){position=write((count===0?'':',\n')+b64Json(entry),position);count++;seal({status:'running',observations:count});},seal,close(){closeSync(fd);}};
}
async function b64CapturedRun(file,title,body){
 const header={kind:'b64_historical_revision_candidate',test:title,file:'build_tenants/abiogenesis/typescript/test_env/tests/t287-native-semantic-job.test.mjs',
  startedAt:new Date().toISOString(),pid:process.pid,nodeVersion:process.version};
 const capture=(action,what)=>{try{return action();}catch(error){throw new B64CaptureFailure(`B64 candidate ${what} failed: ${String(error?.message??error)}`,error);}};
 const writer=capture(()=>b64CandidateWriter(file,header),'open');let count=0;
 const seen=(label,value)=>{const entry={ordinal:count++,label,observedAt:new Date().toISOString(),value:value===undefined?null:value};
  if(writer!==null)capture(()=>writer.append(entry),'append');return value;};
 // A known child, parse or owner failure stays primary over a later capture failure.
 const preserving=(primary,label,value)=>{try{return seen(label,value);}catch(captureError){if(primary===null||primary===undefined)throw captureError;b64CarrySecondary(primary,captureError);throw primary;}};
 let failed=false,primary;
 try{await body({seen,preserving});}catch(error){failed=true;primary=error;}
 try{if(writer!==null)try{writer.seal(failed?{status:'thrown',observations:count,primary:b64ErrorRecord(primary)}:{status:'body_returned',observations:count});}finally{writer.close();}}
 catch(error){if(!failed)throw new B64CaptureFailure(`B64 candidate seal failed: ${String(error?.message??error)}`,error);if(!(primary instanceof B64CaptureFailure))b64CarrySecondary(primary,error);}
 if(failed)throw primary;
}
const B64_ACTOR_KEYS=['ABG_TS_CLAUDE_COMMAND','ABI5_SCRIPTED_ACTOR_LOG','ABI5_SCRIPTED_ACTOR_PHASE'];
const b64ActorEnvironment=environment=>({keyCount:Object.keys(environment).length,otherKeysOmitted:true,
 selected:Object.fromEntries(B64_ACTOR_KEYS.map(key=>[key,environment[key]??null]))});
const b64Ref=(kind,name)=>`${kind}://b64-public-composition.example/${name}@5`;
const B64_REVISION=name=>`graph-function://odd-glc/native-semantic-revision/${name}@5`;
const B64_INTAKE_PROGRAM='program://odd-glc/native-semantic-revision/intake@5';

// Deterministic CLI stand-in behind ABG_TS_CLAUDE_COMMAND: a controlled data
// producer only. It reads only its delivered prompt, response schema and the
// worksite files the prompt names; it never writes events, bases, covers,
// uses or acceptance. The author writes the declared candidate path. The
// assessor rereads the delivered source and candidate, checks their delivered
// digests and applies one explicit criterion (the source's stated constraint
// must survive verbatim in a candidate statement), answering the declared
// assessment schema; criteria it does not check are indeterminate. The
// selector parses the delivered decision prompt and returns its exact eligible
// parent/cause coordinates with the declared stage of the presented adverse
// cause. Every dispatch is logged outside the worksite.
const B64_ACTOR=`
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_SCRIPTED_ACTOR_LOG;
const digest=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const record=row=>appendFileSync(log,JSON.stringify({pid:process.pid,promptBytesDigest:digest(Buffer.from(prompt,'utf8')),
 argv:args.map((a,i)=>at>=0&&i===at+1?'[json-schema]':a),...row})+'\\n');
const fail=m=>{try{record({role:'refused',reason:m});}catch{}process.stderr.write('b64 scripted actor: '+m+'\\n');process.exit(1);};
const valueAt=s=>{const open=prompt[s],close=open==='{'?'}':open==='['?']':null;if(close===null)return undefined;
 let depth=0;for(let k=s;k<prompt.length;k++){const ch=prompt[k];if(ch===open)depth++;else if(ch===close&&--depth===0){const raw=prompt.slice(s,k+1);
  try{return JSON.parse(raw);}catch{try{return JSON.parse(JSON.parse('"'+raw+'"'));}catch{return undefined;}}}}return undefined;};
const after=label=>{for(let i=prompt.indexOf(label);i>=0;i=prompt.indexOf(label,i+1)){const value=valueAt(i+label.length);if(value!==undefined)return value;}return undefined;};
const section=name=>{const head='## '+name+'\\n',i=prompt.indexOf(head);if(i<0)return undefined;const start=i+head.length,end=prompt.indexOf('\\n\\n## ',start);
 try{return JSON.parse(prompt.slice(start,end<0?prompt.length:end));}catch{return undefined;}};
const schema=at>=0?JSON.parse(args[at+1]):{},props=schema.properties??{};
const emit=output=>{console.log(JSON.stringify({type:'system',subtype:'init'}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));};
const members=after('Source identities and roles: ');
const firstMember=Array.isArray(members)?members.find(m=>m&&typeof m.memberRef==='string'&&typeof m.path==='string'):undefined;
let quote=null;if(firstMember!==undefined)try{const line=readFileSync(firstMember.path,'utf8').split('\\n').map(l=>l.trim()).find(l=>l.length>0);if(line!==undefined)quote={memberRef:firstMember.memberRef,quote:line};}catch{}
const pick=(s,name)=>{
 if(s===undefined||s===null||typeof s!=='object')return null;
 if('const' in s)return s.const;
 if(Array.isArray(s.enum))return s.enum[0];
 if(Array.isArray(s.anyOf))return pick(s.anyOf.find(x=>x&&x.type==='null')??s.anyOf[0],name);
 const type=Array.isArray(s.type)?(s.type.includes('null')?'null':s.type[0]):s.type;
 if(type==='null')return null;
 if(type==='object'){const o={};for(const key of s.required??Object.keys(s.properties??{}))o[key]=key==='sourceQuotes'?(quote===null?[]:[quote]):pick((s.properties??{})[key],key);return o;}
 if(type==='array')return (s.minItems??0)>0?[pick(s.items,name)]:[];
 if(type==='string')return 'Deterministic stand-in '+name+'.';
 if(type==='integer'||type==='number')return s.minimum??0;
 if(type==='boolean')return false;
 return null;};
if('summary' in props&&'gaps' in props){
 const m=/Write only ([^ ,]+), as one JSON candidate/.exec(prompt),asset=after('any accumulated envelope: ');
 if(m===null||asset===undefined)fail('the delivered author task names no candidate path and schema');
 if(quote===null)fail('the delivered author task names no readable source member');
 const candidate=pick(asset,'asset');writeFileSync(m[1],JSON.stringify(candidate)+'\\n');
 record({role:'author',path:m[1],statementTexts:(candidate?.asset?.statements??[]).map(s=>s.text)});
 emit({...pick(schema,'report'),summary:'Deterministic stand-in wrote the declared candidate path.',gaps:[]});
}else if(prompt.includes('Exact assessment basis: ')){
 const declared=at>=0?schema:after('Exact declared response JSON Schema: '),basis=after('Exact assessment basis: '),rubric=after('Rubric: ');
 if(declared===undefined||basis===undefined||!Array.isArray(rubric))fail('the delivered assessment task names no basis, schema or rubric');
 const item=declared?.properties?.criteria?.items,keys=item?.required??[];
 if(declared?.properties?.kind?.const!=='semantic_stage_assessment_candidate'||!Array.isArray(item?.properties?.disposition?.enum)||!item.properties.disposition.enum.includes('falsified'))
  fail('the delivered response schema is not the declared assessment schema');
 const criterion=rubric.find(c=>typeof c?.criterionRef==='string'&&c.criterionRef.endsWith('/source-faithfulness@5'));
 if(criterion===undefined)fail('the delivered rubric declares no source-faithfulness criterion');
 const read=row=>{const bytes=readFileSync(row.path);return {path:row.path,deliveredDigest:row.digest,observedDigest:digest(bytes),text:bytes.toString('utf8')};};
 const sources=(Array.isArray(basis.sources)?basis.sources:[]).map(read),candidateFile=read(basis.candidate);
 if(sources.length===0||sources.some(s=>s.observedDigest!==s.deliveredDigest)||candidateFile.observedDigest!==candidateFile.deliveredDigest)
  fail('the read source/candidate bytes differ from the delivered assessment basis');
 const constraintSource=sources.find(s=>s.text.split('\\n').some(l=>l.startsWith('Constraint: ')));
 const constraint=constraintSource===undefined?undefined:constraintSource.text.split('\\n').find(l=>l.startsWith('Constraint: '));
 const constraintMember=Array.isArray(members)&&constraintSource!==undefined?members.find(m=>m&&m.path===constraintSource.path):undefined;
 if(constraint===undefined||constraintMember===undefined)fail('the delivered source states no explicit constraint');
 let parsed;try{parsed=JSON.parse(candidateFile.text);}catch{fail('the delivered candidate is not JSON');}
 const required=constraint.slice('Constraint: '.length),texts=(parsed?.asset?.statements??[]).map(s=>String(s?.text??''));
 const kept=texts.some(text=>text.includes(required));
 const criteria=rubric.map(c=>c.criterionRef===criterion.criterionRef
  ?{criterionRef:c.criterionRef,disposition:kept?'satisfied':'falsified',
    explanation:kept?'A candidate statement restates the explicit source constraint.':'The source states "'+constraint+'"; no candidate statement restates it, so the stated source constraint is lost.',
    sourceQuotes:[{memberRef:constraintMember.memberRef,quote:constraint}],statementRefs:[]}
  :{criterionRef:c.criterionRef,disposition:'indeterminate',explanation:'Not assessed by this deterministic stand-in; it checks only the explicit source-faithfulness constraint.',sourceQuotes:[],statementRefs:[]});
 if(criteria.some(c=>keys.length!==Object.keys(c).length||!keys.every(k=>k in c)))fail('the stand-in criteria do not match the delivered closed schema');
 const output={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria,pressure:[]};
 const top=declared.required??[];if(top.length!==Object.keys(output).length||!top.every(k=>k in output))fail('the stand-in response does not match the delivered closed schema');
 record({role:'assess',criterion:criterion.criterionRef,constraint,kept,
  sources:sources.map(s=>({path:s.path,deliveredDigest:s.deliveredDigest,observedDigest:s.observedDigest})),
  candidate:{path:candidateFile.path,deliveredDigest:candidateFile.deliveredDigest,observedDigest:candidateFile.observedDigest,statementTexts:texts},
  dispositions:criteria.map(c=>[c.criterionRef,c.disposition])});
 emit(output);
}else if(section('task')!==undefined&&(props.kind?.const==='semantic_revision_selection'||section('response')?.properties?.kind?.const==='semantic_revision_selection')){
 const task=section('task'),evidence=section('evidence'),predecessors=section('predecessors'),obligations=section('obligations'),input=task?.input;
 if(!input||!Array.isArray(task.stages)||!Array.isArray(input.causes)||input.causes.length!==1||!Array.isArray(evidence?.causes)||evidence.causes.length!==1)
  fail('the delivered selection names no single admitted cause');
 const presented=evidence.causes[0],cause=input.causes[0];
 if(presented?.cCall?.cCallRef!==cause.cCallRef||presented?.result?.resultRef!==cause.resultRef||presented?.result?.resultDigest!==cause.resultDigest||
  evidence.parent?.cCall?.cCallRef!==input.parent?.cCallRef||evidence.parent?.result?.resultRef!==input.parent?.resultRef)fail('the presented counterevidence is not the eligible parent/cause');
 const last=presented.result?.value?.assets?.at(-1);
 const material=typeof last?.stageRef==='string'?last:typeof last?.presentationRef==='string'&&last.presentationRef.startsWith('#/predecessors/materialAssets/')
  ?predecessors?.materialAssets?.[Number(last.presentationRef.split('/').at(-1))]:undefined;
 const eligible=task.stages.map(s=>s.declarationRef),stageRef=material?.stageRef;
 if(typeof stageRef!=='string'||!eligible.includes(stageRef))fail('the adverse cause names no eligible declared stage');
 if(!material.assessment||material.assessment.disposition==='satisfied')fail('the presented cause is not an adverse assessment');
 const active=[...new Set((obligations?.activeBindings??[]).map(v=>v?.binding?.obligationRef).filter(r=>typeof r==='string'))];
 const output={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:input.parent,causes:input.causes,mode:'stage_revision',selectedStageRef:stageRef,
  selectedObligationRefs:active,selectedTargetRefs:[],reasonRef:'reason://b64-public-composition/adverse-cause-stage@5',...(input.nativePhase===undefined?{}:{nativePhase:input.nativePhase})};
 record({role:'select',parent:input.parent,causes:input.causes,eligibleStages:eligible,selectedStageRef:stageRef,causeDisposition:material.assessment.disposition,output});
 emit(output);
}else fail('the delivered prompt is no declared author, assessor or selector task');
`;

// Canonical role declarations for every F_P leaf of every Program of the
// lifecycle publication, after the read-only precedent cd109c4e
// integration-01/s06-revision-preparation-01/declarations.mjs:18-59 (not a
// copied runtime authority). Native constructor, assessor and command-executor
// leaves take their declared default-library rows; revision-stage and intake
// selector leaves take that posture's template with their own policy and
// context selectors. That precedent's external constructNativeRevisionEnvironmentRoles
// owner has no counterpart in this tenant and is not reproduced.
function b64RunEnvironment({gtl,product,publication,cores}){
 const template=gtl.defaultLibraryRunEnvironment(),all=[...publication.graphFunctions,...cores.flatMap(p=>p.graphFunctions)];
 const exactGraph=ref=>{const rows=all.filter(g=>g.name===ref);if(rows.length!==1)throw new TypeError('one declared GraphFunction required: '+ref);return rows[0];};
 const lifecycle=publication.semanticJobLifecycle,roles=new Map();
 for(const program of publication.programs)for(const ref of program.callableMembership){const graph=exactGraph(ref);
  for(const node of graph.template.nodes)for(const leaf of gtl.cLeafTerms(node.term).filter(l=>l.fibre==='F_P')){
   const key=graph.name+'\0'+leaf.programLocusRef;if(roles.has(key))continue;
   const role=gtl.nativeContextLeafFamily(graph,leaf);
   if(!['author','assessor','constructor','command_executor'].includes(role))throw new TypeError('undeclared native family at '+key);
   const existing=template.roles.filter(r=>r.graphFunctionRef===graph.name&&r.programLocusRef===leaf.programLocusRef&&r.role===role);
   if(existing.length===1){roles.set(key,structuredClone(existing[0]));continue;}
   if(role==='constructor'||role==='command_executor')throw new TypeError('native role lacks its declared default-library row: '+key);
   const posture=template.roles.find(r=>r.role===(role==='author'?'constructor':'assessor'));
   const stage=lifecycle.stages.find(s=>s.declarationRef===graph.declarations['abg.semantic_revision_stage']);
   const selection=graph.declarations['abg.semantic_revision_selection']!==undefined;
   if(posture===undefined||(stage===undefined&&!selection))throw new TypeError('only declared revision stage or selection roles: '+key);
   const text=role==='author'
    ?'Derive the declared affected semantic asset from complete source and admitted counterevidence. Preserve source modalities and genuine uncertainty. Return the canonical candidate JSON without tools or file writes.'
    :'Independently evaluate the actual declared selection or current candidate using complete source and admitted evidence. Preserve actual adverse history, source modalities and genuine gaps. Return the canonical JSON without tools or file writes.';
   const selectors=selection?['full_source','active_binding_semantics']:['full_source','declared_predecessor_semantics','active_binding_semantics',
    ...(role==='assessor'?['current_candidate']:[]),...(stage.bodyCapabilities.includes('worksite_design')?['current_worksite']:[]),
    ...(stage.bodyCapabilities.includes('application_assessment')?['admitted_execution_evidence',...(role==='assessor'?['assessor_evaluation_data']:[])]:[])];
   roles.set(key,{...structuredClone(posture),graphFunctionRef:graph.name,programLocusRef:leaf.programLocusRef,role,
    policy:{policyRef:graph.name+'/'+role+'/b64-policy@5',text,digest:product.sha256Bytes(Buffer.from(text,'utf8'))},
    contextPolicy:{policyRef:graph.name+'/'+role+'/b64-context@5',selectors}});
  }}
 return gtl.constructRunEnvironmentDeclaration({...structuredClone(template),declarationRef:b64Ref('environment','lifecycle'),roles:[...roles.values()]});
}

// The installed Public setup of uat/public-setup.mjs (populateInstalledSetup),
// composed locally for this one case-local consumer: workspace.create, two
// product.verify, product.resolve, two product.install (the first acquires the
// new event resource), workspace.bind, Catalog admit, one Catalog view and one
// Program conformance per started Program, then one close. Every call is the
// exported installed Public operation through publicCaller; no setup metadata
// is synthesized and root-installed-environment is not used.
async function b64PublicSetup({seen,setup,runtime,native,root,packagePath}){
 const {product,abg,gtl,validator}=runtime,hash=product.sha256Canonical,version='5.0.0',{BoundaryFailure,requireKind}=setup;
 const decl=await import('../fixtures/native-semantic-revision/declarations.mjs');
 const {prepareRegisteredSelectionProduct}=await import('../support/registered-graph-selection.mjs');
 const record=async(path,value)=>{seen('setup record '+path,value);};
 const caller=setup.publicCaller({root,runtime,native,command:null,record,
  config:{runId:'b64-public-composition',worksiteRoot:join(root,'sandbox/worksite'),recursionBound:1000,nodePath:process.execPath}});
 const {state,actor,actorRef,authorize,invoke}=caller,worksiteRoot=caller.config.worksiteRoot;
 const created=await invoke('workspace-create',await authorize(product.WORKSPACE_OPERATION_SOURCE_DECLARATIONS.create.clean,
  {targetRoot:worksiteRoot,createPolicy:'clean',scaffoldPolicy:'none'},
  {kind:'workspace_resource_assertion',schemaVersion:version,targetRoot:worksiteRoot,targetRootDigest:hash({kind:'workspace_target',targetRoot:worksiteRoot})},{actor}));
 const workspaceManifest=seen('workspace manifest',JSON.parse(await readFile(created.receipt.resources.manifest.locator,'utf8')));
 // 1. One declared native consumer: the full lifecycle (with its Evidence stage)
 // and the canonical intake/selector/request-sealing revision Programs.
 const cores=setup.corePublications(gtl,native.verified),semanticPublication=cores.find(p=>p.moduleRef===gtl.SEMANTIC_STAGE_IDS.moduleRef);
 const ids={productId:b64Ref('product','consumer'),moduleRef:b64Ref('module','consumer'),descriptorRef:b64Ref('descriptor','consumer'),
  contributionManifestRef:b64Ref('contribution-manifest','consumer'),lifecycleDeclarationRef:b64Ref('lifecycle','generic'),graphFunctionRef:b64Ref('graph-function','root'),
  graphRef:b64Ref('graph','root'),closureContractRef:b64Ref('contract','root-closure'),programRef:b64Ref('program','lifecycle'),startRef:b64Ref('start','lifecycle')};
 // 3. Declared roles from the actual leaves of every Program of that publication.
 const unconfigured=decl.constructFreshNativeLifecyclePublication({gtl,product,ids,semanticPublication});
 const runEnvironment=seen('declared run environment',b64RunEnvironment({gtl,product,publication:unconfigured,cores}));
 const prepared=await prepareRegisteredSelectionProduct({scratch:join(root,'consumer'),product,gtl,abiPublication:semanticPublication,abiPackageArchivePath:packagePath,
  fixtureFiles:[],schemaAssets:[],declarationFactory:g=>decl.constructFreshNativeLifecyclePublication({gtl:g,product,ids,semanticPublication,runEnvironment})});
 const consumerManifest=JSON.parse(await readFile(join(prepared.sourceRoot,'product-toolchain-manifest.json'),'utf8'));
 seen('prepared consumer',{artifactPath:prepared.artifactPath,basis:prepared.basis,ids:prepared.ids,manifest:consumerManifest});
 const consumer=await setup.verifyArtifact(runtime,{artifactPath:prepared.artifactPath,manifest:consumerManifest,expectedArtifactDigest:prepared.basis.artifactDigest},record,'consumer');
 const actualCore=cores.map(value=>[value.moduleRef,product.modulePublicationSemanticDigest(value)]).sort();
 const manifestCore=native.verified.contributionManifest.publicationBindings.map(value=>[value.moduleRef,value.publicationDigest]).sort();
 if(hash(actualCore)!==hash(manifestCore))throw new BoundaryFailure('b64-core-publication-identity',{actualCore,manifestCore});
 // 2. Explicit installed Public verify, resolve and install.
 const natives=[native,consumer],verificationRefs=[],packedArtifacts=[],verificationOutputs=[];
 for(let i=0;i<natives.length;i++){
  const item=natives[i],v=item.verified;
  const packed={kind:'product_verification_artifact_resource',schemaVersion:version,artifactPath:item.request.artifactPath,
   artifact:{ref:v.artifactRef,digest:v.artifactDigest},productContent:{ref:'product-content://abi5-tests/'+v.productContentDigest.slice(7),digest:v.productContentDigest},
   descriptor:item.verification.coordinates.descriptor,contributionManifest:{ref:v.contributionManifestRef,digest:v.contributionManifestDigest},
   manifestDigest:v.manifestDigest,productId:v.productId,packageName:v.packageName,packageVersion:v.packageVersion};
  const checked=await invoke('product-verify-'+i,await authorize(product.PRODUCT_VERIFICATION_SOURCE_DECLARATIONS.verify,
   {targetKind:'packed_artifact',artifact:packed.artifact,productContent:packed.productContent,descriptor:packed.descriptor,
    contributionManifest:packed.contributionManifest,declaredDependencies:v.declaredDependencies,
    compatibilityInputs:v.compatibilityRefs.map(compatibilityRef=>({compatibilityRef,subjectRef:packed.productContent.ref}))},
   {kind:'product_verification_resources',schemaVersion:version,targetKind:'packed_artifact',packedArtifact:packed,verifiedArtifact:v}));
  verificationRefs.push({invocation:{ref:checked.call.invocation.invocationRef,digest:checked.call.invocation.invocationDigest},
   outcome:checked.receipt.ownerOutput.value.verifiedArtifact});packedArtifacts.push(packed);verificationOutputs.push(checked.receipt.ownerOutput);
 }
 const resolvedLock=requireKind(product.ProductEnvironmentPort.resolve({kind:'product_resolution_packet',schemaVersion:version,
  memberKey:'resolve',verifiedArtifacts:natives.map(item=>item.verified)}),'resolved_product_lock','b64-lock-construction');
 state.resolvedLock=resolvedLock;
 const lock={ref:resolvedLock.lockId,digest:resolvedLock.lockDigest};
 const resolved=await invoke('product-resolve',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.resolve,
  {requirements:natives.map(({verified:v})=>({productId:v.productId,packageVersion:v.packageVersion,requiredContractRefs:[],requiredCapabilityRefs:[]})),verifiedCandidates:verificationRefs},
  {kind:'product_resolution_resource_assertion',schemaVersion:version,
   verifiedPreimages:natives.map((item,i)=>({verification:verificationRefs[i],verifiedArtifact:item.verified,verificationOutput:verificationOutputs[i]})),
   nativeContractClosure:{selectorDispositions:[],occurrences:[],nativeBindings:[]}},{verification_references:verificationRefs}));
 if(hash(resolved.receipt.ownerOutput.value.resolvedLock)!==hash(lock))throw new BoundaryFailure('b64-resolved-lock-identity',resolved.receipt);
 const eventLogPath=join(root,'resources/events/runtime.events.jsonl');await mkdir(dirname(eventLogPath),{recursive:true});
 const installations=[];let acquired=false;
 try{
  for(let i=0;i<natives.length;i++){
   const item=natives[i],packed=packedArtifacts[i],eventResource=i===0?caller.acquire({kind:'new_abg_event_resource',schemaVersion:version,eventLogPath,
    locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(eventLogPath)})}):state.selection;
   acquired=true;
   const result=await invoke('product-install-'+i,await authorize(product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
    {verifiedArtifact:item.verification.coordinates.verifiedArtifact,descriptor:packed.descriptor,contributionManifest:packed.contributionManifest,
     resolvedLock:lock,targetRoot:join(root,'sandbox/installed',i===0?'abg':'b64-consumer'),installPolicy:'clean'},
    {kind:'product_install_resource_assertion',schemaVersion:version,eventResource,packedArtifact:packed,verifiedArtifact:item.verified,resolvedLock},
    {dependency_lock:lock,verification_references:[verificationRefs[i]],actor}));
   const artifactTruth=abg.projectOwnedPrefixArtifactTruth(caller.prefix());
   const admitted=seen('installed '+i,abg.projectAdmittedProductInstallByInvocationRef(artifactTruth,result.call.invocation.invocationRef));
   if(!admitted?.install)throw new BoundaryFailure('b64-installed-event-projection',admitted);
   const installerManifest=seen('installer manifest '+i,result.receipt.resources.installerManifest??null);
   if(installerManifest?.ref!==artifactTruth.projectionRef||installerManifest?.digest!==artifactTruth.projectionDigest)throw new BoundaryFailure('b64-installer-manifest-projection',installerManifest);
   installations.push(admitted.install);
  }
  caller.installedRoot=installations[0].installedRoot;
  const consumerPublication=await prepared.loadInstalledPublication({installedRoot:installations[1].installedRoot,gtl});
  const consumerDigest=product.modulePublicationSemanticDigest(consumerPublication);
  const owners=installations.filter(install=>install.productId===consumerPublication.owningProductId&&install.artifactDigest===consumerPublication.artifactDigest&&
   install.productContentDigest===consumerPublication.productContentDigest&&install.manifestDigest===consumerPublication.productManifestDigest&&
   install.contributionManifest.publicationBindings.filter(row=>row.moduleRef===consumerPublication.moduleRef&&row.publicationDigest===consumerDigest).length===1);
  seen('installed consumer publication',{publication:consumerPublication,publicationDigest:consumerDigest,owners:owners.map(owner=>owner.installId)});
  if(owners.length!==1)throw new BoundaryFailure('b64-program-owner',{moduleRef:consumerPublication.moduleRef,owners:owners.map(owner=>owner.installId)});
  const publications=cores.concat(consumerPublication);
  // Workspace binding: productRoot is the started Programs' owner root.
  const authorityManifest={workspaceId:workspaceManifest.workspaceRef,canonicalRoot:workspaceManifest.canonicalRoot,authorityMode:'trusted_developer',authorizedActorRef:actorRef};
  const workspaceAuthority=product.constructWorkspaceAuthorityBasis({...authorityManifest,
   authorityManifestRef:'authority://abi5-tests/b64-public-composition/workspace',authorityManifestDigest:hash(authorityManifest)});
  caller.workspaceAuthority=workspaceAuthority;
  const roots={toolchainRoot:join(root,'sandbox/installed','abg'),productRoot:owners[0].installedRoot,eventLogRoot:dirname(eventLogPath),
   runtimeStateRoot:join(root,'resources/runtime'),projectionRoot:join(root,'resources/projections'),archiveRoot:join(root,'resources/archives')};
  for(const path of [roots.runtimeStateRoot,roots.projectionRoot,roots.archiveRoot])await mkdir(path,{recursive:true});
  const fields={toolchain:'toolchainRoot',product:'productRoot',event_log:'eventLogRoot',runtime_state:'runtimeStateRoot',projection:'projectionRoot',archive:'archiveRoot'};
  const bound=await invoke('workspace-bind',await authorize(product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
   {workspaceAuthority:{ref:workspaceAuthority.authorityBasisId,digest:workspaceAuthority.authorityBasisDigest},installedSet:installations.map(product.productInstallCoordinate),
    resolvedLock:lock,declaredRoots:Object.entries(fields).map(([rootKind,field])=>({rootKind,path:roots[field]}))},
   {kind:'product_workspace_binding_resource_assertion',schemaVersion:version,eventResource:state.selection,workspaceAuthority,workspaceManifest,
    admittedInstalls:installations,resolvedLock,declaredRoots:roots},{product_set:installations.map(product.productInstallCoordinate),dependency_lock:lock,actor}));
  state.binding=bound.receipt.ownerOutput.value.binding;caller.refresh();
  const published=await invoke('catalog-admit',await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
   {workspaceBinding:state.binding,descriptors:packedArtifacts.map(item=>item.descriptor),contributionManifests:packedArtifacts.map(item=>item.contributionManifest),resolvedLock:lock},
   {kind:'catalog_admission_resource_assertion',schemaVersion:version,eventResource:state.selection,workspaceBinding:state.environment.workspaceBinding,
    resolvedLock,verifiedProducts:natives.map(item=>item.verified),admittedInstalls:state.environment.productInstalls,publications},
   {...caller.boundSlots(),dependency_lock:lock}));
  caller.refresh();
  const installedProducts=state.environment.productInstalls.map(install=>abg.projectAdmittedProductInstallByAdmissionEventRef(state.environment.artifactTruth,install.admissionEventRef).candidate);
  state.catalog=requireKind(product.CatalogOperationPort.admit({kind:'catalog_admit_packet',schemaVersion:version,memberKey:'admit',
   readinessBasis:{workspaceBinding:state.environment.workspaceBindingCandidate,resolvedLock,verifiedProducts:natives.map(item=>item.verified),installedProducts,publications}}),
   'graph_function_catalog','b64-catalog-projection');
  if(published.receipt.ownerOutput.value.catalog.digest!==state.catalog.basisDigest)throw new BoundaryFailure('b64-catalog-public-projection',published.receipt);
  const boundPublications=state.catalog.boundPublications.filter(value=>value.moduleRef===consumerPublication.moduleRef&&
   value.owningProductId===consumerPublication.owningProductId&&value.artifactDigest===consumerPublication.artifactDigest&&product.modulePublicationSemanticDigest(value)===consumerDigest);
  if(boundPublications.length!==1)throw new BoundaryFailure('b64-catalog-publication',{moduleRef:consumerPublication.moduleRef});
  const catalogPublication=boundPublications[0];
  const programs={lifecycle:catalogPublication.programs.find(p=>p.programRef===prepared.ids.programRef),intake:catalogPublication.programs.find(p=>p.programRef===B64_INTAKE_PROGRAM)};
  const environments={},views={};
  const conformanceLaw={ref:'law://abiogenesis/validator/gtl-program@5',digest:hash({ref:'law://abiogenesis/validator/gtl-program@5'})};
  for(const [name,program] of Object.entries(programs)){
   if(program===undefined)throw new BoundaryFailure('b64-catalog-program',{name});
   environments[name]=catalogPublication.runEnvironments?.find(value=>value.declarationRef===program.policies[gtl.RUN_ENVIRONMENT_POLICY])??null;
   const allowlist=[...program.callableMembership].sort();
   await invoke('catalog-view-'+name,await authorize(product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    {catalog:published.receipt.ownerOutput.value.catalog,allowlist},{kind:'catalog_view_resource_assertion',schemaVersion:version,catalog:state.catalog},
    {...caller.boundSlots(),dependency_lock:lock}));
   views[name]=requireKind(product.narrowGraphFunctionCatalog(state.catalog,allowlist),'graph_function_catalog_view','b64-catalog-view-'+name);
   const conformance=await invoke('program-conformance-'+name,await authorize(validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    {program:{ref:program.programRef,digest:hash(program)},conformanceLaw,
     inventoryBasis:{kind:'declared_inventory',inventory:state.catalog.boundPublications.map(value=>({ref:value.moduleRef,digest:hash(value)})).sort((a,b)=>a.ref.localeCompare(b.ref))}},
    {kind:'conformance_evaluation_resource_assertion',schemaVersion:version,
     packet:{kind:'conformance_evaluate_packet',schemaVersion:version,memberKey:'gtl_program',publication:catalogPublication,program},
     conformanceLaw,declaredInventory:state.catalog.boundPublications,declarationCatalog:{catalog:state.catalog,catalogView:views[name]}},
    {...caller.boundSlots(),dependency_lock:lock}));
   if(conformance.receipt.ownerOutput.value.disposition!=='passed')throw new BoundaryFailure('b64-program-conformance-'+name,conformance.receipt);
  }
  // The declared stdo-frames inventory of the core install supplies every
  // Program environment's one dependency.
  const inventoryPath=await fsPromises.realpath(join(installations[0].installedRoot,gtl.DEFAULT_LIBRARY_CONTEXT_INVENTORY.path)),inventoryDigest=product.sha256Bytes(await readFile(inventoryPath));
  seen('run environments and inventory',{environments,inventoryPath,inventoryDigest});
  for(const [name,declaration] of Object.entries(environments))
   if(declaration===null||declaration.dependencies.length!==1||declaration.dependencies[0].recordDigest!==inventoryDigest)throw new BoundaryFailure('b64-run-environment-'+name,{declaration});
  const resourcesFor=declaration=>async({authority,program,workspaceBinding,product:owner})=>{
   const path=join(workspaceBinding.roots.archiveRoot,'b64-run-environment-support');await mkdir(path,{recursive:true});
   const coordinates={dependencies:declaration.dependencies.map(d=>({dependencyRef:d.dependencyRef,root:dirname(inventoryPath),recordPath:inventoryPath})),
    pythonPath:null,temporaryRoot:await fsPromises.realpath(path)};
   return owner.constructRunEnvironmentResources({kind:'run_environment_resources',schemaVersion:version,...coordinates,
    permission:{authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,programRef:program.programRef,
     environmentRef:declaration.declarationRef,environmentDigest:owner.sha256Canonical(declaration),operations:['read_context'],...coordinates}});};
  seen('setup close',caller.close());
  return {caller,prepared,consumerPublication,catalogPublication,installations,programs,environments,views,workspaceAuthority,resourcesFor};
 }catch(primary){
  // A failed setup closes its own acquisition at the held durable prefix, or
  // abandons it; the setup failure stays primary.
  if(acquired&&state.resource!==null){
   try{const receipt=caller.close(abg.selectHeldEventStoreDurablePrefix(state.resource.store));try{seen('setup failure close',receipt);}catch{}}
   catch(closeError){try{abg.abandonAbgEventResource(state.resource);}catch{}state.resource=null;state.selection=null;b64CarrySecondary(primary,closeError,'setup close');}
  }
  throw primary;
 }
}

// The installed Public CLI transport of runInstalledCliRequest
// (support/registered-graph-selection.mjs): the same request, `--jsonl` argv,
// cwd and environment, captured completely (request, exit, signal, stdout,
// stderr, parse) before its checks. Any process exit code is an observation;
// no process exit at all (spawn, signal or buffer failure) is a genuine child
// failure, and it or a parse failure stays primary over a later capture failure.
async function b64InstalledCli({seen,preserving},label,{scratch,installedRoot,acquisition,call,environment}){
 const {execFile}=await import('node:child_process'),{promisify}=await import('node:util');
 const requestPath=join(scratch,label.replace(/[^a-z0-9-]+/giu,'-')+'-request.jsonl'),cliPath=join(installedRoot,'build/code/src/public/cli.js');
 const request={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition,invocation:call};
 seen(label+' CLI request',{argv:[process.execPath,cliPath,'--jsonl',requestPath],cwd:scratch,environment:b64ActorEnvironment(environment),request});
 await writeFile(requestPath,JSON.stringify(request)+'\n');
 const started=performance.now();let child,thrown=null;
 try{child=await promisify(execFile)(process.execPath,[cliPath,'--jsonl',requestPath],{cwd:scratch,env:environment,maxBuffer:64*1024*1024});}
 catch(error){thrown=error;child=error;}
 const stdout=typeof child?.stdout==='string'?child.stdout:null,stderr=typeof child?.stderr==='string'?child.stderr:null;
 const exitCode=thrown===null?0:typeof thrown?.code==='number'?thrown.code:null,childFailure=thrown!==null&&exitCode===null?thrown:null;
 preserving(childFailure,label+' CLI child',{exitCode,genuineChildFailure:childFailure!==null,signal:thrown?.signal??null,killed:thrown?.killed??false,
  stdout,stderr,error:b64ErrorRecord(thrown),wallMs:performance.now()-started});
 const lines=(stdout??'').trim().split(/\r?\n/u);let output=null,parseError=null;
 try{if(lines.length!==1||lines[0]==='')throw new Error(`${label}: expected one CLI output line, observed ${lines.length}`);output=JSON.parse(lines[0]);}
 catch(error){parseError=error;}
 preserving(childFailure??parseError,label+' CLI output',{lineCount:lines.length,parseError:b64ErrorRecord(parseError),receiptPresent:Boolean(output?.receipt),output});
 if(childFailure!==null)throw childFailure;
 if(parseError!==null)throw parseError;
 assert.equal(stderr,'',`${label} CLI stderr`);
 return {exitCode,output};
}

// B64 genuine Public composition, the ROOT_SELECTION seven-step recipe through
// current canonical owners. (1) One case-local declared native consumer is
// packaged by prepareRegisteredSelectionProduct over
// constructFreshNativeLifecyclePublication (full lifecycle with its Evidence
// stage; canonical intake/selector/request-sealing revision Programs). (2) The
// explicit installed Public setup above installs, binds and admits it. (3)
// Canonical roles are declared for every F_P leaf, including the intake
// selector GraphFunction/locus assessor role. (4) One actual Public start runs
// the lifecycle: the deterministic stand-in authors the Intent candidate and
// assesses it unsatisfied against one explicit criterion; the real native
// observation and semantic fold admit the adverse envelope, whose context the
// held-prefix owner carries as admitted members of their actual same-Run
// holders; that premise (member, holder event, owner read) is retained and
// checked before going on, and the Run stops
// before later stages and C2. (5) A second genuine Public start of the revision
// intake Program names only the actual source Run and its closed prefix, under
// the same genuine binding. (6) The selector leaf dispatches over its complete
// assembly; the admitted intake, actor_transport_binding_admitted
// instructionAssembly, selection and sealed request are retained, and the Run
// ends before any correction lifecycle. (7) A fresh in-process reader of the
// closed durable log, through the installed core root's owner modules,
// reconstructs the complete assembly with constructSemanticStageNativeBasis and
// constructNativeInstructionAssembly and compares it whole with the held one.
// Strict negatives keep the current/historical split and exact authority. Not
// covered here, and still open: an inherited parent of an older Run and
// binding, older-binding cover, C2/evidence/revision-cause member routes and
// every later lifecycle stage.
test('B64 historical revision: admitted assessor context reaches new-Run selector assembly held and cold',{timeout:1_800_000},async t=>{
 const title='B64 historical revision: admitted assessor context reaches new-Run selector assembly held and cold';
 let passed=false;
 await b64CapturedRun('b64-historical-revision.candidate.json',title,async({seen,preserving})=>{
  const os=await import('node:os'),{execFile}=await import('node:child_process'),{promisify}=await import('node:util');
  const setup=await import('../uat/public-setup.mjs'),{packProduct}=await import('../../scripts/product-payload.mjs');
  const {constructInstalledStartCall}=await import('../support/registered-graph-selection.mjs');
  const scratch=realpathSync(await fsPromises.mkdtemp(join(os.tmpdir(),'abg-b64-public-')));
  // The scratch (installs, closed event log) is kept for inspection unless the case passes.
  t.after(()=>passed?rm(scratch,{recursive:true,force:true}):undefined);
  seen('scratch',{scratch,tenantRoot:root});
  // The freshly packed built tenant and its bootstrap modules (UAT harness precedent).
  const packed=join(scratch,'candidate-artifact');await mkdir(packed);
  const [packResult]=await packProduct(root,packed),packagePath=join(packed,packResult.filename);
  const bootstrapRoot=join(scratch,'bootstrap/node_modules/@abiogenesis/typescript-tenant');await mkdir(bootstrapRoot,{recursive:true});
  const extraction=await promisify(execFile)('/usr/bin/tar',['-xzf',packagePath,'--strip-components=1','-C',bootstrapRoot])
   .then(r=>({exitCode:0,stdout:r.stdout,stderr:r.stderr}),e=>({exitCode:typeof e?.code==='number'?e.code:null,stdout:e?.stdout??null,stderr:e?.stderr??null,error:b64ErrorRecord(e)}));
  seen('packed tenant',{packResult,packagePath,bootstrapRoot,extraction});
  if(extraction.exitCode!==0)throw new Error('bootstrap extraction failed: '+JSON.stringify(extraction));
  const runtime=await setup.installedModules(bootstrapRoot),{product,abg,gtl}=runtime;
  const manifest=JSON.parse(await readFile(join(bootstrapRoot,'product-toolchain-manifest.json'),'utf8'));
  const record=async(path,value)=>{seen('setup record '+path,value);};
  const native=await setup.verifyArtifact(runtime,{artifactPath:packagePath,manifest,expectedArtifactDigest:product.sha256Bytes(await readFile(packagePath))},record,'abg');
  const env=await b64PublicSetup({seen,setup,runtime,native,root:scratch,packagePath});
  const {caller,prepared,consumerPublication,installations,programs,environments,views}=env,{state}=caller,coreRoot=installations[0].installedRoot;
  // The ordinary job over the bound worksite: one source member stating an explicit constraint.
  const S=gtl.SEMANTIC_STAGE_IDS,Wk=gtl.NATIVE_WORKSPACE_WORK_IDS,lifecycle=consumerPublication.semanticJobLifecycle,intent=lifecycle.stages[0];
  const worksite=env.workspaceAuthority.canonicalRoot,paths={source:'source/request.txt',rubric:'source/lifecycle.json'};
  const sourceText='Greet the named user with one short, polite sentence.\nConstraint: keep the stated name unchanged.\n';
  await mkdir(join(worksite,'source'),{recursive:true});await mkdir(join(worksite,'semantic'),{recursive:true});
  await writeFile(join(worksite,paths.source),sourceText);await writeFile(join(worksite,paths.rubric),product.canonicalJson(lifecycle)+'\n');
  const job=product.constructSemanticJobInput({kind:'semantic_job_input',schemaVersion:'5.0.0',lifecycleRef:lifecycle.declarationRef,sourceRoleRef:S.jobSourceContextRoleRef,
   members:[{memberRef:b64Ref('member','request'),path:paths.source,sourceLocator:'input://b64-public-composition/request',base64:Buffer.from(sourceText).toString('base64')}],
   taskData:{nativeLifecycle:{assets:lifecycle.stages.map(s=>({stageRef:s.declarationRef,path:'semantic/'+s.declarationRef.split('/').at(-1).replace('@5','')+'.json'})),rubricPath:paths.rubric}},
   evaluationData:{},worksiteScope:{readRoots:['semantic','source'],writeRoots:['semantic'],parentWriteRoots:['semantic'],evidenceWriteRoots:['proof'],
    executableCapabilities:[{executable:process.execPath,relativeCwdRoots:['.'],environment:{},maxTimeoutMs:5000,maxTerminationGraceMs:1000}]}});
  // The deterministic actor and its log live outside the worksite.
  const proof=join(scratch,'proof');await mkdir(proof);
  const actorPath=join(proof,'b64-scripted-actor.mjs'),actorLog=join(proof,'b64-scripted-actor.jsonl');
  await writeFile(actorPath,'#!'+process.execPath+'\n'+B64_ACTOR);await fsPromises.chmod(actorPath,0o755);
  const actorEnvironment={...process.env,ABG_TS_CLAUDE_COMMAND:actorPath,ABI5_SCRIPTED_ACTOR_LOG:actorLog};delete actorEnvironment.ABI5_SCRIPTED_ACTOR_PHASE;
  const actorText=async()=>readFile(actorLog,'utf8').catch(error=>error.code==='ENOENT'?'':Promise.reject(error));
  seen('selected job, worksite and actor',{job,paths,sourceText,worksite,actorPath,actorScript:B64_ACTOR,actorEnvironment:b64ActorEnvironment(actorEnvironment)});
  // One actual installed Public start per Run, reopening the current close handoff.
  const startRun=async(label,{program,view,declaration,input,identity})=>{
   const current=caller.refresh();
   const start=await constructInstalledStartCall({environment:{product,abg,catalog:state.catalog,catalogView:view,admittedInstalls:current.productInstalls,
     workspaceBinding:current.workspaceBinding,artifactTruth:current.artifactTruth,verified:native.verified,additionalProducts:[{ids:prepared.ids}]},
    publicApi:runtime.api,eventResource:caller.reopen(),input,identity,runEnvironmentResourceFactory:env.resourcesFor(declaration),
    programRef:program.programRef,declaredStartRef:program.starts[0].startRef});
   seen(label+' Public start call',{call:start.call,resolution:start.resolution??null});
   const before=(await actorText()).length;
   const cli=await b64InstalledCli({seen,preserving},label,{scratch:proof,installedRoot:coreRoot,acquisition:setup.transportAcquisition(start.call),call:start.call,environment:actorEnvironment});
   const logText=(await actorText()).slice(before);seen(label+' actor log',logText);
   const rows=logText.split('\n').filter(Boolean).map(line=>JSON.parse(line));
   const receipt=cli.output?.receipt??null,handoff=receipt?.resources?.eventResource?.closeHandoff??null;
   seen(label+' receipt',{exitCode:cli.exitCode,failure:receipt?.failure??null,ownerOutput:receipt?.ownerOutput??null,closeHandoff:handoff});
   if(handoff===null)throw new Error(`${label}: the Run published no close handoff: ${JSON.stringify(receipt).slice(0,4000)}`);
   state.closeHandoff=handoff;
   const events=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix);
   return {start,cli,receipt,handoff,rows,events,prefix:abg.selectValidatedRuntimeEventPrefix(events)};
  };
  const opened=(events,match)=>events.filter(e=>e.kind==='c_call_opened'&&match(e));
  const byCall=(events,kind,cCallRef)=>events.filter(e=>e.kind===kind&&e.aggregateId===cCallRef);
  const kinds=events=>events.map(e=>[e.admissionOrdinal??null,e.kind,e.graphFunctionRef??null,e.aggregateId??null,e.runId??null]);
  const files=context=>(context?.entries??[]).filter(e=>e.state==='file');
  const asJson=read=>read?.kind==='worksite_context_body'?{...read,bytes:read.bytes.toString('base64')}:read;
  const warmPrefixOwner=await import(pathToFileURL(join(bootstrapRoot,'build/code/src/abg/event_prefix.js')).href);
  const replay=await import(pathToFileURL(join(bootstrapRoot,'build/code/src/abg/replay.js')).href);
  // (4) The source Run: native author, native assessor, adverse fold, stop.
  const first=await startRun('b64 source Run',{program:programs.lifecycle,view:views.lifecycle,declaration:environments.lifecycle,input:job,identity:'b64-source'});
  const ev1=first.events,assessOpened=opened(ev1,e=>e.graphFunctionRef===Wk.assessmentGraphFunctionRef);
  const foldOpened=opened(ev1,e=>e.graphFunctionRef===intent.graphFunctionRef+'/native-assessment'&&e.payload?.programLocusRef===intent.assessorLocusRef);
  const laterRefs=[...lifecycle.stages.slice(1).map(s=>s.graphFunctionRef),product.WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef],later=opened(ev1,e=>laterRefs.includes(e.graphFunctionRef));
  const assessResult=assessOpened.length===1?byCall(ev1,'c_call_result_admitted',assessOpened[0].aggregateId):[];
  const foldResult=foldOpened.length===1?byCall(ev1,'c_call_result_admitted',foldOpened[0].aggregateId):[];
  const foldJudged=foldOpened.length===1?byCall(ev1,'c_call_judged',foldOpened[0].aggregateId):[];
  seen('b64 source Run events',{prefix:first.handoff.prefix,eventCount:ev1.length,eventKinds:kinds(ev1),assessOpened,assessResult,foldOpened,foldResult,foldJudged,later,actorRows:first.rows});
  const foldValue=foldResult[0]?.payload.value??null,foldContext=foldValue?.context??null,sourceRunId=foldResult[0]?.runId??null;
  const premise=seen('b64 adverse member premise',{sourceRunId,assessorBasisRef:assessOpened[0]?.basisId??null,after:assessResult[0]?.payload.value?.after??null,foldContext,
   foldAssessment:foldValue?.assets?.at(-1)?.assessment??null,foldJudgment:foldJudged[0]?.payload.judgment??null,
   entries:files(foldContext).map(e=>{const member=e.member??null,basisMember=member!==null&&Object.hasOwn(member,'basisRef');
    const holders=member===null?[]:ev1.filter(h=>basisMember?h.kind==='basis_admitted'&&h.payload?.basisRef===member.basisRef&&h.payload?.basisDigest===member.basisDigest
     :h.kind==='c_call_result_admitted'&&h.payload?.resultRef===member.resultRef&&h.payload?.resultDigest===member.resultDigest);
    return {relativePath:e.relativePath,encoding:e.encoding,digest:e.digest,byteLength:e.byteLength,member,
     holders:holders.map(h=>({eventId:h.eventId,kind:h.kind,runId:h.runId??null,basisRef:h.payload?.basisRef??null,basisDigest:h.payload?.basisDigest??null,resultRef:h.payload?.resultRef??null,resultDigest:h.payload?.resultDigest??null})),
     read:sourceRunId===null?null:asJson(warmPrefixOwner.resolveWorksiteContextBodyAtPrefix(first.prefix,foldContext,e.relativePath,{runId:sourceRunId}))};})});
  // The genuine adverse admitted-member premise holds before any later Run.
  assert.equal(assessOpened.length,1,'one actual native assessor call');assert.equal(assessResult.length,1,'its observation is admitted');
  assert.equal(foldOpened.length,1,'one actual native assessor fold');assert.equal(foldResult.length,1,'the adverse envelope is admitted');assert.equal(foldJudged.length,1);
  assert.deepEqual(first.rows.map(r=>r.role),['author','assess'],'one deterministic author and one deterministic assessor dispatch');
  assert.equal(first.rows[1].kept,false,'the assessor compared the delivered source and candidate and found the stated constraint lost');
  assert.ok(premise.foldAssessment!==null&&premise.foldAssessment.disposition!=='satisfied',JSON.stringify(premise.foldAssessment));
  assert.notEqual(premise.foldJudgment,'advance','the adverse fold does not advance');
  assert.deepEqual(later,[],'the source Run stops before later lifecycle stages and C2');
  assert.deepEqual(premise.foldContext,premise.after,'the fold carries the native observation after unchanged');
  // The held-prefix owner carries a body as a member of its first same-Run
  // holder at a declared native context coordinate (a native task basis or a
  // native Result); the source member is required, and every member is
  // checked against its one actual holder.
  const memberEntries=premise.entries.filter(e=>e.encoding==='admitted_member');
  assert.ok(premise.entries.length>0&&premise.entries.every(e=>e.encoding==='admitted_member'||e.encoding==='base64'),JSON.stringify(premise.entries.map(e=>[e.relativePath,e.encoding])));
  assert.equal(premise.entries.find(e=>e.relativePath===paths.source)?.encoding,'admitted_member','the adverse fold carries the source as an admitted member');
  for(const e of memberEntries){
   assert.equal(e.holders.length,1,`${e.relativePath}: one admitted holder`);
   assert.ok(['basis_admitted','c_call_result_admitted'].includes(e.holders[0].kind),e.relativePath);
   assert.equal(e.holders[0].runId,premise.sourceRunId,`${e.relativePath}: the holder is admitted in the source Run`);
   assert.equal(e.read?.kind,'worksite_context_body',JSON.stringify(e.read));assert.equal(e.read.holder.eventRef,e.holders[0].eventId,`${e.relativePath}: the real holder serves the member`);
   assert.equal(e.read.digest,e.digest);
  }
  // (5) The revision intake Run over the actual source Run and closed prefix.
  const sourceIdentity=seen('b64 source Run identity',replay.projectRunIdentityAtPrefix(first.prefix,sourceRunId));
  assert.ok(sourceIdentity,'the source Run identity is admitted');
  const intakeInput=seen('b64 revision intake input',{kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:sourceIdentity.run,sourcePrefix:first.handoff.prefix});
  const second=await startRun('b64 revision intake Run',{program:programs.intake,view:views.intake,declaration:environments.intake,input:intakeInput,identity:'b64-revision'});
  const ev2=second.events,fresh=ev2.slice(ev1.length),selectRef=B64_REVISION('select'),acquireRef=B64_REVISION('acquire'),selectNode=selectRef+'/node';
  const acquireOpened=opened(fresh,e=>e.graphFunctionRef===acquireRef),selectOpened=opened(fresh,e=>e.graphFunctionRef===selectRef&&e.payload?.programLocusRef===selectNode);
  const requestOpened=opened(fresh,e=>e.graphFunctionRef===selectRef&&e.payload?.programLocusRef===selectNode+'/request');
  const intakeResult=acquireOpened.length===1?byCall(fresh,'c_call_result_admitted',acquireOpened[0].aggregateId):[];
  const selectResult=selectOpened.length===1?byCall(fresh,'c_call_result_admitted',selectOpened[0].aggregateId):[];
  const requestResult=requestOpened.length===1?byCall(fresh,'c_call_result_admitted',requestOpened[0].aggregateId):[];
  const artifacts=selectOpened.length===1?fresh.filter(e=>e.kind==='actor_result_artifact_observed'&&e.parentAggregateId===selectOpened[0].aggregateId):[];
  const bindings=artifacts.length===1?fresh.filter(e=>e.kind==='actor_transport_binding_admitted'&&e.aggregateId===artifacts[0].payload.transportBindingRef):[];
  const foreignCalls=opened(fresh,e=>!programs.intake.callableMembership.includes(e.graphFunctionRef));
  seen('b64 revision intake Run events',{prefix:second.handoff.prefix,eventCount:ev2.length,eventKinds:kinds(fresh),acquireOpened,intakeResult,selectOpened,selectResult,
   artifacts,bindings,requestOpened,requestResult,foreignCalls,actorRows:second.rows});
  // (6) The held selector assembly, its plan, request and manifest, and the
  // decision sections of its actual delivered prompt.
  const held=seen('b64 held selector assembly',bindings.length===1?bindings[0].payload.instructionAssembly??null:null);
  const promptSection=(prompt,name)=>{const head='## '+name+'\n',i=prompt.indexOf(head);if(i<0)return null;const start=i+head.length,end=prompt.indexOf('\n\n## ',start);
   return JSON.parse(prompt.slice(start,end<0?undefined:end));};
  const heldSections=seen('b64 held decision sections',typeof held?.request?.prompt!=='string'?null:
   {evidence:promptSection(held.request.prompt,'evidence'),worksite:promptSection(held.request.prompt,'worksite'),task:promptSection(held.request.prompt,'task')});
  assert.equal(second.receipt?.failure??null,null,JSON.stringify(second.receipt).slice(0,4000));assert.equal(second.receipt.ownerOutput?.outcomeKind,'result');
  for(const [label,rows] of Object.entries({acquireOpened,intakeResult,selectOpened,selectResult,requestOpened,requestResult,artifacts,bindings}))assert.equal(rows.length,1,label);
  assert.deepEqual(second.rows.map(r=>r.role),['select'],'one deterministic selector dispatch');
  assert.deepEqual(foreignCalls,[],'the intake Run ends before any correction lifecycle execution');
  const selectionInput=intakeResult[0].payload.value,selection=selectResult[0].payload.value,sealed=requestResult[0].payload.value,secondRunId=selectResult[0].runId;
  assert.equal(selectionInput.kind,'semantic_revision_selection_input');
  assert.deepEqual(selectionInput.causes.map(c=>[c.cCallRef,c.resultRef,c.resultDigest,c.resultAdmissionEventRef]),
   [[foldOpened[0].aggregateId,foldResult[0].payload.resultRef,foldResult[0].payload.resultDigest,foldResult[0].eventId]],'the intake selects the exact adverse fold as its one cause');
  const parentEvent=ev1.find(e=>e.eventId===selectionInput.parent.resultAdmissionEventRef);
  assert.ok(parentEvent?.kind==='c_call_result_admitted'&&parentEvent.runId===sourceRunId&&parentEvent.aggregateId===selectionInput.parent.cCallRef&&
   parentEvent.payload.resultRef===selectionInput.parent.resultRef&&parentEvent.payload.resultDigest===selectionInput.parent.resultDigest,'the parent is an exact admitted source-Run Result');
  assert.ok(files(selectionInput.nativeWorksite.context).length>0&&files(selectionInput.nativeWorksite.context).every(e=>e.encoding==='base64'),'current W is the fresh inline intake observation');
  assert.deepEqual([selection.kind,selection.mode,selection.selectedStageRef],['semantic_revision_selection','stage_revision',intent.declarationRef]);
  assert.deepEqual([selection.parent,selection.causes],[selectionInput.parent,selectionInput.causes],'the selection names the exact eligible parent and cause');
  assert.deepEqual(selection,second.rows[0].output,'the admitted selection is the stand-in response to the delivered prompt');
  assert.deepEqual(heldSections.task.input.causes,selectionInput.causes,'the delivered prompt presents the admitted intake coordinates');
  assert.equal(held.kind,'native_instruction_assembly');
  assert.deepEqual([held.plan.graphFunctionRef,held.plan.programLocusRef,held.plan.role,held.plan.rendererRef,held.plan.presentation],
   [selectRef,selectNode,'selection','renderer://abiogenesis/semantic-revision/selection@5','native_revision_decision_view']);
  assert.equal(artifacts[0].payload.promptDigest,held.manifest.promptDigest,'the dispatched prompt is the held assembly');
  assert.deepEqual([sealed.kind,sealed.parent,sealed.causes,sealed.selection.resultRef,sealed.selection.resultDigest],
   ['semantic_revision_request',selectionInput.parent,selectionInput.causes,selectResult[0].payload.resultRef,selectResult[0].payload.resultDigest],'the sealed native request names the admitted selection');
  const causeView=files(heldSections.evidence.causes[0].result.value.context);
  assert.equal(causeView.length,premise.entries.length,'every historical member of the cause is presented');
  for(const e of causeView){
   assert.equal(e.sourceEncoding,premise.entries.find(p=>p.relativePath===e.relativePath)?.encoding,e.relativePath);
   if(e.sourceEncoding==='admitted_member')assert.ok(e.member,'the original member coordinate remains beside the view');
   const ref=e.textView?.presentationRef??'',body=ref.startsWith('#/worksite/byteBodies/')?heldSections.worksite.byteBodies[Number(ref.split('/').at(-1))]:undefined;
   if(body!==undefined)assert.equal(body.digest,e.digest,`${e.relativePath}: complete historical member bytes`);
   if(e.relativePath===paths.source){assert.ok(body,'the source member body is presented');assert.equal(body.text,sourceText);}
  }
  assert.ok(files(heldSections.worksite.context).every(e=>e.sourceEncoding==='base64'&&e.member===undefined),'current W context stays inline');
  // (7) Cold: a fresh reader of the closed durable log through the installed
  // core root's owner modules, never loaded by setup or by either Run here.
  const coldLoad=name=>import(pathToFileURL(join(coreRoot,'build/code/src',name+'.js')).href);
  const [cAbg,cProduct,cGtl,cCalls,cCursor,cStore,cAssembly,cRevision,cPrefix,cPort,cStage]=await Promise.all(['abg/index','product/index','gtl/index','abg/c_call',
   'abg/traversal_cursor','abg/event_store','abg/instruction_assembly','abg/semantic_revision','abg/event_prefix','implementation/leaf_invocation_port','gtl/semantic_stage'].map(coldLoad));
  const closed=second.handoff.prefix,coldEvents=cAbg.readRuntimeEventsAtDurablePrefix(closed),coldPrefix=cAbg.selectValidatedRuntimeEventPrefix(coldEvents);
  const coldSelect=coldEvents.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===selectRef&&e.payload?.programLocusRef===selectNode);
  const execution=coldSelect.length===1?cAbg.rehydrateExecutionBasisAtPrefix(coldPrefix,coldSelect[0].basisId):null;
  const coldEnvironment=cAbg.projectExactPrefixWorkspaceEnvironment(closed,{ref:state.binding.bindingId,digest:state.binding.bindingDigest});
  const loaded=await cProduct.ProductExecutionResolutionPort.resolve({catalog:state.catalog,catalogView:views.intake,admittedInstalls:coldEnvironment.productInstalls,
   verifyInstallAdmission:install=>cAbg.hasAdmittedProductInstall(coldEnvironment.artifactTruth,install),programRef:programs.intake.programRef,
   selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}});
  seen('b64 cold environment and resolution',{coldEventCount:coldEvents.length,coldSelect,execution,environmentKind:coldEnvironment?.kind??null,loadedKind:loaded?.kind??null,
   refusal:loaded?.kind==='loaded_product_execution_resolution'?null:loaded,catalogBasisDigest:loaded?.admittedCatalog?.basisDigest??null,
   programPublication:loaded?.programPublication===undefined?null:{moduleRef:loaded.programPublication.moduleRef,digest:cProduct.sha256Canonical(loaded.programPublication)}});
  assert.equal(coldSelect.length,1);assert.ok(execution,'the selector execution basis rehydrates from the closed log');
  assert.equal(coldEnvironment.kind,'exact_prefix_workspace_environment');
  assert.equal(loaded.kind,'loaded_product_execution_resolution',JSON.stringify(loaded).slice(0,2000));
  assert.equal(loaded.admittedCatalog.basisDigest,state.catalog.basisDigest,'typed carriage of the authenticated Catalog');
  const implementationSet=cAbg.rehydrateAdmittedImplementationSetAtPrefix(coldPrefix,execution.rootImplementationSetRef);
  const port=await cPort.constructAdmittedLeafInvocationPort({prefix:coldPrefix,artifactTruth:coldEnvironment.artifactTruth,implementationSet,executionResolution:loaded,
   semanticsProjection:cProduct.projectInstalledLeafSemantics(loaded.productSemantics)});
  const programPublication=loaded.programPublication,program=programPublication.programs.find(p=>p.programRef===execution.programRef);
  const lifecycleRef=program===undefined?undefined:cStage.semanticLifecycleRefForProgram(programPublication,program);
  const lifecyclePublication=lifecycleRef===undefined?null:port.semanticPublicationByDeclarationRef(lifecycleRef)??null;
  const sourcePublication=lifecyclePublication===null?null:lifecyclePublication.semanticJobLifecycle!==undefined?lifecyclePublication
   :port.sourcePublicationByDeclarationRef(lifecyclePublication.semanticLifecycle.sourceDeclarationRef)??null;
  const declarationGraphFunctions=port.declarationGraphFunctions();
  const graphFunction=declarationGraphFunctions.find(g=>g.name===execution.graphFunctionRef&&cProduct.sha256Canonical(g)===execution.graphFunctionDigest)??null;
  const graph=graphFunction===null?null:cGtl.materializeGraph(graphFunction,{invocationAdmissionRef:execution.invocationAdmissionRef,
   admittedInputRef:execution.rawInputAdmissionRef,admittedInputDigest:execution.rawInputDigest,admittedInput:execution.rawInputValue});
  const cCall=graph===null?null:cCalls.projectOpenedCCallCarrierAtPrefix(coldPrefix,graph,coldSelect[0].aggregateId)??null;
  const traversal=graph===null?null:cCursor.projectOpenedCCallTraversalInputAtPrefix(coldPrefix,graph,coldSelect[0].aggregateId)??null;
  // The historical cut through the selector opening's fibre selection is the
  // live basis prefix; the closed tail is not.
  const predecessorPrefix=cCall===null?null:cStore.durableRuntimeEventPrefixThroughEvent(closed,cCall.fibreSelectedEventRef);
  const basisFields={publication:programPublication,lifecyclePublication,sourcePublication,graph,graphFunction,executionBasis:execution,cCall,cursor:traversal?.cursor??null,
   predecessorPrefix,declarationGraphFunctions,commandExecutionLimits:null};
  const coldBasis=[lifecyclePublication,sourcePublication,graph,cCall,traversal,predecessorPrefix].includes(null)?null:cAbg.constructSemanticStageNativeBasis(basisFields);
  const coldInput=traversal?.input.value??null,cold=coldBasis===null?null:cAssembly.constructNativeInstructionAssembly(coldBasis,coldInput);
  seen('b64 cold selector assembly',{basis:{programRef:execution.programRef,lifecycleRef,lifecyclePublication:lifecyclePublication?.moduleRef??null,
   sourcePublication:sourcePublication?.moduleRef??null,graphFunctionRef:graphFunction?.name??null,graphRef:graph?.materializationRef??null,cCall,cursor:traversal?.cursor??null,
   predecessorPrefix,heldPredecessorPrefix:held.envelope?.predecessorPrefix??null,constructed:coldBasis!==null},input:coldInput,assembly:cold});
  // Strict owner negatives and the current/historical split over the same closed log.
  const subject=coldBasis===null?null:cRevision.projectOwnedJobRevisionSubject(coldBasis,coldInput),uses=subject?.historicalContexts??null;
  const altered=coldInput===null?null:{...coldInput,causes:[{...coldInput.causes[0],resultDigest:cProduct.sha256Canonical('b64-other-cause')}]};
  const tailBasis=coldBasis===null?null:cAbg.constructSemanticStageNativeBasis({...basisFields,predecessorPrefix:closed});
  const causeAt={resultRef:foldResult[0].payload.resultRef,resultDigest:foldResult[0].payload.resultDigest,route:['context']};
  const memberFiles=files(foldContext).filter(e=>e.encoding==='admitted_member');
  const readAll=(label,declared)=>({label,reads:memberFiles.map(e=>({relativePath:e.relativePath,
   read:asJson(cPrefix.resolveHistoricalWorksiteContextBodyAtPrefix(coldPrefix,causeAt,foldContext,e.relativePath,declared))}))});
  const derived=uses??[],coldFoldEvent=coldEvents.find(e=>e.eventId===foldResult[0].eventId)??null;
  const intakeAt={resultRef:intakeResult[0].payload.resultRef,resultDigest:intakeResult[0].payload.resultDigest,route:['nativeWorksite','context']};
  const currentContext=coldInput?.nativeWorksite?.context??null,currentFile=files(currentContext)[0]??null;
  const checks=seen('b64 cold owner checks',{uses,subjectCoordinates:subject===null?null:{parent:subject.parent?.cCall?.cCallRef??null,causes:(subject.causes??[]).map(c=>c.cCall?.cCallRef??null)},
   alteredInputAssembly:altered===null?'not_evaluated':cAssembly.constructNativeInstructionAssembly(coldBasis,altered),
   alteredSubject:altered===null?'not_evaluated':cRevision.projectOwnedJobRevisionSubject(coldBasis,altered),tailBasis:tailBasis===null?null:'constructed',
   lower:[readAll('owner-derived uses',derived),readAll('no historical use',[]),
    readAll('uncovered binding',derived.map(u=>({...u,coveredBinding:{...u.coveredBinding,bindingDigest:cProduct.sha256Canonical('b64-other-binding')}}))),
    readAll('another Run',derived.map(u=>({...u,runId:secondRunId}))),readAll('parent use only',derived.filter(u=>u.resultRef!==causeAt.resultRef))],
   stageView:memberFiles.map(e=>({relativePath:e.relativePath,read:asJson(cPrefix.resolveWorksiteContextBodyAtPrefix(coldPrefix,foldContext,e.relativePath,{runId:sourceRunId}))})),
   current:currentFile===null?null:{relativePath:currentFile.relativePath,own:asJson(cPrefix.resolveWorksiteContextBodyAtPrefix(coldPrefix,currentContext,currentFile.relativePath,{runId:secondRunId})),
    historical:asJson(cPrefix.resolveHistoricalWorksiteContextBodyAtPrefix(coldPrefix,intakeAt,currentContext,currentFile.relativePath,derived))},
   carriers:{cause:{source:product.canonicalJson(foldResult[0].payload),closed:coldFoldEvent===null?null:cProduct.canonicalJson(coldFoldEvent.payload)}}});
  // Complete held and cold assembly identity.
  assert.ok(coldBasis,'the fresh reader authenticates the selector basis at its opening cut');
  assert.ok(cold,'the fresh reader reconstructs the complete selector assembly');
  assert.equal(cProduct.canonicalJson(coldInput),product.canonicalJson(selectionInput),'the cold traversal input is the admitted intake Result');
  for(const field of ['plan','envelope','manifest','request'])assert.equal(cProduct.canonicalJson(cold[field]),product.canonicalJson(held[field]),`complete held and cold ${field}`);
  assert.equal(cProduct.canonicalJson(cold),product.canonicalJson(held),'complete held and cold assembly');
  // Owner-derived historical use: the cause of the source Run, same binding.
  assert.ok(uses,'the revision owner derives its authenticated subject');
  const causeUses=uses.filter(u=>u.resultRef===causeAt.resultRef);
  assert.equal(causeUses.length,1,'one owner-derived use of the adverse cause');
  assert.deepEqual([causeUses[0].resultDigest,causeUses[0].runId,causeUses[0].cCallRef],[causeAt.resultDigest,sourceRunId,foldOpened[0].aggregateId]);
  assert.deepEqual([causeUses[0].coveredBinding.bindingId,causeUses[0].coveredBinding.bindingDigest],[state.binding.bindingId,state.binding.bindingDigest],'the same genuine binding covers the use');
  const holderOf=relativePath=>premise.entries.find(e=>e.relativePath===relativePath).holders[0].eventId;
  for(const row of checks.lower[0].reads){assert.equal(row.read.kind,'worksite_context_body',JSON.stringify(row));assert.equal(row.read.holder.eventRef,holderOf(row.relativePath));}
  for(const group of checks.lower.slice(1))for(const row of group.reads){
   assert.equal(row.read.kind,'worksite_context_body_refusal',`${group.label}: ${row.relativePath}`);assert.equal(row.read.code,'foreign',`${group.label}: ${row.read.reason}`);}
  assert.equal(checks.alteredInputAssembly,null,'an altered cause coordinate assembles nothing');
  assert.equal(checks.alteredSubject,null,'an altered cause coordinate is not the authenticated acquisition');
  assert.equal(checks.tailBasis,null,'the closed tail after the selector Result is not its basis');
  for(const row of checks.stageView){assert.equal(row.read.kind,'worksite_context_body',JSON.stringify(row));assert.equal(row.read.holder.eventRef,holderOf(row.relativePath));}
  assert.ok(checks.current,'the current intake context has a file');
  assert.equal(checks.current.own.kind,'worksite_context_body');assert.equal(checks.current.own.holder,null,'current W is its own inline birth');
  assert.equal(checks.current.historical.kind,'worksite_context_body_refusal');assert.equal(checks.current.historical.code,'foreign','current W has no historical use');
  assert.equal(checks.carriers.cause.closed,checks.carriers.cause.source,'the admitted adverse fold carrier is unchanged');
  passed=true;
 });
});
