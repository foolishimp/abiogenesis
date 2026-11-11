import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,cp,rm} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import * as gtl from '../support/language-test-gtl.mjs';
import {loadWorksiteOwner,worksiteFixture} from '../support/t287-generic-job-worksite.mjs';
import {witnessInput,witnessRef,assessmentContract,assessmentSchema} from '../support/default-library.mjs';
// Declared process prerequisites: the executive step names, per registered
// purpose, the declared reviews that must be satisfied and current before that
// purpose is selected. Pure Product relations run directly; ABG selection intake
// and the choice projection run the built owner linked over controlled
// index/occurrence premises with an actual worksite observation.
const packageRoot=new URL('../..',import.meta.url).pathname;
const witnessRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/',import.meta.url).pathname;
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const h=product.sha256Canonical,ref=p=>product.governanceRef('graph-function',p);
const REVIEW_A=witnessRef('review','code'),REVIEW_B=witnessRef('review','design'),PREREQUISITES={construction:[REVIEW_B],uat:[REVIEW_A]};
const stepOf=graphs=>graphs.find(g=>g.name===ref('executive-step'));
const targetsOf=graphs=>graphs.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>product.governanceTarget(g,h(g),product.governancePrerequisites(stepOf(graphs).declarations)));
const plainSchemaAsset={productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')};
// Two frames over one assessor, as in the declared-review cases: B (design) required, A (code) declared not required.
function declaredReviews(){
  const order=outcome=>({outcome,instructions:['Assess only under the declared reference frame.'],readFirst:['source/original-basic-cli.txt'],writeRoots:[],checks:[]});
  const assessment=(sources,candidatePath,rubricPath)=>({sources,candidatePath,rubricPath,resultContract:assessmentContract,schemaAsset:plainSchemaAsset,verdictField:'disposition',satisfiedValue:'satisfied'});
  return [{reviewRef:REVIEW_B,frame:'Design review: the implementation design conforms to the project conformance rubric.',required:true,
      order:order('The implementation design conforms to the declared project conformance rubric.'),assessment:assessment(['source/original-basic-cli.txt'],'design/implementation-design.md','specification/project-conformance.md')},
    {reviewRef:REVIEW_A,frame:'Code review: the CLI source satisfies the declared oracle.',required:false,
      order:order('The CLI source satisfies the declared oracle.'),assessment:assessment(['source/original-basic-cli.txt','source/witness-contract.md'],'generated/hello-world.mjs','source/basic-cli.oracle.json')}];
}
async function seeded(t){
  const physical=await loadWorksiteOwner(),f=await worksiteFixture(physical);t.after(()=>rm(f.scratch,{recursive:true,force:true}));
  await cp(join(witnessRoot,'seed'),f.canonicalRoot,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));
  const witness=await witnessInput({product,selection,seedRoot:join(witnessRoot,'seed')}),state=product.constructGovernanceWorkState({...witness.original,reviews:declaredReviews()});
  const observed=await physical.observeWorksiteContext({...f,readRoots:state.original.readRoots,maxFiles:state.original.maxContextFiles,maxBytes:state.original.maxContextBytes});
  return {f,witness,state,context:observed,fixed:{...observed,observationRef:'worksite-context-observation://abiogenesis/fixed'}};
}
const row=(purpose,n,value,extra={})=>({purpose,resultRef:'result:'+purpose+':'+n,resultDigest:h(purpose+n),cCallRef:'call:'+purpose+':'+n,actorInvocationRef:'actor:'+purpose+':'+n,
  synthesisResultRef:'result:synthesis:'+n,selectedGraphFunctionRef:ref(purpose),value,...extra});
