// The inactivity lease over admitted activity contains a live process whatever
// the declared coverage; unknown coverage withholds only the no-progress
// classification. Samples are pure-test candidates, labelled as such: a live
// decision needs its admitted native observation.
import assert from 'node:assert/strict';
import test from 'node:test';
import { projectActorLivenessContext, deriveRuntimeLiveness, validateRuntimeLivenessEventAtPrefix } from '../../build/code/src/abg/runtime_liveness.js';
import { actorRuntimeProbeSources, constructRuntimeWatchdogPolicy, runtimeLivenessDigest as hash } from '../../build/code/src/abg/runtime_liveness_contracts.js';
import { ROOT_EVENT_CONTRACT_DIGEST } from '../../build/code/src/abg/event_store.js';
import { selectValidatedRuntimeEventPrefix, runtimeEventPrefixDigest } from '../../build/code/src/abg/event_prefix.js';
import { canonicalRecordDigest } from '../../build/code/src/shared/value/index.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';

const POLICY = constructRuntimeWatchdogPolicy({ startupMs: 1000, inactivityMs: 1000, hardCapMs: 5000, terminationGraceMs: 100 });

// One declared plain_text actor: its process start probes as the actor owner
// emits them, with `archive` and `result_artifact` declared unavailable unless
// `complete` observes their coverage too.
function declaredActor({ complete = false, startProbes = true } = {}) {
  const rows = [];
  const add = (kind, aggregateType, aggregateId, parentAggregateId, payload, causationEventRefs = []) => {
    const ordinal = rows.length + 1;
    const event = deepFreeze({ eventTime: '2026-11-11T00:00:00.000Z', correlationId: 'correlation://rc12/l2-inactivity',
      workflowVersion: '5.0.0', ...scope, kind, aggregateType, aggregateId, parentAggregateId, causationEventRefs, payload,
      eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST, eventId: `event://rc12/l2-inactivity/${ordinal}/${kind}`, admissionOrdinal: ordinal,
      payloadDigest: hash(payload) });
    rows.push(event);
    return event;
  };
  const rawInputValue = { kind: 'rc12_l2_inactivity_input', value: 1 };
  const basisBody = { programRef: 'program://rc12/l2-inactivity', graphFunctionRef: 'graph-function://rc12/l2-inactivity',
    invocationRef: 'invocation://rc12/l2-inactivity', rawInputValue, rawInputDigest: canonicalRecordDigest(rawInputValue) };
  const basisDigest = hash(basisBody), basisRef = `execution-basis://abiogenesis/${basisDigest.slice(7)}`;
  const scope = { scopeClass: 'workspace', basisId: basisRef };
  add('basis_admitted', 'workspace', 'workspace-binding://rc12/l2-inactivity', basisBody.invocationRef, { basisRef, basisDigest, ...basisBody });
  Object.assign(scope, { scopeClass: 'run', runId: 'run://rc12/l2-inactivity', graphCallId: 'graph-call://rc12/l2-inactivity',
    frameId: 'frame://rc12/l2-inactivity', graphFunctionRef: basisBody.graphFunctionRef });
  const cCall = 'c-call://rc12/l2-inactivity', processRef = 'process://rc12/l2-inactivity', parser = 'plain_text';
  const ids = { actorRef: 'actor://rc12/l2-inactivity', workerBindingRef: 'worker-binding://rc12/l2-inactivity',
    implementationRef: 'implementation://rc12/l2-inactivity', implementationBindingRef: 'implementation-binding://rc12/l2-inactivity',
    inputDigest: hash('input'), promptDigest: hash('prompt'), dispatchOrdinal: 1 };
  const opened = add('c_call_opened', 'c_call', cCall, scope.frameId, { cCallRef: cCall, attempt: 1,
    programLocusRef: 'locus://rc12/l2-inactivity', taskOrdinal: null, vectorIndex: null, edgeRef: null });
  const fibre = add('c_call_fibre_selected', 'c_call', cCall, scope.frameId, { cCallRef: cCall, callClass: 'leaf',
    regime: 'F_P', implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, [opened.eventId]);
  const attemptDigest = hash({ basisRef, cCallRef: cCall, attempt: 1, dispatchOrdinal: ids.dispatchOrdinal, actorRef: ids.actorRef,
    workerBindingRef: ids.workerBindingRef, implementationBindingRef: ids.implementationBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, promptDigest: ids.promptDigest });
  const transportPlanDigest = hash('transport-plan');
  const bindingBody = { cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef,
    implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef, inputDigest: ids.inputDigest,
    dispatchOrdinal: ids.dispatchOrdinal, timeoutMs: POLICY.inactivityMs, absoluteTimeoutMs: POLICY.hardCapMs, terminationGraceMs: 100, parser,
    agentKey: 'backend://rc12/l2-inactivity', transportPlanDigest,
    paths: { output: 'file:///rc12/l2-inactivity/output.json', transport: 'file:///rc12/l2-inactivity/transport.json' },
    livenessBinding: { kind: 'runtime_liveness_binding', schemaVersion: '5.0.0', clockKind: 'native_monotonic_elapsed', policy: POLICY,
      clockOriginRef: `runtime-clock://abiogenesis/${hash({ attemptDigest, transportPlanDigest }).slice(7)}`, sources: [...actorRuntimeProbeSources(parser)] } };
  const transportBindingDigest = hash(bindingBody), transportBindingRef = `transport-binding://abiogenesis/${transportBindingDigest.slice(7)}`;
  const binding = add('actor_transport_binding_admitted', 'transport_binding', transportBindingRef, cCall,
    { ...bindingBody, transportBindingRef, transportBindingDigest }, [fibre.eventId]);
  const actor = `actor-invocation://abiogenesis/${hash({ attemptDigest, transportBindingRef, transportBindingDigest }).slice(7)}`;
  const actorStarted = add('actor_invocation_started', 'actor_invocation', actor, cCall, { actorInvocationRef: actor,
    cCallRef: cCall, actorRef: ids.actorRef, workerBindingRef: ids.workerBindingRef, implementationRef: ids.implementationRef,
    inputDigest: ids.inputDigest, dispatchOrdinal: ids.dispatchOrdinal, promptDigest: ids.promptDigest, transportBindingRef,
    transportBindingDigest }, [binding.eventId]);
  const started = add('actor_process_started', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, processId: 4242, cCallRef: cCall }, [actorStarted.eventId]);
  const at = () => selectValidatedRuntimeEventPrefix(deepFreeze([...rows]));
  const context = projectActorLivenessContext(at(), actor);
  assert.notEqual(context, null, 'the declared actor context authenticates');
  const probe = (source, underlying, elapsedMs, signal = 'activity', coverage = 'observed') => {
    const contract = context.probes.find(row => row.source === source);
    return add('runtime_activity_probe_observed', 'actor_invocation', actor, cCall, { actorInvocationRef: actor, probeContract: contract,
      observation: { kind: 'runtime_probe_observation', schemaVersion: '5.0.0', probeRef: contract.probeRef, scopeDigest: hash(context.scope),
        clockOriginRef: context.binding.clockOriginRef, elapsedMs, underlyingObservationRef: underlying.eventId, underlyingEventRef: underlying.eventId,
        sourceDigest: underlying.payloadDigest, sourceRevisionDigest: null, evidenceRefs: [underlying.eventId], coverage, signal } },
    [binding.eventId, underlying.eventId]);
  };
  if (startProbes) for (const source of actorRuntimeProbeSources(parser)) {
    if (source === 'process_lifecycle') probe(source, started, 0);
    else probe(source, started, 0, 'coverage', complete || ['stdout', 'stderr'].includes(source) ? 'observed' : 'unavailable');
  }
  let chunks = 0;
  const stdout = elapsedMs => probe('stdout', add('actor_process_stdout_observed', 'process', processRef, actor,
    { actorInvocationRef: actor, processRef, chunkOrdinal: ++chunks, chunkDigest: hash(`chunk-${chunks}`) }, [started.eventId]), elapsedMs);
  const exited = () => add('actor_process_exited', 'process', processRef, actor, { actorInvocationRef: actor, processRef, status: 0, signal: null },
    [started.eventId]);
  const sample = elapsedMs => ({ clockOriginRef: context.binding.clockOriginRef, elapsedMs, eventRef: null });
  const view = elapsedMs => deriveRuntimeLiveness(at(), context, sample(elapsedMs));
  // A threshold appended to the current cut, as admitRuntimeThreshold builds it.
  const threshold = (elapsedMs, timeoutClass) => {
    const cut = at(), projection = deriveRuntimeLiveness(cut, context, sample(elapsedMs));
    const event = deepFreeze({ ...rows.at(-1), kind: 'actor_process_timeout_observed', aggregateType: 'process', aggregateId: processRef,
      parentAggregateId: actor, causationEventRefs: [started.eventId, ...projection.evidenceRefs], eventId: `event://rc12/l2-inactivity/${rows.length + 1}/threshold`,
      admissionOrdinal: rows.length + 1, payload: { actorInvocationRef: actor, processRef, timeoutClass,
        timeoutMs: timeoutClass === 'absolute' ? POLICY.hardCapMs : POLICY.inactivityMs,
        thresholdObservation: { kind: 'runtime_threshold_observation', schemaVersion: '5.0.0', clockOriginRef: context.binding.clockOriginRef,
          elapsedMs, policyRef: POLICY.policyRef, scopeDigest: hash(context.scope), evaluatedPrefixDigest: runtimeEventPrefixDigest(cut),
          projectionDigest: projection.projectionDigest } } });
    return validateRuntimeLivenessEventAtPrefix(cut, deepFreeze({ ...event, payloadDigest: hash(event.payload) }));
  };
  return { view, threshold, stdout, exited };
}
const decided = p => [p.disposition.disposition, p.disposition.reason];
const unknown = p => p.coverage.filter(row => row.state === 'unknown').map(row => row.source);

