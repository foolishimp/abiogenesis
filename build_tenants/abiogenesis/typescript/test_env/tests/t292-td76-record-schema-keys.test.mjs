// TD-76 (T-292). Valibot's `record` skips the keys `__proto__`, `constructor` and
// `prototype` (the value is never checked and the member is left out of the
// output) and admits an array as a record. Every record schema that admits a
// caller's keys now uses one helper, `recordSchema` (`shared/public_function_contracts.ts`),
// which refuses both before the record runs: the GTL owner's `declarations`,
// `policies`, a rule's `config` and every JSON object inside it; the run door's
// Catalog and view records (`byHandle`, `declarationsByHandle`) and a verified
// product's `nativeDeclarationEvidence` and `definitionContractCoordinates`; a
// semantic job input's `taskData`, `evaluationData` and executable
// `environment`, and a design command's `environment`; a governance work
// state's `workOrders` and the prerequisites declaration. Each door refuses with
// the refusal it already gives for an invalid value at that position: raw
// admission `invalid_kind`, Catalog admission its raw-admission refusal,
// conformance input `invalid_kind`, the run door
// `resource_admission`/`invalid_resource_assertion`, an owner predicate `false`
// (the Product's input admission `null`), the governance constructor its
// `TypeError`, and the prerequisites owner `null` (not canonical). Each case is
// sent in two forms: JSON text (`JSON.parse` makes `__proto__` an own member)
// and an in-process value whose member is own (`Object.defineProperty`; an
// object literal's `__proto__` sets the prototype and makes no member). Before
// TD-76 every refusal case below was admitted: raw admission and the
// predicates kept the member unchecked, and the run door dropped it. The
// published serialization schema states the key rule as `propertyNames`. A
// value without one of the names is admitted with an output equal to its input.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as v from 'valibot';

const packageRoot = process.env.ABI5_ENV_TEST_PACKAGE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const load = path => import(pathToFileURL(join(packageRoot, 'build/code/src', path + '.js')).href);
const [product, gtl, m01, m02, m03, serialization, publicApi, resourceOwner, operations, family, projections, validator, contracts, canonical] =
  await Promise.all(['product/index', 'gtl/index', 'gtl/m01', 'gtl/m02', 'abg/m03', 'gtl/serialization_contracts', 'public/index',
    'abg/definition_event_resource', 'product/run_operation_contracts', 'public/binding/public_function_family',
    'public/binding/public_function_projections', 'validator/index', 'shared/public_function_contracts', 'shared/canonical_json'].map(load));

const schemaVersion = '5.0.0';
const hash = product.sha256Canonical;
const digest = c => 'sha256:' + c.repeat(64);
const basis = { productId: product.ABI5_PRODUCT_ID, packageName: product.ABI5_PACKAGE_NAME, packageVersion: product.ABI5_PACKAGE_VERSION,
  artifactDigest: digest('a'), productContentDigest: digest('b'), productManifestDigest: digest('c') };
const SKIPPED = ['__proto__', 'prototype', 'constructor'];
const FORMS = ['json', 'in_process'];

