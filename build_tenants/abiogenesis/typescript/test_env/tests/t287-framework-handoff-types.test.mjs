// T287 HC1 owner-derived native call typing and the HC2 shipped constructor
// types. Real compiler checks of the canonical and packed package
// declarations, packed-runtime inventory and raw refusals, and the projected
// schema of every packed owner slot contract. Not HC2 runtime population,
// installed Run proof, qualification or release evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const tenant = path.resolve(process.env.ABG_FRAMEWORK_HANDOFF_TENANT_ROOT ?? path.resolve(import.meta.dirname, '../..'));
const proofPath = path.join(tenant, 'test_env/types/framework-handoff.compile.ts');
const proofConfigPath = path.join(tenant, 'test_env/tsconfig.framework-handoff.json');
const PACKAGE_NAME = '@abiogenesis/typescript-tenant';
const CANONICAL_IMPORTS = /^@abiogenesis\/typescript-tenant\/(public|product|abg|validator)$/;
const HC1_DECLARATIONS = ['OwnerCallableDefinitionMember', 'OwnerUnavailableDefinitionMember',
  'InstalledPublicDefinitionCallSelection', 'InstalledDefinitionCallTransportOutcomeOf',
  'InstalledStartCallSelection', 'InstalledPendingCallSelection', 'InstalledRunReadCallSelection'];
const SLOTS = ['request', 'result', 'refusal', 'nonTerminal'];

const proofText = fs.readFileSync(proofPath, 'utf8');
const proofSource = ts.createSourceFile(proofPath, proofText, ts.ScriptTarget.ES2022, true);

function proofConfig() {
  const parsed = ts.getParsedCommandLineOfConfigFile(proofConfigPath, {}, {...ts.sys,
    onUnRecoverableConfigFileDiagnostic: d => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); }});
  assert.deepEqual(parsed.errors, []);
  return parsed;
}

const markers = proofText.split('\n').flatMap((line, index) => {
  const match = line.match(/\/\/ @ts-expect-error HC1-NEG (\S+) ([\d ]+)$/);
  return match === null ? [] : [{name: match[1], line: index + 2, codes: match[2].trim().split(/\s+/).map(Number)}];
});

/** The finite oracle declared once, in the compiled proof itself. */
function oracle(name) {
  let values = null;
  ts.forEachChild(proofSource, node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() !== name) continue;
      const array = declaration.initializer.expression;
      values = array.elements.map(element => element.text);
    }
  });
  assert.ok(values, name);
  return values;
}

const format = d => ({code: d.code, file: d.file?.fileName ?? null,
  line: d.file ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : null,
  message: ts.flattenDiagnosticMessageText(d.messageText, '\n').slice(0, 600)});

function compile(rootFile, options, text = null) {
  const host = ts.createCompilerHost(options);
  if (text !== null) {
    const getSourceFile = host.getSourceFile.bind(host), readFile = host.readFile.bind(host);
    host.getSourceFile = (file, language, ...rest) => path.resolve(file) === rootFile
      ? ts.createSourceFile(file, text, language, true) : getSourceFile(file, language, ...rest);
    host.readFile = file => path.resolve(file) === rootFile ? text : readFile(file);
  }
  const program = ts.createProgram({rootNames: [rootFile], options, host});
  const errors = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error);
  return {program, errors};
}

/** Fail closed: an absent or stale (pre-HC1) package proves nothing. */
function requireHc1Declarations(packageRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const types = path.join(packageRoot, manifest.exports['./public'].types);
  assert.ok(fs.existsSync(types), `canonical package declarations are absent: ${types}`);
  const text = fs.readFileSync(types, 'utf8');
  for (const name of HC1_DECLARATIONS) assert.match(text, new RegExp(`\\b${name}\\b`), `${types} predates HC1: ${name}`);
  return manifest;
}

function exportFile(packageRoot, manifest, subpath, condition) {
  const target = manifest.exports[subpath];
  return path.join(packageRoot, typeof target === 'string' ? target : target[condition] ?? target.default);
}

function scratch(t, prefix) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  return root;
}

function extract(archive, into) {
  fs.mkdirSync(into, {recursive: true});
  execFileSync('tar', ['-xzf', archive, '-C', into]);
  return path.join(into, 'package');
}

/** The candidate is an explicit packed archive, an explicit extracted package
 * root, or a fresh Product pack of the built tenant through its own
 * `scripts/product-payload.mjs pack` (packProduct). */
