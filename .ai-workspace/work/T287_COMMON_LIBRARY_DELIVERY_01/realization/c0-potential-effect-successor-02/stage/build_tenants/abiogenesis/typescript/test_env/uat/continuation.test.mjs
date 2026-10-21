import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {access,mkdir,mkdtemp,readFile,stat,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {BoundaryFailure,cliTransportJsonl,installedModules} from './public-setup.mjs';
import {prepareInstalledContinuation} from './continuation.mjs';

const installedRoot=process.env.ABI5_UAT_CONTINUATION_INSTALLED_ROOT;
const nativeAcquisition=process.env.ABI5_UAT_CONTINUATION_NATIVE_ACQUISITION;
const consumerAcquisition=process.env.ABI5_UAT_CONTINUATION_CONSUMER_ACQUISITION;
const scratch=process.env.ABI5_UAT_UNIT_ROOT;
const selected=Boolean(installedRoot&&nativeAcquisition&&consumerAcquisition&&scratch);
const runtime=selected?await installedModules(installedRoot):null;
const pin=async path=>{const bytes=await readFile(path);return {path,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length};};

test('CLI request framing preserves literal bodies, authority and producer coordinates in one line', {skip:!selected},()=>{
  const p=runtime.product,call={invocation:{invocationRef:'invocation://fixture/request',invocationDigest:p.sha256Canonical('authority'),
    request:{input:{value:'\uFEFFΩ😀\nline two',valueDigest:p.sha256Canonical('\uFEFFΩ😀\nline two')},
      sourceBasis:{kind:'admitted_source_result',sourceResult:{ref:'result://fixture/old',digest:p.sha256Canonical('old')}}}},
    resources:{body:'literal \r\n stream',permission:{actorRef:'actor://fixture/owner'}}};
  const acquisition={kind:'eventless'},encoded=cliTransportJsonl(p,call,acquisition);
  assert.equal(encoded.split('\n').filter(Boolean).length,1);
  assert.deepEqual(JSON.parse(encoded),{kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition,invocation:call});
  assert.equal(p.sha256Canonical(JSON.parse(encoded).invocation),p.sha256Canonical(call));
  assert.throws(()=>cliTransportJsonl(p,{bad:undefined},acquisition));
});

for(const reuseInstalledPair of [false,true])test(`Actual ${reuseInstalledPair?'unchanged-pair':'changed-pair'} owner verification/resolution precedes history; an unadmitted source refuses and closes unchanged`, {skip:!selected},async()=>{
  await mkdir(scratch,{recursive:true});const root=await mkdtemp(join(scratch,'continuation-'));
  const {product:p,abg:a}=runtime;
  const definitions=await import(pathToFileURL(join(installedRoot,'build/code/src/abg/definition_event_resource.js')).href);
  const eventLogPath=join(root,'fixture.events.jsonl');
  const initial=a.acquireAbgEventResource({kind:'new_abg_event_resource',schemaVersion:'5.0.0',eventLogPath,
    locatorDigest:definitions.abgEventLocatorDigest(eventLogPath)});
  assert.equal(initial.kind,'acquired_abg_event_resource');
  const prefix=a.selectHeldEventStoreDurablePrefix(initial.resource.store),closed=a.closeAbgEventResource(initial.resource,prefix);
  const before=await stat(eventLogPath,{bigint:true}),stages=[];
  const namespace='request://abi5-tests/continuation/missing-source',actorRef='actor://abi5-tests/continuation/fixture';
  const native=JSON.parse(await readFile(nativeAcquisition,'utf8')),consumer=JSON.parse(await readFile(consumerAcquisition,'utf8'));
  // This is deliberately unadmitted fixture input. No synthetic event or basis
  // supplies authority; the actual rehydration owner must return absence.
  const sourcePublicAuthorityDigest=p.sha256Canonical('unadmitted-source');
  const instance={root,installedRoot,namespace,actorRef,
    artifacts:[{label:'native',acquisition:await pin(nativeAcquisition)},{label:'consumer',acquisition:await pin(consumerAcquisition)}],
    resource:{closeHandoff:closed.closeHandoff,mtimeNs:before.mtimeNs.toString()},
    current:{reuseInstalledPair,lock:{ref:process.env.ABI5_UAT_CONTINUATION_LOCK_REF,digest:process.env.ABI5_UAT_CONTINUATION_LOCK_DIGEST}},
    source:{call:{invocation:{invocationDigest:sourcePublicAuthorityDigest}},setup:{workspaceAuthority:{authorizedActorRef:actorRef}},
      invocationAdmissionRef:'invocation-admission://abiogenesis/'+'0'.repeat(64),publicAuthorityDigest:sourcePublicAuthorityDigest,
      runRef:'run://abiogenesis/'+'0'.repeat(64),resultRef:'result://abiogenesis/'+'0'.repeat(64)},
    checkpoint:value=>stages.push(value.stage)};
  assert.equal(native.verification.kind,'product_verification_success');assert.equal(consumer.verification.kind,'product_verification_success');
  await assert.rejects(prepareInstalledContinuation(instance),error=>error instanceof BoundaryFailure&&error.stage==='source-invocation-admission'&&error.observation===null);
  const acquisition=stages.indexOf('acquisition-start');assert(acquisition>0);
  for(const stage of ['native-verify-complete','consumer-verify-complete','fixed-resolution-complete',
    ...(reuseInstalledPair?[]:['product-verify-0-complete','product-verify-1-complete','product-resolve-complete'])])assert(stages.indexOf(stage)>=0&&stages.indexOf(stage)<acquisition,stage);
  const first=JSON.parse(await readFile(join(root,'first-cause.json'),'utf8'));
  assert.equal(first.stage,'source-invocation-admission-start');assert.equal(first.observation,null);
  const final=JSON.parse(await readFile(join(root,'final-close-handoff.json'),'utf8'));
  assert.deepEqual(final.prefix,closed.closeHandoff.prefix);
  const after=await stat(eventLogPath,{bigint:true});
  assert.equal(after.size,before.size);assert.equal(after.ino,before.ino);assert.equal(after.mtimeNs,before.mtimeNs);
  if(reuseInstalledPair) {
    assert(!stages.some(stage=>/^(product-(verify|resolve|install)|workspace-bind|catalog-|witness-)/.test(stage)),
      'An unchanged-pair request must not enter replacement setup admissions');
    await assert.rejects(access(join(root,'calls')),error=>error.code==='ENOENT');
  } else {
    const resolved=JSON.parse(await readFile(join(root,'calls/product-resolve.outcome.json'),'utf8'));
    assert.equal(resolved.receipt.ownerOutput.outcomeKind,'result');
    assert.deepEqual(resolved.receipt.ownerOutput.value.resolvedLock,instance.current.lock);
  }
  assert(!stages.some(stage=>stage.startsWith('product-install')));
  const again=await mkdtemp(join(scratch,'crossed-acquisition-'));
  const crossed={...instance,root:again,artifacts:[{label:'native',acquisition:{...await pin(nativeAcquisition),sha256:'0'.repeat(64)}},instance.artifacts[1]],
    checkpoint:()=>assert.fail('Crossed immutable acquisition must refuse before an owner is entered')};
  await assert.rejects(prepareInstalledContinuation(crossed),/Selected fixture input digest changed/);
  await assert.rejects(access(join(again,'final-close-handoff.json')),error=>error.code==='ENOENT');
});

test('Physical input tampering refuses before verifier, acquisition or dispatch', {skip:!selected},async()=>{
  const root=await mkdtemp(join(scratch,'physical-tamper-')),worksite=join(root,'worksite');await mkdir(worksite);
  const path=join(worksite,'original.txt');await writeFile(path,'changed');const facts=await stat(path);
  const instance={root,installedRoot,resource:{physical:{workspaceRoot:worksite,physicalRows:[{relativePath:'original.txt',state:'present',
    device:facts.dev,inode:facts.ino,byteCount:8,sha256:createHash('sha256').update('original').digest('hex')}]}},
    checkpoint:()=>assert.fail('Physical guard failure must precede all owner operations')};
  await assert.rejects(prepareInstalledContinuation(instance),/AssertionError/);
  const first=JSON.parse(await readFile(join(root,'first-cause.json'),'utf8'));assert.equal(first.stage,'preflight');
  await assert.rejects(access(join(root,'calls')),error=>error.code==='ENOENT');
});
