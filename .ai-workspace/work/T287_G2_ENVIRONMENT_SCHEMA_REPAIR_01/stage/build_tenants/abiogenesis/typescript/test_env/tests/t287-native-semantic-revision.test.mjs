// Component composition: real Product/ABG joins with explicitly supplied upstream admission facts.
// Temporary files only; no native actor, command, journal, installed execution or qualification.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ordinaryJob } from '../support/t287-generic-job-intake.mjs';
import { worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
const root = process.env.ABI5_GENERIC_JOB_BUILD_ROOT ?? resolve(import.meta.dirname, '../..');
const load = name => import(pathToFileURL(join(root, 'build/code/src', name + '.js')).href);
const [p,g,m,n,ops,effects,owners,prefixes,immutable] = await Promise.all(['product/index','gtl/index','product/semantic_job',
 'product/native_workspace_work','product/worksite_operations','product/worksite_effect','abg/native_worksite_execution','abg/event_prefix','shared/immutable'].map(load));
const hash=p.sha256Canonical, zero='sha256:'+'0'.repeat(64);
const publication=g.constructSemanticStageModulePublication({productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION,
 artifactDigest:zero,productContentDigest:zero,productManifestDigest:zero});
const glcRoot=process.env.ODD_GLC_NATIVE_DECLARATION_ROOT ?? resolve(root,'../../../../odd_glc/build_tenants/odd_glc/typescript');
const {constructFreshNativeLifecyclePublication,selectNativeSemanticRevisionStart}=await import(pathToFileURL(join(glcRoot,'src/native-lifecycle-declarations.mjs')).href);
const ids=Object.fromEntries(Object.entries({productId:'product',moduleRef:'module',descriptorRef:'descriptor',contributionManifestRef:'contribution-manifest',
 lifecycleDeclarationRef:'lifecycle',graphFunctionRef:'graph-function',graphRef:'graph',closureContractRef:'contract',programRef:'program',startRef:'start'})
 .map(([key,kind])=>[key,kind+'://component/native-d2@5']));
const declaredPublication=constructFreshNativeLifecyclePublication({gtl:g,product:p,ids,semanticPublication:publication});
const declaration=declaredPublication.semanticJobLifecycle;
// Ordinary caller data only: no local selection, admitted leaf lookup or cause inference.
function declaredCorrection(request,publication=declaredPublication){
 const start=selectNativeSemanticRevisionStart({product:p,publication,request});assert(start);
 const root=publication.graphFunctions.find(graph=>graph.name===start.graphFunctionRef);
 const first=root.template.nodes.find(node=>node.nodeRef===root.template.startNodeRef);
 return {start,projection:publication.graphFunctions.find(graph=>graph.name===first.term.graphFunctionRef)};
}
const provenance = key => ({ cCallRef:'component:c-call:'+key,executionAuthorityRef:'component:authority:'+key,executionAuthorityDigest:hash(key),
 actorInvocationRef:'component:actor:'+key,transportBindingRef:'component:transport',transportBindingDigest:hash('transport'),promptDigest:hash(key),transportDigest:hash('transport:'+key) });
const adapter=(key,input)=>({cCallRef:'component:adapter:'+key,inputDigest:hash(input)});
async function fixture(t,commandExecutionLimits) {
 const env=await worksiteFixture({...p,...effects,...ops});t.after(()=>rm(env.scratch,{recursive:true,force:true}));
 const selectedDeclaration=commandExecutionLimits===undefined?declaration:g.constructSemanticJobLifecycleDeclaration({...declaration,bounds:{...declaration.bounds,maxCommands:32}});
 const initial=ordinaryJob(p,g,'Build an application and an independent verifier. Preserve complete source and all unresolved obligations.');
 const job=p.constructSemanticJobInput({...initial,lifecycleRef:selectedDeclaration.declarationRef,evaluationData:{independentSentinel:'evaluator-only-9bff'},taskData:{...initial.taskData,nativeLifecycle:{assets:declaration.stages.map((s,i)=>({stageRef:s.declarationRef,path:`assets/${i}.json`})),rubricPath:'assets/rubric.json',
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


import {SourceTextModule,SyntheticModule} from 'node:vm';
import {observationFor} from '../support/forward-observation-carrier.mjs';
const [revision,revisionIds,commands,semantics]=await Promise.all(['product/semantic_revision','gtl/semantic_revision_identity','product/worksite_command_execution','product/builtin_semantics'].map(load));
const R=revisionIds.SEMANTIC_REVISION_IDS,D=g.SEMANTIC_STAGE_IDS;
async function component(name,overrides){const file=join(root,'build/code/src',name+'.js'),module=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
 await module.link(async spec=>{const imported=await import(spec.startsWith('node:')?spec:pathToFileURL(resolve(dirname(file),spec)).href),values={...imported,...overrides[spec]};
  return new SyntheticModule(Object.keys(values),function(){for(const [key,value]of Object.entries(values))this.setExport(key,value);});});await module.evaluate();return module.namespace;}
function coordinate(state){return {cCallRef:state.cCall.cCallRef,resultRef:state.result.resultRef,resultDigest:state.result.resultDigest,resultAdmissionEventRef:state.result.admissionEventRef,judgmentEventRef:state.judgment.admissionEventRef};}
async function harness(env, options={}){
 const events=[],states=new Map(),bases=new Map(),nativeSources=new Map(),runs=new Map();
 const prefix={events},publicRun={ref:'component:source-run',digest:hash('public-run')},original={...env.executionBasis,basisRef:env.envelope.basis.rootExecutionBasisRef,parentExecutionBasisRef:null,
  rawInputValue:env.job,rawInputDigest:hash(env.job),rawInputAdmissionRef:env.envelope.basis.rootInputRef,invocationAdmissionRef:env.envelope.basis.invocationAdmissionRef};
 bases.set(original.basisRef,original);
 runs.set(publicRun.ref,{run:publicRun,executionBasis:{ref:original.basisRef}});
 const oldEnvironment={kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,productInstalls:[]};
 const environment={...oldEnvironment,...options.current};
 const lifecyclePublication=options.publication??declaredPublication;
 const pub=await load('product/publication');environment.productInstalls.push({productId:lifecyclePublication.owningProductId,artifactDigest:lifecyclePublication.artifactDigest,productContentDigest:lifecyclePublication.productContentDigest,
  manifestDigest:lifecyclePublication.productManifestDigest,installedRoot:env.scratch,contributionManifest:{publicationBindings:[{moduleRef:lifecyclePublication.moduleRef,publicationDigest:pub.modulePublicationSemanticDigest(lifecyclePublication)}]}});
 const prefixBody={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///component/no-journal',prefixLength:0,prefixDigest:hash('prefix'),storeIdentity:{device:1,inode:1,eventContractDigest:(await load('abg/event_store')).ROOT_EVENT_CONTRACT_DIGEST}};
 const intake={kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:publicRun,sourcePrefix:{...prefixBody,coordinateDigest:hash(prefixBody)}};
 let current,ordinal=0,rootBasis,runId,ancestry=true;const basis={publication:lifecyclePublication,lifecyclePublication,sourcePublication:lifecyclePublication,predecessorPrefix:intake.sourcePrefix,declarationGraphFunctions:[],graphFunction:{declarations:{}}};
 function invocation(name,input,operating=env){runId='component:run:'+name;rootBasis={...original,basisRef:'component:root:'+name,basisDigest:hash(['basis',name]),admissionEventRef:'component:basis-event:'+name,
  rawInputValue:input,rawInputDigest:hash(input),rawInputAdmissionRef:'component:input:'+name,invocationAdmissionRef:'component:invocation:'+name,
  workspaceBindingId:operating.workspaceBinding.bindingId,workspaceBindingDigest:operating.workspaceBinding.bindingDigest};bases.set(rootBasis.basisRef,rootBasis);
  const run={ref:runId,digest:hash(['run',name])};runs.set(runId,{run,executionBasis:{ref:rootBasis.basisRef}});return {run,root:rootBasis};}
 function call(impl,input,raw=input,extra={}){const execution={...rootBasis,basisRef:'component:basis:'+(++ordinal),parentExecutionBasisRef:rootBasis.basisRef,rawInputValue:raw,rawInputDigest:hash(raw)};
  bases.set(execution.basisRef,execution);const cCall={...env.cCall,cCallRef:'component:call:'+ordinal,basisId:execution.basisRef,runId,implementationRef:impl,regime:[R.selectionImplementationRef,R.authorImplementationRef,R.assessorImplementationRef].includes(impl)?'F_P':'F_D',...extra};
  current={execution,call:cCall,inputValue:input,inputDigest:hash(input),inputRef:'component:input:'+ordinal,prefix,events,environment,program:{}};basis.cCall=cCall;basis.executionBasis=execution;return current;}
 function admit(value,impl,execution=current?.execution??original,judgment='advance',cCallRef=current?.call.cCallRef??'component:call:'+(++ordinal),run=runId,resultClass='success'){
  const resultDigest=hash({value,cCallRef}),resultRef='result://abiogenesis/'+resultDigest.slice(7),admissionEventRef='component:event:'+(++ordinal),judgmentEventRef='component:event:'+(++ordinal);
  const state={cCall:{...env.cCall,cCallRef,basisId:execution.basisRef,runId:run,implementationRef:impl,graphFunctionRef:current?.call.graphFunctionRef??'component:graph',regime:impl===R.selectionImplementationRef?'F_P':'F_D'},
   result:{resultClass,resultRef,resultDigest,value,admissionEventRef},judgment:{judgment,admissionEventRef:judgmentEventRef}};
  states.set(cCallRef,state);events.push({kind:'c_call_result_admitted',aggregateId:cCallRef,runId:run,eventId:admissionEventRef,admissionOrdinal:ordinal,payload:{resultRef,resultDigest,value}},{kind:'c_call_judged',aggregateId:cCallRef,runId:run,eventId:judgmentEventRef,admissionOrdinal:++ordinal,payload:{}});return state;}
 const lookup=(_prefix,c)=>{options.onLeafLookup?.(c.cCallRef);const state=states.get(c.cCallRef);return state&&hash(coordinate(state))===hash(c)?state:null;};
 const selected=(_basis,impl,value)=>{const rows=[...states.values()].filter(s=>s.result.resultClass==='success'&&s.judgment.judgment==='advance'&&s.cCall.implementationRef===impl&&hash(s.result.value)===hash(value)&&bases.get(s.cCall.basisId)?.invocationAdmissionRef===current.execution.invocationAdmissionRef);
  return rows.length===1?{previous:rows[0],execution:bases.get(rows[0].cCall.basisId),event:events.find(e=>e.eventId===rows[0].result.admissionEventRef)}:null;};
 const executionOverrides={authenticateNativeInstructionAssemblyBasis:()=>current,rehydrateExecutionBasisAtPrefix:(_prefix,ref)=>bases.get(ref)??null};
 const invocationOverrides={rehydrateInvocationAdmissionAtPrefix:()=>({capabilityGrants:[options.current?.capabilityGrant??env.capabilityGrant]})};
 const inputOwner=options.currentInput===undefined?null:await component('abg/worksite_input_provenance',{
  './event_prefix.js':{runtimeEventsFromValidatedPrefix:p=>p.events},
  './invocation_execution_truth.js':{projectExactExecutionBasisAtPrefix:(_p,ref)=>bases.get(ref)??null}});
 const jobOwner=await component('abg/semantic_job',{'./execution_basis.js':executionOverrides,'./invocation_admission.js':invocationOverrides,
  '../gtl/semantic_job.js':{validSemanticJobProgramOwners:()=>true},'./worksite_revision.js':{projectWorksiteRevisionNativeResult:lookup}});
 const owner=await component('abg/semantic_revision',{'./execution_basis.js':executionOverrides,'./invocation_admission.js':invocationOverrides,'./semantic_job.js':{...jobOwner,...options.contextPremises},
  './traversal_cursor.js':options.currentInput===undefined?{}:{projectOpenedCCallTraversalInputAtPrefix:()=>({input:options.currentInput()})},
  './worksite_input_provenance.js':inputOwner??{},
  '../product/worksite_operations.js':options.observation===undefined?{}:{observeWorksiteContext:async()=>options.observation},'./semantic_stage.js':{selectedSemanticPredecessor:selected},'./event_store.js':{authenticateRuntimePrefixAncestry:()=>ancestry,reidentifyHistoricalDurablePrefixCoordinate:(_c,h)=>h,readRuntimeEventsAtDurablePrefix:()=>events},
  './event_prefix.js':{selectValidatedRuntimeEventPrefix:()=>prefix,runtimeEventsFromValidatedPrefix:p=>p.events,indexedRuntimeEvents:(p,key)=>p.events.filter(e=>key==='aggregate:c_call:'+e.aggregateId||key==='id:'+e.eventId)},'./replay.js':{projectRunIdentityAtPrefix:(_p,ref)=>runs.get(ref)??null},
  './environment_admission.js':{projectExactPrefixWorkspaceEnvironment:options.historicalEnvironment??(()=>oldEnvironment)},'./worksite_revision.js':{projectWorksiteRevisionNativeResult:lookup,projectWorksiteRevisionBindingCover:options.cover??(()=>[])},
  './native_worksite_execution.js':{projectNativeWorkspaceWorkSourceAtPrefix:(_p,value)=>nativeSources.get(value.observationRef)??null,worksiteCommandSourcesInvalidatedAfter:options.invalidated??(()=>false)}});
 const implementation=await component('implementation/semantic_revision',{'../abg/semantic_revision.js':owner,'../implementation/worksite_command_execution.js':{}});
 function source(value,state){nativeSources.set(value.observationRef,{sourceBasis:bases.get(state.cCall.basisId),sourceResult:{...events.find(e=>e.eventId===state.result.admissionEventRef),runId:state.cCall.runId},sourceClosedEvent:{admissionOrdinal:++ordinal}});}
 function event(kind,payload,scope={}){const value={kind,payload,eventId:'component:event:'+(++ordinal),admissionOrdinal:ordinal,causationEventRefs:[],...scope};events.push(value);return value;}
 return {events,states,bases,original,intake,publicRun,prefix,basis,owner,implementation,jobOwner,inputOwner,invocation,call,admit,source,event,coordinate,get current(){return current;},set ancestry(v){ancestry=v;}};
}
function actorSource(name,input){return {cCallRef:'component:revision:'+name,inputDigest:hash(input),actorInvocationRef:'component:actor:'+name,promptDigest:hash(name),transportDigest:hash('transport:'+name)};}

test('native D2 serialized public request chooses among eligible stages and composes the declared correction through native C2 and fresh Evidence',async t=>{
 const env=await fixture(t);let parent=env.envelope;for(let i=0;i<2;i++){const a=await author(env,parent,i);parent=assess(env,a.authored,i).assessed;}
 const rejectedAuthor=await author(env,parent,2),rejected=assess(env,rejectedAuthor.authored,2,'falsified').assessed;
 assert.equal(m.nativeSemanticCommandExecutionLimits(parent),null,'historical old job has no selected limits');
 const consulted=[];const h=await harness(env,{onLeafLookup:ref=>consulted.push(ref)});h.admit(parent,D.nativeAssessorFoldImplementationRef,h.original,'advance',parent.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,h.publicRun.ref);
 assert(revision.isNativeSemanticRevisionIntake(h.intake));h.invocation('intake',h.intake);h.call(R.nativeIntakeImplementationRef,h.intake);
 let reason;const limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000};
 assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r),null);assert.equal(reason,'native_revision_cause_absent');
 const cause=h.admit(rejected,D.nativeAssessorFoldImplementationRef,h.original,'stop',rejected.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,h.publicRun.ref);
 const duplicate=h.admit(rejected,D.nativeAssessorFoldImplementationRef,h.original,'stop','component:duplicate-cause',h.publicRun.ref);
 assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r),null);assert.equal(reason,'native_revision_cause_ambiguous');
 h.states.delete(duplicate.cCall.cCallRef);h.events.splice(h.events.findIndex(e=>e.aggregateId===duplicate.cCall.cCallRef),2);
 h.ancestry=false;assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits),null);h.ancestry=true;
 const prepared=await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits);assert(prepared);assert.equal(prepared.nativeWorksite.construction,null);
 const unrelated=h.admit(rejected,D.nativeAssessorFoldImplementationRef,h.original,'stop','component:unrelated-cause','component:unrelated-run');
 consulted.length=0;
 assert.deepEqual(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits),prepared,'unrelated Run preserves the selected cause and parent');
 assert.equal(consulted.includes(unrelated.cCall.cCallRef),false,'unrelated Result is not reconstructed');
 h.states.delete(unrelated.cCall.cCallRef);h.events.splice(h.events.findIndex(e=>e.aggregateId===unrelated.cCall.cCallRef),2);
 const judgmentIndex=h.events.findIndex(e=>e.eventId===cause.judgment.admissionEventRef),[savedJudgment]=h.events.splice(judgmentIndex,1);
 assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r),null);assert.equal(reason,'native_revision_cause_absent');
 h.events.splice(judgmentIndex,0,savedJudgment);
 h.events.unshift({...savedJudgment,eventId:'component:earlier-unmatched-judgment'});
 assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r),null,'first matching judgment is retained for exact owner checking');
 assert.equal(reason,'native_revision_cause_absent');h.events.shift();
 assert.deepEqual(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits),prepared);
 assert.deepEqual(prepared.nativeWorksite.commandExecutionLimits,limits);assert.equal(h.owner.nativeSemanticRevisionIntakeMatches(h.basis,h.intake,prepared),true);
 h.admit(prepared,R.nativeIntakeImplementationRef);
 h.basis.graphFunction={name:'component:selection-graph',declarations:{'abg.semantic_revision_selection':declaration.declarationRef}};
 h.call(R.selectionImplementationRef,prepared,prepared,{graphFunctionRef:'component:selection-graph'});
 assert.equal(h.jobOwner.authenticateSemanticJobBasis(h.basis).root.basisRef,h.original.basisRef,'selection recovers the actual original root');
 const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:prepared.parent,causes:prepared.causes,mode:'stage_revision',selectedStageRef:declaration.stages[1].declarationRef,
  selectedObligationRefs:[],selectedTargetRefs:[],reasonRef:'component:requirements-falsified',nativePhase:'preconstruction'};
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),true);
 for(const stage of declaration.stages.slice(0,3))assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,{...selection,selectedStageRef:stage.declarationRef}),true,'Intent, Product and Requirements are eligible; the cause does not select one');
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,{...selection,mode:'construction_repair',selectedStageRef:null}),false);
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,{...selection,selectedStageRef:declaration.stages[3].declarationRef}),false,'no future stage authority');
 h.admit(selection,R.selectionImplementationRef);h.basis.declarationGraphFunctions=[h.basis.graphFunction];
 h.call(R.nativeRequestImplementationRef,selection,prepared);
 const request=h.implementation.realizeSemanticRevisionNativeRequest(selection,{semanticStageBasis:h.basis});assert.equal(request.disposition,'success');
 assert.deepEqual(request.resultCandidate.causes,[coordinate(cause)]);assert(request.resultCandidate.nativeWorksite.acquisition);
 const terminalValue=JSON.parse(JSON.stringify(request.resultCandidate));assert(p.isSemanticRevisionRequest(terminalValue));
 assert.deepEqual(terminalValue.selectionChoice,{mode:'stage_revision',selectedStageRef:declaration.stages[1].declarationRef});
 assert.equal(h.owner.semanticJobRevisionResultMatchesBasis(h.basis,selection,terminalValue),true,'request admission checks the owner projection');
 const tampered={...terminalValue,selectionChoice:{mode:'stage_revision',selectedStageRef:declaration.stages[2].declarationRef}};
 assert(p.isSemanticRevisionRequest(tampered));assert.equal(h.owner.semanticJobRevisionResultMatchesBasis(h.basis,selection,tampered),false,'an eligible alternative is not the admitted choice');
 assert.equal(revision.evaluateNativeSemanticRevisionRelation(R.nativeRequestPredicateRef,selection,tampered),false);
 assert.equal(p.isSemanticRevisionRequest({...terminalValue,selectionChoice:{mode:'construction_repair',selectedStageRef:declaration.stages[1].declarationRef}}),false);
 const {selectionChoice:_choice,...historicalRequest}=terminalValue;assert(p.isSemanticRevisionRequest(historicalRequest));
 assert.equal(selectNativeSemanticRevisionStart({product:p,publication:declaredPublication,request:historicalRequest}),null,'missing historical choice is not guessed');
 const next=declaredCorrection(terminalValue);assert.equal(next.start.programRef,'program://odd-glc/native-semantic-revision/from-product@5');
 h.invocation('tampered-correction',tampered);h.basis.graphFunction=declaredCorrection(tampered).projection;h.call(R.projectionImplementationRef,tampered);
 assert.equal(h.owner.projectSemanticJobRevision(h.basis,tampered),null,'even the suffix matching a modified returned choice cannot create authority');
 h.invocation('correction',terminalValue);h.basis.graphFunction=next.projection;h.call(R.projectionImplementationRef,terminalValue);
 assert.equal(h.jobOwner.authenticateSemanticJobBasis(h.basis).root.basisRef,h.original.basisRef,'successor Run does not replace original root');
 let current=h.owner.projectSemanticJobRevision(h.basis,terminalValue);assert(current);assert.deepEqual(current.current.job,env.job);assert.deepEqual(current.current.assets,parent.assets.slice(0,1));
 assert(current.revisionBasis.historicalAssets.some(a=>a.assetRef===rejected.assets.at(-1).assetRef));assert(!current.current.assets.some(a=>a.assessment?.disposition==='falsified'));
 h.basis.graphFunction=declaredCorrection(tampered).projection;assert.equal(h.owner.projectSemanticJobRevision(h.basis,terminalValue),null);h.basis.graphFunction=next.projection;
 h.admit(current,R.projectionImplementationRef);
 for(let i=1;i<4;i++){
  const source=actorSource('author-'+i,current),authored=revision.deriveJobRevisionAsset(current,declaration.stages[i].declarationRef,candidate(current.current,i),source);assert(authored);
  const contract=m.projectSemanticJobActorContract(current.current,declaration.stages[i].declarationRef,'author',current.revisionBasis.retainedTerms,limits);
  assert.deepEqual(contract.design.executionCapacity.selectedLimits,limits);
  const assessmentContract=m.projectSemanticJobActorContract(authored.current,declaration.stages[i].declarationRef,'assessor',authored.revisionBasis.retainedTerms,limits);assert.deepEqual(assessmentContract.design.executionCapacity.selectedLimits,limits);
  if(i===3){const tooLarge=candidate(current.current,i);tooLarge.design.commands[0].timeoutMs=300000;assert.equal(revision.deriveJobRevisionAsset(current,declaration.stages[i].declarationRef,tooLarge,source),null);}
  h.call(R.authorImplementationRef,current,current,{programLocusRef:declaration.stages[i].authorLocusRef});h.admit(authored,R.authorImplementationRef);
  const assessed=revision.deriveJobRevisionAssessment(authored,declaration.stages[i].declarationRef,verdict(authored.current,i),actorSource('assessor-'+i,authored));assert(assessed);
  h.call(R.assessorImplementationRef,authored,authored,{programLocusRef:declaration.stages[i].assessorLocusRef});h.admit(assessed,R.assessorImplementationRef);current=assessed;
 }
 h.basis.graphFunction={declarations:{}};h.call(R.nativeConstructionImplementationRef,current);
 const task=h.owner.projectNativeRevisionConstructionTask(h.basis,current);assert(task);h.admit(task,R.nativeConstructionImplementationRef);
 assert.deepEqual(task.writeRoots,['app/main.mjs','app/check.mjs']);
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),'corrected component application');await writeFile(join(env.canonicalRoot,'app/check.mjs'),'component verifier');
 const constructed=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'component-only construction',gaps:[]},provenance('revision-construction'));
 h.call(g.NATIVE_WORKSPACE_WORK_IDS.implementationRef,task);const nativeState=h.admit(constructed,g.NATIVE_WORKSPACE_WORK_IDS.implementationRef);h.source(constructed,nativeState);
 const executionInput=p.constructRetainedGraphInput(current,constructed);h.call(R.nativeExecutionImplementationRef,executionInput, current);
 const commandTask=h.owner.projectNativeRevisionExecutionTask(h.basis,executionInput);assert(commandTask);h.admit(commandTask,R.nativeExecutionImplementationRef);
 const observed=observationFor(commandTask,0).observation;assert(commands.isNativeWorksiteCommandExecutionObservation(observed));
 h.call(p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,commandTask);h.admit(observed,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef);
 const evidenceInput=p.constructRetainedGraphInput(current,observed);h.call(R.nativeEvidenceImplementationRef,evidenceInput,current);
 const evidence=h.implementation.realizeSemanticRevisionNativeEvidence(evidenceInput,{semanticStageBasis:h.basis});assert.equal(evidence.disposition,'success');
 assert.deepEqual(evidence.resultCandidate.current.evidence.constructionResult,constructed);assert.equal(evidence.resultCandidate.current.worksite,null);
 assert.equal(revision.evaluateNativeSemanticRevisionRelation(R.nativeEvidencePredicateRef,current,evidence.resultCandidate),true);
 h.admit(evidence.resultCandidate,R.nativeEvidenceImplementationRef);
 const authored=revision.deriveJobRevisionAsset(evidence.resultCandidate,declaration.stages[4].declarationRef,candidate(evidence.resultCandidate.current,4),actorSource('evidence-author',evidence.resultCandidate));assert(authored);
 const finished=revision.deriveJobRevisionAssessment(authored,declaration.stages[4].declarationRef,verdict(authored.current,4),actorSource('evidence-assessor',authored));assert(finished);
 assert.equal(semantics.ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS.resolveJudgmentRelation(R.stepPredicateRef).evaluate(finished,finished),true);
 assert.deepEqual(finished.current.job,env.job);assert.deepEqual(finished.current.assets.slice(0,1),parent.assets.slice(0,1));
 assert.equal(m.nativeSemanticCommandExecutionLimits(finished.current),null,'new limits did not rewrite the old job');
 const crossed=structuredClone(observed);crossed.snapshotMembers.pop();assert.equal(revision.deriveNativeRevisionEvidence(current,crossed,coordinate(nativeState),coordinate(nativeState)),null);
 t.diagnostic('Native candidate/assessment and current files are component fixtures; historical admission, prefix ancestry, leaf lookup and command/actor receipts are supplied doubles. No actor, helper, journal, installed Run or S06 qualification.');
});


