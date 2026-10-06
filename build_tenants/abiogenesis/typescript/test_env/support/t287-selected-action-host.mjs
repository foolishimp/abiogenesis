import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {createHash} from 'node:crypto';
import {join,basename} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {setupInstalledRootExecutionBasis} from './root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct} from './registered-graph-selection.mjs';
import {declarations,ref,contract,fixtureInput,hash,model,gap,next,refreshModel,refreshGap,finish,spanApplication,selectedDeclaredAction} from '../fixtures/t287-selected-action-product/index.mjs';
const proof=process.env.ABI5_SELECTED_ACTION_EVIDENCE_ROOT;
const isMain=process.argv[1]===fileURLToPath(import.meta.url);
if(isMain)assert.ok(proof);
const save=(name,value)=>fs.writeFileSync(join(proof,name),JSON.stringify(value,null,2)+'\n');
const root=new URL('../..',import.meta.url).pathname,started=performance.now(),accounting={wallMs:{}};
let e;
if(isMain && process.env.ABI5_SELECTED_ACTION_PUBLIC_START) {
 await runPublicStart(JSON.parse(fs.readFileSync(process.env.ABI5_SELECTED_ACTION_PUBLIC_START,'utf8')));
} else if(isMain) try {
 e=await setupInstalledRootExecutionBasis({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
 prepareAdditionalProducts:async basis=>[process.env.ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV ? await reuseFixture(basis,JSON.parse(fs.readFileSync(process.env.ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV,'utf8'))) : await prepareRegisteredSelectionProduct({...basis,declarationFactory:declarations,fixtureFiles:[{path:'build/index.js',source:new URL('../fixtures/t287-selected-action-product/index.mjs',import.meta.url)}]})],
 inputFactory:fixtureInput});
 // Both branches use the actual installed Program and one declared kind per output.
 const checks=[];
 for(const phase of [0,1]){
  const input={...e.input,phase,task:{...e.input.task,payload:phase===0?'first action':'selected second action'}};
  const initial=gap(model(input).resultCandidate).resultCandidate, selection=next(initial).resultCandidate;
  const evaluation={kind:'identity_precheck_evaluation',observationSnapshot:input,constructionIntentRef:ref('precheck','intent'),targetOutcomeRef:ref('outcome','echo'),edgeClosureDecision:{decisionRef:ref('precheck','decision')}};
  const refresh=refreshModel(evaluation).resultCandidate;
  assert.deepEqual(initial.admittedActionCatalog,e.program.actionCatalog);assert.deepEqual(initial.declaredPolicy,e.program.constructionComposition.closurePolicy);
  const refreshDeclaration=e.publication.contracts.find(c=>c.contractRef===contract('refresh-model'));assert.equal(refresh.kind,refreshDeclaration.valueKind);assert.equal(refresh.kind,'graph_span_selection');
  if(phase===0){assert.equal(refresh.disposition,'re_enter');assert.deepEqual(refresh.targetInput.priorRefreshedModel.observationSnapshot,input);assert.deepEqual(refresh.targetInput.priorRefreshedModel.evaluation,evaluation);assert.deepEqual(refresh.targetInput.actionCatalog,e.program.actionCatalog);assert.equal(next(gap(model(refresh.targetInput).resultCandidate).resultCandidate).resultCandidate.selectedActionRef,ref('action','consumer'));}
  else{assert.equal(refresh.disposition,'continue');assert.deepEqual(refresh.state.observationSnapshot,input);assert.deepEqual(refresh.state.evaluation,evaluation);const refreshed=refreshGap(refresh).resultCandidate;assert.deepEqual(refreshed.admittedActionCatalog,e.program.actionCatalog);const terminal=finish(refreshed).resultCandidate;assert.equal(terminal.kind,e.publication.contracts.find(c=>c.contractRef===contract('final')).valueKind);assert.equal(terminal.disposition,'converged');}
  const selected=e.program.actionCatalog.rows.find(row=>row.actionRef===ref('action',phase===0?'initial':'consumer'));
  assert.equal(selection.selectedActionRef,selected.actionRef);assert.deepEqual(selection.targetObligationRefs,selected.targetObligationRefs);assert.deepEqual(selection.inputAssetRefs,selected.inputAssetRefs);assert.deepEqual(selection.outputAssetRefs,selected.outputAssetRefs);
  assert.equal(e.executionBasis.actionCatalogRef,e.program.actionCatalog.catalogRef);assert.equal(e.executionBasis.actionCatalogDigest,e.program.actionCatalog.catalogDigest);assert.equal(e.executionBasis.programDigest,e.product.sha256Canonical(e.program));
  assert.equal(e.policy.policyDigest,e.invocationAdmission.policyDigest);assert.equal(e.executionBasis.invocationAdmissionRef,e.invocationAdmission.invocationAdmissionRef);
  checks.push({phase,initialCatalogDigest:initial.admittedActionCatalog.catalogDigest,refreshKind:refresh.kind,refreshDisposition:refresh.disposition,selectedActionRef:selection.selectedActionRef,programDigest:e.executionBasis.programDigest,policyDigest:e.policy.policyDigest});
 }
 const terms=e.graphFunction.template.nodes[0].term.terms;assert.equal(terms.length,8);assert.equal(terms[5].compositionRef,e.program.constructionComposition.compositionRef);assert.equal(terms[5].programLocusRef,spanApplication.sourceProgramLocusRef);assert.equal(terms[5].outputCarrierRef,spanApplication.inputContractRef);assert.equal(terms[0].programLocusRef,spanApplication.targetProgramLocusRef);assert.equal(terms[0].inputCarrierRef,spanApplication.outputContractRef);assert.equal(terms[7].outputCarrierRef,contract('final'));
 save('installed-identity-precheck.json',{status:'passed',checks,application:spanApplication,termCount:terms.length,compositionRef:terms[5].compositionRef,source:'actual installed Program -> admitted input and two exact refresh-model branches; terminal refresh-next remains next_action_projection',archiveDigests:await Promise.all(e.artifactPaths.map(p=>e.product.sha256File(p)))});
 const selectedKeys=['scratch','installedRoot','installedRoots','artifactPaths','verified','workspaceAuthority','workspaceBinding','admittedInstalls','catalog','catalogView','policy','actorRef','invocationAuthority','invocationAdmission','input','executionBasis','publication','productSet','lock'];
 save('environment.json',Object.fromEntries(selectedKeys.map(k=>[k,e[k]])));
 save('setup.json',{setupMs:performance.now()-started,accounting,archiveDigests:await Promise.all(e.artifactPaths.map(p=>e.product.sha256File(p))),artifactPaths:e.artifactPaths,installedRoot:e.installedRoot});
 const eventLogPath=join(e.scratch,'runtime/events.jsonl'),identity=fs.statSync(eventLogPath);
 save('initial-origin.json',{initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath},device:identity.dev,inode:identity.ino},ownerPid:process.pid});
 const {abg}=e,opened=abg.openTraversalScope(e.store,e.durablePrefix,{kind:'root',executionBasis:e.executionBasis},{eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial',causationEventRefs:[]});
 assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));save('opened.json',opened);
 const runStarted=performance.now(),nativeFsync=fs.fsyncSync,eventOwner=await import(pathToFileURL(join(e.installedRoot,'build/code/src/abg/event_store.js')).href);
 fs.fsyncSync=function(fd){afterNativeFsync(nativeFsync,fd,()=>{const bytes=fs.readFileSync(eventLogPath),events=eventOwner.validateHistoricalEvents(bytes,e.durablePrefix.storeIdentity.eventContractDigest),selections=events.filter(v=>v.kind==='construction_intent_selected'&&v.runId===opened.scope.runId);if(selections.length===2){
  fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);
  save('interruption.json',{hook:'test-only native fsync -> owner historical decode -> exact selection; no runtime bytes patched',processId:process.pid,signal:'SIGKILL',eventCount:events.length,selectionCount:selections.length,selectedEvent:selections.at(-1),initialTraversalMs:performance.now()-runStarted});
  process.kill(process.pid,'SIGKILL');
 }},error=>stopObserverFailure(error,eventLogPath));};syncBuiltinESMExports();
 const completion=await e.hog.executeGraphTraversal({store:e.store,predecessorPrefix:opened.successorPrefix,executionBasis:e.executionBasis,openedTraversalScope:opened.scope,program:e.program,programPublication:e.publication,graphFunction:e.graphFunction,graph:e.graph,graphValidation:e.graphValidation,programValidation:e.programValidation,implementationSet:e.implementationSet,interactionSet:e.executionBasisAdmission.interactionSet,leafPort:e.leafPort,closureContract:e.closureContract,actorRuntimeBinding:{workspaceBinding:e.workspaceBinding,artifactTruth:e.artifactTruth},input:e.input,inputDigest:e.rawInput.subjectDigest,eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial'});
 fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('initial-traversal-timing.json',{wallMs:performance.now()-runStarted});save('unexpected-completion.json',completion);save('unexpected-events.json',e.store.readAll());save('unexpected-handoff.json',e.store.projectReopenAuthorityAndClose());throw new Error('Selected second action boundary was not reached');
} catch(error){save('host-failure.json',{message:error.message,stack:error.stack,scratch:e?.scratch??null});throw error;}

// Reuse the passed immutable fixture archive; only this case's Install and event resource are new.
async function reuseFixture({product},prior) {
 const artifactPath=prior.artifactPaths[1],manifest=JSON.parse(fs.readFileSync(join(prior.installedRoots[1],'product-toolchain-manifest.json'),'utf8'));
 const basis={artifactDigest:await product.sha256File(artifactPath),manifestDigest:product.sha256Canonical(manifest),productContentDigest:manifest.productContentDigest,productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion};
 return {artifactPath,artifactRef:basename(artifactPath),basis,async loadInstalledPublication({installedRoot,gtl}) {
  const data=JSON.parse(fs.readFileSync(join(installedRoot,'build/publication.json'),'utf8'));
  return gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.manifestDigest,contributions:data.contributions.map(row=>({...row,provenanceRefs:[basis.artifactDigest,basis.manifestDigest]}))});
 }};
}


