import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,chmod} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import * as product from '../../build/code/src/product/index.js';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentContract,assessmentSchema,schemaPath} from '../support/default-library.mjs';

// REQ-P-POLICY-065–068. Model-free scripted Runs on the default-library
// topology stop without completing through one Public start: a worker exit
// failure, an absolute time ceiling, recursion bound 2 and a selection gap.
// Every read is a fresh installed CLI process over the closed event resource.
const packageRoot=new URL('../..',import.meta.url).pathname;
const witnessRoot=new URL('../../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness/',import.meta.url).pathname;
const basis={productId:product.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:'sha256:'+'1'.repeat(64),productContentDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'3'.repeat(64)};
const constructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
const COMPLETE=witnessRef('support','complete-source-outcome');
const TIME_LIMITS={ABG_TS_FP_TIMEOUT_MS:'6000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'12000',ABG_TS_FP_TERMINATION_GRACE_MS:'1500'};
const plainSchemaAsset={productId:witnessRef('product','consumer'),contractId:assessmentContract.contractRef,bytesBase64:Buffer.from(JSON.stringify(assessmentSchema)+'\n').toString('base64')};
function declaredReviews(){
  const order=outcome=>({outcome,instructions:['Assess only under the declared reference frame.'],readFirst:['source/original-basic-cli.txt'],writeRoots:[],checks:[]});
  const assessment=(sources,candidatePath,rubricPath)=>({sources,candidatePath,rubricPath,resultContract:assessmentContract,schemaAsset:plainSchemaAsset,verdictField:'disposition',satisfiedValue:'satisfied'});
  return [{reviewRef:witnessRef('review','code'),frame:'Code review: the CLI source satisfies the declared oracle.',required:true,
    order:order('The CLI source satisfies the declared oracle.'),assessment:assessment(['source/original-basic-cli.txt','source/witness-contract.md'],'generated/hello-world.mjs','source/basic-cli.oracle.json')}];
}

// The reviews test's stand-in with one declared stop point: STOP_ROLE native
// fails by exit 3 or by holding past the absolute ceiling; STOP_ROLE select
// returns no next GraphFunction, which the library records as a gap choice.
const ACTOR=`
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {join} from 'node:path';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_STOP_ACTOR_LOG;
const prior=existsSync(log)?readFileSync(log,'utf8').trim().split('\\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const ROLE=process.env.STOP_ROLE??'',MODE=process.env.STOP_MODE??'';
const emit=(role,output)=>{appendFileSync(log,JSON.stringify({role})+'\\n');console.log(JSON.stringify({type:'system',subtype:'init'}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);};
const tasks=prompt.split('\\n\\n').filter(x=>x.startsWith('## task\\n')).map(x=>x.slice('## task\\n'.length));let c2=null;
if(tasks.length===1)try{const owner=JSON.parse(tasks[0]).ownerPrompt,input=JSON.parse(owner.split('\\n\\n')[1]);if(Object.keys(input).length===1&&typeof input.command==='string')c2=input;}catch{}
const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{};
if(c2){console.log(JSON.stringify({type:'system',subtype:'init'}));console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_stop_c2',name:'Bash',input:c2}]}}));
 const helper=spawnSync('/bin/sh',['-c',c2.command],{encoding:'utf8',maxBuffer:64*1024*1024});if(helper.status!==0){process.stderr.write(String(helper.stderr));process.exit(1);}
 appendFileSync(log,JSON.stringify({role:'c2'})+'\\n');console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,structured_output:JSON.parse(helper.stdout)}));process.exit(0);}
else if('interpretation' in props){
 const view=JSON.parse(tasks[0]),rows=view.observations,last=p=>rows.findLastIndex(r=>r.purpose===p),reviews=view.reviews.declared;
 const graph=p=>(props.nextGraphFunctionRef.enum??[]).find(g=>typeof g==='string'&&g.includes('/'+p+'@'));
 const construction=rows.findLast(r=>r.purpose==='construction'),testing=rows.findLast(r=>r.purpose==='testing');
 const adverse=reviews.some(r=>r.standing.resultRef!==null&&r.standing.current&&!r.standing.satisfied),unrun=reviews.find(r=>r.required&&r.standing.resultRef===null);
 const pending=reviews.find(r=>r.required&&!(r.standing.satisfied&&r.standing.current)),tested=testing!==undefined&&last('testing')>last('construction');
 let next=null,subject=null,reviewRef=null;
 if(ROLE==='select'&&MODE==='gap'){}
 else if(!construction||adverse)next='construction';
 else if(unrun)[next,reviewRef,subject]=['review',unrun.reviewRef,construction.resultRef];
 else if(!tested)[next,subject]=['testing',construction.resultRef];
 else if(last('uat')<last('testing'))[next,subject]=['uat',testing.resultRef];
 else if(pending)[next,reviewRef,subject]=['review',pending.reviewRef,construction.resultRef];
 const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[],target=next===null?null:graph(next);
 emit('select:'+(next??'gap'),{interpretation:'Scripted stop-aware selector.',contributions:[{graphFunctionRef:target??graph('construction'),contribution:'Scripted contribution.',reason:'Scripted ordered policy.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
  gaps:next===null?[{supportRefs:support.slice(0,1),reason:'Scripted gap.',evidenceRefs:[]}]:[],nextGraphFunctionRef:target,nextReason:'Scripted ordered policy.',nextEvidenceRefs:[],subjectEvidenceRef:subject,
  revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef}:{})});
}else if('summary' in props&&'gaps' in props){
 if(!existsSync('generated/hello-world.mjs')){process.stderr.write('stop actor expects the worksite cwd\\n');process.exit(1);}
 if(ROLE==='native'){appendFileSync(log,JSON.stringify({role:'native:'+MODE})+'\\n');console.log(JSON.stringify({type:'system',subtype:'init'}));
  if(MODE==='exit'){process.stderr.write('scripted provider failure\\n');process.exit(3);}
  setInterval(()=>console.log(JSON.stringify({type:'assistant',message:{content:[{type:'text',text:'still working'}]}})),300);}
 else{const first=!prior.some(r=>r.role==='native');writeFileSync('generated/hello-world.mjs',first?'console.log("Hello world");\\n':'console.log("Hello, world!");\\n');
  emit('native',{summary:first?'Scripted first construction.':'Scripted correction.',gaps:[]});}
}else{
 const line=label=>prompt.split('\\n').find(l=>l.startsWith(label)),declared=line('Exact declared response JSON Schema: '),review=line('Declared review: ');
 const kind=props.kind?.const??(declared===undefined?undefined:JSON.parse(declared.slice(declared.indexOf('{'))).properties?.kind?.const)??'consumer_outcome_assessment';
 const basis=JSON.parse(line('Exact assessment basis: ').slice('Exact assessment basis: '.length)),root=line('Worksite root: ').slice('Worksite root: '.length);
 const candidate=readFileSync(join(root,basis.candidate.path),'utf8'),met=basis.candidate.path!=='generated/hello-world.mjs'||candidate.includes('Hello, world!');
 emit('assess:'+(review===undefined?'uat':JSON.parse(review.slice('Declared review: '.length)).reviewRef),{kind,disposition:met?'satisfied':'unmet',reason:'Scripted assessment of '+basis.candidate.path+'.',unresolvedCriteria:met?[]:['output']});
}
`;

async function stoppedRun(t,{name,role='',mode='',bound=12,limits={}}){
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,{purposes:['construction','testing','review','uat'],bound}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('../fixtures/default-library-product/index.mjs',import.meta.url)}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[COMPLETE]}]})];
    }});
  const proof=join(env.scratch,'readable-stops-'+name);await mkdir(proof);
  const actor=join(proof,'stop-actor.mjs'),actorLog=join(proof,'stop-actor.jsonl');
  await writeFile(actor,'#!'+process.execPath+'\n'+ACTOR);await chmod(actor,0o755);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  const witness=await witnessInput({product,selection,seedRoot:worksite}),input=product.constructGovernanceWorkState({...witness.original,reviews:declaredReviews()});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const environment={...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_STOP_ACTOR_LOG:actorLog,STOP_ROLE:role,STOP_MODE:mode,...limits};
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'readable-stops-'+name,runEnvironmentResourceFactory:selectedEnvironment.resources});
  const started=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:name+'-start',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment});
  const receipt=started.output?.receipt;assert.ok(receipt?.resources?.run,JSON.stringify(started.output).slice(0,4000));
  handoff=receipt.resources.eventResource.closeHandoff;
  const events=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).slice(before),run=receipt.resources.run;
  // Cold reads: each member is one fresh CLI process reopening the closed resource.
  const reads={},lines={};
  for(const memberKey of ['run_status','run_result','run_replay','run_gaps']){
    const {call}=constructInstalledRunReadCall({environment:env,publicApi,memberKey,selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:1}:{kind:'none'},source:run,eventResource:resource(),identity:name+'-'+memberKey});
    const output=(await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:name+'-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment})).output;
    reads[memberKey]=output.receipt.ownerOutput;lines[memberKey]=JSON.stringify(output);
  }
  const roles=(await readFile(actorLog,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l).role);
  return {owner:receipt.ownerOutput,events,reads,lines,roles};
}