function candidatePackage(t) {
  if (process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ROOT !== undefined) return path.resolve(process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ROOT);
  const root = scratch(t, 'abg-hc1-candidate-');
  let archive = process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ARCHIVE;
  if (archive === undefined) {
    requireHc1Declarations(tenant);
    const [packed] = JSON.parse(execFileSync(process.execPath, [path.join(tenant, 'scripts/product-payload.mjs'), 'pack', root],
      {encoding: 'utf8', maxBuffer: 1 << 26}));
    archive = path.join(root, packed.filename);
  }
  return extract(path.resolve(archive), path.join(root, 'extract'));
}

async function loadPackage(packageRoot) {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.name, PACKAGE_NAME);
  const load = subpath => import(pathToFileURL(exportFile(packageRoot, manifest, subpath, 'import')).href);
  return {manifest, public: await load('./public'), product: await load('./product'), abg: await load('./abg'), validator: await load('./validator')};
}

const keyOf = definition => `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;

test('HC1 proof source uses only canonical package imports and no proof-erasing construct', () => {
  const imports = [];
  const erasing = [];
  const visit = node => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) && node.moduleSpecifier) imports.push(node.moduleSpecifier.text);
    if (ts.isImportTypeNode(node) || ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) erasing.push('dynamic or type import');
    if (ts.isAsExpression(node) && node.type.getText() !== 'const') erasing.push(`as ${node.type.getText()}`);
    if (ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) erasing.push(node.getText());
    if (node.kind === ts.SyntaxKind.AnyKeyword) erasing.push('any');
    ts.forEachChild(node, visit);
  };
  visit(proofSource);
  assert.ok(imports.length > 0);
  for (const specifier of imports) assert.match(specifier, CANONICAL_IMPORTS);
  assert.deepEqual(erasing, []);
  assert.doesNotMatch(proofText, /@ts-ignore|@ts-nocheck/);
  assert.equal(proofText.match(/@ts-expect-error/g).length, markers.length, 'every expected error is a named HC1 negative');
  assert.equal(new Set(markers.map(m => m.name)).size, markers.length);
  assert.ok(markers.length >= 17);
  // The shipped constructors' crossed operation/variant pairings.
  assert.ok(markers.filter(m => m.name.startsWith('hc2-')).length >= 11);
  assert.equal(oracle('DECLARED').length, 56);
  assert.equal(oracle('UNAVAILABLE').length, 14);
});

test('canonical no-emit compile of the HC1 proof resolves package declarations and has no diagnostics', () => {
  requireHc1Declarations(tenant);
  const config = proofConfig();
  assert.deepEqual(config.fileNames.map(file => path.resolve(file)), [proofPath]);
  const {program, errors} = compile(proofPath, config.options);
  assert.deepEqual(errors.map(format), []);
  const files = program.getSourceFiles().map(file => path.resolve(file.fileName));
  assert.equal(files.some(file => file.startsWith(path.join(tenant, 'code/src'))), false, 'no tenant source is compiled');
  assert.ok(files.includes(path.join(tenant, 'build/code/src/public/index.d.ts')));
});

test('each HC1 negative fails on its own line for its declared reason', () => {
  requireHc1Declarations(tenant);
  const stripped = proofText.replace(/\/\/ @ts-expect-error HC1-NEG/g, '// HC1-NEG');
  const {errors} = compile(proofPath, proofConfig().options, stripped);
  const rows = errors.map(format);
  for (const marker of markers) {
    const codes = rows.filter(row => row.file !== null && path.resolve(row.file) === proofPath && row.line === marker.line).map(row => row.code);
    assert.ok(codes.length > 0, `${marker.name} does not fail`);
    for (const code of codes) assert.ok(marker.codes.includes(code), `${marker.name}: TS${code}`);
  }
  assert.deepEqual(rows.filter(row => !markers.some(marker => row.line === marker.line && row.file !== null && path.resolve(row.file) === proofPath)), []);
});

test('packed consumer compiles the HC1 proof from canonical package declarations only', t => {
  const packageRoot = candidatePackage(t);
  const manifest = requireHc1Declarations(packageRoot);
  const consumer = scratch(t, 'abg-hc1-consumer-');
  fs.writeFileSync(path.join(consumer, 'package.json'), '{"type":"module","private":true}\n');
  fs.mkdirSync(path.join(consumer, 'node_modules/@abiogenesis'), {recursive: true});
  fs.symlinkSync(packageRoot, path.join(consumer, 'node_modules', PACKAGE_NAME), 'dir');
  const root = path.join(consumer, 'framework-handoff.compile.ts');
  fs.copyFileSync(proofPath, root);
  const {program, errors} = compile(root, {...proofConfig().options, preserveSymlinks: true});
  assert.deepEqual(errors.map(format), []);
  const files = program.getSourceFiles().map(file => path.resolve(file.fileName));
  const tenantOwned = [path.join(tenant, 'code'), path.join(tenant, 'build')].map(dir => dir + path.sep);
  assert.equal(files.some(file => tenantOwned.some(dir => file.startsWith(dir))), false, 'no tenant source or build is compiled');
  const declarations = files.filter(file => file.startsWith(path.join(consumer, 'node_modules', PACKAGE_NAME, 'build') + path.sep));
  assert.ok(declarations.length > 0);
  for (const subpath of ['./public', './product']) {
    const resolved = ts.resolveModuleName(PACKAGE_NAME + subpath.slice(1), root, {...proofConfig().options, preserveSymlinks: true}, ts.sys).resolvedModule;
    assert.equal(path.resolve(resolved.resolvedFileName), path.join(consumer, 'node_modules', PACKAGE_NAME, manifest.exports[subpath].types));
  }
  t.diagnostic(JSON.stringify({kind: 'hc1_packed_consumer', compilerVersion: ts.version, package: `${manifest.name}@${manifest.version}`,
    packageDeclarations: declarations.length, negatives: markers.length}));
});

test('packed runtime keeps 56 declared, 42 callable and 14 unavailable members and its raw refusals', async t => {
  const pkg = await loadPackage(candidatePackage(t));
  const definitions = pkg.public.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions;
  assert.deepEqual(definitions.map(keyOf).sort(), [...oracle('DECLARED')].sort());
  const modules = {'./product': pkg.product, './abg': pkg.abg, './validator': pkg.validator};
  const callable = [], unavailable = [];
  for (const definition of definitions) {
    const locator = definition.executionBindingSpecification.callable;
    assert.equal(locator.packageName, PACKAGE_NAME);
    // The binding member path is the owner contract-root member path.
    assert.deepEqual(locator.memberPath, definition.requestContract.source.memberPath, keyOf(definition));
    let selected = modules[locator.packageExportPath];
    for (const segment of [locator.namedExport, ...locator.memberPath]) {
      selected = selected !== null && typeof selected === 'object' && Object.hasOwn(selected, segment) ? selected[segment] : undefined;
    }
    (typeof selected === 'function' ? callable : unavailable).push(keyOf(definition));
    if (typeof selected !== 'function') assert.equal(selected, undefined, keyOf(definition));
  }
  assert.equal(callable.length, 42);
  assert.deepEqual(unavailable.sort(), [...oracle('UNAVAILABLE')].sort());

  // Every unavailable member sends one structurally exact call through the raw
  // transport and reaches its absent binding; the finite request table is
  // scenario data per declared member, its slots follow the member's own
  // declared authority-slot requirements.
  const api = pkg.public, hash = pkg.product.sha256Canonical, ref = label => ({ref: label, digest: hash({label})});
  const contractCatalog = {productId: 'product://hc1-proof/catalog', productContentDigest: hash('hc1-content'),
    catalogId: 'catalog://hc1-proof/public', catalogVersion: '5.0.0', catalogDigest: hash('hc1-catalog')};
  const respond = (responseKind, choice) => ({interaction: ref('interaction://hc1'), responseContract: ref('contract://hc1/response'),
    responseKind, choice, value: {response: responseKind}, evidence: [ref('evidence://hc1')], currentBasis: ref('basis://hc1')});
  const witness = (act, subjectKind, context) => ({subjectKind, subject: ref(`subject://hc1/${act}`), act,
    content: {kind: 'typed_reason', contentContract: ref('contract://hc1/reason'), value: {reason: 'hc1'}},
    context, evidence: [ref('evidence://hc1')], provenance: [ref('provenance://hc1')]});
  const UNAVAILABLE_REQUESTS = {
    'abg.operation.interaction.respond#answer_escalation': respond('answer_escalation', null),
    'abg.operation.interaction.respond#approve': respond('approve', null),
    'abg.operation.interaction.respond#assess': respond('assess', null),
    'abg.operation.interaction.respond#reject': respond('reject', null),
    'abg.operation.interaction.respond#select': respond('select', ref('choice://hc1')),
    'abg.operation.project.read#ticket_consensus': {caseKey: 'ticket_consensus',
      source: {sourceKind: 'consensus_result', sourceRef: 'consensus-result://hc1', sourceDigest: hash({label: 'consensus-result://hc1'})},
      projectionBasis: {projectionBasisRef: 'projection-basis://hc1/ticket_consensus', projectionBasisDigest: hash({label: 'projection-basis://hc1'})},
      selector: {kind: 'ticket_consensus', ticket: ref('ticket://hc1'), outputAuthority: ref('result://hc1'), replayBasis: ref('replay://hc1')}},
    'abg.operation.project.read#run_gaps': {caseKey:'run_gaps',source:{sourceKind:'run',sourceRef:'source://hc1/run_gaps',sourceDigest:hash('run_gaps')},
      projectionBasis:{projectionBasisRef:'projection-basis://hc1/run_gaps',projectionBasisDigest:hash('basis')},selector:{kind:'none'}},
    'abg.operation.project.read#workspace_gaps': {caseKey:'workspace_gaps',source:{sourceKind:'workspace_binding',sourceRef:'source://hc1/workspace_gaps',sourceDigest:hash('workspace_gaps')},
      projectionBasis:{projectionBasisRef:'projection-basis://hc1/workspace_gaps',projectionBasisDigest:hash('basis')},selector:{kind:'workspace_gap_basis',gapBasis:ref('gap-basis://hc1')}},
    'abg.operation.project.read#run_lawful_actions': {caseKey:'run_lawful_actions',source:{sourceKind:'run',sourceRef:'source://hc1/run_lawful_actions',sourceDigest:hash('run_lawful_actions')},
      projectionBasis:{projectionBasisRef:'projection-basis://hc1/run_lawful_actions',projectionBasisDigest:hash('basis')},selector:{kind:'next_action',projection:ref('projection://hc1')}},
    'abg.operation.run.continue#selected_action': {run: ref('run://hc1'), continuation: ref('continuation://hc1'),
      selectedAction: ref('action://hc1'), basisRelation: {kind: 'same_basis'}},
    'abg.operation.witness.admit#attest': witness('attest', 'evidence_claim', {kind: 'basis', basis: ref('basis://hc1')}),
    'abg.operation.witness.admit#hygiene-stamp': witness('hygiene-stamp', 'workspace', {kind: 'workspace', workspace: ref('workspace://hc1')}),
    'abg.operation.witness.admit#intake': witness('intake', 'intake_item', {kind: 'segment', run: ref('run://hc1'), segment: ref('segment://hc1')}),
    'abg.operation.witness.admit#run-resumed': witness('run-resumed', 'run', {kind: 'run', run: ref('run://hc1'), basis: ref('basis://hc1')}),
  };
  assert.deepEqual(Object.keys(UNAVAILABLE_REQUESTS).sort(), [...oracle('UNAVAILABLE')].sort());
  const SLOT_VALUES = {workspace_binding: ref('workspace-binding://hc1'), product_set: [ref('product://hc1')],
    dependency_lock: ref('lock://hc1'), actor: {actor: ref('actor://hc1'), attribution: ref('attribution://hc1')},
    execution_basis: ref('execution-basis://hc1'), catalog_scope: ref('catalog://hc1'), execution_program: ref('program://hc1'),
    graph_function: {graphFunction: ref('graph-function://hc1'), membership: ref('membership://hc1')},
    input_contract: {contract: ref('contract://hc1/input'), valueRef: 'value://hc1', valueDigest: hash({value: 'hc1'}), value: {value: 'hc1'}},
    session_policy: ref('policy://hc1'), transport_steering: ref('steering://hc1')};
  const SLOT_NAMES = ['workspace_binding', 'product_set', 'dependency_lock', 'catalog_scope', 'execution_program',
    'graph_function', 'input_contract', 'session_policy', 'capability_grants', 'actor', 'transport_steering',
    'verification_references', 'execution_basis'];
  const unavailableCalls = [];
  for (const [key, request] of Object.entries(UNAVAILABLE_REQUESTS)) {
    const definition = definitions.find(row => keyOf(row) === key);
    const {operationId, memberKey} = definition.definitionKey;
    const projection = api.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(row => row.operationId === operationId)
      .definitions.find(row => row.definitionKey.memberKey === memberKey);
    const asset = api.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(row => row.operationId === operationId);
    const coordinate = (slot, definitionRef) => ({contractCatalog, flatRow: {contractId: operationId,
      contractVersion: '5.0.0', contractDigest: asset.contentDigest}, nestedSelector: {selectorKind: 'operation_definition_slot',
      definitionKey: definition.definitionKey, slot, definitionRef}});
    const required = new Set(definition.authoritySlotRequirements);
    const slots = Object.fromEntries(SLOT_NAMES.map(slot => [slot, !required.has(slot) ? null
      : slot === 'capability_grants' ? {requiredCapabilityRefs: [...definition.capabilityRefs], grants: [ref('grant://hc1')]}
      : SLOT_VALUES[slot]]));
    for (const slot of required) assert.ok(slots[slot] !== null, `${key} ${slot} has scenario data`);
    const call = api.constructInstalledPublicDefinitionCall({product: pkg.product, installedPublic: api, contractCatalog,
      definitionContractCoordinates: {operations: [{operationId, members: [{memberKey,
        slots: {request: coordinate('request', projection.requestContract.definitionRef), result: coordinate('result', projection.resultContract.definitionRef),
          refusal: coordinate('refusal', projection.refusalContract.definitionRef),
          nonTerminal: projection.nonTerminalContract === null ? null : coordinate('non_terminal', projection.nonTerminalContract.definitionRef)}}]}]},
      operationId, memberKey, request, slots, resources: {}, requestRef: `request://hc1/${memberKey}`,
      correlationRef: `correlation://hc1/${memberKey}`, eventTime: '2026-11-03T00:00:00.000Z', provenanceRefs: []});
    const refused = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, call);
    assert.equal(refused.kind, 'installed_definition_call_transport_refusal', `${key}: ${JSON.stringify(refused)}`);
    assert.equal(refused.code, 'installed_binding_unavailable', `${key}: ${refused.message}`);
    unavailableCalls.push(call);
  }
  assert.equal(unavailableCalls.length, 14);
  const [call] = unavailableCalls;
  const unknown = await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, {...call,
    invocation: {...call.invocation, definitionKey: {operationId: 'abg.operation.witness.admit', memberKey: 'absent'}}});
  assert.equal(unknown.code, 'unknown_definition');
  assert.equal((await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, null)).code, 'invalid_definition_call');
  assert.equal((await api.runInstalledDefinitionCallTransport({kind: 'eventless'}, {...call, request: call.invocation.request})).code, 'invalid_definition_call');
  assert.equal((await api.runInstalledDefinitionCallTransport({kind: 'new', eventLogPath: '/hc1/absent.jsonl'}, call)).code, 'acquisition_mismatch');
  t.diagnostic(JSON.stringify({kind: 'hc1_packed_runtime_inventory', declared: definitions.length, callable: callable.length, unavailable,
    rawUnavailableRefusals: unavailableCalls.map(row => `${row.invocation.definitionKey.operationId}#${row.invocation.definitionKey.memberKey}`)}));
});