test('a live actor with unknown coverage is contained at its lease with the inactivity cause, before its hard cap', () => {
  const actor = declaredActor();
  const before = actor.view(999), at = actor.view(1000), cap = actor.view(POLICY.hardCapMs);
  assert.deepEqual(unknown(at), ['archive', 'result_artifact'], 'two declared sources stay unknown');
  assert.deepEqual([...decided(before), before.leaseExpired], ['continue_waiting', 'unknown_required_coverage', false], 'inside the lease it waits');
  assert.deepEqual([...decided(at), at.leaseExpired, at.hardCapReached, at.lastActivityElapsedMs], ['controlled_terminate', 'inactivity_expired', true, false, 0],
    'lease expiry contains the live process whatever the coverage');
  assert.deepEqual([...decided(cap), cap.hardCapReached], ['controlled_terminate', 'absolute_safety_cap', true], 'the hard cap keeps its distinct cause');
  assert.equal(actor.threshold(1000, 'inactivity'), true, 'an inactivity threshold at the lease is admissible');
  assert.equal(actor.threshold(1000, 'absolute'), false, 'the lease is not the absolute cause');
  assert.equal(actor.threshold(999, 'inactivity'), false, 'no threshold inside the lease');
  assert.equal(actor.threshold(POLICY.hardCapMs, 'absolute'), true, 'the cap threshold is unchanged');
  const silent = declaredActor({ startProbes: false });
  assert.deepEqual(decided(silent.view(1000)), ['controlled_terminate', 'startup_expired'], 'with no admitted activity the startup cause applies');
});

