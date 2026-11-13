import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setupInstalledRootCatalog } from '../support/root-installed-environment.mjs';
import { prepareDeveloperMiniProduct } from '../support/developer-mini-product.mjs';
import { constructInstalledStartCall, constructInstalledRunReadCall, runInstalledCliRequest } from '../support/registered-graph-selection.mjs';
import { installedModules, publicCaller } from '../uat/public-setup.mjs';
import { startCall } from '../qualification/dispatch.mjs';
const root=resolve(import.meta.dirname,'../..');
const evidence=process.env.ABI5_RP2_BEHAVIOR_EVIDENCE_ROOT ?? join(root,'test_env/test_runs/rp2/behavior-carriers');
const save=async(name,value)=>writeFile(join(evidence,name),JSON.stringify(value,null,2)+'\n');
// Actual installed owner execution; the harness supplies Product declarations and
// inputs, never events, judgments or runtime closure. No external provider.
test('RP-2 declared ticket and asset starts, with actual admission, closure and fresh replay',async()=>{
  await mkdir(evidence,{recursive:true});
  const e=await setupInstalledRootCatalog({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async({scratch})=>{
      const prepared=await prepareDeveloperMiniProduct(root,scratch);
      prepared.loadInstalledPublication=async({installedRoot,verified})=>{
        const module=await import(pathToFileURL(join(installedRoot,'build/index.js')).href);
        return module.constructDeveloperMiniPublication({productId:verified.productId,artifactDigest:verified.artifactDigest,
          productContentDigest:verified.productContentDigest,productManifestDigest:verified.manifestDigest,
          packageName:verified.packageName,packageVersion:verified.packageVersion});
      };
      return [prepared];
    }});
  const {product,additionalProducts:[fixture]}=e, ids=fixture.ids;
  e.catalogView=product.narrowGraphFunctionCatalog(e.catalog,[ids.graphFunctionRef,ids.ticketGraphFunctionRef]);
  assert.equal(e.catalogView.kind,'graph_function_catalog_view');
  const load=p=>import(pathToFileURL(join(e.installedRoot,'build/code/src/'+p+'.js')).href);
  const publicApi=await load('public/index');
  const projectReadContracts=await load('abg/project_read_operation_contracts');
  const runtime=await installedModules(e.installedRoot);
  const caller=publicCaller({root:e.scratch,runtime,native:{verified:e.verified},command:()=>{throw Error('no provider dispatch');},record:async()=>{},config:{runId:'rp2-ticket'},actorRef:e.workspaceBinding.authorizedActorRef});
  caller.installedRoot=e.installedRoot;caller.state.binding={ref:e.workspaceBinding.bindingId,digest:e.workspaceBinding.bindingDigest};caller.state.resolvedLock=e.lock;caller.state.catalog=e.catalog;caller.state.catalogView=e.catalogView;
  let handoff=e.store.projectReopenAuthorityAndClose();
  await save('setup.json',{installedRoot:e.installedRoot,scratch:e.scratch,artifactPath:e.artifactPath,artifactDigest:await product.sha256File(e.artifactPath),ids});
  const cases=[{name:'ticket',programRef:ids.ticketProgramRef,declaredStartRef:ids.ticketStartRef,input:{kind:'developer_ticket_work_input',schemaVersion:'5.0.0',ticketRef:'ticket://rp2/one',requestedOutcome:'preserve the declared ticket outcome'}},
    {name:'asset',programRef:ids.programRef,input:{kind:'developer_greeting_input',schemaVersion:'5.0.0',name:'RP2'}}];
  for(const c of cases){
    const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
    caller.state.closeHandoff=handoff;
    const made=c.name==='ticket'
      ? await startCall(caller,{programRef:ids.ticketProgramRef,graphFunctionRef:ids.ticketGraphFunctionRef},c.input,{label:'ticket'})
      : await constructInstalledStartCall({environment:e,publicApi,eventResource,...c,identity:'rp2-'+c.name});
    let call=made.call;
    if(c.name==='asset'){
      const inv=call.invocation;
      const rebuild=target=>publicApi.constructInstalledPublicDefinitionCall({product,installedPublic:publicApi,
        definitionContractCoordinates:e.verified.definitionContractCoordinates,contractCatalog:inv.contractCatalog,...inv.definitionKey,
        request:{...inv.request,target},slots:inv.invocationAuthority.slots,resources:call.resources,
        requestRef:'public-request://rp2/asset',correlationRef:'correlation://rp2/asset',eventTime:'2026-10-30T00:00:00.000Z',provenanceRefs:['provenance://rp2/carrier']});
      const bad=rebuild({kind:'asset',handle:'missing-asset'});
      const refusal=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'rp2-missing-asset',acquisition:{kind:'reopen',closeHandoff:handoff},call:bad,expectedExitCode:null});
      await save('missing-asset.json',refusal);
      assert.equal(refusal.output.receipt.failure,null);
      assert.equal(refusal.output.receipt.ownerOutput.outcomeKind,'refusal');
      assert.equal(refusal.output.receipt.ownerOutput.value.code,'invalid_target','undeclared asset cannot start');
      if(refusal.output.receipt.resources?.eventResource?.closeHandoff)handoff=refusal.output.receipt.resources.eventResource.closeHandoff;
      call=rebuild({kind:'asset',handle:ids.greetingAssetHandle});
    }
    const outcome=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'rp2-'+c.name,acquisition:{kind:'reopen',closeHandoff:handoff},call,expectedExitCode:null});
    await save(c.name+'-receipt.json',outcome);
    const receipt=outcome.output.receipt;assert.ok(receipt);assert.equal(receipt.failure,null,JSON.stringify(receipt));
    const before=handoff.prefix.prefixLength;handoff=receipt.resources.eventResource.closeHandoff;
    const bytes=await readFile(new URL(handoff.prefix.eventLogRef)),events=bytes.subarray(before).toString().trim().split('\n').map(JSON.parse);
    await save(c.name+'-events.json',events);
    assert.equal(receipt.ownerOutput.value.disposition,'completed',JSON.stringify(receipt.ownerOutput));
    assert.equal(events.filter(x=>x.kind==='run_closed').length,1);
    assert.ok(events.some(x=>x.kind==='c_call_result_admitted'));
    if(c.name==='ticket')assert.deepEqual(receipt.ownerOutput.value.terminalResult.value,{kind:'developer_ticket_work_output',schemaVersion:'5.0.0',ticketRef:c.input.ticketRef,disposition:'completed',summary:'Completed: '+c.input.requestedOutcome});
    else assert.equal(receipt.ownerOutput.value.terminalResult.value.message,'Welcome RP2.');
    for(const memberKey of ['run_result','run_replay']){
      const resource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
      const {call:readCall}=constructInstalledRunReadCall({environment:e,publicApi,projectReadContracts,eventResource:resource,source:receipt.resources.run,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:1024},memberKey,identity:'rp2-'+c.name+'-'+memberKey});
      const cold=await runInstalledCliRequest({scratch:e.scratch,installedRoot:e.installedRoot,identity:'rp2-'+c.name+'-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:readCall,expectedExitCode:null});
      await save(c.name+'-'+memberKey+'.json',cold);assert.equal(cold.output.receipt.failure,null,JSON.stringify(cold));
      assert.equal(cold.output.receipt.ownerOutput.outcomeKind,'result');
      assert.equal(cold.output.receipt.ownerOutput.value.caseKey,memberKey);
      if(memberKey==='run_replay')assert.equal(cold.output.receipt.ownerOutput.value.projection.status,'closed');
      const after=cold.output.receipt.resources.eventResource.closeHandoff;assert.equal(after.prefix.prefixDigest,handoff.prefix.prefixDigest,'read cannot append runtime truth');handoff=after;
    }
  }
  await save('handoff.json',handoff);
  await save('result.json',{status:'passed',behaviors:['ticket_traversal','targeting_a_published_asset'],proof:'actual installed Public starts, ABG admitted results and closure, fresh process result/replay'});
});
