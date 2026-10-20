import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import * as store from '../../build/code/src/abg/event_store.js';
import * as abg from '../../build/code/src/abg/index.js';
import {abgEventLocatorDigest} from '../../build/code/src/abg/definition_event_resource.js';
import { sha256Bytes, sha256Canonical as hash } from '../../build/code/src/product/index.js';
const root=resolve(import.meta.dirname,'../..');
function interrupted(t,{lostReceipt=false}={}){
 const scratch=fs.mkdtempSync(join(tmpdir(),'abg-recovery-')),path=join(scratch,'events.jsonl');
 const script=`import * as s from ${JSON.stringify(pathToFileURL(join(root,'build/code/src/abg/event_store.js')).href)};
 import {sha256Canonical as h} from ${JSON.stringify(pathToFileURL(join(root,'build/code/src/product/index.js')).href)};
 const a=s.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:process.argv[1]});
 const event=n=>({kind:'basis_admitted',eventTime:'2026-09-22T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://recovery-test',
 parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://recovery-test',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://recovery-test',
 payload:{basisClass:'root',basisRef:'basis://'+n,basisDigest:h(n),rawInputValue:{selected:'unchanged input '.repeat(200)}}});
 s.admitRuntimeEvent(a.store,event(1));const handoff=a.store.projectReopenAuthorityAndClose();
 const next=s.reopenEventStore(handoff.reopenAuthority);s.admitRuntimeEvent(next.store,event(2));s.admitRuntimeEvent(next.store,event(3));
 ${lostReceipt ? 'const actualClose=next.store.projectReopenAuthorityAndClose();process.stdout.write(JSON.stringify({handoff,pid:process.pid}));' : "process.stdout.write(JSON.stringify({handoff,pid:process.pid}),()=>process.kill(process.pid,'SIGKILL'));"}
 `;
 const child=spawnSync(process.execPath,['--input-type=module','-e',script,path],{encoding:'utf8'});
 assert.equal(lostReceipt?child.status:child.signal,lostReceipt?0:'SIGKILL',child.stderr);const {handoff,pid}=JSON.parse(child.stdout);
 const stat=fs.statSync(path),lockPath=join(tmpdir(),'abiogenesis-event-store-locks-v5',`${stat.dev}-${stat.ino}.lock`);
 const lock=lostReceipt?null:fs.statSync(lockPath),bytes=fs.readFileSync(path),lockBytes=lostReceipt?null:fs.readFileSync(lockPath);
 if(lostReceipt)assert(!fs.existsSync(lockPath));
 const selection={lastCloseHandoff:handoff,expectedCurrent:{byteLength:bytes.length,digest:sha256Bytes(bytes)},
  ...(lostReceipt?{recoveryCase:'lock_absent',lockPath}:{abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:sha256Bytes(lockBytes)}}),ownerPid:pid};
 t.after(()=>{if(fs.existsSync(lockPath))fs.unlinkSync(lockPath);fs.rmSync(scratch,{recursive:true,force:true});});
 return {selection,path,bytes,lockBytes,lockPath};
}
function intact(f){assert.deepEqual(fs.readFileSync(f.path),f.bytes);assert.deepEqual(fs.readFileSync(f.lockPath),f.lockBytes);}
function patchFs(patches,call){const before={};for(const [k,v]of Object.entries(patches)){before[k]=fs[k];fs[k]=v;}syncBuiltinESMExports();
 try{return call();}finally{for(const[k,v]of Object.entries(before))fs[k]=v;syncBuiltinESMExports();}}

