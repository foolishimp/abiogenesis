// Single-address-space consolidation proof support. Measurements observe the
// existing owners from outside; they select, cache and replace no owner value.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {stat} from 'node:fs/promises';
import {Session} from 'node:inspector';
import {syncBuiltinESMExports} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const schemaVersion = '5.0.0';

export async function fileSha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of fs.createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
export async function fileIdentity(path) {
  const value = await stat(path, {bigint: true});
  return {device: Number(value.dev), inode: Number(value.ino), size: Number(value.size),
    mtimeNs: value.mtimeNs.toString(), ctimeNs: value.ctimeNs.toString()};
}

// Owner functions whose call counts discriminate repeated full-history work:
// physical acquisition, body decoding, full materialization, immutability
// walks, prefix selection and canonical hashing; then the migrated invocation
// owners and the durable-prefix readers they select, which show the measured
// path reached them and which reader each one used; then the declaration,
// execution-basis, carrier and CCall-phase owners a qualification cut asks.
const COUNTED = ['readAll', 'materialize', 'snapshot', 'decodeEventBody', 'isImmutableRuntimeValue',
  'selectValidatedRuntimeEventPrefix', 'selectOwnedRuntimeEventPrefix', 'validateHistoricalEvents',
  'readAuthenticatedRuntimePrefixBytes', 'sha256Canonical', 'canonicalJson', 'acquireAbgEventResource',
  'closeAbgEventResource', 'runInstalledDefinitionCallWithResource', 'runInstalledDefinitionCallTransport',
  'admitTraversalFrameCursor', 'rehydrateParentReturnFrames',
  'readRuntimeEventsAtDurablePrefix', 'projectRuntimeEventsAtDurablePrefix', 'readHeldRuntimeEventsAtDurablePrefix',
  'readActiveRuntimeTransactionAtDurablePrefix', 'selectActiveRuntimeTransactionHistoryAtDurablePrefix',
  'readOwnedRuntimeHistoryAtDurablePrefix', 'projectOwnedRuntimeHistoryAtDurablePrefix',
  'RuntimeLivenessReconstruction', 'forkAt', 'abg/calculus/liveness.js#add',
  'reconstructHistoricalDeclarationCatalog', 'projectExactExecutionBasisAtPrefix', 'projectOpenedCCallCarrierAtPrefix',
  'projectAdmittedCCallStateAtPrefix', 'projectCCallPhase',
  'abg/event_prefix.js#runtimeEventAtPrefix', 'abg/event_prefix.js#indexedRuntimeEventEnvelopes',
  // Per-query layered reads of a liveness fork: each call, and each inherited
  // base row its filter visits (anchored at that callback's exact source).
  'abg/calculus/liveness.js#layered', 'abg/calculus/liveness.js@row => row.admissionOrdinal <= this.baseOrdinal'];
// A `module@source` key names the one function whose body starts at that
// exact compiled source text, for an anonymous callback.
const anchors = new Map();
const anchorOffset = (url, source) => {
  const key = url + '@' + source;
  if (!anchors.has(key)) {
    const text = fs.readFileSync(fileURLToPath(url), 'utf8'), at = text.indexOf(source);
    assert.ok(at >= 0 && text.indexOf(source, at + 1) < 0, 'one exact anchor ' + source);
    anchors.set(key, at);
  }
  return anchors.get(key);
};

/** Synchronous reads attributed by file identity, including descriptors the
 * owner opened before the interval (a held store keeps its descriptor). */
function readMeter(watchPaths) {
  const original = {readSync: fs.readSync, fstatSync: fs.fstatSync};
  const identities = new Set(watchPaths.filter(path => fs.existsSync(path)).map(path => {
    const value = fs.statSync(path); return value.dev + ':' + value.ino;
  }));
  const watched = new Map(), io = {readCalls: 0, readBytes: 0, watchedReadCalls: 0, watchedReadBytes: 0};
  const isWatched = descriptor => {
    if (!watched.has(descriptor)) {
      let value = false;
      try { const stat = original.fstatSync(descriptor); value = identities.has(stat.dev + ':' + stat.ino); } catch {}
      watched.set(descriptor, value);
    }
    return watched.get(descriptor);
  };
  fs.readSync = function (descriptor, ...rest) {
    const count = original.readSync.call(this, descriptor, ...rest);
    io.readCalls++; io.readBytes += count;
    if (typeof descriptor === 'number' && isWatched(descriptor)) { io.watchedReadCalls++; io.watchedReadBytes += count; }
    return count;
  };
  syncBuiltinESMExports();
  return {io, restore() { fs.readSync = original.readSync; syncBuiltinESMExports(); }};
}

