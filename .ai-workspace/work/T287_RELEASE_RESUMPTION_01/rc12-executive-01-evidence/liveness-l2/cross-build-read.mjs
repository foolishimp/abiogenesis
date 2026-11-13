// RC12 L2 scratch (untracked). Reads one recorded store with the modules of one
// build root and prints, per recorded Run, the native liveness read (one row per
// invocation) and the replay-guard digest that persisted source bases cite.
// usage: node cross-build-read.mjs <build root> <store scratch> <label>
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [root, scratch, label] = process.argv.slice(2);
const load = path => import(pathToFileURL(join(root, 'build/code/src', path + '.js')).href);
const [store, prefixOwner, liveness, replay, immutable] = await Promise.all(
  ['abg/event_store', 'abg/event_prefix', 'abg/runtime_liveness', 'abg/replay', 'shared/immutable'].map(load));
const outcome = async mode => JSON.parse(await readFile(join(scratch, mode + '-outcome.json'), 'utf8'));
const last = await outcome('hard_cap');
const events = immutable.deepFreeze(store.readRuntimeEventsAtDurablePrefix(last.resources.eventResource.closeHandoff.prefix));
const prefix = prefixOwner.selectValidatedRuntimeEventPrefix(events);
const runs = {};
for (const mode of ['blocked', 'hard_cap']) {
  const runId = (await outcome(mode)).ownerOutput.value.run.ref;
  const read = liveness.projectNativeLivenessRead(prefix, runId);
  const guard = replay.projectRuntimeReplayGuard(prefixOwner.selectValidatedRuntimeEventPrefix(events, { runId }), prefix);
  runs[mode] = { runId, runtimeStatus: guard.runtimeStatus, replayDigest: guard.replayDigest,
    invocations: read.invocations.map(p => ({ occurrence: p.scope.actorInvocationRef !== null ? 'actor' : p.scope.cCallRef !== null ? 'c_call' : 'frame',
      ref: p.scope.actorInvocationRef ?? p.scope.cCallRef ?? p.scope.frameId, disposition: p.disposition.disposition, reason: p.disposition.reason,
      externallyInterrupted: p.externallyInterrupted, leaseExpired: p.leaseExpired })) };
}
const out = { label, root, events: events.length, runs };
await writeFile(join(import.meta.dirname, 'cross-build-' + label + '.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ label, events: events.length, ...Object.fromEntries(Object.entries(runs).map(([m, r]) => [m, { status: r.runtimeStatus, replayDigest: r.replayDigest,
  dispositions: r.invocations.map(i => i.occurrence + ':' + i.disposition + '/' + i.reason) }])) }));
