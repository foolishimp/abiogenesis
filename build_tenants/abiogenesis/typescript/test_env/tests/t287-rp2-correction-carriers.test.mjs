import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct,constructInstalledStartCall,constructInstalledRunReadCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {declarations,fixtureInput,ref} from '../fixtures/t287-selected-action-product/index.mjs';
const root=resolve(import.meta.dirname,'../..'),evidence=resolve(process.env.ABI5_RP2_CORRECTION_EVIDENCE_ROOT??join(root,'test_env/test_runs/rp2/correction-carriers'));
const save=async(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');
test('RP-2 actual child correction evidence drives archive-inspection and escalation stops without human response',async()=>{
  await mkdir(evidence,{recursive:true});
  const e=await setupInstalledRootCatalog({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareRegisteredSelectionProduct({...basis,declarationFactory:declarations,fixtureFiles:[
      {path:'build/index.js',source:new URL('../qualification/fixtures/rp2-correction-product.mjs',import.meta.url)},
      {path:'build/base.js',source:new URL('../fixtures/t287-selected-action-product/index.mjs',import.meta.url)}]})]});
  const {product}=e,publicApi=await import(pathToFileURL(join(e.installedRoot,'build/code/src/public/index.js')).href);
  const projectReadContracts=await import(pathToFileURL(join(e.installedRoot,'build/code/src/abg/project_read_operation_contracts.js')).href);
  e.catalogView=product.narrowGraphFunctionCatalog(e.catalog,[ref('graph-function','root'),ref('graph-function','child')]);
  let handoff=e.store.projectReopenAuthorityAndClose();
  await save('setup.json',{scratch:e.scratch,installedRoot:e.installedRoot,artifactPath:e.artifactPath,artifactDigest:await product.sha256File(e.artifactPath)});
  for(const correction of ['inspect_runtime_archive','escalate']){
    const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const {call}=await constructInstalledStartCall({environment:e,publicApi,eventResource:resource,identity:correction,
      rootMode:'supervised',declaredStartRef:ref('start','root'),inputFactory:({program,workspaceBinding})=>({...fixtureInput({program,workspaceBinding}),phase:1,
        task:{kind:'fixture_task',schemaVersion:'5.0.0',payload:'selected second action',correctionDisposition:correction}})});
    const result=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:correction,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
    await save(correction+'-receipt.json',result);
    const receipt=result.output.receipt;assert.equal(receipt.failure,null,JSON.stringify(receipt));
    const before=handoff.prefix.prefixLength;handoff=receipt.resources.eventResource.closeHandoff;
    const bytes=await readFile(new URL(handoff.prefix.eventLogRef)),events=bytes.subarray(before).toString().trim().split('\n').map(JSON.parse);
    await save(correction+'-events.json',events);
    // Public currently projects non-held typed stops as runtime_failed. The
    // exact ABG disposition, absence of failure, and unmet closure are checked below.
    assert.equal(receipt.ownerOutput.value.disposition,'runtime_failed');
    assert.equal(events.some(e=>e.kind==='runtime_failure_observed'),false);
    assert.equal(events.find(e=>e.kind==='run_stopped')?.payload.disposition,correction);
    const delta=events.find(e=>e.kind==='construction_delta_observed');assert.ok(delta,'actual admitted action fold');assert.equal(delta.payload.edgeClosureDecision.correctionDisposition,correction);
    assert.ok(events.some(e=>e.kind==='traversal_route_admitted'&&e.payload.nextActionProjection?.noActionDisposition===correction),'typed correction stop admitted');
    assert.equal(events.filter(e=>e.kind==='run_closed').length,0,'typed stop cannot close unmet outcome');
    assert.equal(events.some(e=>e.kind==='interaction_responded'),false,'no response-resume claim');
    const readResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    const {call:readCall}=constructInstalledRunReadCall({environment:e,publicApi,projectReadContracts,eventResource:readResource,source:receipt.resources.run,selector:{kind:'ordinal_page',fromOrdinal:0,limit:1024},memberKey:'run_replay',identity:correction+'-replay'});
    const replay=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:correction+'-replay',acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});
    await save(correction+'-replay.json',replay);assert.equal(replay.output.receipt.failure,null,JSON.stringify(replay));
    assert.equal(replay.output.receipt.ownerOutput.outcomeKind,'result');
    assert.equal(replay.output.receipt.ownerOutput.value.projection.status,'stopped');
    const after=replay.output.receipt.resources.eventResource.closeHandoff;assert.equal(after.prefix.prefixDigest,handoff.prefix.prefixDigest);handoff=after;
  }
  await save('handoff.json',handoff);await save('result.json',{status:'passed',behaviors:['inspect_runtime_archive','escalate'],humanResponse:'reserved 5.1; not exercised'});
});