test('native revision complete publication admits unique carriers and retains the exact factory graph', async () => {
 const [{rawAdmitValue},{validatePublication},{isNativeSemanticRevisionGraphFunction}]=await Promise.all(['validator/raw_admission','validator/validation','gtl/semantic_revision_publication'].map(load));
 const validate=value=>validatePublication(rawAdmitValue(value,'module_publication','contract://abiogenesis/gtl/module-publication@5'),
   value.contributions.map(c=>rawAdmitValue(c,'catalog_contribution','contract://abiogenesis/gtl/catalog-contribution@5')));
 // Bind distinct component artifact coordinates as normal publication materialization does.
 const complete=g.modulePublication({...declaredPublication,artifactDigest:hash('component:archive'),
   productContentDigest:hash('component:content'),productManifestDigest:hash('component:manifest'),
   contributions:declaredPublication.contributions.map(row=>({...row,provenanceRefs:[hash('component:archive'),hash('component:manifest')]}))});
 const graph=complete.graphFunctions.find(row=>row.declarations['abg.semantic_native_revision_construction']==='5.0.0');
 assert.ok(graph);
 const expected=[g.SEMANTIC_REVISION_IDS.envelopeContractRef,'contract://abiogenesis/worksite/retained-graph-input@5',
   ...graph.template.nodes.map(node=>node.term.outputCarrierRef)];
 assert.equal(graph.environment.carries.length,6);
 assert.deepEqual(new Set(graph.environment.carries),new Set(expected));
 assert.equal(isNativeSemanticRevisionGraphFunction(complete,graph),true);
 const validated=validate(complete);
 assert.equal(validated.kind,'publication_validation',JSON.stringify(validated.diagnostics));
 const duplicate=structuredClone(complete),changed=duplicate.graphFunctions.find(row=>row.name===graph.name);
 changed.environment.carries.push(g.SEMANTIC_REVISION_IDS.envelopeContractRef);
 assert.equal(isNativeSemanticRevisionGraphFunction(duplicate,changed),false);
 assert.equal(validate(duplicate).kind,'static_validation_refusal');
});


