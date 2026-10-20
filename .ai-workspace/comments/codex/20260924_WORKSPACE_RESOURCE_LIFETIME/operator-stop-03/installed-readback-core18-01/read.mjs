import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedFullSandboxApis} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/full-sandbox-support.mjs';
import {definitionCall} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/generic-live-workflow-support.mjs';

const D=import.meta.dirname, B='/Users/jim/src/apps/abiogenesis';
const L=join(B,'.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME');
const C=join(B,'.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-18');
const P=join(B,'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-19/operator-stop-02/execution-03');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const phase=v=>fs.writeFileSync(join(D,'active-operation.json'),JSON.stringify(v)+'\n');
const snapshot=p=>{const s=fs.statSync(p);return {device:s.dev,inode:s.ino,bytes:s.size,mtimeMs:s.mtimeMs};};
const started=performance.now(), metrics={reads:[]};
let current='preparation';
phase({label:current,startedAtMs:Date.now(),limitMs:600000});
try {
 const core=read(join(C,'selected-core.json'));
 assert.equal(core.basis.artifactDigest,'sha256:64093fb74a474c7e246333975c556c4cb34797326dbc81d1c5929455a69498bb');
 assert.equal(core.basis.productContentDigest,'sha256:ae0e2e5006bc08fd46eff798f71f8ce29bc5f03a31120f70f550d71319a4b64e');
 const {product,installedPublic}=await installedFullSandboxApis(core.packageRoot);
 const same=(a,b)=>product.sha256Canonical(a)===product.sha256Canonical(b);
 const selected=read(join(L,'operator-stop-02/installed/continuation-input.json'));
 const diagnosis=read(join(L,'operator-stop-03/diagnosis.json'));
 const preStop=read(join(P,'before-status.json'));
 const originalInput=read(join(P,'fresh-read-input.json'));
 const close=selected.genuineCloseHandoff;
 assert.equal(selected.status,'STOP_ADMITTED_READBACK_BLOCKED_DO_NOT_REPEAT_STOP');
 assert.deepEqual(selected.publicRun,diagnosis.retainedRun);
 assert.deepEqual(selected.executionBasis,diagnosis.retainedBasis);
 assert.deepEqual(originalInput.closeHandoff,close);
 assert.equal(await product.sha256File(selected.sourceReceipt.path),'sha256:'+selected.sourceReceipt.sha256);
 const last=read(selected.sourceReceipt.path);
 assert.deepEqual(last.receipt.resources.eventResource.closeHandoff,close);
 const journal=fileURLToPath(close.prefix.eventLogRef),before=snapshot(journal);
 assert.equal(before.device,close.prefix.storeIdentity.device);
 assert.equal(before.inode,close.prefix.storeIdentity.inode);
 assert.equal(before.bytes,close.prefix.prefixLength);
 const members=new Map(read(join(C,'archive-members.json')).map(row=>[row.path,row]));
 const executingMembers=[];
 for(const rel of ['package.json','product-toolchain-manifest.json','build/code/src/public/installed_definition_call_transport.js','build/code/src/abg/event_store.js','build/code/src/abg/event_calculus.js','build/code/src/abg/project_read_ports.js','build/code/src/abg/project_read_definition_bindings.js']) {
  const path=join(core.packageRoot,rel),digest=await product.sha256File(path);
  assert.equal(digest,'sha256:'+members.get(rel).sha256);executingMembers.push({path,digest});
 }
 const verificationPacket=read(join(C,'product-verification-request.json'));
 const verificationStarted=performance.now();
 const verification=await product.ProductVerificationPort.verify(verificationPacket);
 metrics.verificationMs=performance.now()-verificationStarted;
 save('verification.json',{kind:verification.kind,elapsedMs:metrics.verificationMs,memory:process.memoryUsage()});
 assert.equal(verification.kind,'product_verification_success');
 const verified=verification.verifiedArtifact;
 assert.strictEqual(product.selectOwnedProductVerification(verificationPacket.request,verified),verified);
 for(const key of ['artifactDigest','productContentDigest','manifestDigest'])assert.equal(verified[key],core.basis[key]);
 const calls=[],setupChecks=[];
 for(const [index,memberKey] of ['run_status','run_replay','run_result'].entries()) {
  const originalPath=join(P,'fresh-'+memberKey+'-request.json'),old=read(originalPath);
  assert.deepEqual(old.resources.eventResource.closeHandoff,close);
  assert.equal(old.invocation.request.source.sourceRef,selected.publicRun.ref);
  assert.equal(old.invocation.request.source.sourceDigest,selected.publicRun.digest);
  assert.deepEqual(old.invocation.invocationAuthority.slots.workspace_binding,selected.historicalWorkspaceBinding);
  const call=definitionCall({publicApi:installedPublic,product,verified,
   operationId:'abg.operation.project.read',memberKey,ordinal:201+index,
   request:old.invocation.request,slots:old.invocation.invocationAuthority.slots,resources:old.resources});
  const checks={requestUnchanged:same(call.invocation.request,old.invocation.request),
   authorityUnchanged:same(call.invocation.invocationAuthority,old.invocation.invocationAuthority),
   resourcesUnchanged:same(call.resources,old.resources),
   currentReaderContent:call.invocation.contractCatalog.productContentDigest===core.basis.productContentDigest,
   invocationChanged:call.invocation.invocationDigest!==old.invocation.invocationDigest};
  assert.ok(Object.values(checks).every(Boolean));
  const packet={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff:close},invocation:call};
  save(memberKey+'-request.json',packet);
  setupChecks.push({memberKey,checks,originalPath,originalDigest:await product.sha256File(originalPath),requestDigest:product.sha256Canonical(packet)});
  calls.push({memberKey,call,packet});
 }
 metrics.setupMs=performance.now()-started;
 const historicalReferences=[];
 for(const path of [join(L,'operator-stop-03/review-01/return.md'),join(L,'operator-stop-03/return.md'),join(L,'operator-stop-03/diagnosis.json'),join(L,'operator-stop-02/installed/return.md'),join(L,'operator-stop-02/installed/continuation-input.json'),join(P,'before-status.json'),selected.sourceReceipt.path])
  historicalReferences.push({path,digest:await product.sha256File(path)});
 const held=diagnosis.heldFluents.filter(f=>!f.ref.startsWith('run_active('));
 save('control.json',{core,executingMembers,setupChecks,historicalReferences,run:selected.publicRun,executionBasis:selected.executionBasis,
  genuineCloseHandoff:close,historicalAuthority:calls[0].call.invocation.invocationAuthority,readerCatalog:calls[0].call.invocation.contractCatalog,
  admittedStop:selected.admittedStop,actor:selected.actor,historicalCoreAtRun:originalInput.selection.coreAtRun,
  preStopStatus:preStop.projection.status,heldObligationFluents:held,journalBefore:before,setupMs:metrics.setupMs,
  readPort:'installedPublic.runInstalledDefinitionCallTransport; same Public entry as cli.js',
  resourceComposition:'Existing read schema accepts genuine reopen only; no supported acquired-resource read composition used.',
  readCeilingMs:600000,defaultHeap:true,providerCalls:0,newRuns:0,stops:0});
 const outcomes={},checksByMember=[];
 for(const {memberKey,call,packet} of calls) {
  current=memberKey;phase({label:memberKey,startedAtMs:Date.now(),limitMs:600000});
  console.log(JSON.stringify({boundary:'read_started',memberKey,pid:process.pid}));
  const begin=performance.now();
  const outcome=await installedPublic.runInstalledDefinitionCallTransport(packet.acquisition,call);
  const elapsedMs=performance.now()-begin;
  save(memberKey+'-result.json',outcome);
  const receipt=outcome.receipt;
  const cost={memberKey,elapsedMs,kind:outcome.kind,exitCode:receipt?.exitCode??null,memory:process.memoryUsage(),resourceUsage:process.resourceUsage()};
  metrics.reads.push(cost);save(memberKey+'-timing.json',cost);phase({label:memberKey,completed:true});
  console.log(JSON.stringify({boundary:'read_returned',memberKey,elapsedMs,exitCode:receipt?.exitCode??null,outcome:receipt?.ownerOutput?.outcomeKind??null}));
  const checks={transport:outcome.kind==='installed_definition_call_transport_result',noFailure:receipt?.failure===null,
   genuineClose:same(receipt?.resources?.eventResource?.closeHandoff??null,close),physicalUnchanged:same(snapshot(journal),before)};
  if(memberKey==='run_result') Object.assign(checks,{expectedRefusal:receipt?.exitCode===1&&receipt?.ownerOutput?.outcomeKind==='refusal',notFound:receipt?.ownerOutput?.value?.code==='not_found'});
  else {
   const value=receipt?.ownerOutput?.value,p=value?.projection;
   Object.assign(checks,{success:receipt?.exitCode===0&&receipt?.ownerOutput?.outcomeKind==='result',sameRun:same(value?.source??null,selected.publicRun),
    currentPrefix:same(value?.projectionBasis??null,{ref:close.prefix.eventLogRef,digest:close.prefix.coordinateDigest}),stopped:p?.status==='stopped'});
   if(memberKey==='run_status') Object.assign(checks,{sameExecutionBasis:same(p?.executionBasis??null,selected.executionBasis),
    inactive:!p?.activeFluents?.some(f=>f.ref==='run_active('+selected.publicRun.ref+')'),
    operatorStopped:p?.activeFluents?.some(f=>f.ref==='operator_run_stopped('+selected.publicRun.ref+')')===true,
    heldFluentsConserved:held.every(expected=>p?.activeFluents?.some(actual=>same(actual,expected)))});
   else checks.noTerminalResult=p?.terminalResult===null;
  }
  checksByMember.push({memberKey,checks});save(memberKey+'-comparison.json',{checks,passed:Object.values(checks).every(Boolean)});
  assert.ok(Object.values(checks).every(Boolean),'first readback mismatch; see '+memberKey+'-comparison.json');
  outcomes[memberKey]=receipt.ownerOutput;
 }
 save('readback.json',{status:'all_three_expected_Public_outcomes_observed',run:selected.publicRun,executionBasis:selected.executionBasis,
  genuineCloseHandoff:close,journalAfter:snapshot(journal),checksByMember,outcomes});
 console.log(JSON.stringify({boundary:'three_readbacks_closed',run:selected.publicRun.ref,close:close.prefix.coordinateDigest}));
} catch(error) {
 save('first-failure.json',{phase:current,name:error?.name??null,message:String(error?.message??error),stack:String(error?.stack??'').slice(0,8192)});
 console.error(error?.stack??String(error));process.exitCode=1;
} finally {
 phase({label:current,completed:true});metrics.totalMs=performance.now()-started;
 metrics.memory=process.memoryUsage();metrics.resourceUsage=process.resourceUsage();save('observed-metrics.json',metrics);
}
