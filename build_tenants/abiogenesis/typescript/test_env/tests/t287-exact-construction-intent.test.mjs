import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,mkdir,readFile,writeFile,chmod,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootExecutionBasis} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledRunReadCall,constructInstalledStartCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,ref,contract,actionCatalog} from '../fixtures/exact-intent-product/index.mjs';
import {unrelatedWorkspaceEvent} from '../support/single-address-space-consolidation.mjs';
const root=new URL('../..',import.meta.url).pathname;
// The CLI and actor processes run in other directories: the fixture readyPath and fixed transport under this root stay absolute.
const proof=resolve(process.env.ABI5_EXACT_INTENT_EVIDENCE_ROOT??await mkdtemp(join(tmpdir(),'abi5-exact-intent-proof-')));
await mkdir(proof,{recursive:true});
const save=async(name,value)=>writeFile(join(proof,name),JSON.stringify(value,null,2)+'\n');
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
test('actual One Surface producer, undispatched preparation frontier and current-intent remainder',async()=>{
 const accounting={wallMs:{}},started=performance.now();
 let e;
 try {
 e=await setupInstalledRootExecutionBasis({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
 prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:declarations,fixtureFiles:[{path:'build/index.js',source:new URL('../fixtures/exact-intent-product/index.mjs',import.meta.url)}]})],
 inputFactory:({workspaceBinding})=>({kind:'fixture_request',schemaVersion:'5.0.0',workspaceBinding:{workspaceBindingId:workspaceBinding.bindingId,workspaceBindingDigest:workspaceBinding.bindingDigest},actionCatalog,task:{kind:'fixture_task',schemaVersion:'5.0.0',payload:'preserved producer',readyPath:join(proof,'consumer-ready.txt')}})});
 const {abg,product}=e,load=path=>import(pathToFileURL(join(e.installedRoot,`build/code/src/${path}.js`)).href);
 await save('setup.json',{scratch:e.scratch,installedRoot:e.installedRoot,artifactPaths:e.artifactPaths,archiveDigests:await Promise.all(e.artifactPaths.map(p=>product.sha256File(p))),setupMs:performance.now()-started,accounting});
 const authority=await load('abg/construction_continuation'),publicApi=await load('public/index'),projectReadContracts=await load('abg/project_read_operation_contracts');
 const opened=abg.openTraversalScope(e.store,e.durablePrefix,{kind:'root',executionBasis:e.executionBasis},{eventTime:'2026-09-29T00:00:00.000Z',correlationId:'correlation://exact-intent/initial',causationEventRefs:[]});
 assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));
 const runStarted=performance.now();
 const completion=await e.hog.executeGraphTraversal({store:e.store,predecessorPrefix:opened.successorPrefix,executionBasis:e.executionBasis,openedTraversalScope:opened.scope,program:e.program,programPublication:e.publication,graphFunction:e.graphFunction,graph:e.graph,graphValidation:e.graphValidation,programValidation:e.programValidation,implementationSet:e.implementationSet,interactionSet:e.executionBasisAdmission.interactionSet,leafPort:e.leafPort,closureContract:e.closureContract,actorRuntimeBinding:{workspaceBinding:e.workspaceBinding,artifactTruth:e.artifactTruth},input:e.input,inputDigest:e.rawInput.subjectDigest,eventTime:'2026-09-29T00:00:00.000Z',correlationId:'correlation://exact-intent/initial'});
 await save('initial-completion.json',{completion,wallMs:performance.now()-runStarted});
 const events=e.store.readAll();await save('initial-events.json',events);
 const prefix=abg.selectValidatedRuntimeEventPrefix(freeze(events)),pending=authority.projectConstructionIntentContinuations(prefix,opened.scope.runId);
 await save('pending.json',pending);
 assert.equal(pending.length,1,'one actual undispatched preparation frontier');
 assert.equal(events.some(v=>v.kind==='actor_invocation_started'),false,'no initial actor dispatch');
 const prepared=authority.prepareConstructionIntentContinuation(prefix,pending[0],e.executionResolution);
 assert.ok(prepared,'exact original current intent/cursor/input/producer support joins');
 const cCallOwner=await load('abg/c_call');
 const childFunction=e.publication.graphFunctions.find(g=>g.name===prepared.child.graphFunctionRef);
 const childClosure=e.publication.closureContracts.find(c=>c.closureContractRef===childFunction.declarations['abg.child_closure_contract']);
 const contractJoin={prefix,executionBasis:prepared.root,graph:prepared.rootGraph,cursor:prepared.parent.cursor,childGraphFunction:childFunction,childClosureContract:childClosure};
 assert.equal(cCallOwner.workflowOutputContractCorresponds(contractJoin),true,'admitted intent and declared evaluator allow derived parent output');
 assert.equal(cCallOwner.workflowOutputContractCorresponds({...contractJoin,childClosureContract:{...childClosure,resultContractRef:contract('evaluation-basis')}}),false,'cannot relabel actual child closure');
 // Pure structural branch probe, not an admitted graph: remove composition applicability while retaining the exact workflow term.
 const ordinaryGraph={...prepared.rootGraph,graphFunctionRef:childFunction.name};
 assert.equal(cCallOwner.workflowOutputContractCorresponds({...contractJoin,graph:ordinaryGraph}),false,'ordinary workflow retains exact output equality');
 await save('workflow-output-check.json',{derivedParentAccepted:true,childRelabelRefused:true,ordinaryMismatchRefused:true,ordinaryProbe:'controlled structural non-applicability only; full selected One Surface path remains actual admission'});

 await save('prepared-relation.json',{continuation:prepared.continuation,intent:prepared.intent,pendingCursor:prepared.pending.cursor,parentCursor:prepared.parent.cursor,producer:prepared.producer,producerCall:prepared.producerCall,originalInvocation:prepared.invocation,sourceRoot:prepared.root.basisRef,sourceChild:prepared.child.basisRef});
 let handoff=e.store.projectReopenAuthorityAndClose();
 await save('initial-handoff.json',handoff);
 const command=join(proof,'fixed-transport.cjs');
 await writeFile(command,"#!"+process.execPath+"\nlet prompt='';process.stdin.setEncoding('utf8');process.stdin.on('data',v=>prompt+=v);process.stdin.on('end',()=>{const candidate=JSON.parse(prompt);console.log(JSON.stringify({type:'system',subtype:'init'}));console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(candidate),structured_output:candidate}));});\n");
 await chmod(command,0o755);await writeFile(prepared.pendingInput.readyPath,'ready\n');
 // The shipped SDK constructor populates the current-intent call from the log at the acquired
 // prefix; a falsifier, and the consumed resend, patch that canonical population explicitly.
 const resource=()=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)});
 const envelope=identity=>({definitionContractCoordinates:e.verified.definitionContractCoordinates,requestRef:`public-request://exact-intent/${identity}`,correlationRef:`correlation://exact-intent/${identity}`,eventTime:'2026-09-29T00:01:00.000Z',provenanceRefs:[ref('provenance','fixture')]});
 const construct=async(identity,eventResource)=>{
  const made=await publicApi.constructInstalledPendingCall({selection:{kind:'current_intent',runRef:opened.scope.runId,continuation:{ref:pending[0].continuationRef,digest:pending[0].continuationDigest}},catalog:e.catalog,catalogView:e.catalogView,applications:[],eventResource,envelope:envelope(identity)});
  if(made.kind!=='installed_pending_call')assert.fail(JSON.stringify(made));
  return made;
 };
 const canonical=await construct('population',resource());
 assert.deepEqual(canonical.population.request,{run:{ref:opened.scope.runId,digest:opened.scope.runDigest},continuation:{ref:pending[0].continuationRef,digest:pending[0].continuationDigest},currentIntent:{ref:prepared.intent.constructionIntentRef,digest:prepared.intent.constructionIntentDigest},continuationInput:{ref:prepared.pending.input.inputRef,digest:prepared.pending.input.inputDigest},expectedBasis:{ref:prepared.child.basisRef,digest:prepared.child.basisDigest}},'the owner populates the exact original intent');
 assert.deepEqual([canonical.population.authority.authorityRef,canonical.population.authority.authorityDigest],[e.invocationAuthority.authorityRef,e.invocationAuthority.authorityDigest],'attribution is the original admitted authority');
 const makeCall=async(identity,patch=null)=>{
  if(patch===null)return (await construct(identity,resource())).call;
  const eventResource=resource(),steering=product.sha256Canonical(eventResource),{definitionContractCoordinates,requestRef,correlationRef,eventTime,provenanceRefs}=envelope(identity);
  return publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates,contractCatalog:canonical.call.invocation.contractCatalog,operationId:'abg.operation.run.continue',memberKey:'current_intent',request:{...canonical.population.request,...patch},slots:{...canonical.population.slots,transport_steering:{ref:`transport-steering://abiogenesis/${steering.slice(7)}`,digest:steering}},resources:{...canonical.call.resources,eventResource},requestRef,correlationRef,eventTime,provenanceRefs});
 };
 const results=[],handoffs={};
 // The continuation is Run-scoped: a Run that does not hold it, or the Run under another digest, is refused.
 const expectedRefusals={'wrong-run':['missing_continuation','/continuation'],'wrong-run-digest':['basis_mismatch','/expectedBasis']};
 for(const [name,patch]of [['wrong-basis',{expectedBasis:{ref:prepared.root.basisRef,digest:prepared.root.basisDigest}}],['wrong-input',{continuationInput:{ref:prepared.pending.input.inputRef,digest:'sha256:'+'0'.repeat(64)}}],['wrong-intent',{currentIntent:{ref:prepared.intent.constructionIntentRef,digest:'sha256:'+'0'.repeat(64)}}],['unknown-continuation',{continuation:{ref:'continuation://abiogenesis/'+'0'.repeat(64),digest:'sha256:'+'0'.repeat(64)}}],['wrong-run',{run:{ref:`${opened.scope.runId}/absent`,digest:'sha256:'+'0'.repeat(64)}}],['wrong-run-digest',{run:{ref:opened.scope.runId,digest:'sha256:'+'0'.repeat(64)}}],['continue',null],['consumed',{}]]) {
  handoffs[name]=handoff;
  const call=await makeCall(name,patch);await save(`${name}-call.json`,call);
  const execution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:`exact-${name}`,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null,environment:{ABG_TS_CLAUDE_COMMAND:command}});
  await save(`${name}-receipt.json`,execution);const receipt=execution.output.receipt;assert.ok(receipt,JSON.stringify(execution));
  if(receipt.resources?.eventResource?.closeHandoff) handoff=receipt.resources.eventResource.closeHandoff;
  await save(`${name}-handoff.json`,handoff);await copyFile(new URL(handoff.prefix.eventLogRef),join(proof,`${name}-events.jsonl`));
  assert.equal(receipt.failure,null,JSON.stringify(receipt));results.push({name,wallMs:execution.wallMs,ownerOutput:receipt.ownerOutput});
  if(name==='continue') {assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
   for(const memberKey of ['run_result','run_replay']) {const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};const{call:readCall}=constructInstalledRunReadCall({environment:e,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},source:receipt.resources.run,eventResource,identity:`exact-${memberKey}`});const read=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:`exact-${memberKey}`,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});await save(`${memberKey}.json`,read);assert.equal(read.output.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(read.output));}
  } else {assert.equal(receipt.ownerOutput.outcomeKind,'refusal',JSON.stringify(receipt.ownerOutput));
   if(expectedRefusals[name])assert.deepEqual([receipt.ownerOutput.value.code,receipt.ownerOutput.value.issuePaths],[expectedRefusals[name][0],[expectedRefusals[name][1]]],name);}
 }
 // Population names the Run: one that does not hold the continuation is refused before any call exists.
 const absentRun=await publicApi.constructInstalledPendingCall({selection:{kind:'current_intent',runRef:`${opened.scope.runId}/absent`,continuation:{ref:pending[0].continuationRef,digest:pending[0].continuationDigest}},catalog:e.catalog,catalogView:e.catalogView,applications:[],eventResource:resource(),envelope:envelope('absent-run-population')});
 assert.deepEqual(absentRun,{kind:'run_continuation_population_refusal',code:'missing_continuation',issuePath:'/continuation'});
 // Stale prefix: population at the pre-continue handoff still finds the then-open continuation; the
 // superseded handoff is refused at resource acquisition, before any owner truth, and appends nothing.
 const staleHandoff=handoffs.continue,stale=await construct('stale-prefix',{kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:staleHandoff,handoffDigest:product.sha256Canonical(staleHandoff)});
 const staleBytes=await readFile(new URL(handoff.prefix.eventLogRef));
 const staleExecution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'exact-stale-prefix',acquisition:{kind:'reopen',closeHandoff:staleHandoff},call:stale.call,expectedExitCode:null,environment:{ABG_TS_CLAUDE_COMMAND:command}});
 await save('stale-prefix-receipt.json',staleExecution);const staleFault=staleExecution.output.receipt?.failure?.fault;
 assert.deepEqual([staleFault?.stage,staleFault?.code],['resource_acquisition','acquisition_refused'],JSON.stringify(staleExecution.output).slice(0,4000));
 assert.equal(Buffer.compare(await readFile(new URL(handoff.prefix.eventLogRef)),staleBytes),0,'a stale prefix appends zero bytes');
 results.push({name:'stale-prefix',wallMs:staleExecution.wallMs,fault:{stage:staleFault.stage,code:staleFault.code}});
 const finalEvents=(await load('abg/event_store')).readRuntimeEventsAtDurablePrefix(handoff.prefix);
 assert.equal(finalEvents.filter(v=>v.kind==='c_call_fibre_selected'&&v.payload.implementationRef===ref('implementation','producer')).length,1);
 assert.equal(finalEvents.filter(v=>v.kind==='actor_invocation_started').length,1);
 assert.equal(finalEvents.filter(v=>v.kind==='construction_intent_selected').length,1);
 assert.equal(finalEvents.filter(v=>v.kind==='run_closed').length,1);
 const closedRun=finalEvents.find(v=>v.kind==='run_closed').runId;
 assert.equal(finalEvents.filter(v=>v.kind==='child_foldback_admitted'&&v.runId===closedRun).length,1);
 assert.equal(finalEvents.filter(v=>v.kind==='construction_delta_observed'&&v.runId===closedRun).length,1);
 const view=abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(finalEvents),closedRun);
 assert.equal(view.lifecycle.runClosed,true);
 assert.equal(view.eventAtoms.some(v=>v.runId!==null&&v.runId!==closedRun),false,'replay imports no old Run event');
 const continued=view.ownerFacts.find(v=>v.owner==='construction_continuation');
 assert.equal(continued.status,'resolved');assert.equal(continued.intentAdmissionEventRef,pending[0].intentAdmissionEventRef);
 await save('closed-correspondence.json',{closedRun,producer:prepared.producer,originalIntent:prepared.intent,continued,semanticReplayDigest:view.viewDigest,lifecycle:view.lifecycle});
 // Complete current-intent pair: the actual current_intent Public operation and the unique admitted
 // basis whose constructionContinuationUse names it are one combined effectful prior admission.
 const truthOwner=await load('abg/effectful_invocation_truth'),fhOwner=await load('abg/fh_continuation_projection'),storeOwner=await load('abg/event_store');
 const finalPrefix=abg.selectValidatedRuntimeEventPrefix(freeze(finalEvents));
 const intentOperations=finalEvents.filter(v=>v.kind==='public_operation_admitted'&&v.payload.continuationKind==='construction_intent');
 assert.equal(intentOperations.length,1,'one admitted current_intent Public operation');
 const [operation]=intentOperations;
 assert.deepEqual([operation.payload.operationId,operation.payload.memberKey],['abg.operation.run.continue','current_intent']);
 const uses=finalEvents.filter(v=>v.kind==='basis_admitted'&&v.payload.constructionContinuationUse?.operationAdmissionEventRef===operation.eventId);
 assert.equal(uses.length,1,'one admitted basis uses that operation');
 assert.equal(uses[0].payload.constructionContinuationUse.sourceExecutionBasisRef,prepared.root.basisRef,'the use names the original root basis');
 const priorAdmission={operationId:'abg.operation.run.continue',publicInvocationRef:operation.payload.invocationRef,ownerInvocationRef:operation.payload.invocationRef,
  ownerInvocationDigest:operation.payload.invocationDigest,publicOperationEventRef:operation.eventId,admissionEventRef:uses[0].eventId};
 const pairAt=(at,invocationRef=operation.payload.invocationRef)=>truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(at,invocationRef);
 const duplicate=at=>({kind:'effectful_public_invocation_truth',schemaVersion:'5.0.0',disposition:'duplicate',invocationRef:operation.payload.invocationRef,prefix:at,priorAdmission});
 const noFh={disposition:'valid',facts:[]};
 // This process holds no receipt for these coordinates: each authenticates its file bytes cold.
 const P=handoff.prefix,copiedP=structuredClone(P),historical=handoffs.consumed.prefix;
 const pair={P:pairAt(P),copied:pairAt(copiedP),validated:pairAt(finalPrefix),historical:pairAt(historical),beforeContinue:pairAt(handoffs.continue.prefix)};
 assert.deepEqual(pair.P,duplicate(P),'durable coordinate after the stale control');
 assert.deepEqual(pair.copied,duplicate(copiedP),'copied coordinate');
 assert.deepEqual(pair.validated,duplicate(finalPrefix),'validated final history');
 assert.deepEqual(pair.historical,duplicate(historical),'retained prefix immediately after the continuation');
 assert.deepEqual([pair.beforeContinue.kind,pair.beforeContinue.disposition],['effectful_public_invocation_truth','available'],'before the continuation the invocation is available');
 assert.deepEqual(fhOwner.projectFhEffectfulPublicInvocationFacts(finalPrefix),noFh,'the construction arm has no F_H fact');
 // A genuinely distinct second Run of the installed root Program, added while the history is valid.
 const second=await constructInstalledStartCall({environment:e,publicApi,eventResource:resource(),identity:'exact-second-run',programRef:ref('program','root'),rootMode:'supervised',declaredStartRef:ref('start','root'),
  input:{kind:'fixture_request',schemaVersion:'5.0.0',workspaceBinding:{workspaceBindingId:e.workspaceBinding.bindingId,workspaceBindingDigest:e.workspaceBinding.bindingDigest},actionCatalog,
   task:{kind:'fixture_task',schemaVersion:'5.0.0',payload:'second distinct Run',readyPath:join(proof,'second-ready.txt')}}});
 const secondExecution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'exact-second-run',acquisition:{kind:'reopen',closeHandoff:handoff},call:second.call,expectedExitCode:null,environment:{ABG_TS_CLAUDE_COMMAND:command}});
 await save('second-run-receipt.json',secondExecution);
 const secondReceipt=secondExecution.output.receipt;
 assert.equal(secondReceipt?.failure,null,JSON.stringify(secondExecution.output).slice(0,4000));
 const Q=secondReceipt.resources.eventResource.closeHandoff.prefix,qEvents=storeOwner.readRuntimeEventsAtDurablePrefix(Q);
 await save('second-run-events.json',qEvents.slice(finalEvents.length));
 assert.deepEqual(qEvents.slice(0,finalEvents.length).map(v=>v.eventId),finalEvents.map(v=>v.eventId),'Q extends P');
 const newRuns=qEvents.slice(finalEvents.length).filter(v=>v.kind==='run_segment_opened');
 assert.equal(newRuns.length,1,'the start opened one Run');
 assert.equal([opened.scope.runId,closedRun].includes(newRuns[0].runId),false,'a genuinely distinct Run');
 const qPrefix=abg.selectValidatedRuntimeEventPrefix(freeze(qEvents)),copiedQ=structuredClone(Q);
 assert.deepEqual(pairAt(Q),duplicate(Q),'the prior pair at Q');
 assert.deepEqual(pairAt(copiedQ),duplicate(copiedQ),'the prior pair at a copied Q');
 assert.deepEqual(pairAt(qPrefix),duplicate(qPrefix),'the prior pair over validated Q');
 assert.deepEqual(pairAt(P),duplicate(P),'historical P is unchanged by growth');
 assert.deepEqual(fhOwner.projectFhEffectfulPublicInvocationFacts(qPrefix),noFh,'growth adds no F_H fact');
 // The second Run reaches its own undispatched preparation (its ready path is absent), stops and
 // opens its own construction continuation: the first Run's frontier shape, in a distinct Run.
 const grown=qEvents.slice(finalEvents.length),secondRun=newRuns[0].runId;
 assert.equal(secondReceipt.ownerOutput.value.disposition,'runtime_failed',JSON.stringify(secondReceipt.ownerOutput).slice(0,2000));
 assert.deepEqual(grown.filter(v=>['run_stopped','construction_continuation_opened'].includes(v.kind)).map(v=>[v.kind,v.runId]),
  [['run_stopped',secondRun],['construction_continuation_opened',secondRun]]);
 assert.equal(grown.some(v=>v.kind==='actor_invocation_started'),false,'the second Run dispatches no actor');
 const [secondOperation]=grown.filter(v=>v.kind==='public_operation_admitted'),[secondInvocation]=grown.filter(v=>v.kind==='invocation_admitted');
 assert.deepEqual([secondOperation.payload.operationId,secondOperation.payload.memberKey],['abg.operation.run.invoke','start']);
 const secondRef=secondInvocation.payload.publicRequestInvocationRef,secondPair=pairAt(Q,secondRef);
 await save('complete-pair.json',{priorAdmission,pair,second:{runId:secondRun,publicInvocationRef:secondRef,atQ:secondPair,atP:pairAt(P,secondRef),ownerOutput:secondReceipt.ownerOutput},Q});
 assert.equal(secondPair.disposition,'duplicate',JSON.stringify(secondPair));
 assert.deepEqual([secondPair.priorAdmission.operationId,secondPair.priorAdmission.publicInvocationRef,secondPair.priorAdmission.ownerInvocationRef,
  secondPair.priorAdmission.publicOperationEventRef],['abg.operation.run.invoke',secondRef,secondOperation.payload.invocationRef,secondOperation.eventId],
  'the second Run adds its own global Run fact');
 assert.equal(pairAt(P,secondRef).disposition,'available','P does not hold the second Run');
 // Ambiguity control: m5-event-store-reopen's cross-kind collision recipe, applied to this history as an
 // explicit raw validated-history reader premise (never admitted, never a durable prefix). The second
 // Run's owner admission is re-keyed so its Public request ref equals another fact's Public ref.
 const candidateOf=event=>{const value=structuredClone(event);for(const key of ['admissionOrdinal','eventId','payloadDigest','eventContractDigest'])delete value[key];return value;};
 const beforeOwner=qEvents.slice(0,secondInvocation.admissionOrdinal-1);
 const install=finalEvents.filter(v=>v.kind==='public_operation_artifact_admitted'&&v.payload.operationId==='abg.operation.product.install')[0];
 const collide=(publicRef)=>{
  const candidate=candidateOf(secondInvocation);candidate.payload.publicRequestInvocationRef=publicRef;
  const {invocationAdmissionDigest:_digest,invocationAdmissionRef:_ref,...body}=candidate.payload;
  const digest=product.sha256Canonical(body),admissionRef=`invocation-admission://abiogenesis/${digest.slice(7)}`;
  Object.assign(candidate,{basisId:admissionRef});Object.assign(candidate.payload,{invocationAdmissionDigest:digest,invocationAdmissionRef:admissionRef});
  const event=storeOwner.projectRuntimeEventFromValidatedHistory(beforeOwner,candidate);
  const rows=freeze([...beforeOwner,event]),premise=abg.selectValidatedRuntimeEventPrefix(rows);
  assert.ok(abg.rehydrateInvocationAdmissionAtPrefix(premise,admissionRef),'the colliding Run fact is one complete owner-issued admission');
  return {event,rows,premise};
 };
 const collisions={};
 for(const [label,publicRef,first]of [['install',install.payload.invocationRef,[install.eventId]],['current-intent',operation.payload.invocationRef,[operation.eventId,uses[0].eventId]]]) {
  const {event,rows,premise}=collide(publicRef),query='invocation://exact-intent/collision/unrelated';
  const expected={kind:'effectful_public_invocation_truth_invalid_history',schemaVersion:'5.0.0',disposition:'invalid_history',code:'duplicate_outer_invocation',
   invocationRef:query,prefix:premise,eventRefs:[...new Set([...first,secondOperation.eventId,event.eventId])].sort(),artifactTruthCode:null};
  const warm=truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(premise,query);
  assert.deepEqual(warm,expected,`${label}: duplicate_outer_invocation with the exact colliding refs in order`);
  assert.deepEqual(truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(premise,query),expected,`${label}: warm repeat`);
  assert.deepEqual(truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(premise,publicRef),{...expected,invocationRef:publicRef},`${label}: the colliding ref itself`);
  const uncached=abg.selectValidatedRuntimeEventPrefix(freeze(structuredClone(rows)));
  assert.deepEqual(truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(uncached,query),{...expected,prefix:uncached},`${label}: a fresh uncached selection`);
  const copied=structuredClone(premise),copiedValue=truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(copied,query);
  assert.deepEqual([copiedValue.disposition,copiedValue.code],['invalid_history','artifact_truth_invalid'],`${label}: a copied prefix object is not a selection`);
  const growth=storeOwner.projectRuntimeEventFromValidatedHistory(rows,unrelatedWorkspaceEvent(product.sha256Canonical,'collision-'+label));
  const grownPrefix=abg.selectValidatedRuntimeEventPrefix(freeze([...rows,growth]));
  assert.deepEqual(truthOwner.projectEffectfulPublicInvocationTruthAtPrefix(grownPrefix,query),{...expected,prefix:grownPrefix},`${label}: unrelated growth conserves the refusal`);
  collisions[label]={eventRefs:expected.eventRefs,collisionEventRef:event.eventId,premiseEvents:rows.length};
 }
 await save('collision.json',{premise:'raw validated-history reader premise after m5-event-store-reopen:953-997; not admitted, not durable',collisions});
 await save('result.json',{status:'passed',results,transport:command,transportDigest:await product.sha256File(command),proofClass:'deterministic local subprocess through actual F_P owner; no live model',scope:'pure F_D producer and undispatched F_P preparation within scalar One Surface workflow'});
 } catch(error) {await save('failure.json',{message:error.message,stack:error.stack,scratch:e?.scratch??null});if(e){try{await save('failure-events.json',e.store.readAll());}catch{}}throw error;}
});
