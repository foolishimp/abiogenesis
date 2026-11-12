// TD-34, first part (T-292). The run invocation door checks a caller-supplied
// Catalog and view with the GTL owner's schemas (`gtl/serialization_contracts.ts`)
// instead of a hand copy. This is the fallback path: a Catalog or view that the
// Catalog owner did not establish takes the binder's resource gate. There the
// door now refuses what the GTL owner refuses and the copy admitted: a compose
// with one term, a batch with no task, and an over-long tuple at
// `constructionComposition.authorities` and at both closure-contract
// `eventKindRefs` (the copy returned the tuple truncated). The three checks in
// which the copy was stricter than the owner stay at this door: a blank
// declaration value, a blank policy value and the semantic job stage
// invariants. A well-formed caller-supplied Catalog is admitted and reaches the
// run owner as before. Every case goes through the public native transport.
// Before TD-34 the first group passed the door and reached the run owner (the
// Return records that run). A graph application whose `relationKind` is not in
// the GTL owner's application union (`gate`) is refused by that owner's schema
// at raw admission, at Catalog admission and at this door.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as v from 'valibot';
import { constructD2FrameDeclarations, nativePublications } from '../support/d2-frame-fixture.mjs';
import { genericIntakePublicationData } from '../support/t287-generic-job-intake.mjs';

const packageRoot = process.env.ABI5_ENV_TEST_PACKAGE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = path => import(pathToFileURL(join(packageRoot, 'build/code/src', path + '.js')).href);
const [product, gtl, serialization, publicApi, resourceOwner, operations, family, projections, mechanics, validator] = await Promise.all([
  'product/index', 'gtl/index', 'gtl/serialization_contracts', 'public/index', 'abg/definition_event_resource',
  'product/run_operation_contracts', 'public/binding/public_function_family', 'public/binding/public_function_projections',
  'public/binding/definition_binding_mechanics', 'validator/index'].map(load));

const schemaVersion = '5.0.0';
const hash = product.sha256Canonical;
const digest = c => 'sha256:' + c.repeat(64);
const basis = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: digest('a'), productContentDigest: digest('b'), productManifestDigest: digest('c') };

// One exact run.invoke call over a fixed coordinate (the W2-05 construction).
function exactInvokeCall(resources) {
  const packet = operations.RUN_OPERATION_CONTRACTS.invoke.invoke;
  const definition = family.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
    d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
  const member = family.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(o => o.operationId === definition.definitionKey.operationId)
    ?.definitions.find(d => d.definitionKey.memberKey === definition.definitionKey.memberKey);
  assert.ok(definition && member);
  const catalogCoordinate = { productId: 'product://abiogenesis/typescript-tenant@5', productContentDigest: hash({ product: 'td34a' }),
    catalogId: 'catalog://abiogenesis/public-contracts@5', catalogVersion: schemaVersion, catalogDigest: hash({ catalog: 'td34a' }) };
  const coordinate = ref => ({ ref, digest: hash({ ref }) });
  const contractCoordinate = (slot, definitionRef) => ({ contractCatalog: catalogCoordinate,
    flatRow: { contractId: definition.definitionKey.operationId, contractVersion: schemaVersion,
      contractDigest: projections.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(a => a.operationId === definition.definitionKey.operationId).contentDigest },
    nestedSelector: { selectorKind: 'operation_definition_slot', definitionKey: definition.definitionKey, slot, definitionRef } });
  const input = { value: 'admitted' }, inputContract = coordinate('contract://td34a/input');
  const request = { program: coordinate('program://td34a'), catalogHandle: 'graph-function://td34a', inputContract, input,
    catalogView: coordinate('catalog-view://td34a'), allowlist: [], sourceBasis: { kind: 'none' } };
  const slots = { workspace_binding: coordinate('workspace-binding://td34a'), product_set: [coordinate('product-set://td34a')],
    dependency_lock: coordinate('product-lock://td34a'),
    catalog_scope: { catalog: coordinate('catalog://td34a'), view: request.catalogView, allowlist: [] },
    execution_program: request.program,
    graph_function: { graphFunction: coordinate('graph-function://td34a'), membership: coordinate('program-membership://td34a') },
    input_contract: { contract: inputContract, valueRef: 'value://td34a/input', valueDigest: hash(input), value: input },
    session_policy: coordinate('session-policy://td34a'),
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [coordinate('capability-grant://td34a')] },
    actor: { actor: coordinate('actor://td34a'), attribution: coordinate('attribution://td34a') },
    transport_steering: coordinate('transport-steering://td34a'), verification_references: null, execution_basis: null };
  const authorityBody = { kind: 'invocation_authority', definitionKey: definition.definitionKey, slots };
  const requestDigest = hash(request);
  const body = { kind: 'public_invocation', schemaVersion,
    invocationContract: { contractCatalog: catalogCoordinate,
      flatRow: { contractId: 'abg.schema.public-operation-invocation', contractVersion: schemaVersion,
        contractDigest: projections.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest },
      nestedSelector: { selectorKind: 'schema_definition', definitionKey: null, slot: null, definitionRef: '#/$defs/PublicInvocation' } },
    definitionRef: definition.definitionRef, definitionVersion: schemaVersion, definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey, contractCatalog: catalogCoordinate,
    invocationAuthority: { ...authorityBody, authorityDigest: hash(authorityBody) },
    requestContract: contractCoordinate('request', member.requestContract.definitionRef),
    requestRef: `public-request://abiogenesis/${requestDigest.slice('sha256:'.length)}`, requestDigest, request,
    expectedResultContract: contractCoordinate('result', member.resultContract.definitionRef),
    expectedRefusalContract: contractCoordinate('refusal', member.refusalContract.definitionRef),
    expectedNonTerminalContract: contractCoordinate('non_terminal', member.nonTerminalContract.definitionRef),
    correlationRef: 'correlation://abiogenesis/t292/td34a', eventTime: '2026-11-12T00:00:00.000Z',
    provenanceRefs: ['provenance://abiogenesis/t292/td34a'] };
  const invocationDigest = hash(body);
  return { invocation: { ...body, invocationRef: `invocation://abiogenesis/${invocationDigest.slice('sha256:'.length)}`, invocationDigest }, resources };
}

