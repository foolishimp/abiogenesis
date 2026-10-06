// REQ-P-QUAL-064A/B/C, REQ-P-SELF-CONFORMANCE-007A; T287 carrier HOW section 5.
// Component premises supply lower ABG admission/prefix facts and the current
// prepared-request/native-proof operation. No store, actor or Run is opened.
// The actual emitted admission callback, qualification producer and guard run.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {SourceTextModule, SyntheticModule} from 'node:vm';
import {sha256Bytes} from '../../build/code/src/shared/digests.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';
import {qualificationHash as hash, constructQualificationIdentity as identity,
  QUALIFICATION_ROLE_POLICY as policy, isQualificationJudgment} from '../../build/code/src/validator/qualification_contracts.js';
import {acquireQualificationResources} from '../../build/code/src/validator/qualification_resources.js';
import {isQualificationAssessmentInput, prepareQualificationAssessment} from '../../build/code/src/validator/qualification.js';
import {ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS as semantics,
  isQualificationContractValue} from '../../build/code/src/validator/self_conformance_semantics.js';
import {QUALIFICATION_IDS as q} from '../../build/code/src/gtl/self_conformance.js';

const tenant = path.resolve(import.meta.dirname, '../..');
const coordinate = (ref, digest = hash(ref)) => ({ref, digest});
const sourceCoordinate = ({ref, path, digest, byteCount}) => ({ref, path, digest, byteCount});
const prefix = deepFreeze({kind: 'durable_prefix_coordinate', schemaVersion: '5.0.0',
  eventLogRef: 'file:///component-premise-never-opened', prefixLength: 0, prefixDigest: hash('prefix'),
  storeIdentity: {device: 1, inode: 1, eventContractDigest: hash('event-contract')}, coordinateDigest: hash('coordinate')});
const material = (ref, text, relativePath) => {
  const bytes = Buffer.from(text);
  return {ref, path: relativePath, digest: sha256Bytes(bytes), byteCount: bytes.length, contentBase64: bytes.toString('base64')};
};

