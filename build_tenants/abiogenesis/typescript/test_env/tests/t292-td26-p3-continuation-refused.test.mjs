import assert from 'node:assert/strict';
import test from 'node:test';
import * as api from '../../build/code/src/public/index.js';
import * as product from '../../build/code/src/product/index.js';
import * as v from 'valibot';

// T-292 TD-26 P3, as retired under T-293 B36: run.continue#selected_action is
// retired from the published family, and current_intent admits the
// pending-execution request only. Each retired call is refused at the door a caller reaches with
// that door's existing refusal; no refusal code is new.
const operationId = 'abg.operation.run.continue';
const hash = product.sha256Canonical, ref = label => ({ref: label, digest: hash({label})});
const contractCatalog = {productId: 'product://td26p3/catalog', productContentDigest: hash('td26p3-content'),
  catalogId: 'catalog://td26p3/public', catalogVersion: '5.0.0', catalogDigest: hash('td26p3-catalog')};
const SLOT_VALUES = {workspace_binding: ref('workspace-binding://td26p3'), product_set: [ref('product://td26p3')],
  dependency_lock: ref('lock://td26p3'), catalog_scope: ref('catalog://td26p3'), execution_program: ref('program://td26p3'),
  graph_function: {graphFunction: ref('graph-function://td26p3'), membership: ref('membership://td26p3')},
  input_contract: {contract: ref('contract://td26p3/input'), valueRef: 'value://td26p3', valueDigest: hash({value: 'td26p3'}), value: {value: 'td26p3'}},
  session_policy: ref('policy://td26p3'), actor: {actor: ref('actor://td26p3'), attribution: ref('attribution://td26p3')},
  transport_steering: ref('steering://td26p3'), execution_basis: ref('execution-basis://td26p3')};
const SLOT_NAMES = ['workspace_binding', 'product_set', 'dependency_lock', 'catalog_scope', 'execution_program', 'graph_function',
  'input_contract', 'session_policy', 'capability_grants', 'actor', 'transport_steering', 'verification_references', 'execution_basis'];
const common = {run: ref('run://td26p3'), continuation: ref('continuation://td26p3')};
const SELECTED_ACTION = {...common, selectedAction: ref('action://td26p3'), basisRelation: {kind: 'same_basis'}};
const CONSTRUCTION_INTENT = {...common, currentIntent: ref('intent://td26p3'), continuationInput: ref('input://td26p3'), expectedBasis: ref('basis://td26p3')};
const PENDING_CURSOR = {...common, pendingCursor: ref('cursor://td26p3'), continuationInput: ref('input://td26p3'), expectedBasis: ref('basis://td26p3')};
const definitionOf = memberKey => api.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row =>
  row.definitionKey.operationId === operationId && row.definitionKey.memberKey === memberKey);

/** One structurally exact call of a continue member: its own verified
 * coordinates and its declared authority slots. */
function construct(memberKey, request) {
  const definition = definitionOf(memberKey);
  const projection = api.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(row => row.operationId === operationId)
    .definitions.find(row => row.definitionKey.memberKey === memberKey);
  const asset = api.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(row => row.operationId === operationId);
  const coordinate = (slot, definitionRef) => ({contractCatalog, flatRow: {contractId: operationId, contractVersion: '5.0.0',
    contractDigest: asset.contentDigest}, nestedSelector: {selectorKind: 'operation_definition_slot', definitionKey: definition.definitionKey, slot, definitionRef}});
  const required = new Set(definition.authoritySlotRequirements);
  const slots = Object.fromEntries(SLOT_NAMES.map(slot => [slot, !required.has(slot) ? null
    : slot === 'capability_grants' ? {requiredCapabilityRefs: [...definition.capabilityRefs], grants: [ref('grant://td26p3')]}
    : SLOT_VALUES[slot]]));
  for (const slot of required) assert.ok(slots[slot] !== null, `${memberKey} ${slot} has scenario data`);
  return api.constructInstalledPublicDefinitionCall({product, installedPublic: api, contractCatalog,
    definitionContractCoordinates: {operations: [{operationId, members: [{memberKey, slots: {
      request: coordinate('request', projection.requestContract.definitionRef), result: coordinate('result', projection.resultContract.definitionRef),
      refusal: coordinate('refusal', projection.refusalContract.definitionRef),
      nonTerminal: projection.nonTerminalContract === null ? null : coordinate('non_terminal', projection.nonTerminalContract.definitionRef)}}]}]},
    operationId, memberKey, request, slots, resources: {}, requestRef: `request://td26p3/${memberKey}`,
    correlationRef: `correlation://td26p3/${memberKey}`, eventTime: '2026-11-13T00:00:00.000Z', provenanceRefs: []});
}

