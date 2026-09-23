import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {loadTimeOwners,freshTimeFixture,timeFixtureCandidate,sourceTimeExpressions,evaluateTimeExpression,sha256,
  loadInvocationPairProducer}
  from '../support/t287-native-event-time.mjs';

const packageRoot=process.env.ABI5_EVENT_TIME_PACKAGE_ROOT??resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const proofRoot=process.env.ABI5_EVENT_TIME_PROOF_ROOT;
const owners=await loadTimeOwners(packageRoot);
const fixedTime='2000-01-01T00:00:00.000Z';

test('same real HoG basis constructor path reproduces the old seed bug and discriminates the repair',{
  skip:!process.env.ABI5_EVENT_TIME_BASELINE_ROOT,
},async context=>{
  const baseline=await import(pathToFileURL(join(process.env.ABI5_EVENT_TIME_BASELINE_ROOT,'build/code/src/hog/operator_support.js')));
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
  const input=Object.freeze({eventTime:fixedTime,correlationId:'correlation://event-time/discriminator'});
  const oldFirst=baseline.admissionBasis(input,'first'),newFirst=owners.hog.admissionBasis(input,'first');
  context.mock.timers.tick(154_000);
  const oldSecond=baseline.admissionBasis(input,'second'),newSecond=owners.hog.admissionBasis(input,'second');
  assert.deepEqual([oldFirst.eventTime,oldSecond.eventTime],[fixedTime,fixedTime]);
  assert.equal(Date.parse(newSecond.eventTime)-Date.parse(newFirst.eventTime),154_000);
  assert.equal(oldFirst.correlationId,newFirst.correlationId);
  assert.deepEqual(oldFirst.causationEventRefs,newFirst.causationEventRefs);
});

test('native HoG phase samples ignore caller seed; prepared candidate identity survives later admission and replay',async context=>{
  const fixture=await freshTimeFixture(context,owners,proofRoot);
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
  const request=Object.freeze({eventTime:fixedTime,correlationId:'correlation://event-time/request'});
  const requestBefore=JSON.stringify(request);
  const firstBasis=owners.hog.admissionBasis(request,'author-return');
  assert.equal(firstBasis.eventTime,'2030-01-01T00:00:00.000Z');
  const prepared=Object.freeze(timeFixtureCandidate(firstBasis.eventTime,1));
  const projected=owners.events.projectRuntimeEventFromValidatedHistory([],prepared);
  context.mock.timers.tick(412_000);
  const reprojected=owners.events.projectRuntimeEventFromValidatedHistory([],prepared);
  assert.deepEqual(reprojected,projected,'preflight never samples again');
  const admitted=owners.events.admitRuntimeEvent(fixture.store,prepared);
  assert.deepEqual(admitted,projected,'admission preserves the exact prepared event, not current wall time');
  assert.equal(admitted.eventTime,firstBasis.eventTime);
  const secondBasis=owners.hog.admissionBasis(request,'evaluator-entry');
  assert.equal(secondBasis.eventTime,'2030-01-01T00:06:52.000Z');
  const second=owners.events.admitRuntimeEvent(fixture.store,timeFixtureCandidate(secondBasis.eventTime,2,[admitted.eventId]));
  assert.equal(second.admissionOrdinal,2);
  assert.equal(Date.parse(second.eventTime)-Date.parse(admitted.eventTime),412_000);
  assert.equal(JSON.stringify(request),requestBefore,'signed/request data is not rewritten');
  const bytes=await readFile(fixture.eventLogPath),historical=owners.events.validateHistoricalEvents(bytes);
  assert.deepEqual(historical,fixture.store.readAll());
  const prefix=owners.prefix.selectValidatedRuntimeEventPrefix(historical);
  const calculus=owners.calculus.deriveRuntimeEventCalculusProjection(prefix);
  const replay=owners.replay.replayValidatedRuntimeEventPrefix(prefix);
  context.mock.timers.tick(1_000_000);
  assert.deepEqual(owners.events.validateHistoricalEvents(bytes),historical);
  assert.deepEqual(owners.calculus.deriveRuntimeEventCalculusProjection(prefix),calculus);
  assert.deepEqual(owners.replay.replayValidatedRuntimeEventPrefix(prefix),replay);
  assert.deepEqual(await readFile(fixture.eventLogPath),bytes);
  await writeFile(join(proofRoot,'native-phase-samples.json'),JSON.stringify({kind:'controlled_component_clock_proof',
    publicCalls:0,nativeActors:0,installedRun:false,firstBasis,secondBasis,eventIds:[admitted.eventId,second.eventId],
    historicalSha256:sha256(bytes),preparedAdmissionEqual:true,replayClockIndependent:true},null,2)+'\n');
});