// A structurally complete Catalog and view that no owner established: the run
// owner reaches them only after the binder's resource gate, and refuses the
// unadmitted setup.
function callerCatalog(root, { publications = [], catalogEntries = [], viewEntries = [] }) {
  const d = hash('td34a caller-supplied catalog');
  const workspaceBinding = { kind: 'workspace_binding_candidate', schemaVersion, bindingId: 'binding://td34a', bindingDigest: d,
    workspaceId: 'workspace://td34a', authorityBasisId: 'authority://td34a', authorityBasisDigest: d, authorizedActorRef: 'actor://td34a',
    productSetId: 'products://td34a', productSetDigest: d, lockId: 'lock://td34a', lockDigest: d,
    roots: Object.fromEntries(['toolchainRoot', 'productRoot', 'eventLogRoot', 'runtimeStateRoot', 'projectionRoot', 'archiveRoot'].map(k => [k, root])) };
  const resolvedLock = { kind: 'resolved_product_lock', schemaVersion, lockId: workspaceBinding.lockId, lockDigest: d,
    nativeContractClosureDigest: d, rows: [], dependencyEdges: [] };
  const byHandle = entries => Object.fromEntries(entries.map(e => [e.handle, structuredClone(e)]));
  return {
    catalog: { kind: 'graph_function_catalog', schemaVersion, basisDigest: d, publicationDigests: publications.map(() => d),
      entries: catalogEntries, byHandle: byHandle(catalogEntries), declarationEntries: [], declarationsByHandle: {},
      readinessBasisDigest: d, workspaceBindingId: workspaceBinding.bindingId, workspaceBindingDigest: d, lockId: resolvedLock.lockId,
      lockDigest: d, productSetId: workspaceBinding.productSetId, productSetDigest: d,
      readinessBasis: { workspaceBinding, resolvedLock, verifiedProducts: [], installedProducts: [], publications },
      boundPublications: structuredClone(publications), rowDispositions: [] },
    catalogView: { kind: 'graph_function_catalog_view', catalogBasisDigest: d, allowlist: viewEntries.map(e => e.handle),
      entries: viewEntries, byHandle: byHandle(viewEntries), declarationEntries: [], declarationsByHandle: {}, viewDigest: d },
  };
}