// One exact run.invoke call over a fixed coordinate (the W2-05 construction).
function exactInvokeCall(resources) {
  const packet = operations.RUN_OPERATION_CONTRACTS.invoke.invoke;
  const definition = family.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
    d.definitionKey.operationId === packet.definitionKey.operationId && d.definitionKey.memberKey === packet.definitionKey.memberKey);
  const member = family.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(o => o.operationId === definition.definitionKey.operationId)
    ?.definitions.find(d => d.definitionKey.memberKey === definition.definitionKey.memberKey);
  assert.ok(definition && member);
  const catalogCoordinate = { productId: 'product://abiogenesis/typescript-tenant@5', productContentDigest: hash({ product: 'td76' }),
    catalogId: 'catalog://abiogenesis/public-contracts@5', catalogVersion: schemaVersion, catalogDigest: hash({ catalog: 'td76' }) };
  const coordinate = ref => ({ ref, digest: hash({ ref }) });
  const contractCoordinate = (slot, definitionRef) => ({ contractCatalog: catalogCoordinate,
    flatRow: { contractId: definition.definitionKey.operationId, contractVersion: schemaVersion,
      contractDigest: projections.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(a => a.operationId === definition.definitionKey.operationId).contentDigest },
    nestedSelector: { selectorKind: 'operation_definition_slot', definitionKey: definition.definitionKey, slot, definitionRef } });
  const input = { value: 'admitted' }, inputContract = coordinate('contract://td76/input');
  const request = { program: coordinate('program://td76'), catalogHandle: 'graph-function://td76', inputContract, input,
    catalogView: coordinate('catalog-view://td76'), allowlist: [], sourceBasis: { kind: 'none' } };
  const slots = { workspace_binding: coordinate('workspace-binding://td76'), product_set: [coordinate('product-set://td76')],
    dependency_lock: coordinate('product-lock://td76'),
    catalog_scope: { catalog: coordinate('catalog://td76'), view: request.catalogView, allowlist: [] },
    execution_program: request.program,
    graph_function: { graphFunction: coordinate('graph-function://td76'), membership: coordinate('program-membership://td76') },
    input_contract: { contract: inputContract, valueRef: 'value://td76/input', valueDigest: hash(input), value: input },
    session_policy: coordinate('session-policy://td76'),
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs], grants: [coordinate('capability-grant://td76')] },
    actor: { actor: coordinate('actor://td76'), attribution: coordinate('attribution://td76') },
    transport_steering: coordinate('transport-steering://td76'), verification_references: null, execution_basis: null };
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
    correlationRef: 'correlation://abiogenesis/t292/td76', eventTime: '2026-11-12T00:00:00.000Z',
    provenanceRefs: ['provenance://abiogenesis/t292/td76'] };
  const invocationDigest = hash(body);
  return { invocation: { ...body, invocationRef: `invocation://abiogenesis/${invocationDigest.slice('sha256:'.length)}`, invocationDigest }, resources };
}

const entry = definition => ({ kind: 'graph_function_catalog_entry', handle: definition.name, definitionRef: definition.name,
  definitionDigest: hash(definition), definition, owningProductId: basis.productId, moduleRef: 'module://td76', publicationDigest: digest('d'),
  programMembershipRefs: [], compatibilityRefs: [], provenanceRefs: [], entryDigest: digest('e') });
const declarationEntry = handle => ({ kind: 'declaration_catalog_entry', handle, declarationKind: 'node_type',
  declarationOrContractRef: 'contract://td76/node', owningProductId: basis.productId, moduleRef: 'module://td76', publicationDigest: digest('d'),
  programMembershipRefs: [], compatibilityRefs: [], provenanceRefs: [], entryDigest: digest('e') });

// A structurally complete Catalog and view that no owner established: the run
// owner reaches them only after the binder's resource gate and refuses the
// unadmitted setup (`owner:invalid_program` means the value passed the door).
function callerCatalog(root, { publications = [], catalogEntries = [], viewEntries = [], catalogPatch, viewPatch }) {
  const d = hash('td76 caller-supplied catalog');
  const workspaceBinding = { kind: 'workspace_binding_candidate', schemaVersion, bindingId: 'binding://td76', bindingDigest: d,
    workspaceId: 'workspace://td76', authorityBasisId: 'authority://td76', authorityBasisDigest: d, authorizedActorRef: 'actor://td76',
    productSetId: 'products://td76', productSetDigest: d, lockId: 'lock://td76', lockDigest: d,
    roots: Object.fromEntries(['toolchainRoot', 'productRoot', 'eventLogRoot', 'runtimeStateRoot', 'projectionRoot', 'archiveRoot'].map(k => [k, root])) };
  const resolvedLock = { kind: 'resolved_product_lock', schemaVersion, lockId: workspaceBinding.lockId, lockDigest: d,
    nativeContractClosureDigest: d, rows: [], dependencyEdges: [] };
  const byHandle = entries => Object.fromEntries(entries.map(e => [e.handle, structuredClone(e)]));
  const catalog = { kind: 'graph_function_catalog', schemaVersion, basisDigest: d, publicationDigests: publications.map(() => d),
    entries: catalogEntries, byHandle: byHandle(catalogEntries), declarationEntries: [], declarationsByHandle: {},
    readinessBasisDigest: d, workspaceBindingId: workspaceBinding.bindingId, workspaceBindingDigest: d, lockId: resolvedLock.lockId,
    lockDigest: d, productSetId: workspaceBinding.productSetId, productSetDigest: d,
    readinessBasis: { workspaceBinding, resolvedLock, verifiedProducts: [], installedProducts: [], publications },
    boundPublications: structuredClone(publications), rowDispositions: [] };
  const catalogView = { kind: 'graph_function_catalog_view', catalogBasisDigest: d, allowlist: viewEntries.map(e => e.handle),
    entries: viewEntries, byHandle: byHandle(viewEntries), declarationEntries: [], declarationsByHandle: {}, viewDigest: d };
  catalogPatch?.(catalog); viewPatch?.(catalogView);
  return { catalog, catalogView };
}

