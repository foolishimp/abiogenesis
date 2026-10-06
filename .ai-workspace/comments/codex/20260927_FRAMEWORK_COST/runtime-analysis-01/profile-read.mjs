// One cold, read-only owner acquisition and one semantic projection.
// Only this directory receives diagnostic files. No store acquisition or append.
import assert from 'node:assert/strict';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { Session } from 'node:inspector';
import { createHash } from 'node:crypto';
const out = import.meta.dirname;
const pc = '/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260927_PROGRAM_CONSTRUCTION/pc02-installed-02';
const core = join(pc, '../installed-04/products/core46/node_modules/@abiogenesis/typescript-tenant');
const load = async p => JSON.parse(await readFile(p, 'utf8'));
const closed = await load(join(pc, 'negative/result.json'));
assert.equal(closed.prefix.prefixLength, 991116806);
assert.equal(closed.prefix.coordinateDigest, 'sha256:89c2f4a21b18733de0da12a2485d0a9def2f01d0d5c4942c56a53b42bbc415a2');
const pkg = await load(join(core, 'package.json'));
const abg = await import(pathToFileURL(join(core, pkg.exports['./abg'].import)).href);
const before = await stat(fileURLToPath(closed.prefix.eventLogRef));
const session = new Session(); session.connect();
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (e, value) => e ? reject(e) : resolve(value)));
await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 1000 });
await post('Profiler.start');
const start = performance.now(), cpuStart = process.cpuUsage();
const marks = [{ stage: 'start', elapsedMs: 0 }];
const mark = stage => { const row = { stage, elapsedMs: performance.now() - start, memory: process.memoryUsage() }; marks.push(row); console.log(JSON.stringify(row)); };
const prefixes = abg.projectRuntimePrefixesAtDurablePrefix(closed.prefix, closed.run.ref);
mark('prefix_authenticated_and_selected');
const projection = abg.projectRunSemanticReplayProjection(prefixes.authorityPrefix, closed.run.ref, closed.prefix);
mark('semantic_projection_complete');
assert.equal(projection.viewDigest, closed.counts.projectionDigest);
const cpuUsage = process.cpuUsage(cpuStart);
const { profile } = await post('Profiler.stop'); session.disconnect();
await writeFile(join(out, 'owner-read.cpuprofile'), JSON.stringify(profile), { flag: 'wx' });
const statsStart = performance.now();
const events = prefixes.authorityPrefix.events;
const runEvents = events.filter(e => e.runId === closed.run.ref);
const byKind = {};
const bodies = [];
const bodyIds = new Map();
for (const e of runEvents) {
  const size = Buffer.byteLength(JSON.stringify(e));
  const row = byKind[e.kind] ??= { count: 0, logicalBytes: 0 };
  row.count++; row.logicalBytes += size;
  const slot = e.kind === 'basis_admitted' ? 'rawInputValue' : e.kind === 'c_call_result_admitted' ? 'value' : null;
  if (!slot || !Object.hasOwn(e.payload, slot)) continue;
  const value = e.payload[slot], serialized = JSON.stringify(value), bodyBytes = Buffer.byteLength(serialized);
  let sharedObjectId = bodyIds.get(value); if (sharedObjectId === undefined) { sharedObjectId = bodyIds.size + 1; bodyIds.set(value, sharedObjectId); }
  const topFields = value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v]) => [k, Buffer.byteLength(JSON.stringify(v))])) : {};
  bodies.push({ ordinal: e.admissionOrdinal, eventId: e.eventId, kind: e.kind, graphFunctionRef: e.graphFunctionRef ?? null,
    aggregateId: e.aggregateId, slot, bodyBytes, sharedObjectId, jsonSha256: createHash('sha256').update(serialized).digest('hex'), topFields });
}
const after = await stat(fileURLToPath(closed.prefix.eventLogRef));
assert.equal(after.size, before.size); assert.equal(after.mtimeMs, before.mtimeMs); assert.equal(after.ino, before.ino);
const result = { kind: 'pc02_read_only_runtime_cost_diagnostic', core, prefix: closed.prefix, run: closed.run,
  projectionDigest: projection.viewDigest, marks, cpuUsage, historyEventCount: events.length, runEventCount: runEvents.length,
  runLogicalBytes: Object.values(byKind).reduce((n,r) => n+r.logicalBytes,0), byKind, bodies,
  statisticsMs: performance.now()-statsStart, readCount: 1, semanticProjectionCount: 1, actors: 0, eventWrites: 0,
  storageBefore: { size: before.size, mtimeMs: before.mtimeMs, inode: before.ino }, storageAfter: { size: after.size, mtimeMs: after.mtimeMs, inode: after.ino } };
await writeFile(join(out, 'owner-read-result.json'), JSON.stringify(result, null, 2)+'\n', { flag: 'wx' });
console.log(JSON.stringify({ kind: result.kind, historyEventCount: events.length, runEventCount: runEvents.length, runLogicalBytes: result.runLogicalBytes,
  statisticsMs: result.statisticsMs, cpuUsage, output: join(out, 'owner-read-result.json') }));
