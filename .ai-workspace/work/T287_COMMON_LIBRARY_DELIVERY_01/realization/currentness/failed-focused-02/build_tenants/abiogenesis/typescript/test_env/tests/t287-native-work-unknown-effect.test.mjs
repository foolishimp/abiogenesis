import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import * as native from '../../build/code/src/product/native_workspace_work.js';
import { constructNativeWorksiteCommandExecutionTask } from '../../build/code/src/product/worksite_command_execution.js';
import { createNewEmptyAppendSink, admitRuntimeEvent, admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  selectHeldEventStoreDurablePrefix, ROOT_EVENT_CONTRACTS } from '../../build/code/src/abg/event_store.js';
import { selectValidatedRuntimeEventPrefix, selectOwnedRuntimeEventPrefix, validatedRuntimeEventPrefixBeforeEvent,
  readOwnedRuntimeEventPrefixAtDurablePrefix, indexedRuntimeEvents } from '../../build/code/src/abg/event_prefix.js';
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from '../../build/code/src/abg/invocation_execution_truth.js';
import { rehydrateAdmittedImplementationSetAtPrefix } from '../../build/code/src/abg/execution_basis.js';
import { constructRuntimeWatchdogPolicy } from '../../build/code/src/abg/runtime_liveness_contracts.js';
import { deriveRuntimeEventCalculusProjection, holdsAt, constructRuntimeFluent,
  projectNativeWorkRetiredObservations, eventCalculusDependencies } from '../../build/code/src/abg/event_calculus.js';
import { projectNativeWorkUnknownEffectTask, nativeWorkUnknownEffectDependencies } from '../../build/code/src/abg/native_work_effect.js';
import { worksiteCommandSourcesInvalidatedAfter, projectNativeWorkspaceWorkSourceAtPrefix,
  projectNativeWorkCommandSourceAtPrefix } from '../../build/code/src/abg/native_worksite_execution.js';
import { deepFreeze } from '../../build/code/src/shared/immutable.js';
import { constructNativeWorkspaceWorkModulePublication } from '../../build/code/src/gtl/native_workspace_work.js';
import { modulePublicationSemanticDigest } from '../../build/code/src/product/publication.js';
import { ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS as nativeSemantics } from '../../build/code/src/product/builtin_semantics.js';
import { ABI5_PACKAGE_NAME, ABI5_PACKAGE_VERSION } from '../../build/code/src/product/contracts.js';
import { isNativeWorkerResultAssessment } from '../../build/code/src/abg/transport_contracts.js';

const product = await loadWorksiteOwner(), hash = product.sha256Canonical, ids = native.NATIVE_WORKSPACE_WORK_IDS;
const paths = ['target.txt', 'nested/file.txt', 'nested/absent.txt', 'keep.txt', 'nested-peer.txt', 'absent.txt'];
const identity = (scheme, digest) => `${scheme}://abiogenesis/${digest.slice(7)}`;
const clone = value => JSON.parse(JSON.stringify(value));
const publication = constructNativeWorkspaceWorkModulePublication({ productId: 'product://component/u1',
  artifactDigest: hash('u1-controlled-artifact'), productContentDigest: hash('u1-controlled-content'),
  productManifestDigest: hash('u1-controlled-manifest'), packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION });
const publicationDigest = modulePublicationSemanticDigest(publication);
const program = publication.programs.find(row => row.programRef === ids.programRef);
const graph = publication.graphFunctions.find(row => row.name === ids.graphFunctionRef);
const publishedBinding = publication.implementationBindings.find(row => row.implementationRef === ids.implementationRef);
assert.ok(program); assert.ok(graph); assert.ok(publishedBinding);
const install = deepFreeze({ installId: 'install://component/u1', productId: publication.owningProductId,
  productContentDigest: publication.productContentDigest, manifestDigest: publication.productManifestDigest,
  packageName: ABI5_PACKAGE_NAME, packageVersion: ABI5_PACKAGE_VERSION });
const coordinate = (declarationKind, declarationRef) => ({ ...install, moduleRef: publication.moduleRef,
  publicationDigest, declarationKind, declarationRef });
const contract = ref => { const rows = publication.contracts.filter(row => row.contractRef === ref); assert.equal(rows.length, 1); return rows[0]; };

