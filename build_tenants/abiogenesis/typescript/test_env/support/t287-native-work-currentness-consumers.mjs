// U1-P5-02: source-owned fixture support derived from the frozen U1 component scaffold.
// No production code or frozen test is transformed. Controlled cold coordinates are
// distinguished from actual Product effects and actual EventStore admission.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import { loadWorksiteOwner, worksiteFixture } from '../support/t287-generic-job-worksite.mjs';
import { acquireNewEmptyAppendSinkFixture } from '../support/new-empty-append-sink.mjs';
import * as native from '../../build/code/src/product/native_workspace_work.js';
import { constructNativeWorksiteCommandExecutionTask } from '../../build/code/src/product/worksite_command_execution.js';
import { createNewEmptyAppendSink, admitRuntimeEvent, admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  selectHeldEventStoreDurablePrefix, appendCheckedArtifactEvent, ROOT_EVENT_CONTRACTS } from '../../build/code/src/abg/event_store.js';
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
import { syncBuiltinESMExports } from 'node:module';
import { WORKSITE_C0_IDS, constructWorksiteC0PublicationParts } from '../../build/code/src/gtl/index.js';
import { publicOperationBasis } from './root-installed-environment.mjs';

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
export async function createU1Fixture(t, roots = ['target.txt'], { withSource = false, preflight = false, environment = null, taskFactory = null, onAttempt = () => {}, priorSuccessorBytes = null } = {}) {
  const env = environment ?? await worksiteFixture(product), other = await worksiteFixture(product);
  onAttempt({ ...env, otherScratch: other.scratch });
  t.after(async () => { await fs.rm(env.scratch, { recursive: true, force: true }); await fs.rm(other.scratch, { recursive: true, force: true }); });
  await fs.mkdir(join(env.canonicalRoot, 'nested'), { recursive: true });
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
  // The unknown-effect cases explicitly select a changed-file predecessor.
  // Other consumers retain their unchanged physical setup and actual C0 effects.
  if (priorSuccessorBytes !== null) await fs.writeFile(join(env.canonicalRoot, 'target.txt'), priorSuccessorBytes);
  const successor = await request(env, 'target.txt');
  const task = taskFactory !== null ? await taskFactory(env) : native.constructNativeWorkspaceWorkTask({ workspaceAuthorityBasis: env.workspaceAuthorityBasis,
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
  onAttempt({ ...env, otherScratch: other.scratch, store, candidates, rows: () => store.readAll() });
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
  const invocation = (e, overrides = {}) => {
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
      publicStart: {}, reentryBasis: null, sourceResultBasis: null }, overrides);
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
      graphFunctionDigest: hash(graph), invocationAdmissionRef: admission.invocationAdmissionRef, invocationRef: admission.invocationRef,
      invocationDigest: admission.invocationDigest, basisClass: 'root',
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
  // Controlled confirmed owned-scope absence, never a raw direct-child exit.
  const exit = () => atCut(() => append('actor_process_exited', 'process', processRef, { actorInvocationRef: actorRef, processRef, status: 0, signal: null },
      { parentAggregateId: actorRef, causationEventRefs: [process.eventId] }));
  return { ...env, task, requests, successor, foreign, store, before, beforeRows, cause, exit, actorRef, processRef,
    basis, binding, actor, process, source, sourceResult, candidates, inv, set, append, atCut, invocation, basisFor, common,
    prefix: () => selectOwnedRuntimeEventPrefix(store), rows: () => store.readAll() };
}


export { product, hash, ids, paths, identity, clone, prefixOf, current, assertFixtureContract, componentNativeAssessment };

// Every linked override is an explicitly disclosed component premise. Owner
// bodies are loaded byte-for-byte from the isolated compilation output.
export async function component(name, overrides = {}) {
  const file = resolve(import.meta.dirname, '../../build/code/src', name + '.js');
  const module = new SourceTextModule(await fs.readFile(file, 'utf8'), { identifier: file });
  await module.link(async spec => {
    const actual = await import(spec.startsWith('node:') ? spec : pathToFileURL(resolve(dirname(file), spec)).href);
    const values = { ...actual, ...overrides[spec] };
    return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
  });
  await module.evaluate(); return module.namespace;
}
export function traceInvalidator() {
  const calls = [];
  return { calls, worksiteCommandSourcesInvalidatedAfter(...args) {
    const result = worksiteCommandSourcesInvalidatedAfter(...args);
    calls.push({ afterOrdinal: args[1], canonicalRoot: args[2], selectedPaths: args[3], readRoots: args[4] ?? null, result });
    return result;
  } };
}
export function admittedResult(f, value, { callRef, contractRef, scope = {}, evidenceRefs = [], resultClass = 'success', judgment = 'advance' }) {
  return f.atCut(() => {
    const body = { cCallRef: callRef, resultClass, contractRef, value, valueDigest: hash(value), evidenceRefs };
    const resultDigest = hash(body), resultRef = identity('result', resultDigest);
    const event = f.append('c_call_result_admitted', 'c_call', callRef, { ...body, resultRef, resultDigest }, scope);
    const jBody = { cCallRef: callRef, resultRef, resultDigest, judgment, retryAttemptRef: null };
    const judgmentDigest = hash(jBody), judgmentRef = identity('judgment', judgmentDigest);
    const judged = f.append('c_call_judged', 'c_call', callRef, { ...jBody, judgmentRef, judgmentDigest },
      { ...scope, causationEventRefs: [event.eventId] });
    return { event, judged, result: { ...body, resultRef, resultDigest, admissionEventRef: event.eventId },
      judgment: { ...jBody, judgmentRef, judgmentDigest, admissionEventRef: judged.eventId } };
  });
}

export async function admitNativeSource(f, task, label, { after = task.context, report = { summary: 'Controlled prior source', gaps: [] }, assessment, basisExtra = {} } = {}) {
  // This helper supplies causal occurrence premises. The unassessed source uses
  // the real leaf-port raw verifier; assessed source admission is intentionally
  // not provided here and must remain an explicit consumer lower premise.
  assert.equal(assessment, undefined);
  const nativeResultAssessment = await componentNativeAssessment(task, f.set, report);
  const callRef = 'c-call://u1/source/' + label;
  const source = native.constructNativeWorkspaceWorkObservation(task, after, report, {
    cCallRef: callRef, executionAuthorityRef: 'authority://u1/' + label, executionAuthorityDigest: hash(label),
    actorInvocationRef: 'actor-invocation://u1/source/' + label, transportBindingRef: 'transport-binding://u1/' + label,
    transportBindingDigest: hash(['binding', label]), promptDigest: hash(['prompt', label]), transportDigest: hash(['transport', label]) });
  let basis, evidence;
  const scope = { graphCallId: 'graph-call://u1/source/' + label, frameId: 'frame://u1/source/' + label };
  f.atCut(() => {
    basis = f.basisFor(f, f.inv, task, { implementationSetRef: f.set.implementationSetRef, implementationSetDigest: f.set.implementationSetDigest,
      closureContractRef: ids.childClosureContractRef, ...basisExtra });
    scope.basisId = basis.basisRef;
    const opened = f.append('c_call_opened', 'c_call', callRef, { cCallRef: callRef, cCallDigest: hash(callRef), callClass: 'leaf' }, scope);
    f.append('c_call_fibre_selected', 'c_call', callRef, { cCallRef: callRef, callClass: 'leaf', armId: 'arm://u1/source', regime: 'F_P',
      implementationRef: ids.implementationRef, implementationBindingRef: ids.implementationBindingRef }, { ...scope, causationEventRefs: [opened.eventId] });
    const body = { cCallRef: callRef, contractRef: ids.observationContractRef, evidenceClass: 'probabilistic_transport',
      implementationRef: ids.implementationRef, inputDigest: hash(task), outputDigest: hash(source), transportDigest: source.provenance.transportDigest, nativeResultAssessment };
    const evidenceDigest = hash(body), evidenceRef = identity('evidence', evidenceDigest);
    evidence = f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef, evidenceDigest }, scope);
  });
  const admitted = admittedResult(f, source, { callRef, contractRef: ids.observationContractRef, evidenceRefs: [evidence.payload.evidenceRef],
    scope: { ...scope, causationEventRefs: [evidence.eventId] } });
  f.atCut(() => {
    const frame = f.append('frame_closed', 'frame', scope.frameId, { frameId: scope.frameId, terminalReachedEventRef: admitted.judged.eventId },
      { ...scope, causationEventRefs: [admitted.judged.eventId] });
    f.append('graph_call_closed', 'graph_call', scope.graphCallId, { closureContractRef: basis.closureContractRef, graphCallId: scope.graphCallId, frameClosedEventRef: frame.eventId },
      { ...scope, causationEventRefs: [frame.eventId] });
  });
  const projected = projectNativeWorkspaceWorkSourceAtPrefix(f.prefix(), source);
  assert.ok(projected, 'actual prior native source projector authenticates complete source relation');
  return { source, basis, ...admitted, projected };
}

