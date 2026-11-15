import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {SourceTextModule,SyntheticModule} from 'node:vm';
import {syncBuiltinESMExports} from 'node:module';
import {evidenceGate} from '../support/evidence-root.mjs';
import {installOncePerFile,installTenantOnce,openCaseEnvironment} from '../support/root-installed-environment.mjs';

const root=process.env.ABG_GOVERNANCE_COVERED_BUILD_ROOT??path.resolve('build/code/src');
const load=name=>import(pathToFileURL(path.join(root,name+'.js')).href);
const p=await load('product/index'),gtl=await load('gtl/index'),semantics=await load('product/semantics');
const prefixOwner=await load('abg/event_prefix'),eventOwner=await load('abg/event_store'),truth=await load('abg/invocation_execution_truth');
const terminal=await load('abg/terminal_result_contracts'),decl=await load('product/declaration_closure');
const freeze=(await load('shared/immutable')).deepFreeze,hash=p.sha256Canonical;
// The retained captured34 fixture and the frozen176 declaration pair resolve
// through their evidence gate catalogue rows under ABI5_EVIDENCE_ROOT. The
// completed-work case reads the same fixture bytes through its own row
// (governance-covered-fixture-completed-work).
const fixtureGate=evidenceGate('governance-covered-fixture');
const fixtureOptions={skip:fixtureGate.kind==='absent'&&fixtureGate.reason};
const completedFixtureGate=evidenceGate('governance-covered-fixture-completed-work');
const completedFixtureOptions={skip:completedFixtureGate.kind==='absent'&&completedFixtureGate.reason};
const declarationPair=evidenceGate('governance-declaration-pair');
const c2MaterialPath=process.env.ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS;
const proofRoot=process.env.ABG_GOVERNANCE_COVERED_PROOF_ROOT;
const clone=value=>JSON.parse(JSON.stringify(value));
async function moduleAt(name,replacements={},names=[]) {
  const file=path.join(root,name+'.js'),m=new SourceTextModule(fs.readFileSync(file,'utf8')+(names.length?'\nexport { '+names.join(',')+' };':''),{identifier:file});
  await m.link(async spec=>{const actual=await import(spec.startsWith('node:')||!spec.startsWith('.')?spec:pathToFileURL(path.resolve(path.dirname(file),spec)).href);
    const values={...actual,...replacements[spec]};return new SyntheticModule(Object.keys(values),function(){for(const [k,v]of Object.entries(values))this.setExport(k,v);});});
  await m.evaluate();return m.namespace;
}
const oldIdentity={productId:p.ABI5_PRODUCT_ID,packageName:'@abiogenesis/typescript-tenant',packageVersion:'5.0.0-rc.1',artifactDigest:hash('old archive'),productContentDigest:hash('old content'),productManifestDigest:hash('old manifest')};
const newIdentity={...oldIdentity,artifactDigest:hash('new archive'),productContentDigest:hash('new content'),productManifestDigest:hash('new manifest')};
const publications=identity=>['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'].map(n=>gtl[n](identity));
// The covered-use positive is new work. Its declarations are an actual
// current-register Catalog: the packed, verified and installed tenant with the
// three canonical governance publication constructors, admitted under one lock
// by the maintained installed fixture API, shared by this file's cases.
const packageRoot=fileURLToPath(new URL('../..',import.meta.url));
const governanceConstructors=['constructDefaultGovernanceLibraryModulePublication','constructNativeWorkspaceWorkModulePublication','constructWorksiteCommandExecutionModulePublication'];
const governanceInstall=installOncePerFile(async()=>{const install=await installTenantOnce(packageRoot);return {install,dispose:()=>install.dispose()};});
// Each complete candidate is retained under ABG_REGRESSION_PROOF_ROOT, one file
// per case, before its assertions run. Retained evidence is never copied: only
// its identities and the owners' complete refusals are kept.
const regressionRoot=process.env.ABG_REGRESSION_PROOF_ROOT;
function retainCandidate(name,value){
  if(!regressionRoot)return;const directory=path.join(regressionRoot,'t287-governance-covered-source-use');
  fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,name+'.json'),JSON.stringify(value)+'\n');
}
// The complete returned value, or the complete thrown failure, of one owner call.
const outcome=call=>{try{return {kind:'returned',value:call()};}catch(error){return {kind:'thrown',name:error?.name,message:String(error?.message??error)};}};
const catalogIdentity=value=>value?.kind==='graph_function_catalog'?{kind:value.kind,basisDigest:value.basisDigest,lockDigest:value.lockDigest,workspaceBindingId:value.workspaceBindingId}
  :value?.kind==='graph_function_catalog_view'?{kind:value.kind,viewDigest:value.viewDigest,allowlist:value.allowlist}:value;
const outcomeIdentity=result=>result.kind==='returned'?{kind:'returned',value:result.value?.catalog===undefined?catalogIdentity(result.value)
  :{catalog:catalogIdentity(result.value.catalog),catalogView:catalogIdentity(result.value.catalogView)}}:result;
// The captured binding transition: same A/root and installed meaning, a changed
// projection root, and the binding re-identified by the owner's identity law.
function reboundReadiness(readiness){
  const next=clone(readiness),binding=clone(readiness.workspaceBinding);binding.roots.projectionRoot+='/covered-test';
  const body={workspaceId:binding.workspaceId,authorityBasisId:binding.authorityBasisId,authorityBasisDigest:binding.authorityBasisDigest,
    authorizedActorRef:binding.authorizedActorRef,productSetId:binding.productSetId,productSetDigest:binding.productSetDigest,
    lockId:binding.lockId,lockDigest:binding.lockDigest,roots:binding.roots};
  next.workspaceBinding={...binding,bindingDigest:hash(body),bindingId:'workspace-binding://abiogenesis/'+hash(body).slice(7)};
  return next;
}