// Existing immutable-artifact verification is a supplied lower-owner premise here.
// The wrapper's exact approval, executing-manifest/export and physical recovery
// joins are real; packaging and installed Product verification remain separate.
async function resourceOwner(){
 const file=join(root,'build/code/src/abg/definition_event_resource.js');let verification;
 const module=new SourceTextModule(fs.readFileSync(file,'utf8'),{identifier:file,initializeImportMeta:m=>{m.url=pathToFileURL(file).href;}});
 await module.link(async spec=>{
  const actual=await import(spec.startsWith('node:')||spec==='valibot'?spec:pathToFileURL(resolve(dirname(file),spec)).href);
  const values={...actual,...(spec==='../product/verify_product.js'?{
   isVerifiedProductArtifact:v=>v?.kind==='verified_product_artifact',verifyProduct:async()=>verification}:{} )};
  return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});
 });await module.evaluate();
 const manifest=JSON.parse(fs.readFileSync(join(root,'product-toolchain-manifest.json'),'utf8'));
 const pkg=JSON.parse(fs.readFileSync(join(root,'package.json'),'utf8'));
 verification={kind:'verified_product_artifact',artifactRef:'artifact://component/supplied',artifactDigest:hash('artifact'),manifestDigest:hash(manifest),
  packageName:pkg.name,packageVersion:pkg.version};
 const artifact={request:{artifactPath:join(root,'component-supplied-not-opened.tgz'),artifactRef:verification.artifactRef,
  expectedArtifactDigest:verification.artifactDigest,expectedProductContentDigest:manifest.productContentDigest,expectedManifestDigest:verification.manifestDigest,
  expectedProductId:manifest.productId,expectedPackageName:pkg.name,expectedPackageVersion:pkg.version},verified:verification};
 const owner=module.namespace;
 const request=s=>({kind:'abg_interrupted_event_resource_recovery',schemaVersion:'5.0.0',
  ...('lastCloseHandoff'in s?{lastCloseHandoff:s.lastCloseHandoff}:{initialOrigin:{newResourceRequest:{kind:'new_abg_event_resource',schemaVersion:'5.0.0',eventLogPath:s.initialOrigin.newResourceRequest.eventLogPath,locatorDigest:abgEventLocatorDigest(s.initialOrigin.newResourceRequest.eventLogPath)},device:s.initialOrigin.device,inode:s.initialOrigin.inode,evidence:{ref:'evidence://original-request-and-caller',digest:hash('selected genuine original request/caller')}}}),
  expectedCurrent:s.expectedCurrent,...('abandonedLock'in s?{abandonedLock:s.abandonedLock}:{recoveryCase:s.recoveryCase,lockPath:s.lockPath}),interruption:{ownerPid:s.ownerPid,evidence:{ref:'evidence://interruption',digest:hash('interruption')},
   quiescenceEvidence:{ref:'evidence://operator-quiescence',digest:hash('quiescence')},exclusiveMaintenance:true},ownerArtifact:artifact});
 const approve=r=>{const actorRef='actor://trusted-test',value={actorRef,authorityMode:'trusted_developer'},approval={decision:'allow',actorRef,
  definitionRef:owner.ABG_EVENT_RESOURCE_RECOVERY.definitionRef,definitionDigest:owner.ABG_EVENT_RESOURCE_RECOVERY_DIGEST,
  requestDigest:hash(r),scopeDigest:owner.abgEventRecoveryScope(r).digest};
  return {kind:'resolved_admission_authority',schemaVersion:'5.0.0',actorRef,authorityMode:'trusted_developer',authority:{ref:'authority://test',digest:hash(value),value},
   approval:{ref:'approval://test',digest:hash(approval),value:approval}};};
 return {owner,request,approve,setVerification:v=>{verification=v;},artifact};
}

test('genuinely interrupted owner recovers once, keeps lock through validation and yields ordinary exact reopen',async t=>{
 const f=interrupted(t),r=await resourceOwner(),request=r.request(f.selection);assert.equal(typeof abg.recoverInterruptedAbgEventResource,'function');
 const originalRead=fs.readSync;let logReads=0,readBytes=0;
 // Awaited wrapper verification precedes physical recovery; sync instrumentation
 // remains scoped to this one serial test and is restored before test completion.
 const before=fs.readSync;fs.readSync=(fd,...args)=>{if(fs.fstatSync(fd).ino===f.selection.lastCloseHandoff.reopenAuthority.inode){
  logReads++;assert(fs.existsSync(f.lockPath));assert.equal(store.reopenEventStore(f.selection.lastCloseHandoff.reopenAuthority).kind,'event_store_reopen_refusal');
  const n=originalRead(fd,...args);readBytes+=n;return n;}return originalRead(fd,...args);};syncBuiltinESMExports();
 let result;const start=performance.now();try{result=await r.owner.recoverInterruptedAbgEventResource(request,r.approve(request));}
 finally{fs.readSync=before;syncBuiltinESMExports();}
 assert.equal(result.kind,'abg_event_resource_recovery_receipt');assert.equal(result.outcome.kind,'recovered',JSON.stringify(result));
 assert.equal(logReads,1);assert.equal(readBytes,f.bytes.length);assert.equal(result.outcome.validatedEventCount,3);
 assert(!fs.existsSync(f.lockPath));assert.deepEqual(fs.readFileSync(f.path),f.bytes);
 assert.equal(fs.statSync(f.path).ino,f.selection.lastCloseHandoff.reopenAuthority.inode);
 assert.equal(store.reopenEventStore(f.selection.lastCloseHandoff.reopenAuthority).kind,'event_store_reopen_refusal','old handoff stays stale');
 const reopened=store.reopenEventStore(result.outcome.closeHandoff.reopenAuthority);assert.equal(reopened.kind,'reopened_event_store_context');
 assert.equal(reopened.historicalEventCount,3);assert.deepEqual(reopened.store.projectReopenAuthorityAndClose(),result.outcome.closeHandoff);
 t.diagnostic(JSON.stringify({logReads,readBytes,elapsedMs:performance.now()-start,events:3,limit:'Product verifier supplied; actual physical owner, closed approval/manifest/export joins and ordinary reopen.'}));
});