// Reuses the existing F04 source-component scaffold. Installation, readiness,
// implementation-set admission and loaded-content authentication are supplied
// lower premises. Publication owner lookup, native validators, exact worker
// contracts and raw preimage verification run unchanged. No verification value
// is supplied and no native process or installed Run is performed.
async function componentNativeAssessment(task, implementationSet, report) {
  const closure = { selectedGraphFunctionRef: graph.name,
    semanticsOwner: coordinate('semantics', publication.productSemanticsBinding.bindingRef), publications: [publication],
    contractOwners: publication.contracts.map(row => coordinate('contract', row.contractRef)),
    implementationBindingOwners: [coordinate('implementation_binding', publishedBinding.bindingRef)] };
  const projection = { ...install, publicationDigest, bindingRef: publication.productSemanticsBinding.bindingRef };
  const file = resolve(import.meta.dirname, '../../build/code/src/implementation/leaf_invocation_port.js');
  const module = new SourceTextModule(await fs.readFile(file, 'utf8'), { identifier: file });
  const lower = {
    '../abg/environment_admission.js': { hasAdmittedProductInstall: () => true },
    '../abg/execution_basis.js': { hasAdmittedImplementationSetAtPrefix: () => true },
    '../product/semantics.js': { inspectProductLeafSemanticsProjection: () => ({ projection,
      runtime: { ...nativeSemantics, verifyInstalledContent: async () => true } }) },
  };
  await module.link(async spec => {
    const loaded = await import(spec.startsWith('node:') ? spec : pathToFileURL(resolve(dirname(file), spec)).href);
    const values = { ...loaded, ...lower[spec] };
    return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
  });
  await module.evaluate();
  const port = await module.namespace.constructAdmittedLeafInvocationPort({ prefix: {}, artifactTruth: {}, implementationSet,
    semanticsProjection: projection, executionResolution: { declarationClosure: closure, declarationPublications: [publication], ownerInstalls: [install] } });
  const preimage = { resolution: implementationSet.rows[0], input: task, inputDigest: hash(task),
    instructionContractRef: ids.taskContractRef, rawResultContractRef: ids.workerReportContractRef, rawResult: report };
  const verification = port.verifyProbabilisticResultContractPreimage(preimage);
  assert.equal(verification.kind, 'verified_probabilistic_result_contract_preimage', JSON.stringify(verification));
  assert.equal(port.verifyProbabilisticResultContractPreimage({ ...preimage, rawResult: { ...report, summary: 17 } }).kind,
    'probabilistic_result_contract_preimage_refusal');
  const output = JSON.stringify(report), assessment = deepFreeze({ kind: 'native_worker_result_assessment', schemaVersion: '5.0.0',
    resultContractRef: ids.workerReportContractRef, inputDigest: hash(task), rawOutputDigest: product.sha256Bytes(output), disposition: 'admitted', verification });
  assert.equal(isNativeWorkerResultAssessment(assessment, output, assessment.resultContractRef, assessment.inputDigest), true);
  return assessment;
}
// Shape checks consume the exported closed owner contracts. The actual
// EventStore remains responsible for full event admission and causal checks.
function assertFixtureContract(candidate) {
  const contract = ROOT_EVENT_CONTRACTS[candidate.kind], payload = candidate.payload;
  const variants = contract.variants.filter(v => v.aggregateType === candidate.aggregateType && v.scopeClass === candidate.scopeClass &&
    v.requiredEnvelopeIdentities.every(key => typeof candidate[key] === 'string' && candidate[key].length > 0));
  const matches = variants.flatMap(v => contract.payloadVariants.flatMap((p, index) =>
    (v.payloadVariantIndexes ?? contract.payloadVariants.map((_, i) => i)).includes(index) &&
    p.requiredPayloadKeys.every(key => Object.hasOwn(payload, key)) && Object.keys(payload).every(key => p.allowedPayloadKeys.includes(key)) &&
    Object.entries(p.expectedPayload ?? {}).every(([key, value]) => payload[key] === value) ? [p] : []));
  assert.equal(matches.length, 1, `${candidate.kind}: fixture payload must match exactly one exported owner variant; keys=${Object.keys(payload).sort()}`);
}
const prefixOf = rows => selectValidatedRuntimeEventPrefix(deepFreeze(clone(rows)));
const current = (projection, observation) => holdsAt(projection,
  constructRuntimeFluent({ name: 'worksite_observation_current', identity: observation.observationRef }));