// Retired (T-292 TD-59): 'per-slot owner schemas equal the exact014 baseline archive'; equality with a package cut before RC6 is a superseded-cut claim (the T-290 C-5 class).
test('every packed owner slot contract has its canonical projected schema', async t => {
  const candidate = await loadPackage(candidatePackage(t));
  // One row per declared member and slot; each slot that carries an owner
  // contract names its member in that slot's projected operation schema asset.
  const rows = new Set(), unprojected = [];
  let contracts = 0;
  for (const definition of candidate.public.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions) {
    const {operationId, memberKey} = definition.definitionKey;
    for (const slot of SLOTS) {
      rows.add(`${operationId}#${memberKey} ${slot}`);
      if (definition[`${slot}Contract`] === null) continue;
      contracts++;
      const assetSlot = slot === 'nonTerminal' ? 'non_terminal' : slot;
      const asset = candidate.public.PUBLIC_PROJECTION_PAYLOADS.operationSchemaAssets.find(row =>
        row.operationId === operationId && row.slot === assetSlot);
      if (!Object.hasOwn(asset?.content?.$defs ?? {}, memberKey)) unprojected.push({operationId, memberKey, slot});
    }
  }
  assert.equal(rows.size, 56 * SLOTS.length);
  assert.deepEqual(unprojected, [], 'every owner slot contract has its canonical projected schema');
  t.diagnostic(JSON.stringify({kind: 'hc1_projected_slot_schemas', slots: rows.size, contracts}));
});