const resultCoordinate=event=>({ref:event.payload.resultRef,digest:event.payload.resultDigest});
const originFields=event=>({result:resultCoordinate(event),cCallRef:event.aggregateId,graphFunctionRef:event.graphFunctionRef,contractRef:event.payload.contractRef,valueKind:event.payload.value.kind});

// R4/R6/R7 for every stop: the reading names the admitted stop, carries the
// last root evaluation uninterpreted, states itself in words in the CLI line,
// and no Public read presents the Run as completed.
function assertStoppedReadback({owner,events,reads,lines},expected){
  const diagnostic=()=>JSON.stringify({owner,status:reads.run_status}).slice(0,6000);
  assert.equal(owner.outcomeKind,'result',diagnostic());assert.equal(owner.value.disposition,expected.ownerDisposition,diagnostic());
  const status=reads.run_status.value.projection,stop=status.stop;
  assert.equal(status.status,expected.status,diagnostic());assert.ok(stop,diagnostic());
  const stopEvent=events.find(e=>e.eventId===stop.stop.ref);
  assert.equal(stopEvent?.kind,expected.eventKind);assert.equal(stop.stop.digest,stopEvent.payloadDigest);
  assert.deepEqual([stop.kind,stop.schemaVersion,stop.eventKind,stop.disposition,stop.reasonRef,stop.stage],
    ['abg_run_stop_reading','5.0.0',expected.eventKind,expected.disposition,expected.reasonRef,expected.stage]);
  const evaluations=events.filter(e=>e.kind==='c_call_result_admitted'&&e.graphCallId===stopEvent.graphCallId&&e.payload.resultClass==='success'&&e.admissionOrdinal<stopEvent.admissionOrdinal);
  const evaluation=evaluations.at(-1);
  assert.equal(evaluation.graphFunctionRef,witnessRef('graph-function','executive'));assert.equal(product.isGovernanceWorkState(evaluation.payload.value),true);
  assert.deepEqual(stop.evaluation,{kind:'admitted_result',result:resultCoordinate(evaluation),contractRef:evaluation.payload.contractRef,valueKind:'governance_work_state',
    valueDigest:product.sha256Canonical(evaluation.payload.value),value:evaluation.payload.value,cCallRef:evaluation.aggregateId,resultAdmissionEventRef:evaluation.eventId});
  // R6: no successful terminal result and no completed status on any read.
  assert.deepEqual([reads.run_result.outcomeKind,reads.run_result.value.code],['refusal','not_found']);
  assert.deepEqual([reads.run_replay.value.projection.status,reads.run_replay.value.projection.terminalResult],[expected.status,null]);
  assert.deepEqual([reads.run_gaps.value.projection.gaps,reads.run_gaps.value.projection.frontiers],[[],[]]);
  for(const line of Object.values(lines))assert.equal(line.includes('"completed"'),false);
  assert.equal(events.some(e=>e.kind==='run_closed'),false);
  // R7: plain words from the same fold, carried in the one CLI output line.
  assert.ok(lines.run_status.includes(JSON.stringify(stop.statement)));
  assert.ok(stop.statement.startsWith(`The Run stopped as ${expected.disposition} and did not complete.`),stop.statement);
  for(const text of [expected.reasonRef,...expected.statementIncludes,`last admitted evaluation governance_work_state ${evaluation.payload.resultRef}`])
    assert.ok(stop.statement.includes(text),`${text} in ${stop.statement}`);
  return {stop,stopEvent,evaluations};
}

