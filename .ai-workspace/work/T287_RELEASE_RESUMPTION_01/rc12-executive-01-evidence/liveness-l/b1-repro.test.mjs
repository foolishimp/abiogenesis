// RC12 B1 read-only reproduction harness (untracked scratch). Reuses the
// scripted stand-in of t287-default-library-reviews.test.mjs (last test) and
// makes one declared role fail in one declared way. B1_SCENARIO selects it.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,chmod} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const T='/private/tmp/abg-rc12-executive-20261111/build_tenants/abiogenesis/typescript';
const S='/private/tmp/abg-rc12-executive-20261111/qualification-scratch/rc12-executive-01/b1';
const product=await import(T+'/build/code/src/product/index.js');
const {setupInstalledRootCatalog}=await import(T+'/test_env/support/root-installed-environment.mjs');
const {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest,pendingExecutionUseRequest,constructInstalledPendingCall,constructInstalledRunReadCall}=await import(T+'/test_env/support/registered-graph-selection.mjs');
const {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentContract,assessmentSchema,schemaPath}=await import(T+'/test_env/support/default-library.mjs');
const packageRoot=T+'/';
const witnessRoot='/private/tmp/abg-rc12-executive-20261111/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness';
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
const REVIEW_A=witnessRef('review','code'),REVIEW_B=witnessRef('review','design');
const plainSchemaAsset={productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')};
function declaredReviews(){
  const order=outcome=>({outcome,instructions:['Assess only under the declared reference frame.'],readFirst:['source/original-basic-cli.txt'],writeRoots:[],checks:[]});
  const assessment=(sources,candidatePath,rubricPath)=>({sources,candidatePath,rubricPath,resultContract:assessmentContract,schemaAsset:plainSchemaAsset,verdictField:'disposition',satisfiedValue:'satisfied'});
  return [{reviewRef:REVIEW_B,frame:'Design review: the implementation design conforms to the project conformance rubric.',required:true,
      order:order('The implementation design conforms to the declared project conformance rubric.'),assessment:assessment(['source/original-basic-cli.txt'],'design/implementation-design.md','specification/project-conformance.md')},
    {reviewRef:REVIEW_A,frame:'Code review: the CLI source satisfies the declared oracle.',required:true,
      order:order('The CLI source satisfies the declared oracle.'),assessment:assessment(['source/original-basic-cli.txt','source/witness-contract.md'],'generated/hello-world.mjs','source/basic-cli.oracle.json')}];
}
// Same scripted stand-in as the reviews test, plus one declared failure point.
// B1_FAIL_ROLE: native | assess ; B1_FAIL_MODE: exit | absolute | inactivity | bad ;
// B1_FAIL_TIMES: how many matching invocations fail (default: all).
const ACTOR=`
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {join} from 'node:path';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_REVIEW_ACTOR_LOG;
const prior=existsSync(log)?readFileSync(log,'utf8').trim().split('\\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const FAIL_ROLE=process.env.B1_FAIL_ROLE??'',FAIL_MODE=process.env.B1_FAIL_MODE??'',FAIL_TIMES=Number(process.env.B1_FAIL_TIMES??'1000');
const emit=(role,output,extra={})=>{appendFileSync(log,JSON.stringify({role,...extra})+'\\n');console.log(JSON.stringify({type:'system',subtype:'init'}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);};
const fail=(role,partial)=>{
 const failed=prior.filter(r=>r.role==='fail:'+FAIL_ROLE).length;if(role!==FAIL_ROLE||failed>=FAIL_TIMES)return;
 appendFileSync(log,JSON.stringify({role:'fail:'+FAIL_ROLE,mode:FAIL_MODE,cwd:process.cwd()})+'\\n');
 if(partial)writeFileSync('generated/hello-world.mjs','console.log("partial work left by a failed worker");\\n');
 console.log(JSON.stringify({type:'system',subtype:'init'}));
 if(FAIL_MODE==='exit'){process.stderr.write('scripted provider failure\\n');process.exit(3);}
 if(FAIL_MODE==='absolute'){setInterval(()=>console.log(JSON.stringify({type:'assistant',message:{content:[{type:'text',text:'still working'}]}})),300);return 'hold';}
 if(FAIL_MODE==='inactivity'){setInterval(()=>{},1e9);return 'hold';}
 if(FAIL_MODE==='scope'){writeFileSync('design/implementation-design.md','scripted out-of-scope edit by a worker\\n');const output={summary:'Scripted schema-valid report after an out-of-scope write.',gaps:[]};console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);}
 if(FAIL_MODE==='bad'){const output={summary:'Scripted result the binder must refuse.'};console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);}
 throw new Error('unknown fail mode '+FAIL_MODE);
};
const tasks=prompt.split('\\n\\n').filter(x=>x.startsWith('## task\\n')).map(x=>x.slice('## task\\n'.length));let c2=null;
if(tasks.length===1)try{const owner=JSON.parse(tasks[0]).ownerPrompt,input=JSON.parse(owner.split('\\n\\n')[1]);if(Object.keys(input).length===1&&typeof input.command==='string')c2=input;}catch{}
const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{};
if(c2){console.log(JSON.stringify({type:'system',subtype:'init'}));console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_review_c2',name:'Bash',input:c2}]}}));
 const helper=spawnSync('/bin/sh',['-c',c2.command],{encoding:'utf8',maxBuffer:64*1024*1024});if(helper.status!==0){process.stderr.write(String(helper.stderr));process.exit(1);}
 appendFileSync(log,JSON.stringify({role:'c2'})+'\\n');console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout)}));process.exit(0);}
else if('interpretation' in props){
 const view=JSON.parse(tasks[0]),rows=view.observations,last=p=>rows.findLastIndex(r=>r.purpose===p),reviews=view.reviews.declared;
 appendFileSync(process.env.ABI5_REVIEW_ACTOR_LOG+'.views',JSON.stringify(view)+'\\n');
 const graph=p=>(props.nextGraphFunctionRef.enum??[]).find(g=>typeof g==='string'&&g.includes('/'+p+'@'));
 const construction=rows.findLast(r=>r.purpose==='construction'),testing=rows.findLast(r=>r.purpose==='testing');
 const adverse=reviews.some(r=>r.standing.resultRef!==null&&r.standing.current&&!r.standing.satisfied),unrun=reviews.find(r=>r.required&&r.standing.resultRef===null);
 const pending=reviews.find(r=>r.required&&!(r.standing.satisfied&&r.standing.current)),tested=testing!==undefined&&last('testing')>last('construction');
 let next=null,subject=null,reviewRef=null;
 if(!construction||adverse)next='construction';
 else if(unrun)[next,reviewRef,subject]=['review',unrun.reviewRef,construction.resultRef];
 else if(!tested)[next,subject]=['testing',construction.resultRef];
 else if(last('uat')<last('testing'))[next,subject]=['uat',testing.resultRef];
 else if(pending)[next,reviewRef,subject]=['review',pending.reviewRef,construction.resultRef];
 const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[],target=next===null?null:graph(next);
 emit('select:'+(next??'gap')+(reviewRef?':'+reviewRef:''),{interpretation:'Scripted review-aware selector.',contributions:[{graphFunctionRef:target??graph('construction'),contribution:'Scripted contribution.',reason:'Scripted ordered policy.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
  gaps:next===null?[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}]:[],nextGraphFunctionRef:target,nextReason:'Scripted ordered policy.',nextEvidenceRefs:[],subjectEvidenceRef:subject,
  revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef}:{})},{rows:rows.map(r=>r.purpose+':'+(r.value?.kind??r.value?.disposition??'?')),standing:reviews.map(r=>({reviewRef:r.reviewRef,...r.standing}))});
}else if('summary' in props&&'gaps' in props){
 if(!existsSync('generated/hello-world.mjs')){process.stderr.write('review actor expects the worksite cwd\\n');process.exit(1);}
 if(fail('native',true)!=='hold'){
 const first=!prior.some(r=>r.role==='native');writeFileSync('generated/hello-world.mjs',first?'console.log("Hello world");\\n':'console.log("Hello, world!");\\n');
 emit('native',{summary:first?'Scripted first construction.':'Scripted correction.',gaps:[]});}
}else{
 if(fail('assess',false)!=='hold'){
 const line=label=>prompt.split('\\n').find(l=>l.startsWith(label)),declared=line('Exact declared response JSON Schema: '),review=line('Declared review: ');
 const kind=props.kind?.const??(declared===undefined?undefined:JSON.parse(declared.slice(declared.indexOf('{'))).properties?.kind?.const)??'consumer_outcome_assessment';
 const basis=JSON.parse(line('Exact assessment basis: ').slice('Exact assessment basis: '.length)),root=line('Worksite root: ').slice('Worksite root: '.length);
 const candidate=readFileSync(join(root,basis.candidate.path),'utf8'),met=basis.candidate.path!=='generated/hello-world.mjs'||candidate.includes('Hello, world!');
 emit('assess:'+(review===undefined?'uat':JSON.parse(review.slice('Declared review: '.length)).reviewRef),{kind,disposition:met?'satisfied':'unmet',reason:'Scripted assessment of '+basis.candidate.path+'.',unresolvedCriteria:met?[]:['output']},{candidate:basis.candidate.path});}
}
`;
const SCENARIOS={
  a:{role:'native',mode:'exit'},
  b:{role:'native',mode:'absolute',limits:{ABG_TS_FP_TIMEOUT_MS:'6000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'12000',ABG_TS_FP_TERMINATION_GRACE_MS:'1500'}},
  c:{role:'native',mode:'inactivity',limits:{ABG_TS_FP_TIMEOUT_MS:'6000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'12000',ABG_TS_FP_TERMINATION_GRACE_MS:'1500'}},
  d:{role:'native',mode:'bad'},
  d2:{role:'native',mode:'scope'},
  e:{role:'assess',mode:'exit'},
  a1:{role:'native',mode:'exit',times:'1'},
  q3:{role:'',mode:'',bound:2},
};
const name=process.env.B1_SCENARIO??'a',sc=SCENARIOS[name];assert.ok(sc,'scenario '+name);
const short=r=>typeof r==='string'?r.replace(/^.*\/(?=[^/]+$)/,'').replace(/^graph-function:\/\//,''):r;
const pick=p=>{if(!p||typeof p!=='object')return {};const o={};
  for(const k of ['judgment','resultClass','failureClass','failureCode','code','reasonCode','reason','routeKind','disposition','timeoutClass','callClass','stageRole','terminationClass','exitCode','signal','status','outcome','stopClass','blockClass','gapClass','attempt','maxAttempts'])
    if(p[k]!==undefined&&(typeof p[k]!=='object'))o[k]=typeof p[k]==='string'?p[k].slice(0,160):p[k];
  if(p.value&&typeof p.value==='object'){o.valueKind=p.value.kind;if(p.value.failureClass)o.valueFailureClass=p.value.failureClass;if(p.value.disposition)o.valueDisposition=p.value.disposition;
    if(p.value.kind==='registered_graph_choice')o.choice=short(p.value.graphFunctionRef);if(p.value.terminal!==undefined)o.terminal=p.value.terminal;
    if(Array.isArray(p.value.changedPaths))o.changedPaths=p.value.changedPaths;if(p.value.kind==='native_workspace_work_failure')o.failureAfter=p.value.after===null?null:'observed';}
  return o;};
test('B1 scenario '+name,{timeout:900_000},async t=>{
  const out=join(S,'scenario-'+name);await mkdir(out,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,{purposes:['construction','testing','review','uat'],bound:sc.bound??12}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('file://'+T+'/test_env/fixtures/default-library-product/index.mjs')}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const proof=join(env.scratch,'b1');await mkdir(proof);
  const actor=join(proof,'actor.mjs'),actorLog=join(out,'actor.jsonl');await writeFile(actorLog,'');await writeFile(actorLog+'.views','');
  await writeFile(actor,'#!'+process.execPath+'\n'+ACTOR);await chmod(actor,0o755);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  const witness=await witnessInput({product,selection,seedRoot:worksite}),input=product.constructGovernanceWorkState({...witness.original,reviews:declaredReviews()});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store'),cc=await load('abg/construction_continuation'),replayOwner=await load('abg/replay');
  const currentness=await load('abg/native_worksite_execution'),effectOwner=await load('abg/native_work_effect');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const actorEnv={...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_REVIEW_ACTOR_LOG:actorLog,B1_FAIL_ROLE:sc.role,B1_FAIL_MODE:sc.mode,...(sc.times?{B1_FAIL_TIMES:sc.times}:{}),...(sc.limits??{})};
  const cli=async(identity,call)=>{const t0=Date.now();
    const execution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:actorEnv});
    const receipt=execution.output?.receipt;
    if(receipt?.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
    return {receipt,output:execution.output,wallMs:Date.now()-t0};};
  const read=()=>storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const summary={scenario:name,config:sc,steps:[]};
  const table=(rows,from)=>rows.map((e,i)=>({n:from+i,ord:e.admissionOrdinal,kind:e.kind,gf:short(e.graphFunctionRef),...pick(e.payload)}));
  const failureKinds=['actor_invocation_failed','actor_process_termination_unconfirmed','runtime_failure_observed','run_stopped','child_preparation_refused','c_call_retry_scheduled','retry_attempt_opened','run_closed','terminal_reached','gap_recorded'];
  const step=async(label,call)=>{
    const startLen=read().length,res=await cli(label,call),all=read(),rows=all.slice(startLen);
    const own=res.receipt?.ownerOutput;
    const entry={label,wallMs:res.wallMs,failure:res.receipt?.failure??null,outcomeKind:own?.outcomeKind,ownerValue:own?.value===undefined?null:{disposition:own.value.disposition,continuationKind:own.value.continuationKind,
      outcome:own.value.outcome??null,reasonCodes:own.value.reasonCodes??own.value.reasons??null,code:own.value.code??null,issuePaths:own.value.issuePaths??null,run:own.value.run?.ref??null},
      events:rows.length};
    await writeFile(join(out,label+'-receipt.json'),JSON.stringify(res.output,null,1));
    await writeFile(join(out,label+'-events.json'),JSON.stringify(table(rows,startLen-before),null,0).replace(/\},\{/g,'},\n{'));
    await writeFile(join(out,label+'-failure-payloads.json'),JSON.stringify(rows.filter(e=>failureKinds.includes(e.kind)||(e.kind==='c_call_result_admitted'&&e.payload?.resultClass!=='success')).map(e=>({ord:e.admissionOrdinal,kind:e.kind,gf:e.graphFunctionRef,aggregateType:e.aggregateType,payload:e.payload})),null,1).slice(0,400000));
    summary.steps.push(entry);return {res,rows,all};
  };
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'b1-'+name,runEnvironmentResourceFactory:selectedEnvironment.resources});
  let {res,all}=await step('start',start.call);
  const runId=res.receipt?.resources?.run?.ref??[...new Set(all.slice(before).filter(e=>e.kind==='run_segment_opened').map(e=>e.runId))][0];
  summary.runId=runId;
  const probe=async(label)=>{
    const events=read(),prefix=env.abg.selectValidatedRuntimeEventPrefix(events);
    const p={label};
    try{p.pendingExecution=cc.projectPendingExecutionContinuations(prefix,runId).map(c=>({ref:c.continuationRef,status:c.status,phase:c.phase,chain:c.chain.map(x=>x.relation),pendingCCallRef:c.pendingCCallRef}));}catch(e){p.pendingExecution='threw: '+e.message;}
    try{p.constructionIntent=cc.projectConstructionIntentContinuations(prefix,runId).map(c=>({ref:c.continuationRef,status:c.status}));}catch(e){p.constructionIntent='threw: '+e.message;}
    try{p.selectedAction=cc.projectSelectedActionContinuations(prefix,runId).map(c=>({ref:c.continuationRef,status:c.status}));}catch(e){p.selectedAction='threw: '+e.message;}
    try{const r=replayOwner.replayValidatedRuntimeEventPrefix(prefix);p.routesWithNextAction=r.routes.filter(x=>x.nextActionProjection!==undefined).map(x=>({routeKind:x.routeKind,disposition:x.nextActionProjection.disposition,action:JSON.stringify(x.nextActionProjection).slice(0,600)}));
      p.routeKinds=r.routes.reduce((m,x)=>(m[x.routeKind]=(m[x.routeKind]??0)+1,m),{});}catch(e){p.routes='threw: '+e.message;}
    for(const memberKey of ['run_status','run_result','run_gaps']){
      try{const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey,selector:memberKey==='run_result'||memberKey==='run_gaps'||memberKey==='run_status'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:4096},source:res.receipt.resources.run,eventResource:resource(),identity:'b1-'+label+'-'+memberKey});
        const r=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:label+'-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:actorEnv});
        p[memberKey]=r.output?.receipt?.ownerOutput??r.output;}catch(e){p[memberKey]='threw: '+e.message.slice(0,400);}
    }
    // Unknown-effect attribution over the failed worker's write root.
    const nativeFail=events.slice(before).filter(e=>['actor_invocation_failed','actor_process_termination_unconfirmed'].includes(e.kind));
    p.unknownEffect=nativeFail.map(e=>{let deps=[],task=null,overlap=null;try{deps=effectOwner.nativeWorkUnknownEffectDependencies(prefix,e);}catch(x){deps='threw: '+x.message;}
      return {ord:e.admissionOrdinal,kind:e.kind,gf:short(e.graphFunctionRef),dependencies:Array.isArray(deps)?deps.length:deps,
        invalidatesCandidateAfterPrior:(()=>{try{return currentness.worksiteCommandSourcesInvalidatedAfter(prefix,e.admissionOrdinal-1,worksite,['generated/hello-world.mjs']);}catch(x){return 'threw: '+x.message;}})(),
        invalidatesUnwrittenSource:(()=>{try{return currentness.worksiteCommandSourcesInvalidatedAfter(prefix,e.admissionOrdinal-1,worksite,['source/witness-contract.md']);}catch(x){return 'threw: '+x.message;}})()};});
    p.worksiteCandidate=await readFile(join(worksite,'generated/hello-world.mjs'),'utf8');
    try{p.designFile=(await readFile(join(worksite,'design/implementation-design.md'),'utf8')).slice(0,80);
      const parents=events.slice(before).filter(e=>e.runId===runId&&e.kind==='c_call_result_admitted'&&e.payload?.value?.kind==='governance_work_state'&&/\/executive@5$/.test(e.graphFunctionRef));
      const last=parents.at(-1)?.payload.value;
      p.lastParentState=last===undefined?null:{ord:parents.at(-1).admissionOrdinal,terminal:last.terminal,unresolvedSupportRefs:last.unresolvedSupportRefs,
        reviewStanding:last.reviewStanding??null,observations:(last.observations??[]).map(o=>o.purpose+':'+(o.value?.kind??''))};
      p.nativeFailureValues=events.slice(before).filter(e=>e.runId===runId&&e.kind==='c_call_result_admitted'&&e.payload?.value?.kind==='native_workspace_work_failure')
        .map(e=>({ord:e.admissionOrdinal,gf:short(e.graphFunctionRef),failureClass:e.payload.value.failureClass,diagnosticRef:e.payload.value.diagnosticRef,
          changedPaths:e.payload.value.changedPaths,afterNull:e.payload.value.after===null,report:e.payload.value.report===null?null:'present'}));
      p.terminationUnconfirmed=events.slice(before).filter(e=>e.runId===runId&&e.kind==='actor_process_termination_unconfirmed').length;}catch(x){p.extraProbe='threw: '+x.message;}
    summary.probes=[...(summary.probes??[]),p];return p;
  };
  let p=await probe('after-start');
  // run.continue through the cold Public pending_execution arm while one is open, at most twice.
  for(let k=1;k<=2;k++){
    const open=Array.isArray(p.pendingExecution)?p.pendingExecution.filter(c=>c.status==='open'):[];
    // Also try the populate step for current_intent/pending_execution to record its refusal.
    const events=read(),prefix=env.abg.selectValidatedRuntimeEventPrefix(events);
    const pend=open.length===1?cc.projectPendingExecutionContinuations(prefix,runId).find(c=>c.status==='open'):null;
    if(pend===null){
      // Record what the Public population refuses with when no pending execution exists.
      summary['continue'+k]={};
      for(const kind of ['pending_execution','current_intent']){
        try{const pop=await publicApi.constructInstalledPendingCall({selection:{kind,runRef:runId,continuation:{ref:'continuation://abiogenesis/'+'0'.repeat(64),digest:'sha256:'+'0'.repeat(64)}},
            catalog:env.catalog,catalogView:env.catalogView,applications:[],eventResource:resource(),runEnvironmentResources:start.call.resources.runEnvironmentResources,
            envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,requestRef:'public-request://b1/'+kind,correlationRef:'correlation://b1/'+kind,eventTime:'2026-11-11T00:00:00.000Z',provenanceRefs:['provenance://b1/x']}});
          summary['continue'+k][kind]={kind:pop.kind,code:pop.code,issuePath:pop.issuePath};}catch(e){summary['continue'+k][kind]={kind:'threw',message:e.message.slice(0,300)};}
      }
      break;}
    const request=await pendingExecutionUseRequest({environment:env,prefix,runId,pending:pend});
    const pending=await constructInstalledPendingCall({environment:env,publicApi,continuation:cc,prefix,request,
      runEnvironmentResources:start.call.resources.runEnvironmentResources,eventResource:resource,identityScope:'b1-'+name,eventTime:'2026-11-11T00:0'+k+':00.000Z',provenanceRef:'provenance://b1/'+name+'/'+k});
    ({res}=await step('continue'+k,await pending.call('continue'+k)));
    p=await probe('after-continue'+k);
  }
  // No continuation arm: a second Public start (a new Run) over the same worksite and the same input.
  if(!summary.steps.some(s=>s.label.startsWith('continue'))&&sc.role!==''){
    const views0=(await readFile(actorLog+'.views','utf8')).trim().split('\n').filter(Boolean).length;
    const restart=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'b1-'+name+'-restart',runEnvironmentResourceFactory:selectedEnvironment.resources});
    const r2=await step('restart',restart.call);
    const views=(await readFile(actorLog+'.views','utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l)).slice(views0);
    summary.restartSelectorViews=views.map(v=>({observations:v.observations.map(o=>o.purpose+':'+(o.value?.kind??'')),viewKeys:Object.keys(v),
      candidateInContext:JSON.stringify(v).includes('partial work left by a failed worker'),mentionsFailure:/failure|failed/.test(JSON.stringify(v.observations))}));
    summary.restartRunId=r2.res.receipt?.resources?.run?.ref??null;
  }
  summary.actorRoles=(await readFile(actorLog,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l).role);
  await writeFile(join(out,'summary.json'),JSON.stringify(summary,null,1));
  t.diagnostic(JSON.stringify({roles:summary.actorRoles,steps:summary.steps}).slice(0,3000));
});
