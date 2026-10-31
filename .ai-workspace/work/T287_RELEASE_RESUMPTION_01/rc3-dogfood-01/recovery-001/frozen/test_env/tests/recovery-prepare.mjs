import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,chmod,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootExecutionBasis} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,ref,contract,actionCatalog} from '../fixtures/exact-intent-product/index.mjs';
const root=new URL('../..',import.meta.url).pathname;
const config=JSON.parse(await readFile(new URL('../../../config.json',import.meta.url),'utf8'));
const proof=join(config.root,'runtime','proof');
await mkdir(proof,{recursive:true});
const save=async(name,value)=>writeFile(join(proof,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
async function main(){
 const accounting={wallMs:{}},started=performance.now();
 let e;
 try {
 e=await setupInstalledRootExecutionBasis({after:()=>{}},root,{frozenArtifact:config.frozenArtifact,candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
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
 const packet=product.RUN_OPERATION_CONTRACTS.continue.current_intent,operationId=packet.definitionKey.operationId;
 const grant=product.constructCapabilityGrant(e.policy,e.actorRef,operationId,packet.metadata.capabilityRefs[0],{admittedInstalls:e.admittedInstalls,workspaceBinding:e.workspaceBinding,fixedPacket:packet});
 const makeCall=(identity,patch={})=>{
  const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
  const request={run:{ref:opened.scope.runId,digest:opened.scope.runDigest},continuation:{ref:pending[0].continuationRef,digest:pending[0].continuationDigest},currentIntent:{ref:prepared.intent.constructionIntentRef,digest:prepared.intent.constructionIntentDigest},continuationInput:{ref:prepared.pending.input.inputRef,digest:prepared.pending.input.inputDigest},expectedBasis:{ref:prepared.child.basisRef,digest:prepared.child.basisDigest},...patch};
  const r=e.executionResolution.resolution,steering=product.sha256Canonical(eventResource),inputDeclaration=e.publication.contracts.find(c=>c.contractRef===prepared.failedCall.inputContractRef);
  const slots={workspace_binding:{ref:e.workspaceBinding.bindingId,digest:e.workspaceBinding.bindingDigest},product_set:e.admittedInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:e.workspaceBinding.lockId,digest:e.workspaceBinding.lockDigest},catalog_scope:{catalog:{ref:`graph-function-catalog://abiogenesis/${e.catalog.basisDigest.slice(7)}`,digest:e.catalog.basisDigest},view:{ref:`graph-function-catalog-view://abiogenesis/${e.catalogView.viewDigest.slice(7)}`,digest:e.catalogView.viewDigest},allowlist:e.catalogView.allowlist},execution_program:{ref:r.programRef,digest:r.programDigest},graph_function:{graphFunction:{ref:r.graphFunctionRef,digest:r.graphFunctionDigest},membership:r.programGraphFunctionMembership},input_contract:{contract:{ref:inputDeclaration.contractRef,digest:product.sha256Canonical(inputDeclaration)},valueRef:prepared.pending.input.inputRef,valueDigest:prepared.pending.input.inputDigest,value:prepared.pendingInput},session_policy:{ref:e.policy.policyRef,digest:e.policy.policyDigest},capability_grants:{requiredCapabilityRefs:packet.metadata.capabilityRefs,grants:[{ref:grant.grantRef,digest:grant.grantDigest}]},actor:{actor:{ref:e.actorRef,digest:product.sha256Canonical({actorRef:e.actorRef})},attribution:{ref:e.invocationAuthority.authorityRef,digest:e.invocationAuthority.authorityDigest}},transport_steering:{ref:`transport-steering://abiogenesis/${steering.slice(7)}`,digest:steering},verification_references:null,execution_basis:{ref:prepared.child.basisRef,digest:prepared.child.basisDigest}};
  const contractCatalog=e.verified.definitionContractCoordinates.operations.find(o=>o.operationId===operationId).members.find(m=>m.memberKey==='current_intent').slots.request.contractCatalog;
  return publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,definitionContractCoordinates:e.verified.definitionContractCoordinates,contractCatalog,operationId,memberKey:'current_intent',request,slots,resources:{kind:'run_invocation_resource_assertion',schemaVersion:'5.0.0',eventResource,catalog:e.catalog,catalogView:e.catalogView,applications:[],source:{kind:'none'}},requestRef:`public-request://exact-intent/${identity}`,correlationRef:`correlation://exact-intent/${identity}`,eventTime:'2026-09-29T00:01:00.000Z',provenanceRefs:[ref('provenance','fixture')]});
 };

 const call=makeCall('continue');
 await save('continue-call.json',call);
 await save('consumed-call.json',makeCall('consumed'));
 await save('read-environment.json',Object.fromEntries(['installedRoot','verified','workspaceAuthority','workspaceBinding','admittedInstalls'].map(k=>[k,e[k]])));
 await save('prepared-checkpoint.json',{classification:'genuine controlled preparation stop; no native consumer dispatched',run:{ref:opened.scope.runId,digest:opened.scope.runDigest},pending:pending[0],intent:prepared.intent,readyPath:prepared.pendingInput.readyPath,expectedReadyBytesBase64:Buffer.from('ready\n').toString('base64'),closeHandoff:handoff,installedRoot:e.installedRoot,artifactPaths:e.artifactPaths});
 console.log(JSON.stringify({status:'prepared',checkpoint:join(proof,'prepared-checkpoint.json'),runId:opened.scope.runId,providerCalls:0}));
 }catch(error){await save('failure.json',{message:error.message,stack:error.stack,scratch:e?.scratch??null});if(e){try{await save('failure-handoff.json',e.store.projectReopenAuthorityAndClose());}catch{}}throw error;}
}
await main();
