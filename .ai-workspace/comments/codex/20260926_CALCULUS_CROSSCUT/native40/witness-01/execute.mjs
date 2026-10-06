import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,basename} from 'node:path';
import {installedFullSandboxApis,fullSandboxSetupCalls} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
import {publicReadDefinition} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/generic-live-workflow-support.mjs';

const D=import.meta.dirname,P=join(D,'../preparation'),read=async p=>JSON.parse(await readFile(p,'utf8'));
const save=async(n,v)=>writeFile(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
for(const name of ['calls','receipts','timings'])await mkdir(join(D,name));
const selection=await read(join(P,'selection.json')),prepared=await read(join(P,'prepared.json'));
const current=await read(join(P,'readback-basis.json')),prior=await read(selection.producerReadbackBasis),producer=await read(selection.producerReceipt);
const core=await read(selection.coreSelection),{product,abg,installedPublic}=await installedFullSandboxApis(core.packageRoot);
const hash=product.sha256Canonical,coord=(ref,value={ref})=>({ref,digest:hash(value)}),schemaVersion='5.0.0';
assert.deepEqual(producer.receipt.ownerOutput.value.run,selection.sourceRun);
assert.deepEqual(producer.receipt.resources.eventResource.closeHandoff.prefix,selection.sourcePrefix);
const abiRequest={artifactPath:core.artifactPath,artifactRef:basename(core.artifactPath),
 ...Object.fromEntries(['ArtifactDigest','ProductContentDigest','ManifestDigest','ProductId','PackageName','PackageVersion'].map(k=>['expected'+k,core.basis[k[0].toLowerCase()+k.slice(1)]]))};
let started=performance.now();
const verification=await product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion,memberKey:'verify',targetKind:'packed_artifact',request:abiRequest});
await save('verification.json',{kind:verification.kind,elapsedMs:performance.now()-started,
 ...(verification.kind==='product_verification_success'?{coordinates:verification.coordinates}: {refusal:verification})});