test('native revision installed descriptor loader discovers every declared leaf through module exports', async () => {
 const namespace=await load('implementation/semantic_revision');
 const publication=g.constructSemanticRevisionModulePublication({productId:p.ABI5_PRODUCT_ID,packageName:p.ABI5_PACKAGE_NAME,
   packageVersion:p.ABI5_PACKAGE_VERSION,artifactDigest:zero,productContentDigest:zero,productManifestDigest:zero});
 const requested=[];
 // Isolate only installed-byte custody; exercise the actual loader and real emitted module namespace.
 // Package verification separately owns the installed-byte correspondence claim.
 const loader=await component('product/implementation_resolution',{'./installed_module.js':{
   loadVerifiedInstalledModule:async (_install,modulePath)=>{requested.push(modulePath);return {kind:'loaded',module:namespace};}
 }});
 const offered=await loader.loadInstalledImplementationDescriptors({packageName:p.ABI5_PACKAGE_NAME,packageVersion:p.ABI5_PACKAGE_VERSION},publication);
 assert(Array.isArray(offered));
 assert.deepEqual(requested,[publication.implementationBindings[0].modulePath]);
 assert.equal(offered.length,publication.implementationBindings.length);
 const fields=['implementationRef','packageName','packageVersion','modulePath','namedSymbol','computeRegime','inputContractRef',
   'outputContractRef','failureContractRef','refusalContractRef'];
 for(const binding of publication.implementationBindings){
   assert.equal(typeof namespace[binding.namedSymbol],'function',binding.namedSymbol);
   const matches=offered.filter(descriptor=>fields.every(key=>descriptor[key]===binding[key]));
   assert.equal(matches.length,1,binding.bindingRef);
   assert.equal(p.isPackagedLeafImplementationDescriptor(matches[0]),true);
 }
});