async function runDoor(t) {
  const root = await mkdtemp(join(tmpdir(), 'abi5-td76-'));
  const eventLogPath = join(root, 'held.jsonl');
  const opened = resourceOwner.acquireAbgEventResource({ kind: 'new_abg_event_resource', schemaVersion, eventLogPath,
    locatorDigest: resourceOwner.abgEventLocatorDigest(eventLogPath) });
  assert.equal(opened.kind, 'acquired_abg_event_resource');
  t.after(async () => { resourceOwner.abandonAbgEventResource(opened.resource); await rm(root, { recursive: true, force: true }); });
  const selection = resourceOwner.selectAcquiredAbgEventResource(opened.resource, opened.resource.entryPrefix);
  const submit = async (members, form) => {
    let { catalog, catalogView } = callerCatalog(root, members);
    // The CLI parses the request file; the Catalog and view arrive as JSON text.
    if (form === 'json') { catalog = JSON.parse(JSON.stringify(catalog)); catalogView = JSON.parse(JSON.stringify(catalogView)); }
    const call = exactInvokeCall({ kind: 'run_invocation_resource_assertion', schemaVersion, eventResource: selection,
      catalog, catalogView, applications: [], source: { kind: 'none' } });
    const outcome = await publicApi.runInstalledDefinitionCallWithResource(selection, call);
    assert.equal(outcome.kind, 'installed_definition_call_transport_result', JSON.stringify(outcome).slice(0, 2000));
    const fault = outcome.receipt.failure?.fault ?? null;
    return fault === null ? 'owner:' + outcome.receipt.ownerOutput.value.code : fault.stage + ':' + fault.code;
  };
  return { submit, eventLogPath };
}

const RUN_REFUSED = 'resource_admission:invalid_resource_assertion', RUN_REACHED = 'owner:invalid_program';
const own = (target, key, value) => Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
const inForm = (value, form) => form === 'json' ? JSON.parse(JSON.stringify(value)) : value;
const consensus = () => structuredClone(gtl.constructConsensusModulePublication(basis));

// The GTL owner's record positions in a publication. A rule's config holds JSON
// values, so every I-JSON value is valid there and only the key is at issue.
const POSITIONS = {
  declarations: { record: p => p.graphFunctions[0].declarations, set: (p, r) => { p.graphFunctions[0].declarations = r; }, valid: 'abg.td76', invalid: 42 },
  policies: { record: p => p.programs[0].policies, set: (p, r) => { p.programs[0].policies = r; }, valid: 'abg.td76', invalid: 42 },
  'rules[].config': { record: p => p.rules[0].config, set: (p, r) => { p.rules[0].config = r; }, valid: 'abg.td76', invalid: null },
  'object in rules[].config': { record: p => (p.rules[0].config['abg.td76'] ??= {}), set: null, valid: 'abg.td76', invalid: null },
};

