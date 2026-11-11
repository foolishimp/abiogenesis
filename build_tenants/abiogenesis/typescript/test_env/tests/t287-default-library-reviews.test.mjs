import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,rm,chmod} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../support/language-test-gtl.mjs';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentContract,assessmentSchema,schemaPath} from '../support/default-library.mjs';
import {prepareFulfillmentSeed,fulfillmentWitnessInput} from '../support/default-library-fulfillment.mjs';
// Declared framed reviews over the one assessor graph. Pure Product relations
// run directly; ABG preparation, fold and parent evaluation run the built owner
// module linked over controlled index/occurrence premises with actual native
// carriers; one scripted Public start runs the installed library end to end.
const packageRoot=new URL('../..',import.meta.url).pathname;
const governanceRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/',import.meta.url).pathname;
const witnessRoot=join(governanceRoot,'default-library-witness');
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
const h=product.sha256Canonical,ref=p=>product.governanceRef('graph-function',p);
const targetsOf=graphs=>graphs.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>({graphFunctionRef:g.name,definitionDigest:h(g),purpose:g.declarations['abg.default_library_purpose']}));
const REVIEW_A=witnessRef('review','code'),REVIEW_B=witnessRef('review','design');
const plainSchemaAsset={productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')};
// Two frames over one assessor: B (design) is declared first, A (code) second.
function declaredReviews({requiredA=true,requiredB=true}={}){
  const order=outcome=>({outcome,instructions:['Assess only under the declared reference frame.'],readFirst:['source/original-basic-cli.txt'],writeRoots:[],checks:[]});
  const assessment=(sources,candidatePath,rubricPath)=>({sources,candidatePath,rubricPath,resultContract:assessmentContract,schemaAsset:plainSchemaAsset,verdictField:'disposition',satisfiedValue:'satisfied'});
  return [{reviewRef:REVIEW_B,frame:'Design review: the implementation design conforms to the project conformance rubric.',required:requiredB,
      order:order('The implementation design conforms to the declared project conformance rubric.'),assessment:assessment(['source/original-basic-cli.txt'],'design/implementation-design.md','specification/project-conformance.md')},
    {reviewRef:REVIEW_A,frame:'Code review: the CLI source satisfies the declared oracle.',required:requiredA,
      order:order('The CLI source satisfies the declared oracle.'),assessment:assessment(['source/original-basic-cli.txt','source/witness-contract.md'],'generated/hello-world.mjs','source/basic-cli.oracle.json')}];
}
const withReviews=(state,options)=>product.constructGovernanceWorkState({...state.original,reviews:declaredReviews(options)});
async function seeded(t){
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  const witness=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')});
  const observe=state=>physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  return {physical,f,selection,witness,observe};
}
const stream=text=>({digest:product.sha256Bytes(Buffer.from(text)),byteLength:Buffer.byteLength(text),encoding:'utf8',text});
const row=(purpose,n,value,extra={})=>({purpose,resultRef:'result:'+purpose+':'+n,resultDigest:h(purpose+n),cCallRef:'call:'+purpose+':'+n,actorInvocationRef:'actor:'+purpose+':'+n,
  synthesisResultRef:'result:synthesis:'+n,selectedGraphFunctionRef:ref(purpose),value,...extra});
const constructionValue={report:{summary:'Built',gaps:['tests pending']},changedPaths:['generated/hello-world.mjs']};
const verdict=disposition=>({kind:'consumer_outcome_assessment',disposition,reason:'Controlled',unresolvedCriteria:disposition==='satisfied'?[]:['output']});

// Baseline b7cf409fc pins for a task without reviews, computed by the same
// construction before the review purpose existed (only the binder digest,
// which binds a fresh context ref, is compared structurally instead).
const OLD_INSTANCE_PINS={witness:'sha256:04b646eec3ea980eeb073e8c0cf77568509358267997a9b2490f5a54fda4f094',gtl3:'sha256:610e07824bf49251e08426991fb90aa022586cd07798648bd60c864060a6bb4b',
  environment:'sha256:6a089e94985d54e96c82a2c8de4bc2e10938d4ba31f36dc8031e752bd9080e32',view0:'sha256:f4708d77df28b80560f3de91768839e725eb400314949530a54f0563a87ad2ba',
  schema0:'sha256:fd8f35c89984377428e15ae4601fc5cb7efe0a6209f26d2894a1349d19042e67',viewP:'sha256:9c43e7c948ad4208252aa7738704536347644fb2340f87ef81280bf3a4bd817f',
  schemaP:'sha256:7ab32a60a506ddec853f37b0ad061b64e8e8a66f27649b3ced579c96e4a3ea5a',facts:'sha256:f0f58ab251190720e98db2cc8af7aee4ea86ddea05807e3c6b1bb00d18d8c07d',
  subjects:'sha256:406ffe48fe5447fd55cb5f1cb269cca597907ca6e2382a6ff437fe64d80e070d'};
test('a task without reviews keeps its prior state, selector view, response schema and binder: old-instance digests hold and the review wrapper is unselectable',async t=>{
  const {witness:state,observe}=await seeded(t),observed=await observe(state);
  const context={...observed,observationRef:'worksite-context-observation://abiogenesis/fixed'};
  const graphs=gtl.defaultGovernanceGraphFunctions({purposes:['construction','testing','uat'],recursionBound:8}),targets=targetsOf(graphs);
  const observations=[row('construction',1,constructionValue),
    row('testing',2,{commandResults:[{commandId:'command:0',exitStatus:1,stdout:stream('Hello world!\n'),stderr:stream('*** mismatch\n'+'x'.repeat(9000)+'\n[error] end\n')}],predicateObservations:[]}),
    row('uat',3,{kind:'consumer_outcome_assessment',disposition:'unmet',reason:'Comma missing',unresolvedCriteria:['output']})];
  const judgment={interpretation:'Fixed',contributions:[{graphFunctionRef:ref('testing'),contribution:'Measure',reason:'Fixed',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],
    gaps:[],nextGraphFunctionRef:ref('testing'),nextReason:'Fixed',nextEvidenceRefs:[],subjectEvidenceRef:null,revisionReason:'Fixed',revisionEvidenceRefs:[]};
  const synthesisBasis={inputRef:'input:synthesis',inputDigest:h('input'),taskRef:state.original.taskRef,environmentRef:'environment:fixed',environmentDigest:h('environment'),
    frameEvidenceDigest:h('frame'),frameRefs:['frame:fixed'],contextRef:context.observationRef,previousResultRef:null};
  const populated={...state,observations,synthesis:{resultRef:'result:synthesis:3',resultDigest:h('synthesis'),basis:synthesisBasis,judgment}};
  const task0={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context},taskP={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:populated,context};
  assert.deepEqual({witness:h(state),gtl3:h(graphs),environment:h(gtl.defaultLibraryRunEnvironment()),view0:h(product.projectFramedSynthesisPromptTask(task0)),
    schema0:h(product.framedSynthesisResponseSchema(task0,targets)),viewP:h(product.projectFramedSynthesisPromptTask(taskP)),schemaP:h(product.framedSynthesisResponseSchema(taskP,targets)),
    facts:h(product.projectGovernanceObservationFacts(populated,context)),subjects:h(['induction','construction','testing','uat'].map(p=>product.governanceSubjectEvidenceRefs(populated,p)))},OLD_INSTANCE_PINS);
  assert.equal(product.isGovernanceWorkState(populated),true);assert.equal(Object.hasOwn(state,'reviewStanding'),false,'no standing without declared reviews');
  assert.deepEqual(product.governanceVerdicts(populated),{acceptance:{observation:observations[2],satisfied:false},reviews:[]});
  for(const bad of [{...populated,reviewStanding:[]},{...populated,observations:[...observations.slice(0,2),{...observations[2],reviewRef:REVIEW_A}]},
    {...populated,observations:[...observations,row('review',4,verdict('satisfied'),{reviewRef:REVIEW_A})]}])assert.equal(product.isGovernanceWorkState(bad),false);
  // The full default catalogue now carries the review wrapper; for this task it is unselectable and changes nothing.
  const full=targetsOf(gtl.defaultGovernanceGraphFunctions()),withoutReview=full.filter(r=>r.purpose!=='review');
  assert.equal(full.length,withoutReview.length+1);
  for(const task of [task0,taskP])assert.deepEqual(product.framedSynthesisResponseSchema(task,full),product.framedSynthesisResponseSchema(task,withoutReview));
  const realTask={...taskP,context:observed},bindBasis={...synthesisBasis,contextRef:observed.observationRef,previousResultRef:'result:synthesis:3'};
  const raw={...judgment,contributions:[{...judgment.contributions[0],evidenceRefs:['result:testing:2']}],nextEvidenceRefs:['result:uat:3'],subjectEvidenceRef:'result:construction:1'};
  const bound=product.bindFramedSynthesisResult(realTask,full,bindBasis,raw);assert.ok(bound);
  assert.deepEqual(bound,product.bindFramedSynthesisResult(realTask,withoutReview,bindBasis,raw),'the unselectable wrapper does not change binding');
  assert.equal(product.bindFramedSynthesisResult(realTask,full,bindBasis,{...raw,reviewRef:null}),null,'reviewRef is absent without declared reviews');
  const selectReview={...raw,contributions:[{...raw.contributions[0],graphFunctionRef:ref('review')}],nextGraphFunctionRef:ref('review')};
  assert.equal(product.bindFramedSynthesisResult(realTask,full,bindBasis,selectReview),null,'the review wrapper is unselectable without declared reviews');
  assert.equal(product.governanceTargetPermission(task0,{purpose:'review'}).offered,false);assert.equal(product.governanceTargetPermission(task0,{purpose:'uat'}).permitted,true);
  assert.equal(product.governanceAssessmentContract(state,'review'),null);assert.deepEqual(product.governanceAssessmentContract(state,'uat'),state.original.assessment);
});

test('declared reviews: strict original, parent-owned standing, invariants and refusal of the fixed direct route',async t=>{
  const {witness}=await seeded(t),state=withReviews(witness);
  assert.deepEqual(state.reviewStanding,[REVIEW_B,REVIEW_A].map(reviewRef=>({reviewRef,required:true,resultRef:null,satisfied:false,current:false})));
  const original=state.original,construct=o=>()=>product.constructGovernanceWorkState(o);
  const [b,a]=original.reviews;
  for(const [label,o] of [['empty reviews',{...original,reviews:[]}],['duplicate reviewRef',{...original,reviews:[b,{...a,reviewRef:REVIEW_B}]}],
    ['review writes',{...original,reviews:[b,{...a,order:{...a.order,writeRoots:['generated/hello-world.mjs']}}]}],
    ['review roles collide',{...original,reviews:[b,{...a,assessment:{...a.assessment,rubricPath:a.assessment.candidatePath}}]}],
    ['review work order',{...original,workOrders:{...original.workOrders,review:a.order}}],['unknown key',{...original,reviews:[b,{...a,kind:'code'}]}]])
    assert.throws(construct(o),/governance input requires/,label);
  const C=row('construction',1,constructionValue),B=row('review',2,verdict('satisfied'),{reviewRef:REVIEW_B}),A=row('review',3,verdict('unmet'),{reviewRef:REVIEW_A}),U=row('uat',4,verdict('satisfied'));
  const standing=(over={})=>[{reviewRef:REVIEW_B,required:true,resultRef:B.resultRef,satisfied:true,current:true},{reviewRef:REVIEW_A,required:true,resultRef:A.resultRef,satisfied:false,current:true,...over}];
  const populated={...state,observations:[C,B,A,U],reviewStanding:standing()};assert.equal(product.isGovernanceWorkState(populated),true);
  for(const [label,bad] of [['standing absent',(({reviewStanding,...s})=>s)(populated)],['standing order',{...populated,reviewStanding:standing().reverse()}],
    ['standing required',{...populated,reviewStanding:[standing()[0],{...standing()[1],required:false}]}],['standing names no row',{...populated,reviewStanding:[standing()[0],{...standing()[1],resultRef:U.resultRef}]}],
    ['null standing satisfied',{...populated,reviewStanding:[standing()[0],{...standing()[1],resultRef:null,satisfied:true}]}],
    ['review row without reviewRef',{...populated,observations:[C,{...B,reviewRef:undefined},A,U].map(o=>JSON.parse(JSON.stringify(o)))}],
    ['undeclared reviewRef',{...populated,observations:[C,{...B,reviewRef:'review://foreign/x@5'},A,U]}],['work row with reviewRef',{...populated,observations:[{...C,reviewRef:REVIEW_A},B,A,U]}],
    ['terminal with adverse required review',{...populated,terminal:true,unresolvedSupportRefs:[]}],
    ['terminal with stale required review',{...populated,terminal:true,unresolvedSupportRefs:[],reviewStanding:standing({satisfied:true,current:false})}]])
    assert.equal(product.isGovernanceWorkState(bad),false,label);
  assert.equal(product.isGovernanceWorkState({...populated,terminal:true,unresolvedSupportRefs:[],reviewStanding:standing({satisfied:true})}),true,'terminal with every required review satisfied and current');
  const optional=product.constructGovernanceWorkState({...original,reviews:declaredReviews({requiredA:false})});
  assert.equal(product.isGovernanceWorkState({...optional,observations:[C,B,A,U],terminal:true,unresolvedSupportRefs:[],reviewStanding:[standing()[0],{...standing()[1],required:false}]}),true,'a non-required adverse review does not block terminal state');
  // Acceptance: the latest UAT row that only review rows follow; each review takes its own latest row.
  const v=product.governanceVerdicts({...populated,observations:[C,U,B,A]});
  assert.equal(v.acceptance.observation,U);assert.equal(v.acceptance.satisfied,true);assert.deepEqual(v.reviews.map(r=>[r.review.reviewRef,r.observation?.resultRef,r.satisfied]),[[REVIEW_B,B.resultRef,true],[REVIEW_A,A.resultRef,false]]);
  const A2=row('review',5,verdict('satisfied'),{reviewRef:REVIEW_A});
  assert.equal(product.governanceVerdicts({...populated,observations:[C,B,A,U,A2]}).reviews[1].observation,A2,'a later verdict of the same review supersedes');
  assert.equal(product.governanceVerdicts({...populated,observations:[C,U,B,row('construction',6,constructionValue)]}).acceptance.observation,null,'later work retires acceptance');
  // Selection names the review; the one assessment owner applies its declaration.
  const selected=(reviewRef,next=ref('review'))=>({...populated,synthesis:{resultRef:'result:synthesis:9',resultDigest:h('s'),basis:{inputRef:'input:s',inputDigest:h('i'),taskRef:original.taskRef,environmentRef:'environment:s',environmentDigest:h('e'),frameEvidenceDigest:h('f'),frameRefs:['frame:s'],contextRef:'context:s',previousResultRef:null},
    judgment:{interpretation:'R',contributions:[{graphFunctionRef:next,contribution:'R',reason:'R',supportRefs:[],evidenceRefs:[],dependsOn:[]}],gaps:[],nextGraphFunctionRef:next,nextReason:'R',nextEvidenceRefs:[],subjectEvidenceRef:C.resultRef,revisionReason:'R',revisionEvidenceRefs:[],reviewRef}}});
  assert.equal(product.governanceSelectedReview(selected(REVIEW_A)),a);assert.equal(product.governanceAssessmentContract(selected(REVIEW_A),'review'),a.assessment);
  assert.equal(product.governanceAssessmentContract(selected(REVIEW_A),'uat'),original.assessment,'UAT keeps full-original acceptance');
  for(const s of [selected('review://foreign/x@5'),selected(null),selected(REVIEW_A,ref('uat'))])assert.equal(product.governanceAssessmentContract(s,'review'),null);
  assert.deepEqual(product.governanceSubjectEvidenceRefs(populated,'review'),product.governanceSubjectEvidenceRefs(populated,'uat'),'a review chooses from the UAT subject domain');
  assert.equal(product.governanceSubjectEvidenceRefs(populated,'uat').includes(B.resultRef),false,'a review verdict is never a subject');
  // The fixed direct route is a closed Testing/UAT relation: declared reviews are open choice.
  const {testing,uat}=original.workOrders,direct=product.constructGovernanceWorkState({...original,workOrders:{testing,uat}});
  assert.equal(product.governanceDirectFixedState(direct,'testing',null),false);
  const {reviews:_r,...plain}=direct.original;assert.equal(product.governanceDirectFixedState(product.constructGovernanceWorkState(plain),'testing',null),true);
});

test('declared reviews: selector view, response schema and binder agree on reviewRef presence and the review domain',async t=>{
  const {witness,observe}=await seeded(t),state=withReviews(witness),context=await observe(state);
  const C=row('construction',1,constructionValue),T=row('testing',2,{commandResults:[],predicateObservations:[]});
  const populated={...state,observations:[C,T]},task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:populated,context};
  assert.ok(product.isGovernanceWorkState(populated));
  const view=product.projectFramedSynthesisPromptTask(task);
  assert.deepEqual(view.subjectEvidenceDomains.review,view.subjectEvidenceDomains.uat);assert.equal(Object.hasOwn(view.workOrders,'review'),false);
  assert.deepEqual(view.reviews.declared.map(r=>[r.reviewRef,r.frame,r.required,r.candidatePath,r.standing]),state.original.reviews.map(r=>[r.reviewRef,r.frame,true,r.assessment.candidatePath,{resultRef:null,satisfied:false,current:false}]));
  assert.match(view.reviews.meaning,/^Required reviews gate parent completion together with acceptance[^.]*\.$/,'one sentence');
  const targets=targetsOf(gtl.defaultGovernanceGraphFunctions()),schema=product.framedSynthesisResponseSchema(task,targets);
  assert.deepEqual(schema.properties.reviewRef.enum,[REVIEW_B,REVIEW_A,null]);assert.ok(schema.required.includes('reviewRef'));
  const {default:Ajv2020}=await import('ajv/dist/2020.js'),validate=new Ajv2020({strict:false}).compile(schema);
  const basis={inputRef:'input:synthesis',inputDigest:h('input'),taskRef:state.original.taskRef,environmentRef:'environment:fixed',environmentDigest:h('environment'),frameEvidenceDigest:h('frame'),frameRefs:['frame:fixed'],contextRef:context.observationRef,previousResultRef:null};
  const support=state.unresolvedSupportRefs,judgment=(next,subject,reviewRef)=>({interpretation:'Matrix',contributions:[{graphFunctionRef:next??ref('construction'),contribution:'M',reason:'M',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
    gaps:next===null?[{supportRefs:support,reason:'Gap',evidenceRefs:[]}]:[],nextGraphFunctionRef:next,nextReason:'M',nextEvidenceRefs:[],subjectEvidenceRef:subject,revisionReason:'M',revisionEvidenceRefs:[],...(reviewRef===undefined?{}:{reviewRef})});
  const cases=[[ref('construction'),null],[ref('review'),C.resultRef],[ref('review'),T.resultRef],[ref('uat'),T.resultRef],[null,null]];
  let accepted=0;
  for(const [next,subject] of cases)for(const reviewRef of [undefined,null,REVIEW_A,REVIEW_B,'review://foreign/x@5']){
    const raw=judgment(next,subject,reviewRef),expected=reviewRef!==undefined&&(next===ref('review')?[REVIEW_A,REVIEW_B].includes(reviewRef):reviewRef===null);
    const label=JSON.stringify([next,subject,reviewRef]);
    assert.equal(validate(raw),expected,'schema '+label);assert.equal(product.bindFramedSynthesisResult(task,targets,basis,raw)!==null,expected,'binder '+label);accepted+=expected;
  }
  assert.equal(accepted,7);
  for(const raw of [judgment(ref('review'),null,REVIEW_A),judgment(ref('review'),'result:unknown',REVIEW_A)]){
    assert.equal(validate(raw),false);assert.equal(product.bindFramedSynthesisResult(task,targets,basis,raw),null,'the review subject is drawn from its domain');}
});

// The built ABG owner linked over controlled index/occurrence premises: the
// governance root, invocation, execution bases and Result index are fixture
// rows; native tasks, observations, assessments and worksite reads are actual.
const admittedNativeTasks=new Map();
const heldNativeObservation=(owner,task,...rest)=>{admittedNativeTasks.set(h(task),task);return owner.constructNativeWorkspaceWorkObservation(task,...rest);};
async function rootProjection(indexed,rehydrateExecutionBasisAtPrefix){
  const file=resolve(packageRoot,'build/code/src/abg/semantic_job.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href);
    const values={...actual,...(s==='./event_prefix.js'?{indexedRuntimeEvents:(p,key)=>indexed(p,key,actual.indexedRuntimeEvents)}:s==='./execution_basis.js'?{rehydrateExecutionBasisAtPrefix}:{})};
    return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();return {...m.namespace};
}
async function reviewOwner(f,initial,{program}={}){
  const nativeOwner=await import('../../build/code/src/product/native_workspace_work.js');
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),rows=[];
  const invocation={invocationRef:'invocation:reviews',invocationAdmissionRef:'invocation-admission:reviews',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:wrapper',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:reviews',workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:initial}};
  const owned={program:program??library.programs[0],prefix:{},events:rows,execution,environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},call:{runId:'run:reviews'},inputValue:null,inputRef:'input:reviews',inputOrigin:{}};
  const x={nativeOwner,rows,owned,invocation,stale:new Set(),changes:[],checked:[]};
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId);
  const rootBasis=(_p,r)=>r===root.payload.basisRef?{...execution,basisRef:r,parentExecutionBasisRef:null,rawInputValue:root.payload.rawInputValue}:null;
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  // Currentness premise over the owner's two query forms: selected paths match exactly, read roots at
  // or under a root. A stale path changed after every ordinal, '*' everywhere; an admitted native effect
  // {path,at} after its ordinal. A C2 command delta is not a cause.
  const invalidated=(_p,ordinal,_root,paths,roots)=>{x.checked.push(roots===undefined?{paths}:{roots});
    const hit=p=>roots===undefined?paths.includes(p):roots.some(r=>r==='.'||p===r||p.startsWith(r+'/'));
    return x.stale.has('*')||[...x.stale].some(hit)||x.changes.some(c=>c.at>ordinal&&hit(c.path));};
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>({...execution})}:
      specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?await rootProjection(index,rootBasis):
      specifier==='./native_worksite_execution.js'?{worksiteCommandSourcesInvalidatedAfter:invalidated,projectNativeWorkspaceWorkSourceAtPrefix:(_p,value)=>({sourceBasis:{...execution},sourceTask:admittedNativeTasks.get(value?.inputDigest)}),
        projectNativeWorkspaceWorkResultTaskAtPrefix:(_p,event)=>admittedNativeTasks.get(event?.payload?.value?.inputDigest)??null}:{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();x.m=m.namespace;
  const provenance={cCallRef:'call:native',executionAuthorityRef:'authority:test',executionAuthorityDigest:h('authority'),actorInvocationRef:'actor:native',transportBindingRef:'transport:test',transportBindingDigest:h('transport'),promptDigest:h('prompt'),transportDigest:h('transport')};
  let n=0;
  x.at=(purpose,operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);return {graphFunction:library.graphFunctions.find(g=>g.declarations['abg.default_library_purpose']===purpose)};};
  x.synth=(state,purpose,subjectEvidenceRef=null,reviewRef=null)=>({...state,synthesis:{resultRef:'result:synthesis:'+(++n),resultDigest:h('synthesis'+n),basis:{inputRef:'input:synthesis',inputDigest:h(state),taskRef:state.original.taskRef,
    environmentRef:'environment:test',environmentDigest:h('environment'),frameEvidenceDigest:h('frame'),frameRefs:['frame:test'],contextRef:'context:test',previousResultRef:state.synthesis?.resultRef??null},
    judgment:{interpretation:'Supplied work',contributions:[{graphFunctionRef:ref(purpose),contribution:'Selected '+purpose+' contribution',reason:'Actual evidence',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:[]}],gaps:[],
      nextGraphFunctionRef:ref(purpose),nextReason:'Chosen work',nextEvidenceRefs:[],subjectEvidenceRef,revisionReason:'Current evidence',revisionEvidenceRefs:[],...(state.original.reviews===undefined?{}:{reviewRef})}}});
  x.prepare=async(state,purpose)=>{const b=x.at(purpose,'prepare-native',state);return {b,task:await x.m.projectGovernanceNativeTask(b,state)};};
  x.fold=(state,purpose,value,runId=owned.call.runId)=>{const input=product.constructRetainedGraphInput(state,value),b=x.at(purpose,'fold',input),k=rows.length;
    const event={kind:'c_call_result_admitted',runId,basisId:'basis:child',aggregateId:'call:reviews:'+purpose+':'+k,admissionOrdinal:k+10,
      payload:{resultRef:'result:reviews:'+purpose+':'+k,resultDigest:h(value),resultClass:'success',contractRef:product.NATIVE_WORKSPACE_WORK_IDS.observationContractRef,value}};
    rows.push(event);owned.inputOrigin={retainedProjection:{entryBasis:execution,input:{admissionRef:owned.inputRef,value:input},sourceResult:event}};
    const folded=x.m.projectGovernanceFold(b,input),matches=folded!==null&&x.m.governanceResultMatches(b,input,folded);owned.inputOrigin={};return {folded,event,matches};};
  x.construct=async state=>{const s=x.synth(state,'construction'),{task}=await x.prepare(s,'construction');assert.ok(task,'construction task');
    const {folded}=x.fold(s,'construction',heldNativeObservation(nativeOwner,task,task.context,{summary:'Built',gaps:[]},{...provenance,cCallRef:'call:constructor',actorInvocationRef:'actor:constructor'}));assert.ok(folded);return folded;};
  x.assess=async(state,purpose,subject,disposition,reviewRef=null,runId)=>{const s=x.synth(state,purpose,subject,reviewRef),{b,task}=await x.prepare(s,purpose);assert.ok(task,purpose+' '+reviewRef);
    const value=heldNativeObservation(nativeOwner,task,task.context,null,{...provenance,cCallRef:'call:assessor',actorInvocationRef:'actor:assessor:'+(reviewRef??purpose)},verdict(disposition));
    assert.equal(nativeOwner.nativeWorkspaceWorkObservationMatchesTask(task,value),true);return {b,s,task,...x.fold(s,purpose,value,runId)};};
  x.parent=state=>x.m.projectGovernanceParent(x.at('uat','evaluate-parent',state),state);
  return x;
}
test('declared review preparation and fold: the selected review order, frame and assessment over the one assessor, folded as a reviewRef row',async t=>{
  const {f,witness,observe}=await seeded(t),initial=withReviews(witness),x=await reviewOwner(f,initial),[b,a]=initial.original.reviews;
  const built=await x.construct(initial),C=built.observations.at(-1);
  const s=x.synth(built,'review',C.resultRef,REVIEW_A),{b:prepared,task}=await x.prepare(s,'review');
  assert.ok(x.nativeOwner.isNativeWorkspaceWorkTask(task));assert.equal(task.outcome,a.order.outcome,'the review keeps its declared outcome over the planner contribution');
  assert.deepEqual(task.writeRoots,[]);assert.deepEqual(task.readFirst,[...a.order.readFirst,'source/witness-contract.md',a.assessment.candidatePath,a.assessment.rubricPath]);
  assert.deepEqual(task.readFirst,product.governanceAssessmentDependencies(a.order,a.assessment),'preparation binds exactly the dependency set');
  assert.deepEqual([task.assessment.candidate.path,task.assessment.rubric.path,task.assessment.sources.map(s=>s.path),task.assessment.resultContract,task.assessment.producer.resultRef],
    [a.assessment.candidatePath,a.assessment.rubricPath,a.assessment.sources,a.assessment.resultContract,C.resultRef]);
  const i=task.instructions.indexOf('Declared review: '+JSON.stringify({reviewRef:REVIEW_A,frame:a.frame,required:true}));assert.ok(i>0);
  assert.equal(task.instructions[0],product.GOVERNANCE_POLICIES.review);
  assert.equal(task.instructions[i+1],'Governing review outcome: '+a.order.outcome);
  assert.ok(task.instructions[i+2].startsWith('Advisory planner selection (non-governing context;'));
  assert.ok(task.instructions[i+3].startsWith('The declared reference frame, its declared sources, rubric and result contract govern this independent review.'));
  assert.equal(task.instructions.some(s=>s.startsWith('Governing full-original assessment outcome')||s.startsWith('Supplied purpose outcome')||s.includes('return a truthful partial report')),false,'a review inherits neither acceptance nor author text');
  assert.deepEqual(x.nativeOwner.nativeWorkspaceWorkResponseSchema(task),assessmentSchema);
  assert.equal(x.m.governanceResultMatches(prepared,s,task),true);
  assert.equal(x.m.governanceResultMatches(prepared,s,{...task,writeRoots:['generated/hello-world.mjs']}),false);
  // The other frame applies its own declaration through the same wrapper and assessor.
  const sB=x.synth(built,'review',C.resultRef,REVIEW_B),taskB=(await x.prepare(sB,'review')).task;
  assert.equal(taskB.assessment.candidate.path,b.assessment.candidatePath);assert.ok(taskB.instructions.includes('Declared review: '+JSON.stringify({reviewRef:REVIEW_B,frame:b.frame,required:true})));
  for(const [label,state] of [['undeclared review',x.synth(built,'review',C.resultRef,'review://foreign/x@5')],['null reviewRef',x.synth(built,'review',C.resultRef,null)],
    ['missing subject',x.synth(built,'review','result:missing',REVIEW_A)]])assert.equal((await x.prepare(state,'review')).task,null,label);
  x.stale.add(a.assessment.candidatePath);assert.equal((await x.prepare(s,'review')).task,null,'a changed producer dependency refuses');x.stale.clear();
  // Fold: the assessment value and its declared reviewRef; standing is carried unchanged.
  const {folded,matches}=(await x.assess(built,'review',C.resultRef,'unmet',REVIEW_A));
  assert.ok(folded);assert.equal(matches,true);assert.equal(product.isGovernanceWorkState(folded),true);assert.equal(folded.terminal,false);
  const R=folded.observations.at(-1);
  assert.deepEqual([R.purpose,R.reviewRef,R.selectedGraphFunctionRef,R.value.disposition,R.fulfillmentEvidence],['review',REVIEW_A,ref('review'),'unmet',undefined]);
  assert.deepEqual(folded.reviewStanding,built.reviewStanding,'only the parent recomputes standing');
  // A task without reviews cannot run the review wrapper.
  const plain=await reviewOwner(f,witness),plainBuilt=await plain.construct(witness);
  assert.equal((await plain.prepare(plain.synth(plainBuilt,'review',plainBuilt.observations.at(-1).resultRef),'review')).task,null);
});
test('declared review fold under fulfillment adds no fulfillment fact and leaves coverage and unresolved obligations unchanged',async t=>{
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  const files=await prepareFulfillmentSeed({seedRoot:join(witnessRoot,'seed'),caseContractPath:join(governanceRoot,'s6-witness-contract.md'),destination:f.canonicalRoot});
  const base=fulfillmentWitnessInput({product,files}),[,a]=declaredReviews();
  const initial=product.constructGovernanceWorkState({...base.original,reviews:[{...a,assessment:{...a.assessment,sources:['source/original-basic-cli.txt']}}]});
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),program={...library.programs[0],policies:{...library.programs[0].policies,'abg.default_library_fulfillment':product.GOVERNANCE_FULFILLMENT_PROFILE}};
  const x=await reviewOwner(f,initial,{program}),built=await x.construct(initial),C=built.observations.at(-1);
  assert.ok(C.fulfillmentEvidence,'native work is fulfillment evidence');
  const {folded,matches,task}=await x.assess(built,'review',C.resultRef,'satisfied',REVIEW_A);
  assert.ok(folded);assert.equal(matches,true);assert.equal(product.isGovernanceWorkState(folded),true);
  assert.equal(task.instructions.some(s=>s.startsWith('Return the installed structural fulfillment response')),false,'a review returns only its declared assessment');
  assert.ok(task.instructions.some(s=>s.startsWith('Active source-grounded paired obligations: ')),'obligations stay visible as parent context');
  assert.equal(folded.observations.at(-1).fulfillmentEvidence,undefined);
  assert.deepEqual([folded.fulfillment,folded.unresolvedSupportRefs],[built.fulfillment,built.unresolvedSupportRefs]);
});
test('parent evaluation: acceptance and every required review must be satisfied and current; standing is computed only here',async t=>{
  const {f,witness}=await seeded(t),initial=withReviews(witness),x=await reviewOwner(f,initial),[b,a]=initial.original.reviews;
  const built=await x.construct(initial),C=built.observations.at(-1).resultRef;
  const B=(await x.assess(built,'review',C,'satisfied',REVIEW_B)).folded,BA=(await x.assess(B,'review',C,'unmet',REVIEW_A)).folded;
  const BAU=(await x.assess(BA,'uat',C,'satisfied')).folded,closed=(await x.assess(BAU,'review',C,'satisfied',REVIEW_A)).folded;
  const ref=state=>state.observations.at(-1).resultRef,standing=out=>out.reviewStanding.map(r=>[r.reviewRef,r.resultRef,r.satisfied,r.current]);
  const evaluated=state=>{const out=x.parent(state);assert.ok(out);assert.equal(product.isGovernanceWorkState(out),true,'terminal implies every required review is satisfied and current');return out;};
  // Required A adverse: acceptance alone does not close.
  let out=evaluated(BAU);assert.equal(out.terminal,false);assert.deepEqual(standing(out),[[REVIEW_B,ref(B),true,true],[REVIEW_A,ref(BA),false,true]]);
  assert.deepEqual(out.unresolvedSupportRefs,initial.original.requiredSupportRefs);
  // Both reviews satisfied and current after acceptance: closes. Acceptance stays the latest UAT that only review rows follow.
  out=evaluated(closed);assert.equal(out.terminal,true);assert.deepEqual(standing(out),[[REVIEW_B,ref(B),true,true],[REVIEW_A,ref(closed),true,true]]);assert.deepEqual(out.unresolvedSupportRefs,[]);
  assert.deepEqual(closed.reviewStanding,initial.reviewStanding,'folds carried the initial standing; the parent computed the one above');
  const reworked=await x.construct(closed);out=evaluated(reworked);assert.equal(out.terminal,false,'later work retires acceptance');
  assert.deepEqual(standing(out),[[REVIEW_B,ref(B),true,true],[REVIEW_A,ref(closed),true,true]],'work that changes no declared subject keeps both verdicts current');
  // A's verdict is stale once its declared subject changed: only A loses currentness.
  const gates=state=>product.governanceTargetPermission({state},{purpose:'uat',requiredReviews:[REVIEW_A]}).permitted;assert.equal(gates(evaluated(closed)),true);
  x.stale.add(a.assessment.candidatePath);out=evaluated(closed);x.stale.clear();
  assert.equal(out.terminal,false);assert.deepEqual(standing(out),[[REVIEW_B,ref(B),true,true],[REVIEW_A,ref(closed),true,false]]);
  assert.equal(gates(out),false,'a declared prerequisite reads this standing: the stale review gates again');
  x.stale.add(b.assessment.rubricPath);out=evaluated(closed);x.stale.clear();
  assert.equal(out.terminal,false);assert.deepEqual(standing(out),[[REVIEW_B,ref(B),true,false],[REVIEW_A,ref(closed),true,true]]);
  assert.ok(x.checked.some(c=>JSON.stringify(c)===JSON.stringify({roots:product.governanceAssessmentDependencies(a.order,a.assessment)})),'currentness reads the dependency set in the read-roots form');
  // A required review that never ran blocks closure.
  const unreviewed=(await x.assess(B,'uat',C,'satisfied')).folded;out=evaluated(unreviewed);
  assert.equal(out.terminal,false);assert.deepEqual(standing(out)[1],[REVIEW_A,null,false,false]);
  // Reviews before acceptance count.
  const early=(await x.assess((await x.assess(B,'review',C,'satisfied',REVIEW_A)).folded,'uat',C,'satisfied')).folded;assert.equal(evaluated(early).terminal,true);
  // A verdict admitted in another Run is attributed history, never current.
  const prior=(await x.assess(BAU,'review',C,'satisfied',REVIEW_A,'run:prior')).folded;
  x.invocation.sourceResultBasis={kind:'invocation_source_result_basis',sourceResultContractRef:product.governanceContract('state'),sourceResultValue:prior};
  out=evaluated(prior);x.invocation.sourceResultBasis=undefined;
  assert.equal(out.terminal,false);assert.deepEqual(standing(out)[1],[REVIEW_A,ref(prior),true,false]);
  // A tampered review row refuses the whole parent outcome.
  assert.equal(x.parent({...closed,observations:closed.observations.map((o,i,all)=>i===all.length-1?{...o,value:verdict('unmet')}:o)}),null);
  assert.equal(x.parent({...closed,observations:closed.observations.map((o,i,all)=>i===all.length-1?{...o,actorInvocationRef:'actor:other'}:o)}),null);
  // A non-required adverse review never blocks acceptance.
  const optional=product.constructGovernanceWorkState({...witness.original,reviews:declaredReviews({requiredA:false})}),y=await reviewOwner(f,optional);
  const yBuilt=await y.construct(optional),yC=yBuilt.observations.at(-1).resultRef;
  const yState=(await y.assess((await y.assess((await y.assess(yBuilt,'review',yC,'satisfied',REVIEW_B)).folded,'review',yC,'unmet',REVIEW_A)).folded,'uat',yC,'satisfied')).folded;
  const yOut=y.parent(yState);assert.equal(yOut.terminal,true);assert.deepEqual(yOut.reviewStanding[1],{reviewRef:REVIEW_A,required:false,resultRef:yState.observations.at(-2).resultRef,satisfied:false,current:true});
  // Without declared reviews the parent output is unchanged: no standing, the same closure rule.
  const z=await reviewOwner(f,witness),zBuilt=await z.construct(witness),zState=(await z.assess(zBuilt,'uat',zBuilt.observations.at(-1).resultRef,'satisfied')).folded;
  const zOut=z.parent(zState);assert.deepEqual(zOut,{...zState,terminal:true,unresolvedSupportRefs:[]});assert.equal(Object.hasOwn(zOut,'reviewStanding'),false);
  z.stale.add('*');assert.equal(z.parent(zState).terminal,false);
});