function assessmentInputs() {
  const catalogBytes = fs.readFileSync(path.join(tenant, 'contracts/qualification/rule-catalog.json'));
  const catalog = JSON.parse(catalogBytes);
  const sourceBindings = policy.authoritySourceRefs.map(ref => catalog.sources.find(source => source.ref === ref));
  assert(sourceBindings.every(Boolean), 'actual published role sources must exist');
  const authority = sourceBindings.map(source => ({...source,
    contentBase64: fs.readFileSync(path.join(tenant, source.path)).toString('base64')}));
  const member = material('source://lineage-component/member', 'export const selected = 1;\n', 'selected.mjs');
  const inventory = identity({kind: 'qualification_subject_inventory', selectedRoots: ['root://lineage-component'],
    coverage: 'complete_claim', members: [{...sourceCoordinate(member), surfaceRoles: ['code'],
      classificationEvidenceRefs: ['classification://component-premise']}]},
  'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
  const inventoryCoordinate = coordinate(inventory.inventoryRef, inventory.inventoryDigest);
  const role = {roleRef: policy.roleRefs[3], authorityRef: policy.authorityRef, sourceBindings,
    actorRef: policy.actorRefs[0], workerBindingRef: policy.workerBindingRef,
    rendererRef: policy.rendererRef, materializationPlanRef: policy.materializationPlanRef, independence: 'author_distinct'};
  const materials = [...authority, member];
  const members = materials.map(({ref: memberRef, path, digest, byteCount}) => ({memberRef, path, digest, byteCount}));
  const coverage = [{criterionRef: 'criterion://lineage-component', ruleRef: catalog.rules[0].ruleRef,
    surfaceRef: member.ref, evidenceRole: 'semantic_assessment'}];
  // This finite native construction attribution is a component data premise,
  // never evidence that the synthetic producer has an admitted Runtime Result.
  const provenance = {kind: 'native_construction', subjectInventory: inventoryCoordinate,
    producers: [{cCallRef: 'c-call://component-premise/producer', result: coordinate('result://component-premise/producer'),
      actorRef: 'actor://component-premise/author', workerBindingRef: 'worker-binding://component-premise/author',
      scopeRefs: [member.ref]}]};
  const task = identity({kind: 'qualification_assessment_task', schemaVersion: '5.0.0',
    slotRef: 'slot://lineage-component', taskOrdinal: 0, subjectBasis: coordinate('subject://lineage-component'),
    lawBasis: coordinate('law://lineage-component'), catalog: coordinate(catalog.catalogRef, sha256Bytes(catalogBytes)),
    inventory: inventoryCoordinate, role, context: {contextRef: 'context://lineage-component',
      sourceLocator: 'retained://lineage-component', inventoryDigest: hash(members), members}, declarations: [],
    assetSurface: {kind: 'qualification_assessment', requiredContexts: ['context://lineage-component'],
      standardsRefs: policy.authoritySourceRefs, outputContractRefs: [q.assessmentRaw],
      constructorRef: 'constructor://lineage-component', rendererRef: policy.rendererRef,
      proofObligationRefs: ['proof://lineage-component'], authoritySlots: [{authorityKindRef: policy.authorityRef,
        disposition: 'normal', fallbackPreconditionRefs: []}]}, material: materials,
    subjectMembers: [sourceCoordinate(member)], coverage, provenance, priorEvidenceRefs: [], residuals: []},
  'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  const plan = identity({kind: 'qualification_assessment_plan', subjectBasis: task.subjectBasis, lawBasis: task.lawBasis,
    slots: [{slotRef: task.slotRef, task: coordinate(task.taskRef, task.taskDigest), taskOrdinal: 0,
      graphFunctionRef: q.assessGraph, programLocusRef: task.slotRef, role, coverage}], coverage,
    sharedCoverage: 'disjoint', ownerAuthorityRef: policy.authorityRef, ownerActorRef: 'actor://component-premise/owner'},
  'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  const embedded = deepFreeze({kind: 'qualification_assessment_input', schemaVersion: '5.0.0', task, plan});
  assert(isQualificationAssessmentInput(embedded));
  const provenanceCoordinate = coordinate('qualification-provenance://abiogenesis/' + hash(provenance).slice(7), hash(provenance));
  const manifest = identity({kind: 'qualification_resource_manifest', schemaVersion: '1', subjectBasis: task.subjectBasis,
    lawBasis: task.lawBasis, catalog: task.catalog, inventory: task.inventory, declarationSelections: [],
    entries: [{entryKind: 'inventory', coordinate: inventoryCoordinate, value: inventory},
      ...materials.map(value => ({entryKind: 'material', coordinate: coordinate(value.ref, value.digest), value})),
      {entryKind: 'provenance', coordinate: provenanceCoordinate, value: provenance}]},
  'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const resource = coordinate(manifest.resourceRef, manifest.resourceDigest);
  const selection = (entryKind, entry) => ({kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry});
  const compactTask = identity({...task, representation: 'resource_refs_v1', resource,
    material: materials.map(value => selection('material', coordinate(value.ref, value.digest))),
    provenance: selection('provenance', provenanceCoordinate)}, 'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  const compactPlan = identity({...plan, slots: [{...plan.slots[0], task: coordinate(compactTask.taskRef, compactTask.taskDigest)}]},
    'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  const reference = deepFreeze({kind: 'qualification_assessment_input', schemaVersion: '5.0.0', task: compactTask, plan: compactPlan});
  assert(isQualificationAssessmentInput(reference));
  const resources = acquireQualificationResources({kind: 'qualification_resource_assertion', schemaVersion: '1',
    manifests: [manifest], declarationProofs: []});
  const raw = deepFreeze({kind: 'qualification_raw_judgment', schemaVersion: '5.0.0',
    criteria: coverage.map(c => ({...c, disposition: 'indeterminate', applicability: 'unknown',
      reason: 'Component carrier regression does not establish semantic adequacy.', sourceRefs: [member.ref], evidenceRefs: [],
      residuals: ['residual://semantic-assessment-open']})), residuals: ['residual://whole-F11-open'], attributions: []});
  return [{name: 'embedded', input: embedded, raw}, {name: 'reference', input: reference, raw, resources}];
}

class SuppliedAdmissionRefusal extends Error {}

async function actualOutcomeOwner(file, premise) {
  // Replace only lower ABG facts/operations. The selected owner body, mapping,
  // applicability guards and actual Product callback are not replaced/exported.
  const overrides = premise.overrides;
  const owner = new SourceTextModule(fs.readFileSync(file, 'utf8'), {identifier: file,
    initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; }});
  await owner.link(async specifier => {
    const url = specifier.startsWith('.') ? pathToFileURL(path.resolve(path.dirname(file), specifier)).href : specifier;
    const values = {...await import(url), ...overrides[specifier]};
    return new SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    });
  });
  await owner.evaluate();
  return owner.namespace;
}

