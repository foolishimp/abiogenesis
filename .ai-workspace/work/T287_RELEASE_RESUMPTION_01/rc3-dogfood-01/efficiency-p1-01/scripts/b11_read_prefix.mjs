import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const {readRuntimeEventsAtDurablePrefix}=await import(pathToFileURL(base+'/setup-006/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/event_store.js').href);
const prefix=JSON.parse(fs.readFileSync('/private/tmp/b11_closed_prefix.json','utf8'));
const c=process.cpuUsage(),t=performance.now(),events=readRuntimeEventsAtDurablePrefix(prefix),u=process.cpuUsage(c);
console.log(JSON.stringify({kind:'single_cold_installed_prefix_read',bytes:prefix.prefixLength,digest:prefix.prefixDigest,events:events.length,lastOrdinal:events.at(-1)?.admissionOrdinal,wallMs:performance.now()-t,cpuMs:(u.user+u.system)/1000,maxRssKiB:process.resourceUsage().maxRSS,limit:'single isolated read-only diagnostic with CPU profiling; not full native lifecycle'}));