const verdict=disposition=>({kind:'consumer_outcome_assessment',disposition,reason:'Controlled',unresolvedCriteria:disposition==='satisfied'?[]:['output']});
const C=row('construction',1,{report:{summary:'Designed',gaps:[]},changedPaths:['design/implementation-design.md']}),B=row('review',2,verdict('satisfied'),{reviewRef:REVIEW_B});
// B's standing as the parent computes it: absent, satisfied and current, or stale after a later correction touched its subject.
const reviewedState=(state,b)=>b===undefined?state:{...state,observations:[C,B],reviewStanding:[{reviewRef:REVIEW_B,required:true,resultRef:B.resultRef,satisfied:true,current:b},state.reviewStanding[1]]};
const judgment=(state,next,contributions=[next])=>({interpretation:'Prerequisites',contributions:contributions.map((g,i)=>({graphFunctionRef:g,contribution:'C',reason:'R',supportRefs:state.unresolvedSupportRefs,evidenceRefs:[],dependsOn:i===0?[]:[contributions[0]]})),
  gaps:[],nextGraphFunctionRef:next,nextReason:'Next',nextEvidenceRefs:[],subjectEvidenceRef:null,revisionReason:'Current',revisionEvidenceRefs:[],reviewRef:null});
const synthesisBasis=(task,inputRef='input:synthesis')=>({inputRef,inputDigest:h(task),taskRef:task.state.original.taskRef,environmentRef:'environment:fixed',environmentDigest:h('environment'),
  frameEvidenceDigest:h('frame'),frameRefs:['frame:fixed'],contextRef:task.context.observationRef,previousResultRef:null});

// Head 3a02bb52f digests of the same constructions (computed against that build).
const HEAD_PINS={graphs:'sha256:d29a3c03a28b2f10d64dfe0171cea257cd08e8a7cb6bfb6579f8f837cef0f779',library:'sha256:30d2ea23ee66155bd507483aae238e511096eaf4ad46d2816465ad62f7459c82',
  bindings:'sha256:903382114338af04a61b17f6306316fa5e586298b5562974f11a50e406c0fc23',environment:'sha256:6a089e94985d54e96c82a2c8de4bc2e10938d4ba31f36dc8031e752bd9080e32',
  reviewed:'sha256:fc520d836a81eda8f36b56610d0e0ad2e51cdd5d50ebf6bb4c3664a3cfffa0ba',view:'sha256:1fd0cc97a81bebb1f281c2ce7d1dec058dfcc136492429426ebd0fb7e463f8d7',
  schema:'sha256:c2e7b76317fc6707d6701f601dbb93cedb40faf6a15594304c084b7dc9cded5d'};
