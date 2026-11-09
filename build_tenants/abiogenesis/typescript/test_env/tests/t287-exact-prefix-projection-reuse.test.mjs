import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadProjectionOwners,filePrefix,sha256} from '../support/t287-exact-prefix-projection-reuse.mjs';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {constructInstalledRunReadCall,constructInstalledStartCall,runInstalledCliRequest} from '../support/registered-graph-selection.mjs';
import {prepareLanguageSmokeFixture,constructLanguageTestInput} from '../support/language-smoke-fixture.mjs';

const packageRoot=process.env.ABI5_PREFIX_PACKAGE_ROOT??resolve(dirname(fileURLToPath(import.meta.url)),'../..');
// The proof territory is disposable output, not evidence: ABI5_PREFIX_PROOF_ROOT
// names one, else the lane owns a temporary one and removes it after the lane.
const proofRoot=process.env.ABI5_PREFIX_PROOF_ROOT??await mkdtemp(join(tmpdir(),'abi5-prefix-proof-'));
if(process.env.ABI5_PREFIX_PROOF_ROOT===undefined)after(()=>rm(proofRoot,{recursive:true,force:true}));
const owners=await loadProjectionOwners(packageRoot);
const resign=value=>{const {coordinateDigest,...body}=value;return {...body,coordinateDigest:owners.digests.sha256Canonical(body)};};
const project=p=>owners.artifact.projectExactPrefixArtifactTruth(p);

test('T287 disposable reuse preserves prefix/profile/file checks and rejects mutable forgeries',async()=>{
  assert.ok(proofRoot,'explicit fresh proof territory required');await mkdir(proofRoot,{recursive:true});
  const scratch=await mkdtemp(join(proofRoot,'reuse-'));
  const files=[];
  for(let i=0;i<3;i++){const path=join(scratch,'empty-'+i+'.jsonl');await writeFile(path,'',{flag:'wx'});files.push(await filePrefix(path,Buffer.alloc(0),owners));}
  const first=project(files[0]);assert.equal(first.kind,'exact_prefix_artifact_truth_projection');
  // The design's figure is equality, not identity: "equal prefix reconstructs equal result"
  // (M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md:361).
  assert.deepStrictEqual(project(structuredClone(files[0])),first,'equal prefix reconstructs equal result');
  assert.equal(Object.isFrozen(first),true);assert.equal(Object.isFrozen(first.prefix.storeIdentity),true);
  const supplied=structuredClone(first);assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(supplied),true);
  supplied.projectionDigest='sha256:'+'0'.repeat(64);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(supplied),false,'forged projection not an authority');
  const changed=structuredClone(files[0]);changed.prefixDigest='sha256:'+'1'.repeat(64);
  assert.equal(project(resign(changed)).code,'prefix_digest_mismatch');
  assert.equal(project({...files[0],scope:{runId:'unadmitted'}}).kind,'exact_prefix_artifact_truth_projection_refusal');
  const profile=structuredClone(files[0]);profile.storeIdentity.eventContractDigest='sha256:'+'f'.repeat(64);
  assert.equal(project(resign(profile)).code,'event_contract_digest_mismatch');
  const legacy=resign({...structuredClone(files[0]),storeIdentity:{...files[0].storeIdentity,eventContractDigest:owners.events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST}});
  const legacyResult=project(legacy);assert.equal(legacyResult.kind,'exact_prefix_artifact_truth_projection');
  assert.notStrictEqual(legacyResult,first,'distinct known profile gets a distinct computation');
  const accessor={...files[0]};let accessed=0;Object.defineProperty(accessor,'prefixDigest',{enumerable:true,get(){accessed++;return files[0].prefixDigest;}});
  Object.freeze(accessor);
  assert.equal(project(accessor).kind,'exact_prefix_artifact_truth_projection_refusal');assert.equal(accessed,0,'reject live getter before read/key can diverge');
  const mutable=structuredClone(files[0]);assert.equal(project(mutable).projectionDigest,first.projectionDigest);mutable.prefixLength=1;
  assert.equal(project(resign(mutable)).code,'prefix_length_mismatch');
  // Historical selection remains valid after append, but explicit currentness does not.
  await writeFile(fileURLToPath(files[0].eventLogRef),'not an admitted suffix');
  assert.equal(project(files[0]).projectionDigest,first.projectionDigest);
  assert.throws(()=>owners.events.readRuntimeEventsAtDurablePrefix(files[0],{requireCurrent:true}),e=>e.code==='prefix_length_mismatch');
  await rename(fileURLToPath(files[0].eventLogRef),join(scratch,'original-empty'));
  await writeFile(fileURLToPath(files[0].eventLogRef),'',{flag:'wx'});
  assert.equal(project(files[0]).code,'file_identity_mismatch','cache cannot authorize replacement inode');
  const one=project(files[1]);project(files[2]);project(legacy);
  // A further distinct file; a later projection of an earlier file is equal, a new value.
  const fourthPath=join(scratch,'empty-3.jsonl');await writeFile(fourthPath,'',{flag:'wx'});
  project(await filePrefix(fourthPath,Buffer.alloc(0),owners));
  const again=project(files[1]);assert.notStrictEqual(again,one);assert.equal(again.projectionDigest,one.projectionDigest);
});