assert.equal(verification.kind,'product_verification_success','complete refusal retained in verification.json');
const entryClose=prepared.successorCloseHandoff;
assert.deepEqual(entryClose.prefix,prepared.successorCloseHandoff.prefix);
const abiArtifact=verification.verifiedArtifact,calls=[],state={ordinal:2800,closeHandoff:entryClose,product,abg,installedPublic};
const setup=fullSandboxSetupCalls({scratch:D,abiArtifact,abiRequest,hash,coord,calls,state});
console.error(JSON.stringify({phase:'original_public_root_and_genuine_reprice',pid:process.pid,entryBytes:state.closeHandoff.prefix.prefixLength}));
try {
 // The current reader selects its own contracts; the source Run retains W0
 // read permissions and its original producer receipt. No private leaf facts.
 const readCall=publicReadDefinition({product,abg,installedPublic,
  workspaceAuthorityBasis:prior.environment.workspaceAuthorityBasis,
  workspaceBinding:prior.environment.workspaceBinding,
  admittedInstalls:prior.environment.productInstalls,install:{verified:abiArtifact}},
  {closeHandoff:state.closeHandoff,receipt:producer.receipt},'run_status');
 // Match the complete existing serialized read resource + transport route.
 // The read Definition owns its own genuine acquire/close; it has no borrowed
 // resource contract. This is a caller shape check, not semantic admission.
 assert.deepEqual(Object.keys(readCall.resources).sort(),['eventResource','kind','schemaVersion']);
 assert.equal(readCall.resources.kind,'abg_project_read_resource_assertion');
 assert.equal(readCall.resources.schemaVersion,schemaVersion);
 assert.equal(readCall.resources.eventResource.kind,'reopen_abg_event_resource');
 assert.deepEqual(readCall.resources.eventResource.closeHandoff,state.closeHandoff);
 assert.deepEqual(readCall.invocation.definitionKey,abg.ABG_PROJECT_READ_CONTRACTS.run_status.definitionKey);
 assert.deepEqual(readCall.invocation.request.projectionBasis,{projectionBasisRef:state.closeHandoff.prefix.eventLogRef,projectionBasisDigest:state.closeHandoff.prefix.coordinateDigest});
 assert.deepEqual(readCall.invocation.invocationAuthority.slots.workspace_binding,{ref:prior.environment.workspaceBinding.bindingId,digest:prior.environment.workspaceBinding.bindingDigest});
 await save('caller-check.json',{route:'serialized standalone Public read with genuine owner close, then separate witness acquisition',resourceKeys:['kind','schemaVersion','eventResource'],historicalReadBinding:readCall.invocation.invocationAuthority.slots.workspace_binding,request:readCall.invocation.request,producerRun:selection.sourceRun,privateLeafPackets:false,liveQueryReuse:'not implemented by this read owner; no borrowed read claimed'});
 await save('calls/00-original-public-run-status.json',readCall);
 started=performance.now();
 const readOutcome=await installedPublic.runInstalledDefinitionCallTransport({kind:'reopen',closeHandoff:state.closeHandoff},readCall);
 await save('timings/original-public-run-status.json',{elapsedMs:performance.now()-started});
 await save('receipts/00-original-public-run-status.json',readOutcome);
 assert.equal(readOutcome.kind,'installed_definition_call_transport_result','complete transport diagnostic retained');
 const status=readOutcome.receipt;
 assert.equal(status.ownerOutput?.outcomeKind,'result','complete read receipt retained');
 assert.equal(status.exitCode,0);
 assert.equal(status.resources.eventResource.acquisitionKind,'reopen');
 assert.deepEqual(status.resources.eventResource.closeHandoff.prefix,state.closeHandoff.prefix);
 state.closeHandoff=status.resources.eventResource.closeHandoff;
 calls.push({label:'original-public-run-status',definitionKey:readCall.invocation.definitionKey,invocationRef:readCall.invocation.invocationRef});
 console.error(JSON.stringify({phase:'original_public_root_read_completed',executionBasis:status.ownerOutput.value.projection.executionBasis}));
 await setup.acquire();
 assert.deepEqual(status.ownerOutput.value.source,selection.sourceRun);
 const root=status.ownerOutput.value.projection.executionBasis;
 assert.ok(root?.ref && root.digest,'ordinary Public root ExecutionBasis is required');
 const W0={ref:prior.environment.workspaceBinding.bindingId,digest:prior.environment.workspaceBinding.bindingDigest};
 const W1={ref:current.environment.workspaceBinding.bindingId,digest:current.environment.workspaceBinding.bindingDigest};
 assert.equal(prior.environment.workspaceAuthorityBasis.canonicalRoot,current.environment.workspaceAuthorityBasis.canonicalRoot);
 const contentContract=abg.WITNESS_CONTENT_CONTRACTS.reprice;
 const request={subjectKind:'authority_basis',subject:root,act:'reprice',
  content:{kind:'typed_payload',contentContract:{ref:contentContract.ref,digest:contentContract.digest},value:{
   declarationRef:W0.ref,beforeDigest:W0.digest,afterDigest:W1.digest,changeClass:'realization_refactor',
   owningTicketRef:'ticket://abiogenesis/T-287',reason:'Root-selected native-D2 correction preserves original job/source/oracle while repricing its historical binding to the current reviewed core40/dev16 installation.'}},
  context:{kind:'basis',basis:root},evidence:[W0,W1],provenance:[root]};
 started=performance.now();
 const witnessCall=await setup.authorized(abg.WITNESS_OPERATION_CONTRACTS.admit.reprice,request,
  {kind:'witness_reprice_resource_assertion',schemaVersion,eventResource:setup.reopen()},current.boundSlots);
 const witness=await setup.invoke(witnessCall,'original-root-binding-reprice');
 await save('timings/reprice-construction-and-admission.json',{elapsedMs:performance.now()-started});
 await save('result.json',{status:'PUBLIC_ROOT_AND_WITNESS_ADMITTED',sourceRun:selection.sourceRun,sourcePrefix:selection.sourcePrefix,
  reader:core.basis,root,W0,W1,statusInvocation:readCall.invocation.invocationRef,witnessInvocation:witnessCall.invocation.invocationRef,
  witness:witness.ownerOutput,successorPrefix:setup.prefix(),calls});
} catch(error) {
 await save('first-failure.json',{message:error.message,stack:error.stack,calls});throw error;
} finally {await setup.close();}