test('normal close preserves the owned ArtifactTruth snapshot while copies and fresh reads validate bytes',{skip:!proofRoot&&'ABG_GOVERNANCE_COVERED_PROOF_ROOT unset; requires the proof-local output root'},async t=>{
  fs.mkdirSync(proofRoot,{recursive:true});const scratch=fs.mkdtempSync(path.join(proofRoot,'closed-owner-'));
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
  const eventLogPath=path.join(scratch,'events.jsonl'),resourceOwner=await load('abg/definition_event_resource'),artifact=await load('abg/artifact_truth');
  // The complete accumulated actual candidate is retained by retainCandidate before
  // every behavioral assertion below, and again with any failure before fixture
  // restoration and scratch cleanup. Each owner call runs once: a thrown owner
  // error is recorded, then rethrown unchanged or matched exactly as before. With
  // ABG_REGRESSION_PROOF_ROOT unset nothing is written and retainedAt stays null.
  const candidateName='closed-owner-artifact-snapshot',record={kind:'closed_owner_artifact_snapshot_candidate',
    case:'normal close preserves the owned ArtifactTruth snapshot while copies and fresh reads validate bytes',eventLogPath,
    retainedAt:regressionRoot?path.join(regressionRoot,'t287-governance-covered-source-use',candidateName+'.json'):null,status:'running',steps:[]};
  const retain=(step,value)=>{record.steps.push({step,...value});retainCandidate(candidateName,record);};
  const thrown=error=>({name:error?.name,constructor:error?.constructor?.name,code:error?.code,message:String(error?.message??error),stack:String(error?.stack??'')});
  const fail=error=>{if(record.failure===undefined){record.status='failed';record.failure=thrown(error);retainCandidate(candidateName,record);}};
  const attempt=call=>{try{return {kind:'returned',value:call()};}catch(error){return {kind:'thrown',error};}};
  const shown=(result,present=value=>value)=>result.kind==='returned'?{kind:'returned',value:present(result.value)}:{kind:'thrown',...thrown(result.error)};
  const rethrow=result=>{if(result.kind==='thrown')throw result.error;return result.value;};
  const bytesOf=value=>({byteLength:value.length,sha256:p.sha256Bytes(value),base64:value.toString('base64')});
  const withoutStore=value=>value!==null&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>
    [key,key==='store'?{serialized:false,constructor:item?.constructor?.name??typeof item}:item])):value;
  try {
    const openedResult=attempt(()=>eventOwner.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath}));
    retain('create-new-empty-append-sink',{result:shown(openedResult,withoutStore)});
    const opened=rethrow(openedResult);assert.ok(opened.store);
    let handoff;
    try {
      const basisRef='basis://finite/owned-snapshot-fixture';
      const admitted=attempt(()=>eventOwner.admitRuntimeEvent(opened.store,{kind:'basis_admitted',eventTime:'2026-09-23T00:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://owned-snapshot-fixture',
        parentAggregateId:null,causationEventRefs:[],correlationId:'correlation://finite/owned-snapshot',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:basisRef,
        payload:{basisRef,basisDigest:hash('finite owned snapshot'),basisClass:'root',rawInputValue:{kind:'component-premise'}}}));
      retain('admit-basis-event',{result:shown(admitted)});rethrow(admitted);
      const closing=attempt(()=>opened.store.projectReopenAuthorityAndClose());
      retain('project-reopen-authority-and-close',{result:shown(closing)});handoff=rethrow(closing);
    } finally {opened.store.closeDurableLog();}
    const reopen={kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:handoff,handoffDigest:hash(handoff)};
    const acquiredResult=attempt(()=>resourceOwner.acquireAbgEventResource(reopen));
    retain('acquire-reopened-resource',{request:reopen,result:shown(acquiredResult,value=>({...value,resource:withoutStore(value?.resource)})),work:eventOwner.observeRuntimeHistoryWork()});
    const acquired=rethrow(acquiredResult);assert.equal(acquired.kind,'acquired_abg_event_resource');
    const nominal=acquired.resource.entryPrefix,bytes=fs.readFileSync(eventLogPath);
    let physicalOpens=0,closed=false,phase='unobserved';const originalOpen=fs.openSync,opens=[];
    const work=()=>({physicalOpens,...eventOwner.observeRuntimeHistoryWork()}),delta=(from,to)=>Object.fromEntries(Object.keys(to).map(key=>[key,to[key]-from[key]]));
    // One owner step under its own phase baseline: its complete result, the work
    // counters and physical opens before/after, and each open of the exact log
    // with the counters at that instant relative to the phase start.
    const observe=(name,call,present)=>{phase=name;const start=work(),result=attempt(call),end=work();
      return {result,observation:{phase:name,result:shown(result,present),work:{start,end,delta:delta(start,end)},
        opens:opens.filter(row=>row.phase===name).map(row=>({...row,sincePhaseStart:delta(start,row.work)}))}};};
    // A cold owned-prefix projection first decodes and authenticates its whole
    // selected history once (the owner counts that cold read before it opens),
    // then acquires its one selected basis body (which opens before it counts).
    // These are two distinct acquisitions, never a duplicate history validation.
    const assertColdHistoryThenBody=(observation,subject)=>{const d=observation.work.delta;
      assert.equal(d.coldHistoryReads,1,subject+' undergoes ordinary cold validation');
      assert.equal(d.historyDecodes,1,subject+' decodes and authenticates its history once');
      assert.equal(d.historyBytesRead,nominal.prefixLength,subject+' reads its selected history extent once');
      assert.equal(d.bodyReads,1,subject+' then acquires its one selected basis body');
      assert.ok(d.bodyBytesRead>0&&d.bodyBytesRead<=nominal.prefixLength,subject+' reads one selected row, not a second history');
      assert.deepEqual(observation.opens.map(row=>[row.sincePhaseStart.coldHistoryReads,row.sincePhaseStart.historyDecodes,row.sincePhaseStart.bodyReads]),[[1,0,0],[1,1,0]],
        subject+' opens once for its cold history read and once, after that decode, for its selected body');
    };
    retain('nominal-coordinate-and-original-bytes',{nominal,originalBytes:bytesOf(bytes),work:work()});
    fs.openSync=function(file,...args){if(String(file)===eventLogPath){physicalOpens++;opens.push({ordinal:physicalOpens,phase,flags:args[0]??null,work:eventOwner.observeRuntimeHistoryWork()});}
      return originalOpen.call(fs,file,...args);};syncBuiltinESMExports();
    try {
      // Initial materialization may acquire its basis body through the held
      // descriptor with no open. It is the baseline, not extra owned work.
      const initial=observe('owned-initial',()=>artifact.projectOwnedPrefixArtifactTruth(nominal));
      retain('owned-initial-projection',{coordinate:nominal,...initial.observation});
      const before=rethrow(initial.result);assert.equal(before.kind,'exact_prefix_artifact_truth_projection');
      const meaning=JSON.stringify(before),digest=before.projectionDigest;
      const closing=observe('close',()=>resourceOwner.closeAbgEventResource(acquired.resource,nominal));
      retain('close-owned-resource',closing.observation);
      const receipt=rethrow(closing.result);closed=true;const portablePrefix=receipt.closeHandoff.prefix;
      retain('portable-close-metadata',{compared:{portablePrefix,nominal,strictlyIdentical:portablePrefix===nominal}});
      assert.deepEqual(receipt.closeHandoff.prefix,nominal);
      assert.notStrictEqual(receipt.closeHandoff.prefix,nominal,'portable close metadata is detached from the retained owner prefix');
      const nominalCapture=observe('capture-nominal',()=>eventOwner.captureDurablePrefixCoordinate(nominal));
      retain('capture-nominal',{...nominalCapture.observation,compared:{captured:nominalCapture.result.value,nominal,strictlyIdentical:nominalCapture.result.value===nominal}});
      assert.strictEqual(rethrow(nominalCapture.result),nominal);
      const portableCapture=observe('capture-portable',()=>eventOwner.captureDurablePrefixCoordinate(receipt.closeHandoff.prefix));
      retain('capture-portable',{...portableCapture.observation,compared:{captured:portableCapture.result.value,portablePrefix,strictlyIdentical:portableCapture.result.value===portablePrefix}});
      assert.notStrictEqual(rethrow(portableCapture.result),receipt.closeHandoff.prefix,
        'portable close metadata has no nominal runtime-history association');
      const closedSelection=observe('closed-owner-selection',()=>resourceOwner.selectAcquiredAbgEventResource(acquired.resource,nominal));
      retain('closed-owner-selection-refusal',closedSelection.observation);
      assert.throws(()=>rethrow(closedSelection.result),TypeError,'closed owner grants no acquired selection');
      const reuse=observe('owned-after-close',()=>artifact.projectOwnedPrefixArtifactTruth(nominal)),after=reuse.result.value;
      const ownedAfterInitialOpens=physicalOpens-initial.observation.work.end.physicalOpens;
      retain('owned-after-close-reuse',{coordinate:nominal,...reuse.observation,ownedAfterInitialOpens,compared:{before,after,strictlyIdentical:after===before,
        beforeMeaning:meaning,afterMeaning:after===undefined?null:JSON.stringify(after),beforeDigest:digest,afterDigest:after?.projectionDigest??null}});
      rethrow(reuse.result);
      assert.strictEqual(after,before,'the closed append lease leaves the actual snapshot-local receipt intact');
      assert.equal(JSON.stringify(after),meaning);assert.equal(after.projectionDigest,digest);
      assert.equal(ownedAfterInitialOpens,0,'owned internal projection performs no second physical acquisition after close');
      assert.deepEqual(reuse.observation.work.delta,Object.fromEntries(Object.keys(reuse.observation.work.delta).map(key=>[key,0])),
        'the established snapshot is reused with no extra history, body or physical acquisition');
      const portablePhase=observe('portable-cold',()=>artifact.projectOwnedPrefixArtifactTruth(receipt.closeHandoff.prefix)),portable=portablePhase.result.value;
      retain('portable-cold-projection',{coordinate:portablePrefix,...portablePhase.observation,compared:{before,portable,strictlyIdentical:portable===before}});
      rethrow(portablePhase.result);assert.deepEqual(portable,before);
      assertColdHistoryThenBody(portablePhase.observation,'portable close metadata');
      const freshPhase=observe('explicit-fresh',()=>artifact.projectExactPrefixArtifactTruth(nominal)),fresh=freshPhase.result.value;
      retain('explicit-fresh-projection',{coordinate:nominal,...freshPhase.observation,compared:{before,fresh,strictlyIdentical:fresh===before}});
      rethrow(freshPhase.result);assert.equal(fresh.kind,'exact_prefix_artifact_truth_projection');assert.deepEqual(fresh,before);
      const freshWork=freshPhase.observation.work.delta;assert.equal(freshWork.physicalOpens,1,'explicit fresh API still validates physical bytes');
      assert.deepEqual([freshWork.coldHistoryReads,freshWork.historyDecodes,freshWork.bodyReads],[0,0,0],
        'explicit fresh uses its separate whole-prefix array reader, not the owned cold history or selected-body reader');
      const copy=structuredClone(nominal),copiedPhase=observe('raw-copy-cold',()=>artifact.projectOwnedPrefixArtifactTruth(copy)),copied=copiedPhase.result.value;
      retain('raw-copy-cold-projection',{coordinate:copy,coordinateIsNominal:copy===nominal,...copiedPhase.observation,compared:{before,copied,strictlyIdentical:copied===before}});
      rethrow(copiedPhase.result);assert.equal(copied.kind,'exact_prefix_artifact_truth_projection');assert.deepEqual(copied,before);
      assertColdHistoryThenBody(copiedPhase.observation,'a raw copy with no nominal receipt');
      const resign=coordinate=>{const {coordinateDigest,...body}=coordinate;return {...body,coordinateDigest:hash(body)};};
      const foreign=structuredClone(nominal);foreign.storeIdentity.inode+=1;const resigned=resign(foreign);
      const wrongInode=observe('wrong-inode',()=>artifact.projectOwnedPrefixArtifactTruth(resigned));
      retain('wrong-inode-refusal',{coordinate:resigned,...wrongInode.observation});
      assert.equal(rethrow(wrongInode.result).code,'file_identity_mismatch');
      const changed=Buffer.from(bytes);changed[0]^=1;const tamper=observe('tamper-write',()=>fs.writeFileSync(eventLogPath,changed));
      retain('tamper-first-byte',{...tamper.observation,originalBytes:bytesOf(bytes),tamperedBytes:bytesOf(changed),tamperedOffset:0,originalByte:bytes[0],tamperedByte:changed[0]});
      rethrow(tamper.result);
      for(const [name,coordinate,project]of [['tampered-explicit-fresh',nominal,artifact.projectExactPrefixArtifactTruth],
        ['tampered-portable',receipt.closeHandoff.prefix,artifact.projectOwnedPrefixArtifactTruth],['tampered-raw-copy',structuredClone(nominal),artifact.projectOwnedPrefixArtifactTruth]]){
        const refused=observe(name,()=>project(coordinate));retain(name+'-refusal',{coordinate,...refused.observation});
        assert.equal(rethrow(refused.result).code,'prefix_digest_mismatch',name);
      }
      const appended=Buffer.concat([bytes,Buffer.from(' ')]),append=observe('append-write',()=>fs.writeFileSync(eventLogPath,appended));
      retain('append-one-byte',{...append.observation,appendedBytes:bytesOf(appended)});rethrow(append.result);
      const current=observe('require-current',()=>eventOwner.readRuntimeEventsAtDurablePrefix(nominal,{requireCurrent:true}));
      retain('require-current-refusal',{coordinate:nominal,options:{requireCurrent:true},...current.observation});
      assert.throws(()=>rethrow(current.result),e=>e.code==='prefix_length_mismatch');
      const restore=observe('restore',()=>{fs.writeFileSync(eventLogPath,bytes);return fs.readFileSync(eventLogPath);},bytesOf),restored=restore.result.value;
      retain('restore-original-bytes',{...restore.observation,originalBytes:bytesOf(bytes),compared:{restoredEqualsOriginal:restored?.equals(bytes)??null}});
      rethrow(restore.result);assert.deepEqual(restored,bytes);
      record.status='assertions_completed';retainCandidate(candidateName,record);
      console.log(JSON.stringify({kind:'closed_owner_artifact_snapshot',ownedAfterInitialOpens,ownedAfterCloseWork:reuse.observation.work.delta,
        portableHandoffWork:portablePhase.observation.work.delta,freshWork,copiedWork:copiedPhase.observation.work.delta,
        projectionDigest:digest,prefixLength:nominal.prefixLength,candidate:record.retainedAt,
        scope:'one real contract-admitted fixture event/resource/ArtifactTruth; no installed environment, covered-source admission, campaign capacity or UAT credit'}));
    } catch(error) {fail(error);throw error;} finally {
      fs.openSync=originalOpen;syncBuiltinESMExports();if(!closed)resourceOwner.closeAbgEventResource(acquired.resource,nominal);fs.writeFileSync(eventLogPath,bytes);
    }
  } catch(error) {fail(error);throw error;}
});