// Reuse the existing component fixture helper declarations without registering
// or executing its unrelated tests. The exact source is an inventoried input;
// only an export statement is appended. No owner or fixture helper is rewritten.
export async function semanticFixtureHelpers() {
  const file = resolve(import.meta.dirname, '../tests/t287-native-semantic-revision.test.mjs');
  const bytes = await fs.readFile(file, 'utf8'), marker = "\n\nimport {SourceTextModule,SyntheticModule}";
  const end = bytes.indexOf(marker); assert.ok(end > 0);
  const stageRoot = resolve(import.meta.dirname, '../..');
  const resolveSpecifier = spec => {
    if (spec.startsWith('node:')) return spec;
    if (!spec.startsWith('file:') && !spec.startsWith('.')) throw new TypeError('unexpected semantic fixture import form');
    const url = spec.startsWith('file:') ? spec : pathToFileURL(resolve(dirname(file), spec)).href;
    const within = relative(stageRoot, fileURLToPath(url));
    if (isAbsolute(within) || within === '..' || within.startsWith('../')) throw new TypeError('semantic fixture import leaves selected stage');
    return url;
  };
  const module = new SourceTextModule(bytes.slice(0, end) + '\nexport { fixture, author, assess, candidate, verdict, declaredPublication, declaration, publication, provenance };\n',
    { identifier: file, initializeImportMeta(meta) { meta.dirname = dirname(file); meta.url = pathToFileURL(file).href; },
      importModuleDynamically: async spec => import(resolveSpecifier(spec)) });
  await module.link(async spec => {
    const values = await import(resolveSpecifier(spec));
    return new SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); });
  });
  await module.evaluate(); return module.namespace;
}