// Every door that admits a publication, Program or graph function through the
// GTL owner, as `door: verdict`.
async function publicationDoors(publication, submit, form, position) {
  const raw = r => r.kind === 'raw_admitted_value' ? 'admitted' : 'refused:' + r.code;
  const rows = {
    'raw module_publication': raw(m02.admitModule(publication)),
    'Catalog admission': (r => r.kind === 'catalog_validation_refusal' ? 'refused:' + r.validation.kind + ':' + r.validation.code : 'passed:' + r.kind)(
      product.CatalogOperationPort.admit({ kind: 'catalog_admit_packet', schemaVersion, memberKey: 'admit',
        readinessBasis: { workspaceBinding: {}, resolvedLock: {}, verifiedProducts: [], installedProducts: [], publications: [publication] } })),
    'conformance input': raw(m03.admitGtlProgramConformanceInput({ kind: 'conformance_evaluate_packet', schemaVersion,
      memberKey: 'gtl_program', publication, program: publication.programs[0] })),
    'run door publication': await submit({ publications: [publication] }, form),
  };
  if (position === 'declarations') {
    rows['raw graph_function'] = raw(m01.admitGraphFunction(publication.graphFunctions[0]));
    rows['run door Catalog entry'] = await submit({ catalogEntries: [entry(publication.graphFunctions[0])] }, form);
    rows['run door view entry'] = await submit({ viewEntries: [entry(publication.graphFunctions[0])] }, form);
  }
  if (position === 'policies') rows['raw gtl_program'] = raw(validator.rawAdmitValue(publication.programs[0], 'gtl_program', 'contract://abiogenesis/gtl/program@5'));
  return rows;
}
const REFUSED = { 'raw module_publication': 'refused:invalid_kind', 'raw graph_function': 'refused:invalid_kind', 'raw gtl_program': 'refused:invalid_kind',
  'Catalog admission': 'refused:raw_admission_refusal:invalid_kind', 'conformance input': 'refused:invalid_kind',
  'run door publication': RUN_REFUSED, 'run door Catalog entry': RUN_REFUSED, 'run door view entry': RUN_REFUSED };

test('a member named __proto__, prototype or constructor in a GTL record is refused at every door, in JSON text and in process', async t => {
  const { submit, eventLogPath } = await runDoor(t);
  const observed = [];
  for (const form of FORMS) for (const [position, at] of Object.entries(POSITIONS)) for (const key of SKIPPED)
    for (const which of ['valid', 'invalid']) {
      if (at[which] === null) continue;
      const p = consensus(); own(at.record(p), key, at[which]);
      const publication = inForm(p, form);
      assert.ok(Object.hasOwn(at.record(publication), key), `${key} is an own member in the ${form} form`);
      observed.push({ form, position, key, which, owner: v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, publication).success,
        doors: await publicationDoors(publication, submit, form, position) });
    }
  t.diagnostic('TD76_KEYS ' + JSON.stringify(observed));
  for (const row of observed) {
    assert.equal(row.owner, false, `${row.form} ${row.key} (${row.which}) at ${row.position}: the GTL owner refuses it`);
    for (const [door, verdict] of Object.entries(row.doors))
      assert.equal(verdict, REFUSED[door], `${row.form} ${row.key} (${row.which}) at ${row.position}: ${door}`);
  }
  assert.equal((await readFile(eventLogPath)).length, 0, 'the refused calls append nothing');
});

test('an array where a GTL record is declared is refused at every door', async t => {
  const { submit } = await runDoor(t);
  const observed = [];
  for (const form of FORMS) for (const [position, at] of Object.entries(POSITIONS)) {
    if (at.set === null) continue;
    for (const array of [[], ['abg.td76']]) {
      const p = consensus(); at.set(p, structuredClone(array));
      observed.push({ form, position, array, doors: await publicationDoors(inForm(p, form), submit, form, position) });
    }
  }
  t.diagnostic('TD76_ARRAYS ' + JSON.stringify(observed));
  for (const row of observed) for (const [door, verdict] of Object.entries(row.doors))
    assert.equal(verdict, REFUSED[door], `${row.form} ${JSON.stringify(row.array)} at ${row.position}: ${door}`);
});