test('a Program without a process declaration keeps its definitions, selector view and response schema; a declaration changes only the executive step',async t=>{
  const {state,fixed}=await seeded(t),task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context:fixed};
  const graphs=gtl.defaultGovernanceGraphFunctions(),targets=targetsOf(graphs);
  assert.ok(targets.every(target=>!Object.hasOwn(target,'requiredReviews')));
  assert.deepEqual({graphs:h(graphs),library:h(gtl.constructDefaultGovernanceLibraryModulePublication(basis)),bindings:h(gtl.defaultLibraryImplementationBindings(basis)),
    environment:h(gtl.defaultLibraryRunEnvironment()),reviewed:h(state),view:h(product.projectFramedSynthesisPromptTask(task)),schema:h(product.framedSynthesisResponseSchema(task,targets))},HEAD_PINS);
  assert.deepEqual(product.projectFramedSynthesisPromptTask(task,undefined,targets),product.projectFramedSynthesisPromptTask(task),'undeclared targets add no view section');
  const declared=gtl.defaultGovernanceGraphFunctions({prerequisites:PREREQUISITES}),step=stepOf(declared);
  assert.deepEqual(declared.filter(g=>g!==step),graphs.filter(g=>g.name!==step.name),'parent and wrappers are unchanged');
  const {[product.GOVERNANCE_PREREQUISITES_DECLARATION]:text,...rest}=step.declarations;
  assert.deepEqual({...step,declarations:rest},stepOf(graphs));assert.equal(text,JSON.stringify(PREREQUISITES),'one canonical declaration');
});
test('the declaration is canonical JSON naming registered non-review purposes, each with a nonempty unique list of reviews; the library refuses any other',()=>{
  const read=text=>product.governancePrerequisites(text===undefined?{}:{[product.GOVERNANCE_PREREQUISITES_DECLARATION]:text});
  assert.equal(read(undefined),undefined);assert.deepEqual(read('{"construction":["r"],"uat":["s","t"]}'),{construction:['r'],uat:['s','t']});
  for(const bad of ['','x','null','[]','{}','{"review":["r"]}','{"deploy":["r"]}','{"construction":[]}','{"construction":["r","r"]}','{"construction":[""]}',
    '{"uat":["s"],"construction":["r"]}','{"construction": ["r"]}'])assert.equal(read(bad),null,bad);
  for(const [label,options] of [['review purpose',{prerequisites:{review:['r']}}],['empty',{prerequisites:{}}],
    ['no review wrapper',{purposes:['construction','testing','uat'],prerequisites:{construction:['r']}}],['unregistered purpose',{purposes:['construction','review','uat'],prerequisites:{testing:['r']}}]])
    assert.throws(()=>gtl.defaultGovernanceGraphFunctions(options),/process prerequisites/,label);
});
test('the permitted relation reads the parent standing: a required review must be satisfied and current, a not-required review does not gate, a stale review gates again',async t=>{
  const {witness,state,context}=await seeded(t),permission=(s,purpose,requiredReviews)=>product.governanceTargetPermission({kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:s,context},{purpose,requiredReviews});
  const missing=(satisfied,current)=>[{reviewRef:REVIEW_B,satisfied,current}];
  assert.deepEqual(permission(state,'construction',[REVIEW_B]),{offered:true,permitted:false,missingSelectedPaths:[],missingReviews:missing(false,false)});
  assert.deepEqual(permission(reviewedState(state,true),'construction',[REVIEW_B]),{offered:true,permitted:true,missingSelectedPaths:[],missingReviews:[]});
  assert.deepEqual(permission(reviewedState(state,false),'construction',[REVIEW_B]).missingReviews,missing(true,false),'a correction that touched the subject gates again');
  const adverse={...state,observations:[C,{...B,value:verdict('unmet')}],reviewStanding:[{...reviewedState(state,true).reviewStanding[0],satisfied:false},state.reviewStanding[1]]};
  assert.ok(product.isGovernanceWorkState(adverse)&&product.isGovernanceWorkState(reviewedState(state,false)));
  assert.deepEqual(permission(adverse,'construction',[REVIEW_B]).missingReviews,missing(false,true));
  assert.equal(permission(state,'uat',[REVIEW_A]).permitted,true,'a review the task declares not required does not gate');
  assert.deepEqual(permission(state,'uat',['review://foreign/x@5']).missingReviews,[{reviewRef:'review://foreign/x@5',satisfied:false,current:false}],'an undeclared review is missing');
  assert.equal(permission(state,'review',[]).permitted,true);assert.equal(permission(state,'construction',undefined).permitted,true,'no declaration, no prerequisite');
  const plain=product.constructGovernanceWorkState(witness.original);
  assert.deepEqual(permission(plain,'review',undefined),{offered:false,permitted:false,missingSelectedPaths:[],missingReviews:[]},'the review wrapper needs declared reviews');
  const task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state,context};
  assert.deepEqual(permission(state,'testing',[]).missingSelectedPaths,product.projectFramedSynthesisPromptTask(task).testingPrerequisites.missingSelectedPaths,'Testing keeps its selected-path rule');
  assert.deepEqual(product.governancePrerequisitesUndeclared(state.original,PREREQUISITES),[]);
  assert.deepEqual(product.governancePrerequisitesUndeclared(plain.original,PREREQUISITES),[REVIEW_B,REVIEW_A]);
});
test('view, schema and binder apply the one relation: only permitted targets can be next, a non-permitted target stays plannable future work',async t=>{
  const {state,context}=await seeded(t),graphs=gtl.defaultGovernanceGraphFunctions({prerequisites:PREREQUISITES}),targets=targetsOf(graphs);
  assert.deepEqual(targets.map(r=>[r.purpose,r.requiredReviews]),[['induction',[]],['specification',[]],['design',[]],['construction',[REVIEW_B]],['testing',[]],['review',[]],['uat',[REVIEW_A]]]);
  const {default:Ajv2020}=await import('ajv/dist/2020.js'),ajv=new Ajv2020({strict:false});
  const at=(b,inputRef)=>{const s=reviewedState(state,b),task={kind:'framed_synthesis_task',schemaVersion:'5.0.0',state:s,context},schema=product.framedSynthesisResponseSchema(task,targets);
    return {s,task,schema,validate:ajv.compile(schema),view:product.projectFramedSynthesisPromptTask(task,undefined,targets),bind:raw=>product.bindFramedSynthesisResult(task,targets,synthesisBasis(task,inputRef),raw)};};
  for(const [b,permitted] of [[undefined,false],[true,true],[false,false]]){
    const x=at(b,'input:'+b),early=judgment(x.s,ref('construction')),planned=judgment(x.s,ref('design'),[ref('design'),ref('construction')]);
    assert.equal(x.schema.properties.nextGraphFunctionRef.enum.includes(ref('construction')),permitted);
    assert.ok(x.schema.properties.contributions.items.properties.graphFunctionRef.enum.includes(ref('construction')),'future work stays plannable');
    assert.equal(x.validate(early),permitted,'schema '+b);assert.equal(x.bind(early)!==null,permitted,'binder '+b);
    assert.equal(x.validate(planned),true);assert.ok(x.bind(planned),'a plan naming non-permitted future work binds');
    const construction=x.view.prerequisites.targets.find(r=>r.purpose==='construction');
    assert.deepEqual([construction.requiredReviews,construction.permitted,construction.missingReviews.length===0],[[REVIEW_B],permitted,permitted]);
    assert.deepEqual(x.view.prerequisites.targets.map(r=>r.graphFunctionRef),targets.map(r=>r.graphFunctionRef),'each offered target is shown');
    assert.equal(x.view.prerequisites.targets.find(r=>r.purpose==='uat').permitted,true,'not required, not gating');
    assert.match(x.view.prerequisites.meaning,/^Only permitted work can be selected next:[^.]*\.$/,'one sentence');
  }
});