function assertFailureOrigin(run,timeoutClass){
  const originating=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.failureClass==='transport_failure');
  assert.equal(originating.length,1);const origin=originating[0];
  assert.ok(run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.failureClass==='child_traversal_failed').length>=2,'the failure is lifted through the recursion');
  const diagnosticRef='diagnostic://abiogenesis/worksite/native-work/transport_failure@5';
  const {stop}=assertStoppedReadback(run,{ownerDisposition:'runtime_failed',status:'failed',eventKind:'runtime_failure_observed',disposition:'failed',reasonRef:diagnosticRef,stage:'route',
    statementIncludes:[`class transport_failure in ${origin.payload.resultRef}`,`timeout class ${timeoutClass??'none'}`]});
  // R1: the first failure Result of the lift chain, not the relabelled lift class.
  assert.equal(origin.graphFunctionRef,product.NATIVE_WORKSPACE_WORK_IDS.graphFunctionRef);
  assert.deepEqual(stop.origin,{kind:'failure',...originFields(origin),failureClass:'transport_failure',diagnosticRef,timeout:{kind:'observed',timeoutClass}});
}

test('worker exit failure reads back its originating failure class, reason and last evaluation cold',{timeout:900_000},async t=>{
  const run=await stoppedRun(t,{name:'exit',role:'native',mode:'exit'});
  assert.deepEqual(run.roles,['select:construction','native:exit']);
  assertFailureOrigin(run,null);
});