/**
 * One inspector session counts owner function calls (precise coverage) under
 * the named build roots. Each measured interval also records wall/CPU time,
 * memory and synchronous file reads, with reads of watched files separated.
 */
export function openMeasurer(ownerRoots) {
  const session = new Session();
  session.connect();
  const post = (method, params = {}) => new Promise((ok, fail) => session.post(method, params, (error, value) => error ? fail(error) : ok(value)));
  const urls = ownerRoots.map(root => pathToFileURL(resolve(root)).href + '/');
  let enabled = false;
  const measurements = [];
  async function measure(name, action, {watchPaths = []} = {}) {
    if (!enabled) { await post('Profiler.enable'); enabled = true; }
    await post('Profiler.startPreciseCoverage', {callCount: true, detailed: false});
    await post('Profiler.takePreciseCoverage');
    globalThis.gc?.();
    const reads = readMeter(watchPaths), io = reads.io;
    const memoryBefore = process.memoryUsage(), cpu = process.cpuUsage(), started = performance.now();
    let value, wallMs, used, memoryAfter;
    try { value = await action(); }
    finally {
      wallMs = performance.now() - started; used = process.cpuUsage(cpu); memoryAfter = process.memoryUsage();
      reads.restore();
    }
    const coverage = await post('Profiler.takePreciseCoverage');
    await post('Profiler.stopPreciseCoverage');
    const ownerCalls = Object.fromEntries(COUNTED.map(key => [key, 0]));
    for (const script of coverage.result) {
      if (!urls.some(url => script.url.startsWith(url))) continue;
      for (const fn of script.functions) {
        if (Object.hasOwn(ownerCalls, fn.functionName)) ownerCalls[fn.functionName] += fn.ranges[0].count;
        // A `module#name` key counts one module's function whose name is not unique.
        const qualified = script.url.slice(script.url.lastIndexOf('/src/') + 5) + '#' + fn.functionName;
        if (qualified.includes('/') && Object.hasOwn(ownerCalls, qualified)) ownerCalls[qualified] += fn.ranges[0].count;
      }
      for (const key of COUNTED.filter(name => name.includes('@'))) {
        const [module, source] = [key.slice(0, key.indexOf('@')), key.slice(key.indexOf('@') + 1)];
        if (!script.url.endsWith('/src/' + module)) continue;
        const offset = anchorOffset(script.url, source);
        for (const fn of script.functions) if (fn.ranges[0].startOffset === offset) ownerCalls[key] += fn.ranges[0].count;
      }
    }
    const memory = value => ({rss: value.rss, heapUsed: value.heapUsed, external: value.external, arrayBuffers: value.arrayBuffers});
    const measurement = {name, wallMs, cpuUserMs: used.user / 1000, cpuSystemMs: used.system / 1000, io,
      memoryBefore: memory(memoryBefore), memoryAfter: memory(memoryAfter),
      heapUsedDelta: memoryAfter.heapUsed - memoryBefore.heapUsed, rssDelta: memoryAfter.rss - memoryBefore.rss, ownerCalls};
    measurements.push(measurement);
    return {value, measurement};
  }
  return {measure, measurements, close: () => session.disconnect()};
}

/** Unrelated workspace history admitted through the actual event owner. */
export function unrelatedWorkspaceEvent(hash, label) {
  return {kind: 'public_operation_admitted', eventTime: new Date().toISOString(), aggregateType: 'workspace',
    aggregateId: 'invocation://single-address-space/unrelated/' + label, parentAggregateId: null, causationEventRefs: [],
    correlationId: 'correlation://single-address-space/unrelated/' + label, workflowVersion: schemaVersion, scopeClass: 'workspace',
    basisId: 'basis://single-address-space/unrelated', payload: {invocationDigest: hash(label),
      invocationRef: 'invocation://single-address-space/unrelated/' + label, operationId: 'abg.operation.project.read', variant: 'status'}};
}