test('the run door refuses a skipped name and an array in the Catalog and view byHandle records', async t => {
  const { submit } = await runDoor(t);
  const g = consensus().graphFunctions[0];
  const observed = [];
  for (const form of FORMS) for (const member of ['catalog', 'catalogView']) for (const field of ['byHandle', 'declarationsByHandle']) {
    const valid = field === 'byHandle' ? entry(g) : declarationEntry('node://td76');
    const patchKey = member === 'catalog' ? 'catalogPatch' : 'viewPatch';
    const cases = [
      ...SKIPPED.flatMap(key => ['valid', 'invalid'].map(which => [`${key} (${which})`, x => own(x[field], key, which === 'valid' ? structuredClone(valid) : 42)])),
      ['empty array', x => { x[field] = []; }], ['non-empty array', x => { x[field] = [structuredClone(valid)]; }]];
    for (const [label, patch] of cases) observed.push({ form, at: `${member}.${field}`, label, door: await submit({ [patchKey]: patch }, form) });
  }
  t.diagnostic('TD76_CATALOG ' + JSON.stringify(observed));
  assert.equal(observed.length, 2 * 4 * 8);
  for (const row of observed) assert.equal(row.door, RUN_REFUSED, `${row.form} ${row.label} at ${row.at}`);
});

test('a publication with ordinary keys is admitted with an output equal to its input', async t => {
  const { submit } = await runDoor(t);
  const g = consensus().graphFunctions[0];
  for (const form of FORMS) {
    const p = consensus();
    for (const at of Object.values(POSITIONS)) own(at.record(p), 'abg.td76.ordinary', 'abg.td76');
    const publication = inForm(p, form);
    const doors = await publicationDoors(publication, submit, form, 'declarations');
    t.diagnostic('TD76_ORDINARY ' + JSON.stringify({ form, doors }));
    for (const door of ['raw module_publication', 'raw graph_function', 'conformance input']) assert.equal(doors[door], 'admitted', door);
    assert.equal(doors['Catalog admission'], 'passed:catalog_construction_refusal', 'raw admission and publication validation pass');
    for (const door of ['run door publication', 'run door Catalog entry', 'run door view entry']) assert.equal(doors[door], RUN_REACHED, door);
    const admitted = m02.admitModule(publication);
    assert.equal(canonical.canonicalJson(admitted.value), canonical.canonicalJson(publication), 'raw admission output equals the input');
    const parsed = v.safeParse(serialization.MODULE_PUBLICATION_SCHEMA, publication);
    assert.equal(parsed.success, true);
    assert.deepEqual(parsed.output, publication, 'the owner schema output (the run door) equals the input');
    const ordinaryCatalog = { catalogPatch: x => own(x.byHandle, 'abg.td76.ordinary', entry(g)), viewPatch: x => own(x.declarationsByHandle, 'node://td76', declarationEntry('node://td76')) };
    assert.equal(await submit(ordinaryCatalog, form), RUN_REACHED, 'ordinary Catalog and view keys pass the run door');
  }
  // An object literal's `__proto__` sets the prototype and makes no member: the
  // I-JSON gate refuses the value at raw admission, as before.
  const literal = consensus();
  literal.graphFunctions[0].declarations = { __proto__: { 'abg.td76': 'x' }, ...literal.graphFunctions[0].declarations };
  assert.equal(Object.hasOwn(literal.graphFunctions[0].declarations, '__proto__'), false);
  const refused = m02.admitModule(literal);
  assert.equal(refused.kind + ':' + refused.code, 'raw_admission_refusal:non_canonical_value');
});

test('the published serialization schema states the key rule at every record position', () => {
  const family = contracts.projectStrictJsonSchema(v.strictObject({
    ...serialization.GTL_SERIALIZATION_SCHEMA_DEFINITIONS, GtlLanguageConformanceCorpus: serialization.GTL_LANGUAGE_CONFORMANCE_CORPUS_SCHEMA }));
  const records = [];
  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach((item, i) => walk(item, `${path}/${i}`));
    if (node === null || typeof node !== 'object') return;
    if (Object.hasOwn(node, 'propertyNames')) records.push({ path, node });
    for (const [key, child] of Object.entries(node)) walk(child, `${path}/${key}`);
  };
  walk(family, '#');
  // declarations, policies and rules[].config in GraphFunction, ModulePublication,
  // GtlProgramConformanceInput and the corpus packet, and the JSON value object.
  assert.equal(records.length, 13, records.map(r => r.path).join('\n'));
  for (const { path, node } of records) {
    assert.equal(node.type, 'object', path);
    assert.deepEqual(node.propertyNames, { type: 'string', not: { enum: ['__proto__', 'constructor', 'prototype'] } }, path);
  }
});