test('review currentness covers every mandatory input: a change only in a review readFirst keeps the parent open after a fresh UAT; an unaffected review stays current',async t=>{
  const {f,witness}=await seeded(t),[b,a]=declaredReviews(),TEST_DESIGN='design/test-design.md';
  assert.deepEqual(product.governanceAssessmentDependencies({readFirst:['x','c']},{sources:['x','s'],candidatePath:'c',rubricPath:'r'}),['x','c','s','r'],'declared readFirst, then each assessment input once');
  assert.deepEqual(product.governanceAssessmentDependencies({readFirst:['x','x']},{sources:['s'],candidatePath:'c',rubricPath:'r'}),['x','x','s','c','r'],'a duplicate declared readFirst stays for preparation to refuse');
  const run=async requiredA=>{
    const initial=product.constructGovernanceWorkState({...witness.original,reviews:[b,{...a,required:requiredA,order:{...a.order,readFirst:[...a.order.readFirst,TEST_DESIGN]}}]});
    const x=await reviewOwner(f,initial),A=initial.original.reviews[1];
    assert.deepEqual(product.governanceAssessmentDependencies(A.order,A.assessment),['source/original-basic-cli.txt',TEST_DESIGN,'source/witness-contract.md',A.assessment.candidatePath,A.assessment.rubricPath]);
    assert.equal([...A.assessment.sources,A.assessment.candidatePath,A.assessment.rubricPath,...product.governanceAssessmentDependencies(b.order,b.assessment)].includes(TEST_DESIGN),false,
      'the changed input is only in A readFirst: the old subject set and review B never name it');
    const built=await x.construct(initial),C=built.observations.at(-1).resultRef;
    const {folded:reviewed,task}=await x.assess((await x.assess(built,'review',C,'satisfied',REVIEW_B)).folded,'review',C,'satisfied',REVIEW_A);
    assert.ok(task.readFirst.includes(TEST_DESIGN),'the review assessor was bound to read it');
    // Construction changes only that file; a fresh UAT over the new Construction is satisfied.
    const rebuilt=await x.construct(reviewed);x.changes.push({path:TEST_DESIGN,at:x.rows.at(-1).admissionOrdinal});
    const accepted=(await x.assess(rebuilt,'uat',rebuilt.observations.at(-1).resultRef,'satisfied')).folded,out=x.parent(accepted);
    assert.ok(out);assert.equal(product.isGovernanceWorkState(out),true);
    return {x,accepted,out,subject:rebuilt.observations.at(-1).resultRef};
  };
  const {x,accepted,out,subject}=await run(true);
  assert.equal(out.terminal,false,'the stale required review keeps the parent open');
  assert.deepEqual(out.reviewStanding.map(r=>[r.reviewRef,r.satisfied,r.current]),[[REVIEW_B,true,true],[REVIEW_A,true,false]],'only the review whose input changed is stale');
  const rerun=(await x.assess(accepted,'review',subject,'satisfied',REVIEW_A)).folded,closed=x.parent(rerun);
  assert.equal(closed.terminal,true,'rerunning the stale review closes over the same acceptance');
  assert.deepEqual(closed.reviewStanding.map(r=>[r.reviewRef,r.satisfied,r.current]),[[REVIEW_B,true,true],[REVIEW_A,true,true]]);
  // Control: the same UAT is current; with A not required the parent closes and A stays visibly stale.
  const control=await run(false);
  assert.equal(control.out.terminal,true,'the fresh UAT is current and B is unaffected');
  assert.deepEqual(control.out.reviewStanding.map(r=>[r.reviewRef,r.required,r.satisfied,r.current]),[[REVIEW_B,true,true,true],[REVIEW_A,false,true,false]]);
});

