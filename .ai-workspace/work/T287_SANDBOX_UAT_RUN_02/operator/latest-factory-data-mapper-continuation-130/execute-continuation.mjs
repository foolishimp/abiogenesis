import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
console.log(JSON.stringify({stage:'continuation_dispatch',recorderPID:process.pid,frozenLauncher:join(root,'launch.mjs'),sourceNone:false,physicalCopy:false}));
const result=await commandRecorder(root,{timeoutMs:19260000,maxOutputBytes:536870912})('continuation-outer','/opt/homebrew/bin/node',[join(root,'launch.mjs')],{cwd:root});
console.log(JSON.stringify({stage:'continuation_outer_closed',exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure}));
process.exitCode=result.exitCode??1;
