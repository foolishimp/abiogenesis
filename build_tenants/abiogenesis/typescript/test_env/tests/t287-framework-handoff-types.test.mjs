// T287 HC1 owner-derived native call typing and the HC2 shipped constructor
// types. Real compiler checks of the canonical and packed package
// declarations, packed-runtime inventory and raw refusals, and a per-slot
// schema comparison with the exact014 baseline. Not HC2 runtime population,
// installed Run proof, qualification or release evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const tenant = path.resolve(process.env.ABG_FRAMEWORK_HANDOFF_TENANT_ROOT ?? path.resolve(import.meta.dirname, '../..'));
const proofPath = path.join(tenant, 'test_env/types/framework-handoff.compile.ts');
const proofConfigPath = path.join(tenant, 'test_env/tsconfig.framework-handoff.json');
const BASELINE_SHA256 = 'b775014c1ef3c2e6f0f027236c3555702b159b673b4baf764b8bfd93f51af1db';
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

/** Fail closed on the declared C2 baseline input; returns the exact hashed bytes. */
function baselineArchiveBytes() {
  const archive = process.env.ABI5_HC1_BASELINE_PACKAGE_PATH;
  assert.ok(typeof archive === 'string' && archive.length > 0,
    'ABI5_HC1_BASELINE_PACKAGE_PATH must name the exact014 baseline package (.tgz); schema identity is not assumed');
  let stat, bytes;
  try { stat = fs.lstatSync(archive); } catch (error) {
    assert.fail(`ABI5_HC1_BASELINE_PACKAGE_PATH is unreadable (${error.code}): ${archive}; schema identity is not assumed`);
  }
  assert.ok(stat.isFile(), `ABI5_HC1_BASELINE_PACKAGE_PATH is not a regular file: ${archive}; schema identity is not assumed`);
  try { bytes = fs.readFileSync(archive); } catch (error) {
    assert.fail(`ABI5_HC1_BASELINE_PACKAGE_PATH is unreadable (${error.code}): ${archive}; schema identity is not assumed`);
  }
  assert.equal(createHash('sha256').update(bytes).digest('hex'), BASELINE_SHA256,
    `ABI5_HC1_BASELINE_PACKAGE_PATH is not the exact014 baseline: ${archive}; schema identity is not assumed`);
  return bytes;
}

/** Extracts exactly the verified bytes, not a second read of the path. */
function extractBytes(bytes, into) {
  fs.mkdirSync(into, {recursive: true});
  execFileSync('tar', ['-xzf', '-', '-C', into], {input: bytes, maxBuffer: 1 << 26});
  return path.join(into, 'package');
}

/** The candidate is an explicit packed archive, an explicit extracted package
 * root, or a fresh `npm pack --ignore-scripts` of the built tenant. */
function candidatePackage(t) {
  if (process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ROOT !== undefined) return path.resolve(process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ROOT);
  const root = scratch(t, 'abg-hc1-candidate-');
  let archive = process.env.ABG_FRAMEWORK_HANDOFF_PACKAGE_ARCHIVE;
  if (archive === undefined) {
    requireHc1Declarations(tenant);
    const [packed] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', root],
      {cwd: tenant, encoding: 'utf8', maxBuffer: 1 << 26}));
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
const sorted = value => Array.isArray(value) ? value.map(sorted) : value !== null && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
const canonical = value => JSON.stringify(sorted(value));

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
  assert.equal(oracle('UNAVAILABLE').length, 9);
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