/** Deeply frozen fresh RAW vector; the readers never see a mutable row. */
export const freezeRaw = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freezeRaw); Object.freeze(value); } return value; };

/** One fresh immutable RAW F_H seed: conditional test-owned reader data, never
 * current root admission. The root record declares one explicit response grant
 * against the existing interaction.respond.approve packet; every row is stamped
 * by the actual projector over the rows before it. `cuts` name the prefix
 * length at which each reader gate's last row exists. */
export function rawFhResponseSeed({store, digests, family, interaction, capabilities, values, cursors}, {responseGrant = true} = {}) {
  const hash = digests.sha256Canonical, hex = digest => digest.slice('sha256:'.length);
  const H = label => hash(['single-address-space-raw-fh', label]), R = label => 'ref://single-address-space/raw-fh/' + label;
  const eventTime = '2026-11-04T00:00:00.000Z', correlationId = 'correlation://single-address-space/raw-fh/root';
  const workspace = {workspaceId: 'workspace://single-address-space/raw-fh', workspaceBindingId: 'workspace-binding://single-address-space/raw-fh',
    workspaceBindingDigest: H('workspace-binding')};
  const actorRef = 'actor://single-address-space/raw-fh/operator';
  const authority = {authorityRef: 'invocation-authority://single-address-space/raw-fh', authorityDigest: H('authority')};
  const policy = {policyRef: 'invocation-policy://single-address-space/raw-fh', policyDigest: H('policy')};
  const catalog = {catalogBasisRef: R('catalog-basis'), catalogBasisDigest: H('catalog-basis'), catalogViewId: R('catalog-view'), catalogViewDigest: H('catalog-view')};
  const program = {programRef: R('program'), programDigest: H('program'), graphFunctionRef: R('graph-function'), graphFunctionDigest: H('graph-function')};
  const graph = {graphRef: R('graph'), graphDigest: H('graph')};
  const sets = {implementationSetRef: R('implementation-set'), implementationSetDigest: H('implementation-set'),
    interactionSetRef: R('interaction-set'), interactionSetDigest: H('interaction-set')};
  // The grant's definition and capability come from the existing approve
  // packet; its catalog and capability-graph coordinates are RAW declarations.
  const definitionKey = {operationId: 'abg.operation.interaction.respond', memberKey: 'approve'};
  const definition = family.selectIntrinsicPublicFunctionDefinition(definitionKey);
  const packet = interaction.INTERACTION_OPERATION_CONTRACTS.respond.approve;
  assert.deepEqual([packet.definitionKey, packet.owner.authorityRef], [definitionKey, definition.semanticAuthorityRef]);
  assert.deepEqual([...packet.metadata.capabilityRefs], [...capabilities.capabilityRefsForDefinition(definitionKey)]);
  const capabilityRef = packet.metadata.capabilityRefs[0];
  const authorityBasis = {ref: 'workspace-authority://single-address-space/raw-fh', digest: H('workspace-authority')};
  const grantBody = {definitionKey, definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
    capabilityDefinition: {graphId: capabilities.CAPABILITY_DEFINITION_GRAPH_ID, graphVersion: schemaVersion, graphDigest: H('capability-graph'),
      capabilityId: capabilityRef, capabilityDefinitionRef: R('capability-definition'), capabilityDefinitionDigest: H('capability-definition')},
    operationContract: {contractCatalog: {productId: R('product'), productContentDigest: H('product'), catalogId: R('contract-catalog'),
      catalogVersion: schemaVersion, catalogDigest: H('contract-catalog')},
    flatRow: {contractId: definitionKey.operationId, contractVersion: schemaVersion, contractDigest: H('respond-contract')},
    nestedSelector: {selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null}},
    operationId: definitionKey.operationId, capabilityRef, actorRef, approvalRef: authorityBasis.ref, approvalDigest: authorityBasis.digest,
    ...policy, scopeRef: workspace.workspaceBindingId, scopeDigest: workspace.workspaceBindingDigest,
    authorityBasisRef: authorityBasis.ref, authorityBasisDigest: authorityBasis.digest};
  const grantDigest = hash(grantBody);
  const grant = freezeRaw({kind: 'capability_grant', schemaVersion, grantRef: 'capability-grant://abiogenesis/' + hex(grantDigest), grantDigest, ...grantBody});
  const grants = responseGrant ? [grant] : [];
  // The root invocation record: its digest names its admission ref.
  const invocationRef = 'invocation://single-address-space/raw-fh/root';
  const invokeDefinition = family.selectIntrinsicPublicFunctionDefinition({operationId: 'abg.operation.run.invoke', memberKey: 'invoke'});
  const rawInputValue = {subject: 'single-address-space raw F_H response pair'};
  const entry = {gtlEntryCoordinate: {entryRef: R('entry')}, gtlEntryTerm: {termRef: R('entry-term')}};
  const body = {invocationRef, invocationDigest: H('root-invocation'), invocationVariant: 'direct',
    rawInputAdmissionRef: R('raw-input'), rawInputDigest: values.canonicalRecordDigest(rawInputValue),
    publicRequestAdmissionRef: R('public-request'), publicRequestDigest: H('public-request'), publicRequestInvocationRef: invocationRef,
    ...workspace, ...catalog, catalogApplicationRefs: [], catalogApplicationDigests: [], programRef: program.programRef, programDigest: program.programDigest,
    catalogHandle: program.graphFunctionRef, graphFunctionRef: program.graphFunctionRef, graphFunctionDigest: program.graphFunctionDigest,
    selectedDefinitionRef: R('selected-definition'), selectedDefinitionDigest: H('selected-definition'), ...entry,
    inputContractRef: R('input-contract'), inputContractDigest: H('input-contract'), inputContractOwner: R('input-owner'),
    outputContractRef: R('output-contract'), outputContractDigest: H('output-contract'), outputContractOwner: R('output-owner'),
    productExecutionResolutionRef: R('execution-resolution'), productExecutionResolutionDigest: H('execution-resolution'),
    programValidationRef: R('program-validation'), programValidationDigest: H('program-validation'), ...policy,
    capabilityGrants: grants, capabilityGrantRefs: grants.map(value => value.grantRef), ...authority, actorRef,
    publicStart: null, reentryBasis: null, sourceResultBasis: null};
  const invocationAdmissionDigest = hash(body);
  const invocationAdmissionRef = 'invocation-admission://abiogenesis/' + hex(invocationAdmissionDigest);
  let rows = freezeRaw([]);
  const append = candidate => { const event = store.projectRuntimeEventFromValidatedHistory(rows, candidate); rows = freezeRaw([...rows, event]); return event; };
  const atWorkspace = (kind, causationEventRefs, basisId, payload) => ({kind, eventTime, aggregateType: 'workspace', aggregateId: workspace.workspaceBindingId,
    parentAggregateId: invocationRef, causationEventRefs, correlationId, workflowVersion: schemaVersion, scopeClass: 'workspace', basisId, payload});
  const invoke = append(atWorkspace('public_operation_admitted', [], authority.authorityRef, {
    operationId: 'abg.operation.run.invoke', memberKey: 'invoke', definitionDigest: invokeDefinition.definitionDigest, variant: 'direct',
    invocationRef, invocationDigest: body.invocationDigest, actorRef, ...authority, capabilityGrantRefs: body.capabilityGrantRefs,
    catalogApplicationRefs: [], catalogApplicationDigests: [], catalogBasisRef: catalog.catalogBasisRef, catalogBasisDigest: catalog.catalogBasisDigest,
    catalogViewId: catalog.catalogViewId, ...policy, workspaceBindingId: workspace.workspaceBindingId, programRef: program.programRef,
    catalogHandle: body.catalogHandle, graphFunctionRef: program.graphFunctionRef, selectedDefinitionRef: body.selectedDefinitionRef,
    selectedDefinitionDigest: body.selectedDefinitionDigest, programValidationRef: body.programValidationRef,
    programValidationDigest: body.programValidationDigest, ...entry}));
  const invocation = append(atWorkspace('invocation_admitted', [invoke.eventId], invocationAdmissionRef, {invocationAdmissionRef, invocationAdmissionDigest, ...body}));
  // The exact root basis and its Run binding.
  const basisBody = {basisClass: 'root', rawInputValue, rawInputDigest: body.rawInputDigest, rawInputAdmissionRef: body.rawInputAdmissionRef,
    invocationAdmissionRef, invocationRef, invocationDigest: body.invocationDigest, actorRef, workspaceBindingId: workspace.workspaceBindingId,
    workspaceBindingDigest: workspace.workspaceBindingDigest, ...catalog, ...program, ...graph, ...sets, programValidationRef: body.programValidationRef,
    graphValidationRef: R('graph-validation')};
  const basisDigest = hash(basisBody), basisRef = 'execution-basis://abiogenesis/' + hex(basisDigest);
  const basis = append(atWorkspace('basis_admitted', [invocation.eventId], basisRef, {basisRef, basisDigest, ...basisBody}));
  const runBody = {executionBasisRef: basisRef, executionBasisDigest: basisDigest, invocationAdmissionRef, invocationRef,
    workspaceBindingId: workspace.workspaceBindingId, programRef: program.programRef, graphFunctionRef: program.graphFunctionRef, ...graph};
  const runDigest = hash(runBody), runId = 'run://abiogenesis/' + hex(runDigest);
  const runEnvelope = {runId, graphFunctionRef: program.graphFunctionRef, materializationRef: graph.graphRef};
  const run = append({kind: 'run_segment_opened', eventTime, aggregateType: 'run', aggregateId: runId, parentAggregateId: workspace.workspaceBindingId,
    causationEventRefs: [basis.eventId], correlationId, workflowVersion: schemaVersion, scopeClass: 'run', basisId: basisRef, ...runEnvelope,
    payload: {runId, runDigest, ...runBody}});
  // One F_H pending CCall: open/fibre/result/judgment at the held cursor.
  const graphCallId = 'graph-call://single-address-space/raw-fh', frameId = 'frame://single-address-space/raw-fh';
  const inRun = (kind, aggregateType, aggregateId, parentAggregateId, causationEventRefs, payload) => ({kind, eventTime, aggregateType, aggregateId,
    parentAggregateId, causationEventRefs, correlationId, workflowVersion: schemaVersion, scopeClass: 'run', basisId: basisRef, ...runEnvelope,
    graphCallId, frameId, payload});
  const scopeBody = {executionBasisRef: basisRef, runId, graphCallId, frameId};
  const scopeDigest = hash(scopeBody), scopeRef = 'traversal-scope://single-address-space/raw-fh/' + hex(scopeDigest);
  const inputDigest = hash(rawInputValue);
  const heldCursor = cursors.constructTraversalCursorCandidate({programRef: program.programRef, executionBasisRef: basisRef, traversalScopeRef: scopeRef,
    runId, graphCallId, frameId, graphRef: graph.graphRef, inputRef: body.rawInputAdmissionRef, inputDigest, currentNodeRef: R('approval-node'),
    position: 'at_compute_locus', termPath: [], taskOrdinal: null, attempt: 1, retryPath: []});
  const programLocusRef = R('approval-locus');
  const cCallIdentity = {basisId: basisRef, graphCallId, frameId, vectorIndex: 0, stageRole: 'interaction', taskOrdinal: null, attempt: 1, programLocusRef, retryPath: []};
  const cCallDigest = hash(cCallIdentity), cCallRef = 'c-call:' + cCallDigest;
  const requestContractRef = R('approval-request-contract'), responseContractRef = R('approval-response-contract');
  const fibre = {regime: 'F_H', armId: R('approval-arm'), compositionRef: R('approval-composition'), implementationSetRef: sets.implementationSetRef,
    interactionSetRef: sets.interactionSetRef, interactionRequirementKey: 'approval', interactionKind: 'approval', actorCapabilityRef: capabilityRef,
    requestContractRef, responseContractRef, continuationContractRef: R('approval-continuation-contract')};
  const cCallOpened = append(inRun('c_call_opened', 'c_call', cCallRef, frameId, [run.eventId], {cCallRef, cCallDigest, callClass: 'leaf',
    cursorRef: heldCursor.cursorRef, cursorDigest: heldCursor.cursorDigest, edgeRef: R('approval-edge'), ...cCallIdentity, graphFunctionRef: program.graphFunctionRef}));
  const fibreSelected = append(inRun('c_call_fibre_selected', 'c_call', cCallRef, frameId, [cCallOpened.eventId], {cCallRef, callClass: 'leaf', ...fibre}));
  const cCall = freezeRaw({kind: 'c_call', schemaVersion, cCallRef, cCallDigest, callClass: 'leaf', basisId: basisRef, runId,
    graphFunctionRef: program.graphFunctionRef, graphCallId, frameId, edgeRef: R('approval-edge'), vectorIndex: 0, stageRole: 'interaction', batchRef: null,
    taskOrdinal: null, attempt: 1, programLocusRef, retryPath: [], regime: 'F_H', armId: fibre.armId, compositionRef: fibre.compositionRef,
    implementationSetRef: sets.implementationSetRef, implementationRequirementKey: null, implementationBindingRef: null, implementationRef: null,
    interactionSetRef: sets.interactionSetRef, interactionRequirementKey: 'approval', interactionKind: 'approval', actorCapabilityRef: capabilityRef,
    responseContractRef, continuationContractRef: fibre.continuationContractRef, childGraphFunctionRef: null, inputContractRef: requestContractRef,
    outputContractRef: responseContractRef, failureContractRef: R('failure-contract'), refusalContractRef: R('refusal-contract'), refusalValueKind: 'refusal',
    evidenceContractRef: null, judgmentContractRef: R('judgment-contract'), rejectionContractRef: R('rejection-contract'),
    transitionContractRef: R('transition-contract'), closureContractRef: R('closure-contract'), closureContractDigest: H('closure-contract'),
    judgmentPredicateRef: R('judgment-predicate'), terminalPredicateRef: R('terminal-predicate'), replayProjectionRef: R('replay-projection'),
    terminalKind: 'completed', openedEventRef: cCallOpened.eventId, fibreSelectedEventRef: fibreSelected.eventId});
  const request = {subject: 'approve the single-address-space RAW F_H seed'};
  const requestDigest = hash(request), requestRef = 'interaction-request://single-address-space/raw-fh/' + hex(requestDigest);
  const requestValue = {requestRef, requestDigest, request};
  const resultBody = {valueDigest: hash(requestValue), cCallRef, resultClass: 'pending', contractRef: requestContractRef, valueKind: 'interaction_request',
    value: requestValue, evidenceRefs: []};
  const resultDigest = hash(resultBody), resultRef = 'result://abiogenesis/' + hex(resultDigest);
  const result = append(inRun('c_call_result_admitted', 'c_call', cCallRef, frameId, [fibreSelected.eventId], {resultRef, resultDigest, ...resultBody}));
  const pendingResult = freezeRaw({kind: 'admitted_c_call_result', schemaVersion, disposition: 'admitted', resultRef, resultDigest, ...resultBody,
    admissionEventRef: result.eventId});
  const judgmentBody = {cCallRef, resultRef, resultDigest, judgment: 'pending', reasonRef: R('pending-reason'), contractRef: cCall.judgmentContractRef,
    predicateRef: cCall.judgmentPredicateRef, replayStateDigest: H('replay-state'), retryAttemptRef: null};
  const judgmentDigest = hash(judgmentBody), judgmentRef = 'judgment://abiogenesis/' + hex(judgmentDigest);
  const judgment = append(inRun('c_call_judged', 'c_call', cCallRef, frameId, [result.eventId], {judgmentRef, judgmentDigest, ...judgmentBody}));
  const pendingJudgment = freezeRaw({kind: 'admitted_c_call_judgment', schemaVersion, disposition: 'admitted', judgmentRef, judgmentDigest, ...judgmentBody,
    admissionEventRef: judgment.eventId});
  // The hold route consumes the pending judgment; the opening names no construction intent.
  const routeBody = {routeKind: 'hold', sourceCursorRef: heldCursor.cursorRef, sourceCursorDigest: heldCursor.cursorDigest, cCallRef, judgmentRef,
    consumedAvailabilityRefs: [judgmentRef]};
  const routeDigest = hash(routeBody), routeRef = 'route://single-address-space/raw-fh/' + hex(routeDigest);
  const hold = append(inRun('traversal_route_admitted', 'frame', frameId, graphCallId, [judgment.eventId], {routeRef, routeDigest, ...routeBody}));
  const continuationDigest = hash({continuationKind: 'fh_interaction', runId, graphCallId, frameId, cCallRef, heldCursorRef: heldCursor.cursorRef,
    heldCursorDigest: heldCursor.cursorDigest, requestRef, requestDigest, actorCapabilityRef: capabilityRef, responseContractRef,
    executionBasisRef: basisRef, constructionIntentRef: null});
  const continuationRef = 'continuation://abiogenesis/' + hex(continuationDigest);
  const opened = append(inRun('fh_interaction_opened', 'continuation', continuationRef, frameId, [hold.eventId], {
    continuationRef, continuationDigest, continuationKind: 'fh_interaction', causedByEventRef: judgment.eventId, holdRouteRef: routeRef, cCallRef,
    requestContractRef, requestRef, requestDigest, responseContractRef, actorCapabilityRef: capabilityRef, heldCursorRef: heldCursor.cursorRef,
    heldCursorDigest: heldCursor.cursorDigest, inputRef: heldCursor.inputRef, inputDigest, inputValue: rawInputValue, ...sets, executionBasisRef: basisRef,
    executionBasisDigest: basisDigest, scopeRef, scopeDigest, ...program, ...graph, programValidationRef: body.programValidationRef,
    graphValidationRef: basisBody.graphValidationRef, openedTraversalScope: {scopeRef, scopeDigest, ...scopeBody}, heldCursor, cCall, pendingResult,
    pendingJudgment, productId: R('product'), productContentDigest: H('product'), manifestDigest: H('manifest'), installId: R('install'),
    workspaceBindingId: workspace.workspaceBindingId, workspaceBindingDigest: workspace.workspaceBindingDigest, catalogViewId: catalog.catalogViewId,
    catalogViewDigest: catalog.catalogViewDigest}));
  const events = {invoke, invocation, basis, run, cCallOpened, fibreSelected, result, judgment, hold, opened};
  return freezeRaw({rows, events, cuts: {invocation: 2, basis: 3, run: 4, pending: 8, hold: 9, opened: 10}, grant, definitionKey,
    definitionDigest: definition.definitionDigest, capabilityRef, actorRef, workspace, invocationRef, invocationAdmissionRef, basisRef, runId,
    graphCallId, frameId, cCall, pendingResult, pendingJudgment, continuationRef, requestContractRef, responseContractRef});
}