test('absolute time ceiling reads back the originating failure with its timeout class cold',{timeout:900_000},async t=>{
  const run=await stoppedRun(t,{name:'absolute',role:'native',mode:'absolute',limits:TIME_LIMITS});
  assert.deepEqual(run.roles,['select:construction','native:absolute']);
  assertFailureOrigin(run,'absolute');
});

test('recursion bound 2 reads back the bound reason and the last parent evaluation with its unresolved obligations cold',{timeout:900_000},async t=>{
  const run=await stoppedRun(t,{name:'bound',bound:2});
  const {stop,evaluations}=assertStoppedReadback(run,{ownerDisposition:'blocked',status:'blocked',eventKind:'run_stopped',disposition:'blocked',
    reasonRef:'reason://abiogenesis/recursion/bound-exhausted@5',stage:null,statementIncludes:['Originating result: governance_work_state']});
  // Bound N admits N parent evaluations and N-1 child steps.
  assert.equal(evaluations.length,2);
  const steps=run.events.filter(e=>e.kind==='child_foldback_admitted'&&evaluations.some(p=>p.aggregateId===e.payload.parentCCallRef));
  assert.equal(steps.length,1);
  assert.deepEqual(stop.origin,{kind:'result',...originFields(evaluations[1]),resultClass:'success'});
  assert.equal(stop.evaluation.value.terminal,false);assert.deepEqual(stop.evaluation.value.unresolvedSupportRefs,[COMPLETE]);
});

test('selection gap reads back as a blocked stop with its missing support references and reason cold',{timeout:900_000},async t=>{
  const run=await stoppedRun(t,{name:'gap',role:'select',mode:'gap'});
  assert.deepEqual(run.roles,['select:gap']);
  const choices=run.events.filter(e=>e.kind==='c_call_result_admitted'&&e.payload.value?.kind==='registered_graph_choice');
  assert.equal(choices.length,1);const choice=choices[0];assert.equal(choice.payload.value.disposition,'gap');
  assert.ok(choice.payload.value.missingSupportRefs.includes(COMPLETE));
  const {stop}=assertStoppedReadback(run,{ownerDisposition:'blocked',status:'blocked',eventKind:'run_stopped',disposition:'blocked',
    reasonRef:'reason://abiogenesis/default-library/gap@5',stage:null,statementIncludes:[`missing support ${choice.payload.value.missingSupportRefs.join(', ')}`,'reason "Scripted ordered policy."']});
  assert.deepEqual(stop.origin,{kind:'gap',...originFields(choice),missingSupportRefs:choice.payload.value.missingSupportRefs,reason:choice.payload.value.reason});
});