// Controlled causal premises use the existing Product constructors and actual
// EventStore admission, codec, indexes, exact joins and cold reconstruction.
// No native process, semantic assessment, installed Run or UAT is claimed.
async function fixture(t, roots = ['target.txt'], { withSource = false, preflight = false } = {}) {
  const env = await worksiteFixture(product), other = await worksiteFixture(product);
  t.after(async () => { await fs.rm(env.scratch, { recursive: true, force: true }); await fs.rm(other.scratch, { recursive: true, force: true }); });
  await fs.mkdir(join(env.canonicalRoot, 'nested'));
  for (const path of ['target.txt', 'nested/file.txt', 'keep.txt', 'nested-peer.txt'])
    await fs.writeFile(join(env.canonicalRoot, path), 'before\n');
  await fs.writeFile(join(other.canonicalRoot, 'target.txt'), 'other\n');
  const observe = e => product.observeWorksiteContext({ ...e, readRoots: ['.'], maxFiles: 30, maxBytes: 10000 });
  const request = async (e, relativePath) => {
    const subject = product.constructWorksiteSubject({ ...e, relativePath, subjectUri: pathToFileURL(join(e.canonicalRoot, relativePath)).href });
    const predecessorObservation = await product.observeWorksiteSubject(e.workspaceAuthorityBasis, e.workspaceBinding, subject);
    return product.constructWorksiteFileReplaceRequest({ ...e, subject, territory: e.territory,
      predecessorObservation, replacementBytes: Buffer.from('candidate\n') });
  };
  const requests = await Promise.all(paths.map(path => request(env, path)));
  const foreign = await request(other, 'target.txt');
  // A later actual observation of a prior changed file is itself an immutable
  // predecessor for subsequent work. Both observations must lose currentness.
  await fs.writeFile(join(env.canonicalRoot, 'target.txt'), 'prior successor\n');
  const successor = await request(env, 'target.txt');
  const task = native.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
    workspaceBinding: env.workspaceBinding, capabilityGrant: env.capabilityGrant, context: await observe(env),
    outcome: 'Bounded test work', instructions: ['Use only the declared scope.'], readFirst: ['target.txt'], writeRoots: roots, checks: [] });
  const { kind, schemaVersion, disposition, leafResolutionCandidateRef, leafResolutionCandidateDigest, ...priorRow } = env.implementationSet.rows[0];
  const { kind: bindingKind, bindingRef, ...bindingFields } = publishedBinding;
  const rowBody = { ...priorRow, ...bindingFields, graphFunctionRef: graph.name, graphFunctionDigest: hash(graph),
    graphFunctionOwnerProductId: install.productId, graphFunctionPublicationDigest: publicationDigest,
    programLocusRef: graph.template.startNodeRef, implementationBindingRef: bindingRef,
    implementationOwnerProductId: install.productId, implementationPublicationDigest: publicationDigest };
  const rowDigest = hash(rowBody), row = { kind, schemaVersion, disposition,
    leafResolutionCandidateRef: identity('leaf-resolution-candidate', rowDigest), leafResolutionCandidateDigest: rowDigest, ...rowBody };
  const setDigest = hash({ rows: [row] }), set = deepFreeze({ rows: [row],
    implementationSetRef: identity('implementation-set', setDigest), implementationSetDigest: setDigest });
  const sourceReport = { summary: 'prior bounded work', gaps: [] };
  const nativeResultAssessment = withSource ? await componentNativeAssessment(task, set, sourceReport) : null;
  const acquired = await acquireNewEmptyAppendSinkFixture(t, createNewEmptyAppendSink, 'abi5-u1-');
  const store = acquired.store, candidates = [], previewRows = [];
  const atCut = run => preflight ? run() : admitNonEmptyRuntimeEventTransactionAtDurablePrefix(store,
    selectHeldEventStoreDurablePrefix(store), run).value;
  const common = { eventTime: '2026-10-21T00:00:00.000Z', correlationId: 'correlation://u1', workflowVersion: '5.0.0',
    scopeClass: 'run', basisId: 'basis://u1/setup', runId: 'run://u1', graphCallId: 'graph-call://u1/unknown',
    frameId: 'frame://u1/unknown', graphFunctionRef: ids.graphFunctionRef, parentAggregateId: null, causationEventRefs: [] };
  const append = (kind, aggregateType, aggregateId, payload, extra = {}) => {
    const candidate = { ...common, kind, aggregateType, aggregateId, payload, ...extra };
    if (candidate.scopeClass === 'workspace') for (const key of ['runId', 'graphCallId', 'frameId']) delete candidate[key];
    assertFixtureContract(candidate); candidates.push(candidate);
    if (!preflight) return admitRuntimeEvent(store, candidate);
    const row = deepFreeze({ ...candidate, eventId: `event://u1/shape-only/${previewRows.length + 1}`,
      admissionOrdinal: previewRows.length + 1, payloadDigest: hash(payload) });
    previewRows.push(row); return row;
  };
  const workspace = { scopeClass: 'workspace' };
  const invocation = e => {
    const body = Object.fromEntries(['invocationRef', 'rawInputAdmissionRef', 'publicRequestAdmissionRef', 'publicRequestInvocationRef',
      'catalogBasisRef', 'catalogViewId', 'programRef', 'catalogHandle', 'selectedDefinitionRef', 'inputContractRef', 'inputContractOwner',
      'outputContractRef', 'outputContractOwner', 'productExecutionResolutionRef', 'programValidationRef', 'policyRef', 'authorityRef']
      .map(key => [key, `fixture://u1/${e.workspaceBinding.bindingId}/${key}`]));
    Object.assign(body, Object.fromEntries(['invocationDigest', 'rawInputDigest', 'publicRequestDigest', 'catalogBasisDigest', 'catalogViewDigest',
      'programDigest', 'graphFunctionDigest', 'selectedDefinitionDigest', 'inputContractDigest', 'outputContractDigest',
      'productExecutionResolutionDigest', 'programValidationDigest', 'policyDigest', 'authorityDigest'].map(key => [key, hash(key)])),
    { invocationVariant: 'direct', workspaceId: e.workspaceBinding.workspaceId, workspaceBindingId: e.workspaceBinding.bindingId,
      workspaceBindingDigest: e.workspaceBinding.bindingDigest, catalogApplicationRefs: [], catalogApplicationDigests: [],
      gtlEntryCoordinate: {}, gtlEntryTerm: {}, capabilityGrants: [e.capabilityGrant], capabilityGrantRefs: [e.capabilityGrant.grantRef],
      actorRef: e.capabilityGrant.actorRef, programRef: program.programRef, programDigest: hash(program),
      graphFunctionRef: graph.name, graphFunctionDigest: hash(graph),
      inputContractRef: ids.taskContractRef, inputContractDigest: hash(contract(ids.taskContractRef)), inputContractOwner: coordinate('contract', ids.taskContractRef),
      outputContractRef: ids.observationContractRef, outputContractDigest: hash(contract(ids.observationContractRef)), outputContractOwner: coordinate('contract', ids.observationContractRef),
      publicStart: {}, reentryBasis: null, sourceResultBasis: null });
    const digest = hash(body), ref = identity('invocation-admission', digest);
    const pub = append('public_operation_admitted', 'workspace', e.workspaceBinding.bindingId,
      { ...Object.fromEntries(['invocationRef', 'invocationDigest', 'actorRef', 'authorityRef', 'authorityDigest', 'capabilityGrantRefs',
        'catalogApplicationRefs', 'catalogApplicationDigests', 'policyRef', 'policyDigest', 'workspaceBindingId', 'catalogBasisRef',
        'catalogBasisDigest', 'catalogViewId', 'programRef', 'catalogHandle', 'graphFunctionRef', 'selectedDefinitionRef',
        'selectedDefinitionDigest', 'programValidationRef', 'programValidationDigest', 'gtlEntryCoordinate', 'gtlEntryTerm'].map(key => [key, body[key]])),
        operationId: 'abg.operation.run.invoke', memberKey: 'invoke', definitionDigest: hash('definition'), variant: 'direct' },
      { ...workspace, basisId: body.authorityRef, parentAggregateId: body.invocationRef });
    const event = append('invocation_admitted', 'workspace', e.workspaceBinding.bindingId,
      { ...body, invocationAdmissionRef: ref, invocationAdmissionDigest: digest },
      { ...workspace, basisId: ref, parentAggregateId: body.invocationRef, causationEventRefs: [pub.eventId] });
    return { ...body, invocationAdmissionRef: ref, event };
  };
  let inv, basis, process, actor, binding, source, sourceResult, sourceCall;
  const cCallRef = 'c-call:sha256:u1-unknown', actorRef = 'actor-invocation://u1', processRef = 'process://u1';
  const basisFor = (e, admission, rawInputValue, extra = {}) => {
    const body = { workspaceBindingId: e.workspaceBinding.bindingId, workspaceBindingDigest: e.workspaceBinding.bindingDigest,
      actorRef: e.capabilityGrant.actorRef, programRef: program.programRef, programDigest: hash(program), graphFunctionRef: graph.name,
      graphFunctionDigest: hash(graph), invocationAdmissionRef: admission.invocationAdmissionRef, basisClass: 'root',
      rawInputValue, rawInputDigest: hash(rawInputValue), ...extra };
    const basisDigest = hash(body), basisRef = identity('execution-basis', basisDigest);
    const event = append('basis_admitted', 'workspace', e.workspaceBinding.bindingId, { ...body, basisRef, basisDigest }, { ...workspace, basisId: basisRef });
    return { ...body, basisRef, basisDigest, admissionEventRef: event.eventId };
  };
  atCut(() => {
    inv = invocation(env); const otherInv = invocation(other);
    for (const r of [...requests, successor]) basisFor(env, inv, r);
    basisFor(other, otherInv, foreign);
    append('implementation_admitted', 'workspace', env.workspaceBinding.bindingId,
      { implementationSetRef: set.implementationSetRef, implementationSetDigest: set.implementationSetDigest, implementationSet: set, interactionSetRef: 'interaction-set://u1', interactionSetDigest: hash('interactions') }, workspace);
    basis = basisFor(env, inv, task, { implementationSetRef: set.implementationSetRef, implementationSetDigest: set.implementationSetDigest,
      closureContractRef: ids.childClosureContractRef });
    common.basisId = basis.basisRef;
    if (withSource) {
      const sourceScope = { graphCallId: 'graph-call://u1/source', frameId: 'frame://u1/source' };
      sourceCall = 'c-call:sha256:u1-source';
      const opened = append('c_call_opened', 'c_call', sourceCall, { cCallRef: sourceCall, cCallDigest: hash('source-call'), callClass: 'leaf' }, sourceScope);
      append('c_call_fibre_selected', 'c_call', sourceCall, { cCallRef: sourceCall, callClass: 'leaf', armId: 'arm://u1', regime: 'F_P',
        implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, { ...sourceScope, causationEventRefs: [opened.eventId] });
      source = native.constructNativeWorkspaceWorkObservation(task, task.context, sourceReport, {
        cCallRef: sourceCall, executionAuthorityRef: 'authority://u1/source', executionAuthorityDigest: hash('source-authority'),
        actorInvocationRef: 'actor-invocation://u1/source', transportBindingRef: 'transport-binding://u1/source',
        transportBindingDigest: hash('source-transport-binding'), promptDigest: hash('source-prompt'), transportDigest: hash('source-transport') });
      const evidence = append('c_call_evidenced', 'c_call', sourceCall, { cCallRef: sourceCall, contractRef: ids.observationContractRef,
        evidenceClass: 'probabilistic_transport', evidenceRef: 'evidence://u1/source', evidenceDigest: hash('source-evidence'),
        implementationRef: ids.implementationRef, inputDigest: hash(task), outputDigest: hash(source), transportDigest: source.provenance.transportDigest,
        nativeResultAssessment }, sourceScope);
      sourceResult = append('c_call_result_admitted', 'c_call', sourceCall, { cCallRef: sourceCall, resultClass: 'success',
        contractRef: ids.observationContractRef, value: source, valueDigest: hash(source), evidenceRefs: [evidence.payload.evidenceRef],
        resultRef: 'result://u1/source', resultDigest: hash('source-result') }, sourceScope);
      const judgment = append('c_call_judged', 'c_call', sourceCall, { cCallRef: sourceCall, judgmentRef: 'judgment://u1/source',
        judgmentDigest: hash('source-judgment'), resultRef: sourceResult.payload.resultRef, resultDigest: sourceResult.payload.resultDigest,
        judgment: 'advance', retryAttemptRef: null }, { ...sourceScope, causationEventRefs: [sourceResult.eventId] });
      const frame = append('frame_closed', 'frame', sourceScope.frameId, { frameId: sourceScope.frameId, terminalReachedEventRef: judgment.eventId },
        { ...sourceScope, causationEventRefs: [judgment.eventId] });
      append('graph_call_closed', 'graph_call', sourceScope.graphCallId,
        { closureContractRef: basis.closureContractRef, graphCallId: sourceScope.graphCallId, frameClosedEventRef: frame.eventId },
        { ...sourceScope, causationEventRefs: [frame.eventId] });
    }
    const opened = append('c_call_opened', 'c_call', cCallRef, { cCallRef, cCallDigest: hash('unknown-call'), callClass: 'leaf', programLocusRef: row.programLocusRef });
    const fibre = append('c_call_fibre_selected', 'c_call', cCallRef, { cCallRef, callClass: 'leaf', armId: 'arm://u1', regime: 'F_P',
      implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, { causationEventRefs: [opened.eventId] });
    const body = { cCallRef, actorRef: env.capabilityGrant.actorRef, implementationRef: ids.implementationRef,
      implementationBindingRef: ids.implementationBindingRef, inputDigest: hash(task), livenessBinding: {
        kind: 'runtime_liveness_binding', schemaVersion: '5.0.0', clockOriginRef: 'runtime-clock://u1', clockKind: 'native_monotonic_elapsed',
        policy: constructRuntimeWatchdogPolicy({ startupMs: 1000, inactivityMs: 1000, hardCapMs: 5000, terminationGraceMs: 100 }), sources: ['process_lifecycle'] } };
    const transportBindingDigest = hash(body), transportBindingRef = identity('transport-binding', transportBindingDigest);
    binding = append('actor_transport_binding_admitted', 'transport_binding', transportBindingRef,
      { ...body, transportBindingRef, transportBindingDigest }, { parentAggregateId: cCallRef, causationEventRefs: [fibre.eventId] });
    actor = append('actor_invocation_started', 'actor_invocation', actorRef,
      { actorInvocationRef: actorRef, actorRef: env.capabilityGrant.actorRef, cCallRef, implementationRef: ids.implementationRef,
        inputDigest: hash(task), transportBindingRef, transportBindingDigest }, { parentAggregateId: cCallRef, causationEventRefs: [binding.eventId] });
    process = append('actor_process_started', 'process', processRef, { actorInvocationRef: actorRef, processRef, processId: 12345, cCallRef },
      { parentAggregateId: actorRef, causationEventRefs: [actor.eventId] });
  });
  const beforeRows = preflight ? previewRows : store.readAll(), before = preflight ? prefixOf(previewRows) : selectOwnedRuntimeEventPrefix(store);
  assert.ok(projectExactExecutionBasisAtPrefix(before, basis.basisRef), 'exact native basis authenticates');
  assert.ok(projectExactInvocationAdmissionAtPrefix(before, inv.invocationAdmissionRef), 'invocation and grant authenticate');
  assert.ok(rehydrateAdmittedImplementationSetAtPrefix(before, set.implementationSetRef), 'selected implementation set authenticates');
  if (preflight) {
    const initial = deriveRuntimeEventCalculusProjection(before);
    for (const request of [...requests, successor, foreign]) assert.equal(current(initial, request.predecessorObservation), true,
      'every controlled C0 observation is current before the unknown cause');
    for (const event of previewRows) for (const ref of event.causationEventRefs) {
      const cause = previewRows.find(row => row.eventId === ref);
      assert.ok(cause && cause.admissionOrdinal < event.admissionOrdinal, 'fixture causal prerequisites precede their dependent event');
    }
    if (withSource) assert.ok(projectNativeWorkspaceWorkSourceAtPrefix(before, source), 'prior controlled provenance joins before U1');
  }
  const cause = (kind = 'actor_process_termination_unconfirmed') => atCut(() => kind === 'actor_invocation_failed'
      ? append(kind, 'actor_invocation', actorRef, { actorInvocationRef: actorRef, processRef, cCallRef, disposition: 'failure',
        failureClass: 'transport_exception', transportBindingRef: binding.aggregateId, transportBindingDigest: binding.payload.transportBindingDigest,
        diagnosticDigest: hash('preserved original failure') }, { parentAggregateId: cCallRef, causationEventRefs: [process.eventId] })
      : append(kind, 'process', processRef, { actorInvocationRef: actorRef, processRef }, { parentAggregateId: actorRef, causationEventRefs: [process.eventId] }));
  const exit = () => atCut(() => append('actor_process_exited', 'process', processRef, { actorInvocationRef: actorRef, processRef, status: 0, signal: null },
      { parentAggregateId: actorRef, causationEventRefs: [process.eventId] }));
  return { ...env, task, requests, successor, foreign, store, before, beforeRows, cause, exit, actorRef, processRef,
    basis, binding, actor, process, source, sourceResult, candidates };
}

test('U1 fixture event handoffs match the exported owner contracts before effectful proof', async t => {
  const f = await fixture(t, ['target.txt', 'nested', 'nested/file.txt'], { withSource: true, preflight: true });
  f.cause(); f.cause('actor_invocation_failed'); f.exit();
  assert.equal(f.store.readAll().length, 0, 'preflight admits no synthetic preview rows');
  assert.ok(f.candidates.length > 25);
  t.diagnostic(`Closed-shape preflight covered ${f.candidates.length} candidates across ${new Set(f.candidates.map(row => row.kind)).size} existing event kinds; no runtime outcome credit.`);
});

test('U1 scope, currentness and cleanup agree at full, indexed, incremental and cold prefixes', async t => {
  const cases = [
    { roots: ['target.txt'], affected: ['target.txt'] },
    { roots: ['nested'], affected: ['nested/file.txt', 'nested/absent.txt'] },
    { roots: ['.'], affected: paths },
    { roots: [], affected: [] },
    { roots: ['target.txt', 'nested', 'nested/file.txt'], affected: ['target.txt', 'nested/file.txt', 'nested/absent.txt'] },
  ];
  for (const scenario of cases) await t.test(JSON.stringify(scenario.roots), async t => {
    const f = await fixture(t, scenario.roots), all = [...f.requests, f.successor, f.foreign];
    const before = deriveRuntimeEventCalculusProjection(f.before);
    for (const r of all) assert.equal(current(before, r.predecessorObservation), true);
    const cause = f.cause(), owned = selectOwnedRuntimeEventPrefix(f.store), rows = f.store.readAll();
    assert.deepEqual(projectNativeWorkUnknownEffectTask(cause, f.beforeRows), f.task);
    const dependencies = eventCalculusDependencies(owned, cause, []);
    assert.deepEqual(projectNativeWorkUnknownEffectTask(cause, dependencies, f.before), f.task);
    const expected = [...f.requests, f.successor].filter(r => scenario.affected.includes(r.subject.relativePath))
      .map(r => r.predecessorObservation.observationRef);
    assert.deepEqual(projectNativeWorkRetiredObservations(cause, dependencies, f.before), expected);
    const warm = deriveRuntimeEventCalculusProjection(owned), full = deriveRuntimeEventCalculusProjection(prefixOf(rows));
    assert.deepEqual(warm, full);
    for (const r of all) assert.equal(current(warm, r.predecessorObservation), !expected.includes(r.predecessorObservation.observationRef));
    for (const name of ['actor_cleanup_live', 'actor_cleanup_pending', 'actor_process_termination_unconfirmed'])
      assert.equal(holdsAt(warm, constructRuntimeFluent({ name, identity: f.processRef })), true);
    assert.equal(rows.some(row => row.kind === 'c_call_result_admitted'), false, 'unknown effect creates no Result or successor');
    assert.deepEqual(deriveRuntimeEventCalculusProjection(f.before), before, 'historical selection remains exact');
    f.exit();
    const later = deriveRuntimeEventCalculusProjection(selectOwnedRuntimeEventPrefix(f.store));
    for (const r of all) assert.equal(current(later, r.predecessorObservation), !expected.includes(r.predecessorObservation.observationRef));
    assert.equal(holdsAt(later, constructRuntimeFluent({ name: 'actor_cleanup_pending', identity: f.processRef })), true,
      'leader exit never restores unknown worksite currentness or proves group cleanup');
    const coordinate = clone(selectHeldEventStoreDurablePrefix(f.store)); f.store.closeDurableLog();
    const cold = readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate, { requireCurrent: true });
    assert.deepEqual(deriveRuntimeEventCalculusProjection(cold), later, 'cold lazy body read agrees with warm suffix');
    for (const path of paths) assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal,
      f.canonicalRoot, [path]), scenario.affected.includes(path));
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot + '/other', paths), false);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, cause.admissionOrdinal, f.canonicalRoot, paths), false);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, [], ['.']), scenario.roots.length !== 0);
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, ['nested']), scenario.roots.includes('.') || scenario.roots.includes('nested'));
    assert.equal(worksiteCommandSourcesInvalidatedAfter(cold, f.process.admissionOrdinal, f.canonicalRoot, [], ['nested']),
      scenario.affected.includes('nested/file.txt'));
  });
});

