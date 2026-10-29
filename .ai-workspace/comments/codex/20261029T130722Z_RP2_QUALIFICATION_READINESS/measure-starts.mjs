// RP-2 bounded owner-path measurement over RP-1's immutable admitted setup and
// exact retained start input. This is not a new installed candidate or verdict.
// Usage: node --max-old-space-size=16384 measure-starts.mjs OWNER_ROOT INPUT OUTPUT
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { getHeapStatistics } from 'node:v8';
const tenant=resolve(fileURLToPath(new URL('../../../../build_tenants/abiogenesis/typescript/',import.meta.url)));
const { installedModules, publicCaller }=await import(join(tenant,'test_env/uat/public-setup.mjs'));
const { startCall, admitCall, PROGRAMS }=await import(join(tenant,'test_env/qualification/dispatch.mjs'));
const { eventResourceIdentity }=await import(join(tenant,'test_env/uat/runner.mjs'));
const [ownerRoot,inputPath,outPath]=process.argv.slice(2), read=async path=>JSON.parse(await readFile(path,'utf8'));
const saved=await read(inputPath), archive=saved.sourceArchive;
const setup=await read(join(archive,'setup-identity.json')), programs=await read(join(archive,'qualification-programs.json'));
const catalog=await read(join(archive,'resources/catalog.json')), acquisition=await read(join(archive,'abg-acquisition.json'));
const runtime=await installedModules(resolve(ownerRoot)), hash=runtime.product.sha256Canonical;
assert.equal(hash(saved.input),saved.inputDigest);
const verification=await runtime.product.ProductVerificationPort.verify({kind:'product_verification_packet',schemaVersion:'5.0.0',memberKey:'verify',targetKind:'packed_artifact',request:acquisition.request});
assert.equal(verification.kind,'product_verification_success');
const native={request:acquisition.request,verification,verified:verification.verifiedArtifact};
await mkdir(dirname(outPath),{recursive:true});
const caller=publicCaller({root:dirname(outPath),runtime,native,command:()=>{throw Error('no process dispatch authorized');},record:async()=>{},
  config:{runId:'rp2-measurement'},actorRef:setup.workspaceAuthority.authorizedActorRef});
caller.state.binding=setup.workspaceBinding;caller.state.closeHandoff=await read(join(archive,'final-close-handoff.json'));caller.state.resolvedLock=setup.resolvedLock;
caller.installedRoot=setup.installations[0].installedRoot;caller.refresh();caller.state.catalog=catalog;
caller.state.catalogView=runtime.product.narrowGraphFunctionCatalog(catalog,programs.allowlist);
assert.equal(hash(catalog),programs.catalogDigest);assert.equal(hash(caller.state.catalogView),programs.viewDigest);
const eventLog=fileURLToPath(caller.state.closeHandoff.prefix.eventLogRef),before=await eventResourceIdentity(eventLog);
const runs=[];
for(let n=0;n<2;n++){
  const uptimeBefore=execFileSync('/usr/bin/uptime').toString().trim(), memoryBefore=process.memoryUsage(),t0=performance.now();
  const start=await startCall(caller,PROGRAMS.assess,saved.input,{qualificationResources:saved.invoking,label:'rp2-'+n,cache:new Map()});
  const t1=performance.now(),admission=await admitCall(caller,start.call),t2=performance.now();
  assert.equal(start.inputAdmitted,true);assert.equal(admission.admitted,true,JSON.stringify({kind:admission.kind,code:admission.code,issuePaths:admission.issuePaths}));
  runs.push({run:n,cache:n===0?'cold':'warm',startCallMs:t1-t0,admitCallMs:t2-t1,totalMs:t2-t0,inputAdmitted:start.inputAdmitted,startAdmitted:admission.admitted,memoryBefore,memoryAfter:process.memoryUsage(),uptimeBefore,uptimeAfter:execFileSync('/usr/bin/uptime').toString().trim()});
}
const after=await eventResourceIdentity(eventLog);assert.deepEqual(after,before);
await writeFile(outPath,JSON.stringify({kind:'rp2_start_measurement',ownerRoot:resolve(ownerRoot),sourceArchive:archive,inputPath,inputDigest:saved.inputDigest,slotRef:saved.slotRef,
 plan:{ref:saved.input.plan.planRef,digest:saved.input.plan.planDigest},resourceDigest:hash(saved.invoking),heapLimitBytes:getHeapStatistics().heap_size_limit,node:process.version,
 ownerKind:resolve(ownerRoot)===tenant?'current source owner over RP-1 admitted context':'RP-1 installed owner',runs,eventLogUnchanged:true,providerCalls:0,qualification:false},null,2)+'\n');
console.log(JSON.stringify({outPath,runs:runs.map(r=>r.totalMs),eventLogUnchanged:true}));
