import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve('.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-implementation/framed-synthesis'),dir=resolve(root,'attempt-02');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const setup=await read(resolve(dir,'setup.json')),execution=await read(resolve(dir,'execution.json')),request=await read(execution.requestPath),handoff=await read(resolve(dir,'handoff.json'));
const load=p=>import(pathToFileURL(resolve(setup.installedRoots[0],'build/code/src',p+'.js')).href);
const [product,publicApi,contracts,store]=await Promise.all(['product/index','public/index','abg/project_read_operation_contracts','abg/event_store'].map(load));
const helper=await import(pathToFileURL(resolve('build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs')).href);
const readiness=request.invocation.resources.catalog.readinessBasis,events=store.readRuntimeEventsAtDurablePrefix(handoff.prefix);
const environment={product,workspaceBinding:readiness.workspaceBinding,admittedInstalls:readiness.installedProducts,verified:readiness.verifiedProducts.find(p=>p.productId===product.ABI5_PRODUCT_ID),workspaceAuthority:events.find(e=>e.payload.workspaceAuthorityBasis)?.payload.workspaceAuthorityBasis};
assert.ok(environment.workspaceAuthority&&environment.verified);
const result=[];
for(const memberKey of ['run_result','run_replay']){
 const eventResource={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:product.sha256Canonical(handoff)};
 const call=helper.constructInstalledRunReadCall({environment,publicApi,projectReadContracts:contracts,memberKey,selector:memberKey==='run_result'?{kind:'none'}:{kind:'ordinal_page',fromOrdinal:0,limit:2048},source:{ref:events.find(e=>e.kind==='run_segment_opened').runId,digest:events.find(e=>e.kind==='run_segment_opened').payload.runDigest},eventResource,identity:'framed-synthesis-paid-failure-'+memberKey});
 const receipt=await helper.runInstalledCliRequest({scratch:setup.scratch,installedRoot:setup.installedRoots[0],identity:'framed-synthesis-paid-failure-'+memberKey,acquisition:{kind:'reopen',closeHandoff:handoff},call:call.call,expectedExitCode:null});
 await writeFile(resolve(root,'attempt-02-read-'+memberKey+'.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 assert.deepEqual(receipt.output.receipt.resources.eventResource.closeHandoff.prefix,handoff.prefix);
 result.push({memberKey,wallMs:receipt.wallMs,requestBytes:(await readFile(receipt.requestPath)).length,outcomeKind:receipt.output.receipt.ownerOutput.outcomeKind,projectionKeys:Object.keys(receipt.output.receipt.ownerOutput.value.projection??{}),ownerValue:receipt.output.receipt.ownerOutput.outcomeKind==='refusal'?receipt.output.receipt.ownerOutput.value:null});
}
await writeFile(resolve(root,'attempt-02-readback.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result);
