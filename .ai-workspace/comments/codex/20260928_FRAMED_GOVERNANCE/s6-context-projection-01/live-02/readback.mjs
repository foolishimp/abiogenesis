import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),base=dirname(here),read=async p=>JSON.parse(await readFile(p,'utf8')),save=(n,v)=>writeFile(join(here,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
export async function readback(){
 const setup=await read(join(base,'setup.json')),execution=await read(join(here,'execution.json')),handoff=await read(join(here,'handoff.json')),start=await read(join(base,'start-prepared.json')),readiness=await read(join(here,'launch-readiness.json'));
 const load=p=>import(pathToFileURL(join(setup.installedRoots[0],'build/code/src',p+'.js')).href),[product,publicApi,projectReadContracts,store]=await Promise.all(['product/index','public/index','abg/project_read_operation_contracts','abg/event_store'].map(load));
 const helper=await import(pathToFileURL(readiness.helper.path).href),catalog=start.call.resources.catalog.readinessBasis,events=store.readRuntimeEventsAtDurablePrefix(handoff.prefix);
 const environment={product,workspaceBinding:catalog.workspaceBinding,admittedInstalls:catalog.installedProducts,verified:catalog.verifiedProducts.find(p=>p.productId===product.ABI5_PRODUCT_ID),workspaceAuthority:events.find(e=>e.payload.workspaceAuthorityBasis)?.payload.workspaceAuthorityBasis};assert.ok(environment.workspaceAuthority&&environment.verified);
 const source=execution.output.receipt.resources.run;assert.ok(typeof source.ref==='string'&&typeof source.digest==='string');const timings=[];
 for(const memberKey of ['run_result','run_replay']){
  const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)},call=helper.constructInstalledRunReadCall({environment,publicApi,projectReadContracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source,eventResource,identity:'s6-live-02-'+memberKey});
  const result=await helper.runInstalledCliRequest({scratch:here,installedRoot:setup.installedRoots[0],identity:'s6-live-02-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:null,environment:{}});await save('read-'+memberKey+'.json',result);
  timings.push({memberKey,wallMs:result.wallMs,requestBytes:(await readFile(result.requestPath)).length,source,outcomeKind:result.output.receipt?.ownerOutput?.outcomeKind??null});
 }
 await save('readback-timing.json',timings);
 for(const {memberKey}of timings){const result=await read(join(here,'read-'+memberKey+'.json')),receipt=result.output.receipt;assert.deepEqual(receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput));assert.deepEqual(receipt.ownerOutput.value.projection.terminalResult,execution.output.receipt.ownerOutput.value.terminalResult);assert.deepEqual(receipt.ownerOutput.value.projection.replay,execution.output.receipt.resources.replay);}
 return timings;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])await readback();
