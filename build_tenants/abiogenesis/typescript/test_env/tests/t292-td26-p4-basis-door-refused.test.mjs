import assert from 'node:assert/strict';
import test from 'node:test';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall} from '../support/registered-graph-selection.mjs';
import {declarations,ref,hash} from '../fixtures/registered-selection-product/index.mjs';

// The kept input-contract discriminator from P4. P6 retires the Program keys
// at raw admission, before execution-basis admission (see the P6 door cases).
const packageRoot=new URL('../..',import.meta.url).pathname;

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
