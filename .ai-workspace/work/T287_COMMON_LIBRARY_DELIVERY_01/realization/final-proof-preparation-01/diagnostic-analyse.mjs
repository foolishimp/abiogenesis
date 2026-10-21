#!/usr/bin/env node
// Pure trace reduction exported for construction checks; CLI reads only a closed diagnostic root.
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile,lstat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export function traceSummary(events){
  const channels={asyncRead:{calls:0,bytes:0,errors:0,unsized:0},asyncWrite:{calls:0,bytes:0,errors:0,unsized:0},syncRead:{calls:0,bytes:0,errors:0,unsized:0},syncWrite:{calls:0,bytes:0,errors:0,unsized:0}};
  const otherNames={};
  for(const e of events){
    const categories=String(e.cat??'').split(','),async=categories.includes('node.fs.async'),sync=categories.includes('node.fs.sync');
    if(!async&&!sync)continue;
    if(!['e','E'].includes(e.ph))continue;
    let channel,field;
    if(async&&e.name==='read'){channel='asyncRead';field='result';}
    else if(async&&e.name==='write'){channel='asyncWrite';field='result';}
    else if(sync&&e.name==='fs.sync.read'){channel='syncRead';field='bytesRead';}
    else if(sync&&e.name==='fs.sync.write'){channel='syncWrite';field='bytesWritten';}
    else {otherNames[e.name]=(otherNames[e.name]??0)+1;continue;}
    const x=channels[channel],n=e.args?.[field];x.calls++;
    if(Number.isSafeInteger(n)){if(n>=0)x.bytes+=n;else x.errors++;}else x.unsized++;
  }
  return {channels,otherNames,units:'bytes only for nonnegative explicit native completion fields',
    noGlobalTotal:true,scope:'Node native trace read/write completion channels. No filesystem byte estimate from string lengths, stat sizes, requests, copyfile metadata or negative errors. Unsized includes native UTF-8 fast paths. Native trace includes preflight/evidence/observer IO; observer output bytes are separate overhead, not subtracted.'};
}
async function main(){
  assert.equal(process.argv.length,3);const root=resolve(process.argv[2]);
  const names=(await readdir(root)).sort(),traces=[],processes=[];let traceBytes=0,observerRecordBytes=0;
  for(const name of names){
    if(/^fs-\d+-\d+\.json$/u.test(name)){const b=await readFile(join(root,name));traceBytes+=b.length;const parsed=JSON.parse(b);traces.push({name,bytes:b.length,...traceSummary(parsed.traceEvents)});}
    if(/^process-\d+\.json$/u.test(name)){const b=await readFile(join(root,name));observerRecordBytes+=b.length;processes.push(JSON.parse(b));}
  }
  const bad=processes.filter(x=>x.probeErrors.length!==0);
  const summary={kind:'t287_passive_diagnostic_summary',status:bad.length?'probe_failure':'observations_only',traces,processes,traceBytes,observerRecordBytes,
    failures:bad.map(x=>({pid:x.pid,probeErrors:x.probeErrors})),
    requiredSeparateObservations:['original lane result/oracle and fresh-read prefix conservation','same producer-bound output correspondence as endpoint','closed footprint by root and du -sk','raw time -l and parent/child scopes','loaded emitted-body pins and unmatched child edges','unobserved counters are not zero; no speed or heap threshold']};
  assert.ok(traces.length&&processes.length,'missing diagnostic process/trace evidence');
  await writeFile(join(root,'diagnostic-summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
