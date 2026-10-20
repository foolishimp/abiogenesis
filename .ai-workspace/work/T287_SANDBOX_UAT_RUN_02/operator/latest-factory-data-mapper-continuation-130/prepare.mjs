import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {exclusiveRecord,readOracleEvents} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
import {installedModules,publicCaller,requireKind} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/public-setup.mjs';

const root=fileURLToPath(new URL('.',import.meta.url));
const readJson=async p=>JSON.parse(await readFile(p,'utf8'));
const record=(name,value,raw=false)=>exclusiveRecord(root,name,value,raw);
async function hashFile(path){const h=createHash('sha256');let byteCount=0;for await(const b of createReadStream(path)){h.update(b);byteCount+=b.length;}return {path,sha256:h.digest('hex'),byteCount};}
async function inputs(){
  const selected=await readJson(join(root,'inputs.json'));
  for(const pin of selected.pins)assert.deepEqual(await hashFile(pin.path),pin);
  const archive=selected.archive,old=await readJson(join(archive,'run.json'));
  const setup=await readJson(join(archive,'setup-identity.json'));
  const acquisition=await readJson(join(archive,'abg-acquisition.json'));
  const original=(await readJson(join(archive,'calls/lifecycle-start.request.jsonl'))).invocation;
  const installedRoot=setup.installations[0].installedRoot;
  const runtime=await installedModules(installedRoot);
  assert.equal(acquisition.verification.verifiedArtifact.productContentDigest,selected.productContentDigest);
  assert.equal(setup.installations[0].productContentDigest,selected.productContentDigest);
  assert.equal(original.invocation.definitionKey.memberKey,'start');
  assert.equal(original.invocation.request.sourceBasis.kind,'none');
  assert.equal(original.invocation.request.program.ref,setup.program.programRef);
  const actorRef='actor://abi5-tests/sandbox-uat/'+old.runId;
  assert.equal(setup.workspaceAuthority.authorizedActorRef,actorRef);
  assert.equal(original.resources.runEnvironmentResources.permission.actorRef,actorRef);
  return {selected,archive,old,setup,acquisition,original,installedRoot,runtime,actorRef};
}
export async function inspectPreparation(){
  const x=await inputs(),{product,abg,api}=x.runtime;
  for(const name of ['retainedGovernanceWorkInput','constructRootInvocationPolicy','constructCapabilityGrant','constructInvocationAuthority','constructRunEnvironmentResources'])assert.equal(typeof product[name],'function',name);
  for(const name of ['deriveInvocationSourceResultBasisAtPrefix','rehydrateInvocationAdmissionAtPrefix','selectValidatedRuntimeEventPrefix','hasAdmittedProductInstall'])assert.equal(typeof abg[name],'function',name);
  assert.equal(typeof api.constructInstalledPublicDefinitionCall,'function');
  assert.equal(product.isRunInvocationResourceAssertion(x.original.resources),true);
  assert.deepEqual(product.constructRunEnvironmentResources(x.original.resources.runEnvironmentResources),x.original.resources.runEnvironmentResources);
  return {classification:'Preparation mechanics only; no current source basis, quiescence, new invocation or provider proof',installedRoot:x.installedRoot,productContentDigest:x.selected.productContentDigest,program:x.original.invocation.request.program,workspaceBinding:x.setup.workspaceBinding,ownedInputs:x.selected.pins.length,nativeLimitsUnchanged:x.old.configuration.processTimeoutMs===18060000&&x.old.configuration.maxProcessOutputBytes===268435456};
}
export async function prepareContinuation(sourceResultRef){
  assert.match(sourceResultRef,/^result:\/\/abiogenesis\/[a-f0-9]{64}$/u);
  const x=await inputs(),{product,abg,api}=x.runtime,hash=product.sha256Canonical;
  // These are genuine normal caller outputs, absent while the original CLI is live.
  const outcome=await readJson(join(x.archive,'calls/lifecycle-start.outcome.json'));
  const handoff=await readJson(join(x.archive,'final-close-handoff.json'));
  const nativeExit=await readJson(join(x.archive,'commands/lifecycle-start.result.json'));
  assert.equal(nativeExit.signal,null);assert.equal(nativeExit.timedOut,false);assert.equal(nativeExit.truncated,false);assert.equal(nativeExit.failure,null);
  assert.deepEqual(outcome.receipt.resources.eventResource.closeHandoff,handoff);
  assert.equal(outcome.receipt.resources.run.ref,x.selected.sourceRunRef);
  const inherited=Object.fromEntries((x.old.configuration.inheritEnvironment??['HOME','PATH','TMPDIR','LANG','LC_ALL']).filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
  const config={...x.old.configuration,runId:x.old.runId,bootstrapRoot:x.installedRoot,setupEnvironment:{...inherited,...(x.old.configuration.toolchainEnvironment??{})}};
  const native={request:x.acquisition.request,verification:x.acquisition.verification,verified:x.acquisition.verification.verifiedArtifact};
  const caller=publicCaller({root,runtime:x.runtime,native,command:null,record,config});
  caller.installedRoot=x.installedRoot;caller.workspaceAuthority=x.setup.workspaceAuthority;
  caller.state.closeHandoff=handoff;caller.state.binding=x.setup.workspaceBinding;caller.state.resolvedLock=x.setup.resolvedLock;
  caller.state.catalog=x.original.resources.catalog;caller.state.catalogView=x.original.resources.catalogView;
  // One authenticated cold acquisition; the existing nominal source is passed into environment projection.
  const events=await readOracleEvents(abg,handoff.prefix,record,source=>caller.refresh(source));
  const prefix=abg.selectValidatedRuntimeEventPrefix(events);
  const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,outcome.receipt.resources.invocationAdmission.ref);
  assert.ok(admission,'Original invocation must rehydrate through its exact owner');
  const source=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:x.original.invocation.invocationDigest,runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:admission.invocationAdmissionRef,runId:x.selected.sourceRunRef,resultRef:sourceResultRef});
  assert.ok(source,'No closed/quiescent/latest-applicable source basis; continuation refused');
  const input=product.retainedGovernanceWorkInput(source.sourceResultValue);
  assert.ok(input,'Retained nonterminal original state with observations and unresolved support is required');
  assert.deepEqual(input.original,x.original.invocation.request.input.value.original);
  const environment=caller.state.environment,workspaceBinding=environment.workspaceBinding,admittedInstalls=environment.productInstalls;
  const resolution=requireKind(await product.ProductExecutionResolutionPort.resolve({catalog:caller.state.catalog,catalogView:caller.state.catalogView,admittedInstalls,verifyInstallAdmission:i=>abg.hasAdmittedProductInstall(environment.artifactTruth,i),programRef:x.setup.program.programRef,selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}}),'loaded_product_execution_resolution','same-workspace-resolution');
  assert.equal(hash(resolution.program),x.original.invocation.request.program.digest);
  assert.equal(caller.state.catalogView.viewDigest,x.original.invocation.request.catalogView.digest);
  assert.ok(product.admitInstalledProductInput(resolution.productSemantics,resolution.resolution.inputContract.contractRef,input));
  const packet=product.RUN_OPERATION_CONTRACTS.invoke.start,regimes=new Set(resolution.programValidation.executableLeafRows.map(r=>r.fibre));
  const policy=product.constructRootInvocationPolicy(workspaceBinding,resolution.program,[],['F_D','F_P','F_H'].filter(r=>regimes.has(r)),[]);
  const grants=[product.constructCapabilityGrant(policy,x.actorRef,packet.definitionKey.operationId,product.DIRECT_INVOKE_CAPABILITY,{admittedInstalls,workspaceBinding,fixedPacket:packet})];
  const authority=product.constructInvocationAuthority(x.actorRef,workspaceBinding,caller.state.catalogView,x.setup.program.programRef,resolution.selectedCatalogEntry,policy,grants,{admittedInstalls,workspaceBinding,fixedPacket:packet});
  const eventResource=caller.reopen(),steering=hash(eventResource),program={ref:resolution.resolution.programRef,digest:resolution.resolution.programDigest},view=x.original.invocation.request.catalogView;
  const boundInput={contract:{ref:resolution.resolution.inputContract.contractRef,digest:resolution.resolution.inputContractDigest},valueRef:'value://abi5-tests/sandbox-uat/'+x.old.runId+'/continuation-130',valueDigest:hash(input),value:input};
  const request={...x.original.invocation.request,input:boundInput,sourceBasis:{kind:'admitted_source_result',projectionAuthority:{ref:x.original.invocation.invocationRef,digest:source.publicAuthorityDigest},sourceResult:{ref:source.sourceResultRef,digest:source.sourceResultDigest}}};
  const slots={...Object.fromEntries(Object.keys(x.original.invocation.invocationAuthority.slots).map(k=>[k,null])),workspace_binding:caller.state.binding,product_set:admittedInstalls.map(product.productInstallCoordinate),dependency_lock:{ref:workspaceBinding.lockId,digest:workspaceBinding.lockDigest},catalog_scope:{catalog:{ref:'graph-function-catalog://abiogenesis/'+caller.state.catalog.basisDigest.slice(7),digest:caller.state.catalog.basisDigest},view,allowlist:request.allowlist},execution_program:program,input_contract:boundInput,session_policy:{ref:policy.policyRef,digest:policy.policyDigest},capability_grants:{requiredCapabilityRefs:[...packet.metadata.capabilityRefs],grants:grants.map(g=>({ref:g.grantRef,digest:g.grantDigest}))},actor:{actor:{ref:x.actorRef,digest:hash({actorRef:x.actorRef})},attribution:{ref:authority.authorityRef,digest:authority.authorityDigest}},transport_steering:{ref:'transport-steering://abiogenesis/'+steering.slice(7),digest:steering}};
  const r=x.original.resources.runEnvironmentResources,coordinates={dependencies:r.dependencies,pythonPath:r.pythonPath,temporaryRoot:r.temporaryRoot};
  const runEnvironmentResources=product.constructRunEnvironmentResources({...r,permission:{...r.permission,authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,...coordinates}});
  const contractCatalog=native.verified.definitionContractCoordinates.operations.find(v=>v.operationId===packet.definitionKey.operationId).members.find(v=>v.memberKey==='start').slots.request.contractCatalog;
  const call=api.constructInstalledPublicDefinitionCall({product,installedPublic:api,definitionContractCoordinates:native.verified.definitionContractCoordinates,contractCatalog,...packet.definitionKey,request,slots,resources:{...x.original.resources,eventResource,source:{kind:'admitted_source_result',basis:source},runEnvironmentResources},requestRef:'request://abi5-tests/sandbox-uat/'+x.old.runId+'/continuation-130',correlationRef:'correlation://abi5-tests/sandbox-uat/'+x.old.runId+'/continuation-130',eventTime:new Date().toISOString(),provenanceRefs:[pathToFileURL(join(x.archive,'run.json')).href]});
  assert.notEqual(call.invocation.invocationRef,x.original.invocation.invocationRef);
  await record('calls/continuation-start.request.jsonl',JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:handoff},invocation:call})+'\n',true);
  const setup={classification:'Owner-constructed same24/sameW source-result candidate; no dispatch or new admission',fromArchive:x.archive,sourceRunRef:x.selected.sourceRunRef,sourceResultRef:source.sourceResultRef,sourceBasisRef:source.basisRef,sourceBasisDigest:source.basisDigest,sourceResultValueDigest:source.sourceResultValueDigest,sourceObservations:input.observations.length,sourceTerminal:input.terminal,prefix:handoff.prefix,workspaceBinding:caller.state.binding,program,view,publicInvocationRef:call.invocation.invocationRef,publicInvocationDigest:call.invocation.invocationDigest,launch:{executable:config.nodePath,args:[join(x.installedRoot,'build/code/src/public/cli.js'),'--jsonl',join(root,'calls/continuation-start.request.jsonl')],cwd:root},limits:{nativeMs:config.processTimeoutMs,nativeBytes:config.maxProcessOutputBytes,outerMs:19260000,outerBytes:536870912},qualityWindow:'Actual continuation CLI command request.started +18000000; no old clock relabeling',originalCriteriaConserved:true,physicalCopy:false};
  await record('continuation-setup.json',setup);return setup;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  if(process.argv[2]==='--inspect'){const result=await inspectPreparation();await record('mechanical-inspection.json',result);console.log(JSON.stringify(result));}
  else if(process.argv[2]==='--prepare'&&process.argv.length===4)console.log(JSON.stringify(await prepareContinuation(process.argv[3])));
  else throw new TypeError('Use --inspect, or after a separate execution grant --prepare <exact Root-selected ResultRef>');
}
