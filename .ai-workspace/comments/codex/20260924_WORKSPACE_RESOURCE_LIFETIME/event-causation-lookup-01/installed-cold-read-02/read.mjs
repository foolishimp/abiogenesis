import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedFullSandboxApis} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/full-sandbox-support.mjs';
import {publicReadDefinition} from '/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/generic-live-workflow-support.mjs';
const D=import.meta.dirname,C='/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-18';
const O='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260924_HELLO_PROJECT_BASELINE/fresh-native-01/opus-successor-04',J=join(O,'caller/jobs/basic-cli');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const started=performance.now(),selected=read(join(C,'selected-core.json')),metrics=read(join(O,'observed-metrics.json'));
const {product,abg,installedPublic}=await installedFullSandboxApis(selected.packageRoot);
const same=(a,b)=>product.sha256Canonical(a)===product.sha256Canonical(b);
const phase={kind:'preparation',startedUnixMs:Date.now(),pid:process.pid};
save('process-boundary.json',phase);
try {
 const memberMap=new Map(read(join(C,'archive-members.json')).map(r=>[r.path,r]));
 const executingMembers=[];
 for(const rel of ['package.json','product-toolchain-manifest.json','build/code/src/public/installed_definition_call_transport.js','build/code/src/abg/event_store.js']){
  const path=join(selected.packageRoot,rel),digest=await product.sha256File(path);assert.equal(digest,'sha256:'+memberMap.get(rel).sha256);executingMembers.push({path,digest});
 }
 const verificationPacket=read(join(C,'product-verification-request.json')),verificationStarted=performance.now();
 const verification=await product.ProductVerificationPort.verify(verificationPacket);
 save('verification-timing.json',{elapsedMs:performance.now()-verificationStarted,kind:verification.kind,memory:process.memoryUsage()});
 assert.equal(verification.kind,'product_verification_success','actual installed Product verification must succeed');
 const verified=verification.verifiedArtifact;assert.strictEqual(product.selectOwnedProductVerification(verificationPacket.request,verified),verified);
 for(const key of ['artifactDigest','productContentDigest','manifestDigest'])assert.equal(verified[key],selected.basis[key]);
 let basis=read(join(J,'readback-basis.json')),original=read(join(J,'live-receipt.json')).receipt;
 const closeHandoff=original.resources.eventResource.closeHandoff;
 assert.ok(same(closeHandoff.prefix,metrics.close));
 const call=publicReadDefinition({product,abg,installedPublic,workspaceAuthorityBasis:basis.environment.workspaceAuthorityBasis,
  workspaceBinding:basis.environment.workspaceBinding,admittedInstalls:basis.environment.productInstalls,install:{verified}},
  {closeHandoff,receipt:original},'run_result');
 const oldCall=read(join(J,'read-run_result.jsonl')).invocation;
 const setupChecks={originalRequestUnchanged:same(call.invocation.request,oldCall.invocation.request),
 historicalAuthorityUnchanged:same(call.invocation.invocationAuthority,oldCall.invocation.invocationAuthority),
 resourceUnchanged:same(call.resources,oldCall.resources),currentReaderContent:call.invocation.contractCatalog.productContentDigest===selected.basis.productContentDigest,
 invocationChanged:call.invocation.invocationDigest!==oldCall.invocation.invocationDigest};
 assert.ok(Object.values(setupChecks).every(Boolean),'caller correction must preserve historical authority and request');
 const packet={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call};save('request.json',packet);
 const stat=fs.statSync(fileURLToPath(metrics.close.eventLogRef)),before={device:stat.dev,inode:stat.ino,bytes:stat.size,mtimeMs:stat.mtimeMs};
 assert.equal(before.device,metrics.close.storeIdentity.device);assert.equal(before.inode,metrics.close.storeIdentity.inode);assert.equal(before.bytes,metrics.close.prefixLength);
 save('control.json',{core:selected,executingMembers,setupChecks,readPort:'installedPublic.runInstalledDefinitionCallTransport (same exported Public entry used by cli.js)',
 requestDigest:product.sha256Canonical(packet),originalRequestPath:join(J,'read-run_result.jsonl'),originalRun:metrics.run,originalResult:metrics.result,genuineClose:metrics.close,
 historicalAuthority:call.invocation.invocationAuthority,readerCatalog:call.invocation.contractCatalog,originalResiduals:metrics.remainingGaps,journalBefore:before,
 setupElapsedMs:performance.now()-started,readCeilingMs:600000,defaultHeap:true,providerCalls:0});
 basis=null;original=null;
 const readStarted=performance.now();console.log(JSON.stringify({boundary:'cold_read_started',pid:process.pid,setupElapsedMs:readStarted-started,run:metrics.run.ref,close:metrics.close.coordinateDigest}));
 const outcome=await installedPublic.runInstalledDefinitionCallTransport(packet.acquisition,call);
 const readElapsedMs=performance.now()-readStarted;save('result.json',outcome);save('read-timing.json',{elapsedMs:readElapsedMs,exitCode:outcome.receipt?.exitCode??null,kind:outcome.kind,memory:process.memoryUsage(),resourceUsage:process.resourceUsage()});
 console.log(JSON.stringify({boundary:'cold_read_returned',readElapsedMs,kind:outcome.kind,exitCode:outcome.receipt?.exitCode??null,ownerOutcome:outcome.receipt?.ownerOutput?.outcomeKind??null,refusal:outcome.receipt?.ownerOutput?.outcomeKind==='refusal'?outcome.receipt.ownerOutput.value:null}));
 const old=read(join(J,'read-run_result.json')).receipt,receipt=outcome.receipt,p=receipt?.ownerOutput?.value?.projection,prior=old.ownerOutput.value.projection;
 const afterStat=fs.statSync(fileURLToPath(metrics.close.eventLogRef)),after={device:afterStat.dev,inode:afterStat.ino,bytes:afterStat.size,mtimeMs:afterStat.mtimeMs};
 const checks={normalTransport:outcome.kind==='installed_definition_call_transport_result',publicResult:receipt?.exitCode===0&&receipt?.ownerOutput?.outcomeKind==='result',
 historicalClose:same(receipt?.resources?.eventResource?.closeHandoff?.prefix??null,metrics.close),physicalFileUnchanged:same(before,after)};
 if(p?.terminalResult){
  const t=p.terminalResult;
  Object.assign(checks,{run:same(p.subject,metrics.run),result:same(p.result,metrics.result),producer:same(t.producer,prior.terminalResult.producer),
   projectionBasis:same(t.projectionBasis,prior.terminalResult.projectionBasis),terminalRoute:same(p.terminalRoute,prior.terminalRoute),contract:same(t.contract,prior.terminalResult.contract),
   typedValue:product.isSemanticJobEnvelope(t.value)&&product.sha256Canonical(t.value)===t.valueDigest&&t.valueDigest===prior.terminalResult.valueDigest,
   entireProjection:same(p,prior),historicalSource:same(t.value.job,prior.terminalResult.value.job)&&same(t.value.basis,prior.terminalResult.value.basis),
   coverage:t.value.applicationCoverage==='non_closing'&&t.value.applicationCoverage===prior.terminalResult.value.applicationCoverage});
  save('terminal-summary.json',{run:p.subject,result:p.result,producer:t.producer,valueDigest:t.valueDigest,valueKind:t.valueKind,terminalRoute:p.terminalRoute,
   projectionBasis:t.projectionBasis,sourceBasis:t.value.basis,applicationCoverage:t.value.applicationCoverage,remainingGapsPreserved:metrics.remainingGaps,
   assessments:t.value.assets.map(a=>({stageRef:a.stageRef,disposition:a.assessment?.disposition??null})),status:'successful terminal Public Result; no separate status or replay invocation'});
 }
 save('comparison.json',{checks,passed:Object.values(checks).every(Boolean),baselineResultPath:join(J,'read-run_result.json'),baselineResultDigest:await product.sha256File(join(J,'read-run_result.json')),
  freshResultDigest:await product.sha256File(join(D,'result.json')),journalAfter:after,readElapsedMs,baselineReadElapsedMs:metrics.readback.publicReads[0].elapsedMs,
  timingLimit:'Separate observed calls, not a controlled benchmark or isolated decoder timing. Setup/verification is excluded from measured Public call duration.'});
 assert.ok(Object.values(checks).every(Boolean),'exact result comparison failed; see result.json and comparison.json');
 console.log(JSON.stringify({boundary:'closed_comparison_passed',readElapsedMs,valueDigest:p.terminalResult.valueDigest}));
} catch(error) {
 save('first-failure.json',{name:error?.name??null,message:String(error?.message??error),stack:String(error?.stack??'').slice(0,8192)});console.error(error?.stack??String(error));process.exitCode=1;
}
