import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../support/root-installed-environment.mjs';
import {constructInstalledStartCall} from '../support/registered-graph-selection.mjs';
import {prepareLanguageSmokeFixture,constructLanguageTestInput} from '../support/language-smoke-fixture.mjs';
import {loadOwnedCallReferenceProbes} from '../support/owned-call-reference.mjs';

const packageRoot=resolve(dirname(fileURLToPath(import.meta.url)),'../..');

// RC8 REF-01 (§10.11): the real constructor, native transport, static binder
// and run owner over one held installed session. Only the observation-only
// counters and the weak preparation probe are read from outside.
test('RC8 REF-01: constructed canonical calls and setup Catalog/view reach the run owner by reference from the first call; canonical outputs, refusals and copies keep their admission',{timeout:500_000},async t=>{
  const env=await setupInstalledRootCatalog(t,packageRoot,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,
    prepareAdditionalProducts:async basis=>[await prepareLanguageSmokeFixture(basis)]});
  const {installedRoot,product}=env,hash=product.sha256Canonical;
  const load=name=>import(pathToFileURL(join(installedRoot,'build/code/src',name+'.js')).href);
  const [abg,publicApi,immutable,sources,worker,transportContracts]=await Promise.all(['abg/index','public/index','shared/immutable',
    'public/binding/owner_contract_source_set','abg/worker_transport','abg/transport_contracts'].map(load));
  const probes=await loadOwnedCallReferenceProbes(installedRoot);
  const setupHandoff=env.store.projectReopenAuthorityAndClose();
  const acquired=abg.acquireAbgEventResource({kind:'reopen_abg_event_resource',schemaVersion:'5.0.0',closeHandoff:setupHandoff,handoffDigest:hash(setupHandoff)});
  assert.equal(acquired.kind,'acquired_abg_event_resource',JSON.stringify(acquired));
  let resource=acquired.resource,selection=abg.selectAcquiredAbgEventResource(resource,resource.entryPrefix);
  t.after(()=>{if(resource!==null)abg.abandonAbgEventResource(resource);});
  const run=async(label,call,entry)=>{
    const outcome=await publicApi.runInstalledDefinitionCallWithResource(entry,call);
    assert.equal(outcome.kind,'installed_definition_call_transport_result',label+': '+JSON.stringify(outcome).slice(0,3000));
    assert.equal(outcome.receipt.ownerOutput.outcomeKind,'result',label+': '+JSON.stringify(outcome.receipt.ownerOutput).slice(0,3000));
    assert.equal(outcome.receipt.resources.eventResource.kind,'abg_event_resource_completion',label+' borrows; it does not close');
    return outcome.receipt;};
  const zero=(label,delta,keys)=>{for(const [owner,key] of keys)assert.equal(delta[owner][key]??0,0,label+' '+owner+'.'+key+' '+JSON.stringify(delta));};
  const unchangedCatalog=[['catalog','fullAdmissions'],['catalog','viewConstructions'],['resolution','catalogComparisons'],['resolution','viewComparisons'],
    ['call','gated.catalog'],['call','gated.catalogView']];
  const carriedByReference=[...unchangedCatalog,['transport','detaches'],['transport','verifierReattachments'],['call','callAdmissions'],
    ['call','establishmentWalks'],['input','inputCopies']];
  const observations=[];
  // Absolute in-process counts at setup end, recorded apart from the deltas:
  // later zero deltas say nothing about how many admissions setup performed.
  const setupEnd=probes.snapshot(),setupAbsolute={catalogFullAdmissions:setupEnd.catalog.fullAdmissions,
    catalogViewConstructions:setupEnd.catalog.viewConstructions,productInputCopies:setupEnd.input.inputCopies};
  assert.ok(setupAbsolute.catalogFullAdmissions>=1,'setup admitted its Catalog in this process: '+JSON.stringify(setupAbsolute));
  assert.equal(probes.catalog.isAdmittedReadyGraphFunctionCatalog(env.catalog),true,'setup established the ready Catalog');
  assert.equal(probes.catalog.isAdmittedGraphFunctionCatalogView(env.catalogView),true,'setup established the view');

  // Repeated established calls; i=0 is the first post-setup call. The first
  // caller input is mutable: population admits it once into a detached value,
  // so its later change cannot reach the call.
  for(let i=0;i<3;i++){
    const identity='rc8-ref01-'+i,callerInput=i===0?{...constructLanguageTestInput('Shell')}:constructLanguageTestInput('Warm '+i);
    const w0=probes.snapshot();
    const {call}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,input:callerInput,identity});
    const w1=probes.snapshot(),construction=probes.delta(w0,w1);
    zero(identity+' construction',construction,unchangedCatalog);
    assert.equal(construction.call.callAdmissions,1,'construction admits the call once');
    assert.equal(construction.call.establishedInvocations,1,'construction establishes the invocation once');
    assert.equal(construction.call.establishmentWalks,1,'one deep-immutability walk, at construction');
    assert.equal(hash(call.invocation.request),call.invocation.requestDigest,'the constructed request is the value its digest names');
    assert.equal(construction.input.inputCopies,1,'new caller input is admitted once');
    assert.equal(probes.mechanics.isEstablishedDefinitionCall(call),true);
    assert.equal(immutable.isDeeplyFrozen(call.invocation),true,'the established invocation is deeply immutable');
    assert.equal(call.resources.catalog,env.catalog);assert.equal(call.resources.catalogView,env.catalogView);
    if(i===0){
      assert.notEqual(call.invocation.request.input.value,callerInput,'the caller value is detached at population');
      callerInput.subject='Mutated';
      assert.equal(call.invocation.request.input.value.subject,'Shell','a later caller change cannot reach the call');
    }
    const receipt=await run(identity,call,selection);
    const w2=probes.snapshot(),carried=probes.delta(w1,w2);
    zero(identity+' transport and owner',carried,carriedByReference);
    assert.equal(carried.transport.establishedCarries,1,'the transport carries the established call by reference');
    assert.ok(carried.call.resourceGates>=1&&carried.call.resourceMemberReuses>=2,
      'the binder gates the other members and takes Catalog and view by owner fact: '+JSON.stringify(carried.call));
    const subjects=probes.subjects();
    assert.equal(subjects.invocation,call.invocation,'the run owner prepares the constructed invocation');
    assert.equal(subjects.request,call.invocation.request,'the run owner request is the constructed request');
    // X2 constructor handoff: the nested payload the run owner hands to
    // Product input admission is the canonical constructor output, and that
    // owner reuses it by identity (its guard still runs) with no copy.
    assert.equal(subjects.input,call.invocation.request.input.value,'the run owner consumes the canonical nested payload');
    assert.equal(carried.input.inputReuses,1,'Product input admission reuses the constructor-established payload: '+JSON.stringify(carried.input));
    assert.equal(subjects.catalog,env.catalog,'the run owner Catalog is the setup Catalog');
    assert.equal(subjects.catalogView,env.catalogView,'the run owner view is the setup view');
    if(i===0)assert.equal(JSON.stringify(receipt.ownerOutput).includes('Mutated'),false,'the owner never saw the changed caller value');
    observations.push({identity,construction,carried});
    selection=receipt.resources.eventResource.successor;
  }

  // A copied shell is new data: it is detached and fully admitted, and the
  // run owner receives copies rather than the constructed objects.
  const {call:original}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,
    input:constructLanguageTestInput('Copied'),identity:'rc8-ref01-copied'});
  const copied={...original};
  assert.equal(probes.mechanics.isEstablishedDefinitionCall(copied),false,'a copied shell is not established');
  const c0=probes.snapshot(),copiedReceipt=await run('copied',copied,selection),copiedWork=probes.delta(c0,probes.snapshot());
  assert.equal(copiedWork.transport.detaches,1,'a copied call is detached');
  assert.ok(copiedWork.input.inputCopies>=1,'a detached payload is new data to the Product input owner: '+JSON.stringify(copiedWork.input));
  assert.ok(copiedWork.call.callAdmissions>=1,'a copied call is fully admitted: '+JSON.stringify(copiedWork.call));
  assert.ok(copiedWork.catalog.fullAdmissions>=1&&copiedWork.resolution.catalogComparisons>=1,'a copied Catalog takes full admission: '+JSON.stringify(copiedWork));
  assert.ok(copiedWork.call['gated.catalog']>=1&&copiedWork.call['gated.catalogView']>=1,'the binder gate observes a copied Catalog and view: '+JSON.stringify(copiedWork.call));
  const copiedSubjects=probes.subjects();
  assert.notEqual(copiedSubjects.invocation,original.invocation);assert.notEqual(copiedSubjects.catalog,env.catalog);
  observations.push({identity:'rc8-ref01-copied',carried:copiedWork});
  selection=copiedReceipt.resources.eventResource.successor;

  const declaration=sources.OWNER_CONTRACT_SOURCES.find(({packet})=>packet.definitionKey.operationId==='abg.operation.run.invoke'&&
    packet.definitionKey.memberKey==='start').declaration;

  // X1 defaulted start: a raw start without fhMode whose digests name the
  // default-applied request. Establishment keeps the canonical admission
  // output, and the real run owner receives that request.
  const {call:defaultedBase}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,
    input:constructLanguageTestInput('Defaulted'),identity:'rc8-ref01-defaulted'});
  assert.equal(defaultedBase.invocation.request.fhMode,'direct');
  const {fhMode:_fhMode,...rawRequest}=defaultedBase.invocation.request;
  const rawDefaulted=Object.freeze({invocation:{...defaultedBase.invocation,request:rawRequest},resources:defaultedBase.resources});
  const canonicalDefaulted=probes.mechanics.admitExactDefinitionCall({invocation:structuredClone(rawDefaulted.invocation),resources:defaultedBase.resources},declaration);
  assert.notEqual(canonicalDefaulted,null);assert.equal(canonicalDefaulted.request.fhMode,'direct');
  const established=probes.mechanics.establishExactDefinitionCall(rawDefaulted,declaration);
  assert.notEqual(established.invocation,rawDefaulted.invocation,'the raw invocation is not recorded');
  assert.equal(probes.mechanics.isEstablishedDefinitionCall(rawDefaulted),false);
  assert.equal(probes.mechanics.isEstablishedDefinitionCall(established),true);
  assert.equal(established.invocation.request.fhMode,'direct','establishment keeps the schema default');
  assert.equal(hash(established.invocation.request),established.invocation.requestDigest,'request and digest agree');
  assert.equal(hash(established.invocation),hash(canonicalDefaulted),'established output equals canonical admission');
  const d0=probes.snapshot(),defaultedReceipt=await run('defaulted',established,selection),defaultedWork=probes.delta(d0,probes.snapshot());
  // Established outside the constructor: the canonical invocation is carried
  // by reference, but its rebuilt payload was never handed to the Product
  // input owner, so that owner admits it once (raw ingress keeps admission).
  zero('defaulted',defaultedWork,carriedByReference.filter(([owner])=>owner!=='input'));
  assert.deepEqual([defaultedWork.input.inputCopies,defaultedWork.input.inputReuses],[1,0],
    'a payload not established by the constructor takes Product input admission: '+JSON.stringify(defaultedWork.input));
  const defaultedSubjects=probes.subjects();
  assert.equal(defaultedSubjects.input,established.invocation.request.input.value,'the run owner consumes the canonical payload');
  assert.equal(defaultedSubjects.invocation,established.invocation,'the run owner prepares the canonical invocation');
  assert.equal(defaultedSubjects.request,established.invocation.request,'the run owner request is the canonical request');
  assert.equal(defaultedSubjects.request.fhMode,'direct');
  assert.equal(hash(defaultedSubjects.request),defaultedSubjects.invocation.requestDigest);
  observations.push({identity:'rc8-ref01-defaulted',carried:defaultedWork});
  selection=defaultedReceipt.resources.eventResource.successor;

  // Frozen rebox: the recorded invocation and owned Catalog/view are reused;
  // a frozen structural copy of the Catalog earns no fact and takes the gate
  // and full Catalog admission.
  const {call:reboxBase}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,
    input:constructLanguageTestInput('Rebox'),identity:'rc8-ref01-rebox'});
  const rebox=Object.freeze({...reboxBase});
  assert.equal(probes.mechanics.isEstablishedDefinitionCall(rebox),true,'the fact belongs to the invocation, not the shell');
  const r0=probes.snapshot(),reboxReceipt=await run('rebox',rebox,selection),reboxWork=probes.delta(r0,probes.snapshot());
  zero('rebox',reboxWork,carriedByReference);
  assert.equal(probes.subjects().input,reboxBase.invocation.request.input.value,'the reboxed call keeps the established payload');
  assert.ok(reboxWork.call.resourceMemberReuses>=2,JSON.stringify(reboxWork.call));
  selection=reboxReceipt.resources.eventResource.successor;
  const {call:fakeBase}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,
    input:constructLanguageTestInput('Fake'),identity:'rc8-ref01-fake-catalog'});
  const fakeCatalog=immutable.deepFreeze(structuredClone(env.catalog));
  assert.equal(probes.catalog.isAdmittedReadyGraphFunctionCatalog(fakeCatalog),false,'a frozen copy earns no owner fact');
  const fake=Object.freeze({invocation:fakeBase.invocation,resources:Object.freeze({...fakeBase.resources,catalog:fakeCatalog})});
  const f0=probes.snapshot(),fakeReceipt=await run('fake-catalog',fake,selection),fakeWork=probes.delta(f0,probes.snapshot());
  assert.ok(fakeWork.call['gated.catalog']>=1&&(fakeWork.call['gated.catalogView']??0)===0&&fakeWork.call.resourceMemberReuses>=1,
    'the copied Catalog takes the binder gate; the owned view does not: '+JSON.stringify(fakeWork.call));
  assert.ok(fakeWork.catalog.fullAdmissions>=1&&fakeWork.resolution.catalogComparisons>=1,'a copied Catalog takes full admission: '+JSON.stringify(fakeWork));
  assert.notEqual(probes.subjects().catalog,env.catalog);
  observations.push({identity:'rc8-ref01-rebox',carried:reboxWork},{identity:'rc8-ref01-fake-catalog',carried:fakeWork});
  selection=fakeReceipt.resources.eventResource.successor;

  // X4 against canonical admitContract: a member transform and a schema
  // default survive with and without an owner-accepted member, on repeated
  // calls; a non-enumerable member refuses on every path.
  const fromInstalled=createRequire(join(installedRoot,'build/code/src/public/index.js'));
  const [Effect,v]=await Promise.all(['effect/Effect','valibot'].map(name=>import(pathToFileURL(fromInstalled.resolve(name)).href)));
  const [staticBindings,admit,effectDefinition]=await Promise.all(['public/binding/static_definition_bindings','shared/admit/index','shared/effect_definition'].map(load));
  const probeSchema=v.strictObject({kind:v.literal('probe'),t:v.pipe(v.strictObject({n:v.number()}),v.transform(value=>({n:value.n+1}))),
    d:v.optional(v.number(),7),catalog:v.custom(value=>typeof value==='object'&&value!==null)});
  let captured=null;
  const probeOwner=call=>{captured=call.resources;return Effect.fail(probes.mechanics.definitionFault(declaration.definitionKey,'probe','probe_owner_reached','probe'));};
  const receiptSchema=v.strictObject({kind:v.literal('probe_receipt')});
  const withFacts=staticBindings.bindStaticOwner(declaration,probeOwner,probeSchema,receiptSchema,{catalog:probes.catalog.isAdmittedReadyGraphFunctionCatalog});
  const withoutFacts=staticBindings.bindStaticOwner(declaration,probeOwner,probeSchema,receiptSchema);
  const probeCall=async(binding,resources)=>{captured=null;
    const receipt=await effectDefinition.runExactDefinition(reboxBase,binding(Object.freeze({invocation:reboxBase.invocation,resources})));
    return {code:receipt.failure?.fault?.code??null,resources:captured};};
  const frozenRaw=Object.freeze({kind:'probe',t:Object.freeze({n:1}),catalog:env.catalog});
  const canonicalProbe=admit.admitContract(probeSchema,frozenRaw);
  assert.equal(canonicalProbe.kind,'ok');assert.deepEqual([canonicalProbe.value.t,canonicalProbe.value.d],[{n:2},7]);
  for(const [label,binding] of [['owner fact',withFacts],['owner fact again',withFacts],['no table',withoutFacts]]){
    const outcome=await probeCall(binding,frozenRaw);
    assert.equal(outcome.code,'probe_owner_reached',label);
    assert.deepEqual(Object.keys(outcome.resources),Object.keys(canonicalProbe.value),label+': canonical key order and default keys');
    assert.deepEqual({...outcome.resources,catalog:null},{...canonicalProbe.value,catalog:null},label+': canonical transform and default');
    assert.equal(outcome.resources.catalog,env.catalog,label);
  }
  const g0=probes.snapshot();await probeCall(withFacts,frozenRaw);const probeWork=probes.delta(g0,probes.snapshot());
  assert.deepEqual([probeWork.call['gated.catalog']??0,probeWork.call['gated.t'],probeWork.call.resourceMemberReuses],[0,1,1],JSON.stringify(probeWork.call));
  const hidden={kind:'probe',catalog:env.catalog};Object.defineProperty(hidden,'t',{value:Object.freeze({n:1}),enumerable:false});Object.freeze(hidden);
  assert.equal(admit.admitContract(probeSchema,hidden).kind,'structural_refusal','canonical admission refuses a non-enumerable member');
  for(const [label,binding] of [['owner fact',withFacts],['no table',withoutFacts]]){
    const outcome=await probeCall(binding,hidden);
    assert.deepEqual([outcome.code,outcome.resources],['invalid_resource_assertion',null],label+': a non-enumerable member refuses');
  }
  // Shallow-frozen shell: deepFreeze stops at a frozen container, so a mutable
  // member survives it; establishment freezes through it once.
  const {call:base}=await constructInstalledStartCall({environment:env,publicApi,eventResource:selection,
    input:constructLanguageTestInput('Shell Base'),identity:'rc8-ref01-shell'});
  const shellOf=()=>Object.freeze({...base.invocation,request:{...base.invocation.request}});
  const naive=shellOf();immutable.deepFreeze(naive);
  assert.equal(Object.isFrozen(naive.request),false,'deepFreeze leaves the member under a frozen shell mutable');
  assert.equal(immutable.isDeeplyFrozen(naive),false);
  const shell=shellOf(),shellCall=Object.freeze({invocation:shell,resources:base.resources});
  assert.equal(probes.mechanics.isEstablishedDefinitionCall(shellCall),false);
  const establishedShell=probes.mechanics.establishExactDefinitionCall(shellCall,declaration);
  assert.notEqual(establishedShell,null);assert.equal(probes.mechanics.isEstablishedDefinitionCall(establishedShell),true);
  assert.equal(immutable.isDeeplyFrozen(establishedShell.invocation),true,'establishment freezes through the canonical output');
  assert.throws(()=>{establishedShell.invocation.request.extra=1;},TypeError);
  assert.equal(probes.mechanics.admitExactDefinitionCall(establishedShell,declaration),establishedShell.invocation,'an established invocation admits by identity');
  const clone=structuredClone(establishedShell.invocation),cloneAdmitted=probes.mechanics.admitExactDefinitionCall({invocation:clone,resources:base.resources},declaration);
  assert.notEqual(cloneAdmitted,null);assert.notEqual(cloneAdmitted,clone,'a copy of equal content takes full admission');

  // Worker plan copies (X6): a frozen shell with a mutable member is copied and
  // stays stable; a deeply frozen contract is reused by identity.
  const workerScratch=await mkdtemp(join(env.scratch,'rc8-ref01-worker-'));
  const known=structuredClone(transportContracts.constructKnownWorkerTransportContract('claude',{command:process.execPath,prefixArgs:[join(workerScratch,'absent-worker.mjs')]}));
  const prepare=(contract,label)=>worker.prepareWorkerTransport({contract,prompt:'assess',lane:'worker_executes',cwd:workerScratch,
    archiveRoot:join(workerScratch,'archive'),label,timeoutMs:10_000,environment:{}});
  const shellContract=Object.freeze({...known,argsTemplate:[...known.argsTemplate]});
  const k0=probes.snapshot(),shellPlan=await prepare(shellContract,'rc8-ref01-shell-contract'),shellWork=probes.delta(k0,probes.snapshot());
  assert.deepEqual([shellWork.worker.contractCopies,shellWork.worker.reuses],[1,0],'a shallow-frozen contract is copied');
  const shellArgs=[...shellPlan.args];shellContract.argsTemplate.push('--model','claude-fable-5-1');
  assert.deepEqual(shellPlan.args,shellArgs,'the prepared plan keeps its own arguments');
  const deep=immutable.deepFreeze(structuredClone(known));
  const k1=probes.snapshot(),deepOne=await prepare(deep,'rc8-ref01-deep-one'),deepTwo=await prepare(deep,'rc8-ref01-deep-two');
  const deepWork=probes.delta(k1,probes.snapshot());
  assert.deepEqual([deepWork.worker.contractCopies,deepWork.worker.reuses],[0,2],'a deeply frozen contract is reused by identity');
  assert.equal(deepOne.contractDigest,deepTwo.contractDigest);assert.equal(deepOne.contractDigest,shellPlan.contractDigest);

  const closed=abg.closeAbgEventResource(resource,selection.prefix);resource=null;
  assert.equal(closed.kind,'abg_event_resource_receipt');
  t.diagnostic('RC8_REF01_OBSERVATIONS '+JSON.stringify({setupAbsolute,observations,binderProbe:probeWork.call,shell:shellWork.worker,deep:deepWork.worker,
    limit:'Smallest installed language fixture in one test process; counters observe this process only; no performance claim.'}));
});
