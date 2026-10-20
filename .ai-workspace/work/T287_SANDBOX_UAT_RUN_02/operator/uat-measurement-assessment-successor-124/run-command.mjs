import assert from 'node:assert/strict';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const phase=dirname(fileURLToPath(import.meta.url)),[stem,exe,...args]=process.argv.slice(2);
const command=commandRecorder(phase,{environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'},timeoutMs:300000,maxOutputBytes:1048576});
const r=await command(stem,exe,args,{cwd:'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript'});
console.log(JSON.stringify({stem,exitCode:r.exitCode,signal:r.signal,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure}));
assert.equal(r.exitCode,0);assert.equal(r.signal,null);assert(!r.timedOut&&!r.truncated&&!r.failure);