test('packed runtime keeps 56 declared, 47 callable and 9 unavailable members and its raw refusals', async t => {
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
  assert.equal(callable.length, 47);
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
    'abg.operation.witness.admit#attest': witness('attest', 'evidence_claim', {kind: 'basis', basis: ref('basis://hc1')}),
    'abg.operation.witness.admit#hygiene-stamp': witness('hygiene-stamp', 'workspace', {kind: 'workspace', workspace: ref('workspace://hc1')}),
    'abg.operation.witness.admit#intake': witness('intake', 'intake_item', {kind: 'segment', run: ref('run://hc1'), segment: ref('segment://hc1')}),
    'abg.operation.witness.admit#run-resumed': witness('run-resumed', 'run', {kind: 'run', run: ref('run://hc1'), basis: ref('basis://hc1')}),
  };
  assert.deepEqual(Object.keys(UNAVAILABLE_REQUESTS).sort(), [...oracle('UNAVAILABLE')].sort());
  const SLOT_VALUES = {workspace_binding: ref('workspace-binding://hc1'), product_set: [ref('product://hc1')],
    dependency_lock: ref('lock://hc1'), actor: {actor: ref('actor://hc1'), attribution: ref('attribution://hc1')},
    execution_basis: ref('execution-basis://hc1')};
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
  assert.equal(unavailableCalls.length, 9);
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

test('per-slot owner schemas equal the exact014 baseline archive', async t => {
  const baseline = await loadPackage(extractBytes(baselineArchiveBytes(), scratch(t, 'abg-hc1-baseline-')));
  const candidate = await loadPackage(candidatePackage(t));
  // One row per declared member and slot: the canonical strict JSON projection
  // of the owner slot schema and the owner contract identity bound to it.
  const unprojected = [];
  const slotRows = (pkg, side) => {
    const rows = new Map();
    for (const definition of pkg.public.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions) {
      const {operationId, memberKey} = definition.definitionKey;
      for (const slot of SLOTS) {
        const contract = definition[`${slot}Contract`];
        const assetSlot = slot === 'nonTerminal' ? 'non_terminal' : slot;
        const asset = pkg.public.PUBLIC_PROJECTION_PAYLOADS.operationSchemaAssets.find(row =>
          row.operationId === operationId && row.slot === assetSlot);
        let fields = null;
        if (contract !== null) {
          const {schema: _runtimeSchema, ...identity} = contract;
          const projected = Object.hasOwn(asset?.content?.$defs ?? {}, memberKey);
          if (!projected) unprojected.push({side, operationId, memberKey, slot});
          fields = {...identity, projectedSchema: projected ? asset.content.$defs[memberKey] : null};
        }
        rows.set(`${operationId}#${memberKey} ${slot}`, {operationId, memberKey, slot,
          fields: fields === null ? null : Object.fromEntries(Object.keys(fields).map(key => [key, canonical(fields[key])]))});
      }
    }
    return rows;
  };
  const expected = slotRows(baseline, 'baseline'), actual = slotRows(candidate, 'candidate');
  assert.equal(expected.size, 56 * SLOTS.length);
  assert.deepEqual(unprojected, [], 'every owner slot contract has its canonical projected schema');
  const drift = [];
  for (const key of [...new Set([...expected.keys(), ...actual.keys()])].sort()) {
    const before = expected.get(key), after = actual.get(key), row = before ?? after;
    const location = {operationId: row.operationId, memberKey: row.memberKey, slot: row.slot};
    if (before === undefined || after === undefined) {
      drift.push({...location, change: before === undefined ? 'slot_added' : 'slot_removed'});
    } else if ((before.fields === null) !== (after.fields === null)) {
      drift.push({...location, change: before.fields === null ? 'contract_added' : 'contract_removed'});
    } else if (before.fields !== null) {
      const names = [...new Set([...Object.keys(before.fields), ...Object.keys(after.fields)])].sort();
      const changed = names.filter(name => before.fields[name] !== after.fields[name]);
      if (changed.length > 0) drift.push({...location, change: 'contract_changed', fields: changed});
    }
  }
  assert.deepEqual(drift, [], `runtime owner slot schemas drift from exact014: ${JSON.stringify(drift)}`);
  t.diagnostic(JSON.stringify({kind: 'hc1_baseline_schema_identity', slots: expected.size,
    contracts: [...expected.values()].filter(row => row.fields !== null).length, baselineSha256: BASELINE_SHA256,
    familyDigestEqual: baseline.public.PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest === candidate.public.PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest}));
});