test('selection, approval, owner and history mismatches leave the abandoned resource unchanged',async t=>{
 const f=interrupted(t),r=await resourceOwner(),request=r.request(f.selection),approval=r.approve(request);
 for(const [name,mutate]of [
  ['extent',s=>{s.expectedCurrent.byteLength++;}],['digest',s=>{s.expectedCurrent.digest=hash('wrong');}],
  ['inode',s=>{s.abandonedLock.inode++;}],['lock bytes',s=>{s.abandonedLock.bytesBase64=Buffer.from('other').toString('base64');}],
  ['namespace',s=>{s.abandonedLock.path+='.foreign';}],['live PID',s=>{s.ownerPid=process.pid;}],
 ]){const s=structuredClone(f.selection);mutate(s);assert.equal(store.recoverInterruptedEventStore(s).kind,'refused_no_recovery',name);intact(f);}
 for(const kind of ['old prefix','old profile']){
  const s=structuredClone(f.selection),a=s.lastCloseHandoff.reopenAuthority,p=s.lastCloseHandoff.prefix;
  if(kind==='old prefix'){a.eventLogDigest=hash('wrong historical prefix');p.prefixDigest=a.eventLogDigest;}
  else{a.eventContractDigest=store.LEGACY_ROOT_EVENT_CONTRACT_DIGEST;p.storeIdentity.eventContractDigest=a.eventContractDigest;}
  const {authorityDigest,...ab}=a;a.authorityDigest=hash(ab);const{coordinateDigest,...pb}=p;p.coordinateDigest=hash(pb);
  assert.equal(store.validateEventStoreCloseHandoff(s.lastCloseHandoff),true);
  assert.equal(store.recoverInterruptedEventStore(s).kind,'refused_no_recovery',kind);intact(f);
 }
 const wrong=structuredClone(request);wrong.expectedCurrent.digest=hash('crossed');
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(wrong,approval)).code,'approval_mismatch');
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(request,null)).code,'approval_mismatch');
 const nonexclusive=structuredClone(request);nonexclusive.interruption.exclusiveMaintenance=false;
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(nonexclusive,approval)).code,'invalid_request');
 r.setVerification({...r.artifact.verified,manifestDigest:hash('foreign owner')});
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(request,approval)).code,'installed_owner_mismatch');intact(f);
 const kill=process.kill;try{process.kill=()=>{throw Object.assign(new Error('unknown process status'),{code:'EPERM'});};
  assert.equal(store.recoverInterruptedEventStore(f.selection).kind,'refused_no_recovery');}finally{process.kill=kill;}intact(f);
 // A coherently selected malformed tail is still rejected by the unchanged cold decoder.
 fs.appendFileSync(f.path,'partial');const damaged=fs.readFileSync(f.path),s={...f.selection,expectedCurrent:{byteLength:damaged.length,digest:sha256Bytes(damaged)}};
 const invalid=store.recoverInterruptedEventStore(s);assert.equal(invalid.kind,'refused_no_recovery');assert.equal(invalid.code,'history_validation');
 assert.deepEqual(fs.readFileSync(f.path),damaged);assert.deepEqual(fs.readFileSync(f.lockPath),f.lockBytes);
});

