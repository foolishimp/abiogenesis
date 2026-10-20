import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootExecutionBasis,publicOperationBasis,requireRawAdmission} from './root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct} from './registered-graph-selection.mjs';
import {declarations,ref,contract,fixtureInput,hash,model,gap,next,refreshModel,refreshGap,finish,spanApplication,selectedDeclaredAction} from '../fixtures/t287-selected-action-product/index.mjs';
const proof=process.env.ABI5_SELECTED_ACTION_EVIDENCE_ROOT;
assert.ok(proof);
const save=(name,value)=>fs.writeFileSync(join(proof,name),JSON.stringify(value,null,2)+'\n');
const root=new URL('../..',import.meta.url).pathname,started=performance.now(),accounting={wallMs:{}};
let e;
try {
 e=process.env.ABI5_SELECTED_ACTION_CURRENT_ENV ? await prepareCurrentRoot(JSON.parse(fs.readFileSync(process.env.ABI5_SELECTED_ACTION_CURRENT_ENV,'utf8'))) : await setupInstalledRootExecutionBasis({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
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
 const runStarted=performance.now(),nativeFsync=fs.fsyncSync;
 fs.fsyncSync=function(fd){nativeFsync(fd);const bytes=fs.readFileSync(eventLogPath);if(bytes.length===0||bytes.at(-1)!==10)return;const events=bytes.toString().trim().split('\n').map(JSON.parse);const selections=events.filter(v=>v.kind==='construction_intent_selected'&&v.runId===opened.scope.runId);if(selections.length===(process.env.ABI5_SELECTED_ACTION_CURRENT_ENV?1:2)){
  fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);
  save('interruption.json',{hook:'test-only node:fs fsyncSync wrapper after native fsync; no runtime bytes patched',processId:process.pid,signal:'SIGKILL',eventCount:events.length,selectionCount:selections.length,selectedEvent:selections.at(-1),initialTraversalMs:performance.now()-runStarted});
  process.kill(process.pid,'SIGKILL');
 }};syncBuiltinESMExports();
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
// A separately admitted current invocation and basis, using the same installed owner pipeline.
async function prepareCurrentRoot(saved) {
 const load=p=>import(pathToFileURL(join(saved.installedRoot,`build/code/src/${p}.js`)).href);
 const product=await load('product/index'),abg=await load('abg/index'),gtl=await load('gtl/index'),validator=await load('validator/index'),hog=await load('hog/index'),implementationLeafPort=await load('implementation/leaf_invocation_port');
 const acquired=abg.reopenEventStore(saved.closeHandoff.reopenAuthority);assert.ok(acquired.store,JSON.stringify(acquired));
 const store=acquired.store,workspaceBinding=saved.workspaceBinding,artifactTruth=abg.projectExactPrefixArtifactTruth(saved.closeHandoff.prefix);
 const executionResolution=await product.ProductExecutionResolutionPort.resolve({catalog:saved.catalog,catalogView:saved.catalogView,admittedInstalls:saved.admittedInstalls,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(artifactTruth,i),programRef:ref('program','root'),selection:{kind:'direct',catalogHandle:ref('graph-function','root')}});
 assert.equal(executionResolution.kind,'loaded_product_execution_resolution',JSON.stringify(executionResolution));
 const {program,graphFunction,programValidation}=executionResolution,publication=executionResolution.programPublication;
 const policy=product.constructRootInvocationPolicy(workspaceBinding,program,programValidation.interactionLeafRows.map(row=>({requirementKey:row.requirementKey,requirementKeyDigest:row.requirementKeyDigest,actorCapabilityRef:row.requirement.actorCapabilityRef})),['F_D']);
 const actorRef=workspaceBinding.authorizedActorRef,capabilityGrantBasis={admittedInstalls:saved.admittedInstalls,workspaceBinding,fixedPacket:product.RUN_OPERATION_CONTRACTS.invoke.start};
 const capabilityGrant=product.constructCapabilityGrant(policy,actorRef,'abg.operation.run.invoke',product.DIRECT_INVOKE_CAPABILITY,capabilityGrantBasis),capabilityGrants=[capabilityGrant];
 const input={...fixtureInput({workspaceBinding,program}),phase:1,task:{kind:'fixture_task',schemaVersion:'5.0.0',payload:'selected second action',currentAuthorityMarker:workspaceBinding.bindingId},coveredSelectionRefs:saved.coveredSelectionRefs};
 const rawInput=requireRawAdmission(validator,input,'invocation_input',contract('request'));
 const rawRequest=requireRawAdmission(validator,{kind:'public_invocation',schemaVersion:'5.0.0',operationId:'abg.operation.run.invoke',variant:'start',invocationRef:'invocation://selected-action/covered-current',eventTime:'2026-09-30T00:03:00.000Z',correlationId:'correlation://selected-action/covered-current',payload:{programRef:program.programRef,catalogHandle:graphFunction.name,scope:'program',target:program.policies['abg.default_start_ref'],startRef:program.policies['abg.default_start_ref'],until:'converged',rootMode:'supervised'}},'public_operation_request','contract://abiogenesis/public/run-invoke-request@5');
 const selectedRow=product.lookupGraphFunction(saved.catalogView,graphFunction.name);
 const invocationAuthority=product.constructInvocationAuthority(actorRef,workspaceBinding,saved.catalogView,program.programRef,selectedRow,policy,capabilityGrants,capabilityGrantBasis);
 const invocation=product.constructStartInvocation(workspaceBinding,saved.catalogView,program,selectedRow,rawRequest,rawInput,policy,capabilityGrants,invocationAuthority);assert.equal(invocation.kind,'public_invocation_candidate',JSON.stringify(invocation));
 const receipt=abg.admitInvocation(store,{invocation,rawRequest,rawInput,programPublication:publication,executionResolution:executionResolution.resolution,program,graphFunction,programValidation,workspaceBinding,artifactTruth,catalogView:saved.catalogView,policy,capabilityGrants,authority:invocationAuthority},publicOperationBasis(product,'abg.operation.run.invoke',workspaceBinding.bindingId,workspaceBinding.bindingDigest,invocation.publicRequestInvocationRef,[workspaceBinding.admissionEventRef],'start'));
 assert.equal(receipt.kind,'invocation_admission_receipt',JSON.stringify(receipt));const invocationAdmission=receipt.admission;
 const graphContext={invocationAdmissionRef:invocationAdmission.invocationAdmissionRef,admittedInputRef:rawInput.admissionRef,admittedInputDigest:rawInput.subjectDigest,admittedInput:input};
 const graph=gtl.materializeGraph(graphFunction,graphContext),graphValidation=validator.validateGraph(graph,programValidation,graphFunction,graphContext);assert.equal(graphValidation.kind,'graph_validation',JSON.stringify(graphValidation));
 const resolutionSetCandidate=product.resolveImplementationSet(saved.catalogView,executionResolution.declarationClosure,programValidation,executionResolution.packagedImplementations);
 const resolutionSetValidation=validator.validateImplementationResolutionSet(resolutionSetCandidate,saved.catalogView,executionResolution.declarationClosure,programValidation,executionResolution.packagedImplementations);assert.equal(resolutionSetValidation.kind,'implementation_resolution_set_validation',JSON.stringify(resolutionSetValidation));
 const closureContract=publication.closureContracts.find(c=>c.closureContractRef===program.closureContractRef);
 const executionBasisAdmission=abg.admitExecutionBasis(store,receipt.successorPrefix,{invocationAdmission,rawInputValue:input,program,programPublication:publication,executionResolution:executionResolution.resolution,programValidation,graph,graphValidation,resolutionSetCandidate,resolutionSetValidation,closureContract},{eventTime:'2026-09-30T00:03:00.000Z',correlationId:'correlation://selected-action/covered-current-basis',causationEventRefs:[]});
 assert.equal(executionBasisAdmission.kind,'execution_basis_admission',JSON.stringify(executionBasisAdmission));
 const leafPort=await implementationLeafPort.constructAdmittedLeafInvocationPort({prefix:abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(executionBasisAdmission.successorPrefix)),artifactTruth,implementationSet:executionBasisAdmission.implementationSet,executionResolution,semanticsProjection:product.projectInstalledLeafSemantics(executionResolution.productSemantics)});
 return {...saved,product,abg,gtl,validator,hog,store,artifactTruth,executionResolution,program,graphFunction,programValidation,publication,policy,actorRef,capabilityGrant,capabilityGrants,input,rawInput,rawRequest,invocationAuthority,invocationAdmission,graph,graphValidation,closureContract,executionBasisAdmission,executionBasis:executionBasisAdmission.executionBasis,implementationSet:executionBasisAdmission.implementationSet,leafPort,durablePrefix:executionBasisAdmission.successorPrefix};
}