// SB01 retained shape: one satisfied Product parent, one rejected Requirements
// cause, both child bases of the authentic public source root under W0; setup
// admits W1 but no cover. Values/files below are component substitutions, not
// bootstrap packets. Admission/prefix/installed facts remain explicit lookups.
test('native D2 root-backed binding cover authenticates source ancestry and preserves first refusals', async t=>{
 const env=await fixture(t);let parent=env.envelope;
 for(let i=0;i<2;i++){const a=await author(env,parent,i);parent=assess(env,a.authored,i).assessed;}
 const a=await author(env,parent,2),rejected=assess(env,a.authored,2,'falsified').assessed;
 const {bindingHarness}=await import('../support/d2-binding-harness.mjs'),cover=await bindingHarness();
 cover.events.length=0;cover.artifacts.length=0;cover.bases.clear();
 // Declared ProductSet/lock/W admissions are supplied component premises.
 const {bindingId:ignoredId,bindingDigest:ignoredDigest,admissionEventRef:ignoredEvent,kind,schemaVersion,...oldBody}=env.workspaceBinding;
 const nextBody={...oldBody,productSetId:'component:successor-products',productSetDigest:hash('successor-products'),lockId:'component:successor-lock',lockDigest:hash('successor-lock')};
 const digest=hash(nextBody),currentBinding={kind,schemaVersion,...nextBody,bindingId:'workspace-binding://abiogenesis/'+digest.slice(7),bindingDigest:digest,admissionEventRef:'component:current-W'};
 const {grantRef:ignoredGrant,grantDigest:ignoredGrantDigest,...oldGrant}=env.capabilityGrant,grantBody={...oldGrant,scopeRef:currentBinding.bindingId,scopeDigest:currentBinding.bindingDigest};
 const grantDigest=hash(Object.fromEntries(Object.entries(grantBody).filter(([key])=>!['kind','schemaVersion'].includes(key))));
 const current={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:currentBinding,capabilityGrant:{...grantBody,grantRef:'capability-grant://abiogenesis/'+grantDigest.slice(7),grantDigest}};
 for(const w of [env.workspaceBinding,currentBinding]){
  const e=cover.event('public_operation_artifact_admitted',{}, {eventId:w.admissionEventRef,aggregateId:w.bindingId});
  const {kind:ignored,admissionEventRef,...body}=w;
  cover.artifacts.push({operationId:'abg.operation.workspace.bind',authorityScopeRef:w.bindingId,authorityScopeDigest:w.bindingDigest,admissionEventRef,admissionOrdinal:e.admissionOrdinal,artifact:{kind:'workspace_binding_candidate',...body},workspaceAuthorityBasis:env.workspaceAuthorityBasis});
 }
 let coverCalls=0;
 const h=await harness(env,{current,cover:(_prefix,before,after,bases)=>{coverCalls++;return cover.owner.projectWorksiteRevisionBindingCover(cover.snapshot(),before,after,bases);}});
 const root=h.original,mid={...root,basisRef:'component:intermediate',basisDigest:hash('intermediate'),parentExecutionBasisRef:root.basisRef,admissionEventRef:'component:mid-admission'};
 const parentBasis={...mid,basisRef:'component:Product-child',basisDigest:hash('Product-child'),parentExecutionBasisRef:mid.basisRef,admissionEventRef:'component:parent-admission'};
 const causeBasis={...mid,basisRef:'component:Requirements-child',basisDigest:hash('Requirements-child'),parentExecutionBasisRef:mid.basisRef,admissionEventRef:'component:cause-admission'};
 for(const b of [root,mid,parentBasis,causeBasis]){h.bases.set(b.basisRef,b);cover.bases.set(b.basisRef,b);cover.event('basis_admitted',{basisRef:b.basisRef,basisDigest:b.basisDigest},{eventId:b.admissionEventRef});}
 h.admit(parent,D.nativeAssessorFoldImplementationRef,parentBasis,'advance',parent.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,h.publicRun.ref);
 h.admit(rejected,D.nativeAssessorFoldImplementationRef,causeBasis,'blocked',rejected.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,h.publicRun.ref);
 h.invocation('crossed-intake',h.intake);h.call(R.nativeIntakeImplementationRef,h.intake);
 const limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000};let reason;
 const prepare=()=>h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r);
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');
 const failed=await h.implementation.realizeSemanticRevisionNativeIntake(h.intake,{semanticStageBasis:h.basis});
 assert.equal(failed.resultCandidate.failureClass,'native_revision_binding_cover_absent');
 assert.equal(failed.diagnosticRef,'diagnostic://abiogenesis/semantic-revision/native_revision_binding_cover_absent@5');
 // Reuse the existing witness-event constructor and complete cover owner.
 // Public operation authority/basis/install lookups are assumptions, not a real witness admission.
 const rootWitness=cover.cover(env,current,root,{name:'public-root-cover'});
 const prepared=await prepare();assert(prepared);assert.equal(prepared.nativeWorksite.construction,null);
 assert.equal(prepared.nativeWorksite.context.workspaceBindingIdentity,currentBinding.bindingId);
 assert.deepEqual(prepared.parent.cCallRef,parent.assets.at(-1).assessment.source.nativeWork.adapterCCallRef);
 assert.equal(h.owner.nativeSemanticRevisionIntakeMatches(h.basis,h.intake,prepared),true);
 const beforeCalls=coverCalls;parentBasis.parentExecutionBasisRef='component:unrelated-root';
 h.bases.set('component:unrelated-root',{...root,basisRef:'component:unrelated-root'});
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_source_root_ancestry_mismatch');assert.equal(coverCalls,beforeCalls);
 parentBasis.parentExecutionBasisRef=mid.basisRef;
 const priorDigest=causeBasis.workspaceBindingDigest;causeBasis.workspaceBindingDigest=hash('crossed-child-W');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_source_root_ancestry_mismatch');causeBasis.workspaceBindingDigest=priorDigest;
 const witnessBefore=rootWitness.payload.beforeDigest;rootWitness.payload.beforeDigest=hash('wrong-W0');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');rootWitness.payload.beforeDigest=witnessBefore;
 const rootSubject=rootWitness.payload.subjectRef;rootWitness.payload.subjectRef='component:unrelated-root';
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');rootWitness.payload.subjectRef=rootSubject;
 cover.events.splice(cover.events.findIndex(e=>e.eventId===rootWitness.eventId),1);
 cover.cover(env,current,parentBasis,{name:'preserved-child-cover'});assert(await prepare(),'existing child-basis path remains');
 const cause=[...h.states.values()].find(s=>s.result.value===rejected);cause.judgment.judgment='advance';
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_cause_absent');cause.judgment.judgment='blocked';
 const wrongInput={...h.intake,sourceRun:{...h.intake.sourceRun,digest:hash('wrong-public-Run')}};h.call(R.nativeIntakeImplementationRef,wrongInput);
 assert.equal(await h.owner.prepareNativeSemanticRevisionIntake(h.basis,wrongInput,limits,r=>reason=r),null);assert.equal(reason,'native_revision_source_run_mismatch');
 h.call(R.nativeIntakeImplementationRef,h.intake);assert(await prepare());
 const rubric=join(env.canonicalRoot,'assets/rubric.json'),before=await readFile(rubric);await writeFile(rubric,'changed protected current context');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_current_context_mismatch');await writeFile(rubric,before);assert(await prepare());
});