function lowerAdmission(row) {
  let active = false, callback, admitted;
  const events = [];
  const store = {readAll: () => [...events]};
  const selectedPrefix = () => ({events: [...events]});
  const transport = Object.freeze({kind: 'component-admitted-actor-transport-premise'});
  const truth = () => ({runtimePrefix: selectedPrefix(), replayState: {kind: 'component-replay-premise'}});
  const recordEvidence = () => { events.push({kind: 'component-admitted-evidence-premise'}); return row; };
  return {store, selectedPrefix, truth, get callback() { return callback; }, get admitted() { return admitted; }, overrides: {
    './event_store.js': {
      isRuntimeEventTransactionActive: () => active,
      readActiveRuntimeTransactionAtDurablePrefix: () => [...events],
      admitRuntimeEventTransactionAtDurablePrefix: (_store, _prefix, stage) => {
        active = true;
        try { return {value: stage(), successorPrefix: prefix}; } finally { active = false; }
      },
    },
    './event_prefix.js': {selectValidatedRuntimeEventPrefix: () => selectedPrefix()},
    './replay.js': {projectActiveRuntimeTransaction: truth, projectRuntimeTruthAtDurablePrefix: truth},
    './probabilistic_result.js': {admitProbabilisticResultFromActorTransport: () =>
      ({kind: 'contract_admitted_probabilistic_result_candidate'})},
    './c_call.js': {
      projectActorTransportForResult: () => transport,
      deriveProbabilisticTransportEvidence: () => ({kind: 'probabilistic_transport_evidence_candidate'}),
      admitEvidence: recordEvidence,
      admitEvidenceFromActorTransport: (supplied) => { assert.strictEqual(supplied, transport); return recordEvidence(); },
      admitResult: (_store, _prefix, _graph, _function, _cursor, cCall, candidate, _disposition, contractRef,
        _kind, validate, evidence) => {
        callback = validate;
        assert.strictEqual(evidence[0], row, 'projection must consume the actual lower admitted row');
        if (!validate(candidate)) throw new SuppliedAdmissionRefusal('actual success callback refused at supplied lower admission boundary');
        admitted = {kind: 'admitted_c_call_result', schemaVersion: '5.0.0', disposition: 'admitted',
          cCallRef: cCall.cCallRef, value: candidate, valueDigest: hash(candidate), contractRef};
        events.push({kind: 'component-admitted-result-premise'});
        return admitted;
      },
      projectAdmittedCCallStateAtPrefix: (_prefix, cCall, result, judgment) => ({cCall, result, judgment}),
    },
  }};
}

async function throughActualCallback(file, fixture, evidence, validateLineage, contractCheck, regime = 'F_P') {
  const lower = lowerAdmission(evidence);
  const owner = await actualOutcomeOwner(file, lower);
  let projected;
  const cCall = {cCallRef: fixture.value.source.cCallRef, attempt: 1, runId: 'run://component-premise',
    graphCallId: 'graph-call://component-premise', frameId: 'frame://component-premise', taskOrdinal: 0,
    programLocusRef: 'locus://component-premise', graphFunctionRef: 'graph-function://lineage-component',
    implementationRef: fixture.implementationRef ?? q.assessImplementation, inputContractRef: q.assessmentInput,
    outputContractRef: fixture.outputContractRef ?? q.judgment, evidenceContractRef: 'contract://component-premise/evidence', retryPath: []};
  const input = {outcomeClass: 'leaf', regime, store: lower.store, predecessorPrefix: prefix, cCall,
    graph: {}, graphFunction: {name: cCall.graphFunctionRef, template: {applications: []}, declarations: {}}, cursor: {},
    basis: {correlationId: 'component-lineage'}, executionBasis: {programRef: 'program://component-premise'},
    implementationSet: {}, resolution: {}, input: fixture.input, inputDigest: hash(fixture.input),
    actorRuntimeBinding: {artifactTruth: {}}, outputValueKind: 'qualification_judgment', failureValueKind: 'self_conformance_failure',
    ownerReceipt: {computeRegime: regime, effectDisposition: 'dispatched',
      candidate: {disposition: 'success', resultCandidate: fixture.value, evidenceCandidates: [{kind: 'deterministic_evidence_candidate'}]},
      receipt: regime === 'F_P' ? {computeRegime: 'F_P', actorProcessExchange: {request: fixture.request,
        observation: {disposition: 'success'}}} : {computeRegime: 'F_D'},
      workerContracts: {instructionContractRef: q.assessmentInput, resultContractRef: q.assessmentRaw}},
    leafPort: {validateContractValue: (_ref, kind, value) => kind === 'output' && contractCheck(value),
      validateResultEvidenceLineage: (outputContractRef, value, admittedEvidence) => {
        projected = admittedEvidence;
        return validateLineage({outputContractRef, value, admittedEvidence});
      }},
  };
  let receipt;
  try { receipt = owner.admitCCallResult(input); }
  catch (error) {
    if (!(error instanceof SuppliedAdmissionRefusal)) throw error;
    return {accepted: false, projected, lower, refusal: error.message};
  }
  assert.equal(receipt.disposition, 'result');
  // Pure receipt rehydration is also real; the lower prefix/state premises are
  // explicit and do not establish a genuine durable store or semantic judgment.
  const projectedReceipt = owner.projectCCallOutcomeReceiptAtPrefix(prefix, {disposition: 'judged',
    admitted: {cCall, result: lower.admitted, judgment: {kind: 'component-judgment-premise'}}});
  assert.equal(projectedReceipt.disposition, 'judged');
  assert.strictEqual(projectedReceipt.successorPrefix, prefix);
  return {accepted: true, projected, receipt, lower};
}