test('wall-clock rollback does not change store ordinal ordering or restamp historical bytes on lawful fresh-fixture reopen',async context=>{
  const fixture=await freshTimeFixture(context,owners,proofRoot);
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
  const first=owners.events.admitRuntimeEvent(fixture.store,timeFixtureCandidate(owners.clock.sampleNativeEventTime(),1));
  context.mock.timers.setTime(Date.parse('2020-01-01T00:00:00.000Z'));
  const second=owners.events.admitRuntimeEvent(fixture.store,timeFixtureCandidate(owners.clock.sampleNativeEventTime(),2,[first.eventId]));
  assert.ok(second.eventTime<first.eventTime);
  assert.deepEqual(fixture.store.readAll().map(e=>e.admissionOrdinal),[1,2]);
  const bytes=await readFile(fixture.eventLogPath);
  const handoff=fixture.store.projectReopenAuthorityAndClose();
  const reopened=owners.events.reopenEventStore(handoff.reopenAuthority);
  assert.equal(reopened.kind,'reopened_event_store_context',JSON.stringify(reopened));
  context.after(()=>reopened.store.closeDurableLog());
  assert.deepEqual(reopened.store.readAll(),[first,second]);
  assert.deepEqual(await readFile(fixture.eventLogPath),bytes);
  const third=owners.events.admitRuntimeEvent(reopened.store,timeFixtureCandidate(fixedTime,3,[second.eventId]));
  assert.equal(third.eventTime,fixedTime,'explicit deterministic candidate values still work');
  assert.equal(third.admissionOrdinal,3);
});

test('complete selected native producer field coverage samples each phase; planned candidates and probe aliases retain their sample',async context=>{
  assert.ok(proofRoot,'explicit proof territory required');
  const rows=await sourceTimeExpressions(packageRoot);
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
  const observations=[];
  for(const row of rows) {
    const before=owners.clock.sampleNativeEventTime();
    const first=evaluateTimeExpression(row,owners.clock,fixedTime);
    context.mock.timers.tick(1000);
    const second=evaluateTimeExpression(row,owners.clock,fixedTime);
    if(row.expression==='sampleNativeEventTime()') {
      assert.equal(first,before,`${row.path}:${row.line}`);
      assert.equal(Date.parse(second)-Date.parse(first),1000,`${row.path}:${row.line}`);
      assert.notEqual(first,fixedTime);
    }else assert.deepEqual([first,second],[fixedTime,fixedTime],'plans, aliases and captured pair fields retain their fixed sample');
    observations.push({...row,first,second});
  }
  await writeFile(join(proofRoot,'producer-coverage.json'),JSON.stringify({kind:'source_field_component_proof',
    wholeOwnerExecution:false,directSamplingFields:39,sharedNativeSamples:1,sharedNativeFields:2,
    preservedPlanFields:6,preservedAliasFields:1,observations},null,2)+'\n');
});

