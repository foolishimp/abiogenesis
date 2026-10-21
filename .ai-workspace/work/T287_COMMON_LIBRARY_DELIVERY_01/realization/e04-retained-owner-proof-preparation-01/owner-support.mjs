import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SourceTextModule, SyntheticModule } from 'node:vm';

export const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export const SOURCE_FILES = Object.freeze([
  { relativePath: 'src/first.txt', text: 'first protected bytes\n' },
  { relativePath: 'src/second.txt', text: 'second protected bytes\n' },
]);

export async function loadProduct(stageRoot) {
  const load = relative => import(pathToFileURL(join(stageRoot, 'build/code/src', relative)).href);
  return Object.assign({}, ...await Promise.all([
    'shared/digests.js', 'shared/canonical_json.js', 'product/environment.js',
    'product/worksite_effect.js', 'product/worksite_operations.js',
    'product/worksite_command_execution.js', 'product/worksite_command_forward.js',
  ].map(load)));
}

// Exposure only: exact emitted bodies; no main/launch/manifests/owner effects.
// The two optional substrate seams are selected explicitly by their one case.
export async function exposeOwners(stageRoot, fsOverrides = {}) {
  const before = new Map(['SIGTERM', 'SIGINT'].map(name => [name, process.listeners(name)]));
  const added = [];
  const expose = async (relative, names, removeMain) => {
    const file = join(stageRoot, 'build/code/src', relative);
    let source = (await fs.readFile(file, 'utf8')).replace(/^#!.*\n/u, '');
    if (removeMain) {
      assert.match(source, /await main\(\);\s*$/u);
      source = source.replace(/await main\(\);\s*$/u, `export { ${names.join(', ')} };\n`);
    } else source += `\nexport { ${names.join(', ')} };\n`;
    const module = new SourceTextModule(source, { identifier: file,
      initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; } });
    await module.link(async specifier => {
      assert.ok(specifier.startsWith('node:') || specifier.startsWith('.'), `undeclared import ${specifier}`);
      const imported = { ...await import(specifier.startsWith('node:') ? specifier
        : pathToFileURL(resolve(dirname(file), specifier)).href) };
      if (specifier === 'node:fs/promises') Object.assign(imported, fsOverrides);
      return new SyntheticModule(Object.keys(imported), function () {
        for (const [name, value] of Object.entries(imported)) this.setExport(name, value);
      });
    });
    await module.evaluate();
    return module.namespace;
  };
  try {
    const helper = await expose('implementation/worksite_command_helper.js',
      ['publishCreateOnly', 'materializeSnapshot'], true);
    const materialization = await expose('product/materialization_operations.js', ['persistExactFile'], false);
    return { persistExactFile: materialization.persistExactFile,
      publishCreateOnly: helper.publishCreateOnly, materializeSnapshot: helper.materializeSnapshot,
      exposure: { helperMainInvoked: false, ownerBodiesRewritten: false,
        substrateOverrides: Object.keys(fsOverrides), removedSignalListeners: added } };
  } finally {
    for (const [name, previous] of before) {
      for (const listener of process.listeners(name)) {
        if (!previous.includes(listener)) { process.removeListener(name, listener); added.push(name); }
      }
    }
  }
}

// Cold owner premises adapted from frozen generic-worksite support 21–49.
// They satisfy Product construction, but assert no actual ABG admission.
export function coldBasis(product, caseRoot) {
  const canonicalRoot = join(caseRoot, 'worksite');
  const digest = label => product.sha256Canonical({ label });
  const id = (scheme, value) => `${scheme}://abiogenesis/${value.slice(7)}`;
  const manifest = { workspaceId: 'workspace://e04-owner/cold', canonicalRoot,
    authorityMode: 'trusted_developer', authorizedActorRef: 'actor://e04-owner/cold' };
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({ ...manifest,
    authorityManifestRef: 'manifest://e04-owner/cold', authorityManifestDigest: product.sha256Canonical(manifest) });
  assert.equal(workspaceAuthorityBasis.kind, 'workspace_authority_basis');
  const bindingBody = { workspaceId: manifest.workspaceId, authorityBasisId: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest, authorizedActorRef: manifest.authorizedActorRef,
    productSetId: 'product-set://e04-owner/cold', productSetDigest: digest('products'), lockId: 'lock://e04-owner/cold', lockDigest: digest('lock'),
    roots: Object.fromEntries(['toolchain', 'product', 'eventLog', 'runtimeState', 'projection', 'archive']
      .map(name => [`${name}Root`, join(caseRoot, name)])) };
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = { kind: 'workspace_binding', schemaVersion: '5.0.0', bindingId: id('workspace-binding', bindingDigest), bindingDigest,
    ...bindingBody, admissionEventRef: 'event://e04-owner/controlled-premise-not-admitted' };
  const grantBody = {
    definitionKey: { operationId: 'abg.operation.run.invoke', memberKey: 'invoke' }, definitionRef: 'definition://e04-owner/invoke', definitionDigest: digest('definition'),
    capabilityDefinition: { graphId: 'capability-graph://e04-owner/cold', graphVersion: '5.0.0', graphDigest: digest('graph'),
      capabilityId: 'capability://abiogenesis/run.invoke', capabilityDefinitionRef: 'capability-definition://e04-owner/cold', capabilityDefinitionDigest: digest('capability-definition') },
    operationContract: {
      contractCatalog: { productId: 'product://e04-owner/cold', productContentDigest: digest('product'), catalogId: 'catalog://e04-owner/cold', catalogVersion: '5.0.0', catalogDigest: digest('catalog') },
      flatRow: { contractId: 'contract://e04-owner/cold', contractVersion: '5.0.0', contractDigest: digest('contract') },
      nestedSelector: { selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null },
    }, operationId: 'abg.operation.run.invoke', capabilityRef: 'capability://abiogenesis/run.invoke', actorRef: manifest.authorizedActorRef,
    approvalRef: workspaceAuthorityBasis.authorityBasisId, approvalDigest: workspaceAuthorityBasis.authorityBasisDigest,
    policyRef: 'policy://e04-owner/cold', policyDigest: digest('policy'), scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest,
    authorityBasisRef: workspaceAuthorityBasis.authorityBasisId, authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest,
  };
  const grantDigest = product.sha256Canonical(grantBody);
  const capabilityGrant = { kind: 'capability_grant', schemaVersion: '5.0.0', grantRef: id('capability-grant', grantDigest), grantDigest, ...grantBody };
  return { canonicalRoot, workspaceAuthorityBasis, workspaceBinding, capabilityGrant };
}