test('T287 retained scope and same-inode byte mutation cannot reuse false truth',{skip:!process.env.ABI5_PREFIX_EVENT_PATH&&'ABI5_PREFIX_EVENT_PATH unset; requires the retained event log'},async()=>{
  const path=process.env.ABI5_PREFIX_EVENT_PATH,bytes=await readFile(path);
  assert.equal(sha256(bytes),process.env.ABI5_PREFIX_EXPECTED_SHA256);
  const coordinate=await filePrefix(path,bytes,owners,240),full=project(coordinate);
  assert.equal(full.kind,'exact_prefix_artifact_truth_projection');
  const forged=structuredClone(full);forged.rows[0].artifact.packageVersion='forged';
  const {projectionRef,projectionDigest,...forgedBody}=forged;
  forged.projectionDigest=owners.digests.sha256Canonical(forgedBody);
  forged.projectionRef='artifact-truth-projection://abiogenesis/'+forged.projectionDigest.slice(7);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(forged),false,'self-consistent forged artifact is still not event truth');
  const wrongProfile=resign({...structuredClone(coordinate),storeIdentity:{...coordinate.storeIdentity,eventContractDigest:owners.events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST}});
  assert.equal(project(wrongProfile).kind,'exact_prefix_artifact_truth_projection_refusal','known but crossed profile refuses actual current history');
  const records=bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse),binding=records[2].payload;
  const mismatch=owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate,{ref:binding.artifactRef,digest:'sha256:'+'0'.repeat(64)});
  assert.equal(mismatch.code,'workspace_binding_mismatch');
  const missing=owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate,{ref:'workspace-binding://unknown',digest:binding.authorityScopeDigest});
  assert.equal(missing.code,'workspace_binding_missing');
  const events=owners.events.readRuntimeEventsAtDurablePrefix(coordinate);
  const scope=owners.prefix.selectValidatedRuntimeEventPrefix(events,{runId:'run://abiogenesis/2b9cc78738fc8051898018dd68d0d7bd710faeb0b480504f4c01c2fefc392371'});
  const scoped=owners.artifact.projectValidatedPrefixArtifactTruth(coordinate,scope);
  assert.equal(scoped.rows.length,0);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(scoped),false);
  assert.deepStrictEqual(project(coordinate),full,'scoped computation cannot change the unscoped projection');
  const scratch=await mkdtemp(join(proofRoot,'bytes-')),copy=join(scratch,'events.jsonl');
  const initial=Buffer.from(bytes.toString('utf8').trimEnd().split('\n').slice(0,27).join('\n')+'\n');
  await writeFile(copy,initial,{flag:'wx'});const copied=await filePrefix(copy,initial,owners);
  assert.equal(project(copied).kind,'exact_prefix_artifact_truth_projection');
  const corrupt=Buffer.from(initial);corrupt[20]^=1;await writeFile(copy,corrupt);
  assert.equal(project(copied).code,'prefix_digest_mismatch','same inode changed bytes cannot hit');
  await writeFile(copy,Buffer.alloc(0));assert.equal(project(copied).code,'prefix_length_mismatch');
  assert.equal(sha256(await readFile(path)),process.env.ABI5_PREFIX_EXPECTED_SHA256);
});