const entry = definition => ({ kind: 'graph_function_catalog_entry', handle: definition.name, definitionRef: definition.name,
  definitionDigest: hash(definition), definition, owningProductId: basis.productId, moduleRef: 'module://td34a', publicationDigest: digest('d'),
  programMembershipRefs: [], compatibilityRefs: [], provenanceRefs: [], entryDigest: digest('e') });

// A shipped publication with c_compose and c_batch terms and run and graph_call closures.
const vehicle = () => structuredClone(gtl.constructWorksiteConstructionModulePublication(basis));
// A well-formed four-authority construction composition, as in t287-gtl-serialization-publication.
const fourAuthorityComposition = () => ({ kind: 'construction_composition', schemaVersion,
  compositionRef: 'composition://td34a/local', compositionDigest: digest('0'), graphFunctionRef: 'graph-function://td34a/local',
  authorities: ['synthesizeModel', 'evalGap', 'evaluateNext', 'evaluateAction'].map((semanticAuthority, index) => ({
    kind: 'construction_authority_binding', semanticAuthority, authorityRef: 'authority://td34a/local/' + index,
    initialProgramLocusRef: 'locus://td34a/local/' + index, refreshProgramLocusRef: null })),
  interactionProgramLocusRef: 'locus://td34a/local/interaction', closurePolicy: { kind: 'construction_policy',
    policyRef: 'policy://td34a/local', requireCompleteEvidence: true, requirePostEvidenceRefresh: true } });
function firstTerm(publication, kind) {
  const stack = publication.graphFunctions.flatMap(g => g.template.nodes.map(n => n.term));
  while (stack.length) {
    const term = stack.shift();
    if (term.kind === kind) return term;
    stack.push(...(term.terms ?? []), ...(term.tasks ?? []), ...(term.term ? [term.term] : []));
  }
  throw new Error('no ' + kind);
}
function graphWith(publication, kind) {
  return publication.graphFunctions.find(g => { try { firstTerm({ graphFunctions: [g] }, kind); return true; } catch { return false; } });
}
function jobPublication() {
  const data = genericIntakePublicationData({ gtl, abiPublication: gtl.constructSemanticStageModulePublication(basis) });
  return structuredClone({ kind: 'module_publication', moduleVersion: schemaVersion, artifactDigest: digest('d'), productContentDigest: digest('e'),
    productManifestDigest: digest('f'), ...data, contributions: data.contributions.map(c => ({ ...c, provenanceRefs: [digest('d')] })) });
}
function optionalMemberPublications() {
  const abiArtifact = { productId: basis.productId, artifactDigest: basis.artifactDigest, productContentDigest: basis.productContentDigest,
    manifestDigest: basis.productManifestDigest, packageName: basis.packageName, packageVersion: basis.packageVersion };
  const d2 = constructD2FrameDeclarations({ product, gtl, abiArtifact, abiPublications: nativePublications(gtl, abiArtifact) });
  return { requirementHandoffs: d2.sourcePublication, semanticLifecycle: d2.consumerPublication, semanticJobLifecycle: jobPublication(),
    runEnvironments: gtl.constructDefaultGovernanceLibraryModulePublication(basis) };
}

async function door(t) {
  const root = await mkdtemp(join(tmpdir(), 'abi5-td34a-'));
  const eventLogPath = join(root, 'held.jsonl');
  const opened = resourceOwner.acquireAbgEventResource({ kind: 'new_abg_event_resource', schemaVersion, eventLogPath,
    locatorDigest: resourceOwner.abgEventLocatorDigest(eventLogPath) });
  assert.equal(opened.kind, 'acquired_abg_event_resource');
  t.after(async () => { resourceOwner.abandonAbgEventResource(opened.resource); await rm(root, { recursive: true, force: true }); });
  const selection = resourceOwner.selectAcquiredAbgEventResource(opened.resource, opened.resource.entryPrefix);
  const submit = async members => {
    const call = exactInvokeCall({ kind: 'run_invocation_resource_assertion', schemaVersion, eventResource: selection,
      ...callerCatalog(root, members), applications: [], source: { kind: 'none' } });
    const gatedBefore = mechanics.observeDefinitionCallWork()['gated.catalog'] ?? 0;
    const outcome = await publicApi.runInstalledDefinitionCallWithResource(selection, call);
    const gated = (mechanics.observeDefinitionCallWork()['gated.catalog'] ?? 0) - gatedBefore;
    assert.equal(outcome.kind, 'installed_definition_call_transport_result', JSON.stringify(outcome).slice(0, 2000));
    resourceOwner.assertAcquiredAbgEventResourceSelectionCurrent(selection);
    const fault = outcome.receipt.failure?.fault ?? null;
    return { gated, structural: product.isRunInvocationResourceAssertion(call.resources),
      door: fault === null ? 'owner:' + outcome.receipt.ownerOutput.value.code : fault.stage + ':' + fault.code };
  };
  return { submit, eventLogPath };
}

