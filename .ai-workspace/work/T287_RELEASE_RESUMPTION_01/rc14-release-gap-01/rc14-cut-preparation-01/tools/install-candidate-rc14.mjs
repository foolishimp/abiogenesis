#!/usr/bin/env node
// Local RC14 install, on the route of the RC11 install (install-01): the Product
// owners imported from the archive's own bootstrap extraction verify the
// archive, construct the resolved lock, install it into one empty install host
// (npm offline, no scripts) and check installed content. The installed root is
// then walked: its files equal the archive members exactly, in both directions.
// Writes verification, lock, installation, payload correspondence, an install
// record and SHA256SUMS to --output (create once). --dry-run does all of it
// under --scratch only. No tag, selector, pin, publication or delete.
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  ARCHIVE_NAME, PACKAGE_NAME, PRODUCT_ID, VERSION,
  absent, archiveMembers, childEnvironment, exists, inventory, inventoryDigest, log, mode, now,
  parseArgs, pin, required, reserve, run, stamp, toolchain, within, writeOnce,
} from './cut-common.mjs';

const USAGE = `usage: node install-candidate-rc14.mjs (--dry-run | --apply)
  --cut-record <CUT_RECORD.json> --archive <${ARCHIVE_NAME}>
  --output <install record directory; record files must not exist> --install-host <directory; must not exist>
  --scratch <work directory>`;

const args = parseArgs(process.argv.slice(2), {values: ['cut-record', 'archive', 'output', 'install-host', 'scratch'], flags: ['dry-run', 'apply'], usage: USAGE});
required(args, ['cut-record', 'archive', 'output', 'install-host', 'scratch'], USAGE);
const MODE = mode(args, USAGE);
const cutRecordPath = resolve(args['cut-record']), archive = resolve(args.archive), scratch = resolve(args.scratch);
const realOutput = resolve(args.output), realHost = resolve(args['install-host']);
const RECORDS = ['verification.json', 'resolved-lock.json', 'installation.json', 'payload-correspondence.json', 'INSTALL_RECORD.json', 'SHA256SUMS'];

// Preflight on the real locations, in both modes.
absent(realHost, '--install-host');
assert(exists(dirname(realHost)), `parent of --install-host does not exist: ${dirname(realHost)}`);
for (const name of [...RECORDS, 'bootstrap']) absent(join(realOutput, name), 'install record');
assert(!within(realHost, scratch) && !within(scratch, realHost) || within(scratch, realHost) && within(scratch, realOutput),
  '--install-host and --scratch are separate, or both --install-host and --output lie inside --scratch (scratch proof)');
mkdirSync(scratch, {recursive: true});
reserve([scratch, realHost, realOutput]);

const runDir = join(scratch, `install-${MODE}-${stamp()}`);
absent(runDir, 'run directory');
mkdirSync(runDir, {recursive: true});
const output = MODE === 'apply' ? realOutput : join(runDir, 'records'), host = MODE === 'apply' ? realHost : join(runDir, 'install-host');
const env = childEnvironment(runDir), tools = toolchain(env), logs = join(runDir, 'commands');
const record = {kind: 'local_unqualified_development_candidate_install', schemaVersion: '1', mode: MODE, status: 'FAILED', startedUtc: now(),
  version: VERSION, productId: PRODUCT_ID, cutRecord: pin(cutRecordPath), installHost: host, output};