test('without a live process, unknown coverage withholds the no-progress classification that complete coverage makes', () => {
  const unknownCoverage = declaredActor(), completeCoverage = declaredActor({ complete: true });
  for (const actor of [unknownCoverage, completeCoverage]) actor.exited();
  const withheld = unknownCoverage.view(1500), classified = completeCoverage.view(1500);
  assert.deepEqual([...decided(withheld), withheld.leaseExpired], ['continue_waiting', 'unknown_required_coverage', true],
    'an exited actor with unknown coverage is not classified');
  assert.deepEqual(unknown(classified), [], 'every declared source observed');
  assert.deepEqual(decided(classified), ['block', 'progress_without_result'], 'complete coverage classifies the same expired lease');
  assert.equal(unknownCoverage.threshold(1500, 'inactivity'), false, 'no containment threshold without a live process');
});

test('admitted activity resets the lease; containment follows the last activity', () => {
  const actor = declaredActor();
  actor.stdout(800);
  const renewed = actor.view(1000), inside = actor.view(1799), expired = actor.view(1800);
  assert.deepEqual([...decided(renewed), renewed.lastActivityElapsedMs, renewed.leaseDeadlineElapsedMs], ['continue_waiting', 'unknown_required_coverage', 800, 1800]);
  assert.deepEqual(decided(inside), ['continue_waiting', 'unknown_required_coverage']);
  assert.deepEqual(decided(expired), ['controlled_terminate', 'inactivity_expired']);
  assert.equal(actor.threshold(1000, 'inactivity'), false, 'the original deadline no longer contains');
  assert.equal(actor.threshold(1800, 'inactivity'), true, 'the renewed deadline contains');
});
