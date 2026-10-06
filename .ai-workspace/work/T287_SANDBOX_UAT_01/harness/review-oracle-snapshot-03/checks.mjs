// Independent bounded successor checks. Mutations are confined to disposable
// reviewer copies. No provider, Public invocation or runtime admission occurs.
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const reviewRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../../', import.meta.url));
const tenantRoot = join(repoRoot, 'build_tenants/abiogenesis/typescript');
const {
  acquireArchivedScenario, acquireScenario, digest, loadScenarios, snapshotScenario,
} = await import(pathToFileURL(join(tenantRoot, 'test_env/uat/scenarios.mjs')));
const { configuration } = await import(pathToFileURL(join(tenantRoot, 'test_env/uat/runner.mjs')));
const fixtures = await loadScenarios(join(tenantRoot, 'test_env/fixtures/sandbox-uat'));
const scratch = join(reviewRoot, 'scratch-' + randomUUID());
const result = {
  activation: 'T287_UAT_ORACLE_SNAPSHOT_REVIEW_03',
  frozenCandidateSHA256: '7a98cfef9c16122b5705adb1cc151f7a3674452a4fc7bd32034106a73df83930',
  classification: 'Provider-free independent identity/refusal checks; no native Run or UAT success evidence',
  checks: [],
};
async function sourceWorksite(root, selected) {
  await mkdir(root, { recursive: true });
  for (const source of selected.sources) {
    const target = join(root, source.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, source.bytes, { flag: 'wx' });
  }
}
try {
  await mkdir(scratch);
  for (const row of fixtures.rows) {
    const selected = await acquireScenario(fixtures.root, row);
    const runRoot = join(scratch, row.key);
    await mkdir(runRoot);
    const snapshot = await snapshotScenario(fixtures, selected, runRoot);
    const archived = await acquireArchivedScenario(snapshot);
    const worksiteRoot = join(runRoot, 'worksite');
    await sourceWorksite(worksiteRoot, selected);
    const module = await import(pathToFileURL(join(snapshot.root, archived.row.oracleModule)).href);
    const judgment = await module.evaluate({ worksiteRoot, runArchive: runRoot, source: archived.row, request: archived.request, events: [] });
    assert.notEqual(judgment.disposition, 'satisfied');
    result.checks.push({ id: 'archive-local-selected-case-' + row.key,
      completeSelectedInventory: snapshot.assets.length === row.acquisitionDigests.length,
      archivedManifestDigest: digest(await readFile(join(snapshot.root, 'scenarios.json'))),
      archivedCheckerDigest: digest(await readFile(join(snapshot.root, row.oracleModule))),
      disposition: judgment.disposition, originalSourceCriteria: judgment.criteria.filter(c => c.id.startsWith('original-source:')).length,
      admittedExperiments: 0, noApplicationAcceptanceCredit: true });
  }

  const row = fixtures.rows.find(row => row.key === 'basic-cli');
  const initial = await acquireScenario(fixtures.root, row);
  const ambientRoot = join(scratch, 'ambient');
  await mkdir(ambientRoot);
  await writeFile(join(ambientRoot, 'scenarios.json'), fixtures.manifestBytes, { flag: 'wx' });
  for (const asset of initial.assets) {
    const target = join(ambientRoot, asset.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, asset.bytes, { flag: 'wx' });
  }
  const ambient = await loadScenarios(ambientRoot);
  const selected = await acquireScenario(ambient.root, ambient.rows.find(r => r.key === row.key));
  await writeFile(join(ambientRoot, row.oracleModule), 'export function evaluate(){throw new Error("Reviewer altered ambient module must not execute");}\n');
  await writeFile(join(ambientRoot, row.oracleFile), '{}\n');
  await writeFile(join(ambientRoot, row.requestFile), '{}\n');
  await writeFile(join(ambientRoot, 'scenarios.json'), '{}\n');
  await assert.rejects(acquireScenario(ambientRoot, row), /Acquisition digest mismatch/);
  const runRoot = join(scratch, 'cached-snapshot');
  await mkdir(runRoot);
  const snapshot = await snapshotScenario(ambient, selected, runRoot);
  await rm(ambientRoot, { recursive: true });
  const archived = await acquireArchivedScenario(snapshot);
  assert.deepEqual(archived.request, initial.request);
  assert.deepEqual(await readFile(join(snapshot.root, 'scenarios.json')), fixtures.manifestBytes);
  const worksiteRoot = join(runRoot, 'worksite');
  await sourceWorksite(worksiteRoot, selected);
  const module = await import(pathToFileURL(join(snapshot.root, archived.row.oracleModule)).href);
  const inputs = { worksiteRoot, runArchive: runRoot, source: archived.row, request: archived.request, events: [] };
  const judgment = await module.evaluate(inputs);
  const originalModule = await import(pathToFileURL(join(fixtures.root, row.oracleModule)).href);
  assert.deepEqual(judgment, await originalModule.evaluate(inputs));
  result.checks.push({ id: 'HARNESS-01-ambient-drift-then-removal',
    ambientChanged: ['oracleModule', 'oracleFile', 'requestFile', 'scenarios.json'],
    ambientRemovedBeforeUse: true, actualArchivedJudgmentEqualsOriginal: true,
    archivedRequestEqualsInitialVerifiedBytes: true, freshAmbientAcquisitionRefused: true,
    disposition: 'satisfied', applicationJudgment: judgment.disposition });

  for (const [kind, assetPath] of [
    ['module', row.oracleModule], ['oracle', row.oracleFile], ['request', row.requestFile], ['manifest', 'scenarios.json'],
  ]) {
    const path = join(snapshot.root, assetPath);
    const originalBytes = await readFile(path);
    await writeFile(path, Buffer.concat([originalBytes, Buffer.from('\n')]));
    let diagnostic;
    await assert.rejects(acquireArchivedScenario(snapshot), error => {
      diagnostic = String(error);
      return /(?:Archived manifest digest mismatch|Acquisition digest mismatch)/u.test(diagnostic);
    });
    await writeFile(path, originalBytes);
    await acquireArchivedScenario(snapshot);
    result.checks.push({ id: 'archive-' + kind + '-drift-refused', disposition: 'satisfied', diagnostic,
      alteredBytesRejectedBeforeCheckerImport: true, restoredCopyReauthenticated: true });
  }

  const config = await configuration(join(tenantRoot, 'test_env/uat/config.example.json'));
  assert.ok(config.sourceCommit.trim().length > 0);
  for (const [label, sourceCommit] of [['omitted', undefined], ['blank', '   ']]) {
    const path = join(scratch, label + '-source-revision.json');
    await writeFile(path, JSON.stringify({ ...config, sourceCommit }) + '\n', { flag: 'wx' });
    await assert.rejects(configuration(path), /Explicit nonempty sourceCommit metadata/u);
    result.checks.push({ id: 'HARNESS-02-' + label + '-source-revision-refused', disposition: 'satisfied' });
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}
result.disposition = 'satisfied';
result.scratchCopiesRemoved = true;
console.log(JSON.stringify(result, null, 2));