test('complete canonical declarations permit only publication identity consequences',()=>{
  const old=publications(oldIdentity),next=publications(newIdentity),compared=semantics.compareGovernanceDeclarationPublications(old,next);
  assert.ok(compared);assert.equal(compared.owners.length,3);
  for(const row of compared.owners){assert.equal(row.historicalPublicationDigest,hash(old.find(p=>p.moduleRef===row.moduleRef)));assert.equal(row.currentPublicationDigest,hash(next.find(p=>p.moduleRef===row.moduleRef)));}
  const cases=[['Program',x=>x[0].programs[0].policies['abg.default_start_ref']='start://foreign'],
    ['membership',x=>x[0].programs[0].callableMembership.pop()],['graph',x=>x[0].graphFunctions[0].tags.push('changed meaning')],
    ['contract',x=>x[0].contracts[0].valueKind='different_value'],['closure',x=>x[0].closureContracts[0].predicateRef='predicate://foreign'],
    ['implementation',x=>x[0].implementationBindings[0].namedSymbol='foreignRealizer'],['policy',x=>x[0].runEnvironments[0].roles[0].policy.text+=' changed'],
    ['contribution',x=>x[0].contributions[0].readinessPrerequisiteRefs.push('program://foreign')],
    ['source identity owner',x=>x[0].descriptorRef='descriptor://foreign/'+newIdentity.productContentDigest.slice(7)],
    ['arbitrary provenance',x=>x[0].contributions[0].provenanceRefs.push('event://invented')]];
  for(const [name,alter]of cases){const changed=clone(next);alter(changed);assert.equal(semantics.compareGovernanceDeclarationPublications(old,changed),null,name);}
  assert.equal(semantics.compareGovernanceDeclarationPublications([...old,old[0]],next),null);
  assert.equal(semantics.compareGovernanceDeclarationPublications(old,[...next.slice(0,2),next[0]]),null);
  assert.equal(semantics.compareGovernanceDeclarationPublications(old,next.slice(0,2)),null);
});

test('frozen176 selected declarations compare across artifact and manifest hash-order reversal',
  {skip:declarationPair.kind==='absent'&&declarationPair.reason},t=>{
  const pair=JSON.parse(declarationPair.inputs.pair.bytes.toString('utf8'));
  assert.equal(pair.kind,'frozen_selected_declaration_pair');
  assert.equal(pair.historical.length,4);assert.equal(pair.current.length,4);
  const before=JSON.stringify(pair),forward=semantics.compareGovernanceDeclarationPublications(pair.historical,pair.current);
  const reverse=semantics.compareGovernanceDeclarationPublications(pair.current,pair.historical);
  assert.ok(forward);assert.ok(reverse);assert.equal(forward.meaningDigest,reverse.meaningDigest);
  assert.equal(forward.owners.length,4);
  for(const row of forward.owners){
    assert.equal(row.historicalPublicationDigest,hash(pair.historical.find(x=>x.moduleRef===row.moduleRef&&x.owningProductId===row.productId)));
    assert.equal(row.currentPublicationDigest,hash(pair.current.find(x=>x.moduleRef===row.moduleRef&&x.owningProductId===row.productId)));
  }
  assert.equal(JSON.stringify(pair),before,'private ordering never mutates the actual owned publication values');
  t.diagnostic(JSON.stringify({selectedCapturedPublications:4,meaningDigest:forward.meaningDigest,
    scope:'pure comparison of frozen176 selected declaration values; no whole Catalog reconstruction, admission or installed current-use credit'}));
});

test('only the substituted provenance inventory is ordered and every reference remains material',()=>{
  const old=publications({...oldIdentity,artifactDigest:'sha256:'+'f'.repeat(64),productManifestDigest:'sha256:'+'1'.repeat(64)});
  const next=publications({...newIdentity,artifactDigest:'sha256:'+'2'.repeat(64),productManifestDigest:'sha256:'+'e'.repeat(64)});
  assert.deepEqual(old[0].contributions[0].provenanceRefs,['sha256:'+'1'.repeat(64),'sha256:'+'f'.repeat(64)]);
  assert.deepEqual(next[0].contributions[0].provenanceRefs,['sha256:'+'2'.repeat(64),'sha256:'+'e'.repeat(64)]);
  assert.ok(semantics.compareGovernanceDeclarationPublications(old,next));
  assert.ok(semantics.compareGovernanceDeclarationPublications(next,old));
  const bad=[
    ['missing provenance',x=>x[0].contributions[0].provenanceRefs.pop()],
    ['duplicate provenance',x=>x[0].contributions[0].provenanceRefs.push(x[0].artifactDigest)],
    ['arbitrary provenance',x=>x[0].contributions[0].provenanceRefs.push('event://unowned')],
    ['foreign provenance',x=>x[0].contributions[0].provenanceRefs[0]='sha256:'+'3'.repeat(64)],
    ['contract',x=>x[0].contracts[0].valueKind='different_value'],
    ['rule',x=>x[0].rules[0].config={changedRuleMeaning:true}],
    ['policy',x=>x[0].runEnvironments[0].roles[0].policy.text+=' changed'],
    ['permission prerequisite',x=>x[0].contributions[0].readinessPrerequisiteRefs.push('program://foreign')],
    ['other declared vector',x=>{
      const evaluator=x[0].evaluators.find(row=>row.name===p.governanceRef('evaluator','select'));
      assert.ok(evaluator);assert.deepEqual(evaluator.consumedFieldRefs,['$.context','$.state']);
      const before=JSON.stringify(evaluator.consumedFieldRefs);evaluator.consumedFieldRefs.reverse();
      assert.notEqual(JSON.stringify(evaluator.consumedFieldRefs),before,'the negative must change the actual declared vector');
    }],
  ];
  for(const [name,alter]of bad){const changed=clone(next);alter(changed);assert.equal(semantics.compareGovernanceDeclarationPublications(old,changed),null,name);}
  // Unknown references and repeated occurrences are preserved, not discarded
  // by the private comparison. Their actual ownership is a separate guard.
  const left=clone(old),right=clone(next),unknown=['event://opaque/\u{1f600}','event://opaque/\uffff'];
  for(const population of [left,right])population[0].contributions[0].provenanceRefs.push(...unknown,unknown[0]);
  assert.ok(semantics.compareGovernanceDeclarationPublications(left,right));
  right[0].contributions[0].provenanceRefs.pop();
  assert.equal(semantics.compareGovernanceDeclarationPublications(left,right),null,'arbitrary reference multiplicity is not deduplicated');
});

