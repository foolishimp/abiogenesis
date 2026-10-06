// Independent read-side counterexamples. All mutations are reviewer-owned
// disposable copies; no provider, runtime dispatch, or admitted evidence.
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const reviewRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = fileURLToPath(new URL('../../../../../', import.meta.url));
const tenantRoot = join(repoRoot, 'build_tenants/abiogenesis/typescript');
const fixtures = join(tenantRoot, 'test_env/fixtures/sandbox-uat');
const { acquireScenario, digest } = await import(pathToFileURL(join(tenantRoot, 'test_env/uat/scenarios.mjs')));
const { configuration } = await import(pathToFileURL(join(tenantRoot, 'test_env/uat/runner.mjs')));
const manifestBytes = await readFile(join(fixtures, 'scenarios.json'));
const row = JSON.parse(manifestBytes).scenarios.find(row => row.key === 'basic-cli');
const scratch = join(reviewRoot, 'scratch-' + randomUUID());
const result = {
  classification: 'Provider-free independent counterexamples over isolated copies; no UAT or runtime admission claim',
  sourceHarnessFreezeSHA256: 'a5ecafe61ef6a2c4f9ab247a29dbb8632e263f9d5531bd4f90f78c183f731d61',
  tests: [],
};
async function copyFixture(name) {
  const root = join(scratch, name);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, 'scenarios.json'), manifestBytes, { flag: 'wx' });
  for (const pin of row.acquisitionDigests) {
    const target = join(root, pin.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await readFile(join(fixtures, pin.path)), { flag: 'wx' });
  }
  return root;
}
try {
  const moduleRoot = await copyFixture('module');
  await acquireScenario(moduleRoot, row);
  const modulePath = join(moduleRoot, row.oracleModule);
  const alteredModule = 'export async function evaluate(){return {disposition:"indeterminate",criteria:[],unresolvedCriteria:["reviewer-drift"],reason:"Reviewer-only altered module was executed"};}\n';
  await writeFile(modulePath, alteredModule);
  const module = await import(pathToFileURL(modulePath).href);
  const observed = await module.evaluate({});
  assert.equal(observed.reason, 'Reviewer-only altered module was executed');
  await assert.rejects(acquireScenario(moduleRoot, row), /Acquisition digest mismatch/);
  result.tests.push({
    id: 'post-acquisition-module-drift', initialAcquisitionAuthenticated: true,
    expectedDigest: row.acquisitionDigests.find(pin => pin.path === row.oracleModule).digest,
    consumedDigest: digest(await readFile(modulePath)), alteredModuleExecuted: true,
    observed, freshAcquisitionWouldRefuse: true, disposition: 'falsified',
    sourceRoute: 'runner.mjs:157 authenticates; runner.mjs:184 imports after native work without reauthentication',
  });

  const assetRoot = await copyFixture('asset');
  const selected = await acquireScenario(assetRoot, row);
  const oraclePath = join(assetRoot, row.oracleFile);
  const oracle = JSON.parse(await readFile(oraclePath, 'utf8'));
  const addedPath = 'reviewer-only-unbound-obligation.md';
  oracle.requiredArtifacts.push(addedPath);
  await writeFile(oraclePath, JSON.stringify(oracle) + '\n');
  const worksiteRoot = join(scratch, 'worksite');
  await mkdir(worksiteRoot, { recursive: true });
  for (const member of selected.sources) {
    const target = join(worksiteRoot, member.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, member.bytes, { flag: 'wx' });
  }
  const unchangedModule = await import(pathToFileURL(join(assetRoot, row.oracleModule)).href);
  const judgment = await unchangedModule.evaluate({ worksiteRoot, runArchive: scratch, source: row, request: selected.request, events: [] });
  const insertedCriterion = judgment.criteria.find(criterion => criterion.id === 'artifact:' + addedPath);
  assert.equal(insertedCriterion?.disposition, 'unmet');
  await assert.rejects(acquireScenario(assetRoot, row), /Acquisition digest mismatch/);
  result.tests.push({
    id: 'post-acquisition-oracle-asset-drift', initialAcquisitionAuthenticated: true,
    expectedDigest: row.acquisitionDigests.find(pin => pin.path === row.oracleFile).digest,
    consumedDigest: digest(await readFile(oraclePath)), unpinnedCriterionConsumed: insertedCriterion,
    overallDisposition: judgment.disposition, freshAcquisitionWouldRefuse: true, disposition: 'falsified',
    sourceRoute: 'independent-oracle.mjs:135-139 rereads live manifest/oracle rather than authenticated acquisition bytes',
  });

  const configured = await configuration(join(tenantRoot, 'test_env/uat/config.example.json'));
  delete configured.sourceCommit;
  const configurationPath = join(scratch, 'source-revision-omitted.json');
  await writeFile(configurationPath, JSON.stringify(configured) + '\n', { flag: 'wx' });
  const accepted = await configuration(configurationPath);
  assert.equal(accepted.sourceCommit, undefined);
  result.tests.push({ id: 'accepted-missing-source-revision', acceptedConfiguration: true,
    projectedArchiveSourceCommit: accepted.sourceCommit ?? null, candidateArchiveIdentityStillPresent: accepted.package.sha256,
    disposition: 'falsified', sourceRoute: 'configuration() accepts omission; runner.mjs:153 records null' });
} finally {
  await rm(scratch, { recursive: true, force: true });
}
console.log(JSON.stringify(result, null, 2));
