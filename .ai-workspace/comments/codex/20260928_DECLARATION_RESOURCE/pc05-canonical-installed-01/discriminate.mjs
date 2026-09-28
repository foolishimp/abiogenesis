// One existing installed owner lifetime; no event writer, Run or provider call.
import assert from 'node:assert/strict';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const D = import.meta.dirname;
const read = async p => JSON.parse(await readFile(p, 'utf8'));
const save = (name, value) => writeFile(join(D, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const selection = await read(join(D, 'selection.json'));
const core = await read(selection.coreRecord);
const recovery = await read(selection.recoveryRecord);
assert.equal(recovery.result.kind, 'abg_event_resource_recovery_receipt');
assert.equal(recovery.result.outcome.kind, 'recovered');
const handoff = recovery.result.outcome.closeHandoff;
assert.equal(handoff.prefix.coordinateDigest, selection.expectedCoordinate);
const log = fileURLToPath(handoff.prefix.eventLogRef);
const before = await stat(log);
assert.equal(before.size, handoff.prefix.prefixLength);
assert.equal(before.dev, handoff.prefix.storeIdentity.device);
assert.equal(before.ino, handoff.prefix.storeIdentity.inode);
const phases = [];
async function phase(name, operation) {
  await save(name + '-start.json', { name, at: new Date().toISOString(), memory: process.memoryUsage() });
  const start = performance.now();
  try {
    const value = await operation();
    const result = { name, elapsedMs: performance.now() - start, status: 'returned', memory: process.memoryUsage() };
    phases.push(result); await save(name + '-end.json', result);
    return value;
  } catch (error) {
    const result = { name, elapsedMs: performance.now() - start, status: 'threw',
      error: { name: error.name, message: error.message, stack: error.stack }, memory: process.memoryUsage() };
    phases.push(result); await save(name + '-end.json', result); throw error;
  }
}
const { product, abg } = await phase('imports', async () => {
  const pkg = await read(join(core.packageRoot, 'package.json'));
  const load = async name => {
    const entry = pkg.exports['./' + name];
    return import(pathToFileURL(join(core.packageRoot, typeof entry === 'string' ? entry : entry.import)).href);
  };
  return { product: await load('product'), abg: await load('abg') };
});
let acquired = null, closed = false, result, primaryError, closeError, cleanupError;
try {
  await phase('acquisition', () => {
    const outcome = abg.acquireAbgEventResource({ kind: 'reopen_abg_event_resource', schemaVersion: '5.0.0',
      closeHandoff: handoff, handoffDigest: product.sha256Canonical(handoff) });
    if (outcome.kind === 'acquired_abg_event_resource') acquired = outcome.resource;
    assert.equal(outcome.kind, 'acquired_abg_event_resource', JSON.stringify(outcome.kind === 'acquired_abg_event_resource' ? outcome.kind : outcome));
    assert.deepEqual(acquired.entryPrefix, handoff.prefix);
  });
  const prefixes = await phase('prefix-selection', () =>
    abg.projectRuntimePrefixesAtDurablePrefix(acquired.entryPrefix, selection.runId));
  assert.equal(prefixes.authorityPrefix.events.length, selection.expectedEventCount);
  const view = await phase('run-projection', () =>
    abg.projectRunSemanticReplayProjection(prefixes.authorityPrefix, selection.runId, acquired.entryPrefix));
  assert.equal(view.runId, selection.runId);
  assert.equal(view.lifecycle.runClosed, false);
  assert.equal(view.lifecycle.runStopped, false);
  result = { kind: 'installed_owner_projection_discriminator', scope: 'No complete Public or native Run claim',
    core: core.basis, entryPrefix: acquired.entryPrefix, authorityEvents: prefixes.authorityPrefix.events.length,
    runId: view.runId, eventCount: view.eventCount, runtimeStatus: view.runtimeStatus,
    lifecycle: view.lifecycle, viewRef: view.viewRef, viewDigest: view.viewDigest,
    physicalCoordinates: view.physicalCoordinates };
} catch (error) {
  primaryError = { name: error.name, message: error.message, stack: error.stack };
} finally {
  if (acquired) {
    try {
      const receipt = await phase('close', () => {
        const receipt = abg.closeAbgEventResource(acquired, abg.selectHeldEventStoreDurablePrefix(acquired.store));
        closed = true;
        return receipt;
      });
      await save('close-receipt.json', receipt);
      assert.deepEqual(receipt.closeHandoff.prefix, handoff.prefix);
    } catch (error) {
      closeError = { name: error.name, message: error.message, stack: error.stack };
      if (!closed) {
        try { abg.abandonAbgEventResource(acquired); }
        catch (error) { cleanupError = { name: error.name, message: error.message, stack: error.stack }; }
      }
    }
  }
}
const after = await stat(log);
assert.equal(after.size, before.size); assert.equal(after.dev, before.dev); assert.equal(after.ino, before.ino);
await save('result.json', { result: result ?? null, primaryError: primaryError ?? null,
  closeError: closeError ?? null, cleanupError: cleanupError ?? null, closed, phases, resourceUsage: process.resourceUsage() });
if (primaryError || closeError || !closed) process.exitCode = 1;
console.log(JSON.stringify({ status: process.exitCode ? 'failed' : 'returned', closed, phases }));