test('the record helper refuses the three names and an array under every key rule and otherwise gives the record result', () => {
  const keyRules = { string: v.string(), nonblank: v.pipe(v.string(), v.minLength(1)), picklist: v.picklist(['testing', 'uat']) };
  const view = r => ({ success: r.success, output: r.output,
    issues: r.issues?.map(i => [i.kind, i.type, i.message, (i.path ?? []).map(p => [p.origin ?? null, p.key])]) });
  for (const [label, key] of Object.entries(keyRules)) for (const value of [v.string(), v.unknown()]) {
    const schema = contracts.recordSchema(key, value), plain = v.record(key, value);
    for (const input of [{}, { testing: 'x' }, { testing: 42 }, { '': 'x' }, { other: 'x', testing: 'y' }, 'text', null, 7])
      assert.deepEqual(view(v.safeParse(schema, input)), view(v.safeParse(plain, input)), `${label} ${JSON.stringify(input)}: the record's own result`);
    for (const form of FORMS) for (const name of SKIPPED) for (const member of ['x', 42]) {
      const input = inForm(own({ testing: 'x' }, name, member), form);
      assert.ok(Object.hasOwn(input, name));
      const result = v.safeParse(schema, input);
      assert.equal(result.success, false, `${label} ${form} ${name}`);
      assert.deepEqual(result.issues[0].path.map(p => [p.origin, p.key]), [['key', name]], `${label} ${form} ${name}: the issue is at the key`);
    }
    for (const array of [[], ['x']]) {
      const result = v.safeParse(schema, array);
      assert.equal(result.success, false);
      assert.equal(result.issues[0].message, 'Invalid type: Expected Object but received Array');
    }
  }
});

// The record uses outside the GTL owner that a caller's value reaches, each
// through its owner's predicate and the Product's input admission.
test('a semantic job input and design refuse the three names and an array in their records', async t => {
  const [{ ordinaryJob }, semanticJob, semantics] = await Promise.all([import('../support/t287-generic-job-intake.mjs'),
    load('product/semantic_job'), load('product/builtin_semantics')]);
  const admitJob = value => semantics.ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS.admitInput(gtl.SEMANTIC_STAGE_IDS.jobInputContractRef, value) !== null;
  const job = () => structuredClone(ordinaryJob(product, gtl, 'Build an application that prints Hello World.'));
  const positions = {
    taskData: { record: j => j.taskData, set: (j, r) => { j.taskData = r; }, members: [1, 'x'] },
    evaluationData: { record: j => j.evaluationData, set: (j, r) => { j.evaluationData = r; }, members: [1, 'x'] },
    'executable environment': { record: j => j.worksiteScope.executableCapabilities[0].environment,
      set: (j, r) => { j.worksiteScope.executableCapabilities[0].environment = r; }, members: ['1', 42] },
  };
  assert.equal(semanticJob.isSemanticJobInput(job()), true);
  assert.equal(admitJob(job()), true);
  const observed = [];
  for (const form of FORMS) for (const [position, at] of Object.entries(positions)) {
    const ordinary = job(); own(at.record(ordinary), 'abg_td76', at.members[0]);
    observed.push({ form, position, label: 'ordinary key', predicate: semanticJob.isSemanticJobInput(inForm(ordinary, form)), admission: admitJob(inForm(ordinary, form)), expected: true });
    for (const name of SKIPPED) for (const member of at.members) {
      const j = job(); own(at.record(j), name, member);
      const value = inForm(j, form); assert.ok(Object.hasOwn(at.record(value), name));
      observed.push({ form, position, label: `${name}=${JSON.stringify(member)}`, predicate: semanticJob.isSemanticJobInput(value), admission: admitJob(value), expected: false });
    }
    for (const array of [[], ['x']]) {
      const j = job(); at.set(j, array);
      observed.push({ form, position, label: JSON.stringify(array), predicate: semanticJob.isSemanticJobInput(inForm(j, form)), admission: admitJob(inForm(j, form)), expected: false });
    }
  }
  // A design's declared command environment.
  const text = 'Build an application that prints Hello World.';
  const quote = { memberRef: job().members[0].memberRef, quote: text };
  const candidate = environment => ({ kind: 'semantic_job_asset_candidate', schemaVersion, bindings: [],
    asset: { kind: 'semantic_stage_asset_candidate', schemaVersion, statements: [{ statementRef: 'statement://td76/s', text, modality: 'supporting',
      sourceQuotes: [quote], requirementRefs: [], obligationRefs: [], predecessorStatementRefs: [] }], requirementCandidates: [], worksiteDesign: null, pressure: [] },
    design: { targets: [{ relativePath: 'app/hello.mjs', role: 'implementation', obligationRefs: [], bindingVersionRefs: [], changeInstruction: 'Write it.' }],
      dependencyPaths: [], dependencyDisposition: 'sufficient', outcomePredicates: [],
      commands: [{ commandId: 'command://td76/run', executable: 'node', args: ['app/hello.mjs'], relativeCwd: '.', environment,
        timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }] } });
  assert.equal(semanticJob.isSemanticJobAssetCandidate(candidate({})), true);
  for (const form of FORMS) {
    observed.push({ form, position: 'design command environment', label: 'ordinary key', predicate: semanticJob.isSemanticJobAssetCandidate(inForm(candidate({ HOME: '/h' }), form)), expected: true });
    for (const name of SKIPPED) for (const member of ['1', 42])
      observed.push({ form, position: 'design command environment', label: `${name}=${JSON.stringify(member)}`, predicate: semanticJob.isSemanticJobAssetCandidate(inForm(candidate(own({}, name, member)), form)), expected: false });
    for (const array of [[], ['x']])
      observed.push({ form, position: 'design command environment', label: JSON.stringify(array), predicate: semanticJob.isSemanticJobAssetCandidate(inForm(candidate(array), form)), expected: false });
  }
  t.diagnostic('TD76_SEMANTIC_JOB ' + JSON.stringify(observed));
  for (const row of observed) {
    assert.equal(row.predicate, row.expected, `${row.form} ${row.label} at ${row.position}: the owner's predicate`);
    if ('admission' in row) assert.equal(row.admission, row.expected, `${row.form} ${row.label} at ${row.position}: the Product's input admission`);
  }
});

