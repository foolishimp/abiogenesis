// Root-selected read-only installed-owner measurement. No Public/provider/effect call.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
const selection=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const side=process.argv[3];assert(['old','new'].includes(side));
const subject=selection[side],prefix=JSON.parse(fs.readFileSync(subject.prefix.path,'utf8'));
const owner=await import(pathToFileURL(subject.eventStoreModule.path).href);
assert.equal(typeof owner.readRuntimeEventsAtDurablePrefix,'function');
assert.equal(typeof owner.projectRuntimeEventsAtDurablePrefix,'function');
const measure=fn=>{const cpu=process.cpuUsage(),start=performance.now();const events=fn();const elapsed=performance.now()-start,u=process.cpuUsage(cpu);return {events,measurement:{wallMs:elapsed,cpuMs:(u.user+u.system)/1000,maxRssKiB:process.resourceUsage().maxRSS,eventCount:events.length,lastOrdinal:events.at(-1)?.admissionOrdinal??null}};};
const cold=measure(()=>owner.readRuntimeEventsAtDurablePrefix(prefix));
const warm=measure(()=>owner.projectRuntimeEventsAtDurablePrefix(prefix));
assert.equal(warm.events.length,cold.events.length);
console.log(JSON.stringify({kind:'installed_closed_prefix_resource_observation',side,fixture:selection.fixture,artifact:subject.artifact,installedRoot:subject.installedRoot,prefix:{bytes:prefix.prefixLength,digest:prefix.prefixDigest},cold:{operation:'readRuntimeEventsAtDurablePrefix',...cold.measurement},warm:{operation:'projectRuntimeEventsAtDurablePrefix after established read',...warm.measurement},limits:['Fresh process per runtime; same fixture and equivalent admitted case must be selected separately','Cold and warm use different existing owner operations; do not label warm project as another cold read','PeakRSS is process-wide, not an incremental warm allocation','Module acquisition and external custody hashing are excluded from the timed owner calls','No provider/Public/event append or new runtime admission performed by this reader']}));