test('exact paired admission producer preserves recognition across forced clock movement; unequal-time baseline remains rejected',async context=>{
  assert.ok(process.env.ABI5_EVENT_TIME_PAIRED_BASELINE_ROOT,'exact rejected paired producer required');
  const bytes=await readFile(process.env.ABI5_EVENT_TIME_HISTORY_PATH);
  assert.equal(sha256(bytes),process.env.ABI5_EVENT_TIME_HISTORY_SHA256);
  const original=owners.events.validateHistoricalEvents(bytes).slice(0,5);
  assert.equal(original[3].kind,'public_operation_admitted');
  assert.equal(original[4].kind,'invocation_admitted');
  const load=name=>import(pathToFileURL(join(packageRoot,'build/code/src',name+'.js')));
  const [truth,invocation]=await Promise.all([load('abg/invocation_execution_truth'),load('abg/invocation_admission')]);
  const admissionBody=structuredClone(original[4].payload);
  delete admissionBody.invocationAdmissionRef;delete admissionBody.invocationAdmissionDigest;
  const oldPublic=original[3],p=oldPublic.payload;
  const bodyBefore=JSON.stringify(admissionBody);
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2030-01-01T00:00:00.000Z')});
  const observations=[];
  for(const repaired of [false,true])for(const deltaMs of [0,1,-1]) {
    const fixture=await freshTimeFixture(context,owners,proofRoot);
    const input={artifactTruth:{prefix:owners.events.selectHeldEventStoreDurablePrefix(fixture.store)},
      workspaceBinding:{bindingId:admissionBody.workspaceBindingId},
      invocation:{invocationRef:p.invocationRef,invocationDigest:p.invocationDigest,variant:p.variant},
      authority:{actorRef:p.actorRef,authorityRef:p.authorityRef,authorityDigest:p.authorityDigest},
      capabilityGrants:admissionBody.capabilityGrants,policy:{policyRef:p.policyRef,policyDigest:p.policyDigest},
      catalogView:{viewDigest:admissionBody.catalogViewDigest},program:{programRef:p.programRef},
      graphFunction:{name:p.graphFunctionRef}};
    const basis={memberKey:p.memberKey,definitionDigest:p.definitionDigest,eventTime:fixedTime,
      correlationId:oldPublic.correlationId,causationEventRefs:[]};
    let crossed=false;
    const producer=await loadInvocationPairProducer(repaired?packageRoot:process.env.ABI5_EVENT_TIME_PAIRED_BASELINE_ROOT,
      owners,event=>{if(event.kind==='public_operation_admitted'){
        context.mock.timers.setTime(Date.parse('2030-01-01T00:00:00.000Z')+deltaMs);crossed=true;
      }});
    context.mock.timers.setTime(Date.parse('2030-01-01T00:00:00.000Z'));
    const receipt=producer.run(fixture.store,input,basis,admissionBody);
    assert.equal(receipt.kind,'invocation_admission_receipt');assert.equal(crossed,true);
    const admitted=fixture.store.readAll(),first=admitted[0],second=admitted[1];
    assert.equal(admitted.length,2);
    assert.deepEqual(owners.events.validateHistoricalEvents(await readFile(fixture.eventLogPath)),admitted);
    const selected=owners.prefix.selectValidatedRuntimeEventPrefix(admitted);
    const recognized=invocation.hasAdmittedInvocationAtPrefix(selected,receipt.admission);
    const reconstructed=truth.projectExactInvocationAdmissionAtPrefix(selected,receipt.admission.invocationAdmissionRef);
    assert.equal(recognized,repaired||deltaMs===0);
    if(repaired||deltaMs===0)assert.deepEqual(reconstructed,receipt.admission);
    else assert.equal(reconstructed,null);
    assert.equal(first.eventTime,'2030-01-01T00:00:00.000Z');
    assert.equal(Date.parse(second.eventTime)-Date.parse(first.eventTime),repaired?0:deltaMs);
    assert.equal(basis.eventTime,fixedTime,'caller seed is not rewritten or borrowed');
    context.mock.timers.setTime(Date.parse('2099-01-01T00:00:00.000Z'));
    assert.equal(invocation.hasAdmittedInvocationAtPrefix(selected,receipt.admission),recognized,'consumer remains clock independent');
    observations.push({repaired,deltaMs,compiledTailSha256:producer.compiledTailSha256,
      eventTimes:[first.eventTime,second.eventTime],eventIds:[first.eventId,second.eventId],
      ordinals:[first.admissionOrdinal,second.admissionOrdinal],canonicalHistoryValid:true,exactInvocationRecognized:recognized});
    fixture.store.closeDurableLog();
  }
  assert.equal(JSON.stringify(admissionBody),bodyBefore);
  assert.deepEqual(await readFile(process.env.ABI5_EVENT_TIME_HISTORY_PATH),bytes);
  await writeFile(join(proofRoot,'paired-admission-proof.json'),JSON.stringify({
    kind:'exact_compiled_pair_producer_complete_truth_consumer',completePairProducerExecution:true,
    completeTruthConsumerExecution:true,outerAdmissionValidation:false,publicCalls:0,installedRun:false,
    clockMovesAfterFirstActualAdmission:true,observations},null,2)+'\n');
});

test('retained historical identity is unchanged; no wall clock is read by the historical event projector',{
  skip:!process.env.ABI5_EVENT_TIME_HISTORY_PATH,
},async context=>{
  const path=process.env.ABI5_EVENT_TIME_HISTORY_PATH,bytes=await readFile(path);
  assert.equal(sha256(bytes),process.env.ABI5_EVENT_TIME_HISTORY_SHA256);
  const rows=owners.events.validateHistoricalEvents(bytes);
  assert.equal(rows.length,388);
  assert.deepEqual([...new Set(rows.map(e=>e.eventTime))],['2026-09-15T04:00:00.000Z']);
  context.mock.timers.enable({apis:['Date'],now:Date.parse('2099-01-01T00:00:00.000Z')});
  assert.deepEqual(owners.events.validateHistoricalEvents(bytes),rows);
  assert.equal(sha256(await readFile(path)),process.env.ABI5_EVENT_TIME_HISTORY_SHA256);
});