// TD-08: support for worksite currentness at basis admission.
// One built module with private names exported for the module test only. The
// built source is evaluated unchanged; its imports link to the shared modules.
export async function builtModuleExports(name, exportNames) {
  const file = resolve(import.meta.dirname, '../../build/code/src', name + '.js');
  const module = new SourceTextModule((await fs.readFile(file, 'utf8')) + `\nexport { ${exportNames.join(', ')} };\n`,
    { identifier: file + '#module-test' });
  await module.link(async spec => {
    const actual = await import(spec.startsWith('node:') ? spec : pathToFileURL(resolve(dirname(file), spec)).href);
    return new SyntheticModule(Object.keys(actual), function () { for (const [key, value] of Object.entries(actual)) this.setExport(key, value); });
  });
  await module.evaluate(); return module.namespace;
}

// Counts prior-event visits: a visit is one run of property reads on one
// wrapped event, so one predicate over a row counts once however many fields it
// reads. Copies of references count nothing.
export function eventVisitCounter() {
  let counting = false, visits = 0, last = null;
  const wrap = row => new Proxy(row, { get(target, key, receiver) {
    if (counting && last !== target) { visits++; last = target; }
    return Reflect.get(target, key, receiver);
  } });
  const measure = run => {
    visits = 0; last = null; counting = true;
    try { const value = run(); return { value, visits }; } finally { counting = false; }
  };
  return { wrap, measure };
}