test('pre-adoption read failure and close-release failure retain primary cause and exact residue without a handoff',t=>{
 const f=interrupted(t),read=fs.readSync;
 const before=patchFs({readSync:(fd,...args)=>{if(fs.fstatSync(fd).ino===f.selection.lastCloseHandoff.reopenAuthority.inode)throw new Error('injected cold read');return read(fd,...args);}},()=>store.recoverInterruptedEventStore(f.selection));
 assert.equal(before.kind,'refused_no_recovery');assert.match(before.message,/injected cold read/);intact(f);
 const unlink=fs.unlinkSync;
 const after=patchFs({unlinkSync:path=>{if(path===f.lockPath)throw new Error('injected close release');return unlink(path);}},()=>store.recoverInterruptedEventStore(f.selection));
 assert.equal(after.kind,'recovery_fault');assert.match(after.message,/injected close release/);assert(!('closeHandoff'in after));
 assert.deepEqual(after.residue,{logDescriptor:'closed',lockDescriptor:'closed',lockPath:'selected_lock_retained',cleanupErrors:[]});intact(f);
});

test('genuine append/close with undelivered handoff recovers selected absent lock and ordinarily reopens unchanged bytes',async t=>{
 const f=interrupted(t,{lostReceipt:true}),r=await resourceOwner(),request=r.request(f.selection),approval=r.approve(request);
 const wrong=structuredClone(request);wrong.lockPath+='-foreign';
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(wrong,approval)).code,'approval_mismatch');
 const before=fs.readSync;let reads=0;
 fs.readSync=(fd,...args)=>{if(fs.fstatSync(fd).ino===fs.statSync(f.path).ino){reads++;assert(fs.existsSync(f.lockPath));}return before(fd,...args);};syncBuiltinESMExports();
 let receipt;try{receipt=await r.owner.recoverInterruptedAbgEventResource(request,approval);}finally{fs.readSync=before;syncBuiltinESMExports();}
 assert.equal(receipt.outcome.kind,'recovered',JSON.stringify(receipt));assert.equal(reads,1);assert.equal(receipt.outcome.validatedEventCount,3);
 assert(!fs.existsSync(f.lockPath));assert.deepEqual(fs.readFileSync(f.path),f.bytes);assert.equal(fs.statSync(f.path).ino,f.selection.lastCloseHandoff.reopenAuthority.inode);
 assert.equal(store.reopenEventStore(f.selection.lastCloseHandoff.reopenAuthority).kind,'event_store_reopen_refusal');
 const reopened=store.reopenEventStore(receipt.outcome.closeHandoff.reopenAuthority);assert.equal(reopened.kind,'reopened_event_store_context');
 assert.deepEqual(reopened.store.projectReopenAuthorityAndClose(),receipt.outcome.closeHandoff);
 t.diagnostic(JSON.stringify({coldReads:reads,bytes:f.bytes.length,premise:'Installed verifier supplied; genuine disposable process append+close, undelivered current handoff, exact maintenance approval and real ordinary reopen.'}));
});
test('absent-lock case refuses existing lock and invalid successor, cleans only its acquisition, and reports cleanup residue',t=>{
 const f=interrupted(t,{lostReceipt:true});
 fs.writeFileSync(f.lockPath,'unrelated existing lock');
 assert.equal(store.recoverInterruptedEventStore(f.selection).kind,'refused_no_recovery');
 assert.equal(fs.readFileSync(f.lockPath,'utf8'),'unrelated existing lock');fs.unlinkSync(f.lockPath);
 fs.appendFileSync(f.path,'partial');const bytes=fs.readFileSync(f.path),selection={...f.selection,expectedCurrent:{byteLength:bytes.length,digest:sha256Bytes(bytes)}};
 const refused=store.recoverInterruptedEventStore(selection);assert.equal(refused.kind,'refused_no_recovery');assert.equal(refused.code,'history_validation');
 assert(!fs.existsSync(f.lockPath));assert.deepEqual(fs.readFileSync(f.path),bytes);
 const unlink=fs.unlinkSync;
 const fault=patchFs({unlinkSync:path=>{if(path===f.lockPath)throw new Error('injected absent-lock cleanup failure');return unlink(path);}},()=>store.recoverInterruptedEventStore(selection));
 assert.equal(fault.kind,'recovery_fault');assert.equal(fault.code,'cleanup_failed');assert(!('closeHandoff'in fault));
 assert.equal(fault.residue.lockPath,'selected_lock_retained');assert.equal(fault.residue.logDescriptor,'closed');assert.equal(fault.residue.lockDescriptor,'closed');
 assert(fault.residue.cleanupErrors.some(e=>e.includes('injected absent-lock cleanup failure')));assert.deepEqual(fs.readFileSync(f.path),bytes);
});