test('authority selections travel with every prepared native work and assessment task beside the conserved original task; an empty list adds no instruction',async t=>{
  const {f,witness}=await seeded(t),reviewed=withReviews(witness),refs=reviewed.original.authorityRefs,label='Conserved original authority selections: ';
  assert.ok(refs.length>0,'the witness selects authority');
  const tasks=async initial=>{const x=await reviewOwner(f,initial),construction=(await x.prepare(x.synth(initial,'construction'),'construction')).task;
    const built=await x.construct(initial),C=built.observations.at(-1).resultRef;
    return {construction,uat:(await x.prepare(x.synth(built,'uat',C),'uat')).task,review:(await x.prepare(x.synth(built,'review',C,REVIEW_A),'review')).task};};
  const selected=await tasks(reviewed),empty=await tasks(product.constructGovernanceWorkState({...reviewed.original,authorityRefs:[]}));
  for(const role of ['construction','uat','review']){
    const i=selected[role].instructions.indexOf(label+JSON.stringify(refs));assert.ok(i>0,role);
    assert.ok(selected[role].instructions[i-1].startsWith('Conserved original task: '),role+' beside the conserved original task');
    assert.equal(empty[role].instructions.some(s=>s.startsWith(label)),false,role+' no authority instruction without selections');
  }
  assert.deepEqual(selected.construction.instructions.filter(s=>!s.startsWith(label)),empty.construction.instructions,'the one line is the only difference');
});

