import { appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [mode, root, frozenTenant] = process.argv.slice(2);
const log = value => appendFileSync(join(root, 'host-events.jsonl'), JSON.stringify({at:process.hrtime.bigint().toString(),...value})+'\n');
process.on('uncaughtExceptionMonitor', (error, origin) => log({event:'uncaughtExceptionMonitor',origin,name:error.name,code:error.code??null,errno:error.errno??null,syscall:error.syscall??null,message:error.message,stack:error.stack}));
process.on('exit', code => log({event:'host-exit',code,pid:process.pid}));
const actualKill = process.kill.bind(process);
process.kill = (pid, signal) => {
  log({event:'os-signal',pid,signal});
  try { return actualKill(pid,signal); }
  catch(error) { log({event:'os-signal-error',pid,signal,code:error.code??null}); throw error; }
};
const load = name => import(pathToFileURL(join(frozenTenant,'build/code/src',name+'.js')).href);
const { runWorkerTransport } = await load('abg/worker_transport');
const { constructKnownWorkerTransportContract } = await load('abg/transport_contracts');
const contract = constructKnownWorkerTransportContract('claude', { command: process.execPath,
  prefixArgs: [join(import.meta.dirname,'fixture-child.mjs'),mode,root], environment:{} });
log({event:'host-start',mode,pid:process.pid,node:process.version,contract,promptBytes:8388608});
try {
  const result = await runWorkerTransport({contract,prompt:'x'.repeat(8388608),lane:'worker_executes',cwd:root,
    archiveRoot:join(root,'archive'),label:'stdin-probe',timeoutMs:1000,absoluteTimeoutMs:2000,terminationGraceMs:100,environment:{},
    observer:{onProcessStarted:pid=>log({event:'child-started',pid}),onProcessExited:(status,signal)=>log({event:'child-exit',status,signal}),
      onSignalRequested:signal=>log({event:'signal-requested',signal}),onTimeoutObserved:timeoutClass=>log({event:'timeout',timeoutClass}),
      onTerminationUnconfirmed:()=>log({event:'scope-unconfirmed'}),onStdoutObserved:()=>true}});
  writeFileSync(join(root,'owner-return.json'),JSON.stringify(result));log({event:'owner-return',disposition:result.disposition});
} catch (error) {
  writeFileSync(join(root,'owner-rejection.json'),JSON.stringify({name:error.name,code:error.code??null,errno:error.errno??null,syscall:error.syscall??null,message:error.message,stack:error.stack}));
  log({event:'owner-rejection',name:error.name,code:error.code??null,message:error.message});
}

log({event:'host-survived-owner-settlement',pid:process.pid});