function initialInterruption(t,{commit,release}){
 const scratch=fs.mkdtempSync(join(tmpdir(),'abg-initial-recovery-')),path=join(scratch,'events.jsonl');
 const script=`import * as s from ${JSON.stringify(pathToFileURL(join(root,'build/code/src/abg/event_store.js')).href)};
 import * as a from ${JSON.stringify(pathToFileURL(join(root,'build/code/src/abg/definition_event_resource.js')).href)};
 import {sha256Canonical as h} from ${JSON.stringify(pathToFileURL(join(root,'build/code/src/product/index.js')).href)};
 const request={kind:'new_abg_event_resource',schemaVersion:'5.0.0',eventLogPath:process.argv[1],locatorDigest:a.abgEventLocatorDigest(process.argv[1])};
 const acquired=a.acquireAbgEventResource(request);if(acquired.kind!=='acquired_abg_event_resource')throw Error(JSON.stringify(acquired));
 const store=acquired.resource.store;
 ${commit?`s.admitRuntimeEvent(store,{kind:'basis_admitted',eventTime:'2026-09-22T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://initial',parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://initial',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://initial',payload:{basisClass:'root',basisRef:'basis://first',basisDigest:h('first'),rawInputValue:{selected:'first actual commit'}}});`:''}
 ${release?'store.projectReopenAuthorityAndClose();':''}
 // No close handoff is delivered, including the first close case.
 process.stdout.write(JSON.stringify({request,pid:process.pid})${release?'':",()=>process.kill(process.pid,'SIGKILL')"});`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',script,path],{encoding:'utf8'});
 assert.equal(release?child.status:child.signal,release?0:'SIGKILL',child.stderr);
 const {request,pid}=JSON.parse(child.stdout),stat=fs.statSync(path),bytes=fs.readFileSync(path);
 const lockPath=join(tmpdir(),'abiogenesis-event-store-locks-v5',`${stat.dev}-${stat.ino}.lock`),lock=release?null:fs.statSync(lockPath),lockBytes=release?null:fs.readFileSync(lockPath);
 const selection={initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path},device:stat.dev,inode:stat.ino},
 expectedCurrent:{byteLength:bytes.length,digest:sha256Bytes(bytes)},ownerPid:pid,
 ...(release?{recoveryCase:'lock_absent',lockPath}:{abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:sha256Bytes(lockBytes)}})};
 t.after(()=>{if(fs.existsSync(lockPath))fs.unlinkSync(lockPath);fs.rmSync(scratch,{recursive:true,force:true});});
 return {selection,request,path,bytes,lockPath,lockBytes};
}
test('initial origin survives first acquisition, first commit and first close before any handoff delivery',async t=>{
 const r=await resourceOwner();
 for(const [commit,release]of [[false,false],[true,false],[false,true],[true,true]]){
  const f=initialInterruption(t,{commit,release}),request=r.request(f.selection);
  assert.deepEqual(request.initialOrigin.newResourceRequest,f.request,'origin is actual original caller selection');assert(!('lastCloseHandoff'in request));
  const receipt=await r.owner.recoverInterruptedAbgEventResource(request,r.approve(request));
  assert.equal(receipt.outcome.kind,'recovered',JSON.stringify(receipt));assert.equal(receipt.outcome.validatedEventCount,commit?1:0);
  assert.deepEqual(fs.readFileSync(f.path),f.bytes);assert.equal(fs.statSync(f.path).ino,f.selection.initialOrigin.inode);assert(!fs.existsSync(f.lockPath));
  const next=store.reopenEventStore(receipt.outcome.closeHandoff.reopenAuthority);assert.equal(next.kind,'reopened_event_store_context');
  assert.deepEqual(next.store.projectReopenAuthorityAndClose(),receipt.outcome.closeHandoff);
 }
 t.diagnostic('Four genuine process lifecycle cuts, both ownership residues, no invented predecessor handoff; artifact verification remains supplied lower premise.');
});
test('initial-origin wrong selection, missing evidence and crossed approval refuse without changing actual residue',async t=>{
 const f=initialInterruption(t,{commit:true,release:false}),r=await resourceOwner(),request=r.request(f.selection),approval=r.approve(request);
 const noEvidence=structuredClone(request);delete noEvidence.initialOrigin.evidence;
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(noEvidence,approval)).code,'invalid_request');
 const wrong=structuredClone(request);wrong.initialOrigin.inode++;
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(wrong,approval)).code,'approval_mismatch');
 const selected=await r.owner.recoverInterruptedAbgEventResource(wrong,r.approve(wrong));assert.equal(selected.outcome.kind,'refused_no_recovery');
 const different=structuredClone(request);different.initialOrigin.newResourceRequest.eventLogPath+='-wrong';
 different.initialOrigin.newResourceRequest.locatorDigest=abgEventLocatorDigest(different.initialOrigin.newResourceRequest.eventLogPath);
 const badPath=await r.owner.recoverInterruptedAbgEventResource(different,r.approve(different));assert.equal(badPath.outcome.kind,'refused_no_recovery');
 assert.deepEqual(fs.readFileSync(f.path),f.bytes);assert.deepEqual(fs.readFileSync(f.lockPath),f.lockBytes);
});

test('confirmed-unheld resource reconciles while former process lives; retained live ownership and unknown quiescence refuse',async t=>{
 const {acquireAbgEventResource}=await import('../../build/code/src/abg/definition_event_resource.js');
 const scratch=fs.mkdtempSync(join(tmpdir(),'abg-live-former-owner-')),path=join(scratch,'events.jsonl');
 const original={kind:'new_abg_event_resource',schemaVersion:'5.0.0',eventLogPath:path,locatorDigest:abgEventLocatorDigest(path)};
 const acquired=acquireAbgEventResource(original);assert.equal(acquired.kind,'acquired_abg_event_resource');
 const s=acquired.resource.store,stat=fs.statSync(path),lockPath=join(tmpdir(),'abiogenesis-event-store-locks-v5',`${stat.dev}-${stat.ino}.lock`);
 t.after(()=>{s.closeDurableLog();fs.rmSync(scratch,{recursive:true,force:true});});
 const selection={initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath:path},device:stat.dev,inode:stat.ino},
 expectedCurrent:{byteLength:0,digest:sha256Bytes(Buffer.alloc(0))},ownerPid:process.pid,recoveryCase:'lock_absent',lockPath};
 const r=await resourceOwner(),request=r.request(selection),approval=r.approve(request);
 const busy=await r.owner.recoverInterruptedAbgEventResource(request,approval);assert.equal(busy.outcome.kind,'refused_no_recovery');assert.equal(busy.outcome.code,'exclusive_acquisition');
 const lock=fs.statSync(lockPath),lockBytes=fs.readFileSync(lockPath),{recoveryCase,lockPath:_,...withoutAbsent}=selection;
 const retained=r.request({...withoutAbsent,abandonedLock:{path:lockPath,device:lock.dev,inode:lock.ino,bytesBase64:lockBytes.toString('base64'),digest:sha256Bytes(lockBytes)}});
 const live=await r.owner.recoverInterruptedAbgEventResource(retained,r.approve(retained));assert.equal(live.outcome.kind,'refused_no_recovery');assert.equal(live.outcome.code,'quiescence');
 assert.deepEqual(fs.readFileSync(lockPath),lockBytes);
 s.projectReopenAuthorityAndClose(); // Genuine release; deliberately do not retain/deliver its handoff.
 const unknown=structuredClone(request);delete unknown.interruption.quiescenceEvidence;
 assert.equal((await r.owner.recoverInterruptedAbgEventResource(unknown,approval)).code,'invalid_request');assert(!fs.existsSync(lockPath));
 const receipt=await r.owner.recoverInterruptedAbgEventResource(request,approval);assert.equal(receipt.outcome.kind,'recovered',JSON.stringify(receipt));
 assert.equal(fs.statSync(path).ino,stat.ino);assert.equal(fs.readFileSync(path).length,0);assert(!fs.existsSync(lockPath));
 const reopened=store.reopenEventStore(receipt.outcome.closeHandoff.reopenAuthority);assert.equal(reopened.kind,'reopened_event_store_context');reopened.store.closeDurableLog();
});
