import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,ref} from '../fixtures/registered-selection-product/index.mjs';

const packageRoot=process.env.ABI5_P5_TEST_TENANT ?? fileURLToPath(new URL('../..',import.meta.url));
// Deliberately permissive ordinary Product contracts carry the retired values
// through preparation, to exercise the actual admission and HoG route owners.
async function runDoor(kind) {
  const original=await readFile(new URL('../fixtures/registered-selection-product/index.mjs',import.meta.url),'utf8');
  const from=kind==='observation_snapshot'?'selection_request':'selection_result';
  const replace=value=>JSON.parse(JSON.stringify(value).replaceAll(from,kind));
  const e=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>{
      const source=join(basis.scratch,`td26p5-${kind}.mjs`);
      let code=original.replaceAll(from,kind);
      if(kind==='next_action_projection') code=code.replaceAll("kind:'next_action_projection',schemaVersion:version,child:","kind:'next_action_projection',schemaVersion:version,disposition:'no_action',child:");
      await writeFile(source,code);
      return [await prepareRegisteredSelectionProduct({...basis,declarationFactory:gtl=>replace(declarations(gtl)),fixtureFiles:[{path:'build/index.js',source}]})];
    }});
  assert.equal(Object.hasOwn(e.additionalPublications[0].programs[0],'actionCatalog'),false);
  e.catalogView=e.product.narrowGraphFunctionCatalog(e.catalog,['root','A','B'].map(name=>ref('graph-function',name)));
  assert.equal(e.catalogView.kind,'graph_function_catalog_view');
  const publicApi=await import(pathToFileURL(join(e.installedRoot,'build/code/src/public/index.js')).href);
  const catalog=['A','B'].map(name=>{const entry=e.catalogView.entries.find(x=>x.definitionRef===ref('graph-function',name));
    return {name,graphFunctionRef:entry.definitionRef,definitionDigest:entry.definitionDigest};});
  const handoff=e.store.projectReopenAuthorityAndClose();
  const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:e.product.sha256Canonical(handoff)};
  const {call}=await constructInstalledStartCall({environment:e,publicApi,eventResource,identity:`td26p5-${kind}`,
    input:{kind:kind==='observation_snapshot'?kind:'selection_request',choice:'A',payload:'door',catalog}});
  const execution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:`td26p5-${kind}`,
    acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
  const receipt=execution.output.receipt;
  assert.ok(receipt,JSON.stringify(execution.output).slice(0,2000));
  assert.equal(receipt.failure,null,JSON.stringify(receipt.failure));
  const after=receipt.resources.eventResource.closeHandoff;
  const events=(await readFile(new URL(after.prefix.eventLogRef))).subarray(handoff.prefix.prefixLength).toString('utf8')
    .split('\n').filter(Boolean).map(line=>JSON.parse(line));
  if(kind==='next_action_projection') await assertPriorGap(e,publicApi,catalog,after);
  return {receipt,events,e};
}