test('a governance work state and its prerequisites declaration refuse the three names and an array in their records', t => {
  const ref = (kind, name) => `${kind}://td76/${name}@5`;
  const order = { outcome: 'Perform the work.', instructions: ['Read the source.'], readFirst: ['app/a.txt'], writeRoots: ['app'], checks: [] };
  const original = () => ({ taskRef: ref('task', 'original'), task: 'Build it.', sources: [{ path: 'app/a.txt', digest: digest('a') }],
    requiredSupportRefs: [ref('support', 'source')], authorityRefs: [ref('authority', 'scope')], readRoots: ['app/a.txt'],
    maxContextFiles: 8, maxContextBytes: 4096, maxPromptBytes: 4096, workOrders: { construction: structuredClone(order) },
    testing: { selectedPaths: ['app/a.txt'], commands: [], outcomePredicates: [], allowedWriteTerritories: [] },
    assessment: { sources: ['app/a.txt'], candidatePath: 'app/candidate.mjs', rubricPath: 'app/rubric.json',
      resultContract: { contractRef: ref('contract', 'assessment'), contractVersion: schemaVersion, contractKind: 'output', valueKind: 'td76_assessment' },
      schemaAsset: { productId: ref('product', 'consumer'), contractId: ref('contract', 'assessment'), bytesBase64: Buffer.from('{}\n').toString('base64') },
      verdictField: 'disposition', satisfiedValue: 'satisfied' } });
  const state = o => { try { return product.isGovernanceWorkState(product.constructGovernanceWorkState(o)); } catch (error) { return error.constructor.name; } };
  const admitState = value => product.ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS.admitInput(product.governanceContract('state'), value) !== null;
  assert.equal(state(original()), true);
  const admitted = product.constructGovernanceWorkState(original());
  assert.equal(admitState(admitted), true);
  const observed = [];
  for (const form of FORMS) {
    const ordinary = original(); ordinary.workOrders.testing = structuredClone(order);
    observed.push({ form, at: 'workOrders', label: 'ordinary key', construct: state(inForm(ordinary, form)), expected: true });
    for (const name of SKIPPED) for (const member of [order, 42]) {
      const o = original(); own(o.workOrders, name, structuredClone(member));
      observed.push({ form, at: 'workOrders', label: `${name}=${member === order ? 'order' : 42}`, construct: state(inForm(o, form)),
        admission: admitState(inForm({ ...structuredClone(admitted), original: o }, form)), expected: false });
    }
    for (const array of [[], [order]]) {
      const o = original(); o.workOrders = structuredClone(array);
      observed.push({ form, at: 'workOrders', label: array.length ? '[order]' : '[]', construct: state(inForm(o, form)), expected: false });
    }
  }
  // The prerequisites declaration is JSON text in a graph function's
  // declarations; its owner parses it, so every case is the JSON form.
  const prerequisites = text => { try { return product.governancePrerequisites({ [product.GOVERNANCE_PREREQUISITES_DECLARATION]: text }); } catch (error) { return error.constructor.name; } };
  assert.deepEqual(prerequisites('{"testing":["review://td76"]}'), { testing: ['review://td76'] });
  for (const name of SKIPPED) for (const member of [['review://td76'], 42])
    observed.push({ form: 'json', at: 'prerequisites', label: `${name}=${JSON.stringify(member)}`,
      result: prerequisites(canonical.canonicalJson(Object.fromEntries([[name, member], ['testing', ['review://td76']]].sort(([a], [b]) => a < b ? -1 : 1)))), expected: null });
  for (const array of ['[]', '["review://td76"]', '[["review://td76"]]'])
    observed.push({ form: 'json', at: 'prerequisites', label: array, result: prerequisites(array), expected: null });
  t.diagnostic('TD76_GOVERNANCE ' + JSON.stringify(observed));
  for (const row of observed) {
    if ('construct' in row) assert.equal(row.construct, row.expected === true ? true : 'TypeError', `${row.form} ${row.label} at ${row.at}: the owner's constructor`);
    if ('admission' in row) assert.equal(row.admission, row.expected, `${row.form} ${row.label} at ${row.at}: the Product's input admission`);
    if ('result' in row) assert.equal(row.result, row.expected, `${row.label} at ${row.at}: the owner answers not canonical`);
  }
});