// T-293 B36 retirement: this case replaces the retired title "selected_action
// keeps its published definition and the installed transport refuses it
// installed_binding_unavailable". The fixed 5.0 family no longer publishes the
// member, so no call to it can be constructed, and a current call re-keyed to
// it reaches no installed owner contract source.
test('selected_action is retired from the published continue family and the installed transport refuses a selected_action call unknown_definition', async () => {
  assert.equal(definitionOf('selected_action'), undefined, 'the retired member has no published definition');
  assert.ok(definitionOf('current_intent'), 'the retained member stays declared');
  const projection = api.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(row => row.operationId === operationId);
  assert.deepEqual(projection.definitions.map(row => row.definitionKey.memberKey), ['current_intent']);
  assert.deepEqual(Object.keys(product.RUN_DEFINITION_BINDINGS.continue), ['current_intent']);
  assert.equal(typeof product.RUN_DEFINITION_BINDINGS.continue.current_intent, 'function');
  assert.deepEqual(Object.keys(product.RUN_OPERATION_CONTRACTS.continue), ['current_intent']);
  const {packageExportPath, namedExport, memberPath} = definitionOf('current_intent').executionBindingSpecification.callable;
  assert.deepEqual([packageExportPath, namedExport, ...memberPath], ['./product', 'RUN_DEFINITION_BINDINGS', 'continue', 'current_intent']);
  assert.throws(() => construct('selected_action', SELECTED_ACTION), TypeError, 'a retired member constructs no call');
  // The control: a current call reaches its owner. The same call re-keyed to
  // the retired member selects no installed owner contract source.
  const current = construct('current_intent', PENDING_CURSOR);
  const control = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, current);
  assert.equal(control.kind, 'installed_definition_call_transport_result', JSON.stringify(control).slice(0, 400));
  const retired = {invocation: {...current.invocation, definitionKey: {...current.invocation.definitionKey, memberKey: 'selected_action'}},
    resources: {...current.resources}};
  const refused = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, retired);
  assert.equal(`${refused.kind}:${refused.code}`, 'installed_definition_call_transport_refusal:unknown_definition', JSON.stringify(refused));
});

test('current_intent refuses a construction-intent body at request admission and admits the pending cursor', async () => {
  const contract = product.RUN_OPERATION_CONTRACTS.continue.current_intent;
  assert.equal(v.safeParse(contract.requestSchema, CONSTRUCTION_INTENT).success, false);
  assert.equal(v.safeParse(contract.requestSchema, {...PENDING_CURSOR, currentIntent: ref('intent://td26p3')}).success, false);
  assert.equal(v.safeParse(contract.requestSchema, PENDING_CURSOR).success, true);
  const refused = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, construct('current_intent', CONSTRUCTION_INTENT));
  assert.equal(`${refused.kind}:${refused.code}`, 'installed_definition_call_transport_refusal:invalid_definition_call', JSON.stringify(refused));
  // Positive control: the pending-cursor call passes request admission and
  // reaches its owner, which refuses the empty resource assertion.
  const pending = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, construct('current_intent', PENDING_CURSOR));
  assert.equal(pending.kind, 'installed_definition_call_transport_result', JSON.stringify(pending).slice(0, 400));
  assert.equal(`${pending.receipt.failure?.fault?.stage}/${pending.receipt.failure?.fault?.code}`, 'resource_admission/invalid_resource_assertion');
});

test('continuation population refuses a retired selection kind with missing_continuation before any prefix read', async () => {
  for (const kind of ['selected_action', 'current_intent']) {
    const refused = await product.populateRunContinuationAtDurablePrefix({selection: {kind, runRef: 'run://td26p3', continuation: ref('continuation://td26p3')},
      prefix: null, catalog: null, catalogView: null, applications: [], transportResourceAssertion: null});
    assert.equal(`${refused.kind}:${refused.code}`, 'run_continuation_population_refusal:missing_continuation', kind);
  }
});

// T-293 B36 retirement: this case replaces the retired title "the published
// continue refusal contracts keep the selected_action list and give
// current_intent the five pending codes". The five pending codes are kept;
// the selected_action list is retired with its member.
test('the published continue refusal contracts give current_intent the five pending codes and publish no selected_action list', () => {
  const codes = schema => schema.entries.code.options;
  const continueContracts = product.RUN_OPERATION_CONTRACTS.continue;
  assert.deepEqual(codes(continueContracts.current_intent.refusalSchema),
    ['missing_continuation', 'resolved_continuation', 'response_mismatch', 'replay_mismatch', 'basis_mismatch']);
  assert.equal(Object.hasOwn(continueContracts, 'selected_action'), false, 'the selected_action refusal list is retired');
  for (const code of ['intent_mismatch', 'stale_action', 'action_mismatch', 'reprice_mismatch'])
    assert.equal(codes(continueContracts.current_intent.refusalSchema).includes(code), false, code);
});