// The built ABG owner linked over controlled index/occurrence premises: the
// governance root, invocation, execution basis and Result index are fixture
// rows; the worksite observation and every Product relation are actual.
async function rootProjection(indexed,rehydrateExecutionBasisAtPrefix){
  const file=resolve(packageRoot,'build/code/src/abg/semantic_job.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async s=>{const actual=await import(s.startsWith('node:')||!s.startsWith('.')?s:pathToFileURL(resolve(dirname(file),s)).href);
    const values={...actual,...(s==='./event_prefix.js'?{indexedRuntimeEvents:(p,key)=>indexed(p,key,actual.indexedRuntimeEvents)}:s==='./execution_basis.js'?{rehydrateExecutionBasisAtPrefix}:{})};
    return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();return {...m.namespace};
}
async function stepOwner(f,initial,graphs){
  const library=gtl.constructDefaultGovernanceLibraryModulePublication(basis),step=stepOf(graphs),rows=[];
  const invocation={invocationRef:'invocation:prerequisites',invocationAdmissionRef:'invocation-admission:prerequisites',capabilityGrants:[f.capabilityGrant]};
  const execution={basisRef:'basis:step',invocationRef:invocation.invocationRef,parentExecutionBasisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,rootImplementationSetRef:'set:prerequisites',
    workspaceBindingId:f.workspaceBinding.bindingId,workspaceBindingDigest:f.workspaceBinding.bindingDigest,
    registeredSelectionDefinitionDigests:Object.fromEntries(graphs.filter(g=>g.declarations['abg.default_library_purpose']).map(g=>[g.name,h(g)]))};
  const root={kind:'basis_admitted',payload:{basisClass:'root',basisRef:'basis:root',invocationAdmissionRef:invocation.invocationAdmissionRef,implementationSetRef:execution.rootImplementationSetRef,rawInputValue:initial}};
  const owned={program:library.programs[0],prefix:{},events:rows,execution,graph:{template:step.template},environment:{kind:'exact_prefix_workspace_environment',workspaceAuthorityBasis:f.workspaceAuthorityBasis,workspaceBinding:f.workspaceBinding,productInstalls:[]},
    call:{runId:'run:prerequisites',graphCallId:'graph-call:prerequisites',outputContractRef:product.governanceContract('choice')},inputValue:null,inputRef:'input:prerequisites',inputOrigin:{}};
  const index=(_p,key)=>key==='invocation:'+invocation.invocationRef?[root]:rows.filter(e=>key==='payload:resultRef:'+e.payload.resultRef||key==='related:'+e.aggregateId);
  const rootBasis=(_p,r)=>r===root.payload.basisRef?{...execution,basisRef:r,parentExecutionBasisRef:null,rawInputValue:initial}:null;
  const file=resolve(packageRoot,'build/code/src/abg/default_library.js'),m=new SourceTextModule(await readFile(file,'utf8'),{identifier:file});
  await m.link(async specifier=>{const actual=await import(specifier.startsWith('node:')?specifier:pathToFileURL(resolve(dirname(file),specifier)).href);
    const replacements=specifier==='./execution_basis.js'?{authenticateOwnedNativeInstructionAssemblyBasis:()=>owned}:specifier==='./invocation_execution_truth.js'?{projectExactInvocationAdmissionAtPrefix:()=>invocation,projectExactExecutionBasisAtPrefix:()=>({...execution})}:
      specifier==='./event_prefix.js'?{indexedRuntimeEvents:index}:specifier==='./semantic_job.js'?await rootProjection(index,rootBasis):{};
    const values={...actual,...replacements};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();
  const node=locus=>step.template.nodes.find(n=>n.nodeRef===step.declarations[locus]);
  const at=(operation,input)=>{owned.inputValue=input;owned.call.implementationRef=product.governanceRef('implementation',operation);};
  // One admitted selector input and its admitted Result, as the Run would index them.
  const project=(task,result,graphFunction=step,refusal)=>{
    rows.length=0;rows.push({kind:'c_call_result_admitted',runId:owned.call.runId,basisId:execution.basisRef,aggregateId:'call:prepare-selection',payload:{resultClass:'success',resultRef:result.basis.inputRef,valueDigest:result.basis.inputDigest,value:task}},
      {kind:'c_call_opened',runId:owned.call.runId,basisId:execution.basisRef,aggregateId:'call:select',payload:{programLocusRef:node('abg.framed_synthesis_locus').nodeRef}});
    owned.inputRef='result:select';owned.inputOrigin={event:{kind:'c_call_result_admitted',runId:owned.call.runId,basisId:execution.basisRef,graphCallId:owned.call.graphCallId,aggregateId:'call:select',
      payload:{resultClass:'success',resultRef:owned.inputRef,resultDigest:h(result)}}};at('project-choice',result);
    const cursor={currentNodeRef:node('abg.framed_synthesis_projection').nodeRef,termPath:gtl.rootCSourcePath(node('abg.framed_synthesis_projection').nodeRef)};
    return m.namespace.projectGovernanceChoice({graphFunction,declarationGraphFunctions:graphs,cursor},result,refusal);};
  return {m:m.namespace,owned,step,at,project};
}
test('selection intake refuses a task that does not declare every Program-named review and names the missing reviews',async t=>{
  const {f,witness,state}=await seeded(t),graphs=gtl.defaultGovernanceGraphFunctions({prerequisites:PREREQUISITES});
  const refusals=[],refusal=(stage,relation,selectors)=>refusals.push([stage,relation,selectors]);
  const partial=product.constructGovernanceWorkState({...witness.original,reviews:[declaredReviews()[0]]});
  const x=await stepOwner(f,partial,graphs);x.at('prepare-selection',partial);
  assert.equal(await x.m.projectGovernanceSelection({graphFunction:x.step},partial,refusal),null);
  assert.deepEqual(refusals,[['selection_intake','process_review_undeclared',{reviewRefs:REVIEW_A}]]);
  const plain=product.constructGovernanceWorkState(witness.original),y=await stepOwner(f,plain,graphs);y.at('prepare-selection',plain);refusals.length=0;
  assert.equal(await y.m.projectGovernanceSelection({graphFunction:y.step},plain,refusal),null);
  assert.deepEqual(refusals,[['selection_intake','process_review_undeclared',{reviewRefs:REVIEW_B+' '+REVIEW_A}]]);
  const malformed={...y.step,declarations:{...y.step.declarations,[product.GOVERNANCE_PREREQUISITES_DECLARATION]:'{"construction": []}'}};refusals.length=0;
  assert.equal(await y.m.projectGovernanceSelection({graphFunction:malformed},plain,refusal),null);assert.deepEqual(refusals,[['selection_intake','process_declaration',{}]]);
  // Every named review declared, required or not: intake admits the same task a Program without a declaration would.
  const z=await stepOwner(f,state,graphs);z.at('prepare-selection',state);
  const task=await z.m.projectGovernanceSelection({graphFunction:z.step},state);assert.ok(product.isFramedSynthesisTask(task));
  assert.equal(z.m.governanceResultMatches({graphFunction:z.step},state,task),true);
  assert.equal(x.m.governanceResultMatches({graphFunction:x.step},partial,{...task,state:partial}),false,'a result cannot cross the intake');
  assert.deepEqual(await z.m.projectGovernanceSelection({graphFunction:stepOf(gtl.defaultGovernanceGraphFunctions())},state),task);
});
test('the choice projection applies the permitted relation to the admitted selector input: a non-permitted choice is refused',async t=>{
  const {f,state}=await seeded(t),graphs=gtl.defaultGovernanceGraphFunctions({prerequisites:PREREQUISITES}),targets=targetsOf(graphs),x=await stepOwner(f,state,graphs);
  x.at('prepare-selection',state);const prepared=await x.m.projectGovernanceSelection({graphFunction:x.step},state);assert.ok(prepared);
  const taskAt=b=>({...prepared,state:reviewedState(state,b)});
  const choose=(b,next)=>{const task=taskAt(b),raw=judgment(task.state,next);
    return {task,bound:product.bindFramedSynthesisResult(task,targets,synthesisBasis(task),raw),forged:{kind:'framed_synthesis_result',schemaVersion:'5.0.0',state:task.state,basis:synthesisBasis(task),judgment:raw}};};
  const design=choose(undefined,ref('design'));assert.ok(design.bound);assert.equal(x.project(design.task,design.bound).graphFunctionRef,ref('design'));
  for(const [b,permitted] of [[undefined,false],[true,true],[false,false]]){
    const {task,bound,forged}=choose(b,ref('construction'));assert.ok(product.isFramedSynthesisResult(forged));assert.equal(bound!==null,permitted,'binder '+b);
    const refusals=[],choice=x.project(task,forged,undefined,(...r)=>refusals.push(r));assert.equal(choice?.graphFunctionRef??null,permitted?ref('construction'):null,'projection '+b);
    assert.deepEqual(refusals,permitted?[]:[['choice_projection','target_not_permitted',{graphFunctionRef:ref('construction'),missingReviews:REVIEW_B}]]);
    if(permitted)assert.deepEqual(choice.input.value.reviewStanding,task.state.reviewStanding);
  }
  // The refusal is the declared relation: the same forged choice under the undeclared step is selected.
  const {task,forged}=choose(undefined,ref('construction')),plain=gtl.defaultGovernanceGraphFunctions();
  assert.equal(x.project(task,forged,stepOf(plain)).graphFunctionRef,ref('construction'));
  // The admitted selector input owns the standing: a forged result over another standing has no input.
  const {forged:crossed}=choose(true,ref('construction'));assert.equal(x.project(task,crossed),null);
});