// Model-free stand-in for every native role. The selector reads only its
// delivered selector view: Construction first and after a current adverse
// review; each required review never run, in declaration order; Testing over
// the latest Construction; UAT over that Testing; then each required review
// whose verdict is not satisfied and current. The constructor first writes a
// wrong greeting, then the declared one. The assessor reads the declared
// candidate: the CLI is satisfied only with the declared greeting. With
// ABI5_REVIEW_ACTOR_TOUCH the first Construction writes the declared greeting,
// a second Construction follows the reviews and rewrites only that path.
const REVIEW_ACTOR=`
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {join} from 'node:path';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_REVIEW_ACTOR_LOG,touch=process.env.ABI5_REVIEW_ACTOR_TOUCH;
const prior=existsSync(log)?readFileSync(log,'utf8').trim().split('\\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const emit=(role,output,extra={})=>{appendFileSync(log,JSON.stringify({role,...extra})+'\\n');console.log(JSON.stringify({type:'system',subtype:'init'}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);};
const tasks=prompt.split('\\n\\n').filter(x=>x.startsWith('## task\\n')).map(x=>x.slice('## task\\n'.length));let c2=null;
if(tasks.length===1)try{const owner=JSON.parse(tasks[0]).ownerPrompt,input=JSON.parse(owner.split('\\n\\n')[1]);if(Object.keys(input).length===1&&typeof input.command==='string')c2=input;}catch{}
if(c2){console.log(JSON.stringify({type:'system',subtype:'init'}));console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_review_c2',name:'Bash',input:c2}]}}));
 const helper=spawnSync('/bin/sh',['-c',c2.command],{encoding:'utf8',maxBuffer:64*1024*1024});if(helper.status!==0){process.stderr.write(String(helper.stderr));process.exit(1);}
 appendFileSync(log,JSON.stringify({role:'c2'})+'\\n');console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout)}));process.exit(0);}
const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{};
if('interpretation' in props){
 const view=JSON.parse(tasks[0]),rows=view.observations,last=p=>rows.findLastIndex(r=>r.purpose===p),reviews=view.reviews.declared;
 const graph=p=>(props.nextGraphFunctionRef.enum??[]).find(g=>typeof g==='string'&&g.includes('/'+p+'@'));
 const construction=rows.findLast(r=>r.purpose==='construction'),testing=rows.findLast(r=>r.purpose==='testing');
 const adverse=reviews.some(r=>r.standing.resultRef!==null&&r.standing.current&&!r.standing.satisfied),unrun=reviews.find(r=>r.required&&r.standing.resultRef===null);
 const pending=reviews.find(r=>r.required&&!(r.standing.satisfied&&r.standing.current)),tested=testing!==undefined&&last('testing')>last('construction');
 let next=null,subject=null,reviewRef=null;
 if(!construction||adverse)next='construction';
 else if(unrun)[next,reviewRef,subject]=['review',unrun.reviewRef,construction.resultRef];
 else if(touch&&rows.filter(r=>r.purpose==='construction').length===1&&testing===undefined)next='construction';
 else if(!tested)[next,subject]=['testing',construction.resultRef];
 else if(last('uat')<last('testing'))[next,subject]=['uat',testing.resultRef];
 else if(pending)[next,reviewRef,subject]=['review',pending.reviewRef,construction.resultRef];
 const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[],target=next===null?null:graph(next);
 emit('select:'+(next??'gap')+(reviewRef?':'+reviewRef:''),{interpretation:'Scripted review-aware selector.',contributions:[{graphFunctionRef:target??graph('construction'),contribution:'Scripted contribution.',reason:'Scripted ordered policy.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
  gaps:next===null?[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}]:[],nextGraphFunctionRef:target,nextReason:'Scripted ordered policy.',nextEvidenceRefs:[],subjectEvidenceRef:subject,
  revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef}:{})},{standing:reviews.map(r=>({reviewRef:r.reviewRef,...r.standing}))});
}else if('summary' in props&&'gaps' in props){
 if(!existsSync('generated/hello-world.mjs')){process.stderr.write('review actor expects the worksite cwd\\n');process.exit(1);}
 const first=!prior.some(r=>r.role==='native');if(touch&&!first)writeFileSync(touch,'Revised review input.\\n');
 else writeFileSync('generated/hello-world.mjs',first&&!touch?'console.log("Hello world");\\n':'console.log("Hello, world!");\\n');
 emit('native',{summary:first?'Scripted first construction.':'Scripted correction.',gaps:[]});
}else{
 const line=label=>prompt.split('\\n').find(l=>l.startsWith(label)),declared=line('Exact declared response JSON Schema: '),review=line('Declared review: ');
 const kind=props.kind?.const??(declared===undefined?undefined:JSON.parse(declared.slice(declared.indexOf('{'))).properties?.kind?.const)??'consumer_outcome_assessment';
 const basis=JSON.parse(line('Exact assessment basis: ').slice('Exact assessment basis: '.length)),root=line('Worksite root: ').slice('Worksite root: '.length);
 const candidate=readFileSync(join(root,basis.candidate.path),'utf8'),met=basis.candidate.path!=='generated/hello-world.mjs'||candidate.includes('Hello, world!');
 emit('assess:'+(review===undefined?'uat':JSON.parse(review.slice('Declared review: '.length)).reviewRef),{kind,disposition:met?'satisfied':'unmet',reason:'Scripted assessment of '+basis.candidate.path+'.',unresolvedCriteria:met?[]:['output']},{candidate:basis.candidate.path});
}
`;
// One installed Public start of the library with two required reviews and the
// scripted actor. `touch` seeds one more path in the read scope, grants it to
// Construction and adds it to review A's readFirst only.
async function publicReviewsRun(t,{identity,touch=null}){
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,{purposes:['construction','testing','review','uat'],bound:12}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const proof=join(env.scratch,identity);await mkdir(proof);
  const actor=join(proof,'review-actor.mjs'),actorLog=join(proof,'review-actor.jsonl');
  await writeFile(actor,'#!'+process.execPath+'\n'+REVIEW_ACTOR);await chmod(actor,0o755);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  const witness=await witnessInput({product,selection,seedRoot:worksite}),[b,a]=declaredReviews();let original=witness.original,reviews=[b,a];
  if(touch!==null){await writeFile(join(worksite,touch),'Seeded review input.\n');const {construction}=original.workOrders;
    original={...original,readRoots:[...original.readRoots,touch].sort(),workOrders:{...original.workOrders,construction:{...construction,writeRoots:[...construction.writeRoots,touch]}}};
    reviews=[b,{...a,order:{...a.order,readFirst:[...a.order.readFirst,touch]}}];}
  const input=product.constructGovernanceWorkState({...original,reviews});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);assert.equal(env.catalogView.kind,'graph_function_catalog_view');
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity,runEnvironmentResourceFactory:selectedEnvironment.resources});
  const execution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:identity+'-start',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,
    environment:{...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_REVIEW_ACTOR_LOG:actorLog,...(touch===null?{}:{ABI5_REVIEW_ACTOR_TOUCH:touch})}});
  const receipt=execution.output?.receipt;assert.ok(receipt,JSON.stringify(execution).slice(0,4000));assert.equal(receipt.failure,null,JSON.stringify(receipt).slice(0,4000));
  if(receipt.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before),results=events.filter(e=>e.kind==='c_call_result_admitted');
  const log=(await readFile(actorLog,'utf8').catch(()=>'')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
  const diagnostic=()=>JSON.stringify({roles:log.map(r=>r.role),trace:events.filter(e=>['child_preparation_refused','runtime_failure_observed','actor_invocation_failed','run_stopped'].includes(e.kind))
    .slice(0,6).map(e=>({kind:e.kind,graphFunctionRef:e.graphFunctionRef,payload:JSON.stringify(e.payload).slice(0,600)})),ownerOutput:receipt.ownerOutput}).slice(0,6000);
  assert.equal(receipt.ownerOutput.outcomeKind,'result',diagnostic());assert.equal(receipt.ownerOutput.value.disposition,'completed',diagnostic());
  return {input,worksite,events,results,log,diagnostic};
}
test('one Public start with two required framed reviews: each frame runs on the one assessor, adverse or stale review keeps the Run open, only the touched review reruns',{timeout:600_000},async t=>{
  const {worksite,events,results,log,diagnostic}=await publicReviewsRun(t,{identity:'framed-reviews'});
  // The order: Construction; review B satisfied; review A adverse; correcting Construction; Testing; UAT satisfied; review A rerun.
  assert.deepEqual(log.map(r=>r.role),['select:construction','native','select:review:'+REVIEW_B,'assess:'+REVIEW_B,'select:review:'+REVIEW_A,'assess:'+REVIEW_A,
    'select:construction','native','select:testing','c2','select:uat','assess:uat','select:review:'+REVIEW_A,'assess:'+REVIEW_A],diagnostic());
  const choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>[e.payload.value.graphFunctionRef,e.payload.value.input.value.synthesis.judgment.reviewRef]);
  assert.deepEqual(choices,[[ref('construction'),null],[ref('review'),REVIEW_B],[ref('review'),REVIEW_A],[ref('construction'),null],[ref('testing'),null],[ref('uat'),null],[ref('review'),REVIEW_A]]);
  const assessor=product.NATIVE_WORKSPACE_WORK_IDS.assessmentGraphFunctionRef;
  assert.equal(events.filter(e=>e.kind==='c_call_opened'&&e.graphFunctionRef===assessor).length,4,'every frame and acceptance run on the one assessor graph');
  const parents=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')&&e.payload.value?.kind==='governance_work_state').map(e=>e.payload.value);
  const final=parents.at(-1),reviewRows=final.observations.filter(o=>o.purpose==='review');
  assert.deepEqual(reviewRows.map(o=>[o.reviewRef,o.value.disposition]),[[REVIEW_B,'satisfied'],[REVIEW_A,'unmet'],[REVIEW_A,'satisfied']],'B ran once; only A, whose subject changed, reran');
  assert.deepEqual(parents.map(p=>p.terminal),[...parents.slice(1).map(()=>false),true],'only the last parent evaluation closes');
  // After satisfied UAT the parent stays open: A's latest verdict is adverse and its subject has since changed.
  const accepted=parents.find(p=>p.observations.at(-1)?.purpose==='uat');
  assert.equal(accepted.observations.at(-1).value.disposition,'satisfied');assert.equal(accepted.terminal,false);
  assert.deepEqual(accepted.reviewStanding.map(r=>[r.reviewRef,r.satisfied,r.current]),[[REVIEW_B,true,true],[REVIEW_A,false,false]]);
  assert.deepEqual(final.reviewStanding.map(r=>[r.reviewRef,r.required,r.resultRef,r.satisfied,r.current]),
    [[REVIEW_B,true,reviewRows[0].resultRef,true,true],[REVIEW_A,true,reviewRows[2].resultRef,true,true]],'final standing: every required review satisfied and current');
  assert.deepEqual(final.unresolvedSupportRefs,[]);assert.equal(product.isGovernanceWorkState(final),true);
  assert.equal(events.filter(e=>e.kind==='run_closed').length,1);assert.equal(events.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.equal(await readFile(join(worksite,'generated/hello-world.mjs'),'utf8'),'console.log("Hello, world!");\n');
  t.diagnostic(JSON.stringify({roles:log.map(r=>r.role),choices,parents:parents.length,events:events.length}));
});
test('one Public start: a Construction that changes only review A readFirst input retires A through the event-log invalidation owner; B stays current and only A reruns',{timeout:600_000},async t=>{
  const TOUCH='generated/review-input.md',{input,worksite,events,results,log,diagnostic}=await publicReviewsRun(t,{identity:'framed-reviews-read-first',touch:TOUCH});
  const [B,A]=input.original.reviews,dependencies=r=>product.governanceAssessmentDependencies(r.order,r.assessment);
  assert.ok(A.order.readFirst.includes(TOUCH)&&dependencies(A).includes(TOUCH));
  assert.equal([...A.assessment.sources,A.assessment.candidatePath,A.assessment.rubricPath,...dependencies(B)].includes(TOUCH),false,'only A readFirst names the changed input');
  // Construction; review B; review A; a Construction that rewrites only that input; Testing; UAT satisfied; review A rerun.
  assert.deepEqual(log.map(r=>r.role),['select:construction','native','select:review:'+REVIEW_B,'assess:'+REVIEW_B,'select:review:'+REVIEW_A,'assess:'+REVIEW_A,
    'select:construction','native','select:testing','c2','select:uat','assess:uat','select:review:'+REVIEW_A,'assess:'+REVIEW_A],diagnostic());
  const choices=results.filter(e=>e.payload.value?.kind==='registered_graph_choice').map(e=>[e.payload.value.graphFunctionRef,e.payload.value.input.value.synthesis.judgment.reviewRef]);
  assert.deepEqual(choices,[[ref('construction'),null],[ref('review'),REVIEW_B],[ref('review'),REVIEW_A],[ref('construction'),null],[ref('testing'),null],[ref('uat'),null],[ref('review'),REVIEW_A]]);
  const parents=results.filter(e=>e.graphFunctionRef===witnessRef('graph-function','executive')&&e.payload.value?.kind==='governance_work_state').map(e=>e.payload.value);
  const final=parents.at(-1),reviewRows=final.observations.filter(o=>o.purpose==='review');
  assert.deepEqual(final.observations.filter(o=>o.purpose==='construction').map(o=>o.value.changedPaths),[['generated/hello-world.mjs'],[TOUCH]],'the second Construction changed only the readFirst input');
  assert.deepEqual(reviewRows.map(o=>[o.reviewRef,o.value.disposition]),[[REVIEW_B,'satisfied'],[REVIEW_A,'satisfied'],[REVIEW_A,'satisfied']],'B ran once; only A reran');
  // After satisfied UAT the parent stays open: A is satisfied, but an admitted native effect changed its readFirst input.
  const accepted=parents.find(p=>p.observations.at(-1)?.purpose==='uat');
  assert.equal(accepted.observations.at(-1).value.disposition,'satisfied');assert.equal(accepted.terminal,false);
  assert.deepEqual(accepted.reviewStanding.map(r=>[r.reviewRef,r.satisfied,r.current]),[[REVIEW_B,true,true],[REVIEW_A,true,false]]);
  assert.deepEqual(final.reviewStanding.map(r=>[r.reviewRef,r.required,r.resultRef,r.satisfied,r.current]),
    [[REVIEW_B,true,reviewRows[0].resultRef,true,true],[REVIEW_A,true,reviewRows[2].resultRef,true,true]]);
  assert.deepEqual(parents.map(p=>p.terminal),[...parents.slice(1).map(()=>false),true],'only the last parent evaluation closes');
  assert.equal(events.filter(e=>e.kind==='run_closed').length,1);assert.equal(events.some(e=>e.kind==='runtime_failure_observed'),false);
  assert.equal(await readFile(join(worksite,'generated/hello-world.mjs'),'utf8'),'console.log("Hello, world!");\n');
  assert.equal(await readFile(join(worksite,TOUCH),'utf8'),'Revised review input.\n');
  t.diagnostic(JSON.stringify({roles:log.map(r=>r.role),choices,parents:parents.length,events:events.length}));
});