test('actual installed C2 material correspondence preserves consumed content and strict refusals',
  {skip:!c2MaterialPath&&'ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS unset; requires the installed C2 material selectors'},async t=>{
  const selected=JSON.parse(fs.readFileSync(c2MaterialPath,'utf8'));
  const material=await load('product/stdo_environment'),verification=await load('product/verify_product');
  const publicationOwner=await load('product/publication');
  const memberPath='build/code/src/product/worksite_command_execution.js';
  const recordPath='contracts/worksite/command-execution-context.inventory.json';
  const manifestPath='product-toolchain-manifest.json';
  const acquire=async selection=>{
    for(const pin of selection.materialFiles){const bytes=fs.readFileSync(pin.path);
      assert.equal(bytes.length,pin.bytes);assert.equal(p.sha256Bytes(bytes),'sha256:'+pin.sha256);}
    const manifest=verification.parseProductManifest(JSON.parse(fs.readFileSync(path.join(selection.installedRoot,manifestPath),'utf8')));
    assert.ok(manifest);
    const declared=await import(pathToFileURL(path.join(selection.installedRoot,'build/code/src/gtl/worksite_command_execution.js')).href);
    const publication=declared.constructWorksiteCommandExecutionModulePublication({productId:manifest.productId,
      packageName:manifest.packageName,packageVersion:manifest.packageVersion,artifactDigest:selection.artifactDigest,
      productContentDigest:manifest.productContentDigest,productManifestDigest:hash(manifest)});
    assert.equal(manifest.contributionManifest.publicationBindings.find(row=>row.moduleRef===publication.moduleRef).publicationDigest,
      publicationOwner.modulePublicationSemanticDigest(publication));
    // ABG's causal admission/lock availability is a controlled lower premise
    // here. The actual installed publication, record/member bytes and spans
    // are independently read by the production material owner, without an
    // invented Source, event admission or copied runtime receipt.
    const install={kind:'product_install',disposition:'admitted',admissionEventRef:'event://controlled/material/'+manifest.productContentDigest,
      installedRoot:selection.installedRoot,productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion,
      artifactDigest:selection.artifactDigest,productContentDigest:manifest.productContentDigest,manifestDigest:hash(manifest),
      descriptorRef:manifest.descriptorRef,contributionManifestRef:manifest.contributionManifestRef,contributionManifestDigest:manifest.contributionManifestDigest};
    return {publication,install};
  };
  const old=await acquire(selected.historical),next=await acquire(selected.current);
  const owners={historical:[old.install],current:[next.install]};
  const compare=(a=old.publication,b=next.publication,scope=owners)=>semantics.compareGovernanceDeclarationPublications([a],[b],scope);
  const before=[JSON.stringify(old.publication),JSON.stringify(next.publication)];
  assert.equal(semantics.compareGovernanceDeclarationPublications([old.publication],[next.publication]),null,'raw declarations keep exact Context equality');
  const forward=compare(),reverse=semantics.compareGovernanceDeclarationPublications([next.publication],[old.publication],
    {historical:[next.install],current:[old.install]});
  assert.ok(forward);assert.ok(reverse);assert.equal(forward.meaningDigest,reverse.meaningDigest);
  assert.ok(compare(clone(old.publication),clone(next.publication)),'cold actual material checks can authenticate copied metadata');
  assert.deepEqual(old.publication.programs,next.publication.programs);
  assert.deepEqual(old.publication.graphFunctions,next.publication.graphFunctions);
  assert.equal(forward.owners[0].historicalPublicationDigest,hash(old.publication));
  assert.equal(forward.owners[0].currentPublicationDigest,hash(next.publication));
  const oldEnvironment=old.publication.runEnvironments[0],currentEnvironment=next.publication.runEnvironments[0];
  const oldBinding=oldEnvironment.roles[0].sourceBindings[0],currentBinding=currentEnvironment.roles[0].sourceBindings[0];
  const oldBytes=fs.readFileSync(path.join(old.install.installedRoot,memberPath));
  const currentBytes=fs.readFileSync(path.join(next.install.installedRoot,memberPath));
  const oldSpan=oldBytes.subarray(oldBinding.startByte,oldBinding.endByte),currentSpan=currentBytes.subarray(currentBinding.startByte,currentBinding.endByte);
  assert.equal(oldSpan.length,2308);assert.ok(oldSpan.equals(currentSpan));
  assert.equal(p.sha256Bytes(oldSpan),oldBinding.spanDigest);assert.equal(p.sha256Bytes(currentSpan),currentBinding.spanDigest);
  const missing=[
    ['absent material owners',{}],['claimed span with no current owner',{historical:[old.install],current:[]}],
    ['crossed owners',{historical:[next.install],current:[old.install]}],
    ['duplicate owners',{historical:[old.install],current:[next.install,next.install]}],
    ['unadmitted install',{historical:[old.install],current:[{...next.install,kind:'product_install_candidate',disposition:'materialized'}]}],
    ['missing admission selector',{historical:[old.install],current:[{...next.install,admissionEventRef:''}]}],
    ['foreign actual owner',{historical:[old.install],current:[{...next.install,installedRoot:old.install.installedRoot}]}],
    ['false manifest coordinate',{historical:[old.install],current:[{...next.install,manifestDigest:hash('foreign manifest')}]}],
  ];
  for(const [name,scope]of missing)assert.equal(compare(old.publication,next.publication,scope),null,name);
  const declarationMutations=[
    ['changed policy',e=>{e.roles[0].policy.text+=' changed';e.roles[0].policy.digest=p.sha256Bytes(Buffer.from(e.roles[0].policy.text));}],
    ['changed role',e=>e.roles[0].role='constructor'],
    ['changed selector order',e=>e.roles[0].contextPolicy.selectors.reverse()],
    ['whole member consumption',e=>{e.roles[0].sourceBindings[0].startByte=0;e.roles[0].sourceBindings[0].endByte=currentBytes.length;e.roles[0].sourceBindings[0].spanDigest=p.sha256Bytes(currentBytes);}],
    ['changed span',e=>{e.roles[0].sourceBindings[0].startByte++;e.roles[0].sourceBindings[0].endByte++;}],
    ['out of bounds',e=>e.roles[0].sourceBindings[0].endByte=currentBytes.length+1],
    ['changed member identity',e=>e.contexts[0].members[0].digest=hash('foreign member')],
    ['changed inventory',e=>e.dependencies[0].inventoryDigest=hash('foreign inventory')],
    ['changed source locator',e=>e.contexts[0].sourceLocator='source://foreign'],
    ['unproved tool dependency',e=>e.accesses.push({accessRef:'access://foreign',operation:'validate',mode:'validation',frameIndexRefs:[],maxOutputBytes:4096,timeoutMs:1})],
  ];
  for(const [name,mutate]of declarationMutations){const changed=clone(next.publication);mutate(changed.runEnvironments[0]);
    assert.equal(compare(old.publication,changed),null,name);}
  for(const [name,mutate]of [
    ['contract meaning',x=>x.contracts[0].valueKind='foreign_value'],
    ['graph meaning',x=>x.graphFunctions[0].tags.push('foreign')],
    ['contribution permission',x=>x.contributions[0].readinessPrerequisiteRefs.push('program://foreign')],
  ]){const changed=clone(next.publication);mutate(changed);assert.equal(compare(old.publication,changed),null,name);}
  assert.ok(proofRoot);fs.mkdirSync(proofRoot,{recursive:true});const scratch=fs.mkdtempSync(path.join(proofRoot,'material-'));
  t.after(()=>fs.rmSync(scratch,{recursive:true,force:true}));
  // Three required material files only; these scratch mutations never touch
  // either immutable installed owner. All install/admission availability here
  // retains the controlled lower premise above.
  for(const relative of [manifestPath,recordPath,memberPath]){const target=path.join(scratch,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(next.install.installedRoot,relative),target);}
  const scratchInstall={...next.install,installedRoot:fs.realpathSync(scratch)},scratchOwners={historical:[old.install],current:[scratchInstall]};
  assert.ok(compare(old.publication,next.publication,scratchOwners),'actual cold validation, never a copied receipt, authenticates material');
  for(const [name,relative,mutate]of [
    ['changed consumed bytes',memberPath,b=>{b[currentBinding.startByte]^=1;return b;}],
    ['changed unconsumed member bytes',memberPath,b=>{b[0]^=1;return b;}],
    ['changed record bytes',recordPath,b=>Buffer.concat([b,Buffer.from(' ')])],
    ['changed manifest bytes',manifestPath,b=>Buffer.from(b.toString('utf8').replace('command-execution@5','command-execution@4'))],
  ]){const target=path.join(scratch,relative),original=fs.readFileSync(target);fs.writeFileSync(target,mutate(Buffer.from(original)));
    assert.equal(compare(old.publication,next.publication,scratchOwners),null,name);fs.writeFileSync(target,original);}
  assert.ok(compare());assert.deepEqual([JSON.stringify(old.publication),JSON.stringify(next.publication)],before);
  t.diagnostic(JSON.stringify({historicalMemberBytes:oldBytes.length,currentMemberBytes:currentBytes.length,
    consumedBytes:oldSpan.length,spanDigest:p.sha256Bytes(oldSpan),meaningDigest:forward.meaningDigest,
    lowerPremises:'ABG causal install/lock availability controlled; actual09/14 manifest publication/inventory/member/span reads genuine',
    exclusions:'No actual covered Source admission, current-use first-null attribution, installed continuation/native or behavior-equivalence credit'}));
});

