// Controlled physical verification, not a live or newly admitted Run.
// Only the tiny external consumer is copied. The exact admitted installation
// record is re-rooted solely as an input to the existing public byte checker.
import assert from 'node:assert/strict';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const reviewRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../../', import.meta.url));
const archive = join(repoRoot, 'build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/basic-cli/2026-10-06T00-49-50-139Z-5971a701-5228-4d17-99c2-e7173098f44c');
const setup = JSON.parse(await readFile(join(archive, 'setup-identity.json'), 'utf8'));
const bootstrapRoot = join(archive, 'bootstrap/node_modules/@abiogenesis/typescript-tenant');
const product = await import(pathToFileURL(join(bootstrapRoot, 'build/code/src/product/index.js')).href);
const abg = await import(pathToFileURL(join(bootstrapRoot, 'build/code/src/abg/index.js')).href);
const close = JSON.parse(await readFile(join(archive, 'final-close-handoff.json'), 'utf8'));
const eventPath = fileURLToPath(close.prefix.eventLogRef);
const eventBytes = await readFile(eventPath);
const environmentBefore = abg.projectExactPrefixWorkspaceEnvironment(close.prefix, setup.workspaceBinding);
assert.equal(environmentBefore.kind, 'exact_prefix_workspace_environment');
const scratch = join(reviewRoot, 'scratch-' + randomUUID());
const report = {
  classification: 'Controlled physical-byte verification over a re-rooted copy, not a live admitted Run or UAT pass',
  candidateFreezeSHA256: '7a98cfef9c16122b5705adb1cc151f7a3674452a4fc7bd32034106a73df83930',
  ownerAPI: 'trustedBootstrap.product.installedProductContentMatches(install)',
  originalInstalledChecks: [], controlledCopyChecks: [],
};
try {
  for (const install of setup.installations) {
    const unchanged = await product.installedProductContentMatches(install);
    assert.equal(unchanged, true);
    report.originalInstalledChecks.push({ package: install.packageName, unchanged });
  }
  report.trustedBootstrapUnchanged = await product.installedProductContentMatches({ ...setup.installations[0], installedRoot: bootstrapRoot });
  assert.equal(report.trustedBootstrapUnchanged, true);
  await mkdir(scratch);
  const consumer = setup.installations.find(install => install.packageName === '@abi5-tests/sandbox-uat');
  const installedRoot = join(scratch, 'consumer-copy');
  await cp(consumer.installedRoot, installedRoot, { recursive: true, force: false, errorOnExist: true });
  const controlled = { ...consumer, installedRoot };
  const manifestPath = join(installedRoot, 'product-toolchain-manifest.json');
  const packagePath = join(installedRoot, 'package.json');
  const manifestBefore = await readFile(manifestPath);
  const packageBefore = await readFile(packagePath);
  const immutableCoordinates = { installId: consumer.installId, productContentDigest: consumer.productContentDigest,
    manifestDigest: consumer.manifestDigest, admissionEventRef: consumer.admissionEventRef };
  const baseline = await product.installedProductContentMatches(controlled);
  assert.equal(baseline, true);
  report.controlledCopyChecks.push({ phase: 'baseline', contentMatches: baseline });

  const target = join(installedRoot, 'build/semantics.mjs');
  const original = await readFile(target);
  await writeFile(target, Buffer.concat([original, Buffer.from('\n// Reviewer-controlled physical payload mutation.\n')]));
  const changed = await product.installedProductContentMatches(controlled);
  assert.equal(changed, false);
  assert.deepEqual(await readFile(manifestPath), manifestBefore);
  assert.deepEqual(await readFile(packagePath), packageBefore);
  report.controlledCopyChecks.push({ phase: 'payload-changed', contentMatches: changed,
    manifestBytesUnchanged: true, packageIdentityBytesUnchanged: true, immutableCoordinates,
    changedPath: 'build/semantics.mjs', beforeDigest: product.sha256Bytes(original), afterDigest: await product.sha256File(target) });
  await writeFile(target, original);
  assert.equal(await product.installedProductContentMatches(controlled), true);

  const extra = join(installedRoot, 'build/reviewer-extra-file.txt');
  await writeFile(extra, 'Controlled extra inventory member\n', { flag: 'wx' });
  const added = await product.installedProductContentMatches(controlled);
  assert.equal(added, false);
  assert.deepEqual(await readFile(manifestPath), manifestBefore);
  report.controlledCopyChecks.push({ phase: 'extra-payload-member', contentMatches: added,
    manifestBytesUnchanged: true, immutableCoordinates, extraPath: 'build/reviewer-extra-file.txt' });
  await rm(extra);
  assert.equal(await product.installedProductContentMatches(controlled), true);

  const environmentAfter = abg.projectExactPrefixWorkspaceEnvironment(close.prefix, setup.workspaceBinding);
  assert.equal(product.sha256Canonical(environmentBefore), product.sha256Canonical(environmentAfter));
  assert.deepEqual(await readFile(eventPath), eventBytes);
  report.admittedInstallProjectionUnchanged = true;
  report.eventPrefixBytesUnchanged = true;
  report.copyIsNotAnAdmittedInstall = true;
  report.genuineArchiveRunOrCCallEvents = abg.readRuntimeEventsAtDurablePrefix(close.prefix)
    .filter(event => /^run_|^c_call_/u.test(event.kind)).length;
  report.disposition = 'satisfied_controlled_physical_checker_discriminator';
} finally {
  await rm(scratch, { recursive: true, force: true });
}
report.scratchCopyRemoved = true;
console.log(JSON.stringify(report, null, 2));
