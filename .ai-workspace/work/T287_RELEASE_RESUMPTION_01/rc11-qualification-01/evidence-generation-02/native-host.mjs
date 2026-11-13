import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {config,controlRoot,checkInputs,json,save,pin,load,snapshot,sha} from './common.mjs';
const output=process.argv[2];assert.equal(output,join(controlRoot,'raw/native-assessment'));
await checkInputs();
const support=name=>pathToFileURL(join(config.tenant,'test_env/support',name+'.mjs')).href;
const {setupInstalledRootExecutionBasis}=await import(support('root-installed-environment'));
const {prepareLanguageStructuralFixture}=await import(support('language-structural-fixture'));
const {FP_IDS,FP_RETRY_IDS}=await import(pathToFileURL(join(config.tenant,'test_env/fixtures/language-structural/program.mjs')).href);
const input={kind:'worker_instruction',schemaVersion:'5.0.0',materializationPlanRef:FP_IDS.materializationPlanRef,rendererRef:FP_IDS.rendererRef,instructionContractRef:FP_IDS.inputContractRef,resultContractRef:FP_IDS.outputContractRef,workerActorRef:FP_IDS.workerActorRef,workerBindingRef:FP_IDS.workerBindingRef,transportLane:'closed_prompt_proof',subject:'World',instruction:'Return the fixed declared test payload.'};
const transform=(name,source)=>{if(name!=='leaf.mjs')return source;const needle='const workerRequest={actorRef:';assert.equal(source.split(needle).length,2,'one exact fixture request constructor');return source.replace(needle,"const workerRequest={responsePresentation:'result_text',actorRef:");};
let e=null,closed=false;
try{
 const accounting={wallMs:{}};
 e=await setupInstalledRootExecutionBasis({after:()=>{}},config.tenant,{frozenArtifact:{artifactPath:config.archive,installHost:config.installHost,artifactSha256:config.archiveSha256},candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:FP_RETRY_IDS.programRef,graphFunctionRef:FP_RETRY_IDS.graphFunctionRef,inputContractRef:FP_IDS.inputContractRef,input,setupAccounting:accounting,prepareAdditionalProducts:async basis=>[await prepareLanguageStructuralFixture({...basis,sourceTransform:transform})]});
 assert.equal(e.verified.packageVersion,'5.0.0-rc.10');
 const envFields=['scratch','installedRoot','installedRoots','artifactPaths','verified','workspaceBinding','input','executionBasis'];
 await save(join(output,'environment.json'),Object.fromEntries(envFields.map(k=>[k,e[k]])));
 await save(join(output,'setup.json'),{accounting,artifacts:await Promise.all(e.artifactPaths.map(pin)),fixtureSourceTransform:{path:'build/leaf.mjs',from:'const workerRequest={actorRef:',to:"const workerRequest={responsePresentation:'result_text',actorRef:"}});
 const leaf=await import(pathToFileURL(join(e.installedRoots[1],'build/leaf.mjs')).href);
 const request=leaf.worker(e.input).workerRequest;assert.equal(request.responsePresentation,'result_text');await save(join(output,'request.json'),request);
 const opened=e.abg.openTraversalScope(e.store,e.durablePrefix,{kind:'root',executionBasis:e.executionBasis},{eventTime:'2026-11-09T00:00:00.000Z',correlationId:'correlation://rc11/native-assessment',causationEventRefs:[]});
 assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));await save(join(output,'opened.json'),opened);
 const completion=await e.hog.executeGraphTraversal({store:e.store,predecessorPrefix:opened.successorPrefix,executionBasis:e.executionBasis,openedTraversalScope:opened.scope,program:e.program,programPublication:e.publication,graphFunction:e.graphFunction,graph:e.graph,graphValidation:e.graphValidation,programValidation:e.programValidation,implementationSet:e.implementationSet,interactionSet:e.executionBasisAdmission.interactionSet,leafPort:e.leafPort,closureContract:e.closureContract,actorRuntimeBinding:{workspaceBinding:e.workspaceBinding,artifactTruth:e.artifactTruth},input:e.input,inputDigest:e.rawInput.subjectDigest,eventTime:'2026-11-09T00:00:00.000Z',correlationId:'correlation://rc11/native-assessment'});
 await save(join(output,'completion.json'),completion);
 const handoff=e.store.projectReopenAuthorityAndClose();closed=true;await save(join(output,'close-handoff.json'),handoff);
 const store=await load(e.installedRoot,'abg/event_store'),prefixOwner=await load(e.installedRoot,'abg/event_prefix'),cc=await load(e.installedRoot,'abg/c_call');
 // Physical read checks original store identity and current W archive witnesses.
 const physicalRows=store.readRuntimeEventsAtDurablePrefix(handoff.prefix);
 const bytes=await fs.readFile(fileURLToPath(handoff.prefix.eventLogRef));
 const decoded=store.validateHistoricalEvents(bytes,handoff.prefix.storeIdentity.eventContractDigest);
 assert.deepEqual(decoded,physicalRows);const prefix=prefixOwner.selectValidatedRuntimeEventPrefix(decoded);
 const judgments=decoded.filter(r=>r.kind==='c_call_judged'&&r.payload.judgment==='retry');
 let selected=null;
 for(const judgment of judgments){const result=decoded.find(r=>r.kind==='c_call_result_admitted'&&r.payload.resultRef===judgment.payload.resultRef);if(result?.payload.value?.failureClass==='contract_failure'){const evidence=decoded.find(r=>r.kind==='c_call_evidenced'&&result.payload.evidenceRefs.includes(r.payload.evidenceRef)&&r.payload.evidenceClass==='probabilistic_transport');const artifact=decoded.find(r=>r.kind==='actor_result_artifact_observed'&&r.payload.cCallRef===result.payload.cCallRef&&r.payload.actorInvocationRef===evidence?.payload.actorInvocationRef);if(evidence&&artifact){selected={judgment,result,evidence,artifact};break;}}}
 assert.ok(selected,'actual owner must produce malformed probabilistic retry evidence/result/judgment');
 const {judgment,result,evidence,artifact}=selected,cCallRef=result.payload.cCallRef;
 assert.equal(artifact.payload.finalOutput,'{not-json');assert.equal(artifact.payload.processStatus,0);assert.equal(artifact.payload.nativeResultAssessment.disposition,'rejected');
 assert.equal(artifact.payload.requestDigest,e.product.sha256Canonical(request));assert.equal(evidence.payload.requestDigest,e.product.sha256Canonical(request));
 const lifecycle=cc.projectAdmittedTransportEvidenceLifecycle(prefix,cCallRef,evidence.payload);assert.ok(lifecycle);assert.equal(lifecycle.terminationConfirmed,true);assert.equal(lifecycle.timedOut,false);
 const {actorTerminalEventRef,...copies}=lifecycle;const terminal=decoded.find(r=>r.eventId===actorTerminalEventRef);assert.equal(terminal.kind,'actor_invocation_failed');assert.equal(terminal.payload.consumedArtifactEventRef,artifact.eventId);
 const {cCallRef:_call,requestRef:_rr,requestDigest:_rd,...durableObservation}=artifact.payload;
 const observation={...durableObservation,...copies};
 const fromRef=(ref,scheme)=>{assert.ok(ref.startsWith(scheme));const digest=ref.slice(scheme.length);assert.match(digest,/^[a-f0-9]{64}$/u);return 'sha256:'+digest;};
 const value=result.payload.value,sourceDigest=fromRef(value.failureSourceRef,'runtime-failure-source://abiogenesis/'),failureSignalDigest=fromRef(value.failureSignalRef,'retry-failure-signal://abiogenesis/');
 const signal={kind:'c_call_runtime_failure_signal',schemaVersion:'5.0.0',failureClass:'contract_failure',sourceClass:'probabilistic_transport',sourceDigest,failureSignalDigest,failureSignalRef:value.failureSignalRef};
 assert.equal(e.product.sha256Canonical({schemaVersion:'5.0.0',failureClass:signal.failureClass,sourceClass:signal.sourceClass,sourceDigest}),failureSignalDigest);
 assert.equal(judgment.payload.reasonRef,signal.failureSignalRef);assert.equal(judgment.payload.resultDigest,result.payload.resultDigest);
 const expected={cCallRef,resultRef:result.payload.resultRef,judgmentRef:judgment.payload.judgmentRef,signal};
 const binding=decoded.find(r=>r.kind==='actor_transport_binding_admitted'&&r.payload.transportBindingRef===artifact.payload.transportBindingRef);assert.ok(binding);
 const artifacts=[];for(const [name,path]of Object.entries(binding.payload.paths)){if(typeof path==='string')try{artifacts.push({name,...await pin(path)});}catch(error){if(error.code!=='ENOENT')throw error;artifacts.push({name,path,absent:true});}}
 await save(join(output,'owner-extraction.json'),{expected,request,observation,actorTerminalEventRef,artifactEventRef:artifact.eventId,evidenceEventRef:evidence.eventId,resultEventRef:result.eventId,judgmentEventRef:judgment.eventId,artifacts,derivation:'Expected classification fixed independently; source/signal/result/judgment identities extracted from actual owner-admitted result and judgment, lifecycle from existing owner over exact evidence. Projector-under-test not called.'});
 const fixture={population:'native-assessment',eventContractDigest:handoff.prefix.storeIdentity.eventContractDigest,eventCount:decoded.length,runId:opened.scope.runId,expected,request,observation,actorTerminalEventRef,transportPrefixCount:terminal.admissionOrdinal,preterminalPrefixCount:terminal.admissionOrdinal-1,sourceEvidence:{artifactEventRef:artifact.eventId,evidenceEventRef:evidence.eventId,resultEventRef:result.eventId,judgmentEventRef:judgment.eventId},externalEvidence:{closeHandoff:await pin(join(output,'close-handoff.json')),extraction:await pin(join(output,'owner-extraction.json')),setup:await pin(join(output,'setup.json')),script:await pin(join(controlRoot,'malformed-actor.mjs'))},proofClass:'real installed RC10 owners with deterministic scripted process; historical projection component input, no present physical authority'};
 const generated=await snapshot(bytes,fixture,join(controlRoot,'generated/native-assessment'));
 await save(join(output,'GENERATION.json'),{status:'generated_current_owner_snapshot',sourceOriginalBytesSha256:sha(bytes),generated,physicalReadMatched:true,resourceClosed:true,paidProviderCalls:0});
}catch(error){
 let closure='no returned environment';if(e&&!closed)try{const h=e.store.projectReopenAuthorityAndClose();closed=true;await save(join(output,'failure-close-handoff.json'),h);closure='owner closed';}catch(closeError){closure=String(closeError);}
 await save(join(output,'FAILURE.json'),{message:error.message,stack:error.stack,scratch:e?.scratch??null,resourceClosed:closed,closure});throw error;
}
