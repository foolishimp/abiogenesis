// RC12 L liveness scenarios (untracked scratch). Derived from the B1 harness
// (b1-repro.test.mjs): the same scripted stand-in through the installed Public
// start, start step only. L_SCENARIO: silent | heartbeat | late ; L_TAG names
// the output directory (before / after). Records the native-work actor's rows
// and the liveness projection at its inactivity and absolute thresholds.
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,mkdir,cp,chmod} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const W='/private/tmp/abg-rc12-liveness-20261111';
const T=W+'/build_tenants/abiogenesis/typescript';
const S=W+'/qualification-scratch/rc12-executive-01/l';
const product=await import(T+'/build/code/src/product/index.js');
const {setupInstalledRootCatalog}=await import(T+'/test_env/support/root-installed-environment.mjs');
const {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest}=await import(T+'/test_env/support/registered-graph-selection.mjs');
const {libraryConsumerDeclaration,libraryEnvironment,witnessInput,witnessRef,assessmentContract,assessmentSchema,schemaPath}=await import(T+'/test_env/support/default-library.mjs');
const packageRoot=T+'/';
const witnessRoot=W+'/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness';
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
// The B1 stand-in; the native role holds in one of three ways after its init line:
// silent (no further output), heartbeat (assistant row every 300 ms), late
// (assistant row every 300 ms for 2 s, then silent).
const ACTOR=`
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';
const args=process.argv.slice(2),at=args.indexOf('--json-schema'),prompt=readFileSync(0,'utf8'),log=process.env.ABI5_REVIEW_ACTOR_LOG;
const MODE=process.env.L_MODE;
const emit=(role,output)=>{appendFileSync(log,JSON.stringify({role})+'\\n');console.log(JSON.stringify({type:'system',subtype:'init'}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(output),structured_output:output}));process.exit(0);};
const assistant=()=>console.log(JSON.stringify({type:'assistant',message:{content:[{type:'text',text:'still working'}]}}));
const hold=()=>{appendFileSync(log,JSON.stringify({role:'hold:'+MODE,t:Date.now()})+'\\n');
 writeFileSync('generated/hello-world.mjs','console.log("partial work left by a held worker");\\n');
 console.log(JSON.stringify({type:'system',subtype:'init'}));
 if(MODE==='silent'){setInterval(()=>{},1e9);return;}
 const started=Date.now();const id=setInterval(()=>{if(MODE==='late'&&Date.now()-started>=2000){clearInterval(id);setInterval(()=>{},1e9);
   appendFileSync(log,JSON.stringify({role:'late:silent-from',t:Date.now()})+'\\n');return;}assistant();},300);};
const tasks=prompt.split('\\n\\n').filter(x=>x.startsWith('## task\\n')).map(x=>x.slice('## task\\n'.length));
const schema=at<0?{}:JSON.parse(args[at+1]),props=schema.properties??{};
if('interpretation' in props){
 const view=JSON.parse(tasks[0]),reviews=view.reviews.declared;
 const graph=p=>(props.nextGraphFunctionRef.enum??[]).find(g=>typeof g==='string'&&g.includes('/'+p+'@'));
 const items=props.contributions.items.properties.supportRefs.items,support=items&&Array.isArray(items.enum)?[...items.enum]:[],target=graph('construction');
 emit('select:construction',{interpretation:'Scripted selector.',contributions:[{graphFunctionRef:target,contribution:'Scripted contribution.',reason:'Scripted.',supportRefs:support,evidenceRefs:[],dependsOn:[]}],
  gaps:[],nextGraphFunctionRef:target,nextReason:'Scripted.',nextEvidenceRefs:[],subjectEvidenceRef:null,revisionReason:'Scripted.',revisionEvidenceRefs:[],...('reviewRef' in props?{reviewRef:null}:{})});
}else if('summary' in props&&'gaps' in props){
 if(!existsSync('generated/hello-world.mjs')){process.stderr.write('native actor expects the worksite cwd\\n');process.exit(1);}
 hold();
}else{process.stderr.write('unexpected role\\n');process.exit(4);}
`;
const LIMITS={ABG_TS_FP_TIMEOUT_MS:'6000',ABG_TS_FP_ABSOLUTE_TIMEOUT_MS:'12000',ABG_TS_FP_TERMINATION_GRACE_MS:'1500'};
const name=process.env.L_SCENARIO??'silent',tag=process.env.L_TAG??'before';
assert.ok(['silent','heartbeat','late'].includes(name),'scenario '+name);
const short=r=>typeof r==='string'?r.replace(/^.*\/(?=[^/]+$)/,'').replace(/^graph-function:\/\//,''):r;
test('L scenario '+name+' '+tag,{timeout:900_000},async t=>{
  const out=join(S,tag,name);await mkdir(out,{recursive:true});
  const selection=JSON.parse(await readFile(join(witnessRoot,'selection.json'),'utf8'));let selectedEnvironment;
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',rootPublicationKind:'worksite_construction',workspaceProductIndex:1,additionalCorePublicationConstructors:constructors,
    prepareAdditionalProducts:async setup=>{
      selectedEnvironment=await libraryEnvironment({...setup,packageRoot:setup.bootstrapPackage});
      const library=setup.gtl.constructDefaultGovernanceLibraryModulePublication({...basis,packageName:setup.abiPublication.productSemanticsBinding.packageName,packageVersion:setup.abiPublication.productSemanticsBinding.packageVersion});
      const schema=join(setup.scratch,'assessment.schema.json');await writeFile(schema,JSON.stringify(assessmentSchema)+'\n');
      return [await prepareRegisteredSelectionProduct({...setup,abiPackageArchivePath:setup.abiPackageArchivePath,
        declarationFactory:g=>libraryConsumerDeclaration(g,library,selectedEnvironment.declaration,{purposes:['construction','testing','review','uat'],bound:12}),
        fixtureFiles:[{path:'build/index.mjs',source:new URL('file://'+T+'/test_env/fixtures/default-library-product/index.mjs')}],
        schemaAssets:[{path:schemaPath,source:schema,contractId:witnessRef('contract','assessment'),requirementAuthorityRefs:[witnessRef('support','complete-source-outcome')]}]})];
    }});
  const proof=join(env.scratch,'l');await mkdir(proof);
  const actor=join(proof,'actor.mjs'),actorLog=join(out,'actor.jsonl');await writeFile(actorLog,'');
  await writeFile(actor,'#!'+process.execPath+'\n'+ACTOR);await chmod(actor,0o755);
  const worksite=env.workspaceBinding.canonicalRoot??env.workspaceAuthority?.canonicalRoot??join(env.scratch,'workspace');
  await cp(join(witnessRoot,'seed'),worksite,{recursive:true});
  const witness=await witnessInput({product,selection,seedRoot:worksite}),input=product.constructGovernanceWorkState({...witness.original,reviews:declaredReviews()});
  env.catalogView=env.product.narrowGraphFunctionCatalog(env.catalog,env.additionalPublications[0].programs[0].callableMembership);
  const load=async path=>import(pathToFileURL(join(env.installedRoot,`build/code/src/${path}.js`)).href);
  const publicApi=await load('public/index'),storeOwner=await load('abg/event_store'),liveness=await load('abg/runtime_liveness'),prefixOwner=await load('abg/event_prefix');
  let handoff=env.store.projectReopenAuthorityAndClose();const before=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix).length;
  const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
  const actorEnv={...process.env,ABG_TS_CLAUDE_COMMAND:actor,ABI5_REVIEW_ACTOR_LOG:actorLog,L_MODE:name,...LIMITS};
  const start=await constructInstalledStartCall({environment:env,publicApi,eventResource:resource(),input,identity:'l-'+name,runEnvironmentResourceFactory:selectedEnvironment.resources});
  const t0=Date.now();
  const execution=await runInstalledCliRequest({scratch:proof,installedRoot:env.installedRoot,identity:'start',acquisition:{kind:'reopen',closeHandoff:handoff},call:start.call,expectedExitCode:null,environment:actorEnv});
  const wallMs=Date.now()-t0,receipt=execution.output?.receipt;
  if(receipt?.resources?.eventResource?.closeHandoff)handoff=receipt.resources.eventResource.closeHandoff;
  const all=storeOwner.readRuntimeEventsAtDurablePrefix(handoff.prefix),rows=all.slice(before);
  const started=rows.filter(e=>e.kind==='actor_invocation_started'&&/\/native-work@/.test(e.graphFunctionRef)).at(-1);
  assert.ok(started,'the native-work actor started');
  const actorRef=started.aggregateId,binding=rows.find(e=>e.kind==='actor_transport_binding_admitted'&&e.aggregateId===started.payload.transportBindingRef);
  const procStart=rows.find(e=>e.kind==='actor_process_started'&&e.payload.actorInvocationRef===actorRef);
  const terminal=rows.find(e=>(e.kind==='actor_invocation_failed'||e.kind==='actor_invocation_closed')&&e.aggregateId===actorRef);
  const own=rows.filter(e=>e.admissionOrdinal>=binding.admissionOrdinal&&e.admissionOrdinal<=terminal.admissionOrdinal&&e.graphCallId===started.graphCallId);
  const wall0=Date.parse(procStart.eventTime);
  const table=own.map(e=>{const p=e.payload??{},o=p.observation,th=p.thresholdObservation;
    return {ord:e.admissionOrdinal,kind:e.kind,wallMsFromProcessStart:Date.parse(e.eventTime)-wall0,
      ...(o?{source:p.probeContract.source,coverage:o.coverage,signal:o.signal,elapsedMs:Math.round(o.elapsedMs)}:{}),
      ...(p.timeoutClass?{timeoutClass:p.timeoutClass,timeoutMs:p.timeoutMs}:{}),...(th?{thresholdElapsedMs:Math.round(th.elapsedMs)}:{}),
      ...(e.kind==='actor_process_signal_requested'?{signal:p.signal}:{}),...(e.kind==='actor_process_exited'?{status:p.status,exitSignal:p.signal}:{}),
      ...(e.kind==='actor_process_stdout_observed'?{bytes:p.byteLength,window:p.stdoutWindow?{lastQualifyingElapsedMs:p.stdoutWindow.lastQualifyingElapsedMs===null?null:Math.round(p.stdoutWindow.lastQualifyingElapsedMs)}:undefined}:{})};});
  // The liveness projection at the cut before the first threshold (or before the exit), sampled at
  // the declared inactivity deadline and at the declared absolute ceiling.
  const thresholdEvent=own.find(e=>e.kind==='actor_process_timeout_observed');
  const boundary=thresholdEvent??own.find(e=>e.kind==='actor_process_exited');
  const cutRows=Object.freeze(all.slice(0,all.findIndex(e=>e.eventId===boundary.eventId)));
  const cut=prefixOwner.selectValidatedRuntimeEventPrefix(cutRows);
  const context=liveness.projectActorLivenessContext(cut,actorRef);
  const policy=context.binding.policy;
  const view=(label,elapsedMs)=>{const p=liveness.deriveRuntimeLiveness(cut,context,{clockOriginRef:context.binding.clockOriginRef,elapsedMs,eventRef:null});
    return p===null?{label,elapsedMs,projection:null}:{label,elapsedMs:Math.round(elapsedMs),cutOrdinal:cutRows.at(-1).admissionOrdinal,
      coverage:Object.fromEntries(p.coverage.map(r=>[r.source,r.state])),lastActivityElapsedMs:p.lastActivityElapsedMs===null?null:Math.round(p.lastActivityElapsedMs),
      leaseDeadlineElapsedMs:p.leaseDeadlineElapsedMs===null?null:Math.round(p.leaseDeadlineElapsedMs),hardDeadlineElapsedMs:p.hardDeadlineElapsedMs,
      leaseExpired:p.leaseExpired,hardCapReached:p.hardCapReached,externallyInterrupted:p.externallyInterrupted,artifactState:p.artifactState,
      disposition:p.disposition.disposition,reason:p.disposition.reason};};
  const asOf=liveness.projectRuntimeLivenessAtPrefix(cut,actorRef);
  const lease=asOf?.leaseDeadlineElapsedMs??policy.inactivityMs;
  const projections=[view('last admitted sample',asOf?.asOf.elapsedMs??0),view('declared inactivity deadline',lease),
    view('one wake after the deadline',lease+policy.inactivityMs),view('declared absolute ceiling',policy.hardCapMs)];
  const runStatus=all.filter(e=>e.runId===started.runId&&['runtime_failure_observed','run_stopped','run_closed'].includes(e.kind)).map(e=>({ord:e.admissionOrdinal,kind:e.kind}));
  const summary={scenario:name,tag,wallMs,policy:{startupMs:policy.startupMs,inactivityMs:policy.inactivityMs,hardCapMs:policy.hardCapMs,terminationGraceMs:policy.terminationGraceMs},
    ownerValue:receipt?.ownerOutput?.value?{disposition:receipt.ownerOutput.value.disposition}:null,actorRef,
    threshold:thresholdEvent?{ord:thresholdEvent.admissionOrdinal,timeoutClass:thresholdEvent.payload.timeoutClass,timeoutMs:thresholdEvent.payload.timeoutMs,
      thresholdElapsedMs:Math.round(thresholdEvent.payload.thresholdObservation.elapsedMs),wallMsFromProcessStart:Date.parse(thresholdEvent.eventTime)-wall0}:null,
    timeoutFacts:own.filter(e=>e.kind==='actor_process_timeout_observed').map(e=>e.payload.timeoutClass),
    interruptions:own.filter(e=>e.kind==='runtime_external_interruption_observed').length,
    terminal:{ord:terminal.admissionOrdinal,kind:terminal.kind,failureClass:terminal.payload.failureClass??null},runStatus,projections,
    actorLog:(await readFile(actorLog,'utf8')).trim().split('\n').filter(Boolean).map(l=>JSON.parse(l))};
  await writeFile(join(out,'summary.json'),JSON.stringify(summary,null,1));
  await writeFile(join(out,'actor-events.json'),JSON.stringify(table,null,0).replace(/\},\{/g,'},\n{'));
  t.diagnostic(JSON.stringify({threshold:summary.threshold,terminal:summary.terminal,projections:projections.map(p=>[p.label,p.elapsedMs,p.disposition,p.reason])}));
});