const REFUSED = 'resource_admission:invalid_resource_assertion', REACHED = 'owner:invalid_program';

test('on a caller-supplied Catalog the run door refuses a one-term compose, an empty batch and an over-long tuple', async t => {
  const { submit } = await door(t);
  const cases = [];
  { const p = vehicle(), term = firstTerm(p, 'c_compose'); term.terms = term.terms.slice(0, 1); cases.push(['one-term compose in a publication', { publications: [p] }, p]); }
  { const p = vehicle(), term = firstTerm(p, 'c_batch'); term.tasks = []; cases.push(['empty batch in a publication', { publications: [p] }, p]); }
  { const p = vehicle(), program = p.programs[0];
    program.constructionComposition = fourAuthorityComposition();
    assert.equal(v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, p).success, true, 'four construction authorities: the GTL owner admits it');
    program.constructionComposition.authorities.push(structuredClone(program.constructionComposition.authorities[0]));
    cases.push(['five construction authorities', { publications: [p] }, p]); }
  { const p = vehicle(), c = p.closureContracts.find(x => x.closureScope === 'run'); c.eventKindRefs.push('run_closed');
    cases.push(['run closure eventKindRefs of five', { publications: [p] }, p]); }
  { const p = vehicle(), c = p.closureContracts.find(x => x.closureScope === 'graph_call'); c.eventKindRefs.push('graph_call_closed');
    cases.push(['graph_call closure eventKindRefs of four', { publications: [p] }, p]); }
  { const g = structuredClone(graphWith(vehicle(), 'c_compose')), term = firstTerm({ graphFunctions: [g] }, 'c_compose'); term.terms = term.terms.slice(0, 1);
    cases.push(['one-term compose in a view entry', { viewEntries: [entry(g)] }, null, g]); }
  { const g = structuredClone(graphWith(vehicle(), 'c_batch')), term = firstTerm({ graphFunctions: [g] }, 'c_batch'); term.tasks = [];
    cases.push(['empty batch in a Catalog entry', { catalogEntries: [entry(g)] }, null, g]); }
  const observed = [];
  for (const [label, members, publication, graph] of cases) {
    if (publication) assert.equal(v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, publication).success, false, label + ': the GTL owner refuses it');
    if (graph) assert.equal(v.safeParse(serialization.GRAPH_FUNCTION_SCHEMA, graph).success, false, label + ': the GTL owner refuses it');
    const result = await submit(members);
    observed.push({ label, ...result });
    assert.ok(result.gated >= 1, label + ': the Catalog takes the resource gate');
  }
  t.diagnostic('TD34A_REFUSED ' + JSON.stringify(observed));
  for (const row of observed) {
    assert.equal(row.door, REFUSED, row.label);
    assert.equal(row.structural, false, row.label + ': structural resource check');
  }
});

test('the three checks stricter than the GTL owner stay at the run door', async t => {
  const { submit } = await door(t);
  const cases = [];
  { const p = vehicle(); p.graphFunctions[0].declarations['abg.td34a'] = ' '; cases.push(['blank declaration value in a publication', { publications: [p] }, p]); }
  { const g = structuredClone(vehicle().graphFunctions[0]); g.declarations['abg.td34a'] = '';
    cases.push(['blank declaration value in a view entry', { viewEntries: [entry(g)] }, null, g]); }
  { const p = vehicle(); p.programs[0].policies['abg.td34a'] = '\t'; cases.push(['blank policy value', { publications: [p] }, p]); }
  { const p = jobPublication(); p.semanticJobLifecycle.stages[0].assembly.graphFunctionRef = 'graph-function://td34a/other';
    cases.push(['semantic job stage whose assembly names another graph function', { publications: [p] }, p]); }
  const observed = [];
  for (const [label, members, publication, graph] of cases) {
    if (publication) assert.equal(v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, publication).success, true, label + ': the GTL owner admits it');
    if (graph) assert.equal(v.safeParse(serialization.GRAPH_FUNCTION_SCHEMA, graph).success, true, label + ': the GTL owner admits it');
    observed.push({ label, ...await submit(members) });
  }
  t.diagnostic('TD34A_STRICT ' + JSON.stringify(observed));
  for (const row of observed) {
    assert.equal(row.door, REFUSED, row.label);
    assert.equal(row.structural, false, row.label + ': structural resource check');
    assert.ok(row.gated >= 1, row.label);
  }
});