try {
  // The candidate named by its cut record, and nothing else.
  const cut = JSON.parse(readFileSync(cutRecordPath, 'utf8'));
  assert.equal(cut.kind, 'local_unqualified_development_candidate_cut');
  assert.equal(cut.version, VERSION);
  assert.equal(cut.productId, PRODUCT_ID);
  const archivePin = pin(archive);
  assert.equal(archivePin.sha256, cut.archive.sha256, 'archive digest differs from the cut record');
  assert.equal(archivePin.bytes, cut.archive.bytes, 'archive size differs from the cut record');
  const membersRecord = JSON.parse(readFileSync(join(dirname(cutRecordPath), 'ARCHIVE_MEMBERS.json'), 'utf8'));
  assert.equal(membersRecord.archiveSha256, archivePin.sha256);
  const members = archiveMembers(archive);
  const rows = members.map(({path, bytes, sha256, mode: m}) => ({path, bytes, sha256, mode: m}));
  assert.deepEqual(rows, membersRecord.rows, 'archive members differ from the cut member list');
  assert.equal(inventoryDigest(rows), cut.members.inventoryDigest);
  const expected = {packageName: PACKAGE_NAME, packageVersion: VERSION, productId: PRODUCT_ID, ...cut.identity, sourceCommit: cut.source.commit};
  assert.equal(expected.artifactDigest, `sha256:${archivePin.sha256}`);
  record.archive = archivePin;
  record.expected = expected;

  // Bootstrap: the archive's own Product owners.
  mkdirSync(output, {recursive: true});
  const bootstrap = join(output, 'bootstrap');
  absent(bootstrap, 'bootstrap');
  mkdirSync(bootstrap);
  run('bootstrap-extract', 'tar', ['-xzf', archive, '-C', bootstrap], {cwd: runDir, env, timeoutMs: 120000, logDir: logs});
  const pkg = join(bootstrap, 'package');
  assert.deepEqual(inventory(pkg).map(r => [r.path, r.sha256]), rows.map(r => [r.path, r.sha256]), 'bootstrap extraction differs from the archive members');
  Object.assign(process.env, env); // installProduct runs npm with the inherited environment.
  const product = await import(pathToFileURL(join(pkg, 'build/code/src/product/index.js')).href);
  const manifest = JSON.parse(readFileSync(join(pkg, 'product-toolchain-manifest.json'), 'utf8'));
  assert.equal(product.sha256Canonical(manifest), expected.manifestDigest, 'manifest digest differs from the cut record');
  for (const key of ['productContentDigest', 'productId', 'packageName', 'packageVersion']) assert.equal(manifest[key], expected[key], `manifest ${key}`);

  const request = {artifactPath: archive, artifactRef: pathToFileURL(archive).href,
    expectedArtifactDigest: expected.artifactDigest, expectedProductContentDigest: expected.productContentDigest, expectedManifestDigest: expected.manifestDigest,
    expectedProductId: PRODUCT_ID, expectedPackageName: PACKAGE_NAME, expectedPackageVersion: VERSION};
  const verified = await product.verifyProduct(request);
  const verification = writeOnce(join(output, 'verification.json'), verified);
  assert.equal(verified.disposition, 'verified', JSON.stringify(verified).slice(0, 2000));
  const lock = product.constructResolvedProductLock([verified]);
  const lockPin = writeOnce(join(output, 'resolved-lock.json'), lock);
  assert.equal(lock.kind, 'resolved_product_lock', JSON.stringify(lock).slice(0, 2000));

  // Install through the owner into the one empty host.
  absent(host, 'install host');
  const started = Date.now();
  const installed = await product.installProduct({artifactPath: archive, targetRoot: host, verifiedArtifact: verified, resolvedLock: lock});
  const installMs = Date.now() - started;
  const installation = writeOnce(join(output, 'installation.json'), installed);
  assert.equal(installed.disposition, 'materialized', JSON.stringify(installed).slice(0, 2000));
  assert(product.isProductInstallCandidate(installed, lock), 'owner does not recognise the install candidate in its lock');
  assert(await product.installedProductContentMatches(installed), 'owner content check failed');
  for (const key of ['productId', 'packageName', 'packageVersion', 'artifactDigest', 'productContentDigest', 'manifestDigest']) assert.equal(installed[key], expected[key], `installed ${key}`);
  assert.equal(installed.installedRoot, join(host, 'node_modules', ...PACKAGE_NAME.split('/')));

  // Installed files = archive members, both directions, byte for byte.
  const installedRows = inventory(installed.installedRoot);
  const byPath = new Map(rows.map(r => [r.path, r]));
  const extra = installedRows.filter(r => !byPath.has(r.path)).map(r => `${r.path} (${r.kind})`);
  const missing = rows.filter(r => !installedRows.some(i => i.path === r.path)).map(r => r.path);
  const differing = installedRows.filter(r => byPath.has(r.path) && (r.kind !== 'file' || r.sha256 !== byPath.get(r.path).sha256)).map(r => r.path);
  assert.deepEqual({extra, missing, differing}, {extra: [], missing: [], differing: []}, 'installed root differs from the archive members');
  const hostOutside = inventory(host, {hash: false, skip: p => p === 'node_modules/@abiogenesis'}).map(r => r.path);
  const payload = rows.map(r => ({path: r.path, bytes: r.bytes, digest: `sha256:${r.sha256}`}));
  const correspondence = writeOnce(join(output, 'payload-correspondence.json'), {artifactDigest: expected.artifactDigest, installedRoot: installed.installedRoot,
    members: payload.length, installedFiles: installedRows.length, exactBothDirections: true, inventoryDigest: product.sha256Canonical(payload), inventory: payload});

  Object.assign(record, {status: MODE === 'apply' ? 'INSTALL_COMPLETE_UNQUALIFIED' : 'DRY_RUN_INSTALL_COMPLETE_IN_SCRATCH', endedUtc: now(),
    installId: installed.installId, installedRoot: installed.installedRoot,
    installedCli: join(installed.installedRoot, 'build/code/src/public/cli.js'),
    members: rows.length, installedFiles: installedRows.length, installedEqualsArchive: true, hostFilesOutsideInstalledRoot: hostOutside,
    owners: {imported: 'archive bootstrap extraction', verification: verified.disposition, lock: lock.kind, installation: installed.disposition,
      installCandidateInLock: true, installedContentMatches: true},
    records: {verification, resolvedLock: lockPin, installation, payloadCorrespondence: correspondence},
    toolchain: tools, environment: env, installWallMs: installMs,
    claims: {local: true, unqualified: true, published: false, providerCalls: 0, nativeRuns: 0, tagsCreated: false, selectorChanged: false, pinChanged: false,
      qualificationTransferredFromEarlierCandidates: false},
    claim: `Local install of the unqualified development candidate ${VERSION} (${expected.artifactDigest}) through the Product's own verify, lock, install and content owners. It claims nothing about qualification, native workflows or earlier candidates.`});
  const installRecord = writeOnce(join(output, 'INSTALL_RECORD.json'), record);
  const sums = [];
  for (const name of RECORDS.slice(0, -1)) sums.push(`${pin(join(output, name)).sha256}  ${name}`);
  for (const name of [ARCHIVE_NAME, 'CUT_RECORD.json', 'ARCHIVE_MEMBERS.json']) if (exists(join(output, name))) sums.push(`${pin(join(output, name)).sha256}  ${name}`);
  writeOnce(join(output, 'SHA256SUMS'), sums.join('\n') + '\n');
  console.log(JSON.stringify({status: record.status, installId: installed.installId, installedRoot: installed.installedRoot, members: rows.length,
    installedFiles: installedRows.length, installedEqualsArchive: true, installWallMs: installMs, installRecord}));
} catch (error) {
  record.error = String(error?.stack ?? error);
  log(`install failed: ${error?.message ?? error}`);
  try { writeOnce(join(runDir, 'INSTALL_FAILURE.json'), {...record, endedUtc: now()}); } catch {}
  log(`run directory and any partial install preserved: ${runDir}`);
  process.exitCode = 1;
}
