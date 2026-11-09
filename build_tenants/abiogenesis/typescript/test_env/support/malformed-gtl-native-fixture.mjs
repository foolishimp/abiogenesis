// Closed lookup assumptions for already admitted lower native owners. These
// coordinates/events are synthetic and are never written to a runtime store.
// Exercises the actual qualification owner joins, not installed admission.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { constructSelfConformanceModulePublication, QUALIFICATION_IDS as ids } from '../../build/code/src/gtl/self_conformance.js';
import { materializeGraph } from '../../build/code/src/gtl/materialize.js';
import { modulePublicationSemanticDigest } from '../../build/code/src/product/publication.js';
import { qualificationHash as hash, constructQualificationIdentity as identity } from '../../build/code/src/validator/qualification_contracts.js';
import { projectTransportBindingSelection } from '../../build/code/src/abg/c_call.js';
export { hash, identity, ids };
export const coverage = JSON.parse(fs.readFileSync(new URL('../../contracts/qualification/coverage.json', import.meta.url)));
export const publication = constructSelfConformanceModulePublication({ productId: 'product://mechanical/qualification', artifactDigest: hash('artifact'),
  productContentDigest: hash('content'), productManifestDigest: hash('manifest'), packageName: '@abiogenesis/typescript-tenant', packageVersion: '5.0.0-dev.286' });
