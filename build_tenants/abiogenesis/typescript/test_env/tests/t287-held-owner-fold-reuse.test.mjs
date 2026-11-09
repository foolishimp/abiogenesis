import test from 'node:test';
import assert from 'node:assert/strict';
import {appendFile,mkdtemp} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {publicOperationBasis,setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {constructInstalledStartCall} from '../support/registered-graph-selection.mjs';
import {prepareLanguageSmokeFixture,constructLanguageTestInput} from '../support/language-smoke-fixture.mjs';

const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');

// RC9 OWN-01 (§10.12): the installed owners run; only their observation-only
// work counters are read from outside. Counts are this process's own.
test('RC9 OWN-01: owner folds over immutable rows and bytes are reused within their territory; changed, copied, earlier and cold inputs keep their checks and refusals',{timeout:500_000},async t=>{
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareLanguageSmokeFixture(basis)]});
  const {installedRoot,product,store,durablePrefix,admittedInstalls,admittedInstallResults,workspaceBinding,productSet,lock,scratch}=env;
  const hash=product.sha256Canonical;
  const load=name=>import(pathToFileURL(join(installedRoot,'build/code/src',name+'.js')).href);
  const [abg,publicApi,environmentOwner,basisOwner,prefixOwner,installOwner,semanticsOwner,worker,transportContracts,immutable]=await Promise.all([
    'abg/index','public/index','abg/environment_admission','abg/calculus/execution_basis_record','abg/event_prefix','product/install_product',
    'product/semantics','abg/worker_transport','abg/transport_contracts','shared/immutable'].map(load));
  const snapshot=()=>({environment:environmentOwner.observeWorkspaceEnvironmentWork(),basis:basisOwner.observeExecutionBasisRowWork(),
    install:installOwner.observeInstalledContentWork(),worker:worker.observeWorkerTransportCopyWork()});
  const delta=(from,to)=>Object.fromEntries(Object.keys(to).map(owner=>[owner,Object.fromEntries(Object.keys(to[owner]).map(k=>[k,to[owner][k]-from[owner][k]]))]));
  const observations={};
  const coordinate=Object.freeze({ref:workspaceBinding.bindingId,digest:workspaceBinding.bindingDigest});

  // O2: one invariant body per binding coordinate and artifact dependency
  // extent; each call returns a fresh wrapper naming the requested cut.
  const e0=snapshot(),first=abg.projectExactPrefixWorkspaceEnvironment(durablePrefix,coordinate);
  const e1=snapshot(),second=abg.projectExactPrefixWorkspaceEnvironment(durablePrefix,coordinate),e2=snapshot();
  assert.equal(first.kind,'exact_prefix_workspace_environment',JSON.stringify(first));
  assert.ok(delta(e0,e1).environment.environmentDerivations<=1,'the first projection derives at most once');
  assert.equal(delta(e1,e2).environment.environmentDerivations,0,'a repeated projection borrows the body');
  assert.deepEqual(second,first);assert.equal(Object.isFrozen(second),true);
  assert.strictEqual(second.prefix,durablePrefix,'the wrapper names the requested prefix');
  assert.strictEqual(second.productSet,first.productSet,'the invariant body is the same owner value');
  assert.deepEqual(second.workspaceBinding,workspaceBinding);assert.deepEqual(second.productSet,productSet);assert.deepEqual(second.resolvedProductLock,lock);
  // A copied artifact projection has no owner territory: it is validated and derived cold.
  const copiedTruth=structuredClone(first.artifactTruth),c0=snapshot();
  const copied=environmentOwner.projectWorkspaceEnvironmentFromArtifactTruth(copiedTruth,coordinate),c1=snapshot();
  assert.equal(copied.kind,'exact_prefix_workspace_environment');assert.equal(delta(c0,c1).environment.environmentDerivations,1,'a copy derives cold');
  assert.deepEqual(copied.productSet,first.productSet);assert.notStrictEqual(copied.productSet,first.productSet);
  // A raw forged projection is refused before any reuse.
  assert.equal(environmentOwner.projectWorkspaceEnvironmentFromArtifactTruth({...copiedTruth,rows:[]},coordinate).code,'artifact_truth_invalid');
  // An earlier cut lacking the binding keeps its refusal.
  assert.equal(abg.projectExactPrefixWorkspaceEnvironment(admittedInstallResults.at(-1).successorPrefix,coordinate).code,'workspace_binding_missing');

  // A relevant artifact admission (a sibling binding) changes the extent and rebuilds.
  const siblingManifest={workspaceId:'workspace://t287/own01/sibling',canonicalRoot:join(scratch,'workspace-own01-sibling'),
    authorityMode:'trusted_developer',authorizedActorRef:'actor://t287/own01/sibling'};
  const siblingAuthority=product.constructWorkspaceAuthorityBasis({...siblingManifest,authorityManifestRef:'manifest://t287/own01/sibling',
    authorityManifestDigest:hash(siblingManifest)});
  const siblingBinding=product.constructWorkspaceBinding(siblingAuthority,productSet,lock,
    Object.fromEntries(Object.entries(env.bindingCandidate.roots).map(([key,root])=>[key,join(root,'own01-sibling')])));
  assert.equal(siblingBinding.kind,'workspace_binding_candidate');
  const sibling=abg.admitWorkspaceBinding(store,siblingBinding,{...publicOperationBasis(product,'abg.operation.workspace.bind',
    siblingBinding.bindingId,siblingBinding.bindingDigest,'invocation://t287/own01/sibling-bind',admittedInstalls.map(i=>i.admissionEventRef)),
    predecessorPrefix:durablePrefix},siblingAuthority);
  assert.equal(sibling.kind,'artifact_owner_result',JSON.stringify(sibling).slice(0,2000));
  const r0=snapshot(),rebuilt=abg.projectExactPrefixWorkspaceEnvironment(sibling.successorPrefix,coordinate),r1=snapshot();
  const rebuiltAgain=abg.projectExactPrefixWorkspaceEnvironment(sibling.successorPrefix,coordinate),r2=snapshot();
  assert.equal(rebuilt.kind,'exact_prefix_workspace_environment');
  assert.equal(delta(r0,r1).environment.environmentDerivations,1,'a changed artifact extent derives again');
  assert.equal(delta(r1,r2).environment.environmentDerivations,0);
  assert.strictEqual(rebuilt.prefix,sibling.successorPrefix);assert.deepEqual(rebuilt.workspaceBinding,workspaceBinding);
  assert.notDeepEqual(rebuilt.artifactTruth,first.artifactTruth,'the wrapper carries the requested artifact truth');
  // Historical availability: the earlier cut still projects its own environment.
  const historical=abg.projectExactPrefixWorkspaceEnvironment(durablePrefix,coordinate);
  assert.deepEqual(historical,first);assert.strictEqual(historical.prefix,durablePrefix);
  observations.environment={first:delta(e0,e1).environment,copied:delta(c0,c1).environment,rebuilt:delta(r0,r1).environment};

  // Held installed Runs over the reopened current selection (the sibling
  // admission already advanced the setup prefix): unrelated appends, new
  // execution bases and physical install verification. Each Run's actual
  // returned successor selection is carried to the next Run.
  const setupHandoff=store.projectReopenAuthorityAndClose();
  const acquired=abg.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:setupHandoff,handoffDigest:hash(setupHandoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
  let resource=acquired.resource,selection=abg.selectAcquiredAbgEventResource(resource,resource.entryPrefix);
  t.after(()=>{if(resource!==null)abg.abandonAbgEventResource(resource);});
  observations.runs=[];
  for(let i=0;i<3;i++){
    const w0=snapshot();
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,input:constructLanguageTestInput('Fold '+i),identity:'rc9-own01-'+i});
    const outcome=await publicApi.runInstalledDefinitionCallWithResource(selection,call);
    assert.equal(outcome.kind,'installed_definition_call_transport_result',JSON.stringify(outcome).slice(0,3000));
    assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result',JSON.stringify(outcome.receipt.ownerOutput).slice(0,3000));
    assert.equal(outcome.receipt.resources.eventResource.kind,'abg_event_resource_completion','the Run borrows the held resource; it does not close it');
    const work=delta(w0,snapshot());observations.runs.push(work);
    // Every Run reads the install physically; no content fact is carried and
    // there is no zero-read claim.
    assert.ok(work.install.contentVerifications>=1&&work.install.fileHashes>=1,'each new call verifies its install physically: '+JSON.stringify(work.install));
    assert.ok(work.basis.rowAdmissions>=1,'a new execution basis is checked: '+JSON.stringify(work.basis));
    const successor=outcome.receipt.resources.eventResource.successor;
    assert.notStrictEqual(successor,selection,'the Run returns its successor selection');
    selection=successor;
  }

  // O1 over the held lineage after all three Runs completed (§10.12 O1
  // lifetime): no run operation scope is open, so each historical cut checks
  // the row cold with an equal record; completed historical identity is
  // intentionally not retained. Active-scope identity is LIFE-01's subject.
  // The Run returns a durable coordinate, not a calculus prefix: the prefix
  // owner issues the nominal owned prefix for it. The coordinate stays the
  // close coordinate.
  assert.equal(prefixOwner.isOwnedRuntimeEventPrefix(selection.prefix),false,'a durable coordinate is not a calculus prefix');
  const owned=prefixOwner.projectOwnedRuntimeEventPrefixAtDurablePrefix(selection.prefix);
  assert.equal(prefixOwner.isOwnedRuntimeEventPrefix(owned),true,'the prefix owner issues the owned cut of the held coordinate');
  const events=[...prefixOwner.runtimeEventBodiesAtPrefix(owned).materialize()];
  assert.equal(prefixOwner.runtimeEventPrefixExtent(owned).count,events.length);
  const basisEvents=events.filter(e=>e.kind==='basis_admitted');
  assert.ok(basisEvents.length>=3,'three Runs admitted their bases');
  const row=basisEvents[0],basisRef=row.payload.basisRef;
  const b0=snapshot(),through=prefixOwner.validatedRuntimeEventPrefixThroughEvent(owned,row.eventId);
  const atRow=basisOwner.projectExactExecutionBasisRecordAtPrefix(through,basisRef),b1=snapshot();
  const atLater=basisOwner.projectExactExecutionBasisRecordAtPrefix(owned,basisRef),b2=snapshot();
  assert.notEqual(atRow,null);assert.equal(atRow.basisRef,basisRef);assert.equal(atRow.admissionEventRef,row.eventId);
  assert.deepEqual(delta(b0,b1).basis,{rowAdmissions:1,bodyDigests:1},'the completed row is checked once at its cut');
  assert.deepEqual(delta(b1,b2).basis,{rowAdmissions:1,bodyDigests:1},'a later historical cut checks the completed row cold');
  assert.deepEqual(atLater,atRow,'cold equality holds');
  assert.notStrictEqual(atLater,atRow,'completed historical identity is not retained');
  // The earlier-cut interval ends after the projection it measures.
  const before=prefixOwner.validatedRuntimeEventPrefixBeforeEvent(owned,row.eventId);
  assert.equal(prefixOwner.runtimeEventPrefixExtent(before).count,row.admissionOrdinal-1,'the earlier cut ends just before the row');
  const atBefore=basisOwner.projectExactExecutionBasisRecordAtPrefix(before,basisRef),b3=snapshot();
  assert.equal(atBefore,null,'an earlier cut lacking the row has no basis');
  assert.deepEqual(delta(b2,b3).basis,{rowAdmissions:0,bodyDigests:0},'the earlier-cut projection does no row work');
  assert.equal(basisOwner.projectExactExecutionBasisRecordAtPrefix(owned,'execution-basis://abiogenesis/absent'),null);
  // A copied history has its own territory and checks cold, with an equal result.
  const copiedPrefix=prefixOwner.selectValidatedRuntimeEventPrefix(immutable.deepFreeze(structuredClone(events))),b4=snapshot();
  const copiedBasis=basisOwner.projectExactExecutionBasisRecordAtPrefix(copiedPrefix,basisRef),b5=snapshot();
  assert.deepEqual(copiedBasis,atRow);assert.deepEqual(delta(b4,b5).basis,{rowAdmissions:1,bodyDigests:1},'a copy is checked cold');
  // A changed row is refused by its own check; a refusal is never retained.
  // The cold owner contract admits a changed immutable snapshot (it checks
  // order, profile and causes, not payload digests), so the row law is reached:
  // a changed raw-input digest refuses at projection, before the body digest;
  // a changed basis digest passes projection and refuses at the body digest.
  const index=events.findIndex(e=>e.eventId===row.eventId);
  const changedRow=(field,value,label)=>{
    const changed=structuredClone(events);changed[index].payload[field]=value;
    const changedPrefix=prefixOwner.selectValidatedRuntimeEventPrefix(immutable.deepFreeze(changed));
    assert.equal(changedPrefix.kind,'validated_runtime_event_prefix',label+': the cold owner contract admits the changed snapshot');
    assert.equal(prefixOwner.isOwnedRuntimeEventPrefix(changedPrefix),false);
    const c0=snapshot(),refused=basisOwner.projectExactExecutionBasisRecordAtPrefix(changedPrefix,basisRef),c1=snapshot();
    const again=basisOwner.projectExactExecutionBasisRecordAtPrefix(changedPrefix,basisRef),c2=snapshot();
    assert.equal(refused,null,label+': the changed row is refused');assert.equal(again,null,label+': and refused again');
    return {path:'cold_prefix_admitted_row_law_refused',first:delta(c0,c1).basis,again:delta(c1,c2).basis};
  };
  const changedRawInput=changedRow('rawInputDigest','sha256:'+'0'.repeat(64),'raw input digest');
  assert.deepEqual([changedRawInput.first,changedRawInput.again],[{rowAdmissions:1,bodyDigests:0},{rowAdmissions:1,bodyDigests:0}],
    'the raw-input digest leg refuses each time; the refusal is not retained: '+JSON.stringify(changedRawInput));
  const changedBasisDigest=changedRow('basisDigest','sha256:'+'f'.repeat(64),'basis digest');
  assert.deepEqual([changedBasisDigest.first,changedBasisDigest.again],[{rowAdmissions:1,bodyDigests:1},{rowAdmissions:1,bodyDigests:1}],
    'the body digest leg refuses each time; the refusal is not retained: '+JSON.stringify(changedBasisDigest));
  // The held resource closes physically at the durable coordinate.
  const closed=abg.closeAbgEventResource(resource,selection.prefix);resource=null;
  assert.equal(closed.kind,'abg_event_resource_receipt');
  assert.equal(closed.closeHandoff.prefix.coordinateDigest,selection.prefix.coordinateDigest,'the close names the exact held coordinate');
  observations.prefix={source:'projectOwnedRuntimeEventPrefixAtDurablePrefix',kind:owned.kind,coordinateLength:selection.prefix.prefixLength,
    events:events.length,basisRows:basisEvents.length,row:row.admissionOrdinal};
  observations.basis={first:delta(b0,b1).basis,later:delta(b1,b2).basis,earlier:delta(b2,b3).basis,copied:delta(b4,b5).basis,
    changedRawInput,changedBasisDigest};
  observations.close={kind:closed.kind,closePrefixLength:closed.closeHandoff.prefix.prefixLength};

  // O4: a deeply frozen final contract is borrowed by the plan owner; command,
  // environment and prompt variations remain plan dependencies.
  const workerScratch=await mkdtemp(join(scratch,'rc9-own01-worker-'));
  const contractFor=(command,environment,extra)=>immutable.deepFreeze({...transportContracts.constructKnownWorkerTransportContract('claude',{command,environment}),
    ...(extra===undefined?{}:{argsTemplate:[...transportContracts.constructKnownWorkerTransportContract('claude',{command,environment}).argsTemplate,...extra]})});
  const prepare=(contract,label,environment={})=>worker.prepareWorkerTransport({contract,prompt:'assess',lane:'worker_executes',cwd:workerScratch,
    archiveRoot:join(workerScratch,'archive'),label,timeoutMs:10_000,environment});
  const frozen=contractFor(process.execPath,Object.freeze({}),['--tools','Read']);
  const k0=snapshot(),one=await prepare(frozen,'rc9-own01-one'),two=await prepare(frozen,'rc9-own01-two'),k1=snapshot();
  assert.deepEqual([delta(k0,k1).worker.contractCopies,delta(k0,k1).worker.reuses],[0,2],'the frozen final contract is borrowed');
  assert.equal(one.contractDigest,two.contractDigest);assert.deepEqual(one.args,two.args);
  const mutable={...frozen,argsTemplate:[...frozen.argsTemplate]},k2=snapshot(),copiedPlan=await prepare(mutable,'rc9-own01-mutable'),k3=snapshot();
  assert.equal(delta(k2,k3).worker.contractCopies,1,'a mutable contract is still copied');
  assert.equal(copiedPlan.contractDigest,one.contractDigest,'owner output is equivalent');assert.deepEqual(copiedPlan.args,one.args);
  mutable.argsTemplate.push('--model','claude-fable-5-1');assert.deepEqual(copiedPlan.args,one.args,'the prepared plan keeps its own arguments');
  const otherArgs=await prepare(contractFor(process.execPath,Object.freeze({}),['--tools','Read','--append-system-prompt','governed']),'rc9-own01-prompt');
  assert.notEqual(otherArgs.contractDigest,one.contractDigest,'a governed prompt is a genuine dependency');
  // Command and environment each vary alone: label, prompt, lane, paths and
  // every other request input equal those of `one`.
  const changedFields=plan=>Object.keys(one).filter(key=>!isDeepStrictEqual(one[key],plan[key])).sort();
  const otherCommand=await prepare(contractFor('/usr/bin/env',Object.freeze({}),['--tools','Read']),'rc9-own01-one');
  assert.deepEqual(Object.keys(otherCommand).sort(),Object.keys(one).sort());
  assert.deepEqual([one.command,otherCommand.command],[process.execPath,'/usr/bin/env'],'each plan carries its actual command');
  assert.deepEqual(changedFields(otherCommand),['command','contractDigest','planDigest'],'only the command and its digests differ');
  assert.notEqual(otherCommand.planDigest,one.planDigest,'the command is a genuine dependency');
  const otherEnvironment=await prepare(frozen,'rc9-own01-one',{PATH:'/usr/bin'});
  assert.deepEqual(changedFields(otherEnvironment),['environmentDigest','planDigest'],'only the environment digest and the plan digest differ');
  assert.notEqual(otherEnvironment.planDigest,one.planDigest,'the environment is a genuine dependency');
  observations.worker={frozen:delta(k0,k1).worker,mutable:delta(k2,k3).worker,
    command:changedFields(otherCommand),environment:changedFields(otherEnvironment)};

  // O3 refusal: public verification is physical every time, and a content
  // change in this disposable scratch install after verification is refused.
  const install=admittedInstalls.at(-1),v0=snapshot();
  assert.equal(await product.installedProductContentMatches(install),true);
  assert.equal(await product.installedProductContentMatches(install),true);
  const v1=snapshot(),verified=delta(v0,v1).install;
  assert.equal(verified.contentVerifications,2,'no content fact survives between public verifications');
  assert.ok(verified.lstats>0&&verified.lists>0&&verified.fileHashes>0&&verified.graphCarrierReads===2,JSON.stringify(verified));
  // O3 first consumer: an actual resolution acquires its install physically
  // for itself; its retained leaf semantics carry no content fact, so their
  // first consumer after a disposable content change verifies physically and
  // refuses, and a new resolution over the changed content is refused.
  const fixture=env.additionalProducts[0],verifyInstallAdmission=i=>abg.hasAdmittedProductInstall(env.artifactTruth,i);
  const resolve=()=>product.ProductExecutionResolutionPort.resolve({catalog:env.catalog,catalogView:env.catalogView,admittedInstalls,verifyInstallAdmission,
    programRef:fixture.ids.programRef,selection:{kind:'start',scope:'program',target:'next',until:'converged',rootMode:'direct'}});
  const a0=snapshot(),loaded=await resolve(),a1=snapshot();
  assert.equal(loaded.kind,'loaded_product_execution_resolution',JSON.stringify(loaded).slice(0,2000));
  assert.ok(delta(a0,a1).install.contentVerifications>=1,'the resolution acquires its install physically: '+JSON.stringify(delta(a0,a1).install));
  const leaf=semanticsOwner.inspectProductLeafSemanticsProjection(product.projectInstalledLeafSemantics(loaded.productSemantics));
  assert.notEqual(leaf,null,'the actual retained leaf semantics');
  const semanticsInstall=admittedInstalls.find(i=>i.installId===leaf.projection.installId);
  assert.ok(semanticsInstall!==undefined&&semanticsInstall.installedRoot.startsWith(scratch+'/'),'the semantics install is disposable scratch');
  await appendFile(join(semanticsInstall.installedRoot,'package.json'),'\n');
  const f0=snapshot();
  assert.equal(await leaf.runtime.verifyInstalledContent(),false,'the first consumer after a content change verifies physically and refuses');
  const f1=snapshot(),firstUse=delta(f0,f1).install;
  assert.equal(firstUse.contentVerifications,1,'the first consumer reads the install: '+JSON.stringify(firstUse));
  assert.ok(firstUse.lstats>0&&firstUse.fileHashes>0,'the first consumer hashes the installed payload: '+JSON.stringify(firstUse));
  assert.equal(await leaf.runtime.verifyInstalledContent(),false,'a later consumer also refuses');
  assert.equal(delta(f1,snapshot()).install.contentVerifications,1);
  const r3=snapshot(),refusedResolution=await resolve(),r4=snapshot();
  assert.equal(refusedResolution.kind,'product_execution_resolution_refusal','a new resolution over changed content is refused: '+JSON.stringify(refusedResolution).slice(0,2000));
  assert.ok(delta(r3,r4).install.contentVerifications>=1,'the refused resolution verified physically');
  observations.firstConsumer={acquisition:delta(a0,a1).install,firstUse,refusedResolution:{code:refusedResolution.code,stage:refusedResolution.stage}};
  await appendFile(join(install.installedRoot,'package.json'),'\n');
  assert.equal(await product.installedProductContentMatches(install),false,'changed content after verification is refused');
  observations.install=verified;
  t.diagnostic('RC9_OWN01_OBSERVATIONS '+JSON.stringify({...observations,
    limit:'Smallest installed language fixture in one test process; counters observe this process only; no performance claim.',
    unproved:['duplicate, foreign and rollback rows','the actual actor producer (the worker plan probe is synthetic)',
      'O3 retained verification reuse: physical verification stays at every consumer/effect boundary; no zero/once-per-resolution claim']}));
});
