import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha, SOURCE_FILES, loadProduct, exposeOwners, coldBasis, commandTask, subjectFor,
  errorRecord, footprint, assertAbsent, verifyRows, verifyFrozenStage } from './owner-support.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const [mode, configPath, grantPath] = process.argv.slice(2);
const configBytes = await fs.readFile(configPath);
const config = JSON.parse(configBytes);
const inputBytes = await fs.readFile(join(here, 'inputs.json'));
const inputs = JSON.parse(inputBytes);
assert.equal(sha(inputBytes), config.inputsSha256);
assert.equal(config.status, 'NOT_GRANTED');
assert.equal(process.execPath, config.node);
assert.deepEqual(config.caseIds, ['PERSIST', 'PUBLISH', 'RACE', 'DEST-SYMLINK', 'DEST-HARDLINK',
  'TEMP-PARTIAL', 'SNAPSHOT', 'SNAPSHOT-STALE', 'SNAPSHOT-SYMLINK', 'SNAPSHOT-DIRECTORY']);
await verifyFrozenStage(config, inputs);
await assertAbsent(config.scratchRoot);
await assertAbsent(config.evidenceRoot);
for (const root of [config.scratchRoot, config.evidenceRoot]) {
  assert.equal(resolve(root), root);
  assert.equal(dirname(root), '/private/tmp');
  assert.equal(await fs.realpath(dirname(root)), dirname(root));
}
const product = await loadProduct(config.stageRoot);
const owners = await exposeOwners(config.stageRoot);
for (const name of ['persistExactFile', 'publishCreateOnly', 'materializeSnapshot']) assert.equal(typeof owners[name], 'function');