/** Per-call setup observation: wraps the maintained caller without changing its calls. */
export function observeSetupCaller(caller, watchPath) {
  const observed = new Map(), authorizations = new Map(), rows = [], lifecycle = {acquisitions: 0, closes: 0};
  const {invoke, authorize, acquire, close} = caller;
  let pendingAuthorization = null;
  caller.authorize = async (...args) => { pendingAuthorization = args; return authorize(...args); };
  caller.acquire = assertion => { lifecycle.acquisitions++; return acquire(assertion); };
  caller.close = (...args) => { lifecycle.closes++; return close(...args); };
  caller.invoke = async (label, call, options) => {
    authorizations.set(label, pendingAuthorization); pendingAuthorization = null;
    const entry = caller.state.selection?.prefix ?? null, reads = readMeter([watchPath]);
    const started = performance.now(), cpu = process.cpuUsage();
    let result;
    try { result = await invoke(label, call, options); }
    finally { reads.restore(); }
    const used = process.cpuUsage(cpu), last = caller.state.calls.at(-1);
    observed.set(label, result);
    rows.push({label, acquisitionKind: last.acquisitionKind, entryPrefixLength: entry?.prefixLength ?? null,
      successorPrefixLength: caller.state.selection?.prefix.prefixLength ?? null, eventLogReadCalls: reads.io.watchedReadCalls,
      eventLogReadBytes: reads.io.watchedReadBytes, wallMs: performance.now() - started, cpuUserMs: used.user / 1000});
    return result;
  };
  return {observed, authorizations, rows, lifecycle};
}