// Complete original declaration/verified asset values are retained inputs.
// Current physical environment, occurrence and witnessed cover lookups in the
// following component proof are explicitly controlled premises. They do not
// establish an installed transition, an admitted DataMapper Run or UAT success.
function captured(source){
  if(source==='completed'){assert.equal(completedFixtureGate.kind,'present','the frozen bounded fixture resolves through its gate');return JSON.parse(completedFixtureGate.inputs.fixture.bytes.toString('utf8'));}
  assert.equal(fixtureGate.kind,'present','the frozen bounded fixture resolves through its gate');return JSON.parse(fixtureGate.inputs.fixture.bytes.toString('utf8'));
}
function eventsFixture(){const rows=[];return {rows,append(kind,payload,extra={}){
  const candidate={kind,payload,eventTime:'2026-10-09T01:00:00.000Z',aggregateType:'workspace',aggregateId:'workspace://covered-test',parentAggregateId:null,
    causationEventRefs:[],correlationId:'correlation://covered-test',workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'authority://covered-test',...extra};
  const row=eventOwner.projectRuntimeEventFromValidatedHistory(rows,candidate);rows.push(row);return row;
},prefix:()=>prefixOwner.selectValidatedRuntimeEventPrefix(freeze([...rows]))};}
function coordinate(rows){const physical=eventOwner.runtimeEventPhysicalPrefix(rows),body={kind:'durable_prefix_coordinate',schemaVersion:'5.0.0',eventLogRef:'file:///unopened/covered-component.events.jsonl',prefixLength:physical.byteLength,prefixDigest:physical.digest,storeIdentity:{device:0,inode:0,eventContractDigest:eventOwner.ROOT_EVENT_CONTRACT_DIGEST}};return freeze({...body,coordinateDigest:hash(body)});}
function invokeRow(f,fields){
  const body={invocationRef:'invocation://covered-test/'+f.rows.length,invocationDigest:hash(['invocation',f.rows.length]),invocationVariant:'direct',
    rawInputAdmissionRef:'raw://covered-test',rawInputDigest:hash('raw'),publicRequestAdmissionRef:'request://covered-test',publicRequestDigest:hash('request'),publicRequestInvocationRef:'public://covered-test/'+f.rows.length,
    workspaceId:'workspace://covered-test',workspaceBindingId:'binding://covered-test',workspaceBindingDigest:hash('binding'),catalogBasisRef:'catalog://covered-test',catalogBasisDigest:hash('catalog'),catalogViewId:'view://covered-test',catalogViewDigest:hash('view'),catalogApplicationRefs:[],catalogApplicationDigests:[],
    programRef:'program://covered-test',programDigest:hash('program'),catalogHandle:'graph://covered-test',graphFunctionRef:'graph://covered-test',graphFunctionDigest:hash('graph'),selectedDefinitionRef:'graph://covered-test',selectedDefinitionDigest:hash('definition'),gtlEntryCoordinate:{kind:'controlled-coordinate'},gtlEntryTerm:{kind:'controlled-term'},
    inputContractRef:p.governanceContract('state'),inputContractDigest:hash('input contract'),inputContractOwner:{owner:'input'},outputContractRef:p.governanceContract('state'),outputContractDigest:hash('output contract'),outputContractOwner:{owner:'output'},productExecutionResolutionRef:'resolution://covered-test',productExecutionResolutionDigest:hash('resolution'),programValidationRef:'validation://covered-test',programValidationDigest:hash('validation'),policyRef:'policy://covered-test',policyDigest:hash('policy'),capabilityGrants:[],capabilityGrantRefs:[],authorityRef:'authority://covered-test',authorityDigest:hash('authority'),actorRef:'actor://covered-test',publicStart:null,reentryBasis:null,sourceResultBasis:null,...fields};
  const admissionDigest=hash(body),admissionRef='invocation-admission://abiogenesis/'+admissionDigest.slice(7);
  // This component fixture supplies the Public definition/authority premise.
  // Project the same closed coordinate fields as the invoking owner; the full
  // InvocationAdmission body belongs only to its own event.
  const publicPayload={operationId:'abg.operation.run.invoke',memberKey:'invoke',definitionDigest:hash('controlled definition'),variant:body.invocationVariant};
  for(const key of ['invocationRef','invocationDigest','actorRef','authorityRef','authorityDigest','capabilityGrantRefs',
    'catalogApplicationRefs','catalogApplicationDigests','policyRef','policyDigest','workspaceBindingId','catalogBasisRef',
    'catalogBasisDigest','catalogViewId','programRef','catalogHandle','graphFunctionRef','selectedDefinitionRef',
    'selectedDefinitionDigest','programValidationRef','programValidationDigest','gtlEntryCoordinate','gtlEntryTerm']) publicPayload[key]=body[key];
  const common={aggregateId:body.workspaceBindingId,parentAggregateId:body.invocationRef};
  const operation=f.append('public_operation_admitted',publicPayload,{...common,basisId:body.authorityRef});
  const admission=f.append('invocation_admitted',{...body,invocationAdmissionRef:admissionRef,invocationAdmissionDigest:admissionDigest},{...common,basisId:admissionRef,causationEventRefs:[operation.eventId]});
  return {operation,admission,body};
}
async function coveredFixture(t,fixtureSource){
  const c=captured(fixtureSource),name=fixtureSource==='completed'?'completed-work':'covered-use';
  // The retained captured declarations are recorded history. Offered as new
  // work, the current register refuses them: the captured Catalog basis, its
  // same binding transition, and the strict declaration reconstruction. They
  // are never rewritten, and recorded reconstruction is not used for new work.
  const donor={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:c.oldCatalog,catalogView:c.oldView};
  const donorStrict={catalog:outcome(()=>p.admitGraphFunctionCatalog(c.oldCatalog.readinessBasis)),
    transition:outcome(()=>p.admitGraphFunctionCatalog(reboundReadiness(c.oldCatalog.readinessBasis))),
    reconstruction:outcome(()=>decl.reconstructHistoricalDeclarationCatalog(donor,c.oldCatalog.readinessBasis))};
  retainCandidate(name+'-donor-new-work',{donorIdentity:{catalogBasisDigest:c.oldCatalog?.basisDigest??null,catalogViewDigest:c.oldView?.viewDigest??null},
    donorStrict:{catalog:outcomeIdentity(donorStrict.catalog),transition:outcomeIdentity(donorStrict.transition),reconstruction:outcomeIdentity(donorStrict.reconstruction)}});
  // The current positive: the actual installed current-register readiness basis
  // (verified Products, lock, workspace binding candidate, installs and the
  // canonical governance publications), admitted here by the Product Catalog
  // owner under the strict question; the CatalogView is the default Program's
  // callable membership, as the default-library Runs select it.
  const {install}=await governanceInstall();
  const env=await openCaseEnvironment(t,install,{workspaceProductIndex:1,additionalCorePublicationConstructors:governanceConstructors});
  const readiness=clone(env.catalog.readinessBasis),programRef=p.governanceRef('program','default');
  const oldCatalog=p.admitGraphFunctionCatalog(readiness);
  const program=oldCatalog.boundPublications?.flatMap(x=>x.programs??[]).find(x=>x.programRef===programRef);
  const allowlist=program===undefined?[]:[...program.callableMembership].sort();
  const oldView=oldCatalog.kind==='graph_function_catalog'?p.narrowGraphFunctionCatalog(oldCatalog,allowlist):oldCatalog;
  // This controlled binding transition has the same A/root and installed
  // meaning. Catalog construction is genuine; witness/environment membership
  // is supplied below rather than invented by a path or copied source state.
  const nextReady=reboundReadiness(oldCatalog.readinessBasis??readiness);
  const nextCatalog=p.admitGraphFunctionCatalog(nextReady);
  const nextView=nextCatalog.kind==='graph_function_catalog'?p.narrowGraphFunctionCatalog(nextCatalog,allowlist):nextCatalog;
  retainCandidate(name+'-declarations',{current:{programRef,allowlist,historical:{catalog:catalogIdentity(oldCatalog),catalogView:catalogIdentity(oldView)},
      transitioned:{catalog:catalogIdentity(nextCatalog),catalogView:catalogIdentity(nextView)}}});
  for(const [which,refused]of [['captured Catalog',donorStrict.catalog],['captured transition',donorStrict.transition]]){
    assert.equal(refused.kind,'returned',which+' '+JSON.stringify(outcomeIdentity(refused)).slice(0,4000));
    assert.equal(refused.value.kind,'catalog_construction_refusal',which+' '+JSON.stringify(outcomeIdentity(refused)).slice(0,4000));
    assert.equal(refused.value.disposition,'refused',which);
  }
  assert.equal(donorStrict.reconstruction.kind,'thrown',JSON.stringify(outcomeIdentity(donorStrict.reconstruction)).slice(0,4000));
  assert.equal(donorStrict.reconstruction.name,'TypeError');
  assert.equal(oldCatalog.kind,'graph_function_catalog',JSON.stringify(catalogIdentity(oldCatalog)).slice(0,4000));
  assert.ok(program,'select the actual current default governance Program');
  assert.equal(oldView.kind,'graph_function_catalog_view',JSON.stringify(oldView).slice(0,4000));
  assert.notEqual(oldCatalog.basisDigest,c.oldCatalog.basisDigest,'the current positive is not the captured donor');
  assert.equal(nextCatalog.kind,'graph_function_catalog',JSON.stringify(catalogIdentity(nextCatalog)).slice(0,4000));
  assert.equal(nextView.kind,'graph_function_catalog_view');
  assert.notEqual(nextCatalog.basisDigest,oldCatalog.basisDigest,'the binding transition is a distinct current Catalog basis');
  // The historical declaration is the portable plain carrier, as a retained
  // declaration is; the strict owner reconstructs it cold from its own basis.
  const old={kind:'abg_historical_declaration_proof',schemaVersion:'5.0.0',catalog:clone(oldCatalog),catalogView:clone(oldView)};
  const oldCandidate=old.catalog.readinessBasis.workspaceBinding;
  const current={kind:old.kind,schemaVersion:old.schemaVersion,catalog:nextCatalog,catalogView:nextView};
  const oldW={...oldCandidate,kind:'workspace_binding',admissionEventRef:'event://old-binding'},newW={...nextReady.workspaceBinding,kind:'workspace_binding',admissionEventRef:'event://new-binding'};
  const gf=oldCatalog.boundPublications.flatMap(x=>x.graphFunctions).find(g=>g.name===program.starts[0].graphFunctionRef);assert.ok(gf);
  const closure=decl.resolveExecutionDeclarationClosure(old.catalog,old.catalogView,program.programRef,gf.name);assert.equal(closure.kind,'resolved_execution_declaration_closure');
  const input=decl.selectExactClosureContract(closure,p.governanceContract('state')),output=decl.selectExactClosureContract(closure,p.governanceContract('state'));assert.ok(input&&output);
  const f=eventsFixture(),inv=invokeRow(f,{workspaceId:oldW.workspaceId,workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest,actorRef:oldW.authorizedActorRef,
    programRef:program.programRef,programDigest:hash(program),graphFunctionRef:gf.name,graphFunctionDigest:hash(gf),catalogBasisDigest:old.catalog.basisDigest,catalogViewDigest:old.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+old.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+old.catalogView.viewDigest.slice(7),
    inputContractDigest:hash(input.contract),inputContractOwner:input.owner,outputContractDigest:hash(output.contract),outputContractOwner:output.owner});
  const oldInvocation=truth.projectExactInvocationAdmissionAtPrefix(f.prefix(),inv.admission.payload.invocationAdmissionRef);assert.ok(oldInvocation,'actual complete cold invocation record');
  const runId='run://covered-source',graphCallId='graph-call://covered-source',frameId='frame://covered-source',basisRef='basis://covered-source';
  const run=f.append('run_segment_opened',{runId,runDigest:hash(runId),invocationAdmissionRef:oldInvocation.invocationAdmissionRef,invocationRef:oldInvocation.invocationRef,
    workspaceBindingId:oldW.bindingId,programRef:program.programRef,graphFunctionRef:gf.name,graphRef:gf.name,graphDigest:hash(gf.template),executionBasisRef:basisRef,executionBasisDigest:hash('controlled source basis')},
    {aggregateType:'run',aggregateId:runId,parentAggregateId:oldW.bindingId,scopeClass:'run',basisId:basisRef,runId,graphFunctionRef:gf.name,causationEventRefs:[inv.admission.eventId]});
  const callScope={aggregateType:'c_call',aggregateId:'c-call://covered-source',parentAggregateId:frameId,scopeClass:'run',basisId:basisRef,runId,graphCallId,frameId,graphFunctionRef:gf.name};
  const fibre=f.append('c_call_fibre_selected',{cCallRef:callScope.aggregateId,callClass:'leaf',regime:'F_D',armId:'arm://covered-source',implementationRef:p.governanceRef('implementation','fold')},
    {...callScope,causationEventRefs:[run.eventId]});
  const resultBody={cCallRef:callScope.aggregateId,resultClass:'success',contractRef:p.governanceContract('state'),valueKind:'governance_work_state',value:c.state34,valueDigest:hash(c.state34),evidenceRefs:[]};
  const result=f.append('c_call_result_admitted',{...resultBody,resultRef:'result://abiogenesis/'+hash(resultBody).slice(7),resultDigest:hash(resultBody)},
    {...callScope,causationEventRefs:[fibre.eventId]});
  const judgmentBody={cCallRef:callScope.aggregateId,contractRef:p.governanceContract('judgment'),judgment:'advance',retryAttemptRef:null,resultRef:result.payload.resultRef,resultDigest:result.payload.resultDigest};
  const judgment=f.append('c_call_judged',{...judgmentBody,judgmentRef:'judgment://abiogenesis/'+hash(judgmentBody).slice(7),judgmentDigest:hash(judgmentBody)},
    {...callScope,causationEventRefs:[result.eventId]});
  const {kind:sk,schemaVersion:sv,basisRef:sr,basisDigest:sd,...sourceBody}=c.sourceBasisPremise;
  Object.assign(sourceBody,{sourceInvocationAdmissionRef:oldInvocation.invocationAdmissionRef,sourceInvocationRef:oldInvocation.invocationRef,sourceWorkspaceId:oldW.workspaceId,
    sourceGraphCallId:graphCallId,sourceGraphFunctionRef:gf.name,sourceResultAdmissionEventRef:result.eventId,sourceResultJudgmentEventRef:judgment.eventId,sourceResultRef:result.payload.resultRef,sourceResultDigest:result.payload.resultDigest,
    sourceResultValueDigest:result.payload.valueDigest,sourceResultValue:c.state34,sourceCCallRef:result.aggregateId,sourceRunId:runId,workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest});
  const source={kind:sk,schemaVersion:sv,...sourceBody,basisDigest:hash(sourceBody),basisRef:'invocation-source-result://abiogenesis/'+hash(sourceBody).slice(7)};
  const oldBasis={basisRef,basisDigest:hash('controlled source basis'),invocationAdmissionRef:oldInvocation.invocationAdmissionRef,invocationRef:oldInvocation.invocationRef,
    workspaceBindingId:oldW.bindingId,workspaceBindingDigest:oldW.bindingDigest,catalogBasisDigest:old.catalog.basisDigest,catalogViewDigest:old.catalogView.viewDigest,graphFunctionRef:gf.name};
  const gates={cover:true,environment:true,install:true,artifact:true,reads:0};
  // Both ArtifactTruth and environment authentication are controlled lower
  // premises here; the actual closed-owner lifetime is proved separately.
  const controlledArtifactTruth=freeze({kind:'exact_prefix_artifact_truth_projection'});
  const environment=(w,proof)=>({kind:'exact_prefix_workspace_environment',workspaceBinding:w,workspaceBindingCandidate:proof.catalog.readinessBasis.workspaceBinding,resolvedProductLock:proof.catalog.readinessBasis.resolvedLock,
    productInstalls:proof.catalog.readinessBasis.installedProducts.map((candidate,index)=>({admissionEventRef:'install:'+w.bindingId+':'+index,candidate})),artifactTruth:{}});
  const oldEnv=environment(oldW,old),nextEnv=environment(newW,current);
  const overrides={'./artifact_truth.js':{projectOwnedPrefixArtifactTruth:()=>gates.artifact?controlledArtifactTruth:{kind:'exact_prefix_artifact_truth_projection_refusal'}},
    './environment_admission.js':{projectWorkspaceEnvironmentFromArtifactTruth:(artifact,id)=>{assert.strictEqual(artifact,controlledArtifactTruth);gates.reads++;return gates.environment?(id.ref===oldW.bindingId?oldEnv:nextEnv):{kind:'unavailable'};},projectAdmittedProductInstallByAdmissionEventRef:(_a,id)=>gates.install?[...oldEnv.productInstalls,...nextEnv.productInstalls].find(p=>p.admissionEventRef===id):null},
    './worksite_revision.js':{projectAdmittedWorkspaceBindingAtCoordinate:(_p,id,d)=>[oldW,newW].find(w=>w.bindingId===id&&w.bindingDigest===d)??null,projectWorksiteRevisionBindingCover:(_p,a,b,bases)=>gates.cover&&a.bindingId===oldW.bindingId&&b.bindingId===newW.bindingId&&bases.every(x=>x.basisRef===oldBasis.basisRef)?['event://controlled-cover']:null},
  };
  // The exact source execution lookup is a lower premise; retain the owning
  // invocation and complete Catalog/closure comparison implementation intact.
  const sourceFile=path.join(root,'abg/invocation_execution_truth.js');let text=fs.readFileSync(sourceFile,'utf8');
  text+='\nexport function __controlledExecutionLookup(fn) { __testExecutionLookup = fn; }\n';
  text=text.replace('export function projectExactExecutionBasisAtPrefix(', 'let __testExecutionLookup = null;\nexport function projectExactExecutionBasisAtPrefix(');
  const marker=text.indexOf('export function projectExactExecutionBasisAtPrefix('),brace=text.indexOf('{',marker);
  text=text.slice(0,brace+1)+'\nif (__testExecutionLookup !== null) return __testExecutionLookup(prefix, basisRef);'+text.slice(brace+1);
  const m=new SourceTextModule(text,{identifier:sourceFile});await m.link(async spec=>{const actual=await import(pathToFileURL(path.resolve(path.dirname(sourceFile),spec)).href),values={...actual,...overrides[spec]};return new SyntheticModule(Object.keys(values),function(){for(const[k,v]of Object.entries(values))this.setExport(k,v);});});await m.evaluate();
  const owner=m.namespace;owner.__controlledExecutionLookup((_p,id)=>id===oldBasis.basisRef?oldBasis:null);
  const inputUse={predecessorPrefix:coordinate(f.rows),source,workspaceBinding:newW,program,graphFunction:gf,currentDeclaration:current,historicalDeclarations:[old]};
  return {c,f,source,oldW,newW,old,current,program,gf,oldBasis,gates,owner,inputUse,result,judgment,oldInvocation,beforeRows:freeze([...f.rows]),donorStrict,name};
}