if (mode === 'prepare') {
  const basis = coldBasis(product, join(config.scratchRoot, 'SNAPSHOT'));
  const observedFiles = SOURCE_FILES.map(row => {
    const subject = subjectFor(product, basis, row.relativePath);
    assert.equal(subject.kind, 'worksite_subject');
    const bytes = Buffer.from(row.text);
    const observation = product.constructWorksiteObservation({ subject, state: 'file',
      fileIdentity: `preparation-only://no-physical-observation/${row.relativePath}`,
      fileDigest: product.sha256Bytes(bytes), byteLength: bytes.byteLength });
    assert.equal(observation.kind, 'worksite_observation');
    return { subject, observation };
  });
  const task = commandTask(product, basis, observedFiles);
  const malformed = subjectFor(product, basis, '../outside.txt');
  assert.equal(malformed.kind, 'worksite_effect_refusal');
  assert.equal(malformed.code, 'invalid_relative_path');
  assert.equal(product.executableWorksiteCommandIdentityPrefix(task, 'snapshot'), 'worksite-command-snapshot://abiogenesis');
  assert.deepEqual(product.executableWorksiteCommandSources(task), task.protectedObservations);
  await assertAbsent(config.scratchRoot); await assertAbsent(config.evidenceRoot);
  console.log(JSON.stringify({ kind: 'E04_preparation_receipt', status: 'PREPARATION_READY',
    configurationSha256: sha(configBytes), inputSha256: sha(inputBytes), node: process.execPath,
    nodeVersion: process.version, platform: process.platform, arch: process.arch,
    ownerCallables: ['persistExactFile', 'publishCreateOnly', 'materializeSnapshot'], exposure: owners.exposure,
    construction: { actualProductConstructors: true, task, malformedSubject: malformed,
      observationPremise: 'synthetic preparation file identity, not a physical observation or admitted runtime fact' },
    physicalCaseExecutions: 0, fixtureRootsCreated: 0, nativeOrInstalledCredit: false }, null, 2));
} else if (mode === 'run') {
  assert.ok(grantPath, 'a separate Executive execution grant is required');
  const grantBytes = await fs.readFile(grantPath), grant = JSON.parse(grantBytes);
  assert.equal(grant.kind, 'E04_retained_owner_execution_grant'); assert.equal(grant.status, 'GRANTED');
  assert.equal(grant.configurationSha256, sha(configBytes));
  assert.equal(grant.preparationFreezeSha256, sha(await fs.readFile(join(here, 'freeze.json'))));
  assert.equal(typeof grant.executiveActivation, 'string'); assert.ok(grant.executiveActivation.length > 0);
  assert.equal(grant.stageFreezeSha256, config.stageFreezeSha256);
  assert.equal(grant.scratchRoot, config.scratchRoot); assert.equal(grant.evidenceRoot, config.evidenceRoot);
  assert.deepEqual(grant.caseIds, config.caseIds); assert.equal(grant.hostBudgetMs, 30000);
  assert.equal(grant.retention, 'all roots and first failure; no retry or deletion');
  const freeze = JSON.parse(await fs.readFile(join(here, 'freeze.json'), 'utf8'));
  await verifyRows(here, freeze.files);
  await fs.mkdir(config.evidenceRoot); // First physical fixture/evidence effect: only after grant and pins.
  const save = async (name, value) => fs.writeFile(join(config.evidenceRoot, name), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
  const completed = [], startedAt = process.hrtime.bigint();
  let currentCase = null, currentRoot = null, stepOrdinal = 0;
  await save('activation.json', { config, grant, configurationSha256: sha(configBytes), grantSha256: sha(grantBytes),
    host: { pid: process.pid, ppid: process.ppid, execPath: process.execPath, version: process.version },
    closure: 'Host exit must be observed by the enclosing executor; this file is not exit evidence.' });
  async function step(label, input, fn, check) {
    let value, error;
    try { value = await fn(); } catch (caught) { error = caught; }
    const rows = await footprint(currentRoot);
    const observation = { caseId: currentCase, step: label, input, disposition: error ? 'rejected' : 'fulfilled',
      output: value === undefined ? null : value, error: error ? errorRecord(error) : null, footprint: rows };
    await save(`${currentCase}-${String(++stepOrdinal).padStart(2, '0')}.json`, observation);
    check({ value, error, rows });
    return { value, error, rows };
  }
  const file = (rows, path) => rows.find(row => row.relativePath === path);
  const exact = (rows, path, text) => {
    const row = file(rows, path); assert.equal(row?.kind, 'file');
    assert.equal(row.base64, Buffer.from(text).toString('base64')); return row;
  };
  const noTemp = rows => assert.equal(rows.some(row => row.relativePath.includes('.tmp-')), false);
  const sameFile = (a, b) => assert.deepEqual([b.dev, b.ino, b.nlink, b.byteLength, b.sha256], [a.dev, a.ino, a.nlink, a.byteLength, a.sha256]);
  const rejected = code => ({ error }) => assert.equal(error?.code, code);
  const bytes = Buffer.from('exact helper bytes\n');
  async function snapshotFixture(count = 2) {
    const basis = coldBasis(product, currentRoot);
    await fs.mkdir(join(basis.canonicalRoot, 'src'), { recursive: true });
    const observedFiles = [];
    for (const row of SOURCE_FILES.slice(0, count)) {
      await fs.writeFile(join(basis.canonicalRoot, row.relativePath), row.text, { flag: 'wx' });
      const subject = subjectFor(product, basis, row.relativePath);
      const observation = await product.observeWorksiteSubject(basis.workspaceAuthorityBasis, basis.workspaceBinding, subject);
      assert.equal(observation.kind, 'worksite_observation'); assert.equal(observation.state, 'file');
      observedFiles.push({ subject, observation });
    }
    const task = commandTask(product, basis, observedFiles);
    return { basis, task, snapshotRoot: join(currentRoot, 'snapshot') };
  }
  try {
    await fs.mkdir(config.scratchRoot);
    for (const caseId of config.caseIds) {
      currentCase = caseId; stepOrdinal = 0; currentRoot = join(config.scratchRoot, caseId);
      await fs.mkdir(currentRoot);
      const destination = join(currentRoot, 'result.json');
      if (caseId === 'PERSIST') {
        const target = join(currentRoot, 'parents', 'exact.txt'), text = 'persist exact bytes\n';
        let original;
        await step('created', { path: target, text }, () => owners.persistExactFile(target, text), ({ value, error, rows }) => {
          assert.equal(error, undefined); assert.equal(value, 'created'); original = exact(rows, 'parents/exact.txt', text);
        });
        for (const [label, offer, result] of [['same', text, 'preserved'], ['different', 'different bytes\n', 'collision']]) {
          await step(label, { path: target, text: offer }, () => owners.persistExactFile(target, offer), ({ value, error, rows }) => {
            assert.equal(error, undefined); assert.equal(value, result); sameFile(original, exact(rows, 'parents/exact.txt', text));
          });
        }
      } else if (caseId === 'PUBLISH') {
        let original;
        await step('created', { destination, base64: bytes.toString('base64') }, () => owners.publishCreateOnly(destination, bytes), ({ value, error, rows }) => {
          assert.equal(error, undefined); assert.equal(value, undefined); original = exact(rows, 'result.json', bytes); assert.equal(original.nlink, 1); noTemp(rows);
        });
        await step('identical-collision', { destination, base64: bytes.toString('base64') }, () => owners.publishCreateOnly(destination, bytes), args => {
          rejected('EEXIST')(args); sameFile(original, exact(args.rows, 'result.json', bytes)); noTemp(args.rows);
        });
      } else if (caseId === 'RACE') {
        const competitor = 'competitor won\n', trace = [];
        const raced = await exposeOwners(config.stageRoot, { link: async (from, to) => {
          assert.equal(from, `${destination}.tmp-${process.pid}`); assert.equal(to, destination);
          trace.push({ event: 'link-entered', temporary: await footprint(currentRoot) });
          await Promise.resolve().then(() => fs.writeFile(destination, competitor, { flag: 'wx' }));
          trace.push({ event: 'competitor-created', footprint: await footprint(currentRoot) });
          try { return await fs.link(from, to); } catch (error) { trace.push({ event: 'actual-link-error', error: errorRecord(error) }); throw error; }
        } });
        await step('actual-link-race', { destination, base64: bytes.toString('base64'), competitor, trace },
          () => raced.publishCreateOnly(destination, bytes), args => {
            rejected('EEXIST')(args); exact(args.rows, 'result.json', competitor); noTemp(args.rows);
            assert.deepEqual(trace.map(row => row.event), ['link-entered', 'competitor-created', 'actual-link-error']);
            sameFile(file(trace[1].footprint, 'result.json'), file(args.rows, 'result.json'));
          });
      } else if (caseId === 'DEST-SYMLINK' || caseId === 'DEST-HARDLINK') {
        const sentinel = join(currentRoot, 'sentinel.txt'), text = 'untouched sentinel\n';
        await fs.writeFile(sentinel, text, { flag: 'wx' });
        if (caseId === 'DEST-SYMLINK') await fs.symlink('sentinel.txt', destination);
        else await fs.link(sentinel, destination);
        const before = await footprint(currentRoot);
        await step('existing-link-collision', { destination, before }, () => owners.publishCreateOnly(destination, bytes), args => {
          rejected('EEXIST')(args); noTemp(args.rows);
          sameFile(file(before, 'sentinel.txt'), exact(args.rows, 'sentinel.txt', text));
          assert.deepEqual(file(args.rows, 'result.json'), file(before, 'result.json'));
        });
      } else if (caseId === 'TEMP-PARTIAL') {
        const fault = Object.assign(new Error('E04 controlled temporary write interruption'), { code: 'EIO' });
        const trace = [], temporaryPath = `${destination}.tmp-${process.pid}`;
        const partial = await exposeOwners(config.stageRoot, { writeFile: async (path, supplied, options) => {
          assert.equal(path, temporaryPath); assert.equal(options.flag, 'wx');
          await fs.writeFile(path, Buffer.from(supplied).subarray(0, 5), options);
          trace.push({ event: 'actual-five-byte-prefix-created', path, throwsDeclaredFault: true }); throw fault;
        } });
        let observedSameError = false;
        await step('partial-temporary', { destination, temporaryPath, prefixBase64: bytes.subarray(0, 5).toString('base64'), trace },
          async () => { try { return await partial.publishCreateOnly(destination, bytes); }
            catch (error) { observedSameError = error === fault; trace.push({ event: 'owner-rejected', sameErrorObject: observedSameError }); throw error; } }, args => {
            rejected('EIO')(args); assert.equal(observedSameError, true); assert.equal(file(args.rows, 'result.json'), undefined);
            exact(args.rows, `result.json.tmp-${process.pid}`, bytes.subarray(0, 5));
          });
      } else {
        const fixture = await snapshotFixture(['SNAPSHOT', 'SNAPSHOT-STALE'].includes(caseId) ? 2 : 1);
        const sourcePath = join(fixture.basis.canonicalRoot, SOURCE_FILES[0].relativePath);
        if (caseId === 'SNAPSHOT-STALE') await fs.writeFile(join(fixture.basis.canonicalRoot, SOURCE_FILES[1].relativePath), 'Second protected bytes\n');
        if (caseId === 'SNAPSHOT-SYMLINK') {
          await fs.writeFile(join(currentRoot, 'outside.txt'), 'outside sentinel\n', { flag: 'wx' });
          await fs.unlink(sourcePath); await fs.symlink(join(currentRoot, 'outside.txt'), sourcePath);
        }
        if (caseId === 'SNAPSHOT-DIRECTORY') { await fs.unlink(sourcePath); await fs.mkdir(sourcePath); }
        const before = await footprint(currentRoot);
        await step('materialize', { task: fixture.task, snapshotRoot: fixture.snapshotRoot, before },
          () => owners.materializeSnapshot(fixture.task, fixture.snapshotRoot), ({ value, error, rows }) => {
            for (const row of before.filter(row => row.kind === 'file')) sameFile(row, file(rows, row.relativePath));
            if (caseId === 'SNAPSHOT') {
              assert.equal(error, undefined);
              const expectedMembers = fixture.task.protectedObservations.map((row, ordinal) => ({
                kind: 'worksite_snapshot_member', schemaVersion: '5.0.0', ordinal, sourceMemberRef: row.sourceMemberRef,
                sourceObservationRef: row.observation.observationRef, sourceObservationDigest: row.observation.observationDigest,
                relativePath: SOURCE_FILES[ordinal].relativePath, byteLength: Buffer.byteLength(SOURCE_FILES[ordinal].text),
                digest: `sha256:${sha(Buffer.from(SOURCE_FILES[ordinal].text))}`,
              }));
              const digest = `sha256:${sha(Buffer.from(product.canonicalJson(expectedMembers)))}`;
              assert.deepEqual(value, { snapshotRef: `worksite-command-snapshot://abiogenesis/${digest.slice(7)}`, snapshotDigest: digest, snapshotMembers: expectedMembers });
              for (const row of SOURCE_FILES) exact(rows, `snapshot/${row.relativePath}`, row.text);
              assert.equal(rows.filter(row => row.kind === 'file' && row.relativePath.startsWith('snapshot/')).length, 2);
            } else {
              assert.equal(error?.name, 'TypeError'); assert.equal(value, undefined);
              const message = caseId === 'SNAPSHOT-STALE' ? 'snapshot source bytes differ from protected O1'
                : caseId === 'SNAPSHOT-SYMLINK' ? 'worksite path has a symlink or aliased component' : 'worksite path is not one file';
              assert.equal(error.message, message); assert.equal(file(rows, 'snapshot')?.kind, 'directory');
              if (caseId === 'SNAPSHOT-STALE') { exact(rows, 'snapshot/src/first.txt', SOURCE_FILES[0].text); assert.equal(file(rows, 'snapshot/src/second.txt'), undefined); }
              else assert.equal(rows.filter(row => row.relativePath.startsWith('snapshot/')).length, 0);
            }
          });
      }
      completed.push(caseId);
      await save(`${caseId}-passed.json`, { caseId, status: 'BOUNDED_OWNER_CASE_PASSED', observedSteps: stepOrdinal });
    }
    const finalFootprint = await footprint(config.scratchRoot);
    assert.ok(finalFootprint.length < config.maxFixtureNodes);
    assert.ok(finalFootprint.filter(row => row.kind === 'file').reduce((n, row) => n + row.byteLength, 0) < config.maxFixtureBytes);
    const result = { kind: 'E04_owner_population_result', status: 'OBSERVED_FINITE_PASS', completed,
      hostPid: process.pid, elapsedMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
      finalFootprint, cleanup: 'none; both roots retained', runtimeAdmission: false, nativeOrInstalledCredit: false,
      hostExitEvidence: 'pending enclosing executor observation' };
    await save('result.json', result); console.log(JSON.stringify(result));
  } catch (error) {
    let residue, residueError;
    try { residue = await footprint(config.scratchRoot); } catch (caught) { residueError = errorRecord(caught); }
    const failure = { kind: 'E04_owner_population_failure', status: 'STOP_FIRST_FAILURE', currentCase, completed,
      error: errorRecord(error), residue, residueError, cleanup: 'none; preserve all roots',
      hostExitEvidence: 'pending enclosing executor observation' };
    await save('failure.json', failure); console.error(JSON.stringify(failure)); process.exitCode = 1;
  }
} else throw new Error('mode must be prepare or run');
