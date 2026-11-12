import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,ref,hash} from '../fixtures/registered-selection-product/index.mjs';

// T-292 TD-26 P4: execution-basis admission refuses a Program that carries an
// ActionCatalog with its existing basis refusal, which Public reports as
// invalid_graph_function at /execution_basis. Publication validation, catalog
// admission, conformance and Product resolution still admit the Program, so the start
// reaches the Run owner and is refused there before any basis is admitted.
// An observation-snapshot input to a kept Program is refused by the Product's
// input contract. No refusal code is new.
const packageRoot=new URL('../..',import.meta.url).pathname;

/** The registered-selection publication with one valid ActionCatalog row on its Program. */
function withActionCatalog(gtl){
  const data=declarations(gtl),program=data.programs[0];
  const row={kind:'action_catalog_row',actionRef:ref('action','A'),actionKind:'invoke_graph_function',programRef:program.programRef,
    graphFunctionRef:ref('graph-function','A'),targetProgramLocusRef:ref('graph-function','A'),targetObligationRefs:[ref('obligation','A')],
    inputAssetRefs:[ref('asset','request')],outputAssetRefs:[ref('asset','result')],expectedDeltaRef:ref('delta','A'),
    progressConditionRef:ref('condition','progress'),stopConditionRef:ref('condition','stop')};
  const body={kind:'action_catalog',schemaVersion:'5.0.0',rows:[row]},catalogDigest=hash(body);
  return {...data,programs:[{...program,actionCatalog:{...body,catalogRef:`action-catalog://product/${catalogDigest.slice(7)}`,catalogDigest}}]};
}

async function setup(declarationFactory){
  const e=await setupInstalledRootCatalog({after:()=>{}},packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory})]});
  e.catalogView=e.product.narrowGraphFunctionCatalog(e.catalog,['root','A','B'].map(name=>ref('graph-function',name)));
  assert.equal(e.catalogView.kind,'graph_function_catalog_view');
  const publicApi=await import(pathToFileURL(join(e.installedRoot,'build/code/src/public/index.js')).href);
  const catalog=['A','B'].map(name=>{const entry=e.catalogView.entries.find(x=>x.definitionRef===ref('graph-function',name));
    return {name,graphFunctionRef:entry.definitionRef,definitionDigest:entry.definitionDigest};});
  const handoff=e.store.projectReopenAuthorityAndClose();
  const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:e.product.sha256Canonical(handoff)};
  return {e,publicApi,catalog,handoff,eventResource};
}

test('a start of a Program carrying an ActionCatalog is refused at execution-basis admission and opens nothing',async()=>{
  const {e,publicApi,catalog,handoff,eventResource}=await setup(withActionCatalog);
  const publication=e.additionalPublications[0];
  assert.equal(publication.programs[0].actionCatalog.rows.length,1,'publication validation and catalog admission keep the catalog');
  const conformanceOwner=await import(pathToFileURL(join(e.installedRoot,'build/code/src/validator/conformance_operation.js')).href);
  const conformance=conformanceOwner.evaluateGtlProgramConformance({kind:'conformance_evaluate_packet',schemaVersion:'5.0.0',
    memberKey:'gtl_program',program:publication.programs[0],publication});
  assert.equal(conformance.kind,'gtl_program_conformance_result',JSON.stringify(conformance).slice(0,2000));
  const {call,resolution}=await constructInstalledStartCall({environment:e,publicApi,eventResource,identity:'td26p4-door',
    input:{kind:'selection_request',choice:'A',payload:'door',catalog}});
  assert.equal(resolution.program.actionCatalog.rows.length,1,'Product resolution admits the Program');
  const execution=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'td26p4-door',
    acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
  const receipt=execution.output.receipt;
  assert.ok(receipt,JSON.stringify(execution.output).slice(0,2000));
  assert.equal(receipt.failure,null,JSON.stringify(receipt.failure));
  assert.equal(receipt.ownerOutput.outcomeKind,'refusal',JSON.stringify(receipt.ownerOutput).slice(0,2000));
  assert.equal(receipt.ownerOutput.value.code,'invalid_graph_function');
  assert.deepEqual(receipt.ownerOutput.value.issuePaths,['/execution_basis']);
  const after=receipt.resources.eventResource.closeHandoff;
  const kinds=(await readFile(new URL(after.prefix.eventLogRef))).subarray(handoff.prefix.prefixLength).toString('utf8')
    .split('\n').filter(Boolean).map(line=>JSON.parse(line).kind);
  for(const kind of ['basis_admitted','graph_call_opened','traversal_route_admitted','run_closed'])
    assert.equal(kinds.includes(kind),false,`${kind} is not written: ${kinds.join(',')}`);
});

test('an observation-snapshot input to a kept Program is refused by the Product input contract',async()=>{
  const {e,publicApi,eventResource}=await setup(declarations);
  assert.equal(Object.hasOwn(e.additionalPublications[0].programs[0],'actionCatalog'),false);
  const body={kind:'observation_snapshot',schemaVersion:'5.0.0',workspaceBinding:{workspaceBindingId:e.workspaceBinding.bindingId,
    workspaceBindingDigest:e.workspaceBinding.bindingDigest},actionCatalog:{kind:'action_catalog',schemaVersion:'5.0.0',rows:[]}};
  const snapshotDigest=hash(body);
  const input={...body,snapshotRef:`observation-snapshot://product/${snapshotDigest.slice(7)}`,snapshotDigest};
  await assert.rejects(constructInstalledStartCall({environment:e,publicApi,eventResource,identity:'td26p4-observation',input}),error=>{
    const refusal=JSON.parse(error.message);
    assert.equal(refusal.kind,'product_run_invocation_preparation_refusal',error.message.slice(0,2000));
    assert.equal(refusal.ownerOutput.value.code,'invalid_input');
    assert.deepEqual(refusal.ownerOutput.value.issuePaths,['/input']);
    return true;
  });
});