test('U1 both unknown causes share authentication and preserve the transport failure', async t => {
  const f = await fixture(t), failure = f.cause('actor_invocation_failed'), prefix = selectOwnedRuntimeEventPrefix(f.store);
  assert.deepEqual(projectNativeWorkUnknownEffectTask(failure, f.beforeRows), f.task);
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  assert.equal(holdsAt(projection, constructRuntimeFluent({ name: 'actor_invocation_failed', identity: f.actorRef })), true);
  assert.equal(current(projection, f.requests[0].predecessorObservation), false);
  assert.equal(worksiteCommandSourcesInvalidatedAfter(prefix, f.process.admissionOrdinal, f.canonicalRoot, ['target.txt']), true);
  assert.deepEqual(indexedRuntimeEvents(prefix, 'worksite-observation-dependency').filter(e => e.kind === failure.kind), [failure]);
});

test('U1 rejects absent, ambiguous, foreign, changed or causally late prerequisites and substituted causes', async t => {
  const f = await fixture(t), cause = f.cause(), prior = clone(f.beforeRows);
  const resign = event => ({ ...event, payloadDigest: hash(event.payload) });
  const check = (name, change, changedCause = cause) => {
    const rows = clone(prior); change(rows);
    assert.equal(projectNativeWorkUnknownEffectTask(deepFreeze(clone(changedCause)), deepFreeze(rows)), null, name);
  };
  for (const kind of ['actor_process_started', 'actor_invocation_started', 'actor_transport_binding_admitted',
    'c_call_opened', 'c_call_fibre_selected', 'invocation_admitted', 'implementation_admitted'])
    check(`missing ${kind}`, rows => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i].kind === kind) rows.splice(i, 1); });
  check('no established child', rows => { const row = rows.find(e => e.kind === 'actor_process_started'); row.payload.processId = null; Object.assign(row, resign(row)); });
  for (const kind of ['actor_invocation_started', 'actor_transport_binding_admitted', 'actor_process_started', 'c_call_fibre_selected']) {
    const rows = clone(prior), original = rows.find(e => e.kind === kind), duplicate = clone(original);
    duplicate.eventId += '-duplicate'; rows.splice(rows.indexOf(original), 0, duplicate);
    rows.forEach((e, i) => { e.admissionOrdinal = i + 1; });
    assert.equal(projectNativeWorkUnknownEffectTask(deepFreeze({ ...cause, admissionOrdinal: cause.admissionOrdinal + 1 }), deepFreeze(rows)), null, `duplicate ${kind}`);
  }
  for (const field of ['basisId', 'runId', 'graphCallId', 'frameId', 'graphFunctionRef'])
    check(`foreign ${field}`, rows => { rows.find(e => e.kind === 'actor_process_started')[field] = 'foreign://scope'; });
  for (const [kind, field] of [['actor_invocation_started', 'actorRef'], ['actor_process_started', 'cCallRef'],
    ['actor_process_started', 'processRef'], ['actor_transport_binding_admitted', 'inputDigest'], ['actor_invocation_started', 'transportBindingRef']])
    check(`wrong ${kind}.${field}`, rows => { const row = rows.find(e => e.kind === kind); row.payload[field] = 'foreign://value'; Object.assign(row, resign(row)); });
  check('altered native task', rows => { rows.find(e => e.payload.basisRef === f.basis.basisRef).payload.rawInputValue.writeRoots = ['.']; });
  check('wrong admitted grant', rows => { rows.find(e => e.kind === 'invocation_admitted').payload.capabilityGrants = []; });
  check('wrong binding digest', rows => { rows.find(e => e.payload.basisRef === f.basis.basisRef).payload.workspaceBindingDigest = hash('foreign'); });
  check('altered digest', rows => { rows.find(e => e.kind === 'actor_invocation_started').payloadDigest = hash('foreign'); });
  check('missing cause relation', rows => { rows.find(e => e.kind === 'actor_transport_binding_admitted').causationEventRefs = []; });
  check('prerequisite after cause', rows => { rows.find(e => e.kind === 'actor_process_started').admissionOrdinal = cause.admissionOrdinal + 1; });
  check('wrong prerequisite order', rows => { const a = rows.find(e => e.kind === 'actor_invocation_started'), p = rows.find(e => e.kind === 'actor_process_started'); [a.admissionOrdinal, p.admissionOrdinal] = [p.admissionOrdinal, a.admissionOrdinal]; });
  const prefix = selectOwnedRuntimeEventPrefix(f.store);
  for (const forged of [{ ...cause, eventId: 'event://foreign' }, { ...cause, runId: 'run://foreign' },
    { ...cause, payload: { ...cause.payload, processRef: 'process://foreign' } }, { ...cause, payloadDigest: hash('foreign') }]) {
    assert.deepEqual(nativeWorkUnknownEffectDependencies(prefix, forged), []);
    assert.deepEqual(eventCalculusDependencies(prefix, forged, f.beforeRows), []);
  }
  assert.equal(projectNativeWorkUnknownEffectTask(cause, f.beforeRows, prefix), null, 'the optional prerequisite cut must precede the cause');
  assert.equal(worksiteCommandSourcesInvalidatedAfter(f.before, 0, f.canonicalRoot, ['target.txt']), false, 'an unselected cause has no effect');
  assert.deepEqual(projectNativeWorkUnknownEffectTask(cause, deepFreeze([...f.beforeRows].reverse())), f.task,
    'admission ordinals determine order, not caller array order');
});