test('native D2 rejected assessor-only correction follows exact conserved requests across Runs and bindings',async t=>{
 const env=await fixture(t);let accepted=env.envelope;
 for(let i=0;i<3;i++){const a=await author(env,accepted,i);accepted=assess(env,a.authored,i).assessed;}
 const stage=declaration.stages[3],limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000};
 function operating(name){
  const {bindingId,bindingDigest,admissionEventRef,kind,schemaVersion,...old}=env.workspaceBinding;
  const body={...old,productSetId:'component:products:'+name,productSetDigest:hash(['products',name]),lockId:'component:lock:'+name,lockDigest:hash(['lock',name])},digest=hash(body);
  const workspaceBinding={kind,schemaVersion,...body,bindingId:'workspace-binding://abiogenesis/'+digest.slice(7),bindingDigest:digest,admissionEventRef:'component:W:'+name};
  const {grantRef,grantDigest,kind:gKind,schemaVersion:gVersion,...grant}=env.capabilityGrant;
  const next={...grant,scopeRef:workspaceBinding.bindingId,scopeDigest:digest},gDigest=hash(next);
  return {workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,
   capabilityGrant:{kind:gKind,schemaVersion:gVersion,...next,grantRef:'capability-grant://abiogenesis/'+gDigest.slice(7),grantDigest:gDigest}};
 }
 const authorW=operating('author'),assessmentW=operating('assessment'),currentW=operating('new-intake');
 const {bindingHarness}=await import('../support/d2-binding-harness.mjs'),cover=await bindingHarness();
 cover.events.length=0;cover.artifacts.length=0;cover.bases.clear();
 const workspaces=[env,authorW,assessmentW,currentW];
 for(const operating of workspaces){const w=operating.workspaceBinding;
  const e=cover.event('public_operation_artifact_admitted',{}, {eventId:w.admissionEventRef,aggregateId:w.bindingId});
  const {kind,admissionEventRef,...body}=w;
  cover.artifacts.push({operationId:'abg.operation.workspace.bind',authorityScopeRef:w.bindingId,authorityScopeDigest:w.bindingDigest,
   admissionEventRef,admissionOrdinal:e.admissionOrdinal,artifact:{kind:'workspace_binding_candidate',...body},workspaceAuthorityBasis:env.workspaceAuthorityBasis});
 }
 let invalidated=false;const consulted=[],coverCalls=[];
 const h=await harness(env,{current:currentW,onLeafLookup:ref=>consulted.push(ref),invalidated:()=>invalidated,
  historicalEnvironment:(_prefix,c)=>{const prior=workspaces.find(w=>w.workspaceBinding.bindingId===c.ref&&w.workspaceBinding.bindingDigest===c.digest);
   return prior?{kind:'exact_prefix_workspace_environment',...prior,productInstalls:[]}:null;},
  cover:(_prefix,before,after,bases)=>{coverCalls.push({before,after,bases});return cover.owner.projectWorksiteRevisionBindingCover(cover.snapshot(),before,after,bases);}});
 const predecessor=h.admit(accepted,D.nativeAssessorFoldImplementationRef,h.original,'advance',accepted.assets.at(-1).assessment.source.nativeWork.adapterCCallRef,h.publicRun.ref);
 // Historical intake/selection admissions are explicit component premises.
 // This fixture exercises their exact reuse, not operational failure discovery.
 async function recordedRequest(name,parent,operating,sourceRun,role){
  const source={...h.intake,sourceRun};h.invocation(name+'-intake',source,operating);h.call(R.nativeIntakeImplementationRef,source);
  const cause={cCallRef:'component:old-refusal:'+name,resultRef:'component:refusal-result:'+name,resultDigest:hash(['refusal',name]),
   resultAdmissionEventRef:'component:refusal-event:'+name,judgmentEventRef:'component:refusal-judgment:'+name};
  const context=await ops.observeWorksiteContext({...operating,readRoots:env.job.worksiteScope.readRoots,maxFiles:declaration.bounds.maxContextFiles,maxBytes:declaration.bounds.maxContextBytes});
  const prepared={kind:'semantic_revision_selection_input',schemaVersion:'5.0.0',parent:coordinate(parent),causes:[cause],currentWorksite:null,
   nativeWorksite:{kind:'native_semantic_revision_worksite',...operating,context,commandExecutionLimits:limits,construction:null,source}};
  assert(revision.isSemanticRevisionSelectionInput(prepared));const acquisition=h.admit(prepared,R.nativeIntakeImplementationRef);
  const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:prepared.parent,causes:prepared.causes,mode:'stage_revision',
   selectedStageRef:stage.declarationRef,selectedObligationRefs:[],selectedTargetRefs:[],reasonRef:'component:operational:'+name,nativePhase:'preconstruction'};
  h.call(R.selectionImplementationRef,prepared);const selected=h.admit(selection,R.selectionImplementationRef);
  const request={kind:'semantic_revision_request',schemaVersion:'5.0.0',parent:prepared.parent,causes:prepared.causes,selection:coordinate(selected),
   selectionChoice:{mode:'stage_revision',selectedStageRef:stage.declarationRef,entryRole:role},currentWorksite:null,
   nativeWorksite:{...prepared.nativeWorksite,acquisition:coordinate(acquisition)}};
  assert(revision.isSemanticRevisionRequest(request));return {request,selection,acquisition};
 }
 const first=await recordedRequest('author',predecessor,authorW,h.publicRun,'author');
 const authorRun=h.invocation('author',first.request,authorW);
 const projected=revision.deriveSemanticJobRevision(accepted,first.request,first.selection,null,null,[],undefined,stage,'author');assert(projected);
 const pending=revision.deriveJobRevisionAsset(projected,stage.declarationRef,candidate(projected.current,3),actorSource('conserved-design',projected));assert(pending);
 h.call(R.authorImplementationRef,projected);
 const authored=h.admit(pending,R.authorImplementationRef,h.current.execution,'advance',pending.current.assets.at(-1).source.cCallRef,authorRun.run.ref);
 const second=await recordedRequest('assessment',authored,assessmentW,authorRun.run,'assessor');
 const sourceRun=h.invocation('assessment',second.request,assessmentW);
 const resumed=revision.deriveSemanticJobRevision(pending,second.request,second.selection,null,null,[],undefined,stage,'assessor');assert(resumed);
 h.call(R.projectionImplementationRef,second.request);h.admit(resumed,R.projectionImplementationRef);
 const rejected=revision.deriveJobRevisionAssessment(resumed,stage.declarationRef,verdict(resumed.current,3,'falsified'),actorSource('rejected-design',resumed));assert(rejected);
 h.call(R.assessorImplementationRef,resumed);
 const cause=h.admit(rejected,R.assessorImplementationRef,h.current.execution,'blocked',rejected.current.assets.at(-1).assessment.source.cCallRef,sourceRun.run.ref);
 assert.deepEqual(rejected.current.assets.slice(0,-1),accepted.assets);
 assert.deepEqual(rejected.current.assets.at(-1).source,pending.current.assets.at(-1).source);
 assert.equal([...h.states.values()].filter(s=>s.cCall.runId===sourceRun.run.ref&&s.judgment.judgment==='advance'&&
  (s.result.value.current?.assets??[]).every(a=>a.assessment?.disposition==='satisfied')).length,0,'source Run has no accepted predecessor leaf');
 const input={...h.intake,sourceRun:sourceRun.run};h.invocation('new-intake',input,currentW);h.call(R.nativeIntakeImplementationRef,input);
 for(const b of [h.original,authorRun.root,sourceRun.root,...h.bases.values()])if(!cover.bases.has(b.basisRef)){
  cover.bases.set(b.basisRef,b);cover.event('basis_admitted',{basisRef:b.basisRef,basisDigest:b.basisDigest},{eventId:b.admissionEventRef});
 }
 let reason;const prepare=()=>h.owner.prepareNativeSemanticRevisionIntake(h.basis,input,limits,r=>reason=r);
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent','exact ancestry gets as far as the new cover');
 assert.equal(coverCalls.at(-1).before.bindingId,assessmentW.workspaceBinding.bindingId,'new cover starts at failed source Run, not older author/original W');
 const witness=cover.cover(assessmentW,currentW,sourceRun.root,{name:'latest-source-root'});
 const prepared=await prepare();assert(prepared,reason);
 assert.deepEqual(prepared.parent,coordinate(predecessor));assert.deepEqual(prepared.causes,[coordinate(cause)]);
 assert.equal(prepared.nativeWorksite.context.workspaceBindingIdentity,currentW.workspaceBinding.bindingId);
 assert.equal(h.owner.nativeSemanticRevisionIntakeMatches(h.basis,input,prepared),true);
 const duplicate=h.admit(accepted,D.nativeAssessorFoldImplementationRef,h.original,'advance','component:equal-value-wrong-producer','component:unrelated-run');
 consulted.length=0;assert.deepEqual(await prepare(),prepared);assert(!consulted.includes(duplicate.cCall.cCallRef));
 for(const required of [predecessor,authored,first.acquisition,second.acquisition]){
  h.states.delete(required.cCall.cCallRef);assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');h.states.set(required.cCall.cCallRef,required);
 }
 const impl=second.acquisition.cCall.implementationRef;second.acquisition.cCall.implementationRef=R.projectionImplementationRef;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');second.acquisition.cCall.implementationRef=impl;
 const acquiredBasis=h.bases.get(first.acquisition.cCall.basisId),raw=acquiredBasis.rawInputValue;
 acquiredBasis.rawInputValue={...raw,sourceRun:{...raw.sourceRun,ref:'component:wrong-source'}};
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');acquiredBasis.rawInputValue=raw;
 const rootInput=authorRun.root.rawInputValue;authorRun.root.rawInputValue={...rootInput,parent:coordinate(duplicate)};
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');authorRun.root.rawInputValue=rootInput;
 const acquiredEvent=h.events.find(e=>e.eventId===second.acquisition.result.admissionEventRef),oldOrdinal=acquiredEvent.admissionOrdinal;
 acquiredEvent.admissionOrdinal=h.events.find(e=>e.eventId===cause.result.admissionEventRef).admissionOrdinal+1;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');acquiredEvent.admissionOrdinal=oldOrdinal;
 const causeBasis=h.bases.get(cause.cCall.basisId),oldRoot=causeBasis.parentExecutionBasisRef;causeBasis.parentExecutionBasisRef=authorRun.root.basisRef;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_source_root_ancestry_mismatch');causeBasis.parentExecutionBasisRef=oldRoot;
 const witnessSubject=witness.payload.subjectRef;witness.payload.subjectRef=authorRun.root.basisRef;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');witness.payload.subjectRef=witnessSubject;
 invalidated=true;assert.equal(await prepare(),null);assert.equal(reason,'native_revision_source_invalidated');invalidated=false;
 const rubric=join(env.canonicalRoot,'assets/rubric.json'),bytes=await readFile(rubric);await writeFile(rubric,'changed after semantic refusal');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_current_context_mismatch');await writeFile(rubric,bytes);
 assert.deepEqual(await prepare(),prepared);
 // The admitted acquisition continues through the existing selection/request
 // and Product projection, retaining original job, bindings and rejected asset.
 h.admit(prepared,R.nativeIntakeImplementationRef);
 h.basis.graphFunction={name:'component:repeat-selection',declarations:{'abg.semantic_revision_selection':declaration.declarationRef}};
 h.call(R.selectionImplementationRef,prepared,prepared,{graphFunctionRef:'component:repeat-selection'});
 const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:prepared.parent,causes:prepared.causes,mode:'stage_revision',selectedStageRef:stage.declarationRef,
  selectedObligationRefs:p.projectSemanticJobBindings(accepted).map(v=>v.binding.obligationRef),selectedTargetRefs:[],reasonRef:'component:new-semantic-refusal',nativePhase:'preconstruction'};
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),true);h.admit(selection,R.selectionImplementationRef);
 h.basis.declarationGraphFunctions=[h.basis.graphFunction];h.call(R.nativeRequestImplementationRef,selection,prepared);
 const request=h.owner.projectNativeSemanticRevisionRequest(h.basis,selection);assert(request);
 assert.deepEqual(request.selectionChoice,{mode:'stage_revision',selectedStageRef:stage.declarationRef});
 h.invocation('new-correction',request,currentW);h.basis.graphFunction=declaredCorrection(request).projection;h.call(R.projectionImplementationRef,request);
 const successor=h.owner.projectSemanticJobRevision(h.basis,request);assert(successor);
 assert.deepEqual(successor.current.job,env.job);assert.deepEqual(successor.current.basis,accepted.basis);
 assert.deepEqual(successor.current.assets,accepted.assets);assert.deepEqual(successor.current.bindingVersions,accepted.bindingVersions);
 assert(successor.revisionBasis.historicalAssets.some(a=>hash(a)===hash(rejected.current.assets.at(-1))));
 t.diagnostic('Component proof: exact historical admission tables, real ancestry/acquisition reuse, binding-cover algorithm and current physical context; no installed/provider or original operational-failure admission claim.');
});