// The existing exact-path prior-gap refusal remains identical on both builds.
async function assertPriorGap(e,publicApi,catalog,handoff) {
  const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:e.product.sha256Canonical(handoff)};
  const {call}=await constructInstalledStartCall({environment:e,publicApi,eventResource,identity:'td26p5-prior-gap',
    input:{kind:'selection_request',choice:'A',payload:'door',catalog,priorGap:{gapRef:'gap://td26p5/prior',gapDigest:e.product.sha256Canonical('prior')}}});
  const mod=path=>import(pathToFileURL(join(e.installedRoot,'build/code/src',path)).href);
  const eventOwner=await mod('abg/event_store.js'),truthOwner=await mod('abg/artifact_truth.js');
  const {constructExactOperationInvocationCoordinate}=await mod('shared/operation_definition_coordinate.js');
  const {ProductRunInvocationPort}=await mod('product/run_invocation_operation.js');
  const {admitExactInvocation}=await mod('abg/invocation_admission.js');
  const opened=eventOwner.reopenEventStore(handoff.reopenAuthority);
  assert.equal(opened.kind,'reopened_event_store_context');
  try {
    const artifactTruth=truthOwner.projectOwnedPrefixArtifactTruth(opened.prefix);
    const prepared=await ProductRunInvocationPort.prepare({memberKey:'start',invocation:call.invocation,
      resources:{catalog:call.resources.catalog,catalogView:call.resources.catalogView,applications:call.resources.applications,source:call.resources.source},
      admittedInstalls:e.admittedInstalls,workspaceBinding:e.workspaceBinding,
      verifyInstallAdmission:install=>e.abg.hasAdmittedProductInstall(artifactTruth,install),transportResourceAssertion:eventResource});
    assert.equal(prepared.kind,'prepared_product_run_invocation',JSON.stringify(prepared).slice(0,500));
    const basis={...constructExactOperationInvocationCoordinate({...call.invocation.definitionKey,definitionDigest:call.invocation.definitionDigest},
      call.invocation.invocationRef,call.invocation.requestDigest),authorityScopeRef:e.workspaceBinding.bindingId,
      authorityScopeDigest:e.workspaceBinding.bindingDigest,correlationId:call.invocation.correlationRef,eventTime:'2026-11-13T00:00:00.000Z',causationEventRefs:[]};
    const refused=admitExactInvocation(opened.store,{invocation:prepared.candidate,publicInvocation:prepared.invocation,rawInput:prepared.rawInput,
      programPublication:prepared.resolution.programPublication,executionResolution:prepared.resolution.resolution,program:prepared.resolution.program,
      graphFunction:prepared.resolution.graphFunction,programValidation:prepared.resolution.programValidation,workspaceBinding:e.workspaceBinding,
      artifactTruth,catalogView:e.catalogView,catalogApplications:[],policy:prepared.policy,capabilityGrants:prepared.grants,authority:prepared.authority},basis);
    assert.equal(refused.code,'authority_mismatch',JSON.stringify(refused));
    assert.equal(refused.message,process.env.ABI5_P5_TEST_TENANT
      ? 're-entry authority and prior gap must be admitted together' : 'gap re-entry is retired');
    assert.doesNotThrow(()=>eventOwner.assertHeldEventStoreAtDurablePrefix(opened.store,opened.prefix),'the prior-gap refusal appends nothing');
  } finally {opened.store.closeDurableLog();}
}

test('a permissive ordinary input contract carrying observation_snapshot reaches the Run owner and refuses at observation admission',async()=>{
  const {receipt,events}=await runDoor('observation_snapshot');
  assert.equal(receipt.ownerOutput.outcomeKind,'refusal',JSON.stringify(receipt.ownerOutput).slice(0,2000));
  assert.equal(receipt.ownerOutput.value.code,'invalid_input');
  assert.deepEqual(receipt.ownerOutput.value.issuePaths,['/observation']);
  for(const kind of ['invocation_admitted','basis_admitted','graph_call_opened','traversal_route_admitted','run_closed'])
    assert.equal(events.some(event=>event.kind===kind),false,`${kind} is not written`);
});

test('a successful leaf next_action_projection with no_action reaches HoG and refuses at the route owner',async()=>{
  const {receipt,events}=await runDoor('next_action_projection');
  assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput).slice(0,2000));
  assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed',JSON.stringify(receipt.ownerOutput).slice(0,2000));
  assert.ok(events.some(event=>event.kind==='c_call_result_admitted' && JSON.stringify(event.payload).includes('next_action_projection') && JSON.stringify(event.payload).includes('no_action')),'the successful retired leaf result was admitted before route refusal');
  assert.equal(events.some(event=>event.kind==='run_closed'),false);
  assert.ok(events.some(event=>event.kind==='runtime_failure_observed' && JSON.stringify(event.payload).includes('structural_step_missing')),'the existing route-owner refusal is recorded');
});