// Observation only: correlate the submitted Public invocation through actual I/B/Run.
export function afterNativeFsync(nativeFsync,fd,observe,onObservationFailure){
 nativeFsync(fd); // Native failures retain the owner's original propagation/rollback.
 try{observe();}catch(error){onObservationFailure(error);}
}
function stopObserverFailure(error,eventLogPath){
 // A test assertion cannot escape through fsync as a native append failure.
 try{
  const bytes=fs.readFileSync(eventLogPath);fs.writeFileSync(join(proof,'observer-failure-prefix.jsonl'),bytes);
  save('observer-failure.json',{kind:'test_observer_failure',message:error.message,stack:error.stack,processId:process.pid,signal:'SIGKILL',phase:'after native fsync before live successor publication',byteLength:bytes.length,digest:'sha256:'+createHash('sha256').update(bytes).digest('hex')});
 }catch(captureError){try{save('observer-failure.json',{kind:'test_observer_failure',message:error.message,stack:error.stack,captureFailure:String(captureError),processId:process.pid,signal:'SIGKILL'});}catch{process.stderr.write(String(error)+'\n'+String(captureError)+'\n');}}
 finally{process.kill(process.pid,'SIGKILL');}
}
export function observePublicSelection({bytes,eventOwner,expectedProfileDigest,call,environment,selectionCount,abg,scopeOwner,truth}) {
 const rows=eventOwner.validateHistoricalEvents(bytes,expectedProfileDigest);
 const admissions=rows.filter(row=>row.kind==='invocation_admitted'&&row.payload.publicRequestInvocationRef===call.invocation.invocationRef);
 if(admissions.length===0)return null;assert.equal(admissions.length,1,'one actual admission for submitted invocation');
 const prefix=abg.selectValidatedRuntimeEventPrefix(rows),admission=truth.projectExactInvocationAdmissionAtPrefix(prefix,admissions[0].payload.invocationAdmissionRef);assert.ok(admission);
 const selected=rows.filter(row=>row.kind==='construction_intent_selected').filter(row=>truth.projectExactExecutionBasisAtPrefix(prefix,row.basisId)?.invocationAdmissionRef===admission.invocationAdmissionRef);
 if(selected.length!==selectionCount)return null;
 const event=selected.at(-1),executionBasis=truth.projectExactExecutionBasisAtPrefix(prefix,event.basisId),scope=scopeOwner.projectOpenedTraversalScopeForFrameAtPrefix(prefix,event.frameId);assert.ok(scope);
 for(const [field,value] of Object.entries({catalogBasisDigest:environment.catalog.basisDigest,catalogViewDigest:environment.catalogView.viewDigest,workspaceBindingDigest:environment.workspaceBinding.bindingDigest,policyDigest:environment.policy.policyDigest,authorityRef:environment.invocationAuthority.authorityRef,authorityDigest:environment.invocationAuthority.authorityDigest,rawInputDigest:environment.inputDigest}))assert.equal(admission[field],value,`actual current admission ${field}`);
 assert.equal(executionBasis.invocationAdmissionRef,admission.invocationAdmissionRef);assert.equal(scope.executionBasisRef,executionBasis.basisRef);assert.equal(scope.runId,event.runId);
 const ownerInputs=rows.filter(row=>row.kind==='c_call_opened'&&row.runId===event.runId&&row.payload.cursorRef===event.payload.targetCursorRef);assert.equal(ownerInputs.length,0,'interrupt before pending child dispatch');
 return {event,eventCount:rows.length,invocationAdmission:admission,executionBasis,scope};
}
async function runPublicStart(saved) {
 const {environment,call,closeHandoff,selectionCount}=saved;
 assert.deepEqual(call.resources.eventResource.closeHandoff,closeHandoff);assert.ok([1,2].includes(selectionCount));
 const load=p=>import(pathToFileURL(join(environment.installedRoot,`build/code/src/${p}.js`)).href);
 const product=await load('product/index'),abg=await load('abg/index'),scopeOwner=await load('abg/open_call'),truth=await load('abg/invocation_execution_truth'),eventOwner=await load('abg/event_store');
 assert.deepEqual(call.invocation.invocationAuthority.slots.actor.attribution,{ref:environment.invocationAuthority.authorityRef,digest:environment.invocationAuthority.authorityDigest});
 const eventLogPath=fileURLToPath(closeHandoff.prefix.eventLogRef),identity=fs.statSync(eventLogPath);assert.equal(identity.dev,closeHandoff.reopenAuthority.device);assert.equal(identity.ino,closeHandoff.reopenAuthority.inode);
 save('recovery-origin.json',{lastCloseHandoff:closeHandoff,ownerPid:process.pid});
 const nativeFsync=fs.fsyncSync,started=performance.now();
 fs.fsyncSync=function(fd){afterNativeFsync(nativeFsync,fd,()=>{const bytes=fs.readFileSync(eventLogPath),observed=observePublicSelection({bytes,eventOwner,expectedProfileDigest:closeHandoff.prefix.storeIdentity.eventContractDigest,call,environment,selectionCount,abg,scopeOwner,truth});if(observed===null)return;
  save('environment.json',{...environment,executionBasis:observed.executionBasis,invocationAdmission:observed.invocationAdmission});save('opened.json',{kind:'actual_public_start_scope_projection',scope:observed.scope});fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);save('interruption.json',{hook:'test-only native fsync -> owner historical decode -> submitted invocation/I/B/Run/selection',processId:process.pid,signal:'SIGKILL',eventCount:observed.eventCount,selectionCount,selectedEvent:observed.event,publicInvocationRef:call.invocation.invocationRef,initialTraversalMs:performance.now()-started});process.kill(process.pid,'SIGKILL');
 },error=>stopObserverFailure(error,eventLogPath));};syncBuiltinESMExports();
 const requestPath=join(proof,'public-start-transport.jsonl'),cliPath=join(environment.installedRoot,'build/code/src/public/cli.js');fs.writeFileSync(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call})+'\n');process.argv=[process.execPath,cliPath,'--jsonl',requestPath];
 await import(pathToFileURL(cliPath).href);fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('unexpected-public-completion.json',{exitCode:process.exitCode??0});
}