test('covered use binds exact original state, complete canonical Catalog and cold admitted coordinates',fixtureOptions,async t=>{
  const x=await coveredFixture(t),stateBytes=JSON.stringify(x.c.state34),sourceBytes=JSON.stringify(x.source),valueDigest=x.result.payload.valueDigest;
  const use=x.owner.projectGovernanceCoveredSourceUse(x.f.prefix(),x.inputUse);
  // The private comparison result carries no Catalog, lock or state bodies.
  retainCandidate(x.name+'-binds-exact-original-state',{use,sourceBasisDigest:x.source.basisDigest,sourceResultValueDigest:x.source.sourceResultValueDigest,
    historicalCatalog:catalogIdentity(x.old.catalog),currentCatalog:catalogIdentity(x.current.catalog)});
  assert.ok(use);
  assert.deepEqual(use.historicalDeclaration,terminal.constructAbgHistoricalDeclarationReference(x.old));assert.deepEqual(use.currentDeclaration,terminal.constructAbgHistoricalDeclarationReference(x.current));
  assert.equal(JSON.stringify(x.c.state34),stateBytes);assert.equal(JSON.stringify(x.source),sourceBytes);assert.equal(x.result.payload.valueDigest,valueDigest);
  assert.equal(use.sourceBasisDigest,x.source.basisDigest);assert.equal(use.declarationOwners.length,decl.resolveProgramDeclarationClosure(x.old.catalog,x.old.catalogView,x.program.programRef).publications.length);
  assert.ok(!Object.hasOwn(use,'readinessBasis'),'no Catalog/lock/state bodies in the private comparison result');
  const row=invokeRow(x.f,{workspaceId:x.newW.workspaceId,workspaceBindingId:x.newW.bindingId,workspaceBindingDigest:x.newW.bindingDigest,actorRef:x.newW.authorizedActorRef,
    programRef:x.program.programRef,programDigest:hash(x.program),graphFunctionRef:x.gf.name,graphFunctionDigest:hash(x.gf),catalogBasisDigest:x.current.catalog.basisDigest,catalogViewDigest:x.current.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+x.current.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+x.current.catalogView.viewDigest.slice(7),
    rawInputDigest:x.source.sourceResultValueDigest,sourceResultBasis:x.source});
  const invocation=x.owner.projectExactInvocationAdmissionAtPrefix(x.f.prefix(),row.admission.payload.invocationAdmissionRef);assert.ok(invocation);
  assert.equal(Object.hasOwn(row.admission.payload,'currentSourceUse'),false,'the existing event profile and invocation body remain unchanged');
  assert.equal(Object.hasOwn(invocation,'currentSourceUse'),false,'cold consumers do not depend on an extra admission field');
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),invocation),true);
  assert.deepEqual(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(x.f.prefix(),invocation,x.oldBasis),use.historicalDeclaration);
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),{...invocation,actorRef:'actor://foreign'}),false,'copied comparison cannot replace invocation identity');
  const cold=prefixOwner.selectValidatedRuntimeEventPrefix(freeze(clone(x.f.rows)));
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(cold,clone(invocation)),true,'cold exact admitted record, not object identity, is consumed');
  const coverWas=x.gates.cover;x.gates.cover=false;
  assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(cold,invocation),false,'a missing crossing cannot be replaced by the admitted state value');
  x.gates.cover=coverWas;
  assert.equal(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(cold,invocation,{...x.oldBasis,catalogViewDigest:hash('foreign View')}),null);
  assert.equal(x.owner.governanceHistoricalDeclarationReferenceAtPrefix(cold,invocation,{...x.oldBasis,invocationAdmissionRef:'invocation-admission://foreign'}),null);
  for(const gate of ['cover','environment','install']){x.gates[gate]=false;assert.equal(x.owner.projectGovernanceCoveredSourceUse(prefixOwner.selectValidatedRuntimeEventPrefix(x.beforeRows),x.inputUse),null,gate);x.gates[gate]=true;}
  const variants=[['Program',q=>q.program={...q.program,programRef:'program://foreign'}],['actor',q=>q.workspaceBinding={...q.workspaceBinding,authorizedActorRef:'actor://foreign'}],
    ['state',q=>q.source={...q.source,sourceResultValue:{...q.source.sourceResultValue,terminal:true}}],['source digest',q=>q.source={...q.source,sourceResultDigest:hash('forged')}],
    ['missing declarations',q=>q.historicalDeclarations=[]],['duplicate declarations',q=>q.historicalDeclarations=[x.old,x.old]],['foreign View',q=>q.currentDeclaration={...x.current,catalogView:{...x.current.catalogView,viewDigest:hash('foreign')}}],
    ['wrong prefix',q=>q.predecessorPrefix={...q.predecessorPrefix,prefixDigest:hash('wrong')}]];
  const before=prefixOwner.selectValidatedRuntimeEventPrefix(x.beforeRows);
  for(const[name,alter]of variants){const input={...x.inputUse};alter(input);assert.equal(x.owner.projectGovernanceCoveredSourceUse(before,input),null,name);}
  t.diagnostic(JSON.stringify({controlledPremises:['environment/install membership','execution source lookup','witnessed cover'],actualStateObservations:34,historicalStateDigest:valueDigest,
    privateComparisonBytes:Buffer.byteLength(JSON.stringify(use)),extraAdmissionBytes:0,owners:use.declarationOwners.map(o=>({moduleRef:o.moduleRef,historicalPublicationDigest:o.historicalPublicationDigest,currentPublicationDigest:o.currentPublicationDigest})),installedContinuation:false}));
});

