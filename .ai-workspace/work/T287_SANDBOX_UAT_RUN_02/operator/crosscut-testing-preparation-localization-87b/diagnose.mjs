import assert from 'node:assert/strict';
import {readFile, writeFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, join} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {Session} from 'node:inspector';

const phase=dirname(fileURLToPath(import.meta.url));
const prior=join(dirname(phase),'crosscut-installed-source-context-proof-82');
const evidence=join(prior,'execution-authority-root');
const save=(name,value)=>writeFile(join(phase,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const pin=async path=>{const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};
const started=performance.now();
const state={scope:'one actual installed F_D port.invoke; no owner or module replacement',stages:[],exceptions:[]};
const mark=(name,fields={})=>state.stages.push({name,elapsedMs:performance.now()-started,...fields});
try {
  const setup=JSON.parse(await readFile(join(evidence,'setup.json'),'utf8'));
  const handoff=JSON.parse(await readFile(join(evidence,'handoff.json'),'utf8'));
  const execution=JSON.parse(await readFile(join(evidence,'execution.json'),'utf8'));
  const request=JSON.parse((await readFile(execution.requestPath,'utf8')).trim());
  const load=name=>import(pathToFileURL(join(setup.installedRoot,'build/code/src',name+'.js')));
  const [product,abg,gtl,calls,cursors,leaf,storeOwner,artifactOwner,effectOwner]=await Promise.all(['product/index','abg/index','gtl/index','abg/c_call','abg/traversal_cursor','implementation/leaf_invocation_port','abg/event_store','abg/artifact_truth','product/worksite_effect'].map(load));
  const hash=product.sha256Canonical;
  const frozen=JSON.parse(await readFile(join(prior,'authority-root-freeze.json'),'utf8'));
  const files=[...frozen.ledger.filter(r=>r.path===new URL(handoff.prefix.eventLogRef).pathname||r.path===execution.requestPath),...frozen.worksiteFiles,...frozen.installedCausalOwners];
  // The original request predates the frozen failed attempt and is separately pinned here.
  state.inputPins=[await pin(execution.requestPath),await pin(join(evidence,'handoff.json')),await pin(join(evidence,'setup.json'))];
  for(const row of files){const current=await pin(row.path);assert.equal(current.sha256,row.sha256,row.path);assert.equal(current.byteCount,row.byteCount,row.path);}
  const originalStats=await stat(new URL(handoff.prefix.eventLogRef));
  const events=abg.readRuntimeEventsAtDurablePrefix(handoff.prefix,{requireCurrent:true});
  assert.equal(events.length,138);
  const selected=events.find(e=>e.admissionOrdinal===109);
  assert.equal(selected.kind,'c_call_fibre_selected');
  const historical=storeOwner.durableRuntimeEventPrefixThroughEvent(handoff.prefix,selected.eventId);
  const artifactTruth=abg.projectOwnedPrefixArtifactTruth(historical);
  assert.equal(artifactTruth.kind,'exact_prefix_artifact_truth_projection');
  const prefix=artifactOwner.runtimePrefixFromArtifactTruth(artifactTruth);assert.ok(prefix);
  const basisEvent=events.find(e=>e.admissionOrdinal===103);
  const executionBasis=abg.rehydrateExecutionBasisAtPrefix(prefix,basisEvent.payload.basisRef);assert.ok(executionBasis);
  const environment=abg.projectWorkspaceEnvironmentFromArtifactTruth(artifactTruth,{ref:executionBasis.workspaceBindingId,digest:executionBasis.workspaceBindingDigest});
  assert.equal(environment.kind,'exact_prefix_workspace_environment');
  const resources=request.invocation.resources;
  const catalog=product.admitGraphFunctionCatalog(resources.catalog.readinessBasis);assert.equal(catalog.kind,'graph_function_catalog');
  assert.equal(catalog.basisDigest,resources.catalog.basisDigest);
  const catalogView=product.narrowGraphFunctionCatalog(catalog,resources.catalogView.allowlist);
  assert.equal(catalogView.kind,'graph_function_catalog_view');assert.equal(catalogView.viewDigest,resources.catalogView.viewDigest);
  let rootExecutionBasis=executionBasis;
  const basisLineage=[];
  while(rootExecutionBasis.parentExecutionBasisRef!==null){
    basisLineage.push(rootExecutionBasis.basisRef);
    const parent=abg.rehydrateExecutionBasisAtPrefix(prefix,rootExecutionBasis.parentExecutionBasisRef);assert.ok(parent);
    assert.equal(parent.invocationAdmissionRef,executionBasis.invocationAdmissionRef);
    assert.equal(parent.workspaceBindingId,executionBasis.workspaceBindingId);
    assert.equal(parent.workspaceBindingDigest,executionBasis.workspaceBindingDigest);
    rootExecutionBasis=parent;
  }
  assert.equal(rootExecutionBasis.basisClass,'root');basisLineage.push(rootExecutionBasis.basisRef);
  const originalStart=request.invocation.invocation.request;
  assert.equal(originalStart.scope,'program');assert.equal(originalStart.target.kind,'next');
  const resolved=await product.ProductExecutionResolutionPort.resolve({catalog,catalogView,admittedInstalls:environment.productInstalls,
    verifyInstallAdmission:install=>abg.hasAdmittedProductInstall(artifactTruth,install),programRef:originalStart.program.ref,
    selection:{kind:'start',scope:originalStart.scope,target:originalStart.target.kind,until:originalStart.until,rootMode:originalStart.rootMode}});
  assert.equal(resolved.kind,'loaded_product_execution_resolution',JSON.stringify(resolved));
  assert.equal(hash(resolved.program),rootExecutionBasis.programDigest);assert.equal(hash(resolved.program),executionBasis.programDigest);
  assert.equal(hash(resolved.graphFunction),rootExecutionBasis.graphFunctionDigest);
  const rootImplementationSet=abg.rehydrateAdmittedImplementationSetAtPrefix(prefix,rootExecutionBasis.implementationSetRef);assert.ok(rootImplementationSet);
  const rootPort=await leaf.constructAdmittedLeafInvocationPort({prefix,artifactTruth,implementationSet:rootImplementationSet,executionResolution:resolved,
    semanticsProjection:product.projectInstalledLeafSemantics(resolved.productSemantics)});
  assert.equal(leaf.isAdmittedLeafInvocationPort(rootPort),true);
  const port=await rootPort.forGraphFunction(executionBasis.graphFunctionRef);assert.ok(port);
  assert.equal(leaf.isAdmittedLeafInvocationPort(port),true);
  const graphFunction=port.graphFunctionByRef(executionBasis.graphFunctionRef);assert.ok(graphFunction);
  assert.equal(hash(graphFunction),executionBasis.graphFunctionDigest);
  const graph=gtl.materializeGraph(graphFunction,{invocationAdmissionRef:executionBasis.invocationAdmissionRef,
    admittedInputRef:executionBasis.rawInputAdmissionRef,admittedInputDigest:executionBasis.rawInputDigest,admittedInput:executionBasis.rawInputValue});
  assert.equal(graph.materializationRef,executionBasis.graphRef);assert.equal(graph.materializationDigest,executionBasis.graphDigest);
  const cCall=calls.projectOpenedCCallCarrierAtPrefix(prefix,graph,selected.payload.cCallRef);assert.ok(cCall);
  const opened=cursors.projectOpenedCCallTraversalInputAtPrefix(prefix,graph,cCall.cCallRef);assert.ok(opened);
  assert.equal(hash(opened.execution),hash(executionBasis));
  const implementationSet=abg.rehydrateAdmittedImplementationSetAtPrefix(prefix,executionBasis.implementationSetRef);assert.ok(implementationSet);
  const nativeBasis=abg.constructNativeInstructionAssemblyBasis({publication:resolved.programPublication,graph,graphFunction,
    declarationGraphFunctions:port.declarationGraphFunctions(),executionBasis,cCall,cursor:opened.cursor,predecessorPrefix:historical});
  assert.ok(nativeBasis,'actual native basis constructor');
  const nativeOwner=abg.authenticateNativeInstructionAssemblyBasis(nativeBasis);assert.ok(nativeOwner);
  assert.equal(nativeOwner.call.cCallRef,cCall.cCallRef);assert.equal(calls.projectCCallCarrierPhaseAtPrefix(prefix,cCall).phase,'selected_no_evidence');
  assert.deepEqual(nativeOwner.inputValue,opened.input.value);assert.deepEqual(opened.input.value,basisEvent.payload.rawInputValue);
  const resolution=abg.selectAdmittedImplementationResolution(implementationSet,{graphFunctionRef:cCall.graphFunctionRef,nodeRef:opened.cursor.currentNodeRef,
    programLocusRef:cCall.programLocusRef,implementationBindingRef:cCall.implementationBindingRef});assert.ok(resolution);
  assert.deepEqual(resolution,nativeOwner.resolution);assert.equal(port.isAdmittedResolution(resolution),true);
  assert.equal(resolution.computeRegime,'F_D');assert.equal(resolution.implementationRef,'implementation://abiogenesis/default-library/prepare-testing@5');
  const occurrence=Object.freeze({nativeInstructionAssemblyBasis:nativeBasis,cCallRef:cCall.cCallRef,runId:cCall.runId,graphCallId:cCall.graphCallId,
    frameId:cCall.frameId,programLocusRef:cCall.programLocusRef,taskOrdinal:cCall.taskOrdinal,attempt:cCall.attempt,executionAuthority:null});
  // HoG's existing worksiteLeafAuthority returns null for this GovernanceWorkState preparation.
  // The selected F_D function only observes context/subjects and constructs the finite C2 task.
  assert.equal(product.isGovernanceWorkState(opened.input.value),true);
  assert.equal(product.isNativeWorkspaceWorkTask(opened.input.value),false);
  assert.equal(product.isWorksiteFileReplaceRequest(opened.input.value),false);
  assert.equal(effectOwner.isWorksiteFileParentsRequest(opened.input.value),false);
  state.authenticated={basisLineage,rootBasisRef:rootExecutionBasis.basisRef,rootImplementationSetRef:rootImplementationSet.implementationSetRef,originalStartSelection:{scope:originalStart.scope,target:originalStart.target,until:originalStart.until,rootMode:originalStart.rootMode},childSemanticsRoute:'rootPort.forGraphFunction',historical,originalFinalPrefix:handoff.prefix,basisRef:executionBasis.basisRef,cCallRef:cCall.cCallRef,
    inputDigest:opened.cursor.inputDigest,nativeInputDigest:hash(nativeOwner.inputValue),resolution,programRef:resolved.program.programRef,
    publicationDigest:hash(resolved.programPublication),cursorRef:opened.cursor.cursorRef,cursorDigest:opened.cursor.cursorDigest,
    portIsAdmitted:true,callPhase:'selected_no_evidence',effectCone:'read context/read four selected file observations/finite task construction only; no actor or admission'};
  mark('authentic-owner-and-occurrence-ready');
  const session=new Session();session.connect();
  const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,result)=>error?reject(error):resolve(result)));
  const scripts=new Map();
  session.on('Debugger.scriptParsed',message=>scripts.set(message.params.scriptId,message.params.url));
  session.on('Debugger.paused',message=>{
    const p=message.params;
    state.exceptions.push({reason:p.reason,description:p.data?.description??null,
      frames:p.callFrames.map(f=>({functionName:f.functionName,url:f.url||scripts.get(f.location.scriptId)||null,
        line:f.location.lineNumber+1,column:f.location.columnNumber+1}))});
    session.post('Debugger.resume');
  });
  await post('Debugger.enable');await post('Debugger.setPauseOnExceptions',{state:'all'});
  mark('actual-port-invoke-start');
  try {
    state.actualOwnerResult=await port.invoke({resolution,input:opened.input.value,inputDigest:opened.cursor.inputDigest,
      failureContractRef:cCall.failureContractRef,occurrence,predecessorPrefix:historical});
    mark('actual-port-invoke-return',{kind:state.actualOwnerResult.kind,receiptPresent:state.actualOwnerResult.receipt!==null});
  } finally {await post('Debugger.setPauseOnExceptions',{state:'none'});await post('Debugger.disable');session.disconnect();}
  state.closedReceipt={kind:state.actualOwnerResult.kind,computeRegime:state.actualOwnerResult.computeRegime,
    receiptPresent:state.actualOwnerResult.receipt!==null,resultCandidate:state.actualOwnerResult.candidate?.resultCandidate,
    diagnosticRef:state.actualOwnerResult.candidate?.diagnosticRef};
  assert.deepEqual(state.actualOwnerResult.candidate?.resultCandidate,events.find(e=>e.admissionOrdinal===115).payload.value);
  for(const row of files){const current=await pin(row.path);assert.equal(current.sha256,row.sha256,row.path);assert.equal(current.byteCount,row.byteCount,row.path);}
  const afterStats=await stat(new URL(handoff.prefix.eventLogRef));assert.equal(afterStats.dev,originalStats.dev);assert.equal(afterStats.ino,originalStats.ino);
  state.conservation={allSelectedFilesUnchanged:true,eventFileDevice:afterStats.dev,eventFileInode:afterStats.ino,eventFileByteCount:afterStats.size};
  state.status='completed-one-read-only-invoke';
} catch(error) {
  state.status='STOP-first-error';state.error={name:error.name,message:error.message,stack:error.stack};
}
state.elapsedMs=performance.now()-started;
await save('measurement-final.json',state);
console.log(JSON.stringify({status:state.status,elapsedMs:state.elapsedMs,stages:state.stages,exceptions:state.exceptions,closedReceipt:state.closedReceipt,error:state.error},null,2));
if(state.status!=='completed-one-read-only-invoke')process.exitCode=1;