// These are Product value premises only. Actual failed-call input and producer
// admission is exercised in t287-calculus-state-transfer, under one real basis.
const operationalEventContractDigest=(await load('abg/event_store')).ROOT_EVENT_CONTRACT_DIGEST;
function operationalRevisionValues(env,parent,stage,role){
 const valueCoordinate=key=>({cCallRef:'component:'+key,resultRef:'component:result:'+key,resultDigest:hash(key),
  resultAdmissionEventRef:'component:result-event:'+key,judgmentEventRef:'component:judgment:'+key});
 const body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///component/no-journal',prefixLength:0,prefixDigest:hash('prefix'),
  storeIdentity:{device:1,inode:1,eventContractDigest:operationalEventContractDigest}};
 const source={kind:'native_semantic_revision_intake',schemaVersion:'5.0.0',sourceRun:{ref:'component:run',digest:hash('run')},
  sourcePrefix:{...body,coordinateDigest:hash(body)}};
 const prior=parent.current??parent;
 const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:valueCoordinate('parent'),causes:[valueCoordinate('cause')],
  mode:'stage_revision',selectedStageRef:stage.declarationRef,selectedObligationRefs:[],selectedTargetRefs:[],
  reasonRef:'component:operational-preparation-pressure',nativePhase:'preconstruction'};
 const request={kind:'semantic_revision_request',schemaVersion:'5.0.0',parent:selection.parent,causes:selection.causes,
  selection:valueCoordinate('selection'),selectionChoice:{mode:'stage_revision',selectedStageRef:stage.declarationRef,entryRole:role},currentWorksite:null,
  nativeWorksite:{kind:'native_semantic_revision_worksite',workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
   capabilityGrant:env.capabilityGrant,context:prior.context,commandExecutionLimits:{inactivityTimeoutMs:300000,absoluteTimeoutMs:900000},construction:null,source}};
 assert(revision.isSemanticRevisionRequest(request));assert(revision.isSemanticRevisionSelection(selection));
 return {request,selection};
}

test('Product author recovery values retain accepted stages under an explicit failed-stage premise',async t=>{
 const env=await fixture(t);let parent=env.envelope;
 for(let i=0;i<3;i++){const a=await author(env,parent,i);parent=assess(env,a.authored,i).assessed;}
 const stage=declaration.stages[parent.assets.length],{request,selection}=operationalRevisionValues(env,parent,stage,'author');
 const current=revision.deriveSemanticJobRevision(parent,request,selection,null,null,[],undefined,stage);assert(current);
 assert.deepEqual(current.current.assets,parent.assets);assert.deepEqual(current.current.job,parent.job);
 assert.equal(current.current.assets.at(-1).assessment.disposition,'satisfied');
 assert.deepEqual(current.revisionBasis.retainedBindings,p.projectSemanticJobBindings(parent).map(row=>row.binding));
 assert.equal(declaredCorrection(request).start.programRef,'program://odd-glc/native-semantic-revision/from-design@5');
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null),null,'request cannot establish operational pressure');
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null,null,[],undefined,declaration.stages[0]),null);
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null,null,parent.assets,undefined,stage),null);
 assert.equal(revision.deriveSemanticJobRevision(parent,{...request,nativeWorksite:{...request.nativeWorksite,construction:request.parent}},
  {...selection,nativePhase:'postconstruction'},null,null,[],undefined,stage),null);
 t.diagnostic('Product derivation only: supplied failed-stage premise and value coordinates; no intake, call, prefix or producer admission claim.');
});

test('Product assessor recovery values preserve pending Design and select assessment-first without reauthoring',async t=>{
 const retainedDirectory=process.env.ABI5_NATIVE38_DIRECTORY;
 const env0=await fixture(t);let parent=env0.envelope;
 for(let i=0;i<3;i++){const a=await author(env0,parent,i);parent=assess(env0,a.authored,i).assessed;}
 const stage=declaration.stages[3];
 parent=m.deriveSemanticJobAsset(parent,stage.declarationRef,candidate(parent,3),actorSource('pending-design',parent));assert(parent);
 let retained,publication=declaredPublication,env=env0;
 if(retainedDirectory){
  retained=JSON.parse(await readFile(join(retainedDirectory,'first-cause-suffix/87788-c_call_result_admitted.jsonl'),'utf8')).payload;
  assert.equal(hash(retained.value),retained.valueDigest);parent=retained.value;
  assert.equal(parent.current.assets.at(-1).assetRef,'semantic-job-asset://abiogenesis/75ddeb06787466432665bddc2f5b51e6d6c29cdeede6b894a1a60fadbdaad5df');
  const old=JSON.parse(await readFile(join(process.env.ABI5_NATIVE_D2_DESIGN_DIRECTORY,'publication-01/prospective-publication.json'),'utf8'));
  publication=g.modulePublication({...declaredPublication,semanticJobLifecycle:old.semanticJobLifecycle});
  env={...env0,...parent.revisionBasis.request.nativeWorksite};
 }
 const prior=parent.current??parent,pending=prior.assets.at(-1),{request,selection}=operationalRevisionValues(env,parent,stage,'assessor');
 const successor=revision.deriveSemanticJobRevision(parent,request,selection,null,null,[],undefined,stage,'assessor');assert(successor);
 const next=declaredCorrection(request,publication);
 assert.equal(next.start.programRef,'program://odd-glc/native-semantic-revision/from-design-assessment@5');
 const whole=publication.graphFunctions.find(g=>g.name===next.start.graphFunctionRef),second=whole.template.nodes[1];
 const assessmentGraph=publication.graphFunctions.find(g=>g.name===second.term.graphFunctionRef);
 const leaves=assessmentGraph.template.nodes.flatMap(n=>g.cLeafTerms(n.term));assert.equal(leaves.length,1);assert.equal(leaves[0].programLocusRef,stage.assessorLocusRef);
 assert(!whole.template.nodes.some(n=>n.term.graphFunctionRef==='graph-function://odd-glc/native-semantic-revision/stage-3@5'));
 assert.deepEqual(successor.current.assets,prior.assets);assert.deepEqual(successor.current.job,prior.job);assert.deepEqual(successor.current.bindingVersions,prior.bindingVersions);
 assert.equal(successor.current.assets.at(-1).assessment,null);assert(!successor.revisionBasis.preservedAssetRefs.includes(pending.assetRef));
 for(const asset of [...(parent.revisionBasis?.historicalAssets??[]),...prior.assets])assert(successor.revisionBasis.historicalAssets.some(a=>hash(a)===hash(asset)));
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null),null);
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null,null,[],undefined,stage),null,'author premise cannot confer assessor entry');
 const missingRole={...request,selectionChoice:{mode:'stage_revision',selectedStageRef:stage.declarationRef}};
 assert.equal(revision.deriveSemanticJobRevision(parent,missingRole,selection,null,null,[],undefined,stage,'assessor'),null);
 const bad=structuredClone(prior);bad.assets.at(-1).assessment={disposition:'satisfied'};
 assert.equal(revision.deriveSemanticJobRevision(bad,request,selection,null,null,[],undefined,stage,'assessor'),null);
 for(const disposition of ['satisfied','falsified','indeterminate']){
  const out=revision.deriveJobRevisionAssessment(successor,stage.declarationRef,verdict(successor.current,3,disposition),actorSource('assessment-'+disposition,successor));assert(out,disposition);
  assert.deepEqual(out.current.assets.at(-1).candidate,pending.candidate);assert.deepEqual(out.current.assets.at(-1).source,pending.source);
  assert.equal(semantics.ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS.resolveJudgmentRelation(R.stepPredicateRef).evaluate(successor,out),disposition==='satisfied');
 }
 if(retained&&process.env.ABI5_ASSESSMENT_SUCCESSOR_OUTPUT)await writeFile(process.env.ABI5_ASSESSMENT_SUCCESSOR_OUTPUT,JSON.stringify(successor)+'\n');
 t.diagnostic(JSON.stringify({scope:'Product values and declared assessment-first graph only; operational role supplied, no intake or runtime admission claim',
  retainedInput:retained?hash(parent):null,successorDigest:hash(successor),asset:pending.assetRef,assets:successor.current.assets.length,program:next.start.programRef}));
});

