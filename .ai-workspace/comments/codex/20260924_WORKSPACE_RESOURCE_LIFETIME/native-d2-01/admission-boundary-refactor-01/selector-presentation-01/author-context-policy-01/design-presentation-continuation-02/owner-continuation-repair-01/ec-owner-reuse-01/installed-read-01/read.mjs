import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {installedFullSandboxApis} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/full-sandbox-support.mjs';
import {publicReadDefinition} from '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/setup-overhead-repair-01/installed-preparation-02/caller/test/generic-live-workflow-support.mjs';
const D=import.meta.dirname,C="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_COMPOSITE_READINESS/compiled-34",J="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/admission-boundary-refactor-01/selector-presentation-01/author-context-policy-01/design-presentation-continuation-02/owner-continuation-repair-01/revision-design-response-01/caller-preparation-01/suffix-01";
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),save=(n,v)=>fs.writeFileSync(join(D,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const started=performance.now(),selected=read(join(C,'selected-core.json'));
save('process-boundary.json',{kind:'preparation',startedUnixMs:Date.now(),pid:process.pid});
try{
 const {product,abg,installedPublic}=await installedFullSandboxApis(selected.packageRoot);
 const same=(a,b)=>product.sha256Canonical(a)===product.sha256Canonical(b);
 const memberMap=new Map(read(join(C,'archive-members.json')).map(r=>[r.path,r])),executingMembers=[];
 for(const rel of ['package.json','product-toolchain-manifest.json','build/code/src/public/installed_definition_call_transport.js','build/code/src/abg/event_calculus.js','build/code/src/abg/runtime_liveness.js']){
  const path=join(selected.packageRoot,rel),digest=await product.sha256File(path);assert.equal(digest,'sha256:'+memberMap.get(rel).sha256);executingMembers.push({path,digest});
 }
 const verificationPacket=read(join(C,'product-verification-request.json')),verificationStarted=performance.now();
 const verification=await product.ProductVerificationPort.verify(verificationPacket);
 save('verification-timing.json',{elapsedMs:performance.now()-verificationStarted,kind:verification.kind,memory:process.memoryUsage()});
 if(verification.kind!=='product_verification_success'){save('verification-refusal.json',verification);throw Error(verification.kind);}
 const verified=verification.verifiedArtifact;assert.strictEqual(product.selectOwnedProductVerification(verificationPacket.request,verified),verified);
 for(const key of ['artifactDigest','productContentDigest','manifestDigest'])assert.equal(verified[key],selected.basis[key]);
 const basis=read(join(J,'readback-basis.json')),original=read(join(J,'live-receipt.json')).receipt,baseline=read(join(J,'read-run_replay.json')).receipt;
 const closeHandoff=original.resources.eventResource.closeHandoff,prefix=closeHandoff.prefix,run=original.ownerOutput.value.run;
 assert.equal(run.ref,'run://abiogenesis/a6d993ab5e81dbc9ae08d5069f68ae1503224100fe537634a8658513aba55dbd');
 assert.equal(prefix.prefixLength,316064006);assert.equal(prefix.coordinateDigest,'sha256:158f2797ef17d8d84e1311b989db109966ecb367de10caeb786523e69e0997dd');
 const call=publicReadDefinition({product,abg,installedPublic,workspaceAuthorityBasis:basis.environment.workspaceAuthorityBasis,workspaceBinding:basis.environment.workspaceBinding,admittedInstalls:basis.environment.productInstalls,install:{verified}},{closeHandoff,receipt:original},'run_replay');
 const oldCall=read(join(J,'read-run_replay.jsonl')).invocation;
 const setupChecks={originalRequestUnchanged:same(call.invocation.request,oldCall.invocation.request),historicalAuthorityUnchanged:same(call.invocation.invocationAuthority,oldCall.invocation.invocationAuthority),resourceUnchanged:same(call.resources,oldCall.resources),currentReaderContent:call.invocation.contractCatalog.productContentDigest===selected.basis.productContentDigest,invocationChanged:call.invocation.invocationDigest!==oldCall.invocation.invocationDigest};
 save('constructor-checks.json',setupChecks);assert.ok(Object.values(setupChecks).every(Boolean),'current reader must preserve historical authority and request');
 const packet={kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call};save('request.json',packet);
 const stat=fs.statSync(fileURLToPath(prefix.eventLogRef)),before={device:stat.dev,inode:stat.ino,bytes:stat.size,mtimeMs:stat.mtimeMs};
 assert.equal(before.device,prefix.storeIdentity.device);assert.equal(before.inode,prefix.storeIdentity.inode);assert.equal(before.bytes,prefix.prefixLength);
 save('control.json',{core:selected,executingMembers,setupChecks,readPort:'installedPublic.runInstalledDefinitionCallTransport',requestDigest:product.sha256Canonical(packet),originalRequestPath:join(J,'read-run_replay.jsonl'),originalRun:run,genuineClose:prefix,historicalAuthority:call.invocation.invocationAuthority,readerCatalog:call.invocation.contractCatalog,journalBefore:before,setupElapsedMs:performance.now()-started,readCeilingMs:600000,defaultHeap:true,providerCalls:0});
 const readStarted=performance.now();console.log(JSON.stringify({boundary:'cold_replay_started',pid:process.pid,setupElapsedMs:readStarted-started,run:run.ref,close:prefix.coordinateDigest}));
 const outcome=await installedPublic.runInstalledDefinitionCallTransport(packet.acquisition,call);
 const readElapsedMs=performance.now()-readStarted;save('result.json',outcome);save('read-timing.json',{elapsedMs:readElapsedMs,exitCode:outcome.receipt?.exitCode??null,kind:outcome.kind,memory:process.memoryUsage(),resourceUsage:process.resourceUsage()});
 console.log(JSON.stringify({boundary:'cold_replay_returned',readElapsedMs,kind:outcome.kind,exitCode:outcome.receipt?.exitCode??null,ownerOutcome:outcome.receipt?.ownerOutput?.outcomeKind??null,refusal:outcome.receipt?.ownerOutput?.outcomeKind==='refusal'?outcome.receipt.ownerOutput.value:null}));
 const receipt=outcome.receipt,p=receipt?.ownerOutput?.value?.projection,prior=baseline.ownerOutput.value.projection;
 const st=fs.statSync(fileURLToPath(prefix.eventLogRef)),after={device:st.dev,inode:st.ino,bytes:st.size,mtimeMs:st.mtimeMs};
 const checks={normalTransport:outcome.kind==='installed_definition_call_transport_result',publicReplay:receipt?.exitCode===0&&receipt?.ownerOutput?.outcomeKind==='result',historicalClose:same(receipt?.resources?.eventResource?.closeHandoff?.prefix??null,prefix),physicalFileUnchanged:same(before,after),run:same(p?.subject??null,run),status:p?.status==='failed'&&p?.status===prior.status,terminalResult:p?.terminalResult===null&&prior.terminalResult===null,entireProjection:same(p??null,prior),entireSemanticPublicOutput:same(receipt?.ownerOutput??null,baseline.ownerOutput)};
 const comparison={checks,passed:Object.values(checks).every(Boolean),baselineResultPath:join(J,'read-run_replay.json'),baselineResultDigest:await product.sha256File(join(J,'read-run_replay.json')),freshResultDigest:await product.sha256File(join(D,'result.json')),baselineSemanticDigest:product.sha256Canonical(baseline.ownerOutput),freshSemanticDigest:product.sha256Canonical(receipt?.ownerOutput??null),journalAfter:after,readElapsedMs,baselineReadElapsedMs:read(join(J,'read-run_replay.boundary.json')).elapsedMs,currentReaderMetadata:{oldInvocationRef:baseline.invocationRef,newInvocationRef:receipt?.invocationRef??null,catalogReconstructed:true,historicalAuthorityUnchanged:setupChecks.historicalAuthorityUnchanged},timingLimit:'Separate observed calls, not a controlled benchmark or isolated EC timing. Baseline constructor/CLI window differs from same-lifetime timed Public transport; actual total process is separately retained.'};
 save('comparison.json',comparison);assert.ok(comparison.passed,'exact semantic replay comparison failed; see result.json and comparison.json');
 save('terminal-summary.json',{run,close:prefix,status:p.status,terminalResult:p.terminalResult,semanticDigest:comparison.freshSemanticDigest,wholeProjectionEqual:true,wholeSemanticPublicOutputEqual:true,readOnly:true});
 console.log(JSON.stringify({boundary:'closed_comparison_passed',readElapsedMs,semanticDigest:comparison.freshSemanticDigest,status:p.status}));
}catch(error){save('first-failure.json',{name:error?.name??null,message:String(error?.message??error),stack:String(error?.stack??'').slice(0,8192)});console.error(error?.stack??String(error));process.exitCode=1;}