test('a well-formed caller-supplied Catalog with every optional publication member is admitted and reaches the run owner', async t => {
  const { submit, eventLogPath } = await door(t);
  const optional = optionalMemberPublications();
  for (const [member, publication] of Object.entries(optional)) {
    assert.notEqual(publication[member], undefined, member);
    assert.equal(v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, publication).success, true, member + ': the GTL owner admits it');
  }
  const publications = [vehicle(), ...Object.values(optional)];
  const graphs = publications.flatMap(p => p.graphFunctions);
  const observed = [];
  for (const [label, members] of [['empty Catalog and view', {}],
    ['publications with each optional member', { publications }],
    ['Catalog and view entries', { catalogEntries: graphs.slice(0, 3).map(entry), viewEntries: graphs.slice(3, 6).map(entry) }]]) {
    observed.push({ label, ...await submit(members) });
  }
  t.diagnostic('TD34A_ADMITTED ' + JSON.stringify(observed));
  for (const row of observed) {
    assert.equal(row.door, REACHED, row.label);
    assert.equal(row.structural, true, row.label + ': structural resource check');
    assert.ok(row.gated >= 1, row.label);
  }
  assert.equal((await readFile(eventLogPath)).length, 0, 'the refused setup appends nothing');
});

test('a gate graph application is refused at raw admission, at Catalog admission and at the run door', async t => {
  const { submit } = await door(t);
  const p = vehicle(), g = p.graphFunctions[0];
  const body = { kind: 'graph_function_application', inputContractRef: g.inputs[0], outputContractRef: g.outputs[0],
    relationKind: 'gate', targetRef: g.name, ruleRef: 'rule://td27/gate', evaluatorRefs: ['evaluator://td27/gate'] };
  const application = { ...body, applicationRef: gtl.graphFunctionApplicationRef(body) };
  g.template.applications.push(application);
  const schema = { application: v.safeParse(serialization.GRAPH_APPLICATION_SCHEMA, application).success,
    graphFunction: v.safeParse(serialization.GRAPH_FUNCTION_SCHEMA, g).success,
    publication: v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, p).success };
  const raw = [validator.rawAdmitValue(p, 'module_publication', 'contract://abiogenesis/gtl/module-publication@5'),
    validator.rawAdmitValue(g, 'graph_function', 'contract://abiogenesis/gtl/graph-function@5')];
  const admitted = product.CatalogOperationPort.admit({ kind: 'catalog_admit_packet', schemaVersion, memberKey: 'admit', readinessBasis: { publications: [p] } });
  const observed = [];
  for (const [label, members] of [['in a publication', { publications: [p] }], ['in a Catalog entry', { catalogEntries: [entry(g)] }],
    ['in a view entry', { viewEntries: [entry(g)] }]]) observed.push({ label, ...await submit(members) });
  t.diagnostic('TD27_GATE ' + JSON.stringify({ schema, raw: raw.map(r => r.kind + ':' + r.code), catalog: admitted.kind + '/' + admitted.validation?.kind, observed }));
  assert.deepEqual(schema, { application: false, graphFunction: false, publication: false }, 'the GTL owner refuses it');
  for (const result of raw) {
    assert.equal(result.kind, 'raw_admission_refusal');
    assert.equal(result.code, 'invalid_kind');
    assert.match(result.message, /template\/applications\/\d+\/relationKind/u);
  }
  assert.equal(admitted.kind, 'catalog_validation_refusal', JSON.stringify(admitted).slice(0, 2000));
  assert.equal(admitted.validation.kind, 'raw_admission_refusal');
  assert.equal(admitted.validation.code, 'invalid_kind');
  for (const row of observed) {
    assert.equal(row.door, REFUSED, row.label);
    assert.equal(row.structural, false, row.label + ': structural resource check');
    assert.ok(row.gated >= 1, row.label);
  }
});