// Authenticated C0 occurrences (binding artifact, C0 implementation set,
// invocation, basis, opened, F_D fibre, actual Product authorization and
// physical replacement, evidence and Result) on two roots, plus the U1 native
// unknown-effect causes and a native Result. Rows are shape-checked fixture rows
// (preflight) or actual EventStore admissions.
export async function createWorksiteCauseHistory(t, { preflight = true, roots = ['target.txt'] } = {}) {
  const f = await createU1Fixture(t, roots, { preflight });
  const rows = () => preflight ? f.beforeRows : f.rows();
  const second = await worksiteFixture(product);
  t.after(async () => { await fs.rm(second.scratch, { recursive: true, force: true }); });
  for (const path of ['target.txt', 'keep.txt']) await fs.writeFile(join(second.canonicalRoot, path), 'second\n');
  const parts = constructWorksiteC0PublicationParts({ productId: 'product://td08/c0', artifactDigest: hash('td08-c0-artifact'),
    productContentDigest: hash('td08-c0-content'), productManifestDigest: hash('td08-c0-manifest'),
    packageName: '@abiogenesis/typescript-tenant', packageVersion: '5.0.0-dev.286' }, WORKSITE_C0_IDS.moduleRef);
  const graph = parts.graphFunctions[0], declared = parts.implementationBindings[0];
  const { kind, schemaVersion, disposition, leafResolutionCandidateRef, leafResolutionCandidateDigest, ...priorRow } = f.implementationSet.rows[0];
  const { kind: _declaredKind, bindingRef, ...bindingFields } = declared;
  const rowBody = { ...priorRow, ...bindingFields, graphFunctionRef: graph.name, graphFunctionDigest: hash(graph),
    nodeRef: graph.template.startNodeRef, programLocusRef: graph.template.startNodeRef, implementationBindingRef: bindingRef };
  const rowDigest = hash(rowBody), row = { kind, schemaVersion, disposition,
    leafResolutionCandidateRef: identity('leaf-resolution-candidate', rowDigest), leafResolutionCandidateDigest: rowDigest, ...rowBody };
  const setDigest = hash({ rows: [row] }), set = { implementationSetRef: identity('implementation-set', setDigest), implementationSetDigest: setDigest, rows: [row] };
  const implementationEvent = f.atCut(() => f.append('implementation_admitted', 'workspace', f.workspaceBinding.bindingId,
    { implementationSetRef: set.implementationSetRef, implementationSetDigest: setDigest, implementationSet: set,
      interactionSetRef: 'interaction-set://td08/c0', interactionSetDigest: hash('td08-c0-interactions') }, { scopeClass: 'workspace' }));
  const implementationSet = { kind: 'admitted_implementation_set', schemaVersion: '5.0.0', disposition: 'admitted', ...set, admissionEventRef: implementationEvent.eventId };
  const environment = e => ({ workspaceAuthorityBasis: e.workspaceAuthorityBasis, workspaceBinding: e.workspaceBinding,
    capabilityGrant: e.capabilityGrant, canonicalRoot: e.canonicalRoot, territory: e.territory, cCall: e.cCall });
  const rootState = (e, label) => {
    const env = environment(e);
    const { kind: _bindingKind, admissionEventRef: _bindingEvent, ...bindingBody } = env.workspaceBinding;
    const bindingCarrier = { kind: 'workspace_binding_candidate', ...bindingBody };
    const artifactBasis = { ...publicOperationBasis(product, 'abg.operation.workspace.bind', bindingCarrier.bindingId, bindingCarrier.bindingDigest,
      'invocation://td08/' + label + '-binding'), eventTime: f.common.eventTime, correlationId: f.common.correlationId };
    const { operationId, memberKey, definitionDigest, invocationRef, invocationPayloadDigest, invocationDigest } = artifactBasis;
    const payload = { operationId, memberKey, definitionDigest, authorityScopeRef: artifactBasis.authorityScopeRef,
      authorityScopeDigest: artifactBasis.authorityScopeDigest, invocationRef, invocationPayloadDigest, invocationDigest,
      ownerAdmittedDisposition: 'admitted', artifactRef: bindingCarrier.bindingId, artifactDigest: bindingCarrier.bindingDigest,
      artifact: bindingCarrier, workspaceAuthorityBasis: env.workspaceAuthorityBasis,
      causationEventRefs: artifactBasis.causationEventRefs, correlationId: artifactBasis.correlationId };
    const envelope = { scopeClass: 'workspace', basisId: artifactBasis.authorityScopeRef, parentAggregateId: null,
      causationEventRefs: artifactBasis.causationEventRefs, correlationId: artifactBasis.correlationId };
    if (preflight) f.atCut(() => f.append('public_operation_artifact_admitted', 'workspace', artifactBasis.authorityScopeRef, payload, envelope));
    else {
      const appended = appendCheckedArtifactEvent(f.store, selectHeldEventStoreDurablePrefix(f.store), deepFreeze({
        kind: 'public_operation_artifact_admitted', eventTime: artifactBasis.eventTime, aggregateType: 'workspace',
        aggregateId: artifactBasis.authorityScopeRef, workflowVersion: '5.0.0', ...envelope, payload }));
      assert.ok(appended.event, JSON.stringify(appended));
    }
    const invocation = f.atCut(() => f.invocation(env, { graphFunctionRef: graph.name, graphFunctionDigest: hash(graph) }));
    return { label, env, invocation, canonicalRoot: env.canonicalRoot };
  };
  const first = rootState(f, 'first'), other = rootState(second, 'second');
  let serial = 0;
  const request = async (state, path, predecessorObservation) => {
    const subject = product.constructWorksiteSubject({ ...state.env, relativePath: path, subjectUri: pathToFileURL(join(state.canonicalRoot, path)).href });
    const observation = predecessorObservation ?? await product.observeWorksiteSubject(state.env.workspaceAuthorityBasis, state.env.workspaceBinding, subject);
    return product.constructWorksiteFileReplaceRequest({ ...state.env, subject, territory: state.env.territory,
      predecessorObservation: observation, replacementBytes: Buffer.from(`td08 ${++serial}\n`) });
  };
  const basisFor = (state, value) => f.atCut(() => f.basisFor(state.env, state.invocation, value, { graphFunctionRef: graph.name,
    graphFunctionDigest: hash(graph), implementationSetRef: set.implementationSetRef, implementationSetDigest: setDigest }));
  const eventOf = ref => rows().find(row => row.eventId === ref);
  // A basis admission for one subject; the predecessor defaults to the physical observation now.
  const basis = async (state, path, predecessorObservation) => {
    const value = await request(state, path, predecessorObservation), admitted = basisFor(state, value);
    return { request: value, event: eventOf(admitted.admissionEventRef) };
  };
  const faulted = async (input, target) => {
    const original = { rename: fs.rename, open: fs.open }; let published = false, injected = 0;
    fs.rename = async (source, destination) => { const result = await original.rename(source, destination); if (destination === target) published = true; return result; };
    fs.open = async (path, ...args) => {
      if (published && path === target) { injected += 1; throw Object.assign(new Error('TD-08 post-publication EIO'), { code: 'EIO' }); }
      return original.open(path, ...args);
    };
    syncBuiltinESMExports();
    try { return await product.replaceWorksiteFile(input); }
    finally { Object.assign(fs, original); syncBuiltinESMExports(); assert.equal(injected, 1); }
  };
  // mode: 'success' (Result admitted), 'failure' (post-publication failure Result) or 'selected' (no effect yet).
  const c0 = async (state, path, { mode = 'success', runId } = {}) => {
    const value = await request(state, path), execution = basisFor(state, value), label = `td08/${++serial}`;
    const executionBasis = { kind: 'execution_basis', schemaVersion: '5.0.0', disposition: 'admitted', ...execution };
    const callBody = { basisId: execution.basisRef, graphCallId: 'graph-call://' + label, frameId: 'frame://' + label,
      vectorIndex: 0, stageRole: 'file-replace', taskOrdinal: null, attempt: 1, programLocusRef: row.programLocusRef, retryPath: [] };
    const cCallDigest = hash(callBody), callRef = `c-call:${cCallDigest}`;
    const scope = { basisId: execution.basisRef, graphFunctionRef: graph.name, graphCallId: callBody.graphCallId, frameId: callBody.frameId,
      ...(runId === undefined ? {} : { runId }) };
    const occurrence = f.atCut(() => {
      const opened = f.append('c_call_opened', 'c_call', callRef, { ...callBody, cCallRef: callRef, cCallDigest, callClass: 'leaf' }, scope);
      const fibre = f.append('c_call_fibre_selected', 'c_call', callRef, { cCallRef: callRef, callClass: 'leaf', armId: WORKSITE_C0_IDS.armId,
        regime: 'F_D', implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
        implementationRequirementKey: row.requirementKey, implementationSetRef: set.implementationSetRef }, { ...scope, causationEventRefs: [opened.eventId] });
      return { opened, fibre };
    });
    const cCall = { ...state.env.cCall, ...callBody, cCallRef: callRef, cCallDigest, graphFunctionRef: graph.name,
      implementationSetRef: set.implementationSetRef, implementationRequirementKey: row.requirementKey,
      implementationRef: row.implementationRef, implementationBindingRef: row.implementationBindingRef,
      inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef,
      failureContractRef: row.failureContractRef, refusalContractRef: row.refusalContractRef,
      openedEventRef: occurrence.opened.eventId, fibreSelectedEventRef: occurrence.fibre.eventId, runId: runId ?? f.common.runId };
    const authorization = product.constructWorksiteEffectAuthorization({ ...state.env, request: value, executionBasis, cCall, implementationSet });
    assert.equal(authorization.kind, 'worksite_effect_authorization', JSON.stringify(authorization));
    const result = { mode, request: value, fibre: occurrence.fibre, opened: occurrence.opened, authorization };
    if (mode === 'selected') return result;
    const input = { workspaceAuthorityBasis: state.env.workspaceAuthorityBasis, workspaceBinding: state.env.workspaceBinding,
      implementationSet, executionBasis, cCall, request: value, authorization };
    assert.equal(product.isWorksiteFileReplaceInput(input), true);
    const physical = mode === 'failure' ? await faulted(input, join(state.canonicalRoot, path)) : await product.replaceWorksiteFile(input);
    if (mode === 'failure') {
      assert.equal(product.isWorksitePostPublicationFailure(physical), true, JSON.stringify(physical));
      const evidence = f.atCut(() => {
        const body = { cCallRef: callRef, contractRef: WORKSITE_C0_IDS.failureContractRef, evidenceClass: 'deterministic',
          implementationRef: row.implementationRef, inputDigest: hash(value), outputDigest: hash(physical) };
        const digest = hash(body);
        return f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest },
          { ...scope, causationEventRefs: [occurrence.fibre.eventId] });
      });
      const event = f.atCut(() => {
        const body = { cCallRef: callRef, resultClass: 'failure', contractRef: WORKSITE_C0_IDS.failureContractRef,
          valueKind: 'worksite_effect_refusal', value: physical, valueDigest: hash(physical), evidenceRefs: [evidence.payload.evidenceRef] };
        const digest = hash(body);
        return f.append('c_call_result_admitted', 'c_call', callRef, { ...body, resultRef: identity('result', digest), resultDigest: digest },
          { ...scope, causationEventRefs: [evidence.eventId] });
      });
      return { ...result, physical, evidence, result: event };
    }
    assert.equal(physical.disposition, 'committed', JSON.stringify(physical));
    const output = { kind: 'worksite_file_replace_output', schemaVersion: '5.0.0', authorization,
      receipt: physical.receipt, successorObservation: physical.successorObservation };
    const evidence = f.atCut(() => {
      const body = { cCallRef: callRef, contractRef: WORKSITE_C0_IDS.outputContractRef, evidenceClass: 'worksite_file_replace',
        implementationRef: row.implementationRef, inputDigest: hash(value), outputDigest: hash(output), request: value, authorization,
        receipt: physical.receipt, successorObservation: physical.successorObservation };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', callRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest },
        { ...scope, causationEventRefs: [occurrence.fibre.eventId] });
    });
    const admitted = admittedResult(f, output, { callRef, contractRef: WORKSITE_C0_IDS.outputContractRef,
      evidenceRefs: [evidence.payload.evidenceRef], scope: { ...scope, causationEventRefs: [evidence.eventId] } });
    return { ...result, physical, evidence, result: admitted.event };
  };
  const foreignBasisId = () => rows().find(e => e.kind === 'basis_admitted' && e.payload.workspaceBindingId !== f.workspaceBinding.bindingId &&
    e.payload.rawInputValue?.kind === 'worksite_file_replace_request').basisId;
  // variant: 'task' (the U1 native task), 'no-task' (a basis without a native task) or 'other-run'.
  const unknown = (kindName = 'actor_process_termination_unconfirmed', variant = 'task') => {
    if (variant === 'task') return f.cause(kindName);
    const extra = variant === 'no-task' ? { basisId: foreignBasisId(), causationEventRefs: [f.process.eventId] }
      : { runId: 'run://td08/other', causationEventRefs: [] };
    const cCallRef = f.process.payload.cCallRef;
    return f.atCut(() => kindName === 'actor_invocation_failed'
      ? f.append(kindName, 'actor_invocation', f.actorRef, { actorInvocationRef: f.actorRef, processRef: f.processRef, cCallRef, disposition: 'failure',
        failureClass: 'transport_exception', transportBindingRef: f.binding.aggregateId, transportBindingDigest: f.binding.payload.transportBindingDigest,
        diagnosticDigest: hash('td08 ' + variant) }, { parentAggregateId: cCallRef, ...extra })
      : f.append(kindName, 'process', f.processRef, { actorInvocationRef: f.actorRef, processRef: f.processRef },
        { parentAggregateId: f.actorRef, ...extra }));
  };
  // A native observation Result whose known change is `path` under the first root.
  const nativeChange = async (path, label) => {
    await fs.writeFile(join(f.canonicalRoot, path), 'native ' + label + '\n');
    const after = await product.observeWorksiteContext({ workspaceAuthorityBasis: f.workspaceAuthorityBasis, workspaceBinding: f.workspaceBinding,
      readRoots: f.task.context.readRoots, maxFiles: f.task.context.maxFiles, maxBytes: f.task.context.maxBytes });
    const report = { summary: 'TD-08 native change ' + label, gaps: [] };
    const value = native.constructNativeWorkspaceWorkObservation(f.task, after, report, { cCallRef: f.process.payload.cCallRef,
      executionAuthorityRef: 'authority://td08/' + label, executionAuthorityDigest: hash(label), actorInvocationRef: f.actorRef,
      transportBindingRef: f.binding.aggregateId, transportBindingDigest: f.binding.payload.transportBindingDigest,
      promptDigest: hash(['prompt', label]), transportDigest: hash(['transport', label]) });
    assert.equal(native.isNativeWorkspaceWorkObservation(value), true, JSON.stringify(value));
    const nativeResultAssessment = await componentNativeAssessment(f.task, f.set, report);
    const evidence = f.atCut(() => {
      const body = { cCallRef: f.process.payload.cCallRef, contractRef: ids.observationContractRef, evidenceClass: 'probabilistic_transport',
        implementationRef: ids.implementationRef, inputDigest: hash(f.task), outputDigest: hash(value), transportDigest: value.provenance.transportDigest, nativeResultAssessment };
      const digest = hash(body);
      return f.append('c_call_evidenced', 'c_call', body.cCallRef, { ...body, evidenceRef: identity('evidence', digest), evidenceDigest: digest });
    });
    return admittedResult(f, value, { callRef: f.process.payload.cCallRef, contractRef: ids.observationContractRef,
      evidenceRefs: [evidence.payload.evidenceRef], scope: { causationEventRefs: [evidence.eventId] } }).event;
  };
  return { f, rows, first, other, graph, row, set, implementationSet, request, basis, c0, unknown, nativeChange, eventOf, preflight };
}