test('native Evidence preparation recovery conserves its exact folded producer through intake and the declared Evidence-only suffix',async t=>{
 const env=await fixture(t);let accepted=env.envelope;
 for(let i=0;i<3;i++){const a=await author(env,accepted,i);accepted=assess(env,a.authored,i).assessed;}
 const priorValues=operationalRevisionValues(env,accepted,declaration.stages[3],'author');
 let prior=revision.deriveSemanticJobRevision(accepted,priorValues.request,priorValues.selection,null,null,[],undefined,declaration.stages[3]);assert(prior);
 prior=revision.deriveJobRevisionAsset(prior,declaration.stages[3].declarationRef,candidate(prior.current,3),actorSource('completed-design',prior));assert(prior);
 prior=revision.deriveJobRevisionAssessment(prior,declaration.stages[3].declarationRef,verdict(prior.current,3),actorSource('completed-design-assessment',prior));assert(prior);
 const {bindingHarness}=await import('../support/d2-binding-harness.mjs'),cover=await bindingHarness();
 cover.events.length=0;cover.artifacts.length=0;cover.bases.clear();
 const {bindingId:oldId,bindingDigest:oldDigest,admissionEventRef:oldEvent,kind,schemaVersion,...oldBody}=env.workspaceBinding;
 const nextBody={...oldBody,productSetId:'component:evidence-successor-products',productSetDigest:hash('evidence-products'),lockId:'component:evidence-successor-lock',lockDigest:hash('evidence-lock')};
 const bindingDigest=hash(nextBody),workspaceBinding={kind,schemaVersion,...nextBody,bindingId:'workspace-binding://abiogenesis/'+bindingDigest.slice(7),bindingDigest,admissionEventRef:'component:evidence-current-W'};
 const {grantRef:oldGrantRef,grantDigest:oldGrantDigest,...oldGrant}=env.capabilityGrant,grantBody={...oldGrant,scopeRef:workspaceBinding.bindingId,scopeDigest:workspaceBinding.bindingDigest};
 const grantDigest=hash(Object.fromEntries(Object.entries(grantBody).filter(([key])=>!['kind','schemaVersion'].includes(key))));
 const current={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding,capabilityGrant:{...grantBody,grantRef:'capability-grant://abiogenesis/'+grantDigest.slice(7),grantDigest}};
 for(const w of [env.workspaceBinding,workspaceBinding]){
  const event=cover.event('public_operation_artifact_admitted',{}, {eventId:w.admissionEventRef,aggregateId:w.bindingId});
  const {kind:ignored,admissionEventRef,...body}=w;
  cover.artifacts.push({operationId:'abg.operation.workspace.bind',authorityScopeRef:w.bindingId,authorityScopeDigest:w.bindingDigest,admissionEventRef,admissionOrdinal:event.admissionOrdinal,artifact:{kind:'workspace_binding_candidate',...body},workspaceAuthorityBasis:env.workspaceAuthorityBasis});
 }
 let selectedInput,invalidated=false;
 const h=await harness(env,{current,currentInput:()=>selectedInput,invalidated:()=>invalidated,
  cover:(_prefix,before,after,bases)=>cover.owner.projectWorksiteRevisionBindingCover(cover.snapshot(),before,after,bases)});
 const source=h.invocation('completed-native-work',priorValues.request);h.intake.sourceRun=source.run;
 const task=revision.constructNativeRevisionConstructionTask(prior);
 await mkdir(join(env.canonicalRoot,'app'));await writeFile(join(env.canonicalRoot,'app/main.mjs'),'completed application');await writeFile(join(env.canonicalRoot,'app/check.mjs'),'completed verifier');
 const constructed=n.constructNativeWorkspaceWorkObservation(task,await env.observe(),{summary:'component construction already completed',gaps:[]},provenance('completed-native-construction'));
 h.call(g.NATIVE_WORKSPACE_WORK_IDS.implementationRef,task);const construction=h.admit(constructed,g.NATIVE_WORKSPACE_WORK_IDS.implementationRef);h.source(constructed,construction);
 const commandTask=revision.constructNativeRevisionExecutionTask(prior,constructed),observation=observationFor(commandTask,0).observation;
 h.call(p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,commandTask);const execution=h.admit(observation,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef);
 const evidence=revision.deriveNativeRevisionEvidence(prior,observation,coordinate(construction),coordinate(execution));assert(evidence);
 const foldRef='component:evidence-workflow',childGraph='graph-function://component/evidence-fold',closure='contract://component/evidence-closure';
 const outer={runId:source.run.ref,basisId:source.root.basisRef,graphCallId:'component:outer-graph',frameId:'component:outer-frame',aggregateId:foldRef};
 h.event('c_call_opened',{callClass:'workflow',childGraphFunctionRef:childGraph},outer);
 const fibre=h.event('c_call_fibre_selected',{childGraphFunctionRef:childGraph},outer);
 h.call(R.nativeEvidenceImplementationRef,p.constructRetainedGraphInput(prior,observation),prior);
 const producerBasis=h.current.execution;
 Object.assign(producerBasis,{parentCCallRef:foldRef,graphFunctionRef:childGraph,closureContractRef:closure});
 producerBasis.admissionEventRef=h.event('basis_admitted',{}, {runId:source.run.ref,causationEventRefs:[fibre.eventId]}).eventId;
 const inner={runId:source.run.ref,basisId:producerBasis.basisRef,graphCallId:'component:evidence-child-graph',frameId:'component:evidence-child-frame',aggregateId:h.current.call.cCallRef};
 h.event('c_call_opened',{callClass:'leaf'},inner);
 const producer=h.admit(evidence,R.nativeEvidenceImplementationRef);
 function exactResult(state,scope){
  const result=h.events.find(e=>e.eventId===state.result.admissionEventRef),judgment=h.events.find(e=>e.eventId===state.judgment.admissionEventRef);
  Object.assign(result,scope);Object.assign(result.payload,{resultClass:state.result.resultClass,valueDigest:hash(state.result.value)});
  Object.assign(judgment,scope,{causationEventRefs:[result.eventId]});Object.assign(judgment.payload,{resultRef:state.result.resultRef,resultDigest:state.result.resultDigest,judgment:state.judgment.judgment,judgmentRef:'component:judgment:'+state.cCall.cCallRef});
  return {result,judgment};
 }
 const leaf=exactResult(producer,inner);
 h.event('terminal_reached',{closureRef:'component:closed-evidence',closureContractRef:closure,resultRef:producer.result.resultRef,judgmentRef:leaf.judgment.payload.judgmentRef},inner);
 const closed=h.event('graph_call_closed',{closureContractRef:closure},inner);
 const foldback=h.event('child_foldback_admitted',{parentCCallRef:foldRef,childDisposition:'closed',childExecutionBasisRef:producerBasis.basisRef,
  childExecutionBasisDigest:producerBasis.basisDigest,childGraphCallId:inner.graphCallId,childTerminalEventRef:closed.eventId,childClosureRef:'component:closed-evidence',
  childResultRef:producer.result.resultRef,childResultDigest:producer.result.resultDigest,childJudgmentRef:leaf.judgment.payload.judgmentRef,outputDigest:hash(evidence)},
  {...outer,causationEventRefs:[fibre.eventId,closed.eventId]});
 const folded=h.admit(evidence,'component:workflow',source.root,'advance',foldRef,source.run.ref);exactResult(folded,outer);
 selectedInput={inputRef:folded.result.resultRef,inputDigest:hash(evidence),value:evidence};
 assert.equal(h.inputOwner.projectWorksiteInputLeafResultAtPrefix(h.prefix,selectedInput.inputRef,selectedInput.inputDigest).eventId,producer.result.admissionEventRef);
 const stage=declaration.stages[4],stageGraph=declaredPublication.graphFunctions.find(g=>g.declarations['abg.semantic_revision_stage']===stage.declarationRef);
 h.basis.declarationGraphFunctions=[stageGraph];
 h.call(R.authorImplementationRef,evidence,evidence,{programLocusRef:stage.authorLocusRef,graphFunctionRef:stageGraph.name});
 Object.assign(h.current.execution,{graphFunctionRef:stageGraph.name,graphFunctionDigest:hash(stageGraph)});
 const {constructRuntimeFailureDiagnosticRef}=await load('abg/runtime_failure');
 const diagnosticRef=constructRuntimeFailureDiagnosticRef({message:JSON.stringify({kind:'native_instruction_assembly_refusal',role:'author',policy:stage.assembly.ruleRef,cause:'declared_bound_overflow',unresolvedRefs:['component:maxPromptBytes']}),messageTruncated:false});
 const failureEvidence=h.event('c_call_evidenced',{evidenceRef:'component:undispatched-evidence-author',evidenceClass:'undispatched_owner_refusal',ownerObservation:{stage:'preparation',reason:'thrown',errorClass:'TypeError',diagnosticRef}},{aggregateId:h.current.call.cCallRef});
 const failure=h.admit({kind:'semantic_stage_failure',schemaVersion:'5.0.0',failureClass:'implementation_exception'},R.authorImplementationRef,h.current.execution,'blocked',h.current.call.cCallRef,source.run.ref,'failure');
 Object.assign(failure.cCall,{regime:'F_P',programLocusRef:stage.authorLocusRef});failure.result.evidenceRefs=[failureEvidence.payload.evidenceRef];
 for(const b of h.bases.values())cover.bases.set(b.basisRef,b);
 cover.event('basis_admitted',{basisRef:source.root.basisRef,basisDigest:source.root.basisDigest},{eventId:source.root.admissionEventRef});
 h.invocation('evidence-recovery-intake',h.intake,current);h.call(R.nativeIntakeImplementationRef,h.intake);
 let reason;const limits={inactivityTimeoutMs:300000,absoluteTimeoutMs:900000},prepare=()=>h.owner.prepareNativeSemanticRevisionIntake(h.basis,h.intake,limits,r=>reason=r);
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');
 const witness=cover.cover(env,current,source.root,{name:'evidence-root-cover'});
 const beforeDigest=witness.payload.beforeDigest;witness.payload.beforeDigest=hash('wrong-before-W');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_binding_cover_absent');witness.payload.beforeDigest=beforeDigest;
 const prepared=await prepare();assert(prepared,reason);assert.deepEqual(prepared.parent,coordinate(producer));assert.deepEqual(prepared.nativeWorksite.construction,coordinate(construction));
 assert.equal(prepared.nativeWorksite.context.workspaceBindingIdentity,workspaceBinding.bindingId);assert.equal(h.owner.nativeSemanticRevisionIntakeMatches(h.basis,h.intake,prepared),true);
 const oldChild=foldback.payload.childResultRef;foldback.payload.childResultRef=folded.result.resultRef;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_cause_input_absent');foldback.payload.childResultRef=oldChild;
 const oldRef=selectedInput.inputRef;selectedInput.inputRef='component:absent-result';assert.equal(await prepare(),null);assert.equal(reason,'native_revision_cause_input_absent');selectedInput.inputRef=oldRef;
 const producerIndex=h.events.indexOf(leaf.result);h.events.splice(producerIndex,1);
 assert.equal(await prepare(),null,'equal folded value cannot replace missing producer');assert.equal(reason,'native_revision_cause_input_absent');h.events.splice(producerIndex,0,leaf.result);
 const implementation=producer.cCall.implementationRef;producer.cCall.implementationRef=D.nativeAssessorFoldImplementationRef;
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_parent_absent');producer.cCall.implementationRef=implementation;
 failure.cCall.programLocusRef=stage.assessorLocusRef;assert.equal(await prepare(),null);assert.equal(reason,'native_revision_cause_absent');failure.cCall.programLocusRef=stage.authorLocusRef;
 invalidated=true;assert.equal(await prepare(),null);assert.equal(reason,'native_revision_source_invalidated');invalidated=false;
 const verifier=join(env.canonicalRoot,'app/check.mjs'),saved=await readFile(verifier);await writeFile(verifier,'changed dependency');
 assert.equal(await prepare(),null);assert.equal(reason,'native_revision_current_context_mismatch');await writeFile(verifier,saved);
 h.admit(prepared,R.nativeIntakeImplementationRef);
 h.basis.graphFunction={name:'component:evidence-selector',declarations:{'abg.semantic_revision_selection':declaration.declarationRef}};
 h.call(R.selectionImplementationRef,prepared,prepared,{graphFunctionRef:h.basis.graphFunction.name});
 const selection={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:prepared.parent,causes:prepared.causes,mode:'stage_revision',selectedStageRef:stage.declarationRef,
  selectedObligationRefs:[],selectedTargetRefs:[],reasonRef:'component:actual-undispatched-consumer',nativePhase:'postconstruction'};
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),true);
 for(const crossed of [{...selection,nativePhase:'preconstruction'},{...selection,selectedStageRef:declaration.stages[3].declarationRef},
  {...selection,selectedTargetRefs:['app/main.mjs']},{...selection,selectedObligationRefs:['component:invented-obligation']}])assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,crossed),false);
 await writeFile(verifier,'changed after acquisition');
 assert.equal(h.owner.projectJobRevisionSubject(h.basis,prepared,true),null,'live selection preparation checks physical context; cold Result validation does not reread files');
 await writeFile(verifier,saved);
 invalidated=true;assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),false);invalidated=false;
 h.admit(selection,R.selectionImplementationRef);h.basis.declarationGraphFunctions=[h.basis.graphFunction];h.call(R.nativeRequestImplementationRef,selection,prepared);
 const request=h.owner.projectNativeSemanticRevisionRequest(h.basis,selection);assert(request);
 assert.deepEqual(request.selectionChoice,{mode:'stage_revision',selectedStageRef:stage.declarationRef,entryRole:'author'});
 const next=declaredCorrection(JSON.parse(JSON.stringify(request)));assert.equal(next.start.programRef,'program://odd-glc/native-semantic-revision/from-evidence@5');
 const whole=declaredPublication.graphFunctions.find(g=>g.name===next.start.graphFunctionRef);
 assert.deepEqual(whole.template.nodes.map(node=>node.term.graphFunctionRef),[next.projection.name,stageGraph.name,'graph-function://odd-glc/native-semantic-revision/terminal@5']);
 assert(!whole.effects.includes(g.NATIVE_WORKSPACE_WORK_IDS.effectUri),'Evidence suffix grants no native construction effect');
 h.invocation('evidence-only-successor',request,current);h.basis.graphFunction=next.projection;h.call(R.projectionImplementationRef,request);
 const successor=h.owner.projectSemanticJobRevision(h.basis,request);assert(successor);
 assert.deepEqual(successor.current.evidence,evidence.current.evidence);assert.deepEqual(successor.current.assets,evidence.current.assets);
 assert.deepEqual(successor.current.job,evidence.current.job);assert.deepEqual(successor.current.basis,evidence.current.basis);
 assert.deepEqual(successor.current.bindingVersions,evidence.current.bindingVersions);assert.deepEqual(p.projectSemanticJobBindings(successor.current),p.projectSemanticJobBindings(evidence.current));
 assert.equal(successor.revisionBasis.parentRevisionRef,evidence.revisionBasis.basisRef);assert.deepEqual(successor.revisionBasis.selection.selectedObligationRefs,[]);
 assert.equal(successor.current.assets.length,4);assert(!successor.current.assets.some(a=>a.stageRef===stage.declarationRef));assert.equal(successor.current.applicationCoverage,'non_closing');
 assert.throws(()=>revision.constructNativeRevisionConstructionTask(successor),/native revision construction basis required/);
 assert.equal(revision.deriveSemanticJobRevision(evidence,request,selection,null),null,'request cannot manufacture an operational cause');
 assert.equal(revision.deriveSemanticJobRevision(evidence,request,selection,null,null,[],evidence.current,stage),null,'operational failure is not semantic counterevidence');
 h.basis.graphFunction={...next.projection,declarations:{...next.projection.declarations,'abg.semantic_native_revision_entry_role':'assessor'}};
 assert.equal(h.owner.projectSemanticJobRevision(h.basis,request),null);h.basis.graphFunction=next.projection;
 await writeFile(verifier,'changed at suffix projection');assert.equal(h.owner.projectSemanticJobRevision(h.basis,request),null);await writeFile(verifier,saved);
 assert.deepEqual(h.owner.projectSemanticJobRevision(h.basis,request),successor);
 t.diagnostic(JSON.stringify({claim:'component producer to Evidence-only projection',parentDigest:hash(evidence),successorDigest:hash(successor),preservedStages:4,
  retainedObligations:p.projectSemanticJobBindings(successor.current).length,oldConstruction:successor.current.evidence.constructionResultRef,oldExecution:successor.current.evidence.executionResultRef,
  premises:'CCall/fibre, native-source, traversal-current-input, binding/install and invalidation admissions supplied; real fold provenance, recovery owner, physical context, cover algorithm, pure constructors and declared caller selection exercised; no actor, command, installed Run or qualification'}));
});