test('later completed work follows actual admitted covered-source ancestry without root or value guesses',completedFixtureOptions,async t=>{
  const x=await coveredFixture(t,'completed');
  const replay={runId:x.result.runId,runtimeStatus:'blocked',runClosedEventRef:null,runStoppedEventRef:'event://controlled-source-stop',runtimeFailureEventRef:null,
    replayRef:'replay://controlled-source',replayDigest:hash('controlled semantic replay'),actorProcesses:[],cCalls:[{
      cCallRef:x.result.aggregateId,status:'judged',judgment:'advance',judgmentRef:x.judgment.payload.judgmentRef,
      resultRef:x.result.payload.resultRef,resultDigest:x.result.payload.resultDigest,resultContractRef:p.governanceContract('state'),resultClass:'success',resultValue:x.c.state34}]};
  // Replay is a disclosed lower premise. The production source derivation,
  // existing complete admitted-record guards, ancestry walk and later-progress
  // exclusion run unchanged. This does not authenticate a campaign producer.
  // The source derivation reads the replay owner's guard and its CCall row
  // (projectRuntimeReplayGuard, projectReplayCCallGuardAtPrefix; library design
  // §4.4, the replay state witness as sourceReplayDigest), so the premise is
  // supplied there.
  const admission=await moduleAt('abg/invocation_admission',{'./replay.js':{projectRuntimeReplayGuard:()=>replay,
    projectReplayCCallGuardAtPrefix:(_prefix,cCallRef)=>replay.cCalls.find(row=>row.cCallRef===cCallRef)},
    './invocation_execution_truth.js':{hasAdmittedGovernanceCoveredSourceUse:x.owner.hasAdmittedGovernanceCoveredSourceUse}});
  const selection={publicAuthorityDigest:x.oldInvocation.publicRequestDigest,runtimeInvocationRef:x.oldInvocation.invocationRef,
    invocationAdmissionRef:x.oldInvocation.invocationAdmissionRef,runId:x.result.runId,resultRef:x.result.payload.resultRef};
  const originalRows=clone(x.f.rows),derive=()=>admission.deriveInvocationSourceResultBasisAtPrefix(x.f.prefix(),selection);
  const initial=derive();
  // Identities only: the derived basis carries the retained captured34 state.
  retainCandidate(x.name+'-follows-admitted-ancestry',{initial:initial===null||initial===undefined?initial??null:{basisRef:initial.basisRef,basisDigest:initial.basisDigest,
    sourceResultRef:initial.sourceResultRef,sourceResultDigest:initial.sourceResultDigest,sourceResultValueDigest:initial.sourceResultValueDigest,
    stateMatches:JSON.stringify(initial.sourceResultValue)===JSON.stringify(x.c.state34)},
    historicalCatalog:catalogIdentity(x.old.catalog),currentCatalog:catalogIdentity(x.current.catalog)});
  assert.ok(initial);assert.deepEqual(initial.sourceResultValue,x.c.state34);
  const appendSuccessor=(linked=true)=>invokeRow(x.f,{workspaceId:x.newW.workspaceId,workspaceBindingId:x.newW.bindingId,workspaceBindingDigest:x.newW.bindingDigest,actorRef:x.newW.authorizedActorRef,
    programRef:x.program.programRef,programDigest:hash(x.program),graphFunctionRef:x.gf.name,graphFunctionDigest:hash(x.gf),catalogBasisDigest:x.current.catalog.basisDigest,catalogViewDigest:x.current.catalogView.viewDigest,
    catalogBasisRef:'graph-function-catalog://abiogenesis/'+x.current.catalog.basisDigest.slice(7),catalogViewId:'graph-function-catalog-view://abiogenesis/'+x.current.catalogView.viewDigest.slice(7),
    rawInputDigest:x.source.sourceResultValueDigest,sourceResultBasis:linked?x.source:null});
  const later=(successor,implementationRef,contractRef,value)=>{
    const scope={aggregateType:'c_call',aggregateId:'c-call://later-completed',parentAggregateId:'frame://later',scopeClass:'run',basisId:'basis://later',runId:'run://later',graphCallId:'graph-call://later',frameId:'frame://later',graphFunctionRef:x.gf.name};
    const basis=x.f.append('basis_admitted',{basisRef:scope.basisId,basisDigest:hash('controlled later basis'),basisClass:'root',rawInputValue:x.c.state34,
      invocationAdmissionRef:successor.admission.payload.invocationAdmissionRef},{aggregateId:x.newW.bindingId,basisId:scope.basisId,causationEventRefs:[successor.admission.eventId]});
    const fibre=x.f.append('c_call_fibre_selected',{cCallRef:scope.aggregateId,callClass:'leaf',regime:'F_D',armId:'arm://later',implementationRef},{...scope,causationEventRefs:[basis.eventId]});
    const body={cCallRef:scope.aggregateId,resultClass:'success',contractRef,value,valueDigest:hash(value),evidenceRefs:[]};
    x.f.append('c_call_result_admitted',{...body,resultRef:'result://abiogenesis/'+hash(body).slice(7),resultDigest:hash(body)},{...scope,causationEventRefs:[fibre.eventId]});
  };
  const linked=appendSuccessor();assert.equal(x.owner.hasAdmittedGovernanceCoveredSourceUse(x.f.prefix(),
    x.owner.projectExactInvocationAdmissionAtPrefix(x.f.prefix(),linked.admission.payload.invocationAdmissionRef)),true);
  assert.ok(derive(),'new admitted invocation and preparation do not manufacture completed progress');
  later(linked,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,p.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,{kind:'controlled_later_command_observation'});
  assert.equal(derive(),null,'a later complete C2 result across the actual covered-use ancestry cannot disappear');
  x.f.rows.splice(0,x.f.rows.length,...clone(originalRows));
  const foreign=appendSuccessor(false);later(foreign,p.WORKSITE_COMMAND_EXECUTION_IDS.implementationRef,p.WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef,{kind:'controlled_later_command_observation'});
  assert.ok(derive(),'same A/root/value without the admitted source link is not fabricated ancestry');
  x.f.rows.splice(0,x.f.rows.length,...clone(originalRows));
  const next=appendSuccessor(),progress=clone(x.c.state34),additional={...progress.observations[0],resultRef:'result://later-observation',resultDigest:hash('later-observation'),cCallRef:'c-call://later-observation'};
  progress.observations.push(additional);assert.ok(p.isGovernanceWorkState(progress));
  later(next,p.governanceRef('implementation','fold'),p.governanceContract('state'),progress);
  assert.equal(derive(),null,'a later state with completed additions also invalidates the older source');
  assert.deepEqual(initial.sourceResultValue,x.c.state34);assert.deepEqual(x.source.sourceResultValue,x.c.state34);
  t.diagnostic('Source derivation and actual admitted-coordinate ancestry exercised; semantic replay, environment/cover and later-result producer premises are controlled, with no native/current-app admission credit.');
});

