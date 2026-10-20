import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const bytes=path=>readFile(path);
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const verifyPin=async row=>{const data=await bytes(row.path);assert.equal(data.length,row.byteCount);assert.equal(createHash('sha256').update(data).digest('hex'),row.sha256);return data;};
const selected=await read(join(root,'inputs.json'));
const caller=await readFile(join(root,'prepare.mjs'),'utf8');
const predecessor=await verifyPin(selected.callerBase.prepare);
const old=predecessor.toString('utf8');
for(const name of ['verify-artifacts.mjs','packed-resources.mjs','binding-inputs.mjs','operation-resource.mjs'])assert.deepEqual(await bytes(join(root,name)),await bytes(join(dirname(selected.callerBase.prepare.path),name)));
const packet="{kind:'product_resolution_packet',schemaVersion:'5.0.0',memberKey:'resolve',verifiedArtifacts:items.map(x=>x.verified)}";
assert.equal(caller.split('p.ProductEnvironmentPort.resolve(').length-1,1);
assert.equal(old.split('p.ProductEnvironmentPort.resolve(').length-1,1);
assert(caller.includes('p.ProductEnvironmentPort.resolve('+packet+')'));
assert(old.includes('p.ProductEnvironmentPort.resolve('+packet+')'));
const packed=caller.indexOf("await pulse('packed-resource-correspondence-complete'");
const early=caller.indexOf('p.ProductEnvironmentPort.resolve(');
const acquire=caller.indexOf('const acquired=a.acquireAbgEventResource(');
assert(packed>=0&&packed<early&&early<acquire);
assert(caller.includes('savedResolvedLock=saved.resolvedLock;'));
assert(caller.includes('assert.deepEqual(lock,savedResolvedLock);savedResolvedLock=null;'));
assert(caller.includes('assert.deepEqual(currentInstall.resolvedLock,lock);'));
assert(caller.includes('assert.deepEqual(currentConsumer.resolvedLock,lock);'));
assert(caller.includes('assert.deepEqual(environment.resolvedProductLock,lock);'));
for(const label of ['early-fixed-product-resolve','native-install-query','consumer-install-query','binding-query','environment-refresh']){
 assert(caller.includes("pulseNow('"+label+"-start'"));
 assert(caller.includes("pulseNow('"+label+"-returned'"));
}
for(const [value,guard] of [['currentInstall','assert.ok(currentInstall?.install)'],['currentConsumer','assert.ok(currentConsumer?.install)'],['projectedBinding','assert.ok(projectedBinding?.binding)']]){
 const returned=caller.indexOf('returned:'+value+'===null?null:');
 assert(returned>=0&&returned<caller.indexOf(guard));
}
const tail=" const {reconstructHistoricalDeclarationCatalog}=await import";
const oldTail=old.slice(old.indexOf(tail)).replaceAll('/continuation-187','/continuation-193').replaceAll('no187 clock/native authority','no193 clock/native authority');
assert.equal(caller.slice(caller.indexOf(tail)),oldTail);
const base=await read(selected.callerBase.inputs.path);
for(const key of ['archive','currentClosedPhase','sourceResultRef','sourceRunRef','candidateIdentity','candidateFreeze','host','acquisition','closed136','rootControl','historicalCaller','consumerAcquisition','historical136Handoff','recoveryReceipt','recoveryFreeze','setupIdentity','workspaceManifest','originalBindCall','publicationAcceptance','completed185','currentSourceUseExpected'])assert.deepEqual(selected[key],base[key]);
assert.equal(selected.completed185.currentSetup.byteCount,37307310); // Reference only: no declaration-body acquisition.
assert.equal(selected.latestEntryStatus,'BOUND_GENUINE_CLOSED192');
const recovery=JSON.parse((await verifyPin(selected.latestEntryRecovery.receipt)).toString('utf8'));
await verifyPin(selected.latestEntryRecovery.freeze);
const handoff=JSON.parse((await verifyPin(selected.handoff)).toString('utf8'));
assert.equal(recovery.kind,'abg_event_resource_recovery_receipt');
assert.equal(recovery.outcome.kind,'recovered');
assert.deepEqual(recovery.outcome.closeHandoff,handoff);
const original185=await read(selected.completed185.return.path);
assert.deepEqual(handoff.prefix,original185.actualCurrentClosePrefix);
const resolve=await read(selected.completed185.calls['product-resolve'].outcome.path);
assert.equal(resolve.receipt.ownerOutput.outcomeKind,'result');
assert.equal(resolve.receipt.ownerOutput.value.resolvedLock.digest,'sha256:331f63297398472199b32eec9ea77fb87399c975d06217c566e68439007230f7');
console.log(JSON.stringify({status:'PASS',sameSixFileBase:true,fourHelpersUnchanged:true,sameOwnerPacket:true,singleResolutionBeforeAcquisition:true,completeLockComparisonsPreserved:true,actualNullRecordedBeforeAssert:true,remainingConsumerTailUnchanged:true,genuine192HandoffCorrespondence:true,noHistoryOrDeclarationBodyRead:true,noOwnerExecution:true,limits:'Static sequencing/pin correspondence only; live verification, full lock equality, current-use and stock-heap preparation remain unproved.'}));