test('native D2 retained empty-obligation selector composes with all fifteen unchanged obligations',async t=>{
 const directory=process.env.ABI5_NATIVE_D2_DESIGN_DIRECTORY;
 if(!directory){t.skip('explicit retained Design/selector evidence directory required');return;}
 const read=async path=>JSON.parse(await readFile(join(directory,path),'utf8'));
 const parent=(await read('design-bound-diagnosis-01/design-input.json')).targets[0].event.payload.rawInputValue;
 const publication=await read('publication-01/prospective-publication.json');
 const attempt='design-presentation-continuation-02/caller-preparation-01';
 const diagnostics=(await read(attempt+'/intake-01/forensic-diagnostic-events.json')).diagnostics;
 const prepared=diagnostics.find(row=>row.event.payload.resultRef==='result://abiogenesis/6ffdcf5c198b84b65ba0da0f9eef8c674763c0d367e1fd1b5da162e9733d8ae6').event.payload.value;
 const selection=await read(attempt+'/preparation/invocation/archives/fp-bdfb7a0ef62a1cd0-output.txt');
 assert.deepEqual(selection.parent,prepared.parent);assert.deepEqual(selection.causes,prepared.causes);
 assert.equal(p.isSemanticJobRevisionEnvelope(parent),true);assert.equal(p.isSemanticRevisionSelection(selection),true);
 const active=p.projectSemanticJobBindings(parent.current);assert.equal(active.length,15);assert.deepEqual(selection.selectedObligationRefs,[]);
 assert.deepEqual(publication.semanticJobLifecycle,parent.current.declaration);
 // Retained values and actual public declaration are exact. Prefix/leaf admission,
 // install/authority and current physical checks are supplied component premises;
 // this does not admit the historically rejected selector or qualify a new Run.
 const env={...await fixture(t),job:parent.current.job,envelope:parent.current,...prepared.nativeWorksite};
 const h=await harness(env,{publication,contextPremises:{semanticJobContextMatches:(_basis,envelope,context)=>hash(context)===hash(prepared.nativeWorksite.context),semanticJobContextCurrent:()=>true}});
 function retained(state,coordinate){const before=state.result.admissionEventRef,judgment=state.judgment.admissionEventRef;
  Object.assign(state.result,{resultRef:coordinate.resultRef,resultDigest:coordinate.resultDigest,admissionEventRef:coordinate.resultAdmissionEventRef});state.judgment.admissionEventRef=coordinate.judgmentEventRef;
  Object.assign(h.events.find(e=>e.eventId===before),{eventId:coordinate.resultAdmissionEventRef,payload:{...state.result}});
  h.events.find(e=>e.eventId===judgment).eventId=coordinate.judgmentEventRef;return state;}
 retained(h.admit(parent,D.nativeAssessorFoldImplementationRef,h.original,'advance',prepared.parent.cCallRef,h.publicRun.ref),prepared.parent);
 const stage=parent.current.declaration.stages[parent.current.assets.length];
 const failureBasis={...h.original,basisRef:'component:retained-failed-author',rawInputValue:parent,rawInputDigest:hash(parent)};h.bases.set(failureBasis.basisRef,failureBasis);
 const cause=retained(h.admit({kind:'semantic_stage_failure',schemaVersion:'5.0.0',failureClass:'implementation_exception'},R.authorImplementationRef,failureBasis,'blocked',prepared.causes[0].cCallRef,h.publicRun.ref,'failure'),prepared.causes[0]);
 Object.assign(cause.cCall,{regime:'F_P',programLocusRef:stage.authorLocusRef});cause.result.evidenceRefs=['component:retained-operational-evidence'];
 const retainedEvidence=(await read('installed-01/suffix-01/first-cause-public-evidence-02.json')).bodies[0].value;
 const {constructRuntimeFailureDiagnosticRef}=await load('abg/runtime_failure');
 const observation={stage:'preparation',reason:'thrown',errorClass:'TypeError',diagnosticRef:constructRuntimeFailureDiagnosticRef(retainedEvidence.subject)};
 const evidence={kind:'c_call_evidenced',aggregateId:cause.cCall.cCallRef,eventId:'component:retained-evidence',payload:{evidenceClass:'undispatched_owner_refusal',evidenceRef:cause.result.evidenceRefs[0],ownerObservation:observation}};h.events.unshift(evidence);
 h.invocation('retained-intake',prepared.nativeWorksite.source);h.call(R.nativeIntakeImplementationRef,prepared.nativeWorksite.source);h.admit(prepared,R.nativeIntakeImplementationRef);
 h.basis.graphFunction={name:'component:retained-selector',declarations:{'abg.semantic_revision_selection':parent.current.declaration.declarationRef}};
 h.call(R.selectionImplementationRef,prepared,prepared,{graphFunctionRef:h.basis.graphFunction.name});
 assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),true);
 h.events.shift();assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,selection),false,'actor reason cannot replace authenticated operational evidence');h.events.unshift(evidence);
 const unknown={...selection,selectedObligationRefs:['component:foreign-obligation']};assert.equal(h.owner.jobRevisionSelectionMatchesBasis(h.basis,prepared,unknown),false);
 h.admit(selection,R.selectionImplementationRef);h.basis.declarationGraphFunctions=[h.basis.graphFunction];h.call(R.nativeRequestImplementationRef,selection,prepared);
 const request=h.owner.projectNativeSemanticRevisionRequest(h.basis,selection);assert(request);
 const next=declaredCorrection(JSON.parse(JSON.stringify(request)),publication);assert.equal(next.start.programRef,'program://odd-glc/native-semantic-revision/from-design@5');
 h.invocation('retained-correction',request);h.basis.graphFunction=next.projection;h.call(R.projectionImplementationRef,request);
 const successor=h.owner.projectSemanticJobRevision(h.basis,request);assert(successor);
 assert.deepEqual(successor.current.assets,parent.current.assets);assert.deepEqual(successor.current.job,parent.current.job);
 assert.deepEqual(successor.revisionBasis.retainedBindings,active.map(row=>row.binding));assert.deepEqual(p.projectSemanticJobBindings(successor.current),active);
 for(const asset of [...parent.revisionBasis.historicalAssets,...parent.current.assets])assert(successor.revisionBasis.historicalAssets.some(row=>hash(row)===hash(asset)));
 assert.deepEqual(successor.revisionBasis.selection,selection);assert.equal(successor.revisionBasis.parentRevisionRef,parent.revisionBasis.basisRef);
 assert.equal(revision.deriveSemanticJobRevision(parent,request,selection,null),null,'serialized request alone does not acquire operational qualification');
 t.diagnostic(JSON.stringify({kind:'retained_operational_continuation',parentDigest:hash(parent),selectionDigest:hash(selection),obligations:active.length,preservedAssets:successor.current.assets.length,historicalAssets:successor.revisionBasis.historicalAssets.length,selectedProgram:next.start.programRef,premises:'upstream admission and current physical environment supplied; no runtime admission or native execution'}));
});
