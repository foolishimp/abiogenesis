#!/usr/bin/env node
// Installed-owner smoke for the local RC12 candidate, on the route of the RC11
// smoke: a fresh process imports product, abg, public and validator through the
// installed package's declared exports; the installed owners re-verify the
// archive and the installed content; one new empty event resource is acquired,
// read at its durable prefix (zero events) and closed. Expected identity and
// counts come from the candidate's cut record and its installed members, not
// from earlier candidates. The closed empty resource is left in --scratch.
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {PACKAGE_NAME, PRODUCT_ID, VERSION, absent, exists, hex, log, mode, now, parseArgs, pin, required, stamp, writeOnce} from './cut-common.mjs';

const USAGE = `usage: node installed-owner-smoke.mjs (--dry-run | --apply)
  --install-record <INSTALL_RECORD.json> --output <report file; must not exist> --scratch <work directory>`;
const args = parseArgs(process.argv.slice(2), {values: ['install-record', 'output', 'scratch'], flags: ['dry-run', 'apply'], usage: USAGE});
required(args, ['install-record', 'output', 'scratch'], USAGE);
const MODE = mode(args, USAGE);
const installRecordPath = resolve(args['install-record']), realOutput = resolve(args.output), scratch = resolve(args.scratch);
absent(realOutput, '--output');
assert(exists(dirname(realOutput)), `parent of --output does not exist: ${dirname(realOutput)}`);
mkdirSync(scratch, {recursive: true});
const runDir = join(scratch, `smoke-${MODE}-${stamp()}`);
absent(runDir, 'run directory');
mkdirSync(runDir);
const output = MODE === 'apply' ? realOutput : join(runDir, 'INSTALLED_OWNER_SMOKE.json');

const install = JSON.parse(readFileSync(installRecordPath, 'utf8'));
assert.equal(install.kind, 'local_unqualified_development_candidate_install');
const records = dirname(installRecordPath);
const cut = JSON.parse(readFileSync(install.cutRecord.path, 'utf8'));
assert.equal(hex(readFileSync(install.cutRecord.path)), install.cutRecord.sha256, 'cut record changed since install');
const installation = JSON.parse(readFileSync(join(records, 'installation.json'), 'utf8'));
assert.equal(installation.installedRoot, install.installedRoot);
for (const [key, value] of [['version', VERSION], ['productId', PRODUCT_ID]]) assert.equal(cut[key], value, `cut record ${key}`);

const report = {kind: 'local_rc12_installed_owner_smoke', mode: MODE, status: 'PENDING', startedUtc: now(), installedRoot: install.installedRoot,
  installRecord: pin(installRecordPath), cutRecord: install.cutRecord, archive: install.archive, nativeTransportInvoked: false, providerCalls: 0, qualified: false};