export const program = publication.programs.find(p => p.starts[0].graphFunctionRef === ids.malformedAssessGraph);
const coord = (ref, value = ref) => ({ ref, digest: hash(value) });
export function inputFixture() {
  const install = { admissionEventRef: 'event://1', productId: publication.owningProductId, packageName: '@abiogenesis/typescript-tenant', packageVersion: '5.0.0-dev.286',
    installId: 'install://mechanical', productContentDigest: hash('content'), artifactDigest: hash('artifact'), manifestDigest: hash('manifest') };
  const basis = identity({ kind: 'exact_candidate_qualification', projection: 'basis', schemaVersion: '5.0.0', subjectKind: 'pre_rc_candidate',
    productId: install.productId, productVersion: install.packageVersion, sourceInventory: coord('inventory://unassessed'), artifact: coord('artifact://selected', 'artifact'),
    productManifest: coord('manifest://selected', 'manifest'), productContentDigest: install.productContentDigest, toolchain: coord('toolchain://selected', 'manifest'),
    installedProduct: coord(install.installId, install), workspaceBinding: coord('workspace://mechanical', 'W'), prospectiveRelease: null, tenantManifest: null,
    coverageCatalog: { ref: coverage.catalogRef, digest: coverage.catalogDigest }, lawBasis: coverage.lawBasis },
    'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
  const declaration = { kind: 'abg_historical_declaration_proof', schemaVersion: '5.0.0', catalog: { basisDigest: hash('catalog') }, catalogView: { viewDigest: hash('view') } };
  const duplicateProgram = { ...program, starts: [...program.starts, program.starts[0]] };
  const duplicatePublication = { ...publication, programs: publication.programs.map(p => p.programRef === program.programRef ? duplicateProgram : p) };
  return { install, input: { kind: 'malformed_gtl_assessment_input', schemaVersion: '5.0.0', basis, coverage, declarations: [declaration], cases: [
    { caseRef: 'case://raw/wrong-kind', operation: 'raw', subjectKind: 'gtl_program', contractRef: 'contract://gtl/program', value: { kind: 'wrong' },
      expected: { boundary: 'raw_admission', disposition: 'refused', diagnostics: [{ code: 'invalid_kind', path: '$' }] } },
    { caseRef: 'case://program/control', operation: 'program', publication, program,
      expected: { boundary: 'program_validation', disposition: 'accepted', diagnostics: [] } },
    { caseRef: 'case://program/duplicate-start', operation: 'program', publication: duplicatePublication, program: duplicateProgram,
      expected: { boundary: 'program_validation', disposition: 'refused', diagnostics: [{ code: 'duplicate_identity', path: '$.program.starts' }] } },
  ] } };
}
export async function nativeJoinFixture({ changeInput, runtime = false, configureHello, consumerPublication, consumerIds,
  declarationProof, sameRealm = false, rootGraphFunctionRef, origin, sourceFixtures = [], nativeSourceOwners = [], ownerPremises = {} } = {}) {
  const f = inputFixture();
  if (origin) {
    f.install.installId = 'install://' + origin;
    const {basisRef, basisDigest, ...body} = f.input.basis;
    f.input.basis = identity({...body, installedProduct:coord(f.install.installId,f.install), workspaceBinding:coord('workspace://'+origin,origin)}, 'basisRef','basisDigest','qualification-basis://abiogenesis/');
  }
  if (changeInput) f.input = changeInput(structuredClone(f.input));
  if (declarationProof) f.input.declarations = [declarationProof];
  const counts = { catalog: 0, execution: 0, state: 0, assessment: 0, verdict: 0, terminal: 0, replay: 0, sourceRead: 0, environment: 0, transport: 0 };
  const acquisitions = [], computations = new Map();
  const input = f.input, declaration = input.declarations[0], pd = modulePublicationSemanticDigest(publication);
  const selectedProgram = rootGraphFunctionRef ? publication.programs.find(p => p.starts[0].graphFunctionRef === rootGraphFunctionRef) : runtime ? publication.programs.find(p => p.starts[0].graphFunctionRef === ids.runtimeAssessGraph) : program;
  const rootGraph = selectedProgram.starts[0].graphFunctionRef;
  const rootOutput = publication.graphFunctions.find(g => g.name === rootGraph).outputs[0];
  const { constructLanguageTestModulePublication, LANGUAGE_TEST_IDS } = await import('./language-test-gtl.mjs');
  const testIds = consumerIds ?? LANGUAGE_TEST_IDS;
  let hello = runtime ? (consumerPublication ?? constructLanguageTestModulePublication)({ productId: f.install.productId, artifactDigest: f.install.artifactDigest,
    productContentDigest: f.install.productContentDigest, productManifestDigest: f.install.manifestDigest,
    packageName: f.install.packageName, packageVersion: f.install.packageVersion }) : null;
  if (hello && configureHello) hello = configureHello(hello);
  const publications = hello ? [publication, hello] : [publication];
  const ownerOf = p => ({ productId: p.owningProductId, moduleRef: p.moduleRef, publicationDigest: modulePublicationSemanticDigest(p) });
  const invocations = new Map();
  const contractOwner = { productId: publication.owningProductId, moduleRef: publication.moduleRef, publicationDigest: pd };
  const closure = { kind: 'resolved_execution_declaration_closure', programPublication: publication, publications: [publication],
    graphFunctionOwners: publication.graphFunctions.map(g => ({ ...contractOwner, declarationRef: g.name })) };
  const events = [], calls = new Map(), executions = new Map(), states = new Map(), resolutions = new Map();
  const event = (kind, aggregateId, payload = {}, extra = {}) => { const e = { eventId: 'event://' + (events.length + 1), admissionOrdinal: events.length + 1,
    kind, aggregateId, payload, runId: 'run://mechanical', ...extra }; events.push(e); return e; };
  const installEvent = event('product_install_admitted', 'install'), workspaceEvent = event('workspace_binding_admitted', 'workspace');
  const environment = { kind: 'exact_prefix_workspace_environment', artifactTruth: {}, productInstalls: [f.install],
    workspaceBinding: { admissionEventRef: workspaceEvent.eventId }, workspaceBindingCandidate: {}, resolvedProductLock: {} };
  const invEvent = event('invocation_admitted', 'invocation');
  const invocation = { invocationAdmissionRef: 'invocation://mechanical', admissionEventRef: invEvent.eventId,
    outputContractRef: rootOutput, outputContractDigest: hash(publication.contracts.find(c => c.contractRef === rootOutput)), outputContractOwner: contractOwner };
  const prefixBase = { kind: 'durable_prefix_coordinate', schemaVersion: '5.0.0', eventLogRef: 'file:///unadmitted-malformed-gtl-fixture' + (origin ? '/' + origin : ''),
    storeIdentity: { device: 1, inode: 2, eventContractDigest: hash('synthetic-contract') } };
  // This fixture assumes durable admission. It hashes each synthetic event
  // once to select exact prefixes; it is not a physical event codec proof.
  const eventDigests = new WeakMap();
  const prefixDigest = n => hash(events.slice(0,n).map(e => { if(!eventDigests.has(e))eventDigests.set(e,hash(e));return eventDigests.get(e); }));
  const coordinate = n => ({ ...prefixBase, prefixLength: n, prefixDigest: prefixDigest(n), coordinateDigest: hash(['mechanical', n]) });
  const root = { basisRef: 'basis://root', basisClass: 'root', parentExecutionBasisRef: null, invocationAdmissionRef: invocation.invocationAdmissionRef,
    actorRef: 'actor://mechanical', programRef: selectedProgram.programRef, programDigest: hash(selectedProgram), graphFunctionRef: rootGraph,
    graphFunctionDigest: hash(publication.graphFunctions.find(g => g.name === rootGraph)), workspaceBindingId: input.basis.workspaceBinding.ref, workspaceBindingDigest: input.basis.workspaceBinding.digest,
    catalogBasisDigest: declaration.catalog.basisDigest, catalogViewDigest: declaration.catalogView.viewDigest,
    resultContractRef: rootOutput, rawInputAdmissionRef: 'input://root', rawInputDigest: hash(input), rawInputValue: input };
  executions.set(root.basisRef, root); invocations.set(invocation.invocationAdmissionRef, invocation);
  function open(graphRef, value, suffix, { termIndex = 0, prior = null, invocationRef = 'invocation://hello', regime = 'F_D' } = {}) {
    const pub = publications.find(p => p.graphFunctions.some(g => g.name === graphRef));
    const gf = pub.graphFunctions.find(g => g.name === graphRef), nodeTerm = gf.template.nodes[0].term;
    const terms = nodeTerm.kind === 'c_compose' ? nodeTerm.terms : nodeTerm.kind === 'c_edge'
      ? [nodeTerm.transform, nodeTerm.evaluate, nodeTerm.consequence] : [nodeTerm];
    const term = terms[termIndex], locus = term.programLocusRef;
    const binding = pub.implementationBindings.find(b => b.bindingRef === term.requirement.implementationBindingRef);
    const callRef = 'c-call://' + suffix, basisRef = prior?.execution.basisRef ?? 'basis://' + suffix;
    let execution = { ...root, basisRef, basisClass: 'child', parentExecutionBasisRef: root.basisRef,
      graphFunctionRef: gf.name, graphFunctionDigest: hash(gf), resultContractRef: binding.outputContractRef,
      rawInputAdmissionRef: 'input://' + suffix, rawInputDigest: hash(value), rawInputValue: value,
      implementationSetRef: 'set://' + suffix, implementationSetDigest: hash(['set', suffix]) };
    if (pub === hello) {
      const p = hello.programs.find(p => p.starts.some(s => s.graphFunctionRef === graphRef));
      const ref = invocationRef, admitted = invocations.get(ref) ?? (() => {
        const e = event('invocation_admitted', ref); const i = { invocationAdmissionRef: ref, admissionEventRef: e.eventId,
          outputContractRef: gf.outputs[0], outputContractDigest: hash(hello.contracts.find(c => c.contractRef === gf.outputs[0])),
          outputContractOwner: ownerOf(hello) }; invocations.set(ref, i); return i;
      })();
      Object.assign(execution, { basisClass: 'root', parentExecutionBasisRef: null, invocationAdmissionRef: admitted.invocationAdmissionRef,
        programRef: p.programRef, programDigest: hash(p), resultContractRef: gf.outputs[0] });
    }
    if (prior) execution = prior.execution;
    const graph = materializeGraph(gf, { invocationAdmissionRef: execution.invocationAdmissionRef, admittedInputRef: execution.rawInputAdmissionRef,
      admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    execution.basisDigest = hash(['synthetic admitted basis',execution]);
    execution.graphDigest = graph.materializationDigest; execution.graphRef = graph.materializationRef; executions.set(basisRef, execution);
    const call = { cCallRef: callRef, cCallDigest: hash(callRef), basisId: basisRef, runId: pub === hello ? 'run://hello' : 'run://mechanical', graphCallId: prior?.call.graphCallId ?? 'graph-call://' + suffix, frameId: prior?.call.frameId ?? 'frame://' + suffix,
      graphFunctionRef: gf.name, programLocusRef: locus, implementationRef: binding.implementationRef, implementationBindingRef: binding.bindingRef,
      inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef, regime, callClass: 'leaf' };
    calls.set(callRef, call); event('c_call_opened', callRef, call, { basisId: basisRef, runId: call.runId, graphFunctionRef: gf.name });
    event('c_call_fibre_selected', callRef, {implementationRef: call.implementationRef}, {basisId:basisRef,runId:call.runId,graphFunctionRef:gf.name});
    // Only executable leaf terms resolve an implementation row; a nested compose has none.
    resolutions.set(execution.implementationSetRef, { implementationSetDigest: execution.implementationSetDigest,
      rows: terms.filter(t => t.requirement !== undefined).map(t => { const b = pub.implementationBindings.find(b => b.bindingRef === t.requirement.implementationBindingRef); return { ...b, graphFunctionRef: gf.name, programLocusRef: t.programLocusRef, implementationBindingRef: b.bindingRef, implementationOwnerProductId: f.install.productId }; }) });
    return { call, execution, basis: { cCallRef: callRef, predecessorPrefix: coordinate(events.length) } };
  }
  function complete(opened, value, { deterministic = false, inputDigest = opened.execution.rawInputDigest, evidence = [] } = {}) {
    const call = opened.call, suffix = call.cCallRef.slice(9), result = { resultRef: 'result://' + suffix, resultDigest: hash(value), valueDigest: hash(value), value,
      resultClass: 'success', contractRef: call.outputContractRef, valueKind: value.kind, evidenceRefs: [] };
    // Supplied admitted evidence rows (for example actorTransport below).
    for (const row of evidence) { event('c_call_evidenced', call.cCallRef, row); result.evidenceRefs.push(row.evidenceRef); }
    if (deterministic) {
      const evidence = { evidenceRef: 'evidence://' + suffix, evidenceDigest: hash(['evidence', suffix]), evidenceClass: 'deterministic',
        implementationRef: call.implementationRef, inputDigest, outputDigest: hash(value) };
      event('c_call_evidenced', call.cCallRef, evidence); result.evidenceRefs.push(evidence.evidenceRef);
    }
    const judgment = { judgment: 'advance', judgmentRef: 'judgment://' + suffix };
    event('c_call_result_admitted', call.cCallRef, result, { graphCallId: call.graphCallId }); event('c_call_judged', call.cCallRef, judgment);
    states.set(call.cCallRef, { cCall: call, result, judgment, evidence: [] }); return result;
  }
  // One synthetic actor transport for an opened call: binding and start rows
  // with the binding's real body digest/ref form, and the transport evidence
  // row citing them. The process, artifact and terminal facts are premises.
  // `tamper` edits the admitted binding payload after its digest is fixed;
  // `bindingExtra` replaces binding event coordinates (for crossed negatives).
  function actorTransport(opened, { args, agentKey = 'claude', promptTransport = 'stdin', identity, actorRef, workerBindingRef,
    ordinal = 1, evidence: extra = {}, started: startedExtra = {}, tamper = payload => payload, bindingExtra = {} } = {}) {
    const call = opened.call, suffix = call.cCallRef.slice(9) + '/' + ordinal, inputDigest = opened.execution.rawInputDigest;
    const body = { cCallRef: call.cCallRef, actorRef, workerBindingRef, implementationBindingRef: call.implementationBindingRef,
      implementationRef: call.implementationRef, inputDigest, transportPlanDigest: hash(['synthetic plan', suffix]), agentKey, promptTransport,
      dispatchOrdinal: ordinal, args, ...(identity === undefined ? {} : { configuredIdentity: identity }) };
    const transportBindingDigest = hash(body), transportBindingRef = 'transport-binding://abiogenesis/' + transportBindingDigest.slice(7);
    const actorInvocationRef = 'actor-invocation://' + suffix;
    const binding = event('actor_transport_binding_admitted', transportBindingRef, tamper({ transportBindingRef, transportBindingDigest, ...body }),
      { aggregateType: 'transport_binding', parentAggregateId: call.cCallRef, causationEventRefs: [], basisId: call.basisId, runId: call.runId, ...bindingExtra });
    event('actor_invocation_started', actorInvocationRef, { actorInvocationRef, actorRef, workerBindingRef, cCallRef: call.cCallRef,
      implementationRef: call.implementationRef, inputDigest, transportBindingRef, transportBindingDigest, ...startedExtra },
      { aggregateType: 'actor_invocation', parentAggregateId: call.cCallRef, causationEventRefs: [binding.eventId], basisId: call.basisId, runId: call.runId });
    const row = { evidenceClass: 'probabilistic_transport', cCallRef: call.cCallRef, actorInvocationRef, actorRef, workerBindingRef,
      implementationRef: call.implementationRef, inputDigest, transportBindingRef, transportBindingDigest, transportDisposition: 'success',
      transportFailureClass: null, ...extra };
    return { ...row, evidenceRef: 'evidence://' + suffix + '/transport', evidenceDigest: hash(['evidence', suffix, row]) };
  }
  const realDeclarations = await import('../../build/code/src/product/declaration_closure.js');
  const qualification = await import('../../build/code/src/validator/qualification.js');
  const runtimeHistory = await import('../../build/code/src/abg/runtime_history.js');
  const stubs = {
    'validator/qualification.js': {...qualification, constructNativeRuntimeAssessment: (...args) => { counts.assessment++; return qualification.constructNativeRuntimeAssessment(...args); },
      reduceExactCandidateQualification: (...args) => { counts.verdict++; return qualification.reduceExactCandidateQualification(...args); }},
    'abg/event_store.js': { reidentifyHistoricalDurablePrefixCoordinate: (_current, historical) => {
      // Explicit lower-owner assumption; real held/cold identity is checked by
      // t287-held-prefix.test.mjs against a disposable actual event resource.
      stubs['abg/event_store.js'].readRuntimeEventsAtDurablePrefix(historical);
      return historical;
    }, assertDurableRuntimePrefixCurrent: p => {
      if (p.eventLogRef !== prefixBase.eventLogRef || p.storeIdentity.inode !== 2 || p.prefixLength !== events.length ||
        prefixDigest(p.prefixLength) !== p.prefixDigest) throw Error('foreign/stale mechanical prefix');
    }, readRuntimeEventsAtDurablePrefix: (p, options) => {
      counts.sourceRead++;acquisitions.push({...p});
      if (p.eventLogRef !== prefixBase.eventLogRef || p.storeIdentity.inode !== 2 || p.prefixLength > events.length ||
        prefixDigest(p.prefixLength) !== p.prefixDigest || options?.requireCurrent && p.prefixLength !== events.length) throw Error('foreign/stale mechanical prefix');
      return events.slice(0, p.prefixLength); } },
    // The owned prefix is the fixture's admitted array. Its finite selector
    // buckets use the actual runtime-history vocabulary, so joins keep their
    // real keys while the lower owner's acquisition stays an explicit premise.
    'abg/event_prefix.js': { readOwnedRuntimeEventPrefixAtDurablePrefix: (p, options) => stubs['abg/event_store.js'].readRuntimeEventsAtDurablePrefix(p, options),
      indexedRuntimeEvents: (p, key) => p.filter(e => runtimeHistory.runtimeHistorySelectorKeys(e).includes(key)),
      // The admitted array names its own cut; a routed real source names its rows.
      runtimeEventPrefixExtent: p => { const rows = Array.isArray(p) ? p : p.events;
        return { count: rows.length, lastOrdinal: rows.at(-1)?.admissionOrdinal ?? 0 }; },
      runtimePrefixComputation: (_p,key,construct) => { if(!computations.has(key))computations.set(key,construct()); return computations.get(key); } },
    'abg/artifact_truth.js': { projectOwnedPrefixArtifactTruth: p => ({kind:'exact_prefix_artifact_truth_projection',prefix:p,
      fixtureEvents:stubs['abg/event_store.js'].readRuntimeEventsAtDurablePrefix(p)}), runtimePrefixFromOwnedArtifactTruth: p => p.fixtureEvents },
    'abg/invocation_execution_truth.js': { projectExactExecutionBasisAtPrefix: (_p, ref) => { counts.execution++; return executions.get(ref) ?? null; },
      projectExactInvocationAdmissionAtPrefix: (_p, ref) => invocations.get(ref) ?? null },
    'abg/environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => {counts.environment++;return environment;},
      projectWorkspaceEnvironmentFromArtifactTruth: () => {counts.environment++;return environment;},
      projectAdmittedProductInstallByAdmissionEventRef: (_a, ref) => ref === installEvent.eventId ? { candidate: {} } : null },
    'product/declaration_closure.js': { reconstructHistoricalDeclarationCatalog: d => { counts.catalog++; assert.deepEqual(d, declaration);
        if (declarationProof) return realDeclarations.reconstructHistoricalDeclarationCatalog(d, d.catalog.readinessBasis);
        return { catalog: declaration.catalog, catalogView: declaration.catalogView }; },
      resolveExecutionDeclarationClosure: (_c, _v, ref, graphRef) => {
        const p = publications.find(p => p.programs.some(x => x.programRef === ref && x.starts.some(s => s.graphFunctionRef === graphRef)));
        return p ? { ...closure, programPublication: p, publications: [p], graphFunctionOwners: p.graphFunctions.map(g => ({ ...ownerOf(p), declarationRef: g.name })) } : null;
      },
      selectExactClosureContract: (c, ref) => { const p = c.publications.find(p => p.contracts.some(x => x.contractRef === ref));
        return p ? { contract: p.contracts.find(x => x.contractRef === ref), owner: ownerOf(p) } : null; } },
    'abg/execution_basis.js': { rehydrateAdmittedImplementationSetAtPrefix: (_p, ref) => resolutions.get(ref) ?? null },
    'abg/c_call.js': { projectOpenedCCallCarrierAtPrefix: (_p, graph, ref) => { const c = calls.get(ref), e = c && executions.get(c.basisId); return e && e.graphDigest === graph.materializationDigest ? c : null; },
      projectCCallCarrierPhaseAtPrefix: (p, c) => ({ phase: p.some(e => e.kind === 'c_call_result_admitted' && e.aggregateId === c.cCallRef) ? 'after_result' : 'selected_no_evidence' }),
      projectAdmittedCCallStateAtPrefix: (_p, c, r, j) => { counts.state++; const s = states.get(c.cCallRef); return s && s.result.resultRef === r.resultRef &&
        s.result.resultDigest === r.resultDigest && hash(s.result.value) === hash(r.value) && s.judgment.judgmentRef === j.judgmentRef ? s : null; },
      // Premise: the process lifecycle, artifact and terminal joins of the cited
      // transport are admitted. The binding and start rows are selected from the
      // admitted array and the actual c_call owner decides their identity join.
      projectAdmittedTransportEvidenceSelection: (p, cCallRef, evidence) => { counts.transport++;
        const binding = p.filter(e => e.kind === 'actor_transport_binding_admitted' && e.aggregateId === evidence.transportBindingRef);
        const started = p.filter(e => e.kind === 'actor_invocation_started' && e.aggregateId === evidence.actorInvocationRef);
        return binding.length !== 1 || started.length !== 1 ? null : projectTransportBindingSelection(binding[0], started[0], { cCallRef,
          actorInvocationRef: evidence.actorInvocationRef, transportBindingRef: evidence.transportBindingRef, transportBindingDigest: evidence.transportBindingDigest }); } },
  };
  // Explicitly labelled lower-owner premises a caller supplies over real modules.
  for (const [module, premise] of Object.entries(ownerPremises))
    stubs[module] = { ...(stubs[module] ?? await import(new URL('../../build/code/src/' + module, import.meta.url).href)), ...premise };
  // Each original resource has its own admitted lower-owner fixture. Route by
  // genuine fixture-prefix identity, never concatenate or transplant events.
  for (const module of ['abg/event_store.js','abg/artifact_truth.js','abg/invocation_execution_truth.js','abg/environment_admission.js','abg/execution_basis.js','abg/c_call.js']) {
    for (const [name, local] of Object.entries(stubs[module])) {
      if (typeof local !== 'function') continue;
      stubs[module][name] = (...args) => {
        const p = args[0], source = sourceFixtures.find(f => Array.isArray(p) ? p[0] === f.events[0] :
          (p?.eventLogRef ?? p?.prefix?.eventLogRef) === f.proof().prefix.eventLogRef);
        return (source?.nativeStubs[module]?.[name] ?? local)(...args);
      };
    }
  }
  // Optional real source owners acquire only a finite disposable physical copy.
  // Consumer admission remains this fixture's explicitly supplied premise.
  for (const [module, functions] of Object.entries(stubs)) {
    for (const [name, local] of Object.entries(functions)) {
      // Constants of a merged real module stay values.
      if (typeof local !== 'function') continue;
      functions[name] = (...args) => {
        const source = nativeSourceOwners.find(s => s.owns(args[0]));
        return (source?.modules[module]?.[name] ?? local)(...args);
      };
    }
  }
  // Runtime checks keep lower terminal/replay observations as explicit fixture assumptions.
  if (runtime) stubs['abg/project_read_ports.js'] = {
    GraphCallProjectionPort: { graph_call_result: packet => { counts.terminal++;
      const s = [...states.values()].filter(s => s.cCall.graphCallId === packet.targetRef).at(-1);
      return s ? { kind: 'abg_project_read_projection', value: { terminalResult: { result: coord(s.result.resultRef, s.result.value), value: s.result.value } } }
        : { kind: 'abg_project_read_refusal' };
    } },
    projectRunTruthAtDurablePrefix: (_p, run) => { counts.replay++; return run === 'run://hello'
      ? { kind: 'abg_run_truth_projection', runtimeStatus: 'closed', replay: coord('replay://hello') }
      : { kind: 'abg_run_truth_refusal' }; },
  };
  const rootUrl = new URL('../../build/code/src/', import.meta.url), context = sameRealm ? undefined : vm.createContext({ Buffer, URL, console }), modules = new Map();
  async function load(relative, source = false) {
    const url = new URL(relative, rootUrl).href; if (modules.has(url)) return modules.get(url);
    if (!source) { const ns = stubs[relative] ?? await import(url), keys = Object.keys(ns);
      const m = new vm.SyntheticModule(keys, function () { keys.forEach(k => this.setExport(k, ns[k])); }, { context, identifier: url }); modules.set(url, m); return m; }
    const m = new vm.SourceTextModule(fs.readFileSync(new URL(url), 'utf8'), { context, identifier: url }); modules.set(url, m);
    await m.link(async spec => {
      if (spec.startsWith('.')) return load(new URL(spec, url).href.slice(rootUrl.href.length));
      const ns = await import(spec), keys = Object.keys(ns); return new vm.SyntheticModule(keys, function () { keys.forEach(k => this.setExport(k, ns[k])); }, { context });
    }); await m.evaluate(); return m;
  }
  const owner = (await load('abg/qualification_proof.js', true)).namespace;
  const implementation = (await load('implementation/qualification.js', true)).namespace;
  const semantics = (await load('validator/self_conformance_semantics.js', true)).namespace;
  const proof = () => ({ kind: 'qualification_proof_resource', schemaVersion: '5.0.0', prefix: coordinate(events.length), declarations: [declaration], selections: [] });
  return { input, owner, implementation, semantics, open, complete, actorTransport, proof, coordinate, events, states, environment, invocation, root,
    hello, helloIds: testIds, consumerPublication: hello, consumerIds: testIds, counts, event, nativeStubs: stubs, executions, acquisitions, cold: () => computations.clear() };
}