// RC7 HS02 (§10.9): one held session over the smallest installed language
// smoke Run. The installed owners run; only the observation-only history
// counters and RSS/phase timings are read from outside.
test('RC7 HS02: one held acquisition serves warm Runs and held run_result/run_replay without another decode, reopen or append, refuses stale/copied/foreign/closed selections, closes once and equals the cold reads',{timeout:280_000},async t=>{
  const phases=[],started=performance.now();
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareLanguageSmokeFixture(basis)]});
  const {installedRoot,product,scratch}=env,hash=product.sha256Canonical;
  const load=name=>import(pathToFileURL(join(installedRoot,'build/code/src',name+'.js')).href);
  const [abg,store,publicApi,contracts]=await Promise.all(['abg/index','abg/event_store','public/index','abg/project_read_operation_contracts'].map(load));
  // The producer Run crosses one ordinary cold CLI entry and closes its history.
  const setupHandoff=env.store.projectReopenAuthorityAndClose();
  const {call:producerCall}=await constructInstalledStartCall({environment:env,publicApi,input:constructLanguageTestInput('Held Session'),identity:'rc7-hs02',
    eventResource:{kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:setupHandoff,handoffDigest:hash(setupHandoff)}});
  const producer=await runInstalledCliRequest({scratch,installedRoot,identity:'rc7-hs02',acquisition:{kind:'reopen',closeHandoff:setupHandoff},call:producerCall});
  const run={receipt:producer.output.receipt,handoff:producer.output.receipt.resources.eventResource.closeHandoff};
  assert.equal(run.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(run.receipt.ownerOutput).slice(0,3000));
  // Observation only: absent in a source without the counters, so the owner
  // behavior below is reached first.
  const work=()=>store.observeRuntimeHistoryWork?.()??null;
  const phase=(name,from,to,extra={})=>{phases.push({name,ms:Math.round((to.at-from.at)*10)/10,rss:to.rss,
    work:from.work&&to.work?Object.fromEntries(Object.keys(to.work).map(k=>[k,to.work[k]-from.work[k]])):null,...extra});};
  const mark=()=>({at:performance.now(),rss:process.memoryUsage().rss,work:work()});
  const eventLogPath=fileURLToPath(run.handoff.prefix.eventLogRef),reopen=closeHandoff=>({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff,handoffDigest:hash(closeHandoff)});
  let resource=null,foreign=null;
  t.after(()=>{for(const held of [resource,foreign])if(held!==null)abg.abandonAbgEventResource(held);});

  // Acquisition: one genuine reopen of the installed producer's closed history.
  const m0=mark(),acquired=abg.acquireAbgEventResource(reopen(run.handoff)),m1=mark();
  assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
  resource=acquired.resource;let selection=abg.selectAcquiredAbgEventResource(resource,resource.entryPrefix);
  phase('acquisition',m0,m1);

  // Warm calls: two more installed Runs borrow the current selection in turn.
  const borrowed=async(label,call,entry=selection)=>{
    const outcome=await publicApi.runInstalledDefinitionCallWithResource(entry,call);
    assert.equal(outcome.kind,'installed_definition_call_transport_result',label+': '+JSON.stringify(outcome).slice(0,3000));
    return outcome.receipt;};
  const runs=[];
  for(const subject of ['Warm One','Warm Two']){
    const identity='rc7-hs02-'+subject.toLowerCase().replace(' ','-');
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,input:constructLanguageTestInput(subject),identity});
    const receipt=await borrowed(identity,call);
    assert.equal(receipt.ownerOutput.outcomeKind,'result',JSON.stringify(receipt.ownerOutput).slice(0,3000));
    assert.equal(receipt.resources.eventResource.kind,'abg_event_resource_completion','a borrowed Run completes; it does not close');
    assert.ok(receipt.resources.eventResource.successor.prefix.prefixLength>selection.prefix.prefixLength,'each Run appends its own history');
    runs.push({identity,receipt,entry:selection});selection=receipt.resources.eventResource.successor;
  }
  const m2=mark();phase('warm_calls',m1,m2,{calls:runs.length});
  const source=runs.at(-1).receipt.resources.run;assert.ok(source?.ref);
  const selectors={run_result:{kind:'none'},run_replay:{kind:'ordinal_page',fromOrdinal:0,limit:4096}};
  const readCall=(memberKey,eventResource,identity,sourceRef=source)=>{
    const constructed=constructInstalledRunReadCall({environment:env,publicApi,projectReadContracts:contracts,memberKey,selector:selectors[memberKey],source:sourceRef,eventResource,identity});
    return constructed.call;};

  // Warm reads: both held reads complete at the unchanged prefix.
  const bytesBeforeReads=await readFile(eventLogPath),warm={};
  for(const memberKey of ['run_result','run_replay']){
    const entry=selection,receipt=await borrowed(memberKey,readCall(memberKey,entry,'rc7-hs02-warm-'+memberKey),entry);
    assert.equal(receipt.ownerOutput.outcomeKind,'result',memberKey+' held read: '+JSON.stringify(receipt).slice(0,3000));
    const completion=receipt.resources.eventResource;
    assert.equal(completion.kind,'abg_event_resource_completion',memberKey+' completes without closing its outer owner');
    assert.equal(completion.successor.prefix.coordinateDigest,entry.prefix.coordinateDigest,memberKey+' reads at the unchanged prefix');
    assert.equal(abg.isAcquiredAbgEventResourceSelection(completion.successor),true);
    warm[memberKey]=receipt.ownerOutput;selection=completion.successor;
  }
  assert.deepEqual(await readFile(eventLogPath),bytesBeforeReads,'held reads append nothing');
  const m3=mark();phase('warm_reads',m2,m3,{reads:2});
  for(const [name,from,to] of [['warm_calls',m1,m2],['warm_reads',m2,m3]]){
    assert.ok(from.work&&to.work,'observation counters are present');
    for(const key of ['historyDecodes','storeReopens','coldHistoryReads'])assert.equal(to.work[key]-from.work[key],0,name+' adds no '+key);
  }
  assert.equal(m1.work.storeReopens-m0.work.storeReopens,1,'one initial reopen');
  assert.equal(m1.work.historyDecodes-m0.work.historyDecodes,1,'one initial whole-history decode');

  // Refusals: an absent source refuses at population over the held prefix;
  // stale, copied and foreign selections refuse before any owner effect.
  const absentBefore=work(),absent=publicApi.constructInstalledRunReadCall({memberKey:'run_result',workspaceBinding:{ref:env.workspaceBinding.bindingId,digest:env.workspaceBinding.bindingDigest},
    sourceRef:'run://abiogenesis/rc7-hs02-absent',selector:{kind:'none'},eventResource:selection,envelope:{definitionContractCoordinates:env.verified.definitionContractCoordinates,
      requestRef:'public-request://odd-glc/rc7-hs02/absent',correlationRef:'correlation://odd-glc/rc7-hs02/absent',eventTime:'2026-11-07T00:00:00.000Z',provenanceRefs:['provenance://odd-glc/rc7-hs02']}});
  assert.equal(absent.kind,'run_read_population_refusal');assert.equal(absent.code,'unknown_source');
  assert.equal(work().historyDecodes-absentBefore.historyDecodes,0,'a held-prefix population refusal decodes no history');
  const refuses=async(label,entry,call)=>{let outcome=null;
    try{outcome=await publicApi.runInstalledDefinitionCallWithResource(entry,call);}catch(error){return {label,thrown:String(error).slice(0,200)};}
    assert.notEqual(outcome?.receipt?.ownerOutput?.outcomeKind,'result',label+' must refuse');return {label,outcomeKind:outcome?.kind??null,code:outcome?.receipt?.failure?.code??outcome?.receipt?.ownerOutput?.value?.code??null};};
  const stale=runs[0].entry,current=selection,copied=structuredClone(current);
  assert.throws(()=>abg.assertAcquiredAbgEventResourceSelectionCurrent(stale),'a predecessor selection is stale');
  assert.equal(abg.isAcquiredAbgEventResourceSelection(copied),false,'a copied selection is not held');
  const foreignPath=join(scratch,'rc7-hs02-foreign','runtime.events.jsonl');await mkdir(dirname(foreignPath),{recursive:true});
  const foreignAcquired=abg.acquireAbgEventResource({kind:'new_abg_event_resource',schemaVersion:'5.0.0',eventLogPath:foreignPath,
    locatorDigest:hash({kind:'abg_event_log_locator',eventLogPath:resolve(foreignPath)})});
  assert.equal(foreignAcquired.kind,'acquired_abg_event_resource');foreign=foreignAcquired.resource;
  const foreignSelection=abg.selectAcquiredAbgEventResource(foreign,foreign.entryPrefix);
  // Each refused call is populated at the current prefix, where its source
  // exists; only the carried selection differs, so the selection guard decides.
  const carrying=(identity,entry)=>{const call=readCall('run_result',current,identity);return {...call,resources:{...call.resources,eventResource:entry}};};
  const refusals=[await refuses('stale',stale,carrying('rc7-hs02-stale',stale)),
    await refuses('copied',copied,carrying('rc7-hs02-copied',copied)),
    await refuses('foreign',foreignSelection,readCall('run_result',current,'rc7-hs02-foreign'))];
  abg.abandonAbgEventResource(foreign);foreign=null;
  assert.deepEqual(await readFile(eventLogPath),bytesBeforeReads,'refusals append nothing');
  // The outer owner survives the refusals: the current selection still reads.
  const again=await borrowed('run_result-after-refusals',readCall('run_result',current,'rc7-hs02-again'),current);
  assert.deepEqual(again.ownerOutput,warm.run_result,'a refused call leaves the held session current');selection=again.resources.eventResource.successor;

  // Close once at the qualification boundary; the closed selection refuses.
  const closedCall=readCall('run_result',selection,'rc7-hs02-closed');
  const closed=abg.closeAbgEventResource(resource,selection.prefix);resource=null;
  assert.equal(closed.kind,'abg_event_resource_receipt');assert.equal(closed.closeHandoff.prefix.coordinateDigest,selection.prefix.coordinateDigest);
  refusals.push(await refuses('closed',selection,closedCall));
  const m4=mark();

  // Selected cold proof: fresh CLI processes reopen the close handoff with the
  // same selectors; value, producer and projection basis are equal.
  const cold={};
  for(const memberKey of ['run_result','run_replay']){
    const call=readCall(memberKey,reopen(closed.closeHandoff),'rc7-hs02-cold-'+memberKey);
    const read=await runInstalledCliRequest({scratch,installedRoot,identity:'rc7-hs02-cold-'+memberKey,acquisition:{kind:'reopen',closeHandoff:closed.closeHandoff},call});
    const receipt=read.output.receipt;assert.equal(receipt.ownerOutput.outcomeKind,'result',memberKey);
    assert.equal(receipt.resources.eventResource.closeHandoff.prefix.coordinateDigest,closed.closeHandoff.prefix.coordinateDigest,memberKey+' cold read appends nothing');
    cold[memberKey]=receipt.ownerOutput;
    assert.deepEqual(cold[memberKey],warm[memberKey],memberKey+' warm and cold value, producer and projection basis are equal');
  }
  const m5=mark();phase('selected_cold_proof',m4,m5,{processes:2,note:'cold work runs in child CLI processes; this process counts only its own'});
  assert.deepEqual(await readFile(eventLogPath),bytesBeforeReads,'cold reads append nothing');
  const summary={phases,refusals,initial:{reopens:m1.work.storeReopens-m0.work.storeReopens,decodes:m1.work.historyDecodes-m0.work.historyDecodes,
    decodedRows:m1.work.decodedRows-m0.work.decodedRows,historyBytesRead:m1.work.historyBytesRead-m0.work.historyBytesRead},
    prefix:{bytes:closed.closeHandoff.prefix.prefixLength,coordinateDigest:closed.closeHandoff.prefix.coordinateDigest},
    resultDigest:hash(warm.run_result),replayDigest:hash(warm.run_replay),totalMs:Math.round(performance.now()-started),
    limit:'Smallest installed F_D fixture in one test process; not the installed large-log S4 growth result and no performance claim.'};
  t.diagnostic('RC7_HS02_MEASUREMENT '+JSON.stringify(summary));
});