let store = null, closeAttempted = false, failure = null;
try {
  // Fresh imports through the installed package's declared exports only.
  const root = install.installedRoot, pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, PACKAGE_NAME);
  assert.equal(pkg.version, VERSION);
  const runtime = {};
  for (const name of ['product', 'abg', 'public', 'validator']) {
    const entry = pkg.exports['./' + name], locator = typeof entry === 'string' ? entry : entry?.import;
    const path = resolve(root, locator);
    assert(path.startsWith(root + '/'), `export ${name} escapes the installed root`);
    runtime[name] = await import(pathToFileURL(path).href);
  }
  const {product, abg, public: publicApi} = runtime;

  // Identity and counts: runtime against the cut record and the installed members themselves.
  assert.equal(product.ABI5_PACKAGE_VERSION, cut.version);
  assert.equal(product.ABI5_PRODUCT_ID, cut.productId);
  const adapter = JSON.parse(readFileSync(join(root, 'contracts/public-functions/adapter-projection.json'), 'utf8'));
  const family = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY;
  assert.equal(family.definitions.length, cut.candidate.publicFunctionDefinitionCount, 'Public definitions differ from the cut record');
  assert.equal(family.definitions.length, adapter.sdkMembers.length, 'Public definitions differ from the installed adapter projection');
  assert.equal(family.familyDigest, cut.candidate.publicFunctionFamilyDigest, 'Public family digest differs from the cut record');
  assert.equal(family.familyDigest, adapter.family.familyDigest);
  assert.deepEqual(Object.keys(pkg.exports), cut.candidate.packageExports, 'package exports differ from the cut record');
  for (const name of ['constructInstalledPublicDefinitionCall', 'runInstalledDefinitionCallWithResource']) assert.equal(typeof publicApi[name], 'function', name);
  assert.equal(typeof runtime.validator, 'object');

  // Installed owners re-verify the shipped archive and the installed content.
  const request = {artifactPath: install.archive.path, artifactRef: pathToFileURL(install.archive.path).href,
    expectedArtifactDigest: cut.identity.artifactDigest, expectedProductContentDigest: cut.identity.productContentDigest,
    expectedManifestDigest: cut.identity.manifestDigest, expectedProductId: cut.productId, expectedPackageName: PACKAGE_NAME, expectedPackageVersion: cut.version};
  const verified = await product.verifyProduct(request);
  assert.equal(verified.disposition, 'verified', JSON.stringify(verified).slice(0, 2000));
  assert.equal(product.isVerifiedProductArtifact(verified), true);
  assert.strictEqual(product.selectOwnedProductVerification(request, verified), verified);
  assert(await product.installedProductContentMatches(installation), 'installed content check failed');
  Object.assign(report, {version: product.ABI5_PACKAGE_VERSION, productId: product.ABI5_PRODUCT_ID, artifactDigest: cut.identity.artifactDigest,
    verification: verified.disposition, installedContentMatches: true, importedModules: ['product', 'abg', 'public', 'validator'],
    publicFunctionDefinitions: family.definitions.length, publicFunctionFamilyDigest: family.familyDigest, packageExportPaths: Object.keys(pkg.exports).length,
    expectedFrom: 'cut record candidate facts and the installed adapter projection'});

  // One new empty resource: acquire, read at the durable prefix, close.
  const resourceDir = join(runDir, 'owner-resource');
  mkdirSync(resourceDir);
  const acquired = abg.createNewEmptyAppendSink({kind: 'new_empty_append_sink_request', schemaVersion: '5.0.0', eventLogPath: join(resourceDir, 'events.jsonl')});
  assert(acquired.store && acquired.prefix, 'new resource owner refused');
  store = acquired.store;
  report.resource = {eventLogPath: join(resourceDir, 'events.jsonl'), prefix: acquired.prefix};
  const events = abg.readRuntimeEventsAtDurablePrefix(acquired.prefix);
  assert(Array.isArray(events));
  assert.equal(events.length, 0);
  report.ownerReadEvents = events.length;
  closeAttempted = true;
  report.actualClose = store.projectReopenAuthorityAndClose();
  assert.deepEqual(report.actualClose.prefix, acquired.prefix);
  const log0 = readFileSync(join(resourceDir, 'events.jsonl'));
  assert.equal(log0.length, 0);
  report.closedEmptyLog = {bytes: 0, sha256: hex(log0), retained: resourceDir};
  report.status = 'INSTALLED_OWNER_SMOKE_CLOSED';
} catch (error) {
  failure = error;
  report.status = 'INSTALLED_OWNER_SMOKE_FAILED';
  report.failure = String(error?.stack ?? error);
} finally {
  if (store && !closeAttempted) {
    try { report.actualClose = store.projectReopenAuthorityAndClose(); } catch (error) { report.closeFailure = String(error); failure ??= error; }
  }
  report.endedUtc = now();
  const written = writeOnce(output, report);
  if (failure) { log(`smoke failed: ${failure?.message ?? failure}`); process.exitCode = 1; }
  console.log(JSON.stringify({status: report.status, version: report.version, publicFunctionDefinitions: report.publicFunctionDefinitions,
    packageExportPaths: report.packageExportPaths, ownerReadEvents: report.ownerReadEvents, report: written}));
}