// The run door's verified product carries two records (a caller's Catalog
// brings the product in its readiness basis). The product is the one the
// support verifies from the packed artifact.
test('the run door refuses a skipped name and an array in a verified product record', async t => {
  const { setupInstalledRootCatalog } = await import('../support/root-installed-environment.mjs');
  const environment = await setupInstalledRootCatalog(t, packageRoot, { candidateBasisSource: 'packed_artifact' });
  const verified = JSON.parse(JSON.stringify(environment.verified));
  assert.equal(verified.kind, 'verified_product_artifact');
  const { submit } = await runDoor(t);
  const withProduct = patch => ({ catalogPatch: x => { const p = structuredClone(verified); patch(p); x.readinessBasis.verifiedProducts = [p]; } });
  const control = await submit(withProduct(() => {}), 'in_process');
  assert.notEqual(control, RUN_REFUSED, 'the verified product passes the door');
  const observed = [];
  for (const form of FORMS) for (const field of ['nativeDeclarationEvidence', 'definitionContractCoordinates']) {
    const base = p => { p[field] ??= {}; return p[field]; };
    observed.push({ form, field, label: 'ordinary key', door: await submit(withProduct(p => own(base(p), 'abg_td76', 'x')), form), expected: control });
    for (const name of SKIPPED) for (const member of ['x', { nested: 1 }])
      observed.push({ form, field, label: `${name}=${JSON.stringify(member)}`, door: await submit(withProduct(p => own(base(p), name, member)), form), expected: RUN_REFUSED });
    for (const array of [[], ['x']])
      observed.push({ form, field, label: JSON.stringify(array), door: await submit(withProduct(p => { p[field] = structuredClone(array); }), form), expected: RUN_REFUSED });
  }
  t.diagnostic('TD76_VERIFIED_PRODUCT ' + JSON.stringify({ control, observed }));
  for (const row of observed) assert.equal(row.door, row.expected, `${row.form} ${row.label} at ${row.field}`);
});