test('built-in ingress preserves the whole captured34 state and independent assessment subject',fixtureOptions,async()=>{
  const c=captured(),s=c.state34;assert.ok(p.isGovernanceWorkState(s));assert.equal(s.observations.length,34);
  const builtin=(await load('product/builtin_semantics')).ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS,retained=p.retainedGovernanceWorkInput(s),original=JSON.stringify(s);
  const source={sourceResultContractRef:p.governanceContract('state'),sourceWorkspaceId:'workspace://same',workspaceBindingId:'binding://old',workspaceBindingDigest:hash('old'),sourceResultValue:s,basisRef:'source://same',basisDigest:hash('source')};
  const basis={input:retained,sourceResultBasis:source,workspaceId:'workspace://same',workspaceBindingId:'binding://new',workspaceBindingDigest:hash('new')};
  const use={sourceBasisRef:source.basisRef,sourceBasisDigest:source.basisDigest,currentWorkspaceBindingId:basis.workspaceBindingId,currentWorkspaceBindingDigest:basis.workspaceBindingDigest};
  assert.equal(builtin.validateInvocationBasis(basis),false);assert.equal(builtin.validateInvocationBasis({...basis,currentSourceUse:use}),false,'raw current-use record is not the owner handoff');
  assert.equal(builtin.validateInvocationBasis({...basis,currentSourceUse:()=>use}),true,'the callback is a private preparation premise; ABG separately rederives it');
  for(const altered of [{...basis,input:{...retained,observations:retained.observations.slice(1)}},{...basis,input:{...retained,original:{...retained.original,task:'rewritten'}}},
    {...basis,workspaceId:'workspace://foreign'},{...basis,currentSourceUse:()=>({...use,sourceBasisDigest:hash('foreign')})}])
    assert.equal(builtin.validateInvocationBasis({...altered,currentSourceUse:altered.currentSourceUse??(()=>use)}),false);
  assert.equal(JSON.stringify(s),original);assert.deepEqual(retained.original.assessment,s.original.assessment);assert.deepEqual(retained.observations,s.observations);
  assert.deepEqual(retained.original.testing,s.original.testing);assert.equal(retained.original.testing.selectedPaths.length,26);assert.equal(retained.original.testing.commands[0].expectedReports.length,8);
  assert.equal(retained.terminal,false);assert.deepEqual(retained.unresolvedSupportRefs,s.unresolvedSupportRefs);
});

const c14Frozen = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(c14Frozen); Object.freeze(v); } return v; };
const c14Row = (kind, eventId, admissionOrdinal, extra = {}) => c14Frozen({ kind, eventTime: '2026-07-21T00:00:00.000Z',
  aggregateType: 'workspace', aggregateId: 'workspace://c14', parentAggregateId: null, causationEventRefs: [],
  correlationId: 'correlation://c14', workflowVersion: '5.0.0', scopeClass: 'workspace', basisId: 'basis://c14', payload: {},
  eventId, admissionOrdinal, payloadDigest: `sha256:${'0'.repeat(64)}`, ...extra });

test('C-14: the invocation admission check refuses its one admission row by its causation; the owner answer stays null', async () => {
  const { selectValidatedRuntimeEventPrefix } = await import('../../build/code/src/abg/event_prefix.js');
  const { projectExactInvocationAdmissionAtPrefix } = await import('../../build/code/src/abg/invocation_execution_truth.js');
  const ref = 'invocation-admission://abiogenesis/' + '1'.repeat(64);
  const pub = c14Row('public_operation_admitted', 'event://c14/public', 1, { payload: { operationId: 'abg.operation.run.invoke' } });
  const other = c14Row('run_segment_opened', 'event://c14/other', 2);
  // Two causations, then one causation naming no public operation event.
  for (const causationEventRefs of [[pub.eventId, other.eventId], [other.eventId]]) {
    const admission = c14Row('invocation_admitted', 'event://c14/admission', 3, { causationEventRefs,
      payload: { invocationAdmissionRef: ref, invocationAdmissionDigest: 'sha256:' + '1'.repeat(64) } });
    const prefix = selectValidatedRuntimeEventPrefix(c14Frozen([pub, other, admission]));
    assert.equal(projectExactInvocationAdmissionAtPrefix(prefix, ref), null);
  }
});