function admittedEvidence(value) {
  const source = value.source;
  return deepFreeze({kind: 'admitted_c_call_evidence', schemaVersion: '5.0.0', disposition: 'admitted',
    cCallRef: source.cCallRef, evidenceRef: 'evidence://component-lineage', evidenceDigest: hash('evidence'),
    evidenceClass: 'probabilistic_transport', contractRef: 'contract://component-premise/evidence',
    implementationRef: q.assessImplementation, inputDigest: source.inputDigest, outputDigest: hash(value),
    actorInvocationRef: source.actorInvocationRef, actorRef: source.actorRef, workerBindingRef: source.workerBindingRef,
    transportBindingRef: source.transportBindingRef, transportBindingDigest: source.transportBindingDigest,
    requestDigest: source.requestDigest, promptDigest: source.promptDigest,
    transportDisposition: 'success', transportFailureClass: null, transportDigest: hash('transport')});
}

test('actual CCall callback conserves admitted lineage for both qualification task forms without weakening any guard', async t => {
  const started = performance.now();
  const file = path.join(tenant, 'build/code/src/abg/c_call_outcome.js');
  const baseline = process.env.ABI5_RESULT_LINEAGE_BASELINE;
  const outcomes = [];
  for (const fixture of assessmentInputs()) {
    const preparation = prepareQualificationAssessment(fixture.input, fixture.resources);
    const request = preparation.request;
    const nativeBasis = {cCallRef: 'c-call://lineage-component/' + fixture.name, predecessorPrefix: prefix};
    const source = {cCallRef: nativeBasis.cCallRef, inputDigest: hash(fixture.input),
      actorRef: request.actorRef, workerBindingRef: request.workerBindingRef,
      actorInvocationRef: 'actor-invocation://lineage-component/' + fixture.name,
      transportBindingRef: 'transport://lineage-component', transportBindingDigest: hash('binding'),
      requestDigest: hash(request), observationDigest: hash('observation'), promptDigest: hash(request.prompt), rawValueDigest: hash(fixture.raw)};
    const value = preparation.complete(fixture.raw, nativeBasis, source);
    assert(isQualificationJudgment(value));
    assert(preparation.matches(fixture.input, value));
    const complete = {...fixture, request, value};
    const row = admittedEvidence(value);
    const check = basis => semantics.validateResultEvidenceLineage({...basis,
      nativeProof: {qualificationRequest: () => request}});
    const contractCheck = value => isQualificationContractValue('qualification_judgment', value);
    const current = await throughActualCallback(file, complete, row, check, contractCheck);
    assert.equal(current.accepted, true, fixture.name);
    assert.equal(current.projected[0].inputDigest, hash(fixture.input));
    assert(current.projected.every(Object.isFrozen));
    assert.equal(Object.values(current.projected[0]).some(value => value === undefined), false);
    assert.equal(current.projected[0].transportFailureClass, null);
    // These are the preexisting native-work/Consensus consumer coordinates.
    for (const field of ['evidenceRef', 'evidenceDigest', 'evidenceClass', 'outputDigest', 'transportDigest']) {
      assert.equal(current.projected[0][field], row[field], field);
    }
    assert.equal(current.projected[0].cCallRef, source.cCallRef);
    assert.equal(current.projected[0].cCallAttempt, 1);
    if (baseline) {
      const old = await throughActualCallback(baseline, complete, row, check, contractCheck);
      assert.equal(old.accepted, false, 'exact emitted preimage loses required lineage');
      assert.equal(Object.hasOwn(old.projected[0], 'inputDigest'), false);
    }
    const negativeResults = [];
    for (const field of ['inputDigest', 'requestDigest', 'promptDigest', 'outputDigest', 'actorInvocationRef', 'actorRef',
      'workerBindingRef', 'transportBindingRef', 'transportBindingDigest', 'transportDisposition', 'transportFailureClass']) {
      const changed = {...row, [field]: field === 'transportDisposition' ? 'failure'
        : field === 'transportFailureClass' ? 'component_transport_failure' : field.endsWith('Digest') ? hash('foreign-' + field) : 'foreign://' + field};
      const refused = await throughActualCallback(file, complete, changed, check, contractCheck);
      assert.equal(refused.accepted, false, fixture.name + ': ' + field);
      negativeResults.push(field);
    }
    const missing = {...row}; delete missing.inputDigest;
    assert.equal((await throughActualCallback(file, complete, missing, check, contractCheck)).accepted, false);
    assert.equal(semantics.validateResultEvidenceLineage({outputContractRef: q.judgment, value,
      admittedEvidence: current.projected, nativeProof: {qualificationRequest: () => ({...request, prompt: request.prompt + '\nforeign'})}}), false);
    if (fixture.name === 'reference') {
      assert.equal(semantics.validateResultEvidenceLineage({outputContractRef: q.judgment, value, admittedEvidence: current.projected}), false,
        'reference J cannot supply its own missing prepared-request operation');
    }
    outcomes.push({form: fixture.name, inputDigest: hash(fixture.input), requestDigest: hash(request),
      judgmentDigest: hash(value), callback: 'accepted', exactPreimage: baseline ? 'refused' : 'not supplied',
      negatives: [...negativeResults, 'missing inputDigest', 'crossed prepared request']});
  }
  // The same actual owner projects a deterministic row without optional actor
  // fields. Honest absence stays absent, and the existing transport null stays.
  const value = {kind: 'component_output', schemaVersion: '5.0.0', source: {cCallRef: 'c-call://deterministic-component'}};
  const deterministic = {kind: 'admitted_c_call_evidence', evidenceRef: 'evidence://deterministic-component',
    evidenceDigest: hash('deterministic-evidence'), evidenceClass: 'deterministic', inputDigest: hash({}), outputDigest: hash(value)};
  const conserved = await throughActualCallback(file, {input: {}, value, implementationRef: 'implementation://component-deterministic',
    outputContractRef: 'contract://component-output'}, deterministic,
    () => true, supplied => supplied === value, 'F_D');
  assert.equal(conserved.accepted, true);
  assert.equal(conserved.projected[0].transportDigest, null);
  assert.equal(Object.values(conserved.projected[0]).some(value => value === undefined), false);
  for (const field of ['actorInvocationRef', 'actorRef', 'workerBindingRef', 'transportBindingRef', 'transportBindingDigest',
    'requestDigest', 'promptDigest', 'transportDisposition', 'transportFailureClass']) assert.equal(Object.hasOwn(conserved.projected[0], field), false, field);
  const report = {route: 'actual admitCCallResult -> stageCCallResult success callback -> actual qualification Product lineage guard; actual pure receipt rehydration',
    forms: outcomes, deterministicAbsenceAndTransportNull: 'conserved', suppliedPremises: ['lower ABG transaction/evidence/result/prefix facts',
      'native raw result preimage admission', 'current prepared-request/native-proof operation', 'synthetic native construction attribution'],
    alteredRows: 'component guard counterexamples; no native admission of corrupted rows is claimed',
    RuntimeAdmissions: 0, resourcesOpened: 0, helperActorProviderCalls: 0, semanticF11: 'open', elapsedMs: performance.now() - started};
  t.diagnostic(JSON.stringify(report));
  if (process.env.ABI5_RESULT_LINEAGE_REPORT) fs.writeFileSync(process.env.ABI5_RESULT_LINEAGE_REPORT, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
});