export function commandTask(product, basis, observedFiles) {
  const task = product.constructObservedWorksiteCommandExecutionTask({ ...basis, observedFiles,
    commands: [{ commandId: 'command://e04-owner/carrier-only-never-launched', executable: process.execPath,
      args: ['--version'], relativeCwd: '.', environment: {}, timeoutMs: 1000, terminationGraceMs: 100, expectedReports: [] }],
    outcomePredicates: [], allowedWriteTerritories: [] });
  assert.equal(product.isObservedWorksiteCommandExecutionTask(task), true);
  assert.equal(product.isExecutableWorksiteCommandTask(task), true);
  return task;
}

export function subjectFor(product, basis, relativePath) {
  return product.constructWorksiteSubject({ ...basis, relativePath,
    subjectUri: pathToFileURL(join(basis.canonicalRoot, relativePath)).href });
}

export function errorRecord(error) {
  return { name: error?.name ?? null, code: error?.code ?? null,
    message: error?.message ?? String(error), stack: error?.stack ?? null,
    syscall: error?.syscall ?? null, path: error?.path ?? null, dest: error?.dest ?? null };
}

export async function footprint(root) {
  const rows = [];
  async function visit(path, relativePath) {
    const stat = await fs.lstat(path);
    const row = { relativePath, kind: stat.isSymbolicLink() ? 'symlink' : stat.isDirectory() ? 'directory' : stat.isFile() ? 'file' : 'other',
      dev: stat.dev, ino: stat.ino, nlink: stat.nlink, byteLength: stat.size };
    if (row.kind === 'symlink') row.target = await fs.readlink(path);
    if (row.kind === 'file') { const bytes = await fs.readFile(path); row.sha256 = sha(bytes); row.base64 = bytes.toString('base64'); }
    rows.push(row);
    if (row.kind === 'directory') {
      for (const name of (await fs.readdir(path)).sort()) await visit(join(path, name), relativePath === '.' ? name : `${relativePath}/${name}`);
    }
  }
  await visit(root, '.');
  return rows;
}

export async function assertAbsent(path) {
  try { await fs.lstat(path); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error(`required absent path exists: ${path}`);
}

export async function verifyRows(root, rows) {
  for (const row of rows) {
    const path = join(root, row.path);
    if ('link' in row) assert.equal(await fs.readlink(path), row.link, path);
    else { const bytes = await fs.readFile(path); assert.equal(bytes.byteLength, row.bytes, path); assert.equal(sha(bytes), row.sha256, path); }
  }
}

export async function verifyFrozenStage(config, inputs) {
  const repair = resolve(config.stageRoot, '../../../..');
  assert.equal(sha(await fs.readFile(join(repair, 'freeze.json'))), config.stageFreezeSha256);
  assert.equal(sha(await fs.readFile(config.node)), config.nodeSha256);
  const read = async name => JSON.parse(await fs.readFile(join(repair, name), 'utf8'));
  await verifyRows(join(repair, 'stage'), await read('stage-post-generation-inventory.json'));
  await verifyRows(join(config.stageRoot, 'build'), await read('emitted-inventory.json'));
  const dependencies = await read('dependencies.json'); await verifyRows(dependencies.root, dependencies.files);
  for (const row of inputs.files.filter(row => row.path.startsWith(config.stageRoot + '/'))) {
    const bytes = await fs.readFile(row.path); assert.equal(bytes.byteLength, row.bytes, row.path); assert.equal(sha(bytes), row.sha256, row.path);
  }
}