test('U1 C2 current-source gate rejects affected input while immutable native provenance remains reusable', async t => {
  const f = await fixture(t, ['target.txt'], { withSource: true });
  const taskFor = relativePath => constructNativeWorksiteCommandExecutionTask({ workspaceAuthorityBasis: f.workspaceAuthorityBasis,
    workspaceBinding: f.workspaceBinding, capabilityGrant: f.capabilityGrant, sourceNativeWork: f.source,
    selectedSources: [{ relativePath, subjectUri: pathToFileURL(join(f.canonicalRoot, relativePath)).href }],
    commands: [{ commandId: 'command://u1', executable: 'node', args: ['--version'], relativeCwd: '.', environment: {},
      timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [{ predicateId: 'predicate://u1', predicateKind: 'process_exit', declaration: { equals: 0, validationCommandId: 'command://u1' } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'evidence' }] });
  const affected = taskFor('target.txt'), sibling = taskFor('keep.txt');
  const provenance = projectNativeWorkspaceWorkSourceAtPrefix(f.before, f.source); assert.ok(provenance);
  assert.ok(projectNativeWorkCommandSourceAtPrefix(f.before, affected)); assert.ok(projectNativeWorkCommandSourceAtPrefix(f.before, sibling));
  f.cause();
  for (const prefix of [selectOwnedRuntimeEventPrefix(f.store), prefixOf(f.store.readAll())]) {
    assert.deepEqual(projectNativeWorkspaceWorkSourceAtPrefix(prefix, f.source), provenance);
    assert.equal(projectNativeWorkCommandSourceAtPrefix(prefix, affected), null);
    assert.ok(projectNativeWorkCommandSourceAtPrefix(prefix, sibling));
  }
  const coordinate = clone(selectHeldEventStoreDurablePrefix(f.store)); f.store.closeDurableLog();
  const cold = readOwnedRuntimeEventPrefixAtDurablePrefix(coordinate);
  assert.deepEqual(projectNativeWorkspaceWorkSourceAtPrefix(cold, f.source), provenance);
  assert.equal(projectNativeWorkCommandSourceAtPrefix(cold, affected), null);
  assert.ok(projectNativeWorkCommandSourceAtPrefix(cold, sibling));
});
