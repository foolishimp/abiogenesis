import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const archive=join(base,'setup-001/resources/archives');
const rows=[];
for(const name of (await readdir(archive)).filter(x=>x.endsWith('-stdout.log'))){
 const file=join(archive,name), text=await readFile(file,'utf8');let last=null,init=null;
 for(const line of text.split('\n')){try{const x=JSON.parse(line);if(x.type==='result')last=x;if(x.type==='system'&&x.subtype==='init')init=x;}catch{}}
 rows.push({file:name,bytes:(await stat(file)).size,model:init?.model??null,closed:!!last,cost:last?.total_cost_usd??null,turns:last?.num_turns??null,error:last?.is_error??null,reason:last?.terminal_reason??last?.subtype??null});
}
const events=(await readFile(join(base,'setup-001/resources/events/runtime.events.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x));
const compact=events.slice(-1).map(x=>({ordinal:x.admissionOrdinal,time:x.eventTime,kind:x.kind,run:x.runId,actor:x.payload?.actorRef??null,graph:x.graphFunctionRef??null}));
console.log(JSON.stringify({at:new Date().toISOString(),reportedCostUsd:rows.reduce((s,r)=>s+(r.cost??0),0),providerProcesses:rows.length,open:rows.filter(x=>!x.closed).length,active:rows.filter(x=>!x.closed),lastResult:events.filter(e=>e.kind==='c_call_result_admitted').slice(-1).map(e=>({ordinal:e.admissionOrdinal,resultClass:e.payload.resultClass,valueKind:e.payload.value?.kind,diagnostic:e.payload.value?.diagnosticRef??null})),lastProgress:events.filter(e=>!['runtime_activity_probe_observed','actor_process_stdout_observed'].includes(e.kind)).slice(-1).map(e=>({ordinal:e.admissionOrdinal,time:e.eventTime,kind:e.kind,graph:e.graphFunctionRef??null})),events:compact},null,2));
